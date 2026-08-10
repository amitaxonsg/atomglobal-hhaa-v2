import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const layoutSource = await readFile(new URL("../../src/components/assessment/AssessmentLayout.jsx", import.meta.url), "utf8");

test("first answer advances to the next unanswered question", () => {
  assert.match(layoutSource, /const handleAnswer = \(itemIndex, answerIndex, value, wasAnswered\)/);
  assert.match(layoutSource, /if \(wasAnswered\) return/);
  assert.match(layoutSource, /candidateIndex > itemIndex && answers\[offset \+ candidateIndex\]\?\.value == null/);
  assert.match(layoutSource, /scrollIntoView\(\{ behavior: reducedMotion \? "auto" : "smooth", block: "center" \}\)/);
  assert.match(layoutSource, /querySelector\('input\[type="radio"\]'\)/);
});

test("last answered question advances to enabled group navigation", () => {
  assert.match(layoutSource, /const target = nextQuestion \|\| navigationRef\.current/);
  assert.match(layoutSource, /querySelector\("\.latest-primary-button:not\(:disabled\)"\)/);
});
