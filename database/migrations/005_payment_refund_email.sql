SET NAMES utf8mb4;

INSERT INTO email_templates (template_key, template_name, subject, html_body, text_body, is_active, created_at, updated_at) VALUES
('payment_refunded', 'Payment refunded', 'Your Head–Heart Alignment payment was refunded', '<p>Hello {{participantName}},</p><p>Your payment for the {{trackName}} Full Report has been refunded. Paid report access has been locked as part of the refund process.</p><p>If you believe this is incorrect, reply to this email for assistance.</p>', 'Hello {{participantName}},\n\nYour payment for the {{trackName}} Full Report has been refunded. Paid report access has been locked.\n\nIf you believe this is incorrect, reply to this email for assistance.', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  template_name = VALUES(template_name),
  subject = VALUES(subject),
  html_body = VALUES(html_body),
  text_body = VALUES(text_body),
  is_active = VALUES(is_active),
  updated_at = NOW();
