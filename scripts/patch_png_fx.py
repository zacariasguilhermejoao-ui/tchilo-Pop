#!/usr/bin/env python3
"""Injeta camera-tiktok, assets PNG e engine fx-png-effects no index.html."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

SCRIPTS = [
    "native/camera-tiktok.js",
    "native/fx-one/fx_oculos_pixel_thug_life.js",
    "native/fx-one/fx_oculos_estrela_rosa.js",
    "native/fx-one/fx_oculos_nerd_laco_rosa.js",
    "native/fx-one/fx_oculos_prata_esportivo.js",
    "native/fx-one/fx_orelha_gato_laco_bigodes.js",
    "native/fx-one/fx_coroa_dourada.js",
    "native/fx-one/fx_chifres_demonio.js",
    "native/fx-one/fx_bone_rosa_dodgers.js",
    "native/fx-one/fx_peruca_bob_franja.js",
    "native/fx-one/fx_cabelo_afro.js",
    "native/fx-one/fx_dreadlocks_bicolor.js",
    "native/fx-one/fx_cabelo_topo_liso.js",
    "native/fx-one/fx_labios_beijo_rosa.js",
    "native/fx-one/fx_labios_gloss_vermelho.js",
    "native/fx-one/fx_mascara_boca_dentes.js",
    "native/fx-one/fx_mascara_spiderman.js",
    "native/fx-one/fx_cabeca_robo_metal.js",
    "native/fx-png-effects.js",
    "native/face-fx-pro.js",
]

block = "\n".join(f'<script src="{s}"></script>' for s in SCRIPTS)

marker_start = "<!-- tchilo-png-fx-start -->"
marker_end = "<!-- tchilo-png-fx-end -->"
if marker_start in html and marker_end in html:
    pre = html.split(marker_start)[0]
    post = html.split(marker_end, 1)[1]
    html = pre + post
    changed = True
    print("Removed previous png-fx block")

inject = f"{marker_start}\n{block}\n{marker_end}\n"

if "</body>" in html:
    needle = '<script src="native/face-effects.js"></script>'
    if needle in html:
        html = html.replace(needle, needle + "\n" + inject, 1)
        changed = True
        print("Injected after face-effects.js")
    else:
        html = html.replace("</body>", inject + "</body>", 1)
        changed = True
        print("Injected before </body>")
else:
    print("No </body> found")

if changed:
    p.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("No changes")
