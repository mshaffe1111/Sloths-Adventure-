/**
 * Song form: a stage's music is a piece with sections, not one 16-bar loop.
 *
 * The composer writes a tune's A section (8 bars) and its B section (8 bars). Played round and round, that is 35 seconds of music heard six
 * times in a four-minute stage, which is what wore thin (Matt, 2026-10-29: "repetitive or boring"). Here the same material is built out into
 * a form, the way a game composer would lay out a level's cue:
 *
 *   A       the tune as written
 *   A2, A3  the tune again, varied: ornamented (passing notes fill the long notes), re-rhythmed, or with a new answer to its first phrase;
 *           and on another instrument
 *   B, B2   the contrasting half, and a variation of it
 *   C       a new section: its own chords (it starts away from home), its own tune on another instrument, ending open on the dominant
 *   bridge  two bars to a chord, climbing, the music getting fuller (`lift`), to the dominant
 *   break   the quiet passage: drums and bass rest, the tune's opening is only hinted at; then the return
 *
 * Each stage gets its own order of those sections (FORMS) and its own variations, from its seed, and every section keeps the world's key,
 * mode and instruments, so World 3's grotto sounds like the grotto in every stage. A full form is 64-80 bars: 2.5 to 3 minutes before it
 * comes round, and on the next time round the arrangement passes (music.ts) dress it differently again.
 *
 * Nothing here touches audio: the output is data on the Theme (Theme.form) that the Playback walks.
 */
import { hashStr, rng } from './theory.ts';
import type { FormPart, MelodyTrack, NoteInstName, Theme } from './music.ts';

type R = () => number;
const pick = <T>(r: R, a: readonly T[]): T => a[Math.min(a.length - 1, Math.floor(r() * a.length))];

// ───────────────────────────────────────────── melody tokens ─────────────────────────────────────────────

/** one written note or rest: a scale-degree index (0 = tonic, 7 = the octave above), its length in steps, and what the notation carried */
export interface Tok {
  n: number | null;
  len: number;
  acc?: '' | 'b' | '#';
  vel?: string;
}

/** a melody bar as tokens ("5:4 6:2 r:2 1':8" and so on; see theory.parseMelodyBar) */
export function parseBar(src: string): Tok[] {
  const out: Tok[] = [];
  for (const t of src.trim().split(/\s+/)) {
    const m = /^(?:(r)|([b#]?)([1-7])('*|,*))(?::(\d+))?(?:@([1-9]))?$/.exec(t);
    if (!m) throw new Error(`bad melody token '${t}' in "${src}"`);
    const len = m[5] ? Number(m[5]) : 2;
    if (m[1]) {
      out.push({ n: null, len });
      continue;
    }
    const oct = m[4] ?? '';
    const o = oct.startsWith("'") ? oct.length : oct.startsWith(',') ? -oct.length : 0;
    out.push({ n: Number(m[3]) - 1 + 7 * o, len, acc: (m[2] as Tok['acc']) || '', ...(m[6] ? { vel: m[6] } : {}) });
  }
  return out;
}

export function barOf(toks: Tok[]): string {
  return toks
    .map((x) => {
      if (x.n === null) return `r:${x.len}`;
      const d = ((x.n % 7) + 7) % 7;
      const o = Math.floor(x.n / 7);
      return `${x.acc ?? ''}${d + 1}${o > 0 ? "'".repeat(o) : o < 0 ? ','.repeat(-o) : ''}:${x.len}${x.vel ? '@' + x.vel : ''}`;
    })
    .join(' ');
}

const steps = (toks: Tok[]) => toks.reduce((a, t) => a + t.len, 0);

/**
 * Ornament: a long note that moves on to another note gives up its last eighth to a passing note on the way (by step), and a long last note
 * is sometimes turned (the note above, then back). The tune's shape and its strong beats stay where they were.
 */
export function ornament(src: string, r: R, amount = 0.6): string {
  const t = parseBar(src);
  const out: Tok[] = [];
  for (let i = 0; i < t.length; i++) {
    const x = t[i];
    const next = t.slice(i + 1).find((y) => y.n !== null);
    if (x.n !== null && x.len >= 4 && !x.acc && r() < amount) {
      if (next && next.n !== null && next.n !== x.n) {
        const dir = Math.sign(next.n - x.n);
        out.push({ ...x, len: x.len - 2 }, { n: Math.abs(next.n - x.n) >= 2 ? x.n + dir : x.n - dir, len: 2, acc: '' });
        continue;
      }
      if (!next && x.len >= 8) {
        out.push({ ...x, len: x.len - 4 }, { n: x.n + 1, len: 2, acc: '' }, { n: x.n, len: 2, acc: '' });
        continue;
      }
    }
    out.push(x);
  }
  return barOf(out);
}

/**
 * Re-rhythm: the same notes, in a new rhythm: a pair of equal notes becomes long-short (dotted), or a held note is anticipated by a
 * sixteenth. Notes and bar length are kept.
 */
export function rerhythm(src: string, r: R): string {
  const t = parseBar(src);
  for (let i = 0; i + 1 < t.length; i++) {
    const a = t[i];
    const b = t[i + 1];
    if (a.n === null || b.n === null) continue;
    if (a.len === b.len && (a.len === 4 || a.len === 2) && r() < 0.5) {
      // 4+4 -> 6+2, 2+2 -> 3+1
      a.len = a.len * 1.5;
      b.len = b.len * 0.5;
      i++;
    } else if (a.len === 2 && b.len >= 6 && r() < 0.4) {
      // a short note before a long one arrives early: 2+8 -> 1+9
      a.len = 1;
      b.len += 1;
      i++;
    }
  }
  return barOf(t);
}

/** a bar of rest the length of a bar */
const rest = (n: number) => `r:${n}`;

/**
 * The tune's first bar as a hint, for the quiet passage: its notes held longer and fewer (the first note, then the bar's last note),
 * an octave below where the tune sits when it can be.
 */
export function hint(src: string, n = 16): string {
  const t = parseBar(src).filter((x) => x.n !== null);
  if (!t.length) return rest(n);
  const first = t[0];
  const last = t[t.length - 1];
  if (first.n === last.n || t.length === 1) return barOf([{ ...first, len: n - 4 }, { n: null, len: 4 }]);
  return barOf([{ ...first, len: n / 2 }, { ...last, len: n / 2 - 2 }, { n: null, len: 2 }]);
}

// ───────────────────────────────────────────── the orders ─────────────────────────────────────────────

/**
 * The orders a stage's sections come in (one is picked per stage). Every order opens with the tune (so a stage still starts on its theme),
 * reaches the quiet passage around the middle, and comes home to a varied A.
 */
export const FORMS: string[][] = [
  ['A', 'B', 'A2', 'C', 'bridge', 'A3', 'break', 'B2', 'A2'],
  ['A', 'A2', 'B', 'C', 'break', 'A3', 'bridge', 'B2'],
  ['A', 'B', 'C', 'A2', 'bridge', 'break', 'A3', 'B2'],
  ['A', 'B', 'A3', 'break', 'C', 'bridge', 'A2', 'B2', 'A'],
  ['A', 'C', 'A2', 'B', 'break', 'bridge', 'A3', 'B2'],
];

/** what every section is made of, before it is placed in an order */
export interface SectionSet {
  [name: string]: Omit<FormPart, 'name'>;
}

/** lay a stage's sections out in one of the orders: the same seed always gives the same order */
export function arrange(sections: SectionSet, seed: number): FormPart[] {
  const order = FORMS[(seed >>> 0) % FORMS.length];
  return order.filter((n) => sections[n]).map((n) => ({ name: n, ...sections[n] }));
}

/** how many bars a form lasts */
export const formBars = (form: FormPart[]) =>
  form.reduce((a, p) => a + p.chords.reduce((b, c) => b + (Number(/\*(\d+)$/.exec(c)?.[1]) || 1), 0), 0);

// ───────────────────────────────────────────── a written piece's form ─────────────────────────────────────────────

/**
 * A form for a piece that was written as one loop (the worlds' written themes a stage sometimes plays, see scenes.ts): its own material,
 * laid out as statement, a varied statement on another instrument, the quiet passage on the loop's first half, a fuller climb on its second
 * half, and a return with a new rhythm. Only the written tune lines are varied; everything else plays as written.
 */
export function autoForm(theme: Theme, seed: number): FormPart[] | null {
  const r = rng((hashStr(`form${theme.id}`) ^ Math.imul(seed >>> 0, 2654435761)) >>> 0);
  const spb = theme.stepsPerBar ?? 16;
  // the chord loop, one chord per bar
  const bars: string[] = [];
  for (const c of theme.chords) {
    const m = /^(.*?)(?:\*(\d+))?$/.exec(c)!;
    for (let i = 0; i < (Number(m[2]) || 1); i++) bars.push(m[1]);
  }
  const L = bars.length;
  if (L < 4) return null;
  const lines = theme.tracks.filter((t): t is MelodyTrack => t.kind === 'melody' && t.bars.some((b) => b !== null));
  if (!lines.length) return null;
  const lead = lines[0];
  const half = Math.max(2, Math.floor(L / 2));
  const span = (from: number, n: number) => Array.from({ length: n }, (_, i) => bars[(from + i) % L]);
  const lineFor = (t: MelodyTrack, from: number, n: number, f: (b: string, i: number) => string | null) =>
    Array.from({ length: n }, (_, i) => {
      const b = t.bars[(from + i) % t.bars.length];
      return b === null ? null : f(b, i);
    });
  const varied = (fn: (b: string) => string) => Object.fromEntries(lines.map((t) => [t.genKey ?? t.name, lineFor(t, 0, L, (b) => safe(fn, b, spb))]));
  const plain = (from: number, n: number) => Object.fromEntries(lines.map((t) => [t.genKey ?? t.name, lineFor(t, from, n, (b) => b)]));
  const alt = lead.altInst;
  const sections: SectionSet = {
    A: { chords: span(0, L), lines: plain(0, L) },
    A2: { chords: span(0, L), lines: varied((b) => ornament(b, r)), ...(alt ? { inst: { [lead.name]: alt } } : {}) },
    A3: { chords: span(0, L), lines: varied((b) => rerhythm(b, r)) },
    break: {
      chords: span(0, half),
      lines: Object.fromEntries(lines.map((t) => [t.genKey ?? t.name, lineFor(t, 0, half, (b, i) => (i % 2 === 0 ? safe((x) => hint(x, spb), b, spb) : rest(spb)))])),
      rest: ['perc', 'low', 'stab', 'drive'],
      lift: -0.35,
    },
    bridge: { chords: span(half, L - half), lines: plain(half, L - half), lift: 0.18 },
  };
  const order = pick(r, [
    ['A', 'A2', 'break', 'bridge', 'A3'],
    ['A', 'A3', 'bridge', 'break', 'A2'],
    ['A', 'A2', 'bridge', 'A3', 'break', 'A'],
  ]);
  return order.map((n) => ({ name: n, ...sections[n] }));
}

/** a variation that does not keep the bar whole (it never should) falls back to the bar as written */
function safe(fn: (b: string) => string, b: string, spb: number): string {
  try {
    const v = fn(b);
    return steps(parseBar(v)) === spb ? v : b;
  } catch {
    return b;
  }
}

// ───────────────────────────────────────────── chaining the chunks ─────────────────────────────────────────────

/**
 * Pokey's motif: the first two bars of his tune (tunes.ts SLOMATT_A), over the home chord and the fifth. It opens one of every stage's
 * tunes, in that world's mode and on that world's lead, so the one thread runs through all ten worlds (the lead, 2026-10-29).
 */
export const POKEY_MOTIF = ['5:3 5:1 6:2 5:2 3:4 r:4', '2:3 3:1 2:2 1:2 7,:4 r:4'];
export const POKEY_ROOTS = [0, 4];

/** a bar moved by whole scale steps (7 = an octave) */
export function transposeBar(src: string, steps: number): string {
  return barOf(parseBar(src).map((t) => (t.n === null ? t : { ...t, n: t.n + steps })));
}

/** what a chunk does in the piece: 'A', 'B', 'A2', 'C', 'bridge', 'break' (a tune's chunks after the first are named 'A·2' and so on) */
export const roleOfPart = (p: FormPart) => p.name.split('·')[0];

const barsOfPart = (p: FormPart) => p.chords.reduce((a, c) => a + (Number(/\*(\d+)$/.exec(c)?.[1]) || 1), 0);

/**
 * The next chunk to play (an index into the pool), given those played so far (Matt, 2026-10-29: "write more musics for levels and keep
 * them smaller by looping. Keeping the music constantly changes"). A stage's music is a pool of 8-bar chunks from its 2-3 tunes, and the
 * game strings them together as it goes, never the same order twice:
 *   - nothing heard in the last `windowSec` seconds comes back (when the pool is too small for that, just not the last three);
 *   - a tune's answer usually follows it, and after the quiet passage or the bridge a tune comes home on its A;
 *   - the quiet passage and the bridge never come twice in a row, and the music moves to another tune through an A, a bridge or a quiet
 *     passage rather than in the middle of a phrase.
 * `r` is the stage's own dice, so a stage's music is the same each time it is played from the same start, and different from every other.
 */
export function nextChunk(pool: FormPart[], history: number[], r: R, barSec: number, windowSec = 120): number {
  if (!history.length) return Math.max(0, pool.findIndex((p) => p.name === 'A'));
  const lastI = history[history.length - 1];
  const last = pool[lastI];
  const recent = new Set<number>();
  let t = 0;
  for (let i = history.length - 1; i >= 0 && t < windowSec; i--) {
    recent.add(history[i]);
    t += barsOfPart(pool[history[i]]) * barSec;
  }
  let cands = pool.map((_, i) => i).filter((i) => !recent.has(i));
  if (!cands.length) cands = pool.map((_, i) => i).filter((i) => !history.slice(-3).includes(i));
  if (!cands.length) cands = pool.map((_, i) => i).filter((i) => i !== lastI);
  const lr = roleOfPart(last);
  const weight = (i: number) => {
    const p = pool[i];
    const ro = roleOfPart(p);
    if ((ro === 'break' || ro === 'bridge') && ro === lr) return 0;
    let x = 1;
    if (lr === 'A' && ro === 'B' && p.tune === last.tune) x = 5;
    else if ((lr === 'break' || lr === 'bridge') && ro === 'A') x = 4;
    if (ro === 'break' && lr === 'A') x *= 0.3;
    if (p.tune !== last.tune && ro !== 'A' && lr !== 'break' && lr !== 'bridge') x *= 0.4;
    return x;
  };
  const ws = cands.map(weight);
  const total = ws.reduce((a, b) => a + b, 0);
  if (total <= 0) return cands[Math.floor(r() * cands.length)];
  let u = r() * total;
  for (let k = 0; k < cands.length; k++) {
    u -= ws[k];
    if (u <= 0) return cands[k];
  }
  return cands[cands.length - 1];
}

/** the instrument a section hands the tune to, when it hands it to anyone */
export const leadInst = (part: FormPart | undefined, track: string): NoteInstName | undefined => part?.inst?.[track];
