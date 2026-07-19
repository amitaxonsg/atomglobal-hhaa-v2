<?php
declare(strict_types=1);

namespace AtomGlobal\Security;

final class Crypto
{
    private string $key;
    public function __construct(string $appKey)
    {
        $raw = str_starts_with($appKey, 'base64:') ? base64_decode(substr($appKey, 7), true) : $appKey;
        if (!is_string($raw) || strlen($raw) < 32) throw new \RuntimeException('APP_KEY must contain at least 32 random bytes.');
        $this->key = hash('sha256', $raw, true);
    }
    public function encrypt(string $plain): string { $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES); return base64_encode($nonce . sodium_crypto_secretbox($plain, $nonce, $this->key)); }
    public function decrypt(string $encoded): string { $payload = base64_decode($encoded, true); if ($payload === false) throw new \RuntimeException('Invalid encrypted value.'); $nonce = substr($payload, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES); $plain = sodium_crypto_secretbox_open(substr($payload, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES), $nonce, $this->key); if ($plain === false) throw new \RuntimeException('Unable to decrypt value.'); return $plain; }
}
