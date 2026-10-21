/**
 * Which painted picture stands for each guardian. Every world's boss has a painted sheet already (the one the fight draws),
 * so a crest is simply a round window onto one frame of it: `frame` is the frame, (cx, cy) the point in it that sits in the
 * middle of the window (as a fraction of the frame), and `s` how many frame pixels the window's diameter spans.
 * Pure data, so it can be tested without a browser; the round medallion itself is ./Crest.tsx.
 */
import { GUARDIANS } from '../../game/badges.ts';
import { DRAKE_ATLAS_SIZE, DRAKE_FRAMES } from '../../game/drakeAtlasData.ts';
import { CROC_ATLAS_SIZE, CROC_FRAMES } from '../../game/crocAtlasData.ts';
import { GOLEM_ATLAS_SIZE, GOLEM_FRAMES } from '../../game/golemAtlasData.ts';
import { IRONCLAW_ATLAS_SIZE, IRONCLAW_FRAMES } from '../../game/ironclawAtlasData.ts';
import { MONARCH_ATLAS_SIZE, MONARCH_FRAMES } from '../../game/monarchAtlasData.ts';
import { PROWLER_ATLAS_SIZE, PROWLER_FRAMES } from '../../game/prowlerAtlasData.ts';
import { QUEEN_ATLAS_SIZE, QUEEN_FRAMES } from '../../game/queenAtlasData.ts';
import { REAVER_ATLAS_SIZE, REAVER_FRAMES } from '../../game/reaverAtlasData.ts';
import { SOVEREIGN_ATLAS_SIZE, SOVEREIGN_FRAMES } from '../../game/sovereignAtlasData.ts';
import { THORNBARK_ATLAS_SIZE, THORNBARK_FRAMES } from '../../game/thornbarkAtlasData.ts';
import { VENOM_ATLAS_SIZE, VENOM_FRAMES } from '../../game/venomAtlasData.ts';

export interface CrestFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface CrestSpec {
  /** the guardian's name */
  name: string;
  url: string;
  atlas: { w: number; h: number };
  /** the key of the frame in the atlas data, and its rectangle */
  frameName: string;
  frame: CrestFrame;
  cx: number;
  cy: number;
  s: number;
}

/** the world number of a boss, or the secret one */
export type CrestKey = number | 'thornbark';

const u = {
  venom: new URL('../../assets/enemies/venom-atlas.webp', import.meta.url).href,
  croc: new URL('../../assets/enemies/croc-atlas.webp', import.meta.url).href,
  prowler: new URL('../../assets/enemies/prowler-atlas.webp', import.meta.url).href,
  sovereign: new URL('../../assets/enemies/sovereign-atlas.webp', import.meta.url).href,
  queen: new URL('../../assets/enemies/queen-atlas.webp', import.meta.url).href,
  reaver: new URL('../../assets/enemies/reaver-atlas.webp', import.meta.url).href,
  golem: new URL('../../assets/enemies/golem-atlas.webp', import.meta.url).href,
  monarch: new URL('../../assets/enemies/monarch-atlas.webp', import.meta.url).href,
  drake: new URL('../../assets/enemies/drake-atlas.webp', import.meta.url).href,
  ironclaw: new URL('../../assets/enemies/ironclaw-atlas.webp', import.meta.url).href,
  thornbark: new URL('../../assets/enemies/thornbark-atlas.webp', import.meta.url).href,
};

type Frames = Record<string, CrestFrame>;
const spec = (name: string, url: string, atlas: { w: number; h: number }, frames: Frames, frameName: string, cx: number, cy: number, s: number): CrestSpec => ({
  name,
  url,
  atlas,
  frameName,
  frame: frames[frameName],
  cx,
  cy,
  s,
});

/** worlds 1 to 10 in order, then the secret guardian. Windows were framed by eye on the painted frames (see the crest sheet in the UI report). */
export const CRESTS: Record<string, CrestSpec> = {
  '1': spec(GUARDIANS[0], u.venom, VENOM_ATLAS_SIZE, VENOM_FRAMES, 'idle', 0.5, 0.5, 124),
  '2': spec(GUARDIANS[1], u.croc, CROC_ATLAS_SIZE, CROC_FRAMES, 'roar', 0.8, 0.4, 122),
  '3': spec(GUARDIANS[2], u.prowler, PROWLER_ATLAS_SIZE, PROWLER_FRAMES, 'idle', 0.84, 0.45, 84),
  '4': spec(GUARDIANS[3], u.sovereign, SOVEREIGN_ATLAS_SIZE, SOVEREIGN_FRAMES, 'idle', 0.68, 0.33, 88),
  '5': spec(GUARDIANS[4], u.queen, QUEEN_ATLAS_SIZE, QUEEN_FRAMES, 'idle2', 0.5, 0.45, 120),
  '6': spec(GUARDIANS[5], u.reaver, REAVER_ATLAS_SIZE, REAVER_FRAMES, 'idle', 0.55, 0.2, 100),
  '7': spec(GUARDIANS[6], u.golem, GOLEM_ATLAS_SIZE, GOLEM_FRAMES, 'roar', 0.5, 0.28, 84),
  '8': spec(GUARDIANS[7], u.monarch, MONARCH_ATLAS_SIZE, MONARCH_FRAMES, 'screech', 0.5, 0.42, 110),
  '9': spec(GUARDIANS[8], u.drake, DRAKE_ATLAS_SIZE, DRAKE_FRAMES, 'enrage', 0.82, 0.45, 100),
  '10': spec(GUARDIANS[9], u.ironclaw, IRONCLAW_ATLAS_SIZE, IRONCLAW_FRAMES, 'idle', 0.62, 0.3, 150),
  thornbark: spec('Thornbark', u.thornbark, THORNBARK_ATLAS_SIZE, THORNBARK_FRAMES, 'idle', 0.74, 0.62, 175),
};

/** the painted crest for a world's boss (1 to 10) or the secret guardian; undefined for anything else, which draws the plain heraldic crest instead */
export function crestFor(key: CrestKey): CrestSpec | undefined {
  return CRESTS[String(key)];
}

/** the guardian a crest belongs to, for its spoken name */
export function crestName(key: CrestKey): string {
  return crestFor(key)?.name ?? 'Guardian';
}

/** a speaker's name in the story to the crest that wears their face, when they are one of the guardians */
export function crestForSpeaker(name: string): CrestKey | undefined {
  if (name === 'Thornbark') return 'thornbark';
  const i = (GUARDIANS as readonly string[]).indexOf(name);
  return i >= 0 ? i + 1 : undefined;
}
