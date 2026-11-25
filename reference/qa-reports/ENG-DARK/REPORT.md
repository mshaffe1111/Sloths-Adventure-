# ENG-DARK REPORT (the dark + light ring as one gen2 brick; WORLD-3-PLAN F2; R-165.449)
**EXACT NEXT STEP (ENG-DARK-d hand-over, 12:19 PM ET by `date`; code head ef811c2a on t-eng-dark-wip = b71163ea + the cause-2 fix):**
(1) **Unlit cause 2 is FIXED and it was the BOT (b), not the wake (box 4 item 1 below).** Box 4's x40 is RUNNING in box 4's container
on a frozen ef811c2a (`GEN2_DRAFT=3-1 castBots --stage 3-1 --setting both --par 2 --rows`, every bot): lanes seeds 1-14 and 15-27 started
12:16 PM ET; lane 28-40 starts when the first ends (two heavy runs at most). **Box 4 records it here when it ends; nothing else (do not
re-run it).** Its PASS: litAhead unlit = 0 (or each one traced), gaveUp named per bot, shrine >= 359/360, rescues vs box 3's base x40
(1,393, `cast-3-1-x40-base-c1008d8e.jsonl`) with no rescue kind the base lacks.
(2) **The next box, in ITS own container, while (1) runs (2 heavy at most there too):** on a frozen ef811c2a (worktree, node_modules
linked, `chattr -R +i src tools reference`): the plants (`python3 reference/qa-reports/ENG-DARK/planted-faults.py <wt>`, now **15**:
box 4 added 14 'the dark stop never turns him to face the rim' and 15 'a dark give-up kept for the whole run'; PASS 15/15 CAUGHT), then
tierBots (`npx tsx --test tools/inspect/tierBots.test.ts`, 9/9), then the suite (3 shards) + the CI tool line. If (1) shows a new kind,
its fix moves the head and these re-run once on the new head.
(3) LAND on t-eng-w3 (still c1008d8e at 12:16 PM ET; ENG-DOWNBOT-f not landed): merge origin/t-eng-w3 first, no force; if ENG-DOWNBOT-f
landed first, run its tests (w3.test, tower.test, castBots.test down toys) and ours (dark.test, darkBots.test) on the merged head, name
every conflict here, never drop the other lane's lines; lockall once on the frozen final merged head (`lockall --layouts 16 --out
lock-base.json` on frozen t-eng-w3, then `--check` on the frozen merged head: no listed stage moves). **KNOWN LANDING RISK (box 4's
preview, item 3 below):** ENG-DOWNBOT's lay moves the 3-1 rolls, and on a merge with its WIP (7b1aa3ba) toy B goes RED (roll 19 holds no
give-up: gaveUp 2 expected, 0 actual; toy A and the 3 old toys GREEN). On the merged head, re-pick the roll of toy B (and of toy A if
plant 14 is MISSED there) with `npx tsx reference/qa-reports/ENG-DARK/toyscan.mts FT_CHILD 1-40 50 noturn` (B: a seed printing 'SAME RIM
TWICE'; A: a seed where the old code, plant 14 applied, is unlit), change only the seed and its comment, and re-run darkBots.test and
plants 14-15 there. The x40 numbers stay those of ef811c2a's lay (the lead's landing rule asks the other lane's tests and lockall on the
merged head, not a second x40). Send the lead the hash, the READY
measures and the ENG-SPORE light API line (sections below). LANDED by 2:30 PM ET; HARD STOP 4:00 PM ET.
(4) **STILLS APPROVED by the lead.** Dot's card upright under Pokey is **R-165.456** (FIX-CARD-DOWN, its own job), not this lane's.
**The lead's landing rule (ENG-DOWNBOT-f lands on t-eng-w3 today too; both lanes touch tools/inspect/firsttimer.ts and the gen2 lay):**
whoever lands SECOND merges origin/t-eng-w3 first and runs the OTHER lane's tests on the merged head before pushing: dark.test,
darkBots.test, w3.test, tower.test, castBots.test (the down toys) and lockall. Name every conflict here; never resolve one by dropping
the other lane's lines.
Box 4 start 12:08 PM ET, box 3 11:50 AM ET, box 2 11:31 AM ET, box 1 11:03 AM ET (by `date`).

## Box 4 (ENG-DARK-d) (start 12:08 PM ET by `date`)
1. **UNLIT CAUSE 2: the BOT (b), not the wake. FIXED (98992ca5, merged at ef811c2a).** Traced on the real row (child Normal, 3-1 draft
   roll 19, frame trace with his facing and the engine's stillness clock): he lands 2 px in from the rim at the left end of 974-1154 and
   the route sends him RIGHT (pressing right, vx 260-285, 37.50-37.57 s); at 37.60 s the route turns LEFT toward the rim, 39 px from it,
   and glowWait's stop is taken THAT frame, thumb off, so he slides to x 1014 and stands **facing right, AWAY from the rim** (`face 1`).
   The engine's stillness clock runs (0.70 s reached at 38.37 s), but the landing's light (657, 3232) is 357 px BEHIND him, past
   GLOW_REACH.back 260: it never wakes. **(a) ruled out:** a stand at the same x 1014 FACING the rim reaches it (ahead 357 <= 1050, the
   light 134 px below his feet <= 420), so a kid who stops facing the gap lights the landing; the wake and the verdict hold (darkGaps scans
   the piece facing the rim). No kid stops facing away from the gap he means to drop into; the bot did because its stop beat its turn.
   **Fix (firsttimer.ts glowWait, bots only):** (i) at the stop, if he is not facing the rim, he presses toward it until he does (his
   thumb's own travel lag applies: the child turned at 38.47 s, 3 px), then a clean let-go (tapped(): no late lift-off walks him on to
   the rim); (ii) a give-up ends with the visit: grounded off that rim's piece (a rescue, a fall, the game's grace past its end), the rim
   re-arms. New counter **FTRun.dark.gaveUp** (each waited-out stop: rim and time; one per visit), proved by toy B.
   **Toys (src/game/gen2/darkBots.test.ts, the 3-1 draft's roll 19, child Normal, first 50 s):**
   - A 'the dark's stop FACES the rim': old code **RED** (2 unlit: 42.07 s landing dark, 48.53 s 0.34 s after its light woke); fix
     **GREEN** (6 crossings, unlit [], gaveUp []).
   - B 'a dark give-up ends with the visit' (the turn removed by the test knob noGlowTurn): **GREEN** = gaveUp names the same rim twice
     (41.60 s and 47.07 s, one per visit); with the give-up kept for the run it is named once (plant 15).
   - Plants 14 (the turn removed in the code -> A RED) and 15 (the give-up kept for the run -> B RED) added to planted-faults.py; the
     15-plant run is owed on the frozen final head (next step (2)).
   - darkBots.test **5/5 GREEN** in the edit tree before the commit (the 3 old toys unchanged: adult roll 1, its plant, the expert's jump).
   - Note (no change): RimWatch counts 'went over' when he passes the rim on the game's grace past an edge (box 1's rule); at 42.07 s
     the no-turn child stood at x 969 grounded, 5 px past the rim, and stepped back. Kept as ruled; the light still has to be on.
2. **The x40 on ef811c2a: RUNNING (next step (1)).** Results recorded here when the lanes end.
3. **Landing preview (caught before it happens):** `git merge-tree` of ef811c2a with ENG-DOWNBOT's WIP (t-eng-w3-wip-downbot 7b1aa3ba):
   **no conflict** (firsttimer.ts auto-merges; it changes 38 files, towerRoute.ts and the going-down lay among them). On a throwaway merge
   of the two (not pushed), darkBots.test **4/5**: toy B RED (its roll's give-up is gone on the new lay), the rest GREEN. Procedure for the
   landing: next step (3); the scan tool `reference/qa-reports/ENG-DARK/toyscan.mts` (tsc clean; not yet run: the x40 holds the two heavy
   slots).

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
3. **THE RESCUES, base vs the dark, seeds 1-3 (27 runs each; castBots on a frozen c1008d8e vs box 2's x40 rows on 653bb970; base rows: seeds 1-3 of cast-3-1-x40-base-c1008d8e.jsonl):** the
   layout is the SAME (platforms and flags hashed equal on seeds 1-3, both trees), so every difference is the bots' play in the dark.
   Rescues 90 base -> 102 dark (+12; child Easy +7, middle Easy +4, adult Normal +2, expert/kid/middle Normal about even). The KINDS
   are the same (numbers stripped, base -> dark): 'in a dip N px deep, the way on is N px down' 56 -> 69; 'the way on is N px down'
   20 -> 29; 'a trunk beside him...' 9 -> 8; 'fell back down from here N times' 5 -> 5; no kind the base lacks. Traced: adult Normal
   seed 2 (base clean, 129.5 s; dark 173.4 s, 1 rescue at (784, 6177) at 81.2 s): a clean 2 s dark stop at (698, 5554), then he
   dithers between two storeys (piece 34 and 157: back up a jump, down again) where the base also logged 'the way on is 85 px down'
   at (514, 5699) and recovered without a rescue. Reading so far: the dark adds no rescue kind of its own; it moves when he reaches
   the down shaft's storeys, whose dips are ENG-DOWNBOT's lane. The base x40 (item (1) above) settles the per-bot numbers.
3b. **THE RESCUES, base vs the dark, ALL 40 seeds (castBots on a frozen c1008d8e, no dark, 360 rows, 0 errors:
   `cast-3-1-x40-base-c1008d8e.jsonl`; vs box 2's `cast-3-1-x40-653bb970.jsonl`):**
   | bot | setting | shrine base / dark | clean base / dark | rescues base / dark | time median base / dark (s) |
   |---|---|---|---|---|---|
   | kid | normal | 40/40 / 40/40 | 1 / 0 | 156 / 151 | 174.9 / 203.7 |
   | kid | easy | 40/40 / 40/40 | 0 / 0 | 186 / 192 | 197.3 / 239.5 |
   | adult | normal | 40/40 / 40/40 | 2 / 1 | 119 / 120 | 164.4 / 193.5 |
   | adult | easy | 40/40 / 40/40 | 0 / 0 | 180 / 202 | 201.1 / 241.0 |
   | child | normal | 40/40 / 40/40 | 2 / 1 | 138 / 135 | 320.1 / 306.6 |
   | child | easy | 40/40 / 39/40 | 0 / 0 | 178 / 179 | 307.7 / 313.7 |
   | middle | normal | 40/40 / 40/40 | 0 / 3 | 126 / 115 | 207.8 / 230.8 |
   | middle | easy | 40/40 / 40/40 | 1 / 1 | 186 / 184 | 263.2 / 283.2 |
   | expert | normal | 40/40 / 40/40 | 1 / 0 | 124 / 115 | 204.3 / 213.6 |
   **Rescues 1,393 base, 1,393 dark** (per bot -11 to +22, both ways: noise of a moved trajectory); stuck notes 1,709 / 1,680; by cause
   (numbers stripped) the top six match within a few each ('in a dip N px deep, the way on is N px down' 1,006 / 1,009; 'the way on is N
   px down' 260 / 256; 'fell back down from here N times' 99 / 99). Kinds only in the dark: 7 notes, only in the base: 4 (rare variants
   of the same dips). **Verdict: the dark adds no rescues; every one is the down shaft's storeys (ENG-DOWNBOT's lane, as on the base).**
   What the dark DOES cost is time: the stops add about 20-40 s to the median for kid, adult and middle (Easy most: the 1.6 s ahead).
   The one strand: child Easy seed 25 stranded at 295.9 s after 4 rescues in the same dips (base: shrine at 278.8 s after 6 rescues):
   a dip strand on the dark's trajectory, ENG-DOWNBOT's to read with its fix.
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
