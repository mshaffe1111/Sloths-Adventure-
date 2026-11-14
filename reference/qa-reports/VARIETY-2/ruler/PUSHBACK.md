# RULER PUSHBACK (11-13): the per-gap ruler, built as settled, refuses every 1-1 seed. The cause is realFalls on wide holes (not my file)
**Built (t-ruler):** findOpenPits judges each gap by its own lips (earth-only lips, no 1,600 px cap, the floor window and SOFT_FLOOR from
the gap's line, w1Pits.ts `gapLine`). Planted tests (w1Pits.test.ts "per-gap ruler" x4) red on 1829470f (all 4), green now.
**Blocker:** with it, 1-1 cannot build: `no seed of 24 from 769 builds cleanly` (w1Pits.test "World 1, layout 1"); seed 769's first
refusals: floor.unmarked 25298..27953, drop.untyped 31047..31993. 1-2 gains a floor.unmarked on 8 of 32 builds; 1-3 none.
**Why (measured, seed 769):** 1-1's last climb (log chain to the shrine) lies over three holes with NO earth at any depth: 25298..27953
(2,655 px), 28068..30938 (2,870), 31047..31993 (946). The old ruler never judged them: G was 1112, 315-435 px under their banks
(old w1Pits.ts:146), and two are over its cap (old w1Pits.ts:164). Under them every x has a solid piece below the route (probe: widest
x-run with no solid at any depth = 0) and the game draws a log-strewn forest floor (stills/1-1-L1-climb-x26600-29500-31500-before.jpg).
realFalls (promises11.ts:36-50), which BOTH verdicts read (floorlessGaps; pipeline.ts:3820 routeGaps -> drop.untyped), still opens
457-2,388 px runs there: its "floor inside the slot more than 10 px under it" (promises11.ts:44) takes ANY lower piece anywhere in the
slot, not one under the piece, so in a 2,655 px hole every piece but the lowest is "passed under".
**Scan (ruler/scan-1.txt; same builds read old vs new, 102 x 2 x 16 = 3,264):** painted changes 0 (no marked drop or hurt pit moves;
only World 1 is painted, protoArt.ts:1310); raw changes on 1,944 builds; floor.unmarked changes on 851, but only 1-1/1-2/1-3 are judged
(stageTable.ts:34-38): 1-1 32/32, 1-2 8/32. No stage's look changes from the ruler; what moves is which 1-1/1-2 rolls the verdicts take.
**EXPERIMENT (scratch worktree, never on t-ruler), A1: x-overlap in the floor clause (promises11.ts:44):** 1-2 layouts 1-4 build clean
(its new refusals clear); 1-1 layouts 1-4 still refused (drop.untyped + floor.unmarked on the climb). What stays open on seed 769 lies
under the ROUTE logs themselves (log 116, 25846..26248 at 652; logs 126-130 at ~607), "passed under from a lip" (promises11.ts:44, the
first clause) 500-2,600 px from that lip: he cannot walk under a log 600 px into a hole from its lip. Both clauses' planted cases
(verdicts.test.ts:308-333: seed 476's 60 px slot, 323's 73 px, the 60 px bough; seed 172's deck right over its block) never met a hole.
**Options (LAWS 22: the ruler is not loosened to pass):**
A. (recommended) The verdict's owner re-reads realFalls for wide holes: (1) the floor clause takes only a floor UNDER the piece (x-overlap);
   (2) the lip clause only for a piece over that lip's opening (its near edge at the lip). Planted from seed 769's climb (red now) with
   seed 172/323/476 and the bough case kept green (verdicts.test.ts:308-333). Then t-ruler re-runs seedlist/lockall/mixlist + full Checks.
B. 1-1's climb gets a soft zone or drawn floor (content): the still shows the floor is already drawn; I do not recommend it.
C. Hold t-ruler unmerged until A lands. Its ruler, tests, scan and still tools are pushed; nothing of it can ship before A.
