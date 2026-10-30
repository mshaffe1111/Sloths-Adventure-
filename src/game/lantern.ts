/**
 * lantern — 8-4's jar of fireflies (World 8's special stage, w8Lantern.ts; Matt's pick, 2026-10-29 4:58 PM ET: "the Firefly Lantern Run").
 *
 * Pokey carries a jar of fireflies through the night canopy. Its light is the only light he carries, and it shrinks as he goes; each
 * glowing flower he reaches fills it again. The dark beyond it is slow to move through, never deadly:
 *   - the jar drains from full to empty in `drain` s (Normal 22, Easy 34); its light ring shrinks from `rMax` to `rMin` px;
 *   - at a glowing flower (within `reach`) it fills back up, the fireflies streaming in over `fill` s;
 *   - below `low` Dot says it is going (once); empty, he is in the dark: he walks at `slow` of his speed, and after `grace` s the dark
 *     closes in: a soft setback, back to the last flower he filled at with the jar full, nothing lost (never a sudden death);
 *   - moths: drawn to the jar from `sense` px while it glows, they flutter at it and, touching it, steal `steal` of its light and flutter
 *     off; a punch scatters them;
 *   - falls (the lead's World 8 rule, 2026-10-29, with the lantern deciding what is lit): a fall off a bough costs a life on Normal only
 *     when the far side of the gap was lit when he left the bough (inside the jar's ring or a flower's light), so no jump is ever blind;
 *     a fall from an unlit take-off is soft (back on the bough he left). Easy's falls are all soft.
 *
 * Pure: the engine steps it (w8LanternRun.ts) and the tests run it on their own.
 */

export interface LanternSetting {
  /** seconds from full to empty */
  drain: number;
  /** the light ring's radius (world px) full and empty (empty: the last ember, so Pokey never vanishes: STAGE-RULES §4) */
  rMax: number;
  rMin: number;
  /** below this share Dot's warning (once); the ring visibly flickers */
  low: number;
  /** empty: his speed (share), and how long before the dark closes in (s) */
  slow: number;
  grace: number;
  /** a flower fills it from this close (px from his feet to the flower's foot, across; up and down within `reachY`) */
  reach: number;
  reachY: number;
  /** how long the fireflies take to stream in (s) */
  fill: number;
  /** moths: how far they sense the jar (px), how fast they come (px/s), how much a touch steals, how long one flees */
  sense: number;
  mothSpeed: number;
  steal: number;
  flee: number;
}

export const LANTERN: Record<'normal' | 'easy', LanternSetting> = {
  normal: { drain: 22, rMax: 290, rMin: 70, low: 0.35, slow: 0.55, grace: 3.5, reach: 80, reachY: 140, fill: 0.6, sense: 380, mothSpeed: 85, steal: 0.3, flee: 2.5 },
  easy: { drain: 34, rMax: 310, rMin: 80, low: 0.35, slow: 0.65, grace: 6, reach: 100, reachY: 160, fill: 0.6, sense: 340, mothSpeed: 60, steal: 0.2, flee: 3 },
};

/** a glowing flower: a refill station on a bough (its foot at x, y), lighting `r` px around it; `big`: the glade's great flower */
export interface GlowFlower {
  id: number;
  x: number;
  y: number;
  r: number;
  big?: boolean;
}

/** a moth's perch in the dark (it wakes when the jar comes near) */
export interface MothSpot {
  id: number;
  x: number;
  y: number;
}

/** a gap between two boughs (world px): its near and far lips at the boughs' tops */
export interface LanternGap {
  x0: number;
  x1: number;
  /** the far bough's top (the near one's is `y0`) */
  y0: number;
  y1: number;
  /** a soft gap whatever the light (the stage's first hops) */
  soft?: boolean;
}

export interface LanternPlan {
  flowers: GlowFlower[];
  moths: MothSpot[];
  gaps: LanternGap[];
  /** the swarm at the end: once he reaches x, the jar is opened under the firefly tree */
  swarmX: number;
  /** the tree the fireflies rise into (its top, world px) */
  swarmTree: { x: number; y: number };
}

export type MothMode = 'rest' | 'seek' | 'flee' | 'gone';
export interface Moth {
  id: number;
  x: number;
  y: number;
  home: { x: number; y: number };
  mode: MothMode;
  /** seconds left fleeing */
  t: number;
  /** its wings' beat (s) */
  beat: number;
}

export interface LanternState {
  /** 0..1 */
  level: number;
  /** filling: the share still to stream in (the fill eases up to it) */
  target: number;
  /** seconds he has been empty */
  dark: number;
  /** the flower he last filled at (id), for the setback */
  last: number;
  moths: Moth[];
  /** game seconds since the stage began (the flicker's clock) */
  t: number;
}

export function newLantern(plan: LanternPlan): LanternState {
  return {
    level: 1,
    target: 1,
    dark: 0,
    last: plan.flowers[0]?.id ?? -1,
    moths: plan.moths.map((m) => ({ id: m.id, x: m.x, y: m.y, home: { x: m.x, y: m.y }, mode: 'rest', t: 0, beat: (m.id * 0.37) % 1 })),
    t: 0,
  };
}

/** the light ring's radius (world px) at this level: it shrinks with the light, and flickers a little once it is low */
export function lanternRadius(set: LanternSetting, level: number, t = 0): number {
  const r = set.rMin + (set.rMax - set.rMin) * Math.max(0, Math.min(1, level));
  const flick = level < set.low ? (1 - level / set.low) * 0.08 * Math.sin(t * 23) * Math.sin(t * 7.3) : 0;
  return r * (1 + flick);
}

/** the jar's light point (world px): in his arms, about chest high */
export const jarAt = (x: number, feet: number) => ({ x, y: feet - 38 });

/** is the point lit (inside the jar's ring from `from`, or a flower's light)? */
export function litAt(plan: LanternPlan, set: LanternSetting, level: number, from: { x: number; y: number }, x: number, y: number): boolean {
  if (Math.hypot(x - from.x, y - from.y) <= lanternRadius(set, level) * 0.9) return true;
  return plan.flowers.some((f) => Math.hypot(x - f.x, y - (f.y - 40)) <= f.r * 0.9);
}

/**
 * Leaving a bough at x (feet `feet`, facing `dir`): the gap ahead of him, and whether its far lip is lit (a fall into it then costs a
 * life on Normal). No gap within 140 px ahead: null (a jump on a bough, or off its back end).
 */
export function takeoff(plan: LanternPlan, set: LanternSetting, level: number, x: number, feet: number, dir: number): { gap: LanternGap; lit: boolean } | null {
  const ahead = plan.gaps.filter((g) => (dir >= 0 ? g.x0 - x > -60 && g.x0 - x < 140 : x - g.x1 > -60 && x - g.x1 < 140));
  if (!ahead.length) return null;
  const gap = ahead.sort((a, b) => Math.abs((dir >= 0 ? a.x0 : a.x1) - x) - Math.abs((dir >= 0 ? b.x0 : b.x1) - x))[0];
  const lip = dir >= 0 ? { x: gap.x1 + 10, y: gap.y1 } : { x: gap.x0 - 10, y: gap.y0 };
  return { gap, lit: !gap.soft && litAt(plan, set, level, jarAt(x, feet), lip.x, lip.y) };
}

export type LanternEvent = 'filled' | 'low' | 'empty' | 'setback' | 'stolen' | null;

/**
 * Step the jar `dt` s with his feet at (x, feet). `punch`: an attack is out (moths within 90 px of the jar scatter). Returns what
 * happened this frame (the engine's sound, Dot's line, the setback).
 */
export function stepLantern(s: LanternState, plan: LanternPlan, set: LanternSetting, dt: number, x: number, feet: number, punch = false): LanternEvent {
  s.t += dt;
  let ev: LanternEvent = null;
  const was = s.level;
  // a flower within reach fills it
  const near = plan.flowers.find((f) => Math.abs(f.x - x) <= set.reach && Math.abs(f.y - feet) <= set.reachY);
  if (near) {
    if (s.target < 1 || s.level < 0.97) {
      if (s.level < 0.9) ev = 'filled';
      s.target = 1;
    }
    s.last = near.id;
  }
  if (s.level < s.target) {
    s.level = Math.min(s.target, s.level + dt / set.fill);
  } else {
    s.target = 0;
    s.level = Math.max(0, s.level - dt / set.drain);
  }
  if (near) s.dark = 0;
  if (was >= set.low && s.level < set.low && !near) ev = 'low';
  if (was > 0 && s.level <= 0) ev = 'empty';
  if (s.level <= 0) {
    s.dark += dt;
    if (s.dark >= set.grace) {
      s.dark = 0;
      s.level = 1;
      s.target = 1;
      ev = 'setback';
    }
  } else s.dark = 0;
  // the moths
  const jar = jarAt(x, feet);
  for (const m of s.moths) {
    m.beat = (m.beat + dt * 2.6) % 1;
    if (m.mode === 'gone') continue;
    const dx = jar.x - m.x, dy = jar.y - m.y;
    const d = Math.hypot(dx, dy);
    if (punch && d < 90 && m.mode !== 'flee') {
      m.mode = 'flee';
      m.t = set.flee * 1.6;
    }
    if (m.mode === 'rest') {
      if (d < set.sense && s.level > 0.12) m.mode = 'seek';
      else {
        m.x += (m.home.x + Math.sin(s.t * 1.3 + m.id) * 24 - m.x) * Math.min(1, dt * 2);
        m.y += (m.home.y + Math.sin(s.t * 1.9 + m.id * 2) * 14 - m.y) * Math.min(1, dt * 2);
      }
    } else if (m.mode === 'seek') {
      if (d > set.sense * 1.5 || s.level <= 0.05) {
        m.mode = 'rest';
      } else if (d < 34) {
        s.level = Math.max(0, s.level - set.steal);
        s.target = 0;
        m.mode = 'flee';
        m.t = set.flee;
        ev = ev ?? 'stolen';
      } else {
        // (a moth's flutter: a wobble across its line in)
        const k = (set.mothSpeed * dt) / Math.max(1, d);
        m.x += dx * k + Math.sin(s.t * 9 + m.id) * 40 * dt;
        m.y += dy * k + Math.cos(s.t * 7 + m.id) * 50 * dt;
      }
    } else if (m.mode === 'flee') {
      m.t -= dt;
      const k = (set.mothSpeed * 1.4 * dt) / Math.max(1, d);
      m.x -= dx * k;
      m.y -= dy * k + 30 * dt;
      if (m.t <= 0) {
        // (it settles back on its perch, far from where he is now)
        m.mode = 'rest';
        m.x = m.home.x;
        m.y = m.home.y;
      }
    }
  }
  return ev;
}

/** the setback: the flower he last filled at (falls back to the first) */
export function setbackTo(plan: LanternPlan, s: LanternState): GlowFlower {
  return plan.flowers.find((f) => f.id === s.last) ?? plan.flowers[0];
}
