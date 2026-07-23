# Sunil feedback integration audit — 22 July 2026

## Scope reviewed

- Latest email from Sunil Setpaul dated 21 July 2026.
- GitHub issues #10, #11 and #12.
- Current `main` production-hardening work through commit `6ed8b18d5c5d7a818f973628a3ad5959d8912314`.
- Diverged historical branch `production-readiness-20260719` through commit `e0806b4260328965b9ee7f6c95d6b96ead8b017b`.
- Safe integration branch `production-readiness-sunil-20260722`.
- Production CMS asset application and verification completed 22 July 2026.
- Current deployment scripts, full audit and report smoke tests.

## Repository safety

The historical branch and `main` diverged after PRs #6–#9 were merged. A direct reconciliation PR was closed without merge because it contained conflicts.

Backup refs created before integration:

- `backup/production-readiness-before-reconcile-20260722`
- `backup/main-before-sunil-audit-20260722`

Safe integration branch:

- `production-readiness-sunil-20260722`
- based on current `main`, not the obsolete production-readiness foundation.

Burn-tested checkpoint:

- commit `45ee1165bb8cc25ed10f9052abfc2fd8ecae4b9b`
- Production readiness checks run #458 passed.

Production code has not been deployed automatically. `head-heart-v2-sync.timer` remains disabled and inactive.

## Implemented on the integration branch

### Questionnaire presentation

- Retains all four public assessment choices and the CMS-driven left-image branded layout from `main`.
- Hides section names, codes and descriptive blurbs from participant question pages.
- Preserves section identity internally for question selection, scoring, reporting and administration.
- Replaces participant wording with neutral `Question group X of 10` language.
- Adds an accessible progress bar with percentage, answered count and autosave state.
- Makes the progress track thicker and more visible.
- Applies lighter visual font weights without changing CMS font-family and size controls.
- Uses Sunil's approved fallback message: `Align with what you feel and what you reason with.`

### Lite Report

The locked report is restricted to:

- profile type;
- Head–Heart gauge and score out of 250;
- top two strengths;
- `Here’s what you’re missing` preview derived from approved CMS Full Report content.

Paid content remains absent from the locked API response. Checkout remains disabled unless Stripe secret, signed webhook secret and the selected-track Price ID are all configured.

### Full Report

The unlocked report supports:

- complete profile summary and strength list;
- challenges and development areas;
- Sharpest Edge and Growth Edge fields when present in CMS content;
- relationship/team, working style, difficulty, leadership and culture sections;
- practical actions;
- full 10-area radar and score breakdown;
- CMS subscale interpretations;
- development roadmap;
- profile-spectrum explanation;
- written reflections when supplied in the immutable report snapshot;
- three-month retake reminder;
- methodology and sourcing content;
- email-to-self, copy as text, print and PDF actions.

The production report service from `main` is retained, including immutable Lite/Full snapshots, safe upgrade previews, locked-data privacy and Stripe-readiness checks.

## CMS ownership audit

Existing administration coverage is retained:

- **Admin → Content** controls left-panel image, alt text, focal point, overlay, headline and supporting message.
- **Admin → Branding** controls public/email/report logo, colours, font stacks, text sizes, widths, gutter and radii.
- **Admin → Questionnaire** controls landing, track introductions and participant intake.
- **Admin → Assessments** controls versioned questions, scoring and report content.

Published and archived assessment versions remain immutable. Draft question editing remains limited to spelling, grammar and clarity corrections that do not change meaning or scoring intent.

## Production CMS assets — completed and verified

Sunil supplied:

- `niklas-liniger-cs58J0MvILA-unsplash.jpg`
- `Atom Global 2019.png`

The exact files were copied from `/root` to persistent CMS media storage and registered in `media_library`.

Production URLs:

- opening photograph: `/media-uploads/sunil-opening-6af386d476e53f13429d.jpg`
- public logo: `/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png`
- email logo: `/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png`
- report logo: `/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png`

Opening-stage supporting message:

`Align with what you feel and what you reason with.`

Verification passed:

- public photograph hash matched the source upload;
- public logo hash matched the source upload;
- public CMS configuration returned the opening photograph;
- public, email and report branding returned the official logo;
- production health returned `status: ok` at `2026-07-21T23:41:43+00:00`;
- database, migrations, storage, email, GitHub feedback and cron were true;
- Stripe and Stripe webhook were false;
- `head-heart-v2-sync.timer` was disabled and inactive.

Rollback records:

- MariaDB backup: `/var/backups/head-heart-alignment/head_heart_prod-cms-assets-20260721T234142Z.sql.gz`
- CMS rollback JSON: `/var/backups/head-heart-alignment/cms-assets-before-20260721T234142Z.json`
- original files remain in `/root`.

Issue #10 remains open and is marked ready for Amit verification rather than closed as live.

## External items still pending

- Amit approval of the proposed prices: USD 4.99 / 29 / 49 / 99.
- Stripe test secret, four Price IDs and signed webhook secret.
- Real checkout, webhook, unlock and refund test.
- Confirmation that the previously exposed SMTP2GO credential has been rotated.
- One retained real selected-template delivery result after rotation; email health currently passes and SMTP2GO was reported working.
- Client approval of detailed Full Report copy, especially methodology, Sharpest/Growth Edge wording and reflection presentation.
- Amit visual verification of the exact photograph, logo, thinner typography, hidden topic titles and progress display.

## Deployment gate

The client-asset prerequisite is complete. Do not mark the full branch live-ready until:

1. Amit verifies the visual presentation and report flow;
2. the exact integration-branch deployment commit is accepted;
3. production database and Nginx backups are created by `deploy/update-vps.sh`;
4. `head-heart-v2-sync.timer` remains disabled;
5. the immutable release and public APIs pass verification;
6. `deploy/full-production-audit.sh` passes;
7. guarded temporary submission and report-flow smoke tests pass;
8. paid checkout remains disabled until Stripe acceptance is complete.

Notify Sunil only after Amit confirms production.