#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__) . '/src/bootstrap.php';
[$script, $email, $name] = array_pad($argv, 3, null); if (!$email || !$name) { fwrite(STDERR, "Usage: php bin/create-admin.php owner@example.com \"Owner Name\"\n"); exit(1); }
fwrite(STDOUT, 'Password: '); system('stty -echo'); $password = trim(fgets(STDIN) ?: ''); system('stty echo'); fwrite(STDOUT, "\n"); if (strlen($password) < 12) { fwrite(STDERR, "Password must contain at least 12 characters.\n"); exit(1); }
$role = $container['db']->fetch('SELECT id FROM roles WHERE role_key = ?', ['owner']); if (!$role) throw new RuntimeException('Run migrations and seeds first.');
$container['db']->execute('INSERT INTO admin_users (role_id, email, display_name, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())', [$role['id'], strtolower($email), $name, password_hash($password, PASSWORD_ARGON2ID)]); echo "Administrator created.\n";
