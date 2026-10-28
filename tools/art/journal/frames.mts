/**
 * The Jungle Journal's card pictures: for each creature, which sheet and which frame of the art the game draws today.
 * `npx tsx tools/art/journal/frames.mts [--all]` prints the crops as JSON for pack.py (with --all: every frame of each picked
 * sequence, for choosing by eye). The picks live in PICKS below.
 */
import { GOLDSNAKE_ANIM, GOLDSNAKE_SEQ } from '../../../src/game/goldsnakeAnimData.ts';
import { TAYRA_FRAMES } from '../../../src/game/tayraAtlasData.ts';
import { OCELOT_ANIM, OCELOT_SEQ } from '../../../src/game/ocelotAnimData.ts';
import { JAGUAR_ANIM, JAGUAR_SEQ } from '../../../src/game/jaguarAnimData.ts';
import { BOA_ANIM, BOA_SEQ } from '../../../src/game/boaAnimData.ts';
import { EAGLE_ANIM, EAGLE_SEQ } from '../../../src/game/eagleAnimData.ts';
import { SPIDER_ANIM, SPIDER_SEQ } from '../../../src/game/spiderAnimData.ts';
import { CAIMAN_FRAMES } from '../../../src/game/caimanAtlasData.ts';
import { TURTLE_ANIM, TURTLE_SEQ } from '../../../src/game/turtleAnimData.ts';
import { HARPY_FRAMES } from '../../../src/game/harpyAtlasData.ts';
import { FROG_FRAMES } from '../../../src/game/frogAtlasData.ts';
import { GUARD_ANIM, GUARD_SEQ } from '../../../src/game/guardAnimData.ts';
import { W4_FRAMES } from '../../../src/game/w4PropsData.ts';
import { BUTLER_FRAMES } from '../../../src/game/butlerAtlasData.ts';
import { SEAMSTRESS_FRAMES } from '../../../src/game/seamstressAtlasData.ts';
import { PELL_ANIM, PELL_SEQ } from '../../../src/game/pellAnimData.ts';
import { SOLDIER_ANIM, SOLDIER_SEQ } from '../../../src/game/soldierAnimData.ts';
import { VENOM_FRAMES } from '../../../src/game/venomAtlasData.ts';
import { CROC_ANIM_FRAMES, CROC_CLIPS } from '../../../src/game/crocAnimData.ts';
import { PROWLER_ANIM_FRAMES, PROWLER_CLIPS } from '../../../src/game/prowlerAnimData.ts';
import { SOVEREIGN_FRAMES } from '../../../src/game/sovereignAtlasData.ts';
import { QUEEN_FRAMES } from '../../../src/game/queenAtlasData.ts';
import { REAVER_FRAMES } from '../../../src/game/reaverAtlasData.ts';
import { GOLEM_FRAMES } from '../../../src/game/golemAtlasData.ts';
import { MONARCH_FRAMES } from '../../../src/game/monarchAtlasData.ts';
import { DRAKE_FRAMES } from '../../../src/game/drakeAtlasData.ts';
import { IRONCLAW_FRAMES } from '../../../src/game/ironclawAtlasData.ts';

type R = { x: number; y: number; w: number; h: number };
type Frames = Record<string, R>;
type Seqs = Record<string, readonly string[]>;
/** a sheet (under src/assets), its frames, its sequences (clip sheets), the frame picked (or [sequence, 0..1]), and whether to mirror it */
interface Pick { sheet: string; frames: Frames; seqs?: Seqs; pick: string | [string, number]; flip?: boolean }

const E = (n: string) => `enemies/${n}`;
export const PICKS: Record<string, Pick> = {
  // the predators (ids as the engine marks them met: badges.ts PREDATORS)
  snake: { sheet: E('goldsnake-anim.webp'), frames: GOLDSNAKE_ANIM, seqs: GOLDSNAKE_SEQ, pick: ['rear', 0.5] },
  tayra: { sheet: E('tayra-atlas.webp'), frames: TAYRA_FRAMES, pick: 'walk_1' },
  ocelot: { sheet: E('ocelot-anim.webp'), frames: OCELOT_ANIM, seqs: OCELOT_SEQ, pick: ['walk', 0.3] },
  jaguar: { sheet: E('jaguar-anim.webp'), frames: JAGUAR_ANIM, seqs: JAGUAR_SEQ, pick: ['walk', 0.3] },
  boa: { sheet: E('boa-anim.webp'), frames: BOA_ANIM, seqs: BOA_SEQ, pick: ['coil', 0.5] },
  eagle: { sheet: E('eagle-anim.webp'), frames: EAGLE_ANIM, seqs: EAGLE_SEQ, pick: ['fly', 0.5] },
  spider: { sheet: E('spider-anim.webp'), frames: SPIDER_ANIM, seqs: SPIDER_SEQ, pick: ['idle', 0.3] },
  caiman: { sheet: E('caiman-atlas.webp'), frames: CAIMAN_FRAMES, pick: 'hiss' },
  turtle: { sheet: E('turtle-anim.webp'), frames: TURTLE_ANIM, seqs: TURTLE_SEQ, pick: ['walk', 0.3] },
  harpy: { sheet: E('harpy-atlas.webp'), frames: HARPY_FRAMES, pick: 'walkB' },
  frog: { sheet: E('frog-atlas.webp'), frames: FROG_FRAMES, pick: 'idle' },
  // met on the road (the stage pieces that are not the engine's enemies)
  royal_guard: { sheet: E('guard-anim.webp'), frames: GUARD_ANIM, seqs: GUARD_SEQ, pick: ['tell', 0.5] },
  capuchin: { sheet: 'props/w4-props.webp', frames: W4_FRAMES as unknown as Frames, pick: 'capWalk' },
  eaglet: { sheet: 'props/w4-props.webp', frames: W4_FRAMES as unknown as Frames, pick: 'nestEaglet' },
  butler: { sheet: E('butler-poses.webp'), frames: BUTLER_FRAMES, pick: 'idle' },
  seamstress: { sheet: E('seamstress-poses.webp'), frames: SEAMSTRESS_FRAMES, pick: 'idle' },
  pell: { sheet: E('pell-anim.webp'), frames: PELL_ANIM, seqs: PELL_SEQ, pick: ['idle', 0.3] },
  soldier: { sheet: E('soldier-anim.webp'), frames: SOLDIER_ANIM, seqs: SOLDIER_SEQ, pick: ['idle_a', 0.3] },
  // the guardians, by world, as the fights draw them (bossArt.ts PAINTED)
  guardian_1: { sheet: E('venom-atlas.webp'), frames: VENOM_FRAMES, pick: 'idle' },
  guardian_2: { sheet: E('croc-anim.webp'), frames: CROC_ANIM_FRAMES, seqs: CROC_CLIPS, pick: ['roar', 0.3] },
  guardian_3: { sheet: E('prowler-anim.webp'), frames: PROWLER_ANIM_FRAMES, seqs: PROWLER_CLIPS, pick: ['idle', 0.5] },
  guardian_4: { sheet: E('sovereign-atlas.webp'), frames: SOVEREIGN_FRAMES, pick: 'idle' },
  guardian_5: { sheet: E('queen-atlas.webp'), frames: QUEEN_FRAMES, pick: 'idle' },
  guardian_6: { sheet: E('reaver-atlas.webp'), frames: REAVER_FRAMES, pick: 'idle' },
  guardian_7: { sheet: E('golem-atlas.webp'), frames: GOLEM_FRAMES, pick: 'march1' },
  guardian_8: { sheet: E('monarch-atlas.webp'), frames: MONARCH_FRAMES, pick: 'hover' },
  guardian_9: { sheet: E('drake-atlas.webp'), frames: DRAKE_FRAMES, pick: 'idle' },
  guardian_10: { sheet: E('ironclaw-atlas.webp'), frames: IRONCLAW_FRAMES, pick: 'idle' },
};

const nameOf = (p: Pick): string => {
  if (typeof p.pick === 'string') return p.pick;
  const [s, t] = p.pick;
  const f = p.seqs![s];
  return f[Math.max(0, Math.min(f.length - 1, Math.floor(t * f.length)))];
};

const all = process.argv.includes('--all');
const out: Array<{ id: string; sheet: string; frame: string; rect: R; flip: boolean }> = [];
for (const [id, p] of Object.entries(PICKS)) {
  if (all) {
    const names = typeof p.pick === 'string' ? Object.keys(p.frames) : Object.values(p.seqs!).map((s) => s[Math.floor(s.length / 2)]);
    for (const n of names) out.push({ id, sheet: p.sheet, frame: n, rect: p.frames[n], flip: !!p.flip });
  } else {
    const n = nameOf(p);
    const r = p.frames[n];
    if (!r) throw new Error(`${id}: no frame ${n}`);
    out.push({ id, sheet: p.sheet, frame: n, rect: { x: r.x, y: r.y, w: r.w, h: r.h }, flip: !!p.flip });
  }
}
console.log(JSON.stringify(out));
