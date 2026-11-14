/**
 * ENG-S5: 1-6 beat 4 "The chain" flown on the REAL game (dev page: the engine's own swing, catch, let-go, swing camera and its lead).
 * The row is laid by gen2 itself (pipeline layLocal of w1Swing.ts W1_CHAIN_SECTIONS[1]: bough, three lianas liana to liana, perch;
 * SHORT, SHORT, LONG) on 1-6's World 1 kit for the setting the GAME built, and set into the running stage at his spawn (the stage's
 * own ground there trimmed away for the gap). The floor under the gap is a STAND-IN (Normal: a thorn-marked hurt block; Easy: a plain
 * moss block): BUILD-16's stage lays the painted thorn bed and moss (w1Pits). The phases are the engine's (physics swingSetup).
 * The player: put on l1 (as ENG-S4's shooter does: the catch off a bough is the single liana's, proven); on each liana a bot presses to let go only when the
 * engine's own flight from that moment (physics timedLaunch + airStep) catches the next liana (or lands on the perch), after riding at
 * least RIDE s; on the last liana he slides down first (the LONG leap). Every label prints what the GAME built (D62).
 *   node reference/qa-reports/ENG-S5/shoot.mjs <sha> [port]     PHONES=412x915,915x412 DIFFS=normal,easy CLIP=1
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
const clip = !!process.env.CLIP;
const RIDE = Number(process.env.RIDE || 1.2);
const ROLL = Number(process.env.ROLL || 1);

const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
console.log('vite up', /Local:|ready in/.test(vout));
const browser = await chromium.launch();
const PHONES = (process.env.PHONES || '412x915,915x412').split(',').map((s) => s.split('x').map(Number));
const DIFFS = (process.env.DIFFS || 'normal,easy').split(',');
for (const diff of DIFFS) for (const [w, h] of PHONES) {
  const tag = `chain3-${diff}-${w > h ? 'sideways' : 'upright'}-${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  await page.evaluate(() => window.__play('1-6'));
  await sleep(5000);
  await page.addScriptTag({ content: "window.__eng = () => (typeof window.__engine === 'function' ? window.__engine() : window.__engine);" });
  for (let t = Date.now(); Date.now() - t < 60000; ) { if (await page.evaluate(() => !!window.__eng()?.player)) break; await sleep(500); }
  const set = await page.evaluate(async ([ROLL]) => {
    const P = await import('/src/game/physics.ts');
    const G = await import('/src/game/gen2/pipeline.ts');
    const { generateAllLevels } = await import('/src/game/worldsData.ts');
    const { w1World } = await import('/src/game/gen2/worlds/w1.ts');
    const { THORN_ROW } = await import('/src/game/gen2/worlds/w1Arc12.ts');
    const S = await import('/src/game/gen2/worlds/w1Swing.ts');
    const e = window.__eng();
    const st = e.currentStage;
    const d = e.easy ? 'easy' : 'normal';
    const k1 = S.withSwing(w1World());
    const kit = { ...k1, manifest: { ...k1.manifest, hurtFloor: THORN_ROW } };
    const cfg = { ...generateAllLevels().find((l) => l.id === '1-6'), unlocked: true };
    const L = G.layLocal(S.W1_CHAIN_SECTIONS[1], G.planBudget(cfg, kit.manifest, d), G.rngFor(ROLL));
    const p = e.player;
    const a = L.pieces.find((q) => q.key === 'a'), b = L.pieces.find((q) => q.key === 'b');
    const ox = Math.round(p.x - 60 - a.x), oy = Math.round(p.y - a.y);
    const X0 = ox + a.x - 4, X1 = ox + b.x + b.w + 4;
    // (the stage's own ground, vines and pickups in the strip trimmed away: a ground piece across it keeps its two ends)
    const keep = [];
    for (const q of e.platforms) {
      if (q.x + q.width <= X0 || q.x >= X1 || q.y < oy - 700) { keep.push(q); continue; }
      if (q.x < X0) keep.push({ ...q, width: X0 - q.x });
      if (q.x + q.width > X1) keep.push({ ...q, id: q.id + 50000, x: X1, width: q.x + q.width - X1 });
    }
    let id = 90000;
    const mk = (pc) => ({ id: id++, x: ox + pc.x, y: oy + pc.y, width: pc.w, height: 60, type: 'solid', style: 'branch' });
    keep.push(mk(a), mk(b));
    const g = L.gaps.find((x) => x.pit);
    const floorY = oy + (g.hurt ? 160 : 110);
    const floor = { id: id++, x: ox + g.x0, y: floorY, width: g.x1 - g.x0, height: 200, type: 'solid', ...(g.hurt ? { pit: 'hurt', floorArt: 'w1-thorn' } : {}) };
    keep.push(floor);
    e.platforms = keep;
    if (st.platforms) st.platforms = keep;
    e.vines = e.vines.filter((v) => v.x < X0 - 40 || v.x > X1 + 40);
    e.collectibles = (e.collectibles ?? []).filter((c) => c.x < X0 || c.x > X1);
    e.enemies = (e.enemies ?? []).filter((c) => c.x < X0 || c.x > X1 + 300);
    const ls = L.pieces.filter((q) => q.hang?.kind === 'liana').map((q) => ({ id: id++, x: ox + q.x, topY: oy + q.y, bottomY: oy + q.y + q.h, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true, swingAmp: q.hang.swing.amp, swingPeriod: q.hang.swing.period, ...(q.hang.swing.grip ? { grip: q.hang.swing.grip } : {}) }));
    e.vines.push(...ls);
    P.swingSetup(e.vines);
    if (st.vines) st.vines = e.vines;
    // (the engine's own lists, made at stage start, engine.ts: what it draws and swings on; the new boughs and floor are drawn plain)
    e.plainVines = e.vines.filter((v) => !v.kit);
    e.drawnVines = e.vines.slice();
    e.swingVines = e.vines.filter((v) => v.vineType !== 'tree_climb');
    e.drawPlats = e.platforms;
    if (e.paintedPlats) e.paintedPlats = [...e.paintedPlats.filter((q) => keep.includes(q)), ...keep.filter((q) => q.id >= 90000)];
    window.__chain = { ls: ls.map((v) => v.id), perch: { x: ox + b.x, y: oy + b.y, w: b.w }, a: { x: ox + a.x, w: a.w, y: oy + a.y }, log: [], k: -1, on: 0 };
    window.__lives0 = e.lives;
    let ls0 = '?';
    try { ls0 = localStorage.getItem('sloth_difficulty') || '(unset: Normal)'; } catch {}
    p.x = ox + a.x + 40; p.vx = 0; p.facing = 1;
    return { stage: st.config?.id ?? '', diff: ls0, easy: !!e.easy, period: P.TIMED.period, grabX: P.TIMED.grabX,
      lianas: ls.map((v) => ({ x: v.x, len: v.bottomY - v.topY, amp: +v.swingAmp.toFixed(2), phase: +(v.swingPhase ?? 0).toFixed(3), grip: v.grip ?? '' })),
      dx: ls.slice(1).map((v, i) => Math.round(v.x - ls[i].x)), perchPast: Math.round(ox + b.x - ls[2].x), perchW: Math.round(b.w), gap: g.hurt ? 'thorn hollow (stand-in)' : 'moss pit (stand-in)' };
  }, [ROLL]);
  console.log(tag, 'set', JSON.stringify(set));
  // the bot, in the page (every 10 ms, so the press lands on the frame it was judged on)
  await page.evaluate(async ([RIDE]) => {
    const P = await import('/src/game/physics.ts');
    const C = window.__chain;
    // (a flight as physics pressWindow flies it: the jump held, and the second jump at 0.15, 0.3 or 0.45 s, LETGO_FLIGHTS; the answer is
    // the second jump's moment, -1 for none, or null when no flight from this moment gets there)
    const hitsFrom = (e, p, v, next, perch) => {
      const s = { angle: p.swingAngle || 0, omega: p.swingAngularVelocity || 0, len: p.swingLength || 100, amp: P.vineAmp(v) };
      if (!P.inSweetSpot(s, 1)) return null;
      const l = P.timedLaunch(s, 1);
      for (const dbl of [-1, 0.15, 0.3, 0.45]) {
        const c = { x: p.x, y: p.y, vx: l.vx, vy: l.vy };
        let used = dbl < 0;
        for (let i = 1; i <= 90; i++) {
          if (!used && i / 30 >= dbl) { c.vy = -P.PHYS.doubleV; used = true; }
          const py = c.y;
          P.airStep(c, 1 / 30, 1, true);
          if (next && P.canGrabSwing(c.x, c.y, next, e.vineClock + i / 30)) return dbl;
          if (perch && c.vy >= 0 && py <= perch.y + 14 && c.y >= perch.y && c.x > perch.x + 10 && c.x < perch.x + perch.w) return dbl;
          if (c.y > p.y + 600) break;
        }
      }
      return null;
    };
    // (diagnostic: on the last liana, how far a sweet-spot flight from each moment comes down at the perch's height)
    const reachAt = (e, p, v, perch) => {
      const s = { angle: p.swingAngle || 0, omega: p.swingAngularVelocity || 0, len: p.swingLength || 100, amp: P.vineAmp(v) };
      if (!P.inSweetSpot(s, 1)) return null;
      const l = P.timedLaunch(s, 1);
      const c = { x: p.x, y: p.y, vx: l.vx, vy: l.vy };
      for (let i = 1; i <= 90; i++) { const py = c.y; P.airStep(c, 1 / 30, 1, true); if (c.vy >= 0 && py <= perch.y + 14 && c.y >= perch.y) return Math.round(c.x - perch.x); }
      return null;
    };
    C.reach = [];
    let ran = 0;
    // (the game's own keys, as a keyboard player presses them: a write to the input state is cleared by the press buffer, inputEngine.ts)
    const held = new Set();
    const kd = (code) => { if (held.has(code)) return; held.add(code); window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code })); };
    const ku = (code) => { if (!held.has(code)) return; held.delete(code); window.dispatchEvent(new KeyboardEvent('keyup', { code, key: code })); };
    window.__botT = setInterval(() => {
      const e = window.__eng(), p = e.player;
      kd('ArrowRight');
      if (!p.isVineSwinging) {
        ku('ArrowDown');
        // the second jump, at the moment the press was judged with (a tap again: let go of the jump and press it)
        if (C.dbl !== undefined && C.dbl >= 0 && e.vineClock - C.pressAt >= C.dbl) { ku('Space'); kd('Space'); C.log.push(`second jump at +${(e.vineClock - C.pressAt).toFixed(2)} s`); C.dbl = undefined; }
        // on the bough: run, jump at its edge
        // (he is put on l1 as ENG-S4's shooter puts him on its liana: the catch off a bough is the single liana's, already proven; the
        // clip judges the chain from l1 on)
        if (C.k < 0 && ran < 6 && e.vineClock - (C.put ?? -9) > 0.4) { ran++; C.put = e.vineClock; const l1 = e.vines.find((q) => q.id === C.ls[0]); p.x = l1.x - 30; p.y = l1.topY + 330; p.vx = 220; p.vy = 0; p.grounded = false; p.facing = 1; }
        if (p.grounded && C.k >= 0) { ku('Space'); if (!C.landed) { C.landed = 1; C.log.push(`down on ${Math.abs(p.y - C.perch.y) < 4 && p.x > C.perch.x ? 'the PERCH' : 'something else (y ' + Math.round(p.y) + ')'}, lives lost ${(window.__lives0 ?? e.lives) - e.lives}`); } }
        return;
      }
      const k = C.ls.indexOf(p.swingVineId);
      if (k !== C.k) { C.k = k; C.on = e.vineClock; C.log.push(`caught l${k + 1} at ${e.vineClock.toFixed(2)} (held ${Math.round(p.swingLength)})`); ku('Space'); }
      if (k < 0) return;
      const v = e.vines.find((q) => q.id === p.swingVineId);
      const next = k < C.ls.length - 1 ? e.vines.find((q) => q.id === C.ls[k + 1]) : null;
      const last = !next;
      // the LONG one: slide down first (straight down always climbs)
      if (last && (p.swingLength ?? 0) < (v.bottomY - v.topY) - 30) { kd('ArrowDown'); e.input.state.down = true; return; }
      ku('ArrowDown');
      e.input.state.down = false;
      if (last) { const r = reachAt(e, p, v, C.perch); if (r !== null && C.reach.length < 60) C.reach.push(`${r}@${Math.round(p.x - v.x)},${Math.round(p.y - v.topY)}`); }
      if (e.vineClock - C.on < RIDE || held.has('Space')) return;
      const dbl = hitsFrom(e, p, v, next, last ? C.perch : null);
      if (dbl !== null) { kd('Space'); C.dbl = dbl; C.pressAt = e.vineClock; C.log.push(`press on l${k + 1} at ${e.vineClock.toFixed(2)}${dbl >= 0 ? ` (with the second jump at ${dbl} s)` : ''}`); }
    }, 10);
  }, [RIDE]);
  const look = async () => page.evaluate(() => {
    const e = window.__eng(), c = e.camera, p = e.player, C = window.__chain;
    const k = C.ls.indexOf(p.swingVineId);
    const next = p.isVineSwinging && k >= 0 && k < C.ls.length - 1 ? e.vines.find((q) => q.id === C.ls[k + 1]) : null;
    const far = next ? next.x + (next.bottomY - next.topY) * Math.sin(next.swingAmp ?? 0) : null;
    return { reach: (C.reach || []).slice(0, 40).join(' '), k, hold: Math.round(p.swingLength ?? 0), nx: next ? Math.round(next.x) : null, far: far === null ? null : Math.round(far), swinging: !!p.isVineSwinging, grounded: !!p.grounded, x: Math.round(p.x), zoom: +e.zoom.toFixed(2), view: [Math.round(c.x), Math.round(c.x + c.viewportWidth)],
      nextWhole: far === null ? null : next.x - 20 >= c.x && far <= c.x + c.viewportWidth, lost: (window.__lives0 ?? e.lives) - e.lives, log: C.log.slice() };
  });
  const stamp = async (t) => page.evaluate((t) => { let d = document.getElementById('__lab'); if (!d) { d = document.createElement('div'); d.id = '__lab'; Object.assign(d.style, { position: 'fixed', left: '0', right: '0', bottom: '0', background: 'rgba(0,0,0,0.72)', color: '#fff', font: '11px/1.3 monospace', padding: '4px 6px', zIndex: 99999, pointerEvents: 'none', whiteSpace: 'pre-wrap' }); document.body.appendChild(d); } d.textContent = t; }, t);
  const head = `${tag} | ${set.stage} built ${set.easy ? 'EASY' : 'NORMAL'} (localStorage ${set.diff}; swing ${set.period} s) | t-eng-s5@${sha} | chain3 roll ${ROLL}: dx ${set.dx.join(', ')} px, amps ${set.lianas.map((l) => l.amp).join('/')}, perch ${set.perchPast} px past l3 | floor: ${set.gap}`;
  const frames = [];
  let sampling = clip;
  const sampler = (async () => { const t0 = Date.now(); while (sampling) frames.push({ t: Date.now() - t0, buf: await page.screenshot({ type: 'jpeg', quality: 80 }) }); })();
  let lastLog = 0, v = null, wholeSeen = 0, nextFrames = 0;
  const stills = new Set();
  const pressSeen = [];
  for (let i = 0; i < 600; i++) {
    v = await look();
    if (v.nextWhole !== null) { nextFrames++; if (v.nextWhole) wholeSeen++; }
    const ev = v.log.length > lastLog ? v.log[v.log.length - 1] : '';
    lastLog = v.log.length;
    await stamp(`${head}\n${v.swinging ? `ON l${v.k + 1} held ${v.hold}` : v.grounded ? 'ON THE GROUND' : 'IN THE AIR'} | view ${v.view.join('-')} next ${v.nx ?? '-'}..${v.far ?? '-'} | zoom ${v.zoom} | next liana's whole swing in view: ${v.nextWhole === null ? '-' : v.nextWhole ? 'YES' : 'NO'} | lives lost ${v.lost}\n${v.log.slice(-3).join(' / ')}`);
    if (ev.startsWith('press on l') && v.nextWhole !== null) pressSeen.push(`${ev.slice(0, 11)}: ${v.nextWhole ? 'whole' : 'NOT whole'} (view ${v.view.join('-')}, swing ${v.nx}..${v.far})`);
    for (const key of ['press on l1', 'press on l2', 'press on l3', 'down on']) {
      if (ev.startsWith(key) && !stills.has(key)) { stills.add(key); await page.screenshot({ path: path.join(out, `${tag}-${key.replace(/ /g, '-')}.png`) }); }
    }
    if (v.log.some((l) => l.startsWith('down on'))) { await sleep(900); v = await look(); await stamp(`${head}\nDONE: ${v.log.slice(-2).join(' / ')}`); await page.screenshot({ path: path.join(out, `${tag}-end.png`) }); break; }
    await sleep(20);
  }
  if (!v.log.some((l) => l.startsWith('down on'))) await page.screenshot({ path: path.join(out, `${tag}-end.png`) });
  console.log(tag, 'reach', v.reach);
  console.log(tag, 'last', JSON.stringify({ k: v.k, hold: v.hold, swinging: v.swinging, view: v.view }), 'log', JSON.stringify(v.log), 'next-liana frames whole in view', `${wholeSeen}/${nextFrames}`, 'at the presses', JSON.stringify(pressSeen));
  await sleep(300);
  sampling = false;
  await sampler;
  if (clip && frames.length > 10) {
    const dir = path.join(out, `${tag}-frames`);
    fs.mkdirSync(dir, { recursive: true });
    frames.forEach((f, i) => fs.writeFileSync(path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), f.buf));
    const fps = ((frames.length - 1) * 1000) / (frames[frames.length - 1].t - frames[0].t);
    await new Promise((res) => spawn('ffmpeg', ['-v', 'error', '-y', '-framerate', fps.toFixed(2), '-i', path.join(dir, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', path.join(out, `${tag}-clip.mp4`)], { stdio: 'inherit' }).on('exit', res));
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(tag, 'clip', frames.length, 'frames at', fps.toFixed(1), 'fps');
  }
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch {}
await sleep(1500);
process.exit(0);
