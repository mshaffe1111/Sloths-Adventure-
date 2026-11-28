// BUILD-29-n: Dot's roar line ON THE REAL PAGE, raised the way the engine says a tip (engine.ts:3355-3368, tipwalk.ts's walk):
// a FRESH context each time (tipHeard is per device: a line marked heard is never said again on it), every other tip marked said (none
// queued ahead), Pokey stood ON the bank with his FEET inside the roar tip's own height band (h.band; box 13's scripts set y to the
// platform's top, so his feet sat a body below it: the likely cause, read in the code, not yet proven), then the page's own touch input holds right
// (e.input.triggerTouchMove, as TouchController.tsx does) and the page's own loop runs. Shot when the words are in the page.
// node roar.mjs <port> <outdir> <normal|easy>
import path from 'node:path'; import fs from 'node:fs';
const pw = await import(process.env.PW); const chromium = pw.chromium ?? pw.default.chromium;
const [port, out, diff] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const ROAR = "That's the king";
const b = await chromium.launch();
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('2-9', 1)); await p.waitForTimeout(6000);
  const set = await p.evaluate(([E, ROAR]) => {
    const e = eval(E); const hs = e.currentStage.proto.hints; const r = hs.find((q) => q.text.startsWith(ROAR));
    for (const q of hs) if (q !== r) q.shown = true;
    const H = e.player.height; const band = r.band ?? [-1e9, 1e9];
    // the bank: a solid top before the tip whose surface is inside the band (his feet stand on it)
    for (let back = 380; back >= 60; back -= 20) {
      const x = r.x - back;
      const tops = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && x >= q.x && x + 40 <= q.x + q.width && q.y >= band[0] && q.y <= band[1]);
      if (!tops.length) continue;
      const t = tops.sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x, y: t.y - H, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, swim: false, facing: 1, invincibleTimer: 30 });
      e.isPaused = false;
      return { tip: Math.round(r.x), band, teach: !!r.teach, story: r.story ?? null, shown: !!r.shown, from: Math.round(x), top: Math.round(t.y), H };
    }
    return { tip: Math.round(r.x), band, teach: !!r.teach, none: true };
  }, [E, ROAR]);
  console.log(tag, 'set', JSON.stringify(set));
  await p.waitForTimeout(800);
  await p.evaluate((E) => eval(E).input.triggerTouchMove('right'), E);
  let seen = false; let at = null;
  for (let i = 0; i < 120 && !seen; i++) {
    await p.waitForTimeout(100);
    seen = await p.evaluate((ROAR) => document.body.innerText.includes(ROAR), ROAR);
    if (seen) at = await p.evaluate((E) => { const e = eval(E); return { x: Math.round(e.player.x), feet: Math.round(e.player.y + e.player.height), swim: !!e.player.swim }; }, E);
  }
  await p.evaluate((E) => eval(E).input.triggerTouchMove('none'), E);
  await p.waitForTimeout(700);
  const f = path.join(out, `n-2-9-${diff}-roar-${tag}.jpg`); await p.screenshot({ path: f, type: 'jpeg', quality: 85 });
  const st = await p.evaluate((E) => { const e = eval(E); return { x: Math.round(e.player.x), feet: Math.round(e.player.y + e.player.height), roarShown: e.currentStage.proto.hints.find((q) => q.text.startsWith("That's the king")).shown }; }, E);
  console.log(tag, 'roar seen', seen, 'when', JSON.stringify(at), 'after', JSON.stringify(st), f);
  await ctx.close();
}
await b.close();
