/**
 * Difficulty bands (STAGE-RULES §1b, GEMINI-LEDGER F2): a difficulty score per stage and setting, built from the inspector's numbers and
 * the first-timer bot's, then each world's band (the spread of its stages' scores) and the flags §1b names:
 * - a world whose band sits below the one before (its middle at or under the previous world's middle);
 * - a stage outside its world's band: above the next world's middle, or below the previous world's middle;
 * - Gemini's floors (Part 2 §8): the Normal bot clears each jump at least 70% of the time in Worlds 1-5 and 50% in 6-10, the Easy kid 85%.
 * Pure functions, so the scoring and the flags are tested on their own (bands.test.ts).
 */
import type { StageReport } from './inspect.ts';
import type { FirstTimerPass } from './firsttimerReport.ts';
import type { FTStage } from './firsttimer.ts';

export type Setting = 'easy' | 'normal';

/** what the score is built from, for one stage on one setting (null where it was not measured) */
export interface BandInput {
  id: string;
  world: number;
  setting: Setting;
  /** seconds, the inspector's quick player */
  time: number;
  /** share of the stage in quiet stretches (dead time / time) */
  deadShare: number;
  /** the noisy bot's success share for each jump on the route (inspector bots: the adult on Normal, the kid on Easy) */
  jumpRates: number[];
  /** the first-timer bot: lives lost a minute, peak stress, its narrowest measured input window (ms), its worst survival per edge */
  livesPerMin: number | null;
  peakStress: number | null;
  minWindowMs: number | null;
  survivalMin: number | null;
  /**
   * timing pressure (2026-10-28, round 4 of World 4's pass, Matt: "Harder, still safe"): a stage can ask a lot without costing lives.
   * Timed hazards and animals met a minute on the route (the inspector's Z and C beats); the share of the first-timer's measured press
   * windows that are fair but tight (under twice the gate); and restarts a minute (hits taken and back-and-forth loops, a climb lost
   * without a life). Left out (null or missing) where not measured.
   */
  hazardsPerMin?: number | null;
  tightShare?: number | null;
  restartsPerMin?: number | null;
}

/** how much each part counts (weights are spread over the parts that were measured) */
export const PARTS = {
  lives: { w: 0.3, name: 'lives lost a minute (first-timer)' },
  jump: { w: 0.25, name: 'hardest jumps for the noisy bot' },
  stress: { w: 0.15, name: 'peak stress in a burst (first-timer)' },
  window: { w: 0.1, name: 'narrowest input window (first-timer)' },
  busy: { w: 0.1, name: 'little dead time' },
  length: { w: 0.1, name: 'length' },
  pressure: { w: 0.2, name: 'timing pressure: hazards met, tight-but-fair presses, restarts (first-timer)' },
} as const;
export type PartId = keyof typeof PARTS;

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** each part as 0 (easy) .. 1 (hard), on fixed anchors so scores compare across runs, seeds and settings */
export function parts(i: BandInput): Partial<Record<PartId, number>> {
  const out: Partial<Record<PartId, number>> = {};
  // 0.8 lives a minute reads as two-thirds of the way to brutal
  if (i.livesPerMin !== null) out.lives = clamp(1 - Math.exp(-i.livesPerMin / 0.8));
  // the mean miss share of the three hardest jumps, against a 60% miss as the top
  const miss = i.jumpRates.map((r) => 1 - r).sort((a, b) => b - a).slice(0, 3);
  out.jump = miss.length ? clamp(miss.reduce((s, v) => s + v, 0) / miss.length / 0.6) : 0;
  if (i.peakStress !== null) out.stress = clamp(i.peakStress / 6);
  // 500 ms or more is no squeeze at all, 100 ms is the tightest
  if (i.minWindowMs !== null) out.window = clamp((500 - i.minWindowMs) / 400);
  // half the stage quiet is as calm as it gets
  out.busy = clamp(1 - i.deadShare / 0.5);
  // 2 minutes is the floor (STAGE-RULES §1), 6 minutes long
  out.length = clamp((i.time - 120) / 240);
  // (twelve hazards or animals a minute, every press tight, or three restarts a minute each read as the top; the mean of what was measured)
  const press = [
    i.hazardsPerMin == null ? null : clamp(i.hazardsPerMin / 12),
    i.tightShare == null ? null : clamp(i.tightShare),
    i.restartsPerMin == null ? null : clamp(i.restartsPerMin / 3),
  ].filter((v): v is number => v !== null);
  if (press.length) out.pressure = press.reduce((a, b) => a + b, 0) / press.length;
  return out;
}

/** the difficulty score, 0..100 */
export function stageScore(i: BandInput): { score: number; parts: Partial<Record<PartId, number>> } {
  const p = parts(i);
  let s = 0, w = 0;
  for (const [k, v] of Object.entries(p) as Array<[PartId, number]>) { s += PARTS[k].w * v; w += PARTS[k].w; }
  return { score: Math.round((w ? s / w : 0) * 1000) / 10, parts: p };
}

export interface Scored { id: string; world: number; setting: Setting; score: number; parts: Partial<Record<PartId, number>> }
export interface Band { world: number; setting: Setting; n: number; min: number; max: number; mid: number; ids: string[] }

export interface BandFlag {
  sev: number;
  kind: 'world-below' | 'above-next' | 'below-prev' | 'floor' | 'ramp';
  id: string | null;
  world: number;
  setting: Setting;
  ref: string;
  what: string;
}

const median = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** each world's band, per setting */
export function worldBands(scored: Scored[]): Band[] {
  const out: Band[] = [];
  for (const setting of ['easy', 'normal'] as const) {
    const worlds = [...new Set(scored.filter((s) => s.setting === setting).map((s) => s.world))].sort((a, b) => a - b);
    for (const world of worlds) {
      const mine = scored.filter((s) => s.setting === setting && s.world === world);
      const v = mine.map((s) => s.score);
      out.push({ world, setting, n: v.length, min: Math.min(...v), max: Math.max(...v), mid: Math.round(median(v) * 10) / 10, ids: mine.map((s) => s.id) });
    }
  }
  return out;
}

const SET = (s: Setting) => (s === 'easy' ? 'Easy' : 'Normal');
/** the stage's number within its world ("2-8" is 8), for the ramp check */
const stageNo = (id: string) => Number(id.split('-')[1]);

/** §1b's flags from the bands */
export function bandFlags(scored: Scored[], bands: Band[]): BandFlag[] {
  const f: BandFlag[] = [];
  const ref = 'STAGE-RULES §1b; GEMINI-LEDGER F2';
  for (const setting of ['easy', 'normal'] as const) {
    const mine = bands.filter((b) => b.setting === setting);
    const at = (w: number) => mine.find((b) => b.world === w);
    for (const b of mine) {
      const prev = at(b.world - 1);
      if (prev && b.mid <= prev.mid) f.push({ sev: 60 + Math.min(20, prev.mid - b.mid), kind: 'world-below', id: null, world: b.world, setting, ref, what: `World ${b.world}'s band (middle ${b.mid}) sits ${b.mid === prev.mid ? 'level with' : 'below'} World ${prev.world}'s (middle ${prev.mid}) on ${SET(setting)}: the climb goes backwards` });
    }
    for (const s of scored.filter((x) => x.setting === setting)) {
      const next = at(s.world + 1), prev = at(s.world - 1);
      if (next && s.score > next.mid) f.push({ sev: 40 + Math.min(20, s.score - next.mid), kind: 'above-next', id: s.id, world: s.world, setting, ref, what: `${s.id} scores ${s.score} on ${SET(setting)}, above World ${next.world}'s middle (${next.mid}): as hard as a World ${next.world} stage` });
      if (prev && s.score < prev.mid) f.push({ sev: 35 + Math.min(20, prev.mid - s.score), kind: 'below-prev', id: s.id, world: s.world, setting, ref, what: `${s.id} scores ${s.score} on ${SET(setting)}, below World ${prev.world}'s middle (${prev.mid}): easier than a World ${prev.world} stage` });
    }
    // Gemini Part 3: a world's first stage drops a little below the end of the one before (a note, not a bug)
    for (const b of mine) {
      const prev = at(b.world - 1);
      if (!prev) continue;
      const first = scored.filter((s) => s.setting === setting && s.world === b.world).sort((p, q) => stageNo(p.id) - stageNo(q.id))[0];
      const last = scored.filter((s) => s.setting === setting && s.world === prev.world).sort((p, q) => stageNo(q.id) - stageNo(p.id))[0];
      if (first && last && first.score > last.score + 5) f.push({ sev: 8, kind: 'ramp', id: first.id, world: b.world, setting, ref: 'GEMINI-LEDGER F2 (Part 3 §1)', what: `${first.id} (${first.score}) starts World ${b.world} harder than ${last.id} (${last.score}) ends World ${prev.world}; Gemini drops a world's first stage a little below the last one` });
    }
  }
  return f.sort((a, b) => b.sev - a.sev);
}

/** Gemini's floors per jump: the Normal bot 70% (Worlds 1-5) / 50% (6-10), the Easy kid 85% */
export const floorFor = (setting: Setting, world: number) => (setting === 'easy' ? 0.85 : world <= 5 ? 0.7 : 0.5);

/**
 * The floors are judged on the noisy bots (the inspector's 20-odd tries per jump, as the research flies them). The first-timer's own
 * survival per edge is not: he retries an edge he cannot do until he is rescued past it, so most stages show an edge at 0% there; its
 * survival gate is reported in the first-timer section.
 */
export function floorFlags(inputs: BandInput[]): BandFlag[] {
  const f: BandFlag[] = [];
  for (const i of inputs) {
    const floor = floorFor(i.setting, i.world);
    const below = i.jumpRates.filter((r) => r < floor);
    if (!below.length) continue;
    const worst = Math.min(...below);
    const pct = (v: number) => `${Math.round(v * 100)}%`;
    f.push({ sev: 30 + Math.round(30 * (floor - worst)), kind: 'floor', id: i.id, world: i.world, setting: i.setting, ref: 'STAGE-RULES §1b and §2 Hotspots; Gemini Part 2 §8; GEMINI-LEDGER F3/F5', what: `${i.id} on ${SET(i.setting)}: ${below.length} jump${below.length === 1 ? '' : 's'} the ${i.setting === 'easy' ? 'kid' : 'adult'} bot makes under ${pct(floor)}, the worst ${pct(worst)} (floor ${pct(floor)})` });
  }
  return f.sort((a, b) => b.sev - a.sev);
}

/** one stage's first-timer numbers on one setting */
export function ftNumbers(st: FTStage | undefined): Pick<BandInput, 'livesPerMin' | 'peakStress' | 'minWindowMs' | 'survivalMin' | 'tightShare' | 'restartsPerMin'> {
  if (!st) return { livesPerMin: null, peakStress: null, minWindowMs: null, survivalMin: null, tightShare: null, restartsPerMin: null };
  const lives = st.runs.reduce((s, r) => s + r.harms.filter((h) => h.kind === 'life').length, 0);
  const mins = st.runs.reduce((s, r) => s + r.time, 0) / 60;
  const hits = st.runs.reduce((s, r) => s + r.harms.filter((h) => h.kind === 'hit').length, 0);
  const loops = st.runs.reduce((s, r) => s + r.loops.reduce((a, l) => a + l.n, 0), 0);
  const gate = st.gates.window.gate;
  const ws = st.windows ?? [];
  return {
    livesPerMin: Math.round((lives / Math.max(0.25, mins)) * 100) / 100,
    peakStress: st.gates.stress.peak,
    minWindowMs: st.gates.window.min?.ms ?? null,
    survivalMin: st.gates.survival.min,
    tightShare: ws.length ? Math.round((ws.filter((w) => w.ms < 2 * gate).length / ws.length) * 100) / 100 : null,
    restartsPerMin: Math.round(((hits + loops) / Math.max(0.25, mins)) * 100) / 100,
  };
}
/** timed hazards and animals met a minute on the inspector's route (its Z and C beats) */
export const hazardsPerMin = (r: Pick<StageReport, 'beats' | 'time'>): number =>
  Math.round((r.beats.filter((b) => b.letter === 'Z' || b.letter === 'C').reduce((s, b) => s + b.count, 0) / Math.max(0.5, r.time.inspector / 60)) * 100) / 100;

export interface BandsOutput {
  /** whether the first-timer's numbers went in (without them the score is the inspector's alone) */
  firstTimer: boolean;
  inputs: BandInput[];
  scored: Scored[];
  bands: Band[];
  flags: BandFlag[];
}

/** the inspector's reports (and the first-timer pass when it ran) to bands and flags */
export function computeBands(reports: StageReport[], ft?: FirstTimerPass): BandsOutput {
  const inputs: BandInput[] = [];
  for (const r of reports) {
    // (Dot's flight and Meeca's stage are their own kind of stage: not on the climb)
    if (!/^\d+-\d+$/.test(r.id)) continue;
    const f = ft?.stages.find((s) => s.id === r.id);
    const rates = (list: StageReport['jumps']['normal']) => list.filter((j) => j.rate !== null && !j.unflyable).map((j) => j.rate!);
    // (the timing pressure counts only with the first-timer's numbers: without them the score stays the inspector's own parts)
    const hz = f ? hazardsPerMin(r) : null;
    inputs.push({ id: r.id, world: r.world, setting: 'normal', time: r.time.inspector, deadShare: r.dead.normal.total / Math.max(1, r.time.inspector), jumpRates: rates(r.jumps.normal), ...ftNumbers(f?.normal), hazardsPerMin: hz });
    inputs.push({ id: r.id, world: r.world, setting: 'easy', time: r.dead.easy.time, deadShare: r.dead.easy.total / Math.max(1, r.dead.easy.time), jumpRates: rates(r.jumps.easy), ...ftNumbers(f?.easy), hazardsPerMin: hz });
  }
  const scored: Scored[] = inputs.map((i) => ({ id: i.id, world: i.world, setting: i.setting, ...stageScore(i) }));
  const bands = worldBands(scored);
  return { firstTimer: !!ft, inputs, scored, bands, flags: [...bandFlags(scored, bands), ...floorFlags(inputs)].sort((a, b) => b.sev - a.sev) };
}

// ───────────────────────────── the report's part ─────────────────────────────

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The band chart: one column per world, Easy (hollow, orange) and Normal (filled, blue) side by side, a dot per stage, the band (the
 * world's spread) as a pale bar and its middle as a line. Stages out of band carry their id. Sized for a phone (360 wide).
 */
export function bandChart(b: BandsOutput): string {
  const worlds = [...new Set(b.bands.map((x) => x.world))].sort((p, q) => p - q);
  if (!worlds.length) return '';
  const W = 360, H = 270, L = 30, R = 6, T = 10, B = 30;
  const top = Math.max(50, Math.ceil(Math.max(...b.scored.map((s) => s.score)) / 10) * 10);
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const cw = (W - L - R) / worlds.length;
  const out = new Set(b.flags.filter((f) => f.kind === 'above-next' || f.kind === 'below-prev').map((f) => `${f.id}|${f.setting}`));
  let g = '';
  for (let v = 0; v <= top; v += 10) g += `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 5}" y="${(y(v) + 3.5).toFixed(1)}" text-anchor="end" class="bt">${v}</text>`;
  let marks = '';
  worlds.forEach((w, k) => {
    const x0 = L + k * cw;
    if (k) marks += `<line x1="${x0.toFixed(1)}" x2="${x0.toFixed(1)}" y1="${T}" y2="${H - B}" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"/>`;
    marks += `<text x="${(x0 + cw / 2).toFixed(1)}" y="${H - B + 14}" text-anchor="middle" class="bw">World ${w}</text><text x="${(x0 + cw * 0.3).toFixed(1)}" y="${H - B + 26}" text-anchor="middle" class="bt">E</text><text x="${(x0 + cw * 0.7).toFixed(1)}" y="${H - B + 26}" text-anchor="middle" class="bt">N</text>`;
    for (const setting of ['easy', 'normal'] as const) {
      const band = b.bands.find((q) => q.world === w && q.setting === setting);
      if (!band) continue;
      const cx = x0 + cw * (setting === 'easy' ? 0.3 : 0.7);
      const col = setting === 'easy' ? 'var(--se)' : 'var(--sn)';
      marks += `<rect x="${(cx - 7).toFixed(1)}" y="${y(band.max).toFixed(1)}" width="14" height="${Math.max(2, y(band.min) - y(band.max)).toFixed(1)}" rx="4" fill="${col}" fill-opacity="0.16"><title>World ${w} ${SET(setting)}: band ${band.min}-${band.max}, middle ${band.mid}</title></rect>`;
      marks += `<line x1="${(cx - 10).toFixed(1)}" x2="${(cx + 10).toFixed(1)}" y1="${y(band.mid).toFixed(1)}" y2="${y(band.mid).toFixed(1)}" stroke="${col}" stroke-width="2"/>`;
      const mine = b.scored.filter((s) => s.world === w && s.setting === setting).sort((p, q) => stageNo(p.id) - stageNo(q.id));
      // (an out-of-band dot gets a ring; its id is written beside it unless another label already sits within 10 px of that height)
      const placed: number[] = [];
      for (const s of [...mine].sort((p, q) => q.score - p.score)) {
        const n = stageNo(s.id);
        const dx = ((Math.min(10, n) - 1) / 9 - 0.5) * Math.min(22, cw * 0.32);
        const px = cx + dx, py = y(s.score);
        const flagged = out.has(`${s.id}|${setting}`);
        const tip = `<title>${s.id} ${SET(setting)}: ${s.score}${flagged ? ' (out of band)' : ''}</title>`;
        marks += setting === 'easy'
          ? `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="var(--panel)" stroke="${col}" stroke-width="2">${tip}</circle>`
          : `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" fill="${col}" stroke="var(--panel)" stroke-width="1.5">${tip}</circle>`;
        if (!flagged) continue;
        marks += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7" fill="none" stroke="var(--fg)" stroke-width="1"/>`;
        if (placed.some((q) => Math.abs(q - py) < 10)) continue;
        placed.push(py);
        marks += `<text x="${(setting === 'easy' ? cx - 14 : cx + 14).toFixed(1)}" y="${(py + 3).toFixed(1)}" text-anchor="${setting === 'easy' ? 'end' : 'start'}" class="bl">${esc(s.id)}</text>`;
      }
    }
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="bands" role="img" aria-label="Difficulty score of every stage, one column per world, Easy and Normal, with each world's band"><style>.bt{font:10px var(--body);fill:var(--muted)}.bw{font:700 11px var(--body);fill:var(--fg)}.bl{font:700 9.5px var(--body);fill:var(--fg)}</style>${g}${marks}</svg>`;
}

/** the report's section: the chart, the flags worst first, and the bands as a table */
export function renderBands(b: BandsOutput | undefined): string {
  if (!b || !b.scored.length) return '';
  const worlds = [...new Set(b.bands.map((x) => x.world))].sort((p, q) => p - q);
  const band = (w: number, s: Setting) => b.bands.find((q) => q.world === w && q.setting === s);
  const cell = (x: Band | undefined) => (x ? `${x.min}-${x.max} <span class="muted">(middle ${x.mid})</span>` : 'n/a');
  const list = (w: number, s: Setting) => b.scored.filter((q) => q.world === w && q.setting === s).sort((p, q) => stageNo(p.id) - stageNo(q.id)).map((q) => `${q.id.split('-')[1]}: ${Math.round(q.score)}`).join(', ');
  const rows = worlds.map((w) => `<tr><td>World ${w}</td><td class="num">${cell(band(w, 'easy'))}</td><td class="num">${cell(band(w, 'normal'))}</td><td class="small">Easy ${list(w, 'easy')}<br>Normal ${list(w, 'normal')}</td></tr>`).join('');
  const flags = b.flags.slice(0, 30).map((f) => `<tr><td>${f.id ? `<a href="#s${f.id}">${f.id}</a>` : `World ${f.world}`}</td><td>${SET(f.setting)}</td><td class="small">${esc(f.what)}</td><td class="small muted">${esc(f.ref)}</td></tr>`).join('');
  const partList = (Object.entries(PARTS) as Array<[PartId, { w: number; name: string }]>).map(([, p]) => `${p.name} ${Math.round(p.w * 100)}%`).join(', ');
  return `<section>
  <h2>Difficulty bands: does the game get harder?</h2>
  <p class="small muted">A score from 0 (gentle) to 100 for every stage on each setting, from ${partList}${b.firstTimer ? '' : ' (this run had no first-timer pass, so only the inspector\'s parts count: run with --firsttimer)'}. Each setting is scored with its own player (the kid's thumb on Easy, the adult's on Normal), so an Easy dot above a Normal one means Easy is harder for a kid than Normal is for an adult. Each world's band is the spread of its stages. STAGE-RULES §1b: the bands climb world by world; no stage sits above the next world's middle or below the previous world's.</p>
  <div class="panel">
    <div class="legend"><span><svg width="12" height="12" viewBox="0 0 12 12" style="vertical-align:middle"><circle cx="6" cy="6" r="4.5" fill="var(--sn)"/></svg> Normal</span><span><svg width="12" height="12" viewBox="0 0 12 12" style="vertical-align:middle"><circle cx="6" cy="6" r="4" fill="none" stroke="var(--se)" stroke-width="2"/></svg> Easy</span><span class="muted">Pale bar: the world's band; line: its middle; a ringed dot is out of band (named where there is room; hover a dot for its stage and score). Dots run stage 1 to 10, left to right.</span></div>
    ${bandChart(b)}
  </div>
  <div class="panel tw"><table><thead><tr><th>Stage</th><th>Setting</th><th>What</th><th>Rule</th></tr></thead><tbody>${flags || '<tr><td colspan="4">Every world above the last, every stage in its band, every floor met.</td></tr>'}</tbody></table></div>
  <details class="panel"><summary>The bands as a table</summary><div class="tw"><table><thead><tr><th>World</th><th class="num">Easy band</th><th class="num">Normal band</th><th>Stages</th></tr></thead><tbody>${rows}</tbody></table></div></details>
</section>`;
}
