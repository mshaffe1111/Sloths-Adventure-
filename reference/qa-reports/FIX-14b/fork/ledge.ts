import { RealPlay } from '../../../../src/game/realPlay.ts';
const bad: string[] = []; let n = 0;
for (let seed = 1; seed <= 12; seed++) {
  const r = new RealPlay('1-4', seed);
  const secs = (r.stage as any).gen2?.sections ?? [];
  for (const v of r.vines) {
    if (v.vineType !== 'tree_climb' || v.field) continue;
    const p = r.platforms.find((q) => Math.abs(q.y - v.topY) <= 10 && v.x >= q.x - 2 && v.x <= q.x + q.width + 2);
    if (!p) continue; n++;
    const m = Math.min(v.x - p.x, p.x + p.width - v.x);
    if (m < 80) {
      const sec = secs.find((s: any) => (v as any).tag?.startsWith(s.uid + ':') ) ?? secs.find((s: any) => (p as any).tag?.startsWith(s.uid + ':'));
      bad.push(`seed ${seed} vine ${Math.round(v.x)} top ${v.topY} on ${Math.round(p.x)}..${Math.round(p.x + p.width)} margin ${Math.round(m)} tag ${(v as any).tag ?? '-'} ptag ${(p as any).tag ?? '-'} ${sec?.template ?? ''}`);
    }
  }
}
console.log('vines', n, 'under 80:', bad.length); console.log(bad.slice(0, 20).join('\n'));
