#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__) . '/src/bootstrap.php';
$db = $container['db'];
$settings = $container['settings'];

$keys = [
    'provider' => 'email.provider',
    'senderName' => 'email.admin_from_name',
    'senderAddress' => 'email.admin_from_address',
    'replyTo' => 'email.reply_to',
    'publicBaseUrl' => 'email.public_base_url',
    'logoUrl' => 'email.logo_url',
    'websiteUrl' => 'email.website_url',
    'privacyUrl' => 'email.privacy_url',
    'termsUrl' => 'email.terms_url',
    'footerText' => 'email.footer_text',
    'smtpHost' => 'email.smtp_host',
    'smtpPort' => 'email.smtp_port',
    'smtpUsername' => 'email.smtp_username',
    'smtpEncryption' => 'email.smtp_encryption',
];

$result = [
    'environment' => $container['config']['env'] ?? null,
    'effective' => [],
    'source' => [],
    'secretsConfiguredInCms' => [],
];

foreach ($keys as $label => $key) {
    $row = $db->fetch(
        'SELECT setting_value, is_encrypted, updated_at FROM global_settings WHERE setting_key = ?',
        [$key]
    );
    $result['source'][$label] = $row ? 'cms' : 'missing';
    $result['effective'][$label] = $row ? $settings->get($key) : null;
    if ($row) $result['source'][$label . 'UpdatedAt'] = $row['updated_at'];
}

foreach (['smtpPassword' => 'email.smtp_password', 'smtp2goApiKey' => 'email.smtp2go_api_key'] as $label => $key) {
    $row = $db->fetch(
        'SELECT is_encrypted, updated_at FROM global_settings WHERE setting_key = ?',
        [$key]
    );
    $result['secretsConfiguredInCms'][$label] = (bool) $row;
    if ($row) $result['source'][$label . 'UpdatedAt'] = $row['updated_at'];
}

$sender = trim((string) ($result['effective']['senderAddress'] ?? ''));
$replyTo = trim((string) ($result['effective']['replyTo'] ?? ''));
$provider = strtolower(trim((string) ($result['effective']['provider'] ?? '')));

$result['valid'] = [
    'provider' => in_array($provider, ['smtp2go', 'smtp'], true),
    'senderAddress' => (bool) filter_var($sender, FILTER_VALIDATE_EMAIL),
    'replyTo' => $replyTo === '' || (bool) filter_var($replyTo, FILTER_VALIDATE_EMAIL),
    'allPublicEmailSettingsFromCms' => !in_array('missing', $result['source'], true),
];

$result['effectiveSenderIdentity'] = trim((string) ($result['effective']['senderName'] ?? '')) !== ''
    ? trim((string) $result['effective']['senderName']) . ' <' . $sender . '>'
    : $sender;

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), PHP_EOL;

if (in_array(false, $result['valid'], true)) exit(1);
