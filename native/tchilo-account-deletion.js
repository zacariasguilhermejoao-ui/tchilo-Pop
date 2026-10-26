/**
 * Tchilo — eliminar conta com apagamento automático ao fim de 30 dias.
 * - tchiloRequestAccountDeletion(motivo): regista o pedido no Supabase (função request_account_deletion)
 * - tchiloCloudSignOut(): termina a sessão na nuvem
 * - Ao voltar a iniciar sessão dentro dos 30 dias, pergunta se queres cancelar a eliminação
 * Ver supabase/sql/account-deletion.sql e supabase/functions/purge-deleted-accounts.
 */
(function () {
  'use strict';
  if (window.__tchiloAccountDeletion) return;
  window.__tchiloAccountDeletion = true;

  var DAYS = 30;
  function sb() { return window.tchiloSupabase || null; }
  function toast(m) { try { if (typeof showToast === 'function') showToast(m); } catch (e) {} }

  window.tchiloRequestAccountDeletion = async function (reason) {
    var c = sb();
    if (!c || !c.rpc) return { ok: false, error: 'offline' };
    try {
      var r = await c.rpc('request_account_deletion', { p_reason: String(reason || '').slice(0, 200) });
      if (r && r.error) return { ok: false, error: r.error.message || 'erro' };
      return { ok: true, at: r && r.data };
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) };
    }
  };

  window.tchiloCloudSignOut = async function () {
    var c = sb();
    try { if (c && c.auth) await c.auth.signOut(); } catch (e) {}
  };

  var checking = false;
  async function checkPending() {
    var c = sb();
    if (!c || !c.rpc || checking) return;
    checking = true;
    try {
      var r = await c.rpc('get_account_deletion');
      var at = r && !r.error ? r.data : null;
      if (!at) return;
      var end = new Date(new Date(at).getTime() + DAYS * 86400000);
      var when = end.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
      var keep = true;
      if (typeof tchiloConfirm === 'function') {
        keep = await tchiloConfirm({
          title: 'Conta marcada para eliminação',
          message: 'Os teus dados serão apagados a ' + when + '. Queres cancelar a eliminação e manter a conta?',
          confirmText: 'Manter a conta',
          cancelText: 'Continuar a eliminar'
        });
      }
      if (keep) {
        await c.rpc('cancel_account_deletion');
        toast('Eliminação cancelada');
      } else {
        await window.tchiloCloudSignOut();
        try { if (typeof clearSession === 'function') clearSession(); } catch (e) {}
        try { if (typeof showLoginGate === 'function') showLoginGate(); } catch (e) {}
      }
    } catch (e) {
      /* sem ligação: tenta na próxima vez */
    } finally {
      checking = false;
    }
  }

  function hook() {
    var c = sb();
    if (!c || !c.auth || typeof c.auth.onAuthStateChange !== 'function') return false;
    c.auth.onAuthStateChange(function (ev) {
      if (ev === 'SIGNED_IN' || ev === 'INITIAL_SESSION') setTimeout(checkPending, 800);
    });
    return true;
  }
  var tries = 0;
  (function wait() {
    if (hook() || ++tries > 40) return;
    setTimeout(wait, 500);
  })();
})();
