// A short video of a story panel, upright 390x844 and sideways 844x390 (hf-cutscenes: the moving plates): screenshots as fast as
// the page gives them for `seconds`, each held for its real time, joined by ffmpeg into <outDir>/<tag>-up.mp4 and -side.mp4
// node tools/art/hfstory/recstory.mjs <port> <outDir> <tag> <screen> <stage or memory id> <panel> [seconds]   (TAP=0: no title card)
import { createRequire } from 'module';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, tag, scr, id, n, secs = '5'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [o, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const dir = `${out}/.f-${tag}-${o}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off&storyAt=${n}`);
  await p.waitForTimeout(3000);
  await p.evaluate(([i, s]) => (s === 'memory' ? window.__memory(i) : window.__story(i, s)), [id, scr]);
  await p.waitForTimeout(3000);
  if (process.env.TAP !== '0') await p.mouse.click(w / 2, h * 0.3);
  await p.waitForTimeout(2500);
  const list = [];
  const t0 = Date.now();
  let k = 0;
  while (Date.now() - t0 < +secs * 1000) {
    const f = `${dir}/${String(k++).padStart(4, '0')}.jpg`;
    await p.screenshot({ path: f, type: 'jpeg', quality: 70, animations: "allow", caret: "initial" });
    list.push([f, Date.now()]);
  }
  const lines = list.map(([f, t], i) => `file '${f}'\nduration ${(((list[i + 1]?.[1] ?? t + 100) - t) / 1000).toFixed(3)}`);
  writeFileSync(`${dir}/list.txt`, lines.join('\n') + `\nfile '${list.at(-1)[0]}'\n`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${dir}/list.txt`, '-vf', 'fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p', `${out}/${tag}-${o}.mp4`]);
  console.log(tag, o, list.length, 'frames');
  rmSync(dir, { recursive: true });
  await p.close();
}
await b.close();
