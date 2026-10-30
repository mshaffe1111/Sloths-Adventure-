import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = '/tmp/claude-0/kit3/wired'; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const SIZES = [['up', 390, 844], ['side', 844, 390], ['small', 360, 640], ['se', 320, 568], ['phoneside', 640, 360], ['fold', 673, 841]];
for (const [tag, w, h] of SIZES) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await p.addInitScript(() => localStorage.setItem('sloth_lvl_1-1', JSON.stringify({ completed: true, stars: 2, bestScore: 900, bestTime: 90 })));
  await p.goto('http://127.0.0.1:8816/?lessons=off'); await p.waitForTimeout(6500);
  await p.screenshot({ path: `${out}/title-${tag}.png` });
  const bad = await p.evaluate(() => {
    const r = [];
    for (const e of document.querySelectorAll('.gx2-ui button')) {
      const q = e.getBoundingClientRect(); if (!q.width) continue;
      const l = (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 16);
      if (q.left < 15.5 || q.right > innerWidth - 15.5 || q.top < 0 || q.bottom > innerHeight) r.push(['out', l, Math.round(q.left), Math.round(q.right), Math.round(q.top), Math.round(q.bottom)]);
      if (q.width < 47.5 || q.height < 47.5) r.push(['small', l, Math.round(q.width), Math.round(q.height)]);
    }
    return r;
  });
  console.log(tag, JSON.stringify(bad));
  if (['up', 'side', 'small'].includes(tag)) {
    await p.click('[data-menu]'); await p.waitForTimeout(700);
    for (const t of ['Sound', 'Game', 'Saves', 'Trophies', 'About']) {
      await p.click(`.st-tab[aria-label="${t}"]`); await p.waitForTimeout(300);
      await p.screenshot({ path: `${out}/settings-${t}-${tag}.png` });
    }
    await p.click('.st-tab[aria-label="Saves"]'); await p.waitForTimeout(200);
    await p.click('.st-row:nth-child(2) .st-btn'); await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/settings-confirm-${tag}.png` });
    const sb = await p.evaluate(() => { const r = []; for (const e of document.querySelectorAll('.st-card button')) { const q = e.getBoundingClientRect(); if (!q.width) continue; if (q.left < 0 || q.right > innerWidth || q.top < 0 || q.bottom > innerHeight) r.push(['out', (e.textContent||e.getAttribute('aria-label')).trim().slice(0,14), Math.round(q.top), Math.round(q.bottom)]); } return r; });
    console.log(tag, 'settings', JSON.stringify(sb));
  }
  await p.close();
}
await b.close();
