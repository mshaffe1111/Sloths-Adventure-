# Roadmap: every piece of open work, one list

Kept by the roadmap keeper (helper session roadmap-keeper, started 2026-11-01 9:04 PM ET). The lead sends Matt's new asks as "R-new: ...";
the keeper adds them the same turn and replies with the id. How an item is written, sized, closed and swept:
`reference/methods/roadmap.md`. The gate `src/game/roadmap.test.ts` fails when open work exists in the repo with no R-id here.

**The goal (PARTNER.md):** all 10 worlds and their bosses passed by Matt on the phone, the story start to finish, then the Play Store app.

Last swept: 2026-11-01 (first build of the list, DRAFT for the lead; nothing here is mirrored to the Claude Doc yet).

## How to read it

- **Ids** R-1, R-2, ... are never reused. A closed item keeps its id and moves to "Done (archive)".
- **Size:** S under half a day, M 1-2 days, L 3+ days (one helper's working time, not counting Matt's review).
- **State:** `open`, `in progress`, `blocked (by ...)`, `held (by ...)`, `verify` (a fact must be checked in the code before it is
  worked or closed), `done (date, PR #n or commit)`.
- **Owner:** a helper's job name, `lead`, `Matt`, or `unassigned`.
- **Source:** where the item and Matt's words come from (file path, doc link, defect number D#, known-list group).

## Next up (the trio)

Matt (2026-11-01 ~9 PM ET, via his other thread): "three small things at a time" next week. The lead suggested Monday's trio; Matt has not
confirmed it.

| Slot | Item | Why now |
|---|---|---|
| 1 | R-60 GPU stage 0 | the foundation for "silky smooth" and the APK frame rate; stages 1, 2 and 4 can then run side by side |
| 2 | R-10 World 9: clean full-suite re-run, then curation | World 9's new build has no shipped seeds; it gates the World 9 boss and story pictures |
| 3 | R-40 Story plumbing (scene slots, scene moves, retry lines) | every other story chunk builds on it; no art, no money |

Right behind them: R-30 (Crocus Rex panel, the first HF spend), R-20 (3-9 ring wall), R-50..R-57 (the bot's stage-fix list).

## World 1-3

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-20 | 3-9 ring wall: the 330 px wall is reachable from the right branch (double jump + hoist = 350.5): raise to 370; ring line every visit; cats-left count; Dot points at the last cat; Dot explains the shut wall; the same once-per-device pattern on 1-9; new test first | M | open | unassigned | [coder ticket](https://claude.ai/artifact/A1aChgkhHtNwhAXZWqHtQk); STATUS 2026-11-01 ~9 PM |
| R-21 | 2-8: on the reed islands the room's reset post stands 30-44 px from the stone pile; a tap meant for a stone can reset the room | S | open | unassigned | reference/qa-reports/w2-cages-matt-2026-10-31/NEXT.md |
| R-22 | High baskets in World 1 (protoStage.ts mouth 236) and kitStage.ts basket3 use the unaimed flick-up arc; check in play, give them aimUp if a throw from under misses | S | open | unassigned | reference/qa-reports/w2-cages-matt-2026-10-31/NEXT.md |
| R-23 | 1-2 on Normal: the first-timer ends at the sealed door on seeds 1-3 (70/95 petals); petals flown over in Worlds 1, 3, 5. fix-petals (in PR #61) changed the float; re-measure with the fixed bot before closing | S | verify | lead | reference/prop-sheets/qa-notes/w8/NEXT.md "Open" 1-2; D14 |

## World 4-8

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-24 | 4-D, Dot's netting flight, as a showpiece (Matt, 2026-10-26: "very easy... didn't feel special enough and got a little repetitive"): new set pieces, scale, the story beat; tune against the logs; plan and mock-ups first | L | open | unassigned | Roadmap doc "Later: make Dot's netting flight (4-D) a big moment" |
| R-25 | World 5's old-generator stages: 5-6 (dead time 48.1 s on a 29.2 s budget, 80 of 80 rolls over) and 5-8 (variety 0.115); 5-3 under the 0.35 floor. NEXT.md predates PR #56 ("World 5 variety"): re-measure first | M | verify | unassigned | reference/prop-sheets/qa-notes/w5/NEXT.md |
| R-26 | World 8 draw cost: 400 px paintings drawn at ~100 px; pre-scaled copies of w8b/w8c/w8var if a phone stutters | S | open | unassigned | reference/prop-sheets/qa-notes/w8/NEXT.md "Open" 4 |

## World 9-10

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-10 | World 9 on the new generator: merge gen2-w9-swing (a3b4d97+), the 300-roll curation (no World 9 seeds shipped yet), bands seeds 1-3, Easy goals 9-6/9-9, walk, full gate, stills. Live World 9 is still the Oct 19 builder | L | open | unassigned | origin/gen2-w9:reference/prop-sheets/qa-notes/w9/NEXT.md; STATUS 2026-11-01 ~9 PM (Monday trio) |
| R-11 | World 10 on the new generator: the 400-roll curation (only 10-1 curated), seeds, bands, walks, stills. Live World 10 is still the Oct 19 builder | L | open | unassigned | origin/gen2-w10:reference/W10-NEXT.md |
| R-12 | World 9 and 10 art needs that money must cover (third in the HF order, after R-30 and the story's must-have pictures); Matt approves the picture list first | M | blocked (by R-10/R-11 lists, Matt's approval) | lead | STATUS 2026-11-01 ~9 PM (HF order) |

## Bosses

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-30 | Crocus Rex defeat panel (panel 3 of 5): he is a grey see-through sketch with white scratches beside painted Pokey and Dot; repaint on HF in the panel's style (first HF spend, "pennies") | S | open | unassigned | D17; reference/qa-reports/props-matt-2026-11-01/boss2-defeat-cutscene.png |
| R-31 | Every boss defeat scene (all 10) walked frame by frame, upright and sideways; a cutscene-frame check for transparency edges (D17 L2/L3) | M | open | unassigned | D17 countermeasure |
| R-32 | 9-10 Magma Drake rebuilt to its design (heat ride, crust, embers; replaces the creeping-strip phase 3) | L | blocked (by R-36, Matt's verdict on the design) | unassigned | origin/boss-design-9-10:reference/boss-design/9-10-and-10-10.md |
| R-33 | 10-10 General Iron-Claw rebuilt to its design (count, shell, storm, hand-off) | L | blocked (by R-36) | unassigned | same |
| R-34 | Boss arena plates, one per world, for the boss intros and defeats (~$0.40 each) | S | held (by HF money) | unassigned | reference/prop-sheets/qa-notes/hf-cutscenes/NEXT.md |
| R-35 | Older boss polish from the Oct 21 list: fights that repeat each other's moves, an arena gimmick per guardian; check each in the code first | M | verify | unassigned | Roadmap doc "Later: polish to re-check against the code" |
| R-36 | Decision: Matt judges the 9-10 / 10-10 fight designs (mock-ups made 2026-10-30, never shown on record) | S | open | Matt | origin/boss-design-9-10 |

## Story

The rewrite ships as ONE release when all worlds and the ending are built; test link world by world (Matt's decision 1, 2026-11-01).
Coder hand-off: https://claude.ai/artifact/2LkTtACE27mNCGsABz84pM; Matt's six decisions: https://claude.ai/artifact/5MNwnuNu2SeqHcvFPxWnS5.

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-40 | Scene-slot plumbing: generalise WORLD_GATE to a before-a-stage slot (never at stage 6), scene moves, retries as a line list, play once / replay in the Satchel / unlock for old saves already past | M | open | unassigned | hand-off; STATUS 2026-11-01 6:15 PM |
| R-41 | Text swaps, one world at a time (W1 to W10 and the prologue), with the text gate, a fit check on every box upright and sideways, and a fresh/old/finished-save walk per world | L | blocked (by R-40) | unassigned | hand-off |
| R-42 | The ledger and Wanted collections (own count, not the 30 finds); collectable spots moved to free stages | M | blocked (by R-40) | unassigned | hand-off; feedback doc |
| R-43 | Finale chapters, fitted to all 16 ending cards (decision 6) | M | blocked (by R-41) | unassigned | hand-off |
| R-44 | Story pictures that can't live with stand-ins (Pell's shield, the CLOSED/OPEN sign, ...): Matt approves the list, one picture list at a time, second in the HF order | M | blocked (by Matt's list approval) | lead | STATUS 2026-11-01 ~9 PM; 6:00 PM |
| R-45 | Playable story moments after the words, in this order: the chase, the climb, the scraping (decision 4) | L | blocked (by R-41) | unassigned | decision 4 |
| R-46 | Pell leaves a second gap by the cookhouse; the live W8/W10 scenes stay (decision 5); "NO TEA. BE RUDE." in the W6 fight (decision 2); favors story-only, rally in cutscenes (decision 3) | S | blocked (by R-41) | unassigned | decisions 2, 3, 5 |
| R-47 | The story fixes the review found: contradictions with live 5-M / carvings / pocket finds / ending cards / photo caption / cookhouse seam; double plays (Map, old-save halfways); reveal leaks (knot strikeout, forks, 7-7, ledger "my"); clock math | M | open | unassigned | feedback doc https://claude.ai/artifact/5MNwnuNu2SeqHcvFPxWnS5 |
| R-48 | Decision: a story beat set at the council so council.webp (plate and live clip, painted) is used, or drop it | S | open | Matt | hf-cutscenes/NEXT.md "Council" |
| R-49 | Old story asks from Oct 26-27 (story logic per world; "Follow the petals" said early; Flicker's arc and Dot's jealousy): check what the live game and the rewrite already cover, fold the rest into R-41 or close | S | verify | roadmap-keeper | Roadmap doc "Next when tokens allow" |

## Art

Hugging Face: **$72 left, all of it, no top-ups** (Matt, firm, 2026-11-01). Spend order: R-30, then R-44, then R-12; keep about $15 in reserve.
Art round 2 (~$62) is held. Matt approves every picture list, one at a time, before a helper spends.

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-61 | Art round 2: backdrops and cutscene art (~$62) | L | held (by Matt: money) | Matt | STATUS 2026-11-01 ~9 PM |
| R-62 | Icons B-E (painted and paid, ~$6.8; branch icons-painted 6d9a5984, not on main): ship in the next release. The roadmap doc wrongly lists them as held; holding saves no money | S | blocked (by Matt's yes) | lead | STATUS NOTE after 2026-11-01 ~9 PM; reference/qa-reports/icons-painted/ |
| R-63 | Backdrops at $0: move w2mist off 2-1 (or crop its sky); hold W5 gold and dusk1 far sets to the floor (floor.py) | S | open | unassigned | reference/prop-sheets/qa-notes/hf-backdrops2/NEXT.md "Exact next step" |
| R-64 | World 1's second middle strip (the 3 trees repeat each screen width sideways) | S | held (by HF money) | unassigned | hf-backdrops2/NEXT.md; roadmap doc |
| R-65 | Decision: does World 10's rain end? (w10night and w10after are painted and unused until Matt answers) | S | open | Matt | hf-backdrops2/NEXT.md "Held back" |
| R-66 | Cutscene leftovers: W9 dusk/night plates (48 panels, ~$1), W8 moon falls outside the frame sideways ($0), fine motion (lanterns, fire, steam, webs, ~$3), sky and water motion (~$2) | M | held (by HF money; the W8 moon fix is $0 and can go now) | unassigned | reference/prop-sheets/qa-notes/hf-cutscenes/NEXT.md |
| R-67 | Props round 3 (W6 has 9 bank pieces, W7 12; aim 15+), remakes, W4/W7 hanging pieces (~$4); cutter key-colour pass ($0) | M | held (by HF money; the $0 cutter pass can go now) | unassigned | reference/prop-sheets/qa-notes/hf-props/NEXT.md |
| R-68 | Floating props (Matt, 2026-11-01): balcony planters on W2 stone faces with nothing under them, reeds drawn into the soil, a frond over the HUD. A prop-grounding test over all stages, then a walk of every world's props | M | open | unassigned | D16; reference/qa-reports/props-matt-2026-11-01/ |
| R-69 | Art made but never drawn (artUse.allow.json, 276 entries): bosses 70, shared 41, W4 35, W1 15, W3 16, W2 13, W9 17, W5 14, story 14, W7 12, W10 11, creatures 9, W6 8, UI 1. Use it as worlds are touched; the list only shrinks | L | open | lead (per owner in the file) | src/game/artUse.allow.json |
| R-70 | Old art asks: ART-TO-GET #2, #3, #4, #11, #16, #18-22; moving cutscene acting; the ten new creatures; frog/spider/tayra/caiman/harpy clips; the 45-second promo video. Check each in the code and close or re-file | S | verify | roadmap-keeper | reference/ART-TO-GET.md; roadmap doc "Alongside" and "Videos" |

## Perf/GPU

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-60 | GPU stage 0: PixiJS v8 (pinned), one WebGL 2 canvas under the 2D canvas, the 30 fps loop driving both, context-loss handling | S | open | unassigned | reference/GPU-RENDERER-PLAN.md; STATUS 2026-11-01 ~9 PM (Monday trio) |
| R-71 | GPU stage 1: backdrops and skies as tiling sprites | S | blocked (by R-60) | unassigned | GPU-RENDERER-PLAN.md |
| R-72 | GPU stage 2: the ground's baked squares as textures | S | blocked (by R-60) | unassigned | GPU-RENDERER-PLAN.md |
| R-73 | GPU stage 3: creatures and Pokey as atlas textures, hurt flash as a tint shader | M | blocked (by R-60) | unassigned | GPU-RENDERER-PLAN.md |
| R-74 | GPU stage 4: props, plants, dress, petals, particles batched | M | blocked (by R-60) | unassigned | GPU-RENDERER-PLAN.md |
| R-75 | GPU stage 5: measure what is left on the 2D canvas; move or bake the costly parts | S | blocked (by R-71..R-74) | unassigned | GPU-RENDERER-PLAN.md |
| R-76 | GPU stage 6: the APK's WebView pinned to 60 Hz while playing; a 15-minute heat run on Matt's Pixel, Samsung and OnePlus (Matt, 2026-10-30: APK "a little buggy", weaker frame rate) | S | blocked (by R-75) | unassigned | GPU-RENDERER-PLAN.md; STATUS 2026-10-30 |
| R-77 | Narrow phones (< 380 px): on 360x740 upright the camera keeps Pokey's head ~77 px under the HUD, so Dot's box has no clear spot at times (4-2); frame more room above him | S | open | unassigned | roadmap doc; dot-box 2026-11-01 |
| R-78 | Animation sheets over 4096 px (13 files: dangler, dozer, mantis, queen, seamstress, soldier, drake, golem, ironclaw x2, thornbark x3) and the w5Look drawW5Light blend: split or shrink; the lists only shrink | M | open | unassigned | tools/perf/limits.json art.knownOver4096, blends.allowlist |

## Play Store

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-80 | Decide paid or free before the first production release (a free app can never become paid); then the payments profile, price, countries | S | open | Matt | reference/PLAY-STORE.md §4.1-4.5 |
| R-81 | Closed test: a personal developer account made after Nov 2023 needs 12+ testers opted in for 14 days in a row before production (calendar time: start it early) | L | open | Matt | PLAY-STORE.md §4.9 |
| R-82 | Store listing: 512x512 icon, 1024x500 feature graphic, 2-8 phone shots (1920x1080 and 1080x1920) and tablet shots, short and full descriptions, category / email / website | M | open | unassigned + Matt approves | PLAY-STORE.md §5.4-5.8 |
| R-83 | Target audience (Families policy) and the IARC content rating questionnaire | S | open | Matt | PLAY-STORE.md §5.1-5.2 |
| R-84 | Accessibility basics: 48 dp hit areas, labels on icon buttons, the screen-shake setting (AN-10) | M | verify (some may be done since 10-29) | unassigned | PLAY-STORE.md §5.3 |
| R-85 | Upload key and the signing secrets, so the workflow makes the signed bundle (bundleRelease) | S | open | Matt | PLAY-STORE.md §3b, §6 |
| R-86 | Offline and low-memory Android test of the store build before submitting | M | blocked (by R-76) | unassigned | roadmap doc "Later: the Google Play Store app" |

## Menus/UI

Each clipcheck group and playerText key below is a shrink-only known list entry (LAWS law 5); the gate ties each one to its R-id.

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-90 | World Map stage card: long stage and boss names cut, descriptions clamped (19 entries). Never truncate: names wrap to two lines, descriptions show in full | S | open | menu-polish job | clipknown G1 |
| R-91 | World Map sideways: first and last stage nodes under the notch bands (3) | S | open | menu-polish job | clipknown G2 |
| R-92 | Settings tap targets under 44 px: Game segmented buttons, sliders, Mute, Save/Load tabs (6) | S | open | menu-polish job | clipknown G4 |
| R-93 | World Map plaque: long world names cut upright (3) | S | open | menu-polish job | clipknown G5 |
| R-94 | Satchel find reader Close 33 px; keepsake "What it looks like" 26 px (2) | S | open | menu-polish job | clipknown G7 |
| R-95 | How to Play sideways: chapter tabs 30-32 px and under the left notch; X and right tiles under the right notch (6) | S | open | menu-polish job | clipknown G8 |
| R-96 | New Game question: plaque "Start a new game?" cut upright (1) | S | open | menu-polish job | clipknown G9 |
| R-97 | Settings About: rows taller than their box; Shaffer and Check for updates buttons 38 px (4) | S | open | menu-polish job | clipknown G10 |
| R-98 | Repeated player text: Dot lines duplicated (lesson vs control-test copy, repeated hints); "The snail" find title x10; two medals with the same description; "I'm going to get Meeca back." x3 | S | open | menu-polish job | playerText.known: "Dot lines: exact duplicates", "find titles: exact duplicates", "medal descriptions: differ only in a number or name", "story beats: exact duplicates" |
| R-99 | Vector icons still allowed in player-facing components (iconRegister.allow.json, ~20 files); painted icons replace them as icons B-E land, the list only shrinks | M | blocked (by R-62) | icons-painted | src/components/iconRegister.allow.json; D13 |
| R-100 | Dot's tips, next steps: re-measure the box narrower (3 lines) before grazing (1-2 sideways grazes the way ahead and the score plate); Dot flies beside a far box; Dot's sprite keeps out of the way ahead | M | open | unassigned | roadmap doc; dot-box 2026-11-01 |

## Sound

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-110 | No open sound item is written in the repo (the recorded effects replaced the synthesized set, 3e626838, 2026-10-30). Waiting on the lead's inventory; PARTNER.md's check "no pings, stacking or silence at key moments" needs a walk of Worlds 9-10, the bosses and the new story scenes | S | verify | roadmap-keeper | PARTNER.md "The little pieces" |

## Stage fairness and difficulty (all worlds)

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-50 | 2-9 Easy: a turtle hits at 3.8-4.0 s, before Dot's turtle tip (5.2-5.8 s), 3 of 3 runs | S | open | unassigned | reference/qa-reports/bot-fix/README.md §6.1 |
| R-51 | 1-7 Easy and Normal: the eagle's first strike lands with the nearest bush 700-990 px away; one strike from off screen | S | open | unassigned | bot-fix §6.2 |
| R-52 | 1-8: a snake hits and a fall costs a life with no tip teaching either (check whether an earlier World 1 stage teaches the snake) | S | open | unassigned | bot-fix §6.3 |
| R-53 | World 4 falling rocks hit with no tip (4-1, 4-3, 4-6): the first rock stage needs Dot's line or a tell | S | open | unassigned | bot-fix §6.4 |
| R-54 | 6-7: the eagle's first strike with no bush anywhere near (5196-5574 px) | S | open | unassigned | bot-fix §6.5 |
| R-55 | 6-8: frogs and tayras hit with no tip (fresh-save caveat) | S | open | unassigned | bot-fix §6.6 |
| R-56 | 7-4: an untaught life loss plus stranding on 5 of 6 runs; look in the engine first | S | open | unassigned | bot-fix §6.7 |
| R-57 | Lives hotspots: 4-7 pits (8.2/min Normal), 4-4 water, 7-9 water, 2-5 Easy water, 2-8 Easy cage pools: thumb sweep at each, "unfair" vs "hard but fair" | M | open | unassigned | bot-fix §6.8 |
| R-58 | Decide once: does a later world's first stage re-teach the punch before its first animal? (the punch tip lands 1-9 s after the first hit in 10-1, 9-8, 10-6, 9-5, 7-2, 7-8, 7-9, 5-6) | S | open | lead (Matt if it changes the feel) | bot-fix §6.9 |
| R-59 | Test-bot modes so every stage type can be measured: puzzle (room solver), hunter, collector + fern search, climb probe, back-up-to-a-step, push | L | open | unassigned | bot-fix §7; roadmap doc |
| R-120 | Re-run all 20 difficulty bands with the fixed bot (877a819b) before any band number is used (w7.ts and w4Normal.ts were tuned on bands); World 7 and 8 Normal first. Heads-up: on lives alone Normal no longer rises world by world | M | blocked (by R-59 for the stage types the bot can't play) | unassigned | bot-fix §4; roadmap doc |
| R-121 | Difficulty tuning (Matt, 2026-10-31: "Most of it is very easy on Normal"): a target curve rising across Worlds 1-10 (real challenge from World 5), tuned with pieces, gaps, timings and enemy counts; Easy clearly easier everywhere | L | blocked (by R-120, R-122) | unassigned | roadmap doc "Next week: difficulty and checkpoints" |
| R-122 | Decision with Matt: what "harder but fun" means per world (timing beats and combinations, fewer cheap hits) | S | open | Matt + lead | same |
| R-123 | Checkpoints (Matt, 2026-10-31: "laid out in weird areas and when not needed"): audit every stage's flags, move them to natural spots, drop the unneeded ones, make placement a generator rule | M | open | unassigned | same |
| R-124 | The fall rule ("hurt, then cost a life": ~2 screens = a heart plus dazed, ~3+ = a life, more room on Easy), tuned alongside R-121 | S | blocked (by R-121) | unassigned | same |
| R-125 | A swimming stage (Matt's idea, 2026-10-26: real sloths swim fast, so a water stage where Pokey is suddenly fast). Swimming is in the game (heroSwim.ts, waterTeach.ts) but no stage built around it was found (6-4 Low Tide is a mudflat sprint, stagePlan.ts:93). Ask Matt if it is still wanted | S | verify | roadmap-keeper | roadmap doc "Next when tokens allow" |

## Tools/process

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-130 | The roadmap gate (src/game/roadmap.test.ts): orphans in the defect log, known lists and NEXT.md files fail the build; done items must name a real commit or PR | S | in progress | roadmap-keeper | this job's brief |
| R-131 | reference/methods/roadmap.md: how an item is written, sized, closed and swept | S | in progress | roadmap-keeper | LAWS law 4 |
| R-132 | A "first-timer meets the goal on Normal, seeds 1-3" check for every goal stage, in the gate per touched world | M | open | unassigned | D14 countermeasure |
| R-133 | First-timer bots run on every touched world at every merge (the Pareto's "unfair spots" gap) | M | open | unassigned | CONTINUOUS-IMPROVEMENT.md Pareto |
| R-134 | Every shot tool refuses to run on a branch without origin/main (done for tools/art/icons/shots.mjs; the rest to follow) | S | open | unassigned | D23 yokoten |
| R-135 | Methods still to write: stage-build.md, test-link-and-release.md, hf-cutscenes.md, hf-props.md (the next helper of each kind writes it) | M | open | next helper of each kind | reference/methods/README.md index |
| R-136 | In-play text overlap check (clipcheck-style, Dot's box vs the take-off post and the next landing) | M | open | unassigned | D10 (L3 "later") |
| R-137 | Two items ticked in the old doc with no commit traced yet: sticky vines (a few vines leave Pokey stuck: up, down and flicking all fail) and no tall double jumps in 1-1 to about 1-3. Find the commit, or reopen | S | verify | roadmap-keeper | roadmap doc "Next when tokens allow" ticks |
| R-138 | Older open asks from the Oct 21-28 doc sections (empty stretches, stages feel the same, puzzle kit, special gestures, carrying rule, stuck sparkle, accessibility menu, best times): check each against the code, close with proof or re-file | S | verify | roadmap-keeper | roadmap doc "Next when tokens allow", "Always", "Later: polish" |

## Decisions waiting on Matt

Ask one at a time, multiple choice.

| ID | Question | Blocks |
|---|---|---|
| R-62 | Ship icons B-E (already painted and paid) in the next release? Lead recommends yes | R-99 |
| R-36 | The 9-10 / 10-10 fight designs: build as designed, change, or keep today's fights? | R-32, R-33 |
| R-65 | Does World 10's rain end? | w10night / w10after |
| R-48 | A council beat for the painted council plate, or drop it? | - |
| R-122 | What "harder but fun" means per world | R-121 |
| R-80 | Paid or free (decided before launch, can't go free-to-paid) | the store listing |
| R-139 | Close the stale doc decisions: motion model v2 vs v1 (job from Oct 25), which creature designs to keep, the General's soldiers' animal, what goes in first (Meeca/creatures/acting), the 45-second promo video. Most look settled by what shipped; the keeper confirms in code and asks only what is still open | - |

## Done (archive)

Each closed item names its proof. Worlds 4-8 are built and live; Worlds 9-10 are live on the Oct 19 builder (their new builds are R-10, R-11).

| ID | What | Done | Proof |
|---|---|---|---|
| R-1 | Memory fix from the code-review session (30-45 MB less in play) | 2026-10-25 | PR #27 |
| R-2 | The handoff (CLAUDE.md, handoff guide, art and test-link tools) | 2026-10-25 | PR #28, PR #29 |
| R-3 | World 4 built: 4-1 to 4-9, Dot's netting flight, 4-10 Sky Sovereign; parachute leaf glide (Matt picked, Oct 25) | 2026-10-26 | PR #30 |
| R-4 | World 5: 5-1 and 5-2 (PR #34); 5-3 to 5-5 and Meeca's stage (PR #37); World 5 on the new generator (PR #46) | 2026-10-29 | PR #46 |
| R-5 | World 6 on the new generator; 6-8 Stilt Climb | 2026-10-29 | PR #46, PR #48 |
| R-6 | World 7 on the new generator; 7-4 The Slide | 2026-10-30 | PR #50, PR #48 |
| R-7 | New World 8; 8-2's rope blooms fair on Normal (w8-rope2) | 2026-11-01 | PR #58, PR #61 |
| R-8 | Meeca's stage (5-M) redone: rebuilt, trails, fixed, then the 0.9.2 fix (invisible Meeca: baked copy re-baked after a lost canvas; Matt "plays much better") | 2026-11-01 | PR #41, PR #44, PR #56, PR #60 |
| R-9 | Worlds 1-4 rebuilt with puzzles, then the variety pass (Worlds 1-4 replay differently) | 2026-10-28 | PR #39, PR #40, PR #42, PR #43 |
| R-13 | The Android build: APK workflow works and puts each release's APK on the Releases page (v0.9.3-30) | 2026-10-31 | PR #57 |
| R-14 | The fixed first-timer bot and its self-test in the gate | 2026-11-01 | 877a819b (PR #61) |
| R-15 | A find on every layout of every stage (D9); old phones' quality-step hitch (D11, warmup-5m) | 2026-11-01 | PR #61 |
| R-16 | Journal and find hints: a unique line per stage and per find; playerText gate (D1, D2, D18) | 2026-11-01 | PR #61 |
| R-17 | Dot's tip box keeps out of the way and draws above pickups (D10, D22) | 2026-11-01 | e9f4dee2 (PR #61) |
| R-18 | Painted icons group A (start screen) beside the satchel (D13, first part) | 2026-11-01 | PR #61 |
| R-140 | Normal goals: 87.5% of reachable petals and flowers, every animal freed, 75% of predators; crumbled platforms come back only after 30-35 s and off screen (four doc ticks, Oct 26-27) | 2026-10-28 | 58dba44e (PR #39) |
| R-19 | 2-3 stuck cages (Matt, 2026-10-31) | 2026-11-01 | 33fd7b4c (PR #59) |

## Estimate

Open work, by size (S = 0.5, M = 1.5, L = 4 helper working days), counting every item not done (2026-11-01 draft):

| Area | S | M | L | Helper-days |
|---|---|---|---|---|
| World 1-3 | 3 | 1 | 0 | 3.0 |
| World 4-8 | 1 | 1 | 1 | 6.0 |
| World 9-10 | 0 | 1 | 2 | 9.5 |
| Bosses | 3 | 2 | 2 | 12.5 |
| Story | 3 | 5 | 2 | 17.0 |
| Art | 5 | 3 | 2 | 15.0 |
| Perf/GPU | 6 | 3 | 0 | 7.5 |
| Play Store | 3 | 3 | 1 | 10.0 |
| Menus/UI | 9 | 2 | 0 | 7.5 |
| Sound | 1 | 0 | 0 | 0.5 |
| Stage fairness and difficulty | 11 | 3 | 2 | 18.0 |
| Tools/process | 5 | 4 | 0 | 8.5 |
| **All 90** | **50** | **28** | **12** | **115** |

**Honest estimate: about 6 to 8 weeks.** 115 helper-days, less ~8 held for money (R-34, R-61, R-64, R-66, R-67), is ~107. Three at a
time is ~36 working days: about 7 weeks at 5 days a week, 5 weeks if helpers run every day. On top: Matt's review of every world and
boss on the phone, the 10 `verify` items (some will close, some will grow), and the story's one release, which can't ship until
Worlds 9-10 and the ending are built. The Play Store closed test (R-81) needs 14 calendar days with 12 testers; it should start
while the last worlds are built, not after. Matt's "at least a month" is right; it is likely closer to two.
