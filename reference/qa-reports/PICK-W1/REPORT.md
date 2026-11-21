# PICK-W1 REPORT: the testers' link plays all of World 1, with a stage picker (R-165.343)

Member: PICK-W1 (Engine + UI, Opus 5.5 high). Branch t-pick-w1 from t-int-15 @ 0eefc707e. Started 7:58 PM ET 11-20.
FINAL HASH: the tip of t-pick-w1, this REPORT's own commit (the hash is in the final message to the lead; code head 7eb3aadb5; later commits are stills and report files only).
EXACT NEXT STEP: none in this packet: every gate is run and PASS. Next: the keeper's check of the DRAFT words (Saturday morning), then the integrator merges t-pick-w1.

## Mock-up (item 0)
Pushed 8:06 PM ET at 70144ed7e, within 8 minutes of start. These are stills of the REAL page (the picker was built first and shot), 2x:
- reference/qa-reports/PICK-W1/mockup/picker-up-top.png, picker-up-picker.png (390x844)
- reference/qa-reports/PICK-W1/mockup/picker-side-top.png, picker-side-picker.png (844x390)
- reference/qa-reports/PICK-W1/mockup/nostill-1-7-up-ROUGH.png: what a stage with no still looked like then (rough). The six stills below fix it.
The lead approved the design at 8:10 PM ET and added three asks: (1) a test that every stage has its still and its move cards, (2) a
"played" tick, (3) a line on formatBuildTime. All three are done (below).

## Done-items
1. **The picker** (item 1). The front page offers 1-1..1-9 as a 3x3 grid of tiles, each with its number and stagePlan's name. Tiles are
   103x67 upright and 212x64 sideways, every one 44 px or more. The setting choice (Easy/Normal) is kept. The pick drives the
   still, "The moves in 1-x" and "Start 1-x". The pick is remembered on the device; a fresh phone starts on 1-1. The chosen stage is the
   one played (App.tsx: ctestLevelFor(allLevels, id)). **Deleted:** playRecorder.ts CTEST_LEVEL_ID and every reader of it (App's
   ctestLevel(), its victory check, touchCoach's rule). **Re-pointed** with their assertions kept:
   - ctestCoach.test: "builds and plays" now runs on every offered stage, both settings.
   - ctestCoach.test: "coached on its stage" covers every offered stage; the "no other stage" case is now '2-1', a stage the link does not offer.
   - ctestCoach.test: "the real engine makes the coach" now uses a picked non-1-1 stage, 1-4.
   - ctestSurvey.test: the front-page test requires a page for every offered stage, keeps 1-5/1-4/1-3's pinned cards and alts, and keeps
     the four-cards / real-pose / short-line rules for all nine.
2. **The record says which stage** (item 2).
   - The recorder writes `stage <id>` at every Start, and its 'gen2' line names the stage again with the seed.
   - The survey row carries `stage`.
   - The end screen says "How was 1-6, First Lianas? Three quick taps help Matt a lot. The rest are up to you." Its kicker reads
     "Level test · 1-6", and its buttons are "Play 1-6 again" and "Pick another level" (the latter is noted as `pickAnother` and returns
     to the picker, still recording).
   - The stretch chips are per stage (see "DRAFT chips" below).
   - LOG_EVENTS.md documents `stage`, `pickAnother` and the survey's `stage` key.
3. **The collector** (item 3): **no change** to tools/control-test-collector.gs. It stores each part's lines verbatim in its Data cell
   (doPost: `safe(data, MAX_DATA)`), so the `stage` line and the survey row's `stage` key ride inside data it already stores. The sheet's
   columns are unchanged.
4. **Planted first** (item 4): src/components/ctestPicker.test.ts.
   - It picks 1-4 and asserts the stage handed on to be played and the level App plays (1-4, not 1-5), the recorder's `stage` line,
     the survey row's `stage`, and the end screen's words ("How was 1-4, Up the Kapok?", "Play 1-4 again", nothing of 1-5).
   - **RED on the base:** run in a worktree of 0eefc707e, the file fails ("does not provide an export named 'CTEST_STAGES'": the base has
     one stage and no picker). Plainly: it fails at import, not at an assertion, because none of the picker exists on the base.
   - GREEN on this head.
   - The same file also holds three more tests:
     - **Every offered stage has its still** (the lead's ask 1; the move cards are held by ctestSurvey.test's page test).
     - **Every offered stage names its own stretches** (flies all nine, both settings, two seeds): it fails on an unnamed section, or on a
       stage that offers only the generic four. Before this change it failed for 1-2 and 1-4..1-9.
     - **The played tick.**
5. **THE FULL SET**: the gate table below.
6. **Polish**: the next section.
7. **The lead's adds**:
   - (1) is in item 4.
   - (2) **The played tick:** a stage this phone finished (reached the shrine) wears a small green tick on its tile's corner
     (`sloth_qa_ctest_played`; aria-label "…, played"). A quit does not tick. Tested.
   - (3) **formatBuildTime shows the PHONE's local time.** version.ts:27 calls `d.toLocaleString(locale, {…})` with no `timeZone`, so
     the browser formats in the device's own zone. Proof (the same ISO, 2026-11-21T01:20:00Z, through formatBuildTime under
     three TZ settings): America/New_York "Nov 20, 2026, 8:20 PM"; UTC "Nov 21, 2026, 1:20 AM"; America/Los_Angeles "Nov 20, 2026, 5:20 PM". The mock-up's "11:33 PM" (and the polish stills' "1:20 AM") are the headless
     browser's UTC, not a bug.
8. **Front-page stills for the six stages that had none** (my widening, accepted 8:10 PM): src/assets/ui/ctest-1-1, 1-2, 1-6, 1-7, 1-8,
   1-9.webp. They are the real game, the designed roll (?layout=1), Normal, HUD hidden, 880x425, 34-48 KB each (1-5's is 45 KB). They
   were shot the way 1-5's was: the camera is as close as 1-5's (660x319 at 4/3 scale) and the pin is released, so Pokey stands as in
   play. Each alt names what its still shows (DRAFT for the keeper, below).

## DRAFT for the story keeper (Saturday morning check)
Plain player words, no workshop words; playerText.test's BANNED list does not apply to them. Every one fits the chip test (no
digits, ids or codes; 30 characters or fewer).

**Move cards** (ControlTestGate.tsx CTEST_PAGES; 1-3, 1-4 and 1-5 are the keeper's own, unchanged). Each is drafted from Dot's own lines in that stage's w1Arc file:
| Stage | Cards (name: line) |
|---|---|
| 1-1 | Run; Jump; Double jump: "Flick up again in the air to jump twice." (the game's own teach line); Mushrooms: "Land on a mushroom and it bounces you up high." |
| 1-2 | Run; Jump; Thorns: "Don't touch the thorns, not even a little." (LINES_12.thorns); Mushrooms: "Hop on and let the mushrooms do the jumping." (LINES_12) |
| 1-6 | Grab a liana: "Jump at a liana to grab it. Hang on and it swings."; Leap: "Let go when you glow: flick up as you swing forward." (w1Arc16 :58, :149); Climb; Vine snakes: "A snake coming down? Climb down ahead of it." (:62) |
| 1-7 | Run; Hide: "Stop in a bush or on moss. No wiggling: shaking leaves show." (:56, :60); Creaky limbs: "Never stop on a creaky limb. Cross it first, then hide." (:62); Mossy lianas: "A mossy liana hides you, swinging and all. Just hang on." (:64) |
| 1-8 | Run; Jump; Little nuts: "Little nuts roll at you. Hop over them." (:51); Big nuts: "Big ones bounce over you. Just keep walking." (:53) |
| 1-9 | Run; Freeze: "Boas only see wiggles. Stand still and you look like a branch." (:49); Bop: "When a boa misses, tap to punch its nose." (:53); The eagle: "Eagle! Get into the green. Its eye scares boas off." (:57) |

**Still alts**:
| Stage | Alt |
|---|---|
| 1-1 | Pokey on a mossy mound by a mushroom and a row of petals |
| 1-2 | Pokey by a row of mushroom caps over a bed of thorns |
| 1-6 | Pokey near a hanging liana with a snake curled at its foot |
| 1-7 | Pokey between two bushes while an eagle flies overhead |
| 1-8 | Pokey on the long branch under palms heavy with nuts |
| 1-9 | Pokey near a coiled boa by the eagle's nest |

**"What felt hardest?" chips** (ctestStretches.ts; each from its section's design name in the w1Arc file; rests, arrivals and exits are
walking-only and never offered):
| Stage | Count | Chips |
|---|---|---|
| 1-2 | 7 | the first thorns · the mushrooms over thorns · the mushroom stair · the long mushroom chain · the hollow by the roots · the crossing by the island · the last mushrooms |
| 1-4 | 12 | the first vines up · the rotten boughs · the wide field of vines · the falling pods · pushing up the figs · the creaking boughs · the two fig bunches · the figs under the pods · from vine to vine · the figs on the snake · the hollow in the tree · the top of the tree |
| 1-5 | 7 | the hollow trunk · the first creaky limb · past the sleeping snake · the snake that woke up · the branch or the creek · riding the limb down · the fast creaky limbs |
| 1-6 | 9 | the first liana · hanging low to swing far · liana to liana over thorns · the snakes on the vines · a snake on my vine · the creaky landing · the snakes coming up · the vine with a face · the big swing over the gorge |
| 1-7 | 8 | hiding in the bush · run, stop, hide · the bare bark · hiding on the moss · the creaky limb · hiding on a mossy liana · when the eagle landed · the sunny gap |
| 1-8 | 8 | the rolling nuts · the first race · the race over the lianas · the high bough · little and big nuts at once · the fork to stop at · the last stretch · the swing off the tip |
| 1-9 | 9 | freezing like a branch · freezing on the stairs · bopping a boa · the creaky limb by the nest · the boa under a trap · the boa by the eagle's nest · the boa with nothing near · the two boas · the Old Boa |

The lead (9:26 PM ET): the keeper check trims each stage to its 6 clearest. The counts above are the most a roll can offer, before Running and Nothing are added; a single roll shows only the beats it lays (1-6 seed 1 showed 9, 1-9 showed 9).
want to merge some (for example the three fig chips into one).

## Gate table (THE FULL SET)
Code head **7eb3aadb5** (later commits: stills and report only).
| Gate | Head | Verdict |
|---|---|---|
| tsc, artcheck, vite build (deploy base) + chunkcheck, knowncheck, generalitycheck, coveragecheck, roadmapcheck, timecheck | 7eb3aadb5 | PASS (each) |
| clipcheck (walks the picker: a pick, and back from the end) | 7eb3aadb5 | PASS (83 known, 730 s, no missed steps) |
| kbdcheck (pick 1-9 first, both ways) | 7eb3aadb5 | PASS (123 s) |
| drawcheck | 7eb3aadb5 | PASS (788 s) |
| registrycheck --lists + seedlist --check, all 13 lists (1-1..1-9, 2-1, 2-2, 2-4, 2-5) | 229966f9c | PASS (each) |
| suite shards 5/6, 6/6 (started after the fix) | 7eb3aadb5 | PASS (618/617/0/1; 679/679/0/0) |
| suite shards 1/6..4/6 (re-run on the final head) | 7eb3aadb5 | PASS (719/719/0/0; 639/638/0/1; 642/642/0/0; 712/711/0/1) |
| **suite, the line in full (6 shards)** | 7eb3aadb5 | **total 4009 / pass 4006 / fail 0 / todo 3** (the 3 todos are older TODO-marked tests: R-165.312, 4-3 real engine, one in 5/6) |
| CI tool line | 229966f9c | PASS (331 pass, 0 fail) |
| tipwalk --layouts 4 | 229966f9c | PASS |
| registrycheck | 229966f9c | PASS (13 stages, 49 s) |
| tierBots | 229966f9c | PASS (9/9) |
| paintcheck 0/3, 1/3 | 229966f9c | PASS, PASS |
| paintcheck 2/3 (lane B hit its 90-min limit as it began; re-run) | 7eb3aadb5 | PASS |
| buildcheck ALONE | 7eb3aadb5 | PASS (1-1 p95 88 ms Normal, 52 ms Easy; budget 150 ms at CPU x4) |
The first suite run on 229966f9c had two reds in shards 2/6 and 3/6, both mine, fixed at the root in 7eb3aadb5: the tick's glyph was 11 px
(textSize UI-14; now 12 px), and the two new storage keys were not listed (storageKeys; now listed with the testers' keys). 229966f9c to
7eb3aadb5 changes only src/index.css (.ct-played) and src/game/storageKeys.test.ts; the seed-list, paint, tipwalk, tierBots and tool gates
read neither file.

## Polish check (law 1, STAGE-RULES §5b)
These are full-size stills of the real page on this head, 2x, upright (390x844) and sideways (844x390), on a fresh save (pick 1-6) and an
old save (name Sally, last pick 1-7, played 1-1/1-4/1-5; pick 1-9). They are in reference/qa-reports/PICK-W1/polish/
<save>-<up|side>-<n>.png:
- 1-top: the page as it opens.
- 2-picked-top: the pick's still at the top.
- 3-picker: the tiles and that stage's moves.
- 4-start: "Start 1-x".
- 5-in-stage: the picked stage playing, with REC and "I'm done".
- 6-survey-top: "How was 1-6, First Lianas?".
- 7-chips: that stage's own chips.
- 8-sent: "Play 1-x again" and "Pick another level".
- 9-back-to-picker: back at the picker, the pick kept.

What I looked at and fixed:
- **Fixed:** the no-still state (Pokey cut off at the top, the NEW tag floating; mockup/nostill-1-7-up-ROUGH.png). All nine stages
  now have a still, and a test holds it.
- **Fixed:** the tiles' heights differed (the top row was 64 px, the others 67) because names wrap; grid-auto-rows: 1fr makes them all 67.
- **Fixed:** the sent screen broke the stage number at its hyphen ("play 1-" / "6 again", fresh-up-8 first shoot). The number in a
  sentence is now one unit (.ct-nb, nowrap), and a test holds it.
- **Fixed:** my first stills had the HUD and Dot's card drawn in, a wider camera than 1-5's, and Pokey frozen mid-jump. They were reshot
  as above.
- **Looked, fine:**
  - The tick (old-up-3: 1-1, 1-4 and 1-5 ticked, 1-9 picked).
  - Sideways, the tiles read on one line each.
  - The chips wrap cleanly (old-side-7).
  - The in-stage view, both ways (5-in-stage).
- **Named, not fixed:**
  - Every stage's chip list starts with "Running", even on 1-6 (a liana stage). That was in the survey before me
    (surveyQuestions: 'Running' is always first). It's the keeper's call, not changed here.
  - A long 1-4 roll offers up to 14 chips. That's the keeper's call, above.

## Pushback
- The packet's single-stage test pins became meaningless rather than wrong: "the link's stage is 1-5" can't hold with a picker. I kept
  their substance: 1-5's cards and alt are still pinned, and every stage builds, plays and coaches.
- The coach (slide to run, slide up to jump) now shows on whichever stage a new tester picks. On 1-4 (a climb) it still asks for a
  jump. That's the same behaviour 1-5 had. If the keeper wants a climb-first coach for 1-4/1-6, that's a separate packet.

## Suggestions
- PICK-W1-KEEP (keeper, 20 min): check the DRAFT words above. Objective: keeper-approved cards, alts and chips. Files:
  ControlTestGate.tsx CTEST_PAGES, ctestStretches.ts. Done-items: each draft approved or replaced; ctestPicker.test and ctestSurvey.test green.
- Analyst: report.py should split rows by the `stage` line, now that one tester can play several stages in one session.

## Unresolved
- R-165.343 is not on ROADMAP.md at this base (the lead's file; not edited here).
- The DRAFT words wait on the keeper (Saturday morning).

## Learned
- A table checked against one list (w1World's shared sections) looked complete while seven stages laid sections it never saw.
  Check a table against what the real thing produces (fly the stage), not against a list that is only part of it.
- The fastest honest mock-up was the real page. Build the component first and shoot it: the stills were ready in 8 minutes, and the
  build was already half done.

## Method update
- reference/methods (testers' page): front-page stills are shot at 660x319, dsf 4/3 (giving 880x425), on ?layout=1 with lessons off. The
  pin is released after 0.4 s so Pokey lands and stands. The HUD is hidden by `body * {visibility:hidden} canvas[data-keep]{visible}`,
  which also hides Dot's DOM card. The script is in this report's polish notes; worth a tools/ file if stills are reshot again.

## Lessons applied
- D30: every time written comes from `date` in the same command.
- D40: built on the merged base, nothing being replaced.
- D57/D87: ReadNotifications at the push and before this report.
- Background runs for every long gate.
- D79: stills of the whole screen.
- D86/D96: THE FULL SET once, on the final head.
- Plant red first.
- New replaces old: CTEST_LEVEL_ID is deleted, not switched.

## Turnover note
reference/handoffs/engine-core.md §0zq-PICK (commit 7eb3aadb5's parent 229966f9c).
