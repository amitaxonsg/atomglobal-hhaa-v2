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
| Verified branch commit | `a8fa684cad2d13f76da6662e90f17b258a27f788` |
| Verified CI | Production readiness checks run #380 passed frontend, PHP, database and deployment-script syntax checks |
| Public mode | React frontend with PHP 8.3 and MariaDB production API |
| Last deployment marker | `7568577dc195e4e2e319cda6edf3be4c5822768d` |
| Last created release | `/var/www/head-heart.atomglobal.com/releases/20260719224421-7568577dc195` |
| Production health | Database, migrations, storage, email, GitHub feedback and cron healthy |
| Stripe | Not configured; checkout and signed-webhook acceptance remain pending |
| Owner login | Confirmed for `amit@axon.com.sg` |
| Deployment timer | `head-heart-v2-sync.timer` disabled and inactive |
| Application cron | Installed and healthy |

### Important routing finding after the 20 July deployment

The release directory and deployment marker switched successfully to commit `7568577dc195e4e2e319cda6edf3be4c5822768d`, but the public site did not show the new questionnaire and `/api/public/assessment-experience` returned HTTP 404.

The production Nginx site intentionally points to an exact immutable release path rather than the `current` symlink. The former deployment script changed `current` and the marker but did not repoint that exact Nginx path, so Nginx continued serving the previous release. This explains both symptoms:

- the browser still displayed the former split-screen questionnaire;
- the newly added public questionnaire CMS endpoint was unavailable even though the new release existed on disk.

Commit `a8fa684cad2d13f76da6662e90f17b258a27f788` corrects `deploy/update-vps.sh` to:

- back up only the Head–Heart Nginx site file;
- build and test a new immutable release;
- confirm that the latest frontend strings exist in the production bundle;
- atomically replace the old exact release path in the Head–Heart site configuration;
- validate Nginx before switching;
- reload PHP-FPM and Nginx;
- require `/api/health` and `/api/public/assessment-experience` to pass before reporting success;
- restore the prior Nginx file, release symlink and marker automatically on failure.

CI also executes `bash -n` against the production deployment and final-audit scripts so shell syntax errors block release approval.

The repeated `gatorinbox.com` conflicting-server-name messages are warnings from unrelated Nginx site definitions. They did not fail `nginx -t` and this project does not modify those sites.

## Latest approved questionnaire and CMS

The branch rebuilds the participant questionnaire from the latest approved standalone `index.html` / Netlify reference rather than the former split-screen V2 interface:

- centred cream layout with Atom Global branding;
- approved heading and two introductory paragraphs;
- four direct-select cards: Personal, New Joiner, Manager and Executive;
- track introduction explaining Heart and Head;
- name, age range, optional gender, email and five track-specific context questions;
- conditional Department and Level fields for configured work roles;
- 10 sections and exactly 50 questions per track;
- five scored answer choices;
- optional `N/A — doesn’t apply / can’t answer`, excluded from scoring;
- optional notes beneath every question;
- autosave, secure resume and immutable assessment/answer snapshots;
- instant Lite Report and protected Full Report;
- **Powered by Axon 1Pro** linked to `https://axon.com.sg/`.

The former public split-screen stage-image layout is no longer rendered by the latest frontend bundle.

### Admin → Questionnaire

The Questionnaire workspace controls:

- public landing heading and both introduction paragraphs;
- track-card title prefix and logo-header visibility;
- description shown under every track card;
- track introduction and Lite/Full Report offer copy;
- Heart and Head labels and explanations;
- all participant context labels and option lists;
- role triggers for conditional Department and Level fields;
- Department and Level labels and option lists;
- N/A availability and optional answer notes.

Question text remains protected under **Admin → Assessments**. Published and archived versions are immutable. A draft may receive spelling, grammar or clarity corrections only; stable identity, section, position, scoring direction and participant/report history remain protected and audited.

Reference integrity is covered by `tests/js/index-reference.test.mjs` and `tests/js/latest-questionnaire-flow.test.mjs`. Landing CMS, track CMS, conditional intake, N/A persistence, notes, resume, scoring and completion are covered by `tests/php/questionnaire-process.php`.

## Feedback and client collaboration

The secure administration portal includes:

- **Feedback** and **Help** sections;
- feedback type, module, priority, title, details, expected outcome, page and optional attachment link;
- searchable states: `New`, `Clarification requested`, `Accepted`, `In progress`, `Ready for review`, `Done` and `Declined`;
- permanent timeline and administrator audit entries;
- acknowledgement email to `sunil.setpaul@atomglobal.com`;
- internal notification to `amit@axon.com.sg`;
- clarification email instructing Sunil to reply with the feedback reference;
- completion email when an item is marked done;
- GitHub issue creation, comments and closure when the repository-scoped token is configured;
- global administration search including feedback records;
- protection against copying client email addresses, attachment URLs and private query tokens into public issues.

GitHub feedback synchronisation uses a fine-grained token restricted to `amitaxonsg/atomglobal-hhaa-v2` with **Issues: read and write**. Configure it only under **Admin → Feedback → GitHub and email routing**. Never place the token in Git, chat, feedback text or screenshots.

## Administration coverage completed in code

- Secure login, logout, CSRF, rate limiting, roles and permissions.
- Password reset request and confirmation.
- Dashboard trends, conversion funnel, track progress, revenue, email health and alerts.
- Global search across participants, reports, payments, email, affiliates and feedback.
- Participant search, filters, history, answers, N/A, notes, export and anonymisation.
- Questionnaire landing, track cards, introductions, participant intake and response-process CMS.
- Assessment cloning, protected draft correction and controlled publishing.
- Question timing and Lite/Full Report editors.
- Stage content, media and branding draft/publish workflow.
- Report unlock, lock, revoke, link rotation/resend and PDF regeneration.
- Payments and Stripe webhook records.
- Editable email templates, sandboxed preview, selected-template test, queue and retry.
- Affiliates, attribution, analytics, SEO/AEO/GEO, settings, administrators and audit logs.
- Feedback register, emails, GitHub Issues synchronisation and searchable help.

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

## Production verification

Automated checks cover:

- administrator authentication and permissions;
- four configured assessment tracks;
- exact reference questionnaire hashes;
- 50 questions and 10 sections per track;
- latest single-column participant layout;
- landing, track-card and participant-intake CMS;
- conditional company fields;
- scored answers, N/A exclusion and notes;
- secure creation, autosave and resume;
- completion, scoring, Lite Report and Full Report protection;
- PDF generation and secure access;
- branding draft/publish;
- email template editing and testing;
- dashboard graphs and global search;
- feedback creation, timeline, search, completion and client emails;
- immutable Nginx release switching and rollback;
- audit history.

After deployment and after a planned reboot, run:

```bash
cd /srv/head-heart.atomglobal.com/source
bash deploy/final-production-audit.sh
```

## Remaining operational acceptance

Before final production sign-off:

1. Deploy verified commit `a8fa684cad2d13f76da6662e90f17b258a27f788` using the corrected immutable Nginx-switching script.
2. Confirm `/api/public/assessment-experience` returns HTTP 200 with `landing` and four tracks.
3. Confirm the public page shows the latest centred card layout rather than the former split screen.
4. Test all four tracks end-to-end, including N/A, notes, autosave and resume.
5. Make one harmless Admin → Questionnaire copy change and confirm it appears publicly.
6. Complete one participant and verify the dashboard, participant search, graphs, Lite Report and email.
7. Rotate the previously exposed SMTP2GO credential and send a real selected-template test.
8. Submit one harmless feedback item and verify GitHub issue creation plus acknowledgement/internal emails.
9. Move that feedback through clarification, in progress, ready for review and done.
10. Configure Stripe test credentials, four Price IDs and the signed webhook secret.
11. Complete one Stripe test purchase and refund.
12. Review Full Reports and PDFs for all four tracks.
13. Run `deploy/final-production-audit.sh` and retain its output.
14. Merge PR #5 only after Amit and client acceptance.

## Safe deployment rule

Every deployment must back up the database and the Head–Heart Nginx site, build and test a new immutable release, repoint the exact Nginx frontend/backend paths atomically, validate `/api/health` and the public questionnaire CMS endpoint, retain rollback, and keep `head-heart-v2-sync.timer` disabled. New Git commits never alter production automatically.
