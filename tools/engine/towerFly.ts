// A plain flyer for a stage laid as a tower (gen2/tower.ts, R-165.170): the REAL engine at 30 fps (src/game/realPlay.ts) and plain
// inputs only: walk the way the storey runs, jump at an edge (a second jump for a rise), hold up at a vine. No teleport, no rescue,
// nothing put back: if the lay is wrong (a vine that cannot be grabbed, a hop out of reach, a storey with no way on) it ends
// 'stuck' or 'time', and says where. It follows the stage's own route (gen2.tower.route), so it works for any tower, up or down.
import { RealPlay, withFixtureConfig, type Pad } from '../../src/game/realPlay.ts';
import type { LevelConfig, Platform, Vine } from '../../src/game/types.ts';
import type { Route } from '../../src/game/gen2/tower.ts';
import type { WorldKit } from '../../src/game/gen2/types.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { difficulty as getDifficulty, setDifficulty } from '../../src/game/difficulty.ts';

/**
 * A fixture tower in the REAL engine, built the way the game builds a listed stage: its row in the stage table and a one-seed proven
 * list planted for the call (listed.ts withTestStage, seedList.ts plantSeedList: the seed's own search result, packed and replayed,
 * as Play does), its config found by id (realPlay.ts withFixtureConfig). `fn` gets the engine with the stage loaded.
 */
export function withTowerSim<T>(cfg: LevelConfig, kit: WorldKit, seed: number, setting: 'normal' | 'easy', fn: (sim: RealPlay) => T): T {
  const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
  if (st.gen2.errors?.length) throw new Error(`withTowerSim: seed ${seed} does not build cleanly: ${st.gen2.errors[0]}`);
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  const was = getDifficulty();
  return withTestStage({ [cfg.id]: { kit: () => kit, seeds: [] } }, () => {
    const undo = plantSeedList(cfg.id, { dict, seeds: [seed], plans: [packed] });
    try {
      setDifficulty(setting);
      return withFixtureConfig(cfg, () => fn(new RealPlay(cfg.id, seed)));
    } finally {
      setDifficulty(was);
      undo();
    }
  });
}

export interface Flight {
  end: 'shrine' | 'time' | 'stuck';
  /** s of play */
  t: number;
  /** times he landed more than a hop under the leg he was on (a miss: he fell to a catch or the storey under) */
  falls: number;
  /** the legs he finished, of how many */
  legs: number;
  of: number;
  /** vines climbed */
  climbs: number;
  /** where it ended, when not at the shrine */
  at?: { x: number; y: number; leg: number; why: string };
  /** the s of play at which each leg was finished */
  legT: number[];
}

type TowerStage = { platforms: Platform[]; vines: Vine[]; exitTotemX: number; exitTotemY: number; gen2?: { tower?: { flow: 'up' | 'down' | 'legs'; legs?: Array<{ travel: 'right' | 'left' | 'up' | 'down'; i0: number; i1: number }>; route: Route; turns: Array<{ x: number; from: number; to: number }> }; plan: Array<{ join: string }> } };

/** fly `sim` (a RealPlay on a tower stage) from its spawn to its shrine; `cap`: s of play at most */
export function flyTower(sim: RealPlay, cap = 600): Flight {
  const st = sim.stage as unknown as TowerStage;
  const T = st.gen2?.tower;
  if (!T) throw new Error('flyTower: not a tower (no gen2.tower)');
  const e = sim.e as { exitTotemReached?: boolean };
  const legs = T.route.legs;
  const plan = st.gen2!.plan;
  // (which way the section he is on is laid: the tower's own flow, or on a stage of legs its leg's travel, R-165.196)
  const travelOf = (i: number): 'right' | 'left' | 'up' | 'down' => (T.flow !== 'legs' ? T.flow : T.legs?.find((g) => i >= g.i0 && i < g.i1)?.travel ?? T.legs?.[T.legs.length - 1]?.travel ?? 'right');
  // (the turn into leg k: the k-th 'turn' of the plan is the k-th turn laid; one more turn leads to the shrine's ledge. On a stage of
  // legs a column's way out is a turn of its own, in no plan slot: the turn is found where he stands, the vine that leaves his
  // height toward the height he is going to)
  const turnOf = new Map<number, { x: number; from: number; to: number }>();
  let ti = 0;
  if (T.flow !== 'legs') plan.forEach((s, k) => { if (s.join === 'turn') turnOf.set(k, T.turns[ti++]); });
  const last = T.flow !== 'legs' ? T.turns[ti] : undefined;
  const turnFrom = (from: { x: number; y: number }, toY: number) => T.turns.filter((t) => Math.abs(t.from - from.y) <= 20 && Math.sign(t.to - t.from) === Math.sign(toY - from.y) && Math.abs(toY - from.y) > 14).sort((a, b) => Math.abs(a.x - from.x) - Math.abs(b.x - from.x))[0];
  if (T.flow === 'legs') {
    legs.forEach((g, i) => { const t = turnFrom(i ? legs[i - 1].exit : T.route.spawn, g.entry.y); if (t) turnOf.set(i, t); });
    const t = legs.length ? turnFrom(legs[legs.length - 1].exit, st.exitTotemY) : undefined;
    if (t) turnOf.set(legs.length, t);
  }
  const out: Flight = { end: 'time', t: 0, falls: 0, legs: 0, of: legs.length, climbs: 0, legT: [] };
  let k = 0;
  /** in leg k (true) or still on the way to its entry (false) */
  let inLeg = !turnOf.has(0);
  let air: { land?: Platform; dbl: boolean; dir: 1 | -1; used: boolean } | null = null;
  let wasClimbing = false, wasGrounded = true;
  let lastMove = 0, lastX = sim.p.x, lastY = sim.p.y;
  const under = () => sim.platforms.find((q) => q.id === sim.standingOn);
  const start = sim.t;
  const vineAt = (x: number, y: number, want: 'up' | 'down') => sim.vines.find((v) => v.vineType === 'tree_climb' && Math.abs(v.x - x) <= 18 && (want === 'up' ? v.bottomY >= y - 60 && v.topY < y - 60 : v.topY <= y + 60 && v.bottomY > y + 60));
  while (sim.t - start < cap) {
    const p = sim.p;
    const pad: Pad = {};
    const P = p.grounded ? under() : undefined;
    // where he is going: the turn's vine, then the leg's exit, then the totem
    const leg = legs[k];
    const travel = travelOf(Math.min(k, legs.length - 1));
    const up = travel === 'up';
    const turn = k < legs.length ? turnOf.get(k) : last ?? turnOf.get(k);
    const goal = k >= legs.length ? (inLeg || !turn ? { x: st.exitTotemX, y: st.exitTotemY } : { x: turn.x, y: turn.to }) : inLeg || !turn ? leg.exit : { x: turn.x, y: turn.to };
    const dir: 1 | -1 = goal.x >= p.x ? 1 : -1;
    if (p.climbing) {
      // on a vine: straight up (or down) always climbs; he steps off at its end by himself
      if (goal.y < p.y - 4 || !up) pad[goal.y < p.y - 4 ? 'up' : 'down'] = true; else pad.up = true;
      air = null;
    } else if (!p.grounded) {
      // in the air: carry on the way he jumped until he is over his landing; a second jump at the top for a rise
      if (air) {
        if (air.dbl && !air.used && p.vy >= -40) { pad.press = true; air.used = true; }
        // (the jump is held only while he rises: held on the way down it opens the leaf, and a glide is no plain jump)
        if (p.vy < 0) pad.jump = true;
        const L = air.land;
        const over = L ? (air.dir > 0 ? p.x > L.x + 36 : p.x < L.x + L.width - 36) : false;
        if (!over) pad[air.dir > 0 ? 'right' : 'left'] = true;
        else if (L && (air.dir > 0 ? p.x > L.x + L.width - 30 : p.x < L.x + 30)) pad[air.dir > 0 ? 'left' : 'right'] = true;
      } else {
        // (off a vine's end: onto the storey it led to, a step in along the way it runs; else on toward where he is going)
        const into = !inLeg && Math.abs(goal.y - p.y) <= 120 ? (k < legs.length ? leg.entry.x + Math.sign(leg.exit.x - leg.entry.x) * 40 : st.exitTotemX) : goal.x;
        if (Math.abs(into - p.x) > 6) pad[into > p.x ? 'right' : 'left'] = true;
      }
      // (a vine in reach on the way up: grab it)
      if (Math.abs(goal.y - p.y) > 120 && vineAt(p.x, p.y, T.flow === 'legs' ? (goal.y < p.y ? 'up' : 'down') : up ? 'up' : 'down')) pad[T.flow === 'legs' ? (goal.y < p.y ? 'up' : 'down') : up ? 'up' : 'down'] = true;
    } else {
      air = null;
      // arrived? (a leg's exit, or after a turn its entry)
      // (the goal has changed: read it again before he moves)
      if (k < legs.length && !inLeg && Math.abs(p.y - leg.entry.y) <= 14) { inLeg = true; continue; }
      if (k >= legs.length && !inLeg && turn && Math.abs(p.y - turn.to) <= 14) { inLeg = true; continue; }
      if (k < legs.length && inLeg && Math.abs(p.y - leg.exit.y) <= 14 && Math.abs(p.x - leg.exit.x) <= 40) {
        out.legT.push(+(sim.t - start).toFixed(1));
        k++;
        out.legs = k;
        inLeg = !(k < legs.length ? turnOf.has(k) : last ?? turnOf.get(k));
        continue;
      }
      const wantVine = Math.abs(goal.y - p.y) > 120 ? vineAt(p.x, p.y, goal.y < p.y ? 'up' : 'down') : undefined;
      if (wantVine) {
        // a vine that leads on: straight up (or down) grabs it
        pad[goal.y < p.y ? 'up' : 'down'] = true;
        if (Math.abs(wantVine.x - p.x) > 4) pad[wantVine.x > p.x ? 'right' : 'left'] = true;
      } else if (Math.abs(goal.x - p.x) > 6) {
        pad[dir > 0 ? 'right' : 'left'] = true;
        // (a vine ahead on this ledge that leads on: hold the way it goes while he walks into it)
        const ahead = sim.vines.find((v) => v.vineType === 'tree_climb' && (v.x - p.x) * dir >= 0 && Math.abs(v.x - p.x) <= 40 && Math.abs(goal.y - p.y) > 120 && (goal.y < p.y ? v.bottomY >= p.y - 60 && v.topY < p.y - 60 : v.topY <= p.y + 60 && v.bottomY > p.y + 60));
        // (a vine that leads DOWN hangs past the ledge's tip: he walks off toward it and takes it in the air; held on the ground,
        // down stops him short of it)
        if (ahead && goal.y < p.y) pad.up = true;
        // an edge ahead with no ground on: jump for the next piece on the way
        if (P) {
          const edge = dir > 0 ? P.x + P.width : P.x;
          const on = sim.platforms.some((q) => q !== P && Math.abs(q.y - P.y) <= 3 && (dir > 0 ? q.x <= edge + 6 && q.x + q.width > edge + 6 : q.x + q.width >= edge - 6 && q.x < edge - 6));
          const goalOnP = Math.abs(goal.y - P.y) <= 14 && goal.x >= P.x - 2 && goal.x <= P.x + P.width + 2;
          if (!on && !goalOnP && !ahead && (edge - p.x) * dir <= 16) {
            // (the nearest piece ahead that is not lower, else the nearest lower one: a hop's landing before its catch)
            const cands = sim.platforms.filter((q) => q !== P && (dir > 0 ? q.x >= edge - 2 : q.x + q.width <= edge + 2) && q.y >= P.y - 190 && q.y <= P.y + 320 && (dir > 0 ? q.x - edge : edge - q.x - q.width) <= 330);
            const near = (q: Platform) => (dir > 0 ? q.x - edge : edge - q.x - q.width);
            // (a run leg: the next piece of the road, never the floor of the pit under it)
            const land = (up ? cands.filter((q) => q.y <= P.y + 3) : travel === 'down' ? (T.flow === 'legs' && cands.some((q) => Math.abs(q.y - P.y) <= 30) ? cands.filter((q) => Math.abs(q.y - P.y) <= 30) : cands.filter((q) => q.y >= P.y - 3)) : cands.filter((q) => q.y <= P.y + 70)).sort((a, b) => near(a) - near(b))[0] ?? cands.sort((a, b) => near(a) - near(b))[0];
            if (land && !(land.y > P.y + 30 && near(land) < 40)) {
              pad.press = true;
              air = { land, dbl: P.y - land.y > 80 || near(land) > 150, dir, used: false };
            } else air = { land, dbl: false, dir, used: true };
          }
        }
      }
      // (a run leg: a face in his way, a pit's step or a bank's side: a plain hop, held)
      if (T.flow === 'legs' && !up && travel !== 'down' && (pad.left || pad.right) && !pad.up && !pad.down && sim.t - lastMove > 0.25 && !air) { pad.press = true; air = { dbl: false, dir, used: false }; }
      // a fall: he stands more than a hop under the leg he was on
      if (!wasGrounded && !wasClimbing && k < legs.length && inLeg && (up ? p.y > Math.max(leg.entry.y, leg.exit.y) + 100 : false)) {
        out.falls++;
        // (he walks back onto the way: the last leg at or under where he stands now)
        let j = k;
        while (j > 0 && Math.min(legs[j].entry.y, legs[j].exit.y) < p.y - 14) j--;
        k = j;
        inLeg = Math.abs(p.y - legs[j].entry.y) <= 14 || Math.abs(p.y - legs[j].exit.y) <= 14 || (p.y <= Math.max(legs[j].entry.y, legs[j].exit.y) + 100 && p.y >= Math.min(legs[j].entry.y, legs[j].exit.y) - 14);
        if (!inLeg) { k = j + 1; inLeg = false; }
      }
    }
    wasClimbing = p.climbing;
    wasGrounded = p.grounded;
    const climbingBefore = p.climbing;
    sim.frame(pad);
    if (!climbingBefore && sim.p.climbing) out.climbs++;
    if (e.exitTotemReached) { out.end = 'shrine'; break; }
    if (Math.abs(sim.p.x - lastX) > 2 || Math.abs(sim.p.y - lastY) > 2) { lastMove = sim.t; lastX = sim.p.x; lastY = sim.p.y; }
    if (sim.t - lastMove > 6) {
      out.end = 'stuck';
      out.at = { x: Math.round(sim.p.x), y: Math.round(sim.p.y), leg: k, why: `no move for 6 s on the way to x ${Math.round(goal.x)}, y ${Math.round(goal.y)}${sim.p.grounded ? '' : ' (in the air)'}` };
      break;
    }
  }
  out.t = +(sim.t - start).toFixed(1);
  if (out.end === 'time') out.at = { x: Math.round(sim.p.x), y: Math.round(sim.p.y), leg: k, why: `${cap} s of play` };
  return out;
}
