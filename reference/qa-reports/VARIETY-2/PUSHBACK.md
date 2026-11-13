# VARIETY-2 PUSHBACK on items 1 and 2 (R-165.197/.198/.200). Engine, t-nodes. Evidence measured on 4b9a6419's code (same src as 74290856)
Tools: reference/qa-reports/VARIETY-2/tools/ (mixlist.ts = nodeMix's 60 W1 strings, asked + bare; floorkind.ts; secprobe.ts; repairs.ts).

## Item 1 ("fix the LAY so asked strings lay the late sections whole"): the premise does not hold; the root is the painter's ruler
- **The bare frames fail the same way.** 11 of the 17 bare frames that are not clean carry floor.unmarked too, in the same sections
  (bare #38: log-chain x2, sunlit-log; bare #39: canopy-rungs-level x4, quiet-arrival). Asks don't cause these gaps; they move them.
- **Same section, same structure, opposite verdicts.** String 57 (`A P1< M> R X1_> R W>:8 R S E`, seed 58) lays seed-perch > log-chain >
  quiet-arrival, asked AND bare: main logs over catch logs, a catch log ending under a main log in both. findW1Pits reads ONE ground line
  G = the bank top with the most total width over the whole stage: asked G = 813, bare G = 1269 (a long low stretch elsewhere). At
  G 813 the log chain's first logs (y 795, 805; 24 px thick) count as "ground" (w1Pits.ts:148, y >= G-20) and the span between them
  is a fall with only a part floor: unmarked, so the painter would paint water there (w1Pits.ts:11-12). At G 1269 no log is ground
  and nothing is judged. `secprobe.ts "<code>" 58 w1-log-chain`, asked vs `A P M R X R W R S E`.
- **All 87 gaps by lip** (floorkind.ts): thin/thin 32, thin/bank 29, bank/thin 3 (logs or rungs that happen to sit on that stage's G),
  bank/bank 23 (a hole between two tall banks under a bough walk: judged only when 24-1600 px wide, w1Pits.ts:164; the same section
  over a wider hole is not judged). Which strings fail is set by the stage-wide bank mix, not by what the late sections lay.
- **So a lay fix inside the late sections would be a patch** on a ruler the planner already names as the blocker (planner.md:82-83
  "Floors": "findW1Pits' single ground line, which needs per-gap lips"; :109 trap 10). Fixing it changes the painter and floor.unmarked for
  shipped stages (what gets water), so it needs the lead's ruling (LAWS 22: a stricter, consistent ruler, never a looser one).
  Ready packet: EXACT NEXT STEP in REPORT.md.

## Item 2 ("a repair ban spares a slot's last section of its dealt type"): it renames the failure, it frees no string
- String 8 on seed 9 (`repairs.ts`): slot 11's climb twists are banned because each one's exit leaves the corridor out the TOP
  (y -585, -365, -450: the route is already high there); slot 14's signature sections the same (-528, -390, -607); and every reroll 1-6
  dies on `pool short at slot 9 (n9 test: no bounce section left)` (the deal gave the test node bounce; W1's two bounce tests fail here).
- Sparing the last climb twist keeps a section that strays: the roll then fails by "outside the corridor" instead of "pool short" + V11.
  Bans are per roll (pipeline.ts `bans`, one Map each `rr`), so no later roll gains. The V11/V14 'g' lines are downstream noise of a
  roll that already fails by name. The variety number moves only if the strays or the bounce-test deal are fixed at their cause.
- I did item 3 and items 4-5 as written, and leave 1-2 for the lead's ruling rather than lay a patch (D40).
