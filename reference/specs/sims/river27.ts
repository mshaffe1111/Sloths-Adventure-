/**
 * river27 — 2-7's current, both legs, and the mail boat's pace, flown on the real engine (DESIGN-26-28, level.md rule 24). Pokey is engine.ts
 * at 30 fps (realPlay.ts) with the game's InputEngine (an 80 ms tap; R-165.284). The rivers are gen2/riverLay.ts layRiver's (drift platforms
 * the engine moves by river.ts driftX and hands to the bank, engine.ts:1858-1884), on World 2's rows (w2.ts W2_RIVERS) and two proposed.
 * A left leg is a right leg mirrored (pipeline.ts mirrors its river, legs.ts mirror), so "home, with the current" is flown as a right run on a
 * dir +1 row and "out, against the current" as a right run on a dir -1 row.
 *
 * 1. PUSH: a held jump (left/right held all the way) off the front of a log he is running along, vs the same jump run up on still ground:
 *    the gap it clears level, by row (the carry rule, ride.ts RIDE.keep: the log's speed is added at take-off; steering toward his way, the air brakes any speed past his run, physics.ts:198-204 airStep).
 * 2. CROSS: three players cross each row from a stand on the near bank 200 px from its lip to standing on the far bank, every phase of the
 *    river (start frames over one log spacing). EXPERT: runs, taps a hop the first frame a landing is sure (the log under where a tap hop
 *    lands, 30 px inside each end, read 0.43 s ahead), never stands. MIDDLE (careful): the same, but stands STAND s before every hop
 *    (FT_MIDDLE standQ p75 = 401 ms, firsttimer.ts:234: the careful end of the testers' middle tier) and wants 50 px inside each end.
 *    RIDE-ONLY: boards like MIDDLE, then never runs or hops on the water (the current carries him; against it he is carried home).
 *    Read: crossings made (of the phases), median and worst time, falls. Time per px of water is what the race is made of.
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/river27.ts [normal|easy] > reference/specs/sims/out/river27-<setting>.txt
 */
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import { layRiver, riverWidth, rowGap, type RiverRow } from '../../../src/game/gen2/riverLay.ts';
import { W2_RIVERS } from '../../../src/game/gen2/worlds/w2.ts';
import type { Platform } from '../../../src/game/types.ts';

const setting = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
setDifficulty(setting);
const r = new RealPlay('2-7', 1);
const inp = new InputEngine();
inp.source = 'pad';
r.e.input = inp;

const BANK_END = 3000, BANK_Y = 800, NEAR = 1, FAR = 2, WATER = 3;
const STAND = 0.401; // s: FT_MIDDLE standQ p75 (firsttimer.ts:234)
const HOP = { air: 0.43, along: 112 }; // the real tap hop (DESIGN-24-25: 0.43 s, 106-119 px)
const HELD = { air: 0.8, along: 160 }; // a held jump from a run, level (PUSH below: 171-185 px; read short for a margin)

function world(row: RiverRow) {
  let id = 100;
  const w = riverWidth(row);
  const near: Platform = { id: NEAR, x: 0, y: BANK_Y, width: BANK_END, height: 200, type: 'solid' } as Platform;
  const far: Platform = { id: FAR, x: BANK_END + w, y: BANK_Y, width: 4000, height: 200, type: 'solid' } as Platform;
  const water: Platform = { id: WATER, x: 0, y: BANK_Y + 300, width: 20000, height: 200, type: 'solid' } as Platform;
  const { logs } = layRiver(row, BANK_END, BANK_Y, () => id++);
  r.bare([near, far, water, ...logs]);
  inp.clearAll(); r.e.input = inp;
  return { logs, w, spacing: (row.logW + rowGap(row)) / row.speed };
}
const setT = (t: number) => { (r.e as unknown as { gameTime: number }).gameTime = t; };
const tap = () => { inp.triggerTouchUp(0, 80); r.e.update(DT); r.e.update(DT); inp.releaseTouchUp(); };
/** a held jump: held to the top of the arc (about 12 frames), right held */
const held = () => { inp.triggerTouchUp(0, 500); for (let i = 0; i < 12; i++) r.e.update(DT); inp.releaseTouchUp(); };
let helds = 0;

/** 1. PUSH: run along a long still floor or a log and jump at its front: the gap cleared level */
function push(row: RiverRow | null): number {
  // a single long log carried at the row's speed (no wrap within the flight), or a still floor
  const speed = row ? row.dir * row.speed : 0;
  const log: Platform = { id: 10, x: 3000, y: BANK_Y, width: 600, height: 20, type: 'moving' } as Platform;
  r.bare([log, { id: WATER, x: 0, y: BANK_Y + 600, width: 20000, height: 200, type: 'solid' } as Platform]);
  (r.e as unknown as { pieces: unknown[] }).pieces = speed ? [{ kind: 'carry', layers: [], step(_dt: number, host: { player: { grounded: boolean; x: number }; standingOnId: number }) { log.x += speed * DT; if (host.player.grounded && host.standingOnId === 10) host.player.x += speed * DT; }, respawn() {}, hurts() { return null; }, draw() {} }] : [];
  inp.clearAll(); r.e.input = inp;
  r.stand(3040, BANK_Y); r.e.update(DT);
  inp.triggerTouchMove('right');
  let k = 0;
  while (r.p.x < log.x + log.width - 25 && k++ < 200) r.e.update(DT);
  const x0 = r.p.x, y0 = r.p.y;
  inp.triggerTouchUp(0, 500);
  let px = r.p.x, py = r.p.y, rel = false;
  for (let f = 0; f < 90; f++) {
    r.e.update(DT);
    if (!rel && r.p.vy > 0) { inp.releaseTouchUp(); rel = true; }
    if (r.p.vy > 0 && py < y0 && r.p.y >= y0) return Math.round(px + ((r.p.x - px) * (y0 - py)) / (r.p.y - py) - x0);
    px = r.p.x; py = r.p.y;
  }
  return NaN;
}

type Who = 'expert' | 'middle' | 'ride';
/** where a tap hop from now would put his feet (x) after HOP.air, and whether that spot is on a log (with `inside` px each end) then */
function landsOnLog(logs: Platform[], fromX: number, dirX: number, inside: number, j = HOP) {
  const tx = fromX + j.along * dirX;
  for (const l of logs) {
    const d = l.drift!;
    const lx = l.x + d.dir * d.speed * j.air;
    // only the part of a log out from under the banks is a landing (a log sliding under the far bank hands its rider up: engine.ts:1873)
    const lo = Math.max(lx, d.x0), hi = Math.min(lx + l.width, d.x1);
    if (hi - lo >= 2 * inside && tx >= lo + inside && tx <= hi - inside) return true;
  }
  return false;
}

/** 2. CROSS: one crossing from phase t0; returns seconds to stand on the far bank, or a failure name */
function cross(row: RiverRow, t0: number, who: Who): number | string {
  const { logs, w } = world(row);
  setT(t0);
  r.stand(BANK_END - 200, BANK_Y); r.e.update(DT);
  const lip = BANK_END, farX = BANK_END + w;
  const inside = who === 'expert' ? 30 : 50;
  let k = 0, standUntil = -1, phase: 'walk' | 'wait' | 'on' = 'walk';
  inp.triggerTouchMove('right');
  const LIMIT = Math.round(60 / DT);
  while (k++ < LIMIT) {
    const p = r.p;
    const on = p.grounded ? r.standingOn : -2;
    if (on === FAR && p.x > farX + 30) { inp.triggerTouchMove('none'); return +(k * DT).toFixed(2); }
    if (on === WATER) return 'water';
    if (on === NEAR && p.x < lip - 400) return 'carried home';
    const onLog = on >= 100;
    // the far bank within a tap: hop to it (or walk on when a log has carried him under its lip)
    if (phase === 'walk' && on === NEAR && p.x >= lip - 12) { inp.triggerTouchMove('none'); phase = 'wait'; standUntil = who === 'middle' || who === 'ride' ? k + Math.round(STAND / DT) : k; }
    if (onLog && who === 'ride') { inp.triggerTouchMove('none'); }
    else if (onLog) {
      const log = logs.find((l) => l.id === on)!;
      const front = log.x + log.width;
      const nearFront = p.x >= front - 22;
      if (!nearFront) { inp.triggerTouchMove('right'); standUntil = -1; }
      else {
        inp.triggerTouchMove('none');
        if (standUntil < 0) standUntil = k + (who === 'middle' ? Math.round(STAND / DT) : 0);
        const bankNear = farX - p.x <= HOP.along - 10;
        const bankHeld = farX - p.x <= HELD.along - 20;
        if (k >= standUntil && (bankNear || landsOnLog(logs, p.x, 1, inside))) { inp.triggerTouchMove('right'); tap(); k += 2; standUntil = -1; continue; }
        if (k >= standUntil && (bankHeld || landsOnLog(logs, p.x, 1, inside, HELD))) { inp.triggerTouchMove('right'); held(); helds++; k += 12; standUntil = -1; continue; }
      }
    } else if (phase === 'wait' && on === NEAR && k >= standUntil && landsOnLog(logs, p.x, 1, inside)) { inp.triggerTouchMove('right'); tap(); k += 2; phase = 'on'; continue; }
    else if (phase === 'wait' && on === NEAR && k >= standUntil && landsOnLog(logs, p.x, 1, inside, HELD)) { inp.triggerTouchMove('right'); held(); helds++; k += 12; phase = 'on'; continue; }
    if (on === NEAR && phase === 'on') { phase = 'walk'; inp.triggerTouchMove('right'); }
    if (on === FAR) inp.triggerTouchMove('right');
    if (process.env.TRACE && k % 15 === 0) console.log(k, phase, on, standUntil, Math.round(p.vx), (inp as unknown as {touchDir?: string}).touchDir, Math.round(p.x), Math.round(p.y), logs.map((l) => Math.round(l.x)).join(','), 'far', farX);
    r.e.update(DT);
  }
  return 'stuck';
}

if (process.env.TRACE) { console.log(cross({ ...W2_RIVERS.twin, dir: -1 }, 0, 'expert')); process.exit(0); }
const ROWS: Array<[string, RiverRow]> = [
  ['ride +70', W2_RIVERS.ride], ['twin +80', W2_RIVERS.twin], ['long +80', W2_RIVERS.long],
  ['back -70', W2_RIVERS.back], ['deep -75 (proposed: deep run back at him)', { ...W2_RIVERS.deep, dir: -1 }], ['twin -80 (proposed)', { ...W2_RIVERS.twin, dir: -1 }],
];
console.log(`river27 ${setting}`);
console.log(`1. PUSH: a held jump off the front of what he runs along (level gap cleared): still ground ${push(null)} px`);
for (const v of [70, 80, -70, -80]) console.log(`   a log at ${v > 0 ? '+' : ''}${v} px/s (${v > 0 ? 'with him' : 'against him'}): ${push({ dir: v > 0 ? 1 : -1, speed: Math.abs(v), logW: 600, logs: 1 } as RiverRow)} px`);
console.log('\n2. CROSS (bank stand 200 px back -> standing on the far bank; phases = every frame of one log spacing)');
console.log('row | water px | log every s | who | crossed | median s | worst s | px/s over (200 + water + 30) | fails | held');
for (const [name, row] of ROWS) {
  const w = riverWidth(row);
  const spacing = (row.logW + rowGap(row)) / row.speed;
  const n = Math.round(spacing / DT);
  for (const who of ['expert', 'middle', 'ride'] as Who[]) {
    const res: Array<number | string> = [];
    helds = 0;
    for (let k = 0; k < n; k++) res.push(cross(row, k * DT, who));
    const ok = res.filter((x): x is number => typeof x === 'number').sort((a, b) => a - b);
    const fails = Object.entries(res.filter((x) => typeof x === 'string').reduce<Record<string, number>>((m, s) => ((m[s as string] = (m[s as string] ?? 0) + 1), m), {})).map(([a, b]) => `${a} ${b}`).join(', ') || '-';
    const med = ok.length ? ok[Math.floor(ok.length / 2)] : NaN;
    console.log(`${name} | ${w} | ${spacing.toFixed(2)} | ${who} | ${ok.length}/${n} | ${med} | ${ok.length ? ok[ok.length - 1] : NaN} | ${ok.length ? Math.round((230 + w) / med) : '-'} | ${fails} | held jumps/crossing ${(helds / n).toFixed(1)}`);
  }
}
console.log(`\nbank run (no water): 1,000 px at a full run from a stand: ${(() => { r.bare([{ id: 1, x: 0, y: BANK_Y, width: 9000, height: 200, type: 'solid' } as Platform]); inp.clearAll(); r.e.input = inp; r.stand(500, BANK_Y); r.e.update(DT); inp.triggerTouchMove('right'); let k = 0; while (r.p.x < 1500 && k++ < 300) r.e.update(DT); inp.triggerTouchMove('none'); return (k * DT).toFixed(2); })()} s`);
