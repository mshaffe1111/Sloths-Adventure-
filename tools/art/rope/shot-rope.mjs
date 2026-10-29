// Screenshots of 1-3's shimmy rope with Pokey on it (2026-10-29), upright 390x844 and sideways 844x390: hanging still, and creeping
// right (the arrow key held). Needs the dev server: npx vite --port=4301 --host=127.0.0.1 --strictPort (the old build on another port
// for a "before" shot).   node tools/art/rope/shot-rope.mjs <port> <tag> <out dir> [stage id]
// (PW: where playwright is, when it is not installed in the project, e.g. PW=/opt/node-tools/node_modules/playwright/index.mjs)
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4301', tag = 'after', out = '.', stage = '1-3'] = process.argv.slice(2);
const b = await chromium.launch();
for (const [w, h, shape] of [[390, 844, 'upright'], [844, 390, 'sideways']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  await p.evaluate((id) => window.__play(id), stage);
  // (long enough for the stage's title card to have gone)
  await p.waitForTimeout(7000);
  const info = await p.evaluate(() => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    const r = e.ropes?.[0];
    if (!r) return 'no rope';
    e.skills.add('shimmy');
    const x = r.x0 + Math.min(150, (r.x1 - r.x0) * 0.3);
    const t = (x - r.x0) / (r.x1 - r.x0);
    e.player.x = x;
    e.player.y = r.y + 12 * 4 * t * (1 - t) + 86;
    e.player.vx = 0; e.player.vy = 0;
    e.player.grounded = false;
    e.player.hanging = true;
    e.ropeId = r.id;
    e.player.facing = 1;
    return JSON.stringify(r);
  });
  console.log(shape, info);
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `${out}/rope-${tag}-${shape}-still.png` });
  await p.keyboard.down('ArrowRight');
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/rope-${tag}-${shape}-moving.png` });
  await p.keyboard.up('ArrowRight');
  await p.close();
}
await b.close();
