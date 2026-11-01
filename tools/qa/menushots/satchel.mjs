// Satchel tabs: screenshots of each tab on an old save and a fresh one (SAVES=old,fresh), upright 412x915 and sideways 915x412, with
// the count line of each tab and a clip check (a card's text running past its card). Method: reference/methods/menu-screen.md.
// Run (dev server on 8816): node tools/qa/menushots/satchel.mjs <out dir> Finds,Trophies,Journal,Scenes,Creatures
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const tabs = (process.argv[3] || 'Finds,Trophies,Creatures,Scenes').split(',');
const b = await chromium.launch();
const errs = [];
for (const save of (process.env.SAVES || 'old,fresh').split(',')) for (const [tag, w, h] of [['up', 412, 915], ['side', 915, 412]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.addInitScript((save) => {
    localStorage.setItem('sloth_mode_picked', '1');
    if (save !== 'old') return;
    for (let wd = 1; wd <= 3; wd++) for (let m = 1; m <= 10; m++) localStorage.setItem(`sloth_lvl_${wd}-${m}`, JSON.stringify({ completed: true, stars: (m % 3) + 1, bestScore: 900, bestTime: 120 }));
    localStorage.setItem('sloth_lvl_4-1', JSON.stringify({ completed: true, stars: 3, bestScore: 900, bestTime: 120 }));
    localStorage.setItem('sloth_finds', JSON.stringify({ v: 1, found: ['w1_note', 'w1_keepsake', 'w2_note', 'w2_book', 'w3_note', 'w1_snail'] }));
    localStorage.setItem('sloth_badges', JSON.stringify({ v: 1, earned: {}, kills: { snake: 14, boa: 3, turtle: 6 }, seen: ['snake', 'boa', 'eagle', 'turtle', 'ocelot', 'jaguar'], counters: {}, quiet: [] }));
  }, save);
  await p.goto('http://127.0.0.1:8816/?lessons=off'); await p.waitForTimeout(6000);
  await p.click('.ttl-leaf-satchel'); await p.waitForTimeout(1200);
  for (const t of tabs) {
    await p.click(`.sh-tab:has-text("${t}")`); await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/${t.toLowerCase()}-${save}-${tag}.png` });
    const bad = await p.evaluate(() => {
      const r = [];
      for (const e of document.querySelectorAll('.tr-card .tr-ct, .tr-card .tr-cn, .tr-card .tr-cf, .ss-t small, .ss-t b')) {
        const card = e.closest('.tr-card, .ss-row'); const q = e.getBoundingClientRect(), c = card.getBoundingClientRect();
        const rg = document.createRange(); rg.selectNodeContents(e); const t = rg.getBoundingClientRect(); if (t.width && (t.right > c.right - 2 || t.bottom > c.bottom - 2 || t.left < c.left + 2)) r.push((e.textContent || '').slice(0, 50));
      }
      return r;
    });
    const subs = await p.evaluate(() => [...document.querySelectorAll('.tr-sub')].map((e) => e.textContent.trim()).join(' | '));
    console.log('   ', subs);
    console.log(save, tag, t, bad.length ? 'CLIPPED ' + JSON.stringify(bad.slice(0, 6)) : 'ok');
  }
  await p.close();
}
console.log('errors', errs);
await b.close();
