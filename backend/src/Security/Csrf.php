<?php
declare(strict_types=1);

namespace AtomGlobal\Security;

final class Csrf
{
    public static function token(): string { if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32)); return $_SESSION['csrf']; }
    public static function verify(?string $token): bool { return is_string($token) && isset($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $token); }
}
