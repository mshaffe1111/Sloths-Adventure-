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
type StageLike = {
  gen2?: unknown; exitTotemX?: number; exitTotemY?: number; vines?: ReadonlyArray<{ x: number; topY: number; bottomY: number; vineType?: string }>;
  platforms?: ReadonlyArray<{ x: number; y: number; width: number; type?: string }>;
};

interface TowerMeta {
  plan: ReadonlyArray<{ join?: string }>;
  tower?: {
    flow?: string;
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
  /** a way down: the wood the way dropped to past a turn's storey (climb): a leg whose storey lies over it is passed, never climbed
   *  back to (seed 1's last catches: the way pointed 132 px up to the storey he had dropped past, and he turned on the catch, ENG-DOWNBOT) */
  let past: number | undefined;
  // (from where he is to a turn's foot: across first at his own height, then the climb straight up or down the vine)
  const climb = (t: { x: number; from: number; to: number }, toward?: Pt) => {
    const at = out[out.length - 1];
    // (a way DOWN: the turn's vine top stands just past his ledge's end, so the way on from there is straight down it: a point at the
    //  vine level with the ledge read as a gap to jump, and he jumped past the vine and fell two storeys, ENG-W3a's drafted 3-1)
    if (T!.flow === 'down' && t.to > t.from) {
      // (first along the wood he stands on to its end by the vine, when the lay ran it on past the leg's exit: a slant from the exit
      //  to the vine's foot runs under that wood, and he stood over it, 'the way on is 105 px down', ENG-DOWNBOT)
      const run = runOf(at);
      if (run && (t.x < run[0] || t.x > run[1])) out.push({ x: t.x < run[0] ? run[0] + 8 : run[1] - 8, y: at.y });
      // (the vine's top stands ON that wood (a storey wall to wall, its way down a vine from its floor): across to it at his own height
      //  first; a slant from the leg's exit ran through the floor to the vine's foot and every bot stood under it, 'in a dip 174 px deep,
      //  the way on is 90 px down', the drafted way down's top 'rest' cause, ENG-DOWNBOT)
      else if (run && Math.abs(t.x - at.x) > 8) out.push({ x: t.x, y: at.y });
      // (a vine that stops on a catch over the storey on (gen2 tower.ts stopVines, the lead's ruling (b)): down it onto the catch, then
      //  off the catch's end toward where the way goes on (the leg's exit), down to the storey; straight on down the vine's old line
      //  ran through the catch, and every bot stood on it turning, 'the way on is 84 px down', ENG-DOWNBOT)
      const v = vines.find((q) => Math.abs(q.x - t.x) <= 2 && Math.abs(q.topY - t.from) <= 6);
      if (v && v.bottomY < t.to - HOP) {
        out.push({ x: t.x, y: v.bottomY });
        const land = dropTo({ x: t.x, y: v.bottomY }, { x: toward?.x ?? t.x, y: t.to });
        // (off the catch he can land PAST the turn's storey (the catch lies over all of it): the way goes on from where he lands)
        if (land.y > t.to + HOP) past = land.y;
      } else out.push({ x: t.x, y: t.to });
    } else out.push({ x: t.x, y: at.y }, { x: t.x, y: t.from }, { x: t.x, y: t.to });
  };
  // (a leg that rises or drops inside its own section (a vine field, a climb between two ledges): across to the nearest vine that
  // leads on, up or down it, and on again, storey by storey, never the straight line from its entry to its exit, which cuts through
  // the floors between: at a field's top he read the way on as 300 px down and climbed back. Off vines count: a gate opens.)
  const vines = (stage.vines ?? []).filter((v) => v.vineType === 'tree_climb');
  // (a way DOWN drops: where no vine leads down, he walks off the end of the wood he stands on toward where the way goes on and falls
  // onto the wood under it, ledge after ledge, never the straight line from the leg's entry to its exit, which hangs in the air over
  // the ledges between (ENG-W3a's drafted 3-1: 'the way on is 404 px up' once he had dropped under the line). Every drop lands in view,
  // gen2's towerFalls; a climb never comes here)
  const down = T.flow === 'down';
  const wood = (stage.platforms ?? []).filter((p) => p.type !== 'fragile' && p.type !== 'bouncy');
  /** the run of wood he walks along at his height (its x ends), or null when he stands on none */
  const runOf = (at: Pt): [number, number] | null => {
    const on = wood.filter((p) => at.x >= p.x - 2 && at.x <= p.x + p.width + 2 && Math.abs(p.y - at.y) <= 4);
    if (!on.length) return null;
    let lo = Math.min(...on.map((p) => p.x)), hi = Math.max(...on.map((p) => p.x + p.width));
    for (let grew = true; grew; ) {
      grew = false;
      for (const p of wood) if (Math.abs(p.y - at.y) <= 4 && p.x <= hi + 2 && p.x + p.width >= lo - 2 && (p.x < lo || p.x + p.width > hi)) { lo = Math.min(lo, p.x); hi = Math.max(hi, p.x + p.width); grew = true; }
    }
    return [lo, hi];
  };
  const dropTo = (a: Pt, b: Pt): Pt => {
    let at = a;
    for (let n = 0; n < 12 && b.y - at.y > HOP; n++) {
      // (the run of wood he walks along at this height, to its end the way on lies)
      const run = runOf(at);
      if (!run) break;
      const [lo, hi] = run;
      // (the end toward where the way goes on first; when nothing lies under it (the wood runs on into the wall), the other end: the
      //  last catch of a way down ran on into the wall by the shrine, the way slanted through it, and he was stranded on it, ENG-DOWNBOT)
      const toward = b.x < at.x ? -1 : 1;
      const offAt = (d: number) => (d < 0 ? lo - 30 : hi + 30);
      const underAt = (d: number) => wood.filter((p) => offAt(d) >= p.x && offAt(d) <= p.x + p.width && p.y > at.y + 4).sort((p, q) => p.y - q.y)[0];
      const dir = underAt(toward) ? toward : -toward;
      const off = offAt(dir), under = underAt(dir);
      if (!under) break;
      // (to the end of the wood, then down to where he lands past it: a point in the air level with the wood read as a gap to jump,
      // and he jumped it onto the catch beyond, ENG-W3a)
      out.push({ x: dir < 0 ? lo + 8 : hi - 8, y: at.y }, { x: off, y: under.y });
      at = { x: off, y: under.y };
    }
    return at;
  };
  const within = (a: Pt, b: Pt) => {
    let at = a;
    for (let n = 0; n < 12 && Math.abs(b.y - at.y) > HOP; n++) {
      const up = b.y < at.y, lo = Math.min(a.x, b.x) - 40, hi = Math.max(a.x, b.x) + 40;
      const inX = vines.filter((v) => v.x >= lo && v.x <= hi);
      const leads = inX.filter((v) => (up ? v.bottomY >= at.y - HOP && v.topY < at.y - HOP : v.topY <= at.y + HOP && v.bottomY > at.y + HOP));
      // (none from his height: the leg first rises by hops (steps, a stair of ledges) to the foot of the nearest vine that leads on;
      // he goes for that foot, then up. 1-4's top section: three 60 px steps, then the field)
      const foot = (v: (typeof vines)[number]) => (up ? v.bottomY : v.topY);
      const next = leads.length ? leads : inX.filter((v) => (up ? v.topY < at.y - HOP && v.bottomY < at.y && v.bottomY > b.y : v.bottomY > at.y + HOP && v.topY > at.y && v.topY < b.y));
      if (!next.length) { if (!up && down) at = dropTo(at, b); break; }
      const v = next.reduce((m, q) => {
        const dq = Math.abs(foot(q) - at.y), dm = Math.abs(foot(m) - at.y);
        return dq < dm - 1 || (Math.abs(dq - dm) <= 1 && Math.abs(q.x - at.x) < Math.abs(m.x - at.x)) ? q : m;
      });
      const end = up ? Math.max(v.topY, b.y) : Math.min(v.bottomY, b.y);
      // (a vine that leads on from his height but stands on a floor below it (a fork: down, then up): down the way to its foot, then up;
      // a route that stays at his height floats in the air over that floor, and from the floor the way on never reads as up: FIX-14.
      // Straight from where he is to the foot (the stair down), never across at his height first: that still hung in the air)
      const sunk = up && leads.length && v.bottomY > at.y + HOP;
      out.push(sunk ? { x: v.x, y: v.bottomY } : { x: v.x, y: leads.length ? at.y : foot(v) }, { x: v.x, y: end });
      at = { x: v.x, y: end };
    }
    out.push({ x: b.x, y: b.y });
  };
  T.route.legs.forEach((leg, k) => {
    if (g.plan[k]?.join === 'turn' && T.turns[ti]) climb(T.turns[ti++], leg.exit);
    if (past !== undefined && Math.max(leg.entry.y, leg.exit.y) < past - HOP) return;
    past = undefined;
    out.push({ x: leg.entry.x, y: leg.entry.y });
    within(leg.entry, leg.exit);
  });
  if (T.turns[ti]) climb(T.turns[ti], stage.exitTotemX !== undefined ? { x: stage.exitTotemX, y: stage.exitTotemY ?? T.turns[ti].to } : undefined);
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
