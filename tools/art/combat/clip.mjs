// R-159.1 build clips (w8-rope2, 2026-11-04): the triangle in the real game, filmed by stepping the engine one 30 fps frame at a time with
// real key presses (stage-fix.md's way), each frame a screenshot, then an mp4 at 30 fps. Upright 390x844 and sideways 844x390.
// Needs a dev-hooks build served on <port>.
//   PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/art/combat/clip.mjs <port> <out dir> [clip prefix] [side|up]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4301', out = '.', only = '', onlyTag = ''] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

// each clip: the stage, the start pose (run in the page), then steps: hold keys until a condition (a js expression on `e`, `s` the foe,
// `p` Pokey) or for a number of frames; `tap` presses a key for one frame
const CLIPS = [
  {
    // the tell (it rears and sways 0.5 s), the punch into it, the stars the whole 1.5 s, the blink, then walking past it
    id: 'clip-1-lunge-stun', stage: '1-3',
    pose: { px: 3060, foe: { id: 2, x: 3209, y: 566, state: 'patrol' } },
    steps: [
      { hold: ['ArrowRight'], until: "s.state === 'rear'", max: 90 },
      { hold: ['ArrowRight'], until: 'Math.abs(s.x - p.x) < 56', max: 30 },
      { tap: 'KeyJ', frames: 10 },
      { frames: 14 },
      // (past it while it is dazed and harmless, then the blink and its waking, seen from beyond it)
      { hold: ['ArrowRight'], frames: 26 },
      { until: '(s.stagger ?? 0) <= 0', max: 60 },
      { frames: 12 },
    ],
  },
  {
    // mashing punch on the dazed snake does nothing (the stars stay, the daze is not made longer); only the stomp finishes it
    id: 'clip-2-lunge-mash-stomp', stage: '1-3',
    pose: { px: 3060, foe: { id: 2, x: 3209, y: 566, state: 'patrol' } },
    steps: [
      { hold: ['ArrowRight'], until: "s.state === 'rear'", max: 90 },
      { hold: ['ArrowRight'], until: 'Math.abs(s.x - p.x) < 56', max: 30 },
      { tap: 'KeyJ', frames: 6 },
      { tap: 'KeyJ', frames: 6 },
      { tap: 'KeyJ', frames: 6 },
      { tap: 'KeyJ', frames: 8 },
      // (a short hop onto it, steering onto its back)
      { tap: 'Space', frames: 1 },
      { hold: ['ArrowRight'], until: 'p.x > s.x - 6 || s.defeated', max: 12 },
      { until: 's.defeated || p.grounded', max: 30 },
      { frames: 24 },
    ],
  },
  {
    // the coiled boa's tell: it rears, the coil squeezes and darkens, the glint pulses, then it strikes (Pokey stands out of reach)
    id: 'clip-3-coil-tell', stage: '1-9',
    // (it is started in its wind-up, as it is when it has noticed him: he stands just out of its bite's reach)
    pose: { px: 1595, foe: { id: 1, x: 1770, y: 468, state: 'coil' } },
    steps: [
      { frames: 12 },
      { set: "s.state = 'rear'; s.stateT = 0", frames: 1 },
      { until: "s.state === 'coil'", max: 70 },
      { frames: 10 },
    ],
  },
  {
    // a punch: TOUGH (Dot: kick it); a stomp bounces off; the kick rolls it away as a ball (its strike held off while this is filmed)
    id: 'clip-4-coil-moves', stage: '1-9',
    pose: { px: 1600, foe: { id: 1, x: 1770, y: 468, state: 'coil', calm: true } },
    steps: [
      { hold: ['ArrowRight'], until: 'Math.abs(s.x - p.x) < 62', max: 60 },
      { tap: 'KeyJ', frames: 28 },
      { tap: 'Space', frames: 2 },
      { hold: ['ArrowRight', 'Space'], until: 'p.x > s.x - 4', max: 20 },
      { hold: ['Space'], until: 'p.grounded', max: 40 },
      { hold: ['ArrowLeft'], until: 'p.x < s.x - 58 && p.grounded', max: 40 },
      { hold: ['ArrowRight'], frames: 2 },
      { tap: 'KeyK', frames: 50 },
    ],
  },
];

const b = await chromium.launch();
for (const [tag, w, h] of [['side', 844, 390], ['up', 390, 844]].filter(([t]) => !onlyTag || t === onlyTag)) {
  for (const clip of CLIPS.filter((c) => !only || c.id.startsWith(only))) {
    const page = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
    page.on('pageerror', (e) => console.log('ERR', e.message));
    await page.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await page.waitForTimeout(3000);
    await page.evaluate((s) => window.__play(s, 1), clip.stage);
    await page.waitForTimeout(8000);
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(11000);
    await page.evaluate((pose) => {
      const e = window.__engine();
      e.isPaused = true;
      const p = e.player;
      const ground = e.platforms.filter((q) => q.x <= pose.px && q.x + q.width >= pose.px && q.y >= pose.foe.y - 10).sort((a, c) => a.y - c.y)[0];
      Object.assign(p, { x: pose.px, y: ground ? ground.y : pose.foe.y + 14, vx: 0, vy: 0, grounded: true, facing: 1, invincibleTimer: 0 });
      const s = e.enemies.find((q) => q.id === pose.foe.id);
      Object.assign(s, { x: pose.foe.x, y: pose.foe.y, state: pose.foe.state, stateT: 0, stagger: 0, attackCooldown: pose.foe.calm ? 999 : 0, defeated: false, facing: -1 });
      // nothing else near to get in the way of the shot
      for (const q of e.enemies) if (q !== s && Math.abs(q.x - s.x) < 700) q.x += 4000;
      window.__foe = s;
    }, clip.pose);
    const dir = path.join(out, `${clip.id}-${tag}`);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    let n = 0;
    const shot = async () => {
      await page.evaluate(() => { const e = window.__engine(); e.update(1 / 30); e.render(); });
      await page.screenshot({ path: path.join(dir, `f${String(n++).padStart(4, '0')}.png`) });
    };
    for (const st of clip.steps) {
      if (st.set) await page.evaluate((c) => { const s = window.__foe; eval(c); }, st.set);
      for (const k of st.hold ?? []) await page.keyboard.down(k);
      if (st.tap) await page.keyboard.down(st.tap);
      const max = st.frames ?? st.max ?? 1;
      for (let i = 0; i < max; i++) {
        if (st.until && (await page.evaluate((c) => { const e = window.__engine(); const s = window.__foe; const p = e.player; return eval(c); }, st.until))) break;
        await shot();
        if (st.tap && i === 0) await page.keyboard.up(st.tap);
      }
      for (const k of st.hold ?? []) await page.keyboard.up(k);
    }
    const mp4 = path.join(out, `${clip.id}-${tag}.mp4`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(dir, 'f%04d.png'), '-vf', 'scale=trunc(iw/4)*2:trunc(ih/4)*2', '-pix_fmt', 'yuv420p', '-crf', '24', mp4]);
    console.log(tag, clip.id, n, 'frames', mp4);
    await page.context().close();
  }
}
await b.close();
