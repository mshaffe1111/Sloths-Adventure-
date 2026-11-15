// INT-7b: node tipwalk.mjs [port]  (PW=<playwright index.mjs>; the frozen worktree's vite). Proof that 1-4's teach tips fire by x alone near the spawn.
// From the real spawn on 1-4 (layout 0), hold right (a jump every 20 frames) for 20 s of play; log each stage tip the moment it is marked shown, with Pokey's x, y.
const { chromium } = await import(process.env.PW ?? 'playwright');
const b = await chromium.launch();
for (const diff of ['normal', 'easy']) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${process.argv[2] ?? 3217}/?lessons=off`); await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('1-4', 0)); await p.waitForTimeout(5000);
  const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
  await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.field); }, E, { timeout: 60000 });
  const r = await p.evaluate((E) => {
    const e = eval(E); e.isPaused = true; const P = e.player; const out = [`spawn x ${Math.round(P.x)} y ${Math.round(P.y)} built ${e.currentStage.gen2?.budget?.difficulty} seed ${e.currentStage.gen2?.seed}`];
    const hs = e.currentStage.proto?.hints ?? []; const was = new Set(hs.filter((h) => h.shown));
    const gateY = Math.min(...e.field.gates.map((g) => e.platforms.find((q) => q.id === g.platform)?.y ?? 1e9)); const lowGateY = Math.max(...e.field.gates.map((g) => e.platforms.find((q) => q.id === g.platform)?.y ?? -1e9));
    out.push(`fig gate boughs y ${lowGateY} (lowest) .. ${gateY} (highest); creak boughs lowest y ${Math.max(...e.platforms.filter((q) => q.creak).map((q) => q.y))}`);
    for (let i = 0; i < 600; i++) {
      Object.assign(e.input.state, { right: true, left: false, up: false, down: false, jumpHeld: i % 20 < 2, jumpPressed: i % 20 === 0 });
      P.invincibleTimer = 9; e.update(1 / 30);
      for (const h of hs) if (h.shown && !was.has(h)) { was.add(h); out.push(`t ${(i / 30).toFixed(1)} s: "${h.text.slice(0, 40)}" (tip x ${Math.round(h.x)}) at x ${Math.round(P.x)} y ${Math.round(P.y)}`); }
    }
    out.push(`after 20 s: x ${Math.round(P.x)} y ${Math.round(P.y)}`);
    return out;
  }, E);
  console.log(diff + ':\n  ' + r.join('\n  '));
  await ctx.close();
}
await b.close();
