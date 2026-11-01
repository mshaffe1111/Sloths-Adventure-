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
