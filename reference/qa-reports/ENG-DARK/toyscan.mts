// re-pick the dark toys' roll on the current lay (ENG-DARK-d): one bot on the 3-1 draft, seeds a-b, first <cap> s, the turn removed
// (noGlowTurn) or not; prints per seed the unlit crossings and the waited-out stops (FTRun.dark.gaveUp). Run from the tree under test:
//   npx tsx reference/qa-reports/ENG-DARK/toyscan.mts FT_CHILD 1-40 50 [noturn|<FirstTimer plant field>] [normal|easy] [both]
// (ENG-DARK-l) the knob may be any FirstTimer plant field (noTurnRoom, noSeamWalk, ...); a setting; 'both' also runs it unplanted and
//  prints that line ('base'); 'worst' is the most times one rim was gone over dark (the seam toy's loop).
// darkBots.test's toy B wants a seed where 'noturn' names one rim twice in gaveUp; toy A wants one whose old code (no turn) is unlit there.
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const [bot, range, cap, knob, setting, both] = process.argv.slice(2);
const field = knob === 'noturn' ? 'noGlowTurn' : knob;
const worst = (u: string[]) => Math.max(0, ...[...u.reduce((m, x) => { const k = x.replace(/ at [\d.]+ s .*$/, ''); return m.set(k, (m.get(k) ?? 0) + 1); }, new Map<string, number>()).values()]);
const [a, b] = range.split('-').map(Number);
for (let seed = a; seed <= (b ?? a); seed++) {
  for (const planted of both === 'both' ? [true, false] : [true]) {
  const base = { ...(ft as any)[bot], ...(setting ? { setting } : {}) };
  const who = field && planted ? { ...base, [field]: true } : base;
  const r = ft.firstTimer('3-1', seed, who, { cap: Number(cap) });
  const g: string[] = r.dark?.gaveUp ?? [];
  const rims = g.map((s) => s.replace(/ at [\d.]+ s$/, ''));
  const twice = rims.some((x, i) => rims.indexOf(x) !== i);
  const u: string[] = r.dark?.unlit ?? [];
  console.log(seed, planted ? 'plant' : 'base ', 'crossed', r.dark?.crossed, 'unlit', u.length, 'worst', worst(u), 'gaveUp', g.length, twice ? 'SAME RIM TWICE' : '', JSON.stringify(g).slice(0, 160), JSON.stringify(u.slice(0, 2)).slice(0, 200));
  }
}
