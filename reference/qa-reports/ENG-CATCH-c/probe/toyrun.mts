// ENG-CATCH-d: lay a toy tower (TOY, crop.mts's JSON) with ROOT's tower.ts and print the lay (compact) and the down verdicts' lines
import { readFileSync } from 'node:fs';
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
const T = await import(ROOT + '/src/game/gen2/tower.ts');
const { withSetting } = await import(ROOT + '/src/game/settingDials.ts');
const { clearClimbs } = await import(ROOT + '/src/game/gen2/pipeline.ts');
const t = JSON.parse(readFileSync(process.env.TOY!, 'utf8'));
const P = t.P.map((r: any[]) => ({ id: r[0], x: r[1], y: r[2], width: r[3], height: r[4], type: r[5] || 'solid' }));
const lv = new Map<number, number>(t.P.map((r: any[]) => [r[0], r[6]])); const sealed = new Set<number>(t.P.filter((r: any[]) => r[7]).map((r: any[]) => r[0]));
const V = t.V.map((r: any[]) => ({ id: r[0], x: r[1], topY: r[2], bottomY: r[3], swaySpeed: 1, swayPhase: 0, vineType: r[4] }));
const turns = t.turns.map((r: any[]) => ({ id: r[0], from: r[1], to: r[2] }));
const Gp = t.Gp.map((r: any[]) => ({ x0: r[0], x1: r[1], y: r[2] })); const keepOut = t.keepOut.map((r: any[]) => ({ x0: r[0], x1: r[1], y0: r[2], y1: r[3] }));
withSetting(t.roll[0] === 'e' ? 'easy' : 'normal', () => {
  const out = T.towerCatches('down', P, V, t.floorY, t.W, Gp, (q: any) => lv.get(q.id) ?? 0, (q: any) => sealed.has(q.id), keepOut, turns);
  const all = [...P, ...out.map((o: any, k: number) => ({ id: 90000 + k, x: o.x, y: o.y, width: o.w, height: 24, type: 'solid' }))];
  clearClimbs(V, all); T.stopVines(V, all);
  const tt = turns.map((q: any) => ({ x: V.find((v: any) => v.id === q.id)!.x, from: q.from, to: q.to }));
  const errs = [...T.towerFalls('down', all, t.floorY, t.W), ...T.towerVineCuts(V, all), ...T.towerLids(V, all), ...T.towerHandOns(tt, all, t.W)];
  console.log('LAY', JSON.stringify(out.map((o: any) => [o.x, o.y, o.w, o.level])));
  console.log('ERRS', errs.length, errs.map((e) => e.slice(0, 120)).join(' | '));
});
