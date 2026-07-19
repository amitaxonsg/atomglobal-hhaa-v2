# Head–Heart Alignment production-readiness status

Updated **19 July 2026** for branch `production-readiness-20260719` and draft PR #5.

## Current state

| Area | Status |
|---|---|
| Live public site | Working frontend preview |
| Live `/admin` | **Mock/preview mode**, not database authentication |
| Production-readiness branch | `production-readiness-20260719` |
| Current branch head | `147c0c34beba8c41ee33cf7be65542074a463f9c` |
| Frontend tests/build | Passed in GitHub Actions |
| PHP lint/tests | Passed in GitHub Actions |
| MySQL migrations/seed/integration | Passed in GitHub Actions |
| PR #5 | Open, mergeable, still draft |
| VPS read-only audit | Completed |
| VPS staging backend | Not started |
| Production database | Not connected |
| Five-minute Git timer | Disabled and inactive |
| Live deployed commit | `42744f41cd96d134ef0059f5175c890280f811f4` |

The screenshot showing `preview@atomglobal.com` and **Enter preview CMS** confirms that the current live build uses `VITE_API_MODE=mock`. It does not authenticate against PHP or MariaDB.

## CI evidence

The branch has passed:

- React tests and Vite production build;
- PHP lint and service tests;
- ordered schema migration on a clean MySQL 8 database;
- seed data;
- PHP/MySQL integration tests;
- critical table and seed verification.

CI proves the source works in the GitHub test environment. VPS staging must still prove MariaDB 10.11 compatibility, PHP-FPM routing, permissions, protected credentials, external email/payment services, backup restoration and rollback.

## Audited VPS facts

- [x] Nginx active.
- [x] Nginx configuration test successful.
- [x] PHP CLI 8.3.6.
- [x] `php8.3-fpm.service` active.
- [x] Required PHP extensions present.
- [x] MariaDB 10.11.14 available.
- [x] Live source tree clean on `main`.
- [x] Five-minute Git timer disabled and inactive.
- [x] Live release and commit recorded.
- [x] Home and Admin return HTTP 200 with valid SSL.
- [ ] Verify Composer 2 is installed; audit produced no Composer version.
- [ ] Verify `/opt/node-v22/bin/node` and npm directly; default shell Node is 18.19.1.
- [ ] Resolve unrelated duplicate `gatorinbox.com` Nginx server-name warnings separately.
- [ ] Create protected staging environment file.

The production scripts were updated to prefer `/opt/node-v22/bin`, auto-detect PHP 8.3 FPM and parse environment files without executing shell content.

## Completed source implementation

### Phase A — infrastructure and deployment safety

- [x] Ordered MySQL/MariaDB migrations.
- [x] Idempotent seed data.
- [x] Frontend, PHP and database CI.
- [x] Protected external environment-file design.
- [x] Pre-migration database backup.
- [x] Versioned releases and atomic symlink switching.
- [x] Automatic code rollback after failed health verification.
- [x] Persistent media/report storage outside release folders.
- [x] Cron definitions for reminders, email, PDFs and retention.
- [x] PHP 8.3/Node 22 VPS-runtime detection added.

### Phase B — secure administration

- [x] PHP login, logout and session restoration.
- [x] Secure HttpOnly/SameSite session cookies.
- [x] CSRF validation for state-changing admin APIs.
- [x] Login rate limiting and lockout.
- [x] Owner, administrator, editor, finance and viewer roles.
- [x] Argon2id password hashing.
- [x] Administrator management and session invalidation.
- [x] Password-reset token foundation.
- [x] Authentication and administration audit events.

### Phase C — participants and assessments

- [x] Participant identity and consent records.
- [x] Server-side answer autosave.
- [x] Secure resume tokens stored only as hashes.
- [x] Immutable assessment/question/scoring snapshots.
- [x] Participant search, details, export and anonymisation.
- [x] Assessment clone, draft, editing and publishing.
- [x] Exactly 50 active questions across ten sections required for publication.
- [x] Track labels, durations and report-reading settings.

### Phase D — branding and CMS

- [x] Shared participant/admin branding configuration.
- [x] Colour, font, radius and interface settings.
- [x] Logo, banner, stage image, email logo, report logo and favicon uploads.
- [x] Branding draft, preview, restore and publish workflow.
- [x] Persistent media storage and upload validation.
- [x] Compact responsive admin typography.
- [x] Latest transparent Atom Global wordmark retained as default.

### Phase E — reports, Stripe and email

- [x] Lite and Full report separation.
- [x] Secure report links and private PDF endpoint.
- [x] Report lock, unlock, revoke, rotate, resend and regenerate.
- [x] Stripe Checkout and signed webhook processing.
- [x] Idempotent webhook records.
- [x] Refund handling and paid-report relocking.
- [x] SMTP2GO API and authenticated SMTP providers.
- [x] Editable templates and test-email queueing.
- [x] Retry queue, delivery logs and alerts.
- [x] Configurable abandoned-assessment reminders.

### Phase F — affiliates, analytics, privacy and operations

- [x] Affiliate codes and first/last attribution.
- [x] UTM capture, conversions, revenue and commission records.
- [x] Funnel and drop-off analytics.
- [x] Notification centre and admin alert recipients.
- [x] SEO/AEO/GEO settings.
- [x] Audit, retention and privacy jobs.
- [x] Database/storage/Stripe/email/cron health checks.

## VPS staging gate — next work

### Stage 1 — prerequisites and isolation

- [ ] Verify Composer 2.
- [ ] Verify isolated Node 22.
- [ ] Create `/srv/head-heart.atomglobal.com/staging-source` from the production-readiness branch.
- [ ] Create `/var/www/head-heart-staging.atomglobal.com`.
- [ ] Create `/var/lib/head-heart-alignment-staging`.
- [ ] Create `/var/backups/head-heart-alignment-staging`.
- [ ] Keep the live source, live release and live Nginx site unchanged.

### Stage 2 — MariaDB staging database

- [ ] Create `head_heart_staging` with `utf8mb4`.
- [ ] Create a restricted local database user.
- [ ] Grant privileges only on the staging database.
- [ ] Generate a random password without putting it in Git.
- [ ] Create `/etc/head-heart-alignment/staging.env` with permission `0600`.
- [ ] Use test-only Stripe/email values or leave integrations disabled until configured.

### Stage 3 — Phase A execution

- [ ] Run `deploy/phase-a-staging.sh` using staging paths.
- [ ] Confirm pre-migration SQL backup exists.
- [ ] Confirm migrations and seed complete on MariaDB 10.11.
- [ ] Confirm PHP tests and frontend build pass on the VPS.
- [ ] Confirm production `current` symlink did not change.

### Stage 4 — staging web/API

- [ ] Configure separate staging Nginx/PHP-FPM routing.
- [ ] Confirm `/api/health` returns `status: ok`.
- [ ] Build frontend with `VITE_API_MODE=production` and `/api` base URL.
- [ ] Create the first owner account securely.
- [ ] Test real admin login, logout, expiry, lockout and CSRF.

### Stage 5 — end-to-end acceptance

- [ ] Complete all four tracks.
- [ ] Compare approved scoring fixtures.
- [ ] Test autosave, interruption and secure resume.
- [ ] Verify Lite Report and paid Full Report gating.
- [ ] Verify branding saves, uploads, publish and rollback.
- [ ] Test SMTP2GO delivery and reminder retries.
- [ ] Test Stripe checkout, duplicate webhook and refund in test mode.
- [ ] Review PDFs, secure links and privacy controls.
- [ ] Test database restore into a fresh staging database.

### Stage 6 — production activation

- [ ] Record client staging acceptance.
- [ ] Back up the live release and production database.
- [ ] Merge PR #5 only after all gates pass.
- [ ] Create `/etc/head-heart-alignment/app.env` with production credentials.
- [ ] Run atomic `deploy/update-vps.sh`.
- [ ] Verify `/`, `/admin`, `/api/health`, assessment, email and Stripe webhook.
- [ ] Retain the previous release and pre-deployment SQL backup.
- [ ] Monitor PHP, Nginx, queue, payment and storage logs.

## Rollback boundary

Code rollback is automatic when the new release fails health verification: the previous `current` symlink and deployed-commit marker are restored.

Database migrations are forward-only. A full database rollback requires restoring the pre-deployment SQL backup. Therefore no production deployment is allowed until backup restoration has been tested on staging.

## Production-ready definition

The system is production-ready only when the public assessment writes to MariaDB, the real admin uses PHP authentication and permissions, all four scoring flows pass, email and Stripe are tested end-to-end, branded media survives deployment, privacy controls work, database restoration is proven and client staging acceptance is recorded.