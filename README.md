# Head–Heart Alignment Digital Assessment Platform

Self-hosted React, PHP and MariaDB assessment, reporting, payment, email and administration platform for Atom Global Consulting.

This is the independent V2 project. Do not reconnect it to the original repository or former Netlify project.

## Current status — 19 July 2026

| Item | State |
|---|---|
| Public URL | `https://head-heart.atomglobal.com/` |
| Admin URL | `https://head-heart.atomglobal.com/admin` |
| VPS | `161.97.137.234` |
| Development branch | `production-readiness-20260719` |
| Pull request | Draft PR #5 |
| Public mode | Real React frontend with PHP 8.3 and MariaDB production API |
| Live deployed commit | `bc9e73ba97ad2f9709eab01fa05fd873eab8ff4e` |
| Live release | `/var/www/head-heart.atomglobal.com/releases/20260719083359-bc9e73ba97ad` |
| Production health | `status: ok`; database, migrations, storage, email and cron healthy |
| Stripe | Not configured yet; checkout and webhook checks remain false by design |
| Owner login | Confirmed for `amit@axon.com.sg` |
| Deployment timer | Disabled and inactive |
| Application cron | Installed and running every minute |
| Stage 4 | Passed on private port `18088` |

The production site is live for client testing. The automatic Git deployment timer remains disabled so later branch changes cannot alter production without an explicit reviewed deployment.

## Final polish now on the branch

The branch contains a post-launch polish set that is not part of the currently deployed `bc9e73...` release until it is explicitly deployed:

- reflective login-page image using the existing stage artwork;
- transparent browser logo without the white rectangle;
- responsive login and dashboard refinements;
- administrator password-request and password-reset screens;
- role-aware navigation that hides modules the signed-in role cannot access;
- registration of the complete route bundle, including password recovery and attribution routes;
- migration `008_final_admin_polish.sql` for the browser logo setting;
- read-only reboot readiness audit at `deploy/reboot-readiness-audit.sh`.

The PNG remains the default email and report asset because SVG support varies across email clients. The transparent SVG is used for browser pages only.

## VPS layout

```text
/srv/head-heart.atomglobal.com/source
/srv/head-heart.atomglobal.com/staging-source
/var/www/head-heart.atomglobal.com/releases
/var/www/head-heart.atomglobal.com/current
/var/www/head-heart-staging.atomglobal.com/current
/etc/head-heart-alignment/app.env
/etc/head-heart-alignment/staging.env
/var/lib/head-heart-alignment
/var/lib/head-heart-alignment-staging
/var/backups/head-heart-alignment
/var/backups/head-heart-alignment-staging
```

## Production verification already completed

- Private staging marker returned HTTP 200.
- Private staging `/api/health` returned `status: ok`.
- Production-mode private preflight returned HTTP 200.
- Public Home and Admin return HTTP 200 with valid SSL.
- Signed-out `/api/admin/session` returns the expected HTTP 401.
- Public `/api/health` returns HTTP 200 in the production environment.
- Production owner login succeeds.
- PHP syntax, Composer dependencies, migrations, seed, scoring tests, JavaScript tests and Vite production build passed for the currently deployed release.
- Production cron recorded a recent run.
- Live deployment uses an immutable release directory.

## Reboot persistence

The application uses persistent Nginx configuration, a persistent immutable-release symlink, protected environment and storage paths, MariaDB, PHP-FPM and `/etc/cron.d/head-heart-alignment`. It does not depend on an interactive shell or a temporary development process.

Run the following after deployment and after any planned reboot:

```bash
cd /srv/head-heart.atomglobal.com/source
bash deploy/reboot-readiness-audit.sh
```

The audit requires Nginx, PHP 8.3 FPM, MariaDB and cron to be enabled and active; verifies Nginx syntax, persistent paths, environment permissions, writable storage, application cron, disabled Git timer and live HTTP/API behaviour.

## Implemented administration coverage

- Secure session login, logout, CSRF, login rate limiting, roles and permissions.
- Password reset request and confirmation flow.
- Dashboard metrics, recent participants, failures and alert acknowledgement.
- Participant search, status/track filters, detail history, export and anonymisation.
- Assessment version clone, draft edit and publish controls.
- Question, track timing, free-report and paid-report editors.
- Stage content and media uploads.
- Branding draft, preview and publish workflow.
- Reports: unlock, lock, revoke, rotate/resend and PDF regeneration.
- Payments and Stripe webhook status records.
- Email templates, queue, retries, provider test and administrator alerts.
- Affiliates, attribution, analytics funnel/drop-off, SEO/AEO/GEO, settings, administrators and audit logs.

## Client testing status

Client testing may proceed on the live site now. Use Stripe only after test credentials, test Price IDs and the webhook signing secret are configured. The previously exposed SMTP2GO key must be revoked and replaced through the protected Settings screen or environment file before final delivery testing.

The remaining acceptance work is operational rather than a claim that every external integration is already complete:

- deploy and visually verify the final polish branch after CI passes;
- rotate SMTP2GO credentials and confirm a delivered test message;
- configure Stripe test mode and verify signed webhook processing and refund events;
- complete all four assessment tracks and review scoring, Lite/Full reports and PDFs;
- test secure resume, password reset, privacy export/anonymisation and retention;
- run the reboot readiness audit and record its output;
- merge PR #5 only after client acceptance.

## Safe deployment rule

Every deployment must back up the production database, build a new immutable release, run migrations and tests, verify `/api/health`, switch atomically and retain rollback capability. Never enable `head-heart-v2-sync.timer` for automatic production changes.
