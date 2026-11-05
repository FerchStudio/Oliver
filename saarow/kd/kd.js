/* Ferch Studio | Konzeptseite Golf Club Bad Saarow */
(() => {
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* videos play only while visible */
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; if (!RM) v.play().catch(() => {}); } else v.pause(); }), { rootMargin: '200px' });
  $$('video[data-kd-video]').forEach(v => vio.observe(v));
  /* before / after slider: drag anywhere, or use the arrow keys on the handle */
  $$('[data-kd-compare]').forEach(c => { const h = c.querySelector('.kd-handle'); let x = 50;
    const set = v => { x = Math.max(0, Math.min(100, v)); c.style.setProperty('--x', x + '%'); h.setAttribute('aria-valuenow', Math.round(x)); };
    const fromE = e => { const r = c.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
    let drag = false;
    c.addEventListener('pointerdown', e => { drag = true; c.setPointerCapture(e.pointerId); fromE(e); });
    c.addEventListener('pointermove', e => { if (drag) fromE(e); else if (e.pointerType === 'mouse' && matchMedia('(hover:hover)').matches) fromE(e); });
    c.addEventListener('pointerup', () => { drag = false; }); c.addEventListener('pointercancel', () => { drag = false; });
    h.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { set(x - 5); e.preventDefault(); } if (e.key === 'ArrowRight') { set(x + 5); e.preventDefault(); } });
    set(50);
    if (!RM) { const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect(); let t0 = null; const f = t => { t0 = t0 || t; const k = Math.min(1, (t - t0) / 1800); set(50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k)); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }, { threshold: .5 }); io.observe(c); } });
  /* score rings */
  $$('[data-kd-ring]').forEach(el => { const v = +el.dataset.kdRing, c = el.querySelector('.fg'), L = 2 * Math.PI * 42; c.style.strokeDasharray = L; c.style.strokeDashoffset = L;
    const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect(); requestAnimationFrame(() => { c.style.strokeDashoffset = L * (1 - v / 100); }); }, { threshold: .4 }); io.observe(el); });
  /* reveals */
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('[data-kd-reveal]').forEach(el => rio.observe(el));
})();
