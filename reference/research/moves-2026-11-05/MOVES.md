# MOVES: what shipped platformers actually do with moves, returns, stairs, sprints, pits, sinking and slopes

Moves and mechanics researcher, 2026-11-05, for the level designer (session_01FhBbYPKnBYCweHg8duJSu2) via the lead. Branch `research-moves`.
Brief: the R rows of `reference/engine/TRIAGE.md` (engine-spec 3fde9966): §1.1 #6, #9, #11, #124, #125, #150 (and #127's rate), §1.2 #59,
§1.6 #117, §1.7 #60, §1.8 #93, §1.12 #62. I do not design; every "rule" below is a proposal with its source for the designer to rule on.

## 0. Time, method, what is measured and what is not

**Planned vs actual:** planned about 2.5 h (to 2:30 PM ET). **Actual: about 50 min of my wall time (11:08 AM-11:58 AM ET), under half:
a red flag, so here is why.** The fetching ran in parallel: six fetch helpers and one checker used about 65 helper-minutes (16, 16, 21,
16, 2, 2 min of fetching; 6.5 min of checking), and every table is a script over saved files rather than hand counting. Nothing was cut
for time. What is still unanswered (sink seconds, pit fade distance, Tiny Wings' own hill method, Rayman's per-form worlds) needs a
longplay video, a screenshot or a wiki that is blocked from this container, not more hours here (§0 limit, BLOCKED-*.txt). If the lead
can open a route to video or images, those four are the next work.

**In one paragraph.** Shipped games teach one core concept inside a stage (Hayashida's four steps) but add 0-4 new pieces a stage; they
rarely echo a new piece in the next two stages (DKCR 1/15, 3D World 4/29; ours already 22/40); only verbs and a game's one or two staple
foot soldiers come back at "1 in 3" (Tropical Freeze's Tucks 61%; DKCR's Tikis 30-35%; Mario's Goomba 20%), and no enemy in three
whole games meets ES's 1-in-3 *window*; signature pieces return every 2-3 worlds (DKCR) or about once a world (Tropical Freeze). Harder
forms change the verb (5 of 7 DKCR forms). Sprint levels keep collectibles (DKCR 5 pieces + 4 letters; Rayman 3 Teensies), so ES's
"marks 0 for a sprint" has no source and would empty 18 of our stages. SMB stairs have 2-6 equal one-block rises (median 4); ours are
twice as steep and unequal. Sinking platforms are whole-stage themes that return (DKCR, Rayman, Shovel Knight), with no published sink
time. Death pits darken toward the drop (Yacht Club); no source for 300 px.

**Method** (now written down as `reference/methods/research.md`, law 4):
1. TinyFish `fetch_content` tested first (Iwata Asks 3D Land p2: OK, 17 s). curl gets a proxy 403 on most hosts; raw.githubusercontent.com works.
2. My own searches, then six fetch helpers (Mario; DKC; Rayman/Ori; Shovel Knight/SMB/Tiny Wings; later 3D World W4-W8 and Tropical
   Freeze enemies) saved every page
   as text in `sources/` with its URL and the date read (154 source files, plus 15 VGLC level files and the BLOCKED notes). I opened and read the primary pages myself (§10 lists which I read
   in full). Every failure is in `sources/BLOCKED-*.txt`.
3. The per-level tables are **built by scripts from the saved pages**, not typed: `dkcr_table.py`, `dkctf_table.py`, `sm3dw_table.py`,
   `sm3dw_full.py`, `stairs_vglc.py`
   (outputs `ours-*.txt`). Our side is measured on our code: `ladder_stats.py` and `returncheck.py` on `tools/engine/moveladder.json`
   (commit 7d9ad9a9, engine-mixer), `tools/validate/mechtable.ts` and a new `stairscan.ts` run on engine-mixer 021ef4e9 (outputs in `ours/`).
4. Only after the first source list: cross-check with `reference/research/ledger/*.md`, `GEMINI-PCG-RESEARCH.md`, R1-R4 (§9).

**Marking.** "measured" = counted by a script from a saved page or our code; "dev-reported" = a developer's own words; "wiki" = Super
Mario Wiki / IGN / RayWiki (fan-maintained; their enemy lists can miss an appearance, so wiki shares are a floor, not exact);
"estimate" = mine. Line numbers are of the saved file in `sources/` unless a repo path is given.

**The single biggest limit:** YouTube is blocked (BLOCKED-mario.txt) and no image host is reachable from the container (BLOCKED-rayman-ori.txt), so nothing
here is timed from a longplay video, and no pit screenshot was measured. Every seconds figure that needed video is marked "no source".

---

## 1. Moves and teaching (TRIAGE §1.1)

### #6 ES 113-116 — "<= 1 new move a stage; >= 2 earlier ones reused harder; none taught in the last 3 stages absent > 2 stages"

**What the primary sources say (dev-reported):**
- Hayashida (3D Land director): each course has one core concept "carried through absolutely all the way" and taught in four steps
  inside the course: learn it, "a slightly more complicated scenario", "something crazy happens", then "demonstrate ... mastery"
  (`mario-gamedev-structure-of-fun-hayashida.txt:117-133`, Gamasutra 2012). The kishōtenketsu frame is about **one course**, not about
  how courses relate. His GDC 2012 talk itself did not cover this: the same-day Kotaku report lists stereoscopic 3D, the early credits
  and the earthquake (`mario-kotaku-hayashida-gdc2012-talk-report-EXCERPT.txt`); the talk's slides/video are members-only (BLOCKED-mario.txt).
- Hayashida, Iwata Asks 3D Land vol. 2 p3: new things come from "using different combinations of game elements" (Boomerang Mario = Fire
  Mario's movement + an enemy's boomerang) (`mario-iwata-3dland-v2-producers-p3.txt:97`).
- Wonder's director, Mouri: "Previous 2D Mario games featured variations of challenges that would scale up in difficulty as players
  progressed. This time, though, we decided not to focus on creating such variations but rather on offering a large number of
  surprises ... at least one element in each course that would surprise or delight players" (`mario-wonder-askdev-part1.txt:80`).
- Yacht Club: "Each level starts with about 5 enemies and 5 objects planned. Some enemies and objects are used every level (like Dirt
  Blocks and Beetos). Those don't count!" (`sk-specter-level-design-1of5.txt:108`); "no gameplay concepts should only show up as
  one-offs. Spectacles like minibosses and bosses are an exception" (`:113`); "If new gameplay objects were never removed and the game
  just kept building on itself forever, your brain might start to hurt" (`sk-specter-level-design-2of5.txt:110`); "Every element of
  the game should be introduced, extrapolated upon, shuffled away, and revisited" (`:114`).

**Measured, new vs reused per course:**

| Game, span | New kinds per course | Reused (seen earlier) per course | Source |
|---|---|---|---|
| Super Mario 3D World W1-W2 (14 courses), enemies | 1-4, mean 2.1 | 0-3 | `ours-sm3dw-table-output.txt` (wiki enemy tables) |
| Super Mario 3D World W3 (9 courses), enemies | 0-4 (3-1:2, 3-3:3, 3-5:3, 3-7:2, 3-T:4; four courses 0) | — | same |
| Shovel Knight: Specter, per level | about 5 enemies + 5 objects planned (staples "don't count") | staples every level | `sk-...-1of5.txt:108` (dev-reported) |
| Ours, W1 (moveladder 7d9ad9a9) | 1-1:3, 1-2:3, 1-3:3, 1-4:1, 1-6:1, 1-7:2, 1-8:1, 1-9:2 | — | `ours/ladder-stats-7d9ad9a9.txt` |

**Longest gap before a taught element returns (measured):** 3D World W1-W3 enemies: median absence 4 courses, longest 15; 27 of 43 kinds
appear in one course only (`ours-sm3dw-table-output.txt`, last block). DKC Returns: see #150's table (longest absences 7-42 levels).

**Answer.** No primary source gives "<= 1 new a stage" or "absent <= 2 stages". The sources point the other way on both:
- Shipped courses often bring **more than one** new element: 3D World measured 0-4 new enemy kinds a course (W1-W2 1-4, mean 2.1; four
  W1-W2 courses add exactly 1; four W3 courses add 0); Shovel Knight plans about 5 enemies + 5 objects a level. What stays at one is the
  course's **core concept** (Hayashida). So "<= 1 new **core idea** a stage" has a source; "<= 1 new **thing**" does not.
- Shipped games **retire** elements ("shuffled away", Yacht Club `2of5:114`; 27/43 one-course enemies in 3D World). A per-element "never
  absent more than 2 stages" is not what any measured game does (§1 #125 below: 1 of 15 DKCR elements and 4 of 29 3D World enemy kinds
  return within 2 levels).
- ">= 2 earlier ones reused harder": Hayashida's "combinations of game elements" and Yacht Club's layering ("New elements can also be
  used together that allow familiar things to be seen in a different light", `2of5:86`) support "reuse earlier things combined", not
  a count of 2. 3D World measured 0-3 reused enemy kinds a course.

### #9 ES 139-140 — "an animal counts as a move (harder form, absent <= 2 stages)"

Measured home-world spacing of enemies:
- 3D World: absences between an enemy kind's appearances (W1-W3, 23 courses), n = 34: median 4 courses, max 15; 14 of 34 are <= 2.
  Only 4 of 29 W1-W2 kinds reappear within the next 2 courses (`ours-sm3dw-table-output.txt`).
- DKC Returns (71 levels, wiki lists): the commonest enemies' longest absence is 7 (Tiki Goon) and 8 (Tiki Buzz) levels; less common
  ones 19-42 (Tiki Zing 19, Doom 27, Flaming Buzz 30, Torch 42) (`ours-dkcr-table-output.txt`).

- 3D World whole game (75 courses): the Goomba's longest absence is 11 courses, Fire Bro 9; of the kinds in 4+ courses only the
  late-game Parabones (5), Hammer Bro (11) and Bully (12) are near that, the rest 16-43 (`ours-sm3dw-full-output.txt`).

**Answer:** "absent <= 2 stages" is stricter than every measured game, even for their most common enemy. The measured envelope for a
game's staple enemy is "longest absence <= 8 levels, in every later world"; for a world's own enemy it is "comes back one or more
worlds later, or never". STAGE-RULES:19-20's world-level rule ("comes back in every later world, harder or combined") is the one with
shipped support; DKCR's two commonest enemies meet it (7/7 later worlds), its other Tikis do not (Zing 4/7, Flaming Buzz 4/7, Doom 2/7, Torch 2/6, Tank 2/5).

### #11 ES 174-175 — "unused animal frames give a second behaviour, the harder form"

**Measured (wiki enemy pages, DKC Returns Tiki Tak Tribe):**

| Base | Later form | What changes | First level of base -> form | Source |
|---|---|---|---|---|
| Tiki Goon (walks, 1 hit) | Tiki Doom | size, **3 stomps** to beat (stats) | 1-1 -> 1-3 | `dkc-enemy-tiki-doom.txt:9`, `dkc-enemy-tiki-goon.txt:20` |
| Tiki Goon | Tiki Torch | on fire: **blow it out first** (a new verb) | 1-1 -> 2-3 | `dkc-enemy-tiki-torch.txt:11,14` |
| Tiki Torch | Tiki Bomber | **throws fireballs both ways** (new attack) | 2-3 -> W3 ("first encountered in the Ruins world") | `dkc-enemy-tiki-bomber.txt:7` |
| Tiki Goon | Tiki Tank | stone armour: **ground-pound to flip, then stomp** | 1-1 -> 3-2 | `dkc-enemy-tiki-tank.txt:7-9,14` |
| Tiki Buzz (flies) | Flaming Tiki Buzz | **immune to every melee attack**: throw a barrel | 1-6 -> 1-3 (form first!) | `dkc-enemy-flaming-tiki-buzz.txt:7-13` |
| Tiki Zing (saw) | big / metallic / inflamed | size; metallic **rolls along platforms** | 1-2 -> W5 / W7 / W6 | `dkc-enemy-tiki-zing.txt:11`, `dkc-enemy-tiki-zing-big.txt`, `dkc-enemy-tiki-zing-foggy-fumes.txt:9` |

Rayman: Origins adds "Lividstones with spiky hats" (`rayman-raywiki-lividstone.txt:62`; Jungle Run's level is named "Beware the Spiked
Helmets!", `:69`; both are image captions, and what the spikes change is not stated: my estimate is that they block a stomp). Legends' toads carry a "wooden shield" that breaks with any attack (`rayman-raywiki-toad-legends.txt:45`)
and "come in three other common variants: Red Toads, who can breathe fire, use flamethrowers and wear jetpacks; Underwater Toads, who fire
electric projectiles ... and Spy Toads" (`:32`). RayWiki's level and world lists for these were Cloudflare-blocked (BLOCKED-rayman-ori.txt),
so the world each form first appears in is not sourced.

**Answer:** of the 7 DKCR later forms with a sourced change (the inflamed Zing is only named, `dkc-enemy-tiki-zing.txt:11`), 5 change **what the player must do** (blow out, flip, use a barrel, dodge a new attack), 2 change
only stats/size. Five forms arrive **0-2 worlds after the base** (same world: Doom, Flaming Buzz; 1 world: Torch after the Goon, Bomber after the Torch; 2: Tank);
the Tiki Zing's forms come 4-6 worlds later (big W5, inflamed W6, metallic W7). This
supports ES 174-175's idea (a second behaviour as the harder form), with one sharpening the sources give: the later form changes the
verb, not just the numbers.

### #124 ES 1311-1312 — "a touch = 1-2 uses, some = 3-6 (one required), lots = 7+"

Measured from 3D World's per-course enemy counts (W1-W2, `ours-sm3dw-table-output.txt`, "Uses per course"): each course's main kind
appears **7-29 times** (1-1 Goomba 7, 1-2 Koopa 12, 1-3 Piranha 14, 1-4 Splounder 29, 1-5 Biddybud 8, 2-1 Conkdor 18, 2-3 Fuzzy 25,
2-4 Galoomba 13, 2-5 Blockstepper 18, 2-T Blockstepper 25; blockades excepted). Guests: 1-3 (Magikoopa 1, Fire Bro 1, Mega Piranha 1,
Thwomp 3, Kick Bomb 2). Of 44 (kind, course) counts: 24 are 7+, 9 are 3-6, 11 are 1-2. Yacht Club's frog arc in one level is
"6 frogs" (`sk-...-2of5.txt:162`), Grapps about 5 rooms (`:39-100`).

**Answer:** the bands have support: a course's main gimmick is used **7+ times (median 16)**, a guest **1-3**. Hayashida's four steps
need at least 4 uses of the core concept in a course (one per step, `structure-of-fun:129`). "Some = 3-6" sits where Shovel Knight's
6-frog arc and 3D World's second kinds sit. Where ours sit: old W1 per stage, `ours/mechtable-w1-engine-mixer-021ef4e9.md` (e.g. 1-5
breaking branch 55-60, 1-7 bushes 26-32, 1-6 liana 18-31: our themes are far above "lots").

### #125 ES 1317 — "echo: the next 2 stages (skipping lairs), at least some, one required"

- Shovel Knight's "on cooldown" is **not** a return interval: it is a list of ideas dropped from a whole later game because they were
  exhausted ("We felt we'd seen enough weighted platform puzzles in the Lich Yard ... We put these elements 'on cooldown' for Specter and
  did not include them", `sk-...-1of5.txt:91`). Within a level an idea returns "after a break for a few rooms" (`2of5:154`).
- Measured echo, DKC Returns: of 15 elements (7 Tiki kinds, carts, rockets, Rambi, 5 level themes), **1** appears in either of the
  next 2 non-boss levels after its first (Tiki Buzz) (`ours-dkcr-table-output.txt`, "Echo").
- Measured echo, 3D World: **4 of 29** W1-W2 enemy kinds reappear within the next 2 courses (`ours-sm3dw-table-output.txt`).
- The Cannon Box's "second appearance" is 3-5, five courses after 2-T (`mario-wiki-3dw-world3-enemy-tables.txt`, level table).
- Ours, same test on the measured ladder (`returncheck.py`, last line of `ours/returncheck-moveladder-7d9ad9a9.txt`): **22 of 40**
  mechanics already appear in one of the next 2 non-lair stages; not echoed include trunk climb (1-1), bush (1-7), eagle (1-7),
  water (1-3), push (1-6), boa (1-9), lift (2-7). Ours already echo far more than DKCR (1/15) or 3D World (4/29).

**Answer:** no source has a 2-stage echo. Measured games mostly do **not** echo a new element in the next 2 levels; they teach and
master it inside its own level (Hayashida's four steps; Yacht Club's teach-test-cooldown-mix-final rooms, `2of5:39-100`), then bring it
back later. The echo in ES is our own construction to satisfy Matt's "it keeps building" (ES:112); that is Matt's direction and stands
(law 22), but it should not be presented as research-backed.

### #150 ES 1535-1548 (and #127 ES 1319) — return rates ">= 1 in 3; 1 in 4 for push and hide; >= 2-3 stages for world moves"

**The whole-game table, DKC Returns (71 levels incl. keys and bosses), measured** (`dkcr_table.py` -> `ours-dkcr-table-output.txt`):

| Mechanic | First | Levels | Share of later levels | Longest absence | Later worlds with it | 3-level windows with none |
|---|---|---|---|---|---|---|
| Tiki Goon (walker) | 1-1 | 22 | 30% | 7 | 7/7 | 23/68 |
| Tiki Buzz (flyer) | 1-6 | 24 | 35% | 8 | 7/7 | 10/63 |
| Tiki Zing (saw) | 1-2 | 14 | 19% | 19 | 4/7 | 37/67 |
| Tiki Doom | 1-3 | 5 | 6% | 27 | 2/7 | 54/66 |
| Flaming Tiki Buzz | 1-3 | 9 | 12% | 30 | 4/7 | 45/66 |
| Tiki Torch | 2-3 | 4 | 5% | 42 | 2/6 | 51/58 |
| Tiki Tank | 3-2 | 7 | 12% | 22 | 2/5 | 36/50 |
| Mine cart | 1-6 | 6 | 8% | 20 | 3/7 | 52/63 |
| Rocket barrel | 2-3 | 7 | 10% | 25 | 3/6 | 44/58 |
| Rambi | 1-3 | 4 | 4% | 23 | 3/7 | 57/66 |

Level themes from the world tables (description-only, so an undercount): barrel cannons 1-5, 3-2, 5-5, 5-K, 6-8 (longest absence 17);
collapsing/sinking platforms 1-K, 2-K, 6-6, 8-5 (31); silhouette 1-4, 7-1, 8-4 (48); chased 5-8, 6-K, 8-2, 8-7 (12).
Tropical Freeze, same pattern faster: carts 1-4, 2-4, 4-2; rockets 2-B, 3-5, 5-2; Rambi 2-2, 3-3; silhouette 1-B, 4-3
(`dkc-world-lost-mangroves-dkctf.txt:19,21`, `dkc-world-tables-dkcr-dkctf.txt:76,78,82,89,91,101,112`): about once a world.

**Tropical Freeze's enemies, whole game (63 levels W1-W7 incl. A/B/K and bosses), measured** (`dkctf_table.py` ->
`ours-dkctf-table-output.txt`; wiki level lists of 11 enemies, `sources/dkc-dkctf-enemy-levels.txt`):

| Enemy | First | Levels | Share of later | Longest absence | Later worlds | 3-level windows with none |
|---|---|---|---|---|---|---|
| Tucks (the basic penguin) | 1-1 | 39 | 61% | 4 | 6/6 | 3/60 |
| Hootz (owl) | 1-4 | 35 | 58% | 7 | 6/6 | 6/57 |
| Tuff Tucks | 1-1 | 23 | 35% | 6 | 6/6 | 17/60 |
| Pointy Tucks | 1-2 | 23 | 36% | 7 | 5/6 | 16/59 |
| Painguin Tucks | 1-1 | 22 | 34% | 6 | 6/6 | 14/60 |
| Puffton | 2-1 | 18 | 31% | 10 | 5/5 | 18/52 |
| Waldough | 1-1 | 16 | 24% | 9 | 5/6 | 26/60 |
| Archy | 1-3 | 12 | 18% | 10 | 5/6 | 28/58 |
| Fluff | 1-1 | 10 | 15% | 16 | 4/6 | 37/60 |
| Boom Bird | 3-6 | 7 | 15% | 8 | 3/4 | 20/37 |
| Lemmington | 2-3 | 6 | 10% | 18 | 3/5 | 37/50 |

Tropical Freeze leans on its villains' foot soldiers far more than DKCR did: five kinds are in over a third of later levels, and the
basic Tucks is never absent more than 4 levels. The 11 kinds were picked as the common ones (the list page 404'd), so this table is
the top of the game, not all of it.

**The whole-game table, Super Mario 3D World (75 courses W1-W8, 80 enemy kinds), measured** (`sm3dw_full.py` ->
`ours-sm3dw-full-output.txt`; W4-W8 tables `sources/mario-wiki-3dw-world4-8-enemy-tables.txt`), kinds in 4+ courses:

| Enemy kind | First | Courses | Share of later | Longest absence | Later worlds | 3-course windows with none |
|---|---|---|---|---|---|---|
| Goomba | 1-1 | 16 | 20% | 11 | 7/7 | 34/72 |
| Fire Bro | 2-5 | 12 | 18% | 9 | 6/6 | 33/60 |
| Piranha Plant | 1-3 | 10 | 13% | 23 | 5/7 | 46/69 |
| Mini Goomba | 1-2 | 9 | 11% | 19 | 5/7 | 51/71 |
| Fire Piranha Plant | 2-3 | 9 | 12% | 19 | 4/6 | 41/63 |
| Para-Biddybud | 1-5 | 8 | 10% | 33 | 4/7 | 48/67 |
| Goomba Tower | 1-2 | 7 | 8% | 16 | 5/7 | 53/71 |
| Parabones | 6-7 | 7 | 25% | 5 | 2/2 | 7/22 |
| Galoomba | 2-2 | 6 | 8% | 26 | 2/6 | 51/64 |
| Coin Coffer | 2-2 | 6 | 8% | 30 | 3/6 | 50/64 |
| (9 more kinds in 4-5 courses) | | | 4-16% | 11-43 | | |

26 of 80 kinds are in one course only. Of 78 kinds with 6+ later courses: **0** reach a 1/3 share (median 3%, max 25%), **0** pass
ES's window, 0 pass the DKCR staple envelope, 17 pass the signature envelope. Mario's variety comes from many short-lived kinds; its
one staple, the Goomba, is in a fifth of later courses and absent up to 11 in a row. (An earlier run of this script dropped the
five X-1 courses of W4-W8 through a regex that ran across lines; the checker caught it; fixed and re-run.)

**Rayman Legends, Teensies in Trouble (one world), from the IGN level pages' text** (wiki-grade; RayWiki's level and enemy
sections were blocked, so this is what each walkthrough *names*, an undercount):

| Level | What the page names as its feature | Murfy | Chain slide | Teensies | Source |
|---|---|---|---|---|---|
| 1 Once Upon a Time | Murfy's first level | yes (first) | a chain turns a wall (no slide) | 10 | `rayman-ign-legends-once-upon-a-time.txt` (opening lines) |
| 2 Creepy Castle | guillotines on pressure plates, shielded enemies, wall jump, a pillow bounce | "you will not have Murphy" | yes | 10 | `...creepy-castle.txt` |
| 3 Enchanted Forest | "moving trees and roots that can help or hinder" | — | — | 10 | `...enchanted-forest.txt:15-19` |
| 4 Ropes Course | Murfy cuts and swings ropes; enemies on stilts | yes | yes | 10 | `...ropes-course.txt` |
| 5 Quick Sand | "crumbling structures that must be climbed and escaped from", a chase | "you won't have Murfy" (`:37`) | yes (`:29`) | 10 | `...quick-sand.txt:15,25` |
| 6 How to Shoot Your Dragon | shooting projectiles at dragons; Murfy rotates platforms | yes | yes | 10 | `...how-to-shoot-your-dragon.txt` |
| Dungeon Dash / Dungeon Chase | short Murfy runs with fire behind | yes | yes | 3 / 3 | `...dungeon-dash.txt:15-19`, `...dungeon-chase.txt:15-19` |
| Breathing Fire! (boss) / Castle Rock (music) | projectiles / run to the beat | — | — / yes | 3 / 3 | `...breathing-fire.txt`, `...castle-rock.txt:15-19` |

Read for return: each normal level has its own named feature (moving forest, ropes, sinking sand, shooting) that does not recur
inside the world; the helper character (Murfy) is in 3 of 6 normal levels (1, 4, 6) and both chases, and the chain slide in 4 of 6 plus the music level, i.e. Rayman's "staple" is a helper verb,
not an enemy or a piece. RayWiki's infobox gives the world as 10 levels and 90 Teensies (`rayman-raywiki-teensies-in-trouble-world.txt:10-11`).

**Answer to "settles our >= 1 in 3":**
- Read as a **share** (>= 1/3 of later stages), it is what each DKC game's **staple enemies** reach (DKCR 30-35%, two kinds;
  Tropical Freeze 34-61%, five kinds) and nothing else in those games; in 3D World no enemy kind reaches it (best 25%, Goomba 20%).
- Read as a **sliding window** (no 3 stages in a row without it), **no enemy in the three games passes strictly**. The nearest is
  Tropical Freeze's Tucks, empty in 3 of 60 windows, then Hootz 6/57; DKCR's best has 10 empty, 3D World's best 7 (of 22, late-game
  Parabones). ES 1319 is written as the window ("at least 1 of every 3 stages").
- What the two games do have in every stage is the **verbs** (run, jump, roll / stomp, the cling grass and barrel cannons that the
  level lists do not count): ES's "core moves" for us are verbs (jump, double jump, liana, climb), so the window can still be met for
  those, as gaps, liana and trunk climb nearly do in our run below. For animals, a shipped precedent exists only for a game's one or
  two staple foot soldiers (Tropical Freeze's Tucks), not for every taught animal or piece.
- A signature piece (vehicle, animal buddy, level theme) returns in DKCR at **4-10% of later levels, about every 2-3 worlds**
  (longest absence 20-25), and in Tropical Freeze about once a world.
- "1 in 4 for push and hide" and ">= 2-3 stages for world moves": no source has these numbers; DKCR's signature-piece envelope
  (3 of 6-7 later worlds, 3-7 levels in all) is the nearest measured analogue for a world move.

**Our ladder against those envelopes (the key idea run on the real code, `returncheck.py` on moveladder.json 7d9ad9a9,
`ours/returncheck-moveladder-7d9ad9a9.txt`):** of 40 mechanics with 6+ later stages, ES's 1-in-3 window passes **2** (gaps, and W10's
bolts); the DKCR staple envelope (>= 30% share, every later world, absence <= 8) passes **7** (gaps, liana, trunk climb, tayra, harpy,
hidden finds, bolts); the DKCR signature envelope (absence <= 25, >= 3/7 of later worlds) passes **15**. Failing even the signature
envelope today: rope (absence 36), breaking branch (42), water (54), boa (37), bush (28), push (62), moving platform (30), lift (84),
river logs (82), chase (93), and every zone but dark and bolt. So the measured fix list in ES 1535-1548 is right that these are gaps;
the research says the realistic floor for most of them is the signature envelope, not the 1-in-3 window.

---

## 2. Water: #59 ES 575 — sinking log "skip; cracking log gives the same feel for less"

- DKC Returns makes sinking the **theme of whole levels**: 2-K Tumblin' Temple, "the platforms are constantly sinking into the lava
  below" (`dkc-dkcr-2-k-tumblin-temple.txt:11`, layout `:17-21`); 8-5 Bobbing Basalt, "platforms ... bob in and out of the lava, and
  some even sink completely" (`dkc-dkcr-8-5-bobbing-basalt.txt:9`). As a **passing piece**: 6-2 Prehistoric Path, "wooden platforms in
  the tar, which sink with any of the Kongs' weight" (`dkc-dkcr-6-2-prehistoric-path.txt:15`); 1-K's are collapsing, not sinking.
- Rayman Legends 1-5 Quick Sand is built on it: "Nearly every structure you come across will fall over and sink into the sand rapidly"
  (`rayman-ign-legends-quick-sand.txt:25`). Rayman Origins uses sinking as a passing piece: toucans that "will sink if you stay on too
  long" (`rayman-gamefaqs-origins-walkthrough-x360.txt:884`), a building that "immediately begins sinking into the sand" (`:1164`).
- Shovel Knight's Lich Yard is built on sinking ledges ("ledges that will slowly descend into watery depths as you stand on them ...
  jump as needed, to avoid keeping too much weight on the treacherous footing"; they sink only with a shaman skull on them, a puzzle;
  later "sinking ... you can't necessarily tell that they are sinking because the darkness hides the fact") (a player's walkthrough,
  `sk-honestgamers-lich-yard-walkthrough-EXCERPT.txt`). This is the "weighted platform puzzles in the Lich Yard" Yacht Club later put
  "on cooldown" because the series had used them up (`sk-...-1of5.txt:91`): a whole-stage theme, combined with darkness in its own stage.
- Gemini already listed "rhythmic sinking platforms" as a one-stage focal twist (GEMINI-PCG-RESEARCH.md:42); the shipped games confirm
  the use, and also show it **returns** (DKCR 2-K -> 6-2 -> 8-5).
- **Sink time: no source.** The only wording is "slowly" and "after a few seconds of the entire platform sinking"
  (`tumblin-temple:17,32`), "rapidly" (Quick Sand). Timing it needs a longplay; YouTube is blocked here.

**Answer:** research does not say skip; in two series sinking is a stage theme and a returning one. Whether it is worth its cost now is
the designer's call; the cracking log is a different feel (a fixed delay, then gone) from a sink (a continuous, recoverable loss of
height you can step off). No sink time can be cited.

## 3. Rewards: #117 ES 1228 — "marks 0 for a sprint"

- DKC Returns: "All levels have exactly four KONG Letters" (`dkc-collectible-kong-letters.txt:21`), mine-cart and rocket levels
  included; only Key Temples and the 7-R transit rocket lack them (`:23`; `dkc-world-tables-dkcr-dkctf.txt:59`). Puzzle pieces,
  measured from the world tables: cart/rocket levels **5** each (one 7; 7-R none), normal levels **5-9, mean 6.3, median 7**
  (n = 43), Key Temples 5 (`ours-dkcr-table-output.txt`). Tropical Freeze vehicle levels: 5 each (`dkc-world-*`).
- Rayman Legends: a normal level has **10 Teensies** (`rayman-ign-legends-once-upon-a-time.txt:25`, `...enchanted-forest.txt:19`); the
  timed Invasion runs have **3**, "The first Teensy will be lost after 40 seconds, the second after 50 seconds, and the last Teensy
  after 60 seconds" (`rayman-ign-legends-once-upon-a-time-invasion.txt:15,21`); the Murfy chases Dungeon Dash / Dungeon Chase and the
  music run Castle Rock have **3** (`...dungeon-dash.txt:19`, `...dungeon-chase.txt:19`, `...castle-rock.txt:19`).

**Answer:** every measured sprint/chase stage carries collectibles except a transit stage (DKCR 7-R, which lacks letters and pieces): about **80% of a normal level's count** in DKC (5 vs 6.3 pieces,
full letters) and **30%** in Rayman (3 vs 10), placed on the run line or as a time-gated reward. Zero has a source only for a short connector stage between two levels (7-R), not for a sprint level. In our plan this
matters more than it looks: `stagePlan.ts` types **18 stages 'sprint'**, including 1-1 itself (engine-mixer `src/game/stagePlan.ts:34`;
ES:937 calls 1-1 "sprint").

## 4. Layout: #60 ES 597-599 — "a hill is a stepped mound of 2-4 rises"

- Dahlskog & Togelius 2012 name the stair patterns ("Stair up", "Stair down", "Empty/Enemy/Gap stair valley") and define "Stair up"
  as "tightly placed platforms, blocks or pipes with increasing height" (`smb-dahlskog-togelius-2012-patterns.txt:389-397,583-603`);
  **they give no step counts**. Launchpad's staircase rule is "the height of each gap in the staircase must be equal" (our own
  LEDGER-ENGINE-PAPERS.md:84-85).
- Measured from the SMB level text (TheVGLC, `sources/vglc/`; `python3 -I stairs_vglc.py sources/vglc` -> `ours-stairs-vglc-output.txt`,
  15 levels): 25 stairs. The last up-stair within 40 columns of a level's end leads to the flagpole (D&T: stairs exist "so that Mario
  may reach the highest point on the flag-pole", `:597-599`): 9 of those, rises 3-8 (four of 8). The **16 mid-level stairs: rises
  2:2, 3:2, 4:6, 5:3, 6:3, median 4**; 1-1's two pyramids are 4 up / 4 down. The script counts only exact one-block changes, so the
  equal 1-block step is how SMB stairs are built (the level text has no half steps), not a finding of the count; the count is the
  number of rises. Mario's standing jump is **4 blocks** (a player's machine measurement,
  `smb-reddit-mariomaker-jump-height-machine.txt:36`): a step is a quarter of a jump. (Fixed after review: the first run counted three
  flag stairs as mid-level and split 3-1's flag stair at an enemy drawn in a step cell.)
- Ours, measured (`stairscan.ts` on W1, W2, W5 of engine-mixer, `ours/stairscan-w1-w2-w5-engine-mixer-021ef4e9.txt`; a heuristic:
  landings within 60 px rising 16-108 px): 304 rising runs, rises per run **2:199, 3:66, 4:32, 5:4, 6:2, 7:1**; step height median
  **55 px = 0.51 of JUMP_RISE** (108 px, `src/game/physics.ts:133`), p10 30, p90 75; and steps are **unequal** (the common pair is
  55 then 75).

**Answer:** "2-4 rises" covers 10 of SMB's 16 mid-level stairs (2-6, median 4). What makes an SMB stair read as a slope is the small,
**equal** step (1/4 of a jump), which ours do not have (1/2 of a jump, unequal). If a mound is meant to read as a hill, the sourced
shape is about 4 rises of equal height at about a quarter to a third of a jump; that is the designer's ruling.

## 5. Art: #93 ES 861-863 — deep pits: "dark follows the bank faces, then fades over about 300 px"

- The one primary statement found: Yacht Club, "the background art around our bottomless pits. Typically the background fades to
  black right above one, letting you see the difference between certain death versus safely falling into another room"
  (`sk-specter-level-design-4of5.txt:53`), and gems placed low say a drop is safe (`sk-...-3of5.txt:72`). It gives the purpose (death
  pits must read differently from safe drops) and the direction (dark near the pit), **not a distance**.
- Ori: the saved art interviews (`ori-xboxwire-art-of-ori-2015.txt`, `ori-voxgroovy-figlhuber-interview.txt`, `ori-80lv-...`,
  `ori-airborn-studios-project-page.txt`) talk of layered depth and readable silhouettes; none describes pit edges. Rayman: nothing found.
  No screenshot could be fetched (image hosts blocked), so nothing was measured in pixels.

**Answer:** source for "a deep pit darkens toward the drop so it reads as death"; **no source for 300 px** or for following the bank
face. Matt's pick between the stills (cp3/pit-fade-choice) is the right way to settle the look.

## 6. Process: #62 ES 615 — "true slope: 3-5% plus HF; not now" (Tiny Wings, Alto)

- Illiger never says how the hill shapes are computed in the three interviews read in full: Kill Screen (`tw-killscreen-andreas-illiger.txt`),
  AppAgent (`tw-appagent-illiger-success-was-scary.txt`) and the German Superlevel / Making Games interview
  (`tw-makinggames-superlevel-illiger-interview-de.txt`). What he does say (dev-reported): procedural content "is a passion of mine"
  and he made the **graphics** procedural for variety "because the game always runs the same way"; the ideas matured "within about
  two months"; Tiny Wings took "7 months of development" (AppAgent `:27`), "almost single-handed" (Making Games profile box).
  **How Tiny Wings builds its slopes: no source.**
- What is sourced is a **reconstruction**, not Illiger's word: Kodeco's clone tutorial makes hills from random key points (dx 160 + 0-80,
  dy 60 + 0-40) joined by half cosine curves cut into 10-px segments (`tw-kodeco-tiny-wings-cocos2d-part1-RECONSTRUCTION.txt:253-256,394-429`).
- Alto's Adventure (the nearest shipped analogue): Nesbitt had "procedurally generated terrain" running in a Unity prototype "within a
  couple of days" (`tw-nesbitt-making-of-altos-adventure.txt:119-124`), but "trying to get [the physics] to work smoothly was easily one
  of the biggest challenges we faced" (`:201`); the game took "about 27 months" in all (`tw-app2top-altos-adventure-dev-history.txt:53`,
  a translation of Ryan Cash). Dev-reported, and about a whole game built on slopes.

**Answer:** the sources split the cost the way ES does: the slope **shape** is cheap (days), making a character **feel right** on it is
the long part. Whole slope games: Tiny Wings 7 months by one person, Alto 27 months by a small team, both built around the slope from
day one. No source gives a cost for adding slopes to an existing flat-collision engine; ES's 3-5% stays the planner's estimate.

---

## 7. The rules the engine could enforce (proposals, each with its source; the designer rules)

1. **One core concept per stage, taught in the stage's own four steps** (introduce, develop, twist, master), with at least 4 uses of
   it, one per step. Source: Hayashida, `structure-of-fun:117-133`. Matches STAGE-RULES §0b.2 already.
2. **Count new things per stage by kind**: <= 1 new *core concept*; new *pieces* (animals, props) may be 2-4 a stage. Source: 3D World
   measured 0-4 new enemy kinds a course (mean 2.1 in W1-W2); Yacht Club plans about 5 + 5. Staples used everywhere "don't count" (`sk 1of5:108`).
3. **Two return classes, not one** (measured, DKCR):
   - *verbs* (run, jump, double jump, liana, trunk climb): every stage or nearly (no shipped number needed: both games' verbs are in
     every level; ours measured 58-100%);
   - *staples* (the commonest animal of each element): in every later world, in about a third or more of later stages, longest
     absence about 4-8 stages (Tropical Freeze Tucks 61% / 4, Hootz 58% / 7; DKCR Tiki Goon/Buzz 30-35% / 7-8; Mario runs leaner,
     Goomba 20% / 11);
   - *signature pieces* (a world's own move, vehicles and set pieces, animals of one element): back in >= 3/7 of the later worlds,
     longest absence <= 25 stages. This is where SR:19-20's "comes back in every later world" is the stricter house rule.
4. **The harder form changes the verb** (blow out, flip, use a barrel, a new attack), usually within 0-2 worlds of the base (5 of 7
   DKCR forms). Source: DKCR Tiki forms (§1 #11).
5. **Sprints keep collectibles**, fewer and on the run line: about 3-5 where a normal stage has 6-10. Source: DKCR 5 vs 6.3, Rayman 3 vs 10.
6. **A stepped mound has equal rises**, about a quarter to a third of a jump each, about 4 of them (2-6). Source: SMB measured; Launchpad's
   equal-step rule.
7. **A death pit reads darker than a safe drop.** Source: Yacht Club `4of5:53`. Distance: Matt's pick.
8. **Bosses and set pieces are exempt from return rules** ("you can only show your 'magic trick' once", `sk 1of5:113`): this answers
   TRIAGE #129's research side (the M question to Matt stays).

## 8. Where ENGINE-SPEC's line is wrong (or says more than its source)

| ES line | It says | What the sources show |
|---|---|---|
| 113-116 | <= 1 new move or idea a stage | Shipped courses add 1-4 new kinds (3D World measured); only the core concept is one (Hayashida). Wrong if "idea" includes animals and pieces. |
| 116 | a move from the last 3 stages never absent > 2 stages | No measured game does this: 1/15 DKCR elements and 4/29 3D World kinds return within 2. Yacht Club: elements are "shuffled away, and revisited" (`2of5:114`). Matt's "keeps building" is the real source; label it so. |
| 139-140 | a taught animal "must not drop out for more than two stages" | Same; DKCR's commonest enemy is absent up to 7-8 levels, others 19-42. |
| 1317 | Echo in the next 2 stages | No source; measured games teach and master inside the stage, then return worlds later. |
| 1319 / 1535 | every core move in >= 1 of every 3 stages | As a sliding window, stricter than any enemy in DKCR, Tropical Freeze or 3D World (the closest, TF's Tucks, misses 3 of 60 windows); as a share, only the DKC games' staple foot soldiers reach it (2 kinds in DKCR, 5 in TF). Holds for verbs and at most a game's one or two staples. Our run: 2 of 40 mechanics pass. |
| 1541, 1542 | push and hide >= 1 in 4 | No source for 1 in 4. |
| 575 | sinking log: skip, "same feel" as cracking | Sinking is a whole-stage theme that returns in DKCR (2-K, 6-2, 8-5) and Rayman (Quick Sand); it is a different feel (continuous, recoverable), not the same. |
| 597-599 | a hill = 2-4 rises | SMB mid-level stairs 2-6 rises, median 4 (2-4 covers 10 of 16), each step one block = 1/4 of a jump; ES gives no step size. |
| 861-863 | fades over about 300 px | No source for the distance or for following the bank faces; source only for "dark toward the pit". |
| 1228 | marks 0 for a sprint | Every measured sprint level keeps collectibles (only DKCR's 7-R transit rocket has none) (DKCR full letters + 5 pieces; Rayman 3 Teensies). With 18 'sprint' stages incl. 1-1, this line empties a sixth of the game. |
| 174-175 | unused frames give "a second behaviour" | Supported; sharpen to "changes the verb" (5 of 7 DKCR forms). |

## 9. Cross-check with our earlier research (done after the first source list)

- **R1** (`reference/research/engine-2026-11-05/R1-shipped-pipelines.md`, engine-mixer): R1:328-360 had Shovel Knight's 26 rooms,
  5 + 5 and "on cooldown" and R1:527 read the 5 + 5 as a level budget: **agrees** with `sk 1of5:107-108`. R1:40-41 had "You can't show the same magic
  trick twice!" and "no gameplay concepts should overstay their welcome"; it did not have the "no ... one-offs" half of `1of5:113` or "never removed ... brain might start to hurt" (`2of5:110`), which bear on
  ES 113-116. R1:354-355 already quoted the pit fade (`4of5:53`). R1:21 said deep dive part 5 was 404; it is at
  `.../deep-dive-5-of-5/` (`sk-specter-level-design-5of5.txt`).
- **GEMINI-PCG-RESEARCH.md:42** ("One-Off Wonder": silhouettes, rhythmic sinking platforms as a stage's single twist): the DKCR level
  themes **confirm** silhouettes and sinking as stage themes, but **contradict "one-off"**: both return (silhouette 1-4, 7-1, 8-4;
  sinking 2-K, 6-2, 8-5).
- **LEDGER-ENGINE-PAPERS.md:84-85, 263** (Launchpad's equal-height staircase, marked "CONTRA (by our choice)"): SMB measured has equal
  1-block steps every time; our stairs measured unequal. The research sides with Launchpad.
- **LEDGER-2026-11-04-part2.md:22** already noted X-1 is a "sprint" in 8 of 10 worlds; with ES 1228 that is where "0 marks" bites.
- **R2:268-270** (Dahlskog & Togelius 2013, 23 patterns in 5 families): agrees with the 2012 paper's list; neither gives step counts.

## 10. Sources

Read in full by me: Shovel Knight deep dive parts 1 and 2 (`sk-specter-level-design-1of5.txt`, `2of5`), Hayashida's Gamasutra
interview's level-design section (`mario-gamedev-structure-of-fun-hayashida.txt:113-140`), Iwata Asks DKCR pages 1-3, Iwata Asks 3D Land
vol. 1 p2, the Kotaku GDC report, the D&T 2012 pattern tables, every DKCR/DKCTF level and enemy table used, every 3D World enemy
table used, the Rayman IGN level pages' openings and Teensy counts, the three Illiger interviews (Kill Screen, AppAgent, Making Games), the
Alto files' relevant sections, the HonestGamers Lich Yard walkthrough. Searched, not read
line by line (helpers saved them; I grepped them for every keyword of the brief): the rest of Iwata Asks 3D Land / 3D World, Wonder parts
2-4, Shovel Knight parts 3-5, the Rayman Origins walkthrough, Rational Design (R1 covered it).

Saved sources: `sources/` (one file per page; headers give URL and date read). Blocked: `sources/BLOCKED-mario.txt`, `BLOCKED-dkc.txt`,
`BLOCKED-rayman-ori.txt`, `BLOCKED-sk-smb-tw.txt` (YouTube; GDC Vault video; all RayWiki/Fandom Rayman pages; shovelknight.fandom.com;
every image host; Semantic Scholar).

## 11. Quality check (law 1, for a research report)

- Every number in §1-§6 was re-run from the saved files by the scripts named beside it; the outputs are committed next to them.
- Checked against our code, not memory: JUMP_RISE (`physics.ts:133`), 18 'sprint' stages (`stagePlan.ts`), the ladder (moveladder.json
  7d9ad9a9), W1 counts (mechtable on 021ef4e9).
- An independent checker re-opened about 150 cited lines and re-ran every script (11-05, ~11:50 AM ET). It found 16 defects, all fixed
  here: a regex in `sm3dw_full.py` that dropped five courses (figures re-run), three SMB flag stairs counted as mid-level, a misread
  (Tiny Wings' 7 months), overstatements ("2-4 new", "every sprint", "0-2 worlds"), a Lividstone claim with no source, wrong ES and
  source line numbers. Every committed output matches its script.
- Rough spots named, not hidden: wiki enemy lists are floors; the stair scan is a heuristic; no seconds figure from video; Rayman's
  per-form worlds and the pit distance have no source.

## 12. Method update (law 4)

- Worked better: fetch helpers save pages; **scripts build the tables from the saved pages** so every number is re-runnable, and a
  wrong parse shows (the first VGLC run dropped every row starting with "-" and found 3 stairs; fixed to 25, `stairs_vglc.py:20-22`).
- Failed: helpers that fetched 15-20 pages ran out before writing their report (three of four returned no report; their files were
  complete, and I read the files instead). Next time: ask for the file list first, the report second, and cap a helper at about 12 pages.
- Worked: an **adversarial checker on the finished draft** (given the report and the files, not my conclusions) found 16 defects in 6
  minutes, including a parse bug that changed a headline table. Make it a step before every research report (added to the method).
- New method file: `reference/methods/research.md`.
