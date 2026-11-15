// INT-10b: gen2Pits.test's "slot under a bank" reading (the test's own rule, copied) over raw seeds of every listed World 1 stage, both
// settings, plus what joins each slot sits at. Args: first last (raw seeds). Prints one line per slot and a count per stage.
import '../../../src/game/headlessDom.ts';
import { buildStage } from '../../../tools/engine/libstage.ts';
import type { Platform } from '../../../src/game/types.ts';
import { PROVEN_INDEX } from '../../../src/game/gen2/provenIndex.ts';
const [a = '1', b = '8'] = process.argv.slice(2);
const ids = (process.env.IDS?.split(',') ?? Object.keys(PROVEN_INDEX).filter((k) => k.startsWith('1-')));
for (const id of ids) {
  let n = 0, bad = 0, throws = 0;
  const t0 = Date.now();
  for (let seed = Number(a); seed <= Number(b); seed++) for (const d of ['normal', 'easy'] as const) {
    n++;
    let st;
    try { st = buildStage(id, seed, d); } catch (e) { throws++; console.log(`${id} ${seed} ${d} THROWS ${(e as Error).message.slice(0, 120)}`); continue; }
    const solid = (st.platforms as Platform[]).filter((p: Platform) => p.type === 'solid' && !p.lift);
    const out: string[] = [];
    for (const p of solid) for (const q of solid) {
      if (q === p || q.height < 40) continue;
      const touch = Math.abs(q.x + q.width - p.x) < 3 || Math.abs(q.x - (p.x + p.width)) < 3;
      const foot = q.y + q.height;
      if (touch && q.y < p.y - 40 && foot <= p.y + 3 && foot >= p.y - 48) out.push(`q ${Math.round(q.x)}+${Math.round(q.width)} y${Math.round(q.y)} h${Math.round(q.height)} | p ${Math.round(p.x)}+${Math.round(p.width)} y${Math.round(p.y)}`);
    }
    if (out.length) { bad++; console.log(`${id} ${seed} ${d}: ${out.join(' ; ')}`); }
  }
  console.log(`== ${id}: ${bad}/${n} with a slot, ${throws} throw, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
