# W1C: planted faults for the cast's wiring (castPlay.ts, dropTrap.ts, engine.ts). Every fault must be CAUGHT by
# src/game/castPlay.test.ts, src/game/castEngine.test.ts or tools/engine/library13.test.ts; a survivor means a test is missing.
#   python3 reference/qa-reports/W1C/planted-faults.py [name-part]
import subprocess, sys
M=[
 ("engine.ts","the engine never starts the cast","    this.startCast();\n",""),
 ("engine.ts","the old AI also steps a cast animal","      if (e.kit) continue;\n",""),
 ("engine.ts","a punch on a cast animal goes to the old fight","    if (e.kit) {\n      this.castBlow(e, m, box, hr, a);\n      return;\n    }\n",""),
 ("engine.ts","a blow never reaches a trap's handle","    const sprung = this.cast?.strike(box);","    const sprung = null as null | { x: number; y: number; kind: string };"),
 ("engine.ts","a stomp on a cast animal goes to the old fight","      if (e.kit) {\n        // a cast animal: the kit says what a stomp does","      if (false) {\n        // a cast animal: the kit says what a stomp does"),
 ("engine.ts","the strike never hurts","        this.damagePlayer(1, k.e.x);\n        break;\n      }\n    }\n    // an animal that left for good","        break;\n      }\n    }\n    // an animal that left for good"),
 ("engine.ts","a chased-off animal is not counted","      }\n      p.enemiesDefeated++;\n      if (!e.minion && e.type !== 'boss'","      }\n      if (!e.minion && e.type !== 'boss'"),
 ("engine.ts","a respawn leaves the cast hunting","    this.cast?.calm(this.easy);\n",""),
 ("castPlay.ts","a landing is heard before its world teaches it","    this.loud = TAUGHT.landing <= world;","    this.loud = true;"),
 ("castPlay.ts","his landing is never heard","      const n = landingNoise(hero.x, hero.y, t, fell);","      const n = null as Sound | null;"),
 ("castPlay.ts","every landing is loud","    const fell = stepFall(this.fall, hero);","    const fell = stepFall(this.fall, hero) === null ? null : 999;"),
 ("castPlay.ts","stillness is never stepped","    stepStill(this.still, hero, dt, set);\n",""),
 ("castPlay.ts","a trap chases off the whole cast","if (scares(tr.post, m.s.x, m.s.y)) beat(","if (true) beat("),
 ("castPlay.ts","a landed trap does nothing","      for (const m of this.members) if (scares(tr.post, m.s.x, m.s.y)) beat(m.def, m.s, 'trap', t, hero.x);\n",""),
 ("castPlay.ts","a chased-off animal may flee toward him","beat(m.def, m.s, 'trap', t, hero.x);","beat(m.def, m.s, 'trap', t, tr.post.loadX);"),
 ("castPlay.ts","cleared twice","        m.cleared = true;\n",""),
 ("castPlay.ts","every animal is the kit's","const def = data.kinds.includes(e.type) ? castDef(e.type, world) : undefined;","const def = castDef(e.type, world) ?? castDef('snake', world);"),
 ("castPlay.ts","the art never sees the rear","e.isAttacking = s.phase === 'tell' || s.phase === 'act';","e.isAttacking = false;"),
 ("castPlay.ts","a gone animal stays in the stage","    if (s.phase === 'gone' && !e.defeated) {","    if (false) {"),
 ("castPlay.ts","the glide never moves it","      e.y += GLIDE.drop * u * u - GLIDE.lift * Math.sin(Math.PI * Math.min(1, u * 2));\n",""),
 ("castPlay.ts","calm leaves it mid-tell","      s.phase = 'rest';\n      s.t = 0;\n      s.drawn = false;",""),
 ("predators/world1.ts","a stomped snake comes back (not the glide)","    stomp: { ends: 'chasedOff' },","    stomp: { ends: 'flees', seconds: 5 },"),
 ("engine.ts","the trap's line is said for a punch too","const line = way === 'trap' || way === 'punch' ? this.proto?.cast?.said?.[way] : undefined;","const line = way === 'trap' || way === 'punch' ? this.proto?.cast?.said?.trap : undefined;"),
 ("engine.ts","the first-trap line is said every time","      if (line && !tipHeard(FIRST_OF_STAGE, `cast:${way}`)) {","      if (line) {"),
 ("engine.ts","the first-trap line is never said","        this.guide(line, 4);\n      }\n      p.enemiesDefeated++;","      }\n      p.enemiesDefeated++;"),
 ("gen2/pipeline.ts","the builder drops the cast's lines","{ cast: { ...proto.cast, kinds: [...kinds],","{ cast: { kinds: [...kinds],"),
 ("dropTrap.ts","a pickup in front of the load passes","    if (hid) bad.push(","    if (false) bad.push("),
 ("dropTrap.ts","a load over an empty branch passes","Math.abs(a.y - p.landY) <= TRAP.tall)) bad.push(","Math.abs(a.y - p.landY) <= TRAP.tall) && false) bad.push("),
 ("dropTrap.ts","a load off the phone's screen passes","    if (d < TRAP.reach[0] || d > TRAP.reach[1]) bad.push(","    if (d < TRAP.reach[0]) bad.push("),
 ("gen2/pipeline.ts","the builder never asks the trap rule","  if (traps?.length) st.gen2.errors.push(","  if (false) st.gen2.errors.push("),
 ("dropTrap.ts","a trap can be sprung twice","  if (s.phase !== 'set') return false;\n",""),
 ("dropTrap.ts","no creak before it lets go","if (s.phase === 'loose' && s.t >= TRAP.warn) {","if (s.phase === 'loose') {"),
 ("dropTrap.ts","the load never lands","    if (s.y >= s.post.landY) {","    if (false) {"),
 ("dropTrap.ts","a trap reaches another branch far below","Math.abs(x - p.loadX) <= TRAP.scare && Math.abs(y - p.landY) <= TRAP.tall;","Math.abs(x - p.loadX) <= TRAP.scare;"),
 # 11-12 afternoon: the lesson's teach line, Easy's traps, the rope before the totem, the logs (each held by library13.test.ts)
 ("gen2/pipeline.ts","Easy's count cut takes a trap's own snake (easy 'stay' ignored)","      if (!kept.has(f) || f.stay) continue;","      if (!kept.has(f)) continue;"),
 ("gen2/pipeline.ts","a re-seated animal's fill stays behind (Easy reads the sleeper as dropped)","    if (R(f.e.x) !== f.fill.x) f.fill.x = R(f.e.x);\n",""),
 ("gen2/pipeline.ts","a free rope is hung required","g0: l.y, g1: r.y, required: !lp.ropeFree });","g0: l.y, g1: r.y, required: true });"),
 ("gen2/pipeline.ts","a free rope's hollow is a deep one-way pit","pitSteps(x0, x1, lipY, farY, shallow ? hop : depthNow, hop);","pitSteps(x0, x1, lipY, farY, depthNow, hop);"),
 ("gen2/worlds/w1.ts","the trap line is not a teach line","    teachTips: ['traps'],\n",""),
 ("gen2/worlds/w1Arc13.ts","Dot speaks at the vine, too late to read","{ id: 'tip', role: 'tip', on: 'a', t: 0.4, allow: ['traps'] }","{ id: 'tip', role: 'tip', on: 'd', t: 0.9, allow: ['traps'] }"),
 ("gen2/worlds/w1Arc13.ts","a flag may stand on a snake's log (its socket is emptied)","place: { kind: 'on', on, at, h }, style: 'log', main: false });","place: { kind: 'on', on, at, h }, style: 'log' });"),
 ("gen2/worlds/w1Arc13.ts","a trap's own snake is cut on Easy","easy: o.easy ?? 'stay' });","easy: o.easy ?? 'soften' });"),
 ("gen2/worlds/w1Arc13.ts","the rope before the totem is the only way","gap: [460, 480] as R2, free: true }","gap: [460, 480] as R2 }"),
 ("gen2/worlds/w1Cast.ts","a sleeper lies right under its load (the hive comes down on it)","    if (e.asleep) e.x = Math.round(t0.x < mid ? e.patrolMinX : e.patrolMaxX);","    if (e.asleep) e.x = Math.round(mid);"),
 ("gen2/worlds/w1Arc13.ts","a World 1 rest is dealt into 1-3 again","link({ id: 'w1-13-root-hump'","link({ id: 'w1-meadow'"),
]
ok=0; bad=[]
import os
for f,name,a,b in ([m for m in M if not (os.environ.get('SKIP_GEN2') and m[0].startswith('gen2/'))] if len(sys.argv)<2 else [m for m in M if sys.argv[1] in m[1]]):
  P='src/game/'+f; orig=open(P).read()
  if a not in orig: bad.append((name,'PATTERN MISSING')); print("MISSING ",name); continue
  try:
    open(P,'w').write(orig.replace(a,b,1))
    # (the builder's own rule is held by the lay's test; everything else by the two cast tests, which are quick)
    tests = "tools/engine/library13.test.ts" if f.startswith("gen2/") else "src/game/castPlay.test.ts src/game/castEngine.test.ts"
    r=subprocess.run(f"npx tsx --test {tests} 2>&1 | grep -E '^# fail'",shell=True,capture_output=True,text=True)
    fails=r.stdout.strip()
    if fails and fails!='# fail 0': ok+=1; print(f"CAUGHT  {name}  ({fails})")
    else: bad.append((name,'SURVIVED')); print(f"SURVIVED  {name}")
  finally:
    open(P,'w').write(orig)
print(f"{ok}/{len(M)} planted faults caught", bad)
