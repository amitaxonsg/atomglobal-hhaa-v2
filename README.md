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
| Burn-tested code checkpoint | `45ee1165bb8cc25ed10f9052abfc2fd8ecae4b9b` |
| CI | Production readiness checks run #458 passed frontend, PHP and full MySQL acceptance |
| Pull request | Draft PR #14; open and not merged |
| Sunil feedback | Issues #10, #11 and #12; issue #10 marked ready for Amit verification |
| Production CMS assets | Sunil’s exact photograph, official logo and supporting message applied and verified |
| Production code deployment | Not automatic; integration-branch code still requires Amit acceptance and an exact immutable deployment |
| Production timer | `head-heart-v2-sync.timer` disabled and inactive |
| Stripe | Not configured; checkout and signed-webhook acceptance remain pending |
| Email | Health check passing and SMTP2GO reported working; confirm rotated credential and retain one real selected-template delivery before final sign-off |

PR #5 and production-hardening PRs #6–#9 have already been merged into `main`. The historical branch `production-readiness-20260719` diverged from those changes and must not be deployed directly.

Backup refs created before reconciliation:

- `backup/production-readiness-before-reconcile-20260722`
- `backup/main-before-sunil-audit-20260722`

The safe branch `production-readiness-sunil-20260722` was created from current `main`, and Sunil’s changes were ported and burn-tested there.

Full audit details: `docs/SUNIL-FEEDBACK-AUDIT-20260722.md`.

## Burn test result

Production readiness checks run **#458** passed:

- frontend tests and Vite production build;
- deployment-script syntax checks;
- PHP lint and unit tests;
- clean MySQL migrations and seed;
- Lite/Full Report content audit;
- MySQL integration acceptance;
- questionnaire CMS, N/A, notes, autosave, secure resume, scoring and completion;
- guarded temporary participant submission with automatic cleanup;
- locked/unlocked/PDF report smoke test with automatic cleanup;
- critical table and seed verification.

The burn test proves code and test-database behaviour. Production visual review and live external-service acceptance remain separate gates.

## Production CMS asset checkpoint — completed

Sunil supplied:

- `niklas-liniger-cs58J0MvILA-unsplash.jpg`
- `Atom Global 2019.png`

The exact files were copied into persistent CMS media storage and registered in the production media library.

| Purpose | Production CMS URL |
|---|---|
| Opening photograph | `/media-uploads/sunil-opening-6af386d476e53f13429d.jpg` |
| Public logo | `/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png` |
| Email logo | `/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png` |
| Report logo | `/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png` |

The opening-stage supporting message is:

> Align with what you feel and what you reason with.

Verification completed:

- public photograph hash matched the uploaded source;
- public logo hash matched the uploaded source;
- Admin/CMS public configuration returned the new opening photograph;
- public, email and report branding settings returned the new logo;
- production API health returned `status: ok`;
- database, migrations, storage, email, GitHub feedback and cron checks were true;
- Stripe and Stripe webhook checks remained false;
- `head-heart-v2-sync.timer` remained disabled and inactive.

Rollback records:

- database backup: `/var/backups/head-heart-alignment/head_heart_prod-cms-assets-20260721T234142Z.sql.gz`
- CMS rollback data: `/var/backups/head-heart-alignment/cms-assets-before-20260721T234142Z.json`
- original uploaded files remain in `/root`.

These CMS assets live in persistent storage and survive later immutable code releases.

## Sunil feedback implemented in code

### Questionnaire presentation

- Retains the approved responsive desktop split layout and all four public assessment choices.
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

The locked API excludes Full Report content. The preview is derived from approved CMS content and remains redacted.

### Full Report

The unlocked Full Report supports:

- complete profile summary and full strengths list;
- challenges and development areas;
- Sharpest Edge and Growth Edge when present in CMS content;
- relationship/team interpretation;
- working, management or executive style;
- difficulty handling;
- leadership impact and how the participant comes across;
- culture-fit reflection;
- practical actions;
- all 10 areas with radar chart and score legend;
- CMS subscale interpretations;
- development roadmap;
- Head–Heart profile explanation;
- written reflections when included in the immutable snapshot;
- three-month retake reminder;
- methodology and sourcing;
- email-to-self, copy-as-text, print and PDF actions.

Full content remains locked until a verified Stripe webhook or authorised administrator action. Checkout remains disabled unless the Stripe secret, signed webhook secret and selected-track Price ID are configured.

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

## Email and secret safety

**Admin → Settings → Email** is authoritative for provider, sender, reply-to, public URL, branding links and encrypted credentials.

Safeguards:

- no participant sender fallback to Amit’s address;
- SMTP2GO receives the CMS sender identity;
- the browser receives masked secret descriptors only;
- empty or masked fields do not overwrite stored encrypted values;
- obviously truncated SMTP2GO keys are rejected;
- `backend/bin/email-settings-audit.php` reports non-secret status only.

A blank password or API-key field means **keep the stored credential**. Never paste live secrets into Git, issue comments, feedback text or deployment scripts.

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

## Remaining acceptance gate

Before marking the project live-ready:

1. Amit visually verifies the exact photograph, logo, supporting message, thinner typography, hidden participant topic titles and stronger progress bar.
2. Confirm the rotated SMTP2GO credential and retain one real selected-template delivery result.
3. Amit approves the proposed prices or explicitly keeps checkout disabled.
4. Configure and test Stripe secret, Price IDs and signed webhook before paid acceptance.
5. Amit/client approve the final detailed Full Report CMS wording.
6. Deploy the exact accepted integration-branch commit through `deploy/update-vps.sh`.
7. Run `deploy/full-production-audit.sh` and retain its output.
8. Run the guarded temporary submission and report-flow smoke tests.
9. Notify Sunil only after Amit confirms production.

## Safe deployment rule

Never deploy merely because a commit exists. Deploy only an exact CI-accepted commit using the backup-first immutable release script, verify the live release and APIs, retain rollback, and keep automatic Git deployment disabled.