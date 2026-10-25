import { chromium } from 'playwright';
const out = (new URL('./', import.meta.url).pathname.replace(/\/$/, '') + '/eshots/');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 });
p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off'); await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('1-2')); await p.waitForTimeout(2000);
await p.evaluate(() => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  const pl = e.player;
  e.enemies.push({ id: 4242, type: 'eagle', x: pl.x + 160, y: pl.y - 90, vx: 0, vy: 0, width: 58, height: 42, hp: 1, maxHp: 1, facing: -1, patrolMinX: pl.x + 60, patrolMaxX: pl.x + 300, attackCooldown: 5, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0 });
});
for (let i = 0; i < 6; i++) {
  await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.player.health = 5; e.player.invulnerable = 5; });
  await p.screenshot({ path: out + `eagle${i}.png` });
  await p.waitForTimeout(120);
}
await b.close();
