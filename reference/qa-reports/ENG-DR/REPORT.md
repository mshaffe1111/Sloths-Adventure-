# ENG-DR report: the seed list runs each row's own finish; any inventory piece placed as dressing

Branch `t-eng-dr` from `origin/t-build-18@e9dc28bf` (BUILD-18's head at start, `git ls-remote`), merged with BUILD-18's
`d6f7df7fd` at 9:05 PM (its 1-8 relisted and its DRESS_18 rewritten to this piece's shape; its w1Arc18.ts taken WHOLE, as it asked).
My diff against BUILD-18's head: 11 engine and tool files, no world data. Packet:
`reference/packets/2026-11-14/ENG-DR.md` (origin/ccr-ea739a2f-dfcee4). Opus 5.5 xhigh.

## EXACT NEXT STEP
IN PROGRESS (9:14 PM ET): the gates are running on the merged head 80064d3e1; this section is written when they end.

## 1. Done-items, with evidence

### (1) FIRST: the seed list runs each row's OWN finish, as Play builds it; a finish that throws is refused by name (c2de36a5)
The hole (tools/engine/seedlist.ts:35 on the base): the help-room rule and the squirrels judged with World 1's finish alone (`w1Finish`,
a `squirrels` row) and the quiet line ran the row's finish on Normal only, so a seed whose own finish (1-4's finish14, 1-7's finish17,
1-8's finish18) throws on Easy could be listed. Play runs that finish with no catch (stageGenerator.ts:2921 `playFinish(listed,
buildPlayStage(...))`), so the stage would not load on a phone.
- `tools/engine/listRules.ts`:
  - `listJudge(cfg, finish)` is the search's ONE list judge (BuildRequest.also). On each setting the row's whole finish runs on a copy; a throw is a
    line with no slot (the search rolls again, R-165.120), named `the finish throws (<setting>): <its words>`; then the quiet line on
    Normal, on the same finished copy (one finish a setting).
  - `asPlayedBreaches(cfg, kit, seeds, finish, max, inv)` is `--check`'s own lines. Each listed seed is built AS PLAY BUILDS IT (seedList.ts
    `buildPlayStage`, then listed.ts `playFinish`: the two calls generateStage makes, D19) and finished once. A throw is refused by name;
    on the rest come the quiet line, room for help on each setting, and the dressing rows (item 2).
  - `helpRoomBreaches` now takes the row's finish WITH the setting: ENG-CL's "helpRoomBreaches judges before finish14/finish17" hole is closed.
- `tools/engine/seedlist.ts`: `also = listJudge(...)`, `--check` calls `asPlayedBreaches`, and the write path's help-room rule uses the row's finish. `dresses`
  (w1Finish alone) is gone: a squirrels row's too-few-spots throw is a finish throw now, refused by the search.
- `tools/engine/yield.ts --list`: the same `listJudge` (its own w1Finish-only squirrels block is gone).
- Planted (tools/engine/seedlist.test.ts, test 7) on a listed 1-1 seed as Play builds it: a finish that throws on Easy, then one on Normal.
  Each is refused by name and setting, by `asPlayedBreaches` and by `listJudge` (no slot, never a throw of its own). The real finish adds
  nothing. Each finish works on a copy. Neither tool runs `w1Finish` alone. Test 5 (POLISH-9b) now lays 1-1 seed 33825 with `listJudge`:
  the roll is still 34161101 (the judge change moved nothing).
- RED on the base, GREEN on the fix, on the real tool, 1-7 with a throw planted in finish17's Easy on listed seed 4 (scratch worktrees):
  base `seedlist 1-7 --check` -> `PASS (100 seeds...)` (292 s): the hole. Fix -> `FAIL ... 1-7 seed 4: the finish throws (easy):
  PLANTED (ENG-DR): the Easy finish throws on this roll` (and the search re-rolled that seed: "its replay differs from its search") (219 s).
- Every listed stage re-checked (no seed fails): on c2de36a5 (before the merge): 1-1 162 PASS (244 s), 1-2 100 PASS (84 s), 1-3 100 PASS (38 s), 1-4 100 PASS (221 s), 1-5 150 PASS (142 s), 1-7 100 PASS (211 s). On the merged head (1-8 now listed): 1-8 100 PASS (41 s); the rest running at 9:14 PM ET.
- Probe before the fix (every listed seed through buildPlayStage + playFinish, both settings): 0 throw of 1-1 162, 1-2 100, 1-3 100,
  1-4 100, 1-5 150, 1-7 100.

### (2) Any inventory piece placed as dressing by a stage's data (74f1acb7, 7f94a73d)
Packet: "one dressing row type by inventory id (hung by top / standing on ground / behind the play layer), scaled from the inventory's
own scale field against Pokey's 89.1 px ... any stage, any world".
- `src/game/art/invDress.ts`:
  - `InvDress` = { inv: the catalog id exactly; x: its middle; y: its top when hung, its foot when standing; hang; layer: 'behind' }. There is no size field.
  - `invDressSize` = pokey_scale x the inventory's pokey_units (89.1 = heroSprite.ts HERO_UNITS 66 x HERO_SPRITE_SCALE 1.35, D41) tall,
    its width by its picture's shape. A catalog frame 'name (x,y wxh)' draws its rect, so atlas pieces work too.
  - `invDressBreaches(rows, inv, world)` is the gate, each refusal by name: an id the world's inventory lacks, a made thing in World 1,
    a piece waiting on a fix, `scale_ok` false (the scale gate, R-165.107), no fixed size (pokey_scale null), a frame with no rect, a
    picture the build does not ship, a layer not offered, a row with no place.
  - `readyInvDress` and `drawInvDress`: one drawSheet per piece in view, one Map get a row, no allocation a frame.
- `src/game/art/invDressArt.ts`: the build folders a piece may come from (`new URL` patterns: the bundler ships that folder, Node gets a
  file URL, so tests run the game's own code). Today `src/assets/w1-18/`, which already ships (rollingPiece.ts names it), so 0 new asset bytes.
- `src/game/art/inventory.ts`: `Inventory.pokeyUnits` (the file's pokey_units; additive).
- `src/game/stageReady.ts`: the rows are resolved and their pictures asked for before the first frame, under the title card.
  `src/game/engine.ts`: ONE call, `drawInvDress(..., 'behind')`, just before renderWorldObjects. **engine.ts's render path is a shared drawing file the
  lead owns (PERFORMANCE-RULES §8.3): this line is for the lead's merge check, with the drawcheck numbers below.**
- `src/game/protoStage.ts`: `ProtoExtras.invDress`.
- 1-8's data (BUILD-18's w1Arc18.ts, the two DRESS_18 lines and the push only): ids `hf18/hf18-palm-crown` and
  `hf18/hf18-cannon-trunk` (the rows said `hf18-palm-crown`, which the gate refuses by name), no `h`, the engine's type re-exported.
  BUILD-18 was told the data names at 8:5x PM and again when the piece landed.
- Planted (src/game/art/invDress.test.ts):
  - (1) a row with an id the inventory lacks fails by name, and an out-of-scale row fails the scale gate, word for word. So does each other refusal; a made thing passes in World 2.
  - (2) the size is the catalog's for 1-8's two pieces, and their pictures ship.
  - (3) the real World 1 file's out-of-scale piece is refused.
  - (4) every listed stage as Play builds it (generateStage, layouts 1-2, both settings) passes the gate, and 1-8 lays both pieces: 12 rows judged. The 3 1-8 builds that throw are printed by name, not judged (see Unresolved).
  - (5) the only file that writes rows is 1-8's world file: a new writer must join the sweep.
- `seedlist <stage> --check` judges every listed seed's rows too (asPlayedBreaches, given its world's inventory).

## 2. Polish check
Real game, dev build, `tools/engine/runs/stills-at-setting.mjs` (2x, upright 412x915 and sideways 915x412). 1-8 layout 1 is the listed seed 3. Stills are in `reference/qa-reports/ENG-DR/stills/`.

| Still | What I judged | Verdict |
|---|---|---|
| m-1-8-L1-normal-x3945-upright / -sideways | the palm at the first nut drop | It stands behind the branch, its foot under the branch top. Its fronds draw BEHIND the raised ledge, as the play layer should cover it. The nut cluster sits overhead where the nut drops in. Sideways the crown is half under the HUD band, but the trunk and cluster read. Pass. |
| m-1-8-L1-normal-x5062-upright / -sideways | the cannonball trunk at the first fruit drop | It rises out of the ground behind the branch (its foot hidden in the earth), fruit on stalks over the drop, Pokey and the falling fruit in front. Pass. |
| m-1-8-L1-easy-x3915-upright / -sideways | the palm, Easy | As Normal. ROUGH SPOT, not this piece: in the upright still a rolling nut is drawn inside the solid earth about 270 px under the branch (x ~4090), as if it fell through ground that reads solid. Sent to BUILD-18 at 9:08 PM. |
| m-1-8-L1-easy-x5032-upright / -sideways | the trunk, Easy | Pass. (Dot's box is the stills tool forcing every hint shown.) |
| before-hung-crown-e9dc28bf-easy-x3747-sideways | the FIRST shape of 1-8's data (crown hung by its top, at e9dc28bf) | FAILED the whole-picture check (render-fix.md, "what holds it up?"): the crown picture's own trunk stub hung down from the top of the screen and ended in mid-air (D16). I sent it to BUILD-18 at 8:59 PM. BUILD-18 had already made the palm stand (d6f7df7fd); the stills above are that fix. |

What the engine piece itself guarantees on every stage:
- nothing draws in front of where he acts ('behind' is the only layer offered, D10);
- the size is the catalog's, never a stage's guess (the crown is 460 px, the trunk 900 px: 5.16 and 10.1 of Pokey);
- a piece the catalog has out of scale never draws.

## 3. Pushback
- The packet says the seed list "never runs a row's own finish (seedlist.ts:35 runs w1Finish only)". Half right: since ENG-CL, the
  quiet line already ran the row's finish, but on Normal only. Easy's finish was never run, and the help-room rule and the squirrels
  used w1Finish alone. The fix covers all three.
- "packed into an atlas or baked": neither, on purpose. Each piece is its own painted picture (1-8's are 1017x920 and 426x1024). The
  frame pays one drawSheet per piece in view (sheetBake.ts already bakes a copy when a picture is drawn shrunk past 1.5x, only under
  the title card). An atlas would mean a packer job for every new piece; the gain is a texture bind when two pieces are in view at once.
  If drawcheck ever shows it matters, the folder table is where an atlas would plug in.
- "drawcheck on 1-8": drawcheck plays layout 1 on the default setting. At my start base (e9dc28bf) 1-8's Normal threw at every layout,
  so drawcheck's own 1-8 scenario was "could not be played" BEFORE my change. On BUILD-18's relisted head it plays (numbers below).

## 4. Suggestions (ready packets)
**S1. Play's off-list road refuses a roll whose finish throws (Engine, xhigh; the Play-side twin of item 1).**
Objective: an off-list play never hands Play a roll whose row's finish throws. "Off-list" means a stage with no list yet (1-8 today), or a list that failed to load with no stand-in (only 1-1 has `standIn`).
- Today: stageGenerator.ts:2921 runs `playFinish(listed, buildPlayStage(...))` with no catch. buildPlayStage falls back to
  pipeline.ts `provenGen2Stage`, whose walk calls a seed clean by `gen2.errors` alone, not by the finish. 1-8 throws on Normal at every
  layout 1-8, and on Easy at layout 2.
- Files: src/game/gen2/seedList.ts buildPlayStage (pass the row's finish judge as `also` to provenGen2Stage, so the walk moves past such a seed), src/game/stageGenerator.ts:2921, src/game/gen2/listed.ts.
- Done-items:
  - planted: a row whose finish throws on its first walk seed plays the next, never throws;
  - every listed stage's lock unchanged when its list is loaded;
  - 1-8 off-list on Normal either plays a clean seed or names the walk's failure.
- Also: a `standIn` per listed row, judged by `--check` as played.

**S2. A small dressing index instead of the whole world file at runtime (Content + Engine, high).**
Objective: a stage with dressing rows fetches only what it draws. Today it fetches the world's whole inventory JSON (w1.json 202 KB) once a world, under the title card.
- Files: tools/art/catalog_master.py --emit (Content), writing inventory/w<N>.dress.json with only id, file, frame, w, h, pokey_scale, scale_ok, status, made_thing for level rows; src/game/art/invDress.ts reads it; invDress.test.ts proves it equals the full file's rows.
- Done-items: the same gate; the JSON a stage loads under 20 KB.

**S3. drawcheck can play a stage on Easy (Critic, tools/perf).**
Objective: a stage is still measured when its Normal can't build. drawcheck plays layout 1 on the default setting, so 1-8 has been "could not be played" since its Normal broke, and its draw cost was unmeasured.
- Files: tools/perf/run.mjs (a scenario's `diff`, set as localStorage `sloth_difficulty` before load, as this report's scratch run did), tools/perf/limits.json.
- Done-items: 1-8 scenarios on both settings; a scenario that can't play still fails the gate.

## 5. Unresolved (named plainly)
- **Pre-existing on BUILD-18's head (d6f7df7fd), not from this branch, each run on that head to prove it:**
  - 7 unit reds in src/game/chasePiece.test.ts (1) and chaseRespawn.test.ts + chaseRespawnReal.test.ts (6). They test the hand-built
    1-8 chase (proto.chase), which BUILD-18 deleted ("Cannot read properties of undefined (reading 'start')"). BUILD-18's to replace with
    the laid chase's tests. Told BUILD-18 and the lead.
  - drawcheck 1-8 sideways: gradients 6.88 (limit 2) and drawImageScreens 10.04 (limit 7.5) at x 24036, ground and scenery paint
    (groundPaint.ts depthBand and shadeSoil, scenery.ts drawFitted). Not dressing.
- The rolling nut drawn inside solid earth (Easy L1 x3915 still): rolling piece / 1-8 data; sent to BUILD-18.
- The listed stage sweep in invDress.test.ts builds layouts 1-2 of each listed stage; `seedlist --check` covers every listed seed. A hand-built (unlisted)
  stage that lays rows must join the sweep: test 5 fails the moment another file writes proto.invDress.
- Pieces come from a world's level-art file (inventory/w<N>.json) only, not the cast file (characters, enemies, pickups, UI, backdrops:
  1.8 MB). Placing a cast piece as dressing is refused by name today ("in no row of World N's inventory").

## 6. Method used, Lessons applied, Method update
**Method used:**
- reference/methods/seed-list.md (step 7: `seedlist --check` on every listed stage, the full suite, the lock);
- reference/methods/render-fix.md (stills both ways; the whole-picture check, "what holds it up?", caught the hung crown's stub; a test that fails on the base: the planted 1-7 throw);
- reference/methods/level.md rules 21-22 (the piece is global: any stage, any world, proven on every listed stage);
- PERFORMANCE-RULES §1, §2 and §8.

**Lessons applied:**
- D19: the gate calls the code the screen calls (`asPlayedBreaches` builds with buildPlayStage + playFinish, as stageGenerator.ts:2921).
- D16 and render-fix "what holds it up": the crown's stub.
- D41: Pokey's height read from heroSprite.ts and tied to the inventory by a test.
- D43: no stage id in the engine piece; the folder table is the only per-art line.
- D10: 'behind' only.
- D6: no canvas of my own; sheetBake and atlasLoader handle loss.
- D11: resolution and loading only under the title card.
- D29: every listed stage's --check after a change to the list rules.
- D36: gates on frozen worktrees, `git status -sb` before each commit, `git ls-remote` after each push.
- D30: times from `date`.
- D55: context % in every message.
- D57: read the queue at every push. I missed it at my first two pushes and caught BUILD-18's 9:03 PM message 2 minutes late, before any conflicting work.
- D40: merged BUILD-18's head the moment it said its data had moved, instead of patching my copy of its file.

**Method update (proposed; the lead decides):**
1. seed-list.md, "Traps": every list rule judges the roll as Play finishes it, through listRules.ts. That means `listJudge` for the search and
   `asPlayedBreaches` for `--check`, never `w1Finish` alone. A finish that throws is a stage that won't load on a phone. Proof: the
   planted 1-7 run (base PASS, fix FAIL by name).
2. level.md, a building rule (rule 23, under 30): **"Dressing by inventory id, never by size."** A stage's data names the catalog id
   exactly and where the piece stands or hangs. Its size is the catalog's pokey_scale. A piece that reads wrong at its size is a
   catalog fix (Content), not a data number. A piece that hangs must have nothing in its picture that reads as standing (a trunk stub).
   Check: src/game/art/invDress.test.ts; render-fix's whole-picture check. Evidence: 1-8's first rows asked for a 300 px crown the
   catalog had at 460 px, and hung a stub in mid-air; both were caught by this piece's gate and stills before reaching a link.
3. gates.md: invDress.test.ts runs in the unit glob (src/game/art/*.test.ts), so no new CI line is needed. A new art folder is one line
   in src/game/art/invDressArt.ts.

## 7. Learned
- Build the gate from the exact calls Play makes and it finds what the search-side rules miss. `asPlayedBreaches` is buildPlayStage +
  playFinish; its sweep found 1-8's throws (Normal at every layout on e9dc28bf) in its first run.
- A list rule that judges a different finish from Play's is a hole the shape of a stage that won't load. Every rule takes the row's
  finish and the setting, from one function.
- For a picture the engine resolves at run time, a `new URL(\`folder/${name}\`, import.meta.url)` table works in Vite and Node alike;
  `import.meta.glob` does not run under tsx, so tests would have tested something else.
- drawcheck plays one setting. When a stage's Normal is broken, its draw cost goes unmeasured, silently, unless "could not be played" is
  read as the FAIL it is.
- For the next builder: name the catalog id exactly (with its group prefix, 'hf18/...'); never put a size in data. Look at a hung piece
  sideways: the screen is short, and anything at the bottom of a hung picture hangs in the air.

## 8. Turnover note
reference/handoffs/engine-core.md section 0DR (written on this branch; commit below).
