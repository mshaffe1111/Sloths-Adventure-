// Renders audio previews offline: node tools/audio/render.mjs <specs.json> <out dir>
// specs.json: { "name": PreviewSpec, ... } (see preview.ts). Writes <out>/<name>.mp3 (and .wav when KEEP_WAV=1).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [specPath, outDir] = process.argv.slice(2);
const specs = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
fs.mkdirSync(outDir, { recursive: true });
const port = 5300 + Math.floor(Math.random() * 500);
const vite = spawn('node_modules/.bin/vite', [ '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
try {
  const page = await browser.newPage();
  page.on('console', (m) => m.type() === 'error' && console.error('page:', m.text()));
  await page.goto(`http://localhost:${port}/tools/audio/preview.html`);
  await page.waitForFunction(() => document.getElementById('s')?.textContent === 'ready', null, { timeout: 120000 });
  for (const [name, spec] of Object.entries(specs)) {
    if (only && !only.has(name)) continue;
    const res = await page.evaluate((s) => window.renderPreview(s), spec);
    const l = Buffer.from(res.l, 'base64');
    const r = Buffer.from(res.r, 'base64');
    const n = l.length / 2;
    const data = Buffer.alloc(n * 4);
    for (let i = 0; i < n; i++) {
      data.writeInt16LE(l.readInt16LE(i * 2), i * 4);
      data.writeInt16LE(r.readInt16LE(i * 2), i * 4 + 2);
    }
    const hdr = Buffer.alloc(44);
    hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12);
    hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22); hdr.writeUInt32LE(44100, 24);
    hdr.writeUInt32LE(44100 * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(data.length, 40);
    const wav = path.join(outDir, `${name}.wav`);
    fs.writeFileSync(wav, Buffer.concat([hdr, data]));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '160k', path.join(outDir, `${name}.mp3`)]);
    if (!process.env.KEEP_WAV) fs.unlinkSync(wav);
    console.log(name, `${spec.seconds}s rendered in ${Math.round(res.perf.renderMs)} ms`);
    if (res.chunks?.some((c) => c.chunks.length)) fs.writeFileSync(path.join(outDir, `${name}.chunks.json`), JSON.stringify(res.chunks));
  }
} finally {
  await browser.close();
  vite.kill();
  process.exit(0);
}
