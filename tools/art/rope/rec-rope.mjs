// A short recording of Pokey crossing 1-3's shimmy rope in the real game (2026-10-29): grabbed at the left end, a moment still, creep
// right with the arrow key, stop, creep back left a little. Sideways phone, 844x390. Needs the dev server on <port>.
//   PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/art/rope/rec-rope.mjs <port> <out dir>   (writes a .webm there)
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4301', out = '.'] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, recordVideo: { dir: out, size: { width: 844, height: 390 } } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(3000);
await p.evaluate(() => window.__play('1-3'));
await p.waitForTimeout(7000);
await p.evaluate(() => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  const r = e.ropes[0];
  e.skills.add('shimmy');
  const x = r.x0 + 20;
  const t = (x - r.x0) / (r.x1 - r.x0);
  Object.assign(e.player, { x, y: r.y + 12 * 4 * t * (1 - t) + 86, vx: 0, vy: 0, grounded: false, hanging: true, facing: 1 });
  e.ropeId = r.id;
});
await p.waitForTimeout(1500);
await p.keyboard.down('ArrowRight');
await p.waitForTimeout(3000);
await p.keyboard.up('ArrowRight');
await p.waitForTimeout(2000);
await p.keyboard.down('ArrowLeft');
await p.waitForTimeout(1200);
await p.keyboard.up('ArrowLeft');
await p.waitForTimeout(1200);
await ctx.close();
await b.close();
