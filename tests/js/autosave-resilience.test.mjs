import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const appSource = await readFile(new URL("../../src/components/AssessmentAppProduction.jsx", import.meta.url), "utf8");
const layoutSource = await readFile(new URL("../../src/components/assessment/AssessmentLayout.jsx", import.meta.url), "utf8");

test("assessment autosave retries transient failures and clears the warning after recovery", () => {
  assert.match(appSource, /SAVE_RETRY_DELAYS_MS\s*=\s*\[1000, 2000, 4000\]/);
  assert.match(appSource, /setSaveState\("retrying"\)/);
  assert.match(appSource, /setSaveError\("Connection interrupted — retrying automatically…"\)/);
  assert.match(appSource, /setSaveState\("saved"\);\s*setSaveError\(""\)/s);
  assert.doesNotMatch(appSource, /setError\(saveError\.message\)/);
});

test("assessment UI never exposes the old raw Save issue state", () => {
  assert.match(layoutSource, /Retrying save…/);
  assert.match(layoutSource, /Connection issue/);
  assert.doesNotMatch(layoutSource, /Save issue/);
});
