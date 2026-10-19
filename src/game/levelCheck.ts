/**
 * Level validator: proves a generated stage can be finished.
 *
 * It builds a graph of everything the player can stand on or hang from (platforms,
 * climbing vines, swinging lianas) and connects two nodes only if the real movement
 * rules (physics.ts, shared with the engine) allow the move with a safety margin.
 * Then it walks the graph from the spawn point and checks the exit, the checkpoints,
 * and the quota items are all reachable.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform, Vine } from './types.ts';
import { HANG_DROP, ROPE_OVERLAP, ropeYAt } from './rope.ts';
import { skillGuaranteedAt } from './skills.ts';
import { idleTime } from './zones.ts';
import {
  PHYS,
  SAFE,
  SIM_DTS,
  LAND_HALF,
  TAKEOFF_SLACK,
  airStep,
  canGrabSwing,
  reachBounce,
  reachJump,
  reachMin,
  swingGrab,
  swingStep,
  tarzanLaunch,
  type AirBody,
} from './physics.ts';

export interface CheckResult {
  ok: boolean;
  errors: string[];
  stats: {
    platforms: number;
    reachablePlatforms: number;
    vines: number;
    maxGapUsed: number;
    swingEdges: number;
    climbEdges: number;
  };
}

/** Fraction of the simulated maximum reach the validator still accepts. */
const MARGIN = 0.97;

const ext = (p: Platform): [number, number] =>
  p.type === 'moving'
    ? [(p.baseX ?? p.x) - (p.moveRange ?? 0), (p.baseX ?? p.x) + (p.moveRange ?? 0) + p.width]
    : p.type === 'drift' && p.drift
      ? [p.drift.x0, p.drift.x1] // a log is somewhere across its river; the generator keeps them evenly spaced (checked below)
      : [p.x, p.x + p.width];

const dxTo = (x0: number, x1: number, x: number) => (x < x0 ? x0 - x : x > x1 ? x - x1 : 0);

/** Can the player get from platform a to platform b with jumps (and a double jump)? */
export function jumpOK(a: Platform, b: Platform, allowDouble = true): { ok: boolean; gap: number } {
  const [ax0, ax1] = ext(a);
  const [bx0, bx1] = ext(b);
  const gap = Math.max(0, bx0 - ax1, ax0 - bx1);
  const dy = a.y - b.y;
  const f = a.type === 'bouncy' ? reachBounce : reachJump;
  const r = allowDouble ? Math.max(f(dy, false), f(dy, true)) : f(dy, false);
  return { ok: r >= 0 && gap <= r * MARGIN - TAKEOFF_SLACK, gap };
}

// ---- Swinging --------------------------------------------------------------

/**
 * Simulates running jumps off `a` into a liana, swinging, and letting go.
 * Returns, per landing platform id, how robust the move is (number of distinct
 * takeoff/steer lines that have a release window of at least 6 frames).
 */
export function swingLandings(
  a: Platform,
  v: Vine,
  dir: 1 | -1,
  platforms: Platform[],
  waterY: number
): Map<number, number> {
  const out = new Map<number, number>();
  const dt = SIM_DTS[0];
  const edge = dir === 1 ? a.x + a.width : a.x;
  const solids = platforms.filter((p) => !p.broken && p.type !== 'moving' && p.type !== 'drift');

  for (let s = 0; s <= 90; s += 15) {
    const b: AirBody = { x: edge - dir * s, y: a.y, vx: dir * PHYS.maxRun, vy: -PHYS.jumpV };
    let grabbed = false;
    for (let i = 0; i < 90 && !grabbed; i++) {
      airStep(b, dt, dir, false);
      if (b.y > waterY + 40) break;
      if (canGrabSwing(b.x, b.y, v) && Math.abs(b.vx) > 25) grabbed = true;
    }
    if (!grabbed) continue;

    for (const steer of [0, dir] as const) {
      const sw = swingGrab(b, v);
      const hits: Array<number | null> = [];
      for (let f = 0; f < 100; f++) {
        const pos = swingStep(sw, v, dt, steer);
        // release now: Tarzan leap toward the far side
        const l = tarzanLaunch(pos.vx, pos.vy, dir);
        const fb: AirBody = { x: pos.x, y: pos.y, vx: l.vx, vy: l.vy };
        let landed: number | null = null;
        for (let k = 0; k < 120 && landed === null; k++) {
          const prev = fb.y;
          airStep(fb, dt, dir, false);
          if (fb.y > waterY + 20) break;
          if (fb.vy >= 0) {
            for (const p of solids) {
              if (fb.x >= p.x - LAND_HALF && fb.x <= p.x + p.width + LAND_HALF && prev <= p.y + 14 && fb.y >= p.y) {
                landed = p.id;
                break;
              }
            }
          }
        }
        hits.push(landed);
      }
      // longest run of consecutive frames landing on the same platform
      let runId: number | null = null;
      let run = 0;
      const best = new Map<number, number>();
      for (const h of [...hits, null]) {
        if (h !== null && h === runId) run++;
        else {
          if (runId !== null) best.set(runId, Math.max(best.get(runId) ?? 0, run));
          runId = h;
          run = h === null ? 0 : 1;
        }
      }
      for (const [id, r] of best) if (r >= 6) out.set(id, (out.get(id) ?? 0) + 1);
    }
  }
  return out;
}

// ---- Graph -----------------------------------------------------------------

export function validateStage(stage: GeneratedStage): CheckResult {
  const errors: string[] = [];
  const cfg = stage.config;
  const plats = stage.platforms.filter((p) => !p.broken);
  const waterY = stage.waterY ?? cfg.levelHeight + 100;
  let maxGapUsed = 0;
  let swingEdges = 0;
  let climbEdges = 0;
  const usedSwing = new Set<number>();

  const adj = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  const pid = (p: Platform) => `p${p.id}`;
  const vid = (v: Vine) => `v${v.id}`;

  // a double jump is a tool the player may need from mission 6 on; before that every gap is a plain jump
  const allowDouble = (cfg.worldIndex - 1) * 10 + cfg.miniIndex >= 6;
  const byX = [...plats].sort((a, b) => ext(a)[0] - ext(b)[0]);

  // 1. jumps between platforms (only compare neighbours within a plausible horizontal window)
  for (let i = 0; i < byX.length; i++) {
    const a = byX[i];
    const [, ax1] = ext(a);
    for (let j = 0; j < byX.length; j++) {
      if (i === j) continue;
      const b = byX[j];
      const [bx0] = ext(b);
      if (bx0 > ax1 + 460) {
        if (j > i) break;
        continue;
      }
      const r = jumpOK(a, b, allowDouble);
      if (r.ok) {
        link(pid(a), pid(b));
        if (a.type !== 'bouncy') maxGapUsed = Math.max(maxGapUsed, r.gap);
      }
    }
  }

  // 2. climbing vines
  for (const v of stage.vines) {
    if (v.vineType === 'swing_liana') continue;
    const n = vid(v);
    // entering: stand next to the trunk and press up
    for (const p of plats) {
      const [x0, x1] = ext(p);
      if (p.type !== 'bouncy' && p.y >= v.topY - 12 && p.y <= v.bottomY + 25 && dxTo(x0, x1, v.x) < 42) link(pid(p), n);
    }
    // leaving
    for (const p of plats) {
      const [x0, x1] = ext(p);
      const gx = dxTo(x0, x1, v.x);
      let ok = false;
      // vault off the top
      if (p.y >= v.topY - 22 && p.y <= v.topY + 90) {
        const dy = v.topY - 12 - p.y;
        const r = reachMin(dy, 190, 160, false);
        if (r >= 0 && gx <= r * MARGIN) ok = true;
      }
      // hop sideways / leap off at any height
      if (!ok) {
        for (let h = v.topY; h <= v.bottomY && !ok; h += 12) {
          const dy = h - p.y;
          const hop = reachMin(dy, PHYS.treeHopV, 240, true);
          const leap = reachMin(dy, PHYS.treeLeapV, 330, true);
          const r = Math.max(hop, leap);
          if (r >= 0 && gx <= r * MARGIN) ok = true;
        }
      }
      if (ok) {
        link(n, pid(p));
        climbEdges++;
      }
    }
  }

  // 3. swinging lianas
  for (const v of stage.vines) {
    if (v.vineType !== 'swing_liana') continue;
    for (const a of plats) {
      if (a.type === 'moving' || a.type === 'drift' || a.type === 'bouncy') continue;
      const dirs: Array<1 | -1> = [];
      if (a.x + a.width <= v.x + 40 && v.x - (a.x + a.width) < 520) dirs.push(1);
      if (a.x >= v.x - 40 && a.x - v.x < 520) dirs.push(-1);
      for (const dir of dirs) {
        const res = swingLandings(a, v, dir, plats, waterY);
        for (const [id, lines] of res) {
          if (lines >= 6 && id !== a.id) {
            link(`p${a.id}`, `p${id}`);
            usedSwing.add(v.id);
            swingEdges++;
          }
        }
      }
    }
  }

  // 3b. shimmy ropes: a rope joins the two ledges it hangs over, but only counts where EVERY player has the skill (a stage
  // entered before that may have ropes as extras, and must be finishable without them)
  const mission = (cfg.worldIndex - 1) * 10 + cfg.miniIndex;
  const ropesCount = skillGuaranteedAt('shimmy', mission);
  for (const r of stage.ropes ?? []) {
    if (r.required && !ropesCount) errors.push(`rope #${r.id} is needed here, but the player may not have learned the skill yet`);
    if (!ropesCount) continue;
    const gapStart = r.x0 + ROPE_OVERLAP;
    const gapEnd = r.x1 - ROPE_OVERLAP;
    const left = plats.filter((p) => Math.abs(p.y - r.g0) < 3 && Math.abs(ext(p)[1] - gapStart) < 8);
    const right = plats.filter((p) => Math.abs(p.y - r.g1) < 3 && Math.abs(ext(p)[0] - gapEnd) < 8);
    if (!left.length || !right.length) {
      errors.push(`rope #${r.id} does not join two ledges`);
      continue;
    }
    for (const a of left) for (const b of right) {
      link(pid(a), pid(b));
      link(pid(b), pid(a));
    }
  }

  // 4. walk the graph
  const start = plats.find((p) => stage.spawnX >= ext(p)[0] - 4 && stage.spawnX <= ext(p)[1] + 4 && Math.abs(p.y - stage.spawnY) < 6);
  if (!start) {
    errors.push('no platform under the spawn point');
    return finish();
  }
  const seen = new Set<string>([pid(start)]);
  const q = [pid(start)];
  while (q.length) {
    const n = q.pop()!;
    for (const m of adj.get(n) ?? []) {
      if (!seen.has(m)) {
        seen.add(m);
        q.push(m);
      }
    }
  }
  const reach = (p: Platform) => seen.has(pid(p));
  const reachPlats = plats.filter(reach);

  // exit
  const exitP = plats.find((p) => stage.exitTotemX >= ext(p)[0] && stage.exitTotemX <= ext(p)[1] && Math.abs(p.y - stage.exitTotemY) < 6);
  if (!exitP) errors.push('no platform under the exit totem');
  else if (!reach(exitP)) errors.push(`exit platform ${exitP.id} is not reachable`);

  // checkpoints
  let lastX = -1;
  for (const cp of stage.checkpoints ?? []) {
    const p = plats.find((q2) => cp.x >= ext(q2)[0] && cp.x <= ext(q2)[1] && Math.abs(q2.y - cp.y) < 6);
    if (!p || !reach(p)) errors.push(`checkpoint at x=${Math.round(cp.x)} is not on a reachable platform`);
    if (cfg.objectiveType !== 'ascent' && cp.x <= lastX) errors.push('checkpoints are out of order');
    lastX = cp.x;
  }

  // items must be near something reachable
  const nearReachable = (x: number, y: number) => {
    for (const p of reachPlats) {
      const [x0, x1] = ext(p);
      if (dxTo(x0, x1, x) <= 150 && p.y - y >= -14 && p.y - y <= 190) return true;
    }
    for (const v of stage.vines) {
      if (seen.has(vid(v)) && Math.abs(x - v.x) < 70 && y >= v.topY - 40 && y <= v.bottomY) return true;
      if (usedSwing.has(v.id) && Math.abs(x - v.x) < 190 && y >= v.topY - 40 && y <= v.bottomY + 20) return true;
    }
    // pickups hanging under a rope (reached by shimmying along it)
    for (const r of stage.ropes ?? []) {
      if (x >= r.x0 && x <= r.x1 && y >= ropeYAt(r, x) + 10 && y <= ropeYAt(r, x) + HANG_DROP + 4) return true;
    }
    return false;
  };
  for (const c of stage.collectibles) {
    if (c.type === 'exit_totem') continue;
    if (!nearReachable(c.x, c.y)) errors.push(`${c.type} #${c.id} at (${Math.round(c.x)}, ${Math.round(c.y)}) is out of reach`);
  }

  // quota
  const count = (f: (t: string) => boolean) => stage.collectibles.filter((c) => f(c.type)).length;
  const need = cfg.targetCount;
  if (cfg.objectiveType === 'harvest' && count((t) => t === 'flower' || t === 'leaf') < need) errors.push('not enough flowers/leaves for the quota');
  if (cfg.objectiveType === 'rescue' && count((t) => t === 'cage') < need) errors.push('not enough cages for the quota');
  if (cfg.objectiveType === 'relic_hunt' && count((t) => t === 'relic') < need) errors.push('not enough relics for the quota');
  if (cfg.objectiveType === 'purge' || cfg.objectiveType === 'gauntlet') {
    if (stage.enemies.length < need) errors.push('not enough enemies for the quota');
  }

  // fairness: nothing hostile right on top of the player when they spawn or respawn
  // (each flag is compared at its own height: in a climb the flags are far above the spawn, so judging every enemy against
  // the spawn's height let an eagle sit right over a flag)
  const safeSpots = [{ x: stage.spawnX, y: stage.spawnY }, ...(stage.checkpoints ?? [])];
  for (const e of stage.enemies) {
    for (const s of safeSpots) {
      if (Math.abs(e.x - s.x) < 170 && Math.abs(e.y - s.y) < 400) {
        errors.push(`enemy #${e.id} stands too close to a safe spot at x=${Math.round(s.x)}`);
      }
    }
  }

  // rivers: the logs must be spaced so a hop between neighbours is easy, and a bank must stand at each end of the water
  for (const r of stage.rivers ?? []) {
    const logs = plats.filter((p) => p.type === 'drift' && p.drift && p.drift.x0 === r.x0 && p.drift.x1 === r.x1);
    if (logs.length < 2) errors.push(`river at x=${Math.round(r.x0)} has fewer than two logs`);
    else {
      const d = logs[0].drift!;
      const spacing = ((d.x1 - d.x0 + d.width) / logs.length);
      const gap = spacing - d.width;
      const limit = d.dir === 1 ? 80 : 130;
      if (gap < 60) errors.push(`river at x=${Math.round(r.x0)}: logs overlap or nearly touch`);
      if (gap > limit) errors.push(`river at x=${Math.round(r.x0)}: ${Math.round(gap)}px between logs is too far to hop`);
    }
    const near = plats.some((p) => p.type === 'solid' && p.x + p.width >= r.x0 - 2 && p.x + p.width <= r.x0 + 2);
    const far = plats.some((p) => p.type === 'solid' && p.x >= r.x1 - 2 && p.x <= r.x1 + 2);
    if (!near || !far) errors.push(`river at x=${Math.round(r.x0)} has no bank at one end`);
  }

  // zones (Worlds 3 and 4): a rhythm that can always be waited out, a hop that is possible in either state, nothing hostile or
  // risky standing inside one
  for (const z of stage.zones ?? []) {
    const at = `${z.kind} zone at x=${Math.round(z.x0)}`;
    const idle = idleTime(z);
    if (idle < 2.0) errors.push(`${at}: only ${idle.toFixed(1)}s quiet between bursts (needs 2s to be waitable)`);
    if (z.warn < 0.9) errors.push(`${at}: warning of ${z.warn}s is too short`);
    if (z.active > 3.0) errors.push(`${at}: stays active ${z.active}s, longer than a player should have to wait`);
    if (z.kind === 'wind' && z.force > 160) errors.push(`${at}: gust of ${z.force} px/s is too strong`);
    for (const e of stage.enemies) {
      if (e.x > z.x0 - 30 && e.x < z.x1 + 30 && e.y > z.top && e.y < z.bottom + 60) errors.push(`enemy #${e.id} stands inside the ${at}`);
    }
    for (const c of stage.checkpoints ?? []) {
      if (c.x > z.x0 && c.x < z.x1 && c.y > z.top && c.y < z.bottom) errors.push(`a checkpoint flag stands inside the ${at}`);
    }
    // every gap the zone covers: a plain jump must cross it, and a headwind must still leave the double jump a way over
    const under = plats
      .filter((p) => p.type === 'solid' && p.x < z.x1 && p.x + p.width > z.x0 && p.y > z.top && p.y < z.bottom + 20)
      .sort((a, b) => a.x - b.x);
    for (let i = 1; i < under.length; i++) {
      const gap = under[i].x - (under[i - 1].x + under[i - 1].width);
      if (gap <= 24) continue;
      if (gap > SAFE.gap1) errors.push(`${at}: a ${Math.round(gap)}px gap is wider than a plain jump`);
      if (z.kind === 'wind' && z.dir === -1 && gap + z.force * 0.7 > SAFE.gap2) errors.push(`${at}: a headwind of ${z.force} makes the ${Math.round(gap)}px gap too far even for a double jump`);
    }
  }

  // nothing floats below the water
  for (const p of plats) {
    if (stage.waterY !== undefined && p.y > stage.waterY - 20 && p.height < 50) {
      errors.push(`platform ${p.id} is under the waterline`);
    }
  }

  return finish();

  function finish(): CheckResult {
    return {
      ok: errors.length === 0,
      errors,
      stats: {
        platforms: plats.length,
        reachablePlatforms: seen.size,
        vines: stage.vines.length,
        maxGapUsed: Math.round(maxGapUsed),
        swingEdges,
        climbEdges,
      },
    };
  }
}
