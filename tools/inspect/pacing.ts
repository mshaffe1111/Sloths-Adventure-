/**
 * Pacing: how a stage's action is spread over time, per stage and per difficulty, against Gemini's "Recommended Event Density Table"
 * (reference/GEMINI-PCG-RESEARCH.md Part 2 §4) and Part 1 §4's rhythm groups and sawtooth tension curve. Pure functions over the
 * inspector's own beats on its own route (beats.ts): no new simulator.
 *
 * - action density: meaningful actions a second (a half beat, a pickup arc over a gap, counts half)
 * - rhythm groups: bursts of beats with less quiet between them than the setting's shortest rest pad (1.0 s Normal, 2.0 s Easy, 0.8 s
 *   a chase): a shorter walk is the run between two jumps of one group; their length in seconds and actions per burst
 * - rest pads: the quiet between two bursts (shorter than the eventless-walk limit; a longer one is an eventless walk)
 * - eventless walk: the longest stretch with no beat at all (the start and the walk to the shrine count)
 * - tension: risk per second in 9 equal parts of the stage (Gemini's 9 chunks), the jumps weighted by how often the noisy bot misses
 */
import { WEIGHT, type Beat } from './beats.ts';

export type Setting = 'easy' | 'normal';
export type Column = 'easy' | 'normal' | 'chase';

/** Gemini Part 2 §4's table, by column (Easy, Normal, a world-unique chase or slide stage) */
export const TARGETS: Record<Column, { density: [number, number]; idle: number; burst: [number, number]; actions: [number, number]; rest: [number, number] }> = {
  easy: { density: [0.35, 0.55], idle: 3.0, burst: [6, 8], actions: [3, 4], rest: [2.0, 2.5] },
  normal: { density: [0.75, 1.15], idle: 2.0, burst: [10, 14], actions: [8, 12], rest: [1.0, 1.2] },
  // (the table gives a chase no actions per burst: density times burst length, 1.1 x 15 to 1.4 x 20)
  chase: { density: [1.1, 1.4], idle: 1.2, burst: [15, 20], actions: [16, 28], rest: [0.8, 0.8] },
};
/** the quiet that ends a burst, by default: the table's briefest rest (a chase's 0.8 s landing); pacing() uses each column's own */
export const REST_SPLIT = 0.8;
/** Part 1 §4: the sawtooth across 9 chunks (Ki, Ki, Shō, Shō, breather, Ten, Ten, Ketsu climax, exit) */
export const SAWTOOTH = [0.2, 0.4, 0.5, 0.7, 0.1, 0.6, 0.85, 0.95, 0.0];
/** risk a second that reads as full tension (two plain jumps a second) */
export const TENSION_FULL = 2.0;

export interface PacingFlag {
  sev: number;
  kind: 'density' | 'burst' | 'rest' | 'idle' | 'tension';
  /** the STAGE-RULES row and ledger row it checks */
  ref: string;
  what: string;
}

export interface Group { t0: number; t1: number; actions: number; risk: number }

export interface Pacing {
  setting: Setting;
  column: Column;
  time: number;
  actions: number;
  density: number;
  groups: Group[];
  /** bursts of two or more actions (a lone beat is not a burst) */
  bursts: { n: number; medianSec: number; medianActions: number; longest: Group | null };
  /** `long`: rests over the target's top (slack, though not yet an eventless walk) */
  rests: { n: number; median: number; long: number; split: number };
  idle: { longest: number; at: number; over: number; share: number };
  tension: { chunks: number[]; names: string[]; shape: number; peakChunk: number };
  flags: PacingFlag[];
}

/** a jump's miss share where the noisy bot flew it (x and y of its take-off), or 0 */
export type MissAt = (x: number, y: number) => number;

/** how much a beat asks: its weight, a jump more the more often the bot misses it */
export function beatRisk(b: Pick<Beat, 'letter' | 'count' | 'x' | 'y'>, missAt?: MissAt): number {
  const w = WEIGHT[b.letter] * b.count;
  if (b.letter !== 'J' && b.letter !== 'h') return w;
  return w * (1 + 3 * (missAt?.(b.x, b.y) ?? 0));
}

const median = (v: number[]) => {
  if (!v.length) return 0;
  const s = [...v].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Pearson correlation (0 when either side is flat) */
export function correlation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const ma = a.slice(0, n).reduce((s, v) => s + v, 0) / n, mb = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

/** the beats split into rhythm groups: a new group starts when the quiet since the last beat ended reaches `split` s */
export function rhythmGroups(beats: Beat[], missAt?: MissAt, split = REST_SPLIT): { groups: Group[]; gaps: Array<{ t0: number; t1: number }> } {
  const groups: Group[] = [];
  const gaps: Array<{ t0: number; t1: number }> = [];
  let g: Group | null = null;
  for (const b of [...beats].sort((p, q) => p.t - q.t)) {
    const end = b.t + b.dur + b.act;
    if (g && b.t - g.t1 < split) {
      g.t1 = Math.max(g.t1, end);
      g.actions += b.count;
      g.risk += beatRisk(b, missAt);
    } else {
      if (g) { groups.push(g); gaps.push({ t0: g.t1, t1: b.t }); }
      g = { t0: b.t, t1: end, actions: b.count, risk: beatRisk(b, missAt) };
    }
  }
  if (g) groups.push(g);
  return { groups, gaps };
}

/** risk a second in `n` equal parts of the stage, as 0..1 */
export function tensionCurve(beats: Beat[], total: number, missAt?: MissAt, n = SAWTOOTH.length): number[] {
  const out = new Array(n).fill(0);
  const T = Math.max(1, total);
  for (const b of beats) out[Math.min(n - 1, Math.max(0, Math.floor((b.t / T) * n)))] += beatRisk(b, missAt);
  return out.map((r) => r2(Math.min(1, r / (T / n) / TENSION_FULL)));
}

/** which column of the table a stage is held to */
export const columnFor = (setting: Setting, chase: boolean): Column => (chase && setting === 'normal' ? 'chase' : setting);

const range = (r: [number, number], unit = '') => (r[0] === r[1] ? `${r[0]}${unit}` : `${r[0]}-${r[1]}${unit}`);
const label: Record<Column, string> = { easy: 'Easy', normal: 'Normal', chase: 'a chase' };

/**
 * One stage on one setting: its beats on the beat clock (findBeats), its total time, whether it is a chase, the noisy bot's miss share
 * for its jumps, and the stage's own section names (to label the tension parts).
 */
export function pacing(beats: Beat[], total: number, setting: Setting, o: { chase?: boolean; missAt?: MissAt; sections?: Array<{ name: string; t0: number; t1: number }> } = {}): Pacing {
  const column = columnFor(setting, !!o.chase);
  const T = TARGETS[column];
  const actions = beats.reduce((s, b) => s + b.count, 0);
  const density = actions / Math.max(1, total);
  const { groups, gaps } = rhythmGroups(beats, o.missAt, T.rest[0]);
  const bursts = groups.filter((g) => g.actions >= 2);
  const longest = bursts.reduce<Group | null>((m, g) => (!m || g.t1 - g.t0 > m.t1 - m.t0 ? g : m), null);
  // quiet with no beat at all: the start, between groups, and the walk to the shrine
  const quiet = [{ t0: 0, t1: groups[0]?.t0 ?? total }, ...gaps, { t0: groups[groups.length - 1]?.t1 ?? total, t1: total }].map((q) => ({ ...q, sec: Math.max(0, q.t1 - q.t0) }));
  const idleL = quiet.reduce((m, q) => (q.sec > m.sec ? q : m), { t0: 0, t1: 0, sec: 0 });
  const overList = quiet.filter((q) => q.sec > T.idle);
  // rest pads: the quiet between bursts that is not itself an eventless walk
  const restList = gaps.map((g) => g.t1 - g.t0).filter((s) => s <= T.idle);
  const chunks = tensionCurve(beats, total, o.missAt);
  const names = chunks.map((_, i) => {
    const mid = ((i + 0.5) / chunks.length) * total;
    return o.sections?.find((s) => mid >= s.t0 && mid < s.t1)?.name.split(':')[0] ?? '';
  });
  const peakChunk = chunks.reduce((m, v, i) => (v > chunks[m] ? i : m), 0);
  const p: Pacing = {
    setting, column, time: r1(total), actions, density: r2(density), groups,
    bursts: { n: bursts.length, medianSec: r1(median(bursts.map((g) => g.t1 - g.t0))), medianActions: r1(median(bursts.map((g) => g.actions))), longest },
    rests: { n: restList.length, median: r1(median(restList)), long: restList.filter((s) => s > T.rest[1]).length, split: T.rest[0] },
    idle: { longest: r1(idleL.sec), at: r1(idleL.t0), over: overList.length, share: r2(overList.reduce((s, q) => s + q.sec, 0) / Math.max(1, total)) },
    tension: { chunks, names, shape: r2(correlation(chunks, SAWTOOTH)), peakChunk },
    flags: [],
  };
  p.flags = pacingFlags(p);
  return p;
}

/** what is outside Gemini's table, in plain words, worst first */
export function pacingFlags(p: Pacing): PacingFlag[] {
  // (no route to judge: Dot's flight and Meeca's stage are played by their own code, so the inspector has no beats for them)
  if (p.time < 30 || !p.actions) return [];
  const T = TARGETS[p.column];
  const who = label[p.column];
  const f: PacingFlag[] = [];
  const off = (v: number, [lo, hi]: [number, number]) => (v < lo ? (lo - v) / lo : v > hi ? (v - hi) / hi : 0);
  const d = off(p.density, T.density);
  if (d > 0.1) f.push({ sev: 20 + 40 * Math.min(1, d), kind: 'density', ref: 'STAGE-RULES §2 Pacing; GEMINI-LEDGER E3', what: `${p.density} actions a second; ${who} aims for ${range(T.density)} (${p.density < T.density[0] ? 'too sparse' : 'too busy'})` });
  if (p.bursts.n) {
    const b = off(p.bursts.medianSec, T.burst);
    if (b > 0.15) f.push({ sev: 15 + 30 * Math.min(1, b), kind: 'burst', ref: 'STAGE-RULES §2 Pacing; GEMINI-LEDGER E4', what: `bursts are ${p.bursts.medianSec} s long with ${p.bursts.medianActions} actions (middle of ${p.bursts.n}); ${who} aims for ${range(T.burst, ' s')}, ${range(T.actions)} actions` });
    const L = p.bursts.longest!;
    const len = L.t1 - L.t0;
    if (len > T.burst[1] * 2) f.push({ sev: 20 + Math.min(25, (len / T.burst[1] - 2) * 10), kind: 'burst', ref: 'STAGE-RULES §2 Rests; GEMINI-LEDGER E2/E4', what: `one burst runs ${r1(len)} s (${r1(L.actions)} actions, from ${Math.round(L.t0)} s) with no rest of ${p.rests.split} s; ${who} aims for ${range(T.burst, ' s')}` });
  } else f.push({ sev: 25, kind: 'burst', ref: 'STAGE-RULES §2 Pacing; GEMINI-LEDGER E4', what: 'no bursts at all: the beats never bunch into a rhythm group' });
  // (a rest shorter than the setting's rest pad joins two bursts into one, so a missing rest shows as a long burst; a rest can only be slack)
  if (p.rests.n >= 3 && p.rests.median > T.rest[1] * 1.3) f.push({ sev: 10 + Math.min(10, (p.rests.median / T.rest[1] - 1.3) * 10), kind: 'rest', ref: 'STAGE-RULES §2 Rests; GEMINI-LEDGER E2', what: `rests between bursts are ${p.rests.median} s (${p.rests.long} of ${p.rests.n} over ${T.rest[1]} s): slack; ${who} aims for ${range(T.rest, ' s')}` });
  if (p.idle.longest > T.idle * 1.5) f.push({ sev: 15 + Math.min(30, (p.idle.longest / T.idle - 1.5) * 8), kind: 'idle', ref: 'STAGE-RULES §2 Dead time; GEMINI-LEDGER E2', what: `${p.idle.over} walk${p.idle.over === 1 ? '' : 's'} with no action over ${T.idle} s (${Math.round(p.idle.share * 100)}% of the stage), the longest ${p.idle.longest} s at ${Math.round(p.idle.at)} s; ${who} aims for ${T.idle} s at most` });
  const c = p.tension.chunks;
  const peak = Math.max(...c), low = Math.min(...c);
  if (peak - low < 0.2) f.push({ sev: 18, kind: 'tension', ref: 'STAGE-RULES §2 Tension; GEMINI-LEDGER A6', what: `the tension stays flat (${low}-${peak} across the stage): no build, breather or climax` });
  else {
    if (p.tension.peakChunk <= 2) f.push({ sev: 14, kind: 'tension', ref: 'STAGE-RULES §2 Tension; GEMINI-LEDGER A6', what: `the hardest part comes in the first third (part ${p.tension.peakChunk + 1} of 9); the sawtooth builds to a climax in part 8` });
    if (Math.max(c[6], c[7]) < 0.7 * peak) f.push({ sev: 12, kind: 'tension', ref: 'STAGE-RULES §2 Tension; GEMINI-LEDGER A6', what: `no climax near the end (parts 7-8 reach ${Math.max(c[6], c[7])} against a peak of ${peak})` });
    if (Math.min(c[3], c[4], c[5]) > 0.6 * peak) f.push({ sev: 10, kind: 'tension', ref: 'STAGE-RULES §2 Tension; GEMINI-LEDGER A6', what: `no breather in the middle (parts 4-6 never drop below ${Math.min(c[3], c[4], c[5])} against a peak of ${peak})` });
  }
  return f.map((x) => ({ ...x, sev: Math.round(x.sev) })).sort((a, b) => b.sev - a.sev);
}

/** a card's sentences: each measure against its target, in plain words */
export function pacingLines(p: Pacing): string[] {
  const T = TARGETS[p.column];
  const who = label[p.column];
  const ok = (v: number, [lo, hi]: [number, number]) => (v >= lo && v <= hi ? 'on target' : v < lo ? 'under' : 'over');
  const out = [
    `${p.density} actions a second; ${who} aims for ${range(T.density)} (${ok(p.density, T.density)}).`,
    p.bursts.n ? `Bursts are ${p.bursts.medianSec} s long with ${p.bursts.medianActions} actions; ${who} aims for ${range(T.burst, ' s')} and ${range(T.actions)} actions. Longest ${r1(p.bursts.longest!.t1 - p.bursts.longest!.t0)} s.` : 'No bursts: the beats never bunch up.',
    p.rests.n ? `Rests between bursts are ${p.rests.median} s; ${who} aims for ${range(T.rest, ' s')}.` : 'No rests between bursts.',
    `Longest walk with no action ${p.idle.longest} s (${p.idle.over} over ${T.idle} s); ${who} aims for ${T.idle} s at most.`,
    `Tension follows the sawtooth ${p.tension.shape >= 0.5 ? 'well' : p.tension.shape >= 0.2 ? 'loosely' : 'hardly at all'} (match ${p.tension.shape}); peak in part ${p.tension.peakChunk + 1} of 9.`,
  ];
  return out;
}

// ───────────────────────────── the report's parts ─────────────────────────────

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** the 9 tension parts as bars, with Gemini's sawtooth as a dashed line over them */
function tensionSvg(p: Pacing): string {
  const W = 180, H = 44, n = p.tension.chunks.length, bw = W / n;
  const bars = p.tension.chunks.map((v, i) => `<rect x="${(i * bw + 1).toFixed(1)}" y="${(H - v * H).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${Math.max(1, v * H).toFixed(1)}" rx="2" fill="var(--busy)" fill-opacity="0.75"><title>part ${i + 1}${p.tension.names[i] ? ` (${esc(p.tension.names[i])})` : ''}: tension ${v}, the sawtooth aims for ${SAWTOOTH[i]}</title></rect>`).join('');
  const line = SAWTOOTH.map((v, i) => `${i ? 'L' : 'M'}${(i * bw + bw / 2).toFixed(1)} ${(H - v * H).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" class="tens" role="img" aria-label="Tension in 9 parts of the stage against Gemini's sawtooth"><rect width="${W}" height="${H}" fill="var(--track)" rx="3"/>${bars}<path d="${line}" fill="none" stroke="var(--fg)" stroke-width="1.5" stroke-dasharray="3 2" vector-effect="non-scaling-stroke"/></svg>`;
}

/** a stage card's pacing block: Normal and Easy side by side */
export function renderPacingCard(pc: { normal: Pacing; easy: Pacing } | undefined): string {
  if (!pc) return '';
  const kinds = ['density', 'burst', 'rest', 'idle', 'tension'] as const;
  const col = (p: Pacing, name: string) => `<div><div class="lab">${name}${p.column === 'chase' ? ' (chase targets)' : ''}</div>${tensionSvg(p)}<ul class="pl">${pacingLines(p).map((l, i) => `<li${p.flags.some((f) => f.kind === kinds[i]) ? ' class="badt"' : ''}>${esc(l)}</li>`).join('')}</ul></div>`;
  return `<div class="pace"><div class="lab">Pacing</div><div class="pcols">${col(pc.normal, 'Normal')}${col(pc.easy, 'Easy')}</div><p class="small muted" style="margin:0">Bars: tension in 9 parts of the stage; dashed: Gemini's sawtooth (build, breather, climax, exit). Lines in red are off target.</p></div>`;
}

/** the report's pacing section: every stage's pacing findings, worst first */
export function renderPacingSummary(stages: Array<{ id: string; pacing?: { normal: Pacing; easy: Pacing } }>): string {
  if (!stages.some((s) => s.pacing)) return '';
  const all = stages.flatMap((s) => (s.pacing ? (['normal', 'easy'] as const).flatMap((k) => s.pacing![k].flags.map((f) => ({ ...f, id: s.id, setting: k }))) : []));
  all.sort((a, b) => b.sev - a.sev);
  const T = TARGETS;
  const rows = all.slice(0, 40).map((f) => `<tr><td><a href="#s${f.id}">${f.id}</a></td><td>${f.setting === 'easy' ? 'Easy' : 'Normal'}</td><td class="small">${esc(f.what)}</td><td class="small muted">${esc(f.ref)}</td></tr>`).join('');
  return `<section>
  <h2>Pacing: is it fun to play?</h2>
  <p class="small muted">Measured on the inspector's route and beats against Gemini's event density table (Part 2 §4). Normal aims for ${T.normal.density.join('-')} actions a second, bursts of ${T.normal.burst.join('-')} s (${T.normal.actions.join('-')} actions), rests of ${T.normal.rest.join('-')} s and no walk over ${T.normal.idle} s with nothing to do; Easy ${T.easy.density.join('-')} a second, ${T.easy.burst.join('-')} s bursts (${T.easy.actions.join('-')} actions), ${T.easy.rest.join('-')} s rests, ${T.easy.idle} s; a chase on Normal ${T.chase.density.join('-')} a second, ${T.chase.burst.join('-')} s bursts, ${T.chase.rest[0]} s rests, ${T.chase.idle} s. A burst is beats with less quiet between them than the setting's shortest rest (${T.normal.rest[0]} s Normal, ${T.easy.rest[0]} s Easy, ${T.chase.rest[0]} s a chase); a shorter walk is the run between two moves of one burst. Tension is risk a second in 9 equal parts of the stage (each beat's weight; a jump counts up to 4 times more the more often the noisy bot misses it), against Part 1 §4's sawtooth.</p>
  <div class="panel tw"><table><thead><tr><th>Stage</th><th>Setting</th><th>What</th><th>Rule</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Nothing off target.</td></tr>'}</tbody></table></div>
  <p class="small muted">${all.length} pacing findings in all${all.length > 40 ? ' (the worst 40 shown; each card has the rest)' : ''}.</p>
</section>`;
}
