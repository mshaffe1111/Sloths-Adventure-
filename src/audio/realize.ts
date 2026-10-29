/**
 * The real orchestra. The music was written for a mix of recorded instruments and built-in synthesized ones (strings, brass, a choir, bells, a
 * marimba, drums), and the synthesized ones sound like a keyboard. For the music (the sound effects are not touched) every synthesized voice is
 * swapped here for the recording of the instrument it stood in for, so the whole score sounds like one orchestra in one room.
 *
 * Only names live here (so the loader can ask which recordings a piece needs without pulling the voices in): the voices themselves are
 * in instruments.ts, and music.ts looks a track's voice up through these tables.
 */
import type { ChordTrack, MelodyTrack, NoteInstName, Theme, Track } from './music.ts';
import { trim, VOICE_RANGE } from './scoreKit.ts';
import { ACT_MIX, NEUTRAL_MIX, actOfThemeId } from './acts.ts';

/** the recorded voice that plays in place of a synthesized note voice (a voice that is already a recording is not in the table) */
export const REAL_NOTE: Record<string, string> = {
  marimba: 'marimbaR',
  steelpan: 'marimbaR',
  kalimba: 'harpSoft',
  pluck: 'harpSoft',
  bell: 'glockR',
  softLead: 'clarinet',
  brass: 'horn',
  bass: 'bassR',
  subBass: 'bassR',
  synthBass: 'bassR',
};

/**
 * A figure played over and over (a pattern track: an arpeggio, a pulse) is played by what an orchestra would play it with. A marimba or a
 * plucked note repeated every eighth is what turned into "boop boop boop", so those figures go to bowed short notes (see figR).
 */
export const REAL_PATTERN: Record<string, string> = { marimba: 'figR', steelpan: 'figR', kalimba: 'figR', pluck: 'figR', bell: 'glockR' };

export const REAL_CHORD: Record<string, string> = { pad: 'orchStrings', strings: 'orchStrings', choir: 'orchWinds' };

export const REAL_DRUM: Record<string, string> = {
  kick: 'bassDrum',
  softKick: 'bassDrum',
  tom: 'bassDrum',
  congaHi: 'mute',
  congaLo: 'mute',
  rim: 'snareSoft',
  clave: 'snareSoft',
  woodblock: 'snareSoft',
  hat: 'mute',
  ohat: 'mute',
  shaker: 'mute',
  brush: 'mute',
  riser: 'mute',
};

/**
 * How much louder (+) or quieter (-) the recording plays than the synthesized voice it replaces, in dB, so a track keeps its place in the mix.
 * Measured (A-weighted level of the same notes at the engine's own velocity, rendered offline: see scripts/realLevels.md), keyed by the old voice.
 */
export const REAL_TRIM_DB: Record<string, number> = {};

export const trimOf = (name: string) => Math.pow(10, (REAL_TRIM_DB[name] ?? 0) / 20);

/** the name of the voice a track plays when the music is the real orchestra */
export function realVoice(track: Pick<Track, 'kind'> & { inst?: string; voice?: string }, inst?: string): string {
  if (track.kind === 'drums') return REAL_DRUM[track.voice as string] ?? (track.voice as string);
  const name = inst ?? (track.inst as string);
  if (track.kind === 'chords') return REAL_CHORD[name] ?? name;
  if (track.kind === 'pattern') return REAL_PATTERN[name] ?? REAL_NOTE[name] ?? name;
  return REAL_NOTE[name] ?? name;
}

/**
 * The seating plan: where each instrument sits on the stage, as the audience hears it. `pan` is left (-1) to right (+1); `depth` is how far back,
 * 0 at the front desk and 1 at the back wall: the further back, the more of the hall's sound it brings with it and the more of its treble the air takes.
 */
export const STAGE: Record<string, { pan: number; depth: number }> = {
  violins: { pan: -0.45, depth: 0.3 }, violinStac: { pan: -0.45, depth: 0.3 },
  violas: { pan: 0.15, depth: 0.35 },
  cello: { pan: 0.4, depth: 0.35 }, celloStac: { pan: 0.4, depth: 0.35 },
  contra: { pan: 0.62, depth: 0.45 }, contraPizz: { pan: 0.62, depth: 0.45 }, bassR: { pan: 0.6, depth: 0.45 },
  orchStrings: { pan: 0, depth: 0.35 },
  harp: { pan: -0.7, depth: 0.4 }, harpSoft: { pan: -0.65, depth: 0.4 },
  flute: { pan: -0.15, depth: 0.5 }, oboe: { pan: 0.05, depth: 0.5 }, clarinet: { pan: 0.2, depth: 0.5 }, bassoon: { pan: 0.35, depth: 0.5 }, orchWinds: { pan: 0, depth: 0.5 },
  horn: { pan: 0.45, depth: 0.65 }, hornStac: { pan: 0.45, depth: 0.65 }, trombone: { pan: 0.2, depth: 0.75 }, tuba: { pan: 0.5, depth: 0.8 }, orchBrass: { pan: 0.3, depth: 0.7 },
  timpani: { pan: 0, depth: 0.9 }, bassDrum: { pan: 0, depth: 0.9 }, taiko: { pan: 0, depth: 0.9 }, snare: { pan: -0.1, depth: 0.8 }, snareSoft: { pan: -0.1, depth: 0.8 },
  crash: { pan: 0, depth: 0.95 }, gong: { pan: 0, depth: 0.95 }, triangle: { pan: 0.3, depth: 0.8 },
  marimbaR: { pan: 0.55, depth: 0.55 }, glockR: { pan: 0.6, depth: 0.6 },
};

/** an instrument name (a melody's alternate, say) as the real orchestra plays it */
export const realNoteName = (inst: string) => REAL_NOTE[inst] ?? inst;

// ───────────────────────────────────────────── a fuller orchestra ─────────────────────────────────────────────

/** one more player on a tune: which instrument, how many octaves away, how loud next to the tune, and from what fullness of the music it joins */
export interface Doubling {
  inst: string;
  oct: number;
  frac: number;
  gate: [number, number];
  /** it plays a chord tone below the tune (a harmony part, as a choir would sing) instead of the tune itself */
  harm?: boolean;
  /** skipped on slow phones */
  lite?: boolean;
}

/** who joins the tune, by the instrument that plays it: the winds and strings that would play with it in a real orchestra */
export const DOUBLES: Record<string, Doubling[]> = {
  flute: [
    { inst: 'violins', oct: 0, frac: 0.5, gate: [0.3, 0.75] },
    { inst: 'clarinet', oct: 0, frac: 0.42, gate: [0.45, 0.9], harm: true, lite: true },
  ],
  oboe: [
    { inst: 'violins', oct: 0, frac: 0.5, gate: [0.3, 0.75] },
    { inst: 'clarinet', oct: 0, frac: 0.42, gate: [0.45, 0.9], harm: true, lite: true },
  ],
  clarinet: [
    { inst: 'violas', oct: 0, frac: 0.55, gate: [0.2, 0.65] },
    { inst: 'cello', oct: -12, frac: 0.45, gate: [0.35, 0.85], lite: true },
    { inst: 'flute', oct: 12, frac: 0.3, gate: [0.55, 1], lite: true },
  ],
  violins: [
    { inst: 'violas', oct: -12, frac: 0.5, gate: [0.15, 0.6] },
    { inst: 'flute', oct: 12, frac: 0.3, gate: [0.4, 0.9], lite: true },
    { inst: 'clarinet', oct: 0, frac: 0.38, gate: [0.45, 0.9], harm: true, lite: true },
  ],
  // the low leads are doubled an octave up, softly and from the start: a phone's small speaker loses a cello, a bassoon or a trombone's
  // body, and the octave is what it carries
  cello: [
    { inst: 'violas', oct: 12, frac: 0.4, gate: [0, 0.3] },
    { inst: 'bassoon', oct: 0, frac: 0.4, gate: [0.3, 0.8], lite: true },
  ],
  bassoon: [
    { inst: 'violas', oct: 12, frac: 0.38, gate: [0, 0.3] },
    { inst: 'cello', oct: 0, frac: 0.4, gate: [0.3, 0.8], lite: true },
  ],
  trombone: [
    { inst: 'horn', oct: 12, frac: 0.38, gate: [0, 0.3] },
    { inst: 'violas', oct: 12, frac: 0.3, gate: [0.4, 0.85], lite: true },
  ],
  harp: [
    { inst: 'violins', oct: 0, frac: 0.3, gate: [0.35, 0.8] },
    { inst: 'flute', oct: 0, frac: 0.3, gate: [0.5, 0.95], lite: true },
  ],
  horn: [
    { inst: 'violas', oct: 0, frac: 0.42, gate: [0.2, 0.7] },
    { inst: 'clarinet', oct: 0, frac: 0.36, gate: [0.3, 0.8], lite: true },
    { inst: 'trombone', oct: -12, frac: 0.4, gate: [0.5, 0.95], lite: true },
  ],
  glockR: [
    { inst: 'flute', oct: 0, frac: 0.55, gate: [0.15, 0.6] },
    { inst: 'violins', oct: 0, frac: 0.4, gate: [0.3, 0.8], lite: true },
  ],
  marimbaR: [
    { inst: 'clarinet', oct: 0, frac: 0.5, gate: [0.2, 0.7] },
    { inst: 'violas', oct: 0, frac: 0.4, gate: [0.35, 0.85], lite: true },
  ],
  harpSoft: [
    { inst: 'flute', oct: 0, frac: 0.5, gate: [0.2, 0.7] },
    { inst: 'violins', oct: 0, frac: 0.4, gate: [0.35, 0.85], lite: true },
  ],
};

/** the sustained beds under every piece: the strings, the low strings, the winds and the horns, joining as the music gets fuller */
const BEDS: Array<{ name: string; key: 'low' | 'strings' | 'winds' | 'horns'; inst: string; lo: number; hi: number; voices: number; rev: number; frac: number; gate: [number, number]; lite?: boolean; like: string[] }> = [
  { name: 'bedLow', key: 'low', inst: 'orchLow', lo: 31, hi: 52, voices: 2, rev: 0.2, frac: 0.27, gate: [0, 0.3], like: ['orchLow'] },
  { name: 'bedStrings', key: 'strings', inst: 'orchStrings', lo: 46, hi: 72, voices: 4, rev: 0.5, frac: 0.31, gate: [0, 0.45], like: ['pad', 'strings', 'orchStrings'] },
  { name: 'bedWinds', key: 'winds', inst: 'orchWinds', lo: 57, hi: 83, voices: 3, rev: 0.5, frac: 0.24, gate: [0.1, 0.55], lite: true, like: ['choir', 'orchWinds'] },
  { name: 'bedHorns', key: 'horns', inst: 'orchBrass', lo: 43, hi: 67, voices: 3, rev: 0.55, frac: 0.24, gate: [0.3, 0.8], lite: true, like: ['orchBrass'] },
];

const mergeGate = (a: [number, number] | undefined, b: [number, number]): [number, number] => (a ? [Math.max(a[0], b[0]), Math.max(a[1], b[1])] : b);

/**
 * The parts a performance adds to what the theme wrote, so a few written lines sound like a whole orchestra:
 *   beds   a held chord under everything in each family (low strings, strings, winds, horns), thinner where the theme already has one;
 *   tunes  the first tune is joined by the instruments that would play with it (DOUBLES), one of them as a harmony part.
 * It all comes from the theme's own chords and tune, so it is always in key. The story's cue pieces are written part by part and keep their
 * own tunes alone (they get the beds only).
 */
export function fullOrchestra(theme: Theme): Track[] {
  const out: Track[] = [];
  const act = actOfThemeId(theme.id);
  const mix = act ? ACT_MIX[act] : NEUTRAL_MIX;
  const cue = theme.id.startsWith('score_');
  const lead = theme.tracks.find((t): t is MelodyTrack => t.kind === 'melody');
  // the tune's loudness as it is heard, in the woodwinds' terms: what a part is added at is a share of that
  const ref = lead ? (lead.gain * trimOf(lead.inst)) / trim(realVoice(lead)) : 0.6;
  const shiftGate = (g: [number, number], by: number): [number, number] => [Math.max(0, Math.min(0.95, g[0] + by)), Math.max(0.05, Math.min(1, g[1] + by))];
  for (const b of BEDS) {
    const has = theme.tracks.some((t) => t.kind === 'chords' && b.like.includes(realVoice(t)));
    const bed: ChordTrack = {
      kind: 'chords',
      name: b.name,
      inst: b.inst as ChordTrack['inst'],
      lo: b.lo,
      hi: b.hi,
      voices: b.voices,
      mask: undefined,
      gain: Math.round(ref * b.frac * mix.bed[b.key] * (has ? 0.5 : 1) * (cue ? 0.8 : 1) * trim(b.inst) * 1000) / 1000,
      rev: b.rev,
      gate: b.key === 'winds' || b.key === 'horns' ? shiftGate(b.gate, mix.join[b.key]) : b.gate,
      ...(b.lite ? { lite: true } : {}),
    };
    out.push(bed);
  }
  if (lead && !cue) {
    const leadReal = realVoice(lead);
    const players = [...(DOUBLES[leadReal] ?? []).filter((d) => !mix.drop.includes(d.inst)), ...(mix.extra[leadReal] ?? [])];
    for (const d of players) {
      out.push({
        kind: 'melody',
        name: `${lead.name}+${d.inst}${d.harm ? 'H' : ''}`,
        inst: d.inst as NoteInstName,
        bars: lead.bars,
        gen: lead.gen,
        shift: (lead.shift ?? 0) + d.oct,
        legato: lead.legato,
        genKey: lead.genKey ?? lead.name,
        mask: lead.mask,
        gain: Math.round(ref * d.frac * mix.dbl * trim(d.inst) * 1000) / 1000,
        rev: Math.min(0.9, (lead.rev ?? 0.15) + 0.1),
        gate: mergeGate(lead.gate, d.gate),
        fold: VOICE_RANGE[d.inst],
        ...(d.harm ? { harmonize: 9 } : {}),
        ...(d.lite ? { lite: true } : {}),
      });
    }
  }
  return out;
}
