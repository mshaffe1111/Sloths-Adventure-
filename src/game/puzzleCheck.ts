/**
 * puzzleCheck — the level check's look at a stage's puzzle rooms (puzzleKit.ts), symbolically: each room is a small state search.
 *
 * A state is where Pokey is (a piece of ground in the level check's own reachability graph), which thing he holds, where each thing
 * lies (on a piece of ground at some x, in a basket, gone), each lever, each beetle (awake, or asleep at x), and which latching gates
 * have opened. What a plate, a basket and a gate show follows from that. The moves:
 *   - walk with his hands free anywhere the reachability graph links (levelCheck.ts, with every shut gate a wall);
 *   - carrying, only walk: along a piece of ground, up a step he can walk up, off an edge onto the ground below (no jump, climb or
 *     swing while his hands are full), riding a lift he stands on;
 *   - pick up a thing on his piece of ground; set it down there (on a plate there, or at a spot a beetle will see), or into a basket
 *     in reach; throw it, up or forward, from anywhere along his piece of ground facing either way, with the game's own flight
 *     (puzzleKit.ts flyAll: it lands on a plate, falls in a basket, knocks a lever, or is lost and comes back to its source);
 *   - stand on a plate on his piece of ground; pull a lever there; ring a bell there (for an instant: a gate it opens must latch).
 * After each move a beetle that can see food goes and eats it and falls asleep there (its rule, puzzleKit.ts stepBeetle).
 *
 * A room fails when no state lets him reach the platform past its way on (its gate never opens, or its lift never rises), or when a
 * thing with no source can be lost (it would never come back).
 */
import {
  anchorAt, beetleSleepX, BEETLE, evalWire, flyAll, GLOW, ITEM, KIT, knotBox, TEA, kitGround, kitPlatId, ledgeLit, liftLevel, onPlate, plateDown, roomBox, seesawDy,
  seesawTilt, THROW, throwStart, aimUp, tradeTakes, useReach, type FlightWorld, type PieceSpec, type RoomSpec,
} from './puzzleKit.ts';
import { NOISE } from './noise.ts';
import { hopLimit } from './river.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform, Vine } from './types.ts';

/** a wall that stands in the way (a shut gate's door, the root wall over a gate): as the level check takes pouring water */
export interface KitWall {
  x: number;
  width: number;
  top: number;
  bottom: number;
}

/** the part of the level check's graph this uses */
export interface RoomGraph {
  plats: readonly Platform[];
  adj: ReadonlyMap<string, ReadonlySet<string>>;
  key: (p: Platform) => string;
}
export type GraphFor = (platforms: Platform[], walls: readonly KitWall[], vines?: Vine[]) => RoomGraph;

/** his body's half width (as the level check cuts ground at a wall) */
const BODY_HALF = 16;
/** the most states one room's search may visit */
const MAX_STATES = 60000;
/** a step up he walks up (engine.ts: the lip of a ledge this far over his feet hoists him onto it) */
const STEP_UP = 26;

/** the stage as it stands once every room is solved: every gate's door open, every lift up (the rest of the check walks this) */
export function kitSolved(stage: GeneratedStage): GeneratedStage {
  const kit = stage.kit;
  if (!kit) return stage;
  const doors = new Set<number>();
  const lifts = new Map<number, number>();
  /** a seesaw's ends: each one stop reached at its raised height and its lowered one (the room's check says which it can be made) */
  const ends = new Map<number, { top: number; bottom: number }>();
  const ledges = new Set<number>();
  const chairs = new Set<number>();
  /** a bent sapling: one stop at its root and one at its far end (a lift), and the ladders unrolled */
  const saplings: Platform[] = [];
  const ladders = new Set<number>();
  const byId = new Map(stage.platforms.map((p) => [p.id, p]));
  kit.rooms.forEach((room, ri) => room.pieces.forEach((pc) => {
    if (pc.kind === 'chair') chairs.add(kitPlatId(ri, pc.id, 0));
    if (pc.kind === 'ladder') ladders.add(pc.vine);
    if (pc.kind === 'sapling') {
      const a = anchorAt(pc.at, byId);
      const b = anchorAt(pc.to, byId);
      if (a && b) saplings.push({ id: kitPlatId(ri, pc.id, 0), x: Math.min(a.x, b.x) - 30, y: a.y, width: Math.abs(b.x - a.x) + 60, height: 12, type: 'solid', lift: { top: b.y, bottom: a.y, speed: KIT.liftSpeed, wait: 0, phase: 0 } });
    }
    if (pc.kind === 'gate') doors.add(kitPlatId(ri, pc.id, 0));
    if (pc.kind === 'lift') lifts.set(kitPlatId(ri, pc.id, 0), pc.rise);
    if (pc.kind === 'ledge') ledges.add(kitPlatId(ri, pc.id, 0));
    if (pc.kind === 'seesaw') {
      const a = anchorAt(pc.at, byId);
      if (a) for (const k of [0, 1]) ends.set(kitPlatId(ri, pc.id, k), { top: a.y - (pc.rise ?? KIT.seesawRise), bottom: a.y });
    }
  }));
  // (a lift is one stop reached at its bottom and its top, as World 2's basket lift is: levelCheck.ts joins the two; a hidden ledge is
  // lit once its room is solved)
  const platforms = [...stage.platforms, ...saplings]
    .filter((p) => !doors.has(p.id) && !chairs.has(p.id))
    .map((p) => (ledges.has(p.id) ? { ...p, broken: false } : p))
    .map((p) => (ends.has(p.id) ? { ...p, lift: { ...ends.get(p.id)!, speed: KIT.seesawSpeed, wait: 0, phase: 0 } } : p))
    .map((p) => (lifts.has(p.id) ? { ...p, lift: { top: p.y - lifts.get(p.id)!, bottom: p.y, speed: KIT.liftSpeed, wait: 0, phase: 0 } } : p));
  // (an unrolled ladder is a climb like any other; a silk line or a sapling's own climb never is)
  const vines = stage.vines.map((v) => (ladders.has(v.id) ? { ...v, kit: false, off: false } : v));
  return { ...stage, platforms, vines, kit: undefined };
}

/** check every room of the stage; the errors (none: every room can be solved, and nothing in one can be lost for good) */
/** how far either side of a room its check walks (px) */
const ROOM_WINDOW = 2000;

export function checkRooms(stage: GeneratedStage, graphFor: GraphFor): string[] {
  const out: string[] = [];
  (stage.kit?.rooms ?? []).forEach((room, ri) => out.push(...checkRoom(stage, ri, room, graphFor)));
  return out;
}

interface Placed {
  spec: PieceSpec;
  idx: number;
  x: number;
  y: number;
  plat: number;
}

interface State {
  /** where he is: a platform and an x on it (a spot no gate ever covers), the plate he stands on (-1) */
  pid: number;
  rx: number;
  plate: number;
  /** per thing: `g<plat>:<x>` lying there, `b<i>` in basket i, `h` held, `x` gone */
  items: string[];
  levers: boolean[];
  /** per beetle: `a` awake where it started, `s<x>` asleep at x */
  beetles: string[];
  latched: boolean[];
  /** per pushed log in the room: its left edge */
  logs: number[];
  /** per trader: it has traded */
  traded: boolean[];
  /** per lift a wire winds with a ratchet (`hold`): wound all the way up */
  wound: boolean[];
  /** phase 2b: per sapling bent, per knot snapped, per teapot tipped, per moonflower open */
  bent: boolean[];
  knots: boolean[];
  tipped: boolean[];
  moons: boolean[];
}
const keyOf = (s: State) =>
  `${s.pid}:${s.rx}:${s.plate}|${s.items.join(',')}|${s.levers.map(Number).join('')}|${s.beetles.join(',')}|${s.latched.map(Number).join('')}|${s.logs.join(',')}|${s.traded.map(Number).join('')}|${s.wound.map(Number).join('')}|${s.bent.map(Number).join('')}${s.knots.map(Number).join('')}${s.tipped.map(Number).join('')}${s.moons.map(Number).join('')}`;

/**
 * The watchers in a stage that hear the kit's noise (noise.ts): its thorn vines, its snapping turtles, its eagle's watched stretches.
 * (World 5's silk spiders join here once they listen.)
 */
function listeners(stage: GeneratedStage): Array<{ x: number; y: number }> {
  const proto = (stage as { proto?: { thorns?: Array<{ x: number; bud: number }>; watch?: Array<{ x0: number; x1: number }> } }).proto;
  const out: Array<{ x: number; y: number }> = [];
  for (const v of proto?.thorns ?? []) out.push({ x: v.x, y: v.bud });
  for (const e of stage.enemies) if (e.type === 'turtle') out.push({ x: e.x, y: e.y });
  for (const z of proto?.watch ?? []) for (let x = z.x0; x <= z.x1; x += 200) out.push({ x, y: NaN });
  return out;
}

function checkRoom(stage: GeneratedStage, ri: number, room: RoomSpec, graphFor: GraphFor): string[] {
  const errors = new Set<string>();
  const byId = new Map(stage.platforms.map((p) => [p.id, p]));
  const place = (pc: PieceSpec, idx: number): Placed | null => {
    const a = 'at' in pc && pc.at ? anchorAt(pc.at, byId) : null;
    if (!a || !('at' in pc) || !pc.at) return null;
    return { spec: pc, idx, x: a.x, y: a.y, plat: pc.at.on };
  };
  const all = room.pieces.map((pc, i) => place(pc, i));
  const kind = <K extends PieceSpec['kind']>(k: K) => all.filter((p): p is Placed & { spec: Extract<PieceSpec, { kind: K }> } => !!p && p.spec.kind === k);
  const items = room.pieces.map((pc, i) => ({ pc, i })).filter((q): q is { pc: Extract<PieceSpec, { kind: 'item' }>; i: number } => q.pc.kind === 'item');
  const sources = kind('source');
  const plates = kind('plate');
  const gates = kind('gate');
  const levers = kind('lever');
  const baskets = kind('basket');
  const lifts = kind('lift');
  const beetles = kind('beetle');
  const seesaws = kind('seesaw');
  const bells = kind('bell');
  const ledges = kind('ledge');
  const shutters = kind('shutter');
  const pinwheels = kind('pinwheel');
  const sluices = kind('sluice');
  const traders = kind('trader');
  const chairs = kind('chair');
  const saplings = kind('sapling');
  const knots = kind('knot');
  const ladders = kind('ladder');
  const teapots = kind('teapot');
  const moons = kind('moonflower');
  const glows = room.pieces.filter((q) => q.kind === 'glow') as Array<Extract<PieceSpec, { kind: 'glow' }>>;
  const chairIds = new Set(chairs.map((c) => kitPlatId(ri, c.spec.id, 0)));
  const box = roomBox(room, byId);
  const ground = new Set([...room.ground, ...kitGround(room, ri)]);
  // the hollow logs he can push in the room (engine.ts: walking into one slides it along its ground, inside its push range)
  const logs = stage.platforms.filter((p) => p.push && p.type === 'solid' && !p.broken && p.x + p.width > box.x0 - 40 && p.x < box.x1 + 40);
  const endIds = new Set(seesaws.flatMap((ss) => [kitPlatId(ri, ss.spec.id, 0), kitPlatId(ri, ss.spec.id, 1)]));
  const name = `room ${room.id}`;
  const beyond = anchorAt(room.beyond, byId);
  if (!beyond) return [`${name}: the spot past its way on is on platform ${room.beyond.on}, which is not there`];

  for (const pc of room.pieces) if ('at' in pc && pc.at && !byId.has(pc.at.on)) errors.add(`${name}: ${pc.id} sits on platform ${pc.at.on}, which is not there`);
  if (!room.pieces.some((p) => p.id === room.exit)) errors.add(`${name}: its way on (${room.exit}) is not one of its pieces`);
  // phase 2a's pieces that reach out of the room: the gust lane a shutter shuts, the river a sluice runs, who hears a bell
  for (const sh of shutters) if (stage.zones?.[sh.spec.zone]?.kind !== 'wind') errors.add(`${name}: ${sh.spec.id} shuts zone ${sh.spec.zone}, which is not a gust lane`);
  for (const sl of sluices) {
    const r = stage.rivers?.[sl.spec.river];
    if (!r) { errors.add(`${name}: ${sl.spec.id} runs river ${sl.spec.river}, which is not there`); continue; }
    // turned about, its logs must still be a hop apart the other way (river.ts hopLimit)
    if ([sl.spec.opened ?? 'with', sl.spec.shut ?? 'still'].includes('against')) {
      const ls = stage.platforms.filter((p) => p.type === 'drift' && p.drift && p.drift.x0 === r.x0 && p.drift.x1 === r.x1);
      const d = ls[0]?.drift;
      if (d && ls.length >= 2) {
        const gap = (d.x1 - d.x0 + d.width) / ls.length - d.width;
        if (gap > hopLimit(d.dir === 1 ? -1 : 1)) errors.add(`${name}: ${sl.spec.id} turns the river about, and its logs are then too far apart to hop (${Math.round(gap)}px)`);
      }
    }
  }
  const ears = listeners(stage);
  for (const b of bells) {
    if (!ears.some((l) => Math.abs(l.x - b.x) <= NOISE.bellHear && (Number.isNaN(l.y) || Math.abs(l.y - b.y) <= NOISE.hearY))) errors.add(`${name}: ${b.spec.id} rings where no watcher can hear it`);
  }
  for (const pc of room.pieces) {
    if (pc.kind !== 'lift' || baskets.some((b) => b.spec.id === pc.by)) continue;
    const pw = pinwheels.find((w) => w.spec.id === pc.by);
    if (pw && !(stage.zones ?? []).some((z) => z.kind === 'wind' && pw.x >= z.x0 && pw.x <= z.x1 && pw.y - 70 >= z.top && pw.y - 70 <= z.bottom)) errors.add(`${name}: ${pw.spec.id} stands where no gust blows, so ${pc.id} never winds up`);
  }
  for (const it of room.pieces) if (it.kind === 'item' && it.with && !traders.some((t) => t.spec.id === it.with)) errors.add(`${name}: ${it.id} is held by ${it.with}, which is not in the room`);
  for (const pc of room.pieces) {
    if ((pc.kind === 'sapling' || pc.kind === 'silk' || pc.kind === 'ladder') && !stage.vines.some((v) => v.id === pc.vine && v.kit)) errors.add(`${name}: ${pc.id}'s climb (vine ${pc.vine}) is not a kit vine of the stage`);
    if (pc.kind === 'teapot' && !baskets.some((b) => b.spec.id === pc.into)) errors.add(`${name}: ${pc.id} pours into ${pc.into}, which is not a basket in the room`);
    if (pc.kind === 'sapling' && !anchorAt(pc.to, byId)) errors.add(`${name}: ${pc.id} bends to platform ${pc.to.on}, which is not there`);
  }
  if (errors.size) return [...errors];

  // where each thing starts, and where a lost one comes back (its source); a thing with no source is gone when lost
  const home = items.map(({ pc }) => {
    const src = pc.source ? sources.find((s) => s.spec.id === pc.source) : undefined;
    if (pc.source && !src) errors.add(`${name}: ${pc.id}'s source ${pc.source} is not in the room`);
    const tr = pc.with ? traders.findIndex((t) => t.spec.id === pc.with) : -1;
    const at = pc.at ? anchorAt(pc.at, byId) : src ? { x: src.x, y: src.y } : tr >= 0 ? { x: traders[tr].x, y: traders[tr].y } : null;
    const plat = pc.at?.on ?? src?.plat ?? (tr >= 0 ? traders[tr].plat : -1);
    return { at, plat, src, tr };
  });
  home.forEach((h, k) => { if (!h.at) errors.add(`${name}: ${items[k].pc.id} has no place to start`); });
  if (errors.size) return [...errors];
  const respawnLoc = (k: number): string => (home[k].src ? `g${home[k].src!.plat}:${Math.round(home[k].src!.x)}` : 'x');
  // (a thing a trader dropped and he lost comes back by the trader's stump: puzzlePlay.ts byTrader)
  const traderLoc = (k: number, side: 1 | -1 = -1): string => groundLoc(k, traders[home[k].tr].plat, traders[home[k].tr].x + side * 56);

  // the cells of ground between gates (a thing's x, but for food, is kept as its cell's middle: what matters is which side of each gate)
  const gateSpans = gates.map((g) => [g.x - KIT.gateW / 2 - BODY_HALF - 2, g.x + KIT.gateW / 2 + BODY_HALF + 2] as const);
  const inGate = (x: number) => gateSpans.some(([a, b]) => x > a && x < b);
  /** a spot on platform p (x0..x1 of a piece of it) that no gate ever covers */
  const repOf = (x0: number, x1: number): number => {
    for (const c of [(x0 + x1) / 2, x0 + 22, x1 - 22, x0 + 6, x1 - 6]) if (c >= x0 && c <= x1 && !inGate(c)) return Math.round(c);
    return Math.round((x0 + x1) / 2);
  };
  const cellX = (plat: number, x: number): number => {
    for (const pl of plates) if (pl.plat === plat && onPlate(x, pl.x, pl.spec.w ?? KIT.plateW)) return Math.round(pl.x);
    const p = byId.get(plat);
    if (!p) return Math.round(x);
    const cuts = gateSpans.filter(([a, b]) => b > p.x && a < p.x + p.width).sort((m, n) => m[0] - n[0]);
    let lo = p.x;
    for (const [a, b] of cuts) {
      if (x < a) return repOf(lo, a);
      lo = b;
    }
    return repOf(lo, p.x + p.width);
  };
  const groundLoc = (k: number, plat: number, x: number) => {
    const food = ITEM[items[k].pc.variant].food;
    return `g${plat}:${food ? Math.round(x / 8) * 8 : cellX(plat, x)}`;
  };
  const parseG = (s: string): { plat: number; x: number } | null => {
    if (s[0] !== 'g') return null;
    const [a, b] = s.slice(1).split(':');
    return { plat: Number(a), x: Number(b) };
  };

  // ── what a state shows ──
  const basketWeight = (s: State, bi: number) => {
    let w = 0;
    s.items.forEach((l, k) => { if (l === `b${bi}`) w += ITEM[items[k].pc.variant].weight; });
    teapots.forEach((tp, ti) => { if (s.tipped[ti] && tp.spec.into === baskets[bi].spec.id) w += tp.spec.weight ?? TEA.weight; });
    return w;
  };
  const levelOf = (s: State, li: number, o?: Map<string, boolean>) => {
    const bi = baskets.findIndex((b) => b.spec.id === lifts[li].spec.by);
    // (wound by a wire, a pinwheel: up while it is on, or for good once wound with a ratchet)
    if (bi < 0) return (lifts[li].spec.hold ? s.wound[li] : o?.get(lifts[li].spec.by) ?? false) ? 1 : 0;
    return liftLevel(basketWeight(s, bi), baskets[bi].spec.need ?? 1);
  };
  /** which seesaw end a log stands on (its middle over the end), or null */
  const logOn = (s: State, gi: number): { si: number; end: number } | null => {
    const cx = s.logs[gi] + logs[gi].width / 2;
    for (let si = 0; si < seesaws.length; si++) {
      const w = seesaws[si].spec.w ?? KIT.seesawW;
      if (cx >= seesaws[si].x - w / 2 && cx <= seesaws[si].x) return { si, end: 0 };
      if (cx > seesaws[si].x && cx <= seesaws[si].x + w / 2) return { si, end: 1 };
    }
    return null;
  };
  const tiltOf = (s: State, si: number): -1 | 0 | 1 => {
    const ss = seesaws[si];
    const w = [0, 0];
    [0, 1].forEach((k) => {
      const id = kitPlatId(ri, ss.spec.id, k);
      if (s.pid === id) w[k] += KIT.pokeyWeight;
      s.items.forEach((l, j) => { const g = parseG(l); if (g && g.plat === id) w[k] += ITEM[items[j].pc.variant].weight; });
      beetles.forEach((b) => { if (b.plat === id) w[k] += KIT.beetleWeight; });
    });
    logs.forEach((_, gi) => { const on = logOn(s, gi); if (on && on.si === si) w[on.end] += KIT.logWeight; });
    return seesawTilt(w[0], w[1], ss.spec.rest ?? -1);
  };
  /** the glowing things lying still (or in a basket): what lights the hidden ledges (held ones light too in the game, but he walks only) */
  const lightsOf = (s: State) => {
    const out: Array<{ x: number; y: number; r: number }> = [];
    s.items.forEach((l, k) => {
      const r = ITEM[items[k].pc.variant].light;
      const g = parseG(l);
      if (!r || !g) return;
      out.push({ x: g.x, y: (byId.get(g.plat)?.y ?? 0) - ITEM[items[k].pc.variant].r, r });
    });
    // the glow that goes with him (Flicker), over where he stands; an open moonflower
    const here = byId.get(s.pid);
    if (here) for (const g of glows) out.push({ x: s.rx, y: here.y - GLOW.up, r: g.r });
    moons.forEach((m, mi) => { if (s.moons[mi]) out.push({ x: m.x, y: m.y - 40, r: m.spec.r }); });
    return out;
  };
  const litOf = (s: State, li: number) => {
    const p = byId.get(kitPlatId(ri, ledges[li].spec.id, 0))!;
    return ledgeLit(p.x, p.x + p.width, p.y, lightsOf(s));
  };
  const beetleX = (s: State, bi: number) => (s.beetles[bi][0] === 's' ? Number(s.beetles[bi].slice(1)) : beetles[bi].x);
  const plateWeight = (s: State, pi: number) => {
    const pl = plates[pi];
    const w = pl.spec.w ?? KIT.plateW;
    let sum = s.plate === pi ? KIT.pokeyWeight : 0;
    s.items.forEach((l, k) => {
      const g = parseG(l);
      if (g && g.plat === pl.plat && onPlate(g.x, pl.x, w)) sum += ITEM[items[k].pc.variant].weight;
    });
    beetles.forEach((b, bi) => { if (b.plat === pl.plat && onPlate(beetleX(s, bi), pl.x, w)) sum += KIT.beetleWeight; });
    return sum;
  };
  const outputs = (s: State): Map<string, boolean> => {
    const o = new Map<string, boolean>();
    const w = (id: string) => o.get(id) ?? false;
    plates.forEach((p, i) => o.set(p.spec.id, plateDown(plateWeight(s, i), p.spec.need ?? 1)));
    levers.forEach((l, i) => o.set(l.spec.id, s.levers[i]));
    baskets.forEach((b, i) => o.set(b.spec.id, basketWeight(s, i) >= (b.spec.need ?? 1)));
    seesaws.forEach((ss, i) => o.set(ss.spec.id, tiltOf(s, i) !== (ss.spec.rest ?? -1)));
    traders.forEach((t, i) => o.set(t.spec.id, s.traded[i]));
    ledges.forEach((l, i) => o.set(l.spec.id, litOf(s, i)));
    saplings.forEach((sp, i) => o.set(sp.spec.id, s.bent[i]));
    knots.forEach((k, i) => o.set(k.spec.id, s.knots[i]));
    teapots.forEach((tp, i) => o.set(tp.spec.id, s.tipped[i]));
    moons.forEach((m, i) => o.set(m.spec.id, s.moons[i]));
    // (a bell rings only for a moment: it is on only in the instant he rings it, long enough for a latching gate to latch: ringing)
    bells.forEach((b, i) => o.set(b.spec.id, ringing === i));
    // (a gate may listen to another gate, a pinwheel to a shutter, a lift to a pinwheel: settle a few times)
    for (let pass = 0; pass < 3; pass++) {
      shutters.forEach((sh) => o.set(sh.spec.id, evalWire(sh.spec.open, w)));
      sluices.forEach((sl) => o.set(sl.spec.id, evalWire(sl.spec.open, w)));
      // a pinwheel spins once a gust lane blows on it: one no shutter holds shut (the lane's own rhythm brings the gust)
      pinwheels.forEach((pw) => o.set(pw.spec.id, (stage.zones ?? []).some((z, zi) => z.kind === 'wind' && pw.x >= z.x0 && pw.x <= z.x1 && pw.y - 70 >= z.top && pw.y - 70 <= z.bottom
        && !shutters.some((sh) => sh.spec.zone === zi && !w(sh.spec.id)))));
      lifts.forEach((l, i) => o.set(l.spec.id, levelOf(s, i, o) >= 1));
      gates.forEach((g, i) => o.set(g.spec.id, s.latched[i] || evalWire(g.spec.open, w)));
      ladders.forEach((la) => o.set(la.spec.id, evalWire(la.spec.open, w)));
    }
    return o;
  };

  // ── the ground for a layout (which doors are open, how high each lift is), from the level check's graph ──
  interface Layout { g: RoomGraph; plats: Platform[]; flight: FlightWorld; piece: (pid: number, x: number) => Platform | null; free: Map<string, Set<string>>; carry: Map<string, Set<string>>; throws: Map<string, Array<{ plat: number; x: number } | { basket: number } | { lost: true } | { knocked: number[]; rest: { plat: number; x: number } | { basket: number } | { lost: true } }>> }
  const layouts = new Map<string, Layout>();
  const layoutOf = (s: State, o: Map<string, boolean>): Layout => {
    const open = gates.map((g) => o.get(g.spec.id)!);
    const lv = lifts.map((_, i) => levelOf(s, i, o));
    const tilts = seesaws.map((_, i) => tiltOf(s, i));
    const lit = ledges.map((_, i) => litOf(s, i));
    const down = ladders.map((la) => o.get(la.spec.id)!);
    const lk = `${open.map(Number).join('')}|${lv.join(',')}|${tilts.join(',')}|${lit.map(Number).join('')}|${s.logs.join(',')}|${down.map(Number).join('')}`;
    const hit = layouts.get(lk);
    if (hit) return hit;
    const walls: KitWall[] = [];
    const kitIds = new Set<number>();
    const flightPlats: Platform[] = [];
    gates.forEach((g, i) => {
      const door = byId.get(kitPlatId(ri, g.spec.id, 0))!;
      const wall = byId.get(kitPlatId(ri, g.spec.id, 1))!;
      kitIds.add(door.id);
      // (the Butler's root arch: its top is ground, the way over him; any other gate's wall over its door is only a wall)
      if (g.spec.look !== 'butler') {
        kitIds.add(wall.id);
        walls.push({ x: wall.x, width: wall.width, top: wall.y, bottom: wall.y + wall.height });
        flightPlats.push(wall);
      }
      if (!open[i]) {
        walls.push({ x: door.x, width: door.width, top: door.y, bottom: door.y + door.height });
        flightPlats.push(door);
      }
    });
    const unlit = new Set(ledges.filter((_, i) => !lit[i]).map((l) => kitPlatId(ri, l.spec.id, 0)));
    const endY = new Map<number, number>();
    seesaws.forEach((ss, i) => {
      const dy = seesawDy(tilts[i], ss.spec.rise ?? KIT.seesawRise);
      [0, 1].forEach((k) => endY.set(kitPlatId(ri, ss.spec.id, k), ss.y + dy[k]));
    });
    // (a trap chair's seat is never ground to stand on and go on from: it holds whoever sits, and pops them off the way they came)
    // (only the ground about the room, ROOM_WINDOW px either side: he comes in at its left edge and is done on the ground past its way on,
    // so the stage's far boughs never enter its walk; the whole stage made each layout's graph cost most of a room stage's build, 8-3
    // about 0.9 s of 1.1 s, 2026-10-31)
    // (and the ground under the spawn and the shrine, which the level check's walk needs to run at all)
    const near = (p: Platform) => (p.x + p.width > box.x0 - ROOM_WINDOW && p.x < box.x1 + ROOM_WINDOW) || (p.x <= stage.spawnX && p.x + p.width >= stage.spawnX) || (p.x <= stage.exitTotemX && p.x + p.width >= stage.exitTotemX);
    const plats = stage.platforms.filter((p) => near(p) && !kitIds.has(p.id) && !unlit.has(p.id) && !chairIds.has(p.id)).map((p) => {
      const li = lifts.findIndex((l) => kitPlatId(ri, l.spec.id, 0) === p.id);
      if (li >= 0) return { ...p, y: p.y - lifts[li].spec.rise * lv[li] };
      if (endY.has(p.id)) return { ...p, y: endY.get(p.id)!, broken: false };
      const gi = logs.indexOf(p);
      if (gi >= 0) {
        // a log pushed onto a seesaw's end stands on it, at the end's height
        const on = logOn(s, gi);
        const y = on ? endY.get(kitPlatId(ri, seesaws[on.si].spec.id, on.end))! - p.height : p.y;
        return { ...p, x: s.logs[gi], y };
      }
      return ledges.some((l) => kitPlatId(ri, l.spec.id, 0) === p.id) ? { ...p, broken: false } : p;
    });
    const lad = new Set(ladders.filter((_, i) => down[i]).map((la) => la.spec.vine));
    const g = graphFor(plats, walls, stage.vines.filter((v) => (!v.kit || lad.has(v.id)) && v.x > box.x0 - ROOM_WINDOW && v.x < box.x1 + ROOM_WINDOW).map((v) => (lad.has(v.id) ? { ...v, kit: false, off: false } : v)));
    const piece = (pid: number, x: number) => g.plats.find((q) => (q.id === pid) && x >= q.x - 1 && x <= q.x + q.width + 1) ?? null;
    // walking with his hands full: along a piece, up a small step, off an edge onto whatever is below it
    const carry = new Map<string, Set<string>>();
    for (const a of g.plats) {
      const ka = g.key(a);
      const set = new Set<string>([ka]);
      for (const ex of [a.x - 2, a.x + a.width + 2]) {
        let best: Platform | null = null;
        for (const b of g.plats) {
          if (b === a || b.x > ex + 24 || b.x + b.width < ex - 24) continue;
          if (b.y < a.y - STEP_UP) continue;
          if (b.y < a.y - 1 && !(b.x <= ex + 2 && b.x + b.width >= ex - 2)) continue;
          if (!best || b.y < best.y) best = b;
        }
        if (best && !walls.some((w) => ex > w.x - BODY_HALF && ex < w.x + w.width + BODY_HALF && w.bottom > Math.min(a.y, best!.y) - 40 && w.top < Math.max(a.y, best!.y))) set.add(g.key(best));
      }
      carry.set(ka, set);
    }
    const mouths = baskets.map((b) => {
      const li = lifts.findIndex((l) => l.spec.by === b.spec.id);
      const drop = (b.spec.drop ?? 0) * (li >= 0 ? lv[li] : 0);
      return { x: b.x, y: b.y - b.spec.mouth + drop, half: KIT.mouthHalf, aim: lifts.some((l) => l.spec.cage !== undefined && l.spec.by === b.spec.id) };
    });
    const flight: FlightWorld = {
      platforms: [...plats, ...flightPlats],
      box,
      baskets: mouths,
      // (a silk knot is knocked as a lever's handle is: its index comes after the levers', as puzzlePlay.ts does after the bells)
      levers: [...levers.map((l) => ({ x0: l.x - 18, x1: l.x + 18, y0: l.y - 60, y1: l.y })), ...knots.map((k) => knotBox(k))],
    };
    const L: Layout = { g, plats, flight, piece, free: new Map(), carry, throws: new Map() };
    layouts.set(lk, L);
    return L;
  };
  const reach = (L: Layout, from: string, hands: 'free' | 'carry'): Set<string> => {
    const memo = hands === 'free' ? L.free : L.carry;
    if (hands === 'free' && memo.has(from)) return memo.get(from)!;
    const seen = new Set<string>([from]);
    const q = [from];
    while (q.length) {
      const n = q.pop()!;
      // (a seesaw's end tips as he lands on it: the way on from there is found from the state with him on it, not this layout)
      if (n !== from && endIds.has(pieceOfKey(L, n)?.id ?? -1)) continue;
      const nexts = hands === 'free' ? L.g.adj.get(n) : L.carry.get(n);
      for (const m of nexts ?? []) if (!seen.has(m)) { seen.add(m); q.push(m); }
    }
    if (hands === 'free') memo.set(from, seen);
    return seen;
  };
  const keyToPiece = (L: Layout) => {
    const m = new Map<string, Platform>();
    for (const p of L.g.plats) m.set(L.g.key(p), p);
    return m;
  };
  const pieceMaps = new Map<Layout, Map<string, Platform>>();
  const pieceOfKey = (L: Layout, k: string) => {
    let m = pieceMaps.get(L);
    if (!m) { m = keyToPiece(L); pieceMaps.set(L, m); }
    return m.get(k) ?? null;
  };

  // ── after a move: beetles go for food they can see; latching gates stay open ──
  /** the bell he is ringing this instant (its index), or -1 */
  let ringing = -1;
  const settle = (s: State) => {
    for (let guard = 0; guard < 6; guard++) {
      let changed = false;
      const o = outputs(s);
      const shut = gates.filter((g) => !o.get(g.spec.id)).map((g) => g.x);
      beetles.forEach((b, bi) => {
        if (s.beetles[bi] !== 'a') return;
        const sight = b.spec.sight ?? BEETLE.sight;
        let best = -1, bd = Infinity;
        s.items.forEach((l, k) => {
          if (!ITEM[items[k].pc.variant].food) return;
          const g = parseG(l);
          if (!g || g.plat !== b.plat) return;
          const d = Math.abs(g.x - b.x);
          if (d > sight || shut.some((w) => (w - b.x) * (w - g.x) < 0)) return;
          if (d < bd) { bd = d; best = k; }
        });
        if (best < 0) return;
        const g = parseG(s.items[best])!;
        s.beetles[bi] = `s${Math.round(beetleSleepX(b.x, g.x))}`;
        s.items[best] = respawnLoc(best);
        changed = true;
      });
      const o2 = outputs(s);
      gates.forEach((g, i) => { if (g.spec.latch && o2.get(g.spec.id) && !s.latched[i]) { s.latched[i] = true; changed = true; } });
      // a ratchet lift (a pinwheel's winch) is counted wound up only with him on it: wound without him, it goes up out of his reach
      // (the room's signpost unwinds it)
      lifts.forEach((l, i) => {
        if (l.spec.hold && !s.wound[i] && o2.get(l.spec.by) && s.pid === kitPlatId(ri, l.spec.id, 0)) { s.wound[i] = true; changed = true; }
      });
      // a moonflower opens once a light reaches it, for good
      moons.forEach((m, mi) => {
        if (s.moons[mi]) return;
        if (lightsOf(s).some((l) => Math.hypot(l.x - m.x, l.y - (m.y - 40)) <= l.r)) { s.moons[mi] = true; changed = true; }
      });
      if (!changed) break;
    }
  };

  const start: State = {
    pid: -1, rx: 0, plate: -1,
    items: items.map((_, k) => (home[k].tr >= 0 ? `t${home[k].tr}` : groundLoc(k, home[k].plat, home[k].at!.x))),
    levers: levers.map((l) => !!l.spec.on),
    beetles: beetles.map(() => 'a'),
    latched: gates.map(() => false),
    logs: logs.map((p) => p.x),
    traded: traders.map(() => false),
    wound: lifts.map(() => false),
    bent: saplings.map(() => false),
    knots: knots.map(() => false),
    tipped: teapots.map(() => false),
    moons: moons.map(() => false),
  };
  // he comes in at the room's left edge: the ground there
  {
    const o = outputs(start);
    const L = layoutOf(start, o);
    const at = L.g.plats.filter((p) => box.x0 >= p.x - 2 && box.x0 <= p.x + p.width + 2 && p.y <= box.y1 && p.y >= box.y0).sort((a, b) => a.y - b.y).pop();
    if (!at) return [`${name}: no ground where it starts`];
    start.pid = at.id;
    start.rx = repOf(Math.max(at.x, box.x0), at.x + at.width);
  }
  settle(start);

  const reach2 = useReach(false);
  const seen = new Set<string>([keyOf(start)]);
  const queue: State[] = [start];
  let solved = false;
  let opened = false;
  const exitSpec = room.pieces.find((p) => p.id === room.exit)!;
  // (a room whose way on is a hanging cage's lift, World 2's reed cages, is solved only with the cage lifted all the way: freed)
  const cageExit = exitSpec.kind === 'lift' && exitSpec.cage !== undefined;
  const push = (s: State) => {
    settle(s);
    const k = keyOf(s);
    if (seen.has(k) || seen.size > MAX_STATES) return;
    seen.add(k);
    queue.push(s);
  };
  const clone = (s: State): State => ({
    ...s, items: [...s.items], levers: [...s.levers], beetles: [...s.beetles], latched: [...s.latched], logs: [...s.logs], traded: [...s.traded], wound: [...s.wound],
    bent: [...s.bent], knots: [...s.knots], tipped: [...s.tipped], moons: [...s.moons],
  });

  while (queue.length && !solved) {
    const s = queue.shift()!;
    const o = outputs(s);
    if (o.get(exitSpec.id)) opened = true;
    const L = layoutOf(s, o);
    const here = L.piece(s.pid, s.rx);
    if (!here) continue;
    const hk = L.g.key(here);
    const held = s.items.indexOf('h');
    // walking: the plate he stood on comes up as he steps off it, so the ground is as it is without him on it
    const off = s.plate < 0 ? s : { ...s, plate: -1 };
    const LW = off === s ? L : layoutOf(off, outputs(off));
    const hw = LW.piece(s.pid, s.rx);
    const ways = hw ? reach(LW, LW.g.key(hw), held >= 0 ? 'carry' : 'free') : new Set<string>();
    // past the way on?
    for (const n of cageExit && !o.get(exitSpec.id) ? [] : ways) {
      const p = pieceOfKey(LW, n);
      if (p && p.id === room.beyond.on && beyond.x >= p.x - 2 && beyond.x <= p.x + p.width + 2) solved = true;
    }
    if (solved) break;
    // walk
    for (const n of ways) {
      const p = pieceOfKey(LW, n);
      if (!p || (hw && n === LW.g.key(hw))) continue;
      const t = clone(s);
      t.pid = p.id;
      t.rx = repOf(p.x, p.x + p.width);
      t.plate = -1;
      push(t);
    }
    const onHere = (plat: number, x: number) => plat === here.id && x >= here.x - 16 && x <= here.x + here.width + 16;
    // stand on a plate here
    plates.forEach((pl, pi) => {
      if (s.plate === pi || !onHere(pl.plat, pl.x)) return;
      const t = clone(s);
      t.plate = pi;
      push(t);
    });
    // (a lever on the ground beside his, in a tap's reach: the game's own rule, puzzlePlay.ts control)
    const inReach = (x: number, y: number) => Math.max(0, here.x - x, x - (here.x + here.width)) <= reach2 && y >= here.y - KIT.up && y <= here.y + KIT.down;
    if (held < 0) {
      // ring a bell here: what latches to it stays open after the ring has gone (a gate a bell opens must latch)
      bells.forEach((b, bi) => {
        if (!onHere(b.plat, b.x) && !inReach(b.x, b.y)) return;
        const t = clone(s);
        ringing = bi;
        settle(t);
        ringing = -1;
        push(t);
      });
      // climb a sapling rooted here to its top: it bends over under him and sets him down at its far end, for good
      saplings.forEach((sp, si) => {
        if (s.bent[si] || !onHere(sp.plat, sp.x)) return;
        const to = anchorAt(sp.spec.to, byId)!;
        const t = clone(s);
        t.bent[si] = true;
        t.pid = sp.spec.to.on;
        t.rx = Math.round(to.x);
        t.plate = -1;
        push(t);
      });
      // tip a teapot over (a tap by it): its tea runs into its basket
      teapots.forEach((tp, ti) => {
        if (s.tipped[ti] || (!onHere(tp.plat, tp.x) && !inReach(tp.x, tp.y))) return;
        const t = clone(s);
        t.tipped[ti] = true;
        push(t);
      });
      // pull a lever here
      levers.forEach((l, li) => {
        if (!onHere(l.plat, l.x) && !inReach(l.x, l.y)) return;
        const t = clone(s);
        t.levers[li] = !t.levers[li];
        push(t);
      });
      // take a thing out of a basket hanging in reach
      L.flight.baskets.forEach((m, bi) => {
        const dx = Math.max(0, here.x - m.x, m.x - (here.x + here.width));
        if (dx > reach2 || m.y < here.y - KIT.up || m.y > here.y + KIT.down) return;
        s.items.forEach((l, k) => {
          if (l !== `b${bi}`) return;
          const t = clone(s);
          t.items[k] = 'h';
          t.plate = -1;
          push(t);
        });
      });
      // push a log standing on his ground: to either end of its push range, or onto a seesaw's end in it (its middle over the end) that
      // stands at the log's foot right now
      logs.forEach((lg, gi) => {
        const lx = s.logs[gi];
        const lp = L.plats.find((q) => q.id === lg.id);
        if (!lp || Math.abs(lp.y + lp.height - here.y) > 3 || lx + lg.width < here.x - 24 || lx > here.x + here.width + 24) return;
        const lo = lg.push!.min, hi = lg.push!.max - lg.width;
        const tos = new Set<number>([Math.round(lo), Math.round(hi)]);
        seesaws.forEach((ss, si) => {
          const w = ss.spec.w ?? KIT.seesawW;
          for (const k of [0, 1]) {
            const ey = L.plats.find((q) => q.id === kitPlatId(ri, ss.spec.id, k))?.y;
            if (ey === undefined || Math.abs(ey - (lp.y + lp.height)) > 8) continue;
            const mid = ss.x + (k ? w / 4 : -w / 4);
            tos.add(Math.round(Math.max(lo, Math.min(hi, mid - lg.width / 2))));
          }
          void si;
        });
        for (const to of tos) {
          if (to === lx) continue;
          const t = clone(s);
          t.logs[gi] = to;
          t.plate = -1;
          push(t);
        }
      });
      // pick a thing up here
      s.items.forEach((l, k) => {
        const g = parseG(l);
        if (!g || !onHere(g.plat, g.x)) return;
        const t = clone(s);
        t.items[k] = 'h';
        t.plate = -1;
        push(t);
      });
      continue;
    }
    // carrying: offer it to a trader here that wants it: it takes it and drops what it holds (either side of its stump)
    traders.forEach((tr, ti) => {
      if (s.traded[ti] || !tradeTakes(tr.spec.wants, items[held].pc.variant) || !onHere(tr.plat, tr.x)) return;
      for (const side of [-1, 1] as const) {
        const t = clone(s);
        t.traded[ti] = true;
        t.items[held] = respawnLoc(held);
        t.items.forEach((l, k) => { if (l === `t${ti}`) t.items[k] = groundLoc(k, tr.plat, tr.x + side * 56); });
        t.plate = -1;
        push(t);
      }
    });
    // carrying: set it down here (in front of him, on a plate here, by a beetle), or into a basket in reach
    const spots = new Set<number>([s.rx]);
    for (const pl of plates) if (onHere(pl.plat, pl.x)) spots.add(Math.round(pl.x));
    beetles.forEach((b, bi) => {
      if (s.beetles[bi] !== 'a' || b.plat !== here.id) return;
      for (const dx of [-60, 60, -(b.spec.sight ?? BEETLE.sight) + 12, (b.spec.sight ?? BEETLE.sight) - 12]) spots.add(Math.round(b.x + dx));
    });
    for (const x of spots) {
      if (x < here.x || x > here.x + here.width) continue;
      const t = clone(s);
      t.items[held] = ground.has(here.id) ? groundLoc(held, here.id, x) : lose(held);
      t.plate = -1;
      push(t);
    }
    L.flight.baskets.forEach((m, bi) => {
      const dx = Math.max(0, here.x - m.x, m.x - (here.x + here.width));
      if (dx > reach2 || m.y < here.y - KIT.up || m.y > here.y) return;
      const t = clone(s);
      t.items[held] = `b${bi}`;
      t.plate = -1;
      push(t);
    });
    // throw it, up or forward, from anywhere along here, facing either way
    const r = ITEM[items[held].pc.variant].r;
    const tk = `${hk}:${r}`;
    let outs = L.throws.get(tk);
    if (!outs) {
      outs = [];
      const n = Math.max(2, Math.min(40, Math.round(here.width / 14)));
      for (let i = 0; i <= n; i++) {
        const x = here.x + 6 + ((here.width - 12) * i) / n;
        if (inGate(x)) continue;
        for (const f of [1, -1] as const) for (const kind of ['up', 'fwd'] as const) {
          const b = throwStart(kind, x, here.y, f);
          if (kind === 'up') aimUp(b, L.flight);
          const { end, knocked } = flyAll(b, L.flight, r);
          const rest = end.kind === 'ground' ? (ground.has(end.plat) ? { plat: end.plat, x: end.x } : { lost: true as const }) : end.kind === 'basket' ? { basket: end.idx } : { lost: true as const };
          outs.push(knocked.length ? { knocked, rest } : rest);
        }
      }
      L.throws.set(tk, outs);
    }
    const doneThrows = new Set<string>();
    for (const out of outs) {
      const t = clone(s);
      t.plate = -1;
      const rest = 'knocked' in out ? out.rest : out;
      if ('knocked' in out) for (const li of out.knocked) { if (li < levers.length) t.levers[li] = !t.levers[li]; else t.knots[li - levers.length] = true; }
      t.items[held] = 'lost' in rest ? lose(held) : 'basket' in rest ? `b${rest.basket}` : groundLoc(held, rest.plat, rest.x);
      const k = keyOf(t);
      if (doneThrows.has(k)) continue;
      doneThrows.add(k);
      push(t);
    }
  }

  function lose(k: number): string {
    if (home[k].tr >= 0) return traderLoc(k);
    if (!home[k].src) errors.add(`${name}: ${items[k].pc.id} can be lost, and nothing brings it back (give it a source)`);
    return respawnLoc(k);
  }

  if (!solved) {
    if (seen.size > MAX_STATES) errors.add(`${name}: too many states to check (${seen.size})`);
    else if (!opened) errors.add(`${name}: its way on (${room.exit}) can never be opened`);
    else errors.add(`${name}: its way on opens, but the ground past it can't be reached`);
  }
  void THROW;
  return [...errors];
}
