// node shot-gold.mjs <stage> <type> -> screenshots of the first enemy of a type forced through poses (eshots/pose-<name>.png)
import { chromium } from 'playwright';
const out = (new URL('./', import.meta.url).pathname.replace(/\/$/, '') + '/eshots/');
const [stage, type] = [process.argv[2], process.argv[3]];
const poses = JSON.parse(process.argv[4] ?? 'null') ?? [
  ['sleep', { state: 'sleep', asleep: true }],
  ['wake', { state: 'patrol', asleep: false, wakeT: 0.6 }],
  ['prowl', { state: 'patrol', wakeT: 0 }],
  ['rear', { state: 'rear', stateT: 0 }],
  ['dazed', { state: 'patrol', stagger: 1.5 }],
  ['hurt', { stagger: 0, recoil: 0.8 }],
  ['defeat', { defeated: true }],
];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 });
p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off');
await p.waitForTimeout(2500);
await p.evaluate((s) => window.__play(s), stage);
await p.waitForTimeout(2500);
const gotIt = async () => { for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } else break; } };
await gotIt();
const park = (t) => p.evaluate((t) => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  const a = e.enemies.find((x) => x.type === t);
  e.player.x = a.x - 150; e.player.y = a.y - 40; e.player.vx = 0; e.player.vy = 0; e.player.health = 5; e.player.invulnerable = 5;
}, t);
await park(type);
await p.waitForTimeout(900);
await gotIt();
for (const [name, set] of poses) {
  await park(type);
  await p.evaluate(([t, s]) => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    const a = e.enemies.find((x) => x.type === t);
    Object.assign(a, s);
  }, [type, set]);
  await p.waitForTimeout(name === 'defeat' ? 900 : 250);
  await gotIt();
  await p.screenshot({ path: out + `pose-${name}.png`, clip: { x: 200, y: 60, width: 640, height: 300 } });
  if (name.startsWith('r')) for (let i = 1; i < 8; i++) await p.screenshot({ path: out + `pose-${name}-${i}.png`, clip: { x: 300, y: 140, width: 360, height: 200 } });
  console.log(name);
}
await b.close();
