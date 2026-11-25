// the route and pieces around one seam (ENG-DARK-j): GEN2_DRAFT=3-1 npx tsx <this> <bot> <setting> <seed> <x> <y> <t>
// at the first downEnd call after t near (x, y): the next 120 route points (every 6th) and every piece within 400 px
import path from 'node:path';
const root = process.cwd();
const [bot, setting, seed, rx, ry, t0] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const who = cb.CAST_BOTS[bot][setting];
const proto = ft.FirstTimerRun.prototype as any;
const orig = proto.downEnd;
let done = false;
proto.downEnd = function (p: any) {
  if (!done && this.t >= Number(t0) && Math.abs(p.x - Number(rx)) < 300 && Math.abs(p.y - Number(ry)) < 300) {
    done = true;
    const pts = this.prog.pts, c = this.prog.cur;
    console.log('cur', c, 'pts', pts.slice(c, c + 120).filter((_: any, i: number) => i % 6 === 0).map((q: any) => `${Math.round(q.x)},${Math.round(q.y)}`).join(' '));
    for (const b of this.sim.platforms) if (Math.abs(b.x + b.width / 2 - Number(rx)) < 500 && Math.abs(b.y - Number(ry)) < 400)
      console.log('piece', b.id, `${Math.round(b.x)}-${Math.round(b.x + b.width)}@${Math.round(b.y)}`, b.type ?? '', b.height);
    for (const v of this.sim.vines) if (Math.abs(v.x - Number(rx)) < 500 && v.bottomY > Number(ry) - 400 && v.topY < Number(ry) + 400)
      console.log('vine', v.id, Math.round(v.x), Math.round(v.topY), Math.round(v.bottomY), v.vineType ?? '');
  }
  return orig.call(this, p);
};
const r = ft.firstTimer('3-1', Number(seed), who, { cap: Number(t0) + 2, dotSetting: true });
console.log('end', r.end, r.time);
