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
| Branch head after VPS adaptation | `7936453fa4281251360fe849e4b5642dc88f2cfc` |
| Last complete green CI before server-specific script adaptation | Run #92: frontend, PHP and MySQL all passed |
| Live frontend | Working preview |
| Live `/admin` | **Preview/mock mode** |
| Live MySQL backend | Not connected yet |
| Live deployed application commit | `42744f41cd96d134ef0059f5175c890280f811f4` |
| Active live release | `/var/www/head-heart.atomglobal.com/releases/20260719-063144-42744f41cd96` |
| Five-minute deployment timer | **Disabled and inactive** |
| Production deployment | Not started |

The live `/admin` screen showing `preview@atomglobal.com` and **Enter preview CMS** proves only that the React preview loads. It does not prove PHP authentication or live database connectivity.

The production-readiness branch uses real PHP APIs when built with:

```text
VITE_API_MODE=production
VITE_API_BASE_URL=/api
```

## Audited VPS specification

Read-only audit completed on 19 July 2026:

| Component | Audited result |
|---|---|
| Nginx | Active; configuration syntax successful |
| Nginx warnings | Duplicate `gatorinbox.com` server names exist elsewhere and are unrelated to Head–Heart; clean separately |
| PHP CLI | 8.3.6 |
| PHP-FPM | `php8.3-fpm.service`, active |
| PHP extensions | PDO, `pdo_mysql`, JSON, mbstring, OpenSSL, cURL, DOM and fileinfo present |
| Database server/client | MariaDB 10.11.14 |
| Default shell Node | 18.19.1 — not suitable for Vite 7 |
| Isolated build Node | `/opt/node-v22/bin` must be used |
| npm from default shell | 9.2.0 |
| Composer | Not shown by the audit; verify before staging |
| Protected environment | `/etc/head-heart-alignment/app.env` not created |
| Public site health | Home HTTP 200, Admin HTTP 200, SSL verified |
| Git source branch | `main` at documentation commit `a3c87ef` |
| Automatic Git timer | Disabled and inactive |

The staging and production scripts now automatically prefer `/opt/node-v22/bin` and detect the active PHP-FPM service, including PHP 8.3. Environment files are parsed without executing shell commands.

## Verified implementation coverage

The production-readiness branch includes:

- real PHP administrator login, logout, secure sessions, CSRF, rate limiting and roles;
- participant registration, consent, MySQL autosave and hashed secure resume tokens;
- four assessment tracks with 50 questions across ten sections;
- versioned assessment clone, draft, edit and publish workflows;
- participant search, details, export and anonymisation;
- CMS branding with logo, banner, stage image, email logo, report logo and favicon uploads;
- compact responsive administration styling;
- Lite and Full reports, secure links and branded PDFs;
- Stripe Checkout, signed webhooks, refunds and affiliate commissions;
- SMTP2GO/SMTP settings, templates, test email, reminders and retry queue;
- affiliate/UTM attribution, analytics, SEO/AEO/GEO, privacy, retention and alerts;
- ordered MySQL migrations, seed data, integration tests and rollback-aware deployment scripts.

GitHub Actions has passed the frontend, PHP and clean MySQL 8 integration jobs. MariaDB 10.11 compatibility must now be demonstrated on the VPS staging database before production activation.

## Safe next stage

Do not replace the live release yet. The next controlled sequence is:

1. Verify Composer 2 and `/opt/node-v22/bin/node`.
2. Create a separate staging source checkout.
3. Create a restricted MariaDB staging database and user.
4. Create `/etc/head-heart-alignment/staging.env` with mode `0600`.
5. Run `deploy/phase-a-staging.sh` against staging paths only.
6. Confirm migrations, seed data, tests and backup output.
7. Configure a separate staging Nginx/PHP-FPM endpoint.
8. Create the first staging owner account.
9. Test real admin login, participant registration, autosave, resume, completion and reports.
10. Test SMTP2GO delivery and Stripe test webhooks.
11. Merge PR #5 only after staging acceptance.
12. Run `deploy/update-vps.sh` for an atomic production release with automatic code rollback.

The Phase A staging script does not switch the production `current` symlink.

## Source and release layout

```text
/srv/head-heart.atomglobal.com/source
    Current live Git working tree

/srv/head-heart.atomglobal.com/staging-source
    Recommended separate staging checkout

/var/www/head-heart.atomglobal.com/releases
    Immutable live releases

/var/www/head-heart.atomglobal.com/current
    Active live release symlink

/var/www/head-heart-staging.atomglobal.com
    Recommended staging application root

/etc/head-heart-alignment/staging.env
    Protected staging credentials

/etc/head-heart-alignment/app.env
    Protected production credentials; create only for production activation

/var/lib/head-heart-alignment-staging
    Recommended persistent staging media/report storage

/var/backups/head-heart-alignment-staging
    Recommended staging database backups
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