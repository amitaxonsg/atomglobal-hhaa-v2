<?php
declare(strict_types=1);

namespace AtomGlobal\Payments;

use AtomGlobal\Database;
use AtomGlobal\Services\SettingsService;
use Stripe\StripeClient;

final class StripeConnectService
{
    private const TRACKS = [
        'personal' => 'Personal',
        'newjoiner' => 'New Joiner',
        'manager' => 'Manager',
        'executive' => 'Executive',
    ];

    public function __construct(
        private Database $db,
        private SettingsService $settings,
        private array $config,
    ) {}

    public function status(): array
    {
        $connectionType = (string) $this->settings->get('stripe.connection_type', 'manual');
        $accountId = trim((string) $this->settings->get('stripe.connected_account_id', ''));
        $connected = $connectionType === 'connect' && preg_match('/^acct_[A-Za-z0-9]+$/', $accountId) === 1;
        $platformReady = $this->platformReady();
        $connectWebhookReady = trim((string) ($this->config['stripe_connect_webhook_secret'] ?? '')) !== '';
        $manualSecret = trim((string) $this->settings->get('stripe.secret_key', $_ENV['STRIPE_SECRET_KEY'] ?? ''));
        $manualWebhook = trim((string) $this->settings->get('stripe.webhook_secret', $_ENV['STRIPE_WEBHOOK_SECRET'] ?? ''));
        $pricePrefix = $connected ? 'stripe.connect_price_' : 'stripe.price_';
        $rows = $this->db->fetchAll('SELECT track_key, name, price_minor, currency FROM assessment_tracks WHERE track_key IN (?, ?, ?, ?) ORDER BY display_order', array_keys(self::TRACKS));
        $byKey = [];
        foreach ($rows as $row) $byKey[$row['track_key']] = $row;

        $prices = [];
        $allPricesConfigured = true;
        foreach (self::TRACKS as $key => $fallbackLabel) {
            $row = $byKey[$key] ?? [];
            $defaultPriceId = $connected ? '' : (string) ($_ENV['STRIPE_PRICE_' . strtoupper($key)] ?? '');
            $priceId = trim((string) $this->settings->get($pricePrefix . $key, $defaultPriceId));
            $minor = max(0, (int) ($row['price_minor'] ?? 0));
            $prices[] = [
                'key' => $key,
                'label' => (string) ($row['name'] ?? $fallbackLabel),
                'amount' => number_format($minor / 100, 2, '.', ''),
                'currency' => 'USD',
                'priceId' => $priceId,
                'configured' => $priceId !== '',
            ];
            if ($priceId === '') $allPricesConfigured = false;
        }

        $checkoutReady = $connected
            ? $platformReady && $connectWebhookReady && $allPricesConfigured
            : $manualSecret !== '' && $manualWebhook !== '' && $allPricesConfigured;

        return [
            'connectionType' => $connected ? 'connect' : 'manual',
            'connected' => $connected,
            'accountId' => $connected ? $accountId : '',
            'accountName' => $connected ? (string) $this->settings->get('stripe.connected_account_name', '') : '',
            'accountEmail' => $connected ? (string) $this->settings->get('stripe.connected_account_email', '') : '',
            'accountCountry' => $connected ? (string) $this->settings->get('stripe.connected_account_country', '') : '',
            'mode' => $connected
                ? ((bool) $this->settings->get('stripe.connected_livemode', false) ? 'live' : 'test')
                : (string) $this->settings->get('stripe.mode', 'test'),
            'currency' => 'USD',
            'platformReady' => $platformReady,
            'connectWebhookReady' => $connectWebhookReady,
            'manualConfigured' => $manualSecret !== '',
            'manualWebhookConfigured' => $manualWebhook !== '',
            'allPricesConfigured' => $allPricesConfigured,
            'checkoutReady' => $checkoutReady,
            'prices' => $prices,
        ];
    }

    public function start(int $adminId): array
    {
        $this->requirePlatformConfiguration();
        $state = $this->makeState($adminId);
        $query = http_build_query([
            'response_type' => 'code',
            'client_id' => $this->config['stripe_connect_client_id'],
            'scope' => 'read_write',
            'redirect_uri' => $this->config['stripe_connect_redirect_uri'],
            'state' => $state,
        ], '', '&', PHP_QUERY_RFC3986);

        return ['url' => 'https://connect.stripe.com/oauth/authorize?' . $query];
    }

    public function complete(string $code, string $state): array
    {
        $this->requirePlatformConfiguration();
        if ($code === '') throw new \InvalidArgumentException('Stripe did not return an authorisation code.');
        $stateData = $this->consumeState($state);
        $stripe = new StripeClient((string) $this->config['stripe_platform_secret_key']);
        $token = $stripe->oauth->token([
            'grant_type' => 'authorization_code',
            'code' => $code,
        ]);
        $accountId = trim((string) ($token->stripe_user_id ?? ''));
        if (!preg_match('/^acct_[A-Za-z0-9]+$/', $accountId)) {
            throw new \RuntimeException('Stripe did not return a valid connected account ID.');
        }

        $account = $stripe->accounts->retrieve($accountId, []);
        $name = trim((string) ($account->business_profile->name ?? $account->settings->dashboard->display_name ?? ''));
        $email = trim((string) ($account->email ?? ''));
        $country = strtoupper(trim((string) ($account->country ?? '')));

        $this->settings->set('stripe.connection_type', 'connect');
        $this->settings->set('stripe.connected_account_id', $accountId);
        $this->settings->set('stripe.connected_account_name', $name);
        $this->settings->set('stripe.connected_account_email', $email);
        $this->settings->set('stripe.connected_account_country', $country);
        $this->settings->set('stripe.connected_livemode', (bool) ($token->livemode ?? false));
        $this->settings->set('stripe.currency', 'USD');
        $this->audit((int) $stateData['adminId'], 'stripe.connect_authorised', [
            'accountId' => $accountId,
            'accountName' => $name,
            'country' => $country,
            'livemode' => (bool) ($token->livemode ?? false),
        ]);

        return $this->status();
    }

    public function disconnect(int $adminId): array
    {
        $accountId = trim((string) $this->settings->get('stripe.connected_account_id', ''));
        if ($accountId !== '' && $this->platformReady()) {
            $stripe = new StripeClient((string) $this->config['stripe_platform_secret_key']);
            try {
                $stripe->oauth->deauthorize([
                    'client_id' => (string) $this->config['stripe_connect_client_id'],
                    'stripe_user_id' => $accountId,
                ]);
            } catch (\Throwable $error) {
                $this->audit($adminId, 'stripe.connect_remote_deauthorise_failed', [
                    'accountId' => $accountId,
                    'message' => mb_substr($error->getMessage(), 0, 500),
                ]);
            }
        }

        $this->clearConnectedConfiguration();
        $this->audit($adminId, 'stripe.connect_disconnected', ['accountId' => $accountId]);
        return $this->status();
    }

    public function handleRemoteDeauthorisation(string $accountId): void
    {
        $connected = trim((string) $this->settings->get('stripe.connected_account_id', ''));
        if ($connected === '' || !hash_equals($connected, $accountId)) return;
        $this->clearConnectedConfiguration();
        $this->db->execute(
            'INSERT INTO notification_events (event_key, severity, entity_type, entity_id, title, message, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            ['stripe_disconnected', 'warning', 'stripe_account', $accountId, 'Stripe account disconnected', 'The connected Stripe account revoked access. Paid checkout has been disabled.']
        );
    }

    public function syncUsdPrices(array $payload, int $adminId): array
    {
        $amounts = is_array($payload['prices'] ?? null) ? $payload['prices'] : $payload;
        [$stripe, $requestOptions, $prefix, $connectionType] = $this->apiContext();
        $saved = [];

        foreach (self::TRACKS as $key => $label) {
            $raw = trim((string) ($amounts[$key] ?? ''));
            if ($raw === '' || !preg_match('/^\d{1,5}(?:\.\d{1,2})?$/', $raw)) {
                throw new \InvalidArgumentException($label . ' price must be a valid USD amount with no more than two decimals.');
            }
            $minor = (int) round(((float) $raw) * 100);
            if ($minor < 50 || $minor > 1000000) {
                throw new \InvalidArgumentException($label . ' price must be between USD 0.50 and USD 10,000.00.');
            }

            $productKey = $prefix . 'product_' . $key;
            $priceKey = $prefix . 'price_' . $key;
            $productId = trim((string) $this->settings->get($productKey, ''));
            if ($productId !== '') {
                try {
                    $product = $stripe->products->retrieve($productId, [], $requestOptions);
                    if (!($product->active ?? false)) $productId = '';
                } catch (\Throwable) {
                    $productId = '';
                }
            }
            if ($productId === '') {
                $product = $stripe->products->create([
                    'name' => 'Head–Heart Alignment — ' . $label . ' Full Report',
                    'description' => 'One-time unlock of the complete Head–Heart Alignment report.',
                    'metadata' => ['track_key' => $key, 'application' => 'head-heart-alignment'],
                ], $requestOptions);
                $productId = (string) $product->id;
                $this->settings->set($productKey, $productId);
            }

            $priceId = trim((string) $this->settings->get($priceKey, ''));
            $reuse = false;
            if ($priceId !== '') {
                try {
                    $currentPrice = $stripe->prices->retrieve($priceId, [], $requestOptions);
                    $reuse = ($currentPrice->active ?? false)
                        && strtolower((string) ($currentPrice->currency ?? '')) === 'usd'
                        && (int) ($currentPrice->unit_amount ?? 0) === $minor
                        && (string) ($currentPrice->product ?? '') === $productId;
                } catch (\Throwable) {
                    $reuse = false;
                }
            }
            if (!$reuse) {
                $price = $stripe->prices->create([
                    'currency' => 'usd',
                    'unit_amount' => $minor,
                    'product' => $productId,
                    'metadata' => ['track_key' => $key, 'application' => 'head-heart-alignment'],
                ], $requestOptions);
                $priceId = (string) $price->id;
                $this->settings->set($priceKey, $priceId);
            }

            $this->db->execute('UPDATE assessment_tracks SET price_minor = ?, currency = ? WHERE track_key = ?', [$minor, 'USD', $key]);
            $saved[$key] = ['amount' => number_format($minor / 100, 2, '.', ''), 'currency' => 'USD', 'priceId' => $priceId];
        }

        $this->settings->set('stripe.currency', 'USD');
        $this->audit($adminId, 'stripe.usd_prices_synced', [
            'connectionType' => $connectionType,
            'prices' => $saved,
        ]);
        return $this->status();
    }

    public function testConnection(int $adminId): array
    {
        [$stripe, $requestOptions, , $connectionType] = $this->apiContext();
        if ($connectionType === 'connect') {
            $accountId = trim((string) $this->settings->get('stripe.connected_account_id', ''));
            $account = $stripe->accounts->retrieve($accountId, []);
        } else {
            $account = $stripe->accounts->retrieve();
        }
        $message = 'Connected to Stripe account ' . (string) ($account->id ?? 'unknown') . ' in ' . $connectionType . ' mode.';
        $this->db->execute('INSERT INTO api_connection_tests (provider_key, status, message, tested_by, tested_at) VALUES (?, ?, ?, ?, NOW())', ['stripe', 'success', $message, $adminId]);
        return ['status' => 'success', 'message' => $message, 'requestOptions' => $requestOptions ? 'connected_account' : 'platform_account'];
    }

    private function apiContext(): array
    {
        $connectionType = (string) $this->settings->get('stripe.connection_type', 'manual');
        $accountId = trim((string) $this->settings->get('stripe.connected_account_id', ''));
        if ($connectionType === 'connect' && $accountId !== '') {
            $secret = trim((string) ($this->config['stripe_platform_secret_key'] ?? ''));
            if ($secret === '') throw new \RuntimeException('Stripe Connect platform secret is not configured on the server.');
            return [new StripeClient($secret), ['stripe_account' => $accountId], 'stripe.connect_', 'connect'];
        }

        $secret = trim((string) $this->settings->get('stripe.secret_key', $_ENV['STRIPE_SECRET_KEY'] ?? ''));
        if ($secret === '') throw new \RuntimeException('Stripe manual secret key is not configured.');
        return [new StripeClient($secret), [], 'stripe.', 'manual'];
    }

    private function makeState(int $adminId): string
    {
        $nonce = bin2hex(random_bytes(16));
        $expires = time() + 900;
        $payload = $this->base64UrlEncode(json_encode([
            'adminId' => $adminId,
            'nonce' => $nonce,
            'expires' => $expires,
        ], JSON_THROW_ON_ERROR));
        $signature = hash_hmac('sha256', $payload, (string) $this->config['key']);
        $this->settings->set('stripe.oauth_state_' . $nonce, ['adminId' => $adminId, 'expires' => $expires]);
        return $payload . '.' . $signature;
    }

    private function consumeState(string $state): array
    {
        [$payload, $signature] = array_pad(explode('.', $state, 2), 2, '');
        if ($payload === '' || $signature === '') throw new \InvalidArgumentException('Stripe connection state is missing.');
        $expected = hash_hmac('sha256', $payload, (string) $this->config['key']);
        if (!hash_equals($expected, $signature)) throw new \InvalidArgumentException('Stripe connection state is invalid.');
        $decoded = json_decode($this->base64UrlDecode($payload), true, 512, JSON_THROW_ON_ERROR);
        $nonce = (string) ($decoded['nonce'] ?? '');
        $adminId = (int) ($decoded['adminId'] ?? 0);
        $expires = (int) ($decoded['expires'] ?? 0);
        if ($nonce === '' || $adminId < 1 || $expires < time()) throw new \InvalidArgumentException('Stripe connection state has expired.');
        $key = 'stripe.oauth_state_' . $nonce;
        $stored = $this->settings->get($key, null);
        $this->settings->delete($key);
        if (!is_array($stored) || (int) ($stored['adminId'] ?? 0) !== $adminId || (int) ($stored['expires'] ?? 0) !== $expires) {
            throw new \InvalidArgumentException('Stripe connection state has already been used or is no longer valid.');
        }
        return ['adminId' => $adminId, 'expires' => $expires];
    }

    private function clearConnectedConfiguration(): void
    {
        foreach ([
            'stripe.connection_type', 'stripe.connected_account_id', 'stripe.connected_account_name',
            'stripe.connected_account_email', 'stripe.connected_account_country', 'stripe.connected_livemode',
        ] as $key) $this->settings->delete($key);
        foreach (array_keys(self::TRACKS) as $track) {
            $this->settings->delete('stripe.connect_product_' . $track);
            $this->settings->delete('stripe.connect_price_' . $track);
        }
    }

    private function platformReady(): bool
    {
        return trim((string) ($this->config['stripe_connect_client_id'] ?? '')) !== ''
            && trim((string) ($this->config['stripe_platform_secret_key'] ?? '')) !== ''
            && trim((string) ($this->config['stripe_connect_redirect_uri'] ?? '')) !== '';
    }

    private function requirePlatformConfiguration(): void
    {
        if (!$this->platformReady()) {
            throw new \RuntimeException('Stripe Connect is not enabled on the server yet. Configure the platform client ID, platform secret and redirect URI first.');
        }
        if (trim((string) $this->config['key']) === '') throw new \RuntimeException('APP_KEY is required for the secure Stripe connection state.');
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $padding = strlen($value) % 4;
        if ($padding) $value .= str_repeat('=', 4 - $padding);
        $decoded = base64_decode(strtr($value, '-_', '+/'), true);
        if ($decoded === false) throw new \InvalidArgumentException('Stripe connection state could not be decoded.');
        return $decoded;
    }

    private function audit(int $adminId, string $action, array $after): void
    {
        $this->db->execute(
            'INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, after_json, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [$adminId, $action, 'stripe', null, json_encode($after)]
        );
    }
}
