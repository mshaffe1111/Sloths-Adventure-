/**
 * The fun validator on World 1 (fun-validator, PLAN-TO-80 Phase A.1): every check, every layout, one page per stage and an overview.
 *   npx tsx tools/validate/world1.ts [--stages 1-1,1-7] [--layouts 16] [--play 3] [--clumsy 20] [--out reference/qa-reports/validator]
 * Structure checks run on layouts 1..--layouts, Normal and Easy, with World 1 in order each time (similarity and "nothing new" need the
 * stages before). Play checks (the hold-right probes, the first-timer bot, the clumsy thumb) run on layouts 1..--play.
 * Writes <out>/<id>.html (one page per stage), <out>/index.html (the overview) and <out>/world1.json (every number).
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { stageSpec } from '../../src/game/stagePlan.ts';
import { MOVE_NAMES, type Move, type Setting } from './core.ts';
import { world, W1, type Flag, type StageEval } from './evaluate.ts';
import { botRun, towardShrine, branchOutrun, chaseOutrun, eagleOutrun, CHASE_CLOSE, type BotRecord, type BranchVerdict, type EagleVerdict } from './play.ts';
import { edgesOf } from '../inspect/firsttimer.ts';
import { MECHS } from './mechanics.ts';
import { deadKinds, hazardsScore, newScore, newThatCounts, type HazardKind, type HazardRead } from './score.ts';

const arg = (k: string, d: string) => {
  const i = process.argv.indexOf(k);
  return i >= 0 ? process.argv[i + 1] : d;
};
const ONLY = arg('--stages', W1.join(',')).split(',');
const LAYOUTS = Number(arg('--layouts', '16'));
const PLAY = Number(arg('--play', '3'));
const CLUMSY_N = Number(arg('--clumsy', '20'));
const OUT = arg('--out', 'reference/qa-reports/validator');
const log = (m: string) => process.stderr.write(m + '\n');

// ---------------------------------------------------------------------------------------------------------------------------------
// 1. structure, every layout, both settings, World 1 in order
const per: Record<string, { normal: StageEval[]; easy: StageEval[] }> = {};
for (const id of W1) per[id] = { normal: [], easy: [] };
for (let v = 1; v <= LAYOUTS; v++) {
  for (const setting of ['normal', 'easy'] as const) {
    for (const ev of world(v, setting)) per[ev.id][setting].push(ev);
  }
  log(`structure: layout ${v}/${LAYOUTS}`);
}

// ---------------------------------------------------------------------------------------------------------------------------------
// 2. play, on the first few layouts
interface PlayOut {
  branches: Array<{ layout: number; setting: Setting; v: BranchVerdict[] }>;
  eagle: Array<{ layout: number; setting: Setting; portrait: boolean; v: EagleVerdict }>;
  bots: Array<{ layout: number; setting: Setting; trial: number; portrait: boolean; r: BotRecord }>;
  clumsy: { layout: number; runs: BotRecord[] } | null;
}
const play: Record<string, PlayOut> = {};
for (const id of ONLY) {
  const o: PlayOut = { branches: [], eagle: [], bots: [], clumsy: null };
  for (let v = 1; v <= PLAY; v++) {
    for (const setting of ['normal', 'easy'] as const) {
      const b = branchOutrun(id, v, setting);
      if (b.length) o.branches.push({ layout: v, setting, v: b });
      for (const portrait of [false, true]) {
        const e = eagleOutrun(id, v, setting, portrait);
        if (e) o.eagle.push({ layout: v, setting, portrait, v: e });
      }
      for (let trial = 0; trial < 2; trial++) o.bots.push({ layout: v, setting, trial, portrait: false, r: botRun(id, v, setting, { trial }) });
      o.bots.push({ layout: v, setting, trial: 0, portrait: true, r: botRun(id, v, setting, { trial: 0, portrait: true }) });
    }
    log(`play ${id}: layout ${v}/${PLAY}`);
  }
  if (CLUMSY_N > 0) {
    const runs: BotRecord[] = [];
    for (let t = 0; t < CLUMSY_N; t++) runs.push(botRun(id, 1, 'normal', { trial: t, clumsy: true }));
    o.clumsy = { layout: 1, runs };
    log(`play ${id}: clumsy thumb x${CLUMSY_N}`);
  }
  play[id] = o;
}
void chaseOutrun;

// ---------------------------------------------------------------------------------------------------------------------------------
// 3. play flags and the score

/** a bot run counts as played when it ended at the shrine or the sealed door with at most 3 rescues (the supervisor: don't score a
 *  stage the bot didn't really play) */
const played = (r: BotRecord) => (r.run.end === 'shrine' || r.run.end === 'sealed door') && r.run.rescues <= 3;
export const CLUMSY_FLOOR = 0.7;

function playFlags(id: string): Flag[] {
  const o = play[id];
  if (!o) return [];
  const out: Flag[] = [];
  const nb = o.branches.filter((b) => b.setting === 'normal');
  const runs = nb.flatMap((b) => b.v).filter((r) => r.verdict !== 'not judged');
  const outrun = runs.filter((r) => r.outrun);
  if (outrun.length) out.push({ rule: 'branches outrun', what: `${outrun.length} of ${runs.length} judged runs of breaking branches crossed by just holding right, none giving way under him (layouts 1-${PLAY}, Normal)`, x: Math.round(outrun[0].run.x0), source: 'PLAN-TO-80 A.2, STAGE-RULES §0.2' });
  for (const e of o.eagle.filter((q) => q.setting === 'normal' && q.layout === 1 && !q.portrait)) {
    const z = e.v.zones.filter((q) => q.outrun);
    if (z.length) out.push({ rule: 'eagle outrun', what: `${z.length} of ${e.v.zones.length} watched stretches crossed unhurt by just holding right, never hiding (layout 1, sideways, 6 starts in its rhythm)`, x: z[0].x0, source: 'PLAN-TO-80 A.2, research §6' });
    // (where it hurts, was the hit warned: half a second of screech and shadow before the sweep, half a second from being found to the hit)
    const hl = e.v.zones.flatMap((q) => q.hitLeads.map((h) => ({ ...h, x0: q.x0 })));
    const cold = hl.filter((h) => !h.warned);
    if (cold.length) out.push({ rule: 'eagle unwarned', what: `${cold.length} of ${hl.length} eagle hits came without half a second of warning (screech and shadow ${cold[0].shadowFor} s before the sweep, ${cold[0].seen} s from being found to the hit${cold[0].inView ? '' : ', found off screen'})`, x: cold[0].x0, source: 'STAGE-RULES §0b.7, the quality supervisor 11-04 (warned: half a second, with a shadow)' });
  }
  const chaseRuns = o.bots.filter((b) => b.setting === 'normal' && b.r.met.chaseMinGap !== null && played(b.r));
  if (chaseRuns.length && chaseRuns.every((b) => b.r.met.chaseCaught === 0 && (b.r.met.chaseMinGap ?? 0) > CHASE_CLOSE)) {
    out.push({ rule: 'chase outrun', what: `the collapsing branch never came within ${CHASE_CLOSE} px of a first-timer who keeps going (closest ${Math.min(...chaseRuns.map((b) => b.r.met.chaseMinGap!))} px over ${chaseRuns.length} runs)`, source: 'PLAN-TO-80 A.2, STAGE-RULES §0.2' });
  }
  // (the chase's collapse on screen: the supervisor's clip showed the branch behind him whole while Dot says it breaks)
  for (const portrait of [false, true]) {
    const cr = o.bots.filter((b) => b.setting === 'normal' && b.portrait === portrait && b.r.met.chaseOnScreen !== null);
    if (cr.length) {
      const share = Math.max(...cr.map((b) => b.r.met.chaseOnScreen!));
      if (share < 0.2) out.push({ rule: 'hazard unseen', what: `the collapsing branch is on screen in at most ${Math.round(share * 100)}% of the chase's frames (${portrait ? 'upright' : 'sideways'}, ${cr.length} runs, the engine's own camera): the player never sees what chases him`, source: 'STAGE-RULES §0.2, §0b.7 (every hazard reads before it bites)' });
    }
  }
  for (const portrait of [false, true]) {
    const js = o.bots.filter((b) => b.setting === 'normal' && b.portrait === portrait && played(b.r)).flatMap((b) => b.r.jumps);
    const unseen = js.filter((j) => !j.inView);
    if (unseen.length) out.push({ rule: 'landing unseen', what: `${unseen.length} of ${js.length} running jumps took off with the landing's near edge off screen (${portrait ? 'upright' : 'sideways'})`, x: unseen[0].x, source: 'research §1 (landing in view at take-off)' });
  }
  if (o.clumsy) {
    const ok = o.clumsy.runs.filter(played);
    const edges = edgesOf(towardShrine(ok.flatMap((r) => r.run.tries ?? []).filter((t) => t.running), per[id].normal[0].built.stage.exitTotemX ?? Infinity).on).filter((e) => e.tries >= 5);
    const low = edges.filter((e) => e.sr < CLUMSY_FLOOR);
    for (const e of low.slice(0, 5)) out.push({ rule: 'clumsy thumb', what: `a jump the clumsy thumb makes ${Math.round(e.sr * 100)}% of the time (${e.ok}/${e.tries}; floor 70%)`, x: e.x, source: 'research §1, STAGE-RULES §1b (70% floor, Worlds 1-5)' });
  }
  return out;
}

const FAMILIES = ['variety', 'repeats', 'dead walking', 'pacing', 'a miss costs', 'padding', 'tempo', 'something new', 'hazards matter', 'fair and seen'] as const;
type Family = (typeof FAMILIES)[number];
/**
 * the validator's score, 0-100: ten families of checks at 10 points each (a measuring stick, not a fun rating). No free points (the
 * quality supervisor, 11-04): a stage with no hazard scores 0 on "hazards matter" (Matt's complaint is that nothing bites); a family that
 * could not be judged (the bot never played the stage through; "something new" on a world's first stage, its baseline) is left out of the
 * total, which is then scaled to 100, and the page names it. A world's first stage has no stage before it, so its variety is read inside
 * it: distinct moves (5 or more for full marks) and the longest run of one move.
 */
/**
 * each hazard kind on a stage and the share of its judged tries that bit (score.ts): the breaking branches by the hold-right runs on
 * every played layout (Normal), the eagle by its stretches on layout 1 sideways, the chase by the first-timer's runs (0 when its collapse
 * is outrun or unseen)
 */
function hazardReads(ev: StageEval, pf: Flag[]): { present: HazardKind[]; reads: HazardRead[] } {
  const o = play[ev.id];
  const present = (['breaking', 'eagle', 'chase'] as const).filter((k) => ev.mech[k] > 0);
  const reads: HazardRead[] = [];
  if (present.includes('breaking')) {
    const runs = (o?.branches ?? []).filter((b) => b.setting === 'normal').flatMap((b) => b.v).filter((r) => r.verdict !== 'not judged');
    reads.push({ kind: 'breaking', bite: runs.length ? runs.filter((r) => r.verdict === 'bites').length / runs.length : null });
  }
  if (present.includes('eagle')) {
    const e = (o?.eagle ?? []).find((q) => q.setting === 'normal' && q.layout === 1 && !q.portrait);
    const zs = (e?.v.zones ?? []).filter((z) => z.ran > 0);
    reads.push({ kind: 'eagle', bite: zs.length ? zs.filter((z) => !z.outrun).length / zs.length : null });
  }
  if (present.includes('chase')) {
    const judged = (o?.bots ?? []).some((b) => b.setting === 'normal' && b.r.met.chaseMinGap !== null && played(b.r));
    reads.push({ kind: 'chase', bite: pf.some((x) => x.rule === 'hazard unseen' || x.rule === 'chase outrun') ? 0 : judged ? 1 : null });
  }
  return { present: [...present], reads };
}

interface Score { sc: Record<Family, number | null>; total: number; out: Family[] }
function score(ev: StageEval, pf: Flag[]): Score {
  const f = (rule: string) => ev.flags.filter((x) => x.rule === rule).length;
  const sim = Math.max(0, ...[...ev.flags.filter((x) => /like the stage before|like an earlier/.test(x.rule))].map((x) => Number(/(\d+)%/.exec(x.what)?.[1] ?? 0) / 100));
  const late = ev.costs.nothing + ev.costs.setback + ev.costs.life;
  const nothing = late ? ev.costs.nothing / late : 1;
  const adds = (ev as StageEval & { adds?: { moves: string[]; pairs: string[]; grams: number } }).adds;
  const { present, reads } = hazardReads(ev, pf);
  const dead = deadKinds(reads);
  const fair = pf.filter((x) => x.rule === 'clumsy thumb').length * 2 + pf.filter((x) => x.rule === 'landing unseen').length * 2 + pf.filter((x) => x.rule === 'eagle unwarned').length * 2 + f('enemy by a landing');
  const judgedPlay = (play[ev.id]?.bots ?? []).some((b) => b.setting === 'normal' && played(b.r));
  const first = ev.id === W1[0];
  const clamp = (v: number) => Math.max(0, Math.min(10, Math.round(v * 10) / 10));
  const inside = () => {
    // (the same alphabet the similarity reads: every kind of jump is one move to a player)
    const str = ev.str.replace(/h/g, '').replace(/[jJUQ]/g, 'J');
    let longest = 0, run = 0;
    for (let i = 0; i < str.length; i++) longest = Math.max(longest, (run = i && str[i] === str[i - 1] ? run + 1 : 1));
    return 10 * Math.min(1, new Set(str).size / 5) * (1 - longest / Math.max(1, str.length));
  };
  const sc: Record<Family, number | null> = {
    variety: clamp(first ? inside() : sim <= 0.45 ? 10 : 10 - ((sim - 0.45) / 0.55) * 10),
    repeats: clamp(10 - 2 * f('repeat')),
    'dead walking': clamp(10 - f('dead walk')),
    pacing: clamp(10 - 2.5 * f('pacing')),
    'a miss costs': clamp(nothing <= 0.8 ? 10 : ((1 - nothing) / 0.2) * 10),
    padding: clamp(10 - (ev.padding && ev.padding.finishShare >= 0.5 ? 5 : 0) - 2.5 * (ev.padding?.repeats.length ?? 0)),
    tempo: clamp(ev.tempo.hurry && ev.tempo.patience ? 10 : ev.tempo.hurry || ev.tempo.patience ? 5 : 0),
    'something new': first ? null : newScore(adds, ev.quick, dead, present),
    'hazards matter': hazardsScore(present, reads),
    'fair and seen': judgedPlay ? clamp(10 - fair) : null,
  };
  const out = FAMILIES.filter((k) => sc[k] === null);
  const judged = FAMILIES.filter((k) => sc[k] !== null);
  const total = Math.round((judged.reduce((a, k) => a + (sc[k] as number), 0) / Math.max(1, judged.length * 10)) * 100);
  return { sc, total, out };
}

// ---------------------------------------------------------------------------------------------------------------------------------
// 4. pages

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const COLORS: Record<string, string> = { J: '#c2410c', j: '#fdba74', Q: '#a8a29e', U: '#ea580c', V: '#15803d', C: '#4d7c0f', R: '#65a30d', B: '#b91c1c', K: '#7f1d1d', W: '#0369a1', S: '#7c3aed', P: '#a16207', M: '#db2777', F: '#9f1239', E: '#1e3a8a', D: '#374151', X: '#0e7490', Z: '#6b7280' };
const moveSpan = (str: string) => [...str].map((m) => `<span class="m" style="background:${COLORS[m] ?? '#999'}" title="${esc(MOVE_NAMES[m as Move] ?? m)}">${m}</span>`).join('');
const PACE_COLOR: Record<string, string> = { I: '#93c5fd', F: '#86efac', P: '#fde68a', T: '#f87171', R: '#e5e7eb' };
const stripSpan = (s: string) => [...s].map((t) => `<span class="p" style="background:${PACE_COLOR[t]}">${t}</span>`).join('');
const CSS = `
:root{--bg:#fbfaf7;--fg:#1f2937;--mut:#6b7280;--card:#fff;--line:#e5e7eb;--bad:#b91c1c;--ok:#15803d}
@media (prefers-color-scheme: dark){:root{--bg:#111827;--fg:#e5e7eb;--mut:#9ca3af;--card:#1f2937;--line:#374151;--bad:#f87171;--ok:#4ade80}}
body{background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif;margin:0;padding:16px;max-width:980px;margin:auto}
h1{font-size:22px;margin:4px 0}h2{font-size:17px;margin:22px 0 6px}.mut{color:var(--mut)}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:10px 0;overflow-x:auto}
.m{display:inline-block;min-width:13px;text-align:center;color:#fff;font:600 12px/18px ui-monospace,monospace;margin:1px;border-radius:3px;padding:0 1px}
.p{display:inline-block;width:14px;text-align:center;font:600 11px/18px ui-monospace,monospace;color:#111;margin:0 1px 0 0;border-radius:2px}
.score{font-size:40px;font-weight:700}.bar{height:10px;background:var(--line);border-radius:5px;overflow:hidden}.bar>i{display:block;height:100%}
table{border-collapse:collapse;width:100%;font-size:14px}td,th{border-bottom:1px solid var(--line);padding:4px 6px;text-align:left;vertical-align:top}
.flag{border-left:4px solid var(--bad);padding:4px 10px;margin:6px 0}.src{font-size:12px;color:var(--mut)}
.grid td{text-align:center;font-variant-numeric:tabular-nums}.grid td:first-child{text-align:left}a{color:inherit}
.shots{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.shots img{height:220px;border-radius:6px;border:1px solid var(--line);max-width:100%;object-fit:contain}
`;

/**
 * What the goal adds, in plain words (the quality supervisor, 11-04: "Holding right alone asks X of Y" said nothing a reader could check).
 * It compares two routes the inspector traces: the goal route (through the goal's pickups, animals or cages) and the shortest way to the
 * shrine that skips the goal (eraRoll.ts pickRoute, quick). It is not a hold-right run; that is the hazards' probe (play.ts).
 */
function quickLine(ev: StageEval): string {
  const q = ev.quick.length, n = ev.str.length;
  if (q >= n) return `<b>The goal adds no moves:</b> the shortest way to the shrine makes ${q} moves, the goal route ${n} (${ev.total} s).`;
  return `<b>${n - q} of the ${n} moves are only for the goal.</b> A player who skips the goal and takes the shortest way to the shrine makes ${q}; the other ${n - q} are the goal's pickups, animals or cages (${Math.round(100 * (n - q) / n)}% of the stage's moves).`;
}

function page(id: string, base: string, score0: Score, pf: Flag[]): string {
  const sc = score0.sc;
  const spec = stageSpec(1, Number(id.split('-')[1]));
  const ev = per[id].normal[0];
  const total = score0.total;
  const flags = [...ev.flags, ...pf];
  // flags across layouts
  const rules = new Map<string, { n: number; e: number }>();
  for (const [s, list] of [['n', per[id].normal], ['e', per[id].easy]] as const) {
    for (const x of list) for (const r of new Set(x.flags.map((f) => f.rule))) {
      const c = rules.get(r) ?? { n: 0, e: 0 };
      c[s]++;
      rules.set(r, c);
    }
  }
  const o = play[id];
  const bots = (o?.bots ?? []).filter((b) => !b.portrait);
  const met = (k: keyof BotRecord['met']) => bots.filter((b) => b.setting === 'normal').map((b) => b.r.met[k]).join(' / ');
  const mechRows = MECHS.filter((m) => ev.mech[m.id] > 0).map((m) => `<tr><td>${esc(m.label)}</td><td>${ev.mech[m.id]}</td></tr>`).join('');
  const notJudged = !(o?.bots ?? []).some((b) => b.setting === 'normal' && played(b.r));
  const why: Partial<Record<Family, string>> = { 'fair and seen': 'not judged: the bot never played it through', 'something new': "the world's first stage: its baseline", 'hazards matter': 'not judged: no run of its hazards could be judged' };
  const fam = FAMILIES.map((k) => { const v = sc[k]; return v === null ? `<tr><td>${k} <b>(${why[k]}, left out of the total)</b></td><td style="width:50%"></td><td>-</td></tr>` : `<tr><td>${k}${k === 'variety' && id === W1[0] ? ' (inside the stage: distinct moves, longest run of one move)' : ''}${k === 'hazards matter' && ev.mech.breaking + ev.mech.eagle + ev.mech.chase === 0 ? ' (no hazard at all)' : ''}</td><td style="width:50%"><div class="bar"><i style="width:${v * 10}%;background:${v >= 7 ? 'var(--ok)' : v >= 4 ? '#d97706' : 'var(--bad)'}"></i></div></td><td>${v}</td></tr>`; }).join('');
  const branch = (o?.branches ?? []).map((b) => `<tr><td>layout ${b.layout} ${b.setting}</td><td>${b.v.map((r) => `${Math.round(r.run.x0)}-${Math.round(r.run.x1)}: ${r.run.ids.length} pieces, ${r.underHim} gave way under him${r.fell ? ', he fell' : ''} → <b>${r.verdict}</b>${r.note ? ` (${esc(r.note)})` : ''}`).join('<br>')}</td></tr>`).join('');
  const eagle = (o?.eagle ?? []).filter((e) => e.setting === 'normal').map((e) => `<tr><td>layout ${e.layout} ${e.portrait ? 'upright' : 'sideways'}</td><td>${e.v.zones.map((z) => `${z.x0}-${z.x1}: ${z.unhurt}/${z.ran} unhurt, ${z.hits} hits → <b>${z.outrun ? 'outrun' : 'bites'}</b>`).join('<br>')}<div class="mut">${e.v.skips} skips past things holding right can't do</div></td></tr>`).join('');
  const botRows = (o?.bots ?? []).map((b) => `<tr><td>layout ${b.layout} ${b.setting}${b.portrait ? ' upright' : ''} t${b.trial}</td><td>${b.r.run.end} at ${b.r.run.time} s</td><td>${b.r.run.goal ? `${b.r.run.goal.got}/${b.r.run.goal.need}` : '-'}</td><td>${b.r.run.rescues}</td><td>${played(b.r) ? 'yes' : '<b>no</b>'}</td><td>${b.r.jumps.filter((j) => !j.inView).length}/${b.r.jumps.length}</td></tr>`).join('');
  const clumsy = o?.clumsy ? (() => {
    const ok = o.clumsy!.runs.filter(played);
    const ts = towardShrine(ok.flatMap((r) => r.run.tries ?? []).filter((t) => t.running), ev.built.stage.exitTotemX ?? Infinity);
    const edges = edgesOf(ts.on).filter((e) => e.tries >= 5).sort((a, b) => a.sr - b.sr);
    return `<p>${ok.length} of ${o.clumsy!.runs.length} clumsy runs played (layout 1, Normal). Jumps toward the shrine tried 5+ times: ${edges.length}; under 70%: ${edges.filter((e) => e.sr < CLUMSY_FLOOR).length}. Left out: ${ts.back} hops back the way he came (the bot turning back counts a safe landing behind him as a miss; not a jump the stage asks).</p>
      <table><tr><th>x</th><th>made</th><th>tries</th></tr>${edges.slice(0, 8).map((e) => `<tr><td>${e.x}</td><td>${Math.round(e.sr * 100)}%</td><td>${e.tries}</td></tr>`).join('')}</table>`;
  })() : '<p class="mut">not run</p>';
  const adds = (ev as StageEval & { adds?: { moves: string[]; pairs: string[]; grams: number } }).adds;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${id} validator</title><style>${CSS}</style></head><body>
<p class="mut"><a href="index.html">World 1 overview</a> · base = ${esc(base)} · layout 1, Normal unless said</p>
<h1>${id} ${esc(spec?.name ?? '')}</h1>
<div class="card">${quickLine(ev)}</div>
${o?.clumsy && !o.clumsy.runs.some(played) ? `<div class="card flag"><b>The clumsy thumb is not running on this stage:</b> 0 of ${o.clumsy.runs.length} runs played through (the bot is put further on at spots it can't do: a measuring-tool defect, D15, raised with bot-fix). Its jump table below is empty, not passed.</div>` : ''}
<div class="card"><span class="score">${total}</span><span class="mut"> / 100 validator score${score0.out.length ? ` (out of ${FAMILIES.length - score0.out.length} families judged, scaled to 100; left out: ${score0.out.join(', ')})` : ''}</span>
<p class="mut">A measuring stick, not a fun rating: ten families of checks at 10 points each. Each family's rule is listed under "How it is scored".</p>
<table>${fam}</table></div>
<h2>What it asks, in order</h2>
<div class="card"><div>${moveSpan(ev.str)}</div><p class="mut">${ev.str.length} moves in ${ev.total} s on the goal route (the shortest way to the shrine, skipping the goal: ${ev.quick.length} moves). Letters: ${Object.entries(MOVE_NAMES).filter(([k]) => ev.str.includes(k)).map(([k, v]) => `<b>${k}</b> ${esc(v)}`).join(', ')}.</p>
<div>${stripSpan(ev.strip)}</div><p class="mut">Pacing, one letter per 5 s: I intro, F flow, P puzzle, T tight, R rest.</p></div>
<h2>Flags (${flags.length})</h2>
${flags.map((f, k) => `<div class="flag"><b>${esc(f.rule)}</b>: ${esc(f.what)}${f.x !== undefined ? ` <span class="mut">at x ${f.x}</span>` : ''}<div class="src">${esc(f.source)}</div>${f.x !== undefined ? `<div class="shots"><img loading="lazy" alt="upright at x ${f.x}" src="stills/${id}-f${k}-upright.jpg" onerror="this.remove()"><img loading="lazy" alt="sideways at x ${f.x}" src="stills/${id}-f${k}-sideways.jpg" onerror="this.remove()"></div>` : ''}</div>`).join('') || '<p>none</p>'}
<h2>Across the rolls</h2>
<div class="card"><table><tr><th>flag</th><th>Normal layouts hit (of ${LAYOUTS})</th><th>Easy layouts hit</th></tr>${[...rules].sort((a, b) => b[1].n - a[1].n).map(([r, c]) => `<tr><td>${esc(r)}</td><td>${c.n}</td><td>${c.e}</td></tr>`).join('')}</table></div>
<h2>What a miss costs (after the first 30 s)</h2>
<div class="card">${ev.costs.nothing} free retries, ${ev.costs.setback} setbacks, ${ev.costs.life} lives${ev.costs.unknown ? `; ${ev.costs.unknown} jumps the level check can't confirm, not priced` : ''}.</div>
<h2>Does each hazard matter?</h2>
<div class="card"><table>${branch || '<tr><td>No breaking branches.</td></tr>'}${eagle}${(o?.bots ?? []).some((b) => b.r.met.chaseMinGap !== null) ? `<tr><td>chase</td><td>${(o?.bots ?? []).filter((b) => b.r.met.chaseMinGap !== null).map((b) => `layout ${b.layout} ${b.setting}${b.portrait ? ' upright' : ' sideways'}: closest ${b.r.met.chaseMinGap} px, the collapse on screen ${Math.round((b.r.met.chaseOnScreen ?? 0) * 100)}% of its frames, ${b.r.run.rescues} rescues`).join('<br>')}<div class="mut">A negative gap: the bot was put back behind the front by a rescue. No still: placing Pokey stops the collapse, so a shot can't show it; the share comes from the run's own camera, frame by frame.</div></td></tr>` : ''}</table></div>
<h2>The first-timer bot (fixed bot; rescues beside every number)</h2>
<div class="card">${notJudged ? `<p class="flag"><b>Not judged:</b> no Normal run ended at the shrine or the sealed door with 3 rescues or fewer, so the landing-in-view and clumsy-thumb numbers below are shown but not scored. Where the bot was put further on: ${esc([...new Set((o?.bots ?? []).flatMap((b) => (b.r.run.stuck ?? []).filter((q) => q.rescued).map((q) => `x ${q.x}`)))].slice(0, 8).join(', '))}.</p>` : ''}<table><tr><th>run</th><th>end</th><th>goal</th><th>rescues</th><th>counted</th><th>landings unseen</th></tr>${botRows}</table>
<p class="mut">Normal runs met: swung ${met('swung')}, climbed ${met('climbed')}, roped ${met('roped')}, bounced ${met('bounced')}, hid ${met('hid')}, fought ${met('fought')}, eagle hits ${met('eagleHits')}.</p></div>
<h2>The clumsy thumb</h2>
<div class="card">${clumsy}</div>
<h2>What it is made of</h2>
<div class="card"><table>${mechRows}</table><p class="mut">The six things (§0b.5): ${ev.six.join(', ')}; pairs ${ev.pairs.length}. New in World 1 order: ${adds ? `moves ${adds.moves.join(' ') || 'none'}, pairs ${adds.pairs.join(', ') || 'none'}, ${adds.grams} new 3-move runs` : '-'}.${adds && id !== W1[0] ? (() => { const hr = hazardReads(ev, pf); const c = newThatCounts(adds, ev.quick, deadKinds(hr.reads), hr.present); return ` Of those, counted as new (the way to the shrine needs it, and a hazard bites): moves ${c.moves.join(' ') || 'none'}, pairs ${c.pairs.join(', ') || 'none'}.`; })() : ''}
Finish: ${ev.padding ? `${Math.round(ev.padding.finishShare * 100)}% of the stage, pieces ${esc(ev.padding.pieces.join(', '))}` : '-'}. Tempo: ${ev.tempo.hurry} hurry, ${ev.tempo.patience} patience beats. Animal-free route: ${Math.round(ev.enemies.freeShare * 100)}%.</p></div>
<h2>How it is scored</h2>
<div class="card mut"><ul>
<li>variety: 10 at 45% alike or less to the stage before or any earlier one, falling to 0 at 100% alike; alike is the more alike of its moves and its look (pieces and art), so a stage is only as fresh as its most repeated side.</li>
<li>repeats: minus 2 per repeated 3-4 move run. dead walking: minus 1 per walk over 2.5 s. pacing: minus 2.5 per pacing flag.</li>
<li>a miss costs: 10 while at most 80% of beats are free retries, falling to 0 when all are. padding: minus 5 for a finish over half the stage, minus 2.5 per piece laid three times or more.</li>
<li>tempo: 10 for both hurry and patience, 5 for one, 0 for neither. something new: 10 for a new move or pairing that counts (a move counts where the shortest way to the shrine needs it and, if a hazard, it bites; a pairing counts unless it is made of a hazard that never bites), 3 for only new runs of old moves, 0 for nothing.</li>
<li>hazards matter: 0 with no hazard at all; else 10 x the share of tries each hazard bites, averaged over its kinds (an outrun or unseen hazard bites on none). Breaking branches: their hold-right runs, Normal, every played layout ("not judged" runs left out). The eagle: its stretches, layout 1 sideways. The chase: 0 when outrun or unseen. fair and seen: minus 2 per clumsy-thumb, unseen-landing or unwarned-eagle flag, minus 1 per animal by a landing; left out when the bot never played the stage through.</li><li>variety on a world's first stage: 10 x (distinct moves / 5, at most 1) x (1 - its longest run of one move / its moves). something new: left out on a world's first stage.</li><li>The total: the judged families' points over their maximum, scaled to 100. No neutral points for an empty or unjudged family.</li>
</ul></div>
</body></html>`;
}

const base = (() => {
  try {
    const sh = (c: string) => execSync(c).toString().trim();
    const has = (r: string) => { try { execSync(`git merge-base --is-ancestor ${r} HEAD`); return true; } catch { return false; } };
    const parts = [['origin/main', sh('git rev-parse --short origin/main')], ['ccr-0d59a91c', sh('git rev-parse --short origin/ccr-0d59a91c-oy3imz')]].filter(([r]) => has(r === 'ccr-0d59a91c' ? 'origin/ccr-0d59a91c-oy3imz' : r));
    return `${sh('git rev-parse --short HEAD')} (contains ${parts.map(([r, c]) => `${r} ${c}`).join(' + ')})`;
  } catch {
    return '?';
  }
})();
fs.mkdirSync(OUT, { recursive: true });
const scores: Record<string, { total: number; sc: Record<Family, number | null>; flags: number; pageFlags: Flag[] }> = {};
for (const id of ONLY) {
  const pf = playFlags(id);
  const ev = per[id].normal[0];
  const s0 = score(ev, pf);
  scores[id] = { total: s0.total, sc: s0.sc, flags: ev.flags.length + pf.length, pageFlags: [...ev.flags, ...pf] };
  fs.writeFileSync(path.join(OUT, `${id}.html`), page(id, base, s0, pf));
  log(`wrote ${path.join(OUT, `${id}.html`)}: ${scores[id].total}/100, ${scores[id].flags} flags`);
}
const prevScores = (() => { try { return JSON.parse(fs.readFileSync(path.join(OUT, 'world1.json'), 'utf8')).scores ?? {}; } catch { return {}; } })();
fs.writeFileSync(path.join(OUT, 'world1.json'), JSON.stringify({ base, layouts: LAYOUTS, play: PLAY, scores: { ...prevScores, ...scores }, stages: Object.fromEntries(W1.map((id) => [id, per[id].normal.map((e) => ({ layout: e.layout, str: e.str, strip: e.strip, flags: e.flags, costs: { ...e.costs, beats: undefined }, padding: e.padding, tempo: e.tempo, mech: e.mech, six: e.six }))])) }, null, 1));

// ---------------------------------------------------------------------------------------------------------------------------------
// 5. the overview (World 1 in order), when every stage was run
if (W1.every((id) => ONLY.includes(id))) {
  const { cosine } = await import('./core.ts');
  const { strGrams } = await import('./evaluate.ts');
  const evs = W1.map((id) => per[id].normal[0]);
  const grid = `<table class="grid"><tr><th></th>${W1.map((id) => `<th>${id}</th>`).join('')}</tr>${evs.map((a) => `<tr><th>${a.id}</th>${evs.map((b) => {
    if (a === b) return '<td>-</td>';
    const c = cosine(strGrams(a), strGrams(b));
    return `<td style="background:${c > 0.55 ? 'rgba(185,28,28,.35)' : c > 0.45 ? 'rgba(217,119,6,.3)' : 'transparent'}">${Math.round(c * 100)}</td>`;
  }).join('')}</tr>`).join('')}</table>`;
  const { lookOf, lookAlike } = await import('./look.ts');
  const looks = evs.map((e) => lookOf(e.built.stage));
  const lookGrid = `<table class="grid"><tr><th></th>${W1.map((id) => `<th>${id}</th>`).join('')}</tr>${evs.map((a, i) => `<tr><th>${a.id}</th>${evs.map((b, k) => {
    if (i === k) return '<td>-</td>';
    const c = lookAlike(looks[i], looks[k]);
    return `<td style="background:${c > 0.55 ? 'rgba(185,28,28,.35)' : c > 0.45 ? 'rgba(217,119,6,.3)' : 'transparent'}">${Math.round(c * 100)}</td>`;
  }).join('')}</tr>`).join('')}</table>`;
  const allRules = [...new Set(W1.flatMap((id) => per[id].normal.flatMap((e) => e.flags.map((f) => f.rule))))];
  const ruleRows = allRules.map((r) => `<tr><td>${esc(r)}</td>${W1.map((id) => {
    const n = per[id].normal.filter((e) => e.flags.some((f) => f.rule === r)).length;
    return `<td style="background:${n > LAYOUTS / 2 ? 'rgba(185,28,28,.3)' : n ? 'rgba(217,119,6,.25)' : 'transparent'}">${n || ''}</td>`;
  }).join('')}</tr>`).join('');
  const famRows = FAMILIES.map((k) => `<tr><td>${k}</td>${W1.map((id) => `<td>${scores[id]?.sc[k] ?? '-'}</td>`).join('')}</tr>`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>World 1 validator</title><style>${CSS}</style></head><body>
<p class="mut">base ${esc(base)} · Normal · structure on layouts 1-${LAYOUTS}, play on layouts 1-${PLAY}</p>
<h1>World 1: the measuring stick's verdict</h1>
<div class="card"><table class="grid"><tr><th>stage</th>${W1.map((id) => `<th><a href="${id}.html">${id}</a></th>`).join('')}</tr>
<tr><td><b>validator score</b></td>${W1.map((id) => `<td><b>${scores[id]?.total ?? ''}</b></td>`).join('')}</tr>${famRows}</table>
<p><b>It measures structure, not delight.</b> Matt calls 1-1 the best of World 1; the validator ranks it ${[...W1].sort((a, b) => (scores[a]?.total ?? 0) - (scores[b]?.total ?? 0)).indexOf('1-1') + 1 === 2 ? 'second lowest' : `#${[...W1].sort((a, b) => (scores[b]?.total ?? 0) - (scores[a]?.total ?? 0)).indexOf('1-1') + 1} of 9`}. That is where the stick and the player disagree: a first stage's freshness, its look and its lessons are not in these checks. Read the flags for what to fix, not the score as how much fun it is.</p>
<p class="mut">A measuring stick, not a fun rating: ten families of checks at 10 points each (each stage's page says how). Average ${Math.round(W1.reduce((a, id) => a + (scores[id]?.total ?? 0), 0) / W1.length)}.</p></div>
<h2>How alike the stages play (move 3-grams, layout 1; % alike)</h2>
<div class="card">${grid}<p class="mut">Orange over 45% (too close for neighbours), red over 55% (too close for any two stages of a world): research §1, the quality supervisor.</p></div>
<h2>How alike the stages look (the builder's pieces and the art on the ground, layout 1; % alike)</h2>
<div class="card">${lookGrid}<p class="mut">What a player sees, beside what he does: the pieces each stage is built from (highrun, stumps, snakes, rest...), weighted by how much of the stage each spans, and every platform's kind and look (a mushroom, a branch, moss stone, a log), weighted by width; the two averaged (look.ts). 1-1, 1-5 and 1-7 are mostly the same mushroom-and-high-branches piece, whatever their move strings say. 1-8 is measured on the art the engine draws its chase with (the bough sections and the canopy crowns, which carry no style in the data): no other World 1 stage uses that art, so it reads 0-4% alike, as it looks on screen: a measured fact now, not a gap in the measure. Variety scores the more alike of this grid and the one above. Same colours as above.</p></div>
<h2>Each flag: on how many of the ${LAYOUTS} layouts (Normal)</h2>
<div class="card"><table class="grid"><tr><th>flag</th>${W1.map((id) => `<th>${id}</th>`).join('')}</tr>${ruleRows}</table></div>
<h2>What World 1 is made of</h2>
<div class="card"><p>The mechanics-in-use table (R-150.4): <a href="mechanics-world1.md">mechanics-world1.md</a>.</p></div>
</body></html>`;
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  log(`wrote ${path.join(OUT, 'index.html')}`);
}
