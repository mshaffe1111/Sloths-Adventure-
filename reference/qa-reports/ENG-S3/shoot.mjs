/**
 * ENG-S3 (from ENG-S2's): CAM-THREAT on the REAL game: the vine snake (dev page, the engine's own piece loop, clock, camera and let-go: no mock), on a stage with a
 * liana (6-3: no World 1 stage lays a liana until 1-6 is built). One liana gets a snake ('down-off') on a beat (off, tell 0.6 s, trip 4 s),
 * timed so its tell starts 2 s after he is on; a ledge is laid under the liana (1-6's moss) so the let-go lands.
 *   node reference/qa-reports/ENG-S2/shoot.mjs <sha> [stage] [port]        (CLIP=1: the clip pass, sampled frames joined by ffmpeg)
 * Per phone: stills at the tell, the snake above his hands, and just after he lets go; or a clip of the whole action (D63). Every label
 * prints what the GAME built (stage, difficulty from localStorage, easy flag; D62) and whether the snake's tell is in the view.
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
const port = Number(portArg || 5231);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = path.join(here, 'shots');
fs.mkdirSync(out, { recursive: true });
const clip = !!process.env.CLIP;
const HOLD = Number(process.env.HOLD || 240);

const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
console.log('vite up', /Local:|ready in/.test(vout));
const browser = await chromium.launch();
const PHONES = (process.env.PHONES || '412x915,915x412').split(',').map((s) => s.split('x').map(Number));
for (const [w, h] of PHONES) {
  const tag = `${w > h ? 'sideways' : 'upright'}-${w}x${h}-hold${HOLD}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: clip ? 1 : 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  await page.evaluate((id) => window.__play(id), stageArg);
  await sleep(5000);
  const set = await page.evaluate(async (HOLD) => {
    const { beatClock, beatDef } = await import('/src/game/beat.ts');
    const art = await import('/src/game/vineSnakeArt.ts');
    art.vineSnakeArtReady();
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const st = e.currentStage;
    const sv = e.vines.find((v) => v.vineType === 'swing_liana' && (v.swingAmp ?? 0) > 0);
    if (!sv) return { err: 'no liana' };
    // (1-6's moss under the liana: a ledge 140 px under its foot, so the let-go lands on something)
    const moss = { id: 99998, x: sv.x - 260, y: sv.bottomY + 140, width: 520, height: 200, type: 'solid' };
    e.platforms = e.platforms.filter((p) => !(p.x < moss.x + moss.width && p.x + p.width > moss.x && p.y > sv.topY && p.y < moss.y + 40));
    if (st.platforms) st.platforms = e.platforms;
    e.platforms.push(moss);
    // (its snake: down and off, a beat of 12 s: off 7.4, tell 0.6, trip 4; the tell starts 2 s from now)
    sv.snake = { route: 'down-off', clock: 'snake-shot' };
    const def = beatDef('snake-shot', 12, 0.6, 4);
    const now = e.clock.time();
    def.offset = (((7.4 - 2 - now) % 12) + 12) % 12;
    st.clocks = [...(st.clocks ?? []).filter((c) => c.id !== 'snake-shot'), def];
    e.clock = beatClock(st.clocks, e.easy, now);
    e.startPieces();
    window.__sv = sv;
    window.__moss = moss;
    const p = e.player;
    p.x = sv.x - 30; p.y = sv.topY + HOLD; p.vx = 220; p.vy = 0; p.grounded = false; p.facing = 1;
    let diff = '?';
    try { diff = localStorage.getItem('sloth_difficulty') || '(unset: Normal)'; } catch {}
    return { stage: st.config?.id ?? '', diff, easy: !!e.easy, sv: { x: Math.round(sv.x), top: Math.round(sv.topY), len: Math.round(sv.bottomY - sv.topY) }, pieces: e.pieces.map((q) => q.kind) };
  }, HOLD);
  if (set.err) { console.log(tag, set.err); await ctx.close(); continue; }
  for (let k = 0; k < 6; k++) {
    await sleep(300);
    if (await page.evaluate(() => !!window.__engine().player.isVineSwinging)) break;
    await page.evaluate((HOLD) => { const e = window.__engine(), sv = window.__sv, p = e.player; p.x = sv.x - 30; p.y = sv.topY + HOLD; p.vx = 220; p.vy = 0; p.grounded = false; p.facing = 1; }, HOLD);
  }
  const look = async () => page.evaluate(() => {
    const e = window.__engine(), c = e.camera, p = e.player, sv = window.__sv;
    const sn = e.pieces.find((q) => q.kind === 'vine-snake');
    const n = sn?.now?.[0] ?? {};
    const read = e.clock.read('snake-shot');
    const a = sv.swingAngle ?? 0;
    const pt = (d) => ({ x: sv.x + Math.sin(a) * d, y: sv.topY + Math.cos(a) * d });
    // (the CLEAR view: under the HUD band, over the foot his feet are kept above (cameraFollow.ts HUD_BAND, AHEAD.heroPad.b))
    const band = (e.viewCssH > e.viewCssW ? 140 : 112) / e.zoom;
    const inView = (q) => q.x >= c.x && q.x <= c.x + c.viewportWidth && q.y >= c.y + band - 0.5 && q.y <= c.y + c.viewportHeight * 0.9 + 0.5;
    const hands = Math.max(0, (p.swingLength ?? 0) - 102);
    return { phase: read.phase, u: +read.u.toFixed(2), head: Math.round(n.head ?? 0), hands: Math.round(hands), swinging: !!p.isVineSwinging, grounded: !!p.grounded,
      tellInView: inView(pt(0)) && inView({ x: pt(0).x, y: pt(0).y - 60 }), headInView: inView(pt(Math.max(0, n.head ?? 0))), focus: !!e.camFocus, hold: Math.round(p.swingLength ?? 0), letGos: sn?.letGos ?? 0, vy: Math.round(p.vy) };
  });
  const stamp = async (t) => page.evaluate((t) => { let d = document.getElementById('__lab'); if (!d) { d = document.createElement('div'); d.id = '__lab'; Object.assign(d.style, { position: 'fixed', left: '0', right: '0', bottom: '0', background: 'rgba(0,0,0,0.72)', color: '#fff', font: '11px sans-serif', padding: '4px 6px', zIndex: 99999, pointerEvents: 'none' }); document.body.appendChild(d); } d.textContent = t; }, t);
  const label = (what, v) => `${what} | ${tag} | ${set.stage} (${set.diff}${set.easy ? ', easy on' : ''}) | t-eng-s3@${sha} | liana ${set.sv.len} px, held ${v.hold} | snake ${v.phase} u ${v.u}, head ${v.head} px down, his hands ${v.hands} | tell whole in the CLEAR view: ${v.tellInView ? 'YES' : 'NO'} | focus ${v.focus ? 'on' : 'off'}`;
  const frames = [];
  let sampling = clip;
  const sampler = (async () => { const t0 = Date.now(); while (sampling) frames.push({ t: Date.now() - t0, buf: await page.screenshot({ type: 'jpeg', quality: 80 }) }); })();
  console.log(tag, 'set', JSON.stringify(set), 'swinging', await page.evaluate(() => !!window.__engine().player.isVineSwinging));
  const shots = { tell: false, above: false, gone: false };
  let tellSeen = 0, tellFrames = 0, last = null;
  for (let i = 0; i < 900; i++) {
    const v = await look();
    last = v;
    if (v.phase === 'warn') { tellFrames++; if (v.tellInView) tellSeen++; }
    if (!shots.tell && v.phase === 'warn' && v.u >= 0.3) { shots.tell = true; await stamp(label('THE TELL (reared on the bough, mouth open)', v)); if (!clip) await page.screenshot({ path: path.join(out, `${tag}-1-tell.png`) }); }
    if (!shots.above && v.phase === 'on' && v.swinging && v.head > v.hands - 70) { shots.above = true; await stamp(label('COMING DOWN HIS LIANA, a body above his hands', v)); if (!clip) await page.screenshot({ path: path.join(out, `${tag}-2-above.png`) }); }
    if (!shots.gone && v.letGos > 0) { shots.gone = true; await stamp(label(`IT REACHED HIS HANDS: HE LETS GO (a hop, vy ${v.vy})`, v)); if (!clip) await page.screenshot({ path: path.join(out, `${tag}-3-letgo.png`) }); }
    if (shots.gone && v.grounded) { await sleep(900); const f = await look(); await stamp(label('DOWN ON THE MOSS (no heart lost)', f)); if (!clip) await page.screenshot({ path: path.join(out, `${tag}-4-down.png`) }); break; }
    await sleep(clip ? 20 : 30);
  }
  console.log(tag, 'tell frames', tellFrames, 'tell in view', tellSeen, 'shots', JSON.stringify(shots), 'last', JSON.stringify(last));
  await sleep(500);
  sampling = false;
  await sampler;
  if (clip && frames.length > 10) {
    const dir = path.join(out, `${tag}-frames`);
    fs.mkdirSync(dir, { recursive: true });
    frames.forEach((f, i) => fs.writeFileSync(path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), f.buf));
    const fps = ((frames.length - 1) * 1000) / (frames[frames.length - 1].t - frames[0].t);
    await new Promise((res) => spawn('ffmpeg', ['-v', 'error', '-y', '-framerate', fps.toFixed(2), '-i', path.join(dir, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', path.join(out, `${tag}-clip.mp4`)], { stdio: 'ignore' }).on('exit', res));
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(tag, 'clip', frames.length, 'frames at', fps.toFixed(1), 'fps');
  }
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch {}
await sleep(1500);
process.exit(0);
