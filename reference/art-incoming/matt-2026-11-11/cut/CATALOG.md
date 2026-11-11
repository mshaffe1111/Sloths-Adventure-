# Matt's third batch, 13 sheets of 2026-11-11: cut catalog (R-165.85)

13 sheets in (`reference/art-incoming/matt-2026-11-11/01.jpg`-`13.jpg` on ccr-ca657d3c-n09zty). **54 pieces kept**, 1 rejected. Ids `N-<sheet>-<letter>`. Kept pieces are full-resolution transparent PNGs in `src/assets/w1-1111/` (no code refers to them; nothing is placed). This folder has `catalog.csv` (one row per cut), `sheets/<kind>.jpg` (dark left, light right, cyan = flat walkable top), `rejected/`, and `cutter/`: this batch's table, config and the scripts changed since the 11-09 batch (the rest is in `../../matt-2026-11-09/cut/cutter/`).

Cut the same way as the 11-09 batch, with every check from its attempt 2 applied from the start:
- **Pink:** `edgefix.py` ran on every piece, then the widened `pinkscan.py` (r>g+45 and b>g+25 within 8 px of the edge). It finds **0 edge pixels on all 54 kept pieces**.
- **Flatness:** every walk line must be at least 50% within 3 px of level, or it becomes "by hand" with its silhouette reading in the notes. Only N-08-d passes. The mossy blocks (N-12-b 34%, N-13-a 45%) and the earth island N-02-e (47%) come close, but moss tufts break the line.
- **Sheet 08's grey ground:** keyed from its own border colour. No grey halo shows on the light ground.
- **Sheet 09:** Matt's prompt text was cleared by hand-set boxes before keying (`cutter/config-N.json`), and stray dots from it were removed (`specks.py`). Sheet 10's labels were cleared the same way. No text is in any piece.
- **Sheet 06:** the pink-smeared floating ledge was cleared from the sheet before keying (the lead's reject). `rejected/N-06-ledge.jpg` is the raw sheet crop.
- **Size:** the PNGs had the colour under fully transparent pixels zeroed and were re-saved optimised. That is lossless for every visible pixel, and it took the batch from 40.7 MB to 39.6 MB.

## Counts per kind

| Kind | Kept | Rejected | W1 or both | later world |
|---|---|---|---|---|
| block | 9 | 0 | 9 | 0 |
| danger-looking | 1 | 0 | 0 | 1 |
| den or hide spot | 5 | 0 | 4 | 1 |
| plant or dressing | 2 | 0 | 1 | 1 |
| rock | 14 | 0 | 12 | 2 |
| soft landing | 6 | 0 | 6 | 0 |
| step set piece | 8 | 0 | 8 | 0 |
| tree | 5 | 0 | 5 | 0 |
| walkable log or plank | 4 | 1 | 4 | 0 |
| **total** | **54** | **1** | **49** | **5** |

Per sheet (pieces on the sheet = cuts): 01: 4, 02: 6, 03: 4, 04: 4, 05: 6, 06: 6 + the rejected ledge, 07: 4, 08: 4, 09: 2, 10: 4, 11: 4, 12: 2, 13: 4.

World fit adds **later world** for five pieces that don't read as the W1 rainforest: N-03-d white jagged rock, N-04-a basalt, N-04-b red sandstone arch, N-04-c amethyst geode, N-04-d black spheres. Float classes follow Matt's 11-07 ruling; the ladders and the rope bridge are **attached**.

## Flags

- **N-03-d white jagged rock reads as danger** (sharp ice or crystal spikes). It is catalogued as danger-looking: make it a hazard or keep it off landings.
- **The crystals and geode (N-01-c's small crystals, N-04-c)** don't read as danger, but N-04-c belongs to a cave or crystal world. N-01-c's crystals are small and fit W1 as decor.
- **N-04-d black glossy spheres** can read as bombs or eggs to a child: judge before use.
- **N-05-f rune stone:** the carved marks are faint shapes, not words.

## Every piece

| id | label | kind | size | walk y (x0-x1) flat | world | float | notes |
|---|---|---|---|---|---|---|---|
| N-01-a | unlabelled (big mossy boulder) | rock | 1086x796 | by hand | both | grounded | Sits on its own painted dirt pad (part of the piece): lay the pad on the ground line. No flat top: the silhouette top near y 71 (x 358-742) is only 4% within 3 px of level; stand line by hand. |
| N-01-b | unlabelled (three-rock cluster) | rock | 941x541 | by hand | both | grounded | Three rocks on one dirt pad; uneven top. No flat top: the silhouette top near y 156 (x 491-782) is only 4% within 3 px of level; stand line by hand. |
| N-01-c | unlabelled (rock spire with crystals) | rock | 897x1002 | by hand | W1 | grounded | Tall pointed spire with small white crystals at its foot. The spire tip is sharp but reads as rock, not a hazard; decor, never a landing. No flat top: the silhouette top near y 361 (x 300-604) is only 12% within 3 px of level; stand line by hand. |
| N-01-d | unlabelled (stacked cairn stones) | rock | 1003x716 | by hand | both | grounded | A cairn (three stacked stones) on a dirt pad: fills the cairn on the W2 prop list. Rounded top stone. No flat top: the silhouette top near y 50 (x 327-705) is only 6% within 3 px of level; stand line by hand. |
| N-02-a | unlabelled (root-bound boulder) | rock | 743x640 | by hand | W1 | grounded | Boulder caged in roots. No flat top: the silhouette top near y 35 (x 125-687) is only 17% within 3 px of level; stand line by hand. |
| N-02-b | unlabelled (rock steps with chanterelles and blueberries) | step set piece | 889x656 | by hand | W1 | grounded | Low stepped rock with a chanterelle cluster on top (the mushrooms block the top step). |
| N-02-c | unlabelled (vine-wrapped block) | block | 772x619 | by hand | W1 | grounded | Square stone block wrapped in roots and vines, ferns at its foot. No flat top: the silhouette top near y 44 (x 156-660) is only 7% within 3 px of level; stand line by hand. |
| N-02-d | unlabelled (root-bound boulder) | rock | 798x705 | by hand | W1 | grounded | Second root-bound boulder, a leaf and small purple mushrooms on it; twin of N-02-a. No flat top: the silhouette top near y 59 (x 289-663) is only 10% within 3 px of level; stand line by hand. |
| N-02-e | unlabelled (floating earth island with hanging roots) | walkable log or plank | 1066x498 | by hand | W1 | may float | Earth island platform (not a log): mossy top, roots hanging under it. Platform-looking, so it may float (Matt 11-07). No flat top: the silhouette top near y 12 (x 20-1048) is only 47% within 3 px of level; stand line by hand. |
| N-02-f | unlabelled (mossy pillar) | rock | 490x777 | by hand | W1 | grounded | Tall stone pillar under moss and roots. No flat top: the silhouette top near y 23 (x 36-400) is only 17% within 3 px of level; stand line by hand. |
| N-03-a | unlabelled (tall grey rock) | rock | 1087x821 | by hand | both | grounded | Tall grey boulder on a dirt pad; domed top. No flat top: the silhouette top near y 79 (x 320-719) is only 7% within 3 px of level; stand line by hand. |
| N-03-b | unlabelled (dark smooth boulders) | rock | 939x590 | by hand | both | grounded | Two dark blue-grey boulders on a dirt pad. No flat top: the silhouette top near y 54 (x 362-712) is only 5% within 3 px of level; stand line by hand. |
| N-03-c | unlabelled (stacked river stones) | rock | 896x701 | by hand | both | grounded | Stacked river stones on a dirt pad: a second cairn. No flat top: the silhouette top near y 75 (x 305-571) is only 3% within 3 px of level; stand line by hand. |
| N-03-d | unlabelled (white jagged rock) | danger-looking | 1004x908 |  | later world | grounded | FLAG: white jagged spikes read as sharp (ice or crystal spikes): treat as danger or keep it off landings. Reads more like a cave or ice world than the W1 rainforest. |
| N-04-a | unlabelled (basalt column cluster) | rock | 1086x805 | by hand | later world | grounded | Dark hexagonal basalt columns: a volcanic look, a later world more than W1. No flat top: the silhouette top near y 55 (x 281-738) is only 3% within 3 px of level; stand line by hand. |
| N-04-b | unlabelled (red sandstone arch) | den or hide spot | 941x692 |  | later world | grounded | Wind-carved red sandstone arch: a desert or canyon look, not the rainforest. A walk-through arch. |
| N-04-c | unlabelled (amethyst geode) | plant or dressing | 895x866 |  | later world | grounded | Purple crystal geode: decor for a cave or crystal world. Not danger-looking, but the crystals are sharp. |
| N-04-d | unlabelled (black glossy spheres) | rock | 1004x626 | by hand | later world | grounded | Glossy black spheres on a dirt pad: can read as bombs or eggs to a child. Judge before use; a later world. No flat top: the silhouette top near y 68 (x 347-676) is only 5% within 3 px of level; stand line by hand. |
| N-05-a | unlabelled (rock spire with roots) | rock | 852x821 | by hand | W1 | grounded | Pointed rock spire with roots at its foot; decor, never a landing. No flat top: the silhouette top near y 203 (x 317-563) is only 3% within 3 px of level; stand line by hand. |
| N-05-b | unlabelled (boulder cave) | den or hide spot | 850x614 |  | both | grounded | A dark cave mouth in a boulder mound, a small purple crystal inside. |
| N-05-c | unlabelled (stacked stone slabs with vines) | step set piece | 982x712 | by hand | W1 | grounded | Three stacked slabs, vine-tied: a short climb or a block. |
| N-05-d | unlabelled (long cliff ledge with a tree) | rock | 1301x587 | by hand | W1 | grounded | A long rock ledge, moss along the top, a root-tree at the right end: a big grounded ledge. No flat top: the silhouette top near y 29 (x 14-1221) is only 39% within 3 px of level; stand line by hand. |
| N-05-e | unlabelled (boulder den) | den or hide spot | 1129x608 |  | both | grounded | Low boulder den with a dark doorway. |
| N-05-f | unlabelled (standing stone with runes) | plant or dressing | 334x613 |  | W1 | grounded | Mossy standing stone; the carved marks are faint and are not words. |
| N-06-a | unlabelled (vine-wrapped snag) | tree | 455x993 |  | W1 | grounded | Broken trunk wrapped in vines with bromeliads: backdrop or a climb. |
| N-06-b | unlabelled (long mossy broken log) | walkable log or plank | 1142x434 | by hand | W1 | may float | Long broken log, mossy, splintered right end; ragged top. No flat top: the silhouette top near y 87 (x 22-1045) is only 19% within 3 px of level; stand line by hand. |
| N-06-c | unlabelled (big broken stump) | tree | 926x998 |  | W1 | grounded | Big broken stump with spreading roots and a jagged top: decor, not a stand. |
| N-06-d | unlabelled (burnt stump) | tree | 457x641 |  | W1 | grounded | Charred jagged stump with a fern. |
| N-06-e | unlabelled (palm-trunk snag) | tree | 243x789 |  | W1 | grounded | Broken palm trunk. Matt painted a smeared ledge across its top; the ledge was cut away (see rejected) and a few px of its smear may remain in the notches of the broken top. |
| N-06-f | unlabelled (hollow stump) | den or hide spot | 469x751 |  | W1 | grounded | Dark hollow stump with a fern inside. |
| N-07-a | unlabelled (cut stump with ring top) | block | 1304x726 | by hand | W1 | grounded | Stump step: sawn ring top in three-quarter view. No flat top: the silhouette top near y 37 (x 337-991) is only 7% within 3 px of level; stand line by hand. |
| N-07-b | unlabelled (cut log) | walkable log or plank | 1124x557 | by hand | W1 | may float | Sawn log on a diagonal with its end grain showing: three-quarter view, not side-on. No flat top: the silhouette top near y 70 (x 682-1109) is only 3% within 3 px of level; stand line by hand. |
| N-07-c | unlabelled (cut stump, small) | block | 751x558 | by hand | W1 | grounded | Small stump step with a fern; ring top in three-quarter view. No flat top: the silhouette top near y 30 (x 201-570) is only 9% within 3 px of level; stand line by hand. |
| N-07-d | unlabelled (cut stump on roots) | block | 1273x754 | by hand | W1 | grounded | Wide stump step on spreading roots and a mud pad. No flat top: the silhouette top near y 40 (x 365-870) is only 7% within 3 px of level; stand line by hand. |
| N-08-a | unlabelled (fern tree with a fungus pad) | tree | 872x892 |  | W1 | grounded | Bushy fern crown on a twisted trunk, a bright fungus pad on its side. Grey-ground sheet: checked for a grey halo, none. |
| N-08-b | unlabelled (shelf fungus steps on a trunk) | step set piece | 1001x753 | by hand | W1 | grounded | Three bright fungus pads on a twisted trunk: a climb in three steps. |
| N-08-c | unlabelled (moss block) | soft landing | 951x692 | by hand | W1 | grounded | Square moss-covered block: a soft landing. No flat top: the silhouette top near y 29 (x 107-842) is only 15% within 3 px of level; stand line by hand. |
| N-08-d | unlabelled (vine nest with fungus) | soft landing | 950x799 | 5 (270-675) 0.71 | W1 | grounded | Vine nest, a fungus pad on top; hanging vines underneath. |
| N-09-a | unlabelled (three-tier root-stepped tree platform) | step set piece | 1396x824 | by hand | W1 | grounded | Four mossy tiers on a root trunk: a big climb set piece. Matt's prompt text on the sheet is not in it. |
| N-09-b | unlabelled (two root-trunk platforms joined by a root) | step set piece | 1834x714 | by hand | W1 | grounded | Two root-trunk platforms joined by a root bridge; leaves on top. |
| N-10-a | Springy moss coltton cushion mound | soft landing | 899x553 | by hand | W1 | grounded | Big moss cushion (label as printed). No flat top: the silhouette top near y 23 (x 159-734) is only 21% within 3 px of level; stand line by hand. |
| N-10-b | Large elastic layered shelf fungus trampolirre platform | soft landing | 897x516 | by hand | W1 | attached | Shelf fungus stack with a moss top (label as printed); bracket fungus attaches to a trunk, like M-07-a. No flat top: the silhouette top near y 13 (x 54-839) is only 39% within 3 px of level; stand line by hand. |
| N-10-c | Large pluβweed Leaf Nest | soft landing | 929x520 | by hand | W1 | grounded | Leaf pile (label as printed); same family as M-07-c. No flat top: the silhouette top near y 51 (x 228-785) is only 13% within 3 px of level; stand line by hand. |
| N-10-d | Large coiledd Vine trampoine mat | soft landing | 838x596 | by hand | W1 | grounded | Coiled vine mat on a frond base (label as printed); same family as M-07-b. No flat top: the silhouette top near y 30 (x 131-681) is only 7% within 3 px of level; stand line by hand. |
| N-11-a | unlabelled (hollow stump) | den or hide spot | 917x801 |  | W1 | grounded | Hollow stump with elephant-ear leaves around it. |
| N-11-b | unlabelled (cut stump with a flower) | block | 843x886 | by hand | W1 | grounded | Stump step; a dark flower sits on the top and berries on the side, so the flower blocks the middle of the top. No flat top: the silhouette top near y 100 (x 265-586) is only 7% within 3 px of level; stand line by hand. |
| N-11-c | unlabelled (dark scaled stump) | block | 953x713 | by hand | W1 | grounded | Dark bark-scaled stump step, a small blue patch on its top. No flat top: the silhouette top near y 22 (x 199-749) is only 17% within 3 px of level; stand line by hand. |
| N-11-d | unlabelled (cut stump with a mushroom) | block | 943x705 | by hand | W1 | grounded | Stump step, an orange mushroom on its side. No flat top: the silhouette top near y 27 (x 190-753) is only 16% within 3 px of level; stand line by hand. |
| N-12-a | unlabelled (vine ladder) | step set piece | 440x1350 | by hand | both | attached | A climb: vine rails, wooden rungs. Hang it from a ledge or trunk. |
| N-12-b | unlabelled (mossy wood block) | block | 1248x637 | by hand | W1 | grounded | Side-on wooden block, moss on top: flat top. No flat top: the silhouette top near y 27 (x 36-1213) is only 34% within 3 px of level; stand line by hand. |
| N-13-a | unlabelled (mossy wood block) | block | 720x429 | by hand | W1 | grounded | A shorter twin of N-12-b. No flat top: the silhouette top near y 18 (x 26-697) is only 45% within 3 px of level; stand line by hand. |
| N-13-b | unlabelled (vine ladder) | step set piece | 416x1264 | by hand | both | attached | A climb: vine rails, wooden rungs; a shorter twin of N-12-a. |
| N-13-c | unlabelled (wooden vine-wrapped ladder) | step set piece | 348x1124 | by hand | both | attached | A climb: red wooden rails wrapped in vine. |
| N-13-d | unlabelled (short horizontal vine ladder) | walkable log or plank | 716x231 | by hand | both | attached | A rope-and-rung bridge piece: tie both ends to posts or ledges (never free-floating). No flat top: the silhouette top near y 19 (x 21-689) is only 22% within 3 px of level; stand line by hand. |

## Rejected

| id | what | size | reason |
|---|---|---|---|
| N-06-ledge | unlabelled (pink-smeared floating ledge) | 500x220 (raw crop) | the lead ruled it out: Matt painted it fading into the magenta ground on its right half, so it cannot be keyed clean |

## Against the 91-piece catalogue's "Still missing" list (after the 11-09 batch too)

| # | Gap | This batch | Left open |
|---|---|---|---|
| 1 | Pit pieces | none | **all of it** |
| 2 | Root steps at 2-3 heights | **filled**: N-09-a (four root tiers), N-09-b (two root platforms), N-08-b (fungus steps on a trunk), N-02-b and N-05-c (rock steps) | none |
| 3 | Full-size W1 rocks | **filled**: 14 rocks and boulders, 941-1301 px | none |
| 4 | Mid-size stumps at 600+ px | **filled**: stump steps N-07-a/c/d, N-11-b/c/d (705-1304 px) | none; their ring tops are three-quarter view, so the stand line is by hand |
| 5 | A W1 ground band | none (the dirt pads under the rocks are part of each rock) | **all of it** |
| 6 | W1 hazards | none for W1 (N-03-d reads as danger but looks like a later world) | thorns and pits for W1 |
| 7 | W1 hide spots | more: N-05-b, N-05-e, N-06-f, N-11-a | none |
| 8 | W2 prop sets | **cairns** (N-01-d, N-03-c), **ladders** (N-12-a, N-13-b, N-13-c), a short **rope bridge** (N-13-d) | scaffolds, palisade, a long bridge |

