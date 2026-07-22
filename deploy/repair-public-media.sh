#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="${DOMAIN:-head-heart.atomglobal.com}"
APP_ROOT="${APP_ROOT:-/var/www/head-heart.atomglobal.com}"
ENV_FILE="${ENV_FILE:-/etc/head-heart-alignment/app.env}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/head-heart-alignment}"
FRONTEND_DIR="${FRONTEND_DIR:-$APP_ROOT/current/frontend}"
PHOTO_SOURCE="${PHOTO_SOURCE:-/root/niklas-liniger-cs58J0MvILA-unsplash.jpg}"
LOGO_SOURCE="${LOGO_SOURCE:-/root/Atom Global 2019.png}"
PHOTO_NAME="${PHOTO_NAME:-sunil-opening-6af386d476e53f13429d.jpg}"
LOGO_NAME="${LOGO_NAME:-atom-global-2019-dc59d6f1ab15aa23112c.png}"

[[ $EUID -eq 0 ]] || { echo "Run as root." >&2; exit 1; }

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

  if [[ -z "$WEB_USER" && -r /etc/nginx/nginx.conf ]]; then
    WEB_USER="$(awk '$1 == "user" {gsub(";", "", $2); print $2; exit}' /etc/nginx/nginx.conf)"
  fi

  WEB_USER="${WEB_USER:-www-data}"
  id "$WEB_USER" >/dev/null 2>&1 || { echo "Web-server worker user does not exist: $WEB_USER" >&2; exit 1; }
  WEB_GROUP="${WEB_GROUP:-$(id -gn "$WEB_USER")}"
}

restore_metadata() {
  local path="$1" metadata="$2" uid gid mode
  IFS=: read -r uid gid mode <<<"$metadata"
  chown "$uid:$gid" "$path" 2>/dev/null || true
  chmod "$mode" "$path" 2>/dev/null || true
}

for command in curl install cp cmp awk grep sha256sum mktemp id stat readlink ln rm chgrp chmod chown ps; do
  command -v "$command" >/dev/null 2>&1 || { echo "Missing required command: $command" >&2; exit 1; }
done

[[ -r "$ENV_FILE" ]] || { echo "Missing environment file: $ENV_FILE" >&2; exit 1; }
[[ -f "$PHOTO_SOURCE" ]] || { echo "Missing supplied photograph: $PHOTO_SOURCE" >&2; exit 1; }
[[ -f "$LOGO_SOURCE" ]] || { echo "Missing supplied logo: $LOGO_SOURCE" >&2; exit 1; }
[[ -d "$FRONTEND_DIR" ]] || { echo "Current frontend directory is missing: $FRONTEND_DIR" >&2; exit 1; }

load_env_file
detect_web_identity
[[ -n "${STORAGE_PATH:-}" ]] || { echo "STORAGE_PATH is not configured." >&2; exit 1; }

MEDIA_DIR="${STORAGE_PATH%/}/media"
PHOTO_TARGET="$MEDIA_DIR/$PHOTO_NAME"
LOGO_TARGET="$MEDIA_DIR/$LOGO_NAME"
PUBLIC_LINK="$FRONTEND_DIR/media-uploads"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REPAIR_BACKUP_DIR="$BACKUP_DIR/public-media-repair-$STAMP"
PHOTO_EXISTED=0
LOGO_EXISTED=0
LINK_EXISTED=0
LINK_TARGET_BEFORE=""

if [[ -e "$PUBLIC_LINK" && ! -L "$PUBLIC_LINK" ]]; then
  echo "Refusing to replace a real file or directory at $PUBLIC_LINK." >&2
  exit 1
fi

install -d -m 0750 "$REPAIR_BACKUP_DIR"
install -d -m 0750 "$STORAGE_PATH" "$MEDIA_DIR"
STORAGE_METADATA="$(stat -c '%u:%g:%a' "$STORAGE_PATH")"
MEDIA_METADATA="$(stat -c '%u:%g:%a' "$MEDIA_DIR")"

if [[ -e "$PHOTO_TARGET" ]]; then cp -a "$PHOTO_TARGET" "$REPAIR_BACKUP_DIR/$PHOTO_NAME"; PHOTO_EXISTED=1; fi
if [[ -e "$LOGO_TARGET" ]]; then cp -a "$LOGO_TARGET" "$REPAIR_BACKUP_DIR/$LOGO_NAME"; LOGO_EXISTED=1; fi
if [[ -L "$PUBLIC_LINK" ]]; then
  LINK_EXISTED=1
  LINK_TARGET_BEFORE="$(readlink "$PUBLIC_LINK")"
  printf '%s\n' "$LINK_TARGET_BEFORE" > "$REPAIR_BACKUP_DIR/media-uploads-link-before.txt"
fi

rollback() {
  set +e
  echo "Repair failed; restoring the prior Head–Heart media files and frontend link." >&2
  if [[ $PHOTO_EXISTED -eq 1 ]]; then cp -a "$REPAIR_BACKUP_DIR/$PHOTO_NAME" "$PHOTO_TARGET"; else rm -f "$PHOTO_TARGET"; fi
  if [[ $LOGO_EXISTED -eq 1 ]]; then cp -a "$REPAIR_BACKUP_DIR/$LOGO_NAME" "$LOGO_TARGET"; else rm -f "$LOGO_TARGET"; fi
  if [[ $LINK_EXISTED -eq 1 ]]; then ln -sfn "$LINK_TARGET_BEFORE" "$PUBLIC_LINK"; else rm -f "$PUBLIC_LINK"; fi
  restore_metadata "$STORAGE_PATH" "$STORAGE_METADATA"
  restore_metadata "$MEDIA_DIR" "$MEDIA_METADATA"
}
trap rollback ERR

# Preserve private on-disk access while allowing the active Apache/Nginx worker to read.
chgrp "$WEB_GROUP" "$STORAGE_PATH" "$MEDIA_DIR"
chmod 0750 "$STORAGE_PATH" "$MEDIA_DIR"
install -o "$WEB_USER" -g "$WEB_GROUP" -m 0640 "$PHOTO_SOURCE" "$PHOTO_TARGET"
install -o "$WEB_USER" -g "$WEB_GROUP" -m 0640 "$LOGO_SOURCE" "$LOGO_TARGET"

# The new VPS serves the site through Apache. Expose persistent CMS media from the
# immutable frontend without editing or restarting the global web-server service.
ln -sfn "$MEDIA_DIR" "$PUBLIC_LINK"
[[ -L "$PUBLIC_LINK" ]] || { echo "Public media link was not created." >&2; exit 1; }
[[ "$(readlink -f "$PUBLIC_LINK")" == "$(readlink -f "$MEDIA_DIR")" ]] || { echo "Public media link points to the wrong directory." >&2; exit 1; }

PUBLIC_CONFIG="$(curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/api/public/configuration")"
grep -Fq "/media-uploads/$PHOTO_NAME" <<<"$PUBLIC_CONFIG" || { echo "CMS configuration does not reference the expected photograph." >&2; exit 1; }
grep -Fq "/media-uploads/$LOGO_NAME" <<<"$PUBLIC_CONFIG" || { echo "CMS configuration does not reference the expected logo." >&2; exit 1; }

PHOTO_SERVED="$(mktemp)"
LOGO_SERVED="$(mktemp)"
PHOTO_HEADERS="$(mktemp)"
LOGO_HEADERS="$(mktemp)"
cleanup() { rm -f "$PHOTO_SERVED" "$LOGO_SERVED" "$PHOTO_HEADERS" "$LOGO_HEADERS"; }
trap cleanup EXIT

curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" -D "$PHOTO_HEADERS" -o "$PHOTO_SERVED" "https://$DOMAIN/media-uploads/$PHOTO_NAME"
curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" -D "$LOGO_HEADERS" -o "$LOGO_SERVED" "https://$DOMAIN/media-uploads/$LOGO_NAME"
grep -Eiq '^content-type:[[:space:]]*image/' "$PHOTO_HEADERS" || { echo "Photograph URL returned a non-image response." >&2; cat "$PHOTO_HEADERS" >&2; exit 1; }
grep -Eiq '^content-type:[[:space:]]*image/' "$LOGO_HEADERS" || { echo "Logo URL returned a non-image response." >&2; cat "$LOGO_HEADERS" >&2; exit 1; }
cmp -s "$PHOTO_SOURCE" "$PHOTO_SERVED" || { echo "Served photograph does not match Sunil's supplied file." >&2; exit 1; }
cmp -s "$LOGO_SOURCE" "$LOGO_SERVED" || { echo "Served logo does not match Sunil's supplied file." >&2; exit 1; }

PHOTO_HASH="$(sha256sum "$PHOTO_SOURCE" | awk '{print $1}')"
LOGO_HASH="$(sha256sum "$LOGO_SOURCE" | awk '{print $1}')"
SERVER_HEADER="$(curl --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" -I "https://$DOMAIN/" | awk 'BEGIN{IGNORECASE=1} /^server:/{sub(/^[^:]+:[[:space:]]*/, ""); gsub("\r", ""); print; exit}')"
trap - ERR

echo "=================================================="
echo " HEAD–HEART PUBLIC MEDIA REPAIR PASSED"
echo "=================================================="
echo "Detected web worker: $WEB_USER:$WEB_GROUP"
echo "Serving software: ${SERVER_HEADER:-not disclosed}"
echo "Frontend media link: $PUBLIC_LINK -> $(readlink "$PUBLIC_LINK")"
echo "Media directory: $MEDIA_DIR"
echo "Photograph SHA-256: $PHOTO_HASH"
echo "Logo SHA-256: $LOGO_HASH"
echo "Backup: $REPAIR_BACKUP_DIR"
echo "No Apache or Nginx service was started or reloaded."
echo "CMS references and exact public file delivery verified."
