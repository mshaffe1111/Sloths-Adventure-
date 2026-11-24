# PUSHBACK (TEACH-11, 11-24 3:27 PM ET, from date): the landing needs the lead's ruling on 1-1's first-run lock

**Blocker.** `seedlist 1-1 --check` fails `first-run.drift` on the fix: 1-1's fixed first run (src/game/gen2/firstRun11.ts, seed 9652,
ADR-002) hashes its built parts, and the fix changes `proto.hints` (three lines become teach lines). Every past re-record of that lock
came on the lead's word with a proof; my packet does not give it, so I stop before landing.

**The proof** (firstrun-lock.mts here; its output firstrun-lock.txt):
- base 90552d3ec gives the recorded hashes: Normal f405e1cea982681d, Easy a9525e8f62636c3a.
- head cac4b678b: Normal 63ee55bd4e47e897, Easy d166f084d0071472. Every part's hash identical except `proto.hints`.
- head with the teach mark taken off the three lines (coach.jump, hint.1-1.gaps, hint.1-1.double) gives the recorded hashes exactly.

**Ask:** re-record FIRST_RUN_11's lock to Normal 63ee55bd4e47e897, Easy d166f084d0071472, with a "Re-recorded by TEACH-11" note
(only proto.hints moved; revert proof as above). Then seedlist 1-1 --check on a frozen tree, and land on t-eng-27 (fast-forward).

**Also for the lead (lockall.txt: base 90552d3ec -> 78a2c5d4e, 16 layouts x both settings): 84/102 stages unchanged, 18 moved,
`proto.hints` only:** 1-1, 5-9, 6-2, 6-4, 6-5, 6-6, 6-9, 7-1, 7-3, 7-5, 7-7, 7-9, 8-1, 8-2, 8-5, 8-6, 8-8, 8-9. The lines by stage
(teachkinds.mts, layouts 1-4; kindcheck.txt, before/after on Tips and Help): 1-1's three; 15 World 6-8 lesson lines that Tips DROPPED on
Normal before and says now (6-2, 6-4, 6-6, 7-1 x2, 7-3 x2, 7-5 x2, 7-7 x2, 7-9 x2, 8-1 x2, 8-2), four of them locked-shrine lines
(7-3, 7-5, 7-7, 7-9: "Dot explains any locked exit" was broken on Normal there); 5-9/6-5/6-9/8-8/8-9's shrine lines and 8-6's glide
line change kind with no change on screen (already 'must' / 'teach'). The same escape storyTipScan found on the listed stages
(R-165.412), fixed by the same general rule; no listed-stage gate saw Worlds 6-8.
