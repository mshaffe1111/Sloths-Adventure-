// polish-a1 VI-3: a stage started while its backdrop strips are slow to arrive (each delayed `delay` ms): frames about every 250 ms from the
// moment play is asked for, upright and sideways, as one contact sheet per orientation.
// node tools/art/shot-popin-a1.mjs <port> <outPrefix> <stage> <delay ms>
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, stage, delay = '1800'] = process.argv.slice(2);
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  // (from here on, every backdrop strip takes `delay` ms to come)
  await p.route(/assets\/backdrops\/w\d+[a-z0-9]*-(far|mid|near)\.webp/, async (r) => { await new Promise((s) => setTimeout(s, +delay)); await r.continue(); });
  const t0 = Date.now();
  await p.evaluate((id) => window.__play(id), stage);
  const times = [];
  for (let i = 0; i < 12; i++) {
    await p.waitForTimeout(150);
    times.push(Date.now() - t0);
    await p.screenshot({ path: `${out}-${tag}-${i}.jpg`, type: 'jpeg', quality: 60 });
  }
  console.log(tag, JSON.stringify(times));
  await ctx.close();
}
await b.close();
