# FIX-SOIL-c (t-fix-soil-c, cut from t-build-28-wip 0f15f97d3). Started 1:24 PM ET 11-26 (by `date`)

## EXACT NEXT STEP (hand-over at the box: 28 minutes of work; the pillar fix a9c0170c is APPROVED by the lead on its stills)
FINAL CODE HEAD a9c0170c on t-fix-soil-c. Gates on a FROZEN tree of a9c0170c (git worktree add --detach; ln -s node_modules; chattr -R +i
src tools; D115), each ONCE. Status at the box (1:51 PM ET):
(1) lockall: the lock IS RECORDED on frozen 0f15f97d3 (3264 builds of 102 stages, rc 0): reference/qa-reports/FIX-SOIL-c/lock-base-0f15f97d3.json.
    NEXT: `npx tsx tools/engine/lockall.ts --layouts 16 --check reference/qa-reports/FIX-SOIL-c/lock-base-0f15f97d3.json` on frozen
    a9c0170c: ZERO moves expected (draw-only). NOT RUN.
(2) paintcheck sweep, all parts in one run (`npx tsx tools/engine/paintcheck.ts`, ~18 min+): 0 new, 0 SOIL OVER. Started here, reached 1-8
    of 102 at the box: NOT FINISHED; run it fresh.
(3) drawcheck (`node tools/perf/drawcheck.mjs`, ~6 min): NOT RUN.
(4) the CI tool line (.github/workflows/gates.yml line 157, the 'rolled' step starting `npx tsx --test tools/engine/library.test.ts`):
    started here on frozen a9c0170c, 94 ok / 0 not ok at the box, NOT FINISHED; run it fresh.
(tsc on the frozen a9c0170c: PASS. paintFall.test.ts: 18/18; planted RED on 0f15f97d3's src: 2 fail.) The SUITE is HELD by the lead
until the final candidate is known (CI #85). Then fill the table, push t-fix-soil-c, `git ls-remote origin t-fix-soil-c`, send the hash
and table to the lead (session_01FhBbYN2CVHnFXg7XzqKXpM).
THE RISES' BLOCK (the lead's second order): cause traced, below; NOT one quick draw-only fix: the lead routes it. Do not patch it here.

## The rises' pale block (the lead's order 2, traced; NOT a quick draw-only fix)
- (a) The rises (id 32 moss_stone 1400x60 at x 15569 y 1398; id 33 600x60 at x 15969 y 1338; both stand on the porch log, foot 1458)
  are not painted: paintedBank (w1Pits.ts:97) needs height >= 90 (or soil); the moss-stone painter draws only h 50 (rockLooks.ts:21),
  and pickCut gives no cut piece (too wide), so terrain.ts terrainLook (the `if (p.height >= 50)` branch) draws them as CODE TERRAIN
  ('ground'/'step'/'pillar'/'earth' by the plan), whose body footingOf gives bodyBottom: Infinity: drawn on down out of sight with a
  straight side, through the porch log. It is R-165.292's fall-through (paintFall.ts paintFalls): on the toy build paintFalls flags
  id 32 and id 33, and W itself (id 30, 330x60), as moss_stone h 60 drawn 'ground', painter range 1-50. The paintcheck sweep has not seen
  it only because no listed row lays this section yet: it WILL go red when 2-8 lists it. The fix is a lay or painter-range decision
  (the rises and W at 50 or >= 90/soil, or a painter for a 60 px stone step), not a draw patch.
- (b) The look varies run to run BY DESIGN: engine.ts:1054 setSceneSeed(rollSceneSeed()) on every stage load (sceneSeed.ts: "no two runs
  look alike while the gameplay layout stays the same"; ?seed=N replays one); terrain.ts stagePlan builds its plan from that seed, so
  code terrain's face changes per load. Not Math.random in the lay; the layout is the same every run.
- R-165.451 (2-6 beat A, FIX-SOIL-b's after-A panel): painted soil texture in a lighter shade with a straight side (protoArt's ground),
  not code terrain: a DIFFERENT draw by its look (not traced on 2-6 in this session).

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
