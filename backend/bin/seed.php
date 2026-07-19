#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__) . '/src/bootstrap.php';
$data = json_decode(file_get_contents(dirname(__DIR__, 2) . '/database/seeds/assessment-v1.json'), true, 512, JSON_THROW_ON_ERROR);
$prices = ['personal' => 499, 'newjoiner' => 1900, 'manager' => 2900, 'executive' => 9900];
$durations = ['personal' => [15, 15], 'newjoiner' => [15, 15], 'manager' => [15, 18], 'executive' => [18, 20]];
$audiences = [
    'personal' => 'Personal reflection',
    'newjoiner' => 'New joiners and early-career professionals',
    'manager' => 'People managers',
    'executive' => 'Senior leaders and executives',
];

foreach ($data['tracks'] as $track) {
    $container['db']->transaction(function () use ($container, $track, $data, $prices, $durations, $audiences) {
        $existing = $container['db']->fetch('SELECT id FROM assessment_tracks WHERE track_key = ?', [$track['key']]);
        $trackId = $existing
            ? (int) $existing['id']
            : $container['db']->insert(
                'INSERT INTO assessment_tracks (track_key, name, description, price_minor, currency, is_active, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW())',
                [$track['key'], $track['label'], $track['tagline'], $prices[$track['key']], 'USD', array_search($track['key'], ['personal', 'newjoiner', 'manager', 'executive'], true) + 1]
            );

        [$durationMin, $durationMax] = $durations[$track['key']];
        $container['db']->execute(
            'INSERT INTO assessment_track_settings (track_id, public_title, short_title, audience_label, estimated_minutes_min, estimated_minutes_max, average_seconds_per_question, average_seconds_per_participant_field, free_report_label, paid_report_label, free_report_read_minutes, paid_report_read_minutes, question_count, section_count, show_remaining_time, show_question_count, show_section_count, show_autosave, last_reviewed_date, updated_at) VALUES (?, ?, ?, ?, ?, ?, 18, 12, ?, ?, 3, 12, 50, 10, 1, 1, 1, 1, CURDATE(), NOW()) ON DUPLICATE KEY UPDATE public_title = VALUES(public_title), short_title = VALUES(short_title), audience_label = VALUES(audience_label), estimated_minutes_min = VALUES(estimated_minutes_min), estimated_minutes_max = VALUES(estimated_minutes_max), updated_at = NOW()',
            [$trackId, 'Head–Heart Alignment: ' . $track['label'], $track['label'], $audiences[$track['key']], $durationMin, $durationMax, 'Lite Report Free', 'Full Report']
        );

        $version = $container['db']->fetch('SELECT id FROM assessment_versions WHERE track_id = ? AND version_number = ?', [$trackId, $data['version']]);
        if ($version) return;
        $versionId = $container['db']->insert('INSERT INTO assessment_versions (track_id, version_number, status, change_summary, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())', [$trackId, $data['version'], 'published', 'Imported from the preserved V2 assessment source.']);
        foreach ($track['answerChoices'] as $index => $label) {
            $container['db']->execute('INSERT INTO answer_options (assessment_version_id, option_value, label, display_order) VALUES (?, ?, ?, ?)', [$versionId, $index + 1, $label, $index + 1]);
        }
        $position = 1;
        foreach ($track['subscales'] as $sectionIndex => $section) {
            $sectionId = $container['db']->insert('INSERT INTO assessment_sections (assessment_version_id, code, name, display_order, is_active) VALUES (?, ?, ?, ?, 1)', [$versionId, $section['code'], $section['name'], $sectionIndex + 1]);
            foreach ($section['items'] as $itemIndex => $item) {
                $container['db']->execute('INSERT INTO questions (assessment_version_id, section_id, stable_key, question_text, scoring_direction, position, is_required, is_active) VALUES (?, ?, ?, ?, ?, ?, 1, 1)', [$versionId, $sectionId, sprintf('%s-%02d', $section['code'], $itemIndex + 1), $item['t'], $item['d'], $position++]);
            }
        }
        foreach ($track['profiles'] as $profile) {
            $bounds = $profile['range'];
            $profileKey = strtolower(preg_replace('/[^a-z0-9]+/i', '-', trim($profile['name'])));
            $free = ['summary' => $profile['summary'], 'strengths' => array_slice($profile['strengths'] ?? [], 0, 3), 'watchouts' => array_slice($profile['watchouts'] ?? [], 0, 3)];
            $paid = $profile + ['subscaleReads' => $track['subscaleReads'], 'upgradeReasons' => $track['upgradeReasons']];
            $container['db']->execute('INSERT INTO report_templates (assessment_version_id, profile_key, profile_name, min_score, max_score, free_content_json, paid_content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', [$versionId, $profileKey, $profile['name'], $bounds[0], $bounds[1], json_encode($free), json_encode($paid)]);
        }
    });
}

echo "Assessment V1 seed complete.\n";
