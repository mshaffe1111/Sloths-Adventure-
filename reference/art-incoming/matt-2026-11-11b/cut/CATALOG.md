# Matt's fourth batch, 11 sheets of 2026-11-11 from the lead's prompts: cut catalog (R-165.85 / R-165.100)

11 sheets in (`reference/art-incoming/matt-2026-11-11b/01.jpg`-`11.jpg` on ccr-ca657d3c-n09zty), all 1024 x 1024. **45 pieces kept, 0 rejected**. Ids `P-<sheet>-<letter>`; kept PNGs in `src/assets/w1-1111b/` (nothing placed). No 600 px floor this batch (the lead): every piece's size is in the table.

Checks run from the start:
- **Pink:** edgefix on every piece, then the widened pinkscan. It finds **0 edge pixels on all 45**.
- **Flatness:** the 3 px flatness test on every walk line.
- **Visibility:** zeroing the colour under alpha 0 left every visible pixel unchanged.
- **Sheet 10's soft mist and waterfall, sheet 09's steam and sheet 07's nettle glow** were unmixed from the magenta (`cutter/softfix.py`): each is now real see-through, with no pink halo. The waterfall's leftover violet was moved back to blue (`waterfix.py`). Nothing had to be rejected.
- **Sheet 01's pit** had its inside painted in the magenta's own hue; it is now a near-black shaft (`pitfix.py`).

**Angled, not side view:** P-02-a, P-02-b, P-02-c, P-02-d, P-08-c, P-11-c (sheet 02, the 08 stairs, the 11 palisade). **Too small for their likely on-screen size** (set pieces at 300-500 px, about 2x upscale on a phone): P-08-c, P-08-d, P-10-a, P-10-d, P-11-a, P-11-c, P-11-d. Blocks, steps, stumps, plants and strips are fine at their size.

**Strips (03/04):** none tiles end to end as painted. The long strip P-04-c and the moss strips have rounded, outlined ends, which show as a notch when two copies butt together; overlap about 15 px, or trim the ends square. The leaf strip P-01-a has straight ends, but its colours differ across the wrap (a visible seam).

## Counts per kind

| Kind | Kept | Rejected | fits W1 | fits W2 |
|---|---|---|---|---|
| block | 14 | 0 | 7 | 7 |
| danger-looking | 8 | 0 | 5 | 0 |
| den or hide spot | 1 | 0 | 0 | 0 |
| ground strip | 10 | 0 | 10 | 0 |
| plant or dressing | 2 | 0 | 0 | 1 |
| rock | 4 | 0 | 0 | 1 |
| step set piece | 3 | 0 | 0 | 1 |
| walkable log or plank | 3 | 0 | 1 | 2 |
| **total** | **45** | **0** | **23** | **12** |

Per sheet: 01: 4, 02: 4, 03: 4, 04: 5, 05: 4, 06: 4, 07: 4, 08: 4, 09: 4, 10: 4, 11: 4.

## By world (Matt, 11-11: "determine where they work the best... some may work in multiple worlds")

Every world a piece fits, judged by material and mood (STORY-KEEPER's ten worlds); **bold** = that world is the piece's best fit. The gap is what reference/art/KIT-AUDIT.md (11-06) says the world's kit is short of. **Made things are never World 1** (the lead, 11-11: no made things in the home forest; rope is a made thing, like the lantern): ladders, rope bridges and rope posts, crates, barrels, the lever, sawn posts and boards, carved totems and carved or rune stones go to W2 Sunlit Riverbank (rope and wood work) or W7 Ancient Ruins (carved stone, the lever). Natural pieces (rock, stump, log, root steps, moss, fungus) stay as tagged.

**World 1 flat tops left** (pieces you can stand on that still fit W1, after the made-things and sawn-wood rulings): **18**: P-01-a, P-01-b, P-01-c, P-02-a, P-03-a, P-03-b, P-03-c, P-03-d, P-04-a, P-04-b, P-04-c, P-04-d, P-04-e, P-05-a, P-05-b, P-05-c, P-05-d, P-06-a.

| World | Pieces (best fit in bold) | Its kit gap |
|---|---|---|
| 1 Emerald Canopy (23) | **P-01-a**, **P-01-b**, **P-01-c**, **P-01-d**, **P-02-a**, **P-03-a**, **P-03-b**, **P-03-c**, **P-03-d**, **P-04-a**, **P-04-b**, **P-04-c**, **P-04-d**, **P-04-e**, **P-05-a**, **P-05-b**, **P-05-c**, **P-05-d**, **P-06-a**, **P-07-a**, P-07-b, **P-07-c**, P-07-d | floor kinds (stones, stumps, logs), a painted thorn hazard |
| 2 Sunlit Riverbank (12) | P-02-a, P-02-b, **P-02-c**, **P-02-d**, **P-06-b**, **P-06-c**, **P-06-d**, P-10-b, **P-11-a**, **P-11-b**, **P-11-c**, **P-11-d** | docks, rafts, floor kinds, painted water |
| 3 Mossy Grotto (21) | P-01-a, P-01-b, P-01-c, P-01-d, P-03-a, P-03-b, P-03-c, P-03-d, P-04-a, P-04-b, P-04-c, P-04-d, P-04-e, P-05-a, P-05-b, P-05-c, P-05-d, P-08-d, P-10-a, P-10-c, P-10-d | floor kinds, darker shelves |
| 4 Mist Cascades (7) | **P-02-b**, P-02-d, P-09-a, **P-10-a**, **P-10-b**, **P-10-c**, **P-10-d** | floor kinds, a painted hazard |
| 5 Orchid Sanctuary (11) | P-01-a, P-02-a, P-03-b, P-04-b, P-05-a, P-05-b, P-05-d, P-06-a, P-07-a, **P-07-b**, P-07-d | its own floor (no branch, log, liana or perch) |
| 6 Deep Mangrove (23) | P-01-b, P-01-c, P-01-d, P-02-c, P-03-a, P-03-c, P-03-d, P-04-a, P-04-c, P-04-d, P-04-e, P-05-c, P-06-a, P-06-b, P-06-c, P-06-d, P-07-a, P-07-b, P-07-c, P-10-d, P-11-a, P-11-b, P-11-d | variety (one log tiled three times) |
| 7 Ancient Ruins (5) | **P-08-a**, **P-08-b**, **P-08-c**, **P-08-d**, P-09-d | rubble blocks, fallen columns, root-split slabs |
| 8 Twilight Treetops (3) | P-07-c, **P-07-d**, P-11-b | a painted hazard, floor kinds |
| 9 Volcanic Jungle (4) | **P-09-a**, **P-09-b**, **P-09-c**, **P-09-d** | floor kinds |
| 10 Stormy Highlands Fortress (5) | P-02-b, P-09-a, P-10-a, P-10-c, P-11-c | anything but the iron grate |

## Every piece

| id | label | kind | size | walk y (x0-x1) flat | worlds, best first | why | float | notes |
|---|---|---|---|---|---|---|---|---|
| P-01-a | leaf-litter ground strip | ground strip | 495x200 | 6 (0-492) 0.99 | 1 Emerald Canopy; 5 Orchid Sanctuary; 3 Mossy Grotto | leaf-litter forest ground: the canopy floor; fills the W1 ground band gap | grounded | Straight ends but the colours differ across the wrap (mean 25 levels): a visible seam if tiled; blend or overlap. |
| P-01-b | mossy earth block with roots | block | 346x343 | 9 (2-340) 0.85 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | mossy earth block with roots | grounded | Square earth block, moss top. |
| P-01-c | mossy earth block with roots | block | 366x347 | 10 (3-363) 0.86 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | twin of P-01-b | grounded | Twin of P-01-b. |
| P-01-d | narrow pit between two earth lips | danger-looking | 469x275 |  | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | a narrow earthen pit: fills the W1 pit gap; grotto and swamp edges | grounded | A one-piece narrow pit: the lips are square blocks (not separate left and right caps). The pit inside was painted in the ground's hue; it is now a near-black shaft (cutter/pitfix.py) so the drop reads as deep. A thin dark line crosses the top of the gap as painted. |
| P-02-a | grassy earth slab | block | 518x198 | 31 (22-492) 0.74 | 1 Emerald Canopy; 2 Sunlit Riverbank; 5 Orchid Sanctuary | grassy earth slab (angled) | grounded | FLAG: angled, not side view (drawn at a 3/4 angle, the top shows).  |
| P-02-b | gravel earth slab | block | 476x157 | 6 (26-449) 0.95 | 4 Mist Cascades; 2 Sunlit Riverbank; 10 Stormy Highlands Fortress | gravel slab: cliff path, riverbank, highland track | grounded | FLAG: angled, not side view (drawn at a 3/4 angle, the top shows).  |
| P-02-c | plank-topped earth slab | block | 508x185 | 7 (40-474) 0.92 | 2 Sunlit Riverbank; 6 Deep Mangrove | plank-topped slab: the plank deck is worked wood (made thing: never W1) | grounded | FLAG: angled, not side view (drawn at a 3/4 angle, the top shows). The plank top is a made thing. |
| P-02-d | pebbled earth slab | block | 483x185 | 15 (28-456) 0.81 | 2 Sunlit Riverbank; 4 Mist Cascades | pebbled slab: riverbank first | grounded | FLAG: angled, not side view (drawn at a 3/4 angle, the top shows).  |
| P-03-a | moss-root ground strip | ground strip | 459x127 | 5 (4-456) 1.0 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | moss-root ground strip: the W1 ground band asked for | grounded | Ends are rounded and outlined, so it does not tile end to end without overlapping the next piece by about 15 px. Side view, flat top. |
| P-03-b | moss-root strip with leaf litter | ground strip | 466x133 | 7 (2-462) 0.86 | 1 Emerald Canopy; 5 Orchid Sanctuary; 3 Mossy Grotto | moss-root strip with leaf litter | grounded | Ends are rounded and outlined, so it does not tile end to end without overlapping the next piece by about 15 px.  |
| P-03-c | rounded end cap | ground strip | 406x121 | 6 (4-393) 0.93 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | ground end cap | grounded | The end of a ground run. |
| P-03-d | step up with roots | ground strip | 455x199 | 83 (3-220) 0.82 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | ground step with roots | grounded | A one-step rise in the ground line. |
| P-04-a | moss-root ground strip | ground strip | 459x126 | 4 (1-454) 0.99 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | moss-root ground strip | grounded | Ends are rounded and outlined, so it does not tile end to end without overlapping the next piece by about 15 px. Near-twin of P-03-a. |
| P-04-b | moss-root strip with leaf litter | ground strip | 467x133 | 7 (4-464) 0.9 | 1 Emerald Canopy; 5 Orchid Sanctuary; 3 Mossy Grotto | moss-root strip with leaf litter | grounded | Ends are rounded and outlined, so it does not tile end to end without overlapping the next piece by about 15 px. Near-twin of P-03-b. |
| P-04-c | long strip | ground strip | 965x108 | 5 (4-958) 0.99 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | long ground strip | grounded | The long strip (965 px): ends are rounded and outlined, so it does not tile end to end without overlapping the next piece by about 15 px. Checked by placing two copies end to end. |
| P-04-d | rounded end cap | ground strip | 184x118 | 7 (2-171) 0.83 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | ground end cap | grounded | Near-twin of P-03-c. |
| P-04-e | end cap and step joined | ground strip | 737x200 | 54 (3-376) 0.93 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | ground cap and step | grounded | Cap, run and a step up in one piece. |
| P-05-a | short moss help step | block | 332x123 | 6 (3-317) 0.92 | 1 Emerald Canopy; 3 Mossy Grotto; 5 Orchid Sanctuary | moss help step | grounded | Rounded-end moss block: a low help step. |
| P-05-b | moss help step, tall | block | 412x289 | 6 (6-395) 0.93 | 1 Emerald Canopy; 3 Mossy Grotto; 5 Orchid Sanctuary | moss help step | grounded | Taller moss block with roots. |
| P-05-c | moss help step, tallest | block | 337x411 | 6 (3-325) 0.9 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | tall moss step | grounded | Tall moss block; a ledge or wall step. |
| P-05-d | moss block with a flat top band | block | 454x158 | 3 (3-435) 1.0 | 1 Emerald Canopy; 3 Mossy Grotto; 5 Orchid Sanctuary | moss ledge | grounded | Long low moss ledge with a flat band on top. |
| P-06-a | mossy fallen log, flat top | walkable log or plank | 446x165 | 20 (19-431) 0.84 | 1 Emerald Canopy; 6 Deep Mangrove; 5 Orchid Sanctuary | natural fallen log, flat top: a W1 flat top; fills 5 log | may float | Natural fallen log with a flat top; no sawn ends. |
| P-06-b | sawn ring-top stump | block | 408x164 | by hand | 2 Sunlit Riverbank; 6 Deep Mangrove | sawn (a made thing): ring-top stump: the village | grounded | Sawn (a made thing): not World 1 (the lead). No flat top: the silhouette top near y 11 (x 57-345) is only 28% within 3 px of level; stand line by hand. |
| P-06-c | sawn ring-top stump | block | 337x312 | 8 (17-313) 0.5 | 2 Sunlit Riverbank; 6 Deep Mangrove | sawn (a made thing): ring-top stump: the village | grounded | Sawn: not World 1. |
| P-06-d | tall sawn ring-top stump | block | 344x477 | by hand | 2 Sunlit Riverbank; 6 Deep Mangrove | sawn (a made thing): tall ring-top stump: the village | grounded | Sawn: not World 1. No flat top: the silhouette top near y 10 (x 5-325) is only 28% within 3 px of level; stand line by hand. |
| P-07-a | thorn bramble | danger-looking | 453x378 |  | 1 Emerald Canopy; 5 Orchid Sanctuary; 6 Deep Mangrove | thorn bramble: W1's own painted hazard | grounded | Reads as danger: a painted thorn hazard. |
| P-07-b | snapping plant | danger-looking | 356x391 |  | 5 Orchid Sanctuary; 1 Emerald Canopy; 6 Deep Mangrove | snapping plant: the orchid garden's carnivorous plants first (fills 5 hazard); W1 | grounded | Venus-trap jaws: reads as danger. |
| P-07-c | thorn-covered log | danger-looking | 475x167 |  | 1 Emerald Canopy; 6 Deep Mangrove; 8 Twilight Treetops | thorn-covered log: W1 hazard | grounded | A log bristling with thorns: a hazard, never a landing. |
| P-07-d | glowing nettles | danger-looking | 449x395 |  | 8 Twilight Treetops; 1 Emerald Canopy; 5 Orchid Sanctuary | glowing nettles: the glow reads best at night (fills 8 painted hazard); W1 | grounded | The glow was blended into the magenta; unmixed (cutter/softfix.py). A warm pink-orange glow remains around the tips, as painted. |
| P-08-a | carved block with thorny vines | danger-looking | 453x259 |  | 7 Ancient Ruins | carved block under thorny vines: a ruins hazard (made thing: never W1) | grounded | The thorns on top make it a hazard, not a step (the lead). |
| P-08-b | ruin column | block | 219x353 | 4 (6-214) 0.75 | 7 Ancient Ruins | fluted ruin column: fills 7 fallen columns (made thing: never W1) | grounded | Broken fluted column: a standable pillar top. |
| P-08-c | ruin stairs | step set piece | 467x360 | by hand | 7 Ancient Ruins | ruin stairs (angled) (made thing: never W1) | grounded | FLAG: angled, not side view (drawn at a 3/4 angle, the top shows). Too small for its likely on-screen size: a set piece drawn at only a few hundred px; it would be upscaled about 2x on a phone.  |
| P-08-d | ruin arch | den or hide spot | 370x454 |  | 7 Ancient Ruins; 3 Mossy Grotto | carved ruin arch: ruins, a grotto entrance (made thing: never W1) | grounded | Carved stone arch with a dark doorway. Too small for its likely on-screen size: a set piece drawn at only a few hundred px; it would be upscaled about 2x on a phone.  |
| P-09-a | basalt slab | rock | 453x133 | 6 (5-451) 0.95 | 9 Volcanic Jungle; 10 Stormy Highlands Fortress; 4 Mist Cascades | basalt slab: the volcano; fills 9 floor | grounded | Dark basalt slab, flat-ish top. |
| P-09-b | lava-veined steps | step set piece | 447x208 | by hand | 9 Volcanic Jungle | lava-veined basalt steps | grounded | Basalt steps with glowing lava cracks: reads hot; decide if the veins hurt. |
| P-09-c | glowing lava crust | danger-looking | 479x212 |  | 9 Volcanic Jungle | glowing lava crust: the volcano's painted hazard | grounded | A painted lava hazard. |
| P-09-d | steaming stone vent | danger-looking | 421x537 |  | 9 Volcanic Jungle; 7 Ancient Ruins | steaming vent in laid stone: volcano; a ruins steam trap (made thing: never W1) | grounded | Stone-block vent with steam; the steam was unmixed from the magenta (softfix.py) and is now see-through grey. |
| P-10-a | dripping cliff ledge | rock | 464x352 | 7 (13-462) 0.81 | 4 Mist Cascades; 10 Stormy Highlands Fortress; 3 Mossy Grotto | dripping cliff ledge: the mist cascades; fills 4 floor | grounded | Overhanging mossy cliff ledge with drips. Too small for its likely on-screen size: a set piece drawn at only a few hundred px; it would be upscaled about 2x on a phone.  |
| P-10-b | stone with a waterfall | rock | 458x341 | by hand | 4 Mist Cascades; 2 Sunlit Riverbank | stone with a waterfall: the cascades, the river | grounded | The waterfall's soft edges were unmixed from the magenta, and its leftover violet cast moved back to blue (softfix.py, waterfix.py); clean on dark and light. No flat top: the silhouette top near y 22 (x 33-423) is only 23% within 3 px of level; stand line by hand. |
| P-10-c | pillar in mist | rock | 543x448 | by hand | 4 Mist Cascades; 3 Mossy Grotto; 10 Stormy Highlands Fortress | pillar in mist: cascades first | grounded | The mist was unmixed from the magenta: now see-through grey, no pink halo. No flat top: the silhouette top near y 12 (x 153-367) is only 20% within 3 px of level; stand line by hand. |
| P-10-d | root curtain | plant or dressing | 420x480 |  | 4 Mist Cascades; 6 Deep Mangrove; 3 Mossy Grotto | root curtain: behind a waterfall, mangrove, grotto | attached | A hanging curtain of roots: hide behind it, or a climb. Too small for its likely on-screen size: a set piece drawn at only a few hundred px; it would be upscaled about 2x on a phone.  |
| P-11-a | scaffold | step set piece | 399x350 | by hand | 2 Sunlit Riverbank; 6 Deep Mangrove | lashed scaffold: the village (made thing: never W1) | grounded | Lashed pole scaffold: a made thing. Too small for its likely on-screen size: a set piece drawn at only a few hundred px; it would be upscaled about 2x on a phone.  |
| P-11-b | rope bridge | walkable log or plank | 487x146 | 18 (5-482) 0.64 | 2 Sunlit Riverbank; 8 Twilight Treetops; 6 Deep Mangrove | rope bridge: river crossing, treetop walkway (made thing: never W1) | attached | Rope-and-plank bridge: tie both ends. |
| P-11-c | palisade | plant or dressing | 447x423 |  | 2 Sunlit Riverbank; 10 Stormy Highlands Fortress | palisade: the village wall, the fortress (made thing: never W1) | grounded | FLAG: angled, not side view. Sharpened stakes: the points can read as danger. Too small for its likely on-screen size: a set piece drawn at only a few hundred px; it would be upscaled about 2x on a phone.  |
| P-11-d | dock with water | walkable log or plank | 489x186 | 25 (3-467) 0.72 | 2 Sunlit Riverbank; 6 Deep Mangrove | dock over water: fills 2 docks (made thing: never W1) | grounded | Plank dock on posts over a strip of painted water. Too small for its likely on-screen size: a set piece drawn at only a few hundred px; it would be upscaled about 2x on a phone.  |

## Rejected

none

## Against the open gaps

- **Filled:** the W1 ground band (P-03, P-04, P-01-a strips, the end caps and the steps), a W1 pit (P-01-d, one piece; still no separate left and right lip caps), W1 painted hazards (P-07: bramble, snapping plant, thorn log, nettles), W7 columns and stairs, the W9 lava hazard, the W4 cliff ledge and waterfall, the W2 scaffold, palisade, dock and rope bridge.
- **Still open:** pit floors and separate lip caps; ground strips that tile end to end; anything at 2000 px.

