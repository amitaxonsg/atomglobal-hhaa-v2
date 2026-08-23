#!/usr/bin/env bash
set -Eeuo pipefail

PROD_BACKEND="/var/www/head-heart.atomglobal.com/current/backend"
STAGE_BACKEND="/srv/head-heart.atomglobal.com/staging-source/backend"
TMP="$(mktemp /root/head-heart-v2-mail.XXXXXX.json)"
trap 'rm -f "$TMP"' EXIT
chmod 600 "$TMP"

[[ "${EUID}" -eq 0 ]] || { echo "ERROR: run as root" >&2; exit 1; }
[[ -f "$PROD_BACKEND/src/bootstrap.php" ]] || { echo "ERROR: V2 backend not found" >&2; exit 1; }
[[ -f "$STAGE_BACKEND/src/bootstrap.php" ]] || { echo "ERROR: V3 staging backend not found" >&2; exit 1; }

cd "$PROD_BACKEND"
php -r '
$c=require "src/bootstrap.php";
$s=$c["settings"];
$db=$c["db"];
$keys=[
 "email.provider","email.smtp_host","email.smtp_port","email.smtp_username","email.smtp_encryption",
 "email.smtp2go_api_key","email.admin_from_name","email.admin_from_address","email.reply_to",
 "email.logo_url","email.website_url","email.privacy_url","email.terms_url","email.footer_text",
 "email.reminder_hours","email.max_attempts"
];
$out=["settings"=>[],"templates"=>[]];
foreach($keys as $k){$v=$s->get($k,""); if(is_scalar($v)||$v===null)$out["settings"][$k]=$v;}
$provider=strtolower(trim((string)($out["settings"]["email.provider"]??"")));
if($provider!=="smtp2go") {fwrite(STDERR,"ERROR: V2 is not configured for SMTP2GO\n"); exit(2);} 
if(trim((string)($out["settings"]["email.smtp2go_api_key"]??""))==="") {fwrite(STDERR,"ERROR: V2 SMTP2GO API key is unavailable\n"); exit(3);} 
$out["templates"]=$db->fetchAll("SELECT template_key,template_name,subject,html_body,text_body,is_active FROM email_templates ORDER BY template_key");
file_put_contents($argv[1],json_encode($out,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR));
echo "V2 email configuration exported securely in memory-backed temp file.\n";
' "$TMP"

cd "$STAGE_BACKEND"
php -r '
$data=json_decode(file_get_contents($argv[1]),true,512,JSON_THROW_ON_ERROR);
$c=require "src/bootstrap.php";
$s=$c["settings"];
$db=$c["db"];
foreach(($data["settings"]??[]) as $k=>$v){
  if($k==="email.smtp2go_api_key") {$s->set($k,(string)$v,true); continue;}
  $s->set($k,$v,false);
}
$s->set("email.provider","smtp2go",false);
$s->set("email.public_base_url","https://head-heart-staging.atomglobal.com",false);
$logo=(string)($data["settings"]["email.logo_url"]??"");
if($logo==="") $logo="/media-uploads/atom-global-2019-dc59d6f1ab15aa23112c.png";
$s->set("branding.logo_url",$logo,false);
$s->set("branding.email_logo_url",$logo,false);
$s->set("branding.report_logo_url",$logo,false);
$s->set("email.logo_url",$logo,false);
foreach(($data["templates"]??[]) as $t){
  $db->execute(
    "INSERT INTO email_templates (template_key,template_name,subject,html_body,text_body,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW()) ON DUPLICATE KEY UPDATE template_name=VALUES(template_name),subject=VALUES(subject),html_body=VALUES(html_body),text_body=VALUES(text_body),is_active=VALUES(is_active),updated_at=NOW()",
    [(string)$t["template_key"],(string)$t["template_name"],(string)$t["subject"],(string)$t["html_body"],(string)$t["text_body"],(int)$t["is_active"]]
  );
}
echo "V3 staging email provider: SMTP2GO\n";
echo "V3 staging email templates copied: ".count($data["templates"]??[])."\n";
echo "V3 public/email/report logo: ".$logo."\n";
echo "V3 public email base URL: https://head-heart-staging.atomglobal.com\n";
' "$TMP"

rm -f "$TMP"
trap - EXIT

php bin/email-settings-audit.php

echo "Copy complete. Stripe settings are unchanged by this helper."
