# Head–Heart Alignment production-readiness status

Updated **19 July 2026** for branch `production-readiness-20260719` and draft PR #5.

## Current status

| Area | Status |
|---|---|
| Live public site | Working frontend preview |
| Live `/admin` | **Mock/preview mode**, not MySQL authentication |
| Production branch | `production-readiness-20260719` |
| Verified CI commit | `b95afa14560a262708163230c234613be9866aa9` |
| Frontend tests/build | **Passed** |
| PHP lint/tests | **Passed** |
| MySQL migrations/seed/integration | **Passed** |
| PR #5 | Open, mergeable, still draft |
| VPS backend deployment | Not started |
| Production database | Not connected |
| Five-minute Git timer | Must remain disabled |

The screenshot showing `preview@atomglobal.com` and **Enter preview CMS** confirms that the currently deployed frontend was built with `VITE_API_MODE=mock`. It is not yet authenticating against PHP/MySQL.

## CI evidence

GitHub Actions run **#88** completed successfully after correcting the legacy seed migration so it can run safely alongside the production-readiness migration.

The successful database job now verifies:

- ordered MySQL migrations;
- seed data;
- required schema tables;
- four assessment tracks;
- assessment settings and questions;
- email templates and content stages;
- PHP/MySQL integration flow;
- secure participant session, resume, completion and report generation;
- administrator authentication and branding persistence.

CI proves the code works against a clean MySQL 8 database. It does **not** prove the VPS environment, credentials, SMTP2GO, Stripe, DNS, storage permissions or rollback procedure are ready.

## Completed implementation

### Phase A — infrastructure and deployment safety

- [x] Ordered MySQL migrations.
- [x] Idempotent seed data.
- [x] Frontend, PHP and MySQL CI.
- [x] Protected external environment-file design.
- [x] Pre-migration database backup in deployment scripts.
- [x] Versioned releases and atomic symlink switch.
- [x] Automatic code rollback when deployment health checks fail.
- [x] Persistent media/report storage outside release folders.
- [x] Cron definitions for email, reminders, PDFs and retention.

### Phase B — secure administration

- [x] Real PHP login/logout/session restoration.
- [x] Secure HttpOnly/SameSite cookies.
- [x] CSRF validation on state-changing admin APIs.
- [x] Login rate limiting and temporary lockout.
- [x] Owner, administrator, editor, finance and viewer permissions.
- [x] Argon2id password hashing.
- [x] Administrator management and session invalidation.
- [x] Password-reset token foundation.
- [x] Login and administration audit records.

### Phase C — participants and assessments

- [x] Participant identity and consent records.
- [x] Server-side autosave to MySQL.
- [x] Secure 256-bit resume tokens stored as hashes.
- [x] Immutable assessment/question/scoring snapshots.
- [x] Participant search, details, export and anonymisation.
- [x] Assessment clone, draft, question editing and publishing.
- [x] Exactly 50 active questions across ten sections required for publication.
- [x] Track duration, labels and report-reading settings.

### Phase D — branding and CMS

- [x] Shared participant/admin branding configuration.
- [x] Logo, banner, stage image, email logo, report logo and favicon upload controls.
- [x] Colour, font, radius and interface settings.
- [x] Branding draft, preview, restore and publish workflow.
- [x] Persistent media storage and upload validation.
- [x] Compact admin typography and responsive layouts.

### Phase E — reports, Stripe and email

- [x] Lite and Full report data separation.
- [x] Secure report links and private PDF endpoint.
- [x] Report lock, unlock, revoke, rotate, resend and regenerate.
- [x] Stripe Checkout and signed webhook processing.
- [x] Idempotent webhook-event records.
- [x] Refund handling and paid-report relocking.
- [x] SMTP2GO API and authenticated SMTP providers.
- [x] Editable email templates and test-email queueing.
- [x] Retry queue, delivery logs and failure notifications.
- [x] Configurable abandoned-assessment reminders.

### Phase F — affiliates, analytics, privacy and operations

- [x] Affiliate codes, first/last attribution and UTM capture.
- [x] Conversion, revenue and commission records.
- [x] Funnel/drop-off analytics.
- [x] Notification centre and admin alert recipients.
- [x] SEO/AEO/GEO page settings.
- [x] Audit, retention and privacy jobs.
- [x] Database/storage/Stripe/email/cron health checks.

## VPS deployment gate — must be completed next

### 1. Read-only server verification

- [ ] Confirm operating system, Nginx and PHP-FPM service names.
- [ ] Confirm PHP CLI is 8.2 or newer and required extensions are present.
- [ ] Confirm Node 22 and Composer 2.
- [ ] Confirm `/srv/head-heart.atomglobal.com/source` is clean.
- [ ] Confirm the deployment timer is disabled and inactive.
- [ ] Record the current deployed commit and active release path.
- [ ] Record disk space, memory and current website health.

### 2. Database and environment preparation

- [ ] Create a separate restricted MySQL database and user.
- [ ] Store credentials only in `/etc/head-heart-alignment/app.env` with mode `0600`.
- [ ] Configure `APP_ENV=staging` initially.
- [ ] Configure `VITE_API_MODE=production` only for the staged backend build.
- [ ] Generate a new application encryption key.
- [ ] Confirm persistent storage ownership and write access.
- [ ] Do not add real Stripe or SMTP secrets to Git.

### 3. Phase A staging acceptance

- [ ] Pull branch `production-readiness-20260719` into a controlled staging checkout.
- [ ] Run `deploy/phase-a-staging.sh` without changing the live symlink.
- [ ] Confirm all migrations and seeds pass on the VPS database.
- [ ] Confirm `/api/health` reports database, migrations and storage healthy.
- [ ] Create the first owner account securely.
- [ ] Confirm `/admin` displays a real login and no preview credentials.
- [ ] Confirm participant registration, autosave, resume and completion use MySQL.
- [ ] Confirm Lite Report and private PDF generation.

### 4. External service acceptance

- [ ] Configure SMTP2GO staging credentials and authenticated sender.
- [ ] Deliver and inspect a real test email.
- [ ] Configure Stripe test keys, webhook secret and four test Price IDs.
- [ ] Test payment success, cancellation, failure, duplicate webhook and refund.
- [ ] Verify Full Report unlock happens only after a verified webhook.
- [ ] Verify refund relocks the report and voids commission.

### 5. Production switch and rollback

- [ ] Back up the existing live release.
- [ ] Back up the production database immediately before migration.
- [ ] Run the atomic deployment script.
- [ ] Verify `/`, `/admin`, `/api/health`, registration, autosave, completion, email and Stripe.
- [ ] Keep the previous release and SQL backup available.
- [ ] Confirm the rollback command restores the former symlink and website.
- [ ] Monitor PHP, Nginx, queue, email, payment and storage logs after launch.

## Go/no-go decision

### Code status: **GO for VPS staging**

The repository code, frontend build, PHP tests and clean MySQL integration tests are green.

### Production status: **NO-GO until VPS staging passes**

Do not merge PR #5 or replace the live release merely because CI is green. The live server still needs environment validation, a restricted database, real owner authentication, external-service tests and a rollback drill.

## Safe activation sequence

1. Run a read-only VPS audit.
2. Back up the current source/release configuration.
3. Prepare a separate MySQL database and protected environment file.
4. Pull the production-readiness branch into staging.
5. Run `deploy/phase-a-staging.sh`.
6. Complete local PHP/MySQL acceptance.
7. Test SMTP2GO and Stripe in test mode.
8. Approve the production switch.
9. Merge PR #5 to `main`.
10. Run the atomic production deployment with rollback protection.
11. Verify and monitor.

## Important rules

- Never edit the active release directory.
- Never store secrets in Git or browser JavaScript.
- Never run destructive MySQL commands without a fresh backup.
- Never enable the five-minute deployment timer for this release.
- Never call the preview admin proof that MySQL is connected.
- Never remove the previous working release until the new release has passed verification.
