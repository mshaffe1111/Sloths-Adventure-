// BUILD-29-d rule 28: the kid's misses traced on the draft (draft29.ts onDraft29 + firstTimer's onFrame), one line every 10 frames
// while he is inside [X0, X1]: his x/y, grounded, the nearest foe (type, x, its state). npx tsx reference/qa-reports/BUILD-29/probes/kidTrace.ts <setting> <seed> <x0> <x1>
import { onDraft29 } from '../../../../tools/inspect/draft29.ts';
import { CAST_BOTS } from '../../../../tools/inspect/castBots.ts';
import { firstTimer } from '../../../../tools/inspect/firsttimer.ts';
import { DRAFT_ID_29 as STAGE_29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
const [setting, seed, x0, x1] = [process.argv[2] as 'normal' | 'easy', Number(process.argv[3]), Number(process.argv[4]), Number(process.argv[5])];
let fr = 0;
const r = onDraft29(seed, () => firstTimer(STAGE_29, seed, CAST_BOTS.kid[setting]!, {
  cap: 1200, dotSetting: true,
  onFrame: (sim: any) => {
    fr++;
    const p = sim.p;
    if (p.x < x0 || p.x > x1 || fr % 10) return;
    const es = (sim.e?.enemies ?? sim.enemies ?? []) as any[];
    const f = es.filter((m) => !m.defeated).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
    const fs = f ? `${f.type}@${Math.round(f.x)},${Math.round(f.y)} ${f.state ?? ''}${f.shell ? ' shell' : ''}${f.stunned ? ' stun' : ''}${f.patrolMinX !== undefined ? ` pat ${Math.round(f.patrolMinX)}-${Math.round(f.patrolMaxX)}` : ''}` : '-';
    console.log(`f${fr} x${Math.round(p.x)} y${Math.round(p.y)} ${p.grounded ? 'G' : 'air'} vx${Math.round(p.vx ?? 0)} | ${fs}`);
  },
} as any));
console.log(JSON.stringify({ end: r.end, goal: r.goal, rescues: (r as any).rescues, rescueXs: (r as any).rescueXs }).slice(0, 300));
