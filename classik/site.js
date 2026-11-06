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
