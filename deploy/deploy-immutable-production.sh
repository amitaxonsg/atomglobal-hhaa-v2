#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="${DOMAIN:-head-heart.atomglobal.com}"
APP_ROOT="${APP_ROOT:-/var/www/head-heart.atomglobal.com}"
SOURCE_DIR="${SOURCE_DIR:-/srv/head-heart.atomglobal.com/source}"
ENV_FILE="${ENV_FILE:-/etc/head-heart-alignment/app.env}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/head-heart-alignment}"
PHP_FPM_SERVICE="${PHP_FPM_SERVICE:-php8.3-fpm}"
EXPECTED_COMMIT="${EXPECTED_COMMIT:-$(git -C "$SOURCE_DIR" rev-parse HEAD)}"
SITE_LINK="${SITE_LINK:-/etc/nginx/sites-enabled/head-heart.atomglobal.com.conf}"
SITE_FILE="$(readlink -f "$SITE_LINK")"
STAMP="$(date +%Y%m%d-%H%M%S)"
AUDIT="/root/head-heart-immutable-deploy-$STAMP"

mkdir -p "$AUDIT"

systemctl disable --now head-heart-v2-sync.timer 2>/dev/null || true

CURRENT_SOURCE_COMMIT="$(git -C "$SOURCE_DIR" rev-parse HEAD)"
[[ "$CURRENT_SOURCE_COMMIT" == "$EXPECTED_COMMIT" ]] || {
  echo "Source commit does not match EXPECTED_COMMIT." >&2
  echo "Expected: $EXPECTED_COMMIT" >&2
  echo "Current:  $CURRENT_SOURCE_COMMIT" >&2
  exit 1
}
[[ -z "$(git -C "$SOURCE_DIR" status --porcelain)" ]] || {
  echo "Source checkout contains local changes." >&2
  git -C "$SOURCE_DIR" status --short
  exit 1
}

[[ -f "$SITE_FILE" ]] || { echo "Loaded Head–Heart Nginx file was not found." >&2; exit 1; }
[[ -s "$ENV_FILE" ]] || { echo "Production environment file is missing." >&2; exit 1; }

PREVIOUS_RELEASE="$(readlink -f "$APP_ROOT/current")"
PREVIOUS_COMMIT="$(cat "$APP_ROOT/v2-deployed-commit.txt")"
cp -a "$SITE_FILE" "$AUDIT/nginx.before"
nginx -T > "$AUDIT/nginx-full.before.txt" 2>&1

rollback() {
  local code="${1:-1}"
  trap - ERR
  echo
  echo "=================================================="
  echo " IMMUTABLE DEPLOYMENT FAILED — RESTORING PREVIOUS RELEASE"
  echo "=================================================="
  cp -a "$AUDIT/nginx.before" "$SITE_FILE"
  if [[ -d "$PREVIOUS_RELEASE" ]]; then
    ln -sfn "$PREVIOUS_RELEASE" "$APP_ROOT/current.rollback"
    mv -Tf "$APP_ROOT/current.rollback" "$APP_ROOT/current"
    printf '%s\n' "$PREVIOUS_COMMIT" > "$APP_ROOT/deployed-commit.txt"
    printf '%s\n' "$PREVIOUS_COMMIT" > "$APP_ROOT/v2-deployed-commit.txt"
  fi
  nginx -t >/dev/null 2>&1 && systemctl reload "$PHP_FPM_SERVICE" nginx || true
  echo "Previous release restored: $PREVIOUS_RELEASE"
  echo "Audit directory: $AUDIT"
  exit "$code"
}
trap 'rollback "$?"' ERR

echo "=================================================="
echo " HEAD–HEART IMMUTABLE PRODUCTION DEPLOYMENT"
echo "=================================================="
echo "Previous release: $PREVIOUS_RELEASE"
echo "Target commit:    $EXPECTED_COMMIT"

APP_ROOT="$APP_ROOT" \
SOURCE_DIR="$SOURCE_DIR" \
ENV_FILE="$ENV_FILE" \
BACKUP_DIR="$BACKUP_DIR" \
PHP_FPM_SERVICE="$PHP_FPM_SERVICE" \
DOMAIN="$DOMAIN" \
bash "$SOURCE_DIR/deploy/update-vps.sh"

NEW_RELEASE="$(readlink -f "$APP_ROOT/current")"
NEW_COMMIT="$(cat "$APP_ROOT/v2-deployed-commit.txt")"

[[ "$NEW_RELEASE" != "$PREVIOUS_RELEASE" ]] || { echo "A new release was not created." >&2; exit 1; }
[[ "$NEW_COMMIT" == "$EXPECTED_COMMIT" ]] || { echo "Deployed commit marker is incorrect." >&2; exit 1; }
[[ -s "$NEW_RELEASE/frontend/index.html" ]] || { echo "New frontend is missing." >&2; exit 1; }
[[ -s "$NEW_RELEASE/backend/public/index.php" ]] || { echo "New backend is missing." >&2; exit 1; }

export SITE_FILE PREVIOUS_RELEASE NEW_RELEASE APP_ROOT
python3 <<'PY'
import os
from pathlib import Path

path = Path(os.environ["SITE_FILE"])
text = path.read_text(encoding="utf-8")
old = os.environ["PREVIOUS_RELEASE"]
new = os.environ["NEW_RELEASE"]
current = os.environ["APP_ROOT"] + "/current"

if old in text:
    text = text.replace(old, new)
elif current not in text:
    raise SystemExit("The Nginx file uses neither the previous immutable release nor the current symlink.")

path.write_text(text, encoding="utf-8")
PY

nginx -t
systemctl reload nginx
sleep 2

LOCAL_HEALTH="$(curl --fail --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/api/health")"
grep -q '"status":"ok"' <<<"$LOCAL_HEALTH"

echo "Local health: $LOCAL_HEALTH"

SESSION_CODE="$(curl --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" --output "$AUDIT/admin-session.json" --write-out '%{http_code}' "https://$DOMAIN/api/admin/session")"
HOME_CODE="$(curl --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" --output /dev/null --write-out '%{http_code}' "https://$DOMAIN/")"
ADMIN_CODE="$(curl --silent --show-error --max-time 20 --resolve "$DOMAIN:443:127.0.0.1" --output /dev/null --write-out '%{http_code}' "https://$DOMAIN/admin")"

[[ "$SESSION_CODE" == "401" ]] || { echo "Unexpected signed-out admin session status: $SESSION_CODE" >&2; exit 1; }
[[ "$HOME_CODE" == "200" ]] || { echo "Home status is $HOME_CODE" >&2; exit 1; }
[[ "$ADMIN_CODE" == "200" ]] || { echo "Admin status is $ADMIN_CODE" >&2; exit 1; }

PUBLIC_HEALTH="$(curl --fail --silent --show-error --max-time 30 "https://$DOMAIN/api/health")"
grep -q '"status":"ok"' <<<"$PUBLIC_HEALTH"

echo "Public health: $PUBLIC_HEALTH"

runuser -u www-data -- sh -c "cd '$APP_ROOT/current/backend' && /usr/bin/php8.3 bin/cron.php" || true

systemctl disable --now head-heart-v2-sync.timer 2>/dev/null || true

trap - ERR

echo
 echo "=================================================="
echo " HEAD–HEART IMMUTABLE DEPLOYMENT COMPLETE"
echo " Release: $NEW_RELEASE"
echo " Commit:  $NEW_COMMIT"
echo " Website: https://$DOMAIN/"
echo " Admin:   https://$DOMAIN/admin"
echo " Audit:   $AUDIT"
echo "=================================================="
