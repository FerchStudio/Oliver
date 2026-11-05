/* Golf Club Bad Saarow | page script (Client-First build). Hooks use data attributes only. */
(() => {
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const html = document.documentElement;
html.lang = 'de';

/* Webflow renders <button> from the HTML builder as links with type="button": restore real buttons */
$$('a[type="button"]').forEach(a => { const b = document.createElement('button'); [...a.attributes].forEach(at => { if (at.name !== 'href') b.setAttribute(at.name, at.value); }); b.type = 'button'; b.classList.remove('w-button'); b.innerHTML = a.innerHTML; a.replaceWith(b); });

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ANIM = !RM && window.gsap && window.ScrollTrigger && window.SplitText;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const FRAMES = 24, turn = (el, deg) => { const f = ((Math.round(deg / (360 / FRAMES)) % FRAMES) + FRAMES) % FRAMES; el.style.backgroundPosition = `${(f / (FRAMES - 1)) * 100}% 0`; };
const mw = $('.main-wrapper'); if (mw && !mw.id) mw.id = 'main';

/* smooth scroll */
let lenis = null;
if (ANIM && window.Lenis) {
  lenis = new Lenis({ duration: 1.25, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  if (html.classList.contains('is-loading')) lenis.stop();
}
const scrollToY = y => lenis ? lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a || a.hasAttribute('data-course-link')) return;
  const id = a.getAttribute('href'); const t = id.length > 1 && document.querySelector(id); if (!t) return;
  e.preventDefault(); const sp = t.closest('.pin-spacer'); scrollToY((sp || t).getBoundingClientRect().top + scrollY); history.replaceState(null, '', id);
});

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
const closeLb = () => { if (!lb.classList.contains('is-open')) return; lb.classList.remove('is-open'); lenis && lenis.start(); lastF && lastF.focus(); };
$$('[data-gallery-item],[data-gallery-center]').forEach(f => { const im = $('img', f); if (!im) return; f.tabIndex = 0; f.setAttribute('role', 'button'); f.setAttribute('aria-label', 'Bild öffnen: ' + im.alt);
  const open = () => { lastF = f; lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lb.classList.add('is-open'); lenis && lenis.stop(); $('[data-lightbox-close]').focus(); };
  f.addEventListener('click', open); f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }); });
$('[data-lightbox-close]').addEventListener('click', closeLb); lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { if (menuOpen) setMenu(false); closeLb(); } });

/* footer wordmark fits its width */
const fit = () => { const t = $('[data-footer-word]'), w = t.parentElement; t.style.fontSize = '100px'; t.style.fontSize = Math.floor(100 * w.clientWidth / t.offsetWidth * .985) + 'px'; };
fit(); addEventListener('resize', () => { clearTimeout(fit.t); fit.t = setTimeout(fit, 150); });

/* course map */
const svg = $('[data-map-svg]'), mapBox = $('.home-courses_map');
(() => { const g = $('[data-topo]', svg); if (!g) return; let h = ''; for (let i = 0; i < 9; i++) { const r = 40 + i * 32; h += `<ellipse class="m-topo" cx="${300 + i * 6}" cy="${280 - i * 4}" rx="${r * 1.5}" ry="${r}" transform="rotate(${-12 + i * 3} 300 280)"/>`; } g.innerHTML = h; })();
const zones = $$('[data-zone]', svg), panelsBox = $('[data-course-panels]'), panels = $$('[data-course-panel]'), steps = $$('.home-courses_step'), ball = $('[data-course-ball]'), sprite = $('.home-courses_ball-sprite', ball);
panelsBox.classList.add('is-js'); panels.forEach(p => { p.classList.add('is-js'); $('.home-courses_panel-image-wrapper', p).classList.add('is-js'); });
const CENTERS = [[432, 320], [180, 315], [320, 115], [520, 145]];
let cur = 0;
const toPx = (x, y) => { const vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect(), pr = mapBox.getBoundingClientRect(); const s = Math.min(r.width / vb.width, r.height / vb.height), ox = (r.width - vb.width * s) / 2, oy = (r.height - vb.height * s) / 2; return [r.left - pr.left + ox + x * s, r.top - pr.top + oy + y * s]; };
const placeBall = (x, y) => { const [px, py] = toPx(x, y); ball.style.left = px + 'px'; ball.style.top = py + 'px'; };
const show = (i, instant) => {
  zones.forEach((z, k) => z.classList.toggle('on', k === i));
  steps.forEach((b, k) => { b.classList.toggle('is-active', k === i); b.setAttribute('aria-selected', k === i); });
  const a = panels[cur], b = panels[i], parts = p => [$('.home-courses_panel-title', p), $('p', p), $('.home-courses_tags', p)];
  if (!ANIM || instant || a === b) panels.forEach((n, k) => n.classList.toggle('is-active', k === i));
  else {
    gsap.to(parts(a), { opacity: 0, y: -16, duration: .5, stagger: .04, ease: 'power2.inOut', overwrite: true, onComplete: () => a.classList.remove('is-active') });
    b.classList.add('is-active');
    const iw = $('.home-courses_panel-image-wrapper', b);
    gsap.fromTo(iw, { clipPath: 'inset(100% 0% 0% 0% round 4px)' }, { clipPath: 'inset(0% 0% 0% 0% round 4px)', duration: 1.4, ease: 'expo.inOut', overwrite: true });
    gsap.fromTo($('img', iw), { scale: 1.2 }, { scale: 1, duration: 2, ease: 'expo.out' });
    gsap.fromTo(parts(b), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, stagger: .08, delay: .45, ease: 'expo.out', overwrite: true });
  }
  const [x1, y1] = CENTERS[cur], [x2, y2] = CENTERS[i], fl = $('[data-flight]', svg);
  fl.setAttribute('d', `M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 120} ${x2} ${y2}`);
  if (ANIM && !instant && cur !== i) {
    const L = fl.getTotalLength(), o = { t: 0 };
    gsap.fromTo(fl, { strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' });
    gsap.to(o, { t: 1, duration: 1.5, ease: 'power2.inOut', overwrite: true, onUpdate: () => { const p = fl.getPointAtLength(L * o.t); placeBall(p.x, p.y); turn(sprite, o.t * 1440); gsap.set(ball, { scale: 1 + Math.sin(o.t * Math.PI) * .6 }); } });
  } else placeBall(x2, y2);
  cur = i;
};
show(0, true);
addEventListener('resize', () => placeBall(...CENTERS[cur]));
let mapST = null;
const goStep = i => { if (mapST) scrollToY(mapST.start + (mapST.end - mapST.start) * (i / 4 + .06)); else show(i); };
steps.forEach((b, i) => b.addEventListener('click', () => goStep(i)));
zones.forEach((z, i) => z.addEventListener('click', () => goStep(i)));
$$('[data-course-link]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); setMenu(false); setTimeout(() => goStep(+a.dataset.courseLink), 500); }));

const loader = $('[data-loader]');
const endLoad = () => { html.classList.remove('is-loading'); loader && (loader.style.display = 'none'); lenis && lenis.start(); };
if (!ANIM) { endLoad(); return; }
gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'power3.out' });
const S = 1.6;
const mm = gsap.matchMedia();

/* loader + hero intro */
const ln = { v: 0 };
const heroLines = $$('[data-hero-line]').map(l => SplitText.create(l, { type: 'words', mask: 'words' }).words);
gsap.set('[data-hero-image]', { clipPath: 'inset(30% 34% 30% 34% round 6px)' });
gsap.set('[data-hero-image] img', { scale: 1.45 });
const intro = gsap.timeline();
if (html.classList.contains('is-loading')) {
  intro.to(ln, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { $('[data-loader-number]').textContent = Math.round(ln.v); } })
    .to('[data-loader-bar]', { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
    .to(loader, { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, 1.6);
}
const t0 = html.classList.contains('is-loading') ? 2 : .2;
intro.to('[data-hero-image]', { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.8, ease: 'expo.inOut' }, t0)
  .to('[data-hero-image] img', { scale: 1.04, duration: 2.6, ease: 'expo.out' }, t0)
  .from('[data-hero-eyebrow]', { opacity: 0, y: 14, duration: 1.2, ease: 'expo.out' }, t0 + .7)
  .from(heroLines.flat(), { yPercent: 110, duration: 1.4, stagger: .08, ease: 'expo.out' }, t0 + .75)
  .from($$('[data-hero-bottom] > *'), { opacity: 0, y: 24, duration: 1.2, stagger: .12, ease: 'expo.out' }, t0 + 1.3)
  .from(nav, { opacity: 0, y: -16, duration: 1.2, ease: 'expo.out' }, t0 + 1.3)
  .add(endLoad);

/* hero pinned: words drift apart, image zooms, statement appears */
const stmt = $('[data-hero-statement]'); stmt.style.display = 'grid';
const say = SplitText.create('[data-hero-say]', { type: 'words' }).words;
gsap.set(say, { opacity: 0, filter: 'blur(8px)', y: 24 });
gsap.timeline({ scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: '+=140%', pin: true, scrub: S, anticipatePin: 1 } })
  .to('[data-hero-image] img', { scale: 1.35, ease: 'none', duration: 1 }, 0)
  .to(heroLines[0], { xPercent: i => -40 - i * 30, opacity: 0, ease: 'power2.in', duration: .5, stagger: .02 }, 0)
  .to(heroLines[1], { xPercent: i => 30 + i * 30, opacity: 0, ease: 'power2.in', duration: .5, stagger: .02 }, 0)
  .to('[data-hero-eyebrow]', { opacity: 0, duration: .3 }, 0)
  .to('[data-hero-bottom]', { opacity: 0, y: 30, duration: .35 }, 0)
  .to('[data-hero-image]', { filter: 'brightness(.55)', duration: .5, ease: 'none' }, .2)
  .to(say, { opacity: 1, filter: 'blur(0px)', y: 0, stagger: .06, duration: .35, ease: 'power2.out' }, .42)
  .to({}, { duration: .2 });

/* marquee reacts to scroll velocity */
const mq = gsap.to('[data-marquee]', { xPercent: -50, ease: 'none', duration: 34, repeat: -1 });
ScrollTrigger.create({ onUpdate: s => gsap.to(mq, { timeScale: (s.direction < 0 ? -1 : 1) * (1 + Math.min(3, Math.abs(s.getVelocity()) / 600)), duration: .8, ease: 'power2.out', overwrite: true }) });

/* headings word by word, text fill, reveals */
$$('[data-split-words]').forEach(h => {
  const pills = $$('[data-pill]', h);
  const words = SplitText.create(h, { type: 'words', mask: 'words', ignore: '[data-pill]' }).words;
  gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, ease: 'power2.out', stagger: .1, scrollTrigger: { trigger: h, start: 'top 92%', end: 'top 55%', scrub: S } });
  pills.forEach(p => gsap.fromTo(p, { width: 0 }, { width: p.classList.contains('is-wide') ? '2.5em' : '1.9em', ease: 'power2.inOut', scrollTrigger: { trigger: h, start: 'top 75%', end: 'top 35%', scrub: S } }));
});
$$('[data-fill]').forEach(p => { const w = SplitText.create(p, { type: 'words' }).words; gsap.fromTo(w, { opacity: .15 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 85%', end: 'bottom 55%', scrub: S } }); });
$$('[data-reveal]').forEach(el => gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 94%', end: 'top 70%', scrub: S } }));
gsap.to('[data-badge] svg', { rotate: 300, ease: 'none', scrollTrigger: { trigger: '[data-badge]', start: 'top bottom', end: 'bottom top', scrub: 2 } });
$$('[data-count]').forEach(b => { const n = +b.dataset.count, o = { v: 0 }; gsap.to(o, { v: n, ease: 'power1.out', scrollTrigger: { trigger: '[data-facts]', start: 'top 95%', end: 'top 60%', scrub: S }, onUpdate: () => b.textContent = Math.round(o.v) }); });
gsap.fromTo('.home-intro_fact', { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '[data-facts]', start: 'top 98%', end: 'top 65%', scrub: S } });

/* courses pinned: the ball flies from course to course */
mapST = ScrollTrigger.create({ trigger: '[data-courses]', start: 'top top', end: '+=320%', pin: true, anticipatePin: 1,
  onUpdate: s => { const i = Math.min(3, Math.floor(s.progress * 4 * .999)); if (i !== cur) show(i); } });
gsap.fromTo(zones, { opacity: 0, scale: .92, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, stagger: .15, ease: 'power2.out', scrollTrigger: { trigger: '[data-courses]', start: 'top 80%', end: 'top 10%', scrub: S } });
gsap.fromTo('.m-lake', { xPercent: 18 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-courses]', start: 'top bottom', end: 'top top', scrub: S } });
gsap.fromTo(panelsBox, { opacity: 0, y: 70 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: '[data-courses]', start: 'top 70%', end: 'top 10%', scrub: S } });

/* greenfee */
$$('[data-price]').forEach(b => { const n = +b.textContent, o = { v: Math.round(n * .6) }; gsap.to(o, { v: n, ease: 'power1.out', scrollTrigger: { trigger: '.home-greenfee_table', start: 'top 90%', end: 'top 55%', scrub: S }, onUpdate: () => b.textContent = Math.round(o.v) }); });
gsap.fromTo('[data-price-row]', { opacity: 0, x: 40 }, { opacity: 1, x: 0, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '.home-greenfee_table', start: 'top 92%', end: 'top 55%', scrub: S } });

/* day: horizontal */
const track = $('[data-day-track]'), dist = () => Math.max(0, track.scrollWidth - innerWidth);
const dayTl = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '[data-day]', start: 'top top', end: () => '+=' + dist() * 1.15, pin: true, scrub: S, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => gsap.set('[data-day-bar]', { scaleX: s.progress }) } });
gsap.set('[data-day-bar]', { scaleX: 0 });
$$('[data-day-image] img').forEach(im => { gsap.set(im, { scale: 1.2 }); gsap.fromTo(im, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: im.closest('[data-day-card]'), containerAnimation: dayTl, start: 'left right', end: 'right left', scrub: true } }); });
$$('[data-day-card]').forEach(c => gsap.fromTo(c, { opacity: .25, y: 40 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: c, containerAnimation: dayTl, start: 'left 98%', end: 'left 60%', scrub: true } }));

/* school */
gsap.fromTo('[data-school-image]', { clipPath: 'inset(0% 0% 100% 0% round 4px)' }, { clipPath: 'inset(0% 0% 0% 0% round 4px)', ease: 'power2.inOut', scrollTrigger: { trigger: '#golfschule', start: 'top 80%', end: 'top 20%', scrub: S } });
gsap.fromTo('[data-school-image] img', { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#golfschule', start: 'top 80%', end: 'bottom bottom', scrub: true } });
$$('[data-school-row]').forEach(r => gsap.fromTo(r, { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: r, start: 'top 95%', end: 'top 70%', scrub: S } }));

/* membership oval mask */
gsap.set('[data-membership-image]', { clipPath: 'inset(20% 30% 20% 30% round 600px)' });
gsap.timeline({ scrollTrigger: { trigger: '[data-membership]', start: 'top top', end: '+=110%', pin: true, scrub: S, anticipatePin: 1 } })
  .to('[data-membership-image]', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power1.inOut', duration: 1 }, 0)
  .fromTo('[data-membership-image] img', { scale: 1.25 }, { scale: 1, ease: 'none', duration: 1 }, 0)
  .from('.home-membership_content', { scale: .9, ease: 'power1.out', duration: 1 }, 0);
gsap.fromTo('[data-plan]', { opacity: 0, y: 70 }, { opacity: 1, y: 0, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '[data-plans]', start: 'top 92%', end: 'top 50%', scrub: S } });

/* tournaments */
gsap.fromTo('[data-tournaments] > li', { opacity: 0, x: 60 }, { opacity: 1, x: 0, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '[data-tournaments]', start: 'top 90%', end: 'top 50%', scrub: S } });

/* gallery grid zooms into the CTA */
const grid = $('[data-gallery-grid]'), center = $('[data-gallery-center]'), cta = $('[data-gallery-cta]');
const zScale = () => Math.max(innerWidth / center.offsetWidth, innerHeight / center.offsetHeight) * 1.02;
const ctaWords = SplitText.create('[data-cta-heading]', { type: 'words', mask: 'words' }).words;
gsap.set(cta, { autoAlpha: 0 });
gsap.timeline({ scrollTrigger: { trigger: '[data-gallery]', start: 'top top', end: '+=220%', pin: true, scrub: S, anticipatePin: 1, invalidateOnRefresh: true } })
  .fromTo('[data-gallery-item]', { y: i => [120, 60, 160, 80, 100, 140, 40, 180][i] || 80, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', stagger: .03, duration: .3 }, 0)
  .fromTo(center, { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, 0)
  .to('[data-gallery-header]', { opacity: 0, y: -40, duration: .2 }, .45)
  .to(grid, { scale: () => zScale(), top: '50%', ease: 'power2.inOut', duration: .5 }, .45)
  .to('[data-gallery-item]', { opacity: 0, duration: .3 }, .55)
  .to('[data-gallery-shade]', { opacity: 1, duration: .2 }, .8)
  .to(cta, { autoAlpha: 1, duration: .01 }, .82)
  .from(ctaWords, { yPercent: 110, stagger: .03, duration: .2 }, .82)
  .from([...cta.querySelectorAll('.chapter_component,.home-gallery_cta-row')], { opacity: 0, y: 24, duration: .15, stagger: .05 }, .95)
  .to({}, { duration: .15 });

/* faq */
gsap.fromTo('[data-faq-item]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: .08, ease: 'power2.out', scrollTrigger: { trigger: '[data-faq]', start: 'top 92%', end: 'top 50%', scrub: S } });

/* footer wordmark */
const fw = $('[data-footer-word]'); const chars = SplitText.create(fw, { type: 'chars' }).chars;
gsap.fromTo(chars, { yPercent: 100 }, { yPercent: 0, stagger: .04, ease: 'power2.out', scrollTrigger: { trigger: fw, start: 'top 98%', end: 'bottom 85%', scrub: S } });

/* cursor + magnetic buttons */
if (FINE) {
  const c = $('[data-cursor]'), xT = gsap.quickTo(c, 'x', { duration: .6, ease: 'power3' }), yT = gsap.quickTo(c, 'y', { duration: .6, ease: 'power3' });
  $$('[data-gallery-item],[data-gallery-center],.home-courses_panel-image-wrapper,[data-day-image]').forEach(f => { f.addEventListener('pointerenter', e => { gsap.set(c, { x: e.clientX, y: e.clientY }); gsap.to(c, { scale: 1, opacity: 1, duration: .6, ease: 'expo.out' }); }); f.addEventListener('pointermove', e => { xT(e.clientX); yT(e.clientY); }); f.addEventListener('pointerleave', () => gsap.to(c, { scale: .2, opacity: 0, duration: .45 })); });
  $$('[data-magnetic]').forEach(b => { const x = gsap.quickTo(b, 'x', { duration: .8, ease: 'power3' }), y = gsap.quickTo(b, 'y', { duration: .8, ease: 'power3' }); b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .16); y((e.clientY - r.top - r.height / 2) * .28); }); b.addEventListener('pointerleave', () => { x(0); y(0); }); });
}

ScrollTrigger.sort();
addEventListener('load', () => { ScrollTrigger.refresh(); placeBall(...CENTERS[cur]); });
let h0 = 0; const ro = new ResizeObserver(() => { const h = document.documentElement.scrollHeight; if (Math.abs(h - h0) < 2) return; h0 = h; clearTimeout(ro.t); ro.t = setTimeout(() => ScrollTrigger.refresh(), 250); });
addEventListener('load', () => { h0 = document.documentElement.scrollHeight; ro.observe(document.body); });
})();
