<?php
declare(strict_types=1);

namespace AtomGlobal\Payments;

use AtomGlobal\Database;
use AtomGlobal\Services\ReportService;
use AtomGlobal\Services\SettingsService;

final class UatPaymentService
{
    private const SETTING_KEY = 'system.uat_no_payment_enabled';

    public function __construct(
        private Database $db,
        private SettingsService $settings,
        private ReportService $reports,
        private array $config,
    ) {}

    public function enabled(): bool
    {
        $value = $this->settings->get(self::SETTING_KEY, false);
        if (is_bool($value)) return $value;
        return in_array(strtolower(trim((string) $value)), ['1', 'true', 'yes', 'on'], true);
    }

    public function setEnabled(bool $enabled, int $adminId): array
    {
        $this->settings->set(self::SETTING_KEY, $enabled);
        $this->db->execute(
            'INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, after_json, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [$adminId, 'payment.uat_no_payment_toggle', 'settings', self::SETTING_KEY, json_encode(['enabled' => $enabled])]
        );
        return ['enabled' => $enabled];
    }

    public function checkout(int $sessionId, string $trackKey): array
    {
        if (!$this->enabled()) throw new \RuntimeException('UAT no-payment checkout is disabled.', 403);

        $survey = $this->db->fetch(
            'SELECT s.id, s.status, s.affiliate_id, p.name, p.email, t.track_key, t.name track_name, t.currency '
            . 'FROM survey_sessions s JOIN participants p ON p.id = s.participant_id JOIN assessment_tracks t ON t.id = s.track_id '
            . 'WHERE s.id = ? AND t.track_key = ?',
            [$sessionId, $trackKey]
        );
        if (!$survey || $survey['status'] !== 'completed') throw new \InvalidArgumentException('A completed assessment is required before UAT checkout.');

        $report = $this->db->fetch('SELECT id FROM generated_reports WHERE survey_session_id = ? AND revoked_at IS NULL', [$sessionId]);
        if (!$report) throw new \InvalidArgumentException('The report is not available for UAT checkout.');

        return $this->db->transaction(function () use ($survey, $report, $sessionId) {
            $existing = $this->db->fetch(
                'SELECT id FROM payments WHERE survey_session_id = ? AND provider = ? AND status = ? ORDER BY id DESC LIMIT 1 FOR UPDATE',
                [$sessionId, 'uat_no_payment', 'manual']
            );
            $paymentId = $existing ? (int) $existing['id'] : $this->db->insert(
                'INSERT INTO payments (survey_session_id, affiliate_id, provider, status, amount, currency, metadata_json, paid_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())',
                [$sessionId, $survey['affiliate_id'] ?: null, 'uat_no_payment', 'manual', 0, strtoupper((string) $survey['currency']), json_encode(['uat' => true, 'no_payment' => true])]
            );

            $this->reports->unlockBySession($sessionId, 'uat_no_payment');
            $access = $this->rotateReportAccess((int) $report['id']);

            $this->db->execute(
                'INSERT INTO email_queue (template_key, recipient_email, variables_json, status, attempts, scheduled_at, created_at) VALUES (?, ?, ?, ?, 0, NOW(), NOW())',
                ['paid_report_ready', strtolower((string) $survey['email']), json_encode([
                    'participantName' => $survey['name'],
                    'trackName' => $survey['track_name'],
                    'reportUrl' => $access['reportUrl'],
                    'paidReportUrl' => $access['reportUrl'],
                    'paymentMethod' => 'UAT no-payment test',
                    'amount' => '0.00',
                    'currency' => strtoupper((string) $survey['currency']),
                ]), 'queued']
            );
            $this->db->execute(
                'INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, after_json, created_at) VALUES (NULL, ?, ?, ?, ?, NOW())',
                ['payment.uat_no_payment', 'payment', (string) $paymentId, json_encode(['surveySessionId' => $sessionId, 'reportId' => $report['id']])]
            );

            return ['enabled' => true, 'paymentId' => $paymentId, ...$access];
        });
    }

    private function rotateReportAccess(int $reportId): array
    {
        $token = bin2hex(random_bytes(32));
        $days = max(1, (int) ($this->config['report_token_days'] ?? 30));
        $this->db->execute('UPDATE secure_report_tokens SET revoked_at = NOW() WHERE generated_report_id = ? AND revoked_at IS NULL', [$reportId]);
        $this->db->execute('INSERT INTO secure_report_tokens (generated_report_id, token_hash, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), NOW())', [$reportId, hash('sha256', $token), $days]);
        $this->db->execute('UPDATE generated_reports SET secure_token_hash = ?, token_expires_at = DATE_ADD(NOW(), INTERVAL ? DAY), revoked_at = NULL, updated_at = NOW() WHERE id = ?', [hash('sha256', $token), $days, $reportId]);
        return [
            'reportId' => $reportId,
            'reportUrl' => rtrim((string) $this->config['url'], '/') . '/report/' . rawurlencode($token),
        ];
    }
}
