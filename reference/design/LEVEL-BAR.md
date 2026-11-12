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
| A tool outside tsc crashing in the background (a stale name in a print line) and its run read as "no result yet" | two empty logs | run the tool once in the foreground after every edit to it; a background run's log is checked for an error, not only for a result |

## Scoring 1-3 as it stands today (head of t-w1-creatures after the designed arc, honest)
A1 2, A2 2 (one graph, one brick a beat: every roll lays the arc in order, held by a test), A3 2 (World 1's library gives only
arrivals, rests and exits; no bounce or gap section is dealt in), A4 1. B5 1 (198 s on the time model; no bot yet), B6 1 (flags are
the generator's, about 11; hearts not yet seen on it), B7 2. C8 1 (every trap fits one upright screen and is clear of the sign
sideways; a bare branch's snake is at the edge until he is on the branch), C9 1 (the same), C10 0 (stand-in trap art; the list is
with ART-W1). D11 2, D12 1. E13 1 (480 of 480 rolls are the arc, but there is no seed list yet), E14 0 (no bot; flown rows are
1-1's). **Not shippable yet: two 0s (the painted traps, a bot and its own flown rows), both in hand with ART-W1 and P13.**
