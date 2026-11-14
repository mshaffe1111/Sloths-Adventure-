/**
 * ENG-S1: the swing camera on the REAL game (dev page, the engine's own camera: no mock), a FAR perch at THE CAP (1-6's FAR row under
 * the lead's ruling (A): 480 px past the anchor, 130 px wide, level with the bough he leaves), pushed into a stage that has a liana.
 *   node reference/qa-reports/ENG-S1/shoot.mjs <sha> [stage] [port]
 * Per phone: a CLIP of the whole action (catch, slide to the foot, swing, the press on the glow, the flight, the landing: D63) and
 * stills at the decision (the forward sweep he presses on) and after landing. The setting is read from the GAME and printed (D62).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [sha = '?', stageArg = '6-2', portArg] = process.argv.slice(2);
const port = Number(portArg || 5219);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NEAR = 420, W = 130;
const out = path.join(here, 'shots');
fs.mkdirSync(out, { recursive: true });

const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
console.log('vite up', /Local:|ready in/.test(vout));
const browser = await chromium.launch();
const PHONES = (process.env.PHONES || '412x915,390x844,915x412').split(',').map((s) => s.split('x').map(Number));
for (const [w, h] of PHONES) {
  const tag = `${w > h ? 'sideways' : 'upright'}-${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, recordVideo: { dir: out, size: { width: w, height: h } } });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  console.log(tag, 'page ready');
  await page.evaluate((id) => window.__play(id), stageArg);
  await sleep(5000);
  const set = await page.evaluate(({ NEAR, W }) => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const sv = e.vines.find((v) => v.vineType === 'swing_liana');
    if (!sv) return { err: 'no liana' };
    const back = e.platforms.filter((p) => p.x + p.width <= sv.x + 40 && p.y > sv.topY && !p.broken).sort((a, b) => b.x + b.width - (a.x + a.width))[0];
    const far = { ...back, id: 99999, x: sv.x + NEAR, width: W };
    // (the stage's own ledges between are taken out for the shot, so the landing is this one; and a floor far below to catch a miss)
    e.platforms = e.platforms.filter((p) => !(p.x > sv.x + 40 && p.x < far.x + W + 200 && Math.abs(p.y - back.y) < 320));
    if (e.currentStage.platforms) e.currentStage.platforms = e.platforms;
    e.platforms.push(far);
    window.__far = far;
    window.__sv = sv;
    const p = e.player;
    p.x = sv.x - 30; p.y = sv.topY + 260; p.vx = 260; p.vy = 0; p.grounded = false; p.facing = 1;
    let diff = '?';
    try { diff = localStorage.getItem('sloth_difficulty') || '(unset: Normal)'; } catch {}
    return { stage: e.currentStage.config?.id ?? e.currentStage.id ?? '', diff, easy: !!e.easyMode, sv: { x: Math.round(sv.x), top: Math.round(sv.topY), len: Math.round(sv.bottomY - sv.topY) }, far: { x: Math.round(far.x), y: Math.round(far.y), w: W } };
  }, { NEAR, W });
  if (set.err) { console.log(tag, set.err); await ctx.close(); continue; }
  for (let k = 0; k < 6; k++) {
    await sleep(400);
    if (await page.evaluate(() => !!window.__engine().player.isVineSwinging)) break;
    await page.evaluate(() => { const e = window.__engine(), sv = window.__sv, p = e.player; p.x = sv.x - 30; p.y = sv.topY + 260; p.vx = 260; p.vy = 0; p.grounded = false; p.facing = 1; });
  }
  const usual = await page.evaluate(() => window.__engine().roomUsual);
  console.log(tag, 'set', JSON.stringify(set), 'swinging', await page.evaluate(() => !!window.__engine().player.isVineSwinging));
  // down to the foot (straight down on a vine always climbs)
  await page.evaluate(() => { window.__engine().input.state.down = true; });
  await sleep(1800);
  await page.evaluate(() => { const e = window.__engine(); e.input.state.down = false; e.input.state.right = true; });
  // the decision: a forward sweep, past the second one (the ease has settled), at the press the cap is figured on
  const view = async () => page.evaluate((usual) => {
    const e = window.__engine(), c = e.camera, p = e.player, far = window.__far, sv = window.__sv;
    const a = sv.swingAngle ?? 0, amp = sv.swingAmp ?? 0.45;
    return { a: +(a / amp).toFixed(2), om: Math.sign(p.swingAngularVelocity ?? 0), swinging: !!p.isVineSwinging, grounded: !!p.grounded, x: Math.round(p.x), y: Math.round(p.y),
      zoom: +(e.zoom).toFixed(3), size: Math.round((100 * e.zoom) / usual), vw: Math.round(c.viewportWidth), vh: Math.round(c.viewportHeight), cx: Math.round(c.x), cy: Math.round(c.y),
      whole: far.x >= c.x && far.x + far.width <= c.x + 0.98 * c.viewportWidth, onPerch: !!p.grounded && Math.abs(p.y - far.y) < 4 && p.x > far.x && p.x < far.x + far.width };
  }, usual);
  let sweeps = 0, prevOm = 0, got = null;
  for (let i = 0; i < 600 && !got; i++) {
    const v = await view();
    if (v.om > 0 && prevOm <= 0) sweeps++;
    prevOm = v.om;
    // (the first frame of the sweep from which gen2 counts a press as seeing the perch: cameraFollow.ts SWING_SEEN, 471 px ahead of him)
    if (sweeps >= 2 && v.om > 0 && v.a <= 0.9 && v.x + 471 >= set.far.x + W) got = v;
    else await sleep(16);
  }
  const label = (what, v) => `${what} | ${tag} | ${set.stage} (${set.diff}${set.easy ? ', easy on' : ''}) | t-eng-s1@${sha} | liana ${set.sv.len} px, held at the foot | FAR perch ${NEAR} px past the anchor, ${W} wide (THE CAP) | view ${v.vw} px of world, Pokey ${v.size}% size, perch whole in view: ${v.whole ? 'YES' : 'NO'}`;
  const stamp = async (t) => page.evaluate((t) => { let d = document.getElementById('__lab'); if (!d) { d = document.createElement('div'); d.id = '__lab'; Object.assign(d.style, { position: 'fixed', left: '0', right: '0', bottom: '0', background: 'rgba(0,0,0,0.72)', color: '#fff', font: '11px sans-serif', padding: '4px 6px', zIndex: 99999, pointerEvents: 'none' }); document.body.appendChild(d); } d.textContent = t; }, t);
  if (got) {
    await stamp(label('THE DECISION (forward sweep, the glow)', got));
    await page.screenshot({ path: path.join(out, `${tag}-1-decision.png`) });
    // the press on the glow, as a player's: the jump key (inputEngine's own press; the right arrow held, the way he leaps)
    await page.evaluate(() => { window.__engine().input.state.right = false; });
    await page.keyboard.down('ArrowRight');
    await page.keyboard.down('Space');
    await sleep(160);
    await page.keyboard.up('Space');
    await sleep(500);
    await page.keyboard.up('ArrowRight');
    await sleep(2200);
    const after = await view();
    await stamp(label(`AFTER THE LEAP: ${after.onPerch ? 'ON THE PERCH' : 'MISSED'}`, after));
    await page.screenshot({ path: path.join(out, `${tag}-2-after.png`) });
    console.log(tag, JSON.stringify(set), 'decision', JSON.stringify(got), 'after', JSON.stringify(after));
  } else console.log(tag, 'never reached the decision sweep', JSON.stringify(await view()));
  await sleep(600);
  const vid = page.video();
  await ctx.close();
  if (vid) fs.renameSync(await vid.path(), path.join(out, `${tag}-clip.webm`));
}
await browser.close();
vite.kill();
