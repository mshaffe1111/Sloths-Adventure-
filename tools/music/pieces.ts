/**
 * The list of every piece the game plays, for the recorder: npx tsx tools/music/pieces.ts > pieces.json
 *
 *   the screens: the title, the trophy room, the ten maps, the results, game over, the ending
 *   the story: every cue's piece, the chapters' pieces, each world's cutscene piece
 *   the bosses: each boss piece, at the seed of the first boss stage that plays it
 *   Meeca's march (one stage's own piece)
 *   the stages: one piece per world (Matt, 2026-10-30: one stage tune per world, the paces share it), the composition of the world's
 *     first run stage at its own speed; every stage of the world plays it (recordings.ts)
 *
 * The stage pieces get the stems the game's state mixes (bed, beat, top, and the drive and shine layers; the dark layer in the worlds with
 * dark zones), a boss its piece and its two fight layers, everything else one stem.
 */
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { sceneForScreen, sceneForPanel, meecaStageMusic, CUE_INTENSITY, MENU_THEME } from '../../src/audio/scenes.ts';
import { CUES, cueId } from '../../src/audio/score.ts';
import { paceFor } from '../../src/audio/orchestrate.ts';
import { BOSS_THEME, WORLD_THEME } from '../../src/audio/themes.ts';
import type { StemName } from '../../src/audio/loops.ts';

/**
 * How long the loops are (seconds): a stage's ends at the first A section from STAGE_LOOP on, and never past the most its memory allows
 * (35 MB decoded for the piece playing: loops.ts DECODE_RATE, about 0.83 MB a second for a stage piece with drums, 0.93 with the dark
 * layer too (a dark world's pieces have had no drums so far: 0.74; loops.test.ts checks every piece), 0.45
 * for a boss, 0.26 for a one-stem piece).
 */
const STAGE_LOOP = 30;
const STAGE_MAX = 42;
// (World 3's piece has no drums and its sections are long: 43 s, 32 MB. loops.test.ts checks every piece against the 35 MB)
const DARK_STAGE_MAX = 47;
const BOSS_MAX = 75;
const ONE_MAX = 120;
/** the worlds whose stages have dark zones (engine.ts darkShow) */
const DARK_WORLDS = new Set([3, 8]);

interface Entry {
  spec: { id: string; seed?: number; tempo?: number; form?: boolean; intensity: number; target: number; max?: number };
  stems: StemName[];
}
const out: Record<string, Entry> = {};
const stages: Record<string, string[]> = {};
const one = (id: string, intensity: number, extra: Partial<Entry['spec']> = {}) => {
  out[id] ??= { spec: { id, intensity, target: 40, max: ONE_MAX, ...extra }, stems: ['mix'] };
};

// the screens
one(MENU_THEME, 0.7);
one('menu', 0.45);
for (let w = 1; w <= 10; w++) one(`map-${w}`, 0.5);
one('results~c', 0.6);
one('gameover~s', 0.5);
one('ending', 0.8);
// the story
for (const c of CUES) one(cueId(c), CUE_INTENSITY[c]);
for (const id of ['jennifur', 'storyDusk', 'storyStorm']) one(id, 0.5);
for (let w = 1; w <= 10; w++) one(`${WORLD_THEME(w)}~c`, 0.12);
// (every chapter fallback of sceneForPanel is one of the above: checked by loops.test.ts against the manifest)
void sceneForPanel;

const levels = generateAllLevels();
// the bosses: the fight's piece with its two layers (phase 2 brings the drive in, phase 3 the boss layer)
for (const l of levels) {
  if (l.objectiveType !== 'boss_lair') continue;
  const s = sceneForScreen('playing', l.worldIndex, true, l.id, l.miniIndex, 0, l.objectiveType)!;
  if (out[s.id]) continue;
  out[s.id] = { spec: { id: s.id, seed: s.seed, tempo: s.tempo, intensity: 0.7, target: 60, max: BOSS_MAX }, stems: ['mix', 'drive', 'boss'] };
}
for (let w = 1; w <= 10; w++) if (!out[`${BOSS_THEME(w)}~b`]) one(`${BOSS_THEME(w)}~b`, 0.6);

const stageStems = (w: number): StemName[] => ['bed', 'beat', 'top', 'drive', 'shine', ...(DARK_WORLDS.has(w) ? (['dark'] as StemName[]) : [])];
// Meeca's march: the same piece every time, recorded under its own id
const meeca = meecaStageMusic();
out[meeca.id] = { spec: { id: meeca.id, seed: meeca.seed, tempo: meeca.tempo, form: true, intensity: 0.45, target: STAGE_LOOP, max: STAGE_MAX }, stems: stageStems(5) };

// the stages
for (const l of levels) {
  if (l.objectiveType === 'boss_lair') continue;
  const s = sceneForScreen('playing', l.worldIndex, false, l.id, l.miniIndex, 0, l.objectiveType)!;
  if (s.id === meeca.id || paceFor(l.objectiveType) !== 'run') continue;
  const key = `w${l.worldIndex}`;
  if (stages[key]) continue;
  const name = `stage-${key}`;
  stages[key] = [name];
  const max = DARK_WORLDS.has(l.worldIndex) ? DARK_STAGE_MAX : STAGE_MAX;
  out[name] = { spec: { id: s.id, seed: s.seed, tempo: s.tempo, form: true, intensity: 0.45, target: STAGE_LOOP, max }, stems: stageStems(l.worldIndex) };
}
for (let w = 1; w <= 10; w++) if (!stages[`w${w}`]) throw new Error(`world ${w} has no run stage`);

console.log(JSON.stringify({ pieces: out, stages }, null, 1));
