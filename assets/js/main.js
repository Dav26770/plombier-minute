/* =========================================================================
   PLOMBIER MINUTE — main.js (vanilla, no deps)
   Direction "Sobre & Classe" : menu mobile · header au scroll ·
   sticky call bar · scroll-reveal en fondu doux · compteurs · chrono.
   Aucun effet néon / kinétique / halo. Respecte prefers-reduced-motion.
   ========================================================================= */
(function () {
  "use strict";

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Année ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = "2026"; });

  /* ---------- État header au scroll + sticky call bar ---------- */
  var header = $(".site-header");
  var callbar = $(".callbar");
  function onScrollState() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (callbar) callbar.classList.toggle("show", y > 420);
  }
  onScrollState();

  /* ---------- Menu mobile ---------- */
  var toggle = $(".nav-toggle");
  var menu = $(".mobile-menu");
  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add("open"); });
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    window.setTimeout(function () { menu.hidden = true; }, 620);
  }
  if (toggle) toggle.addEventListener("click", function () {
    if (toggle.getAttribute("aria-expanded") === "true") closeMenu(); else openMenu();
  });
  if (menu) {
    $$("[data-close], .backdrop, .mobile-menu nav a", menu).forEach(function (el) {
      el.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu && menu.classList.contains("open")) closeMenu();
  });

  /* ---------- Scroll reveal (fondu doux) ---------- */
  var revealEls = $$(".reveal, .reveal-zoom, .reveal-left");
  if (REDUCED || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in-view");
          io.unobserve(en.target);
          if (en.target.hasAttribute("data-count-root")) startCounters(en.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Compteurs animés ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-decimals") | 0);
    var dur = 1600;
    if (REDUCED) { el.textContent = target.toFixed(decimals).replace(".", ","); return; }
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = val.toFixed(decimals).replace(".", ",");
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals).replace(".", ",");
    }
    requestAnimationFrame(frame);
  }
  function startCounters(root) {
    $$("[data-count]", root).forEach(function (el) {
      if (!el.dataset.done) { el.dataset.done = "1"; animateCount(el); }
    });
  }
  // Fallback : compteurs hors d'un bloc reveal
  if (REDUCED || !("IntersectionObserver" in window)) {
    $$("[data-count]").forEach(function (el) { if (!el.dataset.done) { el.dataset.done = "1"; animateCount(el); } });
  } else {
    var ioCount = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !en.target.dataset.done) {
          en.target.dataset.done = "1"; animateCount(en.target); ioCount.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    $$("[data-count]").forEach(function (el) { ioCount.observe(el); });
  }

  /* ---------- Signature : compteur "minute" du chrono ---------- */
  var chronoNum = $("[data-chrono]");
  function runChrono() {
    if (!chronoNum) return;
    if (REDUCED) { chronoNum.textContent = "30"; return; }
    var to = parseInt(chronoNum.getAttribute("data-chrono"), 10) || 30;
    var n = 0, start = null, dur = 1600;
    function f(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      n = Math.round(to * (1 - Math.pow(1 - p, 3)));
      chronoNum.textContent = ("0" + n).slice(-2);
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  runChrono();

  /* ---------- Parallax hero très doux (rAF) ---------- */
  var heroImg = $(".hero__media img");
  var heroTicking = false;
  function parallax() {
    if (!heroImg) return;
    var y = window.pageYOffset || 0;
    heroImg.style.transform = "translate3d(0," + (y * 0.10) + "px,0)";
    heroTicking = false;
  }

  /* ---------- Filets cuivre lents et discrets (remplace les streaks) ---------- */
  var streakWrap = $(".streaks");
  function spawnStreak() {
    if (!streakWrap || REDUCED || document.hidden) return;
    var i = document.createElement("i");
    var top = Math.random() * 100;
    var dur = 2600 + Math.random() * 1800;
    i.style.top = top + "%";
    i.style.left = "-160px";
    i.style.opacity = (0.14 + Math.random() * 0.18).toFixed(2);
    i.style.width = (110 + Math.random() * 120) + "px";
    streakWrap.appendChild(i);
    var startX = -160, endX = window.innerWidth + 60, t0 = null;
    function move(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      i.style.transform = "translateX(" + (startX + (endX - startX) * p) + "px)";
      if (p < 1) requestAnimationFrame(move);
      else i.remove();
    }
    requestAnimationFrame(move);
  }
  if (streakWrap && !REDUCED) {
    window.setInterval(spawnStreak, 4200);
    spawnStreak();
  }

  /* ---------- Écouteur de scroll (consolidé) ---------- */
  window.addEventListener("scroll", function () {
    onScrollState();
    if (!REDUCED && heroImg && !heroTicking) { heroTicking = true; requestAnimationFrame(parallax); }
  }, { passive: true });

})();
