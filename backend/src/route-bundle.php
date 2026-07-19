<?php
declare(strict_types=1);

use AtomGlobal\Http\Request;
use AtomGlobal\Http\Response;
use AtomGlobal\Security\RateLimiter;

require __DIR__ . '/extra-routes.php';
require __DIR__ . '/attribution-routes.php';

$router->add('POST', '/api/admin/password-reset/request', function (Request $request) use ($container, $db) {
    $email = strtolower(trim((string) ($request->body['email'] ?? '')));
    $key = 'admin-password-reset:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . ':' . hash('sha256', $email);
    if (!(new RateLimiter($db))->hit($key, 5, 3600)) {
        return Response::json(['accepted' => true]);
    }
    $container['passwordReset']->request($email);
    return Response::json(['accepted' => true]);
});

$router->add('POST', '/api/admin/password-reset/confirm', function (Request $request) use ($container, $db) {
    $key = 'admin-password-reset-confirm:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    if (!(new RateLimiter($db))->hit($key, 10, 3600)) {
        return Response::error('Too many reset attempts.', 429);
    }
    $container['passwordReset']->confirm((string) ($request->body['token'] ?? ''), (string) ($request->body['password'] ?? ''));
    return Response::json(['reset' => true]);
});

$router->add('GET', '/api/public/pages/{key}', function (Request $request, array $params) use ($db) {
    $page = $db->fetch('SELECT page_key pageKey, path, page_title pageTitle, meta_description metaDescription, canonical_url canonicalUrl, robots_setting robotsSetting, og_title ogTitle, og_description ogDescription, heading, introductory_content introductoryContent, faq_json faqJson, structured_data_json structuredDataJson, include_in_sitemap includeInSitemap, updated_at updatedAt FROM seo_pages WHERE page_key = ? LIMIT 1', [$params['key']]);
    if (!$page) return Response::error('Page not found.', 404);
    $page['faq'] = json_decode($page['faqJson'] ?: '[]', true) ?: [];
    $page['structuredData'] = json_decode($page['structuredDataJson'] ?: '{}', true) ?: [];
    unset($page['faqJson'], $page['structuredDataJson']);
    $page['includeInSitemap'] = (bool) $page['includeInSitemap'];
    return Response::json($page);
});
