import { firstTimer, FirstTimerRun, FT_ADULT, FT_KID } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
import { setDifficulty } from '/home/user/Sloths-Adventure-/src/game/difficulty.ts';
const proto: any = FirstTimerRun.prototype;
const orig = proto.intend;
const tally: Record<string, { n: number; ok: number }> = {};
let cur: any = null;
proto.intend = function () {
  const p = this.sim.p;
  if (p.isVineSwinging) { const v = this.sim.vines.find((q: any) => q.id === p.swingVineId); this.__on = v; }
  else if (this.__on) { this.__rel = { v: this.__on, t: this.t }; this.__on = null; }
  if (this.__rel && p.grounded && this.t - this.__rel.t > 0.1) {
    const v = this.__rel.v; const kind = `${this.who.name} ${this.who.setting} ${v.grip === 'high' ? 'SHORT' : v.grip === 'low' ? 'FAR' : 'LONG'}`;
    tally[kind] ??= { n: 0, ok: 0 }; tally[kind].n++; if (p.y < v.bottomY + 60) tally[kind].ok++;
    this.__rel = null;
  }
  if (this.__rel && p.isVineSwinging) this.__rel = null; // caught another liana: a chain, not a landing
  return orig.call(this);
};
const owb = proto.pitWayBack;
proto.pitWayBack = function (tgt: any) {
  const before = this.climbBacks, st = this.stuck.length;
  const r = owb.call(this, tgt);
  if (this.climbBacks > before || this.stuck.length > st) {
    const p = this.sim.p;
    const v = this.sim.vines.filter((q: any) => q.vineType === 'swing_liana' && Math.abs(q.x - p.x) < 600).sort((a: any, b: any) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
    const g = v ? (v.grip === 'high' ? 'SHORT' : v.grip === 'low' ? 'FAR' : 'LONG') + ' ' + (v.tag ?? '') : '?';
    const k = `${this.who.name} ${this.who.setting} PIT ${this.t - this.letGoAt < 5 ? 'after let-go' : 'MISSED CATCH'} at ${g.replace(/:.*/, '')} ${g.split(' ')[0]}`;
    tally[k] ??= { n: 0, ok: 0 }; tally[k].n++;
  }
  return r;
};
for (const who of [FT_KID, FT_ADULT]) for (const setting of ['normal', 'easy'] as const) for (let seed = 1; seed <= 6; seed++) {
  firstTimer('1-6', seed, { ...who, setting });
}
for (const [k, v] of Object.entries(tally).sort()) console.log(k.padEnd(22), `${v.ok}/${v.n} landed (${Math.round((100 * v.ok) / v.n)}%)`);
