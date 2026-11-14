// FIX-14b: a still of the first unreached checkpoint flag on each stage named, upright 412x915 at 1x, cropped round the flag; prints the
// BUILT setting (D62).  PW=... node flag.mjs <port> <outDir> <tag> 1-1,1-4,3-1
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, tag, ids = '1-1,1-4,3-1'] = process.argv.slice(2);
const b = await chromium.launch();
for (const id of ids.split(',')) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); } catch {} });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
  await p.evaluate(([id, k]) => { window.__cpIndex = k; window.__play(id, 0); }, [id, Number(process.env.CP ?? 0)]);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(5000);
  const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
  const info = await p.evaluate((E) => {
    const e = eval(E); e.isPaused = true;
    const cp = (e.currentStage.checkpoints ?? []).filter((c) => !c.reached)[Number(window.__cpIndex ?? 0)];
    Object.assign(e.player, { x: cp.x - 110, y: cp.y, vx: 0, vy: 0, climbing: false, grounded: true });
    for (let i = 0; i < 60; i++) e.update(1 / 30);
    cp.reached = false; e.render();
    const z = e.camera.zoom ?? 1;
    return { difficulty: localStorage.getItem('sloth_difficulty'), seed: e.currentStage?.gen2?.seed ?? e.currentStage?.proto?.gen2?.seed ?? null, cp: { x: cp.x, y: cp.y }, sx: (cp.x - e.camera.x) * z, sy: (cp.y - e.camera.y) * z };
  }, E);
  const cx = Math.max(0, Math.min(412 - 260, info.sx - 130)), cy = Math.max(0, Math.min(915 - 300, info.sy - 220));
  await p.screenshot({ path: `${out}/flag-${id}-${tag}.jpg`, type: 'jpeg', quality: 85, clip: { x: cx, y: cy, width: 260, height: 300 } });
  console.log(id, tag, 'upright', JSON.stringify(info));
  await ctx.close();
}
await b.close();
