/**
 * The way on through a stage laid as a tower (gen2/tower.ts), for a bot to follow: the stage's OWN route (gen2.tower.route: its legs
 * in the order he meets them) with each turn's climb where its vine STANDS (gen2.tower.turns[k].x, never the leg's entry x: clearClimbs
 * moves a vine off the ledge's face). The inspector's route tracer (route.ts findRoute) cannot trace a tower, and a bot with no route
 * heads in a straight line from the spawn to the shrine: on a tower that line runs through every storey's floor, so he stood under
 * the storey above and dithered (1-4, INT-4, 11-13). The same order tools/engine/towerFly.ts flies: the turn's foot, its top, the
 * leg's entry, the leg's exit; after the last leg, a last turn (if laid) to the shrine's ledge, then the shrine. No stage id or x.
 */
export interface Pt { x: number; y: number }

/** px of height a plain hop takes him (the bots step or jump it; more is a climb) */
const HOP = 60;
type StageLike = { gen2?: unknown; exitTotemX?: number; exitTotemY?: number; vines?: ReadonlyArray<{ x: number; topY: number; bottomY: number; vineType?: string }> };

interface TowerMeta {
  plan: ReadonlyArray<{ join?: string }>;
  tower?: {
    route: { legs: ReadonlyArray<{ entry: Pt; exit: Pt }>; spawn: Pt };
    turns: ReadonlyArray<{ x: number; from: number; to: number }>;
  };
}

/** the corners of the way on, in order: null when the stage is not a tower */
export function towerCorners(stage: StageLike, spawn: Pt): Pt[] | null {
  const g = stage.gen2 as TowerMeta | undefined;
  const T = g?.tower;
  if (!g || !T || !T.route?.legs?.length) return null;
  const out: Pt[] = [{ x: spawn.x, y: spawn.y }];
  let ti = 0;
  // (from where he is to a turn's foot: across first at his own height, then the climb straight up or down the vine)
  const climb = (t: { x: number; from: number; to: number }) => {
    const at = out[out.length - 1];
    out.push({ x: t.x, y: at.y }, { x: t.x, y: t.from }, { x: t.x, y: t.to });
  };
  // (a leg that rises or drops inside its own section (a vine field, a climb between two ledges): across to the nearest vine that
  // leads on, up or down it, and on again, storey by storey, never the straight line from its entry to its exit, which cuts through
  // the floors between: at a field's top he read the way on as 300 px down and climbed back. Off vines count: a gate opens.)
  const vines = (stage.vines ?? []).filter((v) => v.vineType === 'tree_climb');
  const within = (a: Pt, b: Pt) => {
    let at = a;
    for (let n = 0; n < 12 && Math.abs(b.y - at.y) > HOP; n++) {
      const up = b.y < at.y, lo = Math.min(a.x, b.x) - 40, hi = Math.max(a.x, b.x) + 40;
      const leads = vines.filter((v) => v.x >= lo && v.x <= hi && (up ? v.bottomY >= at.y - HOP && v.topY < at.y - HOP : v.topY <= at.y + HOP && v.bottomY > at.y + HOP));
      if (!leads.length) break;
      const v = leads.reduce((m, q) => (Math.abs(q.x - at.x) < Math.abs(m.x - at.x) ? q : m));
      const end = up ? Math.max(v.topY, b.y) : Math.min(v.bottomY, b.y);
      out.push({ x: v.x, y: at.y }, { x: v.x, y: end });
      at = { x: v.x, y: end };
    }
    out.push({ x: b.x, y: b.y });
  };
  T.route.legs.forEach((leg, k) => {
    if (g.plan[k]?.join === 'turn' && T.turns[ti]) climb(T.turns[ti++]);
    out.push({ x: leg.entry.x, y: leg.entry.y });
    within(leg.entry, leg.exit);
  });
  if (T.turns[ti]) climb(T.turns[ti]);
  if (stage.exitTotemX !== undefined) out.push({ x: stage.exitTotemX, y: stage.exitTotemY ?? out[out.length - 1].y });
  // (a corner on top of the one before it adds nothing)
  const c = out.filter((p, i) => i === 0 || Math.abs(p.x - out[i - 1].x) + Math.abs(p.y - out[i - 1].y) > 0.5);
  // (no going on past the climb and back along one floor: a leg's exit beyond the turn's vine (1-4's gate bough runs on past its way
  // up) made the way on point both ways at once over the bough, and he stood there turning: straight to the vine)
  for (let i = 1; i + 1 < c.length; ) {
    const a = c[i - 1], b = c[i], d = c[i + 1];
    const flat = Math.abs(b.y - a.y) <= HOP && Math.abs(d.y - b.y) <= HOP;
    if (flat && (b.x - a.x) * (d.x - b.x) < 0 && Math.min(a.x, b.x) <= d.x && d.x <= Math.max(a.x, b.x)) c.splice(i, 1);
    else i++;
  }
  return c;
}

/** the way on as points about `step` px apart along it (the spacing the bots' Progress reads, as sampleRoute gives a traced route) */
export function towerRoutePts(stage: StageLike, spawn: Pt, step = 24): Pt[] | null {
  const c = towerCorners(stage, spawn);
  if (!c) return null;
  const out: Pt[] = [];
  for (let i = 0; i + 1 < c.length; i++) {
    const a = c[i], b = c[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step));
    for (let j = 0; j < n; j++) out.push({ x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n });
  }
  out.push({ ...c[c.length - 1] });
  return out;
}
