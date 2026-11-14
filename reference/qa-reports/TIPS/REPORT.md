# DRAFT (in progress: gates and clips running) TIPS (R-165.236, R-165.241; R-165.238 not started): REPORT, branch t-tips from t-int-8@0a9be28c
Method used: methods/stage-fix.md (planted failure first), gates.md; the engine card's day one (lock saved on the base first).
Lessons applied: D19 (gate and bot call the engine's code; the bot passes `lock`), D21 (the gate finds every vertical stage), D43 (no
stage id in engine code), D50/D63 (default setting, Dot's real bubble), D59, D62 (BUILT; built/asked mismatch fails), D64, D67, D69.

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
3. **Clips (done).** clips/{before,after}-{normal,easy}-{up,side}.mp4 (real time, the default setting, Dot's own bubble, a reader who
   taps each card at 2 s; tipsclip.mjs; BUILT normal/easy printed). Caption names each tip as it fires (band, feet; fired.json).
   Before (base): all four fire in 1.5-2.8 s on the start floor ("Creaky limbs..." card +3/+4); the pods line is up at the creak bough;
   nothing at the fig gate. After: nothing fires on the floor; "Creaky limbs..." fires at the creak bough (feet 10187 in 9881..10404,
   12.6 s) and is Dot's card there; "Climb under the figs..." fires at the fig gate's foot (17.8 s) and is her card there. Same on
   Easy and sideways. Stills: clips/*-{1-floor,2-creak,3-figs}.jpg.
4. **R-165.238 (NOT STARTED):** t-build-16 is in neither t-int-7 nor t-int-8 (checked 12:47 PM ET); the packet says start after it
   lands. Ready list: protoStage.ts:67 PROTO_STAGE_ID, :70 HAND_STAGES '1-6', :387 default plan, :1405, :1481, :2296; w1Sections.ts:23,
   :335; its dotLinesData lines and dotTips.ts references (grep at the time); the dblPractice LV-3 test.
4b. **R-165.241 (done; 1-6 stills wait on t-build-16).** The engine says the sealed door's line with GuideOpts.lock: a must whatever
   its words (onGuide -> App -> DotGuide.engineLine -> engineGuideLine), said at once over a line still up. Root cause: the keeper's
   own door lines (1-5's "We missed some of her marks", 1-6's petals line) classify as info by their words, so her mark card held them;
   and the engine sent nothing while another line's time ran. The plate is drawn with the words in play (drawPopups), its bottom 70 px
   over his drawn head. sealedLine.test.ts 4/4 (planted: unmarked = info, the mark card holds the screen). Real page (doorshot.mjs,
   Normal default, walked into the shut door): before, 1-5's line never showed in 4 s (a find line "She squashed this one extra flat."
   held the bubble) and the plate sat behind Pokey reading "more"; after, the sealed line is up at 1.5 s on 1-2 and 1-5, both ways (the
   other line waits, +1), and "13 more" / "66 more" hang clear over his head. door/*.jpg, door/*.log.
5. **Full checks (GATES).**

## 2. Polish check
- clips/after-*-2-creak.jpg, -3-figs.jpg: Dot's card beside him on the bough/foot, readable both ways; nothing covers him. Fixed on
  the way: the clip harness froze Dot (paused frame-stepping) and then hid her (held invincibility): reshot real time.
- door/after-*.jpg: the plate reads in full over the gate, Pokey solid in front of the door, the card at the top. Fixed: the plate drew
  every frame off screen once moved to the words pass: culled like the door.
- Seen, unchanged by this work: Easy's find hint ("One of these plants isn't like the others") is up on 1-4's start floor.

## 3. Pushback
- The packet's "belowY/aboveY" would have changed flat stages: belowY also waits for him to be grounded (4-7's mist rule), so a tip
  crossed mid-jump would fire later. Built a separate `band` (feet, in the air or not) and proved flat frames unchanged.
- Bands leave out the stitcher's seams (in a tower they are the storey under).

## 4. Suggestions (ready packets)
- CLAUDE.md Checks: add `npx tsx tools/engine/tipwalk.ts --layouts 4` and tools/engine/tipwalk.test.ts to the tool-test line (the lead's
  file; gates.yml already runs both).
- methods/gates.md (the Critic's): a tipwalk row (catches a tip said a storey early; read a MISS by its tip, band and feet).

## 5. Unresolved
- R-165.238 not started (above); then re-run tipwalk (1-6's tower joins by itself) and shoot 1-6's door. (GATES)

## 6. Method update
- Clips of Dot: real time (paused frame-stepping freezes her queue), never hold `invincibleTimer` (she holds lines while he is hurt-
  invincible; 3 reshoots). Headless tools set the setting with setDifficulty, never localStorage (RealPlay built Normal for Easy).

## 7. Turnover note
engine-core.md section 0t and planner.md's verdict table (tip reach) rewritten: commit 3155bd5d. Context at report: ~25% of 1M.
