# ART-18: 1-8's look: painted palms, the trunk repeat, the bough's (m)(k)(l). Report 12:43 PM ET 11-15, t-art-18 from t-eng-look2 (head 9d9ae395+report)
**EXACT NEXT STEP (1-8's data step; a fresh member from this head):** (1) `node tools/perf/drawcheck.mjs` (my run: see Unresolved), then
1-8 SIDEWAYS at x 24036 and the 1-98 fixture (ENG-LOOK2 REPORT step 5); (2) `git merge origin/t-build-18b` (9f7d54bd); in w1Arc18.ts give
`w1-18-still-fork` and `w1-18-tip` `entry: { piece: 'in', kind: 'ground', join: 'walk' }` (brick() at w1Arc18.ts:112: add an option); crack
art on a cracking bough and the hanging-moss rows go with it; (3) `npx tsx tools/engine/seedlist.ts 1-8` (relist; the dressing rules never
refuse a roll), `npx tsx tools/inspect/castBots.ts --stage 1-8 --seeds 1-40` both settings, `npx tsx tools/engine/lockall.ts --layouts 16
--intended 1-8 --check <lock of the base>` (expect 1-8 only), the WHOLE suite (3 shards); (4) stills + clip both ways, Normal + Easy.
## Done-items
- **1 Palms (Matt 11:45-11:46):** compared first with M-10-a, N-06-a, hf678/w17-snag-a, hf18-cannon-trunk (soft shading, thin brown line,
  sage greens; the old crown: heavy black outline, flat). ONE sandbox: 16 palm takes, 14 painted clean (2 rejected: painted a jungle).
  Lead's verdict 12:27: palm-b, palm-c, back-a, back-b SHIP; palm-a cut (orange nuts, short trunk read as growing out of the bough).
  hf18-palm-crown row + file deleted; 4 rows catalogued (CATALOG-MASTER + emit). PALMS_18: a palm at every nut's drop with its cluster
  over the drop, in turn, none twice within 1800 px, back palms drawn first, clusters ~165-190 px over the ground (sideways they sit under
  the HUD art; the nut leaves a visible cluster: stills/palms/release-*). Test w1Arc18 'the palms' (checks each cluster against the
  inventory's size; planted: one palm everywhere -> red, a wrong dx -> red).
- **Trunk repeat (lead 12:11):** hf18-cannon-trunk-back (the same paint mirrored + hazed, tools/art/hfpalm/hazed.py, no HF); TRUNKS_18
  takes turns, none twice within 1800 px (13430/13931 were the same picture 500 px apart). Planted: one trunk twice -> red ("630 px apart").
- **3 (m)(k)(l)** ff75be0d: (m) boughSpans (a bank draws only its uncovered top; under 2 T a stub, bark 0.6 T, both ends round; tested on
  1-8's real stair; planted: no covering -> red), erases clipped to their own piece; (k) round living cap; (l) tip taper in 1-device-px
  slices, baked once per section+scale. Tests touched: 42/42 (boughSpans, bankCull, chasePiece, footing, w1Arc18, invDress); tsc clean.
- **4** stills/look/ (x5400, x13900, x34200 both ways + before/after zooms), stills/palms/, clips/1-8-first-stretch-sideways.mp4.
## Hugging Face
sandbox 6af9e3a229dd05ff0368f022, 11:54 AM-12:23 PM, ~$1.34 of the $4 cap (HF-SPEND.md): 16 palm + 6 leaf takes; 4 palms shipped, 4 leaf
clusters cut (reference/art/hfpalm/leaves/, not wired). Balance ~$54.4.
## Audit (step 2: every 2000 px of layout 1, both ways, + a canvas probe of every call site, bakes included)
Painted: w1rain backdrop (scenery.ts drawTile), the bough (protoArt drawBough), palms + trunks (invDress), nut/fruit (rollingPiece, from
pictures), Pokey (heroSprite), petals/hearts (pickupSprites, stage-art), heliconia/toucan/frog/log/stump (dressArt dressnew-w1), flags
(stageArt), bounce cap (bounceArt, a dark tint over paint), w17 moss/snag/perch (w17Art), the HUD. Code, small, fine (§4): rain streaks,
mist strip, glows (vectorArt fillGlow, chasePiece edge), nut shadow, gate motes, grit texture. **Code-drawn OBJECT, on screen nearly every
frame: W1's hanging front leaves** (life.ts renderSwayLeaves -> rainforest.ts leaf(), 3 clusters a frame): proposed R-number below, painted
cuts ready. Code plate "N more" (sanctuaryDoor missingPlate) shows only on a locked exit: never on 1-8.
## Polish check
Fixed on my own stills before the lead saw them: clusters under the HUD sideways (lowered), tree nuts 2x the falling nut (take swapped, one
shrunk, then cut), pink frond rims (edge despill), my stub erase notching the lower step (clipped). Named: near palms both have ringed grey
trunks; a step end reads square in the clip's frame 0 (likely the live fallback before its square bakes; not verified).
## Pushback / Suggestions
None on the packet. Suggest (for an R-number): W1 front leaves painted: life.ts getLeafSprites draws reference/art/hfpalm/leaves/*.webp
(rims to clean) for World 1; stills on 1-1..1-8 both ways. BOUGH-FALL (ENG-LOOK2's) still open.
## Unresolved
drawcheck: started 12:41 PM on ff75be0d; result in the next line if it finished before I stopped, else UNRUN by me. Full suite: not run (lead:
touched tests only). Lock/seedlist for 1-8: not run (dressing rows only; no layout change), the data step runs them.
## Method used / Lessons applied / Method update
hf-art.md, render-fix.md, level.md (rule 22: no engine in data). Lessons: D41 (sizes vs drawn 89.1), D65 (rulings on the real still),
D69 (frames named), D19 (tests on the real built stage + inventory), law 22 (look rules never loosened: the fallback picks, the test holds),
D57 MISSED: three lead messages unread up to 28 min (read the queue at every push; I didn't until 12:23). Method update (hf-art.md):
"text-to-image on magenta comes back as soft pink gradients with rain: key by hue+saturation+brightness (hfpalm/cut.py), not distance;
pull the raw takes you may re-cut BEFORE terminating; judge tree-nut size against the falling piece (30 px) in game, not on the sheet."
## Learned (for the next builder)
Judge dressing at the hazard's release moment sideways (the HUD plate sits over the drop then), and its scale against the piece that falls.
## Turnover note
reference/handoffs/engine-core.md 0LOOK2 rewritten (this commit).
