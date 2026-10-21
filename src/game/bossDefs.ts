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

// ───────────────────────────── 1. Venom Fang: emerald boa ─────────────────────────────

const VENOM: BossDef = {
  world: 1,
  name: 'Venom Fang',
  // a giant: the painted boa is drawn 2.6 times its old size, so Pokey is a small figure under its crown
  scale: 2.6,
  w: 340,
  h: 230,
  artDy: 0,
  speed: [56, 74, 98],
  prefer: 430,
  gap: [1.6, 1.2, 0.9],
  color: '#84cc16',
  color2: '#365314',
  // the first boss is the gentlest giant: ten hits, two hit points a hit (a hook or a kick is one segment of the bar, a jab half of one)
  hp: 20,
  hits: 10,
  // the crowned head is the one weak point: high up, and open only in the moment after it attacks (or when it is stunned)
  // (measured from the painted frames: the crown sits at 26 / 175 in the open pose and at 144 / 206 when it is stunned)
  weak: { dx: 26, dy: 175, w: 130, h: 110 },
  weakStun: { dx: 144, dy: 206, w: 130, h: 110 },
  arenaW: 1300,
  lair: 'venom',
  entrance: { eye: [190, 242, 100], dark: [1, 6, 3] },
  // the Mushroom Hollow: a stump at each end, a bounce mushroom either side of the middle to spring up to the crown, one wide
  // branch across the middle (head height) and a swinging liana hanging below it. No stair: the way up is the mushrooms
  perches: [
    { dx: 30, up: 75, w: 130 },
    { dx: 330, up: 30, w: 70, kind: 'bouncy' },
    { dx: 500, up: 195, w: 290 },
    { dx: 880, up: 30, w: 70, kind: 'bouncy' },
    { dx: 1140, up: 75, w: 130 },
  ],
  vines: [{ dx: 645, top: 330, bottom: 60 }],
  // at 35% the bog rises along the floor by each fence (warned first): the ledges and the open middle stay safe
  onPhase: (phase, _b, c) => {
    if (phase !== 3) return;
    for (const dir of [1, -1] as const) {
      const edge = dir > 0 ? c.arena.left : c.arena.right;
      const h = makeHazard({
        kind: 'strip', x: edge, y: c.arena.floor - 9, floorY: c.arena.floor, w: 6, h: 18, warn: 1.8, warnMax: 1.8,
        life: 1e9, maxLife: 1e9, dmg: 1, dir, ox: edge, growTo: 170, growRate: 50, color: '#a3e635', color2: '#365314', look: 'venom',
      });
      c.hazards.push(h);
    }
    c.text('THE BOG RISES!', c.arena.left + 300, c.arena.floor - 260, '#a3e635');
    c.shake(0.55);
  },
  moves: {
    // lobs a glob of venom that lands as a lingering, slowing puddle
    spit: {
      tell: 0.75,
      act: 0.25,
      rec: 1.3,
      min: 200,
      pose: 'spit',
      onAct: (b, c) => {
        const phase = b.phase;
        const mouth = { x: b.x + b.facing * (b.width / 2 - 20), y: c.arena.floor - 190 };
        const shots = phase >= 3 ? [-210, 0, 210] : phase === 2 ? [-150, 150] : [0];
        for (const off of shots) {
          const h = lob(c, mouth.x, mouth.y, c.px + off, 0.85 + Math.abs(off) * 0.0008, { kind: 'glob', onLand: 'puddle', color: '#a3e635', color2: '#3f6212', dmg: 1, look: 'venom' });
          h.dir = b.facing;
        }
      },
    },
    // the head strikes a long way forward: duck-proof, so back away or jump it
    lunge: {
      tell: 0.8,
      act: 0.42,
      rec: 1.2,
      max: 520,
      pose: 'lunge',
      onAct: (b) => {
        b.ai!.d.dir = b.facing;
      },
      tick: (b, c, dt) => {
        const br = b.ai!;
        const dir = br.d.dir;
        b.x += dir * 640 * dt;
        br.hurt = [frontBox(b, c, 170, 150, 15), bodyBox(b)];
      },
    },
    // the tail bursts up from the floor under where you were standing
    tailSlam: {
      tell: 0.95,
      act: 0.4,
      rec: 1.0,
      pose: 'whip',
      onTell: (b, c) => {
        const h = column(c, c.px, 1.05, 230, '#65a30d', '#365314', 0.55);
        h.look = 'tail';
        addMark(c, b, h, 0);
        if (b.phase >= 2) {
          for (const [slot, off] of [[1, -260], [2, 260]] as const) {
            if (slot === 2 && b.phase < 3) continue;
            const e = column(c, c.px + off, 1.05, 230, '#65a30d', '#365314', 0.55);
            e.look = 'tail';
            addMark(c, b, e, slot);
          }
        }
      },
      tellTick: (b, c, dt) => {
        trackMark(b, c, b.ai!.d.h0, dt, 0.55);
        if (b.ai!.d.h1) trackMark(b, c, b.ai!.d.h1, dt, 0.55, 260, -260);
        if (b.ai!.d.h2) trackMark(b, c, b.ai!.d.h2, dt, 0.55, 260, 260);
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
  // his one weak point is the head. It is low, so the trick is not reaching it but being there in the opening: right after a move
  // (the jaws are held open on recovery) or while he is dizzy. Measured from the painted frames: the head sits at 160 / 150 in the
  // recovery pose (hurt) and at 150 / 45 in the stagger, where it hangs almost to the mud
  weak: { dx: 160, dy: 150, w: 160, h: 110 },
  weakStun: { dx: 150, dy: 45, w: 170, h: 90 },
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
    deathRoll: chargeMove({ tell: 1.2, maxT: 2.3, rec: 1.0, speed: 560, stun: 2.1, text: 'DIZZY!', min: 220 }),
    // a low spinning sweep of the tail on both sides: jump it
    tailWhip: {
      tell: 0.7,
      act: 0.4,
      rec: 1.1,
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
      rec: 1.3,
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
      rec: 1.3,
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
    c.text('THE GLOWCAPS GO DARK!', c.arena.left + 330, c.arena.floor - 270, '#7dffe0');
    c.shake(0.5);
  },
  moves: {
    // a quick crouch, then a long pounce to where you were standing. From the second phase the landing sends a wave along the floor
    pounce: leapMove({
      tell: 0.55,
      act: 0.7,
      rec: 0.85,
      height: 230,
      min: 260,
      onLand: (b, c) => {
        impact(b, c, 0.55, '#7c3aed');
        if (b.phase < 2) return;
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * (b.width / 2 + 10), d, b.phase >= 3 ? 360 : 280, '#a78bfa', '#3b0764', true);
      },
    }),
    // vanishes and comes out right behind you for a slash. He comes out behind you, so with a moon pool at your back the light will
    // not let him appear: he is caught, stunned and wide open
    shadowStep: {
      tell: 0.55,
      act: 0.3,
      rec: 0.9,
      pose: 'fade',
      crashText: 'CAUGHT IN THE MOON!',
      stunAfter: () => 2.1,
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
      rec: 1.05,
      max: 330,
      pose: 'bite',
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        b.x += b.facing * 80 * dt;
        const windows: Array<[number, number]> = b.phase >= 3 ? [[0.08, 0.22], [0.3, 0.44], [0.52, 0.66], [0.74, 0.9]] : [[0.1, 0.28], [0.4, 0.58], [0.7, 0.88]];
        if (windows.some(([a, z]) => t >= a && t <= z)) br.hurt = [frontBox(b, c, 190, 150, 6)];
      },
    },
    // a lightning dash from one end of the arena to the other, low enough to jump
    streak: (() => {
      const m = chargeMove({ tell: 0.65, maxT: 1.2, rec: 1.0, speed: 800, phase: 2, min: 300 });
      const base = m.tick!;
      m.tick = (b, c, dt, t) => {
        base(b, c, dt, t);
        // he is flat out, so the box that hurts is lower than his resting height
        b.ai!.hurt = [{ x: b.x - b.width / 2, y: c.arena.floor - 140, w: b.width, h: 140 }];
      };
      return m;
    })(),
  },
};

// ───────────────────────────── 4. Sky Sovereign: harpy eagle ─────────────────────────────

/**
 * The painted eagle drawn 2.3 times its old size is 1.96 world units to a painted pixel (wings spread she is nearly 500 wide). Weak spots
 * are measured off the frames of the pose she holds in each opening: dx is forward of the body's middle and dy the height above her feet
 * (her feet hang `air` above the floor, which weakRect adds).
 */
const SOVEREIGN: BossDef = {
  world: 4,
  name: 'Sky Sovereign',
  // a giant of the air: she hangs above the arena, so the fight is about where you stand under her and when you climb up to her
  scale: 2.3,
  w: 250,
  h: 190,
  artDy: 0,
  speed: [70, 95, 125],
  prefer: 330,
  hover: 150,
  gap: [1.3, 0.95, 0.7],
  chain: 0.35,
  color: '#f59e0b',
  color2: '#78350f',
  // sixteen hits, two hit points a hit
  hp: 32,
  hits: 16,
  // She has no one weak point. It opens where her last move left her open, and the glow shows where: the head after a crash, the white
  // chest after the feather volley (her wings are flung wide), the talons after the low sweep, the back between her wings after the snatch
  // (jump onto it from a ledge) and the head, low, after the beak lunge. The ember while she is covered sits on the head
  weak: { dx: 40, dy: 150, w: 120, h: 110 },
  weakByMove: {
    featherVolley: { dx: 16, dy: 102, w: 120, h: 120 },
    skySweep: { dx: 68, dy: 24, w: 150, h: 100 },
    snatch: { dx: -20, dy: 140, w: 160, h: 100 },
    talonRake: { dx: 133, dy: 102, w: 130, h: 120 },
  },
  weakStun: { dx: 94, dy: 102, w: 130, h: 120 },
  aimText: 'TOO TOUGH! HIT THE GLOW',
  arenaW: 1500,
  lair: 'sovereign',
  entrance: { eye: [255, 196, 80], dark: [8, 6, 26] },
  // the Cloud Aerie: a low shelf at each side, a high ledge hung in the middle (it drifts) and a rope between the middle and the right
  perches: [
    { dx: 170, up: 115, w: 250 },
    { dx: 520, up: 195, w: 230, moving: { range: 90, speed: 0.9 } },
    { dx: 1100, up: 115, w: 230 },
  ],
  vines: [{ dx: 900, top: 340, bottom: 110 }],
  // at 35% the storm breaks: thunderheads roll in over each cliff edge (warned first). The ledges and the open middle stay clear
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
    // climbs out of reach, then falls on the marked spot. The crash leaves her stunned on the floor
    diveBomb: {
      tell: 0.95,
      act: 1.1,
      rec: 0.8,
      pose: 'fly',
      stunAfter: () => 1.9,
      crashText: 'GROUNDED!',
      onTell: (b, c) => {
        const h = makeHazard({ kind: 'mark', x: c.px, y: c.arena.floor - 3, floorY: c.arena.floor, w: 150, h: 6, warn: 0.95, warnMax: 0.95, life: 1.0, maxLife: 1.0, color: '#ef4444', color2: '#7f1d1d' });
        c.hazards.push(h);
        addMark(c, b, h, 0);
      },
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        br.air += (400 - br.air) * Math.min(1, dt * 4);
        trackMark(b, c, br.d.h0, dt, 0.55, 320);
        // she flies over the mark as she climbs
        const h = c.hazards.find((x) => x.id === br.d.h0);
        if (h) b.x += Math.max(-540 * dt, Math.min(540 * dt, h.x - b.x));
        b.facing = (h ? h.x : c.px) >= b.x ? 1 : -1;
      },
      onAct: (b, c) => {
        const h = c.hazards.find((x) => x.id === b.ai!.d.h0);
        b.ai!.d.tx = h ? h.x : c.px;
      },
      tick: (b, c, dt) => {
        const br = b.ai!;
        const dx = br.d.tx - b.x;
        // she is over the mark by the time she lands, however far off she started
        const need = Math.abs(dx) / Math.max(0.05, br.air / 1300);
        const sp = Math.max(760, need) * dt;
        b.x += Math.max(-sp, Math.min(sp, dx));
        br.air -= 1300 * dt;
        b.facing = dx >= 0 ? 1 : -1;
        br.hurt = [bodyBox(b)];
        if (br.air <= 0 && !br.d.crashed) {
          br.air = 0;
          br.d.crashed = 1;
          impact(b, c, 1.0, '#a16207');
          for (const d of [-1, 1] as const) floorWave(c, b.x + d * 120, d, b.phase >= 3 ? 340 : 290, '#fbbf24', '#92400e').look = 'feather';
        }
      },
    },
    // a fan of razor feathers. She flings her wings wide to throw them, and that leaves her chest open
    featherVolley: {
      tell: 0.65,
      act: 0.7,
      rec: 1.2,
      min: 180,
      pose: 'spit',
      onAct: (b, c) => {
        const fire = (n: number) => {
          const ang = Math.atan2(c.py - 30 - b.y, c.px - b.x);
          const half = (n - 1) / 2;
          for (let i = 0; i < n; i++) {
            const h = aimed(c, b.x + b.facing * 50, b.y, ang + (i - half) * 0.2, 330, '#fde68a', '#92400e');
            h.look = 'feather';
          }
        };
        fire(b.phase >= 2 ? 7 : 5);
        b.ai!.d.second = b.phase >= 3 ? 1 : 0;
      },
      tick: (b, c) => {
        const br = b.ai!;
        if (br.d.second && br.t > 0.38 && !br.d.fired2) {
          br.d.fired2 = 1;
          const ang = Math.atan2(c.py - 30 - b.y, c.px - b.x);
          for (let i = -1; i <= 1; i++) aimed(c, b.x, b.y, ang + i * 0.28, 360, '#fde68a', '#92400e').look = 'feather';
        }
      },
    },
    // she drops to the floor beside you and lunges with her beak. The head is low and open when it is over
    talonRake: {
      tell: 0.75,
      act: 0.55,
      rec: 1.3,
      min: 230,
      max: 600,
      pose: 'lunge',
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        br.air += (0 - br.air) * Math.min(1, dt * 5);
        if (br.air < 1) br.air = 0;
      },
      onAct: (b, c) => {
        const br = b.ai!;
        br.d.dir = b.facing;
        // how far she goes: to a beak's reach from you, never through the fence
        br.d.go = Math.max(60, Math.min(330, Math.abs(c.px - b.x) - 150));
        br.d.x0 = b.x;
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        const u = Math.min(1, t / 0.36);
        b.x = br.d.x0 + br.d.dir * br.d.go * (1 - (1 - u) * (1 - u));
        br.air = 0;
        br.hurt = [bodyBox(b), frontBox(b, c, 150, 170, 6)];
        if (u >= 1 && !br.d.slammed) {
          br.d.slammed = 1;
          c.shake(0.45);
          c.thud(false);
          c.debris(b.x + br.d.dir * (b.width / 2 + 60), c.arena.floor - 10, '#a16207');
        }
      },
    },
    // a long, high pass across the whole arena, her talons raking the height of the ledges. Stay on the floor and keep your head down
    skySweep: {
      tell: 0.8,
      act: 1.5,
      rec: 1.0,
      phase: 2,
      pose: 'fly',
      onAct: (b, c) => {
        const br = b.ai!;
        br.d.dir = b.x < (c.arena.left + c.arena.right) / 2 ? 1 : -1;
        b.facing = br.d.dir > 0 ? 1 : -1;
      },
      tick: (b, c, dt) => {
        const br = b.ai!;
        // she skims at the height where her feet clear a hero standing on the floor, but not one in the air or on a ledge
        br.air += (118 - br.air) * Math.min(1, dt * 8);
        b.x += br.d.dir * 640 * dt;
        br.hurt = [bodyBox(b)];
        const half = b.width / 2;
        if (b.x <= c.arena.left + half + 2 || b.x >= c.arena.right - half - 2) br.t = 1.5;
      },
    },
    // a swoop onto the marked spot with her talons out, which ends with her pulling up again: no crash, so her back is what is open
    snatch: {
      tell: 0.85,
      act: 0.7,
      rec: 1.2,
      phase: 2,
      min: 200,
      pose: 'fly',
      onTell: (b, c) => {
        const h = makeHazard({ kind: 'mark', x: c.px, y: c.arena.floor - 3, floorY: c.arena.floor, w: 130, h: 6, warn: 0.85, warnMax: 0.85, life: 0.9, maxLife: 0.9, color: '#ef4444', color2: '#7f1d1d' });
        c.hazards.push(h);
        addMark(c, b, h, 0);
      },
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        br.air += (230 - br.air) * Math.min(1, dt * 3);
        trackMark(b, c, br.d.h0, dt, 0.5, 300);
      },
      onAct: (b, c) => {
        const br = b.ai!;
        const h = c.hazards.find((x) => x.id === br.d.h0);
        br.d.tx = h ? h.x : c.px;
        br.d.x0 = b.x;
        br.d.a0 = br.air;
        b.facing = br.d.tx >= b.x ? 1 : -1;
      },
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        const u = Math.min(1, t / 0.7);
        // down fast, a beat at the bottom, and up again
        const reach = Math.min(1, u / 0.5);
        b.x = br.d.x0 + (br.d.tx - br.d.x0) * (reach * reach * (3 - 2 * reach));
        br.air = u < 0.5 ? br.d.a0 + (6 - br.d.a0) * (u / 0.5) : 6 + (150 - 6) * ((u - 0.5) / 0.5);
        br.hurt = [bodyBox(b)];
      },
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
  1: 'Venom Fang spits goo that slows you and slams up from the floor where you stood. Stay moving, then punish the recovery.',
  2: 'Crocus Rex rolls the length of the arena and crashes into the wall. Jump the tail sweep and hit him while he is dizzy.',
  3: 'The Shadow Prowler vanishes and reappears behind you. Watch for the fade, then turn and strike.',
  4: 'The Sky Sovereign is a giant of the air. Step off the red mark and she crashes; then hit whatever glows: her head, her chest, her talons or her back.',
  5: 'The Tarantula Queen is a giant of the hollow. Jump her venom jet, step out of the web and cocoon marks, then hit whatever glows: abdomen, fangs, eyes or chest.',
  6: 'The Marsh Reaver is a giant of the blackwater. Jump his low spear sweep and the mud waves, duck the high swipe, then hit whatever glows: back, neck, head or flank.',
  7: 'The Stone Idol Golem is a giant of the ruins. Jump his spinning hammer, slip the crystal rift, then hit whatever glows: chest, head, back or belly.',
  8: 'The Night-Wing Monarch is a giant bat. Jump her low rings and stay down for the high ones, then hit whatever glows: mouth, wing joint, talons, chest, head or back.',
  9: 'The Magma Drake breathes fire at chest height: duck or jump. Keep off the lava geysers.',
  10: 'General Iron-Claw is the last giant. Jump his shocks and clubs, dodge the lightning columns, let him crash into a wall, then hit whatever glows: head, pauldron, mouth, foot, knuckles, cape or belly.',
};

/** the secret boss lives outside the ten worlds */
export const THORNBARK_DEF = THORNBARK;

/** which boss a level has: the secret one, or its world's */
export const bossDefForLevel = (cfg: { worldIndex: number; secret?: string }): BossDef => (cfg.secret === 'thornbark' ? THORNBARK : bossDefFor(cfg.worldIndex));

BOSS_TIPS[11] = 'Thornbark mirrors your own moves, only meaner. Watch for the red glow, then punish the opening. A hook breaks his attack.';
