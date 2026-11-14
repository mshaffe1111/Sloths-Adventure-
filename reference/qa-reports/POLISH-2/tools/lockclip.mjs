// POLISH-2: the fig lock on the real page (R-165.212): Pokey on a field vine under a shut gate's fig, up held until it locks and the
// gate opens; a frame every `every` engine frames, 2x, upright or sideways, Normal or Easy.
//   node lockclip.mjs <port> <out dir> <stage> <layout> <normal|easy> <upright|sideways> <gate index> [every=2] [frames=110]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, id, layout, setting, tag, gi = '0', every = '2', frames = '110'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const [w, h] = tag === 'upright' ? [412, 915] : [915, 412];
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off${setting === 'easy' ? '&difficulty=easy' : ''}`);
await p.waitForTimeout(2500);
await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]);
await p.waitForTimeout(4000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(4000);
const info = await p.evaluate(([gi, E]) => {
  const e = eval(E);
  e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  const g = e.currentStage.gates[+gi];
  const c = e.clusters.find((q) => q.id === g.clusters[0]);
  const v = e.vines.find((q) => q.id === c.vine);
  Object.assign(e.player, { x: v.x, y: c.y + 90, vx: 0, vy: 0, grounded: false, climbing: true, hanging: false, facing: 1, invincibleTimer: 9 });
  for (let i = 0; i < 20; i++) { e.input.state.up = false; e.update(1 / 30); }
  return { gate: g.id, figs: g.clusters.length, vine: v.id, x: v.x, y: c.y };
}, [gi, E]);
console.log('setup', JSON.stringify(info));
let k = 0;
for (let i = 0; i < +frames; i++) {
  const st = await p.evaluate(([i, E]) => {
    const e = eval(E);
    const g = e.currentStage.gates.find((q) => true && q);
    // (up held until every fig of this gate is in: the next fig is the next one his hands are under; one gate's first fig only here)
    e.input.state.up = i < 70;
    e.update(1 / 30);
    e.clearGuide?.();
    e.player.invincibleTimer = 0;
    e.render();
    return { y: e.player.y };
  }, [i, E]);
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
  if (i % +every === 0) {
    await p.evaluate((E) => { const e = eval(E); e.render(); }, E);
    await p.screenshot({ path: path.join(out, `f${String(k++).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 80 });
  }
}
console.log('frames', k);
await b.close();
