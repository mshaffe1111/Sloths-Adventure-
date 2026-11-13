// readtime (FIX-A, R-165.175): on the REAL page (vite dev, so window.__play / __engine / __dotRun exist), play a stage on a fresh
// save at the default settings and log every Dot card: its words, its reading time (dotGuide.ts readMs), how long it was really on
// screen, and what ended it (it faded on its own, a tap cleared it, or the next card replaced it). A simple walker holds Right and hops
// at walls and ledges (keyboard; the phone is emulated, so the words are the touch words).
//   node tools/dotbox/readtime.mjs <stage> [easy|normal] [secs] [port] [tap]   (tap: tap each card once its reading time is up)
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const [stage = '1-1', diff = 'normal', secsArg = '90', portArg = '5231', tapArg = ''] = process.argv.slice(2);
const port = Number(portArg);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const words = (t) => (t.trim().match(/\S+/g) || []).length;
const readMs = (t) => Math.max(4000, 1500 + 500 * words(t));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
if (diff === 'easy') await p.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'easy'); } catch {} });
await p.goto(`http://127.0.0.1:${port}/`, { timeout: 300000 });
await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 300000 });
await sleep(2000);
await p.evaluate((s) => window.__play(s), stage);
await p.waitForFunction(() => (typeof window.__engine === 'function' ? window.__engine() : window.__engine)?.player, null, { timeout: 120000 });
const info = await p.evaluate(() => ({ help: window.__dotRun?.help, easy: (typeof window.__engine === 'function' ? window.__engine() : window.__engine)?.easy ?? null }));
console.log(`stage ${stage} ${diff}: Dot's help setting ${info.help}, engine easy ${info.easy}${tapArg ? ', tapping each card at its reading time' : ''}`);
// (tap mode: count every punch or jump the game is handed, to prove a tap on her card is neither)
if (tapArg) await p.evaluate(() => {
  const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
  const st = e.input.state;
  window.__presses = { punch: 0, jump: 0 };
  for (const k of ['punchPressed', 'jumpPressed']) {
    let v = st[k];
    Object.defineProperty(st, k, { get: () => v, set: (x) => { if (x && !v) window.__presses[k === 'punchPressed' ? 'punch' : 'jump']++; v = x; }, configurable: true });
  }
});
await p.keyboard.down('ArrowRight');
const t0 = Date.now();
const cards = [];
let cur = null;
let lastX = 0, stillMs = 0, hopT = 0;
while (Date.now() - t0 < Number(secsArg) * 1000) {
  await sleep(50);
  const s = await p.evaluate(() => {
    const el = document.querySelector('.dg-bub.in');
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const q = e?.player;
    const r = window.__dotRun;
    const g = q && e.platforms.find((k) => !k.broken && k.x <= q.x + q.width && k.x + k.width >= q.x && Math.abs(k.y - (q.y + q.height)) < 10);
    return {
      text: el ? (el.querySelector('p')?.innerText ?? '') : null,
      x: q?.x ?? 0, grounded: !!q?.grounded, edge: g ? g.x + g.width - (q.x + q.width) : 999,
      waiting: r?.queue?.size ?? 0, why: r?.queue?.lastEnd ?? null,
      rect: el ? (() => { const b = el.getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; })() : null,
    };
  });
  const now = Date.now() - t0;
  if (s.text !== (cur?.text ?? null)) {
    if (cur) { cur.ms = now - cur.at; cur.next = s.text; cards.push(cur); }
    cur = s.text ? { text: s.text, at: now, read: readMs(s.text), waitingAtStart: s.waiting, rect: s.rect } : null;
  }
  if (tapArg && cur && !cur.tapped && now - cur.at >= cur.read && s.rect) {
    cur.tapped = true;
    const before = await p.evaluate(() => ({ ...window.__presses }));
    await p.touchscreen.tap(s.rect[0] + s.rect[2] / 2, s.rect[1] + s.rect[3] / 2);
    await sleep(120);
    const after = await p.evaluate(() => ({ ...window.__presses, gone: !document.querySelector('.dg-bub.in:not(.out)') || document.querySelector('.dg-bub.in p')?.innerText !== undefined }));
    cur.tapPunch = after.punch - before.punch;
    cur.tapJump = after.jump - before.jump;
  }
  // the walker: hop at a wall (no progress) or just before a ledge's end
  stillMs = Math.abs(s.x - lastX) < 1 ? stillMs + 50 : 0;
  lastX = s.x;
  if (s.grounded && (stillMs > 300 || s.edge < 40) && now - hopT > 500) {
    hopT = now;
    await p.keyboard.down('Space'); await sleep(260); await p.keyboard.up('Space');
  }
}
if (cur) { cur.ms = Date.now() - t0 - cur.at; cur.next = '(run ended)'; cards.push(cur); }
await p.keyboard.up('ArrowRight');
let short = 0;
for (const c of cards) {
  const ok = c.ms >= c.read;
  if (!ok && c.next !== '(run ended)') short++;
  console.log(`${(c.at / 1000).toFixed(1).padStart(5)} s  ${(c.ms / 1000).toFixed(1).padStart(5)} s up / read ${(c.read / 1000).toFixed(1)} s (x${(c.ms / c.read).toFixed(1)}) ${ok ? '  ' : '<<'}${c.tapped ? ` TAPPED (punches ${c.tapPunch}, jumps ${c.tapJump})` : ''} ${words(c.text)}w "${c.text}"${c.next && c.next !== '(run ended)' ? ` -> replaced by "${c.next.slice(0, 40)}"` : c.next === null ? '' : ' (run ended)'}`);
}
console.log(`${cards.length} cards; ${short} were taken down before their reading time`);
await b.close();
try { process.kill(-vite.pid); } catch { vite.kill(); }
process.exit(0);
