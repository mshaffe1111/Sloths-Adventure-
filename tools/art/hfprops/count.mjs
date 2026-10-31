// hf-props: how many dressing pieces each stage gets, and which (node tools/art/hfprops/count.mjs <port> <stage...>)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, ...stages] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 } });
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 60000 });
for (const s of stages) {
  await p.evaluate((id) => window.__play(id), s);
  await p.waitForTimeout(6000);
  const r = await p.evaluate(() => {
    const e = window.__engine();
    const d = e.proto?.dress ?? e.currentStage.dress ?? [];
    const c = {};
    for (const x of d) c[x.n] = (c[x.n] ?? 0) + 1;
    const end = Math.max(...e.platforms.map((q) => q.x + q.width));
    const banks = e.platforms.filter((q) => q.type === 'solid' && q.height >= 90 && !q.art && !q.push).length;
    return { n: d.length, end: Math.round(end), banks, c };
  });
  console.log(s, JSON.stringify(r));
}
await b.close();
