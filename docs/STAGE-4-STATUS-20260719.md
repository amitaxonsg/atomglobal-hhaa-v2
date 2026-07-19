# Stage 4 staging status — 19 July 2026

## Current state

- Live production remains unchanged at commit `42744f41cd96d134ef0059f5175c890280f811f4`.
- The automatic five-minute deployment timer remains disabled and inactive.
- Phase A isolated MariaDB staging completed successfully.
- The first Stage 4 loopback attempt bound only to `127.0.0.1:8088` but `/api/health` returned HTTP 404.
- The Stage 4 failure restored the previous staging state and did not switch the live release.
- The corrective Stage 4 script is now stored at `deploy/stage4-local.sh`.
- GitHub frontend, PHP and clean-database integration checks pass at commit `ec64df235afd48f5bdd9344d01d2a8aead8d41ad`.

## Stage 4 correction

The corrected script:

- builds the frontend with the production PHP API mode;
- runs all pending database migrations and seed data;
- creates an immutable staging release;
- uses the resolved release path for PHP-FPM;
- explicitly supplies the front-controller FastCGI request variables;
- verifies that the PHP-FPM user can read the front controller;
- captures the health response body and HTTP status;
- prints Nginx and PHP-FPM diagnostics before rollback;
- binds staging only to `127.0.0.1:8088`;
- confirms that the live release and deployed-commit marker remain unchanged.

## Administration interface changes

Completed in the production-readiness branch:

- modern desktop split-screen login;
- compact mobile login;
- reduced heading, table, form and dashboard font sizes;
- grouped sidebar navigation;
- compact dashboard metrics and data tables;
- consistent cream, navy, red and gold Atom Global styling;
- secure-workspace indicators;
- real PHP session login when built with production API mode.

## Branding and email changes

Completed in the production-readiness branch:

- transparent Atom Global logo retained as the default;
- logo, banner, stage image, email logo, report logo and favicon controls;
- central branded HTML email shell;
- centred logo, white card, cream background and brand-red action controls;
- website, privacy and terms footer links;
- responsive email rendering and plain-text fallback;
- editable welcome, resume, reminder, completion, report, payment, password-reset and admin-alert templates;
- default incomplete-assessment reminder schedule of 24, 72 and 168 hours;
- sender, provider, API, footer-link and reminder settings in the admin CMS;
- administrator alert recipient and alert-template defaults.

## Secret handling

Provider keys and credentials are not stored in Git. Any key shared through chat or another message channel must be replaced before use. Store replacement staging credentials only in `/etc/head-heart-alignment/staging.env` or through encrypted Settings fields after the real admin is active.

## Remaining Stage 4 tasks

- [ ] Pull commit `ec64df235afd48f5bdd9344d01d2a8aead8d41ad` into the isolated staging checkout.
- [ ] Run `deploy/stage4-local.sh`.
- [ ] Confirm `/api/health` returns HTTP 200 with `status: ok`.
- [ ] Confirm `/api/admin/session` returns HTTP 401 before login.
- [ ] Create the first owner interactively.
- [ ] Open staging through an SSH tunnel.
- [ ] Confirm the staging login no longer displays preview mode.
- [ ] Test login, logout, session restoration, rate limiting and CSRF.
- [ ] Configure a replacement SMTP2GO key outside Git.
- [ ] Send and deliver a branded test email.
- [ ] Test participant registration, welcome and resume emails.
- [ ] Test all three incomplete-assessment reminders.
- [ ] Test autosave, resume, completion and Lite Report delivery.
- [ ] Test branding upload, draft, publish and rollback.
- [ ] Configure Stripe test credentials and verify signed webhooks.
- [ ] Restore the Phase A SQL backup into a fresh database.
- [ ] Record staging acceptance before merging PR #5.

Production must not be switched until the remaining staging gates pass.
