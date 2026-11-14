import { firstTimer, FirstTimerRun, FT_ADULT, FT_KID } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
const proto: any = FirstTimerRun.prototype; const orig = proto.intend;
const T: Record<string, number> = {};
const inc = (k: string) => (T[k] = (T[k] ?? 0) + 1);
proto.intend = function () {
  const p = this.sim.p;
  if (this.jump && this.jump !== this.__j) { this.__j = this.jump; this.jump.__kind = this.jump.liana ? 'model hop' : 'other jump'; }
  const j = this.__j;
  if (j && !j.__done) {
    if (p.isVineSwinging) { j.__done = true; inc(`${this.who.name} ${this.who.setting} ${j.__kind}: CAUGHT`); }
    else if (p.grounded && this.t - j.t0 > 0.15) { j.__done = true; const near = this.sim.vines.some((v: any) => v.vineType === 'swing_liana' && Math.abs(v.x - j.x) < 400); if (near) inc(`${this.who.name} ${this.who.setting} ${j.__kind}: landed (liana near)`); }
  }
  return orig.call(this);
};
const owb = proto.pitWayBack;
proto.pitWayBack = function (tgt: any) {
  const before = this.climbBacks;
  const r = owb.call(this, tgt);
  if (this.climbBacks > before) {
    const j = this.__j;
    const src = this.t - this.letGoAt < 5 ? 'let-go' : j ? `${j.__kind} from ${Math.round(j.x)},${Math.round(j.y)} ${j.y > tgt.y + 60 ? '(from INSIDE the pit)' : '(from the lip level)'}` : 'no jump';
    inc(`PITFALL ${this.who.name} ${this.who.setting} after ${src.replace(/ from -?\d+,\d+/, '')}`);
    if (process.env.V) console.log(this.who.name, this.who.setting, this.seed, Math.round(this.t), src);
  }
  return r;
};
for (const who of [FT_KID, FT_ADULT]) for (const setting of ['normal', 'easy'] as const) for (let seed = 1; seed <= 6; seed++) firstTimer('1-6', seed, { ...who, setting });
for (const k of Object.keys(T).sort()) console.log(k, T[k]);
