<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;

final class AttributionService
{
    public function __construct(private Database $db, private array $config) {}

    public function record(array $payload): array
    {
        $code = strtoupper(trim((string) ($payload['affiliateCode'] ?? '')));
        if ($code === '') throw new \InvalidArgumentException('Affiliate code is required.');
        $affiliate = $this->db->fetch('SELECT id, affiliate_code, cookie_duration_days FROM affiliates WHERE affiliate_code = ? AND is_active = 1 LIMIT 1', [$code]);
        if (!$affiliate) throw new \RuntimeException('Affiliate code is unavailable.', 404);

        $landing = mb_substr((string) ($payload['landingPage'] ?? '/'), 0, 2000);
        $clickId = $this->db->insert(
            'INSERT INTO affiliate_clicks (affiliate_id, ip_hash, user_agent_hash, landing_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [
                $affiliate['id'],
                $this->hash($_SERVER['REMOTE_ADDR'] ?? ''),
                $this->hash($_SERVER['HTTP_USER_AGENT'] ?? ''),
                $landing,
                $this->clean($payload['utmSource'] ?? null),
                $this->clean($payload['utmMedium'] ?? null),
                $this->clean($payload['utmCampaign'] ?? null),
                $this->clean($payload['utmContent'] ?? null),
                $this->clean($payload['utmTerm'] ?? null),
            ]
        );
        $click = $this->db->fetch('SELECT click_uuid FROM affiliate_clicks WHERE id = ?', [$clickId]);
        return [
            'affiliateCode' => $affiliate['affiliate_code'],
            'clickUuid' => $click['click_uuid'],
            'cookieDurationDays' => (int) $affiliate['cookie_duration_days'],
        ];
    }

    public function resolve(string $clickUuid, int $affiliateId): ?array
    {
        if (!preg_match('/^[0-9a-f-]{36}$/i', $clickUuid)) return null;
        return $this->db->fetch('SELECT * FROM affiliate_clicks WHERE click_uuid = ? AND affiliate_id = ? LIMIT 1', [$clickUuid, $affiliateId]);
    }

    private function hash(string $value): string
    {
        return hash('sha256', $value . ($this->config['key'] ?? ''));
    }

    private function clean(mixed $value): ?string
    {
        $clean = trim((string) $value);
        return $clean === '' ? null : mb_substr($clean, 0, 200);
    }
}
