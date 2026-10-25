// node shot-enemy.mjs <stage> <enemyType> <n> [prefix]  -> burst screenshots with Pokey parked near the first enemy of that type
import { chromium } from 'playwright';
const out = (new URL('./', import.meta.url).pathname.replace(/\/$/, '') + '/eshots/');
const [stage, type, n, pre] = [process.argv[2], process.argv[3], +(process.argv[4] ?? 12), process.argv[5] ?? 'e'];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 });
p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off');
await p.waitForTimeout(2500);
await p.evaluate((s) => window.__play(s), stage);
await p.waitForTimeout(2500);
for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(400); } }
const info = await p.evaluate((t) => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  const en = e.enemies.filter((x) => x.type === t);
  if (!en.length) return 'none: ' + [...new Set(e.enemies.map((x) => x.type))].join(',');
  const a = en[0];
  e.player.x = a.x - 220; e.player.y = a.y - 40; e.player.vx = 0; e.player.vy = 0;
  return `${en.length} ${t} first at ${Math.round(a.x)},${Math.round(a.y)}`;
}, type);
console.log(info);
await p.waitForTimeout(800);
for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } }
for (let i = 0; i < n; i++) {
  const st = await p.evaluate((t) => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    e.player.health = 5; e.player.invulnerable = 2;
    const a = e.enemies.find((x) => x.type === t);
    return a ? `${a.state ?? ''} ${a.swoopPhase ?? ''} atk:${a.isAttacking ? 1 : 0}` : '';
  }, type);
  await p.screenshot({ path: out + `${pre}${String(i).padStart(2, '0')}.png` });
  console.log(i, st);
  await p.waitForTimeout(300);
}
await b.close();
