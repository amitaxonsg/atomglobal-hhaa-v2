SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS branding_revisions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  settings_json JSON NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  published_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  published_at DATETIME NULL,
  INDEX idx_branding_status (status, updated_at),
  CONSTRAINT fk_branding_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_branding_published_by FOREIGN KEY (published_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessment_track_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  track_id BIGINT UNSIGNED NOT NULL UNIQUE,
  public_title VARCHAR(200) NOT NULL,
  short_title VARCHAR(100) NOT NULL,
  audience_label VARCHAR(200) NULL,
  estimated_minutes_min SMALLINT UNSIGNED NOT NULL DEFAULT 15,
  estimated_minutes_max SMALLINT UNSIGNED NOT NULL DEFAULT 15,
  average_seconds_per_question SMALLINT UNSIGNED NOT NULL DEFAULT 18,
  average_seconds_per_participant_field SMALLINT UNSIGNED NOT NULL DEFAULT 12,
  free_report_label VARCHAR(100) NOT NULL DEFAULT 'Lite Report Free',
  paid_report_label VARCHAR(100) NOT NULL DEFAULT 'Full Report',
  free_report_read_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 3,
  paid_report_read_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 12,
  question_count SMALLINT UNSIGNED NOT NULL DEFAULT 50,
  section_count SMALLINT UNSIGNED NOT NULL DEFAULT 10,
  show_remaining_time TINYINT(1) NOT NULL DEFAULT 1,
  show_question_count TINYINT(1) NOT NULL DEFAULT 1,
  show_section_count TINYINT(1) NOT NULL DEFAULT 1,
  show_autosave TINYINT(1) NOT NULL DEFAULT 1,
  introductory_note TEXT NULL,
  last_reviewed_date DATE NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_track_settings_track FOREIGN KEY (track_id) REFERENCES assessment_tracks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_alert_recipients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  alert_types_json JSON NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uq_alert_email (email),
  CONSTRAINT fk_alert_recipient_admin FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_key VARCHAR(120) NOT NULL,
  severity ENUM('info','warning','critical') NOT NULL DEFAULT 'info',
  entity_type VARCHAR(100) NULL,
  entity_id VARCHAR(100) NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  payload_json JSON NULL,
  acknowledged_by BIGINT UNSIGNED NULL,
  acknowledged_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_notification_status (acknowledged_at, severity, created_at),
  CONSTRAINT fk_notification_ack_admin FOREIGN KEY (acknowledged_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS retention_policies (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  policy_key VARCHAR(100) NOT NULL UNIQUE,
  retention_days INT UNSIGNED NOT NULL,
  action ENUM('archive','anonymise','delete') NOT NULL DEFAULT 'archive',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_run_at DATETIME NULL,
  updated_by BIGINT UNSIGNED NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_retention_admin FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS api_connection_tests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  provider_key VARCHAR(80) NOT NULL,
  status ENUM('success','failed') NOT NULL,
  message VARCHAR(500) NULL,
  tested_by BIGINT UNSIGNED NULL,
  tested_at DATETIME NOT NULL,
  INDEX idx_api_tests_provider (provider_key, tested_at),
  CONSTRAINT fk_api_test_admin FOREIGN KEY (tested_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS report_delivery_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  generated_report_id BIGINT UNSIGNED NOT NULL,
  delivery_type ENUM('secure_link','pdf_email','admin_resend','manual_download') NOT NULL,
  recipient_email VARCHAR(255) NULL,
  email_queue_id BIGINT UNSIGNED NULL,
  status VARCHAR(50) NOT NULL,
  delivered_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_delivery_report FOREIGN KEY (generated_report_id) REFERENCES generated_reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_delivery_email FOREIGN KEY (email_queue_id) REFERENCES email_queue(id) ON DELETE SET NULL,
  CONSTRAINT fk_delivery_admin FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (role_key, role_name, created_at) VALUES
('owner', 'Owner', NOW()),
('administrator', 'Administrator', NOW()),
('editor', 'Content Editor', NOW()),
('finance', 'Finance', NOW()),
('viewer', 'Viewer', NOW());

INSERT IGNORE INTO permissions (permission_key, permission_name) VALUES
('dashboard.view', 'View dashboard'),
('participants.view', 'View participants'),
('participants.export', 'Export participant records'),
('participants.delete', 'Anonymise participant records'),
('assessments.manage', 'Manage assessments and questions'),
('content.manage', 'Manage content and stage images'),
('branding.manage', 'Manage and publish branding'),
('reports.manage', 'Manage reports and secure links'),
('payments.manage', 'Manage payments and refunds'),
('email.manage', 'Manage templates and delivery queue'),
('affiliates.manage', 'Manage affiliates and commissions'),
('seo.manage', 'Manage SEO, AEO and GEO settings'),
('settings.manage', 'Manage integrations and system settings'),
('audit.view', 'View audit log');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.role_key = 'owner';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN (
  'dashboard.view','participants.view','participants.export','assessments.manage','content.manage',
  'branding.manage','reports.manage','payments.manage','email.manage','affiliates.manage','seo.manage',
  'settings.manage','audit.view'
) WHERE r.role_key = 'administrator';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN (
  'dashboard.view','participants.view','assessments.manage','content.manage','branding.manage','seo.manage'
) WHERE r.role_key = 'editor';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN (
  'dashboard.view','participants.view','reports.manage','payments.manage','affiliates.manage'
) WHERE r.role_key = 'finance';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN (
  'dashboard.view','participants.view','audit.view'
) WHERE r.role_key = 'viewer';

INSERT INTO global_settings (setting_key, setting_value, is_encrypted, updated_at) VALUES
('branding.canvas', '#F7F4EF', 0, NOW()),
('branding.surface', '#FFFFFF', 0, NOW()),
('branding.text_primary', '#211C16', 0, NOW()),
('branding.text_muted', '#726A5B', 0, NOW()),
('branding.border', '#E4DDCF', 0, NOW()),
('branding.cta', '#C9A15A', 0, NOW()),
('branding.cta_hover', '#AF8540', 0, NOW()),
('branding.heart', '#C1443F', 0, NOW()),
('branding.head', '#6C8FAE', 0, NOW()),
('branding.accent', '#C9A15A', 0, NOW()),
('branding.navy', '#14141C', 0, NOW()),
('branding.heading_font', 'Georgia, "Times New Roman", serif', 0, NOW()),
('branding.body_font', 'Arial, Helvetica, sans-serif', 0, NOW()),
('branding.base_font_size', '16', 0, NOW()),
('branding.card_radius', '8', 0, NOW()),
('branding.button_radius', '8', 0, NOW()),
('branding.logo_url', '/media/brand/atom-global-wordmark.png', 0, NOW()),
('branding.email_logo_url', '/media/brand/atom-global-wordmark.png', 0, NOW()),
('branding.report_logo_url', '/media/brand/atom-global-wordmark.png', 0, NOW()),
('branding.favicon_url', '/icon-192.png', 0, NOW()),
('email.provider', 'smtp2go', 0, NOW()),
('email.admin_from_name', 'Atom Global Consulting', 0, NOW()),
('email.admin_from_address', 'assessment@atomglobal.com', 0, NOW()),
('email.reply_to', '', 0, NOW()),
('email.reminder_hours', '[24,72,168]', 0, NOW()),
('email.max_attempts', '5', 0, NOW()),
('alerts.types', '["payment_failed","email_failed","webhook_failed","assessment_abandoned","privacy_request"]', 0, NOW()),
('security.session_lifetime', '7200', 0, NOW()),
('security.report_token_days', '30', 0, NOW()),
('security.resume_token_hours', '168', 0, NOW()),
('security.login_limit', '10', 0, NOW()),
('security.login_window_seconds', '900', 0, NOW()),
('privacy.analytics_default', 'essential', 0, NOW()),
('seo.site_name', 'Head–Heart Alignment by Atom Global Consulting', 0, NOW())
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);

INSERT INTO retention_policies (policy_key, retention_days, action, is_active, updated_at) VALUES
('incomplete_assessments', 365, 'anonymise', 1, NOW()),
('completed_assessments', 2555, 'archive', 1, NOW()),
('email_logs', 730, 'delete', 1, NOW()),
('audit_logs', 2555, 'archive', 1, NOW()),
('analytics_events', 730, 'delete', 1, NOW())
ON DUPLICATE KEY UPDATE policy_key = VALUES(policy_key);

INSERT INTO media_library (file_name, storage_path, mime_type, file_size, width, height, alt_text, focal_x, focal_y, variants_json, created_at, updated_at)
SELECT 'reflection-portrait.png', '/media/stages/reflection-portrait.png', 'image/png', 0, NULL, NULL, 'A thoughtful professional pausing beside a window', 52, 50, JSON_OBJECT('source','repository'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM media_library WHERE storage_path = '/media/stages/reflection-portrait.png');

INSERT INTO media_library (file_name, storage_path, mime_type, file_size, width, height, alt_text, focal_x, focal_y, variants_json, created_at, updated_at)
SELECT 'atom-global-wordmark.png', '/media/brand/atom-global-wordmark.png', 'image/png', 0, NULL, NULL, 'Atom Global Consulting', 50, 50, JSON_OBJECT('source','repository'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM media_library WHERE storage_path = '/media/brand/atom-global-wordmark.png');

INSERT INTO content_stages (stage_key, desktop_media_id, mobile_media_id, image_alt, focal_x, focal_y, overlay_strength, headline, supporting_text, is_active, display_order, updated_at)
SELECT stage_key, media_id, NULL, image_alt, 52, 50, 40, headline, supporting_text, 1, display_order, NOW()
FROM (
  SELECT 'version' stage_key, 'A thoughtful professional pausing beside a window' image_alt, 'Pause.\nReflect.\nChoose wisely.' headline, 'Align what you feel with what you reason.' supporting_text, 1 display_order
  UNION ALL SELECT 'participant', 'A reflective moment before beginning', 'Begin with\nwhere you are.', 'Your context makes the reflection more useful.', 2
  UNION ALL SELECT 'personal', 'A quiet moment of personal reflection', 'Notice the\npattern.', 'There are no right answers—only honest ones.', 3
  UNION ALL SELECT 'newjoiner', 'A professional considering a new beginning', 'Find your\nfooting.', 'See how you balance belonging, judgement and instinct.', 4
  UNION ALL SELECT 'manager', 'A manager reflecting on how they lead', 'Lead with\nclarity.', 'Understand what your team experiences from you.', 5
  UNION ALL SELECT 'executive', 'An executive considering a complex decision', 'Hold the\nwhole picture.', 'Balance evidence, instinct and human consequence.', 6
  UNION ALL SELECT 'report', 'A participant reviewing a personal report', 'Turn insight\ninto action.', 'Your result is a starting point, not a label.', 7
) defaults
CROSS JOIN (SELECT id media_id FROM media_library WHERE storage_path = '/media/stages/reflection-portrait.png' LIMIT 1) media
ON DUPLICATE KEY UPDATE updated_at = content_stages.updated_at;

INSERT INTO assessment_track_settings (
  track_id, public_title, short_title, audience_label, estimated_minutes_min, estimated_minutes_max,
  average_seconds_per_question, average_seconds_per_participant_field, free_report_label, paid_report_label,
  free_report_read_minutes, paid_report_read_minutes, question_count, section_count, show_remaining_time,
  show_question_count, show_section_count, show_autosave, last_reviewed_date, updated_at
)
SELECT id, CONCAT('Head–Heart Alignment: ', name), name,
  CASE track_key
    WHEN 'personal' THEN 'Personal reflection'
    WHEN 'newjoiner' THEN 'New joiners and early-career professionals'
    WHEN 'manager' THEN 'People managers'
    ELSE 'Senior leaders and executives'
  END,
  CASE WHEN track_key IN ('manager','executive') THEN 18 ELSE 15 END,
  CASE WHEN track_key = 'manager' THEN 18 WHEN track_key = 'executive' THEN 20 ELSE 15 END,
  18, 12, 'Lite Report Free', 'Full Report', 3, 12, 50, 10, 1, 1, 1, 1, CURDATE(), NOW()
FROM assessment_tracks
ON DUPLICATE KEY UPDATE track_id = VALUES(track_id);