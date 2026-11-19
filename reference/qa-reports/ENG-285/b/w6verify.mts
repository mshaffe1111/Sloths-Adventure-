// re-verify a stage's shipped curated seeds on this head with the curation's own measures and rules (ENG-285b, seeds.test.ts:40)
import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import { GEN2_SEEDS } from '/home/user/Sloths-Adventure-/src/game/gen2/seeds.ts';
import { botCheck, measureRoll, resolveStage } from '/home/user/Sloths-Adventure-/tools/gen2/curate.ts';
const key = process.argv[2] ?? '6-1';
const e = GEN2_SEEDS[key];
const stage = await resolveStage(key, e.kit);
const out: unknown[] = [];
for (const s of e.seeds.filter((x) => !process.env.ONLY || process.env.ONLY.split(",").includes(String(x.seed)))) {
  const m = measureRoll(stage, s.seed, e.recent, e.waived as never);
  const b = botCheck(stage, m, e.recent);
  const why = [...m.fails];
  if (b.kid) why.push(`kid bot: ${b.kid} jump(s) under 85%`);
  if (b.adult) why.push(`adult bot: ${b.adult} jump(s) under 70%`);
  const plan = m.plan.join(' ');
  const row = { seed: s.seed, moved: plan !== s.sections, layoutSame: m.layoutSeed === s.layoutSeed, fails: why,
    was: { quick: s.quick, model: s.model, dead: s.dead, quiet: s.quiet, worstJump: s.worstJump, band: s.band, quality: s.quality },
    now: { quick: { normal: +m.normal.quick.toFixed(1), easy: +m.easy.quick.toFixed(1) }, model: { typical: m.normal.typical, fast: m.normal.fast },
      dead: { normal: +m.normal.dead.toFixed(1), easy: +m.easy.dead.toFixed(1) }, quiet: { normal: +m.normal.longestQuiet.toFixed(1), easy: +m.easy.longestQuiet.toFixed(1) },
      worstJump: { kid: b.worstKid, adult: b.worstAdult }, band: b.band, quality: m.quality }, plan };
  out.push(row);
  console.log(`${key} ${s.seed}: ${row.moved ? 'PLAN MOVED' : 'plan same'}; ${why.length ? 'FAILS ' + why.join('; ') : 'passes'}; quick ${row.now.quick.normal}/${row.now.quick.easy} (was ${s.quick.normal}/${s.quick.easy}) quiet ${row.now.quiet.normal}/${row.now.quiet.easy} dead ${row.now.dead.normal}/${row.now.dead.easy}`);
}
(await import('node:fs')).writeFileSync(process.env.OUT ?? '/dev/null', JSON.stringify(out, null, 1));
