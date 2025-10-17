#!/usr/bin/env bash

set -euo pipefail

BASE_URL="https://ryanfonseca.fr"
LOG_FILE="/tmp/deploy_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

# NOTE: Do NOT hardcode credentials in this file. Use a local .deploy.env or export
# FTP_USER / FTP_PASS in the environment before running the script.
# Load .deploy.env if present (format: KEY=VALUE lines). This file is ignored by git.
if [ -f ".deploy.env" ]; then
    # shellcheck disable=SC1091
    set -a
    # ignore empty and comment lines
    . <(grep -v '^\s*#' .deploy.env | sed '/^\s*$/d') 2>/dev/null || true
    set +a
fi

FTP_USER="${FTP_USER-}"
FTP_PASS="${FTP_PASS-}"
FTP_HOST="${FTP_HOST-ftp.cluster021.hosting.ovh.net}"

if [[ -z "$FTP_USER" || -z "$FTP_PASS" ]]; then
        echo "🔒 Veuillez définir les variables d'environnement FTP_USER et FTP_PASS (ou créez .deploy.env)."
        echo "Exemple local: create a .deploy.env with:\nFTP_USER=youruser\nFTP_PASS=yourpass\nFTP_HOST=ftp.cluster021.hosting.ovh.net"
        exit 1
fi

PROJECT_LIST=(
    # Format: "DisplayName:local_path:remote_folder:build_folder"
    "Portfolio:/var/www/html/websites/react/mon-portfolio:mon-portfolio:build"
    "NBA Dashboard:/var/www/html/websites/react/nba-dashbord:nba_dashboard:nba_dashboard"
    "Spotify Album Finder:/var/www/html/websites/react/album_finder_spotify:spotify-finder:dist"
    "F1 Strategy Simulator:/var/www/html/websites/react/f1-strategy-simulator:f1-simulator:dist"
)

clear_cache() {
    local project_name="$1"
    local url="$2"
    echo "🗑️  Vider le cache pour $project_name..."
    curl -s "${url}?cache_bust=$(date +%s)" > /dev/null || true
    curl -s -H "Cache-Control: no-cache" "$url" > /dev/null || true
    echo "✅ Cache vidé pour $project_name"
}

test_url() {
    local url="$1"
    local project="$2"
    echo "🧪 Test de $project..."
    local test_url="${url}?deploy=$(date +%s)"
    if curl --output /dev/null --silent --head --fail "$test_url"; then
        echo "✅ $project est accessible: $url"
        return 0
    else
        echo "❌ $project n'est pas accessible: $url"
        return 1
    fi
}

deploy_project() {
    local project_name="$1"
    local project_path="$2"
    local remote_folder="$3"
    local build_folder="$4"

    if [ ! -d "$project_path" ]; then
        echo "❌ Erreur: Le dossier $project_path n'existe pas"
        return 2
    fi

    pushd "$project_path" >/dev/null || { echo "❌ Erreur: Impossible d'accéder à $project_path"; return 2; }

    # Safely stash local changes (include untracked). Use descriptive message so it's easy to find.
    git stash push --include-untracked -m "deploy-stash-$(date +%s)" >/dev/null 2>&1 || true

    echo "📥 Pull des dernières modifications..."
    # use autostash to avoid interactive stash conflicts
    if ! git pull --rebase --autostash; then
        echo "⚠️  Erreur lors du git pull — tentative de correction automatique..."
        # If the failure is due to tsbuildinfo being unmerged/needs merge, try to untrack them
        if git ls-files -u | grep -q 'tsbuildinfo' 2>/dev/null || git status --porcelain | grep -q 'tsbuildinfo' 2>/dev/null; then
            echo "🔁 Conflit tsbuildinfo détecté — ajout à .gitignore et retrait du suivi"
            if ! grep -q "tsbuildinfo" .gitignore 2>/dev/null; then
                printf '\n# TypeScript incremental build info\n*.tsbuildinfo\n' >> .gitignore
                git add .gitignore || true
            fi
            # Untrack any tracked tsbuildinfo files
            mapfile -t tracked < <(git ls-files '*.tsbuildinfo' || true)
            if [ "${#tracked[@]}" -gt 0 ]; then
                git rm --cached --ignore-unmatch "${tracked[@]}" || true
                git commit -m "ci: remove tsbuildinfo from repo (auto-fix deploy)" || true
            fi
            echo "🔁 Réessai du git pull après nettoyage..."
            if ! git pull --rebase --autostash; then
                echo "❌ git pull échoue toujours après tentative automatique"
                git stash pop --index || true
                popd >/dev/null
                return 1
            fi
        else
            echo "❌ git pull échoue pour une autre raison."
            git stash pop --index || true
            popd >/dev/null
            return 1
        fi
    fi

    # Restore stashed changes if any
    git stash pop --index >/dev/null 2>&1 || true

    # Copy env if exists (kept out of repo for security)
    if [ -f ".env.production" ]; then
        echo "🔧 Copie des variables d'environnement..."
        cp .env.production .env
        echo "✅ Variables d'environnement copiées"
    else
        echo "⚠️  Attention: .env.production non trouvé"
    fi

    echo "📦 Installation des dépendances..."
    # prefer npm ci when lockfile exists for reproducible installs
    if [ -f package-lock.json ]; then
        if ! npm ci --silent; then
            echo "❌ Erreur npm ci"
            popd >/dev/null
            return 1
        fi
    else
        if ! npm install --silent; then
            echo "❌ Erreur npm install"
            popd >/dev/null
            return 1
        fi
    fi

    echo "🏗️  Build du projet..."
    if ! npm run build --silent; then
        echo "❌ Erreur npm run build"
        popd >/dev/null
        return 1
    fi

    if [ ! -d "./$build_folder" ]; then
        echo "❌ Erreur: Le dossier $build_folder n'a pas été créé dans $project_path"
        ls -la
        popd >/dev/null
        return 1
    fi

    echo "📤 Upload vers le serveur..."
    # Build lftp commands safely; mirror -R uploads local -> remote
    local lftp_cmd="open -u '$FTP_USER','$FTP_PASS' $FTP_HOST;"
    if [ -n "$remote_folder" ]; then
        # ensure remote path under /www
        lftp_cmd+="mkdir -p /www/$remote_folder; cd /www/$remote_folder; mirror -R --delete --continue --verbose ./$build_folder/ .;"
    else
        lftp_cmd+="cd /www; mirror -R --delete --continue --verbose ./$build_folder/ .;"
    fi

    if ! lftp -c "$lftp_cmd"; then
        echo "❌ Erreur upload FTP pour $project_name"
        popd >/dev/null
        return 1
    fi

    echo "✅ Déploiement terminé pour $project_name"
    popd >/dev/null
    return 0
}

echo "🎯 Début du déploiement..."
echo "🕐 $(date)"
echo ""

declare -A DEPLOYED_URLS
declare -A DEPLOY_STATUS

for entry in "${PROJECT_LIST[@]}"; do
    IFS=':' read -r project_name project_path remote_folder build_folder <<<"$entry"
    status=0
    deploy_project "$project_name" "$project_path" "$remote_folder" "$build_folder" || status=$?
    if [ $status -eq 0 ]; then
        DEPLOYED_URLS["$project_name"]="$BASE_URL${remote_folder:+/$remote_folder}"
        DEPLOY_STATUS["$project_name"]="✅"
    elif [ $status -eq 2 ]; then
        DEPLOYED_URLS["$project_name"]="(Dossier manquant)"
        DEPLOY_STATUS["$project_name"]="❌"
    else
        DEPLOYED_URLS["$project_name"]="(Erreur de build ou upload)"
        DEPLOY_STATUS["$project_name"]="❌"
    fi
done

echo "🗑️  Vidage des caches..."
for entry in "${PROJECT_LIST[@]}"; do
    IFS=':' read -r project_name project_path remote_folder build_folder <<<"$entry"
    url="${DEPLOYED_URLS[$project_name]}"
    [[ "$url" == "(Dossier manquant)" || "$url" == "(Erreur de build ou upload)" ]] && continue
    clear_cache "$project_name" "$url"
done

echo "⏳ Attente de propagation des changements..."
sleep 5

echo ""
echo "🧪 Tests de santé après déploiement..."
for entry in "${PROJECT_LIST[@]}"; do
    IFS=':' read -r project_name project_path remote_folder build_folder <<<"$entry"
    url="${DEPLOYED_URLS[$project_name]}"
    [[ "$url" == "(Dossier manquant)" || "$url" == "(Erreur de build ou upload)" ]] && continue
    test_url "$url" "$project_name"
done

echo ""
echo "🎉 Déploiement terminé !"
echo "🕐 $(date)"
echo ""
echo "📊 Résumé des projets déployés:"
for entry in "${PROJECT_LIST[@]}"; do
    IFS=':' read -r project_name project_path remote_folder build_folder <<<"$entry"
    echo "   • $project_name: ${DEPLOYED_URLS[$project_name]} ${DEPLOY_STATUS[$project_name]}"
done
echo ""
if [[ "${DEPLOY_STATUS["Spotify Album Finder"]}" != "✅" ]]; then
    echo "❗ Spotify Album Finder n'a pas pu être déployé correctement."
    echo "Vérifie que le dossier existe et que le build/dist est généré."
    echo "Vérifie aussi les droits FTP et l'accessibilité serveur."
fi
if [[ "${DEPLOY_STATUS["F1 Strategy Simulator"]}" != "✅" ]]; then
    echo "❗ F1 Strategy Simulator n'a pas pu être déployé correctement."
    echo "Vérifie que le dossier existe et que le build/dist est généré."
    echo "Vérifie aussi les droits FTP et l'accessibilité serveur."
fi
echo ""
echo "🏎️  Pour tester le F1 Strategy Simulator:"
echo "   - Allez sur: ${DEPLOYED_URLS["F1 Strategy Simulator"]}?deploy=$(date +%s)"
echo "   - Utilisez Ctrl+F5 pour forcer le rechargement"
echo "   - Vérifiez que les 20 pilotes s'affichent"
echo "   - Testez les contrôles de course (Start/Stop)"
echo "   - Essayez la sélection de circuit"
echo "   - Vérifiez les stratégies par pilote"
echo ""
echo "📝 Journal de déploiement sauvegardé dans $LOG_FILE"
