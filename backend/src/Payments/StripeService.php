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
        $secret = $this->settings->get('stripe.secret_key', $_ENV['STRIPE_SECRET_KEY'] ?? ''); $price = $this->settings->get("stripe.price.$trackKey");
        if (!$secret || !$price) throw new \RuntimeException('Stripe is not configured.');
        $stripe = new StripeClient($secret);
        $session = $stripe->checkout->sessions->create(['mode' => 'payment', 'line_items' => [['price' => $price, 'quantity' => 1]], 'allow_promotion_codes' => true, 'success_url' => $this->config['url'] . '/payment/success?checkout={CHECKOUT_SESSION_ID}', 'cancel_url' => $this->config['url'] . '/payment/cancelled', 'metadata' => ['survey_session_id' => (string) $sessionId, 'track_key' => $trackKey, 'affiliate_code' => $affiliateCode ?? '']]);
        $this->db->execute('INSERT INTO payments (survey_session_id, provider, status, stripe_checkout_session_id, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [$sessionId, 'stripe', 'checkout_started', $session->id, $session->currency ?? 'usd']);
        return ['url' => $session->url];
    }
    public function webhook(string $payload, string $signature): void
    {
        $secret = $this->settings->get('stripe.webhook_secret', $_ENV['STRIPE_WEBHOOK_SECRET'] ?? '');
        $event = Webhook::constructEvent($payload, $signature, $secret);
        $this->db->transaction(function () use ($event) {
            $exists = $this->db->fetch('SELECT id FROM stripe_webhook_events WHERE stripe_event_id = ? FOR UPDATE', [$event->id]); if ($exists) return;
            $eventId = $this->db->insert('INSERT INTO stripe_webhook_events (stripe_event_id, event_type, status, payload_json, received_at) VALUES (?, ?, ?, ?, NOW())', [$event->id, $event->type, 'processing', json_encode($event)]);
            try {
                if ($event->type === 'checkout.session.completed' && ($event->data->object->payment_status ?? '') === 'paid') {
                    $checkout = $event->data->object; $sessionId = (int) ($checkout->metadata->survey_session_id ?? 0);
                    $this->db->execute('UPDATE payments SET status = ?, stripe_payment_intent_id = ?, amount = ?, currency = ?, paid_at = NOW(), updated_at = NOW() WHERE stripe_checkout_session_id = ?', ['paid', $checkout->payment_intent, $checkout->amount_total, $checkout->currency, $checkout->id]);
                    $this->reports->unlockBySession($sessionId, 'stripe_webhook');
                }
                $this->db->execute('UPDATE stripe_webhook_events SET status = ?, processed_at = NOW() WHERE id = ?', ['processed', $eventId]);
            } catch (\Throwable $error) { $this->db->execute('UPDATE stripe_webhook_events SET status = ?, failure_reason = ? WHERE id = ?', ['failed', substr($error->getMessage(), 0, 1000), $eventId]); throw $error; }
        });
    }
}
