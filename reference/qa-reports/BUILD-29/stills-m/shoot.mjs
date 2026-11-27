// BUILD-29-m stills: 2-9 layout 1, one setting, upright 412x915 and sideways 915x412 at 2x. (a) the wayside line at the start, (b) Dot's
// roar line at its bank, (c) each spot (pads/quay/guard) with Pokey placed there and the frog's screen box printed for the crop.
import fs from 'node:fs'; import path from 'node:path';
const pw = await import(process.env.PW); const chromium = pw.chromium ?? pw.default.chromium;
const [port, out, diff, ...spots] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch();
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('2-9', 1));
  // (a) the wayside bubble: Pokey's own start line
  const way = await p.waitForFunction(() => document.body.innerText.includes('I bet Meeca admired'), null, { timeout: 20000 }).then(() => true).catch(() => false);
  await p.waitForTimeout(600);
  const fa = path.join(out, `m-2-9-${diff}-wayside-${tag}.jpg`); await p.screenshot({ path: fa, type: 'jpeg', quality: 80 }); console.log('wayside shown', way, fa);
  console.log('SEED', await p.evaluate((E) => { const e = eval(E); return e.currentStage.gen2?.seed + ' cam keys ' + Object.keys(e).filter((k) => /cam/i.test(k)).join(','); }, E));
  // (b) the roar line: Pokey on its bank before it, every other hint marked said, the roar's not
  const roarX = await p.evaluate((E) => { const e = eval(E); const hs = e.currentStage.proto.hints; const r = hs.find((q) => q.text.startsWith("That's the king")); for (const q of hs) q.shown = q !== r; e.clearGuide?.(); return r.x; }, E);
  await p.evaluate(([x, E]) => { const e = eval(E); const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, facing: 1, invincibleTimer: 0 }); }, [roarX + 30, E]);
  const roar = await p.waitForFunction(() => document.body.innerText.includes("That's the king"), null, { timeout: 20000 }).then(() => true).catch(() => false);
  await p.waitForTimeout(900);
  const fb = path.join(out, `m-2-9-${diff}-roar-${tag}.jpg`); await p.screenshot({ path: fb, type: 'jpeg', quality: 80 }); console.log('roar shown', roar, 'at', roarX, fb);
  // (c) the spots, the frog's box on screen printed
  for (const xs of spots) {
    const x = xs === 'frog' ? await p.evaluate((E) => { const e = eval(E); const f = (e.currentStage.proto.dress ?? []).filter((d) => /frog/i.test(d.n) && d.x > 20000)[0]; return f ? Math.round(f.x) - 200 : 0; }, E) : +xs;
    await p.evaluate(([x, E]) => { const e = eval(E); e.isPaused = true; for (const q of e.currentStage.proto.hints ?? []) q.shown = true;
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (let i = 0; i < 60; i++) e.update(1 / 30); }, [x, E]);
    for (let i = 0; i < 30; i++) { await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); }
    const info = await p.evaluate((E) => { const e = eval(E); const c = e.camera ?? {}; const z = c.zoom ?? c.scale ?? 1;
      const fr = (e.currentStage.proto.dress ?? []).filter((d) => /frog|turtle/i.test(d.n)).map((d) => ({ n: d.n, x: Math.round(d.x), b: d.b }));
      return { cam: { x: c.x, y: c.y, z }, px: Math.round(e.player.x), fr }; }, E);
    const f = path.join(out, `m-2-9-${diff}-x${x}-${tag}.jpg`); await p.screenshot({ path: f, type: 'jpeg', quality: 85 }); console.log('spot', f, JSON.stringify(info));
  }
  await ctx.close();
}
await b.close();
