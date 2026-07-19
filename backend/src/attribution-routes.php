<?php
declare(strict_types=1);

use AtomGlobal\Http\Request;
use AtomGlobal\Http\Response;

$router->add('POST', '/api/affiliate-clicks', function (Request $request) use ($container) {
    return Response::json($container['attribution']->record($request->body), 201);
});

$router->add('POST', '/api/survey-sessions/{id}/attribution', function (Request $request, array $params) use ($container, $db) {
    $sessionId = (int) $params['id'];
    $token = (string) ($request->body['resumeToken'] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) return Response::error('Assessment session token is required.', 401);
    $session = $db->fetch('SELECT id, participant_id, affiliate_id FROM survey_sessions WHERE id = ? AND resume_token_hash = ? AND resume_expires_at > NOW() LIMIT 1', [$sessionId, hash('sha256', $token)]);
    if (!$session) return Response::error('Assessment session is invalid or expired.', 401);
    if (!$session['affiliate_id']) return Response::json(['attributed' => false]);

    $first = $container['attribution']->resolve((string) ($request->body['firstClickUuid'] ?? ''), (int) $session['affiliate_id']);
    $last = $container['attribution']->resolve((string) ($request->body['lastClickUuid'] ?? ''), (int) $session['affiliate_id']);
    if (!$first && !$last) return Response::json(['attributed' => false]);
    $firstId = (int) (($first ?: $last)['id']);
    $lastId = (int) (($last ?: $first)['id']);

    $db->transaction(function () use ($db, $sessionId, $session, $firstId, $lastId) {
        $db->execute('UPDATE survey_sessions SET first_click_id = ?, last_click_id = ?, updated_at = NOW() WHERE id = ?', [$firstId, $lastId, $sessionId]);
        $db->execute('INSERT INTO affiliate_attributions (affiliate_id, participant_id, survey_session_id, first_click_id, last_click_id, referral_at) VALUES (?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE first_click_id = VALUES(first_click_id), last_click_id = VALUES(last_click_id)', [$session['affiliate_id'], $session['participant_id'], $sessionId, $firstId, $lastId]);
    });

    return Response::json(['attributed' => true]);
});
