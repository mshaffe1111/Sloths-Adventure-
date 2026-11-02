# Roadmap: every piece of open work, one list

The only list of work (LAWS law 21, Matt 2026-11-01). Kept by the roadmap keeper (helper session roadmap-keeper); the lead sends Matt's
new asks as "R-new: ..." and the keeper adds them the same turn and replies with the number. Method: `reference/methods/roadmap.md`.
Gate: `node tools/roadmapcheck.mjs` fails when open work in the repo has no number here, or a done item has no real proof.

**The goal (PARTNER.md):** all 10 worlds and their bosses passed by Matt on the phone, the story start to finish, then the Play Store app.

Last swept: 2026-11-01 9:27 PM ET (rebuild 2: Matt's R-1..R-8, the inventory `reference/roadmap-inventory-2026-11-01.md` merged).
DRAFT for the lead; the Claude Doc mirrors it after the lead's go.

## How to read it

- **Numbers:** Matt's own list is R-1 to R-8; their pieces are R-1.1, R-1.2, ... Everything else is R-149 and up. A number is never reused.
  Done work is archived as A-1, A-2, ... with its proof.
- **Size** (one helper's working time, not Matt's review): S under half a day, M 1-2 days, L 3+ days.
- **State:** `open`, `in progress`, `blocked (by ...)`, `held (by ...)`, `verify` (a fact must be checked in the code first),
  `done (date, proof)`.
- **Owner:** a helper (by job name; strong ones from `reference/HELPERS.md`), `lead`, `Matt`, `roadmap-keeper`, or `unassigned`.
- **Source:** where it comes from (file, doc link, defect D#, audit-2 id, known-list group). The gate reads this column.
- Audit ids (LV-, UI-, SN-, CT-, VI-, AN-, ST-, PF-, WIP-, DOT-) are from `reference/audit-2/AUDIT-2.txt`; "bot §6" is
  `reference/qa-reports/bot-fix/README.md`; "inv" is the inventory.

## Next up

The build plan (R-7) is in `reference/BUILD-PLAN.md`: waves of three that don't share files, ordered by value per day, with the helper
effort and the Hugging Face spend for each wave.

## R-1 Bosses (Matt: "I believe, from 7 through 10 need to be completed")

What the code says (2026-11-01): every guardian 1-10 and Thornbark has a playable fight on main (bossDefs.ts, bossPlay.ts, lair*.ts).
Bosses 1-5 have painted plates and coaching; 6-8 and Thornbark have code-drawn lairs, no coaching lines and no third phase of their own;
9 and 10 play the old fights while their approved redesigns wait. No boss's defeat scene has been walked frame by frame, and Matt has
passed none of 6-10 on his phone.

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-1.1 | Crocus Rex (2) defeat panel 3 of 5: a grey see-through sketch with white scratches beside painted Pokey and Dot. Repaint on HF in the panel's style (first HF spend, pennies) | S | open | unassigned | D17; reference/qa-reports/props-matt-2026-11-01/boss2-defeat-cutscene.png |
| R-1.2 | Every defeat scene (all 10 + Thornbark) walked frame by frame, upright and sideways, plus a cutscene-frame check for see-through edges (D17 L2/L3) | M | open | unassigned | D17 |
| R-1.3 | Venom Fang (1): its lair is code-drawn; 19 unused venom art pieces wait to be placed | M | open | unassigned | inv Bosses; src/game/artUse.allow.json |
| R-1.4 | Shadow Prowler (3): code-drawn lair, painted lair upscale | M | open | unassigned | WIP-11; inv |
| R-1.5 | Sky Sovereign (4) and Tarantula Queen (5): the 5-10 council lace table not verified in play; the Sovereign's screech pose | S | verify | unassigned | inv Bosses; roadmap doc |
| R-1.6 | Marsh Reaver (6), Stone Idol Golem (7), Night-Wing Monarch (8): painted lairs (WIP-11), Dot's coaching lines (WIP-12, DOT-19: Matt approves the lines), the ALL-CAPS banners, a story-born third phase each (WIP-19). Audit Build 10 | L | blocked (by R-149.5 Matt's yes on the coaching lines) | unassigned | audit-2 Build 10; inv |
| R-1.7 | 6-10: hits land during the dark intro bars; bossFair.test covers only 1-10 to 3-10 (LV-30) | S | open | unassigned | LV-30 |
| R-1.8 | The noisy 6-10 sprite (VI-30) and the Reaver's weapon that doesn't match the story (ST-14) | M | open | unassigned | VI-30, ST-14 |
| R-1.9 | Magma Drake (9) rebuilt to the approved design (heat ride, crust, embers, ends with a cup): set pieces packed in boss-910.webp but not drawn, 4 poses to re-roll, the 8-piece art list turned into HF jobs (~$3-5). About a week. Audit pushback: build it before the 9-2 canopy | L | open | unassigned | origin/boss-design-9-10:reference/boss-design/9-10-and-10-10.md §4-8; audit-2 Build 11 |
| R-1.10 | General Iron-Claw (10) rebuilt to the approved design (count, shell, storm), the hold move, a fight-to-finale hand-off with no cut tested on the OnePlus, 8 art pieces (~$3-5). About a week | L | blocked (by R-2.7 the hold move) | unassigned | boss-design §5; audit-2 Build 12 |
| R-1.11 | Thornbark (secret, behind 7-7): code-drawn lair, no coaching; the story adds one exchange | M | open | unassigned | inv Bosses |
| R-1.12 | Boss arena plates, one per world, for the intros and defeats (~$0.40 each) | S | held (by HF money: art round 2) | unassigned | reference/prop-sheets/qa-notes/hf-cutscenes/NEXT.md |
| R-1.13 | Matt plays every boss 1-10 and Thornbark on his phone and passes it (the goal's own check) | M | blocked (by R-1.1..R-1.11) | Matt | PARTNER.md "The goal" |

## R-2 Worlds 9 and 10 stages (Matt: "We still have 9 and 10 to get done, stages")

Live Worlds 9 and 10 are still the Oct 19 builder. The new builds are on `w9-pieces` (d1983eea, 2026-10-31) and `w10-pieces` (c76b3846,
2026-10-31), each about 365 commits behind main; older starts on `gen2-w9` / `gen2-w10`.

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-2.1 | World 9 new build: merge main into w9-pieces, clean full-suite re-run, drawcheck, merge the W8 rope and W10 piston timing, re-measure, curate once, band fixes, Easy goals | L | open | unassigned | qa-notes/w9/NEXT.md 1-8 (on w9-pieces); origin/gen2-w9:reference/prop-sheets/qa-notes/w9/NEXT.md |
| R-2.2 | World 9 HF stand-ins painted (cap $12, $0.30 spent) | S | blocked (by R-149.6 Matt approves the picture list) | unassigned | qa-notes/w9/NEXT.md 6 |
| R-2.3 | World 9's 13 new Dot lines | S | blocked (by R-149.2 Matt approves the Dot lines) | unassigned | reference/DOT-LINES-2026-10-31.md |
| R-2.4 | 9-2 The Last Trees, the canopy special stage (approved 10-30): the hang-under move, 5 HF pieces (~$3), mock-up first | L | open | unassigned | special-mockups/w9-last-trees; audit-2 Build 8 |
| R-2.5 | 9-7's climb (old generator) and the raft-lock room (held for the Drake pass) | M | open | unassigned | WIP-15; qa-notes/w9/NEXT.md 9 |
| R-2.6 | World 10 new build: gear art re-cut, 4 gear sections, the gate, curate once, more 10-9 pieces, place the unused art | L | open | unassigned | qa-notes/w10/NEXT.md (on w10-pieces); origin/gen2-w10:reference/W10-NEXT.md |
| R-2.7 | The hold rule, "freeze on the flash" (WIP-18, CT-39): prototype for Matt first, then teach it in 10-3 and 10-4; brace and blown poses (~$1) | L | blocked (by R-149.10 Matt's yes on the rule) | unassigned | WIP-18, CT-39 |
| R-2.8 | 10-8 Clockwork Gate (great-wheel redesign, 3 HF pieces, ~$2), mock-up first | L | open | unassigned | special-mockups/w10-clockwork-gate; audit-2 Build 9 |
| R-2.9 | 10-2, 10-4 and 10-5 climbs on the new generator | L | open | unassigned | WIP-15 |
| R-2.10 | 10-3 thunder and 10-6 netting: neither stage exists yet | M | open | unassigned | WIP-5 |
| R-2.11 | World 10 far strip repainted at 2640 px (~$0.5) | S | open | unassigned | WIP-9 |
| R-2.12 | 10-9: a first-timer falls 20+ times | M | open | unassigned | inv World 10 |
| R-2.13 | World 10's new Dot lines | S | blocked (by R-149.2) | unassigned | reference/DOT-LINES-2026-10-31.md |
| R-2.14 | Matt plays Worlds 9 and 10 on his phone and passes them | M | blocked (by R-2.1..R-2.12) | Matt | PARTNER.md "The goal" |

## R-3 The WebGL change (GPU drawing) and speed

No pixi in package.json yet: stage 0 not started. Plan: `reference/GPU-RENDERER-PLAN.md`; each stage proven on Matt's three phones.

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-3.1 | Stage 0: PixiJS v8 pinned, one WebGL 2 canvas under the 2D canvas, the 30 fps loop driving both, context-loss handling | S | open | unassigned | reference/GPU-RENDERER-PLAN.md |
| R-3.2 | Stage 1: backdrops and skies as tiling sprites | S | blocked (by R-3.1) | unassigned | GPU-RENDERER-PLAN.md |
| R-3.3 | Stage 2: the ground's baked squares as textures | S | blocked (by R-3.1) | unassigned | GPU-RENDERER-PLAN.md |
| R-3.4 | Stage 3: creatures and Pokey as atlas textures, the hurt flash as a tint shader | M | blocked (by R-3.1) | unassigned | GPU-RENDERER-PLAN.md |
| R-3.5 | Stage 4: props, plants, dress, petals, particles, batched | M | blocked (by R-3.1) | unassigned | GPU-RENDERER-PLAN.md |
| R-3.6 | Stage 5: measure what's left on the 2D canvas; move or bake the costly parts (VI-23's 2x canvas cap comes free) | S | blocked (by R-3.2..R-3.5) | unassigned | GPU-RENDERER-PLAN.md; VI-23 |
| R-3.7 | Stage 6: the APK's WebView at 60 Hz while playing, a 15-minute heat run on the Pixel, Samsung and OnePlus (Matt 10-30: the APK is "a little buggy", under 20 fps) | S | blocked (by R-3.6) | unassigned | GPU-RENDERER-PLAN.md; STATUS 2026-10-30 |
| R-3.8 | An iPhone frame-rate number (PF-5); the Kelsbob iPhone run never read | S | open | unassigned | PF-5 |
| R-3.9 | 160 MB download and ~16 s to start on an old Android (PF-7 Play Asset Delivery, PF-11) | L | open | unassigned | PF-7, PF-11 |
| R-3.10 | Art size gate rules 2 and 3 | S | open | unassigned | reference/PERFORMANCE-RULES.md §8.2 |
| R-3.11 | Re-bakes by scale left: pit water, flags, ground chunks | S | open | unassigned | inv Performance |
| R-3.12 | 13 animation sheets over 4096 px and the w5Look drawW5Light blend: split or shrink (the lists only shrink) | M | open | unassigned | tools/perf/limits.json |
| R-3.13 | World 8: 400 px paintings drawn at ~100 px; pre-scaled copies of w8b/w8c/w8var | S | open | unassigned | reference/prop-sheets/qa-notes/w8/NEXT.md "Open" 4 |

## R-4 The story rewrite (one release when all worlds and the ending are built)

Coder hand-off https://claude.ai/artifact/2LkTtACE27mNCGsABz84pM; Matt's six decisions https://claude.ai/artifact/5MNwnuNu2SeqHcvFPxWnS5.
Test link world by world; nothing goes live until all of it is done (decision 1).

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-4.1 | Plumbing: a before-a-stage slot at 17 stages (generalise WORLD_GATE, never at stage 6), WORLD_MID moves, AFTER_BOSS changes, old-save unlocks, 2-box lines, retries as a line list, Dot-present ranges | L | open | unassigned | hand-off; inv Story |
| R-4.2 | Text swaps world by world (~10 files), each with the text gate, a fit check of every box upright and sideways, and a fresh/old/finished-save walk | L | blocked (by R-4.1) | unassigned | hand-off |
| R-4.3 | The ledger (10 pages) and the Wanted posters (10): Satchel sections, medals, reachability tests; collectable spots moved to free stages | L | blocked (by R-4.1) | menus B | hand-off; inv Story |
| R-4.4 | The Satchel's Scenes list changes for the new scenes | S | blocked (by R-4.1) | menus B | hand-off |
| R-4.5 | The storm candle prop; scripted talks in 6-6, 8-7, 9-3, 9-8 | M | blocked (by R-4.1) | unassigned | inv Story |
| R-4.6 | Finale chapters, fitted to all 16 ending cards (decision 6) | M | blocked (by R-4.2) | unassigned | hand-off |
| R-4.7 | Story pictures that can't live with stand-ins (Pell's shield, the CLOSED/OPEN sign, ...; ~30 in all, ~$10-20): Matt approves each list | M | blocked (by R-149.6) | lead | inv Story; STATUS 2026-11-01 ~9 PM |
| R-4.8 | Playable moments after the words, in this order: the chase, the climb, the scraping; Meeca's tap-and-freeze (decision 4) | L | blocked (by R-4.2) | unassigned | decision 4 |
| R-4.9 | Decisions 2, 3, 5 wired: "NO TEA. BE RUDE." in the W6 fight; favors story-only, the rally in cutscenes; Pell's second gap by the cookhouse | S | blocked (by R-4.2) | unassigned | feedback doc |
| R-4.10 | The review's fixes: contradictions with live 5-M / carvings / pocket finds / ending cards / photo caption / cookhouse seam; double plays; reveal leaks (knot strikeout, forks, 7-7, ledger "my"); the clock math | M | open | unassigned | https://claude.ai/artifact/5MNwnuNu2SeqHcvFPxWnS5 |
| R-4.11 | 3-6 and 3-7 stage-card wording | S | blocked (by R-4.2) | unassigned | hand-off |
| R-4.12 | Replies between characters that drop or arrive late (ST-9); Flicker drawn in play (AN-12, ST-10); one bubble style instead of three (ST-12). Audit Build 2 | M | open | unassigned | audit-2 Build 2 |
| R-4.13 | Upright cutscene framing: nobody cut off at the waist (VI-24, ST-13) | M | open | unassigned | audit-2 Build 2 |
| R-4.14 | The Oct 26-27 story asks (story logic per world, "Follow the petals" early, Flicker's arc, Dot's jealousy): check what the rewrite covers; fold the rest into R-4.2 or close | S | verify | roadmap-keeper | roadmap doc "Next when tokens allow" |

## R-5 Tuning (difficulty, fairness, checkpoints)

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-5.1 | bands.ts reads Easy as harder than Normal (Easy's dead time always 0, judged on its own stricter gate): fix the measure first | S | open | unassigned | qa-notes/w8/NEXT.md "Open" 3 |
| R-5.2 | Re-run all 20 difficulty bands with the fixed bot (877a819b) before any band number is used (w7.ts, w4Normal.ts were tuned on bands); World 7 and 8 Normal first | M | blocked (by R-5.1) | unassigned | bot §4 |
| R-5.3 | Bot modes: puzzle (room solver), hunter, collector + fern search, climb probe, back-up-to-a-step, push | L | open | unassigned | bot §7 |
| R-5.4 | The difficulty curve (Matt 10-31: "Most of it is very easy on Normal"): Normal rises world by world, real challenge from World 5; Worlds 3-5 pass the repo's own Normal gate (LV-20; World 5 misses by 16, branch w5-normal-wip); Easy clearly easier everywhere | L | blocked (by R-5.2, R-149.4) | unassigned | roadmap doc; LV-20 |
| R-5.5 | Checkpoints (Matt 10-31: "laid out in weird areas and when not needed"): audit every stage's flags, move them to natural spots, drop unneeded ones, make it a generator rule | M | open | unassigned | roadmap doc |
| R-5.6 | The fall rule ("hurt, then cost a life": ~2 screens = a heart plus dazed, ~3+ = a life, more room on Easy), tuned with R-5.4 | S | blocked (by R-5.4) | unassigned | roadmap doc |
| R-5.7 | Collection targets hold for a first-timer: "meets the goal on Normal, seeds 1-3" for every goal stage, as a gate per touched world | M | open | unassigned | D14 |
| R-5.8 | The punch tip lands 1-9 s after the first hit in later worlds (10-1, 9-8, 10-6, 9-5, 7-2, 7-8, 7-9, 5-6): decide the rule once, then apply it | S | open | lead | bot §6 #9 |
| R-5.9 | 2-9 Easy: a turtle hits at 3.8-4.0 s, before Dot's tip (5.2-5.8 s): the worst unfair spot | S | open | unassigned | bot §6 #1 |
| R-5.10 | 1-7: the eagle strikes with the nearest bush 700-990 px away, once from off screen | S | open | unassigned | bot §6 #2 |
| R-5.11 | 1-8: a snake and a fall with no tip; a jump at x9085 that 0% survive on Normal (hand-check first) | S | open | unassigned | bot §6 #3; LV-25 |
| R-5.12 | World 1's ~240 px walls in 1-1, 1-5, 1-6, 1-7: Matt plays every Jump-help setting | S | open | Matt + unassigned | LV-22 |
| R-5.13 | World 4 rocks hit with no tip (4-1, 4-3, 4-6) | S | open | unassigned | bot §6 #4 |
| R-5.14 | 4-2: jumps 0% survive on Normal | S | open | unassigned | LV-26 |
| R-5.15 | 4-7 under 2 minutes, 8.2 lives a minute in pits; 4-4 water 7 a minute | M | open | unassigned | LV-27; bot §6 #8 |
| R-5.16 | Water lives: 2-5 Easy 5.7 a minute, 2-8 Easy cage pools 8.2 a minute | M | open | unassigned | bot §6 #8 |
| R-5.17 | 2-4 runs 6.2 minutes (3x the median) | M | open | unassigned | LV-27 |
| R-5.18 | 6-7: the eagle with no bush within 5,000+ px | S | open | unassigned | bot §6 #5 |
| R-5.19 | 6-8 frogs and tayras hit with no tip; 6-9 frog hit at 7 s | S | open | unassigned | bot §6 #6; LV-25 |
| R-5.20 | 7-4 The Slide strands both bots; an untaught life loss | M | open | unassigned | bot §6 #7; LV-23 |
| R-5.21 | 7-9 water 6.2 lives a minute; the boa and tayra with no safe first meeting | S | open | unassigned | bot §6 #8; inv World 7 |
| R-5.22 | A whole swimming stage where Pokey is suddenly fast (Matt's idea 10-26). Swimming is in (6-7's root well, 87f1e2f6); the stage is not | M | blocked (by R-149.12 Matt: still wanted?) | unassigned | roadmap doc "Next when tokens allow" |

## R-6 Bugs (one item each)

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-6.1 | 3-9 ring wall: the 330 px wall is reachable from the right branch (double jump + hoist = 350.5): raise to 370; ring line every visit; cats-left count; Dot points at the last cat; Dot explains the shut wall; new test first | S | open | unassigned | [ticket](https://claude.ai/artifact/A1aChgkhHtNwhAXZWqHtQk) |
| R-6.2 | 1-9: Dot explains the locked exit only once per phone (the same pattern as 3-9) | S | open | unassigned | same ticket |
| R-6.3 | Floating props: W2 balcony planters on stone faces with nothing under them, reeds drawn into the soil, a frond over the HUD. A prop-grounding test over all stages, then a walk of every world's props | M | open | unassigned | D16; reference/qa-reports/props-matt-2026-11-01/ |
| R-6.4 | 2-8: the room's reset post stands 30-44 px from the stone pile; a tap meant for a stone resets the room | S | open | unassigned | reference/qa-reports/w2-cages-matt-2026-10-31/NEXT.md |
| R-6.5 | High baskets in World 1 (protoStage.ts mouth 236) and kitStage.ts basket3 use the unaimed flick-up arc; give them aimUp if a throw from under misses | S | open | unassigned | reference/qa-reports/w2-cages-matt-2026-10-31/NEXT.md |
| R-6.6 | World Map stage card: long stage and boss names cut, descriptions clamped (19). Never truncate | S | open | menus A | tools/perf/clipknown.json; clipknown G1 |
| R-6.7 | World Map sideways: first and last stage nodes under the notch bands (3) | S | open | menus A | tools/perf/clipknown.json; clipknown G2 |
| R-6.8 | Settings tap targets under 44 px: Game segmented buttons, sliders, Mute, Save/Load tabs (6) | S | open | menus A | tools/perf/clipknown.json; clipknown G4 |
| R-6.9 | World Map plaque: long world names cut upright (3) | S | open | menus A | tools/perf/clipknown.json; clipknown G5 |
| R-6.10 | Satchel find reader Close 33 px; keepsake "What it looks like" 26 px (2) | S | open | menus B | tools/perf/clipknown.json; clipknown G7 |
| R-6.11 | How to Play sideways: chapter tabs 30-32 px and under the left notch; X and right tiles under the right notch (6) | S | open | menus A | tools/perf/clipknown.json; clipknown G8 |
| R-6.12 | New Game question: the "Start a new game?" plaque cut upright (1) | S | open | menus A | tools/perf/clipknown.json; clipknown G9 |
| R-6.13 | Settings About: rows taller than their box; Shaffer and Check for updates buttons 38 px (4) | S | open | menus A | tools/perf/clipknown.json; clipknown G10 |
| R-6.14 | Dot lines duplicated (lesson vs control-test copy, repeated hints) | S | open | menus B | src/game/playerText.known.json: "Dot lines: exact duplicates" |
| R-6.15 | "The snail" find title x10 | S | open | menus B | src/game/playerText.known.json: "find titles: exact duplicates" |
| R-6.16 | Two medals with the same description | S | open | menus B | src/game/playerText.known.json: "medal descriptions: differ only in a number or name" |
| R-6.17 | "I'm going to get Meeca back." x3 in the story beats | S | open | menus B | src/game/playerText.known.json: "story beats: exact duplicates" |
| R-6.18 | Dot's tip box next steps: narrower box (3 lines) before grazing (1-2 sideways grazes the way ahead and the score plate); Dot flies beside a far box; Dot's sprite keeps out of the way ahead | M | open | unassigned | dot-box 2026-11-01; D10 |
| R-6.19 | Narrow phones (< 380 px): on 360x740 upright Pokey's head sits ~77 px under the HUD, so Dot's box has no clear spot at times (4-2) | S | open | unassigned | dot-box 2026-11-01 |
| R-6.20 | 5-M: Meeca overlaps the room 5 far-wall bank face; the gully stairs look alike | S | open | unassigned | reference/qa-reports/5-M-fix-2026-11-01/ |
| R-6.21 | A calmer win card; the faked italic font (UI-18, UI-21) | S | open | menus A | UI-18, UI-21 |
| R-6.22 | Pokey's slide puffs come in a row; flip gaps | S | open | unassigned | pokey-anim README; inv Controls |
| R-6.23 | Approved Dot lines keyed by id so engine text can't bring an old line back (DOT-18), then DOT-2's puzzle-room tips. No commit found for either | M | verify | unassigned | audit-2 Build 1 |
| R-6.24 | Build 1 leftovers with no commit found: UI-17 (an up-to-date ending card), AN-15 (pop-up motion), WIP-13 (commit the boss poses), CT-34 (touch feedback: Matt's call) | S | verify | roadmap-keeper | audit-2 Build 1 |
| R-6.25 | Vector icons still allowed in player-facing components (iconRegister.allow.json): painted icons replace them as icons B-E land; the list only shrinks | M | blocked (by R-149.1) | icons-painted | src/components/iconRegister.allow.json; D13 |

## R-7 The build plan (Matt, 2026-11-01)

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-7 | "figure out how to get the most out of our builds... using our continuous improvement, how to ensure that we're efficient with tokens... trying to match things that work in tandem... start marking off some small WebGL stuff, some small story pieces, and working towards finishing the levels in ways that are the most efficient and we get the bang for the buck." Waves of three that don't share files, value per day, helper effort, HF per wave | M | in progress | roadmap-keeper | lead 2026-11-01 9:12 PM; reference/BUILD-PLAN.md |

## R-149 Decisions waiting on Matt (one at a time, multiple choice)

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-149.1 | Ship icons B-E (painted and paid, ~$6.8; icons-painted 6d9a5984, not on main; clears 88 vector Icon uses)? Lead recommends yes | S | open | Matt | inv Decisions 1; STATUS NOTE 2026-11-01 |
| R-149.2 | The 45 new Dot lines (Worlds 1-4, 9, 10) | S | open | Matt | inv Decisions 2; reference/DOT-LINES-2026-10-31.md |
| R-149.3 | A council story beat so the painted council plate (council.webp) is used, or drop it | S | open | Matt | inv Decisions 3; hf-cutscenes/NEXT.md |
| R-149.4 | Does World 10's rain end? (w10night and w10after are painted and unused until then); and what "harder but fun" means per world (feeds R-5.4) | S | open | Matt | inv Decisions 4; reference/prop-sheets/qa-notes/hf-backdrops2/NEXT.md |
| R-149.5 | Boss coaching lines for 6-10 and Thornbark (DOT-19) | S | open | Matt | inv Decisions 5; DOT-19 |
| R-149.6 | Each HF picture list, one at a time ($72 left; order: R-1.1, story pictures, W9/W10; ~$15 reserve) | S | open | Matt | inv Decisions 6 |
| R-149.7 | Order: Worlds 1-5 onto gen2 now or after the rest; reset Worlds 1-4 best times? | S | open | Matt | inv Decisions 7; audit-2 Build 13 |
| R-149.8 | Under the Ruins (secret level), the garden hub, tilt steering (CT-29): build, later, or drop | S | open | Matt | inv Decisions 8 |
| R-149.9 | Play Store: final app ID, paid or free and the price, payments profile, account type (closed test of 12 testers x 14 days?) | S | open | Matt | inv Decisions 9; reference/PLAY-STORE.md §4 |
| R-149.10 | The hold rule "freeze on the flash" (WIP-18) | S | open | Matt | audit-2 calls |
| R-149.11 | Release art round 2 (~$62: backdrops ~$34, cutscenes ~$20, props ~$8)? Held | S | open | Matt | inv Decisions 10 |
| R-149.12 | 4-D rethink (R-141.1) and the whole swimming stage (R-5.22): still wanted? | S | open | Matt | inv Decisions 11 |
| R-149.13 | Motion model v2 has no record after Oct 25: drop it? (the other stale doc decisions were settled by what shipped: A-27) | S | open | Matt | roadmap doc "Decisions waiting on Matt" |
| R-149.14 | Controls decided 10-30/31 with no implementing commit found: charge-and-release mega (CT-31), slanted carry option b (CT-33), even run speed (CT-32, re-times every jump), vibration on in the app (AN-14): confirm each is still wanted | S | verify | lead | inv Controls; audit-2 calls |

## R-141 Worlds 1-8 (not bugs, not tuning)

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-141.1 | 4-D Dot's netting flight as a showpiece (Matt 10-26: "very easy... didn't feel special enough and got a little repetitive"); plan and mock-ups first | L | blocked (by R-149.12) | unassigned | roadmap doc "Later: make Dot's netting flight (4-D) a big moment" |
| R-141.2 | 5-3 variety 0.295 under 0.35; 5-4 dead time over budget on half its plays | M | open | unassigned | reference/prop-sheets/qa-notes/w5/NEXT.md §1 |
| R-141.3 | A lever/plate room from the unused w5b kit; re-roll the billowing web (< $1) | M | open | unassigned | reference/prop-sheets/qa-notes/w5/NEXT.md §6 |
| R-141.4 | 8-1 variety 0.401 under 0.45 | M | open | unassigned | inv World 8 |
| R-141.5 | Old-generator climbs: 7-2, 7-8, 8-7 (WIP-15; gen2-ascent has a start, R-143.5) | L | open | unassigned | WIP-15 |
| R-141.6 | Under the Ruins, the secret level (finds.ts:329 note waits; SECRET-LEVELS.md) | L | blocked (by R-149.8) | unassigned | reference/SECRET-LEVELS.md |
| R-141.7 | Matt plays World 7 on his phone and passes it | M | open | Matt | finish plan https://claude.ai/artifact/7LZN3UfpNBtBYM9dVjFX7H |
| R-141.8 | Matt plays World 8 on his phone and passes it | M | open | Matt | finish plan |

## R-142 Worlds 1-5 onto the new generator (unowned big block, Matt's plan 10-30)

Art made and grab bags approved (reference/prop-sheets/qa-notes/w1-4-art/NEXT.md); no helper briefed. Live World 5 uses gen2 only for 5-7
and 5-9 (w5.ts:130). Plan: `origin/plan-gen2-w1-4:reference/GEN2-W1-4-PLAN.md` (about 13,000 lines replaced, 2-3 weeks). Fixes the
look-alikes (LV-16: 1-1/1-5 0.98, 4-2/4-5, 6-5/6-9 0.93) and LV-10, LV-17, LV-18. Honest size: about 3 weeks of one helper.

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-142.1 | World 5: 5-6 onto gen2 and 5-8 hand-built (built on w5-rebuild afd0d02b, sent back 10-29, never merged): rescue or rebuild (see R-143.1) | L | blocked (by R-149.7) | unassigned | reference/prop-sheets/qa-notes/w5/NEXT.md §4-5 |
| R-142.2 | World 1 onto gen2 (grab bag approved 10-31) | L | blocked (by R-149.7) | unassigned | qa-notes/w1/GRAB-BAG.md; LV-28 |
| R-142.3 | World 2 onto gen2 | L | blocked (by R-149.7) | unassigned | qa-notes/w2/GRAB-BAG.md; LV-28 |
| R-142.4 | World 3 onto gen2 | L | blocked (by R-149.7) | unassigned | qa-notes/w3/GRAB-BAG.md; LV-28 |
| R-142.5 | World 4 onto gen2 (35 unused W4 pieces placed) | L | blocked (by R-149.7) | unassigned | qa-notes/w4/GRAB-BAG.md; LV-28 |
| R-142.6 | 6-5 / 6-9 look alike (0.93) | M | open | unassigned | LV-16 |

## R-143 Branches stranded since 10-30 (triage each: merge, cherry-pick, or close with a reason)

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-143.1 | w5-rebuild (afd0d02b, 18 ahead, ~1,200 behind): 5-6 on gen2, 5-8 hand-built | M | open | unassigned | inv; origin/w5-rebuild |
| R-143.2 | hazard-anim (9b10460e, 5 ahead): painted deep water for W2 and W6-10 | S | open | unassigned | inv; origin/hazard-anim |
| R-143.3 | polish-clean (a3193bf1, 11 ahead): key spill, 6-8 stilts | S | open | unassigned | inv; origin/polish-clean |
| R-143.4 | polish-pf1 (138041ae, 4 ahead): no flat backdrop at start, creature fade-in, PF-1b ground-decor stamps; check if superseded | S | open | unassigned | inv; origin/polish-pf1 |
| R-143.5 | gen2-ascent (968b3805, 29 ahead): climbs on gen2, not hooked in, no tests | M | open | unassigned | inv; origin/gen2-ascent |
| R-143.6 | polish-edges (a7d4ddf9, 10 ahead): 11 skies parked | S | open | unassigned | inv; origin/polish-edges |
| R-143.7 | polish-clean-sweep-w9-10 (f43e9484, 5 ahead) | S | open | unassigned | inv; origin/polish-clean-sweep-w9-10 |
| R-143.8 | w5-normal-wip (7bf0bdbc, 14 ahead): World 5 Normal gate work (feeds R-5.4) | S | open | unassigned | inv; origin/w5-normal-wip |

## R-144 Art

Hugging Face: **$72 left, all of it, no top-ups** (Matt, firm). Order: R-1.1, then story pictures (R-4.7), then W9/W10 (R-2.2, R-2.4,
R-2.8, R-1.9, R-1.10); keep ~$15 in reserve. Art round 2 (~$62) held. Matt approves every picture list first.

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-144.1 | Art round 2: backdrops (~$34, incl. the third and fourth moods; 2-1, 2-3, 2-4, 2-6, 2-7, 4-8, W5 gold and dusk1 fail the darkness floor), cutscenes (~$20), props (~$8) | L | held (by R-149.11) | Matt | reference/prop-sheets/qa-notes/hf-backdrops/NEXT.md; hf-backdrops2/NEXT.md |
| R-144.2 | $0 backdrop steps: move w2mist off 2-1 (or crop its sky); hold W5 gold and dusk1 to the floor (floor.py) | S | open | unassigned | reference/prop-sheets/qa-notes/hf-backdrops2/NEXT.md "Exact next step" |
| R-144.3 | World 1's second middle strip (~$1) | S | held (by HF money) | unassigned | hf-backdrops2/NEXT.md |
| R-144.4 | Cutscene leftovers: W9 dusk/night plates (~$1), fine motion (~$3), sky and water motion (~$2); the W8 moon off the frame sideways ($0, can go now) | M | held (by HF money; the $0 fix can go) | unassigned | reference/prop-sheets/qa-notes/hf-cutscenes/NEXT.md |
| R-144.5 | Props round 3 (W6 9 bank pieces, W7 12; aim 15+), remakes, W4/W7 hanging pieces (~$4); the $0 cutter key-colour pass | M | held (by HF money; the $0 pass can go) | unassigned | reference/prop-sheets/qa-notes/hf-props/NEXT.md |
| R-144.6 | Art made but never drawn: 276 pieces (bosses 70, shared 41, W4 35, W9 17, W3 16, W1 15, story 14, W5 14, W2 13, W7 12, W10 11, creatures 9, W6 8, UI 1); used as each world is touched | L | open | lead (per owner in the file) | src/game/artUse.allow.json; reference/prop-sheets/qa-notes/w1-4-art/NEXT.md |
| R-144.7 | Audit Build 5, a cleaner picture: World 1's thin code-drawn ledges painted (VI-19, P1, + HF), depth between mid and near layers (VI-22), leftovers, unpainted skies, twin slabs, flat W2 pit water, too much soil sideways (VI-25..VI-28, VI-31), bank ends repainted (VI-21), painted arena surfaces (VI-20) | L | open | unassigned | audit-2 Build 5, Build 2 |
| R-144.8 | Old art asks: ART-TO-GET #2, #3, #4, #11, #16, #18-22; moving cutscene acting; frog/spider/tayra/caiman/harpy clips: check each in the code, close or re-file | S | verify | roadmap-keeper | reference/ART-TO-GET.md |

## R-145 Sound and music

Audit-2 rates sound the weakest category (C+ vs AAA). Needs a listening session with Matt.

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-145.1 | Effects 20-40 dB too hot: re-level before the compressor (SN-11, first) | M | open | unassigned | audit-2 Build 3 |
| R-145.2 | Ambience never plays on phones (SN-14) | S | open | unassigned | audit-2 Build 3 |
| R-145.3 | A music fallback for iPhones (SN-15) | S | open | unassigned | audit-2 Build 3 |
| R-145.4 | One effect family (SN-16) and the SN-1 shelf cleanup | M | open | unassigned | audit-2 Build 3 |
| R-145.5 | More than one loop per world: a calm and a tense version of each tune (SN-12) | M | open | unassigned | audit-2 Build 3; finish plan SN-9, X-9 |
| R-145.6 | Listening session with Matt after R-145.1..R-14.5 | S | blocked (by R-145.1..R-14.5) | Matt | audit-2 Build 3 |

## R-146 Controls and feel (audit Build 4)

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-146.1 | Letting go of a liana (CT-30) | M | open | unassigned | audit-2 Build 4 |
| R-146.2 | Touches that wait for slow frames on mid-range phones (CT-38) | M | open | unassigned | audit-2 Build 4 |
| R-146.3 | The recorder sees the Pad and why Pokey left a vine (CT-37) | S | open | unassigned | audit-2 Build 4 |
| R-146.4 | A test that every stage plays on every control setting (CT-36) | M | open | unassigned | audit-2 Build 4 |
| R-146.5 | The hang and hold control design (CT-39), before Worlds 9 and 10 need them (pairs with R-2.7) | M | open | unassigned | audit-2 Build 4 |
| R-146.6 | The decided controls with no commit found (CT-31, CT-33, CT-32, AN-14): build what R-149.14 confirms | M | blocked (by R-149.14) | unassigned | inv Controls |

## R-147 Play Store

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-147.1 | Start the 14-day closed test (12+ testers) as early as there's a build Matt is happy for testers to see; it sets the earliest launch date. The final app ID is fixed before the first upload | L | blocked (by R-149.9) | Matt | PLAY-STORE.md §4.9; audit-2 Build 14 |
| R-147.2 | Signing secrets, so the workflow makes the signed .aab | S | blocked (by R-149.9) | Matt | build-apk.yml; PLAY-STORE.md §3b |
| R-147.3 | 16 KB page check; foldables, split screen, resize; older-WebView insets (UI-19) | M | open | unassigned | PLAY-STORE-RULES §1/§4; UI-19 |
| R-147.4 | Store listing: icon, feature graphic, screenshots (24 exist in reference/store from 10-30 but predate the new menus and icons), descriptions, category, email | M | blocked (by R-149.1 icons) | unassigned + Matt approves | reference/store; PLAY-STORE.md §5 |
| R-147.5 | Privacy text, data safety form, content rating (IARC), target audience (Families) | S | open | Matt | PLAY-STORE.md §5.1-5.2 |
| R-147.6 | Accessibility basics: 48 dp hit areas, labels on icon buttons, the screen-shake setting (AN-10) | M | verify | unassigned | PLAY-STORE.md §5.3 |
| R-147.7 | Offline and low-memory Android test of the store build before submitting | M | blocked (by R-3.7) | unassigned | roadmap doc "Later: the Google Play Store app" |

## R-148 Tools and process

| ID | What | Size | State | Owner | Source |
|---|---|---|---|---|---|
| R-148.1 | The roadmap gate (tools/roadmapcheck.mjs, in gates.yml) | S | in progress | roadmap-keeper | LAWS law 21 |
| R-148.2 | reference/methods/roadmap.md | S | in progress | roadmap-keeper | LAWS law 4 |
| R-148.3 | First-timer bots on every touched world at every merge | M | open | unassigned | CONTINUOUS-IMPROVEMENT.md Pareto |
| R-148.4 | Every shot tool refuses to run on a branch without origin/main (done for icons/shots.mjs) | S | open | unassigned | D23 |
| R-148.5 | Methods still to write: stage-build.md, test-link-and-release.md, hf-cutscenes.md, hf-props.md | M | open | next helper of each kind | reference/methods/README.md |
| R-148.6 | An in-play text overlap check (Dot's box vs the take-off post and the next landing) | M | open | unassigned | D10, D22 |
| R-148.7 | Dead-time and quiet-stretch limits as CI gates | S | open | unassigned | inv Tools |
| R-148.8 | World 8 merge hygiene leftovers from audit Build 7: band gates (WIP-3), the kid gate (WIP-21); WIP-10's merge-one-branch-at-a-time rule for W9/W10 | M | verify | unassigned | audit-2 Build 7 |
| R-148.9 | Doc ticks with no commit traced: sticky vines, no tall double jumps in 1-1 to 1-3; audit items marked done with no commit found: WIP-14, WIP-20, PF-4, PF-8. Find the commit or reopen | S | verify | roadmap-keeper | roadmap doc; inv "Done but still looks open" |
| R-148.10 | Older asks from the Oct 21-28 doc (empty stretches, stages feel the same, puzzle kit, special gestures, carrying rule, stuck sparkle, accessibility menu, best times): check each, close with proof or re-file | S | verify | roadmap-keeper | roadmap doc "Next when tokens allow", "Always", "Later: polish" |
| R-148.11 | Stale docs: TRACKER.md (10-29), HANDOFF.md (10-25), the finish plan's Phase 2-4 boxes, STATUS "Open decisions for Matt": point each at this list | S | open | roadmap-keeper | inv "Done but still looks open" |

## Done (archive)

Each closed item names its proof (a merged PR, or a commit). Worlds 4-8 are built and live; Worlds 9-10 are live on the Oct 19 builder.

| ID | What | Done | Proof |
|---|---|---|---|
| A-1 | Memory fix (30-45 MB less in play) | 2026-10-25 | PR #27 |
| A-2 | The handoff (CLAUDE.md, handoff guide, art and test-link tools) | 2026-10-25 | PR #28, PR #29 |
| A-3 | World 4: 4-1 to 4-9, Dot's netting flight, 4-10 Sky Sovereign; the parachute leaf glide | 2026-10-26 | PR #30 |
| A-4 | World 5: 5-1, 5-2; 5-3 to 5-5 and Meeca's stage; 5-7, 5-9 on the new generator | 2026-10-29 | PR #34, PR #37, PR #46 |
| A-5 | World 6 on the new generator; 6-8 Stilt Climb | 2026-10-29 | PR #46, PR #48 |
| A-6 | World 7 on the new generator; 7-4 The Slide | 2026-10-30 | PR #50, PR #48 |
| A-7 | New World 8 (curated, 8-4 Lantern Run per WIP-17); 8-2's rope blooms fair on Normal | 2026-11-01 | PR #58, 819d42af, PR #61 |
| A-8 | Meeca's stage redone, then the 0.9.2 fixes (invisible Meeca; Matt: "plays much better") | 2026-11-01 | PR #41, PR #44, PR #56, PR #60 |
| A-9 | Worlds 1-4 rebuilt with puzzles, then the variety pass | 2026-10-28 | PR #39, PR #40, PR #42, PR #43 |
| A-10 | Normal goals (87.5% of reachable petals and flowers, every animal, 75% of predators); crumbled platforms back after 30-35 s, off screen | 2026-10-28 | 58dba44e (PR #39) |
| A-11 | The APK workflow: each release's APK on the Releases page (v0.9.3-30) | 2026-10-31 | PR #57 |
| A-12 | The fixed first-timer bot and its self-test in the gate | 2026-11-01 | 877a819b (PR #61) |
| A-13 | A find on every layout (D9); the old phones' quality-step hitch (D11) | 2026-11-01 | PR #61 |
| A-14 | Journal and find hints: a unique line each; the playerText gate (D1, D2, D18) | 2026-11-01 | PR #61 |
| A-15 | Dot's tip box keeps out of the way and draws above pickups (D10, D22) | 2026-11-01 | e9f4dee2 (PR #61) |
| A-16 | Painted start-screen icons, group A (D13, first part) | 2026-11-01 | PR #61 |
| A-17 | 2-3 stuck cages | 2026-11-01 | 33fd7b4c (PR #59) |
| A-18 | 1-2 on Normal no longer ends at the sealed door (fix-petals) | 2026-11-01 | 7095d3fa (PR #61) |
| A-19 | Audit Build 1 core: Easy or Normal asked on a fresh save (LV-19), the 2-3 goal card leaves (UI-22), gen2 Easy goals (LV-24), respawn sound (SN-13), safe W8-10 starts (WIP-6), iron thorns (WIP-16), Jump help Off by default (CT-35) | 2026-10-31 | 88230e92, 42a43f89, 530e6659, 78c96a3c |
| A-20 | No "coming soon" tag in the store build (UI-20); story text around the edges (ST-5, ST-6) | 2026-10-31 | 8fe153f9, 58890fde |
| A-21 | Pokey's turn, skid, run-start and stop (AN-13) | 2026-10-31 | 243b067f |
| A-22 | The recorded sound effects replace the synthesized set; each guardian's own tell (SN-4) | 2026-10-30 | 3e626838, 177221a5 |
| A-23 | The death beat (AN-1); an even blink (AN-2, AN-3) | 2026-10-30 | 5b8d9e50, 60f61b93 |
| A-24 | Satchel, Journal, finds and Scenes (S-6, S-8) | 2026-11-01 | PR #60 |
| A-25 | Swimming in clean, calm water (6-7's root well) | 2026-10-29 | 87f1e2f6 |
| A-26 | Helper roster (R-8, Matt: "start keeping helpers that do the best job into the mix... the better they do, the more they get used"): reference/HELPERS.md and LEAD-PLAYBOOK 8b | 2026-11-01 | 4da30adf |
| A-27 | Stale doc decisions settled by what shipped: the leaf glide (parachute), the soldiers (drawn; creatureLore.ts:26), the new creatures (capuchin, mantis, crab, piranha, sentry, owl, lizard, beetle), Meeca's stage and creatures both in, the promo video (brief handed to Matt's own agent) | 2026-10-30 | PR #30, PR #58 |
| A-28 | Old roadmap-doc items closed: "8-2 gap/roost lives" (the broken bot's numbers, withdrawn 11-01) | 2026-11-01 | 877a819b |

## Draft numbers retired (sent to the lead in draft 1; never reused)

| Draft | Now |
|---|---|
| R-9..R-17 (rebuild-2 draft parents, never shown) | R-149, R-141..R-148 |
| R-1..R-19 (done) | A-1..A-17 (R-1..R-8 now name Matt's own list, by the lead's order) |
| R-10, R-11, R-12 | R-2.1, R-2.6, R-2.2 |
| R-20, R-21, R-22, R-23 | R-6.1, R-6.4, R-6.5, A-18 |
| R-24, R-25, R-26 | R-10.1, R-10.2, R-3.13 |
| R-30..R-36 | R-1.1, R-1.2, R-1.9, R-1.10, R-1.12, R-1.5, (R-36 dropped: the redesigns were approved 10-30, inv) |
| R-40..R-49 | R-4.1..R-4.14, R-9.3 |
| R-50..R-59 | R-5.8..R-5.21, R-5.3 |
| R-60, R-71..R-78 | R-3.1..R-3.7, R-6.19, R-3.12 |
| R-61..R-70 | R-13.x, R-9.1, R-9.4, R-6.3 |
| R-80..R-86 | R-9.9, R-16.x |
| R-90..R-100 | R-6.6..R-6.18, R-6.25 |
| R-110 | R-14.x |
| R-120..R-125 | R-5.2, R-5.4, R-9.4, R-5.5, R-5.6, R-5.22 |
| R-130..R-140 | R-17.x, R-9.13, A-10 |

## Estimate

See the totals the gate prints (`node tools/roadmapcheck.mjs`) and the estimate in `reference/BUILD-PLAN.md`.
