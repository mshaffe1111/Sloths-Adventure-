// BUILD-25d scratch: every section whose exit piece is placed `on` another (not committed)
import '../../../src/game/headlessDom.ts';
import { STAGE_TABLE } from '../../../src/game/gen2/worlds/stageTable.ts';
import { listedStage } from '../../../src/game/gen2/listed.ts';
const seen = new Set<string>();
for (const [k, r0] of Object.entries(STAGE_TABLE as any)) { const r: any = { id: k, ...(r0 as any) };
  const row = listedStage(r.id ?? r.stage); if (!row || typeof row.kit !== 'function') continue;
  for (const t of row.kit().manifest.sections as any[]) {
    if (seen.has(t.id)) continue; seen.add(t.id);
    const all = (v: any) => [...t.pieces, ...(v?.pieces ?? [])];
    const vs = (t.subBlocks ?? []).flatMap((b: any) => b.versions);
    for (const v of vs.length ? vs : [null]) {
      const ps = all(v); const ex = ps.find((p: any) => p.key === t.exit?.piece);
      if (ex && ex.place.kind === 'on') console.log(`${t.id}${v ? '/' + v.id : ''}: exit '${ex.key}' is ${ex.shape} on '${ex.place.on}'`);
    }
  }
}
console.log('sections', seen.size);
