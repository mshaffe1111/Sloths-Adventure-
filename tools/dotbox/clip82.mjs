// dot-box: a real-time clip of 8-2's first rope (layout 1, on w8-rope2's 8-2) sideways: Dot's "Careful! It's a long way down." as he
// walks up, the flick at the take-off post, the grab and the crossing, to judge where her box sits while he acts.
//   PW=/opt/node-tools/node_modules/playwright/index.mjs npx tsx tools/dotbox/clip82.mjs <port> <out.webm dir> [W H]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const { FINDS } = await import('../../src/game/finds.ts');
const [port = '4303', out = '.', Ws = '915', Hs = '412'] = process.argv.slice(2);
const W = +Ws, H = +Hs;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
// (screenshots in real time, not Playwright's video: it draws the page at 60% inside its frame)
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
await p.addInitScript((found) => { try { localStorage.setItem('sloth_dot_skip_offered', '1'); localStorage.setItem('sloth_dot_help', 'reminders'); localStorage.setItem('sloth_way_8-2', 'LHF'); localStorage.setItem('sloth_finds', found); } catch {} }, JSON.stringify({ v: 1, found: FINDS.map((f) => f.id) }));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 90000 });
await p.evaluate(() => window.__play('8-2', 1));
await p.waitForFunction(() => typeof window.__engine === 'function' && !!window.__engine(), null, { timeout: 90000 });
await p.waitForTimeout(3000);
for (let i = 0, quiet = 0; i < 100 && quiet < 6; i++) {
  await p.waitForTimeout(250);
  quiet = (await p.evaluate(() => !document.querySelector('.dg-bub.in'))) ? quiet + 1 : 0;
}
const edge = await p.evaluate(() => {
  const e = window.__engine();
  const h = e.proto.hints.find((q) => q.text.includes('long way down'));
  for (const q of e.proto.hints) if (q !== h && q.x < h.x) q.shown = true;
  e.zoneHinted = new Proxy({}, { get: () => true });
  const r = e.ropes[0];
  const from = e.platforms.filter((q) => q.x < r.x0 && q.x + q.width >= r.x0 && q.x + q.width <= r.x0 + 120 && q.y > r.y).sort((a, c) => a.y - c.y)[0];
  const x = h.x + 10;
  const g = e.platforms.filter((q) => !q.broken && q.x <= x + 20 && q.x + q.width >= x + 20).sort((a, c) => a.y - c.y)[0];
  Object.assign(e.player, { x, y: g.y, vx: 0, vy: 0, grounded: true, hanging: false, facing: 1 });
  return from.x + from.width;
});
// walk up (shooting all the way); wait at the post until her line is up and read a moment (as a first-timer would), then flick 60 px short of the edge
await p.keyboard.down('ArrowRight');
let jumped = false, upAt = -1;
const t0 = Date.now();
const frames = [];
const shoot = async () => {
  const f = path.join(out, `f${String(frames.length).padStart(4, '0')}.jpg`);
  await p.screenshot({ path: f, type: 'jpeg', quality: 80 });
  frames.push({ f, t: Date.now() });
};
while (Date.now() - t0 < 16000) {
  await shoot();
  const s = await p.evaluate(() => { const e = window.__engine(); const b = document.querySelector('.dg-bub.in'); return { x: e.player.x + e.player.width, hang: !!e.player.hanging, up: !!b && b.innerText.includes('long way') }; });
  if (s.up && upAt < 0) upAt = Date.now();
  if (!jumped && s.x >= edge - 140 && (upAt < 0 || Date.now() - upAt < 1500)) { await p.keyboard.up('ArrowRight'); continue; }
  if (!jumped && s.x < edge - 140) { await p.keyboard.down('ArrowRight'); continue; }
  if (!jumped) {
    await p.keyboard.down('ArrowRight');
    if (s.x >= edge - 60) { await p.keyboard.down('Space'); await p.waitForTimeout(170); await p.keyboard.up('Space'); jumped = true; }
    continue;
  }
  if (jumped && Date.now() - t0 > 15000) break;
}
await p.keyboard.up('ArrowRight');
await ctx.close();
await b.close();
// (ffmpeg's concat list: each frame held for as long as it really was)
const list = frames.map((q, i) => `file '${path.basename(q.f)}'\nduration ${(((frames[i + 1]?.t ?? q.t + 100) - q.t) / 1000).toFixed(3)}`).join('\n');
fs.writeFileSync(path.join(out, 'frames.txt'), `${list}\nfile '${path.basename(frames.at(-1).f)}'\n`);
console.log(frames.length, 'frames over', ((frames.at(-1).t - frames[0].t) / 1000).toFixed(1), 's');
