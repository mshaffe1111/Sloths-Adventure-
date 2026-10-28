/**
 * The first-timer pass over a list of stages (firsttimer.ts), and its part of the inspector's HTML report: the pre-QA pass.
 *
 *   npx tsx tools/inspect/inspect.ts --worlds 1-4 --firsttimer [--ft-trials 2] [--ft-windows 12] [--stages 1-7,2-2]
 *
 * Each setting is one pass in stage order on a fresh phone (Easy with the kid's thumb, Normal with the adult's), so the lessons a new
 * player has had carry over from stage to stage as they would. Each stage is played `trials` times with different thumbs on the same
 * layout roll.
 */
import { firstTimerStage, freshPhone, FT_ADULT, FT_KID, GATES, RULES, type FirstTimer, type FTStage, type Flag } from './firsttimer.ts';

export interface FirstTimerPass {
  trials: number;
  seed: number;
  rules: typeof RULES;
  gates: typeof GATES;
  personas: { kid: FirstTimer; adult: FirstTimer };
  /** per stage: Easy (kid) and Normal (adult) */
  stages: Array<{ id: string; name: string; world: number; easy: FTStage; normal: FTStage }>;
  ms: number;
}

export function runFirstTimerPass(list: Array<{ id: string; name: string; world: number }>, seed: number, o: { trials?: number; windows?: number; log?: (s: string) => void } = {}): FirstTimerPass {
  const t0 = Date.now();
  const per = new Map<string, { easy?: FTStage; normal?: FTStage }>();
  // (Dot's flight, 4-D, and Meeca's stage, 5-M, are not walked: their own code plays them)
  list = list.filter((s) => /^\d+-\d+$/.test(s.id));
  for (const who of [FT_KID, FT_ADULT]) {
    freshPhone(who.setting);
    for (const s of list) {
      const r = firstTimerStage(s.id, seed, who, { trials: o.trials ?? 2, windows: o.windows ?? 12, fresh: false });
      const m = per.get(s.id) ?? {};
      m[who.setting] = r;
      per.set(s.id, m);
      o.log?.(`first-timer ${s.id} ${who.setting}: ${r.runs.map((x) => `${x.end} ${Math.round(x.time)}s`).join(', ')}; ${r.flags.length} findings (${r.ms} ms)\n`);
    }
  }
  return {
    trials: o.trials ?? 2, seed, rules: RULES, gates: GATES, personas: { kid: FT_KID, adult: FT_ADULT },
    stages: list.map((s) => ({ ...s, easy: per.get(s.id)!.easy!, normal: per.get(s.id)!.normal! })),
    ms: Date.now() - t0,
  };
}

/** every finding of the pass, worst first, Easy and Normal side by side when both have it */
export function passFindings(p: FirstTimerPass): Array<Flag & { runs: number; id: string; settings: string[]; trials: number }> {
  const out: Array<Flag & { runs: number; id: string; settings: string[]; trials: number }> = [];
  for (const s of p.stages) {
    for (const st of [s.easy, s.normal]) {
      for (const f of st.flags) {
        const same = out.find((q) => q.id === s.id && q.rule === f.rule && q.kind === f.kind && (q.x === null || f.x === null ? q.x === f.x && q.what === f.what : Math.abs(q.x - f.x) < 200));
        const label = st.setting === 'easy' ? 'Easy' : 'Normal';
        if (same) {
          if (!same.settings.includes(label)) same.settings.push(label);
          if (f.sev > same.sev) Object.assign(same, { ...f, settings: same.settings, id: s.id, trials: st.trials });
        } else out.push({ ...f, id: s.id, settings: [label], trials: st.trials });
      }
    }
  }
  const score = (f: (typeof out)[number]) => f.sev * (0.6 + 0.4 * (f.runs / f.trials)) + (f.settings.length > 1 ? 4 : 0);
  return out.sort((a, b) => score(b) - score(a));
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pct = (v: number | null) => (v === null ? 'n/a' : `${Math.round(v * 100)}%`);

/** one setting's cells in the stage table */
function cells(st: FTStage): string {
  const r0 = st.runs;
  const ends = r0.map((r) => (r.end === 'shrine' ? 'shrine' : r.end === 'sealed door' ? 'sealed' : `${Math.round(r.progress * 100)}%`)).join(' / ');
  const lives = r0.map((r) => r.harms.filter((h) => h.kind === 'life').length);
  const hits = r0.map((r) => r.harms.filter((h) => h.kind === 'hit').length);
  const mins = r0.reduce((a, r) => a + r.time, 0) / 60;
  const first5 = r0.some((r) => r.opening.length || r.holdOn.life || r.holdOn.hit);
  const late = r0.flatMap((r) => r.firstHarm.filter((h) => !h.ok)).length;
  const plain = st.flags.filter((f) => f.rule === 'plainWalk').length;
  const stuck = st.flags.filter((f) => f.rule === 'wayOn').length;
  const dot = st.flags.filter((f) => f.rule === 'dot').length;
  const g = st.gates;
  const bad = (b: boolean) => (b ? ' class="badt"' : '');
  return `<td>${ends}</td>
    <td class="num"${bad(first5)}>${first5 ? 'yes' : '-'}</td>
    <td class="num"${bad(late > 0)}>${late || '-'}</td>
    <td class="num">${(hits.reduce((a, b) => a + b, 0) / Math.max(0.25, mins)).toFixed(1)} / ${(lives.reduce((a, b) => a + b, 0) / Math.max(0.25, mins)).toFixed(1)}</td>
    <td class="num"${bad(plain > 0)}>${plain || '-'}</td>
    <td class="num"${bad(stuck > 0)}>${stuck || '-'}</td>
    <td class="num"${bad(g.survival.below.length > 0)}>${pct(g.survival.min)}</td>
    <td class="num"${bad(g.window.below.length > 0)}>${g.window.min ? `${g.window.min.ms}` : 'n/a'}</td>
    <td class="num"${bad(g.stress.peak > g.stress.gate)}>${g.stress.peak}</td>
    <td class="num">${g.backtrack.route ?? 'n/a'}</td>
    <td class="num"${bad(dot > 0)}>${dot || '-'}</td>`;
}

/** the report's section */
export function renderFirstTimer(p: FirstTimerPass | undefined): string {
  if (!p) return '';
  const all = passFindings(p);
  const k = p.personas.kid, a = p.personas.adult;
  const ms = (v: number) => `${Math.round(v * 1000)} ms`;
  const rows = p.stages.map((s) => `<tr><td rowspan="2"><a href="#s${s.id}">${s.id}</a><div class="small muted">${esc(s.name)}</div></td><td>Easy</td>${cells(s.easy)}</tr><tr><td>Normal</td>${cells(s.normal)}</tr>`).join('');
  const find = all.slice(0, 40).map((f) => `<tr><td><a href="#s${f.id}">${f.id}</a></td><td>${f.settings.join(', ')}</td><td class="small">${esc(RULES[f.rule].name)}</td><td class="num">${f.x ?? ''}</td><td class="small">${esc(f.what)}${f.trials > 1 ? ` <span class="muted">(${f.runs} of ${f.trials} runs)</span>` : ''}</td></tr>`).join('');
  const ruleList = Object.values(p.rules).map((r) => `<li><b>${esc(r.name)}</b> (${esc(r.ref)}): ${esc(r.rule)}</li>`).join('');
  return `<section>
  <h2>First-timer bot: the pre-QA pass</h2>
  <p class="small muted">The real game engine, played the way a new player plays on a phone held sideways: Easy with a kid's thumb, Normal with an adult's, ${p.trials} run${p.trials === 1 ? '' : 's'} each on layout seed ${p.seed}. He goes the way the stage leads, holds that way, and only flicks a plain short jump when he is stopped or at an edge (a double only where a single failed); climbs a trunk he touches; stands at a puzzle and is put past it; heeds a warning or a tip about a second after it is on screen. Run this before the test link goes to the QA testers, and fix what it flags first.</p>
  <div class="panel tw"><table><thead><tr><th>Stage</th><th></th><th>Got to</th><th class="num">Hurt in first 5 s</th><th class="num">Hurt before its tip</th><th class="num">Hits / lives a min</th><th class="num">Plain walk</th><th class="num">Way on</th><th class="num">Worst jump SR</th><th class="num">Min window ms</th><th class="num">Peak stress</th><th class="num">Back- tracking</th><th class="num">Dot</th></tr></thead><tbody>${rows}</tbody></table></div>
  <h3>Findings, worst first</h3>
  <div class="panel tw"><table><thead><tr><th>Stage</th><th>Setting</th><th>Rule</th><th class="num">x</th><th>What</th></tr></thead><tbody>${find || '<tr><td colspan="5">Nothing flagged.</td></tr>'}</tbody></table></div>
  <details class="panel how"><summary>How the first-timer plays, and the rules it checks</summary>
  <ul>
    <li><b>Thumb</b> (Matt's Gemini research, part 3, Stage B and the four touch failure modes): presses late by N(${ms(k.thumb[0])}, ${ms(k.thumb[1])}) for the kid, N(${ms(a.thumb[0])}, ${ms(a.thumb[1])}) for the adult; a flick held N(${ms(k.hold[0])}, ${ms(k.hold[1])}) / N(${ms(a.hold[0])}, ${ms(a.hold[1])}), ${Math.round(k.short * 100)}% / ${Math.round(a.short * 100)}% cut to a 2-frame tap; ${k.hesitate} s / ${a.hesitate} s of hesitation before a punch and ${ms(k.swap[0])}-${ms(k.swap[1])} from a jump to a tap; the steering thumb drifts N(+${k.drift[0]}, ${k.drift[1]}) px/s (capped where the game's anchor follows it) and turning round costs its travel back at ${k.thumbSpeed} / ${a.thumbSpeed} px/s; a late lift-off of 1-4 / 0-2 frames when he means to stop. He takes in nothing for the first ${k.look} s / ${a.look} s of a stage, and heeds a warning or a tip ${k.heed} s / ${a.heed} s after it is on screen.</li>
    <li><b>Dot</b> is followed through the game's own queue (dotGuide.ts), so a line counts from when the phone shows it. Story asides are left out.</li>
    <li><b>Gates</b> (part 2 §8): survival per jump edge, counted on edges tried 3 times or more over the runs; the minimum input window, measured in the real engine by moving the press a frame at a time around his own take-off (running jumps between still ledges); peak stress, the summed failure share of the jumps in one burst before a rest (2.0 s Easy, 1.0 s Normal); backtracking, the main route's length over the straight line (only too long is flagged).</li>
    <li><b>Hold on from the start</b>: each stage is also played holding the way on from the first frame with no jump at all for 5 s.</li>
    <li><b>Limits</b>: one layout roll; he never backs up for a run-in or learns a stage between runs; a rescue (no progress for 20 s, or the same spot 5 times, or 3 lives at one spot) puts him further on so the rest is played. Lily pads and logs he takes as a first-timer does, so World 2's crossings cost him many lives.</li>
  </ul>
  <ul>${ruleList}</ul>
  </details>
</section>`;
}
