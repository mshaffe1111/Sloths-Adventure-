# DIFF-ALGO report (R-165.172): the hardness meter and the difficulty arc. Branch t-diff-algo, base t-int-2@465023ef
Written 2026-11-12 9:52 PM ET. Packet: origin/ccr-702d3c49-i33jeq reference/packets/2026-11-13/DIFF-ALGO.md, plus the lead's three messages (Matt's
8:36 PM ratings 1-1 = 4, 1-2 = 2-3, 1-3 = 1; his 8:37 "1-1 possibly a 5"; his 8:38 "research the internet too, cite each source").

**Method used:** none existed for this job, so I wrote reference/methods/difficulty.md (LESSONS: a job with no method gets one).
**Lessons applied:** test the measuring tool before trusting it (D15: 14 planted cases, every stage's heaviest challenges read one by
one, four tool artifacts found that way); a gate calls the code the screen calls (D19: stages built by realPlay.ts, the engine's own
build, and the miss cost read from the engine's `softOn`); facts from code, never memory (D7, D24: every number from the engine or a
flown spec, every file:line re-grepped); times pasted from `date` (D20, D30); my message queue read before reporting (R-6.27: three
lead messages, all applied); never change a rule to clear a miss (LAWS 22: nothing tuned per stage, every disagreement named).
## 1. Done-items (8 of 8)
1. The elements and their points, with why: reference/design/DIFFICULTY.md §1 (bits for every challenge, three multipliers), §7 sources.
2. One 0-100 number, world bands with overlap, arc rules: §2 and §4.
3. Calibration prototype, tools/difficulty/score.ts (read-only). World 1, 4 layouts, untuned: **Normal 1-1 4.0, 1-2 2.0, 1-3 1.1;
   Easy 2.4, 0.9, 0.6** on Matt's 4, 2, 1; the tier bots fail in the same order. Evidence: qa-reports/DIFF-ALGO/world1.txt (each
   stage's heaviest challenges), check.txt, sensitivity.txt, tierbots-world1.txt.
4. The arc: a Normal target for every slot of all ten worlds (§4), and all 90 stages scored on both settings (all-worlds.txt / .json):
   World 1 has 8 of 9 in its band; World 2 has 2; Worlds 3-10 have none (medians 5-17 against bands of 19-100).
5. The engine's levers: §5, today's with file:line (re-grepped 2026-11-12 9:52 PM ET), and seven NEW ones (N1-N7), each grepped for first.
6. How a designer uses it and the gate's spec (G1-G6): §6, and reference/methods/difficulty.md.
7. Research with title and link (Matt, 8:38 PM): §7, 22 sources, what we took from each, principles only.
8. No game code changed: `git diff --stat 465023ef -- src/` is empty.
## 2. Polish check
No screen changed, so nothing to shoot. The prototype's output was judged the way Matt would read it: each stage's 12 heaviest
challenges read one by one (world1.txt). Four were the tool's, not the stage's, and each became a rule for every stage: 1-2's root
humps and dips (the route jumped over blocks a player hops onto), 7-8's tower (a floor 2,000 px up read as a hump), 4-3's 1 s time.
## 3. Pushback
1. The packet's anchor "1-3 = 1-2" is superseded by Matt's 8:36 PM "1-3 = 1" (STATE.md 746-747); I calibrated to his latest.
2. 1-1 at 4 sits above where a world's first stage belongs. Measured (world1.txt): its five doubles (three 139-140 px double rises,
   the 255 px double gap) are its five heaviest challenges, about half its points. That backs R-165.173 (doubles to 1-4): target 2.5.
3. On Normal the game does not climb today: 0 of the 72 stages in Worlds 3-10 sit in their band. The arc is a rebuild target, and
   in dependency order (D40) the builder takes a meter target (N1) before any stage is re-laid to it.
4. My card puts sims under reference/specs/sims/; the packet named tools/difficulty/. I followed the packet (the contract).
5. The meter cannot gate yet: the inspector's route has two defects (below) and a gate must call the code the screen calls (D19).
## 4. Suggestions (ready packets)
- **S1 INSPECT-ROUTE** (tools/inspect owner; Opus high): routeJumps links two banks over a raised block or a dip and inspectJumps
  calls it a pit (route.ts, jumps.ts); stages.ts cannot build a designed arc on Easy (stages.ts:92 calls easyStage on a stage built
  for Normal). Done: 1-2's 231 px "pit" reads a 53 px hop; `inspect.ts --stages 1-1,1-2,1-3` runs; a planted test for each.
- **S2 METER-GATE** (Opus, after S1): promote score.ts with its tests in a workflow (the ciTests rule), G1-G6 of §6, methods/gates.md.
- **S3 METER-TARGET** (Engine): N1 planBudget reads the stage's meter target (gen2/pipeline.ts:338) instead of D and heat; N2 a
  creature tell and speed scale; N3 a "threats at once" setting. Done: a stage built to target T scores T +-1.5 on the meter.
- **S4 1-1 re-lay** (R-165.173): its double rises to 1-4; re-score 1-1 to 2-3 on Normal.
- **S5 meter v2:** restraint (the chain's "don't press") and Easy's first-attack delay on hand-built stages, measured by the bots.
## 5. Unresolved
- Overlap (+50%) is untested on real stages: World 1 has none. Calibrate on World 2+ once stages carry targets.
- Past World 1 the scores are a first read: 2 layouts, 44 of 90 routes only partly traced, calibrated on World 1 alone. 1-8's 32.2
  is unchecked (route or real); 4-1 and 4-9 have no route.
- 100 (World 10's hardest) is a design target until World 10 is built to it.
- Gates, by Matt's 9:51 PM ruling (relayed by the lead: no game code changed, so the fast gates run here and the full suite and perf
  gates on the integration head): tsc PASS; score.ts --check PASS (14 planted cases); knowncheck PASS; generalitycheck PASS;
  roadmapcheck's only line is the shallow-clone FAIL (this clone is shallow). The full suite, started before the ruling, was stopped
  at 2,136 passing results and 0 failures.

## 6. Method update (proposals; the lead merges)
- methods/README.md index: "difficulty.md: score a stage on the hardness meter".
- methods/level.md: a step "name the Normal target from DIFFICULTY.md §4; judge the build with score.ts the same day".
- LESSONS: "A tool's route is not the player's: read the heaviest challenges one by one before trusting a score (1-2, 7-8, 4-3)."

## 7. Turnover note
reference/handoffs/designer.md rewritten for the meter (header, read-first, §4 open item, §5 four traps), in this commit.
