/**
 * BUILD-16b: how long after Pokey reaches 1-6's SEALED door does Dot's sealed line show ON SCREEN (the DOM), on the phone's default
 * setting (Normal: Tips; Easy: Help)? He walks in from 400 px before the exit's first bank (before her mark's line), holding right, goal
 * unmet. Two players: 'still' taps nothing; 'reader' taps each bubble 2 s after it shows (he has read it). The lead's ask 11:29 AM ET.
 *   node reference/qa-reports/BUILD-16b/doorwait.mjs <sha> <normal|easy> [port]
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [sha = '?', setting = 'normal', portArg] = process.argv.slice(2);
const port = Number(portArg || 5251);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = path.join(here, 'shots'); fs.mkdirSync(out, { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = ''; vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const SEALED = 'Some of her petals are still on the lianas';
for (const who of ['still', 'reader']) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((s) => { try { if (s === 'easy') localStorage.setItem('sloth_difficulty', 'easy'); else localStorage.removeItem('sloth_difficulty'); } catch {} }, setting);
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  await page.evaluate(() => window.__play('1-6'));
  const E = () => page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return { x: e.player.x, exitX: e.currentStage.exitTotemX, ok: !!e.currentStage?.config }; });
  for (let t = Date.now(); Date.now() - t < 60000; ) { if ((await E().catch(() => ({}))).ok) break; await sleep(500); }
  await sleep(4000);
  await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; const st = e.currentStage, g = st.gen2; const sec = g.sections.find((s) => s.phase === 'goal'); const x = sec.x0 - 400; const pl = e.platforms.filter((q) => q.x <= x && q.x + q.width >= x).sort((a, b) => a.y - b.y)[0]; e.player.x = x; e.player.y = pl.y - 60; e.player.vx = 0; e.input.state.right = true; });
  const t0 = Date.now(); let atDoor = null, shown = null, lastBubble = '', bubbleAt = 0; const seen = [];
  while (Date.now() - t0 < 40000 && shown === null) {
    await sleep(100);
    const s = await E();
    if (atDoor === null && s.x >= s.exitX - 45) atDoor = Date.now();
    const txt = await page.evaluate(() => document.body.innerText);
    if (txt.includes(SEALED)) { shown = Date.now(); break; }
    const b = (txt.match(/\n([^\n]{12,90})\nTap here when you've read it/) || [])[1] || '';
    if (b && b !== lastBubble) { lastBubble = b; bubbleAt = Date.now(); seen.push(`${((Date.now() - t0) / 1000).toFixed(1)}s "${b}"`); }
    if (who === 'reader' && b && Date.now() - bubbleAt > 2000) { await page.getByText("Tap here when you've read it", { exact: false }).first().click({ timeout: 800 }).catch(() => {}); bubbleAt = Date.now() + 1e9; }
  }
  await page.screenshot({ path: path.join(out, `doorwait-${setting}-${who}.jpg`), type: 'jpeg', quality: 80 });
  console.log(JSON.stringify({ sha, setting, who, atDoor_s: atDoor ? +((atDoor - t0) / 1000).toFixed(1) : null, shown_after_door_s: shown && atDoor ? +((shown - atDoor) / 1000).toFixed(1) : null, bubbles: seen }));
  await ctx.close();
}
await browser.close(); try { process.kill(-vite.pid, 'SIGTERM'); } catch {} await sleep(1000); process.exit(0);
