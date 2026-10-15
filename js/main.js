/* Navidades Selectas 2026 · Casa Westfalia
   JavaScript sin dependencias: listas, nieve, carruseles, botón "volver arriba" y formulario. */
(function () {
  'use strict';
  var DATA = window.WESTFALIA_DATA || {};
  var CFG = window.WESTFALIA_CONFIG || {};
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Plantillas <template data-for="lista" data-as="item"> ---------- */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function renderItem(tpl, as, item) {
    var html = tpl;
    // Secciones condicionales {{#item.campo}}...{{/item.campo}}
    html = html.replace(new RegExp('\\{\\{#' + as + '\\.(\\w+)\\}\\}([\\s\\S]*?)\\{\\{/' + as + '\\.\\1\\}\\}', 'g'),
      function (_, key, inner) { return item && item[key] ? inner : ''; });
    // Huecos {{item.campo}} y {{item}}
    html = html.replace(new RegExp('\\{\\{\\s*' + as + '(?:\\.(\\w+))?\\s*\\}\\}', 'g'),
      function (_, key) { return esc(key ? (item ? item[key] : '') : item); });
    return html;
  }
  function renderLists(lists) {
    document.querySelectorAll('template[data-for]').forEach(function (t) {
      var name = t.getAttribute('data-for');
      var as = t.getAttribute('data-as');
      var items = lists[name] || [];
      var tpl = t.innerHTML;
      t.insertAdjacentHTML('beforebegin', items.map(function (it) { return renderItem(tpl, as, it); }).join(''));
    });
  }

  /* ---------- Nieve del hero ---------- */
  function flakes() {
    if (reduceMotion) return [];
    var out = [];
    for (var i = 0; i < 46; i++) {
      var s = 2 + ((i * 7) % 5), left = (i * 37) % 100, dur = 9 + ((i * 13) % 11), delay = -((i * 17) % 19), op = 0.35 + ((i * 3) % 6) / 10;
      out.push({ style: 'left:' + left + '%;width:' + s + 'px;height:' + s + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's;opacity:' + op });
    }
    return out;
  }

  var ribbon = (DATA.ribbon || []).concat(DATA.ribbon || []); // duplicado para el bucle infinito
  renderLists({
    flakes: flakes(),
    ribbon: ribbon,
    cats: DATA.cats,
    retailPoints: DATA.retailPoints,
    retail: DATA.retail,
    horeca: DATA.horeca,
    recipes: DATA.recipes
  });

  /* ---------- Carruseles ---------- */
  var GAP = 20;
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function Carousel(key) {
    this.key = key;
    this.viewport = document.querySelector('[data-rail="' + key + '"]');
    this.track = document.querySelector('[data-rail-track="' + key + '"]');
    this.counter = document.querySelector('[data-rail-count="' + key + '"]');
    this.total = this.track ? this.track.querySelectorAll('article').length : 0;
    this.idx = 0; this.vis = 1; this.hold = false; this.pausedUntil = 0; this.tx = null;
    if (!this.viewport || !this.track) return;
    var self = this;
    document.querySelector('[data-rail-prev="' + key + '"]').addEventListener('click', function () { self.manual(-1); });
    document.querySelector('[data-rail-next="' + key + '"]').addEventListener('click', function () { self.manual(1); });
    ['mouseenter', 'focusin'].forEach(function (ev) { self.viewport.addEventListener(ev, function () { self.hold = true; }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { self.viewport.addEventListener(ev, function () { self.release(); }); });
    this.viewport.addEventListener('touchstart', function (e) { self.hold = true; self.tx = e.touches[0] ? e.touches[0].clientX : null; }, { passive: true });
    this.viewport.addEventListener('touchend', function (e) {
      self.hold = false;
      var x = e.changedTouches[0] ? e.changedTouches[0].clientX : null;
      if (self.tx != null && x != null && Math.abs(x - self.tx) > 40) self.manual(x < self.tx ? 1 : -1);
      else self.pausedUntil = Date.now() + 2000;
      self.tx = null;
    });
    this.measure();
  }
  Carousel.prototype.measure = function () {
    var card = this.track.querySelector('article');
    if (card) this.vis = Math.max(1, Math.floor((this.viewport.clientWidth + GAP) / (card.getBoundingClientRect().width + GAP)));
    this.render();
  };
  Carousel.prototype.max = function () { return Math.max(0, this.total - this.vis); };
  Carousel.prototype.step = function (dir) {
    var max = this.max(), next = Math.min(this.idx, max) + dir;
    if (next > max) next = 0;
    if (next < 0) next = max;
    this.idx = next; this.render();
  };
  Carousel.prototype.manual = function (dir) { this.pausedUntil = Date.now() + (CFG.PAUSE_AFTER_CLICK_MS || 6000); this.step(dir); };
  Carousel.prototype.release = function () { this.hold = false; this.pausedUntil = Date.now() + 2000; };
  Carousel.prototype.render = function () {
    var idx = Math.min(this.idx, this.max());
    this.track.style.transform = 'translateX(calc(-' + idx + ' * (min(300px, 82vw) + ' + GAP + 'px)))';
    if (this.counter) this.counter.textContent = pad(idx + 1) + ' / ' + pad(this.total);
  };

  var carousels = ['retail', 'horeca'].map(function (k) { return new Carousel(k); }).filter(function (c) { return c.track; });
  window.addEventListener('resize', function () { carousels.forEach(function (c) { c.measure(); }); });
  window.addEventListener('load', function () { carousels.forEach(function (c) { c.measure(); }); });
  if (!reduceMotion) {
    setInterval(function () {
      if (document.hidden) return;
      carousels.forEach(function (c) { if (!c.hold && Date.now() >= c.pausedUntil) c.step(1); });
    }, CFG.AUTOPLAY_MS || 2000);
  }

  /* ---------- Botón volver arriba ---------- */
  var totop = document.getElementById('totop');
  if (totop) {
    var onScroll = function () { totop.classList.toggle('is-visible', (window.scrollY || document.documentElement.scrollTop) > 500); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
  }

  /* ---------- Formulario ---------- */
  var LABELS = { retail: 'Retail', horeca: 'Horeca', tradicional: 'Canal tradicional' };
  var canal = 'retail';
  var canalBtns = document.querySelectorAll('.canal-btn');
  canalBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      canal = b.getAttribute('data-canal');
      canalBtns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
    });
  });

  var form = document.getElementById('lead-form');
  var wrap = document.getElementById('form-wrap');
  var sent = document.getElementById('form-sent');
  var errorMsg = document.getElementById('form-error');
  function showSent(name) {
    var first = (name || '').trim().split(' ')[0];
    document.getElementById('form-greet').textContent = first ? ', ' + first : '';
    document.getElementById('form-canal').textContent = LABELS[canal];
    wrap.hidden = true; sent.hidden = false;
  }
  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitText = submitBtn.textContent;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      errorMsg.hidden = true;
      submitBtn.disabled = true; submitBtn.textContent = 'Enviando…';

      // Se envía directamente a marketing@cwestfalia.es a través de api/contacto.js.
      var fd = new FormData(form);
      fd.append('canal', LABELS[canal]);
      fetch(CFG.FORM_ENDPOINT, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); showSent(form.elements.nombre.value); })
        .catch(function () { errorMsg.hidden = false; })
        .then(function () { submitBtn.disabled = false; submitBtn.textContent = submitText; });
    });
    document.getElementById('form-reset').addEventListener('click', function () {
      form.reset(); sent.hidden = true; wrap.hidden = false;
    });
  }
})();
