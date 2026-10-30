import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const mock = process.argv[2] || '';
const css = mock ? fs.readFileSync(mock, 'utf8') : '';
const out = '/tmp/claude-0/kit2/shots'; fs.mkdirSync(out, { recursive: true });
const tag0 = process.argv[3] || 'now';
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390], ['small', 360, 640], ['fold', 673, 841]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await p.goto('http://127.0.0.1:8815/?lessons=off'); await p.waitForTimeout(7000);
  if (css) {
    await p.addStyleTag({ content: css });
    await p.evaluate(() => { const m = document.querySelector('[data-menu]'); if (m) { m.setAttribute('aria-label', 'Settings'); m.lastChild.textContent = 'Settings'; } });
    await p.waitForTimeout(600);
  }
  await p.screenshot({ path: `${out}/title-${tag}-${tag0}.png` });
  await p.close();
}
await b.close();
