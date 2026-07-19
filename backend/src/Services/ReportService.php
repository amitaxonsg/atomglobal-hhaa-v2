<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;

final class ReportService
{
    public function __construct(private Database $db, private array $config) {}

    public function generate(int $sessionId, int $scoreId, array $score, array $snapshot): array
    {
        $token = bin2hex(random_bytes(32));
        $profile = $score['profile'];
        $free = ['profile' => $profile['profile_name'], 'total' => $score['total'], 'summary' => json_decode($profile['free_content_json'], true), 'subscales' => $score['subscales']];
        $paid = ['profile' => $profile['profile_name'], 'total' => $score['total'], 'content' => json_decode($profile['paid_content_json'], true), 'subscales' => $score['subscales']];
        $id = $this->db->insert(
            'INSERT INTO generated_reports (survey_session_id, score_snapshot_id, secure_token_hash, token_expires_at, is_unlocked, free_report_json, paid_report_json, created_at, updated_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), 0, ?, ?, NOW(), NOW())',
            [$sessionId, $scoreId, hash('sha256', $token), $this->config['report_token_days'], json_encode($free), json_encode($paid)]
        );
        $this->db->execute('INSERT INTO secure_report_tokens (generated_report_id, token_hash, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), NOW())', [$id, hash('sha256', $token), $this->config['report_token_days']]);
        return ['id' => $id, 'token' => $token];
    }

    public function byToken(string $token): ?array
    {
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) return null;
        $row = $this->db->fetch(
            'SELECT id, is_unlocked, free_report_json, IF(is_unlocked = 1, paid_report_json, NULL) paid_report_json, token_expires_at, (pdf_path IS NOT NULL) pdf_available, pdf_generated_at FROM generated_reports WHERE secure_token_hash = ? AND revoked_at IS NULL AND token_expires_at > NOW()',
            [hash('sha256', $token)]
        );
        if ($row) {
            $row['is_unlocked'] = (bool) $row['is_unlocked'];
            $row['pdf_available'] = (bool) $row['pdf_available'];
            $this->db->execute('UPDATE generated_reports SET view_count = view_count + 1, last_viewed_at = NOW() WHERE id = ?', [$row['id']]);
        }
        return $row;
    }

    public function pdfByToken(string $token): ?string
    {
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) return null;
        $row = $this->db->fetch('SELECT pdf_path FROM generated_reports WHERE secure_token_hash = ? AND revoked_at IS NULL AND token_expires_at > NOW() AND pdf_path IS NOT NULL', [hash('sha256', $token)]);
        $path = $row['pdf_path'] ?? null;
        return $path && is_file($path) ? $path : null;
    }

    public function unlockBySession(int $sessionId, string $reason): void
    {
        $this->db->execute('UPDATE generated_reports SET is_unlocked = 1, unlocked_at = NOW(), unlock_reason = ?, updated_at = NOW() WHERE survey_session_id = ?', [$reason, $sessionId]);
    }
}
