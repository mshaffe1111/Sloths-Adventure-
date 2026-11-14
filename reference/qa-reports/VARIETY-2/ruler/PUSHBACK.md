# RULER PUSHBACK (11-13): the per-gap ruler, built as settled, refuses every 1-1 seed: 1-1's climb has real unmarked openings
**Built (t-ruler):** findOpenPits judges each gap by its own lips (earth-only lips, no 1,600 px cap, the floor window and SOFT_FLOOR from
the gap's line, w1Pits.ts `gapLine`). Planted tests (w1Pits.test.ts "per-gap ruler" x4) red on 1829470f (all 4), green now.
**Blocker:** with it, 1-1 cannot build: `no seed of 24 from 769 builds cleanly` (w1Pits.test "World 1, layout 1"); seed 769's first
refusals: floor.unmarked 25298..27953, drop.untyped 31047..31993. (1-2's 8 first refusals were my ruler's bug, fixed below.)
**Why (measured, seed 769):** 1-1's last climb (log chain to the shrine) lies over three holes with NO earth at any depth: 25298..27953
(2,655 px), 28068..30938 (2,870), 31047..31993 (946). The old ruler never judged them: G was 1112, 315-435 px under their banks
(old w1Pits.ts:146), and two are over its cap (old w1Pits.ts:164). Every x in them has some piece (the route's logs, catch branches,
lower logs) but nothing under the route at many x; the game draws the backdrop's log-strewn forest floor there
(stills/1-1-L1-climb-x26600-29500-31500-before.jpg). realFalls (promises11.ts:36-50), read by BOTH verdicts (floorlessGaps;
pipeline.ts:3820 routeGaps -> drop.untyped), opens 457-2,388 px runs there. My first reading blamed its two clauses (promises11.ts:44);
the experiment below shows the runs are real by the corrected clauses too.
**Scan (ruler/scan-3.txt, after the fixes below; same builds read old vs new, 102 x 2 x 16 = 3,264):** painted changes 0 (no marked
drop or hurt pit moves; only World 1 is painted, protoArt.ts:1310); raw changes on 1,890 builds; floor.unmarked changes on 818, but only
1-1/1-2/1-3 are judged (stageTable.ts:34-38): 1-1 32/32, 1-2 0, 1-3 0. Nothing drawn changes; what moves is which 1-1 rolls pass.
**The lead's ruling (9:26 PM): A, promises11.ts for those two clauses only, if each is proven a MISREAD in both directions.**
**Result: neither is the cause on 1-1; promises11.ts is untouched.** With BOTH clauses corrected (floor clause: a floor UNDER the piece;
lip clause: a top meeting the piece's own edge), seed 769's open runs stay open, now by the corrected rules: he lands on a catch
branch or a lower log (120 at 819, 115 at 869, 121/122 at 794), walks under the route log above it (114, 116, 117, 118 at 576-729) and
steps off its end into nothing (25348..25755, 25947..26218, 26390..26730, 26873..27231, 27375..27953; hole 2 the same). So 1-1's
refusals are REAL by floor.unmarked's own definition (no heartFalls soft zone, no drawn drop; the backdrop's forest floor he would fall
through): an opening the old ruler never saw (G far below, the cap). Fixing it is content (soft zones over the climb's holes, or catches
that end on something), not the ruler and not realFalls.
**1-2's 8 new refusals were my ruler's bug, fixed:** 1-2 layout 3 (seed 3) x14136..14684: a 124 px log lying on the 602 bank read as a
pit's wall, so a falling stair read as a fall. A rim lying on earth that runs on under all of it is no wall (w1Pits.ts `onFloor`;
planted "a piece lying on the ground is no pit wall", red then green). Rescan after it: scan-3.txt.
**verdicts.test.ts:322-323 (seed 323's planted copy)** ends its slot at log 127 with no bank to its right: under earth-only lips it is no
gap, so "without branch 128 the slot is a fall" fails. The copy needs the real stage's next bank (not my file; the lead's call).
**Ask:** C (hold t-ruler) until 1-1's climb is fixed in content; the seed 323 copy fixed by its owner. Everything else is ready.
