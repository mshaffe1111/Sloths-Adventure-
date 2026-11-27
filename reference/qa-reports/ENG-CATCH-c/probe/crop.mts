// ENG-CATCH-d crop: a captured towerCatches call (F) cut to a band of storeys (the miss's y, -UP px to +DOWN px), with a floor laid under
// it, then laid by BASE's and TRY's tower.ts and judged by the down verdicts both trees have (towerFalls, towerVineCuts, towerLids,
// towerHandOns). Prints each band that is RED on BASE and GREEN on TRY, and with OUT writes the first as a toy fixture (compact JSON).
import { readFileSync, writeFileSync } from 'node:fs';
const BASE = process.env.BASE!, TRY = process.env.TRY!;
await import(TRY + '/src/game/headlessDom.ts');
const B = await import(BASE + '/src/game/gen2/tower.ts');
const T = await import(TRY + '/src/game/gen2/tower.ts');
const { withSetting } = await import(TRY + '/src/game/settingDials.ts');
const { clearClimbs } = await import(TRY + '/src/game/gen2/pipeline.ts');
const j = JSON.parse(readFileSync(process.env.F!, 'utf8')); const c = j.call;
const D = j.roll[0] === 'e' ? 'easy' : 'normal';
const Y = Number(process.env.Y);
const judge = (M: any, P: any[], V: any[], floorY: number, turns: any[], lv: Map<number, number>, sealed: Set<number>, Gp: any[], keepOut: any[]) => withSetting(D, () => {
  const V2 = V.map((v) => ({ ...v }));
  const out = M.towerCatches('down', P.map((q) => ({ ...q })), V2, floorY, c.TW, Gp, (q: any) => lv.get(q.id) ?? 0, (q: any) => sealed.has(q.id), keepOut, turns.map((t: any) => ({ id: t.vid, from: t.from, to: t.to })));
  const all = [...P, ...out.map((o: any, k: number) => ({ id: 90000 + k, x: o.x, y: o.y, width: o.w, height: 24, type: 'solid' }))];
  clearClimbs(V2, all); T.stopVines(V2, all);
  const tt = turns.map((t: any) => ({ x: V2.find((v: any) => v.id === t.vid)?.x ?? 0, from: t.from, to: t.to }));
  return [...T.towerFalls('down', all, floorY, c.TW), ...T.towerVineCuts(V2, all), ...T.towerLids(V2, all), ...T.towerHandOns(tt, all, c.TW)];
});
let wrote = false;
for (const up of (process.env.UP ?? "300,450,600,800").split(",").map(Number)) for (const down of (process.env.DOWN ?? "400,600,800,1100").split(",").map(Number)) {
  const y0 = Y - up, y1 = Y + down;
  const P0 = c.P.filter((q: any) => q.y >= y0 && q.y <= y1 && q.y < c.floorY).map((q: any) => ({ id: q.id, x: q.x, y: q.y, width: q.width, height: q.height, type: q.type }));
  const floorY = Math.max(...P0.map((q: any) => q.y)) + 220;
  const P = [...P0, { id: 99999, x: 0, y: floorY, width: c.TW, height: 24, type: 'solid' }];
  const V = c.V.filter((v: any) => v.bottomY > y0 && v.topY < floorY).map((v: any) => ({ id: v.id, x: v.x, topY: Math.max(v.topY, y0), bottomY: Math.min(v.bottomY, floorY), swaySpeed: 1, swayPhase: 0, vineType: v.vineType }));
  const turns = c.turns.filter((t: any) => V.some((v: any) => v.id === t.vid) && t.from >= y0 - 1 && t.to <= floorY + 1);
  const lv = new Map<number, number>(c.levels); const sealed = new Set<number>(c.sealed);
  const Gp = c.Gp.filter((g: any) => g.y >= y0 && g.y <= floorY);
  const keepOut = c.keepOut.filter((k: any) => k.y1 >= y0 && k.y0 <= floorY);
  const rb = judge(B, P, V, floorY, turns, lv, sealed, Gp, keepOut), rt = judge(T, P, V, floorY, turns, lv, sealed, Gp, keepOut);
  console.log(`band -${up} +${down}: pieces ${P.length} vines ${V.length} turns ${turns.length} base ${rb.length} try ${rt.length}${rb.length ? '  B ' + rb[0].slice(0, 150) : ''}`);
  if ((process.env.CLEAN ? !rb.length && !rt.length : rb.length && !rt.length) && process.env.OUT && !wrote) {
    const dy = 1000 - y0;
    const fix = { roll: j.roll, W: c.TW, floorY: floorY + dy,
      P: P.map((q: any) => [q.id, q.x, q.y + dy, q.width, q.height, q.type === 'solid' ? 0 : q.type, lv.get(q.id) ?? 0, sealed.has(q.id) ? 1 : 0]),
      V: V.map((v: any) => [v.id, v.x, v.topY + dy, v.bottomY + dy, v.vineType]),
      turns: turns.map((t: any) => [t.vid, t.from + dy, t.to + dy]),
      Gp: Gp.map((g: any) => [g.x0, g.x1, g.y + dy]), keepOut: keepOut.map((k: any) => [k.x0, k.x1, k.y0 + dy, k.y1 + dy]), base: rb };
    writeFileSync(process.env.OUT, JSON.stringify(fix)); wrote = true; console.log('  wrote', process.env.OUT);
  }
}
