// VAR-1b probe: buildStage (the tests' coordinates) platforms and soft falls between x0 and x1, with sections. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { buildStage } from '../../../../tools/engine/libstage.ts';
const [id, seed, d, x0, x1] = [process.argv[2], Number(process.argv[3]), process.argv[4] as 'normal' | 'easy', Number(process.argv[5]), Number(process.argv[6])];
const st: any = buildStage(id, seed, d);
for (const s of st.gen2.sections) if (s.x1 > x0 && s.x0 < x1) console.log('SEC', s.template, Math.round(s.x0), Math.round(s.x1));
for (const p of st.platforms.filter((p: any) => p.x + p.width > x0 && p.x < x1).sort((a: any, b: any) => a.x - b.x)) console.log('P', p.id, Math.round(p.x), Math.round(p.x + p.width), 'y', p.y, 'h', p.height, p.type, p.style ?? '', p.tag ?? '');
for (const f of (st.gen2.falls ?? []).filter((f: any) => f.x1 > x0 && f.x0 < x1)) console.log('FALL', JSON.stringify(f));
