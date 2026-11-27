// WARN-412 proof: 2-1's water warning said on Normal's DEFAULT setting (Tips), a fresh device (a new browser context: no saved help
// setting, nothing heard), upright 412x915 and sideways 915x412, dsf 1 (a check still). The stage as the game builds it (__play, layout 1:
// the designed roll), Pokey stood just past the warning's x on the ground under it, the engine running: Dot's bubble is the real one.
//   node reference/qa-reports/WARN-412/waterstill.mjs <port> <out dir>
import fs from 'node:fs';
import path from 'node:path';
const pw = await import(process.env.PW ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const [port, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); } catch {} });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('2-1', 1));
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3000);
  const info = await p.evaluate((E) => {
    const e = eval(E);
    const hints = e.currentStage?.proto?.hints ?? e.proto?.hints ?? [];
    const wh = hints.find((q) => q.warn);
    if (!wh) return { none: true, texts: hints.map((q) => q.text) };
    const x = wh.x + 8;
    const under = e.platforms.filter((q) => !q.broken && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y)[0];
    for (const hh of hints) if (hh !== wh) hh.shown = true;
    Object.assign(e.player, { x, y: under ? under.y - e.player.height : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
    e.isPaused = false;
    return { seed: e.currentStage?.gen2?.seed, help: localStorage.getItem('sloth_dot_help'), x: wh.x, text: wh.text, warn: wh.warn };
  }, E);
  console.log('BUILT', tag, JSON.stringify(info));
  await p.waitForTimeout(2500);
  // (a still never shows him flashing see-through: the safe timer is for settling only, the lead 11-05)
  await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; }, E);
  await p.waitForTimeout(400);
  const said = await p.evaluate(() => document.body.innerText.includes("This river's deep"));
  console.log('ON SCREEN', tag, said);
  const file = path.join(out, `warn412-2-1-L1-normal-tips-water-${tag}.jpg`);
  await p.screenshot({ path: file, type: 'jpeg', quality: 78 });
  console.log('wrote', file);
  await ctx.close();
}
await b.close();
