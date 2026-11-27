// ENG-CATCH-c: the wood near (X, Y) in a captured call, input pieces (P) and the lay's catches (C, from ROOT's tower.ts), and the vines
import { readFileSync } from 'node:fs';
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
const T = await import(ROOT + '/src/game/gen2/tower.ts');
const { withSetting } = await import(ROOT + '/src/game/settingDials.ts');
const j = JSON.parse(readFileSync(process.env.F!, 'utf8')); const c = j.call;
const X = Number(process.env.X), Y = Number(process.env.Y), DX = Number(process.env.DX ?? 400), DY = Number(process.env.DY ?? 450);
const lv = new Map<number, number>(c.levels); const sealed = new Set<number>(c.sealed);
const out = withSetting(j.roll[0] === 'e' ? 'easy' : 'normal', () => T.towerCatches('down', c.P, c.V, c.floorY, c.TW, c.Gp, (q: any) => lv.get(q.id) ?? 0, (q: any) => sealed.has(q.id), c.keepOut, c.turns.map((t: any) => ({ id: t.vid, from: t.from, to: t.to }))));
const rows: Array<[number, string]> = [];
for (const q of c.P) if (q.x < X + DX && q.x + q.width > X - DX && q.y > Y - DY && q.y < Y + DY) rows.push([q.y, `P id${q.id} ${q.type} x ${q.x}-${q.x + q.width} y ${q.y} h ${q.height}${sealed.has(q.id) ? ' SEALED' : ''}`]);
out.forEach((o: any, k: number) => { if (o.x < X + DX && o.x + o.w > X - DX && o.y > Y - DY && o.y < Y + DY) rows.push([o.y, `C#${k} x ${o.x}-${o.x + o.w} y ${o.y}`]); });
for (const v of c.V) if (v.x > X - DX && v.x < X + DX && v.bottomY > Y - DY && v.topY < Y + DY) rows.push([v.topY, `V id${v.id} ${v.vineType} x ${v.x} y ${v.topY}-${v.bottomY}${c.turns.some((t: any) => t.vid === v.id) ? ' TURN' : ''}`]);
for (const g of c.Gp) if (g.x0 < X + DX && g.x1 > X - DX && g.y > Y - DY && g.y < Y + DY) rows.push([g.y, `G x ${g.x0}-${g.x1} y ${g.y}`]);
for (const k of c.keepOut) if (k.x0 < X + DX && k.x1 > X - DX && k.y1 > Y - DY && k.y0 < Y + DY) rows.push([k.y0, `K x ${k.x0}-${k.x1} y ${k.y0}-${k.y1}`]);
rows.sort((a, b) => a[0] - b[0]);
console.log(`floorY ${c.floorY} TW ${c.TW}`); for (const [, r] of rows) console.log(r);
