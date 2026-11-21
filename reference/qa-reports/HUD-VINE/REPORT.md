# HUD-VINE: R-165.364, the upright HUD's lower-row vine strip ends in its painted curls

UI member, Opus 5.5 high, branch `t-hud-vine` from `origin/t-int-15` at 0eefc707e. Packet: reference/packets/2026-11-21/HUD-VINE.md
(on ccr-ea739a2f-dfcee4). Times by `TZ=America/New_York date`. FINAL HASH: see the last commit on t-hud-vine (named in the message to the lead).

## What was wrong
Upright, on a stage whose goal counter hangs on the HUD's lower row (under the hearts: 2-5 and 2-3 on a 412 px phone), the painted HUD drew
the counter's own short vine as `<PaintedVine x0={2} x1={cw - 2}>` with no end pieces: a straight tile band cut square at both ends.
Every other painted run in the HUD ends in the lead piece, the painted curl (`vineEnd`) or the screen edge.

## The fix (draw only)
- `src/components/hud/VineHud.tsx` (the goal block): the strip now has `endL endR`, the same painted `vineEnd` curl the hearts' vine and
  the Menu's vine use (no new code-drawn shape). Its tiles stop one curl-width in from each side, so the whole run (curls included) stays
  inside the plate's width, where the square strip was.
- It is drawn at `STRIP_K = 0.6` of the hearts' vine. At full size (first try) the left curl rose into the bottoms of the hearts on 2-5
  and 2-3 (it failed my polish look, so it never went out); at 0.6 the curls with their leaf clear the hearts and the run reads as the
  plate's own small vine, a little lighter than the main one.
- `src/components/hud/painted.tsx`: `vineEndW(k)` exported (the curl's drawn width, the same sum PaintedVine used inside).
- Sideways, the top-row counter (1-1, 2-2) and the unpainted HUD are not touched (the change sits only in the painted lower-row branch).
- Performance (PERFORMANCE-RULES §1): two more static spans from the HUD atlas already loaded, in a memoised component; no canvas draw, no
  per-frame work.

## Plant
`src/components/hud/vineEnds.test.ts` (commit c9571a7a3, before the fix): every `<PaintedVine>` in the HUD has a painted left end (lead or
endL) and a painted right end (endR) or runs off the screen edge; the lower-row strip at `y={pv}` has endL and endR with x0/x1 set back by
`vineEndW(...)`. **RED on 0eefc707e** (2 of 2 fail: "left end painted (lead or endL): <PaintedVine x0={2} x1={cw - 2} y={pv} k={k} />"),
**GREEN on the fix** (2 of 2 pass). It reads the source (VineHud.tsx imports CSS, as goalShown.test.ts does), so it guards the ends being
drawn, not how they look: the stills below are the look.

## Stills (reference/qa-reports/HUD-VINE/stills/, 2x)
| Still | What it shows |
|---|---|
| hudvine-plate-upright-2-5-2-3-before-after.jpg | the plate crop at 2x, 412x915 upright, before (square-cut strip) and after (curl and leaf both ends), 2-5 and 2-3 |
| hudvine-band-upright-2-5-2-3-before-after.jpg | the whole top band upright, so the curls are judged against the hearts, lives and Menu |
| hudvine-after-sizes-2-5-2-3.jpg | after, 360x780, 390x844, 430x932 (2-5) and 360x780, 375x667 (2-3): the curls clear of the hearts at every size (2-3 at 430 wide puts the counter in the top row, unchanged) |
| hudvine-unchanged-upright-1-1-2-2.jpg | 1-1 and 2-2 upright (top-row counter): plate crops 0 px changed base vs branch |
| hudvine-unchanged-sideways-1-1-2-5-2-3.jpg | sideways 915x412, base vs branch: the HUD is identical; the only changed pixels are the backdrop's foliage swaying behind it |
| hudvine-320-preexisting-overlap.jpg | FINDING (not this fix): 320x640 upright on 2-5 |

Tools (committed beside the report): `stillsHud.mjs` (top band + plate crop, upright and sideways, at 2x on a dev server) and
`clearHud.mjs` (the strip's pieces vs the hearts' boxes on six upright phone sizes).

## Polish check (as Matt will see it on the phone)
- The strip's ends: a painted curl with its small leaf at both ends, the same piece as the curls on the top vine. PASS (plate crops).
- Clear of the hearts: a visible gap between each curl and the heart above it at 360-430 wide (band and sizes stills). The element boxes
  overlap by 2-3 px (clearHud: gap -1.8 to -3.1), which is the transparent margin of the boxes; the painted pixels do not touch. PASS by eye.
- The thinner vine still reads as a vine holding the plate (its two tendrils land on it). PASS.
- 1-1 / 2-2 upright and every stage sideways: unchanged. PASS.
- 320 px wide: NOT fine, and not new (the lead 9:53 AM ET: pre-existing, logged as its own row). On the base the plate already overlaps the lives medallion and the square strip runs into the
  Menu leaf; after the fix the right curl sits over the leaf's lower lines instead of the square end. The cause is the lower-row plate's
  width at 320, a layout item outside this packet's "draw only"; named to the lead for an R-id.

## Gates (on the fix head, tree untouched while they ran)
| Gate | Verdict | Line |
|---|---|---|
| tsc --noEmit | PASS | no output |
| the suite, the CLAUDE.md line in full (612 files incl. vineEnds.test.ts), 3 shards side by side | PASS | 4005 tests / 4002 pass / 0 fail / 3 todo (shards: 1429/1428/0/1, 1280/1278/0/2, 1296/1296/0/0); the todos are the known 4-3 boulder and R-165.312 flag placer |
| vite build (BASE_PATH=/Sloths-Adventure-/) | PASS | exit 0 |
| chunkcheck | PASS | |
| artcheck | PASS | |
| drawcheck | PASS | 787 s (the HUD is DOM, not canvas: run because it is on the list) |
| clipcheck | PASS | 83 known, 574 s; reaches the in-play HUD on 1-1 only (top-row counter), both ways |
| knowncheck | PASS | |
| generalitycheck | PASS | 26 literals, 26 known |
| roadmapcheck | PASS | after git fetch --unshallow (first run: "shallow clone ... FAIL") |
| kbdcheck | PASS | 130 s (its rewritten keyboard stills restored, not committed) |
| buildcheck | PASS | normal p95 122 ms, easy p95 59 ms |
| seedlist 1-1 --check | PASS | 161 seeds, 0 refused |
| engine tool tests (library, seedlist, yield, travelBots) | PASS | 39 / 39 / 0 fail |
| tierBots.test | PASS | 9 / 9 / 0 fail (no 1-1 change: calibration not re-run) |
| the plant vineEnds.test.ts | RED on 0eefc707e, GREEN here | 2 / 2 |

## Method used
reference/methods/render-fix.md (steps 2, 5, 6, 7, the whole-picture check), the packet's line ranges only (READ LEAN).

## Lessons applied
- D79 (judge the whole screen): the whole top band judged, not the strip alone; that is how the curl-into-hearts and the 320 overlap were found.
- D86 (the CLAUDE.md check list, every item): every gate below ran, not the packet's subset.
- D102 (read lean): line ranges and greps only; no whole design doc or engine file read.
- render-fix.md step 6: the plant shown RED on the base before the fix commit.

## Learned / method update (proposed)
- A painted end piece is taller than the tile it ends: before adding one, check what hangs just above the run (here, the hearts). The
  bounding boxes overlap even when the pixels don't, so judge clearance on the 2x still, not from the boxes.
- clipcheck reaches the HUD only on 1-1 (top-row counter). Proposed: a lower-row HUD stage (2-5) upright in clipcheck's in-play shots, so
  the lower-row plate (and the 320 overlap) is gated.
