/**
 * The story's score: which piece plays for which cue (the registry), and how each cue is mixed.
 * The pieces themselves are in scoreHeart.ts and scoreDrama.ts, built from the leitmotifs in motifs.ts.
 */
import type { Theme } from './music.ts';
import type { StoryCue } from '../game/story.ts';
import { chase, dread, finale, hush, mercy, resolve, reveal, war } from './scoreDrama.ts';
import { meeca, sorrow, tender } from './scoreHeart.ts';
import { bloom, comedy, grandma, journey, pokey, triumph } from './scoreLight.ts';

const BUILD: Record<StoryCue, () => Theme> = {
  meeca, tender, sorrow, pokey, bloom, grandma, journey, comedy, triumph,
  dread, war, chase, reveal, resolve, mercy, finale, hush,
};

/** every cue there is, in the order of the StoryCue type */
export const CUES: StoryCue[] = [
  'pokey', 'meeca', 'bloom', 'grandma', 'journey', 'comedy', 'tender', 'sorrow', 'dread',
  'war', 'chase', 'reveal', 'resolve', 'triumph', 'mercy', 'finale', 'hush',
];

/** the id of the piece written for a cue */
export const cueId = (cue: StoryCue) => `score_${cue}`;

const cache = new Map<string, Theme>();

/** the piece for an id like 'score_meeca' (built the first time it is asked for), or null */
export function scoreById(id: string): Theme | null {
  const hit = cache.get(id);
  if (hit) return hit;
  const m = /^score_([a-z]+)$/.exec(id);
  const build = m ? BUILD[m[1] as StoryCue] : undefined;
  if (!build) return null;
  const t = build();
  cache.set(id, t);
  return t;
}
