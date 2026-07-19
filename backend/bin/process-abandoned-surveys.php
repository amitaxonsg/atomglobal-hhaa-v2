#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__) . '/src/bootstrap.php';
$db = $container['db'];
$mailQueue = $container['mailQueue'];
$config = $container['config'];
$settings = $container['settings'];
$hours = $settings->get('email.reminder_hours', [24, 72, 168]);
if (!is_array($hours) || !$hours) $hours = [24, 72, 168];

foreach (array_values($hours) as $index => $inactiveHours) {
    $reminderNumber = $index + 1;
    $templateKey = 'abandoned_reminder_' . $reminderNumber;
    $sessions = $db->fetchAll(
        'SELECT s.id, s.resume_expires_at, p.name, p.email, t.name track_name FROM survey_sessions s JOIN participants p ON p.id = s.participant_id JOIN assessment_tracks t ON t.id = s.track_id WHERE s.status = ? AND s.reminders_suppressed = 0 AND p.suppressed_at IS NULL AND p.hard_bounced_at IS NULL AND s.last_activity_at <= DATE_SUB(NOW(), INTERVAL ? HOUR) AND s.resume_expires_at > NOW() AND NOT EXISTS (SELECT 1 FROM abandoned_survey_events e WHERE e.survey_session_id = s.id AND e.reminder_number = ?)',
        ['in_progress', (int) $inactiveHours, $reminderNumber]
    );

    foreach ($sessions as $session) {
        // A fresh secure token is generated so old links can be revoked independently.
        $token = bin2hex(random_bytes(32));
        $db->execute('UPDATE survey_sessions SET resume_token_hash = ?, resume_expires_at = DATE_ADD(NOW(), INTERVAL ? HOUR), reminders_sent = GREATEST(reminders_sent, ?), updated_at = NOW() WHERE id = ?', [hash('sha256', $token), (int) ($config['resume_token_hours'] ?? 168), $reminderNumber, $session['id']]);
        $resumeUrl = rtrim((string) $config['url'], '/') . '/?resume=' . rawurlencode($token);
        $queueId = $mailQueue->enqueue($templateKey, $session['email'], [
            'participantName' => $session['name'],
            'trackName' => $session['track_name'],
            'resumeUrl' => $resumeUrl,
            'reminderNumber' => $reminderNumber,
        ]);
        $db->execute('INSERT INTO abandoned_survey_events (survey_session_id, reminder_number, email_queue_id, status, scheduled_at, created_at) VALUES (?, ?, ?, ?, NOW(), NOW())', [$session['id'], $reminderNumber, $queueId, 'queued']);
        echo "Queued reminder {$reminderNumber} for session {$session['id']}\n";
    }
}

$settings->set('system.cron_last_run', gmdate(DATE_ATOM));
echo "Abandoned survey scheduling complete.\n";
