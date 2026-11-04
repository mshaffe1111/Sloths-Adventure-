# Open-work inventory, 2026-11-01 evening (for the roadmap rebuild)

Written by the lead's inventory reviewer (read-only sweep of origin/main 1dc39cd7, every helper branch, the finish plan, audit 2, the roadmap doc and the story coder hand-off). The lead spot-checked three claims in code (no pixi in package.json; W5 gen2 is only 5-7 and 5-9, w5.ts:130; reference/audit-2/AUDIT-2.txt exists). Sizes: S under half a day, M 1-2 days, L 3+ days. roadmap-keeper turns this into R-numbered items; Matt's own list is R-1 bosses, R-2 W9/W10 stages, R-3 WebGL, R-4 story, R-5 tuning, R-6 bugs.

## Biggest gaps vs the roadmap doc's Nov 1 next-week list
- Audit-2 Builds 2-14 (reference/audit-2/AUDIT-2.txt "Builds in order", about 14 builds, weeks): only Build 1 and parts of Builds 7 and 14 are done; Builds 2-6 and 10-13 have no owner.
- Worlds 1-5 onto gen2 (Matt's plan 10-30): art made, grab bags approved, no helper briefed.
- Bosses 6-10 + Thornbark: no coaching lines, code-drawn lairs; Drake and General redesigns approved but not built.
- Work stranded on branches since 10-30: w5-rebuild (5-6/5-8), hazard-anim, polish-clean, polish-pf1, gen2-ascent.

## Worlds and stages
### World 1
- 1-7 eagle strikes with no bush within 700-990 px (one from off screen) | bot-fix README §6 #2 | S
- 1-8 snake and fall with no tip; a jump at x9085 that 0% survive on Normal | bot-fix §6 #3, audit LV-25 | S | hand-check first
- About 240 px walls in 1-1/1-5/1-6/1-7 the first-timer bot can't climb | LV-22; bot §7 | S-M | Matt plays every Jump-help setting
- 1-1 and 1-5 look alike (0.98) | LV-16 | L (gen2) | gen2-ascent
- Thin code-drawn W1 ledges need painting (P1) | VI-19, Build 5 | M + HF | money
- High basket throws may need aimUp | qa-reports/w2-cages NEXT | S
- 1-9 "Dot explains once per device" (same as the 3-9 ticket) | S
- Second variant of W1's middle strip | hf-backdrops2 NEXT; held | S + about $1 | money hold
### World 2
- 2-9 Easy turtle hit at 3.8 s before Dot's tip (worst unfair spot) | bot §6 #1 | S
- Water lives: 2-5 Easy 5.7/min, 2-8 cage pools 8.2/min | bot §6 #8 | S-M each
- 2-8 reset post 30-44 px from the stones (a tap resets the room) | w2-cages NEXT | S
- 2-4 runs 6.2 min (3x median) | LV-27 | M
- Floating balcony planters, reeds in soil, frond over HUD | D16 | M (grounding test)
- Backdrops 2-1, 2-3, 2-4, 2-6, 2-7 fail the darkness floor | hf-backdrops2 NEXT | S + about $2 | money hold
### World 3
- 3-9 ring wall climbable → 370 + Dot lines | ticket A1aChgkhHtNwhAXZWqHtQk | S
- Normal curve fails its gate in Worlds 3-5 | LV-20 | L | bands re-run first
- 3-6 / 3-7 stage-card wording | story hand-off | S
### World 4
- Rocks hit with no tip (4-1, 4-3, 4-6) | bot §6 #4 | S
- 4-2 jumps 0% survive on Normal | LV-26 | S
- 4-7 under 2 minutes; 8.2 lives/min in pits | LV-27, bot §6 | M
- 4-4 water 7 lives/min | S
- 4-8 backdrop fails the floor | S + HF
- 4-2/4-5 look alike | LV-16 | L (gen2)
- 4-D showpiece rethink | roadmap "Later" | L | Matt
- 35 unused W4 art pieces | artUse.allow.json | M
### World 5
- 5-6 to gen2 / 5-8 hand-built: built on w5-rebuild afd0d02b, never merged (sent back 10-29) | qa-notes/w5/NEXT.md §4-5 | M-L | decide rescue or rebuild
- 5-3 variety 0.295 < 0.35; 5-4 dead time over budget half its plays | w5 NEXT §1 | M
- Lever/plate room from unused w5b kit; re-roll the billowing web | w5 NEXT §6 | M + < $1
- W5 Normal misses its gate by 16 points | LV-20, branch w5-normal-wip | M
- W5 gold (5-1..5-3) and dusk1 backdrops fail the floor | S + about $2
- 5-M: Meeca overlaps room 5 far-wall bank face; gully stairs look alike | 5-M-fix README | S
### World 6
- 6-7 eagle with no bush within 5,000+ px | bot §6 #5 | S
- 6-8 frogs/tayras hit with no tip; 6-9 frog hit at 7 s | bot §6 #6, LV-25 | S
- 6-5 / 6-9 look alike (0.93) | LV-16 | M
### World 7
- Matt hasn't passed World 7 on his phone | finish plan
- 7-4 slide strands both bots; untaught life loss | LV-23, bot §6 #7 | S-M
- 7-9 water 6.2 lives/min; boa + tayra with no safe first meeting | S
- 7-2 / 7-8 climbs on the old generator | WIP-15 | L | gen2-ascent
- Under the Ruins secret level not built (finds.ts:329 note waits) | SECRET-LEVELS.md | L + HF | Matt
### World 8
- Matt hasn't passed it | finish plan
- 8-7 climb on the old generator | WIP-15 | L
- bands.ts reads Easy harder than Normal (measuring bug) | w8 NEXT 3 | S
- 8-1 variety 0.401 < 0.45 | M
- Pre-scaled w8b/c/var sheets if phones stutter | w8 NEXT 4 | S
### World 9 (live on old generator; new on branch w9-pieces d1983eea)
- Clean full-suite re-run, drawcheck, merge w8 rope + W10 piston timing, re-measure, curate once, band fixes | qa-notes/w9/NEXT.md 1-8 | L
- HF stand-ins painted (cap $12, $0.30 spent) | NEXT 6 | S + about $2 | $72 rule
- 13 new Dot lines | GRAB-BAG, DOT-LINES-2026-10-31.md | S | Matt
- 9-2 The Last Trees canopy special stage (approved 10-30; 5 HF pieces; hang-under move) | special-mockups/w9-last-trees | L + about $3
- 9-7 climb; raft-lock room (held for the Drake pass) | WIP-15, NEXT 9 | M-L
### World 10 (live on old generator; new on branch w10-pieces c76b3846)
- Gear art re-cut, 4 gear sections, gate, curate once, more 10-9 pieces, place unused art | qa-notes/w10/NEXT.md | L
- Hold rule ("freeze on the flash") taught in 10-3/10-4; brace/blown poses | WIP-18, CT-39 | L + HF | prototype for Matt first
- 10-8 Clockwork Gate (great-wheel redesign, 3 HF pieces) | special-mockups/w10-clockwork-gate | L + about $2
- 10-2, 10-4, 10-5 climbs | WIP-15 | L
- 10-3 thunder and 10-6 netting don't exist yet | WIP-5 | M
- w10-far strip repaint to 2640 px; does the rain end (w10after)? | WIP-9 | S + $0.5 | Matt
- 10-9 first-timer falls 20+ times | M
### All worlds
- Difficulty tuning per world + checkpoint audit (Matt 10-31) | L | bands
- Re-run all 20 bands with the fixed bot | bot §4 | M
- Punch tip after the first hit in Worlds 5-10 (rule decision) | bot §6 #9 | S
- Narrow-phone camera (< 380 px) | S
- Dot box follow-ups | S
- Worlds 1-4 onto gen2 (~13k lines replaced, 2-3 weeks, plan on branch plan-gen2-w1-4) | LV-28 | L | not on the roadmap

## Bosses
- 1 Venom Fang: built, code lair, 19 unused venom art pieces | S-M
- 2 Crocus Rex: defeat panel is a grey see-through sketch (D17); repaint on HF, then walk all 10 defeat scenes frame by frame | S + pennies
- 3 Prowler: built, code lair | WIP-11 | M
- 4 Sovereign, 5 Queen: painted plates; council-table (lace table for 5-10) not verified
- 6 Reaver, 7 Golem, 8 Monarch: code lairs; no coaching; ALL-CAPS banners; no third phase of their own | WIP-11/12/19, Build 10 | M (2-3 days) | Matt approves coaching lines (DOT-19)
- 6-10 hits during the dark intro bars; bossFair.test covers only 1-10..3-10 | LV-30 | S
- Noisy 6-10 sprite; Reaver weapon mismatch | VI-30, ST-14 | S-M
- 9 Magma Drake: old "thin Drake" live; redesign approved 10-30 (3 phases, ends with a cup); set pieces packed in boss-910.webp, not drawn; 4 poses to re-roll; 8-piece art list written as Gemini prompts must become HF jobs | boss-design-9-10 §4-8 | L (~1 week) + $3-5
- 10 General: old fight live; redesign approved; needs the hold move and a fight-to-finale hand-off with no cut; 8 art pieces | boss-design §5 | L (~1 week) + $3-5
- Thornbark (secret, 7-7): built, code lair, no coaching; story adds one exchange | S-M

## Special stages
- Built: 4-D, 5-M, 6-8, 7-4, 8-4. Open: 4-D rethink, 7-4 stranding, 9-2 canopy, 10-8 Clockwork Gate, Under the Ruins.

## Story
- Rewrite plumbing (before-a-stage slot at 17 stages, WORLD_MID moves, AFTER_BOSS changes, old-save unlocks, 2-box lines, retries as a list, Dot-present ranges, finale chapters) | coder hand-off 2LkTtACE27mNCGsABz84pM | L | one release
- Text swaps across ~10 files | M
- Ledger (10 pages) + Wanted posters (10): Satchel sections, medals, reachability tests | M-L
- Storm candle prop; scripted talks 6-6, 8-7, 9-3, 9-8 | M
- Playable chase, climb, scraping; Meeca's tap-and-freeze | L | later (Matt decision 4)
- ~30 story pictures on HF, each with a stand-in | ~$10-20 | Matt approves each list
- Duplicate story beat "I'm going to get Meeca back." x3 | playerText.known | S

## Art (HF $72 left, ~$15 reserve; order: Croc panel, story, W9/W10)
- Croc panel (pennies), story (~$10-20), W9 (cap $12), W10 (cap $6), 9-2 (~$3), 10-8 (~$2), Drake + General (~$6-10), hold poses (~$1).
- Held: art round 2 (~$62: backdrops ~$34, cutscenes ~$20 incl. boss arena plates $0.40 each, props ~$8).
- 276 unused painted pieces (bosses 70, shared 41, W4 35, W9 17, W3 16, W1 15, story 14, W5 14, W2 13, W7 12, W10 11, creatures 9, W6 8, UI 1) | artUse.allow.json | M-L
- VI-21 bank ends (part done), AN-12 Flicker drawn in play, painted lair upscale (WIP-11) | Build 2 | M + HF

## Performance and GPU
- GPU move stages 0-6: not started (no pixi in package.json) | GPU-RENDERER-PLAN.md | L (3-5 days + phone proofs)
- No iPhone frame-rate number (PF-5); Kelsbob iPhone run never read | S
- 160 MB download; old Android ~16 s to start (PF-7, PF-11) | M-L
- Art size gate rules 2-3 not built | PERFORMANCE-RULES §8.2 | S
- Re-bakes by scale left (pit water, flags, ground chunks) | S
- Branch polish-pf1 not merged (no flat backdrop at start, creature fade-in, PF-1b ground-decor stamps; 22a631f8, 138041ae) | M | check if superseded

## Play Store / APK
- Final app ID, price, payments profile, account type (closed test of 12 testers x 14 days?) | PLAY-STORE.md §4 | Matt
- Signing secrets for the signed .aab | build-apk.yml | S | Matt
- 16 KB page check; foldable, split-screen, resize; older-WebView insets | PLAY-STORE-RULES §1/§4, UI-19 | M
- Store listing: icon, feature graphic, 24 screenshots exist (reference/store, 10-30) but predate new menus/icons; descriptions, category, email open | S-M | Matt approves
- APK smoothness (< 20 fps) | GPU stage 6 | M
- Privacy text, data safety, content rating, audience | S | Matt

## Menus and UI
- clipknown: 44 (G1 map cards x19, G4 Settings taps x6, G8 How to Play sideways x6, G10 About x4, G2 x3, G5 x3, G7 x2, G9 x1) | M
- playerText known: 4 (duplicate Dot lines, "The snail" x10, two medal descriptions alike, story beat x3) | S
- Icons B-E accepted at 6d9a5984, not shipped, already paid; clears 88 vector Icon uses | S | Matt OK to ship
- Calmer win card, faked italic font (UI-18, UI-21) | S

## Sound and music
- Effects 20-40 dB too hot; one short loop per world; ambience never plays on phones; iPhone music fallback; one effect family | audit Build 3 (SN-11/12/14/15/16), finish plan SN-9, X-9 | M-L (3-4 days) | listening session with Matt

## Controls and feel
- Let go of a liana (CT-30), slow-frame touch lag (CT-38), recorder sees the Pad (CT-37), every-setting play test (CT-36), hang/hold design (CT-39) | Build 4 | L
- Charge-and-release mega (CT-31), slanted carry (CT-33), even run speed (CT-32), app-only vibration (AN-14): decided 10-30/31, no implementing commit found | M
- Slide puffs in a row; flip gaps | pokey-anim README | S
- Tilt steering (CT-29) | Phase 5 | M | Matt

## Collectables
- Ledger + Wanted (see Story); Under the Ruins note; garden hub (S-9); replay reasons (LV-18) | L | Matt

## Tools, gates, process debt
- Prop-grounding test (D16), cutscene-frame check (D17), first-timer meets-the-goal gate per touched world (D14), Dot box overlap test (D10/D22) | M
- Bot modes: puzzle, hunter, collector, climb probe, back-up-to-a-step, push | bot §7 | L
- Stale-base guard in every shot tool (D23) | S
- Dead-time and quiet-stretch limits as CI gates | S
- 10-30 branches never merged: hazard-anim (painted deep water W2/W6-10), polish-clean (key spill, 6-8 stilts), polish-clean-sweep-w9-10, polish-edges (11 skies parked), gen2-ascent (not hooked in, no tests) | M to triage

## Decisions waiting on Matt
1. Ship icons B-E. 2. The 45 Dot lines (W1-4, W9, W10). 3. Council story beat. 4. Does W10's rain end? 5. Boss coaching lines (DOT-19). 6. Each HF picture list. 7. Order: W1-4 gen2 vs the rest. 8. Under the Ruins, garden hub, tilt. 9. App ID, price, account type. 10. Release art round 2. 11. 4-D rethink.

## Done but still looks open somewhere (close these)
- Finish plan Phase 2-3 boxes: Dot pointer gone, SFX rebuilt, SN-4 boss tells (dff86fee), AN-1/2/3, LV-3, CT-8, W8 curated, 8-4 built, Satchel S-6, finds S-8, ending cards S-7, 9-10/10-10 plan agreed. Phase 4 "story rewrite is built" refers to the OLD rewrite; its climb list still has 9-2 and 10-8 (now special stages).
- Audit-2 done: LV-19, UI-22, LV-24, SN-13, WIP-6, WIP-16, WIP-17, WIP-20, CT-35, WIP-14, AN-13, PF-4, PF-8.
- Roadmap doc: "8-2 gap/roost lives" (the broken bot, withdrawn); "icons B-E held for money" (already paid); PR #27/#28, motion v2, "Android build fails", the Meeca redo, the swimming stage.
- W8 NEXT item 1 (1-2 sealed door) fixed in 0.9.3.
- STATUS "Open decisions for Matt" (~line 466) all decided.
- PLAY-STORE.md 5.4-5.6 "FAIL": drafts exist in reference/store.
- Stale docs: TRACKER.md (10-29), HANDOFF.md (10-25).

## Not fully read
- Audit-2 doc read from reference/audit-2/AUDIT-2.txt (summary, Worlds 7-10, builds), not all 131 KB. The story feedback doc, 3-9 ticket and act scripts were taken from STATUS summaries. Matt's memory file not accessible. The game was not run.
