from pathlib import Path

path = Path("src/questionnaire-latest.css")
text = path.read_text()

wrong_button = '''.latest-primary-button {
  background: var(--questionnaire-selected-surface, var(--gold, #c9a15a));
  color: var(--questionnaire-selected-text, #14141c);
}'''
correct_button = '''.latest-primary-button {
  background: var(--gold, #c9a15a);
  color: #14141c;
}'''
if wrong_button in text:
    text = text.replace(wrong_button, correct_button, 1)

old_selected = '''.latest-scale-options label.selected {
  background: var(--gold, #c9a15a);
  color: #14141c;
}'''
new_selected = '''.latest-scale-options label.selected {
  background: var(--questionnaire-selected-surface, var(--gold, #c9a15a));
  color: var(--questionnaire-selected-text, #14141c);
}'''
if new_selected not in text:
    if old_selected not in text:
        raise SystemExit("Selected answer CSS block was not found")
    text = text.replace(old_selected, new_selected, 1)

if correct_button not in text:
    raise SystemExit("Primary CTA CSS block is not correct")

path.write_text(text)
print("Verified independent CTA and selected-answer branding")
