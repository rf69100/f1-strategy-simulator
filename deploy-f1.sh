#!/usr/bin/env bash

set -euo pipefail

THIS_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$THIS_DIR"

# Load environment if present
if [ -f ".deploy.env" ]; then
  set -a
  . <(grep -v '^\s*#' .deploy.env | sed '/^\s*$/d') 2>/dev/null || true
  set +a
fi

FTP_USER="ryanfoc"
FTP_PASS="Bpi14580911"
FTP_HOST="${FTP_HOST-ftp.cluster021.hosting.ovh.net}"
REMOTE_FOLDER="f1-simulator"
BUILD_FOLDER="dist"

if [[ -z "$FTP_USER" || -z "$FTP_PASS" ]]; then
  echo "🔒 FTP credentials missing. Create .deploy.env or set FTP_USER and FTP_PASS."
  exit 1
fi

echo "📦 Building F1 Strategy Simulator (relative assets)..."
export VITE_BASE="./"
npm ci --silent || npm install --silent
npm run build --silent

if [ ! -d "$BUILD_FOLDER" ]; then
  echo "❌ Build folder $BUILD_FOLDER not found"
  exit 1
fi

echo "🔎 Quick verification of build files..."
if grep -q "./assets/" $BUILD_FOLDER/index.html; then
  echo "🔎 index.html references ./assets/"
else
  echo "⚠️ index.html does not reference ./assets/ - inspect $BUILD_FOLDER/index.html"
fi

jsfile=$(ls $BUILD_FOLDER/assets/*.js 2>/dev/null | head -n1 || true)
if [ -z "$jsfile" ]; then
  echo "❌ No JS asset found in $BUILD_FOLDER/assets"
  exit 1
fi

echo "📤 Uploading $BUILD_FOLDER to FTP /www/$REMOTE_FOLDER/ ..."
lftp -c "open -u '$FTP_USER','$FTP_PASS' $FTP_HOST; mkdir -p /www/$REMOTE_FOLDER; cd /www/$REMOTE_FOLDER; mirror -R --delete --continue --verbose ./$BUILD_FOLDER/ .;"

echo "🧪 Testing public URL..."
URL="https://ryanfonseca.fr/$REMOTE_FOLDER/"
if curl --silent --head --fail "$URL" >/dev/null; then
  echo "✅ Public URL reachable: $URL"
else
  echo "❌ Public URL not reachable: $URL"
fi

echo "🔎 Asset check (public)..."
curl -I -sS "$URL" | sed -n '1,20p'
curl -I -sS "${URL}assets/$(basename $jsfile)" | sed -n '1,20p'

echo "✅ Deploy-f1 completed"
