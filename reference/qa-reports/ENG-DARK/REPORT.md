# ENG-DARK REPORT (the dark + light ring as one gen2 brick; WORLD-3-PLAN F2; R-165.449)
**EXACT NEXT STEP (box 1 END; the lead: no box 2, ENG-DARK-b takes the rest; code head 6ba641166):** (1) **LOCK RED, cause found, fix
first:** lockall --check on a frozen 6ba641166 vs t-eng-w3 c1008d8e's lock: 65/102 unchanged, exit 1: 37 gen2 stages (1-1..1-9, 2-1..2-5,
5-7, 5-9, 6-1..6-7, 6-9, 7-1/3/5/6/7/9, 8-1/2/3/5/6/8/9) moved in `proto.gen2` ONLY. Cause: dark.ts `glowFlags` writes
`out.extras[GLOW_ID] = id` on EVERY stage (even with no glowworm dark), and pipeline.ts:4167 copies non-empty extras into proto.gen2.
Fix: in glowFlags write the counter only when it hung a glowworm (`if (id !== first) out.extras[GLOW_ID] = id`); re-run dark.test.ts,
then lockall --check on a frozen head vs the base lock (`$S/lock-base.json`, or record it again on a frozen c1008d8e): PASS = exit 0.
(2) **PLANTS 10/10 CAUGHT** on frozen 6ba641166 (the list holds 10, not the 11 I said). (3) The bots' skill (noGlowWait),
castBots on the draft, stills, gates, landing: as below. $S = /tmp/claude-0/-home-user-Sloths-Adventure-/5d4d483a-b0b0-5deb-a175-
320f496c7653/scratchpad (lock-base.json, lock-check-6ba641166.log, plants-6ba641166.log), if the container still has it.
The bots' skill: firsttimer.ts `noGlowWait?: boolean` (rule 21 plant only): grounded on a piece with a dark rim (darkRims of the stage,
once) whose landing light is asleep or woke under DARK_AHEAD[setting] s ago, heading to that rim and within ~60 px: thumb off ({}),
facing the rim, until woke + DARK_AHEAD + stopReact. MERGE origin/t-eng-w3 first if ENG-DOWNBOT has landed (it was at 7d12c344 on
t-eng-w3-wip-downbot). Toy each way in dark.test.ts (with: litAhead GREEN; noGlowWait: RED); castBots `GEN2_DRAFT=3-1 npx tsx
tools/inspect/castBots.ts --stage 3-1 --seeds 1-40 --setting both --json` in lanes, a litAhead count per row (RimWatch in the run loop).
Stills (tools/engine/draftshoot.mjs, 2x, upright + sideways) of a dark shaft asleep and woken. tierBots 9/9, suite (3 shards) + the CI
tool line; land on t-eng-w3 (merge, no force); send the lead the hash, the READY measures, the light API.
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
