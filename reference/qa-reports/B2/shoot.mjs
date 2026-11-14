// B2: the chase piece on screen, judged on CLIPS (D63), from a RealPlay.bare-equivalent world in the real page (world.mjs), never a
// hand-mixed scene. Per setting and orientation: stills (the crack opening under him, a section mid-collapse with debris, the fork
// both ways) and a 6 s clip (the front closes to ~60 px, he runs off and pulls away). The camera is the shooter's, framed by the front
// (camera.x = max(front - 0.4 vw, him - 0.8 vw): at the packet's 0.25 the halves of a broken section fell out of frame at once (B2 trial): the chase camera is B6's); every frame's caption is what the game BUILT (D62).
//   PORT=5199 node reference/qa-reports/B2/shoot.mjs <out dir> <stage> [normal,easy] [upright,sideways] [stills,clip]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { E, bareBranch, caption, openStage } from './world.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, id, sets = 'normal,easy', ors = 'upright,sideways', what = 'stills,clip'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const SIZES = { upright: [412, 915], sideways: [915, 412] };
const b = await chromium.launch();

/** the long-branch sheet loaded, as builtStageKeys 'props3' gets it in behind the card for a stage that lays a chase */
async function warm(p) {
  await p.evaluate(async () => (await import('/src/game/protoArt.ts')).warmProto3());
  await p.waitForFunction(async () => {
    const a = await import('/src/game/atlasLoader.ts');
    const u = (await import('/src/game/protoArt.ts')).PROTO3_URL;
    return !a.pendingSheets().includes(u);
  }, null, { timeout: 15000, polling: 200 }).catch(() => console.log('props3 NOT READY'));
  await p.waitForTimeout(400);
}

/** place him (no piece runs while he settles), start the pieces again, and optionally set the first front (a scene setup) */
async function place(p, built, at, preset) {
  await p.evaluate(([E, built, at, preset]) => {
    const e = eval(E);
    e.pieces = [];
    for (const q of e.platforms) q.broken = false;
    e.input.state.right = false;
    Object.assign(e.player, { x: built.x0 + at, y: built.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0, hp: e.player.maxHp ?? 5 });
    for (let i = 0; i < 45; i++) e.update(1 / 30);
    e.player.invincibleTimer = 0;
    e.startPieces();
    window.__b2t = 0;
    if (preset !== null) {
      const pc = e.pieces.find((q) => q.kind === 'chase');
      Object.assign(pc.run.fronts[0], { front: built.x0 + preset, active: true, hold: 0 });
      // (the sections behind a preset front are already fallen: the setup's own frame drops them, and their halves are cleared)
      e.update(1 / 30);
      pc.debris = [];
    }
  }, [E, built, at, preset]);
}

/** one frame: step, frame the camera by the front, draw; returns what the game holds now (for the caption and the stop rule) */
const FRAME = `(() => {
  const e = ${E};
  e.update(1 / 30);
  window.__b2t = (window.__b2t ?? 0) + 1 / 30;
  e.clearGuide?.();
  const pc = e.pieces.find((q) => q.kind === 'chase');
  const vw = e.camera.viewportWidth / (e.zoom || 1);
  const fronts = pc ? pc.run.fronts.filter((f) => f.active) : [];
  const near = fronts.filter((f) => f.front <= e.player.x).sort((a, b) => b.front - a.front)[0] ?? fronts[0];
  if (near && window.__b2frame !== 'fork') e.camera.x = e.camera.targetX = Math.max(near.front - 0.4 * vw, e.player.x - 0.8 * vw);
  if (window.__b2frame === 'fork') e.camera.x = e.camera.targetX = window.__b2forkCam;
  e.render();
  return { gap: near ? Math.round(e.player.x - near.front) : null, debris: pc ? pc.debris.length : 0, hp: e.player.hp, t: +window.__b2t.toFixed(2), x: Math.round(e.player.x), easy: e.easy, vw: Math.round(vw) };
})()`;

const cap = (id, built, tag, w, h, shot, s) =>
  `B2 chase | ${id} (World ${built.world}) bare world | built ${s.easy ? 'EASY' : 'NORMAL'} | ${w}x${h} ${tag} | ${shot} | front ${s.gap ?? 'none'} px behind | hp ${s.hp} | t ${s.t.toFixed(1)} s | camera: shooter, by the front`;

for (const setting of sets.split(',')) {
  for (const tag of ors.split(',')) {
    const [w, h] = SIZES[tag];
    const easyRow = setting === 'easy';
    if (what.includes('stills')) {
      const { ctx, p } = await openStage(b, { id, setting, w, h });
      const built = await bareBranch(p);
      await warm(p);
      const st0 = built.lay.stretches[0];
      // [name, where he stands (from x0), the first front preset (from x0) or null, stop rule]
      // he stands 150 px into a section of stretch 1 (the lay's sections are 200 px): the section behind his falls with the front 150
      // px behind him (the opening right behind his heels, his own section cracking under him), and its halves are mid-fall ~0.35 s later
      const sec = built.secs.find((q) => q.x0 > st0.start + 300);
      const shots = [
        ['crack (opening behind him, his section cracking)', sec.x0 + 150 - built.x0, null, (s) => s.gap !== null && s.gap <= 150 && s.debris > 0],
        ['collapse (a section mid-fall)', sec.x0 + 150 - built.x0, null, (s) => s.gap !== null && s.debris > 0 && s.gap <= 150 - 0.35 * (easyRow ? 170 : 230)],
      ];
      for (const [name, at, preset, stop] of shots) {
        await place(p, built, at, preset);
        let s;
        for (let i = 0; i < 30 * 8; i++) {
          s = await p.evaluate(FRAME);
          if (stop(s)) break;
        }
        await caption(p, cap(id, built, tag, w, h, name, s));
        await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
        const file = path.join(out, `${id}-${setting}-${name.split(' ')[0]}-${tag}.jpg`);
        await p.screenshot({ path: file, type: 'jpeg', quality: 80 });
        console.log('wrote', file, JSON.stringify(s));
      }
      // the fork both ways: the front preset 300 px short of the fork, him on the fork; the camera on the fork's near edge (the fallen
      // stretch behind and the fork), then on its far edge (the fork and the whole stretch ahead); sideways shows both in one
      const forkL = st0.end;
      const forkR = built.lay.stretches[1].start;
      // [name, the world x the camera puts at `frac` of the view]
      const views = tag === 'sideways' ? [['fork', (forkL + forkR) / 2, 0.5]] : [['fork-behind', forkL, 0.3], ['fork-ahead', forkR, 0.7]];
      for (const [name, wx, frac] of views) {
        await place(p, built, (forkL + forkR) / 2 - built.x0, forkL - 300 - built.x0);
        await p.evaluate(([E, wx, frac]) => { const e = eval(E); window.__b2frame = 'fork'; window.__b2forkCam = wx - frac * e.camera.viewportWidth / (e.zoom || 1); }, [E, wx, frac]);
        let s;
        for (let i = 0; i < Math.round(30 * (easyRow ? 1.9 : 1.4)); i++) s = await p.evaluate(FRAME);
        await p.evaluate(() => { window.__b2frame = ''; });
        await caption(p, cap(id, built, tag, w, h, `${name} (front stopped at the fork)`, s));
        await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
        const file = path.join(out, `${id}-${setting}-${name}-${tag}.jpg`);
        await p.screenshot({ path: file, type: 'jpeg', quality: 80 });
        console.log('wrote', file, JSON.stringify(s));
      }
      await ctx.close();
    }
    if (what.includes('clip')) {
      const vdir = path.join(out, 'raw');
      const { ctx, p } = await openStage(b, { id, setting, w, h, video: vdir });
      const t0 = p.__t0;
      const built = await bareBranch(p);
      await warm(p);
      const st0 = built.lay.stretches[0];
      await place(p, built, st0.start - built.x0 + 10, null);
      await caption(p, '');
      const from = (Date.now() - t0) / 1000;
      // real time at 30 fps in the page: he stands till the front is ~60 px behind, then runs off (Right held) and pulls away
      const log = await p.evaluate(([FRAME, label]) => new Promise((res) => {
        const rows = [];
        let ran = false;
        const start = performance.now();
        let n = 0;
        const tick = () => {
          const s = eval(FRAME);
          if (!ran && s.gap !== null && s.gap <= 60) {
            ran = true;
            (typeof window.__engine === 'function' ? window.__engine() : window.__engine).input.state.right = true;
          }
          rows.push(s);
          document.getElementById('b2cap').textContent = label.replace('%', `${ran ? 'running' : 'standing'} | front ${s.gap ?? 'none'} px behind | hp ${s.hp} | t ${s.t.toFixed(1)} s`);
          n++;
          if (performance.now() - start > 6500) return res(rows);
          setTimeout(tick, Math.max(0, start + (n * 1000) / 30 - performance.now()));
        };
        tick();
      }), [FRAME, `B2 chase | ${id} (World ${built.world}) bare world | built ${built.easy ? 'EASY' : 'NORMAL'} | ${w}x${h} ${tag} | %`]);
      const v = p.video();
      await ctx.close();
      const raw = await v.path();
      const file = path.join(out, `${id}-${setting}-clip-${tag}.mp4`);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(from), '-i', raw, '-t', '6.5', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-an', file]);
      const g = log.map((s) => s.gap);
      const minGap = Math.min(...g.filter((x) => x !== null));
      console.log('wrote', file, JSON.stringify({ from: from.toFixed(1), frames: log.length, minGap, endGap: g.at(-1), hp: log.at(-1).hp, easy: log.at(-1).easy }));
    }
  }
}
await b.close();
