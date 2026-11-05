// RUNS (engine-runs helper, 2026-11-05): the move ladder's USE COUNTS. moveladder.ts records only which stages a mechanic shows in; the
// ladder rows (TRIAGE #126 #127 #152 #154) need how much it is used per stage. Same build (tools/validate/play.ts sim = RealPlay, the
// real engine), same MECHS counts (tools/validate/mechanics.ts), plus two the MECHS list lacks: swim (calm pools, engine.ts calmPools ->
// swim.ts kitPools) and drawn water zones (proto.water, engine.ts zonePools). Normal, per layout. A new measure only because none exists.
// --root <tree> builds another tree's stages (main, for the old 1-1 to 1-3 of #145) with this tree's MECHS counts; play.ts's sim is
// setDifficulty + new RealPlay(id, layout), done here from the root's own src/game.
//   npx tsx tools/engine/runs/ladder-uses.ts --layouts 16 --from 0 --to 102 [--root /path/to/tree] > out.json
import { MECHS } from '../../validate/mechanics.ts';
const ri = process.argv.indexOf('--root');
const root = ri >= 0 ? process.argv[ri + 1] : new URL('../../..', import.meta.url).pathname;
await import(root + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(root + '/src/game/worldsData.ts');
const { RealPlay } = await import(root + '/src/game/realPlay.ts');
const { setDifficulty } = await import(root + '/src/game/difficulty.ts');
const swim = await import(root + '/src/game/swim.ts').catch(() => ({}) as any);
const kitPools = (swim.kitPools ?? (() => [])) as (k: unknown, p: unknown) => unknown[];
const sim = (id: string, v: number, s: 'normal' | 'easy') => { setDifficulty(s); return new RealPlay(id, v); };
const arg = (k: string, d: number) => { const i = process.argv.indexOf(k); return i >= 0 ? Number(process.argv[i + 1]) : d; };
const L = arg('--layouts', 16), FROM = arg('--from', 0), TO = arg('--to', 999);
const stages = generateAllLevels().filter((c: any) => !c.secret).slice(FROM, TO);
const out: Record<string, { lair: boolean; counts: Record<string, number[]> ; fail?: string }> = {};
for (const c of stages) {
  const counts: Record<string, number[]> = {};
  let fail: string | undefined;
  for (let v = 1; v <= L; v++) {
    let s; try { s = sim(c.id, v, 'normal'); } catch (e) { fail = String((e as Error).message).slice(0, 100); break; }
    const st = s.stage as any, e = s.e as any;
    for (const m of MECHS) (counts[m.id] ??= []).push(m.count(st, e));
    (counts['swim'] ??= []).push(kitPools(e.kit, e.platforms).length);
    (counts['waterzone'] ??= []).push((e.proto?.water ?? []).length);
  }
  out[c.id] = { lair: !!(c as any).boss || /-10$/.test(c.id), counts, ...(fail ? { fail } : {}) };
  process.stderr.write(c.id + ' ');
}
process.stdout.write(JSON.stringify(out));
