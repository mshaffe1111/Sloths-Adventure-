// BUILD-26: the built 2-6 between two heights: platforms, vines, rivers, sections (x0-x1) — rule 27, the built stage
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { listedStage, playFinish } from '../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
const [d, seedS, y0S, y1S] = process.argv.slice(2);
const cfg = generateAllLevels().find((c) => c.id === (process.env.STAGE ?? '2-6') && !c.secret)!;
const row = listedStage((process.env.STAGE ?? '2-6'))!;
const st: any = playFinish(row, buildGen2Stage({ config: cfg, kit: row.kit(), seed: Number(seedS), difficulty: d as any }) as never, d as any);
const y0 = Number(y0S ?? -1e9), y1 = Number(y1S ?? 1e9);
for (const p of [...st.platforms].sort((a: any, b: any) => b.y - a.y || a.x - b.x)) if (p.y >= y0 && p.y <= y1 && !p.wheel) console.log(`P#${p.id} ${p.type}/${p.style ?? ''} x ${Math.round(p.x)}-${Math.round(p.x + p.width)} y ${Math.round(p.y)} h ${p.height}${p.lip ? ' lip' : ''}`);
for (const v of st.vines) if (v.bottomY >= y0 && v.topY <= y1) console.log(`V ${v.vineType} x ${Math.round(v.x)} y ${Math.round(v.topY)}-${Math.round(v.bottomY)}`);
for (const r of st.rivers ?? []) if (r.surfaceY >= y0 && r.surfaceY <= y1) console.log(`R x ${Math.round(r.x0)}-${Math.round(r.x1)} y ${Math.round(r.surfaceY)} ${r.wheelPond ? 'pond' : 'river'} safe ${!!r.safe}`);
for (const s of st.gen2.sections) console.log(`S ${s.template.replace('w2-26-', '')} ${s.node} x ${Math.round(s.x0)}-${Math.round(s.x1)} ${Object.keys(s).join(',')}`);
for (const c of st.collectibles) if (c.y >= y0 && c.y <= y1) console.log(`C ${c.type} x ${Math.round(c.x)} y ${Math.round(c.y)}`);
for (const c of st.checkpoints ?? []) if (c.y >= y0 && c.y <= y1) console.log(`F x ${Math.round(c.x)} y ${Math.round(c.y)}`);
for (const d of st.proto?.decor ?? []) if (d.b >= y0 && d.b <= y1) console.log(`D ${d.n ?? d.cel} x ${Math.round(d.x)} b ${Math.round(d.b)}`);
console.log('findSpot', JSON.stringify(st.proto?.findSpot));
