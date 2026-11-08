/* ==========================================================
   Classik Hotel Collection | Konzept v2 | Ferch Studio
   Osmo-Ressourcen: Cross Fade Page Transition (Barba-Boilerplate),
   Parallax Image Gallery with Thumbnails, Interactive Globe (Mapbox),
   Cascading Slider, Radial Cards Slider, Lightbox Setup,
   Store Locator (Mapbox), Elements Reveal on Scroll.
   Ohne Mapbox-Token (Vorschau) zeichnen Globus und Karte eine
   eigene d3-Ansicht mit denselben data-Attributen und Abläufen.
   ========================================================== */

// Mapbox: Token hier eintragen (in Webflow z. B. per Site-Einstellungen).
window.CLASSIK_MAPBOX_TOKEN = window.CLASSIK_MAPBOX_TOKEN || "";
const BASE = window.CLASSIK_BASE || "";
// Erstaufruf: Bibliotheken laden verzögert. Inhalte im sichtbaren Bereich bleiben stehen, animiert wird nur, was noch kommt.
const LATE = true;
const inView = el => el.getBoundingClientRect().top < innerHeight * 0.92;

// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------
gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText, Observer, Draggable, InertiaPlugin, Flip);

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });

const FINE = matchMedia("(hover:hover) and (pointer:fine)").matches;
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ARROW = '<svg class="btn_icon" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" stroke-width="1.4"/></svg>';


// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;

  initButtons(document);          // Buttons in Nav, Menü, Footer
  initArrowLinks(document);
  initTelLinks(document);
  initNav();
  initScrollState();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;
}

// Kontaktformular: deutsche Platzhalter statt Webflow-Standard "Example text"
function initFormPlaceholders(scope) {
  const ph = { "k-vorname": "Max", "k-nachname": "Mustermann", "k-firma": "Optional", "k-email": "name@beispiel.de", "k-msg": "Wie können wir Ihnen helfen?" };
  Object.keys(ph).forEach(id => { const el = scope.querySelector("#" + id); if (el) el.placeholder = ph[id]; });
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  initButtons(nextPage);
  initArrowLinks(nextPage);
  initTelLinks(nextPage);
  initFormPlaceholders(nextPage);
  if (has("[data-lage]")) initLage(nextPage);
  if (has("[data-split]")) initSplitHeadings(nextPage);
  if (has("[data-reveal-group]")) initContentRevealScroll();
  if (has("[data-img-reveal]")) initImgReveal(nextPage);
  if (has("[data-parallax]")) initParallax(nextPage);
  if (has('[data-slideshow="wrap"]')) initParallaxImageGalleryThumbnails();
  if (has("[data-book]")) initBooking(nextPage);
  if (has("[data-globe-init]")) initInteractiveGlobe();
  if (has("[data-cascading-slider-wrap]")) initCascadingSlider();
  if (has("[data-radial-slider-init]")) initRadialCardsSlider();
  if (has("[data-gallery]")) initLightboxes();
  if (has("[data-locator-init]")) initStoreLocator();
  initFooterWord();

  if (hasLenis) lenis.resize();
  if (hasScrollTrigger) ScrollTrigger.refresh();
}


// -----------------------------------------
// PAGE TRANSITIONS (Osmo: Cross Fade)
// -----------------------------------------

function runPageOnceAnimation(next) {
  const tl = gsap.timeline();
  tl.call(() => { gsap.set(next, { clearProps: "position,top,left,right" }); if (lenis) lenis.resize(); }, null, 0);

  if (!reducedMotion && !LATE) {
    const hero = next.querySelector(".hero");
    if (hero) {
      tl.from(hero.querySelector(".img-slide.is--current .img-slide__inner"), { scale: 1.12, duration: 2.2, ease: "expo.out" }, 0);
      tl.from(next.querySelectorAll("[data-hero-fade]"), { autoAlpha: 0, y: 24, duration: 1.1, ease: "expo.out", stagger: 0.12 }, 0.7);
      tl.from(".img-slider__thumb, .hero_caption", { autoAlpha: 0, y: 16, duration: 1, ease: "expo.out", stagger: 0.06 }, 1);
    }
    tl.from(".nav_bar", { autoAlpha: 0, duration: 1, ease: "power2.out" }, 0.3);
  }
  return tl;
}

function runPageLeaveAnimation(current, next) {
  const tl = gsap.timeline({
    onComplete: () => { current.remove(); }
  });

  if (reducedMotion) {
    return tl.set([current, ".footer"], { autoAlpha: 0 });
  }

  // Alte Seite und Footer (liegt außerhalb des Barba-Containers) schnell ausblenden,
  // damit nichts davon über der neuen Seite sichtbar bleibt
  tl.to(".footer", { autoAlpha: 0, ease: "power2.in", duration: 0.25 }, 0);
  tl.to(current, {
    autoAlpha: 0,
    ease: "power2.in",
    duration: 0.3,
  }, 0);

  return tl;
}

function runPageEnterAnimation(next) {
  const tl = gsap.timeline();

  if (reducedMotion) {
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");
    return new Promise(resolve => tl.call(resolve, null, "pageReady"));
  }

  tl.add("startEnter", 0.3);

  tl.fromTo(next, {
    autoAlpha: 0,
  }, {
    autoAlpha: 1,
    ease: "power1.out",
    duration: 0.6,
  }, "startEnter");

  const h1 = next.querySelector("h1");
  if (h1) {
    gsap.set(h1, { visibility: "visible" });
    tl.fromTo(h1, {
      yPercent: 25,
      autoAlpha: 0,
    }, {
      yPercent: 0,
      autoAlpha: 1,
      ease: "expo.out",
      duration: 1,
    }, "< 0.3");
  }

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return new Promise(resolve => {
    tl.call(resolve, null, "pageReady");
  });
}


// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter(data => {
  if (data.current && data.current.container) gsap.set(data.next.container, { position: "fixed", top: 0, left: 0, right: 0, autoAlpha: 0 });
  if (lenis && typeof lenis.stop === "function") lenis.stop();
  closeMenus();
  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {
  if (hasScrollTrigger) ScrollTrigger.getAll().forEach(trigger => trigger.kill());
});

barba.hooks.enter(() => { markCurrent(); });

barba.hooks.afterEnter(data => {
  if (!data.current || !data.current.container) return; // Erstaufruf läuft über once()
  window.__chcEntered = true;
  try { const d = new DOMParser().parseFromString(data.next.html, "text/html"); document.title = d.title; html.setAttribute("data-wf-page", d.documentElement.getAttribute("data-wf-page") || ""); } catch (e) {}
  if (window.Webflow && Webflow.destroy) { try { Webflow.destroy(); Webflow.ready(); const ix = Webflow.require && Webflow.require("ix2"); if (ix) ix.init(); } catch (e) {} }
  initAfterEnterFunctions(data.next.container);
  if (hasLenis) { lenis.resize(); lenis.start(); }
  if (hasScrollTrigger) ScrollTrigger.refresh();
});

barba.init({
  debug: false,
  timeout: 7000,
  preventRunning: true,
  prevent: ({ el, href }) => {
    if (!href || el.hasAttribute("target") || el.hasAttribute("data-barba-prevent") || el.hasAttribute("download")) return true;
    let u; try { u = new URL(href, location.href); } catch (e) { return true; }
    if (u.origin !== location.origin) return true;
    if (u.pathname === location.pathname && u.hash) return true;
    return /\.(pdf|jpe?g|png|webp|zip)$/i.test(u.pathname);
  },
  transitions: [{
    name: "default",
    sync: true,
    async once(data) {
      applyThemeFrom(data.next.container);
      initOnceFunctions();
      initAfterEnterFunctions(data.next.container);
      return runPageOnceAnimation(data.next.container);
    },
    async leave(data) { return runPageLeaveAnimation(data.current.container, data.next.container); },
    async enter(data) { return runPageEnterAnimation(data.next.container); }
  }],
});


// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || "light";
  document.body.dataset.pageTheme = pageTheme;
}

function initLenis() {
  if (lenis) return;
  if (!hasLenis || !FINE) return;
  lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
  if (hasScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: "position,top,left,right" });
  gsap.set(".footer", { autoAlpha: 1 });
  if (lenis) { lenis.resize(); lenis.start(); }
}

function debounceOnWidthChange(fn, ms) {
  let last = innerWidth, timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (innerWidth !== last) { last = innerWidth; fn.apply(this, args); }
    }, ms);
  };
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement("template");
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll("[data-barba-update]");
  var currentNodes = document.querySelectorAll("nav [data-barba-update]");
  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;
    var newStatus = next.getAttribute("aria-current");
    if (newStatus !== null) curr.setAttribute("aria-current", newStatus); else curr.removeAttribute("aria-current");
    curr.setAttribute("class", next.getAttribute("class") || "");
  });
}


// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

/* Buttons: Osmo character stagger */
function initButtons(scope) {
  $$("[data-btn]:not([data-btn-ready])", scope).forEach(b => {
    const t = b.textContent.trim();
    b.textContent = "";
    const w = document.createElement("span"); w.className = "btn_text";
    [...t].forEach((c, i) => { const s = document.createElement("span"); s.textContent = c; s.style.transitionDelay = (i * 0.012) + "s"; w.appendChild(s); });
    b.appendChild(w);
    b.insertAdjacentHTML("beforeend", ARROW);
    b.setAttribute("aria-label", b.getAttribute("aria-label") || t);
    b.setAttribute("data-btn-ready", "");
  });
}

/* Pfeil-Links: Text-Pfeil "→" durch animierten SVG-Pfeil ersetzen */
const LINK_ARROW = '<svg viewBox="0 0 18 12" fill="none" aria-hidden="true"><path d="M0 6h16.5M11.5 1l5 5-5 5" stroke="currentColor" stroke-width="1.2"/></svg>';
function initArrowLinks(scope) {
  $$("a:not([data-btn]):not([data-arrow-ready])", scope).forEach(a => {
    const last = [...a.childNodes].reverse().find(n => n.nodeType === 3 && n.textContent.trim());
    if (!last || !/\s*→\s*$/.test(last.textContent)) return;
    last.textContent = last.textContent.replace(/\s*→\s*$/, "");
    a.insertAdjacentHTML("beforeend", '<span class="link-arrow" aria-hidden="true">' + LINK_ARROW + LINK_ARROW + "</span>");
    a.classList.add("has-arrow");
    a.setAttribute("data-arrow-ready", "");
  });
}

/* Telefonnummern im Fließtext klickbar machen */
function initTelLinks(scope) {
  $$('a[href^="tel:"]', scope).forEach(a => a.classList.add("tel-link"));
  const re = /(?:\+49|\(?0\d)[\d\s\/()-]{5,}\d/g;
  const roots = $$(".rt, .acc_body, .feature, .info_item, .footer, .card, .room_body, p, li", scope);
  const seen = new Set();
  roots.forEach(root => {
    if (seen.has(root) || root.closest("a, [data-no-tel], .book")) return;
    seen.add(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement.closest("a, script, style, [data-no-tel]") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const t = node.textContent; re.lastIndex = 0;
      if (!re.test(t)) return; re.lastIndex = 0;
      const frag = document.createDocumentFragment(); let last = 0, m;
      while ((m = re.exec(t))) {
        const num = m[0].trim(), digits = num.replace(/\D/g, "");
        if (digits.length < 8 || /\d\.\d/.test(num)) continue;
        frag.append(t.slice(last, m.index));
        const a = document.createElement("a");
        a.href = "tel:" + (num.startsWith("+") ? "+" + digits : "+49" + digits.replace(/^0/, ""));
        a.className = "tel-link"; a.textContent = num;
        frag.append(a); last = m.index + m[0].length;
      }
      if (!last) return;
      frag.append(t.slice(last));
      node.replaceWith(frag);
    });
  });
}

/* Lage-Grafik: Positionen setzen + Linie zeichnen */
function initLage(scope) {
  $$("[data-lage]", scope).forEach(el => {
    $$("[data-x]", el).forEach(s => s.style.setProperty("--x", s.dataset.x + "%"));
    if (reducedMotion || el._lage || (!window.__chcEntered && inView(el))) return; el._lage = true;
    const line = $(".lage_line", el), items = $$(".lage_stop, .lage_hotel", el);
    gsap.set(line, { "--draw": 0 });
    gsap.set(items, { autoAlpha: 0, y: (i, t) => (t.classList.contains("is-top") ? 10 : -10) });
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    tl.to(line, { "--draw": 1, duration: 1.4, ease: "expo.inOut" })
      .to(items, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: { each: 0.05, from: "center" } }, 0.5);
  });
}

/* Nav: zwei Mega-Menüs (Hotels, Mehr) + Mobilmenü */
function closeMenus() {
  html.classList.remove("menu-open", "mega-open", "mega-hotels", "mega-mehr");
  $$("[data-menu-toggle],[data-mega-toggle]").forEach(b => b.setAttribute("aria-expanded", "false"));
  if (lenis) lenis.start();
}
function initNav() {
  const burger = $("[data-menu-toggle]");
  // Mega-Menüs steuert site.js schon vor dem Laden der Bibliotheken (Hover öffnet sofort)
  const setMega = name => (window.__chcMega ? window.__chcMega(name) : null);
  const setMenu = open => {
    html.classList.toggle("menu-open", open);
    if (burger) { burger.setAttribute("aria-expanded", open); burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen"); }
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  if (burger) burger.addEventListener("click", () => setMenu(!html.classList.contains("menu-open")));
  $$(".menu a, .mega a").forEach(a => a.addEventListener("click", closeMenus));
  addEventListener("keydown", e => { if (e.key === "Escape") { setMenu(false); setMega(null); } });
  // aktuelle Seite in Nav, Mega und Menü markieren
  markCurrent();
}
function markCurrent() {
  const p = location.pathname.replace(/\/$/, "") || "/";
  $$(".nav a[href], .menu a[href]").forEach(a => {
    if (a.getAttribute("href") === "#") return;
    let h; try { h = new URL(a.getAttribute("href"), location.href).pathname.replace(/\/$/, "") || "/"; } catch (e) { return; }
    if (h === p) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
}
function initScrollState() {
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    html.classList.toggle("nav-solid", y > 40);
    if (y > 400 && y > lastY + 4) { html.classList.add("nav-hide"); html.classList.remove("mega-open"); }
    if (y < lastY - 4) html.classList.remove("nav-hide");
    html.classList.toggle("show-sticky", y > 700 && y + innerHeight < document.body.scrollHeight - 600);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
}

/* Headlines: Zeilen-Masken-Reveal */
function initSplitHeadings(scope) {
  const firstRun = !window.__chcEntered;
  document.fonts.ready.then(() => {
    $$("[data-split]", scope).forEach(el => {
      if (reducedMotion || (firstRun && inView(el))) { el.style.visibility = "visible"; return; }
      const hero = el.dataset.split === "hero";
      SplitText.create(el, {
        type: "lines", mask: "lines", linesClass: "split-line", autoSplit: true, aria: "auto",
        onSplit: self => gsap.from(self.lines, {
          yPercent: 110, duration: hero ? 1.3 : 1.05, ease: "expo.out", stagger: 0.12, delay: hero ? 0.45 : 0,
          scrollTrigger: hero ? null : { trigger: el, start: "top 88%", once: true }
        })
      });
      gsap.set(el, { visibility: "visible" });
    });
  });
}

/* Osmo: Elements Reveal on Scroll */
function initContentRevealScroll() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = gsap.context(() => {
    nextPage.querySelectorAll('[data-reveal-group]').forEach((groupEl) => {
      const groupStaggerSec = (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000;
      const groupDistance = groupEl.getAttribute('data-distance') || '2em';
      const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';
      const animDuration = 0.8;
      const animEase = 'power4.inOut';

      if (prefersReduced || (!window.__chcEntered && inView(groupEl))) {
        gsap.set(groupEl, { clearProps: 'all', y: 0, autoAlpha: 1 });
        return;
      }

      const directChildren = [...groupEl.children].filter((el) => el.nodeType === 1);

      if (!directChildren.length) {
        gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: groupEl, start: triggerStart, once: true,
          onEnter: () => gsap.to(groupEl, { y: 0, autoAlpha: 1, duration: animDuration, ease: animEase, onComplete: () => gsap.set(groupEl, { clearProps: 'all' }) })
        });
        return;
      }

      const slots = [];
      directChildren.forEach((child) => {
        const nestedGroup = child.matches('[data-reveal-group-nested]') ? child : child.querySelector(':scope [data-reveal-group-nested]');
        if (nestedGroup) {
          const includeParent = child.getAttribute('data-ignore') !== 'true' && (child.getAttribute('data-ignore') === 'false' || nestedGroup.getAttribute('data-ignore') === 'false');
          const nestedChildren = [...nestedGroup.children].filter((el) => el.nodeType === 1 && el.getAttribute('data-ignore') !== 'true');
          slots.push({ type: 'nested', parentEl: child, nestedEl: nestedGroup, includeParent, nestedChildren });
        } else {
          if (child.getAttribute('data-ignore') === 'true') return;
          slots.push({ type: 'item', el: child });
        }
      });

      slots.forEach((slot) => {
        if (slot.type === 'item') {
          const isNestedSelf = slot.el.matches('[data-reveal-group-nested]');
          const distance = isNestedSelf ? groupDistance : slot.el.getAttribute('data-distance') || groupDistance;
          gsap.set(slot.el, { y: distance, autoAlpha: 0 });
        } else {
          if (slot.includeParent) gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
          const nestedDistance = slot.nestedEl.getAttribute('data-distance') || groupDistance;
          slot.nestedChildren.forEach((target) => gsap.set(target, { y: nestedDistance, autoAlpha: 0 }));
        }
      });

      ScrollTrigger.create({
        trigger: groupEl, start: triggerStart, once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          slots.forEach((slot, slotIndex) => {
            const slotTime = slotIndex * groupStaggerSec;
            if (slot.type === 'item') {
              tl.to(slot.el, { y: 0, autoAlpha: 1, duration: animDuration, ease: animEase, onComplete: () => gsap.set(slot.el, { clearProps: 'all' }) }, slotTime);
            } else {
              if (slot.includeParent) tl.to(slot.parentEl, { y: 0, autoAlpha: 1, duration: animDuration, ease: animEase, onComplete: () => gsap.set(slot.parentEl, { clearProps: 'all' }) }, slotTime);
              const nestedMs = parseFloat(slot.nestedEl.getAttribute('data-stagger'));
              const nestedStaggerSec = isNaN(nestedMs) ? groupStaggerSec : nestedMs / 1000;
              slot.nestedChildren.forEach((nestedChild, nestedIndex) => {
                tl.to(nestedChild, { y: 0, autoAlpha: 1, duration: animDuration, ease: animEase, onComplete: () => gsap.set(nestedChild, { clearProps: 'all' }) }, slotTime + nestedIndex * nestedStaggerSec);
              });
            }
          });
        }
      });
    });
  });

  return () => ctx.revert();
}

/* Bild-Reveal (Clip) und Parallax */
function initImgReveal(scope) {
  if (reducedMotion) return;
  $$("[data-img-reveal]", scope).forEach(el => {
    gsap.fromTo(el, { clipPath: "inset(8% 6% 8% 6% round 1rem)" }, { clipPath: "inset(0% 0% 0% 0% round 0.75rem)", ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 40%", scrub: true } });
  });
}
function initParallax(scope) {
  if (reducedMotion) return;
  $$("[data-parallax]", scope).forEach(m => {
    const img = $("img", m);
    gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
  });
}
function initFooterWord() {
  const fw = $(".footer_word");
  if (!fw || reducedMotion || (!window.__chcEntered && inView(fw))) return;
  if (!fw._split) fw._split = SplitText.create(fw, { type: "chars" });
  gsap.fromTo(fw._split.chars, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", stagger: 0.035, scrollTrigger: { trigger: fw, start: "top 95%", once: true } });
}


/* Osmo: Parallax Image Gallery with Thumbnails (Hero) */
CustomEase.create("slideshow-wipe", "0.6, 0.08, 0.02, 0.99");

function initSlideShow(el) {
  const ui = {
    el,
    slides: Array.from(el.querySelectorAll('[data-slideshow="slide"]')),
    inner: Array.from(el.querySelectorAll('[data-slideshow="parallax"]')),
    thumbs: Array.from(el.querySelectorAll('[data-slideshow="thumb"]'))
  };

  let current = 0;
  const length = ui.slides.length;
  let animating = false;
  let observer;
  let animationDuration = 0.9;

  ui.slides.forEach((slide, index) => { slide.setAttribute('data-index', index); });
  ui.thumbs.forEach((thumb, index) => { thumb.setAttribute('data-index', index); });

  ui.slides[current].classList.add('is--current');
  ui.thumbs[current].classList.add('is--current');

  function navigate(direction, targetIndex = null) {
    if (animating) return;
    animating = true;
    observer.disable();

    const previous = current;
    current = targetIndex !== null && targetIndex !== undefined ? targetIndex : direction === 1 ? (current < length - 1 ? current + 1 : 0) : (current > 0 ? current - 1 : length - 1);

    const currentSlide = ui.slides[previous];
    const currentInner = ui.inner[previous];
    const upcomingSlide = ui.slides[current];
    const upcomingInner = ui.inner[current];

    gsap.timeline({
      defaults: { duration: animationDuration, ease: 'slideshow-wipe' },
      onStart: function () {
        upcomingSlide.classList.add('is--current');
        ui.thumbs[previous].classList.remove('is--current');
        ui.thumbs[current].classList.add('is--current');
      },
      onComplete: function () {
        currentSlide.classList.remove('is--current');
        animating = false;
        setTimeout(() => observer.enable(), animationDuration);
      }
    })
      .to(currentSlide, { xPercent: -direction * 100 }, 0)
      .to(currentInner, { xPercent: direction * 50 }, 0)
      .fromTo(upcomingSlide, { xPercent: direction * 100 }, { xPercent: 0 }, 0)
      .fromTo(upcomingInner, { xPercent: -direction * 50 }, { xPercent: 0 }, 0);
  }

  function onClick(event) {
    const targetIndex = parseInt(event.currentTarget.getAttribute('data-index'), 10);
    if (targetIndex === current || animating) return;
    const direction = targetIndex > current ? 1 : -1;
    navigate(direction, targetIndex);
  }

  ui.thumbs.forEach(thumb => {
    thumb.addEventListener('click', onClick);
    thumb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick({ currentTarget: thumb }); } });
  });

  observer = Observer.create({
    target: el,
    type: 'wheel,touch,pointer',
    onLeft: () => { if (!animating) navigate(1); },
    onRight: () => { if (!animating) navigate(-1); },
    onWheel: (event) => {
      if (animating) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        if (event.deltaX > 50) navigate(1);
        else if (event.deltaX < -50) navigate(-1);
      }
    },
    wheelSpeed: -1,
    tolerance: 10
  });

  // Ergänzung: Autoplay (pausiert bei Interaktion) + Bildunterschrift
  let auto = reducedMotion ? null : setInterval(() => { if (!document.hidden && !animating && el.isConnected) navigate(1); }, 6500);
  const stop = () => { if (auto) { clearInterval(auto); auto = null; } };
  el.addEventListener('pointerdown', stop); ui.thumbs.forEach(t => t.addEventListener('click', stop));
  const root = el.closest('.hero');
  const nameEl = root && root.querySelector('[data-hero-name]'), countEl = root && root.querySelector('[data-hero-count]');
  if (nameEl) {
    new MutationObserver(() => {
      const i = ui.slides.findIndex(s => s.classList.contains('is--current') && s.style.transform !== '');
      const idx = ui.thumbs.findIndex(t => t.classList.contains('is--current'));
      const n = ui.slides[idx].dataset.name || '';
      if (nameEl.dataset.idx == idx) return;
      nameEl.dataset.idx = idx;
      gsap.to(nameEl, { autoAlpha: 0, y: -8, duration: 0.25, ease: 'power2.in', onComplete: () => {
        nameEl.innerHTML = n.replace('®', '<sup>®</sup>');
        countEl.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(length).padStart(2, '0');
        gsap.fromTo(nameEl, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' });
      } });
    }).observe(el.querySelector('.img-slider__nav'), { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  return {
    destroy: function () {
      stop();
      if (observer) observer.kill();
      ui.thumbs.forEach(thumb => thumb.removeEventListener('click', onClick));
    }
  };
}

function initParallaxImageGalleryThumbnails() {
  let wrappers = nextPage.querySelectorAll('[data-slideshow="wrap"]');
  wrappers.forEach(wrap => initSlideShow(wrap));
}


/* Buchungsleiste: Formular mit Ziel Guestline (funktioniert auch ohne JS) */
function initBooking(scope) {
  $$("[data-book]", scope).forEach(f => {
    const hotel = $("[data-book-hotel]", f), inp = $("[data-book-in]", f), out = $("[data-book-out]", f), ad = $("[data-book-adults]", f), adIn = $("[data-book-adults-input]", f);
    const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const plus = (v, n) => { const d = new Date(v); d.setDate(d.getDate() + n); return iso(d); };
    const today = iso(new Date());
    inp.min = today; if (!inp.value) inp.value = today;
    if (!out.value) out.value = plus(inp.value, 1);
    let adults = parseInt(adIn ? adIn.value : 1, 10) || 1;
    const update = () => {
      if (out.value <= inp.value) out.value = plus(inp.value, 1);
      out.min = plus(inp.value, 1);
      if (ad) { ad.textContent = adults; const w = ad.nextSibling; if (w && w.nodeType === 3) w.textContent = adults === 1 ? " Erwachsener" : " Erwachsene"; } if (adIn) adIn.value = adults;
    };
    [inp, out].forEach(x => x.addEventListener("change", update));
    $$("[data-book-step]", f).forEach(b => b.addEventListener("click", () => { adults = Math.min(6, Math.max(1, adults + +b.dataset.bookStep)); update(); }));
    f.addEventListener("submit", e => {
      e.preventDefault(); update();
      const p = new URLSearchParams();
      if (hotel && hotel.value) p.set("hotel", hotel.value);
      p.set("lng", "de"); p.set("arrival", inp.value); p.set("departure", out.value); p.set("adults", adults); p.set("children", 0);
      window.open("https://booking.eu.guestline.app/CHC?" + p.toString().replace(/%3B/g, ";"), "_blank", "noopener");
    });
    update();
  });
}


/* ==========================================================
   Osmo: Interactive Globe (Mapbox) + Fallback ohne Token
   ========================================================== */
function initInteractiveGlobe() {
  const token = window.CLASSIK_MAPBOX_TOKEN;
  if (typeof mapboxgl !== "undefined" && token) return initInteractiveGlobeMapbox(token);
  return initGlobeFallback();
}

function initInteractiveGlobeMapbox(token) {
  const cfg = {
    mapboxToken: token,
    mapStyle: "mapbox://styles/osmo-supply/cmmw1zil7003e01s84w3h740n",
    center: [10.4, 51.1], zoom: 3, projection: "globe",
    autoRotate: true, secondsPerRevolution: 120, maxSpinZoom: 5, slowSpinZoom: 3,
    flyToDuration: 2000, flyToZoom: 5.2, globeOffsetX: -0.2, globeOffsetY: 0.25,
    mobile: { zoom: 2, flyToZoom: 4.2, globeOffsetX: 0, globeOffsetY: 0.5 },
  };
  const isSmall = () => window.matchMedia("(max-width: 991px)").matches;
  const val = (key) => (isSmall() && cfg.mobile && cfg.mobile[key] !== undefined) ? cfg.mobile[key] : cfg[key];
  const wrapper = nextPage.querySelector("[data-globe-init]");
  if (!wrapper || wrapper.dataset.globeInit === "initialized") return;
  mapboxgl.accessToken = cfg.mapboxToken;
  const mapEl = wrapper.querySelector("[data-globe-map]");
  mapEl.id = "globe-map";
  const markers = globeReadMarkers(wrapper);
  const first = markers[0];
  const map = new mapboxgl.Map({ container: mapEl.id, style: cfg.mapStyle, center: first ? [first.lng, first.lat] : cfg.center, zoom: first ? val("flyToZoom") : val("zoom"), projection: cfg.projection, attributionControl: false, cooperativeGestures: true });
  map.addControl(new mapboxgl.AttributionControl({ compact: true }));
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");
  const getPadding = (extraRight) => { const w = mapEl.offsetWidth, h = mapEl.offsetHeight, ox = val("globeOffsetX"), oy = val("globeOffsetY"); return { top: Math.max(0, oy * h), bottom: Math.max(0, -oy * h), left: Math.max(0, ox * w), right: Math.max(0, -ox * w) + (extraRight || 0) }; };
  map.on("load", () => {
    const infoEl = wrapper.querySelector("[data-globe-info]");
    map.setPadding(getPadding(!isSmall() && infoEl ? infoEl.offsetWidth + 24 : 0));
    const pins = markers.map(data => {
      const el = globeMarkerEl(wrapper, data);
      const marker = new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat([data.lng, data.lat]).addTo(map);
      return { marker, element: el, data };
    });
    globeSlider(wrapper, markers, pins, (m) => map.flyTo({ center: [m.lng, m.lat], zoom: val("flyToZoom"), duration: cfg.flyToDuration, essential: true }), cfg.flyToDuration);
    if (cfg.autoRotate && !reducedMotion) {
      let interacting = false;
      const spin = () => { const z = map.getZoom(); if (interacting || z >= cfg.maxSpinZoom) return; let speed = 360 / cfg.secondsPerRevolution; if (z > cfg.slowSpinZoom) speed *= (cfg.maxSpinZoom - z) / (cfg.maxSpinZoom - cfg.slowSpinZoom); const c = map.getCenter(); c.lng -= speed; map.easeTo({ center: c, duration: 1000, easing: n => n }); };
      map.on("mousedown", () => { interacting = true; }); map.on("touchstart", () => { interacting = true; });
      ["mouseup", "dragend", "pitchend", "rotateend", "touchend"].forEach(e => map.on(e, () => { interacting = false; spin(); }));
      map.on("moveend", spin); spin();
    }
    globePanel(wrapper, (collapsed) => {
      map.setPadding(getPadding(!isSmall() && !collapsed ? infoEl.offsetWidth + 24 : 0));
      if (collapsed) map.flyTo({ center: cfg.center, zoom: val("zoom"), duration: cfg.flyToDuration, essential: true });
    });
    window.addEventListener("resize", () => map.resize(), { passive: true });
    wrapper.dataset.globeInit = "initialized";
  });
}

function globeReadMarkers(wrapper) {
  return [...wrapper.querySelectorAll("[data-globe-item]")].map((el, i) => ({
    id: el.getAttribute("data-globe-id") || "loc-" + i,
    lat: parseFloat(el.getAttribute("data-globe-lat")) || 0,
    lng: parseFloat(el.getAttribute("data-globe-lng")) || 0,
    name: (el.querySelector("[data-globe-item-name]") || {}).textContent || "",
    element: el,
  }));
}
function globeMarkerEl(wrapper, data) {
  const tpl = wrapper.querySelector("[data-globe-marker-template]");
  const el = tpl.cloneNode(true);
  el.removeAttribute("data-globe-marker-template");
  el.setAttribute("data-globe-marker", data.id);
  el.setAttribute("role", "button"); el.setAttribute("tabindex", "0"); el.setAttribute("aria-label", data.name);
  return el;
}
function globeSetActive(pins, idx) {
  pins.forEach((p, i) => { const v = i === idx ? "true" : "false"; p.element.setAttribute("data-active", v); p.data.element.setAttribute("data-active", v); });
}
// Osmo initSlider-Logik (Liste, Pfeile, Zähler, Scroll-Sync)
function globeSlider(wrapper, markers, pins, flyTo, flyDur) {
  const list = wrapper.querySelector("[data-globe-list]");
  const prevBtn = wrapper.querySelector("[data-globe-prev]"), nextBtn = wrapper.querySelector("[data-globe-next]"), counter = wrapper.querySelector("[data-globe-counter]");
  let cur = 0, flying = false; const total = markers.length;
  const count = () => { if (counter) counter.textContent = (cur + 1) + " / " + total; };
  const go = (i) => {
    i = ((i % total) + total) % total;
    if (i === cur && markers[i].element.getAttribute("data-active") === "true") return;
    cur = i; flying = true;
    const item = markers[i].element;
    list.scrollTo({ top: item.offsetTop, left: item.offsetLeft, behavior: "smooth" });
    globeSetActive(pins, i); count(); flyTo(markers[i]);
    setTimeout(() => { flying = false; }, flyDur + 200);
  };
  if (prevBtn) prevBtn.addEventListener("click", () => go(cur - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => go(cur + 1));
  const observer = new IntersectionObserver(entries => {
    if (flying) return;
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.intersectionRatio <= 0.5) return;
      const idx = markers.findIndex(m => m.element === entry.target);
      if (idx !== -1 && idx !== cur) { cur = idx; globeSetActive(pins, idx); count(); flyTo(markers[idx]); }
    });
  }, { root: list, threshold: 0.5 });
  markers.forEach(m => observer.observe(m.element));
  markers.forEach((m, i) => m.element.addEventListener("click", e => { if (e.target.closest("[data-globe-item-link]")) return; go(i); }));
  pins.forEach((p, i) => { p.element.addEventListener("click", () => go(i)); p.element.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(i); } }); });
  list.setAttribute("tabindex", "0");
  list.addEventListener("keydown", e => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
  });
  globeSetActive(pins, 0); count();
  return { go };
}
function globePanel(wrapper, sync) {
  const close = wrapper.querySelector("[data-globe-close]"), open = wrapper.querySelector("[data-globe-reopen]");
  new MutationObserver(() => sync(wrapper.getAttribute("data-collapsed") === "true")).observe(wrapper, { attributes: true, attributeFilter: ["data-collapsed"] });
  if (close) close.addEventListener("click", () => wrapper.setAttribute("data-collapsed", "true"));
  if (open) open.addEventListener("click", () => wrapper.setAttribute("data-collapsed", "false"));
}

// Fallback: Orthografischer Globus mit d3-geo (gleiche Bedienung, kein Token nötig)
let __world = null;
function loadWorld() {
  if (!__world) __world = fetch(BASE+"geo/world-110m.json").then(r => r.json()).then(t => topojson.feature(t, t.objects.countries));
  return __world;
}
function initGlobeFallback() {
  const wrapper = nextPage.querySelector("[data-globe-init]");
  if (!wrapper || wrapper.dataset.globeInit === "initialized" || typeof d3 === "undefined") return;
  wrapper.dataset.globeInit = "initialized";
  const mapEl = wrapper.querySelector("[data-globe-map]");
  const markers = globeReadMarkers(wrapper);
  const isSmall = () => matchMedia("(max-width: 991px)").matches;
  const box = document.createElement("div"); box.className = "geo-fallback";
  box.innerHTML = '<svg aria-hidden="true"><defs><radialGradient id="gl-shade" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#3a4d53"/><stop offset="1" stop-color="#1b2629"/></radialGradient></defs><path class="g-sphere" fill="url(#gl-shade)"/><path class="g-grat" fill="none" stroke="rgba(245,242,236,.07)" stroke-width=".6"/><path class="g-land" fill="rgba(245,242,236,.13)" stroke="rgba(245,242,236,.28)" stroke-width=".5"/><path class="g-de" fill="rgba(245,242,236,.32)" stroke="rgba(245,242,236,.6)" stroke-width=".8"/><path class="g-rim" fill="none" stroke="rgba(245,242,236,.18)" stroke-width="1"/></svg><div class="geo-markers"></div><div class="globe-zoom"><button type="button" aria-label="Hineinzoomen">+</button><button type="button" aria-label="Herauszoomen">−</button></div>';
  mapEl.appendChild(box);
  const svg = box.querySelector("svg"), mk = box.querySelector(".geo-markers");
  const pins = markers.map(data => { const el = globeMarkerEl(wrapper, data); mk.appendChild(el); return { element: el, data }; });
  const proj = d3.geoOrthographic().clipAngle(90).precision(0.4);
  const path = d3.geoPath(proj);
  const grat = d3.geoGraticule10();
  const st = { lon: -markers[0].lng + 40, lat: -40, k: 1 };
  let land = null, de = null;
  const infoEl = wrapper.querySelector("[data-globe-info]");
  const render = () => {
    const w = box.clientWidth, h = box.clientHeight;
    const collapsed = wrapper.getAttribute("data-collapsed") === "true";
    const right = !isSmall() && !collapsed && infoEl ? infoEl.offsetWidth + 24 : 0;
    const cx = (w - right) / 2, cy = isSmall() ? h * 0.55 : h * 0.62;
    const base = Math.min(w - right, h) * (isSmall() ? 0.44 : 0.5);
    proj.translate([cx, cy]).scale(base * st.k).rotate([st.lon, st.lat]);
    svg.querySelector(".g-sphere").setAttribute("d", path({ type: "Sphere" }));
    svg.querySelector(".g-rim").setAttribute("d", path({ type: "Sphere" }));
    svg.querySelector(".g-grat").setAttribute("d", path(grat));
    if (land) { svg.querySelector(".g-land").setAttribute("d", path(land)); svg.querySelector(".g-de").setAttribute("d", path(de)); }
    const center = [-st.lon, -st.lat];
    pins.forEach(p => {
      const c = [p.data.lng, p.data.lat];
      const vis = d3.geoDistance(c, center) < Math.PI / 2 - 0.05;
      const [x, y] = proj(c);
      p.element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      p.element.style.opacity = vis ? 1 : 0; p.element.style.pointerEvents = vis ? "auto" : "none";
    });
  };
  loadWorld().then(fc => { land = fc; de = { type: "FeatureCollection", features: fc.features.filter(f => f.properties.name === "Germany") }; render(); });
  // Auto-Rotation bis zur ersten Interaktion
  let spinning = !reducedMotion, tween = null;
  const tick = () => { if (spinning && wrapper.isConnected) { st.lon += 0.12; render(); } };
  gsap.ticker.add(tick);
  const fly = (m, k = isSmall() ? 3.2 : 3.6) => {
    spinning = false; if (tween) tween.kill();
    let target = -m.lng; while (target - st.lon > 180) target -= 360; while (target - st.lon < -180) target += 360;
    tween = gsap.to(st, { lon: target, lat: -m.lat, k, duration: reducedMotion ? 0 : 2, ease: "power3.inOut", onUpdate: render });
  };
  // Ziehen
  let drag = null;
  box.addEventListener("pointerdown", e => { if (e.target.closest("[data-globe-marker],button")) return; spinning = false; if (tween) tween.kill(); drag = { x: e.clientX, y: e.clientY, lon: st.lon, lat: st.lat }; box.setPointerCapture(e.pointerId); box.style.cursor = "grabbing"; });
  box.addEventListener("pointermove", e => { if (!drag) return; const s = 0.25 / st.k; st.lon = drag.lon + (e.clientX - drag.x) * s; st.lat = Math.max(-80, Math.min(80, drag.lat - (e.clientY - drag.y) * s)); render(); });
  const end = () => { drag = null; box.style.cursor = ""; };
  box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
  const [zin, zout] = box.querySelectorAll(".globe-zoom button");
  zin.addEventListener("click", () => { spinning = false; gsap.to(st, { k: Math.min(6, st.k * 1.4), duration: 0.6, ease: "power2.out", onUpdate: render }); });
  zout.addEventListener("click", () => { gsap.to(st, { k: Math.max(0.8, st.k / 1.4), duration: 0.6, ease: "power2.out", onUpdate: render }); });
  // Erst beim Sichtbarwerden zum ersten Standort fliegen
  let started = false;
  ScrollTrigger.create({ trigger: wrapper, start: "top 60%", once: true, onEnter: () => { started = true; fly(markers[0]); } });
  globeSlider(wrapper, markers, pins, m => { if (started) fly(m); }, 2000);
  globePanel(wrapper, collapsed => {
    if (collapsed) { if (tween) tween.kill(); tween = gsap.to(st, { k: 1, lat: -35, duration: reducedMotion ? 0 : 1.6, ease: "power3.inOut", onUpdate: render, onComplete: () => { spinning = !reducedMotion; } }); }
    else { const i = pins.findIndex(p => p.element.getAttribute("data-active") === "true"); fly(markers[Math.max(0, i)]); }
  });
  const ro = new ResizeObserver(render); ro.observe(box);
  render();
}


/* ==========================================================
   Osmo: Cascading Slider
   ========================================================== */
function initCascadingSlider() {
  const duration = 0.65;
  const ease = 'power3.inOut';
  const breakpoints = [
    { maxWidth: 479, activeWidth: 0.78, siblingWidth: 0.08 },
    { maxWidth: 767, activeWidth: 0.70, siblingWidth: 0.10 },
    { maxWidth: 991, activeWidth: 0.60, siblingWidth: 0.10 },
    { maxWidth: Infinity, activeWidth: 0.60, siblingWidth: 0.13 },
  ];

  const wrappers = nextPage.querySelectorAll('[data-cascading-slider-wrap]');
  wrappers.forEach(setupInstance);

  function setupInstance(wrapper) {
    const viewport = wrapper.querySelector('[data-cascading-viewport]');
    const prevButton = wrapper.querySelector('[data-cascading-slider-prev]');
    const nextButton = wrapper.querySelector('[data-cascading-slider-next]');
    const slides = Array.from(viewport.querySelectorAll('[data-cascading-slide]'));
    let totalSlides = slides.length;
    if (totalSlides === 0) return;

    if (totalSlides < 9) {
      const originalSlides = slides.slice();
      while (slides.length < 9) {
        originalSlides.forEach(function (original) {
          const clone = original.cloneNode(true);
          clone.setAttribute('data-clone', '');
          clone.setAttribute('aria-hidden', 'true');
          clone.querySelectorAll('a,button').forEach(a => a.setAttribute('tabindex', '-1'));
          viewport.appendChild(clone);
          slides.push(clone);
        });
      }
      totalSlides = slides.length;
    }

    let activeIndex = 0, isAnimating = false, slideWidth = 0, slotCenters = {}, slotWidths = {};

    function readGap() {
      const raw = getComputedStyle(viewport).getPropertyValue('--gap').trim();
      if (!raw) return 0;
      const temp = document.createElement('div');
      temp.style.width = raw; temp.style.position = 'absolute'; temp.style.visibility = 'hidden';
      viewport.appendChild(temp);
      const px = temp.offsetWidth;
      viewport.removeChild(temp);
      return px;
    }
    function getSettings() {
      const windowWidth = window.innerWidth;
      for (let i = 0; i < breakpoints.length; i++) if (windowWidth <= breakpoints[i].maxWidth) return breakpoints[i];
      return breakpoints[breakpoints.length - 1];
    }
    function getOffset(slideIndex, fromIndex) {
      if (fromIndex === undefined) fromIndex = activeIndex;
      let distance = slideIndex - fromIndex;
      const half = totalSlides / 2;
      if (distance > half) distance -= totalSlides;
      if (distance < -half) distance += totalSlides;
      return distance;
    }
    function measure() {
      const settings = getSettings();
      const viewportWidth = viewport.offsetWidth;
      const gap = readGap();
      const activeSlideWidth = viewportWidth * settings.activeWidth;
      const siblingSlideWidth = viewportWidth * settings.siblingWidth;
      const farSlideWidth = Math.max(0, (viewportWidth - activeSlideWidth - 2 * siblingSlideWidth - 4 * gap) / 2);
      slideWidth = activeSlideWidth;
      const visibleSlots = [
        { slot: -2, width: farSlideWidth }, { slot: -1, width: siblingSlideWidth }, { slot: 0, width: activeSlideWidth },
        { slot: 1, width: siblingSlideWidth }, { slot: 2, width: farSlideWidth },
      ];
      let x = 0;
      visibleSlots.forEach(function (def, i) {
        slotCenters[String(def.slot)] = x + def.width / 2;
        slotWidths[String(def.slot)] = def.width;
        if (i < visibleSlots.length - 1) x += def.width + gap;
      });
      slotCenters['-3'] = slotCenters['-2'] - farSlideWidth / 2 - gap - farSlideWidth / 2; slotWidths['-3'] = farSlideWidth;
      slotCenters['3'] = slotCenters['2'] + farSlideWidth / 2 + gap + farSlideWidth / 2; slotWidths['3'] = farSlideWidth;
      slides.forEach(function (slide) { slide.style.width = slideWidth + 'px'; });
    }
    function getSlideProps(offset) {
      const clamped = Math.max(-3, Math.min(3, offset));
      const slotWidth = slotWidths[String(clamped)];
      const clipAmount = Math.max(0, (slideWidth - slotWidth) / 2);
      const translateX = slotCenters[String(clamped)] - slideWidth / 2;
      return { x: translateX, '--clip': clipAmount, zIndex: 10 - Math.abs(clamped) };
    }
    function layout(animate, previousIndex) {
      slides.forEach(function (slide, index) {
        const offset = getOffset(index);
        if (offset < -3 || offset > 3) {
          if (animate && previousIndex !== undefined) {
            const previousOffset = getOffset(index, previousIndex);
            if (previousOffset >= -2 && previousOffset <= 2) {
              const exitSlot = previousOffset < 0 ? -3 : 3;
              gsap.to(slide, Object.assign({}, getSlideProps(exitSlot), { duration: duration, ease: ease, overwrite: true }));
              return;
            }
          }
          const parkSlot = offset < 0 ? -3 : 3;
          gsap.set(slide, getSlideProps(parkSlot));
          return;
        }
        const props = getSlideProps(offset);
        slide.setAttribute('data-status', offset === 0 ? 'active' : 'inactive');
        if (animate) gsap.to(slide, Object.assign({}, props, { duration: duration, ease: ease, overwrite: true }));
        else gsap.set(slide, props);
      });
    }
    function goTo(targetIndex) {
      const normalizedTarget = ((targetIndex % totalSlides) + totalSlides) % totalSlides;
      if (isAnimating || normalizedTarget === activeIndex) return;
      isAnimating = true;
      const previousIndex = activeIndex;
      const travelDirection = getOffset(normalizedTarget, previousIndex) > 0 ? 1 : -1;
      slides.forEach(function (slide, index) {
        const currentOffset = getOffset(index, previousIndex);
        const nextOffset = getOffset(index, normalizedTarget);
        const wasInRange = currentOffset >= -3 && currentOffset <= 3;
        const willBeVisible = nextOffset >= -2 && nextOffset <= 2;
        if (!wasInRange && willBeVisible) gsap.set(slide, getSlideProps(travelDirection > 0 ? 3 : -3));
        const wasInvisible = Math.abs(currentOffset) >= 3;
        const willBeStaging = Math.abs(nextOffset) === 3;
        const crossesSides = currentOffset * nextOffset < 0;
        if (wasInvisible && willBeStaging && crossesSides) gsap.set(slide, getSlideProps(nextOffset > 0 ? 3 : -3));
      });
      activeIndex = normalizedTarget;
      layout(true, previousIndex);
      gsap.delayedCall(duration + 0.05, function () { isAnimating = false; });
    }

    if (prevButton) prevButton.addEventListener('click', function () { goTo(activeIndex - 1); });
    if (nextButton) nextButton.addEventListener('click', function () { goTo(activeIndex + 1); });
    slides.forEach(function (slide, index) {
      slide.addEventListener('click', function (e) { if (index !== activeIndex) { e.preventDefault(); goTo(index); } });
    });
    // Pfeiltasten nur, wenn der Slider im Fokus/sichtbar ist (statt global)
    wrapper.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') goTo(activeIndex - 1);
      if (event.key === 'ArrowRight') goTo(activeIndex + 1);
    });
    let resizeTimer;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { if (!wrapper.isConnected) return; measure(); layout(false); }, 100); });
    measure();
    layout(false);
  }
}


/* ==========================================================
   Osmo: Radial Cards Slider (GSAP)
   ========================================================== */
CustomEase.create("radial", "0.25, 0.1, 0, 1");

function initRadialCardsSlider() {
  const slideDuration = 1;
  const clickEase = 'radial';

  nextPage.querySelectorAll('[data-radial-slider-init]').forEach(container => {
    if (container._radialSliderDraggable) container._radialSliderDraggable.kill();
    if (container._radialSliderProxy) gsap.killTweensOf(container._radialSliderProxy);
    if (container._radialSliderProxyEl) container._radialSliderProxyEl.remove();

    const collection = container.querySelector('[data-radial-slider-collection]');
    const track = container.querySelector('[data-radial-slider-list]');
    if (!collection || !track) return;

    container.querySelectorAll('[data-radial-slider-clone]').forEach(el => el.remove());
    const originalItems = Array.from(container.querySelectorAll('[data-radial-slider-item]:not([data-radial-slider-clone])'));
    if (!originalItems.length) return;

    container.setAttribute('role', 'region');
    container.setAttribute('aria-roledescription', 'carousel');
    container.setAttribute('aria-label', container.getAttribute('aria-label') || 'Radial Cards Slider');
    track.setAttribute('role', 'group');
    track.setAttribute('aria-label', 'Slides');

    const dotsWrap = container.querySelector('[data-radial-slider-generate-dots]');
    if (dotsWrap) {
      const dots = Array.from(dotsWrap.querySelectorAll('[data-radial-slider-control]'));
      if (dots.length) {
        const firstDot = dots[0];
        dots.slice(1).forEach(dot => dot.remove());
        firstDot.setAttribute('data-radial-slider-control', '1');
        firstDot.setAttribute('data-radial-slider-control-status', 'not-active');
        for (let i = 2; i <= originalItems.length; i++) {
          const dot = firstDot.cloneNode(true);
          dot.setAttribute('data-radial-slider-control', String(i));
          dot.setAttribute('data-radial-slider-control-status', 'not-active');
          dotsWrap.appendChild(dot);
        }
      }
    }

    const controls = Array.from(container.querySelectorAll('[data-radial-slider-control]'));
    const totalEl = container.querySelector('[data-radial-slider-total-slide]');
    const indicators = Array.from(container.querySelectorAll('[data-radial-slider-active-slide]'));

    originalItems.forEach((item, index) => {
      item.removeAttribute('data-radial-slider-item-status');
      item.removeAttribute('aria-hidden');
      item.setAttribute('role', 'group');
      item.setAttribute('aria-label', `Slide ${index + 1} of ${originalItems.length}`);
    });
    controls.forEach(btn => {
      const value = btn.getAttribute('data-radial-slider-control');
      if (value === 'prev') btn.setAttribute('aria-label', 'Vorheriges Zimmer');
      if (value === 'next') btn.setAttribute('aria-label', 'Nächstes Zimmer');
      if (/^\d+$/.test(value)) { btn.setAttribute('aria-label', `Zu Zimmer ${value}`); btn.setAttribute('aria-current', 'false'); }
    });

    track.style.height = '';
    const setNumber = (el, value) => { if (!el) return; el.textContent = value < 10 ? '0' + value : String(value); };
    const mod = (value, total) => ((value % total) + total) % total;
    setNumber(totalEl, originalItems.length);

    const containerStyles = getComputedStyle(container);
    const rotateStep = Math.abs(parseFloat(containerStyles.getPropertyValue('--slider-rotate'))) || 18;
    const maxLoopItems = Math.max(1, Math.floor(360 / rotateStep));

    const firstRect = originalItems[0].getBoundingClientRect();
    const itemWidth = firstRect.width;
    const itemHeight = firstRect.height;

    const originParts = getComputedStyle(originalItems[0]).transformOrigin.split(' ');
    const originY = parseFloat(originParts[1]) || itemHeight * 3.75;
    const wheelRadius = Math.max(0, originY - itemHeight / 2);
    const proxyRadius = wheelRadius + Math.max(itemWidth, itemHeight) * 0.525;

    const getBoundsAtAngle = angle => {
      const rad = angle * Math.PI / 180;
      return {
        x: Math.sin(rad) * wheelRadius, y: originY - Math.cos(rad) * wheelRadius,
        halfWidth: Math.abs(Math.cos(rad)) * itemWidth / 2 + Math.abs(Math.sin(rad)) * itemHeight / 2,
        halfHeight: Math.abs(Math.sin(rad)) * itemWidth / 2 + Math.abs(Math.cos(rad)) * itemHeight / 2
      };
    };
    const isOffsetInsideContainer = offset => {
      const containerRect = container.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const originX = trackRect.left + trackRect.width / 2;
      const originYTop = trackRect.top;
      const leftLimit = containerRect.left - originX, rightLimit = containerRect.right - originX;
      const topLimit = containerRect.top - originYTop, bottomLimit = containerRect.bottom - originYTop;
      const bounds = getBoundsAtAngle(offset * rotateStep);
      return bounds.x + bounds.halfWidth >= leftLimit && bounds.x - bounds.halfWidth <= rightLimit && bounds.y + bounds.halfHeight >= topLimit && bounds.y - bounds.halfHeight <= bottomLimit;
    };
    const getVisibleOffsets = () => {
      const offsets = [0];
      const maxSide = Math.ceil(maxLoopItems / 2);
      let leftEdge = 0, rightEdge = 0;
      for (let i = 1; i <= maxSide; i++) { if (!isOffsetInsideContainer(i)) break; offsets.push(i); rightEdge = i; }
      for (let i = 1; i <= maxSide; i++) { if (!isOffsetInsideContainer(-i)) break; offsets.unshift(-i); leftEdge = -i; }
      const nextLeft = leftEdge - 1, nextRight = rightEdge + 1;
      if (Math.abs(nextLeft) <= maxSide) offsets.unshift(nextLeft);
      if (Math.abs(nextRight) <= maxSide) offsets.push(nextRight);
      return offsets;
    };

    const visibleOffsets = getVisibleOffsets();
    const minItemsNeeded = Math.min(maxLoopItems, Math.max(originalItems.length, visibleOffsets.length));
    const neededItems = Math.ceil(minItemsNeeded / originalItems.length) * originalItems.length;
    const currentItems = Array.from(container.querySelectorAll('[data-radial-slider-item]:not([data-radial-slider-clone])'));
    for (let i = currentItems.length; i < neededItems; i++) {
      const clone = currentItems[i % currentItems.length].cloneNode(true);
      clone.setAttribute('data-radial-slider-clone', '');
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }

    const items = Array.from(track.querySelectorAll(':scope > [data-radial-slider-item]'));
    const totalItems = items.length;
    track.style.height = itemHeight + 'px';
    items.forEach(item => item.setAttribute('data-radial-slider-item-status', 'not-active'));
    container.setAttribute('data-radial-slider-drag-status', 'grab');

    const containerRect = container.getBoundingClientRect();
    const collectionRect = collection.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();

    const proxyWrap = document.createElement('div');
    proxyWrap.setAttribute('data-radial-slider-proxy-wrap', '');
    Object.assign(proxyWrap.style, { position: 'absolute', left: containerRect.left - collectionRect.left + 'px', top: containerRect.top - collectionRect.top + 'px', width: containerRect.width + 'px', height: containerRect.height + 'px', overflow: 'hidden', pointerEvents: 'none' });
    const proxy = document.createElement('div');
    proxy.setAttribute('data-radial-slider-proxy', '');
    Object.assign(proxy.style, { position: 'absolute', width: proxyRadius * 2 + 'px', height: proxyRadius * 2 + 'px', left: trackRect.left + trackRect.width / 2 - containerRect.left + 'px', top: trackRect.top - containerRect.top + originY - proxyRadius + 'px', transform: 'translateX(-50%)', borderRadius: '50%', pointerEvents: 'auto', opacity: '0' });
    proxyWrap.appendChild(proxy);
    collection.appendChild(proxyWrap);
    container._radialSliderProxy = proxy;
    container._radialSliderProxyEl = proxyWrap;

    const setRotation = items.map(item => gsap.quickSetter(item, 'rotation', 'deg'));
    gsap.set(proxy, { rotation: 0 });
    const getIndexFromProxy = () => -gsap.getProperty(proxy, 'rotation') / rotateStep;
    const nearestDelta = (index, realIndex, total) => { const loop = Math.round((realIndex - index) / total); return index - (realIndex - loop * total); };
    const nearestDeltaToSlideNumber = (targetNumber, realIndex) => {
      let bestDelta = 0, bestDistance = Infinity;
      items.forEach((item, index) => {
        if (index % originalItems.length !== targetNumber) return;
        const delta = nearestDelta(index, realIndex, totalItems);
        if (Math.abs(delta) < bestDistance) { bestDistance = Math.abs(delta); bestDelta = delta; }
      });
      return bestDelta;
    };

    let lastActiveIndex = null;
    const setIndicator = index => { const value = index + 1; const text = value < 10 ? '0' + value : String(value); indicators.forEach(el => { el.textContent = text; }); };
    const updateControlStatus = activeIndex => {
      controls.forEach(btn => {
        const value = btn.getAttribute('data-radial-slider-control');
        if (!/^\d+$/.test(value)) return;
        const index = Math.max(0, Math.min(originalItems.length - 1, parseInt(value, 10) - 1));
        const isActive = index === activeIndex;
        btn.setAttribute('data-radial-slider-control-status', isActive ? 'active' : 'not-active');
        btn.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };
    const updateActiveUI = activeIndex => { if (activeIndex === lastActiveIndex) return; setIndicator(activeIndex); updateControlStatus(activeIndex); lastActiveIndex = activeIndex; };
    const render = () => {
      const realIndex = getIndexFromProxy();
      const activeIndex = mod(Math.round(realIndex), totalItems);
      items.forEach((item, index) => {
        item.setAttribute('data-radial-slider-item-status', index === activeIndex ? 'active' : 'inview');
        setRotation[index](nearestDelta(index, realIndex, totalItems) * rotateStep);
      });
      updateActiveUI(activeIndex % originalItems.length);
    };

    controls.forEach(btn => {
      btn.disabled = false;
      const value = btn.getAttribute('data-radial-slider-control');
      if (value === 'next' || value === 'prev') {
        btn.onclick = () => {
          gsap.killTweensOf(proxy);
          const targetIndex = Math.round(getIndexFromProxy()) + (value === 'next' ? 1 : -1);
          gsap.to(proxy, { rotation: -targetIndex * rotateStep, duration: slideDuration, ease: clickEase, onUpdate: render });
        };
      }
      if (/^\d+$/.test(value)) {
        const targetSlideNumber = Math.max(0, Math.min(originalItems.length - 1, parseInt(value, 10) - 1));
        btn.onclick = () => {
          gsap.killTweensOf(proxy);
          const currentIndex = getIndexFromProxy();
          const delta = nearestDeltaToSlideNumber(targetSlideNumber, currentIndex);
          gsap.to(proxy, { rotation: -(currentIndex + delta) * rotateStep, duration: slideDuration, ease: clickEase, onUpdate: render });
        };
      }
    });

    container._radialSliderDraggable = Draggable.create(proxy, {
      type: 'rotation', trigger: [proxy, ...items], inertia: true,
      throwResistance: 2000, dragResistance: 0.05, maxDuration: 1, minDuration: 0.5, edgeResistance: 0.75, overshootTolerance: 0,
      snap: value => Math.round(value / rotateStep) * rotateStep,
      onDrag: render, onThrowUpdate: render,
      onThrowComplete: () => { container.setAttribute('data-radial-slider-drag-status', 'grab'); render(); },
      onPress: () => container.setAttribute('data-radial-slider-drag-status', 'grabbing'),
      onDragStart: () => container.setAttribute('data-radial-slider-drag-status', 'grabbing'),
      onRelease: () => container.setAttribute('data-radial-slider-drag-status', 'grab')
    })[0];

    render();
  });

  if (initRadialCardsSlider._resize) window.removeEventListener('resize', initRadialCardsSlider._resize);
  initRadialCardsSlider._resize = debounceOnWidthChange(initRadialCardsSlider, 200);
  window.addEventListener('resize', initRadialCardsSlider._resize);
}


/* ==========================================================
   Osmo: Lightbox Setup (gsap.defaults bleibt global auf "osmo")
   ========================================================== */
function createLightbox(container, { onStart, onOpen, onClose, onCloseComplete } = {}) {
  const D = { ease: "power4.inOut", duration: 0.8 };
  const elements = {
    wrapper: container.querySelector('[data-lightbox="wrapper"]'),
    triggers: container.querySelectorAll('[data-lightbox="trigger"]'),
    triggerParents: container.querySelectorAll('[data-lightbox="trigger-parent"]'),
    items: container.querySelectorAll('[data-lightbox="item"]'),
    nav: container.querySelectorAll('[data-lightbox="nav"]'),
    counter: { current: container.querySelector('[data-lightbox="counter-current"]'), total: container.querySelector('[data-lightbox="counter-total"]') },
    buttons: { prev: container.querySelector('[data-lightbox="prev"]'), next: container.querySelector('[data-lightbox="next"]'), close: container.querySelector('[data-lightbox="close"]') }
  };
  const mainTimeline = gsap.timeline({ defaults: D });
  if (elements.counter.total) elements.counter.total.textContent = elements.triggers.length;

  function closeLightbox() {
    onClose?.();
    mainTimeline.clear();
    gsap.killTweensOf([elements.wrapper, elements.nav, elements.triggerParents, elements.items, container.querySelector('[data-lightbox="original"]')]);
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        elements.wrapper.classList.remove('is-active');
        elements.items.forEach(item => { item.classList.remove('is-active'); const li = item.querySelector('img'); if (li) li.style.display = ''; });
        const originalImg = container.querySelector('[data-lightbox="original"]');
        if (originalImg) gsap.set(originalImg, { clearProps: "all" });
        const originalParent = container.querySelector('[data-lightbox="original-parent"]');
        if (originalParent) originalParent.parentElement.style.removeProperty('height');
        onCloseComplete?.();
      }
    });
    const originalItem = container.querySelector('[data-lightbox="original"]');
    const originalParent = container.querySelector('[data-lightbox="original-parent"]');
    if (originalItem && originalParent) {
      gsap.set(originalItem, { clearProps: "all" });
      originalParent.appendChild(originalItem);
      originalParent.removeAttribute('data-lightbox');
      originalItem.removeAttribute('data-lightbox');
    }
    let activeLightboxSlide = container.querySelector('[data-lightbox="item"].is-active');
    tl.to(elements.triggerParents, { autoAlpha: 1, duration: 0.5, stagger: 0.03, overwrite: true })
      .to(elements.nav, { autoAlpha: 0, y: "1rem", duration: 0.4, stagger: 0 }, "<")
      .to(elements.wrapper, { backgroundColor: "rgba(0,0,0,0)", duration: 0.4 }, "<")
      .to(activeLightboxSlide, { autoAlpha: 0, duration: 0.4 }, "<")
      .set([elements.items, activeLightboxSlide, elements.triggerParents], { clearProps: "all" });
    mainTimeline.add(tl);
  }

  function handleOutsideClick(event) {
    if (event.detail === 0) return;
    const isOutside = !event.target.closest('[data-lightbox="item"].is-active img, [data-lightbox="nav"], [data-lightbox="close"], [data-lightbox="trigger"]');
    if (isOutside && elements.wrapper.classList.contains('is-active')) closeLightbox();
  }

  function updateActiveItem(index) {
    elements.items.forEach(item => item.classList.remove('is-active'));
    elements.items[index].classList.add('is-active');
    if (elements.counter.current) elements.counter.current.textContent = index + 1;
  }

  elements.triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => {
      onStart?.();
      mainTimeline.clear();
      gsap.killTweensOf([elements.wrapper, elements.nav, elements.triggerParents]);
      const img = trigger.querySelector("img");
      const state = Flip.getState(img);
      const triggerRect = trigger.getBoundingClientRect();
      trigger.parentElement.style.height = `${triggerRect.height}px`;
      trigger.setAttribute('data-lightbox', 'original-parent');
      img.setAttribute('data-lightbox', 'original');
      updateActiveItem(index);
      container.addEventListener('click', handleOutsideClick);
      const tl = gsap.timeline({ defaults: D, onComplete: () => { onOpen?.(); } });
      elements.wrapper.classList.add('is-active');
      const targetItem = elements.items[index];
      const lightboxImage = targetItem.querySelector('img');
      if (lightboxImage) lightboxImage.style.display = 'none';
      elements.triggerParents.forEach(otherTrigger => {
        if (otherTrigger !== trigger.parentElement) gsap.to(otherTrigger, { autoAlpha: 0, duration: 0.4, stagger: 0.02, overwrite: true });
      });
      if (!targetItem.contains(img)) {
        targetItem.appendChild(img);
        tl.add(Flip.from(state, { targets: img, absolute: true, duration: 0.6, ease: "power2.inOut" }), 0);
      }
      tl.to(elements.wrapper, { backgroundColor: "rgba(0,0,0,0.75)", duration: 0.6 }, 0)
        .fromTo(elements.nav, { autoAlpha: 0, y: "1rem" }, { autoAlpha: 1, y: "0rem", duration: 0.6, stagger: { each: 0.05, from: "center" } }, 0.2);
      mainTimeline.add(tl);
    });
  });

  if (elements.buttons.next) elements.buttons.next.addEventListener('click', () => {
    const currentIndex = Array.from(elements.items).findIndex(item => item.classList.contains('is-active'));
    updateActiveItem((currentIndex + 1) % elements.items.length);
  });
  if (elements.buttons.prev) elements.buttons.prev.addEventListener('click', () => {
    const currentIndex = Array.from(elements.items).findIndex(item => item.classList.contains('is-active'));
    updateActiveItem((currentIndex - 1 + elements.items.length) % elements.items.length);
  });
  if (elements.buttons.close) elements.buttons.close.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (event) => {
    if (!elements.wrapper.isConnected || !elements.wrapper.classList.contains('is-active')) return;
    switch (event.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowRight': elements.buttons.next?.click(); break;
      case 'ArrowLeft': elements.buttons.prev?.click(); break;
    }
  });
}
function buildLightboxMarkup(wrapper) {
  if (wrapper.querySelector('[data-lightbox="wrapper"]')) return;
  const imgs = [...wrapper.querySelectorAll('[data-lightbox="trigger"] img')];
  const items = imgs.map(i => `<div data-lightbox="item" class="lightbox-img__item"><img src="${i.currentSrc || i.src}" alt="${(i.alt || "").replace(/"/g, "&quot;")}" class="lightbox-img" loading="lazy"></div>`).join("");
  wrapper.insertAdjacentHTML("beforeend", `<div aria-modal="true" data-lightbox="wrapper" role="dialog" aria-label="Bildergalerie" class="lightbox-wrap"><div class="lightbox-img__wrap"><div class="lightbox-img__list">${items}</div></div><div class="lightbox-nav"><div data-lightbox="nav" class="lightbox-nav__col"><p class="lightbox-nav__text"><span data-lightbox="counter-current">1</span> / <span data-lightbox="counter-total">${imgs.length}</span></p></div><div data-lightbox="nav" class="lightbox-nav__col is-center"><button type="button" data-lightbox="prev" class="lightbox-nav__button"><div class="lightbox-nav__dot"></div><span class="lightbox-nav__text">zurück</span></button><button type="button" data-lightbox="next" class="lightbox-nav__button"><span class="lightbox-nav__text">weiter</span><div class="lightbox-nav__dot"></div></button></div><div data-lightbox="nav" class="lightbox-nav__col is-end"><button type="button" data-lightbox="close" class="lightbox-nav__button"><span class="lightbox-nav__text">schließen</span></button></div></div></div>`);
}
function initLightboxes() {
  nextPage.querySelectorAll("[data-gallery]").forEach(buildLightboxMarkup);
  nextPage.querySelectorAll("[data-gallery]").forEach(wrapper => createLightbox(wrapper, {
    onStart: () => lenis && lenis.stop(),
    onClose: () => lenis && lenis.start()
  }));
}


/* ==========================================================
   Osmo: Store Locator (Mapbox), ohne Token mit MapLibre + OpenFreeMap
   ========================================================== */
const MAPLIBRE = "https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/";
let __maplibre = null;
function loadMapLibre() {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (!__maplibre) __maplibre = new Promise((res, rej) => {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = MAPLIBRE + "maplibre-gl.css"; document.head.appendChild(l);
    const s = document.createElement("script"); s.src = MAPLIBRE + "maplibre-gl.js"; s.onload = () => res(window.maplibregl); s.onerror = rej; document.head.appendChild(s);
  });
  return __maplibre;
}

function initStoreLocator() {
  const wrapper = nextPage.querySelector("[data-locator-init]");
  if (!wrapper || wrapper.dataset.locatorInit) return;
  wrapper.dataset.locatorInit = "pending";
  const token = window.CLASSIK_MAPBOX_TOKEN;
  const boot = () => {
    if (typeof mapboxgl !== "undefined" && token) { mapboxgl.accessToken = token; return initStoreLocatorMap(wrapper, mapboxgl, "mapbox://styles/osmo-supply/cmrw4migt00i501scfi19f0pn"); }
    loadMapLibre().then(gl => initStoreLocatorMap(wrapper, gl, "https://tiles.openfreemap.org/styles/positron")).catch(() => { wrapper.dataset.locatorInit = ""; });
  };
  // Karte erst laden, wenn der Hotelfinder in die Nähe kommt
  const io = new IntersectionObserver((entries) => { if (entries.some(e => e.isIntersecting)) { io.disconnect(); boot(); } }, { rootMargin: "800px 0px" });
  io.observe(wrapper);
}

function locatorReadLocations(wrapper) {
  return Array.from(wrapper.querySelectorAll("[data-locator-item]")).map((element, index) => {
    const lat = Number.parseFloat(element.getAttribute("data-locator-lat"));
    const lng = Number.parseFloat(element.getAttribute("data-locator-lng"));
    const n = element.querySelector("[data-locator-item-name]");
    const eb = element.querySelector(".store-locator__item-eyebrow");
    const img = element.querySelector("img");
    const link = element.querySelector('.store-locator__item-link a[href^="/"]');
    return { id: element.getAttribute("data-locator-id") || `location-${index + 1}`, name: n ? n.textContent.trim() : `Location ${index + 1}`, nameHTML: n ? n.innerHTML : "", eyebrow: eb ? eb.textContent.trim() : "", img: img ? (img.currentSrc || img.src) : "", alt: img ? img.alt : "", href: link ? link.getAttribute("href") : "", lat, lng, element };
  }).filter(l => Number.isFinite(l.lat) && Number.isFinite(l.lng));
}
function locatorPinEl(wrapper, location) {
  const template = wrapper.querySelector("[data-locator-marker-template]");
  let element;
  if (template) { element = template.cloneNode(true); element.removeAttribute("data-locator-marker-template"); }
  else { element = document.createElement("button"); element.type = "button"; element.className = "locator-marker"; }
  element.setAttribute("data-locator-marker", location.id);
  element.setAttribute("data-active", "false");
  element.setAttribute("aria-label", `${location.name} anzeigen`);
  element.setAttribute("aria-pressed", "false");
  if (!element.matches("button, a, input")) { element.setAttribute("role", "button"); element.setAttribute("tabindex", "0"); }
  return element;
}
function locatorWire(locations, pins, select) {
  locations.forEach((location, index) => {
    location.element.addEventListener("click", (event) => { if (event.target.closest("a, button, input, select, textarea")) return; select(index); });
    location.element.addEventListener("keydown", (event) => { if (event.target !== location.element) return; if (event.key !== "Enter" && event.key !== " ") return; event.preventDefault(); select(index); });
  });
  pins.forEach((pin, index) => {
    pin.element.addEventListener("click", (e) => { e.stopPropagation(); select(index); });
    pin.element.addEventListener("keydown", (event) => { if (event.key !== "Enter" && event.key !== " ") return; event.preventDefault(); select(index); });
  });
}
function locatorSetActive(locations, pins, index) {
  pins.forEach((pin, i) => { const a = i === index; pin.element.setAttribute("data-active", String(a)); pin.element.setAttribute("aria-pressed", String(a)); locations[i].element.setAttribute("data-active", String(a)); });
}
function locatorCard(l) {
  const el = document.createElement("div"); el.className = "locator-card";
  el.innerHTML = (l.img ? `<div class="locator-card__media"><img src="${l.img}" alt="${l.alt.replace(/"/g, "&quot;")}" loading="lazy"></div>` : "") +
    `<div class="locator-card__body"><p class="locator-card__eyebrow">${l.eyebrow}</p><p class="locator-card__name">${l.nameHTML}</p>` +
    (l.href ? `<a class="locator-card__link has-arrow" href="${l.href}">Zum Hotel <span class="link-arrow" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg><svg viewBox="0 0 16 16"><path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></span></a>` : "") + `</div>`;
  return el;
}
// Ruhige Farben passend zum Ivory-Look der Seite (nur für OpenFreeMap)
function locatorTint(map) {
  (map.getStyle().layers || []).forEach(ly => {
    try {
      if (ly.type === "background") map.setPaintProperty(ly.id, "background-color", "#F3EFE7");
      else if (ly.type === "fill" && /water/.test(ly.id)) map.setPaintProperty(ly.id, "fill-color", "#D9E2DF");
      else if (ly.type === "fill" && /park|wood|grass|landcover/.test(ly.id)) map.setPaintProperty(ly.id, "fill-color", "#E6E6D8");
      else if (ly.type === "line" && /boundary/.test(ly.id)) map.setPaintProperty(ly.id, "line-color", "#B9B1A3");
      else if (ly.type === "symbol" && /state|country/.test(ly.id)) map.setLayoutProperty(ly.id, "visibility", "none");
      else if (ly.type === "symbol" && ly.layout && ly.layout["text-field"]) map.setLayoutProperty(ly.id, "text-field", ["coalesce", ["get", "name:de"], ["get", "name"]]);
    } catch (e) {}
  });
}

function initStoreLocatorMap(wrapper, gl, style) {
  const cfg = { projection: "mercator", fallbackCenter: [10.4, 51.1], fallbackZoom: 5, selectedZoom: 14, flyToDuration: 1200, fitPadding: 64, fitMaxZoom: 13 };
  const mapEl = wrapper.querySelector("[data-locator-map]");
  const locations = locatorReadLocations(wrapper);
  const isMapbox = gl === window.mapboxgl;
  const opts = { container: mapEl, style, center: cfg.fallbackCenter, zoom: cfg.fallbackZoom, pitch: 0, bearing: 0, attributionControl: false, cooperativeGestures: true };
  if (isMapbox) opts.projection = cfg.projection;
  else opts.locale = { "CooperativeGesturesHandler.WindowsHelpText": "Strg + Scrollen zum Zoomen", "CooperativeGesturesHandler.MacHelpText": "⌘ + Scrollen zum Zoomen", "CooperativeGesturesHandler.MobileHelpText": "Mit zwei Fingern bewegen" };
  const map = new gl.Map(opts);
  map.addControl(new gl.AttributionControl({ compact: true }));
  map.addControl(new gl.NavigationControl({ showCompass: false }), "top-left");
  map.on("load", () => {
    if (!isMapbox) locatorTint(map);
    // Nahe beieinander liegende Hotels (Berlin) leicht versetzen, damit beide Pins sichtbar sind
    const offs = locations.map((l, i) => { const n = locations.findIndex((o, j) => j !== i && Math.abs(o.lat - l.lat) < .05 && Math.abs(o.lng - l.lng) < .05); return n < 0 ? [0, 0] : [i < n ? -15 : 15, 0]; });
    const pins = locations.map((location, i) => { const element = locatorPinEl(wrapper, location); const marker = new gl.Marker({ element, anchor: "center", offset: offs[i] }).setLngLat([location.lng, location.lat]).addTo(map); return { marker, element, location }; });
    const bounds = new gl.LngLatBounds(); locations.forEach(l => bounds.extend([l.lng, l.lat]));
    let quiet = false;
    const popup = new gl.Popup({ closeButton: true, closeOnClick: true, offset: 30, maxWidth: "17.5rem", className: "locator-popup", focusAfterOpen: false });
    const select = (index) => {
      const location = locations[index]; if (!location) return;
      if (popup.isOpen()) { quiet = true; popup.remove(); quiet = false; }
      locatorSetActive(locations, pins, index);
      popup.setLngLat([location.lng, location.lat]).setDOMContent(locatorCard(location)).addTo(map);
      const camera = { center: [location.lng, location.lat], zoom: cfg.selectedZoom, pitch: 0, bearing: 0, offset: [0, 90] };
      reducedMotion ? map.jumpTo(camera) : map.flyTo({ ...camera, duration: cfg.flyToDuration, essential: false });
    };
    locatorWire(locations, pins, select);
    // Popup schließen: zurück zur Gesamtansicht aller Hotels
    popup.on("close", () => {
      if (quiet) return;
      locatorSetActive(locations, pins, -1);
      map.fitBounds(bounds, { padding: cfg.fitPadding, maxZoom: cfg.fitMaxZoom, duration: reducedMotion ? 0 : 1200 });
    });

    map.fitBounds(bounds, { padding: cfg.fitPadding, maxZoom: cfg.fitMaxZoom, duration: reducedMotion ? 0 : 700 });
    wrapper.dataset.locatorInit = "initialized";
  });
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => map.resize(), 150); }, { passive: true });
}
