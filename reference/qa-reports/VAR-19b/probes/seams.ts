// VAR-19b probe: every dead walk (funcheck's rule, tools/validate/core.ts deadWalks) on a stage's layouts, named by the move and the
// section:piece at each end. deadWalks' own x is read from the samples' clock, which falls behind the steps' clock by the fights and waits
// (up to ~25 s by 1-9's exit), so the ends here come from the steps' own x. Relative imports (D83).
// usage: npx tsx seams.ts <stage> <from> <to> <normal|easy>   -> tab rows: layout x0 x1 secs from-section:piece to-section:piece moves
import '../../../../src/game/headlessDom.ts';
import { build, deadWalks } from '../../../../tools/validate/core.ts';
const [id, a, z, s] = [process.argv[2] ?? '1-9', Number(process.argv[3] ?? 1), Number(process.argv[4] ?? 16), (process.argv[5] ?? 'normal') as 'normal' | 'easy'];
const short = (t: string) => t.replace(/^w1-19-/, '');
for (let v = a; v <= z; v++) {
  const b = build(id, v, s);
  const st: any = b.stage;
  const secs: any[] = st.gen2?.sections ?? [];
  const where = (x: number, y: number) => {
    const ps = st.platforms.filter((p: any) => p.tag && x >= p.x - 2 && x <= p.x + p.width + 2).sort((p: any, q: any) => Math.abs(p.y - y) - Math.abs(q.y - y));
    const tag: string = ps[0]?.tag ?? '';
    const [uid, key] = tag.split(':');
    const sec = secs.find((q) => q.uid === uid) ?? secs.find((q) => x >= q.x0 && x < q.x1);
    return `${sec ? short(sec.template) : '-'}:${key ?? '?'}`;
  };
  for (const d of deadWalks(b.steps, b.total, b.samples)) {
    const qa = b.steps.find((q) => q.t === d.t0), qb = b.steps.find((q) => q.t === d.t1);
    const ea = qa ? where(qa.x, qa.y) : 'start', eb = qb ? where(qb.x, qb.y) : 'end';
    console.log(`L${v}\t${qa?.x ?? 0}\t${qb?.x ?? 'end'}\t${d.secs}\t${ea}\t${eb}\t${qa?.m ?? '^'}>${qb?.m ?? '$'}`);
  }
}
