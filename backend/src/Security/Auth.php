<?php
declare(strict_types=1);

namespace AtomGlobal\Security;

use AtomGlobal\Database;

final class Auth
{
    public function __construct(private Database $db) {}

    public function attempt(string $email, string $password): ?array
    {
        $email = strtolower(trim($email));
        $user = $this->db->fetch(
            'SELECT u.*, r.role_key, r.role_name FROM admin_users u JOIN roles r ON r.id = u.role_id WHERE u.email = ? AND u.is_active = 1 LIMIT 1',
            [$email]
        );

        if (!$user || ($user['locked_until'] && strtotime($user['locked_until']) > time()) || !password_verify($password, $user['password_hash'])) {
            if ($user) {
                $this->db->execute(
                    'UPDATE admin_users SET failed_login_attempts = failed_login_attempts + 1, locked_until = IF(failed_login_attempts >= 4, DATE_ADD(NOW(), INTERVAL 15 MINUTE), locked_until), updated_at = NOW() WHERE id = ?',
                    [$user['id']]
                );
            }
            return null;
        }

        session_regenerate_id(true);
        $_SESSION['admin_user_id'] = (int) $user['id'];
        $_SESSION['admin_session_version'] = (int) $user['session_version'];
        $_SESSION['last_activity_at'] = time();

        $this->db->execute(
            'UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW(), updated_at = NOW() WHERE id = ?',
            [$user['id']]
        );

        return $this->publicUser($user);
    }

    public function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
    }

    public function current(): ?array
    {
        if (empty($_SESSION['admin_user_id'])) {
            return null;
        }

        $user = $this->db->fetch(
            'SELECT u.*, r.role_key, r.role_name FROM admin_users u JOIN roles r ON r.id = u.role_id WHERE u.id = ? AND u.is_active = 1 LIMIT 1',
            [(int) $_SESSION['admin_user_id']]
        );

        if (!$user || (int) ($user['session_version'] ?? 0) !== (int) ($_SESSION['admin_session_version'] ?? -1)) {
            $this->logout();
            return null;
        }

        $_SESSION['last_activity_at'] = time();
        return $this->publicUser($user);
    }

    public function requireUser(): array
    {
        $user = $this->current();
        if (!$user) {
            throw new \RuntimeException('Unauthorised', 401);
        }
        return $user;
    }

    public function requirePermission(string $permission): array
    {
        $user = $this->requireUser();
        if ($user['role_key'] === 'owner') {
            return $user;
        }

        $allowed = $this->db->fetch(
            'SELECT 1 allowed FROM admin_users u JOIN role_permissions rp ON rp.role_id = u.role_id JOIN permissions p ON p.id = rp.permission_id WHERE u.id = ? AND p.permission_key = ? LIMIT 1',
            [$user['id'], $permission]
        );

        if (!$allowed) {
            throw new \RuntimeException('Forbidden', 403);
        }

        return $user;
    }

    public function permissions(int $userId): array
    {
        return array_column(
            $this->db->fetchAll(
                'SELECT p.permission_key FROM admin_users u JOIN role_permissions rp ON rp.role_id = u.role_id JOIN permissions p ON p.id = rp.permission_id WHERE u.id = ? ORDER BY p.permission_key',
                [$userId]
            ),
            'permission_key'
        );
    }

    private function publicUser(array $user): array
    {
        $id = (int) $user['id'];
        return [
            'id' => $id,
            'email' => $user['email'],
            'displayName' => $user['display_name'],
            'roleKey' => $user['role_key'],
            'roleName' => $user['role_name'],
            'permissions' => $this->permissions($id),
            'lastLoginAt' => $user['last_login_at'] ?? null,
        ];
    }
}
