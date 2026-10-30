// every story picture as the phone shows it (2026-10-29, Matt: the cutscenes "stretched, generic, softer than the gameplay"): each panel
// of each story, upright 390x844 and sideways 844x390 at pixel ratio 3, with how many screen pixels every character picture is drawn per
// pixel of its own painting (the page's drawImage is watched), for audit.py to flag
// node tools/art/storyart/audit.mjs <port> <outDir> <groups.txt> <worker> <workers>
//   groups.txt: "<tag> <screen> <stage or memory id> <panels>" per line (touch screens: narrated-only panels are skipped)
import { createRequire } from 'module';
import { mkdirSync, readFileSync, appendFileSync } from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, list, wi = '0', wn = '1'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const groups = readFileSync(list, 'utf8').trim().split('\n').map((l) => l.split(' ')).filter((_, i) => i % +wn === +wi);
const WATCH = () => {
  const keep = /cels-|story\/hd\/|enemies\/|characters\/|bosses\//;
  const orig = CanvasRenderingContext2D.prototype.drawImage;
  window.__mag = {};
  CanvasRenderingContext2D.prototype.drawImage = function (im, ...a) {
    if (a.length === 8 && im && im.src && keep.test(im.src)) {
      const m = this.getTransform();
      const [sx, sy, sw, sh, , , dw, dh] = a;
      const mag = (Math.hypot(m.a, m.b) * Math.abs(dw)) / Math.max(1, sw);
      const k = `${im.src.split('/').pop().split('?')[0]}|${Math.round(sx)}|${Math.round(sy)}|${Math.round(sw)}|${Math.round(sh)}`;
      const px = Math.hypot(m.c, m.d) * Math.abs(dh);
      const o = window.__mag[k];
      if (!o || o.mag < mag) window.__mag[k] = { mag, px };
    }
    return orig.call(this, im, ...a);
  };
};
const b = await chromium.launch();
for (const [o, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  await p.addInitScript(WATCH);
  p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off&storyAt=0`);
  await p.waitForTimeout(3000);
  for (const [tag, scr, id, count] of groups) {
    for (let n = 0; n < +count; n++) {
      await p.evaluate(([n]) => { history.replaceState(null, '', `/?lessons=off&storyAt=${n}`); window.__story('1-1', 'world_map'); }, [n]);
      await p.waitForTimeout(120);
      await p.evaluate(([i, s]) => { window.__mag = {}; s === 'memory' ? window.__memory(i) : window.__story(i, s); }, [id, scr]);
      await p.waitForTimeout(+(process.env.WAIT ?? 1700));
      const f = `${tag}-${String(n).padStart(3, '0')}-${o}`;
      await p.screenshot({ path: `${out}/${f}.jpg`, type: 'jpeg', quality: 72 });
      const mag = await p.evaluate(() => window.__mag);
      const text = await p.evaluate(() => [...document.querySelectorAll('p, .sp-text, [class*=text]')].map((e) => e.textContent).join(' ').slice(0, 400));
      appendFileSync(`${out}/log-${wi}.jsonl`, JSON.stringify({ f, tag, n, o, mag, text }) + '\n');
    }
    console.log('done', tag, o);
  }
  await p.close();
}
await b.close();
