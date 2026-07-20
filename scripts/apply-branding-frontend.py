from pathlib import Path
import re


brand = Path("src/branding/BrandContext.jsx")
text = brand.read_text()
old = '    baseFontSize: "16", cardRadius: "8", buttonRadius: "8",'
new = '''    baseFontSize: "16", cardRadius: "8", buttonRadius: "8",
    questionnaireCopy: "#3A3428", questionnaireLabel: "#AF8540",
    inputSurface: "#FFFFFF", inputText: "#211C16", optionSurface: "#FFFFFF", optionText: "#726A5B",
    selectedSurface: "#C9A15A", selectedText: "#14141C", progress: "#C9A15A",
    pageTitleSize: "62", bodyTextSize: "16", questionTextSize: "17", optionTextSize: "11",
    fieldLabelSize: "12", fieldTextSize: "14", metaTextSize: "12",
    visualTitleSize: "72", visualBodySize: "22", contentMaxWidth: "720", intakeMaxWidth: "840",
    questionMaxWidth: "880", contentGutter: "72",'''
if old not in text:
    raise SystemExit("Brand defaults marker not found")
text = text.replace(old, new, 1)
old = '''    "--base-font-size": `${Number(branding.baseFontSize || 16)}px`,
    "--card-radius": `${Number(branding.cardRadius || 8)}px`,
    "--button-radius": `${Number(branding.buttonRadius || 8)}px`,'''
new = '''    "--base-font-size": `${Number(branding.baseFontSize || 16)}px`,
    "--questionnaire-copy": branding.questionnaireCopy,
    "--questionnaire-label": branding.questionnaireLabel,
    "--questionnaire-input-surface": branding.inputSurface,
    "--questionnaire-input-text": branding.inputText,
    "--questionnaire-option-surface": branding.optionSurface,
    "--questionnaire-option-text": branding.optionText,
    "--questionnaire-selected-surface": branding.selectedSurface,
    "--questionnaire-selected-text": branding.selectedText,
    "--questionnaire-progress": branding.progress,
    "--questionnaire-title-size": `${Number(branding.pageTitleSize || 62)}px`,
    "--questionnaire-body-size": `${Number(branding.bodyTextSize || 16)}px`,
    "--questionnaire-question-size": `${Number(branding.questionTextSize || 17)}px`,
    "--questionnaire-option-size": `${Number(branding.optionTextSize || 11)}px`,
    "--questionnaire-label-size": `${Number(branding.fieldLabelSize || 12)}px`,
    "--questionnaire-field-size": `${Number(branding.fieldTextSize || 14)}px`,
    "--questionnaire-meta-size": `${Number(branding.metaTextSize || 12)}px`,
    "--questionnaire-visual-title-size": `${Number(branding.visualTitleSize || 72)}px`,
    "--questionnaire-visual-body-size": `${Number(branding.visualBodySize || 22)}px`,
    "--questionnaire-content-width": `${Number(branding.contentMaxWidth || 720)}px`,
    "--questionnaire-intake-width": `${Number(branding.intakeMaxWidth || 840)}px`,
    "--questionnaire-question-width": `${Number(branding.questionMaxWidth || 880)}px`,
    "--questionnaire-gutter": `${Number(branding.contentGutter || 72)}px`,
    "--card-radius": `${Number(branding.cardRadius || 8)}px`,
    "--button-radius": `${Number(branding.buttonRadius || 8)}px`,'''
if old not in text:
    raise SystemExit("Brand tokens marker not found")
brand.write_text(text.replace(old, new, 1))
print("Updated src/branding/BrandContext.jsx")


core = Path("src/components/admin/AdminCorePages.jsx")
text = core.read_text()
fields = '''const brandFields = [
  ["canvas", "Canvas colour", "color"], ["surface", "Surface colour", "color"],
  ["textPrimary", "Primary text", "color"], ["textMuted", "Muted text", "color"],
  ["border", "Border colour", "color"], ["cta", "Primary CTA", "color"],
  ["ctaHover", "CTA hover", "color"], ["heart", "Heart colour", "color"],
  ["head", "Head colour", "color"], ["accent", "Accent / gold", "color"], ["navy", "Admin navy", "color"],
  ["questionnaireCopy", "Questionnaire body text", "color"], ["questionnaireLabel", "Questionnaire labels", "color"],
  ["inputSurface", "Input background", "color"], ["inputText", "Input text", "color"],
  ["optionSurface", "Answer option background", "color"], ["optionText", "Answer option text", "color"],
  ["selectedSurface", "Selected answer background", "color"], ["selectedText", "Selected answer text", "color"],
  ["progress", "Progress indicator", "color"], ["headingFont", "Heading font stack", "text"],
  ["bodyFont", "Body font stack", "text"], ["baseFontSize", "Base font size", "number"],
  ["pageTitleSize", "Page title size", "number"], ["bodyTextSize", "Body copy size", "number"],
  ["questionTextSize", "Question text size", "number"], ["optionTextSize", "Answer option size", "number"],
  ["fieldLabelSize", "Field label size", "number"], ["fieldTextSize", "Input text size", "number"],
  ["metaTextSize", "Meta / progress size", "number"], ["visualTitleSize", "Left-panel title size", "number"],
  ["visualBodySize", "Left-panel supporting size", "number"], ["contentMaxWidth", "Landing / introduction width", "number"],
  ["intakeMaxWidth", "Participant form width", "number"], ["questionMaxWidth", "Questionnaire width", "number"],
  ["contentGutter", "Desktop content gutter", "number"], ["cardRadius", "Card radius", "number"],
  ["buttonRadius", "Button / input radius", "number"],
];'''
text, count = re.subn(r"const brandFields = \[.*?\n\];", fields, text, count=1, flags=re.S)
if count != 1:
    raise SystemExit("brandFields block not found")
text = text.replace(
    '<h2>Theme system</h2>',
    '<h2>Theme and questionnaire system</h2><p className="admin-help">Controls apply to landing, introductions, participant form, questions, answer options, email frame and report styling. Branding never edits assessment wording, scoring or report profile logic.</p>',
    1,
)
core.write_text(text)
print("Updated src/components/admin/AdminCorePages.jsx")


layout = Path("src/components/assessment/AssessmentLayout.jsx")
text = layout.read_text()
marker = 'style={{ "--latest-page-width": `${width}px` }}'
if marker not in text:
    raise SystemExit("LatestPage width marker not found")
text = text.replace(marker, 'style={{ "--latest-default-page-width": `${width}px` }}', 1)
old = '''    <label className="latest-field"><span>Name *</span><input autoComplete="name" value={participant.name} onChange={update("name")} placeholder="Your full name" required /></label>
    <SelectField label="Age range *" options={participantBaseOptions.ageRanges} value={participant.ageRange} onChange={update("ageRange")} />
    <SelectField label="Gender" options={participantBaseOptions.genderOptions} value={participant.gender} onChange={update("gender")} required={false} />
    <label className="latest-field"><span>Email address *</span><input type="email" autoComplete="email" value={participant.email} onChange={update("email")} placeholder="you@example.com" required /></label>

    <div className="latest-context-divider">A little more context</div>
    <SelectField label={config.whoLabel} options={config.whoOptions} value={participant.role} onChange={update("role")} />
    <SelectField label={config.whatLabel} options={config.whatOptions} value={participant.industry} onChange={update("industry")} />
    <SelectField label={config.whereLabel} options={config.whereOptions} value={participant.region} onChange={update("region")} />
    <SelectField label={config.whyLabel} options={config.whyOptions} value={participant.purpose} onChange={update("purpose")} />
    <SelectField label={config.howLabel} options={config.howOptions} value={participant.tenure} onChange={update("tenure")} />
    {showCompanyFields && <>
      <SelectField label={config.departmentLabel || "Department *"} options={config.departmentOptions || []} value={participant.department} onChange={update("department")} />
      <SelectField label={config.levelLabel || "Level *"} options={config.levelOptions || []} value={participant.level} onChange={update("level")} />
    </>}'''
new = '''    <div className="latest-intake-grid latest-intake-grid--identity">
      <label className="latest-field"><span>Name *</span><input autoComplete="name" value={participant.name} onChange={update("name")} placeholder="Your full name" required /></label>
      <SelectField label="Age range *" options={participantBaseOptions.ageRanges} value={participant.ageRange} onChange={update("ageRange")} />
      <SelectField label="Gender" options={participantBaseOptions.genderOptions} value={participant.gender} onChange={update("gender")} required={false} />
      <label className="latest-field"><span>Email address *</span><input type="email" autoComplete="email" value={participant.email} onChange={update("email")} placeholder="you@example.com" required /></label>
    </div>

    <div className="latest-context-divider">A little more context</div>
    <div className="latest-intake-grid latest-intake-grid--context">
      <SelectField label={config.whoLabel} options={config.whoOptions} value={participant.role} onChange={update("role")} />
      <SelectField label={config.whatLabel} options={config.whatOptions} value={participant.industry} onChange={update("industry")} />
      <SelectField label={config.whereLabel} options={config.whereOptions} value={participant.region} onChange={update("region")} />
      <SelectField label={config.whyLabel} options={config.whyOptions} value={participant.purpose} onChange={update("purpose")} />
      <SelectField label={config.howLabel} options={config.howOptions} value={participant.tenure} onChange={update("tenure")} />
      {showCompanyFields && <>
        <SelectField label={config.departmentLabel || "Department *"} options={config.departmentOptions || []} value={participant.department} onChange={update("department")} />
        <SelectField label={config.levelLabel || "Level *"} options={config.levelOptions || []} value={participant.level} onChange={update("level")} />
      </>}
    </div>'''
if old not in text:
    raise SystemExit("Participant field block not found")
layout.write_text(text.replace(old, new, 1))
print("Updated src/components/assessment/AssessmentLayout.jsx")


css = Path("src/questionnaire-latest.css")
text = css.read_text()
changes = [
    ('font-size: clamp(46px, 4.4vw, 72px);', 'font-size: clamp(36px, 4.4vw, var(--questionnaire-visual-title-size, 72px));'),
    ('font-size: clamp(17px, 1.45vw, 22px);', 'font-size: clamp(12px, 1.45vw, var(--questionnaire-visual-body-size, 22px));'),
    ('width: min(calc(100% - 72px), var(--latest-page-width, 720px));', 'width: min(calc(100% - var(--questionnaire-gutter, 72px)), var(--latest-page-width, var(--latest-default-page-width, 720px)));'),
    ('font-size: clamp(38px, 4.4vw, 62px);', 'font-size: clamp(34px, 4.4vw, var(--questionnaire-title-size, 62px));'),
    ('font-size: 16px;\n  line-height: 1.58;\n  color: #3a3428;', 'font-size: var(--questionnaire-body-size, 16px);\n  line-height: 1.58;\n  color: var(--questionnaire-copy, #3a3428);'),
    ('background: var(--gold, #c9a15a);\n  transition: width .25s ease;', 'background: var(--questionnaire-progress, var(--gold, #c9a15a));\n  transition: width .25s ease;'),
    ('font-size: 17px;\n  line-height: 1.5;', 'font-size: var(--questionnaire-question-size, 17px);\n  line-height: 1.5;'),
    ('background: var(--cream, #fff);\n  color: var(--muted, #726a5b);\n  text-align: center;', 'background: var(--questionnaire-option-surface, var(--cream, #fff));\n  color: var(--questionnaire-option-text, var(--muted, #726a5b));\n  text-align: center;'),
    ('background: var(--gold, #c9a15a);\n  color: #14141c;', 'background: var(--questionnaire-selected-surface, var(--gold, #c9a15a));\n  color: var(--questionnaire-selected-text, #14141c);'),
    ('.latest-scale-options span { font-size: 11px; line-height: 1.2; }', '.latest-scale-options span { font-size: var(--questionnaire-option-size, 11px); line-height: 1.2; }'),
    ('color: var(--gold-dark, #af8540);\n  font-size: 12px;\n  font-weight: 600;', 'color: var(--questionnaire-label, var(--gold-dark, #af8540));\n  font-size: var(--questionnaire-label-size, 12px);\n  font-weight: 600;'),
    ('background: var(--cream, #fff);\n  color: var(--ink, #211c16);\n  font: 14px var(--body-font, Arial, sans-serif);', 'background: var(--questionnaire-input-surface, var(--cream, #fff));\n  color: var(--questionnaire-input-text, var(--ink, #211c16));\n  font: var(--questionnaire-field-size, 14px) var(--body-font, Arial, sans-serif);'),
]
for old, new in changes:
    if old not in text:
        raise SystemExit(f"CSS marker not found: {old[:50]}")
    text = text.replace(old, new, 1)

insert = '''
.latest-track-selection,
.latest-track-introduction {
  --latest-page-width: var(--questionnaire-content-width, 720px);
}

.latest-intake-page {
  --latest-page-width: var(--questionnaire-intake-width, 840px);
}

.latest-questions-page {
  --latest-page-width: var(--questionnaire-question-width, 880px);
}

.latest-intake-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 20px;
  align-items: start;
}

.latest-intake-grid .latest-field {
  min-width: 0;
  margin-bottom: 18px;
}
'''
marker = '.latest-public-brand {'
if marker not in text:
    raise SystemExit("CSS insertion marker not found")
text = text.replace(marker, insert + '\n' + marker, 1)
mobile = '  .latest-head-heart-grid { grid-template-columns: 1fr; }'
if mobile not in text:
    raise SystemExit("Mobile CSS marker not found")
text = text.replace(mobile, mobile + '\n  .latest-intake-grid { grid-template-columns: 1fr; }', 1)
css.write_text(text)
print("Updated src/questionnaire-latest.css")
