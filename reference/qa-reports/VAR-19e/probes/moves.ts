// VAR-19e probe: a layout's move string (funcheck's own: validate/core.ts build + moveString), each move with its x and section, and the
// repeats it flags. usage: npx tsx moves.ts <stage> <layout> <normal|easy>
import '../../../../src/game/headlessDom.ts';
import { build, moveString, repeats } from '../../../../tools/validate/core.ts';
const [id, v, d] = [process.argv[2], Number(process.argv[3]), process.argv[4] as 'normal' | 'easy'];
const b: any = build(id, v, d);
const str = moveString(b.quick);
const moves = b.quick.filter((s: any) => s.m !== 'h');
const secs = (b.stage.gen2?.sections ?? []) as Array<{ template: string; x0: number; x1: number }>;
const sec = (x: number) => secs.find((s) => x >= s.x0 && x < s.x1)?.template.replace('w1-19-', '') ?? '?';
console.log(str);
console.log(JSON.stringify(repeats(str, b.quick, b.stage.proto?.bpm)));
let cur = '', line = '';
moves.forEach((m: any, i: number) => { const s = sec(m.x); if (s !== cur) { if (line) console.log(line); cur = s; line = `${s}: `; } line += `${str[i]}@${Math.round(m.x)} `; });
console.log(line);
const tpl = process.argv[5];
if (tpl) for (const q of secs.filter((s: any) => s.template === tpl)) {
  for (const p of b.stage.platforms.filter((p: any) => p.tag?.startsWith(`${(q as any).uid}:`))) console.log(`  ${p.tag} x${Math.round(p.x)}-${Math.round(p.x + p.width)} y${Math.round(p.y)}`);
  console.log('  moves: ' + moves.map((m: any, i: number) => [m, i]).filter(([m]: any) => m.x >= q.x0 && m.x < q.x1).map(([m, i]: any) => `${str[i]}@${Math.round(m.x)}(${m.what ?? ''})`).join(' '));
}
