# Head–Heart Alignment Digital Assessment Platform

Self-hosted React, PHP and MariaDB assessment, reporting, payment, email, feedback and administration platform for Atom Global Consulting.

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
| Current live commit | `b5204caddfd9b93a3d3d532e38dfe385d071022c` |
| Current live release | `/var/www/head-heart.atomglobal.com/releases/20260719103507-b5204caddfd9` |
| Latest branch commit | `2d81daac28e853eb5da0592b597bb9bee6c07233` |
| Production health | Database, migrations, storage, email and cron healthy |
| Stripe | Not configured yet; checkout and signed-webhook acceptance remain pending |
| Owner login | Confirmed for `amit@axon.com.sg` |
| Deployment timer | Disabled and inactive |
| Application cron | Installed and running every minute |

The current production release is live for client testing. New branch changes never alter production automatically; `head-heart-v2-sync.timer` must remain disabled.

## Feedback and client collaboration

The latest branch includes a complete administration feedback workflow:

- **Feedback** and **Help** sections in the secure admin portal.
- Feedback type, module, priority, title, details, expected outcome, page and optional attachment link.
- Searchable register with `New`, `Clarification requested`, `Accepted`, `In progress`, `Ready for review`, `Done` and `Declined` states.
- Permanent change timeline and administrator audit entries.
- Acknowledgement email to `sunil.setpaul@atomglobal.com`.
- Internal notification to `amit@axon.com.sg`.
- Clarification email instructing Sunil to reply by email with the feedback reference.
- Completion email when an item is marked done.
- Automatic GitHub issue creation, status comments and issue closure when a repository-scoped token is configured.
- Owner-only GitHub/email routing configuration; the token is encrypted and never returned to the browser.
- Global administration search includes feedback records.

GitHub synchronisation requires a fine-grained token restricted to `amitaxonsg/atomglobal-hhaa-v2` with **Issues: read and write**. Configure it under **Admin → Feedback → GitHub and email routing**. Never place the token in Git, chat, feedback text or screenshots.

## Help and attribution

The Help page explains dashboard graphs, participant search, assessments, content, branding, reports, payments, email templates, feedback and secure production operation. Public assessment and administration screens display **Powered by Axon 1Pro** linked to `https://axon.com.sg/`.

## Administration coverage

- Secure session login, logout, CSRF, rate limiting, roles and permissions.
- Password reset request and confirmation.
- Dashboard trends, conversion funnel, track progress, revenue, email health and alerts.
- Global search across participants, reports, payments, email, affiliates and feedback.
- Participant search, status/track filters, history, export and anonymisation.
- Assessment clone, draft editing and controlled publishing.
- Question, timing, Lite Report and Full Report editors.
- Stage content, media and branding draft/publish workflow.
- Report unlock, lock, revoke, link rotation/resend and PDF regeneration.
- Payments and Stripe webhook records.
- Editable email templates, sandboxed preview, selected-template test, queue, retry and provider IDs.
- Affiliates, attribution, analytics, SEO/AEO/GEO, settings, administrators and audit logs.
- Feedback register, email updates, GitHub Issues synchronisation and searchable help.

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

## Reboot persistence and production audit

The application uses persistent Nginx configuration, immutable releases, a protected environment, persistent storage, MariaDB, PHP-FPM and `/etc/cron.d/head-heart-alignment`. It does not depend on an interactive shell or a temporary development process.

After deployment and after a planned reboot, run:

```bash
cd /srv/head-heart.atomglobal.com/source
bash deploy/final-production-audit.sh
```

The audit checks boot services, Nginx, immutable paths, environment permissions, cron, public HTTP/API health, four assessment tracks, published versions/questions, owner account, email templates, feedback tables/permissions/templates, Sunil's feedback address, GitHub feedback configuration, failed queues/webhooks and database backup freshness.

## Production verification

Automated integration tests cover:

- administrator authentication and permissions;
- four configured assessment tracks;
- 50 questions and 10 sections;
- secure session creation, autosave and resume;
- completion, scoring, Lite Report and Full Report protection;
- PDF generation and secure access;
- branding draft/publish;
- transactional email queueing and selected-template testing;
- dashboard graphs and global search;
- feedback creation, timeline, search, completion and client emails;
- audit history.

## Remaining external acceptance

Before final operational sign-off:

- rotate the previously exposed SMTP2GO credential and send a real selected-template test;
- configure the repository-scoped GitHub Issues token and submit one harmless test feedback item;
- confirm that the GitHub issue is created and its URL appears in the feedback register;
- move the test item through clarification, in progress, ready for review and done, confirming the expected emails;
- configure Stripe test credentials, four Price IDs and the signed webhook secret;
- complete one Stripe test purchase and refund;
- complete all four assessment tracks and review scoring, Lite/Full reports and PDFs;
- run `deploy/final-production-audit.sh` and retain its output;
- merge PR #5 only after client acceptance.

## Safe deployment rule

Every deployment must back up the production database, build a new immutable release, run migrations and tests, verify `/api/health`, switch atomically and retain rollback capability. Never enable `head-heart-v2-sync.timer` for automatic production changes.
