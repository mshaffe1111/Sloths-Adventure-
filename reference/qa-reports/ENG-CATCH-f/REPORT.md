# ENG-CATCH-f: the down tower never lays a catch twice, no two pieces of wood overlap, and the named check refuses any that do; onto t-eng-w3 (R-165.561)

## EXACT NEXT STEP (box 8, ENG-CATCH-m: the trim's seam merged at its root; NOT frozen, NOT gated, NOT landed; R-165.561, R-165.573)
(written 9:08 PM ET Fri 11-27 by `TZ=America/New_York date`, at the hand-over; started 8:52 PM ET on 5a9af1813. t-eng-w3 = 7a580aefc by
`git ls-remote` at the start; **f7e76b765 at the hand-over: IT MOVED** (ENG-DROP's boxes 2-5: src/game/gen2/types.ts +6,
worlds/stageTable.ts +4, worlds/w3Noise.test.ts, and pipeline.ts +65/-? (this branch edits pipeline.ts too: check the merge there), `git diff --stat 7a580aefc f7e76b765 -- src tools`).)
DONE THIS BOX (on this branch's head, src diff vs 5a9af1813 = tower.ts, pipeline.ts, tower.test.ts only):
- RED FIRST: tower.test.ts "THE TRIM LEAVES NO SEAM" (the last test): ENG-CATCH-b's toy (the mend's catch trimmed off the storey 136-554
  at y 1256) and the 60 px gap (trimmed off 530-830 at y 1200): no two flush pieces (end meets start within 1 px), one top, one height,
  one kind, a catch among them, AT THE TRIM'S OWN CUT; and a creaking limb (another kind) never merged, its seam named. **RED on
  049a20abc's tower.ts** (worktree, the test with `trimSeams` stubbed): `'136-554 | 554-716 at y 1256'`, pass 0 fail 1. GREEN here.
- THE FIX (tower.ts mergeSeams, by construction, general): fit records each trimmed end that meets the piece it was cut at (`seams`); at
  the END of the lay, read as finally laid (the mend may move or trim either piece after the put), every seam still flush at one top
  whose piece is a catch's kind (solid, 24 px, branch, no other field: creak, crumbleAfter, quiet, bare, thick, hollow...; tag and
  drawX0/X1 ignored; a sealed piece never) is merged: the pieces become ONE catch spanning them, and `into` names the stage's own pieces
  it takes the place of. Another kind or another top keeps its seam, named in `trimSeams`. towerCatches' invariant reads the lay through
  `withoutMerged`. pipeline.ts: a catch with `into` GROWS the first stage piece in place (its id, section, storey kept) and takes any other
  out of `platforms` and its section's seam (the joinPitFloors pattern, pipeline.ts:1982/3253).
- THE PLANT: `return mergeSeams(...)` -> `return out` turns the new test RED (`'136-554 | 554-716 at y 1256'`, pass 0 fail 1).
- tower.test.ts WHOLE: 50/50 pass (three old toys now read the lay as the stage holds it, `held()`: the catch takes the place of the
  piece it merged with; the 60 px gap's pin changed from "470-530" to "470-830 into [3]", the trim's remnant merged; the lead should
  read that edit: the old pin WAS the seam). towerMend.test.ts + darkBots.test.ts WHOLE: 43 pass, **1 FAIL**: darkBots "a RUN off a lit
  edge in the dark whose touchdown lies within his slide of a sleeping rim ... (adult Normal roll 1: x 556, y 3672 onto x 673, y 3850)":
  `the edge x 556, y 3672 is a run-off stop (runOffRims)` fails: the merge changed the draft 3-1 roll 1's lay at the test's pinned edge.
  NOT TRACED. tsc 0. generality PASS (26 literals, 26 known).
- FINDING FOR THE LEAD (proof-m/seams.mts, base-14.txt, cand-14.txt): shipped 1-4 already holds **1180** flush same-top same-kind pairs
  over its 32 builds (layouts 1-16 x both settings, on 7a580aefc: the banks 0-640|640-1196 moss_stone, section branch runs, the tower's
  no-slot flush catches), and the bots cross them. So the brief's literal test (no flush pair anywhere in the final lay) is red on the
  base too and the trim's merge cannot green it; the test is scoped to THE TRIM'S OWN CUT. On 049a20abc 1-4 holds 1217: the trims ADD 38
  seam positions (40 pairs by piece name; e.g. 717-817|817-1157@8255, 930-1030|1030-1228@7422, 766-866|866-1118@5626, not each one
  checked as a remnant at its cut) and drop some (pieces the trims moved). See NEXT 2 for the fix's count.
NEXT, IN ORDER:
1. darkBots red, TRACED AS FAR AS (9:09 PM ET, proof-m/spot.mts `ROOT=<tree> npx --prefix <repo> tsx spot.mts`: draft 3-1 roll 1 Normal,
   the adult's first frame, wood in x 250-900, y 3550-3950, and runOffRims there): **roll 1 is a DIFFERENT STAGE after the merge**, not
   a local change at the edge. 049a20abc: 87:376-556@3672 | 18:444-673@3850 | 149:262-444@3850 | 88:684-864@3742 | 89:864-1052@3742 |
   17:818-938@3569; run-off 556,3672 -> 664,3850 (the test's). This tree: 90:257-437@3563 | 154:143-325@3741 | 18:325-539@3741 |
   91:569-931@3677 | 92:211-549@3919 | 19:549-788@3919; run-off 437,3563 -> 539,3741. Every height differs, so the roll as a whole moved:
   find why first (a guess to check, not a finding: the merge changed a down-tower lay's miss count, `left`, so `again`/`first` or a
   TowerRefusal flipped and the seed search drew another roll; or a grown stage piece changed a later leg's lay). Print, per towerCatches
   call on roll 1, before/after misses and any refusal on both trees. Then class it: the draft's pinned fixture moved (the test is
   rebuilt as a hand-built toy like lipToy, a REPLACEMENT the lead rules on) or an engine red. Do not re-pin a roll. Run the test alone on
   7a580aefc and 049a20abc (both green per box 7).
2. RUN ONCE THIS BOX (proof-m/fix-14.txt; compare seam POSITIONS, setting + layout + x@y, not piece names, which the merge renames):
   base 7a580aefc 1179 positions, 049a20abc 1217, this tree 1187. The trims ADDED 38 positions; **30 are GONE on this tree, 8 REMAIN**:
   easy 5 35@8275;easy 6 480@3662;easy 6 60@3662;easy 9 120@3325;easy 9 500@3325;normal 6 1158@3662;normal 6 124@5345;normal 6 786@3662;
   and the fix adds no position the trims did not (fix-only vs base = exactly those 8). NEXT: why each of the 8 stayed: named in
   trimSeams (another kind or top), or cut by a path other than fit (the mend's trimKeep trims the tower's own pieces back, tower.ts
   ~:689-708, and reLay moves them: a seam either makes is not in `seams`). The brief's job is the overlap trim (fit); if trimKeep makes
   them, ask the lead before widening the merge to it.
   PROBED (proof-m/why8.mts, the row of solid wood at each seam's y, as built on this tree):
   easy 6 @3662: 96:0-60 | 93:60-480 | 41:480-1100 (tag s17:foot); easy 9 @3325: 93:0-120 | 89:120-500 | 40:500-1120 (s17:foot);
   normal 6 @3662: 41:166-786 (s17:foot) | 93:786-1158 | 100:1158-1280; normal 6 @5345: 99:0-124 | 91:124-504; easy 5 @8275:
   97:0-35 | 92:35-415. So each is a catch meeting the stage's s17 `foot` piece and/or a short catch against the wall (x 0 or 1280:
   rule 1's run-on into the wall?). `trimSeams` reads only the LAST towerCatches call of a build: on normal 6 it names
   "the trim's 104-226 meets 226-446 at y -4008: another top (y -4007)" (box 7's 104-226@6227 under 226-446@6228: an another-top seam,
   named as built). Easy 6/9 and easy 5's last call named none, so their seams come from an EARLIER call (another column) or another path.
   DEBUG-PRINTED (a scratch copy of this tree's tower.ts with two console.error lines; proof-m/one.mts, 1-4 easy 6): **1-4's tower is
   an UP tower, one towerCatches call** (`CALL up false 43 3`: flow up, 43 pieces laid, 3 seams recorded), all 3 seams the catch's kind and
   merged (e.g. remnant 480-580 into 580-1100 at tower y -6854: as built, 41:480-1100, the s17 foot piece grown). The seams left at 480
   and 60 (93:60-480, 96:0-60) are NOT fit's cuts (no record): pieces laid flush against the trimmed piece by another rule of the lay
   (rule 1's run-on into the wall, or the no-slot flush). PUTS PRINTED (every put at tower y -6854, with its call site, same scratch copy):
   `PUT 60 480` from tower.ts:573 (rule 2: a BRIDGE laid from its anchor's end, flush with the anchor by design), `PUT 0 60` from :552
   (rule 1: a run-on into the wall from a piece's end), `PUT 480 1280` from :582 (up flow: an end run on to the wall at its height; fit
   trimmed it to 480-580 against 580-1100: THE recorded seam, merged). So the seams left are the lay's own bridge/run-on flush joins,
   the same family as base's 1179, made at new places because the trim changed the anchor. They are not the trim's output. **QUESTION
   FOR THE LEAD**: do the bridge (:573) and wall run-on (:552) joins merge into the piece they are laid from (the same mergeSeams, one
   more record at the put: a wider job, it would also move base's own seams on every tower stage), or does this job stop at fit's cut?
   Recommendation: stop at fit's cut (the brief's root, and the 30 of 38 it removes); trace whether the middle bot stops at any of the 8
   on castBots first (rows decide it, not opinion).
LESSONS APPLIED (LESSONS.md, the entries that bear on this job, searched in this box): D30 (every time pasted from `date`: one stamp
typed 3 min ahead was caught and corrected before the push, timecheck PASS on every push); D29 (run every test that pins a roll: the
darkBots roll-1 test caught the draft's whole-roll move); D23 (merge the latest base before judging: t-eng-w3 moved, so no gate result
here is final until the merge of f7e76b765); D55 (context in every message to the lead). Law 3: the brief's literal test was checked
against the base first (1179 seam positions shipped), and scoped to the trim's own cut.
   Then the brief's count: trims leaving a flush remnant of ANOTHER kind or top (trimSeams is reset per towerCatches call: accumulate it
   in the scan by wrapping towerCatches), every listed stage + draft 3-1 seeds 1-40 both settings; and how often `into` holds 2+ ids
   (the second stage piece is taken out of platforms and seams only: if it is a section's own PIECE, `pieces` still holds it: a red).
3. Merge t-eng-w3 f7e76b765 BY HASH (no rebase), name every conflict, then the brief's step 2 pre-freeze vs 7a580aefc, freeze, step 3.

## EXACT NEXT STEP (box 7, superseded by box 8 above)
(box 7, ENG-CATCH-l, engine, written 8:50 PM ET Fri 11-27 by `date`, at the hand-over; t-eng-w3 = 7a580aefc by `git ls-remote` at the start and 7a580aefc (unchanged) at the hand-over;
this branch's candidate = 049a20abc: 192a433ae + reference/ + darkBots.test.ts only (`git diff --stat 192a433ae 049a20abc -- src tools`))
NOT LANDED (the lead ruled A: 1-4 is SHIPPED; trace the castBots 1-4 PASS->FAIL rows, sort them into classes, land only after the
lead reads them). Candidate 049a20abc is frozen and every gate but the rows is green below (shard 1/6 752/753 + 1 todo, 0 fail).
1. FINISH THE TRACE (scratch tools, read-only: proof-l/trace/rescuetrace.mts `ROOT=<tree> [BOX=x0,x1,y0,y1] npx --prefix <repo> tsx
   rescuetrace.mts 1-4 middle <setting> <seed>`: each rescue's time, from where, the piece he last stood on, put back where; BOX prints
   the run's own wood in a box at its first frame. Each trace reproduces its castBots row exactly, so each is a second run.)
   - middle EASY 11: cand rescue 1 at 179.87 s from x 288, y 4307, on 120-800@4307, put at 734, 4588 (stuck: "in a dip 281 px deep",
     "a trunk beside him, the way on is 319 px down"). The wood at the spot is IDENTICAL on both trees (x 0-1300, y 4150-4700:
     0-120@4307 | 120-800@4307 | 636-844@4588 | 256-636@4628). The base bot stalled at the same spot (stuck x 355/283, "the way on is
     321 px down") and got down unrescued. THE RUNS PART at 36.000 s (proof-l/trace/path-e11-*.txt.gz), falling onto y 8255 near x 732:
     base lands on id 18 and walks on left (714.8, 705.9, 696.4); the candidate lands on id 91 (717-817@8255, the overlap trim's 100 px
     remnant) and STOPS DEAD at x 725.3. The whole stage's wood, base vs cand (proof-l/trace/wl-e11all-*.txt), differs ONLY by the three
     overlap trims, each leaving a 100 px remnant: 0-832@5289 -> 732-832@5289; 309-1280@6612 -> 309-409@6612; 0-817@8255 -> 717-817@8255.
     THE SAME CAUSE FAMILY AS NORMAL 6: he lands on a trim remnant and stops at its flush seam; the run is later by that pause and
     parts from there (the rescue at 179.87 s is downstream). Next: confirm the stop's cause (which bot read, frames 36.07-36.5 s).
   - middle NORMAL 15: cand rescue 1 at 98.30 s from x 1178, y 6139, on 1034-1280@6139, put at 1007, 5418 (stuck x 1036: "fell back
     down from here 8 times"). The wood at the spot IDENTICAL on both trees (x 250-1300, y 5850-6550).
     THE RUNS PART at 39.200 s (proof-l/trace/path-n15-*.txt.gz), falling onto y 7422 near x 945: base lands on id 21 and walks on
     (927.8, 918.9, 913.8); the candidate lands on id 86 (930-1030@7422, the trim's 100 px remnant of 0-1030@7422) and STOPS DEAD at
     x 938.3. The stage's wood differs only by the trims (996-1176@5698 -> 1054-1176@5698; 0-1030@7422 -> 930-1030@7422). THE SAME
     CAUSE FAMILY.
   - middle NORMAL 6: cand 4 rescues: 152.67 s from x 841, y 6228 (on 764-924@6228, stuck "in a dip 321 px deep, the way on is 320 px
     down") -> put 386, 6668; 157.80 s from x 99, y 6668 (on 0-112@6668) -> 849, 4644; 163.93 s and 177.03 s from x 1260, y 5907 (on
     1232-1280@5907; "fell back down from here 8 times" x 872/846/712) -> 264, 3943 and 712, 3662. THE TOWER MOVED WOOD HERE (x 0-1300,
     y 5550-7050, 25 pieces each): base 0-866@5626 + 166-766@5626 (overlapping) -> cand 166-766@5626 + 766-866@5626 (the 0-166 stretch
     at y 5626 is GONE); base 104-284@6227 -> cand 104-226@6227 (trimmed where it lay under 226-446@6228).
     NEITHER TRIM IS ON THE BASE ROUTE (rescuetrace STOOD=<y>, proof-l/trace/stood*): at y 5626 base stood on 0-866 one frame at x 792
     (110.30 s: the 766-866 part the candidate keeps) then 166-766 (110.57-110.97 s); the candidate the same, 766-866 (110.30-111.07 s)
     then 166-766 (111.10-111.47 s); neither ever stood on 104-284/104-226@6227. Both runs stood on 226-446@6228 from 79.10 s; base left
     it at 105.23 s, the candidate was back there and on 446-764 / 764-924@6228 at 133-152.63 s (fell back down), rescue 1 at 152.67 s.
     THE RUNS PART at 110.533 s (PATHF=<file> writes t x y grounded standingOn per frame; proof-l/trace/path-n6-*.txt.gz), falling onto
     y 5626 near x 773: base lands on id 34 at x 763.8 and walks on left (754.9, 745.4 ...); the candidate lands on id 99 (766-866@5626,
     the piece the overlap trim made) at x 769.1 and STOPS DEAD at x 766.8, the flush seam where 766-866 meets 166-766 at the same height
     (both branch, height 24 < WALL_H 50: no wall). The trim turned one piece (0-866) into two flush ones, and the middle bot stops at
     the seam; a player walks across. PROVISIONAL (ii): the route is fair (continuous wood), the bot read the flush seam as an end.
     He stands at the seam 0.5 s (110.6-111.07 s), then walks on along 166-766 (x 758 -> 666 by 111.47 s). Both runs then CLIMB at
     x 626 (x fixed, y falling): base from 111.13 s up to y 5434.9 (111.97 s), then left along y 5508 (x 506 -> 346, 112.3-113.0 s);
     the candidate 0.5 s later from 111.63 s up to y 5464.7 (112.30 s), then DROPS back to y 5596.7 (112.63 s) and is at x 546, y 5560
     at 112.97 s: a SECOND parting, his climb lost at 112.3-112.6 s. Next: what he holds and presses at 112.2-112.7 s on each tree (a
     timed piece, a creaking limb, a hop off the climb), and the frames 110.6-111.07 s (why he stops: which bot read: an edge stop, a lip, a dark/glow rim? `stuck` says "in a dip 321 px
     deep" later at x 852), then confirm (ii) or find an engine cause (a flush seam the engine treats as an end is an engine red).
     NOTE for the lead: if a flush seam the tower's trims make stops any bot, every trimmed overlap on every stage can do it: the fix is
     at the root (the trim merges flush same-height pieces, or the bots read flush pieces as one floor), never a re-pin.
   - CAUSE FAMILY (ALL 3 rows, two runs each: castBots + the trace): the overlap trim (no two pieces overlap) keeps a 100 px remnant
     flush with the piece it overlapped; the middle bot landing on the remnant stops dead at the flush seam (0.5 s on Normal 6), and the
     run parts from there. The wood stays continuous (a fair route for a player): (ii) as the class reads, BUT made by the tower on every
     trimmed overlap, so the lead rules where the root fix goes (the trim merging flush same-height pieces into one, or the bots reading
     flush pieces as one floor), never a re-pin. Still to do: which bot read stops him at the seam (frames just after each landing), and whether the 4
     FAIL->PASS rows share the family (trace each the same way), and the stills of each spot, both trees, upright.
   - FAIL->PASS child EASY 5 (one of the 4; the trace reproduces both rows: base 163.9 s, 1 rescue; cand 217.7 s, 0): the runs part at
     46.133 s, both on id 18 at y 8536: the candidate stops at x 667.2 (base walks on: 665.9, 656.4, 647.5). The same piece id on both
     trees; the wood at y 8536 (proof-l/trace/wood-ce5-*): base 0-777 + 77-677 (overlapping) + 777-1017; cand 77-677 + 677-777 (the trim's
     remnant) + 777-1017. He stops 10 px past the flush seam at x 677: THE SAME FAMILY, here turning a FAIL into a PASS. So the seam
     pause moves rows BOTH ways (a timing shift, no route lost on the 4 rows traced): the class reads (ii), made by the tower's trims.
   - Also say whether the 4 FAIL->PASS rows (child easy 5, child normal 10, expert normal 13, kid normal 16) share the cause family
     (trace each the same way).
   - Stills of each rescue spot, both trees, upright, looked at first (proof-j's shoot14.mjs, scratch-fixed in proof-l to wait for
     `__engine`: `<root> <port> <out> <label> <layout=seed> <setting> <x> <y>`; verify the layout argument is the castBots seed).
2. Message the lead the classes. LAND only after the lead reads them: fast-forward t-eng-w3 to this branch's head (049a20abc +
   reference/ only) if t-eng-w3 is still 7a580aefc; else merge BY HASH and run 3b of the ENG-CATCH-l brief. Check `git ls-remote`.

## Box 7 (ENG-CATCH-l, engine): the lip toy built and proven both ways on both trees; frozen; the gates
(started 8:24 PM ET Fri 11-27 by `date`; on 75ce21abc; npm ci and `git fetch --unshallow` as tracked tasks, both exit 0)
- THE TOY (darkBots.test.ts only; it REPLACES `lip8` and its two roll-8 tests, :559-585 on 192a433ae): `lipToy(noLipHold, inset)` on
  the draft's own engine (roll 1, child Easy, dotSetting). First frame: the stage's pieces are set aside for two of the toy's own: a floor
  five of his heights long whose right end is the rim, and a landing his height under it, a body's width past it, four heights long (ids
  past every stage piece's). One hand-built DarkRim (dark.ts:94) whose light sleeps (an id past every zone light's); `bot.glowRims =
  [rim]`, `bot.rimWatch = new RimWatch([rim])`; placeAt `inset` inside the rim at a full run (PHYS.maxRun, facing it); the route over the
  rim to the landing; the harness's own `watchRims()` once for the frame he is put there (that frame's step ran before the toy's pieces;
  without it the watch never saw him on the piece and no crossing counted). The light wakes (`e.glowWake.set`) the frame his stop is
  taken. `lipInset` runs it twice: a first pass from one of his heights in measures his stopping distance (the thumb's release lag,
  thumbify's `releaseLeft`, then the slide: 44.5 px from any start, measured from 30, 45 and 60 px in), and the lip pass starts him that
  far in less half the engine's stand-side (STAND_SIDE x his width / 2), so his stop leaves his middle past the end, still stood on the
  piece. Every number comes from the toy's pieces, his body and PHYS: no stage, seed, x or y literal.
  - Why a run-up does not do it: the stop is taken GLOW_NEAR (90 px) out and his stopping distance is 44.5 px: he stops short (0 of 61
    held frames past the end). Started at half a slide in, the release lag runs him off the piece at full speed, the stop still held:
    the R-165.580 slide-off in a toy (NOT chased: box 6's FINDINGS; the toy's 4-frame release lag at maxRun is a ready repro).
  - GREEN (the hold): `ok`, his stop taken, held with his middle past the end (past > 0), crossed >= 1, `unlit` []. RED (noLipHold):
    `ok`, unlit 1, naming the toy rim. Pair 2/2 on the candidate (25.5 s) AND on 7a580aefc (the test copied into a worktree; 2/2).
- PRE-FREEZE vs 7a580aefc (D168): `git diff --name-only 7a580aefc 049a20abc -- src tools` = darkBots.test.ts, pipeline.ts,
  tower.test.ts, tower.ts, towerMend.test.ts. tsc: clean. generalitycheck: PASS (68 engine files, 26 literals, 26 known). The suite on
  192a433ae (4184/4189) carries over for every file but darkBots.test.ts (D118: the diff 192a433ae..049a20abc in src tools is that file
  alone, 96 lines). darkBots.test.ts WHOLE on the candidate: tests 31, pass 31, fail 0, cancelled 0, skipped 0 (211.4 s; read the main tree,
  untouched while it ran, started before the freeze; shard 1/6 on the frozen head runs this file again)
- FREEZE: 049a20abc in a worktree, node_modules linked, `chattr -R +i src tools`, `chattr -i src/game/gen2/proven` (D115); the base
  7a580aefc likewise (its toy copy restored first). The lock stands (101/102, 1-4 the one move, R-165.573): src lay code unchanged since
  192a433ae (the diff above).
- GATES on the frozen 049a20abc:
  - shard 1/6 whole: tests 753, pass 752, fail 0, cancelled 0, skipped 0, todo 1 (634.6 s)
  - the CI tool line (gates.yml:157): tests 111, pass 110, fail 0, cancelled 0, skipped 0, todo 1 (284.6 s; the todo is the open chase
    row, `not ok 45 ... # TODO measured 1 of 3 (ENG-B4)`, a todo node does not count as a fail)
  - tierBots: tests 9, pass 9, fail 0, cancelled 0, skipped 0 (334.3 s)
  - `seedlist.ts 1-4 --check`: PASS (100 seeds, each clean on both settings; the verdicts refuse 0 of 100)
  - castBots 1-4, seeds 1-16, both settings, par 4, candidate AND 7a580aefc (both frozen; floor 100 s; proof-l/castcmp-14.txt):
    runs that hold 94 -> 95 of 144. adult easy 16->16, adult normal 16->16, child easy 6->7, child normal 3->4, expert normal 8->9,
    kid easy 14->14, kid normal 12->13, middle easy 11->10, middle normal 8->6. 7 ROWS MOVED (level.md rule 28: traced before green):
    PASS->FAIL 3: middle easy 11 (base 185.9 s | cand shrine rescued x1), middle normal 6 (213.4 s | rescued x4), middle normal 15
    (150.9 s | rescued x1). FAIL->PASS 4: child easy 5 (217.7 s), child normal 10 (241.6 s), expert normal 13 (169.3 s), kid normal 16
    (129.5 s). Under the floor 0 on both trees. The rows are the tower's 1-4 move (src vs 7a580aefc: pipeline.ts, tower.ts + tests),
    not the toy (a test file). Asked the lead: A) trace the 3 PASS->FAIL rows, then land; B) rule them the intended move, land now.
  - the normal-4 stills at y 10364, upright and sideways, both trees (looked at by me first; proof-l/stills-*): CLEAN on the candidate:
    the wood under Pokey meets end to end, the HUD clears the notch, Pokey reads on the vine, both orientations. On 7a580aefc the
    upright still shows a plank lying over the next in the row under him (x about 130 px), the overlap the tower removes: the shooter's
    near list reads base 854-1054@10364 + 996-1176@10363 (overlapping), cand 854-1054@10364 + 1054-1176@10363 (end to end). The
    scratch shooter crashed twice under load (`window.__engine is not a function`: it waited for `__play` alone); fixed to wait for both.
  - timecheck: PASS (349 commits, 14 files, 67 stamps). roadmapcheck: PASS.
- Proof files: proof-l/ (the runs' outputs, the toy copy, castcmp-14.txt, stills-*, trace/: the rescue traces and the wood lists).
- Commit 504dc4a7d's Claude-Session trailer names the lead's session by mistake; this box's session is session_01FhBbYP97yawW6qqsiQqgHm.
- Lessons applied: a gate calls the code the screen calls (the toy runs the real engine and the harness's own watch, D19); test the
  measuring tool first (the watch missed the toy's first frame until the harness's step was run for it, D15); every run reads a frozen
  worktree (D115); read the queue at every push (D57).
- Method update: a lip toy needs the bot's own stopping distance, and the bot's release lag makes it no constant to guess: measure it in
  a first pass of the same toy (it is deterministic: 44.5 px from three starts) and start the lip pass from it.

## Box 6's EXACT NEXT STEP (superseded by box 7's above: step 1, the toy, is DONE)
(box 6, ENG-CATCH-k, engine, written 8:20 PM ET Fri 11-27 by `date`; t-eng-w3 = 7a580aefc by `git ls-remote` at the start and at
the hand-over; this branch = b557b7c90 + reference/ only; darkBots.test.ts is UNCHANGED from 192a433ae, so nothing is half-built)
NOT LANDED. THE LEAD RULED A (message during box 6): the two roll-8 rows (darkBots.test.ts:559-585 on 192a433ae, `lip8` and its two tests)
are REPLACED by a TOY in the real engine, like box 22's shape toy (`shapeRead`, darkBots.test.ts:512-557). There is no real-row unit row
(the whole-stage dark bots already cover real rows). B (search other bots or rolls) is REFUSED: it rerolls for a case.
1. BUILD THE TOY (darkBots.test.ts only). Every number comes from the toy's own pieces: no stage, seed or stage literal.
   Hooks, read in this box:
   - Run `firstTimer(DRAFT, 1, { ...CAST_BOTS.child.easy!, noLipHold }, { cap: <short>, dotSetting: true, onFrame })`. On the first frame,
     as shapeRead does at :527-531: `sim.platforms.length = 0`, then push the toy pieces: a floor piece, and a landing piece below and
     past its rim.
   - Hand-build one DarkRim (dark.ts:94 `{ piece, dir, x, y, land, light, onto, drop }`) with `light = { id: <an id no stage light
     uses>, sleep: true }` (glowRimsOf keeps `light.sleep && light.id !== undefined`, firsttimer.ts:3624).
   - Put it in the bot's private caches: `bot.glowRims = [rim]` (firsttimer.ts:1393; glowWait reads it at :3629 and :3700) and
     `bot.rimWatch = new RimWatch([rim])` (built at :4807 from darkRims; the watch's step reads `e.glowWake.get(l.id)`, :4810).
   - Place the child on the floor, moving toward the rim: bot.placeAt (:592 shows the toy use), set his speed, and set the route
     (`bot.prog.pts` / `cur`, as shapeRead does at :532-536) to run over the rim, so his stop starts within GLOW_NEAR and the Easy slide
     carries his middle past the end while `e.standingOnId === rim.piece.id`.
   - The light wakes at a time the toy chooses: `e.glowWake.set(id, t)` from onFrame. Glow is read by glowGo (:3717-3727) and by the
     watch alike. Without a wake he gives up after GLOW_GIVEUP and goes unlit, so the cap or the wake must come before that.
   GREEN with the hold: frames with glowStop at the toy rim, grounded, `(p.x - rim.x) * rim.dir > 0` and standingOnId the rim's piece
   (past > 0); `litAhead(rimWatch.crossings, 'easy')` (or FTRun.dark.unlit) has no entry for the toy rim.
   RED with noLipHold: unlit 1 for the toy rim. The comment says why the real row was replaced: ENGINE.md:51 (a test pins properties,
   never x); R-165.573 (the tower's catch trims moved roll 8 off the lay); and proof-k (no child Easy roll 1-96 on the tower's lay holds
   an own-light lip the plant bites).
   Prove it both ways, on the candidate AND on 7a580aefc (copy the test into a 7a580aefc worktree; seconds). Then darkBots.test.ts
   WHOLE green on the candidate.
2. Then steps 2-4 of the ENG-CATCH-k brief, unchanged: the pre-freeze against 7a580aefc (`git diff --name-only 7a580aefc HEAD -- src
   tools` = pipeline.ts, tower.ts, tower.test.ts, towerMend.test.ts + darkBots.test.ts), `git ls-remote` t-eng-w3 (merge BY HASH if it
   moved), the freeze, the gates (shard 1/6 whole, or all 6 if merged; the CI tool line; tierBots; seedlist 1-4 --check; castBots 1-4
   both settings on both trees; the normal-4 stills at y 10364), and the landing.

## FINDINGS for R-165.580 (the lead opens an engine box AFTER the tower lands; NOT this box's fix)
- Roll 74 of draft 3-1, child Easy, on the candidate 192a433ae: an OWN-light rim (`the rim at x 514, y 4917 (right end of 247-514)`).
  WITH the hold on, he goes over it dark at 78.13 s ("with its landing dark (needs 1.6 s)"). His stop is held past the end from 78.07 s
  (x 516.9) for 2 frames. Then his slide carries him off the piece: at 78.13 s, x 535.3, grounded false, glowStop STILL SET.
  With noLipHold, the same crossing, unlit 1 (proof-k/plant-52-74-76.txt).
  So the hold lets go of nothing: the slide takes him off the piece while it is held. Either the stop starts too late for his Easy slide,
  or the engine lets a stopped Pokey slide off a ledge. R-165.580's first step, per the lead: a slide-off toy, red first on 7a580aefc.
- (Read-only, run before I read the ruling, which crossed with it: roll 74 on 7a580aefc behaves the same, 2 frames held, unlit 1
  (proof-k/plant-74-base-7a580aefc.txt). The lead notes a different lay proves nothing about the mechanism. The toy decides.)

## Box 6 (ENG-CATCH-k, engine): the re-pin by property, proven impossible on the tower's lay; the lead's ruling A; nothing landed
(started 8:01 PM ET Fri 11-27 by `date`; on b557b7c90; npm ci as a tracked task, exit 0)
- The property re-pin (proof-k/darkBots-property-draft.diff; NOT committed to the test): the FIRST child Easy roll where a dark stop is
  held at a rim, he is grounded with his middle past its end, and standingOnId is still the rim's piece; no x or y literal.
  - On 7a580aefc it finds roll 8 at `the rim at x 515, y 4375`, exactly box 22's pin. Held past the end 85 frames, unlit []; plant
    unlit 1 at 103.37 s. Pair 2/2, both at rolls 1-16 cap 110 (60 s) and at rolls 1-32 cap 400 (68 s) (proof-k/lip-base-*.txt).
  - On the candidate: rolls 1-16 cap 110 find NO roll, 0/2 (107 s). Rolls 1-32 cap 400 find roll 17, `x 672, y 9912`: green passes, the
    plant FAILS, planted unlit [] (1/2, 133 s; proof-k/lip-cand-*.txt).
- Why the plant misses: of the candidate's 18 lip moments in rolls 1-96 (whole runs, every run ends at the shrine; 17 rolls), 15 are RUN-OFF rims
  (rim.runOff: a lit edge, so going over it is no dark crossing of that rim; rolls 17 and 29 checked, planted unlit [],
  proof-k/plant-17-29.txt). The 3 own-light ones: roll 52 (the plant run diverges before the lip, no held frame, unlit []), roll 76
  (the plant drops the stop, no crossing, unlit []), and roll 74 (green ALSO unlit 1, the finding above). Scan:
  proof-k/scan-cand-1-32.txt, scan-cand-33-96.txt.
- B, checked before the ruling arrived: child Normal, middle Easy, kid Easy and adult Easy, rolls 1-32 each, whole runs: 0 own-light lip
  moments (proof-k/scan2-other-bots-1-32.txt, 128 runs).
- The scratch tools (read only, run from the scratchpad on a repo root): proof-k/lipscan.mts, lipscan2.mts, lipplant.mts.
- Not run this box: the toy, darkBots whole, the pre-freeze, the freeze, every gate, the landing. All are owed, on the toy's head.
- Fast gates on this reference-only head: tsc 0, knowncheck PASS, generality PASS. timecheck and roadmapcheck COULD NOT RUN: the clone is
  shallow, and `git fetch --unshallow` timed out at 100 s. The successor unshallows first (or CI runs both with fetch-depth 0).
- Lessons applied: ENGINE.md:51 (no x pin; the property and then the toy); D59 (each read-only run finished and recorded); D30 (stamps
  from `date`); law 22 (no bar lowered: when the property's plant missed, I did not widen the plant or drop it, I asked); law 3 (each
  claim proven by a run, with its file).
- Own miss: I ran two read-only checks (roll 74 on 7a580aefc, the B scan) after the lead's ruling had reached this session and before I
  read it. I did not call ReadNotifications between those waits as the brief says. Nothing was changed by them; it cost about 4 minutes.
- Polish check: no screen changed or judged (the stills are owed on the landing head).
- Learned: a pinned roll's moment can vanish from a new lay, and so can the CASE itself. On the tower's lay the lip case only shows on
  run-off rims, where the plant cannot bite. Before re-pinning a planted row by property, check that the PLANT bites on the found case,
  not only the green. Method update (level.md / gates.md, the lead's call): "a planted row whose real case is gone from the lay becomes
  a toy in the real engine (box 22's shapeRead precedent), never a search over rolls".

## Box 5's next step (superseded by box 6 above)

(box 5, ENG-CATCH-j, a TAIL, STOPPED ON A RED, written 7:50 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
NOT LANDED. The frozen candidate 192a433ae (code 9afeaf31c) fails 2 suite tests that pass on 7a580aefc: OURS, proven alone.
- src/game/gen2/darkBots.test.ts:578 (test at :576, "a dark stop holds at the lip ... child Easy roll 8, the rim at x 515, y 4375"):
  past=0, "the stop was held with his middle past the end". And :584 (test at :582, its noLipHold plant): unlit 0 !== 1.
- Alone (proof-j/dark8.txt): 7a580aefc 2/2 pass (16 s); frozen 192a433ae 0/2 (14 s).
- Why: the candidate trims 12 branch catches on draft 3-1 easy roll 8 and drops 1 (236 -> 235 solid). The trims start at y 1752
  (806-1180 -> 1077-1180), long before the rim. The wood at the rim (251-515 @ 4375, 137-531 and 531-815 @ 4497, 210-565 and
  658-861 @ 4778) is byte for byte the same (proof-j/3-1-easy8-wood.diff, all8.mts/near8.mts, read only). So the child's route
  changes upstream, and the pinned lip moment (his stop at 102.67 s, darkBots.test.ts:560) never happens. 3-1 is a draft, so
  the 102-stage lock never covered it.
- THE LEAD RULES (a tail writes no code): the fix is an engine packet that re-points these two rows to a roll where the lip case
  still happens on the new lay, with the same bar and plant (as 38e4892e did for noLevelRead), never a loosened bar
  (ENGINE.md:51: a test pins properties of a roll, not its x). Then that head goes through the freeze and the gates again.
- If the fix touches only darkBots.test.ts (no src/ or tools/ lay code), these carry over (D118): the suite's other shards
  2-6 (green) and the steps below that were not run.
NOT RUN this box (the red stopped the tail; all still owed, ALONE, each on the frozen tree of the next candidate):
  the CI tool line (gates.yml:157); tierBots; `seedlist.ts 1-4 --check`; castBots 1-4 both settings on the candidate AND on
  7a580aefc (`--seeds 1-16 --setting both --par 4 --rows <f>`, the bar runHolds castBots.ts:32; compare: proof-j/castcmp.py base.jsonl cand.jsonl <floor>); the
  normal-4 stills at y 10364, upright and sideways, both trees. Scratch tools ready in proof-j/: castcmp.py, shoot14.mjs (stills: <root> <port> <out> <label> 4 normal 1000 10364), near8/all8.mts.

## Box 5 (ENG-CATCH-j, a tail): the suite on the frozen tree; a red, proven ours; stopped before landing
(started 7:05 PM ET Fri 11-27 by `date`, on 192a433ae frozen; no code written)
- t-eng-w3 = 7a580aefc (`git ls-remote`, at the start and at the hand-over). Frozen worktree at 192a433ae: chattr +i on src/ and
  tools/, src/game/gen2/proven writable, `touch src/x`, `tools/x` and `src/game/gen2/x` -> "Operation not permitted"; `git diff
  --name-only 9afeaf31c 192a433ae -- src tools`: 0 files. A base worktree at 7a580aefc for the solo runs.
- THE SUITE, 6 shards (deploy.yml:38 glob, 3 at a time), verdict RED: 4189 tests, 4184 pass, 2 fail, 3 todo (proof-j/suite-totals.txt).
  1/6: 753, 750 pass, 2 fail, 1 todo (892 s). 2/6: 656/656 (996 s). 3/6: 749/749 (1170 s). 4/6: 685/685 (707 s).
  5/6: 725/725 (666 s). 6/6: 621, 619 pass, 0 fail, 2 todo (1236 s; its `not ok` is the TODO w1Arc19.test.ts:191, R-165.312).
  The 2 fails: darkBots.test.ts:578 and :584 (proof-j/shard1-reds.txt). Solo runs, OURS: 7a580aefc 2/2, frozen 0/2 (proof-j/dark8.txt).
  R-165.550 ctestPicker:78 (inherited, owned) did not fail in this run.
- Not run: the CI tool line, tierBots, seedlist 1-4, castBots, stills, landing (the red stops a tail; see the EXACT NEXT STEP).
- Lessons applied: D115 (frozen tree, chattr; each solo run in its own worktree), D59 (I waited for the suite past the box
  rather than stop with it running), D30 (stamps from `date`), D52 (cites checked last), ENGINE.md:51 (the fix is a re-point, not x).
- Polish check (box 5): no screen judged; the 1-4 stills are still owed, and the red stopped the box before them.
- Learned: the lock covers the 102 table stages, not the drafts. A lay change on a draft (3-1) shows up only in the suite's
  pinned-roll bots. A tail that freezes a lay change should run the draft-pinned tests (darkBots, w3*) FIRST, minutes, before the
  35-minute suite. Method update (dispatch-packet / gates.md): add "drafts the candidate's lay reaches: run their pinned-roll tests
  first, alone, on both trees".

## Box 4's EXACT NEXT STEP (superseded by the one above)
(box 4, ENG-CATCH-i, a TAIL, handed over, written 7:04 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
FROZEN CANDIDATE = code 9afeaf31c (frozen as 192a433ae: src/ and tools/ byte for byte 9afeaf31c's). The branch head after it
(origin/t-eng-catch-f, the hash in the lead message) adds docs only: engine-core.md §0zr-CATCH, lockbase-7a580aefc.json.gz, proof-i/,
this REPORT. So the gates' verdicts on 192a433ae carry to it (D118: no src/ or tools/ change). DONE: steps 1, 2, the LOCK (both runs)
and the turnover note. NOT DONE: the suite, the CI tool line, tierBots and the landing.
1. `git ls-remote origin refs/heads/t-eng-w3` must still be 7a580aefc; if it moved, stop and tell the lead.
2. Freeze 192a433ae in a detached worktree (dispatch-packet.md D115: chattr, src/game/gen2/proven writable), node_modules symlinked.
3. On the frozen tree, once each, with the verdict word and counts line: the CI tool line (gates.yml:157); the suite in 6 shards
   (deploy.yml:38, `--test-shard=i/6`, each shard's totals); `npx tsx --test tools/inspect/tierBots.test.ts`. Also, because 1-4
   moved and has a proven list (src/game/gen2/proven/seeds-1-4.ts): `npx tsx tools/engine/seedlist.ts 1-4 --check` (CI's
   seedlists job runs it; the packet's list did not name it). Every red: file:line, run ALONE on 7a580aefc (R-165.550 ctestPicker:78
   is inherited and owned: name it, do not fix it).
4. THE LOCK IS DONE, do not re-run it. Base on 7a580aefc: 3264 builds of 102 stages, 0 errors (lockbase-7a580aefc.json.gz). Check on
   the frozen tree: "lock: 101/102 stages unchanged"; 1-4 moved (platforms, collectibles, proto.dress), exit 1 without --intended.
   PROVEN by the overlap scan (proof-i/lockscan.mts builds as lockall does): the 14 moved builds (proof-i/moved-builds.txt) are EXACTLY
   the 14 of 32 whose old lay had same-height overlapping solid wood (55 pairs, 0 exact duplicates); the new lay: 0 pairs in 32.
   Re-check with `--intended 1-4` against the gz if the lead wants the exit 0 line.
5. Polish (box 2's ask; 1-4 is a shipped World 1 stage and its wood moved): one moved 1-4 build (e.g. normal 4: old 854-1054 over
   996-1176 at y 10364) still on a phone-sized screen, upright and sideways, where the trimmed plank meets wood end to end.
6. Land on t-eng-w3 by fast-forward (`git push origin <head>:refs/heads/t-eng-w3`, no force, no rebase), `git ls-remote` equal,
   message the lead the landed hash and every counts line.

## Box 4 (ENG-CATCH-i, a tail): freeze, the lock, the turnover note
(started 6:38 PM ET Fri 11-27 by `date`, on 192a433ae; no code written)
- t-eng-w3 = 7a580aefc (`git ls-remote`). Frozen worktree at 192a433ae: chattr on src/ and tools/, src/game/gen2/proven writable,
  `touch src/x` -> "Operation not permitted"; `git diff --name-only 9afeaf31c 192a433ae` outside this REPORT folder: 0 files.
- LOCK, two runs ALONE: base `lockall --layouts 16 --out` at 7a580aefc: "lock: wrote 3264 builds of 102 stages", 0 errors, 9m43s.
  Check on the frozen tree: "lock: 101/102 stages unchanged", "1-4: platforms, collectibles, proto.dress", 9m33s (proof-i/lock-check.txt).
  The move is box 2's rule at work on an up tower: old 55 overlap pairs in 14 of 32 builds, new 0 in 32; the moved set equals the
  overlap set (diff empty). New lays sometimes hold more pieces (easy 5: 93 -> 94 solid): a covered catch trimmed, box 2's design.
- Turnover note: reference/handoffs/engine-core.md §0zr-CATCH (the three invariants, downInvariant the one named check, TowerRefusal
  by misses[0].line at tower.ts:351, the proof commands), commit 93e8cb25d.
- Lessons applied: D115 (frozen tree, chattr), D118 (docs-only head carries the verdict), D119 (commits by -m), D30/D128 (stamps from
  `date`); the lock ALONE (nothing beside either run); a move called intended only with the scan's proof.
- Polish check (box 4): no screen judged; 1-4's wood moved, so the still in step 5 is owed before Matt sees it.
- Learned: box 2's overlap rule reaches up towers too (1-4), not only the down tower; the lock found it, the scan proved it.

## Box 3's EXACT NEXT STEP (superseded by the one above)
(box 3, ENG-CATCH-h, handed over, written 6:34 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
CANDIDATE = origin/t-eng-catch-f HEAD (the hash in the lead message). Its code is 9afeaf31c (box 3's named overlap check on box 2's
8ab05d35c; the commits after it are this REPORT folder only: the REPORT and proof-h/). Box 3's steps 1-3 DONE (below: the check, its
two tests and plant, the cost, the six-config proof, the overlap scan, the pre-freeze tests); step 4 (freeze, gates, land) NOT STARTED.
1. Re-check base: `git ls-remote origin refs/heads/t-eng-w3` must still be 7a580aefc. If it moved: merge it by hash, tsc + generality,
   and re-run the pre-freeze list whole (tower, towerMend, towerBots, legs, legsLay, camRepick, cameraFollow, worlds/w3, worlds/w3Noise:
   every test that imports tower.ts, by grep, plus w3Noise).
2. Freeze: `git worktree add --detach <scratch>/wt-frozen <CANDIDATE>` (dispatch-packet.md line 81 on the lead branch), node_modules
   symlinked; every gate below runs there.
3. The gates once on the frozen head, each with its verdict word and counts line: the CI tool line; the suite in 6 shards with
   totals; THE LOCK as two runs ALONE (nothing else running): `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/base.json`
   in a detached worktree at 7a580aefc, then `--layouts 16 --check <scratch>/base.json` on the frozen head. A stage that moves is
   EXPECTED only where its old lay laid wood twice (box 1) or laid wood over wood at one height (box 2): box 3's check refuses nothing
   new by construction (step 2's proof below: refusals byte for byte box 2's). Prove each move by proof-g/scan.mts (old tree against
   frozen head: a same-height overlap or duplicate in the old lay, gone in the new; point ROOT at each tree, and for another stage
   change its buildStage id), else send it to the lead. tierBots. Every red: file:line, run alone on 7a580aefc (R-165.550
   ctestPicker:78 is inherited and owned).
4. Land on t-eng-w3 by fast-forward (`git push origin <CANDIDATE>:refs/heads/t-eng-w3`, no force), `git ls-remote` equal, message
   the lead the landed hash and every counts line.

## Box 3 (ENG-CATCH-h): the tower's named check refuses any overlap
(started 6:14 PM ET Fri 11-27 by `date`, on a4f5a6474; the lead's ruling: no-overlap INTO downInvariant, the check every final lay
passes and the guarantee refuses on, so ANY path that leaves an overlap is refused by name, and plant THAT)
- THE CHECK (tower.ts): `woodOverlaps(platforms)` (exported): every two pieces of solid wood (type 'solid': the stage's own and the
  catches alike) at one height (|dy| <= 1) that overlap strictly along x (end to end is none), each by name: "tower: two pieces of
  solid wood overlap at one height: x A-B and x C-D at y Y". Box 2's definition and scan.mts's, exactly. downInvariant lists these
  FIRST (DownMiss.what 'overlap', no piece), so (a) the guarantee's refusal (misses[0]) names the overlap whenever a lay has one, (b) the
  mend never keeps a remedy that lays one (it would not leave fewer misses), (c) the mend tries no remedy on it (no piece: it is the
  roll's to answer). The type change: DownMiss.what gains 'overlap' (the lead's ruling names downInvariant's misses as the place; no
  consumer outside tower.ts reads `what`, by grep).
- TESTS (both new, tower.test.ts, RED FIRST: 47/49 before the check): "THE DOWN TOWER'S INVARIANT names any two pieces of solid wood that
  overlap at one height ..." (a 50 px overlap 1 px apart, and one wholly over another, named; end to end, 2 px apart, or a fragile piece,
  not); "THE GUARANTEE refuses by name a down tower that would leave two pieces of solid wood overlapping at one height ..." (a tower
  whose own wood overlaps: TowerRefusal, its miss the overlap's name exactly; and box 2's three toys (ENG-CATCH-b's, the 50 px gap, the
  60 px gap) return lays the invariant reads clean). With the check: 49/49.
- PLANT (the lead's): box 2's `cut` filter removed (fit lays a partly overlapping piece whole, taking only the laid pieces inside it)
  -> tower.test.ts 47/49 RED: both box 2's trim-or-refuse test and the new guarantee test throw TowerRefusal "tower: unmendable miss:
  tower: two pieces of solid wood overlap at one height: x 475-590 and x 525-825 at y 1200": the invariant names the overlap and the
  roll is refused. Restored -> 49/49.
- COST (it runs on every lay and every try of the mend): woodOverlaps alone, measured directly: 13.7 us per call on a whole drafted 3-1's wood (avg 168 pieces, seeds 1-5
  normal, 200 calls each; proof-h/bench.mts, old tree wt-old = a4f5a6474, new wt-try), about 3% of downInvariant's 0.49 ms. The same run's
  whole-call numbers (before 0.491 ms, after 0.670 ms) differ by more than the new check itself costs: the two were timed one after the
  other while nothing else ran, old first, so that gap is run order and JIT, not the check; read it as noise, NOT as the cost. (A
  tower's lay passes far fewer pieces than the whole stage, so per lay it is less.) An interleaved re-time would settle the totals.
- tsc 0; generalitycheck PASS (26 literals, 26 known).
- PROOF, box 1's command (box 1's proof/proof.mts unchanged; tree wt-try = 9afeaf31c with src/game/gen2/worlds/w3.ts = t-kit-w3a
  39a3c5b52's byte for byte; run in wt-try: `GEN2_DRAFT=3-1 ROOT=<wt-try> KEEP=<config> FROM=1 SEEDS=40 VERBOSE=1 npx tsx <proof.mts>`),
  seeds 1-40 x both settings; logs proof-h/*.txt; each against box 2's number:
  - all five: ok 80/80, leaks 0, refusals 6 in 6 builds, Normal's rolls refused 3 / tried 42 (7%), worst stage 1 (n11). Box 2: 3/42.
  - root-down: ok 80/80, leaks 0, refused 0 / tried 40 (0%). Box 2: 0/40.
  - two-roots: ok 80/80, leaks 0, refused 0 / tried 40 (0%). Box 2: 0/40.
  - cap-down: ok 80/80, leaks 0, refused 1 / tried 40 (3%), worst stage 1 (n3). Box 2: 1/40.
  - cap-steps: ok 80/80, leaks 0, refused 1 / tried 41 (2%), worst stage 1 (n33). Box 2: 1/41.
  - shelf-hops: ok 80/80, leaks 0, refused 3 / tried 43 (7%), worst stage 1 (n13). Box 2: 3/43.
  Every log is byte for byte box 2's (`diff proof-g/<c>.txt proof-h/<c>.txt`: no difference, all six). 0 THROW in every log. As
  expected by construction: nothing new to refuse.
- THE OVERLAP SCAN (proof-g/scan.mts, the five pieces, seeds 1-40 x both, wt-try): 0 pairs in 0 of 80 built stages (proof-h/scan-h.txt), 0 throws; box 2: 0 in 80.
- PRE-FREEZE on 9afeaf31c, each file WHOLE: tower.test.ts 49/49; towerMend 13/13; towerBots 9/9; legs 7/7; legsLay 10/10; camRepick
  8/8; cameraFollow 14/14; worlds/w3.test 10/10; worlds/w3Noise 7/7 (every test that imports tower.ts, by grep, plus w3Noise): 127/127,
  0 fail. tsc 0; generalitycheck PASS (26/26).
  `git ls-remote origin refs/heads/t-eng-w3` = 7a580aefc.
- Learned: a check the lay keeps by construction still belongs in the named invariant: the plant shows the invariant alone turns a
  broken lay path into a refusal by name, so no future path (the move paths included, which no toy reaches) can ship an overlap.
- Box 3's lessons applied: D30/D128 (every stamp from `date`), D115 (each run in its own worktree: wt-try for the proof, wt-old for
  the cost), D119 (commit by -m, no heredoc), D154 (by construction, proven on seeds 1-40 x both, all six configs, plus the scan),
  D156 (generality with tsc), D159 (the base by hash).

- Polish check (box 3): engine only; no lay changed (every proof log byte for byte box 2's, scan 0 in 80), so no screen changed and
  no still was taken. Box 2's ask stands for the freeze box: one moved 3-1 seed on a phone-sized screen, upright and sideways, where a
  trimmed catch meets other wood end to end.
- Pushback: none. The packet's one type change (DownMiss.what gains 'overlap') is the Architect's wall; it is inside tower.ts and the
  lead's ruling names downInvariant's misses as the place, so it was made and is named here.
- Unresolved: step 4 (freeze, gates, lock, tierBots, land) NOT STARTED (the box ran out); the turnover note reference/handoffs/
  engine-core.md not rewritten (the landing box writes it with the landed hash).
- Method update: a check kept by construction still gets its named invariant, planted by breaking the construction (here box 2's `cut`
  filter) so the invariant alone is shown to refuse the roll by name.

## Box 2's EXACT NEXT STEP (superseded by the one above)
(box 2, ENG-CATCH-g, handed over, written 6:11 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
CANDIDATE = origin/t-eng-catch-f HEAD (the hash in the lead message). Its code is 8ab05d35c (box 2's overlap rule on box 1's 056b22736;
the commits after it are this REPORT folder only: the REPORT and proof-g/). Box 2's steps 1-3 DONE (below: the rule, its two tests and plants, the six-config proof,
the overlap scan, the pre-freeze tests); step 4 (freeze, gates, land) NOT STARTED.
1. Re-check base: `git ls-remote origin refs/heads/t-eng-w3` must still be 7a580aefc. If it moved: merge it by hash, tsc + generality,
   and re-run box 1's pre-freeze list whole (tower, towerMend, towerBots, legs, legsLay, camRepick, cameraFollow, worlds/w3,
   worlds/w3Noise).
2. Freeze: `git worktree add --detach <scratch>/wt-frozen <CANDIDATE>` (dispatch-packet.md line 81 on the lead branch), node_modules
   symlinked; every gate below runs there.
3. The gates once on the frozen head, each with its verdict word and counts line: the CI tool line; the suite in 6 shards with
   totals; THE LOCK as two runs ALONE (nothing else running): `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/base.json`
   in a detached worktree at 7a580aefc, then `--layouts 16 --check <scratch>/base.json` on the frozen head. A stage that moves is
   EXPECTED only where its old lay laid wood twice (box 1) or laid wood over wood at one height (box 2; going up too, the same `put`):
   prove each move by comparing the two lays' catches (a same-height overlap or duplicate in the old lay, gone in the new), else send
   it to the lead (the tool: proof-g/scan.mts reads the invariant itself, every same-height overlapping pair of solid wood in a
   built stage; it builds 3-1 with the five pieces: point ROOT at each tree, and for another stage change its buildStage id). tierBots. Every red: file:line, run alone on 7a580aefc (R-165.550 ctestPicker:78 is inherited and owned).
4. Land on t-eng-w3 by fast-forward (`git push origin <CANDIDATE>:refs/heads/t-eng-w3`, no force), `git ls-remote` equal, message
   the lead the landed hash and every counts line.

## Box 2 (ENG-CATCH-g): no two catches overlap at one height (the lead's ruling: fixed BEFORE the freeze)
- SCOPE, MY CALL (said first to the lead; reversible, one filter, `cut` in `fit`): the rule reads every solid wood at the height,
  the stage's own too, not only other catches: the toy's catch lay 18 px over the storey as well, and the scan found 102 of the 303
  old overlaps were catches over the stage's own logs, the same rough spot (an end cap mid-plank).
- THE RULE (tower.ts layCatches `overlaps` / `fit`, general: no stage id, seed or x): wood is never laid across solid wood at its height
  (|dy| <= 1, strict overlap). `put`: a piece wholly over laid pieces TAKES THEIR PLACE (they leave `laid`, `out`, `served`, `all`; the
  mend's keep puts them back, at their own indices, when it undoes the lay); a piece that only partly overlaps wood (laid or the
  stage's own) is TRIMMED to the open span under the fall line it serves, MEND.trim (60) px of it at the least, else REFUSED BY NAME
  (`overlapRefused`, exported, cleared per towerCatches: "overlap: a-b at y Y lies over ... and no open span of 60 px is left under its
  fall line x X"). Moves never land on other wood: the mend's remedy 1 (keep with k) refuses by name ("overlap: a move to ..."),
  trimKeep's trim steps and reLay's candidates skip any overlap (box 1's `already` there, wholly-on only, is now any overlap). A piece
  with no overlap is laid exactly as before (its span is not re-read against its fall line). The lay's loop skips the end of a piece
  another has since taken the place of. Going up uses the same `put`, so the rule holds there too.
- The toy (ENG-CATCH-b's, tower.test.ts): box 1 laid 654-716, 716-1033, 536-716 at y 1256 (536-716 over 654-716 AND 18 px over the
  storey 136-554). Now: 716-1033, 554-716 (the wide catch took 654-716's place and was trimmed off the storey; the shelf's end still
  caught under its fall line 626; no blind drop).
- TESTS (both new, tower.test.ts): "no two catches overlap at one height ..." (the toy) and "a catch that only partly overlaps wood at
  its height is trimmed to the open span under its fall line, or REFUSED by name ..." (a shelf's fall line x 500 over two pieces at
  y 1200: a 50 px gap -> every bough over it refused by name, the end caught lower at 410-590 y 1287, no blind drop; a 60 px gap ->
  the bough trimmed to 470-530, none refused).
- PLANTS: (1) `overlaps` made to find nothing -> the toy test RED (45/46: 654-716, 716-1033, 536-716 back); restored 46/46.
  (2) `fit` made to lay an unfittable piece whole instead of refusing it -> the trim-or-refuse test RED (46/47: 475-590 laid over
  525-825); restored 47/47. NOT PLANTED: the move path's refusal (keep with k, reLay, trimKeep): no toy found in this box that makes
  the mend move a piece over wood; it is named here, and the overlap scan below reads the real lays for any overlap.
- tsc 0 and generalitycheck PASS (26 literals, 26 known) after each step.
- PROOF, exactly as box 1 ran it (box 1's proof/proof.mts unchanged; tree wt-try = 0e2c5baf3 (its tower.ts = 8ab05d35c's; only tower.test.ts differs) with
  src/game/gen2/worlds/w3.ts = t-kit-w3a 39a3c5b52's byte for byte; run in wt-try:
  `GEN2_DRAFT=3-1 ROOT=<wt-try> KEEP=<config> FROM=1 SEEDS=40 VERBOSE=1 npx tsx <proof.mts>`), seeds 1-40 x both settings; logs
  proof-g/*.txt; each against box 1's number:
  - all five: ok 80/80, leaks 0, refusals 6 in 6 builds, Normal's rolls refused 3 / tried 42 (7%), worst stage 1 (n11). Box 1: 3/42.
  - root-down: ok 80/80, leaks 0, refused 0 / tried 40 (0%). Box 1: 0/40.
  - two-roots: ok 80/80, leaks 0, refused 0 / tried 40 (0%). Box 1: 0/40.
  - cap-down: ok 80/80, leaks 0, refused 1 / tried 40 (3%), worst stage 1 (n3). Box 1: 1/40.
  - cap-steps: ok 80/80, leaks 0, refused 1 / tried 41 (2%), worst stage 1 (n33). Box 1: 1/41.
  - shelf-hops: ok 80/80, leaks 0, refused 3 / tried 43 (7%), worst stage 1 (n13). Box 1: 3/43.
  Every log's named refusals are byte for byte box 1's (diff of each log after its first line: no difference).
  0 THROW in every log. No config worse than box 1.
- THE OVERLAP SCAN (proof-g/scan.mts: every built 3-1, the five pieces, seeds 1-40 x both: pairs of solid wood at one height,
  |dy| <= 1, that overlap): box 1's code (wt-old = 89fd5e401 + the kit's w3.ts): 303 pairs in 79 of 80 built stages (201 branch over
  branch, 102 log over branch; the tower's catches are laid as 'branch'). Box 2's code (wt-try): 0 pairs in 0 of 80. 0 throws either
  side. So the rough spot was on nearly every drafted 3-1, not only the toy, and the rule clears every one of them on the real lays.
  The same scan, pointed at a stage the lock moves, proves the move (step 3 below).
- PRE-FREEZE on 8ab05d35c, each file WHOLE: tower.test.ts 47/47; towerMend 13/13; towerBots 9/9; legs 7/7; legsLay 10/10; camRepick
  8/8; cameraFollow 14/14; worlds/w3.test 10/10; worlds/w3Noise 7/7 (every test that imports tower.ts, by grep, plus w3Noise). 0 fail.
  tsc 0; generalitycheck PASS (26/26). `git ls-remote origin refs/heads/t-eng-w3` = 7a580aefc.

## Box 1's EXACT NEXT STEP (superseded by the one above)
(box 1 handed over, written 5:50 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
CANDIDATE = origin/t-eng-catch-f HEAD (the hash in the lead message; the code is 056b22736 = 5330e490d's fix + t-eng-w3 7a580aefc merged;
the commits after it are this REPORT only). Steps 1-5 DONE (below: the red, the fix and its plant, the merge, the proof, the pre-freeze tests); steps 6-7 NOT STARTED.
1. Re-check base: `git ls-remote origin refs/heads/t-eng-w3` must still be 7a580aefc. If it moved: merge it by hash, tsc + generality,
   and re-run tower.test.ts + towerMend.test.ts + w3Noise.test.ts whole.
2. Step 5 is done on 056b22736 (totals below); the code has not changed since (the later commits are this folder only).
3. Freeze: `git worktree add --detach <scratch>/wt-frozen <CANDIDATE>` (dispatch-packet.md line 81 on the lead branch), node_modules
   symlinked; every gate below runs there.
4. Step 6, the gates once on the frozen head: the CI tool line; the suite in 6 shards with totals; THE LOCK as two runs ALONE (nothing
   else running): `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/base.json` in a detached worktree at 7a580aefc, then
   `--layouts 16 --check <scratch>/base.json` on the frozen head. A stage that moves is EXPECTED only where its old lay put the same
   wood twice (it now lays it once or tries the next anchor): prove each move is that (compare the two lays' catches) or send it to the
   lead. tierBots. Every red: file:line, run alone on 7a580aefc (R-165.550 ctestPicker:78 is inherited and owned).
5. Step 7: land on t-eng-w3 by fast-forward (`git push origin <CANDIDATE>:refs/heads/t-eng-w3`, no force), `git ls-remote` equal,
   message the lead the landed hash and every counts line.

## The red, and its root (RED FIRST, on f5f2aa16e)
- src/game/gen2/tower.test.ts WHOLE on f5f2aa16e: 44/45. :856 (ENG-CATCH-b's toy: going down, a bridge started a hop past a vine's
  top that misses the end's fall line), assertion 'no catch is laid twice' (:869): 3 !== 12.
- Traced (a stack print in `put`, removed): the 12 catches are rule 2's bridge 654-716 at y 1256 PUT 10 TIMES by the first lay
  (layCatches(false), the bridge at tower.ts ~:520), then 716-1033 once, then the mend's catch 554-650 under the fall line (keep, remedy
  2/3). Why: the bridge a hop past the vine's top (x 554 + TOWER.hop + 30 = 654) misses the shelf end's fall line (x 626), so the end
  stays open, and each of the lay's 10 passes bridged it again from the same storey. Nothing in `put` refused wood already there.
- Why green on d49de60f0 and red from ENG-CATCH-c box 1 on: the duplicates were always in the first lay; before the mend, the
  second lay (cover = true) left fewer misses and was returned. The mend inside layCatches mends the first lay too, so the second is no
  longer strictly better and the first lay, duplicates and all, is returned. The mend did not lay a catch twice; it exposed the lay
  that did. (The bisect the packet named, by remedy, is answered by the trace: no remedy of the mend puts the duplicate.)

## The fix (general: no stage id, seed or x)
- tower.ts layCatches `already(x0, x1, y, but?)`: wood wholly on solid wood already at its height (|dy| <= 1) lays nothing new.
  `put` refuses it and returns false; every caller counts a piece only when it was put (rule 1's run-on falls through to rule 2; rule
  2 tries the next anchor; rule 3, rule 4's pick); the mend's keep refuses a bough put refuses, and a piece laid again (remedy 1) onto
  wood already there; trimKeep never trims a piece onto other wood; reLay never moves a piece onto other wood. So every catch in a
  tower's final lay is distinct, by construction, on every path that lays or moves one.
- The toy's lay now: 654-716, 716-1033, 536-716 (3 catches, 3 distinct; the shelf's end caught under its fall line, no blind drop).
- PLANT: `put`'s refusal line removed -> tower.test.ts:856 RED (3 !== 12); restored -> green.
- tower.test.ts 45/45, towerMend.test.ts 13/13 (commit 5330e490d). tsc 0; generalitycheck PASS (26 literals, 26 known).

## Merge of t-eng-w3 7a580aefc (by hash, no rebase)
- `git merge --no-ff 7a580aefc` -> 056b22736. NO CONFLICTS: pipeline.ts (both sides changed it: the guarantee's reroll in
  buildRolledOn here, ENG-ROOT / ENG-DEAL there) merged by git with both sides' hunks kept; 50 files from t-eng-w3, tower.ts untouched
  by it. tsc 0; generalitycheck PASS (26 literals, 26 known).

## Pre-freeze (step 5) on the merged head 056b22736, each test file WHOLE
- Every test that imports tower.ts (grep): tower.test.ts 45/45; towerMend.test.ts 13/13; towerBots.test.ts 9/9; legs.test.ts 7/7;
  legsLay.test.ts 10/10; camRepick.test.ts 8/8; cameraFollow.test.ts 14/14; worlds/w3.test.ts 10/10. The only source changed is
  tower.ts. src/game/gen2/worlds/w3Noise.test.ts 7/7 (stays green). 0 fail anywhere. tsc 0; generalitycheck PASS (26/26).

## PROOF (step 4), as ENG-CATCH-e ran it (its probe/proof.mts, copied unchanged), seeds 1-40 x both settings
- Tree wt-try: the candidate 056b22736 with src/game/gen2/worlds/w3.ts = t-kit-w3a 39a3c5b52's w3.ts byte for byte (`git show`); tsc
  on it: errors in test files only (w3.test.ts, w3Level.test.ts want 3-2's exports the kit's w3.ts does not have), none in any source.
  Run: `GEN2_DRAFT=3-1 ROOT=<wt-try> KEEP=<config> FROM=1 SEEDS=40 VERBOSE=1 npx tsx proof.mts` (the first run left GEN2_DRAFT out:
  every build threw "no row for 3-1" (the draft row is installed only by GEN2_DRAFT); re-run with it, the numbers below).
- RESULTS (logs proof/*.txt here; every refusal named in its log), each against ENG-CATCH-e's number:
  - all five: ok 80/80, leaks 0, refusals 6 in 6 builds, Normal's rolls refused 3 / tried 42 (7%), worst stage 1 (n11). ENG-CATCH-e: 3/42.
    The same six named refusals as ENG-CATCH-e (n11, n19, n29 and e11, e19, e29: a blind drop off the wall catch x 31-211 / 33-213).
  - root-down: ok 80/80, leaks 0, refused 0 / tried 40 (0%). ENG-CATCH-e: 0/40.
  - two-roots: ok 80/80, leaks 0, refused 0 / tried 40 (0%). ENG-CATCH-e: 0/40.
  - cap-down: ok 80/80, leaks 0, refused 1 / tried 40 (3%), worst stage 1 (n3). ENG-CATCH-e: 1/40.
  - cap-steps: ok 80/80, leaks 0, refused 1 / tried 41 (2%), worst stage 1 (n33). ENG-CATCH-e: 1/41.
  - shelf-hops: ok 80/80, leaks 0, refused 3 / tried 43 (7%), worst stage 1 (n13). ENG-CATCH-e: 3/43. The same six named refusals
    (n13, n24, n36 and e13, e24, e36: blind drops of 311-314 px, past `see` 300).
  0 THROW in every log. No config got worse than ENG-CATCH-e.

## Open finding (box 1; FIXED in box 2, above)
- No catch is laid twice now, but a LATER, wider catch may still lie over an earlier one: the toy's 536-716 lies over 654-716 (same
  height). Physically harmless (no new footing, no new end), but two planks drawn over each other can show an end cap in the middle of
  a plank. Proposed next step for the lead: the same rule the other way round (a piece put wholly over laid pieces takes their place),
  with its own planted test; it changes which pieces are listed, so it needs the lock.

## Polish check
Box 1: engine-only (the lay); no screen changed; the overlap was the one rough spot it could show, named. Box 2: the overlap is gone
from every built 3-1 (scan: 303 pairs in 79 of 80 -> 0 in 80), so no two planks draw over each other and no end cap shows mid-plank;
no screenshot was taken in this box (no screen code changed; the lay changed). The freeze box should look at one moved 3-1 seed on a
phone-sized screen, upright and sideways, where a trimmed catch now meets other wood end to end, and judge the join.

## Learned
- The mend was blamed for this red for two boxes; it only changed which of two lays was returned. A trace of every `put` (its call site
  printed) found the real layer in one run. Before bisecting a red by remedy, print which code path laid the bad piece.
- An invariant "every catch distinct" belongs where wood is laid (`put`) and where it moves, not in a check after the lay: then no new
  remedy can break it.
- MY MISS: the first proof run left out GEN2_DRAFT=3-1 and every build threw; caught from its first line before any number was used.
  The command line is now written in this REPORT, so the next run copies it.
- Box 2: the toy said one overlap; the scan of the real lays said 303 in 79 of 80 stages, a third of them catches over the stage's own
  logs. A rule proven on a toy is proven on the real lays by a scan that reads the invariant itself (here: every same-height pair),
  old code against new, before any number is called a result.
- Box 2, MY MISS: the first commit message went through a heredoc (D119 says none); its text is right; later commits use -m.
Box 2's lessons applied: D30 (every stamp from `date`), D52 (cites checked last), box 1's D115 (each run in its own worktree: wt-try,
wt-old), D154 (by construction, proven on seeds 1-40 x both, all six configs, plus the scan), D156 (generality with tsc each step),
D159 (the base by hash). Box 1's lessons applied: D115 (each run on its own worktree: wt-try for the proof, wt-old for the d49de60f0 check), D119 (no heredoc with a
commit), D128 (stamps from `date`), D154 (the invariant guaranteed by construction, proven on seeds 1-40 x both, all six configs),
D156 (generality with tsc at each step), D159 (the base checked by hash with ls-remote).

