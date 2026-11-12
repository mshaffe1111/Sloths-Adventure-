# EN-P: every predator gets a personality, and two or three ways to beat it

Branch `t-engine-predators`, base `origin/t-engine-clock` @fd94c3f6. No PR. Polish check: no screen, word, sound or stage changed. Written 9:55 PM ET, Nov 11. Nothing
the game ships changed, so there is nothing to shoot; the tell poses World 1's cast needs are in PREDATORS.md §6.

## Part 1: the design, `reference/design/PREDATORS.md` (335 lines: over the brief's 300 because the lead added §8, §9 and a column; story keeper: PASS with 4 changes, all applied)
- **§1 the roster today**, file:line: every creature that hurts, blocks or chases. Code facts: no combat triangle yet (a kick differs
  from a punch only on the turtle); three tells are under 0.5 s (snake 0.38, ocelot 0.38, tayra 0.42); the frog has no tell.
- **§2 one personality each**: the real animal, our twist, its tell and rhythm; **a cast per world** (Matt approved, 9:42 PM ET:
  today Worlds 6, 7 and 8 share one list of six animals). No two animals in a cast share a habit (a test holds it).
- **§3 ways to beat each**, never only the stomp; ends are stunned, gives up, dozes off or chased off, never eaten or killed.
- **The move ladder** (the lead, 9:56 PM ET): a way is only there once its world has
  taught the move (the bell World 2, thrown noise World 3), so in World 1 the eagle is stillness and cover only. **§4 Easy** (tell x1.3, beat x1.5, speed x0.85, fewer). **§5 the kit**: 8 habits on one machine. **§7 creatures we own and do not
  use**: five can join now (dangler, orchid mantis, crab, piranha, beetle). **§8 size against Pokey**: 7 creatures flagged (the big
  hunters are drawn at half Pokey's height; the boa is smaller than the tree snake); the 10 guardians are 1.5-3.2x Pokey today.
  **§9 throw to lure**: the arc, the pickups and the landing noise already exist in the puzzle kit (file:line); what it still needs.

## Part 2: the kit, `src/game/predators/` (pure, 1,013 lines; tests 1,186 lines; not imported by the game)
`types.ts` (an animal as data: `PredatorDef`; a stage's `Post`; the state, which is a heroNoise `Listener`; 13 ways, 4 ends), `core.ts`
(the one machine: rest, hunt, TELL, act, recover; `stepPredator`, `beat`, `hear`, `foodChain`, `hurt`, `blocks`, `checkPredator`),
`world1.ts` (snake, boa, eagle), `casts.ts` (ten later animals, first-draft numbers from today's code: turtle, River King's guard,
caiman, ocelot, jaguar, tayra, night harpy, frog, spider, sentry), `roster.ts` (habits and casts), `fixtures.ts` (test helpers).

The rules, each with its proof (`npx tsx --test src/game/predator*.test.ts`: 68 kit tests, all green):
1. **The tell always comes first.** One door into the phase that hurts, only from a full tell (never under 0.5 s; longer on Easy).
   Proof: asserted on every step of every test, plus a fuzz over all 8 habits that must reach the act more than 60 times.
2. **Being beaten is data and never cruel.** Each way names its end; "open" ways need the moment after a miss; the turtle's punch
   must come from behind. A way not on the list changes nothing.
3. **Stillness** is stillness.ts `watcherSees`. A hunter that loses a still sloth gives up; running off is not a win. The boa
   rears, he goes still, it settles back (a 0.2 s reaction fits inside its 0.8 s rear on both settings).
4. **Noise** is heroNoise: it wakes a sleeper, the drum stuns, a kind that `hears` goes to look and notices nobody.
5. **The food chain**: lead the eagle's shadow over the boa, or a tayra's line to the caiman's water, and it is chased off.
6. **Easy is never harder**; `checkPredator` refuses one way, only the stomp, a short tell, a punchable guard, a harder Easy.
   A clocked kind (the frog) tells on the stage clock's warn and acts on its on.
7. **The move ladder** (`roster.ts` `TAUGHT`, `inWorld`): every cast is laid through it; a test fails when a way appears before its
   move, or an animal is left with one way (World 1's eagle is the one named exception). **Throw to lure**: only a noise made where he is not
   (`thrownNoise` from World 3, `bellNoise` from World 2: the lead's ruling, 10:06 PM ET) lures; his own landing brings a hunter looking with its eyes open and blinds nothing.
8. **The top three, worked through** (`predatorWorld1.test.ts`, 15 tests): snake, eagle, boa: the tell, the attack, each way to beat it.

**The tests bite**: 38 faults planted in `core.ts` one at a time, **38 caught** (`reference/qa-reports/EN-P/planted-faults.txt`); three
survived their first run and each showed a missing test, now written. Three more planted in `roster.ts` `inWorld`: caught.

## Checks (run on this branch; times ET)
- `npx tsc --noEmit -p .`: clean.
- Stage lock, recorded at the base in its own worktree, checked here: **102/102 stages unchanged** (`lockall --layouts 2`, both settings).
- Main JS: **3,995,374 B at the base and 3,995,374 B here (+0)**; no kit code is in the bundle. Not from this branch: chunkcheck
  FAILS at the base and here by the same 1,070 B (limit 3,994,304), as EN-C's report already said.
- artcheck PASS, knowncheck PASS.
- `npx tsx tools/engine/seedlist.ts 1-1 --check`: PASS (200 seeds, each clean on both settings).
- FULLTESTS_LINE
- BUILDCHECK_LINE
- roadmapcheck: cannot be judged in this clone (6 proofs name commits on branches it does not have); ROADMAP.md and tools/ untouched.
- **Not run: drawcheck, clipcheck, kbdcheck, tierBots.** Nothing drawn, no screen and no stage changed (the lock and the byte count
  show it). They run when an animal is wired in.

## What is left
- **Not built**: a clocked "looking" window (thorn vine, eaglets); two-part acts (the night harpy's slide then shock); the kicked
  shell bowling others over; the eagle's harmless first pass. Capuchins, moths and the seamstress stay on their own modules.
- **Not wired.** The engine still runs predatorAI.ts and watcher.ts. Numbers in `casts.ts` are first drafts.
- **Throw to lure outside the puzzle rooms** (PREDATORS.md §9): pickup spots in a stage brief, and the no-spare-gesture cost.
- **For Matt** (the 9:53 PM note): the size proposals; guardians need new art to be "huge" (8 of 10 are already drawn larger than
  their sheets); no guardian fight is in drawcheck's scenarios. The butler's cake (w5Play.ts:401) is against canon: flagged, not changed.

## The exact next step
Wire World 1's snake behind 1-3's laying (not the shipped 1-3): the stage hands `newPredator(SNAKE, post)` its branch ends, the
engine calls `stepPredator` on the fixed step with Pokey from stillness.ts, reads `hurt`, and calls `beat` from the punch, the stomp
and the drop trap (B2). Then the eagle replaces watcher.ts in 1-7's laying and the boa in 1-9. Method: `reference/methods/predator-kit.md`.

## Method update
New: `reference/methods/predator-kit.md` (no method existed). Worked: the worked example before the data; one `run` helper that
asserts the gate everywhere; a planted fault for every rule (green tests alone missed two). Failed: a dive aimed where he was (he
outran it); tests in a subfolder (the test command does not reach them); "at its post" judged by speed alone (a charger walked home).
