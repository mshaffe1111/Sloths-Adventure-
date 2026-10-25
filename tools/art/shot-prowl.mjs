import { chromium } from 'playwright';
const out = (new URL('./', import.meta.url).pathname.replace(/\/$/, '') + '/pshots/');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
await p.goto('http://127.0.0.1:4301/' + (process.argv[2] ?? ''));
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('3-10'));
await p.waitForTimeout(6000);
for (let i = 0; i < 28; i++) {
  const s = await p.evaluate(() => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    e.player.health = 5; const bb = e.boss ?? e.bosses?.[0]; if (bb && bb.hp > bb.maxHp * 0.62) { bb.hp = Math.round(bb.maxHp * 0.6); }
    const bo = e.boss ?? e.bosses?.[0];
    const br = bo?.ai;
    return br ? `${br.state} ${br.move ?? ''} ${br.t.toFixed(2)} ph${bo.phase}` : 'none ' + Object.keys(e).filter((k) => /boss/i.test(k)).join(',');
  });
  await p.screenshot({ path: out + `p${String(i).padStart(2, '0')}.png` });
  console.log(i, s);
  await p.waitForTimeout(350);
}
await b.close();
