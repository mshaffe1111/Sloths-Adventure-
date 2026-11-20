# ENG-24e line: river reports

(ENG-24e and ENG-24f wrote their notes in reference/handoffs/engine-core.md §0zq-24f; this file starts with ENG-24h.)

## ENG-24h: 2c, the bank's rock solid (R-165.323), and the log-going-in clip (draw only)

Branch t-eng-24h from t-eng-24e 4c34eb81. Final hash: the commit that carries this report (its last line, sent to ENG-24g and the lead); code as gated: cc421d154. Packet: reference/packets/2026-11-20/ENG-24h.md.
Lead's ruling on the 2c stills (a51677686, 11-20 morning): PASS; the named residual accepted; World 1 kept on its old face line.

### The root (measured, three parts)

The bank end piece (each world's `end` in src/assets/ground/w<N>.webp, drawn 300 units tall by groundPaint.ts drawEnd) was see-through
over its rock, so the bank's soil (the same world tiles as the under-river soil) and the river's bed ran on across the face line:

| part | what | measured |
|---|---|---|
| a | the rock rim fades inward over 50 px plus a 6 px blur (tools/art/hfground/pack.py `rim`) | 40-86% of interior pixels under alpha 250 |
| b | its last 120 rows fade out (pack.py: "the rim hands over to the soil below it") | rows 468/504/540 at alpha 227/150/74; 88-100% of the lower fifth see-through |
| c | the face line (`face`, the line the bank's soil AND the river's water are cut to: endFace) was measured at the rightmost solid pixel, hanging roots included | it ran 6-21 units (mean, per world) outside the rock, up to 69; 81-95% of that gap drew soil (the lead's 2-4 catch spot) |

The paint under the fade is whole (the column is painted to its foot: alpha forced to 255 shows it), so the fix restores the rock's own paint.

### The fix (src/game/groundPaint.ts, src/game/protoArt.ts, src/game/groundAtlasData.ts)

- **endSolid** bakes each world's piece once: **solidEndAlpha** (pure) raises alpha, never lowers it: per row the rock's face is the right
  edge of its body (alpha over half the row's highest, a run of 11 px or more, so a root does not set it; median over 9 rows); every pixel
  from the row's first painted pixel to the face is made solid within 95 px of the face (about the old fade's middle, so the rock reads as
  wide as before), handing over to the soil in 16 px (was 50 + blur), down to the last 36 rows (was 120). A clear pixel inside the rock (World
  9's cracks between columns) takes the darker of the paint either side. Baked again on a canvas loss (canvasLost.ts, LESSONS D6); the faded
  step copies (endFaded) are cut from it and cut again when it is re-baked (both tested).
- **shadeEnd**: solid to its foot, the rock drawn unshaded stood as a lighter stripe down the darkened soil (my first after stills, 2-2 and
  2-4 upright). drawEnd now takes the bank's depth view (protoArt passes the ground's line, as drawSoil gets it) and darkens the rock's own
  pixels exactly as shadeSoil's depthBand darkens the soil (source-atop in one reused scratch canvas). The banks are painted once into the
  ground squares, so this runs when a square is painted, not each frame.
- **face** re-measured on the rock (tools/art/hfground/endface.py --write): 25 points (was 9), each at or inside the rock's edge over the
  rows either side, so the straight line between two points never runs outside the rock. Worlds 2-10. **World 1 kept** on pack.py's line:
  its pits' drops and hollow walls are fitted to it (w1Pits.ts dropOutline, wallLine) and hollowWalls.test.ts fails on the rock's line
  ("a wall held on its bound"); its line runs 6 units outside its rock on average, over pits, never a river. Lead: accepted.

### Planted

- **tools/perf/endcheck.mjs** (new, seconds): every world's end drawn by the game's own drawEnd over its own soil outline, once on magenta
  soil and once on green; a pixel that differs shows what is behind it. Pass: under 0.5% of the rock band (40 units in from the face, 20
  under the walk to 20 above the foot) see-through. It plants the old piece (the sheet's own, drawn as the base drew it): must be RED.
  - The old state (base 4c34eb81's piece and face line, my first run): 24.4-30.4% of the rock see-through, lower fifth 88-100%, roots'
    gap soil 81-96%, every world.
  - Now (reference/qa-reports/ENG-24e/endcheck24h.txt): game GREEN 0.00-0.08% every world, lower fifth 0.00% every world, roots' gap
    soil 0.00% Worlds 2-10 (World 1: 88.6%, its line kept); the plant (the old piece on today's line) RED 24.4-26.8% every world.
  - Not yet in CI: proposed for gates.yml beside kbdcheck (the lead's call).
- **src/game/groundEnd.test.ts** (3 tests): solidEndAlpha on a made-up piece shaped like the sheets' (the plant: see-through before;
  solid after; a root keeps its alpha; the root's gap stays clear; never lowered); every world's face has 25 points (World 1: 9) from the
  corner in; the canvas-loss re-bake of the solid piece and its step copies.

### Stills (reference/qa-reports/ENG-24e/stills/h-2c/{before,after}/)

Shot by rivershot.mjs on the real page, Normal (printed from the game: `easy=false`), layout 1, upright 412x915 and sideways 915x412 at 2x;
before = base 4c34eb81 (its own dev server), after = this branch. Each spot: the whole screen, `-crop` (2x, the bank's face to the screen's
foot), `-crop-contrast` (autocontrast 1%).

| spot | face | the lead's crop spot |
|---|---|---|
| 2-1 x8420 safe | right end x8483 | |
| 2-2 x4710 pondFar | left end x4650 | upright crop x 150-290, y 950-1050 (the stone) |
| 2-4 x9970 catch | right end x10028 | upright crop x 285-355, y 830-875 (soil between the rock and its roots) |

### Clips (reference/qa-reports/ENG-24e/clips/)

`2-4-b4-safe-into-reeds-upright.mp4` and `2-4-b6-deep-into-reeds-upright.mp4`: 9 s each, 30 fps, the real page stepped 1/30 s on
Playwright's clock (logclip.mjs), the view held on the logs' end, Pokey waiting on the far bank (3 lives throughout), a replay's save (2-4's
halfway line already heard: on a fresh save his line sat over the reeds for the whole clip). Beat 4: three logs in view, each slides in under
the reed clump and is gone at about x10904 (x1 + TAIL_END.hide) while the next follows. Beat 6 (deep): the same at about x16710; the logs
read against the dark water by their pale bark. Each frame's log positions: `2-4-*-track.json`.

### Gates

Code at cc421d154 (the commits after it are this report and the endcheck output only). Times ET 11-20.

| gate | result |
|---|---|
| `npx tsc --noEmit -p .` | PASS |
| the suite, 6 shards (`--test-shard=k/6`, CI's glob), 10:02-10:52 | PASS: 3947 tests / 3945 pass / 0 fail / 2 todo (shards: 624, 810, 698 (1 todo), 616 (1 todo), 593, 606; groundEnd's 3 included) |
| river + ground tests (river*, log*, lianaClock, runnerLiana, safeRiverPreload, groundEnd, hollowWalls, pitPocket, groundSeams, canvasLost) | PASS: 54 / 54 / 0 / 0 (then groundEnd 3/3 with the loss test) |
| `node tools/perf/drawcheck.mjs` (its fixed set: 2-1, 2-2, 2-4 upright and sideways among 36), 10:00-10:17 | PASS (36/36, 1002 s) |
| `npx tsx tools/engine/paintcheck.ts`, 10:00-10:27 | PASS (429 known ids seen, 0 new) |
| `node tools/perf/artcheck.mjs` | PASS |
| `npx tsx tools/engine/generalitycheck.ts` | PASS |
| `node tools/perf/knowncheck.mjs` | PASS |
| `node tools/perf/endcheck.mjs` (new) | PASS (plant RED every world) |

Not run here (ENG-24g runs the full CLAUDE.md list on the joint head): the build + chunkcheck, clipcheck, kbdcheck, buildcheck, seedlist,
the engine tools' tests, tierBots, roadmapcheck.

### Polish check (STAGE-RULES §5b)

1. Painted, not drawn: PASS. The rock is the sheet's own paint (restored alpha); the only code is the soil's own depth shade laid on it.
   (after/*-crop.jpg)
2. Nothing copy-pasted, no seams: PASS. No stones or bed band cross the face (after/2-4 upright crop-contrast); the inner hand-over is 16 px
   and darkened like the soil, no stripe (after/2-2 and 2-4 upright crops, judged at full size). The first try (unshaded) FAILED this: a
   lighter stripe down the face; fixed by shadeEnd before the stills went to the lead.
3. Art matches what it is: PASS. The water and the soil stop at the rock's own edge; the roots hang over the water (after/2-4, 2-1 upright).
6. Framing both ways: PASS (after/*-upright.jpg, *-sideways.jpg).
10. Motion: PASS. Logs slide under the reeds with no pop (both clips).
- **Named, accepted by the lead:** 2-2's stone (the lead's first spot) still shows faintly in the rock's last ~19 units, where its foot
  hands over to the soil (after/2-2-...-upright-crop-contrast.jpg, bottom). Covering it means rock drawn below the piece, which would move
  every world's pit faces: not done (lead).
- **Pre-existing, the same before and after, logged by the lead:** a darker box low right under the 2-1 river; a thin pink line along the
  top of 2-2's bank soil (crop y about 558).

### Lessons applied

D6 (a cached canvas re-bakes on loss, and the re-bake is tested); show first (before/after stills to the lead before the gates); a still is
labelled by what the game BUILT (rivershot prints `easy=false`, the camera and view); an action is judged on a clip of the whole action
(logclip); law 22 (the root fixed in the art's bake and the outline's measure, no rule or limit moved); law 2 (judged the real screen at full
size: the stripe was caught there, not in thumbnails).

### Learned (for the next builder)

- A painted piece's alpha can be a MASK over complete paint (pack.py faded the bank end on purpose, so the soil would show). Before
  re-painting or asking for art, force alpha to 255 and look: here the fix was restoring the paint's own opacity.
- Anything that becomes opaque where it used to fade must take the same light as what is around it (the depth shade): an unshaded solid
  piece reads as a pasted stripe.
- An outline measured at "the rightmost solid pixel" includes hanging roots and leaves; measure the body (a run wider than a root), and keep
  each point at or inside it.
- Check what else is fitted to a shared line before moving it (endFace feeds the soil, the river, World 1's drops and hollows).

### Proposed rule change (level.md / gates)

- Add `node tools/perf/endcheck.mjs` to gates.yml and gates.md (seconds; planted RED in every run). Rule: "an end, rim or edge piece drawn
  over terrain is solid over its body: endcheck".

### Method update

- reference/qa-reports/ENG-24e/logclip.mjs: a held-camera, frame-stepped clip of a drawn thing in motion (the view held where the camera
  puts him at a spot, then he waits out of the way); seed the save so a story line does not cover the subject.

### Follow-ups for the lead (not done here)

- World 1's face on the rock: needs w1Pits' hollow-wall fit re-tuned (hollowWalls.test.ts) and World 1 pit stills.
- R-165.323 has no line on reference/ROADMAP.md on this base (only in INT-13's report and the code): the roadmap keeper's.
