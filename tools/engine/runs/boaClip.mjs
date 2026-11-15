// tools/engine/runs/boaClip.mjs (ENG-19a, R-165.257): clips of 1-9's engine pieces on a TOY, from the real game (a dev build: the page's
// window.__engine), every input through the real touch pad (inputEngine.ts triggerTouchMove, as tools/inspect/clipPress.mjs pressFrame),
// each frame stepped as the game loop steps it (engine.ts: while slowMoLeft > 0 the step is dt x 0.3 and slowMoLeft runs down by real
// dt), then drawn. The toy: 1-3's page with its stage swapped for one long bough and a boa on the kit (proto.cast, e.startCast()).
//   node tools/engine/runs/boaClip.mjs <port> <out dir> freeze|late|roost [up|side] [normal|easy]
//     freeze  he runs in, lifts his thumb 5 frames into the 1.0 s rear: beaten by stillness inside its reach, 0.6 s of slow motion
//     late    he lifts 16 frames into the rear (past Normal's 13): it strikes him
//     roost   a lure post (the eagle's roost, reach 150) 100 px past the boa: it rears at him and flees in its first rear frame
// Every 2nd frame is shot (15 fps at 2x); frames.txt names each shot's frame, the boa's phase, the slow motion left, his x: a claim in
// the report names the frame it shows (D69).
import fs from 'node:fs';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, MODE = 'freeze', ori = 'up', diff = 'normal'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2 });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('1-3', 1));
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(4000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player && e.cast); }, E, { timeout: 60000 });
const toy = await p.evaluate(([E, MODE]) => {
  const e = eval(E);
  e.isPaused = true;
  for (const h of e.currentStage?.proto?.hints ?? []) h.shown = true;
  // (the toy: one long bough where he stands, a boa 640 px on, facing him; the roost 100 px past it in 'roost')
  const Y = Math.round(e.player.y), X0 = Math.round(e.player.x) - 200;
  const bough = { id: 9901, x: X0, y: Y, width: 1600, height: 26, type: 'solid' };
  e.platforms.length = 0;
  e.platforms.push(bough);
  const bx = X0 + 840;
  const boa = { id: 9902, type: 'boa', x: bx, y: Y - 16, vx: 0, vy: 0, width: 58, height: 26, hp: 1, maxHp: 1, facing: -1, patrolMinX: bx, patrolMaxX: bx,
    attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0 };
  e.enemies.length = 0;
  e.enemies.push(boa);
  e.vines.length = 0;
  e.collectibles.length = 0;
  e.proto.cast = { kinds: ['boa'], traps: [], ...(MODE === 'roost' ? { lures: [{ x: bx + 100, y: Y, fear: 'eagle', reach: 150 }] } : {}) };
  e.startCast();
  Object.assign(e.player, { x: X0 + 200, y: Y, vx: 0, vy: 0, facing: 1, hp: e.player.maxHp });
  e.checkpoint = { x: X0 + 200, y: Y };
  window.__toy = { boa, bx };
  return { Y, bx, members: e.cast.members.length, kinds: e.proto.cast.kinds };
}, [E, MODE]);
console.log('TOY', JSON.stringify({ mode: MODE, ori, diff, ...toy }));
// (the stage's goal card holds on real time, about 4.5 s, GoalCard.tsx: a key pokes it to the counter as a first move does; then it is gone)
await p.waitForTimeout(1500);
await p.keyboard.press('Shift');
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 15000 }).catch(() => console.log('CARD still up'));
await p.waitForTimeout(800);
const log = [];
let frame = 0, n = 0;
/** one game frame: the thumb through the pad, the loop's step (slow motion as engine.ts steps it), drawn; every 2nd shot */
const step = async (right) => {
  const r = await p.evaluate(([E, right]) => {
    const e = eval(E), P = e.player, k = window.__toy.boa.kit;
    e.input.triggerTouchMove(right ? 'right' : 'none');
    const DT = 1 / 30;
    let sdt = DT * (e.speedScale ?? 1);
    if (e.slowMoLeft > 0) { e.slowMoLeft -= DT; sdt = DT * 0.3 * (e.speedScale ?? 1); }
    e.update(sdt);
    e.render();
    return { x: Math.round(P.x), vx: Math.round(P.vx), hp: P.hp, phase: k?.phase, by: k?.beatenBy ?? null, slow: Math.round(e.slowMoLeft * 100) / 100, zoom: e.slowMoZoom };
  }, [E, right]);
  if (n++ % 2 === 0) {
    await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => res(0))));
    const f = `f${String(frame++).padStart(4, '0')}.jpg`;
    await p.screenshot({ path: `${out}/${f}`, type: 'jpeg', quality: 82 });
    log.push(`${f} step ${n - 1} x ${r.x} vx ${r.vx} hp ${r.hp} boa ${r.phase}${r.by ? ` beaten:${r.by}` : ''} slow ${r.slow}`);
  }
  return r;
};
const LIFT = MODE === 'late' ? 16 : 5;
// (the stage's card runs on game frames: 100 frames standing still, unshot, so it has gone before the run; he is 640 px from the boa)
for (let i = 0; i < 100; i++) await p.evaluate((E) => { const e = eval(E); e.input.triggerTouchMove('none'); e.update(1 / 30); }, E);
let told = -1;
for (let i = 0; i < 150; i++) {
  const r = await step(told < 0 || i - told < LIFT);
  if (told < 0 && r.phase === 'tell') { told = i; console.log('REAR at step', i, 'x', r.x); }
  if (told >= 0 && i - told === LIFT) console.log('LIFT at step', i, 'x', r.x);
  if (r.by && !log.some((q) => q.includes('BEATEN'))) { log.push(`BEATEN by ${r.by} at step ${i}`); console.log('BEATEN', r.by, 'step', i); }
  if (r.slow > 0 && !log.some((q) => q.startsWith('SLOW'))) { log.push(`SLOW from step ${i} (${r.slow} s left, zoom ${r.zoom})`); console.log('SLOW from step', i); }
}
const end = await p.evaluate((E) => { const e = eval(E); return { hp: e.player.hp, max: e.player.maxHp, by: window.__toy.boa.kit?.beatenBy ?? null }; }, E);
log.push(`END hp ${end.hp}/${end.max} beaten ${end.by}`);
console.log('END', JSON.stringify(end));
fs.writeFileSync(`${out}/frames.txt`, log.join('\n') + '\n');
await b.close();
