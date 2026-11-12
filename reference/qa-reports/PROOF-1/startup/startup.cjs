// PROOF-1 item 1: is the split a start-up regression? Cold start (fresh context, no service worker, no HTTP cache), CPU x4, phone
// viewport, head vs 0.9.6 alternating; time to the title's Play button visible, and to a stage's canvas on ?autostart=1&level=1-1.
// node startup.cjs [runs]   (head on :8801, main on :8802, both the deploy build at /Sloths-Adventure-/)
const { chromium } = require('playwright');
const N = Number(process.argv[2] || 4);
(async () => {
  const browser = await chromium.launch();
  const res = { head: { title: [], stage: [], errors: 0, bytes: [] }, main: { title: [], stage: [], errors: 0, bytes: [] } };
  for (let i = 0; i < N; i++) for (const [name, port] of [['head', 8801], ['main', 8802]]) {
    for (const what of ['title', 'stage']) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      let bytes = 0;
      page.on('response', async (r) => { try { const b = await r.body(); bytes += b.length; } catch {} });
      page.on('pageerror', () => res[name].errors++);
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      const t0 = Date.now();
      if (what === 'title') {
        await page.goto(`http://127.0.0.1:${port}/Sloths-Adventure-/?lessons=off`);
        await page.locator('.ttl-play').waitFor({ state: 'visible', timeout: 60000 });
      } else {
        await page.goto(`http://127.0.0.1:${port}/Sloths-Adventure-/?lessons=off&autostart=1&level=1-1`);
        await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 60000 });
        await page.waitForFunction(() => { const c = document.querySelector('canvas'); return c && c.width > 0; }, null, { timeout: 60000 });
      }
      res[name][what].push(Date.now() - t0);
      if (what === 'title') res[name].bytes.push(bytes);
      await ctx.close();
    }
  }
  await browser.close();
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  for (const n of ['head', 'main']) console.log(`${n}: title ms ${res[n].title.join(',')} (median ${med(res[n].title)}); stage-1-1 canvas ms ${res[n].stage.join(',')} (median ${med(res[n].stage)}); bytes to title ${res[n].bytes[0]}; page errors ${res[n].errors}`);
})().catch((e) => { console.error(e); process.exit(2); });
