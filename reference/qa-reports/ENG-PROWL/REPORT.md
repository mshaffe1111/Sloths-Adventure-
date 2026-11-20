# ENG-PROWL REPORT: World 3's prowlers never look up (sight.up) and leap at a sloth they do see hanging

Engine member, fresh. Packet `reference/packets/2026-11-20/ENG-PROWL.md`; spec 3-2.md NEW 1 ENG-PROWL (t-design-31-32).
Base: origin/t-int-13 @ 8efb1bba5. Branch t-eng-prowl. Code head (every gate below ran on it): ee28d135b. Final hash: see the last line.
Method used: `reference/methods/predator-kit.md` (worked example first and red; data; a core rule only from a failing test; planted faults).

## 1. Done-items, the fields as built
| Item | As built | Evidence |
|---|---|---|
| `sight.up` | `PredatorDef.sight.up?` (types.ts): how far ABOVE its feet it sees; `tall` stays for below; absent = `tall`. Read in ONE place, `upOf(def)` (core.ts), used by `inSight`: above his feet up to `up`, below down to `tall`. checkPredator: `up` 0 or more | predatorWorld3.test.ts "every other kind sees as it did": only the ocelot has an `up` or a `leap`; "its pair, below": 60 px under its feet still seen, 90 not |
| OCELOT data | world3.ts: `sight { ahead 240, behind 150, tall 80, up 40 }` | test 1 (`up` 40, `tall` 80 kept) |
| The leap act | `Act` (aim 'ahead' / 'below' / 'him' / 'up') and `PredatorDef.leap?: Act & { aim: 'up' }`. OCELOT: `{ up, 0.36 s, 400 px/s, reach 44, tall 130 }` (3-2's aim and tall; time, speed and reach are its pounce's until 3-2 tunes them). `startTell` sets `PredatorState.leaping` once a tell (a kind with a leap, `Prey.hanging`); `actOf(def, s)` is the act that runs (reachBox, the aim, the act phase). 'up' runs along its OWN ground (aimY its feet; aimX where he hung, clamped to its patch) and its box rises `tall` from the ground. Its tell is its tell (the gate in fixtures.run holds every step) | TOY 2; "the leap never leaves its ground"; "a sloth on the ground still meets its plain pounce" (box 28, not leaping) |
| One heart | the kit's one rule (`landed`: one act, one heart), unchanged; proven for the leap at the kit and through CastPlay.step + `struck` (the engine's calls) | TOY 2: one heart an act, every heart the leap's box (130); "the wiring" test: hearts = acts |
| Easy never inside the tell's escape | checkPredator refuses a leap that (a) does not `callsOff` (a freeze must stop it) or (b) whose Easy creep does not clear it: ROPE_SPEED x Easy tell >= reach/2 + HERO_HALF_W. Ocelot: 120 x 0.65 = 78 px >= 22 + 14 = 36 px (Normal 60 >= 36). Freeze: Easy calm-in 0.35 s < Easy tell 0.65 s | ESCAPE 1: creeping on away, start offsets 0-150 px every 10, both directions, both settings: 0 hearts. ESCAPE 2 (Easy, through CastPlay, real stillness): freezing 0 / 0.1 / 0.2 / 0.233 s after the tell began: called off, 0 acts. checkPredator test (too wide, no callsOff: refused) |
| Wiring | castPlay.ts `step`: `prey.hanging = !!hero.hanging` (ONE line, after `prey.covered`). The engine already fills `CastHero.hanging` (engine.ts stepCast) | "the wiring" test (CastPlay in World 3, CastHero.hanging) |
| Nothing shipped moves | No stage casts a kit ocelot (built stages with `proto.cast`: 1-3, 1-4, 1-5 snake; 1-7, 1-8 eagle; 1-9 boa+eagle). Every other def has no `up`/`leap`: `inSight` reads `tall` both ways as before, `actOf` returns `def.act` | lockall vs base and vs main, castBots base vs branch: §4 |

## 2. The plants, red and green
| Plant | Green (ee28d135b) | Red (how) |
|---|---|---|
| TOY 1: kit ocelot under a hanging Pokey creeping at 74 px (Easy's root), both settings | never noticed, never told, never hit | `sight.up` off (`lookingUp` in the test: seen, told, leapt at, hit) and planted fault "the ocelot looks up (data)" CAUGHT (4 fail) |
| TOY 2: hanging Pokey 30 px up (inside 40) | seen, tell, leap (box 130), one heart an act, both settings | "no leap for a hanging sloth" CAUGHT (4 fail); "the leap's box is the pounce's" CAUGHT (3 fail) |
| Wiring through castPlay | told, every act a leap, hearts = acts; at 74 px never told | "castPlay never says he hangs" CAUGHT (1 fail) |
| Escapes on Easy | creep: 0 hearts at every offset; freeze: called off | "the leap follows him" CAUGHT (2 fail); "a leaper need not call off (check)" CAUGHT; "the creep escape unchecked (check)" CAUGHT |
| The pair (below) and the patch | 60 px under: seen; leap stays on its patch | "up read below its feet too" CAUGHT; "up ignored" CAUGHT; "the leap runs off its patch" CAUGHT |
Planted faults (`python3 reference/qa-reports/EN-P/planted-faults.py`): 10/10 ENG-PROWL CAUGHT. Two old entries ("hurt box outside act", "the
caiman leaves its ripple") printed PATTERN MISSING at the base too (the code they aimed at was rewritten on 11-15): re-pointed at today's code,
both CAUGHT. All 50/50 (GATE TABLE row).

## 3. The 'lit = seen' seam for ENG-DARK (not built: D40)
`upOf(def)` in src/game/predators/core.ts is the only reader of `sight.up`. ENG-DARK: (1) add its ring report to `Prey` (types.ts, e.g. `lit`),
(2) fill it in castPlay.ts `step` beside `prey.hanging`, (3) make `upOf` take the hero and return Infinity for a lit sloth. The leap's
`tall` (130) stays its reach, so a lit sloth hung higher than 130 px over its feet is seen but out of the leap. Test to add then: TOY 1 inside a
lit ring: seen, tell, leap, one heart (3-2.md NEW 1's toy).

## 4. Gate table (each ran once on ee28d135b, the code head; the docs commit after it re-ran the docs gates)
The container started with no node_modules and a shallow clone: installed with `npm ci --legacy-peer-deps` (CI's flag) and `git fetch
--unshallow` before the gates. Outputs in the member's scratchpad; the summary line of each is quoted.
| Gate | Verdict | Result |
|---|---|---|
| `npx tsc --noEmit -p .` | PASS | exit 0 |
| Unit suite, 6 shards (the CLAUDE.md file list, `--test-shard=k/6`) | SUITE_VERDICT | SUITE_ROWS |
| `BASE_PATH=/Sloths-Adventure-/ npx vite build` | PASS | exit 0 |
| `node tools/perf/chunkcheck.mjs` | PASS | "chunkcheck: PASS" (largest asset 254,365 B, 3,739,939 spare) |
| `node tools/perf/artcheck.mjs` | PASS | PASS |
| `node tools/perf/drawcheck.mjs` | PASS | "PASS (805 s)" |
| `node tools/perf/clipcheck.mjs` | PASS | re-run: "PASS (83 known) (406 s)". First run FAIL with 0 new breaches: one screen (old save, upright, 'how to play') timed out opening (30 s) while all 4 cores ran the suite, the seed lists and drawcheck (781 s); re-run alone it opened. No screen code changed |
| `node tools/perf/knowncheck.mjs` | PASS | PASS |
| `npx tsx tools/engine/generalitycheck.ts` | PASS | "65 engine files, 26 literals, 26 known: PASS" (no stage id, world number or x added) |
| `node tools/roadmapcheck.mjs` | PASS | PASS (first try "shallow clone: FAIL", fixed by unshallowing; no ROADMAP edit here) |
| `node tools/timecheck.mjs` | PASS | "288 commits, 224 stamps: PASS" (also re-run on the final docs head: see the last line) |
| `npx tsx tools/difficulty/coveragecheck.ts` | PASS | "coveragecheck: PASS" (13 built stages, 5 known gaps) |
| `npx tsx tools/engine/registrycheck.ts` | PASS | "PASS (12 stages ... 12 lists checked in CI)" |
| `node tools/perf/kbdcheck.mjs` | PASS | "PASS (163 s)" (its stills were rewritten by the run and restored, not committed) |
| `node tools/perf/buildcheck.mjs` | PASS | "buildcheck (1-1, budget p95 <= 150 ms at CPU x4): PASS" |
| Every proven seed list `seedlist.ts <s> --check` (registrycheck's 12: 1-1..1-9, 2-1, 2-2, 2-4) | PASS | all 12 "PASS ... each clean on both settings": 1-1 161, 1-5 150, the other ten 100 seeds each (1,311) |
| CI's tools test line (gates.yml, 34 files incl. library, seedlist, yield, travelBots, castBots, boaBots, firsttimer) | PASS | 305 tests, 304 pass, 0 fail (1 todo) |
| `npx tsx --test tools/inspect/tierBots.test.ts` | PASS | 7/7 (the bots still match the testers' calibration on 1-1: identical; no recommit needed) |
| `npx tsx tools/engine/tipwalk.ts --layouts 4` | PASS | "tipwalk: PASS" |
| `npx tsx tools/engine/paintcheck.ts --part k/3`, k = 1..3 | PASS | 3 x "paintcheck: PASS" |
| lockall `--layouts 16 --check` vs the BASE (8efb1bba5) | PASS | "lock: 102/102 stages unchanged" |
| lockall `--layouts 16 --check` vs MAIN (6e7b85f8f) | FAIL (base's own) | "85/102 unchanged": 1-6 1-7 1-8 1-9 2-1 2-2 2-4 3-8 4-4 6-1 6-3 6-6 6-7 7-5 7-9 8-3 8-5. Base vs main (the two recorded locks) differs on exactly these 17: t-int-13's own stage work; ENG-PROWL moves none (row above) |
| castBots, every stage that casts kit predators (1-3, 1-4, 1-5, 1-7, 1-8, 1-9), seeds 1-10, both settings, all five bots, base vs branch `--rows` | PASS (identical) | 6 x 90 = 540 run rows byte-identical. (1-4's kid/child/middle/expert pass 1-9 of 10 on BOTH: pre-existing, not this job) |
| funcheck (`tools/validate/funcheck.ts`; the lead's add) | FAIL (base's own) | "FAIL (30 worse or new, 41 to lower or delete; 116 known, 1590 stage-layout flags)" on the branch AND the base; the two outputs identical line for line but the run time |
| Planted faults (`reference/qa-reports/EN-P/planted-faults.py`) | PASS | 10/10 ENG-PROWL CAUGHT; the 2 stale entries re-pointed and CAUGHT; 50/50, none missing |

## 5. Polish check
No screen changed: nothing draws differently (no drawing code touched), no stage moved (lockall, castBots). **The leap is proven by the toys
and kit tests, not shown on screen yet (R-165.322).** No still was shot: no stage or gen2 row can hang Pokey over a kit ocelot before
ENG-ROOT, and the leap pose is not drawn (castPlay.sync draws a kit animal at its ground, `e.y = s.y - m.foot`, so the leap would show as a
floor lunge). The lead's ruling (11-19, A): no dev-scene still and no code lift here (D40: the pose is built once, with its painted art);
R-165.322 carries the painted leap pose, the sprite rising to the box top in the act, and a tell-to-land clip upright and sideways on
ENG-ROOT's toy row, before 3-2's build.

## 6. Pushback
1. **"castBots on the toy" (and D75's gen2-laid toy row) cannot be met on this base.** gen2 hangs ropes only over a gap (3-2.md NEW 2:
   types.ts:485-499, w1.ts:326), so no gen2 row can put a hanging Pokey over an ocelot's floor until ENG-ROOT; a dev fixture is what D75
   forbids. Proven instead at the kit (fixtures.run, the tell gate on every step) and through CastPlay.step + struck (the engine's own
   calls, D19). The castBots proof belongs in ENG-ROOT's toy row (Suggestion 1).
2. **The hanging bot never freezes.** firsttimer.ts's `if (p.hanging)` branch returns before `freezePlan` (it creeps on, or drops). Creeping
   on away is escape 1 (proven), but creeping TOWARD an ocelot in front of him is not an escape (the leap runs to where he hung, through him):
   only the freeze is. Not changed here (no stage to fly it on; a bot change re-proves 1-3..1-9's castBots and the tier calibration): Suggestion 2.

## 7. Suggestions (ready packets)
1. **ENG-ROOT's toy row carries the prowler (S, inside ENG-ROOT).** Objective: the first gen2 row with a rope over walkable floor also lays a
   kit ocelot under it (World 3 cast), with one stretch at Easy's 74 px and one inside 40 px. Files: ENG-ROOT's toy row only. Done: castBots on
   it 1-40 both settings: no hearts at 74 px; at 30 px the bots' hearts all leap-caused and one per act; tierBots identical.
2. **The hanging bot answers a leaper's tell (S, Engine with the Critic).** Objective: in firsttimer.ts's hanging branch, call `freezePlan`
   (the rearing test already reaches 60 px up) when the rearing animal's act is a leap (`actOf`), so a creep toward it freezes. Files:
   tools/inspect/firsttimer.ts. Done: castBots on ENG-ROOT's toy (a leaper in front): 0 leap hearts for the freeze tiers; castBots 1-3..1-9
   and tierBots identical (no W1 kind has a leap).
3. **The ocelot's leap pose (M, Content + Engine, when 3-2 wires the kit ocelot; the lead has it as R-165.322).** Objective: from `s.leaping` and phase 'tell'/'act', the
   drawn ocelot crouches (tell) and springs up to ~130 px (act), painted, read on a phone upright and sideways. Files: castPlay.ts `sync` (pose
   fields), the ocelot's art. Done: a clip of the leap from tell to land, judged frame by frame (D63, D69).

## 8. Unresolved
- The leap's drawn pose (Suggestion 3, now the lead's R-165.322): castPlay.sync draws kit animals from the kit's x/y, and the leap keeps its
  feet on its ground, so a kit ocelot would lunge along the floor. No stage casts a kit ocelot, so no screen shows it today.
- **Shared file with ENG-NOISE (for INT-14):** src/game/castPlay.ts, one line in `step` after `prey.covered` (`prey.hanging = !!hero.hanging`).
  The lead trial-merged t-eng-noise 2401050a with ee28d135b: no conflict, tsc clean, 283/283 in the 29 cast/predator test files. core.ts
  imports heroNoise.ts (unchanged import line); no other overlap.
- `wakeAt` still compares `tall` both ways (a sleeper wakes when he moves near, at its height). The ocelot has no wakeAt; named for the
  next sleeper under a rope.
- The 4 numbers of the leap besides aim and tall are its pounce's, untuned (3-2's builder tunes them; checkPredator holds the creep escape).

## 9. Method update (proposed for predator-kit.md)
- Checks: "planted faults N/N CAUGHT, and no PATTERN MISSING" (two entries had silently stopped running since 11-15; the script printed them
  as missing, but the bar line said only 'N of N').
- planted-faults.py takes a 4th field (a file other than core.ts), so data and wiring faults (world3.ts, castPlay.ts) plant the same way.
- A kit rule that reads stillness is proven through CastPlay.step with his real speed (STILLNESS.calmIn), not fixtures' given `still`.

## 10. Lessons applied
D30 (every time from `date` in the same command), D40 ('lit = seen' left as a named seam), D21 (the pair: up AND down planted), D19 (the wiring
test calls CastPlay.step, the engine's call), D43 (no stage id, world number or x in core.ts; generalitycheck), D57/D87 (ReadNotifications at
the push and before this report), D59 (no gate running at report), D75 (pushback 1: no dev fixture), D86 (the CLAUDE.md list and CI's, every
item), D90 (spec section only; gate output to files), D91 (see Learned).

## 11. Learned (for the next engine member)
- This container had NO node_modules: the first `npm ci` failed on a peer-dependency conflict, and my wrapper `(...) > log; tail` reported
  exit 0 (D91's pipe trap in a member's setup step). Install the way CI does (`npm ci --legacy-peer-deps`), and print the command's own exit
  code before trusting any gate. tsc said "Cannot find type definition file for vite/client": that line means no node_modules, not a type error.
- The planted-fault script rewrites the source in place: nothing else may run on the tree while it runs (I held the gates until it ended).
- Turnover note: reference/handoffs/engine-core.md §0zq-PROWL (commit: see the last line).

FINAL_HASH_PENDING
