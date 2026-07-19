<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;

final class ReportService
{
    public function __construct(private Database $db, private array $config) {}
    public function generate(int $sessionId, int $scoreId, array $score, array $snapshot): array
    {
        $token = bin2hex(random_bytes(32)); $profile = $score['profile'];
        $free = ['profile' => $profile['profile_name'], 'total' => $score['total'], 'summary' => json_decode($profile['free_content_json'], true), 'subscales' => $score['subscales']];
        $paid = ['profile' => $profile['profile_name'], 'total' => $score['total'], 'content' => json_decode($profile['paid_content_json'], true), 'subscales' => $score['subscales']];
        $id = $this->db->insert('INSERT INTO generated_reports (survey_session_id, score_snapshot_id, secure_token_hash, token_expires_at, is_unlocked, free_report_json, paid_report_json, created_at, updated_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), 0, ?, ?, NOW(), NOW())', [$sessionId, $scoreId, hash('sha256', $token), $this->config['report_token_days'], json_encode($free), json_encode($paid)]);
        return ['id' => $id, 'token' => $token];
    }
    public function byToken(string $token): ?array { return $this->db->fetch('SELECT id, is_unlocked, free_report_json, IF(is_unlocked = 1, paid_report_json, NULL) paid_report_json, token_expires_at FROM generated_reports WHERE secure_token_hash = ? AND revoked_at IS NULL AND token_expires_at > NOW()', [hash('sha256', $token)]); }
    public function unlockBySession(int $sessionId, string $reason): void { $this->db->execute('UPDATE generated_reports SET is_unlocked = 1, unlocked_at = NOW(), unlock_reason = ?, updated_at = NOW() WHERE survey_session_id = ?', [$reason, $sessionId]); }
}
