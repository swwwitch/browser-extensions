// ストアのスクリーンショット（1280×800）を store/screenshots/ に書き出す（2026-11-18）
// 使い方：node tools/screenshots.mjs
// ヘッドレスの Chrome を DevTools のプロトコルで動かし、store/demo.html?shot=… を開いて、操作した状態になってから画面を保存する
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SHOTS = ['rail', 'minimap', 'jump', 'edge'];
const PORT = 9333;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-prefers-reduced-motion', '--force-device-scale-factor=1',
  '--window-size=1280,800', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'pn-shots-'))}`, 'about:blank'], { stdio: 'ignore' });
try {
  let ws = null;
  for (let i = 0; i < 50 && !ws; i++) { await sleep(200); try { const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); const page = list.find(p => p.type === 'page'); if (page) ws = page.webSocketDebuggerUrl; } catch {} }
  if (!ws) throw new Error('Chrome に接続できません');
  const sock = new WebSocket(ws); await new Promise(r => sock.addEventListener('open', r));
  let id = 0; const wait = new Map();
  sock.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; wait.set(i, r); sock.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  for (const s of SHOTS) {
    await send('Page.navigate', { url: 'file://' + join(ROOT, 'store', 'demo.html') + '?shot=' + s });
    await sleep(2200);
    const { result } = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(ROOT, 'store', 'screenshots', s + '.png'), Buffer.from(result.data, 'base64'));
    console.log('store/screenshots/' + s + '.png');
  }
  sock.close();
} finally { proc.kill(); }
