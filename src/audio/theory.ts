/**
 * Music theory helpers for the score: notes, scales, chords, voice leading, a tiny melody notation,
 * a step-pattern notation, and a rule-based melody generator.
 *
 * The score is written as data (see themes.ts) in readable notation and turned into notes here, so every
 * note is guaranteed to sit in the key of its theme.
 */

export const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** mulberry32: small seeded RNG so a "random" part is always the same composition */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

const LETTER: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** 'C4' -> 60, 'F#3' -> 54, 'Bb2' -> 46 */
export function noteMidi(name: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad note name: ${name}`);
  return 12 * (Number(m[3]) + 1) + LETTER[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

export function pitchClass(name: string): number {
  const m = /^([A-G])([#b]?)$/.exec(name);
  if (!m) throw new Error(`bad pitch class: ${name}`);
  return (LETTER[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
}

export const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
};

// ---------------------------------------------------------------------------------------------
// Chords
// ---------------------------------------------------------------------------------------------

const QUALITIES: Record<string, number[]> = {
  '': [0, 4, 7],
  m: [0, 3, 7],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14],
  '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  '5': [0, 7],
  m7b5: [0, 3, 6, 10],
  '9': [0, 4, 7, 10, 14],
  m9: [0, 3, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
};

export interface Chord {
  name: string;
  rootPc: number;
  bassPc: number;
  /** semitone offsets from the root, ascending (may exceed 12 for 9ths) */
  tones: number[];
  /** how many bars it lasts */
  bars: number;
}

/** 'C', 'Am', 'F#m7', 'Bb/D', 'G7*2' (two bars) */
export function parseChord(s: string): Chord {
  const [body, mult] = s.split('*');
  const [main, slash] = body.split('/');
  const m = /^([A-G][#b]?)(.*)$/.exec(main);
  if (!m) throw new Error(`bad chord: ${s}`);
  const q = QUALITIES[m[2]];
  if (!q) throw new Error(`unknown chord quality '${m[2]}' in ${s}`);
  const rootPc = pitchClass(m[1]);
  return { name: body, rootPc, bassPc: slash ? pitchClass(slash) : rootPc, tones: q, bars: mult ? Number(mult) : 1 };
}

/** pitch classes of a chord, reduced to one octave */
export const chordPcs = (c: Chord) => c.tones.map((t) => (c.rootPc + t) % 12);

/** the chord's tones as MIDI notes with the root at the lowest `root >= base` */
export function chordMidi(c: Chord, base: number): number[] {
  const root = base + ((c.rootPc - (base % 12) + 12) % 12);
  return c.tones.map((t) => root + t);
}

/** chord tone number i, wrapping up through octaves (0 root, 1 third, 2 fifth, 3 seventh/octave ...) */
export function toneAt(c: Chord, base: number, i: number): number {
  const n = c.tones.length;
  const notes = chordMidi(c, base);
  const oct = Math.floor(i / n);
  return notes[((i % n) + n) % n] + 12 * oct;
}

/**
 * Smooth voicing: the inversion/octave of the chord closest to the previous voicing and centred in [lo, hi].
 * Good pads move by a step or two between chords instead of jumping.
 */
export function voiceLead(prev: number[] | null, c: Chord, lo: number, hi: number, maxVoices = 4): number[] {
  const tones = c.tones.slice(0, maxVoices).map((t) => (t >= 12 ? t - 12 : t)); // 9ths fold in
  const uniq = Array.from(new Set(tones)).sort((a, b) => a - b);
  let best: number[] | null = null;
  let bestCost = Infinity;
  for (let inv = 0; inv < uniq.length; inv++) {
    const set = uniq.map((t, i) => c.rootPc + t + (i < inv ? 12 : 0));
    for (let oct = 0; oct < 8; oct++) {
      // move whole voicing so its lowest note is near lo + oct*... try a few transpositions
      const base = lo + oct * 3;
      const lowest = Math.min(...set);
      const shift = Math.ceil((base - lowest) / 12) * 12;
      const v = set.map((n) => n + shift).sort((a, b) => a - b);
      if (v[0] < lo - 1 || v[v.length - 1] > hi + 1) continue;
      const centre = (v[0] + v[v.length - 1]) / 2;
      let cost = Math.abs(centre - (lo + hi) / 2) * 0.35;
      if (prev) {
        const pv = prev.slice().sort((a, b) => a - b);
        for (let i = 0; i < Math.max(pv.length, v.length); i++) cost += Math.abs((v[Math.min(i, v.length - 1)] ?? 0) - (pv[Math.min(i, pv.length - 1)] ?? 0));
      }
      if (cost < bestCost) {
        bestCost = cost;
        best = v;
      }
    }
  }
  return best ?? uniq.map((t) => lo + ((c.rootPc + t - lo + 120) % 12));
}

// ---------------------------------------------------------------------------------------------
// Step patterns (chord-relative: bass lines, arpeggios, comping)
// ---------------------------------------------------------------------------------------------

export interface PatCell {
  /** step within the bar */
  step: number;
  /** length in steps */
  len: number;
  /** chord tone index (0 root, 1 third, 2 fifth, 3 seventh/octave ...) or -1 for 'octave of the root' resolved later */
  tone: number;
  accent: boolean;
  /** soft ghost note */
  ghost: boolean;
}

const TONE_CHARS: Record<string, number> = { r: 0, t: 1, f: 2, s: 3, o: -1 };

/**
 * One char per step, spaces ignored:
 *   r t f s  root / third / fifth / seventh,  o = octave above the root,  0-9 = chord tone number
 *   UPPERCASE = accent, '-' = hold the previous note, '.' = rest, 'g' = ghost root (soft)
 */
export function parsePattern(src: string, steps = 16): PatCell[] {
  const chars = src.replace(/[\s|]/g, '');
  if (chars.length !== steps) throw new Error(`pattern needs ${steps} steps, got ${chars.length}: ${src}`);
  const out: PatCell[] = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === '.') continue;
    if (ch === '-') {
      if (out.length) out[out.length - 1].len++;
      continue;
    }
    const lower = ch.toLowerCase();
    let tone: number;
    if (lower === 'g') tone = 0;
    else if (lower in TONE_CHARS) tone = TONE_CHARS[lower];
    else if (/[0-9]/.test(ch)) tone = Number(ch);
    else throw new Error(`bad pattern char '${ch}' in ${src}`);
    out.push({ step: i, len: 1, tone, accent: ch !== lower && /[A-Z]/.test(ch), ghost: lower === 'g' });
  }
  return out;
}

/** a drum bar: x hit, X accent, o ghost, '.' rest; spaces ignored */
export function parseDrums(src: string, steps = 16): Array<{ step: number; v: number }> {
  const chars = src.replace(/[\s|]/g, '');
  if (chars.length !== steps) throw new Error(`drum pattern needs ${steps} steps, got ${chars.length}: ${src}`);
  const out: Array<{ step: number; v: number }> = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === 'x') out.push({ step: i, v: 0.8 });
    else if (ch === 'X') out.push({ step: i, v: 1 });
    else if (ch === 'o') out.push({ step: i, v: 0.4 });
    else if (ch !== '.') throw new Error(`bad drum char '${ch}'`);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Melody notation (scale degrees)
// ---------------------------------------------------------------------------------------------

export interface MelNote {
  step: number;
  len: number;
  /** MIDI note, or null for a rest */
  midi: number | null;
}

/**
 * One bar of melody in scale degrees, e.g. "5:3 5:1 6:2 5:2 3:4 r:4".
 *   1..7 = scale degree (1 = tonic at the theme's key octave)   ' = octave up, , = octave down
 *   b / # in front lowers / raises by a semitone   r = rest   :n = length in steps (default 2)
 */
export function parseMelodyBar(src: string, tonic: number, scale: number[], steps = 16): MelNote[] {
  const out: MelNote[] = [];
  let step = 0;
  for (const tok of src.trim().split(/\s+/)) {
    const m = /^(?:(r)|([b#]?)([1-7])('*|,*))(?::(\d+))?$/.exec(tok);
    if (!m) throw new Error(`bad melody token '${tok}' in "${src}"`);
    const len = m[5] ? Number(m[5]) : 2;
    if (m[1]) out.push({ step, len, midi: null });
    else {
      const deg = Number(m[3]) - 1;
      let midi = tonic + scale[deg];
      if (m[2] === 'b') midi -= 1;
      else if (m[2] === '#') midi += 1;
      const oct = m[4] ?? '';
      midi += oct.startsWith("'") ? 12 * oct.length : oct.startsWith(',') ? -12 * oct.length : 0;
      out.push({ step, len, midi });
    }
    step += len;
  }
  if (step !== steps) throw new Error(`melody bar has ${step} steps, expected ${steps}: "${src}"`);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Rule-based melody generator (for the B sections: always in key, strong beats on chord tones)
// ---------------------------------------------------------------------------------------------

const RHYTHMS_16: number[][] = [
  [4, 4, 4, 4],
  [2, 2, 4, 2, 2, 4],
  [3, 1, 4, 2, 2, 4],
  [2, 2, 2, 2, 4, 4],
  [6, 2, 4, 4],
  [4, 2, 2, 8],
  [2, 2, 4, 4, 4],
  [3, 1, 2, 2, 4, 4],
  [4, 4, 2, 2, 4],
  [8, 4, 4],
];
const RHYTHMS_12: number[][] = [
  [4, 4, 4],
  [6, 2, 4],
  [2, 2, 4, 4],
  [4, 2, 2, 4],
  [8, 4],
];

export interface MelodyGenOpts {
  scalePcs: number[];
  chordPcs: number[];
  prev: number;
  lo: number;
  hi: number;
  rand: () => number;
  steps?: number;
  /** 0 = first bar of a 4-bar phrase .. 3 = the cadence bar, which ends on a long chord tone */
  phraseBar: number;
  /** how busy: 0 sparse .. 1 busy */
  density?: number;
}

export function generateMelodyBar(o: MelodyGenOpts): MelNote[] {
  const steps = o.steps ?? 16;
  const rand = o.rand;
  const pool: number[] = [];
  for (let m = o.lo; m <= o.hi; m++) if (o.scalePcs.includes(m % 12)) pool.push(m);
  const isChord = (m: number) => o.chordPcs.includes(m % 12);
  const nearest = (target: number, filter: (m: number) => boolean) => {
    let best = pool[0];
    let bd = Infinity;
    for (const m of pool) {
      if (!filter(m)) continue;
      const d = Math.abs(m - target) + rand() * 0.6;
      if (d < bd) {
        bd = d;
        best = m;
      }
    }
    return best;
  };
  const tpl = (steps === 12 ? RHYTHMS_12 : RHYTHMS_16);
  let lens = tpl[Math.floor(rand() * tpl.length)].slice();
  if (o.phraseBar === 3) lens = steps === 12 ? [4, 8] : rand() < 0.5 ? [4, 4, 8] : [2, 2, 4, 8];
  if ((o.density ?? 0.5) > 0.7 && o.phraseBar !== 3) lens = steps === 12 ? [2, 2, 2, 2, 4] : [2, 2, 2, 2, 4, 4];
  if ((o.density ?? 0.5) < 0.25 && o.phraseBar !== 3) lens = steps === 12 ? [6, 6] : [8, 8];

  const out: MelNote[] = [];
  let cur = nearest(o.prev + (rand() < 0.5 ? 1 : -1), isChord);
  let step = 0;
  let pendingStepBack = 0;
  let repeats = 0;
  lens.forEach((len, idx) => {
    if (idx > 0) {
      const poolIdx = pool.indexOf(cur);
      let move: number;
      if (pendingStepBack) {
        move = pendingStepBack;
        pendingStepBack = 0;
      } else {
        const r = rand();
        const dir = rand() < 0.5 ? -1 : 1;
        if (r < 0.52) move = dir;
        else if (r < 0.74) move = dir * 2;
        else if (r < 0.82) move = 0;
        else {
          move = dir * (3 + Math.floor(rand() * 2));
          pendingStepBack = -Math.sign(move);
        }
      }
      let ni = poolIdx + move;
      if (ni < 0) ni = -ni;
      if (ni > pool.length - 1) ni = pool.length - 1 - (ni - (pool.length - 1));
      ni = Math.max(0, Math.min(pool.length - 1, ni));
      let next = pool[ni];
      if (next === cur) {
        repeats++;
        if (repeats >= 2) {
          next = pool[Math.max(0, Math.min(pool.length - 1, ni + (rand() < 0.5 ? 1 : -1)))];
          repeats = 0;
        }
      } else repeats = 0;
      // strong beats (1 and 3) and the end of a phrase land on chord tones
      const strong = step === 0 || step === steps / 2;
      if ((strong && !isChord(next)) || (o.phraseBar === 3 && idx === lens.length - 1)) next = nearest(next, isChord);
      if (Math.abs(next - cur) > 9) next = nearest(cur + Math.sign(next - cur) * 5, (m) => true);
      cur = next;
    }
    out.push({ step, len, midi: cur });
    step += len;
  });
  return out;
}
