import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const layoutSource = await readFile(new URL("../../src/components/assessment/AssessmentLayout.jsx", import.meta.url), "utf8");
const feedbackCss = await readFile(new URL("../../src/sunil-feedback.css", import.meta.url), "utf8");

test("answering a question updates only that answer and does not move or focus the next question", () => {
  assert.match(layoutSource, /onChange=\{\(\) => onAnswer\(answerIndex, value\)\}/);
  assert.match(layoutSource, /onChange=\{\(\) => onAnswer\(answerIndex, "NA"\)\}/);
  assert.doesNotMatch(layoutSource, /handleAnswer/);
  assert.doesNotMatch(layoutSource, /scrollIntoView/);
  assert.doesNotMatch(layoutSource, /focus\(\{ preventScroll: true \}\)/);
  assert.doesNotMatch(layoutSource, /questionRefs/);
  assert.doesNotMatch(feedbackCss, /\.latest-question-card:focus-within/);
});

test("question numbering and radio groups remain isolated by absolute answer index", () => {
  assert.match(layoutSource, /const answerIndex = offset \+ itemIndex/);
  assert.match(layoutSource, /name={`question-\$\{answerIndex\}`}/);
  assert.match(layoutSource, /checked=\{current\.value === value\}/);
  assert.match(layoutSource, /<span>\{answerIndex \+ 1\}\.\<\/span>/);
});

test("participant questions retain the accepted compact UAT presentation without per-question notes", () => {
  assert.doesNotMatch(layoutSource, /<textarea className="latest-answer-note"/);
  assert.match(feedbackCss, /\.latest-visual-panel__logo\s*\{[\s\S]*?clamp\(104px, 11\.5vw, 156px\)/);
  assert.match(feedbackCss, /@media \(min-width: 901px\)[\s\S]*?\.latest-question-card \{\s*padding-bottom: 26px/);
  assert.match(feedbackCss, /\.latest-scale-options label \{[\s\S]*?min-height: 64px/);
});
