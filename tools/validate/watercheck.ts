/**
 * The water gate (gen2-water, 2026-11-05; the water rule W3, src/game/waterRule.ts; ENGINE-SPEC W3 on engine-spec da0e5ba4): calm and
 * deadly water never share one screen. Every stage the game builds (worldsData.generateAllLevels, every builder: the old generator,
 * the hand-built and World 2 stages, gen2, the mixer, Dot's and Meeca's stages), on layouts 1-16, Normal and Easy, built the way the
 * game builds it (stageGenerator.generateStage, then withGoals / easyStage as tools/engine/snapshot.ts does). Two kinds of miss:
 *   near        a room's calm pool (6-7's well) with deadly water (an open column over waterY, or a river that is not a teaching one)
 *               within W3_SCREEN (1,203 px, a sideways screen on Matt's phone; the spec's 844 is its CSS width) of it;
 *   calm-drawn  water drawn with the calm water's art (proto.water: calmWaterArt.ts, engine.ts zonePools) that costs a life: the one
 *               picture meaning both kinds of water (WATER-SWIM.md, the researcher's engine-render finding).
 * `waterknown.json` holds the misses there were when the gate was built, per (stage, setting, kind): how many layouts, the world, the
 * owner and the defect. The list only shrinks (LAWS.md law 5):
 *   - a miss with no entry, or more layouts than its entry: FAIL;
 *   - fewer layouts than its entry (or none): FAIL until the entry is lowered or taken off in the same commit;
 *   - knowncheck.mjs fails any entry added, or any count raised (each layout is one id there).
 *     npx tsx tools/validate/watercheck.ts                (exit 0 pass, 1 breach, 2 could not run)
 *     npx tsx tools/validate/watercheck.ts --only 6-7     (just these stages: no known-list verdict, prints the misses)
 *     WATERCHECK_WRITE=1 npx tsx tools/validate/watercheck.ts   (rewrites the counts from this run: only to lower them)
 */
import '../../src/game/headlessDom.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { openColumns, W3_SCREEN, W3_SPEC_PX, w3Misses } from '../../src/game/waterRule.ts';

export const LAYOUTS = 16;
const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'waterknown.json');
export type WaterKind = 'near' | 'calm-drawn';
export interface WaterKnown { stage: string; world: number; setting: 'normal' | 'easy'; kind: WaterKind; layouts: number; owner: string; defect: string }
const keyOf = (k: { stage: string; setting: string; kind: string }) => `${k.stage}|${k.setting}|${k.kind}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Built = any;
/** the misses on one built stage, each with a line saying where */
export function missesOf(st: Built): Array<{ kind: WaterKind; note: string }> {
  const out: Array<{ kind: WaterKind; note: string }> = [];
  for (const m of w3Misses(st)) out.push({ kind: 'near', note: `deadly ${m.what} at x ${m.at}, ${m.dist} px from the calm pool ${m.pool.x0}-${m.pool.x1}${m.dist <= W3_SPEC_PX ? ` (inside the spec's ${W3_SPEC_PX})` : ''}` });
  // (a drawn calm zone is deadly when a fall there meets the stage's fall: nothing laid under it, and no teaching pool or safe river there)
  const open = new Set(openColumns(st.platforms, st.config.levelWidth));
  for (const z of (st.proto?.water ?? []) as Array<{ x0: number; x1: number; y: number }>) {
    let at = -1;
    for (let x = Math.ceil(z.x0 / 10) * 10; x <= z.x1 && at < 0; x += 10) {
      const safe = st.safeWater?.some((s: { x0: number; x1: number }) => x > s.x0 && x < s.x1) || st.rivers?.some((r: { x0: number; x1: number; safe?: unknown }) => r.safe && x > r.x0 && x < r.x1);
      if (open.has(x) && !safe) at = x;
    }
    if (at >= 0) out.push({ kind: 'calm-drawn', note: `water drawn calm at ${Math.round(z.x0)}-${Math.round(z.x1)} costs a life (open at x ${at})` });
  }
  return out;
}

function main() {
  const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
  const levels = generateAllLevels().filter((c) => !only || only.includes(c.id));
  const t0 = Date.now();
  const counts = new Map<string, { stage: string; world: number; setting: 'normal' | 'easy'; kind: WaterKind; layouts: number; first: string }>();
  let builds = 0;
  for (const c of levels) {
    for (const setting of ['normal', 'easy'] as const) {
      for (let v = 1; v <= LAYOUTS; v++) {
        setLayoutVariant(v);
        let st: Built;
        try {
          st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
        } finally {
          setLayoutVariant(null);
        }
        builds++;
        const seen = new Set<WaterKind>();
        for (const m of missesOf(st)) {
          if (only) console.log(`  ${c.id} ${setting} L${v}: ${m.kind}: ${m.note}`);
          if (seen.has(m.kind)) continue;
          seen.add(m.kind);
          const k = keyOf({ stage: c.id, setting, kind: m.kind });
          const e = counts.get(k) ?? { stage: c.id, world: c.worldIndex, setting, kind: m.kind, layouts: 0, first: `L${v}: ${m.note}` };
          e.layouts++;
          counts.set(k, e);
        }
      }
    }
  }
  console.log(`watercheck: ${levels.length} stages, ${builds} builds in ${((Date.now() - t0) / 1000).toFixed(0)} s; a screen is ${W3_SCREEN} px`);
  if (only) {
    for (const e of counts.values()) console.log(`  ${keyOf(e)}: ${e.layouts}/${LAYOUTS} layouts (first: ${e.first})`);
    return;
  }
  const known: WaterKnown[] = JSON.parse(fs.readFileSync(FILE, 'utf8')).known;
  if (process.env.WATERCHECK_WRITE) {
    const next = known.filter((k) => counts.has(keyOf(k))).map((k) => ({ ...k, layouts: Math.min(k.layouts, counts.get(keyOf(k))!.layouts) }));
    fs.writeFileSync(FILE, JSON.stringify({ ...JSON.parse(fs.readFileSync(FILE, 'utf8')), known: next }, null, 1) + '\n');
    console.log(`watercheck: rewrote ${FILE} (${next.length} entries; a new miss is never written: fix it)`);
  }
  let bad = 0;
  const byKey = new Map(known.map((k) => [keyOf(k), k]));
  for (const [k, e] of counts) {
    const kn = byKey.get(k);
    if (!kn) {
      bad++;
      console.log(`✗ ${k} (World ${e.world}): ${e.layouts}/${LAYOUTS} layouts, not on the known list (first: ${e.first})`);
    } else if (e.layouts > kn.layouts) {
      bad++;
      console.log(`✗ ${k} (World ${e.world}): ${e.layouts} layouts, over its known ${kn.layouts} (first: ${e.first})`);
    } else if (e.layouts < kn.layouts) {
      bad++;
      console.log(`✗ ${k} (World ${e.world}): ${e.layouts} layouts, under its known ${kn.layouts}: lower the entry in this commit (the list only shrinks)`);
    } else console.log(`  known: ${k} (World ${e.world}): ${e.layouts}/${LAYOUTS} layouts (${kn.defect}, owner ${kn.owner})`);
  }
  for (const kn of known) {
    if (counts.has(keyOf(kn))) continue;
    bad++;
    console.log(`✗ ${keyOf(kn)} (World ${kn.world}): fixed, but still on the known list: take it off in this commit`);
  }
  console.log(bad ? `watercheck: FAIL (${bad})` : `watercheck: PASS (${known.length} known)`);
  process.exit(bad ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('watercheck.ts')) {
  try {
    main();
  } catch (e) {
    console.log(`watercheck: could not run: ${(e as Error).stack}`);
    process.exit(2);
  }
}
