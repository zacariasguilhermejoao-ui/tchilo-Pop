/** Force flat full-screen black music UI — no neo-brutalist */
(function () {
  'use strict';
  if (window.__TCHILO_MUSIC_FLAT_V1) return;
  window.__TCHILO_MUSIC_FLAT_V1 = true;
  var css =
    '#tchiloPostMusicSheet{display:none!important;position:fixed!important;inset:0!important;z-index:10060!important;background:#000!important;align-items:stretch!important;justify-content:stretch!important;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important}' +
    '#tchiloPostMusicSheet.open{display:flex!important}' +
    '#tchiloPostMusicSheet .panel{width:100%!important;max-width:none!important;max-height:none!important;height:100%!important;background:#000!important;color:#fff!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:12px 16px calc(16px + env(safe-area-inset-bottom))!important;display:flex!important;flex-direction:column!important;gap:12px!important}' +
    '#tchiloPostMusicSheet .head{display:flex!important;justify-content:space-between!important;align-items:center!important;padding-top:max(4px,env(safe-area-inset-top))!important}' +
    '#tchiloPostMusicSheet .head b{font-size:18px!important;font-weight:700!important;color:#fff!important}' +
    '#tchiloPostMusicSheet .tabs{display:flex!important;gap:8px!important}' +
    '#tchiloPostMusicSheet .tab{flex:1!important;border:0!important;border-radius:10px!important;padding:10px!important;font-weight:600!important;font-size:13px!important;background:rgba(255,255,255,.1)!important;color:#fff!important;cursor:pointer!important;box-shadow:none!important}' +
    '#tchiloPostMusicSheet .tab.on{background:rgba(255,255,255,.22)!important;color:#fff!important}' +
    '#tchiloPostMusicSheet .close{border:0!important;background:rgba(255,255,255,.12)!important;color:#fff!important;border-radius:50%!important;width:36px!important;height:36px!important;font-size:18px!important;font-weight:600!important;cursor:pointer!important;box-shadow:none!important;line-height:1!important}' +
    '#tchiloPostMusicSheet .search{display:flex!important;gap:8px!important;align-items:center!important;background:rgba(255,255,255,.1)!important;border:0!important;border-radius:12px!important;padding:12px 14px!important;box-shadow:none!important}' +
    '#tchiloPostMusicSheet .search input{flex:1!important;border:0!important;background:transparent!important;color:#fff!important;font-size:15px!important;font-weight:500!important;outline:none!important}' +
    '#tchiloPostMusicSheet .search input::placeholder{color:rgba(255,255,255,.4)!important}' +
    '#tchiloPostMusicSheet .list{flex:1!important;overflow:auto!important;-webkit-overflow-scrolling:touch!important}' +
    '#tchiloPostMusicSheet .track{display:flex!important;align-items:center!important;gap:12px!important;padding:10px 4px!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.08)!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;cursor:pointer!important;color:#fff!important}' +
    '#tchiloPostMusicSheet .track:active{background:rgba(255,255,255,.06)!important}' +
    '#tchiloPostMusicSheet .track img{width:48px!important;height:48px!important;border-radius:8px!important;object-fit:cover!important;border:0!important;background:#222!important;box-shadow:none!important}' +
    '#tchiloPostMusicSheet .track .meta b{display:block!important;font-size:14px!important;font-weight:600!important;color:#fff!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}' +
    '#tchiloPostMusicSheet .track .meta span{display:block!important;font-size:12px!important;color:rgba(255,255,255,.5)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}' +
    '#tchiloPostMusicSheet .playbtn,#tchiloPostMusicSheet .favbtn{width:40px!important;height:40px!important;border-radius:50%!important;border:0!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:none!important;cursor:pointer!important}' +
    '#tchiloPostMusicSheet .playbtn{background:rgba(255,255,255,.15)!important;color:#fff!important}' +
    '#tchiloPostMusicSheet .playbtn.playing{background:#3897f0!important;color:#fff!important;animation:none!important}' +
    '#tchiloPostMusicSheet .favbtn{background:rgba(255,255,255,.08)!important;color:#fff!important}' +
    '#tchiloPostMusicSheet .favbtn.on{background:rgba(255,255,255,.2)!important;color:#fff!important}' +
    '#tchiloPostMusicSheet .badge{display:inline-block!important;font-size:10px!important;font-weight:600!important;background:rgba(255,255,255,.12)!important;border:0!important;border-radius:6px!important;padding:2px 6px!important;color:rgba(255,255,255,.7)!important;box-shadow:none!important}' +
    '#tchiloPostMusicSheet .empty{color:rgba(255,255,255,.45)!important;text-align:center!important;padding:32px 16px!important}' +
    '#tchiloMusicUseSheet{background:rgba(0,0,0,.55)!important}' +
    '#tchiloMusicUseSheet .panel,#tchiloMusicUseSheet .sheet-panel{background:#111!important;color:#fff!important;border:0!important;border-radius:16px 16px 0 0!important;box-shadow:none!important}' +
    '#tchiloMusicUseSheet .opt{border:0!important;box-shadow:none!important;background:transparent!important;color:#fff!important}' +
    '#tchiloMusicUseSheet .opt:active{background:rgba(255,255,255,.08)!important}' +
    '#tchiloMediaEd .me-sheet-panel{background:#111!important;color:#fff!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaEd .me-search{background:rgba(255,255,255,.1)!important;border:0!important;box-shadow:none!important;border-radius:12px!important}' +
    '#tchiloMediaEd .me-search input{color:#fff!important}' +
    '#tchiloMediaEd .me-publish{background:#3897f0!important;color:#fff!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaEd .me-iconbtn{border:0!important;background:rgba(255,255,255,.1)!important;color:#fff!important;box-shadow:none!important}' +
    '#tchiloMediaEd .me-chip.active{border-color:rgba(255,255,255,.35)!important;background:rgba(255,255,255,.12)!important}' +
    '#tchiloMediaEd .me-tool.active{background:rgba(255,255,255,.1)!important;outline:1px solid rgba(255,255,255,.25)!important}' +
    '#tchiloMediaEd .me-range{accent-color:#3897f0!important}';
  var s = document.createElement('style');
  s.id = 'tchilo-music-flat-css';
  s.textContent = css;
  (document.head || document.documentElement).appendChild(s);
})();
