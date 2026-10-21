/**
 * The leitmotifs of the story: composed ONCE here, as note data, and re-used and transformed by every piece of the score
 * (score.ts). Nothing here makes a sound.
 *
 *   MEECA'S LULLABY   "Slow the rain, slow the thunder, slow the thorn that holds you under." Eight bars, pentatonic, mostly
 *                     stepwise: three rising steps ("slow the rain / slow the thunder / slow the thorn", each a third higher than
 *                     the one before and each ending on a held note), then the fall home ("that holds you under").
 *                     Written once as pitches and then three ways of counting it (LULLABY_RHYTHMS below).
 *   THE GENERAL       the Iron March is NOT a new tune: it is the lullaby with its lights put out. The same eight bars, the same
 *                     scale degrees, but in the minor (the third and the sixth drop a semitone), counted square, played slowly,
 *                     on iron. He is Meeca's grandfather and it was his wife's song; he has been humming it without knowing.
 *                     `lullaby('sq', 'minor')` IS the march's tune.
 *   POKEY             "Slow and Steady" (tunes.ts), a gentle plodding walk
 *   GRANDMA           "slow is not stopped": four rising notes and a leading tone that waits, then resolves late
 *   THE HEARTBLOOM    grows from a bare two-note seed (a bud) to the full chord (see BLOOM_STAGES)
 *   DOT               the hummingbird courier: a fast flutter and a flick
 *
 * Melodies are written in the engine's melody notation (theory.ts parseMelodyBar): scale degrees, `'` octave up, `,` octave down,
 * `b`/`#` a semitone, `:n` length in sixteenths, `@n` dynamics.
 */
import { IRON_CLAW, SLOMATT_A } from './tunes.ts';

// ───────────────────────────────────────────── notation tools ─────────────────────────────────────────────

export interface Tok {
  rest: boolean;
  acc: '' | 'b' | '#';
  /** scale degree 1..7 */
  deg: number;
  /** octaves up (negative = down) */
  oct: number;
  len: number;
  /** dynamics mark 1..9 */
  mark?: number;
}

export function parseBar(src: string): Tok[] {
  return src
    .trim()
    .split(/\s+/)
    .map((t) => {
      const m = /^(?:(r)|([b#]?)([1-7])('*|,*))(?::(\d+))?(?:@([1-9]))?$/.exec(t);
      if (!m) throw new Error(`bad melody token '${t}'`);
      const oct = m[4] ? (m[4].startsWith("'") ? m[4].length : -m[4].length) : 0;
      return { rest: !!m[1], acc: (m[2] ?? '') as Tok['acc'], deg: m[3] ? Number(m[3]) : 0, oct, len: m[5] ? Number(m[5]) : 2, mark: m[6] ? Number(m[6]) : undefined };
    });
}

export function fmtTok(t: Tok): string {
  if (t.rest) return `r:${t.len}`;
  const o = t.oct > 0 ? "'".repeat(t.oct) : t.oct < 0 ? ','.repeat(-t.oct) : '';
  return `${t.acc}${t.deg}${o}:${t.len}${t.mark ? '@' + t.mark : ''}`;
}

export const fmtBar = (toks: Tok[]) => toks.map(fmtTok).join(' ');

/** change every note of a bar (return null to turn a note into a rest) */
export function mapBar(src: string, f: (t: Tok, i: number) => Tok | null): string {
  return fmtBar(parseBar(src).map((t, i) => (t.rest ? t : f(t, i) ?? { ...t, rest: true, acc: '', deg: 0, oct: 0, mark: undefined })));
}

export const mapBars = (bars: string[], f: (t: Tok, i: number, bar: number) => Tok | null) => bars.map((b, k) => mapBar(b, (t, i) => f(t, i, k)));

/** the whole bar moved by octaves */
export const octave = (bars: string[], n: number) => mapBars(bars, (t) => ({ ...t, oct: t.oct + n }));

/** moved up or down the scale by `steps` scale steps (accidentals stay with the note) */
export function stepBy(bars: string[], steps: number): string[] {
  return mapBars(bars, (t) => {
    const idx = t.deg - 1 + steps;
    return { ...t, deg: (((idx % 7) + 7) % 7) + 1, oct: t.oct + Math.floor(idx / 7) };
  });
}

/** the bar with its length scaled and snapped, keeping the total */
export const restBar = (steps: number) => `r:${steps}`;
export const restBars = (n: number, steps: number) => Array.from({ length: n }, () => restBar(steps));

/** a bar's total length in sixteenths */
export const barLen = (bar: string) => parseBar(bar).reduce((n, t) => n + t.len, 0);

/** loudness shaped over a phrase: `levels[k]` is the dynamics mark (1..9) of bar k; the downbeat leans in a little, the quick notes sit back */
export function dyn(bars: string[], levels: number[]): string[] {
  return mapBars(bars, (t, i, k) => {
    const base = levels[k % levels.length];
    const lean = i === 0 ? 1 : 0;
    const quick = t.len <= 2 ? -1 : 0;
    return { ...t, mark: Math.max(1, Math.min(9, base + lean + quick)) };
  });
}

// ───────────────────────────────────────────── Meeca's lullaby ─────────────────────────────────────────────

/** how the lullaby is counted */
export type Counting = '68' | '44' | 'sq';

/**
 * Each bar: [degree token, length counted in 6/8 (a bar is 12 sixteenths), length in the broad 4/4 (16), length in the square 4/4 (16)].
 *   '68'  the song itself, rocking: a dotted-quarter, an eighth and a quarter ("SLOW the RAIN")
 *   '44'  the same tune broadened to common time, for the biggest moments (the finale)
 *   'sq'  the same, counted square: every note starts on a beat, the lilt is gone (this is the General's march)
 */
const LULLABY_NOTES: Array<Array<[string, number, number, number]>> = [
  [['1', 4, 6, 4], ['2', 2, 2, 4], ['3', 6, 8, 8]], //   Slow the rain
  [['3', 8, 10, 8], ['2', 4, 6, 8]], //                  (rain)
  [['3', 4, 6, 4], ['5', 2, 2, 4], ['6', 6, 8, 8]], //   slow the thun-
  [['5', 8, 10, 8], ['7', 4, 6, 8]], //                  -der
  [['6', 4, 6, 4], ["1'", 2, 2, 4], ["2'", 6, 8, 8]], // slow the thorn
  [["2'", 6, 8, 8], ["1'", 4, 6, 4], ['6', 2, 2, 4]], // that
  [['5', 6, 6, 4], ['5', 2, 2, 4], ['2', 4, 8, 8]], //   holds you un-
  [['1', 12, 16, 16]], //                                -der
];

/** the chords under the tune, one per bar */
export const LULLABY_CHORDS = {
  /** the song: D major */
  major: ['D', 'D', 'Bm', 'A', 'G', 'Em', 'A', 'D'],
  /** the march: D minor (the same bars, the same bass notes moving the same way) */
  minor: ['Dm', 'Dm', 'Bb', 'A', 'Gm', 'Em7b5', 'A', 'Dm'],
  /** the grief: the very same notes (they are B minor's pentatonic scale) under the relative minor's chords */
  lament: ['Bm', 'F#m7', 'Bm', 'F#m', 'Em', 'Em7', 'F#m7', 'Bm'],
} as const;

/** the lullaby's degrees 3 and 6 fall a semitone in the minor; the 7th stays raised, because it leads home (harmonic minor) */
export const MINOR_FLATS = new Set([3, 6]);

/**
 * The lullaby as eight bars of melody notation.
 *   counting  '68' | '44' | 'sq'
 *   scale     which scale the piece declares: 'major' (the degrees as they are) or 'harmonicMinor' (the minor, whose 3rd and 6th are already flat)
 *   mode      which mode to sound in that piece: 'major' or 'minor' (accidentals are added where the declared scale differs)
 */
export function lullaby(counting: Counting = '68', o: { scale?: 'major' | 'harmonicMinor'; mode?: 'major' | 'minor' } = {}): string[] {
  const scale = o.scale ?? 'major';
  const mode = o.mode ?? (scale === 'major' ? 'major' : 'minor');
  const col = counting === '68' ? 1 : counting === '44' ? 2 : 3;
  return LULLABY_NOTES.map((bar) =>
    bar
      .map((n) => {
        const t = parseBar(`${n[0]}:${n[col]}`)[0];
        if (scale === 'major' && mode === 'minor' && MINOR_FLATS.has(t.deg)) t.acc = 'b';
        if (scale === 'harmonicMinor' && mode === 'major' && MINOR_FLATS.has(t.deg)) t.acc = '#';
        return fmtTok(t);
      })
      .join(' ')
  );
}

/** the lullaby's bars as a list of [onset in beats-of-this-piece, degree, accidental] for tests: pitches independent of counting */
export function lullabyDegrees(): number[] {
  return LULLABY_NOTES.flatMap((b) => b.map((n) => parseBar(n[0])[0].deg + 7 * parseBar(n[0])[0].oct));
}

/** a short rocking figure from the song's opening, for tags and echoes: "slow the rain" and back */
export const LULLABY_ECHO = ['1:4@4 2:2@3 3:6@4', '3:6@3 2:2@2 1:4@2'];

// ───────────────────────────────────────────── Iron-Claw's creeping figure ─────────────────────────────────────────────

/** the creeping low figure of the existing boss music (a flat second leaning on the tonic), used as the march's bass and as dread's heartbeat */
export const IRON_FIGURE = IRON_CLAW.slice(0, 2);

// ───────────────────────────────────────────── Pokey ─────────────────────────────────────────────

/** "Slow and Steady": eight bars, scale degrees (works in major for joy, minor for longing) */
export const POKEY = SLOMATT_A;

/**
 * Pokey, hurried and hunted: the same tune cut short and run on, for the chase. Each phrase keeps its first three notes and breaks off,
 * so it sounds like Pokey's tune with no time to finish it.
 */
export const POKEY_BREATHLESS = [
  '5:2 5:2 6:2 5:2 3:2 r:6',
  '2:2 3:2 2:2 1:2 7,:2 r:6',
  "3:2 3:2 5:2 3:2 1':2 r:6",
  '6:2 5:2 4:2 3:2 4:2 r:6',
];

// ───────────────────────────────────────────── Grandma ─────────────────────────────────────────────

/**
 * "slow is not stopped": the notes climb, one a beat (SLOW is NOT stopped), the leading tone is held and hangs, and the tonic arrives late.
 * Two bars of 4/4; degrees relative to the tonic of whatever it is played in.
 */
export const GRANDMA = ['1:4@6 2:2@5 3:4@7 5:6@8', "7:10@7 r:2 1':4@8"];

// ───────────────────────────────────────────── Dot ─────────────────────────────────────────────

/** the hummingbird: eight quick wing-beats between two notes, a flick up, a breath and a landing (one bar of 4/4) */
export const DOT = ["5':1 3':1 5':1 3':1 5':1 3':1 5':1 3':1 1'':2 r:2 5':4"];
/** a second figure for Dot: a quick scale that goes up and runs out of puff */
export const DOT_RUN = ["1':1 2':1 3':1 5':1 6':1 5':1 3':1 2':1 1':4 r:4"];

// ───────────────────────────────────────────── the Heartbloom ─────────────────────────────────────────────

/**
 * How the Heartbloom grows with the music's intensity. Each stage is the notes (chord-tone numbers of a Dadd9: 0 root, 1 third, 2 fifth,
 * 3 the ninth) that are added to what the stage before already plays, and the intensity at which they arrive.
 *   bud       the bare seed: a root and a fifth, nothing to say whether it is happy or sad
 *   sprout    the ninth joins: still no third
 *   bloom     the third: it is a major chord, it is open
 *   epic      the top of the chord an octave up, glowing
 *   ultimate  everything, and a choir
 */
export const BLOOM_STAGES = [
  { name: 'bud', tones: [0, 2], from: 0 },
  { name: 'sprout', tones: [3], from: 0.25 },
  { name: 'bloom', tones: [1], from: 0.45 },
  { name: 'epic', tones: [4, 5], from: 0.65 },
  { name: 'ultimate', tones: [6, 7], from: 0.85 },
] as const;
