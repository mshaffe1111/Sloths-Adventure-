import { chromium, devices } from 'playwright';
const b = await chromium.launch();
const page = await (await b.newContext({ ...devices['Pixel 7 landscape'] })).newPage();
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.addInitScript(() => { try { localStorage.setItem('sloth_howto_seen', '1'); } catch {} });
await page.goto('http://127.0.0.1:4301/Sloths-Adventure-/');
await page.waitForTimeout(3000);
await page.evaluate(() => window.__play('3-1'));
await page.waitForTimeout(2500);
const E = 'const e = (typeof __engine==="function"?__engine():__engine);';
await page.evaluate(new Function(`${E} const z=e.currentStage.zones.find(z=>z.kind==='dark'); const p=e.player; p.x=z.x0+260; p.y=580; p.vx=0; p.vy=0;`));
for (let i = 0; i < 4; i++) {
  await page.waitForTimeout(800);
  console.log(await page.evaluate(new Function(`${E} const z=e.currentStage.zones.find(z=>z.kind==='dark'); return JSON.stringify({t:e.gameTime.toFixed(2), still:e.glowStill.toFixed(2), wake:[...e.glowWake.entries()], lights:z.lights.map(l=>[l.x,l.y,l.id]), px:Math.round(e.player.x), g:e.player.grounded, vx:e.player.vx, cam:[Math.round(e.camera.x),Math.round(e.camera.y)], dark:e.darkShow.toFixed(2)});`)));
}
await b.close();
