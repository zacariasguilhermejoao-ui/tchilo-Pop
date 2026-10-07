#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix broken avatar HTML that causes SyntaxError and kills entire app JS."""
from pathlib import Path
import re

p = Path("index.html")
h = p.read_text(encoding="utf-8")
orig = len(h)
changed = []

new_render = (
    "function renderUserAvatarHTML(username, initials, bg) {\n"
    "  const url = resolveUserAvatarUrl(username);\n"
    "  const def = (typeof tchiloDefaultAvatarSrc === 'function') ? tchiloDefaultAvatarSrc() : 'avatar-claro.svg';\n"
    "  const src = url || def;\n"
    "  return '<div class=\"avatar\" style=\"background:transparent;overflow:hidden;border:none;box-shadow:none\">"
    "<img src=\"' + String(src).replace(/\"/g, '&quot;') + '\" alt=\"\" loading=\"lazy\" "
    "style=\"width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;border:none\"></div>';\n"
    "}"
)

new_apply = (
    "function applyAvatarToElement(el, username, initials, bg) {\n"
    "  if (!el) return;\n"
    "  const url = resolveUserAvatarUrl(username);\n"
    "  const def = (typeof tchiloDefaultAvatarSrc === 'function') ? tchiloDefaultAvatarSrc() : 'avatar-claro.svg';\n"
    "  el.style.background = 'transparent';\n"
    "  el.style.overflow = 'hidden';\n"
    "  el.style.border = 'none';\n"
    "  el.style.boxShadow = 'none';\n"
    "  el.style.color = 'transparent';\n"
    "  el.style.fontSize = '0';\n"
    "  const src = url || def;\n"
    "  el.innerHTML = '<img src=\"' + String(src).replace(/\"/g, '&quot;') + '\" alt=\"\" "
    "style=\"width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;border:none\">';\n"
    "}"
)

pat_render = r"function renderUserAvatarHTML\s*\([^)]*\)\s*\{[\s\S]*?\n\}"
pat_apply = r"function applyAvatarToElement\s*\([^)]*\)\s*\{[\s\S]*?\n\}"

h2, n1 = re.subn(pat_render, new_render, h, count=1)
if n1:
    h = h2
    changed.append("renderUserAvatarHTML")
else:
    changed.append("render-FAIL")

h2, n2 = re.subn(pat_apply, new_apply, h, count=1)
if n2:
    h = h2
    changed.append("applyAvatarToElement")
else:
    changed.append("apply-FAIL")

p.write_text(h, encoding="utf-8")
print("changed:", changed)
print("size", orig, "->", len(h))
