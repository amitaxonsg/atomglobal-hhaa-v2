#!/usr/bin/env php
<?php
declare(strict_types=1);

if (($_ENV['APP_ENV'] ?? getenv('APP_ENV') ?: '') !== 'testing') {
    fwrite(STDERR, "Integration tests may run only with APP_ENV=testing.\n");
    exit(1);
}

session_name('hhaa_test_admin');
session_start();
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_USER_AGENT'] = 'HeadHeartIntegrationTest/1.0';

$container = require dirname(__DIR__, 2) . '/backend/src/bootstrap.php';
$db = $container['db'];

function expect(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

$ownerRole = $db->fetch('SELECT id FROM roles WHERE role_key = ?', ['owner']);
expect((bool) $ownerRole, 'Owner role is missing.');
$email = 'owner-integration@example.test';
$password = 'Integration-Test-Password-2026!';
$user = $db->fetch('SELECT id FROM admin_users WHERE email = ?', [$email]);
if (!$user) {
    $userId = $db->insert(
        'INSERT INTO admin_users (role_id, email, display_name, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
        [$ownerRole['id'], $email, 'Integration Owner', password_hash($password, PASSWORD_ARGON2ID)]
    );
} else {
    $userId = (int) $user['id'];
}

$auth = new AtomGlobal\Security\Auth($db);
$adminUser = $auth->attempt($email, $password);
expect((bool) $adminUser, 'Admin authentication failed.');
expect($adminUser['roleKey'] === 'owner', 'Owner role was not returned.');
expect(in_array('branding.manage', $adminUser['permissions'], true), 'Owner permissions are incomplete.');

$configuration = $container['admin']->publicConfiguration();
expect(($configuration['branding']['logoUrl'] ?? '') !== '', 'Published/default logo is missing.');
expect(count($configuration['tracks']) === 4, 'Four assessment tracks were not configured.');
expect(count($configuration['stages']) >= 7, 'Stage content was not seeded.');

$participant = [
    'name' => 'Integration Participant',
    'email' => 'participant-integration@example.test',
    'role' => 'Manager',
    'industry' => 'Professional services',
    'privacyConsent' => true,
    'transactionalConsent' => true,
    'marketingConsent' => false,
];
$created = $container['surveys']->create([
    'trackKey' => 'personal',
    'participant' => $participant,
    'affiliateCode' => '',
    'attribution' => ['landingPage' => '/?utm_source=integration', 'utmSource' => 'integration'],
]);
expect((int) $created['id'] > 0, 'Survey session was not created.');
expect((bool) preg_match('/^[a-f0-9]{64}$/', $created['resumeToken']), 'Resume token is not 256-bit hexadecimal.');

$answers = array_fill(0, 50, ['value' => 3, 'note' => '']);
$answers[0] = ['value' => 5, 'note' => 'Integration note'];
$saved = $container['surveys']->save((int) $created['id'], [
    'resumeToken' => $created['resumeToken'],
    'answers' => $answers,
    'section' => 9,
]);
expect((int) $saved['completionPercentage'] === 100, 'Autosave completion percentage is incorrect.');

$resumed = $container['surveys']->resume($created['resumeToken']);
expect((int) $resumed['answers'][0]['value'] === 5, 'Saved answer was not restored.');
expect($resumed['participant']['email'] === $participant['email'], 'Participant was not restored.');

$completed = $container['surveys']->complete((int) $created['id'], [
    'resumeToken' => $created['resumeToken'],
    'answers' => $answers,
    'section' => 9,
]);
expect($completed['status'] === 'completed', 'Survey did not complete.');
expect((bool) preg_match('/^[a-f0-9]{64}$/', $completed['reportToken']), 'Report token is invalid.');

$report = $container['reports']->byToken($completed['reportToken']);
expect((bool) $report, 'Secure report could not be loaded.');
expect($report['is_unlocked'] === false, 'New report should begin as Lite/locked.');
expect($report['paid_report_json'] === null, 'Paid report content leaked before unlock.');

$pdfPath = $container['pdf']->generate((int) $completed['reportId']);
expect(is_file($pdfPath) && filesize($pdfPath) > 1000, 'PDF generation failed.');
expect($container['reports']->pdfByToken($completed['reportToken']) === $pdfPath, 'Secure PDF lookup failed.');

$draftBranding = $configuration['branding'];
$draftBranding['cta'] = '#C9A15A';
$draftId = $container['admin']->saveBrandingDraft($draftBranding, $userId);
expect($draftId > 0, 'Branding draft was not saved.');
$container['admin']->publishBranding($draftId, $userId);
expect($container['settings']->get('branding.cta') === '#C9A15A', 'Published branding did not update settings.');

$queued = $db->fetch('SELECT COUNT(*) count FROM email_queue WHERE recipient_email = ?', [$participant['email']]);
expect((int) ($queued['count'] ?? 0) >= 4, 'Registration, resume, completion and report emails were not queued.');

$logs = $db->fetch('SELECT COUNT(*) count FROM audit_logs WHERE admin_user_id = ?', [$userId]);
expect((int) ($logs['count'] ?? 0) >= 1, 'Audit log was not written.');

$auth->logout();
echo "Production integration tests passed.\n";
