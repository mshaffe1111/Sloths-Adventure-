// VAR-19c probe: the stills' spots for a layout and setting: each rest at a quarter, half and three quarters, and every seam between
// sections (x:name, built x).
// usage: npx tsx spots.ts <stage> <layout> <normal|easy>
import '../../../../src/game/headlessDom.ts';
import { build } from '../../../../tools/validate/core.ts';
const [id, v, s] = [process.argv[2], Number(process.argv[3]), process.argv[4] as 'normal' | 'easy'];
const st: any = build(id, v, s).stage;
const secs: any[] = st.gen2.sections;
const out: string[] = [];
secs.forEach((q, i) => {
  const n = q.template.replace(/^w1-\d+-/, '');
  if (i > 0) out.push(`${Math.round(q.x0) + 60}:seam-into-${n}`);
  if (/^rest/.test(n)) for (const f of [0.25, 0.5, 0.75]) out.push(`${Math.round(q.x0 + f * (q.x1 - q.x0))}:${n}-${Math.round(f * 100)}`);
});
console.log(out.join(' '));
