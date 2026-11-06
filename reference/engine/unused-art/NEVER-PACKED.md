# Art never packed into the game (part 2, 2026-11-05)

Part 1 (`IN-GAME-UNUSED.md`) lists art that IS packed in `src/assets` but never drawn. This file lists painted or generated art that
sits OUTSIDE the game and was never packed at all: Matt's Gemini sheets and the cells cut from them, the animation and boss sheet
libraries, story art, and the cut-out folders under `tools/art`. Every piece below was checked against `src/assets/**`, the atlas
tables in `src/game/*Data.ts`, and the cutter/packer scripts that read the sheet (which cells each one takes).

## Summary

| Kind | Rows | Never packed | Rejected | Unclear |
|---|---|---|---|---|
| Enemies and creatures (stills) | 14 | 212 cells (112 are Venom Fang set 1, 40 are old-hero cut-outs, 16 reaver frames) | 0 | 1 row (hummingbird cells) |
| Animation | 9 | 19 moves (184 cut frames) + 9 captioned pair-pose sheets | 0 | Dot sheet cells (see note) |
| Platforms and ground pieces | 7 | 11 | 0 | 12 (two superseded Gemini takes) |
| Props and hazards | 19 | 49 (+3 hollow logs already in part 1) | 3 (w2 cages take 1) | 3 scraps |
| Backdrops | 6 | 3 paintings + 1 alternate strip | 2 strips | 1 scene |
| UI and story | 5 | 1 concept painting | 1 | 2 |

In all 60 rows and about 300 never-packed pieces (212 + 19 moves + 11 + 49 + 4 + 1: cells, clip moves or whole paintings). "Packed but unused" does not appear here: that
is part 1, and where a piece here has a packed twin the row says so.

**The biggest find:** Matt's whole World 6 Gemini set (`reference/prop-sheets/w6/kit.jpg`, `water.jpg`, `caiman-items.jpg`,
`runners.jpg`) is mostly unpacked. `src/game/gen2/worlds/w6.ts:16-19` names the kit's cells as decor keys and says plainly "The sheets
are not packed into an atlas yet". Only the calm-water strips, ring and bubbles (`calmWaterArt.ts`) and the dirty water were used. The
otter runners, the moss-log caiman, the mangrove platforms and the water hazards have never been in the game.

**Out of reach of this check:** the losing HF takes of every batch (backdrops, ground, props, plates, bosses, creature clips) live
only in the Hugging Face bucket `mshaffe111/w5-xfer` (35 top-level folders: anim, clips, hfbackdrops, hfbackdrops2, hfbatch,
hfboss910a-c, hfground, hfprops, w6to10, ...). In the repo they show only as review contact sheets. Notes that name bucket-only art
that was painted and kept on purpose: `hf-backdrops/NEXT.md:57` (w10after middle and near takes, `hfbackdrops/batch/props/w10after-*`),
`hf-backdrops2/NEXT.md:24` (upright sky takes `hfbackdrops2/hfbd2-S0|S1/`), `hf-cutscenes/NEXT.md:52` (W9 dusk third try
`wp-9-dusk-x62-full.png`, dropped).

## Best candidates for the level engine's piece library

Finished-looking, on-model, and enough poses or pieces to build with:

1. **W6 mangrove kit** (`tools/art/w6/cut/kit-01..16.png`): the aerial-root platform (kit-03), the mossy log (kit-05), the broken
   stump ledge (kit-06), two root arches (kit-01, kit-02), the hollow stump (kit-11), the root den (kit-14), the low stump (kit-15).
   Platforms and hides for World 6; `w6.ts` already has the art keys waiting.
2. **Otter runners** (`tools/art/w6/cut/runners-01..16.png` + `reference/animation-sheets/runners/` scamper, swim, jab clips): a
   complete spear-otter enemy with walk, swim and attack. `w6.ts:9-10`: "not a creature yet: Matt picks new creature designs".
3. **Moss-log caiman** (`tools/art/w6/cut/caiman-items-01..08.png` + `animation-sheets/caiman/snap`, 17 frames): a log that opens
   its eye and snaps. A disguised hazard, very different from the game's green caiman (`enemies/caiman-atlas.webp`).
4. **W6 water hazards** (`tools/art/w6/cut/water-03, 13, 14, 07, 08`): a breaking wave, a whirlpool, a falling-water column, a
   root mass under water, a root wall with a gap. Painted hazards Matt asked for (dirty/fast water rule).
5. **Beetle clips** (`animation-sheets/beetle/` waddle, eat, sleepy, sleep, 39 frames): the bow-tie beetle the puzzle kit uses as
   stills only.
6. **W7 puzzle take 1** (`gemini-batch-2026-10-28/w7a-puzzle-take1.jpg`): stone lever up/down, two maze plates, a carved door shut
   and open. Take 2 is packed; take 1 is a second World 7 look for the same room.
7. **Butler clips** (`animation-sheets/butler/` walk 8, horror 19) and 8 unpacked Butler cells (`tools/art/w5puzzle/cut/butler-*`).
8. **Crab and piranha clips** (`animation-sheets/crab/` walk, snap; `piranha/` chomp, leap) and the piranha school
   (`caiman-items-12`): older-model alternates of creatures the game has.
9. **W6 backdrops**: `w6/backdrop-mudflats.jpg` (6-4 Low Tide's mudflats, exactly the stage's theme) and
   `w6/backdrop-fireflies.jpg` (6-6 Lights in the Roots). `w5puzzle/backdrop-dawn.jpg` (orchid dawn) for World 5.
10. **Flicker hover/fly/perch clips** (`animation-sheets/flicker/`, 26 frames): the game's Flicker has talk/blink/dart etc.
    (`flickerAnimData.ts`) but none of these three loops.

Also strong but needing a decision: the Venom Fang set 1 (112 cells, README says incomplete), the reaver walk takes (no clean walk).

---

## 1. Enemies and creatures

| Path | What it is | World | Status | Note / line that says so |
|---|---|---|---|---|
| `reference/prop-sheets/w6/runners.jpg` (cut: `tools/art/w6/cut/runners-01..16.png`) | 16 poses of the Reaver's otter runners: scamper with fish basket, standing with spear, jab, swim, dive, upright, lying, hurt | 6 | never packed | `src/game/gen2/worlds/w6.ts:9`: "The Reaver's runners (the otters with spears, Matt's runners sheet) are not a creature yet" |
| `reference/prop-sheets/w6/caiman-items.jpg` cells 1-8 (`tools/art/w6/cut/caiman-items-01..08.png`) | the moss-log caiman: disguised as a log, eye opening, jaws open (2), eyes shut | 6 | never packed | game caiman is a different design (`src/assets/enemies/caiman-atlas.webp`, `caimanAtlasData.ts` "pack_cai.py from the Gemini caiman sheets"); `animation-sheets/manifest.json` caiman: "the caiman root" |
| `caiman-items-12.png` | a school of four piranhas | 6 | never packed | no packer reads caiman-items (`tools/art/w5puzzle/cut.py:33` cuts it for looking only) |
| `caiman-items-15.png` | crab, front view | 6 | never packed | game crab is an HF clip set (`w6to10/creatures/crab.json`) |
| `caiman-items-16.png` | green frog sitting on a lily pad | 6 | never packed | game frog is `enemies/frog-atlas.webp` (different art) |
| `reference/prop-sheets/gemini-batch-2026-10-28/reaver-walk-take1.jpg` | 8 Marsh Reaver frames with spear, grey sheet | 6 | never packed | `reference/STATUS.md:298`: "reaver-walk-take2 (still no walk: use 2-3 poses for a code-driven walk)" |
| `.../reaver-walk-take2.jpg` | 8 more Reaver frames, near-identical stance | 6 | never packed | same line; `reaverAtlasData.ts` comes from earlier sheets |
| `reference/boss-sheets/venom-fang/venom-fang-set1-sheet1..7.jpg` | Matt's redrawn Venom Fang, 112 cells: coiled idles, rearing, strikes, lunges, tail up, glide, ring coil, ball | boss (W1-2 lair) | never packed | `boss-sheets/README.md`: "the fight is not switched over until the pose set is complete" (no spit, hurt, stun, dead) |
| `tools/art/w5puzzle/cut/butler-02,04,08,09,10,11,12,16.png` (of `w5puzzle/butler.jpg`) | Butler cells: wide-eyed shock, teapot flying off the tray, upside-down fall, walking with tray (2), grumpy walk, apron stare, back view | 5 | never packed | `tools/art/w5puzzle/packmeeca.py:45` packs only cells 1,3,5,6,7,13,14,15; `enemies/butler-poses.webp` is a model's stills (`butlerAtlasData.ts:1`) |
| `tools/art/w5puzzle/cut/flicker-06,09,11.png` | Flicker cells (expressions) | 5 | never packed | `packmeeca.py:43` packs 1,2,3,5,8,13,14,15,16; cells 4,7,10,12 live on only as clip starts (`tools/art/w6to10/flickergpu.py:30-43` smug/shrug/doze/dart) |
| `tools/art/w5puzzle/cut/camp-07.png` | General's soldier standing alarmed | 5 | never packed | `packmeeca.py:48` CAMP skips 7, 13, 14 |
| `tools/art/w5puzzle/cut/meeca-carry-02,12,14,15,16.png` | Meeca with the pinecone: waving it, bent low, pointing up, talking, leaping | 5 | never packed | `packmeeca.py:36` packs 1,3-11,13 |
| `reference/animation-sheets/slomatt/cutouts/` 40 files (s2_01-04, s2_07-14, s3_10-16, s4_03, 09, 10, 13, 15, s5_01-16) | old-hero Pokey cut-outs, ~147 px: butt-slide from behind (12), fall/knockdown, kicks, punch, run cycle (16), cheer | any | never packed | the other 40 are `src/assets/photos/*.webp`; README: too small next to the hero atlas ("would look soft") |
| `reference/story-art-incoming/sequel-2026-10-30/25-meeca-sets-off-sheet.jpg` cells 4-5 | a hummingbird (cell 4) and Meeca with the hummingbird (cell 5) | sequel | unclear | cells 1-3 are packed as `pk.scarf_*` (`storyCelData.ts:138-141`); no frame for the bird found |

## 2. Animation (clip frames cut, never packed)

All in `reference/animation-sheets/`, each with `meta.json` (frames, anchor, fps). Made by `tools/art/anim/` from Matt's Gemini cells
(starts named in `tools/art/anim/prep_starts.py:17-31`). The manifest says of each "not yet in the game"; checked: no atlas in
`src/assets` holds these moves.

| Path | What it is | World | Status | Note |
|---|---|---|---|---|
| `flicker/hover, fly, perch` (9+7+10) | Flicker hover and fly loops, perch-and-settle | 5+ | never packed | `flickergpu.py:7`: "The hover, fly and perch loops already exist ... and are not redone"; `flickerAnimData.ts` has none of them |
| `meeca/carry, throw` (8+7) | Meeca carry-walk with the pinecone, throw | 5 | never packed | Meeca's carry in game is still cells `mc*` (`meecaArt.ts:108-114`) |
| `beetle/waddle, eat, sleepy, sleep` (8+13+11+7) | bow-tie beetle | 5 | never packed | puzzle kit uses beetle stills `b1-16` (`packkit.py`) |
| `butler/walk, horror` (8+19) | huffy walk, splash-horror one-shot | 5 | never packed | |
| `runners/scamper, swim, jab` (8+8+9) | otter runner loops and spear jab | 6 | never packed | see runners row above |
| `caiman/snap` (17) | moss-log caiman: disguised, eye opens, snaps, settles | 6 | never packed | |
| `crab/walk, snap` (7+9) | crab from older clips | 6-10 | never packed | game crab is the later HF set (`w6to10/creatures/crab.json`) |
| `piranha/chomp, leap` (10+9) | piranha from older clips | 6-10 | never packed | game piranha is `w6to10/creatures/piranha.json` |
| `reference/animation-sheets/slomatt-and-jennifur/01..09` | 9 captioned sheets of Pokey and Meeca together: hugs, hand-in-hand, conversation gestures (some "Corrected"), Pokey's 16 expressions, a shared move/combat sheet | story | never packed | no cutter reads them (grep of `scripts/`, `tools/`); numbered and captioned, old outfits on 01-04 |

Packed from the same library (for completeness): `pokey-swim` (`heroSwimData.ts`), `story/` (278 of 288 cells, README), Slomatt
standard set and action studies (cell picks in `scripts/cutStandard.py`, `cutStudies.py`, `cutPokeyStory.py`), `jennifur/` (via
`cutMeeca.py` and `old-atlas`), `snake-gold` (goldsnake art), `dot/standard-set` (`dotAtlasData.ts`, "Matt's Dot sheets"; the 512 px
atlas holds only a subset of the 160 cells: which cells were taken is not recorded, so the rest are **unclear**).

## 3. Platforms and ground pieces

| Path | What it is | World | Status | Note |
|---|---|---|---|---|
| `reference/prop-sheets/w6/kit.jpg` cells 3, 5, 6 (`tools/art/w6/cut/kit-03, 05, 06.png`) | aerial-root platform (mossy top on prop roots), mossy log, broken stump with a mossy ledge | 6 | never packed | `w6.ts:16-19`: "The sheets are not packed into an atlas yet: the art keys here name their cells" |
| `kit-01, 02` | two mangrove root arches (bare, mossy) | 6 | never packed | `w6.ts:142` decor key `rootArch` |
| `kit-11, 14, 15` | hollow stump, root den (hide), low stump | 6 | never packed | decor keys `hollowStump`, `lowStump` |
| `kit-16` | knobbed climbing pole | 6 | never packed | |
| `reference/prop-sheets/gemini-batch-2026-10-28/w7a-puzzle-take1.jpg` | W7 stone lever up/down, two maze pressure plates, carved door shut and open | 7 | unclear (superseded take) | take 2 is packed (`src/assets/w6to10/gemini/w7a-puzzle-take2.webp`); no note on why take 1 lost |
| `.../w6b-water-room-take1.jpg` | W6 water room: raft on water, sluice wheel, gauge post, seesaw, boulder, lily pads | 6 | unclear (superseded take) | take 2 packed (`w6PropsData.ts:1`) |
| `tools/art/w4/blobs/w4p-pools-33_1, _2` | alternate seed of the stone pool, full and empty | 4 | never packed | `tools/art/w4/names.json` takes only 0, 3, 4 of pools-33 |

## 4. Props and hazards

| Path | What it is | World | Status | Note |
|---|---|---|---|---|
| `tools/art/w6/cut/water-03.png` (of `w6/water.jpg`) | a breaking wave | 6-10 | never packed | `calmwater/cut.py:5-8` takes only cells 1, 2, 5, 6 |
| `water-04` | water splash | 6 | never packed | same |
| `water-07, 08` | root mass under the waterline; root wall with a gap | 6 | never packed | |
| `water-09, 10` | snag on a mossy mound (plain; with a hanging hook/line) | 6 | never packed | |
| `water-11, 12` | mud puddle; seagrass clump | 6 | never packed | `w6.ts:142` decor key `seagrass` |
| `water-13, 14, 15, 16` | whirlpool (square tile), falling-water column, carved tide post, leafy bush in water | 6 | never packed | `w6.ts:131` has a `tidePost` prop with no art |
| `kit-04, 07, 08, 09, 10, 12, 13` | mangrove sapling tree, mud patch, reeds, lily pads, snag branch, hanging aerial root, Spanish moss curtain | 6 | never packed | decor keys `mangroveSprout`, `reeds`, `snag`, `aerialRoot`, `spanishMoss` (`w6.ts:142-145`) |
| `caiman-items-09, 10, 11` | big seed pod upright, lying, three hanging from a twig | 6 | never packed | |
| `caiman-items-13, 14` | tree trunk with a sealed letter and feather; blank paper sheet | 6 | never packed | |
| `tools/art/w5puzzle/cut/pieces-08..16.png` (of `w5puzzle/pieces.jpg`) | wooden chair, cobwebbed chair, silk-wrapped chair, wilted pot, potted vine, white flower, hand mirror, moonflower bud in a thorn frame, open moonflower in the frame | 5 | never packed | `packkit.py` takes pieces 1, 4, 5; `packmeeca.py:52` takes 2, 3, 6, 7 |
| `tools/art/w5puzzle/cut/tea-01, 02, 03, 05, 08.png` | teapot pouring, teacup pouring on a post (2), trough pour (second), white cloth | 5 | never packed | `packmeeca.py:54` takes 4, 6, 7, 9 |
| `tools/art/w5puzzle/cut/camp-13, 14.png` | lantern post unlit and lit | 5 | never packed | `packmeeca.py:48`; Meeca's stakes (`meeca-props` 14-15) stand in |
| `tools/art/w1to4/cut/w2-puzzle-15.png` | fishing net | 2 | never packed | `tools/art/w5puzzle/cut.py:36`: "the fishing net on w2-puzzle is pink and loses its colour: it is not used by a puzzle" |
| `tools/art/w4/blobs/w4p-cliff-33_1..4` | four small mossy falling rock chips | 4 | never packed | names.json skips them (debris for a crumble) |
| `tools/art/w4/blobs/w4p-pools-33_5`, `w4p-pools-11_5, _6, _8` | pink ribbon bow on its own; three wood splinters | 4 | never packed | fragments of packed pieces |
| `tools/art/w4/blobs/w4p-cliff-11_6`, `w4p-chimes-11_3`, `w4-capuchin2-11_7` | a sliver, a grass tuft, a fragment | 4 | unclear (scraps) | cut noise, not usable pieces |
| `reference/prop-sheets/gemini-batch-2026-10-28/w2-cages-take1.jpg` | three reed cages (whole, broken, opened) | 2 | rejected (superseded take) | take 2 packed (`w6to10/gemini/w2-cages.webp`); `w2/GRAB-BAG.md:19` keeps the HF round cage as the redraw candidate |
| `reference/prop-sheets/w1-props-1-puzzle-and-secrets.jpg` (bottom row) | three hollow-log variants | 1 | never packed | already in part 1 (`IN-GAME-UNUSED.md` W1); `w1/GRAB-BAG.md:25` places them in #19 |

## 5. Backdrops

| Path | What it is | World | Status | Note |
|---|---|---|---|---|
| `reference/prop-sheets/w6/backdrop-mudflats.jpg` | grey mangrove mudflats at low tide, wrecked boats, pale sun | 6 | never packed | no script or atlas names it; W6's sets are HF repaints (`backdrops/w6*.webp`) |
| `reference/prop-sheets/w6/backdrop-fireflies.jpg` | mangrove at night lit by thousands of fireflies, water below | 6 | never packed | same |
| `reference/prop-sheets/w5puzzle/backdrop-dawn.jpg` | orchid forest dawn, birches, misty hills | 5 | never packed | `night.py` uses only `backdrop-night-camp.jpg` |
| `reference/prop-sheets/gemini-batch-2026-10-29/w6-cave-murky-water-scene.jpg` | cave mouth over murky water, cross-section with mossy rocks under the surface | 6 | unclear | no note; reads as a concept for murky water, but would make a cave-pool plate |
| `tools/art/w4/dotstage/dotst-back-near-22.png` | alternate near strip for Dot's 4-D flight | 4 | never packed | `tools/art/dotstage/pack.py:53` takes near-11 and near-33 |
| `reference/prop-sheets/qa-notes/hf-backdrops/rejected/w6dawn-mid.webp`, `w9dawn-mid.webp` | W6 dawn and W9 dawn middle strips, first round | 6, 9 | rejected | `hf-backdrops/NEXT.md:38-42` "Redo the rejects"; redone in `hf-backdrops2/NEXT.md:8-10` |

Not listed as unused: `w1to4/backdrop-*` (all eight are the packed sets w1kapok, w1sunrise, w2rapids, w2evening, w3cavern,
w3sinkhole, w4mist, w4terraces), `w5puzzle/backdrop-night-camp.jpg` (`w5night-far.webp`), `w10after` (packed far strip: part 1).

## 6. UI and story

| Path | What it is | World | Status | Note |
|---|---|---|---|---|
| `reference/prop-sheets/gemini-batch-2026-10-28/story22-parents-storm-take1.jpg` | Pokey's parents on a branch in the storm, the glowing egg in the nest | story | unclear (superseded take) | `story22-parents-storm.jpg` is packed as `w6to10/story/parents-storm.webp` |
| `reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide/sheet5b-redo-satchel-wrong-unused.jpg` | Pokey from behind gripping, and cheering | 7 | rejected | the file name; `tools/art/slide74/cut.py:10-14` (satchel on the wrong side) |
| `reference/prop-sheets/gemini-batch-2026-10-29/7-4-slide-concept-gemini.jpg` | Pokey riding the 7-4 flume into a cave mouth, skull signs, fungus | 7 | never packed (concept) | `7-4-slide-mockup/v2/GEMINI-PROMPTS.md:3`: "The look to aim for is Matt's concept picture"; a reference, not a piece |
| `reference/prop-sheets/qa-notes/play-store/icon-512-standin.png` | stand-in launcher icon | UI | unclear | `reference/PLAY-STORE.md:35`: "FIXED (stand-in), FAIL (final art)" |
| `reference/prop-sheets/gemini-prompts/refs/01..04-*-ref.jpg` | reference pictures made to attach to Gemini prompts (W7 anchors, W7 walls, swim satchel, W4 falls) | 4, 6, 7 | not art (inputs) | `gemini-prompts/QUEUE.md` |

---

## What was skipped, and why

- **QA screenshots, before/after, contact and review sheets (`reference/prop-sheets/qa-notes/`, 2,487 images):** game shots
  (`*-upright*`, `*-sideways*`, `ba-*`, `after/`, `before/`, `compare/`, `audit/`, `fix-lead/`, `lookalike/sheets`, `painted-swaps/`,
  `w7/`, `w8/`, `polish-*`, `6-8-*`, `8-4-*`, `7-4-slide-mockup`, `rope/`, `swim/`, `hf-x14`, `hf-zones`, `hf-ui`), and 139 review or
  take sheets (`review-*`, `t-*`, `*-pieces.jpg`, `contact*`, `picks*`) whose picks are packed (stage art, gates, ground, bounce
  plants, signs, dressing, bosses, lairs, plates, story cards, chairs, fx, creatures). The losing takes on those sheets exist only as
  thumbnails here; the full pictures are in the HF bucket (see above).
- **Starts (inputs, not art):** 161 in `qa-notes/**/starts`, plus `tools/art/hfbatch/starts` (249), `hfground/starts` (155),
  `hfstory/starts*` and `livestarts` (50), `w6to10/prop-starts` (20), `combat/starts` (8), `hfpokey/starts` (2),
  `pokey-anim/starts` (22), `croc-defeat/starts` (3). Sampled (`hfstory/starts/w10-day.webp`, `w6to10/prop-starts/start-w8b.webp`):
  paste-ups and flat blockouts made to be repainted, not finished pieces.
- **`hf-backdrops/keyed/` (85):** copies of strips that are in `src/assets/backdrops`.
- **Already packed (checked, not listed):** `w1-props-1/2/3` (protoAtlasData, except part 1's hollow logs), the style sheets (made by
  `tools/art/w1to4/stylesheet.py` from packed art), `w1to4/*-puzzle` and `pokey-carry` (all cells but w2-puzzle 15, `packkit.py`),
  `w5puzzle` beetle, meeca-poses, meeca-props (all 16), `gemini-batch-2026-10-28` sheets in `src/assets/w6to10/gemini` and
  `w6to10/story`, `7-4-slide/sheet1-6` (`slide74/cut.py`), `hf-art-pokey/7-4-slide-2x` (copied over sheets 1, 5, 6),
  `pokey-rope-hand-over-hand.jpg` (`heroRopeData.ts`), `w6-dirty-fast-water-sheet.jpg` (`badWaterArt.ts`), all W4 named cuts
  (`tools/art/w4/cut`, `w4PropsData.ts`), sequel cards 23 and 24 (plates `storm-returns`, `nest-morning`).
