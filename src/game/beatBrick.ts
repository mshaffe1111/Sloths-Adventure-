/**
 * beatBrick — the base for a platform or hazard "on a beat" (the B5 pieces: sinking pads, snap-jaw stones, crust floors). A brick owns
 * no timer: it names a stage clock (clock.ts) and says what it does while that clock is 'on'. The clock's warning is its tell, so a
 * brick cannot bite or give way unwarned, and Easy stretches every brick on a clock together.
 *
 * Pure (no canvas, no engine).
 */
import type { ClockDef, ClockId, ClockState } from './stageKit.types.ts';
import { checkClock } from './clock.ts';

/** what a brick does while its clock is on: 'bites' = it still holds him but hurts (a snap-jaw stone); 'gone' = it gives way (a sinking pad) */
export type BrickOn = 'bites' | 'gone';

export interface BeatBrick {
  clock: ClockId;
  /** this brick's stagger along its lane (s on Normal; StageClock.read's `shift`) */
  shift?: number;
  on: BrickOn;
}

export interface BrickNow {
  solid: boolean;
  hurts: boolean;
  /** the tell to draw and sound: 0 quiet, rising 0..1 through the warning, 1 while on */
  tell: number;
}

/** a brick on this frame, from its clock's read */
export function brickNow(on: BrickOn, s: ClockState): BrickNow {
  const live = s.phase === 'on';
  return { solid: on === 'bites' || !live, hurts: on === 'bites' && live, tell: live ? 1 : s.phase === 'warn' ? s.u : 0 };
}

/**
 * The stage builder's check for a brick's clock, on Normal (Easy only stretches it): the clock itself is sound (clock.ts checkClock),
 * every warning lasts at least `warn` seconds, and every safe spell (all the time between one 'on' and the next) lasts at least `safe`
 * seconds, the time he needs to cross. What is wrong, in words; none = fair.
 */
export function brickFair(def: ClockDef, need: { warn: number; safe: number }): string[] {
  const bad = checkClock(def);
  const ph = def.phases;
  const first = ph.findIndex((p) => p.name === 'on');
  if (first < 0) return [...bad, `clock ${def.id}: never on, so nothing rides its beat`];
  let spell = 0;
  // once round the cycle, starting just after an 'on', so each safe spell is counted whole
  for (let k = 1; k <= ph.length; k++) {
    const p = ph[(first + k) % ph.length];
    if (p.name !== 'on') { spell += p.seconds; if (p.name === 'warn' && p.seconds < need.warn) bad.push(`clock ${def.id}: a warn of ${p.seconds} s is under the ${need.warn} s he needs to read it`); continue; }
    if (spell > 0 && spell < need.safe) bad.push(`clock ${def.id}: a safe spell of ${spell} s is under the ${need.safe} s he needs to cross`);
    spell = 0;
  }
  return bad;
}
