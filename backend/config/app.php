<?php
declare(strict_types=1);

$timezone = $_ENV['APP_TIMEZONE'] ?? 'Asia/Singapore';
date_default_timezone_set($timezone);

return [
    'env' => $_ENV['APP_ENV'] ?? 'production',
    'url' => rtrim($_ENV['APP_URL'] ?? 'https://head-heart.atomglobal.com', '/'),
    'debug' => filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOL),
    'timezone' => $timezone,
    'key' => $_ENV['APP_KEY'] ?? '',
    'storage' => $_ENV['STORAGE_PATH'] ?? dirname(__DIR__) . '/storage',
    'media_public_prefix' => $_ENV['MEDIA_PUBLIC_PREFIX'] ?? '/media-uploads',
    'max_upload_bytes' => (int) ($_ENV['MAX_UPLOAD_BYTES'] ?? 10485760),
    'session_cookie' => $_ENV['SESSION_COOKIE'] ?? 'hhaa_admin',
    'session_lifetime' => (int) ($_ENV['SESSION_LIFETIME'] ?? 7200),
    'session_same_site' => $_ENV['SESSION_SAME_SITE'] ?? 'Strict',
    'session_secure' => filter_var($_ENV['SESSION_SECURE'] ?? true, FILTER_VALIDATE_BOOL),
    'report_token_days' => (int) ($_ENV['REPORT_TOKEN_LIFETIME_DAYS'] ?? 30),
    'resume_token_hours' => (int) ($_ENV['RESUME_TOKEN_LIFETIME_HOURS'] ?? 168),
];
