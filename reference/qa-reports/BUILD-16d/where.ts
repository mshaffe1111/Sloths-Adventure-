// BUILD-16d: where each bot loses a life, is rescued or falls into a pit, by 1-6 section (template:key of the nearest tagged piece).
// BOTS=kid,adult SET=normal SEEDS=1-6 npx tsx reference/qa-reports/BUILD-16d/where.ts   (one process per bot/setting: R-165.244)
import { firstTimer, FirstTimerRun, FT_CHILD, FT_MIDDLE, FT_EXPERT, FT_KID, FT_ADULT } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
const proto: any = FirstTimerRun.prototype;
const op = proto.play; let last: any = null;
proto.play = function () { last = this; return op.call(this); };
const pits: Array<{ x: number }> = [];
const owb = proto.pitWayBack;
proto.pitWayBack = function (tgt: any) { const b = this.climbBacks; const r = owb.call(this, tgt); if (this.climbBacks > b) pits.push({ x: this.sim.p.x }); return r; };
const bots: Record<string, any> = { child: FT_CHILD, middle: FT_MIDDLE, expert: FT_EXPERT, kid: FT_KID, adult: FT_ADULT };
const seeds = (process.env.SEEDS ?? '1-6').split('-').map(Number);
const T: Record<string, number> = {};
for (const name of (process.env.BOTS ?? 'kid,adult').split(',')) for (const setting of (process.env.SET ?? 'normal').split(',')) for (let seed = seeds[0]; seed <= seeds[1]; seed++) {
  pits.length = 0;
  const r: any = firstTimer('1-6', seed, { ...bots[name], setting });
  const st = last.sim.stage; const secs = st.gen2?.sections ?? [];
  const at = (x: number) => {
    const q = last.sim.platforms.filter((q: any) => q.tag).sort((a: any, c: any) => Math.abs(a.x + a.width / 2 - x) - Math.abs(c.x + c.width / 2 - x))[0];
    if (!q) return '?'; const [uid, key] = q.tag.split(':'); const tpl = secs.find((s: any) => s.uid === uid)?.template ?? uid;
    return `${tpl.replace('w1-16-', '')}:${key}`;
  };
  const ev: string[] = [];
  for (const h of r.harms) if (h.kind === 'life') ev.push(`LIFE@${at(h.x)}(${h.cause})`);
  for (const x of r.rescueXs) ev.push(`RESCUE@${at(x)}`);
  for (const p of pits) ev.push(`PIT@${at(p.x)}`);
  for (const e of ev) { const k = `${name} ${setting} ${e.replace(/\(.*\)/, '')}`; T[k] = (T[k] ?? 0) + 1; }
  console.log(name, setting, seed, r.end, JSON.stringify(r.goal), 'rescues', r.rescues, ev.join(' '));
}
console.log('\nTOTALS');
for (const k of Object.keys(T).sort()) console.log(k, T[k]);
