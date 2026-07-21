import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../../src/components/assessment/AssessmentLayout.jsx", import.meta.url), "utf8");
const report = readFileSync(new URL("../../src/components/assessment/ReportView.jsx", import.meta.url), "utf8");
const experience = readFileSync(new URL("../../src/data/assessmentExperience.js", import.meta.url), "utf8");
const app = readFileSync(new URL("../../src/components/AssessmentAppProduction.jsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("../../src/components/admin/QuestionnairePage.jsx", import.meta.url), "utf8");
const routes = readFileSync(new URL("../../backend/src/assessment-experience-routes.php", import.meta.url), "utf8");
const service = readFileSync(new URL("../../backend/src/Services/AssessmentExperienceService.php", import.meta.url), "utf8");
const survey = readFileSync(new URL("../../backend/src/Services/SurveyService.php", import.meta.url), "utf8");
const main = readFileSync(new URL("../../src/main.jsx", import.meta.url), "utf8");

test("public questionnaire keeps the latest process inside the approved split branding", () => {
  assert.match(layout, /latest-questionnaire-shell/);
  assert.match(layout, /latest-visual-panel/);
  assert.match(layout, /reflection-portrait\.png/);
  assert.match(experience, /Every choice you make is cast by two votes/);
  assert.match(layout, /latest-track-card/);
  assert.match(layout, /Begin the free assessment/);
  assert.doesNotMatch(layout, /Powered by/);
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

test("participant question pages hide topic names but retain accessible progress", () => {
  assert.doesNotMatch(layout, /<h1>\{subscale\.name\}<\/h1>/);
  assert.doesNotMatch(layout, /latest-section-code/);
  assert.match(layout, /Question group \{section \+ 1\}/);
  assert.match(layout, /role="progressbar"/);
  assert.match(layout, /aria-valuenow=\{progress\}/);
  assert.match(layout, /% complete/);
});

test("Lite Report contains only the requested headline result and locked preview", () => {
  assert.match(report, /Your top two strengths/);
  assert.match(report, /slice\(0, 2\)/);
  assert.match(report, /Here’s what you’re missing/);
  assert.match(report, /aria-label=\{`Head–Heart score/);
  assert.match(report, /\{summary\.total\}\/250/);
  assert.doesNotMatch(report, /<section className="report-card"><h2>Development observations/);
});

test("Full Report structure and export options are present but remain locked", () => {
  assert.match(report, /Complete profile summary/);
  assert.match(report, /Your Sharpest Edge/);
  assert.match(report, /Your Growth Edge/);
  assert.match(report, /How You Handle Difficulty/);
  assert.match(report, /Culture Fit Reflection/);
  assert.match(report, /Five practical everyday actions/);
  assert.match(report, /Complete 10-area profile/);
  assert.match(report, /Development roadmap/);
  assert.match(report, /Understand the Head–Heart Profiles/);
  assert.match(report, /Your written reflections/);
  assert.match(report, /Retake in three months/);
  assert.match(report, /Methodology and sourcing/);
  assert.match(report, /Email to self/);
  assert.match(report, /Copy as text/);
  assert.match(report, /window\.print/);
  assert.match(report, /is_unlocked/);
  assert.match(report, /verified Stripe webhook/);
});

test("landing, track cards and intake are editable from the admin CMS", () => {
  assert.match(admin, /Public landing content/);
  assert.match(admin, /Track-card description/);
  assert.match(admin, /Department options/);
  assert.match(admin, /Level options/);
  assert.match(routes, /\/api\/admin\/assessment-experience\/landing/);
  assert.match(service, /questionnaire\.landing/);
  assert.match(service, /questionnaire_landing\.saved/);
  assert.match(service, /UPDATE assessment_tracks SET description/);
});

test("only one published assessment is live for new participants", () => {
  assert.match(admin, /Live assessment/);
  assert.match(admin, /only assessment open to new participants/);
  assert.match(routes, /\/api\/admin\/assessment-experience\/live-track/);
  assert.match(service, /questionnaire\.live_track/);
  assert.match(service, /assessment\.live_track_changed/);
  assert.match(layout, /experience\?\.liveTrackKey/);
  assert.match(survey, /This assessment is not currently open for new participants/);
});

test("admin warns that material question changes affect interpretation and history", () => {
  assert.match(admin, /Do not replace a question with a different question/);
  assert.match(admin, /full meaning change can invalidate comparisons and report interpretation/);
  assert.match(admin, /published versions are immutable/);
});
