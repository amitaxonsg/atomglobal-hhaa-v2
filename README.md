# Head–Heart Alignment Digital Assessment Platform

Self-hosted React, PHP and MariaDB assessment, reporting, payment, email and administration platform for Atom Global Consulting.

This is the independent V2 project. Do not reconnect it to the original repository or former Netlify project.

## Current status — 19 July 2026

| Item | State |
|---|---|
| Public URL | `https://head-heart.atomglobal.com/` |
| VPS | `161.97.137.234` |
| Development branch | `production-readiness-20260719` |
| Pull request | Draft PR #5 |
| Live mode | Frontend preview; PHP/MariaDB not connected publicly |
| Live deployed commit | `42744f41cd96d134ef0059f5175c890280f811f4` |
| Deployment timer | Disabled and inactive |
| Phase A staging | Completed successfully |
| Stage 4 | Not yet passed |
| Stage 4 diagnosis | The former local request reached an unrelated Dr Tammi virtual host |
| Corrected staging endpoint | `127.0.0.1:18088`, host `head-heart-staging.local` |
| Latest approved branch commit | `583802df7945c3cf81e2a63c8e326a0fc0cdcff2` |
| Production deployment | Not started |

The public `/admin` remains preview mode. The real administration must pass private staging before production activation. The attempted owner creation with a password shorter than 12 characters did not create an account.

## VPS layout

```text
/srv/head-heart.atomglobal.com/source
/srv/head-heart.atomglobal.com/staging-source
/var/www/head-heart.atomglobal.com/releases
/var/www/head-heart.atomglobal.com/current
/var/www/head-heart-staging.atomglobal.com
/etc/head-heart-alignment/staging.env
/etc/head-heart-alignment/app.env
/var/lib/head-heart-alignment-staging
/var/backups/head-heart-alignment-staging
```

## Audited VPS stack

- Nginx active and configuration syntax valid.
- PHP 8.3.6 and `php8.3-fpm.service` active.
- PDO, `pdo_mysql`, JSON, mbstring, OpenSSL, cURL, DOM and fileinfo available.
- MariaDB 10.11.14.
- Node 22 available from `/opt/node-v22/bin`.
- Composer 2 working.
- Live Home and Admin return HTTP 200 with valid SSL.
- Duplicate `gatorinbox.com` Nginx warnings are unrelated maintenance.

## Phase A result

Phase A completed on isolated VPS staging:

```text
Staging source: /srv/head-heart.atomglobal.com/staging-source
Staging database: head_heart_staging
Environment: /etc/head-heart-alignment/staging.env
Backup: /var/backups/head-heart-alignment-staging/head_heart_staging-before-phase-a-20260719T064824Z.sql.gz
```

Migrations, seed data, PHP tests and the frontend build passed. The live release and deployed marker did not change.

## Staging checkout refresh

The staging checkout is disposable. Refresh it from the approved branch before every Stage 4 run instead of attempting to preserve local file-mode changes or generated files.

See `docs/STAGING-CHECKOUT-REFRESH.md` for the exact commands. Run `deploy/stage4-local.sh` through Bash and do not change its executable file mode.

## Corrected Stage 4 process

The corrected script:

1. uses `127.0.0.1:18088` and `head-heart-staging.local`;
2. refuses an occupied port;
3. verifies a private marker before PHP;
4. verifies the `X-Head-Heart-Staging: 1` response header;
5. tests `/api/health` and unauthenticated admin behaviour;
6. restores staging automatically after failure.

Required ending:

```text
STAGE 4 LOCAL API AND FRONTEND READY
URL: http://127.0.0.1:18088
HOST: head-heart-staging.local
LIVE PRODUCTION WAS NOT CHANGED
```

Do not delete the Dr Tammi site merely to reuse its port. Head–Heart has a separate staging port and can coexist safely. Disable or remove an unrelated site only after its exact Nginx files, domains and document root have been audited and backed up.

## Implemented platform coverage

- Real PHP admin sessions, CSRF, rate limiting, roles and permissions.
- Participant registration, consent, autosave and secure resume links.
- Four assessment tracks, 50 questions and ten sections.
- Assessment draft, clone, preview and publish workflows.
- Participants, reports, payments, email, affiliates, analytics, SEO, settings and audit modules.
- Branding colours, fonts, logo, banner, stage images, email logo, report logo and favicon.
- Modern administration login and compact dashboard styling.
- Lite and Full reports, secure links and branded PDFs.
- Stripe Checkout, signed webhooks and refund handling.
- SMTP2GO/SMTP settings, templates, test email, reminders, queue and alerts.

## Email workflow

Templates cover welcome, resume, three incomplete-assessment reminders, completion, Lite Report, Full Report, payment, password reset, test email, privacy confirmation and administrator alerts.

The shared email layout uses a centred transparent logo, white content card, cream surround, brand-red actions and footer links. Default reminder intervals are 24, 72 and 168 hours.

## Production activation rule

Do not switch the public Nginx site or live symlink until Stage 4 passes, a real owner can sign in, the production environment file exists, and the current live release and database have been backed up. Production deployment must use `deploy/update-vps.sh`, which creates a database backup, builds an immutable release, checks `/api/health` and restores the previous release after a failed health check.

## Remaining production gates

- [ ] Run corrected Stage 4 and obtain marker HTTP 200 and API `status: ok`.
- [ ] Create and test the real staging owner.
- [ ] Test authentication, expiry, lockout and CSRF.
- [ ] Test participant registration, autosave and resume.
- [ ] Deliver branded welcome, reminder and report emails.
- [ ] Complete all four tracks and verify scoring.
- [ ] Review Lite and Full reports and PDFs.
- [ ] Test branding publish and rollback.
- [ ] Test Stripe in test mode.
- [ ] Restore the Phase A backup into a fresh database.
- [ ] Test privacy export, anonymisation and retention.
- [ ] Record staging acceptance before merging PR #5 or changing production.
