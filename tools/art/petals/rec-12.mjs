// 1-2 The Petal Trail after fix-petals: stills and frame-by-frame clips at phone size (412x915 upright, 915x412 sideways). The engine is
// paused and stepped one 30 fps frame at a time (update + render, a screenshot each), so a clip shows every frame a phone would.
//   NODE_ENV=development npx vite build --outDir <dist>; serve <dist> on 4301; node tools/art/petals/rec-12.mjs 4301 <out>
// Writes <out>/<orientation>-<shot>.png and <out>/<orientation>-<clip>-NNN.png (tools/art/petals/clips.sh makes the mp4s).
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4301', out = '.'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const G = 580;
const b = await chromium.launch();

async function stage(p, layout) {
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate((l) => window.__play('1-2', l), layout);
  await p.waitForTimeout(4000);
  // (the stage-start goal card shares the top lane: shoot once it has shrunk into the counter)
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => console.log('card still up'));
  // (and Dot's opening story line has had its time: stepped by hand, a line up when the engine pauses stays up in every shot)
  await p.waitForTimeout(9000);
  await p.evaluate(() => { const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine); e.isPaused = true; });
}
/** put him somewhere, settle the camera there over n frames (no input), render */
async function place(p, x, y, n = 45, extra = {}) {
  await p.evaluate(([x, y, n, extra]) => {
    const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
    Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 }, extra);
    // (a teleport passes the stage's lines' spots at once: they count as said, and any up is taken down, so a still shows the spot as a
    // player arriving there sees it, not a line he walked past minutes ago)
    for (const h of e.currentStage?.proto?.hints ?? []) h.shown = true;
    for (let i = 0; i < n; i++) e.update(1 / 30);
    e.clearGuide?.();
    e.render();
  }, [x, y, n, extra]);
}
const step = (p) => p.evaluate(() => { const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine); e.update(1 / 30); e.render(); const q = e.player; return { x: q.x, y: q.y, on: e.standingOnId, g: q.grounded }; });
/** the first petal stairs and its high run (branches 165-180 over the floor right past a 120 px step) */
const findRun = (p) => p.evaluate((G) => {
  const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
  const top = e.platforms.filter((q) => q.style === 'moss_stone' && Math.abs(q.y - (G - 120)) < 1).sort((a, b) => a.x - b.x)[0];
  const bs = e.platforms.filter((q) => q.style === 'branch' && q.x > top.x && q.x < top.x + 1500 && q.y < G - 150).sort((a, b) => a.x - b.x);
  const step1 = e.platforms.filter((q) => q.style === 'moss_stone' && Math.abs(q.y - (G - 40)) < 1 && q.x < top.x && q.x > top.x - 600)[0];
  return { top: { x: top.x, w: top.width, y: top.y }, step1: step1 && { x: step1.x }, bs: bs.map((q) => ({ id: q.id, x: q.x, w: q.width, y: q.y })) };
}, G);

async function clip(p, tag, name, frames, press) {
  const log = [];
  for (let n = 0; n < frames.max; n++) {
    const k = press?.(n);
    if (k?.down) await p.keyboard.down(k.down);
    if (k?.up) await p.keyboard.up(k.up);
    const s = await step(p);
    const f = String(n).padStart(3, '0');
    await p.screenshot({ path: path.join(out, `${tag}-${name}-${f}.png`) });
    log.push(`${f} x ${s.x.toFixed(1)} y ${s.y.toFixed(1)} on ${s.on}`);
    if (frames.until?.(s, n)) break;
  }
  fs.writeFileSync(path.join(out, `${tag}-${name}-frames.txt`), log.join('\n') + '\n');
  return log;
}

for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  // ---- stills (crisp: 2x) ----
  {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    await stage(p, 1);
    const run = await findRun(p);
    console.log(tag, 'run', JSON.stringify(run));
    await place(p, (run.step1?.x ?? run.top.x - 400) - 50, G);
    await p.screenshot({ path: path.join(out, `${tag}-1-stairs.png`) });
    const [b1, b2] = run.bs;
    await place(p, b1.x + b1.w - 60, b1.y);
    await p.screenshot({ path: path.join(out, `${tag}-2-branch-run.png`) });
    // (he missed the hop: on the floor under the gap, the catch mushroom ahead)
    await place(p, b1.x + b1.w + 10, G);
    await p.screenshot({ path: path.join(out, `${tag}-3-missed-floor.png`) });
    await p.context().close();
  }
  // ---- the split trail's low stretch (layout 2: its twist is the split trail) ----
  {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
    await stage(p, 2);
    const at = await p.evaluate((G) => {
      const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
      // (the end of a high run: a branch with the low arc's petals 50 px over the floor just past it)
      const low = e.collectibles.filter((c) => c.type === 'flower' && Math.abs(c.y - (G - 70 + 70 * (1 - Math.sin(Math.PI * 0.25)))) < 2).sort((a, b) => a.x - b.x);
      const end = e.platforms.filter((q) => q.style === 'branch' && q.y < G - 150 && q.x + q.width < low[0].x && q.x + q.width > low[0].x - 260)[0];
      return end ? { x: end.x + end.width - 80, y: end.y } : null;
    }, G);
    if (at) {
      await place(p, at.x, at.y);
      await p.screenshot({ path: path.join(out, `${tag}-4-split-low.png`) });
    } else console.log(tag, 'no split low found');
    await p.context().close();
  }
  // ---- the sealed door: he reaches the shrine short of the goal (layout 1) ----
  {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
    await stage(p, 1);
    await p.evaluate(() => {
      const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
      // (he has 70 of the petals: the rest are left on the trail)
      const fl = e.collectibles.filter((c) => c.type === 'flower');
      fl.slice(0, 70).forEach((c) => { c.collected = true; });
      e.player.fruitsCollected = 70;
      for (const h of e.currentStage?.proto?.hints ?? []) h.shown = true;
      e.clearGuide?.();
      const ex = e.collectibles.find((c) => c.type === 'exit_totem');
      Object.assign(e.player, { x: ex.x - 260, y: ex.y ?? 580, vx: 0, vy: 0, grounded: true });
      e.isPaused = false;
    });
    await p.keyboard.down('ArrowRight');
    await p.waitForTimeout(1800);
    await p.keyboard.up('ArrowRight');
    await p.waitForTimeout(600);
    // (he steps back a little, as a player does at a shut door: the shrine's sign and Dot's line both in view)
    await p.keyboard.down('ArrowLeft');
    await p.waitForTimeout(150);
    await p.keyboard.up('ArrowLeft');
    await p.waitForTimeout(1200);
    await p.screenshot({ path: path.join(out, `${tag}-5-sealed-door.png`) });
    await p.context().close();
  }
  // ---- clips (1x: Playwright's own scale switch at 2x, rope2's lesson) ----
  {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
    await stage(p, 1);
    const run = await findRun(p);
    const [b1, b2] = run.bs;
    // the miss: he walks off the branch's end into the gap (no jump), lands, walks into the catch and is bounced back up onto the next branch
    await place(p, b1.x + b1.w - 120, b1.y, 30);
    await p.keyboard.down('ArrowRight');
    const miss = await clip(p, tag, 'miss-caught', { max: 150, until: (s, n) => s.on === b2.id && n > 10 && (s.done = (s.done ?? 0) + 1) > 12 });
    await p.keyboard.up('ArrowRight');
    console.log(tag, 'miss clip', miss.length, 'frames, ends', miss[miss.length - 1]);
    // the route as meant: a hop from branch to branch near the edge, taking the petals
    await place(p, b1.x + b1.w - 200, b1.y, 30);
    await p.keyboard.down('ArrowRight');
    let pressedAt = -1;
    const hop = await clip(p, tag, 'hop', { max: 90, until: (s, n) => pressedAt >= 0 && n - pressedAt > 40 }, (n) => {
      if (pressedAt < 0 && n === 14) { pressedAt = n; return { down: 'Space' }; }
      if (pressedAt >= 0 && n === pressedAt + 6) return { up: 'Space' };
      return null;
    });
    await p.keyboard.up('ArrowRight');
    console.log(tag, 'hop clip', hop.length, 'frames, ends', hop[hop.length - 1]);
    await p.context().close();
  }
}
await b.close();
