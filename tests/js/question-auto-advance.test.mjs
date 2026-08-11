import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const layoutSource = await readFile(new URL("../../src/components/assessment/AssessmentLayout.jsx", import.meta.url), "utf8");
const feedbackCss = await readFile(new URL("../../src/sunil-feedback.css", import.meta.url), "utf8");

test("first answer advances to the next unanswered question without unnecessary scrolling", () => {
  assert.match(layoutSource, /const handleAnswer = \(itemIndex, answerIndex, value, wasAnswered\)/);
  assert.match(layoutSource, /if \(wasAnswered\) return/);
  assert.match(layoutSource, /candidateIndex > itemIndex && answers\[offset \+ candidateIndex\]\?\.value == null/);
  assert.match(layoutSource, /const rect = target\.getBoundingClientRect\(\)/);
  assert.match(layoutSource, /const needsScroll = rect\.top < 0 \|\| rect\.bottom > window\.innerHeight/);
  assert.match(layoutSource, /if \(needsScroll\) target\.scrollIntoView\(\{ behavior: reducedMotion \? "auto" : "smooth", block: "center" \}\)/);
  assert.match(layoutSource, /querySelector\('input\[type="radio"\]'\)/);
});

test("last answered question advances to enabled group navigation", () => {
  assert.match(layoutSource, /const target = nextQuestion \|\| navigationRef\.current/);
  assert.match(layoutSource, /querySelector\("\.latest-primary-button:not\(:disabled\)"\)/);
});

test("participant questions omit per-question notes and only modestly enlarge the logo", () => {
  assert.doesNotMatch(layoutSource, /<textarea className="latest-answer-note"/);
  assert.match(feedbackCss, /\.latest-visual-panel__logo\s*\{[\s\S]*?clamp\(104px, 11\.5vw, 156px\)/);
  assert.doesNotMatch(feedbackCss, /@media \(min-width: 901px\)/);
});
