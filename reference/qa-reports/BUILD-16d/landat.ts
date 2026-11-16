// BUILD-16d: where a bot touches down after a liana let-go (section:key, share of the piece) and where he leaves a take-off bank for a
// liana (share of it): BOTS=expert,middle SEEDS=1-6
import { firstTimer, FirstTimerRun, FT_CHILD, FT_MIDDLE, FT_EXPERT, FT_KID, FT_ADULT } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
const proto: any = FirstTimerRun.prototype; const oi = proto.intend;
const L: Record<string, number[]> = {}, O: Record<string, number[]> = {};
const name = (st: any, q: any) => { const [uid, key] = q.tag.split(':'); return `${(st.gen2.sections.find((s: any) => s.uid === uid)?.template ?? uid).replace('w1-16-', '')}:${key}`; };
proto.intend = function () {
  const p = this.sim.p, st = this.sim.stage;
  const q = (x: number, y: number) => this.sim.platforms.find((q: any) => q.tag && x >= q.x - 4 && x <= q.x + q.width + 4 && Math.abs(q.y - y) < 12);
  if (p.grounded && !this.__g && this.__swung) { const k = q(p.x, p.y); if (k) (L[name(st, k)] ??= []).push((p.x - k.x) / k.width); this.__swung = false; }
  if (p.isVineSwinging && !this.__v && this.__lastGround) { const k = this.__lastGround; (O[name(st, k.q)] ??= []).push((k.x - k.q.x) / k.q.width); }
  if (p.isVineSwinging) this.__swung = true;
  if (p.grounded) { const k = q(p.x, p.y); this.__lastGround = k ? { q: k, x: p.x } : null; }
  this.__g = p.grounded; this.__v = p.isVineSwinging;
  return oi.call(this);
};
const bots: Record<string, any> = { child: FT_CHILD, middle: FT_MIDDLE, expert: FT_EXPERT, kid: FT_KID, adult: FT_ADULT };
const seeds = (process.env.SEEDS ?? '1-6').split('-').map(Number);
for (const b of (process.env.BOTS ?? 'expert').split(',')) for (let s = seeds[0]; s <= seeds[1]; s++) firstTimer('1-6', s, { ...bots[b], setting: (process.env.SET ?? 'normal') as any });
const f = (a: number[]) => `n ${a.length} min ${Math.min(...a).toFixed(2)} med ${a.sort((x, y) => x - y)[a.length >> 1].toFixed(2)} max ${Math.max(...a).toFixed(2)}`;
console.log('LANDED ON (after a let-go)'); for (const k of Object.keys(L).sort()) console.log(' ', k, f(L[k]));
console.log('LEFT FROM (the last ground before a catch)'); for (const k of Object.keys(O).sort()) console.log(' ', k, f(O[k]));
