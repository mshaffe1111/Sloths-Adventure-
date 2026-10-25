import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://127.0.0.1:4301/');
await p.waitForTimeout(2000);
const r = await p.evaluate(async () => {
  const m = await import('/src/game/bossArt.ts');
  const out = {};
  for (let k = 0; k < 2; k++) {
    for (const [angry, beaten] of [[false, false], [true, false], [false, true]]) {
      const c = document.createElement('canvas'); c.width = 800; c.height = 600;
      const ctx = c.getContext('2d');
      ctx.translate(400, 450);
      const ok = m.drawPaintedCardBoss(ctx, 3, angry, beaten);
      const d = ctx.getImageData(0, 0, 800, 600).data;
      let n = 0, minx = 9999, maxx = -1, miny = 9999, maxy = -1;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 20) { n++; const x = ((i - 3) / 4) % 800, y = Math.floor((i - 3) / 4 / 800); minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
      out[`${k}-${angry}-${beaten}`] = { ok, n, box: [minx, miny, maxx, maxy] };
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
