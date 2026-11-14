# Handoff: engine-core (the Engine member's turnover note)

Rewritten at the end of INT-1-1 (11-11), on its final head: branch `t-int-1-1` = C1's re-laid 1-1 (t-content-c1@0fc0835a, passed,
on E0a d2748131 and A1 41c2e248) + t-content-c1-tests + the vendor split (t-engine-chunks@e67809c3) + the help ladder
(t-engine-help@98186930) fitted to the new layout, with the Critic's two deltas fixed. Not merged: the one PR that ships E0 + C1 + A1 +
A2 (ADR-001). Sections 0a-0b below are still true.
Rewritten for HOOKS (11-13, t-hooks): section 0t (the piece hook, the letter table). Rewritten for FIX-INT (11-13, t-int-5): section 0n (tonight's 3 unit reds). Rewritten for FIX-A (11-13, t-fixa): section 0l (Dot's card). Rewritten for INT-3 (11-13, t-int-3, the 0.9.8 integration): section 0m. Rewritten again at the end of R-165.112 (11-11): branch `t-engine-seedchunks`, rebased onto the passed t-int-1-1@874f11f6: each stage's proven list is
its own lazy chunk (section 0d). The lead's ruling, 11-11 5:18 PM ET: the stand-in is ACCEPTED (a failed list load plays 4106 by its
proven plan; Play is never blocked).

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
- **A shut gate is `broken`** (no footing; protoArt/terrain already skip broken) with `art: 'hidden'` so fieldPlay draws its bough
  always (one picture, sagging or level); its `ways` (climbs up from it) are `off` and not drawn, its `with` (lay boughs at its height)
  are broken with it. Exit A does not vault under a shut gate (`field.blocksTop`).
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
