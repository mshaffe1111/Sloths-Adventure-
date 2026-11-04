import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const seed = fs.readFileSync('tools/art/satchel-seed.js', 'utf8');
const b = await chromium.launch();
for (const save of ['fresh', 'old']) for (const [tag, w, h] of [['up', 412, 915], ['side', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  if (save === 'old') await ctx.addInitScript(seed); else await ctx.addInitScript(() => { try { if (!sessionStorage.__c) { localStorage.clear(); sessionStorage.__c = 1; } } catch {} });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4301/?lessons=off'); await p.waitForTimeout(9000);
  await p.screenshot({ path: `${out}/title-${save}-${tag}.png` });
  const r = await p.evaluate(() => [...document.querySelectorAll('.ttl-leaf-ic, .ttl-token, .ttl-satchel')].map(e => { const q = e.getBoundingClientRect(); return e.className + ' ' + Math.round(q.width) + 'x' + Math.round(q.height); }));
  console.log(save, tag, r.join(' | '));
  await ctx.close();
}
await b.close();
