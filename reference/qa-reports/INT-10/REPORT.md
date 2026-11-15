# INT-10: 1-6 toward link #4. t-int-10 from t-eng-petal 3802db95; code head 1750cdbc0. STOPPED by the lead (box, 11:50 AM ET): not GREEN.

## EXACT NEXT STEP (INT-10b, t-int-10b from this head)
1. **gen2Pits.test:61 RED (1-6, every listed layout)**: two soft-pit floors JOINED (raw seed 1: 27933+157 and 28090+569, y 1133) and the
   later pit's stair (28090+100 h180 ...) stands with its face flush on the earlier floor's end, foot 0 px over it; gorge too (45393/45561).
   Root (the lead): lay joined floors as ONE piece (pipeline.ts, the soft-pit floor join: ENG-16H; ENG-PETAL's pitJoinWall sits at the other
   end). Then relist every soft-pit stage it moves (`seedlist.ts <s> --check` for 1-1..1-8; CI runs all), castBots 1-6 + 1-4.
2. The whole suite (UNRUN here: SUITE below), each red traced; re-pin only with a revert proof (mainpins.ts / firstrun-lock.ts are the tools).
3. castBots 1-4 seeds 1-40 both settings (UNRUN here). castBots 1-6 again after the fix (this head: 0 sealed, child N 2 rescues).
4. 1-6 child Normal s23 rescue (risers x 32574, "the way on is 145 px up"): introduced by the t-eng-dr merge (70048a22 has it, 3802db95
   does not; castBots --json on both). ENGINE-WORTHY for the bot member; candidates: BUILD-18's runner-liana thumb hold
   (firsttimer.ts runnerLip/RUNNER) or the chase lay in pipeline.ts. s34 (gorge pit, far wall 199 px up): ENG-PETAL's known stair skill.
5. 8-3 softFalls11.test:128 (pitHoleFill's 56/53 fills): stills of 8-3 L2 x 4650 and x 7050, upright + sideways, before any re-pin.
6. Then every gate on the head, stills + walkthrough (reference/qa-reports/INT-10/stills.mjs SAVE=old|fresh, panclip.mjs), build.py.

## Done-items (heads pasted from git)
1. Merges: t-eng-dr c3c7e658 (70048a22, 12 conflicts each in its message); t-tools-2 already inside; t-meter-1 cfa9019a (d4287944).
2. 1-6 petals (98351f29, 1750cdbc0): walkedSpan.ts hopArcs + petals.ts arcPetals by GraphBrief.petalArcs (1-6 only), the apex of each
   REQUIRED hop's middle-tier arc; w1Arc16 bank rows; arc petals marked `arc`, never counted by the door (the lead's (a), 11:49 AM).
   Petals an upright screen, Normal L1-5 (screens.mts): **0.22 -> 0.98, bare 85% -> 34%** (1-3 0.86/51%, 1-5 1.04/48%; others unchanged).
3. Meter (f569ae61): anchor = FIXED 1-1 layouts (anchor11.ts); band test reads DIFFICULTY.md; 1-6 Easy SHORT gaps on two beats:
   **Normal 5.66 (6.5 +-1.5), Easy 3.58 -> 3.18, ratio 0.63 -> 0.56**. METER-2a told.
4. Lists (fc8e047d): 1-1 relisted in order; first-run lock re-recorded (collectibles only; old hashes exactly at 7e9fe4d8^);
   calibration recommitted (pass/fail unchanged), tierBots 7/7. seedlist --check PASS: 1-1..1-8 (seedlist-checks.txt, -1-6.txt).
5. castBots 1-6 seeds 1-40 on its list (castBots-1-6-final.txt): expert N 40/40, middle N 40/40, middle E 40/40, child E 40/40,
   child N 38/40 (2 rescues, item 4 above), **0 sealed** (was 7 expert, 3 middle, 8 child). Counted arcs first: child N 0/40 (castBots-1-6-arcs.txt).
6. Pins (cd85f0b9): verdicts.test 5-7/7-1 MAIN (only gen2.fills moved; old hashes at 7e9fe4d8^: mainpins.txt).
7. Plants: planted.py 8 plants (7 RED in planted.out.txt; the 8th, "the door counts the arc petals", added after: UNRUN).
8. Gates run: tsc 0; knowncheck, generalitycheck, roadmapcheck, artcheck PASS (11:4x, before 1750cdbc0); tierBots 7/7. SUITE: below.
   UNRUN: build + chunkcheck, drawcheck, clipcheck, kbdcheck, buildcheck, the tool tests, tipwalk, registrycheck.

## SUITE
UNRUN: started 11:53 AM ET (3 shards, alone), STOPPED at 11:54 AM by the lead (Matt at 77% of the week's tokens; INT-10b re-runs it
after its fix). Reds known without it: gen2Pits.test:61 (above); softFalls11.test:128 (8-3, ENG-PETAL's, not re-pinned: stills first);
verdicts.test 5-7/7-1 (re-pinned here, green alone). Seen red in the ~1 min it ran (suite-partial-stopped.txt), untraced: the hand-built
1-8 chase tests (chase piece; A-07, A-07b: ENG-DR's named reds, BUILD-18's to route); 1-4's paired-column petal tests (4: walked-path
petals vs the two-hand climb); Worlds 1 and 5 dressing sets. Every other file: unknown on this head.

## Polish check: no stills (the lead). Rough spots named: the flush stair (item 1); 7-1 lost 43 of 80 socket fills.

## Pushback
- Step 3 assumed the meter's band test was in (it was on t-meter-1, merged here); the anchor sat on list positions (fixed at root).
- The arcs ruling assumed every tier flies through the apex; the child does not (fixed by (a)). Step 2's let-go/double model: NOT done.

## Suggestions (ready packets in EXACT NEXT STEP where they block)
- 1-7 (0.44) and 1-8 (0.46) read thin: `petalArcs: true` each, then lists + bots. A screens.mts band test per stage.
- seedlist --check prints 20 lines at most: a first-run drift hid behind 20 replay lines (seedlist.ts:72): print counts by kind.

## Learned
- The arcs ruling's premise (every tier flies through the apex) failed on the bots: the child flies under it. A bonus pickup is never in
  the door's base; run the bots on every placement rule before calling density done.
- A meter scaled by list positions re-scales every stage on a relist: anchor to content.
- The meter's Easy is its swing peaks (30 s window); hops under the free bit do not move it.
- Plant scripts that edit source run in their own worktree while bots or lists run. I typed three times into messages (D30): every time now comes from `date` in the same command, or is left out.
- Proposed level.md rules: "Petals read inside World 1's band (screens.mts) before a level is called done; a hop-heavy level turns on petalArcs."; "A level's Easy is softened where the meter's peak window is (its swings), never by flattening the walk."

## Method used / Lessons applied / Method update / Turnover note
level.md, gates.md, seed-list.md. Lessons: D19, D29, D30 (broken 3x, corrected each time), D37, D48, D59, D74, D77/D78 (box).
seed-list.md step 6: "prove the first-run lock and the meter anchor unchanged too".
Turnover: reference/handoffs/engine-core.md section 0zg (cd85f0b9), open items updated on this report's commit.
