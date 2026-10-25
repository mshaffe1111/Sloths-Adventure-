import { chromium, devices } from 'playwright';
const mode = process.argv[2] || 'look';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['Pixel 7 landscape'] });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('ERR', e.message));
await page.addInitScript(() => { try { localStorage.setItem('sloth_howto_seen','1'); localStorage.setItem('sloth_lessons', JSON.stringify(['foe','nostomp','eagle','tough','gap','climb','swing','bounce','crumble','moving','water','fruit','heart','cage','idol','power','checkpoint','shrine'])); } catch {} });
await page.goto('http://127.0.0.1:4301/');
await page.waitForTimeout(3000);
await page.evaluate(() => window.__play('3-8'));
await page.waitForTimeout(6000);
const E = '(typeof __engine==="function"?__engine():__engine)';
const info = JSON.parse(await page.evaluate(`JSON.stringify((()=>{const e=${E}; const ls=e.vines.filter(v=>v.isSwingingVine).sort((a,b)=>a.x-b.x); const A=ls[0], B=ls[1]; const t=e.proto.thorns.find(t=>t.x>A.x&&t.x<B.x); return {A:{x:A.x,top:A.topY}, B:{x:B.x}, t}})())`));
console.log(JSON.stringify(info));
await page.evaluate(`(()=>{const e=${E}; const p=e.player; p.x=${info.A.x}-20; p.y=${info.A.top}+300; p.vx=200; p.vy=-100; p.grounded=false;})()`);
await page.waitForTimeout(1500);
const phase = `(()=>{const e=${E}; const v=e.proto.thorns.find(t=>t.x===${info.t.x}); const T=v.sleep+v.stir+v.look; const c=(((e.gameTime+v.offset)%T)+T)%T; return c<v.sleep?'sleep:'+(c/v.sleep).toFixed(2):c<v.sleep+v.stir?'stir':'look'})()`;
// hang on through a whole cycle: never hurt
const hp0 = await page.evaluate(`${E}.player.hp`);
let looked = false;
for (let i = 0; i < 40; i++) { await page.waitForTimeout(200); const ph = await page.evaluate(phase); if (ph==='look') { looked = true; if (i%3===0) await page.screenshot({ path: 'thorn-look.png' }); } }
const hp1 = await page.evaluate(`${E}.player.hp`);
console.log('hanging through a cycle: looked', looked, 'hp', hp0, '->', hp1, 'swinging', await page.evaluate(`${E}.player.isVineSwinging`));
// now leap: in the sweet spot while it looks (or while asleep)
await page.evaluate(`new Promise(res=>{const e=${E}; const f=()=>{const p=e.player; const v=e.proto.thorns.find(t=>t.x===${info.t.x}); const T=v.sleep+v.stir+v.look; const c=(((e.gameTime+v.offset)%T)+T)%T; const ph=c<v.sleep?(c<v.sleep*0.4?'sleep':'late'):c<v.sleep+v.stir?'stir':'look'; const sweet=p.swingAngularVelocity>0.5&&p.swingAngle>0.05&&p.swingAngle<0.4; if(sweet && ph==='${mode}') res(); else requestAnimationFrame(f)}; f();})`);
await page.keyboard.down('Space'); await page.waitForTimeout(80); await page.keyboard.up('Space');
for (let i=0;i<12;i++){ await page.waitForTimeout(50); console.log(await page.evaluate(`(()=>{const e=${E}; const p=e.player; const v=e.proto.thorns.find(t=>t.x===${info.t.x}); return [Math.round(p.x),Math.round(p.y),p.isVineSwinging,p.swingVineId,${phase},e.vineLash.size,p.hp, Math.abs(p.x-v.x)<v.reach && p.y>v.bud && p.y<v.bud+(v.below??140)].join(' ')})()`)); }
await page.screenshot({ path: `thorn-leap-${mode}.png` });
await page.waitForTimeout(900);
console.log('leap while', mode, '-> hp', await page.evaluate(`${E}.player.hp`), 'swinging', await page.evaluate(`${E}.player.isVineSwinging`), 'x', Math.round(await page.evaluate(`${E}.player.x`)));
await b.close();
