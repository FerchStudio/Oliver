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
  // Buchungsleisten: Hotel, Daten und Gäste an Guestline übergeben (funktioniert auch vor app.js und nach Seitenwechseln)
  function bookUrl(f) {
    var iso = function (d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
    var h = f.querySelector("[data-book-hotel]"), i = f.querySelector("[data-book-in]"), o = f.querySelector("[data-book-out]");
    var t = new Date(), arr = (i && i.value) || iso(t); t = new Date(arr); t.setDate(t.getDate() + 1);
    var dep = (o && o.value > arr) ? o.value : iso(t);
    var q = (h && h.value ? "hotel=" + h.value + "&" : "") + "lng=de&arrival=" + arr + "&departure=" + dep;
    return "https://booking.eu.guestline.app/CHC?" + q;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-book-go], .sticky-book_btn"); if (!a) return;
    // Mobile Sticky-Button nutzt die Buchungsleiste der aktuellen Seite (vorausgewähltes Hotel, Daten)
    var f = a.closest("[data-book]") || document.querySelector("[data-barba='container'] [data-book]"); if (!f) return;
    e.preventDefault(); e.stopPropagation();
    window.open(bookUrl(f), "_blank", "noopener");
  }, true);


  // ---------- Kalender (Zeitraum-Auswahl) für alle Buchungsleisten ----------
  var MON = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  var MON_S = ["Jan.","Feb.","März","Apr.","Mai","Juni","Juli","Aug.","Sept.","Okt.","Nov.","Dez."];
  var WD = ["So","Mo","Di","Mi","Do","Fr","Sa"];
  function isoD(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function parseD(v) { var a = (v || "").split("-"); return a.length === 3 ? new Date(+a[0], a[1] - 1, +a[2]) : null; }
  function fmt(v) { var d = parseD(v); return d ? WD[d.getDay()] + ", " + d.getDate() + ". " + MON_S[d.getMonth()] : "Datum wählen"; }
  function nights(a, b) { var x = parseD(a), y = parseD(b); return x && y ? Math.round((y - x) / 864e5) : 0; }
  function bookRender(f) {
    if (!f) return;
    ["in", "out"].forEach(function (k) {
      var inp = f.querySelector("[data-book-" + k + "]"), sh = f.querySelector("[data-book-show='" + k + "']");
      if (inp && sh) sh.textContent = fmt(inp.value);
    });
  }
  window.__bookRender = bookRender;
  document.addEventListener("change", function (e) { var f = e.target.closest && e.target.closest("[data-book]"); if (f) bookRender(f); }, true);

  var cal = null, calForm = null, calStep = "in", calView = null, calA = "", calB = "", calHover = "";
  function calClose() { root.classList.remove("cal-open"); if (cal) { cal.remove(); cal = null; } if (calForm) calForm.classList.remove("is-picking"); calForm = null; document.removeEventListener("keydown", calKey); }
  function calKey(e) { if (e.key === "Escape") calClose(); }
  function setVal(f, k, v) { var inp = f.querySelector("[data-book-" + k + "]"); if (inp && inp.value !== v) { inp.value = v; inp.dispatchEvent(new Event("change", { bubbles: true })); } }
  function calApply() {
    if (!calForm) return;
    if (calA) setVal(calForm, "in", calA);
    if (calB) setVal(calForm, "out", calB);
    bookRender(calForm); calClose();
  }
  function calDraw() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var months = innerWidth < 768 ? 1 : 2, html = "";
    html += '<div class="cal_head"><div class="cal_steps"><span class="cal_step' + (calStep === "in" ? " is-active" : "") + '">Anreise<b>' + (calA ? fmt(calA) : "–") + '</b></span><span class="cal_step' + (calStep === "out" ? " is-active" : "") + '">Abreise<b>' + (calB ? fmt(calB) : "–") + '</b></span></div>';
    html += '<div class="cal_nav"><button type="button" class="cal_arrow" data-cal-nav="-1" aria-label="Vorheriger Monat"' + (calView.getFullYear() === today.getFullYear() && calView.getMonth() === today.getMonth() ? " disabled" : "") + '><svg viewBox="0 0 16 16"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button><button type="button" class="cal_arrow" data-cal-nav="1" aria-label="Nächster Monat"><svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></button></div></div><div class="cal_months">';
    var endPrev = calB || (calStep === "out" && calA && calHover > calA ? calHover : "");
    for (var m = 0; m < months; m++) {
      var first = new Date(calView.getFullYear(), calView.getMonth() + m, 1), dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate(), lead = (first.getDay() + 6) % 7;
      html += '<div class="cal_month"><p class="cal_title">' + MON[first.getMonth()] + " " + first.getFullYear() + '</p><div class="cal_grid"><span class="cal_wd">Mo</span><span class="cal_wd">Di</span><span class="cal_wd">Mi</span><span class="cal_wd">Do</span><span class="cal_wd">Fr</span><span class="cal_wd">Sa</span><span class="cal_wd">So</span>';
      for (var b = 0; b < lead; b++) html += "<span></span>";
      for (var d = 1; d <= dim; d++) {
        var dt = new Date(first.getFullYear(), first.getMonth(), d), v = isoD(dt), cls = "cal_day";
        var past = dt < today;
        if (past) cls += " is-past";
        if (+dt === +today) cls += " is-today";
        if (v === calA) cls += " is-start";
        if (v === endPrev) cls += " is-end";
        if (calA && endPrev && v > calA && v < endPrev) cls += " is-range";
        if (calA && endPrev && (v === calA || v === endPrev)) cls += " has-range";
        html += '<button type="button" class="' + cls + '" data-cal-day="' + v + '"' + (past ? " disabled" : "") + ' aria-label="' + d + ". " + MON[dt.getMonth()] + " " + dt.getFullYear() + '">' + d + "</button>";
      }
      html += "</div></div>";
    }
    var n = nights(calA, calB);
    html += '</div><div class="cal_foot"><p class="cal_info">' + (calA && calB ? n + (n === 1 ? " Nacht" : " Nächte") : (calStep === "in" ? "Anreisetag wählen" : "Abreisetag wählen")) + '</p><div class="cal_actions"><button type="button" class="cal_reset" data-cal-reset>Zurücksetzen</button><button type="button" class="cal_ok" data-cal-ok' + (calA && calB ? "" : " disabled") + '>Übernehmen</button></div></div>';
    cal.innerHTML = html;
  }
  function calOpen(f, step, field) {
    calClose();
    calForm = f; calStep = step;
    calA = (f.querySelector("[data-book-in]") || {}).value || ""; calB = (f.querySelector("[data-book-out]") || {}).value || "";
    if (step === "in") { calB = calB; }
    var base = parseD(step === "out" && calB ? calB : calA) || new Date();
    calView = new Date(base.getFullYear(), base.getMonth(), 1);
    var today = new Date(); if (calView < new Date(today.getFullYear(), today.getMonth(), 1)) calView = new Date(today.getFullYear(), today.getMonth(), 1);
    cal = document.createElement("div"); cal.className = "cal"; cal.setAttribute("role", "dialog"); cal.setAttribute("aria-label", "Reisezeitraum wählen");
    var sheet = innerWidth < 768;
    f.classList.add("is-picking"); if (sheet) { cal.classList.add("is-sheet"); document.body.appendChild(cal); root.classList.add("cal-open"); } else f.appendChild(cal);
    calDraw();
    if (sheet) { document.addEventListener("keydown", calKey); requestAnimationFrame(function () { cal && cal.classList.add("is-open"); }); return; }
    // Position: an der Leiste, nach oben öffnen wenn unten zu wenig Platz ist
    var fr = f.getBoundingClientRect(), r = field.getBoundingClientRect(), h = cal.offsetHeight, w = cal.offsetWidth;
    var up = fr.bottom + h + 16 > innerHeight && fr.top - h - 16 > 0;
    cal.classList.toggle("is-up", up);
    var left = Math.max(0, Math.min(r.left - fr.left, fr.width - w));
    cal.style.left = left + "px";
    document.addEventListener("keydown", calKey);
    requestAnimationFrame(function () { cal && cal.classList.add("is-open"); });
  }
  document.addEventListener("click", function (e) {
    var t = e.target;
    var pick = t.closest && t.closest("[data-book-pick]");
    if (pick) { e.preventDefault(); var f = pick.closest("[data-book]"); if (cal && calForm === f && calStep === pick.dataset.bookPick) return calClose(); calOpen(f, pick.dataset.bookPick, pick.closest(".book_field") || pick); return; }
    if (!cal) return;
    if (!cal.contains(t)) return calClose();
    var day = t.closest("[data-cal-day]"), nav = t.closest("[data-cal-nav]");
    if (nav) { calView = new Date(calView.getFullYear(), calView.getMonth() + +nav.dataset.calNav, 1); calDraw(); return; }
    if (t.closest("[data-cal-reset]")) { calA = ""; calB = ""; calStep = "in"; calDraw(); return; }
    if (t.closest("[data-cal-ok]")) return calApply();
    if (day) {
      var v = day.dataset.calDay;
      if (calStep === "in" || !calA || v <= calA) { calA = v; calB = ""; calStep = "out"; calDraw(); }
      else { calB = v; calDraw(); setTimeout(calApply, 260); }
    }
  });
  document.addEventListener("mouseover", function (e) {
    if (!cal || calStep !== "out" || !calA) return;
    var day = e.target.closest && e.target.closest("[data-cal-day]"); if (!day || !cal.contains(day)) return;
    if (calHover !== day.dataset.calDay) { calHover = day.dataset.calDay; cal.querySelectorAll(".cal_day").forEach(function (b) { var v = b.dataset.calDay; b.classList.toggle("is-range", v > calA && v < calHover); b.classList.toggle("is-end", v === calHover && v > calA); b.classList.toggle("has-range", v > calA && v === calHover || (v === calA && calHover > calA)); }); }
  });
  addEventListener("resize", function () { if (cal) calClose(); });

  // ---------- Crisp-Intro (Startseite, einmal pro Sitzung) ----------
  function crispIntro() {
    var hero = document.querySelector(".hero");
    if (!root.classList.contains("is-intro") || !hero) { root.classList.remove("is-intro"); return; }
    try { sessionStorage.setItem("chc-intro", "1"); } catch (e) {}
    var full = hero.querySelector(".img-slide img");
    var slides = [].slice.call(hero.querySelectorAll(".img-slider__thumb img")).map(function (i) { return i.getAttribute("src"); });
    if (slides.length < 5 || !full) { root.classList.remove("is-intro"); return; }
    // Reihenfolge so, dass das aktuelle Hero-Bild (Slide 1) in der Mitte landet; kleine Vorschaubilder laden sofort
    var order = [slides[3], slides[4], slides[0], slides[1], slides[2]];
    var title = hero.querySelector(".hero_title");
    if (title && !title.querySelector(".cw")) {
      var nodes = [].slice.call(title.childNodes), out = [], idx = 0;
      nodes.forEach(function (n) {
        if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) out.push(document.createTextNode(part));
          else { var w = document.createElement("span"); w.className = "cw"; var i = document.createElement("span"); i.className = "cw-i"; i.style.setProperty("--i", idx++); i.textContent = part; w.appendChild(i); out.push(w); }
        });
        else if (out.length && out[out.length - 1].className === "cw") out[out.length - 1].firstChild.appendChild(n); else out.push(n);
      });
      title.textContent = ""; out.forEach(function (n) { title.appendChild(n); });
      title.style.visibility = "visible";
    }
    var L = document.createElement("div"); L.className = "crisp"; L.setAttribute("aria-hidden", "true");
    order.forEach(function (src, i) { var t = document.createElement("div"); t.className = "crisp_tile" + (i === 2 ? " is-center" : ""); t.style.setProperty("--o", i - 2); var im = document.createElement("img"); im.src = src; im.alt = ""; im.decoding = "async"; t.appendChild(im); L.appendChild(t); });
    hero.appendChild(L);
    root.classList.add("intro-run");
    var center = L.querySelector(".is-center img");
    var loaded = function (img, ms) { return new Promise(function (res) { if (img.complete && img.naturalWidth) return res(); img.addEventListener("load", res, { once: true }); img.addEventListener("error", res, { once: true }); setTimeout(res, ms); }); };
    loaded(center, 700).then(function () {
      requestAnimationFrame(function () { L.classList.add("is-in"); });   // Bilder fahren von rechts herein
      return Promise.all([new Promise(function (r) { setTimeout(r, 1500); }), loaded(full, 2500)]);
    }).then(function () {
      center.src = full.currentSrc || full.src;                         // großes Hero-Bild für den Vollbild-Übergang
      L.classList.add("is-focus");                                      // Seitenbilder schrumpfen, Mitte wächst auf Vollbild
      setTimeout(function () {
        root.classList.add("intro-reveal"); root.classList.remove("is-intro"); root.classList.remove("intro-run");
        setTimeout(function () { L.remove(); }, 80);
        setTimeout(function () { root.classList.remove("intro-reveal"); }, 2600);
      }, 1400);
    });
  }

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
    bookRender(f);
  });
  crispIntro();
  // Bilder: "sizes" an die tatsächliche Darstellungsbreite anpassen (Webflow setzt oft 100vw), spart Datenvolumen
  [].slice.call(document.querySelectorAll('img[loading="lazy"][srcset]')).forEach(function (img) {
    var w = img.getBoundingClientRect().width;
    if (w > 0 && w < innerWidth * 0.75) img.sizes = Math.ceil(w) + "px";
  });
  // Barrierefreiheit: Slider-Punkte ohne Text bekommen ein Label
  [].slice.call(document.querySelectorAll(".radial-gsap-slider__control-dot")).forEach(function (a, i) { if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", "Zimmer " + (i + 1) + " anzeigen"); });
  // Kontaktformular: deutsche Platzhalter (Webflow setzt sonst "Example text")
  var ph = { "k-vorname": "Max", "k-nachname": "Mustermann", "k-firma": "Optional", "k-email": "name@beispiel.de", "k-msg": "Wie können wir Ihnen helfen?" };
  Object.keys(ph).forEach(function (id) { var el = document.getElementById(id); if (el) el.placeholder = ph[id]; });
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
