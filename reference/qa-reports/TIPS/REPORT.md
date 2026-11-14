# DRAFT (in progress: gates and clips running) TIPS (R-165.236, R-165.241; R-165.238 not started): REPORT, branch t-tips from t-int-8@0a9be28c
Method used: methods/stage-fix.md (planted failure first), gates.md; the engine card's day one (lock saved on the base first).
Lessons applied: D19 (the gate and the bot call the engine's code; the first-timer passes `lock` like the phone), D21 (every vertical
rolled stage: the gate finds them from the builds), D43 (no stage id in engine code: bands come from section data), D50/D63 (clips on
the default setting, Dot's real bubble), D59 (nothing left running), D62 (BUILT printed; the tool fails a built/asked mismatch),
D64 (context vs 1M), D67 (waited on completion notices), D69 (each clip's caption names the frame a tip fires).

## 1. Done-items
1. **Band (done).** StageHint.band [top, bottom] for his feet (engine.ts hint filter); gen2 tips carry `tipBand(sec)`: the section's
   surfaces (pieces, entry, exit, vines), BOUNCE_REACH 258 over, DOUBLE_RISE 185 under. src/game/tipBand.test.ts: 1-4 hold-right 20 s
   on layouts 0-2 says 4 tips by x alone, 0 with bands; 1-1/1-2/1-5 first-timer whole runs (Normal + Easy) fire every tip on the
   SAME frame with bands as by x alone. Planted: TIP_BAND {0,0} moves 1-1 and 1-5 (planted-band-zero.txt). Lock vs base (16 layouts x
   both settings): only `proto.hints` moved, on the 22 rolled stages with tips (lock-check.txt, exit 0).
2. **Verdict + gate (done).** N = TIP_NEAR = PHYS.maxRun 285 px/s x TIP_SAY_S 3.6 s (the time a stage tip is up) = 1,026 px of route:
   said further back, the line is gone before he gets there. `tipMisses` (towers -> towerMiss, fails the roll by name): early > N, or
   a teach tip not in the first section to show its mechanic. 1-4 x alone: 3,354-7,410 px early; with bands at most 860 (16 builds).
   Every rolled stage, layouts 1-2, both settings: 0 misses (test). tools/engine/tipwalk.ts (gates.yml, + tipwalk.test.ts): every
   vertical rolled stage (today 1-4), verdict + a real-engine 20 s walk; PASS with bands, 64 misses with --strip (tipwalk-*.txt).
3. **Clips (CLIPS).**
4. **R-165.238 (NOT STARTED):** t-build-16 is in neither t-int-7 nor t-int-8 (checked 12:47 PM ET); the packet says start after it
   lands. Ready list: protoStage.ts:67 PROTO_STAGE_ID, :70 HAND_STAGES '1-6', :387 default plan, :1405, :1481, :2296; w1Sections.ts:23,
   :335; its dotLinesData lines and dotTips.ts references (grep at the time); the dblPractice LV-3 test.
4b. **R-165.241 (done; 1-6 stills wait on t-build-16).** The engine says the sealed door's line with GuideOpts.lock: a must whatever
   its words (onGuide -> App -> DotGuide.engineLine -> engineGuideLine), said at once over a line still up. Root cause: the keeper's
   own door lines (1-5's "We missed some of her marks", 1-6's petals line) classify as info by their words, so her mark card held them;
   and the engine sent nothing while another line's time ran. The plate is drawn with the words in play (drawPopups), its bottom 70 px
   over his drawn head. sealedLine.test.ts 4/4 (planted: unmarked = info, the mark card holds the screen). DOOR stills: (DOOR).
5. **Full checks (GATES).**

## 2. Polish check
(POLISH)

## 3. Pushback
- The packet's "belowY/aboveY" would have changed flat stages: belowY also waits for him to be grounded (4-7's mist rule), so a tip
  crossed mid-jump would fire later. Built a separate `band` (feet, in the air or not) and proved flat frames unchanged.
- Bands without the stitcher's seams: in a tower a section's seams are the storey under (turn ledge, catches).

## 4. Suggestions (ready packets)
- CLAUDE.md Checks: add `npx tsx tools/engine/tipwalk.ts --layouts 4` and tools/engine/tipwalk.test.ts to the tool-test line (the lead's
  file; gates.yml already runs both).
- R-165.238 as above, the moment t-build-16 is integrated; then re-run tipwalk (1-6's tower joins it by itself).

## 5. Unresolved
- R-165.238 not started (above). 1-6 door stills wait on t-build-16.

## 6. Method update
- A clip harness must never hold `invincibleTimer`: Dot holds every teach line while he is in post-hurt invincibility, so the bubble
  never showed (cost 3 reshoots). Set difficulty with setDifficulty in headless tools, never localStorage (RealPlay built Normal).
- Frame-stepped clips with the game paused never show Dot (her queue runs with the game): judge teach clips in real time.

## 7. Turnover note
engine-core.md section 0t and planner.md's verdict table (tip reach) rewritten: commit 3155bd5d.
