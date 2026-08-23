#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="/srv/head-heart.atomglobal.com/staging-source"
APP_ROOT="/var/www/head-heart-staging.atomglobal.com"
ENV_FILE="/etc/head-heart-alignment/staging.env"
STORAGE_PATH="/var/lib/head-heart-alignment-staging"
BACKUP_DIR="/var/backups/head-heart-alignment-staging"
DOMAIN="head-heart-staging.atomglobal.com"
BRANCH="sunil-v3-clean-40q-cms"
PHP_FPM_SERVICE="php8.3-fpm"

[[ "${EUID}" -eq 0 ]] || { echo "Run as root." >&2; exit 1; }
[[ -d "$SOURCE_DIR/.git" ]] || { echo "Missing staging source: $SOURCE_DIR" >&2; exit 1; }
[[ -r "$ENV_FILE" ]] || { echo "Missing/read-protected staging env: $ENV_FILE" >&2; exit 1; }

cd "$SOURCE_DIR"
git fetch origin
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"
COMMIT="$(git rev-parse HEAD)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RELEASE_ID="$(date -u +%Y%m%d%H%M%S)-${COMMIT:0:12}"
RELEASE_DIR="$APP_ROOT/releases/$RELEASE_ID"
TEMP_DIR="$APP_ROOT/releases/.$RELEASE_ID.tmp"

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

for variable in APP_URL APP_KEY DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD STORAGE_PATH; do
  [[ -n "${!variable:-}" ]] || { echo "$variable is not configured in $ENV_FILE" >&2; exit 1; }
done

[[ "$APP_URL" == "https://$DOMAIN" ]] || { echo "Refusing deploy: APP_URL is not staging ($APP_URL)." >&2; exit 1; }
[[ "$DB_DATABASE" == *staging* ]] || { echo "Refusing deploy: DB_DATABASE does not look like staging ($DB_DATABASE)." >&2; exit 1; }
[[ "$STORAGE_PATH" == "/var/lib/head-heart-alignment-staging" ]] || { echo "Refusing deploy: STORAGE_PATH is not staging ($STORAGE_PATH)." >&2; exit 1; }

install -d -m 0755 "$APP_ROOT/releases"
install -d -m 0750 "$BACKUP_DIR" "$STORAGE_PATH" "$STORAGE_PATH/media" "$STORAGE_PATH/reports" "$STORAGE_PATH/tmp"
chown -R www-data:www-data "$STORAGE_PATH"
chown root:www-data "$ENV_FILE"
chmod 0640 "$ENV_FILE"

MYSQL_PWD="$DB_PASSWORD" mysqldump --single-transaction --routines --triggers --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USERNAME" "$DB_DATABASE" | gzip -9 > "$BACKUP_DIR/${DB_DATABASE}-${STAMP}-${COMMIT:0:12}.sql.gz"

ln -sfn "$ENV_FILE" "$SOURCE_DIR/backend/.env"
(
  cd "$SOURCE_DIR/backend"
  composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
  composer lint
  php bin/migrate.php
  php bin/seed.php
  php ../tests/php/run.php
)
(
  cd "$SOURCE_DIR"
  npm ci --no-audit --no-fund
  npm test
  VITE_API_MODE=production VITE_API_BASE_URL=/api VITE_ENABLE_SW=true npm run build
  test -s dist/index.html
)

rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR/frontend" "$TEMP_DIR/backend"
rsync -a "$SOURCE_DIR/dist/" "$TEMP_DIR/frontend/"
rsync -a --exclude='.env' "$SOURCE_DIR/backend/" "$TEMP_DIR/backend/"
ln -sfn "$ENV_FILE" "$TEMP_DIR/backend/.env"
find "$TEMP_DIR" -type d -exec chmod 0755 {} \;
find "$TEMP_DIR" -type f -exec chmod 0644 {} \;
find "$TEMP_DIR/backend/bin" -type f -exec chmod 0755 {} \;
mv "$TEMP_DIR" "$RELEASE_DIR"

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current.new"
mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"
printf '%s\n' "$COMMIT" > "$APP_ROOT/deployed-commit.txt"

apache2ctl configtest
systemctl reload "$PHP_FPM_SERVICE"
systemctl reload apache2

HEALTH="$(curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/api/health")"
grep -q '"status":"ok"' <<<"$HEALTH" || { echo "Health check failed: $HEALTH" >&2; exit 1; }
curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/" >/dev/null

find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | tail -n +11 | cut -d' ' -f2- | xargs -r rm -rf
find "$BACKUP_DIR" -type f -name '*.sql.gz' -mtime +30 -delete

echo "V3 staging updated successfully."
echo "Commit: $COMMIT"
echo "URL: https://$DOMAIN/"
echo "Health: $HEALTH"
