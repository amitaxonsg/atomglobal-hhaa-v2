import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const reportView = fs.readFileSync("src/components/assessment/ReportView.jsx", "utf8");
const reportService = fs.readFileSync("backend/src/Services/ReportService.php", "utf8");
const reportAudit = fs.readFileSync("backend/bin/report-flow-audit.php", "utf8");
const reportSmoke = fs.readFileSync("backend/bin/production-report-flow-smoke-test.php", "utf8");

const richFields = [
  "developmentAreas",
  "relationships",
  "workingStyleTips",
  "handlingDifficulty",
  "leadershipImpact",
  "cultureFitPrompt",
  "growth",
  "subscaleReads",
  "upgradeReasons",
];

test("locked report API exposes Lite content and preview but not Full content", () => {
  assert.match(reportService, /'upgradePreview' => \$upgradePreview/);
  assert.match(reportService, /IF\(gr\.is_unlocked = 1, gr\.paid_report_json, NULL\)/);
  assert.match(reportService, /checkoutAvailable/);
  assert.match(reportSmoke, /Locked API does not expose paid report content/);
  assert.match(reportSmoke, /Locked report contains the approved CMS upgrade preview/);
});

test("Lite Report is limited to profile, 250 gauge, top two strengths and missing preview", () => {
  assert.match(reportView, /aria-label=\{`Head–Heart score \$\{summary\.total\} out of 250`\}/);
  assert.match(reportView, /report-total-score">\{summary\.total\}\/250/);
  assert.match(reportView, /summary\.strengths\.slice\(0, 2\)/);
  assert.match(reportView, /Your top two strengths/);
  assert.match(reportView, /Here’s what you’re missing/);
  assert.doesNotMatch(reportView, /<section className="report-card"><h2>Development observations/);
  assert.doesNotMatch(reportView, /<div><h2>Your Head–Heart score<\/h2><p>\{summary\.summary\}/);
});

test("participant report shows safe Stripe readiness and full CMS schema", () => {
  assert.match(reportView, /This is the short version/);
  assert.match(reportView, /Full Report checkout coming soon/);
  assert.match(reportView, /checkoutAvailable/);
  assert.match(reportView, /UpgradeReasons/);
  for (const field of richFields) assert.match(reportView, new RegExp(field));
});

test("Full Report contains requested interpretation, roadmap and sharing actions", () => {
  for (const phrase of [
    "Complete profile summary",
    "Your Sharpest Edge",
    "Your Growth Edge",
    "How You Handle Difficulty",
    "Complete 10-area profile",
    "Development roadmap",
    "Understand the Head–Heart Profiles",
    "Your written reflections",
    "Retake in three months",
    "Methodology and sourcing",
    "Email to self",
    "Copy as text",
    "Open PDF",
    "Print report",
  ]) assert.match(reportView, new RegExp(phrase));
});

test("database audit and smoke test cover locked unlock and PDF lifecycle", () => {
  assert.match(reportAudit, /REPORT CONTENT: READY/);
  assert.match(reportAudit, /PAID CHECKOUT: PENDING CONFIGURATION/);
  assert.match(reportSmoke, /Authorised unlock changes the report to Full/);
  assert.match(reportSmoke, /Unlocked API reveals complete Full Report content/);
  assert.match(reportSmoke, /Unlocked Full Report PDF was generated/);
  assert.match(reportSmoke, /DATABASE LEFT CLEAN AFTER REPORT TEST/);
});
