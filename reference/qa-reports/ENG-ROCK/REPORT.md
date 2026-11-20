# ENG-ROCK: R-165.338, painted rocks stop being one stamped boulder (draw only)

Member: ENG-ROCK (Engine, high). Branch t-eng-rock from t-int-14 at 73717be8. Final code head: see the last line.
Packet: reference/packets/2026-11-20/ENG-ROCK.md (on ccr-ea739a2f-dfcee4). Started 12:35 PM ET 11-20.

## What changed
- **The packet's premise was false; checked before building (law 3).** In every world kit (W2-W10) the 'stump' cell is the boulder
  again: the same outline (alpha diff 0), with RGB differing on ~1-2% of pixels (encode noise). So "boulder + stump + mirrors" was one
  picture and its mirror. Evidence: kit-boulder-vs-stump-w2-w10.png. The lead ruled B, then (on the stills) C, and logged the
  duplicated stump cell as its own roadmap item.
- **src/game/rockLooks.ts (new):** each world's rock pictures by inventory id (ROCK_FRAMES; World 2 = the kit boulder + w2-rocks#rock-a
  + w2-rocks#rock-b, the same list as the world data's W2_ART.rock), their seats (ROCK_SEAT: the mean top of the middle 40%, measured
  from the sheet), and assignRockLooks: each painted rock takes a picture and a mirror from a hash of its platform id, walking the
  stage left to right, and is never the same look as the rock before it (another picture where there are two or more; the other mirror
  where there is one). isPaintedRock moved here (protoArt re-exports it).
- **protoArt.ts drawRockArt:** draws the assigned look, as wide as the kit boulder (the collider is unchanged: 50 px), its seat placed
  where the boulder's seat lies, mirrored about the rock's centre (save/scale/restore only when mirrored). setRockLooks(platforms) is
  called by engine.ts at stage start, right after setKitWorld. A picture whose sheet is not in yet draws as the kit boulder.
- **The sheet is loaded with the stage:** stageSheets.ts asks for 'rocks:<w>' with the kit when the world's list names a sheet beyond
  the kit, and stagePreload.ts decodes it (never a pop-in).
- **The art (ruling C):** one Hugging Face sandbox, 9 img2img takes from the World 2 kit boulder (18 cuts), the lead picked
  s68-11-L (rock-a, a layered slab with a moss top) and s60-37-L (rock-b, a lumpy lobed rock). Each is cut at the boulder's own
  388:179 shape (about 1.3x taller than the take) so it sits on the 50 px collider exactly like the boulder (footing-mock.jpg).
  src/assets/w2-rocks/w2-rocks.webp (564x129, 18 KB) + w2-rocks.json.
- **Catalog:** CATALOG-MASTER.csv + the emitted inventory: rock-a/b in game (pokey_scale 0.83, scale_ok y, as the boulder); the 9 tall
  cuts unassigned ("tall rock; needs a taller collider than the 50 px hop rock"); the grey stones w2-new#stone-a/b keep their rows with
  the lead's note (not World 2's hand: heavy black outline, cool flat grey; out of World 2's list).
- **Worlds 3-10:** their kits have one rock picture, so their rocks turn their mirror rock by rock (no two side by side alike).
- **HF-SPEND.md:** the job logged (~$0.32 of the $2 cap; balance ~$49.9 from the lead's $50.2, or ~$48.7 counting the INT-14 merge note).

## Proof
- Planted test src/game/rockLooks.test.ts (6 tests): a toy row of 6 World 2 rocks shows at least 2 pictures and no two neighbours
  alike; every id pattern in every world, in x order, has no neighbours alike; the same stage gets the same rocks; only painted rocks get
  a look; World 2's list equals W2_ART.rock and each row is in World 2's inventory and in scale. RED before rockLooks.ts existed
  (ERR_MODULE_NOT_FOUND, 12:45 PM ET), green after.
- The looks on the real stages (layout 1; x:picture, m = mirrored; 0 boulder, 1 rock-a, 2 rock-b):
  2-1 `1172:0m 3222:1 5689:2 5990:1m 6794:0 7821:2 10465:0m 10796:2m ...`, 2-2 `1182:0m 1998:2 6004:1 7348:0m 7679:2 ...`,
  2-4 `1182:0m 2280:2m 3590:1 4590:2 5207:1 6187:0 7493:1 7807:2 ...`: every picture used, never the same beside.

## Stills (reference/qa-reports/ENG-ROCK/stills/; base 73717be8 before, this branch after; layout 1, 2x, upright 412x915 + sideways 915x412)
- compare-sideways.jpg, compare-upright.jpg: 2-1 x5747/x10520, 2-2 x1240/x7405, 2-4 x4646/x7550, before | after, whole screen.
- compare-feet-2x-ontop.jpg: 2x crops with Pokey standing ON the rock (rock-b at 2-1 x5747 and 2-4 x4646, rock-a at 2-4 x7550, the
  boulder at the others); compare-2x-bank.jpg: 2x, him on the bank beside the rocks.
- before/ and after/: every full-size still (bank-* beside, ontop-* on the rock).
- 2-5: NOT shot. On this base 2-5 builds no painted rocks (t-build-25 is not on it); its rocks take their looks the same way when it lands.

## Polish check (the lead judged the after-stills at 21af89b4 ACCEPTED, no redo, 1:10 PM ET; my own read below)
- The lead accepted compare-sideways.jpg and compare-feet-2x-ontop.jpg (the 2x crops of Pokey's feet on each rock). Run 2 changes no pixel:
  the ids are the same strings, and lockall/drawcheck pass.
- Footing: on every picture Pokey's feet sit on the painted top at the line the boulder's crown is at today (ontop crops). PASS.
- rock-b (the lobed one) stretched: no smeared moss tuft, no lobe past the collider (2-1 x5747, 2-4 x4646 ontop crops). PASS, so no
  fallback to s68-23-L.
- Same hand as the kit: thin warm-dark outline, brown-grey gouache, moss tufts; at whole-screen size they read as the world's own
  rocks, varied in shape (slab, lobed, dome), not as a new set. PASS.
- The grey stones (the first try, option B) were rejected on these stills: heavy black outline, cool flat grey. Gone from World 2.
- Left as it is: the kit boulder's 'stump' duplicate in W2-W10 (the lead's own roadmap item); worlds 3-10 vary by mirror only until
  their kits get a second rock (W3's with W3-ART-1).

## Gates (on the final list; every line PASS or FAIL)
Run 2, on 1f1af8bb4 (the final code), 2:21-3:21 PM ET 11-20; each line is the gate's own exit:
- tsc: PASS (exit 0)
- lockall vs base 73717be8 (16 layouts): PASS, 102/102 stages unchanged (nothing moves)
- suite, 4 shards (`--test-shard=i/4`, the CLAUDE.md test list): PASS, 3987 tests / 3984 pass / 0 fail / 3 todo (shards 995/890/981/1121)
- generalitycheck: PASS (26 literals, 26 known)
- knowncheck: PASS (artUse.allow.json 210 entries, none added)
- roadmapcheck: PASS (run after `git fetch --unshallow`)
- build (BASE_PATH=/Sloths-Adventure-/): PASS
- chunkcheck: PASS
- artcheck: PASS
- paintcheck 0/3, 1/3, 2/3: PASS, PASS, PASS
- drawcheck: PASS (599 s; 2-1, 2-2, 2-4 upright and sideways each passed)

Run 1, on 21af89b4, FAILED three lines, so run 2 is on the fixed tree. Every other run-1 line passed.
- suite shard 4: 2 fails, both mine:
  - inventory.test: the 9 tall-cut rows pointed at reference/...; a row must be src/ or `origin/<branch>:path`. Fix: `origin/t-eng-rock:...`,
    used_in "none (not placed)", and the census of branch-only cut pieces is 194 -> 203. Those are 9 real new rows; the count is a census, not a known-defect list.
  - artUse.test: the art-use text check does not read `'w2-rocks#rock-a'` as a use of rock-a ('#' is not a word character in it), so it
    called the drawn rocks unused. Fix in rockLooks.ts: `pieceId('w2-rocks', 'rock-a')` (the same strings at runtime). The gate is unchanged.
- roadmapcheck: "shallow clone, proofs cannot be checked". Fix: an environment fix, unshallow the clone first.

## Method used
- reference/methods/render-fix.md (a shared drawer: one fix for every stage, stills both ways, the whole-picture check) and
  reference/methods/hf-art.md (one sandbox, img2img from the world's own piece on flat grey, cut in the sandbox, files back by
  hf_sandbox_fs, spend logged).

## Lessons applied
- Check a fact in code/pixels before acting on it (D7, D24): the stump cell measured before building, which turned the packet.
- A ruling on a look is made on a picture of the piece on the thing it sits on: the grey stones and every take were shown on the real
  stages / on the collider before cutting.
- Every prop stands on something (D16) and sizes against Pokey's drawn height (D41): every picture seats on the 50 px rock; tall takes
  not shipped; catalog scale from the drawn size.
- Inventory first (R-165.104/.107): every new piece and every unshipped cut is a catalog row.
- Engine work for every stage (D43): no stage id, world number or x in the drawer; the world's list is data.
- Time from `date` in the same command (D30); queue read at every push (D57).

## Method update (proposed)
- hf-art.md step 5: **a start for a piece that sits on a fixed collider must have the collider's aspect.** The lead's "low-wide /
  tall-narrow" starts gave rocks that could not seat on a 115x50 rock (one floats 12 px, the other hangs 50 px); baking a 1.3x stretch
  into the cut rescued the low ones. Next time: shape the start inside the collider's box (vary the outline, not the box).
- hf-art.md step 7: **cut to ship size before bringing files back.** 18 cuts at 280 px q80 came back in 3 hf_sandbox_fs cats (164 KB);
  results that big are saved to disk, not shown, so this costs little context. The bucket refused the forwarded token (403) again.
- A sandbox job like this one (one start, 9 takes, cut in the sandbox) ran in ~7 billed minutes (~$0.32): one queued script, no waiting.

- tools/art/artuse.mjs: **read a quoted inventory id `'<sheet>#<frame>'` as a use of `<frame>`** (lists like W2_ART name pieces by
  id; today a piece named only that way reads as unused). This is a gate change, so the lead decides. Until then, write the frame name as its own string.
- inventory.test: a cut piece kept in reference/ (not shipped) has no row form but `origin/<branch>:path`; a row form for a cut piece kept on main
  would stop it depending on a work branch.

## Learned (for the next engine member)
- A kit frame's NAME is not proof of a picture: diff the cells before planning variety on them.
- Run the suite before the long gates (or with them): both run-1 fails were seconds-long tests that a 1-hour run found last.
- Assign looks once at stage start, in x order, so "never the same beside" is a property, not luck; a pure per-id hash cannot promise it.

Final code head: 1f1af8bb4 (every gate above ran on it); this REPORT is the one commit after it (the hash sent to the lead).
