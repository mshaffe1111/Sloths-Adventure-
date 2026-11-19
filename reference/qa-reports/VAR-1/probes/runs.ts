// VAR-1 probe: each 4-move run a stage repeats more than 3 times (funcheck "repeat"), with the sections each copy spans. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { build } from '../../../../tools/validate/core.ts';
const [id, v, s] = [process.argv[2] ?? '1-6', Number(process.argv[3] ?? 1), (process.argv[4] ?? 'normal') as 'normal' | 'easy'];
const b = build(id, v, s);
const secs: { template: string; x0: number; x1: number }[] = (b.stage as any).gen2?.sections ?? [];
const sec = (x: number) => { const q = secs.find((q) => x >= q.x0 && x < q.x1); return q ? q.template.replace(/^w1-1\d-/, '') : 'link'; };
const mv = b.steps.filter((x) => x.m !== 'h');
const str = mv.map((x) => x.m).join('');
const seen = new Map<string, number[]>();
for (let i = 0; i + 4 <= str.length; i++) { const k = str.slice(i, i + 4); const at = seen.get(k) ?? []; if (!at.length || i >= at[at.length - 1] + 4) at.push(i); seen.set(k, at); }
for (const [k, at] of seen) if (at.length > 3 && new Set(k).size > 1) console.log(k, at.length, at.map((i) => [0, 1, 2, 3].map((d) => sec(mv[i + d].x)).join('>')).join(' | '));
