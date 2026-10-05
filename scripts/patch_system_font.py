#!/usr/bin/env python3
"""Force native system UI font (San Francisco / Roboto / Segoe UI) instead of Inter."""
from pathlib import Path

p = Path("index.html")
if not p.exists():
    print("index.html missing")
    raise SystemExit(0)

html = p.read_text(encoding="utf-8", errors="replace")
orig = html
changed = False

# 1) Google Fonts: keep Anton only (drop Inter)
old_g = "family=Anton&family=Inter:wght@400;500;600;700;800"
new_g = "family=Anton"
if old_g in html:
    html = html.replace(old_g, new_g)
    changed = True
    print("Google Fonts: Inter removed, Anton kept")

# 2) body + .act font-family Inter -> system stack
sys_stack = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif'
for old in (
    "font-family:'Inter', sans-serif;",
    "font-family: 'Inter', sans-serif;",
    'font-family:"Inter", sans-serif;',
):
    if old in html:
        html = html.replace(old, f"font-family: {sys_stack};")
        changed = True
        print(f"Replaced {old[:40]}...")

# 3) shorthand font: ... Inter,sans-serif
import re
def repl_font(m):
    return m.group(0).replace("Inter,sans-serif", 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif').replace(
        "Inter, system-ui, sans-serif", 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ).replace(
        "Inter, Arial, sans-serif", "system-ui, Arial, sans-serif"
    )

html2, n = re.subn(r"font:[^;]*Inter[^;]*", repl_font, html)
if n:
    html = html2
    changed = True
    print(f"Replaced {n} font: shorthand Inter occurrences")

# 4) canvas ctx.font
for old, new in (
    ("Inter, system-ui, sans-serif", 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'),
    ("Inter, Arial, sans-serif", "system-ui, Arial, sans-serif"),
):
    if old in html:
        html = html.replace(old, new)
        changed = True
        print(f"Replaced canvas font: {old[:30]}...")

# 5) inject system-font script if missing
marker = '<script src="native/legal-navbar-fix.js"></script>'
inject = '<script src="native/tchilo-system-font.js"></script>\n' + marker
if "tchilo-system-font.js" not in html and marker in html:
    html = html.replace(marker, inject, 1)
    changed = True
    print("Injected native/tchilo-system-font.js")

if changed and html != orig:
    p.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("No index.html changes needed (already applied or nothing to do)")
