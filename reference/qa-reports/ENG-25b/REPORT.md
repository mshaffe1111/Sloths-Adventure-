# ENG-25b REPORT (Engine, t-eng-25b from origin/t-eng-25 21668b61; packet reference/packets/2026-11-19/ENG-25b.md; started 6:29 PM ET 11-18)
**Code head:** fe3faf7e (fda49390 + one test brought to the TURTLE rule). **Gates run on:** fda49390 (the TURTLE rule b1dc6b76 + the
turnover note). After the run: fe3faf7e changes ONLY src/game/predatorCasts.test.ts (the suite's one red, below), re-run alone 8/8; the full
suite was NOT re-run on fe3faf7e. This report's commit adds only REPORT text. **HF:** none. **Pushback:** 1 (the snap had no stake; ruled by the lead, below).

## Done-items
### 1. BONK-AFTER-THE-SNAP (tools/inspect/firsttimer.ts `SKILLS.bonkAfterSnap`; `snapperPlan`, `bonkAim`, `BONK`)
A cast animal a kick ends 'chasedOff' AND that keeps a stage clock (`Enemy.kitBeat`: only World 2's snapper rows today). Only clock keepers:
World 1's snake is also kicked off and sleeps, so a wider reading would have moved 1-x's bots. Asleep or dazed: he walks in and kicks.
Awake: he waits 50-90 px off it (the flown bonk range), steps back only while it can bite (creak or bite), and right after four (the
bar's 'on' ends, plus his own hesitation) hops from a STAND with its back clear, steered onto its back; the bounce is steered back to his
own side; he kicks it while it is dazed. Nothing names a stage, kind or x (generality PASS).

**The flight** (reference/qa-reports/ENG-25b/bonkFlight.ts; the real engine at 30 fps with the game's InputEngine; ENG-25's gen2 row):
| | Normal | Easy |
|---|---|---|
| bounce, a tap bonk (80 ms, let go) | apex 78 px over the bank, 54 over its back; lands ~150 px past it | same (78 / 54) |
| bounce, the press held through the bonk | apex 131 px over the bank, 107 over its back (from 200+ px: a held press from closer sails over it) | same (131 / 107) |
| tap bonk from a still stand 70 px off, every start round the bar | 90 of 90 stomped clean, 0 bitten | 112 of 135 clean, 0 bitten, 23 missed (the bar's last 0.77 s) |
| head-on walk-in kick from 160 px, every start (kick at ANY moment, as ENG-25 laid it) | 90 of 90 cleared clean | 135 of 135 |
| the same, with TURTLE's kick only when open (the ruling, b1dc6b76) | 0 cleared, 41 bitten, 49 glanced off | 0 cleared, 44 bitten, 91 glanced off |
So the design's "bounce off his back to a high stone": a tap gives 54 px over its back, a held press 107. 2-5.md's beat 4 can use the
held bounce for a stone up to ~100 px over the snapper's back (flown from a run-in of 200+ px); a tap's bounce reaches no higher than a
tap hop (62 px).

**Toy** tools/inspect/snapperBonk.test.ts (in gates.yml), on snapToys.ts `snapperKit` (ENG-25's row: a snap row, the snapper on the far
bank's socket on `snap-step`, the cast joined by World 2's spawn; id 2-89). **12/12 in 21 s** (and 12/12 again on the TURTLE rule):
asleep and awake rows; middle Normal + Easy, child Easy, expert Normal, 4 variants each: chased off by a kick, 0 hits, 0 lives, shrine.
**RED with the skill off:** never chased off (every run: snapperProbe-off.txt). Child Normal (not held, rule 4): in snapperProbe-on.txt.

**Four traced faults fixed on the way** (rule 28, one line each: seed 1, the run, what took him):
- middle Normal v3, t 24.6: the go fired while he was still walking in; a hop at a run sailed over its back onto the next ledge -> go from a stand (`BONK.still`).
- middle Normal v3, t 24.9: it had walked to its bank's end under the next section's 48 px step; the landing went to the step -> go only with its back clear (`BONK.clear`).
- middle Normal v3, t 53.8: after the bonk he dithered at 23 px (stepping back to a "right" kick distance) until the daze ran out -> kick from close in (the kick's box starts 8 px ahead).
- child Normal v2 / v1: the kid's 25-30 px lurches overshot a 16 px waiting band while it patrolled away; then his thumb's lag walked him on into a running hop -> wait anywhere in the flown 50-90 px; hold still through the lag (`pending.still`).

**ENG-25's "3 of 24 held toy runs lost a life to water"**: reproduced 5 lives in 24 (waterProbe.txt; 4 at x 2102-2104, the 40 px of water
before the far bank, 1 at x 1987 between stones 2 and 3), traced frame by frame (waterTrace.ts). **Not a bot fault: a stone-lip fact.**
Standing on a stone for the count, his press comes with no steer (the bot's straight-up flick, `upOnly`, the testers' own gesture applied to
every bot jump), the steer arrives 4 frames late, and from a stand he travels 34-38 px: short of 40 px of water. And the laid stones sit
**34 px below the banks** (stone top 564, bank 530): 2-5.md's flight (snapClock.ts) flew them level with the banks, so the last hop up is unflown.

### 2. The meter's snap channel (tools/difficulty/score.ts `snapChallenges`; piecesUsed)
Before: a snap stone is a solid floor, so rideChallenges never saw it; each hop was priced as a plain single (0.47-0.58 bits), the bite
nowhere, the step and wave rows read the same (Normal 35.8 bits both), and piecesUsed named the stone `pad:beat` (ENG-25's `pad:snap` row
was never read). Now: each RUN of snap stones the route crosses between floors that never bite is ONE timed press at the first hop,
windowBits(bar, rideLay.ts `snapWindow`) (the engine's own window, the verdict's; flown to 0.04 s), a heart; the hops stay jumps; a snap
stone is `pad:snap`. **coveragecheck PASS** (pad:snap -> score.ts#snapChallenges).
Found on the way: the toys' ids (2-9x) make the level check grant the leaf glide (skillGuaranteedAt reads the stage's place: 2-94 is the
104th stage), so the meter's route glided over the whole pond and priced no stone. The meter's toy runs on `METER_ID` 2-19 (2-5 is the 15th).

**What the meter reads on the toys (snapChannel.test.ts, 6/6):**
| Toy | Normal | Easy |
|---|---|---|
| step (3 in step, count 0.75) | leave inside 1.37 s of 3.00 -> **1.67 bits** | 2.50 s of 4.50 -> 1.49 |
| wave of 3 (count 0.75) | 1.60 s of 3.00 -> **1.52** | 1.97 s of 4.50 -> 1.72 |
**2-5.md's targets beside the meter** (targets.mts, the bars from snapClock):
| Row | 2-5.md | Meter Normal | Meter Easy |
|---|---|---|---|
| teach, 1 stone | 1.22 | 1.23 (2.23 s of 3.00) | 1.22 |
| in step, 3 | 1.58 | 1.67 (1.37 s) | 1.49 |
| wave of 5 (Normal's twist) | 2.00 | 2.03 (0.97 s) | 3.09 (Easy lays the wave of 3: 1.72) |
| quickening, 3 in step at 0.6 | 1.77 | 1.87 (0.90 s of 2.40) | 1.58 |
In step and the quickening read ~0.1 over the design's: snapWindow is the straight-through tap window (the flight's low end); the design
took the middle of its flown range (1.40-1.60 s, 0.93-1.13 s). The order is the design's. Easy beat for beat at or under Normal (rule 4),
with Easy's wave of 3 against Normal's wave of 5 (the design's ruling). Planted: a run on a clock the stage does not list is refused
(UnpricedPiece pad:snap); the table without the channel is a coveragecheck (b) fault.

### 3. The lead's measure and ruling: TURTLE's kick only when open (b1dc6b76, its own commit)
(a) **No stage on main or any branch lays the kit TURTLE** (predators/world2.ts): it is reached only by a cast that names 'turtle', and only
gen2/worlds/w2Cast.ts's rows do (ENG-25's toys; `git grep` over every remote branch). The hand-built rivers' turtles run predatorAI.ts
(turtleGuard), untouched. So castBots' stages cannot move by construction (no cast names it); lockall vs main below.
(b) A per-kind snapper is ~15 files (11 files key on `'turtle'` today: fight.ts, spriteSheets, creatureLore, enemyBrain, puzzleCheck,
sheetWarm, roster, rules, engine, predatorAI, journal; plus the EnemyType union, world2.ts, w2Cast.ts, the coverage row); a kit flag ~3.
I first told the lead ~8; corrected at 6:53 PM. Ruled (6:53 PM ET): change TURTLE. Done: `kick: { ends: 'chasedOff', when: 'open' }`
(asleep, recovering right after its snap, dazed by a bonk). **Planted** (src/game/gen2/w2Cast.test.ts, 7/7): a head-on kick on a closed
snapper lands and glances off (and he is bitten, 1 heart); right after its snap the same kick sends it off unhurt; after a bonk too;
with the rule removed the closed kick clears it (RED). The bonk toy 12/12 and ENG-25's 4 w2Cast tests unchanged.

### 4. Gates (the CLAUDE.md list, once, on fda49390)
| Gate | Result on fda49390 | Time |
|---|---|---|
| tsc --noEmit | PASS | 3 s |
| the suite (CLAUDE.md's command, one process) | **3,800 pass, 1 FAIL, 2 todo** (main's own todo: 4-3 boulder, w4). The FAIL: predatorCasts.test.ts:33 "turtle: ... a kick sends the shell away", which kicked a fresh, closed turtle (the old any-moment kick). Fixed in fe3faf7e to the ruled rule (closed glances off; right after its snap, sent off away from the kicker): that file 8/8. **Suite not re-run on fe3faf7e** | 40 min |
| BASE_PATH build + chunkcheck | PASS, PASS | 7 s |
| artcheck | PASS | 0 s |
| drawcheck | PASS | 664 s |
| clipcheck | PASS (83 known) | 457 s |
| knowncheck / generalitycheck / roadmapcheck (unshallowed) | PASS / PASS / PASS | seconds |
| kbdcheck | PASS (its stills, rewritten by the run, were restored, not committed) | 131 s |
| buildcheck (alone, last) | PASS: Normal p95 97 ms, Easy p95 55 ms (limit 150) | 5 s |
| seedlist 1-1 --check | PASS (161 seeds, both settings) | 384 s |
| the CI tool line, exactly as gates.yml has it (+ snapperBonk, snapChannel) | 242 pass, 0 fail, 1 todo (chaseBots' open child todo, main's) | 171 s |
| tierBots | 7/7 (1-1 calibration unchanged: no recommit) | 25 s |
| coveragecheck | PASS (12 built stages, 25 pieces, 6 known gaps) | 104 s |
| registrycheck | PASS (10 stages) | 65 s |
| lockall vs main (16 layouts) | **102/102 stages unchanged** | 863 s |
Probes on the same head: snapper skill ON 39/40 runs cleared clean (the miss: child Normal v2, not held by rule 4, NOT traced: the lead's
wind-down at 7:25 PM); OFF 40/40 never cleared. The flight under the rule: walk-in kick Normal 0/90 clean (41 bitten, 49 glanced), Easy
0/135 (44 bitten, 91 glanced); the still-stand bonk unchanged (90/90; Easy 112/135, 23 missed late in the bar, 0 bitten).

### 5. Note for INT-13 (packet item 4)
Tomorrow ENG-285 changes the judges' air model: re-run tools/inspect/snapperBonk.test.ts and src/game/gen2/w2Cast.test.ts on it after the
merge (the bonk's hop is flown from a stand at 50-90 px; a changed arc moves BONK.from), and tools/difficulty/snapChannel.test.ts (snapWindow's hop).

## What the 2-5 builder needs
1. **The snapper now needs the wait** (the TURTLE rule): a head-on kick glances off and he is bitten. Dot's teach must show it before beat
   4: bonk it right after it snaps (or kick it right after the snap). The sleeper (beat 2) still takes a plain kick.
2. **Lay the snap stones level with the banks** (or name why not): they sit 34 px below today (rideLay.ts layPads, ENG-25), and 2-5.md's
   flight flew them level; the last hop up to the far bank is unflown. On a deep pond the testers' straight-up flick from a stand loses a
   life in the 40 px of water (5 of 24 toy runs); 30 px (SNAP_FAIR.gap's low end) gives more room.
3. A snapper must not end its ground under a step: a floor within ~100 px over its back takes the bonk's landing (the bot waits it out; a
   player may not).
4. The held bounce reaches ~107 px over its back, the tap 54: a "bounce to a high stone" (2-5.md beat 4) is for the held press.
5. Run the meter on the built stage: snap runs are now priced (a heart a run) and `pad:snap` is the piece.

## Polish check
No screen changed: bots, a meter channel and a kit rule. The snapper's look is ENG-25's; nothing drawn was added.

## EXACT NEXT STEP (a fresh member or INT-13)
1. On t-eng-25b (fe3faf7e or later): run the full suite once (CLAUDE.md's command, in the background); expect 3,801 pass, 0 fail, 2 todo.
   fe3faf7e changed only src/game/predatorCasts.test.ts, so nothing else should move.
2. Optional: trace the snapper probe's one miss (child Normal v2: `npx tsx reference/qa-reports/ENG-25b/snapperProbe.ts`, then the trace in
   the probe's way: not held by rule 4, but rule 28 asks for the cause).

## Pushback
1. (6:38 PM, sent) the snap had no stake: a kick at any moment cleared the snapper (90/90). Ruled 6:53 PM: TURTLE's kick only when open (done).

## Suggestions (ready packets)
1. ENGINE (high): lay snap stones level with the banks (rideLay.ts layPads; ENG-25's lay), or fly the 34 px rise with snapClock.ts first.
2. DESIGN: the teach line for the snapper's wait (2-5.md beat 4's Dot line now carries a rule, not a flourish).

## Learned
- A toy's id sets what the level check grants him: 2-9x toys get the leaf glide (skillGuaranteedAt by place). A meter test on a toy must use an id where the stage it stands for sits.
- Fly the counter-move before trusting a timing lesson: the snap was designed as the lesson, but the kit's kick worked at any moment.
- A bot's thumb lag walks him on: a jump meant from a stand must hold still through the lag.
**Proposed rule change (level.md):** rule 24 add: "fly the way a player BEATS the timed thing too (the kick, the bonk), not only the thing; a lesson whose counter works at any moment has no stake."

## Method used / Lessons applied / Method update
Used: ENGINE.md day one (main's lock saved first), level.md 21, 23, 24, 28 (every miss traced, one line each), METER-3's channel pattern.
Lessons: D15 (the flight run before trusting the bot), D23/D30 (times from date), D57 (queue at each push), D59 (no job left running),
D64/D76 (context in every message; get_session reads 0 mid-turn: estimates said so), D80 (one model per rule: the run window is snapWindow,
the verdict's own), D86 (the full CLAUDE.md list), D87 (long commands in the background).
**Method update (stage-fix.md or level.md 24):** add "fly the counter-move", as in Learned.
