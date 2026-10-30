// polish-sfx: render a mix spec (JSON) to a stereo WAV through tools/audio/sfxv1/render/ in Chromium.
//   node tools/audio/sfxv1/render.mjs <port> <spec.json> <out.wav>
// spec: { dur, amb?, events: [{t, fx, arg} | {t, file, gain, rate, pan}], bed?: {file, gain} } (files are read here and handed over)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, specPath, outPath] = process.argv.slice(2);
// a list of specs renders each to <outPath without .wav>_<n>.wav in one browser
const specs = [].concat(JSON.parse(fs.readFileSync(specPath, 'utf8')));
const many = Array.isArray(JSON.parse(fs.readFileSync(specPath, 'utf8')));
const b = await chromium.launch();
const p = await b.newPage();
p.on('pageerror', (e) => console.log('PAGE', String(e)));
const open = async () => {
  for (let tries = 0; ; tries++) {
    try {
      await p.goto(`http://127.0.0.1:${port}/tools/audio/sfxv1/render/index.html`);
      await p.waitForFunction(() => window.ready, null, { timeout: 120000 });
      return;
    } catch (e) {
      // (the dev server's own reload can interrupt this one)
      if (tries >= 3 || !/interrupted|destroyed|navigation/i.test(String(e))) throw e;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};
await open();
// (the dev server's dependency optimizer can reload the page mid-run: open it again and redo that one render)
const evaluate = async (o) => {
  for (let tries = 0; ; tries++) {
    try {
      return await p.evaluate((x) => window.renderMix(x), o);
    } catch (e) {
      if (tries >= 2 || !/context was destroyed|navigation/i.test(String(e))) throw e;
      await open();
    }
  }
};
for (let si = 0; si < specs.length; si++) {
const spec = specs[si];
const out = many ? outPath.replace(/\.wav$/, `_${si}.wav`) : outPath;
const files = [];
const idx = (f) => { let i = files.indexOf(f); if (i < 0) { files.push(f); i = files.length - 1; } return i; };
const events = spec.events.map((e) => (e.file ? { t: e.t, buf: idx(e.file), gain: e.gain, rate: e.rate, pan: e.pan } : e));
const bed = spec.bed ? { buf: idx(spec.bed.file), gain: spec.bed.gain } : undefined;
const bufs = files.map((f) => fs.readFileSync(f).toString('base64'));
const r = await evaluate({ events, dur: spec.dur, amb: spec.amb, bufs, bed });
const L = new Float32Array(Buffer.from(r.l, 'base64').buffer.slice(0));
const R = new Float32Array(Buffer.from(r.r, 'base64').buffer.slice(0));
// 16-bit stereo WAV at 48 kHz
const n = L.length, data = Buffer.alloc(44 + n * 4);
data.write('RIFF', 0); data.writeUInt32LE(36 + n * 4, 4); data.write('WAVEfmt ', 8); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20);
data.writeUInt16LE(2, 22); data.writeUInt32LE(48000, 24); data.writeUInt32LE(48000 * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
data.write('data', 36); data.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) {
  data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
  data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
}
fs.writeFileSync(out, data);
console.log('wrote', out, n / 48000, 's', 'old effects played:', r.played);
}
await b.close();
