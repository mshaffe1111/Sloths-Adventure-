/**
 * gen2/worlds/w8Game — World 8 as the game builds it (DESIGN.md B10 piece G, B12 step 4): the world's kit (w8.ts), its ground, dark,
 * roost, bloom, glide and arena sections (w8Sections.ts), its lianas (w8Swing.ts) and the stage's puzzle room (w8Rooms.ts) folded into one
 * kit per stage and difficulty, with each stage's room required on every roll (WorldManifest.required): 8-1's dark hollow, 8-2's leaf
 * hammock, 8-5's branch seesaw.
 *
 * gen2/game.ts lists the stages with this kit, and tools/gen2/curate.ts curates them on it. After buildGen2Stage the game runs w8Finish.
 */
import type { Difficulty, SectionTemplate, WorldKit, WorldManifest } from '../types.ts';
import { w8Kit } from './w8.ts';
import { W8_ROOM_SECTIONS, W8R_STAGE, w8RoomsFor } from './w8Rooms.ts';
import { W8_SECTIONS, W8_STAGE_ONLY } from './w8Sections.ts';
import { W8_SWING_SECTIONS } from './w8Swing.ts';

/** the stages of World 8 the game builds with gen2 (8-7 The Tallest Tree is an ascent, hand-built; 8-10 is the guardian's lair) */
export const W8_GAME_STAGES = ['8-1', '8-2', '8-3', '8-4', '8-5', '8-6', '8-8', '8-9'] as const;

/**
 * The dark on every roll of every stage (the Twilight Treetops are dark: zones.ts), each with Dot's line on its lit first bough: 8-1's
 * themes all hold a dark stretch, and its room comes after the first; the others hold one of their own
 */
export const W8_DARK_REQUIRED: Readonly<Record<string, string>> = {
  '8-2': 'w8-bloom-dark',
  '8-3': 'w8s-dark-swing',
  '8-4': 'w8-roost-dark',
  '8-5': 'w8s-dark-swing',
  '8-6': 'w8-glide-dark',
  '8-8': 'w8-guard-dark',
  '8-9': 'w8-monarch-dark',
};

/** each stage's puzzle room and its dark stretch, on every roll */
export const W8_REQUIRED: NonNullable<WorldManifest['required']> = Object.fromEntries(
  W8_GAME_STAGES.map((id) => [
    id,
    [...W8_ROOM_SECTIONS.filter((s) => W8R_STAGE[s.id] === id).map((s) => ({ section: s.id })), ...(W8_DARK_REQUIRED[id] ? [{ section: W8_DARK_REQUIRED[id] }] : [])],
  ]),
);

/** the vine stages (8-3 Long Swings, 8-5 Next Branch) hold the lianas; no other stage does */
export const W8_SWING_STAGES: readonly number[] = [3, 5];

/** which stage holds which section: the lianas the vine stages', the listed ones their stages' (w8Sections W8_STAGE_ONLY) */
function forStage(stage: number, s: SectionTemplate): boolean {
  if (W8_SWING_SECTIONS.includes(s)) return W8_SWING_STAGES.includes(stage);
  const only = W8_STAGE_ONLY[s.id];
  return !only || only.includes(stage);
}

/**
 * World 8's falls (the lead, 2026-10-29: "on Normal, a fall from a LIT bough costs a life"): the world's pit is 'void' (the canopy floor far
 * below; Easy's are all soft, as the pipeline has it), and these gaps keep a soft pit (`soft`): every gap inside a dark stretch (between a
 * section's darkFrom and darkTo pieces: a deadly fall in the dark would be a blind jump), and every second-jump and glide gap (STAGE-RULES
 * §6: the first-timer drowns at second-jump gaps over a deadly fall; a glide's pit climbs back anyway), and a start section's gaps
 */
export function w8Falls(t: SectionTemplate): SectionTemplate {
  const keys = t.pieces.map((p) => p.key);
  const from = keys.indexOf(t.sockets.find((k) => k.id === 'darkFrom')?.on ?? '');
  const to = keys.indexOf(t.sockets.find((k) => k.id === 'darkTo')?.on ?? '');
  const dark = (i: number) => from >= 0 && to >= 0 && i > from && i <= to;
  let changed = false;
  const pieces = t.pieces.map((p, i) => {
    const pl = p.place;
    if (pl.kind !== 'jump' && pl.kind !== 'double' && pl.kind !== 'pit' && pl.kind !== 'land') return p;
    // (and a start's gaps: nothing can hurt in a stage's opening seconds, STAGE-RULES §2)
    const soft = dark(i) || t.phases.includes('start') || pl.kind === 'double' || (pl.kind === 'pit' && pl.jump !== 'jump');
    if (!soft || pl.water) return p;
    changed = true;
    return { ...p, place: { ...pl, soft: true } };
  });
  return changed ? { ...t, pieces } : t;
}

/** World 8's kit for one stage as the game plays it on `difficulty` */
export function w8GameKit(stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const k = w8Kit(stage);
  const sections = [...W8_SECTIONS, ...W8_SWING_SECTIONS].filter((s) => forStage(stage, s)).map(w8Falls);
  return { ...k, manifest: { ...k.manifest, sections: [...sections, ...w8RoomsFor(stage, difficulty).map(w8Falls)], required: W8_REQUIRED } };
}
