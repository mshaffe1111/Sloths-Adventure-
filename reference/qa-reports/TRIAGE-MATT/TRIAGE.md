# TRIAGE-MATT: the 43 open Matt-reported ROADMAP rows against today's code (R-165.219, R-165.220)

Written 9:34 PM ET 11-13 by TRIAGE-MATT (Opus 5.5, docs, read-only). Branch t-triage from origin/ccr-ea739a2f-dfcee4. Code checked:
origin/t-int-6 @ 741c181c (what 0.9.8 ships), in a read-only worktree. Rows: every `REPORTED BY MATT` row on reference/ROADMAP.md
whose state is not `done` (43). ROADMAP.md is NOT edited: the lead applies these verdicts.

**Counts: STILL TRUE 27 · FIXED 8 · MOOT 4 · NEEDS A RUN 4 (= 43).**
NEEDS A RUN is a fourth label, named plainly: rows the code alone cannot settle (a feel, a phone, a still). Each says what run settles it.
"part" means a row whose main fault is fixed but a named piece is still open; it is counted where the open piece puts it.

Where a stage is: gen2 lays 1-1..1-5 (src/game/gen2/worlds/stageTable.ts:33-47); the old builders lay 1-6..1-9 and Worlds 2-10
(src/game/protoStage.ts:70 HAND_STAGES and the world files).

| R-id | Verdict | Evidence (t-int-6 unless said) | Stages |
|---|---|---|---|
| R-1.2 | STILL TRUE | No frame-by-frame defeat walk exists: reference/qa-reports has only `croc-defeat`; R-1.16 still open on the roadmap | all 10 bosses + Thornbark |
| R-5.4 | STILL TRUE | No Normal-arc tuning landed for Worlds 2-10 (no commit names it; row blocked by R-5.2, R-152.6, R-149.4). World 1 is gen2 with its own bands (gen2/reach.ts BANDS), so it is out of this row's scope now | W2-W10 |
| R-5.23 | STILL TRUE | src/game/rules.ts:157-179 unchanged: star 2 = hearts >= 50% OR fast (167); lives lost only blocks star 3 (174); no continue count reaches it. Matt's tiered cap is not in | every stage, 1-1 and 1-4 included |
| R-6.1 | STILL TRUE | protoStage.ts:3615 `block(r0 + W, r0 + W + 120, 330)`: the wall is still 330, not 370 | 3-9 |
| R-6.2 | FIXED (in code; commit not traced) | engine.ts:3419-3431: the sealed door says its line on EVERY touch (1.2 s cooldown, only skipped while another hint is up); dotTips.ts:8 "why an exit is locked (always)"; guide() (engine.ts:8989) has no once-per-phone gate. A 1-9 run with a short goal would confirm | 1-9 |
| R-6.3 | STILL TRUE | No game-wide prop-grounding test (grep of every *.test.ts and tools/perf for grounding/floating props: none). Whether W2's planters still float needs the W2 walk (no `planter` in W2 code today) | W2, every world |
| R-6.20 | STILL TRUE | src/game/meecaStage.ts last changed 61664186 (11-01, "three log crossings... camera settles"), nothing on the far-wall overlap or the look-alike gully stairs | 5-M |
| R-6.27 | STILL TRUE | src/game/w4Stage43.ts last changed d0586546 (10-29), before the 11-01 report; no fix commit | 4-3 |
| R-6.28 | STILL TRUE | src/game/patience.ts unchanged since the report; w4Play.ts's only later change is 189fba47 (11-12, the double-jump fact, not the mist) | 4-7 |
| R-6.29 | STILL TRUE | No arc rule for petals over pits in World 4; and gen2 lays gap petals on a FIXED shape, not a jump's arc: gen2/pipeline.ts:2826-2828 (`g.y - 70 - 50*sin`) (see R-165.135) | 4-7; every gen2 stage with a gap |
| R-6.30 | STILL TRUE | The mist bank code (w4Play.ts) has no fade change since the 11-02 report (only 189fba47) | 4-6, 4-7, 4-9 |
| R-142.2 | FIXED (part) | 1-1..1-5 are gen2 (stageTable.ts:33-47); 1-6..1-9 are the engine build under way now. The row's "held: after launch" is stale | 1-1..1-5 done; 1-6..1-9 in build |
| R-150.1 | MOOT | The rhythm validator (fun-validator 15aa4de7, 7909cf11) never reached t-int-6 (`merge-base --is-ancestor`: not). gen2 stages have the cadence check (src/game/cadence.ts: ratings must ramp and cool, never flat) and designed arcs (w1Arc12-15). What is left on old stages is replaced by the 1-6..1-8 build and later worlds' moves | old-builder stages |
| R-150.4 | STILL TRUE | The mechanics-in-use audit is not on t-int-6 (15aa4de7 not an ancestor); no per-stage mechanic count runs. Matt's "3, 4, 5 all felt the same" is untouched | W2-W10 |
| R-150.6 | STILL TRUE (part) | FEEL-VINE (7b77ff96, merged 34782034) smoothed the snaps (grab 40->10 px, leap 50->6 px, its REPORT); Matt's broader "vines are the weakest part" has no other work | every vine stage, 1-4 most |
| R-152.1 | STILL TRUE | src/game/zones.ts:192 `WIND_GROUND_SHARE = 0.4`, unchanged; no measurement of landings committed | wind stages (W2-W10) |
| R-152.2 | STILL TRUE | zones.ts:174-178 drowsyLevel/drowsyJump unchanged; 58530a0b still not verified | sleepy-mushroom stages |
| R-152.3 | STILL TRUE | No repeat cap or twist for monkeys on a log in any commit | capuchin-log stages |
| R-158.1 | STILL TRUE | 1-7 is still the old builder (protoStage.ts:70); watcher.ts sweep unchanged. Its 1-6..1-8 rebuild this sprint may replace it | 1-7 |
| R-164.1 | MOOT | 1-2 is now gen2's library roll (stageTable.ts:37, w1Arc12.ts); RF REPORT (b8e98fac): not reproduced, the w1Rhythm.ts fall zones are gone, no World 1 heart-fall zone over a ledge | (was 1-2) |
| R-164.2 | STILL TRUE | 1-1 plays one set, w1sun2 (stageBackdrops.ts:24); the canopy/high sky is only for 1-8 and ascents (paintedBackdrops.ts:169). Whether gen2 1-1 climbs high enough to want a change is a design call | 1-1 |
| R-164.4 | NEEDS A RUN | The cross-fade draws the ground mid strip and the canopy mid strip both at part alpha (scenery.ts:2289-2300), the same as when reported. 1-4 is an ascent so it runs this path. Settles with: stills of 1-4's climb mid-fade, both ways | 1-4, 1-8 |
| R-164.6 | MOOT | RF REPORT (b8e98fac): the mixer's 1-5 Matt shot is gone (0.9.5); not reproduced on the merged engine | (was mixer 1-5) |
| R-164.7 | FIXED | 20737aa0 (RF, 11-12): a ledge/log/branch top under the HUD no longer fades it; test seeThrough 3 red before, green after; stills reference/qa-reports/RF/hud-*.jpg | all |
| R-164.8 | MOOT | RF REPORT (b8e98fac): not reproduced; the dark box in RF's own stills was the still-shooter (one render), gone at 30 rendered frames | (was mixer 1-5) |
| R-165.105 | STILL TRUE | The middle strips named are unchanged since before the 11-11 finding: w1-mid 86f3f06a, w1c-mid 72a0476e, w1sunrise-mid ba1a0804 (all 11-01); w1kapok/w1rain only re-encoded (144924b7). w1sunrise-far was repainted (2751ecab, 11-12), so its white blobs part may be gone. 1-1 plays w1sun2 (not on the list); 1-4 plays w1 + canopy w1c (both on it) | 1-2..1-5 (1-4 most), 1-7, 1-9, W2-W10 climbs |
| R-165.109 | STILL TRUE | engine.ts:3243 still shows `SECRET! GOLDEN SEED n OF m`; gen2 still lays it (gen2/worlds/w1Cast.ts, w1Arc15.ts, pipeline.ts). No cacao pod art or reward wired | 1-1..1-5, every stage with a golden seed |
| R-165.122 | FIXED | aeff31b2 (P11, 11-12) re-landed hopLay after the 3616dfd9 revert: gen2/pipeline.ts:1231-1233, every hop rock laid at WALL_H or taller and its climb judged; planted test src/game/gen2/hopRocks.test.ts | 1-1 (judged stages) |
| R-165.124 | FIXED | aeff31b2 (P11: Matt's seeds 21537, 15406, 15458 planted) + 7fcf330e (Y2: dead-zone petals repaired inside a roll); tests gen2/landings.test.ts:2, landFlights.test.ts, landingRepair.test.ts | 1-1 (all judged stages) |
| R-165.129 | FIXED (pending Matt's eye) | RF b8e98fac fixed the thorn hollow (EN-W Roughs 1-4: root column, grey-green box, straight cut, foot box, thorn contrast, late load); RF2 80625259 (the lighter box between the earth pillars) and 5b19bf37 (strip foot over a chasm) | 1-1, 1-2 |
| R-165.130 | STILL TRUE | The fix (t-engine-predators 67adfa44) is not on t-int-6 (the object is not even in this clone); 1-7's acorn meadow noise lure is still there: protoStage.ts:1926-1948. The 1-7 rebuild may replace it | 1-7 |
| R-165.131 | NEEDS A RUN | No cause in code: maxHearts is 5 (+1 thorn heart) (secret.ts:55). Settles with: a World 8 run taking a hit and a fall, hearts read before and after | W8+ |
| R-165.132 | STILL TRUE | No length pass on Worlds 2-10. gen2 W1 has no ceiling and floors held (gen2/length.test.ts), so 1-1..1-5 are out of scope | W2-W10 (1-6..1-9 until rebuilt) |
| R-165.133 | STILL TRUE | rules.ts:173 still asks a timed stage to be done in 60% of its limit for star 3, so a flawless slower run gets 2 | every timed stage, 1-1 |
| R-165.134 | STILL TRUE | No stall fix landed; STATE.md:410 (11-11 7:52 PM ET): low-end phones drop to about 20 fps; the WebGL lane (R-3) is the planned fix | all, 1-1 and 1-4 included |
| R-165.135 | STILL TRUE | Gap petals are laid on one fixed shape for both settings (gen2/pipeline.ts:2826-2828); the per-setting arcs only JUDGE reach afterwards (petalPass.ts:20-23 linkArcs(difficulty)), they do not place the petals. So on Normal the trail can still sit off the double's line | 1-1..1-5 (every gap with an arc) |
| R-165.136 | NEEDS A RUN | 17110e7b (11-06) capped a stone's stretch at 1.5x (w1CutArt.ts:32 MAX_STRETCH); "jaggy edges" needs a close still of 1-1's rocks, both ways | 1-1 |
| R-165.137 | NEEDS A RUN | No controls change for sideways found; settles with an input-to-move latency measure upright vs sideways on the real page | all |
| R-165.138 | FIXED | 0c316859 (F12, 11-12): verdict chain.mount refuses a chain whose first cap needs more than a plain hop, every judged stage, both settings; planted test gen2/chainMount.test.ts | 1-2 (all judged stages) |
| R-165.212 | STILL TRUE (part) | POLISH-2 (cbc688a4, dcdebb01; lead PASS on the fig lock 6:31 PM): a shut gate is a lid from below and a thorn tangle that settles a notch a fig. Left (POLISH-2 REPORT, EXACT NEXT STEP 2): a 3-fig gate clip, an Easy lock clip, the lock's sound (UNHEARD) | 1-4 |
| R-165.213 | FIXED | f2b8b1c8, 48cf2ad7 (POLISH-2): the pod tell is painted silk tufts (src/assets/w1-1113/w14-fluff.webp), four loose ones, never a column; lead PASS tufts v2 6:31 PM. Circles draw only while the picture loads | 1-4 |
| R-165.214 | STILL TRUE (part) | FEEL-VINE 7b77ff96 (merged 34782034): a drawn-only settle at every snap (vineFeel.ts; 7 planted tests). Left (its REPORT): the camera, named as the exact next step; Matt has not felt it | 1-4 (every vine stage) |
| R-165.216 | STILL TRUE | Held for Matt's testers' notes; climb speed and air steering unchanged | 1-4 |

## The polish lane's input: STILL TRUE rows on 1-1 or 1-4, most player-visible first

1. **R-165.216** (1-4): vines too fast and hard to steer. 1-4's core feel; held for Matt's testers, then measure against R-165.178's 1.6.
2. **R-165.214 part** (1-4): the vine-to-vine camera, FEEL-VINE's named next step; Matt has not felt the settle yet.
3. **R-165.212 part** (1-4): the fig gate's last pieces: a 3-fig gate clip, an Easy lock clip, the lock sound heard on a phone.
4. **R-165.135** (1-1, 1-4 gaps): petals over a gap on one fixed shape, not on each setting's own arc (pipeline.ts:2826-2828).
5. **R-165.109** (1-1..1-5): the golden seed still reads "GOLDEN SEED", Matt's "out of place" pickup; needs the cacao pod art and a reward.
6. **R-165.105** (1-4): the w1 and w1c middle strips cut a tree in a straight line where they repeat; 1-4 plays both.
7. **R-5.23 + R-165.133** (every end card, 1-1 and 1-4 included): stars ignore lives lost and continues, and a flawless 1-1 gets 2 stars.
   Engine work (rules.ts:157-179), not art; listed because Matt sees it at the end of every stage.
8. **R-150.6** (1-4 most): vine polish as a whole, beyond the snap FEEL-VINE fixed.
9. **R-165.134** (all): low-end phone stalls (about 20 fps); the WebGL lane, not a polish job.
10. **R-164.2** (1-1): one sky, no change on the climb; a design call whether gen2 1-1 climbs enough to want it.

To settle with a run on these stages (NEEDS A RUN): **R-164.4** (1-4 canopy cross-fade seams: stills mid-fade, both ways), **R-165.136**
(1-1 rocks' jaggy edges: close stills), **R-165.137** (sideways responsiveness: a latency measure).

## Not checked, named plainly

- No game was run: every verdict is from code and commits. FIXED rows marked "pending Matt's eye" are fixed in code with the helper's
  stills; Matt has not seen them.
- R-6.2's fix is read in code; the commit was not traced.
- The World 2, 4 and 5 rows (R-6.3, R-6.20, R-6.27..R-6.30) were judged by "no change since the report"; no stills were shot.

## Lessons applied

D34 (every fact cites file:line, checked when written), D36 (read-only: a separate worktree of origin/t-int-6, never a checkout in a shared
tree), D30 (the time pasted from `date`), law 3 (check the fact in the code before acting on it), law zero (what was not run is named).

## Method update

There is no method file for triaging roadmap rows against code. What worked: (1) pull the open rows with
`grep -i "reported by matt" reference/ROADMAP.md | grep -v -i "| done"`; (2) `git log --oneline -E --grep="<R-id>"` on the shipping branch
for each row finds the fixing commit fast (it found R-164.1/6/7/8, R-165.122, .138, .212, .213); (3) `git merge-base --is-ancestor <sha>
HEAD` proves whether a "fixed on branch X" commit really ships; (4) a file's last commit date against the report date settles "unchanged".
What failed: a fix's sha quoted in a row (67adfa44) may not exist in the clone at all; say so rather than guess. Proposed: add these four
steps as reference/methods/triage.md (the lead decides).
