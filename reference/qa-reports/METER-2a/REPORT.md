# METER-2a REPORT (R-165.272): STOPPED at the lead's wrap-up order (11:54 AM ET 11-15). Branch t-meter-2a.
Base: origin/t-meter-1 cfa9019a + merge of origin/t-meter-2 535cd616 (conflicts: modelgate.mjs kept INT-9's self-test, PASS 24/24;
NODE-KEY.html kept t-meter-1's file + t-meter-2's one-line K row). Packet steps 1, 2, 4: code DONE; proof partly UNRUN (below).

## Done (each with its evidence)
1. **Gate** (0ccbd7a1): tools/difficulty/coveragecheck.ts (+ test, 7 tests), reference/design/meter-coverage.json (77 piece ids read
   from the code: moves, platform types, creatures, zones, bricks, ride ways, skills, beats.ts families), coverage.known.json (8 gaps on
   built stages, each R-165.272 + owner; in knowncheck LISTS), gates.yml step + tool-test line, ciTests.test.ts, ROADMAP R-165.272
   Source. score.ts: the flat 2, the 0.25 'climb' and every move routeJumps skips now throw `unpriced piece <family>` unless known.
   Built stages = every stage-table row + every stage of `shippedWorlds` [1]: 1-1..1-10, seeds 1-3, both settings; PASS in ~20 s.
   Meter scores unchanged: 80/80 identical (1-1..1-10, seeds 1-4, both settings, raw to 6 dp, bits, challenge count).
   Plants: (a)-(e) each RED with its check removed; the old flat 2 put back -> real-stage test RED; an added known id -> knowncheck RED.
2. **Ride channel** (85ac822b): score.ts rideTiming/rideChallenges/deadlineBits + rideChannel.test.ts (6 tests). Board = moving jump
   (still jump's bits + windowBits(cycle, board), RW); step-off = deadlineBits (FB). River logs (river.ts drift), ride.ts rides (Easy
   via beatOf), lift.ts lifts; a moving floor on no clock is refused. Hand-built 2-1 normal s1: 26 log hops, board 1.8 bits (1.43 s of
   3.5 s), step-off 0.3. Plants: channel call removed -> 1 RED; channel pricing nothing -> 4 RED.
3. **Bot SKILL read a stage clock, board + step-off** (c1f89cc8): firsttimer.ts clockRide + CLOCK_SKILL + clockRide.test.ts (toy,
   level.md rule 21, real engine). Skill on: 12/12 crossings (middle, child; Normal, Easy; seeds 1-3); off: 11/12 fall.
   tierBots.test on 1-1: 7/7 pass. Calibration (tierBots.ts 1-1, 3 tiers, seeds 1-40, both, --calibrate) before vs after:
   byte-identical (210 lines), so no recommit. castBots 1-1 (40 seeds, both, 5 bots): identical (360 lines).

## Gates on c1f89cc8 + this commit
tsc PASS | coveragecheck PASS | knowncheck PASS | roadmapcheck PASS (after the R-165.272 Source cite) | generality PASS |
coveragecheck + rideChannel + clockRide + score + ciTests tests PASS (31 + 2) | tierBots.test PASS 7/7 |
**UNRUN (lead's order):** the full unit suite; the rest of the CI tool-test line (castBots.test, firsttimer.test, ...);
seedlist 1-1 --check; castBots 1-2..1-8 after (before ran 1-1..1-6, then stopped; only 1-1 compared).

## Findings
- jumps.ts routeJumps takes only 'jump'/'hop', so the meter priced mushroom launches (1-1, 1-6, 1-9), long jumps/'glide' (1-1, 1-2,
  1-5), presumed hops (1-6) and every hop onto a moving log at ZERO, worse than the doc's "a still jump". All known-listed (METER-2b).
- Bot gaps on built stages (known): crumbling branches (1-4), push logs (1-6), ring waves + boa (1-9). The river ENG-W2b lays is
  river.ts drift logs, not ride.ts clock rides; asked ENG-W2b (11:33 AM) whether anything but the window end sinks a log: no reply yet.

## Pushback
- None on the packet. Step 1 is bigger than "2-3 h" if every vocabulary source is wanted: skills + stage-kit modes read in, brick
  pieces not yet collected (no stage holds one); named below.

## Learned (for level.md / gates.md)
- A gate that refuses must be proven against the RIGHT old behaviour: the gate alone stays green if score.ts's throw is reverted;
  the test file catches it. gates.md: "coveragecheck + coveragecheck.test are one gate; run both."
- A docked ride leaves a 4 px crack the tier bots read as a pit (and jump over, overshooting): any piece that docks needs the bot to
  own the approach. level.md rule 21 toys should plant a flush dock.

## EXACT NEXT STEP (METER-2b, in order)
1. Finish the proof: `npx tsx --test $(sed -n 's/.*tsx --test //p' .github/workflows/gates.yml | head -1)` (the CI tool line);
   the full suite ALONE (CLAUDE.md Checks); `npx tsx tools/engine/seedlist.ts 1-1 --check`; castBots 1-2..1-8 before (t-meter-1
   cfa9019a + the t-meter-2 merge, i.e. 7ba7c73e) vs after (this head): `npx tsx tools/inspect/castBots.ts --stage <id> --seeds 1-40
   --setting both --par 3 --json`, diff sorted lines; list every change.
2. After ENG-W2b lands: drift step-off reaction sits beside its hopLandsOn (firsttimer.ts clockRide drift branch); re-run its
   riverRide.test + clockRide.test together; price its gen2 2-1 with coveragecheck (2-1's row joins the built stages by itself).
3. Packet steps 3, 5, 6 ([2-2] dwell channel + the clock SKILL's dwell half + the misread tier incl. 1-2's mid-air steering,
   R-165.269); step 7 re-score W1; the hold term lambda; T50 fitted to Matt's ranking (gaps "a little", not 8x); the tie band from the
   seed spread; 1-1's per-piece r=0.94 (R-165.268). Each known-list entry closes with its channel/bot (shrink the list).
4. Vocabulary still to read into coveragecheck: stage-kit modes/set pieces (stageKit.types.ts), brick pieces on a stage (once laid).
5. Turnover note reference/handoffs/engine-core.md NOT rewritten (wrap-up order); this REPORT stands in for it.

Method used: reference/methods/gates.md + level.md rule 21. Lessons applied: D19 (gate calls score.ts itself), D29, D36, D45-style
"measure what ships" (built stages from the table), D55/D64 (context self-estimate flagged), D59 (background runs killed and named
UNRUN), D78 (box). Method update: the two "Learned" lines above.
