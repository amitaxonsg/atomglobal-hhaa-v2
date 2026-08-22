import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { assessmentTracks } from "../../src/data/assessmentData.js";
import { buildRuntimeTrack, V3_AREA_NAMES, V3_QUESTION_COUNT } from "../../src/data/runtimeAssessment.js";

const expectedNames = {
  personal: ["Personal Decision-Making", "Relationships & Connection", "Emotional Awareness", "Conflict Navigation", "Trust & Intuition", "Empathy & Compassion", "Authentic Self-Expression", "Stress & Pressure Response", "Values & Life Priorities", "Communication Style"],
  newjoiner: ["New Joiner Decision-Making as You Start Out", "Building Relationships at a New Job", "Emotional Awareness in a New Environment", "Handling Feedback & Early Conflict", "Trust & Intuition as a Newcomer", "Empathy for Your New Team", "Authentic Presence as the New Person", "Pressure & Imposter Moments", "What You’re Optimizing For Early On", "Communication as a New Team Member"],
  manager: ["Manager Decision-Making", "Team Relationships & Trust", "Emotional Awareness at Work", "Conflict & Difficult Conversations", "Trust & Intuition About People", "Empathy for Your Team", "Authentic Leadership", "Stress & Pressure at Work", "What You’re Optimizing For", "Communication as a Manager"],
  executive: ["Executive Strategic Decision-Making", "Executive Trust & Relationships", "Emotional Awareness in the C-Suite", "High-Stakes Conflict & Negotiation", "Trust & Intuition on Big Bets", "Empathy at Scale", "Authentic Executive Presence", "Pressure at the Top", "What You’re Building For", "Communication as an Executive"],
};

test("V3 publishes 40 questions as ten four-question areas while preserving the source bank", () => {
  assert.equal(V3_QUESTION_COUNT, 40);
  for (const [trackKey, sourceTrack] of Object.entries(assessmentTracks)) {
    assert.equal(sourceTrack.allItems.length, 50, `${trackKey} source bank should remain rollback-safe at 50`);
    const runtime = buildRuntimeTrack(sourceTrack, null);
    assert.equal(runtime.allItems.length, 40, `${trackKey} runtime should publish 40`);
    assert.equal(runtime.subscales.length, 10);
    assert.ok(runtime.subscales.every(section => section.items.length === 4));
    assert.deepEqual(runtime.subscales.map(section => section.name), expectedNames[trackKey]);
  }
});

test("V3 area-name map covers every track and assessment code", () => {
  const codes = ["DM", "RC", "EA", "CN", "TI", "EC", "AE", "SP", "VP", "CS"];
  for (const trackKey of Object.keys(expectedNames)) {
    assert.deepEqual(codes.map(code => V3_AREA_NAMES[trackKey][code]), expectedNames[trackKey]);
  }
});

test("Sunil milestone, report and verified-retake scope is present in the V3 build", () => {
  const layout = fs.readFileSync(new URL("../../src/components/assessment/AssessmentLayout.jsx", import.meta.url), "utf8");
  const report = fs.readFileSync(new URL("../../src/components/assessment/ReportView.jsx", import.meta.url), "utf8");
  const survey = fs.readFileSync(new URL("../../backend/src/Services/SurveyService.php", import.meta.url), "utf8");
  const pdf = fs.readFileSync(new URL("../../backend/src/Services/PdfService.php", import.meta.url), "utf8");
  const stripe = fs.readFileSync(new URL("../../backend/src/Payments/StripeService.php", import.meta.url), "utf8");
  const reportService = fs.readFileSync(new URL("../../backend/src/Services/ReportService.php", import.meta.url), "utf8");

  assert.match(layout, /20 of 40 complete/);
  assert.match(layout, /All 40 questions complete/);
  assert.match(report, /Top three strengths/i);
  assert.match(report, /Five practical everyday actions/i);
  assert.match(report, /Retake price: USD 2/);
  assert.match(report, /__RETAKE__/);
  assert.match(report, /RetakeComparison/);
  assert.match(report, /compares the new result with the previous result in the same report/i);
  assert.match(pdf, /Retake price: USD 2/);
  assert.match(survey, /V3_QUESTION_COUNT = 40/);
  assert.doesNotMatch(survey, /All 50 questions must be answered/);
  assert.match(stripe, /RETAKE_AMOUNT_MINOR = 200/);
  assert.match(stripe, /payment_purpose' => 'retake'/);
  assert.match(stripe, /retakeOfSessionId/);
  assert.match(reportService, /retakeComparison/);
  assert.match(reportService, /retake_payment/);
});
