/**
 * Same look with the GPU layer (GPU-RENDERER-PLAN stage 0): node tools/qa/gpuLook.cjs <dev url> <out dir> <tag> [stages] [port|land]
 * For each stage and orientation: Math.random seeded, the stage opened, played 3 s, then frozen (engine stopped, intro over, a fixed game
 * time) and drawn once. Saves <tag>-<stage>-<o>.png. With tag 'after', it also draws the same frozen frame with the GPU canvas taken out of
 * the page, and with it forced visible, and prints how many pixels differ (must be 0). Dev server (window.__engine).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const { execFileSync } = require('child_process');
const [base, out, tag, stagesArg, oArg] = process.argv.slice(2);
const STAGES = (stagesArg || '1-1,2-1,3-1,4-1,5-1,6-1,7-1,8-1,9-1,10-1,5-M').split(',');
const OR = [{ id: 'port', w: 412, h: 915 }, { id: 'land', w: 915, h: 412 }].filter((o) => !oArg || o.id === oArg);
fs.mkdirSync(out, { recursive: true });
// pixels that differ between a and b, leaving out those that differ between a and `noise` (the same frame shot twice: what moves on the
// real clock by itself, a pickup's ring)
const diff = (a, b, noise) => execFileSync('python3', ['-c', `
import sys
from PIL import Image, ImageChops
a = Image.open(sys.argv[1]).convert('RGB'); b = Image.open(sys.argv[2]).convert('RGB')
if a.size != b.size: print('size', a.size, b.size); sys.exit()
d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v else 0)
if len(sys.argv) > 3:
  n = ImageChops.difference(a, Image.open(sys.argv[3]).convert('RGB')).convert('L').point(lambda v: 255 if v else 0)
  d = ImageChops.subtract(d, n)
print(sum(1 for v in d.get_flattened_data() if v))`, a, b, ...(noise ? [noise] : [])]).toString().trim();
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
      window.__live = 0; addEventListener('sloth-stage-live', () => { window.__live = performance.now(); }, { once: true });
      for (let w = 1; w <= 11; w++) for (const k of ['w', 'm', 'g', 'n']) try { localStorage.setItem(`sloth_story_${k}${w}`, '1'); } catch {}
    });
    try {
      await pg.goto(base + `?autostart=1&level=${st}&layout=1`, { timeout: 120000 });
      await pg.waitForFunction(() => window.__live > 0, null, { timeout: 120000 });
      // (5-M opens on its own card: tapped until the stage is under way)
      for (let i = 0; i < 8; i++) {
        await pg.touchscreen.tap(o.w / 2, o.h / 2).catch(() => {});
        await pg.waitForTimeout(700);
        const ph = await pg.evaluate(() => { const g = window.__engine; const e = typeof g === 'function' ? g() : g; return e?.mc?.phase ?? 'play'; });
        if (ph !== 'card') break;
      }
      await pg.waitForTimeout(2500);
      const E = `(() => { const g = window.__engine; return typeof g === 'function' ? g() : g; })()`;
      // (only the canvases are judged: the DOM over them, Dot's bubble and the hints, moves on its own clock)
      await pg.addStyleTag({ content: 'body *:not(canvas) { visibility: hidden !important; }' });
      await pg.evaluate(() => { const g = [...document.querySelectorAll('canvas')].find((c) => c.style.touchAction === 'none'); g.style.visibility = 'visible'; });
      const freeze = `(() => { const e = ${E}; e.stop(); e.introT = 99; e.applyZoom(); e.gameTime = 10; for (let i = 0; i < 40; i++) e.render(); return true; })()`;
      await pg.evaluate(freeze);
      await pg.waitForTimeout(250);
      const f = `${out}/${tag}-${st}-${o.id}.png`;
      await pg.screenshot({ path: f, animations: 'disabled' });
      await pg.evaluate(`(() => { const e = ${E}; for (let i = 0; i < 5; i++) e.render(); })()`); await pg.waitForTimeout(250); await pg.screenshot({ path: `${out}/${tag}-again-${st}-${o.id}.png`, animations: 'disabled' }); const noise = `${out}/${tag}-again-${st}-${o.id}.png`; const self = diff(f, noise);
      let line = `${tag} ${st} ${o.id}`;
      if (tag === 'after') {
        const info = await pg.evaluate(() => ({ live: !!window.__gpu?.live(), drawn: window.__gpu?.stats.drawn }));
        await pg.evaluate(`(() => { const c = document.querySelectorAll('canvas')[0]; c.style.visibility = 'visible'; const e = ${E}; for (let i = 0; i < 5; i++) e.render(); })()`);
        await pg.waitForTimeout(250);
        await pg.screenshot({ path: `${out}/vis-${st}-${o.id}.png`, animations: 'disabled' });
        await pg.evaluate(`(() => { const c = document.querySelectorAll('canvas')[0]; c.remove(); const e = ${E}; for (let i = 0; i < 5; i++) e.render(); })()`);
        await pg.waitForTimeout(250);
        await pg.screenshot({ path: `${out}/gone-${st}-${o.id}.png`, animations: 'disabled' });
        const d1 = diff(f, `${out}/gone-${st}-${o.id}.png`, noise), d2 = diff(f, `${out}/vis-${st}-${o.id}.png`, noise);
        line += ` (moves by itself between two shots: ${self} px, left out)`;
        line += ` layer started ${info.live} (it starts only when something is put on it), GPU frames ${info.drawn}; px differing vs layer removed: ${d1}; vs layer forced visible: ${d2}`;
        if (d1 !== '0' || d2 !== '0') bad++;
      }
      if (errs.length) { line += ` PAGE ERRORS: ${errs.join(' | ')}`; bad++; }
      console.log(line);
    } catch (err) { console.log(`${tag} ${st} ${o.id} COULD NOT RUN: ${err.message.split('\n')[0]}`); bad++; }
    await ctx.close();
  }
  console.log(bad ? `FAIL (${bad})` : 'PASS');
  await b.close();
  process.exit(bad ? 1 : 0);
})();
