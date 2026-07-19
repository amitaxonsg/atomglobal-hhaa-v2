# Email

Email templates and queue records are database managed. Safe template variables are explicitly allow-listed. `backend/bin/cron.php` sends due messages, retries failures with backoff, and records provider identifiers and failure reasons.

Set `MAIL_PROVIDER=smtp` for standard SMTP credentials or `MAIL_PROVIDER=smtp2go` with the SMTP2GO API key. Provider secrets are encrypted in database settings or supplied from the VPS environment. Configure the sender domain, SPF, DKIM and DMARC before enabling participant messages.
