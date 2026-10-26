// Screenshots of World 5's art preview (preview.html) in every light, upright, sideways and short, for Matt.
//   npx vite --port 4377 &   then   node tools/art/w5/shots.mjs <out dir> [port] [playwright module path]
import { mkdirSync } from 'node:fs';
const out = process.argv[2];
const port = process.argv[3] ?? '4377';
const { chromium } = await import(process.argv[4] ?? 'playwright');
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390], short: [640, 320] };
const SCENES = [
  ['gold-A', 'stage=5-1'], ['gold-B', 'stage=5-2'], ['dusk-A', 'stage=5-5'], ['dusk-B', 'stage=5-4'],
  ['twi-A', 'stage=5-7'], ['twi-B', 'stage=5-8'], ['arena-table', 'arena=table'], ['arena-webs', 'arena=webs'],
];
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  for (const [name, qs] of SCENES) {
    // upright shows about 440 units across: two shots along the stage, the tea table and the bank with the bridge
    const xs = qs.startsWith('arena') ? [0] : size === 'upright' ? [180, 1300] : [0, 1900];
    for (const x of xs) {
      await p.goto(`http://127.0.0.1:${port}/tools/art/w5/preview.html?${qs}&x=${x}`);
      await p.waitForFunction(() => window.__ready === true, null, { timeout: 30000 }).catch(() => console.log('not ready', name, size, x));
      await p.waitForTimeout(400);
      await p.screenshot({ path: `${out}/${name}-${size}${xs.length > 1 ? `-x${x}` : ''}.png` });
    }
  }
  // and the real game on a stage of each light (the generated stages until World 5's own are built): the kit as the engine paints it
  for (const id of ['5-1', '5-5', '5-8']) {
    await p.goto(`http://127.0.0.1:${port}/?seed=7`);
    await p.waitForTimeout(2500);
    await p.evaluate((id) => window.__play(id), id);
    await p.waitForTimeout(6000);
    await p.screenshot({ path: `${out}/game-${id}-${size}.png` });
  }
  await p.close();
}
await b.close();
