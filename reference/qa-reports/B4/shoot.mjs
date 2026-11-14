// B4: the laid chase on screen with the baked C4 edge, judged on CLIPS (D63) and by NAMED FRAMES (D69), from B2's lead-passed world
// (../B2/world.mjs: a RealPlay.bare-equivalent branch in the real page, the stage's own backdrop; camera = B2's shooter framing by the
// front, the chase camera being B6's). Two clips per setting and orientation, 30 fps, one engine step a frame:
//   edge:   he stands just past the crack; the front sets off, closes (the ember edge grows at the break), at 60 px he runs and pulls away
//   caught: he stands on; the front reaches him: a heart, back at his flag, the branch whole again
// Every frame's caption is what the game holds (D62); each clip's key frames are printed by name from the same state.
//   PORT=5199 node reference/qa-reports/B4/shoot.mjs <out dir> <stage> [normal,easy] [upright,sideways] [edge,caught]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { E, bareBranch, caption, openStage } from '../B2/world.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, id, sets = 'normal,easy', ors = 'upright,sideways', clips = 'edge,caught'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const SIZES = { upright: [412, 915], sideways: [915, 412] };
const b = await chromium.launch();

async function warm(p) {
  await p.evaluate((E) => eval(E).render(), E);
  await p.evaluate(async () => (await import('/src/game/protoArt.ts')).warmProto3());
  await p.waitForFunction(async () => {
    const a = await import('/src/game/atlasLoader.ts');
    const u = (await import('/src/game/protoArt.ts')).PROTO3_URL;
    return !a.pendingSheets().includes(u);
  }, null, { timeout: 15000, polling: 200 }).catch(() => console.log('props3 NOT READY'));
  await p.waitForTimeout(1500);
}
async function tapDot(p) {
  const loc = p.getByText(/Tap here when you/).first();
  if (!(await loc.count())) return false;
  await loc.click({ timeout: 1500 }).catch(() => {});
  await p.waitForTimeout(350);
  return true;
}

const FRAME = `(() => {
  const e = ${E};
  e.update(1 / 30);
  window.__b4t = (window.__b4t ?? 0) + 1 / 30;
  e.clearGuide?.();
  const pc = e.pieces.find((q) => q.kind === 'chase');
  const vw = e.camera.viewportWidth / (e.zoom || 1);
  const fronts = pc ? pc.run.fronts.filter((f) => f.active) : [];
  const near = fronts.filter((f) => f.front <= e.player.x).sort((a, b) => b.front - a.front)[0] ?? fronts[0];
  if (near) e.camera.x = e.camera.targetX = Math.max(near.front - 0.4 * vw, e.player.x - 0.6 * vw);
  e.render();
  const gap = near ? Math.round(e.player.x - near.front) : null;
  return { gap, k: gap === null ? 0 : +Math.max(0, Math.min(1, (650 - gap) / 500)).toFixed(2), active: fronts.length, debris: pc ? pc.debris.length : 0,
    broken: e.platforms.filter((q) => q.chase && q.broken).length, hp: e.player.hp, t: +window.__b4t.toFixed(2), x: Math.round(e.player.x), easy: e.easy };
})()`;

for (const setting of sets.split(',')) {
  for (const tag of ors.split(',')) {
    const [w, h] = SIZES[tag];
    for (const clip of clips.split(',')) {
      const fdir = path.join(out, 'frames', `${id}-${setting}-${clip}-${tag}`);
      fs.rmSync(fdir, { recursive: true, force: true });
      fs.mkdirSync(fdir, { recursive: true });
      const { ctx, p } = await openStage(b, { id, setting, w, h });
      const built = await bareBranch(p);
      await warm(p);
      await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => console.log('stage card STILL UP'));
      await p.getByText(/This stage/).first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => console.log('card text STILL UP'));
      const st0 = built.lay.stretches[0];
      // (he stands 10 px past the crack, his flag 300 px into the run-up; no piece runs while he settles)
      await p.evaluate(([E, built, at]) => {
        const e = eval(E);
        e.pieces = [];
        for (const q of e.platforms) q.broken = false;
        e.input.state.right = false;
        Object.assign(e.player, { x: at, y: built.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0, hp: e.player.maxHp ?? 5 });
        for (let i = 0; i < 45; i++) e.update(1 / 30);
        e.player.invincibleTimer = 0;
        e.checkpoint = { x: built.x0 + 300, y: built.y };
        e.startPieces();
        window.__b4t = 0;
      }, [E, built, st0.start + 10]);
      await caption(p, '');
      await tapDot(p);
      const log = [];
      let ran = false, ranAt = -1;
      const n = clip === 'edge' ? 30 * 6.5 : 30 * 7;
      for (let i = 0; i < n; i++) {
        const s = await p.evaluate(FRAME);
        if (clip === 'edge' && !ran && s.gap !== null && s.gap <= 60) {
          ran = true;
          ranAt = i;
          await p.evaluate((E) => { eval(E).input.state.right = true; }, E);
        }
        log.push(s);
        await tapDot(p);
        await caption(p, `B4 chase | ${id} bare branch | built ${s.easy ? 'EASY' : 'NORMAL'} | ${w}x${h} ${tag} | ${clip} | f${i} t ${s.t.toFixed(2)} s | ${ran ? 'running' : 'standing'} | front ${s.gap ?? 'none'} px behind | edge k ${s.k} | broken ${s.broken} | hp ${s.hp}`);
        await p.screenshot({ path: path.join(fdir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 85 });
      }
      await ctx.close();
      const file = path.join(out, `${id}-${setting}-${clip}-${tag}.mp4`);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(fdir, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow', '-an', file]);
      // (the key frames, named from the game's own state (D69); kept as stills beside the clip)
      const at = (f) => log.findIndex(f);
      const hp0 = log[0].hp;
      const caughtF = at((s) => s.hp < hp0);
      const keys = {
        crack: at((s) => s.active > 0),
        edgeOn: at((s) => s.k > 0.02),
        firstFall: at((s) => s.broken > 0),
        edgeFull: at((s) => s.k >= 1),
        ...(clip === 'edge' ? { runs: at((s, i) => i > 0 && s.x > log[0].x + 5), pulledAway: ranAt < 0 ? -1 : at((s, i) => i > ranAt && s.gap !== null && s.gap > 200) } : {}),
        ...(clip === 'caught' ? { caught: caughtF, atFlag: caughtF < 0 ? -1 : at((s, i) => i >= caughtF && Math.abs(s.x - (built.x0 + 300)) < 40), whole: caughtF < 0 ? -1 : at((s, i) => i >= caughtF && s.broken === 0) } : {}),
      };
      for (const [k, f] of Object.entries(keys)) if (f >= 0) fs.copyFileSync(path.join(fdir, `f${String(f).padStart(4, '0')}.jpg`), path.join(out, `${id}-${setting}-${clip}-${tag}-${k}.jpg`));
      fs.rmSync(fdir, { recursive: true, force: true });
      console.log('wrote', file, JSON.stringify({ frames: log.length, keys, minGap: Math.min(...log.map((s) => s.gap ?? 1e9)), hpEnd: log.at(-1).hp, easy: log.at(-1).easy }));
    }
  }
}
await b.close();
