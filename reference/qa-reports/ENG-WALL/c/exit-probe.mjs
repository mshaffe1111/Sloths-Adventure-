// ENG-WALL-c: why a PLAYED frame falls to the live ground path. On a tree whose drawGroundChunks pushes its exit reason into
// globalThis.__gcLog (the local experiment commit, never shipped), the game runs its OWN loop (not paused, no settled re-renders) and
// every frame's reason is counted: a stage start, standing still, a respawn, the fastest descent.
//   node exit-probe.mjs <port> <out> [upright|sideways]
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const fs = await import('node:fs');
const [port, out, orient = 'upright'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const [W, H] = orient === 'upright' ? [412, 915] : [915, 412];
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
// (THROTTLE=4: the CPU slowed 4x, PERFORMANCE-RULES' mid-range phone stand-in)
if (+process.env.THROTTLE > 1) await (await p.context().newCDPSession(p)).send('Emulation.setCPUThrottlingRate', { rate: +process.env.THROTTLE });
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(3000);
const take = async (name) => {
  const r = await p.evaluate(() => { const l = globalThis.__gcLog || []; globalThis.__gcLog = []; return l; });
  const n = {};
  // (a reason's class: 'ok', 'missing', 'missing after reset: key' (the key's values dropped), with the ground's ms and squares painted summed)
  const cls = {};
  for (const s of r) {
    const [why, ms = '0', pt = '0'] = s.split(/ \|ms:|\|p:/);
    const k = why.replace(/: key .*/, ': key').slice(0, 160); n[k] = (n[k] || 0) + 1;
    const c = (cls[k] ??= { frames: 0, ms: 0, worstMs: 0, painted: 0 }); c.frames++; c.ms += +ms; c.worstMs = Math.max(c.worstMs, +ms); c.painted += +pt;
  }
  for (const c of Object.values(cls)) { c.ms = +c.ms.toFixed(1); c.worstMs = +c.worstMs.toFixed(1); }
  return { name, frames: r.length, reasons: n, cost: cls, first12: r.slice(0, 12).map((s) => s.slice(0, 200)) };
};
const cases = [];
await p.evaluate(() => { globalThis.__gcLog = []; window.__play('2-97', 1); });
await p.waitForTimeout(6000);
cases.push(await take('stage start (first 6 s, real play, card up)'));
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(500); await take('-');
await p.waitForTimeout(2000);
cases.push(await take('standing still (2 s, real play)'));
const hasRespawn = await p.evaluate((E) => typeof eval(E).respawnAtCheckpoint === 'function', E);
if (hasRespawn) {
  await p.evaluate((E) => { const e = eval(E); e.player.x = 19900; e.respawnAtCheckpoint('fall'); }, E);
  await p.waitForTimeout(3000);
  cases.push(await take('respawn (respawnAtCheckpoint, 3 s real play)'));
}
// (a COLD respawn: the squares round the checkpoint pushed out first, by painting far more than CHUNK_BYTES keeps elsewhere)
if (hasRespawn) {
  for (let x = 3000; x <= 19000; x += 500) {
    await p.evaluate(([E, x]) => { const e = eval(E); const u = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width && !q.soil).sort((a, c) => c.y - a.y)[0]; Object.assign(e.player, { x, y: u ? u.y : 1400, vx: 0, vy: 0, invincibleTimer: 9 }); e.camera.x = x - e.camera.viewportWidth / 2; }, [E, x]);
    await p.waitForTimeout(150);
  }
  await take('-');
  await p.evaluate((E) => { const e = eval(E); e.respawnAtCheckpoint('fall'); }, E);
  await p.waitForTimeout(3000);
  cases.push(await take('COLD respawn (33 far views painted first, then respawnAtCheckpoint, 3 s real play)'));
}
await p.evaluate((E) => { const e = eval(E); Object.assign(e.player, { x: 18990, y: 600, vx: 0, vy: 950, grounded: false, hanging: false, climbing: false, invincibleTimer: 9 }); }, E);
await p.waitForTimeout(2500);
cases.push(await take('fast descent x 18990 from y 600 at maxFall (2.5 s real play)'));
const meta = await p.evaluate((E) => { const e = eval(E); return { platformsLen: e.platforms.length, cam: [e.camera.x, e.camera.y, e.camera.viewportWidth, e.camera.viewportHeight] }; }, E);
fs.writeFileSync(`${out}/exit-${orient}${process.env.THROTTLE ? '-x' + process.env.THROTTLE : ''}.json`, JSON.stringify({ meta, cases }, null, 1));
for (const c of cases) { console.log(`${orient}${process.env.THROTTLE ? ' CPU/' + process.env.THROTTLE : ''} | ${c.name}: ${c.frames} frames`); for (const [k, v] of Object.entries(c.cost)) console.log(`   ${v.frames} x ${k}: ground ${v.ms} ms in all (worst frame ${v.worstMs}), ${v.painted} squares painted`); }
await b.close();
