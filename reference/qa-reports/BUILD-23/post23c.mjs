// BUILD-23c: the mooring post's cage on its shelf on the real page (needs a vite dev server on 5181): Pokey stood at the post's foot
// (just left of the rope), then up the rope where his blow reaches the cage; a still each, upright and sideways; the goal plank's bottom
// and the cage's drawn top read off the page (css px) so 'fully clear below the plank' is a number, not an eyeball.
//   node reference/qa-reports/BUILD-23/post23c.mjs <out dir> [easy]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [out, easy] = process.argv.slice(2);
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:5181/?lessons=off${easy ? '&difficulty=easy' : ''}`);
  await p.waitForTimeout(2500);
  await p.evaluate(([id, v]) => window.__play(id, v), ['2-3', 1]);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(2000);
  for (const [shot, up] of [['foot', 0], ['rope', 1]]) {
    const r = await p.evaluate(([E, up]) => {
      const e = eval(E);
      const v = e.vines.find((q) => q.rope);
      const c = e.collectibles.find((q) => q.type === 'cage' && q.x > v.x - 10 && q.x < v.x + 120);
      e.isPaused = true;
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      // (at the foot: walked up to it, facing it, stood on the bank; on the rope: climbing it where his blow reaches the cage)
      if (!up) Object.assign(e.player, { x: v.x - 30, y: v.bottomY, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 });
      for (let i = 0; i < 90; i++) {
        if (up) Object.assign(e.player, { x: v.x, y: c.y + 45, vx: 0, vy: 0, grounded: false, climbing: true, facing: 1 });
        e.update(1 / 30);
      }
      e.render();
      // (the world's transform: a world y on the page, css px)
      const cv = e.canvas;
      const rc = cv.getBoundingClientRect();
      const k = rc.height / (e.camera.viewportHeight ?? cv.height);
      return { cage: [c.x, c.y], v: [v.x, v.topY, v.bottomY], player: [Math.round(e.player.x), Math.round(e.player.y), e.player.climbing], cam: [e.camera.x, e.camera.y], k };
    }, [E, up]);
    for (let i = 0; i < 3; i++) await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    console.log(tag, shot, JSON.stringify(r));
    await p.screenshot({ path: `${out}/b23c-${easy ? 'easy' : 'normal'}-post-${shot}-${tag}.jpg`, type: 'jpeg', quality: 82 });
  }
  await p.context().close();
}
await b.close();
