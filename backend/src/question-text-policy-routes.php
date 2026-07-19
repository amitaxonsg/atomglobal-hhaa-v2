<?php
declare(strict_types=1);

use AtomGlobal\Http\Request;
use AtomGlobal\Http\Response;

$router->add('PUT', '/api/admin/questions/{id}', function (Request $request, array $params) use ($auth, $db, $csrf) {
    $user = $auth->requirePermission('assessments.manage');
    $csrf($request);

    $id = (int) $params['id'];
    $question = $db->fetch(
        'SELECT q.*, v.status version_status FROM questions q '
        . 'JOIN assessment_versions v ON v.id = q.assessment_version_id WHERE q.id = ?',
        [$id]
    );
    if (!$question) return Response::error('Question not found.', 404);
    if ($question['version_status'] !== 'draft') {
        return Response::error('Published and archived questions are immutable. Clone the version before correcting text.', 422);
    }

    $payload = $request->body;
    $forbidden = ['scoringDirection', 'position', 'required', 'active', 'sectionId', 'stableKey'];
    foreach ($forbidden as $field) {
        if (array_key_exists($field, $payload)) {
            return Response::error('Only question text may be corrected. Scoring, position, section, identity and active state are locked.', 422);
        }
    }
    if (($payload['confirmMeaningUnchanged'] ?? false) !== true) {
        return Response::error('Confirm that the correction does not change the question meaning or scoring intent.', 422);
    }

    $text = trim((string) ($payload['questionText'] ?? ''));
    if (mb_strlen($text) < 10 || mb_strlen($text) > 2000) {
        return Response::error('Question text must contain between 10 and 2,000 characters.', 422);
    }
    if ($text === trim((string) $question['question_text'])) {
        return Response::json(['saved' => false, 'unchanged' => true]);
    }

    $db->execute('UPDATE questions SET question_text = ? WHERE id = ?', [$text, $id]);
    $db->execute(
        'INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, before_json, after_json, created_at) '
        . 'VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [
            $user['id'],
            'question.text_corrected',
            'question',
            (string) $id,
            json_encode([
                'questionText' => $question['question_text'],
                'stableKey' => $question['stable_key'],
                'scoringDirection' => $question['scoring_direction'],
                'position' => (int) $question['position'],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            json_encode([
                'questionText' => $text,
                'meaningUnchangedConfirmed' => true,
                'stableKey' => $question['stable_key'],
                'scoringDirection' => $question['scoring_direction'],
                'position' => (int) $question['position'],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]
    );

    return Response::json([
        'saved' => true,
        'policy' => 'text_correction_only',
        'message' => 'Question text corrected. Identity, position and scoring remain unchanged.',
    ]);
});
