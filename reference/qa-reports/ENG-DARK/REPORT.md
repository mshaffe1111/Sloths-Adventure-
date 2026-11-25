# ENG-DARK REPORT (the dark + light ring as one gen2 brick; WORLD-3-PLAN F2; R-165.449)
**EXACT NEXT STEP (box 1 hand-over, on t-eng-dark-wip 3810ed6f0):** (1) read the lead's ruling on A (below; built as A). (2) Read
`$S/plants.log` if still there, else re-run `python3 reference/qa-reports/ENG-DARK/planted-faults.py <frozen worktree of the head>`:
6 plants, each must print CAUGHT. (3) lockall: base lock `$S/lock-base.json` (t-eng-w3 c1008d8e, recorded in a frozen worktree);
on a frozen worktree of the head run `npx tsx tools/engine/lockall.ts --layouts 16 --check <base lock>`: no listed stage may move
(3-1 is a draft, not listed; World 6/8 above all). If $S is gone, record the base lock again (c1008d8e) first. (4) The bots' skill:
firsttimer.ts `noGlowWait?: boolean` (rule 21 plant only): grounded on a piece with a dark rim (darkRims of the stage, once) whose
landing light is asleep or woke under DARK_AHEAD[setting] s ago, heading to that rim and within ~60 px: thumb off (return {}), facing
the rim, until woke + DARK_AHEAD + his reaction (stopReact). MERGE origin/t-eng-w3 first if ENG-DOWNBOT has landed (its firsttimer.ts
and towerRoute.ts changes; it was at 7d12c344 on t-eng-w3-wip-downbot). Toy each way in dark.test.ts (with: litAhead GREEN; noGlowWait:
RED), then castBots `GEN2_DRAFT=3-1 ... --stage 3-1 --seeds 1-40 --setting both --json` in lanes with a litAhead count per row.
(5) Stills (tools/engine/draftshoot.mjs, 2x, upright + sideways) of a dark shaft asleep and woken. (6) tierBots 9/9, suite (3 shards)
+ CI tool line on the head; land on t-eng-w3 (merge, no force); send the lead the hash, the READY measures and the light API below.
Start 11:03 AM ET (by `date`).

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

## Ruling asked (sent to the lead): flags and animals in the dark
'Nothing stands in a zone' (pipeline flagInZone/foeInZone, levelCheck.ts:1145-1149) took every flag out of the glowworm dark: the
draft failed to build (flags 5,000-9,000 px apart). Built as **A**: zones.ts `keepsClear(z)`: every zone but a dark whose lights
sleep keeps the rule; the firefly dark (Worlds 6/8) keeps it unchanged. B (every dark exempt) moves World 6/8; C keeps 3-1 flagless.

## The light API for ENG-SPORE (the puff's glow is a light in this brick)
darkRims/darkGaps read `zone.lights` of every `dark` zone; RimWatch asks the harness `lit(light)` for when a light woke. A puff's
light enters as a dark-zone light with a clock (proposed optional field `clock` on Zone.lights: the spore zone's period/warn/active/
offset; the Architect's OK, it is a type): the engine's darkness draw lights it while zoneState is warn or active, lit() returns the
start of its current window, and darkGaps counts a rim lit by it when its window >= DARK_AHEAD + the drop's air time.

## What 3-1 / 3-2's READY can measure (once the bot skill lands)
darkGaps(stage) == [] on every roll both settings; litAhead == [] on every castBots run of every bot (a per-row field); the wake
toy (a stop wakes the landing under the rim, not the shaft); plants RED.

## Polish check
Not yet: stills owed (step 5). Seen in numbers only: glowworms hang 90 px over each landing's near end, r 190.
