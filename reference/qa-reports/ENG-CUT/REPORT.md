# ENG-CUT REPORT (Engine, the general cut-piece draw path; base t-build-28-wip a0d85e961; lands on t-eng-cut). Session 1 started 9:42 PM ET (from the session hook date).

## EXACT NEXT STEP (box 1 hand-over; head = this commit on t-eng-cut)
DONE THIS BOX: the path is built and pushed (513e80707, a8ea8593e); toys red-then-green; stills of the reed island through the NEW path,
upright and sideways at 2x (below), sent to the lead to JUDGE. NOT YET RUN: the heavy gates. The next box, in order, on a FROZEN worktree
of this head (D115: `git worktree add --detach <scratch>/frz <head>`, node_modules symlinked; src/game/gen2/proven/ writable):
1. ReadNotifications; read the lead's verdict on the stills (law 2). If the lead sends the still back, fix first.
2. `gunzip -k reference/qa-reports/ENG-CUT/lock-base-a0d85e961.json.gz` (recorded on a frozen a0d85e961: 3,264 builds of 102 stages,
   `lockall --layouts 16 --out`), then ONE run: `npx tsx tools/engine/lockall.ts --layouts 16 --check <that json>`. Expected: NO stage
   moves (no listed stage lays a non-World-1 cut: invCut.test prints 0 such pieces on 16 listed stages; the bank change touches only such
   pieces). Record its counts here.
3. In the background, each to a log: the suite in 6 shards (`--test-shard=i/6`, the CLAUDE.md list); the deploy build
   (`BASE_PATH=/Sloths-Adventure-/ npx vite build`) then chunkcheck; drawcheck; the CI tool line (tools tests, tipwalk, storyTipScan,
   teachFirstScan, registrycheck, tierBots, buildcheck, kbdcheck, seedlist --check). Name reds inherited from a0d85e961 by re-running
   that one file on a frozen a0d85e961 (known so far: artUse.test, cage-whole and cage-b: RED on a0d85e961 itself, checked this box;
   registrycheck.test per BUILD-28's REPORT item 1).
3b. NOT DONE this box: the World 1 before/after still (a cut stone on 1-1, a0d85e961 vs this head, same frame, upright and sideways);
   the code path for a World 1 cut is unchanged (drawCutArt is called first, unedited), but the brief asks for the still.
4. Totals here, push, `git ls-remote origin t-eng-cut`, then the landing message (hash, totals, the stills) to the lead AND BUILD-28's
   current session (the lead names it: asked in the hand-over message).

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

## Gates this box (fast ones only; the heavy ones are the next step)
tsc 0. generalitycheck PASS (26 literals, 26 known). artcheck PASS. knowncheck PASS. artUse.test RED, INHERITED (same two on a0d85e961).

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
