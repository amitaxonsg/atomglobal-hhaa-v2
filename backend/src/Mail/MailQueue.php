<?php
declare(strict_types=1);

namespace AtomGlobal\Mail;

use AtomGlobal\Database;

final class MailQueue
{
    public function __construct(private Database $db) {}
    public function enqueue(string $templateKey, string $recipient, array $variables, ?string $scheduledAt = null): int { return $this->db->insert('INSERT INTO email_queue (template_key, recipient_email, variables_json, status, attempts, scheduled_at, created_at) VALUES (?, ?, ?, ?, 0, COALESCE(?, NOW()), NOW())', [$templateKey, strtolower($recipient), json_encode($variables), 'queued', $scheduledAt]); }
    public function due(int $limit = 25): array { return $this->db->fetchAll('SELECT * FROM email_queue WHERE status IN (?, ?) AND scheduled_at <= NOW() AND attempts < max_attempts ORDER BY scheduled_at LIMIT ' . max(1, min(100, $limit)), ['queued', 'retry']); }
}
