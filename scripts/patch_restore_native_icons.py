#!/usr/bin/env python3
"""Write settings-icons v25 (SVG visible), fix support + profile-share mono icons."""
from pathlib import Path
import re

Path("native").mkdir(parents=True, exist_ok=True)

# --- settings-icons v25: NEVER hide SVG ---
si = r'''/** tchilo-settings-icons v25 — keep native SVG mono icons (Instagram-style) */
(function () {
  if (window.__TCHILO_SI_V25) return;
  window.__TCHILO_SI_V25 = true;

  function injectCSS() {
    if (document.getElementById("si-v25-css")) return;
    var st = document.createElement("style");
    st.id = "si-v25-css";
    st.textContent = [
      "#screen-settings .settings-item .si-icon,.settings-item .si-icon{",
      "width:24px!important;height:24px!important;min-width:24px!important;",
      "border:0!important;border-radius:0!important;background:transparent!important;",
      "background-color:transparent!important;box-shadow:none!important;",
      "display:inline-flex!important;align-items:center!important;justify-content:center!important;",
      "padding:0!important;flex-shrink:0!important;overflow:visible!important;",
      "color:var(--ink,#0B0B0C)!important;}",
      "#screen-settings .settings-item .si-icon svg,.settings-item .si-icon svg{",
      "display:block!important;visibility:visible!important;opacity:1!important;",
      "width:22px!important;height:22px!important;stroke:currentColor!important;}",
      "#screen-settings .settings-item .si-icon img{display:none!important;}",
      "#screen-settings .settings-item{",
      "display:flex!important;align-items:center!important;gap:14px!important;",
      "background:transparent!important;}"
    ].join("");
    (document.head || document.documentElement).appendChild(st);
  }

  function run() { injectCSS(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  setTimeout(run, 200);
  setTimeout(run, 800);
})();
'''
Path("native/tchilo-settings-icons.js").write_text(si, encoding="utf-8")
print("wrote settings-icons v25", len(si))

# --- support: mono icon ---
p = Path("native/tchilo-support.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = t.replace(
        '<div class="si-icon" style="background:#c8f560;font:900 14px Inter,sans-serif;display:flex;align-items:center;justify-content:center">?</div>',
        '<div class="si-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/></svg></div>',
    )
    t = re.sub(
        r'<span class="ico" style="background:#[0-9a-fA-F]+">',
        '<span class="ico" style="background:transparent;border:0;color:var(--ink,#0B0B0C)">',
        t,
    )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("support mono icon")
    else:
        print("support no change")

# --- profile-share: IG list style ---
p = Path("native/tchilo-profile-share.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t, c1 = re.subn(
        r"#tchiloProfileShareSheet \.opt\{[^}]+\}",
        "#tchiloProfileShareSheet .opt{display:flex;align-items:center;gap:14px;width:100%;padding:14px 4px;margin:0;border:0;border-bottom:0.5px solid rgba(11,11,12,.08);border-radius:0;background:transparent;box-shadow:none;text-align:left;font:400 16px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;color:var(--ink,#0B0B0C);cursor:pointer;}",
        t, count=1,
    )
    t, c2 = re.subn(
        r"#tchiloProfileShareSheet \.opt \.ic\{[^}]+\}",
        "#tchiloProfileShareSheet .opt .ic{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;min-width:24px;border-radius:0;border:0;background:transparent;color:var(--ink,#0B0B0C);}",
        t, count=1,
    )
    t, c3 = re.subn(
        r"#tchiloProfileShareSheet \.opt\.opt-close\{[^}]+\}",
        "#tchiloProfileShareSheet .opt.opt-close{background:transparent;}",
        t, count=1,
    )
    t, c4 = re.subn(
        r"(#tchiloProfileShareSheet \.tchilo-ps-panel\{[^}]*?)border:3px solid var\(--ink,#0B0B0C\)!important;border-bottom:none!important;",
        r"\1border:0!important;border-top:0.5px solid rgba(11,11,12,.12)!important;",
        t, count=1,
    )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("profile-share", c1, c2, c3, c4)
    else:
        print("profile-share no change")
