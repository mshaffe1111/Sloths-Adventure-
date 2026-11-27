// ENG-GROUND: where does a stage stack walkable ground, a piece he stands on lying UNDER another piece whose earth the ground painter runs
// down out of sight (protoArt.ts drawBankArt: the painted ground's soil to the view's foot; terrain.ts footingOf: drawn ground, steps,
// pillars, earth and stalks to the view's bottom)? Every stage, both settings, layouts 1..--layouts, built as the game builds it, with
// the paint state set as engine.ts sets it (paintStage.ts). Prints each stage with a stack: the upper piece, the lower, the gap.
//   npx tsx tools/engine/stackscan.ts [--layouts 16] [--stages 2-7,1-4] [--toys]   (--toys adds the out-and-back toy, 2-7's shape)
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
const { stagePaintInput } = await import('./paintStage.ts');
const { paintedBank } = await import('../../src/game/w1Pits.ts');
const { footingOf } = await import('../../src/game/terrain.ts');
const { buildGen2Stage } = await import('../../src/game/gen2/pipeline.ts');
const { towerCfg } = await import('../../src/game/gen2/toyTower.ts');
const { homeKit, POST_CODE, HOME_CODE } = await import('../../src/game/gen2/toyHome.ts');
const { w2Finish } = await import('../../src/game/gen2/worlds/w2.ts');
const { planStage } = await import('../../src/game/platformPlan.ts');
const { lookFor } = await import('../../src/game/scenery.ts');
const { getSceneSeed } = await import('../../src/game/sceneSeed.ts');
type P = import('../../src/game/types.ts').Platform;

const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const N = Number(arg('--layouts') ?? 16);
const only = arg('--stages')?.split(',');
/** the clear gap under the upper collider that makes a leg under it: --gap (default his height and a double jump, 48 + DOUBLE_RISE) */
const GAP = Number(arg("--gap") ?? 233);

/** the pieces whose earth runs down out of sight, as the stage draws them */
function earthOf(st: { platforms: P[]; proto?: unknown; groundLook?: 'bough' }, c: { worldIndex: number; objectiveType?: string }): { kind: string; earth: P[] } {
  const pin = stagePaintInput(st, c);
  if (pin) {
    // (a bough stage's ground is the bough's own thickness: nothing runs down)
    if (st.groundLook === 'bough') return { kind: 'bough', earth: [] };
    return { kind: 'painted', earth: st.platforms.filter(paintedBank) };
  }
  // (no painted kit: terrain draws the ground; a footing whose body runs to the view's bottom is earth)
  const f = { painted: new Set<number>(), plan: planStage(st.platforms, c.worldIndex, getSceneSeed()), look: lookFor(c.worldIndex), rivers: c.worldIndex === 2 || st.platforms.some((q) => q.lily) };
  return { kind: 'drawn', earth: st.platforms.filter((p) => footingOf(p, f).bodyBottom === Infinity) };
}

/** a piece he stands on that lies under an earth piece's top, inside its x span: [upper, lower] */
function stacks(platforms: P[], earth: P[]): Array<{ up: P; low: P }> {
  const out: Array<{ up: P; low: P }> = [];
  for (const up of earth)
    for (const low of platforms) {
      if (low === up || low.broken) continue;
      const ov = Math.min(up.x + up.width, low.x + low.width) - Math.max(up.x, low.x);
      if (ov <= 8) continue;
      // (under the upper's own collider: its soil is drawn there and nothing stands inside a solid)
      // (a piece the upper stands on, its foot on the lower top, is its floor, not a leg under it: a clear gap of 20 or more)
      if (low.y < up.y + up.height + GAP) continue;
      out.push({ up, low });
    }
  return out;
}

const rows: string[] = [];
const report = (id: string, setting: string, v: number, kind: string, st: { platforms: P[] }, earth: P[]) => {
  const s = stacks(st.platforms, earth);
  if (!s.length) return 0;
  const xs = s.map((o) => Math.round(Math.max(o.up.x, o.low.x)));
  const gap = s.map((o) => Math.round(o.low.y - o.up.y));
  rows.push(`${id} ${setting} v${v} (${kind}): ${s.length} stacked pairs, x ${Math.min(...xs)}..${Math.max(...xs)}, under by ${Math.min(...gap)}..${Math.max(...gap)} px; e.g. upper #${s[0].up.id} (${Math.round(s[0].up.x)},${Math.round(s[0].up.y)} w${Math.round(s[0].up.width)} h${Math.round(s[0].up.height)}) over #${s[0].low.id} ${s[0].low.type} (${Math.round(s[0].low.x)},${Math.round(s[0].low.y)} w${Math.round(s[0].low.width)})`);
  return s.length;
};

const levels = generateAllLevels().filter((c) => !c.secret && (!only || only.includes(c.id)));
const counts = new Map<string, number>();
let builds = 0;
for (const c of levels) {
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    setLayoutVariant(v);
    let st: any;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); }
    catch { setLayoutVariant(null); continue; }
    setLayoutVariant(null);
    builds++;
    const { kind, earth } = earthOf(st, c);
    const n = report(c.id, setting, v, kind, st, earth);
    counts.set(`${c.id} (${kind})`, (counts.get(`${c.id} (${kind})`) ?? 0) + (n ? 1 : 0));
  }
}
if (process.argv.includes('--toys')) {
  const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
  for (const [name, code] of [['post', POST_CODE], ['home', HOME_CODE]] as const)
    for (const difficulty of ['normal', 'easy'] as const) for (let seed = 1; seed <= 4; seed++) {
      const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', code), seed, difficulty }) as never, difficulty) as any;
      const { kind, earth } = earthOf(st, { worldIndex: 2 });
      report(`toy-${name}`, difficulty, seed, kind, st, earth);
    }
}
console.log(rows.join('\n'));
console.log(`stackscan: ${builds} builds; stages with a stack on any build: ${[...counts].filter(([, n]) => n).map(([k, n]) => `${k} ${n}/${2 * N}`).join(', ') || 'none'}`);
