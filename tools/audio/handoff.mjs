// The music's screen-to-screen hand-offs on a phone's audio path: node tools/audio/handoff.mjs
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const { chromium } = createRequire(import.meta.url)('playwright');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const port = 6000 + Math.floor(Math.random() * 90);
const vite = spawn('node_modules/.bin/vite', ['--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ userAgent: UA, isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.error('page error', e.message));
await page.goto(`http://localhost:${port}/tools/audio/handoff.html`);
await page.waitForFunction(() => document.getElementById('s')?.textContent === 'ready', null, { timeout: 120000 });
await page.mouse.click(100, 100);
const steps = [
  [0, 'title'], [8, 'trophy'], [16, 'title'], [22, 'world_map', 1], [28, 'world_map', 3], [34, 'playing', 3], [44, 'paused', 3], [48, 'playing', 3],
  [56, 'world_map', 3], [62, 'title'],
  // tapping back and forth quickly
  [68, 'world_map', 3], [68.3, 'title'], [68.6, 'world_map', 3], [68.9, 'title'], [69.2, 'trophy'], [69.5, 'title'], [69.8, 'world_map', 5],
];
const res = await page.evaluate((s) => window.runHandoff(s), steps);
console.log(JSON.stringify(res, null, 1));
await browser.close();
vite.kill();
process.exit(0);
