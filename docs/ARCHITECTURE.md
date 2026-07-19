# Architecture

The public assessment and responsive administration interface are React applications built by Vite. Netlify runs them with `VITE_API_MODE=mock` for design review. The VPS build uses `VITE_API_MODE=production` and `VITE_API_BASE_URL=/api`.

Nginx serves the static Vite build and routes `/api` to PHP 8.2-FPM. PHP uses a small REST router, PDO prepared statements, secure server sessions, Stripe Checkout, a cron-driven email/background queue, and MySQL or MariaDB. Uploaded media and generated PDFs live under `STORAGE_PATH`, outside executable web directories.

Every started survey points permanently to one published assessment version. Its questions and scoring rules are copied into a session snapshot; completion creates immutable answer, score, free-report and paid-report snapshots. Published versions are never edited in place.
