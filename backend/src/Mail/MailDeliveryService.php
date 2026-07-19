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
        $html = $this->render((string) $template['html_body'], $variables);
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

    private function render(string $content, array $variables): string
    {
        foreach ($variables as $key => $value) {
            if (is_scalar($value) || $value === null) {
                $content = str_replace(['{{' . $key . '}}', '{{ ' . $key . ' }}'], (string) $value, $content);
            }
        }
        return $content;
    }

    private function fromAddress(): string { return (string) $this->settings->get('email.admin_from_address', $_ENV['MAIL_FROM_ADDRESS'] ?? 'assessment@atomglobal.com'); }
    private function fromName(): string { return (string) $this->settings->get('email.admin_from_name', $_ENV['MAIL_FROM_NAME'] ?? 'Atom Global Consulting'); }
    private function replyTo(): string { return (string) $this->settings->get('email.reply_to', $_ENV['MAIL_REPLY_TO'] ?? ''); }
}
