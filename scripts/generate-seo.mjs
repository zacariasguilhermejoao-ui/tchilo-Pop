#!/usr/bin/env node
/**
 * Tchilo — SEO public pages generator
 * Gera páginas estáticas para bots (Google, Bing, etc.).
 * Humanos são redirecionados para a app SPA.
 * Required env: SUPABASE_URL, SUPABASE_ANON_KEY
 *
 * Melhorias SEO:
 * - Conteúdo VISÍVEL (sem display:none) para o Google indexar
 * - Títulos e descriptions com "Tchilo" / "Tchilo Pop" + legenda
 * - Schema.org SocialMediaPosting / ProfilePage
 * - Keywords e texto rico no corpo
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const base = 'https://tchilopop.com';
const brand = 'Tchilo';
const brandLong = 'Tchilo Pop';
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !anonKey) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');

const headers = { apikey: anonKey, Authorization: 'Bearer ' + anonKey };

async function fetchAll(table, select, order = 'created_at') {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const url = new URL(supabaseUrl + '/rest/v1/' + table);
    url.searchParams.set('select', select);
    url.searchParams.set('limit', '1000');
    url.searchParams.set('offset', String(offset));
    if (order) url.searchParams.set('order', order + '.desc');
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(table + ': ' + r.status + ' ' + await r.text());
    const batch = await r.json();
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c]));
const json = v => JSON.stringify(v).replace(/</g, '\\u003c');
const clean = v => String(v || '').replace(/\s+/g, ' ').trim();
const truncate = (v, n = 160) => {
  const s = clean(v);
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…';
};
const slug = v => encodeURIComponent(String(v || '').trim());

const profiles = await fetchAll('profiles', '*', 'id');
const publicProfiles = profiles.filter(p => p.username && !p.is_private);
const profileById = new Map(publicProfiles.map(p => [p.id, p]));

const posts = await fetchAll('posts', '*', 'id');
const publicPosts = posts.filter(p => p.user_id && profileById.has(p.user_id));

await rm('u', { recursive: true, force: true });
await rm('post', { recursive: true, force: true });
await mkdir('u', { recursive: true });
await mkdir('post', { recursive: true });

const staticUrls = [
  '/', '/sobre/', '/comunidade/', '/privacidade/', '/termos/', '/cookies/', '/menores/', '/eliminar-conta/'
];
const urls = staticUrls.map(path => ({ loc: base + path }));

function page({ title, description, canonical, image, body, schema, keywords, noindex = false }) {
  const robots = noindex
    ? '<meta name="robots" content="noindex,nofollow">'
    : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">';
  const img = image ? '<meta property="og:image" content="' + esc(image) + '">' : '';
  const kw = keywords
    ? '<meta name="keywords" content="' + esc(keywords) + '">'
    : '<meta name="keywords" content="Tchilo, Tchilo Pop, tchilopop, rede social, fotos, vídeos, stories, reels">';
  return (
    '<!doctype html><html lang="pt"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(title) + '</title>' +
    '<meta name="description" content="' + esc(description) + '">' +
    robots + kw +
    '<link rel="canonical" href="' + esc(canonical) + '">' +
    '<meta property="og:type" content="website">' +
    '<meta property="og:site_name" content="Tchilo">' +
    '<meta property="og:locale" content="pt_PT">' +
    '<meta property="og:title" content="' + esc(title) + '">' +
    '<meta property="og:description" content="' + esc(description) + '">' +
    '<meta property="og:url" content="' + esc(canonical) + '">' +
    img +
    '<meta name="twitter:card" content="' + (image ? 'summary_large_image' : 'summary') + '">' +
    '<meta name="twitter:title" content="' + esc(title) + '">' +
    '<meta name="twitter:description" content="' + esc(description) + '">' +
    (image ? '<meta name="twitter:image" content="' + esc(image) + '">' : '') +
    '<script type="application/ld+json">' + json(schema) + '</script>' +
    '<style>' +
    'html,body{margin:0;padding:0;min-height:100%;background:#0B0B0C;color:#f2f2f2;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
    'main{max-width:680px;margin:0 auto;padding:24px 16px}' +
    '.card{background:#161618;border-radius:12px;padding:20px;margin-bottom:16px}' +
    'h1{font-size:1.35rem;margin:0 0 8px;line-height:1.3}' +
    '.muted{color:#a0a0a8;font-size:.9rem;margin-bottom:12px}' +
    'p{line-height:1.5;margin:0 0 12px}' +
    'a{color:#7c9cff}' +
    'img.media,video.media{max-width:100%;border-radius:8px;display:block;margin:12px 0}' +
    'img.avatar{width:72px;height:72px;border-radius:50%;object-fit:cover;margin-bottom:12px}' +
    '.brand{font-size:.85rem;color:#888;margin-top:20px}' +
    '</style>' +
    '<script>(function(){var ua=navigator.userAgent||"";' +
    'if(/bot|googlebot|bingbot|crawler|spider|slurp|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|pinterest|redditbot|applebot|semrush|ahrefs|duckduckbot|yandex|baiduspider|bytespider|petalbot/i.test(ua))return;' +
    'try{sessionStorage.setItem("tchilo_spa_path",location.pathname+location.search+location.hash);}catch(e){}' +
    'location.replace("' + base + '/"+(location.search||"")+(location.hash||""));})();</script>' +
    '</head><body>' +
    '<main>' + body + '</main>' +
    '</body></html>'
  );
}

// ——— Perfis públicos ———
for (const p of publicProfiles) {
  const username = p.username;
  const canonical = base + '/u/' + slug(username);
  const display = p.display_name || username;
  const title = display + ' (@' + username + ') no ' + brandLong + ' — ' + brand;
  const bioText = clean(p.bio);
  const description = truncate(
    (bioText ? bioText + ' · ' : '') +
    'Perfil de ' + display + ' (@' + username + ') no Tchilo Pop. Rede social de fotos, vídeos, stories e reels.',
    160
  );
  const keywords = [brand, brandLong, 'tchilopop', username, display, 'perfil', 'rede social'].filter(Boolean).join(', ');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    'name': title,
    'url': canonical,
    'dateCreated': p.created_at,
    'dateModified': p.updated_at || p.created_at,
    'isPartOf': { '@type': 'WebSite', 'name': brand, 'alternateName': brandLong, 'url': base + '/' },
    'mainEntity': {
      '@type': 'Person',
      'name': display,
      'alternateName': username,
      'identifier': p.id,
      'url': canonical,
      ...(bioText ? { description: bioText } : {}),
      ...(p.avatar_url ? { image: p.avatar_url } : {})
    }
  };
  const avatar = p.avatar_url
    ? '<img class="avatar" src="' + esc(p.avatar_url) + '" alt="' + esc(display) + ' no Tchilo">'
    : '';
  const body =
    '<article class="card">' +
    avatar +
    '<h1>' + esc(display) + '</h1>' +
    '<div class="muted">@' + esc(username) + ' · ' + brand + ' / ' + brandLong + '</div>' +
    (bioText ? '<p>' + esc(bioText) + '</p>' : '') +
    '<p>Perfil público no <strong>Tchilo</strong> (Tchilo Pop) — rede social para fotos, vídeos, stories, reels e mensagens.</p>' +
    '<p><a href="' + canonical + '">Ver perfil no Tchilo</a> · <a href="' + base + '/">Abrir Tchilo Pop</a></p>' +
    '<p class="brand">Tchilo · tchilopop.com</p>' +
    '</article>';
  const path = join('u', username, 'index.html');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, page({ title, description, canonical, image: p.avatar_url, body, schema, keywords }), 'utf8');
  urls.push({ loc: canonical, lastmod: p.updated_at || p.created_at });
}

// ——— Posts públicos ———
for (const post of publicPosts) {
  const profile = profileById.get(post.user_id);
  const username = profile.username;
  const canonical = base + '/post/' + slug(post.id);
  const authorName = post.display_name || profile.display_name || username;
  const caption = clean(post.caption);
  const headline = caption || ('Publicação de ' + authorName);
  const title = truncate(headline, 55) + ' — @' + username + ' no ' + brandLong;
  const description = truncate(
    (caption ? caption + ' · ' : '') +
    'Publicação de ' + authorName + ' (@' + username + ') no Tchilo Pop. Fotos, vídeos e stories na rede social Tchilo.',
    160
  );
  const keywords = [brand, brandLong, 'tchilopop', username, authorName, 'publicação', 'post', 'rede social']
    .concat(caption ? caption.split(/\s+/).slice(0, 8) : [])
    .filter(Boolean)
    .join(', ');
  const image = post.thumbnail_url || ((post.media_type || '').startsWith('image') ? post.media_url : null);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    'url': canonical,
    'datePublished': post.created_at,
    'dateModified': post.created_at,
    'headline': truncate(headline, 110),
    'author': {
      '@type': 'Person',
      'name': authorName,
      'alternateName': username,
      'url': base + '/u/' + slug(username),
      'identifier': profile.id
    },
    ...(caption ? { articleBody: caption } : {}),
    ...(image ? { image: image } : {}),
    'isPartOf': {
      '@type': 'WebSite',
      'name': brand,
      'alternateName': brandLong,
      'url': base + '/'
    },
    'publisher': {
      '@type': 'Organization',
      'name': brand,
      'url': base + '/'
    }
  };
  let media = '';
  if (image) {
    media = '<img class="media" src="' + esc(image) + '" alt="' + esc(headline) + ' — ' + esc(authorName) + ' no Tchilo">';
  } else if ((post.media_type || '').startsWith('video') && post.media_url) {
    media = '<video class="media" controls preload="metadata" src="' + esc(post.media_url) + '"></video>';
  }
  const dateStr = new Date(post.created_at).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
  const body =
    '<article class="card">' +
    '<div class="muted"><a href="' + base + '/u/' + slug(username) + '">@' + esc(username) + '</a> · ' + esc(dateStr) + ' · ' + brand + '</div>' +
    '<h1>' + esc(headline) + '</h1>' +
    (caption && caption !== headline ? '<p>' + esc(caption) + '</p>' : '') +
    media +
    '<p>Publicação de <strong>' + esc(authorName) + '</strong> (@' + esc(username) + ') no <strong>Tchilo Pop</strong> — rede social Tchilo para fotos, vídeos, stories e reels.</p>' +
    '<p><a href="' + canonical + '">Abrir publicação no Tchilo</a> · <a href="' + base + '/u/' + slug(username) + '">Ver perfil</a> · <a href="' + base + '/">Tchilo Pop</a></p>' +
    '<p class="brand">Tchilo · tchilopop.com</p>' +
    '</article>';
  const path = join('post', post.id, 'index.html');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, page({ title, description, canonical, image, body, schema, keywords }), 'utf8');
  urls.push({ loc: canonical, lastmod: post.created_at });
}

const xmlEsc = v => String(v).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, ''');
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u =>
    '  <url><loc>' + xmlEsc(u.loc) + '</loc>' +
    (u.lastmod ? '<lastmod>' + new Date(u.lastmod).toISOString() + '</lastmod>' : '') +
    '</url>'
  ).join('\n') +
  '\n</urlset>\n';
await writeFile('sitemap.xml', sitemap, 'utf8');
console.log('Generated', publicProfiles.length, 'profiles and', publicPosts.length, 'public posts.');
