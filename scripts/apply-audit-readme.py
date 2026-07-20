from pathlib import Path
import re


audit = Path("deploy/full-production-audit.sh")
text = audit.read_text()
old = '''  echo "$PHP_OUTPUT"
  python3 - <<'PY' <<<"$PHP_OUTPUT" && pass "Database, CMS, report and email integrity" || fail "Database, CMS, report or email integrity failed"
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    raise SystemExit(1)'''
new = '''  echo "$PHP_OUTPUT"
  PHP_AUDIT_FILE="$(mktemp)"
  printf '%s\\n' "$PHP_OUTPUT" > "$PHP_AUDIT_FILE"
  python3 - "$PHP_AUDIT_FILE" <<'PY' && pass "Database, CMS, report and email integrity" || fail "Database, CMS, report or email integrity failed"
import json, sys
try:
    with open(sys.argv[1], encoding="utf-8") as handle:
        data = json.load(handle)
except Exception:
    raise SystemExit(1)'''
if old not in text:
    raise SystemExit("Audit JSON parser block not found")
text = text.replace(old, new, 1)
marker = '''PY
else
  fail "Production PHP runtime audit could not execute"'''
if marker not in text:
    raise SystemExit("Audit cleanup marker not found")
text = text.replace(marker, '''PY
  rm -f "$PHP_AUDIT_FILE"
else
  fail "Production PHP runtime audit could not execute"''', 1)
audit.write_text(text)
print("Updated deploy/full-production-audit.sh")


readme = Path("README.md")
text = readme.read_text()
text = re.sub(r"\| Merged feature commit \|.*?\n", "| Current production baseline commit | `70bc001474fcdfec055bfc18eda416e31a4920f3` before the audit/branding release |\n", text)
text = re.sub(r"\| Last release confirmed in pasted VPS output \|.*?\n", "| Last production release confirmed | `/var/www/head-heart.atomglobal.com/releases/20260720055557-70bc001474fc` |\n", text)
text = re.sub(r"\| Last marker confirmed in pasted VPS output \|.*?\n", "| Last production marker confirmed | `70bc001474fcdfec055bfc18eda416e31a4920f3` |\n", text)
text = re.sub(r"\| Current observed public screen \|.*?\n", "| Current observed public screen | Restored left branding with Personal, New Joiner, Manager and Executive active on the right |\n", text)
text = text.replace(
    "The screenshot supplied after the corrected deployment confirms that the latest questionnaire process reached the public site. The exact active marker after that later deployment was not pasted; verify it from `/var/www/head-heart.atomglobal.com/deployed-commit.txt` before the next release.",
    "Production Admin and database verification confirmed exactly four published `2.0.0` assessments. All obsolete `1.0.0` questionnaire versions, the unfinished old session and its test participant data were removed after verified MariaDB backups.",
)
text = text.replace("## Verified production change awaiting VPS deployment", "## Verified production experience")
text = text.replace(
    "**Admin → Content** manages the responsive left-panel images and stage copy. **Admin → Branding** manages logo, colours, typography and visual tokens.",
    "**Admin → Content** manages the responsive left-panel images and stage copy. **Admin → Branding** manages logos, core and questionnaire colours, heading/body fonts, page/body/question/option/field sizes, participant/question widths, desktop gutter and component radii. Branding never edits assessment wording, scoring or report profile logic.",
)
baseline = '''## Production database baseline reset — 20 July 2026

The production database was intentionally reset to the current approved assessment baseline after a full reference audit:

- exactly four assessment-version rows remain;
- Personal, New Joiner, Manager and Executive are all published as `2.0.0`;
- each track contains the approved 10 sections, 50 questions, five answer choices and matching report profiles;
- no `1.0.0` questionnaire version, old session, old participant, answer, score or report remains;
- the attached `index.html` reference hashes remain recorded in global settings;
- full database backups were created before every cleanup stage.

Future completed submissions must remain pinned to their immutable assessment version and snapshots. Never delete a version that has a completed session, score or report.

## Full production audit and submission smoke test

`deploy/full-production-audit.sh` verifies services, immutable Nginx paths, API health, four CMS tracks, exactly four published `2.0.0` versions, database foreign-key integrity, report linkage, email templates, branding configuration, cron and recent backups.

By default the audit is read-only. To create one temporary submission, verify Admin visibility, report generation and email queues, then remove the test records automatically:

```bash
SMOKE_RECIPIENT=amit@axon.com.sg \\
SMOKE_TRACK=personal \\
bash deploy/full-production-audit.sh
```

Add `SMOKE_SEND_EMAIL=1` only when four real participant-flow test messages should be delivered to the chosen clean recipient. The smoke test refuses an email already present in the participant database.

'''
marker = "## Assessment and historical-report protection"
if "## Production database baseline reset" not in text:
    if marker not in text:
        raise SystemExit("README insertion marker missing")
    text = text.replace(marker, baseline + marker, 1)
text = text.replace("10. Confirm an older resume link still opens its original immutable version.\n", "10. Confirm every new session is pinned to published CMS version `2.0.0`.\n")
text = text.replace(
    "12. Complete each assessment path and verify dashboard, search, Lite Report, email and PDF.",
    "12. Run the guarded submission smoke test and verify participant, 50 answers, score, report, Admin detail and four email queues before automatic test-data cleanup.",
)
text = text.replace(
    "15. Run `deploy/final-production-audit.sh` and retain its output.",
    "15. Run `deploy/full-production-audit.sh` (or the compatibility wrapper `deploy/final-production-audit.sh`) and retain its output.",
)
readme.write_text(text)
print("Updated README.md")
