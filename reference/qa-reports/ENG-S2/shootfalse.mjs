/**
 * ENG-S2: the FALSE liana on the REAL game (dev page, the engine's own catch, piece loop and let-go: no mock). On a stage with a liana
 * (6-3), a false liana (Vine.snake route 'still': the brown snake hanging stiff, 150 px (1.3x its ship size), never sweeping) is hung 260 px past the first
 * liana, a moss ledge under both. He is put in the air moving toward it, so the ENGINE catches it; it startles.
 *   node reference/qa-reports/ENG-S2/shootfalse.mjs <sha> [stage] [port]
 * Stills per phone: the disguise beside a real liana; the startle (he hops off); the snake on the moss slithering off; gone.
 * NOTE: the vine is added after the stage started, so the engine's own liana lists (drawnVines etc., made at the stage start) never held
 * it: these shots do not exercise the engine's false-liana draw filter (named in REPORT).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [sha = '?', stageArg = '6-3', portArg] = process.argv.slice(2);
const port = Number(portArg || 5233);
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
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  await page.evaluate((id) => window.__play(id), stageArg);
  await sleep(5000);
  const set = await page.evaluate(async () => {
    const art = await import('/src/game/vineSnakeArt.ts');
    art.vineSnakeArtReady();
    const e = window.__engine();
    const st = e.currentStage;
    const sv = e.vines.find((v) => v.vineType === 'swing_liana' && (v.swingAmp ?? 0) > 0);
    const fl = { id: 99997, x: sv.x + 260, topY: sv.topY, bottomY: sv.topY + 150, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true, swingAmp: 0, snake: { route: 'still' } };
    e.vines.push(fl);
    if (st.vines !== e.vines) st.vines.push(fl);
    const moss = { id: 99998, x: sv.x - 260, y: sv.bottomY + 140, width: 900, height: 200, type: 'solid' };
    e.platforms = e.platforms.filter((p) => !(p.x < moss.x + moss.width && p.x + p.width > moss.x && p.y > sv.topY && p.y < moss.y + 40));
    if (st.platforms) st.platforms = e.platforms;
    e.platforms.push(moss);
    e.startPieces();
    window.__fl = fl;
    const p = e.player;
    Object.assign(p, { x: fl.x - 150, y: moss.y, vx: 0, vy: 0, grounded: true, facing: 1 });
    let diff = '?';
    try { diff = localStorage.getItem('sloth_difficulty') || '(unset: Normal)'; } catch {}
    return { stage: st.config?.id ?? '', diff, easy: !!e.easy, pieces: e.pieces.map((q) => q.kind) };
  });
  const stamp = async (t) => page.evaluate((t) => { let d = document.getElementById('__lab'); if (!d) { d = document.createElement('div'); d.id = '__lab'; Object.assign(d.style, { position: 'fixed', left: '0', right: '0', bottom: '0', background: 'rgba(0,0,0,0.72)', color: '#fff', font: '11px sans-serif', padding: '4px 6px', zIndex: 99999, pointerEvents: 'none' }); document.body.appendChild(d); } d.textContent = t; }, t);
  const lab = (what) => `${what} | ${tag} | ${set.stage} (${set.diff}${set.easy ? ', easy on' : ''}) | t-eng-s2@${sha} | false liana 150 px (brown, still) 260 px past a real liana`;
  await sleep(1200);
  await stamp(lab('THE DISGUISE: a real liana (left, swinging) and the false one (right: still, browner, head at its foot)'));
  await page.screenshot({ path: path.join(out, `false-${tag}-1-disguise.png`) });
  // (he jumps for it: put in the air beside it, moving at it, so the engine's own catch takes it)
  await page.evaluate(() => { const e = window.__engine(), fl = window.__fl, p = e.player; Object.assign(p, { x: fl.x - 40, y: fl.topY + 170, vx: 200, vy: -20, grounded: false, facing: 1 }); });
  let got = null;
  for (let i = 0; i < 200 && !got; i++) {
    const s = await page.evaluate(() => { const e = window.__engine(); const sn = e.pieces.find((q) => q.kind === 'vine-snake'); const st = sn?.startled?.find((x) => x); return { letGos: sn?.letGos ?? 0, off: !!window.__fl.off, vy: Math.round(e.player.vy), st: st ? { floor: st.floor, t: +st.t.toFixed(2) } : null }; });
    if (s.letGos > 0) got = s;
    else await sleep(10);
  }
  console.log(tag, JSON.stringify(set), 'startle', JSON.stringify(got));
  await stamp(lab(`THE STARTLE: he took it, it startles; he hops off (vy ${got?.vy}), it drops with him`));
  await page.screenshot({ path: path.join(out, `false-${tag}-2-startle.png`) });
  for (let i = 0; i < 200; i++) { const f = await page.evaluate(() => window.__engine().pieces.find((q) => q.kind === 'vine-snake').startled.find((x) => x)?.floor ?? null); if (f !== null) break; await sleep(15); }
  await sleep(250);
  await stamp(lab('ON THE MOSS: it slithers off away from him, unhurt'));
  await page.screenshot({ path: path.join(out, `false-${tag}-3-slither.png`) });
  await sleep(1500);
  await stamp(lab('GONE (whole again when he respawns: tested)'));
  await page.screenshot({ path: path.join(out, `false-${tag}-4-gone.png`) });
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch {}
await sleep(1500);
process.exit(0);
