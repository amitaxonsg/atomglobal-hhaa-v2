# Head–Heart Alignment Digital Assessment Platform

Self-hosted assessment, reporting, payment and administration platform for Atom Global Consulting.

This is the independent V2 project. Do not modify or reconnect the original `atomglobal-hhaa` repository or original Netlify project.

---

## 1. Current operational status

Recorded on **19 July 2026**.

| Item | Current state |
|---|---|
| Public URL | `https://head-heart.atomglobal.com/` |
| VPS | `161.97.137.234` |
| Git repository | `amitaxonsg/atomglobal-hhaa-v2` |
| Production source | `/srv/head-heart.atomglobal.com/source` |
| Versioned releases | `/var/www/head-heart.atomglobal.com/releases` |
| Active-release symlink | `/var/www/head-heart.atomglobal.com/current` |
| Deployed-commit marker | `/var/www/head-heart.atomglobal.com/v2-deployed-commit.txt` |
| Public web server | Nginx on ports 80 and 443 |
| Frontend build runtime | Node 22 from `/opt/node-v22/bin` |
| Frontend framework | React 19 + Vite 7 |
| Server capacity observed | Approximately 8 GB RAM and 145 GB system disk |
| SSL | Active and verified |
| Deployment service | `head-heart-v2-sync.service` |
| Five-minute deployment timer | **Disabled and inactive** |
| Production deployment method | Manual Git push followed by manual service start |
| Application code deployed when this note was written | `42744f41cd96d134ef0059f5175c890280f811f4` |

The Git repository may contain documentation commits newer than the deployed application commit. Always compare the Git commit, local source commit and deployed marker before changing production.

---

## 2. Important operating policy

Production no longer depends on Netlify.

The supported workflow is:

```text
Edit source on the VPS or in a controlled Git branch
        ↓
Run tests and production build
        ↓
Commit and push to GitHub V2 main
        ↓
Manually start head-heart-v2-sync.service
        ↓
Build a new versioned release
        ↓
Switch /var/www/head-heart.atomglobal.com/current
        ↓
Verify HTTPS and deployed commit
```

Do not:

- edit files inside the active release directory;
- re-enable the five-minute GitHub timer without an explicit decision;
- store passwords, database credentials, Stripe keys or SMTP keys in Git;
- connect this V2 project to the original repository;
- point the frontend to a production database before staging acceptance;
- delete old working releases before a new release passes verification;
- run a production deployment when the source tree contains unexplained local changes.

---

## 3. Platform purpose

The completed platform will provide four Head–Heart Alignment assessments:

- Personal
- New Joiner
- Manager
- Executive

Each assessment contains 50 questions across 10 sections and produces:

- an immediate free Lite Report;
- an optional paid Full Report;
- secure private report access;
- printable and PDF output;
- participant, payment, email and affiliate records in the admin CMS.

---

## 4. Current frontend experience

The public React application currently includes:

- desktop split-screen assessment experience;
- mobile single-column experience without the large image panel;
- Atom Global branding and warm neutral design system;
- assessment selection and dynamic duration information;
- participant-details and consent screen;
- 50-question assessment flow;
- progress and approximate time remaining;
- free result and paid-report preview;
- temporary browser-based preview/session storage;
- `/admin` interface shell and representative preview data.

### Current branded assets

| Purpose | Repository path |
|---|---|
| Plain reflective portrait | `public/media/stages/reflection-portrait.png` |
| Atom Global wordmark | `public/media/brand/atom-global-wordmark.png` |
| Stage-content configuration | `src/api/mockData.js` |
| Main assessment flow | `src/components/AssessmentApp.jsx` |
| Base styling | `src/styles.css` |
| Brand overrides | `src/brand-overrides.css` |

All desktop assessment stages currently use the same plain portrait, with stage-specific headline and supporting copy rendered as accessible HTML.

### Home and resume behaviour

The root URL must always open the assessment-selection home page:

```text
https://head-heart.atomglobal.com/
```

The current temporary preview-resume mechanism is:

```text
https://head-heart.atomglobal.com/?resume=1
```

This temporary query-string method must be replaced by secure, expiring server-generated resume tokens when the PHP/MySQL production backend is connected.

---

## 5. Branding system

Default public design tokens:

```css
--color-canvas: #F7F4EF;
--color-surface: #FFFFFF;
--color-text-primary: #211C16;
--color-text-muted: #726A5B;
--color-border: #E4DDCF;
--color-navy: #14141C;
--color-gold: #C9A15A;
--color-heart: #C1443F;
--color-heart-dark: #A8443D;
--color-head: #6C8FAE;
--color-head-dark: #3D6079;
```

Typography:

```text
Headings: Georgia, "Times New Roman", serif
Body/UI: Arial, Helvetica, sans-serif
```

Brand rules:

- warm cream canvas;
- white cards and form surfaces;
- warm near-black headings;
- restrained gold, Heart red and Head blue accents;
- no generic bright-blue SaaS theme;
- no strong gradients or heavy shadows;
- transparent logo over the photographic panel;
- no baked-in wording or logo inside the portrait image;
- large left image hidden at approximately 900 px and below.

---

## 6. Repository structure

```text
atomglobal-hhaa-v2/
├── src/                     React participant and admin applications
├── public/                  Static images, icons, manifest and service worker
├── backend/                 PHP API, commands and production services
├── database/                Migrations and assessment seed/export files
├── deploy/                  VPS, Nginx/Apache, cron and release scripts
├── docs/                    Operational and administration notes
├── tests/                   JavaScript and PHP tests
├── package.json             React/Vite dependencies and scripts
├── vite.config.js           Frontend build configuration
└── README.md                Primary operational reference
```

Frontend commands:

```bash
npm ci
npm run test
npm run build
npm run dev
```

The current package uses React 19.1.1 and Vite 7.0.4.

---

## 7. VPS layout

```text
/srv/head-heart.atomglobal.com/source
    Editable Git working tree and build source

/var/www/head-heart.atomglobal.com/releases
    Immutable versioned frontend releases

/var/www/head-heart.atomglobal.com/current
    Symlink used by Nginx for the active release

/var/www/head-heart.atomglobal.com/v2-deployed-commit.txt
    Commit SHA of the active release

/etc/systemd/system/head-heart-v2-sync.service
    Manual deployment service

/etc/systemd/system/head-heart-v2-sync.service.d/10-node22.conf
    PATH override for Node 22
```

Never make application changes inside `/var/www/head-heart.atomglobal.com/current` or an individual release directory. Those directories are deployment outputs.

---

## 8. Standard future update procedure

### Step 1 — confirm the timer stays off

```bash
systemctl is-enabled head-heart-v2-sync.timer 2>/dev/null || true
systemctl is-active head-heart-v2-sync.timer 2>/dev/null || true
```

Expected:

```text
disabled
inactive
```

### Step 2 — enter the source and inspect status

```bash
cd /srv/head-heart.atomglobal.com/source
git status --short
git log -1 --oneline
```

Do not continue until every existing local modification is understood and backed up.

### Step 3 — back up files being edited

```bash
STAMP="$(date +%F-%H%M%S)"
BACKUP="/root/head-heart-change-$STAMP"
mkdir -p "$BACKUP"
cp -a path/to/file "$BACKUP/"
```

### Step 4 — edit source files

Make changes only under the source working tree. Images uploaded to `/root` must be copied into an appropriate `public/media/...` path and then committed to Git.

### Step 5 — validate

```bash
export PATH="/opt/node-v22/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

npm ci --no-audit --no-fund
npm run test --if-present
npm run build

test -s dist/index.html
git diff --check
git status --short
```

### Step 6 — commit and push

```bash
git add <changed-files>
git commit -m "Describe the completed change"
git push v2 main
```

### Step 7 — deploy manually

```bash
systemctl reset-failed head-heart-v2-sync.service || true
systemctl start head-heart-v2-sync.service

journalctl \
  -u head-heart-v2-sync.service \
  -n 140 \
  --no-pager
```

The five-minute timer is not required. The service may be started manually even while the timer remains disabled.

### Step 8 — verify source, deployment and website

```bash
cd /srv/head-heart.atomglobal.com/source

echo "Source commit:"
git rev-parse HEAD

echo "Deployed commit:"
cat /var/www/head-heart.atomglobal.com/v2-deployed-commit.txt

echo "Active release:"
readlink -f /var/www/head-heart.atomglobal.com/current

curl -sS \
  -o /dev/null \
  -w 'HTTP %{http_code} | SSL %{ssl_verify_result}\n' \
  https://head-heart.atomglobal.com/
```

The source and deployed commit values must match, and the website must return:

```text
HTTP 200 | SSL 0
```

### Step 9 — browser verification

- open an Incognito window;
- verify `/` opens Step 1;
- verify desktop and mobile layouts;
- test selection, participant form, questions and report;
- test `/admin`;
- use `Ctrl+F5` when a static asset retains an old cached copy;
- check the browser console for errors.

---

## 9. Deployment-service behaviour

The current deployment service:

1. fetches GitHub V2 `main`;
2. refuses to continue if the VPS source has uncommitted changes;
3. resets the source to GitHub `main`;
4. runs `npm ci`;
5. runs `npm run build`;
6. copies `dist/` into a timestamped release;
7. switches the `current` symlink;
8. records the deployed commit;
9. verifies local HTTPS;
10. retains recent releases and removes older releases.

A message such as this is a safety stop, not a website failure:

```text
ERROR: Local VPS source contains uncommitted changes.
Refusing to overwrite local changes.
```

Resolve it by backing up and reviewing the named file. Do not use `git reset --hard` blindly.

---

## 10. Rollback

List releases:

```bash
find /var/www/head-heart.atomglobal.com/releases \
  -mindepth 1 \
  -maxdepth 1 \
  -type d \
  -printf '%T@ %p\n' | sort -nr
```

Switch to a verified previous release:

```bash
PREVIOUS="/var/www/head-heart.atomglobal.com/releases/<verified-release>"
APP="/var/www/head-heart.atomglobal.com"

ln -sfn "$PREVIOUS" "$APP/current.rollback"
mv -Tf "$APP/current.rollback" "$APP/current"

nginx -t
systemctl reload nginx
```

After rollback, update the deployed-commit marker to the commit represented by the restored release and verify HTTPS.

---

## 11. Public participant flow

Target production flow:

```text
Landing / assessment selection
        ↓
Choose Personal, New Joiner, Manager or Executive
        ↓
Participant identity and consent
        ↓
Create secure MySQL survey session
        ↓
10 sections / 50 answers with autosave
        ↓
Completion and score calculation
        ↓
Immediate Lite Report
        ↓
Optional Stripe Checkout
        ↓
Verified Stripe webhook
        ↓
Unlock Full Report
        ↓
Email secure report link and PDF
```

### Abandoned assessment flow

```text
Participant supplies name and email
        ↓
Server creates secure session and resume token
        ↓
Answers autosave after each change
        ↓
No activity for configured period
        ↓
Queued reminder email
        ↓
Secure expiring resume link
        ↓
Participant continues from saved section
```

No participant ID, sequential database ID or sensitive answer data should appear in a public URL.

---

## 12. Admin workflow

Target admin workflow:

```text
Secure admin login
        ↓
Role and permission check
        ↓
Dashboard / participants / assessments / reports / payments
        ↓
Draft changes
        ↓
Preview
        ↓
Publish
        ↓
Audit log and rollback history
```

Assessment publishing must:

- require exactly 50 active questions;
- preserve historical assessment versions;
- retain the scoring and report-template version used by every completed session;
- archive rather than overwrite an older published version;
- record the administrator and timestamp.

---

## 13. Production architecture

Target production stack:

```text
Browser
  ↓ HTTPS
Nginx
  ├── React/Vite static frontend
  └── /api → PHP 8.2+ application
                   ↓
              MySQL/MariaDB
                   ↓
       queue / email / reports / Stripe
```

Recommended components:

- Ubuntu/Debian VPS;
- Nginx;
- PHP 8.2-FPM or newer;
- MySQL 8 or MariaDB;
- Composer 2;
- Node 22 for builds only;
- system cron for queue workers and reminders;
- Stripe Checkout and signed webhooks;
- SMTP2GO or configured SMTP/API provider;
- server-side PDF generation;
- database and application backups.

The repository contains a production-oriented PHP/MySQL foundation, but the current public site remains a frontend deployment until the backend is staged, tested and deliberately enabled.

---

## 14. Environment configuration

The future production backend environment file should live outside Git:

```text
/etc/head-heart-alignment/app.env
```

Expected categories include:

```text
APP_URL
APP_ENV
APP_KEY
APP_TIMEZONE

DB_HOST
DB_PORT
DB_DATABASE
DB_USERNAME
DB_PASSWORD

STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_* values

SMTP/API host and credentials
MAIL_FROM_ADDRESS
MAIL_FROM_NAME

STORAGE_PATH
REPORT_TOKEN_TTL
RESUME_TOKEN_TTL
SESSION_COOKIE settings
```

Never paste real values into README, source code, frontend JavaScript, Git history, screenshots or support messages.

---

## 15. Current production-readiness status

| Area | Status |
|---|---|
| Branded participant frontend | Working preview/live frontend |
| Four assessment tracks | Present |
| 50-question content and scoring | Present and must be preserved |
| Dynamic duration/progress UI | Present |
| Browser preview session | Present |
| Secure server-side survey session | Not yet production-wired |
| PHP API foundation | Present in repository; staging validation required |
| MySQL database | Not yet connected to the live public flow |
| Real admin authentication | Not yet wired to the React admin |
| Participant database screens | Placeholder/representative data |
| Assessment/question CMS | Not fully wired |
| Branding/content CMS saving | Not fully wired |
| Stripe Checkout | Backend foundation present; not live end-to-end |
| Verified payment unlock | Not live end-to-end |
| SMTP2GO/SMTP email delivery | Not live end-to-end |
| Abandoned-survey reminders | Not live |
| Secure resume tokens | Not live |
| Full report PDF | Not live end-to-end |
| Affiliate tracking and commission reporting | Not live end-to-end |
| Privacy export/delete workflows | Backend work/testing required |
| Audit log and role permissions | Backend work/testing required |
| Staging acceptance | Required before live backend switch |

Do not describe placeholder admin pages as complete production functions.

---

## 16. Production task list

### Phase A — staging infrastructure

- [ ] Create a separate staging database.
- [ ] Create a restricted database user.
- [ ] Install PHP 8.2+ extensions and Composer 2.
- [ ] Store the environment file outside Git.
- [ ] Run migrations and seed data on staging only.
- [ ] Configure `/api` through Nginx and PHP-FPM.
- [ ] Verify `/api/health`.
- [ ] Confirm backups before every migration.

### Phase B — secure admin authentication

- [ ] Connect `/admin` login to the PHP API.
- [ ] Add logout, session expiry and CSRF protection.
- [ ] Use Argon2id or bcrypt password hashing.
- [ ] Add login rate limiting and lockout controls.
- [ ] Implement owner, administrator, editor, finance and viewer roles.
- [ ] Record admin login and change audit events.
- [ ] Add password reset through secure expiring tokens.

### Phase C — participant and assessment data

- [ ] Store participant identity, consent and assessment selection.
- [ ] Store every answer against an immutable assessment version.
- [ ] Autosave safely after every answer.
- [ ] Prevent duplicate sessions and duplicate answer rows.
- [ ] Add secure resume, revoke and resend flows.
- [ ] Add session expiry and retention settings.
- [ ] Add participant search, filters, detail and notes in admin.
- [ ] Add CSV export subject to permissions.

### Phase D — assessment CMS

- [ ] Manage tracks, sections, questions and answer scales.
- [ ] Preserve reverse-scoring rules.
- [ ] Validate exactly 50 active questions before publishing.
- [ ] Add draft, preview, publish, clone and archive.
- [ ] Preserve historical versions and report reproducibility.
- [ ] Add assessment duration, section count and display-order settings.
- [ ] Add stage image, focal point, overlay, headline and supporting copy.

### Phase E — reports

- [ ] Store free and paid report templates by version.
- [ ] Generate Lite Report immediately after completion.
- [ ] Generate Full Report only after an authorised unlock.
- [ ] Add branded HTML, print and PDF output.
- [ ] Add secure private report tokens with expiry and revoke controls.
- [ ] Add resend and regenerate actions in admin.
- [ ] Include assessment, scoring, report-template and theme versions.

### Phase F — Stripe payments

- [ ] Configure Stripe test mode first.
- [ ] Create Checkout sessions server-side.
- [ ] Verify signed Stripe webhooks.
- [ ] Make webhook processing idempotent.
- [ ] Unlock reports only after verified payment status.
- [ ] Record payment, refund and failure events.
- [ ] Add payment search and manual authorised unlock in admin.
- [ ] Complete test-mode acceptance before live keys are installed.

### Phase G — email and automation

- [ ] Configure SMTP2GO or approved SMTP/API service.
- [ ] Build HTML and plain-text templates.
- [ ] Queue registration, resume, abandonment, completion and report emails.
- [ ] Add retry, failure, suppression and delivery logs.
- [ ] Add configurable reminder timing.
- [ ] Add unsubscribe handling for optional marketing messages.
- [ ] Never suppress required transactional report/resume messages incorrectly.

### Phase H — affiliate and campaign tracking

- [ ] Create affiliate records and unique tracking codes.
- [ ] Store first-touch and last-touch attribution.
- [ ] Store UTM parameters.
- [ ] Attribute session, completion, payment and refund.
- [ ] Add affiliate dashboard, conversion and revenue reporting.
- [ ] Add commission status without automatically paying commissions.
- [ ] Prevent self-referral and obvious duplicate abuse.

### Phase I — settings, branding and SEO/AEO/GEO

- [ ] Connect theme settings to the database.
- [ ] Add draft, preview, publish and rollback.
- [ ] Manage logo, favicon, report logo and email logo.
- [ ] Manage colours, fonts, buttons and form styles.
- [ ] Manage page titles, descriptions, canonical URL, Open Graph and schema data.
- [ ] Add legal, privacy, cookie and consent content settings.
- [ ] Add timezone, locale, currency and report-price settings.

### Phase J — security and privacy

- [ ] Use PDO prepared statements only.
- [ ] Set Secure, HttpOnly and SameSite cookies.
- [ ] Apply CSRF protection to state-changing admin requests.
- [ ] Validate and authorise every API request server-side.
- [ ] Add rate limits for login, survey creation, resume and report endpoints.
- [ ] Encrypt or securely protect sensitive application secrets.
- [ ] Add data export, anonymisation and deletion workflows.
- [ ] Add configurable retention and consent records.
- [ ] Prevent stack traces and secrets from appearing publicly.
- [ ] Add security headers and upload validation.

### Phase K — testing and launch

- [ ] Test all four tracks and all 50 questions.
- [ ] Verify scoring and reverse-scoring fixtures.
- [ ] Test autosave, offline interruption and resume.
- [ ] Test duplicate submissions.
- [ ] Test Stripe success, cancellation, retry, duplicate webhook and refund.
- [ ] Test email queue and failure recovery.
- [ ] Test PDF output and report permissions.
- [ ] Test role permissions and audit logs.
- [ ] Test mobile, tablet, desktop, keyboard and screen reader flows.
- [ ] Test database backup and full rollback.
- [ ] Obtain client staging acceptance.
- [ ] Switch `VITE_API_MODE=production` only after acceptance.

---

## 17. Admin modules required for completion

The production admin CMS must include:

- Dashboard
- Participants
- Sessions and answers
- Assessments
- Sections and questions
- Scoring and profiles
- Free-report templates
- Paid-report templates
- Payments and refunds
- Email templates and delivery queue
- Abandoned-survey schedules
- Affiliates and campaign attribution
- Stage content and images
- Branding and theme versions
- SEO/AEO/GEO settings
- SMTP/API settings
- Stripe settings
- Admin users, roles and permissions
- Privacy exports and deletion requests
- Audit log
- System health and queue status

Every visible Save, Publish, Send, Refund, Regenerate or Delete control must call a real authorised backend operation. Do not ship buttons that only alter local React state.

---

## 18. Client quotation feature brief

**Head–Heart Alignment Digital Assessment Platform**

A secure, self-hosted PHP/MySQL assessment and reporting platform for Atom Global Consulting, covering participant registration, four assessment tracks, autosave and resume, Lite and Full reports, Stripe payments, email automation, affiliate attribution and a comprehensive administration CMS.

Quotation scope should separate:

1. frontend and responsive assessment experience;
2. PHP/MySQL API and database implementation;
3. production admin CMS wiring;
4. reports and PDF generation;
5. Stripe integration;
6. SMTP2GO/SMTP and reminder automation;
7. affiliate/campaign tracking;
8. security, privacy and audit controls;
9. staging, testing, migration and production launch;
10. post-launch maintenance and support.

Third-party charges such as Stripe fees, SMTP provider charges, domain/SSL, VPS, external monitoring and any commercial PDF service should be listed separately from development fees.

---

## 19. Useful diagnostics

```bash
# Website
curl -sS -o /dev/null \
  -w 'HTTP %{http_code} | SSL %{ssl_verify_result}\n' \
  https://head-heart.atomglobal.com/

# Current release
readlink -f /var/www/head-heart.atomglobal.com/current

# Deployed commit
cat /var/www/head-heart.atomglobal.com/v2-deployed-commit.txt

# Git status
git -C /srv/head-heart.atomglobal.com/source status --short

# Latest Git commit
git -C /srv/head-heart.atomglobal.com/source log -1 --oneline

# Deployment service log
journalctl -u head-heart-v2-sync.service -n 160 --no-pager

# Timer status
systemctl is-enabled head-heart-v2-sync.timer 2>/dev/null || true
systemctl is-active head-heart-v2-sync.timer 2>/dev/null || true

# Nginx check
nginx -t

# Disk and memory
df -h /
free -h
```

---

## 20. Definition of production ready

The platform is production ready only when:

- the public assessment saves to MySQL rather than browser preview storage;
- secure resume links work from email;
- all four tracks and scoring results match approved fixtures;
- the admin uses real authentication and permissions;
- every admin module reads and writes real authorised data;
- Lite and Full reports are versioned and reproducible;
- Stripe webhook verification controls paid unlock;
- transactional email and reminders are logged and retry safely;
- affiliate attribution is recorded correctly;
- privacy export/delete and retention controls work;
- database backup and rollback have been tested;
- staging acceptance is signed off;
- production secrets are outside Git;
- monitoring and operational documentation are in place.

Until then, treat the current public application and admin as a controlled frontend/staging foundation, not a complete commercial production system.
