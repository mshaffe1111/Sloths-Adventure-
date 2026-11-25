// INT-R5d step 1 after-stills (scratch; kept in reference/qa-reports/INT-R5/tools/). One tree per run, one vite per port.
// node int-shots.mjs <treeDir> <port> <outDir> <tag> <marker> <markerWanted 1|0> <jobs: comma list of 27,14,16,81>
// Refuses a busy port; checks the served tree by a marker in src/game/protoArt.ts; kills its vite at the end.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
const PWm = await import('/opt/node22/lib/node_modules/playwright/index.js'); const chromium = PWm.chromium ?? PWm.default.chromium;
const [tree, portS, out, tag, marker, wantS, jobsS = '27,14,16,81'] = process.argv.slice(2);
const port = Number(portS), want = wantS === '1', jobs = jobsS.split(',');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const busy = await new Promise((r) => { const s = net.connect(port, '127.0.0.1'); s.on('connect', () => { s.destroy(); r(true); }); s.on('error', () => r(false)); });
if (busy) { console.log('REFUSED: port', port, 'is busy'); process.exit(2); }
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: tree, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = ''; vite.stdout.on('data', (d) => (vout += d)); vite.stderr.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const fin = (c) => { try { vite.kill('SIGKILL'); } catch {} process.exit(c); };
const raw = await (await fetch(`http://127.0.0.1:${port}/src/game/protoArt.ts?raw`)).text();
if (raw.includes(marker) !== want) { console.log('WRONG TREE: marker', marker, 'present', raw.includes(marker), 'wanted', want); fin(3); }
console.log('tree ok:', tree, 'marker', marker, 'present', want);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch();
const log = [];
for (const diff of ['normal', 'easy']) for (const [orient, vp] of [['sideways', { width: 844, height: 390 }], ['upright', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 160)));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 300000 });
  await sleep(2000);
  const frame = async (n) => { for (let i = 0; i < n; i++) { await p.evaluate((E) => { const e = eval(E); const h = window.__hold; const hp = () => { if (h) { Object.assign(e.player, { x: h.x - e.player.width / 2, y: h.y - e.player.height, vx: 0, vy: 0, invincibleTimer: 9 }); if (e.lives < 5) e.lives = 9; } }; hp(); e.update(1 / 30); hp(); e.clearGuide?.(); e.render(); }, E); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); } };
  const play = async (st, layout) => {
    await p.evaluate(([s, l]) => window.__play(s, l), [st, layout]);
    await sleep(3000);
    await p.waitForFunction(([E, s]) => { const e = eval(E); return !!(e && e.currentStage && e.player && e.platforms && (e.currentStage.id === s || !e.currentStage.id)); }, [E, st], { timeout: 120000 });
    await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
    await sleep(6500); // the DOM goal card reads for 4 s of real time
    return p.evaluate((E) => { const e = eval(E); e.isPaused = true; for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true; return { id: e.currentStage.id, seed: e.currentStage.gen2?.seed ?? e.currentStage.proto?.gen2?.seed, diff: localStorage.getItem('sloth_difficulty') }; }, E);
  };
  // feet at (x, y): Pokey stands there
  const pin = (x, y) => p.evaluate(([E, x, y]) => { const e = eval(E); Object.assign(e.player, { x: x - e.player.width / 2, y: y - e.player.height - 2, vx: 0, vy: 0, grounded: false, invincibleTimer: 9 }); }, [E, x, y]);
  const shot = async (name, info, extra) => { const f = `${out}/${name}-${diff}-${orient}-${tag}.jpg`; await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); await p.screenshot({ path: f, type: 'jpeg', quality: 84 }); log.push({ f, ...info, ...extra }); console.log('shot', f, JSON.stringify(info), JSON.stringify(extra ?? {})); };
  if (jobs.includes('27')) {
    const info = await play('2-7', 0);
    const bx = diff === 'normal' ? 3881 : 4339;
    const q = await p.evaluate(([E, bx]) => {
      const e = eval(E);
      const k = e.platforms.find((q) => Math.round(q.x) === bx && q.height >= 60);
      if (!k) return null;
      const cx = k.x + k.width / 2;
      const under = e.platforms.filter((q) => q !== k && q.y > k.y + 40 && q.x < cx && q.x + q.width > cx && !q.broken).sort((a, b) => a.y - b.y)[0];
      return { bank: { x: Math.round(k.x), y: Math.round(k.y), w: Math.round(k.width), h: Math.round(k.height), style: k.style }, under: under ? { x: Math.round(under.x), y: Math.round(under.y), w: Math.round(under.width), h: Math.round(under.height), style: under.style } : null };
    }, [E, bx]);
    if (!q) console.log('2-7', diff, orient, 'NO BANK at x', bx, JSON.stringify(info));
    else {
      await pin(q.bank.x + q.bank.w / 2, q.bank.y); await frame(40); await shot('2-7-bank1-top', info, q);
      if (q.under) { await pin(q.under.x + Math.min(q.under.w / 2, 120), q.under.y); await frame(40); await shot('2-7-bank1-under', info, q); }
    }
  }
  if (jobs.includes('14')) {
    const info = await play('1-4', 1);
    await frame(10); await shot('1-4-start', info, await p.evaluate((E) => { const e = eval(E); return { x: Math.round(e.player.x), y: Math.round(e.player.y) }; }, E));
    const top = await p.evaluate((E) => {
      const e = eval(E);
      const pb = (q) => (q.height >= 90 || !!q.soil) && !q.push && !q.broken && !q.art && !q.hollow;
      const t = e.platforms.filter(pb).sort((a, b) => a.y - b.y)[0];
      Object.assign(e.player, { x: t.x + t.width / 2 - e.player.width / 2, y: t.y - e.player.height - 2, vx: 0, vy: 0, grounded: false, invincibleTimer: 9 });
      return { x: Math.round(t.x), y: Math.round(t.y), w: Math.round(t.width), h: Math.round(t.height) };
    }, E);
    await frame(45); await shot('1-4-summit', info, top);
  }
  if (jobs.includes('16')) {
    const info = await play('1-6', 0);
    for (const [nm, pc, at] of [['1-6-post1', { x: 27896, w: 24 }, { x: 27860, y: 1090 }], ['1-6-post2', { x: 45995, w: 24 }, { x: 45959, y: 1137 }]]) {
      const hit = await p.evaluate(([E, pc]) => { const e = eval(E); const h = e.platforms.find((q) => Math.round(q.x) === pc.x && Math.round(q.width) === pc.w); return h ? { x: Math.round(h.x), y: Math.round(h.y), w: Math.round(h.width), h: Math.round(h.height), style: h.style } : null; }, [E, pc]);
      await p.evaluate((h) => { window.__hold = h; }, at); await frame(40); await shot(nm, info, { piece: hit });
    }
  }
  if (jobs.includes('16d')) { // 1-6's narrow tall solids, found on this setting's own build (Easy's layout differs from Normal's)
    const info = await play('1-6', 0);
    const posts = await p.evaluate((E) => { const e = eval(E); return e.platforms.filter((q) => q.width <= 30 && q.height >= 150 && !q.broken).sort((a, b) => a.x - b.x).slice(0, 2).map((h) => ({ x: Math.round(h.x), y: Math.round(h.y), w: Math.round(h.width), h: Math.round(h.height), style: h.style })); }, E);
    for (const [k, pc] of posts.entries()) { await p.evaluate((h) => { window.__hold = h; }, { x: pc.x - 36, y: pc.y + Math.min(225, pc.h - 20) }); await frame(40); await shot(`1-6-post${k + 1}d`, info, { piece: pc }); }
    if (!posts.length) console.log('1-6', diff, orient, 'NO NARROW POSTS');
  }
  if (jobs.includes('81')) {
    const info = await play('8-1', 0);
    const hit = await p.evaluate((E) => { const e = eval(E); const h = e.platforms.find((q) => Math.round(q.x) === 1466 && Math.round(q.width) === 14); return h ? { x: Math.round(h.x), y: Math.round(h.y), w: Math.round(h.width), h: Math.round(h.height), style: h.style } : null; }, E);
    await p.evaluate((h) => { window.__hold = h; }, { x: 1505, y: 640 }); await frame(40); await shot('8-1-sliver', info, { piece: hit });
  }
  await p.evaluate(() => { window.__hold = null; });
  await ctx.close();
}
fs.writeFileSync(`${out}/shots-${tag}.json`, JSON.stringify(log, null, 1));
await b.close();
fin(0);
