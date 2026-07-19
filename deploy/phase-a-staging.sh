#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/var/www/head-heart.atomglobal.com}"
SOURCE_DIR="${SOURCE_DIR:-/srv/head-heart.atomglobal.com/source}"
ENV_DIR="${ENV_DIR:-/etc/head-heart-alignment}"
ENV_FILE="${ENV_FILE:-$ENV_DIR/app.env}"
STORAGE_PATH="${STORAGE_PATH:-/var/lib/head-heart-alignment}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/head-heart-alignment}"
PHP_FPM_SERVICE="${PHP_FPM_SERVICE:-php8.2-fpm}"

log() { printf '[phase-a] %s\n' "$*"; }
fail() { printf '[phase-a] ERROR: %s\n' "$*" >&2; exit 1; }

[[ "${EUID}" -eq 0 ]] || fail "Run as root."
[[ -d "$SOURCE_DIR" ]] || fail "Source directory not found: $SOURCE_DIR"

log "Checking required software."
for command in nginx php composer mysql node npm git rsync curl openssl; do
  command -v "$command" >/dev/null 2>&1 || fail "Missing required command: $command"
done

php -r 'exit(version_compare(PHP_VERSION, "8.2.0", ">=") ? 0 : 1);' \
  || fail "PHP 8.2 or newer is required."

node -e 'const [major]=process.versions.node.split(".").map(Number); process.exit(major >= 22 ? 0 : 1)' \
  || fail "Node 22 or newer is required for Vite 7 builds."

log "Creating persistent directories."
install -d -m 0750 "$ENV_DIR"
install -d -m 0750 "$STORAGE_PATH" "$STORAGE_PATH/media" "$STORAGE_PATH/reports" "$STORAGE_PATH/tmp"
install -d -m 0750 "$BACKUP_DIR"
install -d -m 0755 "$APP_ROOT/releases"

if id www-data >/dev/null 2>&1; then
  chown -R www-data:www-data "$STORAGE_PATH"
fi

if [[ ! -f "$ENV_FILE" ]]; then
  log "Creating environment template at $ENV_FILE."
  cp "$SOURCE_DIR/backend/.env.example" "$ENV_FILE"
  chmod 0600 "$ENV_FILE"
  APP_KEY="base64:$(openssl rand -base64 32 | tr -d '\n')"
  sed -i "s#^APP_KEY=.*#APP_KEY=$APP_KEY#" "$ENV_FILE"
  log "Environment file created. Add database, Stripe and email credentials before migrations."
else
  log "Environment file already exists; it was not overwritten."
fi

log "Checking PHP extensions."
for extension in pdo pdo_mysql json mbstring openssl curl dom fileinfo; do
  php -m | grep -qi "^${extension}$" || fail "Missing PHP extension: $extension"
done

log "Checking PHP-FPM and Nginx."
systemctl is-active --quiet "$PHP_FPM_SERVICE" || fail "$PHP_FPM_SERVICE is not active."
systemctl is-active --quiet nginx || fail "Nginx is not active."
nginx -t

log "Installing backend dependencies without changing production."
(
  cd "$SOURCE_DIR/backend"
  composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
)

log "Validating frontend without deploying."
(
  cd "$SOURCE_DIR"
  npm ci --no-audit --no-fund
  npm test
  npm run build
  test -s dist/index.html
)

log "Checking environment completeness."
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

for variable in APP_URL APP_KEY DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD STORAGE_PATH; do
  [[ -n "${!variable:-}" ]] || fail "$variable must be configured in $ENV_FILE"
done

log "Checking database connectivity."
MYSQL_PWD="$DB_PASSWORD" mysql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USERNAME" \
  --database="$DB_DATABASE" \
  --execute='SELECT 1;' >/dev/null

log "Backing up the staging database before migration."
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
MYSQL_PWD="$DB_PASSWORD" mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USERNAME" \
  "$DB_DATABASE" | gzip -9 > "$BACKUP_DIR/${DB_DATABASE}-before-phase-a-${STAMP}.sql.gz"

log "Running migrations and seed data on the configured staging database."
ln -sfn "$ENV_FILE" "$SOURCE_DIR/backend/.env"
(
  cd "$SOURCE_DIR"
  php backend/bin/migrate.php
  php backend/bin/seed.php
  php tests/php/run.php
  find backend -name '*.php' -print0 | xargs -0 -n1 php -l >/dev/null
)

log "Phase A staging preparation complete."
log "No production symlink was changed."
log "Next checks: /api/health, admin owner creation, email test, Stripe test webhook and full staging acceptance."