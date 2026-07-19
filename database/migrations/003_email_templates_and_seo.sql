SET NAMES utf8mb4;

INSERT INTO email_templates (template_key, template_name, subject, html_body, text_body, is_active, created_at, updated_at) VALUES
('participant_registration', 'Participant registration', 'Your Head–Heart Alignment assessment is ready', '<p>Hello {{participantName}},</p><p>Your {{trackName}} assessment has been created securely.</p><p>You will receive a separate private resume link. Keep that message for your records.</p><p>Atom Global Consulting</p>', 'Hello {{participantName}},\n\nYour {{trackName}} assessment has been created securely. You will receive a separate private resume link.\n\nAtom Global Consulting', 1, NOW(), NOW()),
('survey_resume_link', 'Survey resume link', 'Your private assessment resume link', '<p>Hello {{participantName}},</p><p>Continue your {{trackName}} assessment using the private link below:</p><p><a href="{{resumeUrl}}">Continue assessment</a></p><p>This link expires automatically. Do not forward it.</p>', 'Hello {{participantName}},\n\nContinue your {{trackName}} assessment: {{resumeUrl}}\n\nThis private link expires automatically. Do not forward it.', 1, NOW(), NOW()),
('abandoned_reminder_1', 'Abandoned reminder 1', 'Continue your Head–Heart Alignment assessment', '<p>Hello {{participantName}},</p><p>Your {{trackName}} reflection is waiting. Continue where you stopped:</p><p><a href="{{resumeUrl}}">Resume assessment</a></p>', 'Hello {{participantName}},\n\nContinue your {{trackName}} assessment: {{resumeUrl}}', 1, NOW(), NOW()),
('abandoned_reminder_2', 'Abandoned reminder 2', 'A gentle reminder to complete your assessment', '<p>Hello {{participantName}},</p><p>You can still resume your {{trackName}} assessment securely:</p><p><a href="{{resumeUrl}}">Resume assessment</a></p>', 'Hello {{participantName}},\n\nYou can still resume your {{trackName}} assessment: {{resumeUrl}}', 1, NOW(), NOW()),
('abandoned_reminder_3', 'Final abandoned reminder', 'Final reminder: your assessment link will expire', '<p>Hello {{participantName}},</p><p>This is the final reminder before your private {{trackName}} resume link expires:</p><p><a href="{{resumeUrl}}">Resume assessment</a></p>', 'Hello {{participantName}},\n\nFinal reminder. Resume your {{trackName}} assessment before the link expires: {{resumeUrl}}', 1, NOW(), NOW()),
('assessment_completed', 'Assessment completed', 'You completed your Head–Heart Alignment assessment', '<p>Hello {{participantName}},</p><p>Your {{trackName}} assessment is complete. Your Lite Report is ready.</p>', 'Hello {{participantName}},\n\nYour {{trackName}} assessment is complete. Your Lite Report is ready.', 1, NOW(), NOW()),
('free_report_ready', 'Free report ready', 'Your Head–Heart Alignment Lite Report', '<p>Hello {{participantName}},</p><p>Open your private Lite Report:</p><p><a href="{{reportUrl}}">View report</a></p><p>The link is private and expires automatically.</p>', 'Hello {{participantName}},\n\nView your private Lite Report: {{reportUrl}}\n\nThe link expires automatically.', 1, NOW(), NOW()),
('payment_successful', 'Payment successful', 'Payment received for your Full Report', '<p>Hello {{participantName}},</p><p>We received your payment for the {{trackName}} Full Report. Your secure report link will follow.</p>', 'Hello {{participantName}},\n\nWe received your payment for the {{trackName}} Full Report. Your secure report link will follow.', 1, NOW(), NOW()),
('payment_failed', 'Payment failed', 'Your Head–Heart Alignment payment was not completed', '<p>Hello {{participantName}},</p><p>Your payment was not completed. No Full Report was unlocked. You may return to your private report and try again.</p>', 'Hello {{participantName}},\n\nYour payment was not completed. You may return to your private report and try again.', 1, NOW(), NOW()),
('paid_report_ready', 'Paid report ready', 'Your complete Head–Heart Alignment report is ready', '<p>Hello {{participantName}},</p><p>Your {{trackName}} Full Report is ready:</p><p><a href="{{reportUrl}}">View complete report</a></p><p>The link is private and expires automatically.</p>', 'Hello {{participantName}},\n\nYour {{trackName}} Full Report is ready: {{reportUrl}}\n\nThe link is private and expires automatically.', 1, NOW(), NOW()),
('password_reset', 'Password reset', 'Reset your Head–Heart Alignment admin password', '<p>Hello {{adminName}},</p><p>Use the secure expiring link below to reset your administrator password:</p><p><a href="{{resetUrl}}">Reset password</a></p>', 'Hello {{adminName}},\n\nReset your administrator password: {{resetUrl}}', 1, NOW(), NOW()),
('admin_test', 'Admin test email', 'Atom Global email configuration test', '<p>{{message}}</p>', '{{message}}', 1, NOW(), NOW()),
('privacy_request_received', 'Privacy request received', 'Your privacy request has been received', '<p>Hello {{participantName}},</p><p>We received your privacy request. Atom Global Consulting will process it according to the applicable retention and privacy policy.</p>', 'Hello {{participantName}},\n\nWe received your privacy request and will process it according to the applicable privacy policy.', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  template_name = VALUES(template_name),
  subject = VALUES(subject),
  html_body = VALUES(html_body),
  text_body = VALUES(text_body),
  updated_at = NOW();

INSERT INTO seo_pages (page_key, path, page_title, meta_description, canonical_url, robots_setting, og_title, og_description, heading, introductory_content, faq_json, structured_data_json, include_in_sitemap, updated_at) VALUES
('home', '/', 'Head–Heart Alignment | Atom Global Consulting', 'A reflective assessment that helps individuals and leaders understand how they balance reason, instinct and human consequence.', 'https://head-heart.atomglobal.com/', 'index,follow', 'Head–Heart Alignment', 'Pause. Reflect. Choose wisely.', 'Head–Heart Alignment', 'Choose the assessment designed for your stage of work and leadership.', JSON_ARRAY(), JSON_OBJECT('@context','https://schema.org','@type','WebApplication','name','Head–Heart Alignment','applicationCategory','BusinessApplication','operatingSystem','Web'), 1, NOW()),
('privacy', '/privacy', 'Privacy Notice | Head–Heart Alignment', 'How Atom Global Consulting processes assessment, payment and communication data.', 'https://head-heart.atomglobal.com/privacy', 'index,follow', 'Head–Heart Alignment Privacy Notice', 'Privacy information for participants.', 'Privacy Notice', '', JSON_ARRAY(), JSON_OBJECT('@context','https://schema.org','@type','WebPage','name','Head–Heart Alignment Privacy Notice'), 1, NOW()),
('terms', '/terms', 'Terms of Use | Head–Heart Alignment', 'Terms governing use of the Head–Heart Alignment assessment and reports.', 'https://head-heart.atomglobal.com/terms', 'index,follow', 'Head–Heart Alignment Terms', 'Terms for assessment participants and report purchasers.', 'Terms of Use', '', JSON_ARRAY(), JSON_OBJECT('@context','https://schema.org','@type','WebPage','name','Head–Heart Alignment Terms of Use'), 1, NOW())
ON DUPLICATE KEY UPDATE
  path = VALUES(path),
  page_title = VALUES(page_title),
  meta_description = VALUES(meta_description),
  canonical_url = VALUES(canonical_url),
  robots_setting = VALUES(robots_setting),
  og_title = VALUES(og_title),
  og_description = VALUES(og_description),
  heading = VALUES(heading),
  structured_data_json = VALUES(structured_data_json),
  include_in_sitemap = VALUES(include_in_sitemap),
  updated_at = NOW();
