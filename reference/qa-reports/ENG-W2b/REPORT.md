# ENG-W2b REPORT: the river as a gen2 section, the one carry rule, petals on logs. Opus 5.5 xhigh (engine). 11:02 to 11:55 AM ET 11-15
Branch t-eng-w2b from origin/t-eng-w2 (58182e9a). Head at writing: e6894249 (code); this REPORT's commit follows. STOPPED early on the lead's
11:54 AM priority (Matt at 77% of the week's tokens): no final suite, no carry-rule sweep, no clip. Each is named below as UNRUN.
Method used: reference/methods/level.md Building rules 21-29 (engine side), stage-fix.md. Lessons applied: D19 (tests call the engine's own
code: hopLandsOn flies airStep, the toy rolls through gen2 and the game's listed path), D36 (gates on frozen worktrees), D40 (no patching the
placeholder w2Arc21 replaces: ruling B), D43 (nothing names a stage in engine code), D53 (fast gates before pushes), D55 (context % in every
message), D57 (queue read at pushes), D59 (no background job left running: the suite was stopped and is named UNRUN), D67 (no wait loops),
D69 (a plant that never went red was caught, see Learned), D74 (ENG-PETAL's line checked before building the petal brief: data only).

## EXACT NEXT STEP (the 2-1 builder is data only from here; an engine member does 0-2 first)
0. **Gates UNRUN on this head** (stopped for tokens): the whole suite ALONE (`npx tsx --test src/audio/*.test.ts src/game/*.test.ts
   src/components/*.test.ts src/components/**/*.test.ts src/game/gen2/*.test.ts src/game/gen2/worlds/*.test.ts src/game/art/*.test.ts`,
   timeout 60 min); `npx tsx tools/engine/lockall.ts --layouts 16 --check <base lock>` (base: run `--out` on 58182e9a first); seedlist
   `--check` of 1-1, 1-2, 1-3, 1-4, 1-5, 1-7 (2-1 and 2-2 PASSED on eaa9fecc and again 2-1 on b1acaace); the engine tool tests
   (`npx tsx --test tools/inspect/riverRide.test.ts tools/inspect/pitClimb.test.ts tools/inspect/tierBots.test.ts`).
1. **The carry-rule sweep (the lead's condition, NOT run):** the rule is BUILT (556cc6cf). Carriers found on 11-15 (default layouts):
   drift 2-3 (13 logs), 2-4 (3), 2-5 (13), 2-7 (14), 2-9 (16); sway 2-10, 5-10, 6-10, 7-10, 8-10, 9-4, 9-5 (3), 9-10, 10-10. None has a
   seed list (all hand-built), so seedlist does not apply; run `npx tsx tools/inspect/castBots.ts --stage <id> --seeds 1-6 --bots
   middle,child --setting both --par 3` on 58182e9a and on this head for each, list what moves; if a hand-built stage cannot hold, stop and
   tell the lead before changing it.
2. **'few' petals honoured** on ENG-PETAL's petalPass once INT-10 integrates it (the lead's ruling Q1 A): today 'few' lays exactly what
   'low' lays (briefPickups.test.ts "petals 'few'").
3. **The 2-1 builder (data only):** w2Arc21.ts per 2-1.md; rivers as `{ kind: 'river', after, row: 'ride' | 'deep' | 'back' | 'twin' |
   'long' }` (level banks only); a row's riding petals with `petals: n` on the row (a stage's own row may copy W2_RIVERS' and add it);
   the beat-5 side creek stays a plain soft gap (still water). Then `npx tsx tools/engine/addlevel.ts 2-1 --relist`. river.test.ts's
   honest red ("the river lesson's stage lays at least one log river": 2-1 0 today, 33 still creeks) goes green when it lays a river.

## Done (each with its evidence; heads named)
- **1a-1f, place `river`** (8be0c025; the type signed by the lead 11:14): far bank a row's width past, level; water + logs laid in layStage
  before the check, nothing under the water; rivers and logs' DriftInfo move with both stage shifts; riverFaults joins checkStage; dropsOf
  reads a river fall (deep life / safe putback, both water-art), never a log as floor; crossings asked as `ride`, skipped by the verdicts;
  w2Finish keeps gen2's rivers (+ reeds), idempotent. A left-laid river, a mirrored section, a missing row throw by name.
  Evidence: src/game/gen2/riverSection.test.ts (16 tests: World 2's ground, World 6's ground, World 6's REAL kit 6-2, both settings).
  **Lock: 102/102 stages unchanged at e45f857d** vs the base lock of 58182e9a (later commits not locked: step 0).
- **1g, the bot toy** (e45f857d): tools/inspect/riverRide.test.ts (in gates.yml): a gen2 fixture with one deep river, middle + child cross
  on both settings (lives AT the river with the skill: 2/0/0/0; off: 7/0/0/3, plant RED). The bot boards only when a flown hop lands on the
  log where it will be (firsttimer.ts hopLandsOn, floatAt; SKILLS.ride is the switch).
- **1h**: World 2's rows under World 6's ground and in World 6's own kit (riverSection.test.ts).
- **Item 2 (ENGINE-WORTHY 1, the lead's ruling 11-14)** (eaa9fecc): floor.unmarked reads water laid as water or inside a river as marked;
  drop.unwarned wants Dot's line at the FIRST painted water only, no sign; a dark drop keeps both. 2-1, 2-2 `judged`: registrycheck PASS
  (8 stages), seedlist 2-1 and 2-2 --check PASS (0 of 100 refused each); plant: the old verdicts refuse 2-1's seeds. judgedTable.test's
  pin holds 2-1/2-2 (9cbb752e).
- **Item 4, ruling B** (a3223e54): river.test.ts:62 holds every LOG river to 3+ logs (green); the red moved to the honest line (above).
- **Item 3**: the one carry rule (556cc6cf; ruling Q2 A): engine.ts carryVx (the platform under him, its move this step) and groundJump adds
  `carryVx * RIDE.keep.x`, any carrier, any rider (carryRule.test.ts: a hop off a 100 px/s log flies on with it; planted keep 0 lands
  short; still ground keeps nothing). Petals ON logs (556cc6cf): RiverRow.petals, Collectible.rides, ridePickups.ts (the engine carries
  each, hides it and refuses the pickup while its log is under a bank; plant: guard off, it is taken through the bank), fixPickups never
  re-seats one. Petal brief (b1acaace; ruling Q1 A): GraphBrief.petals 'low' | 'few' | 'normal', 2-1 'few'. No petal arc over a river
  (e6894249, found in the page still; planted).
- **Partial suite (UNRUN as a whole)**: on a3223e54, 2109 tests reached before the stop; the only reds were judgedTable's pin (fixed 9cbb752e).

## Polish check (reference/qa-reports/ENG-W2b/stills/, shot on e6894249's lay; World 2's real page with 2-1 as host, its kit and flags
cleared, the gen2-laid proof stage put in its place: tools/fixture.ts + tools/shoot.mjs; Normal, seed 1, 412x915 and 915x412 at 2x)
- river-deep-side/up: three logs on the deep river, two petals riding logs just over them, Pokey on the bank between the rivers. Reads
  clean. An earlier shot had three petals hanging in the air over the water: the fill's jump arcs; fixed at the root (e6894249).
- river-safe-up/side: a log sliding out from under the bank at his feet. **Rough spot, named:** the splash-back river is painted EXACTLY
  like the deep one (riverArt.ts has no safe look), so "painted water is the danger mark" cannot tell them apart. Art or Designer call.
- The ride CLIP was not shot (stopped). The bot's crossing is proven headless only (riverRide.test.ts).

## Pushback
- The packet's plant ("switch the ride block off and they drown") was false as written: the old block read a log within 90 px of the edge
  as boardable ~90% of its cycle, so switching it off changed nothing (identical runs) while middle Normal lost 5 lives. Fixed in the bot.
- The packet's 2-1.md path: it lives on origin/t-pitch-b@b85dba7f.
- ride.ts jumpOff was never called by the engine: no carrier passed speed before today; the engine's one rule is the groundJump line.

## ENGINE-WORTHY / rough spots
1. A river in a leg laid LEFT throws by name: mirroring the lay is small, but riverFaults' hop limit and "flows back at him" and the bot
   read dir for a right-running player. Ready by 2-7 (GAME-MAP: Pokey's first run left).
2. 'Against the flow' bot skill: on W2_RIVERS.back the child on Easy loses 4 lives (on stands still on a log carrying him back). 2-1 beat 6
   (the twist) needs it on BOTH settings, so it blocks 2-1's Easy bots, not its lay. The misread newcomer tier (2-2's "stops on a pad for
   a petal") can use Collectible.rides: the bot never steers for a petal today, so it makes no hop for one.
3. Safe vs deep river look (above). 4. A coyote jump off a log keeps no carry (only a jump while standing on it).

## Learned (for the next builder)
- A plant must be proven RED before it is trusted: run the toy with the skill off FIRST; identical numbers mean the skill is not the one
  doing the work. Proposed level.md rule 21 addition: "the REPORT pastes the toy's on and off numbers".
- A test fixture's stills are only proof if the host page's own pieces are cleared (2-3's pulley and cage drew over the first shot).

## Method update
level.md rule 21: add "paste the on/off numbers; identical = the plant proves nothing". stage-fix.md: a new carrier type gets carryVx for
free (engine.ts reads the platform's move), so no per-carrier speed code.

## Turnover note
reference/handoffs/engine-core.md §0zd rewritten (9cbb752e).
