# ENG-24e line: river reports

(ENG-24e and ENG-24f wrote their notes in reference/handoffs/engine-core.md §0zq-24e and §0zq-24f; INT-14 merges t-eng-24e. ENG-24g first, then ENG-24h.)

## ENG-24g (11-20; packet reference/packets/2026-11-20/ENG-24g.md): the bot catches a liana over the tail; OVER_TAIL 90; castBots PASS

Base: t-eng-24e 4c34eb81 (ENG-24f's final). Evidence: reference/qa-reports/ENG-24e/g/.

### 1. The trace (before any fix): what the bot actually did

castBots 2-4 on 6040e41c (ENG-24f, cast24f.txt) failed Normal: child 4/40, middle 1/40, expert 4/40, nearly all `time goal 0/1`.
Three of those runs, traced frame by frame on 4c34eb81 (g/trace24.mts, g/trace24g.txt): child, middle and expert seed 2 Normal.

- All three cleared beats 1-3, then at beat 4 (river 10155-10893, its tail 430, the liana at 11003, 110 px past the logs' end)
  boarded a log, rode it to x ~10894 (where the logs go under), dropped with it into the safe river, were set back on the near bank,
  and boarded the next log: again and again, ~1100 s, to the 1200 s cap. No jump was ever made for the liana; no life lost.
- Why: firsttimer.ts `vineFromLog` looked for a liana only over the logs' window (`q.x < d.x1`). A liana hung past where the logs go
  under (over the tail, up to `riverEnd(d)`) was invisible to it. ENG-24f's guess was right.

### 2. The fix (the bot's only, never the data or the judge) and the plant (level.md rule 21)

- `SKILLS.vineOverTail` (firsttimer.ts): `vineFromLog` looks for a liana over the river's whole water (`riverEnd(d)`); on a tailed
  river it takes off only short of the painted end (`x <= d.x1 - 10`: past it the log is under, no floor, engine.ts drift loop); a
  liana over the tail is never "the one he just left" (no let-go from it lands on a log: a log under it means a let-go that fell
  short). Untailed rivers: unchanged (`riverEnd(d) === d.x1` with no tail; the take-off and retry clauses need a tail).
- The toy: lianaRiverToys.ts `tail` (World 2's `twin` + a 430 px tail, DEEP; its one liana 90 px past where the logs go under,
  340 long: 2-4's beat 4 on Normal). The test asserts the case first: a tailed river, the liana over the tail (past `x1`, before the
  far bank), no liana over the logs' window, and the judge's own reach (`riverLay.ts logCatches`: a jump off a log catches it).
- PLANTED, tools/inspect/lianaRide.test.ts 'A VINE OVER THE TAIL' (CI: gates.yml's engine tools' tests), child/middle/expert x
  variants 1-5, Normal, the real InputEngine:
  - GREEN with the skill: 15/15 to the shrine, 0 rescues, each caught the liana off a log (12 lives in all) (g/plant24g-green.txt);
  - RED on the old reach (the bot's lines reverted to `q.x < d.x1`, the toy at its first 110): 13/15 rescued, 139 lives,
    the test's "with the skill" line FAILS (g/plant24g-red.txt). The test's own PLANTED half (the skill off) asserts >= 12 of 15
    rescued.

### 3. castBots before / after (2-4 seeds 1-40, 5 bots, both settings, the gate's own input: FakeInput)

| run | child N | middle N | expert N | child E | middle E | kid N | adult N |
|---|---|---|---|---|---|---|---|
| ENG-24f 6040e41c (cast24f.txt) | 4/40 | 1/40 | 4/40 | 40/40 | 40/40 | 21/40 | 9/40 |
| ENG-24g d9b0854c, OVER_TAIL 110 (g/cast24g.txt) | 38/40 | 40/40 | 40/40 | 40/40 | 40/40 | 22/40 | 36/40 |
| OVER_TAIL 90, before the retry (g/cast24g90.txt) | 38/40 | 40/40 | 40/40 | 40/40 | 40/40 | 30/40 | 38/40 |
| **bc8c896c: OVER_TAIL 90 + the retry (g/cast24g90b.txt)** | **40/40** | **40/40** | **40/40** | **40/40** | **40/40** | 30/40 | 38/40 |

(kid and adult, the first-timers, are printed, not the bar; kid Easy 39/40, adult Easy 40/40 throughout. `--input touch`, the phone's
own minimum hold, at OVER_TAIL 110: child/middle/expert 40/40 both settings, g/cast24g-touch.txt; context only, never the gate.)

**The child's misses at 110, traced (a design finding, the lead's ruling B):** seeds 14 and 19 rode beat 4's logs to the cap. From a
log, a jump catches the tail liana only from the last 45 px of the logs' window at the child's own hold: 2.9% of (take-off x, swing
moment) pairs; middle/expert 11.4% from the last 85 px; a run on the log reaches 4.3% (g/window24.mts). `logCatches` passes because
it asks only that SOME take-off catches. The lever is boxed in: the tail >= 418-423 px (no log-only crossing, rideAcross), FAR lands
a let-go <= 360 px past the anchor. The lead (9:45 AM ET): OVER_TAIL 90 (child 5.1% / 5.2% from the last 65 px; FAR 20 px spare).

**The child's misses at 90 (seeds 8, 29), traced (g/trace24g-retry.txt):** seed 8 caught the liana off a log at 112.3 s; the
let-go can fire only after 1 s on the vine (World 1's tester-calibrated `swingT > 1`, untouched), so it fired at the swing's dead
end (a 0.99, om 0.15) and his 0.144 s press lag put the leap on the back swing: into the tail ~200 px short. From then on `swungOn`
("never the one he just left") never expired: `vineFromLog` never aimed at that liana again, to the 1200 s cap. A bot fault, fixed
under the same skill (a liana over the tail is never "just left"). Seeds 8 / 29 after: shrine 333 / 342 s.

### 4. The data (w2Arc24.ts) and what holds it

- `OVER_TAIL` 110 -> 90 (the lead's ruling B, 11-20 9:45 AM ET); `TAIL_24` 430 unchanged; Easy rows unchanged (no tail).
- Relist 2-4: 100 of 100 kept, the quiet line <= 4 s on all 100, the list file byte-identical (g/relist24g.txt).
- rideAcross24 s1/s2 (g/rideAcross24g.txt): Normal beats 4 and 6 never crossed on a log alone; Easy crossed (no tail, the ruling).
- The judge: every listed seed builds clean on both settings (the relist); river / 2-4 test files 40/40 (g/rivertests24g.txt:
  riverTail, lianaRiver, w2Arc24, w2Stages, judgedTable, riverRaft); bot test files 46/46 (g/bottests24g.txt: lianaRide, riverRide,
  firsttimer, castBots).

### 5. Gate table (the joint head, ENG-24h merged)

(filled in on the joint head)

### Polish check

No drawing changed on this line in ENG-24g (the bot, the toy, one data constant). The liana moved 20 px nearer the reeds on beats 4
and 6 (Normal): the lead judges the stills of the moved liana from ENG-24h's joint-head shots (2c + the clip, draw only).

### Learned (for the next builder)

- A bot skill written for one placement ("a liana over the logs") silently refuses the next placement ("over the tail"): when the
  judge gains a case (tailLianaFaults, levelCheck 3a'), the bot's matching skill is checked against the same case with a planted toy
  the same day. Proposed for level.md rule 21: "a new JUDGE case is a new mechanic: its bot toy comes with it."
- `logCatches`-style "some take-off catches" reach checks hide how thin a window is: report the share (as the drop judge does) when
  a beat is laid on one. Proposed: tailLianaFaults also reports the stand-jump catch share from a log for the child's hold, and the
  lead sets its floor.
- Trace before fixing: both rounds of child misses were different causes (a thin window; then a memory that never expired).

### Lessons applied

D15 (test the measuring tool before trusting it: the bot was traced and planted before castBots was believed); D19 (the gate calls
the same code: castBots on its own default input, the touch run kept as context only); level.md rules 21 and 28 (the toy first, RED
and GREEN; every miss traced before it was fixed); law 22 (no judge or gate changed; the data moved only on the lead's ruling).

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
