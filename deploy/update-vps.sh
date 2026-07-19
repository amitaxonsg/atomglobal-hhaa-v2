#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/var/www/head-heart.atomglobal.com}"
SOURCE_DIR="${SOURCE_DIR:-/srv/head-heart.atomglobal.com/source}"
ENV_FILE="${ENV_FILE:-/etc/head-heart-alignment/app.env}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/head-heart-alignment}"
PHP_FPM_SERVICE="${PHP_FPM_SERVICE:-php8.2-fpm}"
DOMAIN="${DOMAIN:-head-heart.atomglobal.com}"
COMMIT="$(git -C "$SOURCE_DIR" rev-parse HEAD)"
RELEASE_ID="$(date -u +%Y%m%d%H%M%S)-${COMMIT:0:12}"
RELEASE_DIR="$APP_ROOT/releases/$RELEASE_ID"
TEMP_DIR="$APP_ROOT/releases/.$RELEASE_ID.tmp"
PREVIOUS_RELEASE="$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)"
PREVIOUS_COMMIT="$(cat "$APP_ROOT/deployed-commit.txt" 2>/dev/null || true)"

rollback() {
  rm -rf "$TEMP_DIR"
  if [[ -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]]; then
    ln -sfn "$PREVIOUS_RELEASE" "$APP_ROOT/current.rollback"
    mv -Tf "$APP_ROOT/current.rollback" "$APP_ROOT/current"
    printf '%s\n' "$PREVIOUS_COMMIT" > "$APP_ROOT/deployed-commit.txt"
    systemctl reload "$PHP_FPM_SERVICE" nginx || true
  fi
}
trap 'echo "Deployment failed; restoring the previous release." >&2; rollback' ERR

[[ -r "$ENV_FILE" ]] || { echo "Missing environment file: $ENV_FILE" >&2; exit 1; }
[[ -d "$SOURCE_DIR/.git" ]] || { echo "Source repository missing: $SOURCE_DIR" >&2; exit 1; }
[[ -z "$(git -C "$SOURCE_DIR" status --porcelain)" ]] || { echo "Source contains uncommitted changes." >&2; git -C "$SOURCE_DIR" status --short; exit 1; }

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

for variable in APP_URL APP_KEY DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD STORAGE_PATH; do
  [[ -n "${!variable:-}" ]] || { echo "$variable is not configured." >&2; exit 1; }
done

install -d -m 0755 "$APP_ROOT/releases"
install -d -m 0750 "$BACKUP_DIR" "$STORAGE_PATH" "$STORAGE_PATH/media" "$STORAGE_PATH/reports" "$STORAGE_PATH/tmp"
rm -rf "$TEMP_DIR"
install -d -m 0755 "$TEMP_DIR/source"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
echo "Backing up database $DB_DATABASE."
MYSQL_PWD="$DB_PASSWORD" mysqldump --single-transaction --routines --triggers --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USERNAME" "$DB_DATABASE" | gzip -9 > "$BACKUP_DIR/${DB_DATABASE}-${STAMP}-${COMMIT:0:12}.sql.gz"

echo "Preparing release $RELEASE_ID."
rsync -a --delete --exclude=.git --exclude=node_modules --exclude=dist --exclude=.netlify --exclude=backend/.env "$SOURCE_DIR/" "$TEMP_DIR/source/"
ln -sfn "$ENV_FILE" "$TEMP_DIR/source/backend/.env"

cd "$TEMP_DIR/source/backend"
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
composer lint
php bin/migrate.php
php bin/seed.php
php ../tests/php/run.php

cd "$TEMP_DIR/source"
export VITE_API_MODE="${VITE_API_MODE:-production}"
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-/api}"
export VITE_ENABLE_SW="${VITE_ENABLE_SW:-true}"
npm ci --no-audit --no-fund
npm test
npm run build

test -s dist/index.html
mkdir -p "$TEMP_DIR/frontend" "$TEMP_DIR/backend"
rsync -a dist/ "$TEMP_DIR/frontend/"
rsync -a backend/ "$TEMP_DIR/backend/"
ln -sfn "$ENV_FILE" "$TEMP_DIR/backend/.env"
rm -rf "$TEMP_DIR/source/node_modules" "$TEMP_DIR/source/dist" "$TEMP_DIR/source/backend/vendor"

php -l "$TEMP_DIR/backend/public/index.php" >/dev/null
test -w "$STORAGE_PATH"
find "$TEMP_DIR" -type d -exec chmod 0755 {} \;
find "$TEMP_DIR" -type f -exec chmod 0644 {} \;
find "$TEMP_DIR/backend/bin" -type f -exec chmod 0755 {} \;

mv "$TEMP_DIR" "$RELEASE_DIR"
ln -sfn "$RELEASE_DIR" "$APP_ROOT/current.new"
mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"
printf '%s\n' "$COMMIT" > "$APP_ROOT/deployed-commit.txt"
printf '%s\n' "$COMMIT" > "$APP_ROOT/v2-deployed-commit.txt"

systemctl reload "$PHP_FPM_SERVICE"
nginx -t
systemctl reload nginx

HEALTH="$(curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/api/health")"
grep -q '"status":"ok"' <<<"$HEALTH" || { echo "Health check did not return status ok: $HEALTH" >&2; exit 1; }
curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/" >/dev/null

find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | tail -n +11 | cut -d' ' -f2- | xargs -r rm -rf
find "$BACKUP_DIR" -type f -name '*.sql.gz' -mtime +30 -delete

echo "Release $RELEASE_ID is active."
echo "Commit: $COMMIT"
echo "Health: $HEALTH"
trap - ERR
