import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import '/home/user/Sloths-Adventure-/tools/engine/draft.ts';
import { W3_DOWN_TOWER, W3_PARKED } from '/home/user/Sloths-Adventure-/src/game/gen2/worlds/w3.ts';
import { buildStage, SETTINGS } from '/home/user/Sloths-Adventure-/tools/engine/libstage.ts';
const keep = (process.env.KEEP ?? '').split(',');
const arr = W3_DOWN_TOWER as any[]; const kept = [...arr, ...(W3_PARKED as any[])].filter((q) => keep.includes(q.id)); arr.splice(0, arr.length, ...kept);
// PATCH: "key.w=a,b;key.dy=a,b;key.at=a;exitDy=n" applied to the first kept brick (pieces are shared objects only within it)
const t = arr[0]; t.pieces = t.pieces.map((p: any) => ({ ...p, place: { ...p.place } }));
for (const part of (process.env.PATCH ?? '').split(';').filter(Boolean)) {
  const [lhs, rhs] = part.split('='); const nums = rhs.split(',').map(Number);
  if (lhs === 'exitDy') { t.exitDy = nums[0]; continue; }
  const [k, f] = lhs.split('.'); const p = t.pieces.find((q: any) => q.key === k);
  if (f === 'w') p.w = nums; else if (f === 'at') p.place.at = nums; else if (f === 'h') p.place.h = nums; else p.place[f] = nums;
}
const tally = new Map<string, number>(); let ok = 0; const bad: string[] = [];
for (const d of SETTINGS) for (let s = 1; s <= Number(process.env.SEEDS ?? 6); s++) {
  try { const st: any = buildStage('3-1', s, d); const e = st.gen2.errors ?? []; if (!e.length) ok++; else { bad.push(d[0] + s); if (process.env.VERBOSE) for (const x of e) console.log('  ', d, s, String(x).slice(0, 230)); } for (const x of e) { const k = String(x).replace(/[\d.]+/g, '#').slice(0, 70); tally.set(k, (tally.get(k) ?? 0) + 1); } }
  catch (e) { const k = 'THROW ' + (e as Error).message.replace(/[\d.]+/g, '#').slice(0, 70); tally.set(k, (tally.get(k) ?? 0) + 1); }
}
console.log(process.env.KEEP, process.env.PATCH, 'ok', ok, bad.join(' ')); for (const [k, c] of tally) console.log(' ', c, k);
