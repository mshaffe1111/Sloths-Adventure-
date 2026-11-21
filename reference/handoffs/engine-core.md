# Handoff: engine-core (the Engine member's turnover note)

Merged at INT-14 (11-20, t-int-14): §0zq-25d/§0zq-25c ENG-25c (2-5's snap rows level, the snapper's ground, the straddle), §0zq-NOISE ENG-NOISE (one noise channel), §0zq-PROWL ENG-PROWL (sight.up + the leap), §0zq-small3 ENG-SMALL3 (R-165.317/.319/.321), and PAINT-292 (World 1's painted planks and stones; no section here). Merged at INT-13 (11-19, t-int-13): §0ENG23 ENG-23 (followers, the heron reads the line) and §0zl-168 TIME-168 (timecheck), §0zm-25b ENG-25b (the snapper bot skill, the meter's snap channel) and §0zl-25 ENG-25 (2-5's snap stones and snapper rows), §0zn-26b ENG-26b and §0zm-26 ENG-26 (the water wheel), §0W2A ART-W2A (2-3's painted follow poses), §0zo ART-W2B (the wheel's painted draw), §0zo-285c/§0zo-285b/§0zo-285 ENG-285 (the judges and bots fly the engine's Pokey), §0zp-284 FIX-284/284b (2-2's big pads, the real tap hop), §0zp-24d BUILD-24d, §0zn-24c ENG-24c (the raft look, the glow) and §0zm-24 BUILD-24 (2-4) joined; rewritten at the INT-12 merge (11-18, t-int-12): four members wrote here the same day, so labels are suffixed where they met: §0zm-22p ART-22P (CI's seed-list matrix, R-165.278); §0zl-24 ENG-24 (a liana over a river; its REPORT cites it as §0zl); §0zm BUILD-19b, §0zn ENG-19c and §0zl BUILD-19 (t-build-19, the labels its REPORT cites). Before them FIX-22b (11-15): section 0zk.

## 0zq-23b. BUILD-23b (t-build-23, 11-20 evening; this entry 9:24 PM ET by `date`): two engine pieces and three engine-side fixes on 2-3
- **Designed cage socket** (pipeline.ts fillSockets, 3f958e630 + its planted test ad2d9e15a, src/game/gen2/designedCage.test.ts): a
  socket with role 'objective' whose allow holds 'cage' (and a little one's kind) lays that cage where it stands, every one. A rolled graph's
  nodes carry no objective quota, so without it a designed stage lays no cage. Any world's designed cage uses it.
- **Heron look** (followArt.ts lookInView, cd44b43fa): the look (gaze + wash) is drawn while its wash OR the heron is in view. Trap: the
  wash's sight is 70 px and a sweep starts 160 px past its stretch, so a still shot at a sweep's start shows a head-up heron with no wash.
- **World 2's new sheet** (w2NewArt.ts; riverArt.ts W2Decor.nw drawn by drawW2Decor; stageSheets 'w2-new'; stagePreload): a stage lays a
  w2-new piece as World 2 dressing. A climb whose look is a painting sets Vine.rope (protoArt.ts skips the kapok trunk; no play change).
- **sheetWarm** (stageAnims, stageExtras): no eagle on a follow stage (herons in the watcher's place), no props2 for reed clumps.
- **HUD faces** (followFaces.ts pure; engine.ts lineFaces(); VineHud lineFaces prop polled every 150 ms, redrawn on facesKey change;
  components/hud/LineFace.tsx). Trap: `.vh-slot:not(.on) > *` silhouettes any slot child; LineFace sets filter none inline, its tone on
  an inner layer so the '!' keeps its amber.

## 0zq-TAB. FIX-TAB (t-fix-tab from 453b69c2 + t-int-14, 11-20 afternoon): a bank's end steps down to the bank beside it (R-165.344)
**Done, proven:** protoArt.ts `stepDownTo(p, banks, side)`: an open bank end steps down to the HIGHEST lower bank that meets it (the one
against its face). drawGround's lower() took the FIRST one listed: at a wall with a stair of step banks standing on the floor at its foot (1-6,
1-7, 8-x, 7-5/7-9 Easy, 5-M), that was the buried floor, so the wall's end face and its soil's cut-back (`faceCut`, drawBankArt side()) ran
down past the steps, and the notch was left to the floor's lip run under the wall (lipUnder) or to nothing: a grass tab under World 1's painted
stones (100 in W1), a see-through box (7-5, 5-M), a column of chopped lip pieces (W8). Planted: groundSeams.test 'R-165.344' (21 visible lip
rows -> 0). Reach: 425 open ends in W1/W5/W7/W8, all drawn, before/after in reference/qa-reports/FIX-TAB/stills/before-after/.
**Traps:** (1) a module imported from the page by `import('/src/...')` is a SECOND copy once Vite has HMR'd it (?t=): its state is not the
game's; force the live draw with a hook instead. (2) `lockall.ts --help` is not help: it starts a full record. (3) The probes need two
probe-only hook lines (probe/lipprobe.mjs header); never commit them.
**Open (named):** a deep plinth (step 48-59 below) stops its face flat at the step's top with straight soil below: a straight foot edge,
already on the base's unchanged plinths (8-6 x18365, 2-1 x1400); the fix makes 8-2's first stair step one more. A packet: draw the lower
bank's lip over a plinth's foot after the banks, as stepFootLips does between two floors. R-165.345 (the depth-shade step) not touched.

## 0zq-25d. ENG-25d (t-eng-25c, 11-19 9:50-11:10 PM ET): ENG-25c finished: lock, gates, stills, REPORT (no game code; code head c794249d)
- **REPORT: reference/qa-reports/ENG-25c/REPORT.md** (the gate table, the lock, the stills, Learned). lockall vs BASE d36638be 102/102
  unchanged; so vs main's 17 are the base's own. funcheck FAILs identically on base and branch (the base's flags).
- **Stills of a toy row on the real page:** reference/qa-reports/ENG-25d/shootSnap.mjs (pinned) and fallShot.mjs (no pin: a real fall,
  the update held the frame after he lands). Plant a toy under a stage whose goal it can meet (2-7, a sprint) WITH that stage's real config
  (worldsData.generateAllLevels): the engine builds with the real config, and 2-5 is a purge of 12. The dev server reloads the page on a
  stage's first launch: re-plant. **p.y is Pokey's FEET** (engine.ts:4500); invincibleTimer drawn = the hurt blink and face.
- **The real tap hop** (InputEngine.triggerTouchUp from a script) did not take him off the bank in fallShot's harness: not chased, UNPROVEN.
- **EXACT NEXT STEP (11:13 PM ET):** none for ENG-25c: every gate in the REPORT's table is PASS (funcheck FAILs identically on the base: the
  base's own), 1-6's list included (PASS 11:13 PM). INT-14 merges t-eng-25c; BUILD-25 lays 2-5 on it (BUILD-25 still proves 2-5 itself:
  these stills are the toy under 2-7).

## 0zq-25c. ENG-25c (t-eng-25c from t-int-13 d36638be, 11-19 evening): snap rows level with the banks; the snapper's ground; the straddle
- **A snap row's floors sit level with the banks** (rideLay.ts layPads; snapFaults "not level with the banks"). Pads still float PAD_LAY.drop
  under. The flight (snapClock.ts) flew it level; at 34 px under, the flick from the last stone up to the far bank lost 26 of 265 to water.
- **Level rows are WALKABLE** (reference/qa-reports/ENG-25c/walkFlight.txt): his feet stand 13 px past a floor's end and the walk-off grace
  carries him, so 30-44 px of water crosses dry with no hop (50 from a run; 56+ drops him). The lead ruled 11-19: fine, 2-5's lesson is the
  count, not the hop. Do not "fix" it by widening the water without a design re-fly (SNAP_FAIR.gap is 30-40).
- **A snap stone bites only with his MIDDLE over it** (padPiece.ts hurts: grounded, feet at its top, p.x within it), never by standingOnId:
  straddling 30 px of water his toes touch the next stone. Any bot or tool that asks "is he on a biting stone" must use the same rule
  (firsttimer.ts snapGo's flee branch does).
- **The snapper's ground** (pipeline.ts beatCastFaults, BONK_LANDING { over: 107, past: 176 } from ENG-25b's bonkFlight): any clock-keeping
  animal (Enemy.kitBeat), any world: no floor higher than its ground within 107 px over its back, out to 176 px past its patch.
- **Bots on a 110 px pitch** (30 px water; the run tap is 119 px): he arrives at stones' far lips. Three traced bot faults fixed in
  firsttimer.ts, all snap/kitBeat-only: overSmall never steers a snap hop back onto the stone it leaves (jump.snapFrom); at a stone's lip
  the press holds still through the thumb's lag (pending.still); a dazed snapper he can still reach is kept however far the bounce took him.
- **Stills of a toy row on the real page** without game code: reference/qa-reports/ENG-25c/shootSnap.mjs plants the toy as 2-5's listed roll
  in page memory (dev vite). Use its pattern until 2-5 is laid (it does not launch yet: see the next step).
- **STATE at stop (9:47 PM ET 11-19, the lead's context stop; code head c794249d, docs after it):** DONE and proven: (1) level lay +
  snapFaults rule (RED red-level.txt -> green); (2) snapper ground rule (RED red-ground.txt -> green); (3) the lead's straddle ruling,
  padPiece.ts hurts by his middle (RED red-straddle.txt: 4 hearts standing across the water -> green); (4) three bot fixes. Proven on
  c794249d: tsc PASS; snapRow + w2Cast + snapRide + snapperBonk + snapChannel + predatorCasts 56 pass / 0 fail; probes (ENG-25b's tools,
  base d36638be vs c794249d): water 5 lives at the pond in 24 runs -> 0 (bites 0 -> 0); snapper 39/40 cleared clean -> 40/40, skill off
  0/40 -> 0/40; flick from a stand (flickFlight.txt) last stone to bank 89% -> 100%, stone to stone 96% -> 99%.
  lockall vs MAIN 6e7b85f8: 85/102 unchanged, 17 moved (lockall-vs-main-c794249d.txt: 1-6..1-9, 2-1, 2-2, 2-4, 3-8, 4-4, 6-1, 6-3, 6-6, 6-7,
  7-5, 7-9, 8-3, 8-5). EXPECTED to be the base's own moves since main (INT-13 carries 1-6..1-9, FIX-284's 2-x, ENG-285), NOT PROVEN: the
  branch-vs-BASE lock was stopped unfinished. NOT DONE: stills (shootSnap.mjs plants the toy as 2-5's listed roll in page memory, but
  `__play('2-5')` never starts an engine: diag listed true, W2_STAGES 2-5 removed, listedRoll true, engine false, no page/console error);
  the full gate list; the REPORT.
- **EXACT NEXT STEP (a fresh member, from t-eng-25c head):** (a) `npm install --no-save --no-audit --no-fund --legacy-peer-deps`.
  (b) In a worktree of d36638be: `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json`; on t-eng-25c:
  `npx tsx tools/engine/lockall.ts --layouts 16 --check lock-base.json`: expect 102/102 unchanged (2-5 is not laid; no shipped stage has a
  snap row or a kitBeat animal). Any move: stop and tell the lead. (c) The CLAUDE.md list once on the head, the suite in shards, plus
  coveragecheck and every seed list --check, tierBots (firsttimer.ts changed: snap/kitBeat-only branches, the 1-1 calibration must not
  move). (d) Stills: find why `__play('2-5')` does not launch after the plant (App.tsx __play: allLevels.find; check 2-5's config and
  launchEngine's story/cutscene path), or plant under a stage id __play does launch; shoot upright 412x915 and sideways 915x412, Pokey on a
  stone and on the bank lip, whole screen; the lead judges them. (e) REPORT reference/qa-reports/ENG-25c/REPORT.md: the numbers above, the
  plants, the gate table (each PASS/FAIL), stills, the walkable finding + the lead's ruling (for BUILD-25 and the designer), Learned:
  "fly the counter-move (walking) before calling a gap a hop", "a bot's 'on' must use the engine's own rule (middle over), not standingOnId".

## 0zq-24g. ENG-24g (t-eng-24e, 11-20; this entry 9:59 AM ET): the bot catches a liana over a TAIL off a log (planted); OVER_TAIL 90 (lead's ruling B); castBots 2-4 PASS

**Done, proven (bc8c896c):** the trace: child/middle/expert seed 2 Normal rode beat 4's logs into the tail to the 1200 s cap, never jumping: firsttimer.ts vineFromLog looked only over the logs' window (q.x < d.x1). SKILLS.vineOverTail: it looks over the water to riverEnd(d), takes off short of the painted end on a tailed river, and a liana over the tail is never 'the one he just left' (child seed 8 at 90: a let-go at the swing's dead end fell short, then swungOn never expired). Planted: lianaRide.test 'A VINE OVER THE TAIL' on lianaRiverToys' `tail` toy (twin + tail 430, liana 90 past the logs' end, logCatches true): GREEN 15/15, RED 13/15 rescued. Data: w2Arc24.ts OVER_TAIL 110 -> 90 (the lead, 9:45 AM ET: the child's catch window from a log 2.9% -> 5.1%, FAR 20 px spare); relist 2-4 100/100 byte-identical; rideAcross Normal never crossed. **castBots 2-4 1-40 x5 x both (gate input): child/middle/expert 40/40 Normal and Easy** (kid 30, adult 38 on Normal). REPORT: reference/qa-reports/ENG-24e/REPORT.md (ENG-24g).
**Open:** merge ENG-24h's final (t-eng-24h: 2c + the clip, draw only), then the full CLAUDE.md list on the joint head + coveragecheck, registrycheck, paintcheck, every list --check, lockall vs d36638be (--intended 2-4), funcheck base vs branch (the base itself FAILS funcheck: compare line for line). Finding for an R-id: swungOn's 'just left' never expires on any liana over a safe river (a retry from a log after a short let-go is refused); fixing it there moves other stages' bots.

## 0zq-24f. ENG-24f (t-eng-24e, 11-19 night; this entry 9:48 PM ET 11-19): a liana over a TAIL is World 1's swing (engine, planted); 2-4 Normal beats 4/6 tailed; the drawn end (reeds); deep-water line; 2c NOT started

STOPPED on the lead's context call (~385k). Branch t-eng-24e, head = the commit carrying this entry (c61b371f engine+data, a52abe2d drawn end, 6040e41c deep clump + water line).

**Done, proven:** river.ts lianasOverLogs (anchor before the logs' window end): riverFaults keeps the log-drop share and lifts the hop rule only under those; a liana over the TAIL -> riverLay.ts tailLianaFaults (World 1's FAR rule: physics forwardEndLands, FORWARD_END, every hold, lands LAND_IN inside the far bank; caught from the bank or off a log, logCatches; Easy 80 px/s cap). levelCheck.ts hop rule reads lianasOverLogs; NEW reach step 3a' (over a TAILED river only): log -> the liana logCatches says a jump off it catches -> heldLandings (6 lines) (without it every 2-4 roll threw 'pool spent': the far bank unreachable). Planted lianaRiver.test 'PLANTED (ENG-24f ...)' (RED on the old judge: '22% ... under 40%'; GREEN), riverTail.test '2-4 (seed 1) ...' (Normal never crossed on a log alone; Easy ridden across). 2-4 data (w2Arc24.ts): TAIL_24 430 on twin24 + noLand24 (Normal only), noLand24 3 logs (706 px, same 2.14 s clock), each log-caught liana OVER_TAIL 110 px past the logs' end (flown: caught to 200 px past; the testers' let-go lands a level bank to 360 px past the anchor; bank at 320: 40 spare). Far banks unchanged and level (no raise, no D). Relist 2-4: 100/100, the list file byte-identical (plans unchanged). rideAcross24 s1/s2: Normal never crossed; Easy CROSSED (no tail, the ruling).
**Drawn end:** riverArt.ts drawRiverTailEnd/TAIL_END: World 2's painted reeds across the logs' end, logs clipped 30 px past it (engine.ts painted-log loop), a safe river's per-log waterline clipped the same; drawn after the logs, under drawRivers' over pass. Lead: PASS on the safe river (beat 4). Deep river (beat 6): reeds now cut 4 px under the surface (6040e41c); deep water: drawRiverWater leaves out the strip's 6 frayed rows (the hard tone line ~126 px under every deep river's surface). **Drawn end PASS (lead, f-tail-end2, 11-19): tone line gone, the deep clump reads as reeds rising from water.** Still owed: the log-going-in clip, 2c (end0 opaque), the gate list.
**2c (NOT started), the root I measured:** the bank end piece (ground/w2.webp end0, 384x576 drawn 300 tall, groundPaint drawEnd) is see-through: its lower fifth fades out (row 468 alpha 227, 504: 150, 540: 74) and 40-86% of pixels inside rows 36-432 are under 250. Behind it, the bank's own soil (same world tiles as the river's under-soil, so stones run on across the face line) and the river's bed show through. Fix at the source: bake the end piece opaque where it is the rock (e.g. an opaque backing in the piece's own colours under its silhouette, or draw it twice), never textured soil or bed behind its silhouette; judge with 2x + contrast-boosted crops of the lead's two spots (2-2 x4710 pondFar, 2-4 x9970 catch: reference/qa-reports/ENG-24e/stills/after/) and 2-1; drawcheck both ways. Soil tile joins are R-165.324, not this.

**EXACT NEXT STEP (fresh member, Fri 8:30 AM):**
1. ReadNotifications. The drawn end is PASSED (f-tail-end2); shooting tools: rivershot.mjs needs PW=/opt/node22/lib/node_modules/playwright/index.mjs; dev server `npx vite --port 5174 --host 127.0.0.1`.
2. **castBots 2-4 1-40 x5 x both on 6040e41c: FAIL on Normal** (reference/qa-reports/ENG-24e/cast24f.txt, rows cast24f-rows.jsonl if present): child 4/40, middle 1/40, expert 4/40, kid 21/40, adult 9/40, nearly all 'time goal 0/1' (medians 415-635 s) with lives lost in water (child 24, expert 19); Easy PASS (child/middle/expert 40/40). Base t-int-13 passed (BUILD-24c/INT-13). So the bots do not take a TAIL liana: my guess, unproven: firsttimer.ts catches a liana off a log only while it hangs over the logs' window (vineFromLog / lianaRiver / its catch aim), so he rides into the tail (beat 4: splash-back, again and again; beat 6 deep: a life). Trace two runs per cause at beats 4 and 6 (the rows: x and time of each life/rescue), then, the lead's order (9:52 PM ET 11-19), level.md rule 21 FIRST: a planted toy where the bot catches a liana hung past the logs' end from a MOVING log, within logCatches' reach (the judge's own test), RED with the skill removed, GREEN with it; the fix is the bot's, never the data or the judge (law 22). Then castBots 2-4 again. If the tiers still fail with the bot doing the move, that is a DESIGN finding for the lead, not a bot tune. 2-4 does not ship until child/middle/expert are 40/40 on Normal (Easy already PASS) or each miss traced.
3. 2c at the source (above), then the CLIP owed: a log going into the reed clump (both beats), the whole action.
4. **lockall PASS (6040e41c's tree vs t-int-13 d36638be's base lock, --layouts 16 --intended 2-4): 101/102 stages unchanged, only 2-4 moved** (reference/qa-reports/ENG-24e/lockcheck24f.txt; base lock: 3264 builds, 102 stages, recorded in a scratch worktree, not kept: re-record it after the bot fix if 2-4's data moves again). funcheck 2-4; seedlist 2-4 --check; drawcheck 2-1/2-2/2-4 both ways (reeds + water + 2c draw); then the FULL CLAUDE.md list once on the final head (suite in shards).
5. REPORT: add the ENG-24f section to reference/qa-reports/ENG-24e/REPORT.md (hash, tail 430 and why, the tail-liana rule + plant RED/GREEN, levelCheck 3a', art = World 2 reeds (no HF), castBots table, gate table each with PASS/FAIL, stills, Polish check, Learned: 'a log-caught liana was never in levelCheck's reach graph; the logs reaching the far bank hid it').

## 0zq-24e. ENG-24e (t-eng-24e from t-int-13 d36638be, 11-19 night; this entry 9:15 PM ET 11-19): the river TAIL (engine, proven); 2b/2c (drawn, stills not yet judged by the lead); item 5 open under the lead's ruling

STOPPED on the lead's D76 STOP (real context ~414k). Branch t-eng-24e: 1778d54a (tail) + c7671135 (2b/2c). Packet: reference/packets/2026-11-20/ENG-24e.md (origin/ccr-ea739a2f-dfcee4).

**Done, proven (1778d54a):** RiverRow.tail (riverLay.ts): the logs' window is carrierWidth(row) (logs + 1 spacings less a log, as ever) and `tail` px of log-free water follow before the far bank (riverWidth = window + tail; DriftInfo.tail, RiverZone.tail; pipeline's place `river` needs no change). riverFaults holds tail >= ceil(rideReach(dir, speed)) + RIVER_LAY.tailMargin 30; rideReach = the farthest a rider reaches off a log's end, flown on airStep at Easy's strongest jump (coyote 0.167+0.08 s capped by the water, the 12% double, the 26 px mantle, run + carry): 387 px at 80 px/s, 391 at 100, 393 at 110, 401 at 143 (so 2-4 tails need >= 418-423 px). letGoFall's far bank is past the tail (a let-go into the tail is in the water). Every log-to-river match goes through river.ts onRiver (riverLay, levelCheck, puzzleCheck, puzzlePlay, engine letGoNow, firsttimer, route, score). engine.ts drift loop: no step-up onto a bank at a tailed end. Planted src/game/riverTail.test.ts: toy = 2-1's first river re-laid with a 2-spacing tail (far bank unmoved) never crossed on a log, both settings, while 2-1 as built IS crossed (the probe proven); the hand-over plant RED with the old line (lifted to 883 vs log top 908) -> GREEN; the reach judge plant. Gates on it: tsc, generality PASS; river test files 73/73.

**2b/2c (c7671135), drawn, NOT yet judged by the lead:** 2b riverArt drawSafeRiverOver: on each LOG only, the strip's crest laid SAFE_OVER.line 70% down its painted bark (logPaint/logLineAt), water under it at 60%, bobbing (logBob), foam along it; nothing over open water. Rafts get NO waterline (a raft band was tried and sat under the painting; drawKitArt anchors at the painting's bottom: re-check RAFT h 0.44/foot 0.72 against the raft still before trying again). 2c riverWaterOutline + engine drawRivers: the under-bank run clipped to the bank's own endFace (the line its soil is clipped to). Planted src/game/riverLook.test.ts. Stills (rivershot.mjs, real page, 2x, + 2x crops to the screen foot): reference/qa-reports/ENG-24e/stills/before|after/ 2-1 x8420 safe, 2-2 Easy x20310 safe, 2-2 x4710 pond far bank, 2-4 x9970 catch (upright + sideways). Seen by me: 2-1 and 2-4 logs read as wood with a low waterline; 2-2 pond far bank's pale see-through column and its edge ~140 px in are GONE. NOT fixed: on 2-4's catch bank a faint vertical soil-tile join at world x 9900 (stops at the y 1200 tile row) is identical before/after: groundPaint's brick bond, not the river: name it to the lead for an R-id.

**Item 5 (2-4 beats 4/6), the numbers (my sweep, the judge's own flight with the far bank raised; scratch script not committed):** with 2-4's rows given a tail and the far bank unmoved, the last liana's drop share falls to 23%/25% (beat 4, N/E) and 15%/24% (beat 6 l2): logs past the liana are gone. Raised far bank (A): only +180 px with tail 286, far bank 150 past the liana passes the ride test; share 38% N / 36% E. Beat 6 l2: far bank 150 past it gives 48-54% but the window must end <= 492, 270+ short of l2, and logCatches fails. Physics: a liana caught off a log carries him no farther than a double jump off it; a far-bank-only landing caps near 50-54% of let-go moments.
**The lead's ruling (9:12 PM ET):** a liana over a TAIL (no logs under its throw) is a swing over open water: judged by the World 1 vine-gap rules (level.md FAR rule, FORWARD_END 0.75, levelCheck reach; the wait rule), NOT lianaRiverFaults' log share; the log share still holds wherever logs are under a throw; a tailed river must still fail every log-only crossing (rideAcross); the fairness proof is castBots child/middle/expert 40/40 both settings (or each miss traced). Easy may keep logs under the throw (shorter or no tail on Easy; the vine optional on Easy, under the log share). Bank look natural, never a wall, still + 2x crop, SHOW FIRST. The lead writes it into level.md.

**EXACT NEXT STEP (ENG-24f, fresh, xhigh; base t-eng-24e c7671135; run long things in the background):**
1. The lead judges the 2b/2c stills above (ask; do not re-shoot unless told). Re-shoot only if the lead sends something back.
2. Engine, the ruling: lianasOver-based judging in riverFaults/lianaRiverFaults must skip a liana whose throw has no logs under it (anchor past the logs' window end, d.x1, over the tail) and that liana goes to the open-water swing rules; find where levelCheck/verdicts judge a World 1 vine gap's FAR let-go and the wait, and make sure a tail liana is held there (grep level.md 'FAR', FORWARD_END). Plant: a toy liana over a tail is judged by the FAR rule (RED when its far bank is out of the testers' let-go), never by the share. Do not loosen anything else (law 22).
3. 2-4 data (w2Arc24.ts, Normal rows): beat 6 is the natural fit for D (log -> l2 caught off a log near the window end -> l3 over the tail -> far bank); beat 4 the same or A. Fly with rideAcross24.ts (must print never crossed, both settings) + the FAR rule; Easy rows may keep no tail. Show the lead a still + 2x crop of each changed bank BEFORE relisting.
4. Then: relist 2-4 (seedlist), castBots 2-4 1-40 x 5 bots x both, lockall --intended 2-4 vs t-int-13 (my saved locks were in the scratchpad, gone: regenerate on d36638be), funcheck 2-4, drawcheck 2-1/2-2/2-4 both ways (2b/2c draw), the CLAUDE.md list once on the final head, REPORT reference/qa-reports/ENG-24e/REPORT.md (hash, tail number 418-423 and why, art (item 2, the drawn end, NOT started: inventory first, candidates w2#bankEnd, w2#end0, w2#boulder 'log stop', w2#wall; HF job only if none fits, cap $3), plants, stills, Polish check, Learned).

## 0zq-13b. INT-13b (t-int-13, 11-19 evening): the integration's last merge, one cross-branch red, every gate once
- **Snap stones are pad { by: 'beat', on: 'bites' } (rideLay.ts):** any code that treats every `by: 'beat'` pad as a breathing (sinking)
  row must also skip `on === 'bites'`. breathAim.ts breathsAhead (FIX-284) did not and aimed a wave row's bar at a put-back (2 bites for
  the child on Easy, snapRide.test 'wave'); fixed in 4529d5e6 with the plant breathAim.test.ts 'a SNAP STONE row'. padPiece.ts and
  rideLay.ts:430 already split them. Whether 2-5's snap rows get their own put-back aim is BUILD-25's design call (today: none).
- **Trap: a merge can be red where both branches are green.** The red came only from FIX-284's merge over ENG-25b's stones, and it lives in
  the CI tool line (tools/inspect/*.test.ts), not the suite. Run tsc + the CI tool line after EVERY integration merge (D92, release.md step 0).
- **tierBots.test samples 3 variants a tier and setting:** t-build-24c moved child Easy v25 on 1-1 (303.6 -> 303.5 s) and its test
  passed; the full calibration (BOTS.md command, about 3 min) is the only check that sees every run (R-165.317 widens the test).
- **clipcheck under heavy load** (3 suite shards + paintcheck beside it) reported 4 known entries 'stale' (74 of 83 seen, 900 s); alone it
  passes (83, 324 s). Run it with the machine quiet before calling its stale list real.

## 0zq-NOISE. ENG-NOISE (t-eng-noise from t-int-13 8efb1bba, 11-19; this entry 7:37 PM ET): one noise channel the cast hears (World 3's first foundation)
- **The channel** (castPlay.ts): `noise(n)` queues any heroNoise.ts Sound; the step hears his landing first, then the queue in order made,
  every member through core.ts `hear`; `CastStep.heard` lists what it heard (`landed`, `woke` as before). `ring(i, t)` makes sounding thing
  i's bellNoise at its place (a blow on it, or the stage firing it); `soundAt(box)` finds the one a blow reaches. `calm` clears the queue.
- **Who emits** (engine.ts): a blow's noise (punch, kick, mega alike: `punchNoise` at his place) once a swing, when its strike window
  closes (`blowNoise`; or at `endAttack` if cut short); a taken-back jab makes none. A blow that reaches a SoundPost rings it (hitstop
  0.04, `playShrineUnlocked`) and makes NO noise of its own (`atk.rang`). The landing reads `standingOnId`'s `Platform.quiet` (looked up
  only when the platform changes) into `CastHero.quiet`; `landingNoise(..., ground)` returns null on quiet ground.
- **The ladder:** his punch is heard only from `TAUGHT.noise` (World 3); his landing from `TAUGHT.landing` (2) as before; a bell is
  heard where the kit's `inWorld` lets the kind hear (TAUGHT.bell). So no World 1-2 cast hears a blow: castNoise.test.ts pins it.
- **Data:** `CastData.sounds: SoundPost[]` ({x, y foot, w, h, sound:'bell'}), laid by gen2/soundLay.ts from a prop socket tagged
  'sounding' (soundProps/soundSocket/soundEmitters, as lureLay.ts); `SectionPiece.quiet` -> `Platform.quiet` (pipeline.ts LocalPiece).
  Neither has a look: the world's art and `note` hook draw it (ENG-LURE's 'chime'; 3-5's moss piece). World 1's 'moss_stone' is NOT quiet.
- **Proof:** gen2/noiseRow.test.ts (toy World 3 rows laid by gen2, RealPlay) and castNoise.test.ts. Trap: a kit ocelot patrols at 55 px/s,
  so "it came near the stone" proves nothing; test `s.drawn` and `s.goalX` (the first plant read 80 px from patrol alone).
- **Open for the next engineer:** ENG-LURE (the chime look, its once-a-call rule, the patch's clock gate); ENG-VINE (the thorn vine as a
  kit sleeper hears this channel; stepThornVines still hears only the puzzle kit's noise); the puzzle kit's own noises (puzzlePlay.ts
  thrown/bell) do NOT reach the cast yet; no recorder event for a ring or a punch noise (only 'landing').

## 0zq-PROWL. ENG-PROWL (t-eng-prowl from t-int-13 8efb1bba, 11-19 evening): World 3's prowler never looks up; the leap (3-2 NEW 1)
- **Fields (predators/types.ts):** `sight.up` (how far ABOVE its feet it sees; absent = `tall`, so every kind before it sees as it did);
  `Act` (aim 'ahead' | 'below' | 'him' | 'up'); `PredatorDef.leap` (an Act aimed 'up'); `PredatorState.leaping`; `Prey.hanging`.
  World 3's OCELOT: up 40, leap { up, 0.36 s, 400 px/s, reach 44, tall 130 } (its pounce's time/speed/reach; 3-2 tunes them).
- **The rule (predators/core.ts):** `startTell` sets `leaping` once per tell (a kind with a leap, him hanging); `actOf` is the act that
  runs, read by `reachBox`, `startTell`'s aim and the act phase. 'up' runs along its own ground (aimY = its feet, aimX clamped to its
  patch) to where he hung when it told; the box rises `tall` from its ground. `checkPredator`: a leaper `callsOff` (the freeze), and
  ROPE_SPEED x the Easy tell >= reach/2 + HERO_HALF_W (the creep on). castPlay.ts fills `prey.hanging` from CastHero (one line).
- **THE 'LIT = SEEN' SEAM (for ENG-DARK):** `upOf(def)` in core.ts is the only reader of `up`. ENG-DARK adds its ring report to Prey,
  fills it in castPlay.step beside `prey.hanging`, and makes `upOf` return Infinity for a lit sloth; the leap's `tall` stays the reach.
- **Proof:** src/game/predatorWorld3.test.ts (11 tests); planted faults reference/qa-reports/EN-P/planted-faults.py (now takes a 4th
  field: a file other than core.ts) 10/10 PROWL caught, 50/50 in all.
- **Traps:** creeping TOWARD a leaper in front is not an escape (it runs to where he hung, through him): the freeze is; the bots'
  hanging branch (firsttimer.ts `if (p.hanging)`) returns before `freezePlan`, so a hanging bot only creeps on. No stage casts a kit
  ocelot yet; a castBots proof of the leap waits for ENG-ROOT's rope over floor. The drawn ocelot keeps its feet on the ground in the
  act (castPlay.sync): its leap pose is not drawn yet.

## 0zq-small3. ENG-SMALL3 (t-eng-small3 from t-int-13 8efb1bba, 11-19 evening): three small fixes, one plant each
- **The node dials' id spelling (R-165.319, nodeCode.ts `ID`):** a threat kind, hazard, clock or find is written as the kit writes its id:
  a small letter first, then letters of either case, digits, '-' or '_'. gen2's casts are kebab-case (w1Cast.ts 'snake-asleep'), the
  predators' roster camelCase (predators/roster.ts 'thornVine', 'riverGuard'); both read now, a capital first still fails. The dial is
  matched to a world's cast by `c.id` in nodeAsks.ts askMisses, so a W3 design that names `thornVine` needs a W3 cast whose id is
  `thornVine` when W3 moves to gen2. Plant: nodeDials.test 'R-165.319'.
- **Grandma's things' names (R-165.321, protoStage.ts thingFern):** picked by `thingsPlaced`, not the shared collectible id. 3-6 lays
  8-15 finds over 4 names, 3-7 lays 9 over 5, so the names come round again in order after the list; the keeper's longer lists
  (lines-3.md on t-keeper-3x: 'garden trowel', 'button tin') are content for the 3-6/3-7 builds (the lead's ruling, D40). Plant:
  w3Stages.test 'R-165.321' (it reads the list length from the rolls, so it holds when the names are added).
- **tierBots.test replays all 200 calibration runs (R-165.317):** `movedRuns` names each moved run with its fields; about 4 min (206 s,
  4 cores). The command is unchanged and already in CI's rolled job. Trap: the run row's finish field is `finishSeconds`.

## 0zo-285c. ENG-285c (t-eng-285, 11-19 afternoon): the 2-1 skill plants re-stated; the still pair (no model change)
- **riverRide.test.ts, the 2-1 plants (the lead's rulings):** UPSTREAM keeps adult Normal seed 12 'rescued without it' and states the
  child on Normal as LIVES: seeds 4 and 5, 5+ more lost without it (measured 1 -> 9; the runs are frame-identical up to the both-ways back
  river, so the lives are the skill's own). BANKUP is THIN: real nowhere in lives or rescues (2-1 every cast bot both settings 1-40; 2-2's
  rivers all run with him, RIVERS_22 lane22; the toy back river the same lives). Off a log running back at him the UPSTREAM front-end hop
  (firsttimer.ts `SKILLS.upstream` branch) takes him up the same bank within a frame or two; its one measured effect is child Easy seed 22
  at the both-ways river, boarding to far bank 4.73 -> 8.56 s: the plant (`bothWaysCrossing`, 2+ s). R-165.309 (the lead's): near-redundant.
- **Trap: whole-run numbers lie for a skill plant.** Child Normal seed 26 0 -> 7 lives and seed 1 19 -> 4 (the other way) with bankUp off
  came 60+ s after the bank from drift (different draws), and child Easy s4's +18 s with its bank crossed 0.04 s apart. Measure a skill at
  its own spot (time or lives in its piece, or the first frame the runs part), never the run total. Probes: qa-reports/ENG-285/c/*.txt.
- **Still pair** (c/backswing-*): one back-swing let-go on 1-6, the real page and touch pad; the new airStep equals the engine to 0.000 px
  over the free flight, the old one (no turn push) lands 19-20 px short. Fly a judge from the state after the FIRST WHOLE air frame: the
  release frame's launch is set inside the engine's step. On the page `__engine` may be the engine object (engine.ts:1022) or App's
  function; tsx needs `window.__name` defined in the page for evaluated functions.

## 0zo-285b. ENG-285b (t-eng-285, 11-19): the last two drifts; the final model hash ba6b225b (R-165.297)
- **No-steer air tick:** physics.ts `airStep(b, dt, dir, hold, down)`: dir 0 COASTS (refined controls, the game's default) and only
  `down` brakes, at PHYS.airStop (engine.ts, the air `dec` of the no-steer branch). The one dir-0 caller with speed: tools/inspect/jumps.ts
  (the noisy-thumb bots' drifting thumb). Planted: judgeFliesEngine.test.ts test 3 (RED on the old 520 brake).
- **A hop's frame order (the bot's liana aims):** in one engine frame the vine clock steps, the catch scan reads his place from the END OF
  THE LAST frame against THIS frame's clock, then he moves. So a hop's vine clock is the press frame's, pressIn(lag), and the take-off is the
  frame before it: firsttimer.ts `hopAim(lag)` = { off: pressIn - DT, clock: pressIn }; `hopCatches(.., t0)` takes the press frame's vine
  clock; `hopCatchAt` returns the catch frame. lianaWait and vineFromLog use hopAim; lianaWait runs the lag's frames with groundStep (a
  held run's top speed steps 285 / 267.7 px/s frame to frame: engine.ts's `<` at exactly maxRun, the engine's real feel, parked by the lead).
- **The take-off frame:** physics.ts `takeOffStep` (the ground steer, then airStep with no steer) is the first frame of the bot's hop flights
  (hopCatches, hopLandsOn: firsttimer `hopFrame`); `groundStep` is a frame of running. Flown as an air tick a stand was 4.1 px short.
- **The touch hold:** the touch layer's minimum restarts after the take-off frame's countdown (inputEngine.ts noteTakeOff), so 220 ms holds
  7 frames: firsttimer `touchHeld`; pressHold uses it; lianaWait now holds as pressHold does (real-input runs only).
- Planted: lianaRide.test.ts test 5 (1,728 hops into the real engine: take-off, vine clock and catch frame equal; RED 245 on the old aim),
  judgeFliesEngine.test.ts test 4 (takeOffStep/groundStep to 1e-6 px). DROP ON A LOG runs v1-6 (ruling A): v3 rides a log off the bank.
- **Harness traps:** two lianas side by side in ONE swingSetup call get no room to swing (amp 0): a plant on a still vine proves nothing
  about a clock; assert the swing. Since 1c a harness sets the game clock BEFORE r.swing (§0zo-285); letGoCue.test's start() had it the
  other way (BUILD-24c's glow red): guard the set-up with an assert on both clocks.
- **Left as they are (not one decided press):** the float-wait's "a log is near" (any of 3 take-offs, 0/0.1/0.2 s) and the pad hop's
  [0.03, 0.1] are loose windows. sovereignReach.ts:108-109 (4-10's opening timer) keeps its own air model (no turn push, dir 0 = airStop):
  both slower than Pokey, errs safe. The judge flies a let-go with the jump HELD; a flick loses the apex hang (8-37 px by air frame 21-29,
  40 of 86 presses of one swing): named for the lead. The kid's 2-4 Normal 36 -> 28 (BUILD-24c): no single bot slip (full-40 bisect);
  his rules fire at the first predicted moment (lianaWait, mean lag only) and on any of 3 take-offs (the float-wait): named for an R-id.
- Lock: today's commits move no stage (102/102 vs 925eba15). Curated seeds: the 3 plans ENG-285's model moved (6-1 69793, 205913; 7-5
  928604) re-pinned after curate.ts's own rules passed; 7 more (8-5 x5, 8-6 x2) differ from seeds.ts on main already, unseen by the
  guard's two seeds a stage.

## 0zp-284. FIX-284 + FIX-284b (t-fix-284 from t-int-12 ce4ad461 + ENG-285b ba6b225b, 11-19; this entry 3:32 PM ET): 2-2's big pads, the hop, the breath aim, the put-back's cut
- **Big pad 180 px (R-165.284, the lead's show-first 2:37 PM):** rideLay PAD_SIZES.big.w 180 (2.02 Pokeys of drawn height 89.1). Art = floor
  on every stood-on pond piece: riverArt POND_ART carries each piece's measured painted `top` (padtop.py), pondBox/pondTopSpan lay it on
  the floor (mirrored too); padPiece's blanket `width * 1.15` is gone. A pad's `look` is its size (beat rows told by `pad.by`): never
  guess big from width. Pinned: padArt.test.ts.
- **The hop (padHop.test.ts, hopReal.ts):** a touch flick is a full jump (19 frames, 175 px at a run); the Pad tap (PAD_HOP_MS) 13 frames,
  119 px; held 20 frames, 184 px. castBots `--input fake|touch|pad` (default fake; switching the default + tierBots recalibration is the
  lead's own R-row) and `--rows`.
- **breathAim.ts (respawn phase lock, ruling A 2:51 PM):** at every put-back (respawnAtCheckpoint, iris shut) each beat row within 1600 px
  ahead is turned on its breath to have just risen 0.1 s before he reaches its mark (100 px before its first pad): first at the soonest
  (full run at once), after that with the lag he really took last time (noteArrivals; `breathLags` follow him to any flag). Failed first:
  aim-at-soonest every try (its own lockstep for slow players: kid N 18 -> 6/40) and a golden-share turn (hands some tries a bad moment;
  the clip drowned on its 2nd try). Proven: padRide.test.ts "breath toy" (RED without: breath-plant.txt), breathAim.test.ts.
- **A put-back is a cut (FIX-284b, the lead's polish item):** the world HOLDS through the down beat (DOWN_SECS 0.75), so a drowning's
  "SPLASH!" (0.8 s) and spray (0.55-0.7 s) kept their whole life and showed on 2-2's risen pad as the iris opened; only words within
  160 px of the flag were dropped. Now respawnAtCheckpoint calls `clearScreenFx()`: every floating word and every particle (spray,
  sparks, puffs, feathers, stars, hearts, a beaten animal's tumble) ends there, every stage and every caller (a lost life, heartToFlag,
  startAtFlag); the lives note is added after it. Pinned: respawnClears.test.ts (2-2 water + 1-1 pit, RED 2/2 before). TRAP: RealPlay
  stubs addFloatingText / spawn* as COSMETIC (realPlay.ts:133), so a test of the screen's words must restore them from the prototype.
- **Clips:** reference/qa-reports/FIX-284/cliprespawn.mjs `<port> <dir> up|side fast|slow` (slow stands 1.5 s at the flag after each
  put-back; logs PUTBACK frame/shot for same-moment stills). Report and tables: reference/qa-reports/FIX-284/REPORT.md.
- Open: kid N 27/40 touch on 2-2 and child N touch 39/40 (deep22 run-offs; accepted, R-165.306, the Designer's); shoot.mjs (kitaudit)
  pins p.y = top - height but p.y is his feet: its stills float him 48 px (Content's tool).

## 0zp-24d. BUILD-24d (t-build-24c, 11-19): a safe river's strip loads with the stage; Dot's cards in stills
- **A safe river's first frame (R: the lead's item 2):** riverArt drawRiverWater paints a safe river (Easy everywhere, Normal's teaching
  rivers) from ART-W2's shallow strip only once it has loaded (safeRiverArtReady); until then it falls back to the DEEP sheet, a dark-teal
  slab, the look of a river that costs a life. stagePreload.ts 'w2-props' now loads the strip with the river sheet (safeRiverPreload.test).
  Any new river look (a new strip, a new world's water) goes in the same preload branch, never only on first draw.
- **Stills that show Dot's cards right:** Dot's line is cleared by a tap ON the card (.dg-bub, DotGuide.tsx onCard), not the screen's
  middle (that clears only the goal card, dataset.hudCard). A move tip ("Flick up to hop up or over.") stays until its move, then its
  5 s reading time on the phone (R-165.175). A still tool that teleports and never does the move shows one tip over every spot. Use
  reference/qa-reports/BUILD-24d/stills24d.mjs (walks the start, hops when stopped, taps the card) and window.__dotGuide() (dev) to read
  the queue (cur, base, moves).
- **lessons.ts pickLesson 'gap'** fires at a boulder on a bank (reads boulder edge -> next ground as a gap): the right moment for a hop,
  for an odd reason; every stage's first boulder alike. Left as is (BUILD-24c's proposed change would have dropped a real hop's lesson).

## 0zn-24c. ENG-24c (t-eng-24c from t-meter-3 42459a5c, 11-18): the raft look (R-165.288) and the glow that agrees with the log (R-165.289)
- **The raft (data):** a river row's `look: 'raft'` (gen2/riverLay.ts RiverRow) -> layRiver puts it on every carrier's DriftInfo.look (river.ts;
  draw only: the judge, the bots and the physics read a raft row exactly as its log row, riverRaft.test.ts). Drawn: on World 2's painted water
  riverArt.ts drawRiverLog draws World 2's PAINTED raft (puzzle-kit#raft, w2.json, placed as puzzlePlay.ts's sluice raft: deck = the carrier's
  top); the drawn layer (no painted sheet) gives it platformPlan's 'raft' look (spanArt's code-drawn raft painter), never rotated to barge/pad.
  The kit's sheet is preloaded for any gen2 stage whose kit places a raft row (gen2/game.ts gen2Rafts/laysRafts -> stageSheets 'kit-pieces').
  Until the sheet loads the painted log stands in. The toy has a `raft` row (tools/inspect/lianaRiverToys.ts TOY_RIVERS.raft).
- **The glow (letGoCue.ts):** on a liana over a log river (river.ts lianasOver) the swing's glow and glints (engine.ts sweetGlow) mean "a let-go
  pressed now comes down on a log or the bank ahead"; anywhere else they are the sweet spot, as always (1-6 test: the drawn glow is World 1's
  ease to the frame). The swing is a pure function of the vine clock, so per liana, hold and facing ONE table is flown (physics.ts
  pressLaunchesFrom at two clocks half a frame apart, each press flown by gen2/riverLay.ts letGoFall: the judge's own flight); each frame
  looks up the press for the vine's phase and tests the logs at the landing time (fallOnLog). Facing back = the same flight on the mirrored
  vine. 0.19 ms a table (this container), built when he takes hold or his hold rests at a new length; while his grip moves the river says
  nothing. Over a river the glow goes out the frame the moment passes (no fade over the water).
- **CUE (letGoCue.ts) is tighter than the judge, measured against the engine:** the press climbs his hold one frame first (a jump press is Up:
  inputEngine.ts triggerTouchUp), and the catch is read 8 px narrower on both readings of the river clock (the judge's, and one frame back:
  the engine moves the logs before him). Through the game's own touch input on the toy (long, gap280/deep, the raft row, both settings,
  facing back): 0 frames lit over water, lit on 83-97% of the frames whose let-go lands (letGoCue.test.ts; 6 px left one frame on the raft row).
- **Traps:** (1) the judge (lianaDrops) and the bot still leave out the press-frame climb and read the logs one frame ahead: debt, named in
  the REPORT. (2) The leaf: a returning player who HOLDS the jump glides (glide.ts) far past where the judge, the bot and the glow read; a
  first-time 2-4 player has no leaf, and the tests take it off. (3) A river run by a sluice (RiverZone.flowT) gets no river glow (its clock
  can stop). (4) RealPlay.swing does not reset the engine's sweetSnap: a test must clear it, or a 'late' press reads a stale snap.
  (5) withFixtureConfig / withTestStage are synchronous: an `await` inside them drops the fixture ("no stage 2-94").

## 0zm-24. BUILD-24 (t-build-24 from t-meter-3@42459a5c, 11-18): 2-4 "Never Touch the Bank" built on 0zl's pieces; what the next builder and engineer must know
- **Where:** src/game/gen2/worlds/w2Arc24.ts (kit 'w2-24', kitLib24; RIVERS_24; LINES_24, MISSION_24), stageTable '2-4' judged 'normal-2-4'
  (flownArcs.ts n24, chain.md §1, reference/qa-reports/BUILD-24/fly-2-4.txt), proven list seeds-2-4.ts (100). The hand-built 2-4 is gone
  (w2Stages.ts W2_STAGES, w2Sections.ts plan + the kinds only it used, swing4 and island). Tests: w2Arc24.test.ts (planted-faults.py).
- **Two lianas over ONE river (beats 6, 8):** two swings after the same bank, the river after the second (0zl's form). The second must hang
  past physics CHAIN.dx (560 px) from the first: closer, the pair is a CHAIN (phased for a leap), the route swings liana to liana and the
  log between them is skipped (reach 600 was 435 px apart). w2Arc24.ts FAR_W = 765; the test holds >= CHAIN.dx.
- **The quiet line binds liana rivers (listRules quietJudge, 4 s):** route.ts's lianaDrop is NOT a beat; from the swing to the next action
  he flies (dist/430 + 1.2 s + half the worst wait) and then walks. A river whose far bank is 600+ px past the liana, or a flat landing
  bank, reads 4.2-8.5 s. Fix by data: a boulder at each landing (0.15), 2 log spacings for practise rivers. 2-4's list sits at 4 s.
- **Easy's judge (<= 0.6 s wait) refuses a 320 px log-caught liana on every row (0.63 s) and beat 4's twin/long (0.63-0.70 s):** 340 px
  under the 410 top, and `deep` logs for Easy's beat 4. A 300 px log at 60 px/s breaks riverFaults' 4 s log beat (no `lashed` row).
- **A finale brief adds a finale node** (pipeline graphFor `ends`): a design with none needs `ends: 'quiet'`, else the pool is short.
- **Open (engine, before 2-4 ships; the lead's rulings 3:12/3:15 PM ET):** R-165.288/.289: RiverRow.look 'raft' (beat 9 rides a log) and
  the sweet-spot glow agreeing with the log on a liana over a river (engine.ts:2412-2426 is phase-only). Not done: the camera pull-out.


## 0zp-19d. VAR-19d (t-var-19, level half, 11-19 night; written 10:04 PM ET by `date`): 1-9 NOT green; the EXACT NEXT STEP is REPORT.md 9.1
- **Read first:** reference/qa-reports/VAR-19/REPORT.md section 9 (9.1 the next step, 9.2 what was done). Head a10bbf8bc + the report commit.
- **The list's judge holds the lure rule** (level.md rule 19): tools/engine/listRules.ts `lureBreaches` runs the engine's own lureLay.ts
  `lureFaults` on the stage as played, in `listJudge` (reroll) and `asPlayedBreaches` (--check); planted in seedlist.test.ts. Only 1-9 lays
  lure posts today, so no other list moves. The lead's next judge rule (R-165.327): a socket predator re-seated off its piece is refused.
- **w1Arc19.test lays the LISTED layouts** (buildPlayStage + playFinish), not raw seeds; R-165.312's raw defect is its todo test.
- **Traps learned:** (1) plainWalk's one-jump test plays every face on ONE sim, so the cast wakes from face to face: replay it with causes
  (VAR-19d/probes/replay.ts) before reading a red as geometry; (2) Easy's easyHoldSoften widens a landing over a walkable pocket and leaves
  ~37 px: a block on a bough sits flush or a body width (44 px) clear, on Easy too; (3) lockall vs main shows 14 stages moving that are
  t-var-19's 125 inherited commits: lock the branch base (0b1f9e46) to see your own change.
- **Open for the engine:** R-165.312 (flag placer moves a flag onto a designed boa's ground; the boa re-seats: the roost on raw seed 1, and
  read-bare on L1, its boa 65 px past s1's top); R-165.328 (the hunters' eagle strikes past its rounds' end).

## 0zo-285. ENG-285 (t-eng-285 from t-int-12 ce4ad461, 11-18 night, steps 1/1b/1c/2): the judges and bots fly the engine's Pokey
- **One air model (R-165.285):** physics.ts `airStep(b, dt, dir, hold)` adds the engine's turn push (PHYS.airTurn when steering against
  vx > 20) for EVERY caller; the `turn` switch and flyLaunch's `turn` are gone. Back-swing hops carry 4-28.5 px further (median 22-28,
  scratch probe over every back-swing press of a 300/420 px liana). Still drifted (named, not fixed): a no-steer tick (dir 0) brakes at
  PHYS.airDec 520 where the engine brakes 0 (refined touch) or PHYS.airStop 1300 (engine.ts:2587); callers protoCheck.ts:50, jumps.ts:240.
- **The press (R-165.294):** a jump press is Up too (inputEngine.ts triggerTouchUp; a touch keeps it past the longest sweet-spot wait), so
  from the press frame to the leave frame (both counted) his grip climbs SWING.climb/s: physics.ts `pressClimb`, used by pressLaunches
  and forwardEndLands; he leaves from the climbed hold; a 'late' press still leaps from the sweet spot's snap (unclimbed). The judge's log
  clock was already the engine's (logs move before him, from the press frame: judgeFliesEngine.test.ts 2 pins it); the BOT's was a frame
  early: firsttimer `pressIn(lag)` = the next frame's pad (decide's lag rounding + 1 frame); PRESS_TRACE records aimed vs real frames.
- **riverLay:** `letGoFall` + `fallOnLog` split out of lianaDrops word for word as ENG-24c (t-eng-24c) split them. When t-eng-24c merges:
  take this side for riverLay (no `, true`), and set letGoCue.ts CUE.climbFrames to 0 (pressLaunchesFrom climbs inside now).
- **One liana clock (R-165.295):** engine.ts `vineClock` is a getter = gameTime + vineShift (a test seam only: RealPlay.swing and the
  setter place a swing against the CURRENT game time, so a harness sets `t` first, then the swing). The separate `+= dt` is gone.
- **Bot (a):** Progress.relocate(p, level) keeps level points within LEVEL_REACH 600 px in x, else the plain nearest. (b) pitWayBack's
  off<120 early return: not reproduced on this base or on t-build-24's head; unchanged.
- Planted tests: src/game/judgeFliesEngine.test.ts, src/game/lianaClock.test.ts, lianaRide.test.ts (press frames), firsttimer.test.ts
  (relocate). The measure and the EXACT NEXT STEP: reference/qa-reports/ENG-285/REPORT.md.


## 0zo. ART-W2B (t-art-w2b from t-eng-26@fa8a92bf, 11-18): the wheel's painted look; what the next engineer and the 2-6 builder must know
- **wheelDraw.ts is painted now** (the placeholder shapes are gone): `drawWheel` -> `paintWheel(ctx, im, w, buckets)` draws from ONE sheet,
  src/assets/props/w2-wheel.webp (frames: w2WheelData.ts, generated by tools/art/hfw2b/ship.py, 3 sheet px a world px). Order: the millrace
  wall (two halves across the pond, coping LIP_UP 34 over the surface), the noria (one picture, `rotate(atan2(-(mx-cx), y-cy))` off bucket 0's
  floor: a spoke always on a floor; 6 spokes, so an N != 6 wheel's spokes fall between its buckets: paint one if a row ever uses N 5),
  then each bucket (frame (ax, ay) = the floor's left end/top ON the platform: art = collider; spill frames within SPILL_DEG 55 of the top,
  pouring toward the jetty: bucketSpillL when way > 0). Until the sheet loads: the bucket floors only, filled plain (never invisible).
- **Preload:** stageSheets key 'w2-wheel' (any gen2 stage whose sections place `{ kind: 'wheel' }`, and the fixture) -> stagePreload.
- **Test:** src/game/wheelDraw.test.ts (art = collider, spokes on floors, spill only over the top; planted: `ay` ignored -> RED).
- **Perf (open):** in the container's SOFTWARE canvas one painted wheel costs ~5 full-screen layer draws (3.45 ms vs the placeholder's
  0.22 at CPU x1; reference/qa-reports/ART-W2B/perf.mjs): a rotated, scaled ~754 px square. Phones raster canvas on the GPU, where it is
  one textured quad; measure on a real phone before 2-6 ships (REPORT "Perf"). drawcheck's '2-6' scenario is the OLD hand-built 2-6 (no wheel).

## 0zn-26b. ENG-26b (t-eng-26, 11-18): the water wheel finished; what the next engineer and the 2-6 builder must know
- **Flights take their stage (generality):** `flyWheel(L, setting, stageId)` as landFlights.ts flyLandFlights; tools/engine/wheelflights.ts
  WORLD_WHEELS rows carry `{ stage, rows }`, World 2's from world data (w2.ts `W2_WHEEL_STAGE`). A world that lays wheels adds its table
  and its stage there. No stage id in engine code (generalitycheck PASS).
- **Easy's floor is the WALK-off** (the lead's ruling, 7:25 PM ET 11-18): wheelLay.ts `stepFault` (in wheelFaults): 'up' reads the jump;
  'edge'/'in' read the better of walk and tap on Normal, the walk alone on Easy. Easy edge and the toy `sparse` fly at V50 (walk-off 2.63 s;
  V60 was 2.2 s). The table (wheelFlights.data.ts) is re-flown; wheel.test.ts plants the V60 row and sees it refused by name.
- **Layer 'back'** (stagePiece.types.ts PieceLayer): the wheel draws in FRONT of the earth and BEHIND its jetty, street and every ledge.
  Painted ground: engine.ts hands its one `drawBack` to protoArt.ts drawProtoScene (`afterGround`, right after the soil, before trunks
  and ledges: the soil of a bank ABOVE runs all the way down through the sweep, so a wheel drawn before the ground pass vanished, ENG-26b's
  first stills); drawn ground: before the platforms. Once a frame either way; pieceHook.test.ts pins both orders.
- **Dev fixture** (src/game/wheelFixtureStage.ts, DEV only): `?fixture=wheel` (toy tower, travels left), `?fixture=wheel-right` (toy run,
  travels right), `&wheel=<row>`; `window.__play('2-95'|'2-96')`. It holds the toys' ONE kit (tools/inspect/wheelToys.ts re-exports it).
  Clip + named stills from the real page: `node reference/qa-reports/ENG-26/wheelClip.mjs <port> <out> [normal|easy] [up|side]
  [wheel|wheel-right] [row]` on a dev vite (frame-stepped, every press lift-checked, steps off in the FLOWN window; exit 3 on no board,
  a pond fall or no street).
- **The meter** (step 6): route.ts rides a wheel as ONE move `'wheel'` jetty -> street (the buckets are no route floor; dt = half a
  bucket period + half a turn); score.ts `wheelChallenges`: 'wheel-board' (0 bits when every moment boards, else windowBits over the
  period) and 'wheel-off' (windowBits over the turn of the flown step window, the easiest way; none for an 'in' street), cost soft (the
  safe pond); an unflown row is refused ('move:wheel'). meter-coverage.json `move:wheel` (bot SKILLS.rideWheel). Planted:
  tools/difficulty/wheelChannel.test.ts (in gates.yml's tool line).
- **Open:** the painted wheel (ART-W2B; wheelDraw.ts is still flat code boxes, brown on brown in the toy); the toy tower stands inside
  earth columns (its storeys are 90 px banks), not 2-6's look; step 8 (re-fly after ENG-285's in-air turn); travelling RIGHT on the page
  (`?fixture=wheel-right` lays no wheel: the toy run has no graph, and the toy tower turns left on every seed 1-300); 2-1's proven list
  is RED on this base and on 908ee7e5 alike (6 seeds replay differently: rebuild it), not the wheel's.

## 0zm-26. ENG-26 (t-eng-26 from t-meter-3@42459a5c, 11-18): the water wheel (2-6 NEW 1-2); what the next engineer and the 2-6 builder must know
- **The wheel (src/game/wheel.ts, pure):** `{cx, cy, R, N, W, V, way, phase?, lay?}`; bucket i's floor `bucketAt(w, i, t)`; its TOP moves `way`
  (the way he travels), the bottom back toward the jetty (2-6.md:7 says "toward the street side"; its own flight wheel26.ts:10-12 and the
  build turn it toward the jetty). `wheelLips` (jetty lip WHEEL.drop 28 over the bottom floor where a bucket's near edge meets it; street
  'edge' 28 under the top at the sweep's edge, 'in' 20 px past the axle over the top, 'up' `up` px over the top floor), `sweepBox`, `inSweep`.
- **The piece (pieces/wheelPiece.ts, last in PIECE_KINDS):** moves each bucket (a 'moving' Platform with `wheel: {w, i}`, `art: 'hidden'`) to
  `bucketAt(host.t)` and its rider by dx AND dy; engine.ts's sine loop skips `plat.wheel`; carryVx is the engine's (the jump keeps the
  bucket's sideways speed). The frame he is set down he is not yet carried (standingOn is found after the pieces step). Draws on 'world'
  through wheelDraw.ts `drawWheel` (PLACEHOLDER code shapes; the ONE function ART-W2B's painting replaces). 'world' is after the platforms:
  the painted wheel needs a layer BEHIND them (2-6.md: jetty and street drawn in front): ENGINE-WORTHY, not done.
- **The place (data):** `{ kind: 'wheel', after: <jetty>, row }` lays the street (this piece) where the row's wheel puts it (wheelLay.ts
  `streetFromJetty`); layStage lays the buckets and the POND (`layWheel`: a RiverZone `open`, speed 0, `safe` back onto the jetty,
  `wheelPond`, spanning the sweep +-WHEEL.pondMargin 160, surface WHEEL.pond 160 under the bottom floor). Rows: `WorldManifest.wheels`;
  World 2's W2_WHEELS (teach/edge/top/great) is NOT in w2Manifest (no shipped roll moves): 2-6's kit adds it. A storey that runs left lays
  it turned (way -1, reflectLocal mirrors the pond span). The stage shifts (pipeline.ts "right"/"down") move every wheel's axle
  (`stageWheels`): miss one and wheelFaults names the jetty lip. The tower: `localExtent` reads the pond's span and depth (the storey keeps
  its water clear), `towerCatches` keeps boughs out of the sweep (keepOut) and, with `towerFalls`, reads the pond as what lies under the ends
  over it (`pondFloors`). levelCheck: a wheel is two stops (its first bucket at the foot and at the top), the pond needs no banks.
- **The fairness (wheelFaults, in checkStage):** the row FLOWN on the real engine (wheelFlights.ts `flyWheel`, ~0.5 s a layout; the table
  wheelFlights.data.ts written ONLY by `npx tsx tools/engine/wheelflights.ts --write`; `--check` and wheel.test.ts re-fly it): tap board 100%,
  ride never drops him, step-off window (better of walk and tap; jump for 'up') >= 1.5 s Normal / 2.5 s Easy, 'up' <= 80/60 px; and the
  laid wheel IS the flown layout (lips within 2 px), pond under the sweep +-160, nothing solid in the sweep, nothing under the pond's water.
  An unflown row is refused by name. The table also holds each window's start/end as the bucket's angle past the top (the bot's cue).
- **The bot (firsttimer.ts SKILLS.rideWheel, wheelRide):** jetty: walk to the lip, stand, single hop in; bucket: hold still, settle in the
  middle before the window, step off in the flown window after stopReact (+lateQ): a TAP HOP for 'edge' (the walk-off missed for the
  expert: his tier-edge logic jumped; the hop is clean on every tier), a held jump for 'up', nothing for 'in' (the ride sets him down). It
  reads the engine's standingOn (at a bucket's front end floorAt under his middle finds nothing) and drops a press decided before he came
  down in a bucket. Toys: tools/inspect/wheelToys.ts (toy tower 2-95 on World 2's ground, rolled via listed.ts withTestStage; `sparse` is a
  toy row: five buckets). Measures: `wheelCrossing` (seconds jetty->street storey, scrambles, pond falls; from 2 s on: the bot's blind
  start walk). wheelRide.test.ts in gates.yml's tool line.
- **Open (named):** the painted look and its back layer (above); the meter does not price a wheel (no route move, no score.ts channel:
  coveragecheck passes only because no built stage lays one); stills/clip are from a page probe (reference/qa-reports/ENG-26/stills.mjs),
  not a dev fixture; 2-6's hand build (w2Stages.ts '2-6') is untouched (new replaces old when 2-6 is built).
- **Traps:** a JSON copy of a stage breaks the buckets' shared `w` (re-link by axle, stills.mjs); a short street can be overshot by a
  step-off (the tower runs its storey on, so it still counts); ENG-285 (in-air turn) changes the air model: re-fly the table after it.

## 0zm-snap. ENG-SNAP (t-eng-snap from t-build-25 76c05cbc, 11-20, R-165.339): the snapper bots play 2-5 the taught way
- **Two skills** (tools/inspect/firsttimer.ts SKILLS; toys tools/inspect/snapperTaught.test.ts on snapToys.ts's awake row, `snapperWatch`
  logs every stun/landing/kick): `bonkBrake` (a bonk's bounce keeps his side) and `letItSnap` (FirstTimer.letSnap: the child and the kid
  stand off its bite inside its engage, walk in only in the bar's quiet, step back on its creak, kick in its recovery after its snap).
  Middle, expert and adult still bonk. castBots 2-5: child 40/40 both settings (was 7/16), every other tier 40/40, kid 0 N / 4 E.
- **Physics the bot must respect** (each one cost a trace): (1) refined controls keep his speed on a mid-air let-go (engine.ts: only Down
  brakes), so a hop is steered by where its coast comes down (`steerToLand`, with the jump's `cutV` cut once his hold ends), never "toward
  it until there"; (2) a dazed snapper is still stomped (fight.ts stompTest: within its head's half-width + 18 px), so his bounce comes
  down 6 px clear of that (`offItsBack`, BONK.landTol 3) and inside the kick's 58; (3) the engine re-checks a landing as a stomp for
  0.09 s, so no steer in his last 0.15 s of air (BONK.lastPush); (4) KID/ADULT thumbs re-arm their late lift-off every frame (R-165.59:
  a KID steer is never let go) and the child's runs up to 4 frames, so those thumbs hop straight up from beside it (`bonkBeside`);
  (5) TURTLE sees only movement (no seesStill; stillness.ts calmIn 0.5/0.35 s): standing still in its band he is lost to it, so the
  creak step back is what it tells on; (6) tier thumbs pause between steers (rhythm): a step that must happen now sets `steady`.
- **Adoption** (`adoptBonk`, `bonkAir`): a stomp he did not mean (a hop off the last snap stone onto it; a bounce loop on its back) is
  taken as his bonk. FTRun.bonkHops / adopted count them. The kid lands on it this way in most toy runs (its route hop off the stones).
- **Traps:** the toy's stones are level with the banks, so a wait must not run on a pad (`floorAt(...).pad` → crossing logic first);
  the kid cannot hold a stand at all (its thumb), so its toy rows hold only "no bonk by choice, never hurt, kicks in its recovery".

## 0zm-25b. ENG-25b (t-eng-25b from origin/t-eng-25 21668b61, 11-18): the snapper bot skill and the meter's snap run
- **BONK-AFTER-THE-SNAP** (tools/inspect/firsttimer.ts `SKILLS.bonkAfterSnap`, `snapperPlan`, `bonkAim`, `BONK`): a cast animal a kick ends
  'chasedOff' AND that keeps a stage clock (`Enemy.kitBeat`; only World 2's snapper rows today). Only clock keepers: World 1's snake is also
  kicked off and sleeps, and its bots must not move. Asleep or dazed: walk in, kick (`{ kick: dir }`; the kick's box reaches from 8 px ahead,
  so no stepping back). Awake: wait 50-90 px off (the flown bonk range), step back only while it can bite, go right after the bar's 'on'
  ends (+ his hesitation) from a STAND (a running hop sails over its back) with its back clear (a floor over it takes the landing), the
  thumb's lag held still (`pending.still`: the bot's lag normally walks on into a running jump). The hop steers onto its back; once it is
  dazed the bounce steers back to his side; then the kick. Toy: tools/inspect/snapperBonk.test.ts on snapToys.ts `snapperKit` (ENG-25's
  row, id 2-89), RED with the skill off (never cleared).
- **The flight** (reference/qa-reports/ENG-25b/bonkFlight.ts, InputEngine, 30 fps): a tap bonk bounces him 78 px over the bank (54 over
  its back), a press held through it 131 (107); same on Easy. From a still stand the bonk is clean at every moment of the bar, and a
  head-on kick was too (its kick had no `when`). **TURTLE's kick is now `when: 'open'`** (b1dc6b76, the lead's ruling 6:53 PM ET 11-18:
  asleep, right after its snap, dazed by a bonk): a head-on walk-in kick 0/90 clean, 41 bitten. Planted in w2Cast.test.ts.
- **The meter's snap run** (tools/difficulty/score.ts `snapChallenges`): each run of snap stones between floors that never bite is one
  press, windowBits(bar, rideLay.ts `snapWindow`), a heart. piecesUsed now names a snap stone `pad:snap` (it read `pad:beat`). Test
  tools/difficulty/snapChannel.test.ts on `METER_ID` 2-19: a toy id among World 2's first stages, because levelCheck grants the leaf glide by
  the stage's place (2-94 is the 104th) and the meter's route then glided over the whole pond.
- **Traps:** (1) a toy's id sets what the level check grants him (skillGuaranteedAt): a 2-9x toy has the glide. (2) The laid snap stones
  sit 34 px below the banks (top 564 vs 530); 2-5.md's flight flew them level. (3) ENG-25's water lives are the testers' straight-up
  flick (`upOnly`) from a STAND on a stone: the steer comes 4 frames late, 34-38 px of travel over 40 px of water (waterTrace.ts).


## 0zl-25. ENG-25 (t-eng-25 from origin/main 6e7b85f8, 11-18): 2-5's two NEW pieces, proven on toys before the builder
- **SNAP STONES** (2-5.md NEW 1): a platform with `pad: { by: 'beat', on: 'bites', clock: 'snap-<row>', shift }`, `art: 'snapStone'`, type
  'solid'. pieces/padPiece.ts plays it: `brickNow('bites')` (solid always), `hurts()` while 'on' and he stands on it, returning
  `PieceHurt.hold` (NEW: damagePlayer's knock is vx 0, a straight jolt; the side knock threw him off an 80 px stone into the river). The jaw
  is drawn by snapStoneArt.ts from `brickCount` (beatBrick.ts: count 1-4 of the bar, a count = the 'on' length): 5 painted frames, counts
  1-3 OPEN-1..3, four SNAP (40%) then SHUT (tools/art/hf25/ship.py builds them from ONE painted take cell). `snapCount(plat)` for bots.
- **The row** is a PadRow `by: 'snap'` (gen2/rideLay.ts): 'snap' and 'stone' pieces, `snap: { count, warn?, wave? }`; snapClock = 4 counts,
  bite = the 4th, creak `warn` 0.5 s at the end of the 3rd; a wave's stone i shifts -i x count (later only). `snapFaults` (in pipeline's
  wet verdict) holds SNAP_FAIR from 2-5.md's flight: 80 px, 30-40 px water, <= 3 in step, wave never earlier, window to leave the bank
  >= 0.9 s Normal (snapWindow, within 0.05 s under the flight), Easy >= Normal. padFaults skips bites stones (one model per rule, D80).
- **The bot** (tools/inspect/firsttimer.ts PAD_SKILL.offBefore4, `snapGo`): plans over the frames of two bars, may wait on a stone not
  biting (rides the wave), presses a TAP near the lip (SNAP_PRESS 50 px; `snapHop` caps the next jump's hold, never a double).
  Toys: tools/inspect/snapToys.ts + snapRide.test.ts (step, wave; middle both settings + child Easy unbitten x4 variants; plants red).
- **THE CAST NEVER HAD A CLOCK** (fixed): CastPlay.step was never handed the stage clock, so an `onBeat` kind in play never told nor
  acted (the frog, any onBeat animal: proven only on predators/fixtures.ts). Now `Enemy.kitBeat` names the clock an animal keeps; CastPlay
  runs that animal's kind with onBeat by DATA and reads `clock.read(kitBeat)` each step (engine.ts stepCast passes `this.clock`).
  `beatCastFaults` (pipeline wet verdict): the clock exists and is fair for the kind's tell (checkOnClock).
- **World 2's snapper row**: gen2/worlds/w2Cast.ts `w2Snappers(clock)` (awake, asleep-first) + `w2CastSpawn` (kit.spawn: joins the
  turtle to proto.cast.kinds, no brief needed). Toy: src/game/gen2/w2Cast.test.ts on a gen2-laid row (kick -> chasedOff counted, unhurt;
  tell on the creak, snap on four; plant: clock withheld -> never tells).
- **Traps:** RealPlay starts `safe` (invincible 1e9): set `sim.safe = false` to test a hurt. A still sloth is unseen by a cast animal
  (stillness): a test of its tell must have him move. The bot hook `e.damagePlayer` must pass every argument (it dropped `hold`).
- **Open for 2-5's builder / next engine:** the meter prices a snap stone per stone (rideTiming), not the run's window (the missing channel,
  ENG-25 REPORT); no bot skill for the snapper (2-5.md `bonk-after-the-snap`: unbuilt); the stomp's bounce is unflown; no sound for the clack.

## 0W2A. ART-W2A (t-art-w2a from t-eng-23, 11-18): the follow poses are painted (followArt.ts)
- **The little ones:** followArt.ts followerPose (pure, followArt.test.ts) picks the painted pose: paddle -> <kind>Paddle (sunk 40% under
  the code ripple), home -> <kind>Happy (hopping), spooked and hiding -> <kind>Sad (Matt's painting, crouched behind the code reed tuft:
  the lead's YES 6:53 PM ET 11-18), else <kind>WalkA / <kind>WalkB swapped by GROUND COVERED (FOLLOW_STRIDE 15 px a frame: no foot-slide
  at any pace; a stopped one holds its frame). WalkB is the PASSING pose (legs together, body up): the painted bob, so no code lift.
  poseWidth draws every pose at its Happy pose's scale (FOLLOWER_W 33 for Happy). All nine frames are on w2-props (W2_FRAMES).
- **The heron:** heronPose -> w2HeronLook while warn or pass, w2Heron while calm; HERON_EYE / HERON_WARN_Y are the LOOK frame's (the
  gaze and the '!' only show while it looks). w2HeronLook is on dressnew-w2 at w2Heron's px a unit with its post exactly on w2Heron's
  (tools/art/hfw2a/pack.py), so the swap moves only the bird.
- **Trap:** re-running pack.py re-encodes both sheets (Q 88: Matt's pieces measured ~40 dB): run it from the committed sheets, once.


## 0ENG23. ENG-23 (t-eng-23 from main 6e7b85f8, 11-18): followers, "bring N home", the heron reads the line
- **Where it lives:** src/game/follow.ts (pure: trail, stepLine, join / spook / rejoin / regroup / home, zoneLookX, lineSeen),
  src/game/followPlay.ts (the per-stage glue: his mode each frame, set-backs, one heron per proto.watch stretch), src/game/followArt.ts
  (the draw), engine.ts startFollow / updateFollow / landUnder (a follow stage never runs updateWatch: the eagle is off there),
  goals.ts rescueCount (the ONE count the door and the HUD read: home, not freed), gen2/lineFaults.ts (the builder's check), w2.ts
  W2_FOLLOW, riverArt.ts drawReedClump (Bush.kind 'reeds'), tools/inspect/firsttimer.ts LINE_SKILL (+ lineBot.test.ts in gates.yml).
- **A stage turns it on with data only:** proto.follow (a FollowRow). Its watch zones become herons that read the line (never him, never
  a heart); WatchZone.lag starts a second heron late; WatchZone.setback (else the stretch's start) is where a spooked one hides.
- **His drops (the lead's ruling 3:01 PM ET 11-18):** every air stint, his hop or a walk off an edge, is his path; at the landing the
  trail judges it: down more than FollowRow.step (World 2: 90, a bank's lip) and the take-off becomes a WAIT. Toys 7-8.
- **Rules the toys forced (keep them):** a little one never rests mid-hop (finish it, or wait at the take-off: airSpan); a spooked one
  keeps its place (slot) until the look ends, or the one behind is seen closing up; rejoin only once it has run back; it scampers
  STRAIGHT back over his ground (trailYAt), never through his trail's history (he doubles back to fetch); paddling pins y to the surface.
- **Traps:** path replay means his own step back pulls the line to where he turned (the bot stops where the line fits, not at the far
  end). Any jump of him > 150 px in a frame is a set-back (regroup): a test that teleports him regroups the line. The page's touch layer
  owns the jump press: a page script cannot hop him by input.triggerTouchUp (stills.mjs stages his path as a ready trail instead).
  safeWindow (lineFaults) flies FollowPlay itself: change the line, and the check moves with it.
- **The meter reads the line (METER-4, t-meter-4, tools only):** score.ts `lineCrossings` / `lineChallenges` price each watched crossing
  the way lineFaults walks them (stretch start -> clump, clump -> clump, clump -> stretch end; a two-heron crossing once): the LEAVE
  windowBits(cycle, safeWindow) (lineFaults' flight, n = the cages freed before it, at most the goal), the first crossing a deadline on
  the stretch's whole first calm, the heron's eye a `span` of (G + N x gap) / pace; the STOP deadlineBits(px / PHYS.maxRun), px from
  lineInCover (= W - N x gap - 20); a spook 'soft', stakes + fetch (2 x distance / PHYS.maxRun) x STAKES.replayPerSec. Piece `line:follow`
  (coveragecheck reads it from ProtoExtras' FollowRow field); on a follow stage `beat:watched stretches` is the line's. Toys:
  tools/difficulty/lineToy.ts (`--read`). Change safeWindow, lineInCover or the row, and the meter moves with them.
- **Open:** the HUD faces (mock-up only, SHOW FIRST: reference/qa-reports/ENG-23/stills/HUD-MOCK-*.webp); the
  heron's own call and head-up pose (art asks); 2-3 itself (its builder lays it: REPORT §4 lists what it needs).

## 0zm-22p. ART-22P (t-art-22p, 11-18): CI checks the proven seed lists in parallel jobs (R-165.278)
- gates.yml `seedplan` runs `registrycheck.ts --shards --print` (stdout the matrix [1..n], stderr each shard's lists); `seedlists`
  (matrix, fail-fast off, 25 min limit) job i runs `--lists --shard i/n` then `seedlist.ts <id> --check` per list. n = lists / 4
  rounded up (SHARD_LISTS, ~2 min a list); shards balanced by seed count. A new list needs no YAML edit.
- `--shard i/n` exits 1 when n is not today's count or the shard is empty: the old `for s in $(...)` loop checked nothing silently if
  the list command failed. registrycheck's own `ci-seedlist` need (ciChecks) still reads the matrix line as the --lists loop.
- registrycheck.test.ts 'R-165.278' proves every list in exactly one shard (1-40 lists) and that the one-job loop is gone.
- The `rolled` job keeps its other steps and its 60 min limit (now ~5 min of work: lower it once a publish run proves the split).
- Live proof is the next publish run (deploy.yml needs gates): read the seedplan log for the shard lines and each seedlists job's time.

## 0zl-24. ENG-24 (t-eng-24 from main 6e7b85f8, 11-18): a liana over a river (2-4 NEW 1-2); what the next engineer and the 2-4 builder must know
- **The place (data, no type change):** `{ kind: 'river', after: <a liana's key>, row }` lays the water from the bank the liana (or its
  chain) is caught from, under the liana, to this piece (the far bank, riverWidth(row) past that bank). pipeline.ts 'river' branch:
  `riverFrom` (the near bank's key, read by layStage's river lay) and the liana's `hang.gap` = the water. The liana is an ordinary
  `{ kind: 'swing', after: <bank>, top, reach, len }`; a far `reach` (430 px in the toy) hangs it where no bank reaches it: then the way to
  it is a jump off a log (2-4 beat 4). The toy section: tools/inspect/lianaRiverToys.ts (sub-block versions give Easy its own row, as 2-1's
  bricks do: gen2 lays Easy from Normal's plan, so a Normal-only row such as gap280 needs an Easy twin, e.g. `deep`).
- **The judge (gen2/riverLay.ts):** riverFaults(st, difficulty) finds the lianas over each log river (river.ts `lianasOver`: a swinging
  liana whose anchor is inside the window). Under one, the hop rule gives way (riverFaults AND levelCheck's own "too far to hop") and
  `lianaRiverFaults` holds the DROP, LIANA_RIVER: Normal >= 40% of let-go moments land on a log (or past the water on the far bank, never
  back on the near bank) and the longest wait on the vine <= one swing (the liana's own period); Easy >= 85% and <= 0.6 s; a liana no bank
  reaches (levelCheck `lianaCaught`, now exported) must be caught by a jump off a log (`logCatches`), and on Easy its river runs <= 80 px/s.
  `lianaDrops` flies every press of a swing (physics.ts `pressLaunches`, the press as the engine plays it, pulled out of pressWindow,
  which is unchanged) once, then reads every phase of the log spacing off the flight (engine.ts onFloor's drift catch: DRIFT_CATCH side
  and drop, Easy's FORGIVE.landPx); the wait is read on the timeline where both clocks run, the river's phase taken AT THE PRESS.
  It matches the designer's real-engine flight (swingLog.ts) to the point on every forward row (long 86/92, twin 80/88, gap280 41/46
  Normal/Easy; gap280's wait 2.70 s exact) and a coarse RealPlay flight in its own test. 2-4.md's `back` row reads 65% here vs the
  design's 73%: the design's figure is grip 0.7 only; the judge takes the worse of grips 0.7 and 0.95.
- **airStep's engine turn (FOUND, ENGINE-WORTHY):** engine.ts:2567 adds PHYS.airTurn when he steers against his motion in the air;
  physics.ts airStep did not, so every check's back-swing let-go under-steered by 20-30 px (reference/qa-reports/ENG-24/backProbe.ts).
  SUPERSEDED by ENG-285 (§0zo-285): the `turn` switch is gone, airStep turns for every caller (R-165.285).
- **The bot (tools/inspect/firsttimer.ts SKILLS):** `dropOnLog` (on a liana over a log river he lets go only when the let-go, at his thumb's
  lag and half a spread either side, comes down on a log 12 px in from its ends or 16 px onto the far bank; the same pressLaunches
  launch the judge flies; the 7 s "late" let-go waits too, up to the 14 s cap; an aimed drop gets no random second press). `vineFromLog`
  (on a log under a liana over its river, ahead and not the one he just left: a jump off the moving log catches it (hopCatches with the
  carry, at the lag's middle and half a spread either side, at his speed now and standing), taken off while still on the log; the press
  waits standing (pending.still)). On a log under a liana: no pad pause on a log running his way (it flicked him on blind) and no
  lianaWait (the log's front is no ledge). Both held to such logs only (`lianaRiver`), so every shipped river's bot run is as on main
  (riverRide 18/18). TierRun gains `ontoLog`, `fromLog`.
- **The real input (RealPlay.useRealInput(holdMs?), RunOptions/TierOpts `realInput`):** the bot's pad goes through the game's own
  InputEngine as TouchController does (triggerTouchMove, triggerTouchUp with the touch's minimum hold, releaseTouchUp, triggerTouchClimb).
  Proven: a Pad tap at a run is 0.43 s in the air (FakeInput's bare press 0.30 s). Opt-in: no other bot test uses it yet.
- **Tests:** src/game/gen2/lianaRiver.test.ts (7: the judge vs the flight and the engine, the toy clean both settings, logs out refused,
  sparse refused by name, the hop rule only under a liana, the catch and Easy's 80 px/s); tools/inspect/lianaRide.test.ts (3, gates.yml:
  the harness hop, drop-on-log gap280 0 lives on vs 8 off, vine-from-log 4/5 per setting on vs 0/10 off). Planted faults:
  reference/qa-reports/ENG-24/planted-faults.py (5/5 CAUGHT).
- **Open (named):** the meter does not see the liana: its route boards the logs from the bank (`ride-board`/`ride-off`), so a let-go onto
  a log is never priced (no route move onto a drift from a swing, no score.ts channel); coveragecheck passes only because no built stage
  lays one yet. Clips of the toy: the page cannot build the toy (a dev fixture is needed, chaseFixtureStage.ts's pattern);
  reference/qa-reports/ENG-24/lianaClip-draft.mjs + clipRecord.ts are the start. The catch toy's middle Normal variant 3 loses 2-3 lives
  boarding with the skills on or off (the existing ride, not these skills): untraced past "stands on the log, then runs off its front".
- **Traps:** a toy liana 410 long over a log hangs its foot at the bank's top: a log carries him into it and the engine takes him on, so no
  jump is asked (the catch toy's is 320). A bot change that skips a random draw (`between(this.r, ...)`) moves every seed-pinned plant
  after it (2-1's upstream/bankUp plants stopped biting until the change was held to liana rivers).

## 0zm. BUILD-19b (t-build-19, 11-18): what moved when 1-9 left the hand-built path (no engine code changed)
- Tests that used the hand-built 1-9 as a fixture now point elsewhere: verdicts' "never flown" stage is 5-7; writtenKeys' seed with a find
  id is 2-3 (no World 1 stage writes one now); sheetWarm follows the ring drops to the hand-built stage that keeps a ring; w1Pits no
  longer pins 1-9's vault pits; flagSpan LV-9 walks 27 hand stages (1-9's flags: gen2's verdict, reference/qa-reports/BUILD-19/flags19.ts).
- A judged stage's flown rows are cited from chain.md §1 (verdicts.test checks the source string), never from the flight log directly.
- A stage moving to gen2 sheds its known-list entries: coveragecheck names them (1-9's 'beat:ring waves' went).
- FIXED by ENG-19c (§0zn): the frozen-out boa sat coiled 4 s (he walked through it); the roost's boa fled through him and left a burst.

## 0zn. ENG-19c (t-build-19, 11-18): a fleeing animal is SEEN to go, and never leaves through him
- core.ts immobile(def) (no speed, not a sweeper; NOT the habit-based posted()): today the boa and World 6's frog. Its 'flees' beat
  (still, stomp, ...) runs slideOff: away from him along its range, FLEE_OFF (140) past its end, back home as awayUntil ends (the beat's
  seconds unchanged); speed its own flee speed or 2.5 x the round trip / its time. A walking animal's flee is unchanged (walks home).
- core.ts stepFlee leaving: on its first step, if its way out runs into him (LEAVE_CLEAR 320 px, within its sight's height) it turns:
  general, so every chased-off animal (1-3's trapped snakes too) leaves away from a close Pokey.
- castPlay.sync: a flee past its range end sets e.glide (drop + fade); 0 again at home. engine.drawWithReaction fades by e.glide (the
  types.ts promise nothing drew before; leaving animals now fade out too). engine.updateKo returns at koLife 0 (gone on its own / a
  flag's replay): no gravity, no landing burst.
- Tests: src/game/fleeSlide.test.ts (8); reference/qa-reports/BUILD-19/planted-faults.py (10, three for this).
- Trap: 'cleared' fires on the BEAT, not at 'gone' (a test following a leave must follow phase 'gone').

## 0zl. BUILD-19 (t-build-19, 11-18): a stage whose goal counts petals never tops up animals
- pipeline.ts planBudget `fights` and topUpFoes: a purge or gauntlet whose goal counts petals (goals.ts goalCountsPetals: stagePlan
  `gathers: 'petals'`; 1-9) lays its sockets' animals and no more (quota.lay = the goal, no +2; no top-up). Before, 1-9's gauntlet kind
  topped 12 designed boas up to targetCount + 2 = 16 onto any 248+ px bank. Test: src/game/gen2/petalGoalTopUp.test.ts (planted: the
  clause removed -> lay 16); the built half on the real stage: w1Arc19.test.ts. The lead's ruling 10:09 AM ET 11-18.

## 0zd-19b. 1-9's engine finished (ENG-19b, t-eng-19b, 11-15): what the 1-9 builder and the next engineer must know
- **The kit boa's coil hurts on touch** (the lead 11:20 AM ET): PredatorDef.coil (BOA 58x26); core.ts hurt(): the coil box in rest,
  hunt, tell; the strike's box in act; NONE in recover (the punch's window), stunned, flee, gone. The kit's fairness gate
  (predators/fixtures.ts) allows outside a strike ONLY exactly that coil box (approved 11:31 AM). boaCoil.test.ts.
- **Easy notices him 1.3x as far off** (easy.engage, engageOf(); the lead 11:31 AM). From a run: Normal still to 13 frames, Easy to 18
  (0.60 s). Not 26: the whole boa must sit inside the 270 px an upright phone shows ahead (boaFreeze.test asserts 195 + 58 <= 270).
- **A stage that teaches the freeze**: its brief's `teaches` holds 'still' and it casts (pipeline castOf writes CastData.teachStill): its
  first freeze is the slow-motion moment wherever he stands (1-9 beat 2); later ones only inside the strike's reach. castFreeze.test.
- **The roost is drawn**: w19Art.ts drawEagleRoost at each proto.gen2.roosts post (nest over the post, bough piece on its ground; 145 px,
  1.63 of Pokey), preloaded only when a stage lays one (stageManifest 'w19'). Asset src/assets/w1-19/w1-roost.webp; catalog hf19/w1-roost.
- **Bots**: firsttimer.ts freezePlan (learned 'freeze' from "freeze" / "don't move" only, or `knows`; reaction stopReact + thumb lag;
  the kit's own engageOf per setting). A coiled animal is never hopped as a walker (1-3's snakes, no coil, unchanged). boaBots.test.ts
  (CI): toys + plants. The roost needs no bot skill (the boa flees in its first rear frame). Clip: boaClip.mjs `bot` replays
  boaBotPads.ts's recorded thumb.
- Open (named in reference/qa-reports/ENG-19b/REPORT.md): the child bot on Normal is hit at 3/6 boas (reaction 0.49 s vs 0.43 s);
  bots pause on a 1.1 s creaky limb (14/30 drops); hopping a rearing coil (an expert's move) has no bot yet; topUpFoes on a NO-cast stage
  would top up an old-brain boa from W1's 'topup' rows (no stage does today); the red glow under a beaten boa (ENG-19a rough).

## 0zc-19a. 1-9's engine pieces (ENG-19a, t-eng-19, 11-14; stopped at 40% context): what the next engineer must know
- BOA.tell is 1.0 s (world1.ts:57; boaFreeze.test.ts flies it). Only KIT boas read it: no shipped stage has one (18 boa stages are the OLD
  brain, predatorAI.ts:300, rear 0.6 s, no freeze; tools/engine/runs/boaReach.ts proves it). The lead rules whether the old brain moves.
- pipeline.ts castRows: a stage whose brief casts lays only those kinds (fillSockets, topUpFoes). Any new row in a shared manifest re-deals
  every stage drawing from it otherwise (the bag's shuffle). W1_BOAS (w1Cast.ts) rides on it; lockall 102/102 unchanged.
- lureLay.ts lureFaults: an animal the kit never moves (speeds all 0) is drawn only where it lies; its rear is the read. W1_LURE (w1.ts) lays
  'w1-roost' into proto.cast.lures and proto.gen2.roosts; NOTHING DRAWS IT YET. Letter `l` = lure (nodeLetters.ts, FILL_LETTER 'lure').
- CastStep.froze + CastPlay.eyeOut + engine FREEZE_SLOW (0.6 s, zoom 1, slowMoBy 'freeze' cut when a sweeper's eye comes out).
- Toy clips: tools/engine/runs/boaClip.mjs (freeze|late|roost, up|side). Trap: GoalCard holds on real time; poke it (a key) before the run.
- Open: the roost art (REPORT step 1, tools/art/hf19), its draw, the red glow under a beaten boa, the kit boa's missing body block.

## 0zl-168. TIME-168 (t-time-168 from origin/main@6e7b85f8, 11-18): the time-stamp gate (R-165.168)
- `tools/timecheck.mjs` (+ `tools/timecheck.test.mjs` on gates.yml's tools tsx line; the run is after roadmapcheck): a dated ET
  time a commit adds to STATE, LESSONS, handoffs, packets or a qa-reports REPORT.md may not be later than that commit (+2 min).
  Lines are blamed at the head over the FULL history (`-w -M -C`) and kept only if `rev-list` puts their commit in the range: a
  stamp corrected by a later commit clears, a moved line keeps its first commit. Exit 2 on a shallow clone.
- Ruling to keep (lead, 11-18 5:45 PM ET): judge what is still at the head; history is never rewritten.
- Traps: blame's own range/--since marks boundaries wrongly (and this container's clone was shallow: `git fetch --unshallow`);
  plan words must be read inside the time's clause, never a fixed word window (a 3-word window hid "(lead, by date): MATT 11:29 AM");
  "by Matt 11-09 9:10 PM" is a record, "Stop line 7:45 PM" a plan. Tune any rule change on a 10-day `--since` scan, reading every
  hit and a listing of every skipped time. Open: R-165.168 to done at merge; the lead corrects the 75 lead-branch stamps first
  (reference/qa-reports/TIME-168/breaches-lead.txt), or the release gate is red.

## 0zk. FIX-22b (t-fix-22b from t-fix-22@a1acbbe2, 11-15): the ground squares and a sheet arriving
- **The fault (general, every stage):** protoArt.ts drawGroundChunks and drawWallChunks had `sheetEpoch.n` (atlasLoader: counts EVERY
  sheet that finishes loading) in their key. Any sheet arriving in play (2-2's pad ripple the first time a pad sank; a creature's sheet)
  threw every baked square away, and with CHUNK_BUDGET 3 a frame the ground was drawn LIVE (drawGround: soil tile by tile, shadeSoil's
  blobs) for the frames it took to repaint: 2-2 sideways at x 9388 went 5.70 -> 10.66 screens a frame for 4 frames (drawcheck 8.18 >
  7.5). Now each square keeps the count it was painted at (`epoch` map); a stale square in view is drawn while `sheetsSince` repaints a
  few a frame. Geometry, world, scale and view height still drop everything at once (a stale square there would be the wrong ground).
  Planted: groundSeams.test.ts 'a sheet arriving in play never throws the painted ground away' (red without: 7 soil tiles live).
- **How to find a drawcheck spike at one spot (it took minutes, not hours):** the harness's site numbers are summed over all spots, so
  copy tools/perf/run.mjs to tools/perf/_x.tmp.mjs (it imports ./instrument.js; never commit it), make it visit spots 0..N but count
  only spot N, screenshot each spot, and print `frames[].drawImageArea / (canvas w*h)` per frame: a spot measured alone was 5.71, after
  spot 0 it was 8.18, and the per-frame numbers (5.70 x4, then 10.66 x4) showed a cache dropped mid-count. A console.log in the cache's
  reset, read with page.on('console'), named the sheet. Draw-only fixes: prove the layout with a hash of platforms/vines/ropes/rivers/
  collectibles/spawn/exit on both heads (FIX-22b REPORT).
- Not done: protoArt.ts's bough tip cache (~line 457/485) still keys on sheetEpoch; one small canvas, never seen in a breach.

Rewritten for INT-11 (11-15, t-int-11, link #5 = 1-6 + 1-7 + 1-8 + 2-1): section 0zj (the world finish in every judge, a refused roll never throws, the merges).
Rewritten for INT-10b (11-15, t-int-10b): section 0zh (joined pit floors as one piece, the merges, 1-4's column petals, 8-3's pins, the swing into a bank).
Rewritten for ENG-WATCH2 (11-15, t-eng-watch2): section 0ze (the watcher's glance, passAt, the re-check, the dials and the rulers).
Rewritten at the end of INT-1-1 (11-11), on its final head: branch `t-int-1-1` = C1's re-laid 1-1 (t-content-c1@0fc0835a, passed,
on E0a d2748131 and A1 41c2e248) + t-content-c1-tests + the vendor split (t-engine-chunks@e67809c3) + the help ladder
(t-engine-help@98186930) fitted to the new layout, with the Critic's two deltas fixed. Not merged: the one PR that ships E0 + C1 + A1 +
A2 (ADR-001). Sections 0a-0b below are still true.
Rewritten for INT-10 (11-15, t-int-10): section 0zg (petal arcs by brief, the meter's fixed anchor, 1-6 Easy, 1-1 relist and locks). Rewritten for ENG-PETAL (11-14, t-eng-petal): section 0ze (the one walked-path model, the LOW brief, the wall at joined pit floors). Rewritten for ENG-16I (11-14, t-build-16): section 0zd (the moved lists re-proved, 1-1 relisted, the bot out of a pit past a crumbled limb, the petal table). Rewritten for ENG-16H (11-14, t-build-16): section 0zc (t-tools-2 merged in; soft-pit floors under floating perches; the walked-span petal lay; the snake's tell after a catch; the bot's way on a liana). Rewritten for ENG-16G (11-14, t-build-16): section 0zb (the height-aware swing clearance and its lay rule, a parked frame, petals on the walked path). Rewritten for ENG-16E (11-14, t-build-16): section 0z (the late press's swing, the testers' let-go in the lay, the petal fill's path). Rewritten for ENG-S5 (11-14, t-eng-s5): section 0y (liana to liana). Rewritten for ENG-S4 (11-14, t-eng-s4): section 0x. Rewritten for ENG-S3 (11-14, t-eng-s3): section 0w. Rewritten for ENG-S2 (11-14, t-eng-s2): section 0v (the vine snake, the false liana, letGo). Rewritten for HOOKS (11-13, t-hooks): section 0t (the piece hook, the letter table). Rewritten for FIX-INT (11-13, t-int-5): section 0n (tonight's 3 unit reds). Rewritten for FIX-A (11-13, t-fixa): section 0l (Dot's card). Rewritten for INT-3 (11-13, t-int-3, the 0.9.8 integration): section 0m. Rewritten again at the end of R-165.112 (11-11): branch `t-engine-seedchunks`, rebased onto the passed t-int-1-1@874f11f6: each stage's proven list is
Rewritten for FIX-INT (11-13, t-int-5): section 0n (tonight's 3 unit reds). Rewritten for FIX-A (11-13, t-fixa): section 0l (Dot's card). Rewritten for INT-3 (11-13, t-int-3, the 0.9.8 integration): section 0m. Rewritten again at the end of R-165.112 (11-11): branch `t-engine-seedchunks`, rebased onto the passed t-int-1-1@874f11f6: each stage's proven list is
Rewritten for BUILD-17b (11-14, t-build-17): section 0y (1-7's shared faults fixed for every stage). Rewritten for BUILD-17 (11-14, t-build-17): section 0x (1-7 built; hanging cover; the perch at 56). Rewritten for ENG-E2 (11-14, t-eng-e2): section 0w (1-7's moss cover, the perch, bots that hold still). Rewritten for ENG-E1 (11-14, t-eng-e1): section 0v (1-7's eagle and cover on the kit). Rewritten for HOOKS (11-13, t-hooks): section 0t (the piece hook, the letter table). Rewritten for FIX-INT (11-13, t-int-5): section 0n (tonight's 3 unit reds). Rewritten for FIX-A (11-13, t-fixa): section 0l (Dot's card). Rewritten for INT-3 (11-13, t-int-3, the 0.9.8 integration): section 0m. Rewritten again at the end of R-165.112 (11-11): branch `t-engine-seedchunks`, rebased onto the passed t-int-1-1@874f11f6: each stage's proven list is
Rewritten for B6 (11-14, t-eng-b6 from t-int-9@1c7f6b95 + t-eng-b5): section 0B6 (the still fork, the runner liana, the tip, Easy's chase gap; the orphan-root merge) and 0v's not-built line. Rewritten for B5 (11-14, t-eng-b5): section 0w (the rolling nut and fruit, the chase camera lead, the ?fixture=chase route) and 0v's not-built line. Rewritten for B4 (11-14, t-eng-b4): section 0v (the chase laid by gen2, finished for 1-8's builder: what a builder can lay now, what is open). Rewritten for B3 (11-14, t-eng-b3): section 0v's first form. Rewritten for B1 (11-13, t-b1-chase): section 0u (the chase piece). Rewritten for HOOKS (11-13, t-hooks): section 0t (the piece hook, the letter table). Rewritten for FIX-INT (11-13, t-int-5): section 0n (tonight's 3 unit reds). Rewritten for FIX-A (11-13, t-fixa): section 0l (Dot's card). Rewritten for INT-3 (11-13, t-int-3, the 0.9.8 integration): section 0m. Rewritten again at the end of R-165.112 (11-11): branch `t-engine-seedchunks`, rebased onto the passed t-int-1-1@874f11f6: each stage's proven list is
its own lazy chunk (section 0d). The lead's ruling, 11-11 5:18 PM ET: the stand-in is ACCEPTED (a failed list load plays 4106 by its
proven plan; Play is never blocked).
Rewritten for BUILD-18c (11-15, t-build-18c): 0LOOK2's join, crack, moss-fog and shooter lines. Rewritten for ENG-CL (11-14, t-eng-cl): section 0CL (the quiet line as played, the judge's laid copy, roll sockets, the tip and still-fork lays, runnerLip, Easy's bump). Rewritten for ENG-DR (11-14, t-eng-dr): section 0DR (the list runs each row's own finish; any inventory piece as dressing). Rewritten for INT-9 (11-14, t-int-9): section 0z (pit banks reach past the floor). Rewritten for ENG-S5 (11-14, t-eng-s5): section 0y (liana to liana). Rewritten for ENG-S4 (11-14, t-eng-s4): section 0x. Rewritten for ENG-S3 (11-14, t-eng-s3): section 0w. Rewritten for ENG-S2 (11-14, t-eng-s2): section 0v (the vine snake, the false liana, letGo). Rewritten for HOOKS (11-13, t-hooks): section 0t (the piece hook, the letter table). Rewritten for FIX-INT (11-13, t-int-5): section 0n (tonight's 3 unit reds). Rewritten for FIX-A (11-13, t-fixa): section 0l (Dot's card). Rewritten for INT-3 (11-13, t-int-3, the 0.9.8 integration): section 0m. Rewritten again at the end of R-165.112 (11-11): branch `t-engine-seedchunks`, rebased onto the passed t-int-1-1@874f11f6: each stage's proven list is
its own lazy chunk (section 0d). The lead's ruling, 11-11 5:18 PM ET: the stand-in is ACCEPTED (a failed list load plays 4106 by its
proven plan; Play is never blocked).


## 0zj. INT-11 (t-int-11, 11-15): what the next engineer must know
- **One finish for Play and every judge**: listed.ts `playFinish(row, st, d)` runs the row's WORLD finish (`worldFinish(row)`: World 1's
  w1Finish with its squirrels, World 2's w2Finish with its rivers) then the kit's own. seedlist, libstage, yield and the list rules all go
  through it. Before INT-11 the 2-1 line's seedlist judged without w2Finish, so the played 2-1 had a 4.1 s quiet stretch no list saw (D19).
  A new world's kit adds its finish to listed.ts WORLD; nothing else names it.
- **A refused roll never throws** (pipeline.ts buildRolledOn, the assemble catch): a throw after a swap, OR after the search's own
  stage-wide bans (bans[-1]: a section refused twice), is a refused roll; only a first build with neither throws as before.
  refuseNotThrow.test.ts (2-1, 1-8). Designed arcs (one brick a beat) are where a stage-wide ban empties a node.
- GraphBrief.petals is 'low' | 'few' | 'normal'; petals.ts petalsLow holds 'few' too. walkedSpan's Ask has 'ride' (skipped like a bounce).
- 1-8 is judged on its own flown rows (flownArcs n18; FIX-GATES 11-15, list relisted 100 of 121). A bounce outside a teach node on a
  stage after 1-1 (skills.ts BOUNCE_TAUGHT_AT, bounceReusedAt) whose lip is within the bounce alone is 'bounce-reuse' (reach.ts BANDS
  128-218: one jump's climb + SPARE to the bounce alone's 223 - SPARE); past it, the combo (refused while untaught). 1-1 and teach nodes
  keep 'bounce-teach'. Planted: bounceReuse.test.ts. The never-flown example in judgedTable/verdicts tests is now 1-9.
- Traps: the bots turn back on a perch whose way on is two steps down (kid, 160 px steps) or after liana 2 (adult Easy 2-1 seed 8):
  PERCH-TURNBACK, the bot owner's. Stills: 'low' picks the lowest piece spanning x even when buried under a stair (1-8 x13900): pick an
  exposed top.

## 0LOOK2. The bough look, the settle after the chase, an asked join, the tip's marked fall (ENG-LOOK2 11-15; ART-18 11-15 after it)
- **The bough** (protoArt.ts, from `WorldManifest.ground.look: 'bough'` -> `GeneratedStage.groundLook`; the engine calls setGroundLook +
  setBoughJoins at stage start): every `boughPiece` (plain ground >= 40 px deep, no own look) is baked into the ground squares as the HF bough
  (src/assets/w1-18/hf18-bough.webp: 3 variants as rows, any follows any, per tile by world x: never mirror, a mirrored seam is a chevron);
  chase sections are NOT in the bake (they fall every few frames); the chase piece draws them via drawChaseSection -> drawBoughSection (a
  small baked canvas when a section has an end). Ends (boughEnds, now at any x): joined / under (a step: the lower runs 30 px on) / living
  (a round cap: ART-18 (k) ry 0.54 T centred at 0.5 T; the far branch is living because layTip marks it pit 'drop') / torn (splintered).
  Ends are ERASED (destination-out) only in baked canvases, never live, and each erase is clipped to its own piece's drawn x range (ART-18:
  a higher stair step's erase cut a straight notch out of the lower one). The mist: drawBoughMist (one drawImage of a 4x256 strip).
- **Stairs (ART-18 (m), boughSpans, tested in src/game/boughSpans.test.ts on 1-8's real stair):** a bank draws only the top no higher
  piece stands on; a shown stretch under BOUGH_STUB_MAX (2 T) is a stub: bark BOUGH_STUB_BODY (0.6) thick, both ends rounded, never run
  under another. drawBough takes `body` (bark scale) and `smooth` (a bake: taper slices one device px; 3 px sawed the tip's underside and
  grain). The tip's tapered bark is baked once per section+scale (tipTaper), so a re-bake when its neighbour falls is one drawImage.
- **Dressing (ART-18, w1Arc18 finish18):** PALMS_18 (4 painted palms, 2 near + 2 hazed back) and TRUNKS_18 (the cannonball trunk + its
  mirrored, hazed back copy) each take turns, no picture twice within PALM_APART_18 (1800); a look rule never throws (falls back to the
  farthest); back rows drawn first. `nut`/`up`/`dx`/`y` per palm are checked against the inventory by w1Arc18.test.ts. New palm art:
  tools/art/hfpalm (spec, cut.py keys magenta by hue+saturation+brightness, nutpt.py, hazed.py); raw takes are NOT kept (sandbox gone).
- **settleLaid** (pipeline.ts): the kit's settle again after the chase cut its banks. **entry.join 'walk'**: laid not rolled; 1-8's
  still fork and tip ASK (BUILD-18c: w1Arc18 brick({ join: 'walk' }); w1Arc18.test 'walked onto on every roll' seeds 1-4 both settings).
- **Traps / open:** a step end reads square in a clip's first frame (likely the live fallback before its square bakes: verify); re-bake a
  bank's end when its neighbour falls; crack art on a cracking bough (a cracking section only quivers: drawChaseSection's chaseCrack frame
  is the OLD log look, never drawn on a bough stage; no crack picture exists for the bough); W1's hanging front leaves are code-drawn
  (painted cuts ready in reference/art/hfpalm/leaves/, not wired); near palms all have ringed grey trunks.
- **Hanging dressing under a bough is fogged out (BUILD-18c, 11-15):** engine.ts:7217 draws invDress 'behind' BEFORE the ground, and the
  ground pass draws drawBoughMist (protoArt.ts:503, near solid) over it: w17-moss-drape hung under 1-8's still fork read as one faint grey
  wisp. The fix is draw order (a hung row under a bough stage's line drawn after the mist, before the banks), for every bough stage; 1-8's
  MOSS rows wait for it (not laid; BUILD-18c REPORT has the ready packet).
- **stills-at.mjs traps (BUILD-18c):** (1) several spots in one page: after the tip spot, later spots render the wrong scene (a palm still
  showed flat bough with no palm): shoot ONE spot per page; (2) invDress pictures load lazily: render once and wait ~2.5 s real time before
  the stepped frames, or a first-seen palm is missing. **addlevel** read castBots' PASS lines with a regex that broke when LEN-14 added
  'under the floor N' (every stage said 'castBots did not run'): fixed in BUILD-18c.
- **1-8 judged (FIX-GATES 11-15):** see 'bounce-reuse' above. Pre-existing reds on t-int-11 7b012852e, not FIX-GATES': verdicts.test
  5-7 / 7-1 'builds as on main' hashes.

Rewritten for METER-1 (11-14, t-meter-1): section 0zf (the meter reads what a stage asks from the game's own numbers). Rewritten for ENG-CL (11-14, t-eng-cl): section 0CL (the quiet line as played, the judge's laid copy, roll sockets, the tip and still-fork lays, runnerLip, Easy's bump). Rewritten for ENG-DR (11-14, t-eng-dr): section 0DR (the list runs each row's own finish; any inventory piece as dressing). Rewritten for TOOLS-2 (11-14, t-tools-2): section 0zb (one helper for the setting's dials; the test link's cap and published copy). Rewritten for TOOLS-1 (11-14, t-tools-1): section 0za (a flight cache keyed by the setting's swing; the meter's swings; clipcheck's frame walk). Rewritten for INT-9 (11-14, t-int-9): section 0z (pit banks reach past the floor). Rewritten for ENG-S5 (11-14, t-eng-s5): section 0y (liana to liana). Rewritten for ENG-S4 (11-14, t-eng-s4): section 0x. Rewritten for ENG-S3 (11-14, t-eng-s3): section 0w. Rewritten for ENG-S2 (11-14, t-eng-s2): section 0v (the vine snake, the false liana, letGo). Rewritten for HOOKS (11-13, t-hooks): section 0t (the piece hook, the letter table). Rewritten for FIX-INT (11-13, t-int-5): section 0n (tonight's 3 unit reds). Rewritten for FIX-A (11-13, t-fixa): section 0l (Dot's card). Rewritten for INT-3 (11-13, t-int-3, the 0.9.8 integration): section 0m. Rewritten again at the end of R-165.112 (11-11): branch `t-engine-seedchunks`, rebased onto the passed t-int-1-1@874f11f6: each stage's proven list is
its own lazy chunk (section 0d). The lead's ruling, 11-11 5:18 PM ET: the stand-in is ACCEPTED (a failed list load plays 4106 by its
proven plan; Play is never blocked).

## 0zi. INT-10c (t-int-10b, 11-15, link #4's reds): what the next engineer must know
- **The walked model has the lead's ruling A** (11-15 1:41 PM ET; walkedSpan.ts walkedSpanOf): a piece no plain jump from behind clears and
  a plain jump leaves is path, its whole top walked (6-2's pool stones had lost 198/201 socket petals). ENG-PETAL's walkedPath test A is
  restated to it (+A2: a piece a full jump clears outright still has no span). 1-6's bank rows are gone (they made up for the stripping);
  its arcs stay; band 0.86-1.2 holds.
- **Open: petals.test "spread out"** (13 stages over 2 screens bare; main GREEN). Traced causes: (1) liana perches (1-6, 6-1, 6-3, 8-3):
  A's liana half (let-go sets him down + a catch leaves) fixes them but breaks walkedSpan.test's two-liana toy, whose point is ENG-PETAL's
  1-6 sealed-door evidence (petals behind every landing): the lead's call. (2) contiguous stair steps over SEAM's 10 px (2-8 x9092-11448,
  20 px rises, no gaps): a full run's jump "clears" each (lo capped at its end). (3) 5-9 and 9-8: positive spans in the gap, petals still
  missing: untraced (the fill? walkPetals?). (4) 1-8's last stretch + tip, 1-4 (from x -9489, a climb): may be special stages: ask.
- **Flags moved by a lay stand on the ground there, height too** (chaseTip.ts layTip, readyStillFork); the harvest top-up reads room kit
  pieces (fillSockets clear()); an arc petal never reads as standing outside its piece's span (petals.ts readsStanding).
- **Test fixtures**: the listed-stage fixture is 1-99 (judgedTable/listed tests), never a real stage.

## 0zh. INT-10b (t-int-10b, 11-15, link #4: 1-6 and 1-7's glancing eagle): what the next engineer must know
- **Head**: t-int-10 9d8c9fda + the join fix + ENG-LOOK d2bc1d89/c738e52f cherry-picked (the hand-built 1-8 deleted, the 7 chase tests on a
  laid chase) + t-eng-watch2 8fbaaacf merged (4 additive conflicts, both sides). Gates, bots, stills: reference/qa-reports/INT-10b/REPORT.md.
- **Joined soft-pit floors are ONE piece** (pipeline.ts `joinPitFloors`, called where pitHoleFill's fills were laid): a floor reaching a
  bank is lengthened to it (the bank deepened); two floors at one height a perch apart become one (the later one leaves `platforms` and its
  section's seam); a step joins at the deeper floor, the shallower one deepened to its foot (INT-9's bank rule). No floor end is left in a
  run, so no stair stands flush on one (gen2Pits.test's slot rule, now on each stage's first two LISTED seeds: the lead's ruling A).
  Moves 1-1, 1-6, 1-7, 1-8 geometry (every W1 list still --check PASS) and 8-3 (re-pinned with the NOJOIN revert proof, p83.mts).
- **Pass budget + glance**: a sweeper whose `passesLeft` is 0 never re-checks or glances (core.ts endPass/stepGlance): the still fork's
  "no second look". The still fork's eagle DOES glance before its pass (the lead 12:38: one rule for every eagle). Since watch2 the eagle's
  eye always crosses toward him (EAGLE.passAt 'far'); the still fork's `facing = -1` is now redundant.
- **1-4 column petals**: a climb trail under a fig gate starts inside his body at the shut lid's head stop (vineField.ts `shutLidFeet`,
  fieldPlay's own `shutBoughOver` shared); `pairPetals` moves a petal within PICKUP_REACH (38 px) of a field line. 
- **ENGINE-WORTHY, not done (the vine-feel packet, R-165.271)**: (1) a liana's far swing carries the hanging hero into a bank's face and a
  let-go there falls THROUGH the bank (1-6 child N s23, x 32697 y 765 vs the bank top 726; swingSetup clips only against neighbours;
  swingInto.mts finds it on 40/40 1-6 layouts); (2) the tree_climb grab takes the FIRST vine in reach in list order, not the nearest
  (engine.ts ~2086): in a 55 px vine field he snaps to a neighbour. fieldPetals' harness sets the first hand explicitly until it is fixed.
- **Known reds not ours**: 1-8 child N s7/9/13 rescues ("fell back down 8 times", chase hits), identical on t-eng-dr (BUILD-18's).
- **Traps**: a lockall/castBots run spawns workers that compile whatever is on disk: never edit or merge in a tree they run in (do merges in
  a side worktree, then fast-forward). Faking a fig gate open by `cluster.gone = true` leaves the field half-open (other columns break).

## 0zg. INT-10 (t-int-10, 11-15, link #4 for 1-6): what the next engineer must know
- **Head**: t-eng-petal 3802db95 + t-eng-dr c3c7e658 (ENG-DR + BUILD-18's 1-8; 12 conflicts, each in 70048a22's message) + t-meter-1
  cfa9019a (d4287944). t-tools-2 was already inside t-eng-petal.
- **Petal arcs (opt-in by data)**: gen2/walkedSpan.ts `hopArcs` (a REQUIRED hop: a gap or a rise over a seam, a full jump reaches the
  next piece, no liana between; flown as the middle tier, TAKEOFF_MID 58 px before the edge or nearer where that falls short; its
  apex, ARC_AT) and petals.ts `arcPetals`, run in petalPass after walkPetals when `GraphBrief.petalArcs` is set (only 1-6). petalTrail
  then judges them like any petal. 1-6 also lays a petal row on every moss bank with no petal socket (w1Arc16.ts `rows`). 1-6: 0.22 ->
  0.98 petals an upright screen (band: 1-3 0.86, 1-5 1.04). 1-7 (0.44) and 1-8 (0.46) still read thin: turning `petalArcs` on is a
  data line each, then their lists and bots (not done here). Tests: gen2/petalArcs.test.ts; plants: reference/qa-reports/INT-10/planted.py.
- **The meter's anchor is FIXED layouts** (tools/difficulty/anchor11.ts, generated from rows 0-4 of the 1-1 list METER-1 calibrated on;
  score.ts plants it while it builds 1-1). A 1-1 relist no longer moves every stage's reading. Re-capture only on a ruling.
- **Band test**: w1Arc16.test's 1-6 meter test reads DIFFICULTY.md (§4 slot, G2 band, Easy at most 0.6 x Normal). 1-6 Easy: the snake on
  your vine and the creaky landing swing SHORT on Easy (Easy/Normal 0.63 -> 0.56; Normal 5.66 unchanged). Easy's meter is set by the
  swings in its 30 s peak window; root hops sit under the free bit (flattening rests moved it 0.01).
- **1-1**: relisted in order on this head (10 seeds' replays had moved after the t-eng-dr merge); first-run lock re-recorded (only
  collectibles, ENG-PETAL 7e9fe4d8 + f4896466; INT-10/firstrun-bisect.txt); calibration recommitted (every check's pass/fail unchanged).
- **Traps**: `seedlist --check` prints 20 lines at most: a first-run drift hid behind 20 replay lines. A planted-fault script that edits
  source must run in its own worktree while bots or lists run. The walked-span model leaves almost no span on 220-300 px hopped banks:
  density on a hop-heavy stage comes from arcs, not more sockets.
- **Arc petals are a bonus** (Collectible.arc; goals.ts goalCounts leaves them out, the lead's ruling 11:49 AM): counted, the child tier
  sealed 40/40 Normal doors (it flies under the apex). castBots 1-6 on it: 0 sealed, child N 38/40 (s23 risers rescue from the t-eng-dr
  merge, s34 gorge stair skill).
- **Closed by INT-10b (0zh) except the liana let-go + double arrival model.** Was open: gen2Pits.test:61 red on every 1-6 layout (joined soft-pit floors: the later stair flush on
  the earlier floor's end; root: lay joined floors as one piece); the whole suite UNRUN on this head (stopped by the lead); castBots 1-4
  UNRUN; 8-3's fills not re-pinned; the liana let-go + double arrival (walkedSpan.ts lianaTouchdown) NOT modelled.

## 0zf. METER-1 (t-meter-1, 11-14): the meter reads each ask from the game's own numbers (R-165.261)
- **tools/difficulty/score.ts now has a term for each ask 1-4, 1-6, 1-7 and 1-8 make** (DIFFICULTY.md §1's new rows): a liana release is
  `windowBits(the liana's period, its window)`, the window gen2's OWN (`releaseWindow`: physics pressWindow from the grip dial's holds, and
  on a liana with a dial or the last of a chain only the presses that SEE the perch, SWING_SEEN, as pipeline lianaRelease; chainWindow for a
  chain); the double's flights +1.32; a creaky perch +1 at the perch. `chainOf` flies a chain liana by liana where route.ts's added link
  leaps one, stepping only to a liana the chain catch reaches (levelCheck chainLines > 0): Worlds 2, 4 and 6 hang lianas in rows the
  route passes under, and without that check 4-4 read 47 swings for 30. `catchWindow`: the catch off a bank. `snakeChallenges`: vine snakes by their warn, false lianas a choice. `chaseChallenges`:
  one per stretch, the front a `span` threat (combine's overlap counts a span over its whole stretch). `rollingChallenges` (rolling.ts
  read by a guarded dynamic import: a tree without BUILD-18's rolling.ts builds no `st.rolling`). `watchChallenges`: a watcher's stretch.
  `podCrossing`: a pod's quiet less the route's time in its column.
- **Never price an unmeasured ask as the hardest**: a catch no running jump makes is listed `NOT MEASURED` with 0 bits; a release the
  engine flies no press for keeps OTHER_BITS.swing, named `NOT FLOWN`. On BUILD-16's 1-6: none of either; on the old hand-built 1-6: 12 catches.
- **The Z-beat skip is by words**: the meter skips beats.ts's chase pacing beats and fruit beats by their text ('the branch collapses behind
  him', 'a bouncing fruit') where the stage has a chase or rolling; if beats.ts rewords them, the meter's planted test on 1-8 goes red.
- **SCALE is unchanged (0.28194)**: 1-1 has none of these asks. Re-score any change with the stages before it in game order (novelty).
- **Traps:** the member lookup was 200 px from where a creature perches (1-7's eagles sit 202 px from their beat): `memberAt` reads the
  kit's ground first. A crossing longer than its quiet is split (the cheapest number of crossings), never one 6-bit press.
## 0ze. ENG-PETAL (t-eng-petal, 11-14, R-165.246, R-165.263, R-165.265): the one walked-path model; what the next engineer must know
- **The model** is src/game/gen2/walkedSpan.ts `walkedSpan` (lianas, asks AND plain jumps: set down by a full held jump off the piece
  behind, left no earlier than TAKEOFF_FAR = 131 px before the edge or the earliest take-off that still lands; seams walked; `away`
  pieces, a pit's floor or stair below its lower lip, a hurt floor, a catch, are never a way on or off). Its stage comes from
  pipeline.ts `walkedOf(laid)` in the lay and petals.ts `walkedStage(stage)` on a built stage (asks from walkedSpan.ts LAID_ASKS, which
  pipeline's laidAsks now reads). Three readers: fillSockets (a socket's petals on its OWN piece inside its span, none if every run does
  not walk it; a node's fixed count is given back), fillGaps (ledge trails inside spans only), walkPetals (the built-stage pass, at the
  gen2 build and in petalPass). Never move a petal onto another piece: 1-5's trap.hidden on every seed.
- **A LOW brief** (GraphBrief.petals 'low') gets no fill (petals.ts petalsLow; petalPass). jumpTrails' routeGaps finds no gap on gen2
  stages; the arcs on 1-6/1-7 were fillGaps' jump tier.
- **pitJoinWall** (pipeline.ts): a 24 px post at the earlier floor's end of every joined pair of soft-pit floors (face = double jump +
  PIT.face, top never over the lip). gen2/pitJoinWall.test.ts.
- **Tests**: gen2/walkedPath.test.ts A-E (D judges the PLAYED stage: generateStage, not libstage buildStage, which is the raw roll with
  no petalPass), gen2/pitJoinWall.test.ts, gen2/walkedSpan.test.ts (now reads walkedStage, the top piece under a petal). Plants:
  reference/qa-reports/ENG-PETAL/planted.py.
- **Lists**: 1-6 and 1-4 relisted on e10a86e2 (--check PASS); 1-2, 1-3, 1-5, 1-7 PASS; **1-1 FAILS** (seed 33616, replay differs):
  relist it with its tier calibration first thing (CI runs `seedlist.ts 1-1 --check`).
- **Not run tonight**: the whole suite (stopped at the 30-minute background limit), buildcheck alone after the cost fix, drawcheck,
  clipcheck.
- **Open**: 1-6 reads empty (0.22 petals an upright screen): more sockets on walked pieces (the lead's ruling). The liana let-go is
  under-modelled (the expert lands up to 150 px past it): the next engine step. REPORT: reference/qa-reports/ENG-PETAL/REPORT.md.
## 0ze. ENG-WATCH + ENG-WATCH2 (t-eng-watch, t-eng-watch2, 11-14/15, R-165.267 / .266): the watcher's red light, green light
Rewritten for ENG-WATCH2 (11-15). ENG-WATCH's REPORT (reference/qa-reports/ENG-WATCH/) and ENG-WATCH2's are the long form; this is what to keep.
- **Where it lives.** Every kit sweeper: src/game/predators/core.ts (`stepPredator` rest/hunt, `stepGlance`, `recheckAway`, `endPass`,
  `landed`); the dials are DATA:
  - `PredatorDef.glance` and `.passAt` (predators/types.ts; EAGLE in predators/world1.ts);
  - a stage's own `Post.glance` via `WatchRow.glance` and `w1Still(stage, lesson, own)` (gen2/worlds/w1Cast.ts);
  - 1-7's own dials: `WATCH_17` (w1Arc17.ts).
  - The art reads `s.gl` (sweepPose.ts); the flag stand-down is castPlay.ts `calm` (`re: false`).
- **The rules (each planted: reference/qa-reports/ENG-WATCH/plants.txt and ENG-WATCH2/plants.txt):**
  - **passAt 'far':** a pass starts from the end of its stretch farther from him, so the eye crosses TOWARD a walker. It is gated by data,
    never by kind (the lead 11-15). The caiman has no passAt, so its passes go there and back on its river's clock.
  - **The glance.** Away a rolled while, then a head-cock (its tell, tellOf), then a look. Moving in its view while it looks starts its
    dive's tell; a still sloth is not seen by a glance, even in the open.
    - Fake-outs: a share of turns after a FULL away (Glance.fake); never on Easy.
    - A perched one sees only within `reach` of its post.
  - **The re-check (Glance.recheck, REQUIRED).** After a look that saw nobody, and after every pass, the head comes round quickly. The
    re-check is always a real look, never a fake-out; the look after a re-check is followed by a full away. This is what catches
    "walk out the moment its head turns" (Matt 11-14).
  - **One act, one heart** (`landed`). Easy: away and re-check x easy.cool, the tell x easy.tell, no fake-outs, every first pass free on 1-7.
- **Tests:** eagleGlance.test.ts (unit + real engine: the walker, the instant sneaker over seeds 1-8, the bots' freeze toy);
  eagleKit.test.ts; predatorHabits/World1/Casts. A real-engine scenario is asserted over seeds with a rate, never one seed: a seeded
  rhythm's roll moves with any dial.
- **Tools:**
  - `tools/inspect/eagleProbe.ts --stage <id> --seed N --setting normal|easy --modes walk,back,stand,sneak,approach [--frames]`
    (`--frames` prints the head's phase, re-check, t/dur);
  - `tools/inspect/eagleClip.mjs` for clips;
  - `castBots.ts --stage 1-7 --seeds 1-40 --setting both --par 3` (~2-3 min);
  - METER-1's `tools/difficulty/botcross.ts` (on t-meter-1) for misses a minute.
- **Rulers.** METER-1's watch term reads only cover distance, warn and the kind's cool: neither the stage calm nor the glance (METER-2a).
  The calibrated tier bots freeze inside every tell and never lapse, so a glance costs them time, not hearts (METER-2b: an
  attention-lapse term fitted to people). Judge a watcher by the probes (walker, instant sneaker) and the first-timers.
- **Traps:**
  - A stage's rebuild of an enemy must carry every kit field (finish17 dropped kitGlance on the perched snag).
  - A glance holds a pass until its head turns away, so a test about the pass or the cool alone sets `glance: false`.
  - The calm has a 5 s floor (STILL_RULE).
  - 1-7's cover spacing is pinned by 1-7.md's phone rule (360 px Normal).
- **Open:**
  - The pit way-back under 1-7's lianas and its late pits (castBots rescues): ENG-PETAL.
  - A painted head-turn frame for the flying harpy (ENG-WATCH §5).
  - Integration onto t-int-10: 4 additive conflicts with 1-8's `passes` (ENG-WATCH2 REPORT, EXACT NEXT STEP).

## 0zd. ENG-16I (t-build-16, 11-14, R-165.246): the walked span's lists re-proved; what the next engineer must know
- **Lists.** seedlist --check on the walked span: 1-2, 1-3, 1-4, 1-5, 1-7 PASS as listed; 1-1 FAILED (seeds 28985, 31449, 25331 searched
  to new plans; 25331's breaks Easy room-for-help) and was relisted IN ORDER (`--merge order.json --in-order --count 200`: without
  --count it stops at SEED_LIST_MIN=100 and cuts the list): 161 of 162, variants 1-111 unmoved, so the first run (variant 10) and the
  calibration (1-40) stay. Its first-run lock re-recorded (only collectibles; the revert of 59a4c0dc's lay hunk gives the old hashes;
  the lead accepted it 9:00 PM). 1-6 relisted (53afa472).
- **The bot out of a pit past a crumbled creaky limb (firsttimer.ts pitWayUp / pitWayBack, `swungOn`, `catchAhead`).** Since pit floors
  join under a perch, the pit past the limb opens onto the pit before, and the walk back to the first liana beat BUILD-16c's catch ledge:
  three falls off the limb, a rescue. Now a ledge catching a liana further along the route than the one he last swung on (6+ of 24
  moments) wins, and a climb toward it is followed even heading forward. pitClimb.test.ts "crumbled creaky limb" (2 tests, 2 plants).
- **Left for the next engineer (castBots 1-6 on 9380bc5d, 10 rescued runs of 360):** the kid hanging at a liana's foot under a snake that
  comes DOWN is knocked off three times (snake-on-vine, s1/s20: let-go vx -294 vy 0); he grabs the FALSE liana again after it threw him
  (s14: no memory of a still liana); risers s32; gorge s2 "the way on is 104 px up"; Easy kid s18/s21, child s2; child/middle Normal s34.
- **The expert's sealed doors are the petal LAY, not the count** (reference/qa-reports/ENG-16I/bots/expert-petals-table.md): the walked
  span models only lianas and asks, its next-piece fallback reaches pit floors, and petalPass fillGaps adds ~45% of a stage's petals with
  no walked span, re-filling the pieces the span emptied. ENG-PETAL owns it.
- Traps: reference/qa-reports/*.ts is inside tsc (a scratch tool's loose type turned tsc red); a fill petal and a lay petal differ only
  by position (petalsource.mts tells them apart by building the stage twice: buildPlayStage, then RealPlay).

## 0zc. ENG-16H (t-build-16, 11-14, R-165.246): t-tools-2 merged; five rules for every stage; what the next engineer must know
- **The merge (8b8dc02a, origin/t-tools-2@5d0d33be = t-int-9 + TOOLS-1 + TOOLS-2).** Both sides deleted a hand-built World 1 stage (this
  branch 1-6's proto plan, R-165.238; t-int-9 1-7's, BUILD-17), so BOTH are gone: StagePlan/HAND_STAGES have neither, W1_ROOMS is
  ['1-4'] (stageSheets.test holds it to the stages that build rooms), the tests that walked a hand-built stage walk 1-9 (flowerReach,
  sectionTrack) and World 1's room dressing is held on a toy room (artDress.test). firsttimer.ts is this branch's + BUILD-17's shallow-pit
  face + POLISH-9's inputGrace; pitClimb.test.ts both sets. pipeline.ts's forward-end flight is on settingDials withSetting (TOOLS-2's rule:
  settingDials.test fails on any setTimedSwing outside it). calibration-main.jsonl was re-run on the merged bots and 1-1.
- **Soft-pit floors never end at a hole (pipeline.ts pitFloorJoin, pitHoleFill; a pass at the end of layStage, before the settle).** Under
  a perch laid between two liana pits (the creaky limb) or past a pit's lip up to the next bank (FAR's bough), the floor reaches the next
  earth (another floor within a hop, joined at the deeper; or a bank, deepened past it). Without it INT-9's settle threw every 1-6 roll
  ("the pool is spent": a stair stone over air) and INT-9's per-gap ruler refused every roll (drop.untyped / floor.unmarked). PIT_JOIN 400
  px. pitJoin.test.ts.
- **The walked-span petal lay (gen2/walkedSpan.ts; fillSockets' pickup).** Read off the BUILT pieces by the engine's flights: lo = the
  farthest the testers' let-go (FORWARD_END, top/middle/foot holds) or the route's ask (a full run's jump) sets him down; hi = the earliest
  x a held running hop catches the liana ahead (halved to 8 px) or a full jump still makes the ask's far piece. Under WALKED_MIN (24 px)
  the petals go on the next piece (the liana's landing). laidAsks(st) gives a built stage's asks to a check. walkedSpan.test.ts.
  ENG-16G's "b1 built 83-118 px against 280 in its data" did not reproduce: first-liana b1 is built 280 on seeds 1-3 Normal.
- **A vine snake never startles him off inside TELL_MIN (predators/core.ts, 0.5 s) of his catch** (vineSnakePiece.ts `held`). The false
  liana still startles on the catch (its tell, the still vine, shows before he takes it): the lead's call if that should wait too.
- **The bot on a liana steers to the side of its point past the swing (firsttimer.ts, pastLiana), never a stale way** (after the climb
  back up a pit's stair the way was back: let-go on the backswing into the same pit, 1-6 kid s14/s20/s21). pitClimb.test.ts.
- requiredMove.test.ts walks 1-2 (its mushroom chain needs the bounce), not the deleted hand-built 1-6.
- Traps: a 1-6 build takes ~27 s (lockall spends most of its time on 1-6 and 1-7); planted-faults.py edits the main tree while it runs:
  never commit while it runs. Plants: reference/qa-reports/ENG-16H/planted-faults.py (pit-join, walked-span, tell-min, stale-way).

Rewritten for FIX-21 (11-15, t-fix-21): section 0zf (the bounce alone until the combo is taught; the walking rider's handover; the safe river's over pass). Rewritten for BUILD-21 (11-15, t-build-21): section 0ze (2-1 built as designed; the knock; bots upstream + handed; the safe river's look). Rewritten for ENG-W2b (11-15, t-eng-w2b): section 0zd (the river as a gen2 section, the one carry rule, petals on logs). Rewritten for ENG-W2 (11-14, t-eng-w2): section 0zc (World 2 on gen2: the kit, w2Finish's rivers, riverLay). Rewritten for TOOLS-2 (11-14, t-tools-2): section 0zb (one helper for the setting's dials; the test link's cap and published copy). Rewritten for TOOLS-1 (11-14, t-tools-1): section 0za (a flight cache keyed by the setting's swing; the meter's swings; clipcheck's frame walk). Rewritten for INT-9 (11-14, t-int-9): section 0z (pit banks reach past the floor). Rewritten for ENG-S5 (11-14, t-eng-s5): section 0y (liana to liana). Rewritten for ENG-S4 (11-14, t-eng-s4): section 0x. Rewritten for ENG-S3 (11-14, t-eng-s3): section 0w. Rewritten for ENG-S2 (11-14, t-eng-s2): section 0v (the vine snake, the false liana, letGo). Rewritten for HOOKS (11-13, t-hooks): section 0t (the piece hook, the letter table). Rewritten for FIX-INT (11-13, t-int-5): section 0n (tonight's 3 unit reds). Rewritten for FIX-A (11-13, t-fixa): section 0l (Dot's card). Rewritten for INT-3 (11-13, t-int-3, the 0.9.8 integration): section 0m. Rewritten again at the end of R-165.112 (11-11): branch `t-engine-seedchunks`, rebased onto the passed t-int-1-1@874f11f6: each stage's proven list is
Merged for ENG-22 (11-15): METER-1's section is 0zd-m (it and ENG-W2b both took 0zd).
Rewritten for ENG-W2b (11-15, t-eng-w2b): section 0zd (the river as a gen2 section, the one carry rule, petals on logs). Rewritten for ENG-W2 (11-14, t-eng-w2): section 0zc (World 2 on gen2: the kit, w2Finish's rivers, riverLay). Rewritten for TOOLS-2 (11-14, t-tools-2): section 0zb (one helper for the setting's dials; the test link's cap and published copy). Rewritten for TOOLS-1 (11-14, t-tools-1): section 0za (a flight cache keyed by the setting's swing; the meter's swings; clipcheck's frame walk). Rewritten for INT-9 (11-14, t-int-9): section 0z (pit banks reach past the floor). Rewritten for ENG-S5 (11-14, t-eng-s5): section 0y (liana to liana). Rewritten for ENG-S4 (11-14, t-eng-s4): section 0x. Rewritten for ENG-S3 (11-14, t-eng-s3): section 0w. Rewritten for ENG-S2 (11-14, t-eng-s2): section 0v (the vine snake, the false liana, letGo). Rewritten for HOOKS (11-13, t-hooks): section 0t (the piece hook, the letter table). Rewritten for FIX-INT (11-13, t-int-5): section 0n (tonight's 3 unit reds). Rewritten for FIX-A (11-13, t-fixa): section 0l (Dot's card). Rewritten for INT-3 (11-13, t-int-3, the 0.9.8 integration): section 0m. Rewritten again at the end of R-165.112 (11-11): branch `t-engine-seedchunks`, rebased onto the passed t-int-1-1@874f11f6: each stage's proven list is
its own lazy chunk (section 0d). The lead's ruling, 11-11 5:18 PM ET: the stand-in is ACCEPTED (a failed list load plays 4106 by its
proven plan; Play is never blocked).

## 0zf. FIX-21 (t-fix-21, 11-15): the bounce alone until the combo is taught; a log hands a walking rider over; the safe river's over pass
- **The rule** (the lead's ruling 1:53 PM ET; commit 82743678, self-contained): `skills.ts COMBO_REQUIRED_FROM` ('bounce-air': null) +
  `comboGuaranteedAt` (the skillGuaranteedAt pattern). Until a stage teaches the bounce + air jump, `pipeline.ts bounceCap` holds a bounce
  lip to the bounce alone (judged: `reach.ts bounceLipOverCap(setting, stageId)` = the bounce-teach band's 180 less the cap; else 0.95 of
  `BOUNCE_ALONE`, ~181 over the cap) and `verdicts.ts classify(..., airTaught)` judges every bounce lip as 'bounce-teach'. The day a
  stage teaches the combo, its id goes in the table (and its teach is a design item: not built). Test: `src/game/gen2/bounceAlone.test.ts`.
  World 1's 1-6 and 1-9 lay such walls (237, ~226 px) on the integration line: they move with it (INT-10d cherry-picks it).
- **The log handover** (ec96fe0c, engine.ts drift loop): his own step past the river's end (p.vx this frame) hands him onto the bank as
  the log's carry does; before, he walked onto the log's hidden part (no floor, onFloor) and dropped into the water at the bank's foot.
  Test: `src/game/logHandover.test.ts`. (ec96fe0c also held a bot change, reverted: take only engine.ts + that test from it.)
- **The first-timer bots** never press after a bounce they ran onto (no jump of theirs in progress; bounceBack/hopOnto are the tiers').
  The lead ruled NOT to teach them (a combo no stage teaches): the stage is held to the bounce alone instead. Keep it that way until the
  combo's teach exists.
- **A safe river's over pass** (engine.ts drawRivers, over=true): `riverArt.ts drawSafeRiverOver`, a band of the shallow strip's own top
  rows (SAFE_OVER: 4 px above to 16 below the surface, 0.6), never the deep gradient to the screen's foot.
- **Backdrop joins**: `tools/art/stripjoin.py measure` finds a strip whose painting a border cuts (a hard panel edge in play); `feather`
  fixes it. w2mist-mid was 21.9% -> 0.1%. No gate runs it yet (a suggestion in FIX-21's REPORT).
- **Open, named**: a darker vertical band on 2-1's far bank body at x2300 (seed 2, world ~2708-2775): not the end piece, not the depth
  line (both A/B'd off), not the soil tile join; source not found (FIX-21 REPORT, Suggestions).
- **Trap**: a page probe of what draws a pixel must also force the ground squares to repaint (`e.platforms = e.platforms.slice()`) and
  hit-test the square canvases in WORLD coordinates (their transform is the world's); clips are not seen by such a probe.

## 0ze. 2-1 built as designed, and what it added to World 2's engine (BUILD-21, t-build-21, 11-15)
- **2-1** is `src/game/gen2/worlds/w2Arc21.ts` (kit 'w2-21' = w2World + withSwing + RIVERS_21 + its bricks; stageTable 2-1 -> 'w2-21';
  listed.ts KITS/WORLD/FINISH). Graph `A X R T Pg R Pw R Pr W R Pb L Pf R S E` (the five P beats told apart by content, 1-6's form; the
  R after X is V5's). 2-1's placeholder arc is gone from w2.ts W2_ARCS (2-2 keeps its own). finish21 lays the village at the gate (decor).
- **Design changes the lead approved** (written in the file's header): lianas lay each perch where the engine puts it (raised: from
  World 2 on the glide is guaranteed, jumpLinkGap, so a perch must lie past a glide) and the bank steps down after (R-165.274 is the
  engine fix: a liana a known glide also crosses may be optional). Beat 7's bounce is World 2's lily at 30 px (ruling C; the bamboo
  needs a re-cut). A 62 px pad stranded the first-timer bots: keep World 2's bounce pads at 30.
- **Easy** = every river its row's `...Easy` twin: `safe: true`, logs 20-30 px longer, same speed (slower breaks RIVER_LAY.beat 4 s).
- **The knock**: river.ts `logKnocks(d, t0, t1)` (the log's own cycle passing its start); engine.ts drift loop keeps `logClocks` by
  platform id and plays `sound.playLogKnock(easy)` when the lip it slides out from is within KNOCK_HEARD (160 px) of the view;
  sfxRec.ts `knock` -> the recorded 'log' thump at KNOCK_DB (-9 Normal, -3 Easy); RecCall gained `db`. Test: src/game/logKnock.test.ts.
- **The safe river's look**: riverArt.ts RIVER_LOOK.safe (ART-W2's w2-1115/w2-shallow), drawn for every `safe` river, its depth capped
  at the strip with SAFE_EARTH under it (the flat bed fill must never show). dropsOf records a safe river as `safe-water-art` (a
  SoftLook): before this, a safe LOG river failed drop.look-lies (the truth then: it was drawn as deep water).
- **w2Finish** finds a fall's banks up to LIP_RISE (170) under its higher lip: a raised liana perch had 'no bank at one end'.
- **Bots** (tools/inspect/firsttimer.ts SKILLS): `upstream` (off a back-running log's front end at once), `bankUp` (FIX-GATES: off a
  back-running log, the far bank's 28 px face in reach, he hops up; it reads as floor ahead, so no gap rule ran) and `handed` (a log
  running his way is ridden into the bank). Plants in tools/inspect/riverRide.test.ts: handed on the long-log toy (middle Normal 3 lives
  off vs 1 on); upstream and bankUp on 2-1 itself (castRun: adult N 12 / child N 23; child E 20 / 23), since FIX-21 9137470f no toy river
  drowns a bot without upstream. Trap: a plant that stops biting after a general fix: bisect it, then measure the skill off on the real
  stage before touching the toy (FIX-GATES spent 30 min on toys first).
- **Traps**: w2.ts `W2_PADS` and riverArt `drawPad` were added on t-eng-22 (ENG-22, stopped) to the same files: merge both. A W2 liana
  gap is a splash-back creek (soft), never deep. The old 2-1 seed list's packed plans name deleted bricks: the page cannot start 2-1 on
  any head that has the new kit and the old list (relist in the same commit).

## 0zd. The river as a gen2 section, the one carry rule, petals on logs (ENG-W2b, t-eng-w2b, 11-15)
- **Place `river`** (types.ts PlaceRule, the lead's sign-off 11:14 AM ET): `{ kind: 'river'; after; row }`. The far bank is `riverWidth(row)`
  past `after`, LEVEL (a stepped far bank is a later row field, never a hack in a brick). Rows come from `WorldManifest.rivers` through
  `LayLocalOptions.rivers` (layLocal never sees the manifest: pass `rivers: M.rivers` at every layLocal call). A row the world lacks, a
  mirrored section, a river in a leg laid LEFT, and a far bank right of nothing all throw by name (left legs: ENGINE-WORTHY, ready by 2-7).
- **The lay** (layStage, where the ropes hang, BEFORE checkAndRepair): `layRiver(row, near end, near top, () => pid++)`; logs go into
  `platforms` (type 'drift'), the zone into `Laid.rivers`, the stage takes `rivers` only when there are any (the lock of every other stage
  stays byte-identical: 102/102 unchanged at e45f857d). NOTHING is laid under a river gap (`LocalGap.river`: no pit, bough or stair; the
  zone takes the fall). Both stage shifts move the zone (x0/x1, surfaceY, safe.backX/backY) AND each log's DriftInfo (x0/x1, baseY): a
  platform shift alone leaves the logs drifting in the old window.
- **Judged:** checkStage adds `riverFaults(st)` as `river: ...` errors. dropsOf reads a fall inside a RiverZone first (deep: life, water-art;
  safe: putback to take-off, water-art) and never a 'drift' platform as a floor. The crossing's ask is `move: 'ride'`; judged11 skips it.
- **w2Finish** keeps gen2's log rivers (skips a fall a river covers; reeds at a log river's banks too; idempotent).
- **Verdicts (ENGINE-WORTHY 1, the lead's ruling 11-14):** floorlessGaps skips a gap laid AS water (fall kind 'water') or inside a river;
  drop.unwarned wants Dot's line at the FIRST water-art lethal drop only and no sign; a dark drop keeps both. 2-1/2-2 are now `judged`.
- **The one carry rule** (the lead's ruling 11:36 AM ET): engine.ts notes the platform under him before the carriers move; `carryVx` is its
  move this step; groundJump adds `carryVx * RIDE.keep.x`. Any carrier (drift, sway, ride piece; a lift has no sideways), any rider. A coyote
  jump (already off the log) keeps nothing. ride.ts jumpOff is still uncalled by the engine (the engine's rule is the groundJump line).
- **Petals on logs:** `RiverRow.petals` (n first logs, one each), `Collectible.rides {id, dx, dy}`; ridePickups.ts: the engine sets each
  rider after every carrier moves (`stepRiders`), refuses the pickup and skips the draw while its log is out of its window (`rideHidden`).
  fixPickups never re-seats a rider. The fill lays them after the petal arcs (`Laid.riverPetals`).
- **The petal brief:** `GraphBrief.petals: 'low' | 'few' | 'normal'`; 'few' holds everything 'low' does (no arcs) until the fill honours
  its count on ENG-PETAL's petalPass (the lead's ruling Q1 A). 2-1's brief says 'few'.
- **The bot:** firsttimer.ts `SKILLS.ride` (a toy switch), `hopLandsOn` (flown hop onto a float where it will be), `floatAt`; lifts
  ('moving') keep the old near rule. A river flowing BACK at him is still weak (child Easy 4 lives): the design's 'against the flow' skill.
- Traps: `RIDE.keep` is `as const` but mutable at runtime (carryRule.test sets and restores it). river.test's honest red ("2-1: 0 log
  rivers") turns green only when w2Arc21 lays its rivers by place `river`.

## 0zc. World 2 on gen2 (ENG-W2, t-eng-w2, 11-14): the kit, the rivers by world data, the river's one lay
- **World 2's kit is src/game/gen2/worlds/w2.ts** (`w2World`, stage-table kit 'w2'): art from the World 2 inventory (W2_ART, held in the
  inventory, usable and in scale by w2.test.ts), ground y 580 / banks 90 deep / style 'log' (World 2's painted earth bank: terrain.ts
  draws it as 'ground', as the hand-built 2-3 is drawn), a rock is a moss stone EXACTLY 50 px (the kit's painted boulder; 51-56 draws as
  a stone pillar). Its pit is 'soft': a section's `water: true` gap is a deep river, any other gap a splash-back river.
- **World 2's finish is w2Finish** (listed.ts `worldFinish`: every kit names its world's finish; World 1's kits keep w1Finish, so World 2
  never gets World 1's cut art or squirrels). It turns each built fall into a RiverZone (painted river, engine splash): soft -> `safe`
  (set back 70 px short of the edge, its pit bed taken out), water -> deep; reeds behind him on banks 200 px+. A fall with no bank at an
  end throws (never listed).
- **2-1 and 2-2 roll on PLACEHOLDER arcs** (`A T R P R X R M R S R L E`, w2Bricks per stage): the designed levels replace the bricks
  (w2Arc21.ts / w2Arc22.ts). Both are listed (100 proven seeds each), flown (flownArcs.ts normal-2-1 / normal-2-2) and in drawcheck.
  The hand-built 2-1 / 2-2 are deleted (W2_STAGES rows, their w2Sections builders, the ferry room, FLOWER_GOAL_22, their tests).
- **The river's one lay is src/game/gen2/riverLay.ts**: `layRiver(row, x0, bankY, nextId)` (RiverZone + drift logs on river.ts's clock)
  and `riverFaults(stage)` (spacing, hop, speed, the beat at the bank, boarding room, the next log in view). The hand-built 2-3..2-9 lay
  through it (lock: unchanged). World 2's rows are data, w2.ts W2_RIVERS. NOT yet: the gen2 place rule that lays a log river between
  two banks inside the pipeline (REPORT.md EXACT NEXT STEP).
- **Traps:** (1) `also: quietJudge` bans a slot's section and re-rolls: a stage whose arrival is quiet throws "no section fits node n1
  (start)" on most seeds (a pool of one arrival); put a hop within ~450 px of each brick's ends. (2) artuse.mjs counts a template literal
  as a dynamic name: the deleted ferry's `sluice${ri}` was the only "use" of W6's sluice-wheel art; it is now truly drawn (w6WheelArt.ts:
  a kit lever's `looks`, 6-7's water room, preloaded as 'w6-wheels'). (3) verdicts.test holds every flown row's `source` to a quote from
  reach.md §2 or chain.md §1: enter a stage's flown figures there first. (4) The
  game's finishStage lays petal arcs over every route gap, whatever the brief's `petals: 'low'` (1-7: 61 built, 105 played).

## 0zd-m. METER-1 (t-meter-1, 11-14): the meter reads each ask from the game's own numbers (R-165.261)
- **tools/difficulty/score.ts now has a term for each ask 1-4, 1-6, 1-7 and 1-8 make** (DIFFICULTY.md §1's new rows): a liana release is
  `windowBits(the liana's period, its window)`, the window gen2's OWN (`releaseWindow`: physics pressWindow from the grip dial's holds, and
  on a liana with a dial or the last of a chain only the presses that SEE the perch, SWING_SEEN, as pipeline lianaRelease; chainWindow for a
  chain); the double's flights +1.32; a creaky perch +1 at the perch. `chainOf` flies a chain liana by liana where route.ts's added link
  leaps one, stepping only to a liana the chain catch reaches (levelCheck chainLines > 0): Worlds 2, 4 and 6 hang lianas in rows the
  route passes under, and without that check 4-4 read 47 swings for 30. `catchWindow`: the catch off a bank. `snakeChallenges`: vine snakes by their warn, false lianas a choice. `chaseChallenges`:
  one per stretch, the front a `span` threat (combine's overlap counts a span over its whole stretch). `rollingChallenges` (rolling.ts
  read by a guarded dynamic import: a tree without BUILD-18's rolling.ts builds no `st.rolling`). `watchChallenges`: a watcher's stretch.
  `podCrossing`: a pod's quiet less the route's time in its column.
- **Never price an unmeasured ask as the hardest**: a catch no running jump makes is listed `NOT MEASURED` with 0 bits; a release the
  engine flies no press for keeps OTHER_BITS.swing, named `NOT FLOWN`. On BUILD-16's 1-6: none of either; on the old hand-built 1-6: 12 catches.
- **The Z-beat skip is by words**: the meter skips beats.ts's chase pacing beats and fruit beats by their text ('the branch collapses behind
  him', 'a bouncing fruit') where the stage has a chase or rolling; if beats.ts rewords them, the meter's planted test on 1-8 goes red.
- **SCALE is unchanged (0.28194)**: 1-1 has none of these asks. Re-score any change with the stages before it in game order (novelty).
- **Traps:** the member lookup was 200 px from where a creature perches (1-7's eagles sit 202 px from their beat): `memberAt` reads the
  kit's ground first. A crossing longer than its quiet is split (the cheapest number of crossings), never one 6-bit press.

## 0zb. TOOLS-2 (t-tools-2, 11-14): the setting's dials in one helper; the test link's file cap and published copy
- **Every per-setting engine dial is set by ONE helper, src/game/settingDials.ts** (R-165.251): `applySetting(d)` (the engine, at a
  stage's start, kept for the run), `withSetting(d, fn)` (dials put back after), `dialsKey()` (for caches). Today the one build-time dial
  is the swing (physics TIMED via setTimedSwing). Swept: difficulty()/runDifficulty() are the player's choice (Engine/InputEngine
  constructors, build-ahead, menus); forgive, tide, soft pits, input.easy, the help ladder are the engine's own fields. A new dial goes
  in settingDials.ts only: settingDials.test.ts fails on any setTimedSwing call outside it (tests excepted).
- **Every build entry builds on its own setting's dials, whoever calls it**: generateStage, buildGen2Stage, easyStage (withSetting);
  the pipeline's lianaRelease/chainRelease, levelCheck validateAsJudged (a gen2 stage on its own setting) and listRules helpRoomBreaches
  too. So lockall, seedlist and every tool's Easy is the phone's, and the map's build-ahead no longer builds on whatever the last run left.
  On the engine path it is a no-op (the engine set them already): lock on t-tools-2, Normal 102/102 unchanged; Easy equals a FRESH
  phone's Easy on 102/102 (16 layouts); the 21 Easy stages today's tools had wrong: 3-8, 4-4, 5-4, 6-1, 6-3, 6-6, 6-7, 6-8, 7-5, 7-9,
  8-3, 8-4, 8-5, 9-3, 9-4, 9-5, 9-9, 10-1, 10-3, 10-6, 10-7. World 1's lists (1-1..1-5, 1-7): 1424 builds identical either way.
- **stageGenerator's layout-pick caches are keyed by dialsKey** (`variantAttempt`, `known`): validateStage flies lianas on the dials, so
  a process that built Normal first handed Normal's pick to Easy (base: 9-3 layouts 4/14, 9-4 12, 10-6 1/6/10). TRAP (R-165.244 again):
  any cache of an answer the dials change puts dialsKey in its key.
- **Every gen2 lay and check on its own setting's dials** (R-165.258): buildRolled and applyVerdicts run on their request's setting;
  inside an Easy build, Normal's plan, verdicts and rule on Normal's; inside Normal's search, the Easy lay check and Easy's rule on Easy's.
  It had all run on the caller's dials, so a phone's Easy re-planned Normal on Easy's swing: 8-5's Easy lost its only tayra. Lock:
  Normal 102/102 unchanged; Easy moves on 6-1 6-3 6-6 6-7 7-5 7-9 8-3 8-5 (each now lays Normal's plan); World 1 lists unchanged.
  Gate: settingDials.test.ts R-165.258 (8-5 red before). Left: 6-3/4 and 6-7/3, 8, 9 drop their only frog on Easy (not the swing).
- **The test link** (R-165.252, tools/testlink/build.py): exits 1 with no map above 480 files (prints the count); maps against
  tools/testlink/dist-published, which only `build.py --published` refreshes, run after a successful publish. Gate: tools/testlink/build.test.ts.

## 0za. TOOLS-1 (t-tools-1, 11-14): three tool faults; one was the engine's
- **Every cache of a flight off a liana is keyed by the setting's swing** (levelCheck.ts `swingSettingKey`: TIMED's period, grab
  reach and sweet spot, which physics `setTimedSwing` changes per setting). `FLIGHTS` (swingLandingsIn) was keyed by geometry alone,
  so in one process a Normal build's liana landings were handed to the Easy build of the same seed (and back): castBots' "state leak"
  (R-165.244) was this, not the bots. Gate: src/game/flightSetting.test.ts (Easy after Normal equals Easy alone in a fresh process).
  TRAP: any new cache of an answer that reads TIMED (or anything setDifficulty changes) puts that in its key; chainLines and
  heldCached already did. Lock on t-int-9: 102/102 unchanged (lockall never sets TIMED, so it cannot see this class; see the next line).
- **The tools build Easy with Normal's swing**: seedlist.ts, lockall.ts and every direct generateStage/buildGen2Stage caller never call
  setTimedSwing; only the engine does (engine.ts, before generateStage). Their Easy liana checks read Normal's TIMED. Not fixed here
  (a packet for the lead: REPORT, Suggestions).
- **The meter** (tools/difficulty/score.ts `swingChallenges`): one swing a liana, at its release; the grab off a bank is not a second
  challenge; a miss costs what the ground under the swing costs (costAt with the jump inspector's pit rule). Gate: tools/difficulty/score.test.ts.
- **clipcheck "Dot's first tip"** walks by game frames on the development build (pressFrame), taps a card that waits, judges once the
  Skip is armed. CLIPCHECK_STEPS / CLIPCHECK_CPU / CLIPCHECK_SHOTS run and stress one step on its own.
## 0CL. The chase stage's blockers (ENG-CL, t-eng-cl from t-eng-b6@a4e1ff8f, 11-14): what the next engineer must know
- The quiet line (tools/engine/listRules.ts) judges a roll AS PLAYED: quietJudge(cfg, finish?, max?) / quietOf(cfg, st, finish?), the
  finish being src/game/gen2/listed.ts playFinish(row, st, d) (World 1's w1Finish, then the row's kit FINISH), the ONE definition Play
  (stageGenerator.ts) also calls. findBeats (tools/inspect/beats.ts) counts stage.chase stretches and each stage.rolling hazard where
  it meets him (rolling.ts rollMeetX). helpRoomBreaches does NOT yet use playFinish (seedlist.ts passes w1Finish for squirrel rows
  only): REPORT §4 HELP-FINISH.
- The search's judge (BuildRequest.also) is handed pipeline.ts asLaid(st): a copy with its chase and hazards laid (stage + its
  sections' pieces structuredClone'd together; layChase cuts by platform identity). Never hand a judge the pre-chase roll.
- A chase stage's hazards: the 'roll' socket role {roll, on, t} (gen2/types.ts), laid after the chase and before the verdicts by
  pipeline.ts layChaseStage -> gen2/rollLay.ts rollsOf, pace/arc from WorldManifest.rolls (World 1 W1_ROLL). No roll socket on the
  stage + a look = by the chase's own ground (layRolling: per STAGE, not per K). Faults are roll errors 'rolling: ...'.
- The tip and the still fork's ground: gen2/chaseTip.ts layTip(st, look) (W1_TIP; liana.runner picks runnerProblems or the new
  runnerLiana.ts lianaProblems) and readyStillFork(st, fork, look) for any fork; layStillFork moves a fork flag off its 14 px post
  window itself (inside the flag span) or refuses by name.
- runnerLip = the HIGHEST ground end in reach, then the nearest (a pit's stair step is never the lip). A ledge floating over the run
  in reach would read as the lip: no lay puts one there.
- Easy: rollTeaches(spec, chase, easy) is always a bump (any stage).
- Traps: the dev fixture's stepped 1-1 ground gives no runner's run (243-562 px to the lip, 1,188 needed): its tip liana is plain on
  purpose. The look (bough over mist, the knot, the 3-5 piece fall) is NOT built: REPORT §5 has the exact next step and the lead's
  three conditions; the long-branch sheet has no underside piece.

## 0DR. The list runs each row's own finish; any inventory piece placed as dressing (ENG-DR, t-eng-dr from t-build-18@e9dc28bf, 11-14)
- THE LIST'S FINISH (tools/engine/listRules.ts). Every list rule judges the roll as Play finishes it: the row's WHOLE finish (listed.ts
  `playFinish`: World 1's, its squirrels when the row says, then the kit's own: finish14, finish17, finish18), on each setting, on a
  copy. `listJudge` is the search's one judge (seedlist.ts and yield.ts --list): a finish that throws is a line with no slot (the search
  rolls again), then the quiet line on Normal. `asPlayedBreaches` is `seedlist --check`'s: each listed seed built AS PLAY BUILDS IT
  (seedList.ts `buildPlayStage`, then `playFinish`, the two calls stageGenerator.ts:2921 makes) and finished once; a throw refused by
  name ("the finish throws (easy): ..."), then the quiet line, room for help and the dressing rows on that one finished copy.
  `helpRoomBreaches(st, d, finish)` passes the setting to the finish now. Never judge a list rule with `w1Finish` alone again
  (seedlist.test.ts test 7 greps both tools for it).
- Trap: Play runs the finish with NO catch. A listed seed is safe because `--check` runs it; an OFF-list play (no list yet, or a list
  that failed to load and no stand-in: only 1-1 has one) walks provenGen2Stage, whose "clean" does not include the finish. Before
  BUILD-18 listed 1-8 (e9dc28bf), Play's 1-8 threw on Normal at every layout 1-8 (finish18's K2 runner liana) and on layout 2 Easy
  (still fork 3). Ready packet S1 in reference/qa-reports/ENG-DR/REPORT.md.
- DRESSING BY INVENTORY ID (src/game/art/invDress.ts). A stage's data writes `proto.invDress: InvDress[]` = { inv (the catalog id
  EXACTLY, e.g. 'hf18/hf18-palm-crown'), x (its middle), y (its top when hung, its foot when standing), hang, layer: 'behind' }. No
  size in data: drawn `pokey_scale` x the inventory's pokey_units (89.1 = heroSprite HERO_UNITS x HERO_SPRITE_SCALE, D41) tall, its width
  by its picture's shape; a catalog frame 'name (x,y wxh)' draws its rect. `invDressBreaches(rows, inv, world)` is the gate: an id the
  world's file lacks, a made thing in World 1, a piece waiting on a fix, scale_ok false (R-165.107), no fixed size (pokey_scale null), a
  frame with no rect, a picture the build does not ship, a layer not offered. Run by src/game/art/invDress.test.ts (planted rows; every
  listed stage as Play builds it, layouts 1-2, both settings; the one file that writes rows) and by `seedlist --check` per listed seed.
- Pictures: src/game/art/invDressArt.ts lists the build FOLDERS a piece may come from, each a `new URL(\`../../assets/<dir>/${n}\`,
  import.meta.url)` pattern (the bundler ships that folder; Node resolves a file URL, so tests and tools run the same code). A new art
  folder is one line there; the build's 4 MiB and artcheck's 4096 px gates then judge everything in that folder. Not import.meta.glob:
  tsx does not run it.
- Drawing: stageReady.ts readyBuiltStage awaits `readyInvDress(rows, world)` before the first frame (it loads the world's inventory
  JSON, resolves each id once, asks for each picture through atlasLoader trackAtlas, so the wait under the title card holds them).
  engine.ts calls `drawInvDress(..., 'behind')` once, just before renderWorldObjects (behind the platforms, vines, pickups and Pokey): one
  drawSheet per piece in view, one Map get a row, no allocation. A stage made without stageReady asks on its first draw and draws a
  moment later. The world's inventory JSON (w1.json 202 KB) is fetched once a world, only by a stage that has rows.
- 1-8 (BUILD-18's data, w1Arc18.ts DRESS_18, its file, never edited here): a palm STANDING behind the branch at every nut's drop
  (its crown picture has a trunk stub, so hung by its top it dangled: D16) and a cannonball trunk at every fruit's, by catalog id, no
  size. Its local InvDress matches art/invDress.ts field for field.

## 0z. INT-9 (link #3, t-int-9, 11-14): a bank beside a pit reaches past its floor in every world; the two 0v-0y lines
- Sections 0v-0y appear TWICE below: ENG-S2..S5 (snake, chains) and ENG-E1..BUILD-17b (1-7) were written on separate branches and
  merged together by INT-9; both sets are true. Read each by its title, not its letter.
- pipeline.ts pitUnder `deepen`: every bank beside a pit is filled down to the floor + bankH (World 9's rule, every world). The old 48 px
  exception left a 0-48 px slot under a bank's foot, and a stair stone laid flush against that bank was judged drawn past its ground's
  lip (w1CutArt.ts groundRun: a bank is the run's wall only 3+ px past the floor), so the settle (R-165.226) swapped the section away:
  1-7 threw "the pool is spent" on 5 of 8 seeds. Gate: gen2Pits.test.ts 'any slot'. Lock: 1-3 and 17 older-world stages moved
  platforms only (bank heights). Never fix such a red by easing groundRun's wall test: that reading is POLISH-6's rule.
- Trap: a merge can make a stage unrollable with every file clean. Roll each listed stage (libstage --seeds 8) right after a merge,
  before the long gates; bisect by merging two branches alone in a scratch worktree.

## 0zb. The height-aware swing clearance, its lay rule, a parked frame, petals on the walked path (ENG-16G, t-build-16, 11-14, R-165.246): what the next engineer must know
- **physics.ts swingClearance is height by height now** (the lead's ruling (b), 4:42 PM ET): for each vine as the one he hangs on, the
  deepest hold (SWING.minLen to its foot) whose body (SWING_CLEAR.body above and below the hold) still meets the other's rope; its sweep
  there plus the other rope's sweep where his body is, plus body + margin, against how far apart they hang. Infinity when no depth meets.
  It reads EXACTLY as the old foot-to-foot measure for two vines of one top and one length, and is never stricter (a pair the old one
  passed still passes). swingSetup's sizing ((dx - body - margin) / 2) is unchanged on purpose: swinging pairs keep their swings.
- **pipeline.ts clearSwings (layLocal, every world)**: after each hanging piece is laid, any pair (one swinging) under 0 moves the
  stiller vine (less foot sweep; on a tie the new one) straight away from the other by the deficit; it moves only a liana hung past a
  ledge (place 'swing', not caught off another liana) that nothing else is laid from, never back over that ledge; else the section
  THROWS (the roll is never listed). Climbing vines count as still. 1-6's false liana is laid still (stillOne amp 0: a number, so no
  roll is taken and every other roll is the same) so the lay measures it as it hangs; it moved 43-63 px toward its bank on rolls 1-3.
  Planted: src/game/swingClearance.test.ts; reference/qa-reports/ENG-16G/planted-faults.py (3/3 CAUGHT).
- **Parking a frame:** tools/art/w6to10/park.py takes a props-made frame out of the shipped sheet (repacked with geminicut.pack, saved
  as propcut.py saves), keeps it losslessly in src/game/art/parked/ (under src/ for the inventory test, never imported so it never
  ships; outside src/assets, which artuse.mjs counts), and its catalog row says "parked". Then `python3 tools/art/catalog_master.py
  --emit`. Never an allow-list entry.
- **Petals on a landing perch:** check where the bots STAND (ENG-16G/petals/onperch.ts: per bot the t he lands at and leaves) before
  placing; the pickup reach is 46 px from his hips (engine.ts:3219, distance2D(p.x, p.y - 20, ...)). A leap often clears a short
  perch entirely (1-6 first-liana b1: no bot stood on it on seeds 1 and 3). **Trap:** a socket's `t` is clamped 20 px inside its BUILT
  piece (pipeline.ts:3212); 1-6's first-liana b1 is built ~83-118 px wide, not its 280 in the data, so b1@0.99 landed back at 0.76-0.83.
  Check a moved petal in the built stage (ENG-16G/petals/pet.ts), never from the socket's t. Run 40 seeds, not 6, before calling a door fixed.

## 0za. The bots' harness, the liana let-go, the old 1-6 gone (ENG-16F, t-build-16, 11-14, R-165.246 / R-165.238): what the next engineer must know
- **realPlay.ts FakeInput counts fresh inputs** (`moves`, as inputEngine.ts fresh(): a press, a punch/kick, a new direction, down/up
  changing, a hold or still finger put down). The engine ends its 0.35 s steer pause after a put-back or respawn at the first one
  (engine.ts inputGrace/graceMoves). Before, the harness had no `moves`, so the pause always ran in full and a bot's hop inside it went
  straight up (1-6 kid s1 at the chain). Planted: `src/game/graceFresh.test.ts`. It moves 1-1's tier replays, so
  `reference/qa-reports/R-165.59/calibration-main.jsonl` was re-run and recommitted (every check keeps its pass/fail; ENG-16F/cal/). **Any
  harness change: run tierBots.test.ts; if test 7 is red, recalibrate (BOTS.md) in the same change.**
- **firsttimer.ts on a liana:** the 7 s let-go waits until the swing carries him out in front (a still liana 7 s as before, nothing past
  14 s); the steer is `pastLiana` (the first route point past where the route crosses THIS liana, never a point on its own swing: the
  cut liana's foot turned him back at gl1); `pitWayUp` climbs to the stair step that catches the liana most often (not the nearest); `pitWayBack` takes no swinging liana's foot for a ledge. A tier bot's lifting thumb holds his stopped-at-a-face count on every stage (it was cast stages only: P13).
  Planted: pitClimb.test.ts tests 7-11 (toy stages; 9 and 10 use 1-6 seeds' real pit numbers). The face count moved 1-1: recalibrated again (cal2/).
- **The old hand-built 1-6 is deleted** (protoStage 'proto' plan, its pieces, w1Sections '1-6', 8 hint.1-6 lines, W1_ROOMS '1-6').
  buildProtoStage now needs its plan; a plan HAND_STAGES does not hold still falls through to the general builder silently (F3 in
  ENG-16F/retire-old-16.md: make it throw, test first). Liana-control tests (vineFollowUps, vineFlickMirror) now run on the NEW 1-6's
  first liana.
- **Trace a bot's rescue by frame before calling it a stage fault.** where.ts (BUILD-16d) caps runs at 360 s, castBots at 1200: a slow
  tier reads "time" in where.ts but passes in castBots. Use castBots for pass/fail, where.ts and FT_FRAMES only to locate.
- Open (ENG-16F REPORT, EXACT NEXT STEP): the height-aware swingClearance + lay rule (lead ruling (b), 4:42 PM); the sealed doors
  (child s1/s2, middle s1, expert s1/s2/s3/s5; no rescues left); artUse's W6 seesaw-b.

## 0z. The late press, the testers' let-go, the fill's path (ENG-16E, t-build-16, 11-14, R-165.246): what the next engineer must know
- engine.ts keeps the sweet spot's last moment (`sweetSnap`) WITH the vine's `amp`: a press a beat late leaps from it (RELEASE.late,
  timedLaunch reads `s.amp`). Without it a late press off any liana narrowed by a neighbour (a chain's, swingSetup's) leapt as off the
  full 0.45 swing, a third short (vx 426 vs 520): 1-6's chain deaths (BUILD-16d E1). `src/game/swingLate.test.ts` drives the REAL engine
  (RealPlay.bare) and compares the leap with timedLaunch on the snapshot: a gate must call the same code the screen calls (D19).
- physics.ts `FORWARD_END` (0.75, the testers' moment, = the first-timer's LET_GO_AT, a test holds them equal) and `forwardEndLands(A,
  hits, grips)`: the engine's press at that share of the swing out, every hold, the jump held. pipeline `lianaBand` lays a perch laid by
  what he SEES (a grip dial, or a chain's last liana `held`) only where it lands his middle LAND_IN (16 px) inside; dial-free lianas
  (Worlds 6-8, World 1's LONG) are laid as before. The amp floor for a chain's last liana is NOT possible under ENG-S5's view rule
  (2 x 183 + 50 > SWING_SEEN 414): don't try it again.
- petals.ts fillGaps never picks a trail off the walked path: `fallSpans` (gen2 `falls` + `heartFalls`, each with its LOWER lip) and
  `offPath` (hurt floor, catch, fragile, a floor or step inside a fall below its lower lip); a jump trail resting on one, a climb whose
  foot is in a pit, a spot inside a fall below its lip. Judged at PICK time (RESTS WeakMap), so the layout's random draws are unchanged
  and a stage whose fill never picked one lays exactly as before (lockall: only 1-1, 1-3, 1-6, 7-9, 8-1, 8-3, 8-5, 8-6 moved).
  Hand-built stages (no gen2) carry no falls: only the pieces' own marks guard them. `src/game/petalFill.test.ts` (toy stages).
- OPEN (1-6 lay, not the engine): a creaky take-off over a soft pit whose stair leads back up to it strands him for ~30 s (regrow.ts:
  off screen, 30-35 s); the gorge's gb1 -> gl2 (castBots d2 loops). A lay check could refuse it in every world (the lead's call).

## 0y. Liana to liana: chains (ENG-S5, 1-6 beat 4 "The chain", t-eng-s5, 11-14): what the next engineer must know
- ONE measure, the engine's press: physics.ts `chainWindow(A, B, flights, grips, seen)` = pressWindow on A hitting canGrabSwing on B at
  B's own phase (the stage's: swingSetup puts a chain's next liana `chainPhase` ahead). gen2 `chainRelease` (pipeline.ts, beside
  lianaRelease) sizes the lay: this setting's swing (setTimedSwing), LETGO_FLIGHTS (the double counted, as lianaRelease), A's grip
  dial holds, and a press counts only with B's WHOLE swing (B.x + its foot's reach) within SWING_SEEN of him as he presses.
- The walk (levelCheck 3a): on a gen2-built stage only (the `gen2Built` gate, as roofedDrop), each chain pair (isChain) whose
  `chainLines` (the same press, the stage's double rule) is 6+ lines becomes vine nodes: ledge -> A (lianaCaught, the plain catch),
  A -> B, B -> platform (`heldLandings`: pressWindow from his holds, no ledge catch). Old-generator stages are NOT given it: 14 of them
  (1-6, 2-1, 2-3, 2-4, 2-7, 3-1..3-3, 3-5..3-9, 4-4) hang lianas within a chain's reach and their pickups and flags moved (lockall).
- gen2: a `swing` whose `after` is a liana is a chain liana: `top` over the chain's FIRST ledge, its anchor at `share` of the band of
  spacings (160..CHAIN.dx, 20 px steps, first contiguous run) where chainRelease >= LIANA.window and chainLines >= 6; both lianas keep
  `chainAmp` (half the clear space each, swingSetup's rule; the earlier liana's amp is NARROWED in place and the link before it re-flown)
  and at least VINE.amp / 2 each. A `land` after a chain liana lays from the chain's first ledge, links by heldLandings, and its window
  counts only presses that see the WHOLE perch (lianaRelease `held`, as a dialled liana's: the press link has no ~370 px cap, so without
  it the perch lay past the view). `hurt` on the land: Normal the hurt hollow (no steps out), Easy the soft pit with its stair back.
- Rows: w1Swing.ts `w1Chain`, `w1ChainSection(id, gaps, difficulty, perchW)`, `W1_CHAIN_SECTIONS` (chain2: SHORT, LONG; chain3: SHORT,
  SHORT, LONG). Ends are moss-stone BANKS (w1Pits paints a thorn hollow only between banks that reach its floor; off 24 px boughs it
  found no lips). The perch is narrow (120-140, FAR's) so it keeps LONG's distance in view. The kit lists them with withSwing and World
  1's hurt floor row (THORN_ROW). Laid (lay.out.txt): dx 244-260 px, amps 0.24-0.26, perch 288-336 px past the last liana (Easy 255-284).
- OPEN: on 1 roll in 4 the LONG perch lands where the top hold still flies it (shareFor's tempo scaling); a `topShort` rule on land (the
  band's near end where gripsOf('high') gives 0) would make every roll a true "slide down" LONG.
- The swing camera (cameraFollow.ts landingAhead, upright `whole`): a liana ahead that swings is led with `lianaBox` (its anchor to its
  foot's far side), so chainRelease's view rule is what he sees. Climb carries `swingAmp` (optional). And on a swing a landing ACROSS the
  gap beats the floor of the drop under him (`under`), however near that floor scores: over a hurt hollow the floor (160 px down, from
  his anchor on) out-scored the chain's last perch and the view never led to it as he pressed (ENG-S5's upright still). Ground: as before.
- A swing over a hollow that hurts (pit 'hurt'): engine.ts sets camFocus = cameraFollow.ts `hurtFocus` (his head down to the floor +
  HURT_SHOW) when no piece asked for one, so focusY keeps the thorn bed in the view's lower part, him whole first (sideways the swing
  view's foot sat at the lip: the lead's 11:38 check). The hurt floors are listed once per platform array (hurtOf).
- A floor that carries `floorArt` is a special look to w1Pits (no thorn bed baked): only hurtLooks rows set it; never set it by hand.
- Shoot: reference/qa-reports/ENG-S5/shoot.mjs (lays the row with gen2 on the page and sets it into 1-6's start; the engine's start-time
  lists drawnVines / plainVines / swingVines / drawPlats must be refreshed after any runtime edit, or the new lianas are not drawn;
  input goes through key events: a write to input.state.jumpPressed is cleared by the press buffer).

## 0x. The level's top in the snake verdict, the snake lay, a liana's length (ENG-S4, t-eng-s4, 11-14): what the next engineer must know
- The view the verdicts judge is the engine's: cameraFollow.ts `usualZoom` IS applyZoom's base zoom (engine.ts calls it), and
  `settledView(w, h, levelH, widen)` gives the view's height, the HUD band in world px and the least/most the view's top may be (a
  normal stage never shows past its top; upright a widened swing may show sky over a level shorter than the view). snakeCam.test.ts
  pins it to the real engine at rest (520 / 900 / 1600 px levels, every phone). Change applyZoom's floors or the clamp: change these too.
- snakeViewFaults(sn, len, phases, site, phones): site = { anchorY, levelH } (snakeFaults passes Vine.topY and the stage's height);
  phones default VIEW_PHONES (782x288 sideways; 320x782, 390x844, 412x915 upright, each at no widening, SWING_CAM.out and where sky first
  shows). Two rules: seen SNAKE.seen before his hands; the whole tell wherever the focus box fits the clear view's height.
- What it means for a lay (depth-table.md): a snake from the bough needs its anchor >= 270 px under the level's top and a 6 s+ trip
  (down-off; 7 s down-back) on a 410/420 liana; risers lay anywhere. Every liana laid today hangs 74-222 px down: none can carry one.
- gen2/snakeLay.ts laySnakes: a stage finish (listed.ts FINISH, finish14's pattern) by section template + liana key (brief tagged),
  throws on snakeFaults. NODE letter n (key later; dials route incl. still = false liana). Brown catalog rows: a rows file
  (reference/art/catalog-rows-eng-s4.csv), appended to the master after t-art-678b's rows at integration.
- The swing rule takes `len` (rolled only when set: no shipped roll moves); w1Liana's 4th argument.
- OPEN: the false liana's drawn length (chains: done in 0y, ENG-S5) (its liana's length: 410 px draws 4.6x Pokey).
- Shoot: reference/qa-reports/ENG-S4/shoot.mjs (LOWER=<px> hangs the liana lower at runtime, TRIP=<s>, CLIP=1; labels print the
  level's top, view top, band, clear view, widening, the verdict on that phone, lives lost). Never edit src/ while it runs (vite reloads).

## 0w. The camera's focus and the false liana's landing (ENG-S3, CAM-THREAT, t-eng-s3, 11-14; STOPPED by the lead, gates UNRUN)
- PieceHost.focus(box): one step's request (engine clears camFocus before stepPieces); updateCamera applies cameraFollow.ts focusY after
  the HUD hold; steps capped at CAM_RISE_STEP while focused, never losing him. The vine snake asks FOCUS_CAM.lead (1.2 s) before its tell
  (clock read ahead), box = vineSnake.ts snakeFocusBox. gen2 verdict snakeViewFaults / snakeFaults share focusY + the box.
- OPEN, real page: on 6-3 the liana hangs 124 px under the level's top; sideways the view stops at the level's top, so the tell can never
  be under the HUD (0/6). The verdict must take the level's top into account (REPORT EXACT NEXT STEP 1). Unit tests used a roomy bare world.
- False liana: flung away (FALSE_LIANA.fling), slither starts clear of him (slitherClear), at its hanging scale (slitherSize); near it the
  view keeps its foot in. levelCheck skips false lianas (filter unproven by a test: M9 stayed green).
- WORLD_VIEW_H and ZOOM_RANGE now live in cameraFollow.ts; VINE_HANG in heroVineData.ts (heroVine re-exports).

## 0v. The vine snake, the false liana and the host's let-go (ENG-S2, 1-6.md NEW 2+3, t-eng-s2, 11-14): what the next engineer must know
- DATA: a liana carries one snake on `Vine.snake` (types.ts, lead ruling 11-14, the Platform.ride precedent): `{ route, clock?, shift?,
  reach? }` (vineSnake.ts). Routes: 'down-off', 'down-back' (turns at `reach`), 'up' (from the foot to `reach` and back off the foot):
  each keeps a beat on the stage's ONE clock (stage.clocks; beat.ts beatDef: off, warn = THE TELL, on = the trip); snakeBeatFaults
  refuses a tell under 0.5 s (SNAKE.tell, PREDATORS §2) or none. 'still' = a FALSE liana: the snake IS the vine (swingAmp 0), no clock.
- RUNS: pieces/vineSnakePiece.ts on the piece hook (PIECE_KINDS after RIDE). It reads the liana from stage.vines (the engine's own
  objects; engine.ts writes swingAngle before pieces step). Touch = any of its body within SNAKE.touch (10 px) of his HANDS (swingLength
  - VINE_HANG, handsAlong) while it TRAVELS; the tell never touches (its body is off the vine by construction). It never hurts: no hurts().
- LET-GO: PieceHost.letGo() (lead ruling 11-14, stagePiece.types.ts; engine letGoOfLiana; physics LET_GO hop -220, keep 0.3 of vx,
  cooldown 0.5): off the liana with a hop, jumps 2, swungOff = that liana (not caught again until he is down). Returns false off a liana.
- FALSE LIANA: caught by the engine like any liana; next step it startles: letGo, `v.off = true`, it falls (FALSE_LIANA.fall) onto the
  highest platform under it, slithers off AWAY from where he is when it lands, fades; respawn() hangs it again (off = false). The engine
  now honours Vine.off on a LIANA catch (it already left an off liana undrawn in protoArt.ts while it stayed catchable: a latent bug), and
  leaves false lianas out of its own liana drawing (drawnVines, plainVines, swingVines). That filter is NOT exercised by any test or shot
  yet (my shots add the vine after the stage starts): the 1-6 builder's first still must show no liana drawn under a false liana.
- ART: vineSnakeArt.ts. The travelling snake is ART-678b's GREEN cut (lead ruling GREEN 11-14: the game's liana frame is tan-olive and
  the brown hid on it); the false liana is the BROWN recolour (tools/art/snakebrown.py: green band only, to bark brown). Sizes: hang
  115 px (SNAKE.body), hiss 60; a false liana is drawn its vine's length, its slither at the same scale (recommend 115-170 px).
  Catalog rows: the green hang/hiss come with t-art-678b (rows 9425/9428): integrate t-art-678b first and flip those two to in game;
  the two brown files have NO rows yet (Content). Preload key 'vine-snake' (stageManifest/stagePreload).
- OPEN (lead ruling (B), the NEXT packet's first item): sideways the anchor is above the clear view, so the tell (and a false liana) is
  not seen (0/6 frames, shots/sideways-*). The fix is the camera: a PieceHost focus request (lead-approved, one method like letGo) that
  keeps the threat box (anchor+60 .. his feet) under HUD_BAND while a snake on HIS liana is in its tell or above his hands; where it
  can't fit, a gen2 verdict refuses a lay giving the snake < 1 s in view. No stopgap (D40).
- Shoot it: reference/qa-reports/ENG-S2/shoot.mjs (the snake; CLIP=1 for clips) and shootfalse.mjs (the false liana), both on 6-3.

## 0y. 1-7's shared faults, fixed where they live (BUILD-17b, t-build-17, 11-14): what the next engineer must know
- **A kit sweeper is judged by its STRETCH** (levelCheck.ts safe spots; gen2/stillLay.ts `isKitSweeper`, `SWEEPER_KINDS`): its laid x is
  only the stretch's start; its eye crosses [patrolMinX, patrolMaxX]. Against the spawn and the shrine it keeps SAFE_APPROACH as a walker's
  patch does; a FLAG inside or beside a stretch is fair because every respawn stands the cast down (castPlay.ts `calm`: rest, a whole
  calm, then the 2 s warn) and stillFaults puts a hide within one calm's walk of every spot. eagleKit.test "back at a flag inside its
  stretch" holds the stand-down (planted: calm() not resetting the cool). If you ever change calm() or respawnAtCheckpoint, that test and
  this exemption stand or fall together. pickups.test mirrors the rule (it re-implements the check on purpose).
- **A listed stage is a built stage in the sheet preload** (stageSheets.ts `listed`, the same test as stageGenerator.ts listedRoll): it
  takes its STAGE_DRAWS row, never the old generator's whole set. stageSheets.test now holds every listed row to what rolls 1-3 draw on
  both settings, and W1_ROOMS to the World 1 stages that build rooms (only 1-6 today). A new listed stage needs its row the day it is listed.
- **A creaky limb laid ACROSS a pit has the pit under it** (pipeline.ts layLocal, after the piece loop): a creak piece with a plain pit
  gap ending at its near end and/or starting at its far end joins them into ONE pit lip to lip (same water/soft only; back/putBack/hurt
  gaps are never joined). Before, each jump had its own pit and the limb's span had none: when it gave way he fell into nothing. Only
  1-7 lays a limb by 'jump' (1-4 and 1-5 lay theirs 'over' a bank); its seed list still `--check`s 100/100. creak.test plants both.
- **requiredMove.test is RED on purpose until 1-6 is replaced**: its fixture is the OLD hand-built 1-6, whose full first-timer was at
  346.7 s of 360 before BUILD-16c's hopCatches (700a279e) and times out after it (bisected). The lead ruled (a), D40: no work on old 1-6;
  link #3 carries the new 1-6, and the test re-points with it.
- **The journal's 'hide' page teaches the OLD slide-down hide** (movesJournal.ts): it now opens only when 1-7 is cleared (its 1-7 tip
  was a deleted line). Its words and demo need the keeper and the designer: 1-7 teaches keeping still in the green. The movesJournal
  test reads every listed stage's built tips, so a page can never wait on a line the game no longer says.

## 0x. 1-7 built on the kit (BUILD-17, t-build-17, 11-14): what the next engineer must know
- **1-7 is World 1 data**: gen2/worlds/w1Arc17.ts (kitLib17, finish17), stage-table row 'w1-17', listed.ts KITS/FINISH. The hand-built 1-7
  is deleted (protoStage's 1-7 plan, secretBush/ropeBushes/acornMeadow, w1Sections' rows, stage17.test.ts and the old 1-7 tests).
- **World 1 has no decorate pass**, so World 1's still finish (clipWatches + castWatches) runs as finish17's first step: libstage and the
  pipeline's own checks see the stage BEFORE it (no eagles, "cast (no cast)"); the game and w1Arc17.test.ts see it after.
- **A stretch ends at a gap** (stillLay watchedRun): a beat whose question is across a gap (the creaky limb, the lianas) gets one eye over
  the whole beat in finish17 (W17_JOIN: to 120 px past the beat's last hide).
- **Hanging is holding** (engine.ts:4625-4626, stepCast): the cast's hero had climbing/swinging as holding, never hanging, so hanging moss
  never hid him in the game; and a creep along the rope is moving (stillness.ts moving, CastHero.hanging). hangCover.test.ts, planted.
- **The perch is 56 px** (sweepPose.ts SNAG_PERCH, w17Art.ts snagB.perch 712): at 90 it cleared the progress sign by 4 px sideways (zoom
  0.763); BUILD-17's shoot-perch.mjs prints eagle top vs `.vh-cplate` bottom in every caption.
- **Kit tip ids that equal a move lesson ('creak', 'swing') are never said**: a stage's own lines need their own ids (lineId: `w17.<key>`).
- **The bots on 1-7** carry BUILD-16c's climb-back (c8f67aa7, 5b0b1121) plus two of BUILD-17's: a MOSSY liana is held through the
  eagle's look (it let go toward ground cover mid-swing), and the climb-back fires when the FACE ahead is over a double even if the route
  is not (1-7's SHORT liana pit: route 179 px, wall 259; pitClimb.test "shallow pit").

## 0w. 1-7's moss cover, the perched eagle, bots that hold still (ENG-E2, t-eng-e2, 11-14): what the next engineer must know
- **Moss is cover like a bush** (watcher.ts Bush kinds `moss` carpet, `mossPatch` mound, `mossHang` hanging): laid by W1_STILL's rows
  (w1Cast.ts: w1-hide-moss 346 px, -patch 169, -hang 173 and -curtain 78 with `hanging: true`; stillLay.ts HideRow.hanging ties a hanging hide's
  top at its socket's spot: a rope's line or a bough's underside). Drawn by w17Art.ts from ART-678b's own files (src/assets/w1-678/, a file is
  3x its game size: the catalog's units) in front of him; `mossAlpha`: a mound or hanging moss thins as the moss comes (the bush ghost rule), a
  CARPET NEVER THINS (it covers only his feet: thinned, it vanished exactly when he hid). Preloaded by stageManifest key `w17`.
- **A mossy liana looks mossy**: engine.ts draws drawLianaMoss on every `Vine.mossy` swing liana right after renderWorldObjects (three
  clumps of the curtain without its twig, hanging straight under gravity from where the swing puts the rope).
- **Letter m (cover) is laid**: nodeAsks.ts FILL_LETTER `{ m: 'hide' }`: a node asking m must have laid a prop tagged hide (pipeline
  dialMisses passes each node's prop tags); NODE-KEY.html regenerated (nodekey.ts). The deal does not filter sections by m.
- **The perch** (Post.perched, PredatorState.perched; laid by `eagleOver(z, groundY, id, { x })` -> Enemy.kitPerch): its body stays at its
  post SNAG_PERCH (120 px, sweepPose.ts; the snag's low branch, w17Art.ts SNAG_PERCH_DRAWN, held equal by a test) over the ground under it
  while its gaze (eyeX) sweeps; core.ts `rides = def.rides && !s.perched` everywhere riding was read; it acts (the dive) from the snag at the
  act's 700 px/s and flies home through rest. sweepPose perchedPose: rest 'ahead' (an idle blink every 4.3 s), the warn 'turn' (+ the gaze
  shadow at the start end), the pass 'down' with the shadow, 'blink' when its gaze is on him and he is hidden (SweepScene.hidden =
  calmNow >= 1); tell/act/recover/flee fly. drawCastSky draws the snag (behind him: it runs before the player) and the perched frames.
  The perch was 208 px first: sideways (412 tall) its head was off the screen top; 120 shows all of it under the HUD.
- **Bots**: firsttimer.ts hides from the KIT eagle too (the old block read only proto.watch): a second (`heed`) after a sweeper's look starts
  over his stretch he heads for `stillCoverNear` (ground cover at his level within 600 px) and takes his thumb off inside (no crouch: the
  kit hides a STILL sloth). 'hide' is learned from moss/green + still words too. A test harness that steps a FirstTimerRun by hand must call
  `after()` each frame (a jump ends there; without it his first hop never ended and he never hid).
- Proof: src/game/eaglePerch.test.ts (7), src/game/gen2/mossLay.test.ts (7), tools/inspect/castBots.test.ts (+3); planted faults 10/10
  (reference/qa-reports/ENG-E2/planted.out.txt). Real game: reference/qa-reports/ENG-E2/shoot.mjs (stills, CLIP=1 clips), shoot-hang.mjs.

## 0v. 1-7's eagle and cover on the creature kit (ENG-E1, t-eng-e1, 11-14): what the next engineer must know
- 1-7 is designed on the KIT's hide rule only (stillness.ts: still 0.5 s in cover; no crouch). watcher.ts still runs the OLD 1-7 (protoStage)
  and Worlds 3/4/6/8; it goes from World 1 when w1Arc07 replaces protoStage's 1-7 (1-7.md NEW 12).
- Laying it: World 1's still table (w1Cast.ts W1_STILL, w1Still(stage, lessonSockets)) lays hides as proto.bushes and a watched stretch;
  its finish (clipWatches, then stillLay.ts castWatches) turns each stretch into ONE kit eagle over it (eagleOver: patrol = the stretch,
  kitCool = the stretch's calm, kitFree where taught). A built stage carries no proto.watch zone for it. stillFaults reads it via sweptZones.
- The kit: Post.cool / Enemy.kitCool is an animal's own cool (coolOf's third arg); Post.free / kitFree and Easy make a sweeper's FIRST pass
  over him free (core.ts sparedPass: the dive comes, no box hurts, CastStep.spared; passes counts ended passes with him in its stretch).
  EAGLE now `rides` its eye and a rider starts on its eye (newPredator).
- Drawn: engine.ts drawCastSky from sweepPose.ts (pure, tested) with the painted eagle and the old watcher's shadow sprite; the screech on
  the pass's call (CastStep.noticed); Dot's free-pass line is stage data (CastData.said.spared, the keeper's). Sweepers are skipped by the
  enemy loop. The moss: CastPlay.calmNow (in cover only) -> hurtFlash.ts withWash on Pokey (MOSS_TINT) + the wind chime once when it is
  all the way in; a bush he is in thins as it comes (drawBushArt `moss`).
- A mossy liana (Vine.mossy) is cover while held (stillness.ts Cover.rope; startCast adds one per mossy vine); on a swing, his vy for
  stillness is the rope length's change (climbing), never the swing.
- NOT built (the REPORT's next steps): moss carpet/patch/hanging-moss rows and their art (t-art-678b w17-moss-*), the perch (rides off per
  animal + perched art + head-turn), bots that hold still in cover, 1-7's own lay.

## 0u. The swing camera and THE FAR CAP (ENG-S1, R-165.225, t-eng-s1, 11-14): what the next engineer must know
- Upright, a swing widens the view (cameraFollow.ts SWING_CAM: up to 1.3x, out 4.5/s, back in 3/s once he is down or holds on; engine.ts
  swingWideStep divides the zoom AFTER applyZoom's level-height floor, overTop lets it show sky). Sideways never. A cut snaps it back.
- THE FAR CAP is SWING_SEEN (414 px) in cameraFollow.ts: a release press counts toward a DIALLED liana's window only if the perch's far end
  (of a long landing, its first SWING_CAM.perch) is within 414 px ahead of his swing point as he presses (pressWindow's `seen`, pipeline
  lianaRelease). Dial-free lianas (Worlds 6-8) are untouched (lockall 102/102). Changing SWING_CAM.out/refVw/body or AHEAD's pads moves it.
- His DRAWN swing pose trails up to 91 px behind his swing point (heroVine drawVineHang): SWING_CAM.body, pinned by a test to the poses'
  own frames. Any new swing pose art: re-run swingCam.test.ts; the cap follows the body. His collider (heroBox) is NOT his swing picture.
- The eased camera trails a moving aim by v / RUN.follow (~60 px on a swing): while widened the aim leads by it, and the camera is clamped
  to keep his pose in. A camera promise needs a REAL-engine test (swingCam.test.ts uses RealPlay with updateCamera put back), not only
  the pure aim: the pure test passed while the engine lost the perch.
- A dialled perch's width now matters to its window (its far end must be seen): Easy's landing pad is flown with it (padW) and the
  recorded window is the laid px. Shoot a swing on the real page: reference/qa-reports/ENG-S1/shoot.mjs (stills, CLIP=1 for a clip).

## 0B6. 1-8's last engine pieces: the still fork, the runner liana, the tip, Easy's chase gap (ENG-B6, t-eng-b6 from t-int-9@1c7f6b95 + t-eng-b5@c0599609, 11-14)
- **Section letters in this note collide** since B6's merge: t-int-9's line (ENG-S1..S5, ENG-E1/E2, BUILD-17) and B's line (B1..B5) each
  wrote their own 0u..0y. Both are kept, each with its branch in its heading; cite a section by heading, never by letter alone.
- **The merge trap (worth the next integrator's time):** t-int-9's history roots in an ORPHAN commit (f1b72ec7, ENG-S5 = HOOKS 994ea4e7 +
  ENG-S1..S5 squashed, no parent), so git finds two merge bases (f9671e3b, d8d6a973) for any B-line branch and raises false conflicts
  (52 for B5, 46 of them files B5 never touched). Merge each file against the TRUE base, HOOKS 994ea4e7 (`git merge-file ours base theirs`),
  and check every auto-merged file the same way: a virtual base can also auto-merge a file WRONG with no conflict shown.
- **(a) The still fork is a LAY, not a new piece** (gen2/stillFork.ts layStillFork(stage, fork, look, world); World 1's look w1Cast.ts
  W1_STILL_FORK): the living fork already holds the collapse and a new crack already sets off as he passes the next stretch's start
  (chase.ts); the lay adds the cover (World 1: the moss carpet, STILL_FORK.runIn 60 px past where the collapse stops) and ONE perched kit
  eagle past it, within STILL_FORK.postMax 420 px of the cover's start (him and it on one upright screen in the chase lead) and clear of
  the fork's flag; its zone runs from the fork's near edge `stillReach` px on (its warn at Easy's longest x his top run + sight + 60:
  ~871 px), facing -1 so the eye crosses TOWARD him (running on is running into it), and `kitPasses: 1` (kit Post.passes: after its one
  pass cool = Infinity: it rests on its post for good, after a respawn too; it is NOT beaten or gone, so cast `cleared` never counts it,
  which would have bumped enemiesDefeated and the eagle's kill stat). The pass is called the moment he is in the zone (the kit starts cool);
  warn 2.0 s Normal (EAGLE.warn), 2.6 s Easy; Easy's first pass is spared (core.ts sparedPass). Refused by name: short fork, broken
  ground, a rock in the cover, the last stretch, a stretch already watched, the flag where the post must stand. stillForks(stage) reads
  it back from the data. Proof: gen2/stillFork.test.ts 7; bots in chaseBots.test (RunOptions.knows ['hide']: 1-7 taught it).
- **(b) The runner liana** (runnerLiana.ts pure; pieces/runnerLianaPiece.ts on the hook; data `Vine.runner`): solved once at the stage's
  start with the engine's own air (airStep, jump hold and cut) and catch (canGrabSwing): `runnerMoment` = the middle of the widest run of
  swing moments a full-run jump off its lip catches over 3 take-offs x 3 holds; each step while he RUNS at it (vx >= RUNNER.atRun 0.85 of
  his top run, grounded, within RUNNER.from 1,188 px of the lip) its swingPhase is eased toward that moment at his top-run arrival, by at
  most RUNNER.rate 0.12 of a swing a second (no frame moves it more than its own swing x 1.34). Never while he holds it, past its lip, or
  while he walks or stops: a phase eased for a run that is not coming made the middle bot WORSE than the plain swing until this rule.
  PieceHost.vineClock was added for it. runnerProblems refuses no lip, no catching moment, or under RUNNER.from of run to the lip.
- **(c) The tip** (`ChaseStretch.tip`, last stretch only, chaseLayProblems): the chase piece marks that stretch's last section chaseTip
  (the long-branch sheet's tip frame); when he is off the ground past its far end + TIP.past, every section of the stretch still standing
  breaks at once (halves within a view's width of him tumble, the tip tumbles WHOLE), one big crack, PieceHost.slowMo(TIP.slow 0.55 s)
  (the engine's own slow motion; a piece's slow motion does NOT push the zoom in: engine.ts slowMoZoom 1, the giant's hit and old 1-8
  keep 1.3). It breaks TIP.delay 0.5 s after he leaves the tip (timer reset only by the ground), and the camera leans back from that
  moment (cameraFollow.ts TIP_VIEW: back 0.86 as a target, which the eased camera lags to ~60-70%; the landing framing waits until he is
  330 px past), so the whole tip and 200+ px of branch are on screen as it falls upright and sideways (chaseTip.test, real camera).
  Respawn: whole again from a flag before it. OPEN: the chase-section-to-fork-ground seam (REPORT polish 6, a ready packet). Slow motion lives in the engine's frame loop, NOT update(): a harness stepping update() directly must
  apply it itself (B6/shoot.mjs does).
- **Easy's chase gap** (the lead's ruling 6:10 PM: on Easy every chase gap is one the child bot clears 3/3): gen2/chaseLay.ts
  CHASE_LAY.easyGap = 50 px (measured: the Easy CHILD clears 40 and 50 px on 3/3 seeds; 60, 80, 100, 120, 140 each drop seed 1);
  easyGapProblems runs in layChase when st.gen2.budget.difficulty is 'easy' (gaps measured from the furthest reach of the sections
  before, a log across at their height closes one); held to the bot by chaseBots.test (toy at the width + a plant 10 px past). Flat gaps
  only: a gap with a rise is not measured. Easy chase stretches are now nearly gapless (a Designer call, raised in the REPORT).
- **Two bot fixes for every stage (firsttimer.ts, the lead's push-back):** (1) `runnerAhead`: on the ground within RUNNER.from of a
  runner liana's lip, no steering-rhythm lift (gapQ: the MIDDLE tier's lift stopped him dead 195 px before the lip); planted
  noRunnerHold. (2) a liana hop (Jump.liana) is held at least who.hold[0], the hold lianaWait judged the catch with (a tier bot's drawn
  press, holdQ 22-231 ms, fell short of the hop it judged). castBots + pitClimb 19/19 after it.
- **Dev fixture** (?fixture=chase, chaseFixtureStage.ts layFixturePieces): lays the still fork on fork 0 (clearing bare rocks in its
  cover, moving the fork's flag past the post) and makes the last stretch the tip with a 444 px gap, a runner liana 214 px out and a 600 px
  landing of its own (1-1's stepped finish has nothing level with the tip). Still fork on 4 of 6 rolls (seeds 1-3 x both settings: the
  others refused by name: a step in the fork, no post room), tip + liana on 6 of 6. The page plays seed 1: both.
- **Traps:** the tier bots stand at about half of all edges by calibration (standShare) and lift their thumb by a rhythm on open ground
  (gapQ, off only on a laid chase or under a fruit or near a runner liana), so a toy that asks "never stands" must use a strider
  (standShare 0, lateShare 0) or it measures the testers. A bot's RNG is salted by its name: a renamed profile is a different run.
  Never edit src/ while a Vite shoot runs.

## 0w. The rolling nut and fruit, the chase camera lead, the dev chase fixture (B5, ENGINE-678, t-eng-b5 from t-eng-b4@956e33e0, 11-14)
- **The hazard is data:** `GeneratedStage.rolling?: RollSpec[]` (rolling.ts) `{kind: 'low'|'high', dropX, speed, bounce, teach?}`, run by
  pieces/rollingPiece.ts (PIECE_KINDS after CHASE). Set off by HIS x (`rollAhead`: drop + roll take ROLL.seen 1.0 s at a full run, Easy
  1.1); the drop is the tell (ROLL.tell 0.8 s, from up to 480 px, never over the HUD band), a thunk (playLand), then at least ROLL.after
  0.15 s of roll. Nut: rolls at him, a rattle, spins; its hit round is 0.75 of its drawn round (ROLL.lowHit) so a one-frame tap timed
  clears it. Fruit: tall arcs PHASED to him (`phasedPace`, re-asked every step in the air, eased by phaseAcc): it meets him mid-arc,
  closing at least `fruitClose` px/s so it never lands beside him low; touched against his DRAWN height (89.1). Teach = a bump (the
  piece moves him, no heart, no safe time); after the stage's first crack a heart via damagePlayer (`rollTeaches`). Spent after a touch.
  Respawn: ahead of his flag waits again, behind is gone. Checks by name: `rollProblems` (pace under his run, a nut's rattle a hop,
  a fruit's arc over his head) refuses at start; `rollGroundProblems`/`runIn` (no gap, no hop rock in the run-in) is the LAY's check.
- **Art (no new picture):** nut = the round shell of dressnew-w1 w1NutPod, fruit = M-10-d's lowest-left cannonball fruit, each cut round
  ONCE into a canvas (CUT, BAKE_K 3; re-baked on canvasLost, D6), one drawImage a frame each + one baked shadow ellipse. Painted palm nut
  and cannonball fruit pieces (1-8.md NEW 3) are the lead's Hugging Face call.
- **The chase camera** (cameraFollow.ts `chaseSpan`/`chaseBack`, engine.ts updateCamera via `chaseSpanOf`): over a stage's chase span
  (first crack - 400, or the first hazard's set-off - 400, to the last fork or hazard) his middle sits `vw - ahead` from the edge behind,
  clamped to 10-30% of the view: upright 390-412 px phones show the nut 1.00-1.07 s before it reaches him, sideways 1.03-1.13 s; 360x800
  1.00 s; 320x782 0.90 s (named). The span is cached per stage AND its chase/rolling arrays (a harness swapping st.chase kept a stale
  span). The old hand-built 1-8 keeps its own `p.x - vw * 0.3` (this.chase?.active wins).
- **Bots** (firsttimer.ts `rollPlan`): a nut closing within HOP_AT 60 px gets a hop held 2+ frames; a fruit dropping or bouncing within
  480 px ahead holds the thumb down (no rhythm gap, no stop); both yield when a gap is within 240 px (one threat at a time).
  `noRollRead` removes the skill (the planted test). chaseBots.test.ts's hazard runs use their own branch (`branch(true)`, longer runs).
- **`?fixture=chase` / `__play('1-98')`, dev builds only** (chaseFixtureStage.ts; stageGenerator, App, stageSheets): chaseLay.test's
  fixture (now ONE definition both use) built by buildGen2Stage + w1Finish, its config the BUILT one (1-1's laid over it put the pit line
  above his ground: a planted check), hazards laid by `layFixtureRolling` on unbroken runs; 1-1's ground has a hop rock every 300-500 px,
  so the FIXTURE clears bare rocks inside a run-in (never one with dressing or a creature on it; petals stay). run.mjs already accepts
  '1-98' as a scenario: `node tools/perf/run.mjs port . <port> <dir> 1-98 port` then `DRAWCHECK_RESULTS=<dir> node tools/perf/drawcheck.mjs`.
- **Traps:** a bare `input.state.jumpPressed` is cleared before use: clip tools press with `input.triggerTouchUp(0, ms)` and
  `releaseTouchUp()` (D69). His x is his MIDDLE and his y his FEET (engine.ts landing). A test needs `r.e.player.invincibleTimer = 0`
  after `r.safe = false` (RealPlay's frames set it to 1e9 while safe).

## 0v. The chase LAID by gen2 (B3 laid it, B4 finished it for 1-8's builder; ENGINE-678 W2, t-eng-b4 from t-eng-b3@71da15cd, 11-14)
- **Job K is a chase node** (nodeLetters.ts; V13 refuses it in a world's first stage). A K node is filled from the sections a practise or
  flow node takes (pipeline.ts `servesJob`, ONE rule read by every fit site; no pool lists 'pressure'). **L (finale) after the last K is
  the LAST stretch** (`last: true`: its front runs the row's final burst, chase.ts planOf; none without an L).
- **The lay** (gen2/chaseLay.ts `layChase`, buildGen2Stage after buildRolled, BEFORE applyVerdicts). Stretches and flags are walked
  TOGETHER, left to right (B4): a stretch runs on while the flag before its crack, standing where it really stands (the realised
  run-up), reaches a flag on the ground after it within ROLLED_FLAGS.max, and the cap `chaseCap()` (max - pad, 3,840) holds; past that
  it is split at a plain route piece forkMin+ wide that flag reaches (a living fork, never cut, a flag on it). Every stretch is at least
  `chaseFloor()` = ceil(behind x maxRun / base) = 645 px (Normal row: shorter, nothing falls under him); a split never leaves a
  shorter rest (it joins the fork); a K node under it is refused by name. The first crack may set off at the end of one of the node's
  own route pieces when no spot within `flagBefore` (600, now honoured exactly) of its first section is reachable (a rolled flag ~1,000
  px before it). The fork after the last stretch: its flag is the first spot whose flags break no rule of rolledFlagBreaches (D19: the
  verdict's own code), or a rolled flag already in reach; after it the rolled pass's own span fill runs again to the exit.
- **Cut and checks:** the stretch's own route pieces (plain solid, `breakable`) cut into ~222 px sections marked `chase` (the first IS
  the piece). A section's seam (a pit's floor and steps) is never cut: it stays as the pit's ground under the fall (the ruling's option
  2). `chaseStanders`: a dressing piece (proto.dress, decor, w3decor, kitDecor) whose foot is on a chase section's top, or a creature
  whose patch runs over one with its feet on it, refuses the lay by name (D16; 0 seen on World 1).
- **Two roots fixed in pipeline.ts (B4):** applyVerdicts clears windowMiss/flagMiss/towerMiss before judging (the search's rollUnmet
  judged the stage before the lay; its stale miss refused 2 of 30 chase rolls whose own flags passed); Easy's Normal build lays its
  chase before it is judged (Easy carried Normal's PRE-lay flag misses). Lock 102/102 unchanged.
- **Yield** (`npx tsx tools/engine/chaseYield.ts [code] [n] [ends]`, World 1's kit, 1-1's brief, stage 8): `A T P F R K R K R S E`
  **30/30 Normal, 30/30 Easy** (B3: 15/23, 16/19 at my first measure), stretches 822-3,780 px, 2.3 a stage. With an L (`... R L S E`,
  ends finale): 30/30 both, but World 1's pool has NO finale section (pool short): 1-8's arc must bring them (Content).
- **The edge (C4, B4):** pieces/chasePiece.ts `edgeCanvas(w, h)`: an ember disc (radius GLOW.radius 0.46 of the screen's SHORT side: by
  the long side it filled a sideways screen) centred ON the break (the fallen side darkens into it: drawn from the break rightward it cut
  a hard seam), a squat dark core on the branch line (a tall one read as a smoky pillar); baked ONCE per screen size, stamped with ONE
  drawImage at globalAlpha EDGE.max (0.8) x k (k by the front's gap: 0 at 650 px, 1 at 150), at the break when on screen, else centred
  on the trailing edge, at his feet. Re-baked on a size change or canvasLost (D6). No gradient a frame. NOT measured with contrast.mjs.
- **A catch is a heart:** chaseCaught -> respawnAtCheckpoint('pit', true, lifeNote false): no "N lives left" note (it read as a life).
- **Bots** (tools/inspect/chaseBots.test.ts, CI): engine.ts guideView.chase is on while he is on a laid stretch; the tier bots then keep
  the thumb down and stand at an edge only if the stand fits the front's stop budget (firsttimer.ts chaseRoom, CHASE_MARGIN 0.8 s).
  Planted: a 2.8 s stopper is caught without the skill (noChaseStride), never with it. No tier bot is ever caught. **OPEN (todo):** the
  child tier reaches the fork on 1 of 3 seeds: every miss a FALL at a 120 px gap (a heart and the flag), never a catch.
- **Built by B6 (0B6):** the liana phased to a runner (NEW 4, Vine.runner); the still fork (NEW 7, gen2/stillFork.ts); the tip (NEW 8, ChaseStretch.tip). **Not built:** a gen2 lay of the `h` letter (the builder lays `rolling` by data); the `s` letter as a content block (a runner liana is laid by data on a Vine).
- **Traps:** never edit src/ while a Vite shoot or the unit suite runs in the same tree; a lay test that asserts refusals exist asserts a
  defect (B3's "some rolls are refused" went when the yield reached 30/30); judge flags with rolledFlagBreaches, never a copy of it.

## 0u. The chase as a piece (B1 CHASE-CORE, ENGINE-678 W1, t-b1-chase from t-hooks@994ea4e7, 11-13): what the next engineer must know
- **Data:** `GeneratedStage.chase?: ChaseLay` (chase.ts) = stretches `{start, end, last?}` left to right; between one's `end` and the next's
  `start` is a LIVING FORK (no section there falls, he is never caught there). Sections that fall = platforms marked `chase`. A lay is
  checked by `chaseLayProblems(lay)` (B5's lay must call it and refuse by name; CHASE_PIECE.start only logs and starts nothing).
- **Rows:** `CHASE_ROWS.normal` = CHASE (old 1-8 numbers, unchanged; the old engine path reads the same via default args). Easy: base 170,
  max 200, cap min(200, PHYS.maxRun), final 0, behind 600, hold 2.2 (stop budget 3.4 s vs Normal 2.2 s). Easy numbers are B1's; DESIGNER may tune.
- **The piece** (pieces/chasePiece.ts, registered after RIDE): one front per stretch (`ChaseRun`); a section's owner = the stretch whose
  ground holds its middle (`sectionStretch`; the first also owns the base behind its crack); broken = its front passed it. Respawn sets
  every section from its front (`restartRunAt`: a stretch behind the flag stays fallen to its fork, the one ahead waits, a flag inside
  one holds its front). Draws sections + debris on 'world', the trailing-edge tint on 'screen'.
- **Hook extension (lead OK 11:25 PM):** `PieceHurt.toFlag` = a heart and back to the flag (engine.ts calls `chaseCaught()`, whose body is
  general; it ignores his safe time, as the old catch did). Off the branch = 300 px under the nearest section, capped 90 px above the
  stage's pit line (levelHeight + 120), so the chase's heart always comes before the pit's life.
- **Draw rule (lead OK (d) 11:33 PM):** a `chase` section is drawn only by its chase drawer: engine.ts drawPlats leaves chase sections
  out whenever a stage has one; protoArt.ts paintedPlatforms never claims one. The engine line is pinned by text (no stage lays a chase
  at its start until B5); B5's lay test must add the in-play check (drawPlats has none of its sections).
- **Not in B1 (named for B5/B6):** Dot's "It is breaking behind us!" line, the camera shake and the music's danger (engine-side for the old
  1-8 only: engine.ts updateChase / :3712), the chase camera, liana phase and tip slow motion, per-world collapse look (World 1's art for all).
- **Traps:** the front sets off from `start - behind`, not from where he stands (stepChase keeps the further-back front): a test's
  budget counts from there. The stills scene (reference/qa-reports/B1/stills.mjs) swaps a test branch into a real stage: tap Dot's held line.
- **B2 (t-b2-chase, 11-14):** the trailing edge is `edgeTint(gap)` (chasePiece.ts EDGE: dark core + ember rim, 0 at 650 px, 0.75 alpha at
  150 px and closer, wider as it closes; chasePiece.test.ts pins it). A stage with `chase` asks for the long-branch sheet behind the card
  (stageManifest.ts builtStageKeys 'props3' -> stagePreload.ts start -> protoArt.ts warmProto3): it used to load on the first section drawn.
  Clips: reference/qa-reports/B2/shoot.mjs (a RealPlay.bare-equivalent world in the real page, world.mjs; frame-by-frame capture, never
  Playwright's recorder; never edit src/ while it runs: Vite reloads the page; an old save that has seen the stage's story aside).

## 0t. The piece hook and the one letter grammar (HOOKS, ENGINE-678 W0, t-hooks, 11-13): what the next engineer must know
- **A runtime piece never touches engine.ts again.** Write a `PieceKind` (stagePiece.types.ts) in its own file under src/game/pieces/ and
  add it to `PIECE_KINDS` (pieces/index.ts). The engine asks every kind to `start(stage, host)` once per stage (after its platforms and
  clock exist), `step`s each piece where rides used to move (before the moving-platform loop), asks `hurts` after the cast steps (a hurt
  goes through the ONE damagePlayer: safe time, knock away from `fromX`), calls `respawn` at the end of respawnAtCheckpoint, and draws
  each piece only on the layers it names: 'world' (after the traps, behind him), 'front' (with the bushes, over him), 'screen' (after
  the world transform). A piece reads the engine only through `PieceHost` (live getters; one object made once).
- **RIDE is the first piece** (pieces/ridePiece.ts): the moving-platform loop skips `plat.ride`. No shipped stage lays a ride yet.
- **A harness that swaps the stage's platforms must re-start the pieces**: RealPlay.bare() calls `e.startPieces()` after the swap
  (rideLay.test's real-engine rides went red without it: the pieces were started on the old platforms).
- **The headless canvas cannot run render()** (scenery needs real canvases): pieceHook.test.ts pins the three draw calls' order in
  render()'s text instead, and proves start/step/hurt/respawn with a planted probe on 1-2, 2-1 and 3-3 through RealPlay.
- **One letter table: gen2/nodeLetters.ts.** JOB_OF, CONTENT_OF, V13's LATER jobs (nodeCode.ts) and nodeAsks' LATER_CONTENT are derived
  from it; NODE-KEY.html's Jobs / Made of / pieces rows are written from it by `npx tsx tools/engine/nodekey.ts`, and
  nodeLetters.test.ts fails when they differ. Add a letter THERE, then run nodekey.ts. Liana is `s` (r is rope + climbing vine);
  `m` cover and `h`'s rolling dials are named LATER (B3, B2); a letter with no piece rule has no PIECE_WORDS row (no empty Never).
- **Never edit the tree while the gate script runs** (it reads files as each step starts): run gates in a separate worktree, or wait.

Rewritten for FIX-15 (2026-11-14, branch `t-fix-15`): section 0k's gate bullets (a shut gate is wood from every approach; the lay gap).
Rewritten for FIX-15b (2026-11-14, branch `t-fix-15b`): section 0k's FIX-15 bullet (the gate's own flag waits; the lay gap is blocked, PUSHBACK).
Rewritten again at the stop of RULER (2026-11-13, branch `t-ruler`): the per-gap pit ruler, built and HELD on 1-1's openings, R-165.221 (section 0o). Sections below are still true.
Rewritten for TIPS (2026-11-14, branch `t-tips`): tip bands, the tip verdict and gate, the locked exit's line and plate (section 0t).

## 0t. Tips fire where their mechanic is; the locked exit says why at once (TIPS, R-165.236 / .241, t-tips from t-int-8, 11-14)
- **A rolled tip carries `band`** (StageHint.band [top, bottom], his FEET, in the air or not): `tipBand(sec)` in pipeline.ts = the
  section's pieces, entry, exit and vines (top and bottom), widened `TIP_BAND.over` BOUNCE_REACH 258 above and `.under` DOUBLE_RISE 185
  below. Seams are left OUT (in a tower they are the storey under: the turn's ledge and the catches; with them 1-4's creak tip could be
  said 1,134 px of climb early, without 860 at worst). engine.ts's hint filter refuses a banded hint while his feet are outside.
  Before: x alone, so 1-4's four teach lines went up in the first 3 s on the start floor.
- **Flat stages did not move**: src/game/tipBand.test.ts plays the first-timer's whole run on 1-1, 1-2, 1-5 (Normal + Easy) twice,
  with bands and with them stripped, and requires every tip on the same frame. Planted: TIP_BAND {0, 0} moves 1-1 and 1-5
  (reference/qa-reports/TIPS/planted-band-zero.txt). The lock: only `proto.hints` moved, on the 22 rolled stages with tips.
- **The verdict** (`tipReach` / `tipMisses`, towers only -> `towerMiss`, fails the roll by name): no tip said more than `TIP_NEAR`
  1,026 px of route before its socket (PHYS.maxRun x `TIP_SAY_S` 3.6 s, the time engine.ts says a stage tip; said further back the
  line is gone before he gets there), and a teach tip sits in the first section on the route whose template teaches or uses its
  mechanic. On a run the first can't happen (its route is x); the test still runs the second on every rolled stage.
- **The gate**: `npx tsx tools/engine/tipwalk.ts --layouts 4` (gates.yml; own test tools/engine/tipwalk.test.ts): every vertical
  rolled stage (found from the builds: today only 1-4), the verdict plus a real-engine 20 s walk from the spawn where every tip said
  must have his feet in its band. `--strip` is the x-alone run (64 misses on 1-4). Set the setting with `setDifficulty`, never
  localStorage (a RealPlay built Normal when asked Easy; the tool prints BUILT and fails a mismatch, D62).
- **The locked exit (R-165.241)**: engine.ts says the sealed door's line with `GuideOpts.lock` (onGuide -> App.tsx -> DotGuide
  engineLine -> engineGuideLine `lock`): kind 'must' whatever its words, so it cuts in over any card. The keeper's own door lines
  (stagePlan SEALED_LINES: 1-5's marks; 1-6's petals on t-build-16) classify as info by their words and waited behind her mark card.
  It is said at once over a line still up (`stageHint?.text !== said`; was `!stageHint`). The first-timer passes `lock` too (D19).
  The door's "N more" plate is drawn in drawPopups (words in play: over Pokey, under the HUD) at `PLATE_TOP` (sanctuaryDoor.ts), its
  bottom 70 px over his drawn head as the door holds him; drawSanctuaryDoor no longer draws it. Tests: src/game/sealedLine.test.ts.
- **Open**: R-165.238 (delete proto 1-6) waits on t-build-16 landing in an integration branch (it had not at 1:20 PM ET 11-14).
  1-6's tower (t-build-16) joins tipwalk by itself once merged (verticalStages reads the builds). The bands overlap between storeys
  (258 over + 185 under): a tip skipped by a teleport fires at the next storey's foot (seen in the clip harness, not in play order).
Rewritten for POLISH-10 (11-14, t-polish-10): section 0t (sheet pieces, strip joins). Rewritten again at the stop of RULER (2026-11-13, branch `t-ruler`): the per-gap pit ruler, built and HELD on 1-1's openings, R-165.221 (section 0o). Sections below are still true.

## 0t. Packed sheet pieces and strip joins (POLISH-10, R-165.243 / R-165.237, t-polish-10 from t-int-8, 11-14): what the next engineer must know
- **A piece drawn from a packed sheet to its frame's edge pulls in its neighbour's edge row** (Chrome's drawImage filter reads past the
  source rect). The ground sheets pack lips 0/1 right under the soil fills, whose bottom row is opaque in all ten worlds: every lip laid a
  one-row soil line at alpha ~95 straight across the backdrop, 30-40 units above the bank (the lead's "dark line across World 1"). Now
  lipSrc() samples LIP_INSET (4) rows in from a lip's top and bottom, drawn where those rows sat (groundSeams.test.ts, R-165.243 test).
  Same family as FILL_INSET (0g). Ends (endFrame) have a faint neighbour on their LEFT (alpha 11-38): not yet shown to make a line.
- **Finding which draw makes a line:** wrap CanvasRenderingContext2D draws, read one pixel before and after each (getImageData) on the
  main canvas, then on the 397x397 ground squares: names the drawer in one run (POLISH-10 REPORT "Method update").
- **Strip wraps:** scripts/strip-seamless.py's join can be undone by a later re-grade. 1-4's canopy middle (w1c-mid) was re-joined
  (4.7 -> 0.3). Still rough at the wrap (join / column step): w2mist-mid 22.8, w1kapok-mid 19.5, w1sunrise-mid 15.2, w8sunset-mid 15.0,
  w6dawn-mid 12.9, w1rain-mid 10.5, w3sinkhole-mid 10.1, w6moon-mid 7.9, w1dusk-mid 7.5, w1-mid 6.4 (INT-9: w1kapok-mid FIXED by tools/art/stripjoin.py feather, its canopy faded before the border). A forced re-join of w1-mid left
  floating branch bits (its two ends differ too much): those need a look per strip, not a batch run.

## 0o. The per-gap pit ruler (RULER, R-165.197/.200, branch t-ruler from t-nodes@1829470f, 11-13): built, HELD on 1-1
- **findOpenPits (w1Pits.ts) judges each gap by its own lips.** Ground is earth only (`EARTH_DEEP` 90: a bank, a stump, a pillar); a log
  or bough is a platform over a gap, never its lip or floor (the lead, 8:50 PM). `earthLine` is the earth's top along x: a HOLE (no earth
  at any depth) between two banks is a gap at any width from 24 px (no 1,600 cap); a DIP (earth dropping more than SOFT_BELOW and coming
  back) is a gap when all of it lies deeper than SOFT_BELOW under the gap's line. `gapLine`: the higher lip when the lower is within
  SOFT_BELOW of it, else the lower (a stump or pillar's top is not the ground). Floor window, SOFT_FLOOR, `lower` (a road running on)
  read from that line. A drop inside a judged dip is its floor (`dipEnd`). The second "marked drop at any height" pass is gone (holes cover it).
- **Planted:** w1Pits.test.ts "per-gap ruler" x4 (far ground, a raised hole, a log chain one gap, a 2,000 px hole), red on 1829470f.
  The x22604 slot test now reads the block (earth 68 px down) as a sunk step, as realFalls always did.
- **HELD (the lead's C, 9:35 PM): 1-1's openings are R-165.221 (the 1-1/1-4 polish lane).** 1-1 cannot build on t-ruler: its final
  climb lies over earth holes (946-2,870 px) the old ruler never saw, and from its catch branches and lower logs he walks under the
  route log and steps off into nothing (seed 769: off 115 at 869, 25947..26218 under 116). realFalls (promises11.ts:44) is NOT the
  cause: with both its clauses corrected the runs stay (ruler/PUSHBACK.md). 1-1 must lay a soft zone spanning each hole, or catches
  he cannot walk off into nothing; then seedlist 1-1, lockall, mixlist, full Checks on t-ruler. verdicts.test.ts:322's seed 323 copy
  needs its real right bank (its slot ends at a log: no gap under earth-only lips). The full EXACT NEXT STEP: ruler/REPORT.md.
- **Scan tool:** ruler/scan.ts reads the SAME builds (d8d6a97's tree) with both rulers: painted changes 0 (World 1 only is painted,
  protoArt.ts:1310; only 1-1/1-2/1-3 are judged, stageTable.ts:34-38). ruler/shootAt.mjs: sideways stills pinned at a chosen x, any tree.


## 0n. Tonight's three unit reds, fixed at their roots (FIX-INT, t-int-5 from t-int-4, 11-13): what the next engineer must know
- **w1Finish takes a toy stage** (bare platforms, w1.ts:1539; w1CutArt.test plants one). Anything World 1's finish calls through `as never`
  must be null-safe for every field but platforms: B15's dressMarks read `st.collectibles` unguarded (fixed, w1Marks.ts `?? []`).
- **The control course is gone** (R-165.151, FIX-B). A test that read its 'Swing' stretch now reads 1-6's 'Learn: swing over soft moss'
  beat (protoStage.ts plan 'proto', the same soft-hollow chains). A deletion packet greps every READER (tests by beat name, #ctest), not
  only the builders.
- **Stage length checks are per builder** (the lead's rulings 11-13 4:49 and 5:03 PM; stageQuality.test.ts growthBreaks): World 1's cap
  is World 10's median (the old 175 s cap was stageTime.ts:84's target, not STAGE-RULES.md:77); the world-to-world growth step reads like
  with like (same-kind worlds whole; else each builder's own stages, 3+ in both). World 1 is a MIX tonight (1-1..1-5 gen2, 1-6..1-9 old);
  W9 after W8 is the one step unread until one of them changes builder. Never lengthen an old-builder stage to pass it (D40).
- **buildcheck runs alone**: under the unit suite's load 1-1's Normal p95 read 155 ms (FAIL); quiet, 147 ms vs the 150 budget (PASS,
  3 ms spare). 1-1's build cost is close to its line: the next thing added to World 1's finish should be measured with it.

## 0m. The integration head, the strips' clear rows and the card's trail (INT-3, t-int-3, 11-13): what the next engineer must know
- **Merges.** t-art-1113, t-add-level, t-fa, t-b15, t-b14, t-fixa, t-fixb merged in that order (never rebased). Traps: CATALOG-MASTER.csv
  is CRLF and B14/FIX-B committed it as LF (every line "changed"): normalise the side to CRLF, then `git merge-file`, then
  `python3 tools/art/catalog_master.py --emit` (cast.json is generated: never hand-merge it). B14 and B15 each deleted one hand-built plan
  (1-4, 1-5) from protoStage/w1Sections: the merge keeps neither. FIX-B removed the 'ctest' plan and CTEST_STAGE_ID: keep that, and
  keep FA's feel-pair import (qaBuild) in stageGenerator. Root PLAN/REPORT/PUSHBACK files of task branches go to their qa-reports folder.
- **A fitted strip skips its clear top rows** (src/game/stripInk.ts; scenery.ts drawFitted `ink`): each strip is read back ONCE when it
  decodes (paintedBackdrops.ts: sets, canopies, reveals), never in a frame; drawFitted starts its source rect at the first painted row
  less a filter margin (fitInkRow). Exact: reference/qa-reports/INT-3/inkproof.mjs proves on all 197 strips at 12 fit sizes that no
  painted row is left out (min 5 rows spare). A fit with its painted sky over it starts at row 0. It took 1-4 sideways from 8.02 to 7.20
  screens (drawcheck 7.5) and every stage's backdrop down 0.4-0.8. Trap: the root was 1-4's 2600 px canopy crossfade (engine.ts
  setCanopy, scenery.ts `cano`): both strip sets are drawn whole through it; any new crossfade pays two sets the same way.
- **Dot's card owns a finger on any box it stood in over the last 300 ms** (src/game/dotCardHit.ts, R-165.201): DotGuide notes each
  frame's box (and each frame of its 0.3 s fade, where it stood), TouchController claims a finger that goes down in the trail before
  the gestures see it (never steers, jumps or punches) and taps that card on the lift (only if it is still the one up). Real page
  (tools/dotbox/readtime.mjs 1-2 tap, DOTBOX_VIEW=915x412 for sideways): run 1 found the fade case (3 of 78 taps punched on a card
  fading at its reading time); run 2 after the fix: reference/qa-reports/INT-3/tap-run2/. Trap: a tool that aims at a card's rect and
  then taps in a second evaluate is exactly the player's latency; keep it that way.
- **1-4 is not shippable on its bots** (castBots 1-40 after VARIETY's vault patch: 22 of 360), so #ctest plays 1-3
  (playRecorder.ts CTEST_LEVEL_ID). The split of the failures into bot limits and level faults is the next job (B14 REPORT step 2).

## 0i. Adding a level is one step (ADD-LEVEL, R-165.187, t-add-level, 11-13): what the next engineer on stage plumbing must know
- **`npx tsx tools/engine/addlevel.ts <id>`** once the arc is hooked into its world's kit and the row is in stageTable.ts: rolls 24
  seeds both settings (libstage.ts), writes the seed list if the stage has none (seedlist.ts; `--relist` rebuilds), checks it, runs
  castBots 1-40, prints the flight-sim command when the row is not judged, and ends with a DONE/MISSING checklist (exit 0 only READY).
  1-3 replayed with its list removed: 3 m 32 s, the list byte-identical (18d380ae), every bot 40/40 both settings.
- **libstage.ts is THE roll tool** (`--stage <id>`): it builds as the seed-list search builds (buildGen2Stage + listRules quietJudge),
  so a listed seed lays the beats its list replays (libstage.test.ts proves it on every list). Stage-specific counts (1-3's traps)
  stay in that stage's own test; library13.ts is kept only because library13.test.ts is 1-3's plan test.
- **registrycheck.ts is the gate** (rolled job, seconds): every stageTable row needs kit, config, routed (stageGenerator builtOnGen2),
  levelSeeds, sheets (its rolls' creatures in stageSheets' preload, BOTH settings: stageSheets.test walks listed stages on Normal
  only), a limits.json drawcheck scenario, a seed list or standIn, and a judged scope with a row for every move Easy flies. CI checks
  EVERY proven list via `registrycheck.ts --lists`. No known list: its 3 birth misses were fixed on the branch (1-1 drawcheck
  scenario, 1-2's seed list, 1-3's list in CI), so every miss fails.
- Trap: tools/ is outside tsconfig; typecheck a new tool with a temporary config at the repo root (types node + vite/client).

Rewritten again at the stop of NODES-TRAVEL (1:04 PM ET, 2026-11-13): branch `t-nodes`: a stage laid as LEGS (section 0p). Milestone 1 of 4 only. Sections below are still true.

Rewritten again at the stop of VARIETY (2:33 PM ET, 2026-11-13): branch `t-nodes`: one vault finder for the engine and the tower verdict; a node's shape or move ask is a rule where the slot can keep it (section 0r). Sections below are still true.

Rewritten again at the stop of VARIETY-2 (2026-11-13, branch `t-nodes`): a '_' V19 overrules is refused at graph time; why floor.unmarked kills mix strings (section 0s). Sections below are still true.

## 0s (0m on t-nodes). The asks against V19, and what kills World 1's mix (VARIETY-2, R-165.197/.198/.200, t-nodes, 11-13)
- **askRefusal** (pipeline.ts, called in rolledGraph after V19 marks `mustRise`): a '_' asked of the node after a late descent on an up
  stage throws by V19's name before anything is laid (planted: gen2/askRefusal.test.ts, red before). ONLY that: a refusal by "no section of
  the node's job falls / keeps the move" was built, measured and taken out: 12 of its 35 refusals were asks the lay KEPT (a node's net
  fall also comes from its joins and the corridor; nodeMix string 59's combine '_' laid with no falling combine section). Refuse at graph
  time only what fails on every seed; everything else is laid or named after the lay.
- **floor.unmarked is the painter's ruler, not the late sections** (reference/qa-reports/VARIETY-2/PUSHBACK.md): findW1Pits reads one ground
  line G (the widest bank top over the whole stage); a 24 px log within 20 px of G is "ground", so a log chain or rung row laid at that
  stage's G reads as falls (water), the same chain on a stage whose G is elsewhere is not judged (string 57 seed 58: asked G 813, bare
  G 1269, same log chain); holes between two tall banks are judged only at 24-1600 px. 11 bare frames fail the same way. Fixing it moves
  the painter and the verdict on shipped stages: a lead ruling (planner.md §3 "Floors").
- **Pool short in mix rolls** (repairs.ts): climb twists and signature sections banned for leaving the corridor out the TOP (route already
  high), and every reroll short of a bounce test (W1 has two). A spared ban only renames that failure: bans are per roll.
- **Tools** (reference/qa-reports/VARIETY-2/tools/): mixlist.ts (nodeMix's 60 W1 strings asked + bare, raw ask misses, JSON), floorkind.ts
  (each floorless gap's lips), secprobe.ts (G and one section's pieces and pits), repairs.ts (the swap record), fallmiss.ts ('_' asks).
  World 1's falling sections by job: practise twin-bounce; test stair-test-back, bank-stair-test-back (+4); no flow, combine, twist,
  teach or signature section falls (declared exitDy).
- **Traps.** (1) `S=...; (cmd) & (cmd2)` sets S in the background only: the second command wrote to `/` (engine-core 0p trap 6, again).
  (2) A heredoc with regex and template strings can trip the shell's safety parse: write the file with the Write tool instead.

## 0r (0l on t-nodes). The vault and the asks (VARIETY, R-165.197/.198/.200, t-nodes, 11-13): what the next engineer must know
- **Straight up at a vine's top** vaults him toward the side with more ledge (engine.ts vaultSide -> src/game/vineTop.ts vaultSide /
  ledgeOut, the ONE finder; the tower verdict towerVaults reads it too, D19). Every climbing vine the lay makes stands CLIMB_CLEAR (26,
  now in vineTop.ts, re-exported by pipeline.ts) off its bough's end; the finder steps over a gap up to VAULT_GAP (40; the real vault
  lands on wood 56 out, vineTop.test.ts). Until 11-13 it sampled from 10 px and stopped at the first miss: it never saw a cleared bough,
  so the vault went the way he faced (1-4's turn-backs: off the storey above). `npx tsx tools/engine/vaultscan.ts 16`: every stage's vine
  tops old vs new (3,906 fixed, 0 regressed, 0 moved; 2,132 cases on 13 stages land on no wood either way, before and after: the x-10
  arenas, 4-3, 4-9, 5-M: not looked at). w8Lantern.ts keeps its own CLIMB_CLEAR copy (26).
- **Asks as a rule** (pipeline.ts): dealContent fixes a node whose shape/move ask only ONE type of its job lays (askServes) to that type,
  like dealExact; the pick's `keeps`: where any candidate lays every ask (askParts) and is not clamped out, only those are drawn (the bag
  gave every candidate a ticket and a rated node's draws are sorted by difficulty, so the x20 weight lost); with none, a shape ask never
  draws a section against it while a level one fits. Shipped graphs ask nothing: no lock moves.
- **Traps.** (1) RealPlay('1-4', seed) draws from the PROVEN list: its seed n is not library14's seed n. (2) A probe that holds up for 90
  frames walks onto the next vine (a field's foot vine): judge the vault on the frame he lands. (3) `off` vines (a shut gate's) never take
  him: a 'miss' there is the gate. (4) pool short on W1 mix rolls is usually the REPAIR loop's bans (FITS_DEBUG-style log in the report),
  not the deal: fix what drives the repairs first.

## 0q (0k on t-nodes). Node asks (NODES-2, R-165.198, t-nodes, 11-13): what the next engineer on the node code must know
- gen2/nodeAsks.ts holds the designer's asks (`MissionNode.asked`: a token's marks and dials the job does not imply) and the check
  `askMisses` / `hazardMiss`. pipeline.ts: rolledGraph carries `tk` beside `jobs` (as `tv` carries travel; a dropped asked node throws
  by name), applies shape/tempo/rating/dials AFTER the rolled draws (the seed's stream is unchanged), dealContent fixes an asked
  content letter, the section pick weighs sections that can lay an ask x20 (x0.05 the rest), fillSockets' enemy branch takes only the
  node's threat kinds up to their counts (`threatAsks`), and applyVerdicts writes `gen2.dialMiss` (folded by rollErrors as `ask: ...`).
- ELEMENTS (nodeAsks.ts) is the ONE status table: change a status there, run `npx tsx tools/engine/nodekey.ts`, commit NODE-KEY.html.
- The graph check passes `graph: true` (V11/V12/V14 read the realised roll only) and `known` (earlier lessons + the brief's teaches).
- Not built: Later elements (s v p t x, beat, points, named clocks, ^^ @ * as run shapes), the pick, marks inside fork roads.

## 0p (0j on t-nodes). Legs (NODES-TRAVEL, R-165.196 / .197 / .198, t-nodes, 11-13): what the next engineer on mixed travel must know
- **State.** M1 is built and proven on fixtures: right, up and down legs in one stage. NOT built: left legs in a fixture (the mirror
  is written and unit-tested, never laid in a stage), the descent's own turns, forks across legs (M3), the card road (M4), the
  lay honouring the long-form dials (item 10), the tier bots on a stage of legs, NODE-KEY.html cards, the blockcheck gate.
  Plan and report: reference/qa-reports/NODES-TRAVEL/PLAN.md, REPORT.md. Not merged; engine.ts is untouched (engine-hook.patch there).
- **One lay, per-leg state.** `layStage` (pipeline.ts): `legsOf(graph.nodes, graph.flow)` (legs.ts); `routed = mixed(legs)`. A run
  and a tower of one leg have `routed` false and read nothing new. On a stage of legs `flow`, `tower`, `frame`, `floorAt` and the
  run lay's datum (`gy`, `ctop`, `cbot`, `baseline`) are LETS, set by `beginLeg` and closed by `endLeg` at each leg change in the
  node loop. Every `M.corridor` / `M.ground.y` read inside layStage goes through the datum: never add a raw one.
- **A column mid-stage** (`columnFrame`, `columnWalls`, `closeColumn`, `layCatches`): begins where he stands; walls are plain
  `block` pieces just OUTSIDE the frame (`wallIds`: a pit's `deepen` must never stretch one); going up its floor is laid at
  `beginLeg`, going down at `endLeg` (FA's toFloor). The way out is `towerJoin(..., { way })` plus a ledge over the wall.
  tower.ts still reads a tower from x 0: a column's pieces are handed to towerCatches / towerFalls / towerSkips moved by `-frame.x0`.
- **Left** = `reflectLeg` (legs.ts): the leg is laid rightwards `ASIDE` px off to the side, then mirrored about `leftSum / 2`.
  It refuses lianas and puzzle rooms by name. After all legs, a stage that ran left of x 0 is moved right whole.
- **Meta.** `gen2.tower.flow` is 'legs' and `gen2.tower.legs` (LaidLeg: travel, i0-i1, box, `ground` of a run leg, `frame`,
  `floorY`, `turns` of a column). Flags, hearts, quiet time and the clock read `gen2.tower.route` as on a tower. `config.travel`
  is the LAST leg's (unset when it is right). Strays are judged per run leg against its own corridor (`corridorOf`).
- **Engine side** (not applied: B14's token): `towerLead(stage, mode, p)` frames by the column he is in, `routeRatio` is the
  progress bar on a stage of legs. reference/qa-reports/NODES-TRAVEL/engine-hook.patch, 5 lines, `git apply --check` clean on 64bece0f.
- **Proof tools.** `tools/engine/legsmap.ts` (to-scale map, --png); `tools/engine/towerFly.ts` flyTower now flies a stage of legs
  (turns found where he stands; a run leg's landing is the next piece of road, never a pit's floor). Fixtures: gen2/toyLegs.ts
  (UP_CODE, DOWN_CODE, MIXED_CODE; `legsKit(id, code)`); tests gen2/legs.test.ts, legsLay.test.ts, nodeDials.test.ts.
- **Traps.** (1) A fixture stage id must not be a stage of the game (5-95 here; withFixtureConfig throws on 5-3). (2) One brick a
  job means the lay cannot steer the route back: a run brick must END LEVEL or its node strays out of the corridor and the repair
  runs the pool dry ("pool short at slot N"). (3) Size nodes with `chunkSeconds` near one section's seconds (10), or the length
  repair pads one node with 20 copies. (4) A graph code is jobs and shapes: a content letter on two neighbours breaks V11.
  (5) The DOWN column lays and passes the verdicts but does not fly: towerCatches' down branch lays a bough across a turn's vine
  (he stands on it, the vine runs through it), and a vine that leads down is taken in the air past the ledge's tip, never from
  the ground. Rebuild that branch, add the verdict "no wood across a turn's vine", set TOWER.see to 280 (FA's note), then fly.
  (6) In a `( ... ) &` shell line a variable set before `&&` is set in the background only.

Rewritten again at the end of FA (11:36 AM ET, 2026-11-13): branch `t-fa`: gen2 lays a stage UP as a tower (section 0j). Sections below are still true.

## 0j. The tower lay (FA, R-165.170, t-fa, 11-13): what the next engineer on a stage that travels up or down must know
- **One lay.** `layStage` (pipeline.ts) lays a run or a tower; `graph.flow` 'up'/'down' (an ascent by its kind, or `config.travel`) turns
  on the tower branches, every one behind `tower`. A run takes none of them: the lock is 102/102 unchanged. The tower's numbers and pure
  pieces are `gen2/tower.ts` (TOWER, reflectLocal, storeyLimit, routeOf/routeAt, towerCatches, towerFalls, towerSkips, towerFlags,
  flagFurther, flagsInOrder). No stage id, seed or x: a tower's width is `WorldManifest.tower.width` (unset: 1280).
- **A storey is a turn.** `towerJoin`: a section walks on while it fits before the wall and clears what is laid there; else it is laid a
  storey over, a climbing vine between (plan join `turn`), turned back when the wall is near. A leftward storey is the section reflected
  about its entry (reflectLocal: heights kept; the run's `mirrored` is off in a tower). `Gen2Meta.tower.turns` names each turn where its
  vine STANDS (clearClimbs moves a vine 26 px off the ledge's face after it is laid: read `turns[k].x`, never the leg's entry x).
- **No storey is climbed without its vine (the verdict towerSkips).** The frozen WIP laid catch boughs that made a jump ladder past a
  vine and two sections (seed 3). Now every piece has a storey (how many turns were laid before it, `storeyOf`), a catch is laid only
  where no jump (LEAP: generous, the FLOWN 214 px climb plus a margin, never the closed-form DOUBLE_RISE) joins two storeys, and any
  roll where one does is refused by name. TOWER.turn (225) is only 4 px over LEAP.up (221): do not lower one or raise the other.
- **A miss costs a storey (towerFalls).** Every open end and every piece that gives way (a crumbling tile, a creaky limb) has sound wood
  within 450 px under it. towerCatches lays, in order: the piece run on into a near wall; the storey under it run on under the end (a
  bridge); the piece itself run on to the wall; else a shelf under the end. Rough spot, named: on the FIXTURE these read as plain
  boughs wall to wall on many storeys; a designed level's own pieces decide how many open ends it has.
- **Along the route.** `routeAt(route, x, y)` is "how far on" in a tower (a run: x). Flags are Matt's ROLLED_FLAGS measured along it
  (towerFlags/towerFlagBreaches, a flag before every hard node); the opening seconds and the quiet stretches too; the clock walks
  `route.walk` (stageTime.ts). The ENGINE takes flags in the route's order (`flagFurther`, engine.ts, two sites): two flags on one
  storey both count. The hearts by every second flag go in that order too (stageGenerator.ts `flagsInOrder`).
- **The climb camera.** `travelFeet(base, towerLead(stage, mode))` (cameraFollow.ts, tower.ts): feet 80% down on a TOWER that leads
  up, 34% on one that leads down; engine.ts uses it at the framing line AND at both set-back snaps (else the view drifts after a
  respawn). Towers only, on purpose: the 18 shipped climbs and 4-7 keep 55% (towerLead gives them 0), because 80% leaves 108 px
  under him sideways and lava, water and mist rise from there (9-2, 9-7, 4-1, 4-6). Each gets it when rebuilt as a tower or looked at.
- **A gate is a gate (`SectionPiece.sealed`, the lead 11-13, B14's fig gates).** By a sealed piece the lay adds nothing level with it
  or within a hop (no run-on, bridge or shelf: towerCatches `byGate`), never walks on from it (the next section is a storey up by a
  vine standing ON it; if it fits neither way from the tip, its storey starts further back along the piece; else the build throws
  "fits no turn from the sealed piece"), and the verdict `towerGates` refuses any roll where wood at the gate's level or above is one
  hop from a vine top or from the wood under it. Its own open ends are its section's to catch (the foot under them), or towerFalls
  names them. Off unless a piece says so. `GraphBrief.tags` (B14's hook, behind the brief so no shipped stage's data moves): every
  laid piece carries `<uid>:<key>` on Platform.tag / Vine.tag for the stage's own finish.
- **Proof tools.** `npx tsx tools/engine/towerroll.ts --seeds 24 --flow up|arc|down` (each roll's errors by name);
  `tools/engine/towermap.ts` (a to-scale SVG of a roll: look at the lay before trusting it); `tools/engine/towerFly.ts` (flyTower: the
  REAL engine, plain inputs, no rescue; withTowerSim builds a fixture the way the game builds a listed stage);
  `tools/engine/towerstills.mjs` (the fixture on the real page, in place of 1-4, in the page only);
  `python3 reference/qa-reports/FA/planted-faults.py` (every tower rule's planted fault: all CAUGHT).
- **Traps.** (1) A bough laid `over` a vine is NOT main unless it says `main: true`: no flag or animal stands on it, and a hard node
  then has no flag spot (the arc fixture failed "flags: none before the hard node" until its top bough said so). (2) The first-timer
  bot needs rescues on any tower (8 on the hand-built 1-4): use flyTower for "can it be played", the model for the clock. (3) A plain
  flyer runs the fixture in about 105 s where MODEL_FAST says 155-160: the model is a quick PLAYER, the flyer a perfect one; judge a
  level's 2:00 with both. (4) `withTestStage` plants an empty plan list: plant a real one (withTowerSim does) or provenPlan throws.
  (5) Holding jump on the way down opens the leaf: a bot that holds it glides past its landing.
- **Open (each named in REPORT.md).** The descent (flow 'down') lays but most rolls fail "a blind drop" (piece 1b, not built);
  TOWER.see (300) is 11 px more than shows under his feet sideways (289); easyStage's flag pass and topUpFoes read x on a tower
  whose kind is not an ascent (easyMode.ts:517, pipeline topUpFoes): an ascent takes neither path.

## 0k. The vine field's threats and gates, and the stage beat (B14, 1-4, 11-13): what the next engineer on them must know
- **The stage beat is clock.ts's, now wired:** a stage lists `GeneratedStage.clocks` (ClockDef: off/warn/on/rest, offset, easyStretch);
  engine.ts builds them at stage start (`beatClock(defs, easy, t)`, game time kept). A hazard carries `OnBeat {clock, shift}` and reads
  `clock.read(clock, shift)`; `beat.ts beatFaults` is every builder's fairness check (a warn before every on, tells apart). Pods first.
- **fieldPlay.ts runs a field each frame** (pods' tells/hits, torn bunches falling to the wood under them, gates); engine.ts hosts it
  through `fieldHost` (knock = `podKnock`: off the vine, no climb taken while `knocked`, a heart only on cost 'heart').
- **A shut gate is `broken`** (no footing for the platform list; protoArt/terrain already skip broken) with `art: 'hidden'` so fieldPlay
  draws its bough always (one picture, sagging or level); its `ways` (climbs up from it) are `off` and not drawn, its `with` (lay boughs
  at its height) are broken with it. Exit A does not vault under a shut gate (`field.blocksTop`).
- **FIX-15 (11-14): a shut gate is wood from every approach, read against its DRAWN sagged wood** (fieldPlay.ts): `lid(p, dt, x0)` is
  called by engine.ts after every move with his x before it: BESIDE, a move across into the wood stops at its end (span + GATE.lidSide);
  FROM BELOW, the head stop (feet must start more than GATE.stand 4 px under the drawn top: a jump off its own sloped top is not "from
  under"); FROM ABOVE, `footings(x)` hands the engine's floors the gate's own bough at its drawn top (the `with` boughs are not drawn, so
  never footing). `overShut(v, x, y)`: a field vine under a shut bough is not taken from on or over it. Tests: fieldGate.test.ts "wood
  from every approach" (INT-8's TRY lines at both ends of every gate, today's lid planted red). A flag standing on a shut gate's bough
  (or a bough held with it) WAITS for the gate (`FieldPlay.flagWaits`, asked by the engine's claim loop; FIX-15b, the lead 11-14): never
  claimed from on or over the shut wood, claimed on the open bough (fieldGate.test.ts "a flag on a shut gate's own bough", planted red on
  the old claim). TRAP still open: the LAY lets him stand on the shut top from wood beside it (ONTO, 93 of 192 gates); keeping it out
  of the lay leaves 1-4 unrollable (planner.md, qa-reports/FIX-15b/PUSHBACK.md). The clip tool's `gateover` holds the ties after the
  first snap and prints THROUGH / ON ITS TOP / OVER; both must read `never` before 1-4 ships.
- **1-4's finish (w1Arc14.ts finish14) finds pieces by tag** (`uid:key`, FA's `GraphBrief.tags`). Traps: Easy widens `landing`
  pieces (field feet are not landings); the bots need tools/inspect/figPush.ts to read fig work as progress.
- **B14b (11-13):** the two-hand climb is painted (heroClips.ts `climb2Pick`, hero-climb2.json; drawn with its own scale `clip.k`, so
  no code sway rides on it). Tools walk a field stage with its gates open (`vineField.ts gatesOpened`, as kitSolved does for rooms);
  score.ts reads pods by their beat (beatOf) and crumble by height. Gate boughs are `sealed` (FA); a gate field's foot runs GATE_RUN past them.
## 0l. Dot's card: tap to clear, slow fade, +N, teach outranks lessons (FIX-A, t-fixa, 11-13): what the next engineer must know
- **The card takes one touch** (R-165.175, Matt 11-12: "the player can get rid of it at their own pace"). `.dg-bub.in` is
  pointer-events: auto above the touch layer (`.dg-root` z 34 > TouchController z 30, siblings), so a touch on it never reaches the
  gestures: not a punch, not a jump (tools/dotbox/readtime.mjs `tap` counts the game's punch/jump presses around each tap: 0). The
  queue's `tap(now)` ends the card (`why: 'tapped'`, counted as read: its skill is kept and a lesson's next step follows); a tap in the
  first `TAP_MIN_MS` (400) is eaten but ignored.
- **Unread, a card stays `fadeK` x its reading time** (`FADE_K` 3 in the app: DotGuide.tsx sets it; the last 1.2 s is a slow fade,
  `.dg-bub.out.slow`). **The tools keep `fadeK` 1** (tools/inspect firsttimer/castBots/dotPace build their own GuideQueue): they model
  a reader who taps each card once read, so the bots and their calibration did not move. Never set fadeK in the tools without
  re-running tierBots' calibration.
- **+N** is `queue.pending(now, env)`: waiting cards not old news, not held back, not stale. The cards counted at a tap (`tapSeq`) come
  one after another, a breath apart, past the calm gap and the busy cap: he asked for them. A card that arrives after the tap waits as
  before. Tested: a tapping player sees exactly the +N he was shown (src/game/dotTapClear.test.ts).
- **1-1 teaches the tap** (`TAP_HINT`, the keeper's words): on Dot's first card that waits to be read (no move, not urgent, not Pokey,
  no capMs), once a stage, until he has tapped one on this phone (`sloth_dot_tapped`, a device key in storageKeys.test.ts). The Skip
  tips offer never rides on the hint card.
- **`readDone` (the phone's queue only; the tools keep it off, so the bots and their calibration did not move):** a move tip whose move
  is done stays until its reading time (unless it has a `next` step, or a stage teach / hazard / warning waits: then it goes at once);
  a plain lesson waits until the card up has been read before cutting in (a hazard, the stage's teach or a warning still cut at 1.5 s);
  a card cut short goes back marked `back` and is finished: it skips the stale and repeat rules, the calm gap, and waits up to
  `GUIDE.backReadMs` (90 s); the reading time counts from when the card is on screen (`onScreen`, no 1.5 s cap). Each rule came from
  the real page (reference/qa-reports/FIX-A/before-*.txt, after-*.txt), each has a planted test in src/game/dotTapClear.test.ts.
- **No blink:** once her card has been on screen she no longer flies hover-to-perch for it (that hid the card mid-read, 1.1 s on 1-3).
  Known: a perched card slides with the camera; in 3 of 10 scripted 1-2 runs the tap at the mushroom bounce landed where the card had just been and went
  to the game as a punch (tap-repeat-1-2.txt). A card fixed on screen while up would end that; not done.
- **A stage's teach line outranks stock lessons** (R-165.147): waiting, it goes first among its priority (`best()` +0.5); up, a stock
  lesson's move tip that has been read its reading time yields to it and comes back once (src/game/dotTeachRank.test.ts). The P13 rules
  (wait TEACH_WAIT_MS, skip the gap, pass Tips) are unchanged.
- Measure on the real page, not the queue: `node tools/dotbox/readtime.mjs <stage> [easy|normal] [secs] [port] [tap]` logs every card's
  time up vs its reading time; tools/dotbox/fixaStills.mjs shoots the card, About, 1-3's teach and the goal sign upright and sideways.
- Open (R-165.175's row, not in FIX-A's packet): lines held longer while he is busy, and a find that names what was found with its
  picture and stays until read.

## 0o (0k on t-pieces). PIECES (t-pieces, 11-13): pieces any world lays from a table; what the next engineer on a general piece must know
- **The shape of a general piece** (stillLay.ts, lureLay.ts, rideLay.ts): a world writes a table of rows by prop id; the lay file gives
  `xProps` (manifest rows by tag), `xSocket` (the world-neutral socket), `xEmitters` (kit.emit: what a filled socket lays), `xFaults` (the
  fairness check, in words). The look stays the world's (a `note` callback into its extras). kit.emit is the hook: no pipeline change.
- **Only stage-level outputs need a hook**: `StageSink.clocks` -> the built stage's `clocks` (gen2/types.ts, pipeline.ts, by patch), which
  the engine runs through B14's `beatClock`. beat.ts here is B14's file, byte-identical: never edit it on this branch.
- **Open** (reference/qa-reports/PIECES/REPORT.md): ZONES-BY-DATA and CLOCK-ON not started (exact next step there); the ride-only gap needs a 'ride' place
  rule; RIDE.keep unwired; no stills (nothing lays these on the page yet); the full Checks were not run on the head.
- **Traps**: the predator kit clamps every move to the animal's patch (core.ts minX/maxX), at rest as in a charge, so anything "it is lured
  to" must work only while it is after him (lure.ts AFTER_HIM) or it plays itself. A ride does not fit a single jump's gap (114 px on some
  rolls): lay it over a double's. A lift's carry needs `p.y += dy` or he drops a frame behind it going down (the test counts frames). The
  lock is byte-exact on proto extras: moving an emitter must keep its extras' shape (W6 hides, W8 roosts). Patches are regenerated with
  reference/qa-reports/PIECES/mkpatches.sh; planted faults with planted-faults.py (46).
- **Integrated (ENG-INT5, t-eng-base, 11-13):** merged whole; no patch is applied by hand any more. B14's `beatClock` line in engine.ts and
  `GeneratedStage.clocks` were already on the head, so the merge keeps ONE of each (the duplicate import and field were dropped).

## 0h. The stage build's cost (BC-FIX, R-165.163, t-bc-fix, 11-12): what the next engineer on the build path must know
- **buildcheck is the build's budget** (150 ms p95 at CPU x4, 1-1, Normal and Easy). P11's verdicts and Y2's repair took it to 446/430;
  BC-FIX brought it to 105/57 with every result identical (reference/qa-reports/BC-FIX/REPORT.md). Profile before changing code:
  the scratch scripts' recipe is in REPORT.md (CDP Profiler on tools/perf/buildtime.html at x4; vite's line numbers sit a little
  past the source's).
- **landings.ts flies each flight once a stage.** `landingsOf(pieces, setting)` hands back the kept Landings only for the SAME piece
  objects in the same order with x, y, width, height, type and broken unchanged: never build `new Landings` on a hot path, and a new
  field the judge reads must join FIELDS, or a piece changed in place is judged stale (landingsMemo.test.ts is red then).
- **A landing flies only the flights its own events can meet** (windowOnto, mayWalkOnto): events() of one piece never depend on the
  others, so T's own events decide whether a flight can name T. The full sorted event list stays the source of truth: its sort
  comparator ties null-piece side stops with everything at the same frame, so never prune pieces BEFORE that sort (the order inside a
  frame can change); filtering AFTER it (windowsOf) is exact.
- **maxRise() is flown once** (protoCheck.ts): it reads only PHYS. If PHYS ever becomes tunable at run time, that cache must go.

Updated at the end of FEEL-PAIR (11-12, t-feel-pair): section 0i, the draped pair and its feel room; the rest is as it was.

## 0i. The draped pair and its feel room (FEEL-PAIR, R-165.170, t-feel-pair, 11-12): what the next engineer on climbs must know
- **A climb's speed and reach are values on the vine piece** (vinePair.ts): `Vine.climbSpeed` (px/s, up AND down; unset = CLIMB_SPEED
  220, every single climb, unchanged) and `Vine.pair` (the strands' gap; x is between them). climbReach adds half the gap to 54/60, so
  up beside either strand takes both; he hangs at x (between them) with `PlayerState.climbPair` set. engine.ts reads them in the trunk
  grab (~:1960) and the climb (~:2040). The rustle quickens with the speed (rustleGap); a single's is byte-for-byte the old 0.36-0.48 s.
- **Drawing:** protoArt.ts skips a pair in the trunk loop and calls pairArt.ts drawDrapedPair (World 1's painted vine tile, castArt.ts
  vineTile, laid with ropeArt.ts layRope along a path: trailing ends, two strands, a round loop over the bough); a pair's top gets no
  kapok perch (`tops` leaves pairs out). sheetWarm.ts warms the trap sheet for any pair. The hero: heroClips.ts climbU/pairSway (the
  climb cycle 1.5x longer on a pair, a +-0.07 rad sway); there are NO arms-out frames: that is new art (the lead's call).
- **The feel room** (feelPairStage.ts + feelPair.ts + FeelPairClock.tsx): QA build only (`feelPairConfig()` null elsewhere;
  generateStage builds it only with qaBuild()). Entry: title, Settings (gear), About, "Vine pair test", Play; or `#autostart=1&level=
  feel-pair`. GeneratedStage.feelRoom -> engine.ts `this.feel` (control() before the attack step takes a tap by the sign; drawWorld
  draws the sign). RealPlay hosts it with `asQaBuildForTest(true)`. Stills and clips: reference/qa-reports/FEEL-PAIR/shoot.mjs.
- **Traps I hit:** (1) a keyboard press and release inside one frame never reaches the engine (inputEngine keyup clears the buffer):
  hold a key 150 ms in a script. (2) Headless full screen (the game's wide mode) shrinks Playwright's recorded frames to two thirds with
  a grey band: stub requestFullscreen in the recording context. (3) Text under 12 px fails textSize.test.ts (UI-14). (4) The camera's
  vertical ease lags a climb by speed/6.5 px: feet 50% of a sideways view on a single, 45% on a 2x pair; the 1-4 climb camera (piece 5)
  owns that framing, not the pair.

## 0g. World 1's ground seams (RF2, t-render-2, 11-12): what the next engineer on the painted ground must know
- **Soil fills are sampled FILL_INSET (3) sheet px in from every edge** (groundPaint.ts fillSrc). The ground sheets are lossy WebP: fills
  2-3 of every world sit on the lip strip and their last 3 rows are dark (World 1: 60 -> 36), and Worlds 6/9 bleed at side edges. Drawn
  edge to edge every 600 units, that was a hairline along every soil row (1-1's pillars at y 1200, 1-3's floor line at 600). Never
  sample a packed piece to its frame's edge; measure the edge rows (RF2 REPORT has the numbers per world) before trusting "periodic".
- **The floor's lip at a raised bank:** under a short step (< SHORT_STEP, 60) between two floors the floor's lip is drawn AFTER the run
  (stepFootLips), covering the end pieces' clean cut; beside any higher bank it runs LIP_UNDER (60) on under it, drawn BEFORE it
  (lipUnder), so only the gap where the end face curves back in shows it. Without them: a bare box with straight sides at every step.
- **1-1's dip pockets are painted in drawGround (baked squares) with groundDepth**, not live in drawProtoScene: live, laid from the view,
  they were a lighter box between the earth pillars that moved with the camera. Anything drawn live over the squares must use the
  ground's darkening, or be baked with it.
- **Backdrop strips over a chasm** end in stripFoot (scenery.ts): the bottom edge averaged to 48 columns, darker downward. Stretching
  the strip's last rows (the old way) made hard vertical streaks across the bottom quarter of an upright screen.
- Finding a drawer: tools in RF2's REPORT ("Method update"): a per-pixel trace of every draw into the ground squares beats guessing.

## 0d. Rulings and facts to keep (R-165.112, 11-11)
- **A list is never in the main script.** `gen2/proven/seeds-<stage>.ts` (GENERATED) holds the list; `gen2/provenIndex.ts` (GENERATED)
  holds, a stage, its count, its version (`listVersion`, the hash a run's `list` stamp carries) and `load: () => import(...)`. The
  build makes each list a chunk (`assets/seeds-1-1-*.js`) that the service worker precaches (the `js` glob). Main: 3,956,993 B with 200
  seeds and with 355 (it was 3,981,833 with the 200 inside it). `seedListChunk.test.ts` walks the static imports from `src/main.tsx`
  and fails if any reaches a list file. Never import a list file by name.
- **Who loads it:** `loadSeedList(id)` (never rejects; one fetch at a time; a file that is not the one the index names is refused).
  The game asks at the card (`buildAhead.ts scheduleAhead`), at `App.tsx startLevel`, and WAITS in `launchEngine`
  (`seedListSettled`, beside `readyToStart`): at most `SEED_LIST_WAIT_MS` 3 s, once a stage; after a failed or stalled load later
  starts go straight in. Under Node a reader reads the file on the spot (`loadNow`, createRequire): tests and tools need no import.
  A test that must see the page's side plants a source: `plantSeedListSource` (seedListLoad.test.ts).
- **The stand-in.** With the list not in memory, 1-1 builds `standIn('1-1')`: FIRST_RUN_11 (seed 4106, firstRun11.ts, now in the main
  script) by its own plan, so Play never searches, never waits on the network and never plays an unproven layout. The play keeps it
  (`playSeed` pinned in `play11Seed`); the device's shuffled order is not touched. A stage that gets a list later needs its own
  stand-in in `STAND_INS`, or a not-loaded list falls to `provenGen2Stage` (the search).
- **Play pressed before the list is in:** `newPlay11` returns null and owes the draw; `play11Seed` makes it at the build.
  `peekPlay11` returns null until the list is in.
- **The order of a list is its identity.** Layout variant N is the list's N-th seed (first run 4106 = variant 11, Rolls A/B/C, the
  bots' calibration on variants 1-40). To ADD seeds: `seedlist --merge <file> --in-order`, the old seeds first, in place. 1-1 now:
  355 seeds = the 200 in place + 155 after them (reference/qa-reports/R-165.112/list-build.json holds the sweep).
- **Chromium keeps a failed module fetch for the page's life** (measured: 1 request for 3 asks). So after a failed list load the
  session plays the stand-in until the app is opened again, although `loadSeedList` asks each time. A real in-session retry needs a
  fetch()ed JSON list (and its own precache glob): a packet, not done.

## 0e. Lane EN-F, the audit fixes (t-engine-fixes, 11-11/12): what the engine core now promises
- **One take-off (A-04):** engine.ts `groundJump()` is the only ground jump: a press on the ground, in coyote time, or buffered before a
  landing. It judges the spore fog itself (`flightClear`), and the landing's floor effects (crumble timer, a boss's cracking ledge) run
  before a buffered jump leaves; a mushroom always bounces and uses a buffered press up. A new jump modifier goes in groundJump, once.
- **One way back to a flag:** `respawnAtCheckpoint` restarts every run state: the chase (`restartChase`, A-07; the collapse is reused in
  7-6), the tide, the lantern, World 5's stillness (`w5.calm()`), crumbled platforms (`crumbledWhole`, A-03) and latched presses
  (`dropPresses`). A new per-run state is reset there. `softFall` (and heartFall / lanternSetBack through it) also makes crumbled
  platforms whole. `loseLife` and `chaseCaught` do nothing once the run is over (the engine keeps stepping under the Game Over card).
- **Presses never outlive a held world:** `InputEngine.dropPresses()` (latched jump, punch, kick, mega; never a held direction) runs at
  the respawn, on resume and at a guardian entrance's end. realPlay.ts and bossPlay.ts inputs have the same method: keep them in step.
  The reverse holds too: a stage-start clearAll() makes the recogniser and the Pad `restate()` (forget what was said, keep the fingers),
  so a thumb held under the title card steers on its next move. A flag before the chase start gives the fresh chase (chase.ts
  restartAt, A-07b).
- **Paused = one still frame (A-06):** `stillDrawn`; the loop draws once and stops until resume, a resize or a restored context; pause()
  settles the shake. **Failed frames (A-12):** the stage ends once 20 of the last 60 frames failed (a ring), never on a rarer error.
- **The camera's rise cap is a rate (A-05):** 11 px per 1/30 s step = 330 px/s at every frame rate. Never cap it per drawn frame:
  planted, that put his head 70 px under the HUD at 15 fps (cameraBounce.test.ts guards it).
- **Test kit:** `src/game/engineCoreHarness.ts` (the audit's real-engine harness: makeEngine, standOn, step).

## 0d. Lane EN-G, guards (t-engine-guards, 11-11): the loop, saves, the generality gate
- **The loop (R-165.116):** engine.ts `loop()` keeps `acc`, real time not yet played, and plays it in whole 1/30 s steps (at most 3 a
  frame; past that the rest is dropped). A frame within 0.5 ms of 33.3 ms is exactly one step and its hair is let go (so a 59.94 Hz
  screen never slips a frame). `lastRenderTime` is the time of the last frame that ran; the governor, the recorder and the perf log see
  that true gap. Every step is exactly 1/30 s, the same as realPlay's `DT`, so the bots and the browser now play the same physics.
  Proof: `src/game/frameLoop.test.ts` (48-144 Hz, struggling phones, one late frame, a stall). Still open: audit A-05 (the camera's
  11 px rise cap is per update, so a 67 ms frame lifts 22 px; the camera owner's fix) and A-06 (a paused stage redraws every frame).
- **Saves (R-165.117):** saveFile.ts has ONE entry limit, `MAX_ENTRY_CHARS` 16,000. `src/game/saveFill.ts` (a test kit, never imported
  by the game) fills every save key through its real writer at its largest; `saveRoundTrip.test.ts` round-trips it and fails when a
  save key has no filler, an entry passes half the limit, or the file passes 60% of `MAX_SAVE_BYTES`. A new save key: add its filler.
  0.9.5's own saves are `src/game/fixtures/save-0.9.5-*.json` (made by `tools/save/oldSaves.ts` in a worktree of that release).
- **The generality gate (R-165.123):** `npx tsx tools/engine/generalitycheck.ts` (`--list` shows every hit). Engine scope and every
  exemption, with its reason, are at the top of the tool. Its debt is `tools/engine/generality.known.json`: shrink-only both ways. When
  you move a literal into world data or a brief, lower that entry's `count` in the same commit, or the gate fails. Never add to the list:
  put the fact in world data. A new non-test .ts under src/game/gen2/ (outside worlds/) is engine code from its first commit.

## 0d. The generator's yield (EN-Y, R-165.120, 11-11): what the next engineer on gen2's search must know
- **Measure with the probe, never by eye:** `npx tsx tools/engine/yield.ts 1-1 --par 4` (200 fresh seeds a setting, about 60 s; `--from`
  for another range, `--min 50` to fail under 50%, `--json` for each seed's rules). Fresh means above the list's highest seed (61616).
  11-11: Normal 57% / Easy 55% on 50001-50200, 58% / 54% on 70001-70200 (was 9% / 2%). Tune on one range, report the other.
- **The table shows a never-clean seed's FIRST refused roll** (what it always returned), so its rule counts lag the search. To see what
  the later rolls died of, read `gen2.repairs` on the refused stage: each later try adds "roll k, try n: <line>".
- **Where each piece is (pipeline.ts):** `rollUnmet` (the after-rules, with the slot each names), the accept point in `buildRolled`
  (search for "R-165.120: a rolled graph's plan is taken only"), `windowFix` (V19b from the gate's numbers), `supplyDeal` + `unfilled`
  + `poolFits` (the deal and the lay against the pool), `leftShort` and `overspent` inside `layStage` (look-ahead, pacing).
- **The proof no proven seed moved is by construction, then by the gate.** Everything in the accept point runs only where the old
  search would have returned a refused roll. `supplyDeal` and the pool look-ahead run on the first roll too: they act only when the
  pool cannot fill the stage, which a proven roll never had. `seedlist.ts 1-1 --check` is the gate; run it after ANY change here.
- **TRAP, the replay:** Play and the list rebuild a stage from its stored plan (template, mirror, versions, salt, join kind, node).
  Anything a repair changes that the plan does not store makes a stage the list can never replay. Pacing first steered the step's
  direction; that would have failed every new seed's replay. It now changes only the join's KIND. yield.test.ts holds this twice (a
  paced lay laid again from its plan; a repaired clean roll through packPlan). Keep any new steering to what PlanSlot stores.
- **TRAP, the deal's stream:** the deal's tries share one rng; filtering a candidate list changes how many numbers it draws and moves
  every later try. `supplyDeal` runs AFTER the tries, on its own stream (rngFor(seed, 71)), for that reason.
- **Clean is not listable.** seedlist.ts also holds the quiet line (4 s) and the squirrels, outside the generator: 20 of 200 fresh
  seeds list (was 0). Most clean seeds fail only the quiet line. That is the next wall, and it needs the quiet line inside `src`.
  Measure it with `npx tsx tools/engine/seedlist.ts 1-1 --count 400 --worker 0/1 --part /tmp/x.json --from 50001 --to 50201` (a
  --part run writes no list file). A seam with no beat costs quiet time: pacing's flat join is a pit, not a walk, for that (13 -> 20).
- **The joins are the lever for height.** A step leans to the corridor's middle, so low in the stage it climbs and spends the rise the
  climb nodes need. Pacing without the join steering: 35% / 33% clean; with it 57% / 55%.
- **What still refuses (50001-50200, Normal):** V19b 59, floor.unmarked 58 (a seam's catch bough under a thin first piece lets him walk
  off under it: quiet-arrival, log-chain, high-walk), signature short of sections or of rise 47, climb 27 (the corridor's top: the
  stage spends its 900 px of rise before the climb node). sprint-A lays clean 15 in 18; sprint-B 4 in 13, sprint-D 5 in 15.
- **A2, the quiet line in the search (the lead's 7:31 PM ruling):** `BuildRequest.also` is a caller's rule the search asks last and
  repairs for; `tools/engine/listRules.ts` `quietJudge` is the list's quiet line as that rule, and seedlist.ts builds and checks under
  it. `yield.ts --list` measures LISTABLE: 33% on 50001-50200, 28% on 70001-70200 (was 0 of 200). TRAP: a seed listed under `also`
  must be checked and searched under `also` too, or its search is another stage than its replay (seedListBreaches takes it).
- **What caps listable is data, measured:** the two test-backs always break the quiet line (out of the pool: 46%); sprint-B with its
  climb node needs 1,127 px of climb in 900 (1 in 30); sprint-D 0 of 43 until the test-backs go. `supplyDeal` weighs the least
  climb against the corridor plus two soft bands: one band (980) is the natural line and moves two proven deals.
- **Tonight's helpers on this branch:** B = packet E12 items 1-3 (gen2/listed.ts done; hurt floor laid and hurting, not drawn;
  reach.ts JUDGED table, 1-2's rows not entered). C = EN-T (stageModes.ts; camera lead not wired). REPORT.md has each one's next step.
- **Late additions (8:30 PM):** `reach.ts builtOnArcs(stage)`: the arcs judge a stage gen2 BUILT, never an id alone (the level
  check, finishReach and the petal pass ask it; a hand fixture needs a `gen2` record to be flown). `GraphBrief.pits: 'hurt'`: the
  lay puts the world's hurt floor under every section pit past clearStart (briefPits.test.ts, 1-1's own sections). TRAP it found:
  anything laid with a y of its own (a zone's line) must move in layStage's shift-down block, or it is wrong on every rolled stage.
  TRAP the lock found: JSON field ORDER is part of a stage's fingerprint; write new fields where the old ones were written.
- **Next, in order of what it buys:** park the two test-backs and rebuild the list; more rising signature pieces; pacing from the first roll (moves proven seeds: the lead's call,
  at a list rebuild); the window read where the gate reads it (67% of x, the highest piece there) instead of by slot; the deal
  weighing height (a test dealt climb beside a climb node cannot fit the corridor).

## 0e. The piece library (EN-L, 11-11): a stage's brief, not its sections, says what it is
- **Four things are the brief's now, applied by the lay (gen2/types.ts GraphBrief; nothing shipped sets them yet):** `pits` ('hurt': a
  hollow under every section pit; 'lesson': only under sections that teach or use the hurt floor's lesson), `petals: 'low'` and
  `offRoad: 'fruit'` (fillSockets), `trend: 'level'` (a seam's step and the pick lean to the start height, pipeline LEVEL_SWING), and
  `pick` (stagePool: the whole library by need; `feel` only excludes through `pick.refuse`, which also empties a socket whose
  `allow` starts with a refused name). Tests: briefPits, briefPickups, briefPick (gen2/), each on 1-1's OWN sections and proven plans.
- **The proof is a tool, run it before and after any change here:** `npx tsx tools/engine/library.ts --seeds 120 --par 3 --flown`
  (1-2's brief from World 1's sections plus the chain bricks; 11-11: 61% / 56% clean but for the unpainted thorn bed, 0 throws).
  `library-where.ts <from> <n> [regex]` names the section behind each refusal: read it before guessing.
- **TRAP, the corridor's middle:** a step join leans to the middle of `manifest.corridor`. World 1's sits 410 px over its floor, so any
  World 1 stage that is not `level` climbs at every seam whatever its sections do. A level stage also needs room UNDER the floor
  line (World 1 has 80 px): a per-stage corridor row is not built; the tool overrides it test-side (ROOM_12).
- **TRAP, a height complaint:** print each laid section's entry and exit height first (two guesses cost 15 minutes here).
- **One brick, two worlds (A13):** `SectionPiece.slot` + `WorldManifest.slots` (gen2/brickSlots.ts helpers, test-only). Nothing draws
  `PlacedPiece.art` yet; boughs and mushrooms have no inventory key. The inventory files came unchanged from t-engine-inventory.
- **Still welded:** World 1's `feel` lists hold stage ids until 1-1's brief takes `pick` and its list is rebuilt.

## 0f. Tonight's pieces wired on the 1-2 path (EN-W, 11-11 late): what the next engineer must know
- **The thorn bed is found and painted** (`w1Pits.ts`: `findW1Pits` kind `'hurt'`, read off the piece gen2 marks `pit: 'hurt'`;
  `drawW1Pits` paints the pit's dark and the two cut brambles, `src/assets/props/pits/w1-thorn-*.webp`). So `drop.look-lies` passes on
  World 1, and the search stops dead-ending on every plan that holds a hollow: 1-2 on flown rows went 0% strict to 118 of 120.
- **1-2's double is counted by the built stage** (`LevelConfig.doubleTaught`, set by `planBudget` from the world's `lessons`, an
  earlier stage only; `doubleAllowed` reads it). No shipped config carries it.
- **Read before quoting an unflown number:** a stage with no JUDGED row (reach.ts) lays to the unflown reach (230 px double; three
  World 1 sections ask 253-256 and THROW) and carries `NOT_JUDGED_ALL` (pipeline applyVerdicts): its "clean" is not the verdicts'.
  1-2 needs its own flown rows before `library.ts` without `--flown` means what `--flown` means.
- **The engine steps one `StageClock`** where `gameTime += dt` was; `gameTime` is a view of it, read AND written through the clock
  (`engineClock.test.ts`): harnesses place game time (`realPlay.ts` `t`, `tools/perf/frozen.mjs`), so never copy the clock over it. No
  stage declares a clock yet: serve `ModeHost.clock(id)` from `this.clock.read(id)` when a brief carries `clocks`.
- **Look, not done:** a hollow under about 70 px wide reads as a column of roots (the banks' end faces meet over it, the ground
  painter); the slab's left end face peeks; the pictures are not in the stage preload. REPORT.md "Polish check" has all of it.
- **To see a hollow in the real page:** a worktree, `tools/engine/library.ts` copied into `src/game/gen2/` without its main block, and
  `stageGenerator.ts` building 1-1 from `kitLib12({ flown: true })`; then `tools/engine/runs/stills-at.mjs` (layout 2, x 26180, 27930).

## 0c. Rulings and facts to keep (INT-1-1, 11-11)
- **The help promises only what gets him through** (the lead's ruling): `engine.canGrowAt(piece)` = something grows AND
  `stepPlan(...).unsolved === 0`. HelpLadder's canGrow is that call (Easy's step at 8, Normal's offer at 12, the re-ask). The pieces where
  nothing can grow are listed by the sweep and stand as they are.
- **Pads** are the gap less 2 x PAD_EDGE (50), PAD_W (60) the least (the lead's ruling: a 60 px pad was overshot from the lip, 3868 N
  w1-two-answers, pinned in helpLadderPieces).
- **A hollow log is road** in `roadBoxes()`: gen2 lays its platform the art's full height (pipeline.ts ~:1164), so its inside does not
  let him through today, though w1NewArt.ts says it should. Open (a suggested Engine packet).
- **Stair builder rules on the new layout** (A/B over 200 seeds x 2, reference/qa-reports/INT-1-1/ab/): KEPT catch boughs not road,
  hidden log, stump take-in, pads, BOUNCE_NEAR/ALONE; DROPPED the narrow-stump swap and the sliver trims. Faces: `rise > STEP_LEFT`.
- **Dot's ladder lines** (dotGuide.ts `anyway`, helpLadder.ts, DotGuide.tsx): such a line goes first in her queue, even in danger (he
  blinks 1.2 s after every set-back, which is danger, and her clock stands still then), with no breath gap; pushHelpLine clears the
  stage's own engine tip at once; passedLine takes a ladder line down at once; the engine's 8 s (LINE_UP_S) count from when her bubble
  first shows it (helpLineOnScreen from DotGuide; RealPlay reports at once; LINE_WAIT_S 30 if never shown). While a ladder is on
  (helpLadderOn) the old stuck helper ("This way, Pokey!") is quiet. A ladder line hovers in the band under the top HUD (DotGuide planFor),
  and the grown steps are hard keep-outs for her bubble (grownRects, from helpLadder.ts setGrownSteps). Proof scripts: the Critic's
  proof.mjs (LINE='A step') and overlap.mjs, pace.mjs.
- **The camera in a bounce or a double** (engine.ts updateCamera): from his climb, the height he will top out at (`topY`); once that is
  past one jump's rise over the height he left (`lift`), refY ramps to it and the view moves to keep him under the HUD band, never more
  than CAM_RISE_STEP (11 px of world) a frame, and back down after it the same way (`camLifted`). Hops are unchanged. Prove any camera
  change per engine frame (delta2/camworld.mjs, the Critic's cam.mjs), never from a still: the first version snapped 44-72 px in a frame.
- **The sweep:** `npx tsx tools/inspect/helpSweep.ts --fly`; the suite runs the breach sweep on all 200 seeds and flies every 10th.
  Every help flight runs on the engine's real loseLife and fails on any `lostLife`. RealPlay answers the offer no unless a test sets
  `e.helpAsk`.
- **Judging a shipped stage in a test:** `validateAsJudged` (levelCheck.ts): 1-1 on its flown arcs, everything else the closed form.
- **The tier bots' pin** (tierBots.test.ts) reads calibration-main.jsonl, recommitted on the re-lay; the 0.9.5 runs the bots were
  calibrated on are calibration-0.9.5.jsonl. On the new 1-1 the table no longer matches the testers (by design): re-measure after a
  play window.

## 0a. Rulings to keep (R-165.61, ADR-001/002, packet E0a, 11-11)
- **THE BOUNDARY: the flown reach and the verdicts gate 1-1 ONLY** (`reach.ts judgedOnArcs`). 5-7, 5-9, Worlds 6-8 and the old
  generator keep physics.ts's closed form byte for byte; their `gen2` gains `verdicts` (every name `notJudged`) and `drops`, nothing
  else. `lockall.ts` hashes `gen2` without those two fields and prints which stages gained them. Proof: verdicts.test.ts pins 5-7 and
  7-1 against main's hashes; `lockall --check tools/engine/lockall-main-0.9.5.json --intended 1-1` -> 101/102 unchanged.
- **A roll is accepted only by name.** `gen2.verdicts[setting]` is a `RollVerdict` (judgeRoll); a refused one's lines are folded into
  `gen2.errors` as `verdict <name> (<setting>): <line>` (rollErrors), so every old reader (provenGen2Stage, the seed list, Play) refuses
  it. An Easy build carries Normal's verdict too. `first-run.drift` is judged on firstRun11.ts by `seedlist.ts --check`, never per roll.
- **One promise registry** (`promises11.ts PROMISES_11`): floor.unmarked (both settings), teach.double-* (Normal only, by `settings`).
  The pipeline judges it; seedList.ts and the seed tool read the verdict. No substring filter anywhere.
- **The numbers are the Designer's** (reference/specs/reach.md, bands.md at t-designer-reach@030a4093). reach.ts is data with a
  `source` per row; a figure you think is wrong is a PUSHBACK, never an edit.
- Raised gaps were not flown: on 1-1 a landing more than 20 px up keeps the closed-form envelope capped by the band (`gapFor`), and
  validateStage adds flown links for level jumps only (`opts.arcs`). Name it if you change it.

(A1 and A2 rulings below, from their own runs; before them: the 0.9.5 porter's run, merged through PR #63 and #64.)

## 0. Rulings to keep (R-165.86, the lead, 11-09)
- **No fall in 1-1 costs a life, on Easy or Normal.** It is stage data: the 1-1 brief's `softFalls` (types.ts `GraphBrief`; w1.ts
  `briefs['1-1']`) -> `Gen2Meta.softFalls` on the built stage (pipeline.ts, beside `rise`) -> `softFallStage(stage)` (pipeline.ts) ->
  the engine's `softOn` (engine.ts, where the stage loads). Never a stage name in the engine, never a WorldManifest flag.
- **The word lays nothing.** No zone, no platform: 1-1's ground, `heartFalls` and `gen2.falls` are the same with and without it
  (softFalls11.test.ts proves it on listed seeds and raw rolls). So `floorlessGaps` judges 1-1 against the level-block put-back zones
  only, as before, and "an unmarked floorless gap drops the roll" still bites. Do not teach floorlessGaps or lethalSpans to read it.
- **`isGen2Stage('1-1')` is FALSE.** 1-1 is not in GEN2_STAGES (gen2/game.ts: 5-7, 5-9, Worlds 6-8); it is built by `gen2Roll11`
  (stageGenerator.ts ~:2870). So 1-1 on Easy had `softOn` before this task, through the hand-built stages' rule; only Normal lost
  lives. To ask "is this a gen2 build" read the built stage (`!!stage.gen2`).
- Water still costs a life (the engine's water checks come before the fall check). 1-1 lays none today.
- Normal's bite starts at 1-2. After this, a pit in 1-1 looks the same as a deadly one elsewhere: R-165.61 and the re-lay (B1) own that.

## 0b. Rulings to keep (R-165.62, the lead, 11-09 / 11-11)
- **The help ladder (src/game/helpLadder.ts) is the ONE place that decides help in 1-1.** Put-backs counted per piece (the piece at the x
  of the fall, meta.pieces); reset by standing past the piece (one compare a grounded frame) or the stage ending; never by a pause, time,
  a refused offer or a step given. Easy 3 move line / 5 pad tap = full jump / 8 steps grow; Normal 3 move line / 12 offer, re-ask 8
  after a no, never after a second no; a yes grows Easy's steps. Off on every other stage (`this.help` null) until help.md §5 passes.
- **The step (the lead's ruling 11-11, after the Critic's find; "height = rise - 60" made 118 px walls at mushrooms):** read the piece's
  walking surface (`skyline`: no catch pieces (the builder's `catch` mark), no piece wholly under a floating one, ground kept under a
  resting stump, mushrooms are road). Every rise over 60 is a STAIR of rocks on the ground, faces spread evenly and all 60 or less,
  treads 80 (top 160 where it fits), top within 60 of the lip; never over air or a floating log; a mushroom whose bounce alone
  (BOUNCE_ALONE, 80% of bounceV^2/2g) reaches the lip grows nothing. No room for a whole stair: nothing grows (counted by the sweep).
  A plank (marked `plank`, may float) only in a gap the last <=60 jump can't clear. Added only through `engine.addStep()`, which copies
  `platforms`/`drawPlats`/`paintedPlats` (platforms starts as the stage object's own array: never push into it). Cleared in `stop()`.
  Gates: helpLadderSweep.test.ts (138 seeds x 2: no rock in the air, no face over 60), helpLadderPieces.test.ts (plain jumps after).
- **Dot's ladder lines are struggle help that is due now** (`helpGuideLine`: kind struggle, `soon`), queued by DotGuide.tsx engineLine
  through `pushHelpLine`, which first clears the stage's own engine teach tips. On Help and Tips; never on Quiet (the step and the offer
  still happen there). Her tip rules dropped them before (a move already taught; Tips' 30 s gap).
- **One step sprite** (`STEP_CUT`, the mossy rock), and the offer's YES picture draws it (the story keeper). A ladder line comes down
  8 s of play after it is said (`LINE_UP_S`; her clock holds while he blinks) and as the offer opens; nothing is said after a no.
- **The offer pauses the stage** (`helpAsking`: update() returns, resume() keeps it still) and waits until the set-back's iris is open
  and he stands (`helpDue`): asked over the closed iris, the stage behind it was black. Back and Escape are a no (HelpOffer bindBack).
- In 1-1 StuckWatch never speaks ("Too tall" breaks story guard 1) and "No soft moss up here!" is marked heard at load (it comes from
  w1.ts's `hint.1-1.noMoss` sockets, not mixer/stages.ts, whose line is also gone).

## 1. What's open (each has an R-id on reference/ROADMAP.md or a note)

| What | State | Where |
|---|---|---|
| R-165.86 (A1) on `t-engine-putback` | Passed; ships with A2 | REPORT.md on that branch; reference/qa-reports/R-165.86/ |
| R-165.62 (A2) on `t-engine-help` | Built; waits on the story keeper (lines and pictures in qa-reports/R-165.62/) and the Critic | REPORT.md on the branch |
| Help past 1-1 (failures counted through lives and game overs, the extra-lives offer made one system with the ladder) | BLOCKED on the Designer's help.md §5; assist.ts and GameOverCard.tsx untouched | PACKETS.md E2 |
| The ghost that shows the move; help.md §2's seconds triggers | Cut from test link A; later packets | help.md |
| The window's repeating "Flick up and forward to jump." | Not reproduced in 4 flights on A1+A2 (said at most once: the coach's jump step); no file edited | REPORT.md |
| Rises with no room for a whole stair grow nothing (228 Easy / 253 Normal over 138 seeds' pieces) | Open: the lead's call (planks?) | REPORT.md |
| The harness's `died` in 1-1 on Normal | OPEN. RealPlay notes a fall through its loseLife stub; in 1-1 a fall is now a set-back on both settings (as it always was on Easy), so `died` stays false there. Tools that read it on 1-1 (realReach, plainWalk, firsttimer, tools/validate/play.ts) see a set-back, not a death. RealPlay should note set-backs too (realPlay.ts was not mine to write) | REPORT.md Suggestions |
| The set-back under a rise lands on the low catch branch when he touched it on the way down (the last ledge he stood on) | As Easy has always done; from it he steps back up to the take-off log. Watch it in the A2 work | engine.ts softAt |
| Main JS chunk headroom (R-165.103, R-165.112): React, react-dom and scheduler in a static 'vendor' chunk; each proven seed list in its own lazy chunk; `tools/perf/chunkcheck.mjs` holds every JS chunk to 3,994,304 B | On t-engine-seedchunks: main 3,957,009 B (37,295 B under the gate), whatever the lists hold. What grows main now is code and inline data, not seeds. OPEN: gen2/seeds.ts (the curated rolls, 244 KB of source, imported by gen2/game.ts) is still in main: the same move would free it (reference/qa-reports/0.9.5/lazy-seeds.py is the old, now stale, contingency) | reference/qa-reports/R-165.112/ |
| Branch share of thin landings at most 30% a roll (the designer's Round 11) | OPEN. 0.9.5 shipped without it by the lead's ruling (A), because Matt played the same mix on 11-05. The 138 listed rolls read median 48%, worst 65% (branch / solids 30 px tall or less, both settings). `floorRoll.catchStyles ['log','branch']` is NOT in the w1 kit. On seeds 1-40 it alone left 15 of 22 rolls over by that count. The planner counts pieces up to 60 px; agree ONE measure first | R-165.46 |
| **1-1 after E0a: every roll is refused until C1's re-lay** | The 138 listed seeds are all refused (band.out, block.lesser-passes, teach.double-no-gap-after on every one; see REPORT.md). Play's 1-1 throws on this branch alone: never merge E0 without C1 | R-165.72 |
| 1-1's proven list: 355 seeds (11-11, R-165.112; over the 300 target `SEED_LIST_TARGET`); the floor `SEED_LIST_MIN` is still 100 | OPEN: put SEED_LIST_MIN back to 300 (the Designer's number, the lead's call). More seeds cost nothing in main now: sweep past 90000 and add them `--in-order`. The suite's whole-list tests (helpLadderSweep, w1.relay) grow with the list: sample them before the list reaches thousands | R-165.47 |
| Soft floors under the 6 floorless spots | Not in 0.9.5 (the planner's; the lead's ruling: next week). The list filter (`floorlessGaps`) keeps unmarked floorless rolls out meanwhile, and it stays in permanently | gen2/promises11.ts |
| The double TEST band 205-228 px and Easy's twin versions | Held. Every double gap is laid in the TEACH band 195-203 (`DOUBLE_TEACH`), because a level double reaches 204 px on some budgets. The test band waits on per-version Easy twins (rise 110-114 px) | w1.ts `DOUBLE_TEACH`/`DOUBLE_TEST` |
| funcheck findings that held 0.9.5 from going live | Logged by the lead after the merge | R-165.48-.51 |
| Round 10 patch (quiet arrival / sunlit log / last step up: the walk-on 100-130 px) | Not applied. #15 needs an honest `exitDy` with it; re-check it applies (w1.ts moved since) | reference/qa-reports/engine-core/held/round10-walk-on.patch |
| #44 version a becomes `d d b d` | Not done | w1.ts |
| The kit's `squirrels()` decor sockets | Dead data: the pipeline fills only the bootprint decor. The real squirrels come from `w1Squirrels`. Delete the sockets when a list rebuild is planned anyway (removing them may move rolls) | w1.ts ~:120 |
| 4-9 layout 4's dead log stair (ids 86-89) under its branch bridge; 1-3 Easy dressing behind step branches; 6-1 and 8-1 platforms inside the HUD band | Live defects, open | reference/qa-reports/engine-core/NEXT.md |
| The art inventory (R-165.104 C, 11-11): `src/game/art/inventory.ts` + `inventory/w1..w10.json` (each world's level art, 120-230 KB, about 24 KB gzipped) and `inventory/cast.json` (characters, enemies, pickups, UI, backdrops: 1.7 MB, never needed at a stage build). Each is its own lazy chunk: `loadInventory(world)` or `loadInventory('cast')`. Not wired into any stage yet: C2 does that. Regenerate with `python3 tools/art/catalog_master.py --emit` after every `--merge`; never hand-edit. Queries: byId, byWorld (made things never W1 unless includeMade), bySlot (slot keys, not the csv's prose), gaps (ask world N's file) | Built, not wired | src/game/art/ |
| CoachOverlay (old 1-1) still shows coach.jump's old words and the cut coach.nice | Open (the planner's note) | reference/notes/planner-status.md |

`reference/qa-reports/engine-core/NEXT.md` is the 11-05 queue. Some of it is done since (ownLook and the art swap, the double tags via
gapPx/blocks, `stage.ts --roll` fail-closed). Read it for the open findings at its foot, not as a to-do list.

## 2. Where each thing lives

**Play path (1-1 is gen2)**
- `src/game/stageGenerator.ts` (~:2888):
  - for 1-1, every pick but 'old' builds `w1Finish(buildPlayStage(config, w1World(), seed, difficulty))`;
  - H1 (hearts follow risk) and the Easy goal are applied there.
- `src/game/gen2/seedList.ts`:
  - `buildPlayStage` replays a proven plan, else falls back to `provenGen2Stage`;
  - also holds `provenSeeds`, `provenSeedFor`, `seedListBreaches` (what `--check` runs), `packPlan`, `SEED_LIST_MIN`, `SEED_LIST_TARGET`, `QUIET_MAX` (4 s, binding).
- `src/game/gen2/proven/seeds-<stage>.ts` and `src/game/gen2/provenIndex.ts`: GENERATED (tools/engine/seedlist.ts through seedlistFile.ts), never edit by hand. The list file: each seed with its packed plan, quiet and outro. The index: count, version, loader (section 0d).
- `src/game/testlink1_1.ts`:
  - `pick11()` returns 'play' | 'old' | 'A' | 'B' | 'C';
  - `newPlay11` / `peekPlay11` / `play11Seed` / `clearPlay11`;
  - a per-device shuffled order in localStorage `sloth_play11_order`;
  - `pickerOn()` needs a QA build and `?pick11`.
- `src/game/testlink1_1.json`: Rolls A/B/C, QA-only seed pins (172, 15458, 26525). Each MUST be on the proven list; re-pin from the list whenever it is rebuilt.
- `src/game/buildAhead.ts` with `stageGenerator.buildAhead` / `aheadKeys`: builds the next stage ahead while the map is open. `WorldMap.tsx` schedules it (deps `[pickedOpen, picked?.id]`), and `App.tsx` too.
- `engine.ts`:
  - the recorder moments 'gen2' (stage, seed, setting) and 'launch' (sheets, timer, build, ready, total);
  - heartFall's soft branch: a `heartFalls` zone with `soft` calls `softFall`, with no heart lost;
  - `softOn` (set where the stage loads): the whole-stage soft fall. On for a stage whose brief says `softFalls` (1-1, both settings), and on Easy for hand-built and old-generator stages. `softAt` is the last still ground he stood on (solid, 60 px or wider, not a narrow piece he fell onto); `softFall` sets him back 150 px or half the ledge clear of the edge, cuts the camera once behind the iris and records `softFall`.

**World 1's kit and finish (`src/game/gen2/worlds/w1.ts`)**
- Section data: HARVEST + W1_NEW. Round 12 sections map to their bases through `R6_BASE`, so JOBS/CONTENT/TERRAIN fall back to the base's.
- `w1Finish`:
  - `ownLook` on every piece;
  - the cut-art swap (`Platform.cut` from `w1CutArt.ts`; a stone or stump only where ground meets its foot);
  - then `w1Squirrels`.
- `w1Squirrels`:
  - at least `SQUIRREL_MIN` = 3 from w1-new, poses shuffled by the seed;
  - one on the spawn's ground, one per rest bank, the rest of the minimum on the spawn's ground;
  - a spot must be the top of a bank (90 px or deeper), with nothing solid in the squirrel's box and no pickup, flag, hint or exit within 70 px;
  - it THROWS when too few fit, and only runs on a built roll (`st.gen2`).
- `src/game/gen2/promises11.ts`: `PROMISES_11` (the one registry), `floorlessGaps`, `doubleGap` / `doubleAfterTeach` (on the flown
  arcs: one jump at its best fails, a double flick from 70 px crosses), `promiseBreaches11(st, setting)`.
- `src/game/gen2/reach.ts`: FLOWN_ARCS, APEX, BANDS (+ BAND_SOURCE), SPARE, TAKEOFF; `linkArcs` (what a player can do, the flick),
  `lesserArcs` (the lesser move at its best, hold / any timing), `gapEnvelope` / `riseEnvelope` / `bounceLipOverCap` (the lay on 1-1).
- `src/game/gen2/verdicts.ts`: `classify` (a laid jump -> SectionKind), `askVerdicts`, `dropVerdicts`, `untypedVerdicts`,
  `firstRunVerdicts`, `judgeRoll`, `NOT_JUDGED_ALL`. Types: `verdicts.types.ts` (the Architect's, frozen: byte-identical to c4687177).
- pipeline.ts: `gapFor` / `riseCap` (1-1 reads reach.ts; others maxGap / riseLimit), `LocalAsk` -> `Laid.asks` (each laid jump's
  take-off, landing and move, kept in a WeakMap, not on gen2), `dropsOf` (a Drop per fall: ends from the engine's rule, look from what is
  drawn), `judged11`, `applyVerdicts`; `blockBreaches(laid, platforms, arcsOf?)` uses the flown lesser move on 1-1.

**Tools**
- `tools/engine/seedlist.ts 1-1 [--count N]` writes the list. Every kept seed passes all of these:
  - no gen2.errors on both settings;
  - the promises;
  - squirrels on both settings;
  - the quiet line.
- `--check` is what CI runs. It re-checks every listed seed (promises, quiet, squirrels, flags before hard nodes via `seedListBreaches`).
- PARALLEL BUILD (use it, single-process is about 40 min per 100):
  ```
  for i in 0 1 2 3; do npx tsx tools/engine/seedlist.ts 1-1 --count 400 --worker $i/4 --from 1 --to 90000 --part $S/p$i.json & done; wait
  npx tsx tools/engine/seedlist.ts 1-1 --count 300 --merge $S/p0.json,$S/p1.json,$S/p2.json,$S/p3.json
  npx tsx tools/engine/seedlist.ts 1-1 --check
  ```
  `--merge` re-lays every seed through the CURRENT code's filters. After any engine or kit change, re-merge the old parts instead of rebuilding from scratch: only the failures drop.
- `tools/engine/lockall.ts --layouts 16 [--stages ...] --check <main-lock.json>`: every stage's layouts against a saved lock. Take the base lock from main BEFORE you change anything. "N/102 unchanged" names each changed stage and its fields.
- `tools/engine/stage.ts`: one stage's gates. `--roll A|B|C` is fail-closed: a child without the pick is a FAIL (rollEnv.test).
- `tools/art/packcut.py`: builds the `w1-cut.webp`/`.json` atlas (18 pieces). `w1CutArt.ts` was tester-page's; in the 6-role team it is Engine's (draw code), with the art from Content.
- `src/game/artUse.allow.json`: art that is packed but not drawn. It only shrinks. When you start drawing a piece, take it off (artUse.test tells you which).

**Reports**
- `reference/qa-reports/engine-core/`:
  - `squirrels/`: stills, 2 rolls, upright and sideways;
  - `art-swap/`;
  - `bootprint/`;
  - `soft-gap/`;
  - `live-dips-to-judge.txt`;
  - `NEXT.md`.

**Help ladder (R-165.62)**
- `src/game/helpLadder.ts`: the schedule (RUNGS), the lines (help-lines.md word for word), `HelpLadder`, `stepsFor`, `padFullJump`
  (padControl.ts reads it at both Jump-button calls), `helpGuideLine` / `pushHelpLine` (DotGuide.tsx engineLine).
- engine.ts: built where the stage loads (`this.help`), `helpPutBack` from `softFall()`, `addStep`, `askHelp`/`answerHelp`,
  `helpState()` (tests and stills), `helpAsk` (HelpOffer.tsx, loaded on first ask; tests replace it).
- `src/components/HelpOffer.tsx`: the pop-up and its two pictures. clipcheck reaches it through a NODE_ENV=development build (the
  dev-only `window.__engine` drives real put-backs); startServer fails if the production build carries `__engine`.
- Tests: helpLadder.test.ts (schedule, planted 4/6/9/13), helpLadder11.test.ts (real put-backs, seed 3747, both settings, Quiet),
  helpLadderGuide.test.ts (her bubble), HelpOffer.test.ts. Stills: reference/qa-reports/R-165.62/shoot.mjs.

## 3. Traps I hit (each cost real time)

0. **Timing a stage start from a scripted tap.** The orchestra's ~100 samples load and decode around the intro; a tap that lands while they are still decoding reads 300-900 ms slower. Wait for the resource list to stop growing before the tap, interleave the two builds, and swap their ports: one batch of 10 is not enough (spread about 2 s at CPU x4).
1. **A gate that passes on the wrong build.** The lock, the suite and stills read whatever build you point them at:
   - vite preview served a stale build;
   - `window.__engine` is overwritten in dev (engine.ts ~:833), so scripts need a `typeof` check;
   - a teleport harness skews any timing measure (lesson timings, Dot lines and the struggle line fire on teleports).
   Check the seed and the build in the output, not the exit code.
2. **Seeds proven on old code don't stay proven.** Any change to the kit, pipeline, Dot or flags can break listed seeds (the Dot fix dropped 2 of 100 through the flag check). Run `seedlist --check` after every merge that touches gen2, and re-pin Rolls A/B/C. Roll B's 110867 silently broke V19.
3. **A post-pipeline pass that can throw needs a matching filter in the list builder.** Play calls `w1Finish`; the builder doesn't. I added `dresses()` to the builder and to `--check` so no listed seed can throw in Play. Do the same for any new finish step.
4. **The yield is tiny (about 0.4%).** The default cap (`count x 200` seeds) can't reach 100 at that yield. Use `--from/--to` and workers, and budget the time before promising a count. Measured 11-11 on INT-1-1's code: seeds 1-90000 on 4 workers (`--worker i/4 --count 100000 --from 1 --to 90001 --part pN.json`), 381 kept, 2,660 s a worker with the suite running beside it (45 min).
4a. **The relay test's (b) and (c) are NOT in the list builder** (w1.relay.test.ts: room for help at every rise, put-backs before the need). 26 of the 381 swept seeds fail them and were left out by hand, as C1 left out 25: run the relay test on a candidate list (print every bad line, not its first 10), drop the seeds it names, `--merge --in-order` the rest. Until those two are a filter in the builder (a packet: they live in a test file), every list build repeats this.
5. **Measures need one definition before they're a bar.** The branch share read 48% my way and 24% the planner's way (30 px vs 60 px pieces, and catchStyles on or off). Settle the measure in the spec before anyone filters on it.
6. **Recorded facts in tests go stale when a dependency re-measures.** goalsEasy.test held 5-9's old kid runs after the planner re-measured them; firstTimerBot.test holds the live record. Update a recorded fact with its source commit. Never loosen the assertion (law 22).
7. **Merges with the planner's branch.** We both added `gapPx` to softGap/gDoubleGaps; keep the side with the default (`DOUBLE_TEACH`). `proven/seeds-1-1.ts` and `provenIndex.ts` always conflict: take yours (both files together), then re-merge or rebuild.
8. **Things I wrongly assumed:**
   - `isGen2Stage(1-1)` broke Easy's soft-on; tests read gen2 from the built stage (`!!stage.gen2`) instead.
   - roofedDrop must run on gen2-built stages only (4-9 stays as main).
   - Raising gLogHop made the quiet line worse; the designer's 34-46 stands.
   - Unmirrored stairs made vault pits; mirrored stair tests caused 7-9 s quiet stretches.
   Bisect before blaming a branch.
9. **RealPlay swaps the engine's `loseLife` for a stub** (realPlay.ts ~:141: it only sets `died`). A test that says "no life lost" or "lostLife never written" passes on ANY build unless it deletes the stub first (`delete r.e.loseLife`; softFall11.test.ts `real()`). Its planted run must lose lives.
10. **A layout number is not a seed for 1-1.** `new RealPlay('1-1', n)` plays the n-th listed seed. To fly a named seed: `withPlaySeed(seed, () => new RealPlay('1-1', 1))`. In the browser: put the seed's list index first in localStorage `sloth_play11_order` and call `__play('1-1', index + 1)` (reference/qa-reports/R-165.86/shoot.mjs).
11. **A frozen input can be wrong even after three Critic rounds.** R-165.86's said Easy had no soft falls in 1-1. Measure the claim on origin/main in the real engine before building on it (15 minutes; it changed the red run).
12. **A toy stage hosted in `RealPlay('1-1', ...)` inherits 1-1's rule: every fall is soft.** A toy that needs a deadly pit sets `e.softOn = false` itself (softFall.test.ts) or is hosted elsewhere.
13. **The container restarts.** It killed a final suite mid-run once. Push safe-keeping commits as soon as they're worth keeping; a release still waits for the word.
14. **Shell.** `rm -f $VAR/*` is refused by the safety check: use literal paths or `"${VAR:?}"`. Foreground commands time out at 2 min; long runs go in the background, with an `until grep` wait.
15. **An engine line is not a line on screen.** Dot's guide (DotGuide.tsx -> dotSay.ts -> dotGuideHelp.ts, then GuideQueue's calm
    gaps) re-judges every `guide()` text as a stage tip: a known move is dropped on Tips, Tips waits 30 s between lines, and a move
    tip stays up until the move is done. RealPlay's `said` records what the engine sent, not what she showed: read `.dg-bub-body` in
    the browser before calling a line done.
16. **After steps grow, the walk-off put-back climbs the step.** Drop him from under the next log instead (helpLadder11.test.ts
    putBack).
17. **A held plain jump clears Easy's 114 px chain rises.** Easy has no "before" red for plain jumps; Normal's 140 px rises are the red.
18. **The dev server can fail a lazy import under load** ("Failed to fetch dynamically imported module"). Run one browser job at a time.


15. **The flown bands refuse today's World 1 data, by design.** Before C1, every 1-1 roll fails; a suite test that builds Play's 1-1
   goes red on this branch. Do not loosen a verdict to get green: the content moves (bands.md §5), or it is a pushback.
16. **Read thickness off the laid shape, never `pc.h`** (`thinLaid`): a bank has no `h` and is a block; that bug made every D bank thin
   (attempt 1). Headroom counts solid blocks of 50 px or more over the take-off run and the flight only. A 'double' place inside the single
   band is a single section (`classify`, setting-aware).
17. **w1Pits over-reports falls; read `promises11.realFalls`, never raw findW1Pits, for "can he fall here".** The lead's ruling (11-11),
   both lines and the Critic's (attempt 6): a piece over a slot closes what it covers unless he can get under it (from EITHER lip, its
   underside 48 px or more over that lip's top, or a
   floor inside the slot more than 10 px below it: seed 172's deck over block 146 is a real hole); and an opening narrower than his body
   (BODY_W 32 px) is no drop whatever covers it (seed 323's 23 px). `top` is the LOWER lip.

## 4. Day one, for a fresh engine engineer

- Read `reference/LAWS.md`, `reference/STAGE-RULES.md` and this file first. The checks are in CLAUDE.md, in order. Run the FULL suite before any push that isn't a safe-keeping push.
- Before changing anything that builds stages:
  - save main's lock: `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-main.json` (on main), then on your branch `npx tsx tools/engine/lockall.ts --layouts 16 --intended <stages> --check lock-main.json`;
  - run `npx tsx tools/engine/seedlist.ts 1-1 --check`;
  - afterwards, the lock must say which stages changed and why. Only the stages your task names may change.
- Planted failure first: every new rule gets a test that is red without your change and green with it. Look at the stills yourself, upright and sideways, before you call anything done.
- 1-1's Play is a list of proven seeds: a roll is only as good as the filters the list builder applies. A new player promise belongs in `promises11.ts` (a test) and in `seedListBreaches` (the list), together.
- Give times in ET from `TZ=America/New_York date`. Paste hashes only from git output.
