// BUILD-29-o: the King's Court on the real page (finish29: lily carpet, dais, throne before the shrine). Pokey stood on the shrine's
// ground (y = top - height: his feet on it) on the court's first carpet, facing the throne; the page's loop runs; shot upright and sideways.
// node court.mjs <port> <outdir> <normal|easy>
import path from 'node:path'; import fs from 'node:fs';
const pw = await import(process.env.PW); const chromium = pw.chromium ?? pw.default.chromium;
const [port, out, diff] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch();
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('2-9', 1)); await p.waitForTimeout(6000);
  const set = await p.evaluate((E) => {
    const e = eval(E); const dec = e.currentStage.proto.decor ?? [];
    const court = dec.filter((q) => ['lilyCarpet', 'dais', 'throne'].includes(q.n));
    const throne = court.find((q) => q.n === 'throne'); const carpet = court.find((q) => q.n === 'lilyCarpet');
    const x = (carpet ?? throne).x - 40; const G = court.find((q) => q.n === 'dais').b - 14;
    Object.assign(e.player, { x, y: G - e.player.height, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, swim: false, facing: 1, invincibleTimer: 0 });
    e.isPaused = false;
    return { court: court.map((q) => `${q.n}@${Math.round(q.x)} w${q.w}`), shrine: Math.round(e.currentStage.exitTotemX), stood: Math.round(x), G, H: e.player.height };
  }, E);
  console.log(diff, tag, 'set', JSON.stringify(set));
  await p.waitForTimeout(6000);
  const f = path.join(out, `o-2-9-${diff}-court-${tag}.jpg`); await p.screenshot({ path: f, type: 'jpeg', quality: 88 });
  const st = await p.evaluate((E) => { const e = eval(E); return { x: Math.round(e.player.x), feet: Math.round(e.player.y + e.player.height), grounded: !!e.player.grounded }; }, E);
  console.log(diff, tag, 'after', JSON.stringify(st), f);
  await ctx.close();
}
await b.close();
