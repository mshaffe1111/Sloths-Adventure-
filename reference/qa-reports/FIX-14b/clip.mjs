// FIX-14b: the clips of 1-4's built pieces (no mock), from the real game, stepped frame by frame at 30 fps, a frame kept every 2nd step
// (15 fps), at 2x. Captions are a page overlay. Prints what the game BUILT (D62): difficulty from localStorage, seed, orientation.
//   node clip.mjs <port> <out> gate|vines|pods [difficulty] [up|side]
import fs from 'node:fs';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, MODE, diff = 'normal', ori = 'up'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2 });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('1-4', 0));
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(5000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.evaluate((E) => {
  const e = eval(E); e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  const d = document.createElement('div'); d.id = 'mockcap';
  Object.assign(d.style, { position: 'fixed', left: '12px', right: '12px', top: window.innerWidth > window.innerHeight ? '64px' : '120px', zIndex: 99999, font: '700 19px system-ui, sans-serif', color: '#fff', background: 'rgba(20,30,12,0.78)', borderRadius: '12px', padding: '10px 14px', textAlign: 'center', lineHeight: '1.3' });
  document.body.appendChild(d);
}, E);
let frame = 0, n = 0;
const cap = (html) => p.evaluate((h) => { document.getElementById('mockcap').innerHTML = h; }, html);
const step = async (inp = {}, frames = 1, opt = {}) => {
  let r;
  for (let i = 0; i < frames; i++) {
    r = await p.evaluate(([E, inp, opt]) => {
      const e = eval(E); const s = e.input.state;
      Object.assign(s, { up: !!inp.up, down: !!inp.down, left: !!inp.left, right: !!inp.right, jumpHeld: !!inp.jump, jumpPressed: !!inp.jump });
      if (opt.safe) e.player.invincibleTimer = 9;
      e.update(1 / 30); if (opt.safe) e.player.invincibleTimer = 0; e.clearGuide?.(); e.render();
      const P = e.player;
      return { y: P.y, x: P.x, climbing: !!P.climbing, grounded: !!P.grounded, two: !!e.hands?.b };
    }, [E, inp, opt]);
    if (opt.noShot) continue;
    if (n++ % 2 === 0) { await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); await p.screenshot({ path: `${out}/f${String(frame++).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 82 }); }
  }
  return r;
};
const hold = (frames, opt) => step({}, frames, opt);

const built = await p.evaluate(([E, ori]) => {
  const e = eval(E);
  return { difficulty: localStorage.getItem('sloth_difficulty'), seed: e.currentStage?.gen2?.seed ?? e.currentStage?.proto?.gen2?.seed, orientation: ori, view: [innerWidth, innerHeight] };
}, [E, ori]);
console.log('BUILT', JSON.stringify(built));
if (MODE === 'gate') {
  const g = await p.evaluate((E) => {
    const e = eval(E); const g = [...e.field.gates].sort((a, z) => z.clusters.length - a.clusters.length)[0]; const bough = e.platforms.find((q) => q.id === g.platform);
    const cs = g.clusters.map((id) => e.clusters.find((c) => c.id === id)); const vs = cs.map((c) => e.vines.find((v) => v.id === c.vine));
    e.field.pods = [];
    window.__m = { vs, g, bough };
    Object.assign(e.player, { x: vs[0].x, y: vs[0].bottomY - 4, vx: 0, vy: 0, climbing: false, facing: 1 });
    return { gate: g.id, figs: cs.length, bough: { y: bough.y, w: bough.width }, vines: vs.map((v) => v.x) };
  }, E);
  console.log('GATE', JSON.stringify(g));
  const head = () => p.evaluate((E) => { const e = eval(E); const s = e.field.shutBoughAt(e.player.x, e.player.y); return s ? Math.round(s.under - (e.player.y - 89)) : null; }, E);
  let worst = -1e9;
  const watch = async (inp, n) => { for (let i = 0; i < n; i++) { await step(inp, 1, { safe: true }); const h = await head(); if (h !== null) worst = Math.max(worst, h); } };
  await hold(40, { safe: true, noShot: true });
  await cap('A gate of two figs. Each fig is <b>tied</b> to the leaf thatch.'); await hold(24, { safe: true });
  await cap('Push the fig up: its tie <b>strains</b>…'); await watch({ up: true }, 40);
  await cap('…and <b>SNAPS</b> when it is all the way up.'); await watch({ up: true }, 20);
  await cap('Hold up: his head stops <b>under</b> the bough.'); await watch({ up: true }, 22);
  await cap('Jump: still under. No way over while a tie holds.'); await watch({ up: true, jump: true }, 1); await watch({ up: true }, 26);
  for (let k = 1; k < g.figs; k++) {
    const last = k === g.figs - 1;
    await p.evaluate(([E, k]) => { const e = eval(E); const v = window.__m.vs[k]; e.hands = null; Object.assign(e.player, { x: v.x, y: v.bottomY - 4, vx: 0, vy: 0, climbing: false }); }, [E, k]);
    await step({ up: true }, 2, { safe: true, noShot: true }); await hold(40, { safe: true, noShot: true });
    await cap(last ? 'The last fig: its tie snaps and the thatch is <b>thrown off</b>.' : `Fig ${k + 1}: another tie strains and snaps.`); await hold(8, { safe: true }); await watch({ up: true }, last ? 60 : 40);
  }
  await cap('The way up is open.'); await step({ up: true }, 40, { safe: true });
  console.log('HEAD most over the shut underside (px, <= 0 is under):', worst);
}
if (MODE === 'pods') {
  const pod = await p.evaluate((E) => {
    const e = eval(E); const pods = [...e.field.pods].sort((a, z) => z.land - a.land); const pod = pods[0];
    window.__m = { pod }; const x = pod.x + 70;
    const under = e.platforms.filter((q) => !q.broken && x >= q.x && x <= q.x + q.width && q.y >= pod.land - 30).sort((a, z) => a.y - z.y)[0];
    e.hands = null; Object.assign(e.player, { x, y: under ? under.y : pod.land, vx: 0, vy: 0, climbing: false, grounded: true, facing: -1 });
    return { x: pod.x, top: pod.top, land: pod.land, speed: pod.speed, clock: pod.clock };
  }, E);
  console.log('POD', JSON.stringify(pod));
  const phase = () => p.evaluate((E) => { const e = eval(E); const P = window.__m.pod; return e.fieldHost.beat(P.clock, P.shift).phase; }, E);
  await hold(30, { noShot: true });
  for (let i = 0; i < 300; i++) { if ((await phase()) === 'off' || (await phase()) === 'rest') break; await hold(1, { noShot: true }); }
  for (let i = 0; i < 300; i++) { if ((await phase()) === 'warn') break; await hold(1, { noShot: true }); }
  await hold(6, { noShot: true });
  await cap('The pod\'s <b>vine lights up and shakes</b>, dust sifts down: 1.5 s…'); await hold(40);
  await cap('…then it drops, slow (300 px/s).'); await hold(40);
  await cap('A long quiet before the next.'); await hold(30);
}
if (MODE === 'vines') {
  const pair = await p.evaluate((E) => {
    const e = eval(E); e.field.pods = [];
    const fv = e.vines.filter((v) => v.field);
    for (const c of e.collectibles) {
      if (c.type !== 'flower' || c.collected) continue;
      const a = fv.find((v) => v.x < c.x && c.x - v.x > 30 && c.x - v.x < 50 && c.y > v.topY + 60 && c.y < v.bottomY - 120);
      const b2 = a && fv.find((v) => v !== a && v.x > c.x && Math.abs((a.x + v.x) / 2 - c.x) < 2 && c.y > v.topY + 60 && c.y < v.bottomY - 120);
      if (a && b2) { const run = e.collectibles.filter((q) => q.type === 'flower' && Math.abs(q.x - c.x) < 2 && q.y > a.topY && q.y < a.bottomY); window.__m = { a, b: b2, run, keep: run.map((q) => ({ ...q })) }; return { a: a.x, b: b2.x, petals: run.length, x: c.x }; }
    }
    return null;
  }, E);
  console.log('PAIR', JSON.stringify(pair));
  for (const two of [false, true]) {
    await p.evaluate(([E, two]) => { const e = eval(E); const { a, run } = window.__m; for (const q of run) q.collected = false; e.hands = null; Object.assign(e.player, { x: a.x, y: a.bottomY - 4, vx: 0, vy: 0, climbing: false, grounded: false, facing: 1 }); }, [E, two]);
    await step({ up: true }, 2, { noShot: true }); await hold(30, { noShot: true });
    let t = 0;
    for (let i = 0; i < 70; i++) {
      const side = two && i >= 3;
      const r = await step({ up: true, right: side }, 1); t += 1 / 30;
      const got = await p.evaluate(() => window.__m.run.filter((q) => q.collected).length);
      await cap(`${two ? '<b>TWO VINES</b>: push across while climbing (1.6× up)' : '<b>ONE VINE</b>'}<br>${t.toFixed(1)} s · petals ${got}/${await p.evaluate(() => window.__m.run.length)}`);
      if (!r.climbing) break;
    }
    console.log(two ? 'TWO' : 'ONE', t.toFixed(2), 's petals', await p.evaluate(() => window.__m.run.filter((q) => q.collected).length));
    await hold(15);
  }
}
await ctx.close(); await b.close();
console.log('FRAMES', frame);
