// B6: 1-8's last engine pieces on the REAL page, on the laid-chase dev fixture (?fixture=chase, window.__play('1-98'): the game's own gen2
// chase with B5's hazards and B6's pieces laid by data, chaseFixtureStage.ts layFixturePieces). B5's method (shoot.mjs): the page's loop
// paused, the engine stepped one fixed step a frame, drawn with the game's own camera; clips at 30 fps (D63), key frames NAMED from the
// game's own state at that frame (D69), every caption what the game built (D62). The engine's slow motion lives in its frame loop
// (engine.ts tick: while slowMoLeft > 0 a frame steps 0.3 of its time), so each frame here runs those same lines.
//   fork: he runs onto the still fork from the stretch before it at his top run; the eagle's screech as he arrives; he stops in the moss
//         carpet and holds still while its eye crosses toward him; the pass ends; he runs on and the next crack sets off behind him
//   tip:  he runs the last stretch to the tip at his top run and presses at its lip (the real touch flick, triggerTouchUp); the runner
//         liana meets him; as he leaves the tip the whole branch end falls in slow motion; he lets go at the swing's front and lands
//   PORT=5199 node reference/qa-reports/B6/shoot.mjs <out dir> [normal,easy] [upright,sideways] [fork,tip]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { E, caption, openStage } from '../B2/world.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, sets = 'normal,easy', ors = 'upright,sideways', clips = 'fork,tip'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const SIZES = { upright: [412, 915], sideways: [915, 412] };
const b = await chromium.launch();

// (place him 700 px before the still fork (on the stretch before it) or the tip's lip, on the ground there, his flag there)
const PLACE = `((E, clip) => {
  const e = eval(E);
  e.isPaused = true;
  const st = e.currentStage;
  const lay = st.chase;
  if (!lay) return { error: 'no chase' };
  const sw = (e.cast && e.cast.sweepers) || [];
  const eagle = sw.find((m) => m.e.kitPasses === 1);
  const last = lay.stretches[lay.stretches.length - 1];
  const target = clip === 'fork' ? (eagle ? eagle.s.minX : null) : (last.tip ? last.end : null);
  if (target === null) return { error: 'no ' + clip + ' on this roll' };
  const x = target - (clip === 'fork' ? 700 : 1100);
  const under = e.platforms.filter((p) => !p.broken && x >= p.x && x <= p.x + p.width).sort((a, b) => a.y - b.y)[0];
  if (!under) return { error: 'no ground at ' + x };
  e.input.state.right = false;
  Object.assign(e.player, { x, y: under.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, isVineSwinging: false, facing: 1, invincibleTimer: 0, hp: e.player.maxHp ?? 5 });
  e.checkpoint = { x, y: under.y };
  for (const p of e.platforms) if (p.chase) p.broken = false;
  e.startPieces();
  e.startCast();
  for (let i = 0; i < 20; i++) e.update(1 / 30);
  e.player.invincibleTimer = 0;
  const cover = (e.proto && e.proto.bushes || []).find((b) => eagle && b.x >= eagle.s.minX && b.x < eagle.s.minX + 400);
  const v = (e.vines || []).find((q) => q.runner);
  window.__b6 = { t: 0, f: 0, target, cover: cover ? { x: cover.x, w: cover.w } : null, vine: v ? v.id : null, press: -1, letGo: -1, noticed: -1, over: -1, phase0: v ? v.swingPhase : null };
  return { x, y: under.y, target, stretches: lay.stretches, cover: window.__b6.cover, vine: v ? { x: v.x, phase: v.swingPhase } : null };
})`;

const FRAME = `((E, clip) => {
  const e = eval(E);
  const S = window.__b6;
  const p = e.player;
  const st = e.input.state;
  const m = (e.cast && e.cast.sweepers || []).find((q) => q.e.kitPasses === 1);
  const ch = e.pieces.find((q) => q.kind === 'chase');
  // (on the run in, a hop at a step up or a gap's edge ahead, the real touch flick held 8 frames: the stretch is 1-1's own stepped ground)
  const feetY = p.y;
  const ahead = (dx) => e.platforms.filter((q) => !q.broken && q.type === 'solid' && p.x + dx >= q.x && p.x + dx <= q.x + q.width);
  const wall = ahead(36).some((q) => q.y < feetY - 6 && q.y > feetY - 140);
  const gap = !ahead(40).some((q) => Math.abs(q.y - feetY) < 30 || (q.y > feetY && q.y < feetY + 90));
  const runIn = clip === 'fork' ? S.noticed < 0 || S.over >= 0 : S.press < 0 && p.x < S.target - 60;
  if (runIn && p.grounded && (wall || gap) && (S.hop ?? -99) < S.f - 10) { S.hop = S.f; e.input.triggerTouchUp(0, 250); }
  if ((S.hop ?? -99) === S.f - 8) e.input.releaseTouchUp();
  if (clip === 'fork') {
    const ph = m ? m.s.phase : 'none';
    if (S.noticed < 0 && ph === 'hunt') S.noticed = S.f;
    const inMoss = S.cover && p.x > S.cover.x + 40 && p.x < S.cover.x + S.cover.w - 40;
    // (from the screech to the pass's end he makes for the moss and holds still in it; before and after he runs)
    if (S.noticed >= 0 && S.over < 0 && ph === 'rest' && S.f > S.noticed + 5) S.over = S.f;
    const hiding = S.noticed >= 0 && S.over < 0;
    st.right = !hiding || (!inMoss && p.x < S.cover.x + 40);
    st.left = hiding && !inMoss && p.x > S.cover.x + S.cover.w - 40;
  } else {
    st.right = true;
    // (the press at the lip: the real touch flick, held 6 frames; on the liana, a second flick at the front of its swing lets him go)
    if (S.press < 0 && p.grounded && p.x >= S.target - 30) { S.press = S.f; e.input.triggerTouchUp(0, 200); }
    if (S.press >= 0 && S.f - S.press === 6) e.input.releaseTouchUp();
    if (p.isVineSwinging && S.letGo < 0 && (p.swingAngle ?? 0) > 0.25 && (p.swingAngularVelocity ?? 0) > 0) { S.letGo = S.f; e.input.triggerTouchUp(0, 100); }
    if (S.letGo >= 0 && S.f - S.letGo === 3) e.input.releaseTouchUp();
  }
  // (the engine's own frame loop, engine.ts tick: slow motion steps 0.3 of the frame while it lasts)
  let sdt = 1 / 30;
  const slow = e.slowMoLeft > 0;
  if (slow) { e.slowMoLeft -= 1 / 30; sdt = 0.3 / 30; }
  e.update(sdt);
  e.clearGuide && e.clearGuide();
  e.render();
  S.f += 1;
  S.t += 1 / 30;
  const c = e.camera;
  const vw = c.viewportWidth;
  const fronts = ch ? ch.run.fronts.map((f) => (f.active ? Math.round(f.front) : null)) : [];
  const own = e.platforms.filter((q) => q.chase && q.x < S.target + 2 && q.x + q.width > S.target - 3000);
  return { f: S.f - 1, t: +S.t.toFixed(2), x: Math.round(p.x), feet: Math.round(p.y), vx: Math.round(p.vx), hp: p.hp, grounded: p.grounded, easy: e.easy,
    heroAt: +((p.x - c.x) / vw).toFixed(3), phase: m ? m.s.phase : null, eye: m ? Math.round(m.s.eyeX) : null, calm: e.cast ? +e.cast.calmNow(e.easy).toFixed(2) : null,
    fronts, swinging: !!p.isVineSwinging, onVine: p.swingVineId === S.vine, slow, broken: own.filter((q) => q.broken).length, sections: own.length,
    press: S.press, letGo: S.letGo, noticed: S.noticed, over: S.over };
})`;

for (const setting of sets.split(',')) {
  for (const tag of ors.split(',')) {
    const [w, hgt] = SIZES[tag];
    for (const clip of clips.split(',')) {
      const name = `${setting}-${clip}-${tag}`;
      const fdir = path.join(out, 'frames', name);
      fs.rmSync(fdir, { recursive: true, force: true });
      fs.mkdirSync(fdir, { recursive: true });
      const { ctx, p } = await openStage(b, { id: '1-98', setting, w, h: hgt });
      const placed = await p.evaluate(`${PLACE}(${JSON.stringify(E)}, ${JSON.stringify(clip)})`);
      if (placed.error) { console.log(name, 'SKIP', placed.error); await ctx.close(); continue; }
      console.log(name, 'placed', JSON.stringify(placed));
      await p.getByText(/Tap here when you/).first().click({ timeout: 1500 }).catch(() => {});
      const log = [];
      let S_crack = -1;
      const n = 30 * (clip === 'fork' ? 15 : 8);
      for (let i = 0; i < n; i++) {
        const s = await p.evaluate(`${FRAME}(${JSON.stringify(E)}, ${JSON.stringify(clip)})`);
        log.push(s);
        const what = clip === 'fork'
          ? `eagle ${s.phase} eye ${s.eye} | moss ${s.calm} | hp ${s.hp}`
          : `${s.swinging ? 'ON LIANA' : s.grounded ? 'ground' : 'air'} | branch end ${s.broken}/${s.sections} fallen${s.slow ? ' | SLOW MOTION' : ''}`;
        await caption(p, `B6 | 1-98 fixture (gen2 chase) | built ${s.easy ? 'EASY' : 'NORMAL'} | ${w}x${hgt} ${tag} | ${clip} | f${s.f} t ${s.t.toFixed(2)} s | ${what} | fronts ${s.fronts.join(',')}`);
        await p.screenshot({ path: path.join(fdir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 85 });
        if (clip === 'fork' && s.over >= 0 && s.fronts[1] !== null && s.fronts[1] !== undefined) S_crack = S_crack < 0 ? i : S_crack;
        if (clip === 'fork' && S_crack >= 0 && i >= S_crack + 30) break;
        if (clip === 'tip' && s.letGo >= 0 && s.grounded && i > s.letGo + 25) break;
      }
      await ctx.close();
      const file = path.join(out, `${name}.mp4`);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(fdir, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow', '-an', file]);
      const at = (fn) => log.findIndex(fn);
      const keys = clip === 'fork'
        ? { start: 0, screech: at((s) => s.phase === 'hunt'), eyeMoves: at((s, i) => i > 0 && s.phase === 'hunt' && s.eye !== log[i - 1].eye), hidden: at((s) => s.calm >= 1),
            eyeOverHim: at((s) => s.calm >= 1 && s.eye !== null && Math.abs(s.eye - s.x) < 40), passOver: at((s) => s.over >= 0), crack: at((s) => s.fronts[1] !== null && s.fronts[1] !== undefined) }
        : { start: 0, press: log.find((s) => s.press >= 0)?.press ?? -1, caught: at((s) => s.onVine), tipFalls: at((s) => s.sections > 0 && s.broken === s.sections), slow: at((s) => s.slow),
            letGo: log.find((s) => s.letGo >= 0)?.letGo ?? -1, landed: at((s, i) => s.letGo >= 0 && i > s.letGo && s.grounded) };
      for (const [k, f] of Object.entries(keys)) if (f >= 0) fs.copyFileSync(path.join(fdir, `f${String(f).padStart(4, '0')}.jpg`), path.join(out, `${name}-${k}.jpg`));
      fs.rmSync(fdir, { recursive: true, force: true });
      fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(log));
      console.log('wrote', file, JSON.stringify({ frames: log.length, keys, hpLost: log[0].hp - log.at(-1).hp, easy: log.at(-1).easy, slowFrames: log.filter((s) => s.slow).length }));
    }
  }
}
await b.close();
