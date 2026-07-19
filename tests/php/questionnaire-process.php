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

$track = $db->fetch('SELECT id, track_key FROM assessment_tracks WHERE track_key = ? LIMIT 1', ['personal']);
expectQuestionnaire((bool) $track, 'Personal track is missing.');

$ownerRole = $db->fetch('SELECT id FROM roles WHERE role_key = ?', ['owner']);
expectQuestionnaire((bool) $ownerRole, 'Owner role is missing.');
$owner = $db->fetch('SELECT id FROM admin_users WHERE email = ?', ['questionnaire-owner@example.test']);
$ownerId = $owner ? (int) $owner['id'] : $db->insert(
    'INSERT INTO admin_users (role_id, email, display_name, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
    [$ownerRole['id'], 'questionnaire-owner@example.test', 'Questionnaire Owner', password_hash('Questionnaire-Test-Password-2026!', PASSWORD_ARGON2ID)]
);

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
];

$savedExperience = $container['assessmentExperience']->save((int) $track['id'], [
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
