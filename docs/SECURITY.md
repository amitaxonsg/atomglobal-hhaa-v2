# Security

Keep `.env` outside Git and make it readable only by root and the PHP-FPM group. Generate `APP_KEY` from at least 32 cryptographically random bytes. Rotate exposed credentials immediately.

The application uses PDO native prepared statements, Argon2id, HttpOnly/Secure/SameSite cookies, CSRF tokens, lockout controls, encrypted sensitive settings, random hashed resume/report/reset tokens, webhook signatures, output escaping, non-executable upload storage, audit logs and a cron lock. Production errors are logged and generic responses are returned.

Before launch, perform dependency review, upload abuse tests, permission tests, Stripe replay tests, report-token enumeration tests, privacy workflow tests and an external penetration test.
