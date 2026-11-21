// BUILD-23c: the HUD top strip upright (412 px wide, 2x, the top 150 css px) of a stage on a dev server: node strip23c.mjs <port> <stage> <out.jpg>
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [port, stage, out] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(3000);
await p.evaluate(([id, v]) => window.__play(id, v), [stage, 1]);
await p.waitForTimeout(4000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard === '1', null, { timeout: 10000 }).catch(() => {});
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2500);
await p.screenshot({ path: out, type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 412, height: 150 } });
await b.close();
