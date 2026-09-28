(function () {
  var BGS = [
    { id: 'dark',  name: 'Oscuro' },
    { id: 'light', name: 'Claro' }
  ];
  var ACCENTS = [
    { id: '',       name: 'Sin color' },
    { id: 'azure',  name: 'Azul claro', sw: '#68C7EC' },
    { id: 'orange', name: 'Naranja',    sw: '#F2681C' },
    { id: 'navy',   name: 'Azul marino',sw: '#235AA6' }
  ];
  var K_BG = 'lc-bg', K_AC = 'lc-accent';
  function get(k, def) {
    var q = new URLSearchParams(location.search).get(k === K_BG ? 'fondo' : 'color');
    if (q !== null) { try { localStorage.setItem(k, q); } catch (e) {} return q; }
    try { var v = localStorage.getItem(k); return v === null ? def : v; } catch (e) { return def; }
  }
  function apply(bg, ac) {
    var b = document.body;
    BGS.forEach(function (x) { b.classList.remove('scheme-' + x.id); });
    ACCENTS.forEach(function (x) { if (x.id) b.classList.remove('accent-' + x.id, 'scheme-' + x.id); });
    b.classList.add('scheme-' + bg);
    if (ac) b.classList.add('accent-' + ac);
    try { localStorage.setItem(K_BG, bg); localStorage.setItem(K_AC, ac); } catch (e) {}
    [].forEach.call(document.querySelectorAll('.lcp-btn'), function (el) {
      var on = el.dataset.kind === 'bg' ? el.dataset.val === bg : el.dataset.val === ac;
      el.setAttribute('aria-pressed', on);
    });
  }
  var css = '.lcp{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:10px;'
    + 'padding:8px 12px;border-radius:999px;background:rgba(22,22,22,.94);backdrop-filter:blur(10px);box-shadow:0 10px 34px rgba(0,0,0,.45);'
    + 'font:600 13px/1 -apple-system,Helvetica,Arial,sans-serif;border:1px solid rgba(255,255,255,.16);flex-wrap:wrap;justify-content:center;max-width:94vw}'
    + '.lcp-grp{display:flex;align-items:center;gap:4px}'
    + '.lcp b{color:#9a9793;font-weight:600;padding-right:4px;letter-spacing:.04em;text-transform:uppercase;font-size:10.5px}'
    + '.lcp-sep{width:1px;align-self:stretch;background:rgba(255,255,255,.18);margin:0 2px}'
    + '.lcp-btn{border:0;border-radius:999px;padding:8px 12px;background:transparent;color:#e9e7e4;cursor:pointer;font:inherit;'
    + 'display:inline-flex;align-items:center;gap:6px}'
    + '.lcp-btn[aria-pressed="true"]{background:#f4f2ef;color:#111}'
    + '.lcp-sw{width:11px;height:11px;border-radius:50%;box-shadow:0 0 0 1px rgba(255,255,255,.35)}'
    + '@media(max-width:760px){.lcp{bottom:10px;gap:6px;padding:7px 10px}.lcp-btn{padding:7px 9px;font-size:12px}.lcp-sep{display:none}}'
    + '.lcp-note{position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:9999;background:rgba(22,22,22,.94);color:#f4f2ef;'
    + 'padding:10px 16px;border-radius:12px;font:500 13px/1.4 -apple-system,Helvetica,Arial,sans-serif;max-width:min(88vw,420px);text-align:center;'
    + 'border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 34px rgba(0,0,0,.45)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function btns(kind, list) {
    return '<div class="lcp-grp">' + list.map(function (x) {
      return '<button class="lcp-btn" type="button" data-kind="' + kind + '" data-val="' + x.id + '">'
        + (x.sw ? '<i class="lcp-sw" style="background:' + x.sw + '"></i>' : '') + x.name + '</button>';
    }).join('') + '</div>';
  }
  var bar = document.createElement('div'); bar.className = 'lcp';
  bar.innerHTML = '<b>Fondo</b>' + btns('bg', BGS) + '<span class="lcp-sep"></span><b>Color</b>' + btns('ac', ACCENTS);
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('.lcp-btn'); if (!b) return;
    if (b.dataset.kind === 'bg') apply(b.dataset.val, get(K_AC, ''));
    else apply(get(K_BG, 'dark'), b.dataset.val);
  });
  document.body.appendChild(bar);
  apply(get(K_BG, 'dark'), get(K_AC, ''));

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
