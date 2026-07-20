from pathlib import Path

path = Path("scripts/apply-branding-backend.py")
text = path.read_text()

old = '''    validation + "\\n    private function audit(",
    text,
    count=1,
    flags=re.S,
)'''
new = '''    lambda _match: validation + "\\n    private function audit(",
    text,
    count=1,
    flags=re.S,
)'''
if old not in text:
    raise SystemExit("AdminService literal replacement marker not found")
text = text.replace(old, new, 1)

old = '''    replacement + "\\n    private function absoluteUrl",
    text,
    count=1,
    flags=re.S,
)'''
new = '''    lambda _match: replacement + "\\n    private function absoluteUrl",
    text,
    count=1,
    flags=re.S,
)'''
if old not in text:
    raise SystemExit("MailDelivery literal replacement marker not found")
text = text.replace(old, new, 1)

path.write_text(text)
print("Backend patch generator now preserves PHP backslashes literally")
