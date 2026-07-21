# Sunil feedback integration audit — 22 July 2026

## Scope reviewed

- Latest email from Sunil Setpaul dated 21 July 2026.
- GitHub issues #10, #11 and #12.
- Current `main` production-hardening work through commit `6ed8b18d5c5d7a818f973628a3ad5959d8912314`.
- Diverged historical branch `production-readiness-20260719` through commit `e0806b4260328965b9ee7f6c95d6b96ead8b017b`.
- Current production documentation, deployment scripts, full audit and report smoke tests.

## Repository safety

The historical branch and `main` had diverged after PRs #6–#9 were merged. A direct reconciliation PR was intentionally closed without merge because it contained conflicts.

Backup refs created before integration:

- `backup/production-readiness-before-reconcile-20260722`
- `backup/main-before-sunil-audit-20260722`

Safe integration branch:

- `production-readiness-sunil-20260722`
- based on current `main`, not the obsolete production-readiness foundation.

Production has not been deployed automatically. `head-heart-v2-sync.timer` must remain disabled and inactive.

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

Paid content remains absent from the locked API response. Checkout remains disabled unless Stripe secret, signed webhook secret and the selected track Price ID are all configured.

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
- methodology/sourcing content;
- email-to-self, copy as text, print and PDF actions.

The production report service from `main` is retained, including immutable Lite/Full snapshots, safe upgrade previews, locked-data privacy and Stripe-readiness checks.

## CMS audit

Existing administration coverage is retained:

- **Admin → Content** controls left-panel image, alt text, focal point, overlay, headline and supporting message.
- **Admin → Branding** controls logo, colours, font stacks, text sizes, widths, gutter and radii.
- **Admin → Questionnaire** controls landing, track introductions and participant intake.
- **Admin → Assessments** controls versioned questions, scoring and report content.

Published and archived assessment versions remain immutable. Draft question editing remains limited to spelling, grammar and clarity corrections that do not change meaning or scoring intent.

## Client assets still pending

Sunil supplied:

- `niklas-liniger-cs58J0MvILA-unsplash.jpg`
- `Atom Global 2019.png`

The email attachments were verified, but the connector could not transfer the binary files into GitHub. They are therefore **not yet committed**. Before client sign-off, upload them through Admin → Content / Branding or commit the exact files to the repository and update the corresponding CMS URLs.

Do not substitute generated or visually similar assets.

## External items still pending

- Amit approval of the proposed prices: USD 4.99 / 29 / 49 / 99.
- Stripe test secret, four Price IDs and signed webhook secret.
- Real checkout, webhook, unlock and refund test.
- Rotation of the previously exposed SMTP2GO credential.
- One real selected-template delivery test after rotation.
- Client approval of the detailed Full Report copy, especially methodology, Sharpest/Growth Edge wording and reflection presentation.

## Deployment gate

Do not deploy until:

1. the integration pull request passes the full production-readiness workflow;
2. the exact client image and logo are available in CMS or Git;
3. Amit reviews the Lite/Full Report presentation;
4. `deploy/full-production-audit.sh` remains valid;
5. the production deployment command identifies the exact accepted commit;
6. production database and Nginx backups are created by `deploy/update-vps.sh`;
7. `head-heart-v2-sync.timer` remains disabled.

After deployment, run the read-only full production audit and the guarded temporary submission/report smoke tests before notifying Sunil that the changes are ready for client verification.
