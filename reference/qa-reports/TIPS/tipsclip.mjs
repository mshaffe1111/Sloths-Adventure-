// TIPS (R-165.236): 1-4's teach tips on the real page, played in REAL TIME (the game's own loop and Dot's own bubble queue; a fresh
// save on the default setting: Normal Tips, Easy Help), recorded as video. Three beats, each by the keyboard's right arrow: the start
// floor (4 s), the first creaking bough (stood on its section's start bough), the first fig gate (stood on its field's foot). The
// caption names every engine tip the moment it fires (its band, his feet) and Dot's bubble words as the page shows them, so the frame
// where each happens is named (D69); a still is kept 2 s into each beat's first tip. Prints BUILT from the game (D62).
//   node tipsclip.mjs <port> <outdir> <normal|easy> <up|side> [layout]
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const [port, out, diff = 'normal', ori = 'up', LAYOUT = '0'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, isMobile: true, hasTouch: true, recordVideo: { dir: out, size: VP } });
await ctx.route(/script\.google\.com/, (r) => r.abort());
await ctx.addInitScript((d) => { try { localStorage.clear(); if (d === 'easy') localStorage.setItem('sloth_difficulty', 'easy'); } catch {} }, diff);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 300000 });
await p.waitForTimeout(1500);
await p.evaluate((L) => window.__play('1-4', L), +LAYOUT);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player && e.field); }, E, { timeout: 120000 });
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(1500);
const built = await p.evaluate(([E, ori]) => {
  const e = eval(E);
  const d = document.createElement('div'); d.id = 'cap';
  Object.assign(d.style, { position: 'fixed', left: '10px', right: '10px', bottom: window.innerWidth > window.innerHeight ? '6px' : '14px', zIndex: 99999, font: '700 14px system-ui, sans-serif', color: '#fff', background: 'rgba(20,30,12,0.8)', borderRadius: '10px', padding: '6px 10px', textAlign: 'center', lineHeight: '1.25', pointerEvents: 'none' });
  document.body.appendChild(d);
  const seen = new Set((e.currentStage.proto?.hints ?? []).filter((h) => h.shown));
  window.__beat = 'start';
  window.__fired = [];
  const t0 = performance.now();
  setInterval(() => {
    const P = e.player;
    const feet = Math.round(P.y + P.height);
    for (const h of e.currentStage.proto?.hints ?? []) if (h.shown && !seen.has(h)) { seen.add(h); window.__fired.push({ beat: window.__beat, s: +((performance.now() - t0) / 1000).toFixed(1), text: h.text, band: h.band ? h.band.join('..') : 'none: x alone', feet, x: Math.round(P.x) }); }
    const bub = document.querySelector('.dg-bub.in')?.textContent?.trim().slice(0, 44) ?? '';
    const mine = window.__fired.filter((f) => f.beat === window.__beat).slice(-2);
    d.innerHTML = `<b>${window.__beat}</b> · feet y ${feet}<br>` + (mine.length ? mine.map((f) => `tip fired: “${f.text.slice(0, 30)}…” (band ${f.band})`).join('<br>') : 'no tip fired in this beat') + (bub ? `<br>Dot's bubble: “${bub}…”` : '');
  }, 100);
  return { stage: e.currentStage.config.id, seed: e.currentStage.gen2?.seed, built: e.currentStage.gen2?.budget?.difficulty, ori, tips: (e.currentStage.proto?.hints ?? []).map((h) => `${h.x}${h.band ? '@' + h.band.join('..') : ' (x alone)'}`) };
}, [E, ori]);
console.log('BUILT', JSON.stringify(built));
const beat = (name) => p.evaluate((n) => { window.__beat = n; }, name);
const standAt = (what) => p.evaluate(([E, what]) => {
  const e = eval(E); const f = e.currentStage.gen2.fills.find((q) => q.role === 'tip' && q.what === what);
  const pl = e.platforms.filter((q) => q.x <= f.x - 70 && q.x + q.width >= f.x - 70 && Math.abs(q.y - f.y) < 60).sort((a, z) => Math.abs(a.y - f.y) - Math.abs(z.y - f.y))[0] ?? { y: f.y };
  Object.assign(e.player, { x: f.x - 70, y: pl.y - e.player.height, vx: 0, vy: 0, climbing: false, facing: 1 });
  return { x: f.x, y: f.y };
}, [E, what]);
const walk = async (ms) => { await p.keyboard.down('ArrowRight'); await p.waitForTimeout(ms); await p.keyboard.up('ArrowRight'); };
await beat('1-4 start: walking the floor'); await walk(4000); await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/1-floor.jpg`, type: 'jpeg', quality: 80 });
await beat('the first creaking bough'); const c = await standAt('creak'); await p.waitForTimeout(600); await walk(700); await p.waitForTimeout(3400);
await p.screenshot({ path: `${out}/2-creak.jpg`, type: 'jpeg', quality: 80 }); console.log('DOT@creak', await p.evaluate(() => [...document.querySelectorAll('.dg-bub, .dg-root')].map((d) => d.className + ':' + d.textContent.slice(0, 50)).join(' | '))); await p.waitForTimeout(1500);
await beat('the first fig gate'); const g = await standAt('figs'); await p.waitForTimeout(600); await walk(700); await p.waitForTimeout(3400);
await p.screenshot({ path: `${out}/3-figs.jpg`, type: 'jpeg', quality: 80 }); await p.waitForTimeout(1500);
const fired = await p.evaluate(() => window.__fired);
console.log('SOCKETS', JSON.stringify({ creak: c, figs: g }));
console.log('FIRED', JSON.stringify(fired));
fs.writeFileSync(`${out}/fired.json`, JSON.stringify({ built, sockets: { creak: c, figs: g }, fired }, null, 1));
const v = p.video();
await ctx.close();
fs.renameSync(await v.path(), `${out}/clip.webm`);
await b.close();
