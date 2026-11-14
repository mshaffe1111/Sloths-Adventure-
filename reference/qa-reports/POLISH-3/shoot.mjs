// POLISH-3 stills + one clip: real game (vite dev on <root>), difficulty set the game's way (localStorage sloth_difficulty) and the BUILT
// setting printed from the engine (D62). Pokey pinned on the standable piece nearest x, or (clip) set on a piece's end and walked off it.
//   node shoot.mjs <root> <outDir> <tag> <spots: setting@orient@layout@x,...> [port] [--clip]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/user/Sloths-Adventure-/package.json')('playwright');
const [root, outDir, tag, spotArg, portArg] = process.argv.slice(2);
const clip = process.argv.includes('--clip');
const port = Number(portArg || 5231);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = process.env.NOSPAWN ? { kill() {}, stdout: { on() {} } } : spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = ''; vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !process.env.NOSPAWN && !/Local:|ready in/.test(vout); i++) await sleep(500);
console.log('server up');
const browser = await chromium.launch();
for (const spot of spotArg.split(',')) {
  const [setting, orient, layout, xs] = spot.split('@');
  const vp = orient === 'up' ? { width: 412, height: 915 } : { width: 915, height: 412 };
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: clip ? 1 : 2, isMobile: true, hasTouch: true, ...(clip ? { recordVideo: { dir: outDir, size: vp } } : {}) });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((s) => { try { localStorage.setItem('sloth_difficulty', s); } catch {} }, setting);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?layout=${layout}&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  console.log('page has __play'); await sleep(1500);
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) { await page.evaluate(() => window.__play('1-1')); await sleep(4000); ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); }); }
  if (!ok) { console.log(spot, 'NO STAGE'); await ctx.close(); continue; }
  const info = await page.evaluate(([x, clip]) => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const plats = (e.currentStage.platforms || []).filter((p) => p.type === 'solid' && p.width >= 40 && !p.broken);
    const p = plats.sort((a, b) => Math.abs(a.x + a.width / 2 - x) - Math.abs(b.x + b.width / 2 - x))[0];
    const built = { easy: !!e.easy, seed: e.currentStage.gen2?.seed, soft: (e.currentStage.heartFalls || []).filter((z) => z.soft).map((z) => `${z.x0}..${z.x1}`).join(' ') };
    if (clip) {
      // (set on the piece nearest x, at its right end, facing right; the thumb holds right: he walks off into the hole)
      const q = e.player; q.x = p.x + p.width - 30; q.y = p.y - (q.height || 40); q.vx = 0; q.vy = 0;
      return { at: { x: Math.round(p.x + p.width), y: p.y, id: p.id }, built };
    }
    // (set down once on the piece and left to stand: no per-frame pin, so he stands, not hangs mid-jump)
    { const q = e.player; q.x = Math.round(p.x + p.width / 2); q.y = p.y - (q.height || 40) - 2; q.vx = 0; q.vy = 0; }
    return { at: { x: Math.round(p.x + p.width / 2), y: p.y, id: p.id }, built };
  }, [Number(xs), clip]);
  const name = `1-1-L${layout}-${setting}-${orient === 'up' ? 'upright' : 'sideways'}-x${xs}-${tag}`;
  console.log(name, 'BUILT', JSON.stringify(info.built), 'at', JSON.stringify(info.at));
  if (clip) {
    const box = vp.width; await sleep(600);
    await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; e.input.keys ? (e.input.keys.right = true) : null; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' })); });
    const xsSeen = [];
    for (let i = 0; i < 16; i++) { await sleep(250); xsSeen.push(await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return `${Math.round(e.player.x)},${Math.round(e.player.y)}`; })); if (i === 3) await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', code: 'ArrowRight' }))); }
    console.log('path', xsSeen.join(' '));
    const v = page.video(); await ctx.close(); const vf = await v.path(); fs.renameSync(vf, path.join(outDir, `${name}.webm`)); console.log('clip', name);
    continue;
  }
  await sleep(2500);
  console.log('shooting'); await page.screenshot({ path: path.join(outDir, `${name}.png`), timeout: 60000, caret: 'initial' }).catch((e) => console.log('shot failed', e.message.slice(0, 150))); console.log('shot', name);
  await Promise.race([ctx.close(), sleep(5000)]);
}
vite.kill(); process.exit(0);
