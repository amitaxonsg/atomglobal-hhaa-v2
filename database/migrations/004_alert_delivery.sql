SET NAMES utf8mb4;

ALTER TABLE notification_events
  ADD COLUMN alert_queued_at DATETIME NULL AFTER acknowledged_at,
  ADD INDEX idx_notification_delivery (alert_queued_at, severity, created_at);

INSERT INTO email_templates (template_key, template_name, subject, html_body, text_body, is_active, created_at, updated_at) VALUES
('admin_alert', 'Administrator system alert', '[{{severity}}] {{title}}', '<p><strong>{{title}}</strong></p><p>{{message}}</p><p>Event: {{eventKey}}<br>Entity: {{entityType}} {{entityId}}<br>Created: {{createdAt}}</p><p>Review the Head–Heart Alignment administration dashboard.</p>', '{{title}}\n\n{{message}}\n\nEvent: {{eventKey}}\nEntity: {{entityType}} {{entityId}}\nCreated: {{createdAt}}\n\nReview the Head–Heart Alignment administration dashboard.', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  template_name = VALUES(template_name),
  subject = VALUES(subject),
  html_body = VALUES(html_body),
  text_body = VALUES(text_body),
  is_active = VALUES(is_active),
  updated_at = NOW();
