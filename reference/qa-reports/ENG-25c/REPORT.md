# ENG-25c REPORT: 2-5's snap stones level with the banks, the snapper's ground, the straddle (finished by ENG-25d)

Branch t-eng-25c (from t-int-13 d36638be). Code head **c794249d** (ENG-25c); FINAL HEAD: the commit that carries this report, sent to the lead (docs, the stills tool and this
report after it; no game code after c794249d). Written by ENG-25d, 11:10 PM ET Thu 11-19 (`TZ=America/New_York date` in the same command).
Turnover: reference/handoffs/engine-core.md §0zq-25c (ENG-25c) and §0zq-25d (ENG-25d).

## What changed (c7e046f8, c794249d)
1. **Snap rows laid level with the banks** (src/game/gen2/rideLay.ts layPads; snapFaults "not level with the banks"). Pads still float
   PAD_LAY.drop under. The snap toy's gaps are 30 px (tools/inspect/snapToys.ts; SNAP_FAIR.gap 30-40).
2. **The snapper's ground** (src/game/gen2/pipeline.ts beatCastFaults; BONK_LANDING { over: 107, past: 176 } from ENG-25b's bonkFlight):
   any clock-keeping animal (Enemy.kitBeat), any world: no floor higher than its ground within 107 px over its back, out to 176 px past
   its patch.
3. **A snap stone bites only with his MIDDLE over it** (src/game/pieces/padPiece.ts hurts: grounded, feet at its top, p.x within it),
   never by standingOnId (the lead's straddle ruling, 11-19).
4. **Three bot faults** (tools/inspect/firsttimer.ts, snap/kitBeat-only branches): overSmall never steers a snap hop back onto the stone
   it leaves (jump.snapFrom); at a stone's lip the press holds still through the thumb's lag (pending.still); a dazed snapper he can still
   reach is kept however far the bounce took him.

## The plants (RED before the fix, green after)
| Plant | RED file (before) | After (c794249d) |
|---|---|---|
| level with the banks (snapRow.test.ts) | reference/qa-reports/ENG-25c/red-level.txt: tests 1, pass 0, fail 1 | green (in the suite below) |
| the snapper's ground (w2Cast.test.ts) | reference/qa-reports/ENG-25c/red-ground.txt: tests 1, pass 0, fail 1 | green |
| the straddle (snapRow.test.ts) | reference/qa-reports/ENG-25c/red-straddle.txt: tests 1, pass 0, fail 1 (4 hearts lost standing across the water) | green |

## Before / after (ENG-25b's probes, base d36638be vs c794249d; ENG-25c's runs, files in reference/qa-reports/ENG-25c/)
| Measure | Before (d36638be) | After (c794249d) | File |
|---|---|---|---|
| Water: 5 lives lost at the pond, 24 runs | 24 runs had it (bites 0) | 0 (bites 0) | probe-before-water.txt / probe-after-water.txt |
| Snapper cleared clean, 40 runs | 39/40 | 40/40 | probe-before-snapper.txt / probe-after-snapper.txt |
| Snapper with the bot skill off | 0/40 | 0/40 | probe-before-snapper-off.txt / probe-after-snapper-off.txt |
| Flick from a stand: last stone up to the bank | 237/265 (89%), 26 into the water | 265/265 (100%) | flickFlight.txt |
| Flick from a stand: stone to stone | 255/265 (96%) | 263/265 (99%), 0 into the water | flickFlight.txt |
| Stone tops vs the banks | 34 px under | level | red-level.txt |

## The walkable finding and the lead's ruling (for BUILD-25 and the designer)
Level rows are WALKABLE (reference/qa-reports/ENG-25c/walkFlight.txt): his feet stand 13 px past a floor's end and the walk-off grace
carries him, so 30-44 px of water crosses dry with no hop (50 from a run; 56+ drops him). **The lead ruled 11-19: fine, 2-5's lesson is
the count, not the hop.** Do not "fix" it by widening the water without a design re-fly (SNAP_FAIR.gap is 30-40).

## The lock (reference/qa-reports/ENG-25d/lockall-vs-base-d36638be.txt)
- **vs BASE t-int-13 d36638be: 102/102 stages unchanged, PASS** (`lockall.ts --layouts 16 --out` in a worktree of d36638be, then
  `--check` on t-eng-25c with code c794249d; 3264 builds). Nothing shipped moves: 2-5 is not laid, and no shipped stage has a snap row or
  a kitBeat animal. (Its "gen2 gained verdicts and drops (not hashed)" line names every gen2 stage carrying verdicts; it is printed
  on every run and is not a move.)
- vs MAIN 6e7b85f8: 85/102 unchanged, 17 moved (reference/qa-reports/ENG-25c/lockall-vs-main-c794249d.txt: 1-6, 1-7, 1-8, 1-9, 2-1,
  2-2, 2-4, 3-8, 4-4, 6-1, 6-3, 6-6, 6-7, 7-5, 7-9, 8-3, 8-5). Because the branch equals its base on all 102, all 17 are **the base's
  own moves since main** (INT-13 carries 1-6..1-9, FIX-284's 2-x and ENG-285), now proven, not assumed.

## Gate table (THE CLAUDE.md list + CI's extras, once, game code c794249d; heads 1c019b81 / 53586c2e / 12506300 / 168cc28b carry only
docs, stills and the stills tools after it). Clock times by `date` (ET), 11-19.
| Gate | Result | Notes |
|---|---|---|
| `npx tsc --noEmit -p .` | PASS | 9:52 PM |
| unit suite, **6 shards** (`--test-shard=i/6`, the CI glob) | PASS | **tests 3938 / pass 3936 / fail 0 / todo 2** (shards 592/820/662/661/668/535; todo 1 each in shards 1 and 6), 9:57-10:34 PM |
| `BASE_PATH=/Sloths-Adventure-/ npx vite build` | PASS | 10:34 PM |
| chunkcheck | PASS | |
| artcheck | PASS | |
| knowncheck | PASS | |
| generalitycheck | PASS | |
| roadmapcheck | PASS | on full history 10:38 PM (FAIL 10:34 PM on the shallow clone: "proofs cannot be checked (fetch-depth 0)"; `git fetch --unshallow`, as CI checks out) |
| timecheck | PASS | the same: full history 10:38 PM (shallow-clone FAIL before) |
| coveragecheck | PASS | 10:17 PM; re-run for its log 10:58 PM PASS (13 built stages, 26 pieces, 5 known gaps) |
| registrycheck | PASS | 12 stages registered everywhere, 12 lists |
| seed lists `--check`: 1-1, 2-1, 2-2, 2-4 | PASS ×4 | 161 / 100 / 100 / 100 seeds, each clean on both settings |
| seed lists `--check`: 1-2, 1-3, 1-4, 1-5, 1-7, 1-8, 1-9 | PASS ×7 | 10:58-11:03 PM |
| seed list `--check`: 1-6 | PASS | 100 seeds, each clean on both settings, 777 s, 11:13 PM |
| engine tool tests (CI's 34 files, incl. the CLAUDE.md four) | PASS | tests 305 / pass 304 / fail 0 / todo 1 (run twice, both PASS) |
| tierBots | PASS | fail 0 (the 1-1 calibration does not move; firsttimer.ts's changes are snap/kitBeat-only) |
| tipwalk --layouts 4 | PASS | |
| paintcheck 1/3, 2/3, 3/3 | PASS ×3 | 1/3 453 s; 2/3 392 s (110 known ids, 0 new); 3/3 PASS with **0 builds of 0 stages** (the tool's own split leaves part 3 empty today) |
| kbdcheck | PASS | (its stills rewrite tracked PNGs under reference/qa/tester-page-1106/keyboard/: restored, not committed) |
| buildcheck | **PASS alone** | FAIL 10:36 PM under load (normal p95 196 ms vs 150; five jobs on 4 cores, load average about 7.8); alone 10:56 PM (paintcheck paused): normal p50 46 / p95 96 / max 123 ms, easy p95 50 ms: PASS |
| clipcheck | PASS | 83 known, 458 s |
| drawcheck | PASS | 720 s |
| lockall vs BASE d36638be | PASS | 102/102 unchanged (above) |
| funcheck | FAIL = base | FAIL on the branch AND on base d36638be with **identical** flag lines: "30 worse or new, 41 to lower or delete; 116 known, 1590 stage-layout flags" (reference/qa-reports/ENG-25d/funcheck-branch.txt, funcheck-base-d36638be.txt): the base's own flags vs main, none from ENG-25c |

## Stills (the TOY row on the real page, dev vite; the lead judged them)
The snap toy (tools/inspect/snapToys.ts's `step` pond: the toy kit's meadow and one pond of three snap stones, 30 px of water, no
animals) rolled by gen2 and planted in page memory as **2-7's** listed roll, with 2-7's real config (no game code changes).
**The backdrop is 2-7's** (the tool plants the row under 2-7). The deep-water tone line and the see-through bank in these frames are
fixed on t-eng-24e / ENG-24h, not here. The game's build for every shot: stones (x, y, w) (1753, 530, 80), (1863, 530, 80),
(1973, 530, 80), near bank (1383, 530, 340): **level**.
- **No pin, a real fall** (reference/qa-reports/ENG-25d/fallShot.mjs, fallShot.log): set down once in the air, the game runs, and the
  update after the frame he lands is held. Feet = top in the game (530 = 530) AND on screen by the camera and zoom (upright 538.8 = 538.8
  on the bank and on the stone; sideways bank 197.9 = 197.9, stone 218.4 = 218.4). The lead, 168cc28b: PASS (the landing crouch and dust
  puff, feet on the stone, both ways).
  - reference/qa-reports/ENG-25d/fall-upright-412x915-bank.png, fall-upright-412x915-stone.png
  - reference/qa-reports/ENG-25d/fall-sideways-915x412-bank.png, fall-sideways-915x412-stone.png
- **Pinned** (reference/qa-reports/ENG-25d/shootSnap.mjs, shootSnap.log): his middle over the middle stone (1903) and over the bank's lip
  (1703), feet on the floor's live top (530 = 530).
  - reference/qa-reports/ENG-25d/snaprow-upright-412x915-stone.png, snaprow-upright-412x915-bank.png
  - reference/qa-reports/ENG-25d/snaprow-sideways-915x412-stone.png, snaprow-sideways-915x412-bank.png
- **Three tool faults found and fixed on the way (ENG-25c's shootSnap.mjs; none in the game):** (1) `__play('2-5')` never started:
  the engine builds with 2-5's REAL config (purge, 12 enemies) and the toy has no animals, "no seed of 24 from 1 builds cleanly (the
  first: not enough enemies for the quota)"; and the dev server reloads the page on a stage's first launch, which forgets a page-memory
  plant. (2) Pokey see-through with the hurt face: the pin set invincibleTimer = 99 each frame, which the draw reads as the hurt blink
  (heroBlink.ts:16) and the hurt face (miloVariants.ts:152); now it is 0 for the draw. (3) Pokey floating 40-50 px: **p.y is his FEET**
  (engine.ts:4500 cy = p.y - p.height / 2; :6440 headY = p.y - p.height), and the pin set p.y = top - 48. **Not a draw bug: nothing for
  ENG-25 before BUILD-25.**
- A real tap hop (InputEngine.triggerTouchUp) did not take him off the bank in this harness; it was not chased (the fall settles the
  draw question). UNPROVEN in this tool, not a game finding.

## Lessons applied
- D30: every clock time here is pasted from `date` in the same command.
- D86 / D93: the suite line names its shard count and tests / pass / fail / todo; every gate line carries PASS or FAIL.
- "A packet that says how the engine treats a stage is proved with one pasted run": the stills tool prints the built stage, its config
  and the stones' positions from the running game (D62), not from the plan.
- "1-8 was judged ready on proofs from a DEV FIXTURE": these stills are the TOY row (one pond, no animals) under 2-7's slot, NOT 2-5. They
  prove the lay is level on the real page with World 2's sheets; 2-5 itself is proved only when BUILD-25 lays it.

## Learned (for the next engine member and BUILD-25)
- Fly the counter-move (walking) before calling a gap a hop (walkFlight.txt: 30-44 px of water walks across dry).
- A bot's "on" must use the engine's own rule (his middle over the stone), not standingOnId.
- (ENG-25d) A toy planted under a real stage id is built with THAT stage's real config: 2-5 is a purge of 12, so a toy with no animals
  never builds under 2-5 ("no seed of 24 from 1 builds cleanly (the first: not enough enemies for the quota)"). Plant a toy under a
  stage whose goal the toy can meet (a sprint), and plant with the config the engine will build from (worldsData.generateAllLevels).
- (ENG-25d) The dev server can reload the page on a stage's first launch and forget a page-memory plant; a stills tool must notice the
  reload (the page's hooks gone) and plant again.
- (ENG-25d) **The player's y is his FEET.** A tool that places him must set p.y = the floor's top, and must never hold invincibleTimer
  through the draw (it IS the hurt blink and face). Prove a placed still once without the placement: a real fall, feet = top on screen by
  the camera and zoom.
- (ENG-25d, my misses) The gate list's names come from the tool, whole: I read `registrycheck --lists` through `tail -3` and missed 1-2..1-9
  until registrycheck's own line said "12 lists". And when running gates side by side, every runner writes its own log names: two runners
  on one log name lost coveragecheck's log and mixed paintcheck 1/3's. Stop a runner by its PID, never `pkill -f` a pattern.
- (ENG-25d) roadmapcheck and timecheck FAIL by design on a shallow clone: `git fetch --unshallow` first, as CI checks out with
  fetch-depth 0. buildcheck is a timing budget: run it with nothing else on the CPU.
