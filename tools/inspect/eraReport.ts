/**
 * The 200-roll tool's report (era.ts): one self-contained HTML page, made to be read on a phone. A world summary at the top, then one
 * card per stage: how alike its rolls are in plain words, two heat maps of the rolls, the rule checks of reference/STAGE-RULES.md §2 as
 * counts of rolls, and the worst rolls to replay (?layout=N).
 */
import type { EraOutput, StageSummary } from './era.ts';
import { HEAT } from './era.ts';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const pct = (n: number, of: number) => (of ? `${Math.round((100 * n) / of)}%` : '-');

/** the variety verdict in plain words */
export function varietyWords(div: number): { cls: 'good' | 'warn' | 'bad'; text: string } {
  const alike = Math.round((1 - div) * 100);
  if (div >= 0.35) return { cls: 'good', text: `Rolls are ${alike}% alike: replays feel different (meets the target)` };
  if (div >= 0.2) return { cls: 'warn', text: `Rolls are ${alike}% alike: some change, short of the target` };
  return { cls: 'bad', text: `Rolls are ${alike}% alike: replays will feel the same` };
}

/** a heat map as an SVG grid: rows bottom to top, a hover title on every cell */
function heat(grid: number[][], o: { x: string; y: string; xTicks: string[]; yTicks: string[]; cellTitle: (r: number, c: number, n: number) => string }) {
  const rows = grid.length, cols = grid[0].length;
  const cw = 26, ch = 20, left = 44, top = 6, bottom = 34;
  const W = left + cols * cw + 16, H = top + rows * ch + bottom;
  const max = Math.max(1, ...grid.flat());
  const step = (n: number) => (n === 0 ? 0 : Math.min(7, 1 + Math.floor((6 * Math.log(1 + n)) / Math.log(1 + max))));
  let cells = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const n = grid[r][c];
    const x = left + c * cw, y = top + (rows - 1 - r) * ch;
    cells += `<rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${ch - 2}" rx="3" class="h${step(n)}"><title>${esc(o.cellTitle(r, c, n))}</title></rect>`;
  }
  const xt = o.xTicks.map((t, i) => (t ? `<text x="${left + i * cw}" y="${top + rows * ch + 13}" class="tick" text-anchor="middle">${t}</text>` : '')).join('');
  const yt = o.yTicks.map((t, i) => (t ? `<text x="${left - 5}" y="${top + (rows - i) * ch + 4}" class="tick" text-anchor="end">${t}</text>` : '')).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="heat" role="img" aria-label="${esc(`${o.y} against ${o.x}`)}">${cells}${xt}${yt}
    <text x="${left + (cols * cw) / 2}" y="${H - 4}" class="axis" text-anchor="middle">${esc(o.x)}</text>
    <text x="10" y="${top + (rows * ch) / 2}" class="axis" text-anchor="middle" transform="rotate(-90 10 ${top + (rows * ch) / 2})">${esc(o.y)}</text></svg>`;
}

function shapeMap(s: StageSummary) {
  const t = (i: number, n: number, lo: number, step: number, f: (v: number) => string) => (i % 2 === 0 ? f(lo + i * step) : '');
  return heat(s.heat.linLen, {
    x: 'winding ← path → straight', y: 'risky ← → forgiving',
    xTicks: Array.from({ length: 11 }, (_, i) => t(i, 11, 0, 0.1, (v) => v.toFixed(1))),
    yTicks: Array.from({ length: 11 }, (_, i) => t(i, 11, -1, 0.2, (v) => v.toFixed(1))),
    cellTitle: (r, c, n) => `${n} roll(s): straightness ${(c / 10).toFixed(1)}-${((c + 1) / 10).toFixed(1)}, forgiveness ${(-1 + r * 0.2).toFixed(1)} to ${(-0.8 + r * 0.2).toFixed(1)}`,
  });
}
function timeMap(s: StageSummary) {
  const { lenLo, lenStep, lenBins, deadStep, deadBins } = HEAT;
  return heat(s.heat.lenDead, {
    x: 'length for a quick player', y: 'quiet seconds',
    xTicks: Array.from({ length: lenBins + 1 }, (_, i) => (i % 3 === 0 ? mmss(lenLo + i * lenStep) : '')),
    yTicks: Array.from({ length: deadBins + 1 }, (_, i) => (i % 2 === 0 ? `${i * deadStep}` : '')),
    cellTitle: (r, c, n) => `${n} roll(s): ${mmss(lenLo + c * lenStep)}-${mmss(lenLo + (c + 1) * lenStep)} long, ${r * deadStep}-${(r + 1) * deadStep} s quiet`,
  });
}

function rule(ok: boolean | null, name: string, detail: string) {
  const cls = ok === null ? 'na' : ok ? 'good' : 'bad';
  const mark = ok === null ? 'n/a' : ok ? 'OK' : 'NO';
  return `<li class="rule ${cls}"><span class="badge">${mark}</span><span><b>${esc(name)}</b><br><span class="sub">${detail}</span></span></li>`;
}

function card(s: StageSummary, R: EraOutput['rules'], rolls: number) {
  const v = varietyWords(s.diversity.cosine);
  const f = s.fails;
  const shortest = s.stats.quick.min;
  const climb = s.climb ? ' (a climb: 1:40)' : '';
  const worst = s.worst.length
    ? `<ol class="worst">${s.worst.map((w) => `<li><code>?layout=${w.layout}</code> ${esc(w.why.join('; '))}</li>`).join('')}</ol>`
    : '<p class="sub">No roll breaks a rule.</p>';
  const mates = Object.entries(s.lookalikeWith).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id, n]) => `${id} (${n})`).join(', ');
  const always = Object.entries(s.props).filter(([, n]) => n === rolls).length;
  const some = Object.entries(s.props).filter(([, n]) => n < rolls).sort((a, b) => b[1] - a[1]);
  const rooms = Object.entries(s.rooms).map(([k, n]) => `${esc(k)}${n < rolls ? ` (${n} rolls)` : ''}`).join(', ');
  const errs = Object.entries(s.errorKinds).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${esc(k)} (${n})`).join('; ');
  return `<section class="card" id="s${s.id}">
  <h3>${esc(s.id)} ${esc(s.name)} <span class="sub">${esc(s.type.replace('_', ' '))}${s.source === 'generated' ? ', made by the old generator' : ''}</span></h3>
  <p class="verdict ${v.cls}">${v.text}</p>
  <p class="sub">${s.distinct.geometry} different layouts out of ${rolls}; ${s.distinct.sequences} different orders of things to do (a run of the same move counted once)${s.distinct.pieces > 1 ? `; ${s.distinct.pieces} different orders of pieces` : '; the pieces always come in the same order'}. Variety score ${s.diversity.cosine.toFixed(2)} (target ${R.diversity}); the same 20 seconds of two rolls differ by ${s.diversity.window === null ? '-' : s.diversity.window.toFixed(2)}.</p>
  <div class="maps"><figure>${shapeMap(s)}<figcaption>Shape of each roll</figcaption></figure><figure>${timeMap(s)}<figcaption>Length and quiet time of each roll</figcaption></figure></div>
  <ul class="rules">
    ${rule(f.short === 0, `At least 2:00 for a quick player${climb}`, `${f.short} of ${rolls} rolls too short. Quick player ${mmss(shortest)} to ${mmss(s.stats.quick.max)} (middle ${mmss(s.stats.quick.med)})${s.stats.designer.max ? `; the stage's own estimate ${mmss(s.stats.designer.min)}-${mmss(s.stats.designer.max)}` : ''}.${s.traced.presumed ? ` ${s.traced.presumed} rolls were traced with presumed hops (links the level check cannot confirm), so a short time there may be a shortcut that is not really there: replay it.` : ''}`)}
    ${rule(f.quiet === 0, 'No quiet stretch over 4 s', `${f.quiet} of ${rolls} rolls have one (longest ${s.stats.longestQuiet.max.toFixed(1)} s; middle roll ${s.stats.longestQuiet.med.toFixed(1)} s).`)}
    ${rule(f.dead === 0, 'Quiet time under a fifth of the stage', `${f.dead} of ${rolls} rolls over it. Quiet time ${Math.round(s.stats.dead.min)}-${Math.round(s.stats.dead.max)} s.`)}
    ${rule(s.judged ? f.validator === 0 : null, 'Passes the level check', s.judged ? `${f.validator} of ${rolls} rolls fail${errs ? `: ${errs}` : ''}.` : `Not judged here: ${esc(s.notJudged ?? '')}.`)}
    ${rule(f.lookalike === 0, 'Not a copy of another stage in its world', `${f.lookalike} of ${f.lookRolls} rolls checked look like the same roll of ${mates || 'another stage'}: ${f.lookMix} by the whole action mix (over ${R.cosine}), ${f.lookWindow} by a matching 20 s stretch (closer than ${R.window}).`)}
    ${rule(f.botRolls ? f.hotKid + f.hotAdult === 0 : null, 'Every jump fair for a kid (85%) and an adult (70%)', f.botRolls ? `of ${f.botRolls} rolls tried by the bots: ${f.hotKid} with a jump the kid bot misses too often, ${f.hotAdult} for the adult bot.` : 'bots not run')}
  </ul>
  <details><summary>What changes between rolls</summary>
    <p class="sub">${always} props and pieces are in every roll; ${some.length} come and go${some.length ? `: ${some.slice(0, 10).map(([k, n]) => `${esc(k)} (${n})`).join(', ')}` : ''}. Puzzle rooms: ${rooms || 'none'}. ${s.distinct.looks} different sets of props and platform looks.</p>
    <p class="sub">Per roll: ${Math.round(s.stats.perMin.med)} things to do a minute, straightness ${s.stats.linearity.min.toFixed(2)}-${s.stats.linearity.max.toFixed(2)}, forgiveness ${s.stats.leniency.min.toFixed(2)}-${s.stats.leniency.max.toFixed(2)}, height range ${Math.round(s.stats.vertical.min)}-${Math.round(s.stats.vertical.max)} px, ${Math.round(s.stats.platforms.med)} platforms (${Math.round(s.stats.routePlatforms.med)} on the route). Mix: ${Object.entries(s.mix).map(([k, n]) => `${k} ${n!.toFixed(1)}`).join(', ')}.</p>
  </details>
  <h4>Worst rolls to replay</h4>${worst}
</section>`;
}

function worldRow(w: number, st: StageSummary[], rolls: number) {
  const n = st.length * rolls;
  const sum = (f: (s: StageSummary) => number) => st.reduce((t, s) => t + f(s), 0);
  const div = sum((s) => s.diversity.cosine) / st.length;
  const judged = st.filter((s) => s.judged);
  const v = varietyWords(div);
  return `<tr><th scope="row">W${w}</th><td class="${v.cls}">${Math.round((1 - div) * 100)}%</td><td>${st.filter((s) => s.diversity.cosine >= 0.35).length} of ${st.length}</td>
    <td>${pct(sum((s) => s.fails.short), n)}</td><td>${pct(sum((s) => s.fails.quiet), n)}</td><td>${judged.length ? `${pct(judged.reduce((t, s) => t + s.fails.validator, 0), judged.length * rolls)}${judged.length < st.length ? ` <span class="sub">(${judged.length} judged)</span>` : ''}` : '-'}</td><td>${pct(sum((s) => s.fails.lookMix), sum((s) => s.fails.lookRolls))} / ${pct(sum((s) => s.fails.lookWindow), sum((s) => s.fails.lookRolls))}</td></tr>`;
}

export function renderEra(out: EraOutput): string {
  const worlds = [...new Set(out.stages.map((s) => s.world))];
  const worst = out.stages.flatMap((s) => s.worst.slice(0, 2).map((w) => ({ s, w }))).sort((a, b) => b.w.score - a.w.score).slice(0, 12);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Stage Roll Variety</title>
<style>
:root { color-scheme: light; --bg: #fcfcfb; --card: #ffffff; --ink: #0b0b0b; --ink2: #52514e; --line: #e4e3df;
  --good: #0a7d0a; --warn: #9a6400; --bad: #c03030; --na: #6b6a66;
  --h1: #cde2fb; --h2: #9ec5f4; --h3: #6da7ec; --h4: #3987e5; --h5: #256abf; --h6: #184f95; --h7: #0d366b; --h0: #f0efec; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; --bg: #1a1a19; --card: #232322; --ink: #f0efec; --ink2: #c3c2b7; --line: #383835;
  --good: #4cc94c; --warn: #fab219; --bad: #f07070; --na: #9a9992;
  --h1: #104281; --h2: #1c5cab; --h3: #2a78d6; --h4: #3987e5; --h5: #6da7ec; --h6: #9ec5f4; --h7: #cde2fb; --h0: #2c2c2a; } }
:root[data-theme="dark"] { color-scheme: dark; --bg: #1a1a19; --card: #232322; --ink: #f0efec; --ink2: #c3c2b7; --line: #383835;
  --good: #4cc94c; --warn: #fab219; --bad: #f07070; --na: #9a9992;
  --h1: #104281; --h2: #1c5cab; --h3: #2a78d6; --h4: #3987e5; --h5: #6da7ec; --h6: #9ec5f4; --h7: #cde2fb; --h0: #2c2c2a; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.45 system-ui, -apple-system, sans-serif; }
main { max-width: 760px; margin: 0 auto; padding: 16px; }
h1 { font-size: 1.5rem; margin: 0.2em 0; } h2 { font-size: 1.2rem; margin-top: 1.6em; } h3 { font-size: 1.1rem; margin: 0 0 0.3em; } h4 { margin: 0.8em 0 0.2em; font-size: 1rem; }
.sub { color: var(--ink2); font-size: 0.9rem; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 14px; margin: 14px 0; }
.verdict { font-weight: 600; margin: 0.2em 0; } .good { color: var(--good); } .warn { color: var(--warn); } .bad { color: var(--bad); } .na { color: var(--na); }
.maps { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; } @media (max-width: 560px) { .maps { grid-template-columns: 1fr; } }
figure { margin: 0; } figcaption { color: var(--ink2); font-size: 0.85rem; text-align: center; }
.heat { width: 100%; height: auto; } .heat .tick { font-size: 9px; fill: var(--ink2); } .heat .axis { font-size: 10px; fill: var(--ink2); }
.heat rect { stroke: none; } .h0 { fill: var(--h0); } .h1 { fill: var(--h1); } .h2 { fill: var(--h2); } .h3 { fill: var(--h3); } .h4 { fill: var(--h4); } .h5 { fill: var(--h5); } .h6 { fill: var(--h6); } .h7 { fill: var(--h7); }
.rules { list-style: none; padding: 0; margin: 0.6em 0; }
.rule { display: flex; gap: 10px; align-items: flex-start; padding: 6px 0; border-top: 1px solid var(--line); }
.badge { flex: 0 0 auto; min-width: 2.6em; text-align: center; font-weight: 700; font-size: 0.8rem; border-radius: 6px; padding: 2px 4px; border: 1.5px solid currentColor; }
.rule.good .badge { color: var(--good); } .rule.bad .badge { color: var(--bad); } .rule.na .badge { color: var(--na); }
.rule b { color: var(--ink); }
table { border-collapse: collapse; width: 100%; font-size: 0.9rem; } th, td { padding: 5px 6px; border-bottom: 1px solid var(--line); text-align: right; } th:first-child, td:first-child { text-align: left; }
.wrap { overflow-x: auto; } thead th { font-size: 0.78rem; font-weight: 600; vertical-align: bottom; }
code { font-size: 0.85em; background: var(--h0); padding: 1px 4px; border-radius: 4px; }
.worst { padding-left: 1.3em; margin: 0.2em 0; font-size: 0.9rem; } details summary { cursor: pointer; color: var(--ink2); margin-top: 0.4em; }
nav a { color: var(--ink2); margin-right: 6px; font-size: 0.9rem; }
</style></head><body><main>
<h1>How much do the stages change from roll to roll?</h1>
<p class="sub">Every stage of World${worlds.length > 1 ? 's' : ''} ${worlds.join(', ')} built ${out.rolls} times, the way the game builds it when you enter (a stage keeps its roll until you clear it; the next visit rolls fresh). ${new Date(out.generated).toUTCString()}${out.redrawn ? ' (redrawn from saved rolls)' : `, ${Math.round(out.seconds / 60)} min on ${out.jobs} cores`}. Replay any roll with <code>?layout=N</code>.</p>

<h2>By world</h2>
<div class="wrap"><table><thead><tr><th>World</th><th>Rolls alike</th><th>Stages varied enough</th><th>Rolls under 2:00</th><th>Rolls with a 4 s+ quiet</th><th>Rolls failing the check</th><th>Rolls like another stage: whole mix / a 20 s stretch</th></tr></thead>
<tbody>${worlds.map((w) => worldRow(w, out.stages.filter((s) => s.world === w), out.rolls)).join('')}</tbody></table></div>
<p class="sub">"Varied enough" is the research's target: on average two rolls share no more than 65% of what you do (variety score 0.35 or more).</p>

<h2>Worst rolls overall</h2>
<ol class="worst">${worst.map(({ s, w }) => `<li><b>${esc(s.id)}</b> <code>?layout=${w.layout}</code> ${esc(w.why.join('; '))}</li>`).join('')}</ol>

${worlds.map((w) => `<h2 id="w${w}">World ${w}</h2><nav>${out.stages.filter((s) => s.world === w).map((s) => `<a href="#s${s.id}">${s.id}</a>`).join('')}</nav>${out.stages.filter((s) => s.world === w).map((s) => card(s, out.rules, out.rolls)).join('')}`).join('')}

<h2>How to read this</h2>
<ul class="sub">
<li><b>How alike rolls are</b>: what you do along the way (jumps, swings, animals, puzzles) as a string of letters, compared three at a time between every pair of rolls. 100% means every roll asks the same things in the same order, even if the platforms moved.</li>
<li><b>Different layouts</b>: rolls whose platforms differ (to 20 px). <b>Orders of things to do</b>: the actions in order with a run of the same move counted once (three jumps then a swing = jump, swing), so two rolls differ only when what you do changes, not when a run is one jump longer.</li>
<li><b>Shape map</b>: across, how straight the path is (1 = all on one line, flat or straight up); up, how forgiving (1 = every jump has ground under it, -1 = every action over a pit or an animal). A single bright cell means every roll has the same shape.</li>
<li><b>Length</b>: this tool's quick player on the quickest way through. Climbs count 20 s short (1:40).</li>
<li><b>Quiet stretch</b>: time with no jump, swing, animal, hazard or puzzle step (petals on flat ground do not count). In World 5 the creeping silk keeps him busy, so its quiet seconds count half.</li>
<li><b>Level check</b>: levelCheck.ts, with a stand-in bridge under each run of lianas (it models one liana at a time), as the stage tests use it.</li>
<li><b>Like another stage</b>: ${out.look} rolls of each stage compared with the same-numbered roll of every other stage in its world (STAGE-RULES §2 Sameness).</li>
<li><b>Bots</b>: ${out.bots} rolls of each stage are also tried by a noisy-thumb kid bot (Easy) and adult bot (Normal) on every jump.</li>
</ul>
</main></body></html>`;
}
