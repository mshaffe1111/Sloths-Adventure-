# Hugging Face picture list 1 (R-165.100): 18 pieces, all kept

Run 2026-11-11 on Matt's style model (Qwen-Image + mshaffe111/slothadv-style-lora), all img2img from magenta paste-ups (`starts/`, made by `tools/art/hflist1/starts.py`), then cut with the 11-11b cutter. Five jobs, **$2.04** (cap $6.50; reference/art/HF-SPEND.md). Kept PNGs in `src/assets/w1-1111c/` (nothing placed). `sheets/item1-4.jpg` are the kept pieces on dark and light (cyan = flat top that passes the 3 px test); `sheets/takes-*.jpg` show every take next to its start; `sheets/seam-*.jpg` show two copies of each strip side by side at 2x.

## Checks
- **Pink:** widened pinkscan finds 0 on all 18.
- **Size:** every piece is 1698-1888 px on its long side (all over the 1500 floor). No file over 4 MiB.
- **Strips tile:** each was cut, given the circular native pass (`striphdgpu.py`, s25), and then cross-faded across the wrap (`tools/art/hflist1/wrapfix.py`): the native pass alone left a seam (wrap differences 3.8-16.2). The mean colour difference across the wrap column is now:
  - P-01-a: **0.9** (interior neighbour columns 0.4)
  - P-03-a: **1.5** (interior 0.7)
  - P-03-b: **1.6** (interior 1.0)
  - P-04-c: **2.5** (interior 1.9)
- **Stumps:** natural, broken and rotted level with a moss cushion; no saw rings or cut faces. Their flat moss tops pass the flatness test: short 55%, medium 50%, tall 51%.
- **Flags:**
  - Still angled (Matt's 3/4 composition is kept by the s52/s60 repaint in place): P-08-c stairs, P-11-c palisade.
  - Made things, never W1: the scaffold, palisade, dock, plank-top slab, ruin stairs and arch.

## Pieces

| id | item | take kept | what | kind | size | walk y (x0-x1) flat | worlds, best first | why | float | notes | other takes rejected |
|---|---|---|---|---|---|---|---|---|---|---|---|
| HF1-P-08-c | 1 | s52-23 | ruin stairs | step set piece | 1819x1402 |  | 7 Ancient Ruins | ruin stairs (made thing: never W1) | grounded | FLAG: still angled, not side view: repaint in place at s52/s60 keeps Matt's 3/4 composition (by design); a side-on stair needs a new start. | s52-11, s60-11: the step faces smeared; s60-23: the top step grew a second slab |
| HF1-P-08-d | 1 | s60-11 | ruin arch | den or hide spot | 1481x1826 |  | 7 Ancient Ruins; 3 Mossy Grotto | carved ruin arch (made thing: never W1) | grounded | Clean keystone, dark doorway. | s52-11: the keystone lost its carving; s52-23, s60-23: plainer, weaker moss |
| HF1-P-10-a | 1 | s52-23 | dripping cliff ledge | rock | 1821x1376 | by hand | 4 Mist Cascades; 10 Stormy Highlands Fortress; 3 Mossy Grotto | mossy cliff ledge with drips: the cascades; fills 4 floor | grounded | Drips falling below the ledge are separate drops; the keyer kept the ones near the ledge. Flatness 13% within 3 px: by hand. | s52-11, s60-11: drips blur into the rock; s60-23: moss drapes thick enough to hide the top line |
| HF1-P-10-d | 1 | s52-23 | root curtain | plant or dressing | 1594x1826 |  | 4 Mist Cascades; 6 Deep Mangrove; 3 Mossy Grotto | root curtain: behind a waterfall, mangrove, grotto | attached | Hangs from a mossy branch: attach both ends. | s52-11: roots muddier; s60-11, s60-23: the branch broke up |
| HF1-P-11-a | 1 | s52-11 | scaffold | step set piece | 1820x1613 |  | 2 Sunlit Riverbank; 6 Deep Mangrove | lashed pole scaffold: the village (made thing: never W1) | grounded | Rope lashings at the joints read clearly. | s52-23, s60-23: braces turned into rope; s60-11: the top rail doubled |
| HF1-P-11-c | 1 | s60-23 | palisade | plant or dressing | 1822x1735 |  | 2 Sunlit Riverbank; 10 Stormy Highlands Fortress | palisade: village wall, fortress (made thing: never W1) | grounded | FLAG: still angled, not side view (Matt's composition kept at s52/s60). Sharpened stakes can read as danger. | s52-11, s52-23, s60-11: a broken stake or stray block in the row |
| HF1-P-11-d | 1 | s52-23 | dock with water | walkable log or plank | 1827x689 | 92 (2-1750) 0.52 | 2 Sunlit Riverbank; 6 Deep Mangrove | dock over water: fills 2 docks (made thing: never W1) | grounded | Plank deck on posts over a strip of painted water. | s52-11, s60-11, s60-23: near twins; the s52-23 water ripples read best |
| HF1-P-01-a | 2 | s52-23 + native pass + wrap | leaf-litter ground strip | ground strip | 1888x1039 | by hand | 1 Emerald Canopy; 5 Orchid Sanctuary; 3 Mossy Grotto | leaf-litter forest floor: fills the W1 ground band | grounded | Tiles: square ends, wrap diff 0.9 (interior 0.4). Top is a soft soil edge: stand line by hand. Flatness 43% within 3 px: by hand. | s52-11, s60-11, s60-23: leaves larger and fewer, more seam work |
| HF1-P-03-a | 2 | s52-11 + native pass + wrap | moss-root ground strip | ground strip | 1888x844 | by hand | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | moss-root ground: the W1 ground band | grounded | Tiles: wrap diff 1.5 (interior 0.7). Moss tufts on top: stand line by hand. Flatness 45% within 3 px: by hand. | s52-23, s60-11, s60-23: big fern leaves grew on the front face (they read as plants to stand behind, not soil) |
| HF1-P-03-b | 2 | s52-23 + native pass + wrap | moss-root strip with leaf litter | ground strip | 1888x833 | by hand | 1 Emerald Canopy; 5 Orchid Sanctuary; 3 Mossy Grotto | moss-root strip with fallen leaves | grounded | Tiles: wrap diff 1.6 (interior 1.0). The leaf band on top is ragged: stand line by hand. Flatness 18% within 3 px: by hand. | s52-11, s60-11: leaf band thinner; s60-23: roots lost their shape |
| HF1-P-04-c | 2 | s52-11 + native pass + wrap | long thin ground strip | ground strip | 1888x264 | 12 (0-1887) 0.58 | 1 Emerald Canopy; 3 Mossy Grotto; 6 Deep Mangrove | thin root-soil strip | grounded | Tiles: wrap diff 2.5 (interior 1.9). A faint see-through ghost along the top edge where the two ends' grass tops were blended (named). | s52-23, s60-11, s60-23: near twins; s52-11 had the cleanest roots |
| HF1-stump-short | 3 | s60-23 | natural flat-top stump, short | block | 1698x879 | 12 (438-1251) 0.55 | 1 Emerald Canopy; 6 Deep Mangrove; 5 Orchid Sanctuary | natural rotted stump, level moss top: a W1 flat top | grounded | Broken and rotted level, moss cushion, no saw rings or cut face. | s68-11 (first pick): moss top too bumpy (39% flat); s60-11: 49% flat; s68-23: 44% flat |
| HF1-stump-medium | 3 | s60-23 | natural flat-top stump, medium | block | 1701x792 | 11 (482-1218) 0.5 | 1 Emerald Canopy; 6 Deep Mangrove; 5 Orchid Sanctuary | natural rotted stump, level moss top | grounded | No saw rings; moss top. Its trunk is short against wide roots. | s60-11, s68-11, s68-23: the moss cap is a lid-like slab |
| HF1-stump-tall | 3 | s60-11 | natural flat-top stump, tall | block | 938x1703 | 12 (261-779) 0.51 | 1 Emerald Canopy; 8 Twilight Treetops; 6 Deep Mangrove | tall natural snag rotted level, moss top, vines | grounded | No saw rings; vines and bromeliads on the trunk. | s60-23, s68-23: moss drips like icing; s68-11: a hole punched through the trunk |
| HF1-P-02-a | 4 | s62-23 | grassy earth slab, side-on | block | 1821x532 | 55 (46-1790) 0.76 | 1 Emerald Canopy; 2 Sunlit Riverbank; 5 Orchid Sanctuary | grassy earth slab | grounded | Side-on now (a thin top sliver shows). Stones in the soil. | s62-11, s68-11: boulders bulge from the top; s68-23: front face blurred |
| HF1-P-02-b | 4 | s68-23 | gravel earth slab, side-on | block | 1818x432 | 9 (53-1770) 0.7 | 4 Mist Cascades; 2 Sunlit Riverbank; 10 Stormy Highlands Fortress | gravel slab: cliff path, riverbank, highlands | grounded | Side-on; gravel top. | s62-11, s68-11: drippy soil face; s62-23: gravel top too thin |
| HF1-P-02-c | 4 | s62-23 | plank-topped earth slab, side-on | block | 1833x473 | by hand | 2 Sunlit Riverbank; 6 Deep Mangrove | plank-topped slab: worked wood (made thing: never W1) | grounded | Side-on; planks on top. Flatness 14% within 3 px: by hand. | s62-11, s68-11: green stains on the face; s68-23: planks tilted |
| HF1-P-02-d | 4 | s62-23 | pebbled earth slab, side-on | block | 1824x525 | 47 (54-1784) 0.8 | 2 Sunlit Riverbank; 4 Mist Cascades | pebbled slab: riverbank first | grounded | Side-on; pebbles on top. | s62-11, s68-11: lumpy face; s68-23: pebbles float above the top |

## By world

Made things are never World 1 (the lead, 11-11). **World 1 flat tops added: 8** (the 4 strips, 3 stumps, 1 slab).

| World | Pieces (best fit in bold) |
|---|---|
| 1 Emerald Canopy (8) | **HF1-P-01-a**, **HF1-P-03-a**, **HF1-P-03-b**, **HF1-P-04-c**, **HF1-stump-short**, **HF1-stump-medium**, **HF1-stump-tall**, **HF1-P-02-a** |
| 2 Sunlit Riverbank (7) | **HF1-P-11-a**, **HF1-P-11-c**, **HF1-P-11-d**, HF1-P-02-a, HF1-P-02-b, **HF1-P-02-c**, **HF1-P-02-d** |
| 3 Mossy Grotto (7) | HF1-P-08-d, HF1-P-10-a, HF1-P-10-d, HF1-P-01-a, HF1-P-03-a, HF1-P-03-b, HF1-P-04-c |
| 4 Mist Cascades (4) | **HF1-P-10-a**, **HF1-P-10-d**, **HF1-P-02-b**, HF1-P-02-d |
| 5 Orchid Sanctuary (5) | HF1-P-01-a, HF1-P-03-b, HF1-stump-short, HF1-stump-medium, HF1-P-02-a |
| 6 Deep Mangrove (9) | HF1-P-10-d, HF1-P-11-a, HF1-P-11-d, HF1-P-03-a, HF1-P-04-c, HF1-stump-short, HF1-stump-medium, HF1-stump-tall, HF1-P-02-c |
| 7 Ancient Ruins (2) | **HF1-P-08-c**, **HF1-P-08-d** |
| 8 Twilight Treetops (1) | HF1-stump-tall |
| 9 Volcanic Jungle (0) | none |
| 10 Stormy Highlands Fortress (3) | HF1-P-10-a, HF1-P-11-c, HF1-P-02-b |
