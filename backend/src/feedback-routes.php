<?php
declare(strict_types=1);

use AtomGlobal\Http\Request;
use AtomGlobal\Http\Response;
use AtomGlobal\Security\RateLimiter;

$router->add('GET', '/api/admin/feedback-configuration', function () use ($auth, $container) {
    $auth->requirePermission('feedback.manage');
    $settings = $container['settings'];
    return Response::json([
        'githubRepository' => $settings->get('feedback.github_repository', $_ENV['GITHUB_FEEDBACK_REPOSITORY'] ?? 'amitaxonsg/atomglobal-hhaa-v2'),
        'githubTokenConfigured' => (bool) $settings->get('feedback.github_token', $_ENV['GITHUB_FEEDBACK_TOKEN'] ?? ''),
        'clientEmail' => $settings->get('feedback.client_email', 'sunil.setpaul@atomglobal.com'),
        'internalEmail' => $settings->get('feedback.internal_email', 'amit@axon.com.sg'),
        'supportEmail' => $settings->get('feedback.support_email', 'amit@axon.com.sg'),
        'issuePrefix' => $settings->get('feedback.issue_prefix', 'Client feedback'),
    ]);
});

$router->add('PUT', '/api/admin/feedback-configuration', function (Request $request) use ($auth, $container, $db, $csrf) {
    $user = $auth->requirePermission('feedback.manage');
    $csrf($request);
    $payload = $request->body;
    $repository = trim((string) ($payload['githubRepository'] ?? ''));
    if (!preg_match('/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/', $repository)) {
        return Response::error('Use a GitHub repository in owner/name format.', 422);
    }
    foreach (['clientEmail', 'internalEmail', 'supportEmail'] as $key) {
        if (!filter_var((string) ($payload[$key] ?? ''), FILTER_VALIDATE_EMAIL)) {
            return Response::error('All feedback email addresses must be valid.', 422);
        }
    }
    $settings = $container['settings'];
    $settings->set('feedback.github_repository', $repository);
    $settings->set('feedback.client_email', strtolower(trim((string) $payload['clientEmail'])));
    $settings->set('feedback.internal_email', strtolower(trim((string) $payload['internalEmail'])));
    $settings->set('feedback.support_email', strtolower(trim((string) $payload['supportEmail'])));
    $settings->set('feedback.issue_prefix', trim((string) ($payload['issuePrefix'] ?? 'Client feedback')) ?: 'Client feedback');
    $token = trim((string) ($payload['githubToken'] ?? ''));
    if ($token !== '') $settings->set('feedback.github_token', $token, true);
    $db->execute(
        'INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, after_json, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [(int) $user['id'], 'feedback.configuration_saved', 'settings_group', 'feedback', json_encode(['repository' => $repository, 'tokenUpdated' => $token !== ''])]
    );
    return Response::json(['saved' => true, 'githubTokenConfigured' => (bool) $settings->get('feedback.github_token', $_ENV['GITHUB_FEEDBACK_TOKEN'] ?? '')]);
});

$router->add('GET', '/api/admin/feedback', function (Request $request) use ($auth, $container) {
    $auth->requirePermission('feedback.submit');
    return Response::json($container['feedback']->list($request->query));
});

$router->add('GET', '/api/admin/feedback/{id}', function (Request $request, array $params) use ($auth, $container) {
    $auth->requirePermission('feedback.submit');
    return Response::json($container['feedback']->detail((int) $params['id']));
});

$router->add('POST', '/api/admin/feedback', function (Request $request) use ($auth, $container, $db, $csrf) {
    $user = $auth->requirePermission('feedback.submit');
    $csrf($request);
    if (!(new RateLimiter($db))->hit('feedback-submit:' . (int) $user['id'], 20, 3600)) {
        return Response::error('Too many feedback submissions. Please wait before submitting again.', 429);
    }
    return Response::json($container['feedback']->create($request->body, $user), 201);
});

$router->add('PATCH', '/api/admin/feedback/{id}', function (Request $request, array $params) use ($auth, $container, $csrf) {
    $user = $auth->requirePermission('feedback.manage');
    $csrf($request);
    return Response::json($container['feedback']->update((int) $params['id'], $request->body, $user));
});

$router->add('POST', '/api/admin/feedback/{id}/sync-github', function (Request $request, array $params) use ($auth, $container, $csrf) {
    $user = $auth->requirePermission('feedback.manage');
    $csrf($request);
    return Response::json($container['feedback']->retryGitHub((int) $params['id'], $user));
});