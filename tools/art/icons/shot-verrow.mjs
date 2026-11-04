// The version pair (Check for updates, Refresh game) on narrow phones: one row, nothing clipped.  node shot-verrow.mjs <out> [port]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { requireLiveBase, stampBase, writeBase } from './base.mjs';
const out = process.argv[2]; const port = process.argv[3] || 4301;
const BASE = requireLiveBase(); writeBase(out, BASE);
const b = await chromium.launch();
for (const [w, h] of [[360, 640], [390, 844], [412, 915]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(7000);
  const r = await p.evaluate(() => [...document.querySelectorAll('.ttl-ver-row .ttl-ver-b')].filter((e) => e.offsetParent).map((e) => { const q = e.getBoundingClientRect(); return [Math.round(q.x), Math.round(q.y), Math.round(q.right), Math.round(q.width)]; }));
  console.log(w, JSON.stringify(r), r.length === 2 && r[0][1] === r[1][1] ? 'ONE ROW' : 'WRAPS', r.every((q) => q[0] >= 0 && q[2] <= w) ? 'inside' : 'CLIPPED');
  await stampBase(p, BASE); await p.screenshot({ path: `${out}/verrow-${w}.png` });
  await p.close();
}
await b.close();
