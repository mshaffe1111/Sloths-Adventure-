# INT-6 REPORT (t-int-6 from t-int-5@e8afc05c; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Opus 5.5 xhigh. Box 7:19-8:24 PM ET, ctx ~39% at stop.
**GREEN f9671e3b** (sent 8:18 PM). **EXACT NEXT STEP:** 1. Lead pass/fail on stills/sheets/ (below). 2. t-len-14@d56cd915 is NOT ready: the
rotten fork strands the tier bots (castBots 169/360 vs 242/360 on the same engine, len14/castbots-*.txt): middle Easy seed 4 "fell back
down 8 times" at y 6412 (the fork's entry storey): in an ascent he keeps jumping for the exit bough 240 px above instead of taking the
creaking way down. Fix at the root in w1Arc14.ts ROTTEN_FORK, not the bots: make the creak the way UP (a zigzag of creaking steps over
sound wood, crumble, job still D_ only if V9 allows a rising D; else ask the lead for a free job letter), or hide the exit until he is
down. Then libstage 24, ONE more --relist, castBots 40 (no tier below the base: kid 20/27, adult 35/33, child 22/19, middle 27/29,
expert 30; floor 0 under), then the full gates on t-len-14. Its castBots floor fix (2467b5e5, planted CAUGHT) stands on its own.
3. feel-cam (t-feel-cam@9df1bdf4, no REPORT by 7:35 PM) merges clean onto t-int-6: next integration, after its REPORT.
## Done (evidence)
- Merges, no conflicts, tsc 0 after each: t-perf-build 6fd6e00a; t-polish-2 c16fdad (src = 76dd013, lead 7:20 PM); t-feel-vine 7b77ff96.
- Full gates ONCE on 16f2e24c (gates/run.sh = CLAUDE.md Checks + every CI step), all 0: tsc, unit 3/3 (unit1 1324/1324), build, chunk,
  art, known, generality, kbd, every listed seedlist, registry, 9 tool tests, tierBots, drawcheck, clipcheck (83 known, none added),
  buildcheck alone (p95 109/69 ms). Red: roadmapcheck (FEEL-VINE's methods/feel-fix.md unindexed): one row in methods/README.md; then
  tsc/roadmap/known/generality 0 on 68d015dd; f9671e3b adds RESULTS only (gates/RESULTS.txt).
- R-165.206 (lead ruling A, 7:42 PM): castBots floor = STAGE-RULES.md:77 via eraRoll RULES + isClimb (1-4 100 s, 1-5 120 s; planted:
  flat floor -> fail 1). 1-4 + ROTTEN_FORK (D_, crumble) + rest i, deal 8/25/33/34: arc tests 8/8, re-rolled ONCE 24/24 both settings,
  100/100, --check PASS (len14/addlevel-relist.txt); every bot's runs over 100 s (adult Easy min 99 -> 111). Bots regress: see step 2.
## Polish check (real page, frozen worktree of src 34782034; Easy set the game's way and printed; 412x915 + 915x412, 2x)
- 14-gates-crown-*: gate of one (re-shot on the bunch's vine: the field lays mirrored), gate of three, crown + shrine. ROUGH: sideways
  the gate of three's bough and thorns sit under the HUD bar while he stands on its foot (camera frames Pokey; POLISH-2 named it).
- 14-grab-*, 15-grab-*: caught and climbing, no snap at 2-frame steps. 15-beats-*: ROUGH (known R-165.209b) upright ground ~55% down.
- len14-fork-*: the descent reads in one sideways screen; standing 2 s on r2 drops him one storey (creak works). Its vine winds round a
  square-cut post (POLISH-2's named art item). Raw frames not kept in the repo (sheets carry them).
- Shooter artefacts, not game faults: Pokey's halfway card, 1-5's "She squashed this one extra flat." and Easy's fern card stay across
  spots (one page per setting; the fern card waits for a tap by design, dotGuide.ts).
## Pushback
- POLISH-2's shot.mjs set Easy by '&difficulty=easy', which the page never reads: that URL builds Normal (H 10166 vs Easy 10599), so its
  'Easy' stills 03/04/05/07/08/09/16/17 were Normal. Mine prints the setting each page was built on.
## Learned / Method update (proposed)
- level.md: in an ascent, a beat that goes DOWN while its exit shows above invites a doomed jump; the tier bots find it in one castBots run.
  Measure castBots on the same head before and after (a base run is 2 min at --par 4) before judging a beat.
- gates.md: a stills tool prints the setting it built on (a URL switch the page never reads passes silently: D15, D19).
- A gate result is for its own head: FEEL-VINE's roadmapcheck PASS predated its method commit (D53 again).
**Lessons applied:** D15, D19, D23, D29 (seed list rebuilt -> --check), D36, D53, D55, D57, D59 (nothing left running), D61, LAWS 3, 5, 22.
**Method:** gates.md, level.md. **Turnover note:** this report (no handoff file rewritten: context line).
