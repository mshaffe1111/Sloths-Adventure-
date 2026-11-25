# ENG-29 PUSHBACK (session 3): a red outside the base set, so the gates STOPPED

The gates on the frozen head 39cd60123 show one red that is not pacerLay {8, 22, 23}:
src/game/gen2/listed.test.ts:52 'nothing in the game calls withTestStage: tests only' fails on src/game/gen2/worlds/w2TempoToy.ts
(session 2's commit 1f919f98e). The file does not call withTestStage; two doc comments name it (:6, :18), and the rule is a text scan.
The fix is in the file, not the rule: reword the two comments. It is comment-only, so nothing laid, rolled or bundled can move.
The lead's call: who makes the fix and which re-runs it needs. The REPORT's EXACT NEXT STEP item 0 has the fix in full.
