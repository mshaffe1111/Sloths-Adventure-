const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b = await chromium.launch(); const p = await b.newPage();
for (const d of ['normal','easy']) {
await p.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, d);
await p.goto('http://127.0.0.1:4318/?lessons=off'); await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('2-7', 0)); await p.waitForTimeout(4000);
console.log(d, await p.evaluate(() => { const e = window.__engine(); const g=e.currentStage.gen2; const ps = e.platforms.filter(q => q.style === "canopy_bridge").map(q => `${q.type}@${Math.round(q.x)},${Math.round(q.y)} w${Math.round(q.width)}`); return JSON.stringify({seed:g.seed, diff:g.budget?.difficulty, ps}); }));
}
await b.close();
