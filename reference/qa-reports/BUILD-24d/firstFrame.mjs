const { chromium } = await import(process.env.PW);
const [out, x, stage = '2-4', diff = 'easy'] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.goto('http://127.0.0.1:5199/'); await p.waitForTimeout(2500);
await p.evaluate((s) => window.__play(s, 1), stage); await p.waitForTimeout(4000);
for (let k = 0; k < 6 && (await p.evaluate(() => document.documentElement.dataset.hudCard === '1')); k++) { await p.touchscreen.tap(450, 200); await p.waitForTimeout(700); }
const shallowBefore = await p.evaluate(() => performance.getEntriesByType('resource').filter((r) => /shallow/.test(r.name)).map((r) => [r.name.split('/').pop(), Math.round(r.startTime)]));
console.log('shallow loaded before any river drawn:', JSON.stringify(shallowBefore), 'now', Math.round(await p.evaluate(() => performance.now())));
await p.evaluate(([x, E]) => { const e = eval(E); e.isPaused = true; const u = e.platforms.filter((q) => !q.broken && q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0]; Object.assign(e.player, { x, y: u ? u.y : 900, vx: 0, vy: 0, grounded: true }); e.updateCamera(1 / 30); e.camCut = true; }, [+x, E]);
for (const n of [1, 2, 4, 30]) {
  for (let i = 0; i < n; i++) await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.render(); }, E);
  await p.screenshot({ path: `${out}-f${n}.jpg`, type: 'jpeg', quality: 70 });
}
console.log('after:', JSON.stringify(await p.evaluate(() => performance.getEntriesByType('resource').filter((r) => /shallow/.test(r.name)).map((r) => [r.name.split('/').pop(), Math.round(r.startTime), Math.round(r.duration)]))));
await b.close();
