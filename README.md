# Head–Heart Alignment Digital Assessment Platform

Self-hosted React, PHP 8.3 and MariaDB assessment, reporting, payment, email, feedback and administration platform for Atom Global Consulting.

This is the independent V2 project. Do not reconnect it to the original repository or former Netlify project.

## Current status — 20 July 2026

| Item | State |
|---|---|
| Public URL | `https://head-heart.atomglobal.com/` |
| Admin URL | `https://head-heart.atomglobal.com/admin` |
| VPS | `161.97.137.234` |
| Development branch | `production-readiness-20260719` |
| Pull request | Draft PR #5; open, mergeable and not merged |
| Latest accepted code checkpoint | `0e045c3d14f24217d65f93bd54d8e1f0bf97d3ab` |
| Code acceptance | Production readiness checks run #404 passed frontend, PHP, database, questionnaire integration and deployment-script validation |
| Public runtime | React frontend, PHP 8.3 API and MariaDB |
| Last release confirmed in pasted VPS output | `/var/www/head-heart.atomglobal.com/releases/20260719224421-7568577dc195` |
| Last marker confirmed in pasted VPS output | `7568577dc195e4e2e319cda6edf3be4c5822768d` |
| Current observed public screen | Latest questionnaire copy/process is visible in the centred layout; the restored split layout and one-live-assessment controls remain pending deployment |
| Production health in last output | Database, migrations, storage, email, GitHub feedback and cron healthy |
| Stripe | Not configured; checkout and signed-webhook acceptance remain pending |
| Owner login | Confirmed for `amit@axon.com.sg` |
| Git deployment timer | `head-heart-v2-sync.timer` must remain disabled and inactive |
| Application cron | Installed and healthy |

The screenshot supplied after the corrected deployment confirms that the latest questionnaire process reached the public site. The exact active marker after that later deployment was not pasted; verify it from `/var/www/head-heart.atomglobal.com/deployed-commit.txt` before the next release.

## Latest branch change awaiting VPS deployment

The branch now combines the approved questionnaire process with the previously approved visual branding:

- responsive desktop split screen with the reflective image on the left;
- transparent Atom Global logo over the image;
- CMS stage headline, supporting copy, focal point and overlay;
- warm cream content area and current typography;
- latest `index.html` questionnaire landing, introduction, intake and question process;
- mobile single-column layout with the public logo and no image panel;
- no **Powered by Axon 1Pro** footer on participant or report pages;
- Axon attribution retained only on admin login and the protected admin sidebar.

The public questionnaire displays exactly one live assessment card at a time. All four assessment families remain available and versioned in the administration system.

## One live assessment at a time

**Admin → Questionnaire → Live assessment** selects Personal, New Joiner, Manager or Executive for new public starts.

The backend requires the selected track to:

- be active;
- have a published version;
- contain exactly 50 active questions;
- contain exactly 10 active sections.

The frontend shows only that assessment. The PHP API independently rejects a manually submitted hidden track, and every live-assessment change is audited.

Changing the live assessment affects new starts only. Existing secure resume links continue using their original assessment version. Completed answers, scoring, reports and PDFs stay tied to their immutable snapshots.

The default live assessment is Personal until an administrator changes it.

## Questionnaire process retained from the supplied `index.html`

1. Display the single assessment selected as live.
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

- the single live assessment;
- public landing heading and introduction paragraphs;
- track-card title prefix and track description;
- track introduction and Lite/Full Report offer text;
- Heart and Head labels and explanations;
- participant context labels and option lists;
- conditional role triggers, Department and Level fields;
- N/A availability;
- optional answer notes.

**Admin → Content** manages the responsive left-panel images and stage copy. **Admin → Branding** manages logo, colours, typography and visual tokens.

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
- verifies latest frontend identifiers;
- atomically repoints the exact Nginx frontend and backend paths;
- validates Nginx before reload;
- verifies `/api/health` and `/api/public/assessment-experience`;
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

The latest accepted code checkpoint passed:

- frontend tests and Vite production build;
- responsive split-layout and no-public-attribution assertions;
- questionnaire reference hashes;
- CMS landing, intake and conditional fields;
- one-live-assessment selection and server enforcement;
- PHP lint and unit tests;
- clean MySQL migrations and seed;
- production integration acceptance;
- N/A persistence/exclusion, notes, autosave, resume, completion and scoring;
- audit records;
- deployment-script syntax validation.

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

1. Deploy the final verified branch head using `deploy/update-vps.sh`.
2. Confirm the desktop public page restores the left image and approved branding.
3. Confirm mobile hides the image and shows the transparent logo.
4. Confirm public pages do not show Powered by Axon 1Pro.
5. Confirm admin login and sidebar still show Powered by Axon 1Pro.
6. Confirm `/api/public/assessment-experience` returns `liveTrackKey` plus four managed tracks.
7. Confirm only the selected live assessment appears publicly.
8. Switch the live assessment in Admin → Questionnaire and confirm only new starts change.
9. Confirm an older resume link still opens its original version.
10. Test questionnaire CMS copy/intake changes.
11. Complete the live assessment and verify dashboard, search, Lite Report, email and PDF.
12. Rotate the previously exposed SMTP2GO credential and send a real template test.
13. Configure and test Stripe test keys, Price ID and signed webhook for the live assessment.
14. Run `deploy/final-production-audit.sh` and retain its output.
15. Merge PR #5 only after Amit and client acceptance.

## Safe deployment rule

Every deployment must back up the database and Head–Heart Nginx site, build and test a new immutable release, repoint exact Nginx paths, verify health and questionnaire configuration, retain rollback, and keep `head-heart-v2-sync.timer` disabled. New Git commits never alter production automatically.
