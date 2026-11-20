// ART-W2B perf: time one wheel's draw (wheelDraw.ts drawWheel, the painted path, its sheet loaded) against ENG-26's placeholder shapes
// (1 save/restore, 2 arcs, 1 spoke path, 4N fillRects, replicated here as it was), in Chromium on a 915x412 canvas at 2x, R180 N6, a
// whole turn of bucket positions, 3000 draws each; and, for scale, one full-screen opaque drawImage (a backdrop layer: every frame
// draws several). Headless Chromium paints canvas in SOFTWARE (SwiftShader): the absolute ms are far over a phone's GPU canvas, so read
// the RATIO to a full-screen layer. CPU throttle: argv[3] (default 1). Prints ms per wheel per frame.
//   node reference/qa-reports/ART-W2B/perf.mjs <dev port> [cpu throttle]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const [port, thr = '1'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage();
const cdp = await p.context().newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(thr) });
await p.goto(`http://127.0.0.1:${port}/`, { timeout: 300000 });
const r = await p.evaluate(async () => {
  const D = await import('/src/game/wheelDraw.ts');
  const Wm = await import('/src/game/wheel.ts');
  while (!D.w2WheelReady()) await new Promise((res) => setTimeout(res, 50));
  const c = document.createElement('canvas'); c.width = 1830; c.height = 824;
  const ctx = c.getContext('2d'); ctx.scale(2, 2); ctx.translate(-300, -500);
  const w = { cx: 600, cy: 800, R: 180, N: 6, W: 120, V: 70, way: 1 };
  const seen = () => true;
  const frames = Array.from({ length: 60 }, (_, k) => Array.from({ length: 6 }, (_, i) => ({ id: i, ...Wm.bucketAt(w, i, k * 0.27), width: 120, height: 16 })));
  const old = (bs) => { // ENG-26's placeholder, as it was (fa8a92bf wheelDraw.ts)
    ctx.save(); ctx.strokeStyle = '#4a3322'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(w.cx, w.cy, w.R, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 7; ctx.beginPath(); for (const q of bs) { ctx.moveTo(w.cx, w.cy); ctx.lineTo(q.x + q.width / 2, q.y); } ctx.stroke();
    ctx.fillStyle = '#2f2015'; ctx.beginPath(); ctx.arc(w.cx, w.cy, 16, 0, Math.PI * 2); ctx.fill();
    for (const q of bs) { ctx.fillStyle = '#7a5532'; ctx.fillRect(q.x, q.y - 34, q.width, 34); ctx.fillStyle = '#5b3d22'; ctx.fillRect(q.x, q.y, q.width, q.height); ctx.fillRect(q.x, q.y - 34, 8, 34); ctx.fillRect(q.x + q.width - 8, q.y - 34, 8, 34); }
    ctx.restore();
  };
  const time = (fn) => {
    for (let i = 0; i < 300; i++) fn(frames[i % 60]); // warm up
    ctx.getImageData(0, 0, 1, 1);
    const t0 = performance.now();
    for (let i = 0; i < 3000; i++) fn(frames[i % 60]);
    ctx.getImageData(0, 0, 1, 1); // flush
    return (performance.now() - t0) / 3000;
  };
  const bg = document.createElement('canvas'); bg.width = 1830; bg.height = 824; const g = bg.getContext('2d'); g.fillStyle = '#5a4030'; g.fillRect(0, 0, 1830, 824);
  const screen = () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0); ctx.restore(); };
  return { painted: time((bs) => D.drawWheel(ctx, w, bs, seen)), placeholder: time(old), fullScreenLayer: time(screen) };
});
console.log(`PERF ms per wheel per frame (CPU x${thr}, software canvas):`, JSON.stringify({ painted: +r.painted.toFixed(4), placeholder: +r.placeholder.toFixed(4), fullScreenLayer: +r.fullScreenLayer.toFixed(4), paintedInScreens: +(r.painted / r.fullScreenLayer).toFixed(2) }));
await b.close();
