# BUILD-18c: 1-8's data step (t-build-18c from t-art-18 51ac9cde + t-build-18b 9f7d54bd). Report 3:18 PM ET, on d00a17eb + this commit
**EXACT NEXT STEP:** merge t-build-18c onto link #4's head (t-int-10b), then the integration head's full gate set (full suite, build,
chunk/art/draw/clip/known/generality/roadmap, seedlist --check every list, tierBots). Expect 1-8's lock to move only (intended); the
seed list seeds-1-8.ts is relisted here (100/120), re-run seedlist 1-8 --check after the merge. Then 1-8's stills for Matt from that head.
## Done-items
1. **drawcheck 1-8 + 1-98, both ways, a spot forced at x 24036: PASS, 0 breaches** (drawcheck-1-8-1-98.txt; drawcheck.mjs has no x or
   stage option, so a scratch copy (_dc18c/_run18c, NOT committed) added PERF_AT_X). x 24036: drawImageScreens 4.54 up / 5.41 side (1-8),
   4.90 / 5.53 (1-98); worst 5.58 side at x 37037 (1-8), 6.05 side at x 320 (1-98), limit 7.5; gradients 0; shrunk notes 2-4 (limit 32).
2. **Data:** t-build-18b merged clean (48151519). w1Arc18 brick() takes join: 'walk'; w1-18-still-fork and w1-18-tip ask it (4dfcfe1b).
   Test w1Arc18 'walked onto on every roll' (seeds 1-4 both settings): planted RED without it ('normal seed 1: the join into w1-18-tip').
   Layout 1 = seed 2, BUILD-18b's pit-into-the-fork roll: now a walk on both settings.
   **Hanging moss: built, judged rough, NOT shipped** (pulled back out in this commit): w17-moss-drape/-b hung under the still fork's moss
   read as ONE faint grey wisp (the art is dark and strong): engine.ts:7217 draws invDress 'behind' before the ground pass, whose bough
   mist (protoArt.ts:503, near solid) covers it. ENGINE-WORTHY below. Crack art: named only (Unresolved).
3. **Relist:** seedlist 1-8 PASS, 100 of 120 (83%; 20 refused 'low nut: a wall in its run-in'); --check PASS after the moss revert.
   **castBots 1-8 seeds 1-40** (addlevel-1-8.txt): kid N/E 40/40, adult N/E 40/40, child N 40/40 (was 37/40) E 40/40, middle N/E 40/40,
   expert N 40/40 (expert has no Easy profile, castBots.ts:31); min 138-283 s (floor 120). No misses, nothing to trace.
   **lockall 2 layouts vs t-art-18:** 101/102 unchanged; 1-8 (intended) moved: platforms, chase, rolling, hints, bushes, invDress... (lock-2layouts.txt).
4. **Stills** stills/c18-1-8-L1-x{26600 fork, 34200 tip, 6064 palm, 13900 dip}-{upright,sideways}.jpg, Normal (the built difficulty),
   one spot per page (see Polish). addlevel still NOT READY on 2 pre-existing items: 4/24 Easy rolls refused; 1-8's row not flown/judged.
## Polish check (whole screen, D79)
Fork: moss carpet, Pokey tinted in it, eagle on its snag; clean. Tip: taper clean both ways. Palms (6064): both palms over the drop, nut
clusters read. Dip: stub steps and the cannon trunk read. Named, not fixed (not 1-8 data): the right palm's fronds show a pinkish-cream rim
upright (ART-18 said despilled); an orange-brown haze at the far left of the palm still sideways; a dark smear on the bough right of the
eagle's post sideways; the wayside bubble shows in every still (teleport artifact; sideways it sits over the bough body, not where he acts).
My own first sheet was WRONG: stills-at shot 4 spots in one page and, after the tip, the palm spot drew flat bough with no palm. Caught by
probing the render (both palms drawn) and re-shot one spot per page. Moss wisp seen and pulled (above).
## ENGINE-WORTHY / Suggestions (ready packets)
- **BOUGH-HANG** (engine, any bough stage): a hung invDress row whose top is under a bough line draws after drawBoughMist, before the
  banks (or invDress gets an 'underBough' layer). Proof: 1-8 fork still with MOSS_18 rows (my 4dfcfe1b data: 2 drapes, tops 55/60 px into
  the bark). Then 1-8's data re-adds MOSS_18 (code + test in 4dfcfe1b, reverted here; invDressArt name-prefix line for the two drapes).
- **stills-at.mjs:** one spot per page (or reset the stage between spots) and a real wait for lazy invDress pictures; drawcheck.mjs: a
  PERF_AT_X / stage option (owed checks like 'x 24036' could not be run by the shipped tool).
- **tsc in a worktree** pulls the main checkout through reference/qa-reports/POLISH-5/*.mts absolute imports (/home/user/Sloths-Adventure-/...):
  errors only outside the tree; make those imports relative.
- **BOUNCE-REUSE** (engine, verdicts; blocks judging 1-8, lead 3:05 PM asked for it): flown (fly/flight-1-8-normal.txt; rows ready:
  single-hold 123/116 gap 136/221/244, single-flick 123/115 127/211/238, single-tap 87/79 77/162/183, double-hold 208/201 290/376/403,
  double-flick 207/200 272/358/391, double-tap-tap 148/141 189/274/299, bounce 223/215 gap 177, bounce-air 311/301 gap 334). With
  judged: 'normal-1-8', 0 of 24 rolls clean both settings (fly/addlevel-1-8-judged.txt): verdicts.ts:51 makes EVERY bounce outside a
  teach 'bounce-air-test' (band 236-250), so 1-8's plain taught bounces (rise 149-152, s3 + s7) fail band.out + block.lesser-passes. Needs
  a 'bounce' practice kind (a taught bounce reused, banded by bounce alone) for every judged stage; then enter the rows (n18 like n17),
  judged, relist, bots. Reverted here (nothing half-done ships); seed list unchanged, --check PASS.
## Unresolved
Crack art on a cracking bough: a cracking section only quivers; chaseCrack (protoArt drawChaseSection) is the old log look, never drawn on
a bough stage; needs a painted crack overlay for the bough (the lead's HF call). Full suite NOT run (packet: the integration head runs it
once). roadmapcheck could not judge (shallow clone). Hanging moss NOT shipped (BOUGH-HANG). 1-8 flown but NOT judged (BOUNCE-REUSE).
## Method used / Lessons applied / Method update
level.md (rules 22, 26, 27, 28, 29), stage-fix.md, gates.md. Lessons: D79 (whole screen: that is how the shooter fault and the moss wisp
showed), D19 (a still must come from what the game draws: probed the render), D62 (the built difficulty), D57 (queue read at every push),
law 22 (no data workaround for the mist; no rule loosened: the invDress planted test was made to read the folder list, same strictness),
D59 (no background run left). **Method update (level.md step 'stills'):** "Shoot ONE spot per page with stills-at, and render + wait
2.5 s before the stepped frames; judge every still against a live-render probe once per stage."
## Learned (for the next builder)
A dressing row can pass every data test and still be invisible: judge it on the real frame before calling it done.
## Hours and cost (LEVEL-LOG)
2:50-3:18 PM ET (start to report).  No HF spend. Turnover note: reference/handoffs/engine-core.md 0LOOK2 rewritten (this commit).
