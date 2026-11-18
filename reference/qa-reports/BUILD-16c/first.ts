import { firstTimer, FirstTimerRun, FT_KID, FT_ADULT } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
const proto: any = FirstTimerRun.prototype; const owb = proto.pitWayBack;
const T: Record<string, number> = {};
proto.pitWayBack = function (tgt: any) {
  const b = this.climbBacks; const r = owb.call(this, tgt);
  if (this.climbBacks > b) {
    const p = this.sim.p;
    const sec = this.sim.platforms.filter((q: any) => q.tag && Math.abs(q.x + q.width / 2 - p.x) < 900).sort((a: any, c: any) => Math.abs(a.x + a.width / 2 - p.x) - Math.abs(c.x + c.width / 2 - p.x))[0]?.tag?.split(':')[0];
    const tpl = (this.sim.stage as any).gen2?.sections?.find((s: any) => s.uid === sec)?.template ?? sec;
    const k = `${this.who.name} ${this.who.setting} ${tpl}`; T[k] = (T[k] ?? 0) + 1;
  }
  return r;
};
for (const who of [FT_KID, FT_ADULT]) for (const setting of ['normal', 'easy'] as const) for (let seed = 1; seed <= 6; seed++) firstTimer('1-6', seed, { ...who, setting });
for (const k of Object.keys(T).sort()) console.log(k, T[k]);
