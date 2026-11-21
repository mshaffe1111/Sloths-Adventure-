// BUILD-23c: the heron's look on 2-3 on the real page (needs a vite dev server on 5181), for its strength (the lead's 8:45 PM send-back):
// the first heron's look at the middle of its sweep, by state (lookX), (A) over the reed bed he hides in (the shaded bank) and (B) over the
// open, sunlit mud of its stretch past the bed; upright and sideways, 2x. Run once before and once after a LOOK change.
//   node reference/qa-reports/BUILD-23/look23c.mjs <out dir> <tag: before|after> [easy]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [out, when, easy] = process.argv.slice(2);
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:5181/?lessons=off${easy ? '&difficulty=easy' : ''}`);
  await p.waitForTimeout(2500);
  await p.evaluate(([id, v]) => window.__play(id, v), ['2-3', 1]);
  await p.waitForTimeout(4000);
  // (the goal card up, then gone: its clock is the page's own)
  await p.waitForFunction(() => document.documentElement.dataset.hudCard === '1', null, { timeout: 10000 }).catch(() => {});
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(2000);
  for (const [name, where] of [['A-reeds-shaded', 'bed'], ['B-open-sunlit', 'open']]) {
    const r = await p.evaluate(([E, where]) => {
      const e = eval(E);
      e.isPaused = true;
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      const hz = e.follow.herons[0];
      const bed = (e.proto.bushes ?? []).filter((q) => q.x >= hz.z.x0 - 1 && q.x <= hz.z.x1)[0];
      // (the place the look is shot over: the bed's middle, or open mud of the stretch 140 px past the bed's right end)
      const at = where === 'bed' ? bed.x + bed.w / 2 : Math.min(hz.z.x1 - 60, bed.x + bed.w + 140);
      const sx = where === 'bed' ? bed.x + bed.w - 30 : bed.x + bed.w / 2;
      const under = e.platforms.filter((q) => !q.broken && !q.decorative && q.type === 'solid' && sx >= q.x && sx <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
      const put = () => Object.assign(e.player, { x: sx, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      put();
      // (up to 60 s of steps: the heron's look over `at`, him held still where he stands)
      for (let i = 0; i < 1800; i++) {
        e.update(1 / 30);
        put();
        if (hz.lookX !== null && hz.s.phase === 'pass' && Math.abs(hz.lookX - at) < 30) return { at: Math.round(at), lookX: Math.round(hz.lookX), phase: hz.s.phase, px: sx, i };
      }
      return { at, miss: true };
    }, [E, where]);
    await p.evaluate((E) => { const e = eval(E); e.render(); }, E);
    for (let i = 0; i < 2; i++) await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    console.log(tag, name, JSON.stringify(r));
    await p.screenshot({ path: `${out}/b23c-${easy ? 'easy' : 'normal'}-look-${name}-${when}-${tag}.jpg`, type: 'jpeg', quality: 82 });
  }
  await p.context().close();
}
await b.close();
