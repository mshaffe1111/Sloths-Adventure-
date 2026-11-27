// ENG-CATCH-g scan: every built 3-1 (the tree at ROOT, seeds FROM..SEEDS, both settings, KEEP's down pieces): pairs of solid wood at one
// height (|dy| <= 1) that overlap (strictly), counted per stage; a pair is listed with its spans and styles
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
await import(ROOT + '/tools/engine/draft.ts');
const { W3_DOWN_TOWER } = await import(ROOT + '/src/game/gen2/worlds/w3.ts');
const { buildStage, SETTINGS } = await import(ROOT + '/tools/engine/libstage.ts');
const keep = (process.env.KEEP ?? '').split(',');
const arr = W3_DOWN_TOWER as any[]; const kept = [...arr].filter((q) => keep.includes(q.id)); arr.splice(0, arr.length, ...kept);
const from = Number(process.env.FROM ?? 1), to = Number(process.env.SEEDS ?? 40);
let total = 0, stages = 0, built = 0; const lines: string[] = [];
for (const d of SETTINGS) for (let s = from; s <= to; s++) {
  let st: any;
  try { st = buildStage('3-1', s, d); } catch (e) { lines.push(`  ${d[0]}${s} THROW ${(e as Error).message.slice(0, 160)}`); continue; }
  built++;
  const P = (st.platforms as any[]).filter((p) => p.type === 'solid');
  let n = 0;
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
    const a = P[i], b = P[j];
    if (Math.abs(a.y - b.y) > 1 || !(a.x < b.x + b.width && b.x < a.x + a.width)) continue;
    n++; lines.push(`  ${d[0]}${s} ${a.x}-${a.x + a.width} (${a.style ?? '-'}) over ${b.x}-${b.x + b.width} (${b.style ?? '-'}) at y ${a.y}`);
  }
  total += n; if (n) stages++;
}
console.log(`overlaps at one height: ${total} pairs in ${stages} of ${built} built stages`);
for (const l of lines) console.log(l);
