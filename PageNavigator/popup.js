// Page Navigator の設定（chrome.storage.sync。content.js と同じ形）
const DEFAULTS = { edge: true, rail: true, minimap: true, jump: true, jk: false, disabledHosts: [] };
const isMac = /Mac/.test(navigator.platform || navigator.userAgent);
// キーの説明（innerHTML を使わずに組み立てる。Firefox のアドオンの審査で指摘されないように）
{
  const combo = document.getElementById('combo');
  const kbd = t => { const k = document.createElement('kbd'); k.textContent = t; return k; };
  if (isMac) combo.append(kbd('⌘'), kbd('⌥'), kbd('↓'), ' 次の見出し ／ ', kbd('⌘'), kbd('⌥'), kbd('↑'), ' 前の見出し');
  else combo.append(kbd('Alt'), '+', kbd('Shift'), '+', kbd('↓'), ' 次の見出し ／ ', kbd('↑'), ' 前の見出し');
}

chrome.storage.sync.get(DEFAULTS, cfg => {
  document.querySelectorAll('input[data-key]').forEach(box => {
    box.checked = !!cfg[box.dataset.key];
    box.addEventListener('change', () => chrome.storage.sync.set({ [box.dataset.key]: box.checked }));
  });
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    const site = document.getElementById('site');
    let host = '';
    try { const u = new URL(tab?.url || ''); host = u.protocol === 'file:' ? 'file' : u.hostname; } catch {}
    document.getElementById('host').textContent = host || '（このページでは使えません）';
    if (!host) { site.disabled = true; return; }
    site.checked = (cfg.disabledHosts || []).includes(host);
    site.addEventListener('change', () => {
      chrome.storage.sync.get(DEFAULTS, now => {
        const set = new Set(now.disabledHosts || []);
        site.checked ? set.add(host) : set.delete(host);
        chrome.storage.sync.set({ disabledHosts: [...set] });
      });
    });
  });
});
