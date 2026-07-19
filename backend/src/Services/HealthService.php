<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;

final class HealthService
{
    public function __construct(private Database $db, private array $config, private SettingsService $settings) {}
    public function check(): array
    {
        $checks = [];
        try { $checks['database'] = (int) $this->db->fetch('SELECT 1 ok')['ok'] === 1; } catch (\Throwable) { $checks['database'] = false; }
        $checks['storage'] = is_dir($this->config['storage']) && is_writable($this->config['storage']);
        $checks['stripe'] = (bool) ($this->settings->get('stripe.secret_key', $_ENV['STRIPE_SECRET_KEY'] ?? ''));
        $checks['email'] = (bool) ($_ENV['SMTP_HOST'] ?? $_ENV['SMTP2GO_API_KEY'] ?? false);
        $cron = $this->settings->get('system.cron_last_run'); $checks['cron'] = $cron && strtotime((string) $cron) > time() - 900;
        return ['status' => !in_array(false, [$checks['database'], $checks['storage']], true) ? 'ok' : 'degraded', 'checks' => $checks, 'timestamp' => gmdate(DATE_ATOM)];
    }
}
