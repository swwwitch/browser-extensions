/**
 * Page Navigator（2026-11-18）：どのページでも使えるページ内の移動の補助。ceebeedee.space の ui-plus.js の 8〜10 と見出しのジャンプを、汎用にしたもの
 * 1. 上下の帯：スクロールしているときに画面の上端・下端へマウスを寄せると「↑ ページの先頭へ」「↓ ページの末尾へ」の帯。押すと移動
 * 2. エレベーター：ページの左端に、見出しの位置を短い線で並べる（ページ全体の高さを画面の高さに縮めた位置）。マウスを載せると見出しの名前、押すとその見出しへ
 * 3. ミニマップ：画面の右端にマウスを寄せると、ページ全体の縮図と、いま見えている範囲の枠が出る。枠のドラッグ・縮図のクリックで移動
 * 4. 見出しのジャンプ：Mac は ⌘⌥↓ / ⌘⌥↑、Windows は Alt+Shift+↓ / ↑。設定で J / K も（サイトのショートカットと重なるので、既定は切）
 * - 画面の部品は Shadow DOM の中に作り、ページの CSS と干渉しない
 * - 設定は chrome.storage.sync（popup.js と同じ形）。サイトごとに止められる
 * - マウスで操作する画面だけ（タッチの端末では 1〜3 を出さない）
 */
(() => {
  if (window.top !== window || window.__pageNavigator) return;
  window.__pageNavigator = true;

  const DEFAULTS = { edge: true, rail: true, minimap: true, jump: true, jk: false, disabledHosts: [] };
  let cfg = { ...DEFAULTS };
  const host = location.hostname || 'file';
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
  const off = () => (cfg.disabledHosts || []).includes(host);
  const motion = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  const docH = () => Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
  const docW = () => Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth);
  const viewW = () => document.documentElement.clientWidth || innerWidth;

  // ---- 部品の入れ物（Shadow DOM） ----
  const rootEl = document.createElement('page-navigator-root');
  rootEl.style.cssText = 'all:initial;position:fixed;left:0;top:0;width:0;height:0;z-index:2147483646;';
  const sh = rootEl.attachShadow({ mode: 'open' });
  const styleEl = document.createElement('style'); styleEl.textContent = `
    :host{all:initial}
    *{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Segoe UI",sans-serif}
    .edge{position:fixed;left:0;right:0;height:30px;display:none;align-items:center;justify-content:center;gap:6px;border:0;margin:0;padding:0;cursor:pointer;font-size:13px;font-weight:700;color:#fff;background:rgba(24,43,60,.82);backdrop-filter:blur(4px);z-index:3}
    .edge.on{display:flex}
    .edge.top{top:0}.edge.bottom{bottom:0}
    .rail{position:fixed;left:0;top:0;bottom:0;width:22px;z-index:2;display:none}
    .rail.on{display:block}
    .tick{position:absolute;left:0;height:12px;width:22px;margin-top:-6px;border:0;padding:0;background:transparent;cursor:pointer}
    .tick::before{content:"";position:absolute;left:0;top:4px;width:12px;height:4px;border-radius:0 2px 2px 0;background:#5c6c78;opacity:.45;transition:width .15s,opacity .15s}
    .tick.sub::before{top:5px;width:6px;height:2px;opacity:.3}
    .tick:hover::before,.tick.cur::before{width:18px;opacity:.95;background:#0076b5}
    .tick.sub:hover::before{width:10px}
    .label{position:absolute;left:24px;top:50%;transform:translateY(-50%);max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:4px 10px;border-radius:6px;background:rgba(24,43,60,.92);color:#fff;font-size:12px;line-height:1.5;display:none;pointer-events:none}
    .tick:hover .label{display:block}
    .map{position:fixed;top:0;right:0;width:110px;height:100vh;background:rgba(245,247,249,.94);box-shadow:-2px 0 10px rgba(0,0,0,.15);display:none;z-index:2;cursor:pointer}
    .map.on{display:block}
    .map canvas{display:block;width:110px;height:100%}
    .view{position:absolute;left:0;right:0;border:2px solid #0076b5;background:rgba(0,118,181,.12);cursor:grab;border-radius:2px}
    .view.drag{cursor:grabbing}
    .toast{position:fixed;left:50%;top:14px;transform:translateX(-50%);max-width:min(560px,90vw);padding:6px 14px;border-radius:999px;background:rgba(24,43,60,.9);color:#fff;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;transition:opacity .2s;pointer-events:none;z-index:4}
    .toast.on{opacity:1}
    @media (prefers-color-scheme: dark){.map{background:rgba(26,31,35,.94)}.tick::before{background:#c7d2db}}
  `; sh.append(styleEl);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const mount = () => { if (!rootEl.isConnected && document.documentElement) document.documentElement.append(rootEl); };

  // ---- 見出し ----
  const shown = h => { if (!h.getClientRects().length) return false; const cs = getComputedStyle(h); return cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const usable = h => shown(h) && h.textContent.trim() !== '' && !h.closest('nav,header,footer,aside,dialog,[aria-hidden="true"],[hidden]');
  /** 本文の見出し。main（なければ article、body）の h2 が2つ以上なら h2（h3 は副の目盛り）、なければ h1〜h3 */
  function headings() {
    for (const scope of [document.querySelector('main,[role="main"]'), document.querySelector('article'), document.body]) {
      if (!scope) continue;
      const all = [...scope.querySelectorAll('h1,h2,h3')].filter(usable);
      if (!all.length) continue;
      const h2 = all.filter(h => h.tagName === 'H2');
      if (h2.length >= 2) return { main: h2, subs: all.filter(h => h.tagName === 'H3') };
      return { main: all, subs: [] };
    }
    return { main: [], subs: [] };
  }
  /** 上部に固定されたヘッダーの下端（見出しが隠れない位置で止めるため） */
  function topOffset() {
    let o = 0;
    for (const x of [viewW() * 0.2, viewW() * 0.5, viewW() * 0.8]) {
      let n = document.elementFromPoint(x, 2);
      while (n && n !== document.body && n !== document.documentElement) {
        if (n === rootEl) break;
        const cs = getComputedStyle(n);
        if (cs.position === 'fixed' || cs.position === 'sticky') { const r = n.getBoundingClientRect(); if (r.top <= 2 && r.height < innerHeight * 0.4) o = Math.max(o, r.bottom); break; }
        n = n.parentElement;
      }
    }
    return o;
  }
  const absTop = n => n.getBoundingClientRect().top + scrollY;
  const goTo = h => scrollTo({ top: Math.max(0, absTop(h) - topOffset() - 12), behavior: motion() });

  // ---- 小さな通知（ジャンプした見出しの名前） ----
  const toast = el('div', 'toast'); let toastTimer = 0;
  const say = t => { toast.textContent = t; toast.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('on'), 1400); };

  // ---- 1. 上下の帯 ----
  const topBand = el('button', 'edge top', '↑ ページの先頭へ'), bottomBand = el('button', 'edge bottom', '↓ ページの末尾へ');
  topBand.type = bottomBand.type = 'button'; topBand.tabIndex = bottomBand.tabIndex = -1;
  topBand.addEventListener('click', () => { scrollTo({ top: 0, behavior: motion() }); topBand.classList.remove('on'); });
  bottomBand.addEventListener('click', () => { scrollTo({ top: docH(), behavior: motion() }); bottomBand.classList.remove('on'); });
  const HOT = 6; // 画面の端からこの幅にマウスを寄せると帯を出す（帯の上にいる間は出したまま）
  function edgeMove(x, y) {
    if (!cfg.edge || off() || !fine()) { topBand.classList.remove('on'); bottomBand.classList.remove('on'); return; }
    const onTop = topBand.classList.contains('on'), onBottom = bottomBand.classList.contains('on');
    topBand.classList.toggle('on', scrollY > innerHeight * 0.5 && (y <= HOT || (onTop && y <= 30)));
    bottomBand.classList.toggle('on', scrollY + innerHeight < docH() - innerHeight * 0.5 && (y >= innerHeight - HOT || (onBottom && y >= innerHeight - 30)));
  }

  // ---- 2. エレベーター ----
  const rail = el('nav', 'rail'); rail.setAttribute('aria-label', 'ページ内の見出しへ移動');
  let ticks = [];
  function buildRail() {
    rail.replaceChildren(); ticks = [];
    if (!cfg.rail || off() || !fine() || viewW() < 900) { rail.classList.remove('on'); return; }
    const { main, subs } = headings();
    if (main.length < 3) { rail.classList.remove('on'); return; }
    const H = docH(), span = innerHeight - 24;
    const place = (h, sub) => {
      const b = el('button', 'tick' + (sub ? ' sub' : '')); b.type = 'button'; b.tabIndex = -1;
      b.style.top = (12 + Math.min(1, absTop(h) / H) * span) + 'px';
      const label = h.textContent.replace(/\s+/g, ' ').trim(); b.setAttribute('aria-label', label);
      b.append(el('span', 'label', label));
      b.addEventListener('click', () => goTo(h));
      rail.append(b); if (!sub) ticks.push([h, b]);
    };
    main.forEach(h => place(h, false)); subs.forEach(h => place(h, true));
    rail.classList.add('on'); markCurrent();
  }
  function markCurrent() {
    if (!ticks.length) return;
    const line = topOffset() + innerHeight * 0.3; let cur = null;
    for (const [h, b] of ticks) if (h.getBoundingClientRect().top <= line) cur = b;
    for (const [, b] of ticks) b.classList.toggle('cur', b === cur);
  }

  // ---- 3. ミニマップ ----
  const map = el('div', 'map'); const cv = el('canvas'); const view = el('div', 'view'); map.append(cv, view);
  const MAPW = 110;
  const mapUsable = () => cfg.minimap && !off() && fine() && viewW() >= 1000 && docH() > innerHeight * 1.5;
  function drawMap() {
    if (!map.classList.contains('on')) return;
    const H = docH(), W = docW(), dpr = devicePixelRatio || 1, h = innerHeight;
    cv.width = MAPW * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, MAPW, h);
    const sy = h / H, sx = MAPW / W, dark = matchMedia('(prefers-color-scheme: dark)').matches;
    const rect = (n, color, min = 1) => { const r = n.getBoundingClientRect(); if (!r.width || !r.height) return; ctx.fillStyle = color; ctx.fillRect((r.left + scrollX) * sx, (r.top + scrollY) * sy, Math.max(min, r.width * sx), Math.max(min, r.height * sy)); };
    let n = 0; const LIMIT = 1500;
    for (const p of document.querySelectorAll('p,li,dd,td,blockquote,pre')) { if (n++ > LIMIT) break; if (!p.closest('page-navigator-root')) rect(p, dark ? 'rgba(200,210,220,.25)' : 'rgba(92,108,120,.22)'); }
    for (const m of document.querySelectorAll('img,video,iframe,svg,canvas,picture')) { if (n++ > LIMIT) break; if (m.getBoundingClientRect().width > 40) rect(m, dark ? 'rgba(200,210,220,.4)' : 'rgba(92,108,120,.38)', 2); }
    for (const t of document.querySelectorAll('h1,h2,h3')) if (usable(t)) rect(t, dark ? '#e8eef3' : '#182b3c', 2);
    moveView();
  }
  function moveView() { const sy = innerHeight / docH(); view.style.top = scrollY * sy + 'px'; view.style.height = Math.max(8, innerHeight * sy) + 'px'; }
  let drag = null;
  view.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); drag = { y: e.clientY, s: scrollY }; view.classList.add('drag'); });
  map.addEventListener('mousedown', e => { if (e.target === view) return; e.preventDefault(); const sy = innerHeight / docH(); scrollTo({ top: e.clientY / sy - innerHeight / 2, behavior: motion() }); });
  addEventListener('mousemove', e => { if (!drag) return; const sy = innerHeight / docH(); scrollTo({ top: drag.s + (e.clientY - drag.y) / sy }); }, true);
  addEventListener('mouseup', () => { if (drag) { drag = null; view.classList.remove('drag'); } }, true);
  function mapMove(x) {
    if (!mapUsable()) { map.classList.remove('on'); return; }
    const right = viewW();
    if (x >= right - 16 && !map.classList.contains('on')) { map.classList.add('on'); drawMap(); }
    else if (map.classList.contains('on') && !drag && x < right - MAPW - 24) map.classList.remove('on');
  }

  // ---- 4. 見出しのジャンプ ----
  const typing = () => { let a = document.activeElement; while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement; return !!a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable); };
  function jump(dir) {
    const { main } = headings(); if (!main.length) return false;
    const o = topOffset() + 12, pos = main.map(h => h.getBoundingClientRect().top - o);
    let i = -1;
    if (dir > 0) i = pos.findIndex(p => p > 4); else for (let j = pos.length - 1; j >= 0; j--) if (pos[j] < -4) { i = j; break; }
    if (i < 0) { say(dir > 0 ? '最後の見出しです' : '最初の見出しです'); return true; }
    goTo(main[i]); say(main[i].textContent.replace(/\s+/g, ' ').trim());
    return true;
  }
  addEventListener('keydown', e => {
    if (!cfg.jump || off() || e.isComposing || e.keyCode === 229 || typing()) return;
    let dir = 0;
    const combo = isMac ? (e.metaKey && e.altKey && !e.ctrlKey && !e.shiftKey) : (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey);
    if (combo && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) dir = e.key === 'ArrowDown' ? 1 : -1;
    else if (cfg.jk && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && (e.key === 'j' || e.key === 'k')) dir = e.key === 'j' ? 1 : -1;
    if (dir && jump(dir)) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // ---- 動き ----
  let raf = 0;
  addEventListener('mousemove', e => { if (raf) return; const { clientX: x, clientY: y } = e; raf = requestAnimationFrame(() => { raf = 0; edgeMove(x, y); mapMove(x); }); }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { topBand.classList.remove('on'); bottomBand.classList.remove('on'); if (!drag) map.classList.remove('on'); });
  let sraf = 0;
  addEventListener('scroll', () => { if (sraf) return; sraf = requestAnimationFrame(() => { sraf = 0; markCurrent(); moveView(); if (scrollY <= innerHeight * 0.5) topBand.classList.remove('on'); }); }, { passive: true });
  let t = 0; const later = () => { clearTimeout(t); t = setTimeout(() => { buildRail(); drawMap(); }, 500); };
  addEventListener('resize', later);
  new MutationObserver(muts => { if (muts.some(m => !rootEl.contains(m.target) && m.target !== rootEl)) later(); }).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('load', later);

  function apply() { mount(); if (off()) { rail.classList.remove('on'); map.classList.remove('on'); topBand.classList.remove('on'); bottomBand.classList.remove('on'); } buildRail(); }
  sh.append(rail, map, topBand, bottomBand, toast);
  chrome.storage.sync.get(DEFAULTS, v => { cfg = { ...DEFAULTS, ...v }; apply(); });
  chrome.storage.onChanged.addListener((changes, area) => { if (area !== 'sync') return; for (const k in changes) cfg[k] = changes[k].newValue; apply(); });
})();
