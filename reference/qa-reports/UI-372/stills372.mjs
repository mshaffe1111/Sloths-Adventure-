// UI-372 stills: the BUILT edge marker on 2-3 (the engine's own draw): a spooked little one off the left, off the right, and the moment it
// goes away (he walks back until it is on the screen). Easy by localStorage sloth_difficulty only.
//   node reference/qa-reports/UI-372/stills372.mjs <out dir> [easy]     (a vite dev server on 5181)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [out, easy] = process.argv.slice(2);
const set = easy ? 'easy' : 'normal';
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  if (easy) await p.addInitScript(() => localStorage.setItem('sloth_difficulty', 'easy'));
  await p.goto('http://127.0.0.1:5181/?lessons=off');
  await p.waitForTimeout(2500);
  await p.evaluate(([id, v]) => window.__play(id, v), ['2-3', 1]);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3000);
  await p.evaluate((E) => { const e = eval(E); const cs = e.collectibles.filter((c) => c.type === 'cage').sort((a, c) => a.x - c.x).slice(0, 3); for (const c of cs) { e.freeCritter(c); c.collected = true; } }, E);
  const built = await p.evaluate((E) => { const e = eval(E); return { easy: !!e.easy, cages: e.collectibles.filter((c) => c.type === 'cage').length }; }, E);
  console.log(tag, 'built', JSON.stringify(built));
  const setup = (side) => p.evaluate(([E, side]) => {
    const e = eval(E);
    e.isPaused = true;
    const bed = e.proto.bushes[0];
    const x = bed.x + bed.w - 30;
    const under = e.platforms.filter((q) => !q.broken && !q.decorative && q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    for (let i = 0; i < 120; i++) e.update(1 / 30);
    const f = e.follow.line[1];
    f.state = 'spooked'; f.back = true; f.backX = side === 'left' ? e.camera.x - 330 : e.camera.x + e.camera.viewportWidth + 330; f.x = f.backX;
    e.render();
    const m = e.spookMarks();
    return { kind: f.kind, fx: Math.round(f.x), cam: Math.round(e.camera.x), marks: m.marks.slice(0, m.n).map((q) => ({ ...q })), faces: (e.lineFaces() ?? []).map((q) => `${q.kind}:${q.st}`) };
  }, [E, side]);
  const shot = async (name, note) => {
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/ui372-${set}-${name}-${tag}.jpg`, type: 'jpeg', quality: 85 });
    console.log(tag, name, JSON.stringify(note));
  };
  const first = await setup('left');
  // (the stage's goal card: let it go before the first shot)
  await p.waitForFunction(() => !document.querySelector('[class*="card" i][class*="goal" i], .vh-goalcard'), null, { timeout: 12000 }).catch(() => {});
  await p.waitForTimeout(6000);
  await shot('left', await setup('left'));
  // he walks back toward it: still off, then the moment it is on the screen (its body past the edge): the marker is gone
  for (const step of ['nearing', 'gone']) {
    const note = await p.evaluate(([E, step]) => {
      const e = eval(E);
      const f = e.follow.line[1];
      for (let i = 0; i < 400; i++) {
        e.player.x -= 6; e.player.facing = -1;
        e.update(1 / 30);
        f.state = 'spooked'; f.back = true; f.x = f.backX;
        const on = e.spookMarks().n === 0;
        if (step === 'nearing' && f.x + 24 < e.camera.x && f.x + 24 > e.camera.x - 60) break;
        if (step === 'gone' && on) break;
      }
      e.render();
      const m = e.spookMarks();
      return { fx: Math.round(f.x), cam: Math.round(e.camera.x), n: m.n, faces: (e.lineFaces() ?? []).map((q) => `${q.kind}:${q.st}`), line: e.follow.line.map((q) => `${q.kind}:${q.state}@${Math.round(q.x)}`) };
    }, [E, step]);
    await shot(step, note);
  }
  await shot('right', await setup('right'));
  await p.context().close();
}
await b.close();
