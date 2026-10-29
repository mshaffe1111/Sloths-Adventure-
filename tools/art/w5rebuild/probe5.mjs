// node tools/art/w5rebuild/probe5.mjs <port> <stage[@layout]> <x0> <x1>: the platforms (and World 5 extras) between x0 and x1
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, spec, x0, x1] = process.argv.slice(2);
const [stage, layout] = spec.split('@');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 } });
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(([i, l]) => window.__play(i, l === undefined ? undefined : +l), [stage, layout]);
await p.waitForTimeout(3000);
const out = await p.evaluate(([a, z]) => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  return e.platforms.filter((q) => q.x < z && q.x + q.width > a).map((q) => [q.id, Math.round(q.x), Math.round(q.y), Math.round(q.width), Math.round(q.height), q.type, q.style, q.art ?? '', q.soil ? 'soil' : ''].join(' '));
}, [+x0, +x1]);
console.log(out.join('\n'));
await b.close();
