#!/usr/bin/env python3
"""Fix stories cloud insert/load to match sql/tchilo-cloud-complete.sql schema.

Real columns: user_id, username, media_url, media_type, text_content, color, music, created_at, expires_at
Code was inserting text/content/caption — all inserts failed silently.
"""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

# --- publishStoryCloud: correct columns + throw if insert fails ---
old_ps = '''async function publishStoryCloud(story){
    const userId=await getUserId();
    if(!userId) throw new Error('Sessão Supabase não encontrada.');
    let mediaUrl=story.media||null;
    let mediaType=story.mediaType||null;
    if(mediaUrl&&String(mediaUrl).indexOf('data:')===0){
      const ext=mediaType==='video'?'mp4':'jpg';
      const path=userId+'/stories/'+Date.now()+'.'+ext;
      mediaUrl=await uploadDataUrl('posts-media',path,mediaUrl);
    }else if(mediaUrl&&String(mediaUrl).indexOf('blob:')===0){
      const response=await fetch(mediaUrl);
      const blob=await response.blob();
      const ext=(blob.type||'').indexOf('video')===0?'mp4':'jpg';
      const path=userId+'/stories/'+Date.now()+'.'+ext;
      mediaUrl=await uploadBlobPath('posts-media',path,blob,blob.type);
      mediaType=mediaType||((blob.type||'').indexOf('video')===0?'video':'image');
    }
    const created=story.createdAt?new Date(story.createdAt).toISOString():iso();
    await insertCandidates('stories',[
      {user_id:userId,text:story.text||'',media_url:mediaUrl,media_type:mediaType,color:story.color||null,created_at:created},
      {user_id:userId,content:story.text||'',media_url:mediaUrl,media_type:mediaType,created_at:created},
      {user_id:userId,caption:story.text||'',media_url:mediaUrl,media_type:mediaType,created_at:created}
    ]);
    return {ok:true,media:mediaUrl,mediaType:mediaType};
  }'''

new_ps = '''async function publishStoryCloud(story){
    const userId=await getUserId();
    if(!userId) throw new Error('Sessão Supabase não encontrada.');
    const uname=(typeof username==='function'?username():null)||(getSession()&&getSession().username)||null;
    let mediaUrl=story.media||null;
    let mediaType=story.mediaType||null;
    if(mediaUrl&&String(mediaUrl).indexOf('data:')===0){
      const isVid=mediaType==='video'||String(mediaUrl).indexOf('data:video')===0;
      const ext=isVid?'mp4':(String(mediaUrl).indexOf('image/png')>=0?'png':'jpg');
      const path=userId+'/stories/'+Date.now()+'.'+ext;
      mediaUrl=await uploadDataUrl('posts-media',path,mediaUrl);
      mediaType=mediaType||(isVid?'video':'image');
    }else if(mediaUrl&&String(mediaUrl).indexOf('blob:')===0){
      const response=await fetch(mediaUrl);
      const blob=await response.blob();
      const isVid=(blob.type||'').indexOf('video')===0||mediaType==='video';
      const ext=isVid?'mp4':((blob.type||'').indexOf('png')>=0?'png':'jpg');
      const path=userId+'/stories/'+Date.now()+'.'+ext;
      mediaUrl=await uploadBlobPath('posts-media',path,blob,blob.type);
      mediaType=mediaType||(isVid?'video':'image');
    }
    const created=story.createdAt?new Date(story.createdAt).toISOString():iso();
    const expires=new Date((story.createdAt||Date.now())+24*60*60*1000).toISOString();
    /* Schema real (sql/tchilo-cloud-complete.sql): text_content, não text/content/caption */
    const row={
      user_id:userId,
      username:uname,
      media_url:mediaUrl,
      media_type:mediaType,
      text_content:story.text||'',
      color:story.color||null,
      music:(story.musicMeta||story.music)||null,
      created_at:created,
      expires_at:expires
    };
    const {error}=await SB.from('stories').insert(row);
    if(error){
      /* fallback mínimo se music jsonb não existir */
      const row2={user_id:userId,username:uname,media_url:mediaUrl,media_type:mediaType,text_content:story.text||'',color:story.color||null,created_at:created,expires_at:expires};
      const r2=await SB.from('stories').insert(row2);
      if(r2.error) throw new Error('Story na nuvem: '+(r2.error.message||error.message||'insert falhou'));
    }
    return {ok:true,media:mediaUrl,mediaType:mediaType};
  }'''

if old_ps in html:
    html = html.replace(old_ps, new_ps, 1)
    print('publishStoryCloud fixed')
else:
    # flexible: replace insertCandidates block for stories only
    if "text_content:story.text" in html:
        print('publishStoryCloud already has text_content')
    else:
        m = re.search(
            r"async function publishStoryCloud\(story\)\{[\s\S]*?return \{ok:true,media:mediaUrl,mediaType:mediaType\};\n  \}",
            html,
        )
        if m:
            html = html[: m.start()] + new_ps + html[m.end() :]
            print('publishStoryCloud regex fixed')
        else:
            print('FAIL publishStoryCloud pattern')

# --- loadCloudStories: map text_content ---
old_map = "text:r.text||r.content||r.caption||'',"
new_map = "text:r.text_content||r.text||r.content||r.caption||'',"
if old_map in html:
    html = html.replace(old_map, new_map)
    print('loadCloudStories map fixed')
elif "text_content||r.text" in html:
    print('load map already ok')
else:
    print('WARN load map')

# --- publishStory: require cloud success before local mirror; no silent local-only ---
old_pub = '''async function publishStory(data){
  const session=getSession();
  if(!session)return;
  const item={
    text:data.text||'',
    media:data.media||null,
    mediaType:data.mediaType||null,
    color:data.media?null:(data.color||'m1'),
    music:data.music||data.musicMeta||null,
    musicMeta:(data.musicMeta||data.music||null),
    createdAt:Date.now()
  };
  try{
    if(window.tchiloCloud&&typeof window.tchiloCloud.publishStory==='function'){
      const res=await window.tchiloCloud.publishStory(item);
      if(res&&res.media){ item.media=res.media; item.mediaType=res.mediaType||item.mediaType; }
      item._synced=true;
    }
  }catch(err){
    console.warn('Tchilo story cloud:',err&&err.message?err.message:err);
    showToast('Story guardado localmente (cloud: '+(err&&err.message?err.message:'erro')+')');
  }
  const all=getStoriesStore();
  let arr=Array.isArray(all[session.username])?all[session.username]:(all[session.username]?[all[session.username]]:[]);
  arr.push(item);
  arr=arr.filter(function(x){return Date.now()-(x.createdAt||0)<=24*60*60*1000;});
  all[session.username]=arr;
  saveStoriesStore(all);
  renderStories();
  showToast('Status publicado (24h)');
}'''

new_pub = '''async function publishStory(data){
  const session=getSession();
  if(!session){ showToast('Inicia sessão'); return; }
  const item={
    text:data.text||'',
    media:data.media||null,
    mediaType:data.mediaType||null,
    color:data.media?null:(data.color||'m1'),
    music:data.music||data.musicMeta||null,
    musicMeta:(data.musicMeta||data.music||null),
    createdAt:Date.now()
  };
  if(!(window.tchiloCloud&&typeof window.tchiloCloud.publishStory==='function')){
    showToast('Cloud offline — story não publicado');
    return;
  }
  try{
    showToast('A publicar story…');
    const res=await window.tchiloCloud.publishStory(item);
    if(res&&res.media){ item.media=res.media; item.mediaType=res.mediaType||item.mediaType; }
    /* Nunca guardar data:/blob: como definitivo */
    if(item.media&&(String(item.media).indexOf('data:')===0||String(item.media).indexOf('blob:')===0)){
      throw new Error('Media não foi enviada para o Storage');
    }
    item._synced=true;
  }catch(err){
    console.error('Tchilo story cloud:',err&&err.message?err.message:err);
    showToast('Story não publicado: '+(err&&err.message?err.message:'erro na nuvem'));
    return;
  }
  const all=getStoriesStore();
  let arr=Array.isArray(all[session.username])?all[session.username]:(all[session.username]?[all[session.username]]:[]);
  arr.push(item);
  arr=arr.filter(function(x){return Date.now()-(x.createdAt||0)<=24*60*60*1000;});
  all[session.username]=arr;
  saveStoriesStore(all);
  renderStories();
  showToast('Story publicado (24h)');
}'''

if old_pub in html:
    html = html.replace(old_pub, new_pub, 1)
    print('publishStory fixed')
else:
    m = re.search(
        r"async function publishStory\(data\)\{[\s\S]*?showToast\('Status publicado \(24h\)'\);\n\}",
        html,
    )
    if m:
        html = html[: m.start()] + new_pub + html[m.end() :]
        print('publishStory regex fixed')
    elif "Media não foi enviada para o Storage" in html:
        print('publishStory already fixed')
    else:
        print('FAIL publishStory')

# --- saveProfile: never keep data: as avatar_url in profiles ---
old_av = '''    let cloudAvatar=editAvatarData||session.avatar||null;
    if(editAvatarData&&/^data:image\//i.test(editAvatarData)&&window.tchiloSupabase){
      const auth=await window.tchiloSupabase.auth.getSession();
      const uid=window.__tchiloCloudUserId||(auth&&auth.data&&auth.data.session&&auth.data.session.user&&auth.data.session.user.id);
      if(uid){
        cloudAvatar=await tchiloUploadAvatar(uid,editAvatarData);
      } else {
        console.warn('Tchilo avatar: sem user id, guarda localmente');
      }
    }'''

new_av = '''    let cloudAvatar=editAvatarData||session.avatar||null;
    if(editAvatarData&&/^data:image\//i.test(String(editAvatarData))){
      if(!window.tchiloSupabase) throw new Error('Supabase offline');
      const auth=await window.tchiloSupabase.auth.getSession();
      const uid=window.__tchiloCloudUserId||(auth&&auth.data&&auth.data.session&&auth.data.session.user&&auth.data.session.user.id);
      if(!uid) throw new Error('Sem sessão para guardar foto');
      cloudAvatar=await tchiloUploadAvatar(uid,editAvatarData);
      if(!cloudAvatar||/^data:/i.test(String(cloudAvatar))){
        throw new Error('Upload da foto de perfil falhou');
      }
      editAvatarData=cloudAvatar;
    } else if(cloudAvatar&&/^data:/i.test(String(cloudAvatar))){
      /* nunca persistir data URL como avatar final */
      cloudAvatar=session.avatar&&String(session.avatar).indexOf('http')===0?session.avatar:null;
    }'''

if old_av in html:
    html = html.replace(old_av, new_av, 1)
    print('saveProfile avatar fixed')
elif "Upload da foto de perfil falhou" in html:
    print('saveProfile already fixed')
else:
    print('WARN saveProfile avatar')

# After loadCloudStories, call renderStories
if "loadCloudStories" in html and "await loadCloudStories()" in html:
    html2 = html.replace(
        "await loadCloudStories(),",
        "await loadCloudStories().then(function(){ try{ if(typeof renderStories==='function') renderStories(); }catch(e){} }),",
        1,
    )
    if html2 != html:
        html = html2
        print('renderStories after load')

p.write_text(html, encoding="utf-8")
print("DONE")
