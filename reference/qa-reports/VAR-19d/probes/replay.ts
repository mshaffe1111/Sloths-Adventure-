// VAR-19d probe: plainWalk.test.ts's "one-jump steps" replayed on one stage's layout (its helpers copied verbatim, lines 31-210), every
// face in order on one sim as the test runs them, logging each failure's cause: hurt, died, or where he came down.
// usage: npx tsx replay.ts <stage> <layout>
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { canGrabSwing } from '../../../../src/game/physics.ts';
import { G, HAND_STAGES } from '../../../../src/game/protoStage.ts';
import { specFor } from '../../../../src/game/mixer/stages.ts';
import { STEP_UP } from '../../../../src/game/engine.ts';
import type { Platform } from '../../../../src/game/types.ts';
function touchPlay(id: string, seed: number): RealPlay { const sim = new RealPlay(id, seed); (sim.input as unknown as { source: string }).source = 'gesture'; return sim; }
const solidish = (q: Platform) => q.type === 'solid' && !q.broken && !q.lily;

interface Face { x: number; floorY: number; top: number; rise: number }
/** faces he meets going right: a block whose left side rises from the floor just in front of it */
function facesOf(plats: Platform[]): Face[] {
  const out: Face[] = [];
  for (const q of plats) {
    if (!solidish(q) || q.height < 50) continue;
    let floor: Platform | null = null;
    for (const f of plats) {
      if (f === q || f.broken || f.type === 'drift' || f.type === 'moving') continue;
      if (f.x > q.x - 10 || f.x + f.width < q.x - 10) continue;
      if (f.y <= q.y) {
        floor = null;
        break;
      }
      if (!floor || f.y < floor.y) floor = f;
    }
    if (!floor || floor.width < 60) continue;
    const rise = floor.y - q.y;
    if (rise >= STEP_UP.min && rise <= STEP_UP.max) out.push({ x: q.x, floorY: floor.y, top: q.y, rise });
  }
  return out;
}

/** steer right up to the face, lift, one straight flick (leaning `lean` by chance): on top of it after? */
function flickUp(sim: RealPlay, f: Face, lean: -1 | 0): 'climbed' | 'past' | false {
  sim.stand(f.x - 70, f.floorY);
  sim.p.facing = 1;
  // (the hazards count here: a carried-past landing must be safe ground, so he can be hurt and the hurt is noticed)
  sim.safe = false;
  sim.p.invincibleTimer = 0;
  const hp0 = sim.p.hp;
  let hold = 0;
  let flicked = false;
  try {
    for (let i = 0; i < 30 * 3; i++) {
      const p = sim.p;
      let press = false;
      if (!flicked && p.grounded && p.x + 19 >= f.x - 3) {
        press = true;
        flicked = true;
        hold = 7;
        (sim.input.state as unknown as { jumpLean: number }).jumpLean = lean;
      }
      sim.frame({ right: !flicked, press, jump: hold > 0 });
      hold--;
      if (sim.died || sim.p.hp < hp0) return false;
      // (a vine or trunk over the step caught him on the way up: that is a way up too)
      if (sim.p.climbing || sim.p.isVineSwinging || sim.p.hanging) return 'climbed';
      if (flicked && hold < 0 && sim.p.grounded) {
        // (on top of it; or, for a flick that leaned away, up on a step behind him: the help takes the lean first, as in World 5)
        if (lean ? sim.p.y <= f.floorY - STEP_UP.min : sim.p.y <= f.top + 1 && sim.p.x > f.x) return 'climbed';
        // carried past it (CT-1, polish report 2026-10-29: a one-thumb running flick keeps its run speed, so it can sail over a step
        // narrower than a jump): fine on safe ground beyond it, never a pit, water or thorns (died or hurt, above) or by an animal
        if (sim.p.x > f.x && safeGround(sim)) return 'past';
        return false;
      }
    }
    return false;
  } finally {
    sim.safe = true;
  }
}

/** no animal within 120 px of him (an animal's clearance), at about his height */
function safeGround(sim: RealPlay): boolean {
  const p = sim.p;
  const enemies = (sim.e.enemies ?? []) as Array<{ x: number; y: number; defeated?: boolean; hp?: number }>;
  return !enemies.some((e) => !e.defeated && (e.hp ?? 1) > 0 && Math.abs(e.x - p.x) < 120 && Math.abs(e.y - p.y) < 90);
}

/** the step climbed another way: from standing flush at its face, steer on into it and flick up (a thumb kept on the glass) */
function climbFromFace(sim: RealPlay, f: Face): boolean {
  sim.stand(f.x - 24, f.floorY);
  sim.p.facing = 1;
  for (let i = 0; i < 30 * 2; i++) {
    sim.frame({ right: true, press: i === 0, jump: i < 7 });
    if (sim.died) return false;
    if (sim.p.climbing || sim.p.isVineSwinging || sim.p.hanging) return true;
    if (i > 3 && sim.p.grounded && sim.p.y <= f.top + 1 && sim.p.x > f.x) return true;
  }
  return false;
}

/** low floors (dips): under the ground, open on top, not water's stepping stones (a river over them) and not a puzzle room's floor */
function dipsOf(sim: RealPlay): Platform[] {
  const st = sim.stage;
  const rooms = (st.kit?.rooms ?? []).map((r) => {
    const xs = [r.left, r.right].map((a) => {
      const q = sim.platforms.find((p) => p.id === a.on);
      return q ? q.x + q.width * a.at : NaN;
    });
    return [Math.min(...xs) - 200, Math.max(...xs) + 200];
  });
  const wet = (x0: number, x1: number) => (st.rivers ?? []).some((r) => r.x1 > x0 && r.x0 < x1);
  return sim.platforms.filter((q) => solidish(q) && q.y > G + 30 && q.y <= G + 220 && q.width >= 40 && !wet(q.x, q.x + q.width)
    && !rooms.some(([a, b]) => q.x + q.width > a && q.x < b)
    && !sim.platforms.some((o) => o !== q && solidish(o) && o.y < q.y && o.y + o.height > q.y - 4 && o.x <= q.x + 20 && o.x + o.width >= q.x + 20));
}

/** dropped into a dip, a one-thumb player heads right, flicking straight up at each face: out with single flicks? (-1: never) */
function leaveDip(sim: RealPlay, d: Platform): number {
  sim.stand(d.x + 20, d.y);
  sim.p.facing = 1;
  let flicks = 0, hold = 0, rest = 0, lastX = sim.p.x, still = 0;
  for (let i = 0; i < 30 * 12; i++) {
    const p = sim.p;
    if (p.climbing || p.isVineSwinging || p.hanging) return flicks;
    const face = sim.platforms.some((q) => solidish(q) && q.height >= 20 && q.x - (p.x + 19) >= -3 && q.x - (p.x + 19) < 8 && q.y < p.y - 6 && q.y + q.height > p.y - 4);
    still = Math.abs(p.x - lastX) < 0.5 && p.grounded ? still + 1 : 0;
    lastX = p.x;
    let press = false;
    // a liana swinging over the dip (they swing on their own, physics.ts): he flicks up as it comes over him, the way a player waits
    // for it (a jump's rise later, his hands meet it)
    const vineComing = sim.vines.some((v) => v.vineType !== 'tree_climb' && Math.abs(v.x - p.x) < 260 && canGrabSwing(p.x, p.y - 90, v, sim.vineClock + 0.25));
    if (p.grounded && hold <= -3 && (face || still > 6 || vineComing) && rest-- <= 0) {
      press = true;
      hold = 7;
      rest = 3;
      flicks++;
    }
    sim.frame({ right: p.grounded && !face && hold <= 0, press, jump: hold > 0 });
    hold--;
    if (sim.died) return -1;
    if (sim.p.grounded && sim.p.y <= Math.min(d.y - 20, G + 2) && sim.p.x > d.x + d.width + 30) return flicks;
    if (flicks > 6) break;
  }
  return -1;
}

/**
 * Dips by the ground beside them (the lead's ruling (a), 11-06): on gen2 and the W1 mixer's stages the ground runs at many heights, so
 * main's ground line G is the wrong ruler (1-5's level route under G read as 205 dips he "never" left). A dip there is a ground block
 * 30-220 px under the ground blocks either side, left either way (a soft pit may climb back to the take-off). G stays for main's stages
 */
const relativeGround = (sim: RealPlay) => !!(sim.stage as { gen2?: unknown }).gen2 || !!specFor(HAND_STAGES[sim.stage.config.id] ?? '');
function dipsRel(sim: RealPlay): Array<{ d: Platform; top: number }> {
  const ground = sim.platforms.filter((q) => solidish(q) && q.height >= 60).sort((a, b) => a.x - b.x);
  const wet = (x0: number, x1: number) => (sim.stage.rivers ?? []).some((r) => r.x1 > x0 && r.x0 < x1);
  const out: Array<{ d: Platform; top: number }> = [];
  for (const q of ground) {
    if (q.width < 40 || wet(q.x, q.x + q.width)) continue;
    if (sim.platforms.some((o) => o !== q && solidish(o) && o.y < q.y && o.y + o.height > q.y - 4 && o.x <= q.x + 20 && o.x + o.width >= q.x + 20)) continue;
    // (the banks touch it: ground across a gap is a jump, not a dip's wall, 1-5's blocks between pits)
    const left = ground.filter((o) => o.x + o.width <= q.x + 4 && o.x + o.width >= q.x - 4).sort((a, b) => a.y - b.y)[0];
    const right = ground.filter((o) => o.x >= q.x + q.width - 4 && o.x <= q.x + q.width + 4).sort((a, b) => a.y - b.y)[0];
    if (!left || !right) continue;
    const top = Math.max(left.y, right.y);
    if (q.y - top >= 30 && q.y - top <= 220) out.push({ d: q, top });
  }
  return out;
}
/** dropped into a dip, a one-thumb player heads one way, flicking straight up at each face: out with single flicks? (-1: never) */
function leaveDipRel(sim: RealPlay, d: Platform, top: number, dir: 1 | -1): number {
  sim.stand(dir > 0 ? d.x + 20 : d.x + d.width - 64, d.y);
  sim.p.facing = dir;
  let flicks = 0, hold = 0, rest = 0, lastX = sim.p.x, still = 0;
  for (let i = 0; i < 30 * 12; i++) {
    const p = sim.p;
    if (p.climbing || p.isVineSwinging || p.hanging) return flicks;
    const face = sim.platforms.some((q) => solidish(q) && q.height >= 20 && q.y < p.y - 6 && q.y + q.height > p.y - 4 && (dir > 0 ? q.x - (p.x + 19) >= -3 && q.x - (p.x + 19) < 8 : (p.x - 19) - (q.x + q.width) >= -3 && (p.x - 19) - (q.x + q.width) < 8));
    still = Math.abs(p.x - lastX) < 0.5 && p.grounded ? still + 1 : 0;
    lastX = p.x;
    let press = false;
    if (p.grounded && hold <= -3 && (face || still > 6) && rest-- <= 0) { press = true; hold = 7; rest = 3; flicks++; }
    const go = p.grounded && !face && hold <= 0;
    sim.frame({ right: dir > 0 && go, left: dir < 0 && go, press, jump: hold > 0 });
    hold--;
    if (sim.died) return -1;
    if (sim.p.grounded && sim.p.y <= top + 2 && (dir > 0 ? sim.p.x > d.x + d.width + 30 : sim.p.x < d.x - 30)) return flicks;
    if (flicks > 6) break;
  }
  return -1;
}
const relFlicks = (sim: RealPlay, d: Platform, top: number) => {
  const ways = [leaveDipRel(sim, d, top, 1), leaveDipRel(sim, d, top, -1)].filter((f) => f >= 0);
  return ways.length ? Math.min(...ways) : -1;
};

void canGrabSwing; void G; void HAND_STAGES; void specFor;
const [id, v] = [process.argv[2], Number(process.argv[3])];
const sim: any = touchPlay(id, v);
for (const f of facesOf(sim.platforms)) for (const lean of [0, -1] as const) {
  const hp0 = sim.p.hp, t0 = sim.gameTime ?? 0;
  const how = flickUp(sim, f, lean);
  if (!how) {
    const hurt = sim.p.hp < hp0;
    console.log(`FAIL x${Math.round(f.x)} rise ${f.rise} lean ${lean}: ${sim.died ? 'died' : hurt ? `hurt (hp ${hp0}->${sim.p.hp})` : 'not up'}; at x${Math.round(sim.p.x)} y${Math.round(sim.p.y)} (top ${f.top}, floor ${f.floorY}); near: ${(sim.enemies ?? sim.stage.enemies ?? []).filter((e: any) => !e.defeated && Math.abs(e.x - sim.p.x) < 300).map((e: any) => `${e.type}@${Math.round(e.x)},${Math.round(e.y)}`).join(' ')}`);
  }
}
