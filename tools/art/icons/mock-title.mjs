// Group A on the real start screen before it is wired: the painted objects swapped in by the page (dev server, port 4301)
//   node tools/art/icons/mock-title.mjs <out dir> [old|fresh]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const seed = fs.readFileSync(new URL('../satchel-seed.js', import.meta.url), 'utf8');
const A = (n) => `/src/assets/icons/${n}.webp`;
const css = `.ttl-leaf-ic img.pi { width: 118%; height: 118%; object-fit: contain; transform: translateY(-6%); filter: drop-shadow(0 2px 2px rgba(20,10,0,.55)); pointer-events: none; }
.ttl-token img.pi { width: 78%; height: 78%; object-fit: contain; filter: drop-shadow(0 2px 2px rgba(20,10,0,.5)); }
.ttl-play-t img.pi { width: 34px; height: 34px; object-fit: contain; filter: drop-shadow(0 2px 1px rgba(20,10,0,.5)); }`;
const b = await chromium.launch();
for (const save of (process.argv[3] || 'old,fresh').split(',')) for (const [tag, w, h] of [['up', 412, 915], ['side', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  if (save === 'old') await ctx.addInitScript(seed); else await ctx.addInitScript(() => { localStorage.clear(); });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4301/?lessons=off'); await p.waitForTimeout(8000);
  await p.screenshot({ path: `${out}/title-${save}-${tag}-before.png` });
  await p.addStyleTag({ content: css });
  await p.evaluate((A) => {
    const sw = (el, n) => { if (!el) return; const i = document.createElement('img'); i.src = A[n]; i.className = 'pi'; i.alt = ''; el.replaceWith(i); };
    const leaves = document.querySelectorAll('.ttl-leaf');
    sw(leaves[0].querySelector('.ic'), 'map'); sw(leaves[1].querySelector('.ic'), 'story'); sw(leaves[3].querySelector('.ic'), 'howto');
    const tok = document.querySelectorAll('.ttl-token'); sw(tok[0].querySelector('.ic'), 'sound'); sw(tok[1].querySelector('.ic'), 'gear');
    sw(document.querySelector('.ttl-play-t .ic'), 'play');
  }, Object.fromEntries(['map', 'story', 'howto', 'sound', 'gear', 'play'].map((n) => [n, A(n)])));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/title-${save}-${tag}-after.png` });
  await ctx.close();
}
await b.close();
