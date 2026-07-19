SET NAMES utf8mb4;

CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_key VARCHAR(50) NOT NULL UNIQUE,
  role_name VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  permission_key VARCHAR(100) NOT NULL UNIQUE,
  permission_name VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE admin_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  two_factor_secret_encrypted TEXT NULL,
  two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0,
  failed_login_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  session_version INT UNSIGNED NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_admin_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_reset_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE participants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_uuid CHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  email_normalized VARCHAR(255) GENERATED ALWAYS AS (LOWER(email)) STORED,
  marketing_consent TINYINT(1) NOT NULL DEFAULT 0,
  transactional_consent TINYINT(1) NOT NULL DEFAULT 1,
  unsubscribed_at DATETIME NULL,
  hard_bounced_at DATETIME NULL,
  suppressed_at DATETIME NULL,
  anonymised_at DATETIME NULL,
  deletion_requested_at DATETIME NULL,
  tags_json JSON NULL,
  internal_notes TEXT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_participants_email (email_normalized),
  INDEX idx_participants_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE assessment_tracks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  track_key VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  price_minor INT UNSIGNED NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE assessment_versions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  track_id BIGINT UNSIGNED NOT NULL,
  version_number VARCHAR(30) NOT NULL,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  cloned_from_id BIGINT UNSIGNED NULL,
  change_summary TEXT NULL,
  published_at DATETIME NULL,
  archived_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uq_track_version (track_id, version_number),
  CONSTRAINT fk_version_track FOREIGN KEY (track_id) REFERENCES assessment_tracks(id),
  CONSTRAINT fk_version_clone FOREIGN KEY (cloned_from_id) REFERENCES assessment_versions(id) ON DELETE SET NULL,
  CONSTRAINT fk_version_admin FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE assessment_sections (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assessment_version_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  display_order SMALLINT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_version_section_code (assessment_version_id, code),
  CONSTRAINT fk_section_version FOREIGN KEY (assessment_version_id) REFERENCES assessment_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE questions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assessment_version_id BIGINT UNSIGNED NOT NULL,
  section_id BIGINT UNSIGNED NOT NULL,
  stable_key VARCHAR(80) NOT NULL,
  question_text TEXT NOT NULL,
  scoring_direction ENUM('H','K') NOT NULL,
  position SMALLINT UNSIGNED NOT NULL,
  is_required TINYINT(1) NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_version_question_key (assessment_version_id, stable_key),
  UNIQUE KEY uq_version_question_position (assessment_version_id, position),
  CONSTRAINT fk_question_version FOREIGN KEY (assessment_version_id) REFERENCES assessment_versions(id) ON DELETE CASCADE,
  CONSTRAINT fk_question_section FOREIGN KEY (section_id) REFERENCES assessment_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE answer_options (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assessment_version_id BIGINT UNSIGNED NOT NULL,
  option_value TINYINT UNSIGNED NOT NULL,
  label VARCHAR(150) NOT NULL,
  display_order TINYINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_version_answer (assessment_version_id, option_value),
  CONSTRAINT fk_answer_version FOREIGN KEY (assessment_version_id) REFERENCES assessment_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE affiliates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  affiliate_code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  contact_name VARCHAR(200) NULL,
  contact_email VARCHAR(255) NULL,
  campaign_name VARCHAR(200) NULL,
  cookie_duration_days SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  commission_type ENUM('percentage','fixed') NOT NULL DEFAULT 'percentage',
  commission_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  applicable_tracks_json JSON NULL,
  notes TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE affiliate_clicks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  affiliate_id BIGINT UNSIGNED NOT NULL,
  click_uuid CHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
  ip_hash CHAR(64) NULL,
  user_agent_hash CHAR(64) NULL,
  landing_page TEXT NULL,
  utm_source VARCHAR(200) NULL,
  utm_medium VARCHAR(200) NULL,
  utm_campaign VARCHAR(200) NULL,
  utm_content VARCHAR(200) NULL,
  utm_term VARCHAR(200) NULL,
  fraud_flag TINYINT(1) NOT NULL DEFAULT 0,
  clicked_at DATETIME NOT NULL,
  CONSTRAINT fk_click_affiliate FOREIGN KEY (affiliate_id) REFERENCES affiliates(id)
) ENGINE=InnoDB;

CREATE TABLE survey_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_uuid CHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
  participant_id BIGINT UNSIGNED NOT NULL,
  track_id BIGINT UNSIGNED NOT NULL,
  assessment_version_id BIGINT UNSIGNED NOT NULL,
  affiliate_id BIGINT UNSIGNED NULL,
  first_click_id BIGINT UNSIGNED NULL,
  last_click_id BIGINT UNSIGNED NULL,
  status ENUM('in_progress','completed','expired','deleted') NOT NULL DEFAULT 'in_progress',
  current_section SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  completion_percentage TINYINT UNSIGNED NOT NULL DEFAULT 0,
  resume_token_hash CHAR(64) NOT NULL UNIQUE,
  resume_expires_at DATETIME NOT NULL,
  question_snapshot_json JSON NOT NULL,
  participant_context_json JSON NULL,
  attribution_snapshot_json JSON NULL,
  reminders_sent TINYINT UNSIGNED NOT NULL DEFAULT 0,
  reminders_suppressed TINYINT(1) NOT NULL DEFAULT 0,
  last_activity_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_sessions_status_activity (status, last_activity_at),
  INDEX idx_sessions_version (assessment_version_id),
  CONSTRAINT fk_session_participant FOREIGN KEY (participant_id) REFERENCES participants(id),
  CONSTRAINT fk_session_track FOREIGN KEY (track_id) REFERENCES assessment_tracks(id),
  CONSTRAINT fk_session_version FOREIGN KEY (assessment_version_id) REFERENCES assessment_versions(id),
  CONSTRAINT fk_session_affiliate FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE SET NULL,
  CONSTRAINT fk_session_first_click FOREIGN KEY (first_click_id) REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
  CONSTRAINT fk_session_last_click FOREIGN KEY (last_click_id) REFERENCES affiliate_clicks(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE affiliate_attributions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  affiliate_id BIGINT UNSIGNED NOT NULL,
  participant_id BIGINT UNSIGNED NULL,
  survey_session_id BIGINT UNSIGNED NOT NULL,
  first_click_id BIGINT UNSIGNED NULL,
  last_click_id BIGINT UNSIGNED NULL,
  referral_at DATETIME NOT NULL,
  conversion_at DATETIME NULL,
  self_referral_flag TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_affiliate_session (affiliate_id, survey_session_id),
  CONSTRAINT fk_attr_affiliate FOREIGN KEY (affiliate_id) REFERENCES affiliates(id),
  CONSTRAINT fk_attr_participant FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE SET NULL,
  CONSTRAINT fk_attr_session FOREIGN KEY (survey_session_id) REFERENCES survey_sessions(id),
  CONSTRAINT fk_attr_first_click FOREIGN KEY (first_click_id) REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
  CONSTRAINT fk_attr_last_click FOREIGN KEY (last_click_id) REFERENCES affiliate_clicks(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE survey_answers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  survey_session_id BIGINT UNSIGNED NOT NULL,
  question_position SMALLINT UNSIGNED NOT NULL,
  answer_value TINYINT UNSIGNED NOT NULL,
  note TEXT NULL,
  answered_at DATETIME NOT NULL,
  UNIQUE KEY uq_session_answer (survey_session_id, question_position),
  CONSTRAINT fk_survey_answer_session FOREIGN KEY (survey_session_id) REFERENCES survey_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE report_templates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assessment_version_id BIGINT UNSIGNED NOT NULL,
  profile_key VARCHAR(80) NOT NULL,
  profile_name VARCHAR(200) NOT NULL,
  min_score SMALLINT UNSIGNED NOT NULL,
  max_score SMALLINT UNSIGNED NOT NULL,
  free_content_json JSON NOT NULL,
  paid_content_json JSON NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uq_version_profile (assessment_version_id, profile_key),
  CONSTRAINT fk_template_version FOREIGN KEY (assessment_version_id) REFERENCES assessment_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE score_snapshots (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  survey_session_id BIGINT UNSIGNED NOT NULL UNIQUE,
  assessment_version_id BIGINT UNSIGNED NOT NULL,
  total_score SMALLINT UNSIGNED NOT NULL,
  subscale_scores_json JSON NOT NULL,
  profile_key VARCHAR(80) NOT NULL,
  scoring_rules_json JSON NOT NULL,
  answers_snapshot_json JSON NOT NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_score_session FOREIGN KEY (survey_session_id) REFERENCES survey_sessions(id),
  CONSTRAINT fk_score_version FOREIGN KEY (assessment_version_id) REFERENCES assessment_versions(id)
) ENGINE=InnoDB;

CREATE TABLE generated_reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  survey_session_id BIGINT UNSIGNED NOT NULL UNIQUE,
  score_snapshot_id BIGINT UNSIGNED NOT NULL,
  secure_token_hash CHAR(64) NOT NULL UNIQUE,
  token_expires_at DATETIME NOT NULL,
  is_unlocked TINYINT(1) NOT NULL DEFAULT 0,
  unlock_reason VARCHAR(100) NULL,
  unlocked_at DATETIME NULL,
  revoked_at DATETIME NULL,
  free_report_json JSON NOT NULL,
  paid_report_json JSON NOT NULL,
  pdf_path VARCHAR(500) NULL,
  pdf_generated_at DATETIME NULL,
  view_count INT UNSIGNED NOT NULL DEFAULT 0,
  last_viewed_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_report_session FOREIGN KEY (survey_session_id) REFERENCES survey_sessions(id),
  CONSTRAINT fk_report_score FOREIGN KEY (score_snapshot_id) REFERENCES score_snapshots(id)
) ENGINE=InnoDB;

CREATE TABLE secure_report_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  generated_report_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_secure_token_report FOREIGN KEY (generated_report_id) REFERENCES generated_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  survey_session_id BIGINT UNSIGNED NOT NULL,
  affiliate_id BIGINT UNSIGNED NULL,
  provider VARCHAR(30) NOT NULL,
  status ENUM('checkout_started','paid','failed','cancelled','abandoned','refunded','manual') NOT NULL,
  amount INT UNSIGNED NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  stripe_checkout_session_id VARCHAR(255) NULL UNIQUE,
  stripe_payment_intent_id VARCHAR(255) NULL,
  stripe_customer_id VARCHAR(255) NULL,
  coupon_code VARCHAR(100) NULL,
  metadata_json JSON NULL,
  paid_at DATETIME NULL,
  refunded_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_payment_session FOREIGN KEY (survey_session_id) REFERENCES survey_sessions(id),
  CONSTRAINT fk_payment_affiliate FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE stripe_webhook_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(150) NOT NULL,
  status ENUM('processing','processed','failed') NOT NULL,
  payload_json JSON NOT NULL,
  failure_reason TEXT NULL,
  received_at DATETIME NOT NULL,
  processed_at DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE affiliate_commissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  affiliate_id BIGINT UNSIGNED NOT NULL,
  payment_id BIGINT UNSIGNED NOT NULL UNIQUE,
  survey_session_id BIGINT UNSIGNED NOT NULL,
  amount_minor INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL,
  status ENUM('pending','approved','paid','void') NOT NULL DEFAULT 'pending',
  adjustment_note TEXT NULL,
  approved_at DATETIME NULL,
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_commission_affiliate FOREIGN KEY (affiliate_id) REFERENCES affiliates(id),
  CONSTRAINT fk_commission_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
  CONSTRAINT fk_commission_session FOREIGN KEY (survey_session_id) REFERENCES survey_sessions(id)
) ENGINE=InnoDB;

CREATE TABLE email_templates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_key VARCHAR(100) NOT NULL UNIQUE,
  template_name VARCHAR(200) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_body MEDIUMTEXT NOT NULL,
  text_body MEDIUMTEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE email_queue (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_key VARCHAR(100) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  variables_json JSON NOT NULL,
  status ENUM('queued','retry','sent','failed','suppressed') NOT NULL DEFAULT 'queued',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts TINYINT UNSIGNED NOT NULL DEFAULT 5,
  scheduled_at DATETIME NOT NULL,
  sent_at DATETIME NULL,
  provider_message_id VARCHAR(255) NULL,
  failure_reason TEXT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_email_queue_due (status, scheduled_at)
) ENGINE=InnoDB;

CREATE TABLE email_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email_queue_id BIGINT UNSIGNED NULL,
  recipient_email VARCHAR(255) NOT NULL,
  template_key VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  provider_message_id VARCHAR(255) NULL,
  failure_reason TEXT NULL,
  opened_at DATETIME NULL,
  clicked_at DATETIME NULL,
  sent_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_email_log_recipient (recipient_email),
  CONSTRAINT fk_email_log_queue FOREIGN KEY (email_queue_id) REFERENCES email_queue(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE abandoned_survey_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  survey_session_id BIGINT UNSIGNED NOT NULL,
  reminder_number TINYINT UNSIGNED NOT NULL,
  email_queue_id BIGINT UNSIGNED NULL,
  status VARCHAR(50) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  sent_at DATETIME NULL,
  resumed_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_session_reminder (survey_session_id, reminder_number),
  CONSTRAINT fk_abandoned_session FOREIGN KEY (survey_session_id) REFERENCES survey_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_abandoned_email FOREIGN KEY (email_queue_id) REFERENCES email_queue(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE media_library (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  width INT UNSIGNED NULL,
  height INT UNSIGNED NULL,
  alt_text VARCHAR(500) NULL,
  focal_x DECIMAL(5,2) NOT NULL DEFAULT 50,
  focal_y DECIMAL(5,2) NOT NULL DEFAULT 50,
  variants_json JSON NULL,
  uploaded_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_media_admin FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE content_stages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  stage_key VARCHAR(80) NOT NULL UNIQUE,
  desktop_media_id BIGINT UNSIGNED NULL,
  mobile_media_id BIGINT UNSIGNED NULL,
  image_alt VARCHAR(500) NULL,
  focal_x DECIMAL(5,2) NOT NULL DEFAULT 50,
  focal_y DECIMAL(5,2) NOT NULL DEFAULT 50,
  overlay_strength TINYINT UNSIGNED NOT NULL DEFAULT 60,
  headline VARCHAR(500) NULL,
  supporting_text TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_stage_desktop_media FOREIGN KEY (desktop_media_id) REFERENCES media_library(id) ON DELETE RESTRICT,
  CONSTRAINT fk_stage_mobile_media FOREIGN KEY (mobile_media_id) REFERENCES media_library(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE global_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(150) NOT NULL UNIQUE,
  setting_value MEDIUMTEXT NULL,
  is_encrypted TINYINT(1) NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB;

CREATE TABLE seo_pages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  page_key VARCHAR(100) NOT NULL UNIQUE,
  path VARCHAR(500) NOT NULL UNIQUE,
  page_title VARCHAR(255) NULL,
  meta_description VARCHAR(500) NULL,
  canonical_url VARCHAR(500) NULL,
  robots_setting VARCHAR(100) NOT NULL DEFAULT 'index,follow',
  og_title VARCHAR(255) NULL,
  og_description VARCHAR(500) NULL,
  og_media_id BIGINT UNSIGNED NULL,
  twitter_json JSON NULL,
  heading VARCHAR(500) NULL,
  introductory_content MEDIUMTEXT NULL,
  faq_json JSON NULL,
  structured_data_json JSON NULL,
  include_in_sitemap TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_seo_media FOREIGN KEY (og_media_id) REFERENCES media_library(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE consent_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  participant_id BIGINT UNSIGNED NOT NULL,
  survey_session_id BIGINT UNSIGNED NULL,
  consent_type VARCHAR(80) NOT NULL,
  consent_granted TINYINT(1) NOT NULL,
  wording_snapshot TEXT NOT NULL,
  ip_hash CHAR(64) NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_consent_participant FOREIGN KEY (participant_id) REFERENCES participants(id),
  CONSTRAINT fk_consent_session FOREIGN KEY (survey_session_id) REFERENCES survey_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(150) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id VARCHAR(100) NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  ip_hash CHAR(64) NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE background_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_type VARCHAR(100) NOT NULL,
  payload_json JSON NOT NULL,
  status ENUM('queued','running','completed','failed') NOT NULL DEFAULT 'queued',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  available_at DATETIME NOT NULL,
  locked_at DATETIME NULL,
  completed_at DATETIME NULL,
  failure_reason TEXT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_jobs_due (status, available_at)
) ENGINE=InnoDB;

CREATE TABLE analytics_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  survey_session_id BIGINT UNSIGNED NULL,
  event_name VARCHAR(100) NOT NULL,
  event_properties_json JSON NULL,
  consent_state VARCHAR(30) NOT NULL DEFAULT 'essential',
  created_at DATETIME NOT NULL,
  INDEX idx_analytics_event_date (event_name, created_at),
  CONSTRAINT fk_analytics_session FOREIGN KEY (survey_session_id) REFERENCES survey_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO roles (role_key, role_name, created_at) VALUES
('owner','Owner',NOW()),('administrator','Administrator',NOW()),('content_editor','Content Editor',NOW()),('support','Support',NOW()),('marketing','Marketing',NOW()),('finance','Finance',NOW()),('read_only','Read Only',NOW());

INSERT INTO permissions (permission_key, permission_name) VALUES
('dashboard.view','View dashboard'),('participants.manage','Manage participants'),('assessments.manage','Manage assessments'),('content.manage','Manage content'),('payments.manage','Manage payments'),('email.manage','Manage email'),('affiliates.manage','Manage affiliates'),('settings.manage','Manage settings'),('audit.view','View audit log');

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id FROM roles CROSS JOIN permissions WHERE roles.role_key IN ('owner','administrator');

INSERT INTO global_settings (setting_key, setting_value, is_encrypted, updated_at) VALUES
('reminders.enabled','true',0,NOW()),('reminders.schedule_hours','[1,24,72]',0,NOW()),('reminders.maximum','3',0,NOW()),('report.token_lifetime_days','30',0,NOW()),('privacy.retention_days','730',0,NOW()),('payments.currency','USD',0,NOW());

INSERT INTO content_stages (stage_key, image_alt, focal_x, focal_y, overlay_strength, headline, supporting_text, is_active, display_order, updated_at) VALUES
('version','A thoughtful professional pausing beside a window',50,50,58,'Pause.\nReflect.\nChoose wisely.','Align what you feel with what you reason.',1,1,NOW()),
('participant','A reflective moment before beginning',46,50,60,'Begin with where you are.','Your context makes the reflection more useful.',1,2,NOW()),
('personal','A quiet moment of personal reflection',48,50,60,'Notice the pattern.','There are no right answers—only honest ones.',1,3,NOW()),
('newjoiner','A professional considering a new beginning',48,50,60,'Find your footing.','See how you balance belonging, judgement and instinct.',1,4,NOW()),
('manager','A manager reflecting on how they lead',48,50,62,'Lead with clarity.','Understand what your team experiences from you.',1,5,NOW()),
('executive','An executive considering a complex decision',48,50,64,'Hold the whole picture.','Balance evidence, instinct and human consequence.',1,6,NOW()),
('free_report','A participant reviewing a personal report',48,50,62,'Turn insight into action.','Your result is a starting point, not a label.',1,7,NOW()),
('paid_upgrade','A participant considering a deeper report',48,50,62,'Go deeper.','Convert reflection into a practical development plan.',1,8,NOW()),
('payment_success','A successful assessment report purchase',48,50,62,'Your full report is ready.','Keep your secure link somewhere safe.',1,9,NOW()),
('report_view','A participant reading a development report',48,50,62,'Return to the insight.','Review, reflect and choose one action to practise.',1,10,NOW());

INSERT INTO email_templates (template_key, template_name, subject, html_body, text_body, is_active, created_at, updated_at) VALUES
('participant_registration','Participant registration','Your Head–Heart Alignment assessment','<p>Hello {{participant_name}},</p><p>Your {{assessment_type}} assessment is ready.</p>','Hello {{participant_name}}, your {{assessment_type}} assessment is ready.',1,NOW(),NOW()),
('survey_started','Survey started','Your secure assessment link','<p>Continue at <a href="{{resume_url}}">your secure assessment link</a>.</p>','Continue your assessment: {{resume_url}}',1,NOW(),NOW()),
('survey_resume','Survey resume link','Resume your assessment','<p>You are {{completion_percentage}}% complete. <a href="{{resume_url}}">Resume here</a>.</p>','You are {{completion_percentage}}% complete. Resume: {{resume_url}}',1,NOW(),NOW()),
('abandoned_reminder_1','Abandoned reminder 1','A short pause, then continue','<p>Your assessment is saved. <a href="{{resume_url}}">Continue when ready</a>.</p>','Your assessment is saved: {{resume_url}}',1,NOW(),NOW()),
('abandoned_reminder_2','Abandoned reminder 2','Your reflection is still waiting','<p>Return to your saved assessment: {{resume_url}}</p>','Return to your saved assessment: {{resume_url}}',1,NOW(),NOW()),
('abandoned_reminder_final','Final abandoned reminder','Final reminder: your saved assessment','<p>This is the final reminder for your saved assessment: {{resume_url}}</p>','Final reminder: {{resume_url}}',1,NOW(),NOW()),
('assessment_completed','Assessment completed','You completed Head–Heart Alignment','<p>Your free result is ready: {{free_report_url}}</p>','Your free result: {{free_report_url}}',1,NOW(),NOW()),
('free_report_ready','Free report ready','Your Head–Heart Alignment result','<p>View your result: {{free_report_url}}</p>','View your result: {{free_report_url}}',1,NOW(),NOW()),
('checkout_started','Checkout started','Complete your report upgrade','<p>Complete payment securely: {{payment_url}}</p>','Complete payment: {{payment_url}}',1,NOW(),NOW()),
('unpaid_reminder','Unpaid reminder','Your full report is still available','<p>Unlock your full report: {{payment_url}}</p>','Unlock your full report: {{payment_url}}',1,NOW(),NOW()),
('payment_successful','Payment successful','Payment received','<p>Thank you. Your paid report is being prepared.</p>','Thank you. Your paid report is being prepared.',1,NOW(),NOW()),
('paid_report_ready','Paid report ready','Your complete Head–Heart report','<p>Your private report is ready: {{paid_report_url}}</p>','Your private report: {{paid_report_url}}',1,NOW(),NOW()),
('report_link_resent','Report link resent','Your private report link','<p>Open your report: {{paid_report_url}}</p>','Open your report: {{paid_report_url}}',1,NOW(),NOW()),
('affiliate_registration','Affiliate registration','Your Atom Global affiliate link','<p>Your affiliate code is {{affiliate_code}}.</p>','Your affiliate code is {{affiliate_code}}.',1,NOW(),NOW()),
('password_reset','Password reset','Reset your administration password','<p>Use the secure password reset link provided.</p>','Use the secure password reset link provided.',1,NOW(),NOW()),
('admin_notification','Admin notification','Head–Heart Alignment notification','<p>An administration event requires attention.</p>','An administration event requires attention.',1,NOW(),NOW());

INSERT INTO seo_pages (page_key, path, page_title, meta_description, robots_setting, heading, introductory_content, faq_json, structured_data_json, include_in_sitemap, updated_at) VALUES
('home','/','Head–Heart Alignment Assessment | Atom Global Consulting','Explore how you balance logic, feeling and intuition in life and leadership.','index,follow','Head–Heart Alignment','A reflective assessment for clearer decisions, healthier relationships and more conscious leadership.','[]','{"@context":"https://schema.org","@type":"WebApplication","name":"Head–Heart Alignment"}',1,NOW()),
('admin','/admin','Administration','Private administration application.','noindex,nofollow','Administration','',NULL,NULL,0,NOW()),
('report','/report','Private report','Private participant report.','noindex,nofollow','Private report','',NULL,NULL,0,NOW()),
('payment','/payment','Secure payment','Secure assessment report payment.','noindex,nofollow','Secure payment','',NULL,NULL,0,NOW());

