/**
 * The three acts of the story, and the sound each one has. The stage music follows how the story is written:
 *
 *   Act I   The Trail      worlds 1-3   a quest with a good-humored hummingbird; patience wins. Sunny: flute and clarinet over
 *                          bowed and plucked strings and a harp, Pokey's own tune.
 *   Act II  The Cost       worlds 4-7   the mystery gets personal, the notes get thin, the General turns out to be family.
 *                          Somber: oboe, cello and clarinet, fewer players, darker colours, the lullaby sung in the minor.
 *   Act III The Iron Road  worlds 8-10  rest, loss, mercy and the last climb. Heavy: cellos and horns, trombones and timpani,
 *                          the Iron March (the lullaby with its lights put out).
 *
 * Every act still runs: the music is always moving at a running pace (see MIN_BPM), because the player is running through the
 * game. A somber act is somber in its colours, its keys and its tunes, not in standing still.
 *
 * Nothing here makes a sound: it is the data the composer (composer.ts), the dressing (orchestrate.ts) and the fuller orchestra
 * (realize.ts) read.
 */
import type { Doubling } from './realize.ts';

export type ActId = 'trail' | 'cost' | 'iron';

export const ACTS: ActId[] = ['trail', 'cost', 'iron'];

export const ACT_NAME: Record<ActId, string> = { trail: 'Act I · The Trail', cost: 'Act II · The Cost', iron: 'Act III · The Iron Road' };

/** which act a world belongs to (the worlds the story's acts begin at: 1, 4 and 8) */
export const actOfWorld = (world: number): ActId => (world <= 3 ? 'trail' : world <= 7 ? 'cost' : 'iron');

/** the act a piece belongs to, from its id ('world5', 'gen-5-123-r', 'bossB~b'); null for the story's own scores and the like */
export function actOfThemeId(id: string): ActId | null {
  const w = /^(?:world|gen-)(\d{1,2})/.exec(id);
  if (w) return actOfWorld(Number(w[1]));
  const b = /^boss(A|B|C|Final)/.exec(id);
  if (b) return b[1] === 'A' ? 'trail' : b[1] === 'B' ? 'cost' : 'iron';
  return null;
}

/** the slowest an act's stage music may be written: a stage is a run, so even the saddest act keeps moving */
export const MIN_BPM: Record<ActId, number> = { trail: 104, cost: 98, iron: 108 };

/**
 * Where a lead sits comfortably (MIDI, as it sounds), by instrument. A tune is only given to an instrument it fits, and a cello or a
 * horn plays the tunes an octave below the notation, where those instruments sing.
 */
export const LEAD_BAND: Record<string, [number, number]> = {
  flute: [67, 91], oboe: [62, 84], clarinet: [58, 84], violins: [64, 88], cello: [48, 72], horn: [47, 66],
  // (each world's own lead, Matt 2026-10-29. The bassoon and trombone keep to their upper range, where a phone's small speaker still
  // carries them; the harp sits where its notes ring)
  harp: [57, 86], bassoon: [50, 70], trombone: [48, 64],
};
/** semitones a lead plays below the written tune */
export const LEAD_SIT: Record<string, number> = { cello: -12, horn: -12, bassoon: -12, trombone: -12 };

/** the shifts an instrument may play a tune at: its usual one first, then an octave below and an octave above */
export const leadShifts = (inst: string): number[] => {
  const s = LEAD_SIT[inst] ?? 0;
  return [s, s - 12, s + 12];
};

/** the stretch a made-up tune is kept in for an instrument, as it sounds: its comfortable band, less a little at each end */
export const leadWindow = (inst: string): [number, number] => {
  const [lo, hi] = LEAD_BAND[inst];
  return [lo + 1, hi - 3];
};

/**
 * The shift that puts a tune whose notes run from `lo` to `hi` (MIDI, as written) inside what `inst` plays comfortably, or null when it
 * does not fit at any of the usual shifts. `above` is the room left over the tune's top for a made-up section to climb into.
 */
export function fitShift(inst: string, lo: number, hi: number, above = 3): number | null {
  const band = LEAD_BAND[inst];
  if (!band) return null;
  for (const s of leadShifts(inst)) if (lo + s >= band[0] && hi + above + s <= band[1]) return s;
  return null;
}

/** how an act's orchestra is balanced (see realize.ts orchestrate) */
export interface ActMix {
  /** multipliers on the sustained beds under the music */
  bed: { low: number; strings: number; winds: number; horns: number };
  /** the winds and the horns join this much later (+) or earlier (-) as the music gets fuller */
  join: { winds: number; horns: number };
  /** multiplier on the players who double the tune */
  dbl: number;
  /** players who never double the tune in this act (the bright ones, in a somber act) */
  drop: string[];
  /** more players on the tune, by the instrument that has it */
  extra: Record<string, Doubling[]>;
}

export const ACT_MIX: Record<ActId, ActMix> = {
  trail: { bed: { low: 1, strings: 1, winds: 1, horns: 0.8 }, join: { winds: 0, horns: 0 }, dbl: 1, drop: [], extra: {} },
  // thin: fewer players, later, and dark colours: no flutes glittering over the top, a cello an octave below everything
  cost: {
    bed: { low: 1.25, strings: 0.8, winds: 0.7, horns: 0.55 },
    join: { winds: 0.15, horns: 0.15 },
    dbl: 0.75,
    drop: ['flute'],
    extra: {
      oboe: [{ inst: 'cello', oct: -12, frac: 0.5, gate: [0.25, 0.7] }],
      violins: [{ inst: 'cello', oct: -12, frac: 0.45, gate: [0.3, 0.8] }],
      flute: [{ inst: 'cello', oct: -12, frac: 0.45, gate: [0.3, 0.8] }],
    },
  },
  // iron: horns and trombones come in early and strong, the low strings are heavy
  iron: {
    bed: { low: 1.3, strings: 1.05, winds: 0.8, horns: 1.5 },
    join: { winds: 0.05, horns: -0.15 },
    dbl: 1.1,
    drop: ['flute'],
    extra: {
      oboe: [{ inst: 'horn', oct: -12, frac: 0.5, gate: [0.2, 0.6] }, { inst: 'trombone', oct: -12, frac: 0.4, gate: [0.45, 0.9], lite: true }],
      clarinet: [{ inst: 'horn', oct: -12, frac: 0.5, gate: [0.2, 0.6] }, { inst: 'trombone', oct: -12, frac: 0.4, gate: [0.45, 0.9], lite: true }],
      violins: [{ inst: 'horn', oct: -12, frac: 0.45, gate: [0.25, 0.7] }],
      cello: [{ inst: 'horn', oct: 0, frac: 0.55, gate: [0.15, 0.55] }, { inst: 'trombone', oct: 0, frac: 0.4, gate: [0.4, 0.85], lite: true }],
    },
  },
};

/** an unnamed piece (the story's scores, the map): the orchestra as it is */
export const NEUTRAL_MIX: ActMix = ACT_MIX.trail;
