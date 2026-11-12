import subprocess, sys, shutil
P='src/game/predators/core.ts'
orig=open(P).read()
M=[
 ("tell gate: act after half a tell", "if (s.t < tellOf(def, easy) || !on('on')) break;", "if (s.t < tellOf(def, easy) * 0.5 || !on('on')) break;"),
 ("hurt box outside act", "if (s.phase !== 'act') return null;", "if (s.phase !== 'act' && s.phase !== 'recover') return null;"),
 ("Easy tell may be shorter", "def.tell * (easy ? Math.max(1, def.easy.tell) : 1)", "def.tell * (easy ? def.easy.tell * 0.5 : 1)"),
 ("Easy may be faster", "(easy ? Math.min(1, def.easy.speed) : 1)", "(easy ? 1.2 : 1)"),
 ("open ways work any time", "if (o.when === 'open' && !open(def, s)) return false;", ""),
 ("stillness ignored", "inSight(def, s, hero), hero.still, hero.covered);", "inSight(def, s, hero), false, hero.covered);"),
 ("a drawn animal still notices him", "const saw = !s.drawn && sees(def, s, hero);", "const saw = sees(def, s, hero);"),
 ("a woken sleeper may tell at once", "    s.cool = DROWSY;\n    if (def.wakeAt", "    if (def.wakeAt"),
 ("a still sloth wakes a sleeper", "def.wakeAt !== undefined && !hero.still &&", "def.wakeAt !== undefined &&"),
 ("a sleeping hunter scares", "if (b.s.asleep || p === 'stunned'", "if (p === 'stunned'"),
 ("running off counts as stillness", "if (hero.still && inSight(def, s, hero) && beat(def, s, 'still', sc.t))", "if (beat(def, s, 'still', sc.t))"),
 ("callsOff ignored", "if (def.callsOff && (sweep ? hidden : !saw)) {", "if (false) {"),
 ("chased off comes back", "if (s.t >= GONE_AFTER) enter(s, 'gone');", "if (s.t >= GONE_AFTER) { s.leaving = false; enter(s, 'rest'); }"),
 ("stunned still blocks", "!!def.blocks && !s.asleep && s.phase !== 'stunned' &&", "!!def.blocks && !s.asleep &&"),
 ("charge turns to follow", "          if (nx === s.x) done = true; // the end of its ground: a charge stops here", "          if (nx === s.x) done = true; s.facing = hero.x >= s.x ? 1 : -1;"),
 ("drop follows him", "        if (a.aim === 'him') {", "        if (true) {"),
 ("sweeper skips its warn", "if (s.eyeX === from && !(s.t >= (def.warn ?? 0) * Math.max(1, easy ? def.easy.tell : 1) && on('on'))) break;", ""),
 ("onBeat tells off the beat", "const on = (phase: 'warn' | 'on'): boolean => !def.onBeat || sc.beat?.phase === phase;", "const on = (phase: 'warn' | 'on'): boolean => true || phase === 'on';"),
 ("only-the-stomp allowed", "if (ways.every((w) => w === 'stomp')) say('it is beaten by only the stomp');", ""),
 ("tell floor dropped", "if (!(def.tell >= TELL_MIN) || !Number.isFinite(def.tell))", "if (!Number.isFinite(def.tell))"),
 ("watched ignored", "(saw && def.watched !== undefined && hero.facing === -dir ? def.watched : 1)", "1"),
 ("shy never backs off", "if (saw) v = -dir * def.shy * k;", "if (saw) v = 0;"),
 ("dive called off by running", "if (def.callsOff && (sweep ? hidden : !saw)) {", "if (def.callsOff && !(sweep ? sees(def, s, hero) : saw)) {"),
 ("a guard can be punched (check)", "if (def.habit === 'guard' && (def.beatenBy.stomp || def.beatenBy.punch))", "if (false)"),
 ("noise lure ignores its ground", "        const g = clamp(s.goalX, s.minX, s.maxX);\n        const walk", "        const g = s.goalX;\n        const walk"),
 ("behind works from the front", "if (o.when === 'behind' && !(fromX !== undefined && (fromX - s.x) * s.facing < 0)) return false;", ""),
 ("no pause in the gait", "      if (paused(def, s)) v = 0;", ""),
 ("the pause is not open", "|| s.phase === 'stunned' || paused(def, s);", "|| s.phase === 'stunned';"),
 ("the caiman leaves its ripple", "        if (def.rides) s.x = s.eyeX;\n        if (sees(def, s, hero)) {", "        if (sees(def, s, hero)) {"),
 ("a rooted kind never finishes looking", "if (Math.abs(g - s.x) > AT && walk > 0) s.x = toward(s.x, g, walk);", "if (Math.abs(g - s.x) > AT) s.x = toward(s.x, g, walk);"),
 ("stillness never beats one at its post", "if (!sweep && posted(def) && hero.still && beat(def, s, 'still', sc.t)) {", "if (false) {"),
 ("a sweeper hears at its body", "!reaches(n, def.habit === 'sweep' ? { x: s.eyeX, y: n.y } : s)", "!reaches(n, s)"),
 ("a charger walks home", "def.speed.hunt === 0 && def.act.speed === 0 && def.shy === undefined);", "def.speed.hunt === 0 && def.shy === undefined);"),
 ("a resting sweeper scares", " || (b.def.habit === 'sweep' && p === 'rest')) continue;", ") continue;"),
 ("his own landing is a lure", "  if (n.from !== 'thrown' && n.from !== 'bell') {", "  if (false) {"),
 ("the bell is no lure", "  if (n.from !== 'thrown' && n.from !== 'bell') {", "  if (n.from !== 'thrown') {"),
 ("his own landing calls a sweeper off its pass", "if (def.habit === 'sweep' || posted(def) || !(def.speed.hunt > 0) || s.phase !== 'rest') return null;", "if (posted(def) && def.habit !== 'sweep' || !(def.speed.rest > 0) || s.phase === 'gone') return null;"),
 ("dozes does not sleep", "    s.asleep = true;\n    enter(s, 'rest');", "    enter(s, 'rest');"),
]
ok=0; bad=[]
try:
  for name,a,b in (M if len(sys.argv)<2 else [m for m in M if sys.argv[1] in m[0]]):
    if a not in orig: bad.append((name,'PATTERN MISSING')); continue
    open(P,'w').write(orig.replace(a,b,1))
    r=subprocess.run("npx tsx --test src/game/predator*.test.ts 2>&1 | grep -E '^# fail'",shell=True,capture_output=True,text=True)
    fails=r.stdout.strip()
    if fails and fails!='# fail 0': ok+=1; print(f"CAUGHT  {name}  ({fails})")
    else: bad.append((name,'SURVIVED')); print(f"SURVIVED  {name}")
finally:
  open(P,'w').write(orig)
print(f"{ok}/{len(M)} planted faults caught", bad)
