/**
 * probe12.ts: can 1-2 build on gen2 today, and are its graphs valid? (the Designer, 1-2 packet; nothing in the game imports it)
 *   npx tsx reference/specs/sims/probe12.ts [seeds=8]
 * It reads the three harvest graphs of CONTENT-1-2-relay.md through the engine's own parser and checker, then asks gen2 to build 1-2 from
 * World 1's kit with 1-2's brief added IN MEMORY (w1.ts is not edited), on both settings, and prints what the engine says.
 */
import '../../../src/game/headlessDom.ts';
import { parseCode, checkCode } from '../../../src/game/gen2/nodeCode.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';

export const HARVEST_12: Record<string, string> = {
  'harvest-12-A': 'A T P F R M X R F C R S E',
  'harvest-12-B': 'A T F P R U D_ F R X R W R S E',
  'harvest-12-C': 'A T M F R C X R D_ F P S E',
};
for (const [id, code] of Object.entries(HARVEST_12)) {
  const bad = checkCode(parseCode(code), {});
  console.log(`${id}  "${code}"  ${bad.length ? 'BREAKS ' + bad.join('; ') : 'valid (V1-V21 as the parser checks a bare graph)'}`);
}
const config = generateAllLevels().find((c) => c.id === '1-2')!;
console.log(`\nconfig 1-2: objective ${config.objectiveType}, targetCount ${config.targetCount}, world ${config.worldIndex}, mini ${config.miniIndex}`);
const n = Number(process.argv[2] ?? 8);
for (const difficulty of ['normal', 'easy'] as const) {
  for (let seed = 1; seed <= n; seed++) {
    const kit = w1World();
    const G = kit.manifest.graphs as unknown as { list: unknown[]; briefs: Record<string, unknown> };
    G.list.push(...Object.entries(HARVEST_12).map(([id, code]) => ({ id, archetype: 'harvest', code })));
    G.briefs['1-2'] = { ends: 'quiet', trend: 'level', branching: 'lots', teaches: [], deal: { ground: 40, climb: 30, bounce: 30 } };
    (kit.manifest as unknown as { lessons: Record<string, string> }).lessons = { jump: '1-1', double: '1-1', bounce: '1-1' };
    try {
      const st = buildGen2Stage({ config, kit, seed, difficulty });
      const g = st.gen2 as unknown as { errors?: string[]; code?: string; sections?: Array<{ id?: string; section?: string }> };
      console.log(`${difficulty} seed ${seed}: width ${Math.round((st as unknown as { config?: { levelWidth?: number } }).config?.levelWidth ?? 0)}  errors ${g.errors?.length ?? 0}${g.errors?.length ? ': ' + g.errors.slice(0, 3).join(' | ').slice(0, 300) : ''}`);
      if (seed === 1) console.log(`   code: ${g.code ?? '(none)'}\n   sections: ${(g.sections ?? []).map((q) => q.id ?? q.section).join(', ').slice(0, 600)}`);
    } catch (e) {
      console.log(`${difficulty} seed ${seed}: THROWS ${(e as Error).message.slice(0, 300)}`);
    }
  }
}
