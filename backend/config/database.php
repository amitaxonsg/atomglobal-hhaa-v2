<?php
declare(strict_types=1);

return [
    'dsn' => sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $_ENV['DB_HOST'] ?? '127.0.0.1', $_ENV['DB_PORT'] ?? '3306', $_ENV['DB_DATABASE'] ?? 'head_heart_v2'),
    'username' => $_ENV['DB_USERNAME'] ?? 'head_heart_v2',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
];
