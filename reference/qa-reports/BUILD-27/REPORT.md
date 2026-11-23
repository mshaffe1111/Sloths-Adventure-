# BUILD-27 REPORT: 2-7 "The Mailman's Route" (t-build-27-wip; started 12:35 PM ET 11-23 by `date`; budget 2 h, report by 2:40 PM ET)
## BUILD-27g (closing; started 5:12 PM ET 11-23 by `date`; report by 6:15 PM ET; hard stop 6:45 PM ET; box 28 min / 320k)
Plan: wait for DRESS-27d (the camera's view floor on the stacked upper leg + the deep river's wall strip) on t-eng-27; merge it into
t-build-27e (no force); ONE frozen final tree; the gates once in three lanes (probes27g/laneA.sh, laneB.sh, laneC.sh: the full CI set,
the 'rolled' tool line read live from gates.yml:157, plus the shipping build + chunkcheck); re-shoot only DRESS-27d's spots.
Set up: worktree /home/user/wt-b27g (branch t-build-27e at 793ddf246, node_modules by npm ci).

## BUILD-27f (finishing; started 3:56 PM ET 11-23 by `date`; report by 5:00 PM ET; hard stop 5:30 PM ET; box 28 min / 320k)
### Polish check (BUILD-27f; stills on frozen 0018fa7ab, LAYOUT=0 = list seed 1, rerolls 0, 2x; judged at phone size on contact sheets
and full-size crops)
- WEIR POOL (the seam): PASS. stills27f/clean/zoom-weir-pool-normal-x15950-upright.jpg, -sideways.jpg, zoom-weir-pool-easy-x16700-sideways.jpg:
  the foam meets the pool with no dark line and no specks; the bamboo pole's foot fades into the foam; Easy's frog on its stone is clear.
- PORCHES: PASS (BUILD-27b's (f) closed). porch-2-7-L0-normal-x10950-sideways.jpg, -x11460-upright.jpg, porch-2-7-L0-easy-x12100-sideways.jpg:
  every plank span stands on two posts into the river; they read as porches, not floating planks. On this list build the porches are
  x10610-11815 Normal, x11145-12517 Easy (the old x11376 spot lands on the bank).
- START JETTY: c27-2-7-L0-normal-x4500-sideways.jpg: the rope-tied post, heron, the step down to the doors. NAMED, not fixed (not mine, not
  2-7's): the high floor's pale band ends in a square dark notch at the step (DRESS-27's open item 4, every World 2 step, 2-3 too).
- WALK OUT / HOME / RACE: clean/ Normal and Easy, upright and sideways, 16 spots each + porches: no seams, no floating pieces, no cut art
  seen. Upright, the out leg's floor shows as a dirt ceiling over the home leg (the stacked out-and-back as designed).
- RACE FINISH: race27f/ win (Dot's line, nothing over it) and lose (Pokey's line, the boat docked): PASS.
- LIVE CARDS: stills27f/f27-2-7-L0-normal-x4960-*.jpg (tool probes27c/stills-live.mjs): cards are whole and readable both ways; the line
  shown is whichever moment the placed Pokey last tripped (out of order), so the clip, not these, proves the order. The clean tool
  (stills-at-setting) also shows Dot's win line at x800 because placing him at the home jetty settles the race: placement, not play.
- Minor, named: faint vertical tile seams in the deep soil on some sideways shots (painted ground, every world); not 2-7's.

### EXACT NEXT STEP (BUILD-27f's; read this first)
**NEXT (for BUILD-27f's successor; head t-build-27e 148cd80a7 or later; steps (1)-(3) below are DONE). NEW REPORT-BY 5:45 PM ET (lead);
test link about 6:15 PM.** The final gates wait for BOTH DRESS-27b (2-7's 6 draw breaches, no visible change) AND DRESS-27c (session
_01FhBbYNzLPjXxNT6cC9xjsf: the two LEAD'S FINDINGS below, the upright out-leg bottom band and the x9080 river wall strip and log cut;
lands on t-eng-27 by 5:00 PM ET and runs seedlist 2-7 --check with its change). Watch t-eng-27 and ReadNotifications for the lead's hashes.
DRESS-27b LANDED (t-eng-27 9fe64614e) and is MERGED: t-build-27e ffd604183 (clean; src diff vs 0018fa7ab = drawThrift.ts + test,
engine.ts draw, groundPaint.ts, groundStack.ts, riverArt.ts: draw only, no lay). Still waiting: DRESS-27c.
(a) When DRESS-27c has landed on t-eng-27: in /home/user/wt-b27f (or a fresh `git worktree add` of origin/t-build-27e,
`npm ci --legacy-peer-deps`), `git fetch origin t-eng-27` then `git merge --no-edit origin/t-eng-27` (no force). It must change DRAW code only:
`git diff bb107cab4 HEAD --stat -- src tools`; if it touches the lay (pipeline.ts, gen2/, w2*.ts lay), the ship number re-runs.
Push t-build-27e.
(b) A NEW frozen tree of that head: `git worktree add --detach /home/user/wt-b27f-f2 <head>`; `ln -s /home/user/wt-b27f/node_modules
node_modules`; `chattr -R +i src tools && chattr -R -i src/game/gen2/proven`.
(c) Gates ONCE, two lanes in the background (run_in_background, timeout 7200000; never '&'):
`bash reference/qa-reports/BUILD-27/probes27f/laneA.sh /home/user/wt-b27f-f2 <scratch>/gates` (tsc, seedlist 2-7 --check, the suite
shard 1/2, the CI tool line gates.yml:157, tierBots) and the same with laneB.sh (drawcheck, clipcheck, registrycheck, knowncheck,
generality, the suite shard 2/2). Each step appends `<name> exit=<code> <secs>s` to <scratch>/gates/lines.txt; the logs are <name>.txt.
drawcheck must show 0 breaches with 2-7 included; a suite red: re-run that file alone before calling it red; the seedListChunk EPERM
is the freeze (unfrozen 2/2 PASS, BUILD-27b), not a defect.
(d) Stills: re-shoot ONLY the spots DRESS-27c changes, both settings, both ways: the out-leg upright bottoms (N x4500 4960 6780 9080 11376
13508; E x4960 5419 7239 8900 9553 14205; check the bottom rows as probes27f's band numbers did: no dark strip, no streaks) and N x9080
sideways (the river wall, the log end; Easy: the same river's bank end, find it with probes27f/porchx.mjs's way on e.currentStage.rivers).
Compare with stills27f/find/f1-*, f2-*. Any other spot DRESS-27b or c names: re-shoot it the same way with tools/engine/runs/stills-at-setting.mjs
(LAYOUT 0) on the dev server of the new tree and diff against stills27f/clean/.
(e) Send the lead: the final hash, every gate line PASS/FAIL with the suite totals, the clip paths (race27f/), the stills' paths
(stills27f/clean/), yield 29/40, list 69/100.

LEAD'S FINDINGS (sent): (1) a portrait bottom band (vertical streaks under the dirt, a dark strip, an orange line, a sliver) on 2-7's OUT-leg
upright spots only (N x4500 4960 6780 9080 11376 13508; E x4960 5419 7239 8900 9553 14205); 2-4 and 2-5 at spawn fill clean: 2-7-ONLY.
(2) the deep river's lighter teal strip against the bank wall and the drifting log's flat cut at the bank (x9080 N sideways): 2-7-ONLY;
2-2/2-4/2-5 lay the shallow river only. Files: stills27f/find/. The lead decides who fixes them (not BUILD's: no engine code).

Learned / Method update (BUILD-27f): (a) once a stage is LISTED its stills spots must be re-found on the listed build: the list's plan for
seed 1 is not the pre-list search's, and the old x11376 porch spot fell on the bank; probes27f/porchx.mjs reads the pieces' x from the
live build (a level.md rule candidate: "spots come from the built stage, never from an older report"). (b) Two still tools, two jobs:
stills-at-setting.mjs (cards cleared) for judging the art, the race clip for the order of the lines; stills-live.mjs shows whichever line
the placed Pokey last tripped, so it cannot prove order. (c) Verdict frames move when the bots move (3615 -> 3775): read them from
racerec's own output each time, never from an older report.
Lessons applied: D115 (every run on a frozen tree), D111 (box with an exact next step), D109 (no clock times to the lead), D119 (no heredoc
in a commit chain), D131 (drawcheck on the listed stage in the final gate set), D125 (the clip on a listed variant).

(1) DONE: t-eng-27 cfa555cc9 merged into t-build-27e = 0018fa7ab (one doc conflict, engine-core.md: both hunks t-eng-27's, HEAD side
empty). It adds DRESS-27's draw code (columnDress, porchPosts, protoArt, engine setClimbFeet, the w2-next sheet) and no lay code.
Frozen tree /home/user/wt-b27f-f1 = 0018fa7ab (src, tools chattr +i; src/game/gen2/proven writable); node_modules
/home/user/wt-b27f/node_modules (`npm ci --legacy-peer-deps`), symlinked. Dev server: `npx vite --port 4318 --strictPort --host 127.0.0.1`.
LIST VARIANT: layout n builds seeds[n % 100] (seedList.ts:217 provenSeedFor); seeds = 1..100, so LAYOUT=0 = seed 1.
(2) RACE CLIP DONE on frozen 0018fa7ab, LIST VARIANT LAYOUT=0 (built seed 1, the puppet's seed check passed): racerec.mts adult normal 1
from 3300: verdict frame 3775 WON (him 51 s, boat 89.28 s); child normal 1 from 11450: verdict frame 13661 LOST (him 101.1 s, boat 89.28).
(The verdict frames moved from BUILD-27d's dry run 3615/11758: ENG-BOT27b's re-aim changed the runs.) race27f/race27f-win-adult-normal-L0-
seed1-side.mp4 (FROM=3600) and race27f-lose-child-normal-L0-seed1-side.mp4 (FROM=13500), 15 fps, 2x sideways. Named frames:
race27f/win-adult-n-L0-f3800-dotline.jpg (Dot: "You beat the post home! I never manage that!", no wayside card over it, the line stays up
to the shrine door at 3924) and race27f/lose-child-n-L0-f13680-pokeyline.jpg (Pokey: "Beaten by the post. Fair enough. He's had
practice.", the boat docked at the jetty). Judged at phone size: both lines whole and readable, nothing covers them.
(3) STILLS: stills27f/ = probes27c/stills-live.mjs (tip cards live) Normal + Easy, both ways; stills27f/clean/ = tools/engine/runs/
stills-at-setting.mjs (cards cleared) Normal + Easy with the start jetty (N x4500), the weir pool (N x15950, E x16700) added.
The live set shows cards out of order (Pokey is placed, so "Now home's the other way!" shows on the out leg): the tool's artefact,
not play; the clean set is the one to judge the art on.

## BUILD-27e (finishing; started 3:29 PM ET 11-23 by `date`; this section written 3:31 PM ET; report by 4:45 PM ET; hard stop 5:15 PM ET; box 28 min / 320k)
### EXACT NEXT STEP (BUILD-27e's; read this first; written 3:47 PM ET by `date`)
**Head: t-build-27e 42a5e6ef9** = t-build-27-wip 51ff9c43f + t-eng-27 09c23c1b0 (ENG-HUD27b, clean) + BUILD-27d's 92fcae5bf d1df3070b
361599287 fecf714c6 04db57dc9 f18614471 (letter 4, judged flip, clip rig, dry stills; trial merge 533e28c29 dropped) + ENG-BOT27b
t-eng-27-wip-bot27-aim 9480d879b (merged 5a6847ffe, clean) + 2-7's proven list. Frozen trees: /home/user/wt-b27e-f2 = 5a6847ffe (its
provenIndex.ts was unfrozen to write the list: do not reuse), /home/user/wt-b27e-f3 = 42a5e6ef9 (src, tools chattr +i; proven/ writable).
node_modules: /home/user/wt-b27e/node_modules (`npm ci --legacy-peer-deps`), symlinked into each frozen tree.
DONE (numbers on frozen trees): errs.mts 1-12 [] every roll both settings (f1 2cfd1871d); tsc PASS; w2Arc27 + judgedTable + easyMode 21/21.
SHIP NUMBER (f2 5a6847ffe): castBots --stage 2-7 --seeds 1-40 --bots adult,child,middle,expert --setting both --par 4 --proven =
**29/40** (bar 24): adult N 37, adult E 40, child N 36 (out 6,16,26,29), child E 39 (4), middle N 36 (7,10,17,33), middle E 40, expert N 39
(7). Baseline before BOT27b 23/40 (child N 29). LIST: seedlist.ts 2-7 = 100 of 100 tried, quiet 1.1 s, version dcdc8f40; --check PASS
(verdicts refuse 0 of 100); castBots --seeds 1-100 ON THE LIST = **69/100** (bar 60): adult N 96 (3 under the floor), adult E 100, child N
84, child E 89, middle N 98, middle E 100, expert N 100. All sent to the lead.
RUNNING at handover on f3 42a5e6ef9 (early, to catch tests that lay 2-7 as a draft now it is listed, D114): the unit suite -> scratchpad
suite-f3.txt; the CI tool line (gates.yml:157) -> scratchpad tool-f3.txt. If the session is gone, they are UNRUN: re-run them.
NEXT, in order:
1. When t-eng-27 carries ENG-BOT27b (lead: by 4:05 PM ET), `git merge origin/t-eng-27` into t-build-27e: it must add no code
   (`git diff 42a5e6ef9 HEAD -- src tools` empty but merge bookkeeping); if it adds code, re-run the ship number.
2. When DRESS-27b lands (lead: about 4:30 PM ET; DRESS-27's items 1-3 are on t-eng-27-wip-dress; 2-7 pristine breaks drawcheck at 6
   points, DRESS-27b fixes them), merge it, take a NEW frozen tree = THE FINAL HEAD.
3. On the final head, ONCE: the unit suite (CLAUDE.md list, timeout 7200000, background) and the CI tool line (gates.yml:157) and
   tierBots (gates.yml:168), drawcheck, clipcheck, registrycheck; tsc; also seedlist 2-7 --check again only if src changed under it.
4. Final stills on the final tree's dev server (`npx vite --port 4318 --strictPort --host 127.0.0.1`; PW=/opt/node-tools/node_modules/
   playwright/index.mjs): BUILD-27d's command (section below, "Final stills"), DIFF=normal and DIFF=easy, upright and sideways, the weir
   pool zoomed, the porches. The list is now in: stills/clip take seeds as LIST VARIANTS (set LAYOUT; the rig refuses a built seed that
   is not the record's): re-record racerec with the variant the puppet builds.
5. The race clip: probes27d/racerec.mts + racepuppet.mjs (BUILD-27d's step (d) below): win take (Dot's line on screen, no card over it;
   name the frame) and a lose take; ffmpeg -framerate 15 -> mp4.
6. Send the lead: hash, yield (29/40; list 69/100), the gate lines with PASS/FAIL and suite totals, the clip path, the stills' paths.
Process slip to own: one command in this session used a shell '&' (seedlist --check beside castBots on f3); both finished, verdicts read.

## BUILD-27d (finishing; started 2:25 PM ET 11-23 by `date`; report by 3:50 PM ET; hard stop 4:35 PM ET; box 28 min / 320k)
### EXACT NEXT STEP (BUILD-27d's; read this first)
**Trial head: t-build-27-trial f18614471** = t-build-27-wip 3ad0a77e2 (BUILD-27c's last) + a TRIAL merge of t-eng-27-wip-hud 64831cbe1 (NOT
landed; clean merge) + my commits: 92fcae5bf way.2-7 -> dotOn (then 361599287: on 'post:letter:4', see below), d1df3070b judged flip (3 lines:
stageTable '2-7' judged:'normal-2-7'; judgedTable.test's two JUDGED lists), the clip rig and dry-run stills. **When the lead sends the LANDED
t-eng-27 hashes: on a fresh branch from t-build-27-wip, merge t-eng-27 (with ENG-HUD27b + ENG-BOT27b), then cherry-pick 92fcae5bf 361599287
d1df3070b and the probes27d/dry27d commits (04db57dc9 f18614471 and the rig ones before them); drop the trial merge 533e28c29.**
Waiting on (lead, 11-23): ENG-HUD27b fixes the LAY side (pipeline.ts:3826 wet order by met order; :4610 hint match either way), due ~3:35 PM;
ENG-BOT27b = R1 on the child bot only, lands ~3:20 PM; then DRESS-27 (weir seam, pole, porch posts) after both: the final clip and stills
come AFTER DRESS-27.
Then, in order: (a) `npx tsx reference/qa-reports/BUILD-27/probes27d/errs.mts 1-12` must print `[]` on every roll both settings with judged
flipped; w2Arc27.test 10/10, judgedTable.test, easyMode.test; (b) a NEW chattr-frozen tree at that head (node_modules: `npm ci
--legacy-peer-deps` once, symlink it), castBots --stage 2-7 --seeds 1-40 --bots adult,child,middle,expert --setting both --par 4 --rows ..
--proven .. = the ship number (bar 24/40), send the lead; (c) the list: seedlist.ts 2-7 (100), --check, castBots --proven on the list;
registrycheck; (d) the clip: dev server `npx vite --port 4318 --strictPort --host 127.0.0.1` on the frozen tree; `npx tsx
probes27d/racerec.mts adult normal 1 <rec.json> 3300`, `LIVE=1 FROM=3450 PW=/opt/node-tools/node_modules/playwright/index.mjs node
probes27d/racepuppet.mjs 4318 <rec.json> <dir> side 60 150` (FROM/TO are ENGINE frames), ffmpeg -framerate 15 -> mp4; lose take: child normal
seed 1 rec from 11450, FROM=11600 (verdict 11758). Check the seed the puppet BUILT is the record's (it refuses otherwise; after the list,
set LAYOUT); (e) the gates on the final head ONCE (unit suite + CI tool line + drawcheck, clipcheck, tierBots, registrycheck).
DONE so far (BUILD-27d):
1. Trial merge of ENG-HUD27b: clean. With it and judged NOT flipped, easyMode.test 6/6 GREEN (BUILD-27c's red (i) gone).
2. FOUND (sent, the lead routed it to ENG-HUD27b): with the verdict fix and judged flipped EVERY roll 1-12 both settings fails
   "drop.unwarned: the first water at x 12948..13508 has no Dot line": pipeline.ts:3826 lays WATER_WARN at the least-x wet gap (probes27d/errs.mts).
3. way.2-7 on 'post:letter' measured in real play (probes27d/postmoment.mts): the 1st letter is posted at t2.3-3.9 s, x4756-5087, ON the
   jetty's opening (seed 1: handover line x5023, letter x5087; seed 2: 368 px before the handover). 5 doors on every roll 1-40 both settings;
   letter k's worst x past the race line (doorx.txt): -795, -365, +245, +1065, +1815 (855 = 3 s at a full run). DECIDED: dotOn('post:letter:4',
   words verbatim) (361599287; lead told, may overrule); new w2Arc27.test case holds it on every roll, RED on letter 1 (planted), GREEN on 4.
   Real run: adult N seed 1 letter 4 at t17.3 s x7991; seed 2 t11.2 s x6614.
4. Clip rig made tree-relative and fixed (probes27d/racerec.mts, racepuppet.mjs: FROM/TO/verdict now ENGINE frames, built-seed check,
   caption names who won). Dry run on frozen /home/user/wt-b27d-f0 (trial head minus the flip): WIN adult N seed 1 frame 3615, Dot's win line
   on screen, no wayside card (dry27d/win-adult-n1-f3630-line.jpg); LOSE child N seed 1 frame 11758 (him 107.7 s, boat 89.28), Pokey's line,
   boat docked (dry27d/lose-child-n1-f11764-line.jpg). Route bar in play 0.947 at the win, 0.999 at the totem (probes27d/barprobe.mts).
5. Bots on the trial head (postmoment.mts): child Normal LOSES the race seeds 1-6 (101-114 s vs 88-90 s); middle Normal wins 6/6 (55-69 s).
6. Checks on frozen /home/user/wt-b27d-f0 (trial head minus the flip, local revert 36abf30ef): tsc PASS; w2Arc27.test 9/9 (with the new
   letter-4 case); castMoments, dotLines, dotTips, lessons, pokeyJournal, storyStyle, wayside tests 83/83; easyMode 6/6. NOT run yet (owed on
   the FINAL head, once): the unit suite, the CI tool line, drawcheck, clipcheck, tierBots, registrycheck, the build/chunk/perf gates.
7. Lead agreed 'post:letter:4' (its message: every roll lays 5 doors; clear of the handover and the finish).
Final stills (after DRESS-27), on the frozen final tree's dev server: `PW=... DIFF=normal node probes27c/stills-live.mjs 4318 <out> n27 2-7 <layout>
4960:high 6780:high 9080:high 11376:high 13508:high 14928:high 15738:high 14208:low 12090:low 9972:low 8500:low 5800:low 2459:low 800:low`
(and DIFF=easy with BUILD-27c's Easy x list), upright and sideways come out of the tool; LIVE=1 for one jetty still with the lines live.
Learned (so far, for level.md): (a) a story line set `on` a moment must be measured in real play against the stage's other lines before it is
picked (the 1st letter fell on the handover); a test holds the gap on every roll, not one seed. (b) A clip rig that replays a cut recording
must index by engine frame, not array position, and its caption must read the verdict, not assume a win. (c) D130's "first by x" also lives
in the WATER_WARN lay (pipeline.ts:3826): any verdict fix on order needs its lay twin checked the same day.

## BUILD-27c (finishing; started 2:03 PM ET 11-23 by `date`; report by 3:35 PM ET; box 28 min / 320k)
### EXACT NEXT STEP (BUILD-27c's; read this first). BUILD-27c handed over at its 28-minute box.
Head: t-build-27-wip (this commit) = 481203add + t-eng-27 e2f3855cf (f5810bbff; one conflict, pipeline.ts layChaseStage's return: both
ENG-JETTY's `ended.problems` and the column dress kept) + d9913b17d (race-end wiring) + ed23d3087 (flown rows). Frozen tree
/home/user/wt-b27c-f1 = d9913b17d (chattr +i on src, tools; node_modules symlinked from /home/user/wt-b27c, installed `npm ci
--legacy-peer-deps` as CI does; a plain `npm ci` fails ERESOLVE). PW for every browser tool: PW=/opt/node-tools/node_modules/playwright/index.mjs.
Dev server (window.__play is DEV-only, so stills need `npx vite`, not preview): port 4318 from wt-b27c-f1.
**RUNNING at handover (read first):** (1) the suite on frozen f1 d9913b17d -> scratchpad suite1.txt (final count; reds sorted in 6);
(2) the gates on frozen /home/user/wt-b27c-f2 = 6a87b7d58 -> scratchpad gates-f2.txt: BASE_PATH vite build, chunkcheck, buildcheck,
engine tools' tests, seedlist 1-1 --check, kbdcheck. Gates PASS already on the head: tsc, knowncheck, generalitycheck, roadmapcheck
(after `git fetch --unshallow`), artcheck. Still owed on the FINAL head: drawcheck (~6 min), clipcheck (~4 min), tierBots (~40 s), the
whole suite again, registrycheck (fails until the list and judged land: expected).
**LEAD (on the clip):** 'post:letter' is built on t-eng-27-wip-hud 2ca3de9b5 and lands on t-eng-27 with ENG-HUD27b (with the
route-order fix). When it lands: way.2-7 -> dotOn('post:letter', the same words verbatim), then re-shoot ONLY the race finish (the last
stretch to the jetty, the win line on screen with no wayside card over it; racepuppet.mjs FROM ~3450 on a fresh racerec of the new head)
plus a LOSE take if cheap (record a bot that loses, e.g. child Normal, with racerec.mts). That clip is the proof Matt sees. Race margin
stays as ruled (ENG-27w); the castBots x40 rows do NOT hold race margins (cast: null), so no per-bot margin table: no new runs for it
(lead). The verdict-with-no-race edge is filed (Lane 2), not tonight.
**FIRST after that:** merge ENG-BOT27 (and ENG-HUD27) when the lead sends their hashes; then wayside.ts:101 `7: dotOn('post:letter', <the same
words verbatim>)`, held in w2Arc27.test; re-run `castBots --stage 2-7 --seeds 1-40 --bots adult,child,middle,expert --setting both
--par 4 --rows .. --proven ..` on a NEW frozen tree at that head: that is the ship number (lead). The lead measured ENG-BOT27 R1 at 33/40.
**Blocked on engine (sent to the lead, owner asked):** (i) easyMode.ts:518-536 (Easy's flag fill by x-gap + `cps.sort` by x) makes the suite
RED on 2-7 (easyMode.test "checkpoints are out of order"; play not broken: engine.ts:3018 claims by flagFurther); (ii) verdicts.ts:142
picks the "first water" by x, so `judged: 'normal-2-7'` fails w2Arc27's arc test (drop.unwarned at x1766, the home leg's last river).
When (ii) lands: flip the 3 lines (stageTable '2-7' judged:'normal-2-7'; judgedTable.test.ts's two JUDGED lists + '2-7': 'normal-2-7'),
w2Arc27.test green, registrycheck, THEN the list: `seedlist.ts 2-7`, `--check`, castBots --proven on the list (judge BEFORE listing).
1. DONE d9913b17d: LINES_27 win/lose verbatim; BRIEF_27.raceEnd {win w27.win Dot, lose w27.lose Pokey}; storyTips (STORY_27) handover/race
   Dot. w2Arc27.test new case: 8/8 GREEN, RED with raceEnd and storyTips removed. tsc clean.
2. DONE, sent: the yield on d9913b17d (castBots-27c-d9913b17d.txt/.jsonl): PROVEN 23/40; 0 under 2:00 (adult N min 121.5, E 121.8).
   adult N 37 (3,11,30), adult E 40, child N 27, child E 39 (8), middle N 37 (9,10,20), middle E 39 (22), expert N 40.
   Traced (probes27c/ftrace.mts, rtrace.mts; rescues-27c.txt): adult N 11 / middle N 9 run across a log flowing at him and off its far tail
   on `upstream` (x12982); adult N 30 / 3 jump at a drifting log where it IS, land ~30 px short on the home stilts (x5922); middle stalls
   ("water ahead" x9455, x14620; "nothing in the way" x6818); middle E 22 walks off a lip into a 78 px gap (x12749). All bot: sent, the lead
   has ENG-BOT27 covering them.
3. DONE ed23d3087: flown on Normal (fly-2-7.txt; parser probes27c/flyrows.py reproduces 2-5's committed rows exactly): rows normal-2-7
   in flownArcs.ts and chain.md §1 (a few px under 2-5's). `judged` held (above).
4. Suite on d9913b17d (scratchpad suite1.txt, was RUNNING at handover): 1 red so far, easyMode (i). Re-read its tail for the final count.
5. STILLS (lead: shoot now; rule 29 waived by the lead) on d9913b17d, seed 1 (BUILT seed 1 rerolls 0), 2x: stills27c/ (56 when done),
   Normal x 4960 6780 9080 11376 13508 14928 15738 (high: out leg) 14208 12090 9972 8500 5800 2459 800 (low: home leg); Easy x 5419 7239
   9553 12002 14205 15685 16495 / 14965 12799 10585 8900 6181 2657 800. Looked at: x13508 up, x12090 up, x15738 side, x11376 side.
   Findings: (a) porches x11376: rope-tied planks with no posts or hangers read as floating over the race (BUILD-27b's (f) HOLDS: name it);
   (b) weir x15738 side: the column's foot ends in a hard dark band at the pool line (the seam, BUILD-27b's (d)); still OWED: a zoomed
   shot of the weir's pool line (the falls' face, x ~15950 Normal) and the jetty lines on default settings (handover/race at the start:
   a still with hints LIVE, i.e. without stills-at's `hh.shown = true`).
6. DONE 7583d9a0b, THE RACE CLIP: race27c-adult-normal-seed1-side.mp4 (sideways, 15 fps 2x, 13.6 MB; key frames race27c/). Method:
   probes27c/racerec.mts records a bot run (his fields, every drifting log by engine.platforms index, the pacer piece) and
   probes27c/racepuppet.mjs replays it into the real game on the dev server (engine stepped each frame, so the race-end hook fires on the
   real verdict); env FROM/TO pick frames, LIVE=1 leaves Dot's hints live. Adult Normal seed 1: race starts frame 2206 (t73.6, x12327);
   HE WINS at engine frame 3615 = clip still f00734 (x1750; him 47 s, boat 89.28 s). **FINDING (sent): the win line never shows in the
   clip**: way.2-7 ('half') fires at the finish (f00734) with its tap-to-read card and holds to the exit door (f00812); the win line waits
   behind it. The hook works (stills27c x800 shows Dot's win line with no wayside line up). So 'post:letter' (ENG-HUD27) is REQUIRED.
   Also sent: adult beats the boat by 42 s (design intent?); a dock teleport gives a WIN with the race never started (unreachable in play).
   LIVE STILLS (stills27c-live/, probes27c/stills-live.mjs = stills-at-setting without hints-shown/clearGuide): x5500 shows `race` as Dot's
   story card on Normal's default Tips (storyTips works in the game); x15950 shows `turn` at the weir. x5060 showed NO handover card (a
   teleport artefact): PROVEN by a LIVE replay from the spawn (LIVE=1 FROM=0 TO=420): `handover` shows as Dot's story card at frame 140
   (t4.7 s, race27c/start-f00070-handover-live.jpg), `race` after it. No WATER_WARN card at the spawn on Normal (f00010): ENG-JETTY's
   known item (World 2's water warning is a plain tip, dropped on Tips; sent to the lead for release 4), not 2-7's.
   WEIR ZOOM: stills27c-live/zoom-weir-pool-normal-x15950-sideways.png: a hard thin dark line with coloured specks along the pool surface
   across the whole falls (BUILD-27b's (d) HOLDS): name it to the lead as a polish defect (the weir dress's foot / the pool sheen seam);
   also the climbing pole stands in front of the falls. Porches x11376: floating rope-tied planks (BUILD-27b's (f) HOLDS).
   SUITE on frozen d9913b17d (suite1.txt; still running at handover, 1743+ tests): reds (a) easyMode 2-7 (engine, ENG-HUD27 takes it);
   (b) pacerLay.test.ts "bot (planted)" x2: IDENTICAL on the base e2f3855cf (pacer-base.txt: 21 pass, 2 fail): t-eng-27's, not my merge;
   (c) seedListChunk EPERM: the freeze (it writes into src); unfrozen on the head 2/2 PASS. Read suite1.txt's final count when it ends.
7. Then the full gate set on the final head (CLAUDE.md list; gates.md), the LEVEL-LOG row (kid table), Learned.

## BUILD-27b (continuing; started 1:05 PM ET 11-23 by `date`; report by 2:40 PM ET)
### EXACT NEXT STEP (BUILD-27b's; read this, not BUILD-27's below, for what is left). BUILD-27b stopped at its 28-minute box.
NOW: nothing laid is waiting on me; 2-7 waits on the lead's hashes (ENG-JETTY: the w2.ts:372 finish fix, the race-end win/lose line,
StageHint story; ENG-BOT27: the child's log footing; the 'post:letter' moment if the lead orders it). The first thing on their landing is
step 5 below.
Head: this commit on t-build-27-wip. Scratch tree (not in the repo): /home/user/wt-b27-y = e531bce46 + the w2.ts:372 y-band fix, chattr
frozen (unfreeze with chattr -R -i before removing). Probes: scratchpad/probe/trace.mts (frames before each life lost or set-down:
`npx tsx trace.mts <bot> <setting> <seed> <n> [stuck]`, run from the scratch tree) and kidloc.mts (each set-down's leg and beat).
1. DONE 0a010f11e: catalog dupes; inventory.test 10/10 (census 218: ENG-27 packed 8 of batch 1).
2. DONE, sent: the yield on fafd18d05 + fix (a): PROVEN 2/40, 24/40 without the kid; 0 runs under 2:00. Child Normal's rescues: a BOT
   fault (walks off the lip onto a log tail sliding under the bank on `upstream`; jumps from mid-log on keep-running) -> ENG-JETTY item 4,
   landing on t-eng-27 by about 3:15 PM (lead). Not mine to fix.
3. Kid EASY 27/40 (lead: must pass): a data candidate (Easy's at-him rows on their own row back27e: logs 200, gap 70, 70 px/s) FAILED
   and is REVERTED (0293f6eb2; src equal to 0a010f11e): kid Easy 27/40 again, 2 kid runs under 2:00, child Easy 38 -> 36. Kid Easy's
   misses are 1 rescue each over 8 beats: the kid model (FT_KID) on moving logs (untimed jumps into gaps, walking off log ends), on
   every World 2 river. Sent to the lead for a ruling (bot item for ENG-JETTY or Easy's drift catch). Do not try another stage row.
4. Kid NORMAL 6/40 LOCATED and sent (the lead rules, LEAD-PERSONA): 49 set-downs on 34 seeds: out at-him 17, out upstream 14, home
   stilts 11, keep-running 2, with 2, neck 1, other 2 (scratchpad kidN-loc.jsonl). The same kid-on-logs cause as 3.
   LEAD RULINGS (on receipt of 3 and 4): kid Normal ACCEPTED as located and honest (LEAD-PERSONA); kid Easy ACCEPTED for tonight on
   2-5's footing (R-165.339), filed by the lead as its own World 2 job (should Easy forgive a kid walking off a moving log's end). So the
   proven list needs adult, middle, expert and child on BOTH settings with 0 rescues: `castBots --bots adult,child,middle,expert --proven`.
   The kid table goes in the LEVEL-LOG row.
   STILLS PRE-LOOK (lead allowed; NOT the final set, rule 29: reshoot on the GREEN head): seed 1, both settings, both ways 2x, on
   scratch 0a010f11e + fix (a), 52 stills in the scratchpad (stills/n27-*, e27-*). Seen: jetty/doors, at-him, upstream, weir, bend, home
   jetty (Normal); upstream (Easy). Findings: (a) `way.2-7` (the keeper's kept wayside line) speaks AT THE HOME JETTY (x1000), where
   win/lose will speak once ENG-JETTY's race-end line lands: a collision to settle with the lead/keeper before wiring win/lose.
   (b) My x picks for porches (11100) and stilts (5600) missed their pieces (11100 is between planks, so "high" fell to the home bank):
   pick each beat's x ON a piece from the built platforms (probe porch.mts), never by the section's span. Reshot porches at 11200.
   (c) The home rivers' logs ride low under the water sheen: World 2's deep-river art (the same on `upstream`), intended, not a defect.
   (d) The weir: the falls' foot has a hard horizontal seam with coloured specks at the pool line (x15800 upright): judge it zoomed on
   the final set. (e) Upright, the home leg sits under the out leg's soil slab (x10000): the slab's lower edge is ragged; stacked-leg look.
   way.2-7: the lead ruled (A), move it to the walk out at the doors, words verbatim. NOT doable by data: a wayside line is placed by
   WHEN (wayside.ts StageWay.at start/half/near/on a moment); the only moments are 'cast:*' (engine.ts:4878). Sent ENGINE-WORTHY: a
   moment when the post takes a letter (e.g. 'post:letter'), then wayside.ts:101 `7: dotOn('post:letter', <same words>)`, held in
   w2Arc27.test. Until then it stays 'half' (the HUD distance ratio >= 0.5, engine.ts:3732; on the out-and-back, not yet measured
   where: offered the lead an adult-bot measure). (f) Porches (n27p x11200): rope-tied planks over the race with no posts or hangers to
   the bank houses: they read as floating planks. Judge on the final set; name it to the lead if it holds.
   'half' MEASURED (adult seed 1, probe half.mts: onGuide lines + onProgressUpdate ratio): Normal half t125.0 x2139 (home neck, ~9 s
   before the jetty; run 134.4 s); Easy t119.3 x2367 (~7 s before; 126.8 s). Lines: WATER_WARN t0.2 (Normal only), handover t2.4, race
   t3.8, turn t53.2. Sent: 'half' lands mid-race (keeper note 3) -> 'post:letter' to engine. Also sent: (1) ENGINE-WORTHY, the HUD
   progress bar on an out-and-back does not move for the whole out leg (x from start to exit, engine.ts:3732); (2) WATER_WARN -> handover
   only 2.2 s apart on Normal: I offered to move the t-handover socket (w2Arc27.ts:122, 'a' 0.35) so the handover starts 3+ s after it.
   (2) DONE e531bce46 (lead: WATER_WARN stays, the handover moves): handover on the jetty's bank b at 0.15, race on z at 0.3; new test
   "handover starts 3 s at a full run after any other line" was RED on the old socket (614 px < 855), GREEN now; w2Arc27.test 7/7;
   24/24 rolls clean. 'post:letter' and the route-measured HUD bar: engine, landing on t-eng-27 (lead); then wayside.ts:101 -> dotOn.
5. When the lead sends ENG-JETTY's and ENG-BOT27's hashes (the w2.ts:372 fix, the race-end line, StageHint story, the child bot fix): merge into t-build-27-wip;
   wire `w27.win`/`w27.lose` (lines-2-7.md:24-25, verbatim) on the race-end hook, set story on handover/race; hold all four in
   w2Arc27.test; the whole suite + the CI tool line on a frozen head; castBots --proven 1-40 both settings; then the list (seedlist 2-7,
   --check, castBots --proven on the list), the flight for `judged`, registrycheck, stills of every beat both ways 2x both settings
   (the jetty's with the lines on default settings), the race clip (name the frame he wins), the full gate set.

## EXACT NEXT STEP (handover to BUILD-27b; BUILD-27 stopped at 1:03 PM ET at about 372k context. Head: see the commit that adds this)
LAID on t-build-27-wip: w2Arc27.ts (kit w2-27, stageTable row, listed.ts), the hand build deleted, the keeper's words (minus win/lose),
w2Arc27.test 6/6, planted-faults.py 7 plants (6/6 CAUGHT on 32b01afee; the 7th, turn, was added after that run and is not yet run),
limits.json scenario 2-7.
1. **Inventory red, from MY merge (fix first, minutes):** reference/art/CATALOG-MASTER.csv holds 8 DUPLICATE ids after the merge:
   w2-next#weir/doorOpen/letter/letterB/reply/replyB/mailBoat/mailBoatB (t-eng-27's rows and t-ready-27-wip's both kept). Keep the row
   equal to `git show origin/t-ready-27-wip:reference/art/CATALOG-MASTER.csv` (READY updated kb/cost and added the weir), drop the other,
   then `python3 tools/art/catalog_master.py --emit`. Then `npx tsx --test src/game/art/inventory.test.ts` must be 10/10 (main, t-eng-27
   and t-ready-27-wip are each 10/10; this head is 8/10: 9573 vs 9581 rows, 218 vs 226 images).
2. **Wait for ENG-JETTY's two landings on t-eng-27** (merge each into t-build-27 the moment it lands):
   (a) the World 2 finish fix, w2.ts:372 (`&& !lows.some((l) => p.y >= l.y0 - 2 && p.y <= l.y1 + 2)`: a soft fall must not drop the run
   leg stacked under it). Without it the home leg's bounce-bend banks vanish in play and every bot is rescued (0/40).
   (b) the jetty hook for the keeper's `win`/`lose`; wire 2-7's line ids for those two (lines-2-7.md asks 4) and hold them in w2Arc27.test.
3. **Then the yield:** castBots --proven, seeds 1-40, both settings, on a chattr-frozen tree; send it to the lead. Measured on a SCRATCH
   tree (32b01afee + fix (a), NOT committed): 1/40 proven. Cause 1: the quick adult finished under the 120 s floor (35 runs). Cause 2:
   the adult walked off the last porch plank (Normal seed 19). Both are addressed in fafd18d05 (a second reach on 'with' and on the
   signature: model fast 148 -> 163 s; the porch walk lands level, then a walked step down). The re-measure (scratch: fafd18d05's
   w2Arc27.ts + fix (a)) was RUNNING when I stopped; the successor runs it again. Left to trace after it (rule 28): kid/child falls on
   the out leg's rivers flowing at him (at-him x~7200-7500, upstream x~11150-11700). The kid is not the bar (rule 4); the proven list wants
   every bot, so report the yield with and without the kid.
4. **Suite:** the full unit suite on 32b01afee had 5 reds when I stopped (it was still running): inventory x2 (step 1), and three for 2-7
   at the bend (easyMode "checkpoints out of order" on Easy, heart at the flag 10128, flower at (9225,1434)), which step 2(a) should clear.
   Re-run the whole suite after step 2.
5. Then the list (`seedlist.ts 2-7`, `--check`, castBots --proven on the list), the flight for `judged` (`FLIGHT_STAGE=2-7 npx tsx
   reference/specs/sims/flight.ts normal all`, its rows into flownArcs.ts n27, then judged: 'normal-2-7'), registrycheck, the stills
   (every beat both ways 2x both settings, after the bots go green: rule 29), THE race clip, the full gate set.
Probes I used (scratch, not in the repo): the played-vs-built platform diff (firstTimer onFrame -> sim.stage.platforms vs libstage
buildStage) and the teleport trace (firstTimer onFrame: a jump of 150+ px in one frame is a respawn or a rescue).
## Ship verdict (step 1, D125)
| Head | castBots --proven 1-40, both settings, every bot | Cause |
|---|---|---|
| 7c040dfd4 | 0/40, discarded: the bots played the OLD hand build (w2Stages W2_STAGES['2-7'] wins first, stageGenerator.ts:2935) | Hand build still registered |
| 32b01afee | **0/40**: every bot, every seed, reaches the shrine with 1+ rescue (Easy: no lives lost, so one fixed spot) | World 2's finish (w2.ts:372) drops every solid under a SOFT fall at any depth. The out leg's porch-walk pits lie over the home leg's bounce bend, so its three banks are deleted in play (played-vs-built diff, Easy seed 2: 10078+340@1501, 9690+388@1325, 9390+300@1415). ENGINE-WORTHY, sent to the lead; ENG-JETTY is fixing it. |
| scratch: 32b01afee + fix (a), not committed | 1/40; without the kid 8/40. Under the 2:00 floor: adult Easy 23, adult Normal 12. Rescues: child Normal 5, adult Normal 5, child Easy 2, middle 1. Others PASS 35-40/40 | floor and porch walk-off, addressed in fafd18d05 |
## Done-items
1. Ship verdict: above (RED; cause traced, fix with engine). 2. Stage: w2Arc27.ts on its own row (kit `w2-27`): the arc, the boat
   (W2_RACE), the post (5 doors), the weir dress, the keeper's words (handover, race, turn, mission, journal page, find). The hand build is
   DELETED: W2_STAGES '2-7', its plan, flavours, the basket lift, mailman, doors, village end and drop builders, the frames and lift kinds,
   hint.2-7.basket/frames/open/porches (way.2-7 kept). liftRide.test and w2Stages.test re-pinned; stageSheets has no gold snake on 2-7.
   w2Arc27.test 5/5. planted-faults.py: 6/6 CAUGHT. 3-5: owed (blocked on the fix).
## Design changes (lead-accepted forks)
- The weir is laid `Dc_` (a column, which the weir's dress needs) for `Dg1_`. Its drops are walked step-downs: a jump gap in a column made
  World 2's finish throw on 2 of 12 rolls; now 40/40 build.
- `upstream` and `logs at him` are each laid as two in-sight reaches with a bank between. One 924 px reach flowing at him breaks riverLay's
  view rule, and one reach left the quick player under 2:00 (fast 130 s, floor 143). Now typical 175 s, fast 148 s, Easy fast 152 s.
- **5 doors, not 6.** Matt's rolled flags (8 on the out leg, 140 px clear each) leave room for 6 on about half the rolls; 5 doors: 22/24 clean.
## Gates (head 32b01afee)
| Gate | Verdict |
|---|---|
| tsc / generalitycheck / knowncheck / artcheck | PASS / PASS / PASS / PASS |
| registrycheck | FAIL, owed by me: no list yet; no drawcheck scenario; row not `judged` |
| roadmapcheck | FAIL: shallow clone, proofs cannot be checked (inherited; the same on main in this container) |
| unit suite (32b01afee) | 5 reds when I stopped: inventory x2 (my merge, step 1); 2-7 at the bend x3 (step 2a) |
## Polish check
BUILD-27b: a pre-look only (see 4 'STILLS PRE-LOOK', items a-f); the final check is on the GREEN head. BUILD-27:
None yet. Rule 29: no stills while the bots are red. The lead allowed stills of the beats the bend does not touch; they are next.
## Pushback
1. The design's 6 doors do not fit with Matt's rolled flags (above). 2. The design's 924 px `upstream` breaks the view rule (above).
## Unresolved
- win/lose at the jetty: no hook (ENG-JETTY). lift.ts is exists-unwired (no stage lays a basket lift; only its unit tests hold it).
- 2-7 has no `judged` flown scope (registrycheck): `FLIGHT_STAGE=2-7 npx tsx reference/specs/sims/flight.ts normal all` is owed.
## Learned (for the next builder)
- (BUILD-27b) **Check a river row against the river's own rules before running bots on it.** A slower Easy row (55 px/s) made one log
  every 5.1 s, over the 4 s rule, and no Easy roll laid; roll 12 seeds (libstage --json) first, seconds, not a 2-minute bot run.
  Proposed: riverLay's row check (log every <= 4 s) also runs on a kit's RIVERS table in the kit's own test.
- (BUILD-27b) **A stage's bad yield is often the bot, not the stage: trace before changing data.** Two frames-before-the-fall traces
  showed child Normal walking onto a log tail sliding under the bank (bot), and kid Easy spread one rescue each over 8 beats (the kid
  model on every river). My Easy data change moved the misses and was reverted. Trace two runs per cause FIRST (rule 28).
- (BUILD-27b) **castBots rows drop each stuck spot's y**, so on an out-and-back the two legs share x and a cluster by x is ambiguous.
  Proposed: castBots keeps y (and the beat) in its rows. Meanwhile scratchpad probe kidloc.mts maps a set-down to its leg and beat.
- (BUILD-27b) **Pick a still's x ON a piece from the built platforms**, never by a section's span: 11100 fell between two planks.
- (BUILD-27b) **A wayside line is placed by when, not where:** on an out-and-back 'half' is a distance ratio, not a place. A
  stage that wants a line at a piece needs a named moment.
Lessons applied (BUILD-27b): D115 (frozen scratch trees), D123 (runs in the background, 7200000), D125 (yield first), D59 (no run left
running at stop: none left besides the dev server, stopped), D111 (box, exact next step), D127 (bot and engine gaps sent the same minute).
- **Delete the hand build BEFORE the first bot run.** w2Stages' W2_STAGES wins over the stage table (stageGenerator.ts:2935), so the bots
  play the old stage while the build probes show the new one. Proposed rule: addlevel refuses a row whose id a hand-build table still holds.
- **Judge the PLAYED stage, not the built one** (rule 27 goes further than built-vs-data): libstage's buildStage keeps platforms that the
  played finish deletes. Diff the played stage's platforms (firstTimer onFrame, sim.stage) against buildStage's before tracing a bot.
- An out-and-back stage stacks one leg under the other. Every world finish rule that works by x span (drop, fill, reeds) must also check
  the y band. Proposed check: a planted stacked-leg toy through each world's finish.
