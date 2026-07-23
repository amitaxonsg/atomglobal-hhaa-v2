import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const dispatcher = read("../../deploy/update-vps.sh");
const apache = read("../../deploy/update-vps-apache.sh");
const nginx = read("../../deploy/update-vps-nginx.sh");
const mediaRepair = read("../../deploy/repair-public-media.sh");

test("deployment dispatcher follows the active web server without starting one", () => {
  assert.match(dispatcher, /systemctl is-active --quiet apache2/);
  assert.match(dispatcher, /update-vps-apache\.sh/);
  assert.match(dispatcher, /systemctl is-active --quiet nginx/);
  assert.match(dispatcher, /update-vps-nginx\.sh/);
  assert.match(dispatcher, /Refusing to start Apache or Nginx automatically/);
});

test("Nginx deployment still backs up and atomically repoints only Head–Heart", () => {
  assert.match(nginx, /resolve_nginx_site/);
  assert.match(nginx, /nginx-\$\{DOMAIN\}-\$\{STAMP\}/);
  assert.match(nginx, /OLD_RELEASE_PATHS/);
  assert.match(nginx, /NGINX_CONTENT=.*RELEASE_DIR/s);
  assert.match(nginx, /mv -f "\$NGINX_TEMP" "\$NGINX_SITE"/);
  assert.match(nginx, /restoring the previous release and Nginx site/);
});

test("Apache deployment uses immutable releases and persistent CMS media", () => {
  assert.match(apache, /resolve_apache_site/);
  assert.match(apache, /apache-\$\{DOMAIN\}-\$\{STAMP\}/);
  assert.match(apache, /ln -s "\$STORAGE_PATH\/media" "\$TEMP_DIR\/frontend\/media-uploads"/);
  assert.match(apache, /apache2ctl configtest/);
  assert.match(apache, /Configured media returned a non-image response/);
  assert.match(apache, /restoring the previous release and Apache site/);
});

test("both deployment paths verify the current questionnaire before success", () => {
  for (const script of [apache, nginx]) {
    assert.match(script, /latest-visual-panel/);
    assert.match(script, /latest-track-card/);
    assert.match(script, /liveTrackKey/);
    assert.match(script, /Begin the free assessment/);
    assert.match(script, /api\/public\/assessment-experience/);
    assert.match(script, /Every choice you make is cast by two votes/);
  }
});

test("media repair is exact, rollback-capable and requires no server reload", () => {
  assert.match(mediaRepair, /public-media-repair-\$STAMP/);
  assert.match(mediaRepair, /ln -sfn "\$MEDIA_DIR" "\$PUBLIC_LINK"/);
  assert.match(mediaRepair, /cmp -s "\$PHOTO_SOURCE" "\$PHOTO_SERVED"/);
  assert.match(mediaRepair, /cmp -s "\$LOGO_SOURCE" "\$LOGO_SERVED"/);
  assert.match(mediaRepair, /No Apache or Nginx service was started or reloaded/);
  assert.match(mediaRepair, /restore_metadata/);
});
