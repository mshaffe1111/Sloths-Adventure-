// node entranceshots.mjs <url> <outdir> <tag> <level> <u,u,...> [views up,side]: a boss's entrance shot at fractions of it (read from
// the engine's own entrance clock, so a slow load never shifts the beat), both ways up
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [url, out, tag, id, us = '0.45,0.58,0.66,0.8', views = 'up,side'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const VP = { up: { width: 390, height: 844 }, side: { width: 844, height: 390 } };
const b = await chromium.launch();
for (const vn of views.split(',')) {
  const p = await b.newPage({ viewport: VP[vn] });
  await p.goto(url);
  await p.waitForTimeout(2500);
  await p.evaluate((i) => window.__play(i), id);
  for (const u of us.split(',').map(Number)) {
    const ok = await p.waitForFunction((want) => {
      let e = window.__engine; if (typeof e === 'function') e = e();
      const en = e?.entrance;
      return !!en && en.t / en.total >= want;
    }, u, { timeout: 20000, polling: 'raf' }).then(() => true, () => false);
    await p.screenshot({ path: `${out}/${tag}-${id}-${vn}-u${String(u).replace('.', '')}.jpg`, quality: 85 });
    console.log(id, vn, u, ok);
  }
  await p.close();
}
await b.close();
