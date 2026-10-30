// node frozen.mjs <port> <outPng> <stage> <setupJs> [frames]: stops the loop, runs setupJs on engine e, renders `frames` frames by hand
// (game clock +1/30 each) counting canvas calls per frame by file:line, then screenshots the last frame (landscape 844x390 @2x)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, stage, setup, nf = '30'] = process.argv.slice(2);
const init = fs.readFileSync(new URL('./count.mjs', import.meta.url), 'utf8').match(/const init = \(\) => \{[\s\S]*?\n\};/)[0];
const b = await chromium.launch();
const p = await b.newPage({ viewport: process.env.VIEW === 'up' ? { width: 390, height: 844 } : { width: 844, height: 390 }, deviceScaleFactor: 2 });
p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
await p.addInitScript(`(${init.replace('const init = ', '').replace(/;$/, '')})()`);
await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
await p.waitForFunction(() => typeof window.__play === 'function');
await p.waitForTimeout(1500);
await p.evaluate((s) => window.__play(s), stage);
await p.waitForTimeout(3000);
for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click().catch(() => {}); await p.waitForTimeout(300); } else break; }
await p.waitForTimeout(1500);
const r = await p.evaluate(async ([setup, nf]) => {
  const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
  e.stop();
  e.gameTime = 12.34;
  new Function('e', setup)(e);
  for (let i = 0; i < 5; i++) { e.render(); await new Promise((r) => setTimeout(r, 50)); }
  window.__c = {}; window.__on = true;
  for (let i = 0; i < nf; i++) { e.gameTime += 1 / 30; new Function('e', setup)(e); e.render(); }
  window.__on = false;
  e.gameTime = 12.34; new Function('e', setup)(e); e.render();
  return window.__c;
}, [setup, Number(nf)]);
for (const [k, v] of Object.entries(r).sort((a, b) => b[1] - a[1]).slice(0, Number(process.env.TOP || 30))) console.log(String(+(v / Number(nf)).toFixed(2)).padStart(8), k);
await p.locator('canvas').first().screenshot({ path: out });
await b.close();
