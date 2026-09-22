/**
 * tchilo-Pop — depois de mudares o nome do perfil, esperas 1 semana
 */
(function () {
  "use strict";

  var COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
  var KEY_PREFIX = "tchilo_name_changed_at_";

  function uid() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && (s.id || s.user_id)) return String(s.id || s.user_id);
        if (s && s.username) return "u_" + String(s.username).toLowerCase();
      }
    } catch (e) {}
    return "anon";
  }

  function storageKey() {
    return KEY_PREFIX + uid();
  }

  function getLastChangeAt() {
    try {
      var v = localStorage.getItem(storageKey());
      if (v) return parseInt(v, 10) || 0;
    } catch (e) {}
    return 0;
  }

  function setLastChangeAt(ts) {
    try {
      localStorage.setItem(storageKey(), String(ts || Date.now()));
    } catch (e) {}
  }

  function remainingMs() {
    var last = getLastChangeAt();
    if (!last) return 0;
    var left = last + COOLDOWN_MS - Date.now();
    return left > 0 ? left : 0;
  }

  function canChangeName() {
    return remainingMs() <= 0;
  }

  function formatLeft(ms) {
    if (ms <= 0) return "";
    var days = Math.ceil(ms / (24 * 60 * 60 * 1000));
    if (days >= 2) return days + " dias";
    var hours = Math.ceil(ms / (60 * 60 * 1000));
    if (hours >= 2) return hours + " horas";
    var mins = Math.max(1, Math.ceil(ms / (60 * 1000)));
    return mins + " min";
  }

  function toast(msg) {
    try {
      if (typeof showToast === "function") showToast(msg);
      else alert(msg);
    } catch (e) {
      alert(msg);
    }
  }

  function ensureHint() {
    var form = document.getElementById("editProfileForm");
    if (!form) return;
    var hint = document.getElementById("tchiloNameCooldownHint");
    if (!hint) {
      hint = document.createElement("p");
      hint.id = "tchiloNameCooldownHint";
      hint.style.cssText =
        "margin:8px 0 12px;padding:10px 12px;border:2px solid var(--ink,#0B0B0C);border-radius:12px;background:#f1ecff;font:700 12px Inter,system-ui,sans-serif;line-height:1.35";
      var dn = document.getElementById("editDisplayName");
      if (dn && dn.parentNode) {
        if (dn.nextSibling) dn.parentNode.insertBefore(hint, dn.nextSibling);
        else dn.parentNode.appendChild(hint);
      } else {
        form.insertBefore(hint, form.firstChild);
      }
    }
    var left = remainingMs();
    if (left > 0) {
      hint.textContent =
        "O nome do perfil so pode ser alterado de 7 em 7 dias. Faltam " +
        formatLeft(left) +
        ".";
      hint.style.display = "block";
      var input = document.getElementById("editDisplayName");
      if (input) {
        input.setAttribute("data-locked", "1");
        input.title = "Aguarda " + formatLeft(left) + " para mudar o nome";
      }
    } else {
      hint.textContent =
        "Depois de mudares o nome do perfil, tens de esperar 1 semana para o voltares a alterar.";
      hint.style.display = "block";
      var input2 = document.getElementById("editDisplayName");
      if (input2) {
        input2.removeAttribute("data-locked");
        input2.title = "";
      }
    }
  }

  function currentDisplayName() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && s.displayName) return String(s.displayName).trim();
        if (s && s.username) return String(s.username).trim();
      }
    } catch (e) {}
    return "";
  }

  function patchSaveProfile() {
    if (typeof window.saveProfile !== "function" || window.saveProfile.__nameCd) return;
    var orig = window.saveProfile;
    window.saveProfile = async function () {
      var input = document.getElementById("editDisplayName");
      var next = input ? (input.value || "").trim() : "";
      var prev = currentDisplayName();
      var nameChanging = next && prev && next.toLowerCase() !== prev.toLowerCase();

      if (nameChanging && !canChangeName()) {
        toast(
          "So podes mudar o nome do perfil de 7 em 7 dias. Faltam " +
            formatLeft(remainingMs()) +
            "."
        );
        ensureHint();
        return;
      }

      var result = await orig.apply(this, arguments);

      // se o nome mudou e gravou, regista a data
      try {
        var after = currentDisplayName();
        if (nameChanging || (next && after && next.toLowerCase() === after.toLowerCase() && next.toLowerCase() !== prev.toLowerCase())) {
          setLastChangeAt(Date.now());
          // opcional: Supabase
          try {
            var SB = window.SB || window.tchiloSupabase;
            var id = null;
            if (typeof getSession === "function") {
              var s = getSession();
              id = s && (s.id || s.user_id);
            }
            if (SB && id) {
              SB.from("profiles")
                .update({ display_name_changed_at: new Date().toISOString() })
                .eq("id", id)
                .then(function () {})
                .catch(function () {});
            }
          } catch (e2) {}
          ensureHint();
        }
      } catch (e3) {}

      return result;
    };
    window.saveProfile.__nameCd = true;
  }

  function patchLoadForm() {
    if (typeof window.loadEditProfileForm !== "function" || window.loadEditProfileForm.__nameCd) return;
    var orig = window.loadEditProfileForm;
    window.loadEditProfileForm = function () {
      var r = orig.apply(this, arguments);
      setTimeout(ensureHint, 0);
      setTimeout(ensureHint, 100);
      return r;
    };
    window.loadEditProfileForm.__nameCd = true;
  }

  async function syncFromCloud() {
    try {
      var SB = window.SB || window.tchiloSupabase;
      if (!SB || typeof getSession !== "function") return;
      var s = getSession();
      var id = s && (s.id || s.user_id);
      if (!id) return;
      var res = await SB.from("profiles")
        .select("display_name_changed_at")
        .eq("id", id)
        .maybeSingle();
      var row = res && res.data;
      if (row && row.display_name_changed_at) {
        var ts = Date.parse(row.display_name_changed_at);
        if (ts && ts > getLastChangeAt()) setLastChangeAt(ts);
      }
    } catch (e) {}
  }

  window.tchiloNameCooldown = {
    canChange: canChangeName,
    remainingMs: remainingMs,
    formatLeft: formatLeft
  };

  function boot() {
    patchSaveProfile();
    patchLoadForm();
    ensureHint();
    syncFromCloud().then(ensureHint);
  }

  setInterval(function () {
    patchSaveProfile();
    patchLoadForm();
  }, 1500);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();
