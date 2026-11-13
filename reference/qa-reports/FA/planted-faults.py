# FA: planted faults for the ascent lay (R-165.170). Every fault must be CAUGHT (turn a test red) by src/game/gen2/tower.test.ts or
# src/game/gen2/towerBots.test.ts; a survivor means a test is missing.
#   python3 reference/qa-reports/FA/planted-faults.py [name-part]
import subprocess, sys
T="src/game/gen2/tower.test.ts"; B="src/game/gen2/towerBots.test.ts"; C="src/game/cameraFollow.test.ts"
M=[
 ("gen2/pipeline.ts",T,"an ascent has no graph again (missionGraph throws)","  const nodes: MissionNode[] = SPINE.map((n, i) => ({ ...n, id: `n${i + 1}` }));","  if (a === 'ascent') throw new Error('gen2: ascent stages run up');\n  const nodes: MissionNode[] = SPINE.map((n, i) => ({ ...n, id: `n${i + 1}` }));"),
 ("gen2/pipeline.ts",T,"a rolled graph is always laid right","  return { archetype: a, flow: budget.flow ?? 'right', nodes };","  return { archetype: a, flow: 'right', nodes };"),
 ("gen2/pipeline.ts",T,"the engine is not told a tower's travel","...(laid.tower ? { travel: laid.tower.flow } : {}) };"," };"),
 ("gen2/pipeline.ts",T,"a run's budget names a flow","...(config.travel === 'up' || config.travel === 'down' ? { flow: config.travel } : archetype === 'ascent' ? { flow: 'up' as const } : {}),","flow: (config.travel === 'down' ? 'down' : config.travel === 'up' || archetype === 'ascent' ? 'up' : undefined) as never,"),
 ("gen2/pipeline.ts",T,"a storey that runs left is not reflected","        if (leftward) L = reflectLocal(L);","        if (leftward) L = L;"),
 ("gen2/pipeline.ts",T,"a turn is recorded where its vine stood before it was moved","  for (const t of turns) t.x = t.vine.x;\n",""),
 ("gen2/pipeline.ts",T,"the tower's falls and skips are not judged","    if (falls.length) st.gen2.towerMiss = falls;","    if (falls.length < 0) st.gen2.towerMiss = falls;"),
 ("gen2/pipeline.ts",T,"a tower miss does not fail the roll","  if (st.gen2.towerMiss?.length) st.gen2.errors.push(...st.gen2.towerMiss);\n",""),
 ("gen2/pipeline.ts",T,"an ascent's floor stops at its runway","      if (b < TW) mk(b, M.ground.y, TW - b, 'bank', 0);\n",""),
 ("gen2/pipeline.ts",T,"catches are laid with no storey to their name","(q) => storeyOf.get(q.id) ?? 0)) {","() => 0)) {"),
 ("gen2/tower.ts",T,"reflectLocal keeps the exit on the right","    exit: { ...L.exit, x: -L.exit.x },","    exit: { ...L.exit },"),
 ("gen2/tower.ts",T,"a storey keeps no clearance","    return top - TOWER.clear - low;","    return top - 120 - low;"),
 ("gen2/tower.ts",T,"a turn is a jump high","  turn: Math.ceil(DOUBLE_RISE) + 40,","  turn: Math.ceil(DOUBLE_RISE) - 20,"),
 ("gen2/tower.ts",T,"a crumbling tile catches a fall","    if (p.type === 'fragile' || x < p.x","    if (x < p.x"),
 ("gen2/tower.ts",T,"a rotting bough may hang over any drop","    if (p.type !== 'fragile' || p.y >= floorY - 1) continue;","    if (p.type !== 'solid' || p.y >= floorY - 1) continue;"),
 ("gen2/tower.ts",T,"a fall may be any height","  const most = flow === 'up' ? TOWER.fall : TOWER.see;\n  return openEnds(platforms, floorY, most, width).map","  const most = flow === 'up' ? 99999 : TOWER.see;\n  return openEnds(platforms, floorY, most, width).map"),
 ("gen2/tower.ts",T,"the jump model is the closed form (under the flown climb)","export const LEAP = { up: Math.ceil(DOUBLE_RISE) + 36, slack: 100 } as const;","export const LEAP = { up: Math.ceil(DOUBLE_RISE), slack: 0 } as const;"),
 ("gen2/tower.ts",T,"a skipped storey is never named","    if (hit) out.push(`tower: the storey","    if (hit && !hit) out.push(`tower: the storey"),
 ("gen2/tower.ts",T,"a catch may climb a storey","    return wood.some((q) => lv.get(q)! > mine && leaps(box, q)) ? -1 : mine;","    return mine;"),
 ("gen2/tower.ts",T,"a hop's catch is not in its section's extent","if (cy !== undefined) { hang = Math.max(hang, cy); low = Math.max(low, cy + 24); }","if (cy !== undefined) { hang = Math.max(hang, cy); }"),
 ("gen2/pipeline.ts",T,"a hop's catch may hang inside a jump of the ledge its vine stands on","Math.min(cur.y - TOWER.turn - (ext.hang ?? 0), lim)","Math.min(cur.y - TOWER.turn, lim)"),
 ("gen2/tower.ts",T,"a tower's route is its x","  if (!vertical(route.flow)) return x - route.spawn.x;","  if (route.legs.length) return x - route.spawn.x;"),
 ("gen2/tower.ts",T,"a route counts the climb as a walk","    walk += Math.abs(q.entry.x - at.x) + Math.abs(q.exit.x - q.entry.x);","    walk += join + len;"),
 ("levelCheck.ts",T,"a tower's flags are read left to right (the old order check)","    if (routed ? lastCp && !flagFurther(stage, { further: () => false }, cp, lastCp) : cfg.objectiveType !== 'ascent' && cp.x <= lastX) errors.push('checkpoints are out of order');","    if (cfg.objectiveType !== 'ascent' && cp.x <= lastX) errors.push('checkpoints are out of order');"),
 ("stageTime.ts",T,"the clock reads a tower's width, not its route","  const route = towerWalk ?? stage.exitTotemX - stage.spawnX;","  const route = stage.exitTotemX - stage.spawnX;"),
 ("gen2/seedList.ts",T,"a packed plan loses its turns","const JOIN = { walk: 'w', step: 's', pit: 'p', jump: 'j', turn: 't' } as const;","const JOIN = { walk: 'w', step: 's', pit: 'p', jump: 'j', turn: 'w' } as const;"),
 ("gen2/pipeline.ts",B,"a turn's vine stops short of the storey it leads to","topY: Math.min(oy, R(cur.y)), bottomY: Math.max(oy, R(cur.y)), swaySpeed: 1.1","topY: Math.min(oy, R(cur.y)) + 150, bottomY: Math.max(oy, R(cur.y)), swaySpeed: 1.1"),
 ("engine.ts",B,"the engine takes a tower's flags by height again","          if (flagFurther(this.currentStage, this.mode, cp, this.checkpoint)) {","          if (this.mode.further(cp, this.checkpoint)) {"),
 ("stageGenerator.ts",B,"a tower's hearts go by every second flag from the left","flagsInOrder(stage, stage.checkpoints ?? []).forEach(","[...(stage.checkpoints ?? [])].sort((a, b) => a.x - b.x).forEach("),
 ("gen2/tower.ts",T,"the spawn is measured on the storey over it","    const d = dy * 8 + dx;","    const d = dx > 60 ? Infinity : dy;"),
 ("gen2/tower.ts",T,"no flag is laid before a hard node","  for (const h of hard) {\n    if (h < rule.first + rule.clear) continue;","  for (const h of hard) {\n    if (h < 1e9) continue;"),
 ("gen2/tower.ts",T,"a tower's flags may stand any distance apart","    if (k < 0) break;\n    const from = ss[k - 1], to = ss[k], last = k === ss.length - 1;","    if (k < 0 || k > 0) break;\n    const from = ss[k - 1], to = ss[k], last = k === ss.length - 1;"),
 ("gen2/tower.ts",T,"the flag verdict never names a hard node","  for (const h of hard) if (h.s >= rule.first + rule.clear && !fs.some(","  for (const h of hard) if (h.s < 0 && !fs.some("),
 ("gen2/pipeline.ts",T,"a tower's flags are laid by x again (the run's pass)","  if (route) {\n    const spots: Array<{ x0: number; x1: number; y: number }> = [];","  if (route && route.legs.length < 0) {\n    const spots: Array<{ x0: number; x1: number; y: number }> = [];"),
 ("gen2/pipeline.ts",T,"an animal may stand in the opening seconds of a tower","  const opening = (x: number, y: number) => (along ? along(x, y) < OPEN_SECONDS * budget.walkSpeed : x < openX);","  const opening = (x: number, _y: number) => x < openX;"),
 ("cameraFollow.ts",C,"a climb keeps the run's framing","  return leadDy < 0 ? Math.max(base, CLIMB_VIEW.up) : leadDy > 0 ? Math.min(base, CLIMB_VIEW.down) : base;","  return leadDy < 9 ? base : base;"),
 ("cameraFollow.ts",C,"a climb's feet sit at the old 55%","  up: 0.8,","  up: 0.55,"),
 ("engine.ts",B,"the engine's view ignores the climb framing","    this.camera.targetY = this.camAnchorY - vh * travelFeet(fr.feetAt, this.mode.lead().dy);","    this.camera.targetY = this.camAnchorY - vh * fr.feetAt;"),
 ("engine.ts",B,"a set-back cuts to the old framing, then drifts","    this.camera.y = Math.max(0, p.y - this.camera.viewportHeight * travelFeet(fr.feetAt, this.mode.lead().dy));","    this.camera.y = Math.max(0, p.y - this.camera.viewportHeight * fr.feetAt);",2),
 ("realPlay.ts",B,"a fixture may stand in for a stage of the game","  if (levels.some((l) => l.id === cfg.id)) throw new Error(`withFixtureConfig: ${cfg.id} is a stage of the game`);\n",""),
]
import os
ok=0; bad=[]
todo=[m for m in M if len(sys.argv)<2 or sys.argv[1] in m[2]]
# (python3 planted-faults.py: every fault; with a word of a fault's name: that one)
for f,test,name,a,b,*n in todo:
    p="src/game/"+f
    if not os.path.exists(test): print("SKIP (no test file yet)",name); continue
    s=open(p).read()
    # (a 6th field: how many times the text stands in the file, each one replaced)
    if s.count(a)!=(n[0] if n else 1): print("STALE",name,"(the text is in the file",s.count(a),"times)"); bad.append(name); continue
    open(p,"w").write(s.replace(a,b))
    try:
        r=subprocess.run(["npx","tsx","--test",test],capture_output=True,text=True)
    finally:
        open(p,"w").write(s)
    if r.returncode!=0: ok+=1; print("CAUGHT",name)
    else: bad.append(name); print("SURVIVED",name)
print(f"{ok}/{len(todo)} caught"+("" if not bad else "; NOT caught: "+"; ".join(bad)))
sys.exit(1 if bad else 0)
