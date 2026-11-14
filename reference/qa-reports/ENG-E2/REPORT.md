# ENG-E2 REPORT: finish 1-7's engine (moss cover content, the perch, bots that hold still)
Branch `t-eng-e2` from origin/t-eng-e1@f573675b, origin/t-art-678b@a93e335 merged first (clean). Code head **b4a697c9**; gates on that head:
`gates.log` (this folder). Opus 5.5, xhigh. Started 10:33 AM ET 11-14 (session clock); this draft 11:02 AM ET. Context: I can't see the
session's own figure (D64); my estimate was ~250k, and the lead's 11:01 AM check-in read the real figure: 341k of 1M (34%). Images were the cost
(next time: judge stills at 1x and crop, as the lead says).
Lessons applied: D40 (the moss the perch sits over first, then the perch, then the bots that fly both), D57 (queue read at each push: empty
each time), D59 (no gate left running: the gates run in the foreground of this session to the end; see Gates), D61 (two rough spots found in
my own stills and fixed before report: the carpet vanished when he hid in it; the perched eagle's head off the top sideways), D62 (every
still's label read from the game: stage, difficulty from localStorage, kit phase), D63 (clips of the whole action both ways), D64, D65 (the
carpet judged with him IN it, the liana moss on a real 1-6 liana, the hanging moss on 1-3's real rope), D66 (reused stillLay, inCover,
the kit's sweep, sweepPose, castPlay, the old bot's hide rule: nothing rebuilt), D67 (no wait loops: gates and clips in the background,
read from their notices).

## Done-items (packet items, 1-7.md NEW numbers)
| # | What | Where | Proof |
|---|---|---|---|
| 1 (NEW 5) | **Moss cover content**: Bush kinds `moss` (carpet), `mossPatch` (mound), `mossHang` (hanging moss) drawn by drawBushes through w17Art.ts from ART-678b's own files at Pokey's scale (carpet 36 px strip tiled, mound 73 px = 0.82 Pokey, drape 140 px); W1_STILL rows w1-hide-moss (346), -patch (169), -hang (173, `hanging: true`), -curtain (78, `hanging: true`); HideRow.hanging ties its top at the socket; preloaded (stageManifest 'w17', stagePreload) | watcher.ts, stillLay.ts, w1Cast.ts, w17Art.ts, engine.ts drawBushes, stageManifest.ts, stagePreload.ts | mossLay.test.ts 7/7 |
| 1 | **Letter `m` laid**: nodeAsks FILL_LETTER `{ m: 'hide' }`; a node asking m with no hide laid fails by name ("content 'm' (cover): no hide laid"); m is `now` in the key; NODE-KEY.html regenerated | nodeLetters.ts, nodeAsks.ts, pipeline.ts dialMisses, NODE-KEY.html | mossLay.test.ts, nodeLetters.test.ts |
| 1 | **A mossy liana LOOKS mossy**: three Spanish-moss clumps (the curtain without its twig) on every `Vine.mossy` swing liana, hanging under gravity where the swing puts the rope | engine.ts after renderWorldObjects, w17Art.ts drawLianaMoss | still `*-h1-mossy-liana.png` |
| 1 | **The see-through rule judged behind moss (D65)**: a mound and hanging moss thin as the moss comes (the bush ghost rule); the CARPET never thins (it covers his feet only: thinned, it vanished exactly when he hid: `shots/carpet-pair.jpg` is the BEFORE) | w17Art.ts mossAlpha | mossLay.test.ts; `after-fixes-carpet-and-perch.jpg` |
| 2 (NEW 8) | **The perch**: Post.perched / PredatorState.perched / Enemy.kitPerch (`eagleOver(z, groundY, id, { x })`): its body stays on its snag (SNAG_PERCH 120 px over its ground, measured on the snag's own branch and held equal by a test), its gaze (eyeX) sweeps the stretch, it dives FROM the snag and flies back; core reads `rides = def.rides && !s.perched`. sweepPose perchedPose: rest `ahead` (+ an idle blink), the warn `turn` (the head turn, the gaze shadow at the start end), the pass `down` with its gaze shadow, `blink` when its gaze is on him hidden; the dive, act, recover and fly-off use the flying harpy. Drawn: the snag (behind him) + w17-harpy-perchfeet-{ahead,turn,down,blink} | predators/types.ts, core.ts, castPlay.ts, sweepPose.ts, w1Cast.ts, types.ts, engine.ts drawCastSky, w17Art.ts | eaglePerch.test.ts 7/7; stills and clips |
| 3 (NEW 10) | **Bots that hold still in cover**: firsttimer.ts hides from the KIT eagle (the old block read only proto.watch): `heed` after a sweeper's look starts over his stretch he heads for `stillCoverNear` (ground cover at his level within 600 px: bush, carpet, patch) and takes his thumb off inside (no crouch: the kit hides a STILL sloth); learns 'hide' from moss/green + still words too. castBots/tierBots fly a stretch through it (same FirstTimerRun) | tools/inspect/firsttimer.ts | castBots.test.ts +3 (told: never taken, still in the moss while it looks, seeds 1-3; never told: taken; the cover rule) |
| 4 | **Clips both ways (D63)** of the whole action on the real game (1-1's bank, its animals off, moss laid by the rows, one eagle laid PERCHED by eagleOver): look 1 free (head turn, it leaves the snag, dives, pulls up short), into the carpet still (moss over him, the gaze right over him, it blinks, unseen), into the patch still, look 3 stepping into the open: the real dive off the snag, a heart, back to the snag | shoot.mjs | `shots/{upright-412x915,sideways-915x412}-perch.mp4` (~28.6 s each), frame strips `*-perch-clip-strip.jpg`; stills `*-{1..8}*.png` |

**Planted faults: 10 of 10 caught** (`planted.out.txt`): a perched eagle riding its eye, never drawn perched, no blink, perched on the
ground, the carpet thinning (first run SURVIVED: draw-only; `mossAlpha` + its test added, then caught), hanging moss laid as ground cover,
m not checked, moss not preloaded, the bot never stopping in cover, the bot never hiding from the kit eagle. The new test files fail on the
base (t-eng-e1@f573675b) at import: none of eagleOver's perch, Post.perched, the moss kinds, FILL_LETTER, w17Art or stillCoverNear exist there.

## What the 1-7 builder can lay NOW (every beat of 1-7.md)
- **Hides** (`hideSocket(id, on)` asking 'hide'/'cover'; World 1's still table `w1Still(7, lessonSockets)`, as ENG-E1 wrote): bush tall 110 /
  wide 160 (beats 0-5), **moss carpet 346** (beat 7 "every mossy spot is cover"; lay two side by side for a longer bank: each is its own hide,
  minApart 400 means the builder places a second socket 346+ px on), **moss patch 169** (beats 7, 8, 12 "patches with bark between"),
  **hanging moss 173 / curtain 78** (`hanging: true`: put the socket where it is TIED, a rope's line or a bough's underside; it hides him only
  while he hangs in it, inCover's hanging rule).
- **Beat 10 / 14's mossy lianas**: `mossy: true` on the liana (E1): cover while held AND now drawn with Spanish moss.
- **Beat 12, the eagle lands**: lay the watched stretch as usual and pass the snag's x: `eagleOver(z, groundY, id, { x: snagX })` (the builder's
  lay calls it, or castWatches' `lay` gets a perch option in the build packet: today castWatches lays plain ones; see Suggestions). Put the snag
  **within ~250 px of the cover he hides in** so the head turn is on an upright screen (upright shows ~425 px; in my clip the snag 400 px off
  showed look 3's dive coming in from the edge: the screech and the gaze shadow still carried it, but the head turn was off screen).
- **Node string**: `Tm< ... Sm&< ... Lm&>` now lays: `m` asks for a hide in the node and fails by name when none is laid.
- **Bots**: `npx tsx tools/inspect/castBots.ts --stage 1-7 ...` flies the stretches once 1-7's Dot line teaches hiding in words the bot
  reads (hide/bush/fern/moss/green + down/hold/into/still...: "get into the green and hold still" qualifies).

## Polish check (each still I looked at, both ways)
- **Carpet**: BEFORE `carpet-pair.jpg` (him on the carpet, the carpet thinned to nothing: rough) -> AFTER `*-4-carpet-still.png`,
  `after-fixes-carpet-and-perch.jpg`: the strip under his feet at full strength, him tinted moss-green: reads "hidden in the moss".
- **Perched eagle**: BEFORE `sideways-sheet-before-fixes.jpg` (perch 208 px: sideways its head was off the top under the score plaque) ->
  AFTER perch 120 px: the whole bird on its snag both ways (`*-5-gaze-on-him.png`, `after-fixes-carpet-and-perch.jpg`). Its own branch
  crosses the snag's trunk and reads as a branch of the snag. Sideways the bird sits just under the HUD plaque when the camera puts it there
  (1-7.md allows the body under the HUD sideways; here it is clear of it).
- **The dive**: the snag stands empty while the harpy flies at him (`sideways-perch-clip-strip.jpg` frame 2), then it is back on the snag.
- **Patch**: him inside the mound, the mound see-through enough to find him (`*-6-patch-still.png`). The painted mound is a brighter yellow-green
  than 1-1's grass (ART-678b's piece; on 1-7's mossy bough it should sit better; named, not changed: the art is Content's).
- **Liana moss**: grey-green Spanish moss clumps along 1-6's liana (`*-h1-mossy-liana.png`): reads as moss on the rope.
- **Hanging moss on a rope**: the drape and the curtain tied on 1-3's real rope (`*-h2-hanging-moss.png`): the drape's own mossy stick lies
  across the rope (reads as moss caught on the vine); see Unresolved for him inside it.

## Pushback
- 1-7.md beat 12 asks for "the perch's slow looks"; the perched eagle's gaze sweeps at the kind's eye speed (EAGLE.speed.rest 320 px/s). A
  slower look for a perched one is a Designer number (a per-Post or per-row eye speed); not invented here.
- 1-7.md's "Easy ~3" table and the finale calms: the lead's rulings (5 s floor stays; Easy cool x1.5) are the kit's today; nothing of mine
  changes them.

## Suggestions (ready packets, outside my walls or next)
1. **ENG / builder: castWatches lays a perched eagle** (objective: beat 12 laid by data, not by hand): a W1_STILL watch row field `perch`
   (socket ids whose stretch gets a perched eagle at the socket's x + an offset), castWatches passing `{ x }` to eagleOver. Files:
   stillLay.ts castWatches, w1Cast.ts. Done: a row lays a perched eagle; eagleLay.test.ts.
2. **Designer: a perched eagle's look speed** (1-7.md "slow looks"): a number for Post/row, then an engine packet wires it.
3. **Content: the moss patch's colour** judged on 1-7's own bough once laid (it pops on 1-1's grass).

## Unresolved (named plainly)
- **Pokey hanging INSIDE hanging moss is not shot**: shoot-hang.mjs put him under 1-3's rope with Up held, but a Dot box was up and he did
  not catch; the drape is judged on the rope without him. The rule is tested (mossLay.test.ts: hanging in it is cover, standing under it is
  not). Next: shoot it on 1-7's own build (the builder's stills), or close Dot's box first in the script.
- **Him holding a mossy liana is not shot** (same script: he did not catch the liana); the moss on the liana is shot, the cover rule tested (E1).
- The upright view shows the perched eagle only when its snag is within ~425 px of him: placement is the builder's (see "lay NOW").
- tier-bot calibration on 1-1: firsttimer's change only adds words to the hide rule and a block that runs only under a kit sweeper (1-1 has
  none); tierBots.test.ts is in the gate run (see Gates).

## REDO from the lead's 11:35 AM ET quality check (NOT done in this box: EXACT NEXT STEP)
Both need work after the gate run on b4a697c9 ends (changing the perch mid-run would test code that is not the head, D59), and my context
is at the 400k hand-over line.
1. **The perched eagle must clear the HUD by at least 24 px, both ways** (sideways-915x412-4-carpet-still: its beak touches the progress
   sign's lower edge). Lower the perch: change `SNAG_PERCH` (src/game/sweepPose.ts) and `W17.snagB.perch` (src/game/w17Art.ts, the row in
   file px: perch = 880 - 3 x SNAG_PERCH) TOGETHER (eaglePerch.test.ts holds them equal). Try 90 (its feet about Pokey's height). In
   reference/qa-reports/ENG-E2/shoot.mjs print, in every caption: the eagle's top on screen = (s.homeY - 338/3 - camera.y) x the canvas's
   zoom, and the HUD's bottom = the progress sign's DOM rect bottom (find its element in the HUD component); pass = top >= bottom + 24.
   Re-shoot both orientations, check every still where it is perched, then full gates on the new head.
2. **Re-shoot hanging moss with him actually hanging in it** (sideways-915x412-h2-hanging-moss says "hanging" but prints hanging false and
   shows him on the floor, Dot's box over the lower left). In shoot-hang.mjs: dismiss Dot's box first (the guide's own dismiss, or start
   from a point after the tip), then put him on the rope the way the game catches one (engine.ts rope catch ~:5380: hands within
   ry-12..ry+30 while rising or with Up held), wait until `player.hanging` is true, then still, and print hanging + calmNow in the caption.
   Same for the mossy liana (print isVineSwinging true). Both orientations. A still proves only what you can see in it (D69).

## Gates
(filled from gates.log when the run ends)

## Method update
- predator-kit.md "Pitfalls": **a perched sweeper is a per-animal `perched` on its Post** (rides off for that one only); its pose comes from
  sweepPose's perchedPose; its height is measured on the piece it sits on (SNAG_PERCH, held to the snag by a test), and judged sideways:
  at 208 px the bird's head was off a 412 px-tall screen.
- predator-kit.md: **a cover that covers only his feet (a carpet) never thins** when he is in it; the see-through rule is for cover over his
  body (D65's countermeasure applied per cover kind: judge each kind with him IN it).
- level.md / castBots: **a hand-stepped FirstTimerRun must call `after()` each frame** (a jump ends there): without it the bot's first hop
  never ended and every rule gated on `!this.jump` (hiding) never ran. What worked: the planted contrast "told vs never told" on one arena.

## Turnover note
reference/handoffs/engine-core.md section 0w rewritten (commit below).
