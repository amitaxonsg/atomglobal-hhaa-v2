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
| Burn-tested feature checkpoint | `761854b21519a38c6f5263274f4a38f8b323fe48` |
| CI | Production readiness checks run #456 passed frontend, PHP and full MySQL acceptance |
| Pull request | Draft PR #14; open and not merged |
| Sunil feedback | Issues #10, #11 and #12 |
| Production deployment | Not automatic; exact image/logo and Amit verification remain pending |
| Production timer | `head-heart-v2-sync.timer` must remain disabled and inactive |
| Stripe | Not configured; checkout and signed-webhook acceptance remain pending |
| Email | CMS sender hardening merged; previously exposed SMTP2GO credential still requires rotation |

PR #5 and production-hardening PRs #6–#9 have already been merged into `main`. The historical branch `production-readiness-20260719` diverged from those changes and must not be deployed directly.

Backup refs created before reconciliation:

- `backup/production-readiness-before-reconcile-20260722`
- `backup/main-before-sunil-audit-20260722`

A conflicting reconciliation PR was closed without merge. The safe branch `production-readiness-sunil-20260722` was created from current `main`, and Sunil’s changes were ported manually and burn-tested there.

Full audit details: `docs/SUNIL-FEEDBACK-AUDIT-20260722.md`.

## Burn test result

Production readiness checks run **#456** passed all jobs:

- frontend tests;
- Vite production build;
- deployment-script syntax checks;
- PHP lint and unit tests;
- clean MySQL migrations and seed;
- Lite/Full Report content audit;
- MySQL integration acceptance;
- questionnaire CMS, N/A, notes, autosave, secure resume, scoring and completion;
- temporary participant submission with automatic cleanup;
- locked/unlocked/PDF report smoke test with automatic cleanup;
- critical table and seed verification.

The burn test proves code and test-database behaviour. It does not prove that Sunil’s exact image/logo are present in production, that real email delivery has passed after credential rotation, or that Stripe is configured.

## Sunil feedback implemented

### Questionnaire presentation

- Keeps the approved responsive desktop split layout and all four public assessment choices.
- Keeps the left image, overlay, focal point, headline and supporting copy editable in **Admin → Content**.
- Keeps logo, colours, font stacks, text sizes, widths, gutter and radii editable in **Admin → Branding**.
- Uses the approved fallback message: **“Align with what you feel and what you reason with.”**
- Applies thinner visual font weights without removing CMS controls.
- Hides section names, section codes and descriptions from participant question screens.
- Preserves section identity internally for question selection, scoring, reports and administration.
- Uses neutral participant wording: `Question group X of 10`.
- Shows a stronger accessible progress bar with percentage, answered count and autosave state.

### Lite Report

The locked Lite Report is restricted to:

- profile type;
- Head–Heart gauge and score out of 250;
- top two strengths;
- **Here’s what you’re missing** preview.

The locked API continues to exclude Full Report content. The preview is derived from approved CMS content and remains redacted.

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
- practical actions;
- all 10 areas with radar chart and score legend;
- CMS subscale interpretations;
- development roadmap;
- Head–Heart profile explanation;
- written reflections when included in the immutable snapshot;
- three-month retake reminder;
- methodology and sourcing;
- email-to-self, copy-as-text, print and PDF actions.

Full content remains locked until a verified Stripe webhook or authorised administrator action. Checkout remains disabled unless the Stripe secret, signed webhook secret and selected track Price ID are configured.

## Client assets still pending

Sunil supplied these exact attachments:

- `niklas-liniger-cs58J0MvILA-unsplash.jpg`
- `Atom Global 2019.png`

The attachments were verified in Gmail, but the connector could not transfer their binary bytes into GitHub. They are **not committed**.

Before client sign-off, upload the exact files through **Admin → Content / Branding** or commit the exact binaries and update the CMS URLs. Do not substitute generated or visually similar assets.

## Proposed Full Report prices

| Assessment | Proposed price |
|---|---:|
| Personal | USD 4.99 |
| New Joiner | USD 29 |
| Manager | USD 49 |
| Executive | USD 99 |

These require Amit approval and matching Stripe Price IDs. The application must keep checkout unavailable until all Stripe checks pass.

## CMS ownership

### Admin → Questionnaire

- landing heading and introduction paragraphs;
- four track-card descriptions;
- track introduction and Lite/Full Report offer text;
- Heart and Head labels and explanations;
- participant context labels and options;
- conditional Department and Level fields;
- N/A and optional answer-note controls.

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

- four versioned tracks;
- 10 sections and 50 questions per track;
- five scored choices;
- profile score ranges;
- Lite and Full Report content;
- controlled cloning, publishing and archival.

## Historical-report protection

> Do not replace an existing question with a different question. A material meaning change can invalidate comparisons and report interpretation.

Safeguards:

- published and archived versions are immutable;
- draft questions allow spelling, grammar and clarity corrections only;
- identity, section, position, required/active state and scoring direction are locked;
- the administrator must confirm meaning and scoring intent are unchanged;
- before/after wording is audited;
- a materially different question requires a separately reviewed assessment version;
- existing sessions preserve question and scoring snapshots;
- completed assessments preserve answer, score and report snapshots.

## Production database baseline

The approved baseline contains:

- Personal, New Joiner, Manager and Executive;
- one published CMS version `2.0.0` per track;
- 10 active sections and 50 active questions per version;
- five scored choices;
- contiguous report profile ranges covering 50–250;
- immutable report snapshots for completed participants.

Never delete a version referenced by a participant session, score snapshot or generated report.

## Email and secret safety

**Admin → Settings → Email** is authoritative for provider, sender, reply-to, public URL, branding links and encrypted credentials.

Safeguards:

- no participant sender fallback to Amit’s address;
- SMTP2GO receives the CMS sender identity;
- the browser receives masked secret descriptors only;
- empty or masked fields do not overwrite stored encrypted values;
- obviously truncated SMTP2GO keys are rejected;
- `backend/bin/email-settings-audit.php` reports non-secret status only.

A blank password or API-key field means **keep the stored credential**.

## Full production audit and submission smoke test

The production report service stores separate immutable `free_report_json` and `paid_report_json` snapshots.

- Locked responses expose Lite content and an approved upgrade preview only.
- Full content remains server-side until unlock.
- Stripe readiness is returned as a redacted status.
- The participant buy button stays disabled while Stripe is incomplete.
- Branded PDF generation is covered by the guarded smoke test.

`backend/bin/production-submission-smoke-test.php` and `backend/bin/production-report-flow-smoke-test.php` create temporary records, verify the complete submission/report chain and delete all temporary participant, answer, score, report, email and PDF data.

## Deployment and rollback

Production Nginx is pinned to exact immutable release paths.

Source checkout:

```text
/srv/head-heart.atomglobal.com/source
```

Runtime:

```text
/var/www/head-heart.atomglobal.com/releases
/var/www/head-heart.atomglobal.com/current
/etc/head-heart-alignment/app.env
/var/lib/head-heart-alignment
/var/backups/head-heart-alignment
```

`deploy/update-vps.sh` must:

- back up MariaDB;
- back up the Head–Heart Nginx site;
- build and test a new immutable release;
- repoint the exact Head–Heart frontend/backend Nginx paths;
- validate Nginx before reload;
- verify health and questionnaire APIs;
- restore Nginx, symlink and markers on failure;
- leave unrelated Nginx sites untouched;
- keep `head-heart-v2-sync.timer` disabled.

Repeated `gatorinbox.com` conflicting-server-name warnings are unrelated and must not be modified by this project.

## Deployment acceptance gate

Do not deploy until:

1. the exact client image and logo are available in CMS or Git;
2. Amit reviews the Lite and Full Report presentation;
3. prices are approved or explicitly left checkout-disabled;
4. the SMTP2GO credential is rotated;
5. the exact accepted deployment commit is recorded;
6. production backup and rollback remain active.

After deployment:

1. verify desktop/mobile branding and all four cards;
2. verify topic labels remain hidden only from participants;
3. run a guarded temporary submission;
4. verify Lite Report and locked privacy;
5. verify authorised Full Report unlock and PDF;
6. verify Admin participant/report visibility;
7. run `deploy/full-production-audit.sh` and retain its output;
8. notify Sunil only after Amit confirms production.

## Safe deployment rule

Never deploy merely because a commit exists. Deploy only an exact CI-accepted commit using the backup-first immutable release script, verify the live release and APIs, retain rollback, and keep automatic Git deployment disabled.
