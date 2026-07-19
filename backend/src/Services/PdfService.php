<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;
use Dompdf\Dompdf;
use Dompdf\Options;

final class PdfService
{
    public function __construct(private Database $db, private SettingsService $settings, private array $config) {}

    public function generate(int $reportId): string
    {
        $row = $this->db->fetch(
            'SELECT gr.*, p.name participant_name, p.email participant_email, t.name track_name, s.completed_at FROM generated_reports gr JOIN survey_sessions s ON s.id = gr.survey_session_id JOIN participants p ON p.id = s.participant_id JOIN assessment_tracks t ON t.id = s.track_id WHERE gr.id = ?',
            [$reportId]
        );
        if (!$row) throw new \RuntimeException('Report not found.', 404);

        $free = json_decode($row['free_report_json'], true, 512, JSON_THROW_ON_ERROR);
        $paid = json_decode($row['paid_report_json'], true, 512, JSON_THROW_ON_ERROR);
        $canvas = $this->settings->get('branding.canvas', '#F7F4EF');
        $ink = $this->settings->get('branding.text_primary', '#211C16');
        $muted = $this->settings->get('branding.text_muted', '#726A5B');
        $heart = $this->settings->get('branding.heart', '#C1443F');
        $gold = $this->settings->get('branding.accent', '#C9A15A');
        $heading = $this->settings->get('branding.heading_font', 'Georgia, Times New Roman, serif');
        $body = $this->settings->get('branding.body_font', 'Arial, Helvetica, sans-serif');
        $logo = $this->logoDataUri((string) $this->settings->get('branding.report_logo_url', '/media/brand/atom-global-wordmark.png'));
        $content = $row['is_unlocked'] ? $paid : $free;

        $brand = $logo
            ? '<img class="logo" src="' . $this->h($logo) . '" alt="Atom Global Consulting">'
            : '<div class="brand">ATOM GLOBAL CONSULTING</div>';

        $summary = $free['summary']['summary'] ?? $free['summary'] ?? '';
        if (is_array($summary)) $summary = json_encode($summary, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $html = '<!doctype html><html><head><meta charset="utf-8"><style>'
            . '@page{margin:30mm 22mm 24mm}body{font-family:' . $this->css($body) . ';color:' . $this->css($ink) . ';font-size:11pt;line-height:1.55;background:#fff}h1,h2,h3{font-family:' . $this->css($heading) . ';font-weight:normal}h1{font-size:30pt;margin:0 0 6mm}h2{font-size:18pt;margin-top:10mm;border-bottom:1px solid #ddd;padding-bottom:2mm}h3{font-size:14pt}.logo{width:54mm;max-height:18mm;object-fit:contain}.brand{font-weight:bold;letter-spacing:.08em;color:' . $this->css($heart) . ';font-size:10pt}.meta{color:' . $this->css($muted) . ';font-size:9pt}.hero{background:' . $this->css($canvas) . ';padding:10mm;margin:8mm 0;border-left:3px solid ' . $this->css($gold) . '}.score{font-family:' . $this->css($heading) . ';font-size:28pt}.footer{position:fixed;bottom:-14mm;left:0;right:0;color:' . $this->css($muted) . ';font-size:8pt;text-align:center}ul{padding-left:5mm}pre{white-space:pre-wrap;font-family:' . $this->css($body) . ';font-size:9pt}</style></head><body>'
            . $brand . '<p class="meta">HEAD–HEART ALIGNMENT · ' . $this->h($row['track_name']) . '</p>'
            . '<h1>' . $this->h($free['profile'] ?? 'Head–Heart Alignment Report') . '</h1>'
            . '<p class="meta">Prepared for ' . $this->h($row['participant_name']) . ' · Completed ' . $this->h((string) ($row['completed_at'] ?? '')) . '</p>'
            . '<div class="hero"><div class="score">' . (int) ($free['total'] ?? 0) . ' / 250</div><p>' . $this->h((string) $summary) . '</p></div>'
            . $this->section('Strengths to build on', $free['summary']['strengths'] ?? [])
            . $this->section('Development observations', $free['summary']['watchouts'] ?? [])
            . ($row['is_unlocked'] ? '<h2>Full development report</h2>' . $this->renderContent($content) : '<h2>Full report upgrade</h2><p>The detailed radar, development roadmap and track-specific guidance are available after verified payment or authorised admin unlock.</p>')
            . '<div class="footer">Head–Heart Alignment by Atom Global Consulting · Private and confidential</div></body></html>';

        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('isHtml5ParserEnabled', true);
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4');
        $dompdf->render();

        $directory = rtrim((string) $this->config['storage'], '/') . '/reports';
        if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) throw new \RuntimeException('Report storage is unavailable.');
        $path = $directory . '/report-' . $reportId . '-' . bin2hex(random_bytes(8)) . '.pdf';
        file_put_contents($path, $dompdf->output(), LOCK_EX);
        chmod($path, 0640);
        $this->db->execute('UPDATE generated_reports SET pdf_path = ?, pdf_generated_at = NOW(), updated_at = NOW() WHERE id = ?', [$path, $reportId]);
        return $path;
    }

    private function logoDataUri(string $url): ?string
    {
        $path = null;
        if (str_starts_with($url, '/media-uploads/')) {
            $path = rtrim((string) $this->config['storage'], '/') . '/media/' . basename($url);
        } elseif (str_starts_with($url, '/')) {
            $path = dirname(__DIR__, 3) . '/frontend' . $url;
        }
        if (!$path || !is_file($path) || filesize($path) > 2 * 1024 * 1024) return null;
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($path) ?: 'image/png';
        if (!str_starts_with($mime, 'image/')) return null;
        return 'data:' . $mime . ';base64,' . base64_encode((string) file_get_contents($path));
    }

    private function section(string $title, array $items): string
    {
        if (!$items) return '';
        return '<h2>' . $this->h($title) . '</h2><ul>' . implode('', array_map(fn($item) => '<li>' . $this->h((string) $item) . '</li>', $items)) . '</ul>';
    }

    private function renderContent(mixed $content): string
    {
        if (!is_array($content)) return '<p>' . $this->h((string) $content) . '</p>';
        $html = '';
        foreach ($content as $key => $value) {
            if (in_array($key, ['profile', 'total'], true)) continue;
            $html .= '<h3>' . $this->h(ucwords(str_replace(['_', '-'], ' ', (string) $key))) . '</h3>';
            if (is_array($value)) {
                if (array_is_list($value) && count(array_filter($value, 'is_scalar')) === count($value)) {
                    $html .= '<ul>' . implode('', array_map(fn($item) => '<li>' . $this->h((string) $item) . '</li>', $value)) . '</ul>';
                } else {
                    $html .= '<pre>' . $this->h((string) json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) . '</pre>';
                }
            } else {
                $html .= '<p>' . $this->h((string) $value) . '</p>';
            }
        }
        return $html;
    }

    private function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
    private function css(string $value): string { return str_replace(['<', '>', '"', "'", '\\'], '', $value); }
}
