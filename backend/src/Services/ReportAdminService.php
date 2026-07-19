<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;
use AtomGlobal\Mail\MailQueue;

final class ReportAdminService
{
    public function __construct(
        private Database $db,
        private ReportService $reports,
        private PdfService $pdf,
        private MailQueue $mailQueue,
        private array $config,
    ) {}

    public function unlock(int $reportId, int $adminId): void
    {
        $row = $this->report($reportId);
        $this->reports->unlockBySession((int) $row['survey_session_id'], 'admin_manual');
        $this->audit($adminId, 'report.unlocked', $reportId);
    }

    public function lock(int $reportId, int $adminId): void
    {
        $this->report($reportId);
        $this->db->execute('UPDATE generated_reports SET is_unlocked = 0, unlock_reason = ?, unlocked_at = NULL, updated_at = NOW() WHERE id = ?', ['admin_manual_lock', $reportId]);
        $this->audit($adminId, 'report.locked', $reportId);
    }

    public function revoke(int $reportId, int $adminId): void
    {
        $this->report($reportId);
        $this->db->transaction(function () use ($reportId, $adminId) {
            $this->db->execute('UPDATE generated_reports SET revoked_at = NOW(), updated_at = NOW() WHERE id = ?', [$reportId]);
            $this->db->execute('UPDATE secure_report_tokens SET revoked_at = NOW() WHERE generated_report_id = ?', [$reportId]);
            $this->audit($adminId, 'report.revoked', $reportId);
        });
    }

    public function resend(int $reportId, int $adminId): array
    {
        $row = $this->report($reportId);
        $token = bin2hex(random_bytes(32));
        $days = max(1, (int) ($this->config['report_token_days'] ?? 30));
        $this->db->transaction(function () use ($row, $reportId, $adminId, $token, $days) {
            $this->db->execute('UPDATE secure_report_tokens SET revoked_at = NOW() WHERE generated_report_id = ? AND revoked_at IS NULL', [$reportId]);
            $this->db->execute('INSERT INTO secure_report_tokens (generated_report_id, token_hash, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), NOW())', [$reportId, hash('sha256', $token), $days]);
            $this->db->execute('UPDATE generated_reports SET secure_token_hash = ?, token_expires_at = DATE_ADD(NOW(), INTERVAL ? DAY), revoked_at = NULL, updated_at = NOW() WHERE id = ?', [hash('sha256', $token), $days, $reportId]);
            $this->audit($adminId, 'report.token_rotated', $reportId);
        });
        $reportUrl = rtrim((string) $this->config['url'], '/') . '/report/' . rawurlencode($token);
        $queueId = $this->mailQueue->enqueue($row['is_unlocked'] ? 'paid_report_ready' : 'free_report_ready', $row['email'], [
            'participantName' => $row['name'],
            'trackName' => $row['track_name'],
            'reportUrl' => $reportUrl,
            'pdfAvailable' => (bool) $row['pdf_path'],
        ]);
        $this->db->execute('INSERT INTO report_delivery_log (generated_report_id, delivery_type, recipient_email, email_queue_id, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [$reportId, 'admin_resend', $row['email'], $queueId, 'queued', $adminId]);
        return ['queueId' => $queueId, 'reportUrl' => $reportUrl];
    }

    public function regeneratePdf(int $reportId, int $adminId): string
    {
        $this->report($reportId);
        $path = $this->pdf->generate($reportId);
        $this->audit($adminId, 'report.pdf_regenerated', $reportId);
        return $path;
    }

    private function report(int $id): array
    {
        $row = $this->db->fetch('SELECT gr.*, p.name, p.email, t.name track_name FROM generated_reports gr JOIN survey_sessions s ON s.id = gr.survey_session_id JOIN participants p ON p.id = s.participant_id JOIN assessment_tracks t ON t.id = s.track_id WHERE gr.id = ?', [$id]);
        if (!$row) throw new \RuntimeException('Report not found.', 404);
        return $row;
    }

    private function audit(int $adminId, string $action, int $reportId): void
    {
        $this->db->execute('INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, NOW())', [$adminId, $action, 'generated_report', (string) $reportId]);
    }
}
