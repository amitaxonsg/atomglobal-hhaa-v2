<?php
declare(strict_types=1);

use AtomGlobal\Http\Request;
use AtomGlobal\Http\Response;
use AtomGlobal\Http\Router;
use AtomGlobal\Payments\StripeService;
use AtomGlobal\Security\Auth;
use AtomGlobal\Security\Csrf;
use AtomGlobal\Security\RateLimiter;

$container = require dirname(__DIR__) . '/src/bootstrap.php';
$config = $container['config'];
ini_set('display_errors', $config['debug'] ? '1' : '0');
ini_set('log_errors', '1');
session_name($config['session_cookie']);
session_set_cookie_params(['lifetime' => $config['session_lifetime'], 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Strict']);
session_start();
$request = Request::capture(); $router = new Router(); $db = $container['db'];

$router->add('GET', '/api/health', fn() => Response::json($container['health']->check()));
$router->add('GET', '/api/csrf', fn() => Response::json(['token' => Csrf::token()]));
$router->add('POST', '/api/survey-sessions', fn(Request $request) => Response::json($container['surveys']->create($request->body), 201));
$router->add('PATCH', '/api/survey-sessions/{id}', fn(Request $request, array $params) => Response::json($container['surveys']->save((int) $params['id'], $request->body)));
$router->add('POST', '/api/survey-sessions/{id}/complete', fn(Request $request, array $params) => Response::json($container['surveys']->complete((int) $params['id'], $request->body)));
$router->add('GET', '/api/reports/{token}', function (Request $request, array $params) use ($container) { $report = $container['reports']->byToken($params['token']); return $report ? Response::json($report) : Response::error('Report not found or expired.', 404); });
$router->add('POST', '/api/payments/checkout', function (Request $request) use ($container, $config) { $stripe = new StripeService($container['db'], $container['settings'], $container['reports'], $config); return Response::json($stripe->checkout((int) ($request->body['sessionId'] ?? 0), (string) ($request->body['track'] ?? ''), $request->body['affiliateCode'] ?? null)); });
$router->add('POST', '/api/stripe/webhook', function (Request $request) use ($container, $config) { $stripe = new StripeService($container['db'], $container['settings'], $container['reports'], $config); $stripe->webhook(file_get_contents('php://input') ?: '', $request->header('stripe-signature') ?? ''); return Response::json(['received' => true]); });
$router->add('POST', '/api/admin/login', function (Request $request) use ($db) { if (!(new RateLimiter($db))->hit('admin-login:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 10, 900)) return Response::error('Too many login attempts.', 429); $auth = new Auth($db); if (!$auth->attempt((string) ($request->body['email'] ?? ''), (string) ($request->body['password'] ?? ''))) return Response::error('Invalid credentials.', 422); return Response::json(['csrfToken' => Csrf::token()]); });
$router->add('GET', '/api/admin/dashboard', function () use ($db) { (new Auth($db))->requireUser(); return Response::json(['metrics' => $db->fetch('SELECT COUNT(*) surveys_started, SUM(status = ?) surveys_completed FROM survey_sessions WHERE created_at >= CURDATE()', ['completed']), 'failedEmails' => $db->fetch('SELECT COUNT(*) count FROM email_queue WHERE status = ?', ['failed']), 'failedWebhooks' => $db->fetch('SELECT COUNT(*) count FROM stripe_webhook_events WHERE status = ?', ['failed'])]); });
$router->add('GET', '/api/admin/content-stages', function () use ($db) { (new Auth($db))->requireUser(); return Response::json(['items' => $db->fetchAll('SELECT * FROM content_stages ORDER BY display_order')]); });
$router->add('GET', '/api/admin/email-templates', function () use ($db) { (new Auth($db))->requireUser(); return Response::json(['items' => $db->fetchAll('SELECT template_key, template_name, subject, is_active, updated_at FROM email_templates ORDER BY template_name')]); });
$router->add('POST', '/api/admin/reports/{id}/unlock', function (Request $request, array $params) use ($db, $container) { $user = (new Auth($db))->requireUser(); if (!Csrf::verify($request->header('x-csrf-token'))) return Response::error('Invalid CSRF token.', 419); $report = $db->fetch('SELECT survey_session_id FROM generated_reports WHERE id = ?', [(int) $params['id']]); if (!$report) return Response::error('Report not found.', 404); $container['reports']->unlockBySession((int) $report['survey_session_id'], 'admin_manual'); $db->execute('INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, NOW())', [$user['id'], 'report.unlocked', 'generated_report', $params['id']]); return Response::json(['unlocked' => true]); });
$router->add('POST', '/api/admin/reports/{id}/lock', function (Request $request, array $params) use ($db) { $user = (new Auth($db))->requireUser(); if (!Csrf::verify($request->header('x-csrf-token'))) return Response::error('Invalid CSRF token.', 419); $db->execute('UPDATE generated_reports SET is_unlocked = 0, unlock_reason = ?, unlocked_at = NULL, updated_at = NOW() WHERE id = ?', ['admin_manual_lock', (int) $params['id']]); $db->execute('INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, NOW())', [$user['id'], 'report.locked', 'generated_report', $params['id']]); return Response::json(['unlocked' => false]); });
$router->add('GET', '/api/admin/participants/{id}/export', function (Request $request, array $params) use ($db, $container) { (new Auth($db))->requireUser(); return Response::json($container['privacy']->export((int) $params['id'])); });
$router->add('DELETE', '/api/admin/participants/{id}', function (Request $request, array $params) use ($db, $container) { $user = (new Auth($db))->requireUser(); if (!Csrf::verify($request->header('x-csrf-token'))) return Response::error('Invalid CSRF token.', 419); $container['privacy']->anonymise((int) $params['id'], (int) $user['id']); return Response::json(['anonymised' => true]); });

try { $router->dispatch($request); } catch (\InvalidArgumentException $error) { Response::error($error->getMessage(), 422); } catch (\RuntimeException $error) { $code = in_array($error->getCode(), [401,403,404], true) ? $error->getCode() : 500; error_log($error); Response::error($code === 500 && !$config['debug'] ? 'An unexpected error occurred.' : $error->getMessage(), $code); } catch (\Throwable $error) { error_log($error); Response::error($config['debug'] ? $error->getMessage() : 'An unexpected error occurred.', 500); }
