# Head–Heart Alignment production-readiness programme

This document describes the implementation on branch `production-readiness-20260719` and the acceptance gates required before it is merged or deployed.

The existing live static frontend must remain untouched until staging has passed every mandatory gate below.

## Delivery principles

- Self-hosted on the Atom Global VPS using Nginx, PHP 8.2+, MySQL/MariaDB and Node 22 for builds.
- No runtime dependency on Netlify.
- Git contains source and non-secret defaults only. Production credentials live in `/etc/head-heart-alignment/app.env` or encrypted settings.
- All database changes use ordered migrations and a pre-migration database backup.
- Participant sessions, reports and payment unlocks are server-authoritative.
- Published assessment versions are immutable; changes are made by cloning a draft.
- The five-minute Git deployment timer remains disabled. Production deployment is deliberate and manual.

## Phase A — staging infrastructure and deployment safety

Implemented in this branch:

- MySQL schema extensions for branding revisions, track timing, alerts, notification events, retention, integration tests and report delivery.
- Node 22, PHP 8.2 and MySQL CI checks.
- `deploy/phase-a-staging.sh` for prerequisites, protected environment creation, build checks, database backup, migrations, seed and tests without switching production.
- Atomic `deploy/update-vps.sh` with database backup, Composer/npm validation, migration, versioned release, health check and rollback.
- Hardened Nginx example for `/api`, persistent media, CSP, rate limits and no-cache HTML.

Acceptance gate:

- [ ] Separate staging database and restricted database user created.
- [ ] `/etc/head-heart-alignment/app.env` completed with test-only Stripe and email credentials.
- [ ] Phase A script passes without changing the current production symlink.
- [ ] `/api/health` returns `status: ok` on staging.
- [ ] Database backup can be restored to a fresh empty database.

## Phase B — secure administration

Implemented in this branch:

- Real PHP session login, logout and session restoration.
- Secure HttpOnly/SameSite cookies, CSRF on state-changing admin requests and login rate limiting.
- Owner, administrator, editor, finance and viewer roles with permission checks.
- Admin user creation/update, session-version invalidation and Argon2id password hashing.
- Audit records for login and administration changes.
- React administration shell connected to production APIs.

Acceptance gate:

- [ ] Create first owner interactively; no password appears in shell history.
- [ ] Test every role against allowed and forbidden endpoints.
- [ ] Test login lockout, logout, expired session and CSRF rejection.
- [ ] Add and test password-reset delivery before launch.
- [ ] Decide whether two-factor authentication is mandatory for owner/administrator roles.

## Phase C — participants, assessment sessions and CMS

Implemented in this branch:

- Participant registration, required privacy/transactional consent and optional marketing consent.
- Secure 256-bit resume tokens stored only as hashes.
- Server-side answer autosave and duplicate-safe answer upserts.
- Immutable question/scoring snapshot per session.
- UTM, first/last affiliate attribution and essential analytics events.
- Participant search, detail, answers, reports, payments, email history, export and anonymisation.
- Assessment clone, draft question editing, report-template editing and controlled publication requiring exactly 50 active questions across 10 sections.
- CMS-managed track labels, durations, reading times and progress display settings.

Acceptance gate:

- [ ] Complete all four 50-question tracks in staging and compare scores against preserved reference cases.
- [ ] Resume links work, expire and become invalid when rotated.
- [ ] Concurrent autosave does not lose or duplicate answers.
- [ ] Published sessions remain linked to their original assessment version after a new version is published.
- [ ] Privacy export contains all expected records; anonymisation removes direct identifiers without breaking financial/audit records.

## Phase D — branding, media and content

Implemented in this branch:

- Central published branding configuration used by participant and admin interfaces.
- Default Atom palette, Georgia headings and Arial/Helvetica body typography.
- Draft, preview, restore-default and publish workflow.
- Uploads for public logo, banner, stage images, email logo, report logo and favicon.
- MIME/size validation, safe SVG checks and persistent media storage outside releases.
- Stage headline, supporting text, alt text, focal point, overlay, active state and order.
- Compact admin typography and responsive workspaces.
- Latest transparent Atom Global wordmark remains the repository default.

Acceptance gate:

- [ ] Transparent logo verified on dark photograph, cream page, email and PDF.
- [ ] Image uploads survive a versioned deployment and rollback.
- [ ] Colour contrast reviewed for body text, controls, focus states and buttons.
- [ ] Branding draft does not affect public pages until publish.
- [ ] Restore-default and rollback procedures tested.

## Phase E — reports, payments and email automation

Implemented in this branch:

- Immediate Lite Report and gated Full Report data.
- Stripe Checkout with track price IDs and verified signed webhook processing.
- Payment success, failure, abandonment and refund states.
- Full report unlock only after verified webhook or authorised admin action.
- Affiliate commission creation and voiding on refund.
- Secure report link rotation, resend, revoke, lock/unlock and PDF regeneration.
- Branded server-side PDF generation and private PDF delivery endpoint.
- SMTP2GO API and SMTP delivery providers.
- Editable email templates, test email, retryable queue, exponential backoff, suppression-ready logs and failure alerts.
- Registration, resume, abandoned survey, completion, payment and report messages.
- Three configurable abandonment reminder intervals.

Acceptance gate:

- [ ] SMTP2GO sender/domain authentication passes and test email is delivered.
- [ ] Email rendering reviewed in major clients; unsubscribe wording added to optional marketing messages.
- [ ] Stripe test checkout completes and only a verified webhook unlocks the report.
- [ ] Duplicate webhooks are idempotent.
- [ ] Failed, expired and refunded payment cases update reports and commissions correctly.
- [ ] Lite and Full PDFs are visually reviewed and do not expose private storage paths.
- [ ] Secure report links expire, rotate, revoke and resist guessing.

## Phase F — marketing, analytics, security and operations

Implemented in this branch:

- Affiliate links, UTM capture, first/last attribution, conversion and commission reporting.
- Funnel events and abandoned-section reporting.
- Admin alert recipients and notification centre.
- SEO/AEO/GEO page settings, Open Graph and structured-data storage.
- Audit log, retention policies, privacy processing and scheduled workers.
- Health checks for database, migrations, storage, Stripe, email and cron heartbeat.
- Daily retention and PDF jobs plus five-minute reminder/email worker.

Acceptance gate:

- [ ] Independent security review of authentication, session, upload, token and webhook handling.
- [ ] Nginx CSP tested against Stripe and application assets without unsafe production exceptions.
- [ ] Database user privileges restricted to the application database only.
- [ ] Backups encrypted/off-server and restore drill completed.
- [ ] Error logs, disk/storage alerts, failed webhook/email alerts and cron heartbeat monitored.
- [ ] Retention periods approved by Atom Global and legal/privacy adviser.
- [ ] Terms, privacy notice, refund policy and report disclaimer approved.
- [ ] Load and concurrency tests completed.
- [ ] Staging acceptance signed before production switch.

## Production activation sequence

1. Freeze content and scoring changes.
2. Back up the current live release and production database.
3. Pull the approved merge commit to the VPS source directory.
4. Configure the protected production environment file.
5. Run `deploy/phase-a-staging.sh` against staging first.
6. Execute full acceptance tests.
7. Run `deploy/update-vps.sh` for an atomic production release.
8. Confirm `/`, `/admin`, `/api/health`, registration, autosave, completion, email and Stripe webhook.
9. Keep the prior release and database backup available for rollback.
10. Monitor logs, queue, payments, email and storage closely after launch.

## Not acceptable as proof of production readiness

- A successful frontend build alone.
- The admin pages loading with mock data.
- Stripe redirecting without a verified webhook test.
- An email entering the queue without confirmed provider delivery.
- A database migration succeeding without restore testing.
- A single happy-path assessment completion.

Production readiness requires CI, staging, security, integration and rollback evidence—not only source-code completion.
