// Group A on the real start screen before it is wired: the painted objects swapped in by the page (dev server, port 4301)
//   node tools/art/icons/mock-title.mjs <out dir> [old|fresh]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const seed = fs.readFileSync(new URL('../satchel-seed.js', import.meta.url), 'utf8');
const TOKEN = process.env.TOKEN || 'bare';
const TOK = TOKEN === 'leaf' ? '.ttl-token { background-image: url(/src/assets/ui/leaf-token.webp); border-radius: 0; --tw: 104%; }'
  : TOKEN === 'bare' ? '.ttl-token { background: none; --tw: 100%; filter: drop-shadow(0 3px 3px rgba(0,0,0,.5)); }' : '.ttl-token { --tw: 92%; }';
const A = (n) => `/src/assets/icons/${n}.webp`;
const css = `.ttl-leaf-ic img.pi { width: 118%; height: 118%; object-fit: contain; transform: translateY(-6%); filter: drop-shadow(0 2px 2px rgba(20,10,0,.55)); pointer-events: none; }
${TOK}
.ttl-token img.pi { width: var(--tw, 78%); height: var(--tw, 78%); object-fit: contain; filter: drop-shadow(0 2px 2px rgba(20,10,0,.5)); }
.ttl-play-s img.pi { width: 16px; height: 16px; vertical-align: -2px; }
button img.pi.rs { width: 22px; height: 22px; }
.pic-mute { position: relative; display: inline-block; width: 100%; height: 100%; }
.pic-mute-obj { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; filter: saturate(.45) brightness(.8); opacity: .8; }
.pic-mute-x { position: absolute; right: -6%; bottom: -6%; width: 58%; height: 58%; object-fit: contain; filter: drop-shadow(0 1px 1px rgba(20,10,0,.6)); }
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
    sw(document.querySelector('.ttl-play-s .ic'), 'star');
    for (const b of document.querySelectorAll('button')) { const ic = b.querySelector('svg.ic'); if (ic && /Refresh/.test(b.textContent)) { const i = document.createElement('img'); i.src = A.restart; i.className = 'pi rs'; ic.replaceWith(i); } }
  }, Object.fromEntries(['map', 'story', 'howto', 'sound', 'gear', 'play', 'star', 'restart', 'close'].map((n) => [n, A(n)])));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/title-${save}-${tag}-after-${TOKEN}.png` });
  await p.evaluate((A) => { const t = document.querySelector('.ttl-token img.pi'); const s = document.createElement('span'); s.className = 'pi pic-mute';
    s.innerHTML = `<img class="pic-mute-obj" src="${A.sound}"><img class="pic-mute-x" src="${A.close}">`; t.replaceWith(s); },
    Object.fromEntries(['sound', 'close'].map((n) => [n, A(n)])));
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/title-${save}-${tag}-mute.png`, clip: tag === 'up' ? { x: 260, y: 0, width: 152, height: 80 } : { x: 760, y: 0, width: 155, height: 80 } });
  await ctx.close();
}
await b.close();
