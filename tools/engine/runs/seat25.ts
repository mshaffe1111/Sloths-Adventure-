import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { listedStage, playFinish } from '../../../src/game/gen2/listed.ts';
import { buildPlayStage, loadSeedList, provenSeeds } from '../../../src/game/gen2/seedList.ts';
import type { Gen2Stage, WorldKit } from '../../../src/game/gen2/types.ts';
export function seatBreaches(st: Gen2Stage, kit: WorldKit, difficulty: 'normal' | 'easy'): string[] {
  const M = kit.manifest;
  const out: string[] = [];
  const s = st as unknown as { enemies: Array<{ type: string; x: number; y: number; width: number; height: number }>; platforms: Array<{ x: number; y: number; width: number; tag?: string }> };
  for (const sec of st.gen2?.sections ?? []) {
    const t = M.sections.find((q) => q.id === sec.template);
    if (!t) continue;
    const socks = [...t.sockets, ...(t.subBlocks ?? []).flatMap((b) => b.versions.flatMap((v) => v.sockets ?? []))].filter((k) => k.role === 'enemy');
    if (!socks.length) continue;
    // (the enemy types a socket may hold: the creatures its allow names, by id or tag; none named, every creature of the world)
    const types = (k: (typeof socks)[number]) => new Set(M.creatures.filter((c) => !k.allow?.length || k.allow.includes(c.id) || c.tags?.some((g) => k.allow!.includes(g))).map((c) => c.enemy));
    for (const e of s.enemies) {
      const mid = e.x + e.width / 2;
      if (mid < sec.x0 || mid >= sec.x1) continue;
      const mine = socks.filter((k) => types(k).has(e.type as never));
      if (!mine.length) continue;
      const ons = [...new Set(mine.map((k) => k.on))];
      // (judged only where every piece its sockets name is still tagged on the stage as played: a finish that re-lays the ground (1-3's
      // and 1-5's logs) keeps no piece names, so there the rule cannot see a piece and says nothing, rather than guess)
      if (!ons.every((on) => s.platforms.some((p) => p.tag === `${sec.uid}:${on}`))) continue;
      // (standing on it: the piece's top inside the animal's height, a little either way: a creature's foot line is its own, footY)
      const stands = (p: { y: number }) => p.y >= e.y - 8 && p.y <= e.y + e.height + 8;
      const onIt = ons.some((on) => s.platforms.some((p) => p.tag === `${sec.uid}:${on}` && mid >= p.x && mid <= p.x + p.width && stands(p)));
      if (onIt) continue;
      const under = s.platforms.find((p) => p.tag?.startsWith(`${sec.uid}:`) && mid >= p.x && mid <= p.x + p.width && stands(p));
      out.push(`a predator off its piece (${difficulty}): the ${e.type} at ${Math.round(e.x)} in ${sec.template} stands on ${under ? `'${under.tag!.split(':')[1]}'` : 'no piece of its section'}, its socket${mine.length > 1 ? 's' : ''} ${mine.map((k) => `${k.id} on '${k.on}'`).join(', ')}`);
    }
  }
  return out;
}
await loadSeedList('2-5');
const row = listedStage('2-5')!; const cfg = generateAllLevels().find((l) => l.id === '2-5' && !l.secret)!;
const seeds = provenSeeds('2-5'); let n = 0; const all: string[] = []; let judged = 0;
for (const seed of seeds) for (const d of ['normal', 'easy'] as const) {
  const kit = row.kit();
  const st = playFinish(row, structuredClone(buildPlayStage(cfg, kit, seed, d)), d);
  const tagged = (st as any).platforms.filter((p: any) => p.tag).length; if (tagged) judged++;
  const b = seatBreaches(st, kit, d); n++; all.push(...b.map((l) => `seed ${seed}: ${l}`));
}
console.log(`seat rule (R-165.327, t-int-14's seatBreaches) on 2-5's list: ${seeds.length} seeds x 2 settings = ${n} builds, ${judged} with piece tags; ${all.length} breaches`);
for (const l of all.slice(0, 20)) console.log('  ' + l);
{ // (planted: the awake snapper moved 300 px back onto its section's first bank)
  const kit = row.kit(); const st: any = playFinish(row, structuredClone(buildPlayStage(cfg, kit, seeds[0], 'normal')), 'normal');
  const t = st.enemies.filter((e: any) => e.type === 'turtle').sort((a: any, b: any) => a.x - b.x)[1]; t.x -= 300;
  console.log('PLANT (awake snapper 300 px back):', seatBreaches(st, kit, 'normal').join(' | ').slice(0, 300) || 'MISSED');
}
