# ENG-CUT REPORT (Engine, the general cut-piece draw path; base t-build-28-wip a0d85e961; lands on t-eng-cut). Session 1 started 9:42 PM ET (from the session hook date).

## ENG-CUT-b (R-165.520: a section piece lays its cut). Started 9:02 AM ET (from the session hook date); this section stamped 9:12 AM ET.

### EXACT NEXT STEP (ENG-CUT-b, box 1)
Candidate 4d2a579de on t-eng-cut (ALREADY on the branch: a safe-keep push made before the gates; nothing merges it until the gates below
are named). Gates run on frozen worktrees (scratchpad wt-cand = 4d2a579de, wt-base = 57d7b8287; chattr +i, gen2/proven writable):
tsc 0 and generalitycheck PASS done; running: base lock (lockall --layouts 16 --out lock-base.json on wt-base), suite shards 1-3 on
wt-cand. Next: shards 4-6; lockall --check lock-base.json on wt-cand (one run, 102 stages, none listed moves); the CI tool line
(gates.yml line 157 tests, tipwalk, storyTipScan, teachFirstScan, registrycheck, tierBots, kbdcheck, buildcheck); drawcheck; name each
red against 57d7b8287 by re-running it on wt-base. Then this section's results, push, and the hash + shard totals to the lead and to
BUILD-28-g.

### The piece (general: no stage, world, seed or x)
- gen2/types.ts SectionPiece.cut: the catalog id. pipeline.ts: LocalPiece.cut carried from the section piece; the lay's mk sets
  Platform.cut to it (pipeline ~2858), keeping the width the section gave (Easy's landing pad included); invCut's invCutBox draws it by
  its stand span. A cut on a hanging piece or a crumbling tile fails the section by name (it would never be drawn).
- art/invCut.ts layCutRefusal(id, world): the gate's own refusal, read against the world's inventory when it is in hand
  (art/inventory.ts inventoryInHand, set when loadInventory resolves). A World 1 cut passes (w1CutArt's). LIMIT, named: the lay is sync
  and each inventory is its own lazy chunk, so before a world's inventory is read (a stage's first build in the game) the lay cannot see
  it; there the same refusal keeps the piece undrawn (readyInvCuts) and invCut.test's listed-stage gate fails it by name. A builder's own
  test sees the refusal at the lay by awaiting loadInventory(world) first (layCut.test does).
- Toys (src/game/gen2/layCut.test.ts, 3): every standing block of 2-1's kit names the reed island: 114 laid platforms wear it on both
  settings, World 2's finish keeps cut and width, one blit at invCutBox; an unknown id fails the section at the lay by name; a cut on a
  hanging piece fails by name. ALL THREE RED on 57d7b8287's lay (no platform wore it; no throw; no throw), GREEN on 4d2a579de.

## EXACT NEXT STEP (box 2, LANDED: the lead approved the engine path; the gates ran on the frozen candidate past the box, no new code)
NOTHING LEFT IN THIS LANE. The code is fd455b8cc's (src identical to the frozen 0a584713a every gate ran on); this commit adds the report
and the World 1 stills only. Every red below is RED on a frozen a0d85e961 too (each re-run there by name). Next owner of the look:
BUILD-28 (the island's width 340, its height over the water, the caption), carried by the lead.

## Gates on the frozen candidate (0a584713a = fd455b8cc's src)
- Suite, 6 shards (the CLAUDE.md list): 1: 679 pass 0 fail. 2: 673/0. 3: 731/2 (artUse.test cage-whole + cage-b; stageSheets.test
  "2-8: STAGE_DRAWS lists more than it draws": foe:goldsnake). 4: 760/0. 5: 655/1, 2 todo (groundwork.test goals band, "5 stages
  checked"). 6: 713/2, 1 todo (firstTimerBot.test KID_RUNS_59, R-165.473; puzzleCamera.test "30 moments checked"). TOTAL 4,211 pass,
  5 fail, 3 todo: all 5 INHERITED (each RED on a frozen a0d85e961, re-run by name).
- Deploy build (BASE_PATH=/Sloths-Adventure-/) 0: reed-isle-28 ships as 68.50 kB; no asset over 4 MiB. chunkcheck PASS.
- drawcheck PASS (972 s, under load): the per-frame limits unchanged.
- lockall --check, ONE run: 102/102 stages unchanged (box 1).
- CI tool line: engine tools' tests 435 pass / 1 fail (registrycheck.test "the shipped table passes the gate": INHERITED); tipwalk PASS;
  storyTipScan --check FAIL (2 of 2-8's laid lines: INHERITED, same on a0d85e961); teachFirstScan PASS; registrycheck FAIL (2-8 not in
  drawcheck scenarios, no proven list, not flown: INHERITED, 2-8 mid-build); tierBots 9/0; kbdcheck PASS; buildcheck FAIL under the
  suite's load (p95 192 ms), PASS re-run ALONE (normal p95 121, easy 80: budget 150).
- tsc 0; generalitycheck PASS; artcheck PASS; knowncheck PASS.

## World 1 before/after (the brief's still): w1-cut-before-after-sheet.jpg (upright + sideways, a0d85e961 then this head) and
w1-cut-before-after-diff-upright.jpg (the stone crop: before, after, the >8 diff). 1-1 layout 1, w1-rock-block-big (platform 7, x 743,
191x53) with Pokey dropped beside it: the same piece in the same place at the same size. The diff is a 1 px camera offset (every edge,
the background's too), the petal's pulse and his idle; Dot's tip and the lives badge differ by timing (w1still.mjs here).

## Done-items
1. THE PATH (src/game/art/invCut.ts, general: no stage, world, seed or x). Platform.cut names a piece by its catalog id. World 1's own atlas
   is tried first, byte for byte (drawPlatformCut = drawCutArt(ctx, p) || drawInvCut(ctx, p); w1CutArt.ts only gains `isW1Cut`). Any other
   cut resolves against its world's inventory (art/inventory.ts loadInventory): the row's picture (`file`, shipped by a folder line in
   art/invDressArt.ts), its rect (`frame` or the whole picture), its footing (`walk_y`, `walk_x0..walk_x1`). Drawn as World 1's cutBox
   draws a stone: stand span = the platform's width (he never stands on air), walk line on its top, one even scale. Loaded through
   atlasLoader.trackAtlas (World 1's loader), readied before the first frame (stageReady.ts readyInvCuts, beside readyInvDress), drawn
   through sheetBake.drawSheet (one blit, one Map get a platform, no allocation). protoArt's cut pass calls drawPlatformCut; paintedPlatforms
   already leaves every p.cut out of code terrain. stageManifest adds 'w1-cut' only for a World 1 cut now (a World 2 cut no longer loads
   World 1's sheet).
2. NO BANK UNDER IT (w1Pits.ts paintedBank): a non-World-1 cut is the platform's whole look, so it is never also painted as a bank of earth.
   Seen in the first still: the island's 124 px solid drew a soil pillar under the piece. World 1's cuts unchanged.
3. THE PACK: reference/art/hfreed28/cut/reed-isle-28.webp copied to src/assets/w2-cut/reed-isle-28.webp (68,500 B, 720x385); folder line
   'src/assets/w2-cut/' in invDressArt.ts; CATALOG-MASTER.csv row file/status/draw_cost; inventory w2.json and w6.json re-emitted
   (catalog_master.py --emit: only that row moved, checked); inventory.test's unpacked count 219 -> 218. The art-use gate: the picture
   is named by its folder pattern (as w1-18 is): no new artUse entry.
4. THE GATE (invCutBreaches, by name): not a World 1 cut and not in its world's inventory; no footing (or not a standable layer);
   empty stand span; scale_ok false; waiting on a fix; a made thing in World 1; a frame with no rect; a picture the build does not ship.
   Run over every listed stage, both settings, layouts 1-2 (invCut.test.ts).

## Toys (planted first)
- A World 2 cut on Platform.cut draws: RED on today's path (drawPlatformCut aliased to drawCutArt: "drawn" false, no sheet), GREEN now:
  one drawImage of the shipped picture, src 0,0 720x385, dst (x-9.5, y-107.5, 360, 192.5) on a 340 px solid.
- A missing sheet is refused BY NAME: "cut 'fx/no-sheet': its picture origin/t-art-28:... is not in the build (... ships
  src/assets/w1-18/, src/assets/w2-cut/)"; never resolved, never drawn. The real World 2 inventory's reed row: RED before the pack
  (its file was origin/t-art-28:...), no breach after.
- invCut.test.ts 7/7; art tests + w1CutArt + w1Overhang run with this box (invDress.test's message regex now allows the added folder).

## Gates box 1 (fast ones)
tsc 0. generalitycheck PASS (26 literals, 26 known). artcheck PASS. knowncheck PASS. Art tests (src/game/art/*.test.ts + w1CutArt +
w1Overhang): 41 pass, 0 fail. lockall --check: 102/102 unchanged (above). artUse.test RED, INHERITED (same two on a0d85e961).

## Polish check (the stills: reference/qa-reports/ENG-CUT/reed-isle-newpath-upright-2x.jpg, -sideways-2x.jpg)
Shot on the real 2-8 build (designed layout) by cutstill.mjs (here), with a scratch-only build hook (stageGenerator.generateStage
calls globalThis.__stillHook on the built stage; NOT committed) that sets the island solid's cut and its width to the row's stand line,
340, centred, before the engine is made. Pokey dropped onto it by the engine's physics: grounded, feet on the top.
- The grass top reads standable; his feet on it; reeds at both ends behind him; no soil pillar under it (item 2).
- NAMED, BUILD-28's data, not this path: (a) the island solid is 420 wide; at 420 the piece draws 1.24x its cut scale; lay it 340 (the
  row's stand line) and it draws at exactly x-9.5, y-107.5. (b) Upright, the island's mud foot ends above the water line in this frame
  (the water surface is about 90 px under the top here; the row was cut for about 45): sit the island lower or let the marsh reach it.
  (c) The flood line's caption ("The river's rising...") covers its foot sideways at this moment of play.

## Lessons applied
D115 (the base lock recorded on a frozen worktree), D119 (no heredoc in a commit chain), D128 (stamps from date), D134 (next step pushed
before the message), D140 (ReadNotifications at boundaries).
