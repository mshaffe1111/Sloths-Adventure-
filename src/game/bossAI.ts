/**
 * Boss brain: a small state machine every boss shares, plus the hazards their attacks create.
 *
 *   roar (entrance / phase change, untouchable)
 *     -> idle (walk or hover toward a good distance)
 *       -> tell  (the warning: armored, the boss visibly winds up)
 *         -> act (the attack itself: armored, can hurt you)
 *           -> rec (recovery: wide open, hit it now)      -> idle
 *   stun (knocked out of an attack by a heavy hit, or crashed into a wall): wide open
 *
 * Each boss is a list of moves (bossDefs.ts). Moves are plain data plus a few hooks, so the same engine
 * gives every world's boss a different fight. This file has no canvas and no engine in it, so it can be
 * tested by simply stepping it.
 */
import type { BossEntity } from './types.ts';
import type { Rect } from './fight.ts';

// ───────────────────────────── hazards ─────────────────────────────

export type HazardKind =
  | 'glob' // lobbed blob; lands as a puddle if `onLand` says so
  | 'puddle' // sits on the floor and slows / hurts
  | 'shock' // a wave that runs along the floor (jump it)
  | 'wave' // a wave at head height (duck it or jump it)
  | 'drop' // marked spot, then something falls on it
  | 'column' // marked spot, then something erupts from the floor
  | 'beam' // a long straight blast
  | 'bolt' // a fast straight projectile
  | 'web' // projectile that sticks you (slows, no damage)
  | 'mark'; // a warning marker only (nothing hurts)

export interface BossHazard {
  id: number;
  kind: HazardKind;
  /** centre of the hitbox */
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  /** gravity (px/s²) for lobbed things */
  g: number;
  /** seconds of warning before it becomes dangerous (drop / column / beam) */
  warn: number;
  warnMax: number;
  life: number;
  maxLife: number;
  dmg: number;
  /** what it does besides damage */
  eff: 'none' | 'slow';
  onLand: 'none' | 'puddle' | 'quake';
  /** has already damaged the player (projectiles vanish after one hit) */
  spent: boolean;
  /** 1 = runs right, -1 = left (drawing) */
  dir: number;
  color: string;
  color2: string;
  /** for drops: where it lands (x) and the floor line */
  floorY: number;
  /** where a beam starts / which way it points */
  ox?: number;
  oy?: number;
  /** drawing seed so two of the same thing do not look identical */
  seed: number;
  /** what it looks like: 'web' | 'lava' | 'rock' | 'spike' | 'fire' | 'feather' | 'spear' | 'mud' | 'venom' | '' */
  look: string;
}

let hazardId = 1;

export function makeHazard(h: Partial<BossHazard> & { kind: HazardKind; x: number; y: number; floorY: number }): BossHazard {
  return {
    id: hazardId++,
    w: 30,
    h: 30,
    vx: 0,
    vy: 0,
    g: 0,
    warn: 0,
    warnMax: 0,
    life: 2,
    maxLife: 2,
    dmg: 1,
    eff: 'none',
    onLand: 'none',
    spent: false,
    dir: 1,
    color: '#86efac',
    color2: '#166534',
    seed: Math.random() * 1000,
    look: '',
    ...h,
  };
}

/** the box that hurts the player, or null while the hazard is only a warning */
export function hazardBox(h: BossHazard): Rect | null {
  if (h.warn > 0 || h.spent || h.kind === 'mark') return null;
  if (h.kind === 'drop' && h.life <= 0) return null;
  return { x: h.x - h.w / 2, y: h.y - h.h / 2, w: h.w, h: h.h };
}

// ───────────────────────────── boss brain ─────────────────────────────

export type BossState = 'roar' | 'idle' | 'tell' | 'act' | 'rec' | 'stun' | 'dying';

export interface BossBrain {
  state: BossState;
  move: string | null;
  /** seconds in the current state */
  t: number;
  /** seconds left in idle before the next decision */
  idle: number;
  /** length of the current stun / roar */
  hold: number;
  recent: string[];
  /** scratch numbers for the current move (direction, target x, hits landed ...) */
  d: Record<string, number>;
  /** current attack boxes that hurt the player (world coordinates) */
  hurt: Rect[];
  /** height of the boss's feet above the floor (flyers, leapers) */
  air: number;
  /** 0..1 how see-through (the prowler's shadow step) */
  alpha: number;
  /** why the roar happened (so the engine can react) */
  roarReason: 'enter' | 'phase';
  /** moves left in a chained combo */
  chain: number;
  /** heavy hits taken mid-attack; two in a short time break the attack */
  poise: number;
  /** seconds until the poise count is forgotten */
  poiseT: number;
  /** seconds before another attack can be broken (a stun is not a loop) */
  breakCd: number;
}

export function newBrain(): BossBrain {
  return { state: 'roar', move: null, t: 0, idle: 1, hold: 1.4, recent: [], d: {}, hurt: [], air: 0, alpha: 1, roarReason: 'enter', chain: 0, poise: 0, poiseT: 0, breakCd: 0 };
}

export interface Arena {
  left: number;
  right: number;
  floor: number;
}

/** what a boss needs from the world; the engine fills this in every tick */
export interface BossCtx {
  /** the player's feet */
  px: number;
  py: number;
  pGrounded: boolean;
  pDucking: boolean;
  arena: Arena;
  rnd: () => number;
  hazards: BossHazard[];
  /** number of enemies a boss summoned that are still alive */
  minionsAlive: number;
  spawnMinion: (kind: 'spider' | 'snake' | 'ocelot' | 'frog' | 'eagle' | 'tayra', x: number, y: number) => void;
  shake: (amount: number) => void;
  roar: () => void;
  thud: (heavy?: boolean) => void;
  debris: (x: number, y: number, color: string) => void;
  text: (msg: string, x: number, y: number, color: string) => void;
}

export interface MoveDef {
  /** seconds of warning (armored, the boss winds up and the world shows where it will land) */
  tell: number;
  /** seconds the attack itself lasts */
  act: number;
  /** seconds of recovery: the boss is wide open */
  rec: number;
  /** pick this move only when the player is between these distances */
  min?: number;
  max?: number;
  /** first phase this move is allowed in */
  phase?: number;
  weight?: number;
  /** what the drawing should do (see bossArt.poseFor) */
  pose: 'bite' | 'lunge' | 'slam' | 'leap' | 'rear' | 'spit' | 'charge' | 'fly' | 'fade' | 'whip' | 'roar';
  /** a heavy hit (hook, mega) during the windup / attack knocks the boss out of it */
  interruptible?: boolean;
  /** the boss starts the windup: choose a direction, drop a warning marker */
  onTell?: (b: BossEntity, c: BossCtx) => void;
  /** the windup is still running (for example the marker follows the player for a moment) */
  tellTick?: (b: BossEntity, c: BossCtx, dt: number) => void;
  /** the attack begins */
  onAct?: (b: BossEntity, c: BossCtx) => void;
  /** every tick of the attack: move the body, set the hurt boxes */
  tick?: (b: BossEntity, c: BossCtx, dt: number, t: number) => void;
  /** the attack ended on its own (not interrupted) */
  onEnd?: (b: BossEntity, c: BossCtx) => void;
  /** after this move, the boss is stunned instead of recovering (it crashed into something) */
  stunAfter?: (b: BossEntity) => number;
  /** what to show when it crashes */
  crashText?: string;
}

export interface BossDef {
  world: number;
  name: string;
  /** hurt box (the body that takes hits and hurts on contact) */
  w: number;
  h: number;
  /** drawing: pixels to shift the art so its feet land on the floor */
  artDy: number;
  /** walk speed by phase 1..3 */
  speed: [number, number, number];
  /** distance the boss likes to keep from the player while it decides */
  prefer: number;
  /** seconds of walking before the next move, by phase */
  gap: [number, number, number];
  /** hovering height while idle (flyers), 0 = on the floor */
  hover?: number;
  /** chance (phase 3) to chain straight into another move */
  chain?: number;
  moves: Record<string, MoveDef>;
  /** the world's colours for hazards */
  color: string;
  color2: string;
  /** hit points, when it is not the usual world formula */
  hp?: number;
  /** drawn as a fighter (the evil sloth) instead of one of the animal rigs */
  puppet?: 'thornbark';
}

/** boss hit points: 41 in world 1, 122 in world 10 (a jab does 1, a hook or kick 2) */
export const bossMaxHp = (world: number) => 32 + world * 9;

export function phaseFor(hp: number, maxHp: number): 1 | 2 | 3 {
  const r = hp / Math.max(1, maxHp);
  return r <= 0.35 ? 3 : r <= 0.7 ? 2 : 1;
}

/** can the player hurt it right now, and how hard? */
export function vulnerability(b: BossEntity): 'closed' | 'armored' | 'open' | 'stunned' {
  const br = b.ai;
  if (!br) return 'open';
  switch (br.state) {
    case 'roar':
    case 'dying':
      return 'closed';
    case 'tell':
    case 'act':
      return 'armored';
    case 'stun':
      return 'stunned';
    default:
      return 'open';
  }
}

/** the body only hurts while the boss is winding up or attacking, so walking up to hit it in its opening is safe */
export function bodyHurts(b: BossEntity): boolean {
  const br = b.ai;
  if (!br) return false;
  // the first moment of a wind-up is grace, so a hero standing in the boss when it begins can step out (or be pushed out) first
  return br.state === 'act' || (br.state === 'tell' && br.t > 0.3);
}

function face(b: BossEntity, c: BossCtx) {
  b.facing = c.px < b.x ? -1 : 1;
}

function pickMove(b: BossEntity, def: BossDef, c: BossCtx, phase: number): string {
  const br = b.ai!;
  const dist = Math.abs(c.px - b.x);
  const names = Object.keys(def.moves);
  const eligible = names.filter((n) => {
    const m = def.moves[n];
    if ((m.phase ?? 1) > phase) return false;
    if (m.min !== undefined && dist < m.min) return false;
    if (m.max !== undefined && dist > m.max) return false;
    return true;
  });
  let pool = eligible.length ? eligible : names.filter((n) => (def.moves[n].phase ?? 1) <= phase);
  // never the same move three times running, and avoid the last one when there is a choice
  const last = br.recent[br.recent.length - 1];
  const fresh = pool.filter((n) => n !== last);
  if (fresh.length) pool = fresh;
  else if (last && br.recent.length >= 2 && br.recent[br.recent.length - 2] === last) {
    // only one move suits this distance and it has already run twice (a hero hugging the boss): make it use another one
    // anyway, whatever the range, so no boss can be locked to a single move
    const other = names.filter((n) => n !== last && (def.moves[n].phase ?? 1) <= phase);
    if (other.length) pool = other;
  }
  const total = pool.reduce((s, n) => s + (def.moves[n].weight ?? 1), 0);
  let r = c.rnd() * total;
  for (const n of pool) {
    r -= def.moves[n].weight ?? 1;
    if (r <= 0) return n;
  }
  return pool[0];
}

function startMove(b: BossEntity, def: BossDef, c: BossCtx, name: string) {
  const br = b.ai!;
  const m = def.moves[name];
  br.state = 'tell';
  br.move = name;
  br.t = 0;
  br.d = {};
  br.hurt = [];
  br.recent.push(name);
  if (br.recent.length > 3) br.recent.shift();
  face(b, c);
  b.telegraphTimer = m.tell;
  b.isAttacking = false;
  m.onTell?.(b, c);
}

function clampToArena(b: BossEntity, c: BossCtx) {
  const half = b.width / 2;
  b.x = Math.max(c.arena.left + half, Math.min(c.arena.right - half, b.x));
}

/** one tick of the boss. Returns the phase the boss is now in (so the engine can react to a change). */
export function stepBoss(b: BossEntity, def: BossDef, c: BossCtx, dt: number): void {
  const br = b.ai!;
  br.t += dt;
  if (br.breakCd > 0) br.breakCd -= dt;
  if (br.poiseT > 0 && (br.poiseT -= dt) <= 0) br.poise = 0;
  const phase = phaseFor(b.hp, b.maxHp);
  const m = br.move ? def.moves[br.move] : null;
  br.hurt = [];

  // phase change: stop whatever it was doing and roar
  if (phase > b.phase && br.state !== 'dying') {
    b.phase = phase;
    br.state = 'roar';
    br.roarReason = 'phase';
    br.t = 0;
    br.hold = 1.3;
    br.move = null;
    b.telegraphTimer = 0;
    b.isAttacking = false;
    br.air = def.hover ?? 0;
    c.roar();
    c.shake(0.55);
    return;
  }

  switch (br.state) {
    case 'roar': {
      face(b, c);
      if (br.t >= br.hold) {
        br.state = 'idle';
        br.t = 0;
        br.idle = br.roarReason === 'enter' ? 0.8 : 0.9;
      }
      break;
    }

    case 'idle': {
      face(b, c);
      const hover = def.hover ?? 0;
      // flyers float to their hover height
      br.air += (hover - br.air) * Math.min(1, dt * 3);
      // walk toward a comfortable distance (and back off if crowded)
      const dx = c.px - b.x;
      const dist = Math.abs(dx);
      const speed = def.speed[phase - 1];
      if (dist > def.prefer + 30) b.x += Math.sign(dx) * speed * dt;
      else if (dist < def.prefer - 70) b.x -= Math.sign(dx) * speed * 0.7 * dt;
      clampToArena(b, c);
      br.idle -= dt;
      if (br.idle <= 0) startMove(b, def, c, pickMove(b, def, c, phase));
      break;
    }

    case 'tell': {
      if (!m) break;
      b.telegraphTimer = Math.max(0, m.tell - br.t);
      // it keeps watching you for the first half of the windup, then commits
      if (br.t < m.tell * 0.5) face(b, c);
      m.tellTick?.(b, c, dt);
      if (br.t >= m.tell) {
        br.state = 'act';
        br.t = 0;
        b.telegraphTimer = 0;
        b.isAttacking = true;
        m.onAct?.(b, c);
      }
      clampToArena(b, c);
      break;
    }

    case 'act': {
      if (!m) break;
      m.tick?.(b, c, dt, br.t);
      clampToArena(b, c);
      const stun = br.d.crashed ? (m.stunAfter?.(b) ?? 0) : 0;
      if (stun > 0) {
        br.state = 'stun';
        br.t = 0;
        br.hold = stun;
        b.isAttacking = false;
        br.hurt = [];
        c.text(m?.crashText ?? 'CRASH!', b.x, b.y - b.height, '#fde047');
        break;
      }
      if (br.t >= m.act) {
        b.isAttacking = false;
        m.onEnd?.(b, c);
        br.state = 'rec';
        br.t = 0;
        br.hurt = [];
      }
      break;
    }

    case 'rec': {
      face(b, c);
      // flyers settle back toward their hover height while they recover
      br.air += ((def.hover ?? 0) * 0.35 - br.air) * Math.min(1, dt * 2.5);
      if (br.air < 1) br.air = 0;
      if (m && br.t >= m.rec) {
        const again = phase >= 3 && def.chain && c.rnd() < def.chain;
        if (again) {
          br.state = 'idle';
          br.idle = 0.01;
        } else {
          br.state = 'idle';
          br.idle = def.gap[phase - 1] * (0.8 + c.rnd() * 0.4);
        }
        br.t = 0;
      }
      break;
    }

    case 'stun': {
      br.air += (0 - br.air) * Math.min(1, dt * 6);
      if (br.air < 1) br.air = 0;
      if (br.t >= br.hold) {
        br.state = 'idle';
        br.t = 0;
        br.idle = 0.7;
      }
      break;
    }

    case 'dying':
      break;
  }

  // body position from feet
  b.y = c.arena.floor - b.height / 2 - br.air;
}

/**
 * A heavy hit during a move. One only chips the boss's poise; a second within a few seconds breaks the attack,
 * and after a break it holds firm for a while (so a kick can't be spammed to cancel every move).
 * Returns true if the boss was knocked out of its attack.
 */
export function interruptBoss(b: BossEntity, def: BossDef, c: BossCtx): boolean {
  const br = b.ai;
  if (!br || (br.state !== 'tell' && br.state !== 'act')) return false;
  const m = br.move ? def.moves[br.move] : null;
  if (m && m.interruptible === false) return false;
  br.poise += 1;
  br.poiseT = 3.5;
  if (br.poise < 2 || br.breakCd > 0) return false;
  br.poise = 0;
  br.breakCd = 5;
  br.state = 'stun';
  br.t = 0;
  br.hold = 1.1;
  br.hurt = [];
  b.telegraphTimer = 0;
  b.isAttacking = false;
  c.text('STAGGERED!', b.x, b.y - b.height, '#fde047');
  return true;
}

// ───────────────────────────── hazards over time ─────────────────────────────

export interface HazardEvents {
  /** a floor impact (drops, leaps): the engine adds sound, shake and debris */
  land: (x: number, y: number, heavy: boolean, color: string) => void;
}

/** advance every hazard one tick; spent and expired ones are removed */
export function stepHazards(list: BossHazard[], arena: Arena, dt: number, ev: HazardEvents) {
  for (let i = list.length - 1; i >= 0; i--) {
    const h = list[i];

    if (h.warn > 0) {
      h.warn -= dt;
      if (h.warn <= 0) {
        h.warn = 0;
        if (h.kind === 'drop') {
          // start high above the marker
          h.y = arena.floor - 520;
          h.vy = 0;
        }
        if (h.kind === 'column') ev.land(h.x, arena.floor, false, h.color);
      }
      continue;
    }

    h.life -= dt;

    if (h.kind === 'drop') {
      h.vy += (h.g || 1500) * dt;
      h.y += h.vy * dt;
      if (h.y + h.h / 2 >= arena.floor) {
        h.y = arena.floor - h.h / 2;
        ev.land(h.x, arena.floor, true, h.color2);
        // a landed drop leaves a small lingering lump of whatever it was, or nothing
        list.splice(i, 1);
        continue;
      }
    } else if (h.kind === 'glob' || h.kind === 'web') {
      h.vy += h.g * dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      if (h.y + h.h / 2 >= arena.floor) {
        const lx = h.x;
        list.splice(i, 1);
        ev.land(lx, arena.floor, false, h.color);
        if (h.onLand === 'puddle') {
          list.push(
            makeHazard({
              kind: 'puddle',
              x: lx,
              y: arena.floor - 7,
              floorY: arena.floor,
              w: 96,
              h: 14,
              life: 4.5,
              maxLife: 4.5,
              eff: 'slow',
              dmg: 0,
              color: h.color,
              color2: h.color2,
            }),
          );
        }
        continue;
      }
    } else if (h.kind === 'shock' || h.kind === 'wave' || h.kind === 'bolt') {
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      if (h.x < arena.left - 80 || h.x > arena.right + 80) h.life = 0;
      if (h.kind === 'bolt' && h.y > arena.floor) h.life = 0;
    }

    if (h.life <= 0) list.splice(i, 1);
  }
}

// ───────────────────────────── small helpers the boss definitions share ─────────────────────────────

/** a lobbed shot that lands at (tx, floor) after `flight` seconds */
export function lob(c: BossCtx, fromX: number, fromY: number, tx: number, flight: number, base: Partial<BossHazard> & { kind: 'glob' | 'web' }): BossHazard {
  const g = 1100;
  const dy = c.arena.floor - 12 - fromY;
  const vx = (tx - fromX) / flight;
  const vy = (dy - 0.5 * g * flight * flight) / flight;
  const h = makeHazard({ w: 26, h: 26, g, vx, vy, life: flight + 1, maxLife: flight + 1, ...base, x: fromX, y: fromY, floorY: c.arena.floor });
  c.hazards.push(h);
  return h;
}

/** a wave along the floor in both (or one) directions */
export function floorWave(c: BossCtx, x: number, dir: 1 | -1, speed: number, color: string, color2: string, big = false): BossHazard {
  const h = makeHazard({
    kind: 'shock',
    x,
    y: c.arena.floor - (big ? 19 : 15),
    floorY: c.arena.floor,
    w: big ? 56 : 44,
    h: big ? 38 : 30,
    vx: dir * speed,
    life: 4,
    maxLife: 4,
    dir,
    color,
    color2,
  });
  c.hazards.push(h);
  return h;
}

/** a wave at head height (duck under it or jump it) */
export function headWave(c: BossCtx, x: number, dir: 1 | -1, speed: number, color: string, color2: string): BossHazard {
  const h = makeHazard({
    kind: 'wave',
    x,
    y: c.arena.floor - 52,
    floorY: c.arena.floor,
    w: 38,
    h: 36,
    vx: dir * speed,
    life: 4,
    maxLife: 4,
    dir,
    color,
    color2,
  });
  c.hazards.push(h);
  return h;
}

/** something erupts from the floor at x after a warning */
export function column(c: BossCtx, x: number, warn: number, height: number, color: string, color2: string, life = 0.55): BossHazard {
  const h = makeHazard({
    kind: 'column',
    x,
    y: c.arena.floor - height / 2,
    floorY: c.arena.floor,
    w: 54,
    h: height,
    warn,
    warnMax: warn,
    life,
    maxLife: life,
    color,
    color2,
  });
  c.hazards.push(h);
  return h;
}

/** something falls onto x after a warning */
export function dropAt(c: BossCtx, x: number, warn: number, size: number, color: string, color2: string): BossHazard {
  const h = makeHazard({
    kind: 'drop',
    x,
    y: c.arena.floor - size / 2,
    floorY: c.arena.floor,
    w: size,
    h: size,
    warn,
    warnMax: warn,
    life: 3,
    maxLife: 3,
    g: 1500,
    color,
    color2,
  });
  c.hazards.push(h);
  return h;
}

/** a straight blast from the boss's mouth */
export function beam(c: BossCtx, b: BossEntity, length: number, yFromFloor: number, thickness: number, warn: number, life: number, color: string, color2: string): BossHazard {
  const dir = b.facing;
  const x0 = b.x + dir * (b.width / 2 - 4);
  const h = makeHazard({
    kind: 'beam',
    x: x0 + (dir * length) / 2,
    y: c.arena.floor - yFromFloor,
    floorY: c.arena.floor,
    w: length,
    h: thickness,
    warn,
    warnMax: warn,
    life,
    maxLife: life,
    dir,
    ox: x0,
    oy: c.arena.floor - yFromFloor,
    color,
    color2,
  });
  c.hazards.push(h);
  return h;
}

/** a fast straight shot */
export function bolt(c: BossCtx, x: number, y: number, dir: 1 | -1, speed: number, color: string, color2: string, size = 22): BossHazard {
  const h = makeHazard({ kind: 'bolt', x, y, floorY: c.arena.floor, w: size + 10, h: size, vx: dir * speed, life: 3, maxLife: 3, dir, color, color2 });
  c.hazards.push(h);
  return h;
}

/** a shot with any direction (feathers, spit) */
export function aimed(c: BossCtx, fromX: number, fromY: number, angle: number, speed: number, color: string, color2: string): BossHazard {
  const h = makeHazard({
    kind: 'bolt',
    x: fromX,
    y: fromY,
    floorY: c.arena.floor,
    w: 20,
    h: 14,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 2.6,
    maxLife: 2.6,
    dir: Math.cos(angle) >= 0 ? 1 : -1,
    color,
    color2,
  });
  c.hazards.push(h);
  return h;
}

/** ease a leap: returns height 0..1 for progress u */
export const arc = (u: number) => 4 * u * (1 - u);
