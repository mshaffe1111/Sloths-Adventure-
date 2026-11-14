/**
 * A1 SWING-W1 mock-up for Matt (the lead, 11:24 PM ET): a FAR swing on 1-6-like geometry, the real game (dev page), frozen at the
 * same moment of his swing (from the foot, swinging forward, at the let-go), (a) today's view, (b) the view eased out 1.5x.
 *   node reference/qa-reports/A1-SWING/mock/mock.mjs <sha> [stage] [port]
 * The stage's first liana gets a perch 540 px past its anchor, level with the bough he leaves (1-6.md's FAR gap), pushed into the
 * stage's platforms for the shot only. The setting is printed on each still.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..', '..');
const [sha = '?', stageArg = '6-2', portArg] = process.argv.slice(2);
const port = Number(portArg || 5213);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FAR = 540, WIDE = 1.5;

const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const ORIENTS = [{ id: 'upright', viewport: { width: 390, height: 844 } }, { id: 'sideways', viewport: { width: 844, height: 390 } }];
for (const o of ORIENTS) {
  for (const wide of [false, true]) {
    if (process.env.ONLY && process.env.ONLY !== `${o.id}-${wide ? 'b' : 'a'}`) continue;
    const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.route(/script\.google\.com/, (r) => r.abort());
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
    await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
    for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
    await sleep(2000);
    await page.evaluate((id) => window.__play(id), stageArg);
    await sleep(5000);
    const set = await page.evaluate(({ FAR, WIDE, wide }) => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const sv = e.vines.find((v) => v.vineType === 'swing_liana');
      if (!sv) return { err: 'no liana' };
      // the bough he leaves: the nearest platform behind the liana at about its foot
      const back = e.platforms.filter((p) => p.x + p.width <= sv.x + 40 && p.y > sv.topY && !p.broken).sort((a, b) => b.x + b.width - (a.x + a.width))[0];
      const far = { ...back, id: 99999, x: sv.x + FAR, width: 300 };
      // (the stage's own nearer ledges past the liana are taken out for the shot, so the landing is the FAR one)
      const before = e.platforms.length;
      e.platforms = e.platforms.filter((p) => !(p.x > sv.x + 40 && p.x < far.x && Math.abs(p.y - back.y) < 320));
      if (e.currentStage.platforms) e.currentStage.platforms = e.platforms;
      e.platforms.push(far);
      window.__far = far;
      window.__cut = before - e.platforms.length + 1;
      e.lives = 9;
      const p = e.player;
      p.x = sv.x - 30; p.y = sv.topY + 260; p.vx = 260; p.vy = 0; p.grounded = false; p.facing = 1;
      window.__sv = sv;
      return { stage: e.currentStage.id ?? '', sv: { x: Math.round(sv.x), top: Math.round(sv.topY), bottom: Math.round(sv.bottomY) }, back: { x: Math.round(back.x), y: Math.round(back.y), w: Math.round(back.width) }, far: { x: Math.round(far.x), y: Math.round(far.y) } };
    }, { FAR, WIDE, wide });
    if (set.err) { console.log(o.id, set.err); await ctx.close(); continue; }
    // (a slow page can miss the catch: placed again until he holds it)
    for (let k = 0; k < 6; k++) {
      await sleep(500);
      if (await page.evaluate(() => !!window.__engine().player.isVineSwinging)) break;
      await page.evaluate(() => { const e = window.__engine(), sv = window.__sv, p = e.player; p.x = sv.x - 30; p.y = sv.topY + 260; p.vx = 260; p.vy = 0; p.grounded = false; p.facing = 1; });
    }
    // down to the foot (straight down on a vine always climbs), then wait for the forward swing at the let-go
    await page.evaluate((w) => { const e = window.__engine(); e.input.state.down = true; window.__wide = w ? 1.5 : 0; }, wide);
    await sleep(1800);
    await page.evaluate(() => { const e = window.__engine(); e.input.state.down = false; e.player.facing = 1; });
    const got = await page.evaluate(async () => {
      const e = window.__engine();
      const sv = window.__sv;
      for (let i = 0; i < 400; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        const a = sv.swingAngle ?? 0, amp = sv.swingAmp ?? 0.45;
        if (e.player.isVineSwinging && a / amp > 0.78 && a / amp < 0.95) {
          e.update = () => {};
          e.stageHint = null;
          // (Dot's chase line on 1-8 is not part of the mock: hidden)
          for (const el of document.querySelectorAll('body *')) {
            if (el.children.length === 0 && /Keep moving|breaking behind/.test(el.textContent || '')) {
              // (the whole board: the widest ancestor still narrower than the screen, the Dot tab with it)
              let box = el;
              while (box.parentElement && box.parentElement !== document.body && box.parentElement.getBoundingClientRect().width < innerWidth * 0.97) box = box.parentElement;
              box.style.visibility = 'hidden';
            }
          }
          if (window.__wide) {
            // the view eased out WIDE times about him: the engine's zoom, then the aim that keeps him and the FAR landing in view (hero
            // first, as cameraFollow showBoth does), his feet at the same height on the screen
            const c = e.camera, vw0 = c.viewportWidth, vh0 = c.viewportHeight, p = e.player, far = window.__far;
            const feet = (p.y + (p.height || 40) - c.y) / vh0;
            e.revealZoom = 1 / window.__wide;
            e.applyZoom();
            const vw = c.viewportWidth, vh = c.viewportHeight;
            c.x = Math.min(p.x - 28 - 0.02 * vw, Math.max(c.x, far.x + 40 - 0.98 * vw));
            c.y = p.y + (p.height || 40) - feet * vh;
            if ('targetX' in c) { c.targetX = c.x; c.targetY = c.y; }
            window.__vw = [Math.round(vw0), Math.round(vw)];
          } else window.__vw = [Math.round(e.camera.viewportWidth)];
          return { a: +a.toFixed(3), len: Math.round(e.player.swingLength ?? 0), px: Math.round(e.player.x), swinging: true, vw: window.__vw, cut: window.__cut };
        }
      }
      return { swinging: !!e.player.isVineSwinging, len: Math.round(e.player.swingLength ?? 0) };
    });
    await sleep(500);
    const label = `${wide ? '(b) EASED OUT 1.5x' : '(a) TODAY'} ${o.id} ${o.viewport.width}x${o.viewport.height}, view ${(got.vw || []).join(' -> ')} px of world | Normal | t-a1-swing@${sha} | ${stageArg}'s liana, hold ${got.len} px down (the foot), ${got.a} rad forward | FAR perch ${FAR} px past the anchor, level with his bough (mock: pushed in, ${(got.cut ?? 1) - 1} nearer ledge(s) taken out)`;
    await page.evaluate((t) => { const d = document.createElement('div'); d.textContent = t; Object.assign(d.style, { position: 'fixed', left: '0', right: '0', bottom: '0', background: 'rgba(0,0,0,0.72)', color: '#fff', font: '11px sans-serif', padding: '4px 6px', zIndex: 99999 }); document.body.appendChild(d); }, label);
    const f = path.join(here, `${o.id}-${wide ? 'b-wide' : 'a-today'}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f, JSON.stringify(set), JSON.stringify(got));
    await ctx.close();
  }
}
await browser.close();
vite.kill();
