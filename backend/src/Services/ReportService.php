<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;

final class ReportService
{
    public function __construct(
        private Database $db,
        private SettingsService $settings,
        private array $config,
    ) {}

    public function generate(int $sessionId, int $scoreId, array $score, array $snapshot): array
    {
        $token = bin2hex(random_bytes(32));
        $profile = $score['profile'];
        $paidContent = json_decode((string) $profile['paid_content_json'], true, 512, JSON_THROW_ON_ERROR);
        $upgradePreview = $this->normaliseUpgradePreview($paidContent['upgradeReasons'] ?? []);

        $free = [
            'profile' => $profile['profile_name'],
            'total' => $score['total'],
            'summary' => json_decode((string) $profile['free_content_json'], true, 512, JSON_THROW_ON_ERROR),
            'subscales' => $score['subscales'],
            // Only the approved sales preview is exposed while the Full Report is locked.
            // The substantive paid content remains private in paid_report_json.
            'upgradePreview' => $upgradePreview,
        ];
        $paid = [
            'profile' => $profile['profile_name'],
            'total' => $score['total'],
            'content' => $paidContent,
            'subscales' => $score['subscales'],
        ];
        $id = $this->db->insert(
            'INSERT INTO generated_reports (survey_session_id, score_snapshot_id, secure_token_hash, token_expires_at, is_unlocked, free_report_json, paid_report_json, created_at, updated_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), 0, ?, ?, NOW(), NOW())',
            [$sessionId, $scoreId, hash('sha256', $token), $this->config['report_token_days'], json_encode($free), json_encode($paid)]
        );
        $this->db->execute(
            'INSERT INTO secure_report_tokens (generated_report_id, token_hash, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), NOW())',
            [$id, hash('sha256', $token), $this->config['report_token_days']]
        );
        return ['id' => $id, 'token' => $token];
    }

    public function byToken(string $token): ?array
    {
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) return null;
        $row = $this->db->fetch(
            'SELECT gr.id, gr.survey_session_id sessionId, gr.is_unlocked, gr.free_report_json, IF(gr.is_unlocked = 1, gr.paid_report_json, NULL) paid_report_json, gr.token_expires_at, (gr.is_unlocked = 1 AND gr.pdf_path IS NOT NULL) pdf_available, gr.pdf_generated_at, gr.view_count, s.completed_at completedAt, p.name participantName, p.email participantEmail, t.track_key trackKey, t.name trackName, t.price_minor priceMinor, t.currency FROM generated_reports gr JOIN survey_sessions s ON s.id = gr.survey_session_id JOIN participants p ON p.id = s.participant_id JOIN assessment_tracks t ON t.id = s.track_id WHERE gr.secure_token_hash = ? AND gr.revoked_at IS NULL AND gr.token_expires_at > NOW() LIMIT 1',
            [hash('sha256', $token)]
        );
        if ($row) {
            $row['id'] = (int) $row['id'];
            $row['sessionId'] = (int) $row['sessionId'];
            $row['is_unlocked'] = (bool) $row['is_unlocked'];
            $row['pdf_available'] = (bool) $row['pdf_available'];
            $row['priceMinor'] = (int) $row['priceMinor'];
            $row['view_count'] = (int) $row['view_count'];
            $row['checkoutAvailable'] = $this->checkoutAvailable((string) $row['trackKey']);
            $row['checkoutStatus'] = $row['checkoutAvailable'] ? 'available' : 'not_configured';
            $this->db->execute('UPDATE generated_reports SET view_count = view_count + 1, last_viewed_at = NOW() WHERE id = ?', [$row['id']]);
        }
        return $row;
    }

    public function pdfByToken(string $token): ?string
    {
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) return null;
        $row = $this->db->fetch(
            'SELECT pdf_path FROM generated_reports WHERE secure_token_hash = ? AND revoked_at IS NULL AND token_expires_at > NOW() AND is_unlocked = 1 AND pdf_path IS NOT NULL',
            [hash('sha256', $token)]
        );
        $path = $row['pdf_path'] ?? null;
        return $path && is_file($path) ? $path : null;
    }

    public function unlockBySession(int $sessionId, string $reason): void
    {
        $this->db->execute(
            'UPDATE generated_reports SET is_unlocked = 1, unlocked_at = NOW(), unlock_reason = ?, updated_at = NOW() WHERE survey_session_id = ?',
            [$reason, $sessionId]
        );
    }

    private function checkoutAvailable(string $trackKey): bool
    {
        $secret = trim((string) $this->settings->get('stripe.secret_key', $_ENV['STRIPE_SECRET_KEY'] ?? ''));
        $webhook = trim((string) $this->settings->get('stripe.webhook_secret', $_ENV['STRIPE_WEBHOOK_SECRET'] ?? ''));
        $environmentKey = 'STRIPE_PRICE_' . strtoupper($trackKey);
        $price = trim((string) $this->settings->get('stripe.price_' . $trackKey, $_ENV[$environmentKey] ?? ''));
        return $secret !== '' && $webhook !== '' && $price !== '';
    }

    private function normaliseUpgradePreview(mixed $items): array
    {
        if (!is_array($items)) return [];
        $preview = [];
        foreach ($items as $item) {
            if (is_string($item) && trim($item) !== '') {
                $preview[] = ['title' => trim($item), 'detail' => ''];
                continue;
            }
            if (!is_array($item)) continue;
            $title = trim((string) ($item['title'] ?? $item['area'] ?? ''));
            $detail = trim((string) ($item['detail'] ?? $item['summary'] ?? $item['insight'] ?? ''));
            if ($title !== '' || $detail !== '') $preview[] = ['title' => $title, 'detail' => $detail];
        }
        return array_slice($preview, 0, 8);
    }
}
