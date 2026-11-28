// read-only: the draft 3-1 roll 1 Normal wood in a box, and its run-off rims near the test's edge (x 556, y 3672)
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
const { readyDraft } = await import(ROOT + '/tools/engine/draft.ts');
readyDraft('3-1');
const { firstTimer, FT_ADULT } = await import(ROOT + '/tools/inspect/firsttimer.ts');
const { runOffRims } = await import(ROOT + '/src/game/gen2/dark.ts');
let done = false;
firstTimer('3-1', 1, { ...FT_ADULT, setting: 'normal' }, { cap: 1, onFrame(sim: any) {
  if (done) return; done = true;
  const ps = (sim.stage.platforms as any[]).filter((p) => p.x < 900 && p.x + p.width > 250 && p.y > 3550 && p.y < 3950).map((p) => `${p.id}:${p.x}-${p.x + p.width}@${p.y} ${p.type}/${p.style ?? ''}`).sort();
  console.log('WOOD', ps.join(' | '));
  console.log('RUNOFF', runOffRims(sim.stage, 'normal').filter((q: any) => q.x > 300 && q.x < 900 && q.y > 3550 && q.y < 3950).map((q: any) => `${q.x},${q.y}->${q.land?.x},${q.land?.y}`).join(' | '));
} });
