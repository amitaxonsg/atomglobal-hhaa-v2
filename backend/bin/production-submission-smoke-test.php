#!/usr/bin/env php
<?php
declare(strict_types=1);

/**
 * Guarded end-to-end production smoke test.
 *
 * Creates one temporary participant and assessment session, saves 50 answers,
 * completes scoring/report generation, verifies Admin visibility and queued
 * participant emails, optionally sends those emails, and removes every test
 * database record before exiting.
 *
 * Usage:
 *   php backend/bin/production-submission-smoke-test.php \
 *     --recipient=amit@example.com \
 *     --track=personal \
 *     --confirm=RUN-PRODUCTION-SUBMISSION-SMOKE
 *
 * Add --send-email to deliver the four participant-flow messages. Without that
 * flag the script verifies queue creation and rendering prerequisites only.
 */

const CONFIRMATION = 'RUN-PRODUCTION-SUBMISSION-SMOKE';
const TRACKS = ['personal', 'newjoiner', 'manager', 'executive'];
const EXPECTED_TEMPLATES = [
    'participant_registration',
    'survey_resume_link',
    'assessment_completed',
    'free_report_ready',
];

$options = getopt('', ['recipient:', 'track::', 'send-email', 'confirm:']);
$recipient = strtolower(trim((string) ($options['recipient'] ?? '')));
$trackKey = strtolower(trim((string) ($options['track'] ?? 'personal')));
$sendEmail = array_key_exists('send-email', $options);
$confirmation = (string) ($options['confirm'] ?? '');

if ($confirmation !== CONFIRMATION) {
    fwrite(STDERR, "Refusing to create a production smoke-test submission. Re-run with --confirm=" . CONFIRMATION . "\n");
    exit(64);
}
if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "A valid --recipient email address is required.\n");
    exit(64);
}
if (!in_array($trackKey, TRACKS, true)) {
    fwrite(STDERR, "Unknown --track. Choose: " . implode(', ', TRACKS) . "\n");
    exit(64);
}

$container = require dirname(__DIR__) . '/src/bootstrap.php';
$db = $container['db'];
$surveys = $container['surveys'];
$admin = $container['admin'];
$delivery = $container['mailDelivery'];

$existing = $db->fetch(
    'SELECT id FROM participants WHERE email_normalized = ? AND anonymised_at IS NULL LIMIT 1',
    [$recipient]
);
if ($existing) {
    fwrite(STDERR, "Refusing to use an email already present in participants. Use a clean test recipient or remove the existing test record first.\n");
    exit(65);
}

$stamp = gmdate('Ymd-His');
$name = 'Production Audit ' . $stamp;
$beforeQueueId = (int) (($db->fetch('SELECT COALESCE(MAX(id), 0) id FROM email_queue')['id'] ?? 0));
$sessionId = null;
$participantId = null;
$reportId = null;
$queueIds = [];
$pdfPath = null;
$failure = null;

function assertSmoke(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
    echo "PASS: {$message}\n";
}

function marks(array $values): string
{
    return implode(',', array_fill(0, count($values), '?'));
}

function cleanupSmoke(
    object $db,
    ?int $sessionId,
    ?int $participantId,
    array $queueIds,
    ?string $pdfPath
): void {
    if (!$sessionId && !$participantId && !$queueIds) return;

    $db->transaction(function () use ($db, $sessionId, $participantId, $queueIds): void {
        if ($queueIds) {
            $placeholders = marks($queueIds);
            $db->execute("DELETE FROM notification_events WHERE entity_type = 'email_queue' AND entity_id IN ({$placeholders})", array_map('strval', $queueIds));
            $db->execute("DELETE FROM email_logs WHERE email_queue_id IN ({$placeholders})", $queueIds);
            $db->execute("DELETE FROM email_queue WHERE id IN ({$placeholders})", $queueIds);
        }

        if ($sessionId) {
            $db->execute(
                'DELETE rdl FROM report_delivery_log rdl JOIN generated_reports gr ON gr.id = rdl.generated_report_id WHERE gr.survey_session_id = ?',
                [$sessionId]
            );
            $db->execute(
                'DELETE srt FROM secure_report_tokens srt JOIN generated_reports gr ON gr.id = srt.generated_report_id WHERE gr.survey_session_id = ?',
                [$sessionId]
            );
            foreach (['affiliate_commissions', 'generated_reports', 'score_snapshots', 'payments', 'affiliate_attributions', 'abandoned_survey_events', 'survey_answers', 'analytics_events', 'consent_logs'] as $table) {
                $db->execute("DELETE FROM {$table} WHERE survey_session_id = ?", [$sessionId]);
            }
            $db->execute('DELETE FROM survey_sessions WHERE id = ?', [$sessionId]);
            $db->execute("DELETE FROM audit_logs WHERE entity_type = 'survey_session' AND entity_id = ?", [(string) $sessionId]);
        }

        if ($participantId) {
            $db->execute('DELETE FROM consent_logs WHERE participant_id = ?', [$participantId]);
            $db->execute('DELETE FROM affiliate_attributions WHERE participant_id = ?', [$participantId]);
            $db->execute('DELETE FROM participants WHERE id = ? AND NOT EXISTS (SELECT 1 FROM survey_sessions s WHERE s.participant_id = participants.id)', [$participantId]);
            $db->execute("DELETE FROM audit_logs WHERE entity_type = 'participant' AND entity_id = ?", [(string) $participantId]);
        }
    });

    if ($pdfPath && is_file($pdfPath)) @unlink($pdfPath);
}

try {
    echo "==================================================\n";
    echo " HEAD–HEART PRODUCTION SUBMISSION SMOKE TEST\n";
    echo "==================================================\n";
    echo "Track: {$trackKey}\n";
    echo "Recipient: {$recipient}\n";
    echo 'Email delivery: ' . ($sendEmail ? 'ENABLED' : 'queue verification only') . "\n\n";

    $participant = [
        'name' => $name,
        'email' => $recipient,
        'ageRange' => '35–44',
        'gender' => 'Prefer not to say',
        'role' => $trackKey === 'personal' ? 'Individual / personal reflection' : 'Individual Contributor',
        'industry' => 'Technology',
        'region' => 'Singapore',
        'purpose' => 'Professional development',
        'tenure' => '1–2 years',
        'department' => '',
        'level' => '',
        'privacyConsent' => true,
        'transactionalConsent' => true,
        'marketingConsent' => false,
    ];

    $created = $surveys->create([
        'trackKey' => $trackKey,
        'participant' => $participant,
        'section' => 0,
        'attribution' => [
            'landingPage' => '/production-smoke-test',
            'utmSource' => 'production-audit',
            'utmMedium' => 'cli',
            'utmCampaign' => $stamp,
        ],
    ]);

    $sessionId = (int) ($created['id'] ?? 0);
    assertSmoke($sessionId > 0, 'Public submission created a survey session');
    assertSmoke(($created['assessmentVersion'] ?? '') === '2.0.0', 'New session is pinned to CMS assessment version 2.0.0');
    assertSmoke(count($created['assessment']['questions'] ?? []) === 50, 'Session response contains 50 published database questions');
    assertSmoke(count($created['assessment']['sections'] ?? []) === 10, 'Session response contains 10 published database sections');

    $sessionRow = $db->fetch('SELECT participant_id FROM survey_sessions WHERE id = ?', [$sessionId]);
    $participantId = (int) ($sessionRow['participant_id'] ?? 0);
    assertSmoke($participantId > 0, 'Participant record was stored in MariaDB');

    $answers = [];
    for ($index = 0; $index < 50; $index++) {
        $answers[] = [
            'value' => ($index % 5) + 1,
            'note' => $index === 0 ? 'Automated production smoke-test answer.' : '',
        ];
    }

    $surveys->save($sessionId, [
        'resumeToken' => (string) $created['resumeToken'],
        'participant' => $participant,
        'answers' => $answers,
        'section' => 9,
    ]);

    $answerCount = (int) (($db->fetch('SELECT COUNT(*) count FROM survey_answers WHERE survey_session_id = ?', [$sessionId])['count'] ?? 0));
    assertSmoke($answerCount === 50, 'All 50 frontend answer payloads were persisted');

    $completed = $surveys->complete($sessionId, [
        'resumeToken' => (string) $created['resumeToken'],
        'participant' => $participant,
        'answers' => $answers,
        'section' => 9,
    ]);

    $reportId = (int) ($completed['reportId'] ?? 0);
    assertSmoke(($completed['status'] ?? '') === 'completed', 'Assessment completed through production service logic');
    assertSmoke($reportId > 0, 'Lite report record was generated');

    $scoreCount = (int) (($db->fetch('SELECT COUNT(*) count FROM score_snapshots WHERE survey_session_id = ?', [$sessionId])['count'] ?? 0));
    $reportRow = $db->fetch('SELECT id, pdf_path FROM generated_reports WHERE survey_session_id = ?', [$sessionId]);
    $pdfPath = $reportRow['pdf_path'] ?? null;
    assertSmoke($scoreCount === 1, 'Exactly one immutable score snapshot was generated');
    assertSmoke((int) ($reportRow['id'] ?? 0) === $reportId, 'Generated report is linked to the completed session');

    $detail = $admin->participant($participantId);
    assertSmoke(count($detail['sessions'] ?? []) === 1, 'Admin participant detail shows the submitted assessment');
    assertSmoke(count($detail['answers'] ?? []) === 50, 'Admin participant detail shows all 50 answers');
    assertSmoke(count($detail['reports'] ?? []) === 1, 'Admin participant detail shows the generated report');
    assertSmoke(count($detail['consents'] ?? []) >= 3, 'Admin participant detail shows recorded consent history');

    $queued = $db->fetchAll(
        'SELECT * FROM email_queue WHERE id > ? AND recipient_email = ? ORDER BY id',
        [$beforeQueueId, $recipient]
    );
    $queueIds = array_map(static fn(array $row): int => (int) $row['id'], $queued);
    $templateKeys = array_column($queued, 'template_key');
    sort($templateKeys);
    $expected = EXPECTED_TEMPLATES;
    sort($expected);
    assertSmoke($templateKeys === $expected, 'Registration, resume, completion and report emails were queued');

    foreach ($queued as $item) {
        $template = $db->fetch('SELECT id FROM email_templates WHERE template_key = ? AND is_active = 1', [$item['template_key']]);
        assertSmoke((bool) $template, 'Email template is active: ' . $item['template_key']);
    }

    if ($sendEmail) {
        foreach ($queued as $item) {
            $id = (int) $item['id'];
            $db->execute('UPDATE email_queue SET status = ?, attempts = attempts + 1 WHERE id = ?', ['retry', $id]);
            try {
                $messageId = $delivery->deliver($item);
                $db->transaction(function () use ($db, $item, $id, $messageId): void {
                    $db->execute('UPDATE email_queue SET status = ?, sent_at = NOW(), provider_message_id = ?, failure_reason = NULL WHERE id = ?', ['sent', $messageId, $id]);
                    $db->execute('INSERT INTO email_logs (email_queue_id, recipient_email, template_key, status, provider_message_id, sent_at, created_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [$id, $item['recipient_email'], $item['template_key'], 'sent', $messageId]);
                });
                echo 'PASS: Delivered ' . $item['template_key'] . ' as ' . $messageId . "\n";
            } catch (Throwable $error) {
                $db->execute('UPDATE email_queue SET status = ?, failure_reason = ? WHERE id = ?', ['failed', mb_substr($error->getMessage(), 0, 2000), $id]);
                throw new RuntimeException('Email delivery failed for ' . $item['template_key'] . ': ' . $error->getMessage(), 0, $error);
            }
        }
        $sentCount = (int) (($db->fetch('SELECT COUNT(*) count FROM email_queue WHERE id IN (' . marks($queueIds) . ') AND status = ?', [...$queueIds, 'sent'])['count'] ?? 0));
        assertSmoke($sentCount === count(EXPECTED_TEMPLATES), 'All four participant-flow emails were accepted by the configured provider');
    }

    echo "\nSMOKE TEST PASSED. Temporary database records will now be removed.\n";
} catch (Throwable $error) {
    $failure = $error;
    fwrite(STDERR, "\nSMOKE TEST FAILED: {$error->getMessage()}\n");
} finally {
    try {
        cleanupSmoke($db, $sessionId, $participantId, $queueIds, $pdfPath);
        echo "PASS: Temporary participant, session, answers, score, report, consent, analytics and email records removed.\n";
    } catch (Throwable $cleanupError) {
        fwrite(STDERR, "CLEANUP FAILED: {$cleanupError->getMessage()}\n");
        if (!$failure) $failure = $cleanupError;
    }
}

if ($failure) exit(2);

echo "==================================================\n";
echo " PRODUCTION SUBMISSION CHAIN: VERIFIED\n";
echo " Database left clean after smoke test\n";
echo "==================================================\n";
