import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const repair = readFileSync("backend/bin/repair-assessment-integrity.php", "utf8");

test("assessment repair requires explicit confirmation and preserves participant records", () => {
  assert.match(repair, /PUBLISH-EXACT-V2-AND-PRUNE-UNREFERENCED/);
  assert.match(repair, /survey_sessions WHERE assessment_version_id/);
  assert.match(repair, /score_snapshots WHERE assessment_version_id/);
  assert.match(repair, /Cannot rebuild .* participant sessions or score snapshots/);
  assert.doesNotMatch(repair, /DELETE FROM participants/i);
  assert.doesNotMatch(repair, /DELETE FROM survey_sessions/i);
  assert.doesNotMatch(repair, /DELETE FROM score_snapshots/i);
  assert.doesNotMatch(repair, /DELETE FROM generated_reports/i);
});

test("assessment repair publishes exact v2 and prunes only unreferenced obsolete versions", () => {
  assert.match(repair, /const TARGET_VERSION = '2\.0\.0'/);
  assert.match(repair, /const TRACK_KEYS = \['personal', 'newjoiner', 'manager', 'executive'\]/);
  assert.match(repair, /if \(\$refs\['sessions'\] > 0 \|\| \$refs\['scores'\] > 0\)/);
  assert.match(repair, /DELETE FROM assessment_versions WHERE id = \?/);
  assert.match(repair, /only unreferenced obsolete questionnaire versions were eligible for deletion/);
});
