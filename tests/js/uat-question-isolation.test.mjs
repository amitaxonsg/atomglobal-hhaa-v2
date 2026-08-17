import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/components/assessment/AssessmentLayout.jsx", "utf8");
const app = readFileSync("src/components/AssessmentAppProduction.jsx", "utf8");
const admin = readFileSync("src/components/admin/AdminOperationsPages.jsx", "utf8");
const routes = readFileSync("backend/public/index.php", "utf8");

test("question radios are isolated by absolute answer index", () => {
  assert.match(layout, /name={`question-\$\{answerIndex\}`}/);
  assert.match(layout, /checked=\{current\.value === value\}/);
  assert.match(layout, /onChange=\{\(\) => onAnswer\(answerIndex, value\)\}/);
  assert.match(app, /answerIndex === index \? \{ \.\.\.answer, value \} : answer/);
});

test("section offsets use the full preceding-question count", () => {
  assert.match(layout, /const offset = track\.subscales\.slice\(0, section\)\.reduce\(\(total, item\) => total \+ item\.items\.length, 0\)/);
  assert.match(layout, /const answerIndex = offset \+ itemIndex/);
});

test("UAT can use authorised admin manual report unlock without Stripe payment", () => {
  assert.match(admin, /item\.unlocked \? "lock" : "unlock"/);
  assert.match(routes, /\/api\/admin\/reports\/\{id\}\/unlock/);
  assert.match(routes, /requirePermission\('reports\.manage'\)/);
});
