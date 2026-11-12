/**
 * The engine-core test harness (audit A, 2026-11-11; EN-F): the REAL GameEngine with no screen, for proof tests that must fail on today's code.
 * Unlike realPlay.ts it replaces nothing that decides an outcome: loseLife, softFall, the camera and the loop are the engine's own.
 * Only sound-free construction and a plain input object are supplied. Import this file FIRST (headlessDom must load before engine.ts).
 */
import { headlessCanvas } from './headlessDom.ts';
import { GameEngine } from './engine.ts';
import { generateAllLevels } from './worldsData.ts';
import { setDifficulty } from './difficulty.ts';
import { setLayoutVariant } from './stageGenerator.ts';
import type { InputState, Platform, PlayerState } from './types.ts';

export const DT = 1 / 30;
const noop = () => {};

/** a pad with level state only: a press is one frame of jumpPressed, cleared by the test (the engine clears it when it uses it) */
export class PlainInput {
  state: InputState = {
    left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false, kickPressed: false,
    kickDir: 0, megaPunchPressed: false, layerSwitchPressed: false, touchJoystickAngle: null, touchJoystickMagnitude: 0,
  } as InputState;
  source: 'keys' | 'pad' | 'gesture' = 'keys';
  airJumpReady = false;
  kickNear = false;
  onVine = false;
  megaReady = true;
  moves = 0;
  carrying = false;
  update(_dt: number) {}
  carry() {}
  dropCarry() {}
  triggerHaptic() {}
}

/** the engine's private parts, by their own names */
export type Eng = Record<string, any> & { player: PlayerState; platforms: Platform[] };

const levels = generateAllLevels();

export function makeEngine(id: string, difficulty: 'normal' | 'easy' = 'normal', seed = 1): { e: Eng; input: PlainInput; events: string[] } {
  setDifficulty(difficulty);
  const cfg = levels.find((l) => l.id === id);
  if (!cfg) throw new Error(`no stage ${id}`);
  const input = new PlainInput();
  const events: string[] = [];
  setLayoutVariant(seed);
  const e = new GameEngine(headlessCanvas(), { ...cfg, unlocked: true }, input as never, {
    onProgressUpdate: noop,
    onVictory: () => events.push('victory'),
    onDefeat: () => events.push('defeat'),
    onLivesChange: (n: number) => events.push(`lives ${n}`),
  } as never) as unknown as Eng;
  setLayoutVariant(null);
  e.inputGrace = 0;
  // (1-1's help offer has no screen here: answer no, so play goes on)
  if ('helpAsk' in e) e.helpAsk = (_o: unknown, answer: (yes: boolean) => void) => answer(false);
  return { e, input, events };
}

/** stand him on a platform's top at x (feet on it), still */
export function standOn(e: Eng, pl: Platform, x = pl.x + pl.width / 2) {
  Object.assign(e.player, { x, y: pl.y, vx: 0, vy: 0, grounded: true, climbing: false, isVineSwinging: false, hanging: false, jumpsLeft: 2 });
  e.player.invincibleTimer = 0;
}

/** n engine updates of dt each (the engine's own update, nothing skipped) */
export function step(e: Eng, n: number, dt = DT) {
  for (let i = 0; i < n; i++) e.update(dt);
}
