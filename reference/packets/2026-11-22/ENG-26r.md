# ENG-26r: 2-6's draw budget (drawcheck RED at 2-6's spots): per-frame gradients cached, the overdraw and clips cut; no limit raised
Engine, Opus 5.5 xhigh. Written 3:31 PM ET 11-22 (by `date` in the same command). A FRESH member. **RELEASE 3's critical path: 2-6 does not ship
while drawcheck is RED on it (PERFORMANCE-RULES §1, §8: 'silky smooth on every phone').** Matt: release 3 only, at most 2 members; the
weekly limit is in warning: each run once, on the exact head.
BOX: hand over at 320k REAL context OR 28 minutes after your start (from `date`), whichever comes FIRST (D111), with the EXACT NEXT STEP.
**A question to the lead never ends your box (D120). Every long run with run_in_background AND a fitting timeout (D122), NEVER a shell '&'
(D113); every run on a FROZEN worktree never touched while a run reads it (D115); candidates on t-build-26-wip-26r until the lead rules
(D117); no heredoc in a commit chain (D119). Law 22: never raise a limit in tools/perf/limits.json or add a known entry to get around this.**
READ LEAN (D102): this packet; PERFORMANCE-RULES.md §1 and §8; tools/perf/limits.json (the limits and each one's 'why'); methods/gates.md
(drawcheck: how to read a breach); LAWS headlines; LESSONS D40, D96, D102, D109, D111-D122.
**Run ReadNotifications at EVERY step boundary, at every push and between long tool rounds. Messages to the lead carry NO clock times (D109).**
BASE: t-build-26 at a07ed1bd7 (BUILD-26n landed the final bot candidate + the 1-1 recalibration: unit 4,035/0, castBots.test 23/23, tierBots 9/9).
THE FACT (BUILD-26n, read from drawcheck's raw per-frame counts on the candidate, src = 86625c5ae's): five breaches, ALL on 2-6, counted after
the 1.5 s settle and equal on every counted frame (so not the start's zoom ease): port gradients 5 > 2, drawImageScreens 9.39 > 7.5; land
gradients 7 > 2, drawImageScreens 11.22 > 7.5, clips 24 > 19 at x 64; spot 1 (mid-stage) also over on gradients (4 / 6). Gradients come from
two per-frame call sites: src/game/riverArt.ts:219 drawRiverWater (caller engine.ts:6294; one createLinearGradient per safe river under its
bed, every frame: 64 over 32 frames upright, 104 sideways) and src/game/protoArt.ts:1151 drawWallChunks (caller protoArt.ts:1054; the depth
darkening, one a frame). The drawImageScreens and clips sit in sheetBake drawSheet, paintedScenery drawGroundFlora and stageArt blitAt.
0. The CLAUDE.md suite on your base, frozen, in the background now (D114).
1. **drawcheck for 2-6 alone on the base, verbose (DRAWCHECK_VERBOSE=1), as the plant: RED now**, every breach with its call sites and counts.
2. **Gradients, general:** a gradient whose stops and span do not change frame to frame is created ONCE and reused (the safe river's under-bed
   shade in world space, keyed by its bed and colours; the wall chunks' depth darkening built once per view height and drawn translated); no
   look change: 2x stills before/after at 2-6's two spots, both ways, compared pixel for pixel (a difference over 1 luma is named).
3. **drawImageScreens and clips:** name which layers draw the excess area at 2-6's spots (per call site), then cut it generally (cull what is
   off screen or fully covered, bake static layers once, merge clips): every stage benefits; the same before/after stills.
4. drawcheck on the fix, all scenarios (about 6 min): 2-6 GREEN at every spot, no other scenario worse. Then the suite and lockall (no stage
   moves: drawing only) on the fix head. Rows of nothing to bring: a drawing change moves no castBots row; prove that with lockall.
5. To the lead: the numbers before and after per spot, the stills, the gates. Lands on the lead's word (rebased on t-build-26's head).
REPORT: reference/qa-reports/BUILD-26/REPORT.md, a section of your own on your wip branch (EXACT NEXT STEP first). Lead:
session_01FhBbYN2CVHnFXg7XzqKXpM. Rulings arrive with priority 'next'.
