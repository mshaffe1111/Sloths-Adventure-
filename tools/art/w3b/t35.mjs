import { chromium, devices } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['Pixel 7 landscape'] });
const page = await ctx.newPage();
await page.addInitScript(() => { try { localStorage.setItem('sloth_howto_seen','1'); localStorage.setItem('sloth_lessons', JSON.stringify(['foe','nostomp','eagle','tough','gap','climb','swing','bounce','crumble','moving','water','fruit','heart','cage','idol','power','checkpoint','shrine'])); } catch {} });
await page.goto('http://127.0.0.1:4301/');
await page.waitForTimeout(3000);
await page.evaluate(() => window.__play('3-5'));
await page.waitForTimeout(8000);
const E = '(typeof __engine==="function"?__engine():__engine)';
const v = JSON.parse(await page.evaluate(`JSON.stringify(${E}.proto.thorns.sort((a,b)=>a.x-b.x)[2])`));
await page.evaluate(`(()=>{const e=${E}; const p=e.player; p.x=${v.x}-220; p.y=580; p.vx=0; p.invincibleTimer=99;})()`);
for (const want of ['sleep','stir','look']) {
  await page.evaluate(`new Promise(res=>{const e=${E}; const f=()=>{const v=e.proto.thorns.find(t=>t.x===${v.x}); const T=v.sleep+v.stir+v.look; const c=(((e.gameTime+v.offset)%T)+T)%T; const ph=c<v.sleep?'sleep':c<v.sleep+v.stir?'stir':'look'; if(ph==='${want}' && (ph!=='sleep' || c>2)) res(); else requestAnimationFrame(f)}; f();})`);
  await page.waitForTimeout(want==='stir'?500:200);
  await page.screenshot({ path: `t35-${want}.png` });
}
await b.close();
