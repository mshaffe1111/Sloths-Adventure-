/**
 * The title's carved name (Matt picked "carved into bark", 2026-10-28, and asked to see it being carved). The letters are the game's
 * own carving alphabet, the strokes Meeca's hairpin cuts on a 4 x 6 grid (the same shapes as w5Art.ts GLYPHS, which draws her
 * carved words in her stage; repeated here so the title does not reach into World 5's art), cut bolder and deeper for the title.
 *
 * Pure: where each stroke goes, and when each piece of it is cut, so the timing is tested without a screen.
 */
export const CARVE_GLYPHS: Record<string, number[][]> = {
  A: [[0, 6, 2, 0, 4, 6], [0.8, 3.8, 3.2, 3.8]],
  D: [[0, 0, 0, 6, 2.4, 6, 4, 4.4, 4, 1.6, 2.4, 0, 0, 0]],
  E: [[4, 0, 0, 0, 0, 6, 4, 6], [0, 3, 3, 3]],
  F: [[4, 0, 0, 0, 0, 6], [0, 3, 3, 3]],
  H: [[0, 0, 0, 6], [4, 0, 4, 6], [0, 3, 4, 3]],
  I: [[2, 0, 2, 6], [0.8, 0, 3.2, 0], [0.8, 6, 3.2, 6]],
  L: [[0, 0, 0, 6, 4, 6]],
  N: [[0, 6, 0, 0, 4, 6, 4, 0]],
  O: [[2, 0, 0.4, 1, 0, 3, 0.4, 5, 2, 6, 3.6, 5, 4, 3, 3.6, 1, 2, 0]],
  R: [[0, 6, 0, 0, 3, 0, 4, 1.5, 3, 3, 0, 3], [1.8, 3, 4, 6]],
  S: [[4, 0.8, 2.6, 0, 1, 0.2, 0.2, 1.4, 1, 2.6, 3, 3.4, 3.8, 4.6, 3, 5.8, 1.4, 6, 0, 5.2]],
  T: [[0, 0, 4, 0], [2, 0, 2, 6]],
  U: [[0, 0, 0, 4.6, 1, 6, 3, 6, 4, 4.6, 4, 0]],
  V: [[0, 0, 2, 6, 4, 0]],
};

/** a letter of a carved line: its strokes in grid units (x 0..4, y 0..6) placed at `x0` units along the line */
export interface PlannedLetter {
  ch: string;
  line: number;
  x0: number;
  strokes: number[][];
  /** seconds from the start of the carve: when the knife starts this letter and when it lifts */
  start: number;
  end: number;
  /** the total length of its strokes, in grid units */
  length: number;
}
export interface CarveLine {
  text: string;
  /** seconds a letter takes, and how much of that the next one overlaps (0..1) */
  perLetter: number;
  overlap: number;
  /** seconds to wait after the line above has finished */
  after: number;
  /** grid units between letters (the alphabet's own is 1.4) and for a space */
  gap: number;
  space: number;
}
export interface CarvePlan {
  letters: PlannedLetter[];
  /** each line's width in grid units, and when it is finished */
  widths: number[];
  lineEnds: number[];
  end: number;
}

const len = (st: number[]) => {
  let n = 0;
  for (let k = 2; k < st.length; k += 2) n += Math.hypot(st[k] - st[k - 2], st[k + 1] - st[k - 1]);
  return n;
};

export function planCarve(lines: CarveLine[]): CarvePlan {
  const letters: PlannedLetter[] = [];
  const widths: number[] = [];
  const lineEnds: number[] = [];
  let t = 0;
  lines.forEach((ln, li) => {
    t += li ? ln.after : 0;
    let x = 0;
    let k = 0;
    let lineEnd = t;
    for (const ch of ln.text.toUpperCase()) {
      if (ch === ' ') {
        x += ln.space;
        continue;
      }
      const strokes = CARVE_GLYPHS[ch];
      if (!strokes) continue;
      const start = t + k * ln.perLetter * (1 - ln.overlap);
      const end = start + ln.perLetter;
      letters.push({ ch, line: li, x0: x, strokes, start, end, length: strokes.reduce((a, s) => a + len(s), 0) });
      lineEnd = end;
      x += 4 + ln.gap;
      k++;
    }
    widths.push(Math.max(0, x - ln.gap));
    lineEnds.push(lineEnd);
    t = lineEnd;
  });
  return { letters, widths, lineEnds, end: t };
}

/**
 * How much of a letter is cut at time t: the strokes in order, each cut along its length at an even pace. Returns the cut part of
 * each stroke as a polyline (whole strokes, the one being cut so far, nothing of the ones still to come), and where the knife is.
 */
export function cutSoFar(l: PlannedLetter, t: number): { strokes: number[][]; tip: [number, number] | null; done: boolean } {
  if (t >= l.end) return { strokes: l.strokes, tip: null, done: true };
  if (t <= l.start) return { strokes: [], tip: null, done: false };
  let left = ((t - l.start) / (l.end - l.start)) * l.length;
  const out: number[][] = [];
  for (const st of l.strokes) {
    const whole = len(st);
    if (left >= whole) {
      out.push(st);
      left -= whole;
      continue;
    }
    const part = [st[0], st[1]];
    for (let k = 2; k < st.length; k += 2) {
      const seg = Math.hypot(st[k] - st[k - 2], st[k + 1] - st[k - 1]);
      if (left >= seg) {
        part.push(st[k], st[k + 1]);
        left -= seg;
        continue;
      }
      const u = seg ? left / seg : 0;
      const x = st[k - 2] + (st[k] - st[k - 2]) * u, y = st[k - 1] + (st[k + 1] - st[k - 1]) * u;
      part.push(x, y);
      out.push(part);
      return { strokes: out, tip: [x, y], done: false };
    }
    out.push(part);
    return { strokes: out, tip: [st[st.length - 2], st[st.length - 1]], done: false };
  }
  return { strokes: out, tip: null, done: false };
}

/** the title's two lines: the name, a quarter of a second a letter with a little overlap; then the subtitle, smaller and quicker */
export const TITLE_LINES: CarveLine[] = [
  { text: 'SLOTHS', perLetter: 0.27, overlap: 0.18, after: 0, gap: 1.5, space: 3 },
  { text: 'RAINFOREST ADVENTURES', perLetter: 0.11, overlap: 0.35, after: 0.25, gap: 1.9, space: 3.4 },
];
