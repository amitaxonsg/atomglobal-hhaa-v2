# Administration

Open `/admin`. The preview accepts the explicit preview entry action and displays representative data; it has no production privileges. Production authentication uses PHP sessions, Argon2id password hashes, lockout controls and role permissions.

Create the first owner interactively with `php backend/bin/create-admin.php owner@example.com "Owner Name"`. The command never accepts a password argument, keeping it out of shell history.

Assessment changes start as drafts. Clone an existing version, edit and preview it, then publish. Publishing archives the previous version and requires exactly 50 active questions. Historical sessions remain linked to their original version and snapshots.
