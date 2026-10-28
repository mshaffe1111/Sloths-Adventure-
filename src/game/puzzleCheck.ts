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
 *   - stand on a plate on his piece of ground; pull a lever there.
 * After each move a beetle that can see food goes and eats it and falls asleep there (its rule, puzzleKit.ts stepBeetle).
 *
 * A room fails when no state lets him reach the platform past its way on (its gate never opens, or its lift never rises), or when a
 * thing with no source can be lost (it would never come back).
 */
import { anchorAt, beetleSleepX, BEETLE, evalWire, flyAll, ITEM, KIT, kitPlatId, liftLevel, onPlate, plateDown, roomBox, THROW, throwStart, useReach, type FlightWorld, type PieceSpec, type RoomSpec } from './puzzleKit.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform } from './types.ts';

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
export type GraphFor = (platforms: Platform[], walls: readonly KitWall[]) => RoomGraph;

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
  kit.rooms.forEach((room, ri) => room.pieces.forEach((pc) => {
    if (pc.kind === 'gate') doors.add(kitPlatId(ri, pc.id, 0));
    if (pc.kind === 'lift') lifts.set(kitPlatId(ri, pc.id, 0), pc.rise);
  }));
  // (a lift is one stop reached at its bottom and its top, as World 2's basket lift is: levelCheck.ts joins the two)
  const platforms = stage.platforms
    .filter((p) => !doors.has(p.id))
    .map((p) => (lifts.has(p.id) ? { ...p, lift: { top: p.y - lifts.get(p.id)!, bottom: p.y, speed: KIT.liftSpeed, wait: 0, phase: 0 } } : p));
  return { ...stage, platforms, kit: undefined };
}

/** check every room of the stage; the errors (none: every room can be solved, and nothing in one can be lost for good) */
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
}
const keyOf = (s: State) => `${s.pid}:${s.rx}:${s.plate}|${s.items.join(',')}|${s.levers.map(Number).join('')}|${s.beetles.join(',')}|${s.latched.map(Number).join('')}`;

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
  const box = roomBox(room, byId);
  const ground = new Set(room.ground);
  const name = `room ${room.id}`;
  const beyond = anchorAt(room.beyond, byId);
  if (!beyond) return [`${name}: the spot past its way on is on platform ${room.beyond.on}, which is not there`];

  for (const pc of room.pieces) if ('at' in pc && pc.at && !byId.has(pc.at.on)) errors.add(`${name}: ${pc.id} sits on platform ${pc.at.on}, which is not there`);
  if (!room.pieces.some((p) => p.id === room.exit)) errors.add(`${name}: its way on (${room.exit}) is not one of its pieces`);
  if (errors.size) return [...errors];

  // where each thing starts, and where a lost one comes back (its source); a thing with no source is gone when lost
  const home = items.map(({ pc }) => {
    const src = pc.source ? sources.find((s) => s.spec.id === pc.source) : undefined;
    if (pc.source && !src) errors.add(`${name}: ${pc.id}'s source ${pc.source} is not in the room`);
    const at = pc.at ? anchorAt(pc.at, byId) : src ? { x: src.x, y: src.y } : null;
    const plat = pc.at?.on ?? src?.plat ?? -1;
    return { at, plat, src };
  });
  home.forEach((h, k) => { if (!h.at) errors.add(`${name}: ${items[k].pc.id} has no place to start`); });
  if (errors.size) return [...errors];
  const respawnLoc = (k: number): string => (home[k].src ? `g${home[k].src!.plat}:${Math.round(home[k].src!.x)}` : 'x');

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
    return w;
  };
  const levelOf = (s: State, li: number) => {
    const bi = baskets.findIndex((b) => b.spec.id === lifts[li].spec.by);
    return bi < 0 ? 0 : liftLevel(basketWeight(s, bi), baskets[bi].spec.need ?? 1);
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
    plates.forEach((p, i) => o.set(p.spec.id, plateDown(plateWeight(s, i), p.spec.need ?? 1)));
    levers.forEach((l, i) => o.set(l.spec.id, s.levers[i]));
    baskets.forEach((b, i) => o.set(b.spec.id, basketWeight(s, i) >= (b.spec.need ?? 1)));
    lifts.forEach((l, i) => o.set(l.spec.id, levelOf(s, i) >= 1));
    // (a gate may listen to another gate: settle twice)
    for (let pass = 0; pass < 2; pass++) gates.forEach((g, i) => o.set(g.spec.id, s.latched[i] || evalWire(g.spec.open, (id) => o.get(id) ?? false)));
    return o;
  };

  // ── the ground for a layout (which doors are open, how high each lift is), from the level check's graph ──
  interface Layout { g: RoomGraph; plats: Platform[]; flight: FlightWorld; piece: (pid: number, x: number) => Platform | null; free: Map<string, Set<string>>; carry: Map<string, Set<string>>; throws: Map<string, Array<{ plat: number; x: number } | { basket: number } | { lost: true } | { knocked: number[]; rest: { plat: number; x: number } | { basket: number } | { lost: true } }>> }
  const layouts = new Map<string, Layout>();
  const layoutOf = (s: State, o: Map<string, boolean>): Layout => {
    const open = gates.map((g) => o.get(g.spec.id)!);
    const lv = lifts.map((_, i) => levelOf(s, i));
    const lk = `${open.map(Number).join('')}|${lv.join(',')}`;
    const hit = layouts.get(lk);
    if (hit) return hit;
    const walls: KitWall[] = [];
    const kitIds = new Set<number>();
    const flightPlats: Platform[] = [];
    gates.forEach((g, i) => {
      const door = byId.get(kitPlatId(ri, g.spec.id, 0))!;
      const wall = byId.get(kitPlatId(ri, g.spec.id, 1))!;
      kitIds.add(door.id);
      kitIds.add(wall.id);
      walls.push({ x: wall.x, width: wall.width, top: wall.y, bottom: wall.y + wall.height });
      flightPlats.push(wall);
      if (!open[i]) {
        walls.push({ x: door.x, width: door.width, top: door.y, bottom: door.y + door.height });
        flightPlats.push(door);
      }
    });
    const plats = stage.platforms.filter((p) => !kitIds.has(p.id)).map((p) => {
      const li = lifts.findIndex((l) => kitPlatId(ri, l.spec.id, 0) === p.id);
      return li >= 0 ? { ...p, y: p.y - lifts[li].spec.rise * lv[li] } : p;
    });
    const g = graphFor(plats, walls);
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
      return { x: b.x, y: b.y - b.spec.mouth + drop, half: KIT.mouthHalf };
    });
    const flight: FlightWorld = {
      platforms: [...plats, ...flightPlats],
      box,
      baskets: mouths,
      levers: levers.map((l) => ({ x0: l.x - 18, x1: l.x + 18, y0: l.y - 60, y1: l.y })),
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
      if (!changed) break;
    }
  };

  const start: State = {
    pid: -1, rx: 0, plate: -1,
    items: items.map((_, k) => groundLoc(k, home[k].plat, home[k].at!.x)),
    levers: levers.map((l) => !!l.spec.on),
    beetles: beetles.map(() => 'a'),
    latched: gates.map(() => false),
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
  const push = (s: State) => {
    settle(s);
    const k = keyOf(s);
    if (seen.has(k) || seen.size > MAX_STATES) return;
    seen.add(k);
    queue.push(s);
  };
  const clone = (s: State): State => ({ ...s, items: [...s.items], levers: [...s.levers], beetles: [...s.beetles], latched: [...s.latched] });

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
    for (const n of ways) {
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
    if (held < 0) {
      // pull a lever here
      levers.forEach((l, li) => {
        if (!onHere(l.plat, l.x)) return;
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
      if ('knocked' in out) for (const li of out.knocked) t.levers[li] = !t.levers[li];
      t.items[held] = 'lost' in rest ? lose(held) : 'basket' in rest ? `b${rest.basket}` : groundLoc(held, rest.plat, rest.x);
      const k = keyOf(t);
      if (doneThrows.has(k)) continue;
      doneThrows.add(k);
      push(t);
    }
  }

  function lose(k: number): string {
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
