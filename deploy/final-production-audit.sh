#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="${DOMAIN:-head-heart.atomglobal.com}"
APP_ROOT="${APP_ROOT:-/var/www/head-heart.atomglobal.com}"
ENV_FILE="${ENV_FILE:-/etc/head-heart-alignment/app.env}"
PHP_BIN="${PHP_BIN:-/usr/bin/php8.3}"
TIMER="${TIMER:-head-heart-v2-sync.timer}"

failures=0
warnings=0

pass() { printf 'PASS: %s\n' "$1"; }
warn() { printf 'WARN: %s\n' "$1"; warnings=$((warnings + 1)); }
fail() { printf 'FAIL: %s\n' "$1"; failures=$((failures + 1)); }

check_http() {
  local label="$1" url="$2" expected="$3" body_file code
  body_file="$(mktemp)"
  code="$(curl --silent --show-error --max-time 30 --output "$body_file" --write-out '%{http_code}' "$url" || true)"
  if [[ "$code" == "$expected" ]]; then pass "$label returned HTTP $code"; else fail "$label returned HTTP $code, expected $expected"; fi
  cat "$body_file" 2>/dev/null || true
  echo
  rm -f "$body_file"
}

echo "=================================================="
echo " HEAD–HEART FINAL PRODUCTION AUDIT"
echo "=================================================="

for service in nginx php8.3-fpm mariadb cron; do
  enabled="$(systemctl is-enabled "$service" 2>/dev/null || true)"
  active="$(systemctl is-active "$service" 2>/dev/null || true)"
  if [[ "$enabled" == "enabled" && "$active" == "active" ]]; then
    pass "$service is enabled and active"
  else
    fail "$service enabled=$enabled active=$active"
  fi
done

if nginx -t; then pass "Nginx configuration syntax"; else fail "Nginx configuration syntax"; fi

if [[ -L "$APP_ROOT/current" && -d "$(readlink -f "$APP_ROOT/current")" ]]; then
  RELEASE="$(readlink -f "$APP_ROOT/current")"
  pass "Immutable current release exists: $RELEASE"
else
  RELEASE=""
  fail "Current release symlink is missing or invalid"
fi

if [[ -s "$APP_ROOT/v2-deployed-commit.txt" ]]; then
  COMMIT="$(cat "$APP_ROOT/v2-deployed-commit.txt")"
  pass "Deployed commit marker exists: $COMMIT"
else
  COMMIT=""
  fail "Deployed commit marker is missing"
fi

if [[ -s "$ENV_FILE" ]]; then
  pass "Protected production environment exists"
  stat -c '%A %U:%G %n' "$ENV_FILE"
else
  fail "Production environment is missing"
fi

if [[ -n "$RELEASE" ]]; then
  [[ -s "$RELEASE/frontend/index.html" ]] && pass "Frontend build exists" || fail "Frontend build is missing"
  [[ -s "$RELEASE/backend/public/index.php" ]] && pass "Backend entry point exists" || fail "Backend entry point is missing"
  [[ -s "$RELEASE/backend/vendor/autoload.php" ]] && pass "Production Composer dependencies exist" || fail "Composer dependencies are missing"
  [[ -L "$RELEASE/backend/.env" || -s "$RELEASE/backend/.env" ]] && pass "Release environment link exists" || fail "Release environment link is missing"
fi

if [[ "$(systemctl is-enabled "$TIMER" 2>/dev/null || true)" == "disabled" && "$(systemctl is-active "$TIMER" 2>/dev/null || true)" == "inactive" ]]; then
  pass "Automatic Git deployment timer remains disabled"
else
  fail "Automatic Git deployment timer is not disabled/inactive"
fi

if [[ -s /etc/cron.d/head-heart-alignment ]]; then
  pass "Application cron file exists"
  cat /etc/cron.d/head-heart-alignment
else
  fail "Application cron file is missing"
fi

check_http "Public home" "https://$DOMAIN/" 200
check_http "Public admin" "https://$DOMAIN/admin" 200
check_http "Signed-out admin session" "https://$DOMAIN/api/admin/session" 401

HEALTH="$(curl --fail --silent --show-error --max-time 30 "https://$DOMAIN/api/health" || true)"
echo "$HEALTH"
if grep -q '"status":"ok"' <<<"$HEALTH"; then pass "Production API health status"; else fail "Production API health status"; fi
for key in database migrations storage email cron; do
  if grep -q '"'"$key"'":true' <<<"$HEALTH"; then pass "Health check: $key"; else fail "Health check: $key"; fi
done
if grep -q '"stripe":true' <<<"$HEALTH" && grep -q '"stripeWebhook":true' <<<"$HEALTH"; then
  pass "Stripe and webhook are configured"
else
  warn "Stripe or signed webhook is not configured; keep checkout out of client acceptance until test mode passes"
fi

if [[ -n "$RELEASE" && -x "$PHP_BIN" ]]; then
  export RELEASE
  AUDIT_JSON="$(runuser -u www-data -- "$PHP_BIN" -r '
    $release = getenv("RELEASE");
    $c = require $release . "/backend/src/bootstrap.php";
    $db = $c["db"];
    $result = [
      "environment" => $c["config"]["env"] ?? null,
      "tracks" => (int) (($db->fetch("SELECT COUNT(*) value FROM assessment_tracks WHERE is_active = 1")["value"] ?? 0)),
      "publishedVersions" => (int) (($db->fetch("SELECT COUNT(*) value FROM assessment_versions WHERE status = ?", ["published"])["value"] ?? 0)),
      "publishedQuestions" => (int) (($db->fetch("SELECT COUNT(*) value FROM questions q JOIN assessment_versions v ON v.id = q.assessment_version_id WHERE v.status = ? AND q.is_active = 1", ["published"])["value"] ?? 0)),
      "activeTemplates" => (int) (($db->fetch("SELECT COUNT(*) value FROM email_templates WHERE is_active = 1")["value"] ?? 0)),
      "ownerUsers" => (int) (($db->fetch("SELECT COUNT(*) value FROM admin_users u JOIN roles r ON r.id = u.role_id WHERE r.role_key = ? AND u.is_active = 1", ["owner"])["value"] ?? 0)),
      "queuedEmail" => (int) (($db->fetch("SELECT COUNT(*) value FROM email_queue WHERE status IN (?, ?)", ["queued", "retry"])["value"] ?? 0)),
      "failedEmail" => (int) (($db->fetch("SELECT COUNT(*) value FROM email_queue WHERE status = ?", ["failed"])["value"] ?? 0)),
      "failedWebhooks" => (int) (($db->fetch("SELECT COUNT(*) value FROM stripe_webhook_events WHERE status = ?", ["failed"])["value"] ?? 0)),
      "recentCron" => (int) (($db->fetch("SELECT COUNT(*) value FROM background_jobs WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)")["value"] ?? 0)),
    ];
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), PHP_EOL;
  ' 2>/dev/null || true)"
  echo "$AUDIT_JSON"
  grep -q '"environment": "production"' <<<"$AUDIT_JSON" && pass "Backend bootstrap uses production environment" || fail "Backend bootstrap production environment"
  grep -q '"tracks": 4' <<<"$AUDIT_JSON" && pass "Four active assessment tracks" || fail "Four active assessment tracks"
  PUBLISHED="$(sed -n 's/.*"publishedVersions": \([0-9][0-9]*\).*/\1/p' <<<"$AUDIT_JSON")"
  QUESTIONS="$(sed -n 's/.*"publishedQuestions": \([0-9][0-9]*\).*/\1/p' <<<"$AUDIT_JSON")"
  TEMPLATES="$(sed -n 's/.*"activeTemplates": \([0-9][0-9]*\).*/\1/p' <<<"$AUDIT_JSON")"
  OWNERS="$(sed -n 's/.*"ownerUsers": \([0-9][0-9]*\).*/\1/p' <<<"$AUDIT_JSON")"
  FAILED_EMAIL="$(sed -n 's/.*"failedEmail": \([0-9][0-9]*\).*/\1/p' <<<"$AUDIT_JSON")"
  FAILED_WEBHOOKS="$(sed -n 's/.*"failedWebhooks": \([0-9][0-9]*\).*/\1/p' <<<"$AUDIT_JSON")"
  [[ "${PUBLISHED:-0}" -ge 4 ]] && pass "Published assessment versions are present" || fail "Expected at least four published assessment versions"
  [[ "${QUESTIONS:-0}" -ge 200 ]] && pass "Published question bank contains at least 200 questions" || fail "Published question bank is incomplete"
  [[ "${TEMPLATES:-0}" -ge 12 ]] && pass "Client-editable email templates are present" || fail "Email template set is incomplete"
  [[ "${OWNERS:-0}" -ge 1 ]] && pass "Active owner account exists" || fail "Active owner account is missing"
  [[ "${FAILED_EMAIL:-0}" -eq 0 ]] && pass "No failed email queue records" || warn "$FAILED_EMAIL failed email queue record(s) require review"
  [[ "${FAILED_WEBHOOKS:-0}" -eq 0 ]] && pass "No failed Stripe webhook records" || warn "$FAILED_WEBHOOKS failed webhook record(s) require review"
else
  fail "Production PHP runtime audit could not execute"
fi

LATEST_BACKUP="$(find /var/backups/head-heart-alignment -maxdepth 1 -type f -name '*.sql.gz' -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2- || true)"
if [[ -n "$LATEST_BACKUP" && -s "$LATEST_BACKUP" ]]; then
  AGE_SECONDS=$(( $(date +%s) - $(stat -c %Y "$LATEST_BACKUP") ))
  if [[ "$AGE_SECONDS" -le 604800 ]]; then pass "Recent database backup exists: $LATEST_BACKUP"; else warn "Latest database backup is older than seven days: $LATEST_BACKUP"; fi
else
  fail "No production database backup was found"
fi

echo
 echo "=================================================="
echo " FINAL RESULT: failures=$failures warnings=$warnings"
if [[ "$failures" -eq 0 ]]; then
  echo " PRODUCTION CORE: READY"
  if [[ "$warnings" -gt 0 ]]; then echo " EXTERNAL/OPERATIONAL ITEMS: REVIEW WARNINGS ABOVE"; fi
else
  echo " PRODUCTION CORE: NOT READY"
fi
echo "=================================================="

exit "$failures"
