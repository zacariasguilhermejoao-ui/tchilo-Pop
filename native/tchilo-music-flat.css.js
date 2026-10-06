/** Music sheet flat light — no borders, no neo, no black covers */
(function () {
  'use strict';
  if (window.__TCHILO_MUSIC_FLAT_V5) return;
  window.__TCHILO_MUSIC_FLAT_V5 = true;

  var PAPER = 'var(--paper,#F3F1E9)';
  var INK = 'var(--ink,#0B0B0C)';

  var css =
    '#tchiloPostMusicSheet{display:none!important;position:fixed!important;inset:0!important;z-index:10060!important;' +
    'background:' + PAPER + '!important;align-items:stretch!important;justify-content:stretch!important;' +
    'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;color:' + INK + '!important}' +
    '#tchiloPostMusicSheet.open{display:flex!important}' +
    '#tchiloPostMusicSheet .panel{width:100%!important;max-width:none!important;max-height:none!important;height:100%!important;' +
    'background:' + PAPER + '!important;color:' + INK + '!important;border:0!important;border-radius:0!important;' +
    'box-shadow:none!important;outline:none!important;padding:12px 16px calc(16px + env(safe-area-inset-bottom))!important;' +
    'display:flex!important;flex-direction:column!important;gap:10px!important}' +
    '#tchiloPostMusicSheet .head{display:flex!important;justify-content:space-between!important;align-items:center!important;' +
    'padding-top:max(4px,env(safe-area-inset-top))!important}' +
    '#tchiloPostMusicSheet .head b{font-size:18px!important;font-weight:700!important;color:' + INK + '!important}' +
    '#tchiloPostMusicSheet .tabs{display:flex!important;gap:8px!important}' +
    '#tchiloPostMusicSheet .tab{flex:1!important;border:0!important;border-radius:10px!important;padding:10px!important;' +
    'font-weight:600!important;font-size:13px!important;background:transparent!important;color:' + INK + '!important;' +
    'cursor:pointer!important;box-shadow:none!important;outline:none!important}' +
    '#tchiloPostMusicSheet .tab.on{background:rgba(11,11,12,.12)!important;color:' + INK + '!important;' +
    'background-image:none!important}' +
    '#tchiloPostMusicSheet .close{border:0!important;background:transparent!important;color:' + INK + '!important;' +
    'border-radius:50%!important;width:36px!important;height:36px!important;box-shadow:none!important}' +
    '#tchiloPostMusicSheet .search{background:#fff!important;border:1px solid rgba(11,11,12,.1)!important;border-radius:12px!important;' +
    'box-shadow:none!important;padding:12px 14px!important}' +
    '#tchiloPostMusicSheet .search input{border:0!important;background:transparent!important;color:' + INK + '!important;outline:none!important}' +
    '#tchiloPostMusicSheet .list{flex:1!important;overflow:auto!important;min-height:0!important;-webkit-overflow-scrolling:touch!important}' +
    /* TRACKS — no card border, no black frame */
    '#tchiloPostMusicSheet .track,' +
    '#tchiloPostMusicSheet .list > .track,' +
    '#tchiloPostMusicSheet .list > div.track{' +
    'display:flex!important;align-items:center!important;gap:12px!important;' +
    'padding:12px 0!important;margin:0!important;' +
    'border:0!important;border-bottom:1px solid rgba(11,11,12,.08)!important;' +
    'border-radius:0!important;background:transparent!important;' +
    'box-shadow:none!important;outline:none!important;filter:none!important}' +
    '#tchiloPostMusicSheet .track:active{background:rgba(11,11,12,.04)!important}' +
    /* COVER — no black bg, no border */
    '#tchiloPostMusicSheet .cover-play,' +
    '#tchiloPostMusicSheet .track img,' +
    '#tchiloPostMusicSheet .track .cover-play img{' +
    'border:0!important;box-shadow:none!important;outline:none!important}' +
    '#tchiloPostMusicSheet .cover-play{' +
    'position:relative!important;width:52px!important;height:52px!important;padding:0!important;' +
    'border-radius:10px!important;overflow:hidden!important;flex-shrink:0!important;' +
    'background:transparent!important;cursor:pointer!important}' +
    '#tchiloPostMusicSheet .cover-play img{' +
    'width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;' +
    'border-radius:10px!important;background:transparent!important}' +
    '#tchiloPostMusicSheet .cover-ph{width:100%!important;height:100%!important;background:rgba(11,11,12,.06)!important;border-radius:10px!important}' +
    '#tchiloPostMusicSheet .cover-ico{' +
    'position:absolute!important;inset:0!important;display:flex!important;align-items:center!important;' +
    'justify-content:center!important;background:rgba(0,0,0,.25)!important;color:#fff!important;pointer-events:none!important}' +
    '#tchiloPostMusicSheet .track .t{flex:1!important;min-width:0!important}' +
    '#tchiloPostMusicSheet .track .t b{display:block!important;font-size:15px!important;font-weight:600!important;color:' + INK + '!important;' +
    'white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}' +
    '#tchiloPostMusicSheet .track .t span{display:block!important;font-size:12px!important;color:rgba(11,11,12,.5)!important;' +
    'white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;margin-top:2px!important}' +
    '#tchiloPostMusicSheet .favbtn,#tchiloPostMusicSheet .usebtn{' +
    'width:40px!important;height:40px!important;border-radius:50%!important;border:0!important;' +
    'background:transparent!important;color:' + INK + '!important;box-shadow:none!important;' +
    'display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important}' +
    '#tchiloPostMusicSheet .favbtn.on{background:rgba(11,11,12,.12)!important}' +
    '#tchiloPostMusicSheet .playbtn{display:none!important}' +
    '#tchiloPostMusicSheet .badge{display:none!important}' +
    /* kill any residual neo yellow */
    '#tchiloPostMusicSheet .tab.on,#tchiloPostMusicSheet button.tab.on{' +
    'background:rgba(11,11,12,.12)!important;color:' + INK + '!important;' +
    'background-color:rgba(11,11,12,.12)!important}';

  var old = document.getElementById('tchilo-music-flat-css');
  if (old) try { old.remove(); } catch (e) {}
  var s = document.createElement('style');
  s.id = 'tchilo-music-flat-css';
  s.textContent = css;
  (document.head || document.documentElement).appendChild(s);
})();
