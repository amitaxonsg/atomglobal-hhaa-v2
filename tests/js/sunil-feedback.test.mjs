import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../../src/components/assessment/AssessmentLayout.jsx", import.meta.url), "utf8");
const report = readFileSync(new URL("../../src/components/assessment/ReportView.jsx", import.meta.url), "utf8");
const mockData = readFileSync(new URL("../../src/api/mockData.js", import.meta.url), "utf8");
const main = readFileSync(new URL("../../src/main.jsx", import.meta.url), "utf8");
const presentation = readFileSync(new URL("../../src/sunil-feedback.css", import.meta.url), "utf8");

test("opening message and presentation refinements match client feedback", () => {
  assert.match(mockData, /Align with what you feel and what you reason with\./);
  assert.match(main, /sunil-feedback\.css/);
  assert.match(presentation, /font-weight: 400/);
  assert.match(presentation, /latest-question-progress/);
  assert.match(presentation, /height: 9px/);
});

test("questionnaire hides topic cues but exposes strong accessible progress", () => {
  const questions = layout.slice(layout.indexOf("export function Questions"));
  assert.match(questions, /Question group \{section \+ 1\} of/);
  assert.match(questions, /role="progressbar"/);
  assert.match(questions, /aria-valuenow=\{progress\}/);
  assert.match(questions, /\{progress\}% complete/);
  assert.doesNotMatch(questions, /latest-section-code/);
  assert.doesNotMatch(questions, /\{subscale\.name\}/);
  assert.doesNotMatch(questions, /\{subscale\.blurb\}/);
});

test("Lite Report is restricted and Full Report remains secure and actionable", () => {
  assert.match(report, /Your Head–Heart score/);
  assert.match(report, /\{summary\.total\}\/250/);
  assert.match(report, /summary\.strengths\.slice\(0, 2\)/);
  assert.match(report, /Here’s what you’re missing/);
  assert.match(report, /checkoutAvailable/);
  assert.match(report, /Full Report checkout coming soon/);
  assert.match(report, /Email to self/);
  assert.match(report, /Copy as text/);
  assert.match(report, /Print report/);
  assert.match(report, /Open PDF/);
  assert.match(report, /Development roadmap/);
  assert.match(report, /Methodology and sourcing/);
});
