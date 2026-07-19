#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__) . '/src/bootstrap.php';
$db = $container['db'];
$mailQueue = $container['mailQueue'];
$events = $db->fetchAll('SELECT * FROM notification_events WHERE alert_queued_at IS NULL AND acknowledged_at IS NULL ORDER BY created_at LIMIT 100');
$recipients = $db->fetchAll('SELECT * FROM admin_alert_recipients WHERE is_active = 1 ORDER BY id');

foreach ($events as $event) {
    foreach ($recipients as $recipient) {
        $types = json_decode($recipient['alert_types_json'] ?: '[]', true) ?: [];
        if (!in_array('*', $types, true) && !in_array($event['event_key'], $types, true)) continue;
        $exists = $db->fetch('SELECT id FROM notification_deliveries WHERE notification_event_id = ? AND alert_recipient_id = ?', [$event['id'], $recipient['id']]);
        if ($exists) continue;
        $queueId = $mailQueue->enqueue('admin_alert', $recipient['email'], [
            'severity' => strtoupper($event['severity']),
            'title' => $event['title'],
            'message' => $event['message'],
            'eventKey' => $event['event_key'],
            'entityType' => $event['entity_type'] ?? 'system',
            'entityId' => $event['entity_id'] ?? '',
            'createdAt' => $event['created_at'],
        ]);
        $db->execute('INSERT INTO notification_deliveries (notification_event_id, alert_recipient_id, email_queue_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', [$event['id'], $recipient['id'], $queueId, 'queued']);
    }
    $db->execute('UPDATE notification_events SET alert_queued_at = NOW() WHERE id = ?', [$event['id']]);
}

echo 'Processed ' . count($events) . " administrator alert event(s).\n";
