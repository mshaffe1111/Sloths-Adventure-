// before/after clips of the key story moments, with sound: node tools/story-delivery/clips.mjs <port> <outDir> <tag> [clip,clip] [--jobs N]
// Each clip opens its scene at a picture (?storyAt, a development build) and plays N pictures as a reader would. The game's own sound is
// caught where it leaves the page (every connection to the speakers also feeds a recorder) and laid under the video.
import { createRequire } from 'module';
import { mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { execFileSync } from 'child_process';
const { chromium } = createRequire(import.meta.url)('playwright');
const args = process.argv.slice(2);
const [port, out, tag] = args;
const only = args[3] && !args[3].startsWith('--') ? new Set(args[3].split(',')) : null;
const jobs = Number(args.includes('--jobs') ? args[args.indexOf('--jobs') + 1] : 2);
mkdirSync(out, { recursive: true });
export const CLIPS = [
  { key: 'kidnapping', screen: 'story_cutscene', id: '1-1', from: 19, n: 30 },
  { key: 'gap', screen: 'world_mid', id: '6-5', from: 0, n: 16 },
  { key: 'letgo', screen: 'ending_story', id: '10-10', from: 0, n: 7 },
  { key: 'reunion', screen: 'ending_story', id: '10-10', from: 19, n: 27 },
  { key: 'tea', screen: 'ending_story', id: '10-10', from: 92, n: 10 },
];
const work = CLIPS.filter((c) => !only || only.has(c.key)).flatMap((c) => (process.env.ORIENT ?? 'up,side').split(',').map((o) => ({ c, o })));
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
async function one({ c, o }) {
  const [w, h] = o === 'up' ? [390, 844] : [844, 390];
  const ctx = await b.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: out, size: { width: w, height: h } } });
  const t0 = Date.now();
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.resolve();
    // every connection to the speakers also goes to a recorder
    const taps = new WeakMap();
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (dst, ...rest) {
      if (dst instanceof AudioDestinationNode) {
        let tap = taps.get(this.context);
        if (!tap) {
          tap = this.context.createMediaStreamDestination();
          taps.set(this.context, tap);
          window.__tap = tap;
        }
        connect.call(this, tap);
      }
      return connect.call(this, dst, ...rest);
    };
    window.__rec = () => {
      const chunks = [];
      const r = new MediaRecorder(window.__tap.stream, { mimeType: 'audio/webm' });
      r.ondataavailable = (e) => chunks.push(e.data);
      r.start(250);
      window.__stop = () => new Promise((res) => { r.onstop = async () => { const buf = await new Blob(chunks).arrayBuffer(); let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); res(btoa(s)); }; r.stop(); });
    };
  });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off&storyAt=${c.from}`, { timeout: 120000 });
  await p.waitForTimeout(3000);
  // (a tap wakes the sound, as on a phone)
  await p.mouse.click(4, 4);
  await p.waitForTimeout(800);
  await p.evaluate(() => window.__rec && window.__tap && window.__rec());
  const at = (Date.now() - t0) / 1000;
  await p.evaluate(([i, sc]) => window.__story(i, sc), [c.id, c.screen]);
  // (until the clip's last picture has been read: a long line now comes in pages, each a Next of its own, so pictures are counted, not taps)
  for (let taps = 0; taps < 200; taps++) {
    const len = await p.waitForFunction(() => {
      if (document.querySelector('.sp-card')) return false;
      const t = document.querySelector('.sp-text');
      if (!t) return false;
      const hid = t.querySelector('.opacity-0');
      return hid && hid.textContent === '' ? t.textContent.length + 1 : false;
    }, null, { timeout: 40000, polling: 100 }).then((r) => r.jsonValue()).catch(() => 40);
    await p.waitForTimeout(Math.min(4200, 1000 + 32 * len));
    const at = await p.evaluate(() => Number(document.querySelector('.sp-bar')?.getAttribute('aria-valuenow') ?? 0));
    const btn = await p.$('.sp-next');
    if (!btn || at >= c.from + c.n) break;
    await btn.click();
  }
  const audio = await p.evaluate(() => (window.__stop ? window.__stop() : null)).catch(() => null);
  const v = p.video();
  await ctx.close();
  const path = await v.path();
  const name = `${out}/${tag}-${c.key}-${o}.mp4`;
  if (audio) {
    const a = `${out}/${tag}-${c.key}-${o}.webm`;
    writeFileSync(a, Buffer.from(audio, 'base64'));
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', at.toFixed(2), '-i', path, '-i', a, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '28', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-shortest', name]);
    unlinkSync(a);
  } else {
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', at.toFixed(2), '-i', path, '-c:v', 'libx264', '-crf', '28', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', name]);
  }
  unlinkSync(path);
  console.log(name, audio ? 'with sound' : 'no sound');
}
const queue = [...work];
await Promise.all(Array.from({ length: jobs }, async () => { for (let j = queue.shift(); j; j = queue.shift()) await one(j).catch((e) => console.log(j.c.key, j.o, 'FAIL', e.message.split('\n')[0])); }));
await b.close();
