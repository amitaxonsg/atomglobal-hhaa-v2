SET NAMES utf8mb4;

CREATE INDEX idx_reports_access_created
  ON generated_reports (revoked_at, is_unlocked, created_at);

CREATE INDEX idx_payments_status_created
  ON payments (status, created_at);

CREATE INDEX idx_email_queue_recipient_created
  ON email_queue (recipient_email, created_at);

CREATE INDEX idx_email_queue_template_created
  ON email_queue (template_key, created_at);

CREATE INDEX idx_analytics_event_created
  ON analytics_events (event_name, created_at);
