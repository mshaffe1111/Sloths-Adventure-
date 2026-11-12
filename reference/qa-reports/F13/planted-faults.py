# F13: planted faults for 1-3's finish (the two snakes on a log, the designed group, the quiet line, the exit's vine). Every fault must be CAUGHT by
# tools/engine/library13.test.ts or src/game/gen2/variety.test.ts; a survivor means a test is missing. W1C's list is
# reference/qa-reports/W1C/planted-faults.py (run both). Run it in a worktree of its own: it edits files and puts them back.
#   python3 reference/qa-reports/F13/planted-faults.py [name-part]
import subprocess, sys
M=[
 ("gen2/variety.ts","a designed group keeps the lay's gaps (the pair split)","      if (group !== undefined && p.group === group) continue;\n",""),
 ("gen2/worlds/w1Cast.ts","a second sleeper leaves its shared load 10 px off the middle (it lands on the far coil)","      if (e.asleep) for (const t of out.proto.cast?.traps ?? [])","      if (false && e.asleep) for (const t of out.proto.cast?.traps ?? [])"),
 ("gen2/worlds/w1Arc13.ts","the two snakes on a log are left out of the arc","'A T P M R X R W R S R H C E'","'A T P M R X R W R S R C E'"),
 ("gen2/worlds/w1Arc13.ts","the pair's second snake is no sleeper","    { id: 'e2', role: 'enemy', on: 'L', t: FAR_T, dn: 0, allow: ['snake-trapped-asleep']","    { id: 'e2', role: 'enemy', on: 'L', t: FAR_T, dn: 0, allow: ['snake-trapped']"),
 ("gen2/worlds/w1Arc13.ts","the stair comes down on wide steps to a flat ledge (8-11 s with nothing to do)","pieces.push(led(`d${j}`, prev, NARROW, DOWN));","pieces.push(led(`d${j}`, prev, LEDGE, DOWN));"),
 ("gen2/worlds/w1Arc13.ts","the stair's breath is flat ledges","breath(stair(3, STONE), 7, true, 'down')","breath(stair(3, STONE), 7)"),
 ("gen2/worlds/w1Arc13.ts","a rest starts on a long flat bank again (960-1100 px with nothing to do)","link({ id: 'w1-13-root-hump', name: 'a rest: over the hump of a root', job: 'rest', versions: [[420, 460], [480, 520]].map((a, j) => ({","link({ id: 'w1-13-root-hump', name: 'a rest: over the hump of a root', job: 'rest', versions: [[960, 1040], [1040, 1100]].map((a, j) => ({"),
 ("gen2/worlds/w1Arc13.ts","a bare-log beat ends on its flat room bank","led('zz', z, ROOM), led('zu', 'zz', [200, 220], UP), led('zd', 'zu', [200, 220], DOWN)]","led('zz', z, ROOM)]"),
 ("gen2/worlds/w1Arc13.ts","the way out's rope is drawn as World 2's rope between posts again","free: true, look: 'vine' as const }","free: true }"),
 ("gen2/pipeline.ts","the builder drops a rope's look","...(lp.ropeLook ? { look: lp.ropeLook } : {})",""),
 ("gen2/worlds/w1Arc13.ts","the way out's near bank is too short for its tree (the foot hangs over the hollow)","pieces: [{ key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' }","pieces: [{ key: 'in', shape: 'bank', w: [200, 220], place: { kind: 'start' }"),
 ("castArt.ts","the trees grow half again with the vine's height (the foot sinks under the bank)","Math.max(0.05, (ground - y) / (W1_TRAP_MEASURES.trunk.foot[1] - TRUNK_TIE.y))","Math.max(0.05, 1.5 * (ground - y) / (W1_TRAP_MEASURES.trunk.foot[1] - TRUNK_TIE.y))"),
]
ok=0; bad=[]
for f,name,a,b in (M if len(sys.argv)<2 else [m for m in M if sys.argv[1] in m[1]]):
  P='src/game/'+f; orig=open(P).read()
  if a not in orig: bad.append((name,'PATTERN MISSING')); print("MISSING ",name); continue
  try:
    open(P,'w').write(orig.replace(a,b,1))
    tests = "src/game/gen2/variety.test.ts tools/engine/library13.test.ts" if f=="gen2/variety.ts" else "src/game/castArt.test.ts tools/engine/library13.test.ts" if f=="castArt.ts" else "tools/engine/library13.test.ts"
    r=subprocess.run(f"npx tsx --test {tests} 2>&1 | grep -E '^# fail'",shell=True,capture_output=True,text=True)
    fails=r.stdout.strip()
    if fails and fails!='# fail 0': ok+=1; print(f"CAUGHT  {name}  ({fails})")
    else: bad.append((name,'SURVIVED')); print(f"SURVIVED  {name}")
  finally:
    open(P,'w').write(orig)
print(f"{ok}/{len(M)} planted faults caught", bad)
