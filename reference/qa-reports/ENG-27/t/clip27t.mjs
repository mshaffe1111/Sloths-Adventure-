// ENG-27e: THE CLIP (D63) of the race leg on the real page. The run is the middle bot's, a REAL engine run in node
// (cliprec-27e.ts.txt: every frame's changed state as deltas); here each frame's state is put on the page's own engine (the dev fixture
// ?fixture=home, the same toy roll), its camera follows as the game's does, the page renders it (canvas + HUD), and every second frame is
// a screenshot at 2x; ffmpeg joins them at 15 fps (real speed). Per shot it logs whether any of the boat's box is in the camera's view.
//   PW=<playwright> node clip-27e.mjs <port> <recording.json> <out dir> upright|sideways [seed]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const PWM = await import(process.env.PW ?? 'playwright');
const chromium = PWM.chromium ?? PWM.default.chromium;
const [port, recFile, out, orient = 'sideways', seed = '1'] = process.argv.slice(2);
const rec = JSON.parse(fs.readFileSync(recFile, 'utf8'));
const frameDir = path.join(out, `frames-${orient}`);
fs.rmSync(frameDir, { recursive: true, force: true });
fs.mkdirSync(frameDir, { recursive: true });
const [w, h] = orient === 'upright' ? [412, 915] : [915, 412];
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(3000);
await p.evaluate((s) => window.__play('2-97', Number(s)), seed);
await p.waitForTimeout(6000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.evaluate(async (E) => {
  const e = eval(E);
  e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  window.__pd = await import('/src/game/pacerDraw.ts');
}, E);
// (the deltas of the frames between two shots, merged, are put on the page; every key the recorder wrote is a plain field)
const SKIP_E = ['isPaused', 'outerPause'];
const apply = (d) => p.evaluate(([d, E, SKIP_E]) => {
  const e = eval(E);
  const missing = [];
  for (const [k, v] of Object.entries(d)) {
    if (k === 'E') { for (const [a, x] of Object.entries(v)) if (!SKIP_E.includes(a)) e[a] = x; }
    else if (k === 'P') Object.assign(e.player, v);
    else if (k.startsWith('pl')) { const q = e.platforms.find((q) => String(q.id) === k.slice(2)); if (q) Object.assign(q, v); else missing.push(k); }
    else if (k.startsWith('pc')) { const q = e.pieces[Number(k.slice(2))]; if (q) Object.assign(q, v); else missing.push(k); }
    else if (k.startsWith('c')) { const q = e.collectibles[Number(k.slice(1))]; if (q) Object.assign(q, v); else missing.push(k); }
    else if (k.startsWith('v')) { const q = e.vines[Number(k.slice(1))]; if (q) Object.assign(q, v); else missing.push(k); }
  }
  e.isPaused = true;
  e.updateCamera(1 / 30);
  return missing;
}, [d, E, SKIP_E]);
const shotInfo = () => p.evaluate((E) => {
  const e = eval(E), pd = window.__pd;
  const pc = e.pieces.find((q) => q.kind === 'pacer');
  const c = e.camera, lo = c.x, hi = c.x + c.viewportWidth, top = c.y, bot = c.y + c.viewportHeight;
  const boxes = pc ? pd.pacerShown(pc.pacer, pc.x, pc.clock ?? 0, pd.pacerWaters(pc.pacer, e.currentStage.rivers)) : [];
  const seen = boxes.some(({ box, clip }) => Math.min(clip?.x1 ?? box.x + box.w, hi) > Math.max(clip?.x0 ?? box.x, lo) && box.y < bot && box.y + box.h > top);
  return { px: Math.round(e.player.x), py: Math.round(e.player.y), boat: pc ? Math.round(pc.x) : null, clock: pc?.clock ?? null, seen, drawn: boxes.length > 0, cam: Math.round(c.x) };
}, E);
let merged = {}, n = 0, missingAll = new Set();
const log = [];
// (the first frame is put on whole: the recorder's first frame holds every key; the camera is set on him at once)
for (let i = 0; i < rec.frames.length; i++) {
  for (const [k, v] of Object.entries(rec.frames[i])) merged[k] = k in merged && typeof v === 'object' && !Array.isArray(v) ? { ...merged[k], ...v } : v;
  if (i === 0) await p.evaluate((E) => { const e = eval(E); }, E);
  if (i % 2 === 1 || i === rec.frames.length - 1) {
    const miss = await apply(merged);
    for (const m of miss) missingAll.add(m);
    merged = {};
    if (n === 0) await p.evaluate((E) => { const e = eval(E); e.camera.x = e.camera.targetX ?? e.camera.x; e.camera.y = e.camera.targetY ?? e.camera.y; }, E);
    await p.evaluate((E) => { const e = eval(E); e.render(); }, E);
    const info = await shotInfo();
    log.push({ shot: n, frame: i, ...info });
    await p.screenshot({ path: path.join(frameDir, `${String(n).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 80 });
    n++;
  } else {
    // (the camera follows every frame, as the game's does)
    await apply(merged);
    merged = {};
  }
}
await b.close();
const mp4 = path.join(out, `ease-${orient}.mp4`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '15', '-i', path.join(frameDir, '%05d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', mp4]);
fs.writeFileSync(path.join(out, `ease-${orient}.log.json`), JSON.stringify({ verdict: rec.verdict, missing: [...missingAll], shots: log }));
const raced = log.filter((s) => s.clock !== null && s.clock > 0);
console.log(`${orient}: ${n} shots -> ${mp4}; missing keys ${[...missingAll].slice(0, 8).join(',') || 'none'}; boat in view ${log.filter((s) => s.seen).length}/${n} shots (racing: ${raced.filter((s) => s.seen).length}/${raced.length})`);
