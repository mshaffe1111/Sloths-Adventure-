// FIX-TAB count probe (cause-based, verified on pixels): every floor's lip run on under a higher bank (protoArt lipUnder) in the built
// stage; ORPHAN when the floor's own lip just inside that end is under another bank's soil (a bank standing on the floor at its end), so
// the run is a lone strip; UNDER ART when a painted stone/log's art (pieceBox / rock / hollow) is over it with its foot at the floor's top.
// Visible px: the real draw rendered with the run on and off (needs the probe-only __noLipUnder hook), pixels that differ in the run's box.
//   node lipprobe.mjs <port> <diff> <out.jsonl> <shots dir> <stage:layout> ...
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, diff, out, shots, ...jobs] = process.argv.slice(2);
fs.mkdirSync(shots, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const job of jobs) {
  const [stage, layout] = job.split(':');
  const ctx = await b.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1 });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
  await ctx.addInitScript(() => { let s = 12345; Math.random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    window.__freezeNow = () => { let now = 100000; performance.now = () => now; window.__tick = (ms) => { now += ms; }; }; });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message.slice(0, 160)));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await p.evaluate(() => typeof window.__play === 'function')) break; await p.waitForTimeout(1000); }
  await p.waitForTimeout(1500);
  await p.evaluate(([s, v]) => window.__play(s, v), [stage, +layout]);
  await p.waitForTimeout(5000);
  for (let k = 0; k < 30; k++) { const up = await p.evaluate(() => document.documentElement.dataset.hudCard === '1'); if (!up) break; await p.mouse.click(457, 206); await p.waitForTimeout(400); }
  await p.evaluate(() => window.__freezeNow?.());
  const res = await p.evaluate(async (E) => {
    const e = eval(E);
    e.isPaused = true;
    const url = (n) => performance.getEntriesByType('resource').map((r) => new URL(r.name)).filter((u) => u.pathname === n).map((u) => u.pathname + u.search)[0] ?? n;
    const W = await import(url('/src/game/w1CutArt.ts'));
    const P = await import(url('/src/game/protoArt.ts'));
    const B = await import(url('/src/game/w1Pits.ts'));
    window.__mods = [url('/src/game/w1CutArt.ts'), url('/src/game/protoArt.ts')];
    const banks = e.platforms.filter((q) => !q.broken && B.paintedBank(q));
    const pieces = [];
    for (const q of e.platforms) {
      if (q.hidden || q.broken) continue;
      if (q.cut && W.W1_CUT?.[q.cut]) { const bx = W.pieceBox ? W.pieceBox(q, q.cut) : W.cutBox(q, W.W1_CUT[q.cut]); pieces.push({ id: q.id, kind: q.cut, x0: bx.x, x1: bx.x + bx.w, foot: q.y + q.height }); }
      else if ((q.height === 50 && q.style === 'moss_stone') || q.art === 'rock') pieces.push({ id: q.id, kind: 'rock', x0: q.x - q.width * 0.075, x1: q.x + q.width * 1.075, foot: q.y + q.height });
      else if (q.hollow) pieces.push({ id: q.id, kind: 'hollow', x0: q.x, x1: q.x + q.width, foot: q.y + q.height });
    }
    const runs = [];
    for (const f of banks) for (const right of [false, true]) {
      const u = P.lipUnder(f, banks, right);
      if (!u) continue;
      const end = right ? f.x + f.width : f.x;
      const L = right ? [end, end + u] : [end - u, end];
      // (the floor's own lip just inside that end, 4-24 px in, under a bank standing on the floor there)
      const ins = right ? [end - 24, end - 4] : [end + 4, end + 24];
      const cover = banks.find((o) => o !== f && o.y < f.y - 2 && o.y + o.height >= f.y - 3 && o.x <= ins[0] + 1 && o.x + o.width >= ins[1] - 1);
      const art = pieces.filter((pc) => pc.x0 < L[1] - 2 && pc.x1 > L[0] + 2 && Math.abs(pc.foot - f.y) <= 4);
      runs.push({ floor: f.id, side: right ? 'R' : 'L', x0: Math.round(L[0]), x1: Math.round(L[1]), y: Math.round(f.y), orphan: cover ? cover.id : null, art: art.map((a) => `${a.id}:${a.kind}`) });
    }
    const cv = [...document.querySelectorAll('canvas')].sort((a, c) => c.width * c.height - a.width * a.height)[0];
    const c2 = cv.getContext('2d', { willReadFrequently: true });
    const shot = async (r) => {
      const cx = (r.x0 + r.x1) / 2;
      Object.assign(e.player, { x: cx - e.player.width / 2, y: r.y - 400, vx: 0, vy: 0, grounded: false, invincibleTimer: 9 });
      for (let i = 0; i < 3; i++) { window.__tick?.(33.3); e.update(1 / 30); e.clearGuide?.(); }
      e.player.y = r.y - 3000;
      const k = (cv.width / window.innerWidth) * e.zoom;
      const grab = () => { e.camera.x = cx - e.camera.viewportWidth / 2; e.camera.y = r.y - e.camera.viewportHeight / 2; for (let i = 0; i < 6; i++) e.render(); };
      const X0 = Math.round((r.x0 - 2 - (cx - e.camera.viewportWidth / 2)) * k), X1 = Math.round((r.x1 + 2 - (cx - e.camera.viewportWidth / 2)) * k);
      const Y0 = Math.round((r.y - 6 - (r.y - e.camera.viewportHeight / 2)) * k), Y1 = Math.round((r.y + 40 - (r.y - e.camera.viewportHeight / 2)) * k);
      globalThis.__liveGround = 1; globalThis.__noLipUnder = 0; grab();
      const a = c2.getImageData(X0, Y0, X1 - X0, Y1 - Y0).data; const url = cv.toDataURL('image/jpeg', 0.85);
      globalThis.__noLipUnder = 1; grab();
      const bb = c2.getImageData(X0, Y0, X1 - X0, Y1 - Y0).data;
      globalThis.__noLipUnder = 0; globalThis.__liveGround = 0;
      let n = 0; const rows = new Set();
      for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - bb[i]) + Math.abs(a[i + 1] - bb[i + 1]) + Math.abs(a[i + 2] - bb[i + 2]) > 24) { n++; rows.add(Math.floor(i / 4 / (X1 - X0))); }
      return { px: n, rows: rows.size, url, box: [X0, Y0, X1, Y1] };
    };
    for (const r of runs) if (r.orphan !== null || r.art.length) { const s = await shot(r); r.visPx = s.px; r.visRows = s.rows; r.url = s.url; r.box = s.box; }
    return { mods: window.__mods, id: e.currentStage?.config?.id, seed: e.currentStage?.gen2?.seed ?? e.currentStage?.seed, runs };
  }, E);
  for (const r of res.runs) if (r.url) { const f = path.join(shots, `${stage}-L${layout}-${diff}-seed${res.seed}-floor${r.floor}${r.side}-x${r.x0}.jpg`); fs.writeFileSync(f, Buffer.from(r.url.split(',')[1], 'base64')); r.shot = f; delete r.url; }
  const hit = res.runs.filter((r) => r.orphan !== null && r.art.length && r.visPx > 20);
  const lone = res.runs.filter((r) => r.orphan !== null && !r.art.length && r.visPx > 20);
  console.log(res.mods.join(' '));
  console.log(job, diff, 'seed', res.seed, 'lipRuns', res.runs.length, 'TAB_UNDER_ART', hit.length, hit.map((r) => `f${r.floor}${r.side}@${r.x0}-${r.x1} art[${r.art}] px${r.visPx}`).join(' | '), '|| LONE', lone.length, lone.map((r) => `f${r.floor}${r.side}@${r.x0} px${r.visPx}`).join(' '));
  fs.appendFileSync(out, JSON.stringify({ job, diff, ...res }) + '\n');
  await ctx.close();
}
await b.close();
