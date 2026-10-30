// records story scenes as they play, upright (390x844) and sideways (844x390), as a reader would: each line typed out, then held for
// a reading time, then Next. node tools/story-delivery/record.mjs <port> <outDir> [key,key,...] [--jobs N]
// (Playwright video has no sound: the voices are heard on the sample page. Serve a development build (`NODE_ENV=development npx vite
// build --mode development`, any static server): the dev server is too heavy for several recorders at once)
import { createRequire } from 'module';
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'fs';
import { execFileSync } from 'child_process';
const { chromium } = createRequire(import.meta.url)('playwright');
const args = process.argv.slice(2);
const [port, out] = args;
const only = args[2] && !args[2].startsWith('--') ? new Set(args[2].split(',')) : null;
const jobs = Number(args[args.indexOf('--jobs') + 1] || 4);
const orient = (process.env.ORIENT ?? 'up,side').split(',');
mkdirSync(out, { recursive: true });
const scenes = JSON.parse(readFileSync(new URL('./scenes.json', import.meta.url))).filter((s) => !only || only.has(s.key));
// (a video already made is kept: run it again to fill in any that failed)
const work = scenes.flatMap((s) => orient.map((o) => ({ s, o }))).filter(({ s, o }) => !existsSync(`${out}/${s.key}-${o}.mp4`));
const b = await chromium.launch();
async function one({ s, o }) {
  const [w, h] = o === 'up' ? [390, 844] : [844, 390];
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, recordVideo: { dir: out, size: { width: w, height: h } } });
  const p = await ctx.newPage();
  // (the first tap asks for full screen, which in a headless browser shrinks the recorded picture)
  await p.addInitScript(() => { Element.prototype.requestFullscreen = () => Promise.resolve(); });
  p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log(s.key, 'ERR', e.message); });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 120000 });
  await p.waitForTimeout(2500);
  const t0 = Date.now();
  await p.evaluate(([i, sc]) => (sc === 'memory' ? window.__memory(i) : window.__story(i, sc)), [s.open.id, s.open.screen]);
  for (let k = 0; k < s.n; k++) {
    // the title card goes by itself; then wait for the line to finish typing (no hidden letters left), then read it
    const len = await p.waitForFunction(() => {
      if (document.querySelector('.sp-card')) return false;
      const t = document.querySelector('.sp-text');
      if (!t) return false;
      const hid = t.querySelector('.opacity-0');
      return hid && hid.textContent === '' ? t.textContent.length + 1 : false;
    }, null, { timeout: 30000, polling: 100 }).then((r) => r.jsonValue()).catch(() => 40);
    await p.waitForTimeout(Math.min(4200, 900 + 32 * len));
    const btn = await p.$('.sp-next');
    if (!btn) break;
    if (k < s.n - 1) await btn.click();
  }
  const secs = Math.round((Date.now() - t0) / 1000);
  const v = p.video();
  await ctx.close();
  const path = await v.path();
  // (small mp4s: the first 2.5 s, the game loading, cut off)
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', '2.6', '-i', path, '-c:v', 'libx264', '-crf', '30', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', `${out}/${s.key}-${o}.mp4`]);
  unlinkSync(path);
  console.log(`${s.key}-${o} ${s.n} panels ${secs}s`);
}
const queue = [...work];
await Promise.all(Array.from({ length: jobs }, async () => { for (let j = queue.shift(); j; j = queue.shift()) await one(j).catch((e) => console.log(j.s.key, j.o, 'FAIL', e.message)); }));
await b.close();
