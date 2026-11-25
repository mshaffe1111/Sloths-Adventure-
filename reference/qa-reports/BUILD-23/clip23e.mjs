// BUILD-23e: one clip of 2-3's line crossing under the heron on the real page (a vite dev server on 5181), sideways 915 x 412 (or
// upright), stepped one 1/30 s frame at a time, each painted and screenshotted, the frames made into a 30 fps video (ffmpeg): real speed,
// full resolution (Chromium's own screen recording drew the game into ~60% of its frame, BUILD-23e). Every cage freed by the engine's own freeing
// and the line formed behind him before the first heron stretch with two clumps or more; then he plays it as the bot's wait-for-the-tail
// rule says: into the reeds, stand while the heron warns and looks, go right after a look ends, to the next clump; until past the stretch.
//   node reference/qa-reports/BUILD-23/clip23e.mjs <out dir> [upright] [easy]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
const [out, orient = 'sideways', easy] = process.argv.slice(2);
const [w, h] = orient === 'upright' ? [412, 915] : [915, 412];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
  // (Easy is the saved setting (difficulty.ts DIFFICULTY_KEY in localStorage); the page has no URL switch for it: '&difficulty=easy' alone
  // loaded Normal, BUILD-23e found)
  if (easy) await p.addInitScript(() => localStorage.setItem('sloth_difficulty', 'easy'));
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
  // (the first stretch with two clumps over it, by overlap: beat 4's first clump starts 40 px before its stretch; one heron there)
  const over = (hh) => bushes.filter((q) => q.x + q.w > hh.z.x0 && q.x < hh.z.x1);
  const hz = e.follow.herons.find((hh) => over(hh).length >= 2);
  const beds = over(hz).sort((a, c) => a.x - c.x);
  const sx = Math.min(beds[0].x, hz.z.x0) - 260;
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
// one frame: his controller, one step, one paint (window.__step), then a screenshot; until 1.5 s after the line is past the stretch
await p.evaluate(() => {
  const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
  const C = window.__clip, hz = window.__hz;
  C.passed = {};
  window.__step = () => {
    const px = e.player.x;
    const k = C.beds.findIndex(([x, w]) => px > x + 10 && px < x + w - 10);
    // (walk; into reeds he has not waited in: hold at their far end until a look has come and ended, then walk on)
    if (C.mode !== 'hold' && k >= 0 && !C.passed[k]) { C.mode = 'hold'; C.bed = k; C.looked = false; }
    if (C.mode === 'hold') {
      const [x, w] = C.beds[C.bed];
      const far = x + w - 40;
      // (while it looks he stands still where he is, as the line must; else on to the reeds' far end)
      e.player.vx = hz.s.phase === 'pass' || px >= far ? 0 : 200;
      if (hz.s.phase === 'pass') C.looked = true;
      if (C.looked && hz.s.phase === 'calm') { C.mode = 'walk'; C.passed[C.bed] = true; }
    } else {
      e.player.vx = 285;
      // (stopped dead against a face (World 2's boulder on the mud past the stretch) for half a second: a plain hop over it)
      C.still = Math.abs(px - (C.lastX ?? px)) < 1 ? (C.still ?? 0) + 1 : 0;
      if (C.still >= 15 && e.player.grounded) { e.player.vy = -620; e.player.grounded = false; C.still = 0; }
    }
    C.lastX = px;
    e.player.facing = 1;
    e.update(1 / 30);
    e.clearGuide?.();
    e.render();
    C.n = (C.n ?? 0) + 1;
    if (C.n % 15 === 0) C.log.push(`${Math.round(px)} ${hz.s.phase} ${e.follow.line.map((q) => q.state[0]).join('')}`);
    if (e.follow.line.every((q) => q.x > C.x1 + 20)) C.past = (C.past ?? 0) + 1;
    return (C.past ?? 0) >= 45 || e.player.x >= C.x1 + 900 || C.n >= 1800;
  };
});
const frames = fs.mkdtempSync(path.join(out, '.frames-'));
const t0 = Date.now();
let n = 0;
for (; n < 1800; n++) {
  const done = await p.evaluate(() => window.__step());
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
  await p.screenshot({ path: path.join(frames, `f${String(n).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 88 });
  if (done) break;
}
const end = await p.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return { px: Math.round(e.player.x), line: e.follow.line.map((q) => `${q.kind}:${q.state}`), done: !!window.__clip.done, log: window.__clip.log.filter((_, i) => i % 15 === 0) }; });
console.log('end', JSON.stringify(end));
await ctx.close();
await b.close();
const dst = path.join(out, `b23e-clip-line-under-heron-${easy ? 'easy' : 'normal'}-${orient}.webm`);
const { execFileSync } = await import('node:child_process');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', path.join(frames, 'f%04d.jpg'), '-c:v', 'libvpx', '-b:v', '3M', '-an', dst]);
fs.rmSync(frames, { recursive: true, force: true });
console.log('wrote', dst, n + 1, 'frames', ((Date.now() - t0) / 1000).toFixed(0), 's');
