// Builds the river proof stage with the gen2 pipeline (the toy kit on World 2's ground and rows: a safe 'ride' river, then a deep river
// whose first two logs carry a petal), runs World 2's finish, and writes what the page needs to draw it. Usage: npx tsx fixture.ts <out.json>
import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import fs from 'node:fs';
import { buildGen2Stage } from '/home/user/Sloths-Adventure-/src/game/gen2/pipeline.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from '/home/user/Sloths-Adventure-/src/game/gen2/toyWorld.ts';
import { w2Finish, W2_GROUND, W2_RIVERS } from '/home/user/Sloths-Adventure-/src/game/gen2/worlds/w2.ts';
const river = { id: 'proof-river', name: 'river', archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    { key: 'near', shape: 'bank', w: [340, 340], place: { kind: 'start' }, main: true, style: 'log' },
    { key: 'mid', shape: 'bank', w: [360, 360], place: { kind: 'river', after: 'near', row: 'ride' }, main: true, landing: true, style: 'log' },
    { key: 'far', shape: 'bank', w: [420, 420], place: { kind: 'river', after: 'mid', row: 'deep' }, main: true, landing: true, style: 'log' },
  ], entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false } as any;
const kit: any = { ...toyKit, manifest: { ...toyKit.manifest, world: 2, ground: { ...toyKit.manifest.ground, y: W2_GROUND.y, bankH: W2_GROUND.bankH }, rivers: { ...W2_RIVERS, deep: { ...W2_RIVERS.deep, petals: 2 } }, creatures: [], props: [], pairs: [], tips: {},
  sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k: any) => k.role !== 'prop') }, river] } };
const d = (process.argv[3] ?? 'normal') as 'normal' | 'easy';
for (let seed = 1; seed <= 60; seed++) {
  const st: any = buildGen2Stage({ config: { ...toyCfg('2-91', 'sprint'), unlocked: true }, kit, seed, difficulty: d });
  if (st.gen2.errors?.length || !st.rivers?.length) continue;
  w2Finish(st, d);
  const logR = st.rivers.filter((r: any) => r.speed > 0);
  fs.writeFileSync(process.argv[2], JSON.stringify({ seed, setting: d, platforms: st.platforms, rivers: st.rivers, collectibles: st.collectibles, decor: st.proto?.decor ?? [], logRivers: logR.map((r: any) => ({ x0: r.x0, x1: r.x1, safe: !!r.safe, surfaceY: r.surfaceY })) }));
  console.log('seed', seed, 'rivers', logR.map((r: any) => `${r.x0}-${r.x1}${r.safe ? ' safe' : ' deep'}`).join(', '), 'riders', st.collectibles.filter((c: any) => c.rides).length);
  break;
}
