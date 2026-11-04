/**
 * GPU plan stage 1 (R-3.2): the GPU backdrop vs the 2D backdrop, the same frozen frame, every world.
 *   node tools/qa/gpuBackdrop.cjs <dev url> <out dir> [stages] [port|land]
 * For each stage and orientation: Math.random seeded, the stage opened (the GPU path kept on even where the copy is a readback, as in
 * this container: backdropCheck.keepGpu), played 3 s, quality pinned to q0, frozen and drawn 40 times. The game canvas is read twice
 * with the GPU backdrop (noise check) and once with it forced back to the 2D canvas. Prints, per run, the GPU copies made, the pixels that
 * differ by more than 8 and by more than 32 levels (of all), the largest difference, and saves the pair, the >8 map and a crop of the
 * worst spot. FAIL when no GPU copy was made, the GPU frame is not stable, any pixel differs by more than 32, or more than 0.01% by more than 8.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const { execFileSync } = require('child_process');
const [base = 'http://127.0.0.1:4303/', out = '/tmp/gpuBackdrop', stagesArg, oArg] = process.argv.slice(2);
const STAGES = (stagesArg || '1-1,2-1,3-1,4-1,5-1,6-1,7-1,8-1,9-1,10-1,5-M').split(',');
const OR = [{ id: 'port', w: 412, h: 915 }, { id: 'land', w: 915, h: 412 }].filter((o) => !oArg || o.id === oArg);
const LIMIT_32 = 0; // (none: with the stamps exact, the GPU backdrop matches the 2D one to 1 level a pixel)
const LIMIT_8 = 0.0001;
fs.mkdirSync(out, { recursive: true });
const stats = (a, b, tag) => JSON.parse(execFileSync('python3', ['-c', `
import sys, json
from PIL import Image, ImageChops
a = Image.open(sys.argv[1]).convert('RGB'); b = Image.open(sys.argv[2]).convert('RGB')
if a.size != b.size: print(json.dumps({'size': [a.size, b.size]})); sys.exit()
d = ImageChops.difference(a, b).convert('L'); v = list(d.get_flattened_data()); n = len(v)
g8 = sum(1 for x in v if x > 8); g32 = sum(1 for x in v if x > 32)
m = d.point(lambda x: 255 if x > 8 else 0)
if sys.argv[3] != '-':
  m.save(sys.argv[3] + '-map8.png')
  hot = d.point(lambda x: 255 if x > 32 else 0).getbbox()
  if hot:
    cx, cy = (hot[0] + hot[2]) // 2, (hot[1] + hot[3]) // 2
    box = (max(0, cx - 60), max(0, cy - 60), max(0, cx - 60) + 120, max(0, cy - 60) + 120)
    c = Image.new('RGB', (480, 240)); c.paste(a.crop(box).resize((240, 240), Image.NEAREST), (0, 0)); c.paste(b.crop(box).resize((240, 240), Image.NEAREST), (240, 0)); c.save(sys.argv[3] + '-worst.png')
print(json.dumps({'px': n, 'over8': g8, 'over32': g32, 'max': max(v)}))`, a, b, tag]).toString());
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const o of OR) for (const st of STAGES) {
    const ctx = await b.newContext({ viewport: { width: o.w, height: o.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
    await pg.addInitScript(() => {
      let s = 12345; Math.random = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      window.__live = 0; addEventListener('sloth-stage-live', () => { window.__live = performance.now(); }, { once: true });
      for (let w = 1; w <= 11; w++) for (const k of ['w', 'm', 'g', 'n']) try { localStorage.setItem(`sloth_story_${k}${w}`, '1'); } catch {}
    });
    try {
      await pg.goto(base + `?autostart=1&level=${st}&layout=1`, { timeout: 120000 });
      await pg.waitForFunction(() => window.__gpu, null, { timeout: 60000 });
      await pg.evaluate(() => { window.__gpu.check.keepGpu = true; });
      await pg.waitForFunction(() => window.__live > 0, null, { timeout: 120000 });
      for (let i = 0; i < 8; i++) {
        await pg.touchscreen.tap(o.w / 2, o.h / 2).catch(() => {});
        await pg.waitForTimeout(600);
        if ((await pg.evaluate(() => window.__engine()?.mc?.phase ?? 'play')) !== 'card') break;
      }
      await pg.waitForTimeout(2500);
      const shot = async (force2d, file) => {
        const r = await pg.evaluate((f) => { window.__gpu.check.force2d = f; const e = window.__engine(); e.stop(); e.quality = 0; e.resizeCanvas(); e.introT = 99; e.applyZoom(); e.gameTime = 10;
          const n0 = window.__gpu.backdrop.copies; for (let i = 0; i < 40; i++) e.render(); return { url: e.canvas.toDataURL('image/png'), copies: window.__gpu.backdrop.copies - n0 }; }, force2d);
        fs.writeFileSync(file, Buffer.from(r.url.split(',')[1], 'base64'));
        return r.copies;
      };
      const tag = `${out}/${st}-${o.id}`;
      const c1 = await shot(false, `${tag}-gpu.png`);
      await shot(false, `${tag}-gpu2.png`);
      await shot(true, `${tag}-2d.png`);
      const noise = stats(`${tag}-gpu.png`, `${tag}-gpu2.png`, '-');
      const d = stats(`${tag}-gpu.png`, `${tag}-2d.png`, tag);
      const share32 = d.over32 / d.px, share8 = d.over8 / d.px;
      const fail = !c1 || noise.over8 || share32 > LIMIT_32 || share8 > LIMIT_8 || errs.length;
      if (fail) bad++;
      console.log(`${fail ? '✗' : '✓'} ${st} ${o.id}: GPU copies ${c1}/40; GPU frame stable (${noise.over8} px >8); vs 2D: >8 ${(100 * share8).toFixed(2)}%, >32 ${(100 * share32).toFixed(3)}%, max ${d.max}${errs.length ? ' PAGE ERRORS ' + errs.join(' | ') : ''}`);
    } catch (err) { console.log(`✗ ${st} ${o.id} COULD NOT RUN: ${err.message.split('\n')[0]}`); bad++; }
    await ctx.close();
  }
  console.log(bad ? `FAIL (${bad})` : 'PASS');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
