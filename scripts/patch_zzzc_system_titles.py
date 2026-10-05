#!/usr/bin/env python3
"""Force system font on all titles/headings — remove Anton/Impact/Inter."""
from pathlib import Path
import re

SYS = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif'
SYS_CSS = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'

def fix_text(t):
    # Anton variants
    t = t.replace("font-family:'Anton', sans-serif", f"font-family:{SYS}")
    t = t.replace("font-family:'Anton',sans-serif", f"font-family:{SYS}")
    t = t.replace('font-family:"Anton", sans-serif', f"font-family:{SYS}")
    t = t.replace('font-family:"Anton",sans-serif', f"font-family:{SYS}")
    t = t.replace("font-family:Anton,sans-serif", f"font-family:{SYS}")
    t = t.replace("font-family:Anton,Impact,sans-serif", f"font-family:{SYS}")
    t = t.replace("font-family:Anton, Impact, sans-serif", f"font-family:{SYS}")
    t = t.replace("font-family:'Anton',Impact,sans-serif", f"font-family:{SYS}")
    # escaped in JS strings
    t = t.replace("font-family:\\'Anton\\',sans-serif", f"font-family:{SYS}")
    t = t.replace("font-family:\\'Anton\\', sans-serif", f"font-family:{SYS}")
    # Inter → system
    t = re.sub(r"font:\s*(\d{3})\s+(\d+(?:px)?)\s+Inter,\s*system-ui,\s*sans-serif", rf"font:\1 \2 {SYS_CSS}", t)
    t = re.sub(r"font:\s*(\d{3})\s+(\d+(?:px)?)\s+Inter,\s*sans-serif", rf"font:\1 \2 {SYS_CSS}", t)
    t = re.sub(r"font:\s*(\d{3})\s+(\d+(?:px)?)\s+Inter,system-ui,sans-serif", rf"font:\1 \2 {SYS_CSS}", t)
    t = re.sub(r"font:\s*(\d{3})\s+(\d+(?:px)?)\s+Inter,sans-serif", rf"font:\1 \2 {SYS_CSS}", t)
    t = t.replace("Inter, system-ui, sans-serif", SYS_CSS)
    t = t.replace("Inter,system-ui,sans-serif", SYS_CSS)
    t = t.replace("Inter,sans-serif", SYS_CSS)
    t = t.replace("Inter, sans-serif", SYS_CSS)
    # canvas fonts
    t = t.replace("'700 28px Inter, system-ui, sans-serif'", f"'700 28px {SYS_CSS}'")
    t = t.replace("'600 18px Inter, system-ui, sans-serif'", f"'600 18px {SYS_CSS}'")
    t = t.replace('"700 28px Inter, system-ui, sans-serif"', f'"700 28px {SYS_CSS}"')
    t = t.replace('"600 18px Inter, system-ui, sans-serif"', f'"600 18px {SYS_CSS}"')
    return t

# index
p = Path("index.html")
if p.exists():
    html = p.read_text(encoding="utf-8", errors="replace")
    orig = html
    # remove Google Fonts Anton
    html = re.sub(
        r'<link[^>]+fonts\.googleapis\.com/css2\?family=Anton[^>]*>\s*',
        '',
        html,
    )
    # optional: keep preconnect only if other fonts — remove unused google preconnect if only Anton
    # leave preconnect; harmless
    html = fix_text(html)

    # screen-header h1 ensure system
    html = re.sub(
        r"\.screen-header h1\{[^}]+\}",
        ".screen-header h1{"
        f"font-family:{SYS};font-size:20px;font-weight:700;letter-spacing:-0.02em;flex:1;}}",
        html,
        count=1,
    )

    OVERRIDE = f"""
/* tchilo-system-titles — all headings use system font */
h1,h2,h3,h4,h5,h6,
.screen-header h1,
.profile-header h2,
.login-panel h2,
.legal-body h3,
.tm-title,
#tchiloModalHost .tm-title,
.qr-title,
.stamp,
.big,
.post-user,
.feed-user b,
.reel-meta b {{
  font-family: {SYS} !important;
}}
"""
    if "/* tchilo-system-titles" not in html:
        if "/* tchilo-flat-all-v3" in html:
            html = html.replace("/* tchilo-flat-all-v3", OVERRIDE + "\n/* tchilo-flat-all-v3", 1)
        elif "/* tchilo-flat-ctas-ig */" in html:
            html = html.replace("/* tchilo-flat-ctas-ig */", OVERRIDE + "\n/* tchilo-flat-ctas-ig */", 1)
        else:
            html = html.replace("</style>", OVERRIDE + "\n</style>", 1)
        print("injected system-titles override")
    else:
        print("system-titles already present")

    if html != orig:
        p.write_text(html, encoding="utf-8")
        print("index written")
    else:
        print("index unchanged")

# native
for rel in [
    "native/tchilo-profile-share.js",
    "native/tchilo-support.js",
    "native/tchilo-ads-pro.js",
    "native/tchilo-ads-ui.js",
    "native/tchilo-ads.js",
    "native/tchilo-verified.js",
    "native/tchilo-premium.js",
    "native/paddle-premium.js",
    "native/tchilo-create-buttons.js",
]:
    p = Path(rel)
    if not p.exists():
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    t2 = fix_text(t)
    if t2 != t:
        p.write_text(t2, encoding="utf-8")
        print("fixed", rel)
    else:
        print("ok", rel)

print("system titles done")
