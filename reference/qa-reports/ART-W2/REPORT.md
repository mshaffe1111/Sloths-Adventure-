# ART-W2 REPORT: World 2's missing painted pieces for 2-1 and 2-2 (one Hugging Face batch)
Branch t-art-w2 from origin/t-eng-w2b (19537789). Sheet APPROVED by the lead 12:49 PM ET (message). Nothing wired in the engine.

## Spend
One sandbox 6af9ec6a23985fb9cd8391e2, 12:31-12:41 PM ET, about 11 min: **~$0.50** of the $5 cap. It made 30 takes (8 img2img + 22 text-to-image),
and **9 pieces shipped: about $0.06 a piece**. Logged in reference/art/HF-SPEND.md. Balance ~$53.9.

## The pieces (src/assets/w2-1115/, WebP, 11-40 KB each; rows w2-1115/* in CATALOG-MASTER.csv, part W2A, emitted)
| piece | units (Pokey 89.1) | scale | what it is |
|---|---|---|---|
| w2-shallow | 476x134 tile | 1.50 (tiled) | The SAFE backwater strip: light green-teal, the bed and mossy stones show. Wraps at 0.79; clear above its crests like the deep tile; the bed grades into BED (113,109,78) |
| w2-loglong | 450x50 | 0.56 y | The long log at about 9:1 (logLong is 4:1 and gets fat when stretched). Moss varies along it, no repeat seams |
| w2-pad-small / -sunk | 90x44 / 90x43 | 0.49 / 0.48 y | The small pad, normal and half-sunk (same shape), graded to w2-props#lily |
| w2-pad-big-sunk | 170x86 | 0.97 y | The big Victoria going under, graded to M-03-a (M-03-a stays its normal look) |
| w2-pad-ripple | 120x34 (scale per pad) | 0.38 y | The "under" decal: rings + a faint pad shape; its flat fill is see-through to alpha 0.12 |
| w2-crown-bud / -open | 46x89 / 110x108 | 1.00 / 1.21 y | The crown lily's flower, closed then open, on M-02-a (the giant pad, existing) |
| w2-bamboo-bounce | 153x150 | 1.68 **n** | A bent Guadua culm whose frond tuft is the landing. No mushroom |

## Slot map (EXACT NEXT STEP)
- **BUILD-21, riverArt.ts 'safe' look:** draw w2-shallow as drawRiverWater does the deep tile (top = surface - 4.5% of the tile), but a
  476 u repeat (same 134 u height). **Rule (lead 12:49 PM): the flat BED fill must never show.** Cap a shallow river's drawn depth at
  the strip, or draw the bank's earth under the bed. Use it for every splash-back river, and for every river on Easy.
- **BUILD-21, drawRiverLog:** use w2-loglong for the long-log row (about p.width >= 300; logLong below that). Bark top about 0.2 down, as today.
- **BUILD-21, 2-1 beat 7:** w2-bamboo-bounce is World 2's bounce look, in place of bounce#cap-w2/stalk-w2. Foot flat on the bank; the
  landing is the tuft at the top. Scale is flagged n: 1.68x Pokey, because the culm holds the tuft up, as a 'support' does
  (precedent: ART-678b). **The lead rules on this.** If the bounce must be at most 1.0, it gets re-cut smaller from the same take, at no cost.
- **ENG-22, ride.ts sinking pads:** small pad: w2-pad-small (normal; shiver = this pad jiggled), then w2-pad-small-sunk, then
  w2-pad-ripple (under). Big pad: M-03-a, then w2-pad-big-sunk, then w2-pad-ripple at about 200 u. Place them as drawLily does (surfaceY - h*0.55).
- **ENG-22, crown lily (2-2 NEW 3-4):** M-02-a at about 300 u, with w2-crown-bud on its centre; swap to w2-crown-open when he lands.
  Both stems are cut level: draw the flower before the pad's front rim, or set the foot on the pad's centre.

## Polish check (the sheet: reference/qa-reports/ART-W2/sheet-beside-pokey.jpg, real 2-1 frames, upright + sideways; a mock-up)
- Deep and shallow read apart at a glance on the phone, both orientations: PASS (the sheet's top row).
- No magenta rim or halo on any piece, on a dark river backing: PASS after the pink-flood fix (the first key left a halo on the open
  flower and a lilac ring under the small pads).
- Swap states match their normal art: PASS after grading. The first cut was lime against W2's sage pads, and the big sunk pad was
  brighter than M-03-a.
- Shallow wrap: PASS (diff 0.79, no stone doubled at the join; reference/qa-reports/ART-W2/shallow-wrap-2x.jpg).
- Whole screen (D79): nothing else in the frames changed. The 2-1 frames are the base build as it is.
- NAMED, OPEN: the flat BED fill (slot rule above); the bounce's scale (the lead's ruling).
- The sheet is a paste-up at game scale, not an engine render. The real stills belong to BUILD-21/ENG-22 once wired.

## Gates (scoped, law 5: assets + inventory JSON under src/)
tsc PASS; src/game/art tests PASS; artcheck PASS; knowncheck PASS; generality PASS; full unit suite (3 shards): SEE BELOW.
roadmapcheck: blocked by this container's shallow clone ("proofs cannot be checked (fetch-depth 0)"), not by this change; CI runs it.

## Method used / Lessons applied / Method update
- Method: reference/methods/hf-art.md (img2img from paste-ups of W2's own pieces; text-to-image for the free-standing props), with
  ART-18's one-sandbox route (sbx.py parts).
- Lessons applied: D41 (sized against 89.1); D79 (whole frame judged); D30 (times from date); law 8 (the token was only ever
  forwarded into the sandbox); inventory first (logLong, the deep tile, the W2 stones, M-02-a and M-03-a reused or graded to).
- Method update (proposed for hf-art.md):
  (1) A large hf_sandbox_fs cat is saved to a tool-results FILE, not read into context, so pull the whole carrier and rebuild it
  with tools/art/hfw2/fetch.py. 23 reads cost almost no context.
  (2) Text-to-image "magenta" comes back as soft pink with gradients. Key it by a flood from the border (cut.py), never by hue:
  a hue key eats pink petals and crimson rims.
  (3) Wrap a strip with a bed by cutting at stone-free columns (wrap.py). A plain cross-fade ghosts the stones.

## Learned (for the next art member)
Lay the starts out from the world's own painted pieces, and the img2img takes match that world on the first pass. Then grade each
new state to the existing piece it swaps with before judging the sheet.
