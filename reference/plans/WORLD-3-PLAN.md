# WORLD-3-PLAN: World 3 (Mossy Grotto) stage by stage to engine pieces, art and teach order; World 4 (Mist Cascades) in outline (R-165.313)
Designer (PLAN-W3), written 5:55 PM Thu 11-19 ET (by `date` in the same command). Packet: reference/packets/2026-11-19/PLAN-W3.md (the lead's
branch ccr-ea739a2f-dfcee4 @ 5a8fba96c). **Base: origin/main 6e7b85f8f**: every file:line below is read there unless it names a branch.
GAME-MAP = origin/t-design-game-map reference/plans/GAME-MAP.md (written 11-11); BUILD-ROADMAP, PICKS-29-32 = the lead's branch.

## In plain words (for Matt)
- **World 3 is more built than the 11-11 map says.** The dark, glowworms that wake when Pokey stands still, the rope hang with its own
  painted frames, noise that wakes sleeping animals, the prowler and the jaguar as animals of the new creature kit, the drop trap, the
  thorn vines and the slide all exist in code. What is missing is the **wiring** into the new level maker (World 3 has no kit on it
  yet) and the **art**: 38 pieces to stand on, only 11 of them the right size next to Pokey, and **0 pieces to climb**.
- **Four jobs can start Friday with no design waiting:** the World 3 kit with a stage that goes DOWN; the dark and its glow as a piece
  any world can use; "prowlers never look up"; World 3's standing and climbing art on Hugging Face (about $4-8 for all of World 3).
- **The hang:** 3-2 hangs on roots under the cave roof using the rope creep from 1-3, which already exists with art. One question for
  you, with a short mock-up first: the feel of that creep (§6).
- **When:** if World 2 keeps its dates, World 3's builds start **Tue 12-1**, every engine piece merged a week before its stage.

## 1. Stage by stage
EXISTS = in code and proven on a stage (named). UNWIRED = in code, but gen2 does not lay it or no real stageTable row uses it.
NEW = to build, sized S (up to 1.5 h), M (1.5-3 h), L (3-6 h) of member time (BUILD-ROADMAP §5 unit costs), with the toy that proves
it (level.md rules 21, 23: a planted toy on a REAL row). 3-1/3-2 ideas are the lead's picks; 3-3..3-9 are GAME-MAP §4's twists,
**TO PITCH** (PITCH-33A/B, PITCH-36A/B on the lead's branch, reference/packets/2026-11-20/).

**World facts every row leans on (checked):**
- **No World 3 gen2 kit.** src/game/gen2/worlds/ holds w1, w2, w5-w8 only; stageTable.ts has rows 1-1..2-2 (stageTable.ts:34-62).
  World 3 is the old section maker today: w3Sections.ts:31-41 (2-3 versions a section), built through protoStage.ts:57.
- **Down.** gen2 accepts travel 'down' (pipeline.ts:439, :2006; storeyLimit down, tower.test.ts:168-169; the budget, tower.test.ts:40)
  and the bots' down mode exists (stageModes.ts:52-60), but **no stage row travels down**: the one down stage is 4-7 on the old maker
  (stagePlan.ts:95), and 3-1 has no `travel: 'down'` (stagePlan.ts:77).
- **The meter covers none of World 3's pieces:** zone:dark, zone:spore, creature:ocelot, creature:jaguar, beat:thorn vines and
  skill:shimmy all have bot null and channel null (reference/design/meter-coverage.json; shippedWorlds [1]).

| Stage | The one idea | Teaches (first met) | Engine pieces | Art | Meter / bot |
|---|---|---|---|---|---|
| **3-1 Into the Grotto** (sprint, DOWN) | PICKED (PICKS-29-32:18-23): stand still at a shelf's edge and the glowworms below wake and show where to drop; spore puffs light the shaft on their beat; every teach drop soft | DARK: light comes from things (new). Stillness = light (stillness first 1-7, stagePlan.ts:59). Going down (first in gen2) | **(a)** World 3 kit + a down row: UNWIRED -> NEW L **ENG-W3a**. **(b)** dark + light ring: UNWIRED (zones.ts:22 'dark'; engine draws it, engine.ts:1953, :7388; gen2 lays it only in w6Swing.ts:427-465) -> NEW M **ENG-DARK**. **(c)** glowworms wake on stillness: EXISTS engine.ts:8826-8856 (0.7 s still, zones.ts:79; reach back 260 / ahead 1050 **by x only**, zones.ts:81), proven only on hand-built 3-x (protoStage.ts:1867) and puzzle rooms (kitStage.ts:358-360); a shaft needs the wake to reach BELOW: NEW S inside ENG-DARK. **(d)** spore puffs: zones.ts:266 on the old maker; gen2 lays none (0 hits in pipeline.ts) -> NEW S-M **ENG-SPORE**. **(e)** a soft drop: a fall of 200 px or less makes no noise (heroNoise.ts:18); whether a long fall hurts is NOT checked: DESIGN-31-32 flies it | stand pieces at Pokey's scale (11 of 38 best-fit are, w3.json); soft fungus mats (6 best-fit); glowworm dots may stay code-drawn (glow.ts:13, a small touch, STAGE-RULES §4). MISSING: shaft walls, lit rims | NEW channels: dark, spore (METER-W3). NEW bot skill "wait for the light" (stand 0.7 s at a shelf edge before a blind drop), S |
| **3-2 Glowworm Path** (stealth, right) | PICKED (PICKS-29-32:25-31): hang under the roof roots and creep over the prowlers' heads; they never look up, but a lit glowworm patch gives him away. B's sloping root only if it fits M | HANG UNDER on new ground. The creep itself is 1-3's shimmy (skills.ts:28-37: unlocked 1-3, required from 1-4); new here: over a danger, not a gap, and "what is lit is seen" | **(a)** roof-root lay: gen2 hangs ropes only over a gap between two ledges (Rope g0/g1, types.ts:485-499; w1.ts:326 gap 380-460) -> NEW M **ENG-ROOT**: a rope over walkable floor, under the roof, no posts, look 'root' (Rope.look is 'vine' or unset today, types.ts:496-498). Sloping root +M, or to 3-3+. **(b)** never look up: the kit ocelot sees 80 px up or down (world3.ts:13 sight.tall), checked in core.ts:236-239; castPlay already knows he hangs (castPlay.ts:37-38) -> NEW S **ENG-PROWL**: `sight.up` (how far ABOVE it sees) + "lit = seen" in a light ring. **(c)** hanging counts as holding, for cover: EXISTS (hangCover.test.ts:1-5, 1-7) | Pokey hanging EXISTS: hero-rope.webp (heroRope.ts:22), creep frames and a one-paw still (heroRope.ts:8-9, :41). MISSING: roof root in grotto stone (mid + two root-in-rock ends; slope if kept), a glowworm patch on the roof | creature:ocelot and skill:shimmy: NEW (METER-W3; the watch channel exists, score.ts:512, METER-W3 says if the ocelot prices through it). Rope bot EXISTS (move:rope, firsttimer.ts FirstTimerRun.intend); "creep under a watcher" NEW S |
| **3-3 Footprints in a Circle** (purge, right) | TO PITCH. Map: lure a prowler under a loose stalactite and knock it down (1-3's trap, now a lure) | lure + drop together (the drop trap first met 1-3; a thrown noise draws a hearing animal, core.ts:320-330) | drop trap EXISTS (dropTrap.ts:1-6, the kit's, 1-3). The ocelot hears (world3.ts:13 `hears`) and goes to a thrown noise (core.ts:320-326): EXISTS in the kit. Who throws in a gen2 stage: **not checked** (puzzlePlay.ts makes thrown things, heroNoise.ts:21-22). NEW S-M **ENG-LURE** (lure + stalactite + bot "throw to lure") | MISSING: loose stalactite (set, falling, fallen) | trap channel: not checked; lure bot NEW |
| **3-4 The Sinkhole** (ascent, up) | TO PITCH. Map: sleepy mushrooms puff on a beat as you climb | spores as a beat (first in 3-1 if DESIGN-31-32 keeps them) | the up tower EXISTS on gen2 (1-4, stageTable.ts:41). Spores: ENG-SPORE (shared with 3-1). The hand-built sinkhole (buildSinkhole, protoStage.ts:57) is replaced | **the heaviest climb need**: 0 climb pieces best-fit; 22 fit from W1/W7/W8, all forest or temple looks (w3.json). MISSING: root and moss climb columns in grotto stone, sinkhole wall ledges | climb channel EXISTS (score.ts OTHER_BITS.climb); spore NEW |
| **3-5 Sleeping Vines** (stealth, right) | TO PITCH. Map: a loud landing or a punch wakes the thorn vines; hanging and soft landings don't | NOISE WAKES THINGS. Quiet feet are World 2's lesson in code (TAUGHT.landing = 2, castPlay.test.ts:214) | noise -> sleeper EXISTS in the kit (castPlay.ts:155-162; LOUD, heroNoise.ts:13-27; hear/woke, core.ts:320-329). Thorn vines: rhythm EXISTS on the old maker (thornVine.ts:1-25; engine.ts:7360-7371, which hears only the puzzle kit's noise). The roster names thornVine for World 3 (roster.ts:12, :31) but there is **no PredatorDef** (world3.ts:35: ocelot, jaguar) -> NEW M **ENG-VINE**: the thorn vine as a kit sleeper (doze rhythm as data, wakes on landing or punch noise; a creep on a root makes none) | thorn vine art EXISTS (thornbarkSprite.ts); scale not checked | beat:thorn vines NEW (METER-W3) |
| **3-6 Grandma's Things** (relic_hunt 5) | TO PITCH. Map: carry a glowing fungus cap that lights a small circle | carried light | the glowing mushroom EXISTS as a puzzle-kit item (puzzleKit.ts:33, :43, :56 light 230) and wakes glowworms (engine.ts:8828-8837); finds in Hush Ferns EXIST (finds.ts:1-6). In a gen2 stage: UNWIRED. One meter any world reads (GAME-MAP B8): lantern.ts is World 8's jar (lantern.ts:42, :138) -> NEW M **ENG-LIGHT** | MISSING: the glowing fungus cap (a cap, not a jar: story keeper 11-11) | light meter channel NEW |
| **3-7 Which Fern?** (relic_hunt 6, LEFT) | TO PITCH. Map: crouch by the right fern and it rustles | search by sound | running LEFT on a real row: ENG-27 builds it for 2-7 (BUILD-ROADMAP E8). Rustle: no 'rustle' in finds.ts (grep hits art files only) -> NEW S **ENG-FERN**. The hidden stage's door: guarana under a fern, reached by hanging (needs ENG-ROOT) | Hush Fern EXISTS; rustle frames: not checked | find channel: not checked |
| **3-8 Thorn Vine Swing** (vine_runner) | TO PITCH. Map: thorn vines pulse on a beat; swing on the quiet beat | swing timed to a rhythm | lianas EXIST on gen2 (1-6, w1Swing.ts; stageTable.ts:47); thorns over liana gaps EXIST on the old maker (thornVine.ts:22-23 `below`) -> NEW S-M **ENG-THORNSWING** (after ENG-VINE) | grotto liana fits: hf678/w17-moss-liana (w3.json, scale 1.35) | swing channel EXISTS (score.ts:343); thorn NEW |
| **3-9 The Prowler's Ring** (gauntlet) | TO PITCH. Map: dark + hanging + quiet + prowlers together | nothing new (the mix) | every piece from 3-1..3-8; the jaguar (world3.ts:25-33) first met here or in 3-3 (the pitch decides) | from batches 1-2 | all of the above |
| **Hidden: The Cave Slide** | TO PITCH. Down an underground chute; opened by the guarana in 3-7, reached by hanging | the slide | w7SlideRun.ts EXISTS for 7-4 (w7SlideRun.ts:1-6: it takes over input, camera, canvas). As a mode any stage opens: NEW L **ENG-SLIDE** (GAME-MAP: 10-16 h with Dot's flight) | MISSING: the chute in grotto stone | slide: not in the table |
| **Guardian: Shadow Prowler** | EXISTS, hand-built (lairProwler.ts:1-5, prowlerPools.ts); stays as 2-10 does | | none | none | none |

## 2. The World 3 engine list, deduplicated, in dependency order (D40: foundations first)
Each row is a ready packet stub: one fresh member, on the latest INT head, a planted toy on a REAL row, generalitycheck clean.

| # | Job | What | Size (basis) | The toy that proves it (plant -> RED) | Needs first | Stages | Can start |
|---|---|---|---|---|---|---|---|
| F1 | **ENG-W3a** | w3.ts kit on gen2 (as ENG-W2 built w2.ts) + a '3-1' stageTable row travelling down (stagePlan.ts:77 gets `travel: 'down'`); the live 3-1 stays until its build replaces it | L (ENG-W2 ~1 h 50 m, $38.49: BUILD-ROADMAP:113) | addlevel READY on the row; bots end at the shrine, 40 seeds, both settings; plant: the row's travel back to 'right' -> the down test red | INT-13 head | all of W3 | **NOW** |
| F2 | **ENG-DARK** | dark + light ring as one shared gen2 brick (lift w6Swing.ts:427 darkZone); the glowworm wake reaches below (zones.ts:81 gets a vertical reach); the "every gap lit 1 s ahead" verdict (GAME-MAP B9) | M | the brick on a W1 toy row AND on F1's row; standing at a shelf wakes lights 300+ px below; plant: an unlit gap -> verdict refuses | F1 for the W3 row (the W1 row first) | 3-1, 3-2, 3-6, 3-9; 6-6, World 8 | **NOW** |
| F3 | **ENG-PROWL** | PredatorDef `sight.up` + "lit = seen" in core.ts inSight (core.ts:236-239); numbers are data (DESIGN-31-32 flies them) | S | kit ocelot under a hanging Pokey: unseen; the same inside a lit ring: seen; plant: the rule off -> red | none (pure kit) | 3-2, 3-3, 3-9 | **NOW** |
| F4 | **W3-ART-1** | §3 batch 1: 10 to stand + 6 to climb, at Pokey's scale, labelled in the catalog (inventory first) | M, HF $2-4 | stills of each piece beside Pokey (89.1 px, D41), upright and sideways; scale gate clean | none | all | **NOW** |
| F5 | **ENG-VINE** | the thorn vine as a kit sleeper (PredatorDef in world3.ts; rhythm from thornVine.ts as data) | M | a hard landing in reach wakes it; a soft landing or a creep on a root does not; plant: noise off -> red | none (kit); 3-5's design retunes the numbers | 3-5, 3-8, 3-9 | **NOW** (numbers are data) |
| F6 | **METER-W3** | bots + channels for dark, spore, ocelot, jaguar, shimmy, thorn vine (meter-coverage.json entries) | M (METER-3 ~70 min, BUILD-ROADMAP:147) | the coverage gate green on F1's row; plant: a null channel on a used piece -> red | F1-F3, F5 | all | after F1-F3 |
| D1 | **HANG-SPEC** | show-first mock-up of the roof-root creep for Matt (today's creep 120 px/s, rope.ts:8; hang 86 px under the rope, rope.ts:10; with and without a slope) | S | Matt's answer to §6 Q1 | DESIGN-31-32 | 3-2 | after DESIGN-31-32 |
| D2 | **ENG-ROOT** | the roof-root lay (+ slope if Q1 keeps it) + bot "creep under a watcher" | M (+M slope) | a W3 row with a root over a prowler's beat; the bot creeps it unseen; plant: root laid over a gap only -> red | D1, F1, F3 | 3-2, 3-5, 3-7, 3-9 | after Q1 |
| D3 | **ENG-SPORE** | spore puffs as a gen2 zone brick (zones.ts:266 recipe as data) | S-M | puffs on the beat DESIGN-31-32 flew; plant: no warn -> fairness red | DESIGN-31-32, F1 | 3-1, 3-4 | after DESIGN-31-32 |
| D4 | **ENG-LURE** | thrown lure + stalactite drop on gen2 + bot "throw to lure" | S-M | the ocelot drawn under the stalactite and beaten; plant: no lure -> bot fails | PITCH-33 pick, DESIGN-33-35 | 3-3, 3-9 | after DESIGN-33-35 |
| D5 | **ENG-LIGHT** | the carried cap on gen2 + one meter any world reads (B8) | M | carry the cap through a dark brick: the next gap lights | PITCH-36, DESIGN-36-39, F2 | 3-6, 3-9; Worlds 5, 8, 9 | after DESIGN-36-39 |
| D6 | **ENG-FERN** | the rustling fern | S | crouch at the right fern: it rustles; plant: every fern rustles -> red | PITCH-36; ENG-27 (left) | 3-7 | after DESIGN-36-39 |
| D7 | **ENG-THORNSWING** | thorn over a liana gap as a gen2 brick | S-M | swing on the quiet beat clears; on the loud beat lashed | F5 | 3-8 | after F5 |
| D8 | **ENG-SLIDE** | the slide as a reusable mode (and Dot's flight on the same engine) | L | 3-7's door opens the chute; 7-4 unchanged (lock) | the hidden stage's pitch | hidden | the week after |
| D9 | **W3-ART-2** | §3 batch 2: roots, rims, glowworm patch, stalactite, cap, chute | M, HF $2-4 | stills beside Pokey | the designs | named above | after the designs |

## 3. World 3 art for Hugging Face (in the order the engine needs it; Pokey = 89.1 px drawn, D41)
**What World 3 has (w3.json on main):** 183 best-fit pieces; 38 to stand on (20 platform, 12 step, 6 soft landing), of which **11 are
scale_ok, 13 are not, 14 unscored**; **0 climb pieces best-fit** (22 fit from W1/W7/W8: forest and temple looks).
**What the stages need (from §1):** to stand **10**, to climb **6**, to hang **3-4**, props **10**: about **29-30 pieces**.

| Batch | Piece | Size beside Pokey | Start from (img2img; inventory id or kind) | For |
|---|---|---|---|---|
| 1 | grotto floor lip x2 | 0.25-0.35 Pokey thick, 320-480 wide | W3 best-fit "grass lip strip (walk top)" | every stage |
| 1 | stone shelves S / M / L | 120 / 200 / 320 wide, 0.3-0.5 Pokey thick | "block (Mossy Tuff Block)", "soft landing (Giant Shelf Fungus)" (W3 best-fit) | 3-1 drops, everywhere |
| 1 | stepping stones x2, tuff block, crumbling shelf | 0.5-1 Pokey | "rock (unlabelled (mossy rock))", "stump-step" (W3 best-fit) | 3-1, 3-4, 3-6 |
| 1 | soft fungus mat, re-cut at scale | 0.2 Pokey thick | "soft landing (Spongy Fungi Mat)" | 3-1's soft drops |
| 1 | climb: root column x3 heights, wall moss vine x2, sinkhole root ladder | 2-4 Pokey tall, a hand's width | hf678/w17-moss-liana, w1-vine-column-a (re-painted into grotto stone) | 3-4, every shaft |
| 2 | roof root: mid, two root-in-rock ends (+ slope) | the rope's 86 px drop under it (rope.ts:10) | the World 1 vine rope look (types.ts:496-498) | 3-2, 3-5, 3-7, 3-9 |
| 2 | lit rims S/M/L, glowworm roof patch x2 | over the shelves | the shelves of batch 1 | 3-1, 3-2 (STAGE-RULES §4 dark rule) |
| 2 | loose stalactite (set, fallen), glowing fungus cap, slide chute x2 | 0.4-1.5 Pokey | W3 "danger look" best-fit | 3-3, 3-6, hidden |

**Cost:** ART-W2's last HF job made 30 takes in about 11 GPU-minutes for about $0.50 (HF-SPEND.md last line, lead's branch). At about
4 takes a piece, batch 1 is about 64 takes (25-35 GPU-min, $1.2-1.6) plus a redo: **$2-4**; batch 2 the same: **all of World 3 $4-8,
cap $10.** Against the packet's balance of about $49 and the $10 reserve, that leaves about $31+ for World 4 and later.

## 4. Slot plan (four members at once; World 2 keeps first call)
Fixed (BUILD-ROADMAP:156-170): release 1 Fri 11-20 night or Sat 11-21; World 2's last build 2-8 Tue 11-24; release 2 Tue 11-24 to
Fri 11-27. Gaps used: the design lane (DESIGN-29 already ran 11-18, BUILD-ROADMAP:175), the art lane's small days, and the engine lane's
World 3 slots BUILD-ROADMAP already holds (Mon "ENG-W3a or ENG-DARK", Tue ENG-HANG-1, Wed ENG-HANG-2/ENG-DARK, :162-164).

| Day | World 3 job (lane) | Why there |
|---|---|---|
| Thu 11-19 night | PLAN-W3 (this); PITCH-33A + 33B if two slots free | lead's 5:43 PM plan (STATE) |
| Fri 11-20 | PITCH-33A/B (if not tonight); **DESIGN-31-32** (design lane); **ENG-PROWL** (S, pure kit: a short gap after ENG-26b); PITCH-36A/B late | release 1 work first; these are 30-75 min jobs |
| Sat 11-21 | **W3-ART-1** (art lane: KEEPER-26 and ART-SOUND are small); **HANG-SPEC** to Matt (design lane); DESIGN-33-35 after the lead's picks | release 1 ships; art needs no design |
| Sun 11-22 | **ENG-W3a** (engine: in place of ENG-HANG-1's later slot, which Q1 may shrink); DESIGN-36-39 after picks | ENG-28 also runs; 4 at once holds |
| Mon 11-23 | **ENG-DARK**; **ENG-VINE**; INT-15 takes ENG-PROWL + W3-ART-1 | BUILD-ROADMAP's Mon W3 slot |
| Tue 11-24 | **ENG-ROOT** (if Q1 answered); **ENG-SPORE**; **METER-W3**; INT-16 takes F1, F2, F5, D3 | BUILD-ROADMAP's Tue hang slot |
| Wed 11-25 | **ENG-LURE**; W3-ART-2; INT-17 takes D2, F6 | BUILD-ROADMAP's Wed slot |
| Thu-Fri 11-26/27 | **ENG-LIGHT**, **ENG-FERN**, **ENG-THORNSWING**; INT merges by Fri 11-27 | release 2 prep has first call |
| next week | ENG-SLIDE | the hidden stage last |

**World 3 builds, one week after their pieces merge:** 3-1 **Tue 12-1** (F1, F2, D3, F6 in by Tue 11-24); 3-2 **Wed 12-2** (D2 by Wed
11-25); 3-3..3-5 from **Fri 12-4** (D4, F5 by Fri 11-27); 3-6..3-9 from **Tue 12-8** (D5-D7 by Tue 12-1). If release 2 slips, the
merges slip with it and the builds keep the week.

## 5. World 4 (Mist Cascades) in outline
| Stage | Idea (map; TO PITCH) | Engine | Art |
|---|---|---|---|
| 4-1 The Broken Ledge (ascent) | the leaf is learned on clearing | glide EXISTS (skills.ts:39-45, glide.ts:1-4); up tower EXISTS (1-4); rockfall EXISTS on the old maker (rockfall.ts:1-4) -> gen2 brick NEW | climb pieces |
| 4-2 First Glide (sprint) | gusts push the leaf | glide gaps EXIST on gen2 (glideGap, pipeline.ts:148-152, :1368); wind EXISTS on the old maker (zones.ts:196, :270) -> gen2 brick NEW | mist, falls |
| 4-3 Waterfall Steps (ascent) | the hand-built set piece, kept; rocks on a beat | EXISTS (w4Stage43.ts) | |
| 4-4 Crosswind (vine_runner) | swing in the wind | lianas EXIST (1-6); wind brick NEW | |
| 4-5 The Sovereign's Dive (stealth) | the eagle's shadow | the eagle is a kit animal (predators/world1.ts:79); the watch channel exists (score.ts:512); the Sovereign's shadow as a sweeper: new data, S | |
| 4-6 Above the Mist (ascent) | mist hides ledges until close | catch ledges EXIST (w4Catch.test.ts); mist: no gen2 code found -> NEW M | mist veils |
| 4-7 The Long Drop (sprint, down) | hand-built, kept | EXISTS (w4LongDrop.ts; stagePlan.ts:95) | |
| 4-8 Nests on the Cliff (rescue) | bring them home on updrafts | followers: ENG-23 on t-eng-23, **not on main** (no 'follower' in src/game); updrafts on the old maker (w4Play.ts:84) -> gen2 brick NEW | nests |
| 4-9 The Aerie (gauntlet) | wind blows the guards off | EXISTS hand-built (w4Stage49.ts) | |
| 4-D Dot's Flight | built | EXISTS (dotFlight*.ts) | |
| Hidden: Up the Falls | ride one updraft up a shaft, steering | NEW M-L (no code; nearest pattern dotFlightRun.ts) | the falls shaft |
| Guardian: Sky Sovereign | built | EXISTS (lairSovereign.ts, sovereignFight.ts) | |

**The map's three new pieces, checked:** (1) **glide arcs flown**: half done, glideGap and reachGlide fly the glide (pipeline.ts:148-152,
:296-302); left: a Designer flight in wind (S). (2) **wind, updrafts and rockfall as gen2 bricks**: NEW (0 hits for wind, updraft or
rockfall in pipeline.ts; all three exist on the old maker). (3) **the steerable rising ride**: NEW (no code). Plus **mist** (4-6) NEW M.
**Art:** 233 best-fit, 51 to stand (22 platform, 28 step, 1 soft), only 5 scale_ok (44 unscored); **0 climb best-fit**, 4 fit (World 9
lianas and trunk). Needs about 6 climb pieces (wet cliff roots and vines), mist veils, the falls shaft. **World 4's pieces start the day
World 3's foundation is merged (Wed 11-25), in the engine slots World 3 frees.**

## 6. Questions for Matt (one at a time; my recommendation first)
**Q1 (R-160.1, via HANG-SPEC's mock-up):** "In 3-2 Pokey hangs under the cave roof and creeps over the prowlers. How should that feel?"
**(A, recommended)** the rope creep from 1-3, now on roots under the roof: the same slow, sure creep; what is new is the danger walking
below and the glowworm light that gives him away; the full under-any-branch move (R-160.1) waits for World 6/8. (B) build R-160.1 now
(hang under any branch, 10-16 h plus art) and give World 3 the full move. (C) A, plus sloping roots he slides down.
Why A: it exists with painted frames, so 3-2 can build a week sooner, and a known move in a new place with a new danger is how every
world brings a move back (GAME-MAP §3). Nothing else in this plan needs Matt.

## Pushback (with evidence)
1. **The prowler fix is not in enemyBrain.ts.** Its 170 px (enemyBrain.ts:229) is the old brain, and World 6 casts the ocelot through it
   (w6.ts:113-114). World 3's kit casts by the creature kit, where the ocelot sees 80 px tall (world3.ts:13; core.ts:236-239). Fix it
   there (F3); touching enemyBrain would move World 6 and patch a path World 3 is leaving (D40).
2. **"Noise that wakes sleepers" is not new code:** castPlay.ts:155-162 already wakes sleepers on a hard landing. The real work is the
   thorn vine as a kit animal (F5, M); drumNoise having no caller (BUILD-ROADMAP:121) does not matter to World 3.
3. **ART-HANG (BUILD-ROADMAP:118, "Pokey hanging idle/creep/drop", M) is mostly not needed for 3-2:** the creep and the still hang are
   painted (heroRope.ts:8-9, :22). Only a let-go frame may be missing (not checked). Save the job unless Q1 picks B.
4. **The one-week rule can idle builders** Wed 11-25..Mon 11-30 if World 2 finishes on time. Suggest: "merged before the build's design
   is final, and at least 3 days ahead"; the plan above keeps the week as the packet asks.
5. **GAME-MAP §4 World 3 is stale on four points** (11-11): spores, glowWake, the lure and the hanging cover exist; the "rustling fern"
   and the light meter are the only map pieces with no code at all.

## Learned
- Grep the creature kit (src/game/predators/, castPlay.ts) before calling a predator behaviour new: three of World 3's "new" pieces were
  there, not where the map and the picks pointed.
- The inventory JSON answers "how much art fits, at what scale" in one script (`scale_ok`, `layer`, `world_best`): art counts are facts.
