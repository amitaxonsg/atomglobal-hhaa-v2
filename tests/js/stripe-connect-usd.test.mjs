import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = path => fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("Stripe Connect UI keeps manual setup and fixes prices to USD", () => {
  const source = read("src/stripe-connect-settings.jsx");
  assert.match(source, /Connect with Stripe/);
  assert.match(source, /All four amounts are one-time prices in <strong>USD<\/strong>/);
  assert.match(source, /advanced manual configuration/i);
  assert.match(source, /Existing checkout, report unlocking, refunds, payment emails, affiliate commissions/);
});

test("Stripe Connect backend uses connected-account requests and separate price IDs", () => {
  const connect = read("backend/src/Payments/StripeConnectService.php");
  const payments = read("backend/src/Payments/StripeService.php");
  assert.match(connect, /oauth->token/);
  assert.match(connect, /'stripe_account' => \$accountId/);
  assert.match(connect, /'currency' => 'usd'/);
  assert.match(connect, /stripe\.connect_price_/);
  assert.match(payments, /checkout\.session\.async_payment_succeeded/);
  assert.match(payments, /account\.application\.deauthorized/);
  assert.match(payments, /stripe_connect_webhook_secret/);
});

test("Stripe Connect routes and manual fallback remain available", () => {
  const routes = read("backend/src/stripe-connect-routes.php");
  const report = read("backend/src/Services/ReportService.php");
  assert.match(routes, /\/api\/admin\/stripe\/connect\/start/);
  assert.match(routes, /\/api\/admin\/stripe\/prices/);
  assert.match(routes, /\/api\/stripe\/connect\/callback/);
  assert.match(report, /stripe\.secret_key/);
  assert.match(report, /STRIPE_SECRET_KEY/);
  assert.match(report, /stripe\.connect_price_/);
});
