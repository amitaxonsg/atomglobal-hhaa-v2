# Head–Heart Alignment Digital Assessment Platform

Self-hosted React, PHP 8.3 and MariaDB assessment, reporting, payment, email, feedback and administration platform for Atom Global Consulting.

This is the independent V2 project. Do not reconnect it to the original repository or former Netlify project.

## Current status — 20 July 2026

| Item | State |
|---|---|
| Public URL | `https://head-heart.atomglobal.com/` |
| Admin URL | `https://head-heart.atomglobal.com/admin` |
| VPS | `161.97.137.234` |
| Git repository | `amitaxonsg/atomglobal-hhaa-v2` |
| Default branch | `main` |
| Production-ready merge | PR #5 merged into `main` on 20 July 2026 |
| Current production baseline commit | `70bc001474fcdfec055bfc18eda416e31a4920f3` before the audit/branding release |
| Code acceptance | Production readiness checks run #416 passed frontend, PHP, database, questionnaire integration and deployment/final-audit script validation |
| Public runtime | React frontend, PHP 8.3 API and MariaDB |
| Last production release confirmed | `/var/www/head-heart.atomglobal.com/releases/20260720055557-70bc001474fc` |
| Last production marker confirmed | `70bc001474fcdfec055bfc18eda416e31a4920f3` |
| Current observed public screen | Restored left branding with Personal, New Joiner, Manager and Executive active on the right |
| Production health in last output | Database, migrations, storage, email, GitHub feedback and cron healthy |
| Stripe | Not configured; checkout and signed-webhook acceptance remain pending |
| Owner login | Confirmed for `amit@axon.com.sg` |
| Git deployment timer | `head-heart-v2-sync.timer` must remain disabled and inactive |
| Application cron | Installed and healthy |

Production Admin and database verification confirmed exactly four published `2.0.0` assessments. All obsolete `1.0.0` questionnaire versions, the unfinished old session and its test participant data were removed after verified MariaDB backups.

## Verified production experience

The `main` branch now combines the approved questionnaire process with the previously approved visual branding:

- responsive desktop split screen with the reflective image on the left;
- transparent Atom Global logo over the image;
- CMS stage headline, supporting copy, focal point and overlay;
- warm cream content area and current typography;
- latest `index.html` questionnaire landing, introduction, intake and question process;
- mobile single-column layout with the public logo and no image panel;
- no **Powered by Axon 1Pro** footer on participant or report pages;
- Axon attribution retained only on admin login and the protected admin sidebar.

The public questionnaire displays all four approved assessment cards: Personal, New Joiner, Manager and Executive. Every card uses its own active published assessment version and CMS content.

## Four public assessment choices

The approved public landing displays Personal, New Joiner, Manager and Executive together in the right-hand content panel.

Each card uses its own active published assessment version. Landing copy and card descriptions remain editable in Admin → Questionnaire, while questions, sections, scoring and reports remain versioned under Admin → Assessments.

The legacy `liveTrackKey` remains available for backward compatibility and deployment verification, but it no longer hides the other three public choices.

Existing secure resume links continue using their original assessment version. Completed answers, scoring, reports and PDFs stay tied to immutable snapshots.

## Questionnaire process retained from the supplied `index.html`

1. Display all four approved assessment choices.
2. Show the track introduction and Heart/Head explanation.
3. Collect name, email, age range and optional gender.
4. Collect five assessment-specific context fields.
5. Optionally reveal Department and Level for configured work roles.
6. Record required privacy and transactional consent; marketing stays optional.
7. Present 10 autosaved sections of five questions each.
8. Accept five scored choices or `N/A — doesn’t apply / can’t answer`.
9. Exclude N/A from scoring.
10. Save an optional note beneath every question.
11. Support secure resume from the private email link.
12. Generate the Lite Report after completion.
13. Reveal the Full Report only after verified payment or an authorised admin action.

Reference hashes and ownership are documented in `docs/QUESTIONNAIRE-INDEX-REFERENCE.md`.

## Admin → Questionnaire

The Questionnaire workspace manages:

- public landing heading and introduction paragraphs;
- track-card title prefix and track description;
- track introduction and Lite/Full Report offer text;
- Heart and Head labels and explanations;
- participant context labels and option lists;
- conditional role triggers, Department and Level fields;
- N/A availability;
- optional answer notes.

**Admin → Content** manages the responsive left-panel images and stage copy. **Admin → Branding** manages logos, core and questionnaire colours, heading/body fonts, page/body/question/option/field sizes, participant/question widths, desktop gutter and component radii. Branding never edits assessment wording, scoring or report profile logic.

## Production database baseline reset — 20 July 2026

The production database was intentionally reset to the current approved assessment baseline after a full reference audit:

- exactly four assessment-version rows remain;
- Personal, New Joiner, Manager and Executive are all published as `2.0.0`;
- each track contains the approved 10 sections, 50 questions, five answer choices and matching report profiles;
- no `1.0.0` questionnaire version, old session, old participant, answer, score or report remains;
- the attached `index.html` reference hashes remain recorded in global settings;
- full database backups were created before every cleanup stage.

Future completed submissions must remain pinned to their immutable assessment version and snapshots. Never delete a version that has a completed session, score or report.

## Full production audit and submission smoke test

`deploy/full-production-audit.sh` verifies services, immutable Nginx paths, API health, four CMS tracks, exactly four published `2.0.0` versions, database foreign-key integrity, report linkage, email templates, branding configuration, cron and recent backups.

By default the audit is read-only. To create one temporary submission, verify Admin visibility, report generation and email queues, then remove the test records automatically:

```bash
SMOKE_RECIPIENT=amit@axon.com.sg \
SMOKE_TRACK=personal \
bash deploy/full-production-audit.sh
```

Add `SMOKE_SEND_EMAIL=1` only when four real participant-flow test messages should be delivered to the chosen clean recipient. The smoke test refuses an email already present in the participant database.

## Assessment and historical-report protection

**Admin → Assessments** retains all four tracks and their versions. The interface and API display a permanent warning:

> Do not replace an existing question with a different question. A material meaning change can invalidate comparisons and report interpretation.

Safeguards:

- published and archived versions are immutable;
- draft questions permit spelling, grammar and clarity corrections only;
- question identity, section, position, required/active state and scoring direction are locked;
- the administrator must confirm meaning and scoring intent are unchanged;
- before/after wording is recorded in the audit log;
- a materially different question requires a separately reviewed assessment version;
- existing sessions preserve question and scoring snapshots;
- completion preserves answer, score and report snapshots.

Publishing a draft archives the previous published version for new starts but does not rewrite old sessions or reports.

## Deployment routing and rollback

Production Nginx is pinned to exact immutable release paths. A previous script changed the `current` symlink without changing the Nginx path, which caused an old frontend/API to remain served.

The corrected `deploy/update-vps.sh` now:

- backs up the Head–Heart Nginx site file;
- backs up MariaDB;
- builds and tests a new immutable release;
- verifies the restored left-image frontend and four-card assessment client;
- atomically repoints the exact Nginx frontend and backend paths;
- validates Nginx before reload;
- verifies `/api/health`, `/api/public/assessment-experience`, `liveTrackKey` and four managed tracks;
- restores Nginx, symlink and markers on failure;
- keeps unrelated Nginx sites untouched.

Repeated `gatorinbox.com` conflicting-server-name messages are unrelated warnings. They do not fail `nginx -t`, and this project must not change those configurations.

## Feedback, help and email

The secure admin portal includes:

- Feedback and Help sections;
- searchable feedback states and permanent timeline;
- acknowledgement to `sunil.setpaul@atomglobal.com`;
- internal notification to `amit@axon.com.sg`;
- clarification and completion emails;
- GitHub issue creation/comments/closure when the restricted token is configured;
- editable email templates with preview, selected-template test, queue and retry;
- global search across operational records and feedback.

GitHub feedback synchronisation uses a fine-grained token restricted to `amitaxonsg/atomglobal-hhaa-v2` with **Issues: read and write**. Never place tokens, passwords or keys in Git, chat, feedback text or screenshots.

## Administration coverage completed in code

- Secure login/logout, CSRF, rate limiting, roles and permissions.
- Password reset.
- Dashboard trends, funnel, progress, revenue, email health and alerts.
- Participant search, filters, history, N/A, notes, export and anonymisation.
- Questionnaire, content and branding CMS.
- Assessment version cloning, protected correction and controlled publishing.
- Lite/Full Report content, unlock/lock/revoke/resend and PDF generation.
- Payments and signed Stripe webhook processing.
- Email templates, queue, provider IDs and retry.
- Affiliates, attribution, analytics, SEO/AEO/GEO and audit logs.
- Feedback workflow, GitHub Issues synchronisation and searchable help.

## Automated verification

The merged production-ready commit passed:

- frontend tests and Vite production build;
- responsive split-layout and no-public-attribution assertions;
- questionnaire reference hashes;
- CMS landing, intake and conditional fields;
- four public assessment choices and independent server-side track validation;
- PHP lint and unit tests;
- clean MySQL migrations and seed;
- production integration acceptance;
- N/A persistence/exclusion, notes, autosave, resume, completion and scoring;
- audit records;
- deployment and final-production-audit script syntax validation.

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

## Next deployment acceptance

1. Deploy merged `main` using `deploy/update-vps.sh`.
2. Confirm the desktop public page restores the left image and approved branding.
3. Confirm mobile hides the image and shows the transparent logo.
4. Confirm public pages do not show Powered by Axon 1Pro.
5. Confirm admin login and sidebar still show Powered by Axon 1Pro.
6. Confirm `/api/public/assessment-experience` returns all four managed tracks.
7. Confirm Personal, New Joiner, Manager and Executive appear together on the right.
8. Confirm each card starts published CMS assessment version `2.0.0`.
9. Confirm every track contains the exact attached 10 sections and 50 questions.
10. Confirm every new session is pinned to published CMS version `2.0.0`.
11. Test Questionnaire CMS landing, card, introduction and intake changes.
12. Run the guarded submission smoke test and verify participant, 50 answers, score, report, Admin detail and four email queues before automatic test-data cleanup.
13. Rotate the previously exposed SMTP2GO credential and send a real template test.
14. Configure and test Stripe test keys, Price IDs and signed webhooks.
15. Run `deploy/full-production-audit.sh` (or the compatibility wrapper `deploy/final-production-audit.sh`) and retain its output.
16. Record Amit and client acceptance after production verification.

## Safe deployment rule

Every deployment must back up the database and Head–Heart Nginx site, build and test a new immutable release, repoint exact Nginx paths, verify health and questionnaire configuration, retain rollback, and keep `head-heart-v2-sync.timer` disabled. New Git commits never alter production automatically.
