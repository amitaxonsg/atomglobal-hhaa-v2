#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="/srv/head-heart.atomglobal.com/staging-source"
CURRENT_DIR="/var/www/head-heart-staging.atomglobal.com/current"
ENV_FILE="/etc/head-heart-alignment/staging.env"
LOG_DIR="/var/log/head-heart-alignment-staging"
CRON_FILE="/etc/cron.d/head-heart-alignment-staging"
BASE_URL="https://head-heart-staging.atomglobal.com"

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[[ "${EUID}" -eq 0 ]] || fail "Run as root."
[[ -f "$ENV_FILE" ]] || fail "Missing staging env: $ENV_FILE"
[[ -d "$SOURCE_DIR/backend" ]] || fail "Missing staging source checkout."

printf '\n=== Head–Heart V3 UAT integration setup ===\n'
printf 'This configures STAGING only. Production is not changed.\n\n'

read -r -p 'Mailtrap SMTP host [sandbox.smtp.mailtrap.io]: ' MAILTRAP_HOST
MAILTRAP_HOST="${MAILTRAP_HOST:-sandbox.smtp.mailtrap.io}"
read -r -p 'Mailtrap SMTP port [2525]: ' MAILTRAP_PORT
MAILTRAP_PORT="${MAILTRAP_PORT:-2525}"
read -r -p 'Mailtrap SMTP username: ' MAILTRAP_USER
[[ -n "$MAILTRAP_USER" ]] || fail 'Mailtrap username is required.'
read -r -s -p 'Mailtrap SMTP password: ' MAILTRAP_PASS; printf '\n'
[[ -n "$MAILTRAP_PASS" ]] || fail 'Mailtrap password is required.'
read -r -s -p 'Stripe TEST secret key (sk_test_...): ' STRIPE_TEST_SECRET; printf '\n'
[[ "$STRIPE_TEST_SECRET" == sk_test_* ]] || fail 'A Stripe TEST secret key beginning sk_test_ is required.'

export MAILTRAP_HOST MAILTRAP_PORT MAILTRAP_USER MAILTRAP_PASS STRIPE_TEST_SECRET BASE_URL

cd "$SOURCE_DIR/backend"
php <<'PHP'
<?php
declare(strict_types=1);

$container = require 'src/bootstrap.php';
$db = $container['db'];
$settings = $container['settings'];

$mailHost = trim((string) getenv('MAILTRAP_HOST'));
$mailPort = max(1, (int) getenv('MAILTRAP_PORT'));
$mailUser = trim((string) getenv('MAILTRAP_USER'));
$mailPass = (string) getenv('MAILTRAP_PASS');
$stripeSecret = trim((string) getenv('STRIPE_TEST_SECRET'));
$baseUrl = rtrim((string) getenv('BASE_URL'), '/');

if (!str_starts_with($stripeSecret, 'sk_test_')) {
    throw new RuntimeException('Refusing non-test Stripe key on staging.');
}
if ($mailHost === '' || stripos($mailHost, 'mailtrap') === false || $mailUser === '' || $mailPass === '') {
    throw new RuntimeException('Valid Mailtrap SMTP credentials are required.');
}

$settings->set('email.provider', 'smtp');
$settings->set('email.smtp_host', $mailHost);
$settings->set('email.smtp_port', (string) $mailPort);
$settings->set('email.smtp_username', $mailUser);
$settings->set('email.smtp_password', $mailPass, true);
$settings->set('email.smtp_encryption', in_array($mailPort, [465], true) ? 'ssl' : 'tls');
$settings->set('email.public_base_url', $baseUrl);
$settings->set('email.logo_url', '/media/brand/atom-global-wordmark.png');
$settings->set('email.website_url', '/');
$settings->set('email.privacy_url', '/privacy');
$settings->set('email.terms_url', '/terms');
$settings->set('email.footer_text', 'Head–Heart Alignment by Atom Global Consulting');

$stripe = new \Stripe\StripeClient($stripeSecret);
$account = $stripe->accounts->retrieve();
if (!$account || empty($account->id)) throw new RuntimeException('Stripe test key validation failed.');

$webhookUrl = $baseUrl . '/api/stripe/webhook';
$existing = $stripe->webhookEndpoints->all(['limit' => 100]);
foreach ($existing->data as $endpoint) {
    if ((string) ($endpoint->url ?? '') === $webhookUrl) {
        try { $stripe->webhookEndpoints->delete($endpoint->id, []); } catch (Throwable) {}
    }
}
$webhook = $stripe->webhookEndpoints->create([
    'url' => $webhookUrl,
    'enabled_events' => [
        'checkout.session.completed',
        'checkout.session.async_payment_failed',
        'checkout.session.expired',
        'charge.refunded',
    ],
    'description' => 'Head–Heart V3 staging UAT',
    'metadata' => ['environment' => 'staging', 'app' => 'head-heart-v3'],
]);
if (empty($webhook->secret)) throw new RuntimeException('Stripe test webhook secret was not returned.');

$settings->set('stripe.secret_key', $stripeSecret, true);
$settings->set('stripe.webhook_secret', (string) $webhook->secret, true);

$tracks = $db->fetchAll('SELECT track_key, name, price_minor, currency FROM assessment_tracks WHERE is_active = 1 ORDER BY id');
$wanted = ['personal', 'newjoiner', 'manager', 'executive'];
$seen = [];
foreach ($tracks as $track) {
    $key = strtolower((string) $track['track_key']);
    if (!in_array($key, $wanted, true)) continue;
    $amount = max(1, (int) $track['price_minor']);
    $currency = strtolower((string) ($track['currency'] ?: 'usd'));
    $product = $stripe->products->create([
        'name' => 'Head–Heart Alignment ' . (string) $track['name'] . ' Full Report — UAT',
        'metadata' => ['environment' => 'staging', 'track_key' => $key],
    ]);
    $price = $stripe->prices->create([
        'product' => $product->id,
        'currency' => $currency,
        'unit_amount' => $amount,
        'metadata' => ['environment' => 'staging', 'track_key' => $key],
    ]);
    $settings->set('stripe.price_' . $key, (string) $price->id);
    $seen[] = $key;
}
foreach ($wanted as $key) {
    if (!in_array($key, $seen, true)) throw new RuntimeException("Active track missing for Stripe UAT: {$key}");
}

$settings->set('payments.cash_on_delivery_enabled', 'true');
$settings->set('system.cash_on_delivery_enabled', 'true');

echo "CMS integrations configured for staging.\n";
echo "Stripe mode: TEST\n";
echo "Stripe webhook: {$webhookUrl}\n";
echo "Mail provider: Mailtrap SMTP\n";
echo "Email base URL: {$baseUrl}\n";
PHP

unset MAILTRAP_PASS STRIPE_TEST_SECRET

install -d -o www-data -g www-data -m 0750 "$LOG_DIR"
cat > "$CRON_FILE" <<EOF
# Head–Heart Alignment V3 STAGING background processing.
*/5 * * * * www-data /usr/bin/php ${CURRENT_DIR}/backend/bin/cron.php >> ${LOG_DIR}/cron.log 2>&1
35 2 * * * www-data /usr/bin/php ${CURRENT_DIR}/backend/bin/process-retention.php >> ${LOG_DIR}/retention.log 2>&1
10 3 * * * www-data /usr/bin/php ${CURRENT_DIR}/backend/bin/generate-report-pdfs.php >> ${LOG_DIR}/pdf.log 2>&1
EOF
chmod 0644 "$CRON_FILE"
systemctl reload cron 2>/dev/null || systemctl restart cron 2>/dev/null || systemctl reload crond 2>/dev/null || true

sudo -u www-data /usr/bin/php "$CURRENT_DIR/backend/bin/cron.php" >> "$LOG_DIR/cron.log" 2>&1 || true

printf '\n=== Integration setup complete ===\n'
printf 'Running V3 staging burn-in now...\n'
bash "$SOURCE_DIR/deploy/burn-in-v3-staging.sh"
