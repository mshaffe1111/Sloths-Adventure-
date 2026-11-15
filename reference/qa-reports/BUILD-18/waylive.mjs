// BUILD-18: does the LIVE game (its own frame loop, real time) hold Pokey's halfway wayside box on 1-8? A fresh save, he is placed 700 px
// before the still fork and held right (the real input state) for 16 s of wall time; the box's text is read off the page every 0.5 s.
//   PORT=5199 node reference/qa-reports/BUILD-18/waylive.mjs <out dir> [normal|easy]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, setting = 'normal'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await ctx.addInitScript((s) => localStorage.setItem('sloth_difficulty', s), setting);
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:${process.env.PORT ?? 5199}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('1-8', 1));
await p.waitForFunction((E) => !!eval(E)?.currentStage, E, { timeout: 60000, polling: 250 });
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2500);
await p.getByText(/Tap here when you/).first().click({ timeout: 2500 }).catch(() => {});
const placed = await p.evaluate((E) => {
  const e = eval(E);
  const m = (e.cast?.sweepers || []).find((q) => q.e.kitPasses === 1);
  const x = m.s.minX - 700;
  const g = e.platforms.filter((q) => !q.broken && q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
  Object.assign(e.player, { x, y: g.y, vx: 0, vy: 0, grounded: true, invincibleTimer: 30, hp: e.player.maxHp ?? 5 });
  e.checkpoint = { x, y: g.y };
  e.startPieces(); e.startCast();
  e.input.state.right = true;
  return { x, fork: m.s.minX };
}, E);
console.log('placed', JSON.stringify(placed));
const t0 = Date.now();
let up = null, gone = null;
for (let i = 0; i < 32; i++) {
  await p.waitForTimeout(500);
  const r = await p.evaluate((E) => { const e = eval(E); e.input.state.right = true; e.player.invincibleTimer = 30; const box = [...document.querySelectorAll('body *')].some((el) => el.children.length === 0 && /Dot keeps flying/.test(el.textContent || '') && el.offsetParent); return { box, x: Math.round(e.player.x), paused: !!e.isPaused }; }, E);
  const t = ((Date.now() - t0) / 1000).toFixed(1);
  if (r.box && up === null) { up = t; await p.screenshot({ path: path.join(out, `waylive-${setting}-up.jpg`), quality: 70, type: 'jpeg' }); }
  if (!r.box && up !== null && gone === null) { gone = t; await p.screenshot({ path: path.join(out, `waylive-${setting}-gone.jpg`), quality: 70, type: 'jpeg' }); }
  console.log(t, JSON.stringify(r));
}
console.log('RESULT', JSON.stringify({ setting, up, gone }));
await b.close();
