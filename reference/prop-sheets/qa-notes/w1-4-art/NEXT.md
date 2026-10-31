# World 1-4 pieces and sheets: handover to the gen2 builders (2026-10-31, w1-4-sheets helper)

The pieces-and-sheets stage for Worlds 1-4 is done (STAGE-RULES §1c steps 2 and 3, art half). Nothing in `src/game` draws the new art
yet. Each world's builder places it as that world moves to gen2 (`origin/plan-gen2-w1-4:reference/GEN2-W1-4-PLAN.md`).

## What's here

| What | Where |
|---|---|
| Grab bags, lead-approved 2026-10-31 ~1:45 PM ET (themes, section types, beats, teaching, unused art first, Dot-line table) | `reference/prop-sheets/qa-notes/w1/GRAB-BAG.md` ... `w4/GRAB-BAG.md` |
| Style sheets (kit + 3 approved pieces + backdrops + palette + rules), attached to every new prompt | `reference/prop-sheets/w1-style-sheet.png` ... `w4-style-sheet.png` (`tools/art/w1to4/stylesheet.py`) |
| The new art, one atlas per world | `src/assets/w1to4art/w<N>-new.webp` + `w<N>-new.json` (frames `{x, y, w, h}` by name) |
| Polish check (a verdict per piece) and the phone-size stills | `reference/prop-sheets/qa-notes/w1-4-art/POLISH.md`, `w<N>-upright-*.jpg`, `w<N>-sideways-*.jpg` |
| Game-wide unused-art list and its gate | `tools/art/artuse.mjs`, `src/game/artUse.test.ts`, `src/game/artUse.allow.json`, `reference/prop-sheets/qa-notes/art-use/UNUSED.md` |
| Jobs and spend | `tools/art/w1to4/jobs.txt` (about $2.3 of the $10 cap, including round 3) |

## For each builder

1. **Place the world's unused art first** (each bag's §0 table). Then the new pieces, each in the section the bag names.
2. **Sizes.** Draw each piece at the size its section plays it. `tools/art/w1to4/stills.py` `USE` holds the size used in the stills, in
   game units (Pokey is 66). The atlases are at about 3-6 atlas px per unit, so they stay sharp at 2x.
3. **The art-use gate.** When a piece is drawn, `src/game/artUse.test.ts` fails until you take its entry off
   `src/game/artUse.allow.json`. That's on purpose: the list only shrinks. Entries for the new atlases are owned by "gen2 W<N> builder".
4. **Small code touches the bags rely on** (allowed by STAGE-RULES §4):
   - W1's bobbing bough is Matt's `branch`, tilted and bobbed in code.
   - W2's sinking pads are the existing `lily`, sunk under the river's surface.
   - Glow on the W3 spores and stones' rims.
   - The W4 updrafts drawn over the code leaf streaks.
5. **Teaching and Dot.** Every new beat is taught on first sight. The Dot lines in each bag's last table go to Matt in one review (the lead
   carries them); until he approves, use the existing tip.

## Decisions waiting (the lead asks Matt)

- **The cage (W2).** `cageA` is placed as a second cage look. `cage-whole`, the HF round cage, is the candidate redraw. Which one does
  Matt want for the whole cage?
- **The Dot lines:** all four bags, one review.
- **W1 knot-steps:** round 3's bark burls (POLISH.md). The fallback is the trunk's own knots.

## Making more art for these worlds (same pipeline, about $0.2-1 a job)

1. `python3 tools/art/w1to4/starts.py [--round2|--round3] <world>`: start canvases on the key colour, with two approved anchors each.
   - Solid pieces go on magenta (green if pink).
   - See-through effects go on black.
   - Shadows go on white.
   - Add a canvas to `canvases*()`.
2. `python3 tools/art/w1to4/make_spec.py ...`: write a spec, commit and push, then run the job with the HF connector's `hf_jobs`. Copy
   the command in `jobs.txt`: it fetches `tools/art/hfdrake/storygpu.py` and the spec from GitHub raw at the pushed commit, and the
   bucket `mshaffe111/w5-xfer` is mounted at `/out`.
3. Bring the takes back with `hf_fs attach` of `w1to4/<sub>/out/carrier-*.png`. The file lands in the session's tool-results folder.
   Unpack it with `tools/art/w5/unpack_carrier.py`. This container can't reach huggingface.co itself.
4. Pick in `tools/art/w1to4/picks-w<N>.json`, then run `python3 tools/art/w1to4/cut.py <N> <takes dir>`. It keys the pieces, un-mixes
   the key from their edges and runs the fixed edge pass (`tools/art/edges/defringe.py`). Then run `python3 tools/art/w1to4/allow_new.py`,
   `python3 tools/art/w1to4/stills.py <N>` and `node tools/perf/artcheck.mjs`.

Lessons from this pass:
- A two-picture edit copies the reference. One-picture edits of an existing character stay on model (the squirrels, the bats).
- Water and anything pale painted on magenta comes back tinted: use black.
- A shadow can't be cut off black: paint it on white.
- The model lays a faint box behind soft effects; `cut.py` takes the cell border's level off.
- Repaints of Matt's own pieces came back softer than the originals. Use his.
