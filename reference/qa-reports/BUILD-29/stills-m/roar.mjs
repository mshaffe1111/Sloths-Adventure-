// BUILD-29-m: Dot's roar line on the real page, walked into (the engine running): Pokey placed 420 px before the tip, then right held
import path from 'node:path';
const pw = await import(process.env.PW); const chromium = pw.chromium ?? pw.default.chromium;
const [port, out, diff] = process.argv.slice(2);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch();
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('2-9', 1)); await p.waitForTimeout(9000);
  const rx = await p.evaluate((E) => { const e = eval(E); return e.currentStage.proto.hints.find((q) => q.text.startsWith("That's the king")).x; }, E);
  await p.evaluate(([x, E]) => { const e = eval(E); e.isPaused = false; const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    Object.assign(e.player, { x, y: under ? under.y - 2 : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 3 }); }, [rx - 420, E]);
  await p.waitForTimeout(700);
  await p.evaluate(([to, E]) => { const e = eval(E); const id = setInterval(() => { if (e.player.x >= to) { clearInterval(id); return; } e.player.x += 7; e.player.facing = 1; }, 33); }, [rx + 80, E]);
  let seen = false;
  for (let i = 0; i < 80 && !seen; i++) { await p.waitForTimeout(100); seen = await p.evaluate(() => document.body.innerText.includes("That's the king")); }
  const px = await p.evaluate((E) => Math.round(eval(E).player.x), E);
  await p.waitForTimeout(500);
  const f = path.join(out, `m-2-9-${diff}-roar-walk-${tag}.jpg`); await p.screenshot({ path: f, type: 'jpeg', quality: 82 });
  console.log('roar seen', seen, 'tip', Math.round(rx), 'pokey', px, f);
  await ctx.close();
}
await b.close();
