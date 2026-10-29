/**
 * Which music plays where. Pure functions, so the mapping can be tested without any audio.
 */
import { hashStr } from './theory.ts';
import { BOSS_THEME, WORLD_THEME } from './themes.ts';
import { composeStageFull, stageThemeId } from './composer.ts';
import { PACE_CODE, PACE_TEMPO, paceFor } from './orchestrate.ts';
import { actOfWorld } from './acts.ts';
import { STYLES } from './styles.ts';
import { cueId } from './score.ts';
import type { StoryCue } from '../game/story.ts';

export interface SceneChoice {
  id: string;
  /** starting intensity 0..1 */
  intensity: number;
  /** per-stage number that makes the same world theme start and develop differently (0 = the plain version) */
  seed?: number;
  /** playing speed, 1 = as written */
  tempo?: number;
  /** play it as a form, sections and all (form.ts): the stage music */
  form?: boolean;
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
  /** the piece the story script asks for (see score.ts); unset = the old chapter-and-mood rule */
  cue?: StoryCue;
  /** how full that piece is, 0..1; unset = the cue's own default (CUE_INTENSITY) */
  intensity?: number;
}

/** how full each cue's piece plays when the script does not say: the quiet ones low, the fights and the finish high */
export const CUE_INTENSITY: Record<StoryCue, number> = {
  pokey: 0.5, meeca: 0.6, bloom: 0.5, grandma: 0.5, journey: 0.6, comedy: 0.5, tender: 0.4, sorrow: 0.4, dread: 0.35,
  war: 0.6, chase: 0.7, reveal: 0.35, resolve: 0.5, triumph: 0.7, mercy: 0.6, finale: 0.7, hush: 0.2,
};

/** music for one panel of a cutscene: the piece its script asks for (cue), or else one chosen from its chapter title (and mood as a fallback) */
export function sceneForPanel(p: PanelInfo): SceneChoice {
  if (p.cue) {
    const given = p.intensity;
    const k = given !== undefined && Number.isFinite(given) ? given : CUE_INTENSITY[p.cue] ?? 0.5;
    return { id: cueId(p.cue), intensity: Math.max(0, Math.min(1, k)) };
  }
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

// ───────────────────────────────────────────── holding a piece ─────────────────────────────────────────────

/**
 * The script names a cue on almost every panel, and the cues change a lot (a joke, a worry, a tender word): left to itself the music started a
 * different piece every two panels, and every piece begins with its quietest bars, so a scene was all intros and never got to its fullness.
 * So a piece is held: the script's cue only takes over once the piece has played for HOLD_SECONDS, at a new scene (chapter), or when it is one
 * of the big cues. A held piece still follows the script's fullness (the layers come and go with each panel's intensity).
 */
export const HOLD_SECONDS = 50;
/** the cues that cut in without waiting: the fights, the finish, the mercy */
export const CUT_IN: ReadonlySet<StoryCue> = new Set<StoryCue>(['war', 'chase', 'finale', 'mercy', 'triumph']);
/** but never closer than this to the last change, so two big cues in a row do not tear the music up */
export const CUT_IN_GAP = 8;

/** which story piece is playing, in which chapter, since when (seconds) */
export interface Held {
  id: string;
  chapter: string;
  since: number;
}

/** the piece to play for a panel given the one already held (null = none yet): the panel's own choice, or the held piece at the panel's fullness */
export function holdScene(held: Held | null, want: SceneChoice, panel: PanelInfo, now: number): { scene: SceneChoice; held: Held } {
  const take = { scene: want, held: { id: want.id, chapter: panel.chapter, since: now } };
  if (!held) return take;
  if (want.id === held.id) return { scene: want, held: { ...held, chapter: panel.chapter } };
  const age = now - held.since;
  if (panel.chapter !== held.chapter) return take;
  if (age >= HOLD_SECONDS) return take;
  if (panel.cue && CUT_IN.has(panel.cue) && age >= CUT_IN_GAP) return take;
  return { scene: { ...want, id: held.id }, held };
}

/**
 * Whether a panel's one-off sting should sound now: not while the chapter's title card is up, and not before the picture has begun to
 * show its words (at once for a picture with none). `fresh` is the first pass after the panel changed, when the card and typing state
 * on hand are still the last panel's, so it never counts unless the panel has neither a card nor words.
 */
export function stingDue(s: { fresh: boolean; wantsCard: boolean; cardUp: boolean; shown: number; textLength: number }): boolean {
  if (s.fresh) return !s.wantsCard && s.textLength === 0;
  return !s.cardUp && (s.textLength === 0 || s.shown > 0);
}

export type GameplayScreen = 'title' | 'world_map' | 'playing' | 'paused' | 'victory' | 'game_over' | 'story_ending';

/**
 * Which piece a stage plays. Most stages get a tune composed for them (see composer.ts): the same stage and the same
 * `salt` always give the same tune, and a new salt (the app picks one each time a stage is entered) gives a new one.
 * In the first act about one in five picks the world's written theme instead, so the signature tunes still turn up.
 */
/** Meeca's stage (5-M, after 5-5) */
export const MEECA_MUSIC_STAGE = '5-M';
let meecaPick: SceneChoice | null = null;
/**
 * Meeca's stage plays her Heartbloom song as the stage music: the composer's World 5 sound (oboe, clarinet, cello over strings and
 * harp) at the sneak pace (pizzicato, soft timpani, a hush: the column's quiet march), on a roll of the dice that opens with the
 * lament, which is her lullaby's own notes sung sadly in the minor (composer.ts QUOTES), with the clarinet on the tune when a roll
 * gives one. Slower and quieter than a stage: dusk, and a march. The same piece every time she plays it.
 */
export function meecaStageMusic(): SceneChoice {
  if (meecaPick) return meecaPick;
  let pick: number | null = null;
  let any: number | null = null;
  for (let seed = 1; seed < 600 && pick === null; seed++) {
    const c = composeStageFull(5, seed, 'sneak');
    if (c.info.tune !== 'lament') continue;
    any ??= seed;
    if (c.info.lead === 'clarinet') pick = seed;
  }
  const seed = pick ?? any ?? 1;
  meecaPick = { id: stageThemeId(5, seed, 'sneak'), intensity: 0.26, seed, tempo: 0.86, form: true };
  return meecaPick;
}

export function stageMusic(world: number, levelId: string, mini: number, salt = 0, objective?: string): SceneChoice {
  if (levelId === MEECA_MUSIC_STAGE) return meecaStageMusic();
  const seed = (levelId ? hashStr(levelId) ^ (salt >>> 0) : 0) >>> 0;
  // what the stage is about sets how the music moves: a run, a fight, a climb, a sneak (see orchestrate.ts)
  const pace = paceFor(objective);
  // a stage's speed may move only a little from its world's own (styles.ts paceRoom): the tempo is part of a world's identity
  const room = STYLES[Math.max(1, Math.min(10, world))]?.paceRoom ?? 0.03;
  const nudge = levelId ? stageTempo(seed, mini) * PACE_TEMPO[pace] - 1 : 0;
  const tempo = Math.round((1 + Math.max(-room, Math.min(room, nudge))) * 10000) / 10000;
  if (!levelId) return { id: WORLD_THEME(world), intensity: 0.35, seed, tempo, form: true };
  // about one in five stages of the first act plays the world's written theme, so Pokey's signature tunes still turn up; the later acts have
  // their own sounds (composer.ts) and never fall back to a tune written for another mood
  if (actOfWorld(world) === 'trail' && (seed >>> 5) % 5 === 0) return { id: `${WORLD_THEME(world)}~${PACE_CODE[pace]}`, intensity: 0.35, seed, tempo, form: true };
  return { id: stageThemeId(world, seed, pace), intensity: 0.35, seed, tempo, form: true };
}

/** the piece the title screen and the pause menu play: the first stage's own tune, as it was written */
export const MENU_THEME = 'world1';

/** music for the non-cutscene screens; null means "leave it to the cutscene player" */
export function sceneForScreen(screen: string, world: number, isBoss: boolean, levelId = '', mini = 1, salt = 0, objective?: string): SceneChoice | null {
  switch (screen) {
    case 'title':
      // the menus play the sound of the first stage: the tune the game is known by
      return { id: MENU_THEME, intensity: 0.6 };
    case 'world_map':
      return { id: 'map~r', intensity: 0.55 };
    case 'paused':
      return { id: MENU_THEME, intensity: 0.45 };
    case 'playing':
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
