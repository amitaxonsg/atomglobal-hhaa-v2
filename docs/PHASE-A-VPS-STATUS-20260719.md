# Phase A VPS staging completion record

Date: 19 July 2026

## Result

Phase A isolated VPS staging completed successfully.

- Staging source: `/srv/head-heart.atomglobal.com/staging-source`
- Tested staging commit: `fc2135074ddd80fefcc2c6959cdc9eac7ea6a665`
- Staging database: `head_heart_staging`
- Protected environment: `/etc/head-heart-alignment/staging.env`
- Staging backups: `/var/backups/head-heart-alignment-staging`
- Phase A backup: `head_heart_staging-before-phase-a-20260719T064824Z.sql.gz`
- Automatic deployment timer: disabled and inactive

Verified on the VPS:

- PHP 8.3 and `php8.3-fpm` active
- MariaDB 10.11 migrations and seed completed
- PHP tests passed
- frontend tests and production build passed using isolated Node 22
- restricted staging database access succeeded
- protected environment file created with mode `0600`
- live website remained HTTP 200 with valid SSL
- live release and deployed-commit marker did not change

Live production remained on:

```text
/var/www/head-heart.atomglobal.com/releases/20260719-063144-42744f41cd96
42744f41cd96d134ef0059f5175c890280f811f4
```

## Completed staging tasks

- [x] Separate staging checkout
- [x] Separate staging application directories
- [x] Separate MariaDB database and restricted user
- [x] Protected staging environment outside Git
- [x] Database backup before migration
- [x] Ordered migrations and seed
- [x] PHP tests
- [x] frontend tests and production build
- [x] live release unchanged
- [x] automatic deployment timer kept off

## Next staging tasks

- [ ] Build isolated staging release with `VITE_API_MODE=production`
- [ ] Configure loopback-only Nginx endpoint on `127.0.0.1:8088`
- [ ] Route `/api` to `php8.3-fpm`
- [ ] Confirm `/api/health` returns `status: ok`
- [ ] Create the first owner interactively
- [ ] Test real admin login, logout, session, lockout and CSRF
- [ ] Test participant registration, autosave, resume, completion and Lite Report
- [ ] Test branding save, image upload, publish and rollback
- [ ] Test SMTP2GO delivery and reminder retry
- [ ] Test Stripe test checkout, signed webhook, duplicate webhook and refund
- [ ] Review Lite and Full report PDFs
- [ ] Restore the Phase A backup into a fresh staging database
- [ ] Record staging acceptance before PR merge or production deployment

The live public Nginx site, live symlink and production database must remain unchanged until the remaining staging gates pass.
