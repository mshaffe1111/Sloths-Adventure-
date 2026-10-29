// node introshots.mjs <url> <outdir> <tag> <level>: shots in the first seconds of a stage, both ways up
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [url, out, tag, id] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [vn, vp] of [['up', { width: 390, height: 844 }], ['side', { width: 844, height: 390 }]]) {
  const p = await b.newPage({ viewport: vp });
  await p.goto(url);
  await p.waitForTimeout(2500);
  await p.evaluate((i) => window.__play(i), id);
  for (const ms of [600, 1200, 2000, 3000, 4500]) {
    await p.waitForTimeout(ms === 600 ? 600 : ms - [600, 1200, 2000, 3000, 4500][[600, 1200, 2000, 3000, 4500].indexOf(ms) - 1]);
    await p.screenshot({ path: `${out}/${tag}-${id}-${vn}-${ms}.jpg`, quality: 85 });
  }
  await p.close();
}
await b.close();
