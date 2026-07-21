# Head–Heart Alignment Digital Assessment Platform

Self-hosted React, PHP 8.3 and MariaDB assessment, reporting, payment, email, feedback and administration platform for Atom Global Consulting.

This is the independent V2 project. **Never reconnect it to the original repository or former Netlify project.**

## Current status — 22 July 2026

| Item | State |
|---|---|
| Public URL | `https://head-heart.atomglobal.com/` |
| Admin URL | `https://head-heart.atomglobal.com/admin` |
| VPS | `161.97.137.234` |
| Repository | `amitaxonsg/atomglobal-hhaa-v2` |
| Default branch | `main` |
| Sunil integration branch | `production-readiness-sunil-20260722` |
| Integration base | `main` commit `6ed8b18d5c5d7a818f973628a3ad5959d8912314` |
| Sunil feedback | Issues #10, #11 and #12 |
| Production deployment | Not automatic; latest integration remains pending CI, exact assets and Amit verification |
| Production timer | `head-heart-v2-sync.timer` must remain disabled and inactive |
| Stripe | Not configured; checkout and signed-webhook acceptance remain pending |
| Email | CMS sender hardening merged; exposed SMTP2GO credential still requires rotation before final acceptance |

PR #5 and the later production-hardening PRs #6–#9 have already been merged into `main`. The historical branch `production-readiness-20260719` diverged from those merged changes and must not be deployed directly.

Before integration, the following backup refs were created:

- `backup/production-readiness-before-reconcile-20260722`
- `backup/main-before-sunil-audit-20260722`

A conflicting reconciliation PR was closed without merge. The safe branch `production-readiness-sunil-20260722` was created from current `main`, and the Sunil-specific changes are being ported and tested there.

Full audit details are recorded in `docs/SUNIL-FEEDBACK-AUDIT-20260722.md`.

## Sunil feedback implemented in code

### Questionnaire presentation

- Keeps the approved responsive desktop split layout and all four public assessment choices.
- Keeps the left image, overlay, focal point, headline and supporting copy editable in **Admin → Content**.
- Keeps logo, colours, font stacks, text sizes, widths, gutter and component radii editable in **Admin → Branding**.
- Uses the approved fallback message: **“Align with what you feel and what you reason with.”**
- Applies thinner visual font weights without removing CMS font-family and size controls.
- Hides section names, section codes and section descriptions from participant question screens.
- Preserves section identity internally for questions, scoring, reporting and administration.
- Uses neutral participant wording: `Question group X of 10`.
- Shows a stronger accessible progress bar with percentage, answered count and autosave state.

### Lite Report

The locked Lite Report is restricted to:

- profile type;
- Head–Heart gauge and score out of 250;
- top two strengths;
- **Here’s what you’re missing** preview.

The locked API continues to exclude Full Report content. The preview is a redacted sales summary derived from approved CMS content.

### Full Report

The unlocked Full Report presentation supports:

- complete profile summary and full strengths list;
- challenges and development areas;
- Sharpest Edge and Growth Edge when present in CMS content;
- relationship/team interpretation;
- working, management or executive style;
- difficulty handling;
- leadership impact / how the participant comes across;
- culture fit reflection;
- five practical actions;
- all 10 areas with radar chart and score legend;
- CMS subscale interpretations;
- development roadmap;
- explanation of the Head–Heart profiles;
- written reflections when supplied in the immutable report snapshot;
- three-month retake reminder;
- methodology and sourcing;
- email-to-self, copy-as-text, print and PDF actions.

Full content remains locked until a verified Stripe webhook or an authorised administrator action. Checkout is disabled unless the Stripe secret, signed webhook secret and selected track Price ID are all configured.

## Client assets still pending

Sunil supplied these exact attachments by email:

- `niklas-liniger-cs58J0MvILA-unsplash.jpg`
- `Atom Global 2019.png`

The files were verified in Gmail, but the connector could not transfer the binary attachments into GitHub. They are **not yet committed**.

Before client sign-off, upload the exact files through **Admin → Content / Branding** or commit the exact binaries and update the CMS URLs. Do not substitute generated or visually similar assets.

## Proposed Full Report prices

Sunil proposed:

| Assessment | Proposed price |
|---|---:|
| Personal | USD 4.99 |
| New Joiner | USD 29 |
| Manager | USD 49 |
| Executive | USD 99 |

These values require Amit approval and matching Stripe Price IDs before checkout is enabled. The application must continue showing checkout as unavailable until all Stripe conditions pass.

## Questionnaire and CMS ownership

### Admin → Questionnaire

- public landing heading and introduction paragraphs;
- four track-card descriptions;
- track introduction and Lite/Full Report offer text;
- Heart and Head labels and explanations;
- participant context labels and options;
- conditional Department and Level fields;
- N/A availability;
- optional answer notes.

### Admin → Content

- stage image and optional mobile image;
- alt text;
- focal point;
- overlay strength;
- stage headline;
- supporting message.

### Admin → Branding

- public, email and report logos;
- questionnaire colours;
- heading and body font stacks;
- title, body, question, option, field and meta sizes;
- page, intake and question widths;
- desktop gutter;
- card and button/input radii.

### Admin → Assessments

- four versioned assessment tracks;
- 10 sections and 50 questions per track;
- five scored answer choices;
- profile score ranges;
- Lite and Full Report content;
- controlled cloning, publishing and archival.

## Assessment and historical-report protection

The administration interface and API enforce this warning:

> Do not replace an existing question with a different question. A material meaning change can invalidate comparisons and report interpretation.

Safeguards:

- published and archived versions are immutable;
- draft questions allow spelling, grammar and clarity corrections only;
- question identity, section, position, required/active state and scoring direction are locked;
- the administrator must confirm meaning and scoring intent are unchanged;
- before/after wording is recorded in the audit log;
- a materially different question requires a separately reviewed assessment version;
- existing sessions preserve question and scoring snapshots;
- completed assessments preserve answer, score and report snapshots.

## Production database baseline

The approved database baseline contains:

- Personal, New Joiner, Manager and Executive;
- exactly one published CMS version `2.0.0` per track;
- exactly 10 active sections and 50 active questions per version;
- five scored choices;
- contiguous report profile ranges covering scores 50–250;
- immutable report content snapshots for completed participants.

Never delete a version referenced by a participant session, score snapshot or generated report.

## Email and secret safety

**Admin → Settings → Email** is authoritative for provider, sender name, sender address, reply-to address, public URL, branding links and encrypted credentials.

Safeguards include:

- no participant sender fallback to Amit’s address;
- SMTP2GO receives the CMS sender identity;
- the browser receives only masked secret descriptors;
- empty or masked fields do not overwrite stored encrypted values;
- obviously truncated SMTP2GO keys are rejected;
- `backend/bin/email-settings-audit.php` reports only non-secret status.

A blank password or API-key field means **keep the stored credential**.

## Report security and smoke testing

The production report service maintains separate immutable `free_report_json` and `paid_report_json` snapshots.

- Locked responses expose Lite content and an approved upgrade preview only.
- Full Report content remains server-side until unlock.
- Stripe readiness is returned as a redacted boolean/status.
- The participant buy button remains disabled while Stripe is incomplete.
- Branded Full Report PDF generation is covered by a guarded smoke test.

`backend/bin/production-report-flow-smoke-test.php` creates a temporary participant, completes 50 answers, verifies locked privacy, authorises a test unlock, verifies Full Report content and PDF generation, and removes all temporary participant, report, email and PDF records.

## Automated verification

The production-readiness workflow must pass on the Sunil integration branch before deployment. It covers:

- shell-script syntax;
- Node 22 and dependency installation;
- frontend tests and production build;
- questionnaire reference hashes;
- all four public assessment choices;
- hidden participant topic labels and accessible progress;
- Sunil Lite/Full Report contracts;
- PHP lint and unit tests;
- clean MySQL migrations and seed;
- report-content audit;
- full integration acceptance;
- questionnaire N/A, notes, autosave, resume, scoring and completion;
- guarded temporary submission and automatic cleanup;
- locked/unlocked/PDF report smoke test and cleanup;
- email secret protection and sender identity.

A passing CI run verifies code and test-database behaviour. It does not prove that Sunil’s exact image/logo are in production or that Stripe and live email delivery are complete.

## Deployment routing and rollback

Production Nginx is pinned to exact immutable release paths. Run deployments only from the Git checkout:

```text
/srv/head-heart.atomglobal.com/source
```

Runtime layout:

```text
/var/www/head-heart.atomglobal.com/releases
/var/www/head-heart.atomglobal.com/current
/etc/head-heart-alignment/app.env
/var/lib/head-heart-alignment
/var/backups/head-heart-alignment
```

`deploy/update-vps.sh` must:

- back up MariaDB;
- back up the Head–Heart Nginx site file;
- build and test a new immutable release;
- update the exact Head–Heart frontend and backend Nginx paths;
- validate Nginx before reload;
- verify `/api/health` and questionnaire configuration;
- restore Nginx, symlink and markers automatically on failure;
- leave unrelated Nginx sites untouched;
- keep `head-heart-v2-sync.timer` disabled.

Repeated `gatorinbox.com` conflicting-server-name warnings are unrelated. They do not fail `nginx -t`, and this project must not alter those configurations.

## Deployment acceptance gate

Do not deploy the Sunil integration until:

1. the integration pull request passes all CI checks;
2. the exact client image and logo are available in CMS or Git;
3. Amit reviews the Lite and Full Report presentation;
4. proposed prices are either approved or explicitly left checkout-disabled;
5. the exposed SMTP2GO credential is rotated;
6. the exact accepted commit is recorded;
7. production backups and rollback remain active.

After deployment:

1. verify desktop and mobile branding;
2. verify all four assessment cards;
3. verify topic titles remain hidden only from participants;
4. complete a guarded temporary submission;
5. verify Lite Report and locked-data privacy;
6. verify authorised Full Report unlock and PDF;
7. verify Admin participant and report visibility;
8. run `deploy/full-production-audit.sh` and retain its output;
9. notify Sunil only after Amit confirms the production result.

## Safe deployment rule

Never deploy merely because a commit exists. Deploy only an exact CI-accepted commit using the backup-first immutable release script, verify the live release and APIs, retain rollback, and keep automatic Git deployment disabled.
