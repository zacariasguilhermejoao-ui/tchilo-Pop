/** Light paper music list UX — cover play, star, arrow, no neo */
(function () {
  'use strict';
  if (window.__TCHILO_MUSIC_FLAT_V3) return;
  window.__TCHILO_MUSIC_FLAT_V3 = true;
  window.__TCHILO_MUSIC_FLAT_V2 = true;
  window.__TCHILO_MUSIC_FLAT_V1 = true;

  var PAPER = 'var(--paper,#F3F1E9)';
  var INK = 'var(--ink,#0B0B0C)';

  var css =
    '#tchiloPostMusicSheet{display:none!important;position:fixed!important;inset:0!important;z-index:10060!important;' +
    'background:' + PAPER + '!important;align-items:stretch!important;justify-content:stretch!important;' +
    'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;color:' + INK + '!important}' +
    '#tchiloPostMusicSheet.open{display:flex!important}' +
    '#tchiloPostMusicSheet .panel{width:100%!important;max-width:none!important;max-height:none!important;height:100%!important;' +
    'background:' + PAPER + '!important;color:' + INK + '!important;border:0!important;border-radius:0!important;' +
    'box-shadow:none!important;padding:12px 16px calc(16px + env(safe-area-inset-bottom))!important;' +
    'display:flex!important;flex-direction:column!important;gap:10px!important}' +
    '#tchiloPostMusicSheet .head{display:flex!important;justify-content:space-between!important;align-items:center!important;' +
    'padding-top:max(4px,env(safe-area-inset-top))!important}' +
    '#tchiloPostMusicSheet .head b{font-size:18px!important;font-weight:700!important;color:' + INK + '!important}' +
    '#tchiloPostMusicSheet .tabs{display:flex!important;gap:8px!important}' +
    '#tchiloPostMusicSheet .tab{flex:1!important;border:0!important;border-radius:10px!important;padding:10px!important;' +
    'font-weight:600!important;font-size:13px!important;background:rgba(11,11,12,.06)!important;color:' + INK + '!important;' +
    'cursor:pointer!important;box-shadow:none!important}' +
    '#tchiloPostMusicSheet .tab.on{background:rgba(11,11,12,.12)!important;color:' + INK + '!important}' +
    '#tchiloPostMusicSheet .close{border:0!important;background:rgba(11,11,12,.08)!important;color:' + INK + '!important;' +
    'border-radius:50%!important;width:36px!important;height:36px!important;font-size:18px!important;font-weight:600!important;' +
    'cursor:pointer!important;box-shadow:none!important;line-height:1!important}' +
    '#tchiloPostMusicSheet .search{display:flex!important;gap:8px!important;align-items:center!important;' +
    'background:#fff!important;border:1px solid rgba(11,11,12,.1)!important;border-radius:12px!important;' +
    'padding:12px 14px!important;box-shadow:none!important}' +
    '#tchiloPostMusicSheet .search input{flex:1!important;border:0!important;background:transparent!important;' +
    'color:' + INK + '!important;font-size:15px!important;font-weight:500!important;outline:none!important}' +
    '#tchiloPostMusicSheet .search input::placeholder{color:rgba(11,11,12,.4)!important}' +
    '#tchiloPostMusicSheet .list{flex:1!important;overflow:auto!important;-webkit-overflow-scrolling:touch!important;' +
    'min-height:0!important;scrollbar-width:none!important}' +
    '#tchiloPostMusicSheet .list::-webkit-scrollbar{display:none!important}' +
    /* track row */
    '#tchiloPostMusicSheet .track{display:flex!important;align-items:center!important;gap:12px!important;' +
    'padding:10px 2px!important;border:0!important;border-bottom:1px solid rgba(11,11,12,.08)!important;' +
    'border-radius:0!important;background:transparent!important;box-shadow:none!important;cursor:pointer!important;color:' + INK + '!important}' +
    '#tchiloPostMusicSheet .track:active{background:rgba(11,11,12,.04)!important}' +
    /* cover with play */
    '#tchiloPostMusicSheet .cover-play{position:relative!important;width:52px!important;height:52px!important;' +
    'border:0!important;padding:0!important;border-radius:10px!important;overflow:hidden!important;' +
    'background:rgba(11,11,12,.06)!important;flex-shrink:0!important;cursor:pointer!important;box-shadow:none!important}' +
    '#tchiloPostMusicSheet .cover-play img,#tchiloPostMusicSheet .cover-ph{width:100%!important;height:100%!important;' +
    'object-fit:cover!important;display:block!important;border:0!important;border-radius:10px!important;box-shadow:none!important}' +
    '#tchiloPostMusicSheet .cover-ph{background:rgba(11,11,12,.08)!important}' +
    '#tchiloPostMusicSheet .cover-ico{position:absolute!important;inset:0!important;display:flex!important;' +
    'align-items:center!important;justify-content:center!important;background:rgba(0,0,0,.28)!important;color:#fff!important}' +
    '#tchiloPostMusicSheet .cover-play.playing .cover-ico{background:rgba(0,0,0,.4)!important}' +
    '#tchiloPostMusicSheet .track .t{flex:1!important;min-width:0!important}' +
    '#tchiloPostMusicSheet .track .t b{display:block!important;font-size:15px!important;font-weight:600!important;' +
    'color:' + INK + '!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}' +
    '#tchiloPostMusicSheet .track .t span{display:block!important;font-size:12px!important;color:rgba(11,11,12,.5)!important;' +
    'white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;margin-top:2px!important}' +
    '#tchiloPostMusicSheet .favbtn,#tchiloPostMusicSheet .usebtn{width:40px!important;height:40px!important;border-radius:50%!important;' +
    'border:0!important;display:flex!important;align-items:center!important;justify-content:center!important;' +
    'box-shadow:none!important;cursor:pointer!important;flex-shrink:0!important;' +
    'background:rgba(11,11,12,.06)!important;color:' + INK + '!important}' +
    '#tchiloPostMusicSheet .favbtn.on{background:rgba(11,11,12,.12)!important;color:' + INK + '!important}' +
    '#tchiloPostMusicSheet .usebtn{background:rgba(11,11,12,.08)!important}' +
    '#tchiloPostMusicSheet .playbtn{display:none!important}' +
    '#tchiloPostMusicSheet .badge{display:none!important}' +
    '#tchiloPostMusicSheet .empty{color:rgba(11,11,12,.45)!important;text-align:center!important;padding:32px 16px!important}' +
    /* kill neo shadows on any leftover music cards */
    '#tchiloPostMusicSheet .track,#tchiloPostMusicSheet .cover-play,#tchiloPostMusicSheet img{' +
    'box-shadow:none!important;outline:none!important;filter:none!important}' +
    '#tchiloMusicUseSheet{background:rgba(11,11,12,.35)!important}' +
    '#tchiloMusicUseSheet .panel,#tchiloMusicUseSheet .sheet-panel{' +
    'background:' + PAPER + '!important;color:' + INK + '!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaEd .me-sheet-panel{background:' + PAPER + '!important;color:' + INK + '!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaEd .me-search{background:#fff!important;border:1px solid rgba(11,11,12,.1)!important;box-shadow:none!important}' +
    '#tchiloMediaEd .me-publish{background:' + INK + '!important;color:#fff!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaEd .me-iconbtn{border:0!important;background:rgba(11,11,12,.06)!important;color:' + INK + '!important;box-shadow:none!important}';

  var old = document.getElementById('tchilo-music-flat-css');
  if (old) old.remove();
  var s = document.createElement('style');
  s.id = 'tchilo-music-flat-css';
  s.textContent = css;
  (document.head || document.documentElement).appendChild(s);
})();
