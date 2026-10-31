// Before/after stills of a bank join in several worlds (the shared bank-band fade, protoArt drawBankArt): the start of each stage, sideways.
//   node tools/art/w9/seamshots.mjs <out dir> [port]
import { mkdirSync } from 'node:fs';
const out = process.argv[2];
const port = process.argv[3] ?? '4399';
const pw = await import(process.env.PW ?? 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;
mkdirSync(out, { recursive: true });
const STAGES = (process.env.STAGES ?? '2-1,3-1,4-2,6-2,7-1,8-1,9-1,10-1').split(',');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true });
const p = await ctx.newPage();
for (const id of STAGES) {
  await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate((id) => window.__play(id, 1), id);
  await p.waitForTimeout(6000);
  await p.screenshot({ path: `${out}/${id}.png` });
}
await b.close();
