/**
 * The bosses. Every world's boss has its own list of moves, its own tells and its own way of being
 * punished, so no two fights feel alike. The shared rules (telegraph -> attack -> recovery) live in bossAI.ts.
 *
 * Reading a fight:
 *   tell   the boss visibly winds up (and the floor shows where it will land). It is armored: light hits
 *          only clang off, but a hook or a mega punch knocks it out of the move.
 *   act    the attack. Dodge it.
 *   rec    recovery: the boss is wide open. This is when you hit it.
 *   stun   it crashed or was staggered: wide open for longer.
 */
import type { BossEntity } from './types.ts';
import {
  aimed,
  arc,
  beam,
  bolt,
  column,
  dropAt,
  floorWave,
  headWave,
  lob,
  makeHazard,
} from './bossAI.ts';
import type { BossCtx, BossDef, MoveDef } from './bossAI.ts';
import { inMoonPool } from './prowlerPools.ts';
import { GUST, PILLAR, SCREECH, pillarFor, rockShower, slamPillar, slamSide, standing } from './sovereignFight.ts';
import type { SkyPillar } from './sovereignFight.ts';
import { screechBeak } from './sovereignSprite.ts';
import { VF, lungeAim, venomHurt, venomWeak } from './venomFang.ts';

// ───────────────────────────── shared move builders ─────────────────────────────

const bodyBox = (b: BossEntity) => ({ x: b.x - b.width / 2, y: b.y - b.height / 2, w: b.width, h: b.height });

/** a box in front of the boss, reaching `reach` px past its body */
const frontBox = (b: BossEntity, c: BossCtx, reach: number, top: number, bottom: number) => {
  const d = b.facing;
  const x0 = d > 0 ? b.x + b.width / 2 - 14 : b.x - b.width / 2 + 14 - reach;
  return { x: x0, y: c.arena.floor - top, w: reach, h: top - bottom };
};

/** a box on both sides of the boss, low or high */
const bothSides = (b: BossEntity, c: BossCtx, reach: number, top: number, bottom: number) => [
  { x: b.x + b.width / 2 - 10, y: c.arena.floor - top, w: reach, h: top - bottom },
  { x: b.x - b.width / 2 + 10 - reach, y: c.arena.floor - top, w: reach, h: top - bottom },
];

/** keep a warning marker sliding toward the player for the first part of the windup, then lock it */
function trackMark(b: BossEntity, c: BossCtx, id: number, dt: number, until: number, speed = 260, offset = 0) {
  if (b.ai!.t > until) return;
  const h = c.hazards.find((x) => x.id === id);
  if (!h) return;
  const dx = c.px + offset - h.x;
  h.x += Math.max(-speed * dt, Math.min(speed * dt, dx));
}

/** all hazards a move made share an id list in `d` so the windup can find them */
function addMark(c: BossCtx, b: BossEntity, h: { id: number }, slot: number) {
  b.ai!.d['h' + slot] = h.id;
}

/** a charge across the floor; a wall crash stuns (if the move says so) */
function chargeMove(o: { tell: number; maxT: number; rec: number; speed: number; stun?: number; min?: number; max?: number; phase?: number; weight?: number; text?: string; interruptible?: boolean }): MoveDef {
  return {
    tell: o.tell,
    act: o.maxT,
    rec: o.rec,
    min: o.min,
    max: o.max,
    phase: o.phase,
    weight: o.weight,
    pose: 'charge',
    interruptible: o.interruptible,
    crashText: o.text,
    stunAfter: o.stun ? () => o.stun! : undefined,
    onAct: (b) => {
      b.ai!.d.dir = b.facing;
    },
    tick: (b, c, dt) => {
      const br = b.ai!;
      const dir = br.d.dir || b.facing;
      b.facing = dir > 0 ? 1 : -1;
      b.x += dir * o.speed * dt;
      br.hurt = [bodyBox(b)];
      const half = b.width / 2;
      if (b.x <= c.arena.left + half + 2 || b.x >= c.arena.right - half - 2) {
        if (!br.d.crashed && o.stun) {
          br.d.crashed = 1;
          c.shake(0.75);
          c.thud(true);
          c.debris(b.x + dir * half, c.arena.floor - 20, '#a16207');
        }
        // without a stun it simply ends at the wall
        if (!o.stun) br.t = o.maxT;
      }
    },
  };
}

/** a leap that lands where the player was when it began */
function leapMove(o: {
  tell: number;
  act: number;
  rec: number;
  height: number;
  min?: number;
  max?: number;
  phase?: number;
  weight?: number;
  onLand: (b: BossEntity, c: BossCtx) => void;
}): MoveDef {
  return {
    tell: o.tell,
    act: o.act,
    rec: o.rec,
    min: o.min,
    max: o.max,
    phase: o.phase,
    weight: o.weight,
    pose: 'leap',
    onAct: (b, c) => {
      const br = b.ai!;
      const half = b.width / 2;
      br.d.x0 = b.x;
      br.d.x1 = Math.max(c.arena.left + half, Math.min(c.arena.right - half, c.px));
      b.facing = br.d.x1 >= b.x ? 1 : -1;
    },
    tick: (b, c, dt, t) => {
      const br = b.ai!;
      const u = Math.min(1, t / o.act);
      const e = u * u * (3 - 2 * u);
      b.x = br.d.x0 + (br.d.x1 - br.d.x0) * e;
      br.air = arc(u) * o.height;
      br.hurt = [bodyBox(b)];
      if (u >= 1 && !br.d.landed) {
        br.d.landed = 1;
        br.air = 0;
        o.onLand(b, c);
      }
    },
  };
}

const impact = (b: BossEntity, c: BossCtx, shake: number, color: string) => {
  c.shake(shake);
  c.thud(true);
  c.debris(b.x, c.arena.floor - 8, color);
};

/**
 * The Shadow Prowler's pounce: the crouch and the leap (s), how high it arcs (kept under the boss bar on a phone held sideways), the
 * ring marking the landing (half-width), and the share of the leap after which he hurts: only coming down, onto the ring, so the ring
 * is the whole of the danger (QA gate: hits 40 px outside it, from his body on the way and the ripples at once)
 */
export const POUNCE = { tell: 0.75, act: 1.0, height: 140, ring: 270, strikeFrom: 0.75 };

// ───────────────────────────── 1. Venom Fang: emerald boa ─────────────────────────────

/** the two little snakes he calls down from the canopy (phase 2), where a hero has room to deal with them */
const venomSnakes = (c: BossCtx) => {
  for (const dx of [250, 560]) {
    const x = c.arena.left + dx;
    if (c.dropMinion) c.dropMinion('snake', x);
    else c.spawnMinion('snake', x, c.arena.floor);
  }
};

// the gentlest boss in the game (Matt, 2026-10-24: "this needs to be the easiest of the bosses"). One move to learn, the stage plan's
// low lunge: he rears back with the floor flashing, his head sweeps along the ground to the far end, you dodge by getting off the
// floor, and his dazed head lies there to be punched. Each phase adds one World 1 move. The geometry is in venomFang.ts.
const VENOM: BossDef = {
  world: 1,
  name: 'Venom Fang',
  // the coil pile: it only hurts while he winds up and lunges
  w: 250,
  h: 150,
  artDy: 0,
  speed: [0, 0, 0],
  prefer: 0,
  gap: [1.6, 1.35, 1.15],
  color: '#84cc16',
  color2: '#365314',
  // six hits (a hook or a kick is one segment of the bar, a jab half of one), and each opening takes two before he pulls back,
  // so the fight is three clean openings, one a phase
  hp: 12,
  hits: 6,
  openCap: 4,
  openCue: true,
  // (2026-10-26, QA: the first lunge came 1.2 s after Dot's tip, before it could be read) he sizes you up first, and he hisses as
  // he rears back
  firstIdle: 3.2,
  tellCall: 'boa',
  weakAt: (b, floor) => venomWeak(b, floor),
  openAfter: ['sweep'],
  aimText: 'HIT HIS HEAD WHEN IT IS DOWN!',
  faceFixed: true,
  frameArena: true,
  // (0.84 until the QA gate: sideways, Pokey at the treetop sat under Dot's bubble and the lives badge)
  floorAt: 0.92,
  arenaW: 1300,
  lair: 'venom',
  entrance: { eye: [190, 242, 100], dark: [1, 6, 3] },
  guide: {
    // (short: four lines of it covered the treetop it sends you to, sideways)
    start: 'When he rears back, get off the ground: the tree, the stump or the vine. Then punch his head!',
    2: 'Little snakes! Punch them, and keep an eye on Venom Fang.',
    3: "The stump is cracking now. Don't stay on it too long!",
  },
  // three ways off the floor: the vine up the wall tree by the left fence, the stump (a double jump), and the liana in the middle
  climbs: [20],
  // (2026-10-26, QA gate: from the top of a 430 vine the climb down took ~1.9 s and the daze was over; pushing on at the top hopped him
  // off onto the floor under the lunge) the vine stops at 270, well clear of the lunge, and a root cradle at its top catches the hop
  climbTop: 270,
  // his coils sit right against the right fence: the gap behind them was a hiding place the head could never reach (QA gate)
  startDx: 1300 - 125 - 2,
  perches: [{ dx: 330, up: 130, w: 150, crack: 3 }, { dx: 36, up: 272, w: 96, noHeart: true }],
  vines: [{ dx: 660, top: 440, bottom: 165 }],
  onPhase: (phase, _b, c) => {
    c.dropHeart?.(c.arena.left + 405);
    if (phase === 2) venomSnakes(c);
    if (phase === 3) c.crackPerches?.(3);
  },
  moves: {
    // the low lunge: the head sweeps the floor to the far end and lies there dazed (the opening)
    sweep: {
      tell: 1.2,
      act: VF.act,
      rec: 3.8,
      pose: 'lunge',
      interruptible: false,
      // (aimed at you: the floor flash follows you through the wind-up and the head comes down at your feet, so the opening is in reach
      // wherever you dodged: bossFair.test.ts)
      onTell: (b, c) => {
        b.ai!.d.reach = lungeAim(b, c.px, c.arena.left, c.arena.right);
      },
      tellTick: (b, c) => {
        b.ai!.d.reach = lungeAim(b, c.px, c.arena.left, c.arena.right);
      },
      tick: (b, c) => {
        b.ai!.hurt = venomHurt(b, c.arena.floor, 0);
      },
      onEnd: (b, c) => {
        c.shake(0.4);
        c.thud(true);
        c.debris(b.ai!.d.reach, c.arena.floor - 8, '#a3e635');
        c.text('DAZED!', b.ai!.d.reach, c.arena.floor - 130, '#fde047');
      },
    },
    // phase 2 on: he rears up and shakes the canopy, and two little snakes drop in (only when the last ones are gone)
    call: {
      tell: 0.9,
      act: 0.35,
      rec: 0.7,
      phase: 2,
      weight: 0.7,
      pose: 'roar',
      interruptible: false,
      when: (_b, c) => c.minionsAlive === 0,
      onAct: (_b, c) => {
        c.shake(0.4);
        venomSnakes(c);
      },
    },
  },
};

// ───────────────────────────── 2. Crocus Rex: river king ─────────────────────────────

const CROC: BossDef = {
  world: 2,
  name: 'Crocus Rex',
  // a giant: the painted croc is drawn 2.4 times its old size, a wall of armour along the whole bank
  scale: 2.4,
  w: 400,
  h: 160,
  artDy: 0,
  speed: [40, 56, 78],
  prefer: 420,
  gap: [1.5, 1.1, 0.8],
  chain: 0.4,
  color: '#7a5c2e',
  color2: '#3b2a12',
  // twelve hits, two hit points a hit
  hp: 24,
  hits: 12,
  // an opening after a move takes a jab, a cross and a hook (two segments), then he pulls back; a crash into the wall is not capped
  openCap: 4,
  openCue: true,
  // his one weak point is the head. It is low, so the trick is not reaching it but being there in the opening: right after a move
  // (the jaws are held open on recovery) or while he is dizzy. Measured from the painted frames: the head sits at 160 / 150 in the
  // recovery pose (hurt) and at 150 / 45 in the stagger, where it hangs almost to the mud
  // (2026-10-26, the fairness pass: bossFair.test.ts) the open jaws reach down to a punch from the floor, and the stunned head up to one
  // from the low boardwalk by each fence, which stays dry when the river floods
  weak: { dx: 160, dy: 115, w: 160, h: 150 },
  weakStun: { dx: 150, dy: 56, w: 170, h: 112 },
  aimText: 'TOO TOUGH! HIT THE JAWS',
  arenaW: 1400,
  lair: 'croc',
  entrance: { eye: [251, 191, 36], dark: [2, 5, 12] },
  // the Moonlit Mire: stilt boardwalks over the mud, up one side and down the other, with a log swinging on ropes through the middle
  // and a rope swing to get from the first boardwalk to the second. A stair down, not up: nothing here looks like the other lairs
  perches: [
    { dx: 40, up: 85, w: 150 },
    { dx: 285, up: 170, w: 125 },
    { dx: 590, up: 120, w: 170, moving: { range: 150, speed: 1.1 } },
    { dx: 990, up: 170, w: 125 },
    { dx: 1210, up: 85, w: 150 },
  ],
  vines: [{ dx: 205, top: 330, bottom: 110 }],
  // at 35% the river floods in by each fence, warned first, and it is full of piranhas: the boardwalks and the middle stay dry
  onPhase: (phase, _b, c) => {
    if (phase !== 3) return;
    for (const dir of [1, -1] as const) {
      const edge = dir > 0 ? c.arena.left : c.arena.right;
      const h = makeHazard({
        kind: 'strip', x: edge, y: c.arena.floor - 9, floorY: c.arena.floor, w: 6, h: 18, warn: 1.8, warnMax: 1.8,
        life: 1e9, maxLife: 1e9, dmg: 1, dir, ox: edge, growTo: 210, growRate: 55, color: '#3f8f86', color2: '#10302f', look: 'flood',
      });
      c.hazards.push(h);
    }
    c.text('THE RIVER FLOODS!', c.arena.left + 300, c.arena.floor - 270, '#5eead4');
    c.shake(0.6);
  },
  moves: {
    // rears back with the jaws wide, then rolls across the whole arena. Crashing into the wall leaves him dizzy
    // (dizzy, he reels round and staggers back toward you, so a crash at the far fence is not out of reach)
    deathRoll: { ...chargeMove({ tell: 1.2, maxT: 2.3, rec: 1.0, speed: 560, stun: 2.6, text: 'DIZZY!', min: 220 }), stunStep: { speed: 200, stop: 235 } },
    // a low spinning sweep of the tail on both sides: jump it
    tailWhip: {
      tell: 0.7,
      act: 0.4,
      // the whip spins him round, and he lurches on toward you with his jaws open: the opening comes to you
      rec: 2.3,
      recStep: { speed: 340, stop: 235 },
      max: 340,
      pose: 'whip',
      tick: (b, c) => {
        b.ai!.hurt = [...bothSides(b, c, 210, 62, 0), bodyBox(b)];
      },
    },
    // slams the floor and sends mud waves both ways
    mudSurge: {
      tell: 0.95,
      act: 0.15,
      rec: 2.4,
      recStep: { speed: 340, stop: 235 },
      phase: 2,
      pose: 'slam',
      onAct: (b, c) => {
        impact(b, c, 0.7, '#7a5c2e');
        for (const d of [-1, 1] as const) {
          const w = floorWave(c, b.x + d * (b.width / 2 + 10), d, 330, '#8b6b3a', '#4a3416', true);
          w.look = 'mud';
        }
      },
    },
    // mud geysers burst up on marked spots along the bank
    geysers: {
      tell: 1.0,
      act: 0.3,
      rec: 2.4,
      recStep: { speed: 340, stop: 235 },
      phase: 2,
      pose: 'roar',
      onTell: (b, c) => {
        const xs = b.phase >= 3 ? [0, -280, 280, 560] : [0, -300, 300];
        xs.forEach((off, i) => {
          const x = Math.max(c.arena.left + 40, Math.min(c.arena.right - 40, c.px + off));
          const h = column(c, x, 1.05 + i * 0.08, 230, '#8b6b3a', '#4a3416', 0.6);
          h.look = 'mud';
        });
      },
    },
  },
};

// ───────────────────────────── 3. Shadow Prowler: night jaguar ─────────────────────────────

/**
 * The painted jaguar drawn 2.8 times its old size is 2.18 world units to a painted pixel, so every box below was measured off the frames:
 * dx is forward of the body's middle (negative = behind it) and dy is the height above the floor.
 */
/** the fights in which the moonlight hint has been said (once a fight; a retry makes a new boss) */
const prowlerHinted = new WeakSet<object>();

const PROWLER: BossDef = {
  world: 3,
  name: 'Shadow Prowler',
  // a giant: long and low, so he is not reached by climbing but by being in the right place when a spot lights up
  scale: 2.8,
  w: 390,
  h: 170,
  artDy: 0,
  speed: [70, 100, 138],
  prefer: 420,
  gap: [1.3, 0.95, 0.7],
  chain: 0.45,
  color: '#c084fc',
  color2: '#3b0764',
  // fourteen hits, two hit points a hit
  hp: 28,
  hits: 14,
  // an opening after a move takes a jab, a cross and a hook (two segments), then he pulls back; a stun in the moonlight is not capped
  openCap: 4,
  openCue: true,
  // (QA gate: a heart lost on a low ledge over his head while he faded, and one tapping beside him as a move began) his body never
  // hurts by touch: only his strikes do, each after its wind-up
  // the floor a little lower on the screen, so the top of a pounce stays under the boss bar on a phone held sideways (QA gate)
  floorAt: 0.84,
  bodyGrace: 99,
  // He has no one weak point. Where it opens depends on what he has just done, and the glow shows where: the glowing eyes after a shadow
  // step (he is right at you), the throat after the claw combo, the arched back after a pounce (jump onto it), the tail after the dash
  // (it swings round toward you), and the belly when he is stunned. The ember while he is covered sits on the head
  weak: { dx: 133, dy: 92, w: 130, h: 100 },
  weakByMove: {
    shadowStep: { dx: 133, dy: 92, w: 130, h: 100 },
    clawCombo: { dx: 45, dy: 50, w: 140, h: 100 },
    pounce: { dx: -9, dy: 148, w: 170, h: 90 },
    streak: { dx: -190, dy: 52, w: 130, h: 100 },
  },
  weakStun: { dx: 46, dy: 70, w: 190, h: 130 },
  aimText: 'TOO TOUGH! HIT THE GLOW',
  arenaW: 1500,
  lair: 'prowler',
  entrance: { eye: [150, 255, 225], dark: [1, 8, 10] },
  // the Glowcap Sinkhole: low stone shelves at each side and a high one in the middle, and a hanging liana between the middle and the right
  perches: [
    { dx: 170, up: 115, w: 250 },
    { dx: 520, up: 195, w: 230 },
    { dx: 1100, up: 115, w: 230 },
  ],
  vines: [{ dx: 900, top: 340, bottom: 110 }],
  // at 35% the glowcaps go dark: only the moon pools still shine
  onPhase: (phase, _b, c) => {
    if (phase !== 3) return;
    // (between the fighters, not by the left fence where it hugged the screen's edge)
    c.text('THE GLOWCAPS GO DARK!', (c.px + _b.x) / 2, c.arena.floor - 250, '#7dffe0');
    c.shake(0.5);
  },
  moves: {
    // a quick crouch, then a long pounce to where you were standing. From the second phase the landing sends a wave along the floor
    // (2026-10-26, QA: a double jump on the spot was hit, and standing still was not. He picks his spot as the crouch BEGINS, a moonlit
    // ring marks it (bossCues.ts), and he lands on it: getting out of the ring is the dodge, and there is time for it after a 0.8 s
    // reaction. Jumping straight up into a leaping cat still meets him: bossTells.test.ts)
    pounce: (() => {
      const m = leapMove({
        // (0.55 until QA: in the dark a pounce took two hearts unseen; the crouch now lasts long enough to read)
        tell: POUNCE.tell,
        act: POUNCE.act,
        // (the openings are timed to be reached from outside the ring: bossFair.test.ts)
        rec: 3.1,
        height: POUNCE.height,
        min: 260,
        onLand: (b, c) => {
          impact(b, c, 0.55, '#7c3aed');
          if (b.phase < 2) return;
          // the ripples start at the ring's edge after a beat, so a hero who got out of the ring sees them come and jumps them
          for (const d of [-1, 1] as const) {
            const w = floorWave(c, b.x + d * POUNCE.ring, d, b.phase >= 3 ? 360 : 280, '#a78bfa', '#3b0764', true);
            w.warn = w.warnMax = 0.3;
          }
        },
      });
      const leap = m.onAct!;
      const fly = m.tick!;
      m.tick = (b, c, dt, t) => {
        fly(b, c, dt, t);
        if (t < POUNCE.act * POUNCE.strikeFrom) b.ai!.hurt = [];
      };
      m.softBody = true;
      m.onTell = (b, c) => {
        const half = b.width / 2;
        b.ai!.d.aim = Math.max(c.arena.left + half, Math.min(c.arena.right - half, c.px));
      };
      m.onAct = (b, c) => {
        leap(b, c);
        const br = b.ai!;
        br.d.x1 = br.d.aim ?? br.d.x1;
        b.facing = br.d.x1 >= b.x ? 1 : -1;
      };
      m.guide = 'He crouches and marks a spot, then pounces on it. Get out of the ring!';
      return m;
    })(),
    // vanishes and comes out right behind you for a slash. He comes out behind you, so with a moon pool at your back the light will
    // not let him appear: he is caught, stunned and wide open
    shadowStep: {
      tell: 0.55,
      act: 0.3,
      // (2.5 until the QA gate: from a low shelf over him, by touch, the first hit came at up to 2.56 s)
      rec: 3.2,
      pose: 'fade',
      softBody: true,
      crashText: 'CAUGHT IN THE MOON!',
      stunAfter: () => 3.0,
      // the first time, say what the light is for
      onTell: (b, c) => {
        if (prowlerHinted.has(b)) return;
        prowlerHinted.add(b);
        c.text('MOONLIGHT BLOCKS HIS STEP!', c.px, c.arena.floor - 250, '#bfeaff');
      },
      tellTick: (b) => {
        const br = b.ai!;
        br.alpha = Math.max(0.08, 1 - (br.t / 0.55) * 0.95);
      },
      onAct: (b, c) => {
        const br = b.ai!;
        const half = b.width / 2;
        // behind the player, on the side away from where it was, close enough that the slash reaches
        let side = c.px >= b.x ? 1 : -1;
        const spot = (sd: number) => Math.max(c.arena.left + half, Math.min(c.arena.right - half, c.px + sd * (half + 20)));
        // against a wall the clamp would drop him on the hero: use the open side instead
        if (Math.abs(spot(side) - c.px) < half) side = -side;
        b.x = spot(side);
        b.facing = b.x > c.px ? -1 : 1;
        br.alpha = 1;
        c.debris(b.x, c.arena.floor - 20, '#7c3aed');
        if (inMoonPool(b.x, c.arena.left)) {
          br.d.crashed = 1;
          c.shake(0.6);
        }
      },
      tick: (b, c) => {
        // the slash lands a beat after he appears (0.14 s), so there is time to react to where he came out
        if (!b.ai!.d.crashed && b.ai!.t >= 0.14 && b.ai!.t < 0.3) b.ai!.hurt = [frontBox(b, c, 190, 150, 6)];
      },
    },
    // three slashes while stepping forward (four in the last phase)
    clawCombo: {
      tell: 0.5,
      act: 1.0,
      // the last slash overreaches and he stumbles on after you, throat open
      // (2.5 until the QA gate: by touch the first hit came at up to 2.43 s)
      rec: 3.1,
      recStep: { speed: 260, stop: 150 },
      max: 330,
      pose: 'bite',
      softBody: true,
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        b.x += b.facing * 80 * dt;
        const windows: Array<[number, number]> = b.phase >= 3 ? [[0.08, 0.22], [0.3, 0.44], [0.52, 0.66], [0.74, 0.9]] : [[0.1, 0.28], [0.4, 0.58], [0.7, 0.88]];
        if (windows.some(([a, z]) => t >= a && t <= z)) br.hurt = [frontBox(b, c, 190, 150, 6)];
      },
    },
    // a lightning dash from one end of the arena to the other, low enough to jump
    streak: (() => {
      // (tell 0.65 until the QA gate: the rear-up read as too quick; and his body no longer hurts over the low box below)
      const m = chargeMove({ tell: 0.8, maxT: 1.2, rec: 2.7, speed: 800, phase: 2, min: 300 });
      m.softBody = true;
      const base = m.tick!;
      m.tick = (b, c, dt, t) => {
        base(b, c, dt, t);
        // he is flat out, so the box that hurts is lower than his resting height: under the low shelves, and under a double jump
        b.ai!.hurt = [{ x: b.x - b.width / 2, y: c.arena.floor - 108, w: b.width, h: 108 }];
      };
      // he skids to a stop facing the fence he ran at, so the tail he is weak at swings out toward the middle, where you are
      // (2026-10-26, QA: a hero who jumped the dash stood at his head, the tail out of reach) he turns his back on you, wherever you are
      m.recFaceAway = true;
      // and he backs off the fence toward you, tail lashing, so a dash that ended far away still brings the tail to you
      m.recStep = { speed: 340, stop: 260 };
      return m;
    })(),
  },
};

// ───────────────────────────── 4. Sky Sovereign: harpy eagle ─────────────────────────────

/**
 * The painted eagle drawn 2.3 times its old size is 1.96 world units to a painted pixel (wings spread she is nearly 500 wide). Weak spots
 * are measured off the frames of the pose she holds in each opening: dx is forward of the body's middle and dy the height above her feet
 * (her feet hang `air` above the floor, which weakRect adds).
 *
 * World 4's finale: the fight uses what the world taught. The rock pillars (sovereignFight.ts) are the main way to open her up: stand by
 * one, step off the red mark, and her dive slams into the rock. Two slams break a pillar; its top falls in a shower of stones (grit
 * first) and a stump is left. Her screech shoves Pokey (a pillar is cover, crouching helps), her wingbeats blow a gust lane with the
 * chimes ringing first (the leaf rides it), and at 35% the storm breaks.
 */

/** her dive or swoop has hit a standing pillar: the rock cracks or breaks, she is stunned beside it, and Dot says what to do */
function skySlam(b: BossEntity, c: BossCtx, p: SkyPillar, markX: number) {
  const br = b.ai!;
  const side = slamSide(p, markX, br.d.fromX ?? b.x);
  const broke = slamPillar(p);
  br.d.crashed = 1;
  br.d.slam = 1;
  br.d.slamStun = broke ? PILLAR.stunBreak : PILLAR.stun;
  const half = b.width / 2;
  br.d.restX = Math.max(c.arena.left + half, Math.min(c.arena.right - half, p.x + side * PILLAR.rest));
  br.d.restFace = -side;
  b.facing = side > 0 ? -1 : 1;
  br.air = Math.min(br.air, PILLAR.h);
  for (const q of c.pillars ?? []) q.aimed = false;
  // stone bursts from the rock where the mark was: standing on the mark (or on the rock's top) is what gets him hurt
  // (a short burst, a little inside the mark's edge: a hero who has stepped off it and comes straight back for her head is not caught)
  const lo = Math.min(markX - 62, p.x - p.w / 2);
  const hi = Math.max(markX + 62, p.x + p.w / 2);
  const shards = makeHazard({ kind: 'column', x: (lo + hi) / 2, y: c.arena.floor - (PILLAR.h + 70) / 2, floorY: c.arena.floor, w: hi - lo, h: PILLAR.h + 70, life: 0.14, maxLife: 0.14, color: '#a8a29e', color2: '#44403c' });
  shards.look = 'shards';
  c.hazards.push(shards);
  c.shake(broke ? 1 : 0.8);
  c.thud(true);
  c.debris(p.x, c.arena.floor - PILLAR.h * 0.7, '#a8a29e');
  c.text(broke ? 'THE ROCK BREAKS!' : 'INTO THE ROCK!', p.x, c.arena.floor - PILLAR.h - 120, '#fde047');
  c.onPillar?.(p, broke, side);
  if (broke) {
    for (const r of rockShower(p, side, c.arena, b.phase)) {
      const d = dropAt(c, r.x, r.warn, 44, '#a8a29e', '#57534e');
      d.look = 'rock';
    }
  }
  // Dot: the first slam is taught; then the break (stones coming), the leaf onto her back, and the last rock
  const g = c.guide;
  if (g) {
    if (!standing(c.pillars).length) g('slam:last', 'That was the last rock. Now when she dives, she hits the ground!');
    else if (broke) g('slam:break', 'The rock broke! Watch for the grit, stones are coming down!');
    if (!g('slam:first', 'She hit the rock! Her head, quick, hit her head!')) g('slam:leaf', 'From up on a rock, hold jump and float down onto her back!');
  }
}

/** after a slam she slides off the rock and lies beside it, her head toward it */
const skyStunTick = (b: BossEntity, _c: BossCtx, dt: number) => {
  const br = b.ai!;
  if (br.d.restX === undefined) return;
  b.x += (br.d.restX - b.x) * Math.min(1, dt * 9);
  b.facing = br.d.restFace > 0 ? 1 : -1;
};

/** a red mark on the floor that follows him for a moment, then locks */
const skyMark = (c: BossCtx, b: BossEntity, w: number, warn: number) => {
  const h = makeHazard({ kind: 'mark', x: c.px, y: c.arena.floor - 3, floorY: c.arena.floor, w, h: 6, warn, warnMax: warn, life: warn + 0.15, maxLife: warn + 0.15, color: '#ef4444', color2: '#7f1d1d' });
  c.hazards.push(h);
  addMark(c, b, h, 0);
  return h;
};

/** the top of a standing rock under her feet (she lands on it rather than sinking into it), or 0 */
const skyGround = (b: BossEntity, c: BossCtx) => {
  let g = 0;
  for (const p of standing(c.pillars)) if (Math.abs(b.x - p.x) < p.w / 2 + 70) g = Math.max(g, p.h);
  return g;
};

/** her low hover in an opening (bossAI settles a flyer to 35% of her hover), and onto the rock under her if there is one */
export const SKY_LOW = 150 * 0.35;
/** in the opening after a move she settles there quickly, so the glowing spot holds still while he gets to it */
const skySettle = (b: BossEntity, c: BossCtx, dt: number) => {
  const br = b.ai!;
  br.air += (Math.max(skyGround(b, c), SKY_LOW) - br.air) * Math.min(1, dt * 6);
  if (br.air < 1) br.air = 0;
};

/**
 * In an opening she comes to him (Matt's rule: an opening has to be reachable from wherever he took cover, by a rock or back at the
 * chimes): she drifts toward him at SKY_COME.speed until her middle is SKY_COME.stop from him. She may fly over a rock on the way but
 * never stops over one (her weak spot would sit up on the rock top): then she stops short of it. Returns her new x.
 */
export const SKY_COME = { speed: 240, stop: 150 } as const;
export function skyApproach(x: number, c: BossCtx, dt: number): number {
  const dir = c.px >= x ? 1 : -1;
  let to = c.px - dir * SKY_COME.stop;
  // (she may fly over a rock on the way, but she never stops over one: short of it, on her side)
  for (const p of standing(c.pillars)) if (Math.abs(to - p.x) < p.w / 2 + 70) to = p.x - dir * (p.w / 2 + 70);
  if ((to - x) * dir <= 0) return x;
  return x + dir * Math.min(Math.abs(to - x), SKY_COME.speed * dt);
}
const skyOpening = (b: BossEntity, c: BossCtx, dt: number) => {
  skySettle(b, c, dt);
  b.x = skyApproach(b.x, c, dt);
};

/** how long into the dive's wind-up the mark follows him before it locks */
export const DIVE_LOCK = 0.45;
/** the beak lunge: she commits to where he is this far into its wind-up, and it reaches this high (a double jump clears it) */
export const RAKE_COMMIT = 0.42;
export const RAKE_TOP = 120;
export const RAKE_PAST = 40;
/** her feathers fly level this high above the floor (their middle; 14 tall): over a crouched hero (24 tall), into a standing one (38) */
export const FEATHER_LANE = 34;
export const FEATHER_GAP = 0.1;
/** the sky sweep pulls up this far past him */
export const SWEEP_PAST = 300;

/** where she comes down after a screech: off the rock she screamed from (on his side of it), or where she is; never on a rock */
export function screechLanding(b: BossEntity, c: BossCtx): number {
  const toward = c.px >= b.x ? 1 : -1;
  const rocks = standing(c.pillars);
  const clear = (p: SkyPillar) => p.w / 2 + 76;
  let x = b.x;
  const under = rocks.find((p) => Math.abs(x - p.x) < clear(p));
  if (under) x = under.x + toward * clear(under);
  const other = rocks.find((p) => Math.abs(x - p.x) < clear(p));
  if (other) x = other.x + (x >= other.x ? 1 : -1) * clear(other);
  const half = b.width / 2;
  return Math.max(c.arena.left + half, Math.min(c.arena.right - half, x));
}

/** light up the pillar the mark is on, so the lure reads */
const aimPillars = (c: BossCtx, x: number) => {
  const hit = pillarFor(c.pillars, x);
  for (const q of c.pillars ?? []) q.aimed = q === hit;
};

const SOVEREIGN: BossDef = {
  world: 4,
  name: 'Sky Sovereign',
  // a giant of the air: she hangs above the arena, so the fight is about where you stand under her and luring her into the rocks
  scale: 2.3,
  w: 250,
  h: 190,
  artDy: 0,
  speed: [70, 95, 125],
  prefer: 330,
  hover: 150,
  gap: [1.5, 1.15, 0.85],
  chain: 0.3,
  color: '#f59e0b',
  color2: '#78350f',
  // sixteen hits, two hit points a hit
  hp: 32,
  hits: 16,
  // She has no one weak point: it opens where her last move left her, and the glow shows where. Every opening is long enough to get to
  // (Matt, 2026-10-26: reach it from where you dodged, plus 0.8 s to react and 0.6 s to hit; sovereign.test.ts checks every one with the
  // real run and jump). Slammed into a rock (or, once the rocks are gone, crashed on the floor) her head lies low (weakStun) and her back
  // can be landed on (stompSpot); after a screech she comes down hoarse, her head low. The white chest after the feather volley (wings
  // flung wide), the talons after the sweep, the back between her wings after the snatch, the head, low, after the beak lunge, and her
  // heaving breast after the gust. The ember while she is covered sits on the head
  weak: { dx: 40, dy: 150, w: 120, h: 110 },
  weakByMove: {
    featherVolley: { dx: 16, dy: 102, w: 120, h: 120 },
    skySweep: { dx: 68, dy: 24, w: 150, h: 100 },
    snatch: { dx: -20, dy: 140, w: 160, h: 100 },
    talonRake: { dx: 133, dy: 102, w: 130, h: 120 },
    screech: { dx: 133, dy: 102, w: 130, h: 120 },
    wingGust: { dx: 56, dy: 64, w: 140, h: 100 },
  },
  weakStun: { dx: 94, dy: 102, w: 130, h: 120 },
  // (not after a dive that pulls up on open floor: the rocks are the way in)
  openAfter: ['featherVolley', 'skySweep', 'snatch', 'talonRake', 'screech', 'wingGust'],
  // each slam is one clear win: two hits on the head, or the leaf onto her back (so the rocks carry most of the fight, not all of it)
  stunCap: 4,
  // (and the opening after any other move takes two hits too: Matt, 2026-10-26, fight length is down to skill, not grinding)
  openCap: 4,
  // her humped back in the stunned crouch: land on it from a rock or a ledge
  stompSpot: { dx: -45, dy: 168, w: 170, h: 56 },
  // a hero hitting her head as she gets up is standing in her: her body hurts only 0.6 s into her next wind-up (a readable warning)
  bodyGrace: 0.6,
  aimText: 'TOO TOUGH! HIT THE GLOW',
  arenaW: 1500,
  lair: 'sovereign',
  entrance: { eye: [255, 196, 80], dark: [8, 6, 26] },
  pillars: true,
  // she starts between the middle rock and the right one, where her wings clear both
  startDx: 1030,
  frameAir: true,
  floorAt: 0.8,
  opener: 'diveBomb',
  groundAt: skyGround,
  // the Cloud Aerie: three rock pillars (sovereignFight.ts, built by the stage), a high ledge between the first two and a rope
  perches: [{ dx: 470, up: 200, w: 220 }],
  vines: [{ dx: 1030, top: 340, bottom: 120 }],
  guide: {
    start: 'Pokey, see those rocks? She can\'t see them when she dives. Use them.',
    2: 'She\'s mad now. Listen for the chimes!',
    3: 'The storm\'s coming in! Keep away from the edges!',
  },
  ending: { text: 'SHE\'S DONE FIGHTING', line: 'Pokey. That\'s enough. She\'s done.' },
  // at 35% the storm breaks: thunderheads roll in over each cliff edge (warned first). The rocks and the open middle stay clear, and her
  // gusts blow harder and longer (GUST)
  onPhase: (phase, _b, c) => {
    if (phase !== 3) return;
    for (const dir of [1, -1] as const) {
      const edge = dir > 0 ? c.arena.left : c.arena.right;
      const h = makeHazard({
        kind: 'strip', x: edge, y: c.arena.floor - 9, floorY: c.arena.floor, w: 6, h: 18, warn: 1.8, warnMax: 1.8,
        life: 1e9, maxLife: 1e9, dmg: 1, dir, ox: edge, growTo: 170, growRate: 50, color: '#8b7bd8', color2: '#2e2254', look: 'storm',
      });
      c.hazards.push(h);
    }
    c.text('THE STORM BREAKS!', c.arena.left + 330, c.arena.floor - 330, '#c4b5fd');
    c.shake(0.55);
  },
  moves: {
    // she climbs over him, a red mark follows him and locks, and she falls on it. With the mark on a rock she slams into the rock (stunned,
    // head open, the rock cracks); on open floor she only scrapes the ground and pulls up, until every rock is down: then she crashes
    diveBomb: {
      tell: 1.2,
      act: 1.3,
      rec: 0.8,
      weight: 1.6,
      pose: 'fly',
      // only her talons hurt as she comes down (the mark's width), not the whole spread of her wings
      softBody: true,
      guide: 'Stand by a rock. When the red mark\'s on you, step off it!',
      stunAfter: (b) => b.ai!.d.slamStun ?? PILLAR.crash,
      stunTick: skyStunTick,
      crashText: (b) => (b.ai!.d.slam ? '' : 'GROUNDED!'),
      onTell: (b, c) => {
        skyMark(c, b, 150, 1.2);
      },
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        // she climbs (not out of the camera's reach: it pulls back for her, frameAir) and flies over the mark as it follows him
        br.air += (250 - br.air) * Math.min(1, dt * 4);
        // the mark locks early (DIVE_LOCK) and says GET OFF!, leaving three quarters of a second to step off it
        trackMark(b, c, br.d.h0, dt, DIVE_LOCK, 320);
        const h = c.hazards.find((x) => x.id === br.d.h0);
        if (h) b.x += Math.max(-540 * dt, Math.min(540 * dt, h.x - b.x));
        b.facing = (h ? h.x : c.px) >= b.x ? 1 : -1;
        if (h && br.t > DIVE_LOCK) {
          aimPillars(c, h.x);
          h.locked = true;
        }
      },
      onAct: (b, c) => {
        const br = b.ai!;
        const h = c.hazards.find((x) => x.id === br.d.h0);
        br.d.tx = h ? h.x : c.px;
        br.d.fromX = b.x;
        const p = pillarFor(c.pillars, br.d.tx);
        br.d.pi = p ? (c.pillars ?? []).indexOf(p) : -1;
        aimPillars(c, br.d.tx);
      },
      tick: (b, c, dt) => {
        const br = b.ai!;
        if (br.d.crashed) return;
        if (br.d.pulled) {
          // a miss on open floor: back up to her height, nothing open
          br.air = Math.min(b.ai!.air + 520 * dt, 150);
          if (br.air >= 150) br.t = Math.max(br.t, 1.3);
          return;
        }
        const p = br.d.pi >= 0 ? (c.pillars ?? [])[br.d.pi] : undefined;
        const bottom = p && !p.broken ? p.h : 0;
        const dx = br.d.tx - b.x;
        // she is over the mark by the time she lands, however far off she started
        const need = Math.abs(dx) / Math.max(0.05, (br.air - bottom) / 1300);
        const sp = Math.max(760, need) * dt;
        b.x += Math.max(-sp, Math.min(sp, dx));
        br.air -= 1300 * dt;
        b.facing = dx >= 0 ? 1 : -1;
        br.hurt = [{ x: b.x - 70, y: c.arena.floor - br.air - 70, w: 140, h: 90 }];
        if (p && !p.broken && br.air <= p.h + 8) {
          skySlam(b, c, p, br.d.tx);
          return;
        }
        if (br.air > 0) return;
        br.air = 0;
        if (standing(c.pillars).length) {
          // the rocks are the way in: on open floor her talons only scrape the ground
          br.d.pulled = 1;
          c.shake(0.4);
          c.thud(false);
          c.debris(b.x, c.arena.floor - 8, '#a16207');
          c.text('SHE PULLS UP!', b.x, c.arena.floor - 250, '#e2e8f0');
          c.guide?.('dive:miss', 'Not out in the open, Pokey. By a rock!');
          for (const q of c.pillars ?? []) q.aimed = false;
          return;
        }
        // (no shock waves: the opening is for getting to her head, not for jumping over things)
        br.d.crashed = 1;
        impact(b, c, 1.0, '#a16207');
      },
      onEnd: (_b, c) => {
        for (const q of c.pillars ?? []) q.aimed = false;
      },
    },
    // a stream of razor feathers skimming the floor. She drops low and flings her wings wide to throw them, and that leaves her chest
    // open. They fly at FEATHER_LANE: crouch under them, hop over them, or get behind a rock (it stops them)
    featherVolley: {
      tell: 0.85,
      act: 0.7,
      rec: 3.1,
      min: 180,
      // (near enough that the opening it leaves can be reached: sovereign.test.ts)
      max: 440,
      pose: 'spit',
      guide: 'Feathers! Crouch down, or duck behind a rock!',
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        // down to skim the floor, so the feathers come from her wings at his height
        br.air += (Math.max(skyGround(b, c) + 10, 40) - br.air) * Math.min(1, dt * 5);
      },
      onAct: (b) => {
        b.ai!.d.n = b.phase >= 2 ? 6 : 4;
        b.ai!.d.dir = b.facing;
      },
      tick: (b, c) => {
        const br = b.ai!;
        b.facing = br.d.dir > 0 ? 1 : -1;
        // one feather every FEATHER_GAP s, all along the lane
        while ((br.d.fired ?? 0) < br.d.n && br.t >= (br.d.fired ?? 0) * FEATHER_GAP) {
          br.d.fired = (br.d.fired ?? 0) + 1;
          const h = bolt(c, b.x + b.facing * 90, c.arena.floor - FEATHER_LANE, b.facing, 360, '#fde68a', '#92400e', 14);
          h.look = 'feather';
        }
      },
      recTick: skyOpening,
    },
    // she drops to the floor beside you and lunges with her beak. The head is low and open when it is over. She stops short of a rock
    talonRake: {
      // (long enough after she commits to back out of the bite: the lunge reaches 150 past her beak)
      tell: 1.0,
      act: 0.55,
      rec: 2.5,
      min: 230,
      max: 480,
      pose: 'lunge',
      guide: 'She\'s landing to bite! Jump out of the way!',
      // (not from over a rock: she lands on the floor for this one, and only with open floor between them, so she ends by him)
      when: (b, c) => skyGround(b, c) === 0 && !standing(c.pillars).some((p) => (p.x - b.x) * (c.px - p.x) > 0),
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        br.air += (0 - br.air) * Math.min(1, dt * 5);
        if (br.air < 1) br.air = 0;
        // she picks her spot halfway through the wind-up (when she stops turning to follow him): backing off after that is a dodge
        if (br.d.aimX === undefined && br.t >= RAKE_COMMIT) br.d.aimX = c.px;
      },
      onAct: (b, c) => {
        const br = b.ai!;
        br.d.dir = b.facing;
        // how far she goes: the beak ends RAKE_PAST beyond where she aimed (a stride back clears it), never through the fence or a rock
        const tip = b.width / 2 - 14 + 150;
        let go = Math.max(0, Math.min(330, Math.abs((br.d.aimX ?? c.px) - b.x) - tip + RAKE_PAST));
        for (const p of standing(c.pillars)) {
          const ahead = (p.x - b.x) * br.d.dir;
          if (ahead > 0) go = Math.min(go, Math.max(0, ahead - p.w / 2 - b.width / 2 - 6));
        }
        br.d.go = go;
        br.d.x0 = b.x;
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        const u = Math.min(1, t / 0.36);
        b.x = br.d.x0 + br.d.dir * br.d.go * (1 - (1 - u) * (1 - u));
        br.air = 0;
        // (the beak comes in low: a double jump clears it)
        // (the beak reaches out as she lunges, 150 past her at the end of it: not the whole length on the first frame, which caught a
        // hero who had backed off out of reach)
        // (and it snaps back once the lunge is done: a hero who jumped it is not caught coming down)
        br.hurt = u < 1 ? [{ ...bodyBox(b), h: RAKE_TOP, y: c.arena.floor - RAKE_TOP }, frontBox(b, c, 40 + 110 * u, RAKE_TOP, 6)] : [bodyBox(b)];
        if (u >= 1 && !br.d.slammed) {
          br.d.slammed = 1;
          c.shake(0.45);
          c.thud(false);
          c.debris(b.x + br.d.dir * (b.width / 2 + 60), c.arena.floor - 10, '#a16207');
        }
      },
      recTick: skyOpening,
    },
    // she rears back (crest up, the air shimmering at her beak) and screeches: a wave rolls out the way she faces and shoves him hard
    // (sovereignFight.ts SCREECH). Behind a rock he is in cover; crouched on the ground he is pushed much less. Near a rock she lands on
    // top of it to scream
    screech: {
      tell: 1.0,
      act: 0.9,
      rec: 2.9,
      // (close enough that the opening after it can be reached: sovereign.test.ts)
      min: 160,
      max: 420,
      pose: 'roar',
      interruptible: false,
      guide: 'She\'s going to screech! Get behind a rock, or crouch down!',
      onTell: (b, c) => {
        const br = b.ai!;
        // a rock close by: she lands on it. Otherwise she hovers low
        let perch: SkyPillar | null = null;
        for (const p of standing(c.pillars)) if (Math.abs(p.x - b.x) < 170 && (!perch || Math.abs(p.x - b.x) < Math.abs(perch.x - b.x))) perch = p;
        br.d.perchX = perch ? perch.x : b.x;
        br.d.perchAir = perch ? perch.h : 105;
        br.d.perched = perch ? 1 : 0;
      },
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        b.x += (br.d.perchX - b.x) * Math.min(1, dt * 5);
        br.air += (br.d.perchAir - br.air) * Math.min(1, dt * 6);
      },
      onAct: (b, c) => {
        const br = b.ai!;
        const dir = b.facing;
        const beak = b.x + dir * screechBeak(!!br.d.perched).fwd;
        const h = makeHazard({
          kind: 'push', x: beak, y: c.arena.floor - SCREECH.top / 2, floorY: c.arena.floor, w: 70, h: SCREECH.top, vx: dir * SCREECH.speed,
          life: SCREECH.range / SCREECH.speed, maxLife: SCREECH.range / SCREECH.speed, dmg: 0, dir, src: beak, color: '#e0f2fe', color2: '#7dd3fc',
        });
        h.look = 'screech';
        c.hazards.push(h);
        br.d.dir = dir;
        c.shake(0.5);
        c.roar();
      },
      tick: (b) => {
        const br = b.ai!;
        b.facing = br.d.dir > 0 ? 1 : -1;
        br.air = br.d.perchAir;
      },
      // screamed hoarse: she comes down to the floor (off the rock, toward him) with her head low, and that is the opening
      onEnd: (b, c) => {
        const br = b.ai!;
        br.d.landX = screechLanding(b, c);
        c.text('SHE\'S HOARSE!', b.x, c.arena.floor - 300, '#fde047');
        c.guide?.('screech:open', 'She screamed herself hoarse! Get her head while it\'s down!');
      },
      recTick: (b, c, dt) => {
        const br = b.ai!;
        // down off the rock first, then she staggers on toward him (skyApproach)
        if (br.t > 0.4) br.d.landX = skyApproach(br.d.landX, c, dt);
        b.x += (br.d.landX - b.x) * Math.min(1, dt * 7);
        br.air += (skyGround(b, c) - br.air) * Math.min(1, dt * 7);
        if (br.air < 1) br.air = 0;
        b.facing = c.px >= b.x ? 1 : -1;
      },
    },
    // a long, high pass over him, her talons raking the height of the ledges and the rock tops. Stay on the floor
    skySweep: {
      tell: 0.85,
      act: 1.5,
      rec: 2.5,
      phase: 2,
      pose: 'fly',
      guide: 'Stay down on the ground! She\'s raking the ledges!',
      onAct: (b, c) => {
        const br = b.ai!;
        // over him and on past him (so the opening after it is near where he stood, not the far side of the arena)
        br.d.dir = c.px >= b.x ? 1 : -1;
        b.facing = br.d.dir > 0 ? 1 : -1;
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        // she skims just over the rock tops: clear of a hero standing on the floor, but not one in the air or on a ledge or a rock
        br.air += (150 - br.air) * Math.min(1, dt * 8);
        b.x += br.d.dir * 640 * dt;
        br.hurt = [bodyBox(b)];
        const half = b.width / 2;
        if (b.x <= c.arena.left + half + 2 || b.x >= c.arena.right - half - 2) br.t = 1.5;
        // she pulls up once she is SWEEP_PAST beyond him
        if (t > 0.3 && (b.x - c.px) * br.d.dir >= SWEEP_PAST) br.t = 1.5;
      },
      recTick: skyOpening,
    },
    // a swoop onto the marked spot with her talons out, which ends with her pulling up again: her back is what is open. Low by a rock,
    // she clips it, the same as a dive
    snatch: {
      // (the mark locks as early as the dive's, leaving as long to step off it)
      tell: 1.2,
      act: 0.7,
      rec: 2.2,
      phase: 2,
      min: 200,
      pose: 'fly',
      guide: 'Another red mark! A rock works on this one too!',
      // only her talons hurt as she swoops (the mark's width), as in the dive
      softBody: true,
      stunAfter: (b) => b.ai!.d.slamStun ?? 0,
      stunTick: skyStunTick,
      crashText: '',
      onTell: (b, c) => {
        skyMark(c, b, 130, 1.2);
      },
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        br.air += (230 - br.air) * Math.min(1, dt * 3);
        trackMark(b, c, br.d.h0, dt, DIVE_LOCK, 300);
        const h = c.hazards.find((x) => x.id === br.d.h0);
        if (h && br.t > DIVE_LOCK) {
          aimPillars(c, h.x);
          h.locked = true;
        }
      },
      onAct: (b, c) => {
        const br = b.ai!;
        const h = c.hazards.find((x) => x.id === br.d.h0);
        br.d.tx = h ? h.x : c.px;
        br.d.x0 = b.x;
        br.d.fromX = b.x;
        br.d.a0 = br.air;
        b.facing = br.d.tx >= b.x ? 1 : -1;
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        if (br.d.crashed) return;
        const u = Math.min(1, t / 0.7);
        // down fast, a beat at the bottom, and up again
        const reach = Math.min(1, u / 0.5);
        b.x = br.d.x0 + (br.d.tx - br.d.x0) * (reach * reach * (3 - 2 * reach));
        br.air = u < 0.5 ? br.d.a0 + (6 - br.d.a0) * (u / 0.5) : 6 + (150 - 6) * ((u - 0.5) / 0.5);
        // only her talons hurt (the mark's width), as in the dive: stepping off the mark is the dodge, not outrunning her wings
        br.hurt = [{ x: b.x - 65, y: c.arena.floor - br.air - 90, w: 130, h: 90 }];
        if (u < 0.55) {
          const p = pillarFor(c.pillars, br.d.tx);
          if (p && Math.abs(b.x - p.x) < PILLAR.reach && br.air <= p.h + 8) skySlam(b, c, p, br.d.tx);
        }
      },
      onEnd: (_b, c) => {
        for (const q of c.pillars ?? []) q.aimed = false;
      },
      recTick: skyOpening,
    },
    // her wingbeats blow a gust lane down the arena (the chimes ring first): it pushes him away from her, rock is cover, and the leaf
    // rides it a long way. From the storm it blows harder and longer, and in the last phase two feathers ride it (duck the high one)
    wingGust: {
      tell: 1.1,
      act: 2.4,
      rec: 3.4,
      phase: 2,
      min: 160,
      max: 420,
      pose: 'roar',
      interruptible: false,
      guide: 'Hear the chimes? Wind\'s coming. Hold jump and ride it on your leaf!',
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        br.air += (Math.max(120, skyGround(b, c) + 10) - br.air) * Math.min(1, dt * 4);
        br.d.low = Math.max(120, skyGround(b, c) + 10);
      },
      onAct: (b, c) => {
        const br = b.ai!;
        const dir = b.facing;
        const last = GUST.last[Math.max(0, Math.min(2, b.phase - 1))];
        br.d.dir = dir;
        br.d.last = last;
        const mid = (c.arena.left + c.arena.right) / 2;
        const h = makeHazard({
          kind: 'push', x: mid, y: c.arena.floor - GUST.top / 2, floorY: c.arena.floor, w: c.arena.right - c.arena.left, h: GUST.top, vx: 0,
          life: last, maxLife: last, dmg: 0, dir, src: b.x, color: '#e0f2fe', color2: '#99f6e4',
        });
        h.look = 'gust';
        c.hazards.push(h);
        if (b.phase >= 3) {
          for (const [k, up] of [[0, 34], [1, 96]] as const) {
            const f = bolt(c, b.x + dir * 140, c.arena.floor - up, dir, 300, '#fde68a', '#92400e', 20);
            f.x -= dir * k * 220;
            f.look = 'feather';
          }
        }
      },
      tick: (b, _c, _dt, t) => {
        const br = b.ai!;
        b.facing = br.d.dir > 0 ? 1 : -1;
        br.air = (br.d.low ?? 120) + Math.sin(t * 14) * 6;
        if (t >= br.d.last) br.t = Math.max(br.t, 2.4);
      },
      recTick: skyOpening,
    },
  },
};

// ───────────────────────────── 5. Tarantula Queen ─────────────────────────────

/**
 * The painted queen drawn 2.2 times her old size is 1.98 world units to a painted pixel, so her idle is nearly 400 wide. Weak spots are
 * measured off the frame she holds in each opening: dx is forward of the body's middle (negative is behind her) and dy the height above
 * her feet at the middle of the spot.
 */
const QUEEN: BossDef = {
  world: 5,
  name: 'Tarantula Queen',
  // a giant of the hollow: low and wide, so the fight is about where her legs and her silk reach
  scale: 2.2,
  w: 330,
  h: 170,
  artDy: 0,
  speed: [58, 78, 108],
  prefer: 340,
  gap: [1.3, 1.0, 0.75],
  chain: 0.3,
  color: '#e5e7eb',
  color2: '#4b5563',
  // eighteen hits, two hit points a hit
  hp: 36,
  hits: 18,
  // A different part of her opens after each move, and the glow shows which: the swollen abdomen after a web shot, the egg sac under her
  // after she calls the brood, the fangs after a pounce, the tip of the abdomen after a stomp, the eyes after the venom blast, the
  // raised chest after the web curtain and the back of the carapace after the cocoons. The ember while she is covered sits on the back
  weak: { dx: 10, dy: 112, w: 150, h: 100 },
  weakByMove: {
    webShot: { dx: -48, dy: 96, w: 150, h: 110 },
    callBrood: { dx: 0, dy: 36, w: 180, h: 72 },
    pounceBite: { dx: 135, dy: 50, w: 130, h: 90 },
    legStomp: { dx: -85, dy: 76, w: 140, h: 100 },
    venomBlast: { dx: 56, dy: 78, w: 120, h: 100 },
    webCurtain: { dx: 72, dy: 126, w: 140, h: 110 },
    cocoonDrop: { dx: -20, dy: 132, w: 150, h: 100 },
  },
  weakStun: { dx: 108, dy: 64, w: 130, h: 100 },
  aimText: 'TOO TOUGH! HIT THE GLOW',
  arenaW: 1600,
  lair: 'queen',
  entrance: { eye: [255, 90, 80], dark: [3, 8, 6] },
  // the Silk Hollow: a low branch at each end, a sling that drifts across the middle and a silk rope hanging from the roof
  perches: [
    { dx: 190, up: 105, w: 250 },
    { dx: 600, up: 195, w: 230, moving: { range: 100, speed: 0.8 } },
    { dx: 1150, up: 105, w: 250 },
  ],
  vines: [{ dx: 880, top: 350, bottom: 110 }],
  // at 35% the brood hatches: spiderlings pour out of the egg sacs at both ends
  onPhase: (phase, _b, c) => {
    if (phase !== 3) return;
    const lo = c.arena.left + 60;
    const hi = c.arena.right - 60;
    for (const x of [lo + 90, hi - 90]) c.spawnMinion('spider', x, c.arena.floor - 20);
    c.text('THE BROOD HATCHES!', c.arena.left + 330, c.arena.floor - 300, '#fca5a5');
    c.shake(0.55);
  },
  moves: {
    // a sticky shot that slows you for a few seconds
    webShot: {
      tell: 0.6,
      act: 0.25,
      rec: 1.1,
      min: 150,
      pose: 'spit',
      onAct: (b, c) => {
        const h = lob(c, b.x + b.facing * 150, c.arena.floor - 100, c.px, 0.7, { kind: 'web', eff: 'slow', dmg: 0, color: '#f8fafc', color2: '#94a3b8', w: 44, h: 44 });
        h.look = 'web';
      },
    },
    // calls spiderlings down from the roof of the hollow (or spits if the nest is already full)
    callBrood: {
      tell: 0.9,
      act: 0.2,
      rec: 1.4,
      pose: 'roar',
      onAct: (b, c) => {
        if (c.minionsAlive >= 3) {
          lob(c, b.x + b.facing * 150, c.arena.floor - 100, c.px, 0.7, { kind: 'web', eff: 'slow', dmg: 0, color: '#f8fafc', color2: '#94a3b8', w: 44, h: 44 }).look = 'web';
          return;
        }
        // never on top of the hero: they drop in front of and behind, a clear 150 px off (a spawn on the hero was an unavoidable hit)
        let room = 3 - c.minionsAlive;
        for (const off of [-150, 150, -300, 300]) {
          if (room <= 0) break;
          const x = Math.max(c.arena.left + 40, Math.min(c.arena.right - 40, c.px + off));
          if (Math.abs(x - c.px) < 110) continue;
          c.spawnMinion('spider', x, c.arena.floor - 20);
          room--;
        }
        c.shake(0.3);
      },
    },
    // springs across the floor and bites where it lands
    pounceBite: leapMove({
      tell: 0.55,
      act: 0.6,
      rec: 1.1,
      height: 150,
      min: 160,
      max: 560,
      onLand: (b, c) => {
        impact(b, c, 0.5, '#9ca3af');
        b.ai!.d.bite = 1;
      },
    }),
    // rears up and stamps her front legs: a short, low sweep of legs both sides and a wave along the floor each way
    legStomp: {
      tell: 0.7,
      act: 0.5,
      rec: 1.3,
      max: 330,
      pose: 'slam',
      onAct: (b, c) => {
        impact(b, c, 0.55, '#9ca3af');
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * (b.width / 2 - 20), d, 300, '#d1d5db', '#4b5563');
      },
      tick: (b, c, dt, t) => {
        // the legs are only a danger as they come down
        b.ai!.hurt = t < 0.28 ? [bodyBox(b), ...bothSides(b, c, 130, 80, 0)] : [bodyBox(b)];
      },
    },
    // a jet of venom straight out of her mouth along the floor: a warning band first, then the blast. Jump it
    venomBlast: {
      tell: 0.75,
      act: 0.7,
      rec: 1.3,
      phase: 2,
      min: 120,
      pose: 'spit',
      onTell: (b, c) => {
        const h = beam(c, b, 640, 40, 50, 0.75, 0.7, '#a3e635', '#3f6212');
        h.look = 'venom';
        b.ai!.d.h0 = h.id;
      },
    },
    // strands of web rise (marked first) either side of where you stand: a gap in the middle stays open
    webCurtain: {
      tell: 1.0,
      act: 0.3,
      rec: 1.4,
      phase: 2,
      pose: 'roar',
      onAct: (b, c) => {
        const offs = b.phase >= 3 ? [-380, -230, -90, 90, 230, 380] : [-300, -140, 140, 300];
        for (const off of offs) {
          const x = Math.max(c.arena.left + 60, Math.min(c.arena.right - 60, c.px + off));
          const h = column(c, x, 0.8, 200, '#f8fafc', '#94a3b8', 1.8);
          h.w = 38;
          h.look = 'web';
        }
        c.shake(0.35);
      },
    },
    // cocoons fall from the roof of the hollow on marked spots, leaving a clear lane around where you stand
    cocoonDrop: {
      tell: 0.9,
      act: 0.4,
      rec: 1.3,
      phase: 3,
      pose: 'roar',
      onAct: (b, c) => {
        const offs = [-330, -180, 190, 340, 520, -520];
        for (let i = 0; i < offs.length; i++) {
          const x = Math.max(c.arena.left + 40, Math.min(c.arena.right - 40, c.px + offs[i]));
          if (Math.abs(x - c.px) < 120) continue;
          dropAt(c, x, 0.9 + (i % 3) * 0.18, 46, '#e5e7eb', '#6b7280').look = 'cocoon';
        }
        c.shake(0.3);
      },
    },
  },
};

// ───────────────────────────── 6. Marsh Reaver: the spear-wielding giant otter ─────────────────────────────

/**
 * The painted otter drawn 1.9 times his old size is 2.28 world units to a painted pixel, so he stands about 240 tall. Weak spots are
 * measured off the frame he holds in each opening: dx is forward of the body's middle (negative is behind him) and dy the height above
 * his feet at the middle of the spot.
 */
const REAVER: BossDef = {
  world: 6,
  name: 'Marsh Reaver',
  // a giant of the blackwater: he stands head and shoulders over the dock, with a spear as long as a boat
  scale: 1.9,
  w: 200,
  h: 236,
  artDy: 0,
  speed: [52, 72, 100],
  prefer: 330,
  gap: [1.4, 1.05, 0.8],
  chain: 0.3,
  color: '#7dd3fc',
  color2: '#0c4a6e',
  // twenty hits, two hit points a hit
  hp: 40,
  hits: 20,
  // A different part of him opens after each move, and the glow shows which: the hump of his back after the vault, the neck after the
  // thrust, the head down by the mud after the sling, the head thrown back after the war cry, the flank after the low sweep and the face
  // after the high swipe. The ember while he is covered sits on the chest
  weak: { dx: 0, dy: 150, w: 130, h: 120 },
  weakByMove: {
    vaultSmash: { dx: -64, dy: 93, w: 140, h: 110 },
    spearThrust: { dx: -34, dy: 119, w: 120, h: 110 },
    mudSling: { dx: -30, dy: 89, w: 120, h: 100 },
    warCry: { dx: -36, dy: 172, w: 120, h: 110 },
    spearSweep: { dx: -82, dy: 64, w: 140, h: 100 },
    spearSwipe: { dx: 40, dy: 152, w: 120, h: 110 },
  },
  weakStun: { dx: 17, dy: 178, w: 120, h: 110 },
  aimText: 'TOO TOUGH! HIT THE GLOW',
  arenaW: 1600,
  lair: 'reaver',
  entrance: { eye: [255, 196, 96], dark: [4, 8, 8] },
  // the Blackwater Roost: a low raft at each end, a crate that swings across the middle, a higher raft between it and the right, and a rope
  perches: [
    { dx: 150, up: 100, w: 240 },
    { dx: 560, up: 190, w: 230, moving: { range: 90, speed: 0.85 } },
    { dx: 960, up: 130, w: 220 },
  ],
  vines: [{ dx: 1260, top: 360, bottom: 110 }],
  // at 35% the war-horns sound: two of his raiders swim in from either end of the dock
  onPhase: (phase, _b, c) => {
    if (phase !== 3) return;
    for (const x of [c.arena.left + 150, c.arena.right - 150]) c.spawnMinion('tayra', x, c.arena.floor - 20);
    c.text('THE WAR-HORNS SOUND!', c.arena.left + 330, c.arena.floor - 330, '#fdba74');
    c.shake(0.55);
  },
  moves: {
    // a vault and an overhead smash: waves of mud both ways. Long recovery
    vaultSmash: leapMove({
      tell: 0.9,
      act: 0.95,
      rec: 1.6,
      height: 260,
      onLand: (b, c) => {
        impact(b, c, 0.85, '#365314');
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * (b.width / 2), d, 330, '#4d7c0f', '#1a2e05', true).look = 'mud';
      },
    }),
    // a long spear thrust at chest height: duck under it or jump it
    spearThrust: {
      tell: 0.65,
      act: 0.4,
      rec: 1.1,
      max: 440,
      pose: 'lunge',
      onAct: (b, c) => {
        const h = beam(c, b, 340, 80, 56, 0, 0.32, '#e0f2fe', '#0c4a6e');
        h.look = 'jab';
      },
    },
    // three slung clods of swamp that land as slowing puddles
    mudSling: {
      tell: 0.7,
      act: 0.3,
      rec: 1.3,
      min: 180,
      pose: 'spit',
      onAct: (b, c) => {
        for (const off of [-170, 0, 170]) {
          const h = lob(c, b.x + b.facing * 70, c.arena.floor - 120, c.px + off, 0.85, { kind: 'glob', onLand: 'puddle', color: '#65a30d', color2: '#1a2e05', w: 40, h: 40 });
          h.look = 'mud';
        }
      },
    },
    // the spear along the planks: a low sweep forward, then he spins and sweeps back. Jump both
    spearSweep: {
      tell: 0.7,
      act: 1.0,
      rec: 1.4,
      max: 420,
      pose: 'lunge',
      onAct: (b, c) => {
        beam(c, b, 300, 22, 36, 0, 0.35, '#e0f2fe', '#0c4a6e').look = 'jab';
      },
      tick: (b, c, _dt, t) => {
        const br = b.ai!;
        if (t > 0.5 && !br.d.back) {
          br.d.back = 1;
          b.facing = b.facing > 0 ? -1 : 1;
          c.shake(0.2);
          beam(c, b, 300, 22, 36, 0, 0.35, '#e0f2fe', '#0c4a6e').look = 'jab';
        }
      },
    },
    // a high slash across the shoulders: stay low and keep off the rafts
    spearSwipe: {
      tell: 0.75,
      act: 0.45,
      rec: 1.2,
      phase: 2,
      max: 380,
      pose: 'lunge',
      onAct: (b, c) => {
        const h = beam(c, b, 300, 175, 110, 0, 0.35, '#e0f2fe', '#0c4a6e');
        h.look = 'jab';
        c.shake(0.25);
      },
    },
    // a war cry: ripples at head height both ways
    warCry: {
      tell: 0.8,
      act: 0.12,
      rec: 1.3,
      phase: 3,
      pose: 'roar',
      onAct: (b, c) => {
        c.shake(0.45);
        for (const d of [-1, 1] as const) headWave(c, b.x + d * (b.width / 2), d, 300, '#bae6fd', '#0369a1');
      },
    },
  },
};

// ───────────────────────────── 7. Stone Idol Golem ─────────────────────────────

/**
 * The painted golem drawn 1.8 times his old size is 2.07 world units to a painted pixel, so he stands about 215 tall with his hammer.
 * Weak spots are measured off the frame he holds in each opening: dx is forward of the body's middle (negative is behind him) and dy
 * the height above his feet at the middle of the spot.
 */
const GOLEM: BossDef = {
  world: 7,
  name: 'Stone Idol Golem',
  // a giant of the ruins: a slow mountain of carved stone that hits very hard and very rarely
  scale: 1.8,
  w: 180,
  h: 215,
  artDy: 0,
  speed: [40, 52, 72],
  prefer: 320,
  gap: [1.5, 1.1, 0.85],
  chain: 0.25,
  color: '#a8a29e',
  color2: '#44403c',
  // twenty-two hits, two hit points a hit
  hp: 44,
  hits: 22,
  // His rune core shows in a different place after each move, and the glow shows where: the chest after the rockfall roar, the head after
  // the eye beam, the back-rune after the quake, the belt-rune after the hammer smash, the belly after the spin and the shoulder after
  // the crystal rift. While he is stuck (the fist slam) the head hangs low. The ember while he is closed up sits on the chest
  weak: { dx: 20, dy: 120, w: 130, h: 120 },
  weakByMove: {
    rockfall: { dx: 23, dy: 116, w: 130, h: 120 },
    eyeBeam: { dx: -18, dy: 140, w: 120, h: 110 },
    quake: { dx: -31, dy: 110, w: 130, h: 110 },
    hammerSmash: { dx: -62, dy: 72, w: 130, h: 100 },
    hammerSpin: { dx: 0, dy: 90, w: 140, h: 110 },
    crystalRift: { dx: -30, dy: 122, w: 120, h: 110 },
  },
  weakStun: { dx: 30, dy: 130, w: 130, h: 110 },
  aimText: 'TOO TOUGH! HIT THE GLOW',
  arenaW: 1700,
  lair: 'golem',
  entrance: { eye: [96, 200, 255], dark: [2, 6, 10] },
  // the Idol Sanctum: a broken block at each end, a rune slab that drifts across the middle and a liana on the right
  perches: [
    { dx: 190, up: 105, w: 250 },
    { dx: 640, up: 195, w: 230, moving: { range: 100, speed: 0.75 } },
    { dx: 1200, up: 105, w: 250 },
  ],
  vines: [{ dx: 930, top: 360, bottom: 110 }],
  // at 35% the idol on the far wall wakes and the ceiling begins to give: a spread of marked rocks, one for each stretch of the hall
  onPhase: (phase, _b, c) => {
    if (phase !== 3) return;
    const span = c.arena.right - c.arena.left - 400;
    for (let i = 0; i < 5; i++) {
      const x = c.arena.left + 200 + (span * i) / 4;
      dropAt(c, x, 1.4 + i * 0.1, 44, '#a8a29e', '#57534e').look = 'rock';
    }
    c.text('THE CEILING CRACKS!', c.arena.left + 330, c.arena.floor - 330, '#93c5fd');
    c.shake(0.6);
  },
  moves: {
    // both fists come down. They stick in the floor: free hits while it pulls them out
    fistSlam: {
      tell: 1.0,
      act: 0.3,
      rec: 0.3,
      min: 0,
      max: 360,
      pose: 'slam',
      crashText: 'FISTS STUCK!',
      stunAfter: () => 2.4,
      interruptible: false,
      onAct: (b, c) => {
        impact(b, c, 0.8, '#a8a29e');
        const x = b.x + b.facing * (b.width / 2 + 50);
        const h = column(c, x, 0.0001, 140, '#a8a29e', '#44403c', 0.3);
        h.look = 'rock';
        for (const d of [-1, 1] as const) floorWave(c, x, d, 250, '#a8a29e', '#44403c').look = 'rock';
        b.ai!.d.crashed = 1;
      },
    },
    // rocks drop from the ceiling onto marked spots
    rockfall: {
      tell: 0.7,
      act: 0.25,
      rec: 1.0,
      pose: 'roar',
      onAct: (b, c) => {
        const xs = [c.px, c.px - 170, c.px + 170, c.px + (c.rnd() - 0.5) * 520];
        for (const x of xs) {
          const cx = Math.max(c.arena.left + 30, Math.min(c.arena.right - 30, x));
          dropAt(c, cx, 0.9, 42, '#a8a29e', '#57534e').look = 'rock';
        }
      },
    },
    // eyes glow, then a beam along the floor: jump it
    eyeBeam: {
      tell: 1.0,
      act: 1.1,
      rec: 1.2,
      phase: 2,
      pose: 'fly',
      onAct: (b, c) => {
        // low and short: a jump (or a well-timed double jump) clears it
        beam(c, b, 720, 16, 32, 0, 0.55, '#fde047', '#b45309').look = 'laser';
      },
    },
    // stomps so hard the whole arena ripples and rocks fall
    quake: {
      tell: 0.8,
      act: 0.12,
      rec: 1.0,
      phase: 3,
      pose: 'slam',
      onAct: (b, c) => {
        impact(b, c, 0.9, '#a8a29e');
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * (b.width / 2), d, 360, '#a8a29e', '#44403c', true).look = 'rock';
        for (const off of [-120, 140]) dropAt(c, Math.max(c.arena.left + 30, Math.min(c.arena.right - 30, c.px + off)), 0.9, 36, '#a8a29e', '#57534e').look = 'rock';
      },
    },
    // the hammer comes down on the marked spot in front of him and a cluster of crystals bursts up; a wave of shards runs on along the floor
    hammerSmash: {
      tell: 0.95,
      act: 0.4,
      rec: 1.5,
      max: 430,
      pose: 'slam',
      onTell: (b, c) => {
        const x = Math.max(c.arena.left + 60, Math.min(c.arena.right - 60, b.x + b.facing * Math.min(380, Math.max(160, Math.abs(c.px - b.x)))));
        const h = makeHazard({ kind: 'mark', x, y: c.arena.floor - 3, floorY: c.arena.floor, w: 150, h: 6, warn: 0.95, warnMax: 0.95, life: 1.0, maxLife: 1.0, color: '#ef4444', color2: '#7f1d1d' });
        c.hazards.push(h);
        addMark(c, b, h, 0);
      },
      tellTick: (b, c, dt) => trackMark(b, c, b.ai!.d.h0, dt, 0.5, 280),
      onAct: (b, c) => {
        const h = c.hazards.find((x) => x.id === b.ai!.d.h0);
        const x = h ? h.x : b.x + b.facing * 260;
        impact(b, c, 0.7, '#60a5fa');
        const col = column(c, x, 0.0001, 170, '#60a5fa', '#1e3a8a', 0.45);
        col.look = 'crystal';
        col.w = 70;
        floorWave(c, x + b.facing * 40, b.facing, 300, '#93c5fd', '#1e3a8a').look = 'rock';
      },
    },
    // a spin with the hammer held out low, going after you as it turns. The hammer is knee high: jump it
    hammerSpin: {
      tell: 0.8,
      act: 1.3,
      rec: 1.3,
      phase: 2,
      max: 420,
      pose: 'slam',
      tick: (b, c, dt) => {
        const br = b.ai!;
        const dx = c.px - b.x;
        b.facing = dx >= 0 ? 1 : -1;
        const half = b.width / 2;
        b.x = Math.max(c.arena.left + half, Math.min(c.arena.right - half, b.x + Math.max(-150 * dt, Math.min(150 * dt, dx))));
        br.hurt = [bodyBox(b), ...bothSides(b, c, 190, 72, 0)];
      },
    },
    // crystals burst up one after another along the floor in front of him, each marked first. They stand knee high: a ledge or a double jump
    crystalRift: {
      tell: 0.9,
      act: 0.9,
      rec: 1.4,
      phase: 3,
      pose: 'slam',
      onAct: (b, c) => {
        impact(b, c, 0.5, '#60a5fa');
        for (let i = 0; i < 6; i++) {
          const x = b.x + b.facing * (b.width / 2 + 70 + i * 150);
          if (x < c.arena.left + 40 || x > c.arena.right - 40) break;
          const h = column(c, x, 0.5 + i * 0.13, 90, '#60a5fa', '#1e3a8a', 0.7);
          h.look = 'crystal';
          h.w = 60;
        }
      },
    },
  },
};

// ───────────────────────────── 8. Night-Wing Monarch ─────────────────────────────

/**
 * The painted Monarch drawn 2.4 times her old size is 1.92 world units to a painted pixel: her hover is over 300 wide, the screech frame
 * nearly 460. Weak spots are measured off the frame she holds in each opening: dx is forward of her middle (negative is behind) and dy
 * the height above her feet at the middle of the spot.
 */
const MONARCH: BossDef = {
  world: 8,
  name: 'Night-Wing Monarch',
  // a giant of the dark: she hangs over the arena, so the fight is about her rings, her flock and when she comes down
  scale: 2.4,
  w: 260,
  h: 170,
  artDy: 0,
  speed: [76, 102, 138],
  prefer: 300,
  hover: 140,
  gap: [1.25, 0.95, 0.7],
  chain: 0.35,
  color: '#a78bfa',
  color2: '#2e1065',
  // twenty-three hits, two hit points a hit
  hp: 46,
  hits: 23,
  // She has no one weak point. It opens on whatever her last move left bare, and the glow shows where: the open mouth after a screech,
  // the wing joint after a swoop, the talons after she calls the stalactites, the chest after the sonic dive, the head after the echo
  // rings, the back after the flock. The ember while she is covered sits on the chest
  weak: { dx: 20, dy: 70, w: 120, h: 100 },
  weakByMove: {
    screech: { dx: 8, dy: 124, w: 120, h: 100 },
    swoop: { dx: -94, dy: 142, w: 130, h: 90 },
    stalactites: { dx: -4, dy: 26, w: 140, h: 70 },
    sonicDive: { dx: 6, dy: 100, w: 100, h: 110 },
    wingBuffet: { dx: 40, dy: 52, w: 120, h: 90 },
    echoRings: { dx: 56, dy: 92, w: 110, h: 100 },
    batFlock: { dx: -60, dy: 100, w: 120, h: 100 },
  },
  weakStun: { dx: 44, dy: 52, w: 130, h: 90 },
  aimText: 'TOO TOUGH! HIT THE GLOW',
  arenaW: 1600,
  lair: 'monarch',
  entrance: { eye: [255, 80, 96], dark: [6, 3, 20] },
  // the Karst Roost: a low shelf at each side, a high slab hung in the middle (it drifts) and a root rope between the middle and the right
  perches: [
    { dx: 180, up: 110, w: 240 },
    { dx: 620, up: 200, w: 230, moving: { range: 100, speed: 0.85 } },
    { dx: 1180, up: 110, w: 240 },
  ],
  vines: [{ dx: 920, top: 350, bottom: 110 }],
  // at 35% the lights go out. The roost wakes and sheds four bats on marked spots, and from then on she has the flock to call
  onPhase: (phase, _b, c) => {
    if (phase !== 3) return;
    const span = c.arena.right - c.arena.left - 500;
    for (let i = 0; i < 4; i++) {
      const x = c.arena.left + 250 + (span * i) / 3;
      dropAt(c, x, 1.3 + i * 0.12, 34, '#6d28d9', '#2e1065').look = 'bat';
    }
    c.text('THE CAVE GOES DARK!', c.arena.left + 330, c.arena.floor - 330, '#c4b5fd');
    c.shake(0.5);
  },
  moves: {
    // a piercing shriek: rings at head height race away in both directions. Her open mouth is bare afterwards
    screech: {
      tell: 0.75,
      act: 0.15,
      rec: 1.0,
      pose: 'roar',
      onAct: (b, c) => {
        c.roar();
        c.shake(0.3);
        for (const d of [-1, 1] as const) headWave(c, b.x + d * 60, d, 330, '#c4b5fd', '#5b21b6');
      },
    },
    // swoops down low across the arena and back up
    swoop: {
      tell: 0.6,
      act: 1.3,
      rec: 1.1,
      pose: 'fly',
      onAct: (b, c) => {
        const br = b.ai!;
        br.d.x0 = b.x;
        br.d.x1 = b.x < c.px ? Math.min(c.arena.right - 130, c.px + 330) : Math.max(c.arena.left + 130, c.px - 330);
        br.d.a0 = br.air;
        b.facing = br.d.x1 >= b.x ? 1 : -1;
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        const u = Math.min(1, t / 1.3);
        const e = u * u * (3 - 2 * u);
        b.x = br.d.x0 + (br.d.x1 - br.d.x0) * e;
        br.air = br.d.a0 * (1 - arc(u)) + 26 * arc(u);
        br.hurt = [bodyBox(b)];
      },
    },
    // stalactites crack loose and drop on marked spots. In the dark there are more of them
    stalactites: {
      tell: 0.8,
      act: 0.2,
      rec: 1.1,
      phase: 2,
      pose: 'roar',
      onAct: (b, c) => {
        const n = b.phase >= 3 ? 7 : 5;
        const half = (n - 1) / 2;
        for (let i = 0; i < n; i++) {
          const x = Math.max(c.arena.left + 30, Math.min(c.arena.right - 30, c.px + (i - half) * 150 + (c.rnd() - 0.5) * 60));
          dropAt(c, x, 0.8 + i * 0.1, 32, '#c4b5fd', '#4c1d95').look = 'spike';
        }
      },
    },
    // a screech with a swoop right behind it
    sonicDive: {
      tell: 0.7,
      act: 1.1,
      rec: 1.2,
      phase: 3,
      pose: 'fly',
      onAct: (b, c) => {
        const br = b.ai!;
        for (const d of [-1, 1] as const) headWave(c, b.x + d * 60, d, 360, '#c4b5fd', '#5b21b6');
        br.d.x0 = b.x;
        br.d.x1 = b.x < c.px ? Math.min(c.arena.right - 130, c.px + 260) : Math.max(c.arena.left + 130, c.px - 260);
        br.d.a0 = br.air;
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        const u = Math.min(1, t / 1.1);
        b.x = br.d.x0 + (br.d.x1 - br.d.x0) * (u * u * (3 - 2 * u));
        br.air = br.d.a0 * (1 - arc(u)) + 22 * arc(u);
        b.facing = br.d.x1 >= br.d.x0 ? 1 : -1;
        br.hurt = [bodyBox(b)];
      },
    },
    // she folds and drops straight down onto the mark under her, lands hard, and beats her wings: two gusts along the floor, the second
    // faster. The landing leaves her grounded and winded
    wingBuffet: {
      tell: 0.9,
      act: 1.0,
      rec: 0.4,
      min: 0,
      max: 700,
      pose: 'slam',
      stunAfter: () => 1.8,
      crashText: 'GROUNDED!',
      interruptible: false,
      onTell: (b, c) => {
        const h = makeHazard({ kind: 'mark', x: b.x, y: c.arena.floor - 3, floorY: c.arena.floor, w: 280, h: 6, warn: 0.9, warnMax: 0.9, life: 1.0, maxLife: 1.0, color: '#ef4444', color2: '#7f1d1d' });
        c.hazards.push(h);
      },
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        br.air += (0 - br.air) * Math.min(1, dt * 3.4);
        if (br.air < 2) br.air = 0;
      },
      onAct: (b, c) => {
        const br = b.ai!;
        br.air = 0;
        impact(b, c, 0.8, '#7c3aed');
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * 150, d, 280, '#c4b5fd', '#4c1d95', true);
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        br.air = 0;
        br.hurt = [bodyBox(b)];
        if (t >= 0.5 && !br.d.beat2) {
          br.d.beat2 = 1;
          c.shake(0.3);
          for (const d of [-1, 1] as const) floorWave(c, b.x + d * 150, d, 380, '#c4b5fd', '#4c1d95', true);
        }
        // when the second beat is over she is winded where she stands
        if (t >= 0.95) br.d.crashed = 1;
      },
    },
    // rings with a rhythm: a low ring along the floor, then a ring at head height, then a low one again, out to both sides. Jump, then stay down, then jump
    echoRings: {
      tell: 0.75,
      act: 1.3,
      rec: 1.2,
      phase: 2,
      pose: 'roar',
      onAct: (b, c) => {
        b.ai!.d.n = 0;
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        const at = [0, 0.5, 1.0];
        while (br.d.n < at.length && t >= at[br.d.n]) {
          const low = br.d.n % 2 === 0;
          c.shake(0.15);
          for (const d of [-1, 1] as const) {
            if (low) floorWave(c, b.x + d * 80, d, 330, '#c4b5fd', '#5b21b6');
            else headWave(c, b.x + d * 80, d, 360, '#c4b5fd', '#5b21b6');
          }
          br.d.n++;
        }
      },
    },
    // the roost wakes and the flock comes through from one side: a run of bats along the floor, then a run high over it. Jump the low
    // ones, then stay down for the high ones
    batFlock: {
      tell: 0.9,
      act: 1.8,
      rec: 1.2,
      phase: 3,
      pose: 'fly',
      onTell: (b, c) => {
        const br = b.ai!;
        br.d.dir = b.x < (c.arena.left + c.arena.right) / 2 ? 1 : -1;
        const edge = br.d.dir > 0 ? c.arena.left + 50 : c.arena.right - 50;
        c.hazards.push(makeHazard({ kind: 'mark', x: edge, y: c.arena.floor - 3, floorY: c.arena.floor, w: 110, h: 6, warn: 0.9, warnMax: 0.9, life: 1.0, maxLife: 1.0, color: '#ef4444', color2: '#7f1d1d' }));
      },
      onAct: (b, c) => {
        b.ai!.d.n = 0;
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        // three low bats 0.3 apart, a beat, three high ones
        const at = [0, 0.3, 0.6, 1.2, 1.5, 1.8];
        while (br.d.n < at.length && t >= at[br.d.n]) {
          const high = br.d.n >= 3;
          const dir = br.d.dir as 1 | -1;
          const x = dir > 0 ? c.arena.left + 20 : c.arena.right - 20;
          const h = aimed(c, x, c.arena.floor - (high ? 150 : 28), dir > 0 ? 0 : Math.PI, 430, '#a78bfa', '#2e1065');
          h.look = 'bat';
          h.w = 50;
          h.h = 30;
          h.life = h.maxLife = 4.4;
          br.d.n++;
        }
      },
    },
  },
};

// ───────────────────────────── 9. Magma Drake ─────────────────────────────

const DRAKE: BossDef = {
  world: 9,
  name: 'Magma Drake',
  // a giant: the painted frames are drawn 3.2 times their old size, so Pokey is a small figure under it
  scale: 3.2,
  w: 430,
  h: 220,
  artDy: 0,
  speed: [60, 84, 114],
  prefer: 520,
  gap: [1.3, 0.95, 0.7],
  chain: 0.4,
  color: '#fb923c',
  color2: '#7c2d12',
  // two hit points per hit: a hook or a kick is one segment of the bar, a jab half of one
  hp: 48,
  hits: 24,
  // the head is its one weak point: high up, and open only in the moment after it attacks (or when it is stunned)
  weak: { dx: 150, dy: 175, w: 120, h: 100 },
  arenaW: 1400,
  lair: 'drake',
  // five ledges, a stair up the left to a high centre perch and a moving one on the right: somewhere to go round the boss
  perches: [
    { dx: 70, up: 70, w: 190 },
    { dx: 330, up: 140, w: 170 },
    { dx: 640, up: 215, w: 240 },
    { dx: 990, up: 150, w: 130, moving: { range: 110, speed: 1.0 } },
    { dx: 1140, up: 90, w: 190 },
  ],
  // at 35% the floor by each fence floods with lava, so the ledges and the open middle are the safe ground
  onPhase: (phase, _b, c) => {
    if (phase !== 3) return;
    for (const dir of [1, -1] as const) {
      const edge = dir > 0 ? c.arena.left : c.arena.right;
      const h = makeHazard({
        kind: 'strip', x: edge, y: c.arena.floor - 9, floorY: c.arena.floor, w: 6, h: 18, warn: 1.8, warnMax: 1.8,
        life: 1e9, maxLife: 1e9, dmg: 1, dir, ox: edge, growTo: 190, growRate: 55, color: '#fb923c', color2: '#b91c1c', look: 'lava',
      });
      c.hazards.push(h);
    }
    c.text('THE FLOOR IS LAVA!', c.arena.left + 300, c.arena.floor - 280, '#fb923c');
    c.shake(0.6);
  },
  moves: {
    // a long gout of flame at chest height: duck under it or jump it
    fireBreath: {
      tell: 0.9,
      act: 1.2,
      rec: 1.5,
      max: 900,
      pose: 'spit',
      onAct: (b, c) => {
        const h = beam(c, b, 700, 60, 46, 0, 1.1, '#fdba74', '#dc2626');
        h.look = 'fire';
      },
    },
    // lava geysers burst up on marked spots
    eruption: {
      tell: 0.95,
      act: 0.3,
      rec: 1.3,
      pose: 'roar',
      onTell: (b, c) => {
        const xs = b.phase >= 2 ? [0, -250, 250, 500] : [0, -260, 260];
        xs.forEach((off, i) => {
          const x = Math.max(c.arena.left + 40, Math.min(c.arena.right - 40, c.px + off));
          const h = column(c, x, 1.0 + i * 0.08, 240, '#fb923c', '#b91c1c', 0.6);
          h.look = 'lava';
        });
      },
    },
    // a tail spin at head height on both sides: duck under it or back off
    wingSweep: {
      tell: 0.6,
      act: 0.36,
      rec: 1.2,
      max: 460,
      pose: 'whip',
      tick: (b, c) => {
        b.ai!.hurt = [...bothSides(b, c, 180, 80, 36), bodyBox(b)];
      },
    },
    // a huge leap: the landing makes lava waves and leaves a burning patch
    leapCrush: leapMove({
      tell: 0.9,
      act: 0.95,
      rec: 1.5,
      height: 300,
      phase: 2,
      min: 320,
      onLand: (b, c) => {
        impact(b, c, 1.0, '#ea580c');
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * (b.width / 2), d, 380, '#fb923c', '#b91c1c', true).look = 'lava';
        const p = makeHazard({ kind: 'puddle', x: b.x, y: c.arena.floor - 7, floorY: c.arena.floor, w: 220, h: 14, life: 3.4, maxLife: 3.4, eff: 'none', dmg: 1, color: '#fb923c', color2: '#b91c1c', look: 'lava' });
        c.hazards.push(p);
      },
    }),
  },
};

// ───────────────────────────── 10. General Iron-Claw ─────────────────────────────

/**
 * The painted General drawn twice his old size is 1.44 world units to a painted pixel: his idle is over 370 wide and 280 tall. Weak
 * spots are measured off the frame he holds in each opening: dx is forward of his middle (negative is behind him) and dy the height
 * above his feet at the middle of the spot.
 */
const GENERAL: BossDef = {
  world: 10,
  name: 'General Iron-Claw',
  // the last giant: a sloth warlord twice the hero's size and then some, so the fight is about his reach, his soldiers and the fire at the walls
  scale: 2.0,
  w: 190,
  h: 240,
  artDy: 0,
  speed: [52, 72, 100],
  prefer: 300,
  gap: [1.2, 0.9, 0.65],
  chain: 0.45,
  color: '#fca5a5',
  color2: '#450a0a',
  // twenty-six hits, two hit points a hit
  hp: 52,
  hits: 26,
  // He has no one weak point. It opens on whatever his last move left bare, and the glow shows where: the head after the staff slam, the
  // pauldron after the club throw, the open mouth after the war cry, the foot after the ground pound, the knuckles after the claw combo,
  // the cape after the quake stride and the belly after the warlord's slam. The ember while he is covered sits on the chest. After a
  // wall crash he is dazed and his head is bare
  weak: { dx: 24, dy: 150, w: 130, h: 110 },
  weakByMove: {
    staffSlam: { dx: 40, dy: 178, w: 130, h: 110 },
    spearThrow: { dx: -10, dy: 170, w: 120, h: 100 },
    warCry: { dx: -14, dy: 175, w: 130, h: 110 },
    groundPound: { dx: 60, dy: 40, w: 150, h: 80 },
    clawCombo: { dx: 150, dy: 160, w: 110, h: 100 },
    quakeStride: { dx: -90, dy: 150, w: 130, h: 110 },
    warlordSlam: { dx: 20, dy: 120, w: 140, h: 110 },
  },
  weakStun: { dx: 14, dy: 170, w: 130, h: 110 },
  aimText: 'TOO TOUGH! HIT THE GLOW',
  arenaW: 1800,
  lair: 'warcamp',
  entrance: { eye: [255, 70, 56], dark: [16, 3, 5] },
  // the War Camp: a low scaffold at each end, a high platform hung in the middle-left (it drifts), a second high one on the right and a chain
  perches: [
    { dx: 180, up: 105, w: 240 },
    { dx: 640, up: 195, w: 230, moving: { range: 110, speed: 0.8 } },
    { dx: 1110, up: 195, w: 230 },
    { dx: 1440, up: 105, w: 240 },
  ],
  vines: [{ dx: 930, top: 380, bottom: 110 }],
  // at 35% the palisade catches: a wall of fire creeps in from each end of the arena (warned first). The ledges and the middle stay clear
  onPhase: (phase, _b, c) => {
    if (phase !== 3) return;
    for (const dir of [1, -1] as const) {
      const edge = dir > 0 ? c.arena.left : c.arena.right;
      const h = makeHazard({
        kind: 'strip', x: edge, y: c.arena.floor - 9, floorY: c.arena.floor, w: 6, h: 18, warn: 1.8, warnMax: 1.8,
        life: 1e9, maxLife: 1e9, dmg: 1, dir, ox: edge, growTo: 200, growRate: 45, color: '#fb923c', color2: '#7f1d1d', look: 'blaze',
      });
      c.hazards.push(h);
    }
    c.text('THE PALISADE BURNS!', c.arena.left + 330, c.arena.floor - 330, '#fdba74');
    c.shake(0.55);
  },
  moves: {
    // brings the iron club down in front of him, with a shock along the ground. His head is bare while he pulls it up
    staffSlam: {
      tell: 0.8,
      act: 0.28,
      rec: 1.1,
      max: 340,
      pose: 'slam',
      onAct: (b, c) => {
        impact(b, c, 0.7, '#9ca3af');
        const x = b.x + b.facing * (b.width / 2 + 80);
        floorWave(c, x, b.facing, 330, '#d1d5db', '#4b5563').look = 'rock';
        if (b.phase >= 3) floorWave(c, x, b.facing === 1 ? -1 : 1, 330, '#d1d5db', '#4b5563').look = 'rock';
      },
      tick: (b, c) => {
        b.ai!.hurt = [frontBox(b, c, 200, 150, 0)];
      },
    },
    // hurls his spiked clubs: one low, one high in the later phases, and a third in the last
    spearThrow: {
      tell: 0.65,
      act: 0.6,
      rec: 1.0,
      min: 220,
      pose: 'spit',
      onAct: (b, c) => {
        const x = b.x + b.facing * 110;
        bolt(c, x, c.arena.floor - 22, b.facing, 560, '#e5e7eb', '#6b7280', 20).look = 'club';
        b.ai!.d.second = b.phase >= 2 ? 1 : 0;
        b.ai!.d.third = b.phase >= 3 ? 1 : 0;
      },
      tick: (b, c) => {
        const br = b.ai!;
        if (br.d.second && br.t > 0.26 && !br.d.fired2) {
          br.d.fired2 = 1;
          bolt(c, b.x + b.facing * 110, c.arena.floor - 70, b.facing, 560, '#e5e7eb', '#6b7280', 20).look = 'club';
        }
        if (br.d.third && br.t > 0.5 && !br.d.fired3) {
          br.d.fired3 = 1;
          bolt(c, b.x + b.facing * 110, c.arena.floor - 22, b.facing, 600, '#e5e7eb', '#6b7280', 20).look = 'club';
        }
      },
    },
    // calls his soldiers (or bellows a shock along the floor when they are already out)
    warCry: {
      tell: 1.0,
      act: 0.2,
      rec: 1.3,
      pose: 'roar',
      onAct: (b, c) => {
        c.roar();
        if (c.minionsAlive >= 2) {
          for (const d of [-1, 1] as const) floorWave(c, b.x + d * 100, d, 330, '#d1d5db', '#4b5563').look = 'rock';
          return;
        }
        c.spawnMinion('ocelot', c.arena.left + 60, c.arena.floor - 20);
        c.spawnMinion('ocelot', c.arena.right - 60, c.arena.floor - 20);
        c.shake(0.3);
      },
    },
    // a thunderous charge: crashing into the wall dazes him
    ironCharge: chargeMove({ tell: 0.9, maxT: 1.9, rec: 0.9, speed: 520, stun: 1.8, text: 'DAZED!', min: 220, phase: 2 }),
    // leaps and pounds: waves both ways and rocks from the roof
    groundPound: {
      tell: 0.9,
      act: 0.2,
      rec: 1.3,
      phase: 3,
      pose: 'slam',
      onAct: (b, c) => {
        impact(b, c, 0.9, '#9ca3af');
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * 90, d, 350, '#d1d5db', '#4b5563', true).look = 'rock';
        for (const off of [-220, -80, 80, 220]) dropAt(c, Math.max(c.arena.left + 30, Math.min(c.arena.right - 30, c.px + off)), 0.9, 38, '#a8a29e', '#57534e').look = 'rock';
      },
    },
    // up close: a claw, another claw and a punch, each a step closer, the last throwing a slash along the floor. The knuckles are bare after
    clawCombo: {
      tell: 0.55,
      act: 1.25,
      rec: 1.2,
      max: 300,
      pose: 'bite',
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        b.x += b.facing * 85 * dt;
        const windows: Array<[number, number]> = [[0.15, 0.35], [0.55, 0.75], [0.95, 1.15]];
        if (windows.some(([a, z]) => t >= a && t <= z)) br.hurt = [frontBox(b, c, 210, 150, 0)];
        if (t >= 0.95 && !br.d.slash) {
          br.d.slash = 1;
          c.shake(0.3);
          floorWave(c, b.x + b.facing * (b.width / 2 + 90), b.facing, 380, '#fca5a5', '#7f1d1d').look = 'rock';
        }
      },
    },
    // stamps forward four times, a shock racing ahead along the floor from every stamp. Hop each one
    quakeStride: {
      tell: 0.7,
      act: 1.7,
      rec: 1.2,
      phase: 2,
      min: 200,
      pose: 'slam',
      onAct: (b) => {
        b.ai!.d.n = 0;
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        b.x += b.facing * 95 * dt;
        const at = [0.2, 0.7, 1.2, 1.7 - 0.05];
        while (br.d.n < at.length && t >= at[br.d.n]) {
          br.d.n++;
          impact(b, c, 0.4, '#9ca3af');
          floorWave(c, b.x + b.facing * (b.width / 2 + 20), b.facing, 340, '#fca5a5', '#7f1d1d').look = 'rock';
        }
      },
    },
    // the warlord's own blow: he holds the club up while lightning finds the spot under you, then brings it down. A column of lightning at
    // the mark and four more either side of it, and a shock along the floor
    warlordSlam: {
      tell: 1.3,
      act: 0.5,
      rec: 1.5,
      phase: 3,
      pose: 'slam',
      interruptible: false,
      onTell: (b, c) => {
        const h = makeHazard({ kind: 'mark', x: c.px, y: c.arena.floor - 3, floorY: c.arena.floor, w: 150, h: 6, warn: 1.3, warnMax: 1.3, life: 1.4, maxLife: 1.4, color: '#c084fc', color2: '#581c87' });
        c.hazards.push(h);
        addMark(c, b, h, 0);
      },
      tellTick: (b, c, dt) => {
        trackMark(b, c, b.ai!.d.h0, dt, 0.6, 300);
      },
      onAct: (b, c) => {
        const br = b.ai!;
        const m = c.hazards.find((x) => x.id === br.d.h0);
        const x0 = m ? m.x : c.px;
        impact(b, c, 1.0, '#a855f7');
        c.roar();
        const place = (x: number, warn: number) => {
          if (x < c.arena.left + 30 || x > c.arena.right - 30) return;
          const h = column(c, x, warn, 260, '#c084fc', '#581c87', 0.5);
          h.look = 'lightning';
        };
        place(x0, 0.0001);
        for (const off of [-190, 190, -380, 380]) place(x0 + off, 0.55);
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * 100, d, 330, '#c084fc', '#581c87', true);
      },
    },
  },
};

// ───────────────────────────── Secret: Thornbark, the corrupted guardian ─────────────────────────────

const THORNBARK: BossDef = {
  world: 7,
  name: 'Thornbark',
  w: 84,
  h: 112,
  artDy: 0,
  speed: [84, 112, 150],
  prefer: 230,
  gap: [1.0, 0.75, 0.5],
  chain: 0.45,
  hp: 150,
  puppet: 'thornbark',
  color: '#a78bfa',
  color2: '#14532d',
  moves: {
    // a fan of thorns thrown at where you stand
    thornVolley: {
      tell: 0.6,
      act: 0.7,
      rec: 1.0,
      min: 160,
      pose: 'spit',
      onAct: (b, c) => {
        const fire = (n: number, speed: number) => {
          const ang = Math.atan2(c.py - 34 - (b.y - 6), c.px - b.x);
          const half = (n - 1) / 2;
          for (let i = 0; i < n; i++) aimed(c, b.x + b.facing * 30, b.y - 6, ang + (i - half) * 0.2, speed, '#86efac', '#14532d').look = 'thorn';
        };
        fire(b.phase >= 2 ? 5 : 3, 340);
        b.ai!.d.second = b.phase >= 3 ? 1 : 0;
      },
      tick: (b, c) => {
        const br = b.ai!;
        if (br.d.second && br.t > 0.36 && !br.d.fired2) {
          br.d.fired2 = 1;
          const ang = Math.atan2(c.py - 34 - (b.y - 6), c.px - b.x);
          for (let i = -2; i <= 2; i++) aimed(c, b.x + b.facing * 30, b.y - 6, ang + i * 0.17, 380, '#86efac', '#14532d').look = 'thorn';
        }
      },
    },
    // a whip of briar vines at chest height: duck under it or jump it
    briarWhip: {
      tell: 0.55,
      act: 0.45,
      rec: 1.0,
      max: 300,
      pose: 'lunge',
      onAct: (b, c) => {
        beam(c, b, 360, 50, 40, 0, 0.35, '#86efac', '#14532d').look = 'vine';
      },
    },
    // roots burst up under you
    rootBurst: {
      tell: 1.0,
      act: 0.3,
      rec: 1.1,
      pose: 'slam',
      onTell: (b, c) => {
        const offs = b.phase >= 3 ? [0, -200, 200] : b.phase === 2 ? [0, 210] : [0];
        offs.forEach((off, i) => {
          const x = Math.max(c.arena.left + 30, Math.min(c.arena.right - 30, c.px + off));
          const h = column(c, x, 1.0 + i * 0.1, 160, '#4ade80', '#14532d', 0.6);
          h.look = 'thorn';
          addMark(c, b, h, i);
        });
      },
      tellTick: (b, c, dt) => {
        trackMark(b, c, b.ai!.d.h0, dt, 0.55);
      },
    },
    // a streak across the arena with claws out
    shadowDash: chargeMove({ tell: 0.6, maxT: 1.0, rec: 0.9, speed: 720, min: 200 }),
    // up close: three claw swipes
    clawFlurry: {
      tell: 0.45,
      act: 0.95,
      rec: 1.0,
      max: 230,
      pose: 'bite',
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        b.x += b.facing * 70 * dt;
        const windows: Array<[number, number]> = [[0.1, 0.28], [0.4, 0.58], [0.7, 0.88]];
        if (windows.some(([a, z]) => t >= a && t <= z)) br.hurt = [frontBox(b, c, 90, 62, 4)];
      },
    },
    // fades into the thorns and appears behind you with a slash
    mirrorStep: {
      tell: 0.55,
      act: 0.3,
      rec: 0.8,
      phase: 2,
      pose: 'fade',
      tellTick: (b) => {
        const br = b.ai!;
        br.alpha = Math.max(0.08, 1 - (br.t / 0.55) * 0.95);
      },
      onAct: (b, c) => {
        const br = b.ai!;
        const half = b.width / 2;
        const side = c.px >= b.x ? 1 : -1;
        b.x = Math.max(c.arena.left + half, Math.min(c.arena.right - half, c.px + side * 110));
        b.facing = side > 0 ? -1 : 1;
        br.alpha = 1;
        c.debris(b.x, c.arena.floor - 20, '#4ade80');
      },
      tick: (b, c) => {
        if (b.ai!.t < 0.22) b.ai!.hurt = [frontBox(b, c, 96, 58, 4)];
      },
    },
    // a huge leap and a slam: thorn waves along the ground and spikes from the roof
    thornSlam: leapMove({
      tell: 0.8,
      act: 0.8,
      rec: 1.4,
      height: 230,
      phase: 2,
      min: 150,
      onLand: (b, c) => {
        impact(b, c, 0.85, '#166534');
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * (b.width / 2), d, 340, '#4ade80', '#14532d', true).look = 'thorn';
        for (const off of [-140, 150]) dropAt(c, Math.max(c.arena.left + 30, Math.min(c.arena.right - 30, c.px + off)), 0.9, 34, '#86efac', '#14532d').look = 'spike';
      },
    }),
    // the whole canopy sheds thorns
    thornRain: {
      tell: 1.0,
      act: 0.3,
      rec: 1.3,
      phase: 3,
      pose: 'roar',
      onAct: (b, c) => {
        c.roar();
        c.shake(0.4);
        for (let i = 0; i < 7; i++) {
          const x = Math.max(c.arena.left + 30, Math.min(c.arena.right - 30, c.px + (i - 3) * 130 + (c.rnd() - 0.5) * 50));
          dropAt(c, x, 0.8 + i * 0.1, 30, '#86efac', '#14532d').look = 'spike';
        }
      },
    },
  },
};

export const BOSS_DEFS: Record<number, BossDef> = {
  1: VENOM,
  2: CROC,
  3: PROWLER,
  4: SOVEREIGN,
  5: QUEEN,
  6: REAVER,
  7: GOLEM,
  8: MONARCH,
  9: DRAKE,
  10: GENERAL,
};

export const bossDefFor = (world: number): BossDef => BOSS_DEFS[world] ?? VENOM;

/** one line of advice per boss, shown before the fight */
export const BOSS_TIPS: Record<number, string> = {
  1: 'Venom Fang sweeps his head along the floor. When he rears back and the floor flashes, get off the ground. Then punch his head while he is dazed.',
  2: 'Crocus Rex rolls the length of the arena and crashes into the wall. Jump the tail sweep and hit him while he is dizzy.',
  3: 'The Shadow Prowler vanishes and reappears behind you. Watch for the fade, then turn and strike.',
  4: 'The Sky Sovereign is a giant of the air. Stand by a rock pillar, step off the red mark, and her dive slams into the rock. Then hit her head, or float down onto her back. Get behind a rock when she screeches.',
  5: 'The Tarantula Queen is a giant of the hollow. Jump her venom jet and step out of the web and cocoon marks. Then hit whatever glows: abdomen, fangs, eyes, or chest.',
  6: 'The Marsh Reaver is a giant of the blackwater. Jump his low spear sweep and the mud waves, duck the high swipe, then hit whatever glows: back, neck, head, or flank.',
  7: 'The Stone Idol Golem is a giant of the ruins. Jump his spinning hammer, slip the crystal rift, then hit whatever glows: chest, head, back, or belly.',
  8: 'The Night-Wing Monarch is a giant bat. Jump her low rings and stay down for the high ones, then hit whatever glows: mouth, wing joint, talons, chest, head, or back.',
  9: 'The Magma Drake breathes fire at chest height, so duck or jump it. Keep off the lava geysers.',
  10: 'General Iron-Claw is the last giant. Jump his shocks and clubs, dodge the lightning columns, let him crash into a wall, then hit whatever glows: head, pauldron, mouth, foot, knuckles, cape, or belly.',
};

/** the secret boss lives outside the ten worlds */
export const THORNBARK_DEF = THORNBARK;

/** which boss a level has: the secret one, or its world's */
export const bossDefForLevel = (cfg: { worldIndex: number; secret?: string }): BossDef => (cfg.secret === 'thornbark' ? THORNBARK : bossDefFor(cfg.worldIndex));

BOSS_TIPS[11] = 'Thornbark mirrors your own moves, only meaner. Watch for the red glow, then punish the opening. A hook breaks his attack.';
