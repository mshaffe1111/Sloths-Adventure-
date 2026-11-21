// whole-screen still with the camera set on a world point (no player move): node camshot.mjs <port> <out> <stage> <layout> <x> <y> <name>  (DIFF, ORIENT)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, stage, layout, X, Y, name] = process.argv.slice(2);
const DIFF = process.env.DIFF ?? 'normal', ORIENT = process.env.ORIENT ?? 'both';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  if (ORIENT !== 'both' && ORIENT !== tag) continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, DIFF);
  await ctx.addInitScript(() => { let s = 12345; Math.random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    window.__freezeNow = () => { let now = 100000; performance.now = () => now; window.__tick = (ms) => { now += ms; }; }; });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await p.evaluate(() => typeof window.__play === 'function')) break; await p.waitForTimeout(1000); }
  await p.waitForTimeout(2500);
  await p.evaluate(([s, v]) => window.__play(s, v), [stage, +layout]);
  await p.waitForTimeout(5000);
  { let gone = 0; for (let k = 0; k < 40 && gone < 4; k++) { const up = await p.evaluate(() => document.documentElement.dataset.hudCard === '1'); if (up) { gone = 0; await p.touchscreen.tap(w / 2, h / 2); } else gone++; await p.waitForTimeout(500); } }
  for (let k = 0; k < 6; k++) { const box = p.getByText("Tap here when you", { exact: false }).first(); if (!(await box.isVisible().catch(() => false))) break; await box.click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(400); }
  await p.evaluate(() => window.__freezeNow?.());
  const cam = await p.evaluate(([E, X, Y]) => { const e = eval(E); e.isPaused = true; e.player.y = -99999; e.clearGuide?.();
    for (let i = 0; i < 8; i++) { e.camera.x = X - e.camera.viewportWidth / 2; e.camera.y = Y - e.camera.viewportHeight / 2; e.render(); }
    return { x: e.camera.x, y: e.camera.y, z: e.zoom, seed: e.currentStage?.gen2?.seed }; }, [E, +X, +Y]);
  const f = path.join(out, `${stage}-L${layout}-${DIFF}-x${X}-${name}-${tag}.jpg`);
  await p.screenshot({ path: f, type: 'jpeg', quality: 85 });
  console.log('wrote', f); console.log('CAM ' + JSON.stringify(cam));
  await ctx.close();
}
await b.close();
