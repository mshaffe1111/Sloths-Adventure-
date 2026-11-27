// KIT-W3a box 6: the drop toys (w3Noise's moss / stone section) on World 3's real kit, 3-1's draft row LAID ALONG (TRAVEL, default right),
// seeds 1-40 Normal: per seed, clean or not, the toy laid or not, its fall column clear (w3Noise's dropClear). TRAVEL=down for the tower.
import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import { readied, readyDraft } from '/home/user/Sloths-Adventure-/tools/engine/draft.ts';
import { generateAllLevels } from '/home/user/Sloths-Adventure-/src/game/worldsData.ts';
import { buildGen2Stage } from '/home/user/Sloths-Adventure-/src/game/gen2/pipeline.ts';
import { LISTED } from '/home/user/Sloths-Adventure-/src/game/gen2/listed.ts';
import { W3_CAST } from '/home/user/Sloths-Adventure-/src/game/gen2/worlds/w3.ts';
const D = '3-1'; if (readied !== D) readyDraft(D);
const base: any = { ...generateAllLevels().find((c) => c.id === (process.env.STAGE ?? D) && !c.secret)!, unlocked: true };
const cfg = { ...base, ...(process.env.TRAVEL ? { travel: process.env.TRAVEL as any } : process.env.STAGE ? {} : { travel: 'right' as any }) };
const DROP = Number(process.env.DROP ?? 400), DROP_W = 800, TOL = 10;
const OC: any = W3_CAST.find((c) => c.enemy === 'ocelot')!;
const row = process.env.ROW ?? 'moss';
const flat = row === 'call' || row === 'punch';
const sec0: any = { id: `w3-noise-toy-${row}`, name: 't', archetypes: 'any', ...(process.env.TYPED ? { content: 'ground', jobs: ['practise', 'test', 'combine', 'twist', 'signature'] } : {}), phases: ['ten', 'ketsu'], difficulty: 2, maxPerStage: 1, mirrorable: false,
  pieces: [{ key: 'top', shape: 'branch', w: [200, 240], place: { kind: 'start' }, main: true },
    { key: 'floor', shape: 'bank', w: [DROP_W, DROP_W], place: { kind: 'jump', after: 'top', dy: [DROP, DROP], gapPx: [8, 20] }, landing: true, main: true, ...(row === 'moss' ? { quiet: true } : {}) }],
  sockets: [{ id: 'sleeper', role: 'enemy', on: 'floor', t: [0.55, 0.55], maxThreat: 1, chance: 1 }],
  entry: { piece: 'top', kind: 'ledge' }, exit: { piece: 'floor', kind: 'ground' }, exitDy: DROP };
// (ROW=call / punch: w3Noise's flat toys, a 1000 px bank with the animal on it; the stone socket is left off, the floor is what is asked)
const sec: any = flat ? { ...sec0, pieces: [{ key: 'floor', shape: 'bank', w: [1000, 1000], place: { kind: 'start' }, main: true }],
  sockets: [{ id: 'sleeper', role: 'enemy', on: 'floor', t: [0.75, 0.75], maxThreat: 1, chance: 1 }], entry: { piece: 'floor', kind: 'ground' }, exit: { piece: 'floor', kind: 'ground' }, exitDy: 0 } : sec0;
const k: any = LISTED[D].kit();
const kit = { ...k, manifest: { ...k.manifest, ...(process.env.CORR ? { corridor: { ...k.manifest.corridor, top: k.manifest.corridor.bottom - Number(process.env.CORR) } } : {}), creatures: [{ ...OC, threat: 1, extra: { ...OC.extra, asleep: true } }, ...k.manifest.creatures.filter((c: any) => c.enemy !== 'ocelot')], sections: [...k.manifest.sections, sec] } };
const top = (P: any[], f: any) => P.find((p) => p !== f && Math.abs(f.y - p.y - DROP) <= TOL && ((g) => g >= 8 && g <= 20)(p.x < f.x ? f.x - (p.x + p.width) : p.x - (f.x + f.width)));
const clear = (P: any[], f: any, x: number) => { const t = top(P, f); if (!t) return false; const [lo, hi] = t.x < f.x ? [t.x + t.width, x] : [x, t.x]; return !P.some((p) => p !== t && p !== f && p.y > t.y + 2 && p.y < f.y - 2 && p.x < hi && p.x + p.width > lo); };
let clean = 0, laid = 0, ok = 0, picked = 0; const okSeeds: number[] = []; const errs = new Map<string, number>();
for (let s = 1; s <= Number(process.env.SEEDS ?? 40); s++) {
  let st: any;
  try { st = buildGen2Stage({ config: cfg, kit, seed: s, difficulty: 'normal' }); } catch (e) { errs.set('THROW ' + String((e as Error).message).slice(0, 120), (errs.get('THROW ' + String((e as Error).message).slice(0, 120)) ?? 0) + 1); continue; }
  const er = st.gen2.errors ?? [];
  for (const x of er) { const key = String(x).replace(/\d+/g, '#').slice(0, 120); errs.set(key, (errs.get(key) ?? 0) + 1); }
  if (!er.length) clean++;
  const tq = st.gen2.sections.find((q: any) => q.template === sec.id);
  if (tq) { picked++; if (process.env.VERBOSE) { const ps = st.platforms.filter((p: any) => p.width >= 500).map((p: any) => `${Math.round(p.x)}-${Math.round(p.x + p.width)}@${Math.round(p.y)}`); const oc = st.enemies.filter((q: any) => q.type === 'ocelot').map((q: any) => `${Math.round(q.x)},${Math.round(q.y)}`); console.log('  seed', s, 'toy x', Math.round(tq.x0), '-', Math.round(tq.x1), 'y0', Math.round(tq.y0 ?? NaN), 'errs', er.length, 'wide pieces', ps.join(' '), 'ocelots', oc.join(' ') || '-'); } }
  const f = st.platforms.find((p: any) => p.width === DROP_W && top(st.platforms, p));
  const e = f && st.enemies.find((q: any) => q.type === 'ocelot' && q.x >= f.x && q.x <= f.x + f.width);
  if (f && e) laid++;
  if (!er.length && f && e && clear(st.platforms, f, e.x)) { ok++; okSeeds.push(s); }
}
console.log(`stage ${cfg.id} travel ${cfg.travel ?? 'right'} row ${row}: clean ${clean}, toy picked ${picked}, toy laid ${laid}, clean+laid+clear ${ok} of ${process.env.SEEDS ?? 40}; seeds ${okSeeds.join(' ') || '-'}`);
for (const [m, n] of [...errs].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${n} x ${m}`);
