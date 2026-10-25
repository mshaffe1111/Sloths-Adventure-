import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 } });
await p.addInitScript(() => {
  const orig = CanvasRenderingContext2D.prototype.drawImage;
  window.__log = [];
  CanvasRenderingContext2D.prototype.drawImage = function (img, ...a) {
    if (img && img.src && /prowler/.test(img.src) && window.__log.length < 20) {
      const t = this.getTransform();
      window.__log.push({ src: img.src.split('/').pop(), a: a.map((v) => Math.round(v)), t: [t.a, t.b, t.c, t.d, t.e, t.f].map((v) => +v.toFixed(2)), alpha: this.globalAlpha, op: this.globalCompositeOperation, cw: this.canvas.width, ch: this.canvas.height });
    }
    return orig.call(this, img, ...a);
  };
});
await p.goto('http://127.0.0.1:4301/');
await p.waitForTimeout(2500);
await p.evaluate(() => window.__story('3-10', 'boss_defeat'));
await p.waitForTimeout(2500);
await p.mouse.click(600, 300);
await p.waitForTimeout(2500);
console.log(JSON.stringify(await p.evaluate(() => window.__log.slice(0, 6)), null, 0));
await b.close();
