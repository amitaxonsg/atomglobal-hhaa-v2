#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="${DOMAIN:-head-heart.atomglobal.com}"
ENV_FILE="${ENV_FILE:-/etc/head-heart-alignment/app.env}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/head-heart-alignment}"
NGINX_SITE="${NGINX_SITE:-}"
PHOTO_SOURCE="${PHOTO_SOURCE:-/root/niklas-liniger-cs58J0MvILA-unsplash.jpg}"
LOGO_SOURCE="${LOGO_SOURCE:-/root/Atom Global 2019.png}"
PHOTO_NAME="${PHOTO_NAME:-sunil-opening-6af386d476e53f13429d.jpg}"
LOGO_NAME="${LOGO_NAME:-atom-global-2019-dc59d6f1ab15aa23112c.png}"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi

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

resolve_nginx_site() {
  if [[ -n "$NGINX_SITE" ]]; then
    NGINX_SITE="$(readlink -f "$NGINX_SITE")"
  elif [[ -e "/etc/nginx/sites-enabled/${DOMAIN}.conf" ]]; then
    NGINX_SITE="$(readlink -f "/etc/nginx/sites-enabled/${DOMAIN}.conf")"
  elif [[ -e "/etc/nginx/sites-enabled/${DOMAIN}" ]]; then
    NGINX_SITE="$(readlink -f "/etc/nginx/sites-enabled/${DOMAIN}")"
  elif [[ -f "/etc/nginx/sites-available/${DOMAIN}.conf" ]]; then
    NGINX_SITE="$(readlink -f "/etc/nginx/sites-available/${DOMAIN}.conf")"
  elif [[ -f "/etc/nginx/sites-available/${DOMAIN}" ]]; then
    NGINX_SITE="$(readlink -f "/etc/nginx/sites-available/${DOMAIN}")"
  else
    echo "Nginx site configuration for $DOMAIN was not found." >&2
    exit 1
  fi
  [[ -f "$NGINX_SITE" ]] || { echo "Resolved Nginx site is not a file: $NGINX_SITE" >&2; exit 1; }
}

for command in nginx curl install cp cmp awk grep sha256sum mktemp id find chmod chgrp systemctl; do
  command -v "$command" >/dev/null 2>&1 || { echo "Missing required command: $command" >&2; exit 1; }
done

[[ -r "$ENV_FILE" ]] || { echo "Missing environment file: $ENV_FILE" >&2; exit 1; }
[[ -f "$PHOTO_SOURCE" ]] || { echo "Missing supplied photograph: $PHOTO_SOURCE" >&2; exit 1; }
[[ -f "$LOGO_SOURCE" ]] || { echo "Missing supplied logo: $LOGO_SOURCE" >&2; exit 1; }

load_env_file
resolve_nginx_site
[[ -n "${STORAGE_PATH:-}" ]] || { echo "STORAGE_PATH is not configured." >&2; exit 1; }

MEDIA_DIR="${STORAGE_PATH%/}/media"
PHOTO_TARGET="$MEDIA_DIR/$PHOTO_NAME"
LOGO_TARGET="$MEDIA_DIR/$LOGO_NAME"
NGINX_USER="$(awk '$1 == "user" { gsub(";", "", $2); print $2; exit }' /etc/nginx/nginx.conf 2>/dev/null || true)"
NGINX_USER="${NGINX_USER:-www-data}"
id "$NGINX_USER" >/dev/null 2>&1 || { echo "Nginx worker user does not exist: $NGINX_USER" >&2; exit 1; }
NGINX_GROUP="$(id -gn "$NGINX_USER")"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REPAIR_BACKUP_DIR="$BACKUP_DIR/public-media-repair-$STAMP"
NGINX_BACKUP="$REPAIR_BACKUP_DIR/$(basename "$NGINX_SITE")"
PHOTO_EXISTED=0
LOGO_EXISTED=0

install -d -m 0750 "$REPAIR_BACKUP_DIR"
cp -a "$NGINX_SITE" "$NGINX_BACKUP"
if [[ -e "$PHOTO_TARGET" ]]; then cp -a "$PHOTO_TARGET" "$REPAIR_BACKUP_DIR/$PHOTO_NAME"; PHOTO_EXISTED=1; fi
if [[ -e "$LOGO_TARGET" ]]; then cp -a "$LOGO_TARGET" "$REPAIR_BACKUP_DIR/$LOGO_NAME"; LOGO_EXISTED=1; fi

rollback() {
  echo "Repair failed; restoring the prior Head–Heart media and Nginx configuration." >&2
  cp -a "$NGINX_BACKUP" "$NGINX_SITE" || true
  if [[ $PHOTO_EXISTED -eq 1 ]]; then cp -a "$REPAIR_BACKUP_DIR/$PHOTO_NAME" "$PHOTO_TARGET" || true; else rm -f "$PHOTO_TARGET"; fi
  if [[ $LOGO_EXISTED -eq 1 ]]; then cp -a "$REPAIR_BACKUP_DIR/$LOGO_NAME" "$LOGO_TARGET" || true; else rm -f "$LOGO_TARGET"; fi
  nginx -t >/dev/null 2>&1 && systemctl reload nginx 2>/dev/null || true
}
trap rollback ERR

install -d -m 0750 "$STORAGE_PATH" "$MEDIA_DIR"
chgrp "$NGINX_GROUP" "$STORAGE_PATH" "$MEDIA_DIR"
chmod 0750 "$STORAGE_PATH" "$MEDIA_DIR"
install -o "$NGINX_USER" -g "$NGINX_GROUP" -m 0640 "$PHOTO_SOURCE" "$PHOTO_TARGET"
install -o "$NGINX_USER" -g "$NGINX_GROUP" -m 0640 "$LOGO_SOURCE" "$LOGO_TARGET"

# Keep all project CMS media readable by the Nginx worker without making it public on disk.
find "$MEDIA_DIR" -type d -exec chgrp "$NGINX_GROUP" {} + -exec chmod 0750 {} +
find "$MEDIA_DIR" -type f -exec chgrp "$NGINX_GROUP" {} + -exec chmod 0640 {} +

# In an alias location, Nginx already returns 404 when the target is absent.
# Remove only the problematic media-block check; leave every other try_files rule unchanged.
NGINX_TEMP="$(mktemp "${NGINX_SITE}.media-repair.XXXXXX")"
awk '
  BEGIN { in_media = 0 }
  {
    if (!in_media && $0 ~ /location[[:space:]]+\^~[[:space:]]+\/media-uploads\/[[:space:]]*\{/) in_media = 1
    if (in_media && $0 ~ /^[[:space:]]*try_files[[:space:]]+\$uri[[:space:]]+=404;[[:space:]]*$/) next
    print
    if (in_media && $0 ~ /^[[:space:]]*}[[:space:]]*$/) in_media = 0
  }
' "$NGINX_SITE" > "$NGINX_TEMP"

if ! cmp -s "$NGINX_SITE" "$NGINX_TEMP"; then
  cp -a "$NGINX_TEMP" "$NGINX_SITE"
fi
rm -f "$NGINX_TEMP"

nginx -t
systemctl reload nginx

PUBLIC_CONFIG="$(curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/api/public/configuration")"
grep -Fq "/media-uploads/$PHOTO_NAME" <<<"$PUBLIC_CONFIG" || { echo "CMS configuration does not reference the expected photograph." >&2; exit 1; }
grep -Fq "/media-uploads/$LOGO_NAME" <<<"$PUBLIC_CONFIG" || { echo "CMS configuration does not reference the expected logo." >&2; exit 1; }

PHOTO_SERVED="$(mktemp)"
LOGO_SERVED="$(mktemp)"
trap 'rm -f "$PHOTO_SERVED" "$LOGO_SERVED"' EXIT
curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/media-uploads/$PHOTO_NAME" -o "$PHOTO_SERVED"
curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/media-uploads/$LOGO_NAME" -o "$LOGO_SERVED"
cmp -s "$PHOTO_SOURCE" "$PHOTO_SERVED" || { echo "Served photograph does not match Sunil's supplied file." >&2; exit 1; }
cmp -s "$LOGO_SOURCE" "$LOGO_SERVED" || { echo "Served logo does not match Sunil's supplied file." >&2; exit 1; }

PHOTO_HASH="$(sha256sum "$PHOTO_SOURCE" | awk '{print $1}')"
LOGO_HASH="$(sha256sum "$LOGO_SOURCE" | awk '{print $1}')"
trap - ERR

echo "=================================================="
echo " HEAD–HEART PUBLIC MEDIA REPAIR PASSED"
echo "=================================================="
echo "Nginx site: $NGINX_SITE"
echo "Media directory: $MEDIA_DIR"
echo "Photograph SHA-256: $PHOTO_HASH"
echo "Logo SHA-256: $LOGO_HASH"
echo "Backup: $REPAIR_BACKUP_DIR"
echo "CMS references and public file delivery verified."
