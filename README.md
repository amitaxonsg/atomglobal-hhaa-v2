# Head–Heart Alignment Digital Assessment Platform

Self-hosted React, PHP and MariaDB assessment, reporting, payment, email and administration platform for Atom Global Consulting.

This is the independent V2 project. Do not reconnect it to the original repository or former Netlify project.

## Current status — 19 July 2026

| Item | State |
|---|---|
| Public URL | `https://head-heart.atomglobal.com/` |
| VPS | `161.97.137.234` |
| Repository | `amitaxonsg/atomglobal-hhaa-v2` |
| Development branch | `production-readiness-20260719` |
| Pull request | Draft PR #5 |
| Live mode | Frontend preview; PHP/MariaDB not connected publicly |
| Live deployed commit | `42744f41cd96d134ef0059f5175c890280f811f4` |
| Live release | `/var/www/head-heart.atomglobal.com/releases/20260719-063144-42744f41cd96` |
| Deployment timer | Disabled and inactive |
| Phase A staging | Completed successfully |
| Stage 4 first attempt | Rolled back safely after local API returned HTTP 404 |
| Corrected Stage 4 script | `deploy/stage4-local.sh` |
| Latest verified code commit | `ec64df235afd48f5bdd9344d01d2a8aead8d41ad` |
| GitHub checks at verified commit | Frontend, PHP and database passed |

The public `/admin` page still shows preview mode because production has not been switched. The real administration must pass loopback staging before PR merge and production activation.

## Server layout

```text
/srv/head-heart.atomglobal.com/source
    Current live Git working tree

/srv/head-heart.atomglobal.com/staging-source
    Isolated production-readiness checkout

/var/www/head-heart.atomglobal.com/releases
    Immutable production frontend releases

/var/www/head-heart.atomglobal.com/current
    Active production release symlink

/var/www/head-heart-staging.atomglobal.com
    Isolated staging application releases

/etc/head-heart-alignment/staging.env
    Protected staging credentials

/etc/head-heart-alignment/app.env
    Protected production credentials

/var/lib/head-heart-alignment-staging
    Persistent staging media and reports

/var/backups/head-heart-alignment-staging
    Staging database backups
```

## Audited VPS stack

- Nginx active; syntax test successful.
- PHP CLI 8.3.6.
- `php8.3-fpm.service` active.
- PDO, `pdo_mysql`, JSON, mbstring, OpenSSL, cURL, DOM and fileinfo present.
- MariaDB 10.11.14.
- Node 22 available from `/opt/node-v22/bin` for Vite builds.
- Composer 2 working.
- Home and Admin return HTTP 200 with valid SSL.
- Unrelated duplicate `gatorinbox.com` Nginx warnings must be cleaned separately.

## Phase A staging evidence

Phase A completed with:

```text
Staging source: /srv/head-heart.atomglobal.com/staging-source
Staging database: head_heart_staging
Environment: /etc/head-heart-alignment/staging.env
Backup: /var/backups/head-heart-alignment-staging/head_heart_staging-before-phase-a-20260719T064824Z.sql.gz
```

Verified:

- separate restricted MariaDB database and user;
- protected environment outside Git;
- ordered migrations and seed data;
- PHP tests and frontend production build;
- pre-migration SQL backup;
- live release and deployed marker unchanged;
- deployment timer still disabled and inactive.

## Stage 4 process

The corrected loopback staging command is stored in Git:

```bash
cd /srv/head-heart.atomglobal.com/staging-source
EXPECTED_COMMIT=<approved-commit> bash deploy/stage4-local.sh
```

It will:

1. keep automatic deployment off;
2. verify a clean staging checkout;
3. install dependencies and run migrations;
4. run PHP and frontend tests;
5. build an immutable staging release;
6. bind Nginx only to `127.0.0.1:8088`;
7. route `/api` to PHP 8.3 FPM;
8. verify `/api/health` and unauthenticated admin behaviour;
9. confirm production remains unchanged;
10. restore staging automatically after failure.

Do not create the first owner until Stage 4 ends with:

```text
STAGE 4 LOCAL API AND FRONTEND READY
```

Then run the interactive owner command inside the active staging backend. The password is hidden and stored using Argon2id.

## Administration CMS

Implemented on the production-readiness branch:

- real PHP login, logout and session restoration;
- secure HttpOnly/SameSite cookies;
- CSRF validation and login rate limiting;
- Owner, Administrator, Editor, Finance and Viewer roles;
- modern split-screen login and compact mobile login;
- grouped sidebar navigation;
- smaller dashboard, table and form typography;
- participants, assessments, content, branding, reports, payments, email, affiliates, analytics, SEO, settings and audit modules;
- logo, banner, stage image, email logo, report logo and favicon management;
- branding draft, preview, publish and restore controls.

## Email and reminder workflow

The platform includes a central Atom Global email design with:

- centred transparent logo;
- white content card and cream background;
- Head–Heart Alignment branding;
- brand-red action links;
- website, privacy and terms footer links;
- responsive HTML and plain-text fallback.

Templates cover:

- participant welcome;
- secure resume link;
- three incomplete-assessment reminders;
- completion and Lite Report;
- Full Report checkout and delivery;
- payment success and failure;
- report-link refresh;
- password reset;
- test email;
- privacy confirmation;
- administrator alerts.

Default reminder intervals are 24, 72 and 168 hours. Provider, sender, reply-to, logo, footer links, reminder timing and delivery attempts are editable in Settings.

## Security policy

Never commit database passwords, email-provider keys, Stripe secrets or API credentials. Credentials shared through chat or another message channel must be replaced before use. Store staging secrets only in `/etc/head-heart-alignment/staging.env` or encrypted admin settings after real authentication is active.

## Remaining production gates

- [ ] Run corrected Stage 4 and obtain HTTP 200 `status: ok`.
- [ ] Create and test the real staging owner account.
- [ ] Test login, logout, expiry, lockout and CSRF.
- [ ] Test participant registration, autosave and secure resume.
- [ ] Deliver branded welcome, reminder and report emails.
- [ ] Complete all four 50-question tracks and verify scoring.
- [ ] Test Lite and Full reports and visually review PDFs.
- [ ] Test branding uploads, publish and rollback.
- [ ] Test Stripe Checkout, signed webhook, duplicate webhook and refund in test mode.
- [ ] Restore the Phase A backup into a fresh database.
- [ ] Test privacy export, anonymisation and retention.
- [ ] Record staging acceptance.
- [ ] Merge PR #5 only after acceptance.
- [ ] Create protected production credentials.
- [ ] Run the atomic production deployment and retain the previous release and database backup.

## Production deployment policy

The five-minute Git timer must remain off. Production deployment is deliberate and manual:

```text
Approved commit
  → database backup
  → migrations and tests
  → immutable release build
  → atomic symlink switch
  → health and HTTPS verification
  → automatic code rollback on failure
```

Database migrations are forward-only. Code rollback does not reverse database changes; a full database rollback requires restoring the pre-deployment SQL backup.

Further records:

- `docs/PRODUCTION-READINESS.md`
- `docs/PHASE-A-VPS-STATUS-20260719.md`
- `docs/STAGE-4-STATUS-20260719.md`
