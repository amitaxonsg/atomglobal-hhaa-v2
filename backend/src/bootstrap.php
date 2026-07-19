<?php
declare(strict_types=1);

use AtomGlobal\Database;
use AtomGlobal\Env;
use AtomGlobal\Mail\MailQueue;
use AtomGlobal\Security\Crypto;
use AtomGlobal\Services\AdminService;
use AtomGlobal\Services\HealthService;
use AtomGlobal\Services\MediaService;
use AtomGlobal\Services\PrivacyService;
use AtomGlobal\Services\ReportService;
use AtomGlobal\Services\ScoringService;
use AtomGlobal\Services\SettingsService;
use AtomGlobal\Services\SurveyService;

require dirname(__DIR__) . '/vendor/autoload.php';
Env::load(dirname(__DIR__) . '/.env');
$config = require dirname(__DIR__) . '/config/app.php';
$db = new Database(require dirname(__DIR__) . '/config/database.php');
$crypto = new Crypto($config['key']);
$settings = new SettingsService($db, $crypto);
$reports = new ReportService($db, $config);
$mailQueue = new MailQueue($db);

return [
    'config' => $config,
    'db' => $db,
    'crypto' => $crypto,
    'settings' => $settings,
    'reports' => $reports,
    'privacy' => new PrivacyService($db),
    'surveys' => new SurveyService($db, new ScoringService(), $reports, $mailQueue, $config),
    'health' => new HealthService($db, $config, $settings),
    'mailQueue' => $mailQueue,
    'media' => new MediaService($db, $config),
    'admin' => new AdminService($db, $settings, $mailQueue),
];
