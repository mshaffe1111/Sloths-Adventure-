# P12S: 1-2 rolled from World 1's shipped kit (the plumbing). `t-12-ship` = t-int-2@91af3475 + W1C@26f72b31, 2026-11-12 ET. No PR.
D12 designs 1-2's arc from this branch (the lead, 2:02 PM): I touched no arc data after that.
## Done items (4 of 5 met; item 3 waits on the lead by ruling)
1. **MET. The game builds 1-2 by its stage-table row.** 1-2's rows moved word for word from tools/engine/library.ts into
   `src/game/gen2/worlds/w1Arc12.ts` (world data); kit `'w1-12'` in listed.ts KITS (World 1's kit with 1-2's manifest-wide rows:
   corridor room 320, thorn row, lessons); stageTable `'1-2': { kit: 'w1-12', judged: 'normal-1-2' }`; library.ts re-exports.
   Deleted (new replaces old): HAND_STAGES/StagePlan '1-2', the plan block, catchUp + CATCH_UPS/CATCH_DX/CATCH_HIGH_DX, trailUp's 1-2
   branch, PETAL_GOAL_12, w1Sections' '1-2' row. Tests: stage12.test + stage12Catch.test DELETED (they test the deleted builder:
   its 72-petal goal and catch mushrooms); builtOnArcs.test MOVED (fixture = the old control course under 1-2's id, mixes 1-16, still
   tells); easyMode.test's H1 exemption by rule, not name (lead 1:41 PM) + a planted test both ways (costsHere/flagHeartsOwed extracted,
   same behaviour); listed, softFalls11, passLines, pitPocket, layoutMemory moved/deleted with reasons (commit 69d2f455). 118/120 holds.
2. **MET. CTEST.** #ctest plays gen2 1-1 (App.tsx:758-760, :939, :1167, :1190); the 1-2 ctest branch (stageGenerator.ts:2865) is the old
   course, ahead of the listed road. Ruling (A): untouched, proven: buildProtoStage 'ctest' + ctestMixDraws, 50 mixes x both settings,
   hash 40daf1954a150836 before and after. (B) = **R-165.151** (delete the old control course): not done, by ruling.
3. **NOT RECORDED (ruling 2:02 PM): the 1-2 seed list waits for D12's final head and the lead's OK.** Sweep started, stopped.
4. **MET (on today's roll; D12 will change it). Bots, real engine, layouts 1-16, fresh phone** (bots12.ts; runs in scratch, 144):
   | bot | setting | shrine | ends otherwise | time med (min-max) s | rescues |
   |---|---|---|---|---|---|
   | ADULT first-timer | Normal | 14/16 | sealed door 2 (87/90, 84/86) | 164 (127-197) | 11 |
   | ADULT | Easy | 16/16 | - | 164 (126-187) | 11 |
   | KID first-timer | Easy | 16/16 | - | 166 (126-186) | 11 |
   | KID | Normal | 13/16 | sealed door 3 | 163 (123-198) | 9 |
   | EXPERT | Normal | 9/16 | sealed door 7 (petals short) | 181 (153-217) | 0 |
   | MIDDLE | Normal / Easy | 9/16 / 16/16 | sealed door 7 | 211 / 197 | 0 |
   | CHILD | Normal / Easy | 0/16 / 13/16 | time 16 / time 3 (360 s cap) | 360 / 301 | 7 / 0 |
   Every failure is the petal goal (sealed door) or the clock; **0 harms in all 144 runs.** First-timer >= 2 min: yes (min 123 s).
   Bounce chain taught first: **32/32** (taught12.ts: the first chain brick is lib-thorn-teach, the thorns shown from its ledge;
   the first hollow lies under that brick's own two caps). funcheck vs base (both FAIL, base debt): 1-2 worse on "looks like the
   stage before" 16/16 (50% alike to 1-1), "nothing new" 16/16, Easy "like the stage before" 7; better on "repeat" 13/12, "padding" gone.
5. **MET. Stills, real game, no hook** (shoot12.mjs, layout 1 = seed 16847, Normal): stills/{1-start,2-first-chain,3-thorn-floor,
   4-hardest,5-end}-{up,side}.png. Pokey is set down once and lands by the game's physics.

## Polish check (what Matt would see; named, not fixed: design is D12's)
- Thorn bed painted in every hollow (w1-thorn brambles): reads well upright and sideways (3-thorn-floor-*).
- **The thorns never cost anything.** Hollows are 49-66 px; Pokey (44 px) walking off the lip or dropped dead centre is caught on the
  lip (hollow12.ts: hp 5->5 both settings). With 0 harms in 144 runs the thorn floor is decoration. For D12.
- **The goal is 90 petals of ~100 laid** (HUD 0/90, card "collect 90 petals"): every Normal failure is the door.
- No Dot line teaches the thorns or the chain (the teach brick's tip socket names no line; words are the story keeper's).
- Chain shots catch him mid-bounce on a cap (real physics). The start card covers the first petals sideways.

## Gates (logs in scratch; base = t-int-2+W1C @bf71c26f in a worktree)
PASS: tsc; generality (27 = 27 known); knowncheck; roadmapcheck (after unshallow); artcheck; build (BASE_PATH); chunkcheck; seedlist
1-1 --check (258); engine tool tests (17/17); lock vs base: **101/102 unchanged, only 1-2 (intended)**; touched tests 31/31.
FAIL **same on base** (not mine): buildcheck (1-1 p95 351/305 ms here, 364/303 base; budget 150), funcheck (base debt), and in the suite
ctestSurvey (1-3 sections need words), artUse (reaverAtlas#ultprep), cameraLead x3, ciTests (library13.test not in CI), yield floor
(1-1: 11 of 30, needs 12), movesJournal (1-3's deleted sleeper hint).
Fixed on the way (red on base too): pitPocket (builtOnGen2), and a **game crash**: isW1Stage was /^1-[1-9]$/, so layoutMemory.awayFrom
threw in w1Pick on a gen2-rolled 1-2 (and 1-3) on the next visit after a clear; it now reads the section table (planted test).
**FAIL, mine, left for D12 (1-2's content, being redesigned; not patched, D40):** plainWalk 'one-jump steps' (1-2 seed 2: a 53 px step
at x 19097 a straight flick does not climb) and 'dips' (every thorn hollow reads as a dip with no way out by single flicks; the
engine's heart-fall set-back needs a take-off ledge, so whether a hollow is a dip or a set-back is the lead's call for D12); w1Pits x2
(the old-builder drop rules read the hollows as 4 floorless gaps and 'ground stands in the drop': the hurt floor inside the hollow).
Not run: drawcheck, clipcheck, kbdcheck, tierBots.test (no draw, menu or 1-1 code changed; slow gates outside the packet's list).
**Full suite on 69d2f455: 3049 tests, 3035 pass, 12 fail (8 same on base, the 4 above), 2 todo.**

## Method used / Lessons applied / Method update
- Method: seed-list.md (sweep only), the lock first. Lessons: D15 (0 harms checked by a planted fall), D19 (real-page stills), D29
  (whole suite), D40 (sweep stopped when D12 was named), D43 (no stage id in engine code: the kit row is world data).
- Method update: seed-list.md step 2 should say "a sweep started on a branch another member will redesign is wasted: ask first".
  A lock base must be recorded from a worktree at the base commit, never the working tree while you edit (my first base run was).
- Suggestion: fold 1-2's manifest-wide rows (corridor room, hurtFloor, lessons) into per-brief fields: no stage needs its own kit name.
