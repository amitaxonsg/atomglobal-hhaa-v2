<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;

final class SurveyService
{
    public function __construct(private Database $db, private ScoringService $scoring, private ReportService $reports) {}
    public function create(array $payload): array
    {
        return $this->db->transaction(function () use ($payload) {
            $track = $this->db->fetch('SELECT t.id, t.track_key, v.id version_id, v.version_number FROM assessment_tracks t JOIN assessment_versions v ON v.track_id = t.id AND v.status = ? WHERE t.track_key = ? LIMIT 1', ['published', $payload['trackKey'] ?? '']);
            if (!$track) throw new \InvalidArgumentException('Assessment track is unavailable.');
            $participant = $payload['participant'] ?? [];
            if (!filter_var($participant['email'] ?? '', FILTER_VALIDATE_EMAIL) || empty($participant['privacyConsent']) || empty($participant['transactionalConsent'])) throw new \InvalidArgumentException('Valid participant consent and email are required.');
            $participantId = $this->db->insert('INSERT INTO participants (name, email, marketing_consent, transactional_consent, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', [trim($participant['name'] ?? ''), strtolower($participant['email']), !empty($participant['marketingConsent']), !empty($participant['transactionalConsent'])]);
            $resumeToken = bin2hex(random_bytes(32));
            $snapshot = $this->versionSnapshot((int) $track['version_id']);
            $sessionId = $this->db->insert('INSERT INTO survey_sessions (participant_id, track_id, assessment_version_id, status, resume_token_hash, resume_expires_at, question_snapshot_json, participant_context_json, last_activity_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), ?, ?, NOW(), NOW(), NOW())', [$participantId, $track['id'], $track['version_id'], 'in_progress', hash('sha256', $resumeToken), json_encode($snapshot), json_encode($participant)]);
            $this->db->execute('INSERT INTO consent_logs (participant_id, survey_session_id, consent_type, consent_granted, wording_snapshot, ip_hash, created_at) VALUES (?, ?, ?, 1, ?, ?, NOW()), (?, ?, ?, ?, ?, ?, NOW())', [$participantId, $sessionId, 'privacy', 'Assessment privacy consent', hash('sha256', $_SERVER['REMOTE_ADDR'] ?? ''), $participantId, $sessionId, 'marketing', !empty($participant['marketingConsent']), 'Optional marketing consent', hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '')]);
            return ['id' => $sessionId, 'token' => $resumeToken, 'trackKey' => $track['track_key'], 'assessmentVersion' => $track['version_number'], 'status' => 'in_progress'];
        });
    }
    public function save(int $id, array $payload): array
    {
        return $this->db->transaction(function () use ($id, $payload) {
            $this->persistAnswers($id, $payload);
            return ['id' => $id, 'status' => 'in_progress', 'updatedAt' => gmdate(DATE_ATOM)];
        });
    }
    public function complete(int $id, array $payload): array
    {
        return $this->db->transaction(function () use ($id, $payload) {
            $this->persistAnswers($id, $payload);
            $session = $this->db->fetch('SELECT * FROM survey_sessions WHERE id = ? FOR UPDATE', [$id]);
            if (!$session || $session['status'] === 'completed') return ['id' => $id, 'status' => 'completed'];
            $snapshot = json_decode($session['question_snapshot_json'], true, 512, JSON_THROW_ON_ERROR);
            $score = $this->scoring->score($snapshot['questions'], $payload['answers'] ?? [], $snapshot['profiles']);
            $answerSnapshot = $this->db->fetchAll('SELECT question_position, answer_value, note, answered_at FROM survey_answers WHERE survey_session_id = ? ORDER BY question_position', [$id]);
            $scoreId = $this->db->insert('INSERT INTO score_snapshots (survey_session_id, assessment_version_id, total_score, subscale_scores_json, profile_key, scoring_rules_json, answers_snapshot_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [$id, $session['assessment_version_id'], $score['total'], json_encode($score['subscales']), $score['profile']['profile_key'], json_encode($snapshot['scoring']), json_encode($answerSnapshot)]);
            $report = $this->reports->generate($id, $scoreId, $score, $snapshot);
            $this->db->execute('UPDATE survey_sessions SET status = ?, completion_percentage = 100, completed_at = NOW(), updated_at = NOW() WHERE id = ?', ['completed', $id]);
            return ['id' => $id, 'status' => 'completed', 'reportToken' => $report['token']];
        });
    }
    private function completion(array $answers): int { return (int) round(count(array_filter($answers, fn($item) => ($item['value'] ?? null) !== null)) / 50 * 100); }
    private function persistAnswers(int $id, array $payload): void
    {
        foreach ($payload['answers'] ?? [] as $index => $answer) {
            if (($answer['value'] ?? null) === null) continue;
            $this->db->execute('INSERT INTO survey_answers (survey_session_id, question_position, answer_value, note, answered_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE answer_value = VALUES(answer_value), note = VALUES(note), answered_at = NOW()', [$id, $index + 1, $answer['value'], $answer['note'] ?? '']);
        }
        $this->db->execute('UPDATE survey_sessions SET current_section = ?, completion_percentage = ?, last_activity_at = NOW(), updated_at = NOW() WHERE id = ? AND status = ?', [(int) ($payload['section'] ?? 0), $this->completion($payload['answers'] ?? []), $id, 'in_progress']);
    }
    private function versionSnapshot(int $versionId): array
    {
        $questions = $this->db->fetchAll('SELECT q.id, q.position, q.question_text, q.scoring_direction direction, s.code subscale_code FROM questions q JOIN assessment_sections s ON s.id = q.section_id WHERE q.assessment_version_id = ? ORDER BY q.position', [$versionId]);
        $profiles = $this->db->fetchAll('SELECT profile_key, profile_name, min_score, max_score, free_content_json, paid_content_json FROM report_templates WHERE assessment_version_id = ? ORDER BY min_score', [$versionId]);
        return ['version_id' => $versionId, 'questions' => $questions, 'profiles' => $profiles, 'scoring' => ['scale_min' => 1, 'scale_max' => 5, 'reverse_formula' => '6 - answer', 'total_formula' => 'round(mean * 50)', 'subscale_formula' => 'round(mean * 5)']];
    }
}
