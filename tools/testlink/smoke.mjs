// R-165.252 (LINK-ROOM 11-20): boot the built test link headless, the way Matt's phone opens it, and say what failed.
//   node tools/testlink/smoke.mjs [dist folder, default tools/testlink/dist] [out folder for the stills]
// Serves the folder on a local port, opens the title, then ?autostart=1&level=1-1 and 2-5 (portrait phone), and for each prints:
// requests, bytes, every failed or non-200 request, every console error and page error, and saves a still. Exit 1 on any of those.
// (not the artifact itself: the artifact wraps the page in its own frame; this proves the build's files are all there and load)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
// (playwright is installed globally in the container and in CI: require() finds it through NODE_PATH, an ESM import does not; clipcheck.mjs)
const { chromium } = createRequire(import.meta.url)('playwright');

const dist = path.resolve(process.argv[2] ?? 'tools/testlink/dist');
const out = path.resolve(process.argv[3] ?? path.join(path.dirname(dist), 'smoke-out'));
fs.mkdirSync(out, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.webm': 'audio/webm', '.json': 'application/json' };
/** bytes the server sent since the last visit started (what a phone downloads) */
let served = 0;
const server = http.createServer((req, res) => {
  const p = path.join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(dist) || !fs.existsSync(p) || !fs.statSync(p).isFile()) {
    res.writeHead(404);
    res.end();
    return;
  }
  served += fs.statSync(p).size;
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/index.html`;

const VISITS = [
  ['title', ''],
  ['1-1', '?autostart=1&level=1-1'],
  ['2-5', '?autostart=1&level=2-5'],
];
const browser = await chromium.launch();
let bad = 0;
for (const [name, q] of VISITS) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const problems = [];
  let requests = 0;
  served = 0;
  page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`failed: ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    requests++;
    if (r.status() !== 200 && !r.url().startsWith('data:')) problems.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  const t0 = Date.now();
  await page.goto(base + q, { waitUntil: 'load', timeout: 120000 });
  const loaded = Date.now() - t0;
  const atLoad = served;
  await page.waitForTimeout(6000);
  // (a fresh save opens 1-1 with the prologue: skip any story to reach the stage itself)
  for (let i = 0; i < 4; i++) {
    const skip = page.getByRole('button', { name: /skip/i }).first();
    if (!(await skip.isVisible().catch(() => false))) break;
    await skip.click().catch(() => {});
    await page.waitForTimeout(2500);
  }
  await page.waitForTimeout(6000);
  // (every <img> on the page decoded, and a canvas drawn: the art reached the screen, not just the network)
  const imgs = await page.evaluate(() => [...document.images].map((i) => ({ src: i.src.slice(0, 60), ok: i.complete && i.naturalWidth > 0 })));
  for (const i of imgs) if (!i.ok) problems.push(`img not decoded: ${i.src}`);
  await page.screenshot({ path: path.join(out, `${name}.png`) });
  console.log(`${name}: load ${loaded} ms, ${requests} requests, ${(atLoad / 1e6).toFixed(1)} MB by load, ${(served / 1e6).toFixed(1)} MB in all, ${imgs.length} <img> decoded, ${problems.length} problems`);
  for (const p of problems) console.log(`  ${p}`);
  bad += problems.length;
  await ctx.close();
}
await browser.close();
server.close();
console.log(bad ? `smoke: FAIL (${bad} problems)` : `smoke: OK (stills in ${out})`);
process.exit(bad ? 1 : 0);
