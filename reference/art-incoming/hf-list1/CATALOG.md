# Hugging Face picture list 1 (R-165.100): 16 kept, 2 to redo in list 2

Run 2026-11-11 on Matt's style model (Qwen-Image + mshaffe111/slothadv-style-lora). All of it is img2img from magenta paste-ups (`starts/`, made by `tools/art/hflist1/starts.py`), then cut with the 11-11b cutter. Five jobs, **$2.04** (cap $6.50; reference/art/HF-SPEND.md). Kept PNGs are in `src/assets/w1-1111c/` (nothing placed).
- `sheets/item1-4.jpg`: the kept pieces on dark and light (cyan = a flat top that passes the 3 px test).
- `sheets/takes-*.jpg`: every take next to its start.
- `sheets/seam-*.jpg`, `sheets/seam-pairs-light-2x.jpg`: two copies of each strip side by side at 2x.
- `redo/`: the two pieces sent back to list 2.

## Checks (attempt 2)
- **Pink:** the widened pinkscan finds 0 on all 16.
- **Size:** long sides are 1698-1888 px (all over 1500). No file over 4 MiB.
- **Strips tile:** cut, then the circular native pass (`striphdgpu.py`, s25), then `tools/art/hflist1/wrapfix.py`.
  - **Attempt 2 fix:** wrapfix now blends RGB only. In the fade zone the alpha follows the outline being joined, is snapped to 0 under 200 (so no see-through band), then gets a 1 px anti-aliased rim like the rest of the edge.
  - **Why not plain min(end, start):** the lead's min(end, start) alpha left a visible notch where the fade zone ends, so the snapped alpha is ramped instead. Either way, no ghost.
- **Strip numbers** (wrap = colour difference across the join; semi-clear = pixels per column above and below the solid band; 'was' = the critic's numbers at 576639eb):

| strip | wrap diff | semi-clear, first 160 px (above/below) | semi-clear, mid-strip | was |
|---|---|---|---|---|
| P-01-a | 0.9 | 3.2 / 3.1 | 3.3 / 2.9 | above 7.7 |
| P-03-a | 1.6 | 3.2 / 4.0 | 3.2 / 2.9 | below 9.1 |
| P-03-b | 1.6 | 3.7 / 3.5 | 3.1 / 2.7 | 14.2 / 17.1 |
| P-04-c | 2.5 | 3.3 / 3.1 | 2.8 / 2.3 | 6.9 / 6.6 |

- **Stumps:** short and tall are natural (no saw rings or cut faces), with moss tops that pass flatness (55%, 51%). The medium stump went to list 2 (below).
- **Palisade (P-11-c):** still angled. Use it only as **far background in W2/W10** until list 2 redraws it side-on (the lead).

## Sent back to list 2 (not in the kept set)

| id | what | why |
|---|---|---|
| HF1-P-08-c | ruin stairs | NOT usable: still angled (3/4, top showing). Redo side-on in list 2 from a new side-on start at s62/s68. |
| HF1-stump-medium | natural flat-top stump, medium | Every take has a lid-like moss top: two stacked boxy bands, or a hard straight edge where moss meets bark. s60-11 and s60-23 reach only the 50% flatness floor; s68-11 and s68-23 fail it (45%). Redo in list 2. |

## Pieces (each lists all ten worlds: the fits best first with a reason, then the rest as one 'no fit' line)

| id | item | take kept | what | kind | size | walk y (x0-x1) flat | worlds, best first | why | no fit | float | notes | other takes rejected |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| HF1-P-08-d | 1 | s60-11 | ruin arch | den or hide spot | 1481x1826 |  | 7 Ancient Ruins; 3 Mossy Grotto | carved ruin arch (made thing: never W1) | no fit: 1 2 4 5 6 8 9 10: a carved stone archway belongs to built ruins; 3 only as a grotto entrance | grounded | Clean keystone, dark doorway. | s52-11: the keystone lost its carving; s52-23, s60-23: plainer, weaker moss |
| HF1-P-10-a | 1 | s52-23 | dripping cliff ledge | rock | 1821x1376 | by hand | 4 Mist Cascades; 10 Stormy Highlands Fortress; 3 Mossy Grotto | mossy cliff ledge with drips: the cascades; fills 4 floor | no fit: 1 2 5 6 7 8 9: a bare dripping rock overhang reads as cliff and falls, not canopy, river, garden, swamp, ruin, treetop or lava | grounded | Drips falling below the ledge are separate drops; the keyer kept the ones near the ledge. Flatness 13% within 3 px: by hand. | s52-11, s60-11: drips blur into the rock; s60-23: moss drapes thick enough to hide the top line |
| HF1-P-10-d | 1 | s52-23 | root curtain | plant or dressing | 1594x1826 |  | 4 Mist Cascades; 6 Deep Mangrove; 3 Mossy Grotto | root curtain: behind a waterfall, mangrove, grotto | no fit: 1 2 5 7 8 9 10: a wall of hanging roots behind falls or in mangrove/grotto gloom; too dark and wet for canopy, river, garden, ruins, treetops, volcano, fortress | attached | Hangs from a mossy branch: attach both ends. | s52-11: roots muddier; s60-11, s60-23: the branch broke up |
| HF1-P-11-a | 1 | s52-11 | scaffold | step set piece | 1820x1613 |  | 2 Sunlit Riverbank; 6 Deep Mangrove | lashed pole scaffold: the village (made thing: never W1) | no fit: 1 3 4 5 7 8 9 10: lashed poles are village work (made thing, never W1); no rope scaffolds in caves, falls, garden, ruins, treetops, lava or the stone fortress | grounded | Rope lashings at the joints read clearly. | s52-23, s60-23: braces turned into rope; s60-11: the top rail doubled |
| HF1-P-11-c | 1 | s60-23 | palisade | plant or dressing | 1822x1735 |  | 2 Sunlit Riverbank; 10 Stormy Highlands Fortress | palisade: village wall, fortress (made thing: never W1) | no fit: 1 3 4 5 6 7 8 9: a stake wall is a village or fortress defence (made thing, never W1) | grounded | FLAG: still angled, not side view (Matt's composition kept at s52/s60): far background in W2/W10 only until list 2. Sharpened stakes can read as danger. | s52-11, s52-23, s60-11: a broken stake or stray block in the row |
| HF1-P-11-d | 1 | s52-23 | dock with water | walkable log or plank | 1827x689 | 92 (2-1750) 0.52 | 2 Sunlit Riverbank; 6 Deep Mangrove | dock over water: fills 2 docks (made thing: never W1) | no fit: 1 3 4 5 7 8 9 10: a plank dock needs calm open water and people: the river first, the mangrove second | grounded | Plank deck on posts over a strip of painted water. | s52-11, s60-11, s60-23: near twins; the s52-23 water ripples read best |
| HF1-P-01-a | 2 | s52-23 + native pass + wrap | leaf-litter ground strip | ground strip | 1888x1039 | by hand | 1 Emerald Canopy; 5 Orchid Sanctuary; 3 Mossy Grotto | leaf-litter forest floor: fills the W1 ground band | no fit: 2 4 6 7 8 9 10: dry leaf-litter forest floor; not river mud, wet cliffs, swamp, ruin stone, treetop, lava or highland rock | grounded | Tiles: square ends, wrap diff 0.9 (interior 0.4). Top is a soft soil edge: stand line by hand. Flatness 44% within 3 px: by hand. | s52-11, s60-11, s60-23: leaves larger and fewer, more seam work |
| HF1-P-03-a | 2 | s52-11 + native pass + wrap | moss-root ground strip | ground strip | 1888x844 | by hand | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | moss-root ground: the W1 ground band | no fit: 2 4 5 7 8 9 10: dark mossy root soil is forest, grotto and swamp ground only | grounded | Tiles: wrap diff 1.5 (interior 0.7). Moss tufts on top: stand line by hand. Flatness 45% within 3 px: by hand. | s52-23, s60-11, s60-23: big fern leaves grew on the front face (they read as plants to stand behind, not soil) |
| HF1-P-03-b | 2 | s52-23 + native pass + wrap | moss-root strip with leaf litter | ground strip | 1888x833 | by hand | 1 Emerald Canopy; 5 Orchid Sanctuary; 3 Mossy Grotto | moss-root strip with fallen leaves | no fit: 2 4 6 7 8 9 10: moss with fallen autumn leaves: forest, garden, grotto only | grounded | Tiles: wrap diff 1.6 (interior 1.0). The leaf band on top is ragged: stand line by hand. Flatness 17% within 3 px: by hand. | s52-11, s60-11: leaf band thinner; s60-23: roots lost their shape |
| HF1-P-04-c | 2 | s52-11 + native pass + wrap | long thin ground strip | ground strip | 1888x264 | 12 (0-1887) 0.57 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | thin root-soil strip | no fit: 2 4 5 7 8 9 10: thin dark root soil: forest, grotto and swamp only | grounded | Tiles: wrap diff 2.5 (interior 1.9). A faint see-through ghost along the top edge where the two ends' grass tops were blended (named). | s52-23, s60-11, s60-23: near twins; s52-11 had the cleanest roots |
| HF1-stump-short | 3 | s60-23 | natural flat-top stump, short | block | 1698x879 | 12 (438-1251) 0.55 | 1 Emerald Canopy; 6 Deep Mangrove; 5 Orchid Sanctuary | natural rotted stump, level moss top: a W1 flat top | no fit: 2 3 4 7 8 9 10: a rotted mossy rainforest stump; sawn stumps go to W2, none in caves, cliffs, ruins, treetops, lava or highlands | grounded | Broken and rotted level, moss cushion, no saw rings or cut face. | s68-11 (first pick): moss top too bumpy (39% flat); s60-11: 49% flat; s68-23: 44% flat |
| HF1-stump-tall | 3 | s60-11 | natural flat-top stump, tall | block | 938x1703 | 12 (261-779) 0.51 | 1 Emerald Canopy; 8 Twilight Treetops; 6 Deep Mangrove | tall natural snag rotted level, moss top, vines | no fit: 2 3 4 5 7 9 10: a vine-wrapped rainforest snag for canopy, treetops and swamp only | grounded | No saw rings; vines and bromeliads on the trunk. | s60-23, s68-23: moss drips like icing; s68-11: a hole punched through the trunk |
| HF1-P-02-a | 4 | s62-23 | grassy earth slab, side-on | block | 1821x532 | 55 (46-1790) 0.76 | 1 Emerald Canopy; 2 Sunlit Riverbank; 5 Orchid Sanctuary | grassy earth slab | no fit: 3 4 6 7 8 9 10: a dry grassy earth slab; not cave, cliff rock, swamp mud, ruin stone, treetop, lava or highland | grounded | Side-on now (a thin top sliver shows). Stones in the soil. | s62-11, s68-11: boulders bulge from the top; s68-23: front face blurred |
| HF1-P-02-b | 4 | s68-23 | gravel earth slab, side-on | block | 1818x432 | 9 (53-1770) 0.7 | 4 Mist Cascades; 2 Sunlit Riverbank; 10 Stormy Highlands Fortress | gravel slab: cliff path, riverbank, highlands | no fit: 1 3 5 6 7 8 9: a gravel slab reads as a path or scree, not forest, cave, garden, swamp, ruin, treetop or lava | grounded | Side-on; gravel top. | s62-11, s68-11: drippy soil face; s62-23: gravel top too thin |
| HF1-P-02-c | 4 | s62-23 | plank-topped earth slab, side-on | block | 1833x473 | by hand | 2 Sunlit Riverbank; 6 Deep Mangrove | plank-topped slab: worked wood (made thing: never W1) | no fit: 1 3 4 5 7 8 9 10: a plank-topped slab is worked wood (made thing, never W1): village and boardwalk only | grounded | Side-on; planks on top. Flatness 14% within 3 px: by hand. | s62-11, s68-11: green stains on the face; s68-23: planks tilted |
| HF1-P-02-d | 4 | s62-23 | pebbled earth slab, side-on | block | 1824x525 | 47 (54-1784) 0.8 | 2 Sunlit Riverbank; 4 Mist Cascades | pebbled slab: riverbank first | no fit: 1 3 5 6 7 8 9 10: pebbles mean water-worn ground: riverbank and falls only | grounded | Side-on; pebbles on top. | s62-11, s68-11: lumpy face; s68-23: pebbles float above the top |

## By world

Made things are never World 1. **World 1 flat tops added: 7** (HF1-P-01-a, HF1-P-03-a, HF1-P-03-b, HF1-P-04-c, HF1-stump-short, HF1-stump-tall, HF1-P-02-a).

| World | Pieces (best fit in bold) |
|---|---|
| 1 Emerald Canopy (7) | **HF1-P-01-a**, **HF1-P-03-a**, **HF1-P-03-b**, **HF1-P-04-c**, **HF1-stump-short**, **HF1-stump-tall**, **HF1-P-02-a** |
| 2 Sunlit Riverbank (7) | **HF1-P-11-a**, **HF1-P-11-c**, **HF1-P-11-d**, HF1-P-02-a, HF1-P-02-b, **HF1-P-02-c**, **HF1-P-02-d** |
| 3 Mossy Grotto (7) | HF1-P-08-d, HF1-P-10-a, HF1-P-10-d, HF1-P-01-a, HF1-P-03-a, HF1-P-03-b, HF1-P-04-c |
| 4 Mist Cascades (4) | **HF1-P-10-a**, **HF1-P-10-d**, **HF1-P-02-b**, HF1-P-02-d |
| 5 Orchid Sanctuary (4) | HF1-P-01-a, HF1-P-03-b, HF1-stump-short, HF1-P-02-a |
| 6 Deep Mangrove (8) | HF1-P-10-d, HF1-P-11-a, HF1-P-11-d, HF1-P-03-a, HF1-P-04-c, HF1-stump-short, HF1-stump-tall, HF1-P-02-c |
| 7 Ancient Ruins (1) | **HF1-P-08-d** |
| 8 Twilight Treetops (1) | HF1-stump-tall |
| 9 Volcanic Jungle (0) | none |
| 10 Stormy Highlands Fortress (3) | HF1-P-10-a, HF1-P-11-c, HF1-P-02-b |
