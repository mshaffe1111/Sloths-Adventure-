// R-165.112's browser proof, on the BUILT game (npx vite build, served by `npx vite preview`): 1-1's proven seed list is its own chunk,
// the service worker precaches it, and a Play from a cold OFFLINE start draws from it; and a load that fails still starts the stage.
//   node reference/qa-reports/R-165.112/offlineproof.mjs [--dist dist] [--port 4189] [--shots reference/qa-reports/R-165.112/stills]
// 1. Online, first visit: the page loads; the service worker installs and its cache holds assets/seeds-1-1-*.js. The page is closed.
// 2. OFFLINE, a new page (a cold start): title -> World Map -> Play on 1-1 (through the world's story) -> the stage runs. Held: the
//    list chunk was answered by the service worker; the device's shuffled order (localStorage sloth_play11_order) was written with the
//    list's own length (only the loaded list knows it) and one entry played; the seed drawn is on the list file in dist.
// 3. A fresh browser, no service worker, the list chunk's request FAILED (aborted): Play still starts 1-1 (the stand-in), no order is
//    written (nothing drawn from a list that never came), and the load was tried.
// Exit 1 on any miss.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
// (playwright is installed globally in the container: require() finds it through NODE_PATH, an ESM import does not)
const { chromium } = createRequire(import.meta.url)('playwright');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const dist = path.resolve(arg('--dist', 'dist'));
const port = Number(arg('--port', '4189'));
const shots = path.resolve(arg('--shots', 'reference/qa-reports/R-165.112/stills'));
const base = `http://localhost:${port}`;
fs.mkdirSync(shots, { recursive: true });
const fails = [];
const hold = (ok, line) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${line}`); if (!ok) fails.push(line); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// the list as built: the chunk's file, its seeds
const chunk = fs.readdirSync(path.join(dist, 'assets')).find((f) => /^seeds-1-1-.*\.js$/.test(f));
if (!chunk) { console.log(`offlineproof: FAIL: no assets/seeds-1-1-*.js in ${dist}`); process.exit(1); }
const chunkText = fs.readFileSync(path.join(dist, 'assets', chunk), 'utf8');
const seeds = JSON.parse(`[${/seeds:\s*\[([\d,\s]+)\]/.exec(chunkText)?.[1] ?? /"seeds":\s*\[([\d,\s]+)\]/.exec(chunkText)?.[1] ?? ''}]`);
const main = fs.readdirSync(path.join(dist, 'assets')).find((f) => /^index-.*\.js$/.test(f));
console.log(`built: assets/${chunk} ${fs.statSync(path.join(dist, 'assets', chunk)).size} B, ${seeds.length} seeds; assets/${main} ${fs.statSync(path.join(dist, 'assets', main)).size} B`);
hold(seeds.length > 0, `the list chunk holds seeds (${seeds.length})`);
hold(!/w1-home-banks\.\w\./.test(fs.readFileSync(path.join(dist, 'assets', main), 'utf8')) && !fs.readFileSync(path.join(dist, 'assets', main), 'utf8').includes(chunkText.slice(200, 400)), 'the main script holds no packed plan of the list');
hold(fs.readFileSync(path.join(dist, 'sw.js'), 'utf8').includes(`assets/${chunk}`), `sw.js precaches assets/${chunk}`);

const server = spawn('npx', ['vite', 'preview', '--outDir', dist, '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let out = '';
server.stdout.on('data', (d) => { out += d; });
server.stderr.on('data', (d) => { out += d; });
for (let i = 0; i < 120 && !/Local:/.test(out); i++) await sleep(250);
if (!/Local:/.test(out)) { console.log('offlineproof: FAIL: vite preview did not start\n' + out); process.exit(1); }

const VIEW = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true };
const click = async (page, sel) => { await page.locator(sel).first().waitFor({ state: 'attached', timeout: 30000 }); await page.locator(sel).first().evaluate((e) => e.click()); };
/** title -> World Map -> (a fresh save's setting) -> 1-1's card -> Play -> through the story -> the stage's canvas drawing */
async function playOneOne(page, tag) {
  await page.locator('.ttl-leaf').first().waitFor({ state: 'visible', timeout: 60000 });
  await click(page, '.ttl-leaf >> nth=0');
  await page.locator('.mp-normal, .wm-play').first().waitFor({ timeout: 15000 });
  if (await page.locator('.mp-normal').count()) await click(page, '.mp-normal');
  await page.locator('.wm-play').waitFor({ timeout: 15000 });
  await sleep(1500);
  await page.screenshot({ path: path.join(shots, `${tag}-1-card.png`) });
  await click(page, '.wm-play');
  // the world's story (first visit) is skipped; the stage is up when its HUD is (the menu button, .vh-menu)
  const t0 = Date.now();
  let playing = false;
  while (Date.now() - t0 < 90000 && !playing) {
    playing = await page.evaluate(() => !!document.querySelector('.vh-menu'));
    if (playing) break;
    const skip = page.locator('.ui-chip-btn:has-text("SKIP")').first();
    if (await skip.count()) await skip.evaluate((e) => e.click()).catch(() => {});
    await sleep(250);
  }
  console.log(`     ${tag}: ${((Date.now() - t0) / 1000).toFixed(1)} s from Play to the stage's HUD (the story skipped)`);
  // (the stage's title card, then the stage itself: wait for the canvas to hold a drawn frame, then a moment of play)
  let drawn = false;
  for (let i = 0; i < 120 && !drawn; i++) { drawn = (await page.evaluate(() => !document.querySelector('.sv-iris'))) && (await canvasDrawn(page)); if (!drawn) await sleep(500); }
  await sleep(5000);
  await page.screenshot({ path: path.join(shots, `${tag}-2-stage.png`) });
  return playing && drawn;
}
/** is the stage's canvas alive: two frames a moment apart differ, or it is not blank */
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
  // ── 1. online, first visit: the service worker precaches the list chunk ──
  const ctx = await browser.newContext(VIEW);
  let page = await ctx.newPage();
  await page.goto(`${base}/?lessons=off`);
  await page.locator('.ttl-leaf').first().waitFor({ state: 'visible', timeout: 60000 });
  let cached = false;
  for (let i = 0; i < 240 && !cached; i++) {
    cached = await page.evaluate(async (name) => { for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) if (r.url.includes(name)) return true; return false; }, chunk);
    if (!cached) await sleep(500);
  }
  hold(cached, `online: the service worker's cache holds assets/${chunk}`);
  let active = false;
  for (let i = 0; i < 240 && !active; i++) {
    active = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
    if (!active) await sleep(500);
  }
  hold(active, 'online: the service worker is installed and active (its whole precache is in)');
  await page.close();

  // ── 2. offline, a cold start: Play draws from the list ──
  await ctx.setOffline(true);
  page = await ctx.newPage();
  const seen = [];
  const errors = [];
  page.on('response', (r) => { if (r.url().includes('seeds-1-1')) seen.push({ status: r.status(), sw: r.fromServiceWorker() }); });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(`${base}/?lessons=off`);
  hold(await page.evaluate(() => navigator.onLine === false), 'offline: the browser is offline (navigator.onLine false)');
  hold((await page.evaluate(() => localStorage.getItem('sloth_play11_order'))) === null, 'offline: no play drawn yet on this device');
  const playing = await playOneOne(page, 'offline');
  hold(playing, 'offline: Play on 1-1 reaches the stage');
  hold(await canvasDrawn(page), 'offline: the stage is drawn (still: offline-2-stage.png)');
  hold(seen.length >= 1 && seen.every((s) => s.status === 200 && s.sw), `offline: the list chunk was answered by the service worker (${JSON.stringify(seen)})`);
  const order = JSON.parse((await page.evaluate(() => localStorage.getItem('sloth_play11_order'))) ?? 'null');
  hold(!!order && order.n === seeds.length && order.order.length === seeds.length, `offline: the device's order was shuffled over the whole list (n ${order?.n}, the list ${seeds.length})`);
  hold(!!order && order.i === 1, `offline: one entry of the order is played (i ${order?.i})`);
  if (order) console.log(`     the play's seed: ${seeds[order.order[0]]} (entry ${order.order[0]} of ${seeds.length})`);
  hold(errors.length === 0, `offline: no page error (${errors.join(' | ') || 'none'})`);
  await ctx.close();

  // ── 3. the list's load FAILS (no service worker yet, its request aborted): Play still starts the stage, on the stand-in ──
  const ctx3 = await browser.newContext({ ...VIEW, serviceWorkers: 'block' });
  const p3 = await ctx3.newPage();
  let tried = 0;
  await p3.route('**/seeds-1-1-*.js', (r) => { tried++; return r.abort('failed'); });
  const errors3 = [];
  p3.on('pageerror', (e) => errors3.push(String(e).slice(0, 160)));
  await p3.goto(`${base}/?lessons=off`);
  const t0 = Date.now();
  const playing3 = await playOneOne(p3, 'failed');
  hold(playing3, `failed load: Play on 1-1 still reaches the stage (${((Date.now() - t0) / 1000).toFixed(1)} s from the title)`);
  hold(await canvasDrawn(p3), 'failed load: the stage is drawn (still: failed-2-stage.png)');
  hold(tried >= 1, `failed load: the list was asked for and its request failed (${tried} tries)`);
  hold((await p3.evaluate(() => localStorage.getItem('sloth_play11_order'))) === null, 'failed load: no order written (nothing drawn from a list that never came)');
  hold(errors3.length === 0, `failed load: no page error (${errors3.join(' | ') || 'none'})`);
  await ctx3.close();
} finally {
  await browser.close();
  server.kill();
}
console.log(fails.length ? `offlineproof: FAIL (${fails.length})\n  ${fails.join('\n  ')}` : 'offlineproof: PASS');
process.exit(fails.length ? 1 : 0);
