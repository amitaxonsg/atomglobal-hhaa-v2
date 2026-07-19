#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__, 2) . '/backend/src/bootstrap.php';
if (($container['config']['env'] ?? '') !== 'testing') {
    fwrite(STDERR, "Questionnaire process tests may run only with APP_ENV=testing.\n");
    exit(1);
}

$db = $container['db'];

function expectQuestionnaire(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

$configuration = $container['assessmentExperience']->publicConfiguration();
expectQuestionnaire(count($configuration['tracks'] ?? []) === 4, 'Questionnaire experience does not expose four tracks.');
expectQuestionnaire(($configuration['landing']['title'] ?? '') === 'Head–Heart Alignment', 'Latest questionnaire landing title is missing.');
expectQuestionnaire(str_contains((string) ($configuration['landing']['primaryCopy'] ?? ''), 'two votes'), 'Latest questionnaire landing copy is missing.');
expectQuestionnaire(($configuration['liveTrackKey'] ?? '') === 'personal', 'Default live assessment is not Personal.');

$track = $db->fetch('SELECT id, track_key FROM assessment_tracks WHERE track_key = ? LIMIT 1', ['personal']);
expectQuestionnaire((bool) $track, 'Personal track is missing.');
$managerTrack = $db->fetch('SELECT id, track_key FROM assessment_tracks WHERE track_key = ? LIMIT 1', ['manager']);
expectQuestionnaire((bool) $managerTrack, 'Manager track is missing.');

$ownerRole = $db->fetch('SELECT id FROM roles WHERE role_key = ?', ['owner']);
expectQuestionnaire((bool) $ownerRole, 'Owner role is missing.');
$owner = $db->fetch('SELECT id FROM admin_users WHERE email = ?', ['questionnaire-owner@example.test']);
$ownerId = $owner ? (int) $owner['id'] : $db->insert(
    'INSERT INTO admin_users (role_id, email, display_name, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
    [$ownerRole['id'], 'questionnaire-owner@example.test', 'Questionnaire Owner', password_hash('Questionnaire-Test-Password-2026!', PASSWORD_ARGON2ID)]
);

$savedLanding = $container['assessmentExperience']->saveLanding([
    'title' => 'Head–Heart Alignment',
    'primaryCopy' => 'Every choice you make is cast by two votes: what you feel and what you reason.',
    'secondaryCopy' => 'Answer 50 statements across 10 areas and choose the version that fits you.',
    'cardTitlePrefix' => 'Head-Heart Alignment:',
    'showBrandName' => true,
], $ownerId);
expectQuestionnaire($savedLanding['cardTitlePrefix'] === 'Head-Heart Alignment:', 'Latest landing card prefix was not saved.');
$configuration = $container['assessmentExperience']->publicConfiguration();
expectQuestionnaire(($configuration['landing']['showBrandName'] ?? false) === true, 'Latest landing logo setting was not returned publicly.');

$intake = [
    'whoLabel' => 'Which best describes your current situation? *',
    'whoOptions' => ['Working full-time', 'Self-employed / Freelance'],
    'whatLabel' => 'What area of life are you most focused on right now? *',
    'whatOptions' => ['Career & Work', 'Personal Growth & Wellbeing'],
    'whereLabel' => 'Where are you based? *',
    'whereOptions' => ['Singapore', 'Philippines'],
    'whyLabel' => 'What brings you to this assessment? *',
    'whyOptions' => ['Self-understanding', 'Curiosity'],
    'howLabel' => 'How would you describe this current chapter of your life? *',
    'howOptions' => ['Building & establishing myself', 'Reflecting & reassessing'],
    'hasCompanyFields' => false,
];

$savedExperience = $container['assessmentExperience']->save((int) $track['id'], [
    'tagline' => 'For anyone who wants to understand how they lead their own life.',
    'introBody' => 'Every choice you make is cast by two votes: what you feel and what you reason.',
    'introOffer' => 'Take the full 50-question assessment free and get your Lite Report instantly.',
    'heartLabel' => 'Heart',
    'heartDescription' => 'Feeling, intuition, connection, meaning',
    'headLabel' => 'Head',
    'headDescription' => 'Logic, analysis, control, proof',
    'intake' => $intake,
    'allowNotApplicable' => true,
    'allowAnswerNotes' => true,
], $ownerId);
expectQuestionnaire($savedExperience['allowNotApplicable'] === true, 'N/A setting was not saved.');
expectQuestionnaire(($savedExperience['intake']['whereOptions'][1] ?? '') === 'Philippines', 'CMS intake options were not saved.');
expectQuestionnaire(str_starts_with($savedExperience['tagline'], 'For anyone'), 'Track card description was not saved.');

$workIntake = [
    'whoLabel' => 'Which best describes you? *',
    'whoOptions' => ['Individual Contributor', 'People Manager', 'Senior Executive / Leadership'],
    'whatLabel' => 'What industry do you work in? *',
    'whatOptions' => ['Technology', 'Consulting'],
    'whereLabel' => 'Where are you based? *',
    'whereOptions' => ['Singapore', 'Philippines'],
    'whyLabel' => 'What brings you to this assessment? *',
    'whyOptions' => ['Personal growth / curiosity', 'Team or leadership development'],
    'howLabel' => 'How long have you been in your current role? *',
    'howOptions' => ['Less than 6 months', '3–5 years'],
    'hasCompanyFields' => true,
    'companyRoleTriggers' => ['People Manager', 'Senior Executive / Leadership'],
    'departmentLabel' => 'Department *',
    'departmentOptions' => ['Operations', 'HR / People'],
    'levelLabel' => 'Level *',
    'levelOptions' => ['Manager', 'Senior Manager / Director'],
];
$managerExperience = $container['assessmentExperience']->save((int) $managerTrack['id'], [
    'tagline' => 'For people managers — how you lead your team, not just yourself.',
    'introBody' => 'Every choice you make is cast by two votes.',
    'introOffer' => 'Take the full assessment free.',
    'heartLabel' => 'Heart',
    'heartDescription' => 'Feeling and intuition',
    'headLabel' => 'Head',
    'headDescription' => 'Logic and analysis',
    'intake' => $workIntake,
    'allowNotApplicable' => true,
    'allowAnswerNotes' => true,
], $ownerId);
expectQuestionnaire(($managerExperience['intake']['hasCompanyFields'] ?? false) === true, 'Conditional company fields were not saved.');
expectQuestionnaire(($managerExperience['intake']['departmentOptions'][0] ?? '') === 'Operations', 'Department options were not saved.');
expectQuestionnaire(($managerExperience['intake']['companyRoleTriggers'][1] ?? '') === 'Senior Executive / Leadership', 'Company role triggers were not saved.');

$liveManager = $container['assessmentExperience']->saveLiveTrack('manager', $ownerId);
expectQuestionnaire(($liveManager['liveTrackKey'] ?? '') === 'manager', 'Manager could not be selected as the single live assessment.');
$configuration = $container['assessmentExperience']->publicConfiguration();
expectQuestionnaire(($configuration['liveTrackKey'] ?? '') === 'manager', 'Public configuration did not expose the selected live assessment.');

$blockedParticipant = [
    'name' => 'Blocked Personal Start',
    'email' => 'blocked-personal@example.test',
    'privacyConsent' => true,
    'transactionalConsent' => true,
];
$blocked = false;
try {
    $container['surveys']->create(['trackKey' => 'personal', 'participant' => $blockedParticipant]);
} catch (InvalidArgumentException $error) {
    $blocked = str_contains($error->getMessage(), 'not currently open');
}
expectQuestionnaire($blocked, 'A non-live assessment incorrectly accepted a new participant.');

$livePersonal = $container['assessmentExperience']->saveLiveTrack('personal', $ownerId);
expectQuestionnaire(($livePersonal['liveTrackKey'] ?? '') === 'personal', 'Personal could not be restored as the single live assessment.');
$audit = $db->fetch('SELECT COUNT(*) count FROM audit_logs WHERE action = ?', ['assessment.live_track_changed']);
expectQuestionnaire((int) ($audit['count'] ?? 0) >= 2, 'Live assessment changes were not recorded in the audit log.');

$email = 'questionnaire-' . bin2hex(random_bytes(4)) . '@example.test';
$participant = [
    'name' => 'Questionnaire Process Test',
    'email' => $email,
    'ageRange' => '35–44',
    'gender' => 'Prefer not to say',
    'role' => 'Working full-time',
    'industry' => 'Career & Work',
    'region' => 'Philippines',
    'purpose' => 'Self-understanding',
    'tenure' => 'Reflecting & reassessing',
    'privacyConsent' => true,
    'transactionalConsent' => true,
    'marketingConsent' => false,
];

$session = $container['surveys']->create(['trackKey' => 'personal', 'participant' => $participant]);
expectQuestionnaire(count($session['assessment']['questions'] ?? []) === 50, 'Questionnaire did not return 50 published questions.');
expectQuestionnaire(count($session['assessment']['sections'] ?? []) === 10, 'Questionnaire did not return 10 sections.');

$answers = array_fill(0, 50, ['value' => 3, 'note' => '']);
$answers[7] = ['value' => 'NA', 'note' => 'This situation does not apply to the participant.'];
$container['surveys']->save((int) $session['id'], [
    'resumeToken' => $session['resumeToken'],
    'answers' => $answers,
    'section' => 9,
]);

$stored = $db->fetch('SELECT answer_value, is_not_applicable, note FROM survey_answers WHERE survey_session_id = ? AND question_position = 8', [$session['id']]);
expectQuestionnaire((int) ($stored['is_not_applicable'] ?? 0) === 1, 'N/A answer flag was not stored.');
expectQuestionnaire($stored['answer_value'] === null, 'N/A answer incorrectly stored a scored value.');
expectQuestionnaire(str_contains((string) $stored['note'], 'does not apply'), 'Optional answer note was not stored.');

$resumed = $container['surveys']->resume($session['resumeToken']);
expectQuestionnaire(($resumed['answers'][7]['value'] ?? null) === 'NA', 'N/A answer was not restored on resume.');
expectQuestionnaire(str_contains((string) ($resumed['answers'][7]['note'] ?? ''), 'does not apply'), 'Answer note was not restored on resume.');

$completed = $container['surveys']->complete((int) $session['id'], [
    'resumeToken' => $session['resumeToken'],
    'answers' => $answers,
    'section' => 9,
]);
expectQuestionnaire($completed['status'] === 'completed', 'Questionnaire with one N/A answer did not complete.');

$score = $db->fetch('SELECT total_score, answers_snapshot_json FROM score_snapshots WHERE survey_session_id = ? LIMIT 1', [$session['id']]);
expectQuestionnaire((int) ($score['total_score'] ?? 0) === 150, 'N/A answer was not excluded from normalized scoring.');
expectQuestionnaire(str_contains((string) ($score['answers_snapshot_json'] ?? ''), 'is_not_applicable'), 'N/A state was not preserved in the immutable answer snapshot.');

echo "Questionnaire process integration tests passed.\n";
