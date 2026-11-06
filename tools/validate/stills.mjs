// The fun validator's stills (fun-validator): for each flag with a place (its x) on a stage's page, the real game at that spot, layout 1,
// Normal, upright 412x915 and sideways 915x412. The engine is paused and stepped (update + render), so the shot is the frame a phone shows.
//   NODE_ENV=development npx vite build --outDir <dist>; serve <dist> on <port>; node tools/validate/stills.mjs <port> [ids]
// Reads reference/qa-reports/validator/world1.json (scores[id].pageFlags, in page order); writes stills/<id>-f<k>-<upright|sideways>.jpg.
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port = '4301', only] = process.argv.slice(2);
const DIR = 'reference/qa-reports/validator';
const j = JSON.parse(fs.readFileSync(path.join(DIR, 'world1.json'), 'utf8'));
const ids = (only ? only.split(',') : Object.keys(j.scores)).filter((id) => j.scores[id]);
fs.mkdirSync(path.join(DIR, 'stills'), { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  for (const id of ids) {
    const flags = j.scores[id].pageFlags.map((f, k) => ({ ...f, k })).filter((f) => typeof f.x === 'number');
    if (!flags.length) continue;
    const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
    p.on('pageerror', (e) => console.log('ERR', id, e.message));
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate((id) => window.__play(id, 1), id);
    await p.waitForTimeout(4000);
    await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(6000);
    for (const f of flags) {
      await p.evaluate(([x, E]) => {
        const e = eval(E);
        e.isPaused = true;
        // (on the ledge under x nearest the floor: the flags' x come from the route along the ground or the trail)
        const under = e.platforms.filter((q) => !q.broken && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => Math.abs(a.y - 580) - Math.abs(c.y - 580))[0];
        Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
        for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
        for (let i = 0; i < 40; i++) e.update(1 / 30);
        e.clearGuide?.();
        // (safe while the frames settle, then not: a still never shows him flashing see-through, the lead 11-05)
        e.player.invincibleTimer = 0;
        e.render();
      }, [f.x, E]);
      const file = path.join(DIR, 'stills', `${id}-f${f.k}-${tag}.jpg`);
      await p.screenshot({ path: file, type: 'jpeg', quality: 70 });
    }
    console.log(tag, id, flags.length, 'stills');
    await p.context().close();
  }
}
await b.close();
