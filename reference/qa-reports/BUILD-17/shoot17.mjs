/**
 * BUILD-17: 1-7 A Very Good Bush on the REAL game (the dev page, the engine's own build and draw: no mock). For each beat, Pokey is put
 * where the beat asks its question and the beat's OWN eagle is waited for until its look is on him; the caption is read from the game
 * (stage, setting from localStorage, roll seed, the eagle's phase and eye, his state: hidden or not, hanging, swinging, on the limb).
 *   node reference/qa-reports/BUILD-17/shoot17.mjs <sha> [port]            stills, 412x915 and 915x412, Normal and Easy (DIFF=normal|easy)
 *   CLIP=1 node reference/qa-reports/BUILD-17/shoot17.mjs <sha> [port]     one clip a beat action (frames from the page), Normal, both ways
 * A still proves only what it shows (D69): each caption names what to look for and prints the state that proves it.
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
const port = Number(portArg || 5251);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clip = !!process.env.CLIP;
const out = path.join(here, clip ? 'clips' : 'stills');
fs.mkdirSync(out, { recursive: true });
const DIFFS = (process.env.DIFF || (clip ? 'normal' : 'normal,easy')).split(',');
const PHONES = (process.env.PHONES || '412x915,915x412').split(',').map((s) => s.split('x').map(Number));
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;

const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();

/** the beats: what he does there, and what the still must show */
const BEATS = [
  { id: 'b1-bush', sec: 'w1-17-bush', k: 0, how: 'cover', what: "BEAT 1 the bush, safe: him STILL in Dot's-road bush, the moss over him, the eagle's shadow on him" },
  { id: 'b2-shake', sec: 'w1-17-bush', k: 1, how: 'cover', what: 'BEAT 2 the leaves shake: him in the wide bush, the petal just past its far edge' },
  { id: 'b3-road', sec: 'w1-17-red-green', k: 0, how: 'cover', what: 'BEAT 3 red light green light: the road of bushes, him hidden in the first' },
  { id: 'b5-bark', sec: 'w1-17-bare-bark', k: 0, how: 'open', what: 'BEAT 5 bare bark: him STILL on the bark between the two bushes: NOT hidden (no moss on him), the eagle sees him' },
  { id: 'b7-moss', sec: 'w1-17-moss', k: 0, how: 'cover', what: 'BEAT 7 moss anywhere: him still on the moss carpet, hidden' },
  { id: 'b8-creak', sec: 'w1-17-creak', k: 0, how: 'limb', what: 'BEAT 8 never still on a creak: him on the creaky limb as the eagle looks (Easy: a sound bough)' },
  { id: 'b10-liana', sec: 'w1-17-mossy-lianas', k: 0, how: 'liana', what: 'BEAT 10 the twist: him SWINGING on a mossy liana as the look crosses him: hidden' },
  { id: 'b12-perch', sec: 'w1-17-eagle-lands', k: 0, how: 'cover', what: 'BEAT 12 the eagle lands: perched on its snag, its gaze on him in the moss' },
  { id: 'b14-finale', sec: 'w1-17-light-gap', k: 0, how: 'cover', what: 'BEAT 14 the light gap: patches further apart, the creaky limb and the mossy lianas ahead' },
];

for (const diff of DIFFS) for (const [w, h] of PHONES) {
  const tag = `${w > h ? 'sideways' : 'upright'}-${w}x${h}-${diff}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: clip ? 1 : 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  await page.evaluate((d) => { try { if (d === 'easy') localStorage.setItem('sloth_difficulty', 'easy'); else localStorage.removeItem('sloth_difficulty'); } catch {} }, diff);
  await page.reload();
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  await page.evaluate(() => window.__play('1-7'));
  // (under load the stage can take a while: wait for the engine and the stage itself, never a fixed sleep alone)
  for (let t = Date.now(); Date.now() - t < 90000; ) { if (await page.evaluate(() => typeof window.__engine === 'function' && window.__engine()?.currentStage?.config?.id === '1-7' && !!window.__engine().cast)) break; await sleep(500); }
  await sleep(2500);
  const stamp = (text) => page.evaluate((text) => {
    let d = document.getElementById('__lab');
    if (!d) { d = document.createElement('div'); d.id = '__lab'; Object.assign(d.style, { position: 'fixed', left: '4px', bottom: '4px', right: '4px', zIndex: 99999, font: '11px/1.3 monospace', color: '#fff', background: 'rgba(0,0,0,.6)', padding: '3px 5px', pointerEvents: 'none' }); document.body.appendChild(d); }
    d.textContent = text;
  }, text);
  const dismissDot = async () => {
    for (let i = 0; i < 6; i++) {
      const shown = await page.evaluate(() => [...document.querySelectorAll('.dg-bub')].some((b) => { const r = b.getBoundingClientRect(); return r.width > 20 && getComputedStyle(b).opacity !== '0' && getComputedStyle(b).visibility !== 'hidden'; }));
      if (!shown) return 'dismissed';
      try { await page.locator('.dg-bub').first().click({ timeout: 1000, force: true }); } catch {}
      await sleep(700);
    }
    return 'SHOWN';
  };
  const info = await page.evaluate(() => {
    const e = window.__engine();
    let diff = '?';
    try { diff = localStorage.getItem('sloth_difficulty') || '(unset: Normal)'; } catch {}
    return { stage: e.currentStage.config?.id, seed: e.currentStage.gen2?.seed ?? e.currentStage.seed ?? '?', diff, easy: !!e.easy, eagles: e.cast?.members.length ?? -1 };
  });
  console.log(tag, JSON.stringify(info));
  for (const b of BEATS) {
    if (ONLY && !ONLY.includes(b.id)) continue;
    // (set him at the beat: its eagle, the spot its question is asked; the eagle is put back to rest at its post with a short calm left,
    //  so its next look comes over him in the still)
    const at = await page.evaluate(async (b) => {
      const e = window.__engine(), p = e.player, st = e.currentStage;
      // (off any vine first, with the engine's own re-grab cooldown: put down near a liana he was caught again the next frame)
      if (p.isVineSwinging) { e.lastReleasedVineId = p.swingVineId; e.vineCooldownTimer = 2; }
      p.isVineSwinging = false; p.climbing = false; p.hanging = false;
      const s = st.gen2.sections.find((q) => q.template === b.sec);
      const ps = e.platforms.filter((q) => q.tag?.startsWith(`${s.uid}:`));
      const x0 = Math.min(...ps.map((q) => q.x)), x1 = Math.max(...ps.map((q) => q.x + q.width));
      const ms = e.cast.members.filter((m) => m.s.minX >= x0 - 1 && m.s.minX <= x1).sort((a, c) => a.s.minX - c.s.minX);
      const m = ms[b.k];
      if (!m) return { err: `no eagle ${b.k} in ${b.sec}` };
      const hides = (e.proto.bushes ?? []).filter((q) => !q.hanging && q.x + q.w > m.s.minX && q.x < m.s.maxX).sort((a, c) => a.x - c.x);
      let x = hides[0] ? hides[0].x + hides[0].w / 2 : m.s.minX + 100, y = null;
      if (b.how === 'open' && hides.length > 1) x = Math.round((hides[0].x + hides[0].w + hides[1].x) / 2);
      // (the limb gives way 1.1 s after he lands: he waits on the bank before it, and steps onto it as the look comes, below)
      if (b.how === 'limb') { const k = ps.find((q) => q.tag.endsWith(':k')); x = k.x - 60; window.__limb = { x: k.x + k.width / 2, y: k.y }; }
      const g = y ?? e.platforms.filter((q) => q.type !== 'fragile' && x >= q.x && x <= q.x + q.width && !q.tag?.endsWith(':rb') && !q.tag?.endsWith(':r2')).sort((a, c) => a.y - c.y)[0]?.y;
      p.x = x; p.y = (g ?? p.y) - 1; p.vx = 0; p.vy = 0;
      e.camera.x = x - e.camera.viewportWidth / 2;
      // its rest: a calm about to end (the kit's own state), its look then sweeps from its stretch's start
      m.s.phase = 'rest'; m.s.t = Math.max(0, (m.s.cool ?? 5) - 0.6); m.s.eyeX = m.s.minX;
      if (b.how === 'liana') {
        const v = e.vines.filter((q) => q.mossy && q.x > x0 && q.x < x1).sort((a, c) => a.x - c.x)[0];
        const ph = await import('/src/game/physics.ts');
        for (let yy = v.bottomY - 10; yy > v.topY + 60; yy -= 6) for (let dx = -200; dx <= 200; dx += 4) {
          if (ph.canGrabSwing(v.x + dx, yy, v, e.vineClock)) { p.x = v.x + dx; p.y = yy; p.vx = 30; p.grounded = false; e.input.state.up = true; return { x: p.x, id: m.e.id, liana: v.id }; }
        }
      }
      return { x: Math.round(x), id: m.e.id };
    }, b);
    if (at.err) { console.log(tag, b.id, at.err); continue; }
    if (b.how === 'liana') {
      // (the game's own catch, retried until he holds it: canGrabSwing, then Up held until isVineSwinging)
      for (let i = 0; i < 120 && !(await page.evaluate(() => !!window.__engine().player.isVineSwinging)); i++) {
        await page.evaluate(async (lid) => {
          const e = window.__engine(), p = e.player, v = e.vines.find((q) => q.id === lid), ph = await import('/src/game/physics.ts');
          for (let yy = v.bottomY - 10; yy > v.topY + 60; yy -= 6) for (let dx = -200; dx <= 200; dx += 4) {
            if (ph.canGrabSwing(v.x + dx, yy, v, e.vineClock)) { p.x = v.x + dx; p.y = yy; p.vx = 30; p.vy = 0; p.grounded = false; e.input.state.up = true; return; }
          }
        }, at.liana);
        await sleep(20);
      }
    }
    await sleep(200);
    await page.evaluate(() => { window.__engine().input.state.up = false; });
    if (b.how === 'limb') {
      // (he steps onto the creaky limb as the look comes toward it: the screech catches him by the limb, 1-7.md beat 8)
      for (let t = Date.now(); Date.now() - t < 14000; ) { const ok = await page.evaluate((id) => { const e = window.__engine(), m = e.cast.members.find((q) => q.e.id === id); return m.s.phase === 'hunt' && m.s.eyeX > window.__limb.x - 260; }, at.id); if (ok) break; await sleep(30); }
      await page.evaluate(() => { const e = window.__engine(), p = e.player; p.x = window.__limb.x; p.y = window.__limb.y - 1; p.vx = 0; p.vy = 0; });
    }
    const dot = await dismissDot();
    const state = () => page.evaluate((id) => {
      const e = window.__engine(), p = e.player, m = e.cast.members.find((q) => q.e.id === id);
      const under = e.platforms.find((q) => Math.abs(q.y - p.y) < 6 && p.x >= q.x && p.x <= q.x + q.width);
      return { phase: m.s.phase, eye: Math.round(m.s.eyeX), perched: !!m.s.perched, x: Math.round(p.x), hidden: +e.cast.calmNow(e.easy).toFixed(2), hearts: p.hp, swinging: !!p.isVineSwinging, hanging: !!p.hanging, onCreak: !!(under && under.creak), grounded: !!p.grounded };
    }, at.id);
    const frames = [];
    let sampling = clip;
    const t0 = Date.now();
    const sampler = (async () => { while (sampling) frames.push({ t: Date.now() - t0, v: await state(), buf: await page.screenshot({ type: 'jpeg', quality: 78 }) }); })();
    // (wait for the look: its eye within 90 px of him, or its tell or dive)
    let v;
    for (let t = Date.now(); Date.now() - t < 14000; ) { v = await state(); if ((v.phase === 'hunt' && Math.abs(v.eye - v.x) < 90) || v.phase === 'tell' || v.phase === 'act') break; await sleep(30); }
    if (clip) await sleep(2500);
    sampling = false;
    await sampler;
    v = await state();
    const lab = `${b.what} | ${tag} | built ${info.stage} seed ${info.seed} (${info.diff}${info.easy ? ', easy on' : ''}) | t-build-17@${sha} | eagle ${v.phase}${v.perched ? ' PERCHED' : ''} eye ${v.eye} | Pokey x ${v.x}: hidden ${v.hidden}, hearts ${v.hearts}${v.swinging ? ', SWINGING' : ''}${v.onCreak ? ', ON THE CREAKY LIMB' : ''} | Dot's box ${dot}`;
    console.log(tag, b.id, JSON.stringify(v));
    if (!clip) { await stamp(lab); await page.screenshot({ path: path.join(out, `${tag}-${b.id}.png`) }); }
    else if (frames.length > 8) {
      const dir = path.join(out, `${tag}-${b.id}-f`);
      fs.mkdirSync(dir, { recursive: true });
      frames.forEach((f, i) => fs.writeFileSync(path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), f.buf));
      const fps = ((frames.length - 1) * 1000) / (frames[frames.length - 1].t - frames[0].t);
      // (the frame where the action happens, D69: the first frame its look is on him)
      const k = frames.findIndex((f) => (f.v.phase === 'hunt' && Math.abs(f.v.eye - f.v.x) < 90) || f.v.phase === 'tell' || f.v.phase === 'act');
      console.log(tag, b.id, 'clip', frames.length, 'frames at', fps.toFixed(1), 'fps; the look on him at frame', k, k >= 0 ? `(${(frames[k].t / 1000).toFixed(1)} s): ${JSON.stringify(frames[k].v)}` : '');
      await new Promise((res) => spawn('ffmpeg', ['-v', 'error', '-y', '-framerate', fps.toFixed(2), '-i', path.join(dir, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', path.join(out, `${tag}-${b.id}.mp4`)]).on('exit', res));
      fs.rmSync(dir, { recursive: true, force: true });
    }
    // (a respawn if the eagle took him, so the next beat starts whole)
    // (and off any liana: the engine keeps a swinging sloth on his vine wherever he is put)
    await page.evaluate(() => { const e = window.__engine(), p = e.player; p.hp = Math.max(p.hp, 3); p.isVineSwinging = false; p.climbing = false; p.hanging = false; p.swingVineId = undefined; e.input.state.left = e.input.state.right = e.input.state.up = false; });
    await sleep(400);
  }
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch {}
await sleep(1000);
process.exit(0);
