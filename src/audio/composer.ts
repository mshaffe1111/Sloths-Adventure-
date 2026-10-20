/**
 * The composer: writes music instead of storing it.
 *
 *   composeStage(world, seed)  a new tune for a stage, always in that world's style: its mode, tempo, instruments
 *                              and groove, but a different key, chord progression, melody and arrangement for every
 *                              seed. The same seed always gives the same piece.
 *   composeStory(kind)         the long, dramatic scores for the cutscenes. They are composed from fixed seeds, so
 *                              they are the same every time, but they are built by the same machinery.
 *
 * The output is an ordinary Theme (see music.ts), so the player, the intensity layers and the arrangement passes
 * all work on it unchanged. Nothing here touches audio, so it is all testable without a sound card.
 *
 * How a tune is made (each step is a rule a human composer would follow):
 *   1. harmony   a 16-bar form: an 8-bar A section that closes on the tonic, an 8-bar B that ends on the dominant so
 *                the loop turns over. Chords come from the mode's own scale, so every chord is in key.
 *   2. melody    a motif is stated, answered by a sequence of itself, contrasted, and closed with a half cadence;
 *                the second phrase repeats the idea and closes on the tonic. B climbs to the tune's highest note,
 *                falls away, brings the motif back and ends on the supertonic over the dominant. Strong beats land
 *                on chord tones, leaps are limited, long notes close phrases.
 *   3. arrangement  pads, bass, arpeggios, a countermelody and drums from the world's palette, layered in by intensity.
 */
import { SCALES, hashStr, rng } from './theory.ts';
import type { ChordTrack, DrumName, DrumTrack, MelodyTrack, PatternTrack, Theme, Track } from './music.ts';
import { IRON_CLAW, SLOMATT_A } from './tunes.ts';
import { orchestrate, PACE_CODE, paceFromCode, type Pace } from './orchestrate.ts';

type R = () => number;
type Mode = keyof typeof SCALES;
type Inst = string;

const pick = <T>(r: R, a: readonly T[]): T => a[Math.min(a.length - 1, Math.floor(r() * a.length))];
const mod7 = (n: number) => ((n % 7) + 7) % 7;
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// ───────────────────────────────────────────── harmony ─────────────────────────────────────────────

const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const MODE_OFFSET: Record<string, number> = { major: 0, dorian: 2, phrygian: 4, lydian: 5, mixolydian: 7, minor: 9, harmonicMinor: 9 };
const FLAT_PARENTS = new Set([5, 10, 3, 8, 1, 6]); // F Bb Eb Ab Db Gb major
const MINORISH = new Set<string>(['minor', 'dorian', 'phrygian', 'harmonicMinor']);

/** key signatures with flats spell their chords with flats */
const usesFlats = (tonicPc: number, mode: Mode) => FLAT_PARENTS.has((tonicPc - (MODE_OFFSET[mode] ?? 0) + 12) % 12);
const noteName = (pc: number, flats: boolean) => (flats ? FLAT : SHARP)[((pc % 12) + 12) % 12];

/** the chord on scale degree d (0..6) of a mode, built from the mode's own notes; `dom` forces a major dominant */
export function chordName(tonicPc: number, mode: Mode, d: number, o: { seventh?: boolean; dom?: boolean } = {}): string {
  const sc = SCALES[mode];
  const flats = usesFlats(tonicPc, mode);
  const at = (k: number) => sc[mod7(k)] + (k >= 7 ? 12 : 0);
  const rootS = at(d);
  let i3 = at(d + 2) - rootS;
  let i5 = at(d + 4) - rootS;
  let i7 = at(d + 6) - rootS;
  if (o.dom) {
    i3 = 4;
    i5 = 7;
    i7 = 10;
  }
  let q: string;
  if (i3 === 4 && i5 === 7) q = o.seventh ? (i7 === 11 ? 'maj7' : '7') : '';
  else if (i3 === 3 && i5 === 7) q = o.seventh ? 'm7' : 'm';
  else if (i3 === 3 && i5 === 6) q = o.seventh ? 'm7b5' : 'dim';
  else q = i3 === 3 ? 'm' : '';
  return noteName((tonicPc + rootS) % 12, flats) + q;
}

const MAJOR_P: number[][] = [[0, 4, 5, 3], [0, 5, 3, 4], [0, 3, 4, 3], [0, 2, 5, 3], [5, 3, 0, 4], [0, 4, 3, 4], [0, 5, 1, 4], [0, 3, 5, 4], [3, 0, 4, 5]];
const MINOR_P: number[][] = [[0, 5, 2, 6], [0, 3, 6, 2], [0, 6, 5, 6], [0, 5, 6, 0], [0, 2, 6, 3], [0, 3, 4, 0], [0, 6, 3, 6], [0, 5, 3, 6], [5, 6, 0, 0]];
const PHRYGIAN_P: number[][] = [[0, 1, 0, 6], [0, 1, 6, 0], [0, 6, 1, 0], [0, 1, 2, 6], [0, 5, 1, 0]];
const DORIAN_P: number[][] = [[0, 3, 0, 6], [0, 6, 3, 0], [0, 3, 6, 0], [0, 1, 3, 0], [0, 6, 0, 3]];
const LYDIAN_P: number[][] = [[0, 1, 0, 4], [0, 1, 4, 0], [0, 4, 1, 0], [0, 5, 1, 4], [0, 2, 1, 0]];
const MIXO_P: number[][] = [[0, 6, 3, 0], [0, 6, 0, 3], [0, 3, 6, 0], [0, 5, 6, 0]];

function progressionsFor(mode: Mode): number[][] {
  switch (mode) {
    case 'major': return MAJOR_P;
    case 'minor':
    case 'harmonicMinor': return MINOR_P;
    case 'phrygian': return PHRYGIAN_P;
    case 'dorian': return DORIAN_P;
    case 'lydian': return LYDIAN_P;
    default: return MIXO_P;
  }
}

/** the chord that leads back to the top of the loop */
const cadenceRoot = (mode: Mode) => (mode === 'phrygian' ? 6 : mode === 'mixolydian' ? 6 : 4);
const cadenceIsDom = (mode: Mode) => MINORISH.has(mode) && mode !== 'phrygian';

interface Harmony {
  roots: number[];
  names: string[];
  /** per bar: the chord is the raised-third dominant */
  doms: boolean[];
}

function harmony16(r: R, mode: Mode, tonicPc: number, o: { slow: boolean; seventh: number; hero: boolean }): Harmony {
  const lib = progressionsFor(mode);
  const p1 = pick(r, lib);
  let p2 = pick(r, lib);
  for (let i = 0; i < 6 && p2.join() === p1.join(); i++) p2 = pick(r, lib);
  const cad = cadenceRoot(mode);
  const pre = pick(r, MINORISH.has(mode) ? [3, 5, 1] : [3, 1, 5]);
  const roots: number[] = [];
  if (o.hero) {
    // a fixed 8-bar tune brings its own chords (I V vi IV I V IV V)
    roots.push(0, 4, 5, 3, 0, 4, 3, 4);
  } else if (o.slow) {
    roots.push(p1[0], p1[0], p1[1], p1[1], p1[2], p1[2], cad, 0);
  } else {
    roots.push(p1[0], p1[1], p1[2], p1[3], p1[0], p1[1], cad, 0);
  }
  if (o.slow) roots.push(p2[0], p2[0], p2[1], p2[1], p2[2], p2[2], pre, cad);
  else roots.push(p2[0], p2[1], p2[2], p2[3], p2[0], p2[1], pre, cad);
  // the raised-third dominant only where a chord really leads home: the last bars of a section
  const doms = roots.map((root, i) => cadenceIsDom(mode) && root === 4 && i % 8 >= 6);
  const names = roots.map((root, i) => chordName(tonicPc, mode, root, { seventh: r() < o.seventh, dom: doms[i] }));
  return { roots, names, doms };
}

/** 'C','C','G' -> ['C*2','G'] */
function mergeChords(names: string[]): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < names.length) {
    let j = i;
    while (j + 1 < names.length && names[j + 1] === names[i]) j++;
    const n = j - i + 1;
    out.push(n > 1 ? `${names[i]}*${n}` : names[i]);
    i = j + 1;
  }
  return out;
}

// ───────────────────────────────────────────── melody ─────────────────────────────────────────────

interface MelCtx {
  r: R;
  steps: 12 | 16;
  /** the lowest and highest scale-degree index the tune may use (0 = tonic in the tonic's octave, 7 = an octave up) */
  lo: number;
  hi: number;
  dens: 'sparse' | 'normal' | 'busy';
}

interface NoteN {
  /** scale-degree index, or null for a rest */
  n: number | null;
  len: number;
}
interface BarN {
  notes: NoteN[];
  end: number;
  deltas: number[];
}

const RHYTHM16: Record<MelCtx['dens'], number[][]> = {
  sparse: [[8, 8], [6, 2, 8], [4, 4, 8], [6, 2, 4, 4], [8, 4, 4], [4, 4, 4, 4], [6, 2, 4, -4], [4, 4, 4, -4]],
  normal: [[4, 4, 4, 4], [2, 2, 4, 2, 2, 4], [3, 1, 4, 2, 2, 4], [2, 2, 2, 2, 4, 4], [6, 2, 4, 4], [4, 2, 2, 8], [2, 2, 4, 4, 4], [3, 1, 2, 2, 4, 4], [4, 4, 2, 2, 4], [6, 2, -2, 2, 4]],
  busy: [[2, 2, 2, 2, 4, 4], [2, 2, 2, 2, 2, 2, 2, 2], [3, 1, 2, 2, 2, 2, 4], [2, 2, 4, 2, 2, 2, 2], [4, 2, 2, 2, 2, 4], [2, 2, 2, 2, 2, 2, 4]],
};
const RHYTHM12: Record<MelCtx['dens'], number[][]> = {
  sparse: [[6, 6], [8, 4], [12], [6, 4, 2]],
  normal: [[4, 4, 4], [6, 2, 4], [2, 2, 4, 4], [4, 2, 2, 4], [8, 4], [6, 6], [3, 1, 4, 4], [4, 4, 2, 2]],
  busy: [[2, 2, 2, 2, 4], [2, 2, 2, 2, 2, 2], [4, 2, 2, 2, 2]],
};
const CADENCE16 = [[4, 4, 8], [2, 2, 4, 8], [4, 2, 2, 8], [6, 2, 8]];
const CADENCE12 = [[4, 8], [6, 6], [4, 2, 6]];

const ctOf = (root: number) => [mod7(root), mod7(root + 2), mod7(root + 4)];

function snap(c: MelCtx, n: number, root: number, want?: number[]): number {
  const set = want ?? ctOf(root);
  const up = c.r() < 0.5;
  for (let d = 0; d <= 8; d++) {
    for (const s of d === 0 ? [0] : up ? [1, -1] : [-1, 1]) {
      const m = n + s * d;
      if (m >= c.lo && m <= c.hi && set.includes(mod7(m))) return m;
    }
  }
  return clamp(n, c.lo, c.hi);
}

function randDelta(c: MelCtx, n: number): number {
  const centre = (c.lo + c.hi) / 2;
  const tbl: Array<[number, number]> = [[-1, 0.24], [1, 0.24], [-2, 0.13], [2, 0.13], [0, 0.07], [-3, 0.06], [3, 0.06], [-4, 0.03], [4, 0.03]];
  const w = tbl.map(([d, p]) => [d, p * (n > centre + 2 && d < 0 ? 2 : n < centre - 2 && d > 0 ? 2 : 1)] as [number, number]);
  const total = w.reduce((a, [, p]) => a + p, 0);
  let x = c.r() * total;
  for (const [d, p] of w) {
    x -= p;
    if (x <= 0) return d;
  }
  return 1;
}

const strong = (c: MelCtx, step: number) => step === 0 || (c.steps === 16 && step === 8);

function pickRhythm(c: MelCtx): number[] {
  const lib = (c.steps === 16 ? RHYTHM16 : RHYTHM12)[c.dens];
  return pick(c.r, lib);
}

/** one bar: a rhythm, a first note, then either a fresh random walk or the contour (`deltas`) of an earlier bar */
function buildBar(c: MelCtx, root: number, rhythm: number[], start: number, deltas: number[] | null, dom = false): BarN {
  // over a raised-third dominant the lowered seventh would grind against the chord's leading tone (as in cadenceBar)
  const tones = dom ? ctOf(root).filter((d) => d !== 6) : undefined;
  const notes: NoteN[] = [];
  const out: number[] = [];
  let step = 0;
  let n = snap(c, clamp(start, c.lo, c.hi), root, tones);
  let first = true;
  let di = 0;
  for (const raw of rhythm) {
    const len = Math.abs(raw);
    if (raw < 0) {
      notes.push({ n: null, len });
      step += len;
      continue;
    }
    if (first) {
      notes.push({ n, len });
      first = false;
    } else {
      let d = deltas && di < deltas.length ? deltas[di] : randDelta(c, n);
      di++;
      let m = clamp(n + d, c.lo, c.hi);
      if (strong(c, step) || (tones && len >= 3)) m = snap(c, m, root, tones);
      // no leap wider than a fifth between neighbours
      if (Math.abs(m - n) > 4) m = n + Math.sign(m - n) * 4;
      d = m - n;
      out.push(d);
      n = m;
      notes.push({ n, len });
    }
    step += len;
  }
  return { notes, end: n, deltas: out };
}

/** a closing bar: ends on a long chord tone reached by step, on `target` degrees if possible */
function cadenceBar(c: MelCtx, root: number, kind: 'half' | 'auth' | 'open', prevEnd: number, dom = false): BarN {
  const rhythm = pick(c.r, c.steps === 16 ? CADENCE16 : CADENCE12);
  let want = kind === 'auth' ? [0, 2, 4] : kind === 'half' ? [1, 4, 6, 2] : [1, 6, 4];
  // over a raised-third dominant the lowered seventh would grind against the chord's leading tone
  if (dom) want = want.filter((d) => d !== 6);
  const set = ctOf(root).filter((p) => want.includes(p));
  const last = snap(c, clamp(prevEnd + pick(c.r, [-2, -1, -1, 0, 1]), c.lo, c.hi), root, set.length ? set : ctOf(root));
  // written backwards: the last note is fixed and every earlier note steps toward where the previous bar ended
  const k = rhythm.length;
  const ns: number[] = new Array(k);
  ns[k - 1] = last;
  for (let i = k - 2; i >= 0; i--) {
    const toward = Math.sign(prevEnd - ns[i + 1]) || pick(c.r, [-1, 1]);
    ns[i] = clamp(ns[i + 1] + toward * pick(c.r, [1, 1, 2]), c.lo, c.hi);
  }
  const tones = dom ? ctOf(root).filter((d) => d !== 6) : undefined;
  // a held note over the raised-third dominant must not be the lowered seventh either
  if (tones) for (let i = 0; i < k - 1; i++) if (rhythm[i] >= 3) ns[i] = snap(c, ns[i], root, tones);
  const first = snap(c, ns[0], root, tones);
  if (Math.abs(first - (ns[1] ?? first)) <= 4) ns[0] = first;
  const notes: NoteN[] = rhythm.map((len, i) => ({ n: ns[i], len }));
  const out: number[] = [];
  for (let i = 1; i < k; i++) out.push(ns[i] - ns[i - 1]);
  return { notes, end: last, deltas: out };
}

/** the bar with the highest note of the tune: it arrives on a long note and then falls away by step */
function peakBar(c: MelCtx, root: number, prevEnd: number, atLeast?: number): BarN {
  const rhythm = c.steps === 16 ? pick(c.r, [[8, 4, 4], [6, 2, 4, 4], [8, 2, 2, 4]]) : pick(c.r, [[6, 4, 2], [8, 4], [6, 6]]);
  // the climb arrives at the top with a leap of at most a fifth
  let top = snap(c, Math.min(c.hi - 1, prevEnd + 5, Math.max(prevEnd + 4, atLeast ?? -99)), root);
  // snapping to a chord tone must not stretch the leap past a sixth
  if (top - prevEnd > 5) {
    for (let m = prevEnd + 5; m > prevEnd; m--) {
      if (m <= c.hi && ctOf(root).includes(mod7(m))) {
        top = m;
        break;
      }
    }
  }
  const notes: NoteN[] = [];
  let n = top;
  const out: number[] = [];
  rhythm.forEach((len, i) => {
    if (i > 0) {
      const m = clamp(n - pick(c.r, [1, 1, 2]), c.lo, c.hi);
      out.push(m - n);
      n = m;
    }
    notes.push({ n, len });
  });
  return { notes, end: n, deltas: out };
}

/** a falling bar: stepwise down, landing on a chord tone */
function fallBar(c: MelCtx, root: number, prevEnd: number): BarN {
  const rhythm = pickRhythm(c);
  const notes: NoteN[] = [];
  let n = snap(c, clamp(prevEnd - 1, c.lo, c.hi), root);
  const out: number[] = [];
  let step = 0;
  rhythm.forEach((raw, i) => {
    const len = Math.abs(raw);
    if (raw < 0) {
      notes.push({ n: null, len });
    } else {
      if (i > 0) {
        let m = clamp(n - pick(c.r, [1, 1, 1, 0, 2]), c.lo, c.hi);
        if (strong(c, step)) m = snap(c, m, root);
        out.push(m - n);
        n = m;
      }
      notes.push({ n, len });
    }
    step += len;
  });
  return { notes, end: n, deltas: out };
}

/** an 8-bar section A: state, answer by sequence, contrast, half cadence; repeat the idea; close on the tonic */
function sectionA(c: MelCtx, roots: number[], start: number, doms?: boolean[]): { bars: BarN[]; motif: BarN; top: number } {
  // A keeps below the top of the range, so the climax of B really is the high point
  c = { ...c, hi: Math.round(c.lo + (c.hi - c.lo) * 0.68) };
  const rA = pickRhythm(c);
  const rB = pickRhythm(c);
  const b0 = buildBar(c, roots[0], rA, start, null);
  const b1 = buildBar(c, roots[1], rA, b0.end + pick(c.r, [-2, -1, 1]), b0.deltas);
  const b2 = buildBar(c, roots[2], rB, b1.end + pick(c.r, [1, 2, -1]), null);
  const b3 = cadenceBar(c, roots[3], 'half', b2.end, doms?.[3]);
  const b4 = buildBar(c, roots[4], rA, clamp(start + pick(c.r, [0, 0, 1, 2]), b3.end - 4, b3.end + 4), b0.deltas);
  const b5 = buildBar(c, roots[5], rA, b4.end + pick(c.r, [-1, 1, 2]), b0.deltas);
  const b6 = buildBar(c, roots[6], pickRhythm(c), b5.end + pick(c.r, [-1, 1]), null, doms?.[6]);
  const b7 = cadenceBar(c, roots[7], 'auth', b6.end, doms?.[7]);
  const bars = [b0, b1, b2, b3, b4, b5, b6, b7];
  return { bars, motif: b0, top: Math.max(...bars.flatMap((b) => b.notes.map((x) => x.n ?? -99))) };
}

/** an 8-bar section B: climb by sequence, the peak, fall, the motif comes back, end open on the supertonic */
function sectionB(c: MelCtx, roots: number[], motif: BarN, startMid: number, doms?: boolean[], from?: { end: number; top: number }): BarN[] {
  const rC = pickRhythm(c);
  const b0 = buildBar(c, roots[0], rC, from ? clamp(startMid - 1, from.end - 4, from.end + 4) : startMid - 1, null);
  // climb at the pace needed to get above the A section's top by the peak
  const climb = from ? clamp(from.top - 2 - b0.end, 2, 4) : pick(c.r, [3, 2, 2]);
  const b1 = buildBar(c, roots[1], rC, b0.end + climb, b0.deltas);
  const b2 = peakBar(c, roots[2], b1.end, from ? from.top + 1 : undefined);
  const b3 = fallBar(c, roots[3], b2.end);
  const b4 = buildBar(c, roots[4], pickRhythm(c), clamp(startMid, b3.end - 4, b3.end + 4), motif.deltas);
  const b5 = buildBar(c, roots[5], pickRhythm(c), b4.end + pick(c.r, [-1, 1]), motif.deltas);
  const b6 = buildBar(c, roots[6], pickRhythm(c), b5.end + pick(c.r, [-2, -1, 1]), null, doms?.[6]);
  // the last bar leans back toward where the tune begins, so the loop turns over without a jump
  const b7 = cadenceBar(c, roots[7], 'open', Math.round((b6.end + startMid) / 2), doms?.[7]);
  return [b0, b1, b2, b3, b4, b5, b6, b7];
}

/** a 4-bar tag: climb, peak, fall, close (used by the story's climaxes) */
function sectionC(c: MelCtx, roots: number[], startMid: number, close: 'auth' | 'open', doms?: boolean[]): BarN[] {
  const rC = pickRhythm(c);
  const b0 = buildBar(c, roots[0], rC, startMid, null);
  const b1 = peakBar(c, roots[1], b0.end);
  const b2 = fallBar(c, roots[2], b1.end);
  const b3 = cadenceBar(c, roots[3], close, b2.end, doms?.[3]);
  return [b0, b1, b2, b3];
}

function tok(n: number | null, len: number): string {
  if (n === null) return `r:${len}`;
  const o = Math.floor(n / 7);
  return `${mod7(n) + 1}${o > 0 ? "'".repeat(o) : o < 0 ? ','.repeat(-o) : ''}:${len}`;
}
const barStr = (b: BarN) => b.notes.map((x) => tok(x.n, x.len)).join(' ');
const restBar = (steps: number) => `r:${steps}`;

/** the degree-index range that keeps a tune between two MIDI notes whatever the key */
function degreeRange(tonic: number, scale: number[], loMidi: number, hiMidi: number): [number, number] {
  const midi = (n: number) => tonic + scale[mod7(n)] + 12 * Math.floor(n / 7);
  let lo = 99;
  let hi = -99;
  for (let n = -21; n <= 28; n++) {
    const m = midi(n);
    if (m >= loMidi && m <= hiMidi) {
      lo = Math.min(lo, n);
      hi = Math.max(hi, n);
    }
  }
  return [lo, hi];
}

// ───────────────────────────────────────────── the worlds' styles ─────────────────────────────────────────────

type Groove = 'bounce' | 'lazy' | 'drift' | 'drive' | 'march';

interface WorldCard {
  mode: Mode;
  tonics: string[];
  bpm: [number, number];
  swing?: number;
  swing8?: number;
  leads: Inst[];
  alts: Inst[];
  pads: Array<'pad' | 'strings' | 'choir'>;
  bass: Inst[];
  arps: Inst[];
  counters: Inst[];
  groove: Groove;
  dens: MelCtx['dens'];
  /** chance of a seventh on any chord */
  seventh: number;
  /** chance the A section is Pokey's theme */
  hero: number;
  /** longer chords (two bars each) */
  slow: number;
  lead: [number, number];
  delay: number;
}

const CARDS: Record<number, WorldCard> = {
  1: { mode: 'major', tonics: ['C', 'D', 'F', 'G'], bpm: [102, 116], leads: ['flute', 'marimba', 'pluck'], alts: ['marimba', 'bell'], pads: ['pad'], bass: ['bass'], arps: ['marimba', 'harp'], counters: ['marimba', 'bell'], groove: 'bounce', dens: 'normal', seventh: 0.1, hero: 0.35, slow: 0.1, lead: [64, 84], delay: 0.75 },
  2: { mode: 'major', tonics: ['G', 'D', 'A', 'C'], bpm: [94, 106], swing8: 0.18, leads: ['kalimba', 'pluck', 'flute'], alts: ['pluck', 'marimba'], pads: ['pad'], bass: ['bass'], arps: ['harp', 'kalimba'], counters: ['flute', 'bell'], groove: 'lazy', dens: 'normal', seventh: 0.15, hero: 0.25, slow: 0.15, lead: [64, 86], delay: 0.75 },
  3: { mode: 'minor', tonics: ['A', 'E', 'D', 'B'], bpm: [76, 90], leads: ['bell', 'kalimba', 'softLead'], alts: ['kalimba', 'bell'], pads: ['strings'], bass: ['subBass'], arps: ['kalimba', 'harp'], counters: ['bell', 'flute'], groove: 'drift', dens: 'sparse', seventh: 0.3, hero: 0, slow: 0.55, lead: [67, 90], delay: 0.75 },
  4: { mode: 'lydian', tonics: ['F', 'C', 'G', 'Bb'], bpm: [90, 102], leads: ['bell', 'harp', 'flute'], alts: ['harp', 'bell'], pads: ['strings'], bass: ['bass', 'subBass'], arps: ['harp', 'bell'], counters: ['flute', 'kalimba'], groove: 'drift', dens: 'sparse', seventh: 0.35, hero: 0.1, slow: 0.4, lead: [69, 92], delay: 0.75 },
  5: { mode: 'major', tonics: ['A', 'E', 'D', 'G'], bpm: [112, 124], swing8: 0.22, leads: ['steelpan', 'kalimba', 'marimba'], alts: ['kalimba', 'steelpan'], pads: ['pad'], bass: ['bass'], arps: ['marimba', 'pluck'], counters: ['steelpan', 'bell'], groove: 'bounce', dens: 'busy', seventh: 0.1, hero: 0.3, slow: 0, lead: [66, 90], delay: 0.75 },
  6: { mode: 'dorian', tonics: ['D', 'G', 'A', 'E'], bpm: [86, 98], swing: 0.28, leads: ['pluck', 'marimba', 'flute'], alts: ['marimba', 'pluck'], pads: ['strings'], bass: ['bass'], arps: ['marimba', 'kalimba'], counters: ['flute', 'bell'], groove: 'lazy', dens: 'normal', seventh: 0.25, hero: 0.1, slow: 0.2, lead: [62, 84], delay: 0.75 },
  7: { mode: 'phrygian', tonics: ['E', 'A', 'D', 'B'], bpm: [82, 94], leads: ['brass', 'softLead', 'flute'], alts: ['softLead', 'brass'], pads: ['choir', 'strings'], bass: ['subBass'], arps: ['kalimba', 'pluck'], counters: ['bell', 'flute'], groove: 'march', dens: 'sparse', seventh: 0.1, hero: 0, slow: 0.5, lead: [60, 82], delay: 0.75 },
  8: { mode: 'lydian', tonics: ['D', 'A', 'G', 'E'], bpm: [74, 86], leads: ['softLead', 'bell', 'flute'], alts: ['bell', 'softLead'], pads: ['strings'], bass: ['subBass'], arps: ['kalimba', 'harp'], counters: ['bell', 'kalimba'], groove: 'drift', dens: 'sparse', seventh: 0.35, hero: 0.1, slow: 0.5, lead: [66, 88], delay: 0.75 },
  9: { mode: 'phrygian', tonics: ['D', 'A', 'G', 'E'], bpm: [122, 134], leads: ['brass', 'softLead', 'pluck'], alts: ['softLead', 'brass'], pads: ['strings'], bass: ['synthBass'], arps: ['pluck', 'brass'], counters: ['brass', 'bell'], groove: 'drive', dens: 'busy', seventh: 0.05, hero: 0, slow: 0, lead: [60, 82], delay: 0.5 },
  10: { mode: 'minor', tonics: ['C', 'G', 'F', 'D'], bpm: [114, 126], leads: ['brass', 'softLead'], alts: ['softLead', 'brass'], pads: ['strings', 'choir'], bass: ['synthBass'], arps: ['pluck', 'brass'], counters: ['bell', 'brass'], groove: 'drive', dens: 'normal', seventh: 0.1, hero: 0, slow: 0.1, lead: [55, 79], delay: 0.5 },
};

const PC: Record<string, number> = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

// ───────────────────────────────────────────── grooves ─────────────────────────────────────────────

interface DrumSpec {
  voice: DrumName;
  pats: string[];
  gain: number;
  gate?: [number, number];
  fill?: string;
  pan?: number;
}
const FILL = 'x... x... x.x. xxxx';
const GROOVES: Record<Groove, DrumSpec[]> = {
  bounce: [
    { voice: 'softKick', pats: ['x... .... x... ....', 'x... .... x... ..x.', 'x... ..x. x... ....', 'x... .... x.x. ....'], gain: 0.7, gate: [0.15, 0.4] },
    { voice: 'shaker', pats: ['.x.x .x.x .x.x .x.x', 'x.x. x.x. x.x. x.x.', '.xox .xox .xox .xox'], gain: 0.55, gate: [0, 0.2] },
    { voice: 'hat', pats: ['x.x. x.x. x.x. x.xo', '..x. ..x. ..x. ..x.', 'x.xo x.xo x.xo x.xo'], gain: 0.35, gate: [0.55, 0.85] },
    { voice: 'congaHi', pats: ['.... x... .... x.x.', '..x. .... ..x. ..x.'], gain: 0.5, gate: [0.3, 0.55] },
    { voice: 'congaLo', pats: ['..x. .... ..x. ....', 'x... ..x. .... ..x.'], gain: 0.5, gate: [0.3, 0.55] },
    { voice: 'rim', pats: ['.... x... .... x...'], gain: 0.55, gate: [0.5, 0.8], fill: FILL },
  ],
  lazy: [
    { voice: 'softKick', pats: ['x... .... ..x. ....', 'x... ..x. .... ....', 'x... .... x... ....'], gain: 0.65, gate: [0.1, 0.4] },
    { voice: 'brush', pats: ['.... x... .... x...', '..x. x... ..x. x...'], gain: 0.5, gate: [0.2, 0.6] },
    { voice: 'shaker', pats: ['x.x. x.x. x.x. x.x.', '.x.x .x.x .x.x .x.x'], gain: 0.5, gate: [0, 0.25] },
    { voice: 'woodblock', pats: ['.... .... x... ....', '..x. .... .... ..x.'], gain: 0.45, gate: [0.3, 0.6] },
    { voice: 'clave', pats: ['x..x ..x. ..x. x...'], gain: 0.4, gate: [0.45, 0.8] },
  ],
  drift: [
    { voice: 'softKick', pats: ['x... .... .... ....', 'x... .... ..x. ....'], gain: 0.55, gate: [0.2, 0.5] },
    { voice: 'shaker', pats: ['.... .x.. .... .x..', '..x. .... ..x. ....'], gain: 0.45, gate: [0, 0.35] },
    { voice: 'woodblock', pats: ['.... .... ..x. ....', '.... ..x. .... ....'], gain: 0.4, gate: [0.35, 0.7] },
    { voice: 'timpani', pats: ['X... .... .... ....'], gain: 0.4, gate: [0.6, 0.9] },
  ],
  drive: [
    { voice: 'kick', pats: ['x... x... x... x...', 'x..x ..x. x..x ..x.', 'x... x... x..x ..x.'], gain: 0.7, gate: [0.15, 0.4] },
    { voice: 'snare', pats: ['.... x... .... x...'], gain: 0.55, gate: [0.35, 0.7], fill: FILL },
    { voice: 'hat', pats: ['x.x. x.x. x.x. x.x.', 'xxxx xxxx xxxx xxxx'], gain: 0.3, gate: [0.5, 0.9] },
    { voice: 'taiko', pats: ['x... .... ..x. ....', 'x... .... x... ....'], gain: 0.6, gate: [0.45, 0.9] },
    { voice: 'tom', pats: ['.... .... .... ..xx'], gain: 0.4, gate: [0.6, 1] },
  ],
  march: [
    { voice: 'taiko', pats: ['x... .... x... ..x.', 'X... .... .... X...'], gain: 0.6, gate: [0, 0.4] },
    { voice: 'tom', pats: ['.... x... .... x...', '.... ..x. .... ..x.'], gain: 0.45, gate: [0.3, 0.6] },
    { voice: 'woodblock', pats: ['x.x. x.x. x.x. x.x.'], gain: 0.35, gate: [0.5, 0.9] },
    { voice: 'timpani', pats: ['X... .... .... ....'], gain: 0.45, gate: [0.4, 0.8] },
  ],
};
const BASS_POOLS: Record<Groove, string[]> = {
  bounce: ['R... ..r. ..f. r...', 'R... ..r. R... ..f.', 'R.-. ..r. ..f. r.-.'],
  lazy: ['R... ..r. ..f. r...', 'R..r ..R. .r.. f.r.'],
  drift: ['R--- ---- ---- ----', 'R--- ---. ..f. ....', 'R--- ---- r--- ----'],
  drive: ['R.R. R.r. R.R. f.r.', 'R.R. R.r. R.rR .f.r', 'R... R... R.r. f.r.'],
  march: ['R--- ---- ---. ....', 'R--- ---- r--- ....'],
};
const ARP_POOLS: Record<Groove, string[]> = {
  bounce: ['r.t.f.t. r.t.f.t.', 'r.t.f.o.f.t.f.t.'],
  lazy: ['r.t.f.t. r.t.f.t.', 'r.t.f.s.f.t.r.t.'],
  drift: ['r... t... f... t...', 'r... f... t... s...', '.... .... t... ....'],
  drive: ['r.t. f.t. r.t. f.t.', 't.f. r.f. t.f. r.s.'],
  march: ['r... .... t... ....', 'r... t... f... t...'],
};

const drumTracks = (r: R, groove: Groove): DrumTrack[] =>
  GROOVES[groove].map((d, i) => {
    // each stage keeps a different subset and ordering of the grooves' patterns
    const first = pick(r, d.pats);
    const second = pick(r, d.pats);
    const pats = first === second ? [first] : [first, second];
    return { kind: 'drums', name: `${d.voice}${i}`, voice: d.voice, pats, gain: d.gain, gate: d.gate, fill: d.fill, pan: d.pan } as DrumTrack;
  });

// ───────────────────────────────────────────── a stage ─────────────────────────────────────────────

export interface Composed {
  theme: Theme;
  /** what was chosen, for the debug overlay and for tests */
  info: { key: string; mode: string; bpm: number; lead: string; groove: Groove; hero: boolean; progression: string[] };
}

export function composeStageFull(world: number, seed: number, pace?: Pace): Composed {
  const w = clamp(Math.floor(world) || 1, 1, 10);
  const card = CARDS[w];
  const r = rng((hashStr(`stage${w}`) ^ Math.imul(seed >>> 0, 2654435761)) >>> 0);
  const tonicName = pick(r, card.tonics);
  const tonicPc = PC[tonicName];
  const mode = card.mode;
  const scale = SCALES[mode];
  const flats = usesFlats(tonicPc, mode);
  const tonicStr = `${noteName(tonicPc, flats)}${tonicPc >= 10 ? 3 : 4}`;
  const tonicMidi = (tonicPc >= 10 ? 48 : 60) + tonicPc;
  const bpm = Math.round(card.bpm[0] + r() * (card.bpm[1] - card.bpm[0]));
  const hero = card.hero > 0 && r() < card.hero && mode === 'major';
  const slow = !hero && r() < card.slow;
  const h = harmony16(r, mode, tonicPc, { slow, seventh: card.seventh, hero });

  // the melody: A section, B section, composed to the chords
  const [lo, hi] = degreeRange(tonicMidi, scale, card.lead[0], card.lead[1]);
  const c: MelCtx = { r, steps: 16, lo, hi, dens: card.dens };
  const mid = Math.round(lo + (hi - lo) * 0.45);
  let barsA: string[];
  let motif: BarN;
  let from: { end: number; top: number };
  if (hero) {
    barsA = SLOMATT_A.slice();
    motif = buildBar(c, 0, [4, 4, 4, 4], mid, null);
    from = { end: 7, top: 8 }; // the tune ends on the high tonic and touches the second above it
  } else {
    const a = sectionA(c, h.roots.slice(0, 8), mid + pick(r, [-1, 0, 1]), h.doms.slice(0, 8));
    barsA = a.bars.map(barStr);
    motif = a.motif;
    from = { end: a.bars[7].end, top: a.top };
  }
  const b = sectionB(c, h.roots.slice(8, 16), motif, mid, h.doms.slice(8, 16), from);
  const bars = [...barsA, ...b.map(barStr)];

  const lead = pick(r, card.leads);
  const alt = pick(r, card.alts.filter((x) => x !== lead).concat(card.alts));
  const padInst = pick(r, card.pads);
  const bassInst = pick(r, card.bass);
  const groove = card.groove;
  const padLo = padInst === 'choir' ? 55 : padInst === 'strings' ? 45 : 50;
  const padHi = padInst === 'choir' ? 74 : padInst === 'strings' ? 69 : 70;

  const tracks: Track[] = [];
  tracks.push({ kind: 'chords', name: 'pad', inst: padInst, lo: padLo, hi: padHi, voices: 4, gain: padInst === 'pad' ? 0.34 : 0.3, rev: 0.45 } as ChordTrack);
  tracks.push({ kind: 'pattern', name: 'bass', inst: bassInst, oct: bassInst === 'bass' ? 36 : 33, pats: [pick(r, BASS_POOLS[groove]), pick(r, BASS_POOLS[groove])], gain: 0.52, rev: 0.05 } as PatternTrack);
  tracks.push({ kind: 'melody', name: 'lead', inst: lead, altInst: alt, bars, gain: lead === 'brass' ? 0.5 : 0.64, rev: 0.32, dly: 0.16 } as MelodyTrack);
  const arpInst = pick(r, card.arps);
  tracks.push({ kind: 'pattern', name: 'arp', lite: true, inst: arpInst, oct: 58, pats: [pick(r, ARP_POOLS[groove]), pick(r, ARP_POOLS[groove])], gain: 0.38, rev: 0.3, dly: 0.14, pan: pick(r, [-0.25, 0.25]), gate: [0.1, 0.45] } as PatternTrack);
  const counterInst = pick(r, card.counters);
  tracks.push({
    kind: 'melody', name: 'counter', lite: true, inst: counterInst,
    bars: Array.from({ length: 16 }, () => null), gen: { lo: tonicMidi + 7, hi: tonicMidi + 19, density: 0.3 },
    gain: 0.4, rev: 0.5, dly: 0.22, pan: pick(r, [-0.3, 0.3]), gate: [0.4, 0.8],
  } as MelodyTrack);
  tracks.push(...drumTracks(r, groove));

  let theme: Theme = {
    id: `gen-${w}-${seed >>> 0}${pace ? '-' + PACE_CODE[pace] : ''}`,
    bpm,
    tonic: tonicStr,
    scale: mode,
    swing: card.swing,
    swing8: card.swing8,
    delay: card.delay,
    chords: mergeChords(h.names),
    tracks,
  };
  // the same tune, dressed in the orchestra for what the player is doing (the notes do not change with the pace)
  if (pace) theme = orchestrate(theme, { world: w, pace, seed });
  return { theme, info: { key: `${noteName(tonicPc, flats)} ${mode}`, mode, bpm, lead, groove, hero, progression: h.names } };
}

export const composeStage = (world: number, seed: number, pace?: Pace): Theme => composeStageFull(world, seed, pace).theme;

/** 'gen-7-12345' or 'gen-7-12345-r' (with a pace) -> a composed stage; anything else is not ours */
export function themeFromId(id: string): Theme | null {
  const m = /^gen-(\d{1,2})-(\d{1,10})(?:-([a-z]))?$/.exec(id);
  if (!m) return null;
  const pace = m[3] ? paceFromCode(m[3]) : undefined;
  if (m[3] && !pace) return null;
  return composeStage(Number(m[1]), Number(m[2]), pace ?? undefined);
}
export const stageThemeId = (world: number, seed: number, pace?: Pace) =>
  `gen-${clamp(Math.floor(world) || 1, 1, 10)}-${seed >>> 0}${pace ? '-' + PACE_CODE[pace] : ''}`;

// ───────────────────────────────────────────── the story scores ─────────────────────────────────────────────

export type StoryKind = 'jennifur' | 'dusk' | 'storm' | 'ending';

type Layer = 'strings' | 'choir' | 'pad' | 'harp' | 'bass' | 'leadA' | 'leadB' | 'bell' | 'counter' | 'timp' | 'taiko' | 'rise' | 'crash';

interface Section {
  name: string;
  bars: number;
  /** chord root degree for each bar */
  roots: number[];
  layers: Layer[];
  melody?: 'hero' | 'iron' | 'A' | 'B' | 'C' | 'Cclose' | 'none';
  lead?: 'leadA' | 'leadB';
}

interface StorySpec {
  id: string;
  seed: number;
  tonic: string;
  mode: Mode;
  bpm: number;
  steps: 12 | 16;
  delay: number;
  sections: Section[];
  leadA: Inst;
  leadB: Inst;
  counter: Inst;
  stringsLo: [number, number];
  /** longest note the leads may reach, as MIDI */
  lead: [number, number];
  seventh: number;
}

const rep = <T>(a: T[], n: number): T[] => Array.from({ length: n }, (_, i) => a[i % a.length]);

const STORY: Record<StoryKind, () => StorySpec> = {
  // Meeca's waltz: tender, then swelling, then the whole forest singing; 3/4, F major
  jennifur: () => ({
    id: 'jennifur', seed: 4417, tonic: 'F', mode: 'major', bpm: 62, steps: 12, delay: 0.75, leadA: 'flute', leadB: 'violins', counter: 'bell',
    stringsLo: [53, 72], lead: [65, 86], seventh: 0.3,
    sections: [
      { name: 'dawn', bars: 4, roots: [0, 5, 3, 4], layers: ['harp', 'pad'], melody: 'none' },
      { name: 'theme', bars: 8, roots: [0, 5, 3, 4, 0, 2, 3, 4], layers: ['strings', 'harp', 'leadA', 'bass'], melody: 'A', lead: 'leadA' },
      { name: 'theme again', bars: 8, roots: [0, 5, 3, 4, 0, 2, 3, 4], layers: ['strings', 'harp', 'leadB', 'bass', 'bell', 'choir'], melody: 'A', lead: 'leadB' },
      { name: 'bridge', bars: 8, roots: [5, 3, 0, 4, 5, 3, 1, 4], layers: ['strings', 'harp', 'leadA', 'counter', 'timp', 'choir'], melody: 'B', lead: 'leadA' },
      { name: 'swell', bars: 4, roots: [3, 4, 5, 4], layers: ['strings', 'choir', 'harp', 'leadB', 'bass', 'bell', 'timp', 'taiko', 'crash'], melody: 'C', lead: 'leadB' },
      { name: 'return', bars: 4, roots: [0, 5, 3, 4], layers: ['strings', 'harp', 'leadA', 'bell'], melody: 'Cclose', lead: 'leadA' },
      { name: 'rest', bars: 4, roots: [3, 0, 3, 4], layers: ['pad', 'harp'], melody: 'none' },
    ],
  }),
  // the vow: Pokey's own theme in A minor, slow and aching, growing into a prayer
  dusk: () => ({
    id: 'storyDusk', seed: 2093, tonic: 'A', mode: 'minor', bpm: 66, steps: 16, delay: 0.75, leadA: 'cello', leadB: 'flute', counter: 'bell',
    stringsLo: [45, 67], lead: [62, 84], seventh: 0.25,
    sections: [
      { name: 'hush', bars: 4, roots: [0, 0, 5, 4], layers: ['pad', 'harp', 'bass'], melody: 'none' },
      { name: 'theme', bars: 8, roots: [0, 4, 5, 3, 0, 4, 3, 4], layers: ['strings', 'harp', 'leadA', 'bass'], melody: 'hero', lead: 'leadA' },
      { name: 'theme again', bars: 8, roots: [0, 4, 5, 3, 0, 4, 3, 4], layers: ['strings', 'harp', 'leadB', 'bass', 'choir', 'bell'], melody: 'hero', lead: 'leadB' },
      { name: 'longing', bars: 8, roots: [5, 3, 0, 4, 5, 3, 1, 4], layers: ['strings', 'choir', 'harp', 'leadA', 'counter', 'timp', 'bass'], melody: 'B', lead: 'leadA' },
      { name: 'resolve', bars: 4, roots: [3, 4, 5, 4], layers: ['strings', 'choir', 'harp', 'leadB', 'bass', 'bell', 'timp', 'crash'], melody: 'C', lead: 'leadB' },
      { name: 'ebb', bars: 4, roots: [3, 5, 3, 4], layers: ['pad', 'harp'], melody: 'none' },
    ],
  }),
  // Iron-Claw: a low drone, a heartbeat, the creeping motif, then the whole storm
  storm: () => ({
    id: 'storyStorm', seed: 7731, tonic: 'C', mode: 'minor', bpm: 74, steps: 16, delay: 0.5, leadA: 'brass', leadB: 'brass', counter: 'bell',
    stringsLo: [36, 60], lead: [55, 79], seventh: 0.1,
    sections: [
      { name: 'drone', bars: 4, roots: [0, 0, 0, 0], layers: ['bass', 'timp', 'strings'], melody: 'none' },
      { name: 'motif', bars: 8, roots: [0, 0, 5, 6, 0, 0, 5, 6], layers: ['bass', 'timp', 'strings', 'leadA'], melody: 'iron', lead: 'leadA' },
      { name: 'gathering', bars: 8, roots: [0, 5, 6, 0, 3, 5, 6, 4], layers: ['bass', 'timp', 'strings', 'choir', 'leadA', 'taiko'], melody: 'iron', lead: 'leadA' },
      { name: 'storm', bars: 8, roots: [5, 6, 0, 0, 5, 6, 3, 4], layers: ['bass', 'timp', 'taiko', 'strings', 'choir', 'leadB', 'counter', 'rise', 'crash'], melody: 'B', lead: 'leadB' },
      { name: 'after', bars: 4, roots: [0, 5, 6, 0], layers: ['strings', 'bass', 'timp'], melody: 'none' },
    ],
  }),
  // the ending: the hero's theme comes home, then Meeca's, and everything sings
  ending: () => ({
    id: 'ending', seed: 1268, tonic: 'F', mode: 'major', bpm: 84, steps: 16, delay: 0.75, leadA: 'flute', leadB: 'violins', counter: 'bell',
    stringsLo: [53, 72], lead: [65, 88], seventh: 0.25,
    sections: [
      { name: 'dawn', bars: 4, roots: [0, 4, 5, 3], layers: ['harp', 'strings'], melody: 'none' },
      { name: 'theme', bars: 8, roots: [0, 4, 5, 3, 0, 4, 3, 4], layers: ['strings', 'harp', 'leadA', 'bass'], melody: 'hero', lead: 'leadA' },
      { name: 'theme again', bars: 8, roots: [0, 4, 5, 3, 0, 4, 3, 4], layers: ['strings', 'harp', 'leadB', 'bass', 'bell', 'choir'], melody: 'hero', lead: 'leadB' },
      { name: 'her theme', bars: 8, roots: [5, 3, 0, 4, 5, 3, 1, 4], layers: ['strings', 'harp', 'leadA', 'counter', 'choir', 'bass', 'timp'], melody: 'B', lead: 'leadA' },
      { name: 'together', bars: 8, roots: [0, 4, 5, 3, 0, 4, 3, 0], layers: ['strings', 'choir', 'harp', 'leadB', 'counter', 'bass', 'bell', 'timp', 'taiko', 'crash'], melody: 'hero', lead: 'leadB' },
      { name: 'glow', bars: 4, roots: [3, 0, 3, 0], layers: ['strings', 'harp', 'bell', 'choir'], melody: 'none' },
    ],
  }),
};

export function composeStory(kind: StoryKind): Theme {
  const spec = STORY[kind]();
  const r = rng(spec.seed);
  const mode = spec.mode;
  const scale = SCALES[mode];
  const tonicPc = PC[spec.tonic];
  const flats = usesFlats(tonicPc, mode);
  const tonicMidi = (tonicPc >= 10 ? 48 : 60) + tonicPc;
  const steps = spec.steps;
  const waltz = steps === 12;
  const [lo, hi] = degreeRange(tonicMidi, scale, spec.lead[0], spec.lead[1]);
  const c: MelCtx = { r, steps, lo, hi, dens: 'sparse' };
  const mid = Math.round(lo + (hi - lo) * 0.42);
  const total = spec.sections.reduce((n, s) => n + s.bars, 0);

  const layers: Layer[] = ['strings', 'choir', 'pad', 'harp', 'bass', 'leadA', 'leadB', 'bell', 'counter', 'timp', 'taiko', 'rise', 'crash'];
  const masks = new Map<Layer, string[]>(layers.map((l) => [l, []]));
  const leadBars: Record<'leadA' | 'leadB', string[]> = { leadA: [], leadB: [] };
  const roots: number[] = [];
  const doms: boolean[] = [];

  let motif: BarN | null = null;
  for (const sec of spec.sections) {
    roots.push(...sec.roots);
    // the raised-third dominant only on the bar that closes a section
    const secDoms = sec.roots.map((root, i) => cadenceIsDom(mode) && root === 4 && i === sec.bars - 1);
    doms.push(...secDoms);
    let mb: string[];
    switch (sec.melody) {
      case 'hero':
        mb = SLOMATT_A.slice();
        break;
      case 'iron':
        mb = [...IRON_CLAW, ...IRON_CLAW];
        break;
      case 'A': {
        const a = sectionA(c, sec.roots, mid, secDoms);
        motif = a.motif;
        mb = a.bars.map(barStr);
        break;
      }
      case 'B':
        mb = sectionB(c, sec.roots, motif ?? buildBar(c, 0, pickRhythm(c), mid, null), mid, secDoms).map(barStr);
        break;
      case 'C':
      case 'Cclose':
        mb = sectionC(c, sec.roots, mid, sec.melody === 'C' ? 'open' : 'auth', secDoms).map(barStr);
        break;
      default:
        mb = Array.from({ length: sec.bars }, () => restBar(steps));
    }
    if (mb.length !== sec.bars) throw new Error(`section ${sec.name}: ${mb.length} melody bars for ${sec.bars} bars`);
    for (const l of layers) {
      const on = sec.layers.includes(l);
      for (let i = 0; i < sec.bars; i++) masks.get(l)!.push(on ? 'x' : '.');
    }
    for (const lead of ['leadA', 'leadB'] as const) {
      for (let i = 0; i < sec.bars; i++) leadBars[lead].push(sec.lead === lead && sec.melody && sec.melody !== 'none' ? mb[i] : restBar(steps));
    }
  }
  if (roots.length !== total) throw new Error('chord roots do not fill the form');

  const names = roots.map((root, i) => chordName(tonicPc, mode, root, { seventh: r() < spec.seventh, dom: doms[i] }));
  const mask = (l: Layer) => masks.get(l)!.join('');
  const storm = spec.id === 'storyStorm';
  const tracks: Track[] = [];
  tracks.push({ kind: 'chords', name: 'strings', inst: 'orchStrings', lo: spec.stringsLo[0], hi: spec.stringsLo[1], voices: 4, gain: 0.42, rev: 0.62, mask: mask('strings') } as ChordTrack);
  tracks.push({ kind: 'chords', name: 'pad', inst: 'orchBrass', lo: 41, hi: 64, voices: 3, gain: 0.3, rev: 0.6, mask: mask('pad') } as ChordTrack);
  tracks.push({ kind: 'chords', name: 'choir', inst: 'choir', lo: 55, hi: 74, voices: 3, gain: 0.28, rev: 0.65, mask: mask('choir'), gate: [0.25, 0.6] } as ChordTrack);
  tracks.push({ kind: 'chords', name: 'hornsBig', inst: 'orchBrass', lo: 43, hi: 64, voices: 3, gain: 0.34, rev: 0.6, mask: mask('choir') } as ChordTrack);
  tracks.push({
    kind: 'pattern', name: 'harp', inst: 'harp', oct: 53, gain: 0.46, rev: 0.42, dly: 0.15, pan: -0.2, mask: mask('harp'),
    pats: waltz ? ['r.. t.. f.. t..', 'r.. t.. o.. f..'] : ['r.t.f.t. r.t.f.t.', 'r.t.f.o.f.t.f.t.'],
  } as PatternTrack);
  tracks.push({
    kind: 'pattern', name: 'bass', inst: 'contra', oct: storm ? 30 : 33, gain: storm ? 0.75 : 0.6, rev: 0.05, mask: mask('bass'),
    pats: waltz ? ['R.. ... f.. ...', 'R-- --- --- ---'] : storm ? ['R--- ---- ---- ----', 'R--- ---- r--- ----'] : ['R--- ---- ---- ----', 'R--- ---. ..f. ....'],
  } as PatternTrack);
  tracks.push({ kind: 'melody', name: 'leadA', inst: spec.leadA, bars: leadBars.leadA, gain: spec.leadA === 'brass' ? 0.5 : 0.6, rev: 0.45, dly: 0.2 } as MelodyTrack);
  tracks.push({ kind: 'melody', name: 'leadB', inst: spec.leadB, bars: leadBars.leadB, gain: spec.leadB === 'brass' ? 0.5 : 0.6, rev: 0.5, dly: 0.22 } as MelodyTrack);
  tracks.push({
    kind: 'pattern', name: 'bell', lite: true, inst: 'bell', oct: 77, gain: 0.3, rev: 0.6, dly: 0.3, pan: 0.3, mask: mask('bell'),
    pats: waltz ? ['.... .... r...', '..t. .... ....'] : ['.... .... t... ....', '..r. .... .... f...'],
  } as PatternTrack);
  tracks.push({
    kind: 'melody', name: 'counter', lite: true, inst: spec.counter,
    bars: Array.from({ length: total }, (_, i) => (masks.get('counter')![i] === 'x' ? null : restBar(steps))),
    gen: { lo: tonicMidi + 12, hi: tonicMidi + 24, density: 0.2 }, gain: 0.34, rev: 0.6, dly: 0.3, pan: -0.3,
  } as MelodyTrack);
  const drum = (name: string, voice: DrumName, p16: string[], p12: string[], gain: number, rev: number): DrumTrack =>
    ({ kind: 'drums', name, voice, pats: waltz ? p12 : p16, gain, rev, mask: mask(name as Layer) }) as DrumTrack;
  tracks.push(drum('timp', 'timpani', ['X... .... .... ....', 'X... .... x... ....'], ['X... .... ....', 'X... .... x...'], 0.5, 0.3));
  tracks.push(drum('taiko', 'taiko', ['X... .... x... ..x.'], ['X... .... x...'], 0.55, 0.2));
  tracks.push(drum('rise', 'tom', ['.... .... .... xxxx'], ['.... .... xxxx'], 0.4, 0.2));
  tracks.push(drum('crash', 'crash', ['X... .... .... ....'], ['X... .... ....'], 0.45, 0.4));

  // a mask is per bar across the whole loop: every one must be exactly the loop's length
  for (const t of tracks) if (t.mask && t.mask.length !== total) throw new Error(`${t.name}: mask ${t.mask.length} != ${total}`);

  return {
    id: spec.id,
    bpm: spec.bpm,
    tonic: `${noteName(tonicPc, flats)}${tonicPc >= 10 ? 3 : 4}`,
    scale: mode,
    stepsPerBar: waltz ? 12 : undefined,
    delay: spec.delay,
    chords: mergeChords(names),
    tracks,
  };
}
