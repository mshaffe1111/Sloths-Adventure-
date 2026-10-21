/**
 * Small tools for writing the story's cue pieces (score*.ts) as a grid: one row per track, one cell per bar of the piece.
 * Everything returns the ordinary Theme/Track data of music.ts, so a cue piece plays on the same Playback as the rest of the music.
 */
import type { ChordTrack, DrumName, DrumTrack, MelodyTrack, NoteInstName, PatternTrack, Theme, Track } from './music.ts';
import type { ChordInstName } from './music.ts';

/** a piece in the making: how long a bar is and how many bars the loop has */
export interface Grid {
  /** sixteenths per bar: 16 (4/4) or 12 (3/4 or 6/8) */
  spb: 16 | 12;
  bars: number;
}

/** the bars of a track, silent except where the given parts are laid: `at` is the first bar of a part */
export function lay(g: Grid, rest: string, ...parts: Array<[at: number, bars: string | string[]]>): string[] {
  const out = Array.from({ length: g.bars }, () => rest);
  for (const [at, c] of parts) {
    const a = Array.isArray(c) ? c : [c];
    a.forEach((b, i) => {
      if (at + i >= g.bars) throw new Error(`part at bar ${at} runs past the ${g.bars}-bar form`);
      out[at + i] = b;
    });
  }
  return out;
}

export const same = (n: number, bar: string): string[] => Array.from({ length: n }, () => bar);

/** a melody track's silent bar and a pattern/drum track's silent bar */
export const mrest = (g: Grid) => `r:${g.spb}`;
export const prest = (g: Grid) => '.'.repeat(g.spb);

/** a mask string for a chord track: 'x' where it plays, from..to (inclusive) */
export function maskOf(g: Grid, ...spans: Array<[number, number]>): string {
  const m = Array.from({ length: g.bars }, () => '.');
  for (const [a, b] of spans) for (let i = a; i <= Math.min(b, g.bars - 1); i++) m[i] = 'x';
  return m.join('');
}

type Common = { gain?: number; rev?: number; dly?: number; pan?: number; lite?: boolean; gate?: [number, number] };

/**
 * Every voice of the engine has its own loudness (the recorded violins are far quieter than the recorded clarinet at the same track gain),
 * so a gain written for one instrument means nothing for another. These are the measured differences, in dB, between each voice and the
 * woodwinds (A-weighted level of held notes at the engine's own velocity, rendered offline); the track constructors below add them, so in
 * the cue pieces a track's `gain` is its place in the mix whichever instrument plays it: about 0.7 for a lead, 0.4 for a second voice,
 * 0.3 for a bed. Plucked and struck voices are already near the woodwinds' level and are left alone.
 */
export const VOICE_TRIM_DB: Record<string, number> = {
  cello: 7, violas: 6.5, violins: 11, horn: 6, trombone: 7, tuba: 5, contra: 5, contraPizz: 5, bass: 4, subBass: 4, brass: 6, softLead: 5,
  // held chords: the section voices and the synthesized pads
  orchStrings: 2.5, orchBrass: 3, strings: 5, pad: 5, choir: 10,
};
export const trim = (inst: string) => Math.round(Math.pow(10, (VOICE_TRIM_DB[inst] ?? 0) / 20) * 1000) / 1000;

/**
 * The MIDI range each recorded voice plays in tune and in character (measured with the harness: a chromatic run through each voice,
 * pitch-tracked; the ends are where the recordings run out and a note has to be bent a long way). Melody tracks are tested against it.
 */
export const VOICE_RANGE: Record<string, [number, number]> = {
  cello: [36, 77], violas: [48, 86], violins: [55, 88], clarinet: [50, 88], flute: [60, 96], oboe: [58, 89], bassoon: [43, 70],
  horn: [36, 66], trombone: [34, 65], tuba: [34, 58], contra: [30, 59], harp: [36, 100], celloStac: [40, 77], violinStac: [55, 86], hornStac: [40, 77],
};

const round3 = (x: number) => Math.round(x * 1000) / 1000;

export const melody = (name: string, inst: NoteInstName, bars: string[], o: Common & { shift?: number; legato?: number; alt?: NoteInstName } = {}): MelodyTrack => {
  const { alt, gain, ...rest } = o;
  return { kind: 'melody', name, inst, bars, gain: round3((gain ?? 0.6) * trim(inst)), ...(alt ? { altInst: alt } : {}), ...rest };
};

export const pattern = (name: string, inst: NoteInstName, oct: number, pats: string[], o: Common & { len?: number } = {}): PatternTrack => ({
  kind: 'pattern', name, inst, oct, pats, ...o, gain: round3((o.gain ?? 0.5) * trim(inst)),
});

export const chords = (name: string, inst: ChordInstName, lo: number, hi: number, mask: string, o: Common & { voices?: number; stabs?: string[]; stabLen?: number } = {}): ChordTrack => ({
  kind: 'chords', name, inst, lo, hi, mask, ...o, gain: round3((o.gain ?? 0.4) * trim(inst)),
});

export const drums = (name: string, voice: DrumName, pats: string[], o: Common & { fill?: string } = {}): DrumTrack => ({
  kind: 'drums', name, voice, pats, gain: o.gain ?? 0.5, ...o,
});

export interface PieceSpec {
  id: string;
  bpm: number;
  tonic: string;
  scale: Theme['scale'];
  /** one chord per bar (the grid says how many bars) */
  chords: string[];
  grid: Grid;
  level?: number;
  delay?: number;
  tempoMap?: number[];
}

/** a cue piece: a still Theme (no breakdown, no key lift) on the grid */
export function piece(s: PieceSpec, tracks: Track[]): Theme {
  if (s.chords.length !== s.grid.bars) throw new Error(`${s.id}: ${s.chords.length} chords for a ${s.grid.bars}-bar form`);
  if (s.tempoMap && s.tempoMap.length !== s.grid.bars) throw new Error(`${s.id}: tempoMap has ${s.tempoMap.length} bars, the form ${s.grid.bars}`);
  return {
    id: s.id,
    bpm: s.bpm,
    tonic: s.tonic,
    scale: s.scale,
    stepsPerBar: s.grid.spb === 12 ? 12 : undefined,
    delay: s.delay ?? 0.75,
    level: s.level,
    still: true,
    tempoMap: s.tempoMap,
    chords: s.chords,
    tracks,
  };
}

/** a tempo map that holds 1 and then eases to `to` over the last `n` bars of each `period` (a ritardando at the end of every phrase) */
export function easeOut(bars: number, period: number, n: number, to: number, from = 0, upTo = bars): number[] {
  return Array.from({ length: bars }, (_, i) => {
    if (i < from || i >= upTo) return 1;
    const k = (i - from) % period;
    const j = k - (period - n);
    return j < 0 ? 1 : Math.round((1 - ((1 - to) * (j + 1)) / n) * 1000) / 1000;
  });
}
