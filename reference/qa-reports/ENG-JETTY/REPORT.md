# ENG-JETTY: 2-7's race-end line, World 2's finish under a stacked leg, story tips (packet ENG-JETTY.md + the lead's items 2 and 3)
Base t-eng-27 d9425f091. Code head 1b2897cfb (t-eng-jetty-wip); landed on t-eng-27 by fast-forward with this report and the note.

## 1. Done-items
1. **Race end: PASS.** Brief `raceEnd` names a world tip id and a speaker for win and lose; the pipeline lays them on `Pacer.ends` (a tip
   with no words is a named lay problem); engine.ts `sayRaceEnd` says the verdict's line once as HE reaches the dock, by its speaker
   (GuideOpts.who -> a story line, heard on Tips and Help defaults). Never mid-race (the boat docking first says nothing), never twice in a
   run (the verdict outlives a respawn), never on a retry's replay of the same finish (stage-tip memory). generalitycheck PASS.
   **Toy:** src/game/raceEnd.test.ts 6/6; with the hook line removed (own tree of 20cb0a2d9) tests 1-3 FAIL.
2. **World 2 finish (item 2): PASS.** A soft fall no longer drops a solid in a run leg stacked under its own leg; a fall on the low leg
   drops its bed as before. Plant w2StackedFall.test.ts RED before, green after. **2-7 seed 2** (t-build-27-wip 7bff04c33, as-is vs + fix,
   played platforms): as-is MISSING, with fix PRESENT: Easy 11164+340@1501, 11616+388@1501; Normal 10955+340@1502 (BUILD-27's
   10078+340/9690+388, moved by fafd18d05's porch walk); nothing else moves. lockall: section 8.
3. **Story tips (item 3): PASS.** WorldManifest.storyTips -> StageHint.story -> GuideOpts.who. storyTip.test.ts 2/2; RED 2/2 with the
   pipeline and engine lines removed. **Scan:** storyTipScan-1b2897cfb.txt (20 laid lines dropped on Normal's default; the water warning
   on 2-1, 2-2, 2-4, 2-5 among them). No shipped data changed.

## 2. Polish check
Nothing drawn. The lines are Dot's / Pokey's usual bubbles; judged on 2-7's own stills/clip at the jetty by BUILD-27b (both settings,
upright and sideways). The finish fix restores ground the design laid; BUILD-27b's stills show it.

## 3. Pushback
None. Forks decided: (a) race lines on the BRIEF (PacerRow is the world's shared table); (b) said as STORY lines (a plain line is dropped
on Tips, D50); (c) once a stage on this device, as stage tips (the codebase's meaning of "not on a retry"); (d) 9 s wait (a result is news
for seconds); (e) the finish guard is narrower than BUILD-27's line: only legs UNDER the fall's own leg, so a fall on the low leg keeps
its bed rule; (f) GraphBrief and WorldManifest each gained one optional field, StageHint one (the Architect's files; the lead ruled it).

## 4. Suggestions
**WATER-WARN (release 4, data + one rule):** World 2's "This river's deep. Don't touch the water!" is kind 'info' and dropped on Normal's
default Tips (scan), against "Dot warns first". Make WATER_WARN a danger/must line (dotLines classify or a GuideOpts flag) with a test
that plants it and asserts helpAllows on Tips; re-run the scan. Then mark the scan's story beats (2-5 quiet, the marks, 2-1/2-2/2-4) in
each world's storyTips. **FINISH-BAND:** BUILD-27's trap: every world finish rule that works by x span gets a stacked-leg toy.
## 5. Unresolved
None in scope. 2-7's ids and storyTips are BUILD-27b's wiring (the note's last bullet).
## 6. Method used / Lessons applied / Method update
Method: dispatch-packet.md (base suite first, frozen trees, CI tool line), engine-core.md section 4. Lessons: D114, D115 (chattr-frozen
trees; each RED run in its own), D113 (no foreground wait), D50 (defaults tested; the scan), D43 (general, no stage id), D126 (CI tool
line), D118 (scan kept out of tools/ so the suite verdict carries), D109 (no clock times in messages), D57 (inbox at each step), D119.
Method update: a disk-full worktree add fails silently under `>/dev/null`: check `git worktree add`'s exit, and remove finished trees
(each is about 3 GB). level.md: every new line a builder lays is checked with the scan on Tips.
## 7. Turnover note
reference/handoffs/engine-core.md section 0zq-jetty (top), rewritten for all three items, in the landing commit.
## 8. Gates (code head 1b2897cfb, frozen tree)
- PASS on 1b2897cfb (frozen): tsc, generalitycheck, knowncheck. PASS on f9eab29c9 (item 1 alone): vite build (BASE_PATH), chunkcheck,
  artcheck, coveragecheck, registrycheck, roadmapcheck. Plants: raceEnd 6/6, storyTip 2/2, w2StackedFall 1/1 (each RED as section 1 says).
- **Base suite d9425f091 (inherited reds):** at 2,586 results, two RED so far: 1522 and 1523 (bot (planted): the drifting-log hop and the
  racing hop off a log, home Easy seed 1); 2013 is a TODO. Still running in ENG-JETTY's container at hand-over.
- **UNRUN at hand-over (box reached):** the unit suite + CI tool line on 1b2897cfb (running in ENG-JETTY's container, 934 results, none
  red so far), lockall, and the landing.

## EXACT NEXT STEP (items 1-3 landing, then item 4)
1. Suite + CI tool line on 1b2897cfb in a chattr-frozen tree (the CLAUDE.md suite list, then gates.yml 'rolled' test line); compare reds
   with the base suite on d9425f091 (1522, 1523 known red there). Any red not on the base is a stop.
2. lockall, the 13 listed stages, base vs head: `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/base.json` in a frozen
   d9425f091 tree, then `--check <scratch>/base.json` in the frozen 1b2897cfb tree: expect no change (nothing listed sets raceEnd or
   storyTips, and no listed stage stacks a run leg under another). Also vite build (BASE_PATH) + chunkcheck on 1b2897cfb.
3. Land: `git push origin 1b2897cfb:t-eng-27` plus this docs commit (fast-forward; t-eng-27 was d9425f091), `git ls-remote` equal,
   send the lead the hash.
4. Item 4 (the lead's message): the child bot's two river faults on 2-7 (walking off a lip onto a log's tail sliding under the bank;
   jumping from a log's middle, not its end): one toy each RED before/GREEN after, rule 28 x40 on the stages the change touches, land.
