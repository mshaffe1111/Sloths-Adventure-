const pw = await import(process.env.PW); const chromium = pw.chromium ?? pw.default.chromium;
const [port, id, x] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 915, height: 412 } });
await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); } catch {} });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
await p.evaluate((id) => window.__play(id, 0), id); await p.waitForTimeout(4000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(5000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const r = await p.evaluate(([x, E]) => {
  const e = eval(E); e.isPaused = true;
  const t0 = e.gameTime;
  const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y)[0];
  const L0 = e.lives ?? e.player.lives;
  Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
  const trace = [];
  for (let i = 0; i < 90; i++) { e.update(1 / 30); if (i % 15 === 0) trace.push([i, Math.round(e.player.x), Math.round(e.player.y)]); }
  return { gameTime: Math.round(t0 * 10) / 10, under: under && { id: under.id, type: under.type, y: under.y, x: under.x, w: under.width }, L0, L1: e.lives ?? e.player.lives, trace, floods: (e.currentStage.rivers ?? []).filter((r) => r.flood).length };
}, [+x, E]);
console.log(port, JSON.stringify(r));
await b.close();
