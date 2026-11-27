// ENG-CATCH-e proof: ENG-CATCH-c's probe.mts (the tree read from ROOT, seeds FROM..SEEDS, both settings), plus every down tower refusal
// COUNTED and NAMED as it is made: a 'name' setter on tower.ts TowerRefusal's prototype (its constructor assigns this.name) records each
// refusal's miss, in this process only, no engine change, so a refused roll the search skipped is counted though its stage is never
// returned. An Easy build runs Normal's search first, so its count includes Normal's. A down verdict line in a returned stage's errors
// that is not a refusal is a LEAK of the guarantee. THE COST (the lead): rolls refused / rolls tried over Normal's searches (an Easy build
// runs the same search again), rolls tried = the returned roll's index + 1 (gen2.rerolls; the search returns at its first clean roll), and
// every roll for a seed with no clean one; and the worst stage's refusals.
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
await import(ROOT + '/tools/engine/draft.ts');
const { W3_DOWN_TOWER } = await import(ROOT + '/src/game/gen2/worlds/w3.ts');
const { buildStage, SETTINGS } = await import(ROOT + '/tools/engine/libstage.ts');
const { TowerRefusal } = await import(ROOT + '/src/game/gen2/tower.ts');
const { judgedOnArcs } = await import(ROOT + '/src/game/gen2/reach.ts');
const ALL_ROLLS = (judgedOnArcs('3-1') ? 2 : 1) * (6 + 1);
const keep = (process.env.KEEP ?? '').split(',');
const arr = W3_DOWN_TOWER as any[]; const kept = [...arr].filter((q) => keep.includes(q.id)); arr.splice(0, arr.length, ...kept);
let seen: string[] = [];
Object.defineProperty(TowerRefusal.prototype, 'name', {
  configurable: true,
  get() { return 'TowerRefusal'; },
  set(this: any, v: string) { seen.push(String(this.miss)); Object.defineProperty(this, 'name', { value: v, writable: true, configurable: true }); },
});
const from = Number(process.env.FROM ?? 1), to = Number(process.env.SEEDS ?? 40);
let ok = 0, n = 0, refusals = 0, refusedBuilds = 0, leaks = 0, nRefused = 0, nTried = 0, worst = 0, worstAt = '-'; const bad: string[] = []; const lines: string[] = [];
for (const d of SETTINGS) for (let s = from; s <= to; s++) {
  n++; seen = [];
  try {
    const st: any = buildStage('3-1', s, d); const e = (st.gen2.errors ?? []).map(String);
    if (d === 'normal') nTried += e.length ? ALL_ROLLS : (st.gen2.rerolls ?? 0) + 1;
    // (a tower miss in a returned stage's errors that is not a refusal: the guarantee leaked)
    const leak = e.filter((x: string) => /^tower: (a blind drop off|a catch passes its storey|a lid over a dip|a roof over a vine|the piece at x)/.test(x));
    leaks += leak.length;
    if (!e.length) ok++; else { bad.push(d[0] + s); for (const x of e) lines.push(`  ${d[0]}${s} ${leak.includes(x) ? 'LEAK ' : ''}${x.slice(0, 260)}`); }
  } catch (e) { if (d === 'normal') nTried += ALL_ROLLS; bad.push(d[0] + s + '!'); lines.push(`  ${d[0]}${s} THROW ${(e as Error).message.slice(0, 220)}`); }
  if (d === 'normal') nRefused += seen.length;
  if (seen.length > worst) { worst = seen.length; worstAt = d[0] + s; }
  if (seen.length) { refusals += seen.length; refusedBuilds++; for (const x of seen) lines.push(`  ${d[0]}${s} REFUSED ${x.slice(0, 220)}`); }
}
console.log(`${process.env.KEEP} ok ${ok}/${n} bad ${bad.join(' ') || '-'} | refusals ${refusals} in ${refusedBuilds} builds | Normal's searches: rolls refused ${nRefused} / tried ${nTried} (${nTried ? Math.round((100 * nRefused) / nTried) : 0}%) | worst stage ${worst} (${worstAt}) | leaks ${leaks}`);
if (process.env.VERBOSE) for (const l of lines) console.log(l);
