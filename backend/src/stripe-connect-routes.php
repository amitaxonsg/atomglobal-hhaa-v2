<?php
declare(strict_types=1);

use AtomGlobal\Http\Request;
use AtomGlobal\Http\Response;

$router->add('GET', '/api/stripe/connect/callback', function (Request $request) use ($container) {
    $error = trim((string) ($request->query['error_description'] ?? $request->query['error'] ?? ''));
    if ($error !== '') {
        return Response::redirect('/admin?stripe=error&message=' . rawurlencode($error));
    }
    try {
        $container['stripeConnect']->complete(
            (string) ($request->query['code'] ?? ''),
            (string) ($request->query['state'] ?? '')
        );
        return Response::redirect('/admin?stripe=connected');
    } catch (\Throwable $exception) {
        error_log((string) $exception);
        return Response::redirect('/admin?stripe=error&message=' . rawurlencode($exception->getMessage()));
    }
});

$router->add('GET', '/api/admin/stripe/status', function () use ($auth, $container) {
    $auth->requirePermission('settings.manage');
    return Response::json($container['stripeConnect']->status());
});

$router->add('POST', '/api/admin/stripe/connect/start', function (Request $request) use ($auth, $container, $csrf) {
    $user = $auth->requirePermission('settings.manage');
    $csrf($request);
    return Response::json($container['stripeConnect']->start((int) $user['id']));
});

$router->add('POST', '/api/admin/stripe/disconnect', function (Request $request) use ($auth, $container, $csrf) {
    $user = $auth->requirePermission('settings.manage');
    $csrf($request);
    return Response::json($container['stripeConnect']->disconnect((int) $user['id']));
});

$router->add('POST', '/api/admin/stripe/prices', function (Request $request) use ($auth, $container, $csrf) {
    $user = $auth->requirePermission('settings.manage');
    $csrf($request);
    return Response::json($container['stripeConnect']->syncUsdPrices($request->body, (int) $user['id']));
});

$router->add('POST', '/api/admin/stripe/test', function (Request $request) use ($auth, $container, $csrf) {
    $user = $auth->requirePermission('settings.manage');
    $csrf($request);
    return Response::json($container['stripeConnect']->testConnection((int) $user['id']));
});
