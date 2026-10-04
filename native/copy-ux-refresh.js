/**
 * Tchilo — UX Writing refresh
 * Substitui copy de "demo / IA / protótipo" por linguagem de produto real
 * (nível Instagram / Meta Content Design)
 */
(function () {
  'use strict';
  if (window.__tchiloCopyUxV1) return;
  window.__tchiloCopyUxV1 = true;

  /* Pares: texto antigo → texto novo (ordem: strings mais longas primeiro) */
  var PAIRS = [
    /* —— Legal / privacidade (resto de demo) —— */
    [
      'Não vendemos os teus dados. Em versões futuras com servidor, o conteúdo público do perfil e posts pode ser visível a outros utilizadores.',
      'Não vendemos os teus dados. O conteúdo que defines como público (perfil e publicações) pode ser visto por outros utilizadores do Tchilo.'
    ],
    [
      'Nesta demo, tudo permanece no browser. Podes apagar os dados limpando o armazenamento do site ou terminando sessão e removendo dados do browser.',
      'Os dados da conta e o conteúdo principal ficam associados à tua sessão e sincronizam de forma segura. Podes eliminar a conta ou o conteúdo nas definições, ou pedir-nos ajuda em privacidade@tchilopop.com.'
    ],
    [
      'Para eliminar a conta nesta demo, limpa os dados do browser ou contacta o suporte.',
      'Para eliminar a conta, usa as definições ou contacta suporte@tchilopop.com.'
    ],
    [
      'Usamos localStorage para sessão, posts e preferências. Não usamos cookies de tracking de terceiros nesta versão.',
      'Usamos armazenamento no dispositivo para manter a sessão e as tuas preferências. Não usamos cookies de publicidade de terceiros para te seguir noutros sites.'
    ],
    [
      'A app é fornecida “tal como está”. Não garantimos disponibilidade ininterrupta. Não somos responsáveis por danos indiretos resultantes do uso da plataforma.',
      'Fazemos o possível para manter o Tchilo estável e disponível. Na medida permitida por lei, a responsabilidade por danos indiretos está limitada.'
    ],
    [
      'Protótipo web com feed, stories, reels, mensagens, explorar e definições completas.',
      'Rede social para partilhar fotos e vídeos, stories, reels e mensagens — tchilopop.com'
    ],

    /* —— Empty states —— */
    ['Nada para explorar', 'Explora o Tchilo'],
    ['Publica ou segue pessoas', 'Segue contas ou publica algo para começar a ver conteúdo aqui.'],
    ['Lista vazia', 'Ainda vazio'],
    ['Ainda não há ninguém aqui.', 'Quando seguires pessoas, elas aparecem aqui.'],
    ['Nenhuma playlist', 'Sem playlists'],
    ['Cria uma playlist para organizar os teus conteúdos guardados.', 'Cria uma playlist para organizar o que guardaste.'],
    ['Nada guardado aqui', 'Ainda não guardaste nada'],
    ['Usa o botão de guardar numa publicação ou vídeo para o veres nesta área.', 'Toca em Guardar numa publicação para a veres aqui.'],
    ['Playlist vazia', 'Esta playlist está vazia'],
    ['Adiciona conteúdos guardados a esta playlist.', 'Adiciona publicações guardadas a esta playlist.'],
    ['Ainda sem posts', 'Ainda sem publicações'],
    ['Publica algo com o +', 'Toca em + para publicar a primeira.'],
    ['Sem resultados', 'Sem resultados'],
    ['Tenta outro termo', 'Tenta outro nome ou hashtag.'],
    ['Escreve um nome ou #hashtag', 'Procura pessoas ou #hashtags'],

    /* —— Mensagens / notificações (i18n awkward) —— */
    [
      'As tuas conversas aparecerão aqui quando pessoas reais te enviarem mensagens.',
      'Quando alguém te enviar uma mensagem, a conversa aparece aqui.'
    ],
    [
      'As notificações aparecerão aqui quando houver atividade real na tua conta.',
      'Likes, comentários e novos seguidores aparecem aqui.'
    ],
    ['Sem mensagens', 'Sem mensagens'],
    ['Sem notificações', 'Sem notificações'],
    ['Sem comentários', 'Ainda sem comentários'],

    /* —— Toasts / onboarding —— */
    ['Sessão terminada.', 'Sessão terminada'],
    ['Email de recuperação enviado', 'Enviámos um email para recuperares a palavra-passe'],
    ['Palavra-passe atualizada com sucesso!', 'Palavra-passe atualizada'],
    ['Email de confirmação reenviado.', 'Email de confirmação reenviado'],
    ['Verifica o teu email para continuar.', 'Confirma o email para continuares'],
    ['Conta criada! Bem-vindo/a, ', 'Conta criada. Bem-vindo ao Tchilo, '],
    ['Obrigado! Premium em ativação', 'Premium a ser ativado'],
    ['A abrir pagamento…', 'A abrir pagamento'],
    ['Erro ao abrir pagamento', 'Não foi possível abrir o pagamento'],
    ['Erro ao abrir o pagamento', 'Não foi possível abrir o pagamento'],
    ['Inicia sessão primeiro', 'Inicia sessão para continuar'],

    /* —— Placeholders —— */
    ['Escreve a legenda… usa #hashtags', 'Escreve uma legenda…'],
    ['Texto grande (ex: EPIC NIGHT)', 'Título (opcional)'],
    ['Texto grande (ex: BOA VIBE)', 'Título (opcional)'],
    ['Escreve algo para o teu Story…', 'O que queres partilhar?'],
    ['Procurar pessoas, tags ou posts…', 'Pesquisar'],
    ['Escreve um comentário…', 'Adiciona um comentário…'],
    ['Mensagem…', 'Mensagem'],
    ['Como apareces no perfil', 'Nome de apresentação'],
    ['Conta algo sobre ti', 'Bio'],
    ['ex: Lisboa', 'Cidade'],

    /* —— Settings / product —— */
    ['Mostra autenticidade no perfil e no feed', 'Confirma a autenticidade da tua conta'],
    ['Mais temas, figurinhas e recursos exclusivos', 'Temas, figurinhas e personalização extra'],
    ['Agora não', 'Mais tarde'],
    ['Pagar Premium', 'Ativar Premium'],
    ['Obter selo verificado', 'Obter selo verificado'],

    /* —— Login / signup residual —— */
    ['Li e aceito os ', 'Aceito os '],
  ];

  function applyTextNode(node) {
    if (!node || node.nodeType !== 3) return;
    var t = node.nodeValue;
    if (!t || !t.trim()) return;
    var next = t;
    for (var i = 0; i < PAIRS.length; i++) {
      if (next.indexOf(PAIRS[i][0]) !== -1) {
        next = next.split(PAIRS[i][0]).join(PAIRS[i][1]);
      }
    }
    if (next !== t) node.nodeValue = next;
  }

  function walk(root) {
    if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) applyTextNode(n);
  }

  function fixAttributes(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('[placeholder]').forEach(function (el) {
      var ph = el.getAttribute('placeholder') || '';
      var next = ph;
      for (var i = 0; i < PAIRS.length; i++) {
        if (next.indexOf(PAIRS[i][0]) !== -1) next = next.split(PAIRS[i][0]).join(PAIRS[i][1]);
      }
      if (next !== ph) el.setAttribute('placeholder', next);
    });
  }

  function fixI18nDict() {
    try {
      if (typeof window.I18N !== 'object' || !window.I18N) return;
      Object.keys(window.I18N).forEach(function (lang) {
        var dict = window.I18N[lang];
        if (!dict || typeof dict !== 'object') return;
        Object.keys(dict).forEach(function (k) {
          var v = dict[k];
          if (typeof v !== 'string') return;
          var next = v;
          for (var i = 0; i < PAIRS.length; i++) {
            if (next.indexOf(PAIRS[i][0]) !== -1) next = next.split(PAIRS[i][0]).join(PAIRS[i][1]);
            if (k.indexOf(PAIRS[i][0]) !== -1) {
              /* key is PT source — leave key, value may already be EN */
            }
          }
          if (next !== v) dict[k] = next;
        });
      });
    } catch (e) {}
  }

  function patchShowToast() {
    if (typeof window.showToast !== 'function' || window.showToast.__copyUx) return;
    var orig = window.showToast;
    window.showToast = function (msg) {
      var s = String(msg == null ? '' : msg);
      for (var i = 0; i < PAIRS.length; i++) {
        if (s.indexOf(PAIRS[i][0]) !== -1) s = s.split(PAIRS[i][0]).join(PAIRS[i][1]);
      }
      return orig.call(this, s);
    };
    window.showToast.__copyUx = true;
  }

  function boot() {
    walk(document.body);
    fixAttributes(document.body);
    fixI18nDict();
    patchShowToast();
  }

  boot();
  [300, 1000, 2500].forEach(function (ms) {
    setTimeout(boot, ms);
  });

  if (typeof window.goTo === 'function' && !window.goTo.__copyUx) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(boot, 40);
      return r;
    };
    window.goTo.__copyUx = true;
  }
})();
