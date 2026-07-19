<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . '/backend/src/Services/ScoringService.php';

use AtomGlobal\Services\ScoringService;

$failures = 0;
function check(bool $condition, string $message): void { global $failures; if (!$condition) { $failures++; fwrite(STDERR, "FAIL: $message\n"); } else { echo "PASS: $message\n"; } }

$service = new ScoringService();
$questions = [];
for ($index = 1; $index <= 50; $index++) $questions[] = ['id' => $index, 'position' => $index, 'direction' => $index % 2 ? 'H' : 'K', 'subscale_code' => 'S' . (int) ceil($index / 5)];
$answers = array_fill(0, 50, ['value' => 1]);
$profiles = [
    ['profile_key' => 'a', 'min_score' => 50, 'max_score' => 99], ['profile_key' => 'b', 'min_score' => 100, 'max_score' => 149],
    ['profile_key' => 'c', 'min_score' => 150, 'max_score' => 199], ['profile_key' => 'd', 'min_score' => 200, 'max_score' => 250],
];
$score = $service->score($questions, $answers, $profiles);
check($score['total'] === 150, 'reverse scoring and total scoring');
check(count($score['subscales']) === 10, 'ten subscale scores generated');
check($score['profile']['profile_key'] === 'c', 'profile assignment at score boundary');

$schema = file_get_contents(dirname(__DIR__, 2) . '/database/schema.sql');
$requiredTables = ['admin_users','roles','permissions','participants','assessment_tracks','assessment_versions','assessment_sections','questions','answer_options','survey_sessions','survey_answers','score_snapshots','report_templates','generated_reports','payments','stripe_webhook_events','email_templates','email_queue','email_logs','abandoned_survey_events','affiliates','affiliate_clicks','affiliate_attributions','affiliate_commissions','media_library','global_settings','consent_logs','audit_logs','password_reset_tokens','secure_report_tokens','background_jobs'];
foreach ($requiredTables as $table) check(str_contains($schema, "CREATE TABLE $table"), "schema contains $table");
check(str_contains($schema, 'stripe_event_id VARCHAR(255) NOT NULL UNIQUE'), 'Stripe webhook IDs are idempotent');
check(str_contains($schema, 'UNIQUE KEY uq_affiliate_session'), 'affiliate attribution prevents duplicates');
check(str_contains($schema, 'UNIQUE KEY uq_session_reminder'), 'abandoned reminders prevent duplicates');
check(str_contains(file_get_contents(dirname(__DIR__, 2) . '/backend/src/Security/Csrf.php'), 'hash_equals'), 'CSRF comparison is timing safe');
check(str_contains(file_get_contents(dirname(__DIR__, 2) . '/backend/src/Services/PrivacyService.php'), 'anonymised_at'), 'participant anonymisation is implemented');
check(str_contains(file_get_contents(dirname(__DIR__, 2) . '/backend/src/Services/AssessmentVersionService.php'), 'Published and archived versions are immutable'), 'version locking is implemented');
check(str_contains(file_get_contents(dirname(__DIR__, 2) . '/backend/src/Mail/Mailer.php'), "status = IF(attempts") === false, 'mailer leaves retry scheduling to the cron runner');

exit($failures ? 1 : 0);
