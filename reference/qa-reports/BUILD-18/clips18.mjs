// BUILD-18: clips of 1-8 on the REAL page (window.__play('1-8')), B6's method (reference/qa-reports/B6/shoot.mjs): the page's loop paused,
// the engine stepped one fixed step a frame and drawn with the game's own camera, 30 fps (D63), key frames NAMED from the game's own state
// at that frame (D69), the caption what the game built (D62); presses are the real touch flick (input.triggerTouchUp / releaseTouchUp).
//   nut:     he runs at the teach nut from 900 px back; it drops in ahead (the tell), lands, rolls at him; he hops it
//   fruit:   he runs at the teach fruit from 900 px back; it drops in and bounces at him; he runs on under it (no press)
//   crack:   he runs over the first crack from 600 px back; the front sets off behind him; the first nut of the stretch
//   fork:    he runs onto the still fork from the stretch before it; the screech; he stops in the moss and holds still while its eye
//            crosses; the pass ends; he runs on and the next crack sets off behind him
//   tip:     he runs the last stretch to the tip, presses at its lip; the runner liana meets him; the branch end falls in slow motion;
//            he lets go at the swing's front and lands on the far tree's bough
//   wayside: the halfway wayside on a FRESH save (not marked shown): he runs on from before the still fork for 14 s; the box's text read
//            from the page each frame says whether the game keeps it up or closes it
//   PORT=5199 node reference/qa-reports/BUILD-18/clips18.mjs <out dir> [normal,easy] [upright,sideways] [nut,fruit,crack,fork,tip,wayside]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { E, caption } from '../B2/world.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, sets = 'normal,easy', ors = 'upright,sideways', clips = 'nut,fruit,crack,fork,tip,wayside'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const SIZES = { upright: [412, 915], sideways: [915, 412] };
const b = await chromium.launch();

/** B2's openStage, but the wayside is marked shown only when the clip is not about it (a fresh save hears it) */
async function open({ setting, w, h, fresh }) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript((s) => localStorage.setItem('sloth_difficulty', s), setting);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${process.env.PORT ?? 5199}/?lessons=off`);
  await p.waitForTimeout(2500);
  if (!fresh) await p.evaluate(async () => { const w = await import('/src/game/wayside.ts'); for (const f of ['L', 'H', 'F']) w.markShown(1, 8, f); });
  await p.evaluate(() => window.__play('1-8', 1));
  await p.waitForFunction((E) => !!eval(E)?.currentStage, E, { timeout: 60000, polling: 250 });
  await p.waitForTimeout(3000);
  await p.evaluate((E) => { const e = eval(E); for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true; e.clearGuide?.(); }, E);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => console.log('stage card STILL UP'));
  await p.waitForTimeout(2500);
  await p.getByText(/Tap here when you/).first().click({ timeout: 2500 }).catch(() => {});
  return { ctx, p };
}

// (place him `back` px before the clip's target on the ground there, his flag there, the pieces and cast started afresh)
const PLACE = `((E, clip) => {
  const e = eval(E);
  e.isPaused = true;
  const st = e.currentStage;
  const lay = st.chase;
  if (!lay) return { error: 'no chase' };
  const rl = st.rolling || [];
  const crack = lay.stretches[0].start;
  const sw = (e.cast && e.cast.sweepers) || [];
  const eagle = sw.find((m) => m.e.kitPasses === 1);
  const last = lay.stretches[lay.stretches.length - 1];
  const T = {
    nut: [rl.find((h) => h.kind === 'low' && h.dropX < crack)?.dropX, 900],
    fruit: [rl.find((h) => h.kind === 'high' && h.dropX < crack)?.dropX, 900],
    crack: [crack, 600],
    fork: [eagle ? eagle.s.minX : undefined, 700],
    tip: [last.tip ? last.end : undefined, 1100],
    wayside: [eagle ? eagle.s.minX : undefined, 700],
  }[clip];
  if (!T || T[0] === undefined) return { error: 'no ' + clip + ' on this roll' };
  const target = T[0], x = target - T[1];
  const under = e.platforms.filter((p) => !p.broken && p.type === 'solid' && x >= p.x && x <= p.x + p.width).sort((a, b) => a.y - b.y)[0];
  if (!under) return { error: 'no ground at ' + x };
  e.input.state.right = false;
  Object.assign(e.player, { x, y: under.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, isVineSwinging: false, facing: 1, invincibleTimer: 0, hp: e.player.maxHp ?? 5 });
  e.checkpoint = { x, y: under.y };
  for (const p of e.platforms) if (p.chase) p.broken = false;
  e.startPieces();
  e.startCast();
  for (let i = 0; i < 10; i++) e.update(1 / 30);
  e.player.invincibleTimer = 0;
  const cover = (e.proto && e.proto.bushes || []).find((q) => q.kind === 'moss');
  const v = (e.vines || []).filter((q) => q.runner).sort((a, b) => b.x - a.x)[0];
  window.__b18 = { t: 0, f: 0, target, cover: cover ? { x: cover.x, w: cover.w } : null, vine: v ? v.id : null, press: -1, letGo: -1, noticed: -1, over: -1, hop: -99 };
  return { x, y: under.y, target, cover: window.__b18.cover };
})`;

const FRAME = `((E, clip) => {
  const e = eval(E);
  const S = window.__b18;
  const p = e.player;
  const st = e.input.state;
  const m = (e.cast && e.cast.sweepers || []).find((q) => q.e.kitPasses === 1);
  const ch = e.pieces.find((q) => q.kind === 'chase');
  const rp = e.pieces.find((q) => q.kind === 'rolling');
  const hz = (rp ? rp.list : []).filter((h) => h.phase !== 'wait' && h.phase !== 'gone');
  const feetY = p.y;
  const ahead = (dx) => e.platforms.filter((q) => !q.broken && q.type === 'solid' && p.x + dx >= q.x && p.x + dx <= q.x + q.width);
  const wall = ahead(36).some((q) => q.y < feetY - 6 && q.y > feetY - 140);
  const gap = !ahead(40).some((q) => Math.abs(q.y - feetY) < 30 || (q.y > feetY && q.y < feetY + 90));
  // (a nut on the ground closing on him: the flick when it is 30-80 px ahead; a fruit: never a press)
  const nut = hz.find((h) => h.spec.kind === 'low' && h.phase === 'down' && !h.spent && h.x - p.x > 30 && h.x - p.x < 80);
  const runIn = clip === 'fork' || clip === 'wayside' ? S.noticed < 0 || S.over >= 0 : clip === 'tip' ? S.press < 0 && p.x < S.target - 60 : true;
  if (runIn && p.grounded && (wall || gap || nut) && S.hop < S.f - 10) { S.hop = S.f; e.input.triggerTouchUp(0, 250); }
  if (S.hop === S.f - 8) e.input.releaseTouchUp();
  if (clip === 'fork') {
    const ph = m ? m.s.phase : 'none';
    if (S.noticed < 0 && ph === 'hunt') S.noticed = S.f;
    const inMoss = S.cover && p.x > S.cover.x + 40 && p.x < S.cover.x + S.cover.w - 40;
    if (S.noticed >= 0 && S.over < 0 && ph === 'rest' && S.f > S.noticed + 5) S.over = S.f;
    const hiding = S.noticed >= 0 && S.over < 0;
    st.right = !hiding || (!inMoss && p.x < S.cover.x + 40);
    st.left = hiding && !inMoss && p.x > S.cover.x + S.cover.w - 40;
  } else if (clip === 'tip') {
    st.right = true;
    if (S.press < 0 && p.grounded && p.x >= S.target - 30) { S.press = S.f; e.input.triggerTouchUp(0, 200); }
    if (S.press >= 0 && S.f - S.press === 6) e.input.releaseTouchUp();
    if (p.isVineSwinging && S.letGo < 0 && (p.swingAngle ?? 0) > 0.25 && (p.swingAngularVelocity ?? 0) > 0) { S.letGo = S.f; e.input.triggerTouchUp(0, 100); }
    if (S.letGo >= 0 && S.f - S.letGo === 3) e.input.releaseTouchUp();
  } else {
    st.right = true;
  }
  let sdt = 1 / 30;
  const slow = e.slowMoLeft > 0;
  if (slow) { e.slowMoLeft -= 1 / 30; sdt = 0.3 / 30; }
  e.update(sdt);
  if (clip !== 'wayside') e.clearGuide && e.clearGuide();
  e.render();
  S.f += 1;
  S.t += 1 / 30;
  const c = e.camera;
  const fronts = ch ? ch.run.fronts.map((f) => (f.active ? Math.round(f.front) : null)) : [];
  const own = e.platforms.filter((q) => q.chase && q.x < S.target + 2 && q.x + q.width > S.target - 3000);
  const box = [...document.querySelectorAll('body *')].filter((el) => el.children.length === 0 && /Dot keeps flying|Tap here when you/.test(el.textContent || '') && el.offsetParent).map((el) => el.textContent.trim().slice(0, 40));
  const near = hz.map((h) => ({ k: h.spec.kind, ph: h.phase, dx: Math.round(h.x - p.x), y: Math.round(h.y), spent: h.spent }));
  return { f: S.f - 1, t: +S.t.toFixed(2), x: Math.round(p.x), feet: Math.round(p.y), vx: Math.round(p.vx), hp: p.hp, grounded: p.grounded, easy: e.easy,
    heroAt: +((p.x - c.x) / c.viewportWidth).toFixed(3), phase: m ? m.s.phase : null, eye: m ? Math.round(m.s.eyeX) : null, calm: e.cast ? +e.cast.calmNow(e.easy).toFixed(2) : null,
    fronts, swinging: !!p.isVineSwinging, onVine: p.swingVineId === S.vine, slow, broken: own.filter((q) => q.broken).length, sections: own.length,
    press: S.press, letGo: S.letGo, noticed: S.noticed, over: S.over, hop: S.hop, hz: near, box };
})`;

for (const setting of sets.split(',')) {
  for (const tag of ors.split(',')) {
    const [w, hgt] = SIZES[tag];
    for (const clip of clips.split(',')) {
      const name = `${setting}-${clip}-${tag}`;
      const fdir = path.join(out, 'frames', name);
      fs.rmSync(fdir, { recursive: true, force: true });
      fs.mkdirSync(fdir, { recursive: true });
      const { ctx, p } = await open({ setting, w, h: hgt, fresh: clip === 'wayside' });
      const placed = await p.evaluate(`${PLACE}(${JSON.stringify(E)}, ${JSON.stringify(clip)})`);
      if (placed.error) { console.log(name, 'SKIP', placed.error); await ctx.close(); continue; }
      console.log(name, 'placed', JSON.stringify(placed));
      if (clip !== 'wayside') await p.getByText(/Tap here when you/).first().click({ timeout: 1500 }).catch(() => {});
      const log = [];
      let crackAt = -1;
      const n = 30 * ({ fork: 15, wayside: 14, tip: 8, crack: 6, nut: 6, fruit: 6 }[clip]);
      for (let i = 0; i < n; i++) {
        const s = await p.evaluate(`${FRAME}(${JSON.stringify(E)}, ${JSON.stringify(clip)})`);
        log.push(s);
        const hz = s.hz.map((q) => `${q.k}:${q.ph}@${q.dx}`).join(' ');
        const what = clip === 'fork' ? `eagle ${s.phase} eye ${s.eye} | moss ${s.calm}`
          : clip === 'tip' ? `${s.swinging ? 'ON LIANA' : s.grounded ? 'ground' : 'air'} | branch end ${s.broken}/${s.sections} fallen${s.slow ? ' | SLOW MOTION' : ''}`
          : clip === 'wayside' ? `box ${s.box.length ? 'UP: ' + s.box.join(' / ') : 'none'}`
          : `${s.grounded ? 'ground' : 'air'} | ${hz || 'no hazard live'}`;
        await caption(p, `BUILD-18 | 1-8 seed 1 | built ${s.easy ? 'EASY' : 'NORMAL'} | ${w}x${hgt} ${tag} | ${clip} | f${s.f} t ${s.t.toFixed(2)} s | hp ${s.hp} | ${what} | fronts ${s.fronts.join(',')}`);
        await p.screenshot({ path: path.join(fdir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 80 });
        if (clip === 'fork' && s.over >= 0 && s.fronts.some((q, k) => q !== null && k > 0 && log[0].fronts[k] === null)) crackAt = crackAt < 0 ? i : crackAt;
        if (clip === 'fork' && crackAt >= 0 && i >= crackAt + 30) break;
        if (clip === 'tip' && s.letGo >= 0 && s.grounded && i > s.letGo + 25) break;
      }
      await ctx.close();
      const file = path.join(out, `${name}.mp4`);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(fdir, 'f%04d.jpg'), '-vf', 'scale=trunc(iw/4)*2:trunc(ih/4)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28', '-preset', 'slow', '-an', file]);
      const at = (fn) => log.findIndex(fn);
      const first = (kind, ph) => at((s) => s.hz.some((q) => q.k === kind && q.ph === ph));
      const keys = {
        nut: { start: 0, drop: first('low', 'drop'), lands: first('low', 'down'), hop: log.find((s) => s.hop >= 0)?.hop ?? -1, cleared: at((s, i) => i > 0 && s.hz.some((q) => q.k === 'low' && q.dx < -30)) },
        fruit: { start: 0, drop: first('high', 'drop'), lands: first('high', 'down'), overHim: at((s) => s.hz.some((q) => q.k === 'high' && Math.abs(q.dx) < 25)), cleared: at((s) => s.hz.some((q) => q.k === 'high' && q.dx < -60)) },
        crack: { start: 0, crack: at((s) => s.fronts[0] !== null && s.fronts[0] !== undefined), firstFall: at((s) => s.broken > 0), nutDrop: first('low', 'drop') },
        fork: { start: 0, screech: at((s) => s.phase === 'hunt'), hidden: at((s) => s.calm >= 1), eyeOverHim: at((s) => s.calm >= 1 && s.eye !== null && Math.abs(s.eye - s.x) < 40), passOver: at((s) => s.over >= 0), crack: crackAt },
        tip: { start: 0, press: log.find((s) => s.press >= 0)?.press ?? -1, caught: at((s) => s.onVine), tipFalls: at((s) => s.sections > 0 && s.broken === s.sections), slow: at((s) => s.slow), letGo: log.find((s) => s.letGo >= 0)?.letGo ?? -1, landed: at((s, i) => s.letGo >= 0 && i > s.letGo && s.grounded) },
        wayside: { start: 0, boxUp: at((s) => s.box.length > 0), boxGone: at((s, i) => i > 0 && log[i - 1].box.length > 0 && s.box.length === 0), end: log.length - 1 },
      }[clip];
      for (const [k, f] of Object.entries(keys)) if (f >= 0) fs.copyFileSync(path.join(fdir, `f${String(f).padStart(4, '0')}.jpg`), path.join(out, `${name}-${k}-f${f}.jpg`));
      fs.rmSync(fdir, { recursive: true, force: true });
      fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(log));
      console.log('wrote', file, JSON.stringify({ frames: log.length, keys, hpLost: log[0].hp - log.at(-1).hp, easy: log.at(-1).easy, slowFrames: log.filter((s) => s.slow).length }));
    }
  }
}
await b.close();
