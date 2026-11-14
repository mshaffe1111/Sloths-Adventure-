# INT-3 REPORT (Engine, integration). Head t-int-3@2bb29f8d (base origin/ccr-ea739a2f-dfcee4@7f453671). Written 3:33 PM ET, gates filled below.
**In** (merged, never rebased; tsc green after each): t-art-1113@3a7bc657, t-add-level@35a0c314, t-fa@5fef0406 (ff239695 + FA docs), t-b15@b670564f,
t-b14@8bcbe53b, t-fixa@79d079e5, t-fixb@f1dc8b9c. Conflicts resolved at the root: CATALOG-MASTER.csv (B14/FIX-B saved it LF: normalised to CRLF,
merge-file, cast.json re-emitted, both ctest rows kept); protoStage/w1Sections (B14 and B15 each deleted one hand plan: neither kept); FIX-B's
#ctest pages kept over B14's single still; task files moved out of the root. **Not in:** t-pieces, t-nodes (packet).
**Done (evidence):**
0a. VARIETY engine-vault.patch (t-nodes@a9b3698b) at 96f728a8: vineTop.test real-engine case red on the old engine, green after.
0b. drawcheck 1-4 sideways 8.02 > 7.5: root = 1-4's 2600 px canopy crossfade draws two strip sets, and every fitted strip stamped its clear
   top rows (27-52% of each mid/near strip). stripInk.ts (measured once at decode, never in a frame) skips them: exact by inkproof.mjs (197
   strips, 12 fit sizes, 0 painted rows skipped, min 5 rows spare); 1-4 land 8.02 -> 7.19 on the head run; 3-3 land 7.22 -> 6.67. Stills:
   stills/crossfade-k*-{before,after,diff}.png (49df13aa vs 873b1350): the backdrop shows no diff; the red is live state that differed
   between the two runs (Dot's card, petal glow, Pokey's pool, front leaves, vignette edge).
0c. inventory.test:155 cleared by the merge; rollGuard 1-5: see gates (unit).
1. RED found at the merge: registrycheck failed 1-4 (no flown `judged` scope; B14 predates ADD-LEVEL's gate). Root: the flight sim could not
   fly a tower (RealPlay.bare kept the stage's start-time side walls, a tower's 1280 width: every jump read 39 px). Fixed for every stage
   (walls remade by the travel mode; realPlayBare.test red on old code for 1-4); 1-4 flown both settings (fly14/: Easy = easy-any), rows
   normal-1-4 in flownArcs + chain.md §1, judged; its list rebuilt under the new verdicts (100/100, b6684543; 7 seeds' plans had moved).
2. R-165.201 (dotCardHit.ts): a finger on any box the card stood in over the last 300 ms, through its fade, is the card's (claimed before
   the gestures; taps only that card). Real page 1-2 (readtime tap): run 1 found a 2nd case (3/78 taps punched on a fading card); run 2 after
   the fix: 67 taps, 10 upright + 10 sideways, 0 punches 0 jumps (tap-run2/). Unit: dotCardHit.test (wiring test red without the fix).
3. 1-3 alt = keeper's words, pinned in ctestSurvey.test (red on the old words); coach line present (lessons.ts:486, fixaWords.test);
   #ctest -> 1-3: 1-4 castBots 1-40 after the vault patch 22/360 (castbots-1-4-s1-40.txt).
**Gates on 2bb29f8d:** PASS tsc, vite build (BASE_PATH), chunkcheck, artcheck, knowncheck, generalitycheck, roadmapcheck, drawcheck (all 22;
run on 78b45ad8 too). Earlier on 78b45ad8: every seed list --check PASS, tierBots PASS. Still running at my 40% stop (one script, results
committed to gates-2bb29f8d/ by itself when done): unit suite, clipcheck, kbdcheck, tool tests, seed lists, registrycheck, tierBots, castBots 1-4, buildcheck (alone, last).
**Polish check:** crossfade stills judged by eye (above); 1-4 (Normal, Easy) and 1-5 stills are being shot by the same script into stills/: NOT yet judged by me.
**Pushback:** limits.json's scenario "ctest-mix14" now plays #ctest's 1-3, not the old mix: rename it (shared file, not mine).
**Unresolved:** 1-4's bot split (B14 step 2) not started (box): see EXACT NEXT STEP.
**EXACT NEXT STEP:** 1. Read gates-2bb29f8d/RESULTS.txt (all must be 0; a red is fixed at its root; unit-summary.txt lists any `not ok`).
2. Judge stills/1-4-*, stills/1-5 upright + sideways (Normal, Easy). 3. 1-4 bot split on the NEW list (castbots14.txt): per stuck kind
(`castBots.ts --stage 1-4 --seeds 1 --json`: 'the way on is 123 px up' x~180, 'dip 80 px' x~900, 'fell back down 8 times', 'dip 281 px'),
one RealPlay probe each (a plain player gets through = bot limit, else level fault fixed at its root). 4. #ctest back to 1-4 only at 40/40.
**Lessons applied:** D19, D23, D29, D30, D36, D37, D40, D43, D45, D51, D55, D57. **Method update (gates.md / integration):** a CRLF csv
merges by normalising the other side then merge-file, generated files re-emitted; on an integration head, a branch that predates a new gate
fails it (here registrycheck): fly/register the stage, never list it. Turnover: engine-core.md §0m (78b45ad8, updated below).
**Learned:** a real-page tap test finds the case a unit test can't (the fading card); a sim's bare world must reset every stage-start fact.
