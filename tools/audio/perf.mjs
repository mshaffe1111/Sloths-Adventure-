// The sound's cost on a slow phone: node tools/audio/perf.mjs <url of a built game> <stage> [seconds]
// Opens the stage with a phone's user agent (the game then plays its phone sound: lite arrangement, light room), the CPU slowed 4x,
// and reports over the run: CPU time of every Chromium process, the page's memory, main-thread busy time, and the sound's own report
// (lag = sound lost because the audio ran dry; silent = share of checks that found the music silent).
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [url, stage = '2-4', secs = '60', mode = 'game'] = process.argv.slice(2);
// mode 'live': the music engine alone (tools/audio/live.html), with the stage's world music and ambience
const SECS = Number(secs);
const UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 6a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, userAgent: UA });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const bcdp = await browser.newBrowserCDPSession();
await cdp.send('Performance.enable');
const live = mode === 'live';
if (live) {
  await page.goto(url + 'tools/audio/live.html');
  await page.waitForFunction(() => document.getElementById('s')?.textContent === 'ready', null, { timeout: 60000 });
  await page.evaluate(async (s) => {
    window.live = await window.startLive(Number(s.split('-')[0]), s, 'river_flow');
    window.__sound = { report: () => '', debug: () => ({ playing: window.live.id, lite: true, state: 'running' }), setMusicState: window.live.hasState ? window.live.setState : undefined, cue: () => {} };
  }, stage);
} else {
  await page.goto(url + (url.includes('?') ? '&' : '?') + 'audiodebug=1' + (process.env.MUSIC ? '&music=' + process.env.MUSIC : ''));
  await page.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 60000 });
  await page.mouse.click(400, 200);
  await page.evaluate((s) => window.__play(s), stage);
}
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
// let the orchestra load and the music start
await page.waitForTimeout(15000);
const procs = async () => (await bcdp.send('SystemInfo.getProcessInfo')).processInfo;
const rss = (pid) => {
  try {
    return Number(/VmRSS:\s+(\d+)/.exec(fs.readFileSync(`/proc/${pid}/status`, 'utf8'))[1]) / 1024;
  } catch {
    return 0;
  }
};
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
const p0 = await procs();
const m0 = await metrics();
await page.evaluate(() => window.__sound.report());
// the game's state changes the after-build understands (a before-build has no setMusicState: it plays on as the game drives it)
const hasState = !process.env.NOSTATE && (await page.evaluate(() => typeof window.__sound.setMusicState === 'function'));
let peakRss = 0;
const t0 = Date.now();
for (let i = 0; Date.now() - t0 < SECS * 1000; i++) {
  if (hasState && i % 10 === 0) {
    const k = (i / 10) % 4;
    await page.evaluate((k) => window.__sound.setMusicState({ danger: k === 1 ? 1 : 0, dark: k === 2 ? 1 : 0, exit: k === 3 ? 1 : 0 }), k);
    if (k === 1) await page.evaluate(() => window.__sound.cue('checkpoint'));
  }
  const ps = await procs();
  peakRss = Math.max(peakRss, ps.filter((p) => p.type === 'renderer').reduce((a, p) => a + rss(p.id), 0));
  await page.waitForTimeout(1000);
}
const p1 = await procs();
const m1 = await metrics();
const report = await page.evaluate(() => window.__sound.report());
const dbg = await page.evaluate(() => { const d = window.__sound.debug(); return { playing: d.playing, section: d.section, lite: d.lite, state: d.state }; });
const cpu = {};
for (const p of p1) {
  const before = p0.find((q) => q.id === p.id);
  cpu[p.type] = (cpu[p.type] ?? 0) + (p.cpuTime - (before?.cpuTime ?? 0));
}
const out = {
  mode, stage, seconds: SECS, playing: dbg,
  cpuSecondsPerSecond: Object.fromEntries(Object.entries(cpu).map(([k, v]) => [k, Math.round((v / SECS) * 1000) / 1000])),
  mainThreadBusy: Math.round(((m1.TaskDuration - m0.TaskDuration) / SECS) * 1000) / 1000,
  scriptBusy: Math.round(((m1.ScriptDuration - m0.ScriptDuration) / SECS) * 1000) / 1000,
  jsHeapMB: Math.round(m1.JSHeapUsedSize / 1e5) / 10,
  rendererPeakRssMB: Math.round(peakRss),
  sound: report,
};
console.log(JSON.stringify(out));
await browser.close();
process.exit(0);
