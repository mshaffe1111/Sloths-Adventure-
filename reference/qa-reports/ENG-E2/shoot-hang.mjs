/**
 * ENG-E2: the Spanish moss on a mossy liana (1-6's lianas, marked mossy) and hanging moss tied on a rope (1-3's shimmy rope), on the REAL
 * game, each judged on the thing it sits on (D65), with Pokey holding it. Stills only (412x915 and 915x412, deviceScaleFactor 2).
 *   node reference/qa-reports/ENG-E2/shoot-hang.mjs <sha> [port]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [sha = '?', portArg] = process.argv.slice(2);
const port = Number(portArg || 5232);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = path.join(here, 'shots');
fs.mkdirSync(out, { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
for (const [w, h] of [[412, 915], [915, 412]]) {
  const tag = `${w > h ? 'sideways' : 'upright'}-${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  await page.evaluate(() => { try { localStorage.removeItem('sloth_difficulty'); } catch {} });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  const stamp = (text) => page.evaluate((text) => {
    let d = document.getElementById('__lab');
    if (!d) { d = document.createElement('div'); d.id = '__lab'; Object.assign(d.style, { position: 'fixed', left: '4px', bottom: '4px', right: '4px', zIndex: 99999, font: '11px/1.3 monospace', color: '#fff', background: 'rgba(0,0,0,.6)', padding: '3px 5px', pointerEvents: 'none' }); document.body.appendChild(d); }
    d.textContent = text;
  }, text);
  // --- 1-6: every liana mossy; he holds the first one
  await page.evaluate(() => window.__play('1-6'));
  await sleep(5000);
  const lia = await page.evaluate(() => {
    const e = window.__engine();
    const vs = e.vines.filter((v) => v.vineType !== 'tree_climb');
    for (const v of vs) v.mossy = true;
    e.proto.cast ??= { kinds: [], traps: [] };
    e.startCast?.();
    const v = vs.sort((a, b) => a.x - b.x)[0];
    const p = e.player;
    p.x = v.x; p.y = v.bottomY - 20; p.vx = 0; p.vy = -60; p.grounded = false;
    e.input.state.up = true;
    let diff = '?';
    try { diff = localStorage.getItem('sloth_difficulty') || '(unset: Normal)'; } catch {}
    return { stage: e.currentStage.config?.id, diff, lianas: vs.length, v: { x: v.x, top: v.topY, bottom: v.bottomY } };
  });
  console.log(tag, 'liana', JSON.stringify(lia));
  await sleep(250);
  await page.evaluate(() => { window.__engine().input.state.up = false; });
  await sleep(1400);
  const s1 = await page.evaluate(() => { const e = window.__engine(), p = e.player; return { swinging: !!p.isVineSwinging, x: Math.round(p.x), moss: e.cast ? +e.cast.calmNow(e.easy).toFixed(2) : -1 }; });
  await stamp(`MOSSY LIANA (Spanish moss on it), Pokey holding it | ${tag} | built ${lia.stage} (${lia.diff}) every liana marked mossy | t-eng-e2@${sha} | swinging ${s1.swinging}, moss ${s1.moss}`);
  await page.screenshot({ path: path.join(out, `${tag}-h1-mossy-liana.png`) });
  console.log(tag, 'h1', JSON.stringify(s1));
  // --- 1-3: hanging moss tied on its shimmy rope; he hangs in it
  await page.evaluate(() => window.__play('1-3'));
  await sleep(5000);
  const rope = await page.evaluate(() => {
    const e = window.__engine();
    const r = (e.ropes ?? [])[0];
    if (!r) return null;
    const x0 = r.x0;
    const ry = r.y;
    const mid = x0 + 140;
    e.proto.bushes = [...(e.proto.bushes ?? []), { x: mid - 86, w: 173, y: ry + 4, kind: 'mossHang', hanging: true }, { x: mid + 150, w: 78, y: ry + 4, kind: 'mossHang', hanging: true }];
    const p = e.player;
    p.x = mid; p.y = ry + 100; p.vx = 0; p.vy = -300; p.grounded = false;
    e.input.state.up = true;
    return { r: JSON.stringify(r).slice(0, 160), mid, ry };
  });
  console.log(tag, 'rope', JSON.stringify(rope));
  await sleep(400);
  await page.evaluate(() => { window.__engine().input.state.up = false; });
  await sleep(1500);
  const s2 = await page.evaluate(() => { const e = window.__engine(), p = e.player; return { hanging: !!p.hanging, x: Math.round(p.x), y: Math.round(p.y), moss: e.cast ? +e.cast.calmNow(e.easy).toFixed(2) : -1 }; });
  await stamp(`HANGING MOSS tied on 1-3's rope (the drape and the curtain), Pokey hanging in it | ${tag} | t-eng-e2@${sha} | hanging ${s2.hanging}, x ${s2.x}`);
  await page.screenshot({ path: path.join(out, `${tag}-h2-hanging-moss.png`) });
  console.log(tag, 'h2', JSON.stringify(s2));
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch {}
await sleep(1000);
process.exit(0);
