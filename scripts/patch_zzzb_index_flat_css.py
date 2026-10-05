#!/usr/bin/env python3
"""Embed flat UI CSS in index + soft forms/chat/create controls."""
from pathlib import Path
import re

p = Path("index.html")
if not p.exists():
    print("no index")
    raise SystemExit(0)

html = p.read_text(encoding="utf-8", errors="replace")
orig = html

# --- direct rule replacements ---
reps = [
    (
        "#tchiloModalHost .tm-actions > button.tm-primary{background:var(--yellow)}",
        "#tchiloModalHost .tm-actions > button.tm-primary{background:var(--ink);color:#fff}",
    ),
    (
        ".saved-tab.active{background:var(--yellow)}",
        ".saved-tab.active{background:var(--ink);color:#fff}",
    ),
    (
        ".notif-tab.active{ background:var(--yellow); }",
        ".notif-tab.active{ background:var(--ink);color:#fff; }",
    ),
    (
        "native/tchilo-settings-icons.js?v=25",
        "native/tchilo-settings-icons.js?v=26",
    ),
]
for a, b in reps:
    if a in html:
        html = html.replace(a, b)

# edit-form inputs
html = re.sub(
    r"\.edit-form input, \.edit-form textarea\{[^}]+\}",
    ".edit-form input, .edit-form textarea{"
    "width:100%;border:0;border-radius:12px;"
    "padding:12px 14px;font:500 14px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;outline:none;"
    "background:rgba(11,11,12,.06);}",
    html,
    count=1,
)

# gallery-btn (Alterar foto / create media)
html = re.sub(
    r"\.gallery-btn\{[^}]+\}",
    ".gallery-btn{"
    "width:100%;padding:14px;border:1px dashed rgba(11,11,12,.25);border-radius:14px;"
    "background:transparent;font:600 14px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
    "cursor:pointer;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--ink);}",
    html,
    count=1,
)

# profile-btn
html = re.sub(
    r"\.profile-btn\{[^}]+\}",
    ".profile-btn{"
    "width:100%;padding:14px;border:0;border-radius:12px;"
    "background:rgba(11,11,12,.06);"
    "font:600 14px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
    "cursor:pointer;color:var(--ink);}",
    html,
    count=1,
)

# chat input
html = re.sub(
    r"\.chat-input-bar input\{[^}]+\}",
    ".chat-input-bar input{"
    "flex:1;border:0;border-radius:20px;"
    "padding:10px 14px;font:500 14px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
    "outline:none;background:rgba(11,11,12,.06);}",
    html,
    count=1,
)

# chat bubbles
html = re.sub(
    r"\.bubble\{[^}]+\}",
    ".bubble{"
    "max-width:78%;padding:10px 14px;border-radius:16px;"
    "font-size:14px;line-height:1.4;border:0;}",
    html,
    count=1,
)

# chat header/input borders
html = html.replace(
    "padding:14px 16px; border-bottom:3px solid var(--line); flex-shrink:0;",
    "padding:14px 16px; border-bottom:0.5px solid rgba(11,11,12,.12); flex-shrink:0;",
)
html = html.replace(
    "border-top:3px solid var(--line); flex-shrink:0;",
    "border-top:0.5px solid rgba(11,11,12,.12); flex-shrink:0;",
)

# chat-send (any remaining yellow hard version)
html = re.sub(
    r"\.chat-send\{[^}]*background:var\(--yellow\)[^}]*\}",
    ".chat-send{width:42px;height:42px;border-radius:50%;background:var(--ink);color:#fff;border:0;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;}",
    html,
)

# attach options
html = re.sub(
    r"\.attach-opt\{[^}]+\}",
    ".attach-opt{"
    "display:flex;flex-direction:column;align-items:center;gap:8px;"
    "padding:14px 8px;border:0.5px solid rgba(11,11,12,.12);border-radius:16px;"
    "background:#fff;cursor:pointer;font:600 12px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;}",
    html,
    count=1,
)
html = re.sub(
    r"\.attach-opt \.ao-icon\{[^}]+\}",
    ".attach-opt .ao-icon{"
    "width:48px;height:48px;border-radius:14px;border:0;"
    "display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(11,11,12,.06);}",
    html,
    count=1,
)

# publish-btn
html = re.sub(
    r"\.publish-btn\{[^}]+\}",
    ".publish-btn{"
    "width:100%;padding:16px;background:var(--ink);color:#fff;border:0;border-radius:12px;"
    "font:600 15px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;cursor:pointer;}",
    html,
    count=1,
)

# video-cover-box
html = re.sub(
    r"\.video-cover-box\{[^}]+\}",
    ".video-cover-box{margin:0 0 14px;padding:12px;border:0.5px solid rgba(11,11,12,.12);border-radius:14px;background:var(--paper);}",
    html,
    count=1,
)

# avatar-color softer
html = re.sub(
    r"\.avatar-color\{[^}]+\}",
    ".avatar-color{width:32px;height:32px;border-radius:50%;border:1.5px solid rgba(11,11,12,.2);cursor:pointer;}",
    html,
    count=1,
)
html = html.replace(
    ".avatar-color.active{ outline:3px solid var(--ink); outline-offset:2px; }",
    ".avatar-color.active{ outline:2px solid var(--ink); outline-offset:2px; }",
)

# chat-rec / preview cancel
html = re.sub(
    r"\.chat-rec-bar button\{[^}]+\}",
    ".chat-rec-bar button{border:0;border-radius:12px;padding:8px 12px;"
    "font:600 12px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
    "background:rgba(11,11,12,.06);cursor:pointer;}",
    html,
    count=1,
)
html = html.replace(
    ".chat-rec-bar button.send-rec{ background:var(--yellow); }",
    ".chat-rec-bar button.send-rec{ background:var(--ink);color:#fff; }",
)
html = re.sub(
    r"\.chat-preview-bar \.cp-cancel\{[^}]+\}",
    ".chat-preview-bar .cp-cancel{border:0;background:rgba(11,11,12,.06);border-radius:10px;"
    "padding:8px 10px;font:600 12px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;cursor:pointer;}",
    html,
    count=1,
)

# create-preview thick border
html = html.replace(
    ".create-preview{\n    border:3px solid var(--ink);",
    ".create-preview{\n    border:0;",
)

# Flatten the professional + button block (story / nav / chat attach)
old_plus = re.search(
    r"/\* ── Tchilo \+ profissional[\s\S]*?#chatAttachBtn svg\{ width:22px; height:22px; \}",
    html,
)
if old_plus:
    new_plus = """/* ── Tchilo + profissional (story / postar / mensagem) ── */
  .story-card-plus,
  .nav-post,
  .chat-attach-btn,
  #chatAttachBtn{
    width:44px;
    height:44px;
    min-width:44px;
    min-height:44px;
    border-radius:50%;
    border:0;
    background:var(--ink,#0B0B0C);
    color:#fff;
    box-shadow:none;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    padding:0;
    margin:0;
    flex-shrink:0;
    font-size:0;
    line-height:0;
    -webkit-tap-highlight-color:transparent;
    transition:transform .12s ease, opacity .12s ease;
  }
  .story-card-plus svg,
  .nav-post svg,
  .chat-attach-btn svg,
  #chatAttachBtn svg{
    width:22px;
    height:22px;
    display:block;
    pointer-events:none;
  }
  .story-card-plus:active,
  .nav-post:active,
  .chat-attach-btn:active,
  #chatAttachBtn:active{
    transform:scale(.94);
    box-shadow:none;
  }
  .story-card-plus{
    width:52px;
    height:52px;
    min-width:52px;
    min-height:52px;
    border-radius:50%;
  }
  .story-card-plus svg{ width:24px; height:24px; }
  .chat-attach-btn,
  #chatAttachBtn{
    width:40px;
    height:40px;
    min-width:40px;
    min-height:40px;
    border-radius:50%;
  }
  .chat-attach-btn svg,
  #chatAttachBtn svg{ width:20px; height:20px; }"""
    html = html[: old_plus.start()] + new_plus + html[old_plus.end() :]
    print("plus/attach block flattened")
else:
    print("plus block not found — will cover via CSS override")

# Soften mic: keep brand color but no border if any
# already border:0

BLOCK = """
/* tchilo-flat-all-v3 — original in index */
.back-btn,button.back-btn,.screen-header .back-btn{
  border:0!important;background:transparent!important;box-shadow:none!important;border-radius:50%!important;
}
#tchiloModalHost .tm-actions>button{
  border:0!important;box-shadow:none!important;border-radius:12px!important;font-weight:600!important;
}
#tchiloModalHost .tm-actions>button.tm-primary{
  background:var(--ink,#0B0B0C)!important;color:#fff!important;
}
#tchiloModalHost .tm-actions>button:not(.tm-primary):not(.tm-danger){
  background:rgba(11,11,12,.06)!important;color:var(--ink)!important;
}
#tchiloModalHost .tm-input{
  border:0!important;background:rgba(11,11,12,.06)!important;border-radius:12px!important;
}
#tchiloModalHost .tm-option{
  border:0.5px solid rgba(11,11,12,.12)!important;box-shadow:none!important;
}
.saved-tab{
  border:0!important;background:rgba(11,11,12,.06)!important;border-radius:999px!important;color:var(--ink)!important;
}
.saved-tab.active{background:var(--ink,#0B0B0C)!important;color:#fff!important;}
.saved-remove{border:0!important;background:rgba(11,11,12,.06)!important;}
.playlist-create{border:0!important;background:var(--ink,#0B0B0C)!important;color:#fff!important;}
.notif-tab.active{background:var(--ink,#0B0B0C)!important;color:#fff!important;}
#tchiloAdsPro .ap-back,#tchiloAdsPro .ap-x,
#tchiloVerifiedSheet .tv-back,#tchiloPremiumSheet .tp-back,#tchiloSupport .su-back{
  border:0!important;background:transparent!important;border-radius:50%!important;box-shadow:none!important;
}
#tchiloAdsPro .ap-btn.primary,#tchiloAdsPro .ap-pay,#tchiloAdsPro .ap-chip.on,#tchiloAdsPro .pv-cta{
  background:#0B0B0C!important;color:#fff!important;border:0!important;
}
#tchiloAdsPro .ap-btn,#tchiloAdsPro .ap-card{
  border:0.5px solid rgba(11,11,12,.12)!important;box-shadow:none!important;background:#fff!important;
}
#tchiloAdsPro .ap-btn.primary{background:#0B0B0C!important;color:#fff!important;}
#tchiloAdsPro input,#tchiloAdsPro textarea,#tchiloAdsPro select{
  border:0!important;background:rgba(11,11,12,.06)!important;
}
#tchiloAdsPro .ap-chip{border:0!important;background:rgba(11,11,12,.06)!important;}
#tchiloVerifiedSheet .tv-card,#tchiloVerifiedSheet .tv-ico,#tchiloVerifiedSheet .tv-price-box,
#tchiloVerifiedSheet .tv-hero-badge,#tchiloVerifiedSheet .close,#tchiloVerifiedSheet .active-badge,
#tchiloPremiumSheet .tp-card,#tchiloPremiumSheet .tp-hero-icon{
  border:0!important;box-shadow:none!important;
}
#tchiloVerifiedSheet .pay,#tchiloPremiumSheet .pay{
  border:0!important;border-radius:12px!important;box-shadow:none!important;
}
#tchiloQrModal .card{border:0!important;box-shadow:0 12px 40px rgba(0,0,0,.2)!important;}
#tchiloQrModal .actions button{
  border:0!important;box-shadow:none!important;border-radius:12px!important;font-weight:600!important;
}
#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C)!important;color:#fff!important;}
#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06)!important;color:var(--ink)!important;}
.settings-item .si-icon{
  width:24px!important;height:24px!important;border:0!important;border-radius:0!important;background:transparent!important;
}
.settings-item .si-icon svg{
  display:block!important;visibility:visible!important;opacity:1!important;width:22px!important;height:22px!important;
}
/* edit profile + forms */
.edit-form input,.edit-form textarea{
  border:0!important;background:rgba(11,11,12,.06)!important;border-radius:12px!important;box-shadow:none!important;
}
.gallery-btn{
  border:1px dashed rgba(11,11,12,.25)!important;box-shadow:none!important;background:transparent!important;
}
.profile-btn{
  border:0!important;box-shadow:none!important;background:rgba(11,11,12,.06)!important;border-radius:12px!important;
}
/* chat */
.chat-input-bar input{
  border:0!important;background:rgba(11,11,12,.06)!important;box-shadow:none!important;
}
.bubble{border:0!important;box-shadow:none!important;}
.chat-send{
  border:0!important;box-shadow:none!important;background:var(--ink,#0B0B0C)!important;color:#fff!important;
}
.chat-attach-btn,#chatAttachBtn,.story-card-plus,.nav-post{
  border:0!important;box-shadow:none!important;
  background:var(--ink,#0B0B0C)!important;color:#fff!important;
  border-radius:50%!important;
}
.attach-opt,.attach-opt .ao-icon{
  border:0!important;box-shadow:none!important;
}
.publish-btn{
  border:0!important;box-shadow:none!important;background:var(--ink,#0B0B0C)!important;color:#fff!important;border-radius:12px!important;
}
.video-cover-box,.create-preview{
  border:0!important;box-shadow:none!important;
}
.chat-rec-bar button.send-rec{
  background:var(--ink,#0B0B0C)!important;color:#fff!important;border:0!important;
}
"""

# Replace existing v3 block or inject
if "/* tchilo-flat-all-v3" in html:
    html = re.sub(
        r"/\* tchilo-flat-all-v3[\s\S]*?(?=/\* tchilo-flat-ctas-ig \*/|/\* tchilo-flat-all-v2 \*/|</style>)",
        BLOCK + "\n",
        html,
        count=1,
    )
    print("replaced v3 block")
elif "/* tchilo-flat-ctas-ig */" in html:
    html = html.replace("/* tchilo-flat-ctas-ig */", BLOCK + "\n/* tchilo-flat-ctas-ig */", 1)
    print("injected before ctas-ig")
else:
    html = html.replace("</style>", BLOCK + "\n</style>", 1)
    print("injected before </style>")

if html != orig:
    p.write_text(html, encoding="utf-8")
    print("index written", len(html))
else:
    print("index unchanged")
