/**
 * Tchilo — Sugestões por localização + contactos
 *
 * 1) Localização automática (país/cidade do perfil + opcional GPS)
 * 2) Contact Picker API: pedir contactos e cruzar com contas Tchilo (email/telefone)
 *
 * Requer no Supabase (profiles):
 *   country text, city text, phone_hash text (opcional),
 *   email já existe via auth / profiles se exposto
 *
 * Uso: incluir este script DEPOIS do index principal, ou injectar no boot.
 * Expõe: window.TchiloSuggest
 */
(function () {
  'use strict';

  var SB = function () { return window.tchiloSupabase || null; };
  var KEY_LOC = 'tchilo_user_location_v1';
  var KEY_CONTACTS_OPT = 'tchilo_contacts_suggest_opt_v1';

  function getSession() {
    try {
      if (typeof window.getSession === 'function') return window.getSession();
    } catch (e) {}
    return null;
  }

  function normalizePhone(t) {
    if (!t) return '';
    return String(t).replace(/\D+/g, '').replace(/^00/, '');
  }

  function normalizeEmail(e) {
    return String(e || '').trim().toLowerCase();
  }

  function normalizePlace(s) {
    return String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  async function sha256Hex(str) {
    if (!window.crypto || !crypto.subtle) return null;
    var data = new TextEncoder().encode(String(str));
    var buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  /* ---------- Localização ---------- */

  function loadSavedLocation() {
    try {
      return JSON.parse(localStorage.getItem(KEY_LOC) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveLocalLocation(loc) {
    try {
      localStorage.setItem(KEY_LOC, JSON.stringify(loc));
    } catch (e) {}
  }

  /** Guarda país/cidade no perfil Supabase (se colunas existirem). */
  async function persistProfileLocation(loc) {
    var session = getSession();
    var client = SB();
    if (!session || !session.id || !client || !loc) return false;
    var payload = {};
    if (loc.country) payload.country = String(loc.country).slice(0, 80);
    if (loc.city) payload.city = String(loc.city).slice(0, 80);
    if (!Object.keys(payload).length) return false;
    try {
      var r = await client.from('profiles').update(payload).eq('id', session.id);
      return !r.error;
    } catch (e) {
      console.warn('TchiloSuggest persist location:', e);
      return false;
    }
  }

  /**
   * Detecta localização:
   * 1) País do signup / perfil
   * 2) Geolocation API (cidade aproximada via reverse geocode opcional — aqui só coords)
   * 3) Timezone como fallback fraco
   */
  async function detectAndSaveLocation(opts) {
    opts = opts || {};
    var session = getSession();
    var loc = loadSavedLocation() || {};

    if (opts.country) loc.country = opts.country;
    if (opts.city) loc.city = opts.city;

    if (!loc.country && session) {
      try {
        var client = SB();
        if (client) {
          var pr = await client
            .from('profiles')
            .select('country,city')
            .eq('id', session.id)
            .maybeSingle();
          if (pr && pr.data) {
            if (pr.data.country) loc.country = pr.data.country;
            if (pr.data.city) loc.city = pr.data.city;
          }
        }
      } catch (e) {}
    }

    if (opts.askGps && navigator.geolocation) {
      try {
        var pos = await new Promise(function (resolve, reject) {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 12000,
            maximumAge: 600000
          });
        });
        loc.lat = pos.coords.latitude;
        loc.lng = pos.coords.longitude;
        loc.source = 'gps';
      } catch (e) {
        /* utilizador recusou GPS — ok */
      }
    }

    if (!loc.country && typeof Intl !== 'undefined') {
      try {
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        /* fallback fraco: África/Luanda -> Angola, etc. */
        if (/Luanda|Angola/i.test(tz)) loc.country = loc.country || 'Angola';
        if (/Lisbon|Portugal/i.test(tz)) loc.country = loc.country || 'Portugal';
        if (/Maputo|Mozambique/i.test(tz)) loc.country = loc.country || 'Moçambique';
        if (/Sao_Paulo|Brazil/i.test(tz)) loc.country = loc.country || 'Brasil';
      } catch (e) {}
    }

    loc.updatedAt = Date.now();
    saveLocalLocation(loc);
    await persistProfileLocation(loc);
    return loc;
  }

  /** Busca perfis públicos na mesma localização. */
  async function fetchPeopleSameLocation(limit) {
    limit = limit || 20;
    var session = getSession();
    var client = SB();
    var loc = loadSavedLocation() || {};
    if (!client || !session) return [];

    var me = session.id;
    var results = [];
    var seen = {};

    async function queryBy(field, value) {
      if (!value) return;
      try {
        var q = await client
          .from('profiles')
          .select('id,username,display_name,avatar_url,country,city,is_private')
          .eq(field, value)
          .neq('id', me)
          .eq('is_private', false)
          .limit(limit);
        (q.data || []).forEach(function (p) {
          if (!p.username || seen[p.username]) return;
          seen[p.username] = 1;
          results.push({
            id: p.id,
            username: p.username,
            displayName: p.display_name || p.username,
            avatar: p.avatar_url || null,
            reason: 'nearby',
            label: 'Perto de ti',
            country: p.country || null,
            city: p.city || null
          });
        });
      } catch (e) {
        console.warn('TchiloSuggest location query:', e);
      }
    }

    if (loc.city) await queryBy('city', loc.city);
    if (results.length < limit && loc.country) await queryBy('country', loc.country);

    return results.slice(0, limit);
  }

  /* ---------- Contactos ---------- */

  function contactsApiSupported() {
    return !!(navigator.contacts && typeof navigator.contacts.select === 'function');
  }

  /**
   * Pede permissão via Contact Picker (Chrome Android / alguns WebViews).
   * O utilizador escolhe quais contactos partilhar — não há leitura silenciosa.
   */
  async function pickContacts() {
    if (!contactsApiSupported()) {
      return { ok: false, error: 'unsupported', message: 'Contactos não suportados neste dispositivo. Usa Chrome no Android ou a app nativa.' };
    }
    try {
      var props = await navigator.contacts.getProperties();
      var want = ['name', 'email', 'tel'].filter(function (p) {
        return props.indexOf(p) >= 0;
      });
      if (!want.length) {
        return { ok: false, error: 'no_props', message: 'Este sistema não partilha email/telefone dos contactos.' };
      }
      var selected = await navigator.contacts.select(want, { multiple: true });
      try {
        localStorage.setItem(KEY_CONTACTS_OPT, '1');
      } catch (e) {}
      return { ok: true, contacts: selected || [] };
    } catch (e) {
      /* cancelado ou negado */
      return { ok: false, error: 'denied', message: (e && e.message) || 'Permissão de contactos recusada.' };
    }
  }

  /**
   * Cruza contactos com perfis Tchilo.
   * Preferência: match por email (coluna profiles.email se existir / auth).
   * Opcional: phone_hash (hash SHA-256 do número normalizado) — nunca grava telefone em claro.
   */
  async function matchContactsOnTchilo(contacts) {
    var client = SB();
    var session = getSession();
    if (!client || !contacts || !contacts.length) return [];

    var emails = [];
    var phoneHashes = [];
    var i, c, j;

    for (i = 0; i < contacts.length; i++) {
      c = contacts[i];
      var ems = c.email || [];
      if (!Array.isArray(ems)) ems = ems ? [ems] : [];
      for (j = 0; j < ems.length; j++) {
        var e = normalizeEmail(ems[j]);
        if (e && emails.indexOf(e) < 0) emails.push(e);
      }
      var tels = c.tel || [];
      if (!Array.isArray(tels)) tels = tels ? [tels] : [];
      for (j = 0; j < tels.length; j++) {
        var ph = normalizePhone(tels[j]);
        if (ph.length >= 8) {
          var h = await sha256Hex(ph);
          if (h && phoneHashes.indexOf(h) < 0) phoneHashes.push(h);
          /* também últimos 9 dígitos (variação de prefixo país) */
          if (ph.length > 9) {
            var h2 = await sha256Hex(ph.slice(-9));
            if (h2 && phoneHashes.indexOf(h2) < 0) phoneHashes.push(h2);
          }
        }
      }
    }

    var found = [];
    var seenU = {};

    function pushProf(p, reason) {
      if (!p || !p.username || seenU[p.username]) return;
      if (session && (p.id === session.id || p.username === session.username)) return;
      seenU[p.username] = 1;
      found.push({
        id: p.id,
        username: p.username,
        displayName: p.display_name || p.username,
        avatar: p.avatar_url || null,
        reason: reason,
        label: 'Nos teus contactos'
      });
    }

    /* Match por email — só funciona se profiles.email existir e estiver preenchido */
    if (emails.length) {
      try {
        var batch = emails.slice(0, 50);
        var r = await client
          .from('profiles')
          .select('id,username,display_name,avatar_url,email,is_private')
          .in('email', batch)
          .eq('is_private', false);
        (r.data || []).forEach(function (p) {
          pushProf(p, 'contact_email');
        });
      } catch (e) {
        /* coluna email pode não existir */
        console.warn('TchiloSuggest email match:', e);
      }
    }

    if (phoneHashes.length) {
      try {
        var batchH = phoneHashes.slice(0, 50);
        var r2 = await client
          .from('profiles')
          .select('id,username,display_name,avatar_url,phone_hash,is_private')
          .in('phone_hash', batchH)
          .eq('is_private', false);
        (r2.data || []).forEach(function (p) {
          pushProf(p, 'contact_phone');
        });
      } catch (e) {
        console.warn('TchiloSuggest phone match:', e);
      }
    }

    return found;
  }

  /**
   * O utilizador atual pode guardar hash do próprio telefone (opcional, nas definições)
   * para amigos o encontrarem.
   */
  async function setMyPhoneForMatching(phoneRaw) {
    var session = getSession();
    var client = SB();
    if (!session || !session.id || !client) return { ok: false };
    var ph = normalizePhone(phoneRaw);
    if (ph.length < 8) return { ok: false, error: 'invalid' };
    var h = await sha256Hex(ph);
    if (!h) return { ok: false, error: 'crypto' };
    try {
      var r = await client.from('profiles').update({ phone_hash: h }).eq('id', session.id);
      if (r.error) return { ok: false, error: r.error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  /* ---------- Integração com getSuggestedPeople ---------- */

  function toCardShape(p) {
    var colors = ['var(--mint)', 'var(--pink)', 'var(--yellow)', 'var(--violet)', '#9ED7FF', '#FFB36B'];
    var name = p.displayName || p.username;
    return {
      username: p.username,
      initials: String(name).slice(0, 2).toUpperCase(),
      color: colors[Math.abs(String(p.username).length) % colors.length],
      displayName: name,
      avatar: p.avatar || null,
      reason: p.reason || 'suggest',
      label: p.label || 'Sugerido para ti'
    };
  }

  /**
   * Lista completa: contactos (se já opt-in) + mesma localização + fallback antigo.
   */
  async function getEnhancedSuggestions(opts) {
    opts = opts || {};
    var out = [];
    var seen = {};

    function addAll(list) {
      (list || []).forEach(function (p) {
        if (!p || !p.username || seen[p.username]) return;
        if (typeof window.isFollowing === 'function' && window.isFollowing(p.username)) return;
        if (typeof window.getBlocked === 'function') {
          var bl = window.getBlocked() || [];
          if (bl.indexOf(p.username) >= 0) return;
        }
        seen[p.username] = 1;
        out.push(toCardShape(p));
      });
    }

    /* Contactos: só se o user já tiver optado (KEY) e passar contacts no opts */
    if (opts.contacts && opts.contacts.length) {
      var matched = await matchContactsOnTchilo(opts.contacts);
      addAll(matched);
    }

    var near = await fetchPeopleSameLocation(16);
    addAll(near);

    /* Fallback: função original da app */
    if (typeof window.getSuggestedPeople === 'function' && window.getSuggestedPeople._tchiloOriginal) {
      addAll(
        (window.getSuggestedPeople._tchiloOriginal() || []).map(function (p) {
          return {
            username: p.username,
            displayName: p.username,
            reason: 'feed',
            label: 'Sugerido para ti'
          };
        })
      );
    } else if (typeof window.getSuggestedPeople === 'function') {
      addAll(
        (window.getSuggestedPeople() || []).map(function (p) {
          return {
            username: p.username,
            displayName: p.username,
            reason: 'feed',
            label: 'Sugerido para ti'
          };
        })
      );
    }

    return out.slice(0, opts.limit || 24);
  }

  /**
   * Monkey-patch opcional: substitui getSuggestedPeople por versão async-aware
   * (mantém sync API devolvendo cache).
   */
  var _cache = [];
  var _cacheAt = 0;

  function installPatch() {
    if (typeof window.getSuggestedPeople !== 'function') return;
    if (window.getSuggestedPeople._tchiloEnhanced) return;

    var original = window.getSuggestedPeople;
    window.getSuggestedPeople._tchiloOriginal = original;

    window.getSuggestedPeople = function () {
      if (_cache.length && Date.now() - _cacheAt < 120000) return _cache;
      /* sync fallback imediato */
      return original();
    };
    window.getSuggestedPeople._tchiloEnhanced = true;

    /* refresh em background */
    refreshSuggestionsCache();
  }

  async function refreshSuggestionsCache() {
    try {
      await detectAndSaveLocation({ askGps: false });
      _cache = await getEnhancedSuggestions({ limit: 24 });
      _cacheAt = Date.now();
      if (typeof window.renderSuggestPanel === 'function') {
        try {
          window.renderSuggestPanel();
        } catch (e) {}
      }
      if (typeof window.renderSuggestions === 'function') {
        try {
          window.renderSuggestions();
        } catch (e) {}
      }
    } catch (e) {
      console.warn('TchiloSuggest refresh:', e);
    }
  }

  /**
   * Fluxo UI: botão "Encontrar nos contactos"
   */
  async function suggestFromContactsUI() {
    var picked = await pickContacts();
    if (!picked.ok) {
      return picked;
    }
    var matched = await matchContactsOnTchilo(picked.contacts);
    var cards = matched.map(toCardShape);
    /* merge no cache */
    var seen = {};
    _cache = cards.concat(_cache).filter(function (p) {
      if (seen[p.username]) return false;
      seen[p.username] = 1;
      return true;
    });
    _cacheAt = Date.now();
    if (typeof window.renderSuggestPanel === 'function') window.renderSuggestPanel();
    return { ok: true, people: cards, count: cards.length };
  }

  function injectContactsButton() {
    var panel = document.getElementById('friendsList');
    if (!panel || document.getElementById('tchiloContactsSuggestBtn')) return;
    if (!contactsApiSupported()) return;

    var bar = document.createElement('div');
    bar.id = 'tchiloContactsSuggestBar';
    bar.style.cssText = 'padding:12px 18px 4px;';
    bar.innerHTML =
      '<button id="tchiloContactsSuggestBtn" type="button" style="width:100%;padding:12px 16px;border-radius:12px;border:0;background:var(--violet,#6c5ce7);color:#fff;font-weight:600;font-size:14px;cursor:pointer">' +
      'Encontrar amigos nos contactos' +
      '</button>' +
      '<p style="margin:8px 0 0;font-size:12px;color:var(--muted,#888);line-height:1.4">' +
      'Pedimos permissão para ver contactos que escolheres. Só usamos email/telefone para encontrar quem já está no Tchilo.' +
      '</p>';
    panel.parentNode.insertBefore(bar, panel);

    document.getElementById('tchiloContactsSuggestBtn').addEventListener('click', async function () {
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'A abrir contactos…';
      var res = await suggestFromContactsUI();
      btn.disabled = false;
      if (!res.ok) {
        btn.textContent = 'Encontrar amigos nos contactos';
        alert(res.message || 'Não foi possível aceder aos contactos.');
        return;
      }
      btn.textContent =
        res.count > 0
          ? 'Encontrámos ' + res.count + ' no Tchilo — tocar de novo'
          : 'Nenhum contacto no Tchilo — tentar de novo';
    });
  }

  /* boot */
  function boot() {
    installPatch();
    detectAndSaveLocation({ askGps: false }).then(function () {
      return refreshSuggestionsCache();
    });
    /* injeta botão quando o ecrã de sugestões abre */
    var obs = new MutationObserver(function () {
      if (document.getElementById('friendsList')) injectContactsButton();
    });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(injectContactsButton, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 800);
  }

  window.TchiloSuggest = {
    detectAndSaveLocation: detectAndSaveLocation,
    fetchPeopleSameLocation: fetchPeopleSameLocation,
    pickContacts: pickContacts,
    matchContactsOnTchilo: matchContactsOnTchilo,
    suggestFromContactsUI: suggestFromContactsUI,
    setMyPhoneForMatching: setMyPhoneForMatching,
    getEnhancedSuggestions: getEnhancedSuggestions,
    refresh: refreshSuggestionsCache,
    contactsApiSupported: contactsApiSupported
  };
})();
