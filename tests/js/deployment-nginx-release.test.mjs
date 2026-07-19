import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("../../deploy/update-vps.sh", import.meta.url), "utf8");

test("deployment backs up and atomically repoints only the Head–Heart Nginx site", () => {
  assert.match(script, /resolve_nginx_site/);
  assert.match(script, /nginx-\$\{DOMAIN\}-\$\{STAMP\}/);
  assert.match(script, /OLD_RELEASE_PATHS/);
  assert.match(script, /NGINX_CONTENT=.*RELEASE_DIR/s);
  assert.match(script, /mv -f "\$NGINX_TEMP" "\$NGINX_SITE"/);
  assert.match(script, /restoring the previous release and Nginx site/);
});

test("deployment will not report success while the old frontend or questionnaire API is served", () => {
  assert.match(script, /latest-track-card/);
  assert.match(script, /Begin the free assessment/);
  assert.match(script, /api\/public\/assessment-experience/);
  assert.match(script, /Every choice you make is cast by two votes/);
  assert.match(script, /Questionnaire API: latest landing and four-track configuration verified/);
});
