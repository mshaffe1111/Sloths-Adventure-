import { chromium, devices } from 'playwright';
const stage = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['Pixel 7 landscape'] });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.addInitScript(() => { try { localStorage.setItem('sloth_howto_seen','1'); localStorage.setItem('sloth_lessons', JSON.stringify(['foe','nostomp','eagle','tough','gap','climb','swing','bounce','crumble','moving','water','fruit','heart','cage','idol','power','checkpoint','shrine'])); } catch {} });
await page.goto('http://127.0.0.1:4301/');
await page.waitForTimeout(3000);
await page.evaluate((s) => window.__play(s), stage);
await page.waitForTimeout(6000);
const E = '(typeof __engine==="function"?__engine():__engine)';
const beats = JSON.parse(await page.evaluate(`JSON.stringify(${E}.proto.beats)`));
console.log(stage, JSON.stringify(beats.map(b=>[Math.round(b[0]),b[2]])));
let i = 0;
for (const bt of beats) {
  const x = bt[0] + (bt[1]-bt[0]) * 0.3;
  await page.evaluate(`(()=>{const e=${E}; const p=e.player; const pl=e.platforms.filter(q=>q.x<${x}&&q.x+q.width>${x}&&!q.broken).sort((a,b)=>a.y-b.y); const g=pl.find(q=>q.y>=560)||pl[pl.length-1]; p.x=${x}; p.y=(g?g.y:580)-2; p.vx=0; p.vy=0; p.invincibleTimer=99; e.player.hp=e.player.maxHp;})()`);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${stage}-${i++}.png` });
}
console.log('errors', errs.slice(0,3));
await b.close();
