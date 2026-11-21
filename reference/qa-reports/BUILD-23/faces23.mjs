// BUILD-23b: 2-3's HUD faces on the real page (a vite dev server on 5181): three freed, out in the open (dim), hiding in the reed bed (lit), one spooked
// back (grey, amber '!'), upright and sideways.   node reference/qa-reports/BUILD-23/faces23.mjs <out dir> [easy]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [out, easy] = process.argv.slice(2);
const set = easy ? 'easy' : 'normal';
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
  await p.waitForTimeout(3000);
  const stand = (x, n) => p.evaluate(([E, x, n]) => {
    const e = eval(E);
    e.isPaused = true;
    const under = e.platforms.filter((q) => !q.broken && !q.decorative && q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    for (let i = 0; i < n; i++) e.update(1 / 30);
    e.render();
    return e.lineFaces();
  }, [E, x, n]);
  const shot = async (name, note) => {
    await p.waitForTimeout(500);
    const file = `${out}/b23-L1-${set}-hud-faces-${name}-${tag}.jpg`;
    await p.screenshot({ path: file, type: 'jpeg', quality: 82 });
    console.log(tag, name, JSON.stringify(note));
  };
  // three freed (the engine's own freeing) and walking on the mud: dim
  await p.evaluate((E) => { const e = eval(E); const cs = e.collectibles.filter((c) => c.type === 'cage').sort((a, c) => a.x - c.x).slice(0, 3); for (const c of cs) { e.freeCritter(c); c.collected = true; } }, E);
  const bed = await p.evaluate((E) => { const e = eval(E); const b = e.proto.bushes[0]; return [b.x, b.w]; }, E);
  await stand(bed[0] - 500, 90);
  const walk = await p.evaluate((E) => { const e = eval(E); for (let i = 0; i < 12; i++) { e.player.x += 9; e.player.facing = 1; e.update(1 / 30); } e.render(); return e.lineFaces(); }, E);
  await shot('open', walk);
  // in the bed, the line bunched in behind him, still: lit
  const hid = await stand(bed[0] + bed[1] - 30, 150);
  await shot('hiding', hid);
  // one spooked back (set by follow.ts spook, as the look does): grey with '!'
  const sp = await p.evaluate((E) => { const e = eval(E); const f = e.follow.line[2]; f.state = 'spooked'; f.backX = f.x - 300; f.back = false; return e.lineFaces(); }, E);
  await shot('spooked', sp);
  await p.context().close();
}
await b.close();
