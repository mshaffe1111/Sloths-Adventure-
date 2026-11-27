// BUILD-29-d: the lock (TEMPO_29.lock, 0.90 the lead's ruling 4) FLOWN on the 2-9 draft's own locked lianas (oneLock.ts's read, on the real
// stage row): where ONE sits inside each liana's let-go window, seeds 1-3 both settings. npx tsx reference/qa-reports/BUILD-29/probes/lock29.ts
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { lockedLianas } from '../../../../src/game/gen2/riverLay.ts';
import { STAGE_29, TEMPO_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
console.log(`TEMPO_29.lock ${TEMPO_29.lock}`);
for (const d of ['normal', 'easy'] as const) for (let seed = 1; seed <= 3; seed++) {
  const st = withTestStage({ [STAGE_29]: draft29Row() }, () => buildGen2Stage({ config: draft29Cfg(), kit: kitLib29(), seed, difficulty: d }));
  const bar = TEMPO_29.bar * (d === 'easy' ? TEMPO_29.easyStretch! : 1);
  const base = lockedLianas(st, d);
  if (!base.length) console.log(`${d} s${seed}: NO locked lianas`);
  base.forEach(({ liana, drops }, i) => {
    const ok = (dl: number) => { const p0 = liana.swingPhase; liana.swingPhase = (p0 ?? 0) + dl; const r = lockedLianas(st, d)[i].drops.one; liana.swingPhase = p0; return r; };
    let early = 0, late = 0;
    for (let k = 1; k <= 100 && ok(-k / 200); k++) early = k / 200;
    for (let k = 1; k <= 100 && ok(k / 200); k++) late = k / 200;
    console.log(`${d} s${seed} x${Math.round(liana.x)} one=${drops.one} window=${drops.window.toFixed(2)}s share=${Math.round(drops.share * 100)}% ONE early-side ${(early * bar).toFixed(2)}s late-side ${(late * bar).toFixed(2)}s`);
  });
}
