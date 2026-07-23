# Apache VPS correction — 22 July 2026

## Scope

This record corrects the earlier repository assumption that production was served by Nginx.

Production host:

- hostname: `german.axonserver.com`
- IP: `161.97.137.234`
- application: `https://head-heart.atomglobal.com/`

## Read-only evidence

The production diagnostic output showed:

- local HTTPS returned `server: Apache/2.4.58 (Ubuntu)`;
- the public home page returned HTTP 200 with the React `index.html`;
- both configured media URLs also returned HTTP 200, but with `content-type: text/html` and the same 1,429-byte SPA HTML body;
- `nginx.service` was inactive;
- an Nginx start attempt failed because ports 80 and 443 were already in use;
- Nginx syntax warnings for unrelated virtual hosts were non-fatal, but Nginx is not the production listener.

Observed broken URLs:

- `/media-uploads/sunil-opening-6af386d476e53f13429d.jpg`
- `/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png`

The CMS configuration and database references were already correct. Apache treated the missing frontend paths as SPA routes and returned `index.html`, which explains the broken logo alt text and empty left image panel in the browser.

## Safety decision

Do not start Nginx and do not edit unrelated site configuration.

The correction uses a project-scoped persistent-media link:

```text
/var/www/head-heart.atomglobal.com/current/frontend/media-uploads
    -> /var/lib/head-heart-alignment/media
```

This works immediately through Apache’s existing DocumentRoot and requires no global Apache/Nginx restart. The repair verifies that Apache follows the link and returns the exact image bytes; otherwise it rolls back.

## Git changes

Branch:

```text
production-readiness-sunil-20260722
```

Changes include:

1. `deploy/repair-public-media.sh`
   - detects the active web worker identity;
   - backs up existing files and link state;
   - restores Sunil’s exact `/root` photograph and logo;
   - applies private project storage permissions;
   - creates the frontend media link;
   - checks CMS paths;
   - requires `image/*` response headers;
   - compares both served files byte-for-byte with the originals;
   - does not start or reload Apache or Nginx;
   - restores files, metadata and link on failure.

2. `deploy/update-vps.sh`
   - dispatches by the web server that is actually active;
   - refuses to start a server automatically.

3. `deploy/update-vps-apache.sh`
   - backup-first immutable deployment for Apache;
   - resolves only the Head–Heart virtual host;
   - creates the persistent media link in every release;
   - rejects HTML fallback responses for media;
   - reloads Apache only if the Head–Heart virtual-host paths changed.

4. `deploy/update-vps-nginx.sh`
   - preserves the earlier Nginx deployment path for a genuinely Nginx-based server;
   - is not the production path for this VPS.

5. `deploy/full-production-audit.sh`
   - detects Apache or Nginx;
   - audits the corresponding project site configuration;
   - checks the persistent media link;
   - validates every configured CMS media URL as a real image.

6. CI
   - syntax-checks the dispatcher, Apache deployment, Nginx deployment, media repair and audit scripts.

## Immediate production repair

After pulling the exact accepted branch head:

```bash
cd /srv/head-heart.atomglobal.com/source
git fetch origin
git checkout production-readiness-sunil-20260722
git pull --ff-only origin production-readiness-sunil-20260722
bash deploy/repair-public-media.sh
```

Required result:

```text
HEAD–HEART PUBLIC MEDIA REPAIR PASSED
No Apache or Nginx service was started or reloaded.
CMS references and exact public file delivery verified.
```

Then verify in a fresh browser session:

- the exact Sunil photograph fills the left panel;
- the official Atom Global logo renders at the top-left;
- no broken-image alt text appears;
- the supporting message remains `Align with what you feel and what you reason with.`

## Deployment rules retained

- `head-heart-v2-sync.timer` remains disabled and inactive.
- No automatic Git deployment.
- No merge or live declaration until Amit verifies production visually.
- Stripe and signed-webhook work remain separate pending acceptance items.
- Do not change unrelated Apache or Nginx virtual hosts.
