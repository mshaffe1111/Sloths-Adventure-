# INT-12 REPORT: tonight's link head (t-int-12 from origin/main 6e7b85f8)

## Head
- **Gates ran on d7cb8240** (every gate once, below). The commit after it adds only this REPORT, stills and logs (docs). The pushed
  head is named in the last message to the lead.

## Merges (packet order 4, 3, 1, then 2 when final)
| # | Branch @ hash | Merge | Conflicts and resolution |
|---|---|---|---|
| 4 | t-eng-24 @ b0e94c85 | 3cf7614e | none |
| 3 | t-art-22p @ 877f12f6 | 17c65361 | engine-core.md top section: both kept (labels suffixed 0zm-22p / 0zl-24 in bbb00685; BUILD-19's 0zl/0zm/0zn kept as its REPORT cites) |
| 1 | t-build-19 @ 2097adf7 | adb5392a | gates.yml tool-test line (lianaRide + boaBots); CATALOG-MASTER.csv (all rows, no dup ids); HF-SPEND.md (ENG-19a/b then ART-22P + combined ~$52.5) |
| 2 | t-var-1 @ c7648f35 (VAR-1 + VAR-1b) | 8f209501 | gates.yml (+ sweeper.test); provenIndex merged clean (VAR-1's 1-6/1-7, main's 1-8, BUILD-19's 1-9) |
Code touched by two branches (hunks apart, read): pipeline.ts, levelCheck.ts, firsttimer.ts (ENG-24 + BUILD-19); stagePlan.ts, stagePreload.ts (ART-22P + BUILD-19).

## Fixes on t-int-12 (each its own commit)
- **25b3bddc tierBots (ENG-24's miss):** tierBots.ts:39-40 added ontoLog/fromLog to the run row, calibration-main.jsonl not recommitted
  (BOTS.md:10-12); red on b0e94c85 alone. Re-run per BOTS.md: 210/210 lines identical except the two fields, 0 in all 200 runs. 7/7.
- **903c41f7 1-6 data (w1Pits "1-6 26199: a soft pit with no step out", the lead's ruling 5:44 PM):** not the fern gap: VAR-1's
  w1-16-rest-dip (floor 150-156 under the bank, a vine up the far wall) is a soft pit with no step. A stump (block, painted cut
  w1-rock-slabs-stacked-big, 137x75) flush against the near wall; 550+ px from the far wall, so the vine is still the way on. Test untouched.
- **d7cb8240 relists:** 1-6 rebuilt (100/100, e98480ba); 1-7's relist identical to VAR-1b's (89b45774). No other list moved (11/11 --check).

## Gates on d7cb8240 (all PASS)
| Gate | Result |
|---|---|
| tsc / knowncheck / generality / roadmapcheck / registrycheck / coveragecheck | PASS / PASS / PASS (26 known) / PASS / PASS (11 stages) / PASS |
| suite, 3 shards, 6:19-6:54 PM | 3,838 tests, 3,836 pass, 0 fail, 2 todo (pre-existing: 4-3 boulder + 1) |
| BASE_PATH vite build + chunkcheck + artcheck | PASS / PASS / PASS |
| drawcheck (every stage both ways) / clipcheck / kbdcheck | PASS 796 s / PASS (83 known) / PASS |
| buildcheck (alone) | PASS: N p95 95 ms, E p95 56 ms |
| seedlist --check, all 11 lists | PASS each (1-1 161, 1-5 150, the rest 100) |
| CI tool line (24 files, gates.yml) / tipwalk / tierBots | 223/223 / PASS / 7/7 |
| lockall vs main --intended 1-6,1-7,1-9,2-2 | 99/102 unchanged; moved 1-6, 1-7, 1-9 (intended); 2-2 and 1-8 unchanged |

## castBots 1-40 x tiers x both settings (calibrated: child, middle, expert)
| Stage | Calibrated | First-timers (kid / adult) | Easy fewer hits/lives |
|---|---|---|---|
| 1-3 | all 40/40 | 40/40 both | yes (child 21->6, middle 13->4 hits) |
| 1-6 | E 40/40; **N child 38 (L28 creaky-landing liana pit; L34 gorge pit), middle 39 (L39 gorge)**, expert 40 | N 29 / 38 (main 36 / 39, VAR-1 §4 record); E 40 / 40 | yes (E 0 lives) |
| 1-7 | all 40/40 | N 39 / 39, E 40 / 40 | yes |
| 1-8 (main's data) | N child 36 (seeds 9,17,25,35 = main's 36, VAR-1 §4), rest 40/40 | 40/40 | yes |
| 1-9 | all 40/40 | 40/40 both | yes (hits N->E: child 228->72, middle 84->48, kid 378->280) |
| 2-2 | all 40/40 | kid N 38 (seeds 6,32 rescued = FIX-22's on main), rest 40/40 | yes (lives N->E: child 230->24, middle 115->19) |
1-6's three calibrated misses: ACCEPTED AS TRACED for tonight's link only (the lead 6:22 PM): the bot's pit-way-back family in beats
unchanged from main, none at the new step; ENG-285 re-runs exactly these rows tomorrow; any still missing = a 1-6 level fix before release 1.

## funcheck (advisory, the lead 3:48 PM; funknown untouched by me)
main 34 worse/new (funcheck-main-6e7b85f8.txt) -> head 30 (funcheck-final-d7cb8240.txt). Gone: 11 of the 12 1-6/1-7/1-8 flags + 1-9 N
repeat. Left: **1-6 N "repeat" 6/16 (main 14/16)**, "JJJV" x4 at x9165 L1 = w1-16-hang-low's walked ground; the same 6/16 on VAR-1's own
c7648f35 (read-only check), so VAR-1's data, not the step. New: only 1-9 (8, BUILD-19 never ran funcheck): N/E like the stage before (1-8),
N like an earlier stage 6/16, E enemy by a landing, E/N nothing new, E repeat, N dead walk. R-165.291 (1-9 variety) before any release.

## Polish check (stills/: contact sheets of 28 stills, layout 1 seed 2, setting read back from the game, 2x, whole screen)
- 1-6 walk-ins (hang-low, snakes-met, snake-on-vine) N + E, both ways: painted banks, slab steps, vine; nothing code-drawn.
- 1-6 dip step (zoom-dip-step.jpg): Pokey stands on a painted mossy slab stack ~0.7 of his height, bank above-left, floor + petal right:
  reads as a step, to scale. Far wall (zoom-dip-far.jpg): checkpoint flag and the vine round its post.
- 1-7 moss bank N + E: painted mossy floor, boulders, mound (E); the round thing is the cracked-nut decoration. ROUGH, named: Dot's
  arrival card is open in every 1-7 still (the tool does not tap through; top upright, over the soil sideways, never over Pokey).
- Named: meter 1-7 N 1.9 / E 1.3 (VAR-1b's read, low, not tuned).

## Unresolved / for the lead
1. 1-6 N calibrated misses (above), ENG-285. 2. 1-9's funcheck flags, R-165.291. 3. 1-6 N repeat 6/16 (VAR-1 data). 4. Packet misses:
ENG-24 (tierBots) and BUILD-19 (funcheck) never ran a gate their change reaches: the packet template should name tierBots + funcheck.

## Lessons applied
D57 (inbox at every step), D59 (nothing left running at report), D62 (setting read back from the game, not ?difficulty), D79 (whole
screen), D81 (drawcheck every stage), D83 (probes outside the repo), D29/law 5 (every gate once on the exact head), law 22 (test untouched).
Turnover: no engine code changed by me; engine-core.md labels only (bbb00685).
