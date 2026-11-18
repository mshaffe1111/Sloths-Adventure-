/**
 * BUILD-16b: 1-6's petal goal on the REAL game (dev page, __play('1-6')): the HUD's petal counter as the stage starts, the SEALED exit
 * with Dot's line when he walks into it short of the goal, then the LAST petal picked up by his own walk (the count set one short of
 * the goal, the label says so) and the OPEN exit as he walks in. Every label prints what the game built (D62): stage, setting from
 * localStorage AND easyMode, seed, the goal, his count.
 *   node reference/qa-reports/BUILD-16b/exit.mjs <sha> <normal|easy> [port]      Out: reference/qa-reports/BUILD-16b/shots/exit-*.jpg
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [sha = '?', setting = 'normal', portArg] = process.argv.slice(2);
const port = Number(portArg || 5241);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = path.join(here, 'shots');
fs.mkdirSync(out, { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
for (const [w, h] of [[915, 412], [412, 915]]) {
  const tag = `${w > h ? 'sideways' : 'upright'}-${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((s) => { try { if (s === 'easy') localStorage.setItem('sloth_difficulty', 'easy'); else localStorage.removeItem('sloth_difficulty'); } catch {} }, setting);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  await page.evaluate(() => window.__play('1-6'));
  for (let t = Date.now(); Date.now() - t < 60000; ) { if (await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!e?.currentStage?.config && e.currentStage.config.id === '1-6'; })) break; await sleep(500); }
  await sleep(1500);
  const name = (k) => path.join(out, `exit-${setting}-${tag}-${k}.jpg`);
  const info = () => page.evaluate(() => {
    const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine), st = e.currentStage, g = st.gen2 ?? st.proto?.gen2;
    let diff = '?';
    try { diff = localStorage.getItem('sloth_difficulty') || '(unset: Normal)'; } catch {}
    const hint = e.stageHint ? (e.stageHint.text ?? JSON.stringify(e.stageHint).slice(0, 80)) : '';
    return { stage: st.config.id, seed: g?.seed ?? '?', diff, easy: !!(e.easy ?? e.easyMode), goal: st.config.targetCount, have: e.player.fruitsCollected, exitX: Math.round(st.exitTotemX), x: Math.round(e.player.x), hint };
  });
  const stamp = async (what) => {
    const i = await info();
    const t = `${what} | ${tag} | ${i.stage} seed ${i.seed} (${i.diff}${i.easy ? ', engine easy on' : ', engine easy off'}) | goal ${i.goal}, has ${i.have} | t-build-16@${sha} (BUILD-16b)`;
    await page.evaluate((t) => { let d = document.getElementById('__lab'); if (!d) { d = document.createElement('div'); d.id = '__lab'; Object.assign(d.style, { position: 'fixed', left: '0', right: '0', bottom: '0', zIndex: 99999, font: '11px monospace', background: 'rgba(0,0,0,.6)', color: '#fff', padding: '2px 4px', pointerEvents: 'none' }); document.body.appendChild(d); } d.textContent = t; }, t);
    return i;
  };
  // 1. the stage-start goal card and the counter (the HUD's own card, as it shows)
  await stamp('STAGE START: the goal card / petal counter');
  await page.screenshot({ path: name('0-start'), type: 'jpeg', quality: 85 });
  await sleep(4000);
  await stamp('PLAYING: the petal counter');
  await page.screenshot({ path: name('1-counter'), type: 'jpeg', quality: 85 });
  // 2. walked into the exit short of the goal: SEALED, Dot's line (her mark's line is said on the exit's first bank: it is up as he gets
  //    there, so he taps it away as a player does, and walks on into the door)
  await page.evaluate(() => { const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine), p = e.player, st = e.currentStage; const g = e.platforms.filter((q) => q.x < st.exitTotemX && q.x + q.width > st.exitTotemX - 200).sort((a, b) => a.y - b.y)[0]; p.x = st.exitTotemX - 160; p.y = (g?.y ?? p.y) - 60; p.vx = 0; p.vy = 0; e.input.state.right = true; });
  await sleep(1200);
  await stamp('AT THE EXIT, short of the goal: her mark line up');
  await page.screenshot({ path: name('2a-mark'), type: 'jpeg', quality: 85 });
  // (and the 70%-along goal reminder, which a teleport to the end raises here; on a real run it is said far back)
  for (let k = 0; k < 4; k++) {
    await page.getByText("Tap here when you've read it", { exact: false }).first().click({ timeout: 2000 }).catch(() => {});
    await sleep(700);
  }
  await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; const p = e.player, st = e.currentStage; p.x = st.exitTotemX - 160; e.input.state.right = true; e.barrierMsgCooldown = 0; });
  // (he keeps pushing into the door; any other bubble is read and tapped away, until Dot's sealed line is ON SCREEN, judged from the DOM)
  let shown = false;
  for (let k = 0; k < 30 && !shown; k++) {
    await sleep(500);
    shown = await page.evaluate(() => document.body.innerText.includes('Some of her petals are still on the lianas'));
    if (!shown) await page.getByText("Tap here when you've read it", { exact: false }).first().click({ timeout: 800 }).catch(() => {});
  }
  console.log(tag, 'sealed line on screen', shown);
  await sleep(400);
  await page.evaluate(() => { (typeof window.__engine === 'function' ? window.__engine() : window.__engine).input.state.right = false; });
  const s = await stamp(`SEALED: walked into the exit short of the goal; Dot's sealed line ${shown ? 'ON SCREEN' : 'NOT SEEN'}`);
  await page.screenshot({ path: name('2-sealed'), type: 'jpeg', quality: 85 });
  console.log(tag, 'sealed', JSON.stringify(s));
  // 3. the LAST petal: his count set one short of the goal (named), the nearest petal before the exit picked up by his own walk
  const lastAt = await page.evaluate(() => {
    const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine), p = e.player, st = e.currentStage;
    const pet = e.collectibles.filter((c) => !c.collected && (c.type === 'flower' || c.type === 'leaf') && c.x < st.exitTotemX).sort((a, b) => b.x - a.x)[0];
    if (!pet) return null;
    p.fruitsCollected = st.config.targetCount - 1;
    const g = e.platforms.filter((q) => q.x <= pet.x && q.x + q.width >= pet.x && q.y > pet.y).sort((a, b) => a.y - b.y)[0];
    p.x = pet.x - 120; p.y = (g?.y ?? pet.y + 30) - 60; p.vx = 0; p.vy = 0; e.input.state.right = true;
    return { x: Math.round(pet.x), y: Math.round(pet.y) };
  });
  console.log(tag, 'last petal at', JSON.stringify(lastAt));
  for (let i = 0; i < 60; i++) { await sleep(100); if (await page.evaluate(() => { const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine); return e.player.fruitsCollected >= e.currentStage.config.targetCount; })) break; }
  await sleep(600);
  await page.evaluate(() => { (typeof window.__engine === 'function' ? window.__engine() : window.__engine).input.state.right = false; });
  await stamp('THE LAST PETAL (count set one short; picked up by his walk): the goal met');
  await page.screenshot({ path: name('3-last-petal'), type: 'jpeg', quality: 85 });
  // 4. walked into the OPEN exit
  await page.evaluate(() => { const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine), p = e.player, st = e.currentStage; const g = e.platforms.filter((q) => q.x < st.exitTotemX && q.x + q.width > st.exitTotemX - 200).sort((a, b) => a.y - b.y)[0]; p.x = st.exitTotemX - 160; p.y = (g?.y ?? p.y) - 60; p.vx = 0; p.vy = 0; e.input.state.right = true; });
  await sleep(900);
  const o = await stamp('OPEN: walking into the exit with the goal met');
  await page.screenshot({ path: name('4-open'), type: 'jpeg', quality: 85 });
  await sleep(1200);
  await page.evaluate(() => { (typeof window.__engine === 'function' ? window.__engine() : window.__engine).input.state.right = false; });
  await stamp('OPEN: through');
  await page.screenshot({ path: name('5-through'), type: 'jpeg', quality: 85 });
  console.log(tag, 'open', JSON.stringify(o), 'reached', await page.evaluate(() => !!(typeof window.__engine === 'function' ? window.__engine() : window.__engine).exitTotemReached));
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch {}
await sleep(1500);
process.exit(0);
