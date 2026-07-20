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
        $paidContent = is_array($paid['content'] ?? null) ? $paid['content'] : $paid;

        $brand = $logo
            ? '<img class="logo" src="' . $this->h($logo) . '" alt="Atom Global Consulting">'
            : '<div class="brand">ATOM GLOBAL CONSULTING</div>';

        $summary = $free['summary']['summary'] ?? $free['summary'] ?? '';
        if (is_array($summary)) $summary = json_encode($summary, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $html = '<!doctype html><html><head><meta charset="utf-8"><style>'
            . '@page{margin:30mm 22mm 24mm}body{font-family:' . $this->css($body) . ';color:' . $this->css($ink) . ';font-size:11pt;line-height:1.55;background:#fff}h1,h2,h3,h4{font-family:' . $this->css($heading) . ';font-weight:normal}h1{font-size:30pt;margin:0 0 6mm}h2{font-size:18pt;margin-top:10mm;border-bottom:1px solid #ddd;padding-bottom:2mm}h3{font-size:14pt;margin:7mm 0 2mm}h4{font-size:12pt;margin:4mm 0 1mm}.logo{width:54mm;max-height:18mm;object-fit:contain}.brand{font-weight:bold;letter-spacing:.08em;color:' . $this->css($heart) . ';font-size:10pt}.meta{color:' . $this->css($muted) . ';font-size:9pt}.hero{background:' . $this->css($canvas) . ';padding:10mm;margin:8mm 0;border-left:3px solid ' . $this->css($gold) . '}.score{font-family:' . $this->css($heading) . ';font-size:28pt}.report-block{page-break-inside:avoid;border:1px solid #e4ddcf;border-radius:4px;padding:5mm;margin:4mm 0}.subscale{page-break-inside:avoid;margin:3mm 0}.footer{position:fixed;bottom:-14mm;left:0;right:0;color:' . $this->css($muted) . ';font-size:8pt;text-align:center}ul{padding-left:5mm;margin-top:2mm}</style></head><body>'
            . $brand . '<p class="meta">HEAD–HEART ALIGNMENT · ' . $this->h($row['track_name']) . '</p>'
            . '<h1>' . $this->h($free['profile'] ?? 'Head–Heart Alignment Report') . '</h1>'
            . '<p class="meta">Prepared for ' . $this->h($row['participant_name']) . ' · Completed ' . $this->h((string) ($row['completed_at'] ?? '')) . '</p>'
            . '<div class="hero"><div class="score">' . (int) ($free['total'] ?? 0) . ' / 250</div><p>' . $this->h((string) $summary) . '</p></div>'
            . $this->section('Strengths to build on', $free['summary']['strengths'] ?? [])
            . $this->section('Development observations', $free['summary']['watchouts'] ?? [])
            . ($row['is_unlocked']
                ? '<h2>Full development report</h2>'
                    . $this->scoreBreakdown($paid['subscales'] ?? [])
                    . $this->renderContent($paidContent)
                : '<h2>Full report upgrade</h2><p>The detailed radar, development roadmap and track-specific guidance are available after verified payment or authorised admin unlock.</p>')
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

    private function scoreBreakdown(mixed $scores): string
    {
        if (!is_array($scores) || !$scores) return '';
        $items = [];
        foreach ($scores as $label => $score) $items[] = $this->h((string) $label) . ': ' . (int) $score . ' / 25';
        return $this->section('10-area score breakdown', $items);
    }

    private function renderContent(mixed $content): string
    {
        if (!is_array($content)) return '<p>' . $this->h((string) $content) . '</p>';
        $labels = [
            'summary' => 'Full profile interpretation',
            'strengths' => 'Strengths to build on',
            'watchouts' => 'Challenges and watch-outs',
            'developmentAreas' => 'Development areas',
            'relationships' => 'In relationships',
            'work' => 'Improving your working style',
            'workingStyleTips' => 'Working-style actions',
            'handlingDifficulty' => 'How you handle difficulty',
            'leadershipImpact' => (string) ($content['leadershipImpactLabel'] ?? 'Leadership impact'),
            'cultureFitPrompt' => (string) ($content['cultureFitLabel'] ?? 'Culture fit reflection'),
            'growth' => 'Practical ideas for growth',
            'subscaleReads' => 'Your 10-area interpretation',
            'roadmap' => 'Development roadmap',
            'upgradeReasons' => 'Full Report applications',
        ];
        $skip = ['profile', 'total', 'hasLeadershipImpact', 'hasCultureFit', 'leadershipImpactLabel', 'cultureFitLabel'];
        $html = '';
        foreach ($content as $key => $value) {
            if (in_array($key, $skip, true) || $value === null || $value === '' || $value === []) continue;
            $title = $labels[$key] ?? ucwords(str_replace(['_', '-'], ' ', (string) $key));
            $html .= '<div class="report-block"><h3>' . $this->h($title) . '</h3>' . $this->renderValue($value) . '</div>';
        }
        return $html;
    }

    private function renderValue(mixed $value): string
    {
        if (!is_array($value)) return '<p>' . $this->h((string) $value) . '</p>';
        if (array_is_list($value)) {
            $html = '';
            foreach ($value as $item) {
                if (!is_array($item)) {
                    $html .= '<ul><li>' . $this->h((string) $item) . '</li></ul>';
                    continue;
                }
                $title = (string) ($item['title'] ?? $item['area'] ?? '');
                $detail = (string) ($item['detail'] ?? $item['insight'] ?? $item['summary'] ?? '');
                $html .= '<div class="subscale">' . ($title !== '' ? '<h4>' . $this->h($title) . '</h4>' : '') . ($detail !== '' ? '<p>' . $this->h($detail) . '</p>' : '');
                if (is_array($item['steps'] ?? null)) $html .= '<ul>' . implode('', array_map(fn($step) => '<li>' . $this->h((string) $step) . '</li>', $item['steps'])) . '</ul>';
                $html .= '</div>';
            }
            return $html;
        }
        $html = '';
        foreach ($value as $key => $item) {
            $html .= '<div class="subscale"><h4>' . $this->h((string) $key) . '</h4>' . $this->renderValue($item) . '</div>';
        }
        return $html;
    }

    private function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
    private function css(string $value): string { return str_replace(['<', '>', '"', "'", '\\'], '', $value); }
}
