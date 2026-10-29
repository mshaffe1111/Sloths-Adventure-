// polish-c (UI-13): one still of every kind of screen, upright and sideways, for before/after comparison of the stylesheets and fonts
// node tools/art/shot-screens-c.mjs <port> <outDir>      (motion off and a fixed wait, so two runs of the same code match)
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const SCREENS = [
  ['title', null],
  ['map', (p) => p.getByText('World Map', { exact: false }).first().click()],
  ['journal', (p) => p.getByText('How to Play', { exact: false }).first().click()],
  ['trophies', (p) => p.getByText('Trophies', { exact: false }).first().click()],
  ['newgame', (p) => p.getByText('New Game', { exact: false }).first().click()],
  ['play', (p) => p.evaluate(() => window.__play('1-2'))],
  ['pause', async (p) => { await p.evaluate(() => window.__play('1-2')); await p.waitForTimeout(5000); await p.keyboard.press('Escape'); }],
  ['win', (p) => p.evaluate(() => window.__win('1-3', 2, ['not_one_scratch']))],
  ['lost', (p) => p.evaluate(() => window.__story('2-3', 'game_over'))],
  ['story', (p) => p.evaluate(() => window.__story('2-1', 'world_story'))],
  ['bosscard', (p) => p.evaluate(() => window.__story('1-10', 'boss_card'))],
  ['ending', (p) => p.evaluate(() => window.__story('10-10', 'story_ending'))],
];
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  for (const [name, go] of SCREENS) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(4500);
    try {
      if (go) await go(p);
    } catch (e) {
      console.log(name, tag, 'could not open:', String(e).slice(0, 120));
    }
    await p.waitForTimeout(name === 'play' ? 6000 : 2500);
    await p.screenshot({ path: `${out}/${name}-${tag}.png` });
    await p.close();
  }
}
await b.close();
