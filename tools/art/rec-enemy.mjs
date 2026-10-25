// node rec-enemy.mjs <stage> <type> <out.webm> [seconds] -> a video of Pokey standing near the first enemy of a type (awake), then punching it
import { chromium } from 'playwright';
import fs from 'node:fs';
const [stage, type, outFile, secs] = [process.argv[2], process.argv[3], process.argv[4], +(process.argv[5] ?? 8)];
const dir = (new URL('./', import.meta.url).pathname.replace(/\/$/, '') + '/eshots/vid/');
fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch();
const ctxt = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, recordVideo: { dir, size: { width: 1688, height: 780 } } });
const p = await ctxt.newPage();
await p.goto('http://127.0.0.1:4301/?nodemo=1');
await p.waitForTimeout(2500);
await p.evaluate((s) => window.__play(s), stage);
await p.waitForTimeout(2000);
const gotIt = async () => { for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(200); } else break; } };
await gotIt();
const setup = (t) => p.evaluate((t) => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  const a = e.enemies.find((x) => x.type === t && !x.defeated);
  if (a.state === 'sleep') { a.state = 'patrol'; a.asleep = false; a.wakeT = 1.1; }
  e.player.x = a.x - 110; e.player.y = a.y - 40; e.player.vx = 0; e.player.vy = 0; e.player.health = 5; e.player.invulnerable = 30;
}, t);
await setup(type);
await p.waitForTimeout(400);
await gotIt();
await setup(type);
const t0 = Date.now();
while (Date.now() - t0 < secs * 1000) {
  await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.player.health = 5; e.player.invulnerable = 30; });
  await gotIt();
  await p.waitForTimeout(250);
}
// walk in and punch it
await p.keyboard.down('ArrowRight'); await p.waitForTimeout(350); await p.keyboard.up('ArrowRight');
for (let i = 0; i < 8; i++) { await p.keyboard.press('j'); await p.waitForTimeout(260); }
await p.waitForTimeout(1500);
const v = p.video();
await ctxt.close();
fs.renameSync(await v.path(), outFile);
await b.close();
console.log('saved', outFile);
