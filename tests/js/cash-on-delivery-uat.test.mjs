import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const service = readFileSync("backend/src/Payments/CashOnDeliveryService.php", "utf8");
const routes = readFileSync("backend/public/index.php", "utf8");
const reportService = readFileSync("backend/src/Services/ReportService.php", "utf8");
const reportView = readFileSync("src/components/assessment/ReportView.jsx", "utf8");
const paymentPage = readFileSync("src/components/AssessmentAppProduction.jsx", "utf8");
const migration = readFileSync("database/migrations/012_uat_cash_on_delivery.sql", "utf8");

test("Cash on Delivery is guarded by an explicit UAT setting", () => {
  assert.match(service, /payments\.cash_on_delivery_enabled/);
  assert.match(service, /Cash on Delivery is not currently enabled/);
  assert.match(migration, /payments\.cash_on_delivery_enabled/);
  assert.match(migration, /'true'/);
});

test("Cash on Delivery requires a completed assessment and records a manual payment", () => {
  assert.match(service, /status.*completed/s);
  assert.match(service, /provider = \?/);
  assert.match(service, /cash_on_delivery/);
  assert.match(service, /'manual'/);
  assert.match(service, /unlockBySession\(\$sessionId, 'cash_on_delivery_manual'\)/);
});

test("Cash on Delivery queues the normal payment and Full Report emails", () => {
  assert.match(service, /enqueue\('payment_successful'/);
  assert.match(service, /enqueue\('paid_report_ready'/);
  assert.match(service, /rotateReportAccess/);
});

test("Public report exposes and renders the guarded Cash on Delivery option", () => {
  assert.match(reportService, /cashOnDeliveryAvailable/);
  assert.match(routes, /\/api\/payments\/cash-on-delivery/);
  assert.match(reportView, /Cash on Delivery/);
  assert.match(reportView, /cashOnDeliveryAvailable/);
  assert.match(paymentPage, /Cash on Delivery selected/);
  assert.match(paymentPage, /No Stripe charge was made/);
});
