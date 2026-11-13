// EN-S: does the split slow the start? Two built games (each BASE_PATH=/Sloths-Adventure-/ npx vite build), each served by `vite
// preview`; Chromium with the CPU slowed 4x (as buildcheck.mjs), a phone-sized page. For each, N cold starts (a fresh context: no
// cache, no service worker) and N warm starts (the service worker's cache answers, as on a player's second visit), turn about so
// neither build gets the quiet half of the machine. Timed: navigation start to the title's first leaf button on screen (.ttl-leaf),
// and the page's own first-contentful-paint. Prints the medians.
//   node reference/qa-reports/EN-S/startuptime.mjs --a <dist of main> --b <dist of the branch> [--n 7]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = process.env.BASE_PATH || '/Sloths-Adventure-/';
const N = Number(arg('--n', '7'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const builds = [{ name: 'main', dist: path.resolve(arg('--a')), port: 4195 }, { name: 'split', dist: path.resolve(arg('--b')), port: 4196 }];
const servers = [];
for (const b of builds) {
  const s = spawn(process.execPath, [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--outDir', b.dist, '--port', String(b.port), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, BASE_PATH: BASE } });
  let out = ''; s.stdout.on('data', (d) => { out += d; }); s.stderr.on('data', (d) => { out += d; });
  for (let i = 0; i < 120 && !/Local:/.test(out.replace(/\x1b\[[0-9;]*m/g, '')); i++) await sleep(250);
  servers.push(s);
  b.url = `http://localhost:${b.port}${BASE}`;
  b.cold = []; b.warm = []; b.coldFcp = []; b.warmFcp = [];
}
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const browser = await chromium.launch();
const VIEW = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true };
async function start(ctx, url) {
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(url, { waitUntil: 'commit' });
  await page.locator('.ttl-leaf').first().waitFor({ state: 'visible', timeout: 120000 });
  const t = await page.evaluate(() => ({ now: performance.now(), fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? -1 }));
  await page.close();
  return t;
}
try {
  for (let i = 0; i < N; i++) {
    for (const b of i % 2 ? [...builds].reverse() : builds) {
      const ctx = await browser.newContext(VIEW);
      const cold = await start(ctx, b.url);
      b.cold.push(cold.now); b.coldFcp.push(cold.fcp);
      // (the service worker takes the page and fills its cache; then a second visit)
      const p = await ctx.newPage();
      await p.goto(b.url);
      for (let k = 0; k < 120 && !(await p.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated' && (await caches.keys()).length > 0)); k++) await sleep(250);
      await sleep(1500);
      await p.close();
      const warm = await start(ctx, b.url);
      b.warm.push(warm.now); b.warmFcp.push(warm.fcp);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  for (const s of servers) s.kill();
}
const r = (x) => Math.round(x);
for (const b of builds) console.log(`${b.name.padEnd(6)} cold: title ${r(median(b.cold))} ms (fcp ${r(median(b.coldFcp))}) [${b.cold.map(r).join(' ')}]   warm: title ${r(median(b.warm))} ms (fcp ${r(median(b.warmFcp))}) [${b.warm.map(r).join(' ')}]`);
const [a, b] = builds;
console.log(`split - main: cold ${r(median(b.cold) - median(a.cold))} ms, warm ${r(median(b.warm) - median(a.warm))} ms (4x CPU slow-down, medians of ${N})`);
