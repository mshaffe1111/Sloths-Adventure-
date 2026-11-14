/**
 * sweepPose — where a kit sweeper (World 1's harpy eagle, predators/world1.ts EAGLE) is DRAWN, from its kit state (1-7.md NEW 2). The kit
 * moves only its eye (`eyeX`, the stretch it sees) and, in its act, the box that hurts; this says what the player sees of that, in the
 * old watcher's language (engine.ts drawWatchBack, the one 1-7 was played on): far off and small circling over his stretch between
 * passes, in at the edge of the view and flaring for the warn (the screech), over its eye with its shadow on the ground for the pass,
 * the dive down to him in its tell, pulling up short on a free pass or when he went still in the green, and climbing away after.
 *
 * Pure: no canvas, no engine. The engine eases toward the pose (no pops; `snap` marks a pose that starts faded out, where a jump in
 * place is never seen) and draws it with the painted eagle (eagleSprite.ts) and the shadow sprite (engine.ts drawWatchShadow).
 */
import { tellOf } from './predators/core.ts';
import type { PredatorDef, PredatorState } from './predators/types.ts';

/** the old watcher's numbers, kept (engine.ts drawWatchBack): how high it flies under the view's top, how far in from the edge it shows */
export const SKY = {
  /** its body's height under the view's top while it flies (px) */
  fly: 125,
  /** far off between passes: small, faint, circling (scale, alpha, how high) */
  far: { scale: 0.38, alpha: 0.55, y: 120 },
  /** in from the edge for the warn (px; at most this share of the view) */
  inX: 130,
  inShare: 0.2,
  /** a free pass (or one called off) pulls up this far over him (px) */
  short: 70,
  /** the dive ends this far over his feet (px): it takes him at his middle */
  over: 40,
  /** after the act it climbs away: this far on and up (px) */
  away: { x: 320, y: 300 },
  /** a pose that comes in from nothing fades in over this (s) */
  fadeIn: 0.8,
} as const;

/**
 * The moss coming over a still Pokey in cover (1-7 NEW 3: real sloths wear algae; the tell that he is hidden), laid over only his own
 * drawing at this colour, its strength the calm (castPlay.ts calmNow) times `alpha`. Code-drawn, a tint (STAGE-RULES §4)
 */
export const MOSS_TINT = { rgb: '86, 138, 52', alpha: 0.45 } as const;

/** how high over its ground a perched sweeper's feet grip its snag (game px): a low branch of the snag (w17Art.ts SNAG_PERCH_DRAWN, the
 *  piece it is measured on: 1-7 beat 12), low enough that all of it shows under the HUD on a sideways phone (412 px tall: at 208 px its
 *  head was off the top, ENG-E2's sideways stills) and its look down at him reads */
export const SNAG_PERCH = 120;

/** a perched sweeper's look (the four painted frames, w17Art.ts): away ahead at rest, its head turning for the warn, down the gaze, a blink */
export type PerchLook = 'ahead' | 'turn' | 'down' | 'blink';

export interface SweepView {
  x: number;
  y: number;
  w: number;
}

export interface SweepPose {
  x: number;
  y: number;
  scale: number;
  alpha: number;
  facing: 1 | -1;
  /** the eagle sprite's pose (eagleSprite.ts reads Enemy.swoopPhase) */
  phase: 'patrol' | 'telegraph' | 'swoop';
  /** talons out: the strike itself */
  attacking: boolean;
  /** its shadow on the ground, under its eye (world x, strength 0..1), or none */
  shadow: { x: number; a: number } | null;
  /** this pose starts faded out: the engine may move it there at once */
  snap: boolean;
  /** perched on its snag in this look (drawn with the perched frames at (x, y), its feet there), not flying */
  perch?: PerchLook;
}

export interface SweepScene {
  hero: { x: number; y: number };
  view: SweepView;
  easy: boolean;
  /** this pass is its free one (core.ts sparedPass): the dive pulls up short */
  spared: boolean;
  /** game time (s), for the far circling */
  time: number;
  /** he is hidden now (still, in cover, the moss all the way in: castPlay.ts calmNow): a perched eagle looking right at him blinks */
  hidden?: boolean;
}

/** a perched sweeper's numbers: its body over its feet when it flies (px), how high it lifts off for the dive, its idle blink (s) */
export const PERCH = { body: 45, lift: 26, blinkEvery: 4.3, blink: 0.16 } as const;

/**
 * A perched sweeper (Post.perched, 1-7 beat 12): it sits on its snag and its gaze does the sweeping. At rest it looks away ahead (and
 * blinks now and then); for the warn its head turns (the screech; the shadow of its gaze at the stretch's end); through the pass it
 * looks down, its gaze's shadow sliding over the moss, and it blinks when its gaze is on him and he is hidden; it dives from its snag in
 * its tell, the body the kit moves through the act and back, and when stillness beats it, it flies off. Its body is where the kit has it.
 */
function perchedPose(def: PredatorDef, s: PredatorState, sc: SweepScene): SweepPose | null {
  const { hero, view } = sc;
  const pose = (o: Partial<SweepPose> & Pick<SweepPose, 'x' | 'y'>): SweepPose =>
    ({ scale: 1, alpha: 1, facing: s.facing, phase: 'patrol', attacking: false, shadow: null, snap: false, ...o });
  const home = Math.abs(s.x - s.homeX) <= 4 && Math.abs(s.y - s.homeY) <= 4;
  const short = sc.spared ? SKY.short : 0;
  const toEye: 1 | -1 = s.eyeX >= s.homeX ? 1 : -1;
  const onView = s.eyeX >= view.x - 60 && s.eyeX <= view.x + view.w + 60;
  switch (s.phase) {
    case 'rest':
    case 'hunt': {
      // flying home after a dive: the bird where the kit has its body, back to the branch
      if (!home) return pose({ x: s.x, y: s.y - PERCH.body, phase: 'swoop', facing: s.homeX >= s.x ? 1 : -1 });
      if (s.phase === 'rest') {
        const blink = sc.time % PERCH.blinkEvery < PERCH.blink;
        return pose({ x: s.homeX, y: s.homeY, perch: blink ? 'blink' : 'ahead', facing: toEye });
      }
      const from = s.facing > 0 ? s.minX : s.maxX;
      const warn = (def.warn ?? 0) * Math.max(1, sc.easy ? def.easy.tell : 1);
      if (s.eyeX === from && s.t < warn) {
        // the warn: its head turns to the stretch, the gaze's shadow coming in where it will start
        const u = s.t / Math.max(0.01, warn);
        return pose({ x: s.homeX, y: s.homeY, perch: 'turn', facing: toEye, shadow: onView ? { x: s.eyeX, a: 0.18 + 0.3 * u } : null });
      }
      const onHim = Math.abs(hero.x - s.eyeX) <= def.sight.ahead;
      return pose({ x: s.homeX, y: s.homeY, perch: onHim && sc.hidden ? 'blink' : 'down', facing: toEye, shadow: onView ? { x: s.eyeX, a: 0.5 } : null });
    }
    case 'tell': {
      // it leaves the branch: wings up, lifting off toward him (the body is still on its post until the act)
      const u = clamp(s.t / Math.max(0.01, tellOf(def, sc.easy)), 0, 1);
      return pose({
        x: s.homeX + (hero.x - s.homeX) * 0.12 * u, y: s.homeY - PERCH.body - PERCH.lift * u, phase: 'swoop',
        facing: hero.x >= s.homeX ? 1 : -1, shadow: { x: s.eyeX, a: 0.5 * (1 - u) },
      });
    }
    case 'act':
      return pose({ x: s.x, y: s.y - SKY.over - short, phase: 'swoop', attacking: !sc.spared, facing: hero.x >= s.x ? 1 : -1 });
    case 'recover': {
      const u = clamp(s.t / Math.max(0.01, def.recover), 0, 1);
      return pose({ x: s.x, y: s.y - SKY.over - short - PERCH.lift * u, phase: 'swoop', facing: s.homeX >= s.x ? 1 : -1 });
    }
    case 'flee':
    case 'stunned': {
      // stillness beat it: it gives up and flies off its snag, out of the view
      const u = clamp(s.t / 1.2, 0, 1);
      return pose({ x: s.homeX + s.facing * SKY.away.x * u, y: s.homeY - PERCH.body - SKY.away.y * u, phase: 'swoop', alpha: 1 - u });
    }
    case 'gone':
      return null;
  }
  return null;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** the pose a sweeper is drawn in now, or null when nothing of it shows (he is not in its stretch and it is not after him) */
export function sweepPose(def: PredatorDef, s: PredatorState, sc: SweepScene): SweepPose | null {
  if (s.perched) return perchedPose(def, s, sc);
  const { hero, view } = sc;
  const sky = view.y + SKY.fly;
  const inX = Math.min(SKY.inX, view.w * SKY.inShare);
  const there = hero.x >= s.minX && hero.x <= s.maxX;
  const pose = (o: Partial<SweepPose> & Pick<SweepPose, 'x' | 'y'>): SweepPose =>
    ({ scale: 1, alpha: 1, facing: s.facing, phase: 'patrol', attacking: false, shadow: null, snap: false, ...o });
  const fade = Math.min(1, s.t / SKY.fadeIn);
  const short = sc.spared ? SKY.short : 0;

  switch (s.phase) {
    case 'rest': {
      if (!there) return null;
      // far off, small, circling high over the trees (it comes from nothing: a faded pose)
      const a = sc.time * 0.7;
      return pose({
        x: view.x + view.w * (0.5 + 0.32 * Math.cos(a)), y: view.y + SKY.far.y + 10 * Math.sin(a * 2),
        facing: Math.sin(a) > 0 ? -1 : 1, scale: SKY.far.scale, alpha: SKY.far.alpha * fade, snap: true,
      });
    }
    case 'hunt': {
      const from = s.facing > 0 ? s.minX : s.maxX;
      const warn = (def.warn ?? 0) * Math.max(1, sc.easy ? def.easy.tell : 1);
      // the side it comes from: it waits at that edge of the view until its eye comes into view
      const edge = s.facing > 0 ? view.x + inX : view.x + view.w - inX;
      const waiting = s.facing > 0 ? s.eyeX < edge : s.eyeX > edge;
      const onView = s.eyeX >= view.x - 60 && s.eyeX <= view.x + view.w + 60;
      if (s.eyeX === from && s.t < warn) {
        // the warn: in from the edge (or over its eye, when the stretch starts on screen), growing nearer; its shadow shows if its eye is
        // in view. Never the sprite's 'telegraph' flare: that is a code-drawn orange ring and a red '!' (eagleSprite.ts), and 1-7's tell
        // is the screech and the shadow, no '!' (1-7.md tributes, "not copied")
        const u = s.t / Math.max(0.01, warn);
        const x = waiting ? edge : s.eyeX;
        return pose({
          x, y: sky, phase: 'patrol', scale: 0.6 + 0.4 * u, alpha: Math.min(1, s.t / 0.25), snap: true,
          shadow: onView ? { x: s.eyeX, a: 0.18 + 0.3 * u } : null,
        });
      }
      // the pass: over its eye (or at the edge it comes from until its eye is in view); a noise's circling is the same
      return pose({ x: waiting ? edge : s.eyeX, y: sky, shadow: onView ? { x: s.eyeX, a: 0.5 } : null });
    }
    case 'tell': {
      // it saw him: the dive, from over its eye down to him; the shadow fades as it comes off the ground
      const u = clamp(s.t / Math.max(0.01, tellOf(def, sc.easy)), 0, 1);
      const k = u * u;
      return pose({
        x: s.eyeX + (hero.x - s.eyeX) * k, y: sky + (hero.y - SKY.over - short - sky) * k, phase: 'swoop',
        attacking: !sc.spared && u > 0.6, shadow: { x: s.eyeX + (hero.x - s.eyeX) * k, a: 0.5 * (1 - u) },
      });
    }
    case 'act':
      return pose({ x: hero.x, y: hero.y - SKY.over - short, phase: 'swoop', attacking: !sc.spared });
    case 'recover': {
      // up and away on its way, never sitting on him; faded out by the time the next calm starts far off
      const u = clamp(s.t / Math.max(0.01, def.recover), 0, 1);
      return pose({
        x: s.aimX + s.facing * SKY.away.x * u, y: s.aimY - SKY.over - short - SKY.away.y * u * u, phase: 'swoop', alpha: 1 - u,
      });
    }
    case 'flee':
    case 'stunned':
    case 'gone': {
      // stillness beat it (two empty passes with him still there: core.ts endPass): it gives up and climbs out of the view
      if (s.phase === 'gone') return null;
      const u = clamp(s.t / 1.2, 0, 1);
      return pose({ x: s.eyeX + s.facing * SKY.away.x * u, y: sky - SKY.away.y * u, alpha: 1 - u });
    }
  }
  return null;
}
