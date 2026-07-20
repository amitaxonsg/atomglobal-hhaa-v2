#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="${DOMAIN:-head-heart.atomglobal.com}"
APP_ROOT="${APP_ROOT:-/var/www/head-heart.atomglobal.com}"
ENV_FILE="${ENV_FILE:-/etc/head-heart-alignment/app.env}"
TIMER="${TIMER:-head-heart-v2-sync.timer}"
SMOKE_RECIPIENT="${SMOKE_RECIPIENT:-}"
SMOKE_TRACK="${SMOKE_TRACK:-personal}"
SMOKE_SEND_EMAIL="${SMOKE_SEND_EMAIL:-0}"

failures=0
warnings=0
pass() { printf 'PASS: %s\n' "$1"; }
warn() { printf 'WARN: %s\n' "$1"; warnings=$((warnings + 1)); }
fail() { printf 'FAIL: %s\n' "$1"; failures=$((failures + 1)); }

json_has() {
  local file="$1" expression="$2"
  python3 - "$file" "$expression" <<'PY'
import json, sys
path, expression = sys.argv[1:3]
with open(path, encoding="utf-8") as handle:
    data = json.load(handle)
value = data
for part in expression.split('.'):
    if isinstance(value, dict) and part in value:
        value = value[part]
    else:
        raise SystemExit(1)
if value in (None, "", False):
    raise SystemExit(1)
PY
}

check_http() {
  local label="$1" url="$2" expected="$3" code
  code="$(curl --silent --show-error --max-time 30 --output /dev/null --write-out '%{http_code}' "$url" || true)"
  [[ "$code" == "$expected" ]] && pass "$label returned HTTP $code" || fail "$label returned HTTP $code; expected $expected"
}

echo "=================================================="
echo " HEAD–HEART FULL PRODUCTION AUDIT"
echo "=================================================="

for service in nginx php8.3-fpm mariadb cron; do
  enabled="$(systemctl is-enabled "$service" 2>/dev/null || true)"
  active="$(systemctl is-active "$service" 2>/dev/null || true)"
  [[ "$active" == "active" ]] && pass "$service is active" || fail "$service is not active"
  [[ "$enabled" == "enabled" || "$service" == "php8.3-fpm" ]] || warn "$service enabled state is $enabled"
done

nginx -t && pass "Nginx configuration syntax" || fail "Nginx configuration syntax"

RELEASE="$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)"
COMMIT="$(cat "$APP_ROOT/deployed-commit.txt" 2>/dev/null || cat "$APP_ROOT/v2-deployed-commit.txt" 2>/dev/null || true)"
[[ -n "$RELEASE" && -d "$RELEASE" ]] && pass "Immutable release exists: $RELEASE" || fail "Current release is missing"
[[ -n "$COMMIT" ]] && pass "Deployed commit marker exists: $COMMIT" || fail "Deployed commit marker is missing"
[[ -s "$ENV_FILE" ]] && pass "Protected production environment exists" || fail "Production environment is missing"

if [[ -n "$RELEASE" ]]; then
  [[ -s "$RELEASE/frontend/index.html" ]] && pass "Frontend build exists" || fail "Frontend build is missing"
  [[ -s "$RELEASE/backend/public/index.php" ]] && pass "Backend entry point exists" || fail "Backend entry point is missing"
  [[ -s "$RELEASE/backend/vendor/autoload.php" ]] && pass "Composer dependencies exist" || fail "Composer dependencies are missing"
  grep -R -F -q 'latest-visual-panel' "$RELEASE/frontend/assets" 2>/dev/null && pass "Left visual panel is present" || fail "Left visual panel is absent"
  for label in Personal 'New Joiner' Manager Executive; do
    grep -R -F -q "$label" "$RELEASE/frontend/assets" 2>/dev/null && pass "Frontend bundle contains $label" || fail "Frontend bundle is missing $label"
  done
  grep -R -F -q 'questionnaire-intake-width' "$RELEASE/frontend/assets" 2>/dev/null && pass "Expanded questionnaire branding tokens are present" || warn "Expanded questionnaire branding tokens are not deployed yet"
fi

NGINX_SITE=""
for candidate in "/etc/nginx/sites-enabled/$DOMAIN.conf" "/etc/nginx/sites-available/$DOMAIN.conf"; do
  [[ -e "$candidate" ]] && NGINX_SITE="$(readlink -f "$candidate")" && break
done
if [[ -n "$NGINX_SITE" && -n "$RELEASE" ]]; then
  grep -F -q "$RELEASE/frontend" "$NGINX_SITE" && pass "Nginx frontend points to active release" || fail "Nginx frontend path is stale"
  grep -F -q "$RELEASE/backend/public/index.php" "$NGINX_SITE" && pass "Nginx API points to active release" || fail "Nginx API path is stale"
else
  fail "Head–Heart Nginx site could not be resolved"
fi

if [[ "$(systemctl is-enabled "$TIMER" 2>/dev/null || true)" == "disabled" && "$(systemctl is-active "$TIMER" 2>/dev/null || true)" == "inactive" ]]; then
  pass "Automatic Git deployment timer remains disabled"
else
  fail "Automatic Git deployment timer is not disabled/inactive"
fi

[[ -s /etc/cron.d/head-heart-alignment ]] && pass "Application cron file exists" || fail "Application cron file is missing"
check_http "Public home" "https://$DOMAIN/" 200
check_http "Admin shell" "https://$DOMAIN/admin" 200
check_http "Signed-out admin session" "https://$DOMAIN/api/admin/session" 401

HEALTH_FILE="$(mktemp)"
CONFIG_FILE="$(mktemp)"
EXPERIENCE_FILE="$(mktemp)"
trap 'rm -f "$HEALTH_FILE" "$CONFIG_FILE" "$EXPERIENCE_FILE"' EXIT

curl --fail --silent --show-error --max-time 30 "https://$DOMAIN/api/health" > "$HEALTH_FILE" || true
curl --fail --silent --show-error --max-time 30 "https://$DOMAIN/api/public/configuration" > "$CONFIG_FILE" || true
curl --fail --silent --show-error --max-time 30 "https://$DOMAIN/api/public/assessment-experience" > "$EXPERIENCE_FILE" || true

python3 -m json.tool "$HEALTH_FILE" >/dev/null 2>&1 && pass "Health endpoint returns JSON" || fail "Health endpoint is invalid"
python3 -m json.tool "$CONFIG_FILE" >/dev/null 2>&1 && pass "Public configuration returns JSON" || fail "Public configuration is invalid"
python3 -m json.tool "$EXPERIENCE_FILE" >/dev/null 2>&1 && pass "Questionnaire CMS returns JSON" || fail "Questionnaire CMS is invalid"

for key in status checks.database checks.migrations checks.storage checks.email checks.cron; do
  json_has "$HEALTH_FILE" "$key" && pass "Health field: $key" || fail "Health field failed: $key"
done

python3 - "$EXPERIENCE_FILE" <<'PY' && pass "Public CMS exposes exactly four tracks" || fail "Public CMS track list is incorrect"
import json, sys
with open(sys.argv[1], encoding='utf-8') as handle:
    data = json.load(handle)
required = ['personal', 'newjoiner', 'manager', 'executive']
if list(data.get('tracks', {}).keys()) != required:
    raise SystemExit(1)
for key in required:
    item = data['tracks'][key]
    for required_key in ['tagline','introHeadline','introBody','introOffer','intake']:
        if not item.get(required_key):
            raise SystemExit(1)
PY

python3 - "$CONFIG_FILE" <<'PY' && pass "Public branding configuration is complete" || fail "Public branding configuration is incomplete"
import json, sys
with open(sys.argv[1], encoding='utf-8') as handle:
    data = json.load(handle)
branding = data.get('branding', {})
required = [
  'canvas','surface','textPrimary','textMuted','border','cta','ctaHover','heart','head','accent','navy',
  'headingFont','bodyFont','baseFontSize','cardRadius','buttonRadius','logoUrl','emailLogoUrl','reportLogoUrl',
]
for key in required:
    if branding.get(key) in (None, ''):
        raise SystemExit(1)
PY

if [[ -n "$RELEASE" && -s "$RELEASE/backend/vendor/autoload.php" ]]; then
  export RELEASE
  PHP_OUTPUT="$(runuser -u www-data -- php8.3 -d display_errors=0 -d log_errors=0 -r '
    $release = getenv("RELEASE");
    $c = require $release . "/backend/src/bootstrap.php";
    $db = $c["db"];
    $settings = $c["settings"];
    $required = ["personal", "newjoiner", "manager", "executive"];
    $rows = $db->fetchAll(
      "SELECT t.track_key trackKey, v.id versionId, v.version_number versionNumber, v.status, "
      . "(SELECT COUNT(*) FROM questions q WHERE q.assessment_version_id = v.id AND q.is_active = 1) questionCount, "
      . "(SELECT COUNT(*) FROM assessment_sections s WHERE s.assessment_version_id = v.id AND s.is_active = 1) sectionCount, "
      . "(SELECT COUNT(*) FROM answer_options o WHERE o.assessment_version_id = v.id) optionCount, "
      . "(SELECT COUNT(*) FROM report_templates r WHERE r.assessment_version_id = v.id) reportCount "
      . "FROM assessment_tracks t JOIN assessment_versions v ON v.track_id = t.id ORDER BY t.display_order, v.id"
    );
    $versionsOk = count($rows) === 4;
    foreach ($rows as $index => $row) {
      $versionsOk = $versionsOk
        && ($row["trackKey"] ?? null) === ($required[$index] ?? null)
        && $row["versionNumber"] === "2.0.0"
        && $row["status"] === "published"
        && (int) $row["questionCount"] === 50
        && (int) $row["sectionCount"] === 10
        && (int) $row["optionCount"] === 5
        && (int) $row["reportCount"] >= 1;
    }
    $scalar = static fn(string $sql, array $params = []): int => (int) (($db->fetch($sql, $params)["count"] ?? 0));
    $result = [
      "environment" => $c["config"]["env"] ?? null,
      "versionsOk" => $versionsOk,
      "assessmentVersionRows" => count($rows),
      "oldVersionRows" => $scalar("SELECT COUNT(*) count FROM assessment_versions WHERE version_number <> ?", ["2.0.0"]),
      "oldVersionSessions" => $scalar("SELECT COUNT(*) count FROM survey_sessions ss JOIN assessment_versions v ON v.id = ss.assessment_version_id WHERE v.version_number <> ?", ["2.0.0"]),
      "sessionTrackMismatch" => $scalar("SELECT COUNT(*) count FROM survey_sessions ss JOIN assessment_versions v ON v.id = ss.assessment_version_id WHERE ss.track_id <> v.track_id"),
      "scoreVersionMismatch" => $scalar("SELECT COUNT(*) count FROM score_snapshots sc JOIN survey_sessions ss ON ss.id = sc.survey_session_id WHERE sc.assessment_version_id <> ss.assessment_version_id"),
      "reportSessionMismatch" => $scalar("SELECT COUNT(*) count FROM generated_reports gr JOIN score_snapshots sc ON sc.id = gr.score_snapshot_id WHERE gr.survey_session_id <> sc.survey_session_id"),
      "orphanParticipants" => $scalar("SELECT COUNT(*) count FROM participants p WHERE NOT EXISTS (SELECT 1 FROM survey_sessions ss WHERE ss.participant_id = p.id)"),
      "orphanAnswers" => $scalar("SELECT COUNT(*) count FROM survey_answers a LEFT JOIN survey_sessions ss ON ss.id = a.survey_session_id WHERE ss.id IS NULL"),
      "orphanScores" => $scalar("SELECT COUNT(*) count FROM score_snapshots sc LEFT JOIN survey_sessions ss ON ss.id = sc.survey_session_id WHERE ss.id IS NULL"),
      "orphanReports" => $scalar("SELECT COUNT(*) count FROM generated_reports gr LEFT JOIN survey_sessions ss ON ss.id = gr.survey_session_id WHERE ss.id IS NULL"),
      "orphanConsents" => $scalar("SELECT COUNT(*) count FROM consent_logs c LEFT JOIN participants p ON p.id = c.participant_id WHERE p.id IS NULL"),
      "participantCount" => $scalar("SELECT COUNT(*) count FROM participants"),
      "sessionCount" => $scalar("SELECT COUNT(*) count FROM survey_sessions"),
      "completedCount" => $scalar("SELECT COUNT(*) count FROM survey_sessions WHERE status = ?", ["completed"]),
      "answerCount" => $scalar("SELECT COUNT(*) count FROM survey_answers"),
      "scoreCount" => $scalar("SELECT COUNT(*) count FROM score_snapshots"),
      "reportCount" => $scalar("SELECT COUNT(*) count FROM generated_reports"),
      "activeEmailTemplates" => $scalar("SELECT COUNT(*) count FROM email_templates WHERE is_active = 1"),
      "participantTemplates" => $scalar("SELECT COUNT(*) count FROM email_templates WHERE template_key IN (?,?,?,?) AND is_active = 1", ["participant_registration","survey_resume_link","assessment_completed","free_report_ready"]),
      "failedEmail" => $scalar("SELECT COUNT(*) count FROM email_queue WHERE status = ?", ["failed"]),
      "queuedEmail" => $scalar("SELECT COUNT(*) count FROM email_queue WHERE status IN (?,?)", ["queued","retry"]),
      "publishedBranding" => $scalar("SELECT COUNT(*) count FROM branding_revisions WHERE status = ?", ["published"]),
      "referenceVersion" => $settings->get("questionnaire.reference_version", ""),
      "cronLastRun" => $settings->get("system.cron_last_run", ""),
    ];
    $result["cronRecent"] = $result["cronLastRun"] && strtotime((string) $result["cronLastRun"]) > time() - 900;
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), PHP_EOL;
  ' 2>/dev/null || true)"

  echo "$PHP_OUTPUT"
  python3 - <<'PY' <<<"$PHP_OUTPUT" && pass "Database, CMS, report and email integrity" || fail "Database, CMS, report or email integrity failed"
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    raise SystemExit(1)
required_zero = [
  'oldVersionRows','oldVersionSessions','sessionTrackMismatch','scoreVersionMismatch','reportSessionMismatch',
  'orphanParticipants','orphanAnswers','orphanScores','orphanReports','orphanConsents','failedEmail'
]
if data.get('environment') != 'production' or not data.get('versionsOk'):
    raise SystemExit(1)
if any(int(data.get(key, -1)) != 0 for key in required_zero):
    raise SystemExit(1)
if int(data.get('assessmentVersionRows', 0)) != 4:
    raise SystemExit(1)
if int(data.get('participantTemplates', 0)) != 4:
    raise SystemExit(1)
if data.get('referenceVersion') != '2.0.0':
    raise SystemExit(1)
if not data.get('cronRecent'):
    raise SystemExit(1)
PY
else
  fail "Production PHP runtime audit could not execute"
fi

LATEST_BACKUP="$(find /var/backups/head-heart-alignment -maxdepth 1 -type f -name '*.sql.gz' -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2- || true)"
if [[ -n "$LATEST_BACKUP" && -s "$LATEST_BACKUP" ]]; then
  AGE_SECONDS=$(( $(date +%s) - $(stat -c %Y "$LATEST_BACKUP") ))
  [[ "$AGE_SECONDS" -le 604800 ]] && pass "Recent database backup exists: $LATEST_BACKUP" || warn "Latest backup is older than seven days: $LATEST_BACKUP"
else
  fail "No production database backup was found"
fi

if [[ -n "$SMOKE_RECIPIENT" && -n "$RELEASE" ]]; then
  echo
  echo "===== GUARDED TEMPORARY SUBMISSION SMOKE TEST ====="
  args=("--recipient=$SMOKE_RECIPIENT" "--track=$SMOKE_TRACK" "--confirm=RUN-PRODUCTION-SUBMISSION-SMOKE")
  [[ "$SMOKE_SEND_EMAIL" == "1" ]] && args+=("--send-email")
  php8.3 "$RELEASE/backend/bin/production-submission-smoke-test.php" "${args[@]}" \
    && pass "Temporary production submission smoke test" \
    || fail "Temporary production submission smoke test"
else
  warn "Submission smoke test not run. Set SMOKE_RECIPIENT and optionally SMOKE_SEND_EMAIL=1."
fi

echo
echo "=================================================="
echo " FINAL RESULT: failures=$failures warnings=$warnings"
if [[ "$failures" -eq 0 ]]; then
  echo " PRODUCTION CORE: READY"
else
  echo " PRODUCTION CORE: NOT READY"
fi
echo "=================================================="
exit "$failures"
