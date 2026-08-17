import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const service = await readFile(new URL("../../backend/src/Payments/UatPaymentService.php", import.meta.url), "utf8");
const routes = await readFile(new URL("../../backend/src/uat-payment-routes.php", import.meta.url), "utf8");
const report = await readFile(new URL("../../src/components/assessment/ReportView.jsx", import.meta.url), "utf8");
const admin = await readFile(new URL("../../src/uat-payment-admin.jsx", import.meta.url), "utf8");
const migration = await readFile(new URL("../../database/migrations/012_uat_no_payment.sql", import.meta.url), "utf8");

test("UAT bypass is explicitly setting guarded and admin controllable", () => {
  assert.match(service, /system\.uat_no_payment_enabled/);
  assert.match(service, /UAT no-payment checkout is disabled/);
  assert.match(routes, /\/api\/admin\/payments\/uat-status/);
  assert.match(routes, /requirePermission\('payments\.manage'\)/);
  assert.match(admin, /Enable no-payment UAT/);
  assert.match(admin, /Disable no-payment UAT/);
  assert.match(migration, /system\.uat_no_payment_enabled/);
});

test("UAT bypass requires completed assessment, records zero manual payment and unlocks report", () => {
  assert.match(service, /status.*completed/s);
  assert.match(service, /uat_no_payment/);
  assert.match(service, /'manual'/);
  assert.match(service, /, 0, strtoupper/);
  assert.match(service, /unlockBySession\(\$sessionId, 'uat_no_payment'\)/);
  assert.match(service, /paid_report_ready/);
});

test("locked report offers separate no-payment UAT control only when enabled", () => {
  assert.match(report, /\/api\/payments\/uat-status/);
  assert.match(report, /\/api\/payments\/uat-checkout/);
  assert.match(report, /UAT test — unlock without payment/);
  assert.match(report, /No payment/);
});
