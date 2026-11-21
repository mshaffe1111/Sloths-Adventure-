// BUILD-23e: one clip of 2-3's line crossing under the heron on the real page (a vite dev server on 5181), sideways 915 x 412 (or
// upright), the engine stepped at 30 fps inside the page so the video plays at real speed. Every cage freed by the engine's own freeing
// and the line formed behind him before the first heron stretch with two clumps or more; then he plays it as the bot's wait-for-the-tail
// rule says: into the reeds, stand while the heron warns and looks, go right after a look ends, to the next clump; until past the stretch.
//   node reference/qa-reports/BUILD-23/clip23e.mjs <out dir> [upright] [easy]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
const [out, orient = 'sideways', easy] = process.argv.slice(2);
const [w, h] = orient === 'upright' ? [412, 915] : [915, 412];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, recordVideo: { dir: out, size: { width: w, height: h } } });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:5181/?lessons=off${easy ? '&difficulty=easy' : ''}`);
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('2-3', 1));
await p.waitForTimeout(4000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(1500);
const setup = await p.evaluate(() => {
  const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
  e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  const bushes = e.proto.bushes;
  const hz = e.follow.herons.find((hh) => bushes.filter((q) => q.x >= hh.z.x0 - 1 && q.x <= hh.z.x1).length >= 2);
  const beds = bushes.filter((q) => q.x >= hz.z.x0 - 1 && q.x <= hz.z.x1).sort((a, c) => a.x - c.x);
  const sx = beds[0].x - 260;
  const under = e.platforms.filter((q) => !q.broken && !q.decorative && q.type === 'solid' && sx >= q.x && sx <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
  Object.assign(e.player, { x: sx, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, facing: 1, invincibleTimer: 0 });
  for (let i = 0; i < 20; i++) e.update(1 / 30);
  for (const c of e.collectibles.filter((q) => q.type === 'cage' && !q.collected)) { e.freeCritter(c); c.collected = true; }
  // (the line formed behind him: each little one stood on his trail, then the line steps itself into its row)
  e.follow.line.forEach((q, i) => Object.assign(q, { state: 'follow', x: sx - 30 - 30 * i, back: undefined }));
  for (let i = 0; i < 45; i++) e.update(1 / 30);
  // (the heron set to the end of its calm, so the clip opens on him walking in and the look comes while he is in the first clump)
  window.__clip = { beds: beds.map((q) => [q.x, q.w]), x1: hz.z.x1, phase: hz.s.phase, seenLook: false, go: false, log: [] };
  window.__hz = hz;
  return { x0: hz.z.x0, x1: hz.z.x1, beds: window.__clip.beds, line: e.follow.line.length, px: Math.round(e.player.x) };
});
console.log('setup', JSON.stringify(setup));
// the 30 fps loop inside the page: his controller, one step, one paint
await p.evaluate(() => {
  const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
  const C = window.__clip, hz = window.__hz;
  let last = performance.now(), acc = 0;
  const tick = (now) => {
    acc += now - last; last = now;
    while (acc >= 1000 / 30) {
      acc -= 1000 / 30;
      const px = e.player.x;
      const k = C.beds.findIndex(([x, w]) => px > x + 10 && px < x + w - 10);
      // (walk; into reeds he has not waited in: hold at their far end until a look has come and ended, then walk on)
      C.done ??= false;
      C.passed ??= {};
      if (C.mode !== 'hold' && k >= 0 && !C.passed[k]) { C.mode = 'hold'; C.bed = k; C.looked = false; }
      if (C.mode === 'hold') {
        const [x, w] = C.beds[C.bed];
        const far = x + w - 40;
        e.player.vx = px < far ? 200 : 0;
        if (hz.s.phase === 'pass') C.looked = true;
        if (C.looked && hz.s.phase === 'calm') { C.mode = 'walk'; C.passed[C.bed] = true; }
      } else e.player.vx = 285;
      e.player.facing = 1;
      e.update(1 / 30);
      e.clearGuide?.();
      if (C.log.length < 2000 && Math.round(now) % 10 < 4) C.log.push(`${Math.round(px)} ${hz.s.phase} ${e.follow.line.map((q) => q.state[0]).join('')}`);
    }
    e.render();
    if (e.player.x < C.x1 + 500) requestAnimationFrame(tick); else C.done = true;
  };
  requestAnimationFrame(tick);
});
const t0 = Date.now();
while (Date.now() - t0 < 75000) {
  await p.waitForTimeout(1000);
  if (await p.evaluate(() => window.__clip.done)) break;
}
await p.waitForTimeout(1500);
const end = await p.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return { px: Math.round(e.player.x), line: e.follow.line.map((q) => `${q.kind}:${q.state}`), done: !!window.__clip.done, log: window.__clip.log.filter((_, i) => i % 15 === 0) }; });
console.log('end', JSON.stringify(end));
const v = await p.video().path();
await ctx.close();
await b.close();
const dst = path.join(out, `b23e-clip-line-under-heron-${easy ? 'easy' : 'normal'}-${orient}.webm`);
fs.renameSync(v, dst);
console.log('wrote', dst, ((Date.now() - t0) / 1000).toFixed(0), 's');
