# 2-8 node string -> World 2 gen2 pieces (BUILD-28 session 12, a read-only map at 7ea5d5f3e; facts with file:line, to re-check before use)
Every World 2 brick is `own: true, feel: [STAGE_xx]` (served to its own stage only: w2Arc23.ts:158, w2Arc27.ts:121); its lay is private.
- A: similar 2-3 w2-23-marsh (w2Arc23.ts:264, lay :167); 2-7 w2-27-jetty (w2Arc27.ts:187, :129).
- Pg1+:+cage: similar 2-3 w2-23-first-cage (w2Arc23.ts:265, :172); cage socket cage(id,on,t,critter,dn) (:129), role 'objective' (pipeline.ts:3720-3726). MISMATCH: `:+cage` parses as a FIND named 'cage' (nodeCode.ts:107); nodeAsks.ts:171 wants a find socket 'cage', but cages are objective sockets.
- Tw1:#soft@flood: MISSING as a section; data RiverRow.flood 'rise' (riverLay.ts:52), on rivers laid by place 'river' only (:124, :140); nodeAsks.ts:175 reports any `#kind@clock` as a miss.
- Pp1+:+cage: similar 2-3 w2-23-parade (w2Arc23.ts:267, :184, PADS_23.parade23 :135); 2-2 pad bricks (w2Arc22.ts:239-247); rows W2_PADS (w2.ts:266).
- Xf1+:+cage: similar 2-7 w2-27-porches (w2Arc27.ts:190, :146); deep water = a 'water' gap, W2_TIPS.water (w2.ts:86). No reed-island-with-cage brick.
- R x3: 2-3 w2-23-rest (w2Arc23.ts:273, find :259); 2-7 w2-27-rest (w2Arc27.ts:199).
- Uc1^: MISSING (no carved-steps brick; 2-6 through-house uses a ladder vine, w2Arc26.ts:113, which 2-8.md forbids).
- /L: legs.ts:20 (parse), :162 reflectLeg; proven by ARC_27 (w2Arc27.ts:34), HOME_CODE (toyHome.ts:56).
- Kg1>:#water@flood and Kg1>: MISSING (no World 2 'pressure' section; only w1Arc18.ts:217-220).
- F[Pf1+|Pw1]: w2TwoRoad (w2.ts:224), W2_FORK (:190), W2_FORK_RIVERS (:222), W2_FLOOD (:156); needs a section with job 'fork' (pipeline.ts:2327). PROBABLY BLOCKING: a fork road carrying any mark (f/w content, move 1) throws (pipeline.ts:613-614).
- Sg1<: similar 2-3 w2-23-home boardwalk (w2Arc23.ts:272, :251); water 10 px under the boards = FLOOD_PADDLE (floodLay.ts:21).
- E: similar w2-23-gate (w2Arc23.ts:277), w2-27-home-jetty (w2Arc27.ts:203).
NO 2-8 KIT: STAGE_TABLE has no '2-8' (stageTable.ts:32-81; kit type :19); KITS/WORLD no 'w2-28' (listed.ts:45, :51); w2Manifest briefs {} (w2.ts:342); fork/flood kits are toys '2-96' only.
LAYFLOOD NEEDS (floodLay.ts): brief.flood (types.ts:765; pipeline.ts:4301-4303); a river with floodMark (:56-57); a 'cage' collectible, the last met starts the clock (:58-60); the close river after the last cage (:79); the high road and its verdicts (:84, :94, :97); a marsh laid right-to-left throws (riverLay.ts:148); followers from the kit's finish (w2Arc23.ts:303).
HAND BUILD (new replaces old), 2-8.md's lines MOVED: W2_STAGES '2-8' w2Stages.ts:34; CAGES_28 :39; W2_PUZZLES :51; floodBasin :638-674 (:663 the stop); cageRoom :805; targetCount :990; engine drain engine.ts:1988-2011; w2Puzzles.test :34-88, :91, :171, :198/:204; w2Stages.test PLANS :21, :68; stagePlan.ts:87; also w2Sections.ts '2-8' (:21, :90, :109, :285-354); unchanged: puzzleCamera.test:20, w1NewArt.test:92, finds.ts:416; others: levelSeeds.ts:24, stageSheets.ts:92, pokeyJournal.ts:67, writtenKeys.test.ts:37.
