/**
 * tchilo-Pop — Editar perfil + Definições no menu ⋯; limpa botões da página
 */
(function () {
  'use strict';
  if (window.__tchiloProfileMenuFix) return;
  window.__tchiloProfileMenuFix = true;

  function isOwnProfile() {
    try {
      var sess = (typeof getSession === 'function' && getSession()) || window.session || null;
      var me = sess && sess.username ? String(sess.username).toLowerCase() : '';
      var viewing = '';
      try { if (typeof viewingProfileUser !== 'undefined' && viewingProfileUser) viewing = String(viewingProfileUser); } catch (e) {}
      if (!viewing && me) return true;
      return !!(me && viewing && viewing.toLowerCase() === me);
    } catch (e) { return true; }
  }

  function stripProfileButtons() {
    try {
      var actions = document.querySelector('#profileBody .profile-actions');
      if (!actions) return;
      actions.querySelectorAll('button.profile-btn').forEach(function (btn) {
        var t = (btn.textContent || '').trim();
        var oc = btn.getAttribute('onclick') || '';
        if (/Editar perfil/i.test(t) || /editprofile/i.test(oc) || (/Definições/i.test(t) || (/goTo\('settings'\)/i.test(oc) && !/Live/i.test(t)))) {
          btn.remove();
        }
      });
    } catch (e) {}
  }

  function patchSheet() {
    if (typeof window.tchiloOpenProfileShare !== 'function') return;
    if (window.tchiloOpenProfileShare.__menuFix) return;
    var orig = window.tchiloOpenProfileShare;
    window.tchiloOpenProfileShare = function () {
      var r = orig.apply(this, arguments);
      setTimeout(injectMenuItems, 30);
      setTimeout(injectMenuItems, 150);
      return r;
    };
    window.tchiloOpenProfileShare.__menuFix = true;
  }

  function injectMenuItems() {
    var sheet = document.getElementById('tchiloProfileShareSheet');
    if (!sheet) return;
    var panel = sheet.querySelector('.tchilo-ps-panel');
    if (!panel) return;
    if (panel.querySelector('[data-act="edit"]')) return;
    if (!isOwnProfile()) return;

    var title = panel.querySelector('h3');
    if (title) title.textContent = 'Opções';

    function makeOpt(act, label, svg) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'opt';
      btn.setAttribute('data-act', act);
      btn.innerHTML = '<span class="ic">' + svg + '</span><span>' + label + '</span>';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        try { sheet.classList.remove('open'); sheet.remove(); } catch (err) {}
        setTimeout(function () {
          if (typeof goTo === 'function') goTo(act === 'edit' ? 'editprofile' : 'settings');
        }, 60);
      }, true);
      return btn;
    }

    var editSvg = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
    var setSvg = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';

    var editBtn = makeOpt('edit', 'Editar perfil', editSvg);
    var setBtn = makeOpt('settings', 'Definições', setSvg);

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
    try {
      var actions = document.querySelector('#profileBody .profile-actions');
      if (!actions || actions.querySelector('[data-tchilo-live]')) return;
      if (!isOwnProfile()) return;
      if (typeof window.tchiloOpenLiveSetup !== 'function') return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'profile-btn';
      btn.setAttribute('data-tchilo-live', '1');
      btn.textContent = 'Iniciar Live';
      btn.style.background = '#e11d48';
      btn.style.color = '#fff';
      btn.style.borderColor = '#e11d48';
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.tchiloOpenLiveSetup();
      };
      actions.insertBefore(btn, actions.firstChild);
    } catch (e) {}
  }

  function run() {
    stripProfileButtons();
    patchSheet();
    fixLiveInject();
  }

  run();
  [100, 400, 1000, 2000].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(run, 2500);

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__menuFix) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(run, 40);
      setTimeout(run, 200);
      return r;
    };
    window.renderProfile.__menuFix = true;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t) return;
    if (t.id === 'tchiloProfileMoreBtn' || (t.closest && t.closest('#tchiloProfileMoreBtn'))) {
      setTimeout(injectMenuItems, 40);
      setTimeout(injectMenuItems, 160);
    }
  }, true);
})();
