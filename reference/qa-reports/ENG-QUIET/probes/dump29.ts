// ENG-QUIET scratch: the gate river, the shrine snapper and the six sections on 2-9 seed 1 (npx tsx <this>)
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage, playFinish } from '../../../../src/game/gen2/listed.ts';
import { stageSource } from '../../../../tools/engine/libstage.ts';
const { kit, cfg } = stageSource('2-9'); const row = listedStage('2-9')!;
const st = playFinish(row, structuredClone(buildGen2Stage({ config: cfg, kit: kit(), seed: 1, difficulty: 'normal' }) as any), 'normal') as any;
const sh = (o: any) => JSON.stringify(o, (k, v) => (k === 'drift' || k === 'art' || Array.isArray(v) && v.length > 6 ? undefined : typeof v === 'number' ? Math.round(v * 100) / 100 : v)).slice(0, 420);
for (const r of st.rivers) if (r.x1 >= 862 && r.x0 <= 2180 || r.x1 >= 25544 && r.x0 <= 27011) console.log('river', sh(r));
for (const e of st.enemies) if (e.x > 27000 && e.x < 29200) console.log('enemy', sh(e));
for (const p of st.meta?.pieces ?? []) if ((p.x ?? p.x0) >= 600 && (p.x ?? p.x0) <= 2200 || (p.x ?? p.x0) >= 25500 && (p.x ?? p.x0) <= 29200) console.log('piece', sh(p));
for (const q of st.gen2.sections) if (/gate|barge|shrine/.test(q.id ?? q.template)) console.log('sec', q.id ?? q.template, Math.round(q.x0), Math.round(q.x1), sh(q).slice(0, 200));
