/**
 * Every engine dial that differs by setting (Easy or Normal), set in ONE place (R-165.251, TOOLS-2 11-14).
 *
 * The one such dial today is the swing (physics.ts TIMED by setTimedSwing: Easy's slower liana, wider sweet spot and longer grab).
 * Every flight off a liana reads it, so a stage built or judged with the wrong swing is a different stage. The engine set it at a
 * stage's start and the tools did not, so the tools built Easy on Normal's swing (TOOLS-1 found it on 1-6, 3 of 3 seeds; a D19
 * case: a gate must call the same code the screen calls).
 *
 * Who calls it:
 * - the engine, as a stage starts (engine.ts: applySetting, kept for the whole run, as the flights in play read it);
 * - every build entry, for its own setting (stageGenerator generateStage, gen2/pipeline buildGen2Stage, easyMode easyStage:
 *   withSetting), so a stage is built on its setting's dials whoever builds it (a tool, a test, the map's build-ahead) and the caller's
 *   own dials are put back after;
 * - every judge of a built stage on a setting outside the build: levelCheck validateAsJudged (a gen2 stage, on its own setting) and
 *   tools/engine/listRules helpRoomBreaches (seedlist's room-for-help rule) set them themselves; the bots run the real engine
 *   (castBots -> firsttimer setDifficulty -> engine.ts applySetting); a new judge does the same (withSetting).
 * - and the caches of an answer the dials change are keyed by them (dialsKey: stageGenerator's layout picks; levelCheck's flights use
 *   its own swingSettingKey, the same numbers).
 * Swept for others (11-14, grep over src/ for module-level setters): difficulty() is the player's choice, read only by the Engine and
 * InputEngine constructors, the map's build-ahead and the menus (a tool that runs the real engine sets it, firsttimer setDifficulty);
 * the engine's other per-setting values (forgive, tide, soft pits, the jump buffer, the help ladder) are its own fields, made from
 * that choice in the engine itself, never read by a build. A new dial goes here, in applySetting and in Dials, and nowhere else
 * (settingDials.test.ts fails on a setTimedSwing call anywhere but here).
 */
import type { Difficulty } from './difficulty.ts';
import { setTimedSwing, TIMED } from './physics.ts';

/** the dials as they stand: what withSetting puts back */
type Dials = { swing: typeof TIMED };
const read = (): Dials => ({ swing: { ...TIMED } });
const put = (d: Dials): void => {
  Object.assign(TIMED, d.swing);
};

/** set every per-setting dial to this setting's (the engine, as a stage starts; it keeps them for the run) */
export function applySetting(d: Difficulty): void {
  setTimedSwing(d === 'easy');
}

/** `fn` on this setting's dials, every dial put back as it was after (a build, a judge, a tool's run of one setting) */
export function withSetting<T>(d: Difficulty, fn: () => T): T {
  const was = read();
  applySetting(d);
  try {
    return fn();
  } finally {
    put(was);
  }
}

/**
 * The dials as a key: every cache of an answer the dials change (a layout the validator passed, a flight) is keyed by it, so one
 * setting's answer is never handed to the other's build in the same process (R-165.244's pattern; stageGenerator variantAttemptFor)
 */
export const dialsKey = (): string => JSON.stringify(read());

/** the setting the dials stand at now (null: neither, e.g. a test set its own), for the tests */
export function dialsSetting(): Difficulty | null {
  const now = JSON.stringify(read());
  for (const d of ['normal', 'easy'] as const) if (withSetting(d, () => JSON.stringify(read())) === now) return d;
  return null;
}
