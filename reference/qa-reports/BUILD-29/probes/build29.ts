// scratch: does 2-9's draft build on both settings for seeds 1..N (TLEN etc. from env)
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { DRAFT_ID_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
const N = Number(process.argv[2] ?? 3), cfg = draft29Cfg(DRAFT_ID_29), row = draft29Row([], DRAFT_ID_29);
const out: string[] = [];
withTestStage({ [DRAFT_ID_29]: row }, () => {
  for (const d of ['normal', 'easy'] as const) for (let s = 1; s <= N; s++) {
    try { const st = buildGen2Stage({ config: cfg, kit: kitLib29(DRAFT_ID_29), seed: s, difficulty: d }); out.push(`${d[0]}${s}:ok${st.gen2.seed !== s ? '@' + st.gen2.seed : ''}`); }
    catch (e) { out.push(`${d[0]}${s}:FAIL(${String((e as Error).message).match(/he waits [0-9.]+ s|under the [^)]*|[^:]*$/)?.[0]?.slice(0, 60)})`); }
  }
});
console.log(`TLEN=${process.env.TLEN} ${out.join(' ')}`);
