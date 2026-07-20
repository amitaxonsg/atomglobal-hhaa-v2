from pathlib import Path
import re


admin = Path("backend/src/Services/AdminService.php")
text = admin.read_text()
text, count = re.subn(
    r"    private const BRAND_KEYS = \[.*?\n    \];",
    '''    private const BRAND_KEYS = [
        'canvas','surface','text_primary','text_muted','border','cta','cta_hover','heart','head','accent','navy',
        'questionnaire_copy','questionnaire_label','input_surface','input_text','option_surface','option_text',
        'selected_surface','selected_text','progress','heading_font','body_font','base_font_size','page_title_size',
        'body_text_size','question_text_size','option_text_size','field_label_size','field_text_size','meta_text_size',
        'visual_title_size','visual_body_size','content_max_width','intake_max_width','question_max_width','content_gutter',
        'card_radius','button_radius','logo_url','favicon_url','email_logo_url','report_logo_url','banner_url'
    ];''',
    text,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit("BRAND_KEYS block not found")

validation = r'''    private function validateBranding(array $payload): array
    {
        $defaults = $this->publicConfiguration()['branding'];
        $colourKeys = [
            'canvas','surface','textPrimary','textMuted','border','cta','ctaHover','heart','head','accent','navy',
            'questionnaireCopy','questionnaireLabel','inputSurface','inputText','optionSurface','optionText',
            'selectedSurface','selectedText','progress',
        ];
        $numericBounds = [
            'baseFontSize' => [12, 22], 'pageTitleSize' => [36, 88], 'bodyTextSize' => [12, 22],
            'questionTextSize' => [14, 26], 'optionTextSize' => [9, 18], 'fieldLabelSize' => [9, 18],
            'fieldTextSize' => [12, 22], 'metaTextSize' => [9, 18], 'visualTitleSize' => [36, 96],
            'visualBodySize' => [12, 30], 'contentMaxWidth' => [520, 1100], 'intakeMaxWidth' => [600, 1200],
            'questionMaxWidth' => [640, 1200], 'contentGutter' => [24, 120], 'cardRadius' => [0, 32],
            'buttonRadius' => [0, 32],
        ];
        $fontKeys = ['headingFont', 'bodyFont'];
        $assetKeys = ['logoUrl', 'faviconUrl', 'emailLogoUrl', 'reportLogoUrl', 'bannerUrl'];
        $result = [];

        foreach ($defaults as $key => $default) {
            $value = $payload[$key] ?? $default;
            if (in_array($key, $colourKeys, true)) {
                if (!preg_match('/^#[0-9A-Fa-f]{6}$/', (string) $value)) {
                    throw new \InvalidArgumentException('Invalid colour value for ' . $key . '.');
                }
                $result[$key] = strtoupper((string) $value);
                continue;
            }
            if (isset($numericBounds[$key])) {
                if (!is_numeric($value)) throw new \InvalidArgumentException('Invalid numeric value for ' . $key . '.');
                $number = (int) round((float) $value);
                [$minimum, $maximum] = $numericBounds[$key];
                if ($number < $minimum || $number > $maximum) {
                    throw new \InvalidArgumentException($key . ' must be between ' . $minimum . ' and ' . $maximum . '.');
                }
                $result[$key] = $number;
                continue;
            }
            if (in_array($key, $fontKeys, true)) {
                $font = trim((string) $value);
                if ($font === '' || strlen($font) > 180 || !preg_match('/^[A-Za-z0-9\s,"\'\.\-]+$/', $font)) {
                    throw new \InvalidArgumentException('Invalid font stack for ' . $key . '.');
                }
                $result[$key] = $font;
                continue;
            }
            if (in_array($key, $assetKeys, true)) {
                $url = trim((string) $value);
                if ($url !== '' && !preg_match('#^(?:/|https://)#i', $url)) {
                    throw new \InvalidArgumentException('Brand assets must use a local path or HTTPS URL.');
                }
                $result[$key] = $url;
                continue;
            }
            $result[$key] = $value;
        }
        return $result;
    }

    private function brandDefault(string $key): mixed
    {
        return match ($key) {
            'canvas' => '#F7F4EF', 'surface' => '#FFFFFF', 'text_primary' => '#211C16', 'text_muted' => '#726A5B',
            'border' => '#E4DDCF', 'cta', 'accent', 'progress', 'selected_surface' => '#C9A15A',
            'cta_hover', 'questionnaire_label' => '#AF8540', 'heart' => '#C1443F', 'head' => '#6C8FAE',
            'navy', 'selected_text' => '#14141C', 'questionnaire_copy' => '#3A3428',
            'input_surface', 'option_surface' => '#FFFFFF', 'input_text' => '#211C16', 'option_text' => '#726A5B',
            'heading_font' => 'Georgia, "Times New Roman", serif', 'body_font' => 'Arial, Helvetica, sans-serif',
            'base_font_size' => 16, 'page_title_size' => 62, 'body_text_size' => 16, 'question_text_size' => 17,
            'option_text_size' => 11, 'field_label_size' => 12, 'field_text_size' => 14, 'meta_text_size' => 12,
            'visual_title_size' => 72, 'visual_body_size' => 22, 'content_max_width' => 720,
            'intake_max_width' => 840, 'question_max_width' => 880, 'content_gutter' => 72,
            'card_radius', 'button_radius' => 8,
            'logo_url' => '/media/brand/atom-global-wordmark-transparent.svg',
            'email_logo_url', 'report_logo_url' => '/media/brand/atom-global-wordmark.png',
            'favicon_url' => '/icon-192.png', 'banner_url' => '', default => '',
        };
    }
'''
text, count = re.subn(
    r"    private function validateBranding\(array \$payload\): array\n    \{.*?\n    private function audit\(",
    lambda _match: validation + "\n    private function audit(",
    text,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit("Brand validation/default block not found")
admin.write_text(text)
print("Updated backend/src/Services/AdminService.php")

mail = Path("backend/src/Mail/MailDeliveryService.php")
text = mail.read_text()
replacement = r'''    private function brandHtml(string $content, string $subject): string
    {
        if (stripos($content, '<html') !== false) return $content;

        $baseUrl = rtrim((string) $this->settings->get('email.public_base_url', $_ENV['APP_URL'] ?? 'https://head-heart.atomglobal.com'), '/');
        $logo = (string) $this->settings->get('email.logo_url', $this->settings->get('branding.email_logo_url', '/media/brand/atom-global-wordmark.png'));
        $logo = $this->absoluteUrl($logo, $baseUrl);
        $websiteUrl = $this->absoluteUrl((string) $this->settings->get('email.website_url', '/'), $baseUrl);
        $privacyUrl = $this->absoluteUrl((string) $this->settings->get('email.privacy_url', '/privacy'), $baseUrl);
        $termsUrl = $this->absoluteUrl((string) $this->settings->get('email.terms_url', '/terms'), $baseUrl);
        $footer = (string) $this->settings->get('email.footer_text', 'Head–Heart Alignment by Atom Global Consulting');

        $colour = static fn(mixed $value, string $fallback): string => preg_match('/^#[0-9A-Fa-f]{6}$/', (string) $value) ? strtoupper((string) $value) : $fallback;
        $font = static function (mixed $value, string $fallback): string {
            $clean = preg_replace('/[^A-Za-z0-9\s,"\'\.\-]/', '', (string) $value);
            return trim((string) $clean) !== '' ? trim((string) $clean) : $fallback;
        };
        $canvas = $colour($this->settings->get('branding.canvas', '#F7F4EF'), '#F7F4EF');
        $surface = $colour($this->settings->get('branding.surface', '#FFFFFF'), '#FFFFFF');
        $ink = $colour($this->settings->get('branding.text_primary', '#211C16'), '#211C16');
        $muted = $colour($this->settings->get('branding.text_muted', '#726A5B'), '#726A5B');
        $border = $colour($this->settings->get('branding.border', '#E4DDCF'), '#E4DDCF');
        $cta = $colour($this->settings->get('branding.cta', '#C9A15A'), '#C9A15A');
        $heart = $colour($this->settings->get('branding.heart', '#C1443F'), '#C1443F');
        $heading = $font($this->settings->get('branding.heading_font', 'Georgia, Times New Roman, serif'), 'Georgia, Times New Roman, serif');
        $body = $font($this->settings->get('branding.body_font', 'Arial, Helvetica, sans-serif'), 'Arial, Helvetica, sans-serif');
        $cardRadius = max(0, min(32, (int) $this->settings->get('branding.card_radius', 8)));
        $buttonRadius = max(0, min(32, (int) $this->settings->get('branding.button_radius', 8)));

        $safeSubject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
        $safeLogo = htmlspecialchars($logo, ENT_QUOTES, 'UTF-8');
        $safeWebsite = htmlspecialchars($websiteUrl, ENT_QUOTES, 'UTF-8');
        $safePrivacy = htmlspecialchars($privacyUrl, ENT_QUOTES, 'UTF-8');
        $safeTerms = htmlspecialchars($termsUrl, ENT_QUOTES, 'UTF-8');
        $safeFooter = htmlspecialchars($footer, ENT_QUOTES, 'UTF-8');

        return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            . '<title>' . $safeSubject . '</title><style>'
            . 'body{margin:0;background:' . $canvas . ';color:' . $ink . ';font-family:' . $body . '}'
            . '.ag-wrap{width:100%;padding:32px 14px;background:' . $canvas . '}'
            . '.ag-card{width:100%;max-width:620px;margin:0 auto;background:' . $surface . ';border:1px solid ' . $border . ';border-top:4px solid ' . $heart . ';border-radius:' . $cardRadius . 'px;overflow:hidden}'
            . '.ag-head{padding:32px 34px 18px;text-align:center}.ag-head img{display:block;width:190px;max-width:70%;height:auto;margin:0 auto 18px}'
            . '.ag-kicker{margin:0;color:' . $heart . ';font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase}'
            . '.ag-content{padding:10px 38px 34px;color:' . $ink . ';font-size:15px;line-height:1.7}'
            . '.ag-content p{margin:0 0 18px}.ag-content h1,.ag-content h2{font-family:' . $heading . ';font-weight:400;color:' . $ink . '}'
            . '.ag-content a{color:' . $ink . '!important;background:' . $cta . ';display:inline-block;padding:12px 20px;border-radius:' . $buttonRadius . 'px;text-decoration:none;font-weight:700}'
            . '.ag-foot{padding:22px 28px;background:' . $canvas . ';border-top:1px solid ' . $border . ';text-align:center;color:' . $muted . ';font-size:11px;line-height:1.6}'
            . '.ag-foot a{color:' . $muted . ';text-decoration:underline;margin:0 7px}'
            . '@media(max-width:640px){.ag-wrap{padding:14px 8px}.ag-head{padding:26px 20px 14px}.ag-content{padding:8px 22px 28px}}'
            . '</style></head><body><div class="ag-wrap"><div class="ag-card">'
            . '<div class="ag-head"><img src="' . $safeLogo . '" alt="Atom Global"><p class="ag-kicker">Head–Heart Alignment</p></div>'
            . '<div class="ag-content">' . $content . '</div>'
            . '<div class="ag-foot"><strong>' . $safeFooter . '</strong><br>'
            . '<a href="' . $safeWebsite . '">Website</a><a href="' . $safePrivacy . '">Privacy</a><a href="' . $safeTerms . '">Terms</a><br>'
            . 'This message was sent because you started, completed or administer a Head–Heart Alignment assessment.'
            . '</div></div></div></body></html>';
    }
'''
text, count = re.subn(
    r"    private function brandHtml\(string \$content, string \$subject\): string\n    \{.*?\n    private function absoluteUrl",
    lambda _match: replacement + "\n    private function absoluteUrl",
    text,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit("brandHtml block not found")
mail.write_text(text)
print("Updated backend/src/Mail/MailDeliveryService.php")
