// ENG-WALL-c: the stage start's dolly, shot at 2x on the game's own loop: early in the ease, mid-ease, settled (the lead's condition
// for C: no blur settled, no pop at the ease's end, no shade jump). The frame's zoom is read with each shot.
//   node ease-stills.mjs <port> <out> <tag> [upright|sideways]
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const fs = await import('node:fs');
const [port, out, tag, orient = 'upright'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const [W, H] = orient === 'upright' ? [412, 915] : [915, 412];
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })).newPage();
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(3000);
await p.evaluate(() => window.__play('2-97', 1));
// (wait for the first played frame: the engine's intro clock starts)
await p.waitForFunction((E) => { try { const e = eval(E); return e && e.introT > 0; } catch { return false; } }, E, { timeout: 30000, polling: 16 });
for (const [name, at] of [['early', 0.25], ['mid', 0.6], ['settled', 1.3]]) {
  await p.waitForFunction(([E, at]) => eval(E).introT >= at, [E, at], { timeout: 30000, polling: 16 }).catch(() => {});
  if (name === 'settled') await p.waitForTimeout(2000);
  const z = await p.evaluate((E) => { const e = eval(E); return [+e.introT.toFixed(2), +e.zoom.toFixed(4)]; }, E);
  await p.screenshot({ path: `${out}/${tag}-${orient}-${name}.png` });
  console.log(`${tag} ${orient} ${name}: introT ${z[0]} zoom ${z[1]}`);
}
await b.close();
