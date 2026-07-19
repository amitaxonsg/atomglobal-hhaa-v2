<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;

final class AssessmentExperienceService
{
    public function __construct(private Database $db) {}

    public function publicConfiguration(): array
    {
        $rows = $this->db->fetchAll(
            'SELECT t.id trackId, t.track_key trackKey, t.name trackName, t.price_minor priceMinor, t.currency, '
            . 's.introductory_note introBody, s.intro_offer introOffer, s.heart_label heartLabel, '
            . 's.heart_description heartDescription, s.head_label headLabel, s.head_description headDescription, '
            . 's.intake_configuration_json intakeConfiguration, s.allow_not_applicable allowNotApplicable, '
            . 's.allow_answer_notes allowAnswerNotes '
            . 'FROM assessment_tracks t LEFT JOIN assessment_track_settings s ON s.track_id = t.id '
            . 'WHERE t.is_active = 1 ORDER BY t.display_order'
        );

        $tracks = [];
        foreach ($rows as $row) {
            $tracks[$row['trackKey']] = $this->normalise($row);
        }
        return ['tracks' => $tracks];
    }

    public function byTrackId(int $trackId): array
    {
        $row = $this->db->fetch(
            'SELECT t.id trackId, t.track_key trackKey, t.name trackName, t.price_minor priceMinor, t.currency, '
            . 's.introductory_note introBody, s.intro_offer introOffer, s.heart_label heartLabel, '
            . 's.heart_description heartDescription, s.head_label headLabel, s.head_description headDescription, '
            . 's.intake_configuration_json intakeConfiguration, s.allow_not_applicable allowNotApplicable, '
            . 's.allow_answer_notes allowAnswerNotes '
            . 'FROM assessment_tracks t LEFT JOIN assessment_track_settings s ON s.track_id = t.id WHERE t.id = ? LIMIT 1',
            [$trackId]
        );
        if (!$row) throw new \RuntimeException('Assessment track not found.', 404);
        return $this->normalise($row);
    }

    public function save(int $trackId, array $payload, int $adminId): array
    {
        $track = $this->db->fetch('SELECT id, track_key, name FROM assessment_tracks WHERE id = ?', [$trackId]);
        if (!$track) throw new \RuntimeException('Assessment track not found.', 404);

        $intake = $this->validateIntake($payload['intake'] ?? null);
        $values = [
            'introBody' => $this->text($payload['introBody'] ?? '', 5000),
            'introOffer' => $this->text($payload['introOffer'] ?? '', 5000),
            'heartLabel' => $this->text($payload['heartLabel'] ?? 'Heart', 100) ?: 'Heart',
            'heartDescription' => $this->text($payload['heartDescription'] ?? 'Feeling, intuition, connection, meaning', 255),
            'headLabel' => $this->text($payload['headLabel'] ?? 'Head', 100) ?: 'Head',
            'headDescription' => $this->text($payload['headDescription'] ?? 'Logic, analysis, control, proof', 255),
            'intake' => $intake,
            'allowNotApplicable' => !empty($payload['allowNotApplicable']),
            'allowAnswerNotes' => !empty($payload['allowAnswerNotes']),
        ];

        $this->db->execute(
            'INSERT INTO assessment_track_settings '
            . '(track_id, public_title, short_title, estimated_minutes_min, estimated_minutes_max, free_report_label, paid_report_label, question_count, section_count, show_remaining_time, show_question_count, show_section_count, show_autosave, introductory_note, intro_offer, heart_label, heart_description, head_label, head_description, intake_configuration_json, allow_not_applicable, allow_answer_notes, updated_at) '
            . 'VALUES (?, ?, ?, 15, 15, ?, ?, 50, 10, 1, 1, 1, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) '
            . 'ON DUPLICATE KEY UPDATE introductory_note = VALUES(introductory_note), intro_offer = VALUES(intro_offer), '
            . 'heart_label = VALUES(heart_label), heart_description = VALUES(heart_description), head_label = VALUES(head_label), '
            . 'head_description = VALUES(head_description), intake_configuration_json = VALUES(intake_configuration_json), '
            . 'allow_not_applicable = VALUES(allow_not_applicable), allow_answer_notes = VALUES(allow_answer_notes), updated_at = NOW()',
            [
                $trackId,
                'Head–Heart Alignment: ' . $track['name'],
                $track['name'],
                'Lite Report Free',
                'Full Report',
                $values['introBody'] ?: null,
                $values['introOffer'] ?: null,
                $values['heartLabel'],
                $values['heartDescription'],
                $values['headLabel'],
                $values['headDescription'],
                json_encode($values['intake'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                $values['allowNotApplicable'] ? 1 : 0,
                $values['allowAnswerNotes'] ? 1 : 0,
            ]
        );

        $this->db->execute(
            'INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, after_json, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [$adminId, 'assessment_experience.saved', 'assessment_track', (string) $trackId, json_encode($values)]
        );

        return $this->byTrackId($trackId);
    }

    private function normalise(array $row): array
    {
        $intake = json_decode((string) ($row['intakeConfiguration'] ?? ''), true);
        return [
            'trackId' => (int) $row['trackId'],
            'trackKey' => (string) $row['trackKey'],
            'trackName' => (string) $row['trackName'],
            'priceMinor' => (int) ($row['priceMinor'] ?? 0),
            'currency' => (string) ($row['currency'] ?? 'USD'),
            'introBody' => (string) ($row['introBody'] ?? ''),
            'introOffer' => (string) ($row['introOffer'] ?? ''),
            'heartLabel' => (string) ($row['heartLabel'] ?? 'Heart'),
            'heartDescription' => (string) ($row['heartDescription'] ?? 'Feeling, intuition, connection, meaning'),
            'headLabel' => (string) ($row['headLabel'] ?? 'Head'),
            'headDescription' => (string) ($row['headDescription'] ?? 'Logic, analysis, control, proof'),
            'intake' => is_array($intake) ? $intake : null,
            'allowNotApplicable' => (bool) ($row['allowNotApplicable'] ?? true),
            'allowAnswerNotes' => (bool) ($row['allowAnswerNotes'] ?? true),
        ];
    }

    private function validateIntake(mixed $value): array
    {
        if (!is_array($value)) throw new \InvalidArgumentException('The participant intake configuration must be an object.');
        $result = [];
        foreach (['who', 'what', 'where', 'why', 'how'] as $prefix) {
            $labelKey = $prefix . 'Label';
            $optionsKey = $prefix . 'Options';
            $label = $this->text($value[$labelKey] ?? '', 255);
            $options = is_array($value[$optionsKey] ?? null) ? $value[$optionsKey] : [];
            $options = array_values(array_filter(array_map(fn($item) => $this->text($item, 200), $options)));
            if ($label === '' || count($options) < 2 || count($options) > 300) {
                throw new \InvalidArgumentException('Each intake field requires a label and at least two options.');
            }
            $result[$labelKey] = $label;
            $result[$optionsKey] = $options;
        }
        return $result;
    }

    private function text(mixed $value, int $limit): string
    {
        return mb_substr(trim((string) $value), 0, $limit);
    }
}
