/**
 * Which music plays where. Pure functions, so the mapping can be tested without any audio.
 */
import { hashStr } from './theory.ts';
import { BOSS_THEME, WORLD_THEME } from './themes.ts';
import { stageThemeId } from './composer.ts';
import { PACE_CODE, PACE_TEMPO, paceFor } from './orchestrate.ts';

export interface SceneChoice {
  id: string;
  /** starting intensity 0..1 */
  intensity: number;
  /** per-stage number that makes the same world theme start and develop differently (0 = the plain version) */
  seed?: number;
  /** playing speed, 1 = as written */
  tempo?: number;
}

/** how fast a stage plays: later stages of a world are a touch quicker, and each stage gets its own small nudge; bosses are as written */
export function stageTempo(seed: number, mini: number): number {
  const base = 0.97 + 0.009 * (Math.max(1, Math.min(10, mini)) - 1);
  return Math.round((base + ((seed % 7) - 3) * 0.004) * 10000) / 10000;
}

/** the minimum a story panel needs to say about itself */
export interface PanelInfo {
  chapter: string;
  scene: { world: number; mood: string };
}

/** music for one panel of a cutscene, chosen from its chapter title (and mood as a fallback) */
export function sceneForPanel(p: PanelInfo): SceneChoice {
  const ch = p.chapter.toUpperCase();
  const world = Math.max(1, Math.min(10, p.scene.world || 1));
  if (ch.startsWith('PROLOGUE')) return { id: 'jennifur', intensity: 0.5 };
  if (ch.startsWith('MEMORY')) return { id: 'jennifur', intensity: 0.3 };
  if (ch.startsWith('THE SONG')) return { id: 'jennifur', intensity: 0.7 };
  if (ch.startsWith('THE REVEAL')) return { id: 'storyDusk', intensity: 0.4 };
  if (ch.startsWith('THE MERCY')) return { id: 'ending', intensity: 0.45 };
  if (ch.startsWith('THE STORM')) return { id: 'storyStorm', intensity: 0.6 };
  if (ch.startsWith('THE VOW') || ch.startsWith('THE EXPEDITION')) return { id: 'storyDusk', intensity: 0.5 };
  if (ch.startsWith('WORLD')) {
    const n = Number(/WORLD\s+(\d+)/.exec(ch)?.[1] ?? world);
    return { id: `${WORLD_THEME(n)}~c`, intensity: 0.12 };
  }
  if (ch.startsWith('BOSS')) return { id: `${BOSS_THEME(world)}~b`, intensity: world === 10 ? 0.3 : 0.2 };
  if (ch.startsWith('VICTORY')) return { id: 'results~c', intensity: 0.6 };
  if (ch.startsWith('EPILOGUE')) return { id: 'ending', intensity: 0.7 };
  if (ch.startsWith('THE END')) return { id: 'ending', intensity: 0.5 };
  switch (p.scene.mood) {
    case 'storm':
      return { id: 'storyStorm', intensity: 0.5 };
    case 'dusk':
      return { id: 'storyDusk', intensity: 0.5 };
    case 'glow':
      return { id: 'ending', intensity: 0.6 };
    case 'night':
      return { id: 'world8~c', intensity: 0.15 };
    default:
      return { id: 'jennifur', intensity: 0.5 };
  }
}

export type GameplayScreen = 'title' | 'world_map' | 'playing' | 'paused' | 'victory' | 'game_over' | 'story_ending';

/**
 * Which piece a stage plays. Most stages get a tune composed for them (see composer.ts): the same stage and the same
 * `salt` always give the same tune, and a new salt (the app picks one each time a stage is entered) gives a new one.
 * About one in five picks the world's written theme instead, so the signature tunes still turn up.
 */
export function stageMusic(world: number, levelId: string, mini: number, salt = 0, objective?: string): SceneChoice {
  const seed = (levelId ? hashStr(levelId) ^ (salt >>> 0) : 0) >>> 0;
  // what the stage is about sets how the music moves: a run, a fight, a climb, a sneak (see orchestrate.ts)
  const pace = paceFor(objective);
  const tempo = levelId ? Math.round(stageTempo(seed, mini) * PACE_TEMPO[pace] * 10000) / 10000 : 1;
  if (!levelId) return { id: WORLD_THEME(world), intensity: 0.35, seed, tempo };
  if ((seed >>> 5) % 5 === 0) return { id: `${WORLD_THEME(world)}~${PACE_CODE[pace]}`, intensity: 0.35, seed, tempo };
  return { id: stageThemeId(world, seed, pace), intensity: 0.35, seed, tempo };
}

/** music for the non-cutscene screens; null means "leave it to the cutscene player" */
export function sceneForScreen(screen: string, world: number, isBoss: boolean, levelId = '', mini = 1, salt = 0, objective?: string): SceneChoice | null {
  switch (screen) {
    case 'title':
      return { id: 'title~c', intensity: 0.6 };
    case 'world_map':
      return { id: 'map~r', intensity: 0.55 };
    case 'playing':
    case 'paused':
    {
      if (isBoss) return { id: `${BOSS_THEME(world)}~b`, intensity: 0.6, seed: levelId ? hashStr(levelId) : 0, tempo: 1 };
      return stageMusic(world, levelId, mini, salt, objective);
    }
    case 'victory':
      return { id: 'results~c', intensity: 0.6 };
    case 'game_over':
      return { id: 'gameover~s', intensity: 0.5 };
    case 'story_ending':
      return { id: 'ending', intensity: 0.8 };
    default:
      return null;
  }
}
