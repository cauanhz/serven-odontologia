/* ============================================================
   SERVEN — interactions
   ============================================================ */
(function () {
  "use strict";

  var WHATSAPP = "553134513450";

  /* ---------- nav scroll state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu (simple anchor jump) ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var t = document.getElementById("agendar");
      if (t) t.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1800;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.floor(eased * target);
      el.textContent = val.toLocaleString("pt-BR") + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("pt-BR") + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) { animateCount(el); });
  }

  /* ---------- gold particles ---------- */
  var canvas = document.getElementById("particles");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ctx = canvas.getContext("2d");
    var parts = [];
    var w, h, dpr;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function makeParts() {
      var n = Math.round((w * h) / 16000);
      n = Math.max(36, Math.min(n, 130));
      parts = [];
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.9 + 0.4,
          sp: Math.random() * 0.34 + 0.06,
          drift: (Math.random() - 0.5) * 0.3,
          tw: Math.random() * Math.PI * 2,
          tws: Math.random() * 0.03 + 0.008,
          base: Math.random() * 0.5 + 0.25
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.sp;
        p.x += p.drift;
        p.tw += p.tws;
        if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;
        var alpha = p.base + Math.sin(p.tw) * 0.35;
        if (alpha < 0) alpha = 0;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, "rgba(255,230,150," + alpha + ")");
        g.addColorStop(1, "rgba(255,230,150,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,240,200," + Math.min(alpha + 0.2, 1) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    resize(); makeParts(); draw();
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); makeParts(); }, 200);
    });
  }

  /* ---------- booking form → whatsapp ---------- */
  var form = document.getElementById("booking-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var nome = (document.getElementById("f-nome").value || "").trim();
      var fone = (document.getElementById("f-fone").value || "").trim();
      var trat = document.getElementById("f-trat").value || "";

      // light validation
      var ok = true;
      [["f-nome", nome], ["f-fone", fone]].forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        if (!pair[1]) { el.style.borderColor = "#e08a8a"; ok = false; }
        else { el.style.borderColor = ""; }
      });
      if (!ok) return;

      var tratTxt = trat ? trat : "uma avaliação";
      var msg = "Olá, Serven Odontologia! 😊\n\n" +
        "Meu nome é " + nome + "." +
        (fone ? "\nMeu WhatsApp: " + fone + "." : "") +
        "\nTenho interesse em: " + tratTxt + "." +
        "\n\nGostaria de agendar minha avaliação gratuita.";

      var url = "https://api.whatsapp.com/send?phone=" + WHATSAPP +
        "&text=" + encodeURIComponent(msg);
      window.open(url, "_blank");
    });
  }

  /* ---------- generic whatsapp links with treatment context ---------- */
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.addEventListener("click", function (ev) {
      ev.preventDefault();
      var ctx = el.getAttribute("data-wa") || "agendar minha avaliação gratuita";
      var msg = "Olá, Serven Odontologia! Gostaria de " + ctx + ".";
      window.open("https://api.whatsapp.com/send?phone=" + WHATSAPP +
        "&text=" + encodeURIComponent(msg), "_blank");
    });
  });
})();
