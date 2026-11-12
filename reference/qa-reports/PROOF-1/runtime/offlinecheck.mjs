// (d) the code split offline: load the shipped build once online (the service worker precaches), then offline: a stage of every world.
// Counts every failed request and page error while offline; a still of each stage.
import { chromium, newPage, seedDone, IDS, toMap, playFromMap, sleep, HEAD, MAIN, here } from './rtlib.mjs';
const which = process.argv[2] ?? 'head';
const url = which === 'main' ? MAIN : HEAD;
const browser = await chromium.launch();
const { ctx, page, errors, failed } = await newPage(browser, { ctx: { serviceWorkers: 'allow' } });
await page.goto(url);
await page.evaluate(seedDone, IDS);
await page.reload();
// wait for the worker to take control and the precache to fill
const sw = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.ready;
  for (let i = 0; i < 240; i++) {
    const keys = await caches.keys();
    let n = 0;
    for (const k of keys) n += (await (await caches.open(k)).keys()).length;
    if (n >= 1030 && navigator.serviceWorker.controller) return { active: !!reg.active, caches: keys, entries: n };
    await new Promise((r) => setTimeout(r, 500));
  }
  return { active: !!reg.active, entries: -1, controller: !!navigator.serviceWorker.controller };
});
console.log(which, 'service worker', JSON.stringify(sw));
await ctx.setOffline(true);
errors.length = 0; failed.length = 0;
const rows = [];
for (let w = 1; w <= 10; w++) {
  const id = `${w}-${w === 1 ? 1 : 3}`;
  const fBefore = failed.length, eBefore = errors.length;
  await page.goto(url);
  await toMap(page);
  const ok = await playFromMap(page, id);
  await sleep(2500);
  const st = await page.evaluate(() => { const e = window.__probeEngine(); return e ? { run: e.isRunning, t: +e.gameTime.toFixed(2), plats: e.platforms?.length } : null; });
  await page.screenshot({ path: `${here}/shots/offline-${which}-${id}.png` });
  rows.push(`${id}: engine ${ok ? 'running' : 'NOT RUNNING'} ${JSON.stringify(st)}; failed requests ${failed.length - fBefore} ${failed.slice(fBefore, fBefore + 3).join(' | ')}; page errors ${errors.length - eBefore} ${errors.slice(eBefore, eBefore + 2).join(' | ')}`);
  console.log(rows[rows.length - 1]);
}
console.log(`${which} offline total: failed requests ${failed.length}, page errors ${errors.length}`);
await browser.close();
