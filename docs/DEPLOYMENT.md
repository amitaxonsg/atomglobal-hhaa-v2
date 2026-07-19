# VPS deployment

The supported production target is Ubuntu/Debian with Nginx, PHP 8.2-FPM or newer, MySQL 8/MariaDB, Composer 2 and Node 22 used only during builds. Docker is not required.

1. Clone only `amitaxonsg/atomglobal-hhaa-v2` into `/srv/head-heart.atomglobal.com/source`.
2. Run `sudo deploy/install-vps.sh` and edit `/etc/head-heart-alignment/app.env`.
3. Create the empty database and restricted application user.
4. Install Node 22 and Composer 2 from their supported distribution channels.
5. Run `sudo deploy/update-vps.sh` for a versioned release.
6. Add `deploy/cron-example.txt` to `/etc/cron.d/head-heart-alignment`.
7. Obtain TLS, validate `deploy/nginx-example.conf`, and reload Nginx.
8. Create the first owner with the interactive command documented in `docs/ADMIN.md`.

Do not remove the existing static application or switch the production symlink until the new release passes staging assessment, payment, email, PDF, privacy and rollback tests.
