// RUNS #1 #79: stills of the real game at given places (no scratch scene: the stage as built), tools/validate/stills.mjs's way (the
// engine paused, Pokey placed, 60 frames stepped, then 30 frames stepped AND rendered, one per animation frame: the ground paints a few
// squares a frame, so one render after the steps showed the rest as false dark soil boxes, RF's REPORT), 2x, upright 412 x 915 and
// sideways 915 x 412.
//   node tools/engine/runs/stills-at.mjs <port> <out dir> <file prefix> <stage> <layout> <x:pick> ...   pick: low | high (the ledge under x)
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, prefix, id, layout, ...spots] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  // (STAGE_ROLL / STAGE_SEED: the test link's picked roll, set in the page before the stage is built; the seed it built is asserted,
  // and a page that cannot pick or built another seed writes no still: stage.ts reads the ROLL-SEED line and fails closed)
  if (process.env.STAGE_ROLL) {
    const ok = await p.evaluate((r) => { if (typeof window.__setPick11 !== 'function') return false; window.__setPick11(r); return true; }, process.env.STAGE_ROLL);
    if (!ok) { console.log('ROLL-SEED none (no __setPick11 in this build)'); process.exit(3); }
  }
  await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]);
  await p.waitForTimeout(4000);
  if (process.env.STAGE_ROLL) {
    const seed = await p.evaluate((E) => { const e = eval(E); const g = e?.currentStage?.gen2 ?? e?.currentStage?.proto?.gen2; return g?.seed ?? null; }, E);
    console.log(`ROLL-SEED ${seed} ${tag}`);
    if (String(seed) !== process.env.STAGE_SEED) { console.log(`ROLL-SEED mismatch: built ${seed}, asked ${process.env.STAGE_SEED}`); process.exit(4); }
  }
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(5000);
  for (const spot of spots) {
    const [xs, pick = 'low'] = spot.split(':'); const x = +xs;
    await p.evaluate(([x, pick, E]) => {
      const e = eval(E);
      e.isPaused = true;
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => pick === 'low' ? c.y - a.y : a.y - c.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 60; i++) e.update(1 / 30);
    }, [x, pick, E]);
    for (let i = 0; i < 30; i++) {
      await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    // (safe while the frames settle, then not: a still never shows him flashing see-through, the lead 11-05)
    await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
    const file = path.join(out, `${prefix}-${id}-L${layout}-x${x}-${tag}.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 78 });
    console.log('wrote', file);
  }
  await p.context().close();
}
await b.close();
