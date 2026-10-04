#!/usr/bin/env python3
"""Embed compose + call UI into index.html — no flash of old icons."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

# 1) Nav / feed icons
old_nav = ".nav-item svg{ width:28px; height:28px; }"
new_nav = '.nav-item svg{ width:30px; height:30px; }\n  .nav-item[data-screen="feed"] svg{ width:32px; height:32px; }'
if old_nav in html:
    html = html.replace(old_nav, new_nav, 1)
    changed = True
    print("nav icons")

# 2) Attach button + compose CSS
old_a = """  .chat-attach-btn{
    width:42px; height:42px; border-radius:50%; flex-shrink:0;
    background:var(--paper); border:2.5px solid var(--ink);
    font-family:'Anton',sans-serif; font-size:26px; line-height:1;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    color:var(--ink);
  }
  .chat-attach-btn:active{ transform:scale(.94); background:var(--yellow); }"""

new_a = """  .chat-attach-btn{
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
  .chat-call-btns button{width:38px;height:38px;border-radius:50%;border:0;background:transparent;color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;}
  .chat-call-btns button:active{background:rgba(0,0,0,.06);}
  #chatMicBtn{flex:0 0 40px;width:40px;height:40px;border-radius:50%;border:0;background:var(--pink,#ff4b75);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;}
  .chat-send.tchilo-send-hidden{opacity:0;pointer-events:none;width:0;min-width:0;padding:0;margin:0;overflow:hidden;border:0;}
  #chatScreen .chat-input-bar .chat-gif-btn,#chatScreen .chat-input-bar .chat-sticker-btn{display:none!important;}"""

if old_a in html:
    html = html.replace(old_a, new_a, 1)
    changed = True
    print("attach css")

# 3) Call buttons in header
old_header = """    <div class=\"chat-header\">
      <button class=\"back-btn\" onclick=\"closeChat()\">
        <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><path d=\"M15 18l-6-6 6-6\"/></svg>
      </button>
      <div class=\"avatar\" id=\"chatAvatar\">JB</div>
      <b id=\"chatName\"></b>
    </div>"""

# Fix escaped quotes - use normal quotes in the actual file
old_header = '''    <div class="chat-header">
      <button class="back-btn" onclick="closeChat()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="avatar" id="chatAvatar">JB</div>
      <b id="chatName"></b>
    </div>'''

new_header = '''    <div class="chat-header">
      <button class="back-btn" onclick="closeChat()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="avatar" id="chatAvatar">JB</div>
      <b id="chatName"></b>
      <div class="chat-call-btns">
        <button type="button" class="chat-call-voice" aria-label="Chamada de voz" title="Chamada de voz" onclick="if(window.tchiloStartCall)tchiloStartCall('voice');">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </button>
        <button type="button" class="chat-call-video" aria-label="Chamada de vídeo" title="Chamada de vídeo" onclick="if(window.tchiloStartCall)tchiloStartCall('video');">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </button>
      </div>
    </div>'''

if old_header in html:
    html = html.replace(old_header, new_header, 1)
    changed = True
    print("header calls")

# 4) Input bar
old_bar = '''    <div class="chat-input-bar">
      <button type="button" class="chat-attach-btn" id="chatAttachBtn" onclick="openChatAttachMenu()" aria-label="Anexar">+</button>
      <input type="text" id="chatInput" placeholder="Mensagem…" onkeydown="if(event.key==='Enter')sendChat()">
      <button class="chat-send" onclick="sendChat()"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
    </div>'''

new_bar = '''    <div class="chat-input-bar">
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
    </script>'''

if old_bar in html:
    html = html.replace(old_bar, new_bar, 1)
    changed = True
    print("input bar")

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE index.html")
else:
    print("no changes")
