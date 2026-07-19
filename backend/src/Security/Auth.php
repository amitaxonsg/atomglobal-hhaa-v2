<?php
declare(strict_types=1);

namespace AtomGlobal\Security;

use AtomGlobal\Database;

final class Auth
{
    public function __construct(private Database $db) {}
    public function attempt(string $email, string $password): bool
    {
        $user = $this->db->fetch('SELECT * FROM admin_users WHERE email = ? AND is_active = 1 LIMIT 1', [strtolower(trim($email))]);
        if (!$user || ($user['locked_until'] && strtotime($user['locked_until']) > time()) || !password_verify($password, $user['password_hash'])) {
            if ($user) $this->db->execute('UPDATE admin_users SET failed_login_attempts = failed_login_attempts + 1, locked_until = IF(failed_login_attempts >= 4, DATE_ADD(NOW(), INTERVAL 15 MINUTE), locked_until) WHERE id = ?', [$user['id']]);
            return false;
        }
        session_regenerate_id(true); $_SESSION['admin_user_id'] = (int) $user['id'];
        $this->db->execute('UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?', [$user['id']]);
        return true;
    }
    public function requireUser(): array { if (empty($_SESSION['admin_user_id'])) throw new \RuntimeException('Unauthorised', 401); $user = $this->db->fetch('SELECT id, email, display_name FROM admin_users WHERE id = ? AND is_active = 1', [$_SESSION['admin_user_id']]); if (!$user) throw new \RuntimeException('Unauthorised', 401); return $user; }
}
