// hf-art-ground probe: node tools/art/hfground/probe.mjs <port> <stage> — lists the stage's platforms in the starting view (x, y, w, h,
// type, style, art) so a piece drawn on screen can be matched to its platform.
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, stage] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 } });
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate((i) => window.__play(i), stage);
await p.waitForTimeout(3000);
const out = await p.evaluate(() => {
  let e = window.__engine; if (typeof e === "function") e = e();
  const c = e.camera;
  return {
    cam: [c.x, c.y, c.viewportWidth, c.viewportHeight],
    dress: (e.proto?.dress ?? []).map((q) => q.n + "@" + Math.round(q.x) + "," + Math.round(q.b)),
    plats: e.platforms.filter((q) => q.x < c.x + c.viewportWidth + 200 && q.x + q.width > c.x - 200).map((q) => ({ id: q.id, x: Math.round(q.x), y: Math.round(q.y), w: Math.round(q.width), h: Math.round(q.height), type: q.type, style: q.style, art: q.art, push: !!q.push })),
  };
});
console.log(JSON.stringify(out, null, 0));
await b.close();
