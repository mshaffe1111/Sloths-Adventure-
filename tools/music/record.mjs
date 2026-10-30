// The music recorder: node tools/music/record.mjs <pieces.json> [out dir]
// pieces.json: { "<name>": { "spec": PieceSpec, "stems": ["bed", "beat", ...] }, ... } (see record.ts and src/audio/loops.ts).
// Writes <out>/<name>.<stem>.webm (Opus) and merges every piece into <out>/manifest.json. ONLY=a,b records only those.
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const [listPath, outDir = 'src/assets/music'] = process.argv.slice(2);
// (pieces.ts writes { pieces, stages }; a bare { name: entry } list works too)
const listFile = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const list = listFile.pieces ?? listFile;
const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
const RATE = 48000;
/** guard either side of the loop in each file (seconds): longer than any decoder's start delay */
const GUARD = 0.25;
/** Opus bit rates: the stems that carry the piece get more than the layers */
const KBPS = { mix: 80, bed: 64, beat: 64, top: 64, drive: 48, shine: 48, dark: 40, boss: 48 };
const ROLES = {
  mix: ['lead', 'counter', 'perc', 'low', 'bed', 'stab', 'color'], bed: ['bed', 'low'], beat: ['perc', 'stab'], top: ['lead', 'counter', 'color'],
  drive: ['drive'], shine: ['shine'], dark: ['dark'], boss: ['boss'],
};
fs.mkdirSync(outDir, { recursive: true });
const manPath = path.join(outDir, 'manifest.json');
const manifest = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : { pieces: {}, stages: {} };
if (listFile.stages) manifest.stages = listFile.stages;

export function wav(f32, ch, rate) {
  const n = f32.length;
  const data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767))), i * 2);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * ch * 2, 28); h.writeUInt16LE(ch * 2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

// (no hot reload and no file watching: an edit made while it runs must not reload the page mid-render)
const { createServer } = await import(path.resolve(REPO, 'node_modules/vite/dist/node/index.js'));
const vite = await createServer({ root: REPO, configFile: path.join(REPO, 'vite.config.ts'), logLevel: 'error', server: { port: 0, hmr: false, watch: null } });
await vite.listen();
const port = vite.httpServer.address().port;
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const tmp = fs.mkdtempSync('/tmp/music-rec-');
try {
  const names = Object.keys(list).filter((n) => !only || only.has(n));
  // a few pages at once: each render runs on its own audio thread
  const workers = Math.max(1, Number(process.env.JOBS ?? 3));
  const one = async (page, name) => {
    const { spec, stems: want } = list[name];
    const t0 = Date.now();
    const roles = Object.fromEntries(want.map((s) => [s, ROLES[s]]));
    const res = await page.evaluate(([s, r]) => window.recordPiece(s, r), [spec, roles]);
    const p = res.plan;
    const files = {};
    // (the music before the master can peak over full scale: the files are scaled under it, and the player scales them back by `level`)
    const scale = Math.min(1, 0.97 / Math.max(...Object.values(res.peaks)));
    for (const stem of want) {
      // (a stem with nothing in it, as a piece with no drums has no beat: not written, and the player has nothing to decode)
      if (res.peaks[stem] < 0.002) continue;
      const raw = Buffer.from(res.stems[stem], 'base64');
      const f = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
      if (scale < 1) for (let i = 0; i < f.length; i++) f[i] *= scale;
      const n = f.length / 2;
      const g = Math.round(GUARD * RATE);
      // the guard: the end of the loop before it, its start after it (one period wherever the decoder starts)
      const full = new Float32Array((n + 2 * g) * 2);
      full.set(f.subarray((n - g) * 2), 0);
      full.set(f, g * 2);
      full.set(f.subarray(0, g * 2), (n + g) * 2);
      const w = path.join(tmp, `${name}.${stem}.wav`);
      fs.writeFileSync(w, wav(full, 2, RATE));
      if (process.env.KEEP_WAV) fs.writeFileSync(path.join(process.env.KEEP_WAV, `${name}.${stem}.loop.wav`), wav(f, 2, RATE));
      const file = `${name}.${stem}.webm`;
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', w, '-c:a', 'libopus', '-b:a', `${KBPS[stem]}k`, '-vbr', 'on', '-application', 'audio', path.join(outDir, file)]);
      fs.unlinkSync(w);
      files[stem] = file;
    }
    manifest.pieces[name] = {
      stems: files, guard: GUARD, length: Math.round(p.length * RATE) / RATE, bars: p.bars, beat: p.beat, stepsPerBar: p.stepsPerBar,
      key: p.key, intensity: spec.intensity ?? 0.55, level: Math.round((1 / scale) * 1e4) / 1e4, source: { id: spec.id, seed: spec.seed ?? 0, tempo: spec.tempo ?? 1, form: !!spec.form }, sections: p.sections,
    };
    fs.writeFileSync(manPath, JSON.stringify(manifest, null, 1) + '\n');
    const peak = Math.max(...Object.values(res.peaks));
    console.log(`${name}: ${p.length.toFixed(1)} s loop, ${p.bars} bars, ${Object.keys(files).length} stems, peak ${peak.toFixed(2)}, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  };
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(workers, names.length) }, async () => {
    const page = await browser.newPage();
    page.on('console', (m) => m.type() === 'error' && console.error('page:', m.text()));
    page.on('pageerror', (e) => console.error('page error:', e.message));
    await page.goto(`http://localhost:${port}/tools/music/record.html`);
    await page.waitForFunction(() => document.getElementById('s')?.textContent === 'ready', null, { timeout: 180000 });
    while (next < names.length) await one(page, names[next++]);
    await page.close();
  }));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
  await browser.close();
  await vite.close();
}
process.exit(0);
