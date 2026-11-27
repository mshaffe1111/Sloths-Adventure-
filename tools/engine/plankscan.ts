// ENG-GROUND-b: where does a stage lay a thin piece (a plank, not a bank: under 90 deep) between two pockets of water, with no water
// under it (World 2's finish turns each fall into its own pocket: w2.ts w2Finish)? Every World 2 stage (and any with rivers), both
// settings, layouts 1..--layouts, plus the out-and-back toy (--toys). Prints each: the piece, the pockets either side, their surfaces.
//   npx tsx tools/engine/plankscan.ts [--layouts 16] [--toys]
import '../../src/game/headlessDom.ts';

(globalThis as Record<string, unknown>).Image = class {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  width = 1; height = 1; naturalWidth = 1; naturalHeight = 1; complete = true;
  set src(_u: string) { this.onload?.(); }
  decode() { return { then: (ok: () => void) => ok() }; }
};

const { generateAllLevels } = await import('../../src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import('../../src/game/stageGenerator.ts');
const { easyStage } = await import('../../src/game/easyMode.ts');
const { withGoals } = await import('../../src/game/goals.ts');
const { buildGen2Stage } = await import('../../src/game/gen2/pipeline.ts');
const { towerCfg } = await import('../../src/game/gen2/toyTower.ts');
const { homeKit, POST_CODE, HOME_CODE } = await import('../../src/game/gen2/toyHome.ts');
const { w2Finish } = await import('../../src/game/gen2/worlds/w2.ts');
type P = import('../../src/game/types.ts').Platform;
type R = { x0: number; x1: number; surfaceY: number };

const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const N = Number(arg('--layouts') ?? 16);

/** thin static pieces with a pocket of water meeting each end */
function planks(st: { platforms: P[]; rivers?: R[] }): Array<{ p: P; l: R; r: R }> {
  const out: Array<{ p: P; l: R; r: R }> = [];
  const rs = st.rivers ?? [];
  for (const p of st.platforms) {
    if (p.broken || p.type !== 'solid' || p.height >= 90) continue;
    const l = rs.find((r) => Math.abs(r.x1 - p.x) <= 4 && r.surfaceY > p.y && r.surfaceY - p.y < 120);
    const r = rs.find((r) => Math.abs(r.x0 - (p.x + p.width)) <= 4 && r.surfaceY > p.y && r.surfaceY - p.y < 120);
    if (l && r) out.push({ p, l, r });
  }
  return out;
}
const rows: string[] = [];
const counts = new Map<string, number>();
const report = (id: string, setting: string, v: number | string, st: { platforms: P[]; rivers?: R[] }) => {
  const s = planks(st);
  counts.set(id, (counts.get(id) ?? 0) + (s.length ? 1 : 0));
  for (const o of s) rows.push(`${id} ${setting} ${v}: plank #${o.p.id} x${Math.round(o.p.x)}+${Math.round(o.p.width)} y${Math.round(o.p.y)} h${Math.round(o.p.height)}; pockets x${Math.round(o.l.x0)}..${Math.round(o.l.x1)} surf ${Math.round(o.l.surfaceY)} | x${Math.round(o.r.x0)}..${Math.round(o.r.x1)} surf ${Math.round(o.r.surfaceY)}`);
};
let builds = 0;
for (const c of generateAllLevels().filter((c) => !c.secret)) {
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    setLayoutVariant(v);
    let st: any;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); }
    catch { setLayoutVariant(null); continue; }
    setLayoutVariant(null);
    builds++;
    if (st.rivers?.length) report(c.id, setting, `v${v}`, st);
  }
}
if (process.argv.includes('--toys')) {
  const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
  for (const [name, code] of [['post', POST_CODE], ['home', HOME_CODE]] as const)
    for (const difficulty of ['normal', 'easy'] as const) for (let seed = 1; seed <= 4; seed++) {
      const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', code), seed, difficulty }) as never, difficulty) as any;
      report(`toy-${name}`, difficulty, `seed${seed}`, st);
    }
}
console.log(rows.join('\n'));
console.log(`plankscan: ${builds} builds; stages with a plank between two pockets on any build: ${[...counts].filter(([, n]) => n).map(([k, n]) => `${k} ${n}`).join(', ') || 'none'}`);
