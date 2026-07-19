# Head–Heart Alignment V2

This repository contains the complete V2 assessment platform for the Netlify project `atomglobal-hhaa-v2` and GitHub repository `amitaxonsg/atomglobal-hhaa-v2`. It is independent of the original project and repository.

## What is included

- A responsive React/Vite participant experience with the four preserved 50-question tracks, original reverse scoring, profiles and report narratives.
- A premium desktop split-screen design and a single-column mobile flow with sticky, safe-area-aware actions.
- A responsive `/admin` review application with dashboard, participant, assessment, content, email, affiliate and settings workspaces.
- A production PHP 8.2 REST API using PDO, secure sessions, immutable version snapshots, Stripe Checkout/webhooks, queued email, affiliate attribution, PDF generation, privacy workflows and health checks.
- MySQL/MariaDB migrations, complete V1 seed data, Nginx/Apache examples, cron, versioned release scripts, rollback guidance and operating documentation.
- A clearly separated Netlify mock adapter. Netlify previews never run the production PHP/MySQL backend.

## Local frontend

```bash
npm ci
npm run dev
```

Netlify sets `VITE_API_MODE=mock`. A production build must set:

```text
VITE_API_MODE=production
VITE_API_BASE_URL=/api
```

## Production backend

```bash
cd backend
composer install
cp .env.example .env
php bin/migrate.php
php bin/seed.php
php bin/create-admin.php owner@example.com "Owner Name"
```

Store the real environment file outside Git and link it into each release. Do not put Stripe, SMTP, database or application keys in frontend source.

## Validation

```bash
npm test
php tests/php/run.php
find backend -name '*.php' -print0 | xargs -0 -n1 php -l
```

The deployment agent performs `npm ci` and `npm run build` separately. See `docs/DEPLOYMENT.md` and `deploy/update-vps.sh` for the VPS release procedure.

## Safety

- Do not connect this work to the original `atomglobal-hhaa` project or repository.
- Do not point V2 at the existing production database before staging acceptance.
- Keep the current static application available until assessment, payment, email, PDF, privacy and rollback tests pass.
- Review this work as a draft change set. Nothing should merge automatically; the former auto-merge workflow has been removed.
