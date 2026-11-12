import type { GameScreen } from '../game/types.ts';

/**
 * Which screens let go of the stage that was playing (App.tsx stops its engine and drops it, which frees that stage's world).
 *
 * The menu and story screens don't need the game loop, so they free it. The one exception is a stage that is only paused under
 * them: the pause menu opens the satchel, and its Scenes page replays a scene full screen. That memory must play OVER the
 * paused stage, not unload it, or Back → Back → Resume returns to a pause screen whose stage is gone: touches are read and
 * nothing moves (Matt's freeze, session 20261026-1558-mpcz, 2026-10-26).
 */
export const RELEASING_SCREENS: readonly GameScreen[] = [
  'title',
  'world_map',
  'story_cutscene',
  'world_story',
  'world_mid',
  'world_gate',
  'boss_intro',
  'boss_defeat',
  'ending_story',
  'ending_tag',
  'memory',
];

export interface StageHold {
  /** where the satchel was opened from */
  trophyFrom: 'title' | 'world_map' | 'paused';
  /** where the memory now playing goes back to (null when none is playing) */
  memoryBack: 'victory' | 'satchel' | null;
}

/** true when a paused stage is waiting under this screen to be resumed (the pause menu itself, or a view opened from it) */
export function stageHeld(screen: GameScreen, hold: StageHold): boolean {
  if (screen === 'paused') return true;
  if (screen === 'satchel') return hold.trophyFrom === 'paused';
  return screen === 'memory' && hold.memoryBack === 'satchel' && hold.trophyFrom === 'paused';
}

/** true when showing this screen should stop and free the stage's engine */
export function releasesStage(screen: GameScreen, hold: StageHold): boolean {
  return RELEASING_SCREENS.includes(screen) && !stageHeld(screen, hold);
}

/**
 * What the pause menu's Resume does: carry the stage on, or (a safety net: the stage was let go of while the menu was up, or never
 * finished loading and nothing is on its way) start it again rather than leave a frozen picture that reads touches.
 */
export function resumeAction(hasEngine: boolean, released: boolean): 'resume' | 'restart' {
  return !hasEngine && released ? 'restart' : 'resume';
}

/**
 * A stage has finished loading (App.tsx launchEngine's go): start it, held still when the pause menu came up while it loaded (Android
 * Back, a locked phone, a call: the stage is built seconds after the tap, so pausing then found no engine to pause). Audit C saves #2:
 * it used to start live under the menu, its clock, a chase or a guardian playing on against a Pokey nobody steered.
 */
export function startLoaded(engine: { start(): void; pause(): void }, pausedMeanwhile: boolean) {
  if (pausedMeanwhile) engine.pause();
  engine.start();
}

/**
 * What plays before a stage starts, whichever way it was entered (the title's button or keys, the map, a link). The game's first stage
 * has the prologue before it (who Pokey and Meeca are), and its world's arrival scene comes AFTER it, as the reward for clearing it;
 * every other world's first stage has that world's arrival scene; a guardian's stage its intro. `worldSeen` is the stage's world flag
 * (for the first stage, the prologue's). Audit C-05 / saves #9: the map's 1-1 played World 1's after-1-1 scene before it, the prologue
 * never, and the same scene again after the clear.
 */
export function storyBefore(
  lvl: { miniIndex: number; objectiveType?: string },
  o: { firstStage: boolean; worldSeen: boolean },
): 'prologue' | 'world_story' | 'boss_intro' | null {
  if (o.firstStage) return o.worldSeen ? null : 'prologue';
  if (lvl.miniIndex === 1 && !o.worldSeen) return 'world_story';
  if (lvl.objectiveType === 'boss_lair') return 'boss_intro';
  return null;
}
