import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import '/home/user/Sloths-Adventure-/tools/engine/draft.ts';
import { W3_DOWN_TOWER } from '/home/user/Sloths-Adventure-/src/game/gen2/worlds/w3.ts';
import { buildStage, SETTINGS } from '/home/user/Sloths-Adventure-/tools/engine/libstage.ts';
const keep = (process.env.KEEP ?? '').split(',');
const arr = W3_DOWN_TOWER as any[]; const kept = arr.filter((q) => keep.includes(q.id)); arr.splice(0, arr.length, ...kept);
const tally = new Map<string, number>(); let ok = 0;
for (const d of SETTINGS) for (let s = 1; s <= Number(process.env.SEEDS ?? 6); s++) {
  try { const st: any = buildStage('3-1', s, d); const e = st.gen2.errors ?? []; if (!e.length) ok++; for (const x of e) { const k = String(x).replace(/[\d.]+/g, '#').slice(0, 110); tally.set(k, (tally.get(k) ?? 0) + 1); } }
  catch (e) { const k = 'THROW ' + (e as Error).message.replace(/[\d.]+/g, '#').slice(0, 110); tally.set(k, (tally.get(k) ?? 0) + 1); }
}
console.log(process.env.KEEP, 'ok', ok); for (const [k, c] of tally) console.log(' ', c, k);
