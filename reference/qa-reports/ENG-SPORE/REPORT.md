# ENG-SPORE REPORT (spore puffs as a gen2 zone brick, their light on a clock; 3-1 NEW 2; R-165.449; ADR-004)

**EXACT NEXT STEP (box 1 hand-over; head on t-eng-spore-wip = the commit that carries this line).** Items 1-3 are CODED and their toy is
GREEN on my tree (sporeBots.test 6/6, below). BOX 2 FIRST: ReadNotifications. Then:
(a) the frozen tree's runs from box 1 are GONE with this container if it was reclaimed: re-make a frozen tree of the head
(`git worktree add --detach /tmp/claude-0/wt-<h> <head>`, node_modules symlinked, `chattr -R +i src tools`, D115) and run
`npx tsx --test src/game/gen2/dark.test.ts src/game/gen2/darkBots.test.ts src/game/gen2/sporeBots.test.ts` there (run_in_background,
timeout 2700000); every test GREEN (box 1 started this on 12653334d: read /tmp/claude-0/darktests-12653334d.txt if it is still there);
(b) the stills: box 1 SHOT them on 12653334d (stills/3-1-{port,land}-puff-{dark,warn,lit}.png) and they FAIL the polish bar for
judging: Dot's 'Too dark to see. Stand still and listen...' box (the stage's own line; `lessons=off` does not stop it) sits over the
puff in landscape and just under the shelf upright. FIX in puffshoot.mjs: dismiss Dot's line before the shots (tap it, or clear the
engine's guide line in the page), reshoot on the frozen tree (`node reference/qa-reports/ENG-SPORE/puffshoot.mjs <frozen tree> <abs
path>/reference/qa-reports/ENG-SPORE/stills 5191`), LOOK at all six as Matt would, commit, send the lead the UPRIGHT lit one first.
What the shots already show: dark = the shelf is lost but for the petal's glow and a faint glimmer; lit = the purple cloud and the
puff's light open over the shelf, its mossy top readable under the mushrooms; the shelf's ends (110 px from the light) read dimmer;
(c) a planted-faults pass on the five new reads (glowGo, glowRimsOf's clocked rims, lightLitAt in RimWatch, darkGaps' clock rule,
glowZone's puff light): each removed in a copy, sporeBots.test RED; write the table here;
(d) the pipeline's own lay of SectionZone 'spore' (pipeline.ts, `z.kind === 'spore'`) has NO caller yet: no template lays one. Its builder
is the same `sporeZoneOn` the toy uses; READY-31's builder is its first caller. Say so to the lead with the hash (not hidden);
(e) WAIT for ENG-DARK's landing on t-eng-w3 (ls-remote t-eng-w3 past 88592a9c4, or the lead's word), merge it in (no force), then on the
merged head: the toys again, lockall (`--layouts 16 --check` against main's lock: only the stages traced), tierBots 9/9, the suite
(shards, run_in_background, timeout 7200000) and the CI tool line, then land on t-eng-w3 (merge, no force) and send the lead the hash.

## Box 1 (ENG-SPORE, from e544dc3dd = ENG-DARK's c16 code e5c098072; the lead's catch-ahead base)
### Item 1: the spore puff as a gen2 zone brick
- `src/game/zones.ts`: `SPORE = { period 6.4, warn 1.0, active 2.2 }` is the data (the old generator's `spore()` reads it; its 3-1
  recipe `sporeRecipes(1)[0]` IS SPORE: tested), `SPORE_BOX = { up 220, down 40 }` (the hand build's box, protoStage.ts sporeZone).
- `src/game/gen2/types.ts` SectionZone gains `{ kind: 'spore'; on; period?; warn?; active? }`; `src/game/gen2/pipeline.ts` lays it with
  `sporeZoneOn` (new `src/game/gen2/spore.ts`): the cloud over the piece, the mushroom at its middle, the beat's offset rolled from the
  slot's stream as tide's is, an 'S' beat. The warn is laid AS ASKED (no clamp), so levelCheck's 'warning too short' judges it.
### Item 2: the puff's light on a clock (ADR-004: ONE optional field)
- `Zone.lights[].clock?: LightClock { period, from, len, offset }`; unset = today's light (no reader changes for one without it).
  `sporeClock(zone)`: from = the idle spell, len = warn + active (3.2 s of 6.4). Pure helpers: `clockLitAt` (the window's start, or
  undefined), `clockLitLeft`, `clockGlow` (0..1, a 0.25 s ramp so it never snaps).
- The dark brick (gen2/dark.ts): `glowZone` hangs the puff's clocked light over a landing on a spore shelf in its box (`puffAt`,
  `puffLight`) and NO glowworm there; `darkGaps(stage, setting = 'normal')` keeps a clocked light only when `len >= DARK_AHEAD + rimAir`
  (the drop's fall, or a hop's rise and fall), else names the rim; `darkLandings` judges a clocked landing light as a sleeping one;
  `litAfter` (darkFlags) gives a clocked light its longest dark spell; `RimWatch` reads `lightLitAt` (the window's start).
- The draw (engine.ts, the darkness's light list): `u = clockGlow(...)` for a clocked light: no allocation added per frame.
- The bot (firsttimer.ts): `glowRimsOf` takes clocked rims; `glowGo(rim, lead)`: lit `lead` s AND the window still open for the way
  over + CLOCK_SPARE 0.25 s (the step from a 30 px stand); a clocked light has NO give-up (he waits for it: the light off, forever).
### Item 3: the toy on a REAL row (src/game/gen2/sporeBots.test.ts, 6 tests, GREEN on my tree)
- THE ROW: 3-1 draft roll 1 Normal, the dark DROP rim at the left end of 846-1099 (y 927), 194 px down onto 607-830 (reaching 239 px past
  the rim, nothing between). NOT 240 px: the draft has no clean dark drop at 240 (probes/drops.mts: rolls 1-12, the clean way-down drops
  are 156-194 px; roll 1's 195 px one at 613 has a piece 65 px under it that a running drop lands on; roll 3's 217 px one is a shelf
  under the rim's own piece that a run carries past). 194 px lies in 3-1.md's 160-320 band. The shelf gets its puff from the brick's
  own builders (sporeZoneOn, puffLight) in place of its glowworm, on SPORE's beat.
- GREEN: put 30 px from the rim with the puff dark, the bot stands, goes once lit 1 s, lands in light; litAhead [].
- FLOWN: 128 presses from a stand 30 px out: **53/128 land in light = 41.4% of the cycle; press to touchdown 0.57 s; worst wait
  3.75 s** (3-1.md: 38-42%, 0.53-0.60 s for 160-240 px, worst wait 3.7-4.0 s).
- PLANTS (all RED as they must be): the light off (len 0): the bot waits at the rim the whole 14 s, darkGaps names the rim ('a clocked
  light too short'); no warn (warn 0): levelCheck 'warning of 0s is too short'; the wait removed (noGlowWait): he drops dark, litAhead
  names it. The brick-lay test: the glowworms' dark laid again by DARK_EMIT over the row with the puff laid first hangs the clocked light
  (period 6.4, from 3.2, len 3.2) over the landing, no glowworm, darkGaps keeps it.

## What READY-31 can measure once this lands
A section's `zones: [{ kind: 'spore', on: '<shelf>' }]` in a glowworms' dark: darkGaps(stage, setting) on every roll both settings (a
puff too short for its drop is named), litAhead on every castBots row (a drop made before the puff was lit 1 s, or into a closing
window, is named), levelCheck's spore rules (warn >= 0.9, 3 s awake between clouds). The flown share is sporeBots.test's harness.

## Polish check
NOT PASSED YET: the six stills are shot but Dot's tip box covers the puff (landscape) / sits under the shelf (upright): reshoot with the
line dismissed (next step b). Seen so far: the light is clearly off when dark and clearly on when lit; the cloud and light agree.

## Lessons applied
D115 (runs on a chattr-frozen tree), D119 (no heredoc in a commit chain), D128 (times from `date`), D134 (this next step pushed and
ls-remote-confirmed before the hand-over), D139 (checked against the code: drowsiness, the art and the levelCheck rule already existed;
only the gen2 lay, the clock and the bot's wait were built), D141 (the CI line stays on every candidate: owed at the landing candidate).
