<?php
declare(strict_types=1);

namespace AtomGlobal\Security;

use AtomGlobal\Database;

final class RateLimiter
{
    public function __construct(private Database $db) {}
    public function hit(string $key, int $maximum, int $windowSeconds): bool
    {
        $hash = hash('sha256', $key); $row = $this->db->fetch('SELECT setting_value FROM global_settings WHERE setting_key = ?', ['rate.' . $hash]); $state = $row ? json_decode($row['setting_value'], true) : null;
        if (!$state || $state['reset'] < time()) $state = ['count' => 0, 'reset' => time() + $windowSeconds]; $state['count']++;
        $this->db->execute('INSERT INTO global_settings (setting_key, setting_value, is_encrypted, updated_at) VALUES (?, ?, 0, NOW()) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()', ['rate.' . $hash, json_encode($state)]);
        return $state['count'] <= $maximum;
    }
}
