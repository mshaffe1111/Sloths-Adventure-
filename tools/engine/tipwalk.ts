// The tip walk (R-165.236, the TIPS packet 11-14; promoted from INT-7b's browser probe reference/qa-reports/INT-7/tools/tipwalk.mjs):
// every rolled stage that climbs or comes down (a gen2 tower: its storeys share their x, so a tip that fires by x alone fires a storey
// or more away from what it teaches), on N layouts and both settings, judged two ways:
//   1. the build's own tip verdict (gen2 pipeline tipMisses): no tip said more than TIP_NEAR px of route before its socket, each in the
//      first section to show what it teaches;
//   2. the real engine (src/game/realPlay.ts runs engine.ts one 30 fps frame at a time, the code the phone runs): from the spawn, hold
//      the way the stage starts with a jump every 20 frames for 20 s; every tip said on that walk must have his feet inside its band.
//      1-4 by x alone said all four teach lines in the first 3 s on the start floor.
// npx tsx tools/engine/tipwalk.ts [--layouts 4] [--stages 1-4,1-6] [--strip]   (--strip: the bands taken off, x alone: the planted run)
// Exit 1 on any miss, each named. Its own test: tools/engine/tipwalk.test.ts.
import '../../src/game/headlessDom.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { GEN2_STAGES } from '../../src/game/gen2/game.ts';
import { LISTED } from '../../src/game/gen2/listed.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { tipMisses, TIP_NEAR } from '../../src/game/gen2/pipeline.ts';
import type { StageHint } from '../../src/game/protoStage.ts';
import type { Gen2Stage } from '../../src/game/gen2/types.ts';

export interface TipWalk { stage: string; setting: 'normal' | 'easy'; layout: number; flow: string; lines: string[]; misses: string[] }

/** a rolled stage's kit, as the game takes it (stageGenerator.ts: a listed stage's kit, gen2/listed.ts, else gen2/game.ts's) */
export const kitOf = (stage: string, setting: 'normal' | 'easy') => LISTED[stage]?.kit() ?? GEN2_STAGES[stage]?.kit(setting);

/** the stages the walk judges: every rolled stage whose build is a tower (up, down or legs), as the game builds it */
export function verticalStages(): string[] {
  const out: string[] = [];
  for (const c of generateAllLevels().filter((l) => !l.secret && kitOf(l.id, 'normal'))) {
    try {
      const r = new RealPlay(c.id, 1);
      if ((r.stage as unknown as Gen2Stage).gen2?.tower) out.push(c.id);
    } catch {
      /* a stage that does not build is another gate's */
    }
  }
  return out;
}

/** one stage, one layout, one setting: the verdict and the floor walk */
export function tipWalk(stage: string, layout: number, setting: 'normal' | 'easy', o: { strip?: boolean; seconds?: number } = {}): TipWalk {
  try {
    localStorage.clear();
  } catch {
    /* none */
  }
  setDifficulty(setting);
  const r = new RealPlay(stage, layout);
  const st = r.stage as unknown as Gen2Stage;
  const hs = ((st.proto as { hints?: StageHint[] } | undefined)?.hints ?? []) as StageHint[];
  const bands = new Map(hs.map((h) => [h, h.band]));
  if (o.strip) for (const h of hs) delete (h as { band?: unknown }).band;
  const T = st.gen2?.tower;
  const kit = kitOf(stage, setting);
  const misses = st.gen2 && kit ? tipMisses({ ...st, proto: { hints: hs.map((h) => ({ ...h, band: o.strip ? [-1e9, 1e9] : h.band })) } } as never, kit.manifest) : [];
  if (st.gen2?.budget?.difficulty !== setting) misses.push(`built ${st.gen2?.budget?.difficulty}, asked ${setting}`);
  const lines = [`spawn x ${Math.round(r.p.x)} y ${Math.round(r.p.y)}, built ${st.gen2?.budget?.difficulty} seed ${st.gen2?.seed}, ${T?.flow ?? 'run'}; TIP_NEAR ${TIP_NEAR}`];
  const way = T?.flow === 'down' || (st.exitTotemX ?? Infinity) < r.p.x ? { left: true } : { right: true };
  const said = new Set<StageHint>(hs.filter((h) => h.shown));
  for (let i = 0; i < (o.seconds ?? 20) * 30; i++) {
    r.frame({ ...way, jump: i % 20 < 2, press: i % 20 === 0 });
    for (const h of hs) {
      if (!h.shown || said.has(h)) continue;
      said.add(h);
      const feet = Math.round(r.p.y + r.p.height), b = bands.get(h);
      lines.push(`t ${r.t.toFixed(1)} s: "${h.text.slice(0, 40)}" (tip x ${h.x}, band ${b?.join('..') ?? 'none'}) said at x ${Math.round(r.p.x)}, feet ${feet}`);
      if (b && (feet < b[0] || feet > b[1])) misses.push(`"${h.text.slice(0, 40)}" said with his feet at ${feet}, outside its band ${b.join('..')} (x ${Math.round(r.p.x)}, ${r.t.toFixed(1)} s into the walk)`);
    }
  }
  lines.push(`after ${o.seconds ?? 20} s: x ${Math.round(r.p.x)} y ${Math.round(r.p.y)}`);
  return { stage, setting, layout, flow: T?.flow ?? 'run', lines, misses };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
  const N = Number(arg('--layouts') ?? 4);
  const stages = arg('--stages')?.split(',') ?? verticalStages();
  const strip = process.argv.includes('--strip');
  let bad = 0;
  console.log(`tipwalk: ${stages.length} vertical stage(s) [${stages.join(', ')}], ${N} layouts x Normal and Easy${strip ? ', BANDS OFF (x alone)' : ''}`);
  if (!stages.length) { console.log('tipwalk: no vertical rolled stage found: FAIL (the walk must judge something)'); process.exit(1); }
  for (const s of stages) for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    const w = tipWalk(s, v, setting, { strip });
    console.log(`${s} ${setting} layout ${v} (${w.flow}):\n  ${w.lines.join('\n  ')}`);
    for (const m of w.misses) console.log(`  MISS ${m}`);
    bad += w.misses.length;
  }
  console.log(bad ? `tipwalk: ${bad} miss(es): FAIL` : 'tipwalk: PASS');
  process.exit(bad ? 1 : 0);
}
