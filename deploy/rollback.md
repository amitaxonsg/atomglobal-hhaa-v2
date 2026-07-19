# Application rollback

1. List releases with `ls -1 /var/www/head-heart.atomglobal.com/releases`.
2. Point `/var/www/head-heart.atomglobal.com/current` to the selected release using an atomic symbolic-link switch.
3. Reload PHP-FPM and Nginx.
4. Check `/api/health`, the public assessment, `/admin`, and a private test report.

Application files can be rolled back immediately. Database migrations are forward-only by default because a destructive database rollback can invalidate sessions and reports created after deployment. Restore a database backup only after assessing that data-loss window and taking a fresh copy of the current database.
