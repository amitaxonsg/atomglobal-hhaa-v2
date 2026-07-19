# Head–Heart Alignment V2

Full editable React/Vite source for Atom Global Consulting’s Head–Heart Alignment assessment.

## Important separation

This repository is the **V2 development and production source**:

- GitHub V2 repository: `amitaxonsg/atomglobal-hhaa-v2`
- Netlify V2 project: `atomglobal-hhaa-v2`
- Live production URL: `https://head-heart.atomglobal.com/`
- VPS: `161.97.137.234`

The client’s original Netlify project and original repository `amitaxonsg/atomglobal-hhaa` are preserved separately and must not be modified as part of V2 work.

Do not attach `head-heart.atomglobal.com` to Netlify. The custom domain is served only by the VPS.

## Current architecture

```text
Netlify V2 AI development and preview
                ↓
Netlify creates an agent branch and pull request
                ↓
GitHub V2 checks the Netlify deploy preview
                ↓
Eligible Netlify Coding PR is automatically squash-merged
                ↓
GitHub V2 main is the approved source of truth
                ↓
VPS checks GitHub main every 5 minutes
                ↓
VPS runs npm ci and npm run build with Node 22
                ↓
VPS publishes a versioned release and switches the current symlink
                ↓
Nginx serves https://head-heart.atomglobal.com/
```

Netlify is a temporary development and preview tool. It is **not required at runtime**. Website visitors load the application, JavaScript, CSS, images, manifest and service worker only from the VPS.

## Automatic merge protection

The workflow at:

```text
.github/workflows/auto-merge-netlify.yml
```

only auto-merges a pull request when all of these conditions are true:

- PR author is `netlify-coding[bot]`
- Base branch is `main`
- PR branch belongs to this same V2 repository
- Branch name starts with `agent-`
- PR is not a draft
- A status beginning with `netlify/atomglobal-hhaa-v2/` exists
- All matching V2 Netlify statuses are successful

Other pull requests are not automatically merged by this workflow.

## VPS production setup

### Permanent editable source

```text
/srv/head-heart.atomglobal.com/source
```

This directory contains the complete React/Vite project pulled from GitHub V2 `main`.

### Versioned production releases

```text
/var/www/head-heart.atomglobal.com/releases
```

Each successful deployment creates a new timestamped release directory.

### Active live release

```text
/var/www/head-heart.atomglobal.com/current
```

`current` is a symlink to the active release. Nginx serves this path.

### Deployment service

```text
Service: head-heart-v2-sync.service
Timer:   head-heart-v2-sync.timer
Script:  /usr/local/sbin/head-heart-v2-sync
```

The timer checks GitHub V2 `main` approximately every five minutes.

### Node runtime

Head–Heart uses an isolated supported Node 22 installation:

```text
/opt/node-v22/bin/node
/opt/node-v22/bin/npm
```

The deployment service PATH is configured to use this Node installation. The VPS system Node is not replaced.

Current tested runtime during initial V2 deployment:

```text
Node: v22.23.1
npm:  10.9.8
```

Vite 7 requires Node `20.19+` or `22.12+`.

### Nginx and SSL

```text
Domain: https://head-heart.atomglobal.com/
Nginx site: /etc/nginx/sites-available/head-heart.atomglobal.com.conf
SSL: Let’s Encrypt / Certbot
```

DNS points `head-heart.atomglobal.com` to `161.97.137.234`.

## Safe deployment behaviour

The VPS deployment script:

1. Fetches V2 `main` from GitHub.
2. Refuses to overwrite uncommitted VPS source changes.
3. Resets the VPS source to the approved V2 `main` commit.
4. Runs `npm ci --no-audit --no-fund`.
5. Runs `npm run build`.
6. Confirms the generated release contains `index.html`.
7. Publishes a new versioned release.
8. Switches the `current` symlink only after a successful build.
9. Keeps recent older releases for recovery.

A failed install or build does not replace the currently working live release.

## Development

Requirements:

- Node 22 recommended
- npm lockfile must be kept in Git

```bash
npm ci
npm run dev
```

## Production build

```bash
npm ci --no-audit --no-fund
npm run build
```

Vite writes production files to:

```text
dist/
```

Netlify uses `netlify.toml` to build with `npm run build`, publish `dist/`, and route browser refreshes to the React entry point.

## Project structure

```text
index.html
package.json
package-lock.json
vite.config.js
netlify.toml
src/
  main.jsx
  styles.css
  components/
    AssessmentApp.jsx
  data/
    assessmentData.js
public/
  _redirects
  atom-global-logo.png
  icon-192.png
  icon-512.png
  manifest.json
  report-texture.png
  sw.js
.github/
  workflows/
    auto-merge-netlify.yml
```

Key files:

- `src/components/AssessmentApp.jsx` — assessment screens, navigation, reports, charts and print presentation.
- `src/data/assessmentData.js` — tracks, questions, profiles, narratives, scoring helpers and configuration.
- `src/styles.css` — application styling and responsive/print rules.
- `public/` — branding, icons, PWA manifest, service worker and report texture.

The Personal, New Joiner, Manager and Executive tracks use the preserved scoring model from the original compiled application. Reverse-scored answers are normalized before total and subscale scores are calculated.

## Normal change workflow

1. Open the Netlify V2 project `atomglobal-hhaa-v2`.
2. Ask the Netlify Coding agent to make the change.
3. Review the Netlify preview carefully.
4. Create the pull request.
5. The GitHub auto-merge workflow waits for the V2 Netlify checks.
6. If the checks pass, the PR is squash-merged into `main` automatically.
7. The VPS deploys the new `main` commit within about five minutes.
8. Verify the live site.

A Netlify preview alone does not update production. The change must reach GitHub V2 `main`.

## VPS status and verification commands

### Check the timer

```bash
systemctl is-active head-heart-v2-sync.timer
systemctl list-timers head-heart-v2-sync.timer --no-pager
```

### View recent deployment logs

```bash
journalctl -u head-heart-v2-sync.service -n 100 --no-pager
```

### Trigger an immediate GitHub check and deployment

```bash
systemctl start head-heart-v2-sync.service
journalctl -u head-heart-v2-sync.service -n 100 --no-pager
```

### Compare VPS source and deployed commits

```bash
cd /srv/head-heart.atomglobal.com/source

git rev-parse HEAD
cat /var/www/head-heart.atomglobal.com/v2-deployed-commit.txt
```

Both values should match.

### Check the active release

```bash
readlink -f /var/www/head-heart.atomglobal.com/current
```

### Check HTTPS

```bash
curl -sS \
  -o /dev/null \
  -w 'HTTP %{http_code} | SSL %{ssl_verify_result}\n' \
  https://head-heart.atomglobal.com/
```

Expected result:

```text
HTTP 200 | SSL 0
```

### Confirm complete source is present on the VPS

```bash
cd /srv/head-heart.atomglobal.com/source

test -f package.json && \
test -f package-lock.json && \
test -d src && \
test -d public && \
echo "Complete editable source is present"
```

## Important operating rules

- Do not edit `/var/www/head-heart.atomglobal.com/current`; it is generated production output.
- Do not manually edit `/srv/head-heart.atomglobal.com/source` while `head-heart-v2-sync.timer` is active; the next GitHub deployment can overwrite local edits.
- Do not commit `node_modules/` or `dist/`.
- Do not commit private keys, passwords, API secret keys, `.env` files or client personal data.
- Keep the original client Netlify project and `amitaxonsg/atomglobal-hhaa` separate from V2.
- Review major scoring, question, payment or report changes before allowing them to reach production.

## Payment configuration still pending

The assessment data currently contains placeholder Stripe payment links such as:

```text
REPLACE_WITH_YOUR_PERSONAL_LINK
REPLACE_WITH_YOUR_NEWJOINER_LINK
REPLACE_WITH_YOUR_MANAGER_LINK
REPLACE_WITH_YOUR_EXECUTIVE_LINK
```

Replace these only with approved Stripe Payment Links. Never place Stripe secret keys in frontend source code.

## Cancelling Netlify later

Netlify can be cancelled after the final V2 application has been tested and these are confirmed:

- Complete source exists in GitHub V2.
- Complete source exists at `/srv/head-heart.atomglobal.com/source`.
- VPS `npm ci` and `npm run build` succeed.
- The live domain returns `HTTP 200 | SSL 0`.

Then:

1. Disable or delete the Netlify V2 project.
2. Remove Netlify Coding access from this repository.
3. Remove the Netlify deploy key if it is no longer required.
4. Remove or disable `.github/workflows/auto-merge-netlify.yml`, since Netlify will no longer create PRs.

The live site will continue running from the VPS.

### Continuing with GitHub after Netlify cancellation

Keep `head-heart-v2-sync.timer` active. Push approved source changes to GitHub V2 `main`; the VPS will continue to build and deploy them.

### Switching to direct VPS editing

Before editing source directly on the VPS, stop automatic GitHub syncing so local work is not overwritten:

```bash
systemctl disable --now head-heart-v2-sync.timer
```

Create and verify a separate VPS-only deployment procedure before making direct production edits.

## Security note for this public repository

This repository may be public during development. Do not add secrets, server credentials, private client information or production API keys. The repository can be changed to private after Netlify access is confirmed.