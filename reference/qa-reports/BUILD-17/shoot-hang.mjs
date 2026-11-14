/**
 * BUILD-17 Step 0 redo 2 (from ENG-E2's shooter): him actually HANGING in the hanging moss and SWINGING on the mossy liana, the state printed
 * from the game in every caption (D69: a still proves only what you can see in it).
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
const port = Number(portArg || 5241);
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
  // (the game's own catch: canGrabSwing(x, y, v, clock), physics.ts; each try he is put where the swinging liana's hands are now, up held)
  for (let i = 0; i < 120 && !(await page.evaluate(() => !!window.__engine().player.isVineSwinging)); i++) {
    await page.evaluate(async () => {
      const e = window.__engine(), p = e.player, ph = await import('/src/game/physics.ts');
      const v = e.vines.filter((q) => q.vineType !== 'tree_climb' && q.mossy).sort((a, b) => a.x - b.x)[0];
      for (let y = v.bottomY - 10; y > v.topY + 60; y -= 6) for (let dx = -200; dx <= 200; dx += 4) {
        if (ph.canGrabSwing(v.x + dx, y, v, e.vineClock)) { p.x = v.x + dx; p.y = y; p.vx = 30; p.vy = 0; p.grounded = false; e.input.state.up = true; return; }
      }
    });
    await sleep(20);
  }
  await page.evaluate(() => { window.__engine().input.state.up = false; });
  await sleep(1400);
  const s1 = await page.evaluate(() => { const e = window.__engine(), p = e.player; return { swinging: !!p.isVineSwinging, x: Math.round(p.x), moss: e.cast ? +e.cast.calmNow(e.easy).toFixed(2) : -1 }; });
  await stamp(`MOSSY LIANA (Spanish moss on it), Pokey holding it | ${tag} | built ${lia.stage} (${lia.diff}) every liana marked mossy | t-build-17@${sha} | isVineSwinging ${s1.swinging}, calmNow ${s1.moss}`);
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
    e.proto.cast ??= { kinds: [], traps: [] };
    e.startCast?.();
    // (a rope is hung on only with the shimmy skill learned, engine.ts updateRope: 1-3 teaches it, so a fresh save has it from 1-3 on)
    e.skills.add('shimmy');
    const p = e.player;
    // (the game's own catch, engine.ts ~:5390: his hands, p.y - HAND_REACH 70, within ry-12..ry+30 while rising or with Up held)
    const at = r.y;
    p.x = mid; p.y = at + 70 + 6; p.vx = 0; p.vy = 0; p.grounded = false;
    e.input.state.up = true;
    return { r: JSON.stringify(r).slice(0, 160), mid, ry };
  });
  for (let i = 0; i < 80 && !(await page.evaluate(() => !!window.__engine().player.hanging)); i++) {
    await page.evaluate(async ({ mid }) => {
      const e = window.__engine(), p = e.player, rm = await import('/src/game/rope.ts');
      const r = e.ropes[0];
      if (!p.hanging) { p.x = mid; p.y = rm.ropeYAt(r, mid) + rm.HAND_REACH + 4; p.vy = 0; p.vx = 0; p.grounded = false; e.input.state.up = true; }
    }, rope);
    await sleep(20);
  }
  console.log(tag, 'rope', JSON.stringify(rope));
  await page.evaluate(() => { window.__engine().input.state.up = false; });
  await sleep(1500);
  // (Dot's box: tapped away the way a player does, on the card itself (DotGuide.tsx .dg-bub onClick), until none shows)
  const dotShown = () => page.evaluate(() => [...document.querySelectorAll('.dg-bub')].some((b) => { const r = b.getBoundingClientRect(); return r.width > 20 && r.height > 20 && getComputedStyle(b).opacity !== '0' && getComputedStyle(b).visibility !== 'hidden'; }));
  for (let i = 0; i < 8 && (await dotShown()); i++) {
    try { await page.locator('.dg-bub').first().click({ timeout: 1500, force: true }); } catch {}
    await sleep(900);
  }
  const dotBox = (await dotShown()) ? 'SHOWN' : 'dismissed';
  const s2 = await page.evaluate(() => { const e = window.__engine(), p = e.player; return { hanging: !!p.hanging, x: Math.round(p.x), y: Math.round(p.y), moss: e.cast ? +e.cast.calmNow(e.easy).toFixed(2) : -1 }; });
  await stamp(`HANGING MOSS tied on 1-3's rope (the drape and the curtain), Pokey hanging in it | ${tag} | t-build-17@${sha} | hanging ${s2.hanging}, calmNow ${s2.moss}, Dot's box ${dotBox}, x ${s2.x}`);
  await page.screenshot({ path: path.join(out, `${tag}-h2-hanging-moss.png`) });
  console.log(tag, 'h2', JSON.stringify({ ...s2, dotBox }));
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch {}
await sleep(1000);
process.exit(0);
