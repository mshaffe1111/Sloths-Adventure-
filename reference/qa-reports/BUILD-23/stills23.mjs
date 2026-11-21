// BUILD-23: stills of 2-3 on the real page (the stage as built and rolled by the game), the engine paused and stepped by hand
// (stills-at.mjs's way), 2x, upright 412 x 915 and sideways 915 x 412. Each still is written only when what it is named for is true
// on that frame (printed beside it): the first cage shut; the line behind him after it; the heron's look over the reeds with
// everyone hiding; the parade on the stones.
//   node reference/qa-reports/BUILD-23/stills23.mjs <port> <out dir> <layout> [easy]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, layout, easy] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const set = easy ? 'easy' : 'normal';
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off${easy ? '&difficulty=easy' : ''}`);
  await p.waitForTimeout(2500);
  await p.evaluate(([id, v]) => window.__play(id, v), ['2-3', +layout]);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(4000);
  const shot = async (name, note) => {
    const file = path.join(out, `b23-L${layout}-${set}-${name}-${tag}.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 80 });
    console.log('wrote', file, JSON.stringify(note));
  };
  // (render 30 frames one per animation frame so the ground paints; the last one shot)
  const settle = async (n = 30, right = false) => {
    for (let i = 0; i < n; i++) {
      await p.evaluate(([E, right]) => { const e = eval(E); if (right) e.player.vx = 285; e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, [E, right]);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
  };
  // stand him at x (on the highest still ground under it), facing right, and step n frames
  const stand = (x, n = 60) => p.evaluate(([x, n, E]) => {
    const e = eval(E);
    e.isPaused = true;
    const under = e.platforms.filter((q) => !q.broken && !q.decorative && q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    for (let i = 0; i < n; i++) e.update(1 / 30);
  }, [x, n, E]);
  const info = () => p.evaluate((E) => {
    const e = eval(E), f = e.follow;
    const cages = e.collectibles.filter((c) => c.type === 'cage').map((c) => ({ x: Math.round(c.x), y: Math.round(c.y), critter: c.critter, shut: !c.collected }));
    return { px: Math.round(e.player.x), follow: !!f, line: f ? f.line.map((q) => `${q.kind}:${q.state}@${Math.round(q.x)}${q.moved ? '*' : ''}`) : [], herons: f ? f.herons.map((hh) => `${hh.s.phase}@${Math.round(hh.z.x0)}-${Math.round(hh.z.x1)}`) : [], cages, bushes: (e.proto?.bushes ?? []).map((q) => [q.x, q.w]) };
  }, E);
  const i0 = await info();
  console.log(tag, 'start', JSON.stringify(i0));
  if (!i0.follow) { console.log('NO FOLLOW on this page: 2-3 is not the kit build'); continue; }
  const c1 = i0.cages[0];
  // 1. the first cage, shut, him a step short of it
  await stand(c1.x - 160);
  await settle();
  await shot('1-cage-shut', await info());
  // 2. punch it (the engine's own freeing), then walk on 420 px: the duckling behind him
  await p.evaluate(([E, cx]) => { const e = eval(E); const c = e.collectibles.find((q) => q.type === 'cage' && Math.round(q.x) === cx); e.freeCritter(c); c.collected = true; }, [E, c1.x]);
  await settle(20);
  await shot('1b-cage-open', await info());
  // (walk him on 9 px a frame, 270 px/s: under a set-back's jump, so the trail records his steps and the duckling follows them)
  const walk = (dx, n) => p.evaluate(([E, dx, n]) => { const e = eval(E); for (let i = 0; i < n; i++) { e.player.x += dx; e.player.facing = 1; e.update(1 / 30); } }, [E, dx, n]);
  await walk(9, 40);
  await settle(2);
  await shot('2-line-behind-running', await info());
  await settle(30);
  await shot('2b-line-caught-up', await info());
  // 3. the heron's bed (two more freed for a real line: the engine's own freeing), him at the bed's right end, the line bunched behind
  //    him in it; wait for the look
  for (const c of i0.cages.slice(1, 3)) await p.evaluate(([E, cx]) => { const e = eval(E); const q = e.collectibles.find((k) => k.type === 'cage' && Math.round(k.x) === cx); e.freeCritter(q); q.collected = true; }, [E, c.x]);
  const bed = i0.bushes[0];
  await stand(bed[0] + bed[1] - 30, 90);
  let look = false;
  for (let k = 0; k < 400 && !look; k++) {
    await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); }, E);
    look = await p.evaluate((E) => { const e = eval(E); return e.follow.herons.some((hh) => hh.s.phase === 'pass'); }, E);
  }
  await settle(8);
  await shot('3-heron-look', { look, ...(await info()) });
  // 4. the parade: him on the far bank past the stones, the line paddling across behind him on his path
  const stones = await p.evaluate((E) => { const e = eval(E); return (e.currentStage.rivers ?? []).filter((r) => r.safe && r.speed === 0).map((r) => [Math.round(r.x0), Math.round(r.x1)]); }, E);
  const pond = stones.find((r) => r[0] > i0.bushes[0][0] + 400);
  if (pond) {
    await stand(pond[0] - 60, 30);
    await p.evaluate(([E, x1]) => { const e = eval(E); for (let i = 0; i < 200 && e.player.x < x1 + 120; i++) { const g = e.player.grounded; e.player.facing = 1; if (g && e.player.x > x1 - 400 && e.player.x < x1) { e.player.vy = -620; e.player.grounded = false; } e.player.x += 8; e.update(1 / 30); } }, [E, pond[1]]);
    await settle(4);
    await shot('4-parade', { pond, ...(await info()) });
  }
  await p.context().close();
}
await b.close();
