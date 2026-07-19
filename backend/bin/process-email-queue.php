#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__) . '/src/bootstrap.php';
$db = $container['db'];
$queue = $container['mailQueue'];
$delivery = $container['mailDelivery'];
$limit = max(1, min(100, (int) ($argv[1] ?? 25)));
$items = $queue->due($limit);

foreach ($items as $item) {
    $id = (int) $item['id'];
    $db->execute('UPDATE email_queue SET status = ?, attempts = attempts + 1 WHERE id = ? AND status IN (?, ?)', ['retry', $id, 'queued', 'retry']);
    try {
        $messageId = $delivery->deliver($item);
        $db->transaction(function () use ($db, $item, $id, $messageId) {
            $db->execute('UPDATE email_queue SET status = ?, sent_at = NOW(), provider_message_id = ?, failure_reason = NULL WHERE id = ?', ['sent', $messageId, $id]);
            $db->execute('INSERT INTO email_logs (email_queue_id, recipient_email, template_key, status, provider_message_id, sent_at, created_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [$id, $item['recipient_email'], $item['template_key'], 'sent', $messageId]);
        });
        echo "Sent queue item {$id}\n";
    } catch (Throwable $error) {
        $attempts = (int) $item['attempts'] + 1;
        $final = $attempts >= (int) $item['max_attempts'];
        $status = $final ? 'failed' : 'retry';
        $delayMinutes = min(720, 5 * (2 ** min(7, $attempts)));
        $db->transaction(function () use ($db, $item, $id, $status, $delayMinutes, $error) {
            $db->execute('UPDATE email_queue SET status = ?, scheduled_at = DATE_ADD(NOW(), INTERVAL ? MINUTE), failure_reason = ? WHERE id = ?', [$status, $delayMinutes, mb_substr($error->getMessage(), 0, 2000), $id]);
            $db->execute('INSERT INTO email_logs (email_queue_id, recipient_email, template_key, status, failure_reason, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [$id, $item['recipient_email'], $item['template_key'], $status, mb_substr($error->getMessage(), 0, 2000)]);
            if ($status === 'failed') {
                $db->execute('INSERT INTO notification_events (event_key, severity, entity_type, entity_id, title, message, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', ['email_failed', 'critical', 'email_queue', (string) $id, 'Email delivery failed', mb_substr($error->getMessage(), 0, 2000)]);
            }
        });
        fwrite(STDERR, "Queue item {$id} failed: {$error->getMessage()}\n");
    }
}

echo 'Processed ' . count($items) . " email queue item(s).\n";
