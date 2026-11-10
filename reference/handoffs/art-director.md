# Hand-off: the art director role (Content), rewritten 2026-11-09 11:12 PM ET

Last task: R-165.85 (cut only), Matt's 15 sheets of 11-09, by the Content member on branch t-c2-art-cut. The earlier note (from the
art director, session_01FhBbYLmXQhDLjAzTexXzo3, 11-07) is folded in below; §1 to §7 are still true unless marked.

## 0. Matt's 11-09 sheets: cut, not placed
- 48 pieces kept, full size, in `src/assets/w1-1109/` (no code refers to them). Catalogue, contact sheets by kind, rejected cuts and
  the cutter: `reference/art-incoming/matt-2026-11-09/cut/` (CATALOG.md first).
- Next: the 1-1 re-lay (R-165.72) and Matt's mock-up sheet pick from these. Platform logs: M-14-a, M-15-a/b (M-15-a/b are near
  twins). Side-on lily pads: M-03-a to d (sheet 02 is top view, never platforms). Puzzle pieces for R-165.81: M-01-a to d, M-04-a to d.
- Flags still open: M-04-b crate has painted words; M-06-e pitcher plants read as danger; M-04-d lever has one pose only.
- Three-quarter-view blocks and the diagonal log M-01-b have no true side-on stand line: the cyan line is the top silhouette; set the
  stand line by hand when placing.
- 10 cuts rejected, 7 only for the 600 px rule (the short log M-14-b and five plants are clean): ask the lead before re-rolling.

## 1. What's open
| Item | State | Where |
|---|---|---|
| 1-1 near strip repaint | Done and accepted by the lead (11-06, 10:10 AM ET). **NOT in the game**: engine-core's `src/assets/backdrops/w1sun2-near.webp` is still the old log-pile strip (sha 85b0f79f…; mine is 64294b6d…). Waiting on the move and a wide-pan still. | `reference/art/near11/` (A = pick, B = backup), README there |
| Watch on the near strip | The big right-hand boulders are its brightest shapes. Check they don't read as standable in a wide pan; also check the tile seam across 3 tiles. | lead, 11-06 |
| Earth ledges floating | Answered by Matt 11-07: platform-looking islands may float. | §4 |
| G-dress / G-kin gates | Spec accepted, queued for engine-core. The art half isn't started: tagging the dressing sprites (`dressTags.json`) with a contact sheet. | `reference/art/GATE-SPEC-dress-kin.md` |
| Phase A code fixes, Worlds 2-10 | Scheduled, not started (rule: no other world is built until 1-1 and 1-2 prove). 27 lines, each with a stage and a still. | `reference/art/PHASE-A-FIXES.md` |
| Flowering vine | The petals read grey (the de-pink step greyed them). Re-cut without de-pink, or wait for Matt's re-roll R-02. | `reference/art/cut/up3x/README.md` |
| Matt's redo list | R-01..R-09 (pink rope, small sheet-10 pieces, cropped trunk crown, angled pieces, lily pads, logs in water, diagonal branches). | `reference/art-incoming/ART-REQUEST-LIST.md` |
| Gemini ask list, Worlds 2-10 | Written. Same 4 asks per world: floor kinds, a painted hazard, a hide spot, a one-piece vertical. | same file |

## 2. The manifest (1-1's painted pieces)
- **`reference/art/cut/INTEGRATE-1-1.md`** and **`reference/art/cut/footing.json`**: 30 pieces.
  - Each piece has its footing: the standable top as `y` px from the image top, plus the stand span `x0..x1`, in the cut PNG's own
    pixels.
  - Each has a scale in Pokey heights (Pokey's collider = 48 game px), plus `drawn_game_h/w` and `footing_game_y`.
  - Walls are set pieces with one footing per ledge (7 / 7 / 9).
- Contact sheets with every footing line drawn: `footing-sheet-0.jpg`, `footing-sheet-1.jpg`.
- Rebuild: `python3 tools/art/w1keepers/footing.py`. Auto footing = the first row whose longest opaque run is at least a fraction of the
  width, narrowed 6% at each end. Overrides are in the `OVERRIDE` dict, and the wall ledges are hand-measured in `WALLS`. Look at the
  sheet every time; the auto line can grab a grass tuft.
- Lead's rulings (11-06):
  - the lashed log is **W2 only** (rope = a made thing; no made things in the home forest, the same rule as the lantern);
  - the hollow stumps are **perches only**;
  - the 3 branches are **dressing only** (drawn diagonal; flat re-roll R-09);
  - wall C was re-cut with whole ledge tips;
  - the earth-wall tint stays at 0.85.

## 3. The cut pipeline and the atlas
1. **Matt's sheets** come in at `reference/art-incoming/gemini-2026-11-05/` (README there = the lead's KEEP / REJECT / HOLD per sheet).
2. **Cut**: `python3 tools/art/w1keepers/cut.py segment <dir>` draws numbered item maps per sheet. The picks are in
   `tools/art/w1keepers/picks.json`: sheet, item number, name, job, world tags, and an optional `box` / `erase` (sheet px) to split pieces
   the matte joined. Then `python3 tools/art/w1keepers/cut.py cut reference/art/cut` writes PNGs, `manifest.json` and contact sheets on
   dusk purple (shows a pink fringe) and leaf green (shows a grey halo).
   - Magenta sheets: soft key plus despill; grey sheets: matte by distance from the border grey.
   - Specks under 150 px are dropped.
   - Needs `pip install scipy`.
3. **World 1 tint** for earth pieces: `python3 tools/art/w1keepers/tint.py` writes `<name>-w1.png`. It moves only soil pixels to W1's bank
   soil colour.
4. **Footing**: `footing.py` (§2).
5. **Atlas (engine-core's code, on branch engine-core)**: `tools/art/packcut.py <cut dir>` writes
   `src/assets/w1to4art/w1-cut.webp` + `w1-cut.json`. It holds 18 frames: 10 stones, the wide stump, 2 perches, 5 planks. Each frame
   carries `kind`, its box and its footing in atlas px (`fy`, `fx0`, `fx1`).
   - Drawn by `src/game/w1CutArt.ts` (`cutBox`: a stone or stump stands on the ground with its footing on the platform top, stretched
     at most 1.5x; a plank floats with its span = the platform width).
   - Picked per platform by `w1Finish` (gen2/worlds/w1.ts); tests in `w1CutArt.test.ts`, `footing.test.ts`, `edgeFooting.test.ts`.
   - **If you re-cut a piece, its footing changes: rebuild footing.json, then repack the atlas.** The atlas is not rebuilt by itself.
6. **Upscale** small pieces for free on CPU: `python3 -I tools/art/edges/defringe.py <src.png> <dst.webp> --scale 3 --esrgan`.
   - Needs `pip install spandrel` (+ torch) and `tools/art/upscale/anime6b.pth`, which is git-ignored: fetch it from the Real-ESRGAN
     v0.2.2.4 GitHub release.
   - Used for sheet 10 (`reference/art/cut/up3x/`), $0.
7. **Show-first stills** before anything goes in: `tools/art/w1keepers/showfirst.py` composites cuts into a real frame from
   `tools/art/kitaudit/shoot.mjs`. Results in `reference/art/show-first/`.

## 4. The floating rule (Matt, 2026-11-07, STAGE-RULES "What may float"; replaces the 11-06 rule)
- "If it looks like it can be a platform, it can float." Logs, planks and earth islands that read as platforms may float.
- Skinny things (boughs, branches, vines, ropes) attach to a trunk, post, root or rope.
- Rocks, stump-steps, decor (bushes and ferns included), hide spots and caves are grounded, never floating.
- Every catalogued piece carries one class: may float, attached or grounded. Lily pads: may float, on water only.
- Related rule (Matt 11-06 12:15 AM): never stack unrelated pieces (a trunk on a plank looks tacky). Vertical climbs are one picture.

## 5. The kit audit (11-06)
- `reference/art/KIT-AUDIT.md` + stills in `reference/art/kit-audit/`.
  - 124 real frames, 31 stages, upright and sideways.
  - One 9-line checklist: floor kinds, a hazard that reads, nothing harmless that reads dangerous, hide spots, climbs, one-piece
    verticals, dressing, no code-drawn shapes, backdrops that don't read standable.
  - Method: `reference/methods/kit-audit.md`.
- Headline:
  - The floor is thin in EVERY world. In W2-W10 the kit's stump and boulder slots are the same picture.
  - Code-drawn shapes: pit-pocket rectangles, flat boxes, straight-line poles, W2's flat water.
  - Red spiky plants are painted into W1's branch frame (W5 draws it too); W9 has skull/bone remains.
  - Ranking, worst floor first: W10, W5, W7, W9, W4, W2, W1, W3, W8, W6.
- Fix order: free code fixes (`PHASE-A-FIXES.md`), then Matt's Gemini sheets, then Hugging Face.
- The skull line is **the lead's ruling, not Matt's**: no skulls or bones as soil or dressing remains. A skull warning SIGN (Matt's 7-4
  flume concept) is allowed.

## 6. Where Matt's art lives
| What | Where |
|---|---|
| The 11-05 Gemini sheets (07-43) | `reference/art-incoming/gemini-2026-11-05/` + README (the lead's read per sheet) |
| My cuts from them (111: 107 keep, 4 hold) | `reference/art/cut/` on art-director: PNGs, `manifest.json` (world tags by KIN), contact sheets, README |
| **Matt's 11-09 cuts: 48 pieces** | `src/assets/w1-1109/` + `reference/art-incoming/matt-2026-11-09/cut/` (CATALOG.md, catalog.csv, sheets/, rejected/, cutter/) |
| **The weekend cuts: 91 pieces** | **branch `art-raw-2026-11-07`, folder `cut/`**: `CATALOG.md` (counts per kind, W1 gaps, the next picture list), `catalog.csv` (one row per piece, measured flat walkable top), `kept/`, `sheets/` (cyan line = walkable top), `rejected/`, `cutter/` |
| Painted kits in the game | W1: `src/assets/proto/props-atlas.webp` (+ `props2-atlas`, `protoAtlasData.ts`); W2-W10: `src/assets/kits/w<N>.webp`, `kitAtlasData.ts` |
| 1-1's cut atlas | `src/assets/w1to4art/w1-cut.webp/.json` (engine-core) |
| Backdrop strips | `src/assets/backdrops/<stem>-{far,sky,mid,near}.webp`; 1-1 plays `w1sun2` (`stageBackdrops.ts`) |
| HF spend log | `reference/art/HF-SPEND.md`. 11-06: ~$0.36 (the near strip). About $70 left; the $15 reserve is untouched. Each job needs a one-line ask and a written OK first. |
| Next steps I left | `reference/art/NEXT.md` |

Note: the 91-piece catalog's own "still missing" list says the W1 gaps are pit pieces, root steps and full-size W1 rocks. My 11-05 cuts
already have rocks and a root arch (`w1-hide-root-arch`), so check both sets before asking Matt for more.

## 7. Traps (each one cost me time)
1. **Kits list a slot twice.** In W2-W10, `stump` and `boulder` are the same painting. Count real kinds by looking, not by keys.
2. **Gemini draws pieces at an angle** (three-quarter view, diagonal branches, top-down lily pads). A diagonal piece has no footing. Check
   "seen exactly from the side" before cutting.
3. **Magenta key fringe.** De-pinking greys real white or pink detail: the flowering vine's petals; and the thin rope had pink painted
   INTO its strands. Judge every cut on dusk purple AND leaf green, zoomed 2-3x.
4. **Grey-sheet mattes join neighbours.** The trunk and its lantern on sheet 41, wall C and its overhang on sheet 39. Split them with
   `box` / `erase` in picks.json, then re-check. My first overhang box clipped most of the piece; the first wall C box cut its ledge tips.
5. **The segment map numbers change** when the cutter changes. Re-run `segment` and re-check picks.json; sheets 08, 09 and 11 got swapped
   names once (the monstera bush and the hedge were labelled backwards).
6. **Footing automation grabs tufts.** Auto lines can sit on a grass blade or take half the top (the ground chunk). Always look at the
   footing sheet; walls are hand-measured.
7. **Shooting stills:** `tools/art/kitaudit/shoot.mjs` pins Pokey before the physics step, so he hangs a little above the ground. That is
   the harness, not a bug.
   - Use `PORT_FR=` and `SETTLE_MS=12000` for upright frames, so the stage card is gone.
   - Kill the leftover `vite --port` processes after.
   - Playwright is required through `createRequire` (an ESM import doesn't find the global install).
8. **Showing a backdrop that isn't on your branch:** I copied w1sun2 in and pointed `stageBackdrops.ts` at it locally for stills, then
   reverted. Never commit that switch from an art branch.
9. **HF jobs** read their spec and starts from raw GitHub at a pushed commit: push first, `curl` the URL to check, then launch. Outputs
   come back as `carrier-*.png` (`hf_fs attach`, then `tools/art/w5/unpack_carrier.py`). The token goes only in the job's secrets.
   Log every job id and its minutes.
10. **Time stamps**: take them from `TZ=America/New_York date` in the same step, never from memory (I sent one 7 minutes off; the lead
    caught it).
11. **The earth wall soil** is warmer than W1's bank. Use the `-w1.png` tinted files in W1; keep the originals for W3's darker kin.

12. **Matt's printed labels merge into pieces** when the text sits within ~60 px of the art (the cutter's merge distance). The 11-09
    cutter clears them by glyph detection; a word it misses (M-09 "Giant Ce") needs a `labelbox`. Check every piece's bottom edge.
13. **Painted fades and shadows in the ground colour** (M-05's trunk top, M-11's floor shadow under the arch) key as solid pink-red.
    Model them as ground plus an overlay and unmix (cutter/fadefix.py, floorfix.py); erasing by hue leaves holes.
14. **speckkill erases art painted in the ground's hue** (M-12-f's magenta fern stems went with the ground). Use it per sheet, then look.
15. **Never pipe the builder into `head`**: a broken pipe stops it half way and leaves contact sheets missing.

Stopping now.
