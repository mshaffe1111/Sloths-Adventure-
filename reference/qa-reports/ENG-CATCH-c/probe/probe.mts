// ENG-CATCH-c probe: KIT-W3a's patch.mts, the tree read from ROOT, seeds FROM..SEEDS, both settings. Prints ok count, reds, each error.
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
await import(ROOT + '/tools/engine/draft.ts');
const { W3_DOWN_TOWER } = await import(ROOT + '/src/game/gen2/worlds/w3.ts');
const { buildStage, SETTINGS } = await import(ROOT + '/tools/engine/libstage.ts');
const keep = (process.env.KEEP ?? '').split(',');
const arr = W3_DOWN_TOWER as any[]; const kept = [...arr].filter((q) => keep.includes(q.id)); arr.splice(0, arr.length, ...kept);
const from = Number(process.env.FROM ?? 1), to = Number(process.env.SEEDS ?? 40);
let ok = 0, n = 0; const bad: string[] = []; const lines: string[] = [];
for (const d of SETTINGS) for (let s = from; s <= to; s++) {
  n++;
  try {
    const st: any = buildStage('3-1', s, d); const e = st.gen2.errors ?? [];
    if (!e.length) ok++; else { bad.push(d[0] + s); for (const x of e) lines.push(`  ${d[0]}${s} ${String(x).slice(0, 260)}`); }
  } catch (e) { bad.push(d[0] + s + '!'); lines.push(`  ${d[0]}${s} THROW ${(e as Error).message.slice(0, 200)}`); }
}
console.log(`${process.env.KEEP} ok ${ok}/${n} bad ${bad.join(' ')}`);
if (process.env.VERBOSE) for (const l of lines) console.log(l);
