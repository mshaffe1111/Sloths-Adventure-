# PITCH-23B: 2-3, 2-4 and 2-5 (Pitcher B, xhigh; blind to Pitcher A). Packet reference/packets/2026-11-18/PITCH-23-25.md; method reference/methods/pitch.md
Base: origin/main 6e7b85f8f (0.9.9). Every code fact below was read on that commit (file:line); every quote is from a page opened this session (URL);
[S] marks a mechanic fact from my own knowledge with no page I could open. Started 9:50 AM ET 11-18.

## The packet's FACTS, checked on main (law 3)
| Claim | Verdict | Where |
|---|---|---|
| World 2 is on gen2 | **PARTLY.** The kit exists (w2.ts:1-25; listed.ts:40, :46 kits w2, w2-21, w2-22), but only 2-1 and 2-2 roll on it. 2-3..2-9 are still the hand builds | w2Stages.ts:2-3, :33-35; 2-3's 5 cages :44-45; 2-5's 14 snappers :42-43 |
| River + logs + river bot skills | WIRED | gen2/riverLay.ts; tools/inspect/firsttimer.ts:642 SKILLS { ride, upstream, bankUp, handed } |
| Shallow / deep water | WIRED | w2.ts:6-10 (a `water: true` gap is deep; every other gap splash-back) |
| Sinking pads, pads on a beat, their bots | WIRED | pieces/padPiece.ts:6, :58; gen2/rideLay.ts:334-385; firsttimer.ts:86 PAD_SKILL { keepHopping, waitRise, breath, outBack } |
| Spur + rope, crown lily | WIRED | w2Arc22.ts:8, :18, :78 |
| Lianas in World 2 | WIRED | w2.ts:105-116 W2_LIANA (World 1's self-swinging liana, anchors 400-420 px) |
| Watchers (1-7) | WIRED, and more general than the packet says | watcher.ts:26-56 WatchZone { calm, freeFirst, warn, pass, **setback** }; gen2/stillLay.ts:185 lays setback ("scare him back to this x, no heart lost", watcher.ts:45-48); stillness.ts:69, :85 watcherSees / inCover take any point |
| Followers (follow.ts) | **MISSING.** No follow*.ts in src/game; no follower code anywhere | `ls src/game/*follow*` empty |
| Snap-jaw stones (beatBrick 'bites') | **EXISTS-UNWIRED.** Defined and tested; no piece reads it (padPiece.ts:58, :104 call brickNow('gone') only) | beatBrick.ts:11-12, :31; beatBrick.test.ts:8-13 already models the jaw: beats 1-3 safe, bites on 4, BEAT 0.75 s, WARN 0.5 s, easyStretch 1.4 |
| (extra) Predators on the beat | WIRED contract | predators/types.ts:84-88 `onBeat` (tell on 'warn', act on 'on'); used by World 6's frog (world6.ts:25) |
| (extra) Snapping turtle | EXISTS-UNWIRED in gen2 | predators/world2.ts:12-17 TURTLE (stomp -> stunned 1.8 s, kick -> chasedOff); no gen2 stage lays it |
| (extra) Rescue cages in gen2 | EXISTS-UNWIRED | pipeline.ts:426, :509, :3571 lay 'cage' quota items for a rescue; engine.ts:3277-3278 "Cage is freed when punched"; goals.ts:67; no gen2 stage is a rescue yet |
| (extra) Flag rule | cite moved | 2-1.md/2-2.md cite STAGE-RULES:105-109 for flags; those lines are now the dead-zone rule. The live rule: pipeline.ts:1748 ROLLED_FLAGS { first 700, min 900, max 4000, before 2400 } |
Difficulty (pasted, DIFFICULTY.md:63): "target(w, s) = 10(w - 1) + T[s], T = [-0.5, 3, 4.5, 3.5, 6, 5, 8, 7, 10]". So **2-3 = 14.5, 2-4 = 13.5, 2-5 = 16.0** (inside "World band
[10w - 11, 10w + 1]", :62: 9..21). Easy at most 0.6 x (:61): 8.7 / 8.1 / 9.6. If the lead keeps PICKS-19-22's -0.5 on 2-1/2-2 (9.0, 12.5; PICKS:25, :34): 14.0 / 13.0 / 15.5.

---
## 2-3 Stuck in the Reeds: "Walk Them Home" (rescue, 5)
**One idea:** "Punch open the reed cages and the little ones follow you home, slower than you: when the heron looks up, get everybody into the reeds."
A player says: "the one where the babies follow you and you hide them from the heron." **The hook:** all game Pokey is the slow one; here, for once, he is the fast one
and the little ones set the pace (World 2's patience: "a village of waiters"). 1-7's stillness comes back turned around: the heron never wants Pokey (too big), it wants THEM.
**Why it is fun on a phone:** the same one thumb; the new thing to read is BEHIND him (a little parade) and ahead (the heron's head). Running stretches the line; stopping pulls it in.
Upright (about 425 px, he stands about 155 px from the left: level.md World 1 notes) a bunched line of five at 34 px (170 px) all but fits behind him; the HUD shows five little
faces, each lit while its little one is in cover, so a tail off-screen is still read. Sideways: the whole line and the heron. Red Light, Green Light, which every child knows.
**The rules (minimal, so it builds):** a freed little one joins the end of the line and walks HIS recorded path (sampled by distance: where he hopped, it hops), at most 190 px/s
on Normal (two-thirds of his 285, physics.ts:13; Easy 230), never closer than 34 px; when he stops they close up and duck. They never fall, never take a heart, are never hurt
(level.md rule 4). Over splash-back water they paddle along his path (capybaras, otters and ducklings all swim). They don't take ropes or vines: they wait at the foot and rejoin when
he is back down. The heron is a WatchZone (calm, warn 2.0 s, pass 2.6 s: watcher.ts:53-56, or the stretch's own) whose look reads the LITTLE ONES (watcherSees/inCover per little one):
one that moves or stands outside a reed clump in the look scampers back to the stretch's start (the zone's setback) and waits; walking back to it rejoins it. The exit counts them home.
A lost heart puts the line back behind him at the flag (GAME-MAP's "a fall makes them wait at the last flag", kept). Reed clumps (cover, letter m) hold him + five: 260-300 px on Normal, 340+ on Easy.
| # | Beat (token) | s | bits | What is there | He does | He feels |
|---|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | 0 | Misty reed marsh; a reed cage glints; the keeper's line on cages 800 px+ before (rule 6) | Walks in | "Someone's crying" |
| 1 | **The first cage** (T g1) | 14 | 0 | One cage on the bank (w2-cages whole/cracked/burst) | Punches it (1-3's move); a duckling hops out and follows; he runs, it lags; he stops, it catches up | "It's following me!" |
| 2 | **The heron, safe** (P m1) + flag | 16 | 1.0 | A heron in the shallows, one wide reed bed; its first look only warns (WatchZone.freeFirst) | Stops in the reeds; the duckling closes up and ducks; the heron looks, sees nothing | "Shh... down." |
| 3 | **Over the stones** (P w1, soft) | 12 | 0.5 | Stones over splash-back water; cage 2 on a reed island | Hops across; the little ones paddle behind him | "Come on, little ones" |
| 4 | **Clump to clump** (X m2) + heart after | 18 | 3.5 | Two reed clumps across open mud, the heron on its cycle; cage 3 in the far clump | Goes on the calm, waits in cover for the TAIL, not just himself | "Wait for them... now!" |
| 5 | **Up the mooring post** (P r1) | 12 | 1.0 | Cages 4 and 5 on a post (the hand build's idea, w2Stages.ts:8) | Climbs the rope; the line waits at the foot; the freed ones hop down to it | "Five! Everybody here?" |
| 6 | **TWIST: wait, but not there** (W p1) + flag | 16 | 5.0 | 2-2's sinking pads over the marsh (wired). The little ones are light (a duckling on a lily pad is real); HE sinks a pad | Waits for the line on the stones between pads, never on a pad, while the heron looks over the pond | "Not here... on the stone!" |
| 7 | **Everything** (L m2) + flag, heart after | 20 | 7.0 | Two herons out of step over the long marsh, pads, the narrowest clumps, the line of five | All of it | "Almost home..." |
| 8 | **Home** (S f1, signature) | 14 | 0 | The village boardwalk; families on the jetty; the camera leads | Walks past and each little one runs into its family, one by one (the count ticks to 5); the duckling from cage 1 last | "They're home." |
| 9 | Exit (E) | 8 | 0 | The village gate | Walks in | Proud |
Designed 140 s + the line's waits (about 20-30 s): bots 2:00+, or the old pulley cage room (puzzleKit) goes in as a Z room before any padding. Flags by ROLLED_FLAGS (pipeline.ts:1748).
**Node string (sketch; STEP 0 makes it legal):** `A Tg1<:&cage Pm1<:&heron R Pw1<:#soft Xm2>:&heron R Pr1< Wp1>:#soft R Lm2>:&heron Sf1< E` (V11: m 3 of 8, no neighbours share).
**Engine.** WIRED: the punch frees a cage (engine.ts:3277-3278; goals.ts:67), watch zones with freeFirst and setback (watcher.ts:26-56; gen2/stillLay.ts:185), cover m (stillness.ts:73-95),
pads (padPiece.ts), rope, splash-back water. EXISTS-UNWIRED: gen2's rescue (cages as quota items, pipeline.ts:3571): first stage to use it (data, S). **NEW 1 followers** (M, 3-4 h;
an estimate, not measured: GAME-MAP's 10-16 h + 3-5 h assumed followers with their own physics; this cut is path-replay sprites with none): src/game/follow.ts (pure: trail, pace,
spacing, join, wait at a rope's foot, back to the flag on a lost heart) + its draw (the inventory's capyHappy / duckHappy / otterHappy poses with a hop bob) + the goal "home N" read at
the exit (goals.ts). **NEW 2 the heron reads the line** (S, ~1 h): the zone's sight test run over each little one (stillness.ts:69, :85), a spotted one takes the zone's setback; the heron is
World 2's watcher animal (gen2/stillLay.ts castWatches, as World 1's eagle) drawn from dressnew-w2#w2Heron (mirrored to turn). Bot skills before listing (rule 21, planted toys):
wait-for-the-tail, fetch-the-spooked (M, 2 h). Deleting the hand-built 2-3 and its cage-pulley room tests (w2Puzzles.test.ts) is part of the build (new replaces old).
**Art:** the little ones have still poses only, no walk or hop frames (w2.json); one heron pose. If a hop bob or a mirrored turn reads rough on a phone: one HF job (the lead's call).
**Tributes** (shelf: pre-1990 Pac-Land; lesser-known Oddworld, INSIDE; post-2005 INSIDE; famous few: none; our own: the slow one becomes the fast one, and Red Light, Green Light)
- **Pac-Land** (Namco, arcade 1984; Matt's #3). Loved: "well-received by critics for its colorful graphics, stage designs, and soundtrack"; Computer Gamer: "easy to play once you've got the
  hang of it"; its maker Iwatani calls it his favourite sequel "for its interesting concept and gameplay" (https://en.wikipedia.org/wiki/Pac-Land). Taught: the whole game is one job, "to
  return a lost fairy back to its home in Fairyland", the last trip "having Pac-Man return home to his family" (same page): the walk home IS the level. Ours: someone small is lost; you
  walk them home, and the stage ends when they reach their family. Not copied: the fairy, the boots, its button-run controls [S].
- **Oddworld: Abe's Oddysee** (Oddworld Inhabitants, PS1 1997; Matt's #52). 1-9 used it for one creature with one rule; the reason here is new: its followers. Loved: "the imaginative AI
  ... drew more extensive praise"; GameSpot: it "goes a long way towards making you feel as if you're interacting with an actual world and its inhabitants"
  (https://en.wikipedia.org/wiki/Oddworld:_Abe%27s_Oddysee). Taught: "Abe can command them to follow him", "stay put"; "Mudokons can be rescued by safely leading them past traps and
  enemies to bird portals" (same page). Ours: no commands (one thumb): they follow by themselves, and STOPPING is the "stay put". Not copied: GameSpeak buttons, Mudokons dying, the grim tone.
- **INSIDE** (Playdead, 2016; Matt's #86). Loved: PC Gamer's Rich Stanton, "one of the very best experiences I've had in gaming"; PC Gamer, "the perfect narrative sidescroller"
  (https://en.wikipedia.org/wiki/Inside_(video_game)). Taught: "lines of zombie-like people are moved through mind control" (same page); [S] its factory first shows a line moving in step,
  then asks you to keep in step with it under a watcher's eye. Ours: a line whose moves come from yours, and a watcher that judges the LINE, not you. Not copied: dread, mind control, deaths.
**Different:** 2-1 the world moves him; 2-2 stillness sinks him; 2-3 others move with him and stillness hides THEM, on foot, no log rides. **GAME-MAP:** kept rescue (5), "bring them home",
"wait at the last flag"; changed: the cages on pulleys to punched reed cages, and the heron added as the reason the line matters. GAME-MAP marks this "new mission, needs Matt's OK" (Pushback 3).

---
## 2-4 Over the Water: "Never Touch the Bank" (vine_runner)
**One idea:** "Swing out over the water, let go onto a passing log, ride it under the next vine and grab on: cross the lake without touching land." A player says: "the one where you
drop from vines onto logs and back up." **The hook:** his two ways of moving (1-6's liana, 2-1's log) meet in one moment, and the log turns from a floor into a launcher: the carry
rule (carryRule.test.ts:2: "a jump off anything that carries him keeps its sideways speed") throws him from a moving log up to the next vine. 2-4 is the world's first breather
(its slot value 3.5 < 2-3's 4.5): a joy ride of air time, soft water first, the only question WHEN.
**Why it is fun on a phone:** two clocks, both visible: the swing is his own body, the log's nose slides under the arc. The current runs WITH him, so a log overtakes from behind: it
must show at the left edge upright about 1.5 s before it is under him (at 80 px/s, 120 px: inside the 155 px behind him); logs are 130-170 px long (river.ts:162), so a log is under one spot for only about 1.6-2.1 s at 80 px/s: why Easy gets the lashed pair, and the log's knock (river.ts:96) sounds 3-4 s earlier
when it leaves the bank off-screen. He may hang and wait a log out (a grip he can hold: the grip dial). Sideways: the whole relay, planned at a glance.
| # | Beat (token) | s | bits | What is there | He does | He feels |
|---|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | 0 | The lake's edge; lianas from big fig trees over wide water; the keeper's line 800 px+ before | Looks out | "So much water" |
| 1 | **The first drop, safe** (T s1, soft) | 14 | 0 | A short liana over a splash-back channel, a slow log (70 px/s, river.ts:151) | Lets go as it passes under; is carried to the far bank and handed up | "Plop! It caught me." |
| 2 | **The bank** (P g1) | 8 | 0.5 | Stumps and petals; the next logs knock out below | Watches the beat | "knock... knock..." |
| 3 | **Drop, ride, drop** (P s2, soft) + flag | 16 | 2.5 | Two lianas, a log river under each, a stump bank between | Swing, drop, ride, step off, swing again | "I've got this" |
| 4 | **TURN: up from the log** (X w1) + flag | 16 | 3.5 | A log carries him under a liana no bank can reach | Jumps off the moving log; its speed carries him to the vine | "The log threw me!" |
| 5 | **The fig roots** (P f1) | 10 | 0.5 | Root arches and planks over a reed bed; petals in a swing's arc for the greedy | A breath | "Ahh" |
| 6 | **TWIST: no land** (W s2, deep) + R, heart after | 20+6 | 5.0 | The relay over deep water: liana, log, liana, log, no bank between | Every handhold is moving | "Don't look down!" |
| 7 | **Up to the kapok** (P b1) | 10 | 1.0 | A bounce on World 2's own spring piece up the high bank (rule 9) | Bounces up | "Boing" |
| 8 | **The long relay** (L w2, deep) + flag | 20 | 6.5 | Faster logs (100-120 px/s, river.ts:150-159), two out of step; catches from the logs | All of it, fast | "Faster, faster!" |
| 9 | **The great swing** (S s1, signature) | 14 | 0 | The longest liana in the game from a giant kapok over the lake's middle; a log raft (puzzle-kit#raft) drifting to the village jetty | One huge arc, drops on the raft; the camera pulls out over the lake | "I flew over the whole lake!" |
| 10 | Exit (E) | 8 | 0 | The jetty | Walks off | "Never touched the ground" |
Designed 152 s + waits on lianas (about 20 s): bots 2:00+.
**Node string (sketch):** `A Ts1<:#soft Pg1< Ps2>:#soft R Xw1> Pf1< Ws2>:#water R Pb1< Lw2>:#water Ss1< E` (s = a liana whose landing is the river's log; w = a log river whose way on is
a liana above; V11: s is 4 of 9, the cap 2-1.md read as allowed; no neighbours share).
**Engine.** WIRED: World 2's lianas (w2.ts:105-116), the river lay (gen2/riverLay.ts), landing on a drifting log and the bank handing him up (bot skill `handed`), the carry rule, the
knock, both waters, the liana catch (DIFFICULTY.md:20 canGrabSwing), the release meter (:19). **NEW 1 the vine-over-river section** (M, 2-4 h): gen2/riverLay.ts + a w2.ts row: a liana
hung over a drift window, held fair: a log under the let-go's landing within one grip on both settings, its nose in view upright before the window, the next liana's catch reachable from
the log at the log's speed, and the no-bank relay laid as one section. **NEW 2 bot skills** (M, 2-3 h; tools/inspect/firsttimer.ts): drop-on-a-log and catch-from-a-log, each on a planted toy
(rule 21). **Fly first** (rule 24): a new reference/specs/sims/dropOnLog.ts (like 2-2's hopAir.ts, which is not on main: commit both) flies the let-go onto a log at 70/100/120 px/s on the real engine; its windows set the rows.
Proposed, to be flown: Easy logs twice as long (a lashed pair) at 60 px/s. Deleting the hand-built 2-4 (w2Stages.ts) is part of the build.
**Art:** lianas, logs and the raft exist (w2.json puzzle-kit#raft 171x80; the long log is 2-1's). The giant kapok over the lake may want one HF backdrop piece (the lead's call).
**Tributes** (pre-1990 Bionic Commando; lesser-known The Jungle Book, Grapple Dog; post-2005 Grapple Dog; famous few: none; our own: the log as a launcher, and never touching land)
- **Bionic Commando** (Capcom, arcade 1987 / NES 1988; Matt's #11). Loved: Electronic Gaming Monthly (1997): "having to swing instead of jump added unexpected depth to the platform genre";
  Nintendo Power (2008): "one of its most original action games due to the ability to swing" (both as the page summarises them, https://en.wikipedia.org/wiki/Bionic_Commando_(1988_video_game)).
  Taught: by taking the jump away: "Ladd cannot jump, so he uses his bionic arm to swing across gaps and obstacles" (same page). Ours: a stretch where the swings and the logs ARE the
  floor; depth from what you swing ONTO, not a new button. Not copied: the arm, guns, the missing jump (his jump is the catch from the log), its difficulty. (Check: 1-6.md isn't on main;
  if 1-6 led with Bionic Commando, this reason, no ground at all, must differ from 1-6's.)
- **The Jungle Book** (Virgin Games, 1993/94, SNES/Genesis; lesser-known). Loved: EGM praised its "fantastic" animation, sharp controls and huge levels; GamePro (Game Gear): "younger gamers in
  particular will enjoy Mowgli's charming antics" (https://en.wikipedia.org/wiki/The_Jungle_Book_(video_game)). Its warning: GamePro (SNES) found it "pretty repetitious, centering around his
  ability to swing on vines" (same page). Ours: a child's joy of swinging, never the same swing twice: every beat changes what the swing lands on (bank, log, log-to-vine, the raft).
  Not copied: Mowgli, thrown bananas, its six-minute time limit, the repetition.
- **Grapple Dog** (Medallion Games, 2022). Loved: Kotaku's Ethan Gach: its swinging is "tricky but rewarding", "one of the tightest arcade games of the year"; NME's Will Nelson: its grapple's uses
  ranged from "brilliant" to frustrating (https://en.wikipedia.org/wiki/Grapple_Dog). Taught: [S] fixed points first, moving ones later. Ours: fixed to moving (vine to log), then moving to moving (log to vine).
  Not copied: aiming (NintendoWorldReport: "you can only aim the grappling hook straight up or at a 45-degree angle": our liana needs no aim), the dog, the hook.
**Different:** 2-1 boards logs from the bank; 2-4 boards from the AIR and leaves UPWARD; no pads (2-2), no line behind him (2-3), no beat (2-5). **GAME-MAP:** kept "let go of the vine onto
a log that is moving"; added the turn back up (the log as a launcher) and the signature swing.

---
## 2-5 River Snappers: "Count to Four" (purge)
**One idea:** "The river keeps time: every snapper snaps on four, so hop on one-two-three and be off before four." A player says: "the one where the stones bite on four."
**The hook:** a beat you can SEE. Each snap-jaw stone's jaw opens a notch on one, two, three and claps shut on four (the clock's 'warn' is its creak, beatBrick.test.ts:8; the notches are
drawn from the clock's cycle): a muted phone reads it, the clack is extra. The river's snapping turtles keep the SAME count (predators onBeat): stomp one on its shell right after it
snaps and it ducks off downstream, chased, never hurt, and the stomp bounces him up to a stone he couldn't reach. 2-2's pads LEAVE him (the floor goes); 2-5's stones STAY and bite
(he must leave them): the opposite read of the same clock.
**Why it is fun on a phone:** one tap per beat, counted out loud by the screen; waiting on a plain stone or sandbar between the jaws is always allowed, through any number of bars
(nothing forces a press onto the beat). The numbers are the tested jaw row: BEAT 0.75 s, so a 3.0 s bar with 2.25 s safe; three stones in step take three hops in one bar (a tap hop is 0.30 s in the air,
83 px: 2-2.md's flight, cited at gen2/rideLay.ts:260; hopAir.ts itself is not on main), Easy x1.4 (3.15 s safe). Upright: three stones and their jaws in view ahead; sideways: the whole reach in rhythm.
| # | Beat (token) | s | bits | What is there | He does | He feels |
|---|---|---|---|---|---|---|
| 0 | Arrive (A) | 10 | 0 | The snappers' reach; a clack-clack echoing; the keeper's count line 800 px+ before | Listens | "What's that sound?" |
| 1 | **One stone, safe** (T p1, soft) | 14 | 0 | One snap-jaw stone over splash-back water (a bite costs nothing here) | Stands, watches the notches, hops off before four; crosses on one-two-three | "One... two... three... OFF!" |
| 2 | **The first snapper** (P g1) | 12 | 1.0 | One snapper on a sandbar; its first snap only warns (rule 7) | Stomps its shell right after it snaps; it ducks away downstream (1 chased off) | "Bonk! Off you go." |
| 3 | **Three in step** (P p2) + flag | 14 | 2.5 | Three stones snapping together | Three hops in one bar | "Hop hop hop!" |
| 4 | **Snappers on logs** (X w1) + heart after | 16 | 4.0 | 2-1's drifting logs (wired) between stones; snappers sunning on the banks | Rides, stomps a snapper from the log, bounces to a high stone | "Boing off his back!" |
| 5 | **The rope over** (P r1) | 10 | 1.0 | A rope over a snapper channel (1-3's shimmy); two snappers below on the count | Shimmies over on the safe beats, drops onto one after its snap | "Not on four..." |
| 6 | **TWIST: the canon** (W p3, deep) + flag | 18 | 5.5 | Stones out of step, each a beat behind the last: a wave | Hops onto the one that just snapped, riding the wave | "Follow the wave!" |
| 7 | **The sandbars** (P g2) + R | 14 | 3.0 | Sandbars and four snappers; petals | Clears the reach of snappers | "Off you go, all of you" |
| 8 | **The quickening** (L p3, deep) + flag, heart after | 20 | 7.5 | The beat speeds to 0.6 s (a second clock row), canon and snappers | All of it, faster | "Faster!" |
| 9 | **The Big Snap** (S w1, signature) | 14 | 0 | The old mossy stone mid-river that never snaps; around it every stone and snapper in view | Stands still on it while the whole river claps shut together on four; the last snappers dive away; the drum stops | "SNAP... and quiet." |
| 10 | Exit (E) | 8 | 0 | The far bank | Walks out | "Shhh" |
Designed 150 s + waits on safe stones: bots 2:00+. Goal (purge): chase off 8 of about 12 (a proposal; the hand build asks 14 of 21, w2Stages.ts:42-43).
**Node string (sketch):** `A Tp1<:#soft Pg1<:&snapper Pp2> R Xw1>:&snapper Pr1< Wp3>:#water R Pg2>:&snapper Lp3>:#water Sw1< E` (V11: p 4 of 9; no neighbours share).
**Engine.** WIRED: the stage clock and beat rows (clock.ts; beat.ts:33 beatDef, offsets give the canon), onBeat predators (predators/types.ts:84-88; world6.ts:25), letter p "pods, snap
stones, a ride" (nodeLetters.ts), the river, rope, stomp, the beat-reading bot (PAD_SKILL.breath). EXISTS-UNWIRED: 'bites' (beatBrick.ts:11-12, :31) with its brickFair check (:39);
TURTLE (predators/world2.ts:12-17). **NEW 1 snap-jaw stones in play** (M, 2-3 h): pieces/padPiece.ts's 'bites' twin (solid always, hurts on 'on', the jaw drawn a notch a beat), a stone
row in gen2/rideLay.ts (in step, canon, quickening) held by brickFair, and the bot skill off-before-four (PAD_SKILL's breath read on 'bites') on a planted toy. **NEW 2 the snapper on
the beat** (S, 1-2 h): a World 2 snapper def (TURTLE + onBeat + stomp -> chasedOff: data) laid by the World 2 kit's cast (as w6.ts lays the frog), the stomp-bounce, and its bot skill
stomp-after-the-snap on a toy. Deleting the hand-built 2-5 is part of the build.
**Art:** snap-jaw stones (open, shut) are MISSING (GAME-MAP art list): one HF job, or an inventory stone with a painted jaw (the lead's call). The turtle: dressnew-w2#w2Turtle
(291x161, one pose); a dive-away tween reads fine at that size, or it is a second HF piece.
**Tributes** (pre-1990 Pitfall!, DuckTales; lesser-known and post-2005 Crypt of the NecroDancer; famous few: none; our own: the floor that stays and bites, counted where you can see it)
- **Pitfall!** (Activision, Atari 2600, 1982; Matt's #1). World 1 used its vines and tunnels; the reason here is new: the crocodile heads. Loved: Blip (1983): "It's also a heck of a lot
  of fun"; GameSpot's Jeff Gerstmann: "responsible for launching the platformer genre as we know it" (https://en.wikipedia.org/wiki/Pitfall!). Taught: by the pond itself: Harry can
  "cross ponds infested with crocodiles if their jaws were closed"; David Crane: "to jump from one alligator head to another, the player had to move the joystick and jump at exactly the
  same time" (same page). Ours: stand on the snapping thing while it's shut, taught on one stone over soft water. Not copied: Crane's exact-same-moment timing (ours: 2.25 s windows),
  crocodiles, scorpions, the 20-minute clock [S].
- **Crypt of the NecroDancer** (Brace Yourself Games, 2015). Loved: Gaming Age: "a wildly imaginative take on the formula"; "Monsters move according to predetermined patterns that the
  player must learn": skeletons "only move and attack on every other beat" (https://en.wikipedia.org/wiki/Crypt_of_the_NecroDancer). Its maker found its timing "too tense", "greatly
  expanded the accuracy window" and added "a simple autocalibration system" to "help make the game fairer and remove frustration", later "a 'No Beat' mode" (same page). Ours: the beat is
  the world's, never a demand on every press: wait on a plain stone through any bar, wide windows, Easy stretches the bar. Not copied: every move on the beat, combat, the dungeon.
- **DuckTales** (Capcom, NES 1989; Matt's #21). Loved: EGM: "a prime example of very good game design"; IGN, 10th of its 100 NES games: "Duck Tales is perhaps the best of the bunch"
  (https://en.wikipedia.org/wiki/DuckTales_(video_game)). Taught: "While jumping, Scrooge can bounce on his cane similarly to a pogo stick and attack enemies from above" (same page).
  Ours: the stomp on a snapper's shell after its snap chases it AND bounces him high (PLATFORMER-100.md places "bounce on a creature's back" at World 2's snap-jaws). Not copied: the
  cane, Scrooge, treasure, bouncing on spikes.
**Different:** 2-2's floor leaves him, 2-5's stays and bites; 2-3 is quiet and slow, 2-5 loud and counted; 2-4 has no beat at all. **GAME-MAP:** kept purge (chase off the snappers) and
"safe on three beats, snap on the fourth"; dropped "drop a log on a snapper (1-3's trap)": a second idea (rule 1); the trap returns where a stage is about traps.

---
## Engine order (pitch ahead: what the engine members build before each builder)
2-4 first (its two pieces are data + bots on wired parts), then 2-5 (snap-jaw stones: 'bites' is already tested), then 2-3 (followers: the one real new system). Total NEW, estimated
(not measured; no comparable job in LEVEL-LOG yet): 2-3 about 6-7 h, 2-4 about 4-6 h, 2-5 about 4-5 h, each before its builder's 2 hours.

## Pushback
1. **"World 2 is on gen2" is only true for 2-1 and 2-2** (w2Stages.ts:2-3). Each of these levels also deletes a hand build and the tests that pin it (2-3's cage-pulley room:
   W2_PUZZLES, w2Stages.ts:58; w2Puzzles.test.ts): that work belongs in each build's 2 hours or in its engine packet, named.
2. **Followers are the only big new system in the three.** My M (3-4 h) holds only for path-replay sprites (no physics, no climbing, no riding). If the lead wants followers that
   climb or ride logs, 2-3 cannot meet the packet's size limit: decide the cut before the engine packet.
3. **2-3's mission kind is new** ("bring N home"); GAME-MAP itself writes "needs Matt's OK". GAME-MAP is "not set in stone" (Matt 11-14), but a new mission is his kind of call:
   one question to Matt before 2-3's engine packet.
4. **The flag cite in 2-1.md/2-2.md (STAGE-RULES:105-109) is stale**: those lines are the dead-zone rule now; the live rule is pipeline.ts:1748. The final designs should cite the code.
5. **Each "under 2 hours" build sits on 4-7 h of engine and bot work** (rule 21's toys, rule 24's flights). That is the method working, but the lead should plan the engine slots now.

## Learned (proposed method updates, for the lead)
- pitch.md step 2's hosts, 11-18: hardcoregaming101.net shows a server-move notice (no articles); pcgamer.com and gamesradar.com review pages reach the fetcher as navigation
  only; Wikipedia answered every time. Reception sections praise a game, rarely the one mechanic, so "what players LOVED about the mechanic" is often [S]. Proposed: allow
  developer postmortems (gamedeveloper.com) and say plainly in the packet that a mechanic-specific "loved" may be general praise plus [S].
- Check the code for the general piece before calling something new: the watcher's `setback` (watcher.ts:45-48), `onBeat` predators (types.ts:84-88) and the 'bites' jaw row
  (beatBrick.test.ts:8-13) each turned a NEW into data. Proposed pitch.md step 3 line: "grep the contracts (WatchZone, PredatorDef, ClockDef, BrickOn) before listing a NEW".
- V11's 40% cap shapes a level built round one move (a vine runner, a beat stage): plan the node string with the banks' jobs (g, b, f, r) first, then the beats.

## Report (roles/README.md "The report"; LESSONS "Method used / Lessons applied / Method update")
- **Done-items** (packet): one page per level with the one idea, phone both ways, 3 games each (pre-1990 / lesser-known / post-2005, famous few: none), loved + taught + ours + not
  copied, 9-11 beats with "he feels", a node string, Normal + Easy pasted (DIFFICULTY.md:61-63), the engine list (wired / exists-unwired / NEW with size and file, 2 NEW a level),
  how each differs, kept/changed from GAME-MAP; the packet's facts checked (table above); Learned; Pushback. Gates: see the commit message (knowncheck PASS; roadmapcheck run with every branch fetched, as CI does).
- **Method used:** reference/methods/pitch.md (steps 1-4), level.md's Building rules (1, 4, 5, 6, 7, 9, 21, 24 shape the beats and the engine lists).
- **Lessons applied:** D34 and D52 (every cite read on main, re-checked after the last edit: two stale cites inherited from 2-1.md/2-2.md found and fixed: river.ts:136 -> :151, hopAir.ts
  is not on main); D58 (tribute: loved, taught, ours, not copied); D49/D60 (targets pasted, not typed); D66 (grepped the contracts before calling a piece NEW: setback, onBeat, 'bites');
  D7/D24 (followers "missing" by a whole-tree grep); D25 (every hour figure marked an estimate); D53 (fast gates before the push); D36 (own worktree, branch named before the commit).
- **Polish check:** a design doc, no stills. Read through once for contradictions: fixed one (2-5 said he may stand on a biting stone through a bar), one wrong total (2-4: 152 s), one loose quote (NME).
- **Unresolved:** no flight run (rule 24 is the final designer's: dropOnLog.ts for 2-4, the follower pace and the clump widths for 2-3, the three-hop bar for 2-5); the [S] lines;
  1-6's tributes not checked (its design is not on main).
- **Turnover note:** reference/handoffs/designer.md NOT rewritten: two blind pitchers on the same file would collide at merge, and the packet's WRITE list is this file only. For the
  lead's next designer packet, its update: World 2's state (only 2-1/2-2 on gen2), the contracts that make pieces data (setback, onBeat, 'bites'), the stale flag cite.
- **Suggestions (outside my walls):** (1) a one-line fix in 2-1.md/2-2.md: cite pipeline.ts:1748 ROLLED_FLAGS, not STAGE-RULES:105-109; (2) commit hopAir.ts to reference/specs/sims/ (rideLay.ts:260, :265 cite it).
