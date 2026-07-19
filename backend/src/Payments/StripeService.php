<?php
declare(strict_types=1);

namespace AtomGlobal\Payments;

use AtomGlobal\Database;
use AtomGlobal\Services\ReportService;
use AtomGlobal\Services\SettingsService;
use Stripe\StripeClient;
use Stripe\Webhook;

final class StripeService
{
    public function __construct(private Database $db, private SettingsService $settings, private ReportService $reports, private array $config) {}

    public function checkout(int $sessionId, string $trackKey, ?string $affiliateCode): array
    {
        $secret = $this->settings->get('stripe.secret_key', $_ENV['STRIPE_SECRET_KEY'] ?? '');
        $environmentKey = 'STRIPE_PRICE_' . strtoupper($trackKey);
        $price = $this->settings->get('stripe.price_' . $trackKey, $_ENV[$environmentKey] ?? '');
        if (!$secret || !$price) throw new \RuntimeException('Stripe test or live credentials and track price IDs are not configured.');

        $survey = $this->db->fetch('SELECT s.id, s.status, p.email, t.track_key FROM survey_sessions s JOIN participants p ON p.id = s.participant_id JOIN assessment_tracks t ON t.id = s.track_id WHERE s.id = ? AND t.track_key = ?', [$sessionId, $trackKey]);
        if (!$survey || $survey['status'] !== 'completed') throw new \InvalidArgumentException('A completed assessment is required before checkout.');
        $report = $this->db->fetch('SELECT id FROM generated_reports WHERE survey_session_id = ? AND revoked_at IS NULL', [$sessionId]);
        if (!$report) throw new \InvalidArgumentException('The report is not available for checkout.');

        $affiliate = null;
        if ($affiliateCode) $affiliate = $this->db->fetch('SELECT id, affiliate_code FROM affiliates WHERE affiliate_code = ? AND is_active = 1', [strtoupper(trim($affiliateCode))]);
        $stripe = new StripeClient($secret);
        $checkout = $stripe->checkout->sessions->create([
            'mode' => 'payment',
            'customer_email' => $survey['email'],
            'line_items' => [['price' => $price, 'quantity' => 1]],
            'allow_promotion_codes' => true,
            'success_url' => $this->config['url'] . '/payment/success?checkout={CHECKOUT_SESSION_ID}',
            'cancel_url' => $this->config['url'] . '/payment/cancelled?session=' . $sessionId,
            'metadata' => [
                'survey_session_id' => (string) $sessionId,
                'generated_report_id' => (string) $report['id'],
                'track_key' => $trackKey,
                'affiliate_code' => $affiliate['affiliate_code'] ?? '',
            ],
        ]);
        $this->db->execute(
            'INSERT INTO payments (survey_session_id, affiliate_id, provider, status, stripe_checkout_session_id, currency, metadata_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [$sessionId, $affiliate['id'] ?? null, 'stripe', 'checkout_started', $checkout->id, strtoupper((string) ($checkout->currency ?? 'USD')), json_encode($checkout->metadata)]
        );
        return ['url' => $checkout->url, 'checkoutSessionId' => $checkout->id];
    }

    public function webhook(string $payload, string $signature): void
    {
        $secret = $this->settings->get('stripe.webhook_secret', $_ENV['STRIPE_WEBHOOK_SECRET'] ?? '');
        if (!$secret) throw new \RuntimeException('Stripe webhook secret is not configured.');
        $event = Webhook::constructEvent($payload, $signature, $secret);

        $this->db->transaction(function () use ($event) {
            $exists = $this->db->fetch('SELECT id, status FROM stripe_webhook_events WHERE stripe_event_id = ? FOR UPDATE', [$event->id]);
            if ($exists && $exists['status'] === 'processed') return;
            $eventId = $exists ? (int) $exists['id'] : $this->db->insert(
                'INSERT INTO stripe_webhook_events (stripe_event_id, event_type, status, payload_json, received_at) VALUES (?, ?, ?, ?, NOW())',
                [$event->id, $event->type, 'processing', json_encode($event)]
            );

            try {
                match ($event->type) {
                    'checkout.session.completed' => $this->completed($event->data->object),
                    'checkout.session.async_payment_failed' => $this->failed($event->data->object, 'failed'),
                    'checkout.session.expired' => $this->failed($event->data->object, 'abandoned'),
                    'charge.refunded' => $this->refunded($event->data->object),
                    default => null,
                };
                $this->db->execute('UPDATE stripe_webhook_events SET status = ?, processed_at = NOW(), failure_reason = NULL WHERE id = ?', ['processed', $eventId]);
            } catch (\Throwable $error) {
                $this->db->execute('UPDATE stripe_webhook_events SET status = ?, failure_reason = ? WHERE id = ?', ['failed', mb_substr($error->getMessage(), 0, 1000), $eventId]);
                $this->db->execute('INSERT INTO notification_events (event_key, severity, entity_type, entity_id, title, message, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', ['webhook_failed', 'critical', 'stripe_webhook_event', (string) $eventId, 'Stripe webhook processing failed', mb_substr($error->getMessage(), 0, 2000)]);
                throw $error;
            }
        });
    }

    private function completed(object $checkout): void
    {
        if (($checkout->payment_status ?? '') !== 'paid') return;
        $sessionId = (int) ($checkout->metadata->survey_session_id ?? 0);
        if ($sessionId < 1) throw new \RuntimeException('Stripe metadata does not contain a survey session.');
        $payment = $this->db->fetch('SELECT * FROM payments WHERE stripe_checkout_session_id = ? FOR UPDATE', [$checkout->id]);
        if (!$payment) throw new \RuntimeException('Stripe checkout payment record was not found.');
        if ($payment['status'] === 'paid') return;

        $this->db->execute('UPDATE payments SET status = ?, stripe_payment_intent_id = ?, stripe_customer_id = ?, amount = ?, currency = ?, paid_at = NOW(), updated_at = NOW() WHERE id = ?', ['paid', $checkout->payment_intent ?? null, $checkout->customer ?? null, (int) ($checkout->amount_total ?? 0), strtoupper((string) ($checkout->currency ?? 'USD')), $payment['id']]);
        $this->reports->unlockBySession($sessionId, 'stripe_webhook');
        $this->db->execute('UPDATE affiliate_attributions SET conversion_at = COALESCE(conversion_at, NOW()) WHERE survey_session_id = ?', [$sessionId]);

        if ($payment['affiliate_id']) {
            $affiliate = $this->db->fetch('SELECT * FROM affiliates WHERE id = ?', [$payment['affiliate_id']]);
            if ($affiliate) {
                $amount = (int) ($checkout->amount_total ?? 0);
                $commission = $affiliate['commission_type'] === 'fixed'
                    ? (int) round((float) $affiliate['commission_value'] * 100)
                    : (int) round($amount * ((float) $affiliate['commission_value'] / 100));
                $this->db->execute('INSERT INTO affiliate_commissions (affiliate_id, payment_id, survey_session_id, amount_minor, currency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE amount_minor = VALUES(amount_minor), currency = VALUES(currency), updated_at = NOW()', [$affiliate['id'], $payment['id'], $sessionId, max(0, $commission), strtoupper((string) ($checkout->currency ?? 'USD')), 'pending']);
            }
        }

        $participant = $this->db->fetch('SELECT p.name, p.email, t.name track_name FROM survey_sessions s JOIN participants p ON p.id = s.participant_id JOIN assessment_tracks t ON t.id = s.track_id WHERE s.id = ?', [$sessionId]);
        if ($participant) {
            $this->enqueue('payment_successful', $participant['email'], ['participantName' => $participant['name'], 'trackName' => $participant['track_name'], 'amount' => (int) ($checkout->amount_total ?? 0), 'currency' => strtoupper((string) ($checkout->currency ?? 'USD'))]);
            $this->enqueue('paid_report_ready', $participant['email'], ['participantName' => $participant['name'], 'trackName' => $participant['track_name']]);
        }
    }

    private function failed(object $checkout, string $status): void
    {
        $this->db->execute('UPDATE payments SET status = ?, updated_at = NOW() WHERE stripe_checkout_session_id = ?', [$status, $checkout->id]);
        $this->db->execute('INSERT INTO notification_events (event_key, severity, entity_type, entity_id, title, message, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', ['payment_' . $status, $status === 'failed' ? 'warning' : 'info', 'payment', (string) $checkout->id, 'Stripe payment ' . $status, 'A checkout was marked ' . $status . '.', json_encode(['checkout' => $checkout->id])]);
    }

    private function refunded(object $charge): void
    {
        $paymentIntent = (string) ($charge->payment_intent ?? '');
        if ($paymentIntent === '') return;
        $payment = $this->db->fetch('SELECT * FROM payments WHERE stripe_payment_intent_id = ? FOR UPDATE', [$paymentIntent]);
        if (!$payment) return;
        $this->db->execute('UPDATE payments SET status = ?, refunded_at = NOW(), updated_at = NOW() WHERE id = ?', ['refunded', $payment['id']]);
        $this->db->execute('UPDATE generated_reports SET is_unlocked = 0, unlock_reason = ?, unlocked_at = NULL, updated_at = NOW() WHERE survey_session_id = ?', ['stripe_refund', $payment['survey_session_id']]);
        $this->db->execute('UPDATE affiliate_commissions SET status = ?, adjustment_note = ?, updated_at = NOW() WHERE payment_id = ?', ['void', 'Payment refunded', $payment['id']]);
    }

    private function enqueue(string $template, string $recipient, array $variables): void
    {
        $this->db->execute('INSERT INTO email_queue (template_key, recipient_email, variables_json, status, attempts, scheduled_at, created_at) VALUES (?, ?, ?, ?, 0, NOW(), NOW())', [$template, strtolower($recipient), json_encode($variables), 'queued']);
    }
}
