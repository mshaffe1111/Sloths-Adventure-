// The river proof on the real page (ENG-W2b): World 2's page (2-3 loaded for its sky and art), the gen2-laid proof stage put in its place
// (fixture.ts: the same platforms, rivers, riding petals and reeds the pipeline built), stepped frame by frame through the real touch pad
// (tools/inspect/clipPress.mjs pressFrame: e.update + e.render). Prints what was built (setting, seed, orientation).
//   node shoot.mjs <port> <fix.json> <out> <up|side> <mode: stills|clip>
import fs from 'node:fs';
import { pressFrame } from '/home/user/Sloths-Adventure-/tools/inspect/clipPress.mjs';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, fixPath, out, ori, mode] = process.argv.slice(2);
const fix = JSON.parse(fs.readFileSync(fixPath, 'utf8'));
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: mode === 'clip' ? 1 : 2 });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, fix.setting);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('2-1', 1));
await p.waitForTimeout(3000);
// (the stage card: tapped away as a player does, then waited out)
for (let i = 0; i < 6; i++) { await p.mouse.click(VP.width / 2, VP.height / 2); await p.waitForTimeout(700); if (await p.evaluate(() => document.documentElement.dataset.hudCard !== '1')) break; }
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => console.log('CARD STILL UP'));
await p.waitForTimeout(1500);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player); }, E, { timeout: 60000 });
const built = await p.evaluate(([E, fix]) => {
  const e = eval(E); e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  e.platforms = fix.platforms; e.currentStage.platforms = fix.platforms; e.currentStage.rivers = fix.rivers;
  e.collectibles = fix.collectibles; e.currentStage.collectibles = fix.collectibles; e.enemies = []; e.currentStage.enemies = [];
  if (e.proto) { e.proto.decor = fix.decor; e.proto.hints = []; if (e.proto.gen2) e.proto.gen2.waterWarnings = []; }
  e.kit = null; e.checkpoints = []; e.currentStage.checkpoints = [];
  if (e.startPieces) e.startPieces();
  return { setting: localStorage.getItem('sloth_difficulty'), w: innerWidth, h: innerHeight, world: e.currentStage.config.worldIndex };
}, [E, fix]);
console.log('BUILT', JSON.stringify({ ...built, seed: fix.seed, laid: fix.logRivers }));
const put = (x, y) => p.evaluate(([E, x, y]) => { const e = eval(E); Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: true }); }, [E, x, y]);
const step = (inp = {}) => p.evaluate(([src, E, inp]) => (new Function(`return (${src})`)())(eval(E), inp, { safe: true }), [pressFrame.toString(), E, inp]);
const shot = async (name) => { await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); await p.screenshot({ path: `${out}/${name}.png` }); };
const [safe, deep] = [fix.logRivers.find((r) => r.safe), fix.logRivers.find((r) => !r.safe)];
const bankY = safe.surfaceY - 42;
if (mode === 'stills') {
  for (const [name, r] of [['safe', safe], ['deep', deep]]) {
    await put(r.x0 - 90, bankY);
    for (let i = 0; i < 45; i++) await step({});
    await shot(`river-${name}-${ori}`);
  }
} else {
  // a scripted thumb (NOT the middle bot, which runs headless): walk to the safe river's edge, hop when a log's top is under the landing,
  // ride, hop log to log, step off; then the deep river the same way. Every press goes through the real touch pad.
  await put(safe.x0 - 300, bankY);
  let f = 0;
  const logs = () => p.evaluate((E) => eval(E).platforms.filter((q) => q.type === 'drift').map((q) => ({ x: q.x, w: q.width, x0: q.drift.x0, x1: q.drift.x1, id: q.id })), E);
  const me = () => p.evaluate((E) => { const e = eval(E); return { x: e.player.x, y: e.player.y, g: !!e.player.grounded, on: e.standingOnId }; }, E);
  for (let i = 0; i < 2400 && f < 900; i++) {
    const m = await me(), L = await logs();
    const onLog = L.find((q) => q.id === m.on);
    const r = m.x < safe.x1 ? safe : deep;
    const edge = onLog ? onLog.x + onLog.w : r.x0;
    // (a log ahead whose near end is within a short hop of the edge, at most 25 px past it, and long enough to land on)
    const next = L.find((q) => q !== onLog && q.x0 === (onLog ? onLog.x0 : r.x0) && q.x <= edge + 25 && q.x + q.w >= edge + 90);
    const bank = onLog && edge >= r.x1 - 30;
    let inp = {};
    if (m.x > deep.x1 + 250) break;
    if (!m.g) inp = { right: true };
    else if (m.x < edge - 40) inp = { right: true };
    else if (next || bank) inp = { right: true, jump: true, holdMs: 120 };
    await step(inp);
    if (i % 2 === 0) { await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); await p.screenshot({ path: `${out}/f${String(f++).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 80 }); }
  }
  console.log('frames', f);
}
await b.close();
