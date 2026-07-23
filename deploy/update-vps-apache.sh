#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/var/www/head-heart.atomglobal.com}"
SOURCE_DIR="${SOURCE_DIR:-/srv/head-heart.atomglobal.com/source}"
ENV_FILE="${ENV_FILE:-/etc/head-heart-alignment/app.env}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/head-heart-alignment}"
DOMAIN="${DOMAIN:-head-heart.atomglobal.com}"
APACHE_SITE="${APACHE_SITE:-}"
APACHE_SERVICE="${APACHE_SERVICE:-apache2}"
PHP_FPM_SERVICE="${PHP_FPM_SERVICE:-}"
APACHE_BACKUP=""
APACHE_TEMP=""
APACHE_CHANGED=0

load_env_file() {
  local line key value
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" == *=* ]] || continue
    key="${line%%=*}"
    value="${line#*=}"
    key="${key//[[:space:]]/}"
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || { echo "Invalid environment key: $key" >&2; exit 1; }
    if [[ "$value" == \"*\" && "$value" == *\" ]]; then value="${value:1:${#value}-2}"; fi
    if [[ "$value" == \'*\' && "$value" == *\' ]]; then value="${value:1:${#value}-2}"; fi
    export "$key=$value"
  done < "$ENV_FILE"
}

detect_php_fpm() {
  if [[ -n "$PHP_FPM_SERVICE" ]]; then return; fi
  local candidate
  for candidate in php8.4-fpm php8.3-fpm php8.2-fpm php-fpm; do
    if systemctl is-active --quiet "$candidate" 2>/dev/null; then
      PHP_FPM_SERVICE="$candidate"
      return
    fi
  done
  PHP_FPM_SERVICE=""
}

detect_web_identity() {
  WEB_USER="${WEB_USER:-}"
  WEB_GROUP="${WEB_GROUP:-}"
  if [[ -z "$WEB_USER" && -r /etc/apache2/envvars ]]; then
    WEB_USER="$(awk -F= '/^[[:space:]]*export[[:space:]]+APACHE_RUN_USER=/{gsub(/["[:space:]]/, "", $2); print $2; exit}' /etc/apache2/envvars)"
    WEB_GROUP="$(awk -F= '/^[[:space:]]*export[[:space:]]+APACHE_RUN_GROUP=/{gsub(/["[:space:]]/, "", $2); print $2; exit}' /etc/apache2/envvars)"
  fi
  if [[ -z "$WEB_USER" ]]; then
    WEB_USER="$(ps -eo user=,comm= | awk '$2 ~ /^(apache2|httpd)$/ && $1 != "root" {print $1; exit}')"
  fi
  WEB_USER="${WEB_USER:-www-data}"
  id "$WEB_USER" >/dev/null 2>&1 || { echo "Apache worker user does not exist: $WEB_USER" >&2; exit 1; }
  WEB_GROUP="${WEB_GROUP:-$(id -gn "$WEB_USER")}"
}

resolve_apache_site() {
  if [[ -n "$APACHE_SITE" ]]; then
    APACHE_SITE="$(readlink -f "$APACHE_SITE")"
  else
    local candidate
    while IFS= read -r candidate; do
      [[ -f "$candidate" || -L "$candidate" ]] || continue
      if grep -Eq '^[[:space:]]*<VirtualHost[^>]*:443' "$candidate"; then
        APACHE_SITE="$(readlink -f "$candidate")"
        break
      fi
      [[ -n "$APACHE_SITE" ]] || APACHE_SITE="$(readlink -f "$candidate")"
    done < <(grep -RIlE "^[[:space:]]*ServerName[[:space:]]+${DOMAIN}([[:space:]]|$)" /etc/apache2/sites-enabled /etc/apache2/sites-available 2>/dev/null | sort -u)
  fi
  [[ -n "$APACHE_SITE" && -f "$APACHE_SITE" ]] || { echo "Apache site configuration for $DOMAIN was not found." >&2; exit 1; }
  grep -Eq "^[[:space:]]*ServerName[[:space:]]+${DOMAIN}([[:space:]]|$)" "$APACHE_SITE" || { echo "Resolved Apache site does not declare $DOMAIN: $APACHE_SITE" >&2; exit 1; }
}

if [[ -x /opt/node-v22/bin/node ]]; then
  export PATH="/opt/node-v22/bin:$PATH"
fi

[[ $EUID -eq 0 ]] || { echo "Run as root." >&2; exit 1; }
systemctl is-active --quiet "$APACHE_SERVICE" || { echo "$APACHE_SERVICE is not active; refusing an Apache deployment." >&2; exit 1; }

for command in apache2ctl php composer mysql mysqldump node npm git rsync curl gzip install readlink grep awk find; do
  command -v "$command" >/dev/null 2>&1 || { echo "Missing required command: $command" >&2; exit 1; }
done

node -e 'const [major]=process.versions.node.split(".").map(Number); process.exit(major >= 22 ? 0 : 1)' \
  || { echo "Node 22 or newer is required. Checked node: $(command -v node)" >&2; exit 1; }

[[ -r "$ENV_FILE" ]] || { echo "Missing environment file: $ENV_FILE" >&2; exit 1; }
[[ -d "$SOURCE_DIR/.git" ]] || { echo "Source repository missing: $SOURCE_DIR" >&2; exit 1; }
[[ -z "$(git -C "$SOURCE_DIR" status --porcelain)" ]] || { echo "Source contains uncommitted changes." >&2; git -C "$SOURCE_DIR" status --short; exit 1; }

load_env_file
detect_php_fpm
detect_web_identity
resolve_apache_site

for variable in APP_URL APP_KEY DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD STORAGE_PATH; do
  [[ -n "${!variable:-}" ]] || { echo "$variable is not configured." >&2; exit 1; }
done

if ! grep -qF "$APP_ROOT/current" "$APACHE_SITE" && ! grep -qF "$APP_ROOT/releases/" "$APACHE_SITE"; then
  echo "Apache site does not use the recognised Head–Heart current/release layout: $APACHE_SITE" >&2
  exit 1
fi

apache2ctl configtest

COMMIT="$(git -C "$SOURCE_DIR" rev-parse HEAD)"
RELEASE_ID="$(date -u +%Y%m%d%H%M%S)-${COMMIT:0:12}"
RELEASE_DIR="$APP_ROOT/releases/$RELEASE_ID"
TEMP_DIR="$APP_ROOT/releases/.$RELEASE_ID.tmp"
PREVIOUS_RELEASE="$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)"
PREVIOUS_COMMIT="$(cat "$APP_ROOT/deployed-commit.txt" 2>/dev/null || cat "$APP_ROOT/v2-deployed-commit.txt" 2>/dev/null || true)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

rollback() {
  rm -rf "$TEMP_DIR"
  [[ -n "$APACHE_TEMP" ]] && rm -f "$APACHE_TEMP"
  if [[ -n "$APACHE_BACKUP" && -f "$APACHE_BACKUP" ]]; then
    cp -a "$APACHE_BACKUP" "$APACHE_SITE"
  fi
  if [[ -n "$PREVIOUS_RELEASE" && -d "$PREVIOUS_RELEASE" ]]; then
    ln -sfn "$PREVIOUS_RELEASE" "$APP_ROOT/current.rollback"
    mv -Tf "$APP_ROOT/current.rollback" "$APP_ROOT/current"
    printf '%s\n' "$PREVIOUS_COMMIT" > "$APP_ROOT/deployed-commit.txt"
    printf '%s\n' "$PREVIOUS_COMMIT" > "$APP_ROOT/v2-deployed-commit.txt"
  fi
  if [[ -n "$PHP_FPM_SERVICE" ]]; then systemctl reload "$PHP_FPM_SERVICE" 2>/dev/null || true; fi
  if apache2ctl configtest >/dev/null 2>&1 && systemctl is-active --quiet "$APACHE_SERVICE"; then
    systemctl reload "$APACHE_SERVICE" 2>/dev/null || true
  fi
}
trap 'echo "Deployment failed; restoring the previous release and Apache site." >&2; rollback' ERR

install -d -m 0755 "$APP_ROOT/releases"
install -d -o "$WEB_USER" -g "$WEB_GROUP" -m 0750 "$STORAGE_PATH" "$STORAGE_PATH/media" "$STORAGE_PATH/reports" "$STORAGE_PATH/tmp"
install -d -m 0750 "$BACKUP_DIR"
find "$STORAGE_PATH/media" -type d -exec chown "$WEB_USER:$WEB_GROUP" {} + -exec chmod 0750 {} +
find "$STORAGE_PATH/media" -type f -exec chown "$WEB_USER:$WEB_GROUP" {} + -exec chmod 0640 {} +
rm -rf "$TEMP_DIR"
install -d -m 0755 "$TEMP_DIR/source"

APACHE_BACKUP="$BACKUP_DIR/apache-${DOMAIN}-${STAMP}-${COMMIT:0:12}.conf"
cp -a "$APACHE_SITE" "$APACHE_BACKUP"

echo "Backing up database $DB_DATABASE."
MYSQL_PWD="$DB_PASSWORD" mysqldump --single-transaction --routines --triggers --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USERNAME" "$DB_DATABASE" | gzip -9 > "$BACKUP_DIR/${DB_DATABASE}-${STAMP}-${COMMIT:0:12}.sql.gz"

echo "Preparing Apache release $RELEASE_ID with $(php -r 'echo PHP_VERSION;') and $(node --version)."
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
grep -R --include='*.js' -Fq 'latest-visual-panel' dist/assets
grep -R --include='*.js' -Fq 'latest-track-card' dist/assets
grep -R --include='*.js' -Fq 'Begin the free assessment' dist/assets
mkdir -p "$TEMP_DIR/frontend" "$TEMP_DIR/backend"
rsync -a dist/ "$TEMP_DIR/frontend/"
rsync -a backend/ "$TEMP_DIR/backend/"
ln -sfn "$ENV_FILE" "$TEMP_DIR/backend/.env"
ln -s "$STORAGE_PATH/media" "$TEMP_DIR/frontend/media-uploads"
rm -rf "$TEMP_DIR/source/node_modules" "$TEMP_DIR/source/dist" "$TEMP_DIR/source/backend/vendor"

php -l "$TEMP_DIR/backend/public/index.php" >/dev/null
test -w "$STORAGE_PATH"
find "$TEMP_DIR" -type d -exec chmod 0755 {} \;
find "$TEMP_DIR" -type f -exec chmod 0644 {} \;
find "$TEMP_DIR/backend/bin" -type f -exec chmod 0755 {} \;

mv "$TEMP_DIR" "$RELEASE_DIR"

APACHE_CONTENT="$(cat "$APACHE_SITE")"
mapfile -t OLD_RELEASE_PATHS < <(grep -oE "$APP_ROOT/releases/[A-Za-z0-9._-]+" "$APACHE_SITE" | sort -u || true)
for OLD_RELEASE_PATH in "${OLD_RELEASE_PATHS[@]}"; do
  APACHE_CONTENT="${APACHE_CONTENT//"$OLD_RELEASE_PATH"/"$RELEASE_DIR"}"
done

if [[ "$APACHE_CONTENT" != "$(cat "$APACHE_SITE")" ]]; then
  APACHE_TEMP="${APACHE_SITE}.new-${COMMIT:0:12}"
  cp -a "$APACHE_SITE" "$APACHE_TEMP"
  printf '%s\n' "$APACHE_CONTENT" > "$APACHE_TEMP"
  mv -f "$APACHE_TEMP" "$APACHE_SITE"
  APACHE_TEMP=""
  APACHE_CHANGED=1
fi

if grep -qF "$APP_ROOT/releases/" "$APACHE_SITE"; then
  grep -qF "$RELEASE_DIR/frontend" "$APACHE_SITE" || { echo "Apache frontend path was not updated to $RELEASE_DIR." >&2; exit 1; }
  grep -qF "$RELEASE_DIR/backend" "$APACHE_SITE" || { echo "Apache backend path was not updated to $RELEASE_DIR." >&2; exit 1; }
fi

apache2ctl configtest

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current.new"
mv -Tf "$APP_ROOT/current.new" "$APP_ROOT/current"
printf '%s\n' "$COMMIT" > "$APP_ROOT/deployed-commit.txt"
printf '%s\n' "$COMMIT" > "$APP_ROOT/v2-deployed-commit.txt"

if [[ -n "$PHP_FPM_SERVICE" ]]; then systemctl reload "$PHP_FPM_SERVICE"; fi
if [[ $APACHE_CHANGED -eq 1 ]]; then systemctl reload "$APACHE_SERVICE"; fi

HEALTH="$(curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/api/health")"
grep -q '"status":"ok"' <<<"$HEALTH" || { echo "Health check did not return status ok: $HEALTH" >&2; exit 1; }

EXPERIENCE="$(curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/api/public/assessment-experience")"
grep -q '"landing"' <<<"$EXPERIENCE" || { echo "Questionnaire landing configuration is missing: $EXPERIENCE" >&2; exit 1; }
grep -q '"liveTrackKey"' <<<"$EXPERIENCE" || { echo "Compatibility liveTrackKey is missing: $EXPERIENCE" >&2; exit 1; }
for track_key in personal newjoiner manager executive; do
  grep -q '"'"$track_key"'"' <<<"$EXPERIENCE" || { echo "Managed track $track_key is missing: $EXPERIENCE" >&2; exit 1; }
done
grep -q 'Every choice you make is cast by two votes' <<<"$EXPERIENCE" || { echo "Latest questionnaire copy is missing: $EXPERIENCE" >&2; exit 1; }

PUBLIC_CONFIG="$(curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/api/public/configuration")"
mapfile -t PUBLIC_MEDIA_PATHS < <(
  printf '%s' "$PUBLIC_CONFIG" | php -r '
    $data = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
    $paths = [];
    $walk = function ($value) use (&$walk, &$paths): void {
        if (is_array($value)) { foreach ($value as $item) $walk($item); return; }
        if (is_string($value) && str_starts_with($value, "/media-uploads/")) $paths[$value] = true;
    };
    $walk($data);
    foreach (array_keys($paths) as $path) echo $path, PHP_EOL;
  '
)

MEDIA_HEADERS="$(mktemp)"
MEDIA_BODY="$(mktemp)"
trap 'rm -f "$MEDIA_HEADERS" "$MEDIA_BODY"' EXIT
for media_path in "${PUBLIC_MEDIA_PATHS[@]}"; do
  : > "$MEDIA_HEADERS"
  : > "$MEDIA_BODY"
  curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" -D "$MEDIA_HEADERS" -o "$MEDIA_BODY" "https://$DOMAIN$media_path"
  grep -Eiq '^content-type:[[:space:]]*image/' "$MEDIA_HEADERS" || { echo "Configured media returned a non-image response: $media_path" >&2; cat "$MEDIA_HEADERS" >&2; exit 1; }
  test -s "$MEDIA_BODY" || { echo "Configured media returned an empty file: $media_path" >&2; exit 1; }
done

curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/" >/dev/null

find "$APP_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | tail -n +11 | cut -d' ' -f2- | xargs -r rm -rf
find "$BACKUP_DIR" -type f -name '*.sql.gz' -mtime +30 -delete
find "$BACKUP_DIR" -type f -name "apache-${DOMAIN}-*.conf" -mtime +30 -delete

trap - ERR
echo "Release $RELEASE_ID is active."
echo "Commit: $COMMIT"
echo "Apache site: $APACHE_SITE"
echo "Apache configuration changed: $APACHE_CHANGED"
echo "PHP-FPM service: ${PHP_FPM_SERVICE:-not required}"
echo "Health: $HEALTH"
echo "Questionnaire API and ${#PUBLIC_MEDIA_PATHS[@]} public CMS media paths verified."
