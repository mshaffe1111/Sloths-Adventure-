/**
 * gen2/wheelLay — a WATER WHEEL as a gen2 place (ENG-26; reference/design/2-6.md NEW 1; wheel.ts the wheel, pieces/wheelPiece.ts the
 * piece): place `{ kind: 'wheel', after: <the jetty>, row }` lays the street (this piece) where the row's wheel lifts him to from the
 * jetty `after`, and layStage lays the wheel between them (layWheel): its buckets, and the pond under its sweep (a safe still water: a miss
 * splashes him back onto the jetty, nothing lost, never a pit). The wheel is a tower's way up a storey with no vine: the jetty is the storey
 * he leaves, the street the one he arrives on, both run on the way he travels (the wheel's top moves that way).
 *
 * Its fairness (wheelFaults, in checkStage with the river's and the pads'): the row is held to what it does on the real engine
 * (wheelFlights.ts, FLOWN; the table wheelFlights.data.ts), and the laid wheel to the layout that was flown, each fault in words:
 *   - board    a tap hop off the jetty lands in a bucket at EVERY moment of the wheel (2-6.md: 100% of phases);
 *   - ride     doing nothing in a bucket never drops him: he rides round again (or, an 'in' street, is set down on it);
 *   - step     the street's step-off window a turn (the better of a walk and a tap hop; a jump off the top for an 'up' street) is at
 *              least WHEEL_FAIR.step s (Normal 1.5, Easy 2.5: 2-6.md line 22);
 *   - up       an 'up' street stands at most WHEEL_FAIR.up px over the top floor (Normal 80, Easy 60);
 *   - layout   the jetty's and the street's lips stand where the flown layout puts them (2 px), the pond under the whole sweep, and no
 *              other solid's top crosses a bucket floor's path (it would knock him out of his bucket).
 * A row the table has not flown fails by name (run tools/engine/wheelflights.ts). Nothing here names a stage.
 */
import type { Difficulty } from '../difficulty.ts';
import type { RiverZone } from '../river.ts';
import type { Platform } from '../types.ts';
import { axleFromJetty, inSweep, sweepBox, wheelLips, WHEEL, type StreetKind, type Wheel } from '../wheel.ts';
import { WHEEL_FLOWN } from './wheelFlights.data.ts';

/**
 * A world's wheel row (WorldManifest.wheels; place `wheel` names it): the wheel's rim R (px to a bucket's floor), its rim speed V (px/s)
 * on Normal and on Easy, its N buckets, and its street: 'edge' (at the sweep's edge, a step off as the bucket comes level), 'in' (reaching
 * in over the top: the buckets pass behind it, so a rider is set down on it), 'up' (`up` px above the top floor: a jump off the top)
 */
export interface WheelRow {
  R: number;
  V: number;
  /** Easy's rim speed (2-6.md: "Easy V x 0.85 (V50-60)", the flown values) */
  easyV: number;
  N: number;
  street: StreetKind;
  /** an 'up' street: px over the top floor, Normal and Easy */
  up?: { normal: number; easy: number };
  /** the wheel's start angle (rad; default 0): a stage's wheels may stand out of step */
  phase?: number;
}

export const WHEEL_FAIR = {
  /** the least step-off window a turn (s), 2-6.md line 22 */
  step: { normal: 1.5, easy: 2.5 },
  /** an 'up' street's most height over the top floor (px), 2-6.md line 54 */
  up: { normal: 80, easy: 60 },
  /** how far a laid lip may stand from the flown layout's (px) */
  lip: 2,
} as const;

/** the layout a row is flown and laid at on a setting (wheelFlights.ts WheelLayout) */
export const rowLayout = (row: WheelRow, difficulty: Difficulty) => ({
  R: row.R,
  V: difficulty === 'easy' ? row.easyV : row.V,
  N: row.N,
  W: WHEEL.bucketW,
  street: row.street,
  ...(row.street === 'up' ? { up: difficulty === 'easy' ? row.up!.easy : row.up!.normal } : {}),
});
/** the flown table's key for a layout */
export const flownKey = (L: { R: number; V: number; N: number; W?: number; street: StreetKind; up?: number }, difficulty: Difficulty) =>
  `${difficulty} R${L.R} V${L.V} N${L.N} W${L.W ?? WHEEL.bucketW} ${L.street}${L.street === 'up' ? L.up : ''}`;

/**
 * where the street stands from the jetty's lip, in the section's own frame (travelling right: x on from the lip, y down from the jetty's
 * top): what place `wheel` lays the street at (pipeline.ts layLocal)
 */
export function streetFromJetty(row: WheelRow, difficulty: Difficulty): { dx: number; dy: number } {
  const L = rowLayout(row, difficulty);
  const ax = axleFromJetty(0, 0, L.R, L.W, 1);
  const w: Wheel = { cx: ax.cx, cy: ax.cy, R: L.R, N: L.N, W: L.W, V: L.V, way: 1 };
  const lips = wheelLips(w, L.street, L.up ?? 0);
  return { dx: lips.streetX, dy: lips.streetY };
}

/** the wheel's sweep in the section's own frame from the jetty's lip at (x0, y0) (travelling right): x0 to x1 (px), and its pond (the
 *  water's span and the depth its water reaches, local y) */
export function wheelSpan(row: WheelRow, difficulty: Difficulty, x0: number, y0: number): { x0: number; x1: number; pond: { x0: number; x1: number; low: number } } {
  const L = rowLayout(row, difficulty);
  const ax = axleFromJetty(x0, y0, L.R, L.W, 1);
  const box = sweepBox({ cx: ax.cx, cy: ax.cy, R: L.R, W: L.W });
  return { x0, x1: box.x1, pond: { x0: box.x0 - WHEEL.pondMargin, x1: box.x1 + WHEEL.pondMargin, low: ax.cy + L.R + WHEEL.pond + WHEEL.pondDepth } };
}

/**
 * lay a wheel between its jetty (`near`, the platform he arrives on) and its street (`far`), on the way from one to the other: its buckets
 * (each a 'moving' platform with its seat, drawn by the piece, never by the platform drawer: `art: 'hidden'`) and its pond (a still, safe
 * water zone under the whole sweep that splashes him back onto the jetty's lip). The wheel remembers its jetty and street (the checks).
 */
export function layWheel(row: WheelRow, rowName: string, near: Platform, far: Platform, difficulty: Difficulty, nextId: () => number): { buckets: Platform[]; zone: RiverZone; wheel: Wheel } {
  const way: 1 | -1 = far.x >= near.x ? 1 : -1;
  const L = rowLayout(row, difficulty);
  const jettyX = way > 0 ? near.x + near.width : near.x;
  const ax = axleFromJetty(jettyX, near.y, L.R, L.W, way);
  const wheel: Wheel = {
    cx: ax.cx, cy: ax.cy, R: L.R, N: L.N, W: L.W, V: L.V, way, ...(row.phase ? { phase: row.phase } : {}),
    lay: { row: rowName, street: L.street, up: L.up ?? 0, jetty: near.id, streetId: far.id },
  };
  const buckets: Platform[] = [];
  for (let i = 0; i < L.N; i++) {
    const phi = (2 * Math.PI * i) / L.N + (row.phase ?? 0);
    buckets.push({ id: nextId(), x: ax.cx - way * L.R * Math.sin(phi) - L.W / 2, y: ax.cy + L.R * Math.cos(phi), width: L.W, height: WHEEL.bucketH, type: 'moving', art: 'hidden', wheel: { w: wheel, i } });
  }
  const box = sweepBox(wheel);
  const zone: RiverZone = {
    x0: Math.round(box.x0 - WHEEL.pondMargin), x1: Math.round(box.x1 + WHEEL.pondMargin), surfaceY: Math.round(ax.cy + L.R + WHEEL.pond), dir: way, speed: 0, open: true, wheelPond: true,
    safe: { backX: Math.round(jettyX - way * 40), backY: near.y },
  };
  return { buckets, zone, wheel };
}

/** each wheel pond as the floor the tower's falls read under its ends (tower.ts towerCatches, towerFalls): a miss off the jetty, the street
 *  or a bucket lands in it (a splash back onto the jetty), so it is what lies under those ends. A 'moving' platform, so never wood to run on
 *  or a ledge with ends of its own; never laid, only read. `dx`: moved by this much (a column's frame) */
export const pondFloors = (rivers: readonly RiverZone[], dx = 0): Platform[] =>
  rivers.filter((r) => r.wheelPond).map((r, k) => ({ id: -9000 - k, x: r.x0 - dx, y: r.surfaceY, width: r.x1 - r.x0, height: 24, type: 'moving' }));

/** the stage's wheels (each once), from its buckets' seats */
export const stageWheels = (platforms: readonly Platform[]): Wheel[] => {
  const out: Wheel[] = [];
  for (const p of platforms) if (p.wheel && !out.includes(p.wheel.w)) out.push(p.wheel.w);
  return out;
};

/** every fault of every wheel on the stage, in words (none: fair) */
export function wheelFaults(st: { platforms: readonly Platform[]; rivers?: readonly RiverZone[] }, difficulty: Difficulty): string[] {
  const out: string[] = [];
  for (const w of stageWheels(st.platforms)) {
    const at = `the wheel at x ${Math.round(w.cx)}`;
    const lay = w.lay;
    if (!lay) { out.push(`${at} was not laid by place wheel (no jetty or street of its own)`); continue; }
    const L = { R: w.R, V: w.V, N: w.N, W: w.W, street: lay.street, up: lay.up };
    const flown = WHEEL_FLOWN[flownKey(L, difficulty)];
    if (!flown) out.push(`${at} (row ${lay.row}: ${flownKey(L, difficulty)}) has not been flown: run tools/engine/wheelflights.ts and commit its table`);
    else {
      if (flown.board.tap.share < 100) out.push(`${at}: a tap hop off the jetty boards a bucket at only ${flown.board.tap.share}% of the wheel's moments (every moment is the rule)`);
      if (flown.ride === 'fell') out.push(`${at}: doing nothing in a bucket drops him (a missed step-off must ride round again)`);
      const need = WHEEL_FAIR.step[difficulty];
      if (flown.step < need) out.push(`${at}: the ${lay.street === 'up' ? 'jump off the top' : 'step off onto the street'} is open ${flown.step} s a turn, under the ${need} s ${difficulty} asks`);
    }
    if (lay.street === 'up' && lay.up > WHEEL_FAIR.up[difficulty]) out.push(`${at}: its street stands ${lay.up} px over the top bucket, past the ${WHEEL_FAIR.up[difficulty]} px a jump off the top is held to on ${difficulty}`);
    const jetty = st.platforms.find((p) => p.id === lay.jetty), street = st.platforms.find((p) => p.id === lay.streetId);
    const lips = wheelLips(w, lay.street, lay.up);
    if (!jetty) out.push(`${at}: its jetty is gone`);
    else {
      const jx = w.way > 0 ? jetty.x + jetty.width : jetty.x;
      if (Math.abs(jx - lips.jettyX) > WHEEL_FAIR.lip || Math.abs(jetty.y - lips.jettyY) > WHEEL_FAIR.lip) out.push(`${at}: its jetty's lip stands at (${Math.round(jx)}, ${Math.round(jetty.y)}), not where a bucket rises past it (${Math.round(lips.jettyX)}, ${Math.round(lips.jettyY)}): the board was flown there`);
    }
    if (!street) out.push(`${at}: its street is gone`);
    else {
      const sx = w.way > 0 ? street.x : street.x + street.width;
      if (Math.abs(sx - lips.streetX) > WHEEL_FAIR.lip || Math.abs(street.y - lips.streetY) > WHEEL_FAIR.lip) out.push(`${at}: its street's lip stands at (${Math.round(sx)}, ${Math.round(street.y)}), ${Math.round(Math.hypot(sx - lips.streetX, street.y - lips.streetY))} px from where the flown step-off lands him (${Math.round(lips.streetX)}, ${Math.round(lips.streetY)}): the step-off window there is not the flown one`);
    }
    const box = sweepBox(w);
    const pondY = w.cy + w.R + WHEEL.pond;
    const pond = (st.rivers ?? []).find((r) => !!r.safe && !!r.wheelPond && Math.abs(r.surfaceY - pondY) <= 2 && r.x0 <= box.x0 - WHEEL.pondMargin + 1 && r.x1 >= box.x1 + WHEEL.pondMargin - 1);
    const under = (st.rivers ?? []).find((r) => !!r.safe && !!r.wheelPond && Math.abs(r.surfaceY - pondY) <= 2);
    if (!pond) out.push(under ? `${at}: its pond (x ${Math.round(under.x0)}-${Math.round(under.x1)}) does not reach ${WHEEL.pondMargin} px past the sweep (x ${Math.round(box.x0)}-${Math.round(box.x1)}): a miss there falls past it` : `${at} has no safe pond under its sweep: a miss would be a fall`);
    // (and nothing stands under its water: a ledge there is drowned, he is splashed back off it)
    else for (const p of st.platforms) {
      if (p.wheel || p.broken || p.x + p.width <= pond.x0 || p.x >= pond.x1 || p.y <= pond.surfaceY || p.y > pond.surfaceY + WHEEL.pondDepth) continue;
      out.push(`${at}: platform #${p.id} (x ${Math.round(p.x)}-${Math.round(p.x + p.width)}, top ${Math.round(p.y)}) stands under its pond's water (surface ${Math.round(pond.surfaceY)})`);
    }
    // (no other solid in the sweep: a top that crosses a bucket floor's path, sampled every 8 px along it)
    for (const p of st.platforms) {
      if (p.wheel || p.id === lay.jetty || p.id === lay.streetId || p.broken) continue;
      if (p.x > box.x1 || p.x + p.width < box.x0 || p.y > box.y1 || p.y < box.y0) continue;
      let hit = false;
      for (let x = Math.max(p.x, box.x0); x <= Math.min(p.x + p.width, box.x1) && !hit; x += 8) hit = inSweep(w, x, p.y);
      if (hit) out.push(`${at}: platform #${p.id} (x ${Math.round(p.x)}-${Math.round(p.x + p.width)}, top ${Math.round(p.y)}) stands in its sweep, where a bucket's floor passes`);
    }
  }
  return out;
}
