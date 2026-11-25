// downEnd's pick per frame near one rim (ENG-DARK-j, the 32 N loop): GEN2_DRAFT=3-1 npx tsx <this> <bot> <setting> <seed> <rimX> <rimY> <t0> <t1>
// wraps FirstTimerRun.prototype.downEnd from outside (firsttimer.ts is not edited): t, x, y, grounded, the pick, downPt, the floor under him
import path from 'node:path';
const root = process.cwd();
const [bot, setting, seed, rx, ry, t0, t1] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const who = cb.CAST_BOTS[bot][setting];
const proto = ft.FirstTimerRun.prototype as any;
const orig = proto.downEnd;
let last = '';
proto.downEnd = function (p: any) {
  const r = orig.call(this, p);
  const t = this.t;
  if (t >= Number(t0) && t <= Number(t1) && Math.abs(p.x - Number(rx)) < 300 && Math.abs(p.y - Number(ry)) < 300) {
    const at = this.downPt(p);
    const fl = this.floorAt(p.x, p.y, 6);
    const line = `${r} downPt ${at ? `${Math.round(at.x)},${Math.round(at.y)}` : '-'} floor ${fl ? `${Math.round(fl.x)}-${Math.round(fl.x + fl.width)}@${Math.round(fl.y)}` : '-'} cur ${this.prog.cur}`;
    if (line !== last) console.log(t.toFixed(2), Math.round(p.x), Math.round(p.y), p.grounded ? 'G' : 'air', 'pick', line);
    last = line;
  }
  return r;
};
const r = ft.firstTimer('3-1', Number(seed), who, { cap: Number(t1) + 1, dotSetting: true });
console.log('end', r.end, r.time);
