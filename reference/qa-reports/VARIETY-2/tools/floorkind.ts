// VARIETY-2: every floor.unmarked gap of the W1 mix strings (mixlist.ts output), classified by its lips: 'thin' (a log, rung or bough,
// height < 90) or 'bank' (height >= 90), with the painter's ground line G and the lay's own Drop records over the gap.
// Usage: npx tsx floorkind.ts <mixlist.json>
import '../../../../src/game/headlessDom.ts';
import { readFileSync } from 'node:fs';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const W1 = w1World();
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rows = JSON.parse(readFileSync(process.argv[2], 'utf8')) as any[];
const tally = new Map<string, number>();
for (const row of rows.filter((x) => x.floor?.length)) {
  const kit = { ...W1, manifest: { ...W1.manifest, graphs: { ...W1.manifest.graphs!, list: [{ id: 'mix', archetype: 'sprint', code: row.code }] } } } as never;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const st: any = buildGen2Stage({ config: cfg, kit, seed: row.seed, difficulty: 'normal' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const P = st.platforms as any[];
  const tops = new Map<number, number>();
  for (const b of P.filter((q) => q.height >= 90 && q.type === 'solid')) tops.set(Math.round(b.y), (tops.get(Math.round(b.y)) ?? 0) + b.width);
  const G = [...tops].sort((p, q) => q[1] - p[1])[0][0];
  for (const e of (st.gen2.errors as string[]).filter((e) => e.includes('floor.unmarked'))) {
    const m = /at x (\d+)\.\.(\d+)/.exec(e)!; const x0 = +m[1], x1 = +m[2];
    const lipL = P.filter((p) => Math.abs(p.x + p.width - x0) <= 2).sort((a, b) => a.y - b.y)[0];
    const lipR = P.filter((p) => Math.abs(p.x - x1) <= 2).sort((a, b) => a.y - b.y)[0];
    const kind = (p: { height: number } | undefined) => (!p ? 'none' : p.height >= 90 ? 'bank' : 'thin');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drops = ((st.gen2.drops ?? []) as any[]).filter((d) => d.x1 > x0 && d.x0 < x1).length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sec = (st.gen2.sections as any[]).filter((q) => q.x1 > x0 && q.x0 < x1).map((q) => q.template.replace(/^w1-/, '')).join('>');
    const k = `${kind(lipL)}/${kind(lipR)}`;
    tally.set(k, (tally.get(k) ?? 0) + 1);
    console.log(`#${row.i}${row.fair ? ' FAIR' : ''} G ${G} gap ${x0}..${x1} lips ${k} (y ${lipL?.y ?? '-'} h ${lipL?.height ?? '-'} | y ${lipR?.y ?? '-'} h ${lipR?.height ?? '-'}) drops ${drops} in ${sec}`);
  }
}
console.log('lips:', [...tally].map(([k, n]) => `${k} ${n}`).join(', '));
