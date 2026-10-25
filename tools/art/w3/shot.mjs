// node shot.mjs <stage> <tag> <spec,...>   spec = x[:waitMs]  (x <= 1 is a share of the stage width; "dN" = the Nth dark zone's start)
import { chromium, devices } from 'playwright';
const stage = process.argv[2] || '3-1', tag = process.argv[3] || 's';
const specs = (process.argv[4] || '0.1').split(',').filter(Boolean);
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['Pixel 7 landscape'] });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.addInitScript(() => { try { localStorage.setItem('sloth_howto_seen', '1'); localStorage.setItem('sloth_lessons', JSON.stringify(['foe', 'nostomp', 'eagle', 'tough', 'gap', 'climb', 'swing', 'bounce', 'crumble', 'moving', 'water', 'fruit', 'heart', 'cage', 'idol', 'power', 'checkpoint', 'shrine'])); } catch {} });
await page.goto('http://127.0.0.1:4301/Sloths-Adventure-/');
await page.waitForTimeout(3000);
await page.evaluate((s) => window.__play(s), stage);
await page.waitForTimeout(2500);
const E = 'const e = (typeof __engine==="function"?__engine():__engine);';
const info = await page.evaluate(new Function(`${E} return { w: e.currentStage.config.levelWidth, zones: (e.currentStage.zones||[]).map(z=>[z.kind,Math.round(z.x0),Math.round(z.x1)]), beats: (e.proto?.beats||[]).map(b=>[Math.round(b[0]),b[2]]) };`));
console.log(JSON.stringify(info));
const darks = info.zones.filter((z) => z[0] === 'dark');
let i = 0;
for (const sp of specs) {
  const [xs, wait] = sp.split(':');
  const x = xs.startsWith('d') ? darks[+xs.slice(1)][1] + 260 : +xs <= 1 ? +xs * info.w : +xs;
  await page.evaluate(new Function('x', `${E} const p = e.player; const pl = e.platforms.filter(q => q.x <= x && q.x + q.width >= x && q.type==='solid').sort((a,b)=>a.y-b.y)[0]; p.x = x; p.y = pl ? pl.y : 580; p.vy = 0; p.vx = 0; p.hp = 5;`), x);
  await page.waitForTimeout(+(wait || 700));
  await page.evaluate(new Function(`${E} e.pause();`));
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${tag}${i++}.png` });
  await page.evaluate(new Function(`${E} e.resume();`));
}
await b.close();
