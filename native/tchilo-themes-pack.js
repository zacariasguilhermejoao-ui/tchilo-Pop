/**
 * tchilo-Pop — Pack de temas: Neon, Natal, Sunset, Pastel, Vaporwave
 */
(function () {
  "use strict";

  var THEME_STORAGE = "tchilo_theme";
  var EXTRA = ["retro", "halloween", "gothic", "neon", "natal", "sunset", "pastel", "vaporwave"];

  var THEMES = {
    neon: {
      label: "Neon",
      font:
        "https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Inter:wght@500;600;700;800&display=swap",
      fontId: "tchiloNeonFont",
      titleFont: "Orbitron",
      swatch: "linear-gradient(135deg,#0a0a12 25%,#ff2bd6 25% 50%,#00f0ff 50% 75%,#39ff14 75%)",
      css:
        '[data-theme="neon"]{' +
        '--ink:#E8F7FF;--paper:#07070F;--mint:#39FF14;--pink:#FF2BD6;--yellow:#F5FF3D;--violet:#7B5CFF;--line:#00F0FF;--muted:#7A8A9A;' +
        '--n-cyan:#00F0FF;--n-pink:#FF2BD6;--n-lime:#39FF14;--n-bg:#07070F;}' +
        '[data-theme="neon"] body{background:#000!important;}' +
        '[data-theme="neon"] #appFrame,[data-theme="neon"].frame{' +
        'background:#07070F!important;background-image:radial-gradient(ellipse at 20% 0%,rgba(255,43,214,.2),transparent 45%),radial-gradient(ellipse at 90% 100%,rgba(0,240,255,.18),transparent 45%)!important;color:#E8F7FF!important;}' +
        '[data-theme="neon"] h1,[data-theme="neon"] .screen-header h1,[data-theme="neon"] .topbar b{[font]color:#00F0FF!important;text-shadow:0 0 12px rgba(0,240,255,.7),0 0 24px rgba(255,43,214,.4)!important;letter-spacing:.06em!important;}' +
        '[data-theme="neon"] .topbar,[data-theme="neon"] .screen-header,[data-theme="neon"] .chat-header,[data-theme="neon"] .bottom-nav,[data-theme="neon"] #bottomNav{' +
        'background:#0A0A14!important;border-color:#00F0FF!important;}' +
        '[data-theme="neon"] .topbar,[data-theme="neon"] .screen-header,[data-theme="neon"] .chat-header{border-bottom:2px solid #FF2BD6!important;box-shadow:0 0 20px rgba(255,43,214,.25)!important;}' +
        '[data-theme="neon"] .bottom-nav,[data-theme="neon"] #bottomNav{border-top:2px solid #00F0FF!important;box-shadow:0 0 20px rgba(0,240,255,.2)!important;}' +
        '[data-theme="neon"] .bottom-nav svg,[data-theme="neon"] .topbar svg,[data-theme="neon"] .act svg,[data-theme="neon"] button svg{stroke:#00F0FF!important;filter:drop-shadow(0 0 5px rgba(0,240,255,.6))!important;}' +
        '[data-theme="neon"] .bottom-nav button.active svg,[data-theme="neon"] .nav-item.active svg{stroke:#FF2BD6!important;filter:drop-shadow(0 0 8px rgba(255,43,214,.8))!important;}' +
        '[data-theme="neon"] .act.liked svg{stroke:#FF2BD6!important;fill:#FF2BD6!important;}' +
        '[data-theme="neon"] .nav-create,[data-theme="neon"] button.nav-create{background:linear-gradient(135deg,#FF2BD6,#00F0FF)!important;color:#07070F!important;border:2px solid #39FF14!important;box-shadow:0 0 18px rgba(255,43,214,.5)!important;border-radius:12px!important;}' +
        '[data-theme="neon"] .nav-create svg{stroke:#07070F!important;filter:none!important;}' +
        '[data-theme="neon"] .post{background:#0C0C18!important;border:2px solid #00F0FF!important;box-shadow:0 0 16px rgba(0,240,255,.2),0 0 0 1px #FF2BD6!important;border-radius:14px!important;}' +
        '[data-theme="neon"] .post-boost-btn{background:#FF2BD6!important;color:#fff!important;border:2px solid #00F0FF!important;box-shadow:0 0 12px rgba(255,43,214,.5)!important;}' +
        '[data-theme="neon"] .follow-btn,[data-theme="neon"] .post-follow{background:#00F0FF!important;color:#07070F!important;border:2px solid #FF2BD6!important;}' +
        '[data-theme="neon"] .settings-item,[data-theme="neon"] .msg-item{background:#0A0A14!important;border-bottom:1px solid rgba(0,240,255,.2)!important;color:#E8F7FF!important;}' +
        '[data-theme="neon"] .si-icon{border:2px solid #FF2BD6!important;background:#0C0C18!important;box-shadow:0 0 10px rgba(255,43,214,.35)!important;}' +
        '[data-theme="neon"] input,[data-theme="neon"] textarea{background:#0C0C18!important;border:2px solid #00F0FF!important;color:#E8F7FF!important;}' +
        '[data-theme="neon"] .profile-btn,[data-theme="neon"] .ads-pay,[data-theme="neon"] .af-pay{background:linear-gradient(135deg,#FF2BD6,#7B5CFF)!important;color:#fff!important;border:2px solid #00F0FF!important;box-shadow:0 0 14px rgba(255,43,214,.4)!important;}' +
        '[data-theme="neon"] .bubble.me{background:linear-gradient(145deg,#FF2BD6,#7B5CFF)!important;color:#fff!important;border:2px solid #00F0FF!important;}' +
        '[data-theme="neon"] .bubble.them{background:#0C0C18!important;border:2px solid #00F0FF!important;color:#E8F7FF!important;}' +
        '[data-theme="neon"] .chat-input-bar{background:#07070F!important;border-top:2px solid #FF2BD6!important;}' +
        '[data-theme="neon"] .chat-send,[data-theme="neon"] .chat-attach-btn,[data-theme="neon"] .sg-trigger{background:#00F0FF!important;border:2px solid #FF2BD6!important;}' +
        '[data-theme="neon"] .chat-send svg,[data-theme="neon"] .sg-trigger svg{stroke:#07070F!important;filter:none!important;}' +
        '[data-theme="neon"] .story-card{border:2px solid #FF2BD6!important;box-shadow:0 0 14px rgba(255,43,214,.35)!important;}' +
        '[data-theme="neon"] .story-card.unseen{outline:2px solid #39FF14;outline-offset:3px;}' +
        '[data-theme="neon"] #tchiloSGSheet,[data-theme="neon"] .sheet,[data-theme="neon"] #commentSheet{background:#07070F!important;border-color:#00F0FF!important;color:#E8F7FF!important;}' +
        '[data-theme="neon"] .sg-tab{background:#0C0C18!important;border:2px solid #00F0FF!important;color:#E8F7FF!important;}' +
        '[data-theme="neon"] .sg-tab.on{background:#FF2BD6!important;color:#fff!important;}' +
        '[data-theme="neon"] .avatar{border:2px solid #00F0FF!important;box-shadow:0 0 10px rgba(0,240,255,.4)!important;}' +
        '[data-theme="neon"] .tag{background:#FF2BD6!important;color:#fff!important;border:1px solid #00F0FF!important;}'
    },

    natal: {
      label: "Natal",
      font:
        "https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@700&family=Inter:wght@500;600;700;800&display=swap",
      fontId: "tchiloNatalFont",
      titleFont: "Mountains of Christmas",
      swatch: "linear-gradient(135deg,#0B3D2E 30%,#C41E3A 30% 60%,#D4AF37 60%)",
      css:
        '[data-theme="natal"]{' +
        '--ink:#1A1208;--paper:#F5EFE0;--mint:#0B6B4A;--pink:#C41E3A;--yellow:#D4AF37;--violet:#1A4D3A;--line:#C41E3A;--muted:#6B5A48;' +
        '--na-green:#0B6B4A;--na-red:#C41E3A;--na-gold:#D4AF37;--na-cream:#F5EFE0;}' +
        '[data-theme="natal"] body{background:#0B3D2E!important;}' +
        '[data-theme="natal"] #appFrame,[data-theme="natal"].frame{' +
        'background:#F5EFE0!important;background-image:radial-gradient(ellipse at 10% 0%,rgba(196,30,58,.12),transparent 40%),radial-gradient(ellipse at 100% 100%,rgba(11,107,74,.12),transparent 40%)!important;color:#1A1208!important;}' +
        '[data-theme="natal"] h1,[data-theme="natal"] .screen-header h1,[data-theme="natal"] .topbar b{[font]color:#C41E3A!important;text-shadow:1px 1px 0 #D4AF37!important;}' +
        '[data-theme="natal"] .topbar,[data-theme="natal"] .screen-header,[data-theme="natal"] .chat-header,[data-theme="natal"] .bottom-nav,[data-theme="natal"] #bottomNav{' +
        'background:#FFF8EE!important;border-color:#C41E3A!important;}' +
        '[data-theme="natal"] .topbar,[data-theme="natal"] .screen-header{border-bottom:3px solid #C41E3A!important;}' +
        '[data-theme="natal"] .bottom-nav,[data-theme="natal"] #bottomNav{border-top:3px solid #0B6B4A!important;}' +
        '[data-theme="natal"] .bottom-nav svg,[data-theme="natal"] .topbar svg,[data-theme="natal"] .act svg,[data-theme="natal"] button svg{stroke:#0B6B4A!important;}' +
        '[data-theme="natal"] .bottom-nav button.active svg{stroke:#C41E3A!important;}' +
        '[data-theme="natal"] .act.liked svg{stroke:#C41E3A!important;fill:#C41E3A!important;}' +
        '[data-theme="natal"] .nav-create,[data-theme="natal"] button.nav-create{background:#C41E3A!important;color:#FFF8EE!important;border:3px solid #D4AF37!important;box-shadow:3px 3px 0 #0B6B4A!important;border-radius:12px!important;}' +
        '[data-theme="natal"] .nav-create svg{stroke:#FFF8EE!important;}' +
        '[data-theme="natal"] .post{background:#FFF8EE!important;border:3px solid #0B6B4A!important;box-shadow:4px 4px 0 rgba(196,30,58,.25)!important;border-radius:14px!important;}' +
        '[data-theme="natal"] .post-boost-btn{background:#D4AF37!important;color:#1A1208!important;border:2px solid #C41E3A!important;}' +
        '[data-theme="natal"] .follow-btn,[data-theme="natal"] .post-follow{background:#0B6B4A!important;color:#FFF8EE!important;border:2px solid #C41E3A!important;}' +
        '[data-theme="natal"] .settings-item,[data-theme="natal"] .msg-item{background:#FFF8EE!important;border-bottom:1px solid rgba(11,107,74,.2)!important;}' +
        '[data-theme="natal"] .si-icon{border:2px solid #C41E3A!important;background:#F5EFE0!important;}' +
        '[data-theme="natal"] input,[data-theme="natal"] textarea{background:#FFF8EE!important;border:2px solid #0B6B4A!important;color:#1A1208!important;}' +
        '[data-theme="natal"] .profile-btn,[data-theme="natal"] .ads-pay,[data-theme="natal"] .af-pay{background:#C41E3A!important;color:#FFF8EE!important;border:2px solid #D4AF37!important;box-shadow:3px 3px 0 #0B6B4A!important;}' +
        '[data-theme="natal"] .bubble.me{background:#0B6B4A!important;color:#FFF8EE!important;border:2px solid #D4AF37!important;}' +
        '[data-theme="natal"] .bubble.them{background:#FFF8EE!important;border:2px solid #C41E3A!important;}' +
        '[data-theme="natal"] .chat-input-bar{background:#FFF8EE!important;border-top:3px solid #0B6B4A!important;}' +
        '[data-theme="natal"] .chat-send,[data-theme="natal"] .chat-attach-btn,[data-theme="natal"] .sg-trigger{background:#C41E3A!important;border:2px solid #D4AF37!important;}' +
        '[data-theme="natal"] .chat-send svg,[data-theme="natal"] .sg-trigger svg{stroke:#FFF8EE!important;}' +
        '[data-theme="natal"] .story-card{border:3px solid #C41E3A!important;box-shadow:3px 3px 0 #0B6B4A!important;}' +
        '[data-theme="natal"] .story-card.unseen{outline:3px solid #D4AF37;outline-offset:2px;}' +
        '[data-theme="natal"] #tchiloSGSheet,[data-theme="natal"] .sheet{background:#F5EFE0!important;border-color:#C41E3A!important;}' +
        '[data-theme="natal"] .sg-tab{border:2px solid #0B6B4A!important;background:#FFF8EE!important;}' +
        '[data-theme="natal"] .sg-tab.on{background:#C41E3A!important;color:#FFF8EE!important;}' +
        '[data-theme="natal"] .avatar{border:2px solid #C41E3A!important;}' +
        '[data-theme="natal"] .tag{background:#0B6B4A!important;color:#D4AF37!important;border:1px solid #C41E3A!important;}'
    },

    sunset: {
      label: "Sunset",
      font:
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@500;600;700;800&display=swap",
      fontId: "tchiloSunsetFont",
      titleFont: "Playfair Display",
      swatch: "linear-gradient(135deg,#1A0A2E 20%,#FF5E3A 20% 45%,#FF9A3C 45% 70%,#7B2FF7 70%)",
      css:
        '[data-theme="sunset"]{' +
        '--ink:#1A0A2E;--paper:#FFF0E6;--mint:#FF9A3C;--pink:#FF5E3A;--yellow:#FFC14A;--violet:#7B2FF7;--line:#FF5E3A;--muted:#8A6070;' +
        '--su-coral:#FF5E3A;--su-orange:#FF9A3C;--su-purple:#7B2FF7;--su-cream:#FFF0E6;}' +
        '[data-theme="sunset"] body{background:#1A0A2E!important;}' +
        '[data-theme="sunset"] #appFrame,[data-theme="sunset"].frame{' +
        'background:#FFF0E6!important;background-image:radial-gradient(ellipse at 80% 0%,rgba(255,94,58,.22),transparent 50%),radial-gradient(ellipse at 0% 100%,rgba(123,47,247,.15),transparent 45%)!important;color:#1A0A2E!important;}' +
        '[data-theme="sunset"] h1,[data-theme="sunset"] .screen-header h1,[data-theme="sunset"] .topbar b{[font]color:#FF5E3A!important;}' +
        '[data-theme="sunset"] .topbar,[data-theme="sunset"] .screen-header,[data-theme="sunset"] .chat-header,[data-theme="sunset"] .bottom-nav,[data-theme="sunset"] #bottomNav{' +
        'background:#FFE8DC!important;border-color:#FF5E3A!important;}' +
        '[data-theme="sunset"] .topbar,[data-theme="sunset"] .screen-header{border-bottom:2px solid #7B2FF7!important;}' +
        '[data-theme="sunset"] .bottom-nav,[data-theme="sunset"] #bottomNav{border-top:2px solid #FF5E3A!important;}' +
        '[data-theme="sunset"] .bottom-nav svg,[data-theme="sunset"] .topbar svg,[data-theme="sunset"] .act svg,[data-theme="sunset"] button svg{stroke:#7B2FF7!important;}' +
        '[data-theme="sunset"] .bottom-nav button.active svg{stroke:#FF5E3A!important;}' +
        '[data-theme="sunset"] .act.liked svg{stroke:#FF5E3A!important;fill:#FF5E3A!important;}' +
        '[data-theme="sunset"] .nav-create,[data-theme="sunset"] button.nav-create{background:linear-gradient(135deg,#FF5E3A,#FF9A3C)!important;color:#fff!important;border:2px solid #7B2FF7!important;box-shadow:3px 3px 0 rgba(123,47,247,.35)!important;border-radius:14px!important;}' +
        '[data-theme="sunset"] .nav-create svg{stroke:#fff!important;}' +
        '[data-theme="sunset"] .post{background:#FFE8DC!important;border:2px solid #FF5E3A!important;box-shadow:0 8px 24px rgba(255,94,58,.15)!important;border-radius:16px!important;}' +
        '[data-theme="sunset"] .post-boost-btn{background:#FF9A3C!important;color:#1A0A2E!important;border:2px solid #7B2FF7!important;}' +
        '[data-theme="sunset"] .follow-btn,[data-theme="sunset"] .post-follow{background:#7B2FF7!important;color:#fff!important;border:2px solid #FF5E3A!important;}' +
        '[data-theme="sunset"] .settings-item,[data-theme="sunset"] .msg-item{background:#FFE8DC!important;border-bottom:1px solid rgba(255,94,58,.2)!important;}' +
        '[data-theme="sunset"] .si-icon{border:2px solid #FF5E3A!important;background:#FFF0E6!important;}' +
        '[data-theme="sunset"] input,[data-theme="sunset"] textarea{background:#FFF0E6!important;border:2px solid #7B2FF7!important;color:#1A0A2E!important;}' +
        '[data-theme="sunset"] .profile-btn,[data-theme="sunset"] .ads-pay,[data-theme="sunset"] .af-pay{background:linear-gradient(135deg,#FF5E3A,#7B2FF7)!important;color:#fff!important;border:2px solid #FF9A3C!important;}' +
        '[data-theme="sunset"] .bubble.me{background:linear-gradient(145deg,#FF5E3A,#7B2FF7)!important;color:#fff!important;border:none!important;}' +
        '[data-theme="sunset"] .bubble.them{background:#FFE8DC!important;border:2px solid #FF9A3C!important;}' +
        '[data-theme="sunset"] .chat-input-bar{background:#FFE8DC!important;border-top:2px solid #7B2FF7!important;}' +
        '[data-theme="sunset"] .chat-send,[data-theme="sunset"] .chat-attach-btn,[data-theme="sunset"] .sg-trigger{background:#FF5E3A!important;border:2px solid #7B2FF7!important;}' +
        '[data-theme="sunset"] .chat-send svg,[data-theme="sunset"] .sg-trigger svg{stroke:#fff!important;}' +
        '[data-theme="sunset"] .story-card{border:2px solid #FF5E3A!important;box-shadow:0 4px 16px rgba(123,47,247,.2)!important;}' +
        '[data-theme="sunset"] .story-card.unseen{outline:2px solid #7B2FF7;outline-offset:3px;}' +
        '[data-theme="sunset"] #tchiloSGSheet,[data-theme="sunset"] .sheet{background:#FFF0E6!important;border-color:#FF5E3A!important;}' +
        '[data-theme="sunset"] .sg-tab{border:2px solid #7B2FF7!important;background:#FFE8DC!important;}' +
        '[data-theme="sunset"] .sg-tab.on{background:#FF5E3A!important;color:#fff!important;}' +
        '[data-theme="sunset"] .avatar{border:2px solid #FF5E3A!important;}' +
        '[data-theme="sunset"] .tag{background:#7B2FF7!important;color:#fff!important;}'
    },

    pastel: {
      label: "Pastel",
      font:
        "https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&family=Inter:wght@500;600;700;800&display=swap",
      fontId: "tchiloPastelFont",
      titleFont: "Quicksand",
      swatch: "linear-gradient(135deg,#FFE4EC 25%,#E0F4FF 25% 50%,#E8FFE8 50% 75%,#FFF4D6 75%)",
      css:
        '[data-theme="pastel"]{' +
        '--ink:#4A3F55;--paper:#FFF7FB;--mint:#B8E0D2;--pink:#FFB7C5;--yellow:#FFE5A0;--violet:#C5B4E3;--line:#E8B4CB;--muted:#9A8BA8;' +
        '--pa-pink:#FFB7C5;--pa-blue:#B8D4E8;--pa-mint:#B8E0D2;--pa-lilac:#C5B4E3;}' +
        '[data-theme="pastel"] body{background:#E8D5E8!important;}' +
        '[data-theme="pastel"] #appFrame,[data-theme="pastel"].frame{' +
        'background:#FFF7FB!important;background-image:radial-gradient(ellipse at 0% 0%,rgba(255,183,197,.35),transparent 50%),radial-gradient(ellipse at 100% 100%,rgba(197,180,227,.3),transparent 45%)!important;color:#4A3F55!important;}' +
        '[data-theme="pastel"] h1,[data-theme="pastel"] .screen-header h1,[data-theme="pastel"] .topbar b{[font]color:#8B6B9E!important;}' +
        '[data-theme="pastel"] .topbar,[data-theme="pastel"] .screen-header,[data-theme="pastel"] .chat-header,[data-theme="pastel"] .bottom-nav,[data-theme="pastel"] #bottomNav{' +
        'background:#FFF0F5!important;border-color:#E8B4CB!important;}' +
        '[data-theme="pastel"] .topbar,[data-theme="pastel"] .screen-header{border-bottom:2px solid #C5B4E3!important;}' +
        '[data-theme="pastel"] .bottom-nav,[data-theme="pastel"] #bottomNav{border-top:2px solid #FFB7C5!important;}' +
        '[data-theme="pastel"] .bottom-nav svg,[data-theme="pastel"] .topbar svg,[data-theme="pastel"] .act svg,[data-theme="pastel"] button svg{stroke:#8B6B9E!important;}' +
        '[data-theme="pastel"] .bottom-nav button.active svg{stroke:#E88BA8!important;}' +
        '[data-theme="pastel"] .act.liked svg{stroke:#E88BA8!important;fill:#E88BA8!important;}' +
        '[data-theme="pastel"] .nav-create,[data-theme="pastel"] button.nav-create{background:#FFB7C5!important;color:#4A3F55!important;border:2px solid #C5B4E3!important;box-shadow:3px 3px 0 rgba(197,180,227,.4)!important;border-radius:16px!important;}' +
        '[data-theme="pastel"] .nav-create svg{stroke:#4A3F55!important;}' +
        '[data-theme="pastel"] .post{background:#FFFFFF!important;border:2px solid #E8B4CB!important;box-shadow:0 6px 20px rgba(232,180,203,.25)!important;border-radius:18px!important;}' +
        '[data-theme="pastel"] .post-boost-btn{background:#C5B4E3!important;color:#4A3F55!important;border:2px solid #FFB7C5!important;}' +
        '[data-theme="pastel"] .follow-btn,[data-theme="pastel"] .post-follow{background:#B8E0D2!important;color:#4A3F55!important;border:2px solid #C5B4E3!important;}' +
        '[data-theme="pastel"] .settings-item,[data-theme="pastel"] .msg-item{background:#FFF0F5!important;border-bottom:1px solid rgba(232,180,203,.35)!important;}' +
        '[data-theme="pastel"] .si-icon{border:2px solid #C5B4E3!important;background:#FFF7FB!important;}' +
        '[data-theme="pastel"] input,[data-theme="pastel"] textarea{background:#FFFFFF!important;border:2px solid #C5B4E3!important;color:#4A3F55!important;border-radius:14px!important;}' +
        '[data-theme="pastel"] .profile-btn,[data-theme="pastel"] .ads-pay,[data-theme="pastel"] .af-pay{background:#FFB7C5!important;color:#4A3F55!important;border:2px solid #C5B4E3!important;box-shadow:3px 3px 0 rgba(184,224,210,.5)!important;}' +
        '[data-theme="pastel"] .bubble.me{background:#FFB7C5!important;color:#4A3F55!important;border:2px solid #C5B4E3!important;}' +
        '[data-theme="pastel"] .bubble.them{background:#FFFFFF!important;border:2px solid #B8E0D2!important;}' +
        '[data-theme="pastel"] .chat-input-bar{background:#FFF0F5!important;border-top:2px solid #C5B4E3!important;}' +
        '[data-theme="pastel"] .chat-send,[data-theme="pastel"] .chat-attach-btn,[data-theme="pastel"] .sg-trigger{background:#C5B4E3!important;border:2px solid #FFB7C5!important;}' +
        '[data-theme="pastel"] .chat-send svg,[data-theme="pastel"] .sg-trigger svg{stroke:#4A3F55!important;}' +
        '[data-theme="pastel"] .story-card{border:2px solid #FFB7C5!important;box-shadow:0 4px 14px rgba(197,180,227,.3)!important;border-radius:16px!important;}' +
        '[data-theme="pastel"] .story-card.unseen{outline:2px solid #B8E0D2;outline-offset:3px;}' +
        '[data-theme="pastel"] #tchiloSGSheet,[data-theme="pastel"] .sheet{background:#FFF7FB!important;border-color:#E8B4CB!important;}' +
        '[data-theme="pastel"] .sg-tab{border:2px solid #C5B4E3!important;background:#FFF0F5!important;}' +
        '[data-theme="pastel"] .sg-tab.on{background:#FFB7C5!important;}' +
        '[data-theme="pastel"] .avatar{border:2px solid #FFB7C5!important;}' +
        '[data-theme="pastel"] .tag{background:#B8E0D2!important;color:#4A3F55!important;border:1px solid #C5B4E3!important;}'
    },

    vaporwave: {
      label: "Vaporwave",
      font:
        "https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@500;600;700;800&display=swap",
      fontId: "tchiloVaporFont",
      titleFont: "Audiowide",
      swatch: "linear-gradient(135deg,#2B1055 25%,#FF71CE 25% 50%,#01CDFE 50% 75%,#B967FF 75%)",
      css:
        '[data-theme="vaporwave"]{' +
        '--ink:#F0E6FF;--paper:#1A0B2E;--mint:#05FFA1;--pink:#FF71CE;--yellow:#FFFB96;--violet:#B967FF;--line:#01CDFE;--muted:#A090B8;' +
        '--vw-pink:#FF71CE;--vw-cyan:#01CDFE;--vw-purple:#B967FF;--vw-bg:#1A0B2E;}' +
        '[data-theme="vaporwave"] body{background:#0D0518!important;}' +
        '[data-theme="vaporwave"] #appFrame,[data-theme="vaporwave"].frame{' +
        'background:#1A0B2E!important;background-image:linear-gradient(180deg,rgba(255,113,206,.12),transparent 40%),linear-gradient(0deg,rgba(1,205,254,.1),transparent 35%),repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,113,206,.04) 3px,rgba(255,113,206,.04) 4px)!important;color:#F0E6FF!important;}' +
        '[data-theme="vaporwave"] h1,[data-theme="vaporwave"] .screen-header h1,[data-theme="vaporwave"] .topbar b{[font]color:#FF71CE!important;text-shadow:2px 2px 0 #01CDFE,0 0 16px rgba(255,113,206,.5)!important;text-transform:uppercase;letter-spacing:.08em!important;}' +
        '[data-theme="vaporwave"] .topbar,[data-theme="vaporwave"] .screen-header,[data-theme="vaporwave"] .chat-header,[data-theme="vaporwave"] .bottom-nav,[data-theme="vaporwave"] #bottomNav{' +
        'background:#160824!important;border-color:#FF71CE!important;}' +
        '[data-theme="vaporwave"] .topbar,[data-theme="vaporwave"] .screen-header{border-bottom:2px solid #01CDFE!important;box-shadow:0 0 18px rgba(1,205,254,.25)!important;}' +
        '[data-theme="vaporwave"] .bottom-nav,[data-theme="vaporwave"] #bottomNav{border-top:2px solid #B967FF!important;box-shadow:0 0 18px rgba(185,103,255,.25)!important;}' +
        '[data-theme="vaporwave"] .bottom-nav svg,[data-theme="vaporwave"] .topbar svg,[data-theme="vaporwave"] .act svg,[data-theme="vaporwave"] button svg{stroke:#01CDFE!important;filter:drop-shadow(0 0 4px rgba(1,205,254,.5))!important;}' +
        '[data-theme="vaporwave"] .bottom-nav button.active svg{stroke:#FF71CE!important;filter:drop-shadow(0 0 8px rgba(255,113,206,.7))!important;}' +
        '[data-theme="vaporwave"] .act.liked svg{stroke:#FF71CE!important;fill:#FF71CE!important;}' +
        '[data-theme="vaporwave"] .nav-create,[data-theme="vaporwave"] button.nav-create{background:linear-gradient(135deg,#FF71CE,#B967FF)!important;color:#1A0B2E!important;border:2px solid #01CDFE!important;box-shadow:0 0 16px rgba(255,113,206,.45)!important;border-radius:10px!important;}' +
        '[data-theme="vaporwave"] .nav-create svg{stroke:#1A0B2E!important;filter:none!important;}' +
        '[data-theme="vaporwave"] .post{background:#220E3A!important;border:2px solid #FF71CE!important;box-shadow:0 0 0 1px #01CDFE,0 8px 24px rgba(185,103,255,.2)!important;border-radius:12px!important;}' +
        '[data-theme="vaporwave"] .post-boost-btn{background:#FF71CE!important;color:#1A0B2E!important;border:2px solid #01CDFE!important;}' +
        '[data-theme="vaporwave"] .follow-btn,[data-theme="vaporwave"] .post-follow{background:#01CDFE!important;color:#1A0B2E!important;border:2px solid #B967FF!important;}' +
        '[data-theme="vaporwave"] .settings-item,[data-theme="vaporwave"] .msg-item{background:#160824!important;border-bottom:1px solid rgba(255,113,206,.2)!important;color:#F0E6FF!important;}' +
        '[data-theme="vaporwave"] .si-icon{border:2px solid #B967FF!important;background:#220E3A!important;box-shadow:0 0 10px rgba(185,103,255,.3)!important;}' +
        '[data-theme="vaporwave"] input,[data-theme="vaporwave"] textarea{background:#220E3A!important;border:2px solid #01CDFE!important;color:#F0E6FF!important;}' +
        '[data-theme="vaporwave"] .profile-btn,[data-theme="vaporwave"] .ads-pay,[data-theme="vaporwave"] .af-pay{background:linear-gradient(135deg,#FF71CE,#01CDFE)!important;color:#1A0B2E!important;border:2px solid #B967FF!important;}' +
        '[data-theme="vaporwave"] .bubble.me{background:linear-gradient(145deg,#FF71CE,#B967FF)!important;color:#1A0B2E!important;border:2px solid #01CDFE!important;}' +
        '[data-theme="vaporwave"] .bubble.them{background:#220E3A!important;border:2px solid #01CDFE!important;color:#F0E6FF!important;}' +
        '[data-theme="vaporwave"] .chat-input-bar{background:#160824!important;border-top:2px solid #FF71CE!important;}' +
        '[data-theme="vaporwave"] .chat-send,[data-theme="vaporwave"] .chat-attach-btn,[data-theme="vaporwave"] .sg-trigger{background:#01CDFE!important;border:2px solid #FF71CE!important;}' +
        '[data-theme="vaporwave"] .chat-send svg,[data-theme="vaporwave"] .sg-trigger svg{stroke:#1A0B2E!important;filter:none!important;}' +
        '[data-theme="vaporwave"] .story-card{border:2px solid #FF71CE!important;box-shadow:0 0 14px rgba(1,205,254,.3)!important;}' +
        '[data-theme="vaporwave"] .story-card.unseen{outline:2px solid #05FFA1;outline-offset:3px;}' +
        '[data-theme="vaporwave"] #tchiloSGSheet,[data-theme="vaporwave"] .sheet{background:#1A0B2E!important;border-color:#FF71CE!important;color:#F0E6FF!important;}' +
        '[data-theme="vaporwave"] .sg-tab{background:#220E3A!important;border:2px solid #01CDFE!important;color:#F0E6FF!important;}' +
        '[data-theme="vaporwave"] .sg-tab.on{background:#FF71CE!important;color:#1A0B2E!important;}' +
        '[data-theme="vaporwave"] .avatar{border:2px solid #01CDFE!important;box-shadow:0 0 10px rgba(255,113,206,.35)!important;}' +
        '[data-theme="vaporwave"] .tag{background:#B967FF!important;color:#fff!important;border:1px solid #01CDFE!important;}'
    }
  };

  function storageKey() {
    try {
      if (typeof THEME_KEY !== "undefined" && THEME_KEY) return THEME_KEY;
    } catch (e) {}
    return THEME_STORAGE;
  }

  function allCodes() {
    return ["classic", "dark", "yellow", "violet", "red"].concat(EXTRA);
  }

  function syncChecks(active) {
    allCodes().forEach(function (code) {
      var el = document.getElementById("theme-check-" + code);
      if (el) el.textContent = active === code ? "✓" : "";
    });
  }

  function ensureFont(t) {
    if (!t.font || document.getElementById(t.fontId)) return;
    var l = document.createElement("link");
    l.id = t.fontId;
    l.rel = "stylesheet";
    l.href = t.font;
    document.head.appendChild(l);
  }

  function ensureCSS(code, t) {
    var id = "tchiloThemeCSS_" + code;
    if (document.getElementById(id)) return;
    var st = document.createElement("style");
    st.id = id;
    var css = t.css || "";
    if (t.titleFont) {
      css = css.replace(
        /\{\[font\]/g,
        "{font-family:" + t.titleFont + ",Inter,sans-serif!important;"
      );
    } else {
      css = css.replace(/\{\[font\]/g, "{");
    }
    st.textContent = css;
    document.head.appendChild(st);
  }

  function applyTheme(code) {
    var t = THEMES[code];
    if (!t) return;
    ensureFont(t);
    ensureCSS(code, t);
    try {
      localStorage.setItem(storageKey(), code);
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", code);
    document.body.setAttribute("data-theme", code);
    var frame = document.getElementById("appFrame");
    if (frame) frame.setAttribute("data-theme", code);
    var label = document.getElementById("currentThemeLabel");
    if (label) label.textContent = t.label;
    syncChecks(code);
  }

  function injectItems() {
    var list = document.querySelector("#screen-settings-theme .settings-list");
    if (!list) return;
    Object.keys(THEMES).forEach(function (code) {
      if (document.getElementById("theme-check-" + code)) return;
      var t = THEMES[code];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "settings-item";
      btn.setAttribute("data-theme-opt", code);
      btn.onclick = function () {
        applyTheme(code);
        try {
          if (typeof showToast === "function") showToast("Tema " + t.label);
        } catch (e) {}
      };
      btn.innerHTML =
        '<div class="theme-swatch" style="background:' +
        t.swatch +
        ';border:2px solid var(--ink,#0B0B0C)"></div>' +
        "<span>" +
        t.label +
        "</span>" +
        '<span id="theme-check-' +
        code +
        '" class="theme-check"></span>';
      list.appendChild(btn);
    });
    var cur = "classic";
    try {
      cur = localStorage.getItem(storageKey()) || "classic";
    } catch (e2) {}
    syncChecks(cur);
  }

  function patchSetAppTheme() {
    if (typeof window.setAppTheme !== "function") return false;
    if (window.setAppTheme.__pack) return true;
    var orig = window.setAppTheme;
    window.setAppTheme = function (theme) {
      if (THEMES[theme]) {
        applyTheme(theme);
        return;
      }
      var r = orig.apply(this, arguments);
      Object.keys(THEMES).forEach(function (c) {
        var el = document.getElementById("theme-check-" + c);
        if (el) el.textContent = "";
      });
      return r;
    };
    window.setAppTheme.__pack = true;
    return true;
  }

  function patchGetAppTheme() {
    if (typeof window.getAppTheme !== "function") return false;
    if (window.getAppTheme.__pack) return true;
    var orig = window.getAppTheme;
    window.getAppTheme = function () {
      try {
        var s = localStorage.getItem(storageKey()) || "";
        if (THEMES[s]) return s;
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    window.getAppTheme.__pack = true;
    return true;
  }

  function patchLabels() {
    try {
      if (!window.THEME_LABELS) return;
      Object.keys(THEMES).forEach(function (c) {
        window.THEME_LABELS[c] = THEMES[c].label;
      });
    } catch (e) {}
  }

  function applyIfStored() {
    try {
      var s = localStorage.getItem(storageKey()) || "";
      if (THEMES[s]) applyTheme(s);
    } catch (e) {}
  }

  // pré-carregar CSS de todos (leve) para troca instantânea
  function preloadAll() {
    Object.keys(THEMES).forEach(function (code) {
      ensureFont(THEMES[code]);
      ensureCSS(code, THEMES[code]);
    });
  }

  function boot() {
    preloadAll();
    patchLabels();
    patchSetAppTheme();
    patchGetAppTheme();
    injectItems();
    applyIfStored();
  }

  setInterval(function () {
    injectItems();
    patchSetAppTheme();
    patchGetAppTheme();
    patchLabels();
  }, 1500);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
})();
