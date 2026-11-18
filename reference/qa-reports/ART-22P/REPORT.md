# ART-22P REPORT: 2-2's pickup painted to its story; the seed-list CI split (R-165.278)
Branch t-art-22p from origin/main 6e7b85f8f. Head: see the last commit message to the lead (pasted from git). HF: ~$0.34 of the $4 cap.

## Done-items
1. **Compare first, then paint.** Shipped petal (87x96, soft dark rim, fine veins, cream base) judged beside the folded one. Starts are
   the shipped petal itself, recoloured (tools/art/hf22p/starts.py), img2img s45/s58 x 2 seeds, plus 6 text-to-image takes.
   Takes: reference/art/hf22p/takes-sheet-img2img.jpg, takes-sheet-t2i.jpg. **Picked i-lav-s58-23 (lavender water hyacinth).**
   Why: it keeps the shipped petal's shape, size, vein work and edge weight (one pickup family), and on 2-2's warm sepia and green it
   reads at phone size better than the pink did; over the pads and teal water too. White lily (i-white-s58-23) was shot in the game and
   lost: it melts into the pickups' cream glow and the cream sky (stills/judge-pink-lavender-white-1to1.png). Text to image gave flat
   sticker petals with heavy black outlines: off-style.
   Cut: tools/art/hf22p/cut.py (grey border flood, rim un-mixed from grey, 1 speck dropped) -> src/assets/pickups/petal-hyacinth.webp
   91x96, 12 KB. Inventory: CATALOG-MASTER.csv row hf22p/petal-hyacinth (world 2, pickup layer, 27x28 units, ship 91x96, part H22P),
   `catalog_master.py --emit` -> cast.json.
2. **Wired by data:** stagePlan.ts 2-2 `looks: { petal: 'petal-hyacinth' }` (one row). Plus the HUD counter: goalInfo.ts harvest icon
   now reads stageLooks (it always showed Meeca's pink petal, FIX-22 named "the HUD counter" too). bloom.test.ts: planted red without
   the 2-2 row (actual 'petal', run at 10:17 AM), green with it; its default case moved from a made-up "1-5 harvest" to the real 1-2.
3. **Checks (on this branch):** tsc PASS; seedlist 2-2 --check PASS (100 seeds, both settings); lockall --layouts 16 --intended 2-2
   --check vs main's lock (recorded on 6e7b85f8f): **102/102 stages unchanged, 2-2 included: the layout did not move**; drawcheck PASS
   (2-2 land 155 sites, port 135; 733 s); artcheck PASS; build (BASE_PATH=/Sloths-Adventure-/) + chunkcheck PASS; knowncheck,
   generalitycheck, roadmapcheck PASS; registrycheck PASS. Suite: see the message to the lead (first run cut off at the 30-min
   background limit with 0 fails besides the bloom case above; re-run in 3 shards).
4. **R-165.278:** gates.yml `seedplan` -> `seedlists` matrix (fail-fast off, 25 min limit), job i runs `registrycheck.ts --lists
   --shard i/n`; at most 4 lists a job (~2 min a list, so ~10 min a job with install at any count). `--shard` exits 1 on a stale plan
   or an empty shard (the old `for s in $(...)` loop passed with zero lists if the list command failed). Proof: YAML parses (5 jobs);
   matrix today [1,2,3] -> 1-1 1-6 2-1 | 1-4 1-5 1-8 | 1-2 1-3 1-7 2-2, every list once; a 2/4 plan exits 1. registrycheck.test.ts
   'R-165.278': every list in exactly one shard for 1-40 lists, the matrix line still satisfies ciChecks, the one-job loop is gone (14/14
   with ciTests). tsc stays first in `gates`; every other step unchanged. **The next publish run is the live proof** (seedplan log,
   each seedlists job's minutes). Noted in reference/methods/gates.md row 8.

## Stills (reference/qa-reports/ART-22P/stills/, 2x, layout 1 = seed 2, setting printed by the game)
before-after-normal-sideways-x2600.jpg, before-after-easy-sideways-normal-upright.jpg, after-normal.jpg, after-easy.jpg (x2600 bank,
x4220 pads over water, x13039), judge-pink-lavender-white-1to1.png.

## Polish check
- Pickups at 1:1 sideways: clean rim, no grey halo, veins read, same size as the old petal. Upright: same. Over pads and water: reads.
- HUD counter: lavender, matches the pickups (was pink). Both settings, both ways.
- Named, not mine: Dot's idle quip card sits mid-screen in every still (the game's chatter, as FIX-22 found); the drifting decor petals
  (flora/petals.webp) are still pink in 2-2's air (world decor, not the pickup).

## Pushback
- None on the packet. The HUD line is outside "one line" but is the same story fault (FIX-22 named the counter); a stage's own look
  should show where its goal is counted.

## Suggestions
- ART packet: a World 2 drifting-petal set (lavender/white) so the air matches what he gathers (flora/petals.webp; ~$0.3).
- CI: lower `rolled` timeout-minutes from 60 to ~20 once a publish run shows it at ~5 min (the loop has left it).

## Learned / method update (hf-art.md)
- For a piece in an existing family, img2img FROM THE SHIPPED PIECE, recoloured, at s58 on grey keeps the family's style; text to
  image with the LoRA drifts to flat stickers. Judge colour candidates IN the game: the pickup glow is cream, so pale pieces vanish.
- hf_sandbox_fs cat of 95 KB parts always saves to a file: plan on hfw2/fetch.py from the start; crop in the sandbox (crop.py) first.

## Lessons applied
D23/D62 (stills stamped with built setting), D41 (sized to the shipped pickup), D81 (drawcheck named and run for 2-2), D82 (job time
limit is the gate), D83 (no absolute imports: none added), D59 (no gate left running at report), D36 (own worktree), law 8 (token never
left the sandbox).
