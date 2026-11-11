# C1 report (R-165.72: 1-1 re-laid to the flown reach), Content, attempt 1. t-content-c1 on E0a d2748131 (E0 commits first)
**Method used:** a probe of every verdict by section over 200-600 raw builds a pass, both settings; fix by section; then the list, the Engine
member's relay test (a/b/c) and c1judge on the real list; seeds failing (b)/(c) left off the list. Root REPORT.md is E0a's: this is C1's.
**Lessons applied:** D37 (lives by the real loseLife: c1judge wraps GameEngine.prototype.loseLife), D39 (help room over every listed seed,
both settings, tallest case named), D40 (rebased each time E0a moved; checks taken from their owners, mine taken off the branch).
## 1. Done-items
1. Met. Rows below; bounce: 25 → 12 sections in 1-1, 77 → 32 mushrooms; double-asking sections 41 → 18.
2. Met. Every version with a 253-256 gap has an `easy` twin (single hops). `seedlist --check` PASS, 200 seeds, 0 refused, both settings.
3. Normal met (practice before every test, all listed seeds). Easy: relay (a) red on its reading, PUSHBACK 1. Bounce card: (a)'s check passes it.
4. Met. Relay (b), 327 seeds: 0 rises without room either setting; mushroom-given N 1,044 / E 1,044; tallest non-mushroom 281 px thin, room 584 of 400 (seed 32886, w1-backstep-twist).
5. Met. Relay (c): 834 falls put back before the need, 0 past it, 443 landed on a floor (each setting).
6. Met. List 200 (first 200 of 327 proven; cut for the chunk, §5). Lock: 101/102 unchanged, only 1-1. First run: seed 4106 (variant 11), locked, judged by --check.
7. One line FAILS: expert Normal put-backs 0.68 vs 0.60 (PUSHBACK 2). Rescues mid/expert 0; lives 0 on Normal (real loseLife, kinds: none); expert min 162.6 s (N); middle Easy min 175.5 s.
8. Stills polish/ (every piece type, both orientations, both settings); clips polish/*-75s.webm, see Polish.
9. Plank pieces: w1-plank-ledge-a/b/c (atlas 417/204/0,556; 211x27, 211x33, 202x35) drawn on every thin log (pickCut); w1-log-plank-a/b (1726/1526,362; 197x60, 198x65) not laid. Grey-moss boulders (holes) and the wide stump also C2's.
10. tsc PASS; suite 2,495 pass / 23 fail (§4); knowncheck PASS; roadmapcheck PASS (unshallowed); buildcheck PASS (p95 110/107 ms); drawcheck PASS (332 s); main chunk 4,190,374 bytes.
## 2. Bands (bands.md §5), today → now, w1.ts line
| Row | Today | Now |
|---|---|---|
| DOUBLE_TEACH 195-203 | gaps one jump crosses | gone; the teach is the D rise, `T` 979 / `riseFace` 149 (flat floor to the face, gapPx 0, block) |
| DOUBLE_TEST 205-228 | | 253-256 (130), Normal only, `practiceGap` 146 first; Easy twins |
| D Easy / Normal | 113.9 / 136-140 | `D_RISE` 132: Easy 128-132 (riseCap), Normal 137-140 |
| Thin rises (E, rungs, 725, 752, 827, 853, 1113-1294) | 136-140 thin | single steps `HOP_UP` 139 (no ground for a stair between floating pieces); `E` 985 a trunk in the D band; `THIN_RISE` 135 entered, laid nowhere |
| Post w1.ts:519 [110,114] | | checked: the log road's high logs, 134-138 over the floor road, off-route, a single from the 35-45 step bank: no double block |
| Bounce lips [-220,-200] | lip 200-220 | `BOUNCE_LIP` 237-245 (137), mushroom by `faceAt` 142: measured edges 23-57 px both settings |
| U, V [-260,-240] | | 237-245; U out of 1-1 (#63), V a walk face 1016 |
| Chains (log chain, chain-rise, mushroom chains) | doubles over open ground | single band, a catch bough under each gap; the mushroom chains out of 1-1 |
## 3. Sections changed (shared = its `feel` lists another stage; only stageGenerator.ts:2893, 1-1, builds from w1World: lock 101/102)
1-1-only: second-jump, leap-stones, mushroom-lift, double-teach, canopy-rungs(-level), stump-towers, canopy-weave(-rise), stilt-logs,
two-answers, bough-log, seed-perch, cache-stones, dip-/bank-double-teach, mushroom-bank-teach, dipping-boughs, log-chain(-rise),
mushroom-fork(-dip), descents #51 #52, twists #56 #58 #60, #62, #64, #66, #67, stair tests (D). Shared tags: fallen-trunk (1-3),
bank-stair-fork (1-2), high-walk (1-5), and every section's off-path petals; taken out of 1-1 (feel moved): high-leaps, hop-bounce, bounce-run,
twin-bounce, bounce-double, #59, #63, #65, #41 +back, #61 +level, mushroom-chain(-back), twin-mushroom-fork, stair-fork, root-stair-fork. Shared changes that move another stage: zero (lock); PUSHBACK 3.
## 4. Suite failures (23; on d2748131 alone 1-1 does not build)
8 closed-form reach (validateStage/doubleGap without the arcs: a 254 test gap read as unreachable or as needing the leaf): levels x2,
skills, layoutMemory, glideStages, stageQuality, flowerReach, stage11gen2:46 (its own doubleGap). E0a's E-next, Engine's files.
10 pinned seeds no longer listed (3747, 15458, 19582): softFalls11 x4, softFall11 x6. 1 verdicts.test seed 172 (E0a's). 1 w1Pits.test
(raw findW1Pits; E0a's realFalls closes the slot). 1 forks11 (8 clean raw builds of 24). 1 proven.test (seed 79191 walked off). 1 relay (a).
1 w4RealReach 4-3 (its own TODO). drawcheck: DRAWCHECK.
## 5. Pushback
1. Relay (a) Easy: the test gap must lie within 1,500 px of the teach (promises11), so it is inside the teach section; the check reads that
   section's own teach rise as "asks the double, not taught before it". Drawn: `[rest 280][T face 138][hop][hop][rest]` on Easy asks the double
   once, at the teach. Skip the teach's own rise, or move the test past the teach and widen the 1,500 px rule.
2. Expert Normal 0.68 vs 0.60: every extra put-back is at the ONE test each teach must hold (dip-double-teach 0.78/run, double-teach 0.44);
   bands.md's 252-262 lands a double flick ~70%. Laid at 253-256 and one test a stage; lower needs a gap one jump crosses or no test.
3. "Give 1-1 its own versions": no other stage reads these sections; copies would be dead code. If 1-2/1-3/1-5 move to gen2, cf0b7752 has them.
4. testlink1_1.json (not in my list) re-picked A 4106 / B 1025 / C 1136 (old seeds left the list; CONTENT card day one). Main chunk had
   ~13 KB too little room for 327 seeds: list cut to 200 (≥138).
## 6. Polish check (Matt's bar)
Pass: teach rise reads as a tall step off a flat rest; practice gap shows its floor, the test gap open (progress/, polish/); the lift's mushroom
glows at the face's foot; fork high roads carry petals; chains over catch logs. Rough, named: white mushroom-shaped DRESSING stands near real
mushrooms and in a test gap's backdrop (could read as bouncy: dressing, C2); thin logs draw as sawn planks (C2). Clips: a simple key pilot of
mine (not a player) plays ~60 s of real play on each, then stalls at the first test gap (Normal) and at the bounce lip (Easy) because it does
not aim a double or the mushroom; the tier bots cross both (c1judge). A full two-minute clip needs a better pilot: not done.
## 7. Off-path spots (R-165.108): 114 off-path pieces over every 1-1 version, 0 empty (w1.test, red at 31 before). First run (4106, N):
mushroom-fork-dip 13485-16550 high road 1 petal, 1 petal, a find; bank-stair-fork 21732-24779 1 petal, a find; canopy-rungs-level 24879-27754
low logs 2+2 petals; seed-perch 28946-31857 the seed; canopy-rungs 31954-34668 2+2 petals; sunlit-log 34786-35978 2 petals.
## Benchmark
TIMELINE.md. Read-in ~10 min; layout ~2 h; list builds 3 x 35-40 min; bots/relay ~30 min; stills, clips ~45 min; report 20 min.
Slowed by: E0a's head moving twice (lists rebuilt), 35 min per list build, no clip pilot. Would save: a per-section verdict probe, a 4-worker seedlist script, an in-browser bot.
