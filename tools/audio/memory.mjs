// What each world's music costs a phone in memory: node tools/audio/memory.mjs
// For a few stages of every world (and the title, menus and map), the recordings the piece loads (orchLoader.groupsFor), and their decoded
// size at the rate the loader decodes them (24 kHz for the pitched voices, 32 kHz for the violins' staccato, the context's 48 kHz for the
// drums and bells: orchLoader.decodeRate), mono float32.
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const dir = 'src/assets/orch';
const FULL = new Set(['cymbal', 'snare', 'triangle', 'gong', 'glock', 'timp', 'bdrum']);
const rate = (g) => (FULL.has(g) ? 48000 : g === 'violinStac' ? 32000 : 24000);
const mb = {};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.mp3'))) {
  const g = f.split('_')[0];
  const d = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `${dir}/${f}`]).toString());
  mb[g] = (mb[g] ?? 0) + (d * rate(g) * 4) / 1e6;
}
const ids = JSON.parse(process.argv[2] ?? '[]');
const port = 5900 + Math.floor(Math.random() * 90);
const vite = spawn('node_modules/.bin/vite', ['--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://localhost:${port}/tools/audio/preview.html`);
await page.waitForFunction(() => document.getElementById('s')?.textContent === 'ready', null, { timeout: 120000 });
const out = [];
for (const [label, id] of ids) {
  const groups = await page.evaluate((i) => window.groupsOf(i), id);
  const total = (groups ?? []).reduce((a, g) => a + (mb[g] ?? 0), 0);
  out.push({ label, id, mb: Math.round(total * 10) / 10, groups: groups?.length });
}
console.log(JSON.stringify(out));
await browser.close();
vite.kill();
process.exit(0);
