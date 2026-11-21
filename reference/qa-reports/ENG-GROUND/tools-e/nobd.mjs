const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 })).newPage();
await p.goto('http://127.0.0.1:5291/?lessons=off'); await p.waitForTimeout(3000);
await p.evaluate(() => window.__play('2-97', 1)); await p.waitForTimeout(6000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(3000);
for (const skip of [false, true]) {
  await p.evaluate(([E, skip]) => {
    const e = eval(E); e.isPaused = true;
    const x = 19900; const under = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width && !q.soil).sort((a, c) => c.y - a.y)[0];
    Object.assign(e.player, { x, y: under ? under.y : 1500, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: -1, invincibleTimer: 9 });
    for (let i = 0; i < 90; i++) { e.player.vx = 0; e.update(1 / 30); }
    const P = CanvasRenderingContext2D.prototype; P.__o = P.__o ?? P.drawImage;
    P.drawImage = skip ? function (...a) { if (new Error().stack.includes('scenery.ts')) return; return P.__o.apply(this, a); } : P.__o;
    e.render();
  }, [E, skip]);
  await p.screenshot({ path: `${process.argv[2]}/corner-${skip ? 'nobackdrop' : 'normal'}.png`, clip: { x: 280, y: 575, width: 132, height: 340 } });
}
await b.close();
