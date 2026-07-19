INSERT IGNORE INTO roles (role_key, role_name, created_at) VALUES
('owner','Owner',NOW()),('administrator','Administrator',NOW()),('content_editor','Content Editor',NOW()),('support','Support',NOW()),('marketing','Marketing',NOW()),('finance','Finance',NOW()),('read_only','Read Only',NOW());

INSERT IGNORE INTO permissions (permission_key, permission_name) VALUES
('dashboard.view','View dashboard'),('participants.manage','Manage participants'),('assessments.manage','Manage assessments'),('content.manage','Manage content'),('payments.manage','Manage payments'),('email.manage','Manage email'),('affiliates.manage','Manage affiliates'),('settings.manage','Manage settings'),('audit.view','View audit log');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id FROM roles CROSS JOIN permissions WHERE roles.role_key IN ('owner','administrator');

INSERT IGNORE INTO global_settings (setting_key, setting_value, is_encrypted, updated_at) VALUES
('reminders.enabled','true',0,NOW()),('reminders.schedule_hours','[1,24,72]',0,NOW()),('reminders.maximum','3',0,NOW()),('report.token_lifetime_days','30',0,NOW()),('privacy.retention_days','730',0,NOW()),('payments.currency','USD',0,NOW());

INSERT IGNORE INTO content_stages (stage_key, image_alt, focal_x, focal_y, overlay_strength, headline, supporting_text, is_active, display_order, updated_at) VALUES
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

INSERT IGNORE INTO email_templates (template_key, template_name, subject, html_body, text_body, is_active, created_at, updated_at) VALUES
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

INSERT IGNORE INTO seo_pages (page_key, path, page_title, meta_description, robots_setting, heading, introductory_content, faq_json, structured_data_json, include_in_sitemap, updated_at) VALUES
('home','/','Head–Heart Alignment Assessment | Atom Global Consulting','Explore how you balance logic, feeling and intuition in life and leadership.','index,follow','Head–Heart Alignment','A reflective assessment for clearer decisions, healthier relationships and more conscious leadership.','[]','{"@context":"https://schema.org","@type":"WebApplication","name":"Head–Heart Alignment"}',1,NOW()),
('admin','/admin','Administration','Private administration application.','noindex,nofollow','Administration','',NULL,NULL,0,NOW()),
('report','/report','Private report','Private participant report.','noindex,nofollow','Private report','',NULL,NULL,0,NOW()),
('payment','/payment','Secure payment','Secure assessment report payment.','noindex,nofollow','Secure payment','',NULL,NULL,0,NOW());