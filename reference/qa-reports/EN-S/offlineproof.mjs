// EN-S's browser proof, on the BUILT game as it ships (BASE_PATH=/Sloths-Adventure-/ npx vite build, served by `vite preview` under that
// base): the game is now a set of layered static files (tools/perf/chunkplan.mjs). Proved here:
// 1. Online, first visit: the page loads with no error; the service worker installs and its cache holds EVERY script in dist/assets.
// 2. OFFLINE, a cold start for each stage in the list (one from each of the 10 worlds, by the game's own ?autostart=1&level= link, on a
//    finished save so every world is open): the stage is reached and drawn, no page error, no failed request, and every script was
//    answered by the service worker.
//   node reference/qa-reports/EN-S/offlineproof.mjs [--dist dist] [--port 4191] [--view 390x844] [--stages 1-1,2-1,...] [--shots <dir>]
// (--view 844x390 for sideways). Exit 1 on any miss.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const dist = path.resolve(arg('--dist', 'dist'));
const port = Number(arg('--port', '4191'));
const BASE = process.env.BASE_PATH || '/Sloths-Adventure-/';
const shots = path.resolve(arg('--shots', 'reference/qa-reports/EN-S/stills'));
const stages = arg('--stages', '1-1,2-1,3-1,4-1,5-1,6-1,7-1,8-1,9-1,10-1').split(',');
const base = `http://localhost:${port}${BASE}`;
fs.mkdirSync(shots, { recursive: true });
const fails = [];
const hold = (ok, line) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${line}`); if (!ok) fails.push(line); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const scripts = fs.readdirSync(path.join(dist, 'assets')).filter((f) => f.endsWith('.js'));
const sw = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8');
hold(scripts.every((f) => sw.includes(`assets/${f}`)), `sw.js precaches all ${scripts.length} scripts in dist/assets`);

const server = spawn(process.execPath, [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--outDir', dist, '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, BASE_PATH: BASE } });
let out = '';
server.stdout.on('data', (d) => { out += d; });
server.stderr.on('data', (d) => { out += d; });
const plain = () => out.replace(/\x1b\[[0-9;]*m/g, '');
for (let i = 0; i < 120 && !/Local:/.test(plain()); i++) await sleep(250);
if (!/Local:/.test(plain())) { server.kill(); console.log('offlineproof: FAIL: vite preview did not start\n' + out); process.exit(1); }

const [vw, vh] = arg('--view', '390x844').split('x').map(Number);
const side = vw > vh ? 'sideways' : 'upright';
const VIEW = { viewport: { width: vw, height: vh }, deviceScaleFactor: 1, hasTouch: true, isMobile: true };
async function canvasDrawn(page) {
  return page.evaluate(() => {
    const c = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
    if (!c) return false;
    try {
      const x = document.createElement('canvas'); x.width = 64; x.height = 64;
      const g = x.getContext('2d'); g.drawImage(c, 0, 0, 64, 64);
      const d = g.getImageData(0, 0, 64, 64).data; const seen = new Set();
      for (let i = 0; i < d.length; i += 4) seen.add((d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4));
      return seen.size > 8;
    } catch { return true; }
  });
}
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext(VIEW);
  // ── 1. online, first visit ──
  {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base, { waitUntil: 'load' });
    await page.locator('.ttl-leaf').first().waitFor({ state: 'visible', timeout: 90000 });
    let active = false, cached = 0;
    for (let i = 0; i < 240 && !(active && cached === scripts.length); i++) {
      active = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
      cached = await page.evaluate(async (names) => { const urls = []; for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) urls.push(r.url); return names.filter((n) => urls.some((u) => u.includes(`assets/${n}`))).length; }, scripts);
      await sleep(500);
    }
    hold(active, 'online: the service worker is active');
    hold(cached === scripts.length, `online: the cache holds every script (${cached} of ${scripts.length})`);
    hold(errors.length === 0, `online: the title loads with no page error (${errors.join(' | ') || 'none'})`);
    await page.screenshot({ path: path.join(shots, `online-${side}-title.png`) });
    // a finished save, so every world's stages open (the same keys as tools/perf/clipcheck.mjs's 'done' save)
    await page.evaluate(() => {
      const L = localStorage;
      L.setItem('sloth_howto_seen', '1'); L.setItem('sloth_coach_done', '1'); L.setItem('sloth_difficulty', 'normal');
      for (let w = 1; w <= 10; w++) { for (let m = 1; m <= 10; m++) L.setItem(`sloth_lvl_${w}-${m}`, JSON.stringify({ completed: true, stars: 3, highScore: 3000, bestTime: 150 })); L.setItem(`sloth_story_w${w}`, '1'); }
    });
    await page.close();
  }
  // ── 2. offline, a cold start into a stage of each world ──
  await ctx.setOffline(true);
  for (const id of stages) {
    const page = await ctx.newPage();
    const errors = [], failed = [], js = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('requestfailed', (r) => failed.push(r.url().replace(base, '')));
    page.on('response', (r) => { if (/assets\/.*\.js$/.test(r.url())) js.push({ f: r.url().split('/').pop(), status: r.status(), sw: r.fromServiceWorker() }); });
    await page.goto(`${base}?autostart=1&level=${id}`, { waitUntil: 'load' });
    const t0 = Date.now();
    let hud = false, drawn = false;
    while (Date.now() - t0 < 90000 && !drawn) {
      hud = hud || (await page.evaluate(() => !!document.querySelector('.vh-menu')));
      if (!hud) {
        // (a world's story or a guardian's card on the way in: skipped or answered, as a player would)
        for (const sel of ['.ui-chip-btn:has-text("SKIP")', '[data-start="true"]']) { const b = page.locator(sel).first(); if (await b.count()) await b.evaluate((e) => e.click()).catch(() => {}); }
      } else drawn = (await page.evaluate(() => !document.querySelector('.sv-iris'))) && (await canvasDrawn(page));
      if (!drawn) await sleep(150);
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    await sleep(2500);
    await page.screenshot({ path: path.join(shots, `offline-${side}-${id}.png`) });
    hold(drawn, `offline ${side} ${id}: the stage is reached and drawn (${secs} s; still offline-${side}-${id}.png)`);
    hold(js.length >= 10 && js.every((s) => s.status === 200 && s.sw), `offline ${side} ${id}: all ${js.length} scripts were answered by the service worker`);
    hold(errors.length === 0, `offline ${side} ${id}: no page error (${errors.join(' | ') || 'none'})`);
    hold(failed.length === 0, `offline ${side} ${id}: no failed request (${failed.slice(0, 4).join(', ') || 'none'})`);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(fails.length ? `offlineproof: FAIL (${fails.length})\n  ${fails.join('\n  ')}` : 'offlineproof: PASS');
process.exit(fails.length ? 1 : 0);
