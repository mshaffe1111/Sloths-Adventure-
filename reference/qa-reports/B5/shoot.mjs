// B5: the rolling nut, the bouncing fruit and the chase camera's lead on the REAL page, on the laid-chase dev fixture (?fixture=chase,
// window.__play('1-98'): the game's own gen2 chase with its hazards laid by data, chaseFixtureStage.ts). The engine steps one fixed step a
// frame (the page's loop paused) and draws with the game's own camera: nothing here moves the view. Clips, 30 fps (D63), key frames NAMED
// from the game's own state at that frame (D69), every caption what the game built (D62):
//   nut:   he starts on the teach nut's run-in (the view in the chase lead: him 13% across upright), runs; the nut drops in (its
//          thunk), rolls at him, he hops it as it closes (a press the frame names), and runs on past it: no touch
//   fruit: on a running stretch (the crack behind him), a fruit drops in ahead, bounces at him; he runs on under it (no press): no touch
//   PORT=5199 node reference/qa-reports/B5/shoot.mjs <out dir> [normal,easy] [upright,sideways] [nut,fruit]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { E, caption, openStage } from '../B2/world.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, sets = 'normal,easy', ors = 'upright,sideways', clips = 'nut,fruit'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const SIZES = { upright: [412, 915], sideways: [915, 412] };
const b = await chromium.launch();

// (place him `before` px ahead of the hazard's set-off, on the ground there; his flag there; every piece started again)
const PLACE = `((E, clip) => {
  const e = eval(E);
  e.isPaused = true;
  const st = e.currentStage;
  const rl = st.rolling || [];
  const h = clip === 'nut' ? rl.find((q) => q.kind === 'low' && q.teach) : rl.find((q) => q.kind === 'high' && !q.teach);
  if (!h) return { error: 'no ' + clip + ' on this roll: ' + JSON.stringify(rl) };
  const lay = st.chase;
  // (430 px before where it lands: on its own unbroken run-in (the lay keeps 440 px), just short of its set-off; the view has eased into
  // the chase lead while he settles. On the stretch the front sets off behind him as he starts)
  const x = h.dropX - 430;
  const under = e.platforms.filter((p) => !p.broken && x >= p.x && x <= p.x + p.width).sort((a, b) => a.y - b.y)[0];
  if (!under) return { error: 'no ground at ' + x };
  e.input.state.right = false;
  Object.assign(e.player, { x, y: under.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, isVineSwinging: false, facing: 1, invincibleTimer: 0, hp: e.player.maxHp ?? 5 });
  e.checkpoint = { x, y: under.y };
  for (const p of e.platforms) if (p.chase) p.broken = false;
  e.startPieces();
  for (let i = 0; i < 20; i++) e.update(1 / 30);
  e.player.invincibleTimer = 0;
  window.__b5 = { t: 0, dropX: h.dropX, kind: h.kind, press: -1 };
  return { x, y: under.y, dropX: h.dropX, stretches: lay ? lay.stretches : null };
})`;

const FRAME = `((E, clip) => {
  const e = eval(E);
  const S = window.__b5;
  const rp = e.pieces.find((q) => q.kind === 'rolling');
  const h = rp.list.find((q) => q.spec.dropX === S.dropX);
  const p = e.player;
  const st = e.input.state;
  st.right = true;
  // (the nut: one hop as its near side closes to 60 px of his, held three frames; the fruit: no press at all)
  if (clip === 'nut') {
    const near = (h.x - p.x) - 15 - p.width / 2;
    // (the real touch flick, inputEngine.ts triggerTouchUp: a bare jumpPressed is cleared by the engine first, D69), held 100 ms
    if (S.press < 0 && h.phase === 'down' && near <= 60 && near > -6) { S.press = S.f ?? 0; e.input.triggerTouchUp(0, 100); }
    if (S.press >= 0 && (S.f ?? 0) - S.press === 3) e.input.releaseTouchUp();
  }
  e.update(1 / 30);
  e.clearGuide?.();
  e.render();
  S.f = (S.f ?? 0) + 1;
  S.t += 1 / 30;
  const c = e.camera;
  const vw = c.viewportWidth;
  const ch = e.pieces.find((q) => q.kind === 'chase');
  const fronts = ch ? ch.run.fronts.filter((f) => f.active) : [];
  return { f: S.f - 1, t: +S.t.toFixed(2), phase: h.phase, hx: Math.round(h.x), hy: Math.round(h.y), spent: h.spent, x: Math.round(p.x), feet: Math.round(p.y),
    vx: Math.round(p.vx), hp: p.hp, heroAt: +((p.x - c.x) / vw).toFixed(3), vw: Math.round(vw), easy: e.easy, press: S.press, chase: fronts.length > 0,
    clear: h.spec.kind === 'high' ? Math.round(p.y - 89.1 - (h.y + 21)) : null, near: Math.round(h.x - p.x - 15 - p.width / 2), hvx: Math.round(h.vx), seenAhead: Math.round(c.x + vw - p.x) };
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
      await p.getByText(/Tap here when you/).first().click({ timeout: 1500 }).catch(() => {});
      const log = [];
      const n = 30 * 4.5;
      for (let i = 0; i < n; i++) {
        const s = await p.evaluate(`${FRAME}(${JSON.stringify(E)}, ${JSON.stringify(clip)})`);
        log.push(s);
        // (the clip ends a second after the hazard is behind him: past that he would run on blind into the next gap)
        if (s.phase === 'down' && s.hx < s.x - 60 && log.findIndex((q) => q.phase === 'down' && q.hx < q.x - 60) < i - 30) break;
        await caption(p, `B5 | 1-98 fixture (gen2 chase) | built ${s.easy ? 'EASY' : 'NORMAL'} | ${w}x${hgt} ${tag} | ${clip} | f${s.f} t ${s.t.toFixed(2)} s | ${s.phase}${s.spent ? ' TOUCHED' : ''} | him ${Math.round(s.heroAt * 100)}% across, ${s.seenAhead} px ahead seen | ${s.chase ? 'chase running' : 'no front yet'}${s.press === s.f ? ' | HOP' : ''}${s.clear !== null && Math.abs(s.hx - s.x) < 30 ? ` | over his head by ${s.clear} px` : ''}`);
        await p.screenshot({ path: path.join(fdir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 85 });
      }
      await ctx.close();
      const file = path.join(out, `${name}.mp4`);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(fdir, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow', '-an', file]);
      const at = (fn) => log.findIndex(fn);
      const dropF = at((s) => s.phase === 'drop');
      const keys = {
        start: 0,
        setOff: dropF,
        thunk: at((s) => s.phase === 'down'),
        ...(clip === 'nut' ? { hop: log.find((s) => s.press >= 0)?.press ?? -1, past: at((s) => s.phase === 'down' && s.hx < s.x - 40) } : {}),
        ...(clip === 'fruit' ? { over: at((s) => s.phase === 'down' && Math.abs(s.hx - s.x) < 12), past: at((s) => s.phase === 'down' && s.hx < s.x - 60) } : {}),
      };
      for (const [k, f] of Object.entries(keys)) if (f >= 0) fs.copyFileSync(path.join(fdir, `f${String(f).padStart(4, '0')}.jpg`), path.join(out, `${name}-${k}.jpg`));
      fs.rmSync(fdir, { recursive: true, force: true });
      fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(log));
      const touched = log.some((s) => s.spent);
      const overS = keys.over !== undefined && keys.over >= 0 ? log[keys.over] : null;
      console.log('wrote', file, JSON.stringify({ frames: log.length, keys, touched, hpLost: log[0].hp - log.at(-1).hp, easy: log.at(-1).easy,
        heroAtStart: log[0].heroAt, heroAtSetOff: dropF >= 0 ? log[dropF].heroAt : null, seenAheadAtSetOff: dropF >= 0 ? log[dropF].seenAhead : null,
        dropToTouchOrPass: dropF >= 0 && keys.past >= 0 ? +((keys.past - dropF) / 30).toFixed(2) : null, clearOver: overS ? overS.clear : null }));
    }
  }
}
await b.close();
