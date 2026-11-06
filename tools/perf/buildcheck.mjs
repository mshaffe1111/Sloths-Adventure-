/**
 * The build-time check (PERFORMANCE-RULES §1, the lead 11-06): a rolled stage is built on the main thread when Play starts, so its build
 * is judged as a phone feels it. Chromium with the CPU slowed 4x (CDP Emulation.setCPUThrottlingRate), 1-1 built on N of its proven seeds,
 * Normal and Easy (one build a play: Play draws a proven seed and replays its plan, gen2/seedList.ts buildPlayStage); FAIL when the p95 of
 * either is over the budget.
 *   node tools/perf/buildcheck.mjs              (about 2-4 minutes; exit 1 over budget)
 *   BUILDCHECK_BUDGET=<ms> BUILDCHECK_N=<n>      (the budget, 150 ms; the builds a setting, 30)
 */
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const { chromium } = createRequire(import.meta.url)('playwright');
const BUDGET = Number(process.env.BUILDCHECK_BUDGET ?? 150);
const N = Number(process.env.BUILDCHECK_N ?? 30);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = await new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const vite = spawn('npx', ['vite', '--port', String(port), '--host', '127.0.0.1', '--strictPort'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let out = '';
vite.stdout.on('data', (d) => (out += d));
vite.stderr.on('data', (d) => (out += d));
const stop = () => { try { process.kill(-vite.pid); } catch { /* gone */ } };
let code = 0;
try {
  for (let i = 0; i < 120 && !/Local:|ready in/.test(out); i++) await sleep(500);
  if (!/Local:|ready in/.test(out)) throw new Error('vite did not start: ' + out);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/tools/perf/buildtime.html`);
  await page.waitForFunction(() => document.getElementById('s')?.textContent === 'ready', null, { timeout: 120000 });
  // (one build warm before the clock: the modules' first run, as a phone's first Play after the map would have)
  await page.evaluate(() => window.buildTimes(1, 'normal'));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const p95 = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.ceil(0.95 * s.length) - 1)]; };
  const lines = [];
  let over = false;
  for (const d of ['normal', 'easy']) {
    const ms = await page.evaluate(([n, d]) => window.buildTimes(n, d), [N, d]);
    const s = [...ms].sort((a, b) => a - b), p = p95(ms);
    if (p > BUDGET) over = true;
    lines.push(`  ${d}: p50 ${s[Math.floor(s.length / 2)].toFixed(0)} ms, p95 ${p.toFixed(0)} ms, max ${s[s.length - 1].toFixed(0)} ms (${N} builds, CPU x4)${p > BUDGET ? `  OVER ${BUDGET} ms` : ''}`);
  }
  await browser.close();
  console.log(`buildcheck (1-1, budget p95 <= ${BUDGET} ms at CPU x4): ${over ? 'FAIL' : 'PASS'}\n${lines.join('\n')}`);
  code = over ? 1 : 0;
} catch (e) {
  console.error('buildcheck: could not run:', e.message);
  code = 2;
} finally {
  stop();
}
process.exit(code);
