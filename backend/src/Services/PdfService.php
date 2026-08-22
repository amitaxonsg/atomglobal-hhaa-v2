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
            'SELECT gr.*, p.name participant_name, p.email participant_email, t.name track_name, t.track_key, s.completed_at FROM generated_reports gr JOIN survey_sessions s ON s.id = gr.survey_session_id JOIN participants p ON p.id = s.participant_id JOIN assessment_tracks t ON t.id = s.track_id WHERE gr.id = ?',
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
            . '@page{margin:30mm 22mm 24mm}body{font-family:' . $this->css($body) . ';color:' . $this->css($ink) . ';font-size:11pt;line-height:1.55;background:#fff}h1,h2,h3,h4{font-family:' . $this->css($heading) . ';font-weight:normal}h1{font-size:30pt;margin:0 0 6mm}h2{font-size:18pt;margin-top:10mm;border-bottom:1px solid #ddd;padding-bottom:2mm}h3{font-size:14pt;margin:7mm 0 2mm}h4{font-size:12pt;margin:4mm 0 1mm}.logo{width:54mm;max-height:18mm;object-fit:contain}.brand{font-weight:bold;letter-spacing:.08em;color:' . $this->css($heart) . ';font-size:10pt}.meta{color:' . $this->css($muted) . ';font-size:9pt}.hero{background:' . $this->css($canvas) . ';padding:10mm;margin:8mm 0;border-left:3px solid ' . $this->css($gold) . '}.score{font-family:' . $this->css($heading) . ';font-size:28pt}.report-block{page-break-inside:avoid;border:1px solid #e4ddcf;border-radius:4px;padding:5mm;margin:4mm 0}.subscale{page-break-inside:avoid;margin:3mm 0}.comparison-row{border-bottom:1px solid #eee;padding:2mm 0}.footer{position:fixed;bottom:-14mm;left:0;right:0;color:' . $this->css($muted) . ';font-size:8pt;text-align:center}ul,ol{padding-left:5mm;margin-top:2mm}</style></head><body>'
            . $brand . '<p class="meta">HEAD–HEART ALIGNMENT · ' . $this->h($row['track_name']) . '</p>'
            . '<h1>' . $this->h($free['profile'] ?? 'Head–Heart Alignment Report') . '</h1>'
            . '<p class="meta">Prepared for ' . $this->h($row['participant_name']) . ' · Completed ' . $this->h((string) ($row['completed_at'] ?? '')) . '</p>'
            . '<div class="hero"><div class="score">' . (int) ($free['total'] ?? 0) . ' / 250</div><p>' . $this->h((string) $summary) . '</p></div>'
            . $this->section('Top three strengths', array_slice($free['summary']['strengths'] ?? [], 0, 3))
            . $this->section('Development observations', $free['summary']['watchouts'] ?? [])
            . ($row['is_unlocked']
                ? '<h2>Full development report</h2>'
                    . $this->scoreBreakdown($paid['subscales'] ?? [], (string) $row['track_key'])
                    . $this->renderContent($paidContent, (string) $row['track_key'])
                    . $this->retakePlan()
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

    private function section(string $title, array $items, bool $ordered = false): string
    {
        if (!$items) return '';
        $tag = $ordered ? 'ol' : 'ul';
        return '<h2>' . $this->h($title) . '</h2><' . $tag . '>' . implode('', array_map(fn($item) => '<li>' . $this->h((string) $item) . '</li>', $items)) . '</' . $tag . '>';
    }

    private function scoreBreakdown(mixed $scores, string $trackKey): string
    {
        if (!is_array($scores) || !$scores) return '';
        $items = [];
        foreach ($scores as $label => $score) $items[] = $this->areaName($trackKey, (string) $label) . ': ' . (int) $score . ' / 25';
        return $this->section('10-area score breakdown', $items);
    }

    private function renderContent(mixed $content, string $trackKey): string
    {
        if (!is_array($content)) return '<p>' . $this->h((string) $content) . '</p>';
        $labels = [
            'summary' => 'Complete profile summary',
            'strengths' => 'Full strengths list',
            'watchouts' => 'Challenges and development areas',
            'developmentAreas' => 'Development areas',
            'relationships' => 'Relationships / team',
            'work' => 'Personal / working style',
            'workingStyleTips' => 'Working-style actions',
            'handlingDifficulty' => 'How you handle difficulty',
            'leadershipImpact' => (string) ($content['leadershipImpactLabel'] ?? 'Leadership impact'),
            'cultureFitPrompt' => (string) ($content['cultureFitLabel'] ?? 'Culture fit reflection'),
            'growth' => 'Five practical everyday actions',
            'subscaleReads' => 'Your 10-area interpretation',
            'roadmap' => 'Development roadmap',
            'retakeComparison' => 'Your progress since the previous assessment',
            'upgradeReasons' => 'Full Report applications',
        ];
        $skip = ['profile', 'total', 'hasLeadershipImpact', 'hasCultureFit', 'leadershipImpactLabel', 'cultureFitLabel'];
        $html = '';
        foreach ($content as $key => $value) {
            if (in_array($key, $skip, true) || $value === null || $value === '' || $value === []) continue;
            if ($key === 'retakeComparison' && is_array($value)) {
                $html .= $this->renderRetakeComparison($value, $trackKey);
                continue;
            }
            $title = $labels[$key] ?? ucwords(str_replace(['_', '-'], ' ', (string) $key));
            if ($key === 'growth' && is_array($value)) $value = array_slice($value, 0, 5);
            $html .= '<div class="report-block"><h3>' . $this->h($title) . '</h3>' . $this->renderValue($value, $trackKey, $key === 'growth') . '</div>';
        }
        return $html;
    }

    private function renderRetakeComparison(array $comparison, string $trackKey): string
    {
        $previous = (int) ($comparison['previousTotal'] ?? 0);
        $current = (int) ($comparison['currentTotal'] ?? 0);
        $change = (int) ($comparison['totalChange'] ?? ($current - $previous));
        $signed = $change > 0 ? '+' . $change : (string) $change;
        $html = '<div class="report-block"><h3>Your progress since the previous assessment</h3>'
            . '<p><strong>Overall:</strong> ' . $previous . ' → ' . $current . ' (' . $this->h($signed) . ')</p>';
        foreach (($comparison['areas'] ?? []) as $area) {
            if (!is_array($area)) continue;
            $areaChange = (int) ($area['change'] ?? 0);
            $areaSigned = $areaChange > 0 ? '+' . $areaChange : (string) $areaChange;
            $html .= '<div class="comparison-row"><strong>' . $this->h($this->areaName($trackKey, (string) ($area['code'] ?? ''))) . '</strong>: '
                . (int) ($area['previous'] ?? 0) . ' → ' . (int) ($area['current'] ?? 0) . ' (' . $this->h($areaSigned) . ')</div>';
        }
        if (!empty($comparison['guidance'])) $html .= '<p>' . $this->h((string) $comparison['guidance']) . '</p>';
        return $html . '</div>';
    }

    private function renderValue(mixed $value, string $trackKey, bool $ordered = false): string
    {
        if (!is_array($value)) return '<p>' . $this->h((string) $value) . '</p>';
        if (array_is_list($value)) {
            $listItems = [];
            $html = '';
            foreach ($value as $item) {
                if (!is_array($item)) {
                    $listItems[] = '<li>' . $this->h((string) $item) . '</li>';
                    continue;
                }
                $title = (string) ($item['title'] ?? $item['area'] ?? '');
                $detail = (string) ($item['detail'] ?? $item['insight'] ?? $item['summary'] ?? '');
                $html .= '<div class="subscale">' . ($title !== '' ? '<h4>' . $this->h($title) . '</h4>' : '') . ($detail !== '' ? '<p>' . $this->h($detail) . '</p>' : '');
                if (is_array($item['steps'] ?? null)) $html .= '<ul>' . implode('', array_map(fn($step) => '<li>' . $this->h((string) $step) . '</li>', $item['steps'])) . '</ul>';
                $html .= '</div>';
            }
            if ($listItems) {
                $tag = $ordered ? 'ol' : 'ul';
                $html = '<' . $tag . '>' . implode('', $listItems) . '</' . $tag . '>' . $html;
            }
            return $html;
        }
        $html = '';
        foreach ($value as $key => $item) {
            $label = preg_match('/^[A-Z]{2}$/', (string) $key) ? $this->areaName($trackKey, (string) $key) : (string) $key;
            $html .= '<div class="subscale"><h4>' . $this->h($label) . '</h4>' . $this->renderValue($item, $trackKey) . '</div>';
        }
        return $html;
    }

    private function retakePlan(): string
    {
        return '<div class="report-block"><h3>3-month retake and progress check</h3>'
            . '<p>Commit to two or three changes from this report and practise them consistently. Retake the full 40-question assessment in about three months to compare what shifted, what stayed stable, and where old patterns still appear under pressure.</p>'
            . '<p><strong>Retake price: USD 2.</strong> The retake is for participants who previously completed and unlocked a paid Full Development Report. The new Full Development Report will include comparison with the previous result.</p></div>';
    }

    private function areaName(string $trackKey, string $code): string
    {
        $areas = [
            'personal' => ['DM' => 'Personal Decision-Making', 'RC' => 'Relationships & Connection', 'EA' => 'Emotional Awareness', 'CN' => 'Conflict Navigation', 'TI' => 'Trust & Intuition', 'EC' => 'Empathy & Compassion', 'AE' => 'Authentic Self-Expression', 'SP' => 'Stress & Pressure Response', 'VP' => 'Values & Life Priorities', 'CS' => 'Communication Style'],
            'newjoiner' => ['DM' => 'New Joiner Decision-Making as You Start Out', 'RC' => 'Building Relationships at a New Job', 'EA' => 'Emotional Awareness in a New Environment', 'CN' => 'Handling Feedback & Early Conflict', 'TI' => 'Trust & Intuition as a Newcomer', 'EC' => 'Empathy for Your New Team', 'AE' => 'Authentic Presence as the New Person', 'SP' => 'Pressure & Imposter Moments', 'VP' => 'What You’re Optimizing For Early On', 'CS' => 'Communication as a New Team Member'],
            'manager' => ['DM' => 'Manager Decision-Making', 'RC' => 'Team Relationships & Trust', 'EA' => 'Emotional Awareness at Work', 'CN' => 'Conflict & Difficult Conversations', 'TI' => 'Trust & Intuition About People', 'EC' => 'Empathy for Your Team', 'AE' => 'Authentic Leadership', 'SP' => 'Stress & Pressure at Work', 'VP' => 'What You’re Optimizing For', 'CS' => 'Communication as a Manager'],
            'executive' => ['DM' => 'Executive Strategic Decision-Making', 'RC' => 'Executive Trust & Relationships', 'EA' => 'Emotional Awareness in the C-Suite', 'CN' => 'High-Stakes Conflict & Negotiation', 'TI' => 'Trust & Intuition on Big Bets', 'EC' => 'Empathy at Scale', 'AE' => 'Authentic Executive Presence', 'SP' => 'Pressure at the Top', 'VP' => 'What You’re Building For', 'CS' => 'Communication as an Executive'],
        ];
        return $areas[$trackKey][$code] ?? $code;
    }

    private function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
    private function css(string $value): string { return str_replace(['<', '>', '"', "'", '\\'], '', $value); }
}
