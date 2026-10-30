// The A/B for Matt: node tools/music/ab.mjs <music dir> <out dir> <name> [seconds]
// Renders the same timeline twice, the old live orchestra and the new recorded loops (the game's own LoopPlayer), both through a game
// master, and writes <out>/<name>.live.mp3 and <out>/<name>.loop.mp3. The timeline: calm, then danger, then calm, then the exit (and the
// dark zone and a boss's phases where the piece has them), with the intensity moving as an animal comes and goes. (seam.py checks and
// writes the loop seams.)
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const [musicDir, outDir, name, secs = '90'] = process.argv.slice(2);
const SECS = Number(secs);
const manifest = JSON.parse(fs.readFileSync(path.join(musicDir, 'manifest.json'), 'utf8'));
const piece = manifest.pieces[name];
if (!piece) throw new Error('no piece ' + name);
fs.mkdirSync(outDir, { recursive: true });
const stems = Object.keys(piece.stems);
// the timeline
const ev = [{ t: 0, intensity: 0.45 }];
const boss = stems.includes('boss');
if (boss) {
  ev.push({ t: 0, state: { boss: 1 } }, { t: SECS * 0.33, state: { boss: 2 }, intensity: 0.75 }, { t: SECS * 0.66, state: { boss: 3 }, intensity: 0.95 });
} else {
  const q = SECS / 6;
  ev.push({ t: q, intensity: 0.75, state: { danger: 1 } }, { t: 2 * q, intensity: 0.45, state: { danger: 0 } });
  if (stems.includes('dark')) ev.push({ t: 3 * q, state: { dark: 1 } }, { t: 4 * q, state: { dark: 0 } });
  else ev.push({ t: 3 * q, state: { puzzle: 1 } }, { t: 4 * q, state: { puzzle: 0 } });
  ev.push({ t: 5 * q, state: { exit: 1 }, intensity: 0.6 });
}


function wav(f32, ch, rate) {
  const n = f32.length;
  const data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767))), i * 2);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * ch * 2, 28); h.writeUInt16LE(ch * 2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}
const mp3 = (f32, file) => {
  const w = file.replace(/\.mp3$/, '.wav');
  fs.writeFileSync(w, wav(f32, 2, 48000));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', w, '-codec:a', 'libmp3lame', '-b:a', '192k', file]);
  fs.unlinkSync(w);
};
const decode = (b64) => {
  const raw = Buffer.from(b64, 'base64');
  return new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
};

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
// (no hot reload and no file watching: an edit made while it runs must not reload the page mid-render)
const { createServer } = await import(path.resolve(REPO, 'node_modules/vite/dist/node/index.js'));
const vite = await createServer({ root: REPO, configFile: path.join(REPO, 'vite.config.ts'), logLevel: 'error', server: { port: 0, hmr: false, watch: null, fs: { strict: false } } });
await vite.listen();
const port = vite.httpServer.address().port;
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  // the recorded files are served by the dev server from wherever they are (vite's /@fs/)
  await page.goto(`http://localhost:${port}/tools/music/record.html`);
  await page.waitForFunction(() => document.getElementById('s')?.textContent === 'ready', null, { timeout: 180000 });
  const src = piece.source;
  const live = await page.evaluate((s) => window.renderLive(s), { seconds: SECS, music: { id: src.id, seed: src.seed, tempo: src.tempo, form: src.form, intensity: 0.45 }, events: ev });
  mp3(decode(live.data), path.join(outDir, `${name}.live.mp3`));
  const base = `/@fs${path.resolve(musicDir)}/`;
  const loop = await page.evaluate((s) => window.renderPlayer(s), { seconds: SECS, id: name, intensity: 0.45, events: ev, manifest, base });
  mp3(decode(loop.data), path.join(outDir, `${name}.loop.mp3`));
  console.log(name, 'A/B written');
} finally {
  await browser.close();
  await vite.close();
}
process.exit(0);
