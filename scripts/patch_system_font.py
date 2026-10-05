#!/usr/bin/env python3
"""Use native system UI font (San Francisco / Roboto / Segoe UI) instead of Inter.

Natural CSS only — no !important force script.
"""
from pathlib import Path
import re

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

# 2) body + .act font-family Inter -> system stack (natural, no !important)
sys_stack = (
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", '
    'Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif'
)
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
def repl_font(m):
    s = m.group(0)
    s = s.replace(
        "Inter,sans-serif",
        'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    )
    s = s.replace(
        "Inter, system-ui, sans-serif",
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    )
    s = s.replace("Inter, Arial, sans-serif", "system-ui, Arial, sans-serif")
    return s

html2, n = re.subn(r"font:[^;]*Inter[^;]*", repl_font, html)
if n:
    html = html2
    changed = True
    print(f"Replaced {n} font: shorthand Inter occurrences")

# 4) canvas ctx.font
for old, new in (
    (
        "Inter, system-ui, sans-serif",
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    ),
    ("Inter, Arial, sans-serif", "system-ui, Arial, sans-serif"),
):
    if old in html:
        html = html.replace(old, new)
        changed = True
        print(f"Replaced canvas font: {old[:30]}...")

# 5) REMOVE force script if present (user wants natural, not forced)
if "tchilo-system-font.js" in html:
    html = re.sub(
        r'\s*<script src="native/tchilo-system-font\.js"></script>\s*',
        "\n",
        html,
    )
    changed = True
    print("Removed tchilo-system-font.js (no force)")

if changed and html != orig:
    p.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("No index.html changes needed")
