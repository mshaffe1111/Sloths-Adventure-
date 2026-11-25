# ENG-DARK REPORT (the dark + light ring as one gen2 brick; WORLD-3-PLAN F2; R-165.449)
**EXACT NEXT STEP (ENG-DARK-b hand-over, 11:47 AM ET by `date`; code head 653bb970 on t-eng-dark-wip; the lock fix and the bots' skill are IN):**
(1) **Box 2's runs are still going in box 2's container; box 2 records them here when they end (do not re-run them):** the base lock
on a frozen t-eng-w3 c1008d8e (`lockall --layouts 16 --out lock-base.json`), then `lockall --layouts 16 --check lock-base.json` on a
frozen 653bb970 (PASS = exit 0, 102/102 unchanged: World 6 and World 8 above all); castBots on the 3-1 draft x40 both settings every
bot, 3 lanes (seeds 1-14 / 15-27 / 28-40) on a frozen 653bb970, each row with `dark: {crossed, unlit}`.
(2) **Box 3 starts on these, in parallel (none needs box 2's runs):** (a) STILLS both ways of a dark shaft with the glow, before and
after a stop: `tools/engine/draftshoot.mjs` (on t-eng-w3; read its header for the flags), 2x, upright + sideways, a dark rim asleep
and the same rim after a stop of DARK_AHEAD + 0.5 s; judge them as Matt would on a phone (the glow readable, the next landing visible
when lit, nothing under the HUD or the phone's edges); send the lead the paths. (b) THE RESCUES: on seed 1 every bot already has 3-5
rescues, every one 'in a dip ~280 px deep, the way on is ~100 px down' (the down shaft's storeys). Name whether the dark adds any:
castBots seeds 1-3 every bot both settings on a frozen c1008d8e (no dark) vs the x40 rows here (by `stuck[].what`); two traces per
cause the dark adds (FT_FRAMES=t0,t1). A down-shaft rescue the base has too is ENG-DOWNBOT's (it lands the down lay and bots on
t-eng-w3 today): merge origin/t-eng-w3 when it lands and re-run the x40 then. (c) The plants on a frozen 653bb970: `python3
reference/qa-reports/ENG-DARK/planted-faults.py <frozen dir>` (12 now: box 1's 10 + the glow counter on every stage + the bots' stop
removed in code): PASS = 12/12 CAUGHT.
(3) Then: tierBots 9/9, the suite (3 shards) + the CI tool line once on the final head; land on t-eng-w3 (merge origin/t-eng-w3, no
force); send the lead the hash, the READY measures (below) and that ENG-SPORE can start.
**The lead's landing rule (ENG-DOWNBOT-f lands on t-eng-w3 today too; both lanes touch tools/inspect/firsttimer.ts and the gen2 lay):**
whoever lands SECOND merges origin/t-eng-w3 first and runs the OTHER lane's tests on the merged head before pushing: dark.test,
darkBots.test, w3.test, tower.test, castBots.test (the down toys) and lockall. Name every conflict here; never resolve one by dropping
the other lane's lines.
Box 2 start 11:31 AM ET (by `date`). Box 1 start 11:03 AM ET.

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
