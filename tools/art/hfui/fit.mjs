import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const css = fs.readFileSync(process.argv[2], 'utf8');
const b = await chromium.launch();
for (const [w, h] of [[390, 844], [360, 640], [320, 568], [844, 390], [640, 360], [673, 841]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await p.goto('http://127.0.0.1:8815/?lessons=off'); await p.waitForTimeout(6000);
  await p.addStyleTag({ content: css }); await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const bad = [];
    for (const e of document.querySelectorAll('.gx2-ui button')) {
      const r = e.getBoundingClientRect(); if (!r.width) continue;
      const lbl = (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 14);
      if (r.left < 15.5 || r.right > innerWidth - 15.5 || r.top < 0 || r.bottom > innerHeight) bad.push(['out', lbl, Math.round(r.left), Math.round(r.right), Math.round(r.bottom)]);
      if ((r.height < 47.5 || r.width < 47.5) && !e.classList.contains('title-credit-btn')) bad.push(['small', lbl, Math.round(r.width), Math.round(r.height)]);
      if (e.scrollWidth > e.clientWidth + 1) bad.push(['clipped', lbl]);
    }
    const c = document.querySelector('.gx2-credit').getBoundingClientRect();
    if (c.bottom > innerHeight || c.right > innerWidth) bad.push(['credit out', Math.round(c.bottom)]);
    return [document.documentElement.scrollWidth, bad];
  });
  console.log(w + 'x' + h, JSON.stringify(r));
  await p.close();
}
await b.close();
