// What the music costs, alone: node tools/music/perf.mjs <repo dir> <stage id> [seconds] [cpu slowdown]
// Opens tools/music/bench.html from that checkout (old build or new) with a phone's user agent, starts the stage's music through the
// game's front door, slows the CPU, and reports per second of play: main-thread busy time and script time (Chrome's own counters), the
// CPU of the page and of the audio service, the JS heap and the page's memory (RSS), and the sound's own report.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [dir, stage = '2-4', secs = '60', slow = '4'] = process.argv.slice(2);
const SECS = Number(secs);
const UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 6a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
const port = 6100 + Math.floor(Math.random() * 800);
const vite = spawn('node_modules/.bin/vite', ['--port', String(port), '--strictPort'], { cwd: dir, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, userAgent: UA });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const bcdp = await browser.newBrowserCDPSession();
await cdp.send('Performance.enable');
await page.goto(`http://localhost:${port}/tools/music/bench.html`);
await page.waitForFunction(() => document.getElementById('s')?.textContent === 'ready', null, { timeout: 120000 });
const [w, m] = stage.split('-').map(Number);
const objective = process.env.OBJ ?? 'collect';
await page.evaluate(([w, id, m, o]) => window.startBench(w, id, m, o), [w, stage, m, objective]);
await page.waitForFunction(() => window.__sound.debug().playing, null, { timeout: 60000 });
// let everything load and settle
await page.waitForTimeout(8000);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(slow) });
const procs = async () => (await bcdp.send('SystemInfo.getProcessInfo')).processInfo;
const rss = (pid) => {
  try {
    return Number(/VmRSS:\s+(\d+)/.exec(fs.readFileSync(`/proc/${pid}/status`, 'utf8'))[1]) / 1024;
  } catch {
    return 0;
  }
};
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
const p0 = await procs();
const m0 = await metrics();
await page.evaluate(() => window.__sound.report());
let peakRss = 0;
const t0 = Date.now();
while (Date.now() - t0 < SECS * 1000) {
  const ps = await procs();
  peakRss = Math.max(peakRss, ps.filter((p) => p.type === 'renderer').reduce((a, p) => a + rss(p.id), 0));
  await page.waitForTimeout(1000);
}
const p1 = await procs();
const m1 = await metrics();
const el = (Date.now() - t0) / 1000;
const report = await page.evaluate(() => window.__sound.report());
const dbg = await page.evaluate(() => window.__sound.debug().playing);
const cpu = {};
for (const p of p1) {
  const before = p0.find((q) => q.id === p.id);
  cpu[p.type] = (cpu[p.type] ?? 0) + (p.cpuTime - (before?.cpuTime ?? 0));
}
const r3 = (x) => Math.round(x * 1000) / 1000;
console.log(JSON.stringify({
  dir, stage, seconds: Math.round(el), slowdown: Number(slow), playing: dbg,
  mainThreadMsPerSec: Math.round(((m1.TaskDuration - m0.TaskDuration) / el) * 1000 * 10) / 10,
  scriptMsPerSec: Math.round(((m1.ScriptDuration - m0.ScriptDuration) / el) * 1000 * 10) / 10,
  cpuPerSec: Object.fromEntries(Object.entries(cpu).map(([k, v]) => [k, r3(v / el)])),
  jsHeapMB: Math.round(m1.JSHeapUsedSize / 1e5) / 10,
  rendererPeakRssMB: Math.round(peakRss),
  sound: report,
}));
await browser.close();
vite.kill();
process.exit(0);
