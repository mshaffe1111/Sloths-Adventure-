// READY-27 stills of the home toy (?fixture=home via __play('2-97'), a DEV server): Pokey stood at x (on the platform under x at or
// below y, else the lowest), the boat set boatDx px from him, every door opened when `open`; upright and sideways at DSF (default 2).
//   node stills27.mjs <port> <out> '<json spots: [{name,x,y?,boatDx?,open?}]>'
import fs from 'node:fs';
import path from 'node:path';
const pw = await import(process.env.PW ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const [port, out, spotsJson] = process.argv.slice(2);
const spots = JSON.parse(spotsJson);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: Number(process.env.DSF ?? 2) })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.__play('2-97', 1));
  await p.waitForTimeout(6000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(4000);
  const built = await p.evaluate((E) => { const e = eval(E); const st = e.currentStage; return { difficulty: localStorage.getItem('sloth_difficulty'), dress: st?.columnDress, doors: st?.post?.doors, letters: st?.collectibles?.filter((c) => c.mark).length, pieces: e.pieces?.map((q) => q.kind) }; }, E);
  console.log(tag, 'built', JSON.stringify(built));
  for (const s of spots) {
    const info = await p.evaluate(([s, E]) => {
      const e = eval(E);
      e.isPaused = true;
      const x = s.x;
      const unders = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && !q.drift && x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y);
      const under = s.y !== undefined ? unders.find((q) => Math.abs(q.y - s.y) < 4) ?? unders[0] : unders[0];
      Object.assign(e.player, { x, y: under ? under.y : 1500, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: s.face ?? -1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 90; i++) { e.player.vx = 0; e.update(1 / 30); }
      const pc = e.pieces?.find((q) => q.kind === 'pacer');
      if (pc && s.boatDx !== undefined) { const P = pc.pacer; const bx = x + Number(s.boatDx); pc.clock = Math.max(0.01, ((bx - P.x0) / (P.x1 - P.x0)) * P.seconds); }
      const post = e.pieces?.find((q) => q.kind === 'post');
      if (post && s.open) post.open.fill(true);
      return { px: Math.round(e.player.x), py: Math.round(e.player.y), on: under ? `${under.style} y${under.y}` : null, cam: Math.round(e.camera.x), boat: pc ? Math.round(pc.x) : null };
    }, [s, E]);
    for (let i = 0; i < 8; i++) {
      await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.render(); }, E);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
    const file = path.join(out, `${s.name}-${tag}.jpg`);
    await p.screenshot({ path: file, type: 'jpeg', quality: 80 });
    console.log('wrote', file, JSON.stringify(info));
  }
  await p.context().close();
}
await b.close();
