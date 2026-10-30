// node tools/art/w5rebuild/startclip.mjs <port> <outDir> <stage> <up|side>: a video of a stage's first 9 s from the moment it is chosen
// (the card, the iris, the first frames of play), for checking that the painted backdrop is there from the first frame
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, id, o] = process.argv.slice(2);
const [w, h] = o === 'up' ? [390, 844] : [844, 390];
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, serviceWorkers: 'block', recordVideo: { dir: out, size: { width: w, height: h } } });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate((i) => window.__play(i, 1), id);
await p.waitForTimeout(9000);
const v = p.video();
await ctx.close();
fs.renameSync(await v.path(), `${out}/start-${id}-${o}.webm`);
await b.close();
