// BUILD-27c scratch: THE race clip of 2-7 in the real game (dev server): a headless bot run (racerec.mts) replayed frame by frame: his
// fields, every drifting log and the pacer piece set each frame, the engine stepped (so the race-end line fires on the copied verdict) and
// rendered; every 2nd frame kept (15 fps), 2x. A caption names the engine frame and marks the frame he wins.
//   PW=... node racepuppet.mjs <port> <race.json> <out dir> [side|up] [pre frames] [post frames]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, rec, out, ori = 'side', PRE = '60', POST = '300'] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(rec, 'utf8'));
const F = d.frames; const start = F.findIndex((q) => q.pc && q.pc.clock > 0); const a = process.env.FROM ? +process.env.FROM : Math.max(0, start - +PRE), z = process.env.TO ? +process.env.TO : Math.min(F.length - 1, d.verdictAt + +POST);
fs.mkdirSync(out, { recursive: true });
const [w, h] = ori === 'up' ? [412, 915] : [915, 412];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
await ctx.addInitScript((s) => { try { localStorage.setItem('sloth_difficulty', s); } catch {} }, d.setting);
const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
await p.evaluate(([id, v]) => window.__play(id, v), ['2-7', 1]); await p.waitForTimeout(4000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
console.log('BUILT', await p.evaluate((E) => { const e = eval(E); return JSON.stringify({ seed: e.currentStage.gen2?.seed, diff: e.currentStage.gen2?.budget?.difficulty }); }, E));
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(1500);
await p.evaluate(([E, LIVE]) => { const e = eval(E); e.isPaused = true; if (!LIVE) for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true; const c = document.createElement('div'); c.id = 'cap'; c.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;font:bold 13px sans-serif;color:#fff;background:rgba(0,0,0,.55);padding:3px 6px;border-radius:4px;pointer-events:none'; document.body.appendChild(c); }, [E, !!process.env.LIVE]);
let k = 0;
for (let i = a; i <= z; i++) {
  const fr = F[i];
  const res = await p.evaluate(([E, fr, cap]) => {
    const e = eval(E); const set = () => { Object.assign(e.player, fr.P); for (const [j, x, y] of fr.D) if (e.platforms[j]) { e.platforms[j].x = x; e.platforms[j].y = y; } const pc = e.pieces.find((q) => q.kind === 'pacer'); if (pc && fr.pc) { for (const [kk, vv] of Object.entries(fr.pc)) if (kk !== 'kind') pc[kk] = vv; } };
    set(); e.update(1 / 30); set(); e.render(); document.getElementById('cap').textContent = cap;
    return Math.round(e.player.x);
  }, [E, fr, `2-7 ${d.bot} ${d.setting} seed ${d.seed} | frame ${fr.n} t ${fr.t.toFixed(1)} s${fr.n >= d.verdictAt ? ` | HE WON at frame ${d.verdictAt} (him ${d.verdict.him} s, boat ${d.verdict.boat} s)` : fr.pc && fr.pc.clock > 0 ? ' | the race' : ''}`]);
  if ((i - a) % 2 === 0) { await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); await p.screenshot({ path: path.join(out, `f${String(k++).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 80 }); }
  if (i === d.verdictAt) console.log(`win frame ${i} -> clip still f${String(k - 1).padStart(5, '0')} (x ${res})`);
}
await b.close();
console.log(`frames ${a}-${z} (race start ${start}, verdict ${d.verdictAt}), ${k} stills in ${out}`);
