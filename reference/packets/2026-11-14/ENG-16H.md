# ENG-16H: three global fixes 1-6 exposed, then 1-6 GREEN for Matt's link #4. Opus 5.5 xhigh (engine). Written 6:26 PM ET 11-14.
Role card: reference/roles/ENGINE.md. Read level.md rules 21-22 first, then ONLY reference/qa-reports/ENG-16G/REPORT.md on origin/t-build-16
(its castBots table, the ranked petal-miss list, rescues/ traces and EXACT NEXT STEP), nothing else unless a step names it.
Why: 1-6 is the next level on Matt's link. The expert bot ends sealed 22/40 and the kid bot is rescued 6/40 on Normal; every cause is a rule
any stage with lianas or vine creatures can hit, so each is fixed ONCE in the engine (rule 22), for every stage in every world.
Branch: continue t-build-16 from ENG-16G's last push (git ls-remote first; name the sha). FIRST merge origin/t-tools-2 (TOOLS-2's one per-setting helper src/game/settingDials.ts + TOOLS-1's flight-cache key f3312155c: without it Easy flights leak into Normal) and convert pipeline.ts:329's hand-set swing to withSetting; then Easy is proven for REAL (TOOLS-2: 1-6's Easy differs on 100/100 seeds today), so relist 1-6 Easy too.
 (1) WALKED-SPAN PETALS: a petal laid after a release lands on the span he walks (between where the release window lands him and where he
     walks off), never only on a perch a fluid run skips. Planted: a toy with a perch-only petal RED, the walked-span lay GREEN. It reads the BUILT piece (ENG-16G 6:30: b1's data says 280 px but it is built 83-118 px, and pipeline.ts:3212's 20 px clamp put the 'moved' petal back on the same spot): find why a piece builds narrower than its data and fix that root too, or name it ENGINE-WORTHY with file:line. Lay lives at pipeline.ts:2551, 3199-3214, petals.ts:378.
 (2) LIANA PIT WAY BACK: every soft pit under a liana has a way back to its take-off bank a kid can take. Check ENG-16G's s20/s36 first:
     stair missing = a lay rule (planted, every stage), stair present = a bot fix in firsttimer.ts (planted toy).
 (3) VINE CREATURE TELL: a snake or riser on a vine never starts a hop that moves him inside TELL_MIN (rolling.ts's constant; reuse it) of
     his catch; its tell shows first. Planted: catch-then-hop-next-frame RED, GREEN after.
Then: lockall --check (list every stage that moved, and re-prove each moved stage's list), relist 1-6, castBots 1-40 both settings: 0
rescues, 0 sealed on every tier (a located honest kid miss on Normal may be proposed to the lead with frame + reason, never assumed), the
WHOLE suite on your head (name it), then stills of every beat upright + sideways, Easy + Normal, and CLIPS (first liana, the chain, snake on
your vine, the false liana, the gorge, sealed + open exit; name the frame where each action shows, D69). 
REPORT reference/qa-reports/ENG-16H/REPORT.md with "Learned", ENGINE-WORTHY findings and EXACT NEXT STEP. Send GREEN to the lead.
BOX: report by 9:30 PM ET, or at 40% real context (400k). Progress message at 8:30 PM ET with what is planted and pushed. No shell
wait loops (D67); read your queue at every push. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM (reference/handoffs/lead.md line 1).
