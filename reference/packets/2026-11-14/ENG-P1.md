# ENG-P1: the shared petal fill never lays a petal where it can't be fairly taken, on EVERY stage (R-165.246; Matt 11-14: the engine is global). Opus 5.5 xhigh (engine). Written 1:47 PM ET 11-14 by the lead.
Branch t-eng-p1 from origin/t-build-16 (its head when you start: 1-6 is where the fault showed). READ FIRST: reference/methods/level.md
rule 22, reference/qa-reports/BUILD-16c/REPORT.md (the petal findings: fillGaps drops petals on pit floors on stretches over 1,050 px with
no socket petal; a creaky limb can't hold one, flowerReach.ts:140), src/game/petals.ts + petalPass.ts, LESSONS D29, D40, D63, D69.
1. Fix at the root in the shared fill: no petal on a pit floor (hurt or soft), none on a creaky limb, none anywhere a player must take a fall
   or a hit to reach; the fill places them on the walked/landed path instead. No stage id, world number or x (generalitycheck).
2. Planted tests: a toy stage with a long pit stretch and a creaky limb: no floor/limb petals with the fix; RED without it.
3. GLOBAL: every stage the change moves is re-checked and shipped with it: seedlist --check on every list (relist --merge --in-order where
   a list no longer replays, and say which), castBots/goal share on 1-1..1-6 both settings (a goal share that now fails is a finding, not a
   reason to lower it), tierBots 1-1 unmoved (or recalibrated per BOTS.md), the whole suite.
4. 1-6: say whether BUILD-16c's per-beat socket petals are still needed; if not, list them for removal by 1-6's builder (data).
5. Stills: a pit stretch and a creaky limb on 1-5 and 1-6, before/after, upright + sideways. Full CLAUDE.md Checks (buildcheck ALONE).
No until/sleep wait loops (D67); read the queue at every push (D57). BOX: 90 minutes or 40% context (400k of 1M by the real figure).
Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
