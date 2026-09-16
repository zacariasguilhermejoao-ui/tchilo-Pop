#!/usr/bin/env python3
from pathlib import Path

# 1) index.html inject
idx = Path("index.html")
if idx.exists():
    html = idx.read_text(encoding="utf-8", errors="replace")
    changed = False
    if "native/post-music-feed.js" not in html and "</body>" in html:
        html = html.replace(
            "</body>",
            '<script src="native/post-music-feed.js"></script>\n</body>',
            1,
        )
        changed = True
        print("Injected post-music-feed.js")
    if "native/media-editor.js" not in html and "</body>" in html:
        html = html.replace(
            "</body>",
            '<script src="native/media-editor.js"></script>\n</body>',
            1,
        )
        changed = True
        print("Injected media-editor.js")
    if changed:
        idx.write_text(html, encoding="utf-8")
        print("index.html updated")
    else:
        print("index.html ok")

# 2) strip clip editor from media-editor.js
me = Path("native/media-editor.js")
if me.exists():
    t = me.read_text(encoding="utf-8", errors="replace")
    orig = t
    # Remove meEditClip button from music bar
    t = t.replace(
        "'<button type=\"button\" class=\"me-iconbtn\" id=\"meEditClip\" title=\"Editar\">' +\n"
        "      ICO.trim +\n"
        "      '</button>' +\n"
        "      '<button type=\"button\" class=\"me-iconbtn\" id=\"meRemoveMusic\">' +",
        "'<button type=\"button\" class=\"me-iconbtn\" id=\"meRemoveMusic\">' +",
    )
    t = t.replace(
        "document.getElementById('meEditClip').onclick = openClipEditor;\n",
        "",
    )
    # Disable openClipEditor calls
    if "function openClipEditor" in t and "function openClipEditor_disabled" not in t:
        t = t.replace("function openClipEditor", "function openClipEditor_disabled")
    if t != orig:
        me.write_text(t, encoding="utf-8")
        print("media-editor.js clip UI stripped")
    else:
        print("media-editor no change or already stripped")
