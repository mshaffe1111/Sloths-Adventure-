# FIX-GATES: the last two reds before Matt's link (t-fix-gates from t-int-11 7b012852e). Engine. Report 5:52 PM ET 11-15 (date)

## Done-items
1. **(a) registrycheck "1-8 flown, row not judged": FIXED at the root, pushed 18e323e0.** verdicts.ts classify: outside a teach node, on a
   stage after the one that teaches the bounce (skills.ts BOUNCE_TAUGHT_AT '1-1', bounceReusedAt), a bounce lip the bounce alone reaches is
   the new kind 'bounce-reuse' (types: verdicts.types.ts SectionKind; band reach.ts BANDS 128-218 on both settings: one jump's flown climb
   123 + SPARE up to the bounce alone's flown climb 223 - SPARE, the same on every judged scope in flownArcs.ts). Past 218 the lip still
   asks for the bounce + air jump (refused while untaught, FIX-21's rule, as before). 1-1 and every teach node keep 'bounce-teach'. Planted:
   src/game/gen2/bounceReuse.test.ts: 150 px reused passes on 1-8, both settings; the same 150 in a teach node is refused (band.out, the red
   1-8 carried); 240 px is not a reuse and is refused untaught (with the combo taught it is the air test); 110 px is block.lesser-passes;
   1-1 keeps the teach band. Then 1-8 is judged (stageTable 'normal-1-8') and relisted: seeds-1-8 100 of 121 (83%, as BUILD-18c; refused
   21 'low nut: a wall in its run-in').
   - Runs: tsc clean. registrycheck PASS (10 stages incl. 1-8, 72 s) and registrycheck.test PASS. seedlist 1-8 --check PASS (before the
     relist it failed 2 Easy seeds, 10 and 105, which is why it was relisted). The verdicts refuse 0 of 100. seedlist --check PASS on every other
     judged stage (1-2, 1-3, 1-4, 1-5 (150), 1-6, 1-7, 2-1, 2-2): the wider bounce band moved no listed roll.
   - Tests whose example was "1-8, never flown" now use 1-9 (verdicts.test 51, 58, 60), and judgedTable expects 1-8 in the table. Same
     intent; 1-8 is now flown and judged.
2. **(b) riverRide planted x2: FIXED, all 18 tests green (20 s).** First the root cause, by bisect, with a probe for each skill:
   - HANDED: FIX-21 ec96fe0c2's engine handover hands a rider who WALKS into the bank, so with the skill off the child walks in and is
     handed. That is correct, and it made the plant's "off, handed 0" claim false. Reverting that hunk in a scratch copy made the plant bite
     again. Lead's ruling 5:43 PM: keep the skill and re-plant it on its remaining job. Off, the middle bot on Normal hops at the water off
     the long log: 3 lives at the river, against 1 with the skill.
   - UPSTREAM: the first bad commit is FIX-21 9137470f1 (a tier bot looks past the end of his floor over water), which removed the late
     walk-off the toy plant relied on. I tried 12 toy rows (gaps, speeds, log lengths, 2-3 rivers in a row, a low roof, bot variants that
     always press late or never stop): skill off still crossed every one. The lead's live cases (2-1 child Easy seeds 20, 23) traced to a
     different gap. On a log flowing back at him, the far bank stands 28 px (LOG_DROP) above the log and reads as floor ahead, so no gap
     rule ran. He walked into its face (x 20,210), stood while the log carried him back, walked off its end, splashed, again, until rescued.
     Fix: a new bot skill, SKILLS.bankUp (firsttimer.ts): on a log running back at him, with the bank face within a hop, he hops up now.
   - Retiring upstream (the lead's option A) was MEASURED and REJECTED by his own condition. With it off, 2-1 adult Normal seed 12 and child
     Normal seed 23 drown 5 times and are rescued; the old skill passes both. So upstream is kept, and its plant moved to 2-1's own rivers.
   - New plants (riverRide.test.ts, castRun on 2-1 as the game builds it). On: adult N 12, child N 23, child E 20 and 23 all cross clean.
     upstream off: adult N 12 and child N 23 are rescued. bankUp off: child E 20 and 23 are rescued. handed off: middle N drowns 3 > 1.
     The old toy plant for upstream is replaced (lead's ruling 5:32 PM: "re-plant upstream on that geometry"). The back-river toy crossings
     stay.
   - castBots 2-1, final head vs t-int-11 (kid/adult/expert seeds 1-20, middle/child 1-40, both settings): kid N 17/20 = 17/20, kid E
     20/20 =, adult N 20/20 =, adult E 19/20 =, expert 20/20 =, middle N/E 40/40 =, child N 40/40 =, **child E 40/40 (was 38/40)**.
     No tier passes fewer seeds. Child N lost 125 water lives in total against 114: 11 more, all on seeds that still pass.
3. Pre-existing on t-int-11 7b012852e and NOT this packet's: verdicts.test "5-7 / 7-1 builds as on main" hash reds (red on the base too).

## Polish check
No screen changed: verdicts, a seed list and bot tests only. 1-8's layouts change by its relist (an intended move; the stills are
BUILD-18c's look on the same data, with different seeds).

## Unresolved
- tierBots.test "three variants replay as committed" is RED, and red on the base t-int-11 7b012852e with the identical numbers
  (child easy v2 297.6 vs 289.3 s). Its cause is FIX-21 9137470f, whose commit says the 1-1 calibration must be re-run; this head does not
  move 1-1 (bankUp only acts on a drifting log). That re-run (BOTS.md) is owed by INT-11 / the lead, not this packet.
- CI's engine-tools test line (gates.yml:94, 17 files incl. riverRide, chaseBots, castBots): 168 pass, 0 fail (1 TODO).
- castBots beyond 2-1 (2-2's back river) was not run. 2-2 seedlist --check PASS, but its bots were not re-flown with bankUp.

## Method used / Lessons applied
stage-fix.md and gates.md. Lessons applied: check the fact before acting on it (bisected instead of trusting the packet's "the toy, not the skills";
D15, test the measuring tool); the off side measured before retiring (the lead's A failed its own condition); law 22: no plant loosened. The
upstream toy plant was replaced on the lead's ruling, and the handed claim corrected with its cause (ec96fe0c2) cited; D30, times from date.

## Learned (for the next builder)
A bot skill's plant can stop biting when a later, more general fix covers the same failure. Before rewriting the toy, bisect the plant
(find which commit made it stop biting), then measure the skill off on the real stage with castBots. Both took minutes; the toy hunt took 30.
