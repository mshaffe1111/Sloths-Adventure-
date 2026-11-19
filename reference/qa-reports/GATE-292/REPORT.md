# GATE-292: painted style falling through to code terrain (R-165.292)

Engine member, branch `t-gate-292` from `t-int-12` @ ce4ad461. Packet: reference/packets/2026-11-19/GATE-292.md (on the lead's branch).
HASH: __HASH__ (filled at the last push). Written __TIME__.

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

## Planted (tools/engine/paintFall.test.ts, __PLANTED__)

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

__SWEEP__

## Stills (reference/qa-reports/GATE-292/stills/, each upright + sideways + a 3x crop; the file name carries the LIVE page's footing)

__STILLS__

## The root fix: options with their cost

__ROOT__

## Level B candidates (for a later ruling, not gated)

- 1-8's knots (VAR-1b, reverted): a moss stone 50-56 px on a bough got the art director's painted slab cut (`w1-rock-slabs-*`,
  w1.ts:1577 w1Finish -> w1CutArt.ts pickCut). Painted, but the wrong object for a burl on a bough
  (var1b-1-8-knots-x10041-normal-sideways-PAINTED-cut.jpg).
- 1-1 Normal stones 51-79 px: the slab cuts (`w1-rock-slabs-low` etc.) where the lay asked for a "stone"; the lead judged the x743
  slab's three tiles with straight seams as a polish/variety point (WRONG-PICK-... stills, my mis-pick: painted, not code).
- A cut piece drawn far off its own proportions (a log plank split into parts, a stone stretched to its block): a stretch figure per
  piece would be the B measure (cutBox vs the frame's aspect), not built tonight.

## Gate table (t-gate-292 @ __HASH__)

__GATES__

## Lessons applied
D19 (the gate calls the screen's code; proven on the live page), D62 (breaches and stills labelled by the seed the game BUILT), D88
(look-alikes planted; every open branch swept), D57/D87 (ReadNotifications at every push; long runs in the background), D30 (times from
`date`), D59 (no background job left running at stop: __D59__), law 22 (no rule loosened: day-one breaches go on a shrink-only list,
the lead's ruling 8:23 PM ET), law 3 (the "49 px log GREEN" and "1-8 knots are code" premises checked in code before planting).

My miss tonight, owned: the first still pair was picked by a height filter (51-89 px), not from the gate's list; on Normal those 1-1
stones are painted cut slabs the gate does not flag, and I called them code to the lead for ~5 minutes. Root: a still tool that selects
by a guess of what breaches instead of by the gate's output. Countermeasure used: the shooter now takes the gate's breach x positions (or
asks the page's own terrain module for code-drawn blocks) and writes the page's footing into each file name.

## Learned
__LEARNED__

## Method update
__METHOD__
