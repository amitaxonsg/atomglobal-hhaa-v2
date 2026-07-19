<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;
use AtomGlobal\Mail\MailQueue;

final class SurveyService
{
    public function __construct(
        private Database $db,
        private ScoringService $scoring,
        private ReportService $reports,
        private MailQueue $mailQueue,
        private array $config,
    ) {}

    public function create(array $payload): array
    {
        return $this->db->transaction(function () use ($payload) {
            $track = $this->db->fetch(
                'SELECT t.id, t.track_key, t.name, v.id version_id, v.version_number FROM assessment_tracks t JOIN assessment_versions v ON v.track_id = t.id AND v.status = ? WHERE t.track_key = ? AND t.is_active = 1 LIMIT 1',
                ['published', $payload['trackKey'] ?? '']
            );
            if (!$track) throw new \InvalidArgumentException('Assessment track is unavailable.');

            $participant = is_array($payload['participant'] ?? null) ? $payload['participant'] : [];
            $name = trim((string) ($participant['name'] ?? ''));
            $email = strtolower(trim((string) ($participant['email'] ?? '')));
            if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($participant['privacyConsent']) || empty($participant['transactionalConsent'])) {
                throw new \InvalidArgumentException('Name, valid email, privacy consent and transactional consent are required.');
            }

            $existing = $this->db->fetch('SELECT id FROM participants WHERE email_normalized = ? AND anonymised_at IS NULL ORDER BY id DESC LIMIT 1', [$email]);
            if ($existing) {
                $participantId = (int) $existing['id'];
                $this->db->execute('UPDATE participants SET name = ?, marketing_consent = ?, transactional_consent = 1, updated_at = NOW() WHERE id = ?', [$name, !empty($participant['marketingConsent']) ? 1 : 0, $participantId]);
            } else {
                $participantId = $this->db->insert(
                    'INSERT INTO participants (name, email, marketing_consent, transactional_consent, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())',
                    [$name, $email, !empty($participant['marketingConsent']) ? 1 : 0]
                );
            }

            $affiliate = null;
            $affiliateCode = strtoupper(trim((string) ($payload['affiliateCode'] ?? '')));
            if ($affiliateCode !== '') {
                $affiliate = $this->db->fetch('SELECT * FROM affiliates WHERE affiliate_code = ? AND is_active = 1 LIMIT 1', [$affiliateCode]);
            }

            $attribution = is_array($payload['attribution'] ?? null) ? $payload['attribution'] : [];
            $clickId = null;
            if ($affiliate) {
                $clickId = $this->db->insert(
                    'INSERT INTO affiliate_clicks (affiliate_id, ip_hash, user_agent_hash, landing_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term, clicked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
                    [
                        $affiliate['id'],
                        hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . ($this->config['key'] ?? '')),
                        hash('sha256', ($_SERVER['HTTP_USER_AGENT'] ?? '') . ($this->config['key'] ?? '')),
                        (string) ($attribution['landingPage'] ?? '/'),
                        $attribution['utmSource'] ?? null,
                        $attribution['utmMedium'] ?? null,
                        $attribution['utmCampaign'] ?? null,
                        $attribution['utmContent'] ?? null,
                        $attribution['utmTerm'] ?? null,
                    ]
                );
            }

            $resumeToken = bin2hex(random_bytes(32));
            $snapshot = $this->versionSnapshot((int) $track['version_id']);
            $hours = max(1, (int) ($this->config['resume_token_hours'] ?? 168));
            $sessionId = $this->db->insert(
                'INSERT INTO survey_sessions (participant_id, track_id, assessment_version_id, affiliate_id, first_click_id, last_click_id, status, resume_token_hash, resume_expires_at, question_snapshot_json, participant_context_json, attribution_snapshot_json, last_activity_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR), ?, ?, ?, NOW(), NOW(), NOW())',
                [$participantId, $track['id'], $track['version_id'], $affiliate['id'] ?? null, $clickId, $clickId, 'in_progress', hash('sha256', $resumeToken), $hours, json_encode($snapshot), json_encode($participant), json_encode($attribution)]
            );

            if ($affiliate) {
                $this->db->execute(
                    'INSERT INTO affiliate_attributions (affiliate_id, participant_id, survey_session_id, first_click_id, last_click_id, referral_at) VALUES (?, ?, ?, ?, ?, NOW())',
                    [$affiliate['id'], $participantId, $sessionId, $clickId, $clickId]
                );
            }

            $ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . ($this->config['key'] ?? ''));
            $this->db->execute(
                'INSERT INTO consent_logs (participant_id, survey_session_id, consent_type, consent_granted, wording_snapshot, ip_hash, created_at) VALUES (?, ?, ?, 1, ?, ?, NOW()), (?, ?, ?, ?, ?, ?, NOW()), (?, ?, ?, 1, ?, ?, NOW())',
                [$participantId, $sessionId, 'privacy', (string) ($payload['privacyWording'] ?? 'Assessment privacy consent'), $ipHash, $participantId, $sessionId, 'marketing', !empty($participant['marketingConsent']) ? 1 : 0, (string) ($payload['marketingWording'] ?? 'Optional marketing consent'), $ipHash, $participantId, $sessionId, 'transactional', (string) ($payload['transactionalWording'] ?? 'Transactional assessment communication consent'), $ipHash]
            );

            $resumeUrl = rtrim((string) $this->config['url'], '/') . '/?resume=' . rawurlencode($resumeToken);
            $this->mailQueue->enqueue('participant_registration', $email, ['participantName' => $name, 'trackName' => $track['name']]);
            $this->mailQueue->enqueue('survey_resume_link', $email, ['participantName' => $name, 'trackName' => $track['name'], 'resumeUrl' => $resumeUrl]);
            $this->analytics($sessionId, 'survey_started', ['track' => $track['track_key'], 'affiliateCode' => $affiliateCode ?: null]);

            return [
                'id' => $sessionId,
                'resumeToken' => $resumeToken,
                'resumeUrl' => $resumeUrl,
                'trackKey' => $track['track_key'],
                'assessmentVersion' => $track['version_number'],
                'assessment' => $this->publicAssessment($snapshot),
                'status' => 'in_progress',
                'section' => 0,
                'answers' => [],
                'participant' => $participant,
                'updatedAt' => gmdate(DATE_ATOM),
            ];
        });
    }

    public function resume(string $token): array
    {
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) throw new \RuntimeException('Resume link is invalid.', 404);
        $session = $this->db->fetch(
            'SELECT s.*, t.track_key, v.version_number, p.name, p.email, p.marketing_consent, p.transactional_consent FROM survey_sessions s JOIN participants p ON p.id = s.participant_id JOIN assessment_tracks t ON t.id = s.track_id JOIN assessment_versions v ON v.id = s.assessment_version_id WHERE s.resume_token_hash = ? AND s.resume_expires_at > NOW() AND s.status = ? LIMIT 1',
            [hash('sha256', $token), 'in_progress']
        );
        if (!$session) throw new \RuntimeException('Resume link is invalid or expired.', 404);

        $snapshot = json_decode($session['question_snapshot_json'], true, 512, JSON_THROW_ON_ERROR);
        $answerRows = $this->db->fetchAll('SELECT question_position, answer_value, note FROM survey_answers WHERE survey_session_id = ? ORDER BY question_position', [$session['id']]);
        $answers = array_fill(0, count($snapshot['questions'] ?? []), ['value' => null, 'note' => '']);
        foreach ($answerRows as $answer) {
            $index = (int) $answer['question_position'] - 1;
            if (isset($answers[$index])) $answers[$index] = ['value' => (int) $answer['answer_value'], 'note' => $answer['note'] ?? ''];
        }

        $this->db->execute('UPDATE survey_sessions SET last_activity_at = NOW(), updated_at = NOW() WHERE id = ?', [$session['id']]);
        $this->db->execute('UPDATE abandoned_survey_events SET resumed_at = NOW(), status = ? WHERE survey_session_id = ? AND resumed_at IS NULL', ['resumed', $session['id']]);
        $this->analytics((int) $session['id'], 'survey_resumed');

        return [
            'id' => (int) $session['id'],
            'resumeToken' => $token,
            'trackKey' => $session['track_key'],
            'assessmentVersion' => $session['version_number'],
            'assessment' => $this->publicAssessment($snapshot),
            'status' => $session['status'],
            'section' => (int) $session['current_section'],
            'answers' => $answers,
            'participant' => array_merge(json_decode($session['participant_context_json'] ?: '{}', true) ?: [], [
                'name' => $session['name'], 'email' => $session['email'],
                'marketingConsent' => (bool) $session['marketing_consent'],
                'transactionalConsent' => (bool) $session['transactional_consent'],
                'privacyConsent' => true,
            ]),
            'updatedAt' => $session['updated_at'],
        ];
    }

    public function save(int $id, array $payload): array
    {
        return $this->db->transaction(function () use ($id, $payload) {
            $this->requireSessionToken($id, (string) ($payload['resumeToken'] ?? ''));
            $this->persistAnswers($id, $payload);
            $session = $this->db->fetch('SELECT current_section, completion_percentage, updated_at FROM survey_sessions WHERE id = ?', [$id]);
            return [
                'id' => $id,
                'resumeToken' => $payload['resumeToken'],
                'status' => 'in_progress',
                'section' => (int) ($session['current_section'] ?? 0),
                'completionPercentage' => (int) ($session['completion_percentage'] ?? 0),
                'updatedAt' => $session['updated_at'] ?? gmdate(DATE_ATOM),
            ];
        });
    }

    public function complete(int $id, array $payload): array
    {
        return $this->db->transaction(function () use ($id, $payload) {
            $this->requireSessionToken($id, (string) ($payload['resumeToken'] ?? ''));
            $this->persistAnswers($id, $payload);
            $session = $this->db->fetch('SELECT * FROM survey_sessions WHERE id = ? FOR UPDATE', [$id]);
            if (!$session) throw new \RuntimeException('Assessment session not found.', 404);
            if ($session['status'] === 'completed') {
                $report = $this->db->fetch('SELECT id FROM generated_reports WHERE survey_session_id = ?', [$id]);
                return ['id' => $id, 'status' => 'completed', 'reportId' => $report['id'] ?? null];
            }

            $answerCount = $this->db->fetch('SELECT COUNT(*) count FROM survey_answers WHERE survey_session_id = ?', [$id]);
            if ((int) ($answerCount['count'] ?? 0) !== 50) throw new \InvalidArgumentException('All 50 questions must be answered before completion.');

            $snapshot = json_decode($session['question_snapshot_json'], true, 512, JSON_THROW_ON_ERROR);
            $score = $this->scoring->score($snapshot['questions'], $payload['answers'] ?? [], $snapshot['profiles']);
            $answerSnapshot = $this->db->fetchAll('SELECT question_position, answer_value, note, answered_at FROM survey_answers WHERE survey_session_id = ? ORDER BY question_position', [$id]);
            $scoreId = $this->db->insert(
                'INSERT INTO score_snapshots (survey_session_id, assessment_version_id, total_score, subscale_scores_json, profile_key, scoring_rules_json, answers_snapshot_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
                [$id, $session['assessment_version_id'], $score['total'], json_encode($score['subscales']), $score['profile']['profile_key'], json_encode($snapshot['scoring']), json_encode($answerSnapshot)]
            );
            $report = $this->reports->generate($id, $scoreId, $score, $snapshot);
            $this->db->execute('UPDATE survey_sessions SET status = ?, completion_percentage = 100, completed_at = NOW(), last_activity_at = NOW(), updated_at = NOW() WHERE id = ?', ['completed', $id]);
            $this->db->execute('UPDATE affiliate_attributions SET conversion_at = NOW() WHERE survey_session_id = ?', [$id]);

            $participant = $this->db->fetch('SELECT p.name, p.email, t.name trackName FROM survey_sessions s JOIN participants p ON p.id = s.participant_id JOIN assessment_tracks t ON t.id = s.track_id WHERE s.id = ?', [$id]);
            if ($participant) {
                $reportUrl = rtrim((string) $this->config['url'], '/') . '/report/' . rawurlencode($report['token']);
                $this->mailQueue->enqueue('assessment_completed', $participant['email'], ['participantName' => $participant['name'], 'trackName' => $participant['trackName']]);
                $this->mailQueue->enqueue('free_report_ready', $participant['email'], ['participantName' => $participant['name'], 'trackName' => $participant['trackName'], 'reportUrl' => $reportUrl]);
            }
            $this->analytics($id, 'survey_completed', ['score' => $score['total'], 'profile' => $score['profile']['profile_key']]);

            return ['id' => $id, 'status' => 'completed', 'reportToken' => $report['token'], 'reportId' => $report['id']];
        });
    }

    private function requireSessionToken(int $id, string $token): array
    {
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) throw new \RuntimeException('Assessment session token is required.', 401);
        $session = $this->db->fetch('SELECT * FROM survey_sessions WHERE id = ? AND resume_token_hash = ? AND resume_expires_at > NOW() LIMIT 1', [$id, hash('sha256', $token)]);
        if (!$session) throw new \RuntimeException('Assessment session is invalid or expired.', 401);
        return $session;
    }

    private function completion(array $answers): int
    {
        return (int) round(count(array_filter($answers, fn($item) => ($item['value'] ?? null) !== null)) / 50 * 100);
    }

    private function persistAnswers(int $id, array $payload): void
    {
        foreach ($payload['answers'] ?? [] as $index => $answer) {
            if (($answer['value'] ?? null) === null) continue;
            $value = (int) $answer['value'];
            if ($value < 1 || $value > 5) throw new \InvalidArgumentException('Answer values must be between 1 and 5.');
            $this->db->execute(
                'INSERT INTO survey_answers (survey_session_id, question_position, answer_value, note, answered_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE answer_value = VALUES(answer_value), note = VALUES(note), answered_at = NOW()',
                [$id, $index + 1, $value, mb_substr((string) ($answer['note'] ?? ''), 0, 2000)]
            );
        }
        $this->db->execute(
            'UPDATE survey_sessions SET current_section = ?, completion_percentage = ?, last_activity_at = NOW(), updated_at = NOW() WHERE id = ? AND status = ?',
            [max(0, min(9, (int) ($payload['section'] ?? 0))), $this->completion($payload['answers'] ?? []), $id, 'in_progress']
        );
    }

    private function versionSnapshot(int $versionId): array
    {
        $questions = $this->db->fetchAll(
            'SELECT q.id, q.position, q.question_text, q.scoring_direction direction, s.code subscale_code, s.name subscale_name, s.display_order section_order FROM questions q JOIN assessment_sections s ON s.id = q.section_id WHERE q.assessment_version_id = ? AND q.is_active = 1 ORDER BY q.position',
            [$versionId]
        );
        if (count($questions) !== 50) throw new \RuntimeException('The published assessment does not contain exactly 50 active questions.');
        $profiles = $this->db->fetchAll('SELECT profile_key, profile_name, min_score, max_score, free_content_json, paid_content_json FROM report_templates WHERE assessment_version_id = ? ORDER BY min_score', [$versionId]);
        $options = $this->db->fetchAll('SELECT option_value value, label, display_order FROM answer_options WHERE assessment_version_id = ? ORDER BY display_order', [$versionId]);
        if (count($options) !== 5) throw new \RuntimeException('The published assessment does not contain exactly five answer choices.');
        return [
            'version_id' => $versionId,
            'questions' => $questions,
            'profiles' => $profiles,
            'options' => $options,
            'scoring' => ['scale_min' => 1, 'scale_max' => 5, 'reverse_formula' => '6 - answer', 'total_formula' => 'round(mean * 50)', 'subscale_formula' => 'round(mean * 5)'],
        ];
    }

    private function publicAssessment(array $snapshot): array
    {
        $sections = [];
        $questions = [];
        foreach ($snapshot['questions'] ?? [] as $question) {
            $code = (string) $question['subscale_code'];
            if (!isset($sections[$code])) {
                $sections[$code] = [
                    'code' => $code,
                    'name' => (string) $question['subscale_name'],
                    'order' => (int) $question['section_order'],
                ];
            }
            $questions[] = [
                'id' => (int) $question['id'],
                'position' => (int) $question['position'],
                'text' => (string) $question['question_text'],
                'direction' => (string) $question['direction'],
                'subscaleCode' => $code,
                'subscaleName' => (string) $question['subscale_name'],
                'sectionOrder' => (int) $question['section_order'],
            ];
        }
        usort($sections, static fn(array $left, array $right): int => $left['order'] <=> $right['order']);
        return [
            'versionId' => (int) ($snapshot['version_id'] ?? 0),
            'questions' => $questions,
            'sections' => array_values($sections),
            'answerChoices' => array_values(array_map(static fn(array $option): string => (string) $option['label'], $snapshot['options'] ?? [])),
        ];
    }

    private function analytics(int $sessionId, string $eventName, array $properties = []): void
    {
        $this->db->execute('INSERT INTO analytics_events (survey_session_id, event_name, event_properties_json, consent_state, created_at) VALUES (?, ?, ?, ?, NOW())', [$sessionId, $eventName, json_encode($properties), 'essential']);
    }
}
