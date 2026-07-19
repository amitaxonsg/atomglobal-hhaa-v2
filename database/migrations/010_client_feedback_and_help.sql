SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS client_feedback (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_uuid CHAR(36) NOT NULL DEFAULT (UUID()) UNIQUE,
  submitted_by_admin_id BIGINT UNSIGNED NULL,
  submitter_name VARCHAR(200) NOT NULL,
  submitter_email VARCHAR(255) NOT NULL,
  feedback_type ENUM('bug','improvement','content','question','other') NOT NULL DEFAULT 'improvement',
  module_name VARCHAR(100) NOT NULL DEFAULT 'General',
  priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  title VARCHAR(250) NOT NULL,
  details TEXT NOT NULL,
  expected_outcome TEXT NULL,
  page_url VARCHAR(1000) NULL,
  attachment_url VARCHAR(1000) NULL,
  status ENUM('new','clarification_requested','accepted','in_progress','ready_for_review','done','declined') NOT NULL DEFAULT 'new',
  resolution TEXT NULL,
  github_issue_number BIGINT UNSIGNED NULL,
  github_issue_url VARCHAR(1000) NULL,
  github_sync_status ENUM('pending','synced','failed','not_configured') NOT NULL DEFAULT 'pending',
  github_last_error TEXT NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_feedback_status_created (status, created_at),
  INDEX idx_feedback_submitter (submitter_email, created_at),
  INDEX idx_feedback_github (github_issue_number),
  CONSTRAINT fk_feedback_submitter_admin FOREIGN KEY (submitted_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS client_feedback_updates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  feedback_id BIGINT UNSIGNED NOT NULL,
  admin_user_id BIGINT UNSIGNED NULL,
  update_type ENUM('submitted','status','clarification','resolution','github_sync','note') NOT NULL DEFAULT 'note',
  status VARCHAR(50) NULL,
  message TEXT NULL,
  emailed_at DATETIME NULL,
  github_synced_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_feedback_updates_feedback (feedback_id, created_at),
  CONSTRAINT fk_feedback_updates_feedback FOREIGN KEY (feedback_id) REFERENCES client_feedback(id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_updates_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO permissions (permission_key, permission_name)
VALUES
  ('feedback.submit', 'Submit and view client feedback'),
  ('feedback.manage', 'Manage feedback status and GitHub synchronisation')
ON DUPLICATE KEY UPDATE permission_name = VALUES(permission_name);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_key = 'feedback.submit';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.permission_key = 'feedback.manage'
WHERE r.role_key IN ('owner', 'administrator');

INSERT IGNORE INTO global_settings (setting_key, setting_value, is_encrypted, updated_at)
VALUES
  ('feedback.github_repository', 'amitaxonsg/atomglobal-hhaa-v2', 0, NOW()),
  ('feedback.client_email', 'sunil.setpaul@atomglobal.com', 0, NOW()),
  ('feedback.internal_email', 'amit@axon.com.sg', 0, NOW()),
  ('feedback.support_email', 'amit@axon.com.sg', 0, NOW()),
  ('feedback.issue_prefix', 'Client feedback', 0, NOW());

INSERT IGNORE INTO email_templates
  (template_key, template_name, subject, html_body, text_body, is_active, created_at, updated_at)
VALUES
  (
    'feedback_received',
    'Feedback received',
    'Feedback received: {{feedbackTitle}}',
    '<p>Hello {{submitterName}},</p><p>Thank you. We have recorded your feedback as <strong>#{{feedbackId}}</strong>.</p><p><strong>{{feedbackTitle}}</strong></p><p>Status: {{feedbackStatus}}</p><p>We will review it and update the status in the administration portal. GitHub reference: {{githubReference}}</p>',
    'Hello {{submitterName}}, your feedback #{{feedbackId}} — {{feedbackTitle}} — has been recorded. Status: {{feedbackStatus}}. GitHub reference: {{githubReference}}.',
    1,
    NOW(),
    NOW()
  ),
  (
    'feedback_internal_notice',
    'Internal feedback notification',
    'New client feedback #{{feedbackId}}: {{feedbackTitle}}',
    '<p>New client feedback was submitted.</p><p><strong>#{{feedbackId}} — {{feedbackTitle}}</strong></p><p>Submitted by {{submitterName}} ({{submitterEmail}})</p><p>Module: {{feedbackModule}} · Priority: {{feedbackPriority}}</p><p>{{feedbackDetails}}</p><p>GitHub reference: {{githubReference}}</p>',
    'New client feedback #{{feedbackId}}: {{feedbackTitle}}. Submitted by {{submitterName}} ({{submitterEmail}}). Module: {{feedbackModule}}. Priority: {{feedbackPriority}}. {{feedbackDetails}}. GitHub: {{githubReference}}.',
    1,
    NOW(),
    NOW()
  ),
  (
    'feedback_clarification',
    'Feedback clarification requested',
    'Clarification needed for feedback #{{feedbackId}}',
    '<p>Hello {{submitterName}},</p><p>We need a little more information before we can complete feedback <strong>#{{feedbackId}} — {{feedbackTitle}}</strong>.</p><p>{{clarificationMessage}}</p><p>Please reply by email to <a href="mailto:{{supportEmail}}">{{supportEmail}}</a> and include feedback #{{feedbackId}} in the subject.</p>',
    'Hello {{submitterName}}, we need clarification for feedback #{{feedbackId}} — {{feedbackTitle}}. {{clarificationMessage}} Please email {{supportEmail}} and include feedback #{{feedbackId}} in the subject.',
    1,
    NOW(),
    NOW()
  ),
  (
    'feedback_completed',
    'Feedback completed',
    'Feedback completed: #{{feedbackId}} {{feedbackTitle}}',
    '<p>Hello {{submitterName}},</p><p>Feedback <strong>#{{feedbackId}} — {{feedbackTitle}}</strong> has been marked done.</p><p>{{resolution}}</p><p>You can review the completed status in the administration portal.</p>',
    'Hello {{submitterName}}, feedback #{{feedbackId}} — {{feedbackTitle}} — has been marked done. {{resolution}}',
    1,
    NOW(),
    NOW()
  );