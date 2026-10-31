// Pokey's moves before and after pokey-anim (2026-10-30): one scripted run of key presses on 1-1 (stand, turn, run off, reverse at a run,
// a hard drop, a double jump), stepped one engine update of 1/30 s and one render a frame, upright 390x844 and sideways 844x390. It writes the
// video, a close-up video cropped round Pokey, and trace.json: his x, y, vx, vy and facing every frame. The same keys on the base build and
// on this one must give the same trace (the animation never touches the physics).
//   node tools/art/pokeyanim/rec.mjs <port> <out dir> <tag>
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port = '4301', out = '.', tag = 'after'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

// [frame, action]: down/up a key, or 'drop' (lift him 560 px straight up for a hard landing)
const SCRIPT = [
  [15, 'down ArrowLeft'], [17, 'up ArrowLeft'], // a turn standing still
  [35, 'down ArrowRight'], // the run start
  [58, 'up ArrowRight'], [58, 'down ArrowLeft'], // reversing at a run: the skid, then the turn
  [70, 'up ArrowLeft'],
  [125, 'drop'], // a hard landing
  [170, 'down Space'], [180, 'up Space'], [182, 'down Space'], [192, 'up Space'], // a held jump, and the flip off its top
];
let N = 235;
// SCENE=climbtop: the same trunk all the way up and over the top. SCENE=climb: at the foot of the stage's first climbable trunk, up for about 0.9 s, a pause, then down (STAGE= picks the stage, default 1-1)
const SCENE = process.env.SCENE ?? 'moves';
if (SCENE === 'climbtop') {
  SCRIPT.length = 0;
  SCRIPT.push([10, 'down ArrowUp'], [70, 'up ArrowUp']);
  N = 90;
}
// SCENE=vine: in the air at the stage's first swinging liana (1-6), up to grab it, steering right to pump it, swinging, then a jump off (STAGE= a stage with one)
if (SCENE === 'vine') {
  SCRIPT.length = 0;
  SCRIPT.push([1, 'down ArrowUp'], [4, 'up ArrowUp'], [6, 'down ArrowRight'], [40, 'up ArrowRight'], [55, 'down ArrowRight'], [75, 'up ArrowRight'], [100, 'down Space'], [103, 'up Space']);
  N = 125;
}
// SCENE=slide: 7-4, put just short of the crumbling floor; the floor goes, and on the flume he leans right, leans left, jumps and ducks
if (SCENE === 'slide') {
  SCRIPT.length = 0;
  SCRIPT.push([10, 'down ArrowRight'], [20, 'up ArrowRight'], [110, 'down ArrowRight'], [150, 'up ArrowRight'], [165, 'down ArrowLeft'],
    [205, 'up ArrowLeft'], [220, 'down Space'], [224, 'up Space'], [260, 'down ArrowDown'], [290, 'up ArrowDown']);
  N = 320;
}
if (SCENE === 'climb') {
  SCRIPT.length = 0;
  SCRIPT.push([10, 'down ArrowUp'], [38, 'up ArrowUp'], [48, 'down ArrowDown'], [80, 'up ArrowDown']);
  N = 125;
}
// SCENE=punch: the three-punch combo standing on 1-1, then a jab on the run
if (SCENE === 'punch') {
  SCRIPT.length = 0;
  SCRIPT.push([10, 'down KeyJ'], [11, 'up KeyJ'], [20, 'down KeyJ'], [21, 'up KeyJ'], [30, 'down KeyJ'], [31, 'up KeyJ'],
    [55, 'down ArrowRight'], [65, 'down KeyJ'], [66, 'up KeyJ'], [80, 'up ArrowRight']);
  N = 95;
}

const b = await chromium.launch();
for (const [ori, w, h] of [['side', 844, 390], ['up', 390, 844]].filter(([o]) => !process.env.ORI || process.env.ORI === o)) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  p.on('pageerror', (er) => console.log('ERR', er.message));
  await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate(([st, lay]) => window.__play(st, lay), [process.env.STAGE ?? '1-1', process.env.LAYOUT ? Number(process.env.LAYOUT) : undefined]);
  await p.waitForTimeout(6000);
  for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } else break; }
  // a flat open stretch of 1-1's first ground, Pokey stood still facing right
  await p.evaluate((sc) => { let e = window.__engine; if (typeof e === 'function') e = e(); const pl = e.player;
    Object.assign(pl, { vx: 0, vy: 0, facing: 1 });
    if (sc === 'slide') Object.assign(pl, { x: e.slideRun.st.crumbleX - 90 });
    if (sc === 'vine') {
      const v = e.vines.find((q) => (q.vineType === 'swing_liana' || q.isSwingingVine) && !q.off);
      Object.assign(pl, { x: v.x - 200 });
    }
    if (sc === 'climb' || sc === 'climbtop') {
      const v = e.vines.find((q) => q.vineType === 'tree_climb' && !q.off);
      Object.assign(pl, { x: v.x, y: v.bottomY - 30 });
    }
    // nothing to pick up or bump into where he moves (no sparkles or hits over the moves being judged)
    const far = (o) => Math.abs((o.x ?? 0) - pl.x) > 900;
    e.collectibles = e.collectibles.filter(far); e.enemies = e.enemies.filter(far); }, SCENE);
  await p.waitForTimeout(1500);
  const dir = join(out, `${tag}-${ori}-frames`.replace(`${tag}-`, `${tag}${SCENE === 'moves' ? '' : '-' + SCENE}-`));
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir);
  // take over the loop: from here every frame is one update(1/30) and one render, then a screenshot (as hfpokey/edgeclip.mjs)
  await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.isRunning = false; cancelAnimationFrame(e.animFrameId); });
  // (the liana is reached in the air, so he is put there once the loop is ours: in the settle before it he would fall to the ground)
  if (SCENE === 'vine') await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e();
    const v = e.vines.find((q) => (q.vineType === 'swing_liana' || q.isSwingingVine) && !q.off);
    // (the lianas sway on the engine's vine clock, which ran on for however long the page took to get here: set it, or no two runs agree)
    e.vineClock = 0;
    Object.assign(e.player, { x: v.x, y: v.topY + 90, grounded: false, vx: 0, vy: 0 }); });
  const trace = [];
  const box = [];
  for (let i = 0; i < N; i++) {
    for (const [f, a] of SCRIPT) if (f === i) {
      const [op, key] = a.split(' ');
      if (op === 'down') await p.keyboard.down(key);
      else if (op === 'up') await p.keyboard.up(key);
      else await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.player.y -= 560; e.player.grounded = false; e.player.vy = 0; });
    }
    const s = await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); const pl = e.player;
      e.update(1 / 30);
      e.render();
      const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); const cam = e.camera ?? {};
      const sm = e.slideRun?.sim;
      return [pl.x, pl.y, pl.vx, pl.vy, pl.facing, pl.grounded ? 1 : 0, cam.x ?? 0, cam.y ?? 0, e.zoom ?? 1, r.width,
        // (on 7-4's flume his body is the slide's own: how far down, across, up, his speed up and his lean)
        ...(sm ? [sm.z, sm.x, sm.y, sm.vy, sm.lean, sm.hits] : [])]; });
    trace.push([...s.slice(0, 6), ...s.slice(10)].map((v) => Math.round(v * 1000) / 1000));
    box.push(s);
    await p.screenshot({ path: join(dir, `f${String(i).padStart(5, '0')}.png`) });
  }
  await p.close();
  writeFileSync(join(out, `${tag}${SCENE === 'moves' ? '' : '-' + SCENE}-${ori}-trace.json`), JSON.stringify(trace));
  writeFileSync(join(out, `${tag}${SCENE === 'moves' ? '' : '-' + SCENE}-${ori}-cam.json`), JSON.stringify(box));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', join(dir, 'f%05d.png'), '-c:v', 'libx264', '-crf', '24', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/4)*2:trunc(ih/4)*2', join(out, `${tag}${SCENE === 'moves' ? '' : '-' + SCENE}-${ori}.mp4`)]);
  console.log(ori, N, 'frames');
}
await b.close();
