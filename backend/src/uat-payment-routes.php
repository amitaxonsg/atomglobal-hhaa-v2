<?php
declare(strict_types=1);

use AtomGlobal\Http\Request;
use AtomGlobal\Http\Response;

$router->add('GET', '/api/payments/uat-status', function () use ($container) {
    return Response::json(['enabled' => $container['uatPayment']->enabled()]);
});

$router->add('POST', '/api/payments/uat-checkout', function (Request $request) use ($container) {
    return Response::json($container['uatPayment']->checkout(
        (int) ($request->body['sessionId'] ?? 0),
        trim((string) ($request->body['track'] ?? ''))
    ));
});

$router->add('GET', '/api/admin/payments/uat-status', function () use ($auth, $container) {
    $auth->requirePermission('payments.manage');
    return Response::json(['enabled' => $container['uatPayment']->enabled()]);
});

$router->add('PUT', '/api/admin/payments/uat-status', function (Request $request) use ($auth, $container, $csrf) {
    $user = $auth->requirePermission('payments.manage');
    $csrf($request);
    return Response::json($container['uatPayment']->setEnabled((bool) ($request->body['enabled'] ?? false), (int) $user['id']));
});
