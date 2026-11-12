// P13: stills of a BOT's run in the real page, each moment as the run had it (stills-at.mjs's way: the engine paused, Pokey placed, 30
// frames stepped, rendered), 2x, upright 412 x 915 and sideways 915 x 412. The moments come from a headless run (a JSON list: name, x, y,
// facing, hearts, the goal count, the animals gone by id, the drop traps sprung by index): at each, the page's stage is put in that state
// first, so the goal count, the cleared branches and the fallen loads are the run's, not the stage as built.
//   node tools/engine/runs/ft-stills.mjs <port> <out dir> <prefix> <stage> <layout> <moments.json>
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, prefix, id, layout, file] = process.argv.slice(2);
const moments = JSON.parse(fs.readFileSync(file, 'utf8'));
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  for (const m of moments) {
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]);
    await p.waitForTimeout(4000);
    await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(3000);
    const note = await p.evaluate(([m, E]) => {
      const e = eval(E);
      e.isPaused = true;
      for (const q of e.enemies) if (m.gone.includes(q.id)) q.defeated = true;
      (e.cast?.traps ?? []).forEach((t, i) => { if (m.down.includes(i)) Object.assign(t, { phase: 'down', y: t.post.landY, vy: 0, t: 9 }); });
      Object.assign(e.player, { x: m.x, y: m.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: m.facing, hp: m.hp, enemiesDefeated: m.n, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 30; i++) e.update(1 / 30);
      // (one frame unpaused: a paused update returns before the HUD is told the goal count)
      e.isPaused = false;
      e.update(1 / 30);
      e.isPaused = true;
      // (and the HUD told the run's count straight, as the engine tells it each frame: engine.ts "Notify HUD")
      e.callbacks.onProgressUpdate(m.n, e.currentStage.config.targetCount, e.runScore, m.hp, 1, null, 0);
      e.clearGuide?.();
      e.player.invincibleTimer = 0;
      e.render();
      return { x: Math.round(e.player.x), y: Math.round(e.player.y), n: e.player.enemiesDefeated, out: e.enemies.filter((q) => !q.defeated).length };
    }, [m, E]);
    await p.waitForTimeout(400);
    const f = path.join(out, `${prefix}-${id}-L${layout}-${moments.indexOf(m) + 1}-${m.name}-${tag}.jpg`);
    await p.screenshot({ path: f, type: 'jpeg', quality: 78 });
    console.log('wrote', f, JSON.stringify({ t: m.t, ...note }));
  }
  await p.context().close();
}
await b.close();
