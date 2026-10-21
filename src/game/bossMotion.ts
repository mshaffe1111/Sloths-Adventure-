/**
 * Motion for the painted bosses. The painted frames are stills, so the boss's body language comes from squashing, stretching and
 * tilting each frame about its feet: it breathes while it waits, crouches and trembles through a wind-up, snaps out long on the
 * attack, flinches when it is hit, wobbles when it is stunned and shudders through a roar. Pure numbers in, numbers out:
 * paintedBoss.ts applies them. Everything is about the point where the boss stands (the origin), `rot` leans it AWAY from the way
 * it faces when positive, and `dx` is along the way it faces.
 */
import type { BossState } from './bossAI.ts';

export interface MotionInput {
  state: BossState;
  /** seconds in the state */
  t: number;
  /** length of this move's wind-up and attack, 0 when there is no move */
  tell: number;
  act: number;
  pose: string | null;
  phase: number;
  time: number;
  moving: boolean;
  /** seconds of hit flash left (set to 0.1-0.18 when the boss is hit) */
  hit: number;
}

export interface Motion {
  sx: number;
  sy: number;
  rot: number;
  dx: number;
  dy: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => v * v * (3 - 2 * v);

export function bossMotion(i: MotionInput): Motion {
  const m: Motion = { sx: 1, sy: 1, rot: 0, dx: 0, dy: 0 };
  const hurry = i.phase >= 2 ? 1.45 : 1;
  const breath = Math.sin(i.time * 1.9 * hurry);
  switch (i.state) {
    case 'idle':
      if (i.moving) {
        // a travelling body rolls a little from side to side
        m.rot = Math.sin(i.time * 9) * 0.012;
        m.sy = 1 + Math.sin(i.time * 18) * 0.008;
      } else {
        m.sy = 1 + breath * 0.02 * hurry;
        m.sx = 1 - breath * 0.01 * hurry;
        m.rot = Math.sin(i.time * 0.8 * hurry) * 0.012;
      }
      break;
    case 'tell': {
      // coil down and lean back, trembling harder as the strike gets close
      const p = ease(clamp01(i.t / Math.max(0.05, i.tell)));
      m.sy = 1 - 0.11 * p;
      m.sx = 1 + 0.06 * p;
      m.rot = -0.07 * p;
      m.dx = -3 * p;
      m.dx += Math.sin(i.time * 52) * 1.4 * p * p;
      break;
    }
    case 'act': {
      // snap out: stretched long and thin at the start, settling back over the attack
      const p = clamp01(i.t / Math.max(0.05, i.act));
      const snap = Math.pow(1 - clamp01(p / 0.35), 2);
      if (i.pose === 'slam' || i.pose === 'leap') {
        m.sy = 1 + 0.1 * snap;
        m.sx = 1 - 0.05 * snap;
      } else {
        m.sx = 1 + 0.12 * snap;
        m.sy = 1 - 0.07 * snap;
        m.dx = 5 * snap;
      }
      m.rot = 0.05 * snap;
      break;
    }
    case 'rec':
      // wide open and out of breath
      m.sy = 1 + breath * 0.025 - 0.02;
      m.sx = 1 - breath * 0.012;
      m.rot = 0.02;
      break;
    case 'stun': {
      const fade = clamp01(1 - i.t / 6);
      m.rot = Math.sin(i.time * 13) * 0.07 * (0.5 + 0.5 * fade);
      m.dx = Math.sin(i.time * 9) * 1.5;
      m.sy = 1 - 0.03;
      break;
    }
    case 'roar': {
      const p = clamp01(i.t / 1);
      m.sy = 1 + Math.sin(i.time * 22) * 0.025 + 0.05 * Math.sin(p * Math.PI);
      m.sx = 1 - Math.sin(i.time * 22) * 0.012;
      m.rot = Math.sin(i.time * 31) * 0.012;
      break;
    }
    case 'dying': {
      const p = clamp01(i.t / 0.6);
      m.rot = Math.sin(i.time * 36) * 0.03 * (1 - p);
      m.sy = i.t < 0.6 ? 1 + 0.04 * Math.sin(i.time * 20) : 1;
      break;
    }
  }
  if (i.hit > 0 && i.state !== 'dying') {
    // flinch: shoved back and squashed, then it springs back
    const h = clamp01(i.hit / 0.15);
    m.dx -= 4 * h;
    m.sx *= 1 - 0.06 * h;
    m.sy *= 1 + 0.04 * h;
    m.rot -= 0.03 * h;
  }
  return m;
}
