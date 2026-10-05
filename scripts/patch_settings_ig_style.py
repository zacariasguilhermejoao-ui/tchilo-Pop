#!/usr/bin/env python3
"""Settings/menu rows: Instagram-like — clean list, mono icons, no colored boxes."""
from pathlib import Path
import re

p = Path("index.html")
if not p.exists():
    print("index.html missing")
    raise SystemExit(0)

html = p.read_text(encoding="utf-8", errors="replace")
orig = html

old_css = """  .settings-list{ flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:8px 0 120px; min-height:0; }
  .settings-group{ margin:16px 18px 8px; font-size:11px; font-weight:800; color:var(--muted); letter-spacing:.04em; text-transform:uppercase; }
  .settings-item{
    display:flex; align-items:center; gap:12px;
    padding:14px 18px;
    border-bottom:2px solid #e8e6de;
    cursor:pointer; background:none; border-left:0; border-right:0; border-top:0;
    width:100%; text-align:left; font:600 14px system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:var(--ink);
  }
  .settings-item:active{ background:#ebe9e0; }
  .settings-item .si-icon{
    width:36px; height:36px; border-radius:10px; border:2px solid var(--ink);
    display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--ink);
  }
  .si-icon svg, .so-icon svg { display:block; }
  .so-icon{ color:var(--ink); }
  .reel-actions button svg { width:28px; height:28px; display:block; margin:auto; }

  .settings-item span{ flex:1; }
  .settings-item .chev{ color:var(--muted); font-size:18px; }
  .settings-item.danger{ color:var(--pink); }"""

new_css = """  .settings-list{ flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding:4px 0 120px; min-height:0; }
  .settings-group{ margin:22px 16px 6px; font-size:13px; font-weight:600; color:var(--muted); letter-spacing:0; text-transform:none; }
  .settings-item{
    display:flex; align-items:center; gap:14px;
    padding:13px 16px;
    border:0; border-bottom:0.5px solid rgba(11,11,12,.08);
    cursor:pointer; background:transparent;
    width:100%; text-align:left;
    font:400 16px system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    color:var(--ink); -webkit-tap-highlight-color:transparent;
  }
  .settings-item:active{ background:rgba(11,11,12,.05); }
  .settings-item .si-icon{
    width:24px; height:24px; border:0; border-radius:0; background:transparent !important;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    color:var(--ink); padding:0; overflow:visible;
  }
  .settings-item .si-icon svg{
    width:22px; height:22px; display:block; stroke:currentColor; fill:none;
  }
  .si-icon svg, .so-icon svg { display:block; }
  .so-icon{ color:var(--ink); background:transparent !important; border:0 !important; }
  .reel-actions button svg { width:28px; height:28px; display:block; margin:auto; }

  .settings-item span{ flex:1; min-width:0; }
  .settings-item .chev{ color:var(--muted); font-size:20px; font-weight:300; opacity:.65; line-height:1; }
  .settings-item.danger{ color:var(--pink); }
  .settings-item.danger .si-icon{ color:var(--pink); }"""

if old_css in html:
    html = html.replace(old_css, new_css)
    print("settings CSS replaced")
else:
    print("block mismatch — partial patches")
    reps = [
        (r"\.settings-group\{[^}]+\}",
         ".settings-group{ margin:22px 16px 6px; font-size:13px; font-weight:600; color:var(--muted); letter-spacing:0; text-transform:none; }"),
        (r"\.settings-item\{[^}]+\}",
         ".settings-item{ display:flex; align-items:center; gap:14px; padding:13px 16px; border:0; border-bottom:0.5px solid rgba(11,11,12,.08); cursor:pointer; background:transparent; width:100%; text-align:left; font:400 16px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif; color:var(--ink); -webkit-tap-highlight-color:transparent; }"),
        (r"\.settings-item:active\{[^}]+\}",
         ".settings-item:active{ background:rgba(11,11,12,.05); }"),
        (r"\.settings-item \.si-icon\{[^}]+\}",
         ".settings-item .si-icon{ width:24px; height:24px; border:0; border-radius:0; background:transparent !important; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--ink); padding:0; overflow:visible; }"),
        (r"\.settings-item \.chev\{[^}]+\}",
         ".settings-item .chev{ color:var(--muted); font-size:20px; font-weight:300; opacity:.65; line-height:1; }"),
    ]
    for pat, rep in reps:
        html2, c = re.subn(pat, rep, html, count=1)
        if c:
            html = html2
            print("partial ok")

html2, c = re.subn(
    r"\.profile-action-row\{[^}]+\}",
    ".profile-action-row{display:flex;align-items:center;gap:14px;width:100%;padding:14px 12px;border:0;border-bottom:0.5px solid rgba(11,11,12,.08);background:transparent;text-align:left;font:400 16px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;cursor:pointer;color:var(--ink)}",
    html, count=1,
)
if c:
    html = html2
    print("profile-action-row updated")

html2, c = re.subn(
    r"\.profile-action-icon\{[^}]+\}",
    ".profile-action-icon{width:24px;height:24px;border:0;border-radius:0;background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--ink)}",
    html, count=1,
)
if c:
    html = html2
    print("profile-action-icon updated")

html2, c = re.subn(r'(class="si-icon")\s+style="[^"]*"', r'\1', html)
if c:
    html = html2
    print(f"stripped {c} inline si-icon styles")

if html != orig:
    p.write_text(html, encoding="utf-8")
    print("index.html written")
else:
    print("no index changes")
