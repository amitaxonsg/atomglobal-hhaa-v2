<?php
declare(strict_types=1);

return [
    'env' => $_ENV['APP_ENV'] ?? 'production',
    'url' => rtrim($_ENV['APP_URL'] ?? 'https://head-heart.atomglobal.com', '/'),
    'debug' => filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOL),
    'key' => $_ENV['APP_KEY'] ?? '',
    'storage' => $_ENV['STORAGE_PATH'] ?? dirname(__DIR__) . '/storage',
    'session_cookie' => $_ENV['SESSION_COOKIE'] ?? 'hhaa_admin',
    'session_lifetime' => (int) ($_ENV['SESSION_LIFETIME'] ?? 7200),
    'report_token_days' => (int) ($_ENV['REPORT_TOKEN_LIFETIME_DAYS'] ?? 30),
];
