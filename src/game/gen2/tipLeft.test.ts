// A socket tip on a leg laid LEFT (ENG-TIPLEFT, the engine gap 2-8's build found): the pipeline gave every socket tip { x, band } and the
// engine says a line once p.x >= x with his feet in its band, so running home (leftward) he was right of the socket from the moment he
// entered the leg: 2-8 seed 2's fork line ("The low road's quick, but filling...") was said at the column's foot, 7,029 px of route
// before its socket. Now a tip on a section he walks leftward is said from its socket on, walking left (x .. beforeX, the water
// warning's way); a right-running tip is as it was. The checks walk the route with the ENGINE's own rule (hintDue, engine.ts).
// Each planted run is the hint as the pipeline laid it before this piece ({ x: socket }, no beforeX): it must fail.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildStage } from '../../../tools/engine/libstage.ts';
import { hintDue } from '../hintDue.ts';
import { TIP_LEFT_KEEP, TIP_NEAR, tipHintOf, tipReach } from './pipeline.ts';
import { routeAt, type Route } from './tower.ts';
import type { StageHint } from '../protoStage.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
type Tip = { f: { what: string; section: string; x: number; y: number }; h: StageHint; left: boolean; st: Any };

/** 2-8 (the first stage with a socket tip on a home leg), seeds 1-4, both settings: every socket tip with its hint and its leg's way */
const tips: Tip[] = [];
for (const seed of [1, 2, 3, 4]) for (const d of ['normal', 'easy'] as const) {
  let st: Any;
  try { st = buildStage('2-8', seed, d); } catch { continue; }
  const route: Route | undefined = st.gen2.tower?.route;
  for (const f of st.gen2.fills) {
    if (f.role !== 'tip' || !f.what || f.unsaid || f.socket === 'water') continue;
    const h = tipHintOf(st.proto.hints as StageHint[], f);
    const g = route?.legs.find((q) => q.uid === f.section);
    if (h && g) tips.push({ f, h, left: g.exit.x < g.entry.x, st });
  }
}

/** the route px where he is first due to hear `h`, walking the route as he walks it with the engine's rule; Infinity if never */
function firstDue(st: Any, h: StageHint): number {
  const route: Route = st.gen2.tower.route;
  const line = [route.spawn, ...route.legs.flatMap((g) => [g.entry, g.exit]), route.exit];
  for (let i = 1, s = 0; i < line.length; i++) {
    const a = line[i - 1], b = line[i], len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y), n = Math.max(1, Math.ceil(len / 4));
    for (let j = 0; j <= n; j++) {
      const x = a.x + ((b.x - a.x) * j) / n, y = a.y + ((b.y - a.y) * j) / n;
      if (hintDue(h, x, y, y, true)) return s + (len * j) / n;
    }
    s += len;
  }
  return Infinity;
}
const before = (h: StageHint, socket: number): StageHint => ({ ...h, x: socket, beforeX: undefined });

test('2-8 lays a socket tip on a leftward leg on some seed 1-4 (else the checks below judge nothing)', () => {
  assert.ok(tips.some((t) => t.left), `left-leg tips: 0 of ${tips.length}`);
  assert.ok(tips.some((t) => !t.left), `right-leg tips: 0 of ${tips.length}`);
});

test('a left-leg socket tip is said within its reach of the socket, walking left (planted: the old hint, said on entering the leg)', () => {
  for (const t of tips.filter((q) => q.left)) {
    const socket = routeAt(t.st.gen2.tower.route, t.f.x, t.f.y);
    assert.equal(t.h.beforeX, t.f.x, `${t.f.what}: beforeX is its socket`);
    assert.ok(t.h.x <= t.f.x - TIP_LEFT_KEEP, `${t.f.what}: its window runs at least TIP_LEFT_KEEP left of the socket`);
    const at = firstDue(t.st, t.h);
    assert.ok(Number.isFinite(at) && socket - at <= TIP_NEAR && socket - at >= -TIP_NEAR, `${t.f.what} at x ${t.f.x}: said ${Math.round(socket - at)} px of route before its socket`);
    const old = firstDue(t.st, before(t.h, t.f.x));
    assert.ok(socket - old > TIP_NEAR, `planted ${t.f.what}: the old hint was said only ${Math.round(socket - old)} px early`);
  }
});

test('a right-leg socket tip is unchanged: { x: its socket }, no beforeX, said at its socket', () => {
  for (const t of tips.filter((q) => !q.left)) {
    assert.equal(t.h.x, t.f.x);
    assert.equal(t.h.beforeX, undefined);
    const socket = routeAt(t.st.gen2.tower.route, t.f.x, t.f.y);
    assert.ok(Math.abs(socket - firstDue(t.st, t.h)) <= TIP_NEAR, t.f.what);
  }
});

test('tipReach reads the route as he walks it: it passes the left-leg tip and refuses the old hint (planted)', () => {
  for (const t of tips.filter((q) => q.left)) {
    const q = tipReach(t.st).find((r) => r.x === t.f.x && r.what === t.f.what)!;
    assert.ok(q && q.early <= TIP_NEAR, `${t.f.what}: tipReach says ${q?.early} px early`);
    const hints = (t.st.proto.hints as StageHint[]).map((h) => (h === t.h ? before(h, t.f.x) : h));
    const p = tipReach({ ...t.st, proto: { hints } }).find((r) => r.x === t.f.x && r.what === t.f.what)!;
    assert.ok(p && p.early > TIP_NEAR, `planted ${t.f.what}: tipReach passed the old hint (${p?.early} px early)`);
  }
});
