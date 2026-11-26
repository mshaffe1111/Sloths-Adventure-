# FIX-SOIL-c (t-fix-soil-c, cut from t-build-28-wip 0f15f97d3). Started 1:24 PM ET 11-26 (by `date`)

## EXACT NEXT STEP
Gates on a FROZEN tree of the fix commit (git worktree add --detach; node_modules linked; D115), each ONCE: tsc; lockall --layouts 16
--check against a lock RECORDED on frozen 0f15f97d3 (zero moves); paintcheck sweep (all parts); drawcheck; the CI tool line
(gates.yml 'rolled': `npx tsx --test tools/engine/library.test.ts ...`). Fill the gate table, push t-fix-soil-c, `git ls-remote`, send
the lead the hash + table.

## The cause (traced on the real page, to the line)
2-8's fork (BUILD-28's toy on 2-8's own config, forkstills-s9/s10): the pillar sat at world x 16957..17125 in all three stills
(camera read: upright 0.534 world/px, sideways 0.655): the 88-wide moss_stone (id 8, x 16997 y 803) plus POCKET_SIDE 40 a side.
On the page that piece IS a dip pocket (isPocket: ownLook, set by the world's finish, which the headless build skips; narrower than
140, sunk 75 between the logs id 6 and id 7), and a STACKED LEG'S CEILING runs over all three (groundCeilings: 1), so none is hung.
The banks either side paint inside clipAbove(ceilingsOver(...)), but **drawGround's dip-pocket pass (protoArt.ts, the loop after the
banks: `for (const p of banks) { if (!vis(p) || !isPocket(p, banks)) continue; ... ctx.rect(p.x - POCKET_SIDE, p.y + 20, ...,
bottom - p.y - 20)` with bottom = view.y1 + 40)** painted the pocket's soil edge to edge down to the view's bottom with NO ceiling clip
and no hung stop: one full-height pillar through the porch log and the lower leg's air.
Why the gate missed it: soilOvers took `ceilingsOver(a, cs)` for EVERY region (an assumed clip, D136), so the unclipped pocket read as
clipped. And no listed stage lays this section yet (the sweep never saw it).
A second shape of the same pass, found on the way (headless, no ceiling, finish applied): between HUNG banks a pocket's soil ran on
down alone (soilOvers RED: ids 5 and 8 over the marsh floor). Fixed in the same change.

## What changed (draw-only; no stage id, world or x in engine code)
- src/game/protoArt.ts: the pocket pass clips its soil above a stacked leg's ceiling (as the banks') and draws the ceiling's underside
  under its own span (closed both ends: the banks carry it on). NEW pocketHangs(): a pocket between hung banks, or whose own soil run
  down would cover a lower bank (more than SOIL_JOIN, gap >= SOIL_ROOM), stops at its own bottom on the world-anchored underside line
  (underY), with the hung bank's painted underside and shade; never under a ceiling. NEW pocketOutline() (drawn and gated from one
  outline). bankOpen: a hung bank beside a hung pocket gets seamL/seamR (its underside runs square into the pocket's, no round-up).
  groundSoil exports each region's `clip` (the ceilings drawGround clips it to).
- tools/engine/paintFall.ts: soilOvers reads each region's `clip` (what is drawn), the stage's ceilings only for a region with none.
- tools/engine/paintFall.test.ts: 2 planted tests (ceiling shape; hung shape). RED on 0f15f97d3's src (2 fail, 16 pass), GREEN after
  (18/18).

## Stills (2x, the real page, vite on a fresh tree each time, port 5199 strict, served tree checked, killed after): stills/
before-/after- porch-upright, porch-sideways, lip-upright, lip-sideways. LOOKED AT: the pillar is gone in all four; the porch log reads
against the backdrop; the ceiling's underside runs unbroken over the pocket span.
NAMED, not this fix (before AND after, same code both runs): left of the porch the rises (moss_stone 60 high, x 15569..16969) draw as a
pale cut-stone block with a straight right side at x 16969, standing from the rise down past the porch log (porch-sideways x 40..650;
porch-upright x 0..115); BUILD-28's s10 stills showed grass and sandy soil there instead, so that piece's look also varies run to run.
