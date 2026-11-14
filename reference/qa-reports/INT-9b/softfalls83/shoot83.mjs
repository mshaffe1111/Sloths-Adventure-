/**
 * INT-9b: 8-3 Normal layout 2 on the REAL game (dev page, the engine's own build and draw), Pokey stood on the two log banks the
 * any-slot bank rule deepened (x 8848 w 220, x 9513 w 247; 3ad51f04/0c1d3cab), upright and sideways, so the look is judged, not a hash.
 *   node shoot83.mjs <repo root> <label> [port]     -> <this folder>/<label>-<bank>-<WxH>.png
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/user/Sloths-Adventure-/package.json')('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const [root, label, portArg] = process.argv.slice(2);
const port = Number(portArg || 5261);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const BANKS = [{ id: 'bank42', x: 8848, w: 220 }, { id: 'bank43', x: 9513, w: 247 }];
try {
  for (const [W, H] of [[412, 915], [915, 412]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    await ctx.route(/script\.google\.com/, (r) => r.abort());
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
    await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
    await page.evaluate(() => { try { localStorage.removeItem('sloth_difficulty'); } catch {} });
    await page.reload();
    for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
    await sleep(1500);
    await page.evaluate(() => window.__play('8-3', 2));
    for (let t = Date.now(); Date.now() - t < 90000; ) { if (await page.evaluate(() => typeof window.__engine === 'function' && window.__engine()?.currentStage?.config?.id === '8-3')) break; await sleep(500); }
    await sleep(2500);
    for (const b of BANKS) {
      const info = await page.evaluate((b) => {
        const e = window.__engine(), p = e.player;
        const q = e.currentStage.platforms.find((k) => Math.abs(k.x - b.x) < 1 && Math.abs(k.width - b.w) < 1);
        if (!q) return 'NO BANK; near: ' + e.currentStage.platforms.filter((k) => k.x > b.x - 400 && k.x < b.x + 400).map((k) => `${Math.round(k.x)}/${Math.round(k.y)}/${Math.round(k.width)}x${Math.round(k.height)} ${k.style}`).join(', ') + ' n=' + e.currentStage.platforms.length + ' gen2=' + !!e.currentStage.gen2;
        p.x = q.x + q.width / 2 - p.width / 2; p.y = q.y - p.height - 1; p.vx = 0; p.vy = 0; p.hp = Math.max(p.hp, 3);
        return `bank x ${q.x} y ${q.y} w ${q.width} h ${q.height} (bottom ${q.y + q.height}) style ${q.style}`;
      }, b);
      await sleep(1500);
      const where = await page.evaluate(() => { const e = window.__engine(), p = e.player; return `stage ${e.currentStage.config.id} variant 2 (__play(8-3, 2): setLayoutVariant(2), the test's variant) Normal; Pokey x ${Math.round(p.x)} y ${Math.round(p.y)} grounded ${!!p.isGrounded}`; });
      console.log(label, b.id, `${W}x${H}`, info, '|', where);
      await page.screenshot({ path: path.join(here, `${label}-${b.id}-${W}x${H}.png`) });
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  try { process.kill(-vite.pid); } catch {}
}
