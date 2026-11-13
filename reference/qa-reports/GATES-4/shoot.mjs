/**
 * GATES-4 stills, adapted from reference/qa-reports/INT-3/shoot-14.mjs (B14): one stage, one setting, fresh save, upright 412x915 and
 * sideways 915x412: the start (Pokey at spawn, unmoved), a mid beat (the middle laid section's way in) and the finale (the last section's way in).
 *   node reference/qa-reports/GATES-4/shoot.mjs <outDir> <port> <stage> [normal|easy] [seed]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = process.cwd();
const [outDir, portArg, stage = '1-4', setting = 'normal', seedArg = '1'] = process.argv.slice(2);
const port = Number(portArg || 5220);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
let errors = 0;
for (const [tag, w, h] of [['port', 412, 915], ['land', 915, 412]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(() => { Element.prototype.requestFullscreen = function () { return Promise.resolve(); }; });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { errors++; console.log('pageerror', e.message.slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${port}/?lessons=off${setting === 'easy' ? '&difficulty=easy' : ''}`, { timeout: 300000 });
  await page.evaluate((m) => localStorage.setItem('sloth_difficulty', m), setting);
  await page.reload({ timeout: 300000 });
  await sleep(2500);
  await page.evaluate(([id, v]) => window.__play(id, v), [stage, Number(seedArg)]);
  await sleep(4000);
  await page.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  let ok = false;
  for (let t = Date.now(); Date.now() - t < 120000; ) {
    ok = await page.evaluate((id) => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage && e.currentStage.gen2 && e.currentStage.config.id === id); }, stage);
    if (ok) break;
    await sleep(500);
  }
  if (!ok) { console.log(stage, setting, tag, 'NO STAGE'); errors++; await ctx.close(); continue; }
  await sleep(3000);
  const name = (beat, t) => path.join(outDir, `${stage}-${setting}-${tag}-${beat}${t ? '-' + t.replace(/^w\d+-\d+-/, '') : ''}.jpg`);
  await page.screenshot({ path: name('1start'), quality: 80 });
  // (a section's way in: a tower's route legs carry it (as shoot-14.mjs uses); a run's sections carry only x0..x1, so Pokey stands on the
  //  lowest wide platform under the section's first 40-200 px)
  const secs = await page.evaluate(() => {
    const e = window.__engine(), st = e.currentStage, g = st.gen2;
    const tpl = (uid) => g.sections.find((s) => s.uid === uid)?.template;
    if (g.tower?.route?.legs?.length) return g.tower.route.legs.map((l) => ({ uid: l.uid, t: tpl(l.uid), x: l.entry.x, y: l.entry.y }));
    const plats = (st.platforms || []).filter((p) => p.width >= 50 && !p.hazard && p.type !== 'thorns');
    return g.sections.map((s) => {
      for (let dx = 40; dx <= 200; dx += 20) {
        const X = s.x0 + dx, under = plats.filter((p) => p.x <= X && X <= p.x + p.width).sort((a, b) => b.y - a.y)[0];
        if (under) return { uid: s.uid, t: s.template, x: X - 30, y: under.y - (e.player.height || 40) };
      }
      return { uid: s.uid, t: s.template, x: s.x0 + 10, y: e.player.y };
    });
  });
  const picks = [['2mid', secs[Math.floor(secs.length / 2)]], ['3finale', secs[secs.length - 1]]];
  for (const [beat, L] of picks) {
    await page.evaluate((L) => { const e = window.__engine(); Object.assign(e.player, { x: L.x + 30, y: L.y, vx: 0, vy: 0, grounded: true, climbing: false, invincibleTimer: 30 }); }, L);
    await sleep(1800);
    await page.screenshot({ path: name(beat, `${L.uid}-${L.t}`), quality: 80 });
  }
  console.log(stage, setting, tag, secs.length, 'sections; shot start, mid', picks[0][1].uid, 'finale', picks[1][1].uid);
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid); } catch { vite.kill(); }
console.log('pageerrors', errors);
process.exit(0);
