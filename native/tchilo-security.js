/**
 * Tchilo — reforço de segurança no cliente
 * - Meta CSP básica (complementa headers do servidor)
 * - Reduz risco de clickjacking
 * - Não grava passwords; limpa restos sensíveis
 * - Avisa se a página não está em HTTPS
 */
(function () {
  'use strict';

  function addMeta(httpEquiv, content) {
    if (!document.head) return;
    if (document.querySelector('meta[http-equiv="' + httpEquiv + '"]')) return;
    var m = document.createElement('meta');
    m.httpEquiv = httpEquiv;
    m.content = content;
    document.head.appendChild(m);
  }

  /* Clickjacking */
  try {
    if (window.top !== window.self) {
      /* se for embutido noutro site suspeito, sair do frame */
      try {
        window.top.location = window.location.href;
      } catch (e) {
        document.body.innerHTML = '';
      }
    }
  } catch (e) {}

  addMeta('X-Content-Type-Options', 'nosniff');

  /* CSP permissiva o suficiente para a SPA + Supabase + Paddle; ajusta se quebrares recursos */
  var csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self' https://*.paddle.com https://buy.paddle.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.supabase.co https://*.paddle.com https://cdn.paddle.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.paddle.com https://api.paddle.com https://tchilopop.com",
    "frame-src 'self' https://*.paddle.com https://buy.paddle.com",
    "upgrade-insecure-requests"
  ].join('; ');

  try {
    addMeta('Content-Security-Policy', csp);
  } catch (e) {}

  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    console.warn('[Tchilo Security] Usa sempre HTTPS.');
  }

  /* Não deixar passwords em memória de campos ao sair */
  window.addEventListener('pagehide', function () {
    try {
      document.querySelectorAll('input[type="password"]').forEach(function (el) {
        el.value = '';
      });
    } catch (e) {}
  });

  /* Bloquear consola em produção? (opcional — comentado para não atrapalhar debug)
  if (location.hostname === 'tchilopop.com') {
    // noop
  }
  */

  window.TchiloSecurity = {
    version: 1,
    csp: csp
  };
})();
