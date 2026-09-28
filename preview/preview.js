(function () {
  // Vista previa estática de la web de Let's Cars Barcelona.
  // Diseño definitivo: fondo blanco, texto negro y acento rojo.
  var css = '.lcp-note{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;background:rgba(22,22,22,.94);color:#f4f2ef;'
    + 'padding:10px 16px;border-radius:12px;font:500 13px/1.4 -apple-system,Helvetica,Arial,sans-serif;max-width:min(88vw,420px);text-align:center;'
    + 'border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 34px rgba(0,0,0,.45)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

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
