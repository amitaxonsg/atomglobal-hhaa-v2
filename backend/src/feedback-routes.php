<?php
declare(strict_types=1);

use AtomGlobal\Http\Request;
use AtomGlobal\Http\Response;
use AtomGlobal\Security\RateLimiter;

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