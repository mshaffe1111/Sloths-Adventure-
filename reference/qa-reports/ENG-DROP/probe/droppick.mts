// ENG-DROP step 3: the drop toy's pick on 3-2's DRAFT row (World 3's kit laid along), seeds 1-40 x both settings: how many rolls lay
// it, how many are clean, and every refusal by name (a designed drop swapped by dropSeen, a roll's errors). The toy exactly as
// w3Noise.test.ts lays it (moss; DECLARED=0 takes its declared drop off: the plant). Run: npx tsx reference/qa-reports/ENG-DROP/probe/droppick.mts
import '../../../../src/game/headlessDom.ts';
import { readied, readyDraft } from '../../../../tools/engine/draft.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { buildGen2Stage, dropSeen } from '../../../../src/game/gen2/pipeline.ts';
import { LISTED } from '../../../../src/game/gen2/listed.ts';
import { W3_CAST } from '../../../../src/game/gen2/worlds/w3.ts';
const D = process.env.STAGE ?? '3-2';
if (readied !== D) readyDraft(D);
const cfg: any = { ...generateAllLevels().find((c) => c.id === D && !c.secret)!, unlocked: true };
const DROP = 400, DROP_W = 800;
const OC: any = W3_CAST.find((c) => c.enemy === 'ocelot')!;
const declared = process.env.DECLARED !== '0';
const sec: any = { id: 'w3-noise-toy-moss', name: 'a moss toy', archetypes: 'any', phases: ['ten', 'ketsu'], difficulty: 2, maxPerStage: 1, mirrorable: false,
  pieces: [{ key: 'top', shape: (process.env.TOP ?? 'branch') as any, w: [200, 240], place: { kind: 'start' }, main: true },
    { key: 'floor', shape: 'bank', w: [DROP_W, DROP_W], place: { kind: 'jump', after: 'top', dy: [DROP, DROP], gapPx: [8, 20] }, landing: true, main: true, quiet: true }],
  sockets: [{ id: 'sleeper', role: 'enemy', on: 'floor', t: [0.55, 0.55], maxThreat: 1, chance: 1 }],
  entry: { piece: 'top', kind: (process.env.TOP === 'bank' ? 'ground' : 'ledge') as any }, exit: { piece: 'floor', kind: 'ground' }, exitDy: DROP, ...(declared ? { drop: DROP } : {}) };
const k: any = LISTED[D].kit();
const kit = { ...k, manifest: { ...k.manifest, creatures: [{ ...OC, threat: 1, extra: { ...OC.extra, asleep: true } }, ...k.manifest.creatures.filter((c: any) => c.enemy !== 'ocelot')], sections: [...k.manifest.sections, sec] } };
for (const difficulty of ['normal', 'easy'] as const) {
  let laid = 0, clean = 0, cleanLaid = 0, seen = 0;
  const why = new Map<string, number>();
  const add = (m: string) => why.set(m, (why.get(m) ?? 0) + 1);
  for (let s = 1; s <= 40; s++) {
    let st: any;
    try { st = buildGen2Stage({ config: cfg, kit, seed: s, difficulty }); } catch (e) { add('THROW ' + String((e as Error).message).replace(/\d+/g, '#').slice(0, 140)); continue; }
    const er: string[] = st.gen2.errors ?? [];
    if (!er.length) clean++;
    for (const r of st.gen2.repairs ?? []) if (/designed drop/.test(r.note)) add('swapped: ' + r.note.replace(/\d+/g, '#').slice(0, 160));
    for (const x of er) add('error: ' + String(x).replace(/\d+/g, '#').slice(0, 140));
    const q = st.gen2.sections.find((z: any) => z.template === sec.id);
    if (!q) continue;
    laid++;
    if (!er.length) cleanLaid++;
    const floor = st.platforms.find((p: any) => p.width >= DROP_W && p.quiet);
    const top = floor && st.platforms.find((p: any) => p !== floor && Math.abs(floor.y - p.y - DROP) <= 12 && ((g: number) => g >= 8 && g <= 20)(p.x < floor.x ? floor.x - (p.x + p.width) : p.x - (floor.x + floor.width)));
    const w = top ? dropSeen(top, floor, st.platforms) : "no top found"; if (w === undefined) seen++; else add("final stage not in view: " + w.replace(/\d+/g, "#"));
  }
  console.log(`${D} ${difficulty} (drop ${declared ? 'declared' : 'UNDECLARED'}): clean ${clean}/40, toy laid ${laid}/40, laid+clean ${cleanLaid}/40, laid in view (dropSeen) ${seen}/${laid}`);
  for (const [m, n] of [...why].sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log(`  ${n} x ${m}`);
}
