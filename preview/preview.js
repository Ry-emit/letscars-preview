(function () {
  var SCHEMES = [
    { id: 'dark',  name: 'Oscuro' },
    { id: 'light', name: 'Claro' },
    { id: 'azure', name: 'Azul' }
  ];
  var KEY = 'lc-scheme';
  function current() {
    var q = new URLSearchParams(location.search).get('estilo');
    if (q) { try { localStorage.setItem(KEY, q); } catch (e) {} return q; }
    try { return localStorage.getItem(KEY) || 'dark'; } catch (e) { return 'dark'; }
  }
  function apply(id) {
    document.body.classList.remove('scheme-dark', 'scheme-light', 'scheme-azure');
    document.body.classList.add('scheme-' + id);
    try { localStorage.setItem(KEY, id); } catch (e) {}
    [].forEach.call(document.querySelectorAll('.lcp-btn'), function (b) {
      b.setAttribute('aria-pressed', b.dataset.scheme === id);
    });
  }
  var css = '.lcp{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:6px;'
    + 'padding:7px 9px;border-radius:999px;background:rgba(22,22,22,.92);backdrop-filter:blur(10px);box-shadow:0 10px 34px rgba(0,0,0,.45);'
    + 'font:600 13px/1 -apple-system,Helvetica,Arial,sans-serif;border:1px solid rgba(255,255,255,.16)}'
    + '.lcp b{color:#9a9793;font-weight:600;padding:0 6px 0 4px;letter-spacing:.04em;text-transform:uppercase;font-size:11px}'
    + '.lcp-btn{border:0;border-radius:999px;padding:8px 14px;background:transparent;color:#e9e7e4;cursor:pointer;font:inherit}'
    + '.lcp-btn[aria-pressed="true"]{background:#f4f2ef;color:#111}'
    + '@media(max-width:600px){.lcp{bottom:12px}.lcp-btn{padding:8px 11px}}'
    + '.lcp-note{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);z-index:9999;background:rgba(22,22,22,.94);color:#f4f2ef;'
    + 'padding:10px 16px;border-radius:12px;font:500 13px/1.4 -apple-system,Helvetica,Arial,sans-serif;max-width:min(88vw,420px);text-align:center;'
    + 'border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 34px rgba(0,0,0,.45)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var bar = document.createElement('div'); bar.className = 'lcp';
  bar.innerHTML = '<b>Estilo</b>' + SCHEMES.map(function (s) {
    return '<button class="lcp-btn" data-scheme="' + s.id + '" type="button">' + s.name + '</button>';
  }).join('');
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('.lcp-btn'); if (b) apply(b.dataset.scheme);
  });
  document.body.appendChild(bar);
  apply(current());

  // Vista previa estática: filtros, orden y formularios no funcionan aquí
  var note;
  function say(txt) {
    clearTimeout(say.t); if (!note) { note = document.createElement('div'); note.className = 'lcp-note'; document.body.appendChild(note); }
    note.textContent = txt; note.style.display = 'block';
    say.t = setTimeout(function () { note.style.display = 'none'; }, 3200);
  }
  document.addEventListener('submit', function (e) { e.preventDefault(); say('Vista previa: los formularios y los filtros solo funcionan en la web real.'); }, true);
  document.addEventListener('change', function (e) {
    if (e.target.closest('.filters, [data-sort]')) { e.stopPropagation(); say('Vista previa: los filtros funcionan al momento en la web real.'); }
  }, true);
  document.addEventListener('click', function (e) {
    var r = e.target.closest('[data-filters-reset]'); if (r) { e.preventDefault(); e.stopPropagation(); say('Vista previa: los filtros funcionan al momento en la web real.'); }
  }, true);
})();
