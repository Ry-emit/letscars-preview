/* Let's Cars Barcelona — interacciones */
(function () {
  // Menú móvil
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('is-open'); });
    });
  }

  // Galería de la ficha: flechas anterior/siguiente + miniaturas.
  // Las miniaturas siguen llevando directamente a su foto; las flechas
  // recorren la misma lista en orden y dan la vuelta al llegar al final.
  var gal = document.querySelector('[data-gallery]');
  if (gal) {
    var main = gal.querySelector('[data-gallery-main]');
    var thumbs = Array.prototype.slice.call(gal.querySelectorAll('.gallery__thumbs img'));
    var counter = gal.querySelector('[data-gallery-current]');
    var i = 0;

    function show(n) {
      if (!thumbs.length) return;
      i = (n + thumbs.length) % thumbs.length;      // da la vuelta en los extremos
      var t = thumbs[i];
      main.src = t.getAttribute('data-full') || t.src;
      main.alt = t.alt || '';
      thumbs.forEach(function (el) { el.classList.remove('is-active'); });
      t.classList.add('is-active');
      if (counter) counter.textContent = i + 1;
      // mantener la miniatura activa a la vista si hay muchas fotos
      if (t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    thumbs.forEach(function (t, n) {
      t.addEventListener('click', function () { show(n); });
    });

    var prev = gal.querySelector('[data-gallery-prev]');
    var next = gal.querySelector('[data-gallery-next]');
    if (prev) prev.addEventListener('click', function () { show(i - 1); });
    if (next) next.addEventListener('click', function () { show(i + 1); });

    // Flechas del teclado
    if (thumbs.length > 1) {
      document.addEventListener('keydown', function (e) {
        // No robar las flechas mientras se escribe en un campo del formulario
        var el = e.target;
        var tag = (el && el.tagName ? el.tagName : '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if (el && el.isContentEditable) return;
        if (e.key === 'ArrowLeft'  || e.key === 'Left')  { show(i - 1); }
        if (e.key === 'ArrowRight' || e.key === 'Right') { show(i + 1); }
      });
    }

    // Deslizar con el dedo en móvil
    var x0 = null;
    gal.querySelector('.gallery__main').addEventListener('touchstart', function (e) {
      x0 = e.changedTouches[0].clientX;
    }, { passive: true });
    gal.querySelector('.gallery__main').addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { show(dx < 0 ? i + 1 : i - 1); }
      x0 = null;
    }, { passive: true });
  }

  // Escaparate: los filtros se aplican al momento (sin pulsar "Filtrar").
  // Se recarga solo la rejilla de coches, sin salir de la página ni perder el foco.
  var ff = document.querySelector('[data-filters]');
  var box = document.querySelector('[data-results]');
  if (ff && box && window.fetch && window.DOMParser && window.URLSearchParams && window.FormData) {
    window.lcAutoFilter = true;
    ff.classList.add('is-auto');
    var timer = null, ctl = null;

    function currentUrl() {
      var p = new URLSearchParams();
      new FormData(ff).forEach(function (v, k) { if (v !== '' && k !== 'orden') p.append(k, v); });
      var sort = document.querySelector('[data-sort] select[name="orden"]');
      if (sort && sort.value) p.set('orden', sort.value);
      var q = p.toString();
      return ff.getAttribute('action') + (q ? '?' + q : '');
    }

    function load(url, opts) {
      opts = opts || {};
      if (ctl && ctl.abort) ctl.abort();
      ctl = window.AbortController ? new AbortController() : null;
      box.classList.add('is-loading');
      fetch(url, { headers: { 'X-Requested-With': 'fetch' }, signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var fresh = doc.querySelector('[data-results]');
          if (!fresh) throw new Error('sin resultados');
          box.innerHTML = fresh.innerHTML;
          box.classList.remove('is-loading');
          if (opts.push !== false) history.pushState({ lc: 1 }, '', url);
          if (opts.scroll) {
            var top = box.getBoundingClientRect().top + window.pageYOffset - 110;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }
        })
        .catch(function (err) {
          if (err && err.name === 'AbortError') return;
          window.location.href = url;              // si algo falla, carga normal
        });
    }

    // Selectores: al cambiar. Números: mientras se escribe (con una pequeña pausa).
    ff.addEventListener('change', function (e) {
      clearTimeout(timer);
      if (e.target.matches('select, input')) load(currentUrl());
    });
    ff.addEventListener('input', function (e) {
      if (!e.target.matches('input[type="number"]')) return;
      clearTimeout(timer);
      timer = setTimeout(function () { load(currentUrl()); }, 600);
    });
    ff.addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(timer); load(currentUrl()); });

    // "Limpiar": vacía todos los filtros al momento
    var reset = ff.querySelector('[data-filters-reset]');
    if (reset) reset.addEventListener('click', function (e) {
      e.preventDefault();
      clearTimeout(timer);
      ff.querySelectorAll('select').forEach(function (el) { el.value = ''; });
      ff.querySelectorAll('input:not([type="hidden"])').forEach(function (el) { el.value = ''; });
      load(reset.getAttribute('href'));
    });

    // Orden y paginación dentro de los resultados
    box.addEventListener('change', function (e) {
      if (e.target.matches('[data-sort] select')) load(currentUrl());
    });
    box.addEventListener('submit', function (e) {
      if (e.target.matches('[data-sort]')) { e.preventDefault(); load(currentUrl()); }
    });
    box.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('.pagination a, .empty-state a') : null;
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      load(a.href, { scroll: true });
    });

    // Botón atrás/adelante del navegador
    window.addEventListener('popstate', function () { window.location.reload(); });
  }

  // Reveal on scroll suave
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'none'; io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)';
      io.observe(el);
    });
  }
})();
