<?php
declare(strict_types=1);

namespace AtomGlobal\Affiliates;

use AtomGlobal\Database;

final class AffiliateService
{
    public function __construct(private Database $db) {}
    public function capture(string $code, array $campaign, string $ip, string $userAgent): ?array
    {
        $affiliate = $this->db->fetch('SELECT * FROM affiliates WHERE affiliate_code = ? AND is_active = 1', [$code]);
        if (!$affiliate) return null;
        $clickId = $this->db->insert('INSERT INTO affiliate_clicks (affiliate_id, ip_hash, user_agent_hash, landing_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())', [$affiliate['id'], hash('sha256', $ip), hash('sha256', $userAgent), $campaign['landing_page'] ?? '/', $campaign['utm_source'] ?? null, $campaign['utm_medium'] ?? null, $campaign['utm_campaign'] ?? null, $campaign['utm_content'] ?? null, $campaign['utm_term'] ?? null]);
        return ['affiliateId' => (int) $affiliate['id'], 'clickId' => $clickId, 'expiresAt' => gmdate(DATE_ATOM, time() + ((int) $affiliate['cookie_duration_days'] * 86400))];
    }
    public function attribute(int $affiliateId, int $sessionId, ?int $participantId, int $firstClickId, int $lastClickId, string $participantEmail, ?string $affiliateEmail): void
    {
        $selfReferral = $affiliateEmail && strtolower($participantEmail) === strtolower($affiliateEmail);
        $this->db->execute('INSERT IGNORE INTO affiliate_attributions (affiliate_id, participant_id, survey_session_id, first_click_id, last_click_id, referral_at, self_referral_flag) VALUES (?, ?, ?, ?, ?, NOW(), ?)', [$affiliateId, $participantId, $sessionId, $firstClickId, $lastClickId, $selfReferral ? 1 : 0]);
    }
    public function commission(int $paymentId, int $sessionId, int $affiliateId, int $paymentAmount, string $currency): void
    {
        $affiliate = $this->db->fetch('SELECT commission_type, commission_value FROM affiliates WHERE id = ? AND is_active = 1', [$affiliateId]); if (!$affiliate) return;
        $amount = $affiliate['commission_type'] === 'percentage' ? (int) round($paymentAmount * (float) $affiliate['commission_value'] / 100) : (int) round((float) $affiliate['commission_value'] * 100);
        $this->db->execute('INSERT IGNORE INTO affiliate_commissions (affiliate_id, payment_id, survey_session_id, amount_minor, currency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', [$affiliateId, $paymentId, $sessionId, $amount, strtoupper($currency), 'pending']);
    }
}
