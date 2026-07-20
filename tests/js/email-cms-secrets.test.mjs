import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const settings = fs.readFileSync("backend/src/Services/SettingsService.php", "utf8");
const delivery = fs.readFileSync("backend/src/Mail/MailDeliveryService.php", "utf8");
const audit = fs.readFileSync("backend/bin/email-settings-audit.php", "utf8");

test("masked secret descriptors cannot overwrite encrypted settings", () => {
  assert.match(settings, /if \(!is_string\(\$value\)\) return;/);
  assert.match(settings, /preg_match\('\/\^\[\*•\]\+\$\/u'/);
  assert.match(settings, /SMTP2GO API key appears incomplete/);
});

test("outbound sender identity is sourced only from CMS", () => {
  assert.match(delivery, /email\.admin_from_address', ''/);
  assert.match(delivery, /email\.admin_from_name', ''/);
  assert.match(delivery, /'sender' => \$this->senderIdentity\(\)/);
  assert.doesNotMatch(delivery, /amit@axon\.com\.sg/);
  assert.doesNotMatch(delivery, /MAIL_FROM_ADDRESS/);
  assert.doesNotMatch(delivery, /MAIL_FROM_NAME/);
  assert.doesNotMatch(delivery, /SMTP2GO_API_KEY/);
});

test("redacted email configuration audit exposes no secret values", () => {
  assert.match(audit, /secretsConfiguredInCms/);
  assert.match(audit, /effectiveSenderIdentity/);
  assert.doesNotMatch(audit, /settings->get\('email\.smtp2go_api_key'/);
  assert.doesNotMatch(audit, /settings->get\('email\.smtp_password'/);
});
