# ENG-23 REPORT: followers (follow.ts), "bring N home", the heron reads the line

Engine member, branch `t-eng-23` from origin/main 6e7b85f8. Packet reference/packets/2026-11-18/ENG-23.md; spec reference/design/2-3.md
(t-design-23 @ 260aa398) "follow.ts: the engine packet's contract"; the lead's rulings PICKS-23-25.md and 2:10 PM ET 11-18 (accepted:
the two fixes below, proto.follow, FollowRow.home = 200 px as the lead's number, WatchZone.lag). Started 1:47 PM ET, hash at the end
of this report. Engine only: 2-3 is NOT laid (its builder does).

## 1. Done-items, with evidence

| # | What | Where | Evidence |
|---|---|---|---|
| 1 | follow.ts, pure: the trail (walk: on the ground or in the air, his hop or a walk off an edge, judged at the landing: down more than FollowRow.step and the take-off becomes a WAIT; hold: a climb, grab or ride makes the last GROUND point a WAIT; a hop that ends on a vine is cut back to its take-off; a WAIT opens when he is back on that ground or a step below), stepLine (each chases the one ahead at most `pace`, never closer than `gap`, never past a WAIT), join (a freed one drops from its cage, then walks straight to the end of the line), spook / rejoin, regroup, home, paddle at the surface over splash-back water, zoneLookX (the look sweeps x0-160 to x1+160 in WORLD x), lineSeen (watcherSees with seesStill + the reed inset) | src/game/follow.ts | follow.test.ts (20 tests) |
| 2 | followPlay.ts: the engine glue. One per stage carrying proto.follow; his mode each frame (grounded / his own hop = walk; climbing, swinging, hanging, riding a drift log or ride, or a fall = hold); a set-back (respawn, soft fall, splash-back, or any jump > 150 px) re-forms the line bunched behind him; herons: one WatchState per watched stretch (watcher.ts stepWatch; WatchZone.lag starts a second heron late), reading only the little ones on its own stretch, never him; its first look over a freeFirst stretch only warns (on Easy every heron's first look does, the kit's rule); a spooked one runs to WatchZone.setback (else the stretch's start) | src/game/followPlay.ts | toys 3-6 below |
| 3 | The engine: startFollow at stage start; updateFollow replaces updateWatch on a follow stage (the eagle never runs there); a burst cage's little one joins the line (crittersRescued still counts the freed for stats); the goal counts HOME ones (goals.ts rescueCount: the ONE count the sealed exit and the HUD read); every set-back calls follow.setBack (crumbledWhole + the two splash put-backs); the cage's own hop-away is not drawn when its little one follows | src/game/engine.ts, goals.ts, riverArt.ts | toy 6, the engine regroup test |
| 4 | The draw: the little ones at ~45 px tall (33 px wide: Matt's Happy poses, w2-props) behind him and under the reeds; walking bob, paddling (sunk to the chest, a ripple), hiding (crouched behind a reed tuft), home (hopping); the heron (dressnew-w2#w2Heron) wading 70 px past its stretch's end at its level, facing back along it, '!' while it warns, its look a dashed gaze from its eye and a pale wash on the ground | src/game/followArt.ts | stills (section 2) |
| 5 | World 2's reed clump as a hide: Bush.kind 'reeds' drawn from World 2's own reed paintings (reedTall / reedShort / reedLean, the pattern fixed by where it stands, swaying harder while someone moves in it) | riverArt.ts drawReedClump, watcher.ts, engine.ts drawBushes | stills |
| 6 | The data row: `W2_FOLLOW = { pace: { normal: 190, easy: 230 }, gap: 34, scamper: 300, rejoin: 60, home: 200, step: 90 }` (the design's FOLLOW + the lead's home; `step` = W2_GROUND.bankH, "a bank's lip", MY pick of the number for the lead's 3:01 PM ruling: rule it) | gen2/worlds/w2.ts | |
| 7 | lineFaults (gen2, next to stillFaults): reeds under 260 px (Easy 340); open mud over 500 px (350 under two herons, and on Easy); a watched pond over 360 px; two herons whose longest safe time to leave is under 2.0 s (FLOWN with the game's own FollowPlay, not a formula: LESSONS "a gate must call the same code"); a climb whose top lets him off onto other ground, or with no ground 60 px on; any swing or ride; a cage whose little one drops into nothing or deep water, or past the exit | src/game/gen2/lineFaults.ts | lineFaults.test.ts (8 tests) |
| 8 | Bot skills (firsttimer.ts LINE_SKILL): WAIT-FOR-THE-TAIL (in the reeds on a watched stretch: walk only as far in as the line needs, stand while a heron looks, go right after a look with the whole line in and still; his late thumb that slides him out of the reeds walks him back in) and FETCH-THE-SPOOKED (back for a spooked one once the heron has looked away; at a sealed door he waits while any little one is still on its way) | tools/inspect/firsttimer.ts | lineBot.test.ts (4 tests; added to gates.yml) |

**The six planted toys** (each RED with its rule taken out, run on the real engine at 30 fps through the InputEngine, 80 ms taps):

| Toy | Green | Plant -> RED |
|---|---|---|
| 1 the line on a bare floor (D 600) | widest 357 +-10 px, bunched 1.0 +-0.2 s (the flight's numbers) | no pace cap: widest is the bunched 170 px |
| 2 the hop replay | the first little one's three apexes at his apex x +-4 px; none left standing in the air | trail recorded on the ground only: no hops |
| 3 the climb | nobody passes the foot or leaves the ground while he climbs; the first waits 34 px short; down 60 px on they rejoin in <= 0.5 s; FollowPlay maps climb / own hop / walk-off correctly | WAIT ignored: the line climbs the post |
| 4 the heron | still in the open: spooked back to the stretch start; still in the reeds: not; the look crosses 600 px behind him (world x); in the real engine he stands in the open under the look: never read, no dive, no heart | a watcher reading him sees him; and the same stretch without the follow row is the eagle, which sees him |
| 5 the regroup at a flag | the whole line, a spooked one too, bunched behind him (pure, and in the engine through respawnAtCheckpoint) | a regroup that leaves the spooked one strands it at its reed |
| 6 the goal | Normal 5 / Easy 3 (goals.ts); the door stays shut with all freed and none home, opens when they are home | count the freed: the door opens at the burst |
| 7 a step down (the lead's ruling 3:01 PM ET) | he walks off a 60 px step: the line follows him down HIS way (his arc, as a hop), none left in the air | the contract as first written (a walk-off is a hold, opened only on the same ground): the line stays at the lip |
| 8 a drop deeper than a step | 200 px (> FollowRow.step 90): the line waits 34 px short of his last step on the lip and never goes over | no step limit: they go over after him |

Plus: the line paddles across splash-back water on his path, at the surface, nobody hurt (planted: without the surface pin it paddles at
the height of his hop: RED, then fixed); lineFaults' 8; the bots' 4 (wait-for-the-tail: middle and adult x 3 seeds cross with nobody
spooked; off: caught on the mud; fetch: all three home; off: the door stays sealed).

**What the toys and stills caught (fixed; the lead accepted 1-2 at 2:10 PM):**
1. A little one could come to REST mid-hop in the air when he stopped just past a landing: now it finishes a hop it started, or waits at
   the take-off (follow.ts airSpan). Toy 2's "none left standing in the air".
2. One spook cascaded down the line: the one behind closed the gap under the SAME look and was seen moving. Now a spooked one keeps its
   place (Follower.slot) until the look ends (unkeep). Toy 4.
3. A spooked one beside him rejoined instantly (undoing the setback). Now only once it has run back and is hiding.
4. A spooked one ran back THROUGH his trail's history (he had doubled back to fetch, so it ran forward 1,000 px first). Now it scampers
   straight back over the ground he walked there (trailYAt).
5. Paddlers floated at the height of his hop with ripples round them (still 2-paddle). Now pinned to the surface (planted test).
6. The heron faced away from its reeds (the painting faces left), stood on a high ledge (the top-most surface), and its look was too
   faint to read. Now it faces its stretch, wades at the reeds' level, and its look is a dashed gaze plus a stronger wash.
7. The suite's font rule (fonts.test.ts) caught the heron's '!' in a bare sans-serif: now the game's display font (re-run: pass).

**Flown numbers for the builder (the game's own line, a runner at his full run, shortest calm):** two herons out of step, G 350, the
second 3.2 s later: longest safe leave 2.7 s (the flight said 2.6); G 500 / 4.8 s: 1.6 s (the flight said 0.4; both refused). Mine
alternate each heron's sweep side every pass, as watcher.ts does; the flight held each heron to one side. One heron, G 350: 7.0 s.

## 2. Polish check (stills on the real page, 2-3's own start and World 2 art, upright 412x915 and sideways 915x412 at dsf 2)
Script: reference/qa-reports/ENG-23/stills.mjs; files in reference/qa-reports/ENG-23/stills/. Staged on the hand-built 2-3's first 1,600 px
with its pulley room and lines taken out; a toy, not the level.
- 0-start: the five bunched behind him on the far bank, about half his height; they read at a glance as five little ones.
- 1-walk: running stretches the line (as designed); the World 2 reed clump ahead reads as reeds, not World 1's bush (new painter).
- 2-paddle: two paddling at the creek's surface with ripples, one hopping in from the bank (fix 5 above).
- 3-bunch: he stands in the reeds, the line in behind him; the reeds cover them.
- 4-warn / 5-look: the heron's '!', then its gaze and wash; the tail left out on the mud is seen and gets its '!'.
- 6-spooked-hiding: the spooked otter crouched at the stretch's start behind a reed tuft: hidden, perhaps TOO well (see Unresolved).
- Upright the line is off screen behind him whenever he waits in the reeds: confirms the design's Pushback 4 (the HUD faces).
- HUD mock-up (SHOW FIRST, not built): hud-mock-walk (all five dim: out in the open), hud-mock-hidden (all lit green: hiding),
  hud-mock-look / hud-mock-spooked (four lit, one grey with an amber '!': spooked back), both ways. The faces sit in the goal plank's own
  five sockets, cut from Matt's painted Happy poses; a home one would be gold and count.

## 3. Pushback
1. **The heron is a watched stretch, not a cast kit animal.** The design said "World 2's watcher cast (castWatches, as World 1's eagle)";
   the kit sweeper's eye, tell and act are built around reading HIM (its dive, its strike), so I ran the heron on watcher.ts's rhythm in
   followPlay (one state per stretch), reading the line only, as the packet's NEW 2 words it ("a WatchZone's look"). The builder lays
   proto.watch zones, NOT a WatchRow.cast. If the lead wants it in the kit later, that is a packet of its own.
2. **Easy's first look from every heron only warns** (the kit's Easy rule, applied here). Easy is never harder; say so if you want it off.
3. **The heron's call is the eagle's screech** (no heron sound exists): a sound ask.

## 4. Suggestions (ready packets)
- **HUD-FACES (after Matt OKs the mock-up):** VineHud.tsx slots: on a follow stage, slot i shows little one i's face from the engine's
  line (state hid / open / spooked / home), from w2-props Happy frames. Done-items: clipcheck both ways and three saves; the counter's
  label says "N of 5 home"; a test that a spooked one's slot shows '!' and a home one counts.
- **METER line channel:** coveragecheck PASSES (no new vocabulary piece), but the meter cannot price the line. The channel 2-3 needs, in
  score.ts: per watched crossing, the line's crossing time ((G + N x gap) / pace) against lineFaults' safeWindow, the reeds' let-go
  window ((W - N x gap - 20) / 285 s), and a spook's cost (fetch: 2 x distance / 285 s). Name: `line`.
- **The 2-3 builder needs (rule 23):** proto.follow = W2_FOLLOW; hides as proto.bushes kind 'reeds' on the ground (their y on the floor);
  proto.watch zones with calm, freeFirst (beat 2), lag (beat 7's second heron, Normal only) and setback where the stretch start is not
  where they should hide; cages as collectibles 'cage' with critter duck/otter/capy, objectiveType 'rescue'; lineFaults(st, W2_FOLLOW,
  easy) beside stillFaults in its checks; the mooring post as a tree_climb vine with nothing to step off onto at its top; the families'
  jetty in front of the door (home = 200 px); Dot's lines from the keeper ("go right after it looks", who is missing and where).
  The bots: whether the cast bots PUNCH cages on 2-3 is not proven here (the toy frees them).
- **Art asks (the lead's HF call):** the little ones' two waddle frames and a paddle pose (2-3.md), a head-up LOOKING heron, a heron call.

## 5. Unresolved (named plainly)
- The HUD faces are a mock-up only (SHOW FIRST); not built.
- 2-3 is not laid (the builder's); nothing here is on a real stageTable row yet, so "Ready" (rule 23) waits on the builder.
- A spooked one hiding at its reed is hard to see (the HUD's '!' face and Dot's line are what find it).
- A spooked one scampers straight back over the ground he walked; across a pit he hopped it would run along his hop's line (no 2-3 beat
  has a pit inside a watched stretch; lineFaults does not check for it).
- lineFaults does not yet find a drop deeper than a step ON the line's road (it would strand them at the lip); the built stage's bots
  would end at a sealed door. A check needs the road (the builder's route): suggest it with the 2-3 build.
- The bot's fetch walks back with plain steps (fine on 2-3's flat marsh; a pit behind him would need the route).
- drawcheck / clipcheck not run: no shipped stage draws the new paths (no stage carries proto.follow or a 'reeds' hide); the builder's
  2-3 runs them.

## 6. Method update (level.md / engine method)
- **Toys beat flights for rules:** the design's flight proved the NUMBERS on one clean path; the toys found five rule defects the flight
  could not (rest in the air, the spook cascade, instant rejoin, the doubled-back scamper, paddling at hop height). Proposed rule for
  every engine contract: its toy list includes "he stops just past a landing", "he turns back", and "a look over a line with a gap in it".
- **Stills both ways on the real page before reporting** found three visual defects the tests passed (paddle height, heron facing,
  heron on a ledge). Keep it in every engine packet that draws.

## 7. Turnover note
reference/handoffs/engine-core.md section 0ENG23 rewritten (commit below).

## Gates (each once)
See the final message for the run's numbers: tsc, the suite, lockall vs main (102/102 unchanged), generality PASS, knowncheck PASS,
roadmapcheck PASS (unshallowed), coveragecheck PASS.

## Lessons applied
A gate must call the same code the screen calls (safeWindow flies FollowPlay); planted failure first (every toy and the paddle fix);
judge the real screen both ways (the stills found three defects); check the fact before acting (watcher.ts:148's view-based shadow read
before the world-x look); members under-report context (REAL figure from get_session at idle).

## Learned (for the next builder)
The line is path replay: anything he does with his own feet they repeat, including stepping back; a player who overshoots the reeds and
steps back pulls the line to where he turned. Stop where the line fits, not at the far end.
