<?php
declare(strict_types=1);

namespace AtomGlobal\Mail;

use AtomGlobal\Database;
use AtomGlobal\Services\SettingsService;
use PHPMailer\PHPMailer\PHPMailer;

final class Mailer
{
    public function __construct(private Database $db, private SettingsService $settings) {}
    public function process(array $job): void
    {
        $template = $this->db->fetch('SELECT subject, html_body, text_body FROM email_templates WHERE template_key = ? AND is_active = 1', [$job['template_key']]); if (!$template) throw new \RuntimeException('Email template not found.');
        $variables = json_decode($job['variables_json'], true) ?: []; $allowed = ['participant_name','assessment_type','completion_percentage','resume_url','free_report_url','paid_report_url','payment_url','affiliate_code','company_name'];
        $replace = function (string $content) use ($variables, $allowed): string { foreach ($allowed as $key) $content = str_replace('{{' . $key . '}}', htmlspecialchars((string) ($variables[$key] ?? ''), ENT_QUOTES, 'UTF-8'), $content); return $content; };
        $subject = $replace($template['subject']); $html = $replace($template['html_body']); $text = $replace($template['text_body']);
        $providerMessageId = ($_ENV['MAIL_PROVIDER'] ?? 'smtp') === 'smtp2go' ? $this->sendSmtp2Go($job['recipient_email'], $subject, $html, $text) : $this->sendSmtp($job['recipient_email'], $subject, $html, $text);
        $this->db->execute('UPDATE email_queue SET status = ?, sent_at = NOW(), provider_message_id = ?, attempts = attempts + 1 WHERE id = ?', ['sent', $providerMessageId, $job['id']]);
        $this->db->execute('INSERT INTO email_logs (email_queue_id, recipient_email, template_key, status, provider_message_id, sent_at, created_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [$job['id'], $job['recipient_email'], $job['template_key'], 'sent', $providerMessageId]);
    }
    private function sendSmtp(string $recipient, string $subject, string $html, string $text): string
    {
        $mail = new PHPMailer(true); $mail->isSMTP(); $mail->Host = (string) $this->settings->get('mail.smtp_host', $_ENV['SMTP_HOST'] ?? ''); $mail->Port = (int) $this->settings->get('mail.smtp_port', $_ENV['SMTP_PORT'] ?? 587); $mail->SMTPAuth = true; $mail->Username = (string) $this->settings->get('mail.smtp_username', $_ENV['SMTP_USERNAME'] ?? ''); $mail->Password = (string) $this->settings->get('mail.smtp_password', $_ENV['SMTP_PASSWORD'] ?? ''); $mail->SMTPSecure = $_ENV['SMTP_ENCRYPTION'] ?? 'tls';
        $mail->setFrom($_ENV['MAIL_FROM_ADDRESS'] ?? '', $_ENV['MAIL_FROM_NAME'] ?? 'Atom Global Consulting'); $mail->addAddress($recipient); $mail->isHTML(true); $mail->Subject = $subject; $mail->Body = $html; $mail->AltBody = $text; $mail->send(); return $mail->getLastMessageID();
    }
    private function sendSmtp2Go(string $recipient, string $subject, string $html, string $text): string
    {
        $payload = json_encode(['api_key' => $this->settings->get('mail.smtp2go_api_key', $_ENV['SMTP2GO_API_KEY'] ?? ''), 'sender' => sprintf('%s <%s>', $_ENV['MAIL_FROM_NAME'] ?? 'Atom Global Consulting', $_ENV['MAIL_FROM_ADDRESS'] ?? ''), 'to' => [$recipient], 'subject' => $subject, 'html_body' => $html, 'text_body' => $text], JSON_THROW_ON_ERROR);
        $curl = curl_init('https://api.smtp2go.com/v3/email/send'); curl_setopt_array($curl, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => $payload, CURLOPT_TIMEOUT => 20]); $response = curl_exec($curl); $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE); $error = curl_error($curl); curl_close($curl);
        if ($response === false || $status >= 300) throw new \RuntimeException('SMTP2GO delivery failed: ' . ($error ?: 'provider response ' . $status));
        $decoded = json_decode($response, true); return (string) ($decoded['data']['email_id'] ?? $decoded['data']['succeeded'] ?? 'smtp2go');
    }
}
