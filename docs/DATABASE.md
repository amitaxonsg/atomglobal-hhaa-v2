# Database

Run `php backend/bin/migrate.php` followed by `php backend/bin/seed.php`. Migrations are ordered SQL files in `database/migrations`; `database/schema.sql` is a clean-install reference. The V1 seed is generated from the preserved React assessment source and contains all four tracks, 10 sections per track, exactly 50 questions per track, answer choices, profile narratives and report content.

Use a dedicated database account with access only to the application database. Back up with `mysqldump --single-transaction` before every migration. Published assessment versions and completed snapshots should be treated as append-only records.
