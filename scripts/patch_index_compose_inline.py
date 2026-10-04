#!/usr/bin/env python3
"""Embed compose + call UI into index.html so there is no flash of old icons."""
from pathlib import Path

p = Path('index.html')
html = p.read_text(encoding='utf-8', errors='replace')
changed = False

# 1) Feed / nav icons larger (in CSS — no flash)
old_nav = '.nav-item svg{ width:28px; height:28px; }'
new_nav = '.nav-item svg{ width:30px; height:30px; }\n  .nav-item[data-screen="feed"] svg{ width:32px; height:32px; }'
if old_nav in html:
    html = html.replace(old_nav, new_nav, 1)
    changed = True
    print('nav icon size')
elif 'nav-item[data-screen="feed"] svg' not in html:
    # try alternate spacing
    old_nav2 = '.nav-item svg{width:28px;height:28px;}'
    if old_nav2 in html:
        html = html.replace(old_nav2, '.nav-item svg{width:30px;height:30px;}.nav-item[data-screen="feed"] svg{width:32px;height:32px;}', 1)
        changed = True
        print('nav icon size alt')

# 2) Professional + button CSS
old_attach = """.chat-attach-btn{
    width:42px; height:42px; border-radius:50%; flex-shrink:0;
    background:var(--paper); border:2.5px solid var(--ink);
    font-family:'Anton',sans-serif; font-size:26px; line-height:1;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    color:var(--ink);
  }
  .chat-attach-btn:active{ transform:scale(.94); background:var(--yellow); }"""

new_attach = """.chat-attach-btn{
    width:40px; height:40px; border-radius:12px; flex-shrink:0;
    background:linear-gradient(145deg,#fff 0%,#f3f1ea 100%);
    border:2px solid var(--ink);
    box-shadow:0 2px 0 rgba(0,0,0,.12);
    font-size:0; color:transparent; line-height:1;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    position:relative;
  }
  .chat-attach-btn::before{
    content:""; position:absolute; inset:0; margin:auto;
    width:16px; height:16px;
    background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E") center/contain no-repeat;
  }
  .chat-attach-btn:active{ transform:scale(.94); background:var(--yellow); }
  .chat-call-btns{display:flex;align-items:center;gap:4px;margin-left:auto;flex-shrink:0;}
  .chat-call-btns button{
    width:38px;height:38px;border-radius:50%;border:0;background:transparent;
    color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;
  }
  .chat-call-btns button:active{background:rgba(0,0,0,.06);}
  #chatMicBtn{
    flex:0 0 40px;width:40px;height:40px;border-radius:50%;border:0;
    background:var(--pink,#ff4b75);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;
  }
  #chatMicBtn.rec{background:#c00;}
  .chat-send{
    width:40px;height:40px;border-radius:50%;border:0;flex-shrink:0;
    background:var(--pink,#ff4b75);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;
  }
  .chat-send.tchilo-send-hidden{
    opacity:0;pointer-events:none;width:0;min-width:0;padding:0;margin:0;overflow:hidden;border:0;
  }
  #chatScreen .chat-input-bar .chat-gif-btn,
  #chatScreen .chat-input-bar .chat-sticker-btn{display:none!important;}"""

if old_attach in html:
    html = html.replace(old_attach, new_attach, 1)
    changed = True
    print('attach btn css')
elif 'chat-call-btns' not in html or 'tchilo-send-hidden' not in html:
    # inject after .chat-attach-btn:active if present
    marker = '.chat-attach-btn:active{ transform:scale(.94); background:var(--yellow); }'
    if marker in html and 'tchilo-send-hidden' not in html:
        html = html.replace(marker, marker + '\n' + new_attach.split('.chat-attach-btn:active', 1)[-1] if False else new_attach, 1)
        # simpler: append block before .bubble-media
        pass

# Force-replace attach block more loosely
if 'tchilo-send-hidden' not in html:
    needle = '.chat-attach-btn:active{ transform:scale(.94); background:var(--yellow); }'
    if needle in html:
        extra = """
  .chat-call-btns{display:flex;align-items:center;gap:4px;margin-left:auto;flex-shrink:0;}
  .chat-call-btns button{width:38px;height:38px;border-radius:50%;border:0;background:transparent;color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;}
  .chat-call-btns button:active{background:rgba(0,0,0,.06);}
  #chatMicBtn{flex:0 0 40px;width:40px;height:40px;border-radius:50%;border:0;background:var(--pink,#ff4b75);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;}
  .chat-send.tchilo-send-hidden{opacity:0;pointer-events:none;width:0;min-width:0;padding:0;margin:0;overflow:hidden;border:0;}
  #chatScreen .chat-input-bar .chat-gif-btn,#chatScreen .chat-input-bar .chat-sticker-btn{display:none!important;}"""
        # Also upgrade attach btn if still old circle
        if "border-radius:50%; flex-shrink:0;\n    background:var(--paper)" in html:
            html = html.replace(
                "width:42px; height:42px; border-radius:50%; flex-shrink:0;\n    background:var(--paper); border:2.5px solid var(--ink);\n    font-family:'Anton',sans-serif; font-size:26px; line-height:1;\n    cursor:pointer; display:flex; align-items:center; justify-content:center;\n    color:var(--ink);",
                "width:40px; height:40px; border-radius:12px; flex-shrink:0;\n    background:linear-gradient(145deg,#fff 0%,#f3f1ea 100%); border:2px solid var(--ink);\n    box-shadow:0 2px 0 rgba(0,0,0,.12); font-size:0; color:transparent; line-height:1;\n    cursor:pointer; display:flex; align-items:center; justify-content:center;\n    position:relative;",
                1,
            )
            if 'chat-attach-btn::before' not in html:
                html = html.replace(
                    needle,
                    ".chat-attach-btn::before{content:\"\";position:absolute;inset:0;margin:auto;width:16px;height:16px;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E\") center/contain no-repeat;}\n  " + needle + extra,
                    1,
                )
            else:
                html = html.replace(needle, needle + extra, 1)
            changed = True
            print('compose css injected')
        else:
            html = html.replace(needle, needle + extra, 1)
            changed = True
            print('extra css only')

# 3) Chat header — call buttons in HTML
old_header = """    <div class="chat-header">
      <button class="back-btn" onclick="closeChat()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="avatar" id="chatAvatar">JB</div>
      <b id="chatName"></b>
    </div>"""

new_header = """    <div class="chat-header">
      <button class="back-btn" onclick="closeChat()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="avatar" id="chatAvatar">JB</div>
      <b id="chatName"></b>
      <div class="chat-call-btns">
        <button type="button" class="chat-call-voice" aria-label="Chamada de voz" title="Chamada de voz" onclick="if(window.tchiloStartCall)tchiloStartCall('voice');else if(typeof startChatCall==='function')startChatCall('voice');">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </button>
        <button type="button" class="chat-call-video" aria-label="Chamada de vídeo" title="Chamada de vídeo" onclick="if(window.tchiloStartCall)tchiloStartCall('video');else if(typeof startChatCall==='function')startChatCall('video');">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </button>
      </div>
    </div>"""

if old_header in html and 'chat-call-btns' not in html.split('chat-header', 1)[-1][:800]:
    html = html.replace(old_header, new_header, 1)
    changed = True
    print('call buttons in header')
elif 'class="chat-call-btns"' not in html and old_header in html:
    html = html.replace(old_header, new_header, 1)
    changed = True
    print('call buttons in header (2)')

# 4) Input bar: mic + send hidden by default
old_bar = """    <div class="chat-input-bar">
      <button type="button" class="chat-attach-btn" id="chatAttachBtn" onclick="openChatAttachMenu()" aria-label="Anexar">+</button>
      <input type="text" id="chatInput" placeholder="Mensagem…" onkeydown="if(event.key==='Enter')sendChat()">
      <button class="chat-send" onclick="sendChat()"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
    </div>"""

new_bar = """    <div class="chat-input-bar">
      <button type="button" class="chat-attach-btn" id="chatAttachBtn" onclick="openChatAttachMenu()" aria-label="Anexar" title="Anexar"></button>
      <input type="text" id="chatInput" placeholder="Mensagem…" onkeydown="if(event.key==='Enter')sendChat()" oninput="window.__tchiloToggleSend&&window.__tchiloToggleSend()">
      <button type="button" id="chatMicBtn" aria-label="Gravar áudio" title="Gravar áudio" onclick="if(window.startChatAudioRecord)startChatAudioRecord();">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3M8 21h8"/></svg>
      </button>
      <button class="chat-send tchilo-send-hidden" onclick="sendChat()" aria-label="Enviar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
    </div>
    <script>
    (function(){
      window.__tchiloToggleSend=function(){
        var input=document.getElementById('chatInput');
        var mic=document.getElementById('chatMicBtn');
        var send=document.querySelector('#chatScreen .chat-send');
        if(!input)return;
        var show=!!(input.value&&input.value.trim())||!!(window.__tchiloChatPending&&window.__tchiloChatPending.blob);
        if(mic)mic.style.display=show?'none':'flex';
        if(send){if(show)send.classList.remove('tchilo-send-hidden');else send.classList.add('tchilo-send-hidden');}
      };
    })();
    </script>"""

if old_bar in html:
    html = html.replace(old_bar, new_bar, 1)
    changed = True
    print('input bar with mic/send')
elif 'id="chatMicBtn"' not in html and 'id="chatAttachBtn"' in html:
    # softer match
    import re
    pat = re.compile(
        r'<div class="chat-input-bar">\s*'*
        r'<button type="button" class="chat-attach-btn" id="chatAttachBtn"[^>]*>\+</button>\s*'
        r'<input type="text" id="chatInput"[^>]*>\s*'
        r'<button class="chat-send"[^>]*>.*?</button>\s*'
        r'</div>',
        re.S,
    )
    m = pat.search(html)
    if m:
        html = html[:m.start()] + new_bar + html[m.end():]
        changed = True
        print('input bar regex')

# 5) Ensure scripts still present with cache-bust
if 'chat-compose-fix.js' not in html:
    import re
    m = re.search(r'<script src="native/chat-audio-fix\.js[^"]*"></script>', html)
    if m:
        insert = (
            m.group(0)
            + '\n<script src="native/chat-compose-fix.js?v=4"></script>'
            + '\n<script src="native/chat-call-webrtc.js?v=4"></script>'
        )
        html = html[:m.start()] + insert + html[m.end():]
        changed = True
        print('scripts ensured')

if changed:
    p.write_text(html, encoding='utf-8')
    print('WROTE index.html')
else:
    print('no changes needed')
