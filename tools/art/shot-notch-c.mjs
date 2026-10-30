// polish-c (UI-6): the card screens on a phone with a notch (safe areas emulated), upright and sideways
// node tools/art/shot-notch-c.mjs <port> <outPrefix> <win|game_over|boss_card|story_ending> <stageId>
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, what, id] = process.argv.slice(2);
const b = await chromium.launch();
for (const [tag, w, h, ins] of [['up', 390, 844, { top: 47, bottom: 34, left: 0, right: 0 }], ['side', 844, 390, { top: 0, bottom: 21, left: 47, right: 47 }]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: ins }).catch((e) => console.log('no safe-area override:', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  if (what === 'win') await p.evaluate((i) => window.__win?.(i, 3), id);
  else await p.evaluate(([i, s]) => window.__story?.(i, s), [id, what]);
  await p.waitForTimeout(1500);
  // the notch and home bar drawn in, to see what they would cover
  await p.evaluate((ins) => {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
    const box = (css) => { const e = document.createElement('div'); e.style.cssText = 'position:absolute;background:rgba(255,0,80,.35);' + css; d.appendChild(e); };
    if (ins.top) box(`left:0;right:0;top:0;height:${ins.top}px`);
    if (ins.bottom) box(`left:0;right:0;bottom:0;height:${ins.bottom}px`);
    if (ins.left) box(`top:0;bottom:0;left:0;width:${ins.left}px`);
    if (ins.right) box(`top:0;bottom:0;right:0;width:${ins.right}px`);
    document.body.appendChild(d);
  }, ins);
  await p.screenshot({ path: `${out}-${tag}.jpg`, type: 'jpeg', quality: 82 });
  await p.close();
}
await b.close();
