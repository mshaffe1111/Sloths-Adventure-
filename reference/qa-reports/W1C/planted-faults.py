# W1C: planted faults for the cast's wiring (castPlay.ts, dropTrap.ts, engine.ts). Every fault must be CAUGHT by
# src/game/castPlay.test.ts or src/game/castEngine.test.ts; a survivor means a test is missing.
#   python3 reference/qa-reports/W1C/planted-faults.py [name-part]
import subprocess, sys
M=[
 ("engine.ts","the engine never starts the cast","    this.startCast();\n",""),
 ("engine.ts","the old AI also steps a cast animal","      if (e.kit) continue;\n",""),
 ("engine.ts","a punch on a cast animal goes to the old fight","    if (e.kit) {\n      this.castBlow(e, m, box, hr, a);\n      return;\n    }\n",""),
 ("engine.ts","a blow never reaches a trap's handle","    const sprung = this.cast?.strike(box);","    const sprung = null as null | { x: number; y: number; kind: string };"),
 ("engine.ts","a stomp on a cast animal goes to the old fight","      if (e.kit) {\n        // a cast animal: the kit says what a stomp does","      if (false) {\n        // a cast animal: the kit says what a stomp does"),
 ("engine.ts","the strike never hurts","        this.damagePlayer(1, h.e.x);\n        break;\n      }\n    }\n    // an animal that left for good","        break;\n      }\n    }\n    // an animal that left for good"),
 ("engine.ts","a chased-off animal is not counted","    for (const e of r.cleared) {\n      p.enemiesDefeated++;","    for (const e of r.cleared) {"),
 ("engine.ts","a respawn leaves the cast hunting","    this.cast?.calm(this.easy);\n",""),
 ("castPlay.ts","his landing is never heard","      const n = landingNoise(hero.x, hero.y, t, fell);","      const n = null as Sound | null;"),
 ("castPlay.ts","every landing is loud","    const fell = stepFall(this.fall, hero);","    const fell = stepFall(this.fall, hero) === null ? null : 999;"),
 ("castPlay.ts","stillness is never stepped","    stepStill(this.still, hero, dt, set);\n",""),
 ("castPlay.ts","a trap chases off the whole cast","if (scares(tr.post, m.s.x, m.s.y)) beat(","if (true) beat("),
 ("castPlay.ts","a landed trap does nothing","      for (const m of this.members) if (scares(tr.post, m.s.x, m.s.y)) beat(m.def, m.s, 'trap', t, tr.post.loadX);\n",""),
 ("castPlay.ts","cleared twice","        m.cleared = true;\n",""),
 ("castPlay.ts","every animal is the kit's","const def = data.kinds.includes(e.type) ? castDef(e.type, world) : undefined;","const def = castDef(e.type, world) ?? castDef('snake', world);"),
 ("castPlay.ts","the art never sees the rear","e.isAttacking = s.phase === 'tell' || s.phase === 'act';","e.isAttacking = false;"),
 ("castPlay.ts","a gone animal stays in the stage","    if (s.phase === 'gone' && !e.defeated) {","    if (false) {"),
 ("castPlay.ts","the glide never moves it","      e.y += GLIDE.drop * u * u - GLIDE.lift * Math.sin(Math.PI * Math.min(1, u * 2));\n",""),
 ("castPlay.ts","calm leaves it mid-tell","      s.phase = 'rest';\n      s.t = 0;\n      s.drawn = false;",""),
 ("dropTrap.ts","a trap can be sprung twice","  if (s.phase !== 'set') return false;\n",""),
 ("dropTrap.ts","no creak before it lets go","if (s.phase === 'loose' && s.t >= TRAP.warn) {","if (s.phase === 'loose') {"),
 ("dropTrap.ts","the load never lands","    if (s.y >= s.post.landY) {","    if (false) {"),
 ("dropTrap.ts","a trap reaches another branch far below","Math.abs(x - p.loadX) <= TRAP.scare && Math.abs(y - p.landY) <= TRAP.tall;","Math.abs(x - p.loadX) <= TRAP.scare;"),
]
ok=0; bad=[]
for f,name,a,b in (M if len(sys.argv)<2 else [m for m in M if sys.argv[1] in m[1]]):
  P='src/game/'+f; orig=open(P).read()
  if a not in orig: bad.append((name,'PATTERN MISSING')); print("MISSING ",name); continue
  try:
    open(P,'w').write(orig.replace(a,b,1))
    r=subprocess.run("npx tsx --test src/game/castPlay.test.ts src/game/castEngine.test.ts 2>&1 | grep -E '^# fail'",shell=True,capture_output=True,text=True)
    fails=r.stdout.strip()
    if fails and fails!='# fail 0': ok+=1; print(f"CAUGHT  {name}  ({fails})")
    else: bad.append((name,'SURVIVED')); print(f"SURVIVED  {name}")
  finally:
    open(P,'w').write(orig)
print(f"{ok}/{len(M)} planted faults caught", bad)
