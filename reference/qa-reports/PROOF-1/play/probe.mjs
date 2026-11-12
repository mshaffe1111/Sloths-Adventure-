import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
const p = await ctx.newPage();
await p.goto(process.argv[2] + '?autostart=1&level=1-1&lessons=off');
await p.waitForTimeout(4000);
for (let i=0;i<5;i++){ const k=p.locator('button:has-text("Skip")').first(); if (await k.count()) { await k.evaluate((e)=>e.click()); await p.waitForTimeout(1500);} }
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const findEngine = () => {
    for (const el of document.querySelectorAll('canvas, div')) {
      const k = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
      if (!k) continue;
      for (let f = el[k]; f; f = f.return) {
        for (let h = f.memoizedState; h && typeof h === 'object' && 'next' in h; h = h.next) {
          const v = h.memoizedState;
          if (v && typeof v === 'object' && 'current' in v && v.current && typeof v.current === 'object' && 'player' in v.current) return v.current;
        }
      }
    }
    return null;
  };
  const e = findEngine(); window.__E = findEngine;
  if (!e) { const n = document.querySelectorAll('canvas').length; return 'no engine; canvases ' + n + ' text ' + document.body.innerText.slice(0,200); }
  const s = e.currentStage;
  return { keys: Object.keys(e).slice(0, 80).join(','), player: { x: e.player.x, y: e.player.y }, stageKeys: Object.keys(s).join(','), w: s.width, goal: s.goal ?? s.goalX ?? null, cps: (s.checkpoints || []).map((c) => [Math.round(c.x), Math.round(c.y)]) };
});
console.log(JSON.stringify(r, null, 1).slice(0, 4000));
await b.close();
