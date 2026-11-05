/* Golf Club Bad Saarow | page script (Client-First build). Hooks use data attributes only. */
(() => {
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const html = document.documentElement;
html.lang = 'de';

/* Webflow renders <button> from the HTML builder as links with type="button": restore real buttons */
$$('a[type="button"]').forEach(a => { const b = document.createElement('button'); [...a.attributes].forEach(at => { if (at.name !== 'href') b.setAttribute(at.name, at.value); }); b.type = 'button'; b.classList.remove('w-button'); b.innerHTML = a.innerHTML; a.replaceWith(b); });

/* PC CADDIE embeds are shown right away; the placeholder only remains without JavaScript */
const loadEmbed = c => { if (c.dataset.loaded) return; c.dataset.loaded = '1'; const h = +c.dataset.embedHeight || 900;
  const f = document.createElement('iframe'); f.className = 'embed_frame'; f.src = c.dataset.embed; f.title = 'PC CADDIE | ' + (c.dataset.embedTitle || 'Buchung'); f.style.height = h + 'px';
  c.replaceChildren(f); setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 800); };
$$('[data-embed^="http"]').forEach(loadEmbed);

/* Map (MapLibre + OpenFreeMap, no API key), tinted to the brand palette, loaded when it comes near the viewport */
const mapEl = $('[data-map]');
if (mapEl) {
  const COURSES = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[14.02503,52.24284],[14.02716,52.2426],[14.02665,52.23937],[14.02872,52.23883],[14.02884,52.23965],[14.02926,52.24006],[14.02989,52.23981],[14.03016,52.24066],[14.0311,52.24083],[14.03138,52.24038],[14.03212,52.24124],[14.03187,52.24136],[14.03286,52.24211],[14.03205,52.24369],[14.03247,52.24382],[14.03215,52.24456],[14.03233,52.24528],[14.0314,52.24578],[14.02867,52.24881],[14.0274,52.24831],[14.02702,52.24859],[14.02639,52.24778],[14.02503,52.24284]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[14.00937,52.25136],[14.01382,52.24867],[14.01682,52.24573],[14.01824,52.24584],[14.02168,52.24974],[14.0221,52.25139],[14.02109,52.25216],[14.02128,52.25228],[14.02015,52.25285],[14.02129,52.25357],[14.02188,52.2533],[14.02223,52.25384],[14.02306,52.2534],[14.02319,52.25365],[14.01954,52.25807],[14.01519,52.25942],[14.01449,52.25786],[14.01191,52.25768],[14.01184,52.25683],[14.01344,52.25636],[14.01146,52.25431],[14.00937,52.25136]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[14.01682,52.24573],[14.01942,52.24277],[14.01962,52.24157],[14.01929,52.24137],[14.02396,52.23952],[14.02522,52.24534],[14.02618,52.24778],[14.02794,52.24951],[14.02742,52.25046],[14.02766,52.25057],[14.02746,52.25074],[14.02714,52.25047],[14.0261,52.25094],[14.02553,52.25044],[14.02323,52.25216],[14.0221,52.25139],[14.02168,52.24974],[14.02006,52.24764],[14.01932,52.24719],[14.01881,52.24619],[14.01824,52.24584],[14.01682,52.24573]]]}}]};
  const V = 'https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.0/dist/maplibre-gl';
  const css = h => new Promise(r => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = h; l.onload = r; l.onerror = r; document.head.append(l); });
  const js = h => new Promise((r, j) => { const t = document.createElement('script'); t.src = h; t.onload = r; t.onerror = j; document.head.append(t); });
  const tint = st => { st.layers.forEach(l => { const id = l.id, p = l.paint = l.paint || {};
    if (l.type === 'background') p['background-color'] = '#f1efe7';
    else if (l.type === 'fill') {
      if (/water/.test(id)) { p['fill-color'] = '#c4d3cd'; delete p['fill-opacity']; }
      else if (/building/.test(id)) p['fill-color'] = '#e6e2d6';
      else if (/park|wood|forest|grass|landcover|landuse|golf|cemetery/.test(id)) p['fill-color'] = '#e3e5d8'; }
    else if (l.type === 'line') {
      if (/water|river|stream|canal/.test(id)) p['line-color'] = '#b3c6bf';
      else if (/casing/.test(id)) p['line-color'] = '#dcd7ca';
      else if (/road|highway|street|bridge|tunnel|path|track|minor|major|motorway|trunk|primary|secondary|tertiary/.test(id)) p['line-color'] = /motorway|trunk|primary/.test(id) ? '#e9dfc9' : '#ffffff';
      else if (/boundary|admin/.test(id)) p['line-opacity'] = .25; }
    else if (l.type === 'symbol') {
      if (/poi/.test(id)) { l.layout = Object.assign({}, l.layout, { visibility: 'none' }); return; }
      if (l.layout && l.layout['text-field']) { p['text-color'] = /water/.test(id) ? '#5f7d72' : '#5b625e'; p['text-halo-color'] = '#f1efe7'; p['text-halo-width'] = 1.2; } } });
    return st; };
  const init = async () => {
    await Promise.all([css(V + '.css'), js(V + '.js')]);
    const st = tint(await (await fetch('https://tiles.openfreemap.org/styles/positron')).json());
    const map = new maplibregl.Map({ container: mapEl, style: st, center: [14.022, 52.248], zoom: 13.3, attributionControl: { compact: true }, cooperativeGestures: true, dragRotate: false, pitchWithRotate: false,
      locale: { 'CooperativeGesturesHandler.WindowsHelpText': 'Strg + Scrollen zum Zoomen', 'CooperativeGesturesHandler.MacHelpText': '⌘ + Scrollen zum Zoomen', 'CooperativeGesturesHandler.MobileHelpText': 'Mit zwei Fingern bewegen', 'NavigationControl.ZoomIn': 'Hineinzoomen', 'NavigationControl.ZoomOut': 'Herauszoomen' } });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    const fit = () => { const b = new maplibregl.LngLatBounds(); COURSES.features.forEach(f => f.geometry.coordinates[0].forEach(c => b.extend(c))); b.extend([14.02908, 52.2380]);
      const w = mapEl.clientWidth, d = w > 900; map.fitBounds(b, { padding: { top: 50, bottom: d ? 110 : 50, left: d ? Math.min(440, w * .38) : 30, right: d ? 60 : 30 }, duration: 0 }); };
    map.on('load', () => {
      map.addSource('courses', { type: 'geojson', data: COURSES });
      map.addLayer({ id: 'courses-fill', type: 'fill', source: 'courses', paint: { 'fill-color': '#173d30', 'fill-opacity': .15 } });
      map.addLayer({ id: 'courses-line', type: 'line', source: 'courses', paint: { 'line-color': '#173d30', 'line-width': 1.4, 'line-opacity': .5 } });
      fit(); });
    const mk = (ll, h, c, anchor) => { const d = document.createElement('div'); d.className = 'map_marker' + c; d.innerHTML = h; new maplibregl.Marker({ element: d, anchor }).setLngLat(ll).addTo(map); };
    mk([14.02939, 52.23973], '<span class="map_marker-label">Clubhaus | Greenside</span><span class="map_marker-pin"></span>', '', 'bottom');
    mk([14.02908, 52.23863], '<span class="map_marker-pin"></span><span class="map_marker-label">Precise Resort</span>', ' is-resort', 'top');
    [['Faldo Course Berlin', 14.0205, 52.2470], ['Arnold Palmer', 14.0300, 52.2455], ['Stan Eby', 14.0170, 52.2540]].forEach(([n, x, y]) => mk([x, y], `<span class="map_course-label">${n}</span>`, ' is-course', 'center'));
    addEventListener('resize', () => { clearTimeout(mapEl._t); mapEl._t = setTimeout(fit, 250); });
  };
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); init().catch(() => mapEl.classList.add('is-failed')); } }, { rootMargin: '400px' });
  io.observe(mapEl);
}

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ANIM = !RM && window.gsap && window.ScrollTrigger && window.SplitText;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const FRAMES = 24, turn = (el, deg) => { const f = ((Math.round(deg / (360 / FRAMES)) % FRAMES) + FRAMES) % FRAMES; el.style.backgroundPosition = `${(f / (FRAMES - 1)) * 100}% 0`; };
const masked = sp => { (sp.masks || []).forEach(m => { m.style.padding = '.06em .1em .2em .02em'; m.style.margin = '-.06em -.1em -.2em -.02em'; }); return sp; };
/* custom arrow: an editorial half-barb instead of the stock glyph */
const ARROW = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 12.5 12.5 3.5M5.5 3.5h7v7" stroke="currentColor" stroke-width="1.25" stroke-linecap="square"/></svg>';
$$('.button_arrow,[data-arrow]').forEach(a => { a.innerHTML = ARROW; });
/* rolling letters on footer and menu links */
$$('.footer_link,.menu_link,.navbar_link').forEach(a => { const ext = a.textContent.includes('↗'); const t = a.textContent.replace('↗', '').trim(); if (!t) return; a.setAttribute('aria-label', t + (ext ? ' (neues Fenster)' : '')); a.classList.add('bs-roll'); a.innerHTML = '<span class="bs-roll_inner" aria-hidden="true">' + [...t].map((c, i) => `<span class="bs-roll_char" style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('') + '</span>' + (ext ? '<span class="bs-ext" aria-hidden="true">' + ARROW + '</span>' : ''); });
const mw = $('.main-wrapper'); if (mw && !mw.id) mw.id = 'main';

/* smooth scroll */
let lenis = null;
if (ANIM && window.Lenis) {
  lenis = new Lenis({ lerp: .085, smoothWheel: true, wheelMultiplier: .9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  if (html.classList.contains('is-loading')) lenis.stop();
}
const scrollToY = y => lenis ? lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
const yOf = t => { const sp = t.closest('.pin-spacer'); return (sp || t).getBoundingClientRect().top + scrollY; };
const samePage = a => a.hash && a.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '');
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]'); if (!a || a.hasAttribute('data-course-link') || !samePage(a)) return;
  let t; try { t = a.hash.length > 1 && document.querySelector(decodeURIComponent(a.hash)); } catch (_) {} if (!t) return;
  e.preventDefault(); scrollToY(yOf(t)); history.replaceState(null, '', a.hash);
});
if (location.hash.length > 1) addEventListener('load', () => { let t; try { t = document.querySelector(decodeURIComponent(location.hash)); } catch (_) {} if (t) setTimeout(() => { window.ScrollTrigger && ScrollTrigger.refresh(); const y = yOf(t); lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, 400); });

/* navbar: transparent over hero, solid after, hides on scroll down */
const nav = $('[data-nav]'), toggle = $('[data-menu-toggle]'), menu = $('[data-menu]');
const label = toggle && toggle.querySelector('.navbar_menu-label');
let lastY = 0, menuOpen = false;
const onScroll = y => {
  if (menuOpen) return;
  nav.classList.toggle('is-transparent', y < innerHeight * .85);
  nav.classList.toggle('is-hidden', y > innerHeight * 1.2 && y > lastY + 2);
  if (y < lastY - 2) nav.classList.remove('is-hidden');
  lastY = y;
};
lenis ? lenis.on('scroll', e => onScroll(e.scroll)) : addEventListener('scroll', () => onScroll(scrollY), { passive: true });
onScroll(scrollY);

/* menu overlay */
let menuTl = null;
const setMenu = open => {
  menuOpen = open; toggle.setAttribute('aria-expanded', open); toggle.classList.toggle('is-open', open);
  if (label) label.textContent = open ? 'Schließen' : 'Menü';
  if (open) { nav.classList.add('is-transparent'); nav.classList.remove('is-hidden'); lenis && lenis.stop(); }
  else { lenis && lenis.start(); menuOpen = false; onScroll(scrollY); }
  menuTl && menuTl.kill();
  if (!ANIM) { menu.style.display = open ? 'block' : 'none'; return; }
  if (open) {
    menu.style.display = 'block';
    menuTl = gsap.timeline()
      .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' })
      .fromTo($$('.menu_heading-link', menu), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, stagger: .06, ease: 'expo.out' }, .45)
      .fromTo($$('.menu_item', menu), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .015, ease: 'expo.out' }, .55)
      .fromTo($('[data-menu-visuals]', menu), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' }, .35)
      .fromTo($('.menu_footer', menu), { opacity: 0 }, { opacity: 1, duration: .6 }, .8);
  } else {
    menuTl = gsap.timeline({ onComplete: () => { menu.style.display = 'none'; } }).to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: .8, ease: 'expo.inOut' });
  }
};
toggle.addEventListener('click', () => setMenu(!menuOpen));
$$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
const visuals = $$('.menu_visual-item', menu);
$$('[data-menu-visual]', menu).forEach(c => c.addEventListener('pointerenter', () => visuals.forEach((v, k) => v.classList.toggle('is-active', k === +c.dataset.menuVisual))));

/* faq accordion */
$$('[data-faq-item]').forEach(item => {
  const btn = $('[data-faq-button]', item), ans = $('[data-faq-answer]', item);
  btn.addEventListener('click', () => { const on = !item.classList.contains('is-open'); item.classList.toggle('is-open', on); ans.classList.toggle('is-open', on); btn.setAttribute('aria-expanded', on); setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 850); });
});

/* lightbox */
const lb = $('[data-lightbox]'), lbImg = $('[data-lb-img]'); let lastF;
const closeLb = () => { if (!lb || !lb.classList.contains('is-open')) return; lb.classList.remove('is-open'); lenis && lenis.start(); lastF && lastF.focus(); };
$$('[data-gallery-item],[data-gallery-center]').forEach(f => { const im = $('img', f); if (!im) return; f.tabIndex = 0; f.setAttribute('role', 'button'); f.setAttribute('aria-label', 'Bild öffnen: ' + im.alt);
  const open = () => { lastF = f; lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lb.classList.add('is-open'); lenis && lenis.stop(); $('[data-lightbox-close]').focus(); };
  f.addEventListener('click', open); f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }); });
if (lb) $('[data-lightbox-close]').addEventListener('click', closeLb); lb && lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { if (menuOpen) setMenu(false); closeLb(); } });

/* footer wordmark fits its width */
const fit = () => { const t = $('[data-footer-word]'); if (!t) return; const w = t.parentElement; t.style.fontSize = '100px'; t.style.fontSize = Math.floor(100 * w.clientWidth / t.offsetWidth * .985) + 'px'; };
fit(); addEventListener('resize', () => { clearTimeout(fit.t); fit.t = setTimeout(fit, 150); });

/* course index: the ball rolls down to the active course */
const panelsBox = $('[data-course-panels]'), panels = $$('[data-course-panel]'), rows = $$('[data-course-row]'), ball = $('[data-course-ball]'), sprite = ball && $('.home-courses_ball-sprite', ball);
const HASC = !!panelsBox && !!ball;
if (HASC) { panelsBox.classList.add('is-js'); panels.forEach(p => { p.classList.add('is-js'); $('.home-courses_panel-image-wrapper', p).classList.add('is-js'); }); }
let cur = 0;
const rowY = i => rows[i].offsetTop + rows[i].offsetHeight / 2;
const placeBall = i => gsap.set(ball, { y: rowY(i) });
const show = (i, instant) => {
  rows.forEach((r, k) => { r.classList.toggle('is-active', k === i); r.setAttribute('aria-selected', k === i); });
  const a = panels[cur], b = panels[i], parts = p => [$('.home-courses_panel-title', p), $('p', p), ...$$('.home-courses_tag', p)];
  if (!ANIM || instant || a === b) panels.forEach((n, k) => n.classList.toggle('is-active', k === i));
  else {
    gsap.to(parts(a), { opacity: 0, y: -14, duration: .45, stagger: .03, ease: 'power2.inOut', overwrite: true, onComplete: () => a.classList.remove('is-active') });
    b.classList.add('is-active');
    const iw = $('.home-courses_panel-image-wrapper', b), dir = i > cur ? 1 : -1;
    gsap.fromTo(iw, { clipPath: dir > 0 ? 'inset(100% 0% 0% 0% round 4px)' : 'inset(0% 0% 100% 0% round 4px)' }, { clipPath: 'inset(0% 0% 0% 0% round 4px)', duration: 1.3, ease: 'expo.inOut', overwrite: true });
    gsap.fromTo($('img', iw), { scale: 1.18, yPercent: dir * 6 }, { scale: 1, yPercent: 0, duration: 1.8, ease: 'expo.out' });
    gsap.fromTo(parts(b), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, stagger: .06, delay: .4, ease: 'expo.out', overwrite: true });
  }
  if (ANIM && !instant && cur !== i) {
    const from = rowY(cur), to = rowY(i), o = { t: 0 };
    gsap.to(o, { t: 1, duration: .9 + Math.abs(i - cur) * .15, ease: 'power3.inOut', overwrite: true, onUpdate: () => { gsap.set(ball, { y: from + (to - from) * o.t }); turn(sprite, (from + (to - from) * o.t) * 3); } });
  } else placeBall(i);
  cur = i;
};
if (HASC) { show(0, true); addEventListener('resize', () => placeBall(cur)); }
let mapST = null;
const goStep = i => { if (mapST) scrollToY(mapST.start + (mapST.end - mapST.start) * (i / 4 + .06)); else show(i); };
rows.forEach((r, i) => r.addEventListener('click', () => goStep(i)));
$$('[data-course-link]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); setMenu(false); setTimeout(() => goStep(+a.dataset.courseLink), 500); }));

/* newsletter demo form: submission is intercepted, nothing is sent, the concept says so */
const nl = $('[data-newsletter]');
if (nl) {
  const msg = $('[data-newsletter-message]', nl), mail = $('[data-newsletter-email]', nl) || $('input[type=email]', nl), form = $('[data-newsletter-form]', nl);
  let ok = $('[data-newsletter-consent]', nl); if (!ok || ok.tagName !== 'INPUT') ok = $('input[type=checkbox]', nl);
  const submit = e => {
    if (e) { e.preventDefault(); e.stopImmediatePropagation(); }
    if (!mail.value || !mail.checkValidity()) { msg.textContent = 'Bitte gebt eine gültige E-Mail-Adresse ein.'; mail.focus(); }
    else if (!ok.checked) msg.textContent = 'Bitte bestätigt die Datenschutzerklärung.';
    else { msg.textContent = 'Danke! Das war eine Demo, es wurde nichts gespeichert.'; mail.value = ''; ok.checked = false; }
    if (ANIM && window.gsap) gsap.fromTo(msg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out' });
    return false;
  };
  if (form) { form.setAttribute('action', '#'); form.removeAttribute('data-name'); }
  addEventListener('submit', e => { if (e.target === form || (form && form.contains(e.target))) submit(e); }, true);
  $$('[data-newsletter-submit]', nl).forEach(btn => btn.addEventListener('click', submit));
}

const loader = $('[data-loader]');
const endLoad = () => { html.classList.remove('is-loading'); loader && (loader.style.display = 'none'); lenis && lenis.start(); };
if (!ANIM) { endLoad(); return; }
gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'power3.out' });
const S = 1.6;
const mm = gsap.matchMedia();

/* loader: a ball rolls into the hole, the curtain closes onto the line and reveals the hero */
const HERO = !!$('[data-hero]');
const ln = { v: 0 };
const heroLines = $$('[data-hero-line]').map(l => masked(SplitText.create(l, { type: 'words', mask: 'words' })).words);
gsap.set('[data-hero-image] img', { scale: 1.3 });
const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
let t0 = .15;
if (html.classList.contains('is-loading') && loader) {
  const lBall = $('[data-loader-ball]', loader), lSprite = $('.loader_ball-sprite', loader), lHole = $('[data-loader-hole]', loader), lFlag = $('[data-loader-flag]', loader);
  const target = () => lHole.offsetLeft + lHole.offsetWidth / 2 - lBall.offsetWidth / 2;
  gsap.set(lFlag, { scaleY: 0 });
  intro.from($$('.loader_top > *,.loader_bottom > *', loader), { opacity: 0, y: 14, duration: 1, stagger: .08 }, 0)
    .to(ln, { v: 100, duration: 2.1, ease: 'power2.inOut', onUpdate: () => { const p = ln.v / 100; $('[data-loader-number]').textContent = Math.round(ln.v); gsap.set('[data-loader-bar]', { scaleX: p }); gsap.set(lBall, { x: p * target() }); turn(lSprite, p * 1800); } }, .2)
    .to(lBall, { y: lBall.offsetHeight * .75, scale: .45, duration: .35, ease: 'power2.in' }, 2.3)
    .to(lBall, { opacity: 0, duration: .1 }, 2.6)
    .to(lFlag, { scaleY: 1, duration: .9, ease: 'elastic.out(1,.55)' }, 2.5)
    .to(loader, { clipPath: 'inset(50% 0% 50% 0%)', duration: 1.3, ease: 'expo.inOut' }, 3.05);
  t0 = 3.45;
}
if (!HERO) { const ph = $('[data-page-hero]'); const phl = ph ? $$('[data-page-title]', ph).flatMap(h => masked(SplitText.create(h, { type: 'lines,words', mask: 'lines' })).words) : [];
  if (ph) { gsap.set($$('[data-page-image] img', ph), { scale: 1.25 }); intro.from(phl, { yPercent: 115, duration: 1.5, stagger: .05 }, t0 + .1).from($$('[data-page-fade]', ph), { opacity: 0, y: 20, duration: 1.2, stagger: .08 }, t0 + .4).fromTo($$('[data-page-image]', ph), { clipPath: 'inset(100% 0% 0% 0% round 4px)' }, { clipPath: 'inset(0% 0% 0% 0% round 4px)', duration: 1.6, ease: 'expo.inOut' }, t0 + .2).to($$('[data-page-image] img', ph), { scale: 1, duration: 2.4 }, t0 + .2);
    $$('[data-page-image] img', ph).forEach(im => gsap.to(im, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top top', end: 'bottom top', scrub: true } })); }
  intro.from(nav, { opacity: 0, y: -16, duration: 1.2 }, t0 + .3).add(endLoad, t0); }
if (HERO) {
intro.to('[data-hero-image] img', { scale: 1.04, duration: 2.8 }, t0 - .4)
  .from('[data-hero-eyebrow]', { opacity: 0, y: 14, duration: 1.2 }, t0 + .3)
  .from(heroLines.flat(), { yPercent: 115, duration: 1.5, stagger: .07 }, t0 + .2)
  .from($$('[data-hero-bottom] > *, [data-hero-bottom] .button'), { opacity: 0, y: 24, duration: 1.2, stagger: .1 }, t0 + .7)
  .from(nav, { opacity: 0, y: -16, duration: 1.2 }, t0 + .6)
  .add(endLoad, t0 + .2);

/* hero pinned: words drift apart, image zooms, statement appears */
const stmt = $('[data-hero-statement]'); stmt.style.display = 'grid';
const say = SplitText.create('[data-hero-say]', { type: 'words' }).words;
gsap.set(say, { opacity: 0, filter: 'blur(8px)', y: 24 });
gsap.timeline({ scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: '+=140%', pin: true, scrub: S, anticipatePin: 1 } })
  .fromTo('[data-hero-image]', { scale: 1 }, { scale: 1.28, ease: 'none', duration: 1, immediateRender: false }, 0)
  .fromTo(heroLines[0], { xPercent: 0, opacity: 1 }, { xPercent: i => -40 - i * 30, opacity: 0, ease: 'power2.in', duration: .5, stagger: .02, immediateRender: false }, 0)
  .fromTo(heroLines[1], { xPercent: 0, opacity: 1 }, { xPercent: i => 30 + i * 30, opacity: 0, ease: 'power2.in', duration: .5, stagger: .02, immediateRender: false }, 0)
  .fromTo('[data-hero-eyebrow]', { opacity: 1 }, { opacity: 0, duration: .3, immediateRender: false }, 0)
  .fromTo('[data-hero-bottom]', { opacity: 1, y: 0 }, { opacity: 0, y: 30, duration: .35, immediateRender: false }, 0)
  .to('[data-hero-shade]', { opacity: .55, duration: .5, ease: 'none' }, .2)
  .to(say, { opacity: 1, filter: 'blur(0px)', y: 0, stagger: .06, duration: .35, ease: 'power2.out' }, .42)
  .to({}, { duration: .2 });
}

/* marquee reacts to scroll velocity */
if ($('[data-marquee]')) {
const mq = gsap.to('[data-marquee]', { xPercent: -50, ease: 'none', duration: 34, repeat: -1 });
ScrollTrigger.create({ onUpdate: s => gsap.to(mq, { timeScale: (s.direction < 0 ? -1 : 1) * (1 + Math.min(3, Math.abs(s.getVelocity()) / 600)), duration: .8, ease: 'power2.out', overwrite: true }) });

}
/* headings word by word, text fill, reveals */
$$('[data-split-words]').forEach(h => {
  const pills = $$('[data-pill]', h);
  const words = masked(SplitText.create(h, { type: 'words', mask: 'words', ignore: '[data-pill]' })).words;
  gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, ease: 'power2.out', stagger: .1, scrollTrigger: { trigger: h, start: 'top 92%', end: 'top 55%', scrub: S } });
  pills.forEach((p, k) => { gsap.fromTo(p, { clipPath: 'inset(0% 50% 0% 50% round 1em)' }, { clipPath: 'inset(0% 0% 0% 0% round 1em)', ease: 'power2.inOut', scrollTrigger: { trigger: h, start: 'top 80%', end: 'top 40%', scrub: S } }); gsap.fromTo($('img', p), { scale: 1.6 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: h, start: 'top 85%', end: 'bottom 30%', scrub: S } }); });
});
$$('[data-fill]').forEach(p => { const w = SplitText.create(p, { type: 'words' }).words; gsap.fromTo(w, { opacity: .15 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 85%', end: 'bottom 55%', scrub: S } }); });
/* staggered reveals: small elements animate in once, in batches, with a soft expo ease */
const batch = (sel, from, opts = {}) => { const els = $$(sel).filter(e => !e.closest('[data-gallery-cta],[data-hero],[data-loader],[data-menu]')); if (!els.length) return; gsap.set(els, from); ScrollTrigger.batch(els, { start: opts.start || 'top 92%', once: true, onEnter: b => gsap.to(b, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: opts.d || 1.3, stagger: opts.st || .09, ease: 'expo.out', overwrite: true }) }); };
batch('[data-reveal]', { opacity: 0, y: 36 });
batch('.chapter_component', { opacity: 0, y: 18 }, { st: .06 });
batch('[data-award-item], [data-award-seal]', { opacity: 0, y: 30 }, { st: .12 });
batch('.home-greenfee_chip, .home-tournaments_item, .home-school_pro', { opacity: 0, y: 24 }, { st: .07 });
batch('.footer_column, .footer_brand', { opacity: 0, y: 40 }, { st: .08, start: 'top 95%' });
batch('.footer_bottom > *', { opacity: 0, y: 16 }, { st: .1, start: 'top 98%' });
gsap.from('[data-award-seal]', { rotate: -90, ease: 'none', scrollTrigger: { trigger: '[data-award]', start: 'top bottom', end: 'bottom top', scrub: 2 } });
gsap.to('[data-badge] svg', { rotate: 300, ease: 'none', scrollTrigger: { trigger: '[data-badge]', start: 'top bottom', end: 'bottom top', scrub: 2 } });
$$('[data-count]').forEach(b => { const n = +b.dataset.count, o = { v: 0 }; gsap.to(o, { v: n, ease: 'power1.out', scrollTrigger: { trigger: '[data-facts]', start: 'top 95%', end: 'top 60%', scrub: S }, onUpdate: () => b.textContent = Math.round(o.v) }); });
gsap.fromTo('.home-intro_fact', { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '[data-facts]', start: 'top 98%', end: 'top 65%', scrub: S } });

/* courses pinned: the ball flies from course to course */
if (HASC) {
mapST = ScrollTrigger.create({ trigger: '[data-courses]', start: 'top top', end: '+=320%', pin: true, anticipatePin: 1,
  onUpdate: s => { const i = Math.min(3, Math.floor(s.progress * 4 * .999)); if (i !== cur) show(i); } });
gsap.fromTo(rows.flatMap(r => [...r.children]), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: .03, ease: 'power2.out', scrollTrigger: { trigger: '[data-courses]', start: 'top 80%', end: 'top 15%', scrub: S } });
gsap.fromTo(ball, { opacity: 0 }, { opacity: 1, scrollTrigger: { trigger: '[data-courses]', start: 'top 30%', end: 'top 10%', scrub: true } });
gsap.fromTo(panelsBox, { opacity: 0, y: 70 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: '[data-courses]', start: 'top 70%', end: 'top 10%', scrub: S } });

}
/* greenfee */
if ($('[data-price-row]')) {
$$('[data-price]').forEach(b => { const n = +b.textContent, o = { v: Math.round(n * .6) }; gsap.to(o, { v: n, ease: 'power1.out', scrollTrigger: { trigger: '.home-greenfee_table', start: 'top 90%', end: 'top 55%', scrub: S }, onUpdate: () => b.textContent = Math.round(o.v) }); });
gsap.fromTo('[data-price-row]', { opacity: 0, x: 40 }, { opacity: 1, x: 0, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '.home-greenfee_table', start: 'top 92%', end: 'top 55%', scrub: S } });

}
/* day: horizontal */
if ($('[data-day]')) {
const track = $('[data-day-track]'), dist = () => Math.max(0, track.scrollWidth - innerWidth);
const dayTl = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '[data-day]', start: 'top top', end: () => '+=' + dist() * 1.15, pin: true, scrub: S, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => gsap.set('[data-day-bar]', { scaleX: s.progress }) } });
gsap.set('[data-day-bar]', { scaleX: 0 });
$$('[data-day-image] img').forEach(im => { gsap.set(im, { scale: 1.2 }); gsap.fromTo(im, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: im.closest('[data-day-card]'), containerAnimation: dayTl, start: 'left right', end: 'right left', scrub: true } }); });
$$('[data-day-card]').forEach(c => gsap.fromTo(c, { opacity: .25, y: 40 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: c, containerAnimation: dayTl, start: 'left 98%', end: 'left 60%', scrub: true } }));

}
/* school */
if ($('#golfschule [data-school-image]')) {
gsap.fromTo('[data-school-image]', { clipPath: 'inset(0% 0% 100% 0% round 4px)' }, { clipPath: 'inset(0% 0% 0% 0% round 4px)', ease: 'power2.inOut', scrollTrigger: { trigger: '#golfschule', start: 'top 80%', end: 'top 20%', scrub: S } });
gsap.fromTo('[data-school-image] img', { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#golfschule', start: 'top 80%', end: 'bottom bottom', scrub: true } });
$$('[data-school-row]').forEach(r => gsap.fromTo(r, { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: r, start: 'top 95%', end: 'top 70%', scrub: S } }));

}
/* membership: the oval opens to full bleed (animated as layout, no clip-path glitches) */
if ($('[data-membership]')) {
const memImg = $('[data-membership-image]');
gsap.set(memImg, { top: '17%', bottom: '17%', left: '30%', right: '30%', borderRadius: '50vw' });
gsap.timeline({ scrollTrigger: { trigger: '[data-membership]', start: 'top top', end: '+=120%', pin: true, scrub: S, anticipatePin: 1 } })
  .to(memImg, { top: 0, bottom: 0, left: 0, right: 0, borderRadius: 0, ease: 'power2.inOut', duration: 1 }, 0)
  .fromTo('[data-membership-image] img', { scale: 1.3 }, { scale: 1, ease: 'none', duration: 1 }, 0)
  .fromTo('.home-membership_content', { scale: .92 }, { scale: 1, ease: 'power1.out', duration: 1 }, 0);
gsap.fromTo('[data-plan]', { opacity: 0, y: 70 }, { opacity: 1, y: 0, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '[data-plans]', start: 'top 92%', end: 'top 50%', scrub: S } });

}
/* tournaments */

/* gallery: a calm collage; on scroll the frames part outwards and the centre image becomes the CTA */
if ($('[data-gallery]')) {
const grid = $('[data-gallery-grid]'), center = $('[data-gallery-center]'), cta = $('[data-gallery-cta]'), gHead = $('[data-gallery-header]');
const gItems = [...grid.children];
$$('img', grid).forEach(im => { im.loading = 'eager'; im.decoding = 'async'; });
gsap.set(gItems, { force3D: true });
const zScale = () => Math.max(innerWidth / center.offsetWidth, innerHeight / center.offsetHeight) * 1.02;
const ctaWords = masked(SplitText.create('[data-cta-heading]', { type: 'words', mask: 'words' })).words;
gsap.set(cta, { autoAlpha: 0 });
gItems.forEach((it, i) => { gsap.set(it, { clipPath: 'inset(100% 0% 0% 0% round 4px)' }); gsap.set($('img', it), { scale: 1.25 }); });
ScrollTrigger.create({ trigger: '[data-gallery]', start: 'top 70%', once: true, onEnter: () => {
  gsap.to(gItems, { clipPath: 'inset(0% 0% 0% 0% round 4px)', duration: 1.4, ease: 'expo.inOut', stagger: { each: .07, from: 'center' } });
  gsap.to(gItems.map(it => $('img', it)), { scale: 1, duration: 2, ease: 'expo.out', stagger: { each: .07, from: 'center' } });
} });
const out = (it, k) => { const c = k % 3 - 1, r = Math.floor(k / 3) - 1; return { x: c * innerWidth * .62, y: r * innerHeight * .75 }; };
gsap.timeline({ scrollTrigger: { trigger: '[data-gallery]', start: 'top top', end: '+=200%', pin: true, scrub: S, anticipatePin: 1, invalidateOnRefresh: true } })
  .to(gHead, { y: -60, opacity: 0, duration: .25, ease: 'power2.in' }, 0)
  .to(gItems.filter(it => it !== center), { x: (k, it) => out(it, gItems.indexOf(it)).x, y: (k, it) => out(it, gItems.indexOf(it)).y, ease: 'power2.in', duration: .55 }, .05)
  .to(grid, { top: '50%', duration: .55, ease: 'power2.inOut' }, .05)
  .to(center, { scale: () => zScale(), ease: 'power2.inOut', duration: .55 }, .05)
  .to($('img', center), { scale: 1.08, ease: 'none', duration: .55 }, .05)
  .to('[data-gallery-shade]', { opacity: 1, duration: .2 }, .55)
  .to(cta, { autoAlpha: 1, duration: .01 }, .6)
  .from(ctaWords, { yPercent: 115, stagger: .03, duration: .22, ease: 'power3.out' }, .6)
  .from([...cta.querySelectorAll('.chapter_component,.home-gallery_cta-row')], { opacity: 0, y: 24, duration: .15, stagger: .05 }, .74)
  .to({}, { duration: .2 });

}
/* status board: rows tick in, partners fade up */
batch('[data-status-row]', { opacity: 0, x: 30 }, { st: .06 });
batch('[data-partner]', { opacity: 0, y: 30 }, { st: .08 });

/* newsletter hint: appears once per visit after half the page, never over the newsletter itself */
if ($('#newsletter')) {
const pop = $('[data-popup]');
if (pop) {
  let seen = false; try { seen = sessionStorage.getItem('bs-pop') === '1'; } catch (e) {}
  const hide = () => { try { sessionStorage.setItem('bs-pop', '1'); } catch (e) {} gsap.to(pop, { y: 30, opacity: 0, duration: .5, ease: 'power3.in', onComplete: () => { pop.classList.remove('is-open'); pop.setAttribute('aria-hidden', 'true'); } }); };
  $('[data-popup-close]', pop).addEventListener('click', hide);
  $('[data-popup-link]', pop).addEventListener('click', hide);
  if (!seen) ScrollTrigger.create({ trigger: document.body, start: () => document.documentElement.scrollHeight * .55 + ' top', once: true, onEnter: () => {
    const nl = $('#newsletter'); if (nl && nl.getBoundingClientRect().top < innerHeight) return;
    pop.classList.add('is-open'); pop.setAttribute('aria-hidden', 'false');
    gsap.fromTo(pop, { y: 40, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out' });
  } });
  ScrollTrigger.create({ trigger: '#newsletter', start: 'top 80%', onEnter: () => pop.classList.contains('is-open') && hide() });
}

}
/* faq */
batch('[data-faq-item]', { opacity: 0, y: 30 }, { st: .07 });

/* footer wordmark */
const fw = $('[data-footer-word]'); const chars = SplitText.create(fw, { type: 'chars' }).chars;
gsap.fromTo(chars, { yPercent: 100 }, { yPercent: 0, stagger: .04, ease: 'power2.out', scrollTrigger: { trigger: fw, start: 'top 98%', end: 'bottom 85%', scrub: S } });

/* cursor + magnetic buttons */
if (FINE) {
  const c = $('[data-cursor]') || document.createElement('div'), xT = gsap.quickTo(c, 'x', { duration: .6, ease: 'power3' }), yT = gsap.quickTo(c, 'y', { duration: .6, ease: 'power3' });
  $$('[data-gallery-item],[data-gallery-center],[data-day-image]').forEach(f => { f.addEventListener('pointerenter', e => { gsap.set(c, { x: e.clientX, y: e.clientY }); gsap.to(c, { scale: 1, opacity: 1, duration: .6, ease: 'expo.out' }); }); f.addEventListener('pointermove', e => { xT(e.clientX); yT(e.clientY); }); f.addEventListener('pointerleave', () => gsap.to(c, { scale: .2, opacity: 0, duration: .45 })); });
  $$('[data-magnetic]').forEach(b => { const x = gsap.quickTo(b, 'x', { duration: .8, ease: 'power3' }), y = gsap.quickTo(b, 'y', { duration: .8, ease: 'power3' }); b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .16); y((e.clientY - r.top - r.height / 2) * .28); }); b.addEventListener('pointerleave', () => { x(0); y(0); }); });
}

/* subpages: rows, cards and images */
batch('[data-row]', { opacity: 0, y: 24 }, { st: .05 });
batch('[data-card]', { opacity: 0, y: 50 }, { st: .1 });
$$('[data-sub-image]').forEach(w => { const im = $('img', w); gsap.fromTo(w, { clipPath: 'inset(100% 0% 0% 0% round 4px)' }, { clipPath: 'inset(0% 0% 0% 0% round 4px)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: w, start: 'top 85%', once: true } }); if (im) gsap.fromTo(im, { scale: 1.25, yPercent: -6 }, { scale: 1.05, yPercent: 6, ease: 'none', scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom top', scrub: true } }); });
$$('[data-sub-num]').forEach(b => { const n = parseFloat(b.textContent.replace(',', '.')); if (!n || b.textContent.includes(',')) return; const o = { v: Math.round(n * .6) }; gsap.to(o, { v: n, ease: 'power1.out', scrollTrigger: { trigger: b, start: 'top 95%', end: 'top 70%', scrub: S }, onUpdate: () => b.textContent = Math.round(o.v) }); });

ScrollTrigger.sort();
addEventListener('load', () => { ScrollTrigger.refresh(); HASC && placeBall(cur); });
let h0 = 0; const ro = new ResizeObserver(() => { const h = document.documentElement.scrollHeight; if (Math.abs(h - h0) < 2) return; h0 = h; clearTimeout(ro.t); ro.t = setTimeout(() => ScrollTrigger.refresh(), 250); });
addEventListener('load', () => { h0 = document.documentElement.scrollHeight; ro.observe(document.body); });
})();
