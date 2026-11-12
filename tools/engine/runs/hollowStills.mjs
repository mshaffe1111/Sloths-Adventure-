// The thorn hollow's stills (t-pit-polish, 11-12): a stage's platforms dumped headless (tools/engine/runs/hollowKit.ts: the library's
// 1-2 kit, flown rows, any seed) laid into the real page over World 1's 1-2, Pokey placed, then 60 updates and 30 RENDERED frames before
// the shot (one render after the updates paints only a few ground squares: the rest show as dark soil boxes, RF's REPORT), 2x,
// upright 412 x 915 and sideways 915 x 412. Nothing in the game imports it.
//   node tools/engine/runs/hollowStills.mjs <port> <out dir> <file prefix> <dump.json> <x> ...
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, prefix, dumpFile, ...spots] = process.argv.slice(2);
const dump = JSON.parse(fs.readFileSync(dumpFile, 'utf8'));
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off&seed=${process.env.SCENE_SEED ?? 7}`);
  // (Dot's bubble is not what the still is about)
  await p.addStyleTag({ content: '.dg-root{display:none!important}' });
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('1-2', 1));
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3000);
  await p.evaluate(async ([d, E]) => {
    const e = eval(E);
    // (the stage's water is 1-2's own, not the kit's: none over the hollows)
    (await import('/src/game/w1Pits.ts')).setW1PitWater([]);
    e.platforms = d.platforms; e.currentStage.platforms = d.platforms;
    e.collectibles = d.collectibles; e.currentStage.collectibles = d.collectibles;
    e.vines = d.vines; e.currentStage.vines = d.vines;
    e.enemies = []; e.currentStage.enemies = [];
    // (1-2's own water, death line and heart falls are not the kit's: Pokey would be lost at the kit's lower ground)
    if (e.proto) e.proto.water = [];
    e.currentStage.waterY = undefined; e.currentStage.rivers = []; e.currentStage.heartFalls = [];
    e.currentStage.config = { ...e.currentStage.config, levelHeight: 4000, levelWidth: Math.max(...d.platforms.map((q) => q.x + q.width)) + 400 };
    { const st = e.currentStage; e.walls = e.mode.bounds({ levelWidth: st.config.levelWidth, exit: { x: st.config.levelWidth, y: st.exitTotemY }, spawn: e.startAt }); }
  }, [dump, E]);
  for (const xs of spots) {
    const x = +xs;
    await p.evaluate(([x, E]) => {
      const e = eval(E);
      e.isPaused = true;
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type === 'solid' && q.pit !== 'hurt' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 60; i++) e.update(1 / 30);
    }, [x, E]);
    // (30 rendered frames, one per animation frame: the ground paints its squares a few per frame)
    for (let i = 0; i < 30; i++) {
      await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
    const file = path.join(out, `${prefix}-x${x}-${tag}.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 82 });
    console.log('wrote', file);
  }
  await p.context().close();
}
await b.close();
