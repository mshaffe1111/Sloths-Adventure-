// HUD-VINE: the HUD's top band of a stage, upright (412x915) and sideways (915x412), at 2x, on a dev server:
//   node stillsHud.mjs <port> <outDir> <tag> <stage>[,<stage>...]
// writes <outDir>/<tag>-<stage>-<up|side>.png (the top 150 css px) and <tag>-<stage>-<up|side>-plate.png (the goal plate, cropped)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [port, outDir, tag, stages] = process.argv.slice(2);
const b = await chromium.launch();
for (const stage of stages.split(',')) {
  for (const [mode, w, h] of [['up', 412, 915], ['side', 915, 412]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true })).newPage();
    p.on('pageerror', (e) => console.log('ERR', stage, mode, e.message));
    await p.goto(`http://localhost:${port}/?lessons=off`);
    await p.waitForTimeout(3000);
    await p.evaluate(([id, v]) => window.__play(id, v), [stage, 1]);
    await p.waitForTimeout(4000);
    await p.waitForFunction(() => document.documentElement.dataset.hudCard === '1', null, { timeout: 10000 }).catch(() => {});
    await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${outDir}/${tag}-${stage}-${mode}.png`, clip: { x: 0, y: 0, width: w, height: 150 } });
    const box = await p.locator('.vh-goal').first().boundingBox().catch(() => null);
    if (box) {
      const x = Math.max(0, box.x - 30), y = Math.max(0, box.y - 20);
      await p.screenshot({ path: `${outDir}/${tag}-${stage}-${mode}-plate.png`, clip: { x, y, width: Math.min(w - x, box.width + 60), height: box.height + 30 } });
      console.log(stage, mode, 'plate', JSON.stringify(box));
    } else console.log(stage, mode, 'no .vh-goal');
    await p.context().close();
  }
}
await b.close();
