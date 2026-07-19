#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__) . '/src/bootstrap.php';
$db = $container['db'];
$pdf = $container['pdf'];
$limit = max(1, min(100, (int) ($argv[1] ?? 25)));
$rows = $db->fetchAll('SELECT id FROM generated_reports WHERE is_unlocked = 1 AND pdf_path IS NULL AND revoked_at IS NULL ORDER BY created_at LIMIT ' . $limit);

foreach ($rows as $row) {
    try {
        $path = $pdf->generate((int) $row['id']);
        echo 'Generated full report ' . $row['id'] . ': ' . $path . "\n";
    } catch (Throwable $error) {
        $db->execute('INSERT INTO notification_events (event_key, severity, entity_type, entity_id, title, message, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', ['pdf_failed', 'warning', 'generated_report', (string) $row['id'], 'PDF generation failed', mb_substr($error->getMessage(), 0, 2000)]);
        fwrite(STDERR, 'Report ' . $row['id'] . ' failed: ' . $error->getMessage() . "\n");
    }
}
