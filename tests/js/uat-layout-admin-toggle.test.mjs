import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/components/assessment/AssessmentLayout.jsx", "utf8");
const layoutFix = readFileSync("src/uat-layout-fix.css", "utf8");
const admin = readFileSync("src/components/admin/AdminOperationsEnhanced.jsx", "utf8");
const cod = readFileSync("backend/src/Payments/CashOnDeliveryService.php", "utf8");

test("question cards do not use fieldset/legend rendering that can jump after a radio update", () => {
  assert.match(layout, /role="group" aria-labelledby=\{labelId\}/);
  assert.match(layout, /className="latest-question-legend"/);
  assert.doesNotMatch(layout, /<fieldset className="latest-question-card"/);
  assert.match(layoutFix, /\.latest-question-card/);
  assert.match(layoutFix, /min-width:\s*0/);
});

test("answer selection remains isolated to the exact question index", () => {
  assert.match(layout, /name={`question-\$\{answerIndex\}`}/);
  assert.match(layout, /checked=\{current\.value === value\}/);
  assert.match(layout, /onChange=\{\(\) => onAnswer\(answerIndex, value\)\}/);
});

test("admin Payments page can explicitly enable or disable the UAT no-payment option", () => {
  assert.match(admin, /Client UAT payment bypass/);
  assert.match(admin, /saveSettings\("system", \{ cashOnDeliveryEnabled: codEnabled \}\)/);
  assert.match(admin, /Enable “Cash on Delivery \/ UAT — No payment”/);
  assert.match(cod, /system\.cash_on_delivery_enabled/);
  assert.match(cod, /payments\.cash_on_delivery_enabled/);
});
