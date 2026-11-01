// Satchel sideways header: how much of the height the content gets (target >= 65%), every header button >= 44 px and on screen, the
// journal's page turns clear of the bottom fade, at 915x412, 640x360 and 844x390. Run: node tools/qa/menushots/satchelHeader.mjs <out dir>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [w, h] of [[915, 412], [640, 360], [844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await p.addInitScript(() => localStorage.setItem('sloth_mode_picked', '1'));
  await p.goto('http://127.0.0.1:8816/?lessons=off'); await p.waitForTimeout(6000);
  await p.click('.ttl-leaf-satchel'); await p.waitForTimeout(1200);
  await p.click('.sh-tab:has-text("Journal")'); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const hd = document.querySelector('.sh-head').getBoundingClientRect(); const bad = [...document.querySelectorAll('.sh-head button')].filter((e) => { const q = e.getBoundingClientRect(); return q.width < 44 || q.height < 44 || q.right > innerWidth || q.left < 0 || e.scrollWidth > e.clientWidth + 1; }).map((e) => e.textContent); const nv = document.querySelector('.jb-nav')?.getBoundingClientRect(); return { navBottom: nv && Math.round(nv.bottom), h: innerHeight, contentFrom: Math.round(hd.bottom), frac: +(1 - hd.bottom / innerHeight).toFixed(2), bad }; });
  console.log(w, h, JSON.stringify(r));
  await p.screenshot({ path: `${process.argv[2]}/journal-old-side-${w}x${h}.png` });
  await p.close();
}
await b.close();
