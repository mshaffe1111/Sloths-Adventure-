# GATE-292: painted style falling through to code terrain (R-165.292)

Engine member, branch `t-gate-292` from `t-int-12` @ ce4ad461. Packet: reference/packets/2026-11-19/GATE-292.md (on the lead's branch).
HASH: code and lists final at 131b3366 (this REPORT is the commit after it). Written 10:02 PM ET 11-18.

## The rule as coded (level A, the lead's ruling 8:27 PM ET)

A block **breaches** when the screen draws it with code terrain although the same block at some other height would be drawn by a
painter, in the same stage and paint state. Level A only: every look the gate counts as code terrain is code-procedural (no painted sheet):

- `ground`, `step`, `pillar`, `earth`: terrain.ts terrainLook -> groundArt.ts drawGroundBody/drawGroundCap and columnArt.ts, whose faces
  are groundTiles.ts tiles "painted once per world and scene seed" in code (rng, pebbles: groundTiles.ts:1-12) and soil.ts's baked
  procedural soil (soil.ts:1-7);
- `thin`: platformArt.ts drawThin over thinArt.ts (drawLog, drawStone: code-painted sprites);
- `island-*`: terrain.ts's live-drawn floating islands.

Code: `tools/engine/paintFall.ts` (the rule: `CODE_TERRAIN`, `paintFalls`), `tools/engine/paintStage.ts` (the paint state engine.ts
sets when a stage starts: kit world, ground look, bough joins, paint kit), `tools/engine/paintcheck.ts` (the sweep),
`tools/engine/paintFall.test.ts` (planted), `tools/engine/paintcheck.known.json` (day-one breaches, shrink-only).

How it decides (D19: the gate calls the code the screen calls):
- What a block is drawn as: terrain.ts `footingOf` (it follows the engine's order: protoArt.ts `paintedPlatforms` first, then terrain.ts
  `terrainLook`, the one function renderWorldObjects reads), with every art sheet loaded (the game's picture once its sheets are in).
- "Its style has a painter": the same block (every field but its place, size and laid-piece tag) is probed at heights 1-420 through
  those same two functions. A painter's limit is read from the code, never typed. Printed: the heights that painter draws, and the nearest.
- Not a breach: a style no height paints in that stage (listed with `--unpainted`: missing art, not a size crossing); a stage whose painted
  kit is off (a boss lair, engine.ts paintKit), where no painter runs.
- Proven on the live page: the shooter imports the page's own `terrain.ts` and asks `footingsFor` about each block it shoots. Every block
  shot matched the gate's line (1-1 Normal and Easy, 5-1, 1-7 on its pre-fix tree, the prototype). See "Stills".

Why a tool gate, not drawcheck or a lay verdict: drawcheck plays one layout per stage in a browser (6 min); the decision is already a pure
function both the renderer and footingOf read, so a headless sweep judges every listed seed of every stage, both settings, in minutes. A
lay verdict would refuse seeds today (1-1's logs are on most rolls) and needs the root fix first.

## Planted (tools/engine/paintFall.test.ts, 10 tests, all pass)

| Case | Result | Why |
|---|---|---|
| 1-7's case: a 53 px `landing:true` log on a World 1 bank | RED, drawn `ground`, painter 90-420 | a World 1 log is painted only as a bank |
| 49 px log, World 5 | GREEN | protoArt.ts paintedPlatforms `ownKit() && thinKit(p)` paints a thin log in a world with its own kit |
| 49 px log, World 1 | RED, drawn `thin` | World 1's thin painter is the branch alone: the packet's "49 px GREEN" premise holds in own-kit worlds only |
| moss stone 50 / 51 / 49 (isPaintedRock's edge) | GREEN / RED (painter "50, 90-420") / RED | the rock painter draws exactly 50 |
| a branch 24 / 53 in World 1 | GREEN / RED | |
| no painter at all (ground paint off: a log no height paints) | not a breach, listed unpainted | the size is not the cause |
| a boss lair | not judged | paint kit off |
| look-alikes (D88): own art, hollow log, pushed log, chase section, bounce plant, creaking limb, painted bank | GREEN | |
| World 1 stone 255 wide with its cut piece / 266 wide (an Easy-widened stone) | GREEN / RED | w1CutArt.ts pickCut gives a stone a cut only up to 260 wide |
| 1-8's reverted knots (moss stone 53 on a bough, cut piece) | GREEN for level A | painted cut slab (level B, below) |
| the rule reads the screen: every breach's footing is code terrain | holds | |

Planted on real trees (gate run on VAR-1b's commits): 1-7 on e0afa8878^ (the 53-56 px landing log): **RED 200/200 builds** (VAR-1b saw
16/16 rolls), e.g. seed 2 x12666 155x53 `ground`, the same block the live page reports `ground`. 1-8 on 2a8413391 (knots present):
**0 breaches**: the knots were painted (see B).

## Sweep: every stage, every listed seed, both settings (the rest on layouts 1-16)

t-int-12 (ce4ad461, this branch's base): **5,334 builds of 102 stages, 8,239 breach lines, 429 ids on 21 stages** (20 min in one process;
CI runs it in 3 parts). Builds that breach, by stage:

| Stage | Builds | What falls through (typical) |
|---|---|---|
| 1-1 | 260/322 | 'log' 50-80 px (w1.ts:907/908/1014/1018) -> `ground`, both settings; Easy: stones widened past 260 lose their cut -> `ground` |
| 1-6 | 200/200 | moss_stone 56 / 60 -> `ground` (rock painter: exactly 50; bank from 90) |
| 3-1 3-2 3-3 3-5 3-6 3-7 3-8 3-9 | 8-32 of 32 each | moss_stone 52 -> `pillar`, 80 -> `step`/`ground` |
| 4-2 4-6 4-8 | 10-32 of 32 | 4-6: 'branch' 56 -> `pillar`/`ground` (a branch paints under 50) |
| 5-1 5-2 5-3 5-4 5-5 5-7 5-9 | 32/32 each | moss_stone 53-89 -> `ground`/`pillar` (World 5's kit paints 1-50 and 90+) |
| 6-6 | 32/32 | moss_stone 75 -> `ground` |

All 429 ids are on tools/engine/paintcheck.known.json (shrink-only, the lead's ruling 8:23 PM ET): knowncheck fails an added id,
paintcheck fails a listed id no build of its stage shows any more. Unpainted (no painter at any height): 0. No build failed.

**main (shipped, 6e7b85f8): the same 21 stages plus 1-9 (32/32 builds)**, 5,166 builds; t-int-12 no longer breaches on 1-9.

**Open branches (D88), World 2 stages on each branch's own tree:** all PASS on their own trees, World 2's ten stages each (0 known ids there): t-art-w2a 4f664fde, t-art-w2b d52c5b70,
t-eng-26 fa8a92bf, t-build-24 38f9b929, t-eng-23 9e306581, t-eng-24c 1f5c4008, t-eng-25 21668b61, t-eng-25b 73318234, t-eng-285 03ba54ef,
t-meter-4 8dd661d0. Branches with no src/ change since their base (t-keeper-23-29, t-time-168b, t-design-29, t-meter-3, t-design-26) and
t-var-1 (in t-int-12) were not swept. A miss of mine, caught: the first run of seven of these silently ran on MY tree (the disk was full,
`git worktree add` failed, the script carried on in the current directory); found by the HEAD each run printed, the runner now fails loudly
and every result above carries its branch's own commit.

**The rule on the trees that broke it tonight:** 1-7 on e0afa8878^ (VAR-1b's 53-56 px landing log): FAIL, 200/200 builds, 7 new ids;
1-8 on 2a8413391 (the knots): PASS (painted cut slabs: level B).

## Stills (reference/qa-reports/GATE-292/stills/, each upright + sideways + a 3x crop; the file name carries the LIVE page's footing)

Picked from the gate's list; the file name carries the live page's footing (the page's own terrain.ts, imported from the dev server):
- 1-1 seed 791759 Normal: log x23840 538x50 and x23444 276x55, `ground`.
- 1-1 seed 791759 Easy: log x25535 586x50 and x25139 324x55; stones x15238 266x55 and x25065 265x55, `ground`.
- 5-1 layout 1: x1317 136x60 `pillar` (a small post on two legs), x3246 145x60 `ground`.
- 1-7 on its pre-fix tree, seed 2: x12666 155x53 `ground` (the gate printed this same block).
- Best pair to judge: `1-1-s791759-E-land-x15238-moss_stone-266x55-ground-crop3x.png` and `1-7-s2-PREFIX-...-crop3x.png`: a flat
  bright-green dripping cap on a straight-sided brown box beside Matt's painted ground.
- WRONG-PICK-* (top folder): my first pair, picked by a height filter; painted cut slabs, not breaches. Kept, renamed, so the miss is visible.
- var1b-1-8-knots-*: VAR-1b's knot still (painted cut slabs on a bough: level B).
Pin note: Pokey floats a little above the block in some upright stills: the shooter's pin, not the game.

## The root fix: options with their cost

**Option A, the painter covers the size (the lead's ruling 8:37 PM ET: the direction for World 1, as packet PAINT-292, not on this
branch).** World 1 already has painted thick logs, cut and never laid: `w1-log-plank-a` 197x60 and `w1-log-plank-b` 198x65
(src/assets/w1to4art/w1-cut.json; w1CutArt.ts LAID's comment: "Not yet laid: ... the two log planks"). 1-1's 50-80 px logs fall to code
only because w1CutArt.ts pickCut gives a log a cut under 50 px alone; Easy's stones fall because pickCut's stone limit is 260 wide.
Prototype (scratch worktree only): pickCut takes a 'log' up to 89 px onto the two planks, each part about 3.9x the block's height wide
(logParts by height), and a stone up to 320 wide. Before/after: rootfix/1-1-s791759-N-land-x23840-log-538x50-before-after-A-crop3x.png
and x23444. The live page then reports both logs `painted thin piece`.

**PAINT-292 (ready packet, for the lead to send):** engine member, high. Build option A in w1CutArt.ts (pickCut, LAID, logParts) for
World 1 only. Bar: (1) the art's TOP is the floor: every plank's walkable line at the collider top, no plank floating above or dipping
below Pokey's feet, flush tops across a long block; (2) one plank-pile rhythm along a block, no jumbled overlap (the prototype's x23840
left end overlaps and one part dips into the grass, the right plank floats a few px); (3) stones 261-320 wide get a stone cut with
stoneMiss's stretch limits, no new stretch; (4) draw-only: lockall vs t-int-12 shows only the `cut` field moving on World 1 stages,
`seedlist.ts <id> --check` passes on every World 1 list, castBots unchanged; (5) paintcheck: every 1-1 and 1-6 id leaves
paintcheck.known.json (the gate fails until they are taken off); (6) drawcheck 1-1 both ways (cut pieces are draws); stills upright +
sideways of x23840/x23444 and an Easy wide stone, judged by the lead before Matt (show first). 1-6's 56/60 px stones: check whether
they are wider than 260 or not `onGround` (w1.ts:1577) before choosing; 1-9 is clean on t-int-12.

**Option B, the lay snaps sizes to what the painter draws:** does not work for World 1 logs: under 50 a World 1 log is thinArt's code
log (no thin log painter in World 1), so B means changing the piece (a 90+ bank or a stone) in each section: a design change per section,
every World 1 seed list rebuilt. For Easy's wide stones B means capping Easy's widening at 260 (an Easy rule, the Designer's).

**Named for Content and the lead (no cut art there):** World 5's moss stones 53-89 px and pillars (5-1..5-9), World 3's 52 px pillars and
80 px steps, 4-6's 56 px branches, 6-6's 75 px stones. Each needs painted art at that size or a lay change; the known list holds them.

## Level B candidates (for a later ruling, not gated)

- 1-8's knots (VAR-1b, reverted): a moss stone 50-56 px on a bough got the art director's painted slab cut (`w1-rock-slabs-*`,
  w1.ts:1577 w1Finish -> w1CutArt.ts pickCut). Painted, but the wrong object for a burl on a bough
  (var1b-1-8-knots-x10041-normal-sideways-PAINTED-cut.jpg).
- 1-1 Normal stones 51-79 px: the slab cuts (`w1-rock-slabs-low` etc.) where the lay asked for a "stone"; the lead judged the x743
  slab's three tiles with straight seams as a polish/variety point (WRONG-PICK-... stills, my mis-pick: painted, not code).
- A cut piece drawn far off its own proportions (a log plank split into parts, a stone stretched to its block): a stretch figure per
  piece would be the B measure (cutBox vs the frame's aspect), not built tonight.

## Gate table (t-gate-292 @ 131b3366, the code and lists this report judges)

| Check | Result |
|---|---|
| `npx tsc --noEmit -p .` | PASS |
| unit suite (the CLAUDE.md glob) | 3,838 tests, 0 fail |
| tools/engine/paintFall.test.ts (added to gates.yml's tool line) | 10/10 |
| `npx tsx tools/engine/paintcheck.ts --part i/3` (as CI runs it, `CI=1 FORCE_COLOR=1`) | PASS x3: 212 + 107 + 110 = 429 known ids seen, 0 new, 0 stale; 5 m 12 s, 6 m 22 s, 6 m 10 s (job limit 25) |
| `BASE_PATH=/Sloths-Adventure-/ npx vite build` + chunkcheck | PASS, PASS |
| artcheck | PASS |
| drawcheck | PASS (689 s) |
| knowncheck | PASS (paintcheck.known.json: new list, 429) |
| generalitycheck | PASS (26 known) |
| roadmapcheck | PASS (after carrying the lead's R-165.292 row with the known list in its Source; the lead will see that row on both branches at merge) |
| timecheck (origin/t-time-168b's tool, `--range ce4ad461..HEAD`) | PASS on this branch's commits; the default range from main also flags reference/qa-reports/VAR-1/REPORT.md:4 ("3:50 PM ET", 4:57 after its commit 7a8bc47d), inherited from t-int-12 (VAR-1b's), not this branch |
| lockall vs main (6e7b85f8, 16 layouts) | 99/102 unchanged; 1-6, 1-7, 1-9 moved: t-int-12's own work (VAR-1, 1-9), not this branch: `git diff ce4ad461 HEAD -- src/` is empty |
| seedlist --check, tierBots, kbdcheck, clipcheck, buildcheck | not run: this branch changes nothing under src/, no list, no screen (law 5, member scope); they ran on t-int-12 (INT-12) |

## Lessons applied
D19 (the gate calls the screen's code; proven on the live page), D62 (breaches and stills labelled by the seed the game BUILT), D88
(look-alikes planted; every open branch swept), D57/D87 (ReadNotifications at every push; long runs in the background), D30 (times from
`date`), D59 (no background job left running at stop: none: every sweep, shot and check finished before this report), law 22 (no rule loosened: day-one breaches go on a shrink-only list,
the lead's ruling 8:23 PM ET), law 3 (the "49 px log GREEN" and "1-8 knots are code" premises checked in code before planting).

My miss tonight, owned: the first still pair was picked by a height filter (51-89 px), not from the gate's list; on Normal those 1-1
stones are painted cut slabs the gate does not flag, and I called them code to the lead for ~5 minutes. Root: a still tool that selects
by a guess of what breaches instead of by the gate's output. Countermeasure used: the shooter now takes the gate's breach x positions (or
asks the page's own terrain module for code-drawn blocks) and writes the page's footing into each file name.

## Learned
- A size gate must read the drawing decision, not the style name: 1-1's 53 px stone and 1-7's 53 px log both looked like "a block grown
  past 50", yet one is Matt's painted cut slab (w1Finish gives every moss stone up to 260 wide a cut) and the other a code box. Only the
  engine's own footing (paintedPlatforms -> terrainLook) tells them apart, so the gate reads that and nothing else.
- Easy is its own picture: 1-1's stones are painted on Normal and code on Easy where the Easy build widens them past 260. Judge both
  settings (the packet said so; the trial would have missed it on Normal alone).
- Art that would fix a fall-through may already be cut and unused: grep the cut sheets (w1-cut.json) before asking for new art.
- A headless gate that needs "art loaded" can stub Image with a synchronous decode; an async decode left every sheet unloaded in a
  synchronous sweep and turned every bank into a false breach (my first trial).
- The probe cache key must drop per-piece ids (`tag`): with it, every block probed 420 heights again and a stage took minutes.

## Method update
- reference/methods/gates.md: add paintcheck (what it catches, how to read a breach line: stage, setting, BUILT seed, x, style, size, the
  code look, the heights its painter draws; `--unpainted`, `--known`, `--part i/n`; the known list is shrink-only both ways).
- reference/methods/render-fix.md (proposal): a still for a look question is picked from the gate's own list or from the page's own
  terrain.ts footingsFor (the shooter imports it from the dev server), never by a size filter; the file name carries the page's footing.
  Proof: my x743 mis-pick (a painted cut called code for 5 minutes); the corrected stills all match the gate line for line.
- CLAUDE.md check list (the lead's file): add `npx tsx tools/engine/paintcheck.ts` (minutes; CI runs it in 3 parts) and
  tools/engine/paintFall.test.ts to the tool-test line.
