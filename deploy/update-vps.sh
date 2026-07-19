#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/var/www/head-heart.atomglobal.com}"
SOURCE_DIR="${SOURCE_DIR:-/srv/head-heart.atomglobal.com/source}"
ENV_FILE="${ENV_FILE:-/etc/head-heart-alignment/app.env}"
RELEASE_ID="$(date -u +%Y%m%d%H%M%S)"
RELEASE_DIR="$APP_ROOT/releases/$RELEASE_ID"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/head-heart-alignment}"
PREVIOUS_RELEASE="$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)"

set -a
source "$ENV_FILE"
set +a

mkdir -p "$RELEASE_DIR" "$BACKUP_DIR"

echo "Backing up the database."
MYSQL_PWD="$DB_PASSWORD" mysqldump --single-transaction --routines --triggers --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USERNAME" "$DB_DATABASE" | gzip -9 > "$BACKUP_DIR/${DB_DATABASE}-${RELEASE_ID}.sql.gz"

echo "Preparing versioned release $RELEASE_ID."
rsync -a --delete --exclude=.git --exclude=node_modules --exclude=dist --exclude=.netlify "$SOURCE_DIR/" "$RELEASE_DIR/source/"
ln -sfn "$ENV_FILE" "$RELEASE_DIR/source/backend/.env"

cd "$RELEASE_DIR/source/backend"
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
php bin/migrate.php
php bin/seed.php

cd "$RELEASE_DIR/source"
corepack enable
npm ci
npm run build
mkdir -p "$RELEASE_DIR/frontend" "$RELEASE_DIR/backend"
rsync -a dist/ "$RELEASE_DIR/frontend/"
rsync -a backend/ "$RELEASE_DIR/backend/"
ln -sfn "$ENV_FILE" "$RELEASE_DIR/backend/.env"

echo "Running pre-switch checks."
php -l "$RELEASE_DIR/backend/public/index.php" >/dev/null
test -r "$RELEASE_DIR/frontend/index.html"
test -w "${STORAGE_PATH:-/var/lib/head-heart-alignment}"

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current.new"
mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"
systemctl reload php8.2-fpm
systemctl reload nginx

if ! curl --fail --silent --show-error --max-time 15 "${APP_URL}/api/health" | grep -q '"status":"ok"'; then
  echo "Health check failed; restoring previous application release." >&2
  if [[ -n "$PREVIOUS_RELEASE" ]]; then ln -sfn "$PREVIOUS_RELEASE" "$APP_ROOT/current"; fi
  systemctl reload php8.2-fpm nginx
  exit 1
fi

find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | tail -n +6 | cut -d' ' -f2- | xargs -r rm -rf
echo "Release $RELEASE_ID is active."
