// RUNS (engine-runs helper, 2026-11-05): CP1's dump (reference/engine/cp1/cp1-dump.ts.txt on engine-spec) extended, so every layout
// measure reads the stage exactly as engine.ts builds it (Normal: withGoals(generateStage(cfg,'normal')); Easy:
// easyStage(withGoals(generateStage(cfg,'easy')))) from ANY tree (main for the old 1-1, engine-mixer for the mixer's 1-1 and 1-5 and the
// shipped builders). Adds what CP1's dump left out: the mixer's node plan (meta.mix.explain), trunks, level size, every platform flag.
//   npx tsx tools/engine/runs/dump.ts <tree root> <tag> <ids comma> <layouts> > out.json
const [root, tag, idsArg, nArg] = process.argv.slice(2);
await import(root + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(root + '/src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import(root + '/src/game/stageGenerator.ts');
const { easyStage } = await import(root + '/src/game/easyMode.ts');
const { withGoals } = await import(root + '/src/game/goals.ts');
const levels = generateAllLevels();
// (STAGE_ROLL: the test link's picked roll, testlink1_1.ts applyRollEnv; each row says the gen2 seed it built, null for a non-gen2 build)
const picked = await (await import(root + '/src/game/testlink1_1.ts')).applyRollEnv(process.env);
const out: unknown[] = [];
for (const id of idsArg.split(',')) {
  const c = levels.find((l: any) => l.id === id)!;
  for (let v = 1; v <= +nArg; v++) for (const setting of ['normal', 'easy'] as const) {
    setLayoutVariant(v);
    const cfg = { ...c, unlocked: true };
    let st: any;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage(cfg, 'easy'))) : withGoals(generateStage(cfg, 'normal')); }
    catch (e) { out.push({ tag, id, layout: v, setting, error: String((e as Error).message).slice(0, 200) }); setLayoutVariant(null); continue; }
    setLayoutVariant(null);
    const s = st;
    out.push({
      tag, id, layout: v, setting, roll: picked?.roll ?? null, gen2Seed: (s.gen2 ?? s.proto?.gen2)?.seed ?? null, waterY: s.waterY ?? null, exitX: s.exitTotemX ?? null, exitY: s.exitTotemY ?? null,
      W: s.config.levelWidth, H: s.config.levelHeight, deepFall: s.deepFall ?? null,
      proto: !!s.proto, rhythm: !!s.proto?.rhythm,
      mix: s.meta?.mix?.explain ?? null,
      trunks: (s.proto?.trunks ?? []).map((t: any) => ({ ...t })),
      trees: (s.trees ?? []).map((t: any) => ({ x: Math.round(t.x), groundY: Math.round(t.groundY), topY: Math.round(t.topY), w: t.trunkWidth })),
      water: s.proto?.water ?? null, rivers: (s.rivers ?? []).length,
      platforms: s.platforms.map((p: any) => ({ id: p.id, x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.width), h: Math.round(p.height), type: p.type, style: p.style ?? null, deco: !!(p.decorative || p.isDecor || p.ghost), lily: !!(p.lily || p.lilyPad), soil: !!p.soil, creak: p.creak ?? null, pit: p.pit ?? null, catchL: !!p.catch, bare: !!p.bare, drift: !!p.drift, crumble: p.crumbleAfter ?? null, push: !!p.push, keys: Object.keys(p).filter((k) => !['id', 'x', 'y', 'width', 'height', 'type', 'style'].includes(k)).join('|') })),
      vines: (s.vines ?? []).map((q: any) => ({ x: Math.round(q.x), top: Math.round(q.topY), bot: Math.round(q.bottomY), type: q.vineType })),
      ropes: (s.ropes ?? []).map((r: any) => ({ x0: Math.round(r.x0), x1: Math.round(r.x1), y: Math.round(r.y) })),
      enemies: (s.enemies ?? []).map((e: any) => ({ t: e.type, x: Math.round(e.x), y: Math.round(e.y) })),
      collect: (s.collectibles ?? []).map((c: any) => ({ t: c.type, x: Math.round(c.x), y: Math.round(c.y) })),
      checkpoints: (s.checkpoints ?? []).map((c: any) => ({ x: Math.round(c.x), y: Math.round(c.y) })),
      spawnX: s.spawnX ?? null, spawnY: s.spawnY ?? null,
    });
  }
}
process.stdout.write(JSON.stringify(out));
