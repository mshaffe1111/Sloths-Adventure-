// BUILD-29 READY (a)/(b) probe: where ONE sits inside each locked court liana's landing run on the tempo toy (2-4's liana over `court`). LOCK=<share> npx tsx reference/qa-reports/BUILD-29/probes/oneLock.ts (unset: 0, the court's lock)
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { lockedLianas } from '../../../../src/game/gen2/riverLay.ts';
import { COURT_TEMPO, TEMPO_ID, tempoCfg, tempoKit, tempoRow } from '../../../../src/game/gen2/worlds/w2TempoToy.ts';
const O = { tempo: { ...COURT_TEMPO, lock: Number(process.env.LOCK ?? 0) } };
for (const d of ['normal', 'easy'] as const) for (let seed = 1; seed <= 2; seed++) {
  const st = withTestStage({ [TEMPO_ID]: tempoRow(O) }, () => buildGen2Stage({ config: tempoCfg(), kit: tempoKit(O), seed, difficulty: d }));
  const bar = COURT_TEMPO.bar * (d === 'easy' ? COURT_TEMPO.easyStretch : 1);
  const base = lockedLianas(st, d);
  base.forEach(({ liana, drops }, i) => {
    const ok = (dl: number) => { const p0 = liana.swingPhase; liana.swingPhase = (p0 ?? 0) + dl; const r = lockedLianas(st, d)[i].drops.one; liana.swingPhase = p0; return r; };
    let early = 0, late = 0;
    for (let k = 1; k <= 100 && ok(-k / 200); k++) early = k / 200;
    for (let k = 1; k <= 100 && ok(k / 200); k++) late = k / 200;
    console.log(`${d} s${seed} x${Math.round(liana.x)} one=${drops.one} window=${drops.window.toFixed(2)}s share=${Math.round(drops.share * 100)}% ONE early-side ${(early * bar).toFixed(2)}s late-side ${(late * bar).toFixed(2)}s`);
  });
}
