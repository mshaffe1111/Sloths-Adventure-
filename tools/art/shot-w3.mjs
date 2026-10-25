import { chromium } from 'playwright';
const out = (new URL('./', import.meta.url).pathname.replace(/\/$/, '') + '/');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:4301/');
await p.waitForTimeout(2500);
for (const [id, dx, name] of [['3-9', 0, 'ring'], ['3-4', 0, 'sink']]) {
  await p.evaluate((id) => window.__play(id), id);
  await p.waitForTimeout(3000);
  const info = await p.evaluate((id) => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    if (id === '3-9') { const r = e.stage?.proto?.ring ?? e.ring; const x = r?.x0 ?? r?.left; if (x != null) { e.player.x = x + 300; e.player.y -= 0; } return JSON.stringify(Object.keys(r ?? {})); }
    return '';
  }, id);
  console.log(id, info);
  await p.waitForTimeout(2500);
  await p.screenshot({ path: out + `w3-${name}.png` });
}
await b.close();
