// A preview clip of 8-4 Lantern Run (src/game/w8Lantern.ts), upright 390 x 844 and sideways 844 x 390, recorded from the dev server:
//   npx vite --port 4301 &   then   node tools/art/clip-8-4.mjs <out dir> [port] [playwright module path]
// Segments (a cut between each): the opening, run and hopped by a simple autopilot (hold right, jump near a bough's end) through the soft
// hops, the first flower and the first lit hop; the jar running low on a dark stretch and the refill at the next flower; a moth coming
// at the jar; the firefly tree. Frames come from Chromium's screencast (Playwright's own video drew the stage into a shrunken corner of its
// frame), timed as they arrived; ffmpeg joins them into <size>.mp4.
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const pw = await import(process.argv[4] ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const out = process.argv[2] ?? 'reference/prop-sheets/qa-notes/8-4-build';
const port = process.argv[3] ?? '4301';
mkdirSync(out, { recursive: true });
const SIZES = { sideways: [844, 390], upright: [390, 844] };

/** run right for `secs`, jumping near the end of each bough (a short hold), as a plain thumb would */
async function autopilot(p, secs) {
  await p.keyboard.down('ArrowRight');
  const t0 = Date.now();
  let jumping = 0;
  while (Date.now() - t0 < secs * 1000) {
    const s = await p.evaluate(() => {
      const e = window.__engine();
      const pl = e.player;
      const on = e.platforms.find((q) => pl.x >= q.x - 4 && pl.x <= q.x + q.width + 4 && Math.abs(q.y - pl.y) < 8);
      return { grounded: pl.grounded, toEnd: on ? on.x + on.width - pl.x : 9999 };
    });
    if (s.grounded && s.toEnd < 70 && Date.now() > jumping) {
      await p.keyboard.down('Space');
      await p.waitForTimeout(300);
      await p.keyboard.up('Space');
      // (a second flick near the top: the gaps are short, so it carries him well onto the far bough)
      await p.waitForTimeout(120);
      await p.keyboard.down('Space');
      await p.waitForTimeout(200);
      await p.keyboard.up('Space');
      jumping = Date.now() + 500;
    }
    await p.waitForTimeout(40);
  }
  await p.keyboard.up('ArrowRight');
}

/** stand him on the bough at x, with the jar at `level` (null: as it is) */
async function place(p, x, level = null) {
  await p.evaluate(([x, level]) => {
    const e = window.__engine();
    let top = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    // (in a gap: the middle of the bough before it)
    if (!top) {
      top = e.platforms.filter((q) => q.x + q.width < x).sort((a, c) => c.x + c.width - (a.x + a.width))[0];
      x = top.x + top.width / 2;
    }
    Object.assign(e.player, { x, y: top.y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
    if (level !== null) { e.lanternRun.st.level = level; e.lanternRun.st.target = 0; }
    e.camCut = true;
  }, [x, level]);
}

for (const [size, [w, h]] of Object.entries(SIZES)) {
  // (the window the size of the view: the screencast is of the window)
  const b = await chromium.launch({ args: [`--window-size=${w},${h}`] });
  const dir = `${out}/frames-${size}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  cdp.on('Page.screencastFrame', async (f) => {
    const n = frames.length;
    writeFileSync(`${dir}/f${String(n).padStart(5, '0')}.jpg`, Buffer.from(f.data, 'base64'));
    frames.push(f.metadata.timestamp);
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('8-4', 1));
  await p.waitForTimeout(3500);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: w, maxHeight: h, everyNthFrame: 1 });
  await p.mouse.click(w / 2, h / 2);
  await p.waitForTimeout(600);
  // 1. the opening: the jar half full, the first flower, the soft hops, Dot's lines
  await autopilot(p, 13);
  const plan = await p.evaluate(() => {
    const lr = window.__engine().lanternRun;
    const vines = window.__engine().vines.map((v) => v.x);
    const clear = lr.plan.flowers.filter((f) => f.x > 4000 && !vines.some((x) => x > f.x - 1100 && x < f.x));
    return { flowers: clear.map((f) => f.x), moths: lr.plan.moths.map((m) => m.x), swarmX: lr.plan.swarmX };
  });
  // 2. running low on a dark stretch, then the refill at the next flower
  const f = plan.flowers[0];
  await place(p, f - 900, 0.3);
  await autopilot(p, 6.5);
  // 3. a moth at the jar (the glade's, in the flower's light)
  await place(p, plan.moths[0] - 420, 0.95);
  await p.waitForTimeout(3500);
  // 4. the firefly tree
  await place(p, plan.swarmX - 260, 0.8);
  await autopilot(p, 1.2);
  await p.waitForTimeout(4500);
  await cdp.send('Page.stopScreencast');
  await ctx.close();
  // (each frame held until the next one arrived; a cut longer than a second is kept to a second)
  const list = frames.map((t, i) => `file 'f${String(i).padStart(5, '0')}.jpg'\nduration ${Math.min(1, (frames[i + 1] ?? t + 1 / 30) - t).toFixed(4)}`).join('\n');
  writeFileSync(`${dir}/list.txt`, list + '\n');
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`, '-vf', 'fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-movflags', '+faststart', `${out}/${size}.mp4`]);
  } catch (e) {
    console.log('ffmpeg', e.message);
  }
  console.log(size, 'done');
  await b.close();
}
