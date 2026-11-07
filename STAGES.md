# Stage 1-1: how it is built

Stage 1-1 is a side-scrolling stage assembled from hand-made sections. Each play uses one of **138 fixed layouts**. A layout is an ordered list of 12–15 sections, with a chosen version and facing (normal or mirrored) for each section. All numbers below come from the code at `origin/main` (commit `11242520`). The frequencies, lengths and times were measured by building all 138 layouts in the game's own stage builder on both settings.

## 0. Key numbers at a glance

| Item | Value | Source |
|---|---|---|
| Layouts on the list | **138** (138 distinct seeds, 138 stored layouts, counted by loading the list) | `src/game/gen2/provenSeeds.ts:4` (generated data, key `"1-1"`) |
| Minimum the list must hold | 100 | `src/game/gen2/seedList.ts:19` |
| Distinct section orders among the 138 | 138 (no two layouts share a section order; no two share the same set of sections) | measured |
| Section kinds 1-1 can draw from | 90 | `stagePool` in `src/game/gen2/pipeline.ts:2607`, World 1 kit `src/game/gen2/worlds/w1.ts:1390` |
| Section kinds that appear in at least one of the 138 | 65 (the other 25 appear in none) | measured |
| Most uses of one section kind in one layout | 1 | measured; `maxPerStage: 1`, `w1.ts:54` |
| Sections per layout | 12 (37 layouts), 13 (66), 14 (26), 15 (9) | measured |
| Enemies, water, crumbling platforms, vines, ropes | none in any layout | measured |
| Surface types used | solid ground (moss bank and stone), solid log, solid bough, mushroom (bounce) | measured |
| Pickups | petals (flowers) 92–149 per layout (median 120); one seed per layout; the exit totem | measured |

### Player movement (for reading the px numbers)

| Move | Number | Source |
|---|---|---|
| Top run speed | 285 px/s | `src/game/physics.ts:9` |
| Single jump: rise | about 108 px | `src/game/physics.ts:133` |
| Double jump: rise | about 185 px | `src/game/physics.ts:135` |
| Mushroom bounce launch speed | 830 px/s (single jump 640, second jump 540) | `src/game/physics.ts:18-24` |
| Bounce plus a double jump: rise | about 258 px | `src/game/gen2/pipeline.ts:113` |
| Mushroom size | 70 x 30 px | `src/game/gen2/worlds/w1.ts:136` |
| Double-jump gaps in the intro sections | laid at 195–203 px | `src/game/gen2/worlds/w1.ts:127` |
| End log (carries the exit) | 685 px long | `src/game/gen2/worlds/w1.ts:434` |

## 1. How a play's layout is chosen

| Step | What happens | Source |
|---|---|---|
| Stage builder | 1-1 always goes through the layout list (there is no other builder for it). | `src/game/stageGenerator.ts:2870`, `:2890-2892` |
| Draw on Play | Each press of Play takes the next entry from a shuffled order of the 138 entries. The order is stored on the device. | `src/game/testlink1_1.ts:61-74` |
| No repeats | Every entry is played once before any repeats. When a new shuffled round starts, its first entry cannot be the entry that ended the round before. | `src/game/testlink1_1.ts:36-50` |
| Retry and respawn | A restart or a respawn in the same play rebuilds the same layout. | `src/game/testlink1_1.ts:76` |
| Storage blocked | A fresh shuffle each session; the same no-repeat rule applies within that session. | `src/game/testlink1_1.ts:29-44` |
| Without a draw | Layout number *n* plays list entry (*n* − 1) mod 138. | `src/game/testlink1_1.ts:76`, `src/game/gen2/seedList.ts:66-69` |
| Building the entry | Each entry stores its finished layout: the section order, the version of each section, its facing, and how it joins the next section. The stored layout is rebuilt in one pass, with no search at play time. | `src/game/gen2/seedList.ts:28-55`, `:83-90` |

### Easy and Normal

| | Normal | Easy |
|---|---|---|
| Section order, versions, facing | same | same as Normal (138 of 138 identical) |
| Single-jump gap widths | 19–234 px, median 101 | 21–205 px, median 81 |
| Double-jump gap widths | 195–227 px (the 227 px gaps are in the level bough chains) | 195–203 px |
| Length, spawn to exit | 30,585 / 33,311 / 40,729 px | 32,827 / 35,722 / 43,689 px |
| Modelled time, typical player | 174 / 188 / 230 s | 186 / 201 / 246 s |
| Checkpoints | 10–15, median 11 | 10–15, median 12 |

(Values given as min / median / max.) Easy uses Normal's section list and lays it with narrower gaps. It comes out about 7% longer.

## 2. Overall shape of a layout

Every layout follows one of four section-slot outlines (graphs A–D; `src/game/gen2/graphs.ts:11-14`). As built, the slots come out as follows (counts are layouts out of 138):

| Outline | Layouts | Slot order as built |
|---|---|---|
| A | 51 | Start, Intro jump, Intro double jump, Intro bounce, Fork, Practice, Fork, Rest, Challenge, Rest, Seed perch, Showpiece, End |
| A | 41 | Start, Intro jump, Intro double jump, Intro bounce, Practice, Fork, Rest, Challenge, Rest, Seed perch, Showpiece, End |
| B | 18 | Start, Intro jump, Intro double jump, Intro bounce, Flow, Fork, Rest, Combine, Climb, Challenge, Rest, Seed perch, Showpiece, End |
| B | 7 | Start, Intro jump, Intro double jump, Intro bounce, Flow, Fork, Rest, Combine, Fork, Challenge, Rest, Seed perch, Showpiece, End |
| C | 9 | Start, Intro jump, Intro double jump, Intro bounce, Fork, Practice, Fork, Challenge, Rest, Twist, Rest, Descent, Seed perch, Showpiece, End |
| D | 7 | Start, Intro jump, Intro double jump, Intro bounce, Practice, Rest, Climb, Fork, Challenge, Rest, Seed perch, Showpiece, End |
| D | 5 | Start, Intro jump, Intro double jump, Intro bounce, Fork, Rest, Climb, Fork, Challenge, Rest, Seed perch, Showpiece, End |

In 5 layouts the Showpiece slot holds two sections. That is how a 12-slot outline gives a 13-section layout.

| Element | Fact (Normal unless noted) |
|---|---|
| Start | The player spawns at x = 140 px. The first section starts at x = 640–765 px. The first four sections are always Start, Intro jump, Intro double jump, Intro bounce, in that order. |
| Joins between sections | 1,801 joins in total: step up or down 612, gap jump 499, level walk 380, soft pit 310. |
| Mirrored sections | 19.7% of all placed sections are mirrored left to right. |
| Height | The exit is 356–918 px above the spawn (median 819; Easy median 688). The highest surface is 536–1,281 px above the spawn (median 899). The floating pieces (boughs and logs) are placed in the last third of the stage (`w1.ts:49`). |
| Falls | Every gap is a soft fall: 8,082 falls across both settings, none costs a life. Single-jump gaps: of 3,296 on Normal, 3,294 have a surface under the gap's middle, most often 70–79 px below the lip (2,397). Double-jump gaps: a miss returns the player to the take-off ledge with nothing lost (`src/game/engine.ts:7251-7266`). |
| Checkpoints | 10–15 flags per layout, median 11. Spacing from spawn to flag to flag to exit: 380–3,993 px, median 2,843 px. The first flag is 841 px or more from the spawn (median 3,265). The last flag is 380 px or more before the exit (median 426). |
| Mushrooms per layout | 3–12, median 6 |
| Seed | One per layout, always in the seed perch section (positions 10–13). It sits on a log about 235 px over a stump-mounted mushroom. |
| End | Always an End section in the boughs. It finishes on a 685 px log with the exit totem. The End section is 925–1,250 px long (median 956). |
| Longest stretch with nothing to do (Normal, End excluded) | 2.8 / 3.6 / 4.0 s (min / median / max over the list's stored values; the list holds every entry to 4 s or less, `seedList.ts:23`) |

## 3. Every section kind 1-1 can use

**Table 3a: description and frequency.** The 65 kinds that appear in the 138 layouts, grouped by the slot they fill most often. "Layouts" counts the layouts that contain the kind. "Uses" counts every placement. The two are equal for every kind: no kind appears twice in one layout. Moves: a *hop* is a single jump onto a low rock or stump. A *single-jump gap* is a gap one jump clears. A *double jump* is the second jump in the air. A *bounce* is landing on a mushroom. Under each single-jump gap there is a soft pit with a floor and steps out.

| # | Section (id) | Slot(s) it fills (count) | What the player does | Layouts containing it (of 138) | Total uses |
|---|---|---|---|---|---|
| 1 | **the home banks** (`w1-home-banks`) | Start | Flat banks to walk, one 50 px stump to hop; no gaps. | 37 | 37 |
| 2 | **the morning path** (`w1-morning-path`) | Start | Flat path to walk with very low roots (24–36 px) to step or hop; no gaps. | 35 | 35 |
| 3 | **the forest's edge** (`w1-forest-edge`) | Start | Flat banks to walk; one 50–56 px stump, or banks stepping up 24–30 px and back down; no gaps. | 24 | 24 |
| 4 | **run and jump** (`w1-learn`) | Intro: jump | Short floor, three or four low stumps to hop (50–80 px), one 34–46 px rock, then three soft gaps for a single jump that get wider each time; checkpoint flag on the floor after. | 82 | 82 |
| 5 | **up the first log** (`w1-log-teach`) | Intro: jump | Low logs lying on the floor (50–56 px) to hop, one fallen-log face 62–80 px tall with no step beside it, then soft gaps for a single jump. | 38 | 38 |
| 6 | **the first stones** (`w1-step-stones-teach`) | Intro: jump | Hops over 34–46 px rocks, one bank face 66–78 px tall with no step beside it, and soft dips for a single jump. | 18 | 18 |
| 7 | **the wide dip** (`w1-dip-double-teach`) | Intro: double jump | Walks and single-jump dips with two 195–203 px gaps crossed with a double jump, the pattern laid twice. | 74 | 74 |
| 8 | **double over the dip** (`w1-double-teach`) | Intro: double jump | Five or six gaps in a row of 195–203 px each (wider than a single jump reaches), crossed with a double jump; petal arcs over the gaps; a miss returns the player to the take-off ledge. | 59 | 59 |
| 9 | **the tall bank** (`w1-bank-double-teach`) | Intro: double jump | Rock hops (34–46 px) and a 136–140 px rise onto a bank (above a single jump's rise), crossed with a double jump, laid twice; exits about 276 px higher. | 5 | 5 |
| 10 | **bounce walls** (`w1-hop-bounce`) | Intro: bounce (107), Practice (9) | Two bank walls 225–240 px tall, each with a mushroom on the floor before it to bounce up; a rock on top, a drop of 225–240 px back down, a soft dip and a rock hop. | 116 | 116 |
| 11 | **the bounce bank** (`w1-mushroom-bank-teach`) | Intro: bounce | Rock hops, then a mushroom on the floor in front of a bank whose top is 200–220 px up; bounce onto it; the route stays up (exits about 210 px higher). | 28 | 28 |
| 12 | **first lift** (`w1-mushroom-lift`) | Intro: bounce | A stile of stumps (50–100 px), then a mushroom on the floor in front of a bank 200–220 px up; bounce onto it. | 3 | 3 |
| 13 | **log over the mound** (`w1-mound-log`) | Practice | A stepped earth mound (two or three steps of 50–56 px) with a thin log lying across the top, then steps back down and a 50–56 px stump; laid twice. | 47 | 47 |
| 14 | **twin bounce** (`w1-twin-bounce`) | Practice | Three or four mushrooms, each on a 40–46 px stump; each bounce lands on a bank 110–130 px higher; then down by a drop or a stair, then a stump stile. | 22 | 22 |
| 15 | **mushroom cache and stones** (`w1-cache-stones`) | Practice | A mushroom on the floor under a bough about 255 px up holding four petals (optional), soft dips, then stepping stones in a soft pit at heights of 30–110 px. | 7 | 7 |
| 16 | **mossy stone zigzag** (`w1-stone-zigzag`) | Practice | Low mounds (45–55 px, or 75–85 px) with 50–60 px stumps or a log on a post on top, walked and hopped up and down; laid twice; no gaps. | 7 | 7 |
| 17 | **stumps down** (`w1-stump-descent`) | Practice | Up a 76–80 px bank, stumps stepping down toward the floor, then thin logs on posts stepping back up (46–110 px); no gaps. | 6 | 6 |
| 18 | **stones and stumps** (`w1-stump-stones`) | Practice | Stepping stones (60, 110, 60 px high) in a soft pit, three or four low stumps, then rock hops and single-jump dips. | 6 | 6 |
| 19 | **stepping stones** (`w1-stones`) | Practice | Two runs of stepping stones in soft pits at heights of 40–110 px, with a rock hop between; all single jumps. | 2 | 2 |
| 20 | **stones and dips** (`w1-stone-dips`) | Flow (5), Practice (2) | Stepping stones (60, 110, 60 px) in a soft pit, rock hops and single-jump dips, then three or four low stumps. | 7 | 7 |
| 21 | **floor and high road** (`w1-floor-dash`) | Flow | A high road of five to seven thin logs on posts about 100 px over the floor, with 34–46 px rocks on the floor between; either road can be walked. | 3 | 3 |
| 22 | **bank steps at a run** (`w1-bank-run`) | Climb (14), Flow (3) | A climb of bank steps (62–78 px each) mixed with rock hops and one level single-jump gap; exits about 210 px higher. | 17 | 17 |
| 23 | **up the stump stair at a run** (`w1-stair-run`) | Climb (12), Flow (3) | A stair of bank steps (62–78 px each), with rock hops between in one version; exits about 280 px higher. | 15 | 15 |
| 24 | **the quick zigzag up** (`w1-zigzag-run`) | Climb (4), Flow (1) | Bank steps (62–78 px) then floating logs stepping up 62–78 px, or steps with level single-jump gaps; exits about 280 px higher. | 5 | 5 |
| 25 | **two mushrooms** (`w1-twin-mushroom-fork`) | Fork | Two roads over a 1,500–1,560 px floor. Low road: floor mushrooms, hops and a gap. High road: logs about 195 px (and 380 px) up, one with its own mushroom, reached by bouncing. Rock hop and dip after. | 72 | 72 |
| 26 | **roots up, or the stair** (`w1-root-stair-fork`) | Fork | Two roads over a 1,500–1,560 px floor. Low road: a stair of 40–80 px stumps. High road: two or three logs about 185 px up, reached with double jumps. | 54 | 54 |
| 27 | **the stump stair or the floor** (`w1-stair-fork`) | Fork | Two roads over a 1,500–1,560 px floor. Low road: stumps 40–80 px. High road: two logs 185–255 px up, reached from a 140 px stump with a double jump. Rock hop and dip after. | 54 | 54 |
| 28 | **hollow-log two-way** (`w1-hollow-twoway`) | Fork | A hollow log on the floor (300 or 360 px long, 124 or 150 px tall): walk through it, or hop a 50–56 px stump and run along its top; laid twice. | 22 | 22 |
| 29 | **mushroom or the long way** (`w1-mushroom-fork`) | Fork | Two roads: a floor mushroom up to boughs at 195, 265 and 335 px; or the floor with a second mushroom and hops. | 3 | 3 |
| 30 | **the dip mushroom** (`w1-mushroom-fork-dip`) | Fork | Two roads: three boughs about 185–195 px up reached by a mushroom; or the floor with mushrooms and rock hops. | 3 | 3 |
| 31 | **bank steps, two ways** (`w1-bank-stair-fork`) | Fork | Two roads: bank steps up to boughs 185–270 px over the floor; or rock hops and a low stair of 40–80 px steps. | 2 | 2 |
| 32 | **home meadow** (`w1-meadow`) | Rest (46), Start (42) | Flat moss floor with a checkpoint flag, three low stumps to hop (50–80 px), two rocks (34–46 px) and one soft dip a single jump clears. | 88 | 88 |
| 33 | **along the fallen log** (`w1-log-walk`) | Rest | A long floor with a fallen log (640–720 px, or 520–580 px plus 240–280 px) 50–56 px high to walk along; a low stump at the end; no gaps. | 72 | 72 |
| 34 | **fern bank** (`w1-fern-bank`) | Rest | A long flat bank with one 50–56 px stump; no gaps. | 59 | 59 |
| 35 | **sunlit clearing** (`w1-clearing`) | Rest | Two long banks joined by a 30–40 px dip or step up; no gap. | 32 | 32 |
| 36 | **high rest, a step up** (`w1-bough-bench-up`) | Rest | In the boughs: a bough, a single-jump gap, a second bough 50–80 px higher; a lower log road 136–144 px below with petals and a log step back up. | 22 | 22 |
| 37 | **high branch, a step up** (`w1-high-walk-up`) | Rest | In the boughs: a 420–460 px bough, a single-jump gap, a 380–440 px bough 50–80 px higher; a lower log road below with petals. | 20 | 20 |
| 38 | **high branch, petals low** (`w1-high-walk`) | Rest | In the boughs: two level boughs (340–460 px) with a single-jump gap; a lower log road 136–144 px below with petals and a 66–74 px log step back up. | 14 | 14 |
| 39 | **high rest** (`w1-bough-bench`) | Rest | In the boughs: a 300–340 px bough and a 300–520 px bough, level, with a single-jump gap; a lower log road with petals below. | 11 | 11 |
| 40 | **bounce, then fly** (`w1-bounce-double`) | Combine | A stump stile, then a mushroom on a 40–46 px stump; bounce, then double jump onto a log 270–320 px over the floor; low rocks below. | 19 | 19 |
| 41 | **bounce over the dip** (`w1-bounce-over-dip`) | Combine | A floor mushroom at the near lip of a 120–160 px soft dip; the far bank is 240–260 px up (bounce, then double jump). | 5 | 5 |
| 42 | **mushroom by the fallen log** (`w1-mushroom-log`) | Combine | A floor mushroom 60–90 px before a fallen log whose top is 240–260 px up (bounce, then double jump), then a step down. | 1 | 1 |
| 43 | **logs up the bank** (`w1-log-stair-test`) | Challenge | Rock hops, then floating logs rising: 136–140 px rises taken with a double jump and 62–78 px steps taken with a single jump; exits about 346 px higher. | 75 | 75 |
| 44 | **leaps and stones** (`w1-leap-stones`) | Challenge (13), Flow (10) | One or two 195–203 px double-jump gaps, then runs of stepping stones (50–70 px high) spaced for double jumps; a single-jump dip in one version. | 23 | 23 |
| 45 | **the fallen trunk** (`w1-fallen-trunk`) | Challenge | Three fallen logs 150–165 px tall and 220–260 px wide on the floor, each crossed with a double jump (one version adds a floor mushroom before each); 34–40 px rocks between. | 14 | 14 |
| 46 | **the second jump** (`w1-second-jump`) | Challenge | A shelf 150 px up, three 195–202 px double-jump gaps, a run of floor, then stepping stones spaced for double jumps. | 5 | 5 |
| 47 | **the bounce wall** (`w1-bounce-wall`) | Challenge | A floor mushroom in front of a bank 200–220 px up, then a 136–140 px rise taken with a double jump; exits about 348 px higher. | 3 | 3 |
| 48 | **the steep stair** (`w1-stair-test`) | Challenge | Bank steps (62–78 px) and 136–140 px rises taken with double jumps; exits about 416 px higher. | 2 | 2 |
| 49 | **the bank wall** (`w1-bank-stair-test`) | Challenge | Bank steps (62–78 px) and 136–140 px rises taken with double jumps; exits about 416 px higher. | 1 | 1 |
| 50 | **two answers** (`w1-two-answers`) | Twist | Three gaps of 195–203 px, each crossed with a double jump; in one version a mushroom on a stump on the near bank is a second way across. | 5 | 5 |
| 51 | **the stair that turns** (`w1-backstep-twist`) | Twist | A stair that turns: stumps 68–72 and 138–142 px up to the right, logs 208–212 and 278–282 px up back to the left, then a long top log 348–352 px up running right; the other version: bank steps, a 136–140 px double-jump rise, a drop, and steps back up. | 3 | 3 |
| 52 | **the broken stair** (`w1-stair-gap-twist`) | Twist | Bank steps (62–78 px) broken by level single-jump gaps; exits about 210 px higher. | 1 | 1 |
| 53 | **bough to bough, down** (`w1-canopy-drop`) | Descent | Wide boughs (620–700 px) stepping down 55–59 px three times; or drops of 38–42 and 128–132 px, then a level double-jump gap. | 5 | 5 |
| 54 | **floating logs down** (`w1-log-steps-descent`) | Descent | Wide floating logs (620–700 px): a level double-jump gap, then two drops of 108–112 px; or drops of 33–77 px with single jumps. | 3 | 3 |
| 55 | **down through the boughs** (`w1-bough-descent`) | Descent | Wide boughs (620–700 px) dropping 108–112, 108–112 and 33–37 px with single jumps. | 1 | 1 |
| 56 | **the seed perch** (`w1-seed-perch`) | Seed perch | A mushroom on a 40–46 px stump and a log about 235 px over the stump holding the stage's one seed (bounce, then double jump); a 50–56 px stump and a stump stile. One version sits on a bank raised 62–78 px. | 138 | 138 |
| 57 | **canopy rungs across** (`w1-canopy-rungs-level`) | Showpiece (26), Challenge (25) | Four level gaps between boughs that need a double jump (Normal about 227 px, Easy about 202 px); catch boughs below the gaps; low logs with petals. | 51 | 51 |
| 58 | **bounce into the boughs and down** (`w1-mushroom-chain-back`) | Showpiece | A rock hop, a floor mushroom up to a bough 198–202 px over the floor, two 136–140 px rises taken with double jumps, then two 136–140 px drops. | 39 | 39 |
| 59 | **the log chain** (`w1-log-chain`) | Showpiece | Floating logs: two 136–140 px rises and two level gaps, all taken with double jumps; the other version has a 48–52 px drop between doubles; ends on a long log. | 29 | 29 |
| 60 | **the log chain, rising** (`w1-log-chain-rise`) | Showpiece | Floating logs: three 136–140 px rises then one level gap, all taken with double jumps; exits about 414 px higher. | 23 | 23 |
| 61 | **bounce into the boughs** (`w1-mushroom-chain`) | Showpiece | A floor mushroom to a bough about 200 px up, two 136–140 px rises and a level gap taken with double jumps; or a stump-mounted mushroom to a bough 250 px up, a level double, a second mushroom on a bough and another level double; exits about 463 px higher. | 17 | 17 |
| 62 | **canopy rungs** (`w1-canopy-rungs`) | Showpiece | Four 136–140 px rises between boughs taken with double jumps (exits about 552 px higher); one version adds a fifth level piece; catch boughs under the gaps. | 9 | 9 |
| 63 | **quiet arrival** (`w1-quiet-arrival`) | End | A bough (240–280 or 520–600 px) walked onto the 685 px end log with the exit. | 83 | 83 |
| 64 | **onto the high log** (`w1-sunlit-log`) | End | A bough and one or two 28–32 px steps up (or one 58–62 px step) onto the 685 px end log with the exit; petals on a low log below. | 35 | 35 |
| 65 | **the last step up** (`w1-last-step-up`) | End | A bough (and an optional walk) then one 70–80 px hop up onto the 685 px end log with the exit. | 20 | 20 |

**Table 3b: measured layout of each kind.** Measured across every use in the 138 layouts, with ranges given as min–max. *Width* is the section's horizontal length. *Typical s* is the time model's seconds for the section. *Route gaps* are the route's gaps whose middle falls inside the section, including any soft dip. *Double-jump gaps* are the level gaps crossed only with a double jump; a miss returns the player to the take-off. *Logs / boughs* count floating or raised log and bough pieces. *Checkpoints* count flags inside the section. *Versions* lists each sub-layout's id and how often it was used.

| # | Section (id) | Width px | Typical s | Route gaps per use | Gap widths px, Normal | Gap widths px, Easy | Double-jump gaps per use (px) | Mushrooms | Logs / boughs | Petals | Checkpoints | Versions (uses) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `w1-home-banks` | 1139–1259 | 6–7 | 0 | – | – | 0 | 0 | 0 / 0 | 5–7 | 0 | a (19), b (18) |
| 2 | `w1-morning-path` | 1217–1510 | 7–8 | 0 | – | – | 0 | 0 | 0 / 0 | 5–7 | 0 | a (19), b (16) |
| 3 | `w1-forest-edge` | 1328–1642 | 7–9 | 0 | – | – | 0 | 0 | 0 / 0 | 1–5 | 0–1 | two (12), three-step (12) |
| 4 | `w1-learn` | 3057–3416 | 17–19 | 3 | 71–138 | 60–110 | 0 | 0 | 0 / 0 | 11–15 | 1 | old (47), four-stumps (35) |
| 5 | `w1-log-teach` | 2465–2839 | 13–16 | 1–2 | 71–101 | 60–80 | 0 | 0 | 2–4 / 0 | 7–12 | 1 | b (20), a (18) |
| 6 | `w1-step-stones-teach` | 2407–2873 | 13–16 | 1–4 | 73–95 | 60–76 | 0 | 0 | 0 / 0 | 8–12 | 1 | c (8), a (5), b (5) |
| 7 | `w1-dip-double-teach` | 2522–2983 | 14–17 | 4–6 | 71–203 | 60–203 | 2 (195–203) | 0 | 0 / 0 | 11–16 | 1 | a (43), b (31) |
| 8 | `w1-double-teach` | 2744–3454 | 15–19 | 5–6 | 195–203 | 195–203 | 5–6 (195–203) | 0 | 0 / 0 | 15–21 | 1 | gaps5 (30), gaps4 (29) |
| 9 | `w1-bank-double-teach` | 2522–2642 | 14 | 2 | 60 | 60 | 0 | 0 | 0 / 0 | 10–12 | 1 | a (5) |
| 10 | `w1-hop-bounce` | 2961–3743 | 16–20 | 2–3 | 71–100 | 60–79 | 0 | 2 | 0 / 0 | 7–14 | 1 | wall-leap (63), walls (53) |
| 11 | `w1-mushroom-bank-teach` | 2591–2869 | 14–16 | 0–1 | 73–88 | 60–70 | 0 | 1 | 0 / 0 | 7–9 | 1 | a (15), b (13) |
| 12 | `w1-mushroom-lift` | 2705–2774 | 15 | 0 | – | – | 0 | 1 | 0 / 0 | 8–9 | 1 | mound (3) |
| 13 | `w1-mound-log` | 3258–3781 | 18–21 | 0 | – | – | 0 | 0 | 2 / 0 | 6–12 | 0–1 | steps3 (24), steps2 (23) |
| 14 | `w1-twin-bounce` | 2608–3116 | 15–17 | 1 | 88–124 | 70–98 | 0 | 3–4 | 0 / 1 | 6–10 | 0–1 | 3-drop (15), 4-drop (7) |
| 15 | `w1-cache-stones` | 2752–3003 | 15–17 | 6 | 71–136 | 60–107 | 0 | 1 | 0 / 1 | 12–14 | 0–1 | dip-a (4), stones (2), dip-b (1) |
| 16 | `w1-stone-zigzag` | 2233–3808 | 12–21 | 0 | – | – | 0 | 0 | 0–2 / 0 | 6–10 | 0–1 | three (4), two-log (3) |
| 17 | `w1-stump-descent` | 2263–2702 | 12–15 | 0 | – | – | 0 | 0 | 2–3 / 0 | 8–11 | 0–1 | 4-3 (4), 3-2 (2) |
| 18 | `w1-stump-stones` | 3151–3398 | 17–19 | 5–6 | 73–127 | 60–101 | 0 | 0 | 0 / 0 | 11–14 | 0–1 | four (4), dips (2) |
| 19 | `w1-stones` | 3323–3437 | 18–19 | 9 | 66–131 | 60–104 | 0 | 0 | 0 / 0 | 15 | 0 | c (1), a (1) |
| 20 | `w1-stone-dips` | 3293–3675 | 18–20 | 5–6 | 72–123 | 60–98 | 0 | 0 | 0 / 0 | 10–16 | 1 | old (4), four-stumps (3) |
| 21 | `w1-floor-dash` | 2339–2628 | 13–15 | 0 | – | – | 0 | 0 | 6–7 / 0 | 14–17 | 0 | road7 (2), road6 (1) |
| 22 | `w1-bank-run` | 2447–3042 | 13–16 | 0–1 | 76–86 | 60–69 | 0 | 0 | 0 / 0 | 8–9 | 0–1 | a (12), b (5) |
| 23 | `w1-stair-run` | 2331–2914 | 13–16 | 0 | – | – | 0 | 0 | 0 / 0 | 8–9 | 0–1 | a (10), b (5) |
| 24 | `w1-zigzag-run` | 2863–3109 | 16–17 | 2 | 60 | 60 | 0 | 0 | 2 / 0 | 7–10 | 1 | a (5) |
| 25 | `w1-twin-mushroom-fork` | 2995–3631 | 16–20 | 1–2 | 72–99 | 60–78 | 0 | 2–3 | 2 / 0 | 7–12 | 0–2 | a (38), b (34) |
| 26 | `w1-root-stair-fork` | 2151–3192 | 12–17 | 0–1 | 72–97 | 60–77 | 0 | 0 | 2–3 / 0 | 5–13 | 0–2 | b (27), a (27) |
| 27 | `w1-stair-fork` | 2993–3204 | 16–18 | 1 | 72–98 | 60–78 | 0 | 0 | 2 / 0 | 8–13 | 0–2 | a (30), b (24) |
| 28 | `w1-hollow-twoway` | 2304–2518 | 12–14 | 0 | – | – | 0 | 0 | 2 / 0 | 6–8 | 0–2 | 360-stump (7), 300-stone (6), 300-stump (5), 360-stone (4) |
| 29 | `w1-mushroom-fork` | 3066–3149 | 17 | 1 | 78–94 | 62–74 | 0 | 2 | 0 / 3 | 8–10 | 1–2 | b (3) |
| 30 | `w1-mushroom-fork-dip` | 3050–3185 | 17 | 1 | 81–88 | 64–69 | 0 | 2 | 0 / 3 | 9–11 | 1–2 | b (2), a (1) |
| 31 | `w1-bank-stair-fork` | 3048–3104 | 16–17 | 1 | 83–93 | 65–74 | 0 | 0 | 0 / 2 | 10–14 | 2 | a (1), b (1) |
| 32 | `w1-meadow` | 2527–2752 | 14–15 | 1 | 74–102 | 60–81 | 0 | 0 | 0 / 0 | 6–10 | 0–2 | stumps (59), rocks (29) |
| 33 | `w1-log-walk` | 1251–1374 | 7–8 | 0 | – | – | 0 | 0 | 1–2 / 0 | 2–5 | 0–1 | one-log (41), two-logs (31) |
| 34 | `w1-fern-bank` | 1030–1133 | 6–7 | 0 | – | – | 0 | 0 | 0 / 0 | 2 | 0–1 | short (32), long-step (27) |
| 35 | `w1-clearing` | 1286–1414 | 7–8 | 0 | – | – | 0 | 0 | 0 / 0 | 2–7 | 0–1 | dip (20), step-up (12) |
| 36 | `w1-bough-bench-up` | 829–929 | 5–6 | 2 | 60–85 | 60–67 | 0 | 0 | 2 / 4 | 0–5 | 0 | up (22) |
| 37 | `w1-high-walk-up` | 886–969 | 5–6 | 2 | 60–82 | 60–65 | 0 | 0 | 2 / 4 | 2–5 | 0 | up (20) |
| 38 | `w1-high-walk` | 929–1020 | 6 | 2 | 60–142 | 60–112 | 0 | 0 | 2 / 4 | 3–5 | 0 | short (7), long (7) |
| 39 | `w1-bough-bench` | 754–992 | 5–6 | 2 | 60–142 | 60–112 | 0 | 0 | 2 / 4 | 0–5 | 0–1 | long (7), short (4) |
| 40 | `w1-bounce-double` | 2960–3113 | 16–17 | 1 | 95–134 | 77–106 | 0 | 1 | 1 / 1 | 11–13 | 1 | low (10), high (9) |
| 41 | `w1-bounce-over-dip` | 2310–2377 | 12–13 | 1 | 60 | 60 | 0 | 1 | 0 / 0 | 8–9 | 1 | a (4), b (1) |
| 42 | `w1-mushroom-log` | 2196 | 12 | 1 | 60 | 60 | 0 | 1 | 1 / 1 | 8 | 1 | a (1) |
| 43 | `w1-log-stair-test` | 2290–2901 | 12–16 | 3–4 | 60–112 | 60–89 | 0 | 0 | 3–4 / 0 | 5–9 | 0–2 | b (59), a (16) |
| 44 | `w1-leap-stones` | 4086–4451 | 22–24 | 10–11 | 73–234 | 60–205 | 1–2 (195–203) | 0 | 0 / 0 | 15–24 | 1 | two-gaps (15), one-gap (8) |
| 45 | `w1-fallen-trunk` | 2952–3085 | 16–17 | 0 | – | – | 0 | 0–3 | 3 / 0 | 15–16 | 1–2 | mushroom (7), double (7) |
| 46 | `w1-second-jump` | 3812–3888 | 21 | 7 | 109–211 | 86–202 | 3 (195–202) | 0 | 0 / 1 | 18–21 | 1 | old (5) |
| 47 | `w1-bounce-wall` | 2340–2653 | 13–15 | 1 | 60 | 60 | 0 | 1 | 0 / 0 | 10 | 1 | b (2), a (1) |
| 48 | `w1-stair-test` | 2417–2491 | 13–14 | 2 | 60 | 60 | 0 | 0 | 0 / 0 | 11 | 1 | c (2) |
| 49 | `w1-bank-stair-test` | 2340 | 13 | 2 | 60 | 60 | 0 | 0 | 0 / 0 | 11 | 1 | b (1) |
| 50 | `w1-two-answers` | 3338–3440 | 18–19 | 3 | 195–203 | 195–203 | 3 (195–203) | 0–3 | 0 / 0 | 14–16 | 1 | mushroom (3), double (2) |
| 51 | `w1-backstep-twist` | 2591–2651 | 14 | 0 | – | – | 0 | 0 | 3 / 0 | 8 | 1 | a (3) |
| 52 | `w1-stair-gap-twist` | 2946 | 16 | 2 | 76–78 | 60–62 | 0 | 0 | 0 / 0 | 9 | 1 | b (1) |
| 53 | `w1-canopy-drop` | 2738–2830 | 15–16 | 3 | 77–227 | 61–202 | 0 | 0 | 1 / 7 | 5–8 | 1 | b (3), a (2) |
| 54 | `w1-log-steps-descent` | 2860–3496 | 16–19 | 3–4 | 89–227 | 71–202 | 0 | 0 | 5–6 / 3–4 | 9–10 | 0–1 | a (2), b (1) |
| 55 | `w1-bough-descent` | 2694 | 15 | 3 | 85–98 | 68–78 | 0 | 0 | 1 / 7 | 6 | 1 | a (1) |
| 56 | `w1-seed-perch` | 2388–3027 | 13–17 | 0 | – | – | 0 | 1 | 1 / 0 | 6–13 | 1–2 | perch (69), low (69) |
| 57 | `w1-canopy-rungs-level` | 2758–2933 | 15–16 | 4 | 227 | 202 | 4 (227) | 0 | 4 / 3 | 11–16 | 1–2 | level4 (51) |
| 58 | `w1-mushroom-chain-back` | 3268–3451 | 18–19 | 4 | 60–145 | 60–115 | 0 | 1 | 2 / 7 | 10–16 | 2 | updown (39) |
| 59 | `w1-log-chain` | 2676–2878 | 15–16 | 4 | 60–227 | 60–202 | 0 | 0 | 6 / 4 | 6–11 | 2 | a (17), b (12) |
| 60 | `w1-log-chain-rise` | 2569–2678 | 14–15 | 4 | 60–227 | 60–202 | 0 | 0 | 6 / 4 | 7–11 | 2 | rise (23) |
| 61 | `w1-mushroom-chain` | 2906–3244 | 16–18 | 3 | 19–227 | 21–202 | 0 | 1–2 | 0 / 6–7 | 9–12 | 2 | a (10), b (7) |
| 62 | `w1-canopy-rungs` | 2725–2881 | 15–16 | 4–5 | 60–181 | 61–161 | 0 | 0 | 4 / 7–9 | 9–12 | 2 | rungs4 (5), rungs4-top (4) |
| 63 | `w1-quiet-arrival` | 925–965 | 5–6 | 0 | – | – | 0 | 0 | 1 / 1 | 2–5 | 0–1 | long (46), short (37) |
| 64 | `w1-sunlit-log` | 953–1215 | 6–7 | 0 | – | – | 0 | 0 | 2 / 1–2 | 2–5 | 0–1 | steps2 (20), steps1 (15) |
| 65 | `w1-last-step-up` | 987–1250 | 6–7 | 1 | 60 | 60 | 0 | 0 | 2 / 2–3 | 3–5 | 0–1 | hop (11), walk-first (9) |

### Kinds in the 1-1 pool that appear in none of the 138 layouts (0 layouts, 0 uses)

| Section (id) | What the player does |
|---|---|
| `w1-high-leaps` (high boughs) | A floor mushroom up to boughs about 241 px over the floor, then double-jump gaps between boughs, with low stumps on the floor road below |
| `w1-bounce-run` (up and along) | Five boughs reached by bounce, then double jumps; or three boughs and a bounce wall |
| `w1-stump-stile` (stump stile) | Stumps stepping up and down (50–100 px) over the floor, laid twice |
| `w1-log-road` (raised log road) | Four to six thin logs about 110 px over the floor, low rocks between, a bank step at each end |
| `w1-bough-stepup` (into the boughs) | Boughs rising 70–90 px each from about 180 px over the floor; exits about 491 px higher |
| `w1-dropdown-stair` (drop and climb back) | A drop of about 190 px to the floor, then a stump stair (2–4 steps) back up 80 px |
| `w1-knot-bank` (stepped mound) | Two or three 50–56 px mound steps up, then steps or a hop down; laid twice |
| `w1-stump-towers` (stump towers) | Four or five floating logs, each 136–140 px higher, taken with double jumps |
| `w1-canopy-weave` (canopy weave) | Two bough roads about 100 px apart that rejoin; double jumps on the high road |
| `w1-stilt-logs` (high stump logs) | Four or five thin logs, each 136–140 px higher, taken with double jumps |
| `w1-bough-log` (bough stair and log span) | Boughs rising 136–140 px with double jumps, then a log span; exits about 414 px higher |
| `w1-dipping-boughs-twist` (up and down the boughs) | Boughs going up with double jumps (136–140 px) and down 40–60 px |
| `w1-high-step-twist` (up, then the double back down) | Bank steps up, then a double jump across to a lower stair |
| `w1-drop-bounce-twist` (drop onto the mushroom) | A drop onto a floor mushroom, then a 136–140 px rise |
| `w1-long-bounce-twist` (the long bounce) | A bounce across a gap at nearly a double jump's full reach |
| `w1-dip-bounce-twist` (out of the dip) | A step down into a dip, then a bounce out onto a 136–140 px bank |
| `w1-bounce-stair-combine` (bounce, double, up the stair) | A bounce and a double jump onto a stair; exits about 390 px higher |
| `w1-bounce-bough-combine` (bounce into the bough) | A bounce and a double jump onto floating boughs; exits about 250 px higher |
| `w1-stair-test-back`, `w1-log-stair-test-back`, `w1-bank-stair-test-back` | The steep stair, logs up the bank, and the bank wall, each followed by a stair back down to the starting height |
| `w1-bounce-stair-level` (bounce, double, up the stair and down) | Bounce, double jump up a stair, then back down to 59 px above the start |
| `w1-two-lifts` (two lifts) | Two floor mushrooms, each in front of a bank 200–220 px up; exits about 420 px higher |
| `w1-mushroom-stair` (mushroom stair) | A bounce up onto a bank, a double jump across a level 195 px+ gap, then a two-step stair down |
| `w1-canopy-weave-rise` (canopy weave, rising) | Two bough roads, both climbing two 136–140 px rises with double jumps |

Four more World 1 section kinds (`w1-stone-road`, `w1-low-boughs`, `w1-ledges`, `w1-ropes`) are excluded from the 1-1 pool.

## 4. Stage length, time and section count (all 138 layouts)

| Measure | Normal min / median / max | Easy min / median / max | Source |
|---|---|---|---|
| Stage width (px) | 31,025 / 33,751 / 41,169 | 33,267 / 36,162 / 44,129 | built stage `config.levelWidth` |
| Spawn to exit (px) | 30,585 / 33,311 / 40,729 | 32,827 / 35,722 / 43,689 | `exitTotemX − spawnX` |
| Modelled time, typical player (s) | 174.1 / 188.1 / 230.4 | 186.2 / 201.2 / 246.3 | `gen2.modelled.typical`, `pipeline.ts:2733` |
| Modelled time, fast player (s) | 143.1 / 154.1 / 189.1 | 153.0 / 165.1 / 202.1 | `gen2.modelled.fast`, `pipeline.ts:2733` |
| Sum of section times (s) | 160.8 / 175.5 / 215.5 | 172.9 / 188.6 / 231.5 | `gen2.sections[].seconds` |
| Sections per layout | 12 / 13 / 15 | 12 / 13 / 15 | measured |
| Checkpoints per layout | 10 / 11 / 15 | 10 / 12 / 15 | measured |
| Petals per layout | 92 / 120 / 149 | 92 / 116 / 157 | measured |

The time model's run speeds are 65% of top speed for the typical player (185 px/s) and 80% for the fast player (228 px/s), plus extra time for climbs and other moves (`src/game/stageTime.ts:38-39`, `:73`).

Distribution of sections per layout: 12 → 37 layouts, 13 → 66, 14 → 26, 15 → 9.

## 5. Method

Layouts 1–138 were built through the game's stage entry point (`generateStage` in `src/game/stageGenerator.ts:2849`, layout number *n* = list entry *n* − 1) on Normal and on Easy. For each layout the script read the built stage: platforms, collectibles, checkpoints, gaps (`gen2.falls`), double-jump zones (`heartFalls`) and the section list with x-ranges (`gen2.sections`). All 276 builds reported no errors, and each one used its listed seed. Section descriptions come from the section definitions in `src/game/gen2/worlds/w1.ts` (design ranges in px). The per-section counts in Table 3b come from the built stages.
