// FIX-14 step 1: Matt's fig case on the real 1-4 page: under the first gate's fig, hold up to full push, keep holding, then jump.
// Logs Pokey's top (feet - 64) against the bough's top/underside every few frames; records a clip (upright 412x915).
import fs from 'node:fs';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, diff = 'normal', GI = '0'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, recordVideo: { dir: out, size: { width: 412, height: 915 } } });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('1-4', 0));
await p.waitForTimeout(9000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const info = await p.evaluate(([E, GIX]) => {
  const e = eval(E); const f = e.field; const g = f.gates[+GIX];
  const bough = e.platforms.find((q) => q.id === g.platform);
  const c = e.clusters.find((k) => k.id === g.clusters[0]);
  const v = e.vines.find((q) => q.id === c.vine);
  const P = e.player; P.x = v.x; P.y = v.bottomY - 4; P.vx = 0; P.vy = 0;
  return { diff: localStorage.getItem('sloth_difficulty'), seed: e.currentStage?.gen2?.seed ?? e.currentStage?.proto?.gen2?.seed, gates: f.gates.length, bough: { x: bough.x, y: bough.y, w: bough.width, h: bough.height }, fig: { y: c.y, h: c.h }, vine: { x: v.x, top: v.topY, bot: v.bottomY }, ph: P.height };
}, [E, GI]);
console.log('BUILT', JSON.stringify(info));
const log = [];
const sample = async (tag) => log.push({ tag, ...(await p.evaluate(([E, GIX]) => { const e = eval(E); const P = e.player; const g = e.field.gates[+GIX]; const c = e.clusters.find((k) => k.id === g.clusters[0]); return { y: Math.round(P.y), top: Math.round(P.y - P.height), climbing: P.climbing, fig: c ? Math.round(c.y) : null, figGone: !c || c.gone || c.falling }; }, [E, GI])) });
await p.keyboard.down('ArrowUp');
for (let i = 0; i < 30; i++) { await p.waitForTimeout(200); await sample('up'); }
await p.keyboard.up('ArrowUp');
for (let k = 0; k < 2; k++) { await p.keyboard.down('Space'); await p.waitForTimeout(250); await p.keyboard.up('Space'); for (let i = 0; i < 5; i++) { await p.waitForTimeout(150); await sample('jump'); } }
await p.screenshot({ path: `${out}/end.png` });
await ctx.close(); await b.close();
const minTop = Math.min(...log.map((l) => l.top));
console.log('LOG', log.map((l) => `${l.tag}:${l.top}/${l.fig}${l.climbing ? 'c' : ''}${l.figGone ? 'F' : ''}`).join(' '));
console.log(`MIN TOP ${minTop}; bough top ${info.bough.y}, underside ${info.bough.y + info.bough.h}; head above underside by ${info.bough.y + info.bough.h - minTop} px`);
