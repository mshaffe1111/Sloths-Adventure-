// read only: cast bot <name> <setting> on the 3-1 draft, rolls [a..b], whole runs: each OWN-light rim a stop is held at past its end
// (standingOnId still the rim's piece), its unlit crossings with the hold, and with noLipHold on the same roll
const [root, name, setting] = process.argv.slice(2, 5), a = +process.argv[5], b = +process.argv[6];
await import(root + '/src/game/headlessDom.ts');
const { readyDraft } = await import(root + '/tools/engine/draft.ts');
readyDraft('3-1');
const { firstTimer } = await import(root + '/tools/inspect/firsttimer.ts');
const { CAST_BOTS } = await import(root + '/tools/inspect/castBots.ts');
const who = (CAST_BOTS as any)[name][setting];
const run = (roll: number, noLipHold: boolean) => {
  const own = new Map<string, number>();
  const r = firstTimer('3-1', roll, { ...who, noLipHold }, { cap: 400, dotSetting: true, onFrame(sim: any, bb: any) {
    const g = bb.glowStop, p = sim.p;
    if (!g || g.rim.runOff || !p.grounded || (p.x - g.rim.x) * g.rim.dir <= 0 || bb.e.standingOnId !== g.rim.piece.id) return;
    const at = `the rim at x ${g.rim.x}, y ${Math.round(g.rim.y)} (`;
    own.set(at, (own.get(at) ?? 0) + 1);
  } });
  return { own, unlit: (r.dark?.unlit ?? []) as string[] };
};
for (let roll = a; roll <= b; roll++) {
  const g = run(roll, false);
  if (!g.own.size) { console.log(`${name} ${setting} roll ${roll}: -`); continue; }
  const pl = run(roll, true);
  for (const [k, n] of g.own) console.log(`${name} ${setting} roll ${roll}: ${k} held ${n} green unlit ${g.unlit.filter((u) => u.includes(k)).length} plant unlit ${pl.unlit.filter((u) => u.includes(k)).length}${g.unlit.filter((u) => u.includes(k)).length === 0 && pl.unlit.filter((u) => u.includes(k)).length === 1 ? '  <== CASE' : ''}`);
}
