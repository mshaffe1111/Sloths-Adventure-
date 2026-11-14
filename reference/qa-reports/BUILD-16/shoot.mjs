/**
 * BUILD-16: 1-6 on the REAL game (dev page, the engine's own camera, the stage as the game builds it: __play('1-6')). ENG-S1's swing
 * shooter (reference/qa-reports/ENG-S1/shoot.mjs) generalised to 1-6's beats: per beat, Pokey is put on the beat's liana (by its tag),
 * held where the beat asks (the top, or slid to the foot), and he presses on a forward sweep once the perch is whole in his view; a still
 * at the decision and after the landing (or the let-go), and with CLIP=1 a clip of the whole action (D63).
 * Every label prints what the GAME built (D62): the stage, the setting read from localStorage sloth_difficulty AND the engine's easyMode,
 * the seed, the phone, the beat, the snake on the liana, where he ended.
 *   node reference/qa-reports/BUILD-16/shoot.mjs <sha> <normal|easy> [beats,comma] [port]
 * Beats: first, hanglow, met, snake, creak, risers, false, gorge. Out: reference/qa-reports/BUILD-16/shots/.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [sha = '?', setting = 'normal', beatArg = 'first,hanglow,met,snake,creak,risers,false,gorge', portArg] = process.argv.slice(2);
const port = Number(portArg || 5231);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = path.join(here, 'shots');
fs.mkdirSync(out, { recursive: true });
/** each beat: its section template, the liana he rides, the perch he flies to, where he holds, how long he waits at the top first (s) */
const BEATS = {
  first: { tpl: 'w1-16-first-liana', l: 'l1', b: 'b1', hold: 'top', wait: 0 },
  hanglow: { tpl: 'w1-16-hang-low', l: 'l1', b: 'b1', hold: 'foot', wait: 0 },
  met: { tpl: 'w1-16-snakes-met', l: 'l1', b: 'b1', hold: 'top', wait: 7 },
  snake: { tpl: 'w1-16-snake-on-vine', l: 'l1', b: 'b1', hold: 'foot', wait: 5 },
  creak: { tpl: 'w1-16-creaky-landing', l: 'l1', b: 'b1', hold: 'foot', wait: 0 },
  risers: { tpl: 'w1-16-risers', l: 'l1', b: 'b1', hold: 'top', wait: 3 },
  false: { tpl: 'w1-16-false-liana', l: 'f', b: 'sb1', hold: 'top', wait: 0 },
  gorge: { tpl: 'w1-16-gorge', l: 'l1', b: 'b1', hold: 'foot', wait: 4 },
};
const want = beatArg.split(',');

const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
console.log('vite up', /Local:|ready in/.test(vout));
const browser = await chromium.launch();
const PHONES = (process.env.PHONES || '412x915,915x412').split(',').map((s) => s.split('x').map(Number));
const clip = !!process.env.CLIP;
for (const [w, h] of PHONES) {
  const tag = `${w > h ? 'sideways' : 'upright'}-${w}x${h}`;
  for (const beat of want) {
    const B = BEATS[beat];
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: clip ? 1 : 2, isMobile: true, hasTouch: true });
    await ctx.route(/script\.google\.com/, (r) => r.abort());
    await ctx.addInitScript((s) => { try { if (s === 'easy') localStorage.setItem('sloth_difficulty', 'easy'); else localStorage.removeItem('sloth_difficulty'); } catch {} }, setting);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
    await page.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
    for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
    await sleep(1500);
    await page.evaluate(() => window.__play('1-6'));
    await sleep(5000);
    await page.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
    const set = await page.evaluate((B) => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const st = e.currentStage, g = st.gen2 ?? st.proto?.gen2;
      const sec = (g?.sections ?? []).find((s) => s.template === B.tpl);
      if (!sec) return { err: `no section ${B.tpl}` };
      const sv = e.vines.find((v) => v.tag === `${sec.uid}:${B.l}`);
      const perch = e.platforms.find((p) => p.tag === `${sec.uid}:${B.b}`);
      if (!sv || !perch) return { err: `no liana ${B.l} or perch ${B.b} in ${sec.uid}` };
      window.__sv = sv; window.__perch = perch;
      const p = e.player;
      p.x = sv.x - 30; p.y = sv.topY + 120; p.vx = 200; p.vy = 0; p.grounded = false; p.facing = 1;
      let diff = '?';
      try { diff = localStorage.getItem('sloth_difficulty') || '(unset: Normal)'; } catch {}
      return { stage: st.config?.id ?? '', seed: g?.seed ?? '?', diff, easy: !!e.easyMode, levelH: st.config?.levelHeight, snake: sv.snake ? `${sv.snake.route}${sv.snake.clock ? ' on ' + sv.snake.clock : ''}` : 'none', still: sv.swingAmp === 0,
        sv: { x: Math.round(sv.x), top: Math.round(sv.topY), len: Math.round(sv.bottomY - sv.topY) }, perch: { x: Math.round(perch.x), y: Math.round(perch.y), w: Math.round(perch.width), creak: !!perch.creak } };
    }, B);
    if (set.err) { console.log(tag, beat, set.err); await ctx.close(); continue; }
    for (let k = 0; k < 8; k++) {
      await sleep(300);
      if (await page.evaluate(() => !!window.__engine().player.isVineSwinging || !!window.__engine().player.hanging)) break;
      await page.evaluate(() => { const e = window.__engine(), sv = window.__sv, p = e.player; p.x = sv.x - 30; p.y = sv.topY + 120; p.vx = 200; p.vy = 0; p.grounded = false; p.facing = 1; });
    }
    const frames = [];
    let sampling = clip;
    const sampler = (async () => { const t0 = Date.now(); while (sampling) { const buf = await page.screenshot({ type: 'jpeg', quality: 80 }); frames.push({ t: Date.now() - t0, buf }); } })();
    const usual = await page.evaluate(() => window.__engine().roomUsual);
    const view = async () => page.evaluate((usual) => {
      const e = window.__engine(), c = e.camera, p = e.player, far = window.__perch, sv = window.__sv;
      return { a: +((sv.swingAngle ?? 0) / (sv.swingAmp || 0.45)).toFixed(2), om: Math.sign(p.swingAngularVelocity ?? 0), swinging: !!p.isVineSwinging, grounded: !!p.grounded, x: Math.round(p.x), y: Math.round(p.y),
        size: Math.round((100 * e.zoom) / usual), vw: Math.round(c.viewportWidth), lives: e.lives ?? e.player.lives ?? '?', hearts: e.player.health ?? e.health ?? '?',
        whole: far.x >= c.x && far.x + far.width <= c.x + 0.98 * c.viewportWidth, onPerch: !!p.grounded && Math.abs(p.y - far.y) < 4 && p.x > far.x - 4 && p.x < far.x + far.width + 4 };
    }, usual);
    const label = (what, v) => `${what} | ${tag} | ${set.stage} seed ${set.seed} (${set.diff}${set.easy ? ', easyMode on' : ', easyMode off'}) | t-build-16@${sha} | beat ${beat}: liana ${set.sv.len} px ${set.still ? '(STILL: false liana)' : ''} snake ${set.snake} | perch ${set.perch.w} wide${set.perch.creak ? ' CREAKY' : ''} | view ${v.vw} px, Pokey ${v.size}% | perch whole: ${v.whole ? 'YES' : 'NO'} | lives ${v.lives}`;
    const stamp = async (t) => page.evaluate((t) => { let d = document.getElementById('__lab'); if (!d) { d = document.createElement('div'); d.id = '__lab'; Object.assign(d.style, { position: 'fixed', left: '0', right: '0', bottom: '0', background: 'rgba(0,0,0,0.72)', color: '#fff', font: '11px sans-serif', padding: '4px 6px', zIndex: 99999, pointerEvents: 'none' }); document.body.appendChild(d); } d.textContent = t; }, t);
    const name = (k) => path.join(out, `${setting}-${beat}-${tag}-${k}.jpg`);
    // (waiting at the top: the snake's tell and its trip, as a player sees them)
    if (B.wait) {
      await sleep(Math.min(B.wait, 3) * 1000);
      const v = await view();
      await stamp(label(`AT THE TOP, WATCHING (${B.wait} s)`, v));
      if (!clip) await page.screenshot({ path: name('0-top'), type: 'jpeg', quality: 85 });
      await sleep(Math.max(0, B.wait - 3) * 1000);
    }
    const v0 = await view();
    if (B.hold === 'foot' && v0.swinging) {
      await page.evaluate(() => { window.__engine().input.state.down = true; });
      await sleep(1800);
      await page.evaluate(() => { window.__engine().input.state.down = false; });
    }
    await page.evaluate(() => { window.__engine().input.state.right = true; });
    let sweeps = 0, prevOm = 0, got = null;
    for (let i = 0; i < 600 && !got; i++) {
      const v = await view();
      if (!v.swinging) { got = v; break; }
      if (v.om > 0 && prevOm <= 0) sweeps++;
      prevOm = v.om;
      if (sweeps >= 2 && v.om > 0 && v.a <= 0.9 && v.whole) got = v;
      else await sleep(16);
    }
    if (got && got.swinging) {
      await stamp(label(`THE DECISION (${B.hold === 'foot' ? 'held at the foot' : 'held high'}, forward sweep)`, got));
      if (!clip) await page.screenshot({ path: name('1-decision'), type: 'jpeg', quality: 85 });
      await page.evaluate(() => { window.__engine().input.state.right = false; });
      await page.keyboard.down('ArrowRight'); await page.keyboard.down('Space'); await sleep(160); await page.keyboard.up('Space'); await sleep(500); await page.keyboard.up('ArrowRight');
    }
    await sleep(2400);
    const after = await view();
    await stamp(label(`AFTER: ${after.onPerch ? 'ON THE PERCH' : after.swinging ? 'STILL SWINGING' : after.grounded ? 'DOWN (not the perch)' : 'IN THE AIR'}`, after));
    if (!clip) await page.screenshot({ path: name('2-after'), type: 'jpeg', quality: 85 });
    console.log(tag, beat, JSON.stringify(set), 'decision', JSON.stringify(got), 'after', JSON.stringify(after));
    await sleep(500);
    sampling = false;
    await sampler;
    if (clip && frames.length > 10) {
      const dir = path.join(out, `${setting}-${beat}-${tag}-frames`);
      fs.mkdirSync(dir, { recursive: true });
      frames.forEach((f, i) => fs.writeFileSync(path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), f.buf));
      const fps = ((frames.length - 1) * 1000) / (frames[frames.length - 1].t - frames[0].t);
      await new Promise((res) => spawn('ffmpeg', ['-v', 'error', '-y', '-framerate', fps.toFixed(2), '-i', path.join(dir, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', path.join(out, `${setting}-${beat}-${tag}-clip.mp4`)], { stdio: 'ignore' }).on('exit', res));
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(tag, beat, 'clip', frames.length, 'frames at', fps.toFixed(1), 'fps');
    }
    await ctx.close();
  }
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch {}
await sleep(1500);
process.exit(0);
