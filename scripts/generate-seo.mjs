#!/usr/bin/env node
/**
 * Tchilo — SEO public pages generator
 * Generates crawlable profile/post HTML pages and sitemap.xml from Supabase.
 * Required env: SUPABASE_URL, SUPABASE_ANON_KEY
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const base = 'https://tchilopop.com';
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

const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = v => JSON.stringify(v).replace(/</g, '\\u003c');
const clean = v => String(v || '').replace(/\s+/g, ' ').trim();
const truncate = (v,n=160) => clean(v).slice(0,n) + (clean(v).length > n ? '…' : '');
const slug = v => encodeURIComponent(String(v || '').trim());

const profiles = await fetchAll('profiles', 'id,username,display_name,avatar_url,bio,is_private,created_at,updated_at', 'updated_at');
const publicProfiles = profiles.filter(p => p.username && !p.is_private);
const profileById = new Map(publicProfiles.map(p => [p.id, p]));

const posts = await fetchAll('posts', 'id,user_id,username,display_name,caption,media_url,media_type,thumbnail_url,created_at', 'created_at');
const publicPosts = posts.filter(p => p.user_id && profileById.has(p.user_id));

await rm('u', { recursive: true, force: true });
await rm('post', { recursive: true, force: true });
await mkdir('u', { recursive: true });
await mkdir('post', { recursive: true });

const staticUrls = [
  '/', '/sobre/', '/comunidade/', '/privacidade/', '/termos/', '/cookies/', '/menores/', '/eliminar-conta/'
];
const urls = staticUrls.map(path => ({ loc: base + path }));

function page({title, description, canonical, image, body, schema, noindex=false}) {
  const robots = noindex ? '<meta name="robots" content="noindex,nofollow">' : '<meta name="robots" content="index,follow">';
  const img = image ? '<meta property="og:image" content="' + esc(image) + '">' : '';
  return '<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(title) + '</title><meta name="description" content="' + esc(description) + '">' + robots +
    '<link rel="canonical" href="' + esc(canonical) + '">' +
    '<meta property="og:type" content="website"><meta property="og:site_name" content="Tchilo"><meta property="og:title" content="' + esc(title) + '">' +
    '<meta property="og:description" content="' + esc(description) + '"><meta property="og:url" content="' + esc(canonical) + '">' + img +
    '<meta name="twitter:card" content="' + (image ? 'summary_large_image' : 'summary') + '"><meta name="twitter:title" content="' + esc(title) + '">' +
    '<meta name="twitter:description" content="' + esc(description) + '">' +
    '<script type="application/ld+json">' + json(schema) + '</script>' +
    '<style>body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;margin:0;background:#0b0b0c;color:#fff}main{max-width:760px;margin:0 auto;padding:32px 20px}a{color:#7dd3fc;text-decoration:none}.card{background:#151518;border:1px solid #29292e;border-radius:18px;padding:22px;margin-top:20px}.avatar{width:88px;height:88px;border-radius:50%;object-fit:cover}.media{max-width:100%;max-height:620px;border-radius:14px;display:block;margin-top:18px}h1{font-size:28px;margin:14px 0 6px}p{line-height:1.55;white-space:pre-wrap}.muted{color:#a1a1aa}</style></head><body><main>' +
    '<a href="' + base + '/">Abrir Tchilo</a>' + body + '</main></body></html>';
}

for (const p of publicProfiles) {
  const username = p.username;
  const canonical = base + '/u/' + slug(username);
  const title = (p.display_name || username) + ' (@' + username + ') — Tchilo';
  const description = truncate(p.bio || ('Perfil de ' + (p.display_name || username) + ' no Tchilo.'), 160);
  const schema = {
    '@context':'https://schema.org','@type':'ProfilePage',
    'url':canonical,'dateCreated':p.created_at,'dateModified':p.updated_at || p.created_at,
    'mainEntity': {'@type':'Person','name':p.display_name || username,'alternateName':username,'identifier':p.id,...(p.bio?{description:p.bio}:{}),...(p.avatar_url?{image:p.avatar_url}:{}),}
  };
  const avatar = p.avatar_url ? '<img class="avatar" src="' + esc(p.avatar_url) + '" alt="' + esc(p.display_name || username) + '">' : '';
  const body = '<section class="card">' + avatar + '<h1>' + esc(p.display_name || username) + '</h1><div class="muted">@' + esc(username) + '</div>' +
    (p.bio ? '<p>' + esc(p.bio) + '</p>' : '') + '<p><a href="' + base + '/u/' + slug(username) + '">Ver perfil no Tchilo</a></p></section>';
  const path = join('u', username, 'index.html');
  await mkdir(dirname(path), {recursive:true});
  await writeFile(path, page({title,description,canonical,image:p.avatar_url,body,schema}), 'utf8');
  urls.push({loc:canonical,lastmod:p.updated_at || p.created_at});
}

for (const post of publicPosts) {
  const profile = profileById.get(post.user_id);
  const username = profile.username;
  const canonical = base + '/post/' + slug(post.id);
  const authorName = post.display_name || profile.display_name || username;
  const title = truncate(clean(post.caption) || ('Publicação de ' + authorName), 70) + ' — Tchilo';
  const description = truncate(clean(post.caption) || ('Publicação de ' + authorName + ' no Tchilo.'), 160);
  const image = post.thumbnail_url || ((post.media_type || '').startsWith('image') ? post.media_url : null);
  const schema = {
    '@context':'https://schema.org','@type':'SocialMediaPosting',
    'url':canonical,'datePublished':post.created_at,'dateModified':post.created_at,
    'headline':clean(post.caption).slice(0,110) || ('Publicação de ' + authorName),
    'author':{'@type':'Person','name':authorName,'url':base+'/u/'+slug(username),'identifier':profile.id},
    ...(post.caption?{'articleBody':clean(post.caption)}:{}),
    ...(image?{'image':image}:{}),
    'isPartOf':{'@type':'WebSite','name':'Tchilo','url':base+'/'}
  };
  let media = '';
  if (image) media = '<img class="media" src="' + esc(image) + '" alt="Publicação de ' + esc(authorName) + '">';
  else if ((post.media_type || '').startsWith('video') && post.media_url) media = '<video class="media" controls preload="metadata" src="' + esc(post.media_url) + '"></video>';
  const body = '<article class="card"><div class="muted"><a href="' + base + '/u/' + slug(username) + '">@' + esc(username) + '</a> · ' + esc(new Date(post.created_at).toLocaleDateString('pt-PT')) + '</div>' +
    (post.caption ? '<p>' + esc(post.caption) + '</p>' : '') + media +
    '<p><a href="' + canonical + '">Abrir publicação no Tchilo</a></p></article>';
  const path = join('post', post.id, 'index.html');
  await mkdir(dirname(path), {recursive:true});
  await writeFile(path, page({title,description,canonical,image,body,schema}), 'utf8');
  urls.push({loc:canonical,lastmod:post.created_at});
}

const xmlEsc = v => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => '  <url><loc>' + xmlEsc(u.loc) + '</loc>' + (u.lastmod ? '<lastmod>' + new Date(u.lastmod).toISOString() + '</lastmod>' : '') + '</url>').join('\n') +
  '\n</urlset>\n';
await writeFile('sitemap.xml', sitemap, 'utf8');
console.log('Generated', publicProfiles.length, 'profiles and', publicPosts.length, 'public posts.');
