SET NAMES utf8mb4;

INSERT INTO global_settings (setting_key, setting_value, is_encrypted, updated_at) VALUES
('email.provider', 'smtp2go', 0, NOW()),
('email.admin_from_name', 'Atom Global', 0, NOW()),
('email.admin_from_address', 'amit@axon.com.sg', 0, NOW()),
('email.reply_to', 'amit@axon.com.sg', 0, NOW()),
('email.public_base_url', 'https://head-heart.atomglobal.com', 0, NOW()),
('email.logo_url', '/media/brand/atom-global-wordmark.png', 0, NOW()),
('email.website_url', '/', 0, NOW()),
('email.privacy_url', '/privacy', 0, NOW()),
('email.terms_url', '/terms', 0, NOW()),
('email.footer_text', 'Head–Heart Alignment by Atom Global Consulting', 0, NOW()),
('email.reminder_hours', '[24,72,168]', 0, NOW()),
('email.max_attempts', '5', 0, NOW())
ON DUPLICATE KEY UPDATE updated_at = updated_at;

INSERT INTO email_templates (template_key, template_name, subject, html_body, text_body, is_active, created_at, updated_at) VALUES
('participant_registration', 'Welcome and registration', 'Welcome to your Head–Heart Alignment assessment',
 '<h2>Welcome, {{participantName}}</h2><p>Your <strong>{{trackName}}</strong> assessment has been created securely.</p><p>This reflective experience is designed to help you notice how you balance reason, instinct and human consequence.</p><p>Your private resume link is sent separately so you can safely return at any time.</p>',
 'Welcome, {{participantName}}. Your {{trackName}} Head–Heart Alignment assessment has been created securely. Your private resume link is sent separately.', 1, NOW(), NOW()),

('survey_resume_link', 'Secure resume link', 'Your private assessment resume link',
 '<h2>Your assessment is ready</h2><p>Hello {{participantName}},</p><p>Use the private button below to begin or continue your <strong>{{trackName}}</strong> assessment.</p><p><a href="{{resumeUrl}}">Open assessment</a></p><p><small>This link is personal, expires automatically and should not be forwarded.</small></p>',
 'Hello {{participantName}}. Open your private {{trackName}} assessment: {{resumeUrl}}. This link expires automatically and should not be forwarded.', 1, NOW(), NOW()),

('abandoned_reminder_1', 'Reminder 1 — gentle return', 'Your Head–Heart Alignment assessment is saved',
 '<h2>Continue when you are ready</h2><p>Hello {{participantName}},</p><p>Your <strong>{{trackName}}</strong> assessment has been saved securely. You can return to the exact point where you stopped.</p><p><a href="{{resumeUrl}}">Resume assessment</a></p>',
 'Hello {{participantName}}. Your {{trackName}} assessment is saved. Resume securely: {{resumeUrl}}', 1, NOW(), NOW()),

('abandoned_reminder_2', 'Reminder 2 — progress reminder', 'A gentle reminder to complete your reflection',
 '<h2>Your reflection is still waiting</h2><p>Hello {{participantName}},</p><p>You can still complete your <strong>{{trackName}}</strong> assessment using your private link.</p><p><a href="{{resumeUrl}}">Continue assessment</a></p><p>Completing the remaining questions will unlock your Lite Report immediately.</p>',
 'Hello {{participantName}}. Continue your saved {{trackName}} assessment: {{resumeUrl}}', 1, NOW(), NOW()),

('abandoned_reminder_3', 'Reminder 3 — final reminder', 'Final reminder before your assessment link expires',
 '<h2>Final reminder</h2><p>Hello {{participantName}},</p><p>Your private <strong>{{trackName}}</strong> resume link will expire soon.</p><p><a href="{{resumeUrl}}">Finish assessment</a></p><p>No action is required if you no longer wish to continue.</p>',
 'Hello {{participantName}}. Final reminder: finish your {{trackName}} assessment before the private link expires: {{resumeUrl}}', 1, NOW(), NOW()),

('assessment_completed', 'Assessment completed', 'You completed your Head–Heart Alignment assessment',
 '<h2>Assessment complete</h2><p>Hello {{participantName}},</p><p>You have completed your <strong>{{trackName}}</strong> assessment.</p><p>Your Lite Report is ready and provides a clear starting point for reflection and development.</p>',
 'Hello {{participantName}}. You completed your {{trackName}} assessment. Your Lite Report is ready.', 1, NOW(), NOW()),

('free_report_ready', 'Lite Report ready', 'Your Head–Heart Alignment Lite Report is ready',
 '<h2>Your Lite Report is ready</h2><p>Hello {{participantName}},</p><p>Open your private report using the button below.</p><p><a href="{{reportUrl}}">View Lite Report</a></p><p><small>The link is private and expires automatically.</small></p>',
 'Hello {{participantName}}. View your private Lite Report: {{reportUrl}}. The link expires automatically.', 1, NOW(), NOW()),

('checkout_started', 'Full Report checkout started', 'Complete your Head–Heart Alignment Full Report upgrade',
 '<h2>Your Full Report upgrade is waiting</h2><p>Hello {{participantName}},</p><p>Complete your secure checkout to unlock the detailed Full Report.</p><p><a href="{{paymentUrl}}">Complete secure payment</a></p>',
 'Hello {{participantName}}. Complete your secure Full Report payment: {{paymentUrl}}', 1, NOW(), NOW()),

('payment_successful', 'Payment successful', 'Payment received for your Full Report',
 '<h2>Payment received</h2><p>Hello {{participantName}},</p><p>Thank you. Your payment for the <strong>{{trackName}} Full Report</strong> has been verified.</p><p>Your secure report link will be sent as soon as report generation is complete.</p>',
 'Hello {{participantName}}. Payment for your {{trackName}} Full Report has been verified. Your secure report link will follow.', 1, NOW(), NOW()),

('payment_failed', 'Payment failed', 'Your Head–Heart Alignment payment was not completed',
 '<h2>Payment was not completed</h2><p>Hello {{participantName}},</p><p>No charge was confirmed and your Full Report remains locked.</p><p>You may return to your private report page and try again when convenient.</p>',
 'Hello {{participantName}}. Your payment was not completed and no Full Report was unlocked.', 1, NOW(), NOW()),

('paid_report_ready', 'Full Report ready', 'Your complete Head–Heart Alignment report is ready',
 '<h2>Your Full Report is ready</h2><p>Hello {{participantName}},</p><p>Your detailed <strong>{{trackName}} Full Report</strong> is now available.</p><p><a href="{{reportUrl}}">Open Full Report</a></p><p><small>The link is private, expiring and should not be forwarded.</small></p>',
 'Hello {{participantName}}. Your {{trackName}} Full Report is ready: {{reportUrl}}. The link is private and expires automatically.', 1, NOW(), NOW()),

('report_link_resent', 'Report link resent', 'Your private Head–Heart Alignment report link',
 '<h2>Your report link has been refreshed</h2><p>Hello {{participantName}},</p><p>A new private report link has been created. Any older link may no longer work.</p><p><a href="{{reportUrl}}">Open report</a></p>',
 'Hello {{participantName}}. Your refreshed private report link is: {{reportUrl}}', 1, NOW(), NOW()),

('password_reset', 'Administrator password reset', 'Reset your Head–Heart Alignment admin password',
 '<h2>Reset your administrator password</h2><p>Hello {{adminName}},</p><p>A password reset was requested for your administration account.</p><p><a href="{{resetUrl}}">Reset password</a></p><p><small>This secure link expires automatically. Ignore this message if you did not request the reset.</small></p>',
 'Hello {{adminName}}. Reset your administrator password: {{resetUrl}}. Ignore this message if you did not request it.', 1, NOW(), NOW()),

('admin_test', 'Admin test email', 'Atom Global email configuration test',
 '<h2>Email delivery is connected</h2><p>{{message}}</p><p>This confirms that the Head–Heart Alignment email queue and provider credentials can deliver a branded message.</p>',
 '{{message}} This confirms that the Head–Heart Alignment email queue and provider credentials can deliver a branded message.', 1, NOW(), NOW()),

('admin_notification', 'Administrator alert', 'Head–Heart Alignment administration alert',
 '<h2>Administration alert</h2><p>{{message}}</p><p>Sign in to the secure administration portal to review the event and related audit history.</p>',
 'Head–Heart Alignment administration alert: {{message}}', 1, NOW(), NOW()),

('privacy_request_received', 'Privacy request received', 'Your privacy request has been received',
 '<h2>Privacy request received</h2><p>Hello {{participantName}},</p><p>Atom Global has received your request and will process it according to the applicable privacy and retention policy.</p>',
 'Hello {{participantName}}. Atom Global has received your privacy request and will process it according to the applicable policy.', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  template_name = VALUES(template_name),
  subject = VALUES(subject),
  html_body = VALUES(html_body),
  text_body = VALUES(text_body),
  is_active = VALUES(is_active),
  updated_at = NOW();
