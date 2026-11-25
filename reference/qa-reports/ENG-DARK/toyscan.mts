// re-pick the dark toys' roll on the current lay (ENG-DARK-d): one bot on the 3-1 draft, seeds a-b, first <cap> s, the turn removed
// (noGlowTurn) or not; prints per seed the unlit crossings and the waited-out stops (FTRun.dark.gaveUp). Run from the tree under test:
//   npx tsx reference/qa-reports/ENG-DARK/toyscan.mts FT_CHILD 1-40 50 [noturn]
// darkBots.test's toy B wants a seed where 'noturn' names one rim twice in gaveUp; toy A wants one whose old code (no turn) is unlit there.
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const [bot, range, cap, knob] = process.argv.slice(2);
const [a, b] = range.split('-').map(Number);
for (let seed = a; seed <= (b ?? a); seed++) {
  const who = knob === 'noturn' ? { ...(ft as any)[bot], noGlowTurn: true } : (ft as any)[bot];
  const r = ft.firstTimer('3-1', seed, who, { cap: Number(cap) });
  const g: string[] = r.dark?.gaveUp ?? [];
  const rims = g.map((s) => s.replace(/ at [\d.]+ s$/, ''));
  const twice = rims.some((x, i) => rims.indexOf(x) !== i);
  console.log(seed, 'crossed', r.dark?.crossed, 'unlit', r.dark?.unlit.length, 'gaveUp', g.length, twice ? 'SAME RIM TWICE' : '', JSON.stringify(g));
}
