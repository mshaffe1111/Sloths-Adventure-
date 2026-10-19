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
  w: 120,
  h: 78,
  artDy: 0,
  speed: [46, 62, 84],
  prefer: 290,
  gap: [1.5, 1.1, 0.8],
  color: '#84cc16',
  color2: '#365314',
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
        const mouth = { x: b.x + b.facing * (b.width / 2), y: c.arena.floor - 70 };
        const shots = phase >= 3 ? [-170, 0, 170] : phase === 2 ? [-120, 120] : [0];
        for (const off of shots) {
          const h = lob(c, mouth.x, mouth.y, c.px + off, 0.85 + Math.abs(off) * 0.0008, { kind: 'glob', onLand: 'puddle', color: '#a3e635', color2: '#3f6212', dmg: 1, look: 'venom' });
          h.dir = b.facing;
        }
      },
    },
    // the head strikes a long way forward: duck-proof, so back away or jump it
    lunge: {
      tell: 0.65,
      act: 0.38,
      rec: 1.1,
      max: 330,
      pose: 'lunge',
      onAct: (b) => {
        b.ai!.d.dir = b.facing;
      },
      tick: (b, c, dt) => {
        const br = b.ai!;
        const dir = br.d.dir;
        b.x += dir * 520 * dt;
        br.hurt = [frontBox(b, c, 90, 66, 20), bodyBox(b)];
      },
    },
    // the tail bursts up from the floor under where you were standing
    tailSlam: {
      tell: 0.95,
      act: 0.4,
      rec: 1.0,
      pose: 'whip',
      onTell: (b, c) => {
        const h = column(c, c.px, 0.95, 150, '#65a30d', '#365314', 0.55);
        h.look = 'tail';
        addMark(c, b, h, 0);
        if (b.phase >= 2) {
          for (const [slot, off] of [[1, -200], [2, 200]] as const) {
            if (slot === 2 && b.phase < 3) continue;
            const e = column(c, c.px + off, 0.95, 150, '#65a30d', '#365314', 0.55);
            e.look = 'tail';
            addMark(c, b, e, slot);
          }
        }
      },
      tellTick: (b, c, dt) => {
        trackMark(b, c, b.ai!.d.h0, dt, 0.55);
        if (b.ai!.d.h1) trackMark(b, c, b.ai!.d.h1, dt, 0.55, 260, -200);
        if (b.ai!.d.h2) trackMark(b, c, b.ai!.d.h2, dt, 0.55, 260, 200);
      },
    },
  },
};

// ───────────────────────────── 2. Crocus Rex: river king ─────────────────────────────

const CROC: BossDef = {
  world: 2,
  name: 'Crocus Rex',
  w: 150,
  h: 58,
  artDy: 0,
  speed: [38, 52, 70],
  prefer: 230,
  gap: [1.4, 1.0, 0.7],
  chain: 0.4,
  color: '#7a5c2e',
  color2: '#3b2a12',
  moves: {
    // rears back with the jaws wide, then rolls across the whole arena. Crashing into the wall leaves it dizzy
    deathRoll: chargeMove({ tell: 1.0, maxT: 1.9, rec: 0.9, speed: 520, stun: 1.9, text: 'DIZZY!', min: 160 }),
    // a low spinning sweep of the tail on both sides: jump it
    tailWhip: {
      tell: 0.55,
      act: 0.32,
      rec: 0.9,
      max: 250,
      pose: 'whip',
      tick: (b, c) => {
        b.ai!.hurt = [...bothSides(b, c, 95, 34, 0), bodyBox(b)];
      },
    },
    // slams the floor and sends mud waves both ways
    mudSurge: {
      tell: 0.85,
      act: 0.15,
      rec: 1.2,
      phase: 2,
      pose: 'slam',
      onAct: (b, c) => {
        impact(b, c, 0.55, '#7a5c2e');
        for (const d of [-1, 1] as const) {
          const w = floorWave(c, b.x + d * (b.width / 2 + 10), d, 300, '#8b6b3a', '#4a3416');
          w.look = 'mud';
        }
      },
    },
  },
};

// ───────────────────────────── 3. Shadow Prowler: night jaguar ─────────────────────────────

const PROWLER: BossDef = {
  world: 3,
  name: 'Shadow Prowler',
  w: 86,
  h: 64,
  artDy: 0,
  speed: [92, 130, 172],
  prefer: 210,
  gap: [1.1, 0.8, 0.55],
  chain: 0.45,
  color: '#c084fc',
  color2: '#3b0764',
  moves: {
    // a quick crouch, then a long pounce to where you were standing
    pounce: leapMove({
      tell: 0.45,
      act: 0.62,
      rec: 0.7,
      height: 150,
      min: 150,
      onLand: (b, c) => impact(b, c, 0.3, '#7c3aed'),
    }),
    // vanishes, reappears behind you and slashes
    shadowStep: {
      tell: 0.55,
      act: 0.3,
      rec: 0.8,
      pose: 'fade',
      tellTick: (b) => {
        const br = b.ai!;
        br.alpha = Math.max(0.08, 1 - (br.t / 0.55) * 0.95);
      },
      onAct: (b, c) => {
        const br = b.ai!;
        const half = b.width / 2;
        // behind the player, on the side away from where it was
        let side = c.px >= b.x ? 1 : -1;
        const spot = (sd: number) => Math.max(c.arena.left + half, Math.min(c.arena.right - half, c.px + sd * 120));
        // against a wall the clamp would drop it right on the hero: use the open side instead
        if (Math.abs(spot(side) - c.px) < 90) side = -side;
        b.x = spot(side);
        b.facing = b.x > c.px ? -1 : 1;
        br.alpha = 1;
        c.debris(b.x, c.arena.floor - 20, '#7c3aed');
      },
      tick: (b, c) => {
        // the slash lands a beat after it appears (0.14 s), so there is time to react to where it came out
        if (b.ai!.t >= 0.14 && b.ai!.t < 0.3) b.ai!.hurt = [frontBox(b, c, 100, 56, 6)];
      },
    },
    // three quick slashes while stepping forward
    clawCombo: {
      tell: 0.45,
      act: 0.95,
      rec: 1.0,
      max: 200,
      pose: 'bite',
      tick: (b, c, dt, t) => {
        const br = b.ai!;
        b.x += b.facing * 70 * dt;
        const windows: Array<[number, number]> = [[0.1, 0.28], [0.4, 0.58], [0.7, 0.88]];
        if (windows.some(([a, z]) => t >= a && t <= z)) br.hurt = [frontBox(b, c, 96, 58, 6)];
      },
    },
    // a lightning dash from one end of the arena to the other
    streak: chargeMove({ tell: 0.6, maxT: 1.0, rec: 0.9, speed: 780, phase: 2, min: 250 }),
  },
};

// ───────────────────────────── 4. Sky Sovereign: harpy eagle ─────────────────────────────

const SOVEREIGN: BossDef = {
  world: 4,
  name: 'Sky Sovereign',
  w: 92,
  h: 92,
  artDy: 0,
  speed: [78, 105, 140],
  prefer: 260,
  hover: 100,
  gap: [1.3, 0.95, 0.7],
  chain: 0.35,
  color: '#f59e0b',
  color2: '#78350f',
  moves: {
    // climbs out of reach, then falls on the marked spot. The crash leaves her stunned on the floor
    diveBomb: {
      tell: 0.9,
      act: 1.3,
      rec: 0.8,
      pose: 'fly',
      stunAfter: () => 1.7,
      crashText: 'GROUNDED!',
      onTell: (b, c) => {
        const h = makeHazard({ kind: 'mark', x: c.px, y: c.arena.floor - 3, floorY: c.arena.floor, w: 70, h: 6, warn: 0.9, warnMax: 0.9, life: 0.95, maxLife: 0.95, color: '#ef4444', color2: '#7f1d1d' });
        c.hazards.push(h);
        addMark(c, b, h, 0);
      },
      tellTick: (b, c, dt) => {
        const br = b.ai!;
        br.air += (300 - br.air) * Math.min(1, dt * 4);
        trackMark(b, c, br.d.h0, dt, 0.55, 320);
      },
      onAct: (b, c) => {
        const h = c.hazards.find((x) => x.id === b.ai!.d.h0);
        b.ai!.d.tx = h ? h.x : c.px;
      },
      tick: (b, c, dt) => {
        const br = b.ai!;
        const dx = br.d.tx - b.x;
        b.x += Math.max(-760 * dt, Math.min(760 * dt, dx));
        br.air -= 1150 * dt;
        b.facing = dx >= 0 ? 1 : -1;
        br.hurt = [bodyBox(b)];
        if (br.air <= 0 && !br.d.crashed) {
          br.air = 0;
          br.d.crashed = 1;
          impact(b, c, 0.8, '#a16207');
          for (const d of [-1, 1] as const) floorWave(c, b.x + d * 40, d, 280, '#fbbf24', '#92400e').look = 'feather';
        }
      },
    },
    // a fan of razor feathers
    featherVolley: {
      tell: 0.6,
      act: 0.7,
      rec: 1.1,
      min: 180,
      pose: 'spit',
      onAct: (b, c) => {
        const fire = (n: number) => {
          const ang = Math.atan2(c.py - 30 - b.y, c.px - b.x);
          const half = (n - 1) / 2;
          for (let i = 0; i < n; i++) {
            const h = aimed(c, b.x + b.facing * 30, b.y, ang + (i - half) * 0.2, 330, '#fde68a', '#92400e');
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
    // a low pass across the whole arena: jump it or stomp-dive under her
    strafe: {
      tell: 0.7,
      act: 1.2,
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
        br.air += (36 - br.air) * Math.min(1, dt * 8);
        b.x += br.d.dir * 720 * dt;
        br.hurt = [bodyBox(b)];
        const half = b.width / 2;
        if (b.x <= c.arena.left + half + 2 || b.x >= c.arena.right - half - 2) br.t = 1.2;
      },
    },
  },
};

// ───────────────────────────── 5. Tarantula Queen ─────────────────────────────

const QUEEN: BossDef = {
  world: 5,
  name: 'Tarantula Queen',
  w: 132,
  h: 74,
  artDy: 0,
  speed: [46, 62, 88],
  prefer: 300,
  gap: [1.3, 1.0, 0.75],
  color: '#e5e7eb',
  color2: '#4b5563',
  moves: {
    // a sticky shot that slows you for a few seconds
    webShot: {
      tell: 0.6,
      act: 0.25,
      rec: 1.1,
      min: 140,
      pose: 'spit',
      onAct: (b, c) => {
        const h = lob(c, b.x + b.facing * 50, c.arena.floor - 60, c.px, 0.7, { kind: 'web', eff: 'slow', dmg: 0, color: '#f8fafc', color2: '#94a3b8', w: 34, h: 34 });
        h.look = 'web';
      },
    },
    // calls spiderlings down from the canopy (or spits if the nest is already full)
    callBrood: {
      tell: 0.9,
      act: 0.2,
      rec: 1.3,
      pose: 'roar',
      onAct: (b, c) => {
        if (c.minionsAlive >= 3) {
          lob(c, b.x, c.arena.floor - 60, c.px, 0.7, { kind: 'web', eff: 'slow', dmg: 0, color: '#f8fafc', color2: '#94a3b8', w: 34, h: 34 }).look = 'web';
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
      act: 0.55,
      rec: 1.0,
      height: 120,
      min: 120,
      max: 480,
      onLand: (b, c) => {
        impact(b, c, 0.4, '#9ca3af');
        b.ai!.d.bite = 1;
      },
    }),
    // strands of web rise (marked first) either side of where you stand: a gap in the middle stays open
    webCurtain: {
      tell: 1.0,
      act: 0.3,
      rec: 1.4,
      phase: 3,
      pose: 'roar',
      onAct: (b, c) => {
        for (const off of [-300, -140, 140, 300]) {
          const x = Math.max(c.arena.left + 60, Math.min(c.arena.right - 60, c.px + off));
          const h = column(c, x, 0.8, 190, '#f8fafc', '#94a3b8', 1.8);
          h.w = 34;
          h.look = 'web';
        }
        c.shake(0.35);
      },
    },
  },
};

// ───────────────────────────── 6. Marsh Reaver: the spear-wielding giant otter ─────────────────────────────

const REAVER: BossDef = {
  world: 6,
  name: 'Marsh Reaver',
  w: 110,
  h: 112,
  artDy: 0,
  speed: [46, 64, 90],
  prefer: 280,
  gap: [1.5, 1.1, 0.8],
  color: '#7dd3fc',
  color2: '#0c4a6e',
  moves: {
    // a vault and an overhead smash: waves of mud both ways. Long recovery
    vaultSmash: leapMove({
      tell: 0.85,
      act: 0.9,
      rec: 1.6,
      height: 230,
      onLand: (b, c) => {
        impact(b, c, 0.8, '#365314');
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * (b.width / 2), d, 330, '#4d7c0f', '#1a2e05', true).look = 'mud';
      },
    }),
    // a long spear thrust at chest height: duck under it or jump it
    spearThrust: {
      tell: 0.6,
      act: 0.4,
      rec: 1.0,
      max: 400,
      pose: 'lunge',
      onAct: (b, c) => {
        const h = beam(c, b, 440, 44, 36, 0, 0.32, '#e0f2fe', '#0c4a6e');
        h.look = 'jab';
      },
    },
    // three slung clods of swamp that land as slowing puddles
    mudSling: {
      tell: 0.7,
      act: 0.3,
      rec: 1.3,
      min: 160,
      pose: 'spit',
      onAct: (b, c) => {
        for (const off of [-160, 0, 160]) {
          const h = lob(c, b.x + b.facing * 40, c.arena.floor - 70, c.px + off, 0.85, { kind: 'glob', onLand: 'puddle', color: '#65a30d', color2: '#1a2e05', w: 32, h: 32 });
          h.look = 'mud';
        }
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
        c.shake(0.4);
        for (const d of [-1, 1] as const) headWave(c, b.x + d * (b.width / 2), d, 300, '#bae6fd', '#0369a1');
      },
    },
  },
};

// ───────────────────────────── 7. Stone Idol Golem ─────────────────────────────

const GOLEM: BossDef = {
  world: 7,
  name: 'Stone Idol Golem',
  w: 112,
  h: 140,
  artDy: 0,
  speed: [30, 40, 56],
  prefer: 280,
  gap: [1.5, 1.1, 0.85],
  color: '#a8a29e',
  color2: '#44403c',
  moves: {
    // both fists come down. They stick in the floor: free hits while it pulls them out
    fistSlam: {
      tell: 1.0,
      act: 0.3,
      rec: 0.3,
      min: 0,
      max: 340,
      pose: 'slam',
      crashText: 'FISTS STUCK!',
      stunAfter: () => 2.4,
      interruptible: false,
      onAct: (b, c) => {
        impact(b, c, 0.8, '#a8a29e');
        const x = b.x + b.facing * (b.width / 2 + 40);
        const h = column(c, x, 0.0001, 120, '#a8a29e', '#44403c', 0.3);
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
          dropAt(c, cx, 0.9, 38, '#a8a29e', '#57534e').look = 'rock';
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
        beam(c, b, 640, 16, 32, 0, 0.55, '#fde047', '#b45309').look = 'laser';
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
        for (const off of [-120, 140]) dropAt(c, Math.max(c.arena.left + 30, Math.min(c.arena.right - 30, c.px + off)), 0.9, 34, '#a8a29e', '#57534e').look = 'rock';
      },
    },
  },
};

// ───────────────────────────── 8. Night-Wing Monarch ─────────────────────────────

const MONARCH: BossDef = {
  world: 8,
  name: 'Night-Wing Monarch',
  w: 104,
  h: 72,
  artDy: 0,
  speed: [80, 108, 146],
  prefer: 250,
  hover: 150,
  gap: [1.2, 0.9, 0.65],
  chain: 0.4,
  color: '#a78bfa',
  color2: '#2e1065',
  moves: {
    // a piercing shriek: rings at head height race away in both directions
    screech: {
      tell: 0.75,
      act: 0.15,
      rec: 1.0,
      pose: 'roar',
      onAct: (b, c) => {
        c.roar();
        c.shake(0.3);
        for (const d of [-1, 1] as const) headWave(c, b.x + d * 40, d, 330, '#c4b5fd', '#5b21b6');
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
        br.d.x1 = b.x < c.px ? Math.min(c.arena.right - 70, c.px + 330) : Math.max(c.arena.left + 70, c.px - 330);
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
    // stalactites crack loose and drop on marked spots
    stalactites: {
      tell: 0.8,
      act: 0.2,
      rec: 1.1,
      phase: 2,
      pose: 'roar',
      onAct: (b, c) => {
        for (let i = 0; i < 5; i++) {
          const x = Math.max(c.arena.left + 30, Math.min(c.arena.right - 30, c.px + (i - 2) * 150 + (c.rnd() - 0.5) * 60));
          dropAt(c, x, 0.8 + i * 0.12, 30, '#c4b5fd', '#4c1d95').look = 'spike';
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
        for (const d of [-1, 1] as const) headWave(c, b.x + d * 40, d, 360, '#c4b5fd', '#5b21b6');
        br.d.x0 = b.x;
        br.d.x1 = b.x < c.px ? Math.min(c.arena.right - 70, c.px + 260) : Math.max(c.arena.left + 70, c.px - 260);
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
  },
};

// ───────────────────────────── 9. Magma Drake ─────────────────────────────

const DRAKE: BossDef = {
  world: 9,
  name: 'Magma Drake',
  // a giant: the painted frames are drawn 3.2 times their old size, so Slomatt is a small figure under it
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

const GENERAL: BossDef = {
  world: 10,
  name: 'General Iron-Claw',
  w: 104,
  h: 132,
  artDy: 0,
  speed: [58, 82, 112],
  prefer: 260,
  gap: [1.1, 0.85, 0.6],
  chain: 0.5,
  color: '#fca5a5',
  color2: '#450a0a',
  moves: {
    // brings the iron staff down in front of him, with a shock along the ground
    staffSlam: {
      tell: 0.75,
      act: 0.28,
      rec: 1.1,
      max: 300,
      pose: 'slam',
      onAct: (b, c) => {
        impact(b, c, 0.6, '#9ca3af');
        const x = b.x + b.facing * (b.width / 2 + 60);
        floorWave(c, x, b.facing, 320, '#d1d5db', '#4b5563').look = 'rock';
      },
      tick: (b, c) => {
        b.ai!.hurt = [frontBox(b, c, 130, 120, 0)];
      },
    },
    // hurls his spiked clubs: one low, one high in the later phases
    spearThrow: {
      tell: 0.65,
      act: 0.5,
      rec: 1.0,
      min: 200,
      pose: 'spit',
      onAct: (b, c) => {
        const x = b.x + b.facing * 50;
        bolt(c, x, c.arena.floor - 22, b.facing, 540, '#e5e7eb', '#6b7280', 18).look = 'club';
        b.ai!.d.second = b.phase >= 2 ? 1 : 0;
      },
      tick: (b, c) => {
        const br = b.ai!;
        if (br.d.second && br.t > 0.28 && !br.d.fired2) {
          br.d.fired2 = 1;
          bolt(c, b.x + b.facing * 50, c.arena.floor - 62, b.facing, 540, '#e5e7eb', '#6b7280', 18).look = 'club';
        }
      },
    },
    // calls his soldiers (or pounds the ground when they are already out)
    warCry: {
      tell: 1.0,
      act: 0.2,
      rec: 1.3,
      pose: 'roar',
      onAct: (b, c) => {
        c.roar();
        if (c.minionsAlive >= 2) {
          for (const d of [-1, 1] as const) floorWave(c, b.x + d * 60, d, 320, '#d1d5db', '#4b5563').look = 'rock';
          return;
        }
        c.spawnMinion('ocelot', c.arena.left + 60, c.arena.floor - 20);
        c.spawnMinion('ocelot', c.arena.right - 60, c.arena.floor - 20);
        c.shake(0.3);
      },
    },
    // a thunderous charge: crashing into the wall dazes him
    ironCharge: chargeMove({ tell: 0.9, maxT: 1.8, rec: 0.9, speed: 560, stun: 1.8, text: 'DAZED!', min: 200, phase: 2 }),
    // leaps and pounds: waves both ways and rocks from the roof
    groundPound: {
      tell: 0.9,
      act: 0.2,
      rec: 1.3,
      phase: 3,
      pose: 'slam',
      onAct: (b, c) => {
        impact(b, c, 0.9, '#9ca3af');
        for (const d of [-1, 1] as const) floorWave(c, b.x + d * 50, d, 340, '#d1d5db', '#4b5563', true).look = 'rock';
        for (const off of [-150, 0, 150]) dropAt(c, Math.max(c.arena.left + 30, Math.min(c.arena.right - 30, c.px + off)), 0.9, 34, '#a8a29e', '#57534e').look = 'rock';
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
  4: 'The Sky Sovereign dives on the red mark. Step aside, and she is stuck on the ground for a moment.',
  5: 'The Tarantula Queen webs you to slow you down and calls her brood. Clear the spiderlings, then hit her.',
  6: 'The Marsh Reaver vaults and smashes the ground, sending mud waves both ways. Jump them, then duck under the spear thrust.',
  7: 'The Idol Golem’s fists get stuck after a slam. That is your chance. Stay clear of the falling rocks.',
  8: 'The Night-Wing Monarch screeches rings at head height. Duck or jump, then hit her when she swoops low.',
  9: 'The Magma Drake breathes fire at chest height: duck or jump. Keep off the lava geysers.',
  10: 'General Iron-Claw charges and crashes into the wall. Keep an eye on his soldiers and spears.',
};

/** the secret boss lives outside the ten worlds */
export const THORNBARK_DEF = THORNBARK;

/** which boss a level has: the secret one, or its world's */
export const bossDefForLevel = (cfg: { worldIndex: number; secret?: string }): BossDef => (cfg.secret === 'thornbark' ? THORNBARK : bossDefFor(cfg.worldIndex));

BOSS_TIPS[11] = 'Thornbark mirrors your own moves, only meaner. Watch for the red glow, then punish the opening. A hook breaks his attack.';
