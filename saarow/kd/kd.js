/* Ferch Studio | Konzeptseite Golf Club Bad Saarow | dark edition */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap, ST = window.ScrollTrigger, SP = window.SplitText;
  if (G && ST) G.registerPlugin(ST); if (G && SP) G.registerPlugin(SP);
  const html = document.documentElement;
  const stage = $('.kd-stage'); if (stage && !stage.id) stage.id = 'kd-film';

  /* hero title: words rise out of a mask once the loader has gone */
  let heroWords = null;
  const title = $('[data-kd-title]');
  if (G && SP && title && !RM) { heroWords = SP.create(title, { type: 'words', mask: 'words' }).words; G.set(heroWords, { yPercent: 115 }); G.set('.kd-hero-top, .kd-hero-row, .kd-brief, .kd-btns', { opacity: 0, y: 24 }); }
  const intro = () => { if (!G || RM) return; const tl = G.timeline({ defaults: { ease: 'expo.out' } });
    if (heroWords) tl.to(heroWords, { yPercent: 0, duration: 1.5, stagger: .08 }, 0);
    tl.to('.kd-hero-top, .kd-hero-row, .kd-brief, .kd-btns', { opacity: 1, y: 0, duration: 1.2, stagger: .08 }, .35); };

  /* loader: Osmo Welcoming Words, once per visit */
  function initWelcomingWordsLoader() {
    const loadingContainer = $('[data-loading-container]');
    if (!loadingContainer || html.classList.contains('kd-seen') || !G || RM) { if (loadingContainer) loadingContainer.style.display = 'none'; intro(); return; }
    try { sessionStorage.setItem('kd-loader', '1'); } catch (_) {}
    const loadingWords = loadingContainer.querySelector('[data-loading-words]');
    const wordsTarget = loadingWords.querySelector('[data-loading-words-target]');
    const words = loadingWords.getAttribute('data-loading-words').split(',').map(w => w.trim());
    const tl = G.timeline(), step = .55, t1 = 1.05, tEnd = t1 + (words.length - 1) * step + .9;
    tl.set(loadingWords, { yPercent: 50 }, 0);
    tl.to(loadingWords, { opacity: 1, yPercent: 0, duration: 1, ease: 'expo.inOut' }, 0);
    words.forEach((word, i) => { tl.call(() => { wordsTarget.textContent = word; }, null, t1 + i * step); });
    tl.to(loadingWords, { opacity: 0, yPercent: -75, duration: .8, ease: 'expo.in' }, tEnd);
    tl.to(loadingContainer, { autoAlpha: 0, duration: .6, ease: 'power1.inOut' }, tEnd + .6);
    tl.call(intro, null, tEnd + .75);
  }
  initWelcomingWordsLoader();

  /* videos play only while visible */
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; if (!RM) v.play().catch(() => {}); } else v.pause(); }), { rootMargin: '200px' });
  $$('video[data-kd-video]').forEach(v => vio.observe(v));

  /* before / after slider */
  $$('[data-kd-compare]').forEach(c => { const h = c.querySelector('.kd-handle'); let x = 50;
    const set = v => { x = Math.max(0, Math.min(100, v)); c.style.setProperty('--x', x + '%'); h && h.setAttribute('aria-valuenow', Math.round(x)); };
    const fromE = e => { const r = c.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
    let drag = false;
    c.addEventListener('pointerdown', e => { drag = true; c.setPointerCapture(e.pointerId); fromE(e); });
    c.addEventListener('pointermove', e => { if (drag || (e.pointerType === 'mouse' && matchMedia('(hover:hover)').matches)) fromE(e); });
    c.addEventListener('pointerup', () => { drag = false; }); c.addEventListener('pointercancel', () => { drag = false; });
    h && h.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { set(x - 5); e.preventDefault(); } if (e.key === 'ArrowRight') { set(x + 5); e.preventDefault(); } });
    set(50);
    if (!RM) { const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect(); let t0 = null; const f = t => { t0 = t0 || t; const k = Math.min(1, (t - t0) / 1800); set(50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k)); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }, { threshold: .5 }); io.observe(c); } });

  /* score rings */
  $$('[data-kd-ring]').forEach(el => { const v = +el.dataset.kdRing, c = el.querySelector('.fg'), L = 2 * Math.PI * 42; c.style.strokeDasharray = L; c.style.strokeDashoffset = L;
    const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect(); requestAnimationFrame(() => { c.style.strokeDashoffset = L * (1 - v / 100); }); }, { threshold: .4 }); io.observe(el); });

  /* count-ups */
  $$('[data-kd-count]').forEach(el => { const to = +el.dataset.kdCount, dec = +(el.dataset.kdDec || 0), fmt = v => v.toFixed(dec).replace('.', ',');
    if (RM || !G) return; el.textContent = fmt(dec ? 17.2 : 0); const from = dec ? 17.2 : 0, o = { v: from };
    const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect(); G.to(o, { v: to, duration: 2, ease: 'expo.out', onUpdate: () => { el.textContent = fmt(o.v); } }); }, { threshold: .6 }); io.observe(el); });

  /* reveals */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('[data-kd-reveal]').forEach(el => rio.observe(el));
  const tio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const i = $$('[data-kd-tile]').indexOf(e.target); e.target.style.transitionDelay = (i % 3) * .08 + 's'; e.target.classList.add('is-in'); tio.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  $$('[data-kd-tile]').forEach(el => tio.observe(el));

  /* challenge cards: one is open at a time, they take turns until someone hovers */
  $$('[data-kd-cards]').forEach(g => { const cards = $$('[data-kd-card]', g); let i = 0, t = null, user = false;
    const show = k => cards.forEach((c, j) => c.classList.toggle('is-active', j === k));
    cards.forEach((c, k) => { c.addEventListener('pointerenter', () => { user = true; clearInterval(t); show(k); }); c.addEventListener('click', () => { user = true; clearInterval(t); show(k); }); });
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting && !user && !RM) { clearInterval(t); t = setInterval(() => { i = (i + 1) % cards.length; show(i); }, 3200); } else clearInterval(t); }, { threshold: .4 }); io.observe(g); });

  /* putt element: the ball rolls the full width of its tile */
  $$('.kd-putt').forEach(p => { const set = () => p.style.setProperty('--kd-putt-w', p.clientWidth + 'px'); set(); addEventListener('resize', set); });

  if (!G || !ST || RM) { $$('.kd-statement .kd-w').forEach(w => { w.style.opacity = 1; }); return; }
  /* statements light up word by word while scrolling */
  $$('[data-kd-words]').forEach(p => { const w = SP ? SP.create(p, { type: 'words', wordsClass: 'kd-w' }).words : [];
    if (w.length) G.fromTo(w, { opacity: .18 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 45%', scrub: 1 } }); });
  /* stage grows into place, image tile drifts */
  if (stage) G.fromTo(stage, { scale: .9, borderRadius: '2rem' }, { scale: 1, borderRadius: '.5rem', ease: 'none', scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top 25%', scrub: 1 } });
  $$('.kd-tile-img').forEach(im => G.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  addEventListener('load', () => ST.refresh());
})();
