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
import { botRun, branchOutrun, chaseOutrun, eagleOutrun, CHASE_CLOSE, type BotRecord, type BranchVerdict, type EagleVerdict } from './play.ts';
import { edgesOf } from '../inspect/firsttimer.ts';
import { MECHS } from './mechanics.ts';

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
  const runs = nb.flatMap((b) => b.v);
  const outrun = runs.filter((r) => r.outrun);
  if (outrun.length) out.push({ rule: 'branches outrun', what: `${outrun.length} of ${runs.length} runs of breaking branches crossed by just holding right, none giving way under him (layouts 1-${PLAY}, Normal)`, x: Math.round(outrun[0].run.x0), source: 'PLAN-TO-80 A.2, STAGE-RULES §0.2' });
  for (const e of o.eagle.filter((q) => q.setting === 'normal' && q.layout === 1 && !q.portrait)) {
    const z = e.v.zones.filter((q) => q.outrun);
    if (z.length) out.push({ rule: 'eagle outrun', what: `${z.length} of ${e.v.zones.length} watched stretches crossed unhurt by just holding right, never hiding (layout 1, sideways, 6 starts in its rhythm)`, x: z[0].x0, source: 'PLAN-TO-80 A.2, research §6' });
  }
  const chaseRuns = o.bots.filter((b) => b.setting === 'normal' && b.r.met.chaseMinGap !== null && played(b.r));
  if (chaseRuns.length && chaseRuns.every((b) => b.r.met.chaseCaught === 0 && (b.r.met.chaseMinGap ?? 0) > CHASE_CLOSE)) {
    out.push({ rule: 'chase outrun', what: `the collapsing branch never came within ${CHASE_CLOSE} px of a first-timer who keeps going (closest ${Math.min(...chaseRuns.map((b) => b.r.met.chaseMinGap!))} px over ${chaseRuns.length} runs)`, source: 'PLAN-TO-80 A.2, STAGE-RULES §0.2' });
  }
  for (const portrait of [false, true]) {
    const js = o.bots.filter((b) => b.setting === 'normal' && b.portrait === portrait && played(b.r)).flatMap((b) => b.r.jumps);
    const unseen = js.filter((j) => !j.inView);
    if (unseen.length) out.push({ rule: 'landing unseen', what: `${unseen.length} of ${js.length} running jumps took off with the landing's near edge off screen (${portrait ? 'upright' : 'sideways'})`, x: unseen[0].x, source: 'research §1 (landing in view at take-off)' });
  }
  if (o.clumsy) {
    const ok = o.clumsy.runs.filter(played);
    const edges = edgesOf(ok.flatMap((r) => r.run.tries ?? []).filter((t) => t.running)).filter((e) => e.tries >= 5);
    const low = edges.filter((e) => e.sr < CLUMSY_FLOOR);
    for (const e of low.slice(0, 5)) out.push({ rule: 'clumsy thumb', what: `a jump the clumsy thumb makes ${Math.round(e.sr * 100)}% of the time (${e.ok}/${e.tries}; floor 70%)`, x: e.x, source: 'research §1, STAGE-RULES §1b (70% floor, Worlds 1-5)' });
  }
  return out;
}

const FAMILIES = ['variety', 'repeats', 'dead walking', 'pacing', 'a miss costs', 'padding', 'tempo', 'something new', 'hazards matter', 'fair and seen'] as const;
type Family = (typeof FAMILIES)[number];
/** the validator's score, 0-100: ten families of checks at 10 points each (a measuring stick, not a fun rating; the page says how each
 *  family is scored) */
function score(ev: StageEval, pf: Flag[]): Record<Family, number> {
  const f = (rule: string) => ev.flags.filter((x) => x.rule === rule).length;
  const sim = Math.max(0, ...[...ev.flags.filter((x) => /like the stage before|like an earlier/.test(x.rule))].map((x) => Number(/(\d+)%/.exec(x.what)?.[1] ?? 0) / 100));
  const late = ev.costs.nothing + ev.costs.setback + ev.costs.life;
  const nothing = late ? ev.costs.nothing / late : 1;
  const adds = (ev as StageEval & { adds?: { moves: string[]; pairs: string[]; grams: number } }).adds;
  const haz = pf.filter((x) => /outrun/.test(x.rule)).length;
  const hasHaz = ev.mech.breaking + ev.mech.eagle + ev.mech.chase > 0;
  const fair = pf.filter((x) => x.rule === 'clumsy thumb').length * 2 + pf.filter((x) => x.rule === 'landing unseen').length * 2 + f('enemy by a landing');
  // (the bot's checks need runs it really played: with none, the family is not judged and sits at a neutral 5, and the page says so)
  const judgedPlay = (play[ev.id]?.bots ?? []).some((b) => b.setting === 'normal' && played(b.r));
  const clamp = (v: number) => Math.max(0, Math.min(10, Math.round(v * 10) / 10));
  return {
    variety: clamp(sim <= 0.45 ? 10 : 10 - ((sim - 0.45) / 0.55) * 10), // (1-1 has no stage before it: 10)
    repeats: clamp(10 - 2 * f('repeat')),
    'dead walking': clamp(10 - f('dead walk')),
    pacing: clamp(10 - 2.5 * f('pacing')),
    'a miss costs': clamp(nothing <= 0.8 ? 10 : ((1 - nothing) / 0.2) * 10),
    padding: clamp(10 - (ev.padding && ev.padding.finishShare >= 0.5 ? 5 : 0) - 2.5 * (ev.padding?.repeats.length ?? 0)),
    tempo: clamp(ev.tempo.hurry && ev.tempo.patience ? 10 : ev.tempo.hurry || ev.tempo.patience ? 5 : 0),
    'something new': clamp(!adds || adds.moves.length || adds.pairs.length ? 10 : adds.grams > 5 ? 3 : 0),
    'hazards matter': clamp(!hasHaz ? 5 : 10 - 5 * haz),
    'fair and seen': judgedPlay ? clamp(10 - fair) : clamp(5 - f('enemy by a landing')),
  };
}

// ---------------------------------------------------------------------------------------------------------------------------------
// 4. pages

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const COLORS: Record<string, string> = { J: '#c2410c', j: '#fdba74', Q: '#a8a29e', V: '#15803d', C: '#4d7c0f', R: '#65a30d', B: '#b91c1c', W: '#0369a1', S: '#7c3aed', P: '#a16207', M: '#db2777', F: '#9f1239', E: '#1e3a8a', D: '#374151', X: '#0e7490', Z: '#6b7280' };
const moveSpan = (str: string) => [...str].map((m) => `<span class="m" style="background:${COLORS[m] ?? '#999'}" title="${esc(MOVE_NAMES[m as Move] ?? m)}">${m}</span>`).join('');
const PACE_COLOR: Record<string, string> = { I: '#93c5fd', F: '#86efac', P: '#fde68a', T: '#f87171', R: '#e5e7eb' };
const stripSpan = (s: string) => [...s].map((t) => `<span class="p" style="background:${PACE_COLOR[t]}">${t}</span>`).join('');
const CSS = `
:root{--bg:#fbfaf7;--fg:#1f2937;--mut:#6b7280;--card:#fff;--line:#e5e7eb;--bad:#b91c1c;--ok:#15803d}
@media (prefers-color-scheme: dark){:root{--bg:#111827;--fg:#e5e7eb;--mut:#9ca3af;--card:#1f2937;--line:#374151;--bad:#f87171;--ok:#4ade80}}
body{background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif;margin:0;padding:16px;max-width:980px;margin:auto}
h1{font-size:22px;margin:4px 0}h2{font-size:17px;margin:22px 0 6px}.mut{color:var(--mut)}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:10px 0}
.m{display:inline-block;min-width:13px;text-align:center;color:#fff;font:600 12px/18px ui-monospace,monospace;margin:1px;border-radius:3px;padding:0 1px}
.p{display:inline-block;width:14px;text-align:center;font:600 11px/18px ui-monospace,monospace;color:#111;margin:0 1px 0 0;border-radius:2px}
.score{font-size:40px;font-weight:700}.bar{height:10px;background:var(--line);border-radius:5px;overflow:hidden}.bar>i{display:block;height:100%}
table{border-collapse:collapse;width:100%;font-size:14px}td,th{border-bottom:1px solid var(--line);padding:4px 6px;text-align:left;vertical-align:top}
.flag{border-left:4px solid var(--bad);padding:4px 10px;margin:6px 0}.src{font-size:12px;color:var(--mut)}
.grid td{text-align:center;font-variant-numeric:tabular-nums}a{color:inherit}
`;

function page(id: string, base: string, sc: Record<Family, number>, pf: Flag[]): string {
  const spec = stageSpec(1, Number(id.split('-')[1]));
  const ev = per[id].normal[0];
  const total = Math.round(FAMILIES.reduce((a, k) => a + sc[k], 0));
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
  const fam = FAMILIES.map((k) => `<tr><td>${k}${k === 'fair and seen' && notJudged ? ' <b>(not judged: the bot never played it through)</b>' : ''}</td><td style="width:50%"><div class="bar"><i style="width:${sc[k] * 10}%;background:${sc[k] >= 7 ? 'var(--ok)' : sc[k] >= 4 ? '#d97706' : 'var(--bad)'}"></i></div></td><td>${sc[k]}</td></tr>`).join('');
  const branch = (o?.branches ?? []).map((b) => `<tr><td>layout ${b.layout} ${b.setting}</td><td>${b.v.map((r) => `${Math.round(r.run.x0)}-${Math.round(r.run.x1)}: ${r.run.ids.length} pieces, ${r.underHim} gave way under him${r.fell ? ', he fell' : ''} → <b>${r.outrun ? 'outrun' : 'bites'}</b>${r.note ? ` (${esc(r.note)})` : ''}`).join('<br>')}</td></tr>`).join('');
  const eagle = (o?.eagle ?? []).filter((e) => e.setting === 'normal').map((e) => `<tr><td>layout ${e.layout} ${e.portrait ? 'upright' : 'sideways'}</td><td>${e.v.zones.map((z) => `${z.x0}-${z.x1}: ${z.unhurt}/${z.ran} unhurt, ${z.hits} hits → <b>${z.outrun ? 'outrun' : 'bites'}</b>`).join('<br>')}<div class="mut">${e.v.skips} skips past things holding right can't do</div></td></tr>`).join('');
  const botRows = (o?.bots ?? []).map((b) => `<tr><td>layout ${b.layout} ${b.setting}${b.portrait ? ' upright' : ''} t${b.trial}</td><td>${b.r.run.end} at ${b.r.run.time} s</td><td>${b.r.run.goal ? `${b.r.run.goal.got}/${b.r.run.goal.need}` : '-'}</td><td>${b.r.run.rescues}</td><td>${played(b.r) ? 'yes' : '<b>no</b>'}</td><td>${b.r.jumps.filter((j) => !j.inView).length}/${b.r.jumps.length}</td></tr>`).join('');
  const clumsy = o?.clumsy ? (() => {
    const ok = o.clumsy!.runs.filter(played);
    const edges = edgesOf(ok.flatMap((r) => r.run.tries ?? []).filter((t) => t.running)).filter((e) => e.tries >= 5).sort((a, b) => a.sr - b.sr);
    return `<p>${ok.length} of ${o.clumsy!.runs.length} clumsy runs played (layout 1, Normal). Jumps tried 5+ times: ${edges.length}; under 70%: ${edges.filter((e) => e.sr < CLUMSY_FLOOR).length}.</p>
      <table><tr><th>x</th><th>made</th><th>tries</th></tr>${edges.slice(0, 8).map((e) => `<tr><td>${e.x}</td><td>${Math.round(e.sr * 100)}%</td><td>${e.tries}</td></tr>`).join('')}</table>`;
  })() : '<p class="mut">not run</p>';
  const adds = (ev as StageEval & { adds?: { moves: string[]; pairs: string[]; grams: number } }).adds;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${id} validator</title><style>${CSS}</style></head><body>
<p class="mut"><a href="index.html">World 1 overview</a> · base ${esc(base)} · layout 1, Normal unless said</p>
<h1>${id} ${esc(spec?.name ?? '')}</h1>
<div class="card"><span class="score">${total}</span><span class="mut"> / 100 validator score</span>
<p class="mut">A measuring stick, not a fun rating: ten families of checks at 10 points each. Each family's rule is listed under "How it is scored".</p>
<table>${fam}</table></div>
<h2>What it asks, in order</h2>
<div class="card"><div>${moveSpan(ev.str)}</div><p class="mut">${ev.str.length} moves in ${ev.total} s on the goal route (holding right alone: ${ev.quick.length} moves). Letters: ${Object.entries(MOVE_NAMES).filter(([k]) => ev.str.includes(k)).map(([k, v]) => `<b>${k}</b> ${esc(v)}`).join(', ')}.</p>
<div>${stripSpan(ev.strip)}</div><p class="mut">Pacing, one letter per 5 s: I intro, F flow, P puzzle, T tight, R rest.</p></div>
<h2>Flags (${flags.length})</h2>
${flags.map((f) => `<div class="flag"><b>${esc(f.rule)}</b>: ${esc(f.what)}${f.x !== undefined ? ` <span class="mut">at x ${f.x}</span>` : ''}<div class="src">${esc(f.source)}</div></div>`).join('') || '<p>none</p>'}
<h2>Across the rolls</h2>
<div class="card"><table><tr><th>flag</th><th>Normal layouts hit (of ${LAYOUTS})</th><th>Easy layouts hit</th></tr>${[...rules].sort((a, b) => b[1].n - a[1].n).map(([r, c]) => `<tr><td>${esc(r)}</td><td>${c.n}</td><td>${c.e}</td></tr>`).join('')}</table></div>
<h2>What a miss costs (after the first 30 s)</h2>
<div class="card">${ev.costs.nothing} free retries, ${ev.costs.setback} setbacks, ${ev.costs.life} lives${ev.costs.unknown ? `; ${ev.costs.unknown} jumps the level check can't confirm, not priced` : ''}.</div>
<h2>Does each hazard matter?</h2>
<div class="card"><table>${branch || '<tr><td>No breaking branches.</td></tr>'}${eagle}${bots.some((b) => b.r.met.chaseMinGap !== null) ? `<tr><td>chase</td><td>closest the collapse came to the first-timer: ${bots.filter((b) => b.r.met.chaseMinGap !== null).map((b) => `${b.r.met.chaseMinGap} px (${b.setting})`).join(', ')}</td></tr>` : ''}</table></div>
<h2>The first-timer bot (fixed bot; rescues beside every number)</h2>
<div class="card">${notJudged ? `<p class="flag"><b>Not judged:</b> no Normal run ended at the shrine or the sealed door with 3 rescues or fewer, so the landing-in-view and clumsy-thumb numbers below are shown but not scored. Where the bot was put further on: ${esc([...new Set((o?.bots ?? []).flatMap((b) => (b.r.run.stuck ?? []).filter((q) => q.rescued).map((q) => `x ${q.x}`)))].slice(0, 8).join(', '))}.</p>` : ''}<table><tr><th>run</th><th>end</th><th>goal</th><th>rescues</th><th>counted</th><th>landings unseen</th></tr>${botRows}</table>
<p class="mut">Normal runs met: swung ${met('swung')}, climbed ${met('climbed')}, roped ${met('roped')}, bounced ${met('bounced')}, hid ${met('hid')}, fought ${met('fought')}, eagle hits ${met('eagleHits')}.</p></div>
<h2>The clumsy thumb</h2>
<div class="card">${clumsy}</div>
<h2>What it is made of</h2>
<div class="card"><table>${mechRows}</table><p class="mut">The six things (§0b.5): ${ev.six.join(', ')}; pairs ${ev.pairs.length}. New in World 1 order: ${adds ? `moves ${adds.moves.join(' ') || 'none'}, pairs ${adds.pairs.join(', ') || 'none'}, ${adds.grams} new 3-move runs` : '-'}.
Finish: ${ev.padding ? `${Math.round(ev.padding.finishShare * 100)}% of the stage, pieces ${esc(ev.padding.pieces.join(', '))}` : '-'}. Tempo: ${ev.tempo.hurry} hurry, ${ev.tempo.patience} patience beats. Animal-free route: ${Math.round(ev.enemies.freeShare * 100)}%.</p></div>
<h2>How it is scored</h2>
<div class="card mut"><ul>
<li>variety: 10 at 45% alike or less to the stage before or any earlier one, falling to 0 at 100% alike.</li>
<li>repeats: minus 2 per repeated 3-4 move run. dead walking: minus 1 per walk over 2.5 s. pacing: minus 2.5 per pacing flag.</li>
<li>a miss costs: 10 while at most 80% of beats are free retries, falling to 0 when all are. padding: minus 5 for a finish over half the stage, minus 2.5 per piece laid three times or more.</li>
<li>tempo: 10 for both hurry and patience, 5 for one, 0 for neither. something new: 10 for a new move or pairing, 3 for only new runs of old moves, 0 for nothing.</li>
<li>hazards matter: 5 with no hazard to read; else 10, minus 5 per hazard kind outrun. fair and seen: minus 2 per clumsy-thumb or unseen-landing flag, minus 1 per animal by a landing; when the bot never played the stage through, 5 (not judged) minus the animals.</li>
</ul></div>
</body></html>`;
}

const base = (() => {
  try {
    return execSync('git log --oneline -1').toString().trim().slice(0, 60);
  } catch {
    return '?';
  }
})();
fs.mkdirSync(OUT, { recursive: true });
const scores: Record<string, { total: number; sc: Record<Family, number>; flags: number }> = {};
for (const id of ONLY) {
  const pf = playFlags(id);
  const ev = per[id].normal[0];
  const sc = score(ev, pf);
  scores[id] = { total: Math.round(FAMILIES.reduce((a, k) => a + sc[k], 0)), sc, flags: ev.flags.length + pf.length };
  fs.writeFileSync(path.join(OUT, `${id}.html`), page(id, base, sc, pf));
  log(`wrote ${path.join(OUT, `${id}.html`)}: ${scores[id].total}/100, ${scores[id].flags} flags`);
}
fs.writeFileSync(path.join(OUT, 'world1.json'), JSON.stringify({ base, layouts: LAYOUTS, play: PLAY, scores, stages: Object.fromEntries(W1.map((id) => [id, per[id].normal.map((e) => ({ layout: e.layout, str: e.str, strip: e.strip, flags: e.flags, costs: { ...e.costs, beats: undefined }, padding: e.padding, tempo: e.tempo, mech: e.mech, six: e.six }))])) }, null, 1));
