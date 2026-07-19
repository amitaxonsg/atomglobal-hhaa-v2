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

