# Head–Heart Alignment Digital Assessment Platform

Self-hosted React, PHP and MariaDB assessment, reporting, payment, email, feedback and administration platform for Atom Global Consulting.

This is the independent V2 project. **Never reconnect it to the original repository or former Netlify project.**

## Current status — 22 July 2026

| Item | State |
|---|---|
| Public URL | `https://head-heart.atomglobal.com/` |
| Admin URL | `https://head-heart.atomglobal.com/admin` |
| VPS | `german.axonserver.com` — `161.97.137.234` |
| Active public web server | Apache 2.4.58 on Ubuntu |
| Nginx on this VPS | Installed but inactive; do not start it because Apache already owns ports 80/443 |
| Repository | `amitaxonsg/atomglobal-hhaa-v2` |
| Default branch | `main` |
| Safe integration branch | `production-readiness-sunil-20260722` |
| Integration base | `main` commit `6ed8b18d5c5d7a818f973628a3ad5959d8912314` |
| Pull request | Draft PR #14; open, unmerged and not automatically deployed |
| Automatic Git timer | `head-heart-v2-sync.timer` must remain disabled and inactive |
| Stripe | Not configured; checkout and signed-webhook acceptance remain pending |

PRs #5–#9 are already merged into `main`. The historical branch `production-readiness-20260719` diverged from that foundation and must not be deployed directly.

Backup refs retained before Sunil integration:

- `backup/production-readiness-before-reconcile-20260722`
- `backup/main-before-sunil-audit-20260722`

## Important Apache correction

Read-only production diagnostics on 22 July confirmed:

- local HTTPS is served by `Apache/2.4.58 (Ubuntu)`;
- `nginx.service` is inactive because Apache already holds ports 80 and 443;
- attempts to start Nginx fail with `Address already in use`;
- the home page returns the real React `index.html`;
- the two `/media-uploads/` requests incorrectly return the same HTML file instead of image bytes.

Therefore:

- never use the Nginx-only deployment path on this VPS;
- never start or force-reload Nginx;
- do not modify unrelated Apache sites;
- use the web-server-aware dispatcher `deploy/update-vps.sh` for future accepted releases;
- use `deploy/repair-public-media.sh` for the current image/logo repair.

Detailed evidence and the correction design are recorded in `docs/APACHE-VPS-CORRECTION-20260722.md`.

## Sunil feedback implemented in code

### Questionnaire presentation

- Keeps the CMS-driven left-image layout and all four public choices: Personal, New Joiner, Manager and Executive.
- Keeps image, overlay, focal point, headline and supporting copy editable in **Admin → Content**.
- Keeps logos, colours, font stacks, text sizes, widths, gutter and radii editable in **Admin → Branding**.
- Uses the approved message: **“Align with what you feel and what you reason with.”**
- Applies thinner visual font weights without removing CMS controls.
- Hides section names, codes and descriptions from participant question screens.
- Preserves section identity internally for question selection, scoring, reports and administration.
- Uses neutral `Question group X of 10` wording.
- Shows stronger accessible progress with percentage, answered count and autosave state.

The four assessment cards on the opening page remain visible. Sunil’s request to hide titles applies to the internal question-group/topic titles, not to Personal, New Joiner, Manager and Executive.

### Lite Report

The locked Lite Report is restricted to:

- profile type;
- Head–Heart gauge and score out of 250;
- top two strengths;
- **Here’s what you’re missing** preview.

The locked API excludes Full Report content. Checkout remains unavailable while Stripe is incomplete.

### Full Report

The unlocked Full Report supports:

- complete profile summary and strengths;
- challenges and development areas;
- Sharpest Edge and Growth Edge when present in CMS content;
- relationship/team interpretation;
- working, management or executive style;
- difficulty handling;
- leadership and culture impact;
- practical actions;
- all 10 areas with radar chart, score legend and CMS interpretations;
- development roadmap and profile explanation;
- written reflections when stored in the immutable report snapshot;
- three-month retake reminder;
- methodology and sourcing;
- email-to-self, copy, print and PDF actions.

## Sunil’s supplied CMS assets

Original files retained on the VPS:

- `/root/niklas-liniger-cs58J0MvILA-unsplash.jpg`
- `/root/Atom Global 2019.png`

CMS paths:

| Purpose | Public CMS path |
|---|---|
| Opening photograph | `/media-uploads/sunil-opening-6af386d476e53f13429d.jpg` |
| Public logo | `/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png` |
| Email logo | `/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png` |
| Report logo | `/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png` |

The CMS/database references are correct. Browser verification showed that public delivery was broken because Apache returned the SPA HTML fallback for both image URLs.

### Current media repair

From the clean safe-branch checkout:

```bash
cd /srv/head-heart.atomglobal.com/source
git fetch origin
git checkout production-readiness-sunil-20260722
git pull --ff-only origin production-readiness-sunil-20260722
bash deploy/repair-public-media.sh
```

The repair:

- backs up the existing two media files and frontend media link;
- restores the exact `/root` photograph and logo to persistent CMS storage;
- applies private Apache-readable permissions only to this project’s storage paths/files;
- creates `current/frontend/media-uploads` as a link to persistent CMS media;
- does not edit Apache or Nginx configuration;
- does not start or reload either web server;
- checks CMS references;
- requires real `image/*` responses;
- compares both public responses byte-for-byte with Sunil’s originals;
- rolls back files, metadata and the media link on failure.

Required success text:

```text
HEAD–HEART PUBLIC MEDIA REPAIR PASSED
No Apache or Nginx service was started or reloaded.
CMS references and exact public file delivery verified.
```

## CMS ownership

### Admin → Questionnaire

- landing heading and introduction;
- four track-card descriptions;
- track introduction and Lite/Full Report offer text;
- Heart and Head labels and explanations;
- participant context labels and options;
- conditional Department and Level fields;
- N/A and optional answer-note controls.

### Admin → Content

- stage image and optional mobile image;
- alt text and focal point;
- overlay strength;
- stage headline and supporting message.

### Admin → Branding

- public, email and report logos;
- questionnaire colours;
- heading/body fonts;
- text sizes, page widths and desktop gutter;
- card and control radii.

### Admin → Assessments

- four versioned tracks;
- 10 sections and 50 questions per track;
- five scored choices;
- profile ranges;
- Lite and Full Report content;
- controlled cloning, publishing and archival.

## Historical-report protection

> Do not replace an existing question with a different question. A material meaning change can invalidate comparisons and report interpretation.

Safeguards:

- published and archived versions are immutable;
- draft questions permit spelling, grammar and clarity corrections only;
- identity, section, position, required/active state and scoring direction remain locked;
- before/after wording is audited;
- materially different questions require a separately reviewed assessment version;
- sessions preserve question and scoring snapshots;
- completed assessments preserve answer, score and report snapshots.

## Email and secret safety

**Admin → Settings → Email** is authoritative for provider, sender, reply-to, public URL, branding links and encrypted credentials.

- No participant sender fallback to Amit’s address.
- SMTP2GO receives the CMS sender identity.
- Browsers receive masked secret descriptors only.
- Empty or masked fields do not overwrite stored encrypted values.
- Truncated SMTP2GO keys are rejected.
- `backend/bin/email-settings-audit.php` reports non-secret status only.

A blank password/API-key field means **keep the existing stored credential**. Never place live secrets in Git, issues, feedback, chat screenshots or deployment scripts.

## Deployment and rollback

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

### Web-server-aware dispatcher

Use only after an exact branch commit has passed CI and Amit has accepted it:

```bash
bash deploy/update-vps.sh
```

The dispatcher:

- selects `deploy/update-vps-apache.sh` when Apache/httpd is active;
- selects `deploy/update-vps-nginx.sh` only when Nginx is genuinely active;
- refuses to start a web server automatically when no supported service is active.

### Apache production path

`deploy/update-vps-apache.sh`:

- requires the existing active Apache service;
- resolves only the Head–Heart virtual-host file;
- backs up MariaDB and the project virtual host;
- builds and tests an immutable release;
- links persistent CMS media into the release frontend;
- uses the controlled `current` symlink or updates only recognised old Head–Heart release paths;
- validates Apache before any reload;
- reloads Apache only when its Head–Heart virtual-host path actually changed;
- verifies health, four public tracks and every configured CMS image;
- rejects an HTML/SPA fallback masquerading as a successful media response;
- rolls back the site file, current release and deployment markers on failure.

### Nginx compatibility path

`deploy/update-vps-nginx.sh` preserves the earlier Nginx deployment method for a genuinely Nginx-based host. It is **not** the production path for `german.axonserver.com`.

## Full production audit

`deploy/full-production-audit.sh` now detects the active server instead of assuming Nginx. It verifies:

- active Apache or Nginx service and configuration syntax;
- MariaDB, cron and available PHP runtime;
- immutable release and commit marker;
- frontend/backend build integrity;
- current Apache/Nginx release paths;
- persistent media link;
- public API, CMS and all four tracks;
- every configured `/media-uploads/` URL returns a real image, not HTML;
- database, assessment, report, email and orphan-record integrity;
- recent backup;
- disabled automatic Git deployment timer.

The guarded temporary submission/report tests remain optional and must clean up their own test data.

## Remaining acceptance gate

Before marking the project live-ready:

1. Run the corrected Apache-safe media repair and retain its full output.
2. Verify the exact photograph and logo in a fresh browser session.
3. Verify thinner typography, hidden participant topic titles and stronger progress display.
4. Confirm the rotated SMTP2GO credential and retain one real selected-template delivery result.
5. Approve the proposed prices or keep checkout disabled.
6. Configure and test Stripe secret, four Price IDs and signed webhook before paid acceptance.
7. Approve final detailed Full Report CMS wording.
8. Deploy only the exact accepted branch commit through `deploy/update-vps.sh`.
9. Run `deploy/full-production-audit.sh` and retain the output.
10. Notify Sunil only after Amit confirms production.

## Safe deployment rule

Never deploy merely because a commit exists. Deploy only an exact CI-accepted commit using the backup-first immutable process, verify the live release and public media, retain rollback, and keep automatic Git deployment disabled.
