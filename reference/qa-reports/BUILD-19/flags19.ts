/**
 * BUILD-19b: gen2's own flag verdict on every proven 1-9 roll, both settings, built the way the game builds it (its stage-table row: the
 * kit, then finish19; listed.ts). The proof the lead asked for before flagSpan LV-9's floor counts one hand-built stage fewer (the
 * hand-built 1-9 left HAND_STAGES; LV-9's 4000 px rule is unchanged and gen2's rolledFlagBreaches holds a rolled stage's flags).
 * Per roll: the pipeline's own 'flags:' errors, rolledFlagBreaches (a flag before every hard node, 900-4000 px apart, 2300 where a life
 * can be lost, the last within 2000 of the exit), and the widest span between flags with the start and the shrine counted (LV-9's measure).
 *   npx tsx reference/qa-reports/BUILD-19/flags19.ts            (PLANT=1: the first roll's flags taken away, it must fail)
 */
import '../../../src/game/headlessDom.ts';
import { buildGen2Stage, HARD_JOBS, lethalSpans, rolledFlagBreaches } from '../../../src/game/gen2/pipeline.ts';
import { JOB_OF } from '../../../src/game/gen2/nodeCode.ts';
import { listedStage } from '../../../src/game/gen2/listed.ts';
import { provenSeeds } from '../../../src/game/gen2/seedList.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { FLAG_SPAN_MAX } from '../../../src/game/easyMode.ts';

const ID = '1-9';
const cfg = generateAllLevels().find((c) => c.id === ID && !c.secret)!;
const row = listedStage(ID)!;
const seeds = provenSeeds(ID);
let bad = 0, widest = 0, rolls = 0;
const flags: number[] = [];
for (const d of ['normal', 'easy'] as const) {
  for (const seed of seeds) {
    const raw = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    const st = (row.finish ? row.finish(raw, d) : raw) as typeof raw;
    rolls++;
    // (planted: PLANT=1 takes the first roll's flags away; the proof must then fail by name)
    if (process.env.PLANT === '1' && rolls === 1) st.checkpoints = [];
    const errs = (st.gen2.errors ?? []).filter((e) => e.startsWith('flags:'));
    const hard = (st.gen2.nodes ?? []).filter((q) => HARD_JOBS.has(JOB_OF[q.token[0] as keyof typeof JOB_OF] ?? '')).map((q, i) => ({ id: `${q.token} #${i + 1}`, x0: q.x0 }));
    const breaches = rolledFlagBreaches(st, hard, lethalSpans(st, st.gen2.falls ?? []));
    const xs = [st.spawnX, ...(st.checkpoints ?? []).map((p) => p.x), st.exitTotemX].sort((a, b) => a - b);
    let m = 0;
    for (let i = 1; i < xs.length; i++) m = Math.max(m, xs[i] - xs[i - 1]);
    widest = Math.max(widest, m);
    flags.push((st.checkpoints ?? []).length);
    if (errs.length || breaches.length || m > FLAG_SPAN_MAX || hard.length < 4) {
      bad++;
      console.log(`${d} seed ${seed}: hard ${hard.length} errs ${errs.join('; ')} breaches ${breaches.join('; ')} widest ${Math.round(m)}`);
    }
  }
}
console.log(`1-9 flags: ${rolls} rolls (${seeds.length} proven seeds x normal, easy), ${bad} breaching; widest span ${Math.round(widest)} px (LV-9's max ${FLAG_SPAN_MAX}); flags a roll ${Math.min(...flags)}-${Math.max(...flags)}`);
process.exit(bad ? 1 : 0);
