# ENG-W2FALL REPORT (Engine, rule 26: the piece 2-8's build found missing). Started 9:09 AM ET (from the session hook date).

## EXACT NEXT STEP (code head db2947730 on t-eng-w2fall, cut from cc06d2f90 on t-build-28-wip)
DONE:
1. THE PIECE (db2947730): src/game/gen2/fallPaint.ts FALL_PAINT, ONE definition of what a world's pit painter lays under an open fall
   ('w1Pits': no river, unchanged; 'splashRivers': soft -> splash-back river, water -> deep river). WorldManifest.pitPainter is now
   `PitPainter` (types.ts). World 2's manifest declares 'splashRivers' (worlds/w2.ts); w2Finish reads the same table for which falls get
   water and which are safe (behaviour identical: soft/water before, the same now). dropsOf (pipeline.ts): a soft fall with no river and no
   ground under it, on a painter that lays a safe river there, is putback / take-off / safe-water-art (before the soft-zone line).
   floorlessGaps (promises11.ts): a gap whose every open slot is covered by safe-water-art drops and the pieces over it is wet (a run of
   plank-joined soft falls is ONE gap to findW1Pits and ONE river to the finish).
2. TOYS (worlds/w2FallPaint.test.ts, 4 tests): PASS 4/4. On cc06d2f90 code (test written first): RED 3 of 4 (the declaration, the
   safe-water-art judge, the one-definition test). Plants: floorlessGaps' `!painted(q)` removed -> test 2 RED; dropsOf's safe-river line
   off -> tests 2 and 4 RED. Declaration removed (painter {}): void-dark + unmarked (test 3).
3. 2-8 ROLL on frozen db2947730 (libstage --stage 2-8 --seeds 40): CLEAN 40 of 40 on BOTH settings (was 0/40), thrown 0, seconds
   241.3-251.3.
NEXT, in order:
a. ReadNotifications. Gates on the frozen candidate (scratchpad cand): lockall --check against lock-base.json (recorded on frozen
   cc06d2f90), counts, name every verdict-only change, no layout may move; CI tool line; generalitycheck; suite 6 shards (scratchpad
   shards.sh), each total, reds checked against cc06d2f90.
b. Send the hash and each shard's totals to the lead.
