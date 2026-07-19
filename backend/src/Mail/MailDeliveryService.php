<?php
declare(strict_types=1);

namespace AtomGlobal\Mail;

use AtomGlobal\Database;
use AtomGlobal\Services\SettingsService;
use PHPMailer\PHPMailer\PHPMailer;

final class MailDeliveryService
{
    public function __construct(private Database $db, private SettingsService $settings) {}

    public function deliver(array $queue): string
    {
        $template = $this->db->fetch('SELECT * FROM email_templates WHERE template_key = ? AND is_active = 1', [$queue['template_key']]);
        if (!$template && $queue['template_key'] === 'admin_test') {
            $variables = json_decode($queue['variables_json'], true) ?: [];
            $template = [
                'subject' => $variables['subject'] ?? 'Atom Global email test',
                'html_body' => '<p>' . htmlspecialchars((string) ($variables['message'] ?? 'Email configuration test.'), ENT_QUOTES, 'UTF-8') . '</p>',
                'text_body' => (string) ($variables['message'] ?? 'Email configuration test.'),
            ];
        }
        if (!$template) throw new \RuntimeException('Email template is unavailable: ' . $queue['template_key']);

        $variables = json_decode($queue['variables_json'], true) ?: [];
        $subject = $this->render((string) $template['subject'], $variables);
        $content = $this->render((string) $template['html_body'], $variables);
        $html = $this->brandHtml($content, $subject);
        $text = $this->render((string) $template['text_body'], $variables);
        $provider = strtolower((string) $this->settings->get('email.provider', $_ENV['MAIL_PROVIDER'] ?? 'smtp2go'));

        return $provider === 'smtp2go'
            ? $this->sendSmtp2Go($queue['recipient_email'], $subject, $html, $text)
            : $this->sendSmtp($queue['recipient_email'], $subject, $html, $text);
    }

    private function sendSmtp2Go(string $recipient, string $subject, string $html, string $text): string
    {
        $apiKey = $this->settings->get('email.smtp2go_api_key', $_ENV['SMTP2GO_API_KEY'] ?? '');
        if (!$apiKey) throw new \RuntimeException('SMTP2GO API key is not configured.');
        $endpoint = $_ENV['SMTP2GO_API_URL'] ?? 'https://api.smtp2go.com/v3/email/send';
        $payload = [
            'api_key' => $apiKey,
            'sender' => $this->fromAddress(),
            'to' => [$recipient],
            'subject' => $subject,
            'html_body' => $html,
            'text_body' => $text,
        ];
        $replyTo = $this->replyTo();
        if ($replyTo) $payload['custom_headers'] = [['header' => 'Reply-To', 'value' => $replyTo]];

        $curl = curl_init($endpoint);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
        ]);
        $response = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);
        curl_close($curl);
        if ($response === false || $status < 200 || $status >= 300) throw new \RuntimeException('SMTP2GO delivery failed: ' . ($error ?: (string) $response));
        $decoded = json_decode((string) $response, true) ?: [];
        return (string) ($decoded['data']['email_id'] ?? $decoded['request_id'] ?? 'smtp2go-' . bin2hex(random_bytes(8)));
    }

    private function sendSmtp(string $recipient, string $subject, string $html, string $text): string
    {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = (string) $this->settings->get('email.smtp_host', $_ENV['SMTP_HOST'] ?? '');
        $mail->Port = (int) $this->settings->get('email.smtp_port', $_ENV['SMTP_PORT'] ?? 587);
        $mail->SMTPAuth = true;
        $mail->Username = (string) $this->settings->get('email.smtp_username', $_ENV['SMTP_USERNAME'] ?? '');
        $mail->Password = (string) $this->settings->get('email.smtp_password', $_ENV['SMTP_PASSWORD'] ?? '');
        $encryption = (string) $this->settings->get('email.smtp_encryption', $_ENV['SMTP_ENCRYPTION'] ?? 'tls');
        if ($encryption !== '') $mail->SMTPSecure = $encryption;
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($this->fromAddress(), $this->fromName());
        if ($this->replyTo()) $mail->addReplyTo($this->replyTo());
        $mail->addAddress($recipient);
        $mail->Subject = $subject;
        $mail->isHTML(true);
        $mail->Body = $html;
        $mail->AltBody = $text;
        $mail->send();
        return $mail->getLastMessageID() ?: 'smtp-' . bin2hex(random_bytes(8));
    }

    private function brandHtml(string $content, string $subject): string
    {
        if (stripos($content, '<html') !== false) return $content;

        $baseUrl = rtrim((string) $this->settings->get('email.public_base_url', $_ENV['APP_URL'] ?? 'https://head-heart.atomglobal.com'), '/');
        $logo = (string) $this->settings->get(
            'email.logo_url',
            $this->settings->get('branding.email_logo_url', '/media/brand/atom-global-wordmark.png')
        );
        $logo = $this->absoluteUrl($logo, $baseUrl);
        $websiteUrl = $this->absoluteUrl((string) $this->settings->get('email.website_url', '/'), $baseUrl);
        $privacyUrl = $this->absoluteUrl((string) $this->settings->get('email.privacy_url', '/privacy'), $baseUrl);
        $termsUrl = $this->absoluteUrl((string) $this->settings->get('email.terms_url', '/terms'), $baseUrl);
        $footer = (string) $this->settings->get('email.footer_text', 'Head–Heart Alignment by Atom Global Consulting');

        $safeSubject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
        $safeLogo = htmlspecialchars($logo, ENT_QUOTES, 'UTF-8');
        $safeWebsite = htmlspecialchars($websiteUrl, ENT_QUOTES, 'UTF-8');
        $safePrivacy = htmlspecialchars($privacyUrl, ENT_QUOTES, 'UTF-8');
        $safeTerms = htmlspecialchars($termsUrl, ENT_QUOTES, 'UTF-8');
        $safeFooter = htmlspecialchars($footer, ENT_QUOTES, 'UTF-8');

        return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            . '<title>' . $safeSubject . '</title>'
            . '<style>'
            . 'body{margin:0;background:#f4f0ea;color:#2b251f;font-family:Arial,Helvetica,sans-serif}'
            . '.ag-wrap{width:100%;padding:32px 14px;background:#f4f0ea}'
            . '.ag-card{width:100%;max-width:620px;margin:0 auto;background:#fff;border:1px solid #e5ddd3;border-top:4px solid #c8483f;border-radius:10px;overflow:hidden}'
            . '.ag-head{padding:32px 34px 18px;text-align:center}.ag-head img{display:block;width:190px;max-width:70%;height:auto;margin:0 auto 18px}'
            . '.ag-kicker{margin:0;color:#c8483f;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase}'
            . '.ag-content{padding:10px 38px 34px;color:#443c35;font-size:15px;line-height:1.7}'
            . '.ag-content p{margin:0 0 18px}.ag-content h1,.ag-content h2{font-family:Georgia,Times New Roman,serif;font-weight:400;color:#241f1b}'
            . '.ag-content a{color:#fff!important;background:#c8483f;display:inline-block;padding:12px 20px;border-radius:7px;text-decoration:none;font-weight:700}'
            . '.ag-foot{padding:22px 28px;background:#fbf8f4;border-top:1px solid #ece5dc;text-align:center;color:#7a7168;font-size:11px;line-height:1.6}'
            . '.ag-foot a{color:#665b51;text-decoration:underline;margin:0 7px}'
            . '@media(max-width:640px){.ag-wrap{padding:14px 8px}.ag-head{padding:26px 20px 14px}.ag-content{padding:8px 22px 28px}}'
            . '</style></head><body>'
            . '<div class="ag-wrap"><div class="ag-card">'
            . '<div class="ag-head"><img src="' . $safeLogo . '" alt="Atom Global"><p class="ag-kicker">Head–Heart Alignment</p></div>'
            . '<div class="ag-content">' . $content . '</div>'
            . '<div class="ag-foot"><strong>' . $safeFooter . '</strong><br>'
            . '<a href="' . $safeWebsite . '">Website</a>'
            . '<a href="' . $safePrivacy . '">Privacy</a>'
            . '<a href="' . $safeTerms . '">Terms</a><br>'
            . 'This message was sent because you started, completed or administer a Head–Heart Alignment assessment.'
            . '</div></div></div></body></html>';
    }

    private function absoluteUrl(string $value, string $baseUrl): string
    {
        $value = trim($value);
        if ($value === '') return $baseUrl;
        if (preg_match('#^https?://#i', $value)) return $value;
        return $baseUrl . '/' . ltrim($value, '/');
    }

    private function render(string $content, array $variables): string
    {
        foreach ($variables as $key => $value) {
            if (is_scalar($value) || $value === null) {
                $content = str_replace(['{{' . $key . '}}', '{{ ' . $key . ' }}'], (string) $value, $content);
            }
        }
        return $content;
    }

    private function fromAddress(): string { return (string) $this->settings->get('email.admin_from_address', $_ENV['MAIL_FROM_ADDRESS'] ?? 'amit@axon.com.sg'); }
    private function fromName(): string { return (string) $this->settings->get('email.admin_from_name', $_ENV['MAIL_FROM_NAME'] ?? 'Atom Global'); }
    private function replyTo(): string { return (string) $this->settings->get('email.reply_to', $_ENV['MAIL_REPLY_TO'] ?? ''); }
}
