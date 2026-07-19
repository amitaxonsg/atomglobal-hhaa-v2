#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__) . '/src/bootstrap.php';
$db = $container['db'];
$privacy = $container['privacy'];
$policies = $db->fetchAll('SELECT * FROM retention_policies WHERE is_active = 1 ORDER BY policy_key');

foreach ($policies as $policy) {
    $days = max(1, (int) $policy['retention_days']);
    $count = 0;
    switch ($policy['policy_key']) {
        case 'incomplete_assessments':
            $rows = $db->fetchAll('SELECT DISTINCT participant_id FROM survey_sessions WHERE status IN (?, ?) AND last_activity_at < DATE_SUB(NOW(), INTERVAL ? DAY) LIMIT 500', ['in_progress','expired',$days]);
            foreach ($rows as $row) { $privacy->anonymise((int) $row['participant_id'], 0); $count++; }
            break;
        case 'email_logs':
            $count = $db->execute('DELETE FROM email_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [$days]);
            break;
        case 'analytics_events':
            $count = $db->execute('DELETE FROM analytics_events WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [$days]);
            break;
        case 'audit_logs':
            // Audit records are retained; old before/after payloads are minimised instead of deleting accountability.
            $count = $db->execute('UPDATE audit_logs SET before_json = NULL, after_json = NULL WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY) AND (before_json IS NOT NULL OR after_json IS NOT NULL)', [$days]);
            break;
        case 'completed_assessments':
            $count = $db->execute('UPDATE participants p JOIN survey_sessions s ON s.participant_id = p.id SET p.internal_notes = NULL, p.updated_at = NOW() WHERE s.status = ? AND s.completed_at < DATE_SUB(NOW(), INTERVAL ? DAY) AND p.internal_notes IS NOT NULL', ['completed', $days]);
            break;
    }
    $db->execute('UPDATE retention_policies SET last_run_at = NOW() WHERE id = ?', [$policy['id']]);
    echo $policy['policy_key'] . ': ' . $count . " record(s) processed.\n";
}
