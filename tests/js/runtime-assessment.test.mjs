import test from "node:test";
import assert from "node:assert/strict";
import { buildRuntimeTrack, parseReportPayload, reportSummary } from "../../src/data/runtimeAssessment.js";

function fallbackTrack() {
  return {
    key: "manager",
    label: "Manager",
    subscales: [],
    allItems: [],
    getProfileFn: () => ({ name: "Fallback" }),
  };
}

function assessmentSnapshot() {
  const sections = Array.from({ length: 10 }, (_, section) => ({ code: `S${section + 1}`, name: `Section ${section + 1}`, order: section + 1 }));
  const questions = sections.flatMap(section => Array.from({ length: 5 }, (_, index) => ({
    id: (section.order - 1) * 5 + index + 1,
    position: (section.order - 1) * 5 + index + 1,
    text: `Database question ${(section.order - 1) * 5 + index + 1}`,
    direction: index % 2 ? "K" : "H",
    subscaleCode: section.code,
    subscaleName: section.name,
    sectionOrder: section.order,
  })));
  return { versionId: 7, sections, questions, answerChoices: ["Never", "Rarely", "Sometimes", "Often", "Always"] };
}

test("published database assessment replaces static participant questions", () => {
  const runtime = buildRuntimeTrack(fallbackTrack(), assessmentSnapshot());
  assert.equal(runtime.assessmentVersionId, 7);
  assert.equal(runtime.subscales.length, 10);
  assert.equal(runtime.allItems.length, 50);
  assert.equal(runtime.allItems[0].t, "Database question 1");
  assert.equal(runtime.allItems[1].d, "K");
  assert.deepEqual(runtime.answerChoices, ["Never", "Rarely", "Sometimes", "Often", "Always"]);
});

test("invalid runtime assessment safely preserves fallback track", () => {
  const fallback = fallbackTrack();
  assert.equal(buildRuntimeTrack(fallback, { questions: [] }), fallback);
});

test("server report JSON is parsed into a safe summary", () => {
  const parsed = parseReportPayload({
    is_unlocked: false,
    free_report_json: JSON.stringify({ profile: "Balanced Integrator", total: 173, summary: { summary: "A clear pattern.", strengths: ["Calm"], watchouts: ["Delay"] }, subscales: { A: 18 } }),
    paid_report_json: null,
  });
  const summary = reportSummary(parsed);
  assert.equal(summary.profile, "Balanced Integrator");
  assert.equal(summary.total, 173);
  assert.equal(summary.summary, "A clear pattern.");
  assert.deepEqual(summary.strengths, ["Calm"]);
  assert.deepEqual(summary.subscales, { A: 18 });
});
