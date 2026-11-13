/**
 * Draw-size probe (task AS-1, test-side only): plays the title, story screens and a spread of stages in a phone-sized Chromium at
 * deviceScaleFactor 3 (a sharp phone: the worst case for "how big is this drawn"), upright and sideways, and writes, for every image
 * the game drew, the largest size it reached on the screen in device pixels (scale = device px per stored px; < 0.5 means the file is
 * stored more than 2x bigger than it is ever shown).
 *
 *   node tools/assets/drawprobe.mjs <out.json> [port|land]
 * It starts its own vite dev server (the dev-only hooks __play/__story/__engine are needed).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const { chromium } = createRequire(import.meta.url)('playwright');
const [outFile, orientArg = 'port'] = process.argv.slice(2);
const viewport = orientArg === 'land' ? { width: 880, height: 400 } : { width: 400, height: 880 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

const STAGES = [];
for (let w = 1; w <= 10; w++) STAGES.push(`${w}-1`, `${w}-5`, `${w}-10`);
const STORY = [];
for (let w = 1; w <= 10; w++) STORY.push([`${w}-10`, 'boss_intro'], [`${w}-1`, 'world_story'], [`${w}-10`, 'boss_defeat']);

const port = await freePort();
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
await ctx.addInitScript({ path: path.join(here, 'probe-init.js') });
const page = await ctx.newPage();
page.on('crash', () => console.log('PAGE CRASH'));
page.on('close', () => console.log('PAGE CLOSE'));
const ev = (fn, arg) => page.evaluate(fn, arg).catch(() => null);
// (the dev server can reload the page, e.g. after it optimises a dependency: wait for the hooks again before each step)
const ready = async () => { for (let t = 0; t < 120 && !(await ev(() => typeof window.__play === 'function' && typeof window.__story === 'function' && !!window.__probe).catch(() => false)); t++) await sleep(1000); };
// every result is kept per page life (a reload starts a new life: its canvas ids are its own)
const lives = new Map();
const snap = async () => { const r = await ev(() => window.__probe && window.__probe.result()).catch(() => null); if (r) lives.set(r.life, r); };
const log = (...a) => console.log(`[${orientArg}]`, ...a);
await page.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
for (let t = 0; t < 300 && !(await ev(() => typeof window.__play === 'function')); t++) await sleep(1000);
// the title screen: the startup phase
for (let i = 0; i < 8; i++) { await sleep(1000); await ev(() => window.__probe.scanDom()); }
const startup = await ev(() => [...window.__probe.fetched.keys()]);
log('title done');
await ev(() => (window.__probe.phase = 'story'));
for (const [id, scr] of STORY) {
  await ready();
  await ev(([i, s]) => window.__story(i, s), [id, scr]);
  for (let i = 0; i < 6; i++) { await sleep(700); await ev(() => window.__probe.scanDom()).catch(() => {}); }
  await snap();
}
log('story done');
await ev(() => (window.__probe.phase = 'stage'));
for (const id of STAGES) {
  await ready();
  await ev((i) => window.__play(i), id);
  for (let i = 0; i < 20 && !(await ev(() => !!(window.__eng()))); i++) await sleep(500);
  // the picture stays at full quality (the frame governor would lower the render resolution on this busy machine: run.mjs does the same)
  await ev(() => { const e = window.__eng(); if (e && e.gov) { e.gov.takeUp = () => false; e.gov.feed = () => false; } });
  await sleep(2500);
  // pin Pokey at 6 spots along the stage
  const spots = await ev(() => {
    const e = window.__eng(); const st = e && e.currentStage;
    if (!st) return [];
    const pl = (st.platforms || []).filter((p) => p.type === 'solid' && p.width >= 60).sort((a, b) => a.x - b.x);
    return [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => pl[Math.round(f * (pl.length - 1))]).filter(Boolean).map((p) => ({ x: p.x + p.width / 2, y: p.y }));
  });
  for (const s of spots) {
    await ev((s) => { const e = window.__eng(); if (e && e.player) { e.player.x = s.x; e.player.y = s.y - 60; e.player.vx = 0; e.player.vy = 0; } }, s);
    await sleep(900);
    await ev(() => window.__probe.scanDom());
  }
  await snap();
  log(id, spots.length, 'spots');
}
await snap();
const res = { orient: orientArg, startup, lives: [...lives.values()] };
fs.writeFileSync(outFile, JSON.stringify(res));
log('wrote', outFile, res.lives.length, 'page lives');
await browser.close();
vite.kill();
process.exit(0);
