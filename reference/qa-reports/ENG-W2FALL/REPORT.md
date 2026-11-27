# ENG-W2FALL REPORT (Engine, rule 26: the piece 2-8's build found missing). Started 9:09 AM ET (from the session hook date).

## EXACT NEXT STEP: LANDED (code head db2947730 on t-eng-w2fall, cut from cc06d2f90 on t-build-28-wip)
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
4. TYPE (ACCEPTED by the lead): WorldManifest.pitPainter widened from 'w1Pits' to PitPainter ('w1Pits' | 'splashRivers', fallPaint.ts).
5. LOCK on frozen db2947730 (lockall --layouts 16 --check, ONE run, against a lock recorded on frozen cc06d2f90): 101/102 stages
   unchanged; 2-8 moved: on cc06d2f90 all 32 of its builds THREW ("no seed of 24 from N builds cleanly (the first: verdict
   drop.look-lies ...)"), now they build. No other layout moved.
6. VERDICT-ONLY changes (lockall strips verdicts and drops; scratchpad verdictdump.mts, the same 3264 builds on both trees): 3232
   identical in drops AND verdicts; the 32 that differ are 2-8's (threw on base). NONE elsewhere: no World 1, no other World 2 stage.
7. generalitycheck PASS (26 literals, 26 known). CI tool line: 437 tests, 435 pass, 1 fail, 1 todo: the fail is registrycheck.test
   "every stage-table stage registered" = INHERITED (red on frozen cc06d2f90 too: 2-8 has no proven seed list yet, BUILD-28's item).
8. SUITE, 6 shards on frozen db2947730 (scratchpad shards.sh; 657 files): shard 0 743 tests / 741 pass / 1 fail / 1 todo; shard 1 625 /
   623 / 1 / 1; shard 2 610 / 609 / 1 / 0; shard 3 731 / 731 / 0 / 0; shard 4 740 / 739 / 1 / 0; shard 5 780 / 778 / 1 / 1. The toy
   w2FallPaint.test ran in shard 0: 4/4. EVERY red checked on frozen cc06d2f90, every one red there too:
   - groundwork.test "goals: every hand-built stage of Worlds 1-4 ... Matt's band" ('5 stages checked'): identical, INHERITED.
   - puzzleCamera.test "every puzzle room in Worlds 1 and 2 and the kit test room ..." ('30 moments checked'): identical, INHERITED.
   - artUse.test "every packed piece and art file is drawn": w2-new.json#cage-whole, w10alt.json#cage-b unused: identical, INHERITED.
   - firstTimerBot.test "5-9's Easy goal rests on the kid's runs": identical, INHERITED (5-9's lock and verdicts did not move).
   - stageSheets.test "every sheet a built stage draws is in its preload list": INHERITED, its REASON CHANGED: on cc06d2f90 2-8 THREW
     (no clean seed: drop.look-lies); now 2-8 builds and the next item shows: "2-8: STAGE_DRAWS lists more than it draws": STAGE_DRAWS['2-8']
     lists 'foe:goldsnake', the built 2-8 draws none (its roll has no cast). A 2-8 build item (its data), not engine: left to BUILD-28.
9. Turnover: reference/handoffs/engine-core.md §0zs-W2FALL.

## Pushback
- None on the piece. One note: the toy home (toyHome.ts, a World 2 toy run through w2Finish) declares no painter (it spreads upManifest),
  so its judges still read its open soft falls void-dark. Left unchanged so no toy verdict moved; a one-line `pitPainter: 'splashRivers'`
  there is a follow-up if the toy is ever judged.

## Learned / method update
- The verdicts run before a world's finish: anything a finish paints must be declared on the manifest where the judges read it.
- lockall strips verdicts and drops; a "verdict-only change" count needs a dump of both on both trees (scratchpad verdictdump.mts did it
  on the same 3264 builds in about 12 minutes). Worth a `--verdicts` flag on lockall itself (tools/engine is Engine's): a suggestion.

## Lessons applied
D115 (frozen, immutable worktrees for every run, proven/ writable), D119 (no heredoc in a commit chain), D128 (stamps from date), D134
(EXACT NEXT STEP pushed and confirmed with ls-remote before the hand-over), D135 (every red checked against the base, one whose reason
changed named as such), D140 (ReadNotifications at step boundaries), D141 (the CI tool line on the candidate).

NEXT: LANDED on t-eng-w2fall (code db2947730). The lead starts 2-8's next box on it (merge, no force) and ENG-CUT-b. Nothing left in
this packet. For BUILD-28: the stageSheets 2-8 goldsnake entry (item 8) and the registrycheck seed-list red (item 7) are its own items.
