// FIX-14 step 2 SHOW FIRST: the two mock clips, recorded from the real game (t-fix-14-mock's code-drawn stand-ins), stepped frame by frame
// at 30 fps, a frame kept every 2nd step (15 fps), upright 412x915 at 2x. Captions are a page overlay. Prints what the game BUILT (D62).
//   node mockclip.mjs <port> <out> a|b [difficulty]
import fs from 'node:fs';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, MODE, diff = 'normal'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
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
  Object.assign(d.style, { position: 'fixed', left: '12px', right: '12px', top: '120px', zIndex: 99999, font: '700 19px system-ui, sans-serif', color: '#fff', background: 'rgba(20,30,12,0.78)', borderRadius: '12px', padding: '10px 14px', textAlign: 'center', lineHeight: '1.3' });
  document.body.appendChild(d);
  const m = document.createElement('div'); m.id = 'mocktag';
  Object.assign(m.style, { position: 'fixed', right: '10px', bottom: '14px', zIndex: 99999, font: '600 12px system-ui', color: '#fff', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', padding: '4px 8px' });
  m.textContent = 'MOCK: code-drawn stand-ins'; document.body.appendChild(m);
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

if (MODE === 'b') {
  const built = await p.evaluate((E) => {
    const e = eval(E); const g = e.field.gates[1]; const bough = e.platforms.find((q) => q.id === g.platform);
    const cs = g.clusters.map((id) => e.clusters.find((c) => c.id === id)); const vs = cs.map((c) => e.vines.find((v) => v.id === c.vine));
    window.__m = { vs };
    Object.assign(e.player, { x: vs[0].x, y: vs[0].bottomY - 4, vx: 0, vy: 0, climbing: false, facing: 1 });
    return { difficulty: localStorage.getItem('sloth_difficulty'), seed: e.currentStage?.gen2?.seed ?? e.currentStage?.proto?.gen2?.seed, gate: 1, figs: cs.length, bough: { y: bough.y, under: bough.y + bough.height }, vines: vs.map((v) => v.x) };
  }, E);
  console.log('BUILT', JSON.stringify(built), 'upright');
  await hold(40, { safe: true, noShot: true });
  await cap('A gate of two figs. Each fig is <b>tied</b> to the thatch.'); await hold(24, { safe: true });
  await cap('Push the fig up: its tie <b>strains</b>…'); await step({ up: true }, 50, { safe: true });
  await cap('…and <b>SNAPS</b> when it is all the way up.'); await step({ up: true }, 16, { safe: true });
  await cap('Hold up: his head stops <b>under</b> the bough.'); await step({ up: true }, 22, { safe: true });
  await cap('Jump: still under. No way over while a tie holds.'); await step({ up: true, jump: true }, 1, { safe: true }); await step({ up: true }, 26, { safe: true });
  await p.evaluate((E) => { const e = eval(E); const v = window.__m.vs[1]; e.hands = null; Object.assign(e.player, { x: v.x, y: v.bottomY - 4, vx: 0, vy: 0, climbing: false }); }, E);
  await step({ up: true }, 2, { safe: true, noShot: true }); await hold(40, { safe: true, noShot: true });
  await cap('The last fig: its tie snaps and the thatch is <b>thrown off</b>.'); await hold(8, { safe: true }); await step({ up: true }, 70, { safe: true });
  await cap('The way up is open.'); await step({ up: true }, 40, { safe: true });
} else {
  const built = await p.evaluate((E) => {
    const e = eval(E); const pods = [...e.field.pods].sort((a, z) => z.land - a.land); const pod = pods[0];
    const field = e.vines.filter((v) => v.field && Math.abs(v.bottomY - pod.land) < 40).sort((a, z) => a.x - z.x);
    const k = field.findIndex((v) => Math.abs(v.x - pod.x) < 4);
    // a pair of vines beside the pod's column, not on it
    let j = k >= 2 ? k - 2 : k + 1; if (j + 1 >= field.length || j + 1 === k) j = k >= 2 ? k - 2 : 0;
    window.__m = { pod, a: field[j], b: field[j + 1] };
    return { difficulty: localStorage.getItem('sloth_difficulty'), seed: e.currentStage?.gen2?.seed ?? e.currentStage?.proto?.gen2?.seed, pod: { x: pod.x, top: pod.top, land: pod.land }, vines: field.map((v) => v.x), pair: [field[j].x, field[j + 1].x], fieldH: Math.round(field[0].bottomY - field[0].topY) };
  }, E);
  console.log('BUILT', JSON.stringify(built), 'upright');
  for (const two of [false, true]) {
    const st = await p.evaluate(([E, two]) => {
      const e = eval(E); const { a, b } = window.__m; const mid = (a.x + b.x) / 2; const H = a.bottomY - a.topY;
      e.hands = null; Object.assign(e.player, { x: a.x, y: a.bottomY - 4, vx: 0, vy: 0, climbing: false, grounded: false, facing: 1 });
      window.__m.petals = [0.45, 0.7].map((f, i) => ({ id: 990000 + i + (two ? 10 : 0), type: 'flower', x: mid, y: a.bottomY - 20 - H * f, collected: false, bobPhase: i }));
      e.collectibles.push(...window.__m.petals);
      return { mid };
    }, [E, two]);
    await step({ up: true }, 2, { noShot: true }); await hold(40, { noShot: true });
    // hold on at the bottom until the pod's vine lights up (its tell), then go
    await cap(two ? '<b>TWO VINES</b> (1.6× faster up)' : '<b>ONE VINE</b>'); await step({ up: true }, 2);
    for (let i = 0; i < 200; i++) { const ph = await p.evaluate((E) => eval(E).field.lastPhase.get(window.__m.pod), E); if (ph === 'warn') break; await hold(1); }
    if (two) await step({ right: true }, 2);
    let t = 0, done = false; const t0 = Date.now();
    for (let i = 0; i < 75 && !done; i++) {
      const r = await step({ up: true }, 1); t += 1 / 30;
      const got = await p.evaluate(() => window.__m.petals.filter((q) => q.collected).length);
      await cap(`${two ? '<b>TWO VINES</b> (1.6× faster up)' : '<b>ONE VINE</b>'}<br>${t.toFixed(1)} s · petals ${got}/2${two ? '' : ' (they hang between the vines)'}`);
      if (!r.climbing && r.grounded) done = true;
    }
    const got = await p.evaluate(() => window.__m.petals.filter((q) => q.collected).length);
    console.log(two ? 'TWO' : 'ONE', 'top in', t.toFixed(2), 's, petals', got);
    await hold(20);
    await p.evaluate((E) => { const e = eval(E); for (const q of window.__m.petals) { const i = e.collectibles.indexOf(q); if (i >= 0) e.collectibles.splice(i, 1); } }, E);
  }
  await p.evaluate((E) => {
    const e = eval(E); const { pod } = window.__m; const x = pod.x + 70;
    const under = e.platforms.filter((q) => !q.broken && x >= q.x && x <= q.x + q.width && q.y >= pod.land - 30).sort((a, z) => a.y - z.y)[0];
    e.hands = null; Object.assign(e.player, { x, y: under ? under.y : pod.land, vx: 0, vy: 0, climbing: false, grounded: true, facing: -1 });
  }, E);
  await hold(45, { noShot: true });
  for (let i = 0; i < 200; i++) { const ph = await p.evaluate((E) => eval(E).field.lastPhase.get(window.__m.pod), E); if (ph === 'burst' || ph === 'gone') break; await hold(1, { noShot: true }); }
  await cap('The pod warns for 1.5 s: its vine <b>glows and shivers</b>, dust sifts down…');
  for (let i = 0; i < 200; i++) { const ph = await p.evaluate((E) => eval(E).field.lastPhase.get(window.__m.pod), E); if (ph === 'warn') break; await hold(1); }
  await hold(45);
  await cap('…then it falls at <b>half</b> the old speed (300 px/s, was 620).');
  await hold(45);
}
await ctx.close(); await b.close();
console.log('FRAMES', frame);
