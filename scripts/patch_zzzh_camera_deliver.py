#!/usr/bin/env python3
from pathlib import Path

p = Path('native/camera-tiktok.js')
if not p.exists():
    raise SystemExit(0)
t = p.read_text(encoding='utf-8', errors='replace')
if 'tchiloReceiveCreateMedia' in t:
    print('cam already')
    raise SystemExit(0)
needle = 'function deliver(file,url,mediaType){closeCam();'
if needle not in t:
    print('no deliver')
    raise SystemExit(1)
insert = (
    "function deliver(file,url,mediaType){closeCam();"
    "if(window.__tchiloCreateFlowActive&&typeof window.tchiloReceiveCreateMedia==='function'){"
    "try{window.tchiloReceiveCreateMedia({file:file,url:url,type:mediaType==='video'?'video':'image',name:(file&&file.name)||'media'});"
    "try{window.createMediaData={src:url,type:mediaType,file:file};window.createMediaFiles=[file];}catch(e){}return;}catch(e0){}}"
)
p.write_text(t.replace(needle, insert, 1), encoding='utf-8')
print('cam patched')
