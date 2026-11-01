# Pending for the coding team

**Sent 2026-10-28 (Matt said "send"): items 0-7 below.** New findings go under a new heading.

QA's running list from Matt's test-link sessions (Matt, 2026-10-26: Matt plays, QA reads the logs; send to the coders in one
batch only when Matt says "send").

## 0. The game ran at 1-3 frames a second for a whole 52-minute session (Sally, "Sasa") [blocker]
- Session `Sasa 20261026-1813-8brs`, build 15:52, Android 320x649 upright (dpr 3.375), control-test stage.
- Median frame rate by 5 minutes: 3.4, 1.5, 2.0, 1.5, 1.5, 2.2, 2.2, 1.6, 1.9, 1.6, 1.5 fps (frames 400-700 ms). The first `fps` line was
  already 24.9 fps with 490 ms spikes; `quality` dropped q0→1 at 0.4 min and q1→2 at 0.5 min, and it never recovered. 120 `stall` lines
  (all under 500 ms, because every frame was slow), 80 `long` tasks, both log kinds `capped` early.
- Memory was fine (18/25 MB → 20/23 MB), so not a leak. The canvas went from 640x1298 to 320x649 (quality 2) and was still at 1-2 fps.
- She spent 36 minutes on "Lily pads" (2.4 to 38.9 min), going back and forth to "Long jumps": at 2 fps it's nearly unplayable. She
  never reached the finish, so the log has no score. One life lost at 49 min.
- The same phone at 320x782 this morning (Sally jdg7/jz2z, build 09:50/11:16) ran at about 24 fps. So the 15:52 build, or this
  browser window (320x649 suggests an in-app browser or a split screen), is the difference. Something per frame got very expensive
  between 11:16 and 15:52 on this phone.

## 1. Game froze, then the site crashed, after leaving the pause menu's Trophies / Jungle Cards [blocker]
Matt's account: he opened the menu early in the stage, looked at the new medals (trophies), the Jungle Cards and so on, left the
menu, and the game froze and then the site crashed. The log fits that: the game paused about 2 s in (no position or fps lines from
then on, `mem` frozen at the same numbers, as a paused stage would be); about 2.5 minutes later a 106 ms long task tagged "menu"
(158 s, leaving the menu); then 22 s of touches read as gestures (167 to 189 s) with Pokey not moving; then the page went
away (`hidden` at 191.7 s). So the stage never came back from the pause after the Trophies / Jungle Cards screens.
Repro to try: start a stage, open the Menu, open Trophies, then Jungle Cards (go back and forth), close the menu, and steer.
Matt's fuller steps: Menu → Trophies; looked at all three tabs, scrolling (kill counts); opened a memory to watch again
("Tap to watch again"), skipped it; back up; Resume → froze.
**Likely root cause (QA read of the code, build 17145ea):** App.tsx's effect (about line 345) stops the engine and sets
`engineRef.current = null` whenever the screen becomes one of the story screens, including `'memory'` ("letting go of the engine
frees that stage's world"). TrophyRoom's `onReplayMemory` (App.tsx about line 1040) sets the screen to `'memory'` even when the
Trophy Room was opened from the PAUSE menu (`trophyFrom === 'paused'`). After the memory (finish or skip) it returns to the
Trophy Room, whose Back goes to `'paused'`, but the stage's engine is gone, so Resume resumes nothing. That's a frozen screen
whose touches are still read by the input layer, which is exactly the log. The page closing afterwards may be the browser
killing a stuck tab, or Matt leaving.
Skipping doesn't matter (Matt, confirmed in the code): the stage is released the moment the memory starts, so watching it to
the end breaks it the same way. The real bug: playing any memory or scene while a stage is open unloads that stage, and the
game later goes back to it as if it were still there.
Fix ideas: don't free the engine for a memory replayed from the pause menu (play it over the paused stage), or have Back
restart the stage from its last flag when the engine was released. Repro: start a stage, Menu → Trophies → Library → a seen
memory "Tap to watch again" → Skip → Back → Resume.
QA couldn't reproduce it in a quick headless pass (current dev build, 1-1 upright: Menu, Trophies, Jungle Journal, Library, Badges,
Back, Jungle Cards, Back, Resume, then steering: the game resumed and Pokey ran). Differences from Matt's case: a real Android
phone, about 2.5 minutes inside those screens, the control-test stage, the 15:52 build. A guess worth checking: the Trophy Room
and Jungle Cards pull in many card pictures, and on a phone that could run out of graphics memory and get the page killed (the
log's `mem` only counts script memory, 18 MB, so it wouldn't show). Do those screens release their pictures when closed?

Earlier read of the same log, kept for the details:
- Session `Matt 20261026-1558-mpcz`, build 2026-10-26T15:52:40, Android 498x1034 upright, control-test stage (mix: Bounce,
  Push the log, Snakes, Snapping turtles, Hide from the eagle, Lily pads), help "reminders".
- What the log shows:
  - Stage start fine: sheets loaded by 0.4 s (props 146 ms, hud 187 ms, turtle 149 ms, leaves 5 ms, w2-props 129 ms);
    section "Run and stop" at 0.25 s.
  - At 1.3 s a `blank` event: "wait w2-props-DHWljPtC, wait leaves-atlas-M2igYnqZ x140", though both sheets had already
    loaded (at 0.35 and 0.44 s).
  - Pokey's position lines stop at 2.27 s, at x 140 (where he spawned). The only `fps` line is at 5.3 s
    (28.4 fps, max frame 99 ms). Nothing from the game after that: no fps, no sections, no position.
  - The page stayed alive: `mem` kept logging every 5 s for 2.5 minutes, but with the same numbers each time
    ("18/36MB parts 0 foes 5 items 58"), so the game wasn't updating. Matt's touches from 167 to 189 s were read as
    gestures (47 duck, 39 jumpUp, 18 move, 9 punch, 8 jump), and nothing moved. One `long` 106 ms task at 158 s ("menu").
    He left at 191.7 s (`hidden`).
- So the game loop stopped (or the stage never came out of a "waiting for art" state) about 2 s in, while the page, its
  timers and touch input kept running. No `err` line was logged.
- The session before it (`20261026-1540-5dmf`, build 15:23) also logged a `blank` "wait w2-props, wait leaves-atlas x140"
  at 2.0 s, but recovered and played on (16 sections, 2 finishes). Same wait, different outcome: a race in the
  "wait for sheet" path?
- To check: what clears the blank/wait state, and can it miss a sheet that finished loading before the wait began?

## 2. Boss 2-10 (the caiman) hurts by touch during its wind-ups [major]
- Session `Matt 20261026-1430-2up4` (build 11:16), from the new `bossHurt` log: 8 hearts in the fight. 6 were `body` (touching him),
  4 of those during a `tell`: `body tell deathRoll 0.50`, `body tell tailWhip 0.33`, `body tell tailWhip 0.32`,
  `body tell geysers 0.33`, plus `body act deathRoll 0.50/0.68`. Only one was a `strike` (tailWhip act 0.03) and one a geyser column.
- The "no touch damage, only attacks after their wind-up" fix was done for 1-10 and 3-10; 2-10 still hurts by contact, mostly while
  he is winding up, so the hit comes before the move it warns about.

## 3. Camera jumps back and forth about 130 px when Pokey turns [major, looks like shake]
- 55 `camjump` lines today, 47 on Matt's 498x1034 upright phone. Each is about 130 px sideways with no vertical change, and they
  come in back-and-forth pairs at the same spot, e.g. `dx-121 x13680`, `dx135 x13724`, `dx-131 x13729` (Sleeping snake).
- Worst: 21 in one section, `Twist: the swing frames` (Matt 2up4): every swing changes direction, and the camera's look-ahead flips
  with it, snapping the view about 130 px each way. Also 8 in `Develop again: higher and wider` and 3 in `Learn: swing over soft moss`.
- Suggest: ease the look-ahead when the facing flips (and hold it steady while swinging), instead of snapping it.

## 4. Sally drowned 12 times at "Push the log" and stopped there [major, teaching]
- Session `Sally 20261026-1150-jz2z` (320x782): the mix with Push the log (seed 571060) started twice; 12 lives lost to water in the
  "Push the log" section, then the session ended there. Matt also drowned twice at "Puzzle: the fallen log" (c3ho).
- By the "player or game" check she isn't a beginner (0.68 hits a section overall), so this spot is the game: what to do (push the log
  into the water first, then cross) isn't getting across, or the push is too fiddly on a small phone. Worth a Dot line before it,
  and a look at whether the log can be pushed from where a player stands.

## 5. Small phone (Sally, 320x782): many short freezes mid-stage [minor/perf]
- 45 mid-stage freezes over 100 ms on Sally's phone (worst 264 ms at River logs; 165 ms at Sleeping snake and Push the log),
  against 1 on Matt's upright phone. Her "Finish" section shows 42 choppy windows at about 24 fps (frames 57-67 ms).
- Memory is fine on every session (flat, or a slow climb to 30-32 MB over 20+ minutes).

## 6. First real outside players (Cheddarbob, Deville, 2026-10-27, both iPhones, both FINISHED the round)
- Deville (iPhone 430x721, Dot "teach"): finished in about 2 min, 2 hearts lost, survey "hard: Nothing", one thumb, both hands.
  Ran 22 fps for the first 15 s, then about 30 fps.
- Cheddarbob (iPhone 393x658): finished in about 3 min, 2 hearts lost, survey "hard: Short hops", one finger, one hand.
  - Choppy the whole session: 36 choppy 5-second windows, 16-21 fps (worst 16.1 fps, frames 63-70 ms, in "Double jumps"). The
    frame rate slid from 21 to 18 fps over 3 minutes. A second small phone with poor frame rates (after Sally's 320-wide one).
  - Started with Dot's help on "quiet" from the first second (`look help quiet` at 0 s): did he press "Skip tips" straight away?
    If so, a first-timer got no teaching at all and still finished. Worth knowing how often that button is pressed.
  - 279 duck toggles and 166 jumps in 3 minutes with one finger: many small slides read as duck on/off. Not harmful here, but noisy.
- Both: `blank` "wait <sheet>" events at almost every new section (Canopy road, goldsnake, turtle, boa, eagle, hero-vine): art
  arrives after the section starts, so things pop in. 35 such events in the newest 5 sessions across every device. Preload the
  next section's sheets one section ahead.

## 7. Matt's newest sessions (World 5 and Meeca, landscape, build 15:52)
- "Twist: falling rocks": 5 lives lost to pits over 9 visits (Matt, the most skilled player); worth a look at whether the rocks
  and the pits leave a fair line.
- Meeca's stage: twice Pokey/Meeca kept moving with no finger down for 0.8 s+ ("Learn: the ring, then DON'T EAT. M.",
  "Develop: two rings, a fern, NO TEA. BE RUDE. M."). Probably the guards' march carrying her; if not, it's a loss of control.

# Batch sent 2026-10-28 (section A, on Matt's "send")

## A. Matt bot on the rebuilt Worlds 1 and 2 (build 39fc3db, 2026-10-28; upright with short sideways stretches)
- 1-7 finished (3:09, 2/3 stars, 16 hits, 3 lives lost); 1-9 4/19 predators at budget, 0 lives; 2-2 about 4%, 5 lives; 2-5 0/17, 2 lives.
1. [blocker, confirmed by QA] 2-2 drowns you in under a second. Fresh start, 2-2 upright, steer right: at +0.9 s Lives 3 → 2 ("−1"),
   and only THEN does Dot say "Flick up just before the edge." The bot lost 3 lives by 0:07 and 2 more after Continue. The first gap
   needs to be taught on dry ground (or have a soft landing) before the first water, with the tip before the edge, not after.
2. [major] 1-7 bird: "It saw you! Slide down in a bush!" comes after the first hit. Steering down mid-slide doesn't hide (you must
   lift, then steer down). The "HIDE! INTO A BUSH" sign is drawn in the world, so screen readers miss it. The bird swoops about every
   3 s in the open, often from off screen (only an orange "!" at the right edge): 16 hits and 3 lives for an expert. Too hard for World 1.
3. [major] 2-5: a heart lost in the first 2 s, before "One of these plants isn't like the others." Then 2 lives (probably the river).
   Punching raised the score, but predators stayed 0/17 (unverified: the bot had no pictures left by then).
4. [major] Waist-high grass steps and dips stop a plain walk dead (1-7 about 24%, 1-9 several: the dip before the high ledge, a narrow
   gap between stumps, a low step). Only lifted up-and-over flicks or run-in hold jumps get out; in 1-9 it fell back into the same dip
   3 times. Same family as the World 5 lips; please apply the same "jump into a face carries over" and one-jump steps to Worlds 1 and 2.
5. [minor] Dot's tips linger: 1-7 "Flick up into the trunk to grab it" about 30 s with no trunk in reach, and "Slide your thumb up
   to climb" about 40 s over open ground.
6. [minor] Fight-count stages (1-9, 2-5) have no progress bar; players can't tell if they're moving forward.
7. [minor] 2-2 flower totals: bar 107, game-over card "1/122".
8. [minor] Lives aren't shown until the first one is lost.
9. [polish] 1-7: the eagle sits on Pokey when it hits; Dot overlaps him; after the rope the camera leaves Pokey at the right edge;
   sideways at about 23% Dot was drawn inside the dirt.

# Batch sent 2026-10-29 (B, C, D, on Matt's "send")

## B. Matt's own play, 2026-10-28 (sheet rows 2064-2194; build 11:59 ET release; Chrome 151, Android, Adreno 730, not software)
1. [UNFAIR, out of band, rule 3/4] 2-2 (Normal, upright): Matt (expert) lost 14 lives, all water, and finished in 6:23. No hurts,
   only drownings. Four in a row at the same spot (x 13475-13749, after the 256 s flag), three of them falling with no sideways
   speed. The first five sent him back to the very start: there's no flag before x 3441 (172 s in). Matt blamed himself ("played
   sloppy"), but an expert drowning 14 times in a World 2 stage is the stage, not him. Adds to batch A #1 (that was the first
   second; this is the whole stage). Needs an earlier first flag, and a look at the gap near x 13600.
2. [rule 10] 'blank wait' is still there on the release that was meant to load every sheet at the stage start: 63fc at 80 s
   (goldsnake head/sleep/wake + snake atlas), 201 s (eagle atlas); oib0 at 179 s (goldsnake), 650 s (dot-perch atlas).
3. [rule 11, fine] The new Device browser part and the 'env' moment both arrive and decode. Matt's tablet draws with its graphics
   chip (Adreno 730), so his small stalls (110-210 ms, mostly in the first second of a stage) are not the software-drawing problem.

## C. Matt bot on v216 (release PR #41, c057964), 2026-10-28
4. [UNFAIR, rule 2, World 2 out of band] 2-2 Normal upright, ~8%: the first lily pond. A missed pad costs a whole life and sends you
   back to 2% then 0%, and Dot's "Hop the lily pads. The flowers show the way." comes after the first loss. Down to 1 life about 30 s
   in. A bank splash is free, so the deadly pond is a surprise. Batch A #1 isn't fixed for the pads (bot; matches Matt's own 14 drownings, B1).
5. [UNFAIR, rule 7] 4-3 Easy upright, 8%: Dot says "Climb the tree and stop it", but upright the tree is off screen to the left.
   The bot spent 4 jumps (holds up to 700 ms) into the waterfall; only sideways was the tree visible. Ten seconds later Dot
   near-repeats it ("The water pushes you back..."; rule 8: two water tips ~11 s apart).
6. [UNFAIR, rule 2/4] 4-3 Easy, 14%: the dry steps after the plug need a double jump, and "Flick up again midair to jump twice"
   comes after 2-3 failed tries.
7. [minor, unverified] 3-3 Easy: "0 of 7 predators" never moved over 35% with taps scoring +1,000/+1,200 and Dot's "a prowler is
   near"; either none was met or hits don't count.
8. [minor, rule 8] 2-2 6%: "Run through flowers to pick them up." when 5 were already picked. 4-3: "Don't look at my tail. It's
   molting season. That's a real season." is 12 words.
9. [teaching, rule 12] 5-M: carving is a circle traced on the glass ("Hairpin. Good. Round and round." and a dashed ring). A
   held finger does nothing (checked by state: hold 1.5 s, 0 marked; circle, 1 marked). The bot read the ring as "hold here" and
   didn't see it working. Worth checking with a first-timer that "round and round" reads as "draw circles".
- Fine: 1-2 Easy (no full hold needed; 3 tries at the 9% log ledge, solved with an up-and-over flick); memory 17-38 MB everywhere.
- Not a bug (rig): the bot's "stuck in a hairpin loop" on 5-M was the test rig having no circle gesture. Added `circle`.
10. [5-M, Matt bot run 2 with the circle gesture: 319 s, never reached room 1's exit; 0 lives] What QA checked by state:
   - Carving works: a circle traced at the first trunk marks it (marked 1). That first "M" is the trail mark, not one of the 5
     warnings, so "{0 of 5 warnings}" correctly stays at 0. But nothing says so: the bot (and a kid) reads the "M" and the 0/5
     counter as "my mark didn't count" (rule 12). Name the counter, or have Flicker say the first mark is just for finding the way.
   - No real loop: the trail between camp and room 1 is one way, but its rolled sections look alike and Meeca walks slowly, so the
     bot was sure it was going round in circles for ~3 minutes ("lost and circling" lands too well; rule 6/12). A landmark, or a
     Flicker line on the second look-alike stretch, would help.
   - Room 1 works by state: the chair holds her, "It's holding me! Wiggle, wiggle!" shows after ~3 s, left/right wiggles free her
     (4 changes; lifted or not), up/down don't count; the sapling bends into a bridge onto the ledge and she reaches "Wait. Pokey
     needs to know this one."
   - [unverified lead, possibly UNFAIR] The bot ended "frozen, hunched with a red tint" near the sapling after 4 min, with nothing
     moving her for 60 s+. The rose chair's hold looks like that; QA couldn't reproduce a freeze (the wiggle frees her every time),
     but the wiggle line was gone from the screen by then. Consider keeping "Wiggle!" up while she's held.
   - [unverified, UNFAIR if true, rule 4] Tall ledges on the trail: she gets level with the lip on a double hop and drops back
     (about 6 tries at the first one, 2-3 at the next).
   - [minor] "Webs eat plain steering" (both runs): only lifted hops move her through webby stretches; nothing teaches it.
   - Not checked yet: rooms 2-5, the tea channel, the ending, puzzle framing upright (rule 7).
11. [5-M rooms 2-5, Matt bot run 3, started at each room with the QA rig's `warp`; 0 lives, never sent back]
   - [UNFAIR, rule 7/12, confirmed by state] No room nudges a stuck player. QA idled 32 s in room 3: nothing was said. Room 3's
     only lines are "A rope! Up I go.", "Sticky! Let go, let go!" and "Flick up to throw it." The bot stalled 70 s in room 3 (the
     silk is a trap by design; the pinecone throw at the knot never landed for it), 25 s in room 4 (no idea what to do first),
     and at the tall dark trunk in room 5. Never reached the ending. A Flicker nudge after ~20 s stuck, pointing at the piece
     (not the answer), would fix most of this.
   - [major, rule 7] Room 2: upright you can't see both plates and the gate together, and the plates look like dirt. The gate
     opened without the bot knowing why; no plate looks pressed (rule 10). Sideways it all fits and was solvable.
   - [major, rule 2] Pick-up is never taught before room 2 needs it: the bot found "tap to pick up" by accident, and the tap is
     fussy (a little off and it's a punch). "Flick up to throw it." shows once.
   - [major, rule 12] Carving the room 2 warning took ~35 s: circles at the middle of the trunk did nothing; it took at the left
     foot. No ring showed where to stand (the ring shows only before the first mark).
   - [minor] Meeca stuck at room 3's entrance with no web around; took a wiggle and hops.
   - [polish] "M. 1/5" in the HUD has no word for what it counts.
   - Good: room 4's contraption fits upright; room 2 fits sideways; the carving reveal; no lives lost anywhere; memory 10-17 MB.
   - Not checked: room 3-5 solutions, the tea channel working, the ending. Rooms 3-4 not sideways.

## D. Matt bot, replays of Worlds 1-4 (v219 / PR #42; 1-7, 2-6, 3-1, 4-5, each on ?layout=1 and 7, Normal, upright); key items rechecked on PR #43 (762ca32)
1. [blocker, UNFAIR, rule 2, out of band; CONFIRMED on #43] 3-1, 12-16%, the water gap after the first mushroom: the bot lost all
   3 lives in ~10 s, in both versions (game over at 0:49 and 0:51). QA on #43, plain hops right from the start: life lost at 14%
   (game time 35-37 s), and no tip about the water before it (the only lines were the edge, flowers, flag and heart tips). The gap
   isn't visible from the screen before. A World 3 opener; the "soft pits" promise doesn't cover this water.
2. [major, UNFAIR, rule 2] 1-7 17% and 25%: Dot says "Flick up into the trunk to grab it", but that does nothing at the tall root
   stump (about 6 tries); what works is the spring mushroom beside it (lift, held flick up, steer onto the lip). Teach the mushroom,
   or let the grab work.
3. [major, UNFAIR, rule 7/2] 2-6 version 1 upright, 0-11%: "Up through the village! Slide up a post" comes at 2% after you've
   passed the ladder, and upright shows only dirt wall; about 90 s lost before "Still stuck? Follow my arrow." Plank ends walk you
   off to the floor. Version 7 shows the ladder straight away.
4. [major, HARD BUT FAIR, but World 1 band] 1-7 bird: hearts 5 to 1 in about 80 s, 3 lives in version 1; upright the next bush is
   often off screen; a small fern at ~12% didn't hide him.
5. [minor, rule 4/8] 4-5 23%: a tall block a floor double jump can't reach while Dot says "Flick up again midair to jump twice";
   the way is to climb back up the step you dropped from (about 5 tries; failed after 4 in version 7).
6. [minor, rule 7] 1-7 version 1, 34%: "The squirrels' acorn tree! Carry one out with you." The bot never got an acorn and walked
   on to 73%. If optional, word it so; if not, it can be walked past.
7. [minor, rule 8; CONFIRMED on #43, 3-1 too] "Hurt? Grab a heart to heal." shows at 5 of 5 hearts (1-7 8-10%, 3-1 13-14%).
8. [polish] 2-6 version 7, ~9%: Pokey stands a few px past the plank's end, in the air.
- Variety: real in 1-7 (canopy secret, acorn tree, double-jump spot 53% vs 63%) and 4-5 (opening line, flag); 3-1's cave mouth
  changes but the deadly gap is the same in both; 2-6's opening was the same in both as far as reached (rule 6).
- Memory: peaks to 42/84 MB at 3-1 v7's end, back to 15 MB after; no page errors.

# Batch sent 2026-10-29 (E, on Matt's "send")

## E. 2026-10-29: vine retest (PR #45) and four new players (sheet rows 2195-2400)
1. [PASS, by state, PR #45 fa5d173, upright] Vines on 1-6, 2-4, 2-7, 4-4, 5-4: 16 lianas held for 20 s each with the thumb pumping
   left/right. Pokey stayed on his own vine every time (no other vine taken), no position jumps over 24 px, swings 0.21-0.45 rad.
   (Some lianas the script's drop didn't catch; none of those that caught misbehaved.) Not on a real iPhone.
2. [lead, rule 11] Age, iPhone, iOS 26.7, Facebook's in-app browser (session 347v): Pokey never moved in 37 s. Steer, taps and a
   jump all reached the game (move right, jump inputs logged) but his position stayed x 140; a "skip" offer had come up at 2.8 s.
   A minute later Age reopened in Safari (jr4a) and played fine (finished, 6 hurts). Jane in the same Facebook browser played fine,
   so it isn't every Facebook open. Worth a look at what the skip offer does to touch in an in-app browser.
3. [pattern, rule 3/4] All four new players looped through "Short hops > Long jumps" several times before getting on (Jane 111 s,
   CAnn 73 s, Age 67 s, Logan 28 s); Jane's survey: hardest "Long jumps"; Age: "Hide from the eagle"; Logan: "Running".
4. [rule 11] All on iPhones, frame rate 21-30 (median 25-30). Logan (Safari 18) had 8 stalls of 130-220 ms after the eagle and snake
   sheets loaded mid-run (blank-wait family, B2). CAnn's phone is small (320 x 485), on Easy, 2.4 min.
5. [blocker, rule 11] Sally (Sasa, Android 16, Chrome 156 inside Facebook, Adreno 735 with hardware drawing, 8 GB; small screen
   320x649; Easy; build 2026-10-29 04:53 ET), 11:29-11:51 ET (session 20261029-1128-5ziw). First control-test run: a steady 30 fps,
   finished in 4:09 ("smooth"). She pressed Play Again (390 s, mix seed 56672: River logs, Bounce, Stepping stones, Hide from the
   eagle, Sleeping...). At 411 s, in Short hops at x 1423, every frame became a 250-340 ms long task, and it never recovered:
   about 3 fps, then 2 fps for the next 11 minutes, even at the lowest quality (q2, 320x649 canvas). Memory flat at 21/25 MB, no
   leak. The slow-phone tip fired at 432 s. She quit at 1074 s: "Too slow this time, made it almost impossible." Not the
   software-drawing problem (her phone has a graphics chip), and the main thread is what's stuck. Either something in that
   replay costs ~300 ms a frame, or the phone throttled hard mid-run. Worth replaying seed 56672 into Short hops on a slow phone.

# Batch sent 2026-11-01 (F, on Matt's ask): 5-M on 0.9.0 (main 19308400), Matt bot + QA state checks
1. Log "high way" over a pit before every room: possible by state (clean hops land every time; log 4 to ledge 7/7) but four precise
   hops over a pit with a 10 s climb back on any miss; the bot fell ~15 times. Suggested an exit from the pit near the far wall.
2. Room 2 gate: no feedback (C11 still). 3. Room 3 knot under the HUD sideways. 4. Room 3 knot hint ~35 s late. 5. Room camera
   leaves Meeca at the edge, jumps ~300 px. 6. Steering ignored briefly by a web at room 3. 7. Opening card needs 2 taps; pick-up cue.
- Rig note: `warp 5` puts Meeca inside the pit before room 5 (box x0 - 260 lands in it); move the warp clear before the next run.
- Not covered: rooms 1, 4, 5 and the ending.
- 2026-11-01 later (sent): 5-M rerun, rooms 1/4/5 Normal + whole stage Easy at Fold size, with the QA_WATCH monitor. Invisible and
  fall-through: not reproduced (no hits in play). Found: room 4 has no nudge (checked: butler lines only), room 5 shy steps drop her
  (target step may be unlit on landing), Easy corridor log gap before room 1 looks like the route, pit hint too late, hearts not
  picked up on Easy, chair hold inconsistent, Meeca half in the wall in room 5. Ending never reached.

# Next batch (not sent yet)

## G. Matt's own 5-M run, 10/31 11:35 PM ET (session 20261031-2335-bijv, rows 3034-3053, 0.9.0 build 21:52:15, Pixel, Edge, Normal)
Finished in 5:14 (finish 314). Survey: "Missing Meeca. Falling thru floor. Repetitive. May be worst level in game. Good thought but
horrible execution." 29.8 fps, 4 stalls, no governor steps.
1. [blocker, UNFAIR, rule 7] Room 4 (tea) killed him twice (lostLife 'pit' at 233.6 s and 244.3 s; rooms are meant to cost no life).
   Both times: he drops into the trough (lands x 24864, y 640, 60 px below the 580 floor), jumps to get out right, and is held at
   x 24869 while airborne at y 450-560 (steering right, vx 0: something blocks the way up and out), then slides right low along
   y 630-640 to x ~24930, and from there drops past 694, 714 straight down to y 1316 (pit) at x 25225. That drop out of the trough's
   level is very likely his "falling thru floor". Respawn at the 24363 flag both times. QA's own build rolled a different room-4
   layout (trough at x 25350-25460 with a plank), so his exact layout couldn't be replayed.
2. [lead, "Missing Meeca"] Room 5: at x 30411, y 330 the "stop to look" scene starts (her state 'g:look', input ignored ~27 s to the
   finish) and the camera jumps dy 266 px in one frame (camjump at 301.5 s). A sudden 266 px pan is a candidate for her vanishing
   from view; no other camera jumps in the run.
3. [rule 6] "Repetitive": matches the bots' look-alike log rows before every room.
