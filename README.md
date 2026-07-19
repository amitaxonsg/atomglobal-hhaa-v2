# Head–Heart Alignment Digital Assessment Platform

Self-hosted React, PHP and MySQL assessment, reporting, payment and administration platform for Atom Global Consulting.

This is the independent V2 project. Do not reconnect it to the original `atomglobal-hhaa` repository or the former Netlify project.

## Current status — 19 July 2026

| Item | Status |
|---|---|
| Public URL | `https://head-heart.atomglobal.com/` |
| VPS | `161.97.137.234` |
| Repository | `amitaxonsg/atomglobal-hhaa-v2` |
| Production branch | `production-readiness-20260719` |
| Draft pull request | PR #5 |
| CI-verified commit | `b95afa14560a262708163230c234613be9866aa9` |
| Frontend tests/build | **Passed** |
| PHP lint/tests | **Passed** |
| MySQL migrations/seed/integration | **Passed** |
| Live frontend | Working preview |
| Live `/admin` | **Preview/mock mode** |
| Live MySQL backend | Not connected yet |
| Production deployment | Not started |
| Five-minute deployment timer | Must remain disabled and inactive |

The current `/admin` screen showing `preview@atomglobal.com` and **Enter preview CMS** is expected for the existing live frontend. It proves the React admin preview loads, but it does **not** prove PHP authentication or MySQL connectivity.

The production-readiness branch switches the frontend to real PHP APIs when built with:

```text
VITE_API_MODE=production
VITE_API_BASE_URL=/api
```

## Verified code coverage

The production-readiness branch includes:

- real PHP administrator login, logout, sessions, CSRF and rate limiting;
- administrator roles, permissions, audit records and password-reset foundation;
- participant registration, consent, MySQL autosave and secure resume tokens;
- four assessment tracks with 50 questions across ten sections;
- versioned assessment editing, clone, draft and publish workflows;
- participant search, details, export and anonymisation;
- CMS branding with logo, banner, stage image, email logo, report logo and favicon uploads;
- compact responsive administration styling;
- Lite and Full reports, secure links and branded PDFs;
- Stripe Checkout, signed webhooks, refund handling and affiliate commissions;
- SMTP2GO/SMTP configuration, editable templates, test email, reminders and retry queue;
- affiliate/UTM attribution, analytics, SEO/AEO/GEO, privacy, retention and alerts;
- MySQL migrations, seed data, integration tests and versioned deployment scripts.

GitHub Actions run #88 passed frontend, PHP and MySQL jobs against a clean MySQL 8 database.

## What is next

The code is **ready for controlled VPS staging**, but not yet ready for an immediate blind production switch.

The next sequence is:

1. Run a read-only VPS audit.
2. Confirm the source tree is clean and record the current release.
3. Create a restricted MySQL database and user.
4. Create `/etc/head-heart-alignment/app.env` with mode `0600`.
5. Pull branch `production-readiness-20260719` into staging.
6. Run `deploy/phase-a-staging.sh` without changing the live symlink.
7. Confirm the real admin login and MySQL assessment flow.
8. Test SMTP2GO delivery and Stripe test webhooks.
9. Merge PR #5 only after staging acceptance.
10. Run the atomic production deployment and verify rollback.

The live release should not be replaced until the staging database, environment file and external-service tests are complete.

## Source and release layout

```text
/srv/head-heart.atomglobal.com/source
    Git working tree and build source

/var/www/head-heart.atomglobal.com/releases
    Immutable versioned releases

/var/www/head-heart.atomglobal.com/current
    Active release symlink used by Nginx

/var/www/head-heart.atomglobal.com/v2-deployed-commit.txt
    Commit marker for the active release

/etc/head-heart-alignment/app.env
    Protected runtime credentials and environment settings

/var/lib/head-heart-alignment
    Persistent media, reports, temporary files and cron lock
```

Never edit files inside the active release directory.

## Read-only VPS audit

Run this before any deployment:

```bash
bash <<'AUDIT'
set -u

echo "=================================================="
echo " HEAD–HEART VPS READ-ONLY PRE-DEPLOYMENT AUDIT"
echo "=================================================="

echo
echo "===== HOST ====="
hostnamectl 2>/dev/null || hostname
uname -a

echo
echo "===== CAPACITY ====="
free -h
df -h /

echo
echo "===== WEB/PHP SERVICES ====="
systemctl is-active nginx 2>/dev/null || true
systemctl list-units --type=service --all | grep -Ei 'php.*fpm' || true
nginx -t 2>&1 || true
php -v 2>&1 | head -3
php -m | grep -Ei 'pdo|pdo_mysql|json|mbstring|openssl|curl|dom|fileinfo' || true
composer --version 2>/dev/null || true
node --version 2>/dev/null || true
npm --version 2>/dev/null || true
mysql --version 2>/dev/null || true

echo
echo "===== DEPLOYMENT TIMER ====="
systemctl is-enabled head-heart-v2-sync.timer 2>/dev/null || true
systemctl is-active head-heart-v2-sync.timer 2>/dev/null || true

echo
echo "===== SOURCE ====="
SOURCE=/srv/head-heart.atomglobal.com/source
if [ -d "$SOURCE/.git" ]; then
  git -C "$SOURCE" status --short
  git -C "$SOURCE" branch --show-current
  git -C "$SOURCE" log -1 --oneline
  git -C "$SOURCE" remote -v
else
  echo "Source repository not found: $SOURCE"
fi

echo
echo "===== ACTIVE RELEASE ====="
readlink -f /var/www/head-heart.atomglobal.com/current 2>/dev/null || true
cat /var/www/head-heart.atomglobal.com/v2-deployed-commit.txt 2>/dev/null || true
find /var/www/head-heart.atomglobal.com/releases -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -10

echo
echo "===== WEBSITE ====="
curl -sS -o /dev/null -w 'Home HTTP %{http_code} | SSL %{ssl_verify_result}\n' https://head-heart.atomglobal.com/ || true
curl -sS -o /dev/null -w 'Admin HTTP %{http_code} | SSL %{ssl_verify_result}\n' https://head-heart.atomglobal.com/admin || true

echo
echo "===== ENVIRONMENT FILE ====="
if [ -f /etc/head-heart-alignment/app.env ]; then
  stat -c '%A %U:%G %n' /etc/head-heart-alignment/app.env
  grep -E '^(APP_ENV|APP_URL|DB_HOST|DB_PORT|DB_DATABASE|DB_USERNAME|STORAGE_PATH|VITE_API_MODE)=' /etc/head-heart-alignment/app.env | sed -E 's#(DB_USERNAME=).*#\1[configured]#'
else
  echo "Not created yet: /etc/head-heart-alignment/app.env"
fi

echo
echo "=================================================="
echo " AUDIT COMPLETE — NO CHANGES WERE MADE"
echo "=================================================="
AUDIT
```

Do not continue when the source contains unexplained local modifications.

## Staging preparation

After the read-only audit and database creation:

```bash
cd /srv/head-heart.atomglobal.com/source

git fetch --all --prune
git checkout production-readiness-20260719
git pull --ff-only origin production-readiness-20260719

chmod 0755 deploy/phase-a-staging.sh
sudo deploy/phase-a-staging.sh
```

`phase-a-staging.sh` validates software, builds the frontend, backs up the configured database, runs migrations and tests, and does not switch the current production symlink.

## Production deployment

Only after staging acceptance and PR #5 merge:

```bash
cd /srv/head-heart.atomglobal.com/source

git checkout main
git pull --ff-only origin main

chmod 0755 deploy/update-vps.sh
sudo deploy/update-vps.sh
```

The production script:

- refuses a dirty source tree;
- backs up the database;
- installs Composer and npm dependencies;
- runs PHP and frontend tests;
- applies migrations and seed data;
- builds a timestamped release;
- changes the active symlink atomically;
- reloads PHP-FPM and Nginx;
- checks `/api/health` and the public website;
- restores the former release symlink if deployment fails.

## Manual rollback

List releases:

```bash
find /var/www/head-heart.atomglobal.com/releases \
  -mindepth 1 -maxdepth 1 -type d \
  -printf '%T@ %p\n' | sort -nr
```

Restore a verified former release:

```bash
APP=/var/www/head-heart.atomglobal.com
PREVIOUS="$APP/releases/<verified-previous-release>"

ln -sfn "$PREVIOUS" "$APP/current.rollback"
mv -Tf "$APP/current.rollback" "$APP/current"

nginx -t
systemctl reload nginx
```

A code rollback does not automatically reverse database migrations. Keep the pre-deployment SQL backup and restore it only after reviewing whether the migration is backward compatible.

## Environment and secrets

Production secrets belong only in:

```text
/etc/head-heart-alignment/app.env
```

Minimum categories:

```text
APP_ENV
APP_URL
APP_KEY
APP_TIMEZONE

DB_HOST
DB_PORT
DB_DATABASE
DB_USERNAME
DB_PASSWORD

STRIPE_MODE
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PERSONAL
STRIPE_PRICE_NEWJOINER
STRIPE_PRICE_MANAGER
STRIPE_PRICE_EXECUTIVE

MAIL_PROVIDER
MAIL_FROM_ADDRESS
MAIL_FROM_NAME
MAIL_REPLY_TO
SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
SMTP_ENCRYPTION
SMTP2GO_API_KEY

STORAGE_PATH
MEDIA_PUBLIC_PREFIX
VITE_API_MODE
VITE_API_BASE_URL
VITE_ENABLE_SW
```

Never place real keys, passwords or database credentials in Git, frontend JavaScript, screenshots or chat messages.

## Repository commands

```bash
npm ci --no-audit --no-fund
npm test
npm run build

test -s dist/index.html

cd backend
composer install
composer lint
composer test
```

## Operational documents

- `docs/PRODUCTION-READINESS.md` — current implementation status and deployment task list.
- `deploy/phase-a-staging.sh` — staging preparation without switching production.
- `deploy/update-vps.sh` — atomic production deployment and automatic code rollback.
- `deploy/nginx-head-heart.conf` — hardened Nginx example.
- `deploy/head-heart.cron` — queue, reminder, PDF and retention schedule.

The previous long-form README remains available in Git history before this status refresh.

## Go/no-go summary

**GO:** pull the branch to a controlled VPS staging environment and connect a restricted MySQL database.

**NO-GO:** immediately replace the live release without the VPS audit, environment setup, staging acceptance, SMTP2GO/Stripe tests and rollback verification.
