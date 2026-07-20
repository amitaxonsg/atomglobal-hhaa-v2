#!/usr/bin/env php
<?php
declare(strict_types=1);

const TRACKS = ['personal', 'newjoiner', 'manager', 'executive'];

$requireCheckout = in_array('--require-checkout', $argv, true);
$container = require dirname(__DIR__) . '/src/bootstrap.php';
$db = $container['db'];
$settings = $container['settings'];
$failures = [];
$warnings = [];

function failAudit(string $message): void
{
    global $failures;
    $failures[] = $message;
    echo "FAIL: {$message}\n";
}

function passAudit(string $message): void
{
    echo "PASS: {$message}\n";
}

function warnAudit(string $message): void
{
    global $warnings;
    $warnings[] = $message;
    echo "WARN: {$message}\n";
}

function nonEmptyStrings(mixed $value): bool
{
    if (!is_array($value) || !$value) return false;
    foreach ($value as $item) {
        if (!is_string($item) || trim($item) === '') return false;
    }
    return true;
}

function upgradeReasonsValid(mixed $value): bool
{
    if (!is_array($value) || !$value) return false;
    foreach ($value as $item) {
        if (is_string($item) && trim($item) !== '') continue;
        if (!is_array($item)) return false;
        if (trim((string) ($item['title'] ?? $item['area'] ?? '')) === '') return false;
    }
    return true;
}

function configuredSecret(object $db, string $key): bool
{
    $row = $db->fetch(
        'SELECT is_encrypted, LENGTH(setting_value) valueLength FROM global_settings WHERE setting_key = ?',
        [$key]
    );
    return (bool) $row && (bool) $row['is_encrypted'] && (int) $row['valueLength'] > 20;
}

echo "==================================================\n";
echo " HEAD–HEART LITE / FULL REPORT AUDIT\n";
echo "==================================================\n";

$rows = $db->fetchAll(
    "SELECT
        t.id trackId,
        t.track_key trackKey,
        t.name trackName,
        t.price_minor priceMinor,
        t.currency,
        v.id versionId,
        v.version_number versionNumber,
        v.status
     FROM assessment_tracks t
     JOIN assessment_versions v ON v.track_id = t.id
     ORDER BY t.display_order, v.id"
);

if (count($rows) !== 4) {
    failAudit('Exactly four assessment-version rows are required; found ' . count($rows) . '.');
}

foreach ($rows as $index => $row) {
    $trackKey = (string) $row['trackKey'];
    if (($row['trackKey'] ?? null) !== (TRACKS[$index] ?? null)
        || $row['versionNumber'] !== '2.0.0'
        || $row['status'] !== 'published') {
        failAudit("{$trackKey} is not the single published CMS version 2.0.0.");
        continue;
    }
    passAudit("{$trackKey} uses published CMS version 2.0.0");

    if ((int) $row['priceMinor'] < 1 || trim((string) $row['currency']) === '') {
        failAudit("{$trackKey} Full Report price or currency is missing.");
    } else {
        passAudit("{$trackKey} Full Report price is stored in the assessment track");
    }

    $templates = $db->fetchAll(
        'SELECT id, profile_key profileKey, profile_name profileName, min_score minScore, max_score maxScore, free_content_json freeJson, paid_content_json paidJson FROM report_templates WHERE assessment_version_id = ? ORDER BY min_score',
        [(int) $row['versionId']]
    );
    if (!$templates) {
        failAudit("{$trackKey} has no report templates.");
        continue;
    }

    $expectedMinimum = 50;
    foreach ($templates as $templateIndex => $template) {
        $label = $trackKey . ' / ' . ($template['profileName'] ?: $template['profileKey']);
        $minimum = (int) $template['minScore'];
        $maximum = (int) $template['maxScore'];
        if ($minimum !== $expectedMinimum || $maximum < $minimum) {
            failAudit("{$label} score range is not contiguous at {$minimum}–{$maximum}; expected start {$expectedMinimum}.");
        }
        $expectedMinimum = $maximum + 1;

        try {
            $free = json_decode((string) $template['freeJson'], true, 512, JSON_THROW_ON_ERROR);
            $paid = json_decode((string) $template['paidJson'], true, 512, JSON_THROW_ON_ERROR);
        } catch (Throwable $error) {
            failAudit("{$label} contains invalid JSON: {$error->getMessage()}");
            continue;
        }

        $freeOk = is_array($free)
            && trim((string) ($free['summary'] ?? '')) !== ''
            && nonEmptyStrings($free['strengths'] ?? null)
            && nonEmptyStrings($free['watchouts'] ?? null);
        if (!$freeOk) failAudit("{$label} Lite Report requires summary, strengths and watchouts.");
        else passAudit("{$label} Lite Report content is complete");

        $richFields = 0;
        foreach (['developmentAreas', 'relationships', 'work', 'workingStyleTips', 'handlingDifficulty', 'growth'] as $key) {
            $value = $paid[$key] ?? null;
            if ((is_string($value) && trim($value) !== '') || (is_array($value) && $value)) $richFields++;
        }
        $paidOk = is_array($paid)
            && trim((string) ($paid['summary'] ?? '')) !== ''
            && nonEmptyStrings($paid['strengths'] ?? null)
            && nonEmptyStrings($paid['watchouts'] ?? null)
            && is_array($paid['subscaleReads'] ?? null)
            && count($paid['subscaleReads']) === 10
            && upgradeReasonsValid($paid['upgradeReasons'] ?? null)
            && $richFields >= 4;
        if (!$paidOk) failAudit("{$label} Full Report content is incomplete or does not match the approved rich schema.");
        else passAudit("{$label} Full Report content and upgrade preview are complete");
    }

    if ($expectedMinimum !== 251) {
        failAudit("{$trackKey} report score ranges do not cover the complete 50–250 score range.");
    } else {
        passAudit("{$trackKey} report profiles cover scores 50–250 without gaps");
    }

    $priceKey = 'stripe.price_' . $trackKey;
    $price = trim((string) $settings->get($priceKey, $_ENV['STRIPE_PRICE_' . strtoupper($trackKey)] ?? ''));
    if ($price === '') warnAudit("{$trackKey} Stripe Price ID is not configured; its buy button must remain disabled.");
    else passAudit("{$trackKey} Stripe Price ID is configured");
}

$stripeSecret = configuredSecret($db, 'stripe.secret_key') || trim((string) ($_ENV['STRIPE_SECRET_KEY'] ?? '')) !== '';
$webhookSecret = configuredSecret($db, 'stripe.webhook_secret') || trim((string) ($_ENV['STRIPE_WEBHOOK_SECRET'] ?? '')) !== '';
if (!$stripeSecret) warnAudit('Stripe secret key is not configured; no paid checkout can start.');
else passAudit('Stripe secret key is configured and redacted');
if (!$webhookSecret) warnAudit('Stripe signed webhook secret is not configured; no payment can unlock a report.');
else passAudit('Stripe webhook secret is configured and redacted');

if ($requireCheckout && $warnings) {
    foreach ($warnings as $warning) $failures[] = $warning;
}

echo "==================================================\n";
echo ' FINAL RESULT: failures=' . count($failures) . ' warnings=' . count($warnings) . "\n";
echo $failures ? " REPORT FLOW: NOT READY\n" : " REPORT CONTENT: READY\n";
echo $warnings ? " PAID CHECKOUT: PENDING CONFIGURATION\n" : " PAID CHECKOUT: READY\n";
echo "==================================================\n";

exit($failures ? 2 : 0);
