/**
 * Audit 2026-11-11, slice "save": a tiny harness shared by the save-*.test.ts proof tests that need the REAL engine (engine.ts) with no
 * screen. It builds the stage exactly as the game does (GameEngine's own constructor), and only reaches into the engine's private fields
 * to put Pokey somewhere and to step its own update. Not a test itself.
 */
import { headlessCanvas } from '../../../../src/game/headlessDom.ts';
import { GameEngine } from '../../../../src/game/engine.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { EXTRA_STAGES } from '../../../../src/game/extraStages.ts';
import { setLayoutVariant } from '../../../../src/game/stageGenerator.ts';
import type { StageStats } from '../../../../src/game/badges.ts';
import type { LevelConfig } from '../../../../src/game/types.ts';

export const DT = 1 / 30;

const levels = generateAllLevels();
export const levelConfig = (id: string): LevelConfig => {
  const c = levels.find((l) => l.id === id) ?? EXTRA_STAGES.map((e) => e.config()).find((l) => l.id === id);
  if (!c) throw new Error(`no stage ${id}`);
  return { ...c, unlocked: true };
};

const fakeInput = () => ({
  state: {
    left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false, kickPressed: false,
    kickDir: 0, megaPunchPressed: false, layerSwitchPressed: false, touchJoystickAngle: null, touchJoystickMagnitude: 0,
  },
  source: 'keys', airJumpReady: false, kickNear: true, onVine: false, megaReady: true, onFocusLost: null, moves: 0,
  update() {}, triggerHaptic() {}, clearAll() {}, carry() {},
});

export interface Run {
  /** the real engine (its private fields are read and set by name) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  e: any;
  stats: StageStats[];
  wins: Array<{ stars: number; timeSec: number }>;
  defeats: number;
  guides: string[];
}

/** a real engine on stage `id` with layout number `layout`, its callbacks recorded */
export function run(id: string, layout: number): Run {
  const r: Run = { e: null, stats: [], wins: [], defeats: 0, guides: [] };
  setLayoutVariant(layout);
  r.e = new GameEngine(headlessCanvas(), levelConfig(id), fakeInput() as never, {
    onProgressUpdate() {},
    onVictory: (stars: number, timeSec: number) => void r.wins.push({ stars, timeSec }),
    onDefeat: () => void r.defeats++,
    onStageStats: (s: StageStats) => void r.stats.push(s),
    onGuide: (text: string) => void r.guides.push(text),
  } as never);
  setLayoutVariant(null);
  return r;
}

/** step the engine's own update `n` frames */
export function step(r: Run, n = 1) {
  for (let i = 0; i < n; i++) r.e.update(DT);
}

/** stand Pokey on a flag of the stage (he touches it on the next frame) */
export function standAt(r: Run, at: { x: number; y: number }) {
  Object.assign(r.e.player, { x: at.x, y: at.y - 2, vx: 0, vy: 0, invincibleTimer: 1e9 });
}

/** the Android app: appShell.ts nativeApp() is true while this is set */
export function asNativeApp(on: boolean) {
  const g = globalThis as { Capacitor?: unknown };
  if (on) g.Capacitor = { isNativePlatform: () => true };
  else delete g.Capacitor;
}
