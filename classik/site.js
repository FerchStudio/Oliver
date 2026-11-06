/* Classik Hotel Collection | Konzept | Ferch Studio
   Lädt GSAP, Barba, Lenis und die Osmo-Module erst nach der ersten Interaktion
   (oder spätestens nach 6 s), damit der erste Seitenaufbau schlank bleibt. */
(function () {
  var me = document.currentScript && document.currentScript.src;
  var base = window.CLASSIK_BASE = me ? me.replace(/[^\/]*$/, "") : "";
  var cdn = "https://cdn.jsdelivr.net/npm/";
  var g = cdn + "gsap@3.13.0/dist/";
  var libs = [
    cdn + "@barba/core@2.10.3/dist/barba.umd.min.js",
    g + "gsap.min.js", g + "CustomEase.min.js", g + "ScrollTrigger.min.js", g + "SplitText.min.js",
    g + "Observer.min.js", g + "Draggable.min.js", g + "InertiaPlugin.min.js", g + "Flip.min.js"
  ];
  var needsGeo = document.querySelector("[data-globe-init],[data-locator-init]");
  if (needsGeo) libs.push(cdn + "d3-array@3.2.4/dist/d3-array.min.js", cdn + "d3-geo@3.1.1/dist/d3-geo.min.js", cdn + "topojson-client@3.1.0/dist/topojson-client.min.js");
  if (window.CLASSIK_MAPBOX_TOKEN && needsGeo) libs.push("https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js");
  libs.push(cdn + "lenis@1.3.4/dist/lenis.min.js", base + "app.js");
  document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest('a[href="#"]'); if (a) e.preventDefault(); });

  // Mega-Menüs sofort bedienbar (Hover öffnet, kurze Verzögerung beim Schließen)
  var root = document.documentElement, fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var btns = [].slice.call(document.querySelectorAll("[data-mega-toggle]")), header = document.querySelector("[data-nav]"), closeT = null, openT = null;
  function cur() { var c = null; btns.forEach(function (b) { if (root.classList.contains("mega-" + b.dataset.megaToggle)) c = b.dataset.megaToggle; }); return c; }
  function setMega(name) {
    clearTimeout(closeT); clearTimeout(openT);
    root.classList.toggle("mega-open", !!name);
    btns.forEach(function (b) { var n = b.dataset.megaToggle; root.classList.toggle("mega-" + n, n === name); b.setAttribute("aria-expanded", n === name); });
  }
  window.__chcMega = setMega;
  [].slice.call(document.querySelectorAll(".mega")).forEach(function (m) { [].slice.call(m.querySelectorAll(".mega_col, .mega_inner > *")).forEach(function (c, i) { c.style.setProperty("--i", i); }); });
  btns.forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); setMega(cur() === b.dataset.megaToggle ? null : b.dataset.megaToggle); });
    if (fine) b.addEventListener("mouseenter", function () { clearTimeout(closeT); var n = b.dataset.megaToggle; openT = setTimeout(function () { setMega(n); }, cur() ? 0 : 60); });
  });
  if (fine && header) {
    header.addEventListener("mouseleave", function () { clearTimeout(openT); closeT = setTimeout(function () { setMega(null); }, 220); });
    header.addEventListener("mouseenter", function () { clearTimeout(closeT); });
    [].slice.call(header.querySelectorAll(".nav_links > a:not([data-mega-toggle]), .nav_right a")).forEach(function (a) { a.addEventListener("mouseenter", function () { clearTimeout(openT); closeT = setTimeout(function () { setMega(null); }, 120); }); });
  }

  // Buchungsleiste sofort mit Datum und 1 Erwachsener füllen
  [].slice.call(document.querySelectorAll("[data-book]")).forEach(function (f) {
    var iso = function (d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
    var a = f.querySelector("[data-book-in]"), b = f.querySelector("[data-book-out]"), n = f.querySelector("[data-book-adults]");
    var t = new Date(); if (a && !a.value) { a.value = iso(t); a.min = iso(t); }
    if (b && !b.value) { t.setDate(t.getDate() + 1); b.value = iso(t); }
    if (n) { n.textContent = "1"; if (n.nextSibling && n.nextSibling.nodeType === 3) n.nextSibling.textContent = " Erwachsener"; }
  });
  // Lage-Grafik: Positionen ohne Wartezeit setzen
  [].slice.call(document.querySelectorAll("[data-lage] [data-x]")).forEach(function (s) { s.style.setProperty("--x", s.getAttribute("data-x") + "%"); });
  var started = false, evs = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel", "scroll"];
  function start() {
    if (started) return; started = true;
    evs.forEach(function (e) { removeEventListener(e, start, { passive: true }); });
    if (window.CLASSIK_MAPBOX_TOKEN && needsGeo) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.css"; document.head.appendChild(l); }
    libs.forEach(function (src) { var s = document.createElement("script"); s.src = src; s.async = false; document.body.appendChild(s); });
  }
  evs.forEach(function (e) { addEventListener(e, start, { passive: true }); });
  addEventListener("load", function () { setTimeout(start, 6000); });
})();
