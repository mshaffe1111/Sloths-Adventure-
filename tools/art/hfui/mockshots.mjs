import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const css = fs.readFileSync('/tmp/claude-0/kit/mock.css', 'utf8');
const out = '/tmp/claude-0/kit/mock'; fs.mkdirSync(out, { recursive: true });
const SCREENS = [
  ['title', null],
  ['pause', async (p) => { await p.evaluate(() => window.__play('1-2')); await p.waitForTimeout(5000); await p.keyboard.press('Escape'); }],
  ['win', (p) => p.evaluate(() => window.__win('1-3', 2, ['not_one_scratch']))],
  ['lost', (p) => p.evaluate(() => window.__story('2-3', 'game_over'))],
  ['map', (p) => p.getByText('World Map', { exact: false }).first().click()],
];
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) for (const [name, go] of SCREENS) for (const mock of [0, 1]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await p.goto('http://127.0.0.1:8812/?lessons=off'); await p.waitForTimeout(4500);
  try { if (go) await go(p); } catch (e) { console.log(name, String(e).slice(0, 80)); }
  await p.waitForTimeout(2500);
  if (mock) { await p.addStyleTag({ content: css }); await p.waitForTimeout(500); }
  await p.screenshot({ path: `${out}/${name}-${tag}-${mock ? 'kit' : 'now'}.png` });
  await p.close();
}
await b.close();
