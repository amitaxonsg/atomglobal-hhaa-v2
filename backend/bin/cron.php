#!/usr/bin/env php
<?php
declare(strict_types=1);

use AtomGlobal\Mail\Mailer;

$container = require dirname(__DIR__) . '/src/bootstrap.php'; $lock = fopen($container['config']['storage'] . '/cron.lock', 'c'); if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) exit(0);
try {
    $container['settings']->set('system.cron_last_run', gmdate(DATE_ATOM));
    $container['db']->execute("INSERT INTO background_jobs (job_type, payload_json, status, available_at, created_at) SELECT 'abandoned_reminder', JSON_OBJECT('session_id', s.id), 'queued', NOW(), NOW() FROM survey_sessions s WHERE s.status = 'in_progress' AND s.reminders_suppressed = 0 AND s.last_activity_at < DATE_SUB(NOW(), INTERVAL 1 HOUR) AND NOT EXISTS (SELECT 1 FROM abandoned_survey_events e WHERE e.survey_session_id = s.id AND e.reminder_number = 1)");
    $mailer = new Mailer($container['db'], $container['settings']);
    foreach ($container['mailQueue']->due() as $job) { try { $mailer->process($job); } catch (Throwable $error) { $container['db']->execute('UPDATE email_queue SET status = IF(attempts + 1 >= max_attempts, ?, ?), attempts = attempts + 1, failure_reason = ?, scheduled_at = DATE_ADD(NOW(), INTERVAL POW(2, attempts) * 5 MINUTE) WHERE id = ?', ['failed', 'retry', substr($error->getMessage(), 0, 1000), $job['id']]); } }
} finally { flock($lock, LOCK_UN); fclose($lock); }
