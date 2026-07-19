#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="${DOMAIN:-head-heart.atomglobal.com}"
APP_ROOT="${APP_ROOT:-/var/www/head-heart.atomglobal.com}"
ENV_FILE="${ENV_FILE:-/etc/head-heart-alignment/app.env}"
STORAGE="${STORAGE:-/var/lib/head-heart-alignment}"
TIMER="${TIMER:-head-heart-v2-sync.timer}"

failures=0

check_service() {
  local service="$1"
  local enabled active
  enabled="$(systemctl is-enabled "$service" 2>/dev/null || true)"
  active="$(systemctl is-active "$service" 2>/dev/null || true)"
  printf '%-18s enabled=%-10s active=%s\n' "$service" "$enabled" "$active"
  if [[ "$enabled" != "enabled" || "$active" != "active" ]]; then
    failures=$((failures + 1))
  fi
}

echo "=================================================="
echo " HEAD–HEART REBOOT READINESS AUDIT"
echo "=================================================="

echo
echo "===== 1. BOOT SERVICES ====="
check_service nginx
check_service php8.3-fpm
check_service mariadb
check_service cron

echo
echo "===== 2. NGINX CONFIGURATION ====="
if nginx -t; then
  echo "Nginx syntax: PASS"
else
  echo "Nginx syntax: FAIL"
  failures=$((failures + 1))
fi

echo
echo "===== 3. PERSISTENT APPLICATION PATHS ====="
if [[ -L "$APP_ROOT/current" ]]; then
  echo "Current release: $(readlink -f "$APP_ROOT/current")"
else
  echo "ERROR: $APP_ROOT/current is not a symlink."
  failures=$((failures + 1))
fi

if [[ -s "$APP_ROOT/v2-deployed-commit.txt" ]]; then
  echo "Live commit: $(cat "$APP_ROOT/v2-deployed-commit.txt")"
else
  echo "ERROR: deployed commit marker is missing."
  failures=$((failures + 1))
fi

if [[ -r "$ENV_FILE" ]]; then
  stat -c 'Environment: %A %U:%G %n' "$ENV_FILE"
else
  echo "ERROR: production environment is unreadable."
  failures=$((failures + 1))
fi

if runuser -u www-data -- test -w "$STORAGE"; then
  echo "Storage writable by www-data: PASS"
else
  echo "Storage writable by www-data: FAIL"
  failures=$((failures + 1))
fi

echo
echo "===== 4. CRON PERSISTENCE ====="
if [[ -s /etc/cron.d/head-heart-alignment ]]; then
  cat /etc/cron.d/head-heart-alignment
else
  echo "ERROR: application cron file is missing."
  failures=$((failures + 1))
fi

echo
echo "===== 5. AUTOMATIC GIT TIMER ====="
echo "Timer enabled: $(systemctl is-enabled "$TIMER" 2>/dev/null || true)"
echo "Timer active:  $(systemctl is-active "$TIMER" 2>/dev/null || true)"
if [[ "$(systemctl is-enabled "$TIMER" 2>/dev/null || true)" != "disabled" ]]; then
  echo "ERROR: automatic deployment timer must remain disabled."
  failures=$((failures + 1))
fi

echo
echo "===== 6. LIVE HTTP CHECKS ====="
health_file="$(mktemp)"
trap 'rm -f "$health_file"' EXIT

health_code="$(curl --silent --show-error --max-time 30 --output "$health_file" --write-out '%{http_code}' "https://${DOMAIN}/api/health" || true)"
echo "Health HTTP: $health_code"
cat "$health_file" || true
echo
if [[ "$health_code" != "200" ]] || ! grep -q '"status":"ok"' "$health_file"; then
  failures=$((failures + 1))
fi

session_code="$(curl --silent --show-error --max-time 30 --output /dev/null --write-out '%{http_code}' "https://${DOMAIN}/api/admin/session" || true)"
home_code="$(curl --silent --show-error --max-time 30 --output /dev/null --write-out '%{http_code}' "https://${DOMAIN}/" || true)"
admin_code="$(curl --silent --show-error --max-time 30 --output /dev/null --write-out '%{http_code}' "https://${DOMAIN}/admin" || true)"

echo "Admin session HTTP: $session_code (expected 401 while signed out)"
echo "Home HTTP:          $home_code"
echo "Admin HTTP:         $admin_code"

[[ "$session_code" == "401" ]] || failures=$((failures + 1))
[[ "$home_code" == "200" ]] || failures=$((failures + 1))
[[ "$admin_code" == "200" ]] || failures=$((failures + 1))

echo
echo "=================================================="
if [[ "$failures" -eq 0 ]]; then
  echo " REBOOT READINESS: PASS"
  echo " Standard boot services, persistent paths, cron and live checks are healthy."
else
  echo " REBOOT READINESS: FAIL ($failures issue(s))"
fi
echo "=================================================="

exit "$failures"
