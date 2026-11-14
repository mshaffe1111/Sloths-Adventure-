// VARIETY-2 measuring tool: the 60 World 1 strings of nodeMix.test.ts (same stream, same tokens, seed 1 + i), each built asked and
// bare; per string: fair (every ask is one W1's kit can lay), the errors (reason form), and every floor.unmarked gap with the
// sections it lies in, asked and bare. Usage: npx tsx mixlist.ts <out.json> [i0 i1]
import '../../../../src/game/headlessDom.ts';
import { writeFileSync } from 'node:fs';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const stream = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function token(r: () => number, cast: readonly string[], jobs: readonly string[]): string {
  const of = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  const job = of(jobs);
  const content = r() < 0.35 ? of(['g', 'f', 'c', 'b', 'r', 'k', 'w', 'h', 's', 'v', 'p', 't', 'x']) : '';
  const move = r() < 0.25 ? of(['1', '2']) : '';
  const shape = r() < 0.3 ? of(['^', '_']) : '';
  const find = r() < 0.1 ? '+' : '';
  const creatures = r() < 0.25 ? of(['&', '&', '&&']) : '';
  const tempo = r() < 0.5 ? of(['<', '>']) : '';
  const dials: string[] = [];
  if (r() < 0.2) dials.push(`${1 + Math.floor(r() * 10)}`);
  if (creatures && r() < 0.5) dials.push(`&${of(cast)}${creatures === '&&' ? '*2' : r() < 0.5 ? '' : '*1'}${of(['', '', '!', 'z'])}`.replace(/^(&[a-z-]+)(z)$/, '$1*1z'));
  if (r() < 0.1) dials.push(`#${of(['soft', 'water', 'hurt', 'void'])}`);
  if (find && r() < 0.5) dials.push('+seed');
  if (r() < 0.1) dials.push(`$${Math.floor(r() * 7)}`);
  if (r() < 0.03) dials.push('t0.9');
  if (r() < 0.03) dials.push('p5');
  return `${job}${content}${move}${shape}${find}${creatures}${tempo}${dials.map((d) => `:${d}`).join('')}`;
}
const reasonOf = (line: string) => line
  .replace(/^gen2 [0-9-]+: (graph \S+ "[^"]*": )?/, '').replace(/node n\d+ "[^"]*"/g, 'node').replace(/ at token \d+/g, '').replace(/\(n\d+ /g, '(')
  .replace(/: [A-Z]\S* (uses|bounces|names|teaches)/, ': T $1').replace(/"[^"]*"/g, 'T').replace(/-?\d+(\.\d+)?/g, '#').replace(/ at x #\.\.#.*$/, '').replace(/ at x #.*$/, '').slice(0, 90);
const W1 = w1World();
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const kitOf = (code: string) => ({ ...W1, manifest: { ...W1.manifest, graphs: { ...W1.manifest.graphs!, list: [{ id: 'mix', archetype: 'sprint', code }] } } }) as never;
const cast = W1.manifest.creatures.map((c) => c.id);
// (an ask W1's kit cannot lay in this tree: Later content letters and the types W1 has no section of, find, beat, points, water, void)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unfair = (a: any) => (a.content && !'gfcb'.includes(a.content)) || a.find || a.dials?.beat !== undefined || a.dials?.points !== undefined
  || a.dials?.reward?.find || ['water', 'void'].includes(a.dials?.hazard?.kind);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gapsOf = (st: any) => (st.gen2.errors as string[]).filter((e) => e.includes('floor.unmarked')).map((e) => {
  const m = /at x (\d+)\.\.(\d+)/.exec(e)!; const x0 = +m[1], x1 = +m[2];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const secs = (st.gen2.sections as any[]).filter((q) => q.x1 > x0 - 2 && q.x0 < x1 + 2).map((q) => `${q.template}(${q.node})`);
  return `${x0}..${x1} in ${secs.join(' > ')}`;
});
const r = stream(0x51071 + "World 1's kit at 1-1".length);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const out: any[] = [];
const [i0, i1] = [Number(process.argv[3] ?? 0), Number(process.argv[4] ?? 59)];
for (let s = 0; s < 60; s++) {
  const pmc = ['P', 'M', 'C'];
  const code = `A ${token(r, cast, pmc)} ${token(r, cast, pmc)} R ${token(r, cast, ['X'])} R ${token(r, cast, ['W', ...pmc])} R S E`;
  if (s < i0 || s > i1) continue;
  const bare = code.split(' ').map((t) => t[0]).join(' ');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: any = { i: s, seed: 1 + s, code };
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const st: any = buildGen2Stage({ config: cfg, kit: kitOf(code), seed: 1 + s, difficulty: 'normal' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    row.fair = !st.gen2.graph.nodes.some((n: any) => n.asked && unfair(n.asked));
    row.errs = [...new Set((st.gen2.errors as string[]).map(reasonOf))];
    row.askMiss = (st.gen2.errors as string[]).filter((e) => e.startsWith('ask: node ') && /: (shape|move) /.test(e)).map((e) => e.slice(0, 120));
    row.floor = gapsOf(st);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    row.secs = (st.gen2.sections as any[]).map((q) => `${q.template}(${q.node})`).join(' ');
  } catch (e) { row.threw = String(e).slice(0, 300); }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b: any = buildGen2Stage({ config: cfg, kit: kitOf(bare), seed: 1 + s, difficulty: 'normal' });
    row.bareClean = !b.gen2.errors.length; row.bareFloor = gapsOf(b);
  } catch (e) { row.bareThrew = String(e).slice(0, 200); }
  out.push(row);
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const n = (f: (x: any) => boolean) => out.filter(f).length;
console.log(`strings ${out.length}; clean ${n((x) => x.errs && !x.errs.length)}; fair ${n((x) => x.fair)}; fair clean ${n((x) => x.fair && x.errs && !x.errs.length)}; bare clean ${n((x) => x.bareClean)}; floor.unmarked ${n((x) => x.floor?.length)} (fair ${n((x) => x.fair && x.floor?.length)})`);
