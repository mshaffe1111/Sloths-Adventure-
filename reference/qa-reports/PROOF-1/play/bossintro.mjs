// time from the engine's first running frame to the boss intro ending and the HUD showing, head vs main (1-10, done save, sideways)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.argv[2];
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(base);
await p.evaluate(() => { const L = localStorage; L.clear(); L.setItem('sloth_howto_seen', '1'); L.setItem('sloth_coach_done', '1'); L.setItem('sloth_difficulty', 'normal'); for (let w = 1; w <= 2; w++) for (let m = 1; m <= 10; m++) L.setItem(`sloth_lvl_${w}-${m}`, JSON.stringify({ completed: true, stars: 3, highScore: 3000, bestTime: 150 })); L.setItem('sloth_story_w1', '1'); });
await p.goto(base + '?autostart=1&level=1-10');
for (let i = 0; i < 20; i++) { await p.waitForTimeout(700); const k = p.locator('button:has-text("Skip"), .boss-card button').first(); if (await k.count() && await k.isVisible().catch(() => false)) await k.evaluate((e) => e.click()); else if (i > 4) break; }
const samples = await p.evaluate(async () => {
  const find = () => { for (const el of document.querySelectorAll('canvas, div')) { const k = Object.keys(el).find((k) => k.startsWith('__reactFiber$')); if (!k) continue; for (let f = el[k]; f; f = f.return) for (let h = f.memoizedState; h && typeof h === 'object' && 'next' in h; h = h.next) { const v = h.memoizedState; if (v && typeof v === 'object' && 'current' in v && v.current && typeof v.current === 'object' && 'player' in v.current && 'currentStage' in v.current) return v.current; } } return null; };
  const out = []; const t0 = performance.now();
  for (let i = 0; i < 120; i++) {
    const e = find();
    const hud = document.querySelector('.vh-menu');
    const fade = hud ? getComputedStyle(hud).opacity : null;
    out.push({ t: Math.round(performance.now() - t0), run: e?.isRunning, intro: e?.bossIntro ?? null, introT: e?.introT != null ? +(+e.introT).toFixed(2) : null, ent: e?.entranceDone ?? null, fade, clk: e ? String(JSON.stringify(e.clock ?? null)).slice(0, 60) : null, ent2: e?.entrance ? JSON.stringify(e.entrance).slice(0, 80) : null });
    await new Promise((r) => setTimeout(r, 100));
  }
  return out;
});
const first = samples.find((s) => s.run);
const show = samples.find((s) => s.fade != null && +s.fade > 0.9);
console.log(JSON.stringify({ firstRunAt: first?.t, hudShownAt: show?.t, errs: errs.length }));
for (const s of samples.filter((_, i) => i % 5 === 0)) console.log(JSON.stringify(s));
await b.close();
