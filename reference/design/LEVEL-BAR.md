# The level bar: what makes a World 1 level good enough to ship (FIRST DRAFT, W1C, 2026-11-12, for the lead and Matt to correct)
A level is scored against this before it goes to Matt. `reference/STAGE-RULES.md` holds the rules and numbers a stage must MEET
(fairness, reach, pacing); this is the other half: whether it is a LEVEL, something a person designed, or pieces in a row. Each line
is scored 0 (missing), 1 (there, rough), 2 (at the bar), with the proof named. **Ship: no 0 anywhere, and 2 on every line marked (must).**

## A. It has one idea, and the idea grows
1. **(must) One sentence says what this level is about**, and a player could say it after playing ("the one where you drop the hive
   on the snakes"). Proof: the sentence at the top of the level's design doc (`reference/design/<stage>.md`).
2. **(must) The idea is taught safely, then used, then turned, then asked for in full.** A teach nobody can fail, a build-up, one
   twist that makes him LOOK before he acts, a set piece, a finale that combines what came before. Proof: the design doc's beat
   table, and the built stage's sections in that order on every roll.
3. **Nothing in the level is there only because the library had it.** Every beat serves the idea or is a breath between beats. A
   section that teaches another level's lesson (a bounce test in a snake level) is out. Proof: each laid section named against a beat.
4. **The level could not be mistaken for the one before it.** Its own look (which pieces, what light), its own verb. Proof: stills
   of this level beside the last one's.

## B. It is paced by a person
5. **(must) A first-timer takes 2 to 4 minutes; no two hard beats touch; a breath follows every set piece.** Proof: the time model
   and a bot's run, and the beat table's seconds.
6. **Risk comes before reward, and flags and hearts follow risk.** A flag before each new danger, never more than about a minute
   apart; a heart only after real risk; none where nothing can hurt. Proof: the flag and heart positions against the beat table.
7. **He always knows what to do next and why he failed.** Every danger has a tell he can see and hear half a second or more before it
   can hurt; a locked exit is explained. Proof: the tell tests; a still of each first meeting.

## C. It reads on the phone, both ways
8. **(must) Each beat's whole question fits one upright screen from where he must decide** (the thing to use, what it acts on, the
   danger), and nothing he needs is behind the HUD sideways. Proof: stills of every beat, upright 412x915 and sideways 915x412.
9. **(must) Nothing that matters is hidden or cut:** no pickup in front of a mechanism, no animal off the screen's edge at the moment
   it matters, no prop tied to thin air or running off the top of the screen. Proof: the same stills, looked at as a player.
10. **Painted, not drawn.** Everything he looks at for more than a moment is painted art in the world's look. A code-drawn stand-in
   is named as one and has a picture list. Proof: the list, and stills.

## D. It is kind
11. **(must) Nobody is hurt in the story.** Animals leave on their own legs (or glide); no stings, no swarm, no knock-out shown on a
   creature the story says is only grumpy. Easy is never harder than Normal in any number. Proof: the kit's fairness check.
12. **The level ends quiet or ends big, on purpose**, and the last thing he does is the best thing in it. Proof: the last beat.

## E. It holds up
13. **(must) Every roll is this level.** Not "119 of 120 rolls build": every listed seed lays the SAME arc in the same order with its
   own small differences, on both settings. Proof: the seed list check, and three rolls' stills side by side.
14. **(must) Every gate is green on the exact head**, the stage lock shows no other stage moved, and a bot has finished it on both
   settings. Proof: the gate table in REPORT.md.

## Found while making 1-3 (each one a problem a builder could miss, and the check that now catches it for every level after)
| Found | Where it showed | What catches it now |
|---|---|---|
| A mechanic waking something before its world teaches it: a hard LANDING woke a sleeping snake in World 1 | reading the kit against the move ladder | the ladder holds it (`predators/roster.ts` TAUGHT.landing); `castPlay.test` and `castEngine.test`: World 1 silent, World 2 wakes |
| A handle too far from its load: the hive half off an upright phone, its snake out of sight | upright still | `dropTrap.ts` TRAP.reach 140-190 px; the builder refuses a roll outside it (`trapFaults`, `trap.reach`) |
| A load hung behind the goal sign on a sideways phone (210 px up; then a branch a step up) | sideways stills, twice | loads hang 100 px (`w1Cast.ts` TRAP_HANG); trapped branches level with their handle. NOT a check yet: a HUD-zone check on stills is owed |
| The animal beside its trap, not under it (the lay keeps animals 120 px from any prop) | first stills of a real roll | `armedTraps` hangs the load over the middle of its animal's patch; `trap.over-nothing` refuses a load with no patch under it |
| A trap over an empty branch on Easy (Easy's 60% cut took the snake, the hive stayed) | counting loads against snakes, both settings | a trap is armed only by the animal that stays (`armedTraps`); `library13.test`: every trap has its snake, both settings |
| Chased off TOWARD the player (it fled from the load, and he stood on the other side) | glide still | the trap's beat is told where HE is; `castPlay.test` "chased off reads as fleeing", five starting places |
| A pickup's glow in front of the trap, hiding it | the lead, on stills | `trap.hidden`: the builder refuses a pickup within 50 px of a handle or under a load, after the lay |
| A prop tied to thin air, lines running off the top of the screen | the lead, on stills | a rule in this bar (C9); no check yet |
| "119 of 120 rolls clean" that was not a level: trap bricks dealt among another level's bounce and gap sections, in any order | scoring it on this bar (A2, A3, E13) | one graph, one brick a beat, a pool of its own; `library13.test` holds the plan beat for beat on every seed |
| A designed graph the roll could not fill: its types dealt at random (and jittered) to nodes with one brick each | 46% clean, "pool short" | `GraphBrief.dealExact`; `library13.test` "the arc is dealt the same on every seed" |
| A beat too short for the clock: the generator appended extra sections to the last node and broke the arc | the build's own repair notes ("one more section") | each beat sized to its designed seconds; the plan test fails if a 14th section appears |
| A one-way-to-win animal: a stomped snake came back after 5 s, a punch only dazed it, so a purge could stall | Matt's direction, then the kit's data | every ending in the snake's data is the glide; the kit test "however he beats it" walks all four ways |
| A lesson line that never shows: the trap tip queued behind stock lessons (found by P13's bots) | bot runs | P13's TEACH kind of line; this level's data marks its tip as one (owed here) |
| An engine test that passed while the wiring was missing (8 green tests, 2 of 23 planted faults survived) | planting faults | `reference/qa-reports/W1C/planted-faults.py`: 34 faults, each must be CAUGHT |
| Dot's lesson said too late to read: her line 232 px before the vine, and a first-timer walks 265 px a second | P13's bots: adult and kid sprang the first trap on 0 of 40 rolls | the line is a TEACH line at the lesson's flag, 800-1,100 px before the first vine; `library13.test` holds the distance and that nothing can hurt before it |
| Easy with LESS of the level's one idea: its count cut emptied four of nine trapped logs, leaving walks past unarmed vines | counting traps on both settings | `Socket.easy 'stay'`: the animal a piece is built round stays on Easy, softened; test "Easy keeps every trap" |
| A pit with steps out one side, before a purge's shrine: he arrives owing snakes, drops in, and cannot go back | the adult bot ended "stranded", 6 of 10 | a free rope's hollow is one hop deep (place `rope` with `free`); the test measures the hollow and that no animal stands past it. **General rule for the bar: nothing one-way before the exit of a stage whose exit can seal** |
| A "branch" that was a step of soil, in a stage called Branch Snakes | my own stills, judged as a player | every snake is on a painted fallen log; nothing checks "the thing the name promises is on screen": a line of this bar (A4) |
| A flag stood on a snake's log and emptied its socket (a block ON a piece is `main` unless told) | a roll's counts fell from 13 snakes to 12 | the logs say `main: false`; the snake and trap counts are held on every seed; planted |
| A piece that draws as something else at another size: World 1 paints a log-style block 24 px thick as a log, 50 px thick as a bright green hedge | stills of the first rests | every log is the low one; **no check: a builder must LOOK at each new piece at each size it is laid** |
| A level whose links were another level's pieces: 57% alike to 1-1 by funcheck | funcheck, P13's run | an arrival and four rests of its own; the pool test refuses any World 1 library section in 1-3's pool |
| A kit hook that moved an animal after the lay, and Easy silently dropped it (the builder finds an animal by its fill's x) | three red tests, after my own push | the fill follows a re-seated animal (pipeline); planted |
| A real game crash the move left behind: a second visit to a cleared 1-3 threw (its id still read as a hand-built stage) | the whole suite, not the stage's own tests | `isW1Stage` asks the tables; a test plays six clears. **Rule: after a stage changes builder, the WHOLE suite runs before anyone plays it** |
| A tool outside tsc crashing in the background (a stale name in a print line) and its run read as "no result yet" | two empty logs | run the tool once in the foreground after every edit to it; a background run's log is checked for an error, not only for a result |
| A length that read "no tier under 2:00" because the fastest bot was not counted (its copy of the bots sprang no trap) | F13 re-flying 40 seeds on the newest bots: the kid on Easy at 112-116 s | measure EVERY tier, both settings, 40 seeds, on the bot owner's newest bots; `castBots.test` now runs in CI (gates.yml) |
| A designed pair split by the lay's gaps (any two animals 120 px apart): the far snake pushed off an upright screen | the two snakes on a log, on stills | `Socket.group` (variety.ts poissonPlace): a group keeps no gap among its own pieces, every other gap kept; `variety.test` planted |
| A rule for one sleeper (its load 10 px off the middle) breaking a pair: the load landing on the second coil | numbers from the real roll, then stills | `armedTraps` re-centres a load a second sleeper shares; `library13.test` "the load between coils, 50 px or more from each" (planted) |
| A sky strip's edge art meeting where it wraps: two half orchids made one white "ghost" behind the route | the lead, on P13's stills; found by a draw-call probe | `stageBackdrops.test`: no stage on w1sunrise until it is repainted. NOT a general check yet: a strip's two edges are not compared |
| A designed level quiet for 4-11 s at a time: rests of long flat banks, 24-40 px steps and 25 px logs (walked, never hopped), a stair's way down | P13's seed-list dry run (QUIET_MAX 4 s) | `library13.test` holds the list's quiet line on the game's own roll (planted: the old stair, 10.5 s) |
| A made thing in a world that has none: World 2's wooden posts and rope at 1-3's way out | the lead, on stills | a rope's look is DATA (`look: 'vine'` on its section's rope place, Rope.look): ART-W1B's vine tied in two living trees; `library13.test` holds it on every seed, both settings; planted. World 1's other ropes (1-4, 1-5, 1-7, 1-9) named, the lead's call |
| A painted piece drawn out from a rope's end standing off its bank (a tree's foot over the hollow, or in front of the totem) | measuring the trunk against the exit's banks before drawing it | `library13.test`: each tree's whole foot on its own bank, at about its usual size, the totem 40 px clear of the far tree; planted (a short bank, a tree half again too big) |
| A section out of a stage's pool with no reason named (a designed level's own pieces read as "refused: ") | the CI tools test, red since W1C's d03487f7 | `tools/engine/library.ts` poolReport names another stage's own piece; `library.test` fails on any section out with no reason |

## Scoring 1-3 as it stands today (t-w1-creatures, 11-12 afternoon, honest)
A1 2, A2 2 (one graph, one piece a beat, held on every seed), A3 2 (every piece is its own: no library section in its pool),
A4 2 (snakes on fallen logs, vines and hives: funcheck reads it as no earlier stage on 16 of 16 layouts). B5 1 (bots: every tier
finishes and no run is under 2:00 (126 s the fastest); the tester-built tiers take 2.7 to 6.7 minutes, but the KID first-timer takes
9.6 minutes on Normal and 5.9 on Easy, most of it walking back from a sealed totem for snakes he passed: 6 turn-backs a run), B6 1 (flags and hearts are the game's own rules: 12 and 6; right
for a child's 4 hits a run, more than my first table), B7 2. C8 2 (from the vine, hive and snake on one upright screen; a
sleeper right under its load), C9 1 (sideways the trap's leaf clumps brush the goal sign's rim), C10 0 (stand-in trap art; the list
is with ART-W1). D11 2, D12 1 (a rope he cannot use yet is the last thing he passes: old 1-3's ending, kept by ruling). E13 1 (24 of
24 rolls are the arc on both settings; no seed list yet), E14 1 (the bots finish it; the first-timer bots miss the first vine;
flown rows not marked judged). **Not shippable to main yet: one 0 (the painted traps). To Matt's test link tonight: yes, said as
a stand-in.**

## Scoring 1-3 on F13's final head (a090d7d3, 11-12 evening, honest)
A1 2, A2 2, A3 2, A4 2 (its own pieces and now its own sky: the repainted sunrise). B5 1 (P13's bots, 40 seeds, c925d4e6; no roll
moved from b39cd468 to the final head: medians 135.8-149.3 s on every tier, none under 2:05; but the kid bot strands on 7 of 40 Normal seeds at the
finale's awake bare-log snake, 11-12 of 13: P13 calls it a bot limit, not yet confirmed), B6 1 (the game's own flags and hearts), B7 2.
C8 2, C9 1 (sideways the first sapling's crown tucks behind the goal sign's end: ART-W1's named spot; nothing that matters is
behind it), C10 2 (every trap piece and the way out's vine and trees are painted). D11 2, D12 1 (by ruling: a vine he cannot use yet
is the last thing he passes). E13 2 (P13's seed list of 100, `seedlist 1-3 --check`), E14 1 (every gate green on the exact head
but one: yield.test's 1-1 floor, red on t-int-2 itself; the lock: only 1-3 moved). **No 0. Three (must) lines at 1 (B5, C9, E14),
each named with its owner: not shippable to main by this bar's own rule yet; to Matt's test link: yes.**
