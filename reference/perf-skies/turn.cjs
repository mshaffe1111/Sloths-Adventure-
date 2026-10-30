const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 400, height: 880 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto('http://localhost:4305/?seed=7');
  await page.waitForFunction(() => typeof window.__play === 'function');
  await page.evaluate(() => window.__play('2-2'));
  await page.waitForTimeout(5000);
  await page.evaluate(() => {
    window.__fitLog = [];
    let made = [];
    const orig = document.createElement.bind(document);
    document.createElement = (t, ...a) => { const c = orig(t, ...a); if (t === 'canvas') made.push(c); return c; };
    const tick = () => { window.__fitLog.push(made.map((c) => c.width + 'x' + c.height).filter((w) => parseInt(w) >= 1000).join(' ') || '-'); made = []; if (window.__fitLog.length < 40) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 880, height: 400, deviceScaleFactor: 2, mobile: false });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${out}/turn-early.png` });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/turn-late.png` });
  console.log('canvases made per frame after the turn:', JSON.stringify(await page.evaluate(() => window.__fitLog)));
  await browser.close();
})();
