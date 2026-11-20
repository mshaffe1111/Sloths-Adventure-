// ENG-24c stills: 2-4 (layout 1) on the REAL engine (this tree: t-build-24 + t-eng-24c), through the game's own touch input. Pokey on the
// first liana over a river (beat 1's drop): a hang over two log cycles (every frame: his state, the clocks, the logs, the DRAWN glow),
// then a real let-go pressed at a lit frame and one at an unlit frame whose let-go drowns, each flown to where it comes down.
//   ROOT=<tree> npx tsx recGlow.mts <setting> <out.json>
const ROOT = process.env.ROOT!;
await import(`${ROOT}/src/game/headlessDom.ts`);
const { RealPlay, DT } = await import(`${ROOT}/src/game/realPlay.ts`);
const { setDifficulty } = await import(`${ROOT}/src/game/difficulty.ts`);
const { vinePeriod } = await import(`${ROOT}/src/game/physics.ts`);
const { lianasOver } = await import(`${ROOT}/src/game/river.ts`);
const fs = await import('node:fs');
const [setting = 'normal', out = 'rec.json', which = '0'] = process.argv.slice(2);
setDifficulty(setting as never);
const r = new RealPlay('2-4', 1);
r.useRealInput();
const e = r.e as any;
const rivers = (e.currentStage.rivers ?? []).filter((q: any) => q.speed > 0).sort((a: any, b: any) => a.x0 - b.x0);
const pairs = rivers.map((q: any) => ({ q, v: lianasOver(r.vines, q).sort((a: any, b: any) => a.x - b.x)[0] })).filter((p: any) => p.v);
const { q: river, v } = pairs[Number(which)];
const T = vinePeriod(v);
const L = Math.min(v.bottomY - v.topY - 10, (v.bottomY - v.topY) * 0.8);
const keep = ['x', 'y', 'vx', 'vy', 'width', 'height', 'grounded', 'facing', 'isVineSwinging', 'swingAngle', 'swingAngularVelocity', 'swingLength', 'swingVineId', 'climbing', 'hanging', 'jumpsLeft', 'isDoubleJumping', 'somersaultAngle', 'squashX', 'squashY'];
const snap = (tag: string) => ({ tag, t: e.gameTime, vc: e.vineClock, sg: e.sweetGlow, p: Object.fromEntries(keep.map((k) => [k, r.p[k as never]])), logs: r.platforms.filter((q: any) => q.type === 'drift').map((q: any) => [q.id, q.x, q.y]), va: r.vines.filter((q: any) => q.vineType !== 'tree_climb').map((q: any) => [q.id, q.swingAngle]), on: e.standingOnId });
const VC0 = 30, GT0 = 40;
const start = () => { r.swing(v, { angle: 0, omega: 0, len: L, t: VC0 - T }); e.sweetSnap = null; e.swingLeapWait = 0; r.t = GT0 - T; for (let i = 0; i < Math.round(T / DT); i++) r.frame({ right: true }); };
start();
const frames: any[] = [];
const F = Math.round(Math.max((river.x1 - river.x0) / river.speed, 2 * T) / DT);
const lit: boolean[] = [];
for (let f = 0; f < F; f++) { r.frame({ right: true }); frames.push(snap('hang')); lit.push(e.sweetGlow > 0.03); }
const fly = (f: number, tag: string) => {
  start();
  for (let i = 0; i < f; i++) r.frame({ right: true });
  r.frame({ right: true, press: true });
  frames.push(snap(tag));
  let end = 'WATER';
  for (let k = 1; k < 120; k++) {
    r.frame({ right: true });
    frames.push(snap(tag));
    if (r.p.isVineSwinging) continue;
    if (r.p.grounded) { end = r.platforms.find((q: any) => q.id === r.standingOn)?.type === 'drift' ? 'LOG' : 'BANK'; for (let j = 0; j < 20; j++) { r.frame({}); frames.push(snap(tag)); } break; }
    if (r.died || r.p.y > river.surfaceY + 80) break;
  }
  return end;
};
// (the first lit frame after an unlit one, and an unlit frame between two lit windows)
const litAt = lit.findIndex((g, i) => i > 0 && g && !lit[i - 1]);
let darkAt = -1, best = 0;
for (let i = 1; i < F; i++) if (!lit[i] && lit[i - 1]) { let j = i; while (j < F && !lit[j]) j++; if (j < F && j - i > best) { best = j - i; darkAt = Math.floor((i + j) / 2); } }
const a = fly(litAt + 2, 'press-lit');
const b = fly(darkAt, 'press-dark');
fs.writeFileSync(out, JSON.stringify({ setting, variant: 1, liana: { x: v.x, topY: v.topY }, river: { x0: river.x0, x1: river.x1 }, litAt, darkAt, pressLit: a, pressDark: b, frames }));
console.log(`2-4 ${setting}: liana x ${v.x} over river ${river.x0}-${river.x1}; ${F} hang frames, lit ${lit.filter(Boolean).length}; press at lit ${litAt + 2} -> ${a}; press at dark ${darkAt} -> ${b}; ${frames.length} frames`);
