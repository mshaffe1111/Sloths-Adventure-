# ENG-16F: retire the old hand-built 1-6 (R-165.238, "new replaces old")

Branch `retire-old-16` (local, not pushed), from t-build-16 head 7904cb65. Commits, in order:

1. `d032d591` tests off the old hand-built 1-6 (moves and retirements)
2. `fe1037cf` delete the old hand-built 1-6 whole (protoStage, w1Sections, dot lines, tips, sheets)
3. `034f0a0b` artDress off the old 1-6 (two more tests that silently built the proto default, found by the full suite)
4. this report

The game never reached the proto plan: `stageGenerator.ts` builds a hand stage only when `HAND_STAGES[config.id]` is set, and
HAND_STAGES has no '1-6' (1-6 is `stageTable.ts` `'1-6': { kit: 'w1-16' }`, gen2 `w1Arc16.ts`). The proto plan was reachable only as
`buildProtoStage`'s DEFAULT plan, i.e. from tests (and from tests that passed `HAND_STAGES[id]` for an id with no plan: see F3).

## Tests

Plants: each in a side copy (`cp -al` of src into the scratchpad, every plant a `sed -i`, which writes a new file, so the measured tree
never changed; `git status` clean after each), the moved test run there by name. Every moved test went RED on its own plant.

| Test | Decision | Evidence | Plant (side copy) -> result |
|---|---|---|---|
| stage16.test.ts (5 tests: seesaw rooms, the fallen log) | retired (file deleted) | `buildProtoStage(cfg, s)` default plan; seesawRoom/seesawTwist/logPuzzle had no caller but the proto block (grep `seesawRoom\|seesawTwist\|logPuzzle` src tools: only W6's own `seesawRoom` SectionTemplate, unrelated) | n/a |
| roomLogReset.test.ts (P-02 1-6 seed 1/38, the twist room) | retired (file deleted) | RealPlay('1-6') looked for the old `seesaw-twist-*` room; grep `'1-6'` puzzlePlay.ts: no table entry (comment only). resetRoom's log reset is generic kit code, KEPT | n/a (see F5) |
| protoStage.test.ts (5 tests, all "1-6: ...") | retired (file deleted) | all built the default plan; beats, two seeds, the log wall, the far seed: the old 1-6's own content | n/a |
| dblPractice.test.ts: practice spot, Dot's line, the row | retired (3 tests) | built `'proto'`; read DBL_PRACTICE, PRACTICE, row hint.1-6.double, all deleted | n/a |
| dblPractice.test.ts: LV-3 on 1-1 (the living double teach) | kept as is | builds 1-1 | n/a |
| vineFollowUps: 1-6 pumping/steer/hands off never sets him down | moved: the new 1-6's first liana | `firstVine` now finds the first liana by x and the take-off ledge as the nearest platform wholly left of it with its top at or above the vine's foot (was `p.y === 580`, the old ground) | P1 old auto-landing (physics.ts swingLanding: a ledge beside taken whatever the hands) -> RED "1-6 seed 1 pump: let go of the liana after 2.13 s at x2922 y738" |
| vineFollowUps: QA v192 repro, grab, steer down, pump | moved (grab from the take-off ledge, timed: see F4) | as above; `toLedge` + `catchWait` | P1 -> RED "seed 1 right/left 700 ms: let go at x2921 y738" |
| vineFollowUps: holding down and toward the ledge puts him on it | moved | as above | P2 (down-and-toward never lands) -> RED "seed 1: still swinging after 6.00 s" |
| vineFollowUps: the swing lesson's lianas, pumping never sets him down (was "over the soft moss", the old 'Learn' beat) | moved: the lianas of the new 1-6's lesson section (its gen2 section holding the first liana) | gen2 `sections` x0/x1 | P1 -> RED "seed 1 liana 1 pump: set down beside the vine at x2922 y738" |
| vineFollowUps: v192 one-thumb flick up-left goes LEFT | moved | grabFirst as above | P3 (engine leapDir: any lean leaps right) -> RED "upright seed 1 phase 16: swinging false vx -89 facing -1" |
| vineFollowUps: a plain flick straight up climbs | moved | grabFirst as above | P4e (engine: up on a swinging liana does not climb) -> RED "upright: swinging true, length 410 -> 410". (Two weaker plants in touchGestures stayed green: the stroke is a slow climbing stroke, not a lift flick.) |
| vineFollowUps: a fresh player, the swing lesson before the first let-go | moved: the new 1-6 teaches the swing (`w1Arc16.ts` brief `teaches: ['swing']`, brick w1-16-first-liana); a fresh player stood at the take-off ledge, camera snapped to him, waits for the liana, then the same loop and asserts | as above | P5 (lessons.ts pickLesson sees no vines) -> RED "seed 1 upright: , grab 2.2, let go 4.3" |
| vineFlickMirror: 1-6 real engine, flick up-left mirrors up-right | moved (same ledge and timed grab, `ledgeRun`/`catchWait`) | as above | P3 -> RED "upright flick up-left phase 0: 1 presses, swinging false, vx 0" |
| puzzleCamera: every puzzle room ... ('1-6 has puzzle rooms') | 1-6 dropped from STAGES | probe, RealPlay('1-6', 1..8): `kit.rooms` 0, `proto.kitDecor` 0, engine kit none | not a moved test (list shrink); no plant |
| writtenKeys: every golden seed the game writes | moved to 1-1 + 1-7 | probe: seeds per stage 1-1 `[no id]`, 1-6 none (gen2), 1-7/1-8/1-9 `seed-1` | P6 (saveFile seed key pattern without the hyphen, the EN-F bug) -> RED |
| dotTips: no puzzle gives the answer on entry | moved to 3-2 (3 rooms with enter/nudge/move, two with a mech) | probe of live hand stages' rooms: 1-7 2, 3-2 3, 3-5 3, 3-7 2 | P7 (helpAllows says everything) -> RED |
| sectionTrack: a straight run enters every stretch once, in order | moved to 1-7's beats | built `'proto'` | P8 (the stretch label never changes) -> RED |
| flowerReach: every pickup reachable (its `['1-6','proto']` pair) | moved to `['1-7','1-7']` | built `'proto'` | P9b (a flower inside 1-7's first bank, after every pass) -> RED (P9, a flower at y -2000 before the passes, stayed green: moved or dropped by them) |
| forgive G8: the Easy hold check | shell moved to 1-7's plan | `HAND_STAGES['1-3']` is undefined (1-3 is gen2), so it built the proto default | P10 (easyHoldCheck passes everything) -> RED "a 70% hold does not" |
| levelWalls: a trunk too tall is climbed | shell moved to 1-7's plan | same | P11 (no trunk blocks a jump) -> RED |
| layoutMemory: World 1 section-row stages / gen2 stages | 1-6 moved from the section-row list to the gen2 list | its section rows deleted; `GEN2_STAGES['1-6']` | P12 (isW1Stage still true for 1-6) -> RED |
| artDress: the branch gate up 1-6's seesaw banks + petal bundle per room | 1-6 half retired; petal bundle kept on 1-7 | `by('1-6')` = `HAND_STAGES['1-6']` undefined = proto default | P13 (no petal bundle) -> RED "seed 1 acorns-0" |
| artDress: Worlds 1 and 5 wear dressing sets (`['1-2','1-3']`) | World 1's pair moved to 1-7, 1-8 | both ids had no plan: it built the proto default twice | P14 (World 1 not dressed) -> RED "1-7: dressed" |

## Code

| Item | Decision | Evidence |
|---|---|---|
| protoStage.ts `PROTO_STAGE_ID` | deleted | `grep -rn PROTO_STAGE_ID src tools`: definition only |
| `StagePlan` 'proto', `buildProtoStage`'s default plan | deleted (seed and plan now required) | every caller passes a plan (grep `buildProtoStage(` src tools); tsc clean |
| the `if (plan === 'proto') {...}` beat block, `w1Stage` | deleted (`section` takes `plan as W1Stage`) | only plan 'proto' reached it |
| `DBL_PRACTICE`, `PRACTICE`, `dblPractice()`, `once('dblPractice')` | deleted | `plan === 'proto'` gate; readers: dblPractice.test.ts only (retired). gen2/worlds/w1.ts "PRACTICE" is its own word in comments |
| `kapok`, `logPuzzle`, `seesawRoom`, `seesawTwist`, `SEE`, `canopy`, `highRun`, `mixed` | deleted | callers: the proto block and the 1-6 section rows only (grep `\bfn\(` in protoStage.ts and `k.fn(` in w1Sections.ts) |
| W1Kit entries chain, kapok, canopy, highRun, logPuzzle, seesawRoom, seesawTwist | deleted (kit object and interface) | `k.chain/k.kapok/k.canopy/k.highRun`: only in w1Sections '1-6' rows. `chain()` itself KEPT: World 3 and 4 call it |
| `onP`, `endBank`, `topRock`, `cliff` | kept | used by World 1/3/4 pieces (grep: many lines) |
| World 1 dress regex `/^1-[467]$/` | 1-6 dropped (`/^1-[47]$/`) | buildProtoStage never sees 1-6. 1-4 left: also dead (1-4 is gen2) but not 1-6's, named here |
| w1Sections.ts '1-6' rows, `'1-6'` in W1Stage | deleted | isW1Stage readers: layoutMemory.ts (gen2 checked first: `GEN2_STAGES[id]`), layoutMemory.test.ts (moved) |
| dotLinesData hint.1-6 leapVine, log, logWall, trunk, canopy, tooHigh, fell, double | deleted | swapLine keys rows by OLD WORDS; grep of each row's old words over src/tools after the cut: no speaker (only dotLinesData itself; dotGuide.test uses the words as plain strings for classifyLine/GuideQueue, row-independent) |
| dotLinesData hint.1-6.grabVine | KEPT | its old words are the swing lesson's own words ("Flick up into the vine to grab it", lessons/engine); swapLine falls back to `list[0]` from any stage, and this row's null text cuts any engine line in those words: deleting it could make a live line be said again. Unsure, so kept |
| dotLinesData hint.1-6.shiny | KEPT | "Something shiny, far away..." is said live by protoStage `glideLookout` (World 1 kit) and is the moves journal riddle |
| dotLinesData way.1-6 | KEPT | the keeper line on the new 1-6 |
| dotTips.ts FIRST_OF 'hint.1-6.log' | deleted | its row is gone |
| dotTips.ts REMINDS_OF 'hint.1-6.shiny' | kept | row kept |
| stageSheets.ts W1_ROOMS '1-6' | deleted | 'kit-pieces' (puzzleArt) is drawn only for kit rooms and `proto.kitDecor`; the gen2 1-6 has neither (probe seeds 1-8) |
| stageSheets.ts `'1-6': ['foe:goldsnake']` | kept | the new 1-6's foe list |
| dotGuidePerch.ts | nothing to delete | PERCH_OVERRIDES is empty; the '1-6' was a doc-comment example, reworded |
| artDress.ts world1 `seesaw-show` skip and `branchGate` push | deleted | `dressStage` is called only by buildProtoStage; no live World 1 room id starts `seesaw-` (kit room's is 'seesaw', World 6's world is not 1). `branchGate` stays drawn by puzzlePlay.ts gates |
| puzzlePlay.ts | nothing deleted | no 1-6 table entry; `resetRoom`'s log reset is generic (the kit room's seesaw has a push log, kitStage.ts:344) |
| stageClue.ts, pokeyJournal.ts, levelSeeds.ts '1-6', stageTable.ts, w1Arc16.ts, gen2/worlds/w1.ts W1Feel '1-6', tools/validate W1 id lists | kept | the new 1-6's (or every World 1 stage's) |

After the cut, `grep -rnE "PROTO_STAGE_ID|DBL_PRACTICE|seesawRoom|seesawTwist|logPuzzle|\bhighRun\b|k\.canopy|k\.kapok|k\.chain|dblPractice\(|plan === 'proto'|hint\.1-6\.(leapVine|log|logWall|trunk|canopy|tooHigh|fell|double)\b" src tools`
finds only World 6's own `seesawRoom` section, lockall.ts's `'proto'` stage key, and the retirement note in dblPractice.test.ts.

## Checks

- `npx tsc --noEmit -p .`: clean (exit 0), after each commit.
- Touched tests alone: vineFollowUps 19/19, vineFlickMirror 3/3, dotTips + writtenKeys 12/12, artDress 7/7 (after commit 3).
- `npx tsx --test src/game/*.test.ts` (every file; nearly all import protoStage.ts): see "Suite" below.
- `npx tsx tools/engine/generalitycheck.ts`: "54 engine files (143 exempt under the engine folders), 27 literals, 27 known / PASS".
- `node tools/perf/knowncheck.mjs`: limits.json 14, generality.known.json 27, ciTests.known.json 17, artUse.allow.json 210: PASS.
- `node tools/roadmapcheck.mjs`: "shallow clone, proofs cannot be checked (fetch-depth 0): FAIL" (exit 2 before any check: this
  container's clone is shallow, `git rev-parse --is-shallow-repository` = true; not unshallowed, the .git is shared). No ROADMAP, known
  list or NEXT.md was touched.

### Suite

`npx tsx --test src/game/*.test.ts` on `fe1037cf` (commit 2; 20 min 47 s): **2422 tests, 2416 pass, 4 fail, 2 todo.**

| Failing test | Status |
|---|---|
| artDress: "World 1's rooms: the branch gate up 1-6's seesaw banks ..." | fixed by commit 3 (`034f0a0b`): artDress.test.ts alone after it, 7/7 pass |
| artDress: "Worlds 1 and 5: their stages wear dressing sets ..." | fixed by commit 3, same run |
| artUse: "every packed piece and art file is drawn, or on the reasoned allow-list" | **RED: F1** (`W6 ...w6balt.json#seesaw-b`) |
| vineSelfSwing: "self-swing: neighbouring vines never swing into each other ..." | pre-existing on 7904cb65 (baseline run), a DO NOT TOUCH file, not touched |

Before (7904cb65, the same command): 2437 tests, 8 fail; of the 7 old-1-6 failures listed in F6, all are now moved (passing) or
retired. 15 fewer tests: stage16 5, protoStage.test 5, roomLogReset 2, dblPractice 3 retired; artDress's 1-6 half folded into its 1-7
test.

## Findings

- **F1 (gate RED, needs the lead): artUse.test.ts.** `W6 src/assets/w6to10/props-made/w6balt.json#seesaw-b` has no draw site. It was
  counted "used" only by the deleted room-id template `` `seesaw-${ROOMS.length}` `` in the old seesawRoom (tools/art/artuse.mjs is a
  text check: template literals count as dynamic names). A false "used" the deletion exposes, not a new piece of unused art. Not added
  to artUse.allow.json (it only shrinks; knowncheck fails an added entry). Ruling needed: draw `seesaw-b` (World 6's seesaw room,
  w6Rooms.ts) or another decision.
- **F2: roadmapcheck cannot run here** (shallow clone, above).
- **F3 (a bug class): plan-less builds were silent.** Four tests built the old 1-6 without saying so, through `HAND_STAGES[id]` for an id
  with no hand plan (1-2, 1-3, 1-6) and the default: artDress x2, forgive G8, levelWalls. With no default now, an undefined plan still
  falls through `buildPlan`'s generic path without an error. Proposed countermeasure (not done: deletion-only scope): `buildProtoStage`
  throws on a plan HAND_STAGES does not hold, a test first.
- **F4 (the new 1-6's first liana needs timing):** a run off the take-off ledge's end with a jump at the edge catches the first liana on
  seeds 2 and 4 but not 1 and 3: the jump passes under its foot (seed 1: at x 3086 y 839, the foot at y 780) and he drops into the thorn
  pit. The self-swinging liana must be met; the moved tests wait on the ledge for it (`catchWait`, found by trying from the same vine
  clock). Not a test change of intent, but a fact about the stage a first-timer meets (cf. ENG-16E's kid Normal 1/6).
- **F5: P-02 (a room's pushed log put back by the signpost) has no live test now.** The kit test room's seesaw has a push log
  (kitStage.ts:344): P-02's intent could be re-homed there. Not done.
- **F6: the baseline full run on 7904cb65 is not clean for the files edited while it ran** (the runner loads each file when it gets to
  it; it picked up my vineFollowUps titles). Its untouched-file failures: puzzleCamera, P-02 x2, stage16 x3, vineFlickMirror (all old
  1-6), and `self-swing: neighbouring vines never swing into each other` (vineSelfSwing.test.ts: DO NOT TOUCH, not mine).
- Not moved: none. Failing on the live fixture: none (every moved test passes on it).
