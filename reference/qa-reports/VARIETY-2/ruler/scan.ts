// RULER scan (packet item a): the OLD ruler (d8d6a97's w1Pits.ts) against the NEW (this branch's), on the SAME built stages: every stage x
// both settings x N layouts, built by the old tree (so a refusal the new ruler causes cannot hide a stage), read by both rulers and both
// floor.unmarked readings (promises11 floorlessGaps of each tree). Prints every changed gap: raw (findW1Pits), painted (a marked drop with
// walls: drawW1Pits paints these and hurt pits, nothing else) and the verdict (floor.unmarked).
//   git worktree add /home/user/wt-main d8d6a97 && ln -s "$PWD/node_modules" /home/user/wt-main/node_modules
//   npx tsx reference/qa-reports/VARIETY-2/ruler/scan.ts /home/user/wt-main 16 > reference/qa-reports/VARIETY-2/ruler/scan.txt
const OLD = process.argv[2];
const N = Number(process.argv[3] ?? 16);
const only = process.argv[4]?.split(',');
await import(`${OLD}/src/game/headlessDom.ts`);
const { generateAllLevels } = await import(`${OLD}/src/game/worldsData.ts`);
const { generateStage, setLayoutVariant } = await import(`${OLD}/src/game/stageGenerator.ts`);
const { easyStage } = await import(`${OLD}/src/game/easyMode.ts`);
const { withGoals } = await import(`${OLD}/src/game/goals.ts`);
const oldR = await import(`${OLD}/src/game/w1Pits.ts`);
const oldV = await import(`${OLD}/src/game/gen2/promises11.ts`);
const newR = await import('../../../../src/game/w1Pits.ts');
const newV = await import('../../../../src/game/gen2/promises11.ts');
type G = { x0: number; x1: number; kind: string; top: number; drop?: boolean; walls?: unknown; floor?: number };
const k = (g: G) => `${g.kind}${g.drop ? '+drop' : ''}${g.walls ? '+walls' : ''} ${Math.round(g.x0)}..${Math.round(g.x1)}${g.floor !== undefined ? ` floor ${Math.round(g.floor - g.top)}` : ''}`;
const diff = (a: string[], b: string[]) => [a.filter((x) => !b.includes(x)), b.filter((x) => !a.includes(x))];
const tally: Record<string, number> = {};
const add = (t: string, n = 1) => (tally[t] = (tally[t] ?? 0) + n);
for (const c of generateAllLevels().filter((l: { secret?: boolean; id: string }) => !l.secret && (!only || only.includes(l.id)))) {
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    setLayoutVariant(v);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let st: any;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); }
    catch (e) { console.log(`${c.id} ${setting} ${v}: OLD BUILD ERROR ${String((e as Error).message).slice(0, 100)}`); setLayoutVariant(null); continue; }
    setLayoutVariant(null);
    add('builds');
    const raw = diff(oldR.findW1Pits(st.platforms).map(k), newR.findW1Pits(st.platforms).map(k));
    const painted = (gs: G[]) => gs.filter((g) => (g.kind === 'fall' && g.drop && g.walls) || g.kind === 'hurt').map(k);
    const pnt = diff(painted(oldR.findW1Pits(st.platforms)), painted(newR.findW1Pits(st.platforms)));
    const fl = (f: (s: typeof st) => Array<[number, number]>) => f(st).map(([a, b]) => `${Math.round(a)}..${Math.round(b)}`);
    const ver = diff(fl(oldV.floorlessGaps), fl(newV.floorlessGaps));
    if (raw[0].length || raw[1].length) add('builds with a raw change');
    if (pnt[0].length || pnt[1].length) add('builds with a PAINTED change');
    if (ver[0].length || ver[1].length) add('builds with a floor.unmarked change');
    add('raw gaps old only', raw[0].length); add('raw gaps new only', raw[1].length);
    add('floor.unmarked old only', ver[0].length); add('floor.unmarked new only', ver[1].length);
    if (raw[0].length || raw[1].length || ver[0].length || ver[1].length)
      console.log(`${c.id} ${setting} ${v}: raw -${JSON.stringify(raw[0])} +${JSON.stringify(raw[1])}${pnt[0].length || pnt[1].length ? ` PAINTED -${JSON.stringify(pnt[0])} +${JSON.stringify(pnt[1])}` : ''}${ver[0].length || ver[1].length ? ` FLOOR.UNMARKED -${JSON.stringify(ver[0])} +${JSON.stringify(ver[1])}` : ''}`);
  }
  process.stderr.write(`${c.id} `);
}
console.log(`TOTAL ${JSON.stringify(tally)}`);
