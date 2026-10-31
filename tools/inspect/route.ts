/**
 * The main route through a stage: the quickest way from the spawn to the shrine, found on the level check's own graph (levelCheck.ts:
 * every jump, climb, swing and rope it allows with the real jump physics), plus a few links the check does not model for hand-built
 * stages (a chain of lianas or silk lines, a rope between two ledges, and, as a last resort, a "presumed" hop between nearby ledges so a
 * stage the check cannot finish is still traced; those are counted and shown).
 *
 * Times are for a brisk player who holds run: Pokey's top run speed (PHYS.maxRun), climbs at the engine's 220 px/s, swings at about
 * 430 px/s, shimmies at ROPE_SPEED, with stageTime.ts's overheads scaled to its quick player.
 */
import { liftCycle } from '../../src/game/lift.ts';
import { validateStage, jumpOK, type CheckGraph } from '../../src/game/levelCheck.ts';
import { PHYS, JUMP_RISE } from '../../src/game/physics.ts';
import { ROPE_SPEED } from '../../src/game/rope.ts';
import { TIME, MODEL_TYPICAL, MODEL_FAST } from '../../src/game/stageTime.ts';
import type { Platform, Vine } from '../../src/game/types.ts';
import type { Stage } from './stages.ts';

export const RUN = PHYS.maxRun;
export const CLIMB = TIME.climbSpeed;
export const SWING_PACE = 430;
/** stageTime's overheads are for its typical player; the quick player does them this much faster */
export const K = MODEL_TYPICAL.alpha / MODEL_FAST.alpha;

export type MoveKind = 'walk' | 'drop' | 'hop' | 'jump' | 'bounce' | 'timedHop' | 'glide' | 'climb' | 'swing' | 'rope' | 'lift' | 'draft' | 'presumed';

/** one piece of the route: walking along a ledge, or a move from one thing to the next */
export interface Seg {
  kind: MoveKind;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** seconds it takes (movement only; fights and waits are added later) */
  dt: number;
  /** the platform walked on, or landed on */
  plat?: Platform;
  from?: Platform;
  note?: string;
}

export interface Route {
  segs: Seg[];
  /** the shrine was reached on links the level check itself allows */
  traced: 'check' | 'extended' | 'presumed' | 'failed';
  presumedHops: number;
  /** links the inspector added for hand-built pieces the check does not model (liana chains, ropes) */
  addedLinks: number;
  /** goal stops the route was asked to visit, and how many it could not reach */
  stops: number;
  skippedStops: number;
}

type NodeKind = 'plat' | 'climb' | 'liana' | 'draft';
interface Node {
  key: string;
  kind: NodeKind;
  plat?: Platform;
  vine?: Vine;
  draft?: { x0: number; x1: number; top: number; bottom: number };
}
interface Edge {
  to: string;
  kind: 'graph' | 'liana' | 'rope' | 'presumed';
}

const ext = (p: Platform): [number, number] =>
  p.type === 'moving'
    ? [(p.baseX ?? p.x) - (p.moveRange ?? 0), (p.baseX ?? p.x) + (p.moveRange ?? 0) + p.width]
    : p.type === 'drift' && p.drift
      ? [p.drift.x0, p.drift.x1]
      : [p.x, p.x + p.width];
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const dxTo = (x0: number, x1: number, x: number) => (x < x0 ? x0 - x : x > x1 ? x - x1 : 0);
export const isLiana = (v: Vine) => v.vineType === 'swing_liana' || !!v.isSwingingVine || !!v.silk;

export function findRoute(stage: Stage, targets: Array<{ x: number; y: number }> = []): Route {
  let graph: CheckGraph | null = null;
  validateStage(stage, { inspect: (g) => (graph = g) });
  const g = graph as CheckGraph | null;
  const nodes = new Map<string, Node>();
  const edges = new Map<string, Edge[]>();
  const addEdge = (a: string, b: string, kind: Edge['kind']) => {
    if (!nodes.has(a) || !nodes.has(b) || a === b) return;
    if (!edges.has(a)) edges.set(a, []);
    const list = edges.get(a)!;
    if (!list.some((e) => e.to === b)) list.push({ to: b, kind });
  };
  const plats: Platform[] = g ? [...g.plats] : stage.platforms.filter((p) => !p.broken);
  const keyOf = (p: Platform) => (g ? g.key(p) : `p${p.id}`);
  for (const p of plats) {
    const k = keyOf(p);
    // (a lift is two copies under one key: the first is kept, its top)
    if (!nodes.has(k)) nodes.set(k, { key: k, kind: 'plat', plat: p });
  }
  for (const v of stage.vines) if (!isLiana(v)) nodes.set(`v${v.id}`, { key: `v${v.id}`, kind: 'climb', vine: v });
  (stage.updrafts ?? []).forEach((u, i) => nodes.set(`u${i}`, { key: `u${i}`, kind: 'draft', draft: u }));
  if (g) for (const [a, set] of g.adj) for (const b of set) addEdge(a, b, 'graph');

  let added = 0;
  // liana chains (the check only links ledge -> liana -> ledge, so a run of lianas or silk lines over a gorge is added here)
  const lianas = stage.vines.filter(isLiana);
  for (const v of lianas) nodes.set(`L${v.id}`, { key: `L${v.id}`, kind: 'liana', vine: v });
  const walkable = plats.filter((p) => p.type !== 'moving' && p.type !== 'drift');
  for (const v of lianas) {
    const len = Math.max(80, v.bottomY - v.topY);
    for (const p of walkable) {
      const [x0, x1] = ext(p);
      const d = dxTo(x0, x1, v.x);
      // grab it from this ledge: the liana's foot within a jump (and a bit) of his reach, close enough to leap to
      if (d <= 340 && v.bottomY >= p.y - JUMP_RISE * 2.2 && v.topY <= p.y) { addEdge(keyOf(p), `L${v.id}`, 'liana'); added++; }
      // let go onto this ledge: below the anchor, within the arc and the leap after it
      if (d <= 0.9 * len + 320 && p.y >= v.topY + 0.3 * len && p.y <= v.bottomY + 480) { addEdge(`L${v.id}`, keyOf(p), 'liana'); added++; }
    }
    for (const w of lianas) {
      if (w === v) continue;
      const lw = Math.max(80, w.bottomY - w.topY);
      if (Math.abs(w.x - v.x) <= 0.9 * len + 0.9 * lw + 260 && w.bottomY >= v.topY && w.topY <= v.bottomY + 200) { addEdge(`L${v.id}`, `L${w.id}`, 'liana'); added++; }
    }
  }
  // shimmy ropes: the two ledges they join (generously: the check asks for an exact fit, and only once every player has the skill)
  for (const r of stage.ropes ?? []) {
    const left = walkable.filter((p) => Math.abs(p.y - r.g0) < 40 && dxTo(ext(p)[0], ext(p)[1], r.x0) < 90);
    const right = walkable.filter((p) => Math.abs(p.y - r.g1) < 40 && dxTo(ext(p)[0], ext(p)[1], r.x1) < 90);
    for (const a of left) for (const b of right) {
      if (a === b) continue;
      addEdge(keyOf(a), keyOf(b), 'rope');
      addEdge(keyOf(b), keyOf(a), 'rope');
      added++;
    }
  }

  const start = plats.find((p) => stage.spawnX >= ext(p)[0] - 4 && stage.spawnX <= ext(p)[1] + 4 && Math.abs(p.y - stage.spawnY) < 6)
    ?? nearestPlat(plats, stage.spawnX, stage.spawnY);
  const exit = plats.find((p) => stage.exitTotemX >= ext(p)[0] - 2 && stage.exitTotemX <= ext(p)[1] + 2 && Math.abs(p.y - stage.exitTotemY) < 6)
    ?? nearestPlat(plats, stage.exitTotemX, stage.exitTotemY);
  if (!start || !exit) return { segs: [], traced: 'failed', presumedHops: 0, addedLinks: added, stops: 0, skippedStops: 0 };
  const s = keyOf(start);
  const e = keyOf(exit);

  // the stops on the way: the place under each thing the goal counts (in order along the stage), then the shrine
  const stops: Array<{ key: string; x: number }> = [];
  for (const t of targets) {
    const p = platUnder(plats, t.x, t.y);
    if (!p) continue;
    const k = keyOf(p);
    if (stops.length && stops[stops.length - 1].key === k) continue;
    stops.push({ key: k, x: clamp(t.x, ...ext(p)) });
  }
  stops.push({ key: e, x: stage.exitTotemX });

  let presumedAdded = false;
  const addPresumed = () => {
    if (presumedAdded) return;
    presumedAdded = true;
    // last resort: a presumed hop between any two ledges close together (a piece the check does not model: a pushed log, a lift)
    for (const a of walkable) {
      const [ax0, ax1] = ext(a);
      for (const b of walkable) {
        if (a === b) continue;
        const [bx0, bx1] = ext(b);
        const gap = Math.max(0, bx0 - ax1, ax0 - bx1);
        if (gap <= 420 && a.y - b.y <= 300 && b.y - a.y <= 600) addEdge(keyOf(a), keyOf(b), 'presumed');
      }
    }
  };
  const segs: Seg[] = [];
  let cur = s;
  let at: At = { x: stage.spawnX, y: start.y };
  let usedPresumed = false;
  let skippedStops = 0;
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    let leg = dijkstra(nodes, edges, cur, at, stop.key, stop.x, stage, presumedAdded);
    if (!leg) {
      addPresumed();
      leg = dijkstra(nodes, edges, cur, at, stop.key, stop.x, stage, true);
    }
    if (!leg) { skippedStops++; continue; }
    if (leg.segs.some((x) => x.kind === 'presumed')) usedPresumed = true;
    segs.push(...leg.segs);
    cur = stop.key;
    at = leg.end;
  }
  if (cur !== e) return { segs: [], traced: 'failed', presumedHops: 0, addedLinks: added, stops: stops.length - 1, skippedStops };
  const traced: Route['traced'] = usedPresumed ? 'presumed' : segs.some((x) => x.note === 'added') ? 'extended' : 'check';
  return { segs, traced, presumedHops: segs.filter((x) => x.kind === 'presumed').length, addedLinks: added, stops: stops.length - 1, skippedStops };
}

/** the ledge a pickup sits over (within a jump's reach above it), or a climbing trunk's foot is not counted */
function platUnder(plats: Platform[], x: number, y: number): Platform | undefined {
  let best: Platform | undefined;
  for (const p of plats) {
    if (p.type === 'drift' || p.type === 'moving' || p.type === 'bouncy') continue;
    const [x0, x1] = ext(p);
    if (x < x0 - 30 || x > x1 + 30 || p.y < y - 10 || p.y - y > 200) continue;
    if (!best || p.y < best.y) best = p;
  }
  return best;
}

function nearestPlat(plats: Platform[], x: number, y: number): Platform | undefined {
  let best: Platform | undefined;
  let bd = Infinity;
  for (const p of plats) {
    const [x0, x1] = ext(p);
    const d = dxTo(x0, x1, x) + Math.abs(p.y - y);
    if (p.y >= y - 10 && d < bd) { bd = d; best = p; }
  }
  return best;
}

interface At { x: number; y: number }
interface Step { segs: Seg[]; at: At; cost: number }

/** the move from one node (standing at `at`) to the next: the walk to the take-off, then the move */
function move(stage: Stage, a: Node, b: Node, kind: Edge['kind'], at: At): Step | null {
  const segs: Seg[] = [];
  const walkTo = (x: number, y: number) => {
    if (Math.abs(x - at.x) > 0.5) segs.push({ kind: 'walk', x0: at.x, y0: at.y, x1: x, y1: y, dt: Math.abs(x - at.x) / RUN, plat: a.plat });
  };
  let penalty = 0;
  if (a.kind === 'plat' && b.kind === 'plat') {
    const A = a.plat!, B = b.plat!;
    const [ax0, ax1] = ext(A), [bx0, bx1] = ext(B);
    let tx: number, lx: number;
    if (bx0 >= ax1) { tx = ax1; lx = bx0; }
    else if (bx1 <= ax0) { tx = ax0; lx = bx1; }
    else { tx = clamp(at.x, Math.max(ax0, bx0), Math.min(ax1, bx1)); lx = tx; }
    if (A.type === 'drift' || A.type === 'moving') tx = clamp(lx, ax0, ax1);
    if (B.type === 'drift' || B.type === 'moving') lx = clamp(tx, bx0, bx1);
    walkTo(tx, A.y);
    const gap = Math.abs(lx - tx);
    const rise = A.y - B.y;
    let k: MoveKind;
    const lo = Math.min(tx, lx), hi = Math.max(tx, lx);
    const byRope = gap > 60 && (stage.ropes ?? []).some((r) => r.x0 <= lo + 90 && r.x1 >= hi - 90 && Math.abs(r.g0 - A.y) < 60 && Math.abs(r.g1 - B.y) < 60);
    if (kind === 'presumed') { k = 'presumed'; penalty = 4; }
    else if (kind === 'rope' || byRope) k = 'rope';
    else if (A.type === 'bouncy') k = 'bounce';
    // (World 9's moving logs, lift.ts `bob`: onto or between rafts and logs is a timed hop; onto a piston a ride; off a piston's top a step)
    else if (B.type === 'moving' && B.lift?.bob) k = B.lift.bob === 'piston' ? 'lift' : 'timedHop';
    else if (A.type === 'moving' && A.lift?.bob && B.type !== 'moving') k = A.lift.bob === 'piston' ? (gap <= 10 && rise <= 16 ? 'walk' : 'hop') : 'timedHop';
    else if (A.type === 'drift' || B.type === 'drift' || A.type === 'moving' || B.type === 'moving') k = A.lift || B.lift ? 'lift' : 'timedHop';
    else if (gap <= 10 && rise <= 16) k = rise < -40 ? 'drop' : 'walk';
    else if (jumpOK(A, B, false).ok || jumpOK(A, B, true).ok) {
      const floor = stage.platforms.some((c) => c !== A && c !== B && !c.broken && c.x < Math.max(tx, lx) && c.x + c.width > Math.min(tx, lx) && c.y > Math.max(A.y, B.y) && c.y < Math.max(A.y, B.y) + 200);
      const dbl = !jumpOK(A, B, false).ok;
      k = dbl || gap >= 200 || (gap > 30 && !floor) || rise > JUMP_RISE * 0.9 ? 'jump' : 'hop';
    } else {
      // the check linked them, but no jump covers it: a swing (a liana between) or the leaf
      const between = stage.vines.some((v) => isLiana(v) && v.x > Math.min(tx, lx) - 120 && v.x < Math.max(tx, lx) + 120);
      k = between ? 'swing' : 'glide';
    }
    let dt = gap / RUN;
    if (k === 'hop') dt += TIME.hopSec * K;
    else if (k === 'jump' || k === 'glide' || k === 'presumed') dt += 0.5 + Math.max(0, -rise) / 900;
    else if (k === 'bounce') dt += TIME.bounceExtra;
    else if (k === 'timedHop') dt += 0.4 + (B.lift?.bob && B.lift.bob !== 'sink' ? liftCycle(B.lift) * 0.3 : 0);
    else if (k === 'lift') dt += Math.abs(rise) / 120 + TIME.movingExtra;
    else if (k === 'swing') dt = gap / SWING_PACE + 1.2;
    else if (k === 'rope') dt = gap / ROPE_SPEED + TIME.ropeOverhead * K;
    else if (k === 'drop') dt += Math.sqrt((2 * Math.max(0, -rise)) / 1800);
    // (down into a soft pit that has lianas or silk lines hung over it: that pit is the miss, and a player takes the swing. Only the
    // route's choice is weighed, not its time: 5-4's quick route dropped through every pit under its silk lines, 2026-10-31)
    if ((k === 'drop' || k === 'hop' || k === 'jump' || k === 'swing') && rise < -60 && (B.style === 'moss_stone' || B.style === 'branch')
      && stage.vines.some((v) => isLiana(v) && v.x > lx - 300 && v.x < lx + 420 && v.bottomY < B.y - 60)) penalty += 6;
    segs.push({ kind: k, x0: tx, y0: A.y, x1: lx, y1: B.y, dt, plat: B, from: A, note: kind === 'graph' ? undefined : 'added' });
    return { segs, at: { x: lx, y: B.y }, cost: sum(segs) + penalty };
  }
  if (a.kind === 'plat' && b.kind === 'climb') {
    const A = a.plat!, v = b.vine!;
    const tx = clamp(v.x, ...ext(A));
    walkTo(tx, A.y);
    segs.push({ kind: 'climb', x0: tx, y0: A.y, x1: v.x, y1: A.y, dt: Math.abs(v.x - tx) / RUN + 0.3, from: A, note: 'grab' });
    return { segs, at: { x: v.x, y: clamp(A.y, v.topY, v.bottomY) }, cost: sum(segs) };
  }
  if (a.kind === 'climb' && b.kind === 'plat') {
    const v = a.vine!, B = b.plat!;
    const lx = clamp(v.x, ...ext(B));
    const climb = Math.abs(at.y - clamp(B.y, v.topY, v.bottomY));
    segs.push({ kind: 'climb', x0: at.x, y0: at.y, x1: lx, y1: B.y, dt: climb / CLIMB + TIME.climbOverhead * K + Math.abs(lx - v.x) / RUN, plat: B });
    return { segs, at: { x: lx, y: B.y }, cost: sum(segs) };
  }
  if (a.kind === 'plat' && b.kind === 'liana') {
    const A = a.plat!, v = b.vine!;
    const [ax0, ax1] = ext(A);
    const tx = v.x >= ax1 ? ax1 : v.x <= ax0 ? ax0 : clamp(at.x, ax0, ax1);
    walkTo(tx, A.y);
    segs.push({ kind: 'swing', x0: tx, y0: A.y, x1: v.x, y1: v.bottomY, dt: Math.abs(v.x - tx) / RUN + 0.4, from: A, note: 'added' });
    return { segs, at: { x: v.x, y: v.bottomY }, cost: sum(segs) };
  }
  if (a.kind === 'liana' && b.kind === 'liana') {
    const v = a.vine!, w = b.vine!;
    segs.push({ kind: 'swing', x0: v.x, y0: at.y, x1: w.x, y1: w.bottomY, dt: Math.abs(w.x - v.x) / SWING_PACE + 1.2, note: 'added' });
    return { segs, at: { x: w.x, y: w.bottomY }, cost: sum(segs) };
  }
  if (a.kind === 'liana' && b.kind === 'plat') {
    const v = a.vine!, B = b.plat!;
    const lx = clamp(v.x, ...ext(B));
    segs.push({ kind: 'swing', x0: v.x, y0: at.y, x1: lx, y1: B.y, dt: Math.abs(lx - v.x) / SWING_PACE + 1.2, plat: B, note: 'added' });
    // (letting go down onto a catch ledge with the next line hung just ahead is the miss, not the way: a player swings on)
    const miss = B.y > v.bottomY + 100 && stage.vines.some((w) => w !== v && isLiana(w) && w.x > v.x + 60 && w.x < v.x + 420);
    return { segs, at: { x: lx, y: B.y }, cost: sum(segs) + (miss ? 6 : 0) };
  }
  if (a.kind === 'plat' && b.kind === 'draft') {
    const A = a.plat!, u = b.draft!;
    const tx = clamp((u.x0 + u.x1) / 2, ...ext(A));
    walkTo(tx, A.y);
    const mid = clamp(tx, u.x0, u.x1);
    segs.push({ kind: 'draft', x0: tx, y0: A.y, x1: mid, y1: u.top + 36, dt: Math.abs(mid - tx) / RUN + Math.abs(A.y - u.top) / 260 + 0.5, from: A });
    return { segs, at: { x: mid, y: u.top + 36 }, cost: sum(segs) };
  }
  if (a.kind === 'draft' && b.kind === 'plat') {
    const B = b.plat!;
    const lx = clamp(at.x, ...ext(B));
    segs.push({ kind: 'glide', x0: at.x, y0: at.y, x1: lx, y1: B.y, dt: Math.abs(lx - at.x) / RUN + 0.6, plat: B });
    return { segs, at: { x: lx, y: B.y }, cost: sum(segs) };
  }
  if (a.kind === 'climb' && b.kind === 'climb') return null;
  return null;
}

const sum = (s: Seg[]) => s.reduce((t, x) => t + x.dt, 0);

function dijkstra(nodes: Map<string, Node>, edges: Map<string, Edge[]>, s: string, from: At, e: string, endX: number, stage: Stage, allowPresumed: boolean): { segs: Seg[]; end: At } | null {
  const dist = new Map<string, number>([[s, 0]]);
  const at = new Map<string, At>([[s, from]]);
  const prev = new Map<string, { from: string; segs: Seg[] }>();
  const done = new Set<string>();
  // a small binary heap
  const heap: Array<[number, string]> = [[0, s]];
  const push = (d: number, k: string) => {
    heap.push([d, k]);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = (): [number, string] => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, k] = pop();
    if (done.has(k)) continue;
    done.add(k);
    if (k === e) break;
    const a = nodes.get(k)!;
    for (const ed of edges.get(k) ?? []) {
      if (ed.kind === 'presumed' && !allowPresumed) continue;
      if (done.has(ed.to)) continue;
      const b = nodes.get(ed.to)!;
      const st = move(stage, a, b, ed.kind, at.get(k)!);
      if (!st) continue;
      const nd = d + st.cost;
      if (nd < (dist.get(ed.to) ?? Infinity)) {
        dist.set(ed.to, nd);
        at.set(ed.to, st.at);
        prev.set(ed.to, { from: k, segs: st.segs });
        push(nd, ed.to);
      }
    }
  }
  if (!done.has(e)) return null;
  const chain: Seg[][] = [];
  let k = e;
  while (k !== s) {
    const p = prev.get(k)!;
    chain.push(p.segs);
    k = p.from;
  }
  chain.reverse();
  const segs = chain.flat();
  // the last walk, to the stop itself (the shrine, or under the thing the goal counts)
  const end = at.get(e)!;
  const en = nodes.get(e)!;
  const x = en.plat ? clamp(endX, ...ext(en.plat)) : end.x;
  if (Math.abs(x - end.x) > 0.5) segs.push({ kind: 'walk', x0: end.x, y0: end.y, x1: x, y1: end.y, dt: Math.abs(x - end.x) / RUN, plat: en.plat });
  return { segs, end: { x, y: end.y } };
}
