/* Shared behaviour for every page: page transitions, clock, cursor, magnetic buttons. */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var Site = window.Site = {};

  /* ---------- page transition ("shutter") ---------- */
  var css = document.createElement('style');
  css.textContent =
    '#pt{position:fixed;inset:0;z-index:150;pointer-events:none}' +
    '#pt .sh{position:absolute;left:0;right:0;height:50.5%;background:#060605;transition:transform .75s cubic-bezier(.77,0,.18,1)}' +
    '#pt .t{top:0;transform:translateY(-101%)}#pt .b{bottom:0;transform:translateY(101%)}' +
    '#pt .ln{position:absolute;left:0;right:0;top:50%;height:1px;background:#E0563B;box-shadow:0 0 18px rgba(224,86,59,.9);transform:scaleX(0);transition:transform .5s cubic-bezier(.77,0,.18,1)}' +
    '#pt .lb{position:absolute;left:50%;top:50%;transform:translate(-50%,-180%);font:500 11px "IBM Plex Mono",monospace;letter-spacing:.2em;text-transform:uppercase;color:#E0563B;opacity:0;transition:opacity .3s}' +
    '#pt.cover{pointer-events:auto}#pt.cover .sh{transform:none}#pt.cover .ln{transform:scaleX(1);transition-delay:.45s}#pt.cover .lb{opacity:1;transition-delay:.4s}';
  document.head.appendChild(css);
  var pt = document.createElement('div'); pt.id = 'pt'; pt.setAttribute('aria-hidden', 'true');
  pt.innerHTML = '<div class="sh t"></div><div class="sh b"></div><div class="ln"></div><div class="lb">Developing</div>';
  var arrived = false;
  try { arrived = sessionStorage.getItem('pt') === '1'; sessionStorage.removeItem('pt'); } catch(e){}
  if (arrived && !reduce) {
    pt.classList.add('cover');
    pt.querySelectorAll('.sh,.ln,.lb').forEach(function(el){ el.style.transition = 'none'; });
  }
  document.addEventListener('DOMContentLoaded', function(){
    document.body.appendChild(pt);
    if (arrived && !reduce) {
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        pt.querySelectorAll('.sh,.ln,.lb').forEach(function(el){ el.style.transition = ''; });
        pt.classList.remove('cover');
      }); });
    }
  });
  window.addEventListener('pageshow', function(e){ if (e.persisted) pt.classList.remove('cover'); });
  var names = { 'index.html':'Home', 'photography.html':'Contact sheet', 'case-launch-auditor.html':'Case study', 'case-ops-dashboard.html':'Case study', 'case-hermes.html':'Case study' };
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href]'); if (!a) return;
    var href = a.getAttribute('href');
    if (!/\.html(#.*)?$/.test(href) || /^(https?:|mailto:)/.test(href) || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    pt.querySelector('.lb').textContent = 'Developing · ' + (names[href.split('#')[0]] || '');
    pt.classList.add('cover');
    try { sessionStorage.setItem('pt', '1'); } catch(err){}
    setTimeout(function(){ location.href = href; }, 900);
  });

  /* ---------- mobile menu (all pages) ---------- */
  var mcss = document.createElement('style');
  mcss.textContent =
    '.mbtn{display:none;position:relative;width:44px;height:44px;border:1px solid #2A2825;border-radius:50%;background:none;color:#ECE7DD;padding:0;margin-left:4px;flex:0 0 auto}' +
    '.mbtn i{position:absolute;left:13px;right:13px;height:1.5px;background:currentColor;transition:transform .45s cubic-bezier(.77,0,.18,1),top .45s cubic-bezier(.77,0,.18,1)}' +
    '.mbtn i:nth-child(1){top:17px}.mbtn i:nth-child(2){top:25px}' +
    '.menu-open .mbtn{border-color:#E0563B}.menu-open .mbtn i:nth-child(1){top:21px;transform:rotate(45deg)}.menu-open .mbtn i:nth-child(2){top:21px;transform:rotate(-45deg)}' +
    '#mnav{position:fixed;inset:0;z-index:45;background:#0B0B0A;display:flex;flex-direction:column;justify-content:space-between;padding:110px clamp(20px,4vw,64px) 32px;clip-path:inset(0 0 100% 0);transition:clip-path .7s cubic-bezier(.77,0,.18,1);visibility:hidden}' +
    '#mnav::before{content:"";position:absolute;left:50%;top:45%;width:140vw;height:140vw;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(224,86,59,.16),rgba(224,86,59,0) 60%);pointer-events:none}' +
    '.menu-open #mnav{clip-path:inset(0 0 0 0);visibility:visible}' +
    '#mnav ol{position:relative;list-style:none;margin:0;padding:0;display:flex;flex-direction:column}' +
    '#mnav li{border-top:1px solid #2A2825;overflow:hidden}#mnav li:last-child{border-bottom:1px solid #2A2825}' +
    '#mnav li a{display:flex;align-items:baseline;gap:16px;padding:18px 0;color:#ECE7DD;transform:translateY(110%);transition:transform .8s cubic-bezier(.19,1,.22,1),color .3s}' +
    '.menu-open #mnav li a{transform:none}' +
    '#mnav li a .n{font:500 11px "IBM Plex Mono",monospace;letter-spacing:.14em;color:#8F887C;min-width:22px}' +
    '#mnav li a .t{font-family:"Fraunces",Georgia,serif;font-weight:500;font-size:clamp(40px,12vw,64px);line-height:1;letter-spacing:-.02em;font-variation-settings:"opsz" 144,"SOFT" 50}' +
    '#mnav li a.cur .t{color:#E0563B;font-style:italic;font-variation-settings:"opsz" 144,"SOFT" 100}#mnav li a.cur .n{color:#E0563B}' +
    '#mnav .ft{position:relative;display:flex;flex-direction:column;gap:14px;opacity:0;transform:translateY(12px);transition:all .6s .45s}' +
    '.menu-open #mnav .ft{opacity:1;transform:none}' +
    '#mnav .ft a{color:#ECE7DD;font-size:17px;border-bottom:1px solid #E0563B;align-self:flex-start;padding-bottom:3px}' +
    '#mnav .ft span{font:500 11px "IBM Plex Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:#8F887C}' +
    '.menu-open{overflow:hidden}' +
    '@media (max-width:760px){.mbtn{display:block}nav.top{z-index:60}}' +
    '@media (max-width:380px){nav.top .rec span{display:none}}';
  document.head.appendChild(mcss);
  function buildMenu(){
    var nav = document.querySelector('nav.top'); if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll('ul a'));
    var here = location.pathname.split('/').pop() || 'index.html';
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'mbtn';
    btn.setAttribute('aria-label', 'Open menu'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'mnav');
    btn.innerHTML = '<i></i><i></i>';
    nav.appendChild(btn);
    var m = document.createElement('div'); m.id = 'mnav'; m.setAttribute('aria-label', 'Menu');
    var html = '<ol>';
    links.forEach(function(a, i){
      var href = a.getAttribute('href'); var file = href.split('#')[0];
      var cur = (file && file === here && href.indexOf('#') < 0) || a.classList.contains('act') && file === here;
      html += '<li><a href="' + href + '"' + (cur ? ' class="cur" aria-current="page"' : '') + ' style="transition-delay:' + (0.15 + i * 0.07) + 's"><span class="n">0' + (i + 1) + '</span><span class="t">' + a.textContent + '</span></a></li>';
    });
    html += '</ol><div class="ft"><a href="mailto:ovais.mukhtar@gmail.com">ovais.mukhtar@gmail.com</a><a href="https://ae.linkedin.com/in/ovais">LinkedIn ↗</a><span data-clock="Dubai · {t}">Dubai</span></div>';
    m.innerHTML = html;
    nav.parentNode.insertBefore(m, nav.nextSibling);
    function set(open){ document.documentElement.classList.toggle('menu-open', open); document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
    btn.addEventListener('click', function(){ set(!document.body.classList.contains('menu-open')); });
    m.addEventListener('click', function(e){ if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') set(false); });
    addEventListener('resize', function(){ if (innerWidth > 760) set(false); });
    try{ var s = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dubai'}); m.querySelector('[data-clock]').textContent = 'Dubai · ' + s; }catch(e){}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildMenu); else buildMenu();

  /* ---------- theme: dark by default, light on request (remembered) ---------- */
  var root = document.documentElement;
  var SUN = '<svg class="sun" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.1 1.1M11.9 11.9L13 13M3 13l1.1-1.1M11.9 4.1L13 3"/></svg>';
  var MOON = '<svg class="moon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M13.5 9.8A5.8 5.8 0 0 1 6.2 2.5a5.8 5.8 0 1 0 7.3 7.3z"/></svg>';
  function curTheme(){ return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  function applyTheme(t){
    if (t === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
    try { localStorage.setItem('ovy-theme', t); } catch(e){}
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'light' ? '#F3EFE7' : '#0B0B0A');
    syncBtns();
  }
  function syncBtns(){
    var t = curTheme();
    document.querySelectorAll('.thm').forEach(function(b){
      b.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
      var l = b.querySelector('.lbl'); if (l) l.textContent = t === 'light' ? 'Light' : 'Dark';
    });
  }
  function switchTheme(){
    var next = curTheme() === 'light' ? 'dark' : 'light';
    if (reduce || !document.body.animate) { applyTheme(next); return; }
    var col = next === 'light' ? '#F3EFE7' : '#0B0B0A';
    var w = document.createElement('div'); w.id = 'tw';
    w.style.cssText = 'position:fixed;inset:0;z-index:140;pointer-events:none';
    w.innerHTML = '<div class="f" style="position:absolute;inset:0;background:' + col + ';clip-path:inset(0 0 100% 0)"></div><div class="ln" style="position:absolute;left:0;right:0;top:0;height:2px;background:#E0563B;box-shadow:0 0 16px rgba(224,86,59,.8)"></div>';
    document.body.appendChild(w);
    var f = w.querySelector('.f'), ln = w.querySelector('.ln'), ez = 'cubic-bezier(.77,0,.18,1)';
    f.animate([{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)'}], {duration:560, easing:ez, fill:'forwards'});
    ln.animate([{transform:'translateY(0)'},{transform:'translateY(' + innerHeight + 'px)'}], {duration:560, easing:ez, fill:'forwards'}).onfinish = function(){
      applyTheme(next);
      w.animate([{opacity:1},{opacity:0}], {duration:420, easing:'ease-out', fill:'forwards'}).onfinish = function(){ w.remove(); };
    };
  }
  function buildToggle(){
    var rec = document.querySelector('nav.top .rec'); if (!rec || rec.querySelector('.thm')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'thm';
    b.innerHTML = MOON + SUN + '<span class="lbl">Dark</span>';
    b.addEventListener('click', switchTheme);
    rec.appendChild(b); syncBtns();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildToggle); else buildToggle();
  Site.theme = { get: curTheme, set: applyTheme, toggle: switchTheme };

  /* ---------- helpers for sub-pages ---------- */
  Site.reduce = reduce; Site.fine = fine;
  Site.clock = function(){
    function tick(){ try{ var s = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dubai'});
      document.querySelectorAll('[data-clock]').forEach(function(el){ el.textContent = el.getAttribute('data-clock').replace('{t}', s); }); }catch(e){} }
    tick(); setInterval(tick, 15000);
  };
  Site.navScroll = function(){
    var nav = document.getElementById('nav'); if (!nav) return;
    var f = function(){ nav.classList.toggle('scrolled', scrollY > 20); }; f();
    addEventListener('scroll', f, {passive:true});
  };
  Site.cursor = function(){
    if (!fine || reduce) return;
    document.body.classList.add('has-cursor');
    var cur = document.getElementById('cur'); if (!cur) return;
    var mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
    addEventListener('mousemove', function(e){ mx = e.clientX; my = e.clientY; });
    (function loop(){ cx += (mx-cx)*.18; cy += (my-cy)*.18; cur.style.transform = 'translate3d('+cx+'px,'+cy+'px,0)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function(e){
      var v = e.target.closest('[data-cursor="view"]'), l = e.target.closest('a,button');
      cur.classList.toggle('view', !!v); cur.classList.toggle('link', !v && !!l);
    });
    document.querySelectorAll('.mag').forEach(function(m){
      m.addEventListener('mousemove', function(e){ var r = m.getBoundingClientRect(); m.style.transform = 'translate('+((e.clientX-r.left-r.width/2)*.25)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)'; });
      m.addEventListener('mouseleave', function(){ m.style.transform = ''; });
    });
  };
})();
