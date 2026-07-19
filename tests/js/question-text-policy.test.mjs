import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const adminSource = readFileSync(new URL("../../src/components/admin/AdminCorePages.jsx", import.meta.url), "utf8");
const routeSource = readFileSync(new URL("../../backend/src/question-text-policy-routes.php", import.meta.url), "utf8");
const bundleSource = readFileSync(new URL("../../backend/src/route-bundle.php", import.meta.url), "utf8");

test("admin permits confirmed text corrections but locks question identity and scoring", () => {
  assert.match(adminSource, /Text correction only/);
  assert.match(adminSource, /confirmMeaningUnchanged: true/);
  assert.match(adminSource, /Save text correction/);
  assert.match(adminSource, /Identity locked/);
  assert.doesNotMatch(adminSource, /saveQuestion\(question\.id, \{ questionText: question\.question_text, scoringDirection:/);
});

test("backend rejects structural question changes and updates question text only", () => {
  assert.match(routeSource, /Published and archived questions are immutable/);
  assert.match(routeSource, /confirmMeaningUnchanged/);
  assert.match(routeSource, /'scoringDirection', 'position', 'required', 'active', 'sectionId', 'stableKey'/);
  assert.match(routeSource, /UPDATE questions SET question_text = \? WHERE id = \?/);
  assert.doesNotMatch(routeSource, /UPDATE questions SET question_text = \?, scoring_direction/);
  assert.match(routeSource, /question\.text_corrected/);
});

test("text policy route is registered before legacy routes", () => {
  const policy = bundleSource.indexOf("question-text-policy-routes.php");
  const legacy = bundleSource.indexOf("extra-routes.php");
  assert.ok(policy >= 0, "question text policy route is not registered");
  assert.ok(legacy >= 0, "legacy routes are not registered");
  assert.ok(policy < legacy, "question text policy must be registered before the legacy route");
});
