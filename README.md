# Head–Heart Alignment Digital Assessment Platform

Self-hosted React, PHP and MySQL/MariaDB assessment, reporting, payment and administration platform for Atom Global Consulting.

This is the independent V2 project. Do not reconnect it to the original `atomglobal-hhaa` repository or the former Netlify project.

## Current status — 19 July 2026

| Item | Status |
|---|---|
| Public URL | `https://head-heart.atomglobal.com/` |
| VPS | `161.97.137.234` |
| Repository | `amitaxonsg/atomglobal-hhaa-v2` |
| Production-readiness branch | `production-readiness-20260719` |
| Draft pull request | PR #5 |
| GitHub CI | Frontend, PHP and clean-database integration passed |
| Live frontend | Working preview |
| Live `/admin` | **Preview/mock mode** |
| Live database backend | Not connected yet |
| Live deployed application commit | `42744f41cd96d134ef0059f5175c890280f811f4` |
| Active live release | `/var/www/head-heart.atomglobal.com/releases/20260719-063144-42744f41cd96` |
| Five-minute deployment timer | **Disabled and inactive** |
| Isolated VPS staging | **Phase A completed successfully** |
| Staging source commit tested | `fc2135074ddd80fefcc2c6959cdc9eac7ea6a665` |
| Staging database | `head_heart_staging` on MariaDB 10.11 |
| Production deployment | Not started |

The live `/admin` screen showing `preview@atomglobal.com` and **Enter preview CMS** proves only that the current React preview loads. It does not prove PHP authentication or live database connectivity.

The production-readiness branch uses real PHP APIs when built with:

```text
VITE_API_MODE=production
VITE_API_BASE_URL=/api
```

## Phase A VPS staging result

Phase A completed successfully on 19 July 2026 using isolated staging paths.

Verified:

- Composer and the isolated Node 22 build runtime worked on the VPS;
- a separate Git checkout was created at `/srv/head-heart.atomglobal.com/staging-source`;
- a restricted MariaDB staging database and user were created;
- `/etc/head-heart-alignment/staging.env` was created with mode `0600`;
- ordered migrations and seed data completed on MariaDB 10.11;
- PHP tests and the frontend production build passed;
- a pre-migration database backup was created;
- the live release, live commit marker and public website did not change;
- the automatic five-minute deployment timer remained disabled and inactive.

Phase A evidence:

```text
Staging source: /srv/head-heart.atomglobal.com/staging-source
Staging commit: fc2135074ddd80fefcc2c6959cdc9eac7ea6a665
Staging DB:     head_heart_staging
Environment:    /etc/head-heart-alignment/staging.env
Backups:        /var/backups/head-heart-alignment-staging
Backup file:    head_heart_staging-before-phase-a-20260719T064824Z.sql.gz
```

The live application remained on:

```text
/var/www/head-heart.atomglobal.com/releases/20260719-063144-42744f41cd96
42744f41cd96d134ef0059f5175c890280f811f4
```

## Audited VPS specification

| Component | Audited result |
|---|---|
| Nginx | Active; configuration syntax successful |
| Nginx warnings | Duplicate `gatorinbox.com` server names exist elsewhere and are unrelated to Head–Heart; clean separately |
| PHP CLI | 8.3.6 |
| PHP-FPM | `php8.3-fpm.service`, active |
| PHP extensions | PDO, `pdo_mysql`, JSON, mbstring, OpenSSL, cURL, DOM and fileinfo present |
| Database server/client | MariaDB 10.11.14 |
| Default shell Node | 18.19.1 — not suitable for Vite 7 |
| Isolated build Node | `/opt/node-v22/bin` |
| Protected staging environment | `/etc/head-heart-alignment/staging.env`, mode `0600` |
| Public site health | Home HTTP 200, Admin HTTP 200, SSL verified |
| Automatic Git timer | Disabled and inactive |

## Verified implementation coverage

The production-readiness branch includes:

- real PHP administrator login, logout, secure sessions, CSRF, rate limiting and roles;
- participant registration, consent, MariaDB autosave and hashed secure resume tokens;
- four assessment tracks with 50 questions across ten sections;
- versioned assessment clone, draft, edit and publish workflows;
- participant search, details, export and anonymisation;
- CMS branding with logo, banner, stage image, email logo, report logo and favicon uploads;
- compact responsive administration styling;
- Lite and Full reports, secure links and branded PDFs;
- Stripe Checkout, signed webhooks, refunds and affiliate commissions;
- SMTP2GO/SMTP settings, templates, test email, reminders and retry queue;
- affiliate/UTM attribution, analytics, SEO/AEO/GEO, privacy, retention and alerts;
- ordered migrations, seed data, integration tests and rollback-aware deployment scripts.

## Next controlled stage

Do not replace the live release yet. Stage 4 is now next:

1. Build an isolated staging release with `VITE_API_MODE=production` and `/api` as the API base.
2. Configure a loopback-only Nginx endpoint on `127.0.0.1:8088` using `php8.3-fpm`.
3. Confirm `/api/health` returns `status: ok`.
4. Create the first staging owner interactively; never place the password in shell history or Git.
5. Test real admin login, logout, session restoration, expiry, lockout and CSRF.
6. Test participant registration, autosave, secure resume, completion and Lite Report.
7. Test branding draft, upload, publish and rollback.
8. Add SMTP2GO test credentials and verify delivered email.
9. Add Stripe test credentials and verify signed webhook processing.
10. Restore the Phase A database backup into a fresh database as a recovery drill.
11. Merge PR #5 only after staging acceptance.
12. Run the atomic production deployment only after all gates pass.

## Source and release layout

```text
/srv/head-heart.atomglobal.com/source
    Current live Git working tree

/srv/head-heart.atomglobal.com/staging-source
    Isolated production-readiness staging checkout

/var/www/head-heart.atomglobal.com/releases
    Immutable live releases

/var/www/head-heart.atomglobal.com/current
    Active live release symlink

/var/www/head-heart-staging.atomglobal.com
    Isolated staging application root

/etc/head-heart-alignment/staging.env
    Protected staging credentials

/etc/head-heart-alignment/app.env
    Protected production credentials; create only for production activation

/var/lib/head-heart-alignment-staging
    Persistent staging media and report storage

/var/backups/head-heart-alignment-staging
    Staging database backups
```

## Manual deployment policy

The five-minute Git timer must remain off. Production deployment is deliberate and manual:

```text
Approved Git commit
        ↓
Database backup
        ↓
Composer, PHP and frontend tests
        ↓
Migrations and seed validation
        ↓
Build versioned release
        ↓
Atomic current-symlink switch
        ↓
/api/health and HTTPS verification
        ↓
Automatic code rollback on failure
```

Database migrations are forward-only. A complete database rollback requires restoring the pre-deployment SQL backup; switching the code symlink alone does not reverse schema changes.

## Production-ready definition

The platform is production-ready only after:

- the public assessment saves to MariaDB rather than browser preview storage;
- secure resume links work from delivered emails;
- all four tracks and scoring fixtures pass;
- `/admin` uses real authentication and permission checks;
- every visible admin action reads or writes authorised database records;
- Lite and Full reports are reproducible and PDFs are visually approved;
- verified Stripe webhooks control paid report unlocks;
- SMTP2GO/SMTP delivery, retry and reminder flows are tested;
- branding uploads survive deployment and rollback;
- privacy export, anonymisation and retention jobs pass;
- staging backup and restore are demonstrated;
- the production environment file and external credentials remain outside Git;
- client staging acceptance is recorded.

See `docs/PRODUCTION-READINESS.md` for the detailed task and acceptance checklist.
