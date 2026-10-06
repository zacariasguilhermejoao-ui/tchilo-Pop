#!/usr/bin/env python3
"""Make camera-tiktok deliver prefer create flow handoff."""
from pathlib import Path

p = Path('native/camera-tiktok.js')
if not p.exists():
    print('no camera')
    raise SystemExit(0)

t = p.read_text(encoding='utf-8', errors='replace')
orig = t

old = (
    "function deliver(file,url,mediaType){closeCam();"
    "try{window.createMediaData={src:url,type:mediaType,file:file};window.createMediaFiles=[file];}catch(e){}"
    "if(typeof window.tchiloDeliverFaceFxPhoto==='function'&&mediaType==='image'){try{window.tchiloDeliverFaceFxPhoto(file,url);return;}catch(e2){}}"
    "if(typeof window.tchiloOpenMediaEditor==='function'){try{window.tchiloOpenMediaEditor({mode:'post',mediaType:mediaType,src:url,file:file});return;}catch(e3){}}"
    "try{if(typeof goTo==='function')goTo('create');}catch(e4){}}"
)

new = (
    "function deliver(file,url,mediaType){closeCam();"
    "try{window.createMediaData={src:url,type:mediaType,file:file};window.createMediaFiles=[file];}catch(e){}"
    "if(window.__tchiloCreateFlowActive&&typeof window.tchiloReceiveCreateMedia==='function'){"
    "try{window.tchiloReceiveCreateMedia({file:file,url:url,type:mediaType==='video'?'video':'image',name:(file&&file.name)||'media'});return;}catch(e0){}}"
    "if(typeof window.tchiloDeliverFaceFxPhoto==='function'&&mediaType==='image'){try{window.tchiloDeliverFaceFxPhoto(file,url);return;}catch(e2){}}"
    "if(typeof window.tchiloOpenMediaEditor==='function'){try{window.tchiloOpenMediaEditor({mode:'post',mediaType:mediaType,src:url,file:file});return;}catch(e3){}}"
    "try{if(typeof goTo==='function')goTo('create');}catch(e4){}}"
)

if old in t:
    t = t.replace(old, new, 1)
    print('deliver patched exact')
elif 'tchiloReceiveCreateMedia' in t and '__tchiloCreateFlowActive' in t:
    print('already patched')
else:
    # softer replace
    needle = "function deliver(file,url,mediaType){closeCam();"
    if needle in t and 'tchiloReceiveCreateMedia' not in t:
        insert = (
            "function deliver(file,url,mediaType){closeCam();"
            "if(window.__tchiloCreateFlowActive&&typeof window.tchiloReceiveCreateMedia==='function'){"
            "try{window.tchiloReceiveCreateMedia({file:file,url:url,type:mediaType==='video'?'video':'image',name:(file&&file.name)||'media'});"
            "try{window.createMediaData={src:url,type:mediaType,file:file};window.createMediaFiles=[file];}catch(e){}return;}catch(e0){}}"
        )
        t = t.replace(needle, insert, 1)
        print('deliver patched soft')
    else:
        print('deliver pattern not found')

if t != orig:
    p.write_text(t, encoding='utf-8')
    print('camera written')
"""
