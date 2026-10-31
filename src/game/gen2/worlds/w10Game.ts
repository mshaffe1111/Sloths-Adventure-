/**
 * gen2/worlds/w10Game — World 10 as the game builds it (DESIGN.md B10 piece G): the world's sections (w10.ts, w10Ground.ts) and, from
 * the swing builder (gen2-w10-swing), the swings over the iron netting and the stages' puzzle rooms, in one kit per stage and
 * difficulty, with the sections each stage must hold on every roll (WorldManifest.required): 10-1's first lightning rods and first spike
 * beds (the lessons, STAGE-RULES §1), and each room on its stage.
 *
 * gen2/game.ts lists the stages with this kit, and tools/gen2/curate.ts curates them on it, so a shipped roll builds in the game exactly
 * as it was checked. 10-2, 10-4, 10-5 and 10-8 are ascents (not gen2) and 10-10 is the General's lair.
 */
import type { Difficulty, SectionTemplate, WorldKit, WorldManifest } from '../types.ts';
import { w10Kit } from './w10.ts';
import { W10_LESSON_SECTIONS, W10_STAGE_ONLY } from './w10Ground.ts';
import { W10_ROOM_REQUIRED, withW10Rooms } from './w10Rooms.ts';
import { withW10Swing } from './w10Swing.ts';

/** the stages of World 10 the game builds with gen2 */
export const W10_GAME_STAGES = ['10-1', '10-3', '10-6', '10-7', '10-9'] as const;

/** each stage's must-haves: 10-1's lessons (the rods in its first Ki slot, the spike beds after) */
export const W10_REQUIRED: NonNullable<WorldManifest['required']> = {
  '10-1': [{ section: W10_LESSON_SECTIONS.rods, phase: 'ki' }, { section: W10_LESSON_SECTIONS.spikes }],
};
// (and each stage's puzzle room, w10Rooms.ts: 10-1's hoist after its lessons, 10-3's beam, 10-7's gatehouse)
for (const [id, rs] of Object.entries(W10_ROOM_REQUIRED)) W10_REQUIRED[id] = [...(W10_REQUIRED[id] ?? []), ...rs];

/**
 * Development only (a dev build's screenshots of one grab-bag piece, STAGE-RULES §1c step 3): `window.__w10force = 'w10-perch-run'`
 * before `__play` puts that section, and the gate that opens its theme, into every roll of its stage. A production build drops this
 * (import.meta.env.DEV is false there), and node never sets it.
 */
function devForced(stage: number, sections: SectionTemplate[]): WorldManifest['required'] | null {
  const env = (import.meta as unknown as { env?: { DEV?: boolean } }).env;
  const id = env?.DEV ? (globalThis as { __w10force?: string }).__w10force : undefined;
  const sec = id ? sections.find((s) => s.id === id) : undefined;
  if (!sec) return null;
  const gates = (sec.uses ?? []).flatMap((u) => sections.filter((g) => g.teaches === u && g.phases.includes('start')).slice(0, 1));
  const key = `10-${stage}`;
  return { ...W10_REQUIRED, [key]: [...gates.map((g) => ({ section: g.id, phase: 'start' as const })), ...(W10_REQUIRED[key] ?? []), { section: sec.id }] };
}

/** which stage holds which sections (STAGE-RULES §2 "Sameness"): w10Ground's W10_STAGE_ONLY, the rest by archetype and theme */
const forStage = (stage: number, id: string): boolean => !W10_STAGE_ONLY[id] || W10_STAGE_ONLY[id].includes(stage);

/** World 10's kit for one stage as the game plays it on `difficulty` */
export function w10GameKit(stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  // (the swing builder's swings over the iron netting and the stage's room, Easy's version on Easy: w10Swing.ts, w10Rooms.ts)
  const k = withW10Swing(withW10Rooms(w10Kit(stage), stage, difficulty), stage, difficulty);
  const sections = k.manifest.sections.filter((s) => forStage(stage, s.id));
  return { ...k, manifest: { ...k.manifest, sections, required: devForced(stage, sections) ?? W10_REQUIRED } };
}
