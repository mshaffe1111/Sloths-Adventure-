/**
 * The roof root's toy row on World 3's REAL kit (ENG-ROOT items 4-5; 3-2.md NEW 2; level.md rules 21, 23): World 3's manifest (its moves,
 * its cast's ocelot, its glowworm dark and emitters) with its way-down bricks, its shelf walk on every phase as the filler, and one row: a
 * root from the place `root` over a walkable floor, a glowworm dark over it (dark.ts darkEnds 'glow'), one fixed patch on the root and an
 * ocelot from its socket under it. At the tense phases, where World 3's threat budget pays for an ocelot. A toy id, no stage of the game.
 * Read by rootRow.test.ts (the lay), rootBots.test.ts (the bot's creep) and the stills (ENG-ROOT item 5).
 */
import { buildGen2Stage } from './pipeline.ts';
import { cfg as toyCfg } from './toyWorld.ts';
import { darkEnds } from './dark.ts';
import { W3_CAST, W3_DOWN, w3Walk, w3World } from './worlds/w3.ts';
import type { SectionTemplate, WorldKit } from './types.ts';
import type { LevelConfig } from '../types.ts';

export const ROOT_TOY = '3-97';
export const rootCfg: LevelConfig = { ...toyCfg(ROOT_TOY, 'sprint'), unlocked: true };

export const rootRow: SectionTemplate = {
  id: 'toy-root-row', name: 'a root over an ocelot', archetypes: 'any', phases: ['ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    { key: 'floor', shape: 'bank', w: [2200, 2200], place: { kind: 'start' }, main: true },
    // (the root starts and ends outside the ocelot's watch of the floor (its patrol, about 400 px, and its 240 px sight): on the dark floor
    //  it sees him at its own height, lit or not; only on the root, over its sight's 40 px up, does the dark hide him)
    { key: 'root', shape: 'vine', w: [0, 0], place: { kind: 'root', on: 'floor', at: [0.5, 0.5], len: [1600, 1600], up: { normal: 190, easy: 170 },
      patches: [{ at: 0.5, r: { normal: 90, easy: 60 } }] } },
  ],
  sockets: [...darkEnds('floor', 'floor', 'glow'), { id: 'ocelot', role: 'enemy', on: 'floor', t: [0.5, 0.5], maxThreat: 3, chance: 1 }],
  entry: { piece: 'floor', kind: 'ground' }, exit: { piece: 'floor', kind: 'ground' }, exitDy: 0, mirrorable: false,
};
const W3 = w3World();
export const rootKit: WorldKit = {
  ...W3,
  spawn: (e, _c, out) => {
    const cast = (out.proto.cast ??= { kinds: [], traps: [] });
    if (!cast.kinds.includes(e.type)) cast.kinds.push(e.type);
  },
  manifest: { ...W3.manifest, creatures: [...W3_CAST], sections: [...W3_DOWN, { ...w3Walk, id: 'w3toy-walk', phases: ['ki', 'sho', 'ten', 'ketsu'] }, rootRow] },
  // (World 3's way-down bricks, its shelf walk on every phase as the filler around the row)
};
/** the first roll from `from` on that lays the row whole (no errors, the root, the ocelot) */
export function rootBuilt(difficulty: 'normal' | 'easy', K: WorldKit = rootKit, from = 1) {
  for (let seed = from; seed < from + 20; seed++) {
    const st = buildGen2Stage({ config: rootCfg, kit: K, seed, difficulty });
    if (!st.gen2.errors?.length && st.ropes?.some((r) => r.look === 'root') && st.enemies.some((e) => e.type === 'ocelot')) return { st, seed };
  }
  throw new Error(`no roll lays the root row (${difficulty})`);
}

