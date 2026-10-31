// Walk the whole of 8-4 Lantern Run (src/game/w8Lantern.ts), upright 390 x 844 and sideways 844 x 390: Pokey stood on the bough every half
// screen from the start to the shrine, a frame at each, and a contact sheet per orientation (python3 + PIL make the sheet):
//   npx vite --port 4301 &   then   node tools/art/walk-8-4.mjs <out dir> [port] [playwright module path] [jar level]
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const pw = await import(process.argv[4] ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const out = process.argv[2] ?? 'reference/prop-sheets/qa-notes/8-4-build/walk';
const port = process.argv[3] ?? '4301';
const level = Number(process.argv[5] ?? 0.7);
mkdirSync(out, { recursive: true });
const SIZES = { sideways: [844, 390], upright: [390, 844] };
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('8-4', 1));
  await p.waitForTimeout(3500);
  await p.mouse.click(w / 2, h / 2);
  await p.waitForTimeout(800);
  const { W, step } = await p.evaluate(() => {
    const e = window.__engine();
    return { W: e.currentStage.config.levelWidth, step: Math.round(e.camera.viewportWidth / 2) };
  });
  let n = 0;
  for (let x = 200; x < W - 100; x += step, n++) {
    await p.evaluate(([x, level]) => {
      const e = window.__engine();
      let top = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
      if (!top) top = e.platforms.filter((q) => q.x + q.width < x).sort((a, c) => c.x + c.width - (a.x + a.width))[0];
      const px = Math.max(top.x + 20, Math.min(top.x + top.width - 20, x));
      Object.assign(e.player, { x: px, y: top.y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1, invincibleTimer: 99 });
      e.lanternRun.st.level = level;
      e.lanternRun.st.target = 0;
      e.camCut = true;
    }, [x, level]);
    await p.waitForTimeout(450);
    await p.screenshot({ path: `${out}/${size}-${String(n).padStart(3, '0')}.jpg`, quality: 70, type: 'jpeg' });
  }
  console.log(size, n, 'frames');
  await ctx.close();
}
await b.close();
// the contact sheets
execFileSync('python3', ['-c', `
import glob
from PIL import Image
for size, (w, h), cols in (('sideways', (844, 390), 6), ('upright', (390, 844), 12)):
    fs = sorted(glob.glob('${out}/' + size + '-*.jpg'))
    k = 0.3
    tw, th = int(w * k), int(h * k)
    rows = (len(fs) + cols - 1) // cols
    S = Image.new('RGB', (cols * (tw + 4), rows * (th + 4)), (0, 0, 0))
    for i, f in enumerate(fs):
        S.paste(Image.open(f).resize((tw, th)), ((i % cols) * (tw + 4), (i // cols) * (th + 4)))
    S.save('${out}/contact-' + size + '.jpg', quality=80)
    print(size, len(fs), S.size)
`], { stdio: 'inherit' });
