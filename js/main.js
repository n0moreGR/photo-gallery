(function () {
  "use strict";

  /* ---------- Works list (add / reorder photos here) ---------- */
  const WORKS = [
    { id: "01", year: "2026" },
    { id: "02", year: "2026" },
    { id: "03", year: "2026" },
    { id: "04", year: "2026" },
    { id: "05", year: "2026" },
    { id: "06", year: "2026" },
    { id: "07", year: "2026" },
    { id: "08", year: "2026" }
  ];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= I18N ================= */
  const STORAGE_KEY = "olena-lang";
  let lang = "en";

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) ?? I18N.en[key] ?? key;
  }

  function getInitialLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && I18N[saved]) return saved;
    } catch (e) {}
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("uk") || nav.startsWith("ru") ? "uk" : "en";
  }

  function applyLang(next) {
    lang = I18N[next] ? next : "en";
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$("[data-i18n-alt]").forEach(el => { el.alt = t(el.dataset.i18nAlt); });
    $$(".lang__btn").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    document.title = lang === "uk"
      ? "Олена — Предметна зйомка та ретуш"
      : "Olena — Product Photography & Retouch";
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    if (lb.open) updateLightbox();
  }

  /* ================= GRID ================= */
  function renderGrid() {
    const grid = $("#grid");
    grid.innerHTML = WORKS.map((w, i) => `
      <figure class="card w${i + 1} reveal">
        <button type="button" class="card__btn" data-index="${i}">
          <span class="card__img">
            <img src="images/thumb/${w.id}.jpg" alt="" data-i18n-alt="w${w.id}.t" loading="lazy" decoding="async">
            <span class="card__view mono" data-i18n="view">View</span>
          </span>
        </button>
        <figcaption class="card__cap">
          <span class="mono card__num">No. ${w.id}</span>
          <span class="card__title" data-i18n="w${w.id}.t"></span>
          <span class="mono card__meta"><span data-i18n="w${w.id}.m"></span> · ${w.year}</span>
        </figcaption>
      </figure>`).join("");

    grid.addEventListener("click", e => {
      const btn = e.target.closest(".card__btn");
      if (btn) openLightbox(+btn.dataset.index, btn);
    });
  }

  /* ================= LIGHTBOX ================= */
  const lb = { open: false, index: 0, trigger: null };
  const lbEl = $("#lightbox");
  const lbImg = $("#lbImg");

  function updateLightbox() {
    const w = WORKS[lb.index];
    lbImg.classList.remove("is-loaded");
    lbImg.onload = () => lbImg.classList.add("is-loaded");
    lbImg.src = `images/full/${w.id}.jpg`;
    lbImg.alt = t(`w${w.id}.t`);
    $("#lbTitle").textContent = t(`w${w.id}.t`);
    $("#lbMeta").textContent = `${t(`w${w.id}.m`)} · ${w.year}`;
    $("#lbCount").textContent = `${String(lb.index + 1).padStart(2, "0")} / ${String(WORKS.length).padStart(2, "0")}`;
    if (lbImg.complete) lbImg.classList.add("is-loaded");
    // preload neighbours
    [1, -1].forEach(d => { new Image().src = `images/full/${WORKS[(lb.index + d + WORKS.length) % WORKS.length].id}.jpg`; });
  }

  function openLightbox(i, trigger) {
    lb.open = true; lb.index = i; lb.trigger = trigger || null;
    updateLightbox();
    lbEl.classList.add("is-open");
    lbEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    $("#lbClose").focus();
  }

  function closeLightbox() {
    lb.open = false;
    lbEl.classList.remove("is-open");
    lbEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lb.trigger) lb.trigger.focus();
  }

  function step(d) {
    lb.index = (lb.index + d + WORKS.length) % WORKS.length;
    updateLightbox();
  }

  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", () => step(-1));
  $("#lbNext").addEventListener("click", () => step(1));
  lbEl.addEventListener("click", e => { if (e.target === lbEl || e.target.classList.contains("lb__figure")) closeLightbox(); });

  document.addEventListener("keydown", e => {
    if (!lb.open) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "Tab") { // simple focus trap
      const f = $$("button", lbEl);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // swipe
  let touchX = null;
  lbEl.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
  lbEl.addEventListener("touchend", e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* ================= HEADER / MENU ================= */
  const header = $("#header");
  const burger = $("#burger");

  function setMenu(open) {
    header.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
  }
  burger.addEventListener("click", () => setMenu(!header.classList.contains("menu-open")));
  $$("#nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));

  $$(".lang__btn").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));

  /* ================= SCROLL EFFECTS ================= */
  const parallax = $$("[data-speed]");
  const hero = $(".hero");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const heroH = hero.offsetHeight;
    header.classList.toggle("is-solid", y > heroH - 80);

    if (!reduceMotion) {
      parallax.forEach(el => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = `translate3d(0, ${(-center * parseFloat(el.dataset.speed)).toFixed(1)}px, 0)`;
      });
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ================= REVEAL ================= */
  function initReveal() {
    const els = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(el => io.observe(el));
  }

  /* ================= INIT ================= */
  renderGrid();
  applyLang(getInitialLang());
  initReveal();
  onScroll();
  requestAnimationFrame(() => document.body.classList.add("is-loaded"));
})();
