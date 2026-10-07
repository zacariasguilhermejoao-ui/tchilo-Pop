/**
 * tchilo-Pop — menu ⋯ perfil
 * v3 — ícone Definições = engrenagem preta profissional; Live = vermelho
 */
(function () {
  'use strict';
  if (window.__tchiloProfileMenuFixV3) return;
  window.__tchiloProfileMenuFixV3 = true;
  window.__tchiloProfileMenuFixV2 = true;

  /* Engrenagem clássica (settings) — stroke preto via currentColor */
  var GEAR_SVG =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="3"></circle>' +
    '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' +
    '</svg>';

  var EDIT_SVG =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 20h9"></path>' +
    '<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>' +
    '</svg>';

  function injectLiveCss() {
    if (document.getElementById('tchilo-live-red-css')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-live-red-css';
    st.textContent =
      '#profileBody .profile-actions button[data-tchilo-live],' +
      '#profileBody .profile-actions button.profile-btn[data-tchilo-live],' +
      '#profileBody button[data-tchilo-live]{' +
      'background:#e11d48!important;' +
      'background-color:#e11d48!important;' +
      'color:#fff!important;' +
      'border-color:#e11d48!important;' +
      'border:2px solid #e11d48!important;}' +
      /* ícone definições no menu: preto */
      '#tchiloProfileShareSheet .opt[data-act="settings"] .ic,' +
      '#tchiloProfileShareSheet .opt[data-act="settings"] .ic svg{' +
      'color:#0B0B0C!important;stroke:#0B0B0C!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function isOwnProfile() {
    try {
      var sess = (typeof getSession === 'function' && getSession()) || window.session || null;
      var me = sess && sess.username ? String(sess.username).toLowerCase() : '';
      var viewing = '';
      try {
        if (typeof viewingProfileUser !== 'undefined' && viewingProfileUser)
          viewing = String(viewingProfileUser);
      } catch (e) {}
      if (!viewing && me) return true;
      return !!(me && viewing && viewing.toLowerCase() === me);
    } catch (e) {
      return true;
    }
  }

  function stripProfileButtons() {
    try {
      var actions = document.querySelector('#profileBody .profile-actions');
      if (!actions) return;
      actions.querySelectorAll('button.profile-btn').forEach(function (btn) {
        var t = (btn.textContent || '').trim();
        var oc = btn.getAttribute('onclick') || '';
        if (
          /Editar perfil/i.test(t) ||
          /editprofile/i.test(oc) ||
          (/Definições/i.test(t) && !/Live/i.test(t)) ||
          (/goTo\('settings'\)/i.test(oc) && !/Live/i.test(t))
        ) {
          btn.remove();
        }
      });
    } catch (e) {}
  }

  function paintLiveRed() {
    injectLiveCss();
    try {
      document.querySelectorAll('#profileBody [data-tchilo-live], #profileBody .profile-actions button').forEach(function (btn) {
        var t = (btn.textContent || '').trim();
        if (!/Live/i.test(t) && !btn.getAttribute('data-tchilo-live')) return;
        btn.setAttribute('data-tchilo-live', '1');
        btn.style.setProperty('background', '#e11d48', 'important');
        btn.style.setProperty('background-color', '#e11d48', 'important');
        btn.style.setProperty('color', '#fff', 'important');
        btn.style.setProperty('border-color', '#e11d48', 'important');
      });
    } catch (e) {}
  }

  function patchSheet() {
    if (typeof window.tchiloOpenProfileShare !== 'function') return;
    if (window.tchiloOpenProfileShare.__menuFixV3) return;
    var orig = window.tchiloOpenProfileShare;
    window.tchiloOpenProfileShare = function () {
      var r = orig.apply(this, arguments);
      setTimeout(injectMenuItems, 30);
      setTimeout(injectMenuItems, 150);
      return r;
    };
    window.tchiloOpenProfileShare.__menuFixV3 = true;
    window.tchiloOpenProfileShare.__menuFix = true;
  }

  function injectMenuItems() {
    var sheet = document.getElementById('tchiloProfileShareSheet');
    if (!sheet) return;
    var panel = sheet.querySelector('.tchilo-ps-panel');
    if (!panel) return;
    if (!isOwnProfile()) return;

    var title = panel.querySelector('h3');
    if (title) title.textContent = 'Opções';

    /* Atualizar ícone se já existir */
    var existingSet = panel.querySelector('[data-act="settings"]');
    if (existingSet) {
      var ic = existingSet.querySelector('.ic');
      if (ic) ic.innerHTML = GEAR_SVG;
      return;
    }
    if (panel.querySelector('[data-act="edit"]')) return;

    function makeOpt(act, label, svg) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'opt';
      btn.setAttribute('data-act', act);
      btn.innerHTML = '<span class="ic">' + svg + '</span><span>' + label + '</span>';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          sheet.classList.remove('open');
        } catch (err) {}
        if (act === 'edit' && typeof goTo === 'function') goTo('editprofile');
        if (act === 'settings' && typeof goTo === 'function') goTo('settings');
      });
      return btn;
    }

    var editBtn = makeOpt('edit', 'Editar perfil', EDIT_SVG);
    var setBtn = makeOpt('settings', 'Definições', GEAR_SVG);

    var firstOpt = panel.querySelector('.opt');
    if (firstOpt) {
      panel.insertBefore(setBtn, firstOpt);
      panel.insertBefore(editBtn, setBtn);
    } else {
      panel.appendChild(editBtn);
      panel.appendChild(setBtn);
    }
  }

  function fixLiveInject() {
    injectLiveCss();
    try {
      var actions = document.querySelector('#profileBody .profile-actions');
      if (!actions) return;
      if (!isOwnProfile()) return;

      var existing = actions.querySelector('[data-tchilo-live]');
      if (existing) {
        paintLiveRed();
        return;
      }
      if (typeof window.tchiloOpenLiveSetup !== 'function') return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'profile-btn';
      btn.setAttribute('data-tchilo-live', '1');
      btn.textContent = 'Iniciar Live';
      btn.style.setProperty('background', '#e11d48', 'important');
      btn.style.setProperty('color', '#fff', 'important');
      btn.style.setProperty('border-color', '#e11d48', 'important');
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.tchiloOpenLiveSetup();
      };
      actions.insertBefore(btn, actions.firstChild);
      paintLiveRed();
    } catch (e) {}
  }

  function run() {
    injectLiveCss();
    stripProfileButtons();
    patchSheet();
    fixLiveInject();
    paintLiveRed();
  }

  run();
  [100, 500, 1200].forEach(function (ms) {
    setTimeout(run, ms);
  });

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__menuFixV3) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(run, 40);
      return r;
    };
    window.renderProfile.__menuFixV3 = true;
  }

  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t) return;
      if (t.id === 'tchiloProfileMoreBtn' || (t.closest && t.closest('#tchiloProfileMoreBtn'))) {
        setTimeout(injectMenuItems, 40);
        setTimeout(injectMenuItems, 160);
      }
    },
    true
  );
})();
