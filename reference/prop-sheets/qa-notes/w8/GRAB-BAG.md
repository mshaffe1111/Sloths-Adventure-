# World 8 grab bag: the pieces we have, and the new kinds we need (2026-10-30, ~11:20 PM ET)

Why this exists. After tonight's re-curation (w8-merge), 5 of World 8's 7 gen2 stages ship under the 0.35 variety rule:
8-1 0.225, 8-2 0.325, 8-3 0.332, 8-5 0.288, 8-6 0.148 (8-8 0.422 and 8-9 0.465 pass). More rolls from the same bag don't fix it:
8-6's whole pool of 300 rolls is 0.077 apart, and its two themes are only 0.22 apart from each other.

## 1. How variety is measured (so a new piece actually counts)

`tools/inspect/beats.ts` turns a stage into beats, each with one of six letters; variety is 1 - cosine of the letters' 3-grams
(`analyze.ts profile`). The look-alike rule (`lookalike.ts`) is finer: it compares 20 s windows by what each beat IS (`moveKind`).

| Letter | Weight | What makes it |
|---|---|---|
| h | 0.5 | a small hop, a step up a knot |
| J | 1 | a jump, a double jump, a glide, a bounce, a hop onto a moving platform |
| V | 2 | a climb, a liana swing, a rope shimmy, a lift, riding warm air |
| C | 2.2 | an animal |
| Z | 2 | a timed or zone hazard: a watcher (roost, eagle), a gust, spores, a tide, crumbling floor, the dark |
| P | 2.8 | a puzzle room step |

So a new piece raises variety only if it changes a stage's letter mix (a V, Z or P where the stage had J and h), and it only stays
legal if its 20 s windows don't read like a neighbour's (8-5 is all climbs and lianas, 8-8 is animals, 8-2 is roosts).

## 2. World 8's pieces today, and their beats

| Piece (gen2) | Where | Beat |
|---|---|---|
| boughs, knots (up/down) | every stage | h |
| gaps, wide gaps, second-jump gaps | 8-1, 8-2, 8-6, 8-8, 8-9 | J |
| moonlight glide gaps | 8-6 (all of it) | J |
| trunks to climb (climbWall) | 8-1 dark, 8-2, 8-5 | V |
| lianas (w8Swing) | 8-3, 8-5 | V |
| hunters: ocelot, jaguar, boa, tayra, harpy | every stage, most in 8-8/8-9 | C |
| bat roosts with hollows and leaf curtains (watcher) | 8-2 | Z |
| dark stretches lit by fireflies | every stage (required) | Z |
| puzzle rooms: dark hollow, leaf hammock, branch seesaw (W8 plates, levers, doors) | 8-1, 8-2, 8-5 | P |

8-6 Glide by Moonlight is J and h almost only. 8-1 is J, h and the dark's Z. 8-5 is V almost only.

## 3. Art on hand (exists today, unused or under-used)

| Art | File | Used today |
|---|---|---|
| rope bridge, bouncy leaf, knot perch, branch fork, shelf fungus | `props-made/w8b.webp` (+ .json) | only the leaf hammock (8-2's room) |
| roost branch (2 looks), seed pod, open seed pod, seed piles | `props-made/w8roost.webp`, `w8roost-b.webp` | not drawn anywhere |
| fruit bat asleep (doze frames) | `creatures/fruitbat-w8.json` / `-anim.webp` | not drawn |
| fruit bat in flight | `creatures/fruitbat-fly.json` | the roost's sweep (batArt.ts) |
| the painted moth, jar, firefly tree | `w8LanternAtlas.ts` (8-4) | 8-4 only |
| baked light holes (soft and ring) | `zoneArt.ts holePic` | every dark stage |
| W8 room pieces: glow-mushroom plate, branch lever, bark door | `w8RoomArt.ts` | 8-1, 8-2, 8-5 rooms |
| variant boughs and banks | `props-made/w8var.webp` | not drawn |

## 4. New section types (each with its own beat), and who gets them

Signatures: 8-6 gets A and G, 8-1 gets E and F, 8-5 gets C and D. B is a spare for 8-2 or 8-3. Each signature
lives in its own lit theme on that stage, so a roll either has it or not: that is what spreads the rolls apart.

### A. Night gusts over the glides (8-6) — beat Z (`wind gust`) inside J
A gust blows through a gap in the canopy on a rhythm: leaves stream first (the warning, at least 1 s), then the gust pushes a glide
back for up to 2 s. Wait on the lip for the lull, then glide. Never a gust on a gap's far lip; Easy's gust is weaker and its lull longer.
- Engine: the wind zone exists (`zones.ts` 'wind', World 4's gusts). gen2 needs `SectionZone` 'wind' (like 'tide': pipeline.ts
  lays it over a section's glide gap) and levelCheck's gust check (it already checks World 4's).
- Art: on hand: the code-drawn leaf streaks World 4's wind uses (`leafSprites.ts`), recoloured to moonlight (a small code touch,
  STAGE-RULES §4). Optional NEW: a painted moonlit gust streak (brief below).
- Status: building tonight, 8-6 first.

### B. Seed-pod drops (spare: 8-2 or 8-3) — beat Z (`crumbling`)
A ripe seed pod hangs from a roost branch over a gap; stand on it and it drops after 0.8 s (the open pod frame), a shortcut to a
higher bough. Never required (STAGE-RULES §1): the long way round always stays. It grows back off screen after 30-35 s.
- Engine: the crumble zone and fragile platforms exist; gen2 has `SectionPiece.crumble` (World 7's tiles).
- Art: on hand: `w8roost` roost branch, seed pod, open pod, seed piles (fallen pods on the bough below).

### C. Rope bridges (8-5) — beat V (`shimmy along a rope`)
A sagging rope bridge strung between two boughs over a gap; Pokey shimmies under it hand over hand (1-3's rope, 120 px/s). It reads
apart from a climb or a liana on the look-alike measure (its own moveKind), and 8-5's next branch is sometimes across a rope.
- Engine: ropes exist (1-3); gen2 needs a 'rope' piece kind (the `Move` 'rope' is already in types.ts) and levelCheck's rope link.
- Art: on hand: `w8b` rope-bridge (432 x 154), stretched by its ends.

### D. Bouncy leaves (8-5) — beat J (`mushroom bounce`), its own moveKind
A huge springy leaf on a trunk's foot throws Pokey up to the next bough: a climb skipped, so 8-5's rolls with leaves are faster and
read differently on the look-alike measure. Taught on its first appearance (Dot: "(new, needs Matt's approval)").
- Engine: World 3's mushroom bounce. gen2 needs a 'bounce' piece.
- Art: on hand: `w8b` bouncy-leaf (396 x 373). Must not look like the room's glow-mushroom plate (that was kept from reading as a bounce).

### E. Sleeping bat run (8-1) — beat Z (a timed watcher with no cover)
A row of fruit bats dozes under a long low bough. They stir on a rhythm (the doze frames' head-up as the warning); walking under them
while they stir wakes them and they flutter out (a scare and a push back to the bough's start, no life lost). Time the run. No hides,
which is what keeps it apart from 8-2's roosts on the look-alike measure.
- Engine: the watcher (`watcher.ts`) with its warning; the setback instead of a hit.
- Art: on hand: `fruitbat-w8` (doze frames), `fruitbat-fly` (the flutter out), `w8roost` roost branch.

### F. Moth swarms that dim the light (8-1) — beat Z
In a dark stretch, a cloud of moths drifts through the fireflies; while it passes, the lights it covers shrink to half. Wait in a lit
spot for it to pass, or go dim. Never a gap in the dimmed light (STAGE-RULES §6 "dark": no blind jump).
- Engine: the dark zone's lights (drawDarkness) get a dim factor; the swarm is a moving zone.
- Art: on hand: the 8-4 moth (`w8LanternAtlas.ts`), drawn several times. Optional NEW: a moth-cloud sprite (brief below).

### G. The fallen pup (8-6) — beat P (a puzzle room)
A bat pup has fallen from the roost onto a low bough. Lower the roost branch to it with the branch lever, a plate holding the
branch while Pokey carries the pup up the knots (carry: slower walk, no jump, a walkable carry path). Dot explains the shut door.
- Engine: the puzzle kit (W8 plates, levers, doors in `w8RoomArt.ts`, rooms in `w8Rooms.ts`).
- Art: on hand: the lever, plate and door, the roost branch. NEW: the pup (brief below).

## 5. Hugging Face briefs for the NEW art (tomorrow's art helper; no jobs tonight)

All painted to World 8's kit (storybook painted, dark outlines, soft cel shading, moonlit blues and violets with warm firefly
highlights; img2img from `props-made/w8b.webp` and `w8roost.webp` for the style), on flat magenta #FF00FF, cut with the HF batch
cutter, packed into `props-made/` with a .json like w8roost's.

1. **Bat pup (for G).** A baby fruit bat, wings folded, big eyes, soft fur, sized to be carried in a sloth's arms. 4 frames: sitting
   scared, held (wings tucked, looking up), a little wing flutter, asleep. 1024 x 256, each frame 256 x 256. Attach `fruitbat-w8-anim.webp`.
2. **Moonlit gust (for A, optional: the code leaf streaks work without it).** A horizontal streak of wind carrying small leaves and
   petals, pale moonlight blue-white, 4 frames that loop when tiled left to right. 1024 x 256.
3. **Moth cloud (for F, optional).** A loose cloud of 12-16 pale moths, soft glow on their wings, 4 frames of flutter that loop.
   768 x 256.

Budget: about $1-2 on rtx-pro-6000 at ~$2.75/h, well inside the reserve.

## 6. The target: more pieces, not the minimum (Matt, 2026-10-30 ~10:50 PM ET)

"I'd rather have more pieces and have that variety than trying to just barely squeak past something." Aim at 0.45+ on every World 8
stage, with as many new section types as the world can carry. The way to get there is the same each time: each stage carries three or
more lit themes, at least one of them built on a beat no other theme of that stage has, so rolls fall into clearly different kinds.

Built tonight (A): the night wind. 8-6 gets the 'gusts' theme (a tailwind carrying the glides); 8-1 gets its own (a headwind on plain
gaps to wait out). Measured on 24 raw rolls each: 8-6 0.081 -> 0.395, 8-1 0.168 -> 0.467.

More pieces, on hand art first (each its own theme on the stages named):
- **H. Knot-perch hops** (8-3, 8-6): a run of the tiny `w8b` knot perches over a gap, short precise hops (h J h J); a moveKind of its own.
- **I. Lantern swing** (8-3): a liana with a firefly lantern hung on it; swinging carries the light through a dark stretch (the swing
  lights its own way). Art: the 8-4 jar on the liana.
- **J. Shelf-fungus steps** (8-5, 8-2): `w8b` shelf fungus up a trunk's face as steps instead of a climb (h h h up the trunk): 8-5's
  rolls with fungus stairs read apart from its climbing rolls.
- **K. Branch-fork drops** (8-2, 8-9): `w8b` branch fork as a one-way drop through the canopy to a lower route (a fall that is the way on).
- B to G as above.

Per stage, the plan for three or more themes (now -> next):
- 8-1: leapers, night, gusts (built) -> + E sleeping bats or F moths
- 8-2: high blooms, gap blooms, roost blooms -> + J fungus steps, K fork drops (it sits at 0.325)
- 8-3: prowlers, chains -> + H knot perches, I lantern swing (0.332)
- 8-5: climbers -> + C rope bridges, D bouncy leaves, J fungus steps (0.288; it has one theme only, the biggest gap)
- 8-6: prowlers, leapers, gusts (built) -> + H knot perches, G the fallen pup
- 8-8, 8-9 (0.42, 0.47): a third theme each later (B seed pods, K fork drops)

## 7. Order

Tonight: A for 8-6 (on-hand art), then re-curate 8-6. Next: E and F for 8-1, C and D for 8-5 (all on-hand art), each in its own lit
theme, then re-curate 8-1 and 8-5. Then G once the pup is painted. Every new section is validated on all three Jump help settings.
