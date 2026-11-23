# DRESS-27: 2-7's three look defects, fixed at their cause in World 2's kit (general) - before Matt sees 2-7 TONIGHT (R-165.415)
Engine (art/dress code), Opus 5.5 xhigh. A FRESH member. **BUDGET 1 h; REPORT BY the time the lead names; HARD STOP 2 h.** Hand over at 320k
REAL context or 28 minutes with an EXACT NEXT STEP (D111, D129). Long runs with run_in_background (drawcheck: timeout 7200000), NEVER a
shell '&', never a foreground wait; at most TWO heavy runs; every run on a chattr-frozen worktree (D115); no heredoc in a commit chain
(D119); candidates on t-eng-27-wip-dress; a landing runs the suite AND the CI tool line (D126; inherited reds named with base evidence).
No stage id, seed or x in engine code (generalitycheck). New art only from the inventory (src/game/art/inventory.ts) at Pokey's scale;
Hugging Face is the lead's call: if a fix truly needs a new picture, stop and say so (one line, what picture, why).
READ LEAN: LAWS headlines (law 1: done means polished; law 2: judge the real screen); STAGE-RULES §4-§5b; the three stills below (open them).
BASE: t-eng-27 (fetch by name, newest head). The stage to look at: t-build-27-wip (fetch by name; 2-7 is laid there).
FOUND BY BUILD-27c (11-23), judged by the lead on the real stills:
1. **The weir pool's seam:** a hard thin dark line with coloured specks runs along the pool's surface the whole width of the falls
   (reference/qa-reports/BUILD-27/stills27c-live/zoom-weir-pool-normal-x15950-sideways.png on t-build-27-wip; BUILD-27b saw it first;
   READY-27 fixed the teal, not this). Find the cause (where the pool's water surface meets the weir's foam foot / the column dress
   sink, W2_WEIR in w2Sections.ts, riverArt.ts) and fix it there, for every weir / column dress over water, not by moving 2-7's pieces.
2. **The climbing pole stands IN the pool in front of the falls** (same still): a plain brown trunk with a black outline standing in the
   water reads as a stray post, not a way up. Make it read as part of the weir (rooted on the stones, the spray around its foot, or the
   inventory's climbable at Pokey's scale), still plainly climbable. Your fork: decide, one line why, show it.
3. **The porch planks over the river read as floating** (stills27c/s27c-2-7-L1-normal-x11376-sideways.jpg): every plank deck over water
   gets its posts down into the river (the inventory's stilts/posts at Pokey's scale), on 2-7 and on every World 2 stage that lays one.
4. **(If it fits the budget; else name it in the REPORT with a still) the ground step's hard notch:** where the low floor meets a raised
   bank, the floor's pale top band ends in a ruler-straight rectangle against the bank's dirt (t-build-27-trial f18614471:
   reference/qa-reports/BUILD-27/dry27d/win-adult-n1-f3630-line.jpg x about 620-665 and lose-child-n1-f11764-line.jpg x about 505-545,
   both at the home jetty). Say whether it is 2-7 only or every World 2 step, and fix it at the cause if it is cheap.
PROOF (STAGE-RULES §5b polish check, each item a BEFORE and AFTER still at phone size, upright AND sideways, Normal and Easy, plus one
zoomed): the seam gone with nothing new along the line; the pole reads as climbable and rooted; every porch stands on posts. Every
shipped World 2 stage whose look changes gets an after still (new replaces old). lockall: no listed stage's LAYOUT moves; drawcheck and
clipcheck PASS on the candidate (PERFORMANCE-RULES §1: posts must not breach the draw budget).
Land on t-eng-27 (merge, no force) and send the lead the hash and the stills' paths; BUILD-27d merges it.
REPORT: reference/qa-reports/DRESS-27/REPORT.md on t-eng-27-wip-dress, the "Polish check" section first. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
Messages carry no clock times.
