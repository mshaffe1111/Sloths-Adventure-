// Stills of the FIXTURE tower (src/game/gen2/toyTower.ts) on the real page, upright 412 x 915 and sideways 915 x 412 (R-165.170): the
// lay judged where a player sees it. The fixture is no stage of the game, so the dev page is told, in the page only, to roll it in
// place of a climb stage (default 1-4: its config, its world's art): its hand-built plan is unlisted and a one-seed proven list
// planted, the way the game builds a listed stage. Nothing in the repo or the build changes; reload the page and it is gone.
//   npx vite --port 5199 &
//   PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/engine/towerstills.mjs 5199 <out dir> <up|down> <seed> <spot> ...
//   spot: leg:<k>[:<share 0-1>] (standing that far along section k) | vine:<turn>[:<share>] (on that turn's vine) | spawn | summit
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, flow, seedS, ...spots] = process.argv.slice(2);
const seed = +seedS, AS = process.env.TOWER_AS ?? '1-4', SCALE = +(process.env.SCALE ?? 2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: SCALE })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  const built = await p.evaluate(async ([AS, flow, seed]) => {
    const [listed, lists, toy, proto, pipe, data] = await Promise.all(['/src/game/gen2/listed.ts', '/src/game/gen2/seedList.ts', '/src/game/gen2/toyTower.ts', '/src/game/protoStage.ts', '/src/game/gen2/pipeline.ts', '/src/game/worldsData.ts'].map((m) => import(/* @vite-ignore */ m)));
    const cfg0 = data.generateAllLevels().find((l) => l.id === AS);
    const cfg = { ...cfg0, unlocked: true, ...(flow === 'down' ? { travel: 'down', objectiveType: 'sprint' } : {}) };
    const base = flow === 'up' ? toy.upKit : toy.downKit;
    const kit = { ...base, manifest: { ...base.manifest, world: cfg.worldIndex } };
    const st = pipe.buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
    if (st.gen2.errors?.length) return { errors: st.gen2.errors };
    const dict = [];
    const packed = lists.packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...pipe.keptFoes(st)] }, dict);
    delete proto.HAND_STAGES[AS];
    listed.LISTED[AS] = { kit: () => kit };
    lists.plantSeedList(AS, { dict, seeds: [seed], plans: [packed] });
    if (flow === 'down') Object.assign(cfg0, { travel: 'down', objectiveType: 'sprint' });
    return { errors: [], sections: st.gen2.sections.length };
  }, [AS, flow, seed]);
  if (built.errors.length) { console.log('the fixture does not build cleanly here:', built.errors.join('; ')); process.exit(2); }
  await p.evaluate(([id]) => window.__play(id, 1), [AS]);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(4000);
  const info = await p.evaluate((E) => { const e = eval(E); const T = e?.currentStage?.gen2?.tower; return T ? { flow: T.flow, legs: T.route.legs.length, turns: T.turns.length, travel: e.currentStage.config.travel, view: [e.camera.viewportWidth, e.camera.viewportHeight] } : null; }, E);
  if (!info) { console.log('the page did not build the fixture tower (no gen2.tower on the stage)'); process.exit(3); }
  console.log(tag, JSON.stringify(info));
  for (const spot of spots) {
    const at = await p.evaluate(([spot, E]) => {
      const e = eval(E);
      e.isPaused = true;
      const T = e.currentStage.gen2.tower, st = e.currentStage;
      const [kind, a, b] = spot.split(':');
      let x, y, climbing = false, facing = 1;
      if (kind === 'leg') { const g = T.route.legs[+a], s = b === undefined ? 0.25 : +b; x = g.entry.x + (g.exit.x - g.entry.x) * s; y = undefined; facing = g.exit.x < g.entry.x ? -1 : 1; const want = g.entry.y + (g.exit.y - g.entry.y) * s; const under = e.platforms.filter((q) => !q.broken && x >= q.x && x <= q.x + q.width).sort((p1, p2) => Math.abs(p1.y - want) - Math.abs(p2.y - want))[0]; y = under ? under.y : want; }
      else if (kind === 'vine') { const t = T.turns[+a], s = b === undefined ? 0.5 : +b; x = t.x; y = t.from + (t.to - t.from) * s; climbing = true; }
      else if (kind === 'summit') { x = st.exitTotemX - 120; y = st.exitTotemY; facing = 1; }
      else { x = st.spawnX; y = st.spawnY; }
      Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: !climbing, hanging: false, climbing, facing, invincibleTimer: 9 });
      for (const hh of st.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 60; i++) { if (climbing) Object.assign(e.player, { x, y, vx: 0, vy: 0, climbing: true, grounded: false }); e.update(1 / 30); }
      return { x: Math.round(e.player.x), y: Math.round(e.player.y), camY: Math.round(e.camera.y), feetAt: +((e.player.y - e.camera.y) / e.camera.viewportHeight).toFixed(3), climbing: e.player.climbing };
    }, [spot, E]);
    for (let i = 0; i < 30; i++) {
      await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
    const file = path.join(out, `tower-${flow}-s${seed}-${spot.replace(/[:.]/g, '_')}-${tag}.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 78 });
    console.log('wrote', file, JSON.stringify(at));
  }
  await p.context().close();
}
await b.close();
