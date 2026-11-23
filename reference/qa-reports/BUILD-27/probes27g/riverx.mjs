// BUILD-27g: the rivers of the LISTED 2-7 (layout 0 = list seed 1) on a dev server at $PORT, both settings: x, width, depth, kind
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const port = process.env.PORT ?? '4318';
const b = await chromium.launch();
for (const d of ['normal', 'easy']) {
  const ctx = await b.newContext(); await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, d);
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('2-7', 0)); await p.waitForTimeout(4000);
  console.log(d, await p.evaluate(() => { const e = window.__engine(); const s = e.currentStage; const g = s.gen2;
    const rv = (s.rivers ?? []).map((r) => JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k, v]) => typeof v !== 'object' || v === null).map(([k, v]) => [k, typeof v === 'number' ? Math.round(v) : v]))));
    return `seed ${g?.seed} diff ${g?.budget?.difficulty}\n  ` + rv.join('\n  '); }));
  await ctx.close();
}
await b.close();
