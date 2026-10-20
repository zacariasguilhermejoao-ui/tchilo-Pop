#!/usr/bin/env node
/**
 * Tchilo — SEO public pages generator
 * Gera paginas estaticas para bots (Google, Bing, etc.).
 * Humanos sao redirecionados para a app SPA.
 * Required env: SUPABASE_URL, SUPABASE_ANON_KEY
 */
import { mkdir, readFile, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
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

const AMP = String.fromCharCode(38) + 'amp;';
const LT = String.fromCharCode(38) + 'lt;';
const GT = String.fromCharCode(38) + 'gt;';
const QUOT = String.fromCharCode(38) + 'quot;';
const APOS = String.fromCharCode(38) + '#39;';

const esc = (v = '') => String(v)
  .replace(/&/g, AMP)
  .replace(/</g, LT)
  .replace(/>/g, GT)
  .replace(/"/g, QUOT)
  .replace(/'/g, APOS);

const json = v => JSON.stringify(v).replace(/</g, '\\u003c');
const clean = v => String(v || '').replace(/\s+/g, ' ').trim();
const truncate = (v, n = 160) => {
  const s = clean(v);
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '\u2026';
};
const slug = v => encodeURIComponent(String(v || '').trim());

/* A app põe esta legenda quando a pessoa não escreve nada — não serve de título. */
const GENERIC_CAPTION = /^(nova publica[cç][aã]o|novo post|new post)\.?$/i;

const isVideoPost = post =>
  String(post.media_type || '').toLowerCase().startsWith('video') && !!post.media_url;

const isoDuration = sec => {
  const s = Math.max(1, Math.round(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return 'PT' + (h ? h + 'H' : '') + (m ? m + 'M' : '') + (r || (!h && !m) ? r + 'S' : '');
};

/* ---- miniaturas dos vídeos (ffmpeg) ----
 * Guardadas em thumbs/<id>.jpg (não são apagadas entre execuções) e a duração em
 * thumbs/meta.json. Só se gera a que falta; no máximo MAX_NEW_THUMBS por execução. */
const thumbsDir = 'thumbs';
const metaPath = join(thumbsDir, 'meta.json');
const MAX_NEW_THUMBS = 40;
let thumbMeta = {};
let thumbMetaChanged = false;
let newThumbs = 0;
await mkdir(thumbsDir, { recursive: true });
try { thumbMeta = JSON.parse(await readFile(metaPath, 'utf8')); } catch {}

/* só aceita ficheiros do próprio storage do Supabase (evita ler URLs arbitrários) */
function safeMediaUrl(raw) {
  try {
    const m = new URL(raw);
    const s = new URL(supabaseUrl);
    return m.origin === s.origin ? m : null;
  } catch { return null; }
}

function run(cmd, args, timeout = 90000) {
  return new Promise(resolve => {
    execFile(cmd, args, { timeout, maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => resolve(err ? null : String(stdout)));
  });
}

async function ensureThumb(post) {
  const id = String(post.id);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return {};
  const out = join(thumbsDir, id + '.jpg');
  const known = thumbMeta[id] && thumbMeta[id].duration ? thumbMeta[id].duration : null;
  if (post.thumbnail_url) return { thumb: post.thumbnail_url, duration: known };
  if (!existsSync(out) && newThumbs < MAX_NEW_THUMBS) {
    const u = safeMediaUrl(post.media_url);
    if (u) {
      newThumbs++;
      const wl = u.protocol === 'https:' ? 'https,tls,tcp,crypto' : 'http,tcp';
      let ok = false;
      for (const ss of ['1', '0']) {
        await run('ffmpeg', ['-v', 'error', '-y', '-protocol_whitelist', wl, '-ss', ss, '-i', u.href,
          '-frames:v', '1', '-vf', 'scale=720:-2', '-q:v', '4', out]);
        if (existsSync(out) && (await stat(out)).size > 1000) { ok = true; break; }
        try { await unlink(out); } catch {}
      }
      if (ok) {
        const d = parseFloat(await run('ffprobe', ['-v', 'error', '-protocol_whitelist', wl,
          '-show_entries', 'format=duration', '-of', 'csv=p=0', u.href]));
        if (isFinite(d) && d > 0) { thumbMeta[id] = { duration: Math.round(d) }; thumbMetaChanged = true; }
      }
    }
  }
  const has = existsSync(out);
  const dur = thumbMeta[id] && thumbMeta[id].duration ? thumbMeta[id].duration : null;
  return { thumb: has ? base + '/thumbs/' + id + '.jpg' : null, duration: dur };
}

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

function page({ title, description, canonical, image, body, schema, keywords, noindex = false, ogType = 'website', extraMeta = '' }) {
  const robots = noindex
    ? '<meta name="robots" content="noindex,nofollow">'
    : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">';
  const img = image ? '<meta property="og:image" content="' + esc(image) + '">' : '';
  const kw = keywords
    ? '<meta name="keywords" content="' + esc(keywords) + '">'
    : '<meta name="keywords" content="Tchilo, Tchilo Pop, tchilopop, rede social, fotos, videos, stories, reels">';
  return (
    '<!doctype html><html lang="pt"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(title) + '</title>' +
    '<meta name="description" content="' + esc(description) + '">' +
    robots + kw +
    '<link rel="canonical" href="' + esc(canonical) + '">' +
    '<meta property="og:type" content="' + esc(ogType) + '">' +
    '<meta property="og:site_name" content="Tchilo">' +
    '<meta property="og:locale" content="pt_PT">' +
    '<meta property="og:title" content="' + esc(title) + '">' +
    '<meta property="og:description" content="' + esc(description) + '">' +
    '<meta property="og:url" content="' + esc(canonical) + '">' +
    img + extraMeta +
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

for (const p of publicProfiles) {
  const username = p.username;
  const canonical = base + '/u/' + slug(username);
  const display = p.display_name || username;
  const title = display + ' (@' + username + ') no ' + brandLong + ' \u2014 ' + brand;
  const bioText = clean(p.bio);
  const description = truncate(
    (bioText ? bioText + ' \u00b7 ' : '') +
    'Perfil de ' + display + ' (@' + username + ') no Tchilo Pop. Rede social de fotos, videos, stories e reels.',
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
    '<div class="muted">@' + esc(username) + ' \u00b7 ' + brand + ' / ' + brandLong + '</div>' +
    (bioText ? '<p>' + esc(bioText) + '</p>' : '') +
    '<p>Perfil publico no <strong>Tchilo</strong> (Tchilo Pop) \u2014 rede social para fotos, videos, stories, reels e mensagens.</p>' +
    '<p><a href="' + canonical + '">Ver perfil no Tchilo</a> \u00b7 <a href="' + base + '/">Abrir Tchilo Pop</a></p>' +
    '<p class="brand">Tchilo \u00b7 tchilopop.com</p>' +
    '</article>';
  const path = join('u', username, 'index.html');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, page({ title, description, canonical, image: p.avatar_url, body, schema, keywords }), 'utf8');
  urls.push({ loc: canonical, lastmod: p.updated_at || p.created_at });
}

const videoEntries = [];

for (const post of publicPosts) {
  const profile = profileById.get(post.user_id);
  const username = profile.username;
  const canonical = base + '/post/' + slug(post.id);
  const authorName = post.display_name || profile.display_name || username;
  const isVideo = isVideoPost(post);
  const vinfo = isVideo ? await ensureThumb(post) : {};
  const rawCaption = clean(post.caption);
  const caption = GENERIC_CAPTION.test(rawCaption) ? '' : rawCaption;
  const kind = isVideo ? 'V\u00eddeo' : 'Publica\u00e7\u00e3o';
  const defaultHeadline = kind + ' de ' + authorName + ' (@' + username + ')';
  const headline = caption || defaultHeadline;
  const title = caption
    ? truncate(caption, 55) + ' \u2014 @' + username + ' no ' + brandLong
    : truncate(defaultHeadline, 60) + ' \u2014 ' + brandLong;
  const description = truncate(
    (caption ? caption + ' \u00b7 ' : '') +
    kind + ' de ' + authorName + ' (@' + username + ') no Tchilo Pop. ' +
    (isVideo ? 'V\u00eddeos, fotos e stories' : 'Fotos, v\u00eddeos e stories') + ' na rede social Tchilo.',
    160
  );
  const keywords = [brand, brandLong, 'tchilopop', username, authorName, isVideo ? 'v\u00eddeo' : 'publica\u00e7\u00e3o', 'post', 'rede social']
    .concat(caption ? caption.split(/\s+/).slice(0, 8) : [])
    .filter(Boolean)
    .join(', ');
  const image = vinfo.thumb || post.thumbnail_url || ((post.media_type || '').startsWith('image') ? post.media_url : null);
  const author = {
    '@type': 'Person',
    'name': authorName,
    'alternateName': username,
    'url': base + '/u/' + slug(username),
    'identifier': profile.id
  };
  const isPartOf = { '@type': 'WebSite', 'name': brand, 'alternateName': brandLong, 'url': base + '/' };
  const publisher = { '@type': 'Organization', 'name': brand, 'url': base + '/' };
  const uploadDate = new Date(post.created_at).toISOString();

  /* Google só mostra vídeo nos resultados com VideoObject + miniatura + endereço do ficheiro */
  const asVideoObject = isVideo && !!image;
  const schema = asVideoObject
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        'name': truncate(headline, 100),
        'description': truncate(caption || (defaultHeadline + ' no ' + brandLong + '.'), 300),
        'thumbnailUrl': [image],
        'uploadDate': uploadDate,
        'contentUrl': post.media_url,
        'url': canonical,
        'inLanguage': 'pt',
        ...(vinfo.duration ? { duration: isoDuration(vinfo.duration) } : {}),
        'author': author,
        'isPartOf': isPartOf,
        'publisher': publisher
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'SocialMediaPosting',
        'url': canonical,
        'datePublished': post.created_at,
        'dateModified': post.created_at,
        'headline': truncate(headline, 110),
        'author': author,
        ...(caption ? { articleBody: caption } : {}),
        ...(image ? { image: image } : {}),
        'isPartOf': isPartOf,
        'publisher': publisher
      };

  let extraMeta = '';
  if (isVideo) {
    const mime = String(post.media_type || '').includes('/') ? post.media_type : 'video/mp4';
    extraMeta =
      '<meta property="og:video" content="' + esc(post.media_url) + '">' +
      '<meta property="og:video:secure_url" content="' + esc(post.media_url) + '">' +
      '<meta property="og:video:type" content="' + esc(mime) + '">' +
      (vinfo.duration ? '<meta property="video:duration" content="' + vinfo.duration + '">' : '');
  }

  let media = '';
  if (isVideo) {
    media = '<video class="media" controls playsinline preload="metadata"' +
      (image ? ' poster="' + esc(image) + '"' : '') + ' src="' + esc(post.media_url) + '"></video>';
  } else if (image) {
    media = '<img class="media" src="' + esc(image) + '" alt="' + esc(headline) + ' \u2014 ' + esc(authorName) + ' no Tchilo">';
  }
  const dateStr = new Date(post.created_at).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' });
  const body =
    '<article class="card">' +
    '<div class="muted"><a href="' + base + '/u/' + slug(username) + '">@' + esc(username) + '</a> \u00b7 ' + esc(dateStr) + ' \u00b7 ' + brand + '</div>' +
    '<h1>' + esc(headline) + '</h1>' +
    (caption && caption !== headline ? '<p>' + esc(caption) + '</p>' : '') +
    media +
    '<p>' + kind + ' de <strong>' + esc(authorName) + '</strong> (@' + esc(username) + ') no <strong>Tchilo Pop</strong> \u2014 rede social Tchilo para fotos, v\u00eddeos, stories e reels.</p>' +
    '<p><a href="' + canonical + '">Abrir publica\u00e7\u00e3o no Tchilo</a> \u00b7 <a href="' + base + '/u/' + slug(username) + '">Ver perfil</a> \u00b7 <a href="' + base + '/">Tchilo Pop</a></p>' +
    '<p class="brand">Tchilo \u00b7 tchilopop.com</p>' +
    '</article>';
  const path = join('post', post.id, 'index.html');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, page({ title, description, canonical, image, body, schema, keywords, ogType: isVideo ? 'video.other' : 'website', extraMeta }), 'utf8');
  urls.push({ loc: canonical, lastmod: post.created_at });

  if (asVideoObject) {
    videoEntries.push({
      loc: canonical,
      thumb: image,
      title: truncate(headline, 100),
      description: truncate(caption || (defaultHeadline + ' no ' + brandLong + '.'), 300),
      content: post.media_url,
      date: uploadDate,
      duration: vinfo.duration || null,
      uploader: authorName,
      uploaderUrl: base + '/u/' + slug(username)
    });
  }
}

if (thumbMetaChanged) await writeFile(metaPath, JSON.stringify(thumbMeta, null, 1) + '\n', 'utf8');

const xmlEsc = v => String(v)
  .replace(/&/g, AMP)
  .replace(/</g, LT)
  .replace(/>/g, GT)
  .replace(/"/g, QUOT)
  .replace(/'/g, APOS);

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

const videoSitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n' +
  videoEntries.map(v =>
    '  <url><loc>' + xmlEsc(v.loc) + '</loc><video:video>' +
    '<video:thumbnail_loc>' + xmlEsc(v.thumb) + '</video:thumbnail_loc>' +
    '<video:title>' + xmlEsc(v.title) + '</video:title>' +
    '<video:description>' + xmlEsc(v.description) + '</video:description>' +
    '<video:content_loc>' + xmlEsc(v.content) + '</video:content_loc>' +
    (v.duration ? '<video:duration>' + Math.min(28800, Math.max(1, v.duration)) + '</video:duration>' : '') +
    '<video:publication_date>' + v.date + '</video:publication_date>' +
    '<video:uploader info="' + xmlEsc(v.uploaderUrl) + '">' + xmlEsc(v.uploader) + '</video:uploader>' +
    '</video:video></url>'
  ).join('\n') +
  '\n</urlset>\n';
await writeFile('sitemap-video.xml', videoSitemap, 'utf8');
console.log('Generated', publicProfiles.length, 'profiles,', publicPosts.length, 'public posts,', videoEntries.length, 'videos in sitemap-video.xml (', newThumbs, 'new thumbnails).');
