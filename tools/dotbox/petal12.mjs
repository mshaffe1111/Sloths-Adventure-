// dot-box: 1-2 sideways, Dot's opening line ("She said don't stop to smell the flowers...") while Pokey runs the first branch and picks
// petals: does a petal flying to the counter cross her box (the lead, 2026-11-01: one covered "flowers")? Shoots every ~100 ms while
// the line is up and keeps the frame where a flying petal is nearest the box (or over it).
//   PW=/opt/node-tools/node_modules/playwright/index.mjs npx tsx tools/dotbox/petal12.mjs <port> <out dir> <tag> [W H]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const { FINDS } = await import('../../src/game/finds.ts');
const { lawRects, aheadZone, pickupRects } = await import('../../src/game/dotGuidePerch.ts');
const [port = '4301', out = '.', tag = 'after', Ws = '915', Hs = '412'] = process.argv.slice(2);
const W = +Ws, H = +Hs;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })).newPage();
await p.addInitScript((found) => { try { localStorage.setItem('sloth_dot_skip_offered', '1'); localStorage.setItem('sloth_dot_help', 'reminders'); localStorage.setItem('sloth_finds', found); } catch {} }, JSON.stringify({ v: 1, found: FINDS.map((f) => f.id) }));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 90000 });
await p.evaluate(() => window.__play('1-2', 0));
await p.waitForFunction(() => typeof window.__engine === 'function' && !!window.__engine(), null, { timeout: 90000 });
let best = null, n = 0;
const t0 = Date.now();
let walking = false;
while (Date.now() - t0 < 30000) {
  await p.waitForTimeout(80);
  const s = await p.evaluate(() => {
    const bb = document.querySelector('.dg-bub.in');
    const up = !!bb && bb.innerText.includes('smell the flowers');
    const br = bb?.getBoundingClientRect();
    const flies = [...document.querySelectorAll('.vh-fly')].map((f) => f.getBoundingClientRect());
    let d = Infinity;
    if (br) for (const f of flies) {
      const dx = Math.max(br.left - f.right, 0, f.left - br.right);
      const dy = Math.max(br.top - f.bottom, 0, f.top - br.bottom);
      d = Math.min(d, Math.hypot(dx, dy));
    }
    return { up, d, flies: flies.length, box: br && { x0: br.left, y0: br.top, x1: br.right, y1: br.bottom } };
  });
  if (s.up && !walking) { await p.keyboard.down('ArrowRight'); walking = true; }
  if (walking && !s.up && best) break;
  if (s.up && s.flies && (!best || s.d < best.d)) {
    const f = path.join(out, `1-2-flowers-${tag}-sideways.png`);
    await p.screenshot({ path: f });
    best = { ...s, file: f };
    n++;
  }
}
// (the law at the last shot: the view as it was then is close enough, he walks on for under 0.1 s)
const v = await p.evaluate(() => {
  const e = window.__engine();
  const v = e.guideView({});
  const keep = ['live', 'zoom', 'camX', 'camY', 'cssW', 'cssH', 'px', 'py', 'pw', 'ph', 'vx', 'vy', 'facing', 'grounded', 'climbing', 'swinging', 'hanging', 'gliding'];
  const o = Object.fromEntries(keep.map((k) => [k, v[k]]));
  for (const k of ['platforms', 'ropes', 'vines', 'enemies', 'hazards', 'bushes', 'collectibles']) o[k] = JSON.parse(JSON.stringify(v[k] ?? []));
  return o;
});
await p.keyboard.up('ArrowRight');
const hit = (a, c) => a && c && a.x0 < c.x1 && a.x1 > c.x0 && a.y0 < c.y1 && a.y1 > c.y0;
const gv = { ...v, popups: [] };
const law = lawRects(gv, [], 0);
const bx = best?.box && { ...best.box, y0: best.box.y0 - 14 };
const checks = bx && { pokey: !hit(bx, law[0]), ahead: !hit(bx, aheadZone(gv)), action: !law.slice(2).some((q) => hit(bx, q)), pickups: !pickupRects(gv, []).some((q) => hit(bx, q)) };
console.log(JSON.stringify({ tag, shots: n, nearest: best && { d: Math.round(best.d), box: best.box }, checks }));
fs.writeFileSync(path.join(out, `1-2-flowers-${tag}.json`), JSON.stringify({ ...best, checks }, null, 1));
await b.close();
