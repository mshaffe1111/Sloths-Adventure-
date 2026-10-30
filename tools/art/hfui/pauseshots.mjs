import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390], ['small', 360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await p.goto('http://127.0.0.1:8816/?lessons=off'); await p.waitForTimeout(5000);
  await p.evaluate(() => window.__play('1-2')); await p.waitForTimeout(5000); await p.keyboard.press('Escape'); await p.waitForTimeout(1500);
  await p.screenshot({ path: `/tmp/claude-0/kit3/pause-${tag}.png` });
  for (const t of ['Game', 'Trophies']) {
    await p.click(`.pm-tabs .st-tab[aria-label="${t}"]`); await p.waitForTimeout(300);
    await p.locator('.pm-tabs').scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
    await p.screenshot({ path: `/tmp/claude-0/kit3/pause-${tag}-${t}.png` });
  }
  const bad = await p.evaluate(() => [...document.querySelectorAll('.pm-card button')].filter((e) => { const q = e.getBoundingClientRect(); return q.width && (q.width < 44 || q.height < 44) && !e.closest('.pm-settings'); }).map((e) => (e.textContent || e.getAttribute('aria-label')).trim().slice(0, 12)));
  console.log(tag, JSON.stringify(bad));
  await p.close();
}
await b.close();
