/**
 * The puzzle kit's phase 2a pieces (2026-10-28): the seesaw, the noise lure and the bell, the carried light, the wind shutter and the
 * pinwheel, the sluice gate, the trade, Pokey's carry poses for things other than an acorn; their rules, their check, and the kit test
 * room's new rooms played through in the real engine.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { flowRate, isLit, ITEM, KIT, kitPlatId, ledgeLit, seesawDy, seesawHalves, seesawTilt, sluiceFlow, stepFlow, tradeTakes, type PieceSpec } from './puzzleKit.ts';
import { heard, NOISE, prune, type Noise } from './noise.ts';
import { lureShadow } from './watcher.ts';
import { vineSees, type ThornVine } from './thornVine.ts';
import { zoneState, windPush, type Zone } from './zones.ts';
import { driftX, hopLimit, logClock, type DriftInfo, type RiverZone } from './river.ts';
import { stepPredator } from './predatorAI.ts';
import { buildKitStage, kitStageConfig, KIT_ROOMS, SEESAW } from './kitStage.ts';
import { validateStage } from './levelCheck.ts';
import { kitSolved } from './puzzleCheck.ts';
import { KitPlay } from './puzzlePlay.ts';
import { KIT_ART } from './puzzleAtlasData.ts';
import { RealPlay } from './realPlay.ts';
import type { Enemy } from './types.ts';

const G = 580;

// ───────────────────────────── the rules ─────────────────────────────

test('seesaw: the heavier end goes down and the other rises into a step; even weights rest it as it was built', () => {
  assert.equal(seesawTilt(5, 3), -1, 'a log on the left holds the left end down while Pokey stands on the right');
  assert.equal(seesawTilt(0, 3), 1, 'Pokey alone on the right end takes it down');
  assert.equal(seesawTilt(2, 3), 1, 'a stone (2) is lighter than Pokey (3)');
  assert.equal(seesawTilt(4, 3), -1, 'two stones are not');
  assert.equal(seesawTilt(0, 0, -1), -1);
  assert.equal(seesawTilt(1, 1, 0), 0);
  assert.deepEqual(seesawDy(-1, 110), [0, -110]);
  assert.deepEqual(seesawDy(1, 110), [-110, 0]);
  assert.deepEqual(seesawDy(0, 110), [-55, -55]);
  assert.deepEqual(seesawHalves(1000, 300), [{ x: 850, width: 150 }, { x: 1000, width: 150 }]);
  assert.ok(KIT.logWeight > KIT.pokeyWeight, 'a pushed log outweighs Pokey');
});

test('noise: a thrown stone, pebble or acorn is noisy; heard within its reach for a while, then forgotten', () => {
  assert.ok(ITEM.stone.noisy && ITEM.pebble.noisy && ITEM.acorn.noisy);
  assert.ok(!ITEM.cake.noisy && !ITEM.mushroom.noisy);
  const ns: Noise[] = [{ x: 1000, y: G, t: 10, r: NOISE.hear, from: 'land' }];
  assert.equal(heard(ns, 1000 + NOISE.hear - 1, G, 11)?.x, 1000);
  assert.equal(heard(ns, 1000 + NOISE.hear + 5, G, 11), null, 'too far');
  assert.equal(heard(ns, 1000, G - NOISE.hearY - 5, 11), null, 'too far up');
  assert.equal(heard(ns, 1000, G, 10 + NOISE.dur + 0.1), null, 'over');
  // the newest one wins
  ns.push({ x: 1200, y: G, t: 12, r: NOISE.bellHear, from: 'bell' });
  assert.equal(heard(ns, 1100, G, 12.5)?.x, 1200);
  prune(ns, 10 + NOISE.dur + 0.5);
  assert.equal(ns.length, 1);
  assert.ok(NOISE.bellHear > NOISE.hear, 'a bell carries further');
});

test('noise: the eagle circles over the noise, a listening thorn vine sees nothing, a snapper goes to it and notices nobody', () => {
  for (let t = 0; t < 5; t += 0.3) assert.ok(Math.abs(lureShadow(800, t) - 800) <= 46);
  const v: ThornVine = { x: 500, top: 100, bud: 470, reach: 105, sleep: 2, stir: 1, look: 2, offset: 0 };
  const moving = { x: 520, y: 560, vx: 200, grounded: true };
  assert.equal(vineSees(v, 3.5, moving), true, 'looking, it sees him move');
  assert.equal(vineSees(v, 3.5, moving, true), false, 'listening to a noise, it does not');
  // a snapper on its patrol, Pokey right in front of it: with a noise along its bank it walks to it, and never winds up a snap
  const turtle = (): Enemy => ({ id: 1, type: 'turtle', x: 400, y: G - 14, vx: 22, vy: 0, width: 48, height: 24, hp: 1, maxHp: 1, facing: 1, attackCooldown: 0, state: 'patrol', stateT: 0, patrolMinX: 200, patrolMaxX: 900 } as unknown as Enemy);
  const e = turtle();
  e.lureX = 800;
  for (let i = 0; i < 90; i++) stepPredator(e, { x: 460, y: G, facing: -1, ducking: false }, 1 / 30);
  assert.equal(e.state, 'patrol');
  assert.ok(e.x > 430, `it walked toward the noise (${e.x})`);
  assert.equal(e.facing, 1);
});

test('wind shutter: a shut gust lane is calm whatever its beat; a pinwheel spins only in a gust', () => {
  const z: Zone = { kind: 'wind', x0: 0, x1: 400, top: 0, bottom: 600, baseY: 600, dir: 1, period: 5.6, warn: 1.1, active: 2.2, offset: 0, force: 120 };
  const gust = 2.3 + 1.1 + 1.0;
  assert.ok(zoneState(z, gust).strength > 0.5);
  assert.ok(windPush([z], 100, 300, gust, false) > 0);
  z.shut = true;
  assert.equal(zoneState(z, gust).strength, 0);
  assert.equal(windPush([z], 100, 300, gust, false), 0);
});

test('sluice: a river a sluice runs keeps its own clock; with, against and still', () => {
  assert.equal(flowRate('with'), 1);
  assert.equal(flowRate('against'), -1);
  assert.equal(flowRate('still'), 0);
  assert.equal(sluiceFlow({}, true), 'with');
  assert.equal(sluiceFlow({}, false), 'still');
  assert.equal(sluiceFlow({ opened: 'against', shut: 'with' }, true), 'against');
  // it eases to the new rate
  let r = 1;
  for (let i = 0; i < 30; i++) r = stepFlow(r, -1, 1 / 30);
  assert.equal(r, -1);
  const d: DriftInfo = { x0: 100, x1: 600, dir: 1, speed: 80, width: 150, offset: 0, baseY: 600 };
  const river: RiverZone = { x0: 100, x1: 600, surfaceY: 640, dir: 1, speed: 80 };
  assert.equal(logClock([river], d, 7), 7, 'no sluice: the game clock');
  river.flowT = 2;
  assert.equal(logClock([river], d, 7), 2);
  assert.ok(driftX(d, 2.5) > driftX(d, 2), 'running with the current, the log goes right');
  assert.ok(driftX(d, 1.5) < driftX(d, 2), 'the clock run backwards takes it left: the current turned about');
  assert.equal(hopLimit(1), 80);
  assert.equal(hopLimit(-1), 130);
});

test('carried light: a glowing mushroom lights its radius; a hidden ledge is lit when the light reaches any of its top', () => {
  assert.ok((ITEM.mushroom.light ?? 0) > 150);
  assert.ok(isLit(100, 100, [{ x: 0, y: 0, r: 150 }]));
  assert.ok(!isLit(200, 200, [{ x: 0, y: 0, r: 150 }]));
  assert.ok(ledgeLit(100, 300, 0, [{ x: 0, y: 0, r: 120 }]), 'its near end is in the light');
  assert.ok(!ledgeLit(200, 300, 0, [{ x: 0, y: 0, r: 120 }]));
});

test('trade: the trader takes only what it wants', () => {
  assert.ok(tradeTakes('mango', 'mango'));
  assert.ok(!tradeTakes('mango', 'stone'));
  assert.ok(ITEM.mango.fruit);
});

test('carry poses: every pose painted with the acorn has a copy with it painted out, with the hand point to draw the carried thing at', () => {
  for (const n of [2, 3, 4, 5, 6, 7, 8, 9, 13]) {
    const e = KIT_ART[`e${n}` as keyof typeof KIT_ART] as { hx?: number; hy?: number };
    assert.ok(e, `e${n}`);
    assert.ok(e.hx !== undefined && e.hy !== undefined, `e${n} has its hand`);
  }
  // the new pieces are in the kit's sheet, and the sheet is well under the 4 MiB limit
  for (const n of ['seesawLevel', 'seesawUpL', 'seesawUpR', 'bell', 'mushroom', 'mushroomDim', 'pebble', 'shutterOpen', 'shutterShut', 'pinwheel', 'pinwheelSpin', 'sluiceOpen', 'sluiceShut', 'tradeStump', 'mango', 'acornTree', 'fernStone', 'stonePlate', 'winch']) assert.ok(n in KIT_ART, n);
  const size = fs.statSync(new URL('../assets/props/puzzle-kit.webp', import.meta.url)).size;
  assert.ok(size < 4 * 1024 * 1024, `${size}`);
});

// ───────────────────────────── the check ─────────────────────────────

const stage = () => buildKitStage(kitStageConfig());
const roomOf = (st: ReturnType<typeof stage>, id: string) => st.kit!.rooms.find((r) => r.id === id)!;
const errs = (st: ReturnType<typeof stage>) => validateStage(st).errors.join('\n');

test('the kit test room with its phase 2a rooms passes the level check', () => {
  assert.deepEqual(validateStage(stage()).errors, []);
});

test('the check: the seesaw room needs the log; the light room the mushroom; the wind room its lever; the trade room the mango', () => {
  const noLog = stage();
  noLog.platforms = noLog.platforms.filter((p) => !p.push);
  assert.match(errs(noLog), /room seesaw: its way on opens, but the ground past it can't be reached/);
  const noShroom = stage();
  roomOf(noShroom, 'light').pieces = roomOf(noShroom, 'light').pieces.filter((p) => p.id !== 'shroom6');
  assert.match(errs(noShroom), /room light: its way on \(ledge6\) can never be opened/);
  const noLever = stage();
  roomOf(noLever, 'wind').pieces = roomOf(noLever, 'wind').pieces.filter((p) => p.id !== 'lever7');
  assert.match(errs(noLever), /room wind: its way on \(lift7\) can never be opened/);
  const noMango = stage();
  roomOf(noMango, 'trade').pieces = roomOf(noMango, 'trade').pieces.filter((p) => p.id !== 'mango9');
  assert.match(errs(noMango), /room trade/);
  // a mango the monkey does not want (it wants a pinecone): no trade, no stone
  const picky = stage();
  (roomOf(picky, 'trade').pieces.find((p) => p.id === 'monkey9') as Extract<PieceSpec, { kind: 'trader' }>).wants = 'pinecone';
  assert.match(errs(picky), /room trade/);
});

test('the check: a shutter on a lane that is not a gust, a sluice on no river, a bell nobody hears, a pinwheel out of the wind', () => {
  const a = stage();
  (roomOf(a, 'wind').pieces.find((p) => p.id === 'shut7') as Extract<PieceSpec, { kind: 'shutter' }>).zone = 1;
  assert.match(errs(a), /shut7 shuts zone 1, which is not a gust lane/);
  const b = stage();
  (roomOf(b, 'sluice').pieces.find((p) => p.id === 'sluice8') as Extract<PieceSpec, { kind: 'sluice' }>).river = 4;
  assert.match(errs(b), /sluice8 runs river 4, which is not there/);
  const c = stage();
  c.proto.thorns = [];
  assert.match(errs(c), /bell5 rings where no watcher can hear it/);
  const d = stage();
  d.zones![0] = { ...d.zones![0], x0: 100, x1: 300 };
  assert.match(errs(d), /pin7 stands where no gust blows/);
});

test('the check: a sluice that turns the river about must leave its logs a hop apart the other way', () => {
  const st = stage();
  const sl = roomOf(st, 'sluice').pieces.find((p) => p.id === 'sluice8') as Extract<PieceSpec, { kind: 'sluice' }>;
  sl.opened = 'against';
  // (running against him the logs may sit further apart: this river's are close enough)
  assert.deepEqual(validateStage(st).errors, []);
  // logs spaced for a river against him (130 px apart), turned about to flow with him: too far to hop
  const wide = stage();
  const logs = wide.platforms.filter((p) => p.type === 'drift');
  const r = wide.rivers![0];
  r.dir = -1;
  for (const p of logs) p.drift!.dir = -1;
  const keep = logs.slice(0, 2);
  wide.platforms = wide.platforms.filter((p) => p.type !== 'drift' || keep.includes(p));
  const sl2 = roomOf(wide, 'sluice').pieces.find((p) => p.id === 'sluice8') as Extract<PieceSpec, { kind: 'sluice' }>;
  sl2.opened = 'against';
  assert.match(errs(wide), /sluice8 turns the river about, and its logs are then too far apart to hop/);
});

test('solved, the stage is walked with each seesaw end at both its heights and each hidden ledge lit', () => {
  const st = stage();
  const solved = kitSolved(st);
  const ri = st.kit!.rooms.findIndex((r) => r.id === 'seesaw');
  const end = solved.platforms.find((p) => p.id === kitPlatId(ri, 'see4', 1))!;
  assert.deepEqual([end.lift!.top, end.lift!.bottom], [G - SEESAW.rise, G]);
  const li = st.kit!.rooms.findIndex((r) => r.id === 'light');
  assert.equal(solved.platforms.find((p) => p.id === kitPlatId(li, 'ledge6', 0))!.broken, false);
  assert.equal(st.platforms.find((p) => p.id === kitPlatId(li, 'ledge6', 0))!.broken, true, 'unlit in play until a light finds it');
});

// ───────────────────────────── in the real engine ─────────────────────────────

const walkTo = (r: RealPlay, x: number) => {
  for (let i = 0; i < 600 && Math.abs(r.p.x - x) > 8; i++) r.frame(r.p.x < x ? { right: true } : { left: true });
  r.frame();
};
const face = (r: RealPlay, d: 1 | -1) => {
  r.frame(d > 0 ? { right: true } : { left: true });
  r.frame();
};
const kitOf = (r: RealPlay) => r.e.kit as KitPlay;
const roomRun = (r: RealPlay, id: string) => kitOf(r).rooms.find((q) => q.spec.id === id)!;

test('seesaw in play: push the log onto the near end, walk up the plank, the far end holds under him, jump to the bank', () => {
  const r = new RealPlay('kit', 1);
  const room = roomRun(r, 'seesaw');
  const s = room.seesaws[0];
  const log = r.platforms.find((p) => p.push)!;
  r.stand(KIT_ROOMS.seesaw + 40, G);
  for (let i = 0; i < 160; i++) r.frame({ right: true });
  assert.ok(log.x + log.width / 2 > s.ends[0].x, `the log is on the near end (${log.x})`);
  assert.equal(s.tilt, -1);
  // onto the log and the plank: up onto the raised far end
  r.stand(s.ends[1].x + 40, s.ends[1].y);
  r.wait(0.6);
  assert.equal(s.tilt, -1, 'the log outweighs him: the far end stays up under him');
  assert.ok(Math.abs(r.p.y - (G - SEESAW.rise)) < 4, `he stands on the raised end (${r.p.y})`);
  // the bank, a jump up from the raised end
  for (let i = 0; i < 40; i++) r.frame(i === 0 || i === 9 ? { right: true, press: true } : { right: true, jump: i < 22 });
  r.wait(0.5);
  assert.ok(r.p.y <= G - SEESAW.bank + 2 && r.p.x > 3380, `on the bank (${r.p.x}, ${r.p.y})`);
});

test('seesaw in play: with no log, his own weight takes the far end down', () => {
  const r = new RealPlay('kit', 1);
  const s = roomRun(r, 'seesaw').seesaws[0];
  r.stand(s.ends[1].x + 60, s.ends[1].y);
  r.wait(1);
  assert.equal(s.tilt, 1);
  assert.ok(Math.abs(r.p.y - G) < 4, `down he goes (${r.p.y})`);
});

test('bell in play: a tap rings it, the vine over the path listens to it and lets him walk past while it looks', () => {
  const r = new RealPlay('kit', 1);
  const room = roomRun(r, 'bell');
  r.stand(KIT_ROOMS.bell + 170, G);
  face(r, 1);
  r.frame({ punch: true });
  r.frame();
  assert.equal(kitOf(r).noises.length, 1, 'the bell rang');
  assert.equal(kitOf(r).noises[0].from, 'bell');
  assert.ok(room.bells[0].rung > -Infinity);
  // the vine (at bell + 430) hears it
  const v = r.e.proto!.thorns![0];
  assert.ok(heard(kitOf(r).noises, v.x, v.bud, r.e.gameTime));
});

test('a thrown pebble lands with a noise; a set-down one does not', () => {
  const r = new RealPlay('kit', 1);
  r.stand(KIT_ROOMS.bell + 140, G);
  face(r, -1);
  r.frame({ punch: true });
  assert.ok(kitOf(r).holding);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(0.6);
  assert.equal(kitOf(r).noises.length, 0, 'set down quietly');
  r.frame({ punch: true });
  assert.ok(kitOf(r).holding);
  // (past the bell, so the throw does not knock it)
  walkTo(r, KIT_ROOMS.bell + 260);
  face(r, 1);
  r.frame({ kick: 1 });
  r.wait(1.2);
  assert.equal(kitOf(r).noises.length, 1);
  assert.equal(kitOf(r).noises[0].from, 'land');
  // thrown back at the bell, it rings it as it passes
  r.wait(3);
  const it = kitOf(r).rooms.find((q) => q.spec.id === 'bell')!.items[0];
  r.stand(it.x + 30, G);
  face(r, -1);
  r.frame({ punch: true });
  assert.ok(kitOf(r).holding);
  walkTo(r, KIT_ROOMS.bell + 400);
  face(r, -1);
  r.frame({ kick: -1 });
  r.wait(1.2);
  assert.ok(kitOf(r).noises.some((n) => n.from === 'bell'), 'the bell, knocked by the pebble');
});

test('carried light in play: the mushroom set down by the bank lights the hidden ledge (solid now) and wakes the glowworms', () => {
  const r = new RealPlay('kit', 1);
  const room = roomRun(r, 'light');
  const ledge = room.ledges[0].plat;
  assert.equal(ledge.broken, true, 'not there in the dark');
  r.stand(KIT_ROOMS.light + 150, G);
  face(r, -1);
  r.frame({ punch: true });
  assert.ok(kitOf(r).holding);
  assert.equal(kitOf(r).lights().length, 1, 'it glows in his hands');
  walkTo(r, ledge.x - 30);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(0.8);
  assert.ok(!kitOf(r).holding);
  assert.equal(room.ledges[0].lit, true);
  assert.equal(ledge.broken, false, 'a ledge to stand on');
  assert.ok((r.e as unknown as { glowWake: Map<number, number> }).glowWake.size >= 1, 'a glowworm woke in its light');
});

test('wind in play: the lever opens the shutter, the gusts spin the pinwheel and wind the lift up with him on it', () => {
  const r = new RealPlay('kit', 1);
  const room = roomRun(r, 'wind');
  const z = r.e.currentStage.zones![0];
  r.stand(KIT_ROOMS.wind + 60, G);
  r.wait(0.2);
  assert.equal(z.shut, true, 'shut to start with');
  const lift = room.lifts[0];
  r.stand(lift.plat.x + 14, G);
  face(r, -1);
  r.frame({ punch: true });
  r.frame();
  assert.equal(room.levers[0].on, true, 'pulled from the lift');
  assert.equal(z.shut, false);
  r.wait(14);
  assert.ok(room.pinwheels[0].spin || lift.level > 0, 'the gusts came');
  assert.ok(lift.level >= 0.999, `wound right up (${lift.level})`);
  assert.ok(r.p.y < G - 250, `he rode it (${r.p.y})`);
});

test('sluice in play: shut, the logs stand still; the lever lets the current run; shut again, they stop where they are', () => {
  const r = new RealPlay('kit', 1);
  const logs = r.platforms.filter((p) => p.type === 'drift');
  r.stand(KIT_ROOMS.sluice + 60, G);
  r.wait(0.5);
  const x0 = logs.map((p) => p.x);
  r.wait(1.5);
  assert.deepEqual(logs.map((p) => Math.round(p.x)), x0.map(Math.round), 'still behind the sluice');
  r.stand(KIT_ROOMS.sluice + 100, G);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(2.5);
  const x1 = logs.map((p) => p.x);
  assert.ok(x1.some((x, i) => Math.abs(x - x0[i]) > 30), 'drifting');
  r.frame({ punch: true });
  r.wait(1.5);
  const x2 = logs.map((p) => p.x);
  r.wait(1);
  assert.deepEqual(logs.map((p) => Math.round(p.x)), x2.map(Math.round), 'stopped again');
});

test('trade in play: the mango offered, the capuchin drops its stone; the stone on the plate opens the gate', () => {
  const r = new RealPlay('kit', 1);
  const room = roomRun(r, 'trade');
  const tr = room.traders[0];
  r.stand(KIT_ROOMS.trade + 150, G);
  face(r, -1);
  r.frame({ punch: true });
  assert.ok(kitOf(r).holding);
  walkTo(r, tr.x - 50);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(1.2);
  assert.ok(!kitOf(r).holding);
  assert.equal(tr.done, true);
  const stone = room.items.find((it) => it.variant === 'stone')!;
  assert.equal(stone.mode, 'rest', 'the stone dropped to the ground');
  walkTo(r, stone.x - 20);
  face(r, 1);
  r.frame({ punch: true });
  assert.ok(kitOf(r).holding);
  walkTo(r, room.plates[0].x - 40);
  face(r, 1);
  r.frame({ punch: true });
  r.wait(1);
  assert.equal(room.plates[0].down, true);
  assert.equal(room.gates[0].open, true);
});
