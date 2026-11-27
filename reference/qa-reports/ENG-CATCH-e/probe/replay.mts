// ENG-CATCH-e replay: ENG-CATCH-c's replay.mts with THE GUARANTEE read. Each captured towerCatches call (FIX dir) laid again by ROOT's
// tower.ts, then the pipeline's own steps after the lay (clearClimbs, stopVines) and the down verdicts the stage is judged by. Each is
// CLEAN (laid, no verdict line), REFUSED by name (tower.ts TowerRefusal: the roll is skipped), or a LEAK (laid with a verdict line left:
// the guarantee broken). Prints each fixture and the three counts.
import { readdirSync, readFileSync } from 'node:fs';
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
const T = await import(ROOT + '/src/game/gen2/tower.ts');
const { withSetting } = await import(ROOT + '/src/game/settingDials.ts');
const { clearClimbs } = await import(ROOT + '/src/game/gen2/pipeline.ts');
const FIX = process.env.FIX!;
let clean = 0, refused = 0, leaks = 0, n = 0;
for (const f of readdirSync(FIX).filter((x) => x.endsWith('.json')).sort()) {
  const j = JSON.parse(readFileSync(`${FIX}/${f}`, 'utf8'));
  if (!j.call) { console.log(f, 'NO CALL'); continue; }
  const c = j.call; n++;
  const lv = new Map<number, number>(c.levels); const sealed = new Set<number>(c.sealed);
  const P = c.P.map((q: any) => ({ ...q })); const V = c.V.map((v: any) => ({ ...v }));
  withSetting(j.roll[0] === 'e' ? 'easy' : 'normal', () => {
    let out: any[];
    try {
      out = T.towerCatches('down', P, V, c.floorY, c.TW, c.Gp, (q: any) => lv.get(q.id) ?? 0, (q: any) => sealed.has(q.id), c.keepOut, c.turns.map((t: any) => ({ id: t.vid, from: t.from, to: t.to })));
    } catch (e) {
      if (!(e instanceof T.TowerRefusal)) throw e;
      refused++; console.log(`${f} REFUSED ${(e as Error).message.slice(0, 200)}`); return;
    }
    const all = [...P, ...out.map((o: any, k: number) => ({ id: 90000 + k, x: o.x, y: o.y, width: o.w, height: 24, type: 'solid' }))];
    clearClimbs(V, all); T.stopVines(V, all);
    const turns = c.turns.map((t: any) => ({ x: V.find((v: any) => v.id === t.vid)?.x ?? 0, from: t.from, to: t.to }));
    const errs = [...T.towerFalls('down', all, c.floorY, c.TW), ...T.towerVineCuts(V, all), ...T.towerLids(V, all), ...T.towerHandOns(turns, all, c.TW)];
    if (!errs.length) { clean++; console.log(`${f} CLEAN catches ${out.length}`); }
    else { leaks++; console.log(`${f} LEAK ${errs.length}: ${errs[0].slice(0, 200)}`); }
  });
}
console.log(`clean ${clean}, refused ${refused}, leaks ${leaks} of ${n}`);
