SET NAMES utf8mb4;

INSERT INTO email_templates (template_key, template_name, subject, html_body, text_body, is_active, created_at, updated_at) VALUES
('admin_alert', 'Administrator alert', '[{{severity}}] {{title}}',
 '<h2>{{title}}</h2><p><strong>Severity:</strong> {{severity}}</p><p>{{message}}</p><p><strong>Event:</strong> {{eventKey}}</p><p><strong>Reference:</strong> {{entityType}} {{entityId}}</p><p><small>Created {{createdAt}}</small></p>',
 '[{{severity}}] {{title}}\n\n{{message}}\n\nEvent: {{eventKey}}\nReference: {{entityType}} {{entityId}}\nCreated: {{createdAt}}',
 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  template_name = VALUES(template_name),
  subject = VALUES(subject),
  html_body = VALUES(html_body),
  text_body = VALUES(text_body),
  is_active = VALUES(is_active),
  updated_at = NOW();

INSERT INTO admin_alert_recipients (name, email, alert_types_json, is_active, created_by, created_at, updated_at) VALUES
('Amit Kumar', 'amit@axon.com.sg', JSON_ARRAY('participant_registered','assessment_completed','assessment_abandoned','email_failed','payment_failed','webhook_failed','privacy_request'), 1, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  alert_types_json = VALUES(alert_types_json),
  is_active = VALUES(is_active),
  updated_at = NOW();

INSERT INTO global_settings (setting_key, setting_value, is_encrypted, updated_at) VALUES
('alerts.types', '["participant_registered","assessment_completed","assessment_abandoned","email_failed","payment_failed","webhook_failed","privacy_request"]', 0, NOW())
ON DUPLICATE KEY UPDATE
  setting_value = VALUES(setting_value),
  updated_at = NOW();
