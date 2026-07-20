#!/usr/bin/env php
<?php
declare(strict_types=1);

use AtomGlobal\Database;

const TARGET_VERSION = '2.0.0';
const TRACK_KEYS = ['personal', 'newjoiner', 'manager', 'executive'];
const CONFIRMATION = 'PUBLISH-EXACT-V2-AND-PRUNE-UNREFERENCED';
const REFERENCE_KEYS = [
    'questionnaire.reference_version',
    'questionnaire.reference_source_sha256',
    'questionnaire.reference_sha256',
];

$root = dirname(__DIR__, 2);
$container = require dirname(__DIR__) . '/src/bootstrap.php';
/** @var Database $db */
$db = $container['db'];

$options = getopt('', ['apply', 'prune-unreferenced', 'confirm:']);
$apply = array_key_exists('apply', $options);
$prune = array_key_exists('prune-unreferenced', $options);
$confirmation = (string) ($options['confirm'] ?? '');

if (($apply || $prune) && $confirmation !== CONFIRMATION) {
    fwrite(STDERR, "Refusing to change assessment data. Re-run with --confirm=" . CONFIRMATION . "\n");
    exit(64);
}

function versionReferences(Database $db, int $versionId): array
{
    $row = $db->fetch(
        'SELECT '
        . '(SELECT COUNT(*) FROM survey_sessions WHERE assessment_version_id = ?) sessionCount, '
        . '(SELECT COUNT(*) FROM score_snapshots WHERE assessment_version_id = ?) scoreCount, '
        . '(SELECT COUNT(*) FROM assessment_versions WHERE cloned_from_id = ?) cloneCount',
        [$versionId, $versionId, $versionId]
    ) ?: [];

    return [
        'sessions' => (int) ($row['sessionCount'] ?? 0),
        'scores' => (int) ($row['scoreCount'] ?? 0),
        'clones' => (int) ($row['cloneCount'] ?? 0),
    ];
}

function versionShape(Database $db, int $versionId): array
{
    $row = $db->fetch(
        'SELECT '
        . '(SELECT COUNT(*) FROM questions WHERE assessment_version_id = ? AND is_active = 1) questionCount, '
        . '(SELECT COUNT(*) FROM assessment_sections WHERE assessment_version_id = ? AND is_active = 1) sectionCount, '
        . '(SELECT COUNT(*) FROM answer_options WHERE assessment_version_id = ?) optionCount, '
        . '(SELECT COUNT(*) FROM report_templates WHERE assessment_version_id = ?) reportCount',
        [$versionId, $versionId, $versionId, $versionId]
    ) ?: [];

    return [
        'questions' => (int) ($row['questionCount'] ?? 0),
        'sections' => (int) ($row['sectionCount'] ?? 0),
        'options' => (int) ($row['optionCount'] ?? 0),
        'reports' => (int) ($row['reportCount'] ?? 0),
    ];
}

function assessmentRows(Database $db): array
{
    return $db->fetchAll(
        'SELECT t.id trackId, t.track_key trackKey, t.name trackName, '
        . 'v.id versionId, v.version_number versionNumber, v.status, '
        . 'v.published_at publishedAt, v.archived_at archivedAt '
        . 'FROM assessment_tracks t '
        . 'LEFT JOIN assessment_versions v ON v.track_id = t.id '
        . "WHERE t.track_key IN ('personal','newjoiner','manager','executive') "
        . 'ORDER BY t.display_order, v.created_at, v.id'
    );
}

function printAudit(Database $db): array
{
    $rows = assessmentRows($db);
    $summary = [];

    echo "\nASSESSMENT VERSION INTEGRITY\n";
    echo str_repeat('=', 96) . "\n";
    printf("%-11s %-9s %-10s %4s %4s %4s %4s %5s %5s\n", 'TRACK', 'VERSION', 'STATUS', 'Q', 'SEC', 'OPT', 'RPT', 'SESS', 'SCORE');

    foreach ($rows as $row) {
        if (empty($row['versionId'])) continue;
        $versionId = (int) $row['versionId'];
        $shape = versionShape($db, $versionId);
        $refs = versionReferences($db, $versionId);
        printf(
            "%-11s %-9s %-10s %4d %4d %4d %4d %5d %5d\n",
            $row['trackKey'],
            $row['versionNumber'],
            $row['status'],
            $shape['questions'],
            $shape['sections'],
            $shape['options'],
            $shape['reports'],
            $refs['sessions'],
            $refs['scores']
        );
        $summary[$row['trackKey']][] = $row + ['shape' => $shape, 'references' => $refs];
    }

    return $summary;
}

function targetIntegrity(Database $db): array
{
    $issues = [];
    foreach (TRACK_KEYS as $trackKey) {
        $published = $db->fetch(
            'SELECT v.id, v.version_number, v.status '
            . 'FROM assessment_tracks t JOIN assessment_versions v ON v.track_id = t.id '
            . 'WHERE t.track_key = ? AND v.status = ? ORDER BY v.published_at DESC, v.id DESC',
            [$trackKey, 'published']
        );
        if (!$published) {
            $issues[] = "$trackKey has no published assessment version";
            continue;
        }
        if ($published['version_number'] !== TARGET_VERSION) {
            $issues[] = "$trackKey publishes {$published['version_number']} instead of " . TARGET_VERSION;
            continue;
        }
        $shape = versionShape($db, (int) $published['id']);
        if ($shape['questions'] !== 50 || $shape['sections'] !== 10 || $shape['options'] !== 5 || $shape['reports'] < 1) {
            $issues[] = "$trackKey " . TARGET_VERSION . ' has an invalid questionnaire/report shape';
        }
    }
    return $issues;
}

$before = printAudit($db);
$issues = targetIntegrity($db);

if (!$apply) {
    echo "\nAUDIT RESULT\n";
    if (!$issues) {
        echo "OK: all four tracks publish exact CMS version " . TARGET_VERSION . ".\n";
        echo "No database changes were made.\n";
        exit(0);
    }
    foreach ($issues as $issue) echo "- $issue\n";
    echo "No database changes were made. Use the guarded apply command only after taking a full database backup.\n";
    exit(2);
}

$db->transaction(function () use ($db): void {
    foreach (TRACK_KEYS as $trackKey) {
        $track = $db->fetch('SELECT id FROM assessment_tracks WHERE track_key = ? FOR UPDATE', [$trackKey]);
        if (!$track) continue;

        $target = $db->fetch(
            'SELECT id, status FROM assessment_versions WHERE track_id = ? AND version_number = ? FOR UPDATE',
            [(int) $track['id'], TARGET_VERSION]
        );
        if (!$target) continue;

        $versionId = (int) $target['id'];
        $shape = versionShape($db, $versionId);
        $refs = versionReferences($db, $versionId);
        $validShape = $shape['questions'] === 50 && $shape['sections'] === 10 && $shape['options'] === 5 && $shape['reports'] > 0;
        $needsRebuild = $target['status'] !== 'published' || !$validShape;

        if (!$needsRebuild) continue;
        if ($refs['sessions'] > 0 || $refs['scores'] > 0) {
            throw new RuntimeException("Cannot rebuild $trackKey " . TARGET_VERSION . ': it is already referenced by participant sessions or score snapshots.');
        }

        $db->execute('DELETE FROM assessment_versions WHERE id = ?', [$versionId]);
        echo "Removed unreferenced incomplete $trackKey " . TARGET_VERSION . " so the exact reference can be rebuilt.\n";
    }

    $placeholders = implode(',', array_fill(0, count(REFERENCE_KEYS), '?'));
    $db->execute("DELETE FROM global_settings WHERE setting_key IN ($placeholders)", REFERENCE_KEYS);
});

$command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__DIR__ . '/seed.php');
passthru($command, $seedStatus);
if ($seedStatus !== 0) throw new RuntimeException('Exact CMS assessment import failed.');

$issues = targetIntegrity($db);
if ($issues) throw new RuntimeException("Assessment integrity remains invalid after import:\n- " . implode("\n- ", $issues));

$deleted = [];
if ($prune) {
    $db->transaction(function () use ($db, &$deleted): void {
        $rows = assessmentRows($db);
        foreach ($rows as $row) {
            if (empty($row['versionId']) || $row['versionNumber'] === TARGET_VERSION) continue;
            $versionId = (int) $row['versionId'];
            $refs = versionReferences($db, $versionId);

            if ($row['status'] === 'published') {
                throw new RuntimeException("Refusing to delete {$row['trackKey']} {$row['versionNumber']} because it is still published.");
            }
            if ($refs['sessions'] > 0 || $refs['scores'] > 0) {
                echo "Preserved {$row['trackKey']} {$row['versionNumber']} because historical sessions/reports reference it.\n";
                continue;
            }

            $db->execute('DELETE FROM assessment_versions WHERE id = ?', [$versionId]);
            $deleted[] = [
                'trackKey' => $row['trackKey'],
                'versionNumber' => $row['versionNumber'],
                'status' => $row['status'],
            ];
            echo "Deleted unreferenced obsolete version {$row['trackKey']} {$row['versionNumber']} ({$row['status']}).\n";
        }
    });
}

$after = printAudit($db);
$issues = targetIntegrity($db);
if ($issues) throw new RuntimeException("Final integrity audit failed:\n- " . implode("\n- ", $issues));

$db->execute(
    'INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, before_json, after_json, created_at) VALUES (NULL, ?, ?, ?, ?, ?, NOW())',
    [
        'assessment.integrity_repaired',
        'assessment_reference',
        TARGET_VERSION,
        json_encode($before, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        json_encode(['versions' => $after, 'deletedUnreferencedVersions' => $deleted], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]
);

echo "\nOK: Personal, New Joiner, Manager and Executive now publish exact CMS version " . TARGET_VERSION . ".\n";
echo "OK: participant sessions, score snapshots and generated reports were preserved.\n";
echo "OK: only unreferenced obsolete questionnaire versions were eligible for deletion.\n";
