/**
 * castPlay — a stage's cast, run by the creature kit (reference/design/PREDATORS.md; reference/methods/predator-kit.md). The bridge
 * between the engine and the pure kit: when a stage's brief names a cast (`proto.cast`, castPlay.types.ts), every animal of a named
 * kind is stepped HERE on the fixed step, never by predatorAI.ts, with
 *   - Pokey's stillness (stillness.ts) and the cover he stands in,
 *   - the noise of his landings (heroNoise.ts: a hard one wakes sleepers, a soft one makes no event), from the world that teaches it,
 *   - the stage's drop traps (dropTrap.ts), which beat what they come down beside by the kit's 'trap' way.
 * A blow, a stomp or a trap is tried on the kit (`beat`); what it does is the animal's data. Nothing here is a stage's: no ids, no
 * seeds, no positions. Pure but for the animals it writes back to (the fields the art already reads); no canvas, no sounds.
 */
import type { CastData, TrapPost } from './castPlay.types.ts';
import { TRAP, handleBox, limbGone, newTrap, scares, shake, stepTrap, type TrapState } from './dropTrap.ts';
import { landingNoise, newFall, stepFall, type Sound } from './heroNoise.ts';
import { DROWSY, GONE_AFTER, beat, coolOf, foodChain, hear, hurt, newPredator, stepPredator, tellOf } from './predators/core.ts';
import { castDef } from './predators/registry.ts';
import { TAUGHT } from './predators/roster.ts';
import type { Box, PredatorDef, PredatorState, Prey, Scene, Way } from './predators/types.ts';
import { STILLNESS, inCover, isStill, newStill, stepStill, type Cover } from './stillness.ts';
import type { Enemy, Platform } from './types.ts';

/** how a chased-off animal is shown leaving, on top of the kit's own run: it lifts a little, then glides out and down to a lower tree */
export const GLIDE = { far: 170, lift: 30, drop: 150 } as const;

/** what the cast reads of Pokey on a step */
export interface CastHero {
  x: number;
  /** his feet */
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  grounded: boolean;
  /** holding a vine or a rope */
  holding: boolean;
}

export interface CastMember {
  e: Enemy;
  def: PredatorDef;
  s: PredatorState;
  /** how far its body's middle sits over its ground (px): the kit stands it on the ground, the art draws it from its middle */
  foot: number;
  /** it has left for good (chased off, knocked off its branch): counted once */
  cleared: boolean;
}

/** what happened on a step, for the engine's sounds, sparks and counts. One record, reused: read it before the next step */
export interface CastStep {
  noticed: Enemy[];
  told: Enemy[];
  struck: Enemy[];
  /** the boxes that hurt this step, each with its animal */
  hurts: Array<{ e: Enemy; box: Box }>;
  /** animals that just left for good */
  cleared: Enemy[];
  /** traps that came down this step */
  fell: TrapPost[];
  /** a hard landing's noise (null: he did not land, or landed softly), and how many sleepers it woke */
  landed: Sound | null;
  woke: number;
}

const PHASE_STATE: Record<PredatorState['phase'], string> = {
  rest: 'patrol', hunt: 'alert', tell: 'rear', act: 'strike', recover: 'recover', stunned: 'recover', flee: 'patrol', gone: 'patrol',
};

export class CastPlay {
  readonly members: CastMember[] = [];
  readonly traps: TrapState[];
  private still = newStill();
  private fall = newFall();
  private readonly covers: readonly Cover[];
  /** his landings are heard here: only from the world that teaches it (the move ladder) */
  private readonly loud: boolean;
  private readonly out: CastStep = { noticed: [], told: [], struck: [], hurts: [], cleared: [], fell: [], landed: null, woke: 0 };
  private readonly prey: Prey = { x: 0, y: 0, facing: 1, still: false, covered: false };
  private readonly scene: Scene = { t: 0, dt: 0, hero: this.prey, easy: false };

  /**
   * `enemies`: the stage's animals as the engine holds them; each of a kind the cast names (and the kit knows, as it plays in this
   * `world`) gets its kit state, on the ground under it. The rest are left to the engine.
   */
  constructor(data: CastData, enemies: Enemy[], platforms: readonly Platform[], world: number, covers: readonly Cover[] = []) {
    this.covers = covers;
    this.loud = TAUGHT.landing <= world;
    this.traps = data.traps.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.loadX)).map(newTrap);
    for (const e of enemies) {
      const def = data.kinds.includes(e.type) ? castDef(e.type, world) : undefined;
      if (!def || e.defeated) continue;
      const ground = groundUnder(platforms, e);
      const s = newPredator(def, { x: e.x, y: ground, minX: e.patrolMinX, maxX: e.patrolMaxX, facing: e.facing, asleep: !!e.asleep });
      e.kit = s;
      const m: CastMember = { e, def, s, foot: ground - e.y, cleared: false };
      this.members.push(m);
      this.sync(m, 0, 0, false);
    }
  }

  /** is he hidden-still right now (the calm has come all the way in)? For the art */
  isStill(easy: boolean): boolean {
    return isStill(this.still, STILLNESS[easy ? 'easy' : 'normal']);
  }

  /** one fixed step of the whole cast. `t`: game time */
  step(hero: CastHero, dt: number, t: number, easy: boolean): CastStep {
    const o = this.out;
    o.noticed.length = o.told.length = o.struck.length = o.hurts.length = o.cleared.length = o.fell.length = 0;
    o.landed = null;
    o.woke = 0;
    const set = STILLNESS[easy ? 'easy' : 'normal'];
    stepStill(this.still, hero, dt, set);
    const prey = this.prey;
    prey.x = hero.x;
    prey.y = hero.y;
    prey.facing = hero.facing;
    prey.still = isStill(this.still, set);
    prey.covered = inCover(this.covers, hero);

    // his landing: how far he fell says how far it carries; a soft one makes no noise at all, and none does before the world that
    // teaches quiet feet (roster.ts TAUGHT.landing)
    const fell = stepFall(this.fall, hero);
    if (fell !== null && this.loud) {
      const n = landingNoise(hero.x, hero.y, t, fell);
      if (n) {
        o.landed = n;
        for (const m of this.members) if (hear(m.def, m.s, n) === 'woke') o.woke++;
      }
    }

    // the traps: one that comes down chases off what stands beside it
    for (const tr of this.traps) {
      if (!stepTrap(tr, dt)) continue;
      o.fell.push(tr.post);
      // (chased off must read as fleeing: it leaves AWAY from him, whichever side of the load it stood, never past him)
      for (const m of this.members) if (scares(tr.post, m.s.x, m.s.y)) beat(m.def, m.s, 'trap', t, hero.x);
    }

    const sc = this.scene;
    sc.t = t;
    sc.dt = dt;
    sc.easy = easy;
    foodChain(this.members, t);
    for (const m of this.members) {
      if (m.s.phase !== 'gone') {
        const ev = stepPredator(m.def, m.s, sc);
        if (ev.notice) o.noticed.push(m.e);
        if (ev.tell) o.told.push(m.e);
        if (ev.act) o.struck.push(m.e);
        const box = hurt(m.def, m.s);
        if (box) o.hurts.push({ e: m.e, box });
      }
      if (!m.cleared && (m.s.leaving || m.s.phase === 'gone')) {
        m.cleared = true;
        o.cleared.push(m.e);
      }
      this.sync(m, t, dt, easy);
    }
    return o;
  }

  /** try a way on an animal of the cast (a punch, a kick, a stomp), from where he stands. True when it worked */
  beat(e: Enemy, way: Way, t: number, fromX: number): boolean {
    const m = this.members.find((q) => q.e === e);
    return !!m && beat(m.def, m.s, way, t, fromX);
  }

  /**
   * Something let fall came down at (x, y) as a drop-trap load does (a fruit cluster pushed free in a vine field: fieldPlay.ts): every
   * animal it would scare (dropTrap.ts scares: within TRAP.scare across, TRAP.tall up or down) is chased off, away from him. How many.
   */
  loadLands(x: number, y: number, t: number, heroX: number): number {
    let n = 0;
    for (const m of this.members) if (Math.abs(m.s.x - x) <= TRAP.scare && Math.abs(m.s.y - y) <= TRAP.tall && beat(m.def, m.s, 'trap', t, heroX)) n++;
    return n;
  }

  /** a creaky limb has given way (engine.ts): the 'limb' trap it is the load of, if any, falls now (returned) */
  limbGone(platformId: number): TrapPost | null {
    for (const tr of this.traps) if (tr.post.limb === platformId && limbGone(tr)) return tr.post;
    return null;
  }

  /** a blow's box against the traps' handles: the first set trap it lands on is let go (returned) */
  strike(box: Box): TrapPost | null {
    for (const tr of this.traps) {
      if (tr.phase !== 'set' || tr.post.kind === 'limb') continue;
      const h = handleBox(tr.post);
      if (box.x < h.x + h.w && box.x + box.w > h.x && box.y < h.y + h.h && box.y + box.h > h.y && shake(tr)) return tr.post;
    }
    return null;
  }

  /** is there a set trap's handle within a blow's reach of him? (for the pad's hint, as an animal or a cage is) */
  handleNear(x: number, y: number, reach = 70): boolean {
    return this.traps.some((tr) => tr.phase === 'set' && tr.post.kind !== 'limb' && Math.abs(tr.post.x - x) <= reach + TRAP.handle.w / 2 && Math.abs(tr.post.y - y) <= TRAP.handle.high);
  }

  /**
   * He is back at a flag: his stillness and his fall start over, and whatever was after him goes back to its business with a full
   * beat before it may tell again. What is gone stays gone; a sprung trap stays sprung.
   */
  calm(easy: boolean): void {
    this.still = newStill();
    this.fall = newFall();
    for (const m of this.members) {
      const s = m.s;
      if (s.phase === 'gone' || s.phase === 'flee' || s.phase === 'stunned' || s.asleep) continue;
      s.phase = 'rest';
      s.t = 0;
      s.drawn = false;
      s.lost = 0;
      s.cool = Math.max(s.cool, coolOf(m.def, easy));
    }
  }

  /** write the kit's state onto the animal the art and the blows read */
  private sync(m: CastMember, t: number, dt: number, easy: boolean): void {
    const { e, s, def } = m;
    const wasAsleep = e.state === 'sleep';
    e.x = s.x;
    e.y = s.y - m.foot;
    e.groundY = e.y;
    e.facing = s.facing;
    e.asleep = s.asleep;
    e.state = s.asleep ? 'sleep' : PHASE_STATE[s.phase];
    e.stateT = s.t;
    e.isAttacking = s.phase === 'tell' || s.phase === 'act';
    e.telegraphTimer = s.phase === 'tell' ? Math.max(0, tellOf(def, easy) - s.t) : 0;
    e.stagger = s.phase === 'stunned' ? Math.max(0.01, s.stunUntil - t) : 0;
    e.wakeT = wasAsleep && !s.asleep ? DROWSY : Math.max(0, (e.wakeT ?? 0) - dt);
    if (s.leaving && s.phase !== 'gone') {
      const u = Math.min(1, s.t / GONE_AFTER);
      e.glide = u;
      // (it is leaving, not waking: the drowsy head is never shown on a glide)
      e.wakeT = 0;
      e.x += s.facing * GLIDE.far * u * u;
      e.y += GLIDE.drop * u * u - GLIDE.lift * Math.sin(Math.PI * Math.min(1, u * 2));
    }
    if (s.phase === 'gone' && !e.defeated) {
      // out of the stage on its own: no knock-out, nothing to draw
      e.defeated = true;
      e.koTimer = 1;
      e.koLife = 0;
      e.koVx = 0;
      e.koVy = 0;
    }
  }
}

/** the top of the ground under an animal: the nearest surface at or below its middle that it stands over */
export function groundUnder(platforms: readonly Platform[], e: { x: number; y: number; height: number }): number {
  let best = Infinity;
  for (const p of platforms) {
    if (p.x > e.x || p.x + p.width < e.x || p.y < e.y - 2) continue;
    if (p.y < best) best = p.y;
  }
  return Number.isFinite(best) ? best : e.y + e.height / 2;
}
