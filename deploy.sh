#!/usr/bin/env bash
set -euo pipefail

# deploy.sh — Script de déploiement optimisé, sécurisé et extensible
# - builds in parallel (configurable)
# - avoids leaking FTP credentials to process list (uses temp lftp script with strict perms)
# - auto-detects build folders when "auto" is used
# - supports .deploy.env, .deploy.projects and positional args
# - safer git pull handling and optional CI fast mode
# - concise final output; removed project-specific noisy notes (F1)
#
# Usage:
#   FTP_USER=... FTP_PASS=... ./deploy.sh            # use .deploy.env or environment
#   ./deploy.sh "path/to/project1" "name:/abs/path:remote:build"
#   See variables below for tuning.

# --- Configurable options ---
BASE_URL="${BASE_URL-https://ryanfonseca.fr}"
LOG_FILE="${LOG_FILE-/tmp/deploy_$(date +%Y%m%d_%H%M%S).log}"
MAX_JOBS="${MAX_JOBS-3}"             # number of concurrent deploys
CI_FAST_MODE="${CI_FAST_MODE-false}" # if true, do a clean fast sync (no stash)
SEARCH_ROOT="${SEARCH_ROOT-.}"       # root for auto-scan
# ------------------------------

exec > >(tee -a "$LOG_FILE") 2>&1
printf "🟢 Début du déploiement — %s\n\n" "$(date)"

# Load .deploy.env if present (safe: ignore empty/comment lines), export variables
if [ -f ".deploy.env" ]; then
    # shellcheck disable=SC1091
    set -a
    # ignore blank and commented lines
    . <(grep -v '^\s*#' .deploy.env | sed '/^\s*$/d') 2>/dev/null || true
    set +a
fi

FTP_USER="${FTP_USER-}"
FTP_PASS="${FTP_PASS-}"
FTP_HOST="${FTP_HOST-ftp.cluster021.hosting.ovh.net}"

if [[ -z "$FTP_USER" || -z "$FTP_PASS" ]]; then
    cat <<'USAGE'
🔒 Veuillez définir FTP_USER et FTP_PASS (ou créez .deploy.env).
Exemple .deploy.env:
FTP_USER=youruser
FTP_PASS=yourpass
FTP_HOST=ftp.cluster021.hosting.ovh.net
USAGE
    exit 1
fi

# Create secure temporary lftp script to avoid exposing credentials in process list
LFTP_SCRIPT="$(mktemp)"
chmod 600 "$LFTP_SCRIPT"
cleanup() {
    rm -f "$LFTP_SCRIPT" 2>/dev/null || true
    # wait for background children to finish if any
    wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Common build folder candidates used for auto detection (ordered)
BUILD_CANDIDATES=("build" "dist" "public" "www" "out" "build/dist" "dist/build")

# Project list initialization (default can be set here)
PROJECT_LIST=(
    "Portfolio:/var/www/html/websites/react/mon-portfolio:mon-portfolio:build"
    "NBA Dashboard:/var/www/html/websites/react/nba-dashbord:nba_dashboard:nba_dashboard"
    "Spotify Album Finder:/var/www/html/websites/react/album_finder_spotify:spotify-finder:dist"
    "F1 Strategy Simulator:/var/www/html/websites/react/f1-strategy-simulator:f1-simulator:dist"
)

# Load projects from .deploy.projects
load_projects_from_file() {
    local file="$1"
    while IFS= read -r line || [ -n "$line" ]; do
        line="$(echo "$line" | sed 's/#.*//' | xargs)"
        [ -z "$line" ] && continue
        PROJECT_LIST+=("$line")
    done <"$file"
}

# Load projects from positional args
load_projects_from_args() {
    for arg in "$@"; do
        if [[ "$arg" == *":"* ]]; then
            PROJECT_LIST+=("$arg")
        else
            local lp="$arg"
            local name
            name=$(basename "$lp")
            PROJECT_LIST+=("$name:$lp:$name:auto")
        fi
    done
}

# Auto-scan projects (find package.json) up to depth 2 by default
auto_scan_projects() {
    local root="${SEARCH_ROOT-.}"
    while IFS= read -r -d $'\0' dir; do
        local name
        name=$(basename "$dir")
        PROJECT_LIST+=("$name:$dir:$name:auto")
    done < <(find "$root" -maxdepth 2 -type f -name package.json -print0 | xargs -0 -n1 dirname -z)
}

# Load projects (file -> args -> auto)
if [ -f ".deploy.projects" ]; then
    load_projects_from_file ".deploy.projects"
elif [ "$#" -gt 0 ]; then
    load_projects_from_args "$@"
else
    auto_scan_projects
fi

if [ ${#PROJECT_LIST[@]} -eq 0 ]; then
    echo "❌ Aucun projet trouvé. Fournissez .deploy.projects ou passez des chemins en argument."
    exit 1
fi

# Helpers
log_short() { printf "%s\n" "$*"; }
log_verbose() { printf "%s\n" "$*"; } # kept for possible future toggling

detect_build_folder() {
    local project_path="$1"
    local build_folder="$2"
    if [[ "$build_folder" != "auto" && -n "$build_folder" ]]; then
        printf "%s" "$build_folder"
        return 0
    fi

    # try known candidates (first found)
    for candidate in "${BUILD_CANDIDATES[@]}"; do
        if [ -d "$project_path/$candidate" ]; then
            printf "%s" "$candidate"
            return 0
        fi
    done

    # try common npm build outputs by inspecting package.json's "homepage" or typical dist
    if [ -f "$project_path/package.json" ]; then
        # try to see if "dist" exists after running build (not running build here)
        # fallback to 'build' then 'dist'
        if [ -d "$project_path/build" ]; then
            printf "build"
            return 0
        elif [ -d "$project_path/dist" ]; then
            printf "dist"
            return 0
        fi
    fi

    # last resort: return "build" (caller will check for existence)
    printf "build"
}

# deploy_project does everything for a single project (no output suppression)
deploy_project() {
    local project_name="$1"
    local project_path="$2"
    local remote_folder="$3"
    local build_folder_cfg="$4"

    if [ ! -d "$project_path" ]; then
        log_short "❌ $project_name: dossier introuvable: $project_path"
        return 2
    fi

    pushd "$project_path" >/dev/null || { log_short "❌ $project_name: impossible d'entrer dans $project_path"; return 2; }

    # detect build folder if requested
    local build_folder
    build_folder="$(detect_build_folder "$project_path" "$build_folder_cfg")"

    # optionally stash local changes unless CI_FAST_MODE
    if [[ "$CI_FAST_MODE" != "true" ]]; then
        git stash push --include-untracked -m "deploy-stash-$(date +%s)" >/dev/null 2>&1 || true
    fi

    # Prefer reproducible installs
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        # fetch + rebase with autostash to keep history tidy
        if ! git pull --rebase --autostash --quiet; then
            log_short "⚠️  $project_name: git pull a rencontré un problème. Tentative de récupération..."
            git fetch --quiet || true
            # If automatic fixes are possible, they would be implemented here.
            # For speed, fall back to a safe merge from origin/main if available
            git merge --no-edit origin/main >/dev/null 2>&1 || true
        fi
    fi

    # restore stash (best-effort)
    if [[ "$CI_FAST_MODE" != "true" ]]; then
        git stash pop --index >/dev/null 2>&1 || true
    fi

    # copy env if exists (kept out of repo)
    if [ -f ".env.production" ]; then
        cp .env.production .env || true
    fi

    # install deps & build
    log_short "📦 $project_name: installation..."
    if [ -f package-lock.json ]; then
        npm ci --prefer-offline --no-audit --no-fund --silent || { log_short "❌ $project_name: npm ci failed"; popd >/dev/null; return 1; }
    else
        npm install --no-audit --no-fund --silent || { log_short "❌ $project_name: npm install failed"; popd >/dev/null; return 1; }
    fi

    log_short "🏗️  $project_name: build..."
    if ! npm run build --silent; then
        log_short "❌ $project_name: npm run build failed"
        popd >/dev/null
        return 1
    fi

    if [ ! -d "./$build_folder" ]; then
        log_short "❌ $project_name: build folder absent: $build_folder (checked in $project_path)"
        ls -la
        popd >/dev/null
        return 1
    fi

    # Prepare lftp script for this push (credentials are stored in a per-invocation temp file with restrictive perms)
    local lftp_local_script
    lftp_local_script="$(mktemp)"
    chmod 600 "$lftp_local_script"
    {
        printf "open -u '%s','%s' %s\n" "$FTP_USER" "$FTP_PASS" "$FTP_HOST"
        printf "set ftp:ssl-allow no\n"   # optional: adjust based on server
        printf "set net:max-retries 2\n"
        printf "set net:timeout 15\n"
        if [ -n "$remote_folder" ]; then
            printf "mkdir -p /www/%s\n" "$remote_folder"
            printf "cd /www/%s\n" "$remote_folder"
            printf "mirror -R --delete --continue --verbose ./%s/ .\n" "$build_folder"
        else
            printf "cd /www\n"
            printf "mirror -R --delete --continue --verbose ./%s/ .\n" "$build_folder"
        fi
        printf "quit\n"
    } >"$lftp_local_script"

    # upload
    if ! lftp -f "$lftp_local_script"; then
        log_short "❌ $project_name: upload FTP failed"
        rm -f "$lftp_local_script" 2>/dev/null || true
        popd >/dev/null
        return 1
    fi
    rm -f "$lftp_local_script" 2>/dev/null || true

    log_short "✅ $project_name: déployé"
    popd >/dev/null
    return 0
}

# Run deploys in parallel (simple job queue)
declare -A RESULT_FILES
PIDS=()
i=0
for entry in "${PROJECT_LIST[@]}"; do
    IFS=':' read -r project_name project_path remote_folder build_folder <<<"$entry"
    # compute public URL (do not assume trailing slash)
    if [ -n "$remote_folder" ]; then
        deployed_url="$BASE_URL/$remote_folder"
    else
        deployed_url="$BASE_URL"
    fi

    result_file="$(mktemp)"
    RESULT_FILES["$project_name"]="$result_file"

    # Launch background job
    (
        set -euo pipefail
        # redirect job output to main log (inherited) for traceability
        deploy_project "$project_name" "$project_path" "$remote_folder" "$build_folder"
        echo "0" >"$result_file"  # success
    ) &
    pid=$!
    PIDS+=("$pid")

    # throttle
    while [ "$(jobs -rp | wc -l)" -ge "$MAX_JOBS" ]; do
        sleep 0.3
    done
    i=$((i + 1))
done

# Wait for all background jobs
wait

# Collect results
declare -A DEPLOYED_URLS
declare -A DEPLOY_STATUS

for entry in "${PROJECT_LIST[@]}"; do
    IFS=':' read -r project_name project_path remote_folder build_folder <<<"$entry"
    result_file="${RESULT_FILES[$project_name]}"
    if [ -f "$result_file" ]; then
        status="$(cat "$result_file" 2>/dev/null || echo "1")"
        rm -f "$result_file" 2>/dev/null || true
    else
        status=1
    fi

    if [ "$status" = "0" ]; then
        if [ -n "$remote_folder" ]; then
            DEPLOYED_URLS["$project_name"]="$BASE_URL/$remote_folder"
        else
            DEPLOYED_URLS["$project_name"]="$BASE_URL"
        fi
        DEPLOY_STATUS["$project_name"]="✅"
    elif [ "$status" = "2" ]; then
        DEPLOYED_URLS["$project_name"]="(Dossier manquant)"
        DEPLOY_STATUS["$project_name"]="❌"
    else
        DEPLOYED_URLS["$project_name"]="(Erreur de build ou upload)"
        DEPLOY_STATUS["$project_name"]="❌"
    fi
done

# Clear caches (serially to avoid overloading the server)
clear_cache() {
    local project="$1"
    local url="$2"
    if [[ "$url" == "(Dossier manquant)" || "$url" == "(Erreur de build ou upload)" ]]; then
        return 0
    fi
    printf "🗑️  Vider cache: %s\n" "$project"
    # two pings: one with cache bust, one with no-cache header
    curl -s "${url}?cache_bust=$(date +%s)" >/dev/null || true
    curl -s -H "Cache-Control: no-cache" "$url" >/dev/null || true
}

for entry in "${PROJECT_LIST[@]}"; do
    IFS=':' read -r project_name project_path remote_folder build_folder <<<"$entry"
    clear_cache "$project_name" "${DEPLOYED_URLS[$project_name]-}"
done

# small wait to allow propagation
sleep 2

# Post-deployment health checks (serial)
test_url() {
    local url="$1"
    local project="$2"
    if [[ "$url" == "(Dossier manquant)" || "$url" == "(Erreur de build ou upload)" ]]; then
        return 0
    fi
    local test_url="${url}?deploy=$(date +%s)"
    if curl --output /dev/null --silent --head --fail "$test_url"; then
        printf "✅ %s accessible: %s\n" "$project" "$url"
        return 0
    else
        printf "❌ %s inaccessible: %s\n" "$project" "$url"
        return 1
    fi
}

printf "\n📊 Résumé des projets déployés:\n"
for entry in "${PROJECT_LIST[@]}"; do
    IFS=':' read -r project_name project_path remote_folder build_folder <<<"$entry"
    printf "   • %s: %s %s\n" "$project_name" "${DEPLOYED_URLS[$project_name]}" "${DEPLOY_STATUS[$project_name]}"
done

printf "\n🧪 Tests de santé:\n"
for entry in "${PROJECT_LIST[@]}"; do
    IFS=':' read -r project_name project_path remote_folder build_folder <<<"$entry"
    test_url "${DEPLOYED_URLS[$project_name]}" "$project_name"
done

printf "\n🎉 Déploiement terminé — %s\n" "$(date)"
printf "📝 Journal enregistré dans %s\n" "$LOG_FILE"

# end of script