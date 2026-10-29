/**
 * The inspector's HTML report: one self-contained page (no scripts, no network except two optional Google fonts), readable on a phone
 * and in light or dark. Written for Matt, so every label is plain English.
 */
import type { InspectOutput, StageReport, PairReport, Hotspot } from './inspect.ts';
import type { JumpReport } from './jumps.ts';
import { renderFirstTimer } from './firsttimerReport.ts';
import { renderPacingCard, renderPacingSummary } from './pacing.ts';
import { renderBands } from './bands.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const sec = (s: number) => `${s < 10 ? s.toFixed(1) : Math.round(s)} s`;
const pct = (r: number | null) => (r === null ? 'n/a' : `${Math.round(r * 100)}%`);

const TYPE: Record<string, string> = {
  sprint: 'Run to the shrine', harvest: 'Gather', purge: 'Beat the animals', ascent: 'Climb', stealth: 'Stay hidden',
  vine_runner: 'Swing', relic_hunt: 'Search', rescue: 'Rescue', gauntlet: 'Fight through',
};
const LETTER: Record<string, string> = {
  W: 'walking (one W per 1.5 s with nothing to do)', h: 'small hop', J: 'real jump (a gap, a log, a bounce, a glide)', V: 'vine, liana, rope or climb',
  C: 'animal to fight or slip past', Z: 'timed hazard or zone (wind, spores, eagle, river, collapse...)', P: 'puzzle or thing to work (cage, log, orchid, chair, knot...)',
};

/** a stage's pairs, strongest first: "strong" when both measures agree, or one 20-second stretch is all but identical */
export const strong = (p: PairReport) => p.why.length === 2;

function strip(s: StageReport, gap: number): string {
  const T = Math.max(1, s.time.inspector);
  const W = 1000;
  const x = (t: number) => ((t / T) * W).toFixed(1);
  const max = 4;
  let rects = '';
  s.density.forEach((d, i) => {
    if (d <= 0) return;
    const o = Math.min(1, d / max);
    rects += `<rect x="${x(i)}" y="0" width="${((W / T) * 1.02).toFixed(2)}" height="40" fill="var(--busy)" fill-opacity="${(0.18 + 0.82 * o).toFixed(2)}"/>`;
  });
  let dead = '';
  for (const d of s.dead.normal.list) dead += `<rect x="${x(d.t0)}" y="0" width="${((d.sec / T) * W).toFixed(1)}" height="40" fill="var(--dead)" fill-opacity="0.85"><title>${sec(d.sec)} with nothing to do (x ${Math.round(d.x0)} to ${Math.round(d.x1)})</title></rect>`;
  let marks = '';
  for (const h of s.hotspots) {
    const cx = (h.t / T) * W;
    marks += `<path d="M${(cx - 7).toFixed(1)} 48 L${(cx + 7).toFixed(1)} 48 L${cx.toFixed(1)} 58 Z" fill="${h.who === 'KID' ? 'var(--hotk)' : 'var(--hota)'}"><title>${h.who === 'KID' ? 'Kid' : 'Adult'} bot makes this jump ${Math.round((h.rate ?? 0) * 100)}% of the time (x ${h.x})</title></path>`;
  }
  let ticks = '';
  for (let t = 30; t < T; t += 30) ticks += `<line x1="${x(t)}" x2="${x(t)}" y1="40" y2="46" stroke="var(--muted)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
  const secs = s.sections
    .map((q) => `<span class="sec" style="left:${((q.t0 / T) * 100).toFixed(2)}%;width:${(((q.t1 - q.t0) / T) * 100).toFixed(2)}%" title="${esc(q.name)}">${esc(q.name.split(':')[0])}</span>`)
    .join('');
  return `<div class="strip" role="img" aria-label="Stage timeline: green where beats are close together, red where more than ${gap} seconds pass with nothing to do">
    <svg viewBox="0 0 ${W} ${s.hotspots.length ? 58 : 46}" preserveAspectRatio="none" style="height:${s.hotspots.length ? 58 : 46}px"><rect x="0" y="0" width="${W}" height="40" fill="var(--track)"/>${rects}${dead}${ticks}${marks}</svg>
    ${secs ? `<div class="secs">${secs}</div>` : ''}
    <div class="axis"><span>start</span><span>${mmss(T)} shrine</span></div>
  </div>`;
}

function goalLine(s: StageReport): string {
  const g = s.goal;
  if (!g.word) return `<p class="small muted">No count to reach. The stage holds ${s.counts.petals} petals or flowers${s.counts.animals ? ` and ${s.counts.animals} animals` : ''}.</p>`;
  const band = g.band ? (g.band[0] === g.band[1] ? `all of them` : `${Math.round(g.band[0] * 100)}-${Math.round(g.band[1] * 100)}%`) : 'no target set';
  return `<dl class="kv">
    <dt>Goal</dt><dd>${g.goal} ${esc(g.word)} out of ${g.available} in the stage: <b>${pct(g.ratio)}</b> ${chip(g.verdict)}</dd>
    <dt>Matt's target</dt><dd>${band}</dd>
    <dt>On Easy</dt><dd>${g.easyGoal} of ${g.easyAvailable} (${pct(g.easyRatio)})</dd>
    <dt>Near the route</dt><dd>${g.nearRoute} of ${g.available} sit close to the main route</dd>
  </dl>`;
}

function chip(v: string): string {
  const cls = v === 'in band' ? 'ok' : v === 'no target' || v === 'no count' ? 'mid' : 'bad';
  const words: Record<string, string> = { 'in band': 'on target', 'too easy': 'asks for less than the target', 'too hard': 'asks for more than the target', impossible: 'more than the stage holds', 'no target': 'no target set', 'no count': '' };
  return words[v] ? `<span class="chip ${cls}">${words[v]}</span>` : '';
}

const WHY: Record<string, string> = {
  'too far': 'too far (over 85% of what the jump can do)', 'narrow landing': 'narrow landing', 'double-jump window': 'tight second-flick window',
  'take-off spot': 'small take-off spot', timing: 'timing (a hazard or animal on a cycle)',
};
const pctI = (r: number | null) => (r === null ? 'n/a' : `${Math.round(r * 100)}%`);
function hardness(j: JumpReport): string {
  const parts = j.why.map((w) => WHY[w] ?? w);
  const top = Object.entries(j.fails).sort((a, b) => b[1] - a[1])[0];
  if (top) parts.push(`most misses: ${top[0]}`);
  return parts.join('; ') || 'nothing stands out';
}
function jumpLine(j: JumpReport): string {
  return `x ${j.x}: ${j.gap} px across, ${j.rise >= 0 ? `${j.rise} up` : `${-j.rise} down`}, lands on ${j.landW} px, ${Math.round(j.reach * 100)}% of reach${j.dbl ? `, double jump${j.dblNeeded ? ' (needed)' : ''}${j.dblWindow !== null ? `, second flick window ${j.dblWindow.toFixed(2)} s` : ''}` : ''}${j.timing ? `, ${esc(j.timing.what)} safe ${j.timing.safe.toFixed(1)} of ${j.timing.cycle.toFixed(1)} s` : ''}`;
}
function jumpBlock(s: StageReport): string {
  const J = s.jumps;
  if (!J.normal.length && !s.hotspots.length) return '<p class="small muted">No jumps on the route the bots can fly (logs, swings, glides and bounces are not simulated).</p>';
  const need2 = J.normal.filter((j) => j.dblNeeded).length;
  const minRate = (l: JumpReport[]) => Math.min(1, ...l.filter((j) => j.rate !== null).map((j) => j.rate as number));
  const hot = s.hotspots.map((h) => `<li><b class="${h.who === 'KID' ? 'hk' : 'ha'}">${h.who === 'KID' ? 'Kid' : 'Adult'} ${pctI(h.rate)}</b> at x ${h.x} (${mmss(h.t)}): ${esc(hardness(h))}${h.miss === 'fall' ? ', <b>a miss costs a life</b>' : ''}</li>`).join('');
  return `<div class="jumps">
    <dl class="kv">
      <dt>Jumps</dt><dd>${J.normal.length} on the route${need2 ? `, ${need2} need a double jump` : ''}; ${J.over80} over 80% of reach (${J.over80Easy} on Easy)</dd>
      <dt>Bots</dt><dd>adult makes every jump at least ${pctI(minRate(J.normal))} of the time on Normal; kid at least ${pctI(minRate(J.easy))} on Easy</dd>
      ${J.tightestTiming ? `<dt>Tightest timing</dt><dd>${esc(J.tightestTiming.what)} at x ${J.tightestTiming.x}: safe ${J.tightestTiming.safe.toFixed(1)} s of every ${J.tightestTiming.cycle.toFixed(1)} s</dd>` : ''}
    </dl>
    ${hot ? `<p class="small"><b>Hotspots</b></p><ul class="hot">${hot}</ul>` : ''}
    ${J.tightest.length ? `<details><summary>Tightest five jumps</summary><ul class="small">${J.tightest.map((j) => `<li>${jumpLine(j)}; adult ${pctI(j.rate)}</li>`).join('')}</ul></details>` : ''}
  </div>`;
}

function hist(values: number[], at: number, flip: boolean, label: string): string {
  // ten bins over 0..1 (a window distance is shown as how alike: 1 - distance)
  const v = values.map((x) => (flip ? 1 - x : x));
  const bins = new Array(10).fill(0);
  for (const x of v) bins[Math.min(9, Math.max(0, Math.floor(x * 10)))]++;
  const max = Math.max(1, ...bins);
  const thr = flip ? 1 - at : at;
  const W = 300, H = 90;
  const bars = bins.map((n, i) => {
    const h = (n / max) * (H - 22);
    const hot = (i + 1) / 10 > thr;
    return `<rect x="${i * 30 + 2}" y="${H - 16 - h}" width="26" height="${h}" fill="${hot ? 'var(--dead)' : 'var(--busy)'}" fill-opacity="${hot ? 0.85 : 0.55}"><title>${n} pairs ${(i / 10).toFixed(1)}-${((i + 1) / 10).toFixed(1)}</title></rect><text x="${i * 30 + 15}" y="${H - 18 - h}" text-anchor="middle" font-size="9" fill="var(--muted)">${n || ''}</text>`;
  }).join('');
  const tx = thr * W;
  return `<figure class="hist"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${bars}<line x1="${tx}" x2="${tx}" y1="4" y2="${H - 14}" stroke="var(--fg)" stroke-dasharray="3 3"/><text x="2" y="${H - 2}" font-size="9" fill="var(--muted)">0%</text><text x="${W - 2}" y="${H - 2}" font-size="9" fill="var(--muted)" text-anchor="end">100% alike</text></svg><figcaption>${esc(label)}: flagged right of the dashed line (${Math.round(thr * 100)}%)</figcaption></figure>`;
}

function card(s: StageReport, out: InspectOutput): string {
  const dn = s.dead.normal, de = s.dead.easy;
  const mix = (['h', 'J', 'V', 'C', 'Z', 'P'] as const).filter((l) => s.mix[l]).map((l) => `<span class="mixi" title="${esc(LETTER[l])}"><b>${l}</b> ${s.mix[l]}</span>`).join('');
  const sim = s.similar;
  const pair = sim ? out.pairs.find((p) => (p.a === s.id && p.b === sim.id) || (p.b === s.id && p.a === sim.id)) : undefined;
  const simName = sim ? out.stages.find((x) => x.id === sim.id)?.name ?? '' : '';
  const rest = s.rest;
  const routeNote = s.traced === 'check' ? 'traced on moves the level check allows'
    : s.traced === 'extended' ? 'traced with liana chains or ropes the inspector added'
    : s.traced === 'presumed' ? `${s.presumedHops} hop${s.presumedHops === 1 ? '' : 's'} the level check cannot confirm (a ledge it thinks is too high, or a puzzle piece); the route assumes they work`
    : 'could not be traced';
  const deadRows = dn.list.slice().sort((a, b) => b.sec - a.sec).slice(0, 8)
    .map((d) => `<tr><td>${mmss(d.t0)}</td><td class="num">${sec(d.sec)}</td><td class="num">${Math.round(d.x0)} to ${Math.round(d.x1)}</td></tr>`).join('');
  const beatRows = s.beats.map((b) => `<tr><td>${mmss(b.t)}</td><td><b>${b.letter}</b></td><td>${esc(b.what)}${b.count < 1 ? ' (half beat)' : ''}</td><td class="num">${b.x}</td></tr>`).join('');
  const off = Object.entries(s.offRoute).map(([k, n]) => `${n} ${esc(k)}`).join(', ');
  return `<article class="card" id="s${s.id}">
  <header class="ch">
    <div><span class="sid">${s.id}</span> <h3>${esc(s.name)}</h3></div>
    <span class="type">${esc(TYPE[s.type] ?? s.type)}${s.source === 'generated' ? ' · generated' : s.source === 'gen2' ? ' · gen2' : ''}</span>
  </header>
  <p class="goaltext">${esc(s.goalText)}</p>
  <div class="stats">
    <div><span class="lab">Play time</span><span class="val ${s.time.quickUnder ? 'badt' : ''}">${mmss(s.time.inspector)}</span><span class="sub">quick player (this tool)${s.time.quickUnder ? ' <b class="badt">under 2:00</b>' : ''}; game's own estimate ${s.time.designer ? mmss(s.time.designer) : s.time.typical ? `${mmss(s.time.typical)} (first-timer model)` : 'n/a'}</span></div>
    <div><span class="lab">Beats</span><span class="val">${s.beatCount}</span><span class="sub">${s.beatsPerMin.toFixed(0)} a minute</span></div>
    <div><span class="lab">Dead time</span><span class="val ${dn.total > 60 ? 'badt' : ''}">${sec(dn.total)}</span><span class="sub">${dn.count} gaps over 2 s; longest ${sec(dn.longest)}${s.silk ? `; ${sec(dn.raw)} before the silk halves it` : ''}</span></div>
    <div><span class="lab">On Easy</span><span class="val">${sec(de.total)}</span><span class="sub">${de.count} gaps over 3 s; longest ${sec(de.longest)}</span></div>
  </div>
  ${strip(s, out.thresholds.normal)}
  <div class="mix">${mix}</div>
  ${jumpBlock(s)}
  ${renderPacingCard(s.pacing)}
  <dl class="kv">
    <dt>Rest after bursts</dt><dd>${rest.bursts.length ? `${rest.bursts.length} burst${rest.bursts.length === 1 ? '' : 's'} of action; ${rest.noRest ? `<b class="badt">${rest.noRest} with no rest</b> (no second of plain walking before the next beat)` : 'each one is followed by at least a second of plain walking'}` : 'no bursts (beats never bunch up)'}</dd>
    <dt>Most like</dt><dd>${sim ? `<a href="#s${sim.id}">${sim.id} ${esc(simName)}</a>: mix ${Math.round(sim.cos * 100)}% alike, closest 20 s stretch ${Math.round((1 - sim.win) * 100)}% alike ${sim.flagged ? `<span class="chip ${pair && strong(pair) ? 'bad' : 'mid'}">${pair && strong(pair) ? 'very alike' : 'flagged'}</span>` : ''}` : 'n/a'}</dd>
    <dt>Repeats inside</dt><dd>${s.repeats.length ? `${s.repeats.length}${s.repeats.length >= 5 ? '+' : ''} near-identical 20 s stretches, e.g. ${mmss(s.repeats[0].ta)} and ${mmss(s.repeats[0].tb)}: <code>${esc(s.repeats[0].s)}</code>` : 'none'}</dd>
    <dt>Route</dt><dd>${s.routes.used === 'pickups' ? 'the way along the pickups' : 'the quickest way'}${s.routes.pickups.time !== s.routes.quick.time || s.routes.pickups.beats !== s.routes.quick.beats ? ` (quickest: ${mmss(s.routes.quick.time)}, ${sec(s.routes.quick.dead)} dead; along the pickups: ${mmss(s.routes.pickups.time)}, ${sec(s.routes.pickups.dead)} dead)` : ''}; ${routeNote}${s.stops.asked ? `; visits ${s.stops.asked - s.stops.skipped} of ${s.stops.asked} places the goal sends him` : ''}</dd>
    ${s.silk ? `<dt>Silk</dt><dd>World 5's rule (stand still and the silk creeps up) keeps him moving: quiet seconds here count half, except on the rest branch</dd>` : ''}
    ${off ? `<dt>Off the route</dt><dd>${off}</dd>` : ''}
  </dl>
  ${goalLine(s)}
  <details><summary>Action string</summary><pre class="act">${esc(s.action)}</pre></details>
  ${dn.list.length ? `<details><summary>Longest quiet stretches</summary><div class="tw"><table><thead><tr><th>At</th><th class="num">Length</th><th class="num">x (px)</th></tr></thead><tbody>${deadRows}</tbody></table></div></details>` : ''}
  <details><summary>Every beat (${s.beats.length})</summary><div class="tw"><table><thead><tr><th>At</th><th></th><th>What</th><th class="num">x</th></tr></thead><tbody>${beatRows}</tbody></table></div></details>
</article>`;
}

export function renderReport(out: InspectOutput): string {
  const st = out.stages;
  const worst = [...st].sort((a, b) => b.dead.normal.total - a.dead.normal.total).slice(0, 10);
  const maxDead = Math.max(1, ...worst.map((s) => s.time.inspector));
  const flagged = out.pairs.filter((p) => p.flagged).sort((a, b) => Number(strong(b)) - Number(strong(a)) || a.win - b.win || b.cos - a.cos);
  const strongPairs = flagged.filter(strong);
  const hotAll: Array<Hotspot & { id: string }> = st.flatMap((x) => x.hotspots.map((h) => ({ ...h, id: x.id }))).sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0));
  const goals = st.filter((s) => s.goal.word);
  const off = goals.filter((s) => s.goal.verdict !== 'in band' && s.goal.verdict !== 'no target');
  const totalDead = st.reduce((t, s) => t + s.dead.normal.total, 0);
  const totalTime = st.reduce((t, s) => t + s.time.inspector, 0);
  const name = (id: string) => esc(st.find((s) => s.id === id)?.name ?? '');
  const pairRow = (p: PairReport) => `<tr><td><a href="#s${p.a}">${p.a}</a> &amp; <a href="#s${p.b}">${p.b}</a><div class="small muted">${name(p.a)} / ${name(p.b)}</div></td><td class="num">${Math.round(p.cos * 100)}%</td><td class="num">${Math.round((1 - p.win) * 100)}%</td><td><code class="pat">${esc(p.sa)}</code><br><code class="pat">${esc(p.sb)}</code></td></tr>`;
  const pairHead = `<thead><tr><th>Stages</th><th class="num">Mix alike</th><th class="num">Best 20 s alike</th><th>The closest 20 s, as letters</th></tr></thead>`;
  const worlds = [...new Set(st.map((s) => s.world))];
  const date = out.generated.slice(0, 10);

  return `<title>Sloths Stage Inspector</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&display=swap">
<style>
/* Layout: one reading column of summaries, then a responsive grid of stage cards, grouped by world. A field notebook for the canopy. */
:root {
  --bg: #f4f6f1; --panel: #ffffff; --fg: #1c2a22; --muted: #5d6b62; --line: #d8dfd6;
  --accent: #2f6b4f; --busy: #2f8a57; --dead: #c2452d; --track: #e6ebe3; --warn: #a86a12;
  --okbg: #dcefe2; --badbg: #f8dcd5; --midbg: #efe8d6; --hotk: #7a3fb0; --hota: #1f4f8f; --sn: #2a78d6; --se: #eb6834;
  --display: "Bricolage Grotesque", "Avenir Next", "Segoe UI", system-ui, sans-serif;
  --body: "Atkinson Hyperlegible", "Segoe UI", system-ui, -apple-system, sans-serif;
  --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #121a15; --panel: #1a241e; --fg: #e3ebe4; --muted: #9aa99f; --line: #2c3a31;
  --accent: #7fc89f; --busy: #4fbf7d; --dead: #ef6b4f; --track: #233029; --warn: #e2a64a;
  --okbg: #1f3a2a; --badbg: #4a2219; --midbg: #3a3320; --hotk: #c49bf0; --hota: #8fb8f2; --sn: #3987e5; --se: #d95926; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #121a15; --panel: #1a241e; --fg: #e3ebe4; --muted: #9aa99f; --line: #2c3a31;
  --accent: #7fc89f; --busy: #4fbf7d; --dead: #ef6b4f; --track: #233029; --warn: #e2a64a;
  --okbg: #1f3a2a; --badbg: #4a2219; --midbg: #3a3320; --hotk: #c49bf0; --hota: #8fb8f2; --sn: #3987e5; --se: #d95926; color-scheme: dark }
* { box-sizing: border-box }
body { background: var(--bg); color: var(--fg); font: 15px/1.5 var(--body); margin: 0 }
.wrap { max-width: 1180px; margin: 0 auto; padding-block: 28px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 28px }
h1, h2, h3 { font-family: var(--display); text-wrap: balance; margin: 0 }
h1 { font-size: clamp(28px, 6vw, 44px); font-weight: 800; letter-spacing: -0.01em }
h2 { font-size: 22px; font-weight: 800 }
h3 { font-size: 17px; font-weight: 600; display: inline }
a { color: var(--accent) }
code, pre { font-family: var(--mono); font-size: 12.5px }
.muted { color: var(--muted) } .small { font-size: 13px }
.lede { max-width: 68ch; margin: 6px 0 0 }
section { display: grid; gap: 12px; min-width: 0 }
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 16px; min-width: 0 }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: 12px }
.tile { display: grid; gap: 2px } .tile b { font-family: var(--display); font-size: 28px; font-variant-numeric: tabular-nums }
.tile span { color: var(--muted); font-size: 13px }
details > summary { cursor: pointer; color: var(--accent); font-weight: 700; padding: 4px 0 }
details > summary:focus-visible, a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.how { max-width: 72ch } .how li { margin: 4px 0 }
.tw { overflow-x: auto; max-width: 100% }
table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums }
th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--line); vertical-align: top }
th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); font-weight: 700 }
.num { text-align: right; white-space: nowrap }
.bar { height: 10px; background: var(--track); border-radius: 5px; overflow: hidden; min-width: 80px }
.bar i { display: block; height: 100%; background: var(--dead) }
.pat { word-break: break-all; font-size: 12px }
.chip { display: inline-block; font-size: 12px; font-weight: 700; padding: 1px 8px; border-radius: 999px; white-space: nowrap }
.chip.ok { background: var(--okbg); color: var(--busy) } .chip.bad { background: var(--badbg); color: var(--dead) } .chip.mid { background: var(--midbg); color: var(--warn) }
.badt { color: var(--dead) }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr)); gap: 16px }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 14px; display: grid; gap: 10px; min-width: 0; align-content: start }
.ch { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap }
.sid { font-family: var(--display); font-weight: 800; font-size: 20px; color: var(--accent); font-variant-numeric: tabular-nums }
.type { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted) }
.goaltext { margin: 0; color: var(--muted); font-size: 13.5px }
.stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px }
.stats > div { display: grid; min-width: 0 }
.lab { font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted) }
.val { font-family: var(--display); font-size: 22px; font-weight: 600; font-variant-numeric: tabular-nums }
.sub { font-size: 12px; color: var(--muted) }
.strip svg { display: block; width: 100%; height: 46px; border-radius: 4px }
.secs { position: relative; height: 18px; margin-top: 2px }
.sec { position: absolute; top: 0; font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-left: 1px solid var(--muted); padding-left: 3px }
.axis { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted) }
.mix { display: flex; flex-wrap: wrap; gap: 6px }
.mixi { font-size: 12px; background: var(--track); padding: 1px 7px; border-radius: 4px; font-variant-numeric: tabular-nums }
.kv { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 4px 12px; margin: 0; font-size: 13.5px }
.kv dt { color: var(--muted) } .kv dd { margin: 0; min-width: 0; overflow-wrap: anywhere }
.act { white-space: pre-wrap; word-break: break-all; background: var(--track); padding: 8px; border-radius: 6px; margin: 4px 0 0 }
.legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px }
.sw { display: inline-block; width: 22px; height: 10px; border-radius: 2px; vertical-align: middle; margin-right: 4px }
.letters { display: grid; grid-template-columns: max-content 1fr; gap: 2px 10px; font-size: 13.5px; margin: 6px 0 0 }
.letters b { font-family: var(--mono) }
.jumps { display: grid; gap: 6px }
.hot { margin: 0; padding-left: 18px; font-size: 13px; display: grid; gap: 3px }
.hk { color: var(--hotk) } .ha { color: var(--hota) }
.hists { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 16px }
.hist { margin: 0 } .hist svg { width: 100%; height: auto; display: block } .hist figcaption { font-size: 12px; color: var(--muted) }
.pace { display: grid; gap: 6px } .pcols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 10px }
.tens { display: block; width: 100%; height: 44px } .pl { margin: 4px 0 0; padding-left: 16px; font-size: 12.5px; display: grid; gap: 2px }
.bands { display: block; width: 100%; max-width: 640px; height: auto; margin: 8px auto 0 }
</style>
<div class="wrap">
<header>
  <p class="small muted">Development tool · Worlds ${out.worlds[0]}-${out.worlds[out.worlds.length - 1]} · layout seed ${out.seed} · ${date}</p>
  <h1>Stage Inspector</h1>
  <p class="lede">Every stage of Worlds ${out.worlds[0]} to ${out.worlds[out.worlds.length - 1]}, read from its layout: what the player has to do along the main route, where nothing happens for a while, whether the goal asks for the right share of what the stage holds, and which stages feel alike. These are estimates from the stage layout, not from a real play-through.</p>
</header>

<section class="panel">
  <div class="tiles">
    <div class="tile"><b>${st.length}</b><span>stages inspected (${out.skipped.length} skipped)</span></div>
    <div class="tile"><b>${Math.round((totalDead / totalTime) * 100)}%</b><span>of play time is in a quiet stretch over 2 s</span></div>
    <div class="tile"><b>${flagged.length}</b><span>pairs of stages flagged as alike (${strongPairs.length} very alike)</span></div>
    <div class="tile"><b>${hotAll.length}</b><span>jump hotspots for the bots (${hotAll.filter((h) => h.who === 'KID').length} kid, ${hotAll.filter((h) => h.who === 'ADULT').length} adult)</span></div>
    <div class="tile"><b>${st.filter((x) => x.time.quickUnder).length}</b><span>stages a quick player finishes in under 2:00</span></div>
    <div class="tile"><b>${off.length} of ${goals.length}</b><span>counted goals off Matt's target share</span></div>
  </div>
</section>

<section>
  <details class="panel how"><summary>How these numbers are worked out</summary>
  <ul>
    <li><b>The main route</b> is the quickest way from the start to the shrine on the game's own level check (every jump, climb, swing and rope it allows with the real jump physics). On a stage with a count to reach (gather, rescue, search, beat the animals) the route also stops under each thing the goal counts, in order along the stage. Where the check cannot see a way (a pushed log, a ledge it thinks too high), the route assumes a hop and the card says so.</li>
    <li><b>Time</b> is for a quick player holding run the whole way: Pokey's top run speed (285 px a second), the climb speed (220), about 430 for a swing and the rope speed, plus a fight of 2 s for each animal on the route and the waits each piece needs (a cage, a knot, a gust). A first-time player is slower, so every quiet stretch feels longer to them.</li>
    <li><b>A beat</b> is something to do or time: a jump over a gap or up a step, grabbing a vine, liana or rope, an animal near the route, a timed hazard (a gust, a spore cloud, an eagle's sweep, a falling rock, a river), or a thing to work (a cage, a pushed log, an orchid, a chair, Dot's knot). Pickups lying on the way are not beats. An arc of petals over a gap the route does not jump is half a beat. A glide, a swing or a rope keeps him busy while it lasts; a climb counts as busy for its first 2.5 s only.</li>
    <li><b>Dead time</b> is any stretch over 2 s with no beat (3 s on Easy, measured on the Easy version of the stage). The start and the walk to the shrine count.</li>
    <li><b>Rest</b>: a burst is beats less than 1.5 s apart that add up to some weight (two animals, or a swing and two jumps). After each, the card looks for at least a second of plain walking on still ground before the next beat.</li>
    <li><b>Alike</b>: each stage becomes a string of letters (below). "Mix alike" compares which three-letter runs a stage is made of, whatever its length. "Best 20 s alike" finds the two 20-second stretches that are closest. A pair is flagged when the mix is over 78% alike or a 20 s stretch is over 72% alike; "very alike" when both are high or one stretch is all but identical.</li>
    <li><b>Which route</b>: two ways are traced, the quickest and the one along the pickups (it stops under every petal and flower on a ledge, which is how the designed path, the branches and stepping stones, shows). The busier one (more beats a minute) is used, unless it takes over half as long again. Both are on each card.</li>
    <li><b>World 5's silk</b>: standing still lets the silk creep up, so even a quiet stretch keeps him moving. Its quiet seconds count half toward dead time (not on 5-5's rest branch).</li>
    <li><b>Jump difficulty</b>: every jump on the route is flown with the game's own air physics (physics.ts) and jump rules (the cut when the thumb lifts, the second jump, the grace after leaving a ledge, the wider landing on Easy and early stages). "Reach" is the share of the most a clean jump (or double jump) can do, across or up. The second-flick window is how long the second flick can come and still land, from where the bot aims to take off. Timing windows are the safe part of a hazard's cycle, or of an animal's walk past the landing.</li>
    <li><b>Bots</b>: ${out.bots.trials} tries per jump. Kid (Easy): presses ${Math.round(out.bots.kid.react * 1000)} ms late on average (spread ${Math.round(out.bots.kid.reactSd * 1000)} ms) plus ${out.bots.kid.lateFrames[0]}-${out.bots.kid.lateFrames[1]} frames for the flick to register; thumb-down time spread ${Math.round(out.bots.kid.holdSd * 1000)} ms; ${Math.round(out.bots.kid.short * 100)}% of flicks short (30% less height); steering reacts late by the same and drifts off now and then. Adult (Normal): ${Math.round(out.bots.adult.react * 1000)} ms (spread ${Math.round(out.bots.adult.reactSd * 1000)}), ${out.bots.adult.lateFrames[0]}-${out.bots.adult.lateFrames[1]} frames, ${Math.round(out.bots.adult.holdSd * 1000)} ms, ${Math.round(out.bots.adult.short * 100)}% short. Each bot aims for the middle of the take-off spots that work on the ledge, and takes a double jump wherever that works better for it. This is a model of one jump at a time, not a run of the game: no animals, wind or ceilings in the air, and the thumb is timing noise, not finger paths through the touch rules.</li>
    <li><b>Blind spots</b>: the inspector reads one roll of each hand-built stage (seed ${out.seed}); other rolls differ in detail. It does not see Dot's lines, the story or music. The bots do not fly swings, river logs, moving platforms, mushroom bounces or leaf glides, and do not model how a gesture is recognised (a second flick that the touch rules miss). Optional detours off the route are not counted.</li>
  </ul>
  <div class="letters">${Object.entries(LETTER).map(([l, d]) => `<b>${l}</b><span>${esc(d)}</span>`).join('')}</div>
  </details>
</section>

${renderFirstTimer(out.firstTimer)}

${renderBands(out.bands)}

${renderPacingSummary(st)}

<section>
  <h2>Most dead time</h2>
  <p class="small muted">Seconds with nothing to do in stretches over 2 s, against the whole stage.</p>
  <div class="panel tw"><table><thead><tr><th>Stage</th><th class="num">Dead</th><th class="num">Of</th><th class="num">Longest</th><th>Share</th></tr></thead><tbody>
  ${worst.map((s) => `<tr><td><a href="#s${s.id}">${s.id}</a> ${esc(s.name)}</td><td class="num"><b>${sec(s.dead.normal.total)}</b></td><td class="num">${mmss(s.time.inspector)}</td><td class="num">${sec(s.dead.normal.longest)}</td><td><div class="bar" title="${Math.round((s.dead.normal.total / s.time.inspector) * 100)}%"><i style="width:${((s.dead.normal.total / maxDead) * 100).toFixed(1)}%"></i></div></td></tr>`).join('')}
  </tbody></table></div>
</section>

<section>
  <h2>Stages that feel alike</h2>
  <p class="small muted">Only stages in the same world are compared. The flag lines are set from how alike the ${out.pairs.length} pairs usually are: a pair flags when its mix is in the top twentieth or one 20-second stretch is in the closest twentieth (the first guess, 78% and 72%, flagged ${out.thresholds.firstFlags} pairs, mostly World 2's river crossings, which every stage there shares by design). Both measures high: very alike.</p>
  <div class="panel hists">${hist(out.dist.cos, out.thresholds.cosine, false, 'Mix alike, every pair')}${hist(out.dist.win, out.thresholds.window, true, 'Closest 20 s alike, every pair')}</div>
  <div class="panel tw"><table>${pairHead}<tbody>${flagged.map((p) => pairRow(p).replace('<td><a', `<td>${strong(p) ? '<span class="chip bad">very alike</span> ' : ''}<a`)).join('') || '<tr><td colspan="4">None.</td></tr>'}</tbody></table></div>
</section>

<section>
  <h2>Hardest jumps for the bots</h2>
  <p class="small muted">Each jump on the route flown ${out.bots.trials} times by two noisy-thumb bots: a kid on Easy and an adult on Normal. A hotspot is a jump the kid makes less than ${Math.round(out.bots.kidHot * 100)}% of the time, or the adult less than ${Math.round(out.bots.adultHot * 100)}%. This is a model of one jump at a time, not a run of the game.</p>
  <div class="panel tw"><table><thead><tr><th>Stage</th><th>Bot</th><th class="num">Makes it</th><th>The jump</th><th>What makes it hard</th></tr></thead><tbody>
  ${hotAll.slice(0, 15).map((h) => `<tr><td><a href="#s${h.id}">${h.id}</a></td><td>${h.who === 'KID' ? 'Kid, Easy' : 'Adult, Normal'}</td><td class="num"><b>${pctI(h.rate)}</b></td><td class="small">${jumpLine(h)}${h.miss === 'fall' ? '; a miss costs a life' : ''}</td><td class="small">${esc(hardness(h))}</td></tr>`).join('') || '<tr><td colspan="5">No hotspots.</td></tr>'}
  </tbody></table></div>
  <p class="small muted">${hotAll.length} hotspots in all (${hotAll.filter((h) => h.who === 'KID').length} for the kid, ${hotAll.filter((h) => h.who === 'ADULT').length} for the adult) across ${out.stages.reduce((t, x) => t + x.jumps.normal.length, 0)} jumps on Normal routes.</p>
</section>

<section>
  <h2>Goals against what the stage holds</h2>
  <p class="small muted">Matt's target for Normal: about 85-90% of the petals or flowers, every animal to rescue, about 70-80% of the animals to beat. Searches have no target yet.</p>
  <div class="panel tw"><table><thead><tr><th>Stage</th><th class="num">Asks</th><th class="num">Holds</th><th class="num">Share</th><th>Target</th><th class="num">Easy</th></tr></thead><tbody>
  ${goals.map((s) => `<tr><td><a href="#s${s.id}">${s.id}</a> ${esc(s.name)}<div class="small muted">${esc(s.goal.word)}</div></td><td class="num">${s.goal.goal}</td><td class="num">${s.goal.available}</td><td class="num"><b>${pct(s.goal.ratio)}</b></td><td>${chip(s.goal.verdict)}</td><td class="num">${s.goal.easyGoal} of ${s.goal.easyAvailable}</td></tr>`).join('')}
  </tbody></table></div>
</section>

${out.skipped.length ? `<section><h2>Not inspected</h2><div class="panel"><dl class="kv">${out.skipped.map((k) => `<dt>${k.id} ${esc(k.name)}</dt><dd>${esc(k.why)}</dd>`).join('')}</dl></div></section>` : ''}

<section class="panel">
  <div class="legend"><span><i class="sw" style="background:var(--busy)"></i>beats close together (darker is busier)</span><span><i class="sw" style="background:var(--dead)"></i>over 2 s with nothing to do</span><span><i class="sw" style="background:var(--track)"></i>a beat, then a short walk</span><span><svg width="14" height="10" viewBox="0 0 14 10" style="vertical-align:middle"><path d="M0 0 L14 0 L7 10 Z" fill="var(--hotk)"/></svg> kid hotspot</span><span><svg width="14" height="10" viewBox="0 0 14 10" style="vertical-align:middle"><path d="M0 0 L14 0 L7 10 Z" fill="var(--hota)"/></svg> adult hotspot</span><span class="muted">Ticks every 30 s. Labels under the strip are the stage's own sections.</span></div>
</section>

${worlds.map((w) => `<section><h2>World ${w}</h2><div class="grid">${st.filter((s) => s.world === w).map((s) => card(s, out)).join('')}</div></section>`).join('')}
</div>`;
}
