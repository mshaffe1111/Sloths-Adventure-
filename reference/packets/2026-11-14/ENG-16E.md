# ENG-16E: 1-6's engine findings, fixed for EVERY stage (R-165.246; Matt 11-14: "the engine is global... builders don't do engine work"): A. the chain's last leap, B. the shared petal fill, C. World 1's FAR row. Opus 5.5 xhigh (engine). Written 1:47 PM ET 11-14 by the lead.
Branch: work ON t-build-16 (its head when you start: BUILD-16d's STOPPED head; 1-6 is where the faults showed). You fix the engine
items for every stage, then FINISH 1-6 yourself (no further builder hand-off). READ FIRST: reference/methods/level.md
rule 22, reference/qa-reports/BUILD-16c/REPORT.md (the petal findings: fillGaps drops petals on pit floors on stretches over 1,050 px with
no socket petal; a creaky limb can't hold one, flowerReach.ts:140), src/game/petals.ts + petalPass.ts, LESSONS D29, D40, D63, D69.
A. THE CHAIN'S LAST LEAP (BUILD-16d 11-14, reference/qa-reports/BUILD-16d/: Normal bots 1-2/6, kid thorn deaths off the chain's LAST
   liana): chained lianas swing at amp 0.24-0.26 rad (ENG-S5's 0.225 floor) vs 0.45 for every other 1-6 liana, so a forward-end let-go
   (LET_GO_AT 0.75, the testers' moment, physics.ts RELEASE note) from the last chain liana falls short of a perch 337-357 px on. Fix in the
   engine/chain lay (ENG-S5's chainRelease / W1_CHAIN_SECTIONS lay): the last leap of any chain flies its perch from a forward-end let-go
   (amp floor, or the perch laid within the chain's own reach), keeping ENG-S5's whole-next-swing-in-view rule; planted (a chain whose
   last perch the old floor can't reach: RED). Never by changing the bot's let-go.
B. THE SHARED PETAL FILL. 1. Fix at the root in the shared fill: no petal on a pit floor (hurt or soft), none on a creaky limb, none anywhere a player must take a fall
   or a hit to reach; the fill places them on the walked/landed path instead. No stage id, world number or x (generalitycheck).
   2. Planted tests: a toy stage with a long pit stretch and a creaky limb: no floor/limb petals with the fix; RED without it.
C. WORLD 1'S FAR ROW (w1Swing.ts:37): falls cluster at FAR on snake-on-vine and the gorge (BUILD-16c); lay FAR nearer the band middle
   for every World 1 stage (Matt's shorter swings, R-165.225), re-score each stage it moves.
GLOBAL (A, B, C): every stage the change moves is re-checked and shipped with it: seedlist --check on every list (relist --merge --in-order where
   a list no longer replays, and say which), castBots/goal share on 1-1..1-6 both settings (a goal share that now fails is a finding, not a
   reason to lower it), tierBots 1-1 unmoved (or recalibrated per BOTS.md), the whole suite.
4. 1-6: say whether BUILD-16c's per-beat socket petals are still needed; if not, list them for removal by 1-6's builder (data).
5. Stills: a pit stretch and a creaky limb on 1-5 and 1-6, before/after, upright + sideways. Full CLAUDE.md Checks (buildcheck ALONE).
D. THEN FINISH 1-6 from reference/qa-reports/BUILD-16d/REPORT.md's EXACT NEXT STEP: relist + bots 1-40 both settings (0 rescues; a kid
   Normal rescue only if located and honest, like 1-1 L10), the WHOLE suite, plant.sh, stills upright + sideways Normal + Easy of every
   beat, CLIPS (first liana, the chain, snake on your vine, the false liana, the gorge, sealed + open exit; name the frame, D69), full
   CLAUDE.md Checks (buildcheck ALONE), REPORT with a Polish check. Gates: run what your change can affect while you work; the full set once
   on your final head.
No until/sleep wait loops (D67); read the queue at every push (D57). BOX: 2 hours or 40% context (400k of 1M by the real figure).
Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
