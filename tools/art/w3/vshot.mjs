// screenshots at the first thorn vine of 3-5 at chosen moments of its cycle, plus a few spots of 3-4 and 3-6
import { chromium, devices } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['Pixel 7 landscape'] });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.addInitScript(() => { try { localStorage.setItem('sloth_howto_seen', '1'); localStorage.setItem('sloth_lessons', JSON.stringify(['foe', 'nostomp', 'eagle', 'tough', 'gap', 'climb', 'swing', 'bounce', 'crumble', 'moving', 'water', 'fruit', 'heart', 'cage', 'idol', 'power', 'checkpoint', 'shrine'])); } catch {} });
await page.goto('http://127.0.0.1:4301/Sloths-Adventure-/');
await page.waitForTimeout(3000);
const E = 'const e = (typeof __engine==="function"?__engine():__engine);';
const shot = async (name) => { await page.evaluate(new Function(`${E} e.pause();`)); await page.waitForTimeout(120); await page.screenshot({ path: name }); await page.evaluate(new Function(`${E} e.resume();`)); };
const go = async (stage) => { await page.evaluate((s) => window.__play(s), stage); await page.waitForTimeout(800); await page.evaluate(new Function(`${E} e.callbacks.onGuide = () => {};`)); await page.waitForTimeout(4500); };
const put = (x, y) => page.evaluate(new Function('a', `${E} const p=e.player; p.x=a[0]; p.y=a[1]; p.vx=0; p.vy=0; p.hp=5;`), [x, y]);
// 3-5: stand beside the first vine, then catch it asleep, stirring, looking
await go('3-5');
const v = await page.evaluate(new Function(`${E} const v=e.proto.thorns[0]; return {x:v.x, s:v.sleep, st:v.stir, l:v.look, o:v.offset};`));
await put(v.x - 60, 580);
const T = v.s + v.st + v.l;
for (const [name, at] of [['v0.png', 1], ['v1.png', v.s + 0.6], ['v2.png', v.s + v.st + 0.4]]) {
  // wait until the vine's cycle is at `at`
  for (let k = 0; k < 200; k++) {
    const c = await page.evaluate(new Function('o', `${E} const T=o[0]; return ((e.gameTime + o[1]) % T + T) % T;`), [T, v.o]);
    if (Math.abs(c - at) < 0.12) break;
    await page.waitForTimeout(40);
  }
  await put(v.x - 60, 580);
  await shot(name);
}
// 3-6: the first fern patch
await go('3-6');
const f = await page.evaluate(new Function(`${E} const c=e.collectibles.find(c=>c.type==='relic'); return [c.x, c.y];`));
await put(f[0] - 80, 580);
await page.waitForTimeout(1500);
await shot('g0.png');
// 3-4: part way up the sinkhole
await go('3-4');
await page.waitForTimeout(300);
const cps = await page.evaluate(new Function(`${E} return e.currentStage.checkpoints.map(c=>[c.x,c.y]);`));
await put(cps[2][0], cps[2][1]);
await page.waitForTimeout(1200);
await shot('k0.png');
await b.close();
