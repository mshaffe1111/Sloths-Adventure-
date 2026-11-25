# ENG-DARK REPORT (the dark + light ring as one gen2 brick; WORLD-3-PLAN F2; R-165.449)
**EXACT NEXT STEP (ENG-DARK-c hand-over, 12:06 PM ET by `date`; code head b71163ea on t-eng-dark-wip: box 2's code + glowJump):**
(1) **Box 3's runs are still going in box 3's container; box 3 records them here when they end (do not re-run them):** castBots on the
3-1 draft on a frozen BASE c1008d8e (no dark), seeds 4-21 and 22-40, both settings, every bot (seeds 1-3 done: item 3 below), then the
per-bot table base vs dark (653bb970's x40, box 2) by rescues and by cause. **Box 2's lockall --check is RECORDED: PASS, 102/102 unchanged on a
frozen 653bb970 vs c1008d8e ('Box 2's runs' below)**; glowJump (b71163ea) changes only the bots, so the lock is re-run once on the final
merged head at landing (`lockall --layouts 16 --out lock-base.json` on a frozen t-eng-w3 base, then `--check` on the frozen final head).
(2) **Box 4: fix cause 2 FIRST (traced below, a toy each way), then ONE castBots x40 on the 3-1 draft on the frozen head with both
fixes** (not one x40 per fix; 3 lanes: seeds 1-14 / 15-27 / 28-40, both settings, every bot,
`--rows`; at most two heavy runs at once). PASS: unlit 0 of the 55 'landing dark' (the glowJump fix, item 4 below), shrine >= 359/360,
rescues not up vs 653bb970's 1,393. **Then cause 2, traced ONCE by box 3 (one more trace owed), child Normal seed 19, rim (974, 3098), the
left end of piece 974-1154; identical on 653bb970 and b71163ea (glowJump does not touch it):** he lands on the piece 2 px from the rim
at 37.0 s; at 37.6 s he is carried 41 px right with NO pad (vx 154, pad {}: find what moves him), then stands STILL at x 1014 from 37.8
to 41.6 s (3.8 s) and the rim's landing light NEVER wakes (so from that spot/facing glowReaches misses it: check his facing and the
light's x against GLOW_REACH.back 260); at GLOW_GIVEUP 4 s he gives up and walks off at 42.07 s, landing dark (unlit #1). glowGaveUp is
then PERMANENT for the run: back at the same rim after the rescue he dithers (run-ups right and left) and goes over at 48.53 s 0.34 s
after the light woke from an incidental pause, with no stop at all (unlit #2, the 'woke too late' kind). Trace: `FT_FRAMES=36,42.2
npx tsx reference/qa-reports/ENG-DARK/onerun.mts child normal 19` in a frozen worktree (its default cap is 360 s; castBots runs past
it). Fix candidates (a toy each way on this row): the stop is taken WHERE it wakes the landing (within GLOW_NEAR of the rim, facing it;
a stand that cannot reach the light steps nearer instead of waiting out GLOW_GIVEUP), and a give-up ends with the visit (a rescue or
leaving the piece clears it), never for the whole run. **The lead's question for this kind (bot fault or lay fault?) is still open
here:** if a stand ON the rim's piece facing the rim (x 1014, 40 px in) cannot wake its landing's light, darkGaps passed a rim no stop
on its piece wakes from that spot: then the verdict has a hole, plant it (a RED roll where the only stand spots miss the light) before
the fix. Second trace owed: middle Normal 13 (rim 248, 8746 at 112.50 s) or 29.
(3) Then: the plants on a frozen final head (`planted-faults.py`, 13 now: PASS 13/13 CAUGHT), tierBots 9/9, the suite (3 shards) +
the CI tool line once on the final head; land on t-eng-w3 by the lead's landing rule below; send the lead the hash, the READY measures
and that ENG-SPORE can start (the light API: reference/architecture/ADR-004-timed-lights.md on the lead's branch).
(4) **STILLS APPROVED by the lead.** Dot's card upright under Pokey (stills item 2(d)) is filed as **R-165.456** (FIX-CARD-DOWN, its own
job: on a down stage the card sits above him); not this lane's.
**The lead's landing rule (ENG-DOWNBOT-f lands on t-eng-w3 today too; both lanes touch tools/inspect/firsttimer.ts and the gen2 lay):**
whoever lands SECOND merges origin/t-eng-w3 first and runs the OTHER lane's tests on the merged head before pushing: dark.test,
darkBots.test, w3.test, tower.test, castBots.test (the down toys) and lockall. Name every conflict here; never resolve one by dropping
the other lane's lines.
Box 3 start 11:50 AM ET, box 2 11:31 AM ET, box 1 11:03 AM ET (by `date`).

## Box 3 (ENG-DARK-c) so far (start 11:50 AM ET by `date`)
1. **Plants 12/12 CAUGHT** on a frozen 653bb970 (worktree, `planted-faults.py`, exit 0): box 1's 10 + the glow counter on every stage
   ('the lay leaves every other stage') + the bots' stop removed ('the dark's skill: he stands').
2. **STILLS of a dark shaft, asleep and lit (for the lead to judge): `reference/qa-reports/ENG-DARK/stills/`** (2x, JPEG q85), shot on a
   frozen 653bb970 by `reference/qa-reports/ENG-DARK/darkshoot.mjs` (draftshoot.mjs's harness: vite on a refused-if-busy port, the
   served tree checked as the worktree by the listener's cwd, the port killed after). 3-1 draft roll 1 (flow down, 42 drop rims with a
   light). Pokey pinned 30 px inside a real dark rim, facing it. ASLEEP: every wake cleared, his stillness held at 0. LIT: the stop let
   run; the landing's light woke at +0.76 s / +0.79 s of game time (GLOW_STILL 0.7 + the wake's travel), shot 1.5 s after it woke
   (DARK_AHEAD Normal 1 + 0.5).
   - `3-1-port-rim0-asleep.jpg`, `3-1-port-rim0-lit.jpg`, `3-1-land-rim0-asleep.jpg`, `3-1-land-rim0-lit.jpg`: rim (1031, 1944), going
     right, its landing 281 px below.
   - `3-1-port-rim1-asleep.jpg`, `3-1-port-rim1-lit.jpg`, `3-1-land-rim1-asleep.jpg`, `3-1-land-rim1-lit.jpg`: rim (385, 6346), going
     left, its landing 164 px below.
   **My polish check (as Matt on a phone):** (a) the dark is dark enough to matter and never black: rock and ledges faintly there, the
   sleeping glowworms read as dim blue worms with a small glow. (b) Lit, the landing under the rim reads in all 4 lit stills; the pool
   reaches that landing, the shaft below stays dark (the bound shows). (c) Nothing under the HUD (hearts, lives, the log bar, the menu
   leaf) in either orientation; Pokey and the landings are clear of the phone's edges. (d) **ROUGH, named, not fixed here:** upright, Dot's
   card sits just UNDER Pokey: in `3-1-port-rim1-lit` ('Too dark to see. Stand still and listen...') it covers the glowworm that just
   woke (only its head shows over the card), so the cause and effect (he stopped, the worm woke, the way lit) is hidden while the card is
   up; in `3-1-port-rim0-asleep` it covers the ledge under him. In a stage that goes DOWN the way on is below him: the card belongs above
   him. Here the cards fire because the pin moves him into the zone (the zone's line on entry); in play the same line fires on his first
   dark entry, i.e. at his first stop. The card's placement is not this lane's file (the lead's call: an R-number and a lane).
3. **THE RESCUES, base vs the dark, seeds 1-3 (27 runs each; castBots on a frozen c1008d8e vs box 2's x40 rows on 653bb970; base rows: cast-3-1-base-c1008d8e-s1-3.jsonl):** the
   layout is the SAME (platforms and flags hashed equal on seeds 1-3, both trees), so every difference is the bots' play in the dark.
   Rescues 90 base -> 102 dark (+12; child Easy +7, middle Easy +4, adult Normal +2, expert/kid/middle Normal about even). The KINDS
   are the same (numbers stripped, base -> dark): 'in a dip N px deep, the way on is N px down' 56 -> 69; 'the way on is N px down'
   20 -> 29; 'a trunk beside him...' 9 -> 8; 'fell back down from here N times' 5 -> 5; no kind the base lacks. Traced: adult Normal
   seed 2 (base clean, 129.5 s; dark 173.4 s, 1 rescue at (784, 6177) at 81.2 s): a clean 2 s dark stop at (698, 5554), then he
   dithers between two storeys (piece 34 and 157: back up a jump, down again) where the base also logged 'the way on is 85 px down'
   at (514, 5699) and recovered without a rescue. Reading so far: the dark adds no rescue kind of its own; it moves when he reaches
   the down shaft's storeys, whose dips are ENG-DOWNBOT's lane. The base x40 (item (1) above) settles the per-bot numbers.
4. **The unlit crossings, cause 1 of 2 FIXED (box 2's x40: 58 unlit, 55 'landing dark'; the expert 26):** traced twice, the expert Normal:
   seed 12, the jump pressed at x 509 for the rim at 594 (94 px out) at 81.27 s; seed 10, pressed at about x 160 for the rim at 70 at
   122.93 s, after a stand broken by small steps every 0.65 s (his stillness never reached GLOW_STILL 0.7 s). A running jump over a dark
   rim is pressed before he is within GLOW_NEAR 90, so glowWait never stopped him. **Fix (firsttimer.ts glowJump, read at the top of
   startJump before any jump state moves):** a jump toward a dark rim on his piece within GLOW_JUMP 200 px whose landing is not yet lit
   DARK_AHEAD starts the dark stop instead (glowWait then holds him until lit + stopReact). Not by widening GLOW_NEAR (a press from further
   out would escape the same way). **Toy (darkBots.test 'holds a running JUMP'), the expert on the draft's roll 12, first 85 s:** RED on
   653bb970 (the rim at 594, 4355 gone over with its landing dark at 81.60 s), GREEN on b71163ea; **plant 13** (glowJump not read):
   CAUGHT (RED). dark.test + darkBots.test **12/12 GREEN on a frozen b71163ea**. **The lead's question (bot or lay?): a BOT fault** for
   both expert traces: no stop was ever started (the press came first), so the light was never asked; the lay's own verdict holds there. The x40 that proves it on every bot: item (2) above.
5. Owned: for about 4 minutes three runs went at once (the two base lanes + the targeted dark tests), past 'at most two heavy runs'.

## Box 2 (ENG-DARK-b) done (all on the real 3-1 draft row)
1. **The lock's cause fixed first (box 1's RED: 37 gen2 stages moved in proto.gen2 only):** dark.ts glowFlags writes its glowworm
   counter into `extras` only when it hung a glowworm. Planted: dark.test.ts 'the lay leaves every other stage as it was' (1-1 and 6-1,
   seeds 1-2: no glow key in proto.gen2): RED with the counter written everywhere, GREEN with the fix; and in planted-faults.py.
   The lockall re-run to zero moves is item (1) above (running). The lesson: anything a lay writes into extras reaches every stage's
   proto (the lead's note).
2. **The bots' skill for the dark (firsttimer.ts glowWait; level.md rule 21):** grounded on a piece with a rim in the glowworms' dark
   he is heading over (darkRims, read once), within GLOW_NEAR 90 px, its landing's light asleep or lit under DARK_AHEAD[setting] s: the
   thumb comes off and he stands, facing the rim, until the light has been lit DARK_AHEAD + his stopReact; a light that has not woken
   in GLOW_GIVEUP 4 s he gives up on (litAhead names that crossing). Read before any other plan steers him (read after the freeze, a
   landing's own steer walked the KID over the next rim). The late lift-off arms ONCE at that stop for every bot (KID and ADULT
   re-arm it every frame, R-165.59's documented quirk, so a stop never stopped them: the KID's first run walked off 12 of 57 dark rims
   unlit); elsewhere KID/ADULT play exactly as before. `noGlowWait` removes it (the plant).
3. **Every bot run watches the dark:** FTRun.dark / the castBots row's `dark: {crossed, unlit}` (RimWatch each frame on the engine's own
   glowWake; unlit = litAhead's names). RimWatch fixed: a rim's piece he left some other way (a vine, its other end, a rescue) is no
   crossing when he later walks past its end on ground below (the ADULT Easy run counted a rim 281 px over his head). Toy: RED before,
   GREEN after.
4. **Toys each way (src/game/gen2/darkBots.test.ts, the whole ADULT run's first minute on the draft's roll 1 in the real engine):**
   with the skill every rim he went over was lit 1 s ahead (GREEN); noGlowWait: he walks off into the dark (RED). dark.test.ts +
   darkBots.test.ts: 11/11 GREEN on 653bb970.
5. **Seed 1, one run each (before the x40):** first version (the stop read after the freeze), all 9 rows: dark rims crossed 24-78 per
   run, unlit 0-2 per run. After the read moved: KID and ADULT both settings only: unlit 0, 0, 0, 1 (the 1 was RimWatch's false
   crossing, fixed in item 3, NOT re-run since: the x40 on 653bb970 measures every bot). Every run reached the shrine with 3-5 rescues,
   all in the down shaft's storeys (next step (2b)).

## Box 2's runs (recorded by box 2 after its hand-over; nothing new started)
**lockall: PASS.** Base lock recorded on a frozen t-eng-w3 c1008d8e (102 stages, 3,264 builds); `lockall --layouts 16 --check` on a
frozen 653bb970: **102/102 stages unchanged, exit 0** (Worlds 6 and 8 included: box 1's 37-stage move is gone). Its info line, not
hashed: 'gen2 gained verdicts and drops' on the same 37 gen2 stages (the new darkGaps/darkFlags verdicts listed on every gen2 stage;
no build moved). Re-run it after the merge with t-eng-w3 at landing (the lead's landing rule).

**castBots x40 on the 3-1 draft, both settings, every bot, frozen 653bb970 (rows: reference/qa-reports/ENG-DARK/
cast-3-1-x40-653bb970.jsonl, 360 rows, 0 errors):**
| bot | setting | shrine | clean (0 rescues) | rescues (runs) | dark rims crossed | unlit (runs) |
|---|---|---|---|---|---|---|
| kid | normal | 40/40 | 0 | 151 (40) | 1954 | 3 (2) |
| kid | easy | 40/40 | 0 | 192 (40) | 2854 | 1 (1) |
| adult | normal | 40/40 | 1 | 120 (39) | 2052 | 0 |
| adult | easy | 40/40 | 0 | 202 (40) | 3547 | 2 (2) |
| child | normal | 40/40 | 1 | 135 (39) | 1094 | 5 (4) |
| child | easy | 39/40 | 0 | 179 (40) | 1424 | 4 (4) |
| middle | normal | 40/40 | 3 | 115 (37) | 1034 | 6 (5) |
| middle | easy | 40/40 | 1 | 184 (39) | 1463 | 11 (9) |
| expert | normal | 40/40 | 0 | 115 (40) | 1028 | 26 (10) |

- **Shrine 359/360**; the one miss: child Easy seed 25 'stranded' at 295.9 s after 4 rescues (last stuck: 'the way on is 131 px
  down' at x 1110; 'in a dip 281 px deep, a trunk beside him, the way on is 70 px down' at x 1107).
- **'Every gap lit 1 s ahead' (litAhead): 58 of 16,450 dark crossings unlit (0.35%), in 37 of 360 runs**: 55 'landing dark', 3 'woke
  too late'. The expert is the worst (26 in 10 runs): e.g. seed 10 rim 70,6672 at 123.27 s; seed 12 rims 594,4355 and 644,6744. NOT
  yet traced (box 3: two traces per kind; likely a press from beyond GLOW_NEAR (a running jump over the gap) or a landing past the rim's
  90 px with speed).
- **RESCUES ARE THE BIG RED: 1,393 in 357 of 360 runs; only 6 runs clean** (adult N 6, middle N 2/26/28, child N 26, middle E 37).
  Causes (stuck[].what, numbers stripped): 'in a dip N px deep, the way on is N px down' 1009; 'the way on is N px down' 256; 'fell
  back down from here N times' 99; 'a trunk beside him, the way on is N px down' 93; 'in a dip, a drop of N px ahead, the way on is N
  px down' 75; the rest under 60. Every top cause is the down shaft's storeys. NOT shown yet whether the dark adds any: box 3's (2b)
  (the same castBots on a frozen c1008d8e, no dark, seeds 1-3, by cause) answers it; ENG-DOWNBOT's landing on t-eng-w3 is what these
  wait on if the base has them too.

## Box 1 END results (kept)
Plants 10/10 CAUGHT on frozen 6ba641166. lockall --check on frozen 6ba641166 vs c1008d8e's lock: 65/102 unchanged, exit 1 (37 gen2
stages in proto.gen2 only: the glowFlags counter; fixed in box 2 item 1).

## Done so far (box 1; all on the real 3-1 draft row, GEN2_DRAFT readied)
1. **gen2/dark.ts, the one brick:** World 6's darkZone LIFTED (fireflyZone, unchanged code); w6Swing.ts re-exports W6S_PROP/W6S_PROPS/
   DARK_ZONE/darkEnds/W6S_EMIT from it (World 8 imports unchanged). New end prop `darkToGlow` (DARK_GLOW_PROPS) and `darkEnds(a, b,
   'glow')`: a box over both ends' ground (320 above the higher, 260 below the lower) and one SLEEPING glowworm (id from
   sink.extras) over the landing of every rim in it (darkRims: a hop's far piece, else the first piece under the rim).
2. **The wake reaches below, bounded:** zones.ts GLOW_REACH gains up 240 / down 420 (3-1.md's proposed data) and `glowReaches(light,
   x, feet, facing)`: ahead is the way he FACES (a way down runs both ways). engine.ts stepGlowworms reads it; the dark's presence
   (darkShow) and the glowworm filter read the zone's box in y too, so a dark stretch in a shaft darkens its own storeys only.
3. **World 3 lays it:** w3.ts w3Drops carries darkEnds('a', 'c', 'glow'); the kit lists DARK_GLOW_PROPS and emits DARK_EMIT.
   Probe (probes/zones.mts): seeds 1-6 both settings: 12 dark stretches, 59-67 glowworms, 61-70 rims, darkGaps 0 on 12/12.
4. **The verdict 'every gap lit 1 s ahead' (GAME-MAP B9), two named halves:** `darkGaps(stage)` (laid: every rim in the dark has a
   light over its landing; a sleeping one is woken by a stop on the rim's piece facing it) and `litAhead(crossings, setting)` (a run:
   each rim he went over, its landing lit DARK_AHEAD = Normal 1 s / Easy 1.6 s before; RimWatch records the crossings per frame).
5. **dark.test.ts 5/5 GREEN** (the real engine, RealPlay on the draft): the lift is the same object; darkGaps clean seeds 1-4 both
   settings; a stop 30 px from a real rim wakes the landing 194 px under it and NOT a light 600+ px under him; walked off at once:
   litAhead RED ('landing dark'); stood 2 s then walked: GREEN Normal, RED Easy. planted-faults.py: 6 plants (running at hand-over).

## Ruling A (APPROVED by the lead, with a flag verdict): flags and animals in the dark
'Nothing stands in a zone' (pipeline flagInZone/foeInZone, levelCheck.ts:1145-1149) took every flag out of the glowworm dark: the
draft failed to build (flags 5,000-9,000 px apart). Built as **A**: zones.ts `keepsClear(z)`: every zone but a dark whose lights
sleep keeps the rule; the firefly dark (Worlds 6/8) keeps it unchanged. The lead's added verdict: `darkFlags` names a flag in the
glowworm dark where standing still lights no glow within DARK_FLAG_LIT = 1 s (GLOW_STILL 0.7 + the wake's travel); the lay's half,
`glowFlags` (pipeline, any world), hangs such a flag its own glowworm. On seeds 1-6 both settings 3 of 12 rolls had one before
glowFlags, 0 after. Toys: 'ruling A' (3-1's first roll builds with flags in the dark; 3-10 of 15-18 flags stand there) and 'darkFlags'
(RED with the glowworms near a flag hung out of reach; GREEN as laid). dark.test.ts 7/7 GREEN.

## The light API for ENG-SPORE (APPROVED by the lead as the architect's call, recorded in reference/architecture on the lead's branch)
darkRims/darkGaps read `zone.lights` of every `dark` zone; RimWatch asks the harness `lit(light)` for when a light woke. A puff's
light enters as a dark-zone light with a clock (proposed optional field `clock` on Zone.lights: the spore zone's period/warn/active/
offset; the Architect's OK, it is a type): the engine's darkness draw lights it while zoneState is warn or active, lit() returns the
start of its current window, and darkGaps counts a rim lit by it when its window >= DARK_AHEAD + the drop's air time.

## What 3-1 / 3-2's READY can measure (once the bot skill lands)
darkGaps(stage) == [] on every roll both settings; litAhead == [] on every castBots run of every bot (a per-row field); the wake
toy (a stop wakes the landing under the rim, not the shaft); plants RED.

## Polish check
Not yet: stills owed (step 5). Seen in numbers only: glowworms hang 90 px over each landing's near end, r 190.
