import '../../../../src/game/headlessDom.ts';
import { buildStage } from '../../../../tools/engine/libstage.ts';
const st: any = buildStage(process.argv[3] ?? '1-7', 1, 'normal');
const sec = st.gen2.sections.find((s: any) => s.template === process.argv[2]);
console.log(sec.template, Math.round(sec.x0), Math.round(sec.x1));
for (const p of st.platforms.filter((p: any) => p.x + p.width > sec.x0 - 50 && p.x < sec.x1 + 50).sort((a: any, b: any) => a.x - b.x)) console.log(Math.round(p.x), Math.round(p.x + p.width), 'y', Math.round(p.y), p.type, p.style ?? '');
