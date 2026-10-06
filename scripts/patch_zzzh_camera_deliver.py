#!/usr/bin/env python3
"""Make camera-tiktok deliver prefer create flow handoff."""
from pathlib import Path

p = Path('native/camera-tiktok.js')
if not p.exists():
    print('no camera')
    raise SystemExit(0)

t = p.read_text(encoding='utf-8', errors='replace')
orig = t

if 'tchiloReceiveCreateMedia' in t and '__tchiloCreateFlowActive' in t:
    print('already patched')
    raise SystemExit(0)

needle = 'function deliver(file,url,mediaType){closeCam();'
if needle not in t:
    print('deliver not found')
    raise SystemExit(0)

insert = (
    'function deliver(file,url,mediaType){closeCam();'
    'if(window.__tchiloCreateFlowActive&&typeof window.tchiloReceiveCreateMedia===\'function\'){'
    'try{window.tchiloReceiveCreateMedia({file:file,url:url,type:mediaType===\'video\'?\'video\':\'image\',name:(file&&file.name)||\'media\'});'
    'try{window.createMediaData={src:url,type:mediaType,file:file};window.createMediaFiles=[file];}catch(e){}return;}catch(e0){}}'
)
t = t.replace(needle, insert, 1)
p.write_text(t, encoding='utf-8')
print('camera deliver patched')
