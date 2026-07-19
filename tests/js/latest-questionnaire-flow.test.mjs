import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../../src/components/assessment/AssessmentLayout.jsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../../src/components/AssessmentAppProduction.jsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("../../src/components/admin/QuestionnairePage.jsx", import.meta.url), "utf8");
const routes = readFileSync(new URL("../../backend/src/assessment-experience-routes.php", import.meta.url), "utf8");
const service = readFileSync(new URL("../../backend/src/Services/AssessmentExperienceService.php", import.meta.url), "utf8");
const main = readFileSync(new URL("../../src/main.jsx", import.meta.url), "utf8");

test("public questionnaire uses the latest single-column track selection", () => {
  assert.match(layout, /latest-questionnaire-shell/);
  assert.match(layout, /Every choice you make is cast by two votes/);
  assert.match(layout, /latest-track-card/);
  assert.match(layout, /Begin the free assessment/);
  assert.doesNotMatch(layout, /className="visual-panel"/);
  assert.doesNotMatch(layout, /className="assessment-shell"/);
  assert.match(main, /questionnaire-latest\.css/);
});

test("latest participant and question process remains wired to the real backend", () => {
  assert.match(layout, /A little more context/);
  assert.match(layout, /department/);
  assert.match(layout, /level/);
  assert.match(layout, /N\/A — doesn’t apply \/ can’t answer/);
  assert.match(layout, /Optional — describe a specific moment/);
  assert.match(app, /createSession/);
  assert.match(app, /saveSession/);
  assert.match(app, /completeSession/);
  assert.match(app, /SelectVersion experience=\{experience\}/);
});

test("landing, track cards and intake are editable from the admin CMS", () => {
  assert.match(admin, /Latest public landing page/);
  assert.match(admin, /Track-card description/);
  assert.match(admin, /Department options/);
  assert.match(admin, /Level options/);
  assert.match(routes, /\/api\/admin\/assessment-experience\/landing/);
  assert.match(service, /questionnaire\.landing/);
  assert.match(service, /questionnaire_landing\.saved/);
  assert.match(service, /UPDATE assessment_tracks SET description/);
});
