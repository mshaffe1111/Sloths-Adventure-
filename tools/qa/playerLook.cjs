/**
 * The measured release: a PLAYER's picture is main's, pixel for pixel (the GPU backdrop off: no #ctest, not a QA build).
 *   node tools/qa/playerLook.cjs <dev url> <out dir> <tag> [stages] [port|land]
 *   node tools/qa/playerLook.cjs compare <out dir> <tagA> <tagB>
 * Shoot `before` on main's dev server and `after` on this branch's dev server with gpuBackdropOn() forced false for the run (a dev server
 * is a QA build, so the switch is on there: the run patches the switch, never the committed code). For each stage, orientation and
 * quality step (q0, q1, q2, pinned): Math.random seeded, the stage opened and played 3 s, frozen (engine stopped, intro over, game time
 * 10) and drawn 40 times, then the game canvas read twice (what moves on the real clock between the two reads is masked out).
 * compare: pixels that differ between the two tags, outside both tags' masks: must be 0 everywhere.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const { execFileSync } = require('child_process');
const args = process.argv.slice(2);

if (args[0] === 'compare') {
  const [, out, A, B] = args;
  const files = fs.readdirSync(out).filter((f) => f.startsWith(`${A}-`) && !f.includes('-again-'));
  let bad = 0;
  for (const f of files.sort()) {
    const key = f.slice(A.length + 1);
    const r = execFileSync('python3', ['-c', `
import sys
from PIL import Image, ImageChops
o = sys.argv[1]; A = sys.argv[2]; B = sys.argv[3]; k = sys.argv[4]
im = lambda n: Image.open(f'{o}/{n}').convert('RGB')
a, b = im(f'{A}-{k}'), im(f'{B}-{k}')
if a.size != b.size: print('size', a.size, b.size); sys.exit()
m = lambda x, y: ImageChops.difference(x, y).convert('L').point(lambda v: 255 if v else 0)
d = m(a, b)
d = ImageChops.subtract(d, m(a, im(f'{A}-again-{k}')))
d = ImageChops.subtract(d, m(b, im(f'{B}-again-{k}')))
print(sum(1 for v in d.get_flattened_data() if v))`, out, A, B, key]).toString().trim();
    console.log(`${key.replace('.png', '')}: ${r} px differ`);
    if (r !== '0') bad++;
  }
  console.log(files.length ? (bad ? `FAIL (${bad} of ${files.length})` : `PASS (${files.length} frames, 0 px)`) : 'FAIL: no frames');
  process.exit(bad || !files.length ? 1 : 0);
}

const [base, out, tag, stagesArg, oArg] = args;
const STAGES = (stagesArg || '1-1,2-1,3-1,4-1,5-1,6-1,7-1,8-1,9-1,10-1,5-M').split(',');
const OR = [{ id: 'port', w: 412, h: 915 }, { id: 'land', w: 915, h: 412 }].filter((o) => !oArg || o.id === oArg);
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const o of OR) for (const st of STAGES) {
    const ctx = await b.newContext({ viewport: { width: o.w, height: o.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.addInitScript(() => {
      let s = 12345; Math.random = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      Element.prototype.requestFullscreen = function () { return Promise.resolve(); };
      window.__live = 0; addEventListener('sloth-stage-live', () => { window.__live = 1; }, { once: true });
      for (let w = 1; w <= 11; w++) for (const k of ['w', 'm', 'g', 'n']) try { localStorage.setItem(`sloth_story_${k}${w}`, '1'); } catch {}
    });
    try {
      await pg.goto(base + `?autostart=1&level=${st}&layout=1`, { timeout: 120000 });
      await pg.waitForFunction(() => window.__live, null, { timeout: 120000 });
      for (let i = 0; i < 8; i++) {
        await pg.touchscreen.tap(o.w / 2, o.h / 2).catch(() => {});
        await pg.waitForTimeout(700);
        const ph = await pg.evaluate(() => window.__engine()?.mc?.phase ?? 'play');
        if (ph !== 'card') break;
      }
      await pg.waitForTimeout(2500);
      const gpu = await pg.evaluate(() => (window.__gpu ? { live: window.__gpu.live(), copies: window.__gpu.backdrop.copies } : null));
      let line = `${tag} ${st} ${o.id}${gpu ? ` (GPU layer started: ${gpu.live}, copies ${gpu.copies})` : ''}`;
      for (const q of [0, 1, 2]) {
        const shot = async (name) => {
          const url = await pg.evaluate((qq) => { const e = window.__engine(); e.stop(); e.quality = qq; e.resizeCanvas(); e.introT = 99; e.applyZoom(); e.gameTime = 10; for (let i = 0; i < 40; i++) e.render(); return e.canvas.toDataURL('image/png'); }, q);
          fs.writeFileSync(`${out}/${name}`, Buffer.from(url.split(',')[1], 'base64'));
        };
        await shot(`${tag}-${st}-${o.id}-q${q}.png`);
        await pg.waitForTimeout(300);
        await shot(`${tag}-again-${st}-${o.id}-q${q}.png`);
      }
      if (errs.length) { line += ` PAGE ERRORS: ${errs.join(' | ')}`; bad++; }
      console.log(line);
    } catch (err) { console.log(`${tag} ${st} ${o.id} COULD NOT RUN: ${err.message.split('\n')[0]}`); bad++; }
    await ctx.close();
  }
  console.log(bad ? `FAIL (${bad})` : 'SHOT');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
