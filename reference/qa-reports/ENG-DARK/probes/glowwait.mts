// glowWait per frame near one rim (ENG-DARK-j): GEN2_DRAFT=3-1 npx tsx <this> <bot> <setting> <seed> <rimX> <rimY> <t0> <t1>
// wraps FirstTimerRun.prototype.glowWait from outside: t, x, y, grounded, facing, the dir asked, what it returned, the stop it holds
import path from 'node:path';
const root = process.cwd();
const [bot, setting, seed, rx, ry, t0, t1] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const who = cb.CAST_BOTS[bot][setting];
const proto = ft.FirstTimerRun.prototype as any;
const orig = proto.glowWait;
proto.glowWait = function (dir: number) {
  const r = orig.call(this, dir);
  const p = this.sim.p;
  if (this.t >= Number(t0) && this.t <= Number(t1) && Math.abs(p.x - Number(rx)) < 300 && Math.abs(p.y - Number(ry)) < 300) {
    const s = this.glowStop;
    console.log(this.t.toFixed(2), p.x.toFixed(1), Math.round(p.y), p.grounded ? 'G' : 'air', 'face', p.facing, 'vx', (p.vx ?? 0).toFixed(0), 'dir', dir, 'ret', JSON.stringify(r), 'stop', s ? `${s.rim.x},${s.rim.y} turn ${s.turn}` : '-', 'standOn', this.e.standingOnId ?? '-');
  }
  return r;
};
const r = ft.firstTimer('3-1', Number(seed), who, { cap: Number(t1) + 1, dotSetting: true });
console.log('end', r.end, r.time);
