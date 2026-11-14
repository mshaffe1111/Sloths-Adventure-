// vineFeelClip — the climbing vine's moves on the REAL page (FEEL-VINE, R-165.214), upright 390x844 and sideways 844x390, stepped 1/30 s
// at a time on Playwright's clock and shot frame by frame (tools/art/hazard/rec-rocks.mjs's way), so each mp4 is exactly the game at
// 30 fps. Keys drive Pokey as a player's would (inputEngine.ts: arrows climb and steer, Space jumps). The moves are the measurer's
// (tools/inspect/vineFeel.ts): a jump caught on a trunk, the vault off its top, two pushes between field vines and the leap across.
// Two dev servers (the old engine and the new) give BEFORE and AFTER; ffmpeg lays them side by side, at full speed and at half.
//   node tools/inspect/vineFeelClip.mjs <beforePort> <afterPort> <out dir> [stage] [layout]
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [before = '3101', after = '3102', out = 'reference/qa-reports/FEEL-VINE/clips', stage = '1-4', layout = '1'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

/** one move: where he is put (in the page) and the keys, frame by frame ([keys held this frame], 'press' = Space goes down this frame) */
const MOVES = {
  grab: {
    place: `const v = e.vines.find((v) => v.vineType === 'tree_climb' && !v.field && !v.pair && e.platforms.some((q) => q.x <= v.x - 90 && q.x + q.width >= v.x - 40 && Math.abs(q.y - v.bottomY) < 4));
      Object.assign(e.player, { x: v.x - 90, y: v.bottomY, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });`,
    keys: [[], [], [], [], [], [], ['Space', 'ArrowRight', 'ArrowUp'], ...Array(6).fill(['Space', 'ArrowRight', 'ArrowUp']), ...Array(20).fill(['ArrowUp']), ...Array(8).fill([])],
  },
  vault: {
    place: `const v = e.vines.find((v) => v.vineType === 'tree_climb' && !v.field && !v.pair && e.platforms.some((q) => Math.abs(q.y - v.topY) < 4 && (Math.abs(q.x + q.width - v.x) < 40 || Math.abs(q.x - v.x) < 40)));
      Object.assign(e.player, { x: v.x, y: v.topY + 90, vx: 0, vy: 0, grounded: false, climbing: true, facing: 1 });`,
    keys: [[], [], [], [], ...Array(22).fill(['ArrowUp']), ...Array(14).fill([])],
  },
  step: {
    place: `const F = e.vines.filter((v) => v.vineType === 'tree_climb' && v.field && !v.off);
      const by = (v, w) => w.x > v.x && w.x - v.x <= 90 && Math.min(w.bottomY, v.bottomY) - Math.max(w.topY, v.topY) > 200;
      const a = F.find((v) => F.some((w) => by(v, w)));
      const b = F.find((w) => by(a, w));
      Object.assign(e.player, { x: a.x, y: (Math.max(a.topY, b.topY) + Math.min(a.bottomY, b.bottomY)) / 2 + 40, vx: 0, vy: 0, grounded: false, climbing: true, facing: 1 });`,
    keys: [[], [], [], [], ...Array(4).fill(['ArrowRight']), ...Array(8).fill([]), ...Array(4).fill(['ArrowRight']), ...Array(12).fill([])],
  },
  leap: {
    place: `const F = e.vines.filter((v) => v.vineType === 'tree_climb' && v.field && !v.off);
      const by = (v, w) => w.x > v.x && w.x - v.x <= 90 && Math.min(w.bottomY, v.bottomY) - Math.max(w.topY, v.topY) > 200;
      const a = F.find((v) => F.some((w) => by(v, w)));
      const b = F.find((w) => by(a, w));
      Object.assign(e.player, { x: a.x, y: (Math.max(a.topY, b.topY) + Math.min(a.bottomY, b.bottomY)) / 2 + 40, vx: 0, vy: 0, grounded: false, climbing: true, facing: 1 });`,
    keys: [[], [], [], [], ['Space', 'ArrowRight', 'ArrowUp'], ...Array(5).fill(['Space', 'ArrowRight', 'ArrowUp']), ...Array(16).fill(['ArrowUp']), ...Array(8).fill([])],
  },
};

const b = await chromium.launch();
for (const [orient, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  for (const [ver, port] of [['before', before], ['after', after]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    p.on('pageerror', (e) => console.log('ERR', e.message));
    // (the page runs on Playwright's clock from the start, as tools/perf/run.mjs does: installed mid-run, the loop took one step in ten)
    const T0 = Date.parse('2026-11-13T23:00:00Z');
    await p.clock.install({ time: T0 });
    await p.clock.pauseAt(T0 + 1000);
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
    const run = async (ms) => { for (let t = 0; t < ms; t += 500) { await p.clock.runFor(500); await p.waitForTimeout(150); } };
    await run(3500);
    await p.evaluate(([s, l]) => window.__play(s, Number(l)), [stage, layout]);
    await run(6000);
    for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await run(500); } else break; }
    for (const [name, m] of Object.entries(MOVES)) {
      // (put him there, hands and timers clear, the view cut to him; then a second for the camera to come to rest)
      await p.evaluate((src) => {
        let e = window.__engine; if (typeof e === 'function') e = e();
        e.hands = null; e.vineCooldownTimer = 0; e.climbGrace = 0; e.upIntent = 0;
        new Function('e', src)(e);
      }, m.place);
      await run(1000);
      const dir = join(out, `${name}-${orient}-${ver}-frames`);
      rmSync(dir, { recursive: true, force: true });
      mkdirSync(dir, { recursive: true });
      let held = new Set();
      for (let i = 0; i < m.keys.length; i++) {
        const now = new Set(m.keys[i]);
        for (const k of held) if (!now.has(k)) await p.keyboard.up(k);
        for (const k of now) if (!held.has(k)) await p.keyboard.down(k);
        held = now;
        await p.clock.runFor(1000 / 30);
        await p.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`) });
      }
      for (const k of held) await p.keyboard.up(k);
      const at = await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); return [Math.round(e.player.x), Math.round(e.player.y), e.player.climbing, Math.round(e.gameTime * 30)]; });
      console.log(orient, ver, name, m.keys.length, 'frames, ends at', JSON.stringify(at));
    }
    await p.close();
  }
  // side by side (BEFORE left or top, AFTER right or bottom), full speed and half speed
  for (const name of Object.keys(MOVES)) {
    const ins = ['before', 'after'].flatMap((v) => ['-framerate', '30', '-i', join(out, `${name}-${orient}-${v}-frames`, 'f%04d.png')]);
    const stack = orient === 'up' ? 'hstack' : 'vstack';
    const lab = (t) => `drawtext=text='${t}':x=10:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6`;
    const fc = `[0:v]${lab('BEFORE')}[a];[1:v]${lab('AFTER')}[b];[a][b]${stack}=inputs=2,scale=trunc(iw/2)*2:trunc(ih/2)*2`;
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...ins, '-filter_complex', fc, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', join(out, `${name}-${orient}.mp4`)]);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(out, `${name}-${orient}.mp4`), '-filter:v', 'setpts=2.0*PTS', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', join(out, `${name}-${orient}-half.mp4`)]);
  }
}
await b.close();
