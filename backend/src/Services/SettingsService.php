<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;
use AtomGlobal\Security\Crypto;

final class SettingsService
{
    public function __construct(private Database $db, private Crypto $crypto) {}

    public function get(string $key, mixed $default = null): mixed
    {
        $row = $this->db->fetch(
            'SELECT setting_value, is_encrypted FROM global_settings WHERE setting_key = ?',
            [$key]
        );
        if (!$row) return $default;
        $value = $row['is_encrypted']
            ? $this->crypto->decrypt($row['setting_value'])
            : $row['setting_value'];
        return json_decode($value, true) ?? $value;
    }

    public function set(string $key, mixed $value, bool $sensitive = false): void
    {
        if ($sensitive) {
            // Masked secret descriptors returned to the browser must never be
            // encrypted and written back over the real credential.
            if (!is_string($value)) return;

            $value = trim($value);
            if ($value === '' || preg_match('/^[*•]+$/u', $value)) return;

            // SMTP2GO API keys are long tokens. Reject obviously truncated
            // values rather than silently breaking production email delivery.
            if ($key === 'email.smtp2go_api_key' && strlen($value) < 20) {
                throw new \InvalidArgumentException(
                    'The SMTP2GO API key appears incomplete. Paste the full API key.'
                );
            }
        }

        $encoded = is_string($value) ? $value : json_encode($value);
        if ($sensitive) $encoded = $this->crypto->encrypt($encoded);
        $this->db->execute(
            'INSERT INTO global_settings (setting_key, setting_value, is_encrypted, updated_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), is_encrypted = VALUES(is_encrypted), updated_at = NOW()',
            [$key, $encoded, $sensitive ? 1 : 0]
        );
    }
}
