# ENG-27d REPORT (handed over at the lead's D76 call, real context ~339k; written 12:59 PM ET 11-21 by date). Base 0eefc707e; branch t-eng-27
## EXACT NEXT STEP (ENG-27e, from t-eng-27 head; read only this section, D90)
0. Setup as ENG-27c's step 1 (npm install --legacy-peer-deps, restore package-lock.json). Probes kept here as .txt (copy to tools/inspect/
   with a leading underscore, never commit them): raceprobe-27d.ts.txt (`npx tsx tools/inspect/_raceprobe.ts middle|expert|ride home|post
   [seeds]`; expert has no Easy bot, so its Easy rows throw), racestart-27d.ts.txt (per-frame x/y/down/clock/checkpoint/softAt in a frame
   window), racetrace-27d.ts.txt (the bot's time at each flown mark against the estimate), jumps-27d.ts.txt (every frame he moves > 150 px).
   Stills: race-stills-27d.mjs (DSF=2 for 2x; PW=/opt/node-tools/node_modules/playwright/index.mjs; vite on 5199; shoot on-river spots LAST:
   a spot on a log carries him on the next spot).
1. **THE EASY PUT-BACK (the lead's ruling: fix it in this packet, Option 1; a PLAY change, so rule 28 applies).** Symptom: HOME_CODE Easy
   seed 2, middle bot: on the race leg he drops into the dip at x 14724-14821 (moss_stone piece id 42, top 1530, h 90; banks 14486-14724 and
   14821-15189 at 1470) and at frame 2584 he is set at (14891, 680), on the OUT leg's piece 14822-15102 (id 10), with no life lost and no
   bot rescue (rescues 0). The boat keeps racing, he walks the out leg and the column again, and he loses by 0.08 s. Same jump at frame 4112.
   What it is NOT: softFall/heartFall's softAt. softAt was ON the race leg {x 15000, y 1470, x0 14821, x1 15189} at frames 2570-2583,
   and only became (14891, 680) at frame 2585, after he stood there. No river, no safe pool (st.safeWater null), no down beat.
   NEXT CHECK: what moves him in the frame he is at (14788, 1500) falling into the dip. Suspects, by x alone on a stacked leg: (a) the
   side-push / unstick out of a solid's box (he enters id 42's box from the side and the push puts him on the top of the platform found
   by x: id 10 at 680); (b) a step-up or ledge-grab that picks the top surface at x without his y; (c) a kit's pit/pond set-back (w2Finish).
   Method: in racestart, at frame 2583 copy the engine, step once with a recorder on player.x/y writes, or grep engine.ts for code that
   sets p.y from a platform's y and a find() by x alone (`q.x <= p.x` without `q.y` near `p.y`). Fix the lookup to his leg (as ENG-27b
   did for riverAt), planted RED on this frame (a test: after the race leg's first flag, no frame lifts him from y >= Pacer.yMin to
   y < yMin without a lost life). The flag-as-put-back line the lead approved is NOT made: softAt was right, so it was not the cause;
   make it only if the trace shows a put-back reads softAt.
   Rule 28 after the fix: tierBots 1-1 still 9/9 (npx tsx --test tools/inspect/tierBots.test.ts) and a row-for-row castBots diff on Easy
   for the stages with committed rows (2-3: BUILD-23e rows on origin/t-build-23; 2-5 if on this base). Trace any moved row or narrow the fix.
2. **Then the race table, both settings, after the fix:** raceprobe on home and post, seeds 1-6, middle / expert / ride. Every number in
   the table; name the middle's thinnest win; any middle loss at 7%: which roll and why (racetrace: the mark where he falls behind,
   respawns, log waits). Then `npx tsx --test src/game/gen2/pacerLay.test.ts` must be 4/4 (its bot test is RED today on middle Easy seed 2,
   96.4 s against 96.32 s, from step 1's put-back). A table on lay (A) WITHOUT the fix ran into this session's scratch and is lost with
   it: do not quote it.
3. reference/handoffs/engine-core.md (step 5 of ENG-27d's packet, not reached): one line each on the pacer (shares, floor + cap, DOCKED 0),
   lay (A) (bow race point, wait and dock at far banks, pacerShoreFaults), layer 'under' (the lead's condition 3), the post (postLay's
   cuts, petals.ts marked letters), w2NextArt.ts, the home fixture (?fixture=home, DEV only), and the softAt finding from step 1.
4. THE FULL SET on the final head (gates.md D96; run-gates-27c.sh): lockall --layouts 16 vs 0eefc707e (only the toy may move), funcheck
   same-run vs main (World 1's 22 ruled lines are standing debt), drawcheck PASS (the lead's condition 2: 'under' adds one drawPieces pass
   over the pieces list, no draw on a stage without a pacer), the test-link floor. Any gate without a verdict is UNRUN.
5. Stills of the WAIT and the DOCK under lay (A) (the lead: "your stills show the start"): the boat waiting with its bow at the first wide
   river's far bank, him crossing beside it, and docked at the last wide river's far bank; both ways, 2x. Then THE CLIP (D63, ENG-27d's
   step 3, not reached): the race leg with the boat in every frame, both ways; the door and letter stills on the OUT leg (a HIGH pick).

## ENG-27d: what was done
- **Step 2, the boat behind the banks (2460568a9; the lead's ruling (a) and its follow-up):** a fifth piece layer 'under' in
  stagePiece.types.ts (doc: over the river's body, BEHIND the ground's earth and every platform), drawn once in render() before the drawn
  platforms, the water's sheet and the painted ground (no protoArt hook needed: the painted ground is drawn after all of them). The pacer
  is on 'under' and shows only over the race leg's water (pacerDraw.ts pacerWaters/pacerShown: clipped to each river's x0..x1), its
  waterline on THAT river's surface: the toy's leg has rivers 1427-1507 apart (seed 3), so the lane alone would sink it up to 80 px; its
  ~100 px over its waterline against banks 42-120 px over the lane would show over the grass without the clip. Planted
  (src/game/pacerBehindBanks.test.ts, 4 tests): RED with the boat on 'back' (drawn after the ground) and RED with the clip removed
  ('241 px of it over the bank 0-560: floating over the land'; the high river sinks it); pieceHook.test has 'under' in the frame order.
  Stills 2x, upright and sideways: stills-27d/1-slipping-behind-bank, 2-back-out-of-bank, 3-on-river (looked at: the bow goes under the
  bank's lip and reeds with no hard cut; the hull sits on the water; logs pass in front).
- **The lead's dock ruling, lay (A) (this head):** the race point is the boat's BOW (pacerDraw.ts pacerHull: the hull trails it,
  PACER_SHORE 20 px); gen2/pacerLay.ts waits it with its bow at the far bank of the race leg's FIRST river that holds it whole (its
  length from its art, pacerLength, + 20 px each end) and docks it at the far bank of the LAST such river, so the race is whole flown
  crossings (a first try timed from mid-river charged him a share of a log wait he never pays: the ride-only bot won by 0.5 s).
  pacerShoreFaults (general, by name): its hull at the wait and at the dock lies wholly over one river's water; planted RED in
  pacerLay.test on today's old ends (the column's foot and the exit, both on land). Pacer's doc updated. DOCKED 80 -> 0 (the lead
  accepted): the race is judged at the dock line; 80 px on a log was a free ~1 s (the ride-only bot won by 0.17 s on it); the lay
  test's dock check now asserts no verdict 20 px short and one at the line.
- **Found, not mine (the lead: a separate packet):** wherever the race leg runs UNDER the out leg, the out leg's painted earth is drawn
  down over it (protoArt ground soil runs to the foot): seed 1 POST_CODE x ~14000-18600, Pokey walks in front of solid earth and the
  river at 14173-14911 does not show. stills-27d/4-race-leg-under-out-leg-buried-x14950-*.jpg.

## Gates (this head): tsc PASS; pacerBehindBanks 4/4, pieceHook 8/8, pacerLay 3/4 (the bot test RED: step 1's put-back, named above).
Every other gate UNRUN (THE FULL SET is step 4).

## What the 2-7 builder needs (adds to ENG-27c's list below)
- The boat is seen only over water: its race leg needs TWO rivers that hold it whole (241 px + 20 each end), one near each end; a roll
  without is refused by name. It waits beside the first one's far bank and the race is judged at the last one's far bank, not the exit.
- Stacked legs: the race leg under the out leg is buried in the out leg's painted earth (separate packet) and an Easy put-back can lift
  him to the out leg (step 1). Do not judge 2-7's Easy race before step 1 lands.

## Lessons applied: D57/D87/D105 (notifications at each step; two rulings sat ~10 min once while I traced: own miss), D30/D109 (times
from date, none in messages), D63 (the clip is named open, not skipped), D76/D102 (read lean; handed over at the lead's call),
D86/D96 (every unrun gate named UNRUN), D94 (lock base 0eefc707e named). D101 and D107 are not written anywhere on this checkout.

# ENG-27c REPORT (hand-over at the lead's context line, written 11:17 AM ET 11-21 by date). Base 0eefc707e; branch t-eng-27; code head ad23f8b0a
## EXACT NEXT STEP (ENG-27d, from t-eng-27 head; read only this section, D90)
1. Setup: `npm install --legacy-peer-deps` (restore package-lock.json after). Probes and the stills script are kept here as files:
   raceprobe-27c.ts.txt (copy to tools/inspect/_raceprobe.ts), race-stills-27c.mjs (copy to tools/inspect/, run with
   PW=/opt/node-tools/node_modules/playwright/index.mjs, vite on 5199; the toy is on the page as `?fixture=home[&seed=n]` or __play('2-97')).
2. GATES: ENG-27c started THE FULL SET at 11:15 AM ET on ad23f8b0a (run-gates-27c.sh: chain1 tsc + suite shards 1-6 + CI tool tests +
   tierBots + tipwalk + funcheck + coverage/registry/generality/known/roadmap/time/artcheck; chain2 every seed list --check + paintcheck
   0-2 + build + chunkcheck + clipcheck + kbdcheck + drawcheck + buildcheck; chain3 lockall --layouts 16 base 0eefc707e vs head). Its
   verdicts are appended below under "Gates" if ENG-27c lived to see them; any gate not listed there with a verdict is UNRUN: run it.
   lockall: ONLY the toy may move (no shipped stage has a pacer, a post or a marked petal: petals.ts's change touches marked letters only).
3. THE LANE: RULED (a) by the lead 11:18 AM ET: the boat passes BEHIND the banks (drawn behind the bank's front face: it slips out of
   sight over each bank and comes back in the next river), never in the earth, never floating over land. A draw change: planted (a test
   that the boat is drawn before the bank's face where a bank stands over its lane, RED when drawn over it) + stills both ways. Before: stills-27c/ show the boat on its lane (the race leg's lowest river surface, y 1524): over a
   river, sideways, it reads well (race-bank-both-ways-small.jpg right); upright it sits at the screen's left edge. Over a BANK the lane is
   42 px under the bank top: the hull would sit in the earth (pieces/pacerPiece.ts layer 'back'). Options to show the lead: (a) hidden
   over banks (drawn behind the bank: it 'closes on every river', 2-7.md); (b) a lane in front of the banks' water strip (layer 'front' at
   the bank's foot); (c) lift it over banks (reads as flying). Then: the door stills (him at a slot on the OUT leg: race-stills' spot picks
   the LOWEST piece under x, so for the out leg use a 'high' pick; ENG-27c's door shot landed him on the home leg, deleted) and THE CLIP
   of the race leg with the boat in every frame, both ways (D63): a bot run (homeRun 'middle' with onFrame) recorded, or the page with
   tools/inspect/clip.mjs.
4. Name for the 2-7 builder (below, "What the 2-7 builder needs").

## ENG-27c: what was done
- **Step 1, the shares (ff60ced1b):** PacerRow.margin is a share of the careful middle's time: seconds = min(middle x (1 + share),
  rideOnly - under); W2_RACE.margin {normal 0.07, easy 0.1}; TOY_RACE deleted (the toy races on W2_RACE). Planted: pacerLay.test asserted
  the share first, RED ('normal seed 1: 112.91 s against 105.41 s x 4'), then GREEN.
- **The lead's ruling (b), the respawn floor (ad23f8b0a):** PacerRow.floor {normal 2, easy 3}; pacerReplace keeps max(share x left,
  floor) of margin over his middle time left, the floor capped at the ride-only bound's share of the way left (the ride-only bot WON Easy
  seed 1, 116.6 vs 117.59 s, on the bare floor; the lead ruled the cap stands, 11:13 AM). Planted both ways in pacerLay.test (a respawn a
  fifth from the dock keeps 2 s, RED without the floor; near the dock never past the ride-only bound, RED without it). pacerReplace is
  written so the start is exactly 0 (the share made the old form 1.4e-14).
- **Step 2, the art (ad23f8b0a):** 2-7's 7 frames packed into src/assets/w2-next/w2-next.webp (2313x357, 175 KB; pack-w2-next.py) +
  w2-next.json; 7 catalog rows (from t-art-next, file = the sheet's cells, status 'packed and drawn by id', part ENG-27c) and
  catalog_master.py --emit (w2.json: mailBoat/B, doorOpen; cast.json: letter/B, reply/B). w2NextArt.ts loads and draws by inventory id;
  stageManifest 'w2-next' for a stage with a pacer or a post (stageManifest.test planted both ways); stagePreload starts it. pacerDraw:
  two rowing frames (0.35 s each), waterline on the lane (0.85 of the frame, measured), bow first (mirrored running right). postDraw: the
  shut door w2-props#door 170 px wide (patientDoor's), the open one in its box; letters/replies flutter (0.3 s) at the sheet's 3 cut px a
  unit. World 2's tables name frames on their own (artuse sees them). artUse PASS, artcheck PASS, no code-drawn stand-in.
- **Step 3, NEW 2 the post (ad23f8b0a, from ENG-27b's patch):** the bot failure had FOUR roots, each traced on the bots' own runs and
  fixed, planted: (1) a far bank's slot in the landing of a jump off a LOG (expert Normal 1: off the log 106 px short of the bank, down 172
  px in, over the slot; walkedSpan has no log footing): postLay cuts a full run's jump off the log at the bank's edge, and the take-off
  onto a log ahead; (2) a piece between two gaps the expert DOUBLES across (expert Normal 3): cut a double jump's landing off the piece
  behind; (3) the played stage's petal pass (petals.ts screenExtras) TOOK THE LETTER (middle Normal 3: the letter, lowered to his middle,
  was the lowest petal nearest its neighbours): petalTrail never thins a marked letter (no shipped stage has one); (4) petals inside a
  slot's clearance give way to it (the nearest becomes the letter, the rest are lifted) instead of refusing the spot. The post runs on its
  own toy code POST_CODE ('A Pg1> Xw1> R Fg1> R /D ...': 2-7's longer way out): 11 of 12 rolls lay 2 doors, Easy 6 refused BY NAME (the
  test asserts the name and >= 11 of 12); HOME_CODE stays the legs/race toy ENG-27 measured (homeKit lays the post only on POST_CODE). The
  door test now walks between the two doors, then onto the second. postLay.test 3/3, legsHome 4/4, pacerLay 4/4 (incl. the race bots).
- **The page fixture:** homeFixtureStage.ts, `?fixture=home[&seed=n]` / __play('2-97'), DEV only (as the wheel fixture), POST_CODE.

## The race table (the toy, ENG-27c probe; boat at the ruled shares; Normal 7%, Easy 10%)
HOME_CODE before the floor (seeds 1-6): MIDDLE Normal won 1 (+0.2 s), 2 (+2.9), 3 (+0.6), 4 (+10.8), 6 (+0.8), LOST 5 (-2.7: 4 respawns,
then -2.4 s on the last two crossings waiting for logs, 70-90 px/s against the flown 104-126); MIDDLE Easy won all: +5.6, +5.6, +2.0, +3.7,
+0.3, +0.2; EXPERT Normal lost 1 (-0.1), won 6 by 0.04 s, others +3.8 to +9.1 (no expert bot on Easy); RIDE-ONLY lost all 12 (thinnest
Easy 1 by 1.0 s, Easy 4 by 1.4). POST_CODE (the longer way out), seed 1 Normal: the middle lost by 0.77 s before the floor. The floor
(capped) is in; the table was NOT re-run after it: re-run raceprobe on both codes (seeds 1-6) for the final numbers.

## What the 2-7 builder needs
- The race is THIN at a 7% share: on the toy the middle bot won 5 of 6 Normal rolls, three by under 1 s; a roll's log phase on the
  last reaches decides it. Run the race bots on every listed 2-7 seed (not 1-3) and expect to drop rolls the middle loses; (c) the boat's
  time from the roll's own log phases is the named refinement (the lead: later, not now).
- The post asks wide WALKED ground on the way out: a door never stands in a log's landing, a double jump's landing, beside a flag
  (140 px) or nearer another door than 360 px. 2-7's 6 doors need a long out leg of flat bank; a roll short of room is refused by name.
- The lane over banks is open (item 3 above). The hand build w2Stages.ts '2-7' is the builder's to delete.

## Gates (head ad23f8b0a; verdicts appended as they finish)
Started 11:15 AM ET. tsc PASS (7 s) on ad23f8b0a. EVERY OTHER GATE IS UNRUN: the lead stopped ENG-27c at 11:19 AM ET (D76, real context
~375k) with suite shard 1, the seed lists and the lock's base record mid-run (partial log tails in gates-27c/, no verdicts). THE FULL SET
is ENG-27d's, on its final head after the boat-behind-banks draw change (run-gates-27c.sh, the same chains).

## Learned
- A pickup the engine lays AFTER the trail's pass is planned can still be taken by the pass in the PLAYED stage (buildGen2Stage has no
  petal pass; generateStage does): compare the built stage with the played one (sim.e.collectibles at frame 0) before blaming the lay.
- 'On his path' must include where every tier is in the AIR: logs (no footing) and optional doubles are both outside walkedSpan.
- A rule added by ruling can break another rule of the same feature (the floor let ride-only win): run the whole feature's bots after
  every rule change, not only the test the ruling names.
- Proposed level.md rule: "every pickup a mechanic lays on the path is checked in the PLAYED stage by the bots of every tier".

## Unresolved, named: the lane over banks (lead's call); the door/letter-into-slot stills on the OUT leg and THE CLIP (D63); the race table
re-run after the floor; the gates still running; reference/handoffs/engine-core.md NOT rewritten by ENG-27c (context line): ENG-27d adds
the pacer (shares, floor + cap), the post (postLay's cuts, petals.ts letters), w2NextArt.ts and the home fixture.

## Lessons applied: D30 (times from date; one hand-typed time slipped in a message at 11:00 AM, own miss, corrected), D57/D87/D105
(ReadNotifications at each step and push; long runs in the background), D76/D102 (read lean, handed over at the line), D86/D96 (the
full CI list in the runner, verdicts by name, UNRUN named), D94 (lock against the integration base 0eefc707e), D103 (rulings read
between steps).

# ENG-27b REPORT (stopped by the lead at 10:46 AM ET 11-21, D76: real context ~369k). Base 0eefc707e; branch t-eng-27; code head 5a579bb16
## EXACT NEXT STEP (ENG-27c, from t-eng-27 head; read only this section, D90)
1. Setup: worktree of t-eng-27, `npm install --legacy-peer-deps` (restore package-lock.json after). Every engine step below is on THIS head.
2. NEW 2 the post: WIP, NOT committed as code: `git apply reference/qa-reports/ENG-27/ENG-27b-post-wip.patch` (post.ts, gen2/postLay.ts,
   pieces/postPiece.ts, postDraw.ts (no-op until art), gen2/postLay.test.ts; hooks in pipeline.ts layChaseStage + PIECES_OF, types.ts
   Collectible.mark 'letter'|'reply', gen2/types.ts GraphBrief.post, stageGenerator.ts GeneratedStage.post, engine.ts draw hook, w2.ts
   W2_POST_ART, toyHome.ts TOY_DOORS 2). State: tsc PASS; postLay.test tests 1-2 PASS (slot on path on 12 rolls, planted RED 60 px up;
   a door opens on the pass); test 3 (bots) FAILS on 'middle normal seed 1: every letter posted' after the LAST edit (the slot search
   from the walked span's middle out in 20 px steps, SLOT_CLEAR = 2 x PICKUP_APART). Before that edit the bots posted 9/9 but 4 of 12
   rolls were refused ('only 1 route piece'). Find which door the run lacks (scratch probe: compare homeStage(1).post with the played
   stage's sim.e.collectibles letters: the played stage once dropped a NEW letter 38 px from a petal; the slot search may now take over
   a petal the played assembly moves). Then the 12 rolls clean AND 9/9 bot runs, commit.
3. The race margin as SHARES (the lead's ruling, 10:46 AM): PacerRow.margin becomes a share of the careful middle's time, Normal 7%,
   Easy 12% (2-7.md: 3/42.1, 5/47.8 → 0.07, 0.10; the lead said 12% for Easy: use the lead's numbers); pacerLay.ts seconds = min(middle
   x (1 + share), rideOnly - under); W2_RACE.margin {normal: 0.07, easy: 0.12}; DROP TOY_RACE (toyHome.ts) and use W2_RACE on the toy;
   pacerLay.test asserts the share. Re-run pacerLay.test: middle 6/6 ahead, ride-only 6/6 behind (on 5a579bb16 with TOY_RACE x2.5 the
   middle won 6/6, thinly: normal seeds 1, 3 by 0.2 and 0.6 s; expert normal 2/3, lost seed 1 by 0.1 s after 5 deaths).
4. ART (the lead did not rule against): pack 2-7's 7 frames (w2-next#mailBoat, #mailBoatB, #letter, #letterB, #reply, #replyB,
   #doorOpen; cuts at origin/t-art-next:reference/art/hfnext/cut/{boat,boatB,letter,letterB,reply,replyB,door-open}.png, catalog rows
   in t-art-next's CATALOG-MASTER.csv, file 'origin/t-art-next:...') into src/assets/w2-next/w2-next.webp (ENG-ROCK's precedent:
   21af89b4e), rows' file + frame rects, `tools/art/catalog_master.py --emit`; then pacerDraw.ts drawPacer (two rowing frames on its lane,
   ~240 px long against Pokey's 89.1) and postDraw.ts drawDoor / drawPostItem by those ids (w2-props#door is packed already). No
   code-drawn stand-in. Pacer.lane is the race leg's lowest river surface: judge it on stills (behind the banks on layer 'back' it is
   hidden over every bank; the design wants it beside him in every frame: the lane is the open question, show the lead first).
5. Stills of the toy upright + sideways, the whole screen (the boat beside him on the race leg, a letter going into a slot, an open
   door) and a CLIP of the race leg with the boat in every frame (D63). REPORT: the race table, "What the 2-7 builder needs".
6. THE FULL SET (reference/methods/gates.md, D96) on the final head, the suite in shards, lockall vs 0eefc707e, every list --check,
   coveragecheck (the race and the post must price), registrycheck, paintcheck, generalitycheck, tierBots.test, funcheck.
## ENG-27b: what was done (10:48 AM ET)
- Lockall (NEXT STEP 2): 102/102 unchanged, base 0eefc707e vs f2705ecd, 3264 builds each, byte-identical (two --out runs compared by
  --check's logic). Nothing shipped moved.
- Steps 2-3, one root (647e172d9): towerRoute.ts towerCorners left a column's last turn for after the stage's last leg: the bot reached
  the home leg's end, walked 17,500 px back to the column through every river and home again (56-94 lives), and at the column's last
  storey read the way on as straight down through its floor (~13 s, rescued). Now a column of a stage of legs climbs its own last turn
  at its foot (keyed on gen2.tower.legs: up/down towers unchanged). ENG-27's suspect wet() by x alone was ruled out first (a y-aware wet
  changed 0 of 6 rows). Planted: legsHome.test 'the column's last turn...' RED without (seed 1), GREEN with; toy 9/9 finish, 0 rescues,
  1-6 lives; seed 2 left 4 lives vs 6 laid right.
- NEW 1 (5a579bb16): pacer.ts, gen2/pacerLay.ts (rivers matched to flown rows by speed + log length: no RiverZone change), pieces/
  pacerPiece.ts, StageStats.race (badges.ts: the verdict; the medal itself is the Designer's), W2_RACE, SKILLS.race / SKILLS.rideOnly
  (firsttimer.ts), pacerLay.test (4 tests, RED for each bound and an unflown row; the respawn re-place; the bots). Type additions for
  the lead's review: GraphBrief.pacer, GeneratedStage.pacer, StageStats.race (and, in the WIP patch, GraphBrief.post,
  GeneratedStage.post, Collectible.mark 'letter'|'reply').
- RiverZone.way (ENG-27's field): a river in a leg laid left keeps the screen's dir (what the engine moves logs by) but must be judged
  in its own frame: riverFaults reads 'upstream' and 'with him' from dir relative to the way he crosses, and without `way` a fair
  river mirrored left reads as flowing against him (legsHome.test 'judged in its own frame' plants it). The alternative, a dir in his
  frame, would change what every engine reader of dir does; one optional field read only by the judge is the smaller change.
## Gates (code head 5a579bb16 unless named)
| gate | result |
|---|---|
| tsc | PASS (5a579bb16) |
| lockall vs 0eefc707e (f2705ecd) | PASS 102/102 |
| suite shard 1/3 (647e172d9) | PASS 1285/1286, 0 fail |
| suite shards 2/3, 3/3 (647e172d9) | UNRUN at stop (running) |
| seedlist --check 1-1..1-8 (647e172d9) | PASS |
| seedlist --check 1-9, 2-1, 2-2, 2-4, 2-5 | UNRUN at stop |
| legsHome.test, pacerLay.test (5a579bb16) | PASS |
| tierBots.test, THE FULL SET | UNRUN |
## Learned
- A stage of legs breaks every tool that assumed the route ends at the last section (towerCorners' leftover turn): when a bot's route
  looks wrong, print the route's corners before tuning the bot (one print found steps 3 and 4).
- A race decided by an absolute margin is only as fair as the leg is long: state margins as shares (the lead's ruling).
- The played stage can drop a collectible the build laid (the post's new letter 38 px from a petal): test a NEW pickup on the played
  run (homeRun), never only on buildGen2Stage.
## Lessons applied: D76 (stopped at the lead's line), D86/D96 (the full list named, the unrun named), D94 (reds are this branch's),
D101 (proven on the rolled toy, played the game's way), D102 (read by greps and line ranges), D103.

# ENG-27 REPORT (stopped by the lead at 8:33 PM ET 11-20, D76: real context ~427k). Base 0eefc707e; branch t-eng-27; code head 458315ba
## (ENG-27's) EXACT NEXT STEP for ENG-27b: DONE through step 4 and NEW 1; see ENG-27b above
1. Setup: worktree of t-eng-27, `npm install --legacy-peer-deps` (restore package-lock.json after: it is tracked).
2. UNRUN, run first: `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` on 0eefc707e, then `--check lock-base.json` on
   t-eng-27: expect 102/102 unchanged (no shipped graph has a leg mark; levelCheck's run-leg rule and w2Finish's side read only flow 'legs';
   riverAt changes play, not layout). Then the suite in 3 shards (my run was on a mixed working tree: UNRUN), seedlist --check of every
   listed stage (riverAt + firsttimer.ts changed: D86's spread rule), tierBots.test, then THE FULL SET (gates.md) at ENG-27b's final.
3. Bots on the toy (step 0's last open item; `npx tsx reference/qa-reports/ENG-27/botTable.ts middle,expert normal,easy 1,2,3`,
   botTable-1.txt): seed 1 middle/expert finish both settings (192.8 s / 205.3 s, 2-4 lives, 1 rescue); seeds 2-3 drown in the HOME
   leg's rivers (56-94 lives, 900-1100 s). Seed 3 drowns with the home leg laid RIGHT too (probe18.ts: 76 lives): that roll's rows, not
   the left leg. Seed 2 is direction-sensitive (5 lives laid right, 56 left). First death traced (probe19.ts, t 92.1): he runs off the
   near (right) bank at full speed as a log slides out and lands in the 72 px gap. Suspect first: firsttimer.ts:2733 `wet()` reads
   rivers by x alone (the out leg's rivers lie over the home leg: use river.ts riverAt or the leg's own rivers), then the edge look
   (floorAt at p.x + dir*look). Re-run the table; planted toy: seed 2 left within 2x its right-laid lives.
4. The column rescue (every seed): the bot stands ~13 s on the down column's last storey (seed 1: x 18075 y 1217) and is rescued to
   the floor. towerRoute.ts towerCorners `within()` draws a straight diagonal down a no-vine descent (dropsDown): give it each storey's
   end, as it gives a vine field its vines. Planted: rescues 0 on the toy, seeds 1-3.
5. Then the packet's items 1-6: NEW 1 the mail boat pacer, NEW 2 the post, the `race` bot skill, the art by ART-NEXT-b's inventory ids
   (origin/t-art-next f4f724269, reference/qa-reports/ART-NEXT-b/REPORT.md; I did not open it: no id read, none wired), stills/clip.
## Step 0 (the READY toy, show first): DONE for the lay; bots partly (item 3-4 above)
- The toy: src/game/gen2/toyHome.ts `A Pg1> Xw1> R /D Dc_ /L Pf1< Pw1> Mg1> Ww1> R Sw1> E` on World 2's ground and river rows; laid by
  gen2 on a listed test row (tools/inspect/homeToys.ts: withTestStage + plantSeedList + w2Finish, ENG-26's pattern, D75). Map with the
  middle bot's path: toy-map-s1-normal.png (toyMap.ts).
- Planted (src/game/gen2/legsHome.test.ts, 5 tests; legs.test.ts +3): RED same-ground `/L` overlay refused BY NAME on every roll both
  settings ("legs: leg 2 (left) overlays leg 1 (right) ..."); GREEN `/D /L` clean on 6 seeds x both settings, home leg >= LEG_CLEAR (260)
  under the out leg, rivers on it dir -1 way -1, out leg's dir -1 unmarked, >=3 flags and >=10 petals on it, same stage from same seed.
  RED evidence: red-base-0eefc707e.txt (base: the toy throws "a river in a leg laid left is not mirrored yet"; without the shrine fix
  0 petals; without the verdict the RED test fails).
- Engine changes (all general, no stage id: generalitycheck PASS): legs.ts reflectLeg turns a left leg's rivers, logs, splash-back and
  riding petals (tail / wheel pond / sluice refused by name); legOverlaps + LEG_CLEAR; pipeline.ts: no throw for left-leg rivers, the
  start's back wall when a later leg lies beyond it, the overlay refused alone in checkStage (no repair swaps: refuseNotThrow's rule);
  river.ts RiverZone.way (Architect's type: a field ADDED, flag for review) + riverAt/RIVER_DEPTH 120; riverLay.ts riverFaults judges a
  left-crossed river in its own frame; levelCheck.ts hop limit relative to him, 'past the shrine' by the stage's travel, no link between
  two run legs; engine.ts water check by riverAt (was x alone: a life every frame on the home leg under the out leg's river);
  w2.ts w2Finish splash pond on a left leg sets him back on its right bank; firsttimer.ts bots follow the lay's route on a stage of legs.
## Gates (head 458315ba)
| tsc | PASS | generalitycheck | PASS (26 literals, 26 known) | legs.test + legsLay.test + legsHome.test | PASS (25/0 at 8:30 PM ET) |
| suite (3 shards), lockall vs base, seedlist --check (all lists), tierBots, castBots, coverage/registry/paint, drawcheck/clipcheck | UNRUN |
## Found, open (named)
- Inspector phantom (pre-existing): findRoute hops from the out leg's last bank to a way-down column's floor through its wall (levelCheck
  drop links do not see walls; legsLay's DOWN_CODE too). Bots no longer follow it on legs; the meter/coverage tools still read findRoute.
- engine.ts:3607 a SEALED door pushes him back to x - 35, vx -140: wrong way on a stage that ends LEFT (2-7 is a sprint: never seals).
- The toy's home leg is ~3x the out leg (chunkSeconds fills); a level's lengths are its builder's.
## Polish check: no stills/clip of the real page yet (the toy map only). Pushback: none. Learned: an out-and-back puts one leg UNDER another,
and every "by x alone" lookup (river under him, past the shrine, wet ahead, falls' links) breaks: grep `x > r.x0 && x < r.x1` first.
Lessons applied: D30, D57, D59 (the suite named UNRUN), D75, D94, D97. Turnover note: engine-core.md §0zq-27 added (top), this commit.
