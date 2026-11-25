// BUILD-27g: platforms and rivers of listed 2-7 (layout 0) between X0 and X1 for DIFF, dev server PORT
const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const [port, diff, x0, x1] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await b.newContext();
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage(); await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('2-7', 0)); await p.waitForTimeout(4000);
console.log(await p.evaluate(([a, z]) => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
  return e.platforms.filter((q) => q.x < z && q.x + q.width > a).map((q) => `${q.type}/${q.style ?? ''}${q.soil ? '/soil' : ''}${q.decorative ? '/deco' : ''} x${Math.round(q.x)}-${Math.round(q.x + q.width)} y${Math.round(q.y)} h${Math.round(q.height ?? 0)}`).join('\n'); }, [+x0, +x1]));
await b.close();
